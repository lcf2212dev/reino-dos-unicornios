// Testes de unidade da cobertura dos livros do 4º bimestre (jogo/ferramentas/validar/cobertura-4bim.js).
// O inventário vem de matérias/ (fora do git): numa árvore sem a pasta (worktree nova) faltar o inventário é aviso;
// com a pasta no disco, inventário que falta é erro.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/cobertura-4bim.test.js   (tudo: npm test)
// Os temporários ficam em /tmp/reino-testes/cobertura-4bim-*/ (não são apagados; o sistema limpa ao reiniciar).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { cobertura } = require('../../validar/cobertura-4bim');

const TMP = '/tmp/reino-testes';
function pastaNova() {
  fs.mkdirSync(TMP, { recursive: true });
  return fs.mkdtempSync(path.join(TMP, 'cobertura-4bim-'));
}
const MATERIA = { id: 'ciencias4', nome: 'Ciências', inventario: 'matérias/4 Bimestre/ciências/INVENTARIO.md', salas: [], livro: [] };

test('sem a pasta matérias/ (fora do git): aviso, não erro', () => {
  const raiz = pastaNova();
  const r = cobertura(MATERIA, raiz);
  assert.deepStrictEqual(r.erros, []);
  assert.strictEqual(r.avisos.length, 1);
  assert.match(r.avisos[0], /inventário não está nesta árvore/);
  assert.deepStrictEqual(r.linhas, []);
});

test('com a pasta matérias/ e o inventário faltando: erro', () => {
  const raiz = pastaNova();
  fs.mkdirSync(path.join(raiz, 'matérias', '4 Bimestre', 'ciências'), { recursive: true });
  const r = cobertura(MATERIA, raiz);
  assert.strictEqual(r.erros.length, 1);
  assert.match(r.erros[0], /inventário não existe/);
});
