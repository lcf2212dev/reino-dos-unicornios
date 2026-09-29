// Confere o conteúdo das matérias antes de publicar.
// Uso: node ferramentas/validar/validar-conteudo.js [--materia <arquivo>] [--so <id>] [--detalhes]
//   --so <id>    só aquela matéria ou prova (ids repetidos só são conferidos dentro dela)
//   --detalhes   também a linha "✔ <matéria/prova> …" de cada uma (sem ele: só erros, avisos e o resumo)
const fs = require('fs');
const path = require('path');
const Jogo = require('../jogo-no-node');
const Preencher = require('./preencher');

const ctx = Jogo.contexto({ console });
// --materia <arquivo>: usa esse arquivo no lugar do arquivo de mesmo nome em js/conteudo/materias/: a matéria
// (portugues.js; um arquivo com a matéria inteira, salas dentro, também serve) ou uma sala (p3.js). livro.js
// existe em toda matéria: vale a pasta de cima (ex.: /tmp/x/portugues/livro.js).
const iSo = process.argv.indexOf('--so');
const SO = iSo >= 0 ? process.argv[iSo + 1] : null;
const DETALHES = process.argv.includes('--detalhes');
const iMateria = process.argv.indexOf('--materia');
const materiaFora = iMateria >= 0 ? path.resolve(process.argv[iMateria + 1]) : null;
const materias = Jogo.scripts({ grupos: ['materias'] });
const provas = Jogo.scripts({ grupos: ['provas'] });
const trocar = {};
if (materiaFora) {
  let alvos = materias.filter((s) => path.basename(materiaFora) === path.basename(s.js));
  if (alvos.length > 1) alvos = alvos.filter((s) => path.basename(path.dirname(materiaFora)) === path.basename(path.dirname(s.js)));
  if (alvos.length !== 1) { console.log('✘ --materia: ' + (alvos.length ? 'mais de um' : 'nenhum') + ' arquivo de js/conteudo/materias/ com esse nome (livro.js: ponha na pasta da matéria)'); process.exit(1); }
  trocar[Jogo.nome(alvos[0])] = materiaFora;
}
// tipos de desafio antes do conteúdo (Reino.registrarTipoDesafio): o núcleo e cada js/atividades/desafios/<tipo>.js,
// com as checagens do tipo (assim um arquivo trocado por --materia também pode registrar um tipo)
Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos'], grupos: ['atividades'] }));
Jogo.carregar(ctx, Jogo.scripts({ grupos: ['materias', 'provas'] }), { trocar });

const Reino = ctx.Reino;
const erros = [];
const avisos = [];
const ids = new Set();
const TIPOS = Reino.tiposDesafio;
// campos que só alguns tipos aceitam (def.campos), ex.: livre, colado, rotulos
const CAMPOS_DE_TIPO = [...new Set(Object.keys(TIPOS).flatMap((t) => TIPOS[t].campos || []))];
const MATERIAS = SO ? Reino.materias.filter((m) => m.id === SO) : Reino.materias;
const PROVAS = SO ? Reino.provas.filter((p) => p.id === SO) : Reino.provas;
if (SO && !MATERIAS.length && !PROVAS.length) erros.push(`--so ${SO}: nenhuma matéria nem prova com esse id (${Reino.materias.concat(Reino.provas).map((x) => x.id).join(', ')})`);
const detalhe = (l) => { if (DETALHES) console.log(l); };
const tipoDe = (d) => (Object.prototype.hasOwnProperty.call(TIPOS, d.tipo) ? TIPOS[d.tipo] : null);

function checar(cond, msg) { if (!cond) erros.push(msg); }
// trechos em inglês: «...» balanceado e sem aninhar, em qualquer texto
function checarIngles(obj, onde) {
  if (typeof obj === 'string') {
    let aberto = false;
    for (const ch of obj) {
      if (ch === '«') { if (aberto) { erros.push(`${onde}: «» aninhado em "${obj}"`); return; } aberto = true; }
      else if (ch === '»') { if (!aberto) { erros.push(`${onde}: » sem « em "${obj}"`); return; } aberto = false; }
    }
    if (aberto) erros.push(`${onde}: « sem » em "${obj}"`);
    if (/«\s*»/.test(obj)) erros.push(`${onde}: «» vazio em "${obj}"`);
  } else if (Array.isArray(obj)) obj.forEach((v) => checarIngles(v, onde));
  else if (obj && typeof obj === 'object') Object.keys(obj).forEach((k) => checarIngles(obj[k], obj.id ? obj.id : onde));
}
// desenhos de js/arte/icones/*.js (figuras do completar) e os que os prédios e módulos registram com
// Reino.registrarIcones (ex.: interiores/<p>/): carregam todos os `node: true` (o jogo como no navegador)
const icones = Jogo.carregar(Jogo.contexto({ console, Math, Date }), Jogo.ordemDosPredios(Jogo.scripts()));
const textoOk = (t) => typeof t === 'string' && t.trim().length > 0;

