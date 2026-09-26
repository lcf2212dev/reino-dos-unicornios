// Testes de unidade: o contrato de P.registrarCampo (campo NOVO do save declarado uma vez). Cada garantia roda
// PARA TODO campo de P.camposRegistrados() com o jogo inteiro no vm (os de verdade, uma feature de mentira num
// arquivo à parte e um campo de mentira por estratégia), com os exemplos do def ou do catálogo; e sem
// nenhum registro o save sai byte a byte igual ao da main 5cd2701 (progresso*.js tirados com git show).
// Alvo: js/sistemas/progresso*.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/save-campos.test.js   (tudo: npm test, na raiz do repositório)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const { Jogo, montar, saveAtual, saveHoje, copia } = require('./ajudantes/jogo-save');
const raiz = Jogo.raiz;
const ARQ_CAMPOS = path.join(raiz, 'js/sistemas/progresso-campos.js');

/* ---------- os campos de mentira (um por estratégia, mais um com função própria) ---------- */
// Os exemplos vêm do catálogo; tUniao e tProprio trazem os seus (`exemplos`), como um campo real pode trazer.
const CAMPOS = {
  tContadores: { padrao: () => ({}), mesclar: 'contadores', novoCiclo: 'mantem', copiaSeguranca: true },
  tCarimbo: { padrao: () => ({}), mesclar: 'carimbo', novoCiclo: 'zera', copiaSeguranca: true },
  tUniao: { padrao: () => [], mesclar: 'uniao', novoCiclo: 'mantem', copiaSeguranca: true, exemplos: [['concha', 'pena'], ['pena', 'pedra']] },
  tUniaoObj: { padrao: () => ({}), mesclar: 'uniao', novoCiclo: 'zera' },
  tMaior: { padrao: () => 0, mesclar: 'maior', novoCiclo: 'zera' },
  // função própria: fica o texto mais longo (exemplos obrigatórios)
  tProprio: { padrao: () => '', mesclar: (x, y) => (y.length > x.length ? y : x), limpar: (v) => (typeof v === 'string' ? v.slice(0, 20) : undefined),
    novoCiclo: 'mantem', copiaSeguranca: true, exemplos: ['Estrela', 'Estrelinha'] },
};
const PROMETE = { contadores: ['nadaSome', 'comutativa'], uniao: ['nadaSome', 'comutativa'], maior: ['nadaSome', 'comutativa'], carimbo: ['nadaSome'] };
const HOSTIS = [null, undefined, NaN, Infinity, -5, 'texto', '12', true, [], [1, {}, 'x', 'x', NaN], {}, { __proto__: { mal: 1 } },
  JSON.parse('{"__proto__":{"poluido":1},"constructor":{"x":1},"toString":3,"ok":{"__proto__":{"poluido":2},"em":"nada","compradas":"4"}}'),
  { a: { b: { c: {} } }, n: -3, s: 'x', z: null }];

/* Uma "feature nova" num arquivo de sistema à parte, que registra o seu campo no carregamento, como o jogo faria.
   Entra no vm depois de todos os `node: true` do manifesto: o teste tem que pegá-la sem ninguém a listar aqui. */
const FEATURE = '/tmp/reino-testes/save-campos/feature-jardim.js';
function arquivoFeature() {
  fs.mkdirSync(path.dirname(FEATURE), { recursive: true });
  fs.writeFileSync(FEATURE, "Reino.Progresso.registrarCampo('tJardim', { padrao: function () { return {}; }, mesclar: 'carimbo',\n" +
    "  novoCiclo: 'mantem', copiaSeguranca: true, exemplos: [{ rosa: { flor: 3, em: 10 } }, { rosa: { flor: 5, em: 20 }, lirio: { flor: 1, em: 4 } }] });\n");
  return FEATURE;
}

function carregarCampos(j) { vm.runInContext(fs.readFileSync(ARQ_CAMPOS, 'utf8'), j.ctx, { filename: ARQ_CAMPOS }); }
/* O jogo inteiro no vm (todos os `node: true` do manifesto, na ordem dele), mais a feature de mentira e os campos
   de mentira. O contrato roda para TODO campo de P.camposRegistrados(): os de verdade (hoje nenhum) e esses. */
