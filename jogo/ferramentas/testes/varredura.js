// `npm run varredura`: varre o LAYOUT de todas as questões das salas de livro (4º bimestre) na tela real, nos 3
// tamanhos, no servidor de TESTE com save SINTÉTICO. Joga cada sala do começo ao fim (as cartas e os desafios, na
// ordem do livro) e abre cada pergunta sozinha ("Hora da pergunta!", com o "Leia antes"); em cada tela mede a
// geometria (varredura-pagina.js) e fotografa. Nada de conteúdo: só o que quebra na tela.
// Uso: node jogo/ferramentas/testes/varredura.js [opções]   (npm run varredura -- [opções])
//   --materias a,b        só essas matérias (padrão: todas as do 4º bimestre)
//   --salas '<regex>'     só as salas cujo id casa (ex.: '^ma11')
//   --tamanhos celular,tablet,notebook   (padrão: os 3)
//   --modos sala,sozinha  sala = a missão (carta, em branco, errada, certa posta, retorno); sozinha = a pergunta
//                         do Bosque (em branco e retorno); padrão: os dois
//   --paralelo 6          navegadores ao mesmo tempo (cada um ocupa uma vaga de Chromium)
//   --sem-fotos           só mede
//   --ajustes '<json>'    ajustes do save sintético (ex.: '{"texto":1.15}' = Ajustes → Letras grandes)
//   --nome <n>            pasta de saída (padrão: data e hora)      --raiz <pasta jogo>   outra cópia do jogo
// Saída em /tmp/reino-testes/varredura/<nome>/: relatorio.md (defeitos por questão), relatorio.json (tudo) e
// fotos/<tamanho>/<modo>/<id>-<estado>[-N].jpg (N = tela comprida, rolada). Sai com 1 se houver defeito grave.
// O /tmp é RAM: uma rodada inteira com fotos ocupa uns 1,5 GB. Com menos de 4 GB livres ela recusa (use --sem-fotos
// ou apague as rodadas antigas pelo caminho escrito por extenso).
// Estados: carta · branco · quase (errou) · certa (resposta posta, antes de conferir) · retorno (acertou).
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('./cenario');
const { lancar, TAMANHOS } = require('./navegador');
const { PASTA_TESTES } = require('./guardas');
const { medir, rolarFotos } = require('./varredura-pagina');
const Q = require('./unidade/ajudantes/quarto-bimestre');

// grave = quebra que a criança vê; aviso = vale olhar a foto; nota = só registro (não aparece no relatório.md)
const TIPOS = {
  'sem-tela': 'grave', vaza: 'grave', cortado: 'grave', 'vaza-baixo': 'grave', 'cortado-baixo': 'grave', 'fora-da-tela': 'grave',
  'palavra-partida': 'grave', sobreposto: 'grave', coberto: 'grave', inalcancavel: 'grave', 'fim-coberto': 'grave',
  'resposta-nao-cabe': 'grave', 'texto-cru': 'grave', 'imagem-vazia': 'grave', 'acento-deslocado': 'grave', 'figura-faltando': 'grave', 'letra-desigual': 'grave', falha: 'grave',
  'rola-de-lado': 'aviso', 'rola-dentro': 'aviso', 'emoji-texto': 'aviso', 'texto-esmagado': 'aviso', 'letra-pequena': 'nota', 'alvo-pequeno': 'nota',
};
// o que é de propósito (regex sobre "tipo onde det"); cada linha com o porquê
const DE_PROPOSITO = [
  /^rola-dentro .*bosque-carta/,   // o "Leia antes" da pergunta sozinha rola dentro da própria caixa (ui-bosque.css: max-height 34vh)
  /^rola-dentro .*apoio-corpo/,    // o texto de apoio rola dentro da caixa dele, para a pergunta ficar à vista (ui-desafios.css)
  /^rola-de-lado .*desafio-ilustracao-rola/,   // ilustração larga rola de lado, com a borda que avisa (desafios/figuras.js)
  /^palavra-partida .*bloco-fonte.* "\S*https?:/,   // o endereço da fonte de uma carta não tem sílaba onde quebrar
  /^vaza .*span\.en passa [1-4]px /,   // o fundo e o pontilhado do «inglês» passam uns px da última letra, para dentro do recuo da caixa: nada é cortado
];

