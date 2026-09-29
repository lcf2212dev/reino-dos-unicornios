// Testes de unidade: validar-conteudo dá ERRO para emoji sem pixel art em qualquer js/**/*.js e css/*.css
// (fora js/voz/ e comentários). O arquivo plantado vai em /tmp/reino-testes/ (--emojis-extra); o jogo não muda.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/validar-emojis-pixel.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const Jogo = require('../../jogo-no-node');
const { PASTA_TESTES } = require('../guardas');

fs.mkdirSync(PASTA_TESTES, { recursive: true });
const tmp = fs.mkdtempSync(path.join(PASTA_TESTES, 'validar-emojis-'));
function validar(texto) {
  const arq = path.join(tmp, 'plantado-' + Math.random().toString(36).slice(2) + '.js');
  fs.writeFileSync(arq, texto);
  const r = spawnSync(process.execPath, ['ferramentas/validar/validar-conteudo.js', '--emojis-extra', arq], { cwd: Jogo.raiz, encoding: 'utf8' });
  return { status: r.status, saida: r.stdout + r.stderr };
}

test('emoji sem desenho num texto do jogo: erro', () => {
  const r = validar("var t = 'Olá 🦑!';\n");
  assert.notStrictEqual(r.status, 0, r.saida);
  assert.match(r.saida, /emoji 🦑 sem pixel art/);
});
test('emoji com desenho (e com U+FE0F) passa', () => {
  const r = validar("var t = '📖 ⚖️ 2️⃣ 🛡️';\n");
  assert.strictEqual(r.status, 0, r.saida);
});
test('emoji só em comentário não conta', () => {
  const r = validar("// 🦑 aqui\n/* 🦑 lá */\nvar u = 'http://x'; // 🦑\n");
  assert.strictEqual(r.status, 0, r.saida);
});
test('desenho registrado na própria tela (Reino.registrarIcones) conta', () => {
  const r = validar("Reino.registrarIcones({ '🦑': { n: 'lula', p: {}, d: [] } });\nvar t = '🦑';\n");
  assert.strictEqual(r.status, 0, r.saida);
});
