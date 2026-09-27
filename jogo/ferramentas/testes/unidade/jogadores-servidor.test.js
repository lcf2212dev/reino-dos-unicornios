// Jogadores no servidor de casa (docs/contratos/save-e-mescla.md §12), sempre no servidor de TESTE (porta livre,
// banco novo em /tmp/reino-testes/), com saves 100% sintéticos:
// - servidor novo: /api/jogadores (lista, criar, entrar), /api/progresso/<login> com histórico próprio, e
//   /api/progresso continua sendo a Mariana;
// - o jogo (vm) como a Mariana grava em /api/progresso; como outro jogador, cria a conta e grava em /api/progresso/<login>;
// - SERVIDOR ANTIGO (o servidor.js da main, que grava tudo na linha 'mariana') + jogador novo: nenhum PUT sai e a
//   linha 'mariana' fica byte a byte igual.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/jogadores-servidor.test.js   (tudo: npm test)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');
const { iniciar } = require('../servidor-teste');
const { montar, saveHoje, copia } = require('./ajudantes/jogo-save');

const RAIZ_REPO = path.join(__dirname, '..', '..', '..', '..');
const ARQS = ['progresso-campos.js', 'jogadores.js'].map((a) => path.join(__dirname, '..', '..', '..', 'js', 'sistemas', a));
const PASTA_ANTIGO = '/tmp/reino-testes/jogadores-servidor-antigo';
// o arquivo do servidor (quem o sobe é sempre o servidor-teste.js; o git só lê a versão antiga)
const ARQ_SERVIDOR = 'servidor' + '.js';

// o servidor.js de antes dos jogadores (commit 98e606f, o que roda no servidor de casa até o Leandro reiniciar),
// numa pasta própria em /tmp (só a API importa aqui)
function raizDoAntigo() {
  let texto;
  try { texto = execFileSync('git', ['show', '98e606f:jogo/servidor/' + ARQ_SERVIDOR], { cwd: RAIZ_REPO, encoding: 'utf8' }); } catch (e) { return null; }
  fs.mkdirSync(path.join(PASTA_ANTIGO, 'servidor'), { recursive: true });
  fs.writeFileSync(path.join(PASTA_ANTIGO, 'servidor', ARQ_SERVIDOR), texto);
  return PASTA_ANTIGO;
}

async function pedir(s, metodo, url, corpo) {
  const r = await fetch(s.url + url, { method: metodo, headers: corpo ? { 'Content-Type': 'application/json' } : {}, body: corpo ? JSON.stringify(corpo) : undefined });
  const texto = metodo === 'HEAD' ? '' : await r.text();
  return { status: r.status, headers: r.headers, texto, json: () => JSON.parse(texto) };
}
function saveSintetico(estrelas) { const s = saveHoje(); s.estrelas.ganhas = estrelas; return s; }
const docDe = (e) => ({ estado: e, atualizado: e.atualizado });

// o jogo inteiro num vm, servido por http pelo servidor de teste s (fetch de verdade, com cada chamada anotada)
function jogoHttp(s, op = {}) {
  const j = montar(op);
  ARQS.forEach((a) => vm.runInContext(fs.readFileSync(a, 'utf8'), j.ctx, { filename: a }));
  j.chamadas = [];
  j.ctx.location = { protocol: 'http:', search: '' };
  j.ctx.fetch = (url, o = {}) => { j.chamadas.push({ url, metodo: o.method || 'GET' }); return fetch(new URL(url, s.url), o); };
  return j;
}
async function ate(fn, ms = 5000) {
  const fim = Date.now() + ms;
  for (;;) { const v = await fn(); if (v) return v; if (Date.now() > fim) throw new Error('não aconteceu a tempo'); await new Promise((r) => setTimeout(r, 30)); }
}

