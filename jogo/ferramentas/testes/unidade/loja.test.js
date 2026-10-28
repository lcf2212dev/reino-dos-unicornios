// Testes de unidade: a lista da Loja das Fadas (js/conteudo/loja-itens.js, Reino.LojaItens) e a compra com
// estrelas (P.gastarEstrelas, que a Loja chama em js/ui/loja.js). Só o que é puro: a tela não entra.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/loja.test.js   (tudo: npm test, na raiz)
// Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, jogoCarregado, copia } = require('./ajudantes/jogo-save');

// jogo carregado (29 estrelas) com a lista da Loja por cima
function comLoja(ajuste) {
  const j = jogoCarregado(ajuste);
  Jogo.carregar(j.ctx, Jogo.scripts({ nomes: ['conteudo/loja-itens'] }));
  return Object.assign(j, { L: j.R.LojaItens });
}

test('enfeites: ids únicos, preço inteiro positivo, encaixe conhecido e ícone', () => {
  const { L } = comLoja();
  assert.ok(L.ENFEITES.length >= 10);
  const ids = new Set();
  L.ENFEITES.forEach((e) => {
    assert.ok(!ids.has(e.id), 'id repetido: ' + e.id); ids.add(e.id);
    assert.ok(Number.isInteger(e.preco) && e.preco > 0, e.id + ': preço ' + e.preco);
    assert.ok(L.SLOTS[e.slot], e.id + ': encaixe desconhecido ' + e.slot);
    assert.ok(typeof e.icone === 'string' && e.icone.length, e.id + ': sem ícone');
    assert.ok(typeof e.nome === 'string' && e.nome.length, e.id + ': sem nome');
  });
  // preços que a Mariana já conhece (valores do jogo de hoje)
  assert.strictEqual(L.enfeite('flor').preco, 8);
  assert.strictEqual(L.enfeite('asasFada').preco, 45);
  assert.strictEqual(L.enfeite('nada'), null);
  assert.strictEqual(L.item('flor'), L.enfeite('flor'));
  assert.strictEqual(L.item('nada'), null);
});

test('prêmios da Escola: um por raridade de cada prova (lendário, raro, comum), com o preço da config', () => {
  const j = comLoja();
  const { L, R } = j;
  const todos = L.premios(), ps = todos.filter((p) => !p.origem);
  assert.strictEqual(ps.length, R.provas.length * 3);
  assert.strictEqual(todos.filter((p) => p.origem === 'trilha').length, 25, 'os 25 lendários da trilha perfeita');
  R.provas.forEach((pv) => {
    const daProva = ps.filter((p) => p.provaId === pv.id);
    assert.deepStrictEqual(copia(daProva.map((p) => p.raridade)), ['lendario', 'raro', 'comum'], pv.id);
    daProva.forEach((p) => assert.strictEqual(p.preco, R.config.precoPremio[p.raridade]));
  });
  assert.deepStrictEqual(copia(R.config.precoPremio), { comum: 25, raro: 40, lendario: 70 });
  const it = L.item(ps[0].id);
  assert.strictEqual(it.premio, true);
  assert.strictEqual(it.icone, 'acessorio:' + ps[0].id);
  assert.strictEqual(it.preco, ps[0].preco);
});

test('estado do prêmio: bloqueado sem prêmio da prova, ganho, à venda depois de ganhar um, comprado', () => {
  const { L } = comLoja();
  const [lend, raro, comum] = L.premios().filter((p) => p.provaId === 'historia-3bim');
  // P de mentira: só regProva e estado, como a Loja passa
  const P = (reg, loja) => ({ regProva: () => reg, estado: () => ({ loja: loja || {} }) });
  assert.strictEqual(L.estadoPremio(lend, P({ tentativas: 1, notas: [4] })), 'bloqueado');
  const ganhouRaro = { tentativas: 2, notas: [4, 9], premio: 'raro' };
  assert.strictEqual(L.estadoPremio(raro, P(ganhouRaro)), 'ganho');
  assert.strictEqual(L.estadoPremio(lend, P(ganhouRaro)), 'aVenda');
  assert.strictEqual(L.estadoPremio(comum, P(ganhouRaro, { [comum.id]: true })), 'comprado');
  assert.strictEqual(L.estadoPremio(lend, null), 'bloqueado');
});

test('compra com estrelas: cobra só com saldo; recusa não mexe no saldo; estrelas estragadas não dão nada de graça', () => {
  const j = comLoja();                              // 29 estrelas
  const { L, P } = j;
  assert.strictEqual(P.gastarEstrelas(L.enfeite('flor').preco), true);
  assert.strictEqual(P.estrelas(), 21);
  assert.strictEqual(P.gastarEstrelas(L.enfeite('asasFada').preco), false);
  assert.strictEqual(P.estrelas(), 21);
  assert.strictEqual(P.gastarEstrelas(21), true);
  assert.strictEqual(P.estrelas(), 0);
  assert.strictEqual(P.gastarEstrelas(1), false);
  const k = comLoja((s) => { s.estrelas = { ganhas: 'muitas', gastas: 0 }; });
  assert.strictEqual(k.P.estrelas(), 0);
  assert.strictEqual(k.P.gastarEstrelas(k.L.enfeite('flor').preco), false);
});
