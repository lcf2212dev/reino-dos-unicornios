// Testes de unidade: o contrato do 2º andar do Laboratório de Química (js/sistemas/quimica-andar2.js, os grupos novos
// do save em js/sistemas/quimica.js e o interior quimica-2). Contrato: docs/contratos/quimica.md §9.
// Os dados de cada tela têm o teste da própria frente; aqui só a API, os ids do contrato e o save, com saves
// sintéticos (ajudantes/jogo-save.js); nada aqui toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/quimica-andar2.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');
const { Jogo: JS, montar } = require('./ajudantes/jogo-save');

function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return ctx.Reino;
}
// o jogo com o save de mentira: progresso + os dados e os sistemas da química
function comSave() {
  const j = montar({ agora: Date.UTC(2026, 8, 30) });
  if (!j.R.registrarModulo) j.R.registrarModulo = function () {};
  const nomes = ['sistemas/progresso-campos'].concat(Jogo.manifesto.scripts.filter((s) => /conteudo\/quimica\//.test(s.js) && !/icones/.test(s.js))
    .map(Jogo.nome), ['sistemas/quimica', 'sistemas/quimica-andar2']);
  nomes.forEach((n) => vm.runInContext(fs.readFileSync(JS.arquivo(n), 'utf8'), j.ctx, { filename: n }));
  j.P.carregar();
  return j;
}
const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);
const ids = (l) => l.map((x) => x.id);

test('quimica-2: os ids do contrato (7 mudanças, 6 ferramentas, 6 misturas, 8 livros, 4 materiais)', () => {
  const Q = carregar().Quimica;
  igual(ids(Q.materiais()), ['agua', 'chocolate', 'manteiga', 'vela']);
  igual(ids(Q.mudancas()).sort(), ['agua-condensar', 'agua-congelar', 'agua-derreter', 'agua-ferver',
    'chocolate-derreter', 'manteiga-derreter', 'vela-derreter']);
  igual(ids(Q.ferramentas()), ['coador', 'mao', 'peneira', 'sol', 'ima', 'esperar']);
  igual(ids(Q.misturas()), ['cafe', 'feijao', 'areia-pedras', 'agua-sal', 'areia-ferro', 'agua-barrenta']);
  igual(ids(Q.livros()), ['cozinha', 'ar', 'fogo', 'ferrugem', 'agua', 'planta', 'corpo', 'cientistas']);
  Q.misturas().forEach((m) => {
    assert.ok(m.certas.length >= 1, m.id + ': pelo menos uma ferramenta certa');
    m.certas.forEach((f) => assert.ok(Q.ferramenta(f), m.id + ': ferramenta inexistente ' + f));
  });
  Q.mudancas().forEach((m) => assert.ok(Q.material(m.material), m.id + ': material inexistente'));
  Q.curiosidades().forEach((c) => assert.ok(Q.TEMAS_CURIOSIDADE.includes(c.tema), c.id + ': tema fora do contrato ' + c.tema));
});

test('quimica-2: estadoEm e mudancaEntre (a água faz o ciclo; o chocolate endurecendo não é descoberta)', () => {
  const Q = carregar().Quimica;
  assert.strictEqual(Q.estadoEm('agua', -10), 'solido');
  assert.strictEqual(Q.estadoEm('agua', 0), 'liquido');
  assert.strictEqual(Q.estadoEm('agua', 99), 'liquido');
  assert.strictEqual(Q.estadoEm('agua', 100), 'gas');
  assert.strictEqual(Q.estadoEm('vela', 100), 'liquido');   // só a água vira gás no Fogão
  assert.strictEqual(Q.estadoEm('nada', 10), null);
  assert.strictEqual(Q.mudancaEntre('agua', 'gas', 'liquido').id, 'agua-condensar');
  assert.strictEqual(Q.mudancaEntre('chocolate', 'liquido', 'solido'), null);
});

test('quimica-2: separa (pura) e curiosidade sem repetir na sessão, por tema, com recomeço', () => {
  const Q = carregar().Quimica;
  assert.strictEqual(Q.separa('cafe', 'coador'), true);
  assert.strictEqual(Q.separa('cafe', 'ima'), false);
  assert.strictEqual(Q.separa('cafe', 'nada'), false);
  assert.strictEqual(Q.separa('nada', 'coador'), false);
  Q.reiniciarCuriosidades();
  const todas = Q.curiosidades(), vistas = new Set();
  for (let i = 0; i < todas.length; i++) {
    const c = Q.curiosidade('todas');
    assert.ok(!vistas.has(c.id), 'repetiu ' + c.id + ' antes de contar todas');
    vistas.add(c.id);
  }
  assert.ok(Q.curiosidade('todas'), 'depois de todas, recomeça');
  const tema = todas[0].tema;
  assert.strictEqual(Q.curiosidade(tema).tema, tema);
  assert.ok(Q.curiosidade('tema-que-nao-existe'), 'tema sem curiosidade cai em todas');
});

