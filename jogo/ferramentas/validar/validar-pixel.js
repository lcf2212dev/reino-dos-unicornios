// Pixel art na moldura (docs/contratos/ui.md §10): nada liso chega à tela.
// Uso: node ferramentas/validar/validar-pixel.js [--raiz <pasta jogo>]   (roda no npm run validar)
// CSS (css/*.css, sem os comentários):
//   - border-radius só com 0, var(--canto), var(--canto-grande) ou var(--redondo) (o corner-shape: notch de
//     ui-base.css faz o degrau);
//   - degradê só com paradas duras (cada cor começa onde a anterior termina: "#a 0 40%, #b 40% 100%");
//   - sombra (box-shadow, text-shadow, drop-shadow) sem desfoque, e nada de blur();
//   - rotate só em múltiplos de 90° (girar pixel em outro ângulo borra).
// JS (js/**, fora js/voz/): createLinearGradient, createRadialGradient, shadowBlur diferente de 0, .arc( e
//   .ellipse( no canvas. Exceção de propósito: "// pixel-ok: <motivo>" na mesma linha.
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');

const jogo = path.join(__dirname, '..', '..');
const CANTOS = new Set(['0', '0px', 'var(--canto)', 'var(--canto-grande)', 'var(--redondo)', 'inherit', 'initial', 'unset']);

