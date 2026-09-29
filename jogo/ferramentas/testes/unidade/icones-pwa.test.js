// Testes de unidade: os ícones do app (vercel/pwa/*.png e o favicon) batem com o gerador (D11-09); se o desenho do
// unicórnio mudar no jogo, este teste acusa e basta rodar `npm run icones`.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/icones-pwa.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const gerador = path.resolve(__dirname, '..', '..', 'pwa', 'gerar-icones.js');

test('ícones do app: os arquivos em disco são os que o gerador faz (gerar-icones.js --conferir)', () => {
  const r = spawnSync(process.execPath, [gerador, '--conferir'], { encoding: 'utf8', timeout: 60000 });
  assert.strictEqual(r.status, 0, `ícones desatualizados: rode npm run icones\n${r.stdout}${r.stderr}`);
});
