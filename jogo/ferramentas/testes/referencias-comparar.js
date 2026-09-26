// Referências — comparação de duas capturas (arquivo a arquivo; imagens com tolerância ao ruído
// de antialiasing, docs/decisoes/referencias-ruido.md). A CLI fica em referencias.js.
const fs = require('fs');
const path = require('path');
const { REGIOES, ROTULOS, classificar } = require('./referencias-regioes');

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
// Células CELULA×CELULA px (do aparelho) com pixel forte, marcadas no mesmo laço; células vizinhas
// (8 lados) viram uma caixa. As caixas saem em px CSS (÷ densidade: celular 3, tablet 2, notebook 1).
const CELULA = 8;
function caixasDeCelulas(cel, cw, ch, densidade) {
  const caixas = [], visto = new Uint8Array(cel.length), pilha = [];
  for (let k = 0; k < cel.length; k++) {
    if (!cel[k] || visto[k]) continue;
    let x0 = cw, y0 = ch, x1 = -1, y1 = -1, px = 0;
    visto[k] = 1; pilha.push(k);
    while (pilha.length) {
      const q = pilha.pop(), cx = q % cw, cy = (q - cx) / cw;
      px += cel[q];
      if (cx < x0) x0 = cx; if (cx > x1) x1 = cx; if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx, ny = cy + dy, v = ny * cw + nx;
        if (nx >= 0 && ny >= 0 && nx < cw && ny < ch && cel[v] && !visto[v]) { visto[v] = 1; pilha.push(v); }
      }
    }
    const d = densidade || 1;
    const x = Math.floor(x0 * CELULA / d), y = Math.floor(y0 * CELULA / d);
    caixas.push({ x, y, w: Math.ceil((x1 + 1) * CELULA / d) - x, h: Math.ceil((y1 + 1) * CELULA / d) - y, px });
  }
  return caixas.sort((p, q) => q.px - p.px);
}
// `arqDiff`: se dado, grava ali a imagem atual apagada com os pixels diferentes em magenta.
// Devolve { forte, ruido, caixas: [{x,y,w,h,px}] em px CSS } (ou { erro }).
function pixelsDiferentes(a, b, arqDiff, densidade = 1) {
  const { PNG } = require('pngjs');
  const x = PNG.sync.read(a), y = PNG.sync.read(b);
  if (x.width !== y.width || x.height !== y.height) return { erro: `tamanho ${x.width}×${x.height} ≠ ${y.width}×${y.height}` };
  let forte = 0, ruido = 0;
  const marca = arqDiff ? Buffer.from(y.data) : null;
  const W = x.width, cw = Math.ceil(W / CELULA), ch = Math.ceil(x.height / CELULA);
  const cel = new Uint32Array(cw * ch);
  for (let i = 0; i < x.data.length; i += 4) {
    const m = Math.max(Math.abs(x.data[i] - y.data[i]), Math.abs(x.data[i + 1] - y.data[i + 1]), Math.abs(x.data[i + 2] - y.data[i + 2]), Math.abs(x.data[i + 3] - y.data[i + 3]));
    if (m > RUIDO_CANAL) {
      forte++;
      const p = i >> 2, px = p % W;
      cel[((p - px) / W >> 3) * cw + (px >> 3)]++;
    } else if (m > 0) ruido++;
    if (marca) {
      if (m > RUIDO_CANAL) marca.set([255, 0, 255, 255], i);
      else for (let c = 0; c < 3; c++) marca[i + c] = 200 + (marca[i + c] >> 3);
    }
  }
  if (marca && (forte || ruido > RUIDO_MAX)) {
    fs.mkdirSync(path.dirname(arqDiff), { recursive: true });
    fs.writeFileSync(arqDiff, PNG.sync.write(Object.assign(new PNG({ width: y.width, height: y.height }), { data: marca })));
  }
  return { forte, ruido, caixas: forte ? caixasDeCelulas(cel, cw, ch, densidade) : [] };
}
// Resumo das imagens diferentes por tamanho e região (referencias-regioes.js). `imagens`: [{ f, caixas }]
// com f = imagens/<tamanho>/<nome>.png. Devolve { total, porTamanho: { celular: { hudTopo, dock, balao,
// outras, nomes: { hudTopo: [...] } } }, outras: [{ f, caixas }] }.
function resumir(imagens, tabela = REGIOES) {
  const r = { total: imagens.length, porTamanho: {}, outras: [] };
  imagens.forEach((im) => {
    const partes = im.f.split(path.sep), tamanho = partes[partes.length - 2] || '?';
    const t = r.porTamanho[tamanho] || (r.porTamanho[tamanho] = { hudTopo: 0, dock: 0, balao: 0, outras: 0, nomes: {} });
    const reg = im.caixas ? classificar(im.caixas, tamanho, tabela) : 'outras';
    t[reg]++;
    (t.nomes[reg] || (t.nomes[reg] = [])).push(path.basename(im.f, '.png'));
    if (reg === 'outras') r.outras.push(im);
  });
  return r;
}
const linhaResumo = (n, t) => `${n} imagens diferentes — só HUD ${t.hudTopo} · só dock ${t.dock} · só balão ${t.balao} · outras ${t.outras}`;
function imprimirResumo(r) {
  if (!r.total) return;
  const soma = { hudTopo: 0, dock: 0, balao: 0, outras: 0 };
  Object.values(r.porTamanho).forEach((t) => Object.keys(soma).forEach((k) => { soma[k] += t[k]; }));
  console.log(`Resumo: ${linhaResumo(r.total, soma)}`);
  Object.keys(r.porTamanho).forEach((tm) => {
    const t = r.porTamanho[tm];
    console.log(`  ${tm}: ${linhaResumo(t.hudTopo + t.dock + t.balao + t.outras, t)}`);
    Object.keys(ROTULOS).forEach((k) => {
      if (t[k]) console.log(`    ${ROTULOS[k]}: ${t.nomes[k].slice(0, 5).join(', ')}${t[k] > 5 ? `, … (+${t[k] - 5})` : ''}`);
    });
  });
}
const txtCaixas = (c) => c.slice(0, 8).map((b) => `[${b.x},${b.y} ${b.w}×${b.h}: ${b.px} px]`).join(' ') + (c.length > 8 ? ` … (+${c.length - 8})` : '');