// campos comuns (apoio, instrucao), campos que só alguns tipos aceitam (def.campos: livre, colado, rotulos) e as
// checagens do próprio tipo (def.validar(d, v), no arquivo do tipo). naProva: a def pode ser mais ou menos exigente.
function checarNovos(d, naProva) {
  if (d.apoio !== undefined) {
    const a = d.apoio;
    checar(a && textoOk(a.titulo), `${d.id}: apoio sem título`);
    checar(a && Array.isArray(a.partes) && a.partes.length > 0, `${d.id}: apoio sem partes`);
    ((a && a.partes) || []).forEach((p, i) => {
      const lista = Array.isArray(p.lista) && p.lista.length > 0 && p.lista.every(textoOk);
      checar(p && (lista || textoOk(p.texto)) && (p.lista === undefined || lista) && (p.texto === undefined || textoOk(p.texto)) && (p.titulo === undefined || textoOk(p.titulo)),
        `${d.id}: parte ${i + 1} do apoio precisa de lista (textos) ou texto`);
    });
  }
  // o mesmo ícone em todas as opções não ajuda a escolher: melhor sem ícone
  if (Array.isArray(d.opcoes) && d.opcoes.length > 1 && d.opcoes.every((o) => o && o.e && o.e === d.opcoes[0].e))
    avisos.push(`${d.id}: o mesmo ícone ${d.opcoes[0].e} em todas as opções (tire o "e")`);
  if (d.instrucao !== undefined) checar(textoOk(d.instrucao), `${d.id}: "instrucao" precisa ser um texto não vazio`);
  const def = tipoDe(d);
  CAMPOS_DE_TIPO.forEach((c) => {
    if (d[c] === undefined) return;
    const aceitam = Object.keys(TIPOS).filter((t) => (TIPOS[t].campos || []).includes(c));
    checar(def && (def.campos || []).includes(c), `${d.id}: "${c}" só vale em ${aceitam.join('/')}`);
  });
  if (def && def.validar) def.validar(d, { checar, avisar: (msg) => avisos.push(msg), naProva, icones: icones.window.ICONES, textoOk });
}

