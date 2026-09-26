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
// `arqDiff`: se dado, grava ali a imagem atual apagada com os pixels diferentes em magenta
function pixelsDiferentes(a, b, arqDiff) {
  const { PNG } = require('pngjs');
  const x = PNG.sync.read(a), y = PNG.sync.read(b);
  if (x.width !== y.width || x.height !== y.height) return { erro: `tamanho ${x.width}×${x.height} ≠ ${y.width}×${y.height}` };
  let forte = 0, ruido = 0;
  const marca = arqDiff ? Buffer.from(y.data) : null;
  for (let i = 0; i < x.data.length; i += 4) {
    const m = Math.max(Math.abs(x.data[i] - y.data[i]), Math.abs(x.data[i + 1] - y.data[i + 1]), Math.abs(x.data[i + 2] - y.data[i + 2]), Math.abs(x.data[i + 3] - y.data[i + 3]));
    if (m > RUIDO_CANAL) forte++; else if (m > 0) ruido++;
    if (marca) {
      if (m > RUIDO_CANAL) marca.set([255, 0, 255, 255], i);
      else for (let c = 0; c < 3; c++) marca[i + c] = 200 + (marca[i + c] >> 3);
    }
  }
  if (marca && (forte || ruido > RUIDO_MAX)) {
    fs.mkdirSync(path.dirname(arqDiff), { recursive: true });
    fs.writeFileSync(arqDiff, PNG.sync.write(Object.assign(new PNG({ width: y.width, height: y.height }), { data: marca })));
  }
  return { forte, ruido };
}
// op.filtro (RegExp): só as imagens cujo nome (sem .png) casa; dados, vozes e erros.txt ficam de fora.
// As imagens de diferença vão para <nova>/../diferencas/ (fora da captura, para não virarem arquivo novo).
function comparar(ref, nova, op) {
  const falhas = [], ruidos = [];
  const entra = (f) => f !== 'desempenho.json' && f !== 'erros.txt' &&
    (!op.filtro || (f.endsWith('.png') && op.filtro.test(path.basename(f, '.png'))));
  const a = listar(ref).filter(entra);
  const b = new Set(listar(nova));
  const pastaDiff = path.join(nova, '..', 'diferencas');
  a.forEach((f) => {
    if (!b.has(f)) return falhas.push(`falta ${f}`);
    const x = fs.readFileSync(path.join(ref, f)), y = fs.readFileSync(path.join(nova, f));
    if (x.equals(y)) return;
    if (f.endsWith('.png')) {
      const arqDiff = path.join(pastaDiff, f);
      const d = pixelsDiferentes(x, y, arqDiff);
      if (d.erro) falhas.push(`${f}: ${d.erro}\n      base:  ${path.join(ref, f)}\n      atual: ${path.join(nova, f)}`);
      else if (d.forte || d.ruido > RUIDO_MAX) falhas.push(`${f}: ${d.forte + d.ruido} pixels diferentes (${d.forte} fora do ruído)\n      base:  ${path.join(ref, f)}\n      atual: ${path.join(nova, f)}\n      diferença (magenta): ${arqDiff}`);
      else ruidos.push(`${f}: ${d.ruido} pixels de ruído de antialiasing`);
    } else falhas.push(`${f}: conteúdo diferente (diff -u ${path.join(ref, f)} ${path.join(nova, f)})`);
  });
  listar(nova).forEach((f) => { if (!a.includes(f) && entra(f)) falhas.push(`novo (não existe na referência): ${f}`); });
  const errosNova = fs.existsSync(path.join(nova, 'erros.txt')) ? fs.readFileSync(path.join(nova, 'erros.txt'), 'utf8').trim() : '';
  const errosRef = fs.existsSync(path.join(ref, 'erros.txt')) ? fs.readFileSync(path.join(ref, 'erros.txt'), 'utf8').trim() : '';
  if (!op.filtro && errosNova !== errosRef) falhas.push('erros de console diferentes da referência (erros.txt)');
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
  if (!total) falhas.push(op.filtro ? `nenhuma imagem da referência casa com --cenas ${op.filtro.source}` : `referência vazia: ${ref}`);
  const escopo = op.filtro ? ` — SÓ as imagens que casam com /${op.filtro.source}/ (dados, vozes e o resto não foram comparados)` : '';
  if (falhas.length) {
    console.log(`✘ ${falhas.length} diferença(s) em ${total} arquivos${escopo}:`);
    falhas.slice(0, 200).forEach((f) => console.log('  ' + f));
    return false;
  }
  console.log(`✔ idêntico à referência (${total} arquivos${escopo})` + (ruidos.length ? `; ${ruidos.length} imagens só com ruído de antialiasing (≤${RUIDO_CANAL} por canal)` : ''));
  return true;
}

module.exports = { comparar, listar, pixelsDiferentes, RUIDO_CANAL, RUIDO_MAX };