test('quimica-2: vozes (Caramela no Fogão e na Mesa; Carbono nos livros e curiosidades; Proveta no térreo)', () => {
  const Q = carregar().Quimica;
  assert.strictEqual(Q.vozDe('estados.oi'), 'npc-quimica-caramela');
  assert.strictEqual(Q.vozDe('separar'), 'npc-quimica-caramela');
  assert.strictEqual(Q.vozDe('livros.oi'), 'npc-quimica-carbono');
  assert.strictEqual(Q.vozDe('bancada.oi'), 'npc-quimica-proveta');
  const falas = Q.falas();
  const de = (texto) => falas.filter((f) => f.texto === texto).map((f) => f.voz);
  const c = Q.curiosidades()[0];
  assert.ok(de(c.paginas[0]).includes('npc-quimica-carbono'), 'curiosidade na voz do Carbono');
  assert.ok(de(Q.frase('estados.oi')[0]).includes('npc-quimica-caramela'), 'frase do Fogão na voz da Caramela');
  falas.forEach((f) => assert.strictEqual(f.pacote, 'interior-quimica'));
});

test('quimica-2: descobrir nos grupos novos dá as estrelas da 1ª vez, uma vez só; contagem soma os grupos', () => {
  const j = comSave(), Q = j.R.Quimica, cfg = j.R.config.quimica;
  const antes = j.P.estrelas();
  igual(Q.descobrir('estados', 'agua-ferver'), { nova: true, estrelas: cfg.estrelasEstadoNovo, completo: false });
  igual(Q.descobrir('estados', 'agua-ferver'), { nova: false, estrelas: 0, completo: false });
  igual(Q.descobrir('separar', 'cafe'), { nova: true, estrelas: cfg.estrelasMisturaNova, completo: false });
  igual(Q.descobrir('livros', 'fogo'), { nova: true, estrelas: cfg.estrelasLivroNovo, completo: false });
  igual(Q.descobrir('livros', 'nao-existe'), { nova: false, estrelas: 0, completo: false });
  igual(Q.descobrir('grupo-que-nao-existe', 'fogo'), { nova: false, estrelas: 0, completo: false });
  assert.strictEqual(j.P.estrelas() - antes, cfg.estrelasEstadoNovo + cfg.estrelasMisturaNova + cfg.estrelasLivroNovo);
  igual(j.P.estado().quimica.estados, { 'agua-ferver': 1 });
  const c = Q.contagem();
  igual(c.estados, { feitas: 1, total: Q.mudancas().length });
  igual(c.separar, { feitas: 1, total: Q.misturas().length });
  igual(c.livros, { feitas: 1, total: Q.livros().length });
  igual(c.receitas.feitas, 0);
});

test('quimica-2: o interior e as escadas do contrato', () => {
  const R = carregar(), I = R.Interiores;
  const d = R.interiores.find((x) => x.id === 'quimica-2');
  assert.ok(d, 'interior quimica-2');
  assert.strictEqual(d.lugar, 'quimica');
  assert.strictEqual(d.pacote, 'interior-quimica');
  assert.ok(!d.entrada && !d.saida, 'sem saída para o mapa');
  igual(d.comodos.map((c) => c.id), ['cozinha', 'curiosidades', 'biblioteca']);
  igual({ ...I.chegadaVindoDe('quimica-2', 'quimica') }, { x: 21, y: 11 });
  igual({ ...I.chegadaVindoDe('quimica', 'quimica-2') }, { x: 21, y: 4 });
  const chaves = d.objetos.filter((o) => o.acao && o.acao.tipo === 'tela').map((o) => o.chave + ':' + o.acao.tela).sort();
  igual(chaves, ['estante-livros:quimica-livros', 'fogao:quimica-estados', 'mesa-separar:quimica-separar']);
  const npcs = d.npcs.map((n) => n.id + '@' + n.x + ',' + n.y).sort();
  igual(npcs, ['quimica-caramela@7,6', 'quimica-carbono@24,6']);
});