const MISSAO = '.tela-missao', SOZINHA = '.tela-bosque-pergunta';
const CARTAO = { sala: Q.DESAFIO, sozinha: `${SOZINHA} .bosque-area .desafio` };

function lerArgs(argv) {
  const a = { tamanhos: Object.keys(TAMANHOS), modos: ['sala', 'sozinha'], paralelo: 6, fotos: true };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = () => { const x = argv[++i]; if (x === undefined || x.startsWith('--')) throw new Error(`${k} precisa de um valor`); return x; };
    if (k === '--materias') a.materias = v().split(',');
    else if (k === '--salas') a.salas = new RegExp(v());
    else if (k === '--tamanhos') a.tamanhos = v().split(',');
    else if (k === '--modos') a.modos = v().split(',');
    else if (k === '--paralelo') a.paralelo = Math.max(1, Number(v()) || 1);
    else if (k === '--sem-fotos') a.fotos = false;
    else if (k === '--ajustes') a.ajustes = JSON.parse(v());
    else if (k === '--nome') a.nome = v();
    else if (k === '--raiz') a.raiz = v();
    else throw new Error(`opção desconhecida: ${k} (veja --ajuda)`);
  }
  a.tamanhos.forEach((t) => { if (!TAMANHOS[t]) throw new Error(`tamanho "${t}" não existe`); });
  a.modos.forEach((m) => { if (!CARTAO[m]) throw new Error(`modo "${m}" não existe (sala, sozinha)`); });
  return a;
}

/* ---------- na página ---------- */
// as salas de livro de cada matéria do bimestre, com as cartas na ordem em que a missão mostra e as perguntas que
// saem sozinhas (o filtro do sorteio do Bosque, sistemas/bosque.js)
function catalogo() {
  var fora = (Reino.config.fantasmas && Reino.config.fantasmas.perguntaForaTipos) || [];
  return Reino.materias.filter(function (m) { return m.bimestre === 4 && !m.arquivada; }).map(function (m) {
    return { id: m.id, nome: m.nome, salas: m.salas.filter(function (s) { return s.ordem === 'livro'; }).map(function (s) {
      var et = Reino.etapasDaSala(m, s) || [];
      return { id: s.id, cartas: [].concat.apply([], et.map(function (e) { return e.cartas; })),
        desafios: s.desafios.map(function (d) { return { id: d.id, tipo: d.tipo,
          sozinha: !!(Reino.tiposDesafio[d.tipo] && Reino.avulsa(d) && fora.indexOf(d.tipo) < 0 && !d.livre && !(d.tipo === 'escrever' && !(d.chaves && d.chaves.length))) }; }) };
    }) };
  });
}
// anota o desafio que a tela montou por último (na missão e no painel) para o ajudante responder nele
function preparar() {
  if (window.__q) return;
  var D = Reino.Desafios, render = D.render, q = window.__q = { atual: null, erros: [], avisosResize: 0, render: render };
  window.addEventListener('error', function (e) { if (!/ResizeObserver loop/.test(e.message)) q.erros.push((q.atual ? q.atual.d.id + ': ' : '') + e.message); });
  // figura sem desenho: _d.figuraIcone (desafios/figuras.js) devolve ❓ no lugar; conta cada uma que a tela pedir
  // (o ❓ que o conteúdo escolheu como emoji de uma carta não passa por ali)
  var _d = Reino._desafios, figuraIcone = _d.figuraIcone;
  q.semFigura = 0;
  _d.figuraIcone = function () { var r = figuraIcone.apply(_d, arguments); if (r === '❓') q.semFigura++; return r; };
  D.render = function (d, opts) {
    var c = render.call(D, d, opts);
    if (opts && (opts.modo === 'missao' || opts.modo === 'prova') && opts.onMudar) q.atual = { d: d, ctrl: c };
    return c;
  };
}
// cruzadinha e caça-palavras: a resposta certa pela tela (o ajudante das outras não conhece esses dois tipos)
function porCertaEspecial(sel) {
  var d = window.__q.atual.d, raiz = document.querySelector(sel);
  if (d.tipo === 'cruzadinha') {
    var w = 0, letra = {};
    d.palavras.forEach(function (p) { Array.from(p.resposta).forEach(function (ch, k) {
      var x = p.x + (p.dir === 'h' ? k : 0), y = p.y + (p.dir === 'v' ? k : 0);
      letra[x + ',' + y] = ch; w = Math.max(w, x + 1);
    }); });
    Array.prototype.forEach.call(raiz.querySelector('.cruz-grade').children, function (casa, n) {
      var campo = casa.querySelector('.cruz-campo');
      if (!campo) return;
      campo.value = letra[(n % w) + ',' + Math.floor(n / w)];
      campo.dispatchEvent(new Event('input', { bubbles: true }));
    });
    return true;
  }
  if (d.tipo === 'cacaPalavras') {
    var L = d.grade.map(function (l) { return Array.from(l); });
    var tocar = function (x, y) { raiz.querySelector('.caca-letra[data-x="' + x + '"][data-y="' + y + '"]').click(); };
    d.palavras.forEach(function (p) {
      var ls = Array.from(p), achou = false;
      for (var y = 0; y < L.length && !achou; y++) for (var x = 0; x < L[0].length && !achou; x++) {
        [[1, 0], [0, 1]].forEach(function (v) {
          if (achou || !ls.every(function (ch, k) { return (L[y + v[1] * k] || [])[x + v[0] * k] === ch; })) return;
          achou = true; tocar(x, y); tocar(x + v[0] * (ls.length - 1), y + v[1] * (ls.length - 1));
        });
      }
    });
    return true;
  }
  return false;
}