MATERIAS.forEach((m) => {
  checarIngles(m, m.id);
  Preencher.faltas(m, m.id).forEach((e) => erros.push(e));   // esqueleto do `npm run novo` ainda por escrever
  const livro = new Set((m.livro || []).map((l) => l.id));
  checar(m.salas && m.salas.length > 0, `${m.id}: sem salas`);
  // cada sala vale um valor redondo e a sobra é bônus ao completar (progresso-regras.js): a soma fecha sempre
  const P = icones.Reino.Progresso, valorSala = P.valorSala(m), bonus = P.bonusMateria(m);   // o jogo inteiro (linha do `icones`)
  const soma = Math.round((valorSala * m.salas.length + bonus) * 100) / 100;
  checar(soma === Reino.config.valorPorMateria, `${m.id}: salas + bônus somam R$${soma}, esperado R$${Reino.config.valorPorMateria}`);
  checar(Math.round(valorSala * 100) % 50 === 0 && bonus >= 0, `${m.id}: valor por sala (${valorSala}) tem de ser de R$ 0,50 em R$ 0,50 e o bônus (${bonus}) não pode ser negativo`);

  m.salas.forEach((s) => {
    checar(s.desafios.length >= Reino.config.desafiosPorSala, `${s.id}: só ${s.desafios.length} desafios (mínimo ${Reino.config.desafiosPorSala})`);
    s.desafios.forEach((d) => {
      checar(!ids.has(d.id), `ID repetido: ${d.id}`);
      ids.add(d.id);
      checar(tipoDe(d), `${d.id}: tipo desconhecido ${d.tipo}`);
      checar(typeof d.explica === 'string' && d.explica.length > 10, `${d.id}: sem explicação`);
      checar(livro.has(d.livro), `${d.id}: cartão do livro "${d.livro}" não existe`);
      checarNovos(d, false);
    });
    const unis = m.unicornios || [];
    checar(unis.filter((u) => u.raridade === 'comum' && u.sala === s.id).length === 1, `${s.id}: precisa de 1 unicórnio comum`);
    checar(unis.filter((u) => u.raridade === 'raro' && u.sala === s.id).length === 1, `${s.id}: precisa de 1 unicórnio raro`);
  });
  const unis = m.unicornios || [];
  checar(unis.filter((u) => u.raridade === 'lendario').length === 1, `${m.id}: precisa de exatamente 1 lendário`);
  checar(unis.some((u) => u.raridade === 'epico' && u.treino === 'ouro'), `${m.id}: falta épico do ouro`);
  checar(unis.some((u) => u.raridade === 'epico' && u.treino === 'perfeito'), `${m.id}: falta épico do treino perfeito`);
  unis.forEach((u) => {
    checar(!ids.has(u.id), `ID repetido: ${u.id}`);
    ids.add(u.id);
    checar(u.cores && u.cores.corpo && Array.isArray(u.cores.crina), `${u.id}: cores incompletas`);
    checar(u.frase, `${u.id}: sem frase`);
    // só nasce o que o jogo dá: comum/raro de uma sala desta matéria, épico do treino ouro/perfeito, o lendário
    checar(['comum', 'raro', 'epico', 'lendario'].includes(u.raridade), `${u.id}: raridade desconhecida "${u.raridade}" (comum, raro, epico ou lendario)`);
    if (u.raridade === 'comum' || u.raridade === 'raro') checar(m.salas.some((s) => s.id === u.sala), `${u.id}: sala "${u.sala}" não existe em ${m.id} (o unicórnio nunca nasce)`);
    if (u.raridade === 'epico') checar(['ouro', 'perfeito'].includes(u.treino), `${u.id}: treino "${u.treino}" desconhecido (ouro ou perfeito)`);
  });
  const treinaveis = m.salas.flatMap((s) => s.desafios).filter((d) => Reino.Desafios.TREINAVEIS.includes(d.tipo) && !d.livre).length;
  checar(treinaveis >= Reino.config.perguntasTreino, `${m.id}: só ${treinaveis} perguntas para o treino`);
  detalhe(`✔ ${m.nome}: ${m.salas.length} salas, ${m.salas.reduce((t, s) => t + s.desafios.length, 0)} desafios, ${treinaveis} para o treino, ${(m.livro || []).length} cartões no livro, ${unis.length} unicórnios, R$${valorSala.toFixed(2)} por sala`);
});

// acessório com desenho e ícone no próprio arquivo da prova (conteudo.md §5)
const ANCORAS = ['orelha', 'cabeca', 'olho', 'chifre', 'pescoco', 'cauda'];
function checarLinhas(linhas, paleta, larg, alt, onde) {
  if (!checarRet(Array.isArray(linhas) && linhas.length > 0 && (!alt || linhas.length === alt), `${onde}: linhas faltando${alt ? ` (precisa de ${alt})` : ''}`)) return;
  const w = larg || String(linhas[0]).length;
  checar(linhas.every((l) => typeof l === 'string' && l.length === w), `${onde}: linhas de tamanhos diferentes (todas com ${w})`);
  const falta = new Set();
  linhas.join('').split('').forEach((c) => { if (c !== '.' && !(paleta && paleta[c])) falta.add(c); });
  checar(!falta.size, `${onde}: letras sem cor na paleta: ${[...falta].join(' ')}`);
}
function checarRet(cond, msg) { checar(cond, msg); return cond; }
function checarDesenhoInline(d, id) {
  checar(d.paleta && typeof d.paleta === 'object', `${id}: desenho sem paleta`);
  checarLinhas(d.linhas, d.paleta, 0, 0, `${id} (desenho)`);
  checar(ANCORAS.includes(d.ancora), `${id}: âncora do desenho inválida "${d.ancora}" (${ANCORAS.join(', ')})`);
  checar(Number.isInteger(d.dx) && Number.isInteger(d.dy), `${id}: desenho sem dx/dy inteiros`);
}
// o mesmo formato que Reino.registrarIcones confere no jogo (js/arte/icones/icones.js)
function checarIconeInline(ic, id) {
  icones.Reino.conferirIcone(ic).forEach((e) => erros.push(`${id} (ícone): ${e}`));
}

