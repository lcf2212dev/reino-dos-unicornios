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

// emoji de matéria sem desenho em js/arte/icones/ aparece como emoji reduzido (feio): desenhar antes de publicar
{
  const ic = icones;
  const RE = /(\p{RI}\p{RI}|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*)/gu;
  const semDesenho = new Set();
  // com --so, só os arquivos daquela matéria (js/conteudo/materias/<id>/) ou prova (js/conteudo/provas/<id>.js)
  const daVez = (s) => !SO || s.js.split('/').includes(SO) || s.js.endsWith('/' + SO + '.js');
  const arquivos = materias.filter(daVez).map((s) => trocar[Jogo.nome(s)] || Jogo.caminho(s.js))
    .concat(provas.filter(daVez).map((s) => Jogo.caminho(s.js)))
    .concat(SO ? [] : ['atividades/provas', 'sistemas/falas'].map(Jogo.arquivo))
    .concat(SO ? [] : Jogo.manifesto.scripts.filter((s) => s.grupo === 'ui').map((s) => Jogo.caminho(s.js)));
  arquivos.forEach((f) => {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(RE)) {
      const k = m[0].replace(/\uFE0F/g, '');
      if (!ic.window.ICONES[k]) semDesenho.add(k);
    }
  });
  if (semDesenho.size) avisos.push(`emojis sem pixel art em js/arte/icones/: ${[...semDesenho].join(' ')}`);
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