/* ---------- um cenário (um tamanho, uma matéria, um modo) ---------- */
async function varrer(c, tarefa, a, pasta, registrar) {
  const { tamanho, modo, materia } = tarefa, tela = modo === 'sala' ? MISSAO : SOZINHA, cartao = CARTAO[modo];
  const pastaFotos = path.join(pasta, 'fotos', tamanho, modo);
  if (a.fotos) fs.mkdirSync(pastaFotos, { recursive: true });
  const base = { tamanho, modo, materia: materia.id };
  const falha = (sala, id, det) => registrar(Object.assign({ sala, id, estado: 'falha', fotos: [], achados: [{ tipo: 'falha', onde: '', texto: '', det }] }, base));

  // mede a tela e fotografa (a de cima; a tela comprida, rolada, mais 3 no máximo); guarda no relatório
  async function olhar(sala, id, estado, op = {}) {
    await c.avancar(120);
    const m = await c.page.evaluate(medir, { raiz: tela, toque: !!op.toque });
    const fotos = [];
    if (a.fotos && op.foto !== false) {
      const tirar = async (n) => {
        const arq = path.join(pastaFotos, `${id}-${estado}${n ? '-' + n : ''}.jpg`);
        await c.page.screenshot({ path: arq, type: 'jpeg', quality: 78, scale: 'css', animations: 'disabled', caret: 'hide' });
        fotos.push(arq);
      };
      const topo = m.rola ? m.rola.topo : 0;
      await tirar(0);
      if (m.rola && m.rola.alto > m.rola.cabe + 8 && estado !== 'retorno') {
        await c.page.evaluate(rolarFotos, { raiz: tela, topo: true });
        for (let n = 1; n <= 3 && await c.page.evaluate(rolarFotos, { raiz: tela }); n++) await tirar(n);
        await c.page.evaluate(([s, y]) => { var r = document.querySelector(s); if (r) r.dispatchEvent(new Event('scroll')); void y; }, [tela, topo]);
        await c.page.evaluate(rolarFotos, { raiz: tela, topo: true });
      }
    }
    // resposta pessoal (qualquer texto vale): o texto dela não tem tamanho certo para caber na caixa
    const achados = op.livre ? m.achados.filter((x) => x.tipo !== 'resposta-nao-cabe') : m.achados;
    const semFigura = await c.js('(function (q) { var n = q.semFigura; q.semFigura = 0; return n; })(window.__q)');
    if (semFigura) achados.push({ tipo: 'figura-faltando', onde: '', texto: '', det: `${semFigura} figura(s) sem desenho: aparece ❓ no lugar` });
    registrar(Object.assign({ sala, id, estado, fotos, achados, fontes: m.fontes }, base));
  }
  const levar = async (r, alvo) => {
    if (r.tipo === 'cruzadinha' || r.tipo === 'cacaPalavras') await c.page.evaluate(porCertaEspecial, cartao);
    else await Q.levarA(c, r, alvo, 'dom', cartao);
    await c.avancar(80);
  };
  const retornoSala = () => c.js(`(function (r) { return !r || r.hidden ? null : r.classList.contains('retorno-certo') ? 'certo' : 'quase'; })(document.querySelector('${Q.RETORNO}'))`);

  await c.page.evaluate(preparar);
  for (const sala of materia.salas) {
    if (a.salas && !a.salas.test(sala.id)) continue;
    try {
      if (modo === 'sala') await umaSala(sala);
      else for (const d of sala.desafios.filter((x) => x.sozinha)) await umaSozinha(sala, d);
    } catch (e) { falha(sala.id, sala.id, String(e && e.message || e).split('\n')[0]); }
    const erros = await c.js('window.__q.erros.splice(0)');
    if (erros.length || c.erros.length) falha(sala.id, sala.id, 'erro na página: ' + erros.concat(c.erros.splice(0)).join(' | ').slice(0, 300));
  }

  async function umaSala(sala) {
    const ref = JSON.stringify([materia.id, sala.id]);
    await c.js(`(function (r) { Reino.UI.fecharTodas(); document.body.classList.remove('em-missao'); var m = Reino.materia(r[0]);
      void Reino.Missao.iniciar(m, m.salas.find(function (s) { return s.id === r[1]; })); })(${ref})`);
    await c.avancar(300);
    let ultimo = null, nCarta = 0;
    for (let k = 0; k < 500; k++) {
      const q = await Q.telaDaMissao(c);
      if (q === 'fimSala' || q === 'fechada') return;
      if (q === 'trilha' || q === 'fimEtapa') { if (q === 'fimEtapa') ultimo = null; await Q.acionar(c, c.page.locator(Q.PRINCIPAL), 'dom'); }
      else if (q === 'carta') { await olhar(sala.id, sala.cartas[nCarta++] || `${sala.id}-carta${nCarta}`, 'carta', { toque: true }); await Q.acionar(c, c.page.locator(Q.PRINCIPAL), 'dom'); }
      else if (q === 'festa') await Q.acionar(c, c.page.locator('.tela-missao .festa-trilha > .btn-principal'), 'dom');
      else if (q === 'desafio') {
        const id = await c.js('window.__q.atual.d.id');
        if (id === ultimo) throw new Error(`parou em ${id}`);
        ultimo = id;
        await umDesafio(sala, id);
      } else throw new Error(`tela inesperada na missão: ${q}`);
      await c.avancar(100);
    }
    throw new Error('a sala não terminou');
  }
  async function umDesafio(sala, id) {
    const r = await c.page.evaluate(Q.respostas, id);
    if (r.fora) throw new Error(`na tela: ${r.fora}, esperado ${id}`);
    await olhar(sala.id, id, 'branco', { toque: true, livre: r.livre });
    if (r.errada !== null) {
      await levar(r, r.errada);
      const e = await Q.conferir(c, 'dom');
      if (e === 'quase') {
        await olhar(sala.id, id, 'quase', { foto: tamanho === 'celular', livre: r.livre });
        await Q.botaoDoRetorno(c, 'Tentar de novo', 'dom');
        await c.avancar(1100);
      } else falha(sala.id, id, `a resposta errada deu: ${e}`);
    }
    await levar(r, r.certa);
    await olhar(sala.id, id, 'certa', { toque: true, foto: false, livre: r.livre });
    let ok = await Q.conferir(c, 'dom');
    if (ok === 'desligado') { await c.avancar(900); ok = await retornoSala(); }   // o tipo que confere sozinho ao completar
    if (ok !== 'certo') throw new Error(`${id}: a resposta certa deu: ${ok}`);
    await c.avancar(600);
    await olhar(sala.id, id, 'retorno', { livre: r.livre });
    if (!(await Q.botaoDoRetorno(c, 'Continuar|Terminar', 'dom'))) throw new Error(`${id}: sem o "Continuar"`);
  }

  // a pergunta do Bosque com este desafio no lugar do sorteio: em branco (com o "Leia antes") e depois de acertar
  async function umaSozinha(sala, d) {
    const ref = JSON.stringify([materia.id, sala.id, d.id]);
    await c.js(`(function (r) { Reino.UI.fecharTodas(); var m = Reino.materia(r[0]), s = m.salas.find(function (x) { return x.id === r[1]; });
      var q = { materia: m, sala: s, desafio: s.desafios.find(function (x) { return x.id === r[2]; }) };
      Reino.Bosque.pergunta = function () { return q; };
      void Reino.UI.perguntaFantasma({ id: null, arena: 'bosque' }); })(${ref})`);
    await c.avancar(400);
    if (!(await c.js(`!!document.querySelector('${cartao}')`))) { falha(sala.id, d.id, 'a pergunta sozinha não abriu'); return; }
    const r = await c.page.evaluate(Q.respostas, d.id);
    if (r.fora) { falha(sala.id, d.id, `no painel: ${r.fora}`); return; }
    await olhar(sala.id, d.id, 'branco', { toque: true, livre: r.livre });
    await levar(r, r.certa);
    const botao = c.page.locator(`${SOZINHA} .bosque-botao`);
    if (await botao.isEnabled()) {
      await Q.acionar(c, botao, 'dom');
      await c.avancar(900);
      await olhar(sala.id, d.id, 'retorno', { foto: tamanho === 'celular', livre: r.livre });
    } else falha(sala.id, d.id, 'a resposta certa não ligou o Conferir do painel');
    await c.js('Reino.UI.fecharTodas()');
    await c.avancar(300);
    await c.js('Reino.UI.fecharTodas()');   // o baú do presente, se veio
    await c.avancar(200);
  }
}