// op.filtro (RegExp): só as imagens cujo nome (sem .png) casa; dados, vozes e erros.txt ficam de fora.
// As imagens de diferença vão para <nova>/../diferencas/ (fora da captura, para não virarem arquivo novo).
function comparar(ref, nova, op) {
  const falhas = [], ruidos = [], imagens = [];
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
      const tm = f.split(path.sep).slice(-2)[0];
      const d = pixelsDiferentes(x, y, arqDiff, (REGIOES[tm] || {}).densidade);
      if (d.erro) imagens.push({ f, texto: `${f}: ${d.erro}\n      base:  ${path.join(ref, f)}\n      atual: ${path.join(nova, f)}` });
      else if (d.forte || d.ruido > RUIDO_MAX) imagens.push({ f, caixas: d.caixas, texto: `${f}: ${d.forte + d.ruido} pixels diferentes (${d.forte} fora do ruído)` +
        (d.caixas.length ? `\n      caixas (px CSS): ${txtCaixas(d.caixas)}` : '') +
        `\n      base:  ${path.join(ref, f)}\n      atual: ${path.join(nova, f)}\n      diferença (magenta): ${arqDiff}` });
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
  // imagens de região conhecida só entram no resumo (contagem + 5 nomes); as "outras" vão à lista
  const resumo = resumir(imagens);
  resumo.outras.forEach((im) => falhas.push(im.texto));
  const conhecidas = resumo.total - resumo.outras.length;
  if (resumo.total) {
    try { fs.writeFileSync(path.join(nova, '..', 'resumo.json'), JSON.stringify({ ...resumo, outras: resumo.outras.map((im) => ({ f: im.f, caixas: im.caixas || null })) }, null, 1) + '\n'); } catch (e) { /* pasta só de leitura */ }
  }
  const total = a.length;
  if (!total) falhas.push(op.filtro ? `nenhuma imagem da referência casa com --cenas ${op.filtro.source}` : `referência vazia: ${ref}`);
  const escopo = op.filtro ? ` — SÓ as imagens que casam com /${op.filtro.source}/ (dados, vozes e o resto não foram comparados)` : '';
  if (falhas.length || conhecidas) {
    imprimirResumo(resumo);
    console.log(`✘ ${falhas.length + conhecidas} diferença(s) em ${total} arquivos${escopo}` + (conhecidas ? ` (${conhecidas} só em HUD/dock/balão, no resumo acima)` : '') + (falhas.length ? ':' : ''));
    falhas.slice(0, 200).forEach((f) => console.log('  ' + f));
    return { ok: false, resumo };
  }
  console.log(`✔ idêntico à referência (${total} arquivos${escopo})` + (ruidos.length ? `; ${ruidos.length} imagens só com ruído de antialiasing (≤${RUIDO_CANAL} por canal)` : ''));
  return { ok: true, resumo };
}

module.exports = { comparar, listar, pixelsDiferentes, resumir, RUIDO_CANAL, RUIDO_MAX, CELULA };