function jogoComCampos(opcoes = {}) {
  const origScripts = Jogo.scripts, origCarregar = Jogo.carregar;
  Jogo.scripts = () => origScripts({}).concat([{ js: 'js/sistemas/feature-jardim.js', grupo: 'sistemas', node: true }]);
  Jogo.carregar = (ctx, lista, o = {}) => origCarregar(ctx, lista, { ...o, trocar: { ...(o.trocar || {}), 'sistemas/feature-jardim': arquivoFeature() } });
  let j;
  try { j = montar(opcoes); } finally { Jogo.scripts = origScripts; Jogo.carregar = origCarregar; }
  Object.keys(CAMPOS).forEach((n) => j.P.registrarCampo(n, CAMPOS[n]));
  return j;
}
const I = (j) => j.R._progresso;
const def = (j, n) => I(j).campos[n];
const ex = (j, n) => I(j).exemplosCampo(def(j, n));   // [a, b] já limpos
const todos = (j) => j.P.camposRegistrados();
const conjunto = (v) => (Array.isArray(v) ? v.slice().sort() : Object.keys(v).sort());
function saveCom(j, i, atualizado) { const s = saveHoje(); todos(j).forEach((n) => { s[n] = copia(ex(j, n)[i]); }); s.atualizado = atualizado; return s; }
const saveA = (j) => saveCom(j, 0, 1750700000000);
const saveB = (j) => saveCom(j, 1, 1750600000000);

/* ---------- contrato, para todo campo registrado ---------- */
test('o teste pega sozinho os campos do jogo e o de uma feature nova carregada no vm', () => {
  const j = jogoComCampos();
  const nomes = todos(j);
  assert.ok(nomes.includes('tJardim'), 'o campo da feature nova não foi visto');
  Object.keys(CAMPOS).forEach((n) => assert.ok(nomes.includes(n), n));
  // e ele passa pelo mesmo contrato: sai no estadoNovo, na mescla e na cópia
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e.tJardim), {});
  assert.deepStrictEqual(copia(j.P.mesclar(saveA(j), saveB(j)).tJardim), { rosa: { flor: 5, em: 20 }, lirio: { flor: 1, em: 4 } });
});

test('mesclar(a, a) = a, para todo campo registrado', () => {
  const j = jogoComCampos();
  todos(j).forEach((n) => {
    const [a] = ex(j, n);
    assert.deepStrictEqual(copia(I(j).juntarCampo(def(j, n), a, copia(a))), copia(a), n);
    assert.deepStrictEqual(copia(j.P.mesclar(saveA(j), saveA(j))[n]), copia(a), n + ' (P.mesclar)');
  });
});

test('nada que existia some e a mescla é comutativa onde a estratégia promete; a base ganha o empate', () => {
  const j = jogoComCampos();
  todos(j).forEach((n) => {
    const d = def(j, n), promete = PROMETE[d.mesclar] || [];
    const [a, b] = ex(j, n), a0 = copia(a), ab = I(j).juntarCampo(d, a, b), ba = I(j).juntarCampo(d, b, a);
    assert.deepStrictEqual(copia(a), a0, n + ': a mescla mudou a entrada');
    assert.notDeepStrictEqual(copia(a), copia(b), n + ': os dois exemplos são iguais');
    if (promete.includes('nadaSome')) [a, b].forEach((lado) => {
      if (typeof lado === 'number') assert.ok(ab >= lado, n);
      else conjunto(lado).forEach((k) => assert.ok(conjunto(ab).includes(k), n + ': sumiu ' + k));
      if (d.mesclar === 'contadores') Object.keys(lado).forEach((k) => {
        if (typeof lado[k] === 'number') assert.ok(ab[k] >= lado[k], n + '.' + k);
        else Object.keys(lado[k]).forEach((c) => assert.ok(ab[k][c] >= lado[k][c], n + '.' + k + '.' + c));
      });
    });
    if (promete.includes('comutativa')) {
      if (d.mesclar === 'uniao') assert.deepStrictEqual(conjunto(ab), conjunto(ba), n);
      else assert.deepStrictEqual(copia(ab), copia(ba), n);
    }
    // P.mesclar usa o lado mais recente como base, como a despensa (a ordem dos argumentos não importa)
    assert.deepStrictEqual(copia(j.P.mesclar(saveA(j), saveB(j))[n]), copia(j.P.mesclar(saveB(j), saveA(j))[n]), n + ' (P.mesclar)');
  });
  // carimbo: por chave vence o `em` maior; empate = a base (o mais recente no P.mesclar)
  const emp = I(j).juntarCampo(def(j, 'tCarimbo'), { r: { cor: 'x', em: 5 } }, { r: { cor: 'y', em: 5 } });
  assert.strictEqual(emp.r.cor, 'x');
});

