// Títulos curtos do celular (UI.painel, ui/base.js: tabela CURTOS, D8B-11): cada chave tem de ser o título
// exato de um painel(...) do jogo; se alguém muda o título, o nome curto sumiria calado.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const JS = path.join(__dirname, '..', '..', '..', 'js');
function arquivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'voz' ? [] : arquivos(p);
    return e.name.endsWith('.js') ? [p] : [];
  });
}

test('toda chave de CURTOS é o título de um painel()', () => {
  const base = fs.readFileSync(path.join(JS, 'ui', 'base.js'), 'utf8');
  const m = base.match(/CURTOS\s*=\s*\{([\s\S]*?)\}/);
  assert.ok(m, 'tabela CURTOS não achada em ui/base.js');
  const chaves = [...m[1].matchAll(/'([^']+)'\s*:/g)].map((x) => x[1]);
  assert.ok(chaves.length > 0, 'CURTOS vazia');
  const fonte = arquivos(JS).filter((f) => !f.endsWith(path.join('ui', 'base.js'))).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const faltam = chaves.filter((k) => !fonte.includes("'" + k + "'") && !fonte.includes('"' + k + '"'));
  assert.deepStrictEqual(faltam, [], 'títulos que não existem mais: ' + faltam.join(' | '));
});
