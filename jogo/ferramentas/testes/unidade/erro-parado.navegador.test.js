// Erro de item parado (ui.md §10.19.2; D9-04, D9-13): com Animações desligadas, 200 ms depois de marcar o erro o item
// errado ainda aparece com .item-erro (fundo --erro-fundo) em Ligar, Separar, Sequência, Copiar, V/F em lista e Desenho;
// no jogo da memória o par errado fica marcado enquanto aberto e a carta vira em degraus (JS, relógio do jogo).
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/erro-parado.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const TIPOS = {
  ligar: [{ tipo: 'ligar', pares: [[{ t: 'A' }, { t: 'a' }], [{ t: 'B' }, { t: 'b' }], [{ t: 'C' }, { t: 'c' }]], direita: [0, 1, 2] },
    "var r=box.querySelectorAll('.ligar-dir'); r[1].click(); r[0].click(); r[2].click();",
    "var r=box.querySelectorAll('.ligar-dir'); r[1].click(); r[0].click();"], // refazer: só os dois pares desfeitos
  separar: [{ tipo: 'separar', grupos: [{ t: 'G1' }, { t: 'G2' }], itens: [{ t: 'a', g: 0 }, { t: 'b', g: 1 }, { t: 'c', g: 0 }] },
    "for (var k=0;k<3;k++) box.querySelector('.bau').click();"],
  ordenar: [{ tipo: 'ordenar', itens: ['a', 'b', 'c', 'd'] }, "for (var k=0;k<4;k++) box.querySelector('.seq-monte button').click();"],
  copiar: [{ tipo: 'copiar', pergunta: 'Copie.', itens: [{ opcoes: ['CASA', 'KAZA'], certa: 0 }] },
    "box.querySelectorAll('.copiar-opcao')[1].click(); for (var k=0;k<4;k++) { var p=box.querySelector('.copiar-pecas .copiar-peca:not(.usada)'); p && p.click(); }"],
  vfLista: [{ tipo: 'vfLista', itens: [{ t: 'a', v: true }, { t: 'b', v: false }] },
    "box.querySelectorAll('.vf-linha').forEach(function(l){ l.querySelector('.vf-botao').click(); });"],
  desenho: [{ tipo: 'desenho', pergunta: 'Desenhe.', requisitos: ['linhas', 'formas'] }, ''],
};

function montar(c, d, fazer) {
  return c.js(`Reino.Claude.limpar && Reino.Claude.limpar(); Reino.Progresso.estado().ajustes.animacoes = false;
    document.body.classList.add('sem-animacao');
    var v = document.getElementById('caixa-erro'); v && v.remove();
    var box = document.createElement('div'); box.id = 'caixa-erro'; document.body.appendChild(box);
    var ctrl = Reino.Desafios.render(${JSON.stringify(Object.assign({ id: 'erro-parado', pergunta: 'Teste.' }, d))}, {});
    box.appendChild(ctrl.card); window.__ctrl = ctrl; ${fazer} 'ok'`);
}
const marcados = (c) => c.js(`Array.from(document.querySelectorAll('#caixa-erro .item-erro')).map(function (e) {
  return getComputedStyle(e).backgroundColor; })`);