test('entrada hostil não quebra nem polui o protótipo, na limpeza, na mescla e ao carregar', () => {
  const j = jogoComCampos();
  todos(j).forEach((n) => {
    const d = def(j, n), [a] = ex(j, n);
    HOSTIS.forEach((h, i) => {
      const v = I(j).limparCampo(d, h);
      assert.doesNotThrow(() => I(j).juntarCampo(d, h, a), n + ' hostil ' + i);
      assert.doesNotThrow(() => I(j).juntarCampo(d, a, h), n + ' hostil ' + i);
      if (v !== undefined) assert.doesNotThrow(() => JSON.stringify(v));
      if (v !== undefined) assert.strictEqual(Array.isArray(v), Array.isArray(d.padrao()), n + ': formato diferente do padrão');
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        ['__proto__', 'constructor', 'toString'].forEach((k) => assert.ok(!Object.prototype.hasOwnProperty.call(v, k), n + ': ficou ' + k));
        Object.values(v).forEach((x) => { if (typeof x === 'number') assert.ok(isFinite(x), n + ': NaN'); });
      }
    });
  });
  const hostil = saveHoje();
  todos(j).forEach((n, i) => { hostil[n] = HOSTIS[12 + (i % 2)]; });
  hostil.tContadores = HOSTIS[12];
  const h = jogoComCampos({ save: hostil });
  const e = h.P.carregar();
  h.P.salvar();
  assert.strictEqual({}.poluido, undefined, 'Object.prototype poluído');
  assert.strictEqual(vm.runInContext('({}).poluido', h.ctx), undefined, 'Object.prototype do jogo poluído');
  todos(h).forEach((n) => assert.strictEqual(Array.isArray(e[n]), Array.isArray(def(h, n).padrao()), n));
  assert.strictEqual(typeof e.tMaior, 'number');
  assert.strictEqual(e.tContadores.ok.compradas, 4, 'número em texto vale o número');
});

test('save antigo sem o campo ganha o padrão (e um lado sem o campo não apaga o outro)', () => {
  const j = jogoComCampos({ save: saveAtual() });
  const e = j.P.carregar();
  todos(j).forEach((n) => assert.deepStrictEqual(copia(e[n]), copia(def(j, n).padrao()), n));
  const velho = saveHoje(); velho.atualizado = 1750900000000;   // aparelho antigo, mais recente, sem os campos
  const m = j.P.mesclar(velho, saveA(j));
  todos(j).forEach((n) => assert.deepStrictEqual(copia(m[n]), copia(ex(j, n)[0]), n));
});

test('Novo ciclo mantém ou zera como declarado, e a mescla entre ciclos segue o ciclo mais novo nos que zeram', () => {
  const b = jogoComCampos();
  const j = jogoComCampos({ save: saveA(b) });
  j.P.carregar();
  j.P.novoCiclo();
  const e = j.P.estado();
  todos(j).forEach((n) => {
    const d = def(j, n), esperado = d.novoCiclo === 'zera' ? d.padrao() : ex(j, n)[0];
    assert.deepStrictEqual(copia(e[n]), copia(esperado), n);
  });
  // o aparelho que não viu o Novo ciclo (ciclo 1, mais recente) não traz de volta o que zerou
  const velho = saveA(j); velho.atualizado = e.atualizado + 1000;
  const m = j.P.mesclar(velho, copia(e));
  todos(j).forEach((n) => { if (def(j, n).novoCiclo === 'zera') assert.deepStrictEqual(copia(m[n]), copia(def(j, n).padrao()), n); });
  // e a cópia -novidades do ciclo velho também não
  const k = jogoComCampos({ save: saveA(b) });
  k.P.carregar(); k.P.salvar();
  const s2 = copia(k.P.estado()); s2.ciclo = 2; todos(k).forEach((n) => { if (def(k, n).novoCiclo === 'zera') s2[n] = def(k, n).padrao(); });
  const k2 = jogoComCampos({ loja: k.guardado, save: s2 });
  const e2 = k2.P.carregar();
  todos(k2).forEach((n) => { if (def(k2, n).novoCiclo === 'zera') assert.deepStrictEqual(copia(e2[n]), copia(def(k2, n).padrao()), n + ': a cópia do ciclo velho trouxe de volta'); });
});

