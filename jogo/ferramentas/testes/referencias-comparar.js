// Referências — comparação de duas capturas (arquivo a arquivo; imagens com tolerância ao ruído
// de antialiasing, docs/decisoes/referencias-ruido.md). A CLI fica em referencias.js.
const fs = require('fs');
const path = require('path');

/* ---------- comparação ---------- */
function listar(p) {
  if (!fs.existsSync(p)) return [];
  const r = [];
  (function andar(d, rel) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      if (e.isDirectory()) andar(path.join(d, e.name), path.join(rel, e.name));
      else r.push(path.join(rel, e.name));
    });
  })(p, '');
  return r.sort();
}
// Diferença de pixels. `ruido`: pixels que mudam no máximo RUIDO_CANAL em cada canal. O Chromium
// rasteriza elementos com transform: scale estático com ±1–3 de diferença entre execuções no
// celular (densidade 3), mesmo no modo determinístico (docs/decisoes/referencias-ruido.md).
// Até RUIDO_MAX pixels assim por imagem contam como ruído; qualquer outro pixel diferente reprova.
const RUIDO_CANAL = 4, RUIDO_MAX = 64;
function pixelsDiferentes(a, b) {
  const { PNG } = require('pngjs');
  const x = PNG.sync.read(a), y = PNG.sync.read(b);
  if (x.width !== y.width || x.height !== y.height) return { erro: `tamanho ${x.width}×${x.height} ≠ ${y.width}×${y.height}` };
  let forte = 0, ruido = 0;
  for (let i = 0; i < x.data.length; i += 4) {
    const m = Math.max(Math.abs(x.data[i] - y.data[i]), Math.abs(x.data[i + 1] - y.data[i + 1]), Math.abs(x.data[i + 2] - y.data[i + 2]), Math.abs(x.data[i + 3] - y.data[i + 3]));
    if (m > RUIDO_CANAL) forte++; else if (m > 0) ruido++;
  }
  return { forte, ruido };
}
function comparar(ref, nova, op) {
  const falhas = [], ruidos = [];
  const a = listar(ref).filter((f) => f !== 'desempenho.json' && f !== 'erros.txt');
  const b = new Set(listar(nova));
  a.forEach((f) => {
    if (!b.has(f)) return falhas.push(`falta ${f}`);
    const x = fs.readFileSync(path.join(ref, f)), y = fs.readFileSync(path.join(nova, f));
    if (x.equals(y)) return;
    if (f.endsWith('.png')) {
      const d = pixelsDiferentes(x, y);
      if (d.erro) falhas.push(`${f}: ${d.erro}`);
      else if (d.forte || d.ruido > RUIDO_MAX) falhas.push(`${f}: ${d.forte + d.ruido} pixels diferentes (${d.forte} fora do ruído)`);
      else ruidos.push(`${f}: ${d.ruido} pixels de ruído de antialiasing`);
    } else falhas.push(`${f}: conteúdo diferente (diff -u ${path.join(ref, f)} ${path.join(nova, f)})`);
  });
  listar(nova).forEach((f) => { if (!a.includes(f) && f !== 'desempenho.json' && f !== 'erros.txt') falhas.push(`novo (não existe na referência): ${f}`); });
  const errosNova = fs.existsSync(path.join(nova, 'erros.txt')) ? fs.readFileSync(path.join(nova, 'erros.txt'), 'utf8').trim() : '';
  const errosRef = fs.existsSync(path.join(ref, 'erros.txt')) ? fs.readFileSync(path.join(ref, 'erros.txt'), 'utf8').trim() : '';
  if (errosNova !== errosRef) falhas.push('erros de console diferentes da referência (erros.txt)');
  if (op.desempenho) {
    const x = JSON.parse(fs.readFileSync(path.join(ref, 'desempenho.json'), 'utf8'));
    const y = JSON.parse(fs.readFileSync(path.join(nova, 'desempenho.json'), 'utf8'));
    Object.keys(x).forEach((k) => {
      const lim = x[k] * 1.05;
      const ok = y[k] <= lim;
      console.log(`  ${ok ? '✔' : '✘'} ${k}: ${x[k].toFixed(3)} → ${y[k].toFixed(3)} ms`);
      if (!ok) falhas.push(`desempenho ${k}: ${y[k].toFixed(3)} ms > ${lim.toFixed(3)} ms (referência + 5%)`);
    });
  }
  const total = a.length;
  if (!total) falhas.push(`referência vazia: ${ref}`);
  if (falhas.length) {
    console.log(`✘ ${falhas.length} diferença(s) em ${total} arquivos:`);
    falhas.slice(0, 200).forEach((f) => console.log('  ' + f));
    return false;
  }
  console.log(`✔ idêntico à referência (${total} arquivos)` + (ruidos.length ? `; ${ruidos.length} imagens só com ruído de antialiasing (≤${RUIDO_CANAL} por canal)` : ''));
  return true;
}

module.exports = { comparar, listar, pixelsDiferentes, RUIDO_CANAL, RUIDO_MAX };
