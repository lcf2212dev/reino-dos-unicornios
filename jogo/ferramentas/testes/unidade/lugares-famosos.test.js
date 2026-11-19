// Testes de unidade: as 12 miniaturas de lugares famosos do Mercado da Garagem (dados em js/conteudo/casa/lugares.js,
// desenhos em js/interiores/casa/lugares-a|b.js; pedidos/2026-11-19-garagem-construcoes.md). O jogo inteiro (todos os
// `node: true`) num vm, sem navegador nem save: registro, ids, objeto, preço, loja, cômodo, nomes, fora do sorteio e o
// desenho dentro da pegada (um ctx de mentira que só conta os fillRect).
// Rodar: node --test jogo/ferramentas/testes/unidade/lugares-famosos.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

function jogo() {
  const ctx = Jogo.contexto({ console, setTimeout, clearTimeout, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return ctx.Reino;
}
const R = jogo();
const lugares = () => R.moveisCasa.filter((m) => m.loja === 'lugares');

// ctx de mentira: guarda a caixa de cada fillRect (sem transformação: as maquetes só têm a direção baixo)
function medir(def) {
  const T = 16, W = def.w * T, H = def.h * T, topo = def.topo || 0, caixas = [];
  const ctx = { fillStyle: '', fillRect(x, y, w, h) { if (w > 0 && h > 0) caixas.push([x, y, w, h, this.fillStyle]); } };
  def.desenhar(ctx, 0, 0, { x: 0, y: 0, w: def.w, h: def.h, dir: 'baixo', tipo: '' }, null);
  const fora = caixas.filter(([x, y, w, h]) => x < 0 || y < -topo || x + w > W || y + h > H);
  const cores = new Set(caixas.map((c) => c[4]));
  return { caixas: caixas.length, fora, cores };
}

test('lugares: 12 registrados na loja "lugares", cômodo garagem, preço de 60 a 200, nomes curtos e únicos', () => {
  const l = lugares();
  assert.strictEqual(l.length, 12, '12 lugares famosos');
  assert.ok(R.config.casa.comodos.includes('garagem'), 'garagem em config.casa.comodos');
  const outros = new Set(R.moveisCasa.filter((m) => m.loja !== 'lugares').map((m) => m.nome.toLowerCase()));
  R.kitsCasa.forEach((k) => k.itens.forEach((i) => outros.add(i.nome.toLowerCase())));
  const ids = new Set(), nomes = new Set();
  for (const m of l) {
    assert.match(m.id, /^lugar-[a-z0-9-]+$/, `${m.id}: id lugar-<nome>, sem ponto`);
    assert.ok(!ids.has(m.id), `${m.id}: repetido`); ids.add(m.id);
    assert.strictEqual(m.objeto, `casa-movel-${m.id}`, `${m.id}: objeto casa-movel-<id>`);
    assert.strictEqual(m.comodo, 'garagem', `${m.id}: cômodo garagem`);
    assert.strictEqual(m.direcoes, 1, `${m.id}: não gira`);
    assert.ok(!m.parede, `${m.id}: de chão`);
    assert.ok(Number.isInteger(m.preco) && m.preco >= 60 && m.preco <= 200, `${m.id}: preço ${m.preco} de 60 a 200`);
    assert.ok(m.nome.length >= 3 && m.nome.length <= 14 && !/\p{Extended_Pictographic}/u.test(m.nome), `${m.id}: nome "${m.nome}"`);
    assert.ok(!nomes.has(m.nome.toLowerCase()) && !outros.has(m.nome.toLowerCase()), `${m.id}: nome "${m.nome}" repetido`);
    nomes.add(m.nome.toLowerCase());
    assert.ok(typeof m.pais === 'string' && m.pais.length >= 3, `${m.id}: país`);
    assert.strictEqual(R.CasaUsos.uso(m.objeto), null, `${m.id}: enfeite, sem uso`);
  }
  // degraus: as baratas e as caras existem
  const precos = l.map((m) => m.preco);
  assert.strictEqual(Math.min(...precos), 60); assert.strictEqual(Math.max(...precos), 200);
});

test('lugares: fora do sorteio das salas e dos presentes (casa-moveis.js: só os sem loja)', () => {
  const sorteaveis = R.moveisCasa.filter((m) => !m.loja).map((m) => m.id);
  lugares().forEach((m) => assert.ok(!sorteaveis.includes(m.id), m.id));
});

test('lugares: cada desenho existe, é sólido e alto e fica dentro da pegada (com o topo)', () => {
  const OBJ = R._interiores.OBJETOS;
  for (const m of lugares()) {
    const def = OBJ[m.objeto];
    assert.ok(def && typeof def.desenhar === 'function', `${m.objeto}: registrado`);
    assert.ok([1, 2].includes(def.w) && def.h === 1, `${m.objeto}: pegada 1×1 ou 2×1`);
    assert.ok(def.solido === true && def.alto === true, `${m.objeto}: sólido e na ordem por Y`);
    assert.ok(def.topo >= 12 && def.topo <= 24, `${m.objeto}: topo ${def.topo} (até 1,5 tile acima, como os móveis altos)`);
    const r = medir(def);
    assert.ok(r.caixas > 150, `${m.objeto}: desenhou (${r.caixas} retângulos)`);
    assert.deepStrictEqual(r.fora, [], `${m.objeto}: pixel fora da pegada`);
    assert.ok(r.cores.has(R.Desenho.K), `${m.objeto}: contorno #3a2446`);
    for (const c of r.cores) assert.match(String(c), /^#[0-9a-f]{6}$/i, `${m.objeto}: cor chapada (${c})`);
  }
});