test('ida e volta pela cópia -novidades: quem pediu volta depois que uma aba antiga gravou sem o campo', () => {
  const b = jogoComCampos();
  const j = jogoComCampos({ save: saveA(b) });
  j.P.carregar(); j.P.salvar();
  const c = j.copiaGuardada();
  const pediram = todos(j).filter((n) => def(j, n).copiaSeguranca);
  assert.deepStrictEqual(Object.keys(c.campos).sort(), copia(pediram).sort());
  // aba da versão antiga regrava o save sem os campos novos
  const semCampos = copia(j.P.estado()); todos(j).forEach((n) => delete semCampos[n]);
  j.guardado[j.chave] = JSON.stringify(semCampos);
  const k = jogoComCampos({ loja: j.guardado });
  const e = k.P.carregar();
  todos(k).forEach((n) => {
    const esperado = def(k, n).copiaSeguranca ? ex(k, n)[0] : def(k, n).padrao();
    assert.deepStrictEqual(copia(e[n]), copia(esperado), n);
  });
  // cópia estragada não quebra
  j.guardado[j.chaveCopia] = JSON.stringify({ geracao: 1, ciclo: 1, campos: { tMaior: 'x', tUniao: { __proto__: 1 }, tContadores: NaN } });
  assert.doesNotThrow(() => jogoComCampos({ loja: j.guardado }).P.carregar());
});

test('NOMES_DO_SAVE (a lista fixa que registrarCampo recusa) bate com as chaves de estadoNovo()', () => {
  const j = jogoComCampos();
  assert.deepStrictEqual([...j.P.NOMES_DO_SAVE].sort(), [...Object.keys(I(j).estadoNovo())].filter((n) => !def(j, n)).sort());
});

test('registrarCampo funciona no Node sem PA (ferramentas carregam os node: true sem pixel art)', () => {
  const Jogo = require('../../jogo-no-node');
  const ctx = Jogo.contexto({ console, Math, Date, JSON, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} } });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos',
    'sistemas/progresso', 'sistemas/progresso-mescla', 'sistemas/progresso-nuvem', 'sistemas/progresso-regras', 'sistemas/progresso-campos'] }));
  assert.strictEqual(ctx.PA, undefined);
  ctx.Reino.Progresso.registrarCampo('semPa', { padrao: () => 0, mesclar: 'maior', novoCiclo: 'mantem' });
  assert.deepStrictEqual([...ctx.Reino.Progresso.camposRegistrados()], ['semPa']);
});

test('registrarCampo recusa nome do save de hoje, repetido, proibido e definição incompleta', () => {
  const j = jogoComCampos();
  ['salas', 'treinos', 'provas', 'unis', 'cuidados', 'despensa', 'ajustes', 'geracao', 'atualizado', 'tMaior', 'tJardim', '__proto__', 'constructor', 'toString', 'Com Espaco', '']
    .forEach((n) => assert.throws(() => j.P.registrarCampo(n, CAMPOS.tMaior), /registrarCampo/, n));
  assert.throws(() => j.P.registrarCampo('novoA', { padrao: () => 0, mesclar: 'soma', novoCiclo: 'mantem' }), /mesclar/);
  assert.throws(() => j.P.registrarCampo('novoB', { padrao: () => 0, mesclar: 'maior' }), /novoCiclo/);
  assert.throws(() => j.P.registrarCampo('novoC', { mesclar: 'maior', novoCiclo: 'zera' }), /padrao/);
  assert.throws(() => j.P.registrarCampo('novoD', { padrao: () => 'x', mesclar: 'maior', novoCiclo: 'zera' }), /padrão/);
  // exemplos: obrigatórios com mesclar próprio; sempre [a, b] que passam pela limpeza
  assert.throws(() => j.P.registrarCampo('novoE', { padrao: () => 0, mesclar: (a, b) => a, novoCiclo: 'zera' }), /exemplos/);
  assert.throws(() => j.P.registrarCampo('novoF', { padrao: () => 0, mesclar: 'maior', novoCiclo: 'zera', exemplos: [1] }), /exemplos/);
  assert.throws(() => j.P.registrarCampo('novoG', { padrao: () => 0, mesclar: 'maior', novoCiclo: 'zera', exemplos: [1, 'x'] }), /exemplos/);
  assert.doesNotThrow(() => j.P.registrarCampo('novoH', { padrao: () => 0, mesclar: (a, b) => Math.min(a, b), limpar: (v) => (typeof v === 'number' ? v : undefined), novoCiclo: 'zera', exemplos: [1, 2] }));
});

