// Testes de unidade: o Laboratório de Química (js/sistemas/quimica.js e os dados de js/conteudo/quimica/).
// Contrato: docs/contratos/quimica.md. Mistura (pura), dados (receitas, tabela, cartões, falas) e o save (descobrir,
// estrelas, mescla), com saves sintéticos (ajudantes/jogo-save.js); nada aqui toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/quimica.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');
const { Jogo: JS, montar, saveHoje } = require('./ajudantes/jogo-save');

// o jogo inteiro (todos os `node: true`), para os dados e a mistura
function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return ctx.Reino;
}
// o jogo com o save de mentira: progresso + os dados e o sistema da química
function comSave() {
  const j = montar({ agora: Date.UTC(2026, 8, 30) });
  if (!j.R.registrarModulo) j.R.registrarModulo = function () {};
  const nomes = ['sistemas/progresso-campos'].concat(Jogo.manifesto.scripts.filter((s) => /conteudo\/quimica\//.test(s.js) && !/icones/.test(s.js))
    .map(Jogo.nome), ['sistemas/quimica']);
  nomes.forEach((n) => vm.runInContext(fs.readFileSync(JS.arquivo(n), 'utf8'), j.ctx, { filename: n }));
  j.P.carregar();
  return j;
}
// o vm tem outro Array: compara pela cópia em JSON
const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);
const ids = (l) => l.map((x) => x.id);
// letras como o validador conta (validar-interiores.js): sem «» e sem emoji
const letras = (v) => v.replace(/[«»]/g, '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').trim().length;
const EFEITOS = ['explosao', 'vulcao', 'cor', 'espuma-gigante', 'dissolver', 'camadas', 'gotas', 'redemoinho', 'bolhas', 'precipitado', 'deposito', 'efervescencia', 'gases'];

test('quimica: catálogo ampliado (21 receitas, 24 + 25 cartões, 118 casas, 6 lições, 8 lâminas)', () => {
  const Q = carregar().Quimica;
  igual(ids(Q.receitas()), ['pof', 'vulcao', 'pocao-rosa', 'pocao-verde', 'elefante', 'agua-do-mar',
    'camadas', 'chuva-de-cores', 'leite-magico', 'bolhas', 'vermelho-ferrico', 'amido-azul',
    'sal-azul', 'sal-magnesio', 'neve-calcario', 'citrico-bolhas', 'acucar-agua', 'cobre-novo',
    'mistura-ar', 'gases-estrelas', 'agua-gas']);
  igual(Q.receitas().map((r) => r.ordem), Array.from({ length: 21 }, (_, i) => i + 1));
  // 24 cartões sempre abertos e os 25 do prêmio da trilha perfeita (quarto-bimestre.md §14.4), cada um com a sua sala
  igual(Q.elementos().filter((e) => !e.trilha).map((e) => e.z), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 26, 29, 47, 79]);
  const TRILHA = { 30: 'lp10a1', 50: 'lp10a2', 53: 'lp10a3', 22: 'lp10a4', 37: 'lp10a5', 74: 'lp10a6', 25: 'lp10a7', 35: 'lp10t1',
    24: 'lp10t2', 28: 'lp11a1', 32: 'lp11a2', 27: 'lp11a3', 57: 'lp11a4', 31: 'lp11a5', 36: 'lp11a6', 34: 'lp11t1', 60: 'lp11t2',
    78: 'lp12a1', 38: 'lp12a2', 82: 'lp12a3', 80: 'lp12a4', 56: 'lp12a5', 42: 'lp12a6', 54: 'lp12t1', 83: 'lp12t2' };
  igual(Object.fromEntries(Q.elementos().filter((e) => e.trilha).map((e) => [e.z, e.trilha])), TRILHA);
  assert.strictEqual(Q.elementos().length, 49);
  assert.strictEqual(Q.tabela().length, 118);
  igual(ids(Q.licoes().sort((a, b) => a.ordem - b.ordem)), ['atomos', 'elemento', 'moleculas', 'estados', 'acidos-bases', 'mistura-reacao']);
  igual(ids(Q.laminas()), ['sal', 'acucar', 'folha', 'cebola', 'polen', 'areia', 'algodao', 'neve']);
  assert.strictEqual(Q.ingredientes().length, 32);
});

