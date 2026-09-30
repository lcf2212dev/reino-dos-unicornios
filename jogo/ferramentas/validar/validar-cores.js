// Cores da moldura (docs/contratos/ui.md §10.8 e §10.19.1): toda cor de CSS sai de um token do :root.
// Uso: node ferramentas/validar/validar-cores.js [--raiz <pasta jogo>] [--contas]   (roda no npm run validar)
// CSS (css/*.css, sem os comentários):
//   - cor literal (#hex, rgb()/hsl()/…, nome de cor como white) só dentro de um bloco `:root { … }`;
//   - SVG em data: (não aceita var()): o fill/stroke leva o hex de um token do :root de ui-base.css (%23…), nunca
//     rgb(); o fill-opacity só com um degrau de alfa dos tokens (--brilho, --sombra-*, --veu*: 0,2 0,35 0,4 0,45 0,85);
//   - grayscale() só no :root (o desenho indisponível usa filter: var(--apagado); nunca no texto);
//   - opacity só em @keyframes, na transição de véu e flash e nos dois estados parados do §10.19.1 (EXCECOES_OPACITY,
//     seletor inteiro: `.fotos-flash .x` não herda a exceção); no escondido-até-o-foco, só 0 ou 1;
//   - var(--x) sem reserva aponta para uma variável que existe (no CSS ou escrita pelo JS);
//   - o :root de ui-base.css e Reino.config.paleta (js/nucleo/config.js, o que o canvas usa) dão o mesmo hex.
// --contas: imprime as contas do inventário da paleta (literais, claras, tintas, opacity) e sai.
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jogo = path.join(__dirname, '..', '..');
// ui.md §10.19.1: onde opacity vale fora de @keyframes. Seletor INTEIRO (cada parte da lista, sem espaços a mais) →
// só estes valores (null = qualquer). Seletor novo com opacity entra aqui só se o contrato deixar
const EXCECOES_OPACITY = new Map([
  // transição de véu e flash
  ['.abertura-flash', null], ['.abertura.entrando .abertura-flash', null],
  ['.abertura-entrando .titulo-abertura', null], ['.abertura-entrando .inicio-baixo', null],
  ['.fotos-flash', null], ['.fotos-flash.sumindo', null], ['.fotos-flash.suave', null], ['.fotos-flash.suave.sumindo', null],
  // escondido até o foco
  ['.criar-opcao.criar-lasca', ['0', '1']], ['.criar-opcao.criar-lasca:focus-visible', ['0', '1']],
  // joystick translúcido sobre o mapa
  ['#controle .controle-base', null],
]);
// Reino.config.paleta → token do :root
const PALETA = {
  tinta: '--tinta', tintaSuave: '--tinta-suave', noite: '--noite', noite2: '--noite-2',
  papel: '--papel', papel2: '--papel-2', papelQuente: '--papel-quente', grama: '--grama',
};
const NOMES_COR = new Set(('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
  'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod ' +
  'darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon ' +
  'darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey ' +
  'dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey ' +
  'honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral ' +
  'lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue ' +
  'lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine ' +
  'mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise ' +
  'mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered ' +
  'orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple ' +
  'rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue ' +
  'slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow ' +
  'yellowgreen').split(' '));
const FUNCAO_COR = /\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g;

