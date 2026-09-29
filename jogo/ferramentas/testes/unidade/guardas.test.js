// Guarda-corpos das ferramentas de navegador e do servidor de teste: prova as recusas SEM abrir
// navegador, sem subir servidor e sem tocar em rede (o navegador é um objeto falso que acusa uso).
// Uso: node --test jogo/ferramentas/testes/unidade/guardas.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const net = require('net');
const path = require('path');

const TESTES = path.join(__dirname, '..');
const FERRAMENTAS = path.join(TESTES, '..');
const { PASTA_TESTES, conferirUrl, conferirPorta, conferirBanco, conferirPastaTmp } = require('../guardas');
const navegador = require('../navegador');
const servidorTeste = require('../servidor-teste');

// caminhos relativos ('reino.db', 'relativa') são resolvidos a partir da pasta atual: roda com a pasta
// atual FORA de /tmp (/usr), para o teste valer também numa cópia do repositório dentro de /tmp
function foraDeTmp(fn) {
  const antes = process.cwd();
  process.chdir('/usr');
  try { return fn(); } finally { process.chdir(antes); }
}

const PROIBIDAS = [
  'http://127.0.0.1/', 'http://127.0.0.1:80/', 'http://127.0.0.1:80/?debug=1', 'http://127.0.0.1:443/',
  'http://localhost/', 'http://localhost:80/', 'http://localhost:8800/', 'http://jogo.localhost:8800/',
  'http://reinodosunicornios.local/', 'http://reinodosunicornios.local:8800/', 'http://REINODOSUNICORNIOS.local:8800/',
  'http://10.0.0.5:8800/', 'http://10.1.2.3/', 'http://172.16.0.1:8800/', 'http://172.20.10.2:8800/', 'http://172.31.255.254:8800/',
  'http://192.168.0.10:8800/', 'http://192.168.1.100/', 'http://169.254.1.1:8800/',
  'http://[::1]:8800/', 'http://0.0.0.0:8800/', 'http://127.0.0.2:8800/', 'http://example.com:8800/',
  'https://127.0.0.1:8800/', 'ws://127.0.0.1:8800/', 'http://127.0.0.1:99999/', 'não é url',
];

test('conferirUrl recusa servidor de casa, localhost, rede e porta 80', () => {
  PROIBIDAS.forEach((u) => assert.throws(() => conferirUrl(u), /proibido/, u));
});

test('conferirUrl aceita só 127.0.0.1 com porta de teste (e file://)', () => {
  ['http://127.0.0.1:8800/', 'http://127.0.0.1:8849/?debug=1&congelar=1', 'http://127.0.0.1:65000/x', 'file:///tmp/reino-testes/x.html']
    .forEach((u) => assert.doesNotThrow(() => conferirUrl(u), u));
});

test('conferirPorta: nunca a 80 nem portas baixas ou inválidas', () => {
  [80, '80', 0, 443, 1023, 65536, 'abc', undefined, 8800.5].forEach((p) => assert.throws(() => conferirPorta(p), /proibido/, String(p)));
  assert.strictEqual(conferirPorta('8800'), 8800);
});

test('conferirBanco: sempre em /tmp, nunca em servidor/dados (nem por link simbólico)', () => {
  const casa = path.join(FERRAMENTAS, '..', 'servidor', 'dados', 'reino.db');
  foraDeTmp(() => [casa, '/dados/reino.db', 'reino.db', '/tmp/x/servidor/dados/reino.db', '/home/leandro/reino.db', '', null]
    .forEach((b) => assert.throws(() => conferirBanco(b), /proibido/, String(b))));
  const pasta = fs.mkdtempSync('/tmp/reino-testes-guardas-');
  fs.mkdirSync(path.join(pasta, 'servidor', 'dados'), { recursive: true });
  fs.symlinkSync(path.join(pasta, 'servidor', 'dados'), path.join(pasta, 'atalho'));
  // link em /tmp para uma pasta FORA de /tmp (fixa: /usr; o repositório pode estar numa cópia em /tmp)
  fs.symlinkSync('/usr', path.join(pasta, 'fora'));
  assert.throws(() => conferirBanco(path.join(pasta, 'atalho', 'reino.db')), /servidor\/dados/);
  assert.throws(() => conferirBanco(path.join(pasta, 'fora', 'x.db')), /\/tmp/);
  assert.strictEqual(conferirBanco(path.join(pasta, 'novo', 'reino-teste.db')), path.join(pasta, 'novo', 'reino-teste.db'));
});

