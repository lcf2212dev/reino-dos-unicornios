// Base do e2e por "@" e cache por conteúdo (e2e-base.js, e2e-cache.js, trocar-base.js aceitar), num repositório
// git temporário (fluxo/repo-de-teste.js), sem navegador: a "captura" é uma função que grava erros.txt.
// Uso: node --test jogo/ferramentas/testes/unidade/e2e-base.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { criarRepo } = require('../../fluxo/repo-de-teste');
const B = require('../e2e-base');
const cache = require('../e2e-cache');
const { aceitar, trocarTexto } = require('../trocar-base');

const r = criarRepo('fluxo-wt');
const P = r.principal, ARQ = path.join(P, B.ARQ_REL);
const commit = (msg) => { r.git(P, 'add', '-A'); r.git(P, 'commit', '-q', '-m', msg); return r.git(P, 'rev-parse', 'HEAD'); };
const quieto = (fn) => { const log = console.log; console.log = () => {}; try { return fn(); } finally { console.log = log; } };
const CACHE = path.join(r.base, 'cache');
r.escrever('jogo/js/a.js', 'var a = 1;\n');
r.escrever('jogo/css/a.css', 'a { color: red; }\n');
const C0 = commit('jogo mínimo');

test('aceitar: "@" no lugar do hash, "# @ = <descrição>" acima, comentários antigos byte a byte', () => {
  const antes = fs.readFileSync(ARQ, 'utf8');
  const novo = quieto(() => aceitar('loja com vitrine nova', { arq: ARQ }));
  assert.strictEqual(novo, antes.replace('\n1234567\n', '\n# @ = loja com vitrine nova\n@\n'));
  assert.strictEqual(B.valorDaBase(novo), '@');
  assert.ok(!fs.existsSync(ARQ + '.tmp'));
  assert.throws(() => aceitar('com # no meio', { arq: ARQ }), /"#"/);
  assert.throws(() => aceitar('', { arq: ARQ }), /descrição/);
  // de novo: mais um comentário, a linha continua "@"
  assert.match(trocarTexto(novo, '@', 'outra'), /# @ = loja com vitrine nova\n# @ = outra\n@\n$/);
  r.git(P, 'checkout', '--', B.ARQ_REL);
});

test('resolverBase: hash; "@" com commit = o commit que mudou o arquivo; "@" sem commit = HEAD com aviso', () => {
  assert.throws(() => B.resolverBase({ repo: P }), /1234567/);     // o hash do repositório de teste não existe
  assert.strictEqual(B.resolverBase({ repo: P, pedido: C0.slice(0, 7) }).cheio, C0);
  quieto(() => aceitar('primeira', { arq: ARQ }));
  const semCommit = B.resolverBase({ repo: P });
  assert.strictEqual(semCommit.cheio, C0);
  assert.match(semCommit.aviso, /sem commit.*HEAD/);
  const C1 = commit('aceita a base');
  r.escrever('jogo/js/b.js', 'var b = 2;\n');
  commit('outra mudança, sem tocar na base');
  const b = B.resolverBase({ repo: P });
  assert.strictEqual(b.cheio, C1);
  assert.strictEqual(b.aviso, null);
  assert.strictEqual(B.baseDaMain(P).cheio, C1);
});

test('conteúdo: commit e árvore de trabalho; sem commit e arquivo novo contam, fora das partes não', () => {
  const head = r.git(P, 'rev-parse', 'HEAD');
  const limpo = B.conteudoArvore(P);
  assert.strictEqual(limpo, B.conteudoCommit(P, head));
  r.escrever('README.md', 'fora do jogo\n');
  r.escrever('jogo/ferramentas/x.js', '// ferramenta\n');
  assert.strictEqual(B.conteudoArvore(P), limpo, 'fora de index/css/js/servidor não muda a chave');
  r.escrever('jogo/js/novo.js', 'var n = 3;\n');                       // arquivo novo, sem git add
  const comNovo = B.conteudoArvore(P);
  assert.notStrictEqual(comNovo, limpo);
  fs.unlinkSync(path.join(P, 'jogo/js/novo.js'));
  r.escrever('jogo/css/a.css', 'a { color: blue; }\n');                // mudança sem commit
  assert.notStrictEqual(B.conteudoArvore(P), limpo);
  r.git(P, 'checkout', '--', 'jogo/css/a.css');
  assert.strictEqual(B.conteudoArvore(P), limpo);
  assert.strictEqual(r.git(P, 'status', '--porcelain', '--', 'jogo'), '?? jogo/ferramentas/x.js', 'o índice real não muda');
  fs.rmSync(path.join(P, 'jogo/ferramentas/x.js')); fs.rmSync(path.join(P, 'README.md'));
});

test('conteúdo: arquivo mudado no mesmo tique em que o índice foi gravado ("racy") conta pelo disco', () => {
  // ctime fora da conta (só o mtime decide), para o caso ser o mesmo em qualquer máquina
  r.git(P, 'config', 'core.trustctime', 'false');
  try {
    const arq = path.join(P, 'jogo/js/racy.js'), X = new Date(Date.now() - 100000);
    fs.writeFileSync(arq, 'var r = 1;\n'); fs.utimesSync(arq, X, X);
    r.git(P, 'add', '--', 'jogo/js/racy.js');
    const indice = path.resolve(P, r.git(P, 'rev-parse', '--git-path', 'index'));
    fs.utimesSync(indice, X, X);                                    // índice gravado "no mesmo tique"
    const doIndice = B.conteudoArvore(P);
    fs.writeFileSync(arq, 'var r = 2;\n'); fs.utimesSync(arq, X, X); // mesmo tamanho, mesmo mtime, mesmo inode
    fs.utimesSync(indice, X, X);
    assert.notStrictEqual(B.conteudoArvore(P), doIndice, 'a chave tem de ser a do disco, não a do índice');
    r.git(P, 'rm', '-q', '-f', '--cached', '--', 'jogo/js/racy.js'); fs.unlinkSync(arq);
  } finally { r.git(P, 'config', '--unset', 'core.trustctime'); }
});

test('captura do atual guardada pelo conteúdo vira a base pronta depois do aceite (sem recapturar)', async () => {
  r.escrever('jogo/js/a.js', 'var a = 42;\n');                         // a mudança da frente
  const atual = B.conteudoArvore(P);
  let capturas = 0;
  const capturar = async (saida) => { capturas++; fs.mkdirSync(saida, { recursive: true }); fs.writeFileSync(path.join(saida, 'erros.txt'), ''); };
  const sub = 'dados-vozes-h00000000-n00000000';
  const r1 = await cache.obterCaptura(cache.pastaCaptura(CACHE, atual, sub), capturar);
  assert.deepStrictEqual([r1.reusada, capturas], [false, 1]);
  quieto(() => aceitar('a = 42', { arq: ARQ }));
  const C2 = commit('a frente, com o aceite no mesmo commit');
  const base = B.resolverBase({ repo: P });
  assert.strictEqual(base.cheio, C2);
  const daBase = B.conteudoCommit(P, base.cheio);
  assert.strictEqual(daBase, atual, 'a base nova tem o conteúdo já capturado');
  const r2 = await cache.obterCaptura(cache.pastaCaptura(CACHE, daBase, sub), capturar);
  assert.deepStrictEqual([r2.reusada, capturas], [true, 1]);
  // e o jogo da main agora é a própria base: idêntico por construção
  assert.strictEqual(B.conteudoArvore(P), daBase);
});

test('trava da chave: dois pedidos juntos capturam uma vez só; trava de PID morto é assumida', async () => {
  let capturas = 0;
  const capturar = async (saida) => {
    capturas++; await new Promise((ok) => setTimeout(ok, 300));
    fs.mkdirSync(saida, { recursive: true }); fs.writeFileSync(path.join(saida, 'erros.txt'), '');
  };
  const destino = cache.pastaCaptura(CACHE, 'ddddeeee00001111', 'dados-vozes-h0-n0');
  const [a, b] = await quieto(() => Promise.all([cache.obterCaptura(destino, capturar, { esperaMs: 50 }), cache.obterCaptura(destino, capturar, { esperaMs: 50 })]));
  assert.strictEqual(capturas, 1);
  assert.deepStrictEqual([a.reusada, b.reusada].sort(), [false, true]);
  assert.ok(!fs.existsSync(destino + '.trava'), 'trava solta no fim');
  // trava esquecida por um processo que morreu (PID que não existe)
  const outro = cache.pastaCaptura(CACHE, 'ddddeeee00002222', 'dados-vozes-h0-n0');
  fs.mkdirSync(path.dirname(outro), { recursive: true });
  fs.writeFileSync(outro + '.trava', JSON.stringify({ pid: 2 ** 22 + 12345, desde: 'ontem' }));
  const t = new Date(Date.now() - 5000); fs.utimesSync(outro + '.trava', t, t);
  const c = await cache.obterCaptura(outro, capturar, { esperaMs: 50 });
  assert.deepStrictEqual([c.reusada, capturas], [false, 2]);
});

test('chave mudou durante a captura: a captura vai para o e2e, não para o cache', async () => {
  const destino = cache.pastaCaptura(CACHE, 'ddddeeee00003333', 'dados-vozes-h0-n0'), fora = path.join(CACHE, 'e2e-x', 'atual');
  const capturar = async (saida) => { fs.mkdirSync(saida, { recursive: true }); fs.writeFileSync(path.join(saida, 'erros.txt'), ''); };
  const r1 = await cache.obterCaptura(destino, capturar, { guardar: () => false, semGuardar: fora });
  assert.deepStrictEqual([r1.guardada, r1.destino], [false, fora]);
  assert.ok(cache.pronta(fora) && !fs.existsSync(destino) && !fs.existsSync(destino + '.trava'));
  const r2 = await cache.obterCaptura(destino, capturar, { guardar: () => true, semGuardar: fora + '2' });
  assert.deepStrictEqual([r2.guardada, r2.destino], [true, destino]);
});

// e2e() de verdade com capturar/comparar falsos, num processo à parte com REINO_TESTES próprio (a base pronta é falsa)
const FILHO = `
const fs = require('fs'), path = require('path');
const T = process.argv[1], RAIZ = process.argv[2];
const chamadas = [];
require.cache[require.resolve(T + '/referencias')] = { id: 'r', filename: 'r', loaded: true, exports: { PARALELO_PADRAO: 4,
  capturar: async (saida, op) => {
    chamadas.push({ saida, faltam: op.faltam });
    for (const n of ['interior-loja', 'tela-loja', 'mapa-inicio']) {
      if (op.filtro && !op.filtro.test(n)) continue;
      if (op.faltam && !op.faltam.celular.size) break;             // como a aba: lista vazia = chega
      if (op.faltam) op.faltam.celular.delete(n);
      fs.mkdirSync(path.join(saida, 'imagens', 'celular'), { recursive: true });
      fs.writeFileSync(path.join(saida, 'imagens', 'celular', n + '.png'), n);
      await new Promise((ok) => setTimeout(ok, 20));
    }
    fs.writeFileSync(path.join(saida, 'erros.txt'), '');
  } } };
const nomes = (d) => { try { return fs.readdirSync(path.join(d, 'imagens', 'celular')).sort(); } catch (e) { return []; } };
require.cache[require.resolve(T + '/referencias-comparar')] = { id: 'c', filename: 'c', loaded: true, exports: {
  comparar: (a, b) => ({ ok: nomes(a).join() === nomes(b).join() && nomes(a).length > 0 }) } };
const B = require(T + '/e2e-base'), cache = require(T + '/e2e-cache'), disco = require(T + '/e2e-disco');
const { e2e, hashBase, subCaptura } = require(T + '/e2e');
const { PASTA_TESTES } = require(T + '/guardas');
const REPO = path.resolve(T, '..', '..', '..'), base = hashBase();
const pronta = cache.pastaCaptura(PASTA_TESTES, B.conteudoCommit(REPO, base.cheio),
  subCaptura({ so: 'imagens' }, disco.hashHarness((f) => fs.readFileSync(path.join(T, f))), B.versaoNavegador(REPO)).nome);
fs.mkdirSync(path.join(pronta, 'imagens', 'celular'), { recursive: true });
['interior-loja', 'tela-loja', 'mapa-inicio'].forEach((n) => fs.writeFileSync(path.join(pronta, 'imagens', 'celular', n + '.png'), n));
fs.writeFileSync(path.join(pronta, 'erros.txt'), '');
fs.mkdirSync(path.join(PASTA_TESTES, 'base-' + base.curto, 'jogo'), { recursive: true });
fs.writeFileSync(path.join(PASTA_TESTES, 'base-' + base.curto, 'jogo', '.base-pronta'), base.cheio + '\\n');
console.log = () => {};
e2e({ so: 'imagens', filtro: /^(?:interior-loja|tela-loja)$/, recapturar: true, raiz: path.join(RAIZ, 'jogo'), manter: true }).then((ok) => {
  const lados = chamadas.map((c) => nomes(c.saida).join());
  process.stdout.write(JSON.stringify({ ok, n: chamadas.length, mesma: chamadas[0].faltam === chamadas[1].faltam, lados }));
});
`;

test('--recapturar --cenas com a base pronta no cache: cada lado com a sua lista de cenas, as duas capturas completas', () => {
  const { spawnSync } = require('child_process');
  const rt = path.join(r.base, 'rt');
  r.escrever('jogo/js/a.js', 'var a = 7;\n');                          // atual ≠ base: nada "por construção"
  const res = spawnSync(process.execPath, ['-e', FILHO, path.resolve(__dirname, '..'), P],
    { encoding: 'utf8', env: { ...process.env, REINO_TESTES: rt }, timeout: 60000 });
  assert.strictEqual(res.status, 0, res.stderr);
  const v = JSON.parse(res.stdout);
  assert.deepStrictEqual(v, { ok: true, n: 2, mesma: false, lados: ['interior-loja.png,tela-loja.png', 'interior-loja.png,tela-loja.png'] });
});

test('ligarArvore: cópia por hard link (mesmo inode), sem gastar disco', () => {
  const de = path.join(CACHE, 'ligar-de'), para = path.join(CACHE, 'ligar-para');
  fs.mkdirSync(path.join(de, 'imagens', 'celular'), { recursive: true });
  fs.writeFileSync(path.join(de, 'imagens', 'celular', 'mapa.png'), 'png');
  cache.ligarArvore(de, para);
  assert.strictEqual(fs.statSync(path.join(para, 'imagens', 'celular', 'mapa.png')).ino, fs.statSync(path.join(de, 'imagens', 'celular', 'mapa.png')).ino);
});

test('versaoNavegador: 8 hex, estável', () => {
  const repo = path.resolve(__dirname, '..', '..', '..', '..');
  assert.match(B.versaoNavegador(repo), /^[0-9a-f]{8}$/);
  assert.strictEqual(B.versaoNavegador(repo), B.versaoNavegador(repo));
});
