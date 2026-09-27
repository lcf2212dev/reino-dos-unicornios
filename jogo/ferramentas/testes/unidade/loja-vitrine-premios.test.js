// Loja das Fadas: na vitrine dos prêmios da Escola (loja/objetos.js, 'loja-vitrine-premios') as etiquetas de preço
// não podem se encavalar. Com 5 provas (15 prêmios) cada prateleira tem 5 colunas de 8 px e a etiqueta de dois
// algarismos tem 11 px: ganhar um prêmio de uma prova põe os outros dois à venda lado a lado e o "40" e o "25"
// saem um por cima do outro (ilegíveis). Onde a etiqueta não cabe vai a moedinha de 5 px (a da vitrine dos enfeites).
const test = require('node:test');
const assert = require('node:assert');
const { montar, ctxAnotador } = require('./ajudantes/predios');

test('vitrine dos prêmios: etiquetas de preço sem se encavalar', () => {
  const icone = { width: 16, height: 16 };
  const { R } = montar({ pa: { iconeDesenho: () => icone, silhueta: () => icone } });
  const lib = R.Interiores.OBJETOS['loja-vitrine-premios'];
  const o = R.Interiores.def('loja').objetos.find((x) => x.tipo === 'loja-vitrine-premios');
  // save sintético: ganhou o prêmio comum da 1ª prova; o lendário e o raro dela ficam à venda
  const primeira = R.provas[0].id;
  const P = {
    regProva: (pv) => (pv.id === primeira ? { tentativas: 3, notas: [9], premio: 'comum' } : { tentativas: 0, notas: [] }),
    estado: () => ({ loja: {} }),
  };
  const aVenda = R.LojaItens.premios().filter((a) => R.LojaItens.estadoPremio(a, P) === 'aVenda');
  assert.strictEqual(aVenda.length, 2);
  const ctx = ctxAnotador();
  lib.desenhar(ctx, o.x * 16, o.y * 16, o, P);
  // marca de preço de cada prêmio à venda: a etiqueta (fundo creme de 7 px, contorno de 1 px; etiquetaPreco em
  // loja/desenhos.js) ou, onde ela não cabe, a moedinha (miolo dourado 3×3, contorno de 1 px)
  const C = R.Interiores.desenho.C;
  const marcas = ctx.rets.filter((r) => (r.h === 7 && r.cor === C.creme) || (r.w === 3 && r.h === 3 && r.cor === C.ouro2))
    .map((r) => ({ x0: r.x - 1, x1: r.x + r.w + 1, y0: r.y - 1, y1: r.y + r.h + 1 }));
  assert.strictEqual(marcas.length, 2, 'uma marca de preço por prêmio à venda');
  const [a, b] = marcas;
  const encavalam = a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  assert.ok(!encavalam, `marcas de preço encavaladas: x [${a.x0}, ${a.x1}) e [${b.x0}, ${b.x1}), y [${a.y0}, ${a.y1}) e [${b.y0}, ${b.y1})`);
});