/* ---------- relatório ---------- */
function gravidade(a) {
  const texto = `${a.tipo} ${a.onde} ${a.det}`;
  return DE_PROPOSITO.some((re) => re.test(texto)) ? 'nota' : TIPOS[a.tipo] || 'aviso';
}
function relatorio(registros, pasta, a) {
  const porId = new Map(), conta = { grave: 0, aviso: 0, nota: 0 }, porTipo = {};
  let telas = 0;
  for (const r of registros) {
    telas++;
    for (const x of r.achados) {
      const g = gravidade(x);
      conta[g]++;
      if (g === 'nota') continue;
      porTipo[x.tipo] = (porTipo[x.tipo] || 0) + 1;
      // o mesmo defeito em vários tamanhos e estados: uma linha, com onde aparece
      const k = `${r.id}|${x.tipo}|${x.onde}|${x.texto}`;
      if (!porId.has(k)) porId.set(k, { id: r.id, sala: r.sala, materia: r.materia, g, tipo: x.tipo, onde: x.onde, texto: x.texto, det: x.det, em: new Set(), foto: null });
      const e = porId.get(k);
      e.em.add(`${r.tamanho}/${r.modo}/${r.estado}`);
      if (!e.foto && r.fotos[0]) e.foto = r.fotos[0];
    }
  }
  const linhas = [...porId.values()].sort((x, y) => (x.g === y.g ? 0 : x.g === 'grave' ? -1 : 1) || x.materia.localeCompare(y.materia) || x.id.localeCompare(y.id));
  const md = [`# Varredura de layout (${new Date().toISOString().slice(0, 16)})`, '',
    `Telas medidas: ${telas} · graves: ${conta.grave} · avisos: ${conta.aviso} · notas: ${conta.nota}`,
    `Por tipo: ${Object.keys(porTipo).sort().map((t) => `${t} ${porTipo[t]}`).join(' · ') || 'nenhum'}`, '',
    '| questão | gravidade | tipo | onde | texto | detalhe | aparece em | foto |', '|---|---|---|---|---|---|---|---|'];
  for (const e of linhas) md.push(`| ${e.id} | ${e.g} | ${e.tipo} | ${e.onde} | ${e.texto.replace(/\|/g, '/')} | ${e.det.replace(/\|/g, '/')} | ${[...e.em].join(', ')} | ${e.foto ? path.relative(pasta, e.foto) : ''} |`);
  fs.writeFileSync(path.join(pasta, 'relatorio.md'), md.join('\n') + '\n');
  fs.writeFileSync(path.join(pasta, 'relatorio.json'), JSON.stringify({ opcoes: { tamanhos: a.tamanhos, modos: a.modos }, conta, porTipo, registros }, null, 1));
  return { conta, porTipo, linhas: linhas.length, telas };
}

