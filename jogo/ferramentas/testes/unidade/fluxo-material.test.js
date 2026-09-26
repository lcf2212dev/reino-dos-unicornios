// fluxo/material.js com imagens geradas pelo magick numa pasta temporária (/tmp/reino-testes/fluxo-mat-*):
// cópias reduzidas (só reduz), índice na ordem do nome, arquivo que não é imagem no índice, folha de contato.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const C = require('../../fluxo/comum');
const { gerarMaterial } = require('../../fluxo/material');

const temMagick = C.rodar('magick', ['-version']).ok;

test('material: reduz, numera, indexa e monta a folha', { skip: !temMagick && 'sem ImageMagick' }, () => {
  fs.mkdirSync(C.PASTA_TESTES, { recursive: true });
  const base = fs.mkdtempSync(path.join(C.PASTA_TESTES, 'fluxo-mat-'));
  const pasta = path.join(base, `Matéria Teste ${path.basename(base).slice(-6)}`);
  fs.mkdirSync(path.join(pasta, 'sub'), { recursive: true });
  const magick = (...a) => assert.ok(C.rodar('magick', a).ok, 'magick ' + a.join(' '));
  magick('-size', '2400x1600', 'gradient:red-blue', path.join(pasta, 'IMG_10.png'));
  magick('-size', '300x200', 'xc:green', path.join(pasta, 'sub', 'IMG_2.jpg'));
  fs.writeFileSync(path.join(pasta, 'anotacoes.txt'), 'não é imagem');

  const r = gerarMaterial([pasta, '--lado', '800', '--folha'], base);
  assert.strictEqual(r.para, path.join(C.PASTA_TESTES, 'material', C.slug(path.basename(pasta))));
  assert.deepStrictEqual(r.saidas.map((s) => s.nome), ['01-img-10.jpg', '02-sub-img-2.jpg']);
  const dims = (f) => C.rodar('magick', ['identify', '-format', '%w %h', f]).saida.trim();
  assert.strictEqual(dims(r.saidas[0].destino), '800 533');
  assert.strictEqual(dims(r.saidas[1].destino), '300 200', 'imagem pequena não é ampliada');
  const indice = fs.readFileSync(r.indice, 'utf8');
  assert.match(indice, /^01 \| IMG_10\.png \| 2400x1600 → 800x533 \| \d+ → \d+ \| sem data$/m);
  assert.match(indice, /^-- \| anotacoes\.txt \| ignorado/m);
  assert.strictEqual(r.folhas.length, 1);
  assert.ok(fs.statSync(r.folhas[0]).size > 0);
  // o original não muda
  assert.strictEqual(dims(path.join(pasta, 'IMG_10.png')), '2400 1600');
  assert.throws(() => gerarMaterial([path.join(base, 'nao-existe')], base), /não encontrada|ENOENT/);
});