test('conferirPastaTmp: só dentro de /tmp/reino-testes/ (ou da REINO_TESTES)', () => {
  const T = PASTA_TESTES;
  foraDeTmp(() => [T, T + '/', '/tmp', '/tmp/outra', '/dev/shm', T + '/../x', '/home/leandro', 'relativa', '', null]
    .forEach((p) => assert.throws(() => conferirPastaTmp(p), /proibido/, String(p))));
  assert.strictEqual(conferirPastaTmp(T + '/base-982f1ed'), T + '/base-982f1ed');
});

// navegador falso: se a guarda deixasse passar, abrir() chamaria newContext e o teste acusaria
const FALSO = { newContext() { throw new Error('ABRIU O NAVEGADOR'); } };
test('navegador.abrir recusa antes de abrir qualquer coisa', async () => {
  for (const u of PROIBIDAS.slice(0, 20)) await assert.rejects(navegador.abrir({ browser: FALSO, url: u }), /proibido/, u);
  await assert.rejects(navegador.abrir({ browser: FALSO, url: 'http://127.0.0.1:8800/' }), /ABRIU O NAVEGADOR/);
});

const ninguemOuvindo = (porta) => new Promise((r) => { const s = net.connect(porta, '127.0.0.1'); s.once('connect', () => { s.destroy(); r(false); }); s.once('error', () => r(true)); });
test('servidor-teste recusa porta 80 e banco fora de /tmp sem subir servidor', async () => {
  await assert.rejects(servidorTeste.iniciar({ porta: 80 }), /proibido/);
  await assert.rejects(servidorTeste.iniciar({ porta: '80' }), /proibido/);
  const casa = path.join(FERRAMENTAS, '..', 'servidor', 'dados', 'reino.db');
  await assert.rejects(servidorTeste.iniciar({ porta: 64999, banco: casa }), /servidor\/dados|\/tmp/);
  await assert.rejects(servidorTeste.iniciar({ porta: 64999, banco: '/home/leandro/x.db' }), /\/tmp/);
  assert.ok(await ninguemOuvindo(64999), 'nenhum servidor pode ter subido');
});

test('e2e recusa hash de base que não seja hexadecimal', () => {
  const { hashBase } = require('../e2e');
  ['x; rm -rf /', '--help', 'HEAD', '../..'].forEach((h) => assert.throws(() => hashBase(h), /inválido/, h));
});

// estrutura: só navegador.js fala com o Playwright e só servidor-teste.js sobe o servidor.js;
// ferramenta nova de navegador tem que passar por eles (e pelas guardas)
test('toda ferramenta de navegador passa por navegador.js e servidor-teste.js', () => {
  const arquivos = [];
  (function andar(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== 'gerado' && e.name !== 'node_modules') andar(p); } else if (/\.js$/.test(e.name)) arquivos.push(p);
    });
  })(FERRAMENTAS);
  const erros = [];
  arquivos.forEach((a) => {
    const rel = path.relative(FERRAMENTAS, a), txt = fs.readFileSync(a, 'utf8');
    if (rel.startsWith('testes/unidade/guardas.test.js')) return;
    if (rel !== 'testes/navegador.js' && /require\(['"](playwright|playwright-core|@playwright\/test)['"]\)|chromium\.launch|\.goto\(/.test(txt)) erros.push(rel + ': usa o Playwright direto (use testes/navegador.js)');
    if (rel !== 'testes/servidor-teste.js' && /servidor\.js['"]/.test(txt) && /spawn|fork|exec/.test(txt)) erros.push(rel + ': sobe o servidor direto (use testes/servidor-teste.js)');
  });
  assert.deepStrictEqual(erros, []);
});
