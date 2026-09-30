// O index.html montado pela Vercel (vercel/montar.js, em vercel/public, ignorado pelo git) anuncia o app ao iOS:
// título curto do manifesto, barra translúcida e uma imagem de abertura PNG por tela, cada uma no sw.js.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const VERCEL = path.resolve(__dirname, '..', '..', '..', '..', 'vercel');
const PUB = path.join(VERCEL, 'public');

test('montar.js: metas do iOS e imagens de abertura no index e no sw', () => {
  execFileSync(process.execPath, [path.join(VERCEL, 'montar.js')], { stdio: 'ignore' });
  const html = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
  const curto = JSON.parse(fs.readFileSync(path.join(VERCEL, 'pwa', 'manifest.webmanifest'), 'utf8')).short_name;
  assert.strictEqual(html.split('apple-mobile-web-app-title').length, 2, 'título duplicado ou ausente');
  assert.ok(html.includes(`<meta name="apple-mobile-web-app-title" content="${curto}">`));
  assert.ok(html.includes('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'));
  const sw = fs.readFileSync(path.join(PUB, 'sw.js'), 'utf8');
  const imgs = [...html.matchAll(/rel="apple-touch-startup-image" href="(abertura-(\d+)x(\d+)\.png)"/g)];
  assert.ok(imgs.length >= 10);
  imgs.forEach(([, nome, w, h]) => {
    const b = fs.readFileSync(path.join(PUB, nome));
    assert.strictEqual(b.readUInt32BE(16), Number(w), nome);
    assert.strictEqual(b.readUInt32BE(20), Number(h), nome);
    assert.ok(sw.includes(`"${nome}":`), nome + ' fora do sw.js');
  });
});
