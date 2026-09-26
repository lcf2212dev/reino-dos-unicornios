// Testes de unidade: o registro dos módulos (js/nucleo/modulos.js). Um módulo de mentira registrado no vm
// aparece em Reino.Falas.todas() com voz e pacote padrão, e os módulos reais seguem a ordem do manifesto.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/modulos.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

// todos os scripts `node: true`, como o listar-falas.js (banho.js não é node: fica de fora aqui)
function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return ctx.Reino;
}

test('ordem dos módulos reais: a do manifesto (cuidados, surpresa, fotos)', () => {
  const R = carregar();
  // os de hoje primeiro; um sistema novo (npm run novo -- sistema) entra depois deles
  assert.deepStrictEqual(Array.from(R.modulos, (m) => m.id).slice(0, 3), ['cuidados', 'surpresa', 'fotos']);
  assert.strictEqual(R.modulo('surpresa'), R.modulos[1]);
  assert.strictEqual(R.modulo('nada'), undefined);
  // o banho se registra depois deles, no navegador (manifesto: sistemas/banho.js vem depois de fotos.js)
  const nomes = Jogo.manifesto.scripts.map(Jogo.nome);
  const pos = ['sistemas/cuidados', 'sistemas/surpresa', 'sistemas/fotos', 'sistemas/banho'].map((n) => nomes.indexOf(n));
  assert.deepStrictEqual(pos.slice().sort((a, b) => a - b), pos);
  assert.ok(nomes.indexOf('nucleo/modulos') < pos[0]);
});

test('módulo novo: falas entram em Falas.todas() com voz e pacote padrão, e o pacote dele se trouxer', () => {
  const R = carregar();
  R.registrarModulo({ id: 'teste', falas: () => [{ texto: 'Oi, módulo de mentira!' }, { texto: 'Outra fala.', voz: 'narradora', pacote: 'interior-teste' }] });
  const todas = R.Falas.todas();
  const a = todas.find((f) => f.texto === 'Oi, módulo de mentira!');
  const b = todas.find((f) => f.texto === 'Outra fala.');
  assert.ok(a && b);
  assert.strictEqual(a.voz, 'claude');
  assert.strictEqual(a.pacote, 'geral');
  assert.strictEqual(b.voz, 'narradora');
  assert.strictEqual(b.pacote, 'interior-teste');
  // depois das falas dos módulos reais (a ordem do falas.json não muda)
  const ultimaFoto = R.Fotos.falas().slice(-1)[0].texto;
  assert.ok(todas.findIndex((f) => f.texto === ultimaFoto) < todas.indexOf(a));
});