test('servidor novo: contas, um progresso por login e /api/progresso continua sendo a Mariana', async () => {
  const s = await iniciar();
  try {
    const h = await pedir(s, 'HEAD', 'api/progresso');
    assert.strictEqual(h.headers.get('x-reino'), '1');
    assert.strictEqual(h.headers.get('x-reino-jogadores'), '1', 'o servidor novo se anuncia');
    // contas
    assert.deepStrictEqual((await pedir(s, 'GET', 'api/jogadores')).json(), ['mariana']);
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores', { login: 'joao', senha: 'abc' })).status, 201);
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores', { login: 'joao', senha: 'xyz' })).status, 409, 'login repetido');
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores', { login: 'mariana', senha: 'abc' })).status, 409, 'mariana é reservado');
    for (const login of ['João', 'a', 'x'.repeat(21), 'com espaço', '../x', 5]) {
      assert.strictEqual((await pedir(s, 'POST', 'api/jogadores', { login, senha: 'abc' })).status, 400, String(login));
    }
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores', { login: 'ana', senha: '' })).status, 400, 'sem senha');
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores', { login: 'ana', senha: 'a1' })).status, 201);
    assert.deepStrictEqual((await pedir(s, 'GET', 'api/jogadores')).json(), ['mariana', 'joao', 'ana']);
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores/entrar', { login: 'joao', senha: 'abc' })).status, 200);
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores/entrar', { login: 'joao', senha: 'errada' })).status, 403);
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores/entrar', { login: 'ninguem', senha: 'abc' })).status, 404);
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores/entrar', { login: 'mariana' })).status, 403, 'a Mariana tem senha no banco');
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores/entrar', { login: 'mariana', senha: 'errada' })).status, 403);
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores/entrar', { login: 'mariana', senha: 'unicorlice77' })).status, 200);
    assert.strictEqual((await pedir(s, 'DELETE', 'api/jogadores')).status, 405);
    // progresso: cada login na sua linha
    const m = docDe(saveSintetico(11)), jo = docDe(saveSintetico(22));
    assert.strictEqual((await pedir(s, 'GET', 'api/progresso/joao')).status, 404);
    assert.strictEqual((await pedir(s, 'PUT', 'api/progresso/ze', jo)).status, 404, 'sem conta: nada de linha solta');
    assert.strictEqual((await pedir(s, 'GET', 'api/progresso/ze')).status, 404);
    assert.strictEqual((await pedir(s, 'PUT', 'api/progresso', m)).status, 204);
    assert.strictEqual((await pedir(s, 'PUT', 'api/progresso/joao', jo)).status, 204);
    assert.deepStrictEqual((await pedir(s, 'GET', 'api/progresso')).json(), m);
    assert.deepStrictEqual((await pedir(s, 'GET', 'api/progresso/mariana')).json(), m, '/api/progresso/mariana = a mesma linha');
    assert.deepStrictEqual((await pedir(s, 'GET', 'api/progresso/joao')).json(), jo);
    assert.strictEqual((await pedir(s, 'HEAD', 'api/progresso/joao')).headers.get('x-reino-jogadores'), '1');
    for (const url of ['api/progresso/Joao', 'api/progresso/a', 'api/progresso/joao/x', 'api/progresso/%2e%2e']) {
      assert.strictEqual((await pedir(s, 'PUT', url, jo)).status, 404, url);
    }
    // % malformado: 400, e o servidor continua de pé
    for (const url of ['api/progresso/%E0%A4%A', '%', 'js/%zz.js']) assert.strictEqual((await pedir(s, 'GET', url)).status, 400, url);
    assert.deepStrictEqual((await pedir(s, 'GET', 'api/progresso')).json(), m, 'nada disso mexeu na Mariana');
    // histórico: 50 por login, sem apagar o da Mariana
    for (let i = 0; i < 55; i++) await pedir(s, 'PUT', 'api/progresso/joao', docDe(saveSintetico(100 + i)));
    const banco = new DatabaseSync(s.banco, { readOnly: true });
    const contar = (id) => banco.prepare('SELECT COUNT(*) AS n FROM historico WHERE id = ?').get(id).n;
    assert.strictEqual(contar('joao'), 50);
    assert.strictEqual(contar('mariana'), 1);
    assert.deepStrictEqual(banco.prepare('SELECT login, senha FROM jogadores ORDER BY login').all().map((l) => ({ ...l })), [{ login: 'ana', senha: 'a1' }, { login: 'joao', senha: 'abc' }, { login: 'mariana', senha: 'unicorlice77' }]);
    banco.close();
  } finally { s.parar(); }
});

