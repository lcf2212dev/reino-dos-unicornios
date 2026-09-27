// A conversa da baia (npcs-conversa.js) quebra a frase em páginas de até 30 letras só para a TELA (quebrarNaTela).
// Bug da auditoria de 27/09/2026: uma "palavra" sem espaço maior que a página recursava sem fim (RangeError, estouro de
// pilha). Hoje nenhum texto real chega lá, mas a função não pode travar: palavra maior que a página é cortada em
// pedaços do tamanho da página. As frases de hoje (unicórnios e baia vazia) saem como antes (conferido fora daqui
// contra a função antiga). Pelo caminho real: N.executar({ tipo: 'unicornio' }) numa baia vazia, com o balão de mentira.
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node.js');

function jogo() {
  const guardado = {};
  const ctx = Jogo.contexto({ console, Math, Date, JSON, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: (k) => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); }, removeItem() {} },
    PA: { APARENCIA_PADRAO: { pele: '#f1c7a3', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ffd34d' } },
    location: { protocol: 'file:', search: '' }, document: { hidden: false, addEventListener() {} }, addEventListener() {} });
  Jogo.carregar(ctx, Jogo.scripts());
  ctx.Reino.Progresso.carregar();
  return ctx.Reino;
}

// as páginas que a baia vazia mostra para `texto` (cada Claude.falar é uma página; "Continuar" responde 'ok')
async function paginasDaBaia(R, texto) {
  const pags = [];
  R.Claude = { falar: (t) => { pags.push(t); return Promise.resolve('ok'); }, aberto: () => false, fechar() {}, limpar() {} };
  R.NPCs.BAIA_VAZIA = texto;
  await R.NPCs.executar({ tipo: 'unicornio', indice: 999 });
  return pags;
}
const tamanho = (R, t) => R._npcs.tamanho(t);

test('palavra de mais de 30 letras não estoura a pilha: vira pedaços de até 30', async () => {
  const R = jogo(), L = R._npcs.LIMITE;
  const longa = 'a'.repeat(31), muito = 'b'.repeat(75);
  for (const texto of [longa, muito, 'Olha que palavra comprida: ' + muito + ' no meio', 'Oi, ' + longa + ', tudo bem com você hoje?']) {
    let pags;
    await assert.doesNotReject(async () => { pags = await paginasDaBaia(R, texto); }, texto);
    pags.forEach((p) => assert.ok(tamanho(R, p) <= L, 'página maior que ' + L + ': ' + p));
    // nenhuma letra some nem sobra (só os espaços entre as páginas)
    assert.strictEqual(pags.join('').replace(/\s+/g, ''), texto.replace(/\s+/g, ''), texto);
  }
  assert.deepStrictEqual(await paginasDaBaia(R, longa), ['a'.repeat(30), 'a']);
});

test('frases normais (unicórnios e baia vazia) seguem em páginas de até 30 letras', async () => {
  const R = jogo(), L = R._npcs.LIMITE, baia = R.NPCs.BAIA_VAZIA;
  const textos = [baia].concat(R.Unicornios.todos('lilas').map((d) => d.frase).filter(Boolean));
  assert.ok(textos.length > 5, 'há frases de unicórnio');
  for (const t of textos) {
    const pags = await paginasDaBaia(R, t);
    assert.ok(pags.length >= 1, t);
    pags.forEach((p) => assert.ok(tamanho(R, p) <= L, 'página maior que ' + L + ': ' + p));
  }
});