test('quimica: receitas bem formadas (ingredientes existem, efeito da lista, sem conjunto repetido, só a pof inicial)', () => {
  const Q = carregar().Quimica;
  const vistos = {};
  Q.receitas().forEach((r) => {
    assert.ok(r.ingredientes.length === 2 || r.ingredientes.length === 3, r.id + ': 2 ou 3 ingredientes');
    r.ingredientes.forEach((g) => assert.ok(Q.ingrediente(g), r.id + ': ingrediente inexistente ' + g));
    assert.strictEqual(new Set(r.ingredientes).size, r.ingredientes.length, r.id + ': ingrediente repetido');
    assert.ok(EFEITOS.includes(r.efeito), r.id + ': efeito fora da lista ' + r.efeito);
    assert.match(r.cor, /^#[0-9a-f]{6}$/, r.id + ': cor');
    if (r.cor2) assert.match(r.cor2, /^#[0-9a-f]{6}$/, r.id + ': cor2');
    assert.ok(r.explica.length >= 3 && r.explica.length <= 6, r.id + ': explica com 3 a 6 páginas');
    assert.strictEqual(typeof r.acontece, 'string');
    assert.strictEqual(typeof r.dica, 'string');
    const k = r.ingredientes.slice().sort().join('+');
    assert.ok(!vistos[k], r.id + ': mesmo conjunto de ' + vistos[k]);
    vistos[k] = r.id;
  });
  igual(Q.receitas().filter((r) => r.inicial).map((r) => r.id), ['pof']);
  igual(Q.receita('pof').ingredientes.slice().sort(), ['bicarbonato', 'vinagre']);
});

test('quimica: misturar em qualquer ordem e com repetição acha a receita', () => {
  const Q = carregar().Quimica;
  Q.receitas().forEach((r) => {
    const ao = r.ingredientes.slice().reverse();
    assert.strictEqual(Q.misturar(ao).receita.id, r.id, r.id + ' ao contrário');
    assert.strictEqual(Q.misturar(ao.concat([ao[0]])).tipo, 'receita', r.id + ' com repetição');
    assert.strictEqual(Q.misturar(ao.concat([ao[0]])).receita.id, r.id);
  });
  assert.strictEqual(Q.misturar(['vinagre', 'vinagre', 'bicarbonato']).receita.id, 'pof');
});

test('quimica: desconhecida é nada; vazio; falta e sobra um ingrediente', () => {
  const Q = carregar().Quimica;
  igual({ ...Q.misturar(['sal', 'leite']) }, { receita: null, quase: null, tipo: 'nada' });
  assert.strictEqual(Q.misturar([]).tipo, 'vazio');
  assert.strictEqual(Q.misturar(['nao-existe']).tipo, 'vazio');
  const f = Q.misturar(['oxigenada', 'fermento']);
  assert.strictEqual(f.tipo, 'falta');
  assert.strictEqual(f.quase.id, 'elefante');
  assert.strictEqual(Q.misturar(['leite', 'detergente']).quase.id, 'leite-magico');
  const s = Q.misturar(['repolho', 'limao', 'sal']);
  assert.strictEqual(s.tipo, 'sobra');
  assert.strictEqual(s.quase.id, 'pocao-rosa');
});

test('quimica: descobrir grava, dá estrelas só na 1ª vez e o bônus do caderno completo uma vez', () => {
  const j = comSave();
  const Q = j.R.Quimica, c = j.R.config.quimica;
  const antes = j.P.estrelas();
  assert.ok(Q.noCaderno('pof') && !Q.descoberto('receitas', 'pof'), 'a pof já vem no caderno');
  assert.ok(!Q.noCaderno('vulcao'));
  const r1 = Q.descobrir('receitas', 'vulcao');
  igual({ ...r1 }, { nova: true, estrelas: c.estrelasReceitaNova, completo: false });
  assert.strictEqual(j.lido().quimica.receitas.vulcao, 1, 'gravou no save');
  assert.ok(Q.noCaderno('vulcao'));
  igual({ ...Q.descobrir('receitas', 'vulcao') }, { nova: false, estrelas: 0, completo: false });
  igual({ ...Q.descobrir('receitas', 'nao-existe') }, { nova: false, estrelas: 0, completo: false });
  igual({ ...Q.descobrir('grupo-errado', 'pof') }, { nova: false, estrelas: 0, completo: false });
  assert.ok(!(j.lido().quimica.receitas || {})['nao-existe'], 'id inexistente não grava');
  const rs = Q.receitas().map((r) => r.id).filter((id) => id !== 'vulcao');
  const ultimo = rs.pop();
  rs.forEach((id) => assert.strictEqual(Q.descobrir('receitas', id).completo, false));
  const fim = Q.descobrir('receitas', ultimo);
  igual({ ...fim }, { nova: true, estrelas: c.estrelasReceitaNova + c.estrelasCadernoCompleto, completo: true });
  assert.ok(Q.cadernoCompleto());
  assert.strictEqual(Q.descobrir('receitas', ultimo).estrelas, 0, 'bônus uma vez só');
  assert.strictEqual(Q.descobrir('laminas', 'cebola').estrelas, c.estrelasLaminaNova);
  assert.strictEqual(Q.descobrir('licoes', 'atomos').estrelas, c.estrelasLicaoNova);
  assert.strictEqual(Q.descobrir('licoes', 'atomos').estrelas, 0);
  const total = 21 * c.estrelasReceitaNova + c.estrelasCadernoCompleto + c.estrelasLaminaNova + c.estrelasLicaoNova;
  assert.strictEqual(j.P.estrelas() - antes, total);
  igual({ ...Q.contagem().receitas }, { feitas: 21, total: 21 });
  igual({ ...Q.contagem().laminas }, { feitas: 1, total: 8 });
});

test('quimica: tabela com 118 casas, z 1..118, posições únicas e famílias que existem', () => {
  const Q = carregar().Quimica;
  const t = Q.tabela(), fam = Q.familias();
  igual(t.map((c) => c.z), Array.from({ length: 118 }, (_, i) => i + 1));
  assert.strictEqual(new Set(t.map((c) => c.linha + ',' + c.coluna)).size, 118, 'posição repetida');
  assert.strictEqual(new Set(t.map((c) => c.simbolo)).size, 118, 'símbolo repetido');
  t.forEach((c) => {
    assert.ok(fam[c.familia], c.simbolo + ': família ' + c.familia);
    assert.ok([1, 2, 3, 4, 5, 6, 7, 9, 10].includes(c.linha) && c.coluna >= 1 && c.coluna <= 18, c.simbolo + ': posição');
    if (c.linha >= 9) assert.ok(c.coluna >= 3 && c.coluna <= 17, c.simbolo + ': coluna da linha de baixo');
  });
  const casa = (z) => t.find((c) => c.z === z);
  igual([casa(57).linha, casa(57).coluna, casa(71).coluna], [9, 3, 17]);
  igual([casa(89).linha, casa(89).coluna, casa(103).coluna], [10, 3, 17]);
  igual([casa(26).linha, casa(26).coluna, casa(79).linha, casa(79).coluna], [4, 8, 6, 11]);
  assert.strictEqual(Object.keys(fam).length, 10);
  Object.keys(fam).forEach((k) => assert.match(fam[k].cor, /^#[0-9a-f]{6}$/, k));
  assert.strictEqual(new Set(Object.keys(fam).map((k) => fam[k].cor)).size, 10, 'uma cor por família');
});

test('quimica: cartões com família existente e iguais à casa da tabela', () => {
  const Q = carregar().Quimica;
  const fam = Q.familias();
  Q.elementos().forEach((e) => {
    const c = Q.tabela().find((x) => x.z === e.z);
    assert.ok(fam[e.familia], e.nome + ': família ' + e.familia);
    igual([e.simbolo, e.familia], [c.simbolo, c.familia], e.nome);
    assert.strictEqual(typeof e.onde, 'string');
    assert.ok(e.curiosidade.length >= 1 && e.curiosidade.length <= 3, e.nome + ': curiosidade 1 a 3');
  });
  assert.strictEqual(Q.elemento(79).nome, 'Ouro');
});

test('quimica: lições e lâminas bem formadas', () => {
  const Q = carregar().Quimica;
  Q.licoes().forEach((l) => {
    assert.ok(l.paginas.length >= 4 && l.paginas.length <= 7, l.id + ': 4 a 7 páginas');
    assert.ok(l.titulo && l.emoji && l.desenho, l.id);
  });
  Q.laminas().forEach((l) => {
    assert.ok(l.explica.length >= 2 && l.explica.length <= 4, l.id + ': explica 2 a 4');
    igual(Object.keys(l.aumentos).sort(), ['10', '100', '40'], l.id + ': aumentos');
  });
});

test('quimica: toda página falada com até 30 letras e 3+ palavras, sem fórmula', () => {
  const R = carregar();
  const falas = R.Quimica.falas();
  assert.ok(falas.length > 150, 'falas: ' + falas.length);
  const ruins = [];
  falas.forEach((f) => {
    if (letras(f.texto) > 30) ruins.push(`${letras(f.texto)} letras: "${f.texto}"`);
    if (f.texto.trim().split(/\s+/).length < 3) ruins.push(`menos de 3 palavras: "${f.texto}"`);
    if (/[A-Z][a-z]?[0-9₀-₉]/.test(f.texto)) ruins.push(`fórmula na fala (a voz fala por extenso): "${f.texto}"`);
    // térreo na voz da Doutora Proveta; 2º andar na do Professor Carbono ou da Dona Caramela (contrato §9)
    if (![R.Quimica.VOZ, R.Quimica.VOZ_CARBONO, R.Quimica.VOZ_CARAMELA].includes(f.voz)) ruins.push(`voz ${f.voz}: "${f.texto}"`);
  });
  igual(ruins, []);
});

test('quimica: mescla do campo quimica entre aparelhos une os dois lados', () => {
  const j = comSave();
  const a = Object.assign(saveHoje(), { atualizado: 2, quimica: { receitas: { pof: 1, vulcao: 1 }, laminas: { sal: 1 } } });
  const b = Object.assign(saveHoje(), { atualizado: 1, quimica: { receitas: { pof: 1, bolhas: 1 }, licoes: { atomos: 1 } } });
  const esperado = { receitas: { pof: 1, vulcao: 1, bolhas: 1 }, laminas: { sal: 1 }, licoes: { atomos: 1 } };
  igual(j.P.mesclar(a, b).quimica, esperado);
  igual(j.P.mesclar(b, a).quimica, esperado);
  const velho = saveHoje(); delete velho.quimica;
  igual(j.P.mesclar(velho, a).quimica, a.quimica, 'save antigo não apaga');
});


test('quimica: os produtos têm ids únicos e gases não viram líquidos nem reação de combustão', () => {
  const Q = carregar().Quimica;
  assert.strictEqual(new Set(ids(Q.ingredientes())).size, 32);
  assert.strictEqual(Q.ingrediente('cloreto-ferrico').nome, 'Cloreto férrico');
  for (const id of ['hidrogenio', 'oxigenio', 'nitrogenio', 'helio', 'gas-carbonico']) {
    assert.strictEqual(Q.ingrediente(id).tipo, 'gas');
    assert.strictEqual(Q.ingrediente(id).grupo, 'gases');
  }
  assert.strictEqual(Q.misturar(['hidrogenio', 'oxigenio']).receita, null);
  assert.strictEqual(Q.misturar(['cloreto-ferrico', 'tiocianato-potassio']).receita.id, 'vermelho-ferrico');
  assert.strictEqual(Q.misturar(['agua', 'ferro', 'sulfato-cobre']).receita.id, 'cobre-novo');
});

test('quimica: save do catálogo antigo mantém descobertas e libera novas páginas', () => {
  const j = comSave(), Q = j.R.Quimica;
  Q.receitas().slice(0, 10).forEach((r) => Q.descobrir('receitas', r.id));
  const antes = j.P.estrelas();
  igual(Q.contagem().receitas, { feitas: 10, total: 21 });
  assert.ok(!Q.cadernoCompleto());
  Q.receitas().slice(0, 10).forEach((r) => {
    assert.ok(Q.noCaderno(r.id));
    assert.strictEqual(Q.descobrir('receitas', r.id).estrelas, 0);
  });
  assert.strictEqual(j.P.estrelas(), antes);
  assert.ok(!Q.noCaderno('vermelho-ferrico'));
  assert.strictEqual(Q.descobrir('receitas', 'vermelho-ferrico').estrelas, j.R.config.quimica.estrelasReceitaNova);
});