test('jogo: a Mariana grava em /api/progresso; outro jogador cria a conta e grava só em /api/progresso/<login>', async () => {
  const s = await iniciar();
  try {
    const m = docDe(saveSintetico(11));
    await pedir(s, 'PUT', 'api/progresso', m);
    const antes = (await pedir(s, 'GET', 'api/progresso')).texto;
    // outro jogador (conta só no aparelho, criada quando o servidor era o antigo): a conta nasce no servidor
    const j = jogoHttp(s);
    j.guardado['reino-v1-bia'] = JSON.stringify(saveSintetico(33));
    j.R.Jogadores.usar('bia');   // sem conta lembrada: sem senha, não cria no servidor
    j.P.carregar();
    await j.P.iniciarNuvem();
    assert.strictEqual(j.P.statusNuvem(), 'local', 'sem senha conhecida, fica no aparelho');
    assert.ok(!j.chamadas.some((c) => c.metodo === 'PUT'));
    const k = jogoHttp(s);
    k.guardado['reino-jogadores'] = JSON.stringify({ bia: { senha: 'sol', criado: 1 } });
    k.guardado['reino-v1-bia'] = JSON.stringify(saveSintetico(33));
    k.R.Jogadores.usar('bia');
    k.P.carregar();
    await k.P.iniciarNuvem();
    const bia = await ate(async () => { const r = await pedir(s, 'GET', 'api/progresso/bia'); return r.status === 200 && r.json(); });
    assert.strictEqual(bia.estado.estrelas.ganhas, 33);
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores/entrar', { login: 'bia', senha: 'sol' })).status, 200, 'a conta foi criada');
    assert.ok(k.chamadas.filter((c) => c.metodo === 'PUT').every((c) => c.url === 'api/progresso/bia'), JSON.stringify(k.chamadas));
    assert.strictEqual((await pedir(s, 'GET', 'api/progresso')).texto, antes, 'a linha da Mariana não mudou');
    // conta de outra pessoa com o mesmo login (senha diferente): não junta os progressos
    const o = jogoHttp(s);
    o.guardado['reino-jogadores'] = JSON.stringify({ bia: { senha: 'lua', criado: 1 } });
    o.guardado['reino-v1-bia'] = JSON.stringify(saveSintetico(44));
    o.R.Jogadores.usar('bia');
    o.P.carregar();
    await o.P.iniciarNuvem();
    assert.strictEqual(o.P.statusNuvem(), 'local');
    assert.strictEqual((await pedir(s, 'GET', 'api/progresso/bia')).json().estado.estrelas.ganhas, 33);
    // a senha da Mariana é conferida na linha dela do banco
    const sm = jogoHttp(s);
    assert.deepStrictEqual(copia(await sm.R.Jogadores.entrar('mariana', 'errada')), { erro: 'senha' });
    assert.deepStrictEqual(copia(await sm.R.Jogadores.entrar('mariana', 'unicorlice77')), { ok: true });
    assert.ok(sm.chamadas.some((c) => c.url === 'api/jogadores/entrar'));
    // a Mariana: /api/progresso, como sempre
    const mj = jogoHttp(s, { save: saveSintetico(12) });
    mj.R.Jogadores.usar('mariana');
    mj.P.carregar();
    await mj.P.iniciarNuvem();
    await ate(async () => (await pedir(s, 'GET', 'api/progresso')).json().estado.estrelas.ganhas === 12);
    assert.ok(mj.chamadas.filter((c) => c.metodo === 'PUT').every((c) => c.url === 'api/progresso'));
    assert.ok(!mj.chamadas.some((c) => /jogadores/.test(c.url)), 'a Mariana não passa pelas contas');
    assert.strictEqual((await pedir(s, 'GET', 'api/progresso/bia')).json().estado.estrelas.ganhas, 33, 'e não mexe na bia');
  } finally { s.parar(); }
});

