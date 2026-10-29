// A cor do app é uma só (arte.md §8): o html do index.html gerado, o manifesto do PWA e o theme-color do
// vercel/montar.js usam Reino.config.paleta.noite.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const ler = (p) => fs.readFileSync(path.join(REPO, p), 'utf8');
const ctx = { window: {} };
ctx.Reino = ctx.window.Reino = {};
vm.runInNewContext(ler('jogo/js/nucleo/config.js'), ctx);
const NOITE = ctx.Reino.config.paleta.noite;

test('index.html gerado pinta o html com a noite', () => {
  assert.ok(ler('jogo/index.html').includes(`<style>html{background:${NOITE}}</style>`));
});

test('manifesto do app usa a noite', () => {
  const m = JSON.parse(ler('vercel/pwa/manifest.webmanifest'));
  assert.strictEqual(m.background_color, NOITE);
  assert.strictEqual(m.theme_color, NOITE);
});

test('COR do montar.js é a noite', () => {
  const src = ler('vercel/montar.js');
  const m = /const COR = (.+);/.exec(src);
  assert.ok(m, 'montar.js sem const COR');
  const cor = vm.runInNewContext(m[1], { fs: { readFileSync: (p) => fs.readFileSync(p, 'utf8') }, path, JOGO: path.join(REPO, 'jogo') });
  assert.strictEqual(cor, NOITE);
});

// a barra: Reino.UI.corDaBarra troca o theme-color pela paleta; a abertura (abertura, "abrindo", login, boas-vindas)
// põe noite e só o entrarNoReino (o mapa à vista, depois da última tela de entrada) põe grama
test('barra: corDaBarra troca a meta; noite na abertura, grama só ao entrar no reino', () => {
  const meta = { content: NOITE, setAttribute(k, v) { this[k] = v; } };
  const c = { window: {}, document: { querySelector: (s) => (s === 'meta[name=theme-color]' ? meta : null) } };
  c.Reino = c.window.Reino = { config: ctx.Reino.config, UI: {}, util: { el() {} } };
  vm.runInNewContext(ler('jogo/js/ui/abertura.js'), c);
  c.Reino.UI.corDaBarra('grama');
  assert.strictEqual(meta.content, ctx.Reino.config.paleta.grama);
  c.Reino.UI.corDaBarra('noite');
  assert.strictEqual(meta.content, NOITE);
  c.document.querySelector = () => null;
  c.Reino.UI.corDaBarra('grama');   // sem a meta (jogo local): nada
  const main = ler('jogo/js/motor/main.js');
  const chamadas = [...main.matchAll(/corDaBarra\('(\w+)'\)/g)];
  assert.deepStrictEqual(chamadas.map((m) => m[1]), ['grama']);
  const dono = main.lastIndexOf('function ', chamadas[0].index);
  assert.match(main.slice(dono, chamadas[0].index), /^function entrarNoReino\(/);
  assert.match(ler('jogo/js/ui/abertura.js'), /corDaBarra\('noite'\)/);
});
