// Tela de fim da sala (atividades/missao.js): o que aparece na lista de prêmios em cada caso. O e2e não
// fotografa essa tela; aqui o desafio é trocado por um de mentira que já sai certo, para chegar ao fim.
// Servidor e banco de TESTE novos por cenário (cenario.js); saves 100% sintéticos.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const FALSO = `
  var D = Reino.Desafios;
  D.sortear = function () { return [{ id: 'falso-1', tipo: 'falso', pergunta: 'x', explica: 'x', livro: 'x' }]; };
  D.render = function (d, opts) {
    setTimeout(function () { opts.onMudar(); }, 0);
    return { card: document.createElement('div'), pronto: function () { return true; },
      conferir: function () { return { ok: true }; }, marcarCerto: function () {}, marcarErro: function () {} };
  };`;

async function premios(op, iniciar) {
  const c = await abrirCenario(Object.assign({ tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-fim-sala' }, op));
  try {
    await c.js(FALSO + iniciar);
    await c.tocar('Começar'); await c.avancar(800);
    // o resumo (cartas do livro da sala) vem antes das questões
    for (let k = 0; k < 40 && await c.js("!!document.querySelector('.resumo-sala')"); k++) { await c.tocar('.resumo-botoes .btn-principal'); await c.avancar(400); }
    for (const t of ['Conferir', 'Terminar a sala']) { await c.tocar(t); await c.avancar(800); }
    const itens = await c.js("[...document.querySelectorAll('.fim-sala .premios li')].map(function (l) { return l.textContent.trim(); })");
    assert.deepStrictEqual(c.erros, []);
    return itens;
  } finally { await c.fechar(); }
}
const H1 = "Reino.Missao.iniciar(Reino.materia('historia'), Reino.materia('historia').salas[0]);";

test('primeira vez: o dinheiro da sala, sem "treino livre" nem bônus', async () => {
  const itens = await premios({ save: 'inicio' }, H1);
  assert.ok(itens.includes('+ R$ 4,00 no Baú do Tesouro!'), itens.join(' | '));
  assert.ok(!itens.some((t) => /Treino livre|bônus/.test(t)), itens.join(' | '));
});

test('sala repetida: só o "treino livre", sem dinheiro novo', async () => {
  const itens = await premios({ save: 'completo' }, H1);
  assert.ok(itens.some((t) => t.startsWith('Treino livre: os R$ 4,00')), itens.join(' | '));
  assert.ok(!itens.some((t) => /no Baú do Tesouro!|bônus/.test(t)), itens.join(' | '));
});

test('última sala de matéria com bônus (6 salas): o valor da sala e o bônus, sem "treino livre"', async () => {
  const itens = await premios({ save: 'inicio', materiasCompletas: ['historia'] },
    "var m = Reino.materia('historia'); m.salas.push(Object.assign({}, m.salas[4], { id: 'h6-teste', nome: 'Sala de Teste' })); Reino.Missao.iniciar(m, m.salas[5]);");
  assert.ok(itens.includes('+ R$ 3,00 no Baú do Tesouro!'), itens.join(' | '));
  assert.ok(itens.includes('+ R$ 2,00 de bônus por completar História!'), itens.join(' | '));
  assert.ok(!itens.some((t) => /Treino livre/.test(t)), itens.join(' | '));
});