function semComentarios(css) { return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')); }
function linhaDe(texto, i) { return texto.slice(0, i).split('\n').length; }
function hex6(h) {
  h = h.toLowerCase().replace('#', '');
  if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('');
  return '#' + h.slice(0, 6);
}
// trechos [ini, fim) de cada bloco que abre em `re` (chaves balanceadas)
function blocos(t, re) {
  const out = [];
  for (const m of t.matchAll(re)) {
    const ini = m.index + m[0].length - 1;
    let prof = 0;
    for (let j = ini; j < t.length; j++) {
      if (t[j] === '{') prof++;
      else if (t[j] === '}' && --prof === 0) { out.push([m.index, j + 1, m]); break; }
    }
  }
  return out;
}
const dentro = (lista, i) => lista.some(([a, b]) => i >= a && i < b);
// o seletor da regra em volta da posição i
function seletorDe(t, i) {
  const abre = t.lastIndexOf('{', i);
  const antes = Math.max(t.lastIndexOf('}', abre), t.lastIndexOf(';', abre), t.lastIndexOf('{', abre - 1));
  return t.slice(antes + 1, abre).trim();
}
// troca cada url(...) por espaços (mesmo tamanho: as linhas não mudam) e devolve os trechos
function tirarUrls(t) {
  const urls = [];
  const limpo = t.replace(/url\(\s*(["']?)([\s\S]*?)\1\s*\)/g, (m, q, dentroUrl, off) => { urls.push({ off, texto: dentroUrl }); return m.replace(/[^\n]/g, ' '); });
  return { limpo, urls };
}

// as variáveis do :root de ui-base.css (valor cru) e o hex resolvido de cada uma
function tokens(raiz) {
  const t = semComentarios(fs.readFileSync(path.join(raiz, 'css', 'ui-base.css'), 'utf8'));
  const b = blocos(t, /(^|\n)\s*:root\s*\{/g)[0];
  const cru = {};
  if (b) for (const m of t.slice(b[0], b[1]).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) cru[m[1]] = m[2].trim();
  const resolver = (v, n = 0) => { const m = /^var\((--[\w-]+)\)$/.exec(v); return m && n < 5 && cru[m[1]] ? resolver(cru[m[1]], n + 1) : v; };
  const hex = {};
  for (const k of Object.keys(cru)) { const v = resolver(cru[k]); if (/^#[0-9a-f]{3,8}$/i.test(v)) hex[k] = hex6(v); }
  // todo hex escrito no :root (inclusive os das faixas do --arco-iris): o que um SVG em data: pode usar
  const permitidos = new Set();
  for (const v of Object.values(cru)) for (const m of v.matchAll(/#[0-9a-f]{3,8}\b/gi)) permitidos.add(hex6(m[0]));
  // os degraus de alfa (os rgba() do :root: brilho, sombra, véu, vinheta) e o 1 opaco
  const alfas = new Set([1]);
  for (const v of Object.values(cru)) for (const m of v.matchAll(/rgba\([^)]*,\s*([\d.]+)\s*\)/g)) alfas.add(Number(m[1]));
  return { cru, hex, permitidos, alfas };
}

function paletaDoJs(raiz) {
  const ctx = { window: {} };
  ctx.window.Reino = {}; ctx.Reino = ctx.window.Reino;
  vm.runInNewContext(fs.readFileSync(path.join(raiz, 'js', 'nucleo', 'config.js'), 'utf8'), ctx, { filename: 'config.js' });
  return (ctx.Reino.config || {}).paleta;
}

function textoJs(dir, partes = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'voz') textoJs(p, partes); } else if (e.name.endsWith('.js')) partes.push(fs.readFileSync(p, 'utf8'));
  }
  return partes.join('\n');
}

function checarCss(nome, texto, tk, definidas, js, erros) {
  const t0 = semComentarios(texto);
  const { limpo: t, urls } = tirarUrls(t0);
  const raizes = blocos(t, /(^|\n)\s*:root\s*\{/g);
  const quadros = blocos(t, /@keyframes\s+[\w-]+\s*\{/g);
  // 1. cor literal fora do :root
  for (const m of t.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    if (!dentro(raizes, m.index)) erros.push(`${nome}:${linhaDe(t, m.index)}: cor literal ${m[0]} fora do :root (use um token: ui.md §10.8)`);
  }
  for (const m of t.matchAll(FUNCAO_COR)) {
    if (!dentro(raizes, m.index)) erros.push(`${nome}:${linhaDe(t, m.index)}: cor literal ${m[1]}() fora do :root (use um token: ui.md §10.8)`);
  }
  for (const m of t.matchAll(/([\w-]+)\s*:\s*([^;{}]+)/g)) {
    if (m[1].startsWith('--') || dentro(raizes, m.index)) continue;
    const valor = m[2].replace(/(["'])[^"']*\1/g, ' ').replace(/var\([^)]*\)/g, ' ');
    for (const w of valor.toLowerCase().match(/[a-z]+(-[a-z]+)*/g) || []) {
      if (NOMES_COR.has(w)) erros.push(`${nome}:${linhaDe(t, m.index)}: cor por nome "${w}" em ${m[1]} (use um token: ui.md §10.8)`);
    }
  }
  // 2. SVG em data:: hex de token, nada de rgb(); o alfa (fill-opacity…) só nos degraus dos tokens de alfa
  for (const u of urls) {
    if (!/^data:/.test(u.texto)) continue;
    const svg = decodeURIComponent(u.texto.replace(/^data:[^,]*,/, '').replace(/%(?![0-9a-fA-F]{2})/g, '%25'));
    for (const m of svg.matchAll(/(fill-opacity|stroke-opacity|opacity|stop-opacity)\s*=\s*['"]?\s*([\d.]+)/g)) {
      if (!tk.alfas.has(Number(m[2]))) erros.push(`${nome}:${linhaDe(t0, u.off)}: SVG em data: com ${m[1]}="${m[2]}", fora dos degraus de alfa do :root (${[...tk.alfas].sort().join(', ')}: ui.md §10.8)`);
    }
    for (const m of svg.matchAll(/(fill|stroke|stop-color|color)\s*=\s*['"]?\s*([^'" >]+)/g)) {
      const v = m[2].trim();
      if (/^(none|transparent|currentColor)$/i.test(v)) continue;
      if (/^#[0-9a-f]{3,8}$/i.test(v)) {
        if (!tk.permitidos.has(hex6(v))) erros.push(`${nome}:${linhaDe(t0, u.off)}: SVG em data: com ${m[1]}="${v}", que não é hex de um token do :root (ui.md §10.8)`);
      } else erros.push(`${nome}:${linhaDe(t0, u.off)}: SVG em data: com ${m[1]}="${v}" (use o hex de um token; o alfa vai no ${m[1]}-opacity)`);
    }
  }
  // 3. grayscale só no :root (--apagado)
  for (const m of t.matchAll(/\bgrayscale\(/g)) {
    if (!dentro(raizes, m.index)) erros.push(`${nome}:${linhaDe(t, m.index)}: grayscale() fora do :root (desenho indisponível: filter: var(--apagado); texto nunca: ui.md §10.19.1)`);
  }
  // 4. opacity só em movimento e nas exceções escritas
  for (const m of t.matchAll(/(^|[;{\s])opacity\s*:\s*([^;}]+)/g)) {
    const i = m.index + m[1].length;
    if (dentro(quadros, i)) continue;
    const sel = seletorDe(t, i);
    const valor = m[2].replace(/!important/, '').trim();
    const partes = sel.split(',').map((x) => x.trim().replace(/\s+/g, ' '));
    if (partes.every((x) => EXCECOES_OPACITY.has(x) && (!EXCECOES_OPACITY.get(x) || EXCECOES_OPACITY.get(x).includes(valor)))) continue;
    erros.push(`${nome}:${linhaDe(t, i)}: opacity: ${valor} em "${sel}" (estado parado: o indisponível do ui.md §10.19.1, sem opacity)`);
  }
  // 5. var(--x) sem reserva: a variável existe
  for (const m of t.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
    if (!definidas.has(m[1]) && !js.includes(m[1])) erros.push(`${nome}:${linhaDe(t, m.index)}: var(${m[1]}) não existe (nem no CSS nem escrita pelo JS)`);
  }
}

function validar(raiz = jogo) {
  const erros = [];
  const tk = tokens(raiz);
  const css = path.join(raiz, 'css');
  const arquivos = fs.readdirSync(css).filter((n) => n.endsWith('.css')).sort();
  const textos = arquivos.map((f) => semComentarios(fs.readFileSync(path.join(css, f), 'utf8')));
  const definidas = new Set();
  textos.forEach((t) => { for (const m of t.matchAll(/(--[\w-]+)\s*:/g)) definidas.add(m[1]); });
  const js = textoJs(path.join(raiz, 'js'));
  arquivos.forEach((f, i) => checarCss('css/' + f, fs.readFileSync(path.join(css, f), 'utf8'), tk, definidas, js, erros));
  // 6. :root == Reino.config.paleta
  let pal;
  try { pal = paletaDoJs(raiz); } catch (e) { erros.push(`js/nucleo/config.js: não carregou no Node (${e.message})`); }
  if (!pal) erros.push('js/nucleo/config.js: falta Reino.config.paleta (espelho do :root: ui.md §10.8)');
  else {
    const par = (onde, v, token) => {
      if (!tk.hex[token]) erros.push(`css/ui-base.css: falta o token ${token} (Reino.config.${onde})`);
      else if (typeof v !== 'string' || hex6(v) !== tk.hex[token]) erros.push(`js/nucleo/config.js: Reino.config.${onde} = ${v}, mas ${token} no :root é ${tk.hex[token]} (mude os dois juntos)`);
    };
    for (const [k, token] of Object.entries(PALETA)) par('paleta.' + k, pal[k], token);
    for (const r of ['comum', 'raro', 'epico', 'lendario']) {
      for (const p of ['texto', 'fundo', 'desenho']) par(`paleta.raridade.${r}.${p}`, ((pal.raridade || {})[r] || {})[p], `--${r}-${p}`);
    }
    ['--rosa', '--ouro', '--roxo', '--azul', '--laranja', '--verde-folha'].forEach((token, i) => par(`paleta.confete[${i}]`, (pal.confete || [])[i], token));
  }
  return erros;
}

// as contas do inventário (pedidos/2026-09-29-tv-2a-inventario.md): quantas cores literais sobraram fora do :root
function contas(raiz = jogo) {
  const css = path.join(raiz, 'css');
  const tk = tokens(raiz);
  const lum = (h) => { const n = parseInt(hex6(h).slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  let literais = 0, opacity = 0;
  const claras = new Set(), escuras = new Set(), svg = new Set();
  for (const f of fs.readdirSync(css).filter((n) => n.endsWith('.css'))) {
    const t0 = semComentarios(fs.readFileSync(path.join(css, f), 'utf8'));
    const { limpo: t, urls } = tirarUrls(t0);
    const raizes = blocos(t, /(^|\n)\s*:root\s*\{/g);
    for (const m of t.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\([^)]*\)/g)) {
      if (dentro(raizes, m.index)) continue;
      literais++;
      if (m[0][0] === '#') { if (lum(m[0]) > 0.8) claras.add(hex6(m[0])); if (lum(m[0]) < 0.05) escuras.add(hex6(m[0])); }
    }
    for (const u of urls) for (const m of decodeURIComponent(u.texto.replace(/%(?![0-9a-fA-F]{2})/g, '%25')).matchAll(/#[0-9a-f]{3,8}\b/gi)) {
      svg.add(hex6(m[0])); if (lum(m[0]) > 0.8) claras.add(hex6(m[0]));
    }
    opacity += (t.match(/(^|[;{\s])opacity\s*:/g) || []).length;
  }
  return { literais, claras: [...claras].sort(), escuras: [...escuras].sort(), svg: [...svg].sort(), opacity, tokens: Object.keys(tk.cru).length };
}

if (require.main === module) {
  const i = process.argv.indexOf('--raiz');
  const raiz = i >= 0 ? path.resolve(process.argv[i + 1]) : jogo;
  if (process.argv.includes('--contas')) { console.log(JSON.stringify(contas(raiz), null, 1)); process.exit(0); }
  const erros = validar(raiz);
  erros.forEach((e) => console.log('✘ ' + e));
  if (erros.length) { console.log(`✘ ${erros.length} ponto(s) de cor fora da paleta (docs/contratos/ui.md §10.8 e §10.19.1)`); process.exit(1); }
  console.log('✔ cores só de tokens: literal só no :root e em SVG com hex de token, opacity só em movimento, :root = Reino.config.paleta');
}

module.exports = { validar, contas, checarCss, tokens, EXCECOES_OPACITY };
