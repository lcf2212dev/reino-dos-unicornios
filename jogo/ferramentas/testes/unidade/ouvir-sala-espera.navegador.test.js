// Ouvir antes de seguir na sala (atividades/missao.js, desafios.js lerSozinho): com config.esperaFala.travar (desligada
// no jogo; os testes da trava a ligam), a intro, o RESUMO (cartas do livro que a sala usa, antes da 1ª questão), cada
// questão e o retorno travam os botões e o ✕ enquanto a voz fala. Sem ela (o padrão), tudo fala e nada trava.
// Reino.Som.falarEsperando é trocado por um de mentira com o fim controlado pelo teste; com { espera: false }
// nada trava. Servidor e banco de TESTE novos (cenario.js); saves 100% sintéticos (voz desligada).
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

// espera: true → cada fala fica pendente até __soltar(); false → nada espera
const STUB = (espera) => `
  window.__fins = []; window.__falas = [];
  window.__soltar = function () { window.__fins.splice(0).forEach(function (f) { f(); }); };
  Reino.Som.falarEsperando = function (seg) {
    window.__falas.push(JSON.stringify(seg).slice(0, 60));
    if (!${espera}) return { espera: false, fim: Promise.resolve() };
    var r; var p = new Promise(function (x) { r = x; }); window.__fins.push(r);
    return { espera: true, fim: p };
  };
  var m = Reino.materia('historia'), s = m.salas[0];
  // questões de escolher conhecidas, presas a 2 cartas reais do livro (a 1ª repetida: vira 1 carta só)
  var q = function (n, livro) { return { id: 'os-' + n, tipo: 'escolha', pergunta: 'Pergunta ' + n + '?', opcoes: [{ t: 'Sim' }, { t: 'Não' }], certa: 0, explica: 'Porque sim.', livro: livro }; };
  Reino.Missao.iniciar(m, Object.assign({}, s, { desafios: [q(1, m.livro[0].id), q(2, m.livro[1].id), q(3, m.livro[0].id), q(4, 'nao-existe'), q(5, m.livro[1].id), q(6, m.livro[0].id)] }));`;

// botões da tela da sala (sem o 🔊 Ouvir): quantos travados pela fala e quantos livres
const BOTOES = `(function (sel) {
  var bs = [...document.querySelectorAll('.tela-missao ' + sel)].filter(function (b) { return !b.classList.contains('livre-na-fala') && !b.hidden; });
  return { total: bs.length, travados: bs.filter(function (b) { return b.disabled && b.classList.contains('esperando-fala'); }).length };
})`;
const botoes = (c, sel) => c.js(`${BOTOES}(${JSON.stringify(sel)})`);
const tem = (c, sel) => c.js(`!!document.querySelector(${JSON.stringify(sel)})`);
const soltar = async (c) => { await c.js('window.__soltar()'); await c.avancar(300); };
const TRAVAR = '; Reino.config.esperaFala.travar = true;';

function travadoTudo(r, onde) { assert.ok(r.total > 0 && r.travados === r.total, onde + ': ' + JSON.stringify(r)); }
function livreTudo(r, onde) { assert.strictEqual(r.travados, 0, onde + ': ' + JSON.stringify(r)); }

