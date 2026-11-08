// Testes de unidade: o app da Play Store (android/) e o que ele pede ao site (vercel/loja/).
// - o assetlinks.json fala do mesmo app (applicationId do build.gradle) e só tem impressões SHA-256 válidas;
// - o build.gradle aponta para o site da Vercel;
// - o vercel/montar.js publica /.well-known/assetlinks.json e /privacidade.html, fora da lista do sw.js;
// - a --impressao do npm run android põe a impressão uma vez só e recusa impressão malformada.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/app-play.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const GRADLE = fs.readFileSync(path.join(RAIZ, 'android', 'app', 'build.gradle'), 'utf8');
const LINKS = path.join(RAIZ, 'vercel', 'loja', 'assetlinks.json');
const android = require(path.join(RAIZ, 'jogo', 'ferramentas', 'android', 'android.js'));
const TESTES = process.env.REINO_TESTES || '/tmp/reino-testes';

test('assetlinks.json: o app do build.gradle, com impressões SHA-256 válidas', () => {
  const links = JSON.parse(fs.readFileSync(LINKS, 'utf8'));
  const app = links.filter((l) => l.target && l.target.namespace === 'android_app');
  assert.strictEqual(app.length, 1);
  assert.deepStrictEqual(app[0].relation, ['delegate_permission/common.handle_all_urls']);
  assert.strictEqual(app[0].target.package_name, android.APP_ID);
  assert.match(GRADLE, /namespace twa\.applicationId/);
  const shas = app[0].target.sha256_cert_fingerprints;
  assert.ok(shas.length >= 1, 'falta a impressão da chave de envio (npm run android)');
  shas.forEach((s) => assert.match(s, android.SHA256));
  assert.strictEqual(new Set(shas).size, shas.length, 'impressão repetida');
});

test('build.gradle: o app abre o site da Vercel', () => {
  assert.match(GRADLE, /host\s*:\s*'reino-dos-unicornios\.vercel\.app'/);
  // o JSON do asset_statements vai com as aspas escapadas (\\" no Groovy → \" no XML); sem isso o aapt2 as tira
  assert.match(GRADLE, /\\\\"relation\\\\"/);
});

test('montar.js: assetlinks e privacidade publicados, fora do sw.js', () => {
  const { montar } = require(path.join(RAIZ, 'vercel', 'montar.js'));
  const saida = path.join(TESTES, 'app-play-montar');
  const r = montar(saida);
  assert.strictEqual(fs.readFileSync(path.join(saida, '.well-known', 'assetlinks.json'), 'utf8'), fs.readFileSync(LINKS, 'utf8'));
  assert.match(fs.readFileSync(path.join(saida, 'privacidade.html'), 'utf8'), /Política de privacidade/);
  assert.ok(!Object.keys(r.arquivos).some((k) => k.startsWith('.well-known') || k === 'privacidade.html'),
    'o que é da loja não entra no jogo sem rede');
  assert.ok(r.arquivos['index.html'], 'o resto do build continua');
});

test('--impressao: põe uma vez só e recusa impressão malformada', () => {
  const copia = path.join(TESTES, 'app-play-assetlinks.json');   // numa cópia: o do repositório não muda
  fs.mkdirSync(TESTES, { recursive: true });
  fs.copyFileSync(LINKS, copia);
  const nova = Array.from({ length: 32 }, (_, i) => (i * 7 % 256).toString(16).padStart(2, '0').toUpperCase()).join(':');
  assert.throws(() => android.porImpressao('AB:CD', copia), /inválida/);
  assert.strictEqual(android.porImpressao(nova.toLowerCase(), copia), true);
  assert.strictEqual(android.porImpressao(nova, copia), false);
  const shas = JSON.parse(fs.readFileSync(copia, 'utf8'))[0].target.sha256_cert_fingerprints;
  assert.strictEqual(shas[shas.length - 1], nova);
});