// provas bimestrais (Escola do Reino)
const pixelart = fs.readFileSync(Jogo.arquivo('arte/pixelart-unicornio-moldes'), 'utf8');
PROVAS.forEach((pv) => {
  const m = Reino.materia(pv.materiaId);
  checar(m, `${pv.id}: matéria ${pv.materiaId} não existe`);
  const livro = new Set(((m && m.livro) || []).map((l) => l.id));
  ['lendario', 'raro', 'comum'].forEach((r) => {
    const a = pv.acessorios && pv.acessorios[r];
    checar(a && a.id && a.nome, `${pv.id}: falta acessório ${r}`);
    if (!a) return;
    checar(!ids.has(a.id), `ID repetido: ${a.id}`);
    ids.add(a.id);
    if (a.icone) checarIconeInline(a.icone, a.id);
    else checar(icones.window.ICONES['acessorio:' + a.id], `${a.id}: falta o ícone "acessorio:${a.id}" em js/arte/icones/ (ou icone no acessório)`);
    if (a.desenho) checarDesenhoInline(a.desenho, a.id);
    else checar(pixelart.includes(`'${a.id}':`), `${a.id}: falta o desenho no unicórnio (ENFEITES em js/arte/pixelart-unicornio-moldes.js, ou desenho no acessório)`);
  });
  checarIngles(pv, pv.id);
  Preencher.faltas(pv, pv.id).forEach((e) => erros.push(e));
  pv.questoes.forEach((d) => {
    checarNovos(d, true);
    checar(!ids.has(d.id), `ID repetido: ${d.id}`);
    ids.add(d.id);
    checar(tipoDe(d), `${d.id}: tipo desconhecido ${d.tipo}`);
    checar(typeof d.explica === 'string' && d.explica.length > 10, `${d.id}: sem explicação`);
    checar(livro.has(d.livro), `${d.id}: cartão do livro "${d.livro}" não existe`);
  });
  detalhe(`✔ ${pv.nome} (${pv.bimestre}): ${pv.questoes.length} questões, acessórios ${pv.acessorios.lendario.nome} / ${pv.acessorios.raro.nome} / ${pv.acessorios.comum.nome}`);
});