test('com a trava e a voz falando: intro, resumo, questão e retorno só liberam no fim da fala', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/ouvir-sala' });
  try {
    await c.js(STUB('true') + TRAVAR);
    await c.avancar(1500);
    travadoTudo(await botoes(c, '.intro-botoes button, .btn-sair'), 'intro');
    await soltar(c);
    livreTudo(await botoes(c, '.intro-botoes button, .btn-sair'), 'intro depois da fala');
    await c.tocar('.intro-botoes .btn-principal');
    await c.avancar(1500);
    assert.ok(await tem(c, '.resumo-sala .livro-carta'), 'o resumo vem depois da intro');
    assert.ok(!(await tem(c, '.tela-missao .desafio')), 'nenhuma questão antes do resumo');
    let cartas = 0;
    while (await tem(c, '.resumo-sala')) {
      travadoTudo(await botoes(c, '.resumo-botoes button, .btn-sair'), 'resumo carta ' + (cartas + 1));
      await soltar(c);
      livreTudo(await botoes(c, '.resumo-botoes button, .btn-sair'), 'resumo depois da fala');
      await c.tocar('.resumo-botoes .btn-principal');
      await c.avancar(1500);
      if (++cartas > 30) throw new Error('resumo sem fim');
    }
    assert.strictEqual(cartas, 2, 'as 2 cartas da sala, sem repetir');
    // a questão é lida sozinha: respostas e ✕ travados
    assert.ok(await tem(c, '.tela-missao .desafio'), 'a 1ª questão depois do resumo');
    travadoTudo(await botoes(c, '.desafio button, .btn-sair'), 'questão');
    await soltar(c);
    livreTudo(await botoes(c, '.desafio button, .btn-sair'), 'questão depois da fala');
    // responde qualquer coisa (1ª opção) e confere: o retorno espera a fala
    await c.js("[...document.querySelectorAll('.tela-missao .desafio .opcao')].find(function (o) { return /Sim/.test(o.textContent); }).click()");
    await c.avancar(400);
    if (!(await tem(c, '.missao-retorno:not([hidden])'))) await c.js("var b = document.querySelector('.tela-missao .btn-conferir'); if (!b.disabled) b.click();");
    await c.avancar(400);
    assert.ok(await tem(c, '.missao-retorno:not([hidden])'), 'o retorno apareceu');
    {
      travadoTudo(await botoes(c, '.retorno-botoes button, .btn-sair'), 'retorno');
      await soltar(c);
      livreTudo(await botoes(c, '.retorno-botoes button, .btn-sair'), 'retorno depois da fala');
    }
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('o 🔊 durante a leitura da questão repete a fala sem soltar a trava; solta no fim da repetição', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/ouvir-sala' });
  try {
    await c.js(STUB('true') + TRAVAR);
    await c.avancar(1500); await soltar(c);
    await c.tocar('.intro-botoes .btn-principal'); await c.avancar(1500);
    while (await tem(c, '.resumo-sala')) { await soltar(c); await c.tocar('.resumo-botoes .btn-principal'); await c.avancar(1500); }
    // leitura (A) pendente; o 🔊 (B), com a voz desligada no save, é tocado por UI.ouvirDeNovo direto
    await c.js("window.__A = window.__fins.splice(0); Reino.UI.ouvirDeNovo(['de novo'], { voz: 'narradora' }); window.__B = window.__fins.splice(0);");
    await c.js('window.__A.forEach(function (f) { f(); })');
    await c.avancar(300);
    travadoTudo(await botoes(c, '.desafio button, .btn-sair'), 'depois de A, com B tocando');
    await c.js('window.__B.forEach(function (f) { f(); })');
    await c.avancar(300);
    livreTudo(await botoes(c, '.desafio button, .btn-sair'), 'depois de B');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('padrão (sem a trava), com a voz falando sem parar: intro, resumo, questão e retorno falam e ficam livres', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/ouvir-sala' });
  try {
    await c.js(STUB('true'));
    await c.avancar(1500);
    const falas = () => c.js('window.__falas.length');
    assert.strictEqual(await falas(), 1, 'a intro foi falada');
    livreTudo(await botoes(c, '.intro-botoes button, .btn-sair'), 'intro com a voz falando');
    assert.strictEqual(await c.js('Reino.UI.esperandoFala()'), false, 'nada espera (o Esc fecha)');
    await c.tocar('.intro-botoes .btn-principal');
    await c.avancar(1500);
    assert.ok(await tem(c, '.resumo-sala'), 'resumo');
    while (await tem(c, '.resumo-sala')) {
      livreTudo(await botoes(c, '.resumo-botoes button, .btn-sair'), 'resumo com a voz falando');
      await c.tocar('.resumo-botoes .btn-principal');
      await c.avancar(1500);
    }
    assert.ok(await tem(c, '.tela-missao .desafio'), 'a 1ª questão');
    assert.ok(/Pergunta 1\?/.test(await c.js('window.__falas[window.__falas.length - 1]')), 'a questão foi lida');
    livreTudo(await botoes(c, '.desafio button, .btn-sair'), 'questão com a voz lendo');
    // o tempo de leitura da questão (senão vem o aviso gentil de pressa, que não depende da voz)
    await c.avancar(8000);
    await c.js("[...document.querySelectorAll('.tela-missao .desafio .opcao')].find(function (o) { return /Sim/.test(o.textContent); }).click()");
    await c.avancar(400);
    if (!(await tem(c, '.missao-retorno:not([hidden])'))) await c.js("var b = document.querySelector('.tela-missao .btn-conferir'); if (!b.disabled) b.click();");
    await c.avancar(400);
    assert.ok(await tem(c, '.missao-retorno:not([hidden])'), 'o retorno apareceu');
    livreTudo(await botoes(c, '.retorno-botoes button, .btn-sair'), 'retorno com a voz falando');
    assert.strictEqual(await c.js("document.querySelectorAll('.esperando-fala').length"), 0);
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('sem espera (voz desligada, sem gravação): nada trava e o resumo vem antes da 1ª questão', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/ouvir-sala' });
  try {
    await c.js(STUB('false'));
    await c.avancar(1500);
    livreTudo(await botoes(c, '.intro-botoes button, .btn-sair'), 'intro');
    await c.tocar('.intro-botoes .btn-principal');
    await c.avancar(1500);
    assert.ok(await tem(c, '.resumo-sala'), 'resumo');
    while (await tem(c, '.resumo-sala')) {
      livreTudo(await botoes(c, '.resumo-botoes button, .btn-sair'), 'resumo');
      await c.tocar('.resumo-botoes .btn-principal');
      await c.avancar(600);
    }
    assert.ok(await tem(c, '.tela-missao .desafio'));
    livreTudo(await botoes(c, '.desafio button, .btn-sair'), 'questão');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('resumo: as cartas são as do campo livro da sala, sem repetir, na ordem; o texto está gravado no pacote <m>-livro', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/ouvir-sala' });
  try {
    await c.js("window.__ok = null; Reino.Voz.carregar('portugues-livro').then(function () { window.__ok = true; });");
    for (let k = 0; k < 40 && !(await c.js('window.__ok')); k++) await c.avancar(500);
    const r = await c.js(`(function () {
      var m = Reino.materia('portugues'), faltam = [];
      m.salas.forEach(function (s) {
        var ids = []; s.desafios.forEach(function (d) { if (d.livro && ids.indexOf(d.livro) < 0) ids.push(d.livro); });
        ids.forEach(function (id) {
          var cta = m.livro.find(function (x) { return x.id === id; });
          if (cta) Reino.UI.falaCarta(cta).forEach(function (t) { if (!Reino.Voz.tem('narradora', t)) faltam.push(id + ': ' + t.slice(0, 40)); });
        });
      });
      return faltam;
    })()`);
    assert.deepStrictEqual(r, [], 'falas do resumo sem gravação');
    // ordem e sem repetir, na tela
    await c.js(`window.__falas = []; Reino.Som.falarEsperando = function (seg) { window.__falas.push(seg[0]); return { espera: false, fim: Promise.resolve() }; };
      var m = Reino.materia('portugues'); Reino.Missao.iniciar(m, m.salas[0]);`);
    await c.avancar(1500);
    await c.tocar('.intro-botoes .btn-principal');
    const vistos = [];
    for (let k = 0; k < 40 && await tem(c, '.resumo-sala'); k++) {
      vistos.push(await c.js("document.querySelector('.resumo-sala .livro-carta h3').textContent"));
      await c.tocar('.resumo-botoes .btn-principal');
    }
    const esperado = await c.js(`(function () {
      var m = Reino.materia('portugues'), ids = [];
      m.salas[0].desafios.forEach(function (d) { if (d.livro && ids.indexOf(d.livro) < 0) ids.push(d.livro); });
      return ids.map(function (id) { return m.livro.find(function (x) { return x.id === id; }); }).filter(Boolean).map(function (x) { return x.titulo; });
    })()`);
    assert.deepStrictEqual(vistos, esperado);
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
