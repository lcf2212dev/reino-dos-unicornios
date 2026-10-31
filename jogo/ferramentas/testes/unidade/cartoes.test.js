// Testes de unidade: os cartões de experiência do Laboratório (js/sistemas/cartoes.js) e o que eles mudam na química
// (js/sistemas/quimica.js). Contrato: docs/contratos/quimica.md §10. Derivados das salas feitas desde
// config.cartoes.desde (sem campo no save); saves sintéticos (ajudantes/jogo-save.js), nada aqui toca no save real.
// Os testes da regra trocam os cartões de verdade por 3 sintéticos; o último confere o contrato dos dados reais.
// Rodar: node --test jogo/ferramentas/testes/unidade/cartoes.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');
const { Jogo: JS, montar } = require('./ajudantes/jogo-save');

const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);
const ids = (l) => l.map((x) => x.id);

// o jogo com o save de mentira: progresso + os dados e os sistemas da química e dos cartões
function comSave(sinteticos = true) {
  const j = montar({ agora: Date.UTC(2026, 9, 31) });
  if (!j.R.registrarModulo) j.R.registrarModulo = function () {};
  const nomes = ['sistemas/progresso-campos'].concat(Jogo.manifesto.scripts.filter((s) => /conteudo\/quimica\//.test(s.js) && !/icones/.test(s.js))
    .map(Jogo.nome), ['sistemas/quimica', 'sistemas/cartoes']);
  nomes.forEach((n) => vm.runInContext(fs.readFileSync(JS.arquivo(n), 'utf8'), j.ctx, { filename: n }));
  j.P.carregar();
  if (sinteticos) {
    const Q = j.R.QUIMICA;
    Q.receitas = Q.receitas.filter((r) => !r.cartao);
    Q.ingredientes = Q.ingredientes.filter((g) => !g.cartao);
    Q.ingredientes.push({ id: 't-a', nome: 'Pó A', cor: '#ff0000', tipo: 'po', cartao: true, fala: 'O pó A é vermelho.' },
      { id: 't-b', nome: 'Pó B', cor: '#00ff00', tipo: 'po', cartao: true, fala: 'O pó B é verde.' });
    const base = { efeito: 'cor', cor: '#ffffff', emoji: '🌸', acontece: 'Mudou de cor!', explica: ['a', 'b', 'c'], dica: 'Uma dica boa.' };
    Q.receitas.push(Object.assign({ id: 't-1', nome: 'Um', cartao: 1, ordem: 101, ingredientes: ['vinagre', 't-a'] }, base),
      Object.assign({ id: 't-2', nome: 'Dois', cartao: 2, ordem: 102, ingredientes: ['t-a', 't-b'] }, base),
      Object.assign({ id: 't-3', nome: 'Três', cartao: 3, ordem: 103, ingredientes: ['agua', 't-b'] }, base));
  }
  return j;
}
// salas de verdade (as primeiras de cada matéria), para marcar como feitas
function salas(R, n) {
  const l = [];
  R.materias.forEach((m) => m.salas.forEach((s) => { if (!l.includes(s.id)) l.push(s.id); }));
  return l.slice(0, n);
}
const desde = () => new Date(2026, 9, 5).getTime();   // config.cartoes.desde, hora local
function feita(j, id, quando) { j.P.estado().salas[id] = { vezes: 1, melhor: 0, feita: quando }; }

test('cartoes: contam só as salas feitas desde config.cartoes.desde (início do dia, hora local)', () => {
  const j = comSave(), C = j.R.Cartoes, [s1, s2, s3] = salas(j.R, 3);
  assert.strictEqual(j.R.config.cartoes.desde, '2026-10-05');
  assert.strictEqual(C.ganhos(), 0);
  feita(j, s1, desde() - 1);
  assert.strictEqual(C.ganhos(), 0, 'feita um instante antes não conta');
  assert.strictEqual(C.daSala(s1), 0);
  feita(j, s2, desde());
  assert.strictEqual(C.ganhos(), 1, 'à meia-noite já conta');
  assert.strictEqual(C.daSala(s2), 1);
  feita(j, s3, desde() + 5000);
  assert.strictEqual(C.ganhos(), 2);
  igual(ids(C.lista()), ['t-1', 't-2', 't-3']);
  assert.strictEqual(C.cartao(2).id, 't-2');
  assert.strictEqual(C.cartao(9), null);
  assert.ok(C.ganho('t-1') && C.ganho('t-2') && !C.ganho('t-3'));
  assert.ok(!C.ganho('pof'), 'receita sem cartão não é "ganha"');
});

test('cartoes: a ordem é a de feita (empate pelo id); sala sem cartão (acabaram) dá 0', () => {
  const j = comSave(), C = j.R.Cartoes, l = salas(j.R, 5);
  const t = desde() + 1000;
  feita(j, l[0], t + 300);
  feita(j, l[1], t + 100);
  feita(j, l[2], t + 200);
  igual([C.daSala(l[1]), C.daSala(l[2]), C.daSala(l[0])], [1, 2, 3]);
  feita(j, l[3], t + 400);
  assert.strictEqual(C.daSala(l[3]), 0, 'o 4º cartão não existe');
  assert.strictEqual(C.ganhos(), 3);
  assert.strictEqual(C.daSala('nao-existe'), 0);
  // empate: pelo id
  const j2 = comSave(), dois = salas(j2.R, 2).slice().sort();
  feita(j2, dois[1], t); feita(j2, dois[0], t);
  igual([j2.R.Cartoes.daSala(dois[0]), j2.R.Cartoes.daSala(dois[1])], [1, 2]);
});

test('cartoes: produtosNovos (só os que nenhum cartão anterior usa) e liberado', () => {
  const j = comSave(), C = j.R.Cartoes, Q = j.R.Quimica, [s1, s2] = salas(j.R, 2);
  igual(ids(C.produtosNovos(1)), ['t-a']);
  igual(ids(C.produtosNovos(2)), ['t-b'], 't-a já veio no 1');
  igual(ids(C.produtosNovos(3)), [], 't-b já veio no 2; água não é de cartão');
  igual(C.produtosNovos(7), []);
  assert.ok(C.liberado('vinagre'), 'sem cartão: sempre');
  assert.ok(!C.liberado('t-a') && !C.liberado('t-b') && !C.liberado('nao-existe'));
  assert.ok(!ids(Q.ingredientes()).includes('t-a'), 'a bancada esconde o produto preso');
  feita(j, s1, desde() + 10);
  assert.ok(C.liberado('t-a') && !C.liberado('t-b'));
  assert.ok(ids(Q.ingredientes()).includes('t-a') && !ids(Q.ingredientes()).includes('t-b'));
  assert.ok(C.novoNaBancada('t-a'), 'recém-chegado: selo Novo!');
  feita(j, s2, desde() + 20);
  assert.ok(C.liberado('t-b'));
});

test('cartoes: o que ela já usou nunca some (receita descoberta libera o produto, mesmo sem as salas)', () => {
  const j = comSave(), C = j.R.Cartoes, Q = j.R.Quimica, [s1] = salas(j.R, 1);
  feita(j, s1, desde() + 10);
  assert.strictEqual(Q.descobrir('receitas', 't-1').nova, true);
  assert.ok(!C.novoNaBancada('t-a'), 'já usado: sem selo');
  delete j.P.estado().salas[s1];   // como num Novo ciclo: as salas zeram
  assert.strictEqual(C.ganhos(), 0);
  assert.ok(C.liberado('t-a'), 'a receita descoberta segura o produto');
  assert.ok(ids(Q.receitas()).includes('t-1'), 'e a receita continua no caderno');
  assert.ok(Q.noCaderno('t-1'));
});

test('cartoes: a química esconde as receitas de cartão não ganhas e recusa descobri-las', () => {
  const j = comSave(), Q = j.R.Quimica, [s1] = salas(j.R, 1);
  const base = ids(Q.receitas());
  assert.ok(!base.some((id) => /^t-/.test(id)));
  igual(ids(Q.todasReceitas()).slice(-3), ['t-1', 't-2', 't-3'], 'todasReceitas: todas, por ordem');
  assert.ok(!Q.noCaderno('t-1'));
  igual({ ...Q.descobrir('receitas', 't-1') }, { nova: false, estrelas: 0, completo: false });
  assert.ok(!(j.P.estado().quimica.receitas || {})['t-1'], 'não gravou');
  assert.strictEqual(Q.misturar(['vinagre', 'sal']).tipo !== 'receita', true);
  feita(j, s1, desde() + 10);
  igual(ids(Q.receitas()), base.concat(['t-1']));
  assert.ok(Q.noCaderno('t-1') && !Q.descoberto('receitas', 't-1'), 'escrito no caderno: Experimente!');
  assert.strictEqual(Q.misturar(['t-a', 'vinagre']).receita.id, 't-1');
  igual({ ...Q.contagem().receitas }, { feitas: 0, total: base.length + 1 });
  // as falas listam tudo (para gravar a voz antes de ela ganhar)
  const textos = Q.falas().map((f) => f.texto);
  assert.ok(textos.includes('O pó B é verde.'), 'fala do produto ainda preso');
});

test('cartoes: o caderno completo conta só as receitas sem cartão e as estrelas dele não se repetem', () => {
  const j = comSave(), Q = j.R.Quimica, c = j.R.config.quimica, l = salas(j.R, 3);
  l.forEach((id, i) => feita(j, id, desde() + i));
  const base = Q.receitas().filter((r) => !r.cartao).map((r) => r.id);
  const ultimo = base.pop();
  base.forEach((id) => Q.descobrir('receitas', id));
  assert.ok(!Q.cadernoCompleto());
  igual({ ...Q.descobrir('receitas', 't-1') }, { nova: true, estrelas: c.estrelasReceitaNova, completo: false });
  igual({ ...Q.descobrir('receitas', ultimo) }, { nova: true, estrelas: c.estrelasReceitaNova + c.estrelasCadernoCompleto, completo: true });
  assert.ok(Q.cadernoCompleto(), 'completo sem os cartões t-2 e t-3');
  igual({ ...Q.descobrir('receitas', 't-2') }, { nova: true, estrelas: c.estrelasReceitaNova, completo: false }, 'sem bônus de novo');
});

test('cartoes: os dados de verdade seguem o contrato (cartao 1..N, ordem 100 + n, produtos usados)', () => {
  const j = comSave(false), C = j.R.Cartoes, Q = j.R.Quimica;
  const l = C.lista();
  igual(l.map((r) => r.cartao), l.map((_, i) => i + 1), 'cartão 1..N sem buraco');
  l.forEach((r) => {
    assert.strictEqual(r.ordem, 100 + r.cartao, r.id + ': ordem');
    r.ingredientes.forEach((g) => assert.ok(Q.ingrediente(g), r.id + ': ingrediente ' + g));
  });
  const usados = new Set(l.flatMap((r) => r.ingredientes));
  (j.R.QUIMICA.ingredientes || []).filter((g) => g.cartao).forEach((g) => assert.ok(usados.has(g.id), g.id + ': nenhum cartão traz'));
  // todo produto de cartão sai do baú uma vez só, no 1º cartão que o usa
  const saem = l.flatMap((r) => ids(C.produtosNovos(r.cartao)));
  assert.strictEqual(new Set(saem).size, saem.length);
  assert.strictEqual(saem.length, (j.R.QUIMICA.ingredientes || []).filter((g) => g.cartao).length);
  // as falas do baú do Claude: até 30 letras e 3+ palavras
  Object.values(C.FALAS).forEach((t) => assert.ok(t.length <= 30 && t.split(' ').length >= 3, t));
});