function semComentarios(css) { return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')); }
function linhaDe(texto, i) { return texto.slice(0, i).split('\n').length; }
// divide por vírgula (ou espaço) de nível 0 (fora de parênteses)
function dividir(s, sep) {
  const partes = []; let prof = 0, atual = '';
  for (const c of s) {
    if (c === '(') prof++;
    if (c === ')') prof--;
    if (prof === 0 && (sep === ' ' ? /\s/.test(c) : c === sep)) { if (atual.trim()) partes.push(atual.trim()); atual = ''; continue; }
    atual += c;
  }
  if (atual.trim()) partes.push(atual.trim());
  return partes;
}
// o texto entre os parênteses que abrem em `i` (i = índice do "(")
function dentroDe(s, i) {
  let prof = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '(') prof++;
    else if (s[j] === ')' && --prof === 0) return s.slice(i + 1, j);
  }
  return s.slice(i + 1);
}
const COMPRIMENTO = /^-?(\d*\.)?\d+(px|%|em|rem|vh|vw|vmin|vmax|deg)?$|^var\(|^calc\(|^min\(|^max\(|^clamp\(/;

// degradê: a lista de paradas é dura? (a 1ª parte pode ser direção/forma)
function degradeDuro(args) {
  let partes = dividir(args, ',');
  if (partes.length && /^(to |-?[\d.]+(deg|turn|rad)|circle|ellipse|closest|farthest|at |from )/.test(partes[0])) partes = partes.slice(1);
  const paradas = partes.map((p) => {
    const t = dividir(p, ' ');
    const pos = [];
    while (t.length > 1 && COMPRIMENTO.test(t[t.length - 1])) pos.unshift(t.pop());
    return { cor: t.join(' '), pos };
  }).filter((p) => p.cor);
  if (paradas.length < 2) return true;
  for (let i = 1; i < paradas.length; i++) {
    const a = paradas[i - 1], b = paradas[i];
    if (a.cor === b.cor) continue;
    if (!a.pos.length || !b.pos.length) return false;
    if (a.pos[a.pos.length - 1] !== b.pos[0] && b.pos[0] !== '0' && b.pos[0] !== '0px') return false;
  }
  return true;
}
// sombras: alguma com desfoque? (x y desfoque ...)
function sombraBorrada(valor) {
  return dividir(valor, ',').some((s) => {
    const nums = dividir(s, ' ').filter((t) => COMPRIMENTO.test(t) && !/^var\(/.test(t));
    return nums.length >= 3 && !/^0(px)?$/.test(nums[2]);
  });
}

function checarCss(nome, texto, erros) {
  const t = semComentarios(texto);
  for (const m of t.matchAll(/border(-(top|bottom)-(left|right))?-radius\s*:\s*([^;}]+)/g)) {
    const ruins = dividir(m[4].replace(/!important/, '').replace(/\//g, ' '), ' ').filter((v) => !CANTOS.has(v));
    if (ruins.length) erros.push(`${nome}:${linhaDe(t, m.index)}: border-radius "${m[4].trim()}" (use 0, var(--canto), var(--canto-grande) ou var(--redondo))`);
  }
  for (const m of t.matchAll(/(repeating-)?(linear|radial|conic)-gradient\(/g)) {
    const args = dentroDe(t, m.index + m[0].length - 1);
    if (!degradeDuro(args)) erros.push(`${nome}:${linhaDe(t, m.index)}: degradê liso "${m[0]}${args.slice(0, 60)}..." (faixas com paradas duras)`);
  }
  for (const m of t.matchAll(/(box-shadow|text-shadow)\s*:\s*([^;}]+)/g)) {
    if (sombraBorrada(m[2])) erros.push(`${nome}:${linhaDe(t, m.index)}: ${m[1]} com desfoque "${m[2].trim()}"`);
  }
  for (const m of t.matchAll(/drop-shadow\(/g)) {
    const args = dentroDe(t, m.index + m[0].length - 1);
    if (sombraBorrada(args)) erros.push(`${nome}:${linhaDe(t, m.index)}: drop-shadow com desfoque "${args.trim()}"`);
  }
  for (const m of t.matchAll(/\bblur\(/g)) erros.push(`${nome}:${linhaDe(t, m.index)}: blur()`);
  for (const m of t.matchAll(/rotate\(\s*(-?[\d.]+)(deg|turn)?\s*\)/g)) {
    const graus = m[2] === 'turn' ? +m[1] * 360 : +m[1];
    if (graus % 90 !== 0) erros.push(`${nome}:${linhaDe(t, m.index)}: rotate(${m[1]}${m[2] || ''}) borra os pixels`);
  }
}

const CANVAS = [
  [/create(Linear|Radial|Conic)Gradient\(/, 'degradê no canvas'],
  [/shadowBlur\s*=(?!\s*0\s*[;,)])/, 'shadowBlur (desfoque)'],
  [/\.(arc|ellipse)\(/, 'arco/elipse liso no canvas'],
];
function checarJs(nome, texto, erros) {
  texto.split('\n').forEach((l, i) => {
    if (/pixel-ok:/.test(l)) return;
    const codigo = l.replace(/\/\/.*$/, '');
    for (const [re, o] of CANVAS) if (re.test(codigo)) erros.push(`${nome}:${i + 1}: ${o} (use os helpers pixel ou marque "// pixel-ok: <motivo>")`);
  });
}

function arquivosJs(dir, lista = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'voz') arquivosJs(p, lista); } else if (e.name.endsWith('.js')) lista.push(p);
  }
  return lista;
}

function validar(raiz = jogo) {
  const erros = [];
  const css = path.join(raiz, 'css');
  for (const f of fs.readdirSync(css).filter((n) => n.endsWith('.css')).sort()) checarCss('css/' + f, fs.readFileSync(path.join(css, f), 'utf8'), erros);
  for (const f of arquivosJs(path.join(raiz, 'js'))) checarJs(path.relative(raiz, f), fs.readFileSync(f, 'utf8'), erros);
  return erros;
}

if (require.main === module) {
  const i = process.argv.indexOf('--raiz');
  const erros = validar(i >= 0 ? path.resolve(process.argv[i + 1]) : jogo);
  erros.forEach((e) => console.log('✘ ' + e));
  if (erros.length) { console.log(`✘ ${erros.length} ponto(s) sem pixel art (docs/contratos/ui.md §10)`); process.exit(1); }
  console.log('✔ tudo em pixel art: cantos, faixas, sombras, rotações e canvas');
}

module.exports = { validar, checarCss, checarJs, degradeDuro, sombraBorrada };