test('SERVIDOR ANTIGO + jogador novo: nenhum PUT sai e a linha da Mariana fica byte a byte igual', async (t) => {
  const raiz = raizDoAntigo();
  if (!raiz) return t.skip('sem o histórico do git (commit 98e606f)');
  const s = await iniciar({ raiz });
  try {
    const h = await pedir(s, 'HEAD', 'api/progresso');
    assert.strictEqual(h.headers.get('x-reino'), '1');
    assert.strictEqual(h.headers.get('x-reino-jogadores'), null, 'é mesmo o antigo');
    await pedir(s, 'PUT', 'api/progresso', docDe(saveSintetico(11)));
    const antes = (await pedir(s, 'GET', 'api/progresso')).texto;
    // criar a conta: só no aparelho (nenhum POST no antigo)
    const j = jogoHttp(s);
    assert.deepStrictEqual(copia(await j.R.Jogadores.criar('joao', 'abc')), { ok: true });
    assert.ok(JSON.parse(j.guardado['reino-jogadores']).joao, 'conta lembrada no aparelho');
    assert.deepStrictEqual(copia(await j.R.Jogadores.listar()), ['mariana', 'joao']);
    j.R.Jogadores.usar('joao');
    j.P.carregar();
    await j.P.iniciarNuvem();
    // o jogador joga e grava várias vezes
    const e = j.P.estado();
    e.comecou = true; e.estrelas.ganhas = 99; e.unis.inicial = { em: 1, xp: 3, chocado: true };
    j.P.salvar();
    j.R.Jogadores.definirPerfil({ nome: 'João', sexo: 'menino' });
    await new Promise((r) => setTimeout(r, 300));
    assert.strictEqual(j.P.statusNuvem(), 'local', 'fica só no aparelho');
    assert.ok(j.chamadas.length && j.chamadas.every((c) => c.metodo === 'HEAD' && c.url === 'api/progresso'), 'só perguntou quem é o servidor: ' + JSON.stringify(j.chamadas));
    assert.strictEqual((await pedir(s, 'GET', 'api/progresso')).texto, antes, 'a linha da Mariana não mudou');
    assert.strictEqual(JSON.parse(j.guardado['reino-v1-joao']).estrelas.ganhas, 99, 'o progresso dele está no aparelho');
    assert.strictEqual(j.guardado['mariana-reino-v1'], undefined, 'e nada na chave da Mariana');
    // entrar de novo com senha, sem o banco: confere a conta do aparelho
    const k = jogoHttp(s);
    k.guardado['reino-jogadores'] = j.guardado['reino-jogadores'];
    assert.deepStrictEqual(copia(await k.R.Jogadores.entrar('joao', 'errada')), { erro: 'senha' });
    assert.deepStrictEqual(copia(await k.R.Jogadores.entrar('joao', 'abc')), { ok: true });
    assert.strictEqual((await pedir(s, 'GET', 'api/progresso')).texto, antes);
    // senha da Mariana no servidor antigo (sem contas): confere com config.jogadores.senhaMariana, sem POST
    const sm = jogoHttp(s);
    assert.deepStrictEqual(copia(await sm.R.Jogadores.entrar('mariana', 'errada')), { erro: 'senha' });
    assert.deepStrictEqual(copia(await sm.R.Jogadores.entrar('mariana', 'unicorlice77')), { ok: true });
    assert.ok(sm.chamadas.every((c) => c.metodo === 'HEAD'));
    // a Mariana no servidor antigo: igual a sempre
    const mj = jogoHttp(s, { save: saveSintetico(12) });
    mj.R.Jogadores.usar('mariana');
    mj.P.carregar();
    await mj.P.iniciarNuvem();
    await ate(async () => (await pedir(s, 'GET', 'api/progresso')).json().estado.estrelas.ganhas === 12);
  } finally { s.parar(); }
});

test('conta da Mariana no banco: semeada no banco novo, nunca sobrescrita; o progresso dela fica intacto', async () => {
  // banco que já tem a linha dela com outra senha (e um progresso): o servidor sobe e não muda nada
  const pasta = fs.mkdtempSync('/tmp/reino-testes/banco-mariana-');
  const arq = path.join(pasta, 'reino-teste.db');
  const pre = new DatabaseSync(arq);
  pre.exec('CREATE TABLE progresso (id TEXT PRIMARY KEY, dados TEXT NOT NULL, atualizado INTEGER NOT NULL); CREATE TABLE jogadores (login TEXT PRIMARY KEY, senha TEXT NOT NULL, criado INTEGER NOT NULL);');
  const doc = JSON.stringify(docDe(saveSintetico(21)));
  pre.prepare('INSERT INTO progresso VALUES (?, ?, ?)').run('mariana', doc, 5);
  pre.prepare('INSERT INTO jogadores VALUES (?, ?, ?)').run('mariana', 'outra', 7);
  pre.close();
  const s = await iniciar({ banco: arq });
  try {
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores/entrar', { login: 'mariana', senha: 'unicorlice77' })).status, 403, 'a senha que já estava vale');
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores/entrar', { login: 'mariana', senha: 'outra' })).status, 200);
    assert.strictEqual((await pedir(s, 'GET', 'api/progresso')).texto, doc, 'progresso dela byte a byte igual');
    assert.strictEqual((await pedir(s, 'POST', 'api/jogadores', { login: 'mariana', senha: 'x1x' })).status, 409);
  } finally { s.parar(); }
  const depois = new DatabaseSync(arq, { readOnly: true });
  assert.deepStrictEqual({ ...depois.prepare('SELECT senha, criado FROM jogadores WHERE login = ?').get('mariana') }, { senha: 'outra', criado: 7 });
  depois.close();
  // banco novo: a linha nasce com a senha dela
  const n = await iniciar();
  try {
    const b = new DatabaseSync(n.banco, { readOnly: true });
    assert.strictEqual(b.prepare('SELECT senha FROM jogadores WHERE login = ?').get('mariana').senha, 'unicorlice77');
    assert.strictEqual(b.prepare('SELECT COUNT(*) AS n FROM progresso').get().n, 0, 'semear a conta não cria progresso');
    b.close();
    assert.deepStrictEqual((await pedir(n, 'GET', 'api/jogadores')).json(), ['mariana']);
  } finally { n.parar(); }
});