async function principal() {
  const a = lerArgs(process.argv.slice(2));
  const pasta = path.join(PASTA_TESTES, 'varredura', a.nome || new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19));
  fs.mkdirSync(pasta, { recursive: true });
  if (a.fotos) {
    const st = fs.statfsSync(pasta), livre = st.bavail * st.bsize / 1e9, raizFotos = path.dirname(pasta);
    if (livre < 4) {
      const antigas = fs.readdirSync(raizFotos).filter((n) => n !== path.basename(pasta)).map((n) => path.join(raizFotos, n));
      console.error(`✘ só ${livre.toFixed(1)} GB livres em ${raizFotos} (o /tmp é RAM; a rodada com fotos ocupa uns 1,5 GB): rode com --sem-fotos`
        + ` ou apague rodadas antigas (${antigas.length ? antigas.join(' ') : 'nenhuma aqui'})`);
      process.exit(2);
    }
  }
  // o catálogo sai do próprio jogo (um cenário curto)
  const c0 = await abrirCenario({ tamanho: 'notebook', save: 'completo', raiz: a.raiz, pasta });
  let materias;
  try { materias = await c0.page.evaluate(catalogo); } finally { await c0.fechar(); }
  if (a.materias) materias = materias.filter((m) => a.materias.includes(m.id));
  if (!materias.length) throw new Error('nenhuma matéria do 4º bimestre com esse filtro');
  const tarefas = [];
  for (const tamanho of a.tamanhos) for (const modo of a.modos) for (const materia of materias) tarefas.push({ tamanho, modo, materia });
  const registros = [], inicio = Date.now();
  let feitas = 0;
  const trabalhar = async () => {
    const browser = await lancar({ nome: 'varredura' });
    try {
      for (let t; (t = tarefas.shift());) {
        const c = await abrirCenario({ browser, tamanho: t.tamanho, save: 'completo', raiz: a.raiz, pasta, ajustes: a.ajustes });
        try { await varrer(c, t, a, pasta, (r) => registros.push(r)); }
        catch (e) { registros.push({ tamanho: t.tamanho, modo: t.modo, materia: t.materia.id, sala: '', id: t.materia.id, estado: 'falha', fotos: [], achados: [{ tipo: 'falha', onde: '', texto: '', det: String(e && e.message || e).split('\n')[0] }] }); }
        finally { await c.fechar(); }
        console.log(`  ✔ ${t.materia.id} ${t.tamanho} ${t.modo} (${++feitas} feitas, ${tarefas.length} na fila, ${Math.round((Date.now() - inicio) / 1000)} s)`);
      }
    } finally { await browser.close().catch(() => {}); }
  };
  console.log(`Varredura: ${tarefas.length} percursos (${materias.length} matérias × ${a.tamanhos.join(', ')} × ${a.modos.join(', ')}) em ${pasta}`);
  await Promise.all(Array.from({ length: Math.min(a.paralelo, tarefas.length) }, trabalhar));
  const r = relatorio(registros, pasta, a);
  console.log(`${r.conta.grave ? '✘' : '✔'} ${r.telas} telas medidas: ${r.conta.grave} grave(s), ${r.conta.aviso} aviso(s), ${r.conta.nota} nota(s) em ${r.linhas} linha(s)`);
  console.log(`  por tipo: ${Object.keys(r.porTipo).sort().map((t) => `${t} ${r.porTipo[t]}`).join(' · ') || 'nenhum'}`);
  console.log(`  ${path.join(pasta, 'relatorio.md')}`);
  process.exit(r.conta.grave ? 1 : 0);
}

if (require.main === module) principal().catch((e) => { console.error('✘ ' + (e && e.stack || e)); process.exit(2); });

module.exports = { lerArgs, relatorio, gravidade, TIPOS };
