// npm run tamanho: código acima de 420 linhas só avisa (com a lista), acima de 600 falha; dados até 800; gerados fora.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const tamanho = path.join(__dirname, '../../tamanho.js');
const T = require(tamanho);
// cópia de mentira do jogo em os.tmpdir() (jogo/ferramentas/CLAUDE.md)
const raiz = path.join(require('os').tmpdir(), `reino-testes/tamanho-${process.pid}`);
function escrever(rel, n) {
  fs.mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true });
  fs.writeFileSync(path.join(raiz, rel), 'x\n'.repeat(n));
}
const rodar = () => spawnSync(process.execPath, [tamanho, '--raiz', raiz], { encoding: 'utf8' });

test('limites: código avisa acima de 420 e falha acima de 600; dados 800', () => {
  assert.deepStrictEqual([T.AVISO.codigo, T.LIMITE.codigo, T.LIMITE.dados, T.LIMITE.tipos], [420, 600, 800, 1000]);
});

test('código entre 421 e 600: aviso com a lista, sai 0; acima de 600 falha', () => {
  escrever('js/motor/pequeno.js', 400);
  escrever('js/motor/grande.js', 430);
  escrever('css/estilo.css', 421);
  escrever('js/conteudo/materias/x/sala.js', 790);
  escrever('js/voz/pacote.js', 5000);
  let r = rodar();
  assert.strictEqual(r.status, 0, r.stdout);
  assert.match(r.stdout, /⚠ 2 arquivo\(s\) de código acima de 420/);
  assert.match(r.stdout, /js\/motor\/grande\.js: 430 linhas\n {2}css\/estilo\.css: 421 linhas/);
  assert.doesNotMatch(r.stdout, /pequeno|sala\.js|pacote/);
  const c = T.conferir(raiz);
  assert.deepStrictEqual(c.avisos.map((t) => t.rel).sort(), ['css/estilo.css', 'js/motor/grande.js']);
  escrever('ferramentas/enorme.js', 601);
  escrever('js/conteudo/materias/x/sala.js', 801);
  r = rodar();
  assert.strictEqual(r.status, 1);
  assert.match(r.stdout, /✘ 2 arquivo\(s\) acima do limite/);
  assert.match(r.stdout, /ferramentas\/enorme\.js: 601 linhas \(codigo, limite 600\)/);
  assert.match(r.stdout, /sala\.js: 801 linhas \(dados, limite 800\)/);
});