/* ---------- sem registro: igual à main 5cd2701, byte a byte ---------- */
function pastaBase() {
  const dir = '/tmp/reino-testes/save-campos/5cd2701';
  const arqs = ['progresso.js', 'progresso-mescla.js', 'progresso-nuvem.js', 'progresso-regras.js'];
  if (!arqs.every((f) => fs.existsSync(path.join(dir, f)))) {
    fs.mkdirSync(dir, { recursive: true });
    arqs.forEach((f) => fs.writeFileSync(path.join(dir, f), execFileSync('git', ['show', '5cd2701:jogo/js/sistemas/' + f], { cwd: raiz })));
  }
  return dir;
}
// montar() com os progresso*.js da main 5cd2701 no lugar dos de hoje
function montarBase(opcoes) {
  const dir = pastaBase(), orig = Jogo.carregar;
  const trocar = Object.fromEntries(['progresso', 'progresso-mescla', 'progresso-nuvem', 'progresso-regras'].map((f) => ['sistemas/' + f, path.join(dir, f + '.js')]));
  Jogo.carregar = (ctx, lista, o = {}) => orig(ctx, lista, { ...o, trocar: { ...(o.trocar || {}), ...trocar } });
  try { return montar(opcoes); } finally { Jogo.carregar = orig; }
}

test('sem campo registrado: estadoNovo, carregar, gravar, cópia, mesclar e Novo ciclo iguais aos da main 5cd2701', () => {
  const hostil = saveHoje(); hostil.despensa = JSON.parse('{"__proto__":{"x":1},"maca":{"compradas":"5","usadas":9}}'); hostil.cuidados.inicial.fome = 'NaN';
  [saveAtual(), saveHoje(), hostil, null].forEach((s, i) => {
    const base = montarBase(s ? { save: copia(s) } : {}), novo = montar(s ? { save: copia(s) } : {});
    carregarCampos(novo);   // o arquivo carregado, mas nada registrado
    const txt = (j) => JSON.stringify(j.P.carregar());
    assert.strictEqual(txt(novo), txt(base), 'carregar ' + i);
    novo.P.salvar(); base.P.salvar();
    assert.strictEqual(novo.guardado[novo.chave], base.guardado[base.chave], 'save gravado ' + i);
    assert.strictEqual(novo.guardado[novo.chaveCopia], base.guardado[base.chaveCopia], 'cópia -novidades ' + i);
    const outro = saveHoje(); outro.atualizado = 1750900000000; outro.despensa.bolo = { compradas: 2, usadas: 0 }; outro.ciclo = i % 2 ? 2 : 1;
    assert.strictEqual(JSON.stringify(novo.P.mesclar(novo.P.estado(), copia(outro))), JSON.stringify(base.P.mesclar(base.P.estado(), copia(outro))), 'mesclar ' + i);
    novo.P.novoCiclo(); base.P.novoCiclo();
    assert.strictEqual(novo.guardado[novo.chave], base.guardado[base.chave], 'novo ciclo ' + i);
    assert.strictEqual(JSON.stringify(novo.R._progresso.estadoNovo()), JSON.stringify(base.R._progresso.estadoNovo()), 'estadoNovo ' + i);
  });
});