// emoji sem desenho em js/arte/icones/ (ou Reino.registrarIcones) aparece como emoji reduzido (feio): é erro.
// Confere todo js/**/*.js (fora js/voz/) e css/*.css, sem os comentários; com --so, só a matéria ou prova.
// --emojis-extra <arquivo>: confere também esse arquivo (o teste de unidade planta um)
{
  const ic = icones;
  const RE = /(\p{RI}\p{RI}|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*|[0-9#*]\uFE0F?\u20E3)/gu;
  const semDesenho = new Map();   // emoji → arquivos
  // com --so, só os arquivos daquela matéria (js/conteudo/materias/<id>/) ou prova (js/conteudo/provas/<id>.js)
  const daVez = (s) => !SO || s.js.split('/').includes(SO) || s.js.endsWith('/' + SO + '.js');
  const todos = (pasta, ext) => (fs.existsSync(pasta) ? fs.readdirSync(pasta, { recursive: true }) : []).filter((f) => f.endsWith(ext)).map((f) => path.join(pasta, f));
  const raizJs = path.join(Jogo.raiz, 'js'), voz = path.join(raizJs, 'voz') + path.sep;
  const trocado = (f) => { const s = materias.find((x) => Jogo.caminho(x.js) === f); return (s && trocar[Jogo.nome(s)]) || f; };
  const arquivos = SO
    ? materias.filter(daVez).map((s) => trocar[Jogo.nome(s)] || Jogo.caminho(s.js)).concat(provas.filter(daVez).map((s) => Jogo.caminho(s.js)))
    : todos(raizJs, '.js').filter((f) => !f.startsWith(voz)).map(trocado).concat(todos(path.join(Jogo.raiz, 'css'), '.css'));
  const iExtra = process.argv.indexOf('--emojis-extra');
  if (iExtra >= 0) arquivos.push(path.resolve(process.argv[iExtra + 1]));
  // tira /* */ e // de fim de linha (fora de "http://", ':' antes) sem mexer no resto
  const semComentarios = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
  // desenho registrado dentro de uma tela (Reino.registrarIcones numa função que o node não roda): '<emoji>': { n:
  const textos = arquivos.map((f) => [f, semComentarios(fs.readFileSync(f, 'utf8'))]);
  const registrados = new Set(textos.flatMap(([, t]) => [...t.matchAll(/['"]([^'"\n]{1,12})['"]\s*:\s*\{\s*n\s*:/g)].map((m) => m[1].replace(/\uFE0F/g, ''))));
  textos.forEach(([f, t]) => {
    for (const m of t.matchAll(RE)) {
      const k = m[0].replace(/\uFE0F/g, '');
      if (ic.window.ICONES[k] || registrados.has(k)) continue;
      if (!semDesenho.has(k)) semDesenho.set(k, new Set());
      semDesenho.get(k).add(path.relative(Jogo.raiz, f));
    }
  });
  semDesenho.forEach((onde, k) => erros.push(`emoji ${k} sem pixel art em js/arte/icones/ (em ${[...onde].join(', ')})`));
}
// texto do conteúdo só com caracteres da Press Start 2P (css/press-start-2p.woff2, glifos lidos do cmap) ou com
// desenho em ICONES (emoji ou símbolo, ex.: ✓): fora disso o navegador cai na fonte do sistema (fino, sem pixel)
function glifosDaFonte(arq) {
  const b = fs.readFileSync(arq), KN = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep'];
  let p = 48;
  const b128 = () => { let v = 0; for (let i = 0; i < 5; i++) { const c = b[p++]; v = v * 128 + (c & 0x7f); if (!(c & 0x80)) return v; } return v; };
  const tabelas = [];
  for (let i = 0, n = b.readUInt16BE(12); i < n; i++) {   // diretório do WOFF2: tag, tamanho e (se transformada) tamanho novo
    const f = b[p++], tag = (f & 63) === 63 ? b.toString('latin1', p, (p += 4)) : KN[f & 63], tr = (f >> 6) & 3;
    let tam = b128();
    if ((tag === 'glyf' || tag === 'loca') ? tr === 0 : tr !== 0) tam = b128();
    tabelas.push({ tag, tam });
  }
  const dados = require('zlib').brotliDecompressSync(b.subarray(p, p + b.readUInt32BE(20)));
  let o = 0, cm = null;
  tabelas.forEach((t) => { if (t.tag === 'cmap') cm = dados.subarray(o, o + t.tam); o += t.tam; });
  const s = new Set();
  for (let i = 0, n = cm.readUInt16BE(2); i < n; i++) {
    const off = cm.readUInt32BE(8 + i * 8), fmt = cm.readUInt16BE(off);
    if (fmt === 4) {
      const seg = cm.readUInt16BE(off + 6) / 2;
      for (let k = 0; k < seg; k++) for (let c = cm.readUInt16BE(off + 16 + seg * 2 + k * 2), fim = cm.readUInt16BE(off + 14 + k * 2); c <= fim && c < 0xffff; c++) s.add(c);
    } else if (fmt === 12) {
      for (let k = 0, g = cm.readUInt32BE(off + 12); k < g; k++) for (let c = cm.readUInt32BE(off + 16 + k * 12), fim = cm.readUInt32BE(off + 20 + k * 12); c <= fim; c++) s.add(c);
    }
  }
  return s;
}
// strings literais ('…', "…", `…` sem as partes ${…}) de um arquivo JS, com os \uXXXX lidos; comentários ficam de fora
function stringsDoCodigo(src) {
  const out = [];
  const esc = (t) => t.replace(/\\u\{([0-9a-f]+)\}|\\u([0-9a-f]{4})|\\(.)/gi, (m, a, b, c) => (a || b ? String.fromCodePoint(parseInt(a || b, 16)) : c === 'n' ? '\n' : c));
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) break; continue; }
    if (ch === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2); if (i < 0) break; i++; continue; }
    if (ch !== "'" && ch !== '"' && ch !== '`') continue;
    let j = i + 1, t = '';
    while (j < src.length && src[j] !== ch) {
      if (src[j] === '\\') { t += src[j] + src[j + 1]; j += 2; continue; }
      if (ch !== '`' && src[j] === '\n') break;   // não era string (ex.: aspa dentro de regex)
      if (ch === '`' && src[j] === '$' && src[j + 1] === '{') { let n = 1; j += 2; while (j < src.length && n) { if (src[j] === '{') n++; else if (src[j] === '}') n--; j++; } t += ' '; continue; }
      t += src[j++];
    }
    out.push(esc(t));
    i = j;
  }
  return out;
}
const arqFonte = path.join(Jogo.raiz, 'css', 'press-start-2p.woff2');   // a cópia do jogo de um teste pode vir sem css/
if (!fs.existsSync(arqFonte)) avisos.push('sem css/press-start-2p.woff2: caracteres fora da fonte não conferidos');
else {
  const FONTE = glifosDaFonte(arqFonte);
  const ICS = icones.window.ICONES;
  const RE_EMOJI = /(\p{RI}\p{RI}|\p{Extended_Pictographic}(?:️|︎)?(?:‍\p{Extended_Pictographic}(?:️|︎)?)*|[0-9#*]️?⃣)/gu;
  const fora = new Map();   // caractere → onde
  const olhar = (v, onde) => {
    if (typeof v === 'string') {
      for (const ch of v.replace(RE_EMOJI, '')) {   // emoji: a checagem de desenho é a de baixo
        const c = ch.codePointAt(0);
        if (FONTE.has(c) || ICS[ch] || ch === '\n' || ch === '️' || ch === '‍') continue;
        if (!fora.has(ch)) fora.set(ch, new Set());
        fora.get(ch).add(onde);
      }
    } else if (Array.isArray(v)) v.forEach((x) => olhar(x, onde));
    else if (v && typeof v === 'object') Object.keys(v).forEach((k) => olhar(v[k], v.id || onde));
  };
  MATERIAS.forEach((m) => olhar(m, m.id));
  PROVAS.forEach((pv) => olhar(pv, pv.id));
  // textos fixos da interface (js/ui/*.js): as strings do código, sem os comentários (O-14: o "−" do chip da Aura)
  if (!SO) {
    const pastaUi = path.join(Jogo.raiz, 'js', 'ui');
    (fs.existsSync(pastaUi) ? fs.readdirSync(pastaUi).filter((f) => f.endsWith('.js')).sort() : []).forEach((f) => {
      stringsDoCodigo(fs.readFileSync(path.join(pastaUi, f), 'utf8')).forEach((s) => olhar(s, 'js/ui/' + f));
    });
  }
  // já na fila de um item do TODO-VISUAL.md: aviso até o item sair (o validador acusa o caractere em qualquer outro lugar)
  const CONHECIDOS = { 'js/ui/pais.js ●': 'D8B-16 (o visor do PIN vira casas desenhadas)' };
  Object.keys(CONHECIDOS).forEach((k) => {
    const [onde, ch] = k.split(' ');
    if (!fora.has(ch) || !fora.get(ch).has(onde)) { avisos.push(`exceção de caractere sem uso (${k}): tire-a de CONHECIDOS em validar-conteudo.js`); return; }
    fora.get(ch).delete(onde);
    avisos.push(`caractere "${ch}" fora da fonte em ${onde}: conhecido, ${CONHECIDOS[k]}`);
    if (!fora.get(ch).size) fora.delete(ch);
  });
  fora.forEach((onde, ch) => erros.push(`caractere "${ch}" (U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}) fora da fonte e sem desenho (em ${[...onde].join(', ')}): troque por um da fonte`));
}
// falas dos módulos (sistemas: Reino.registrarModulo) com `(preencher)`: carregam com todos os `node: true`
if (!SO) {
  const todos = icones;
  (todos.Reino.modulos || []).forEach((m) => {
    let f = [];
    try { f = m.falas ? m.falas() : []; } catch (e) { erros.push(`módulo ${m.id}: falas() falhou: ${e.message}`); }
    Preencher.faltas(f, `falas do módulo ${m.id}`).forEach((e) => erros.push(e));
  });
}
avisos.forEach((a) => console.log('⚠ ' + a));
// a última linha é o resumo (o validar-tudo mostra a última)
const conta = `${MATERIAS.length} matéria(s), ${PROVAS.length} prova(s), ${avisos.length} aviso(s)`;
if (erros.length) {
  erros.forEach((e) => console.log('✘ ' + e));
  console.log(`Resumo: ${erros.length} erro(s) — ${conta}`);
  // exitCode, não exit(): com a saída num pipe, exit() cortaria a lista (o esqueleto do npm run novo tem centenas)
  process.exitCode = 1;
} else console.log(`Tudo certo! ${conta}${DETALHES ? '' : ' (uma linha por matéria/prova: --detalhes)'}`);