test('erro parado: o item errado continua marcado 200 ms depois, com Animações desligadas', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'erro-parado-')) });
  try {
    const fundo = await c.js("getComputedStyle(document.documentElement).getPropertyValue('--erro-fundo').trim()");
    for (const [tipo, [d, fazer]] of Object.entries(TIPOS)) {
      await montar(c, d, fazer);
      await c.js('var r = __ctrl.conferir(); __ctrl.marcarErro(r); r.ok');
      await c.avancar(200);
      const m = await marcados(c);
      assert.ok(m.length > 0, tipo + ': nada marcado 200 ms depois');
      assert.ok(m.every((cor) => cor === fundoRgb(fundo)), tipo + ': fundo da marca ' + m + ' (esperado ' + fundo + ')');
      assert.strictEqual(await c.js('__ctrl.pronto()'), false, tipo + ': pronto() durante a marca');
      await c.avancar(1200);
      assert.strictEqual((await marcados(c)).length, 0, tipo + ': a marca sai depois');
    }
    // o próximo toque apaga a marca na hora (e o toque vale)
    await montar(c, TIPOS.ligar[0], TIPOS.ligar[1]);
    await c.js('__ctrl.marcarErro(__ctrl.conferir()); document.querySelector("#caixa-erro .ligar-esq").click(); 1');
    assert.strictEqual((await marcados(c)).length, 0, 'ligar: o toque seguinte tira a marca');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

// na tela REAL da missão: o "Quase!" (.missao-retorno) cobre o desafio, então a marca espera ele fechar; "Tentar de novo"
// deixa a marca mais 900 ms à vista, com o Conferir DESLIGADO (pronto() dá false); depois a resposta errada se desfaz e o
// Conferir religa quando a criança refaz. Nada se força: o teste só clica no que está ligado.
async function abrirNaMissao(c, d) {
  await c.js(`(function () {
    Reino.Claude.limpar && Reino.Claude.limpar(); Reino.Progresso.estado().ajustes.animacoes = false;
    document.body.classList.add('sem-animacao');
    var D = Reino.Desafios, mt = Reino.materias[0], sala = mt.salas[0], sortear = D.sortear;
    var alvo = ${JSON.stringify(Object.assign({ id: 'erro-missao', pergunta: 'Teste.', explica: 'Pense mais um pouco.' }, d))};
    D.sortear = function () { return [alvo]; };
    try { Reino.Missao.iniciar(mt, sala); } finally { D.sortear = sortear; }
    document.querySelector('.tela-missao .intro-botoes .btn-principal').click();
    for (var j = 0; j < 40 && document.querySelector('.resumo-sala'); j++) document.querySelector('.resumo-botoes .btn-principal').click();
  })()`);
  await c.avancar(600);
}
const naMissao = (c) => c.js("document.querySelectorAll('.tela-missao .item-erro').length");
const conferirDesligado = (c) => c.js("document.querySelector('.tela-missao .btn-conferir').disabled");
// responde e toca no Conferir (se ligado); devolve a classe do retorno ('' se não abriu)
async function responder(c, fazer) {
  await c.js(`(function () { var box = document.querySelector('.tela-missao .missao-corpo'); ${fazer} })(); 1`);
  for (let k = 0; k < 2; k++) {
    const r = await c.js(`var cf = document.querySelector('.tela-missao .btn-conferir'), r = document.querySelector('.tela-missao .missao-retorno');
      if (r.hidden && !cf.disabled) cf.click(); r.hidden ? '' : r.className`);
    if (r) return r;
    await c.avancar(1500); // (o 1º Conferir rápido demais pode ser só o aviso de pressa)
  }
  return '';
}
// espera o botão do retorno ligar (a fala termina) e toca nele
async function tocarRetorno(c) {
  for (let k = 0; k < 40; k++) {
    if (await c.js("var b = document.querySelector('.tela-missao .missao-retorno .btn-principal'); !!b && !b.disabled && (b.click(), true)")) return;
    await c.avancar(500);
  }
  throw new Error('botão do retorno não ligou');
}
const fecharMissao = (c) => c.js("document.querySelectorAll('.tela-missao').forEach(function (t) { t.remove(); }); document.body.classList.remove('em-missao'); 1");

test('erro parado na missão: a marca espera o "Quase!" fechar e o Conferir fica desligado enquanto ela aparece', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'erro-missao-')) });
  try {
    // desenho fica de fora: sem traço o Conferir não vale (usa o mesmo relógio; testado na caixa acima)
    for (const [tipo, [d, fazer, refazer]] of Object.entries(TIPOS).filter(([t]) => t !== 'desenho')) {
      await abrirNaMissao(c, d);
      assert.match(await responder(c, fazer), /retorno-quase/, tipo + ': o "Quase!" abriu');
      await c.avancar(3000);
      assert.ok((await naMissao(c)) > 0, tipo + ': marca sumiu com o "Quase!" ainda aberto');
      await tocarRetorno(c);
      await c.avancar(400);
      assert.ok((await naMissao(c)) > 0, tipo + ': marca à vista 400 ms depois do Tentar de novo');
      assert.strictEqual(await conferirDesligado(c), true, tipo + ': Conferir ligado durante a marca');
      await c.avancar(1000);
      assert.strictEqual(await naMissao(c), 0, tipo + ': a marca sai depois');
      // refez: o Conferir religa e conta de novo
      assert.match(await responder(c, refazer || fazer), /retorno-quase/, tipo + ': refez e o Conferir voltou a valer');
      await fecharMissao(c);
    }
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('erro parado: sair pelo ✕ com o "Quase!" aberto não atrapalha a missão seguinte', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'erro-sair-')) });
  try {
    const [d, errar] = TIPOS.ligar;
    await abrirNaMissao(c, d);
    assert.match(await responder(c, errar), /retorno-quase/, 'o "Quase!" abriu');
    await c.avancar(3000);
    for (let k = 0; k < 40 && await c.js("document.querySelector('.tela-missao .btn-sair').disabled"); k++) await c.avancar(500);
    await c.js("document.querySelector('.tela-missao .btn-sair').click(); 1");
    await c.avancar(300);
    await c.js("Array.from(document.querySelectorAll('button')).filter(function (b) { return b.textContent.trim() === 'Sair'; }).pop().click(); 1");
    await c.avancar(300);
    assert.strictEqual(await c.js("document.querySelectorAll('.tela-missao').length"), 0, 'a missão fechou');
    await c.avancar(3000); // o relógio velho morre com o wrap
    await abrirNaMissao(c, d);
    const certo = "var r=box.querySelectorAll('.ligar-esq'), l=box.querySelectorAll('.ligar-dir'); for (var k=0;k<3;k++){ r[k].click(); l[k].click(); }";
    assert.match(await responder(c, certo), /retorno-certo/, '1º Conferir da missão seguinte mostra "Isso!"');
    assert.match(await c.js("document.querySelector('.tela-missao .missao-retorno').textContent"), /Isso/);
    await fecharMissao(c);
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('memória: par errado marcado enquanto aberto e carta que vira em degraus', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'erro-memoria-')) });
  try {
    const d = { tipo: 'memoria', pares: [['🍎', 'maçã'], ['🐶', 'cão'], ['🍇', 'uva']] };
    // duas cartas de palavra são sempre de pares diferentes (cada par tem uma só)
    const errarPar = `var cs = [...document.querySelectorAll('#caixa-erro .carta-mem .mem-face:not(.mem-emoji)')].map(function (f) { return f.parentNode; });
      cs[0].click(); cs[1].click();`;
    await montar(c, d, errarPar);
    for (const ms of [200, 900]) {
      await c.avancar(ms === 200 ? 200 : 700);
      assert.strictEqual((await marcados(c)).length, 2, 'par errado marcado aos ' + ms + ' ms');
    }
    await c.avancar(300);
    assert.strictEqual((await marcados(c)).length, 0, 'depois de fechar, sem marca');
    // com animação: a virada passa por estados intermediários (achatada) no relógio do jogo
    await montar(c, d, '');
    await c.js("Reino.Progresso.estado().ajustes.animacoes = true; Reino.util.reduzMovimentoSistema = false; document.querySelector('#caixa-erro .carta-mem').click(); 1");
    const estados = new Set();
    for (let k = 0; k < 20; k++) {
      estados.add(await c.js("var b = document.querySelector('#caixa-erro .carta-mem'); (b.classList.contains('mem-achata-1') ? '1' : b.classList.contains('mem-achata-2') ? '2' : '0') + (b.classList.contains('virada') ? 'v' : '')"));
      await c.avancar(16);
    }
    const meio = [...estados].filter((e) => e[0] !== '0');
    assert.ok(meio.length >= 2, 'estados intermediários da virada: ' + [...estados]);
    assert.ok(estados.has('0v'), 'termina aberta');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

function fundoRgb(hex) {
  const h = hex.replace('#', '');
  return 'rgb(' + [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(', ') + ')';
}
