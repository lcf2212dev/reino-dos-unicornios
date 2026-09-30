// Tipografia e pixel da interface (docs/contratos/ui.md §10.9 e §10.10; decisões 1 a 10 da onda 2b).
// Uso: node ferramentas/validar/validar-tipografia.js [--raiz <pasta jogo>] [--detalhes] [--estrito]
//   (roda no npm run validar)
// CSS (css/*.css, sem os comentários):
//   - font-size só com um token: var(--texto-p|--texto-aux|--texto|--texto-g|--texto-t|--texto-festa) (ou inherit);
//     no :root e no .letras-grandes os tokens só valem 8/12/16/24/32/48 px;
//   - font-weight só 400 (normal/inherit); line-height só 1, 1.25, 1.5 ou var(--entrelinha[-titulo]);
//   - border (e border-top/-width…) com espessura só por token var(--borda-fina|--borda-grossa) (ou 0);
//   - box-shadow só var(--sombra-pequena|--sombra-grande) (ou o brilho inset 0 ±2/4px 0); text-shadow só contorno 0/2 px
//     sem desfoque; seletor com :active fica de fora (§10.10.3); exceção do §10.10.3: o brilho interno
//     `inset 0 ±2/4px 0 var(--brilho|--brilho-fraco)` é aceito fora do token; tokens de borda/sombra/canto do :root com o valor do contrato; b, strong { font-weight: 400 };
//   - JS: style.fontSize/lineHeight/fontWeight e font-size:/line-height: em string de estilo acusados;
//   - nada de --escala-texto (CSS e JS).
// JS (js/**, fora js/voz/): PA.paraDOM(spr, <número>) só com escala par (decisão 10; exceções: EXCECOES_JS).
// Reino.config.texto = { p, aux, corpo, g } igual aos tokens do :root (--texto-p, --texto-aux, --texto, --texto-g).
// Exceção de propósito: "// tipografia-ok: <motivo>" (ou /* tipografia-ok */) na mesma linha.
// Modo: com ESTRITO = false (hoje, enquanto a 2b conserta) só RELATA e sai 0; a integração da 2b liga
// ESTRITO = true (ou --estrito / REINO_TIPOGRAFIA_ESTRITA=1) e qualquer violação sai 1. O teste de navegador
// tipografia.navegador.test.js lê o mesmo ESTRITO.
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');

const ESTRITO = false;
const ESCALA = [8, 12, 16, 24, 32, 48];
const TOKENS = ['--texto-p', '--texto-aux', '--texto', '--texto-g', '--texto-t', '--texto-festa'];
const ESPELHO = { p: '--texto-p', aux: '--texto-aux', corpo: '--texto', g: '--texto-g' };   // Reino.config.texto
// decisão 10: desenho já em px CSS (joystick) e canvas do voo (escala própria, fora da 2b)
const EXCECOES_JS = [/motor\/entrada\.js$/, /\/voo[-a-z]*\.js$/];

// comentário vira espaço (mantém as linhas)
function semComentarios(css) { return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')); }
// contrato §10.10.2-3: o valor dos tokens de borda, sombra e canto
const TOKENS_PIXEL = { '--borda-fina': '2px', '--borda-grossa': '4px', '--sombra-pequena': '0 2px 0 var(--borda)', '--sombra-grande': '0 4px 0 var(--borda)', '--canto-pequeno': '4px' };
// números de uma sombra (sem cor/var/inset): [x, y, desfoque?]
const numeros = (s) => s.replace(/var\([^)]*\)|rgba?\([^)]*\)|#\w+|inset/g, ' ').trim().split(/\s+/).filter((t) => /^-?\d*\.?\d+(px)?$/.test(t)).map(parseFloat);
function linhaDe(texto, i) { return texto.slice(0, i).split('\n').length; }
function dividir(s) {   // por vírgula de nível 0
  const partes = []; let prof = 0, atual = '';
  for (const c of s) {
    if (c === '(') prof++;
    if (c === ')') prof--;
    if (prof === 0 && c === ',') { partes.push(atual.trim()); atual = ''; continue; }
    atual += c;
  }
  if (atual.trim()) partes.push(atual.trim());
  return partes;
}
const px = (v) => (v.match(/-?\d*\.?\d+px/g) || []).map(parseFloat);

// devolve { categoria: [ 'arquivo:linha  texto' ] } e os tokens do :root
function verificarCSS(pastaCss) {
  const v = { 'font-size': [], 'font-weight': [], 'line-height': [], border: [], 'box-shadow': [], 'text-shadow': [], tokens: [], 'escala-texto': [] };
  let negrito400 = false;
  const raiz = {};
  for (const arq of fs.readdirSync(pastaCss).filter((a) => a.endsWith('.css')).sort()) {
    const cru = fs.readFileSync(path.join(pastaCss, arq), 'utf8'), css = semComentarios(cru);
    const liberadas = new Set(cru.split('\n').map((l, i) => (/tipografia-ok/.test(l) ? i + 1 : 0)).filter(Boolean));
    const re = /([^{}]+)\{([^{}]*)\}/g; let m;
    while ((m = re.exec(css))) {
      const sel = m[1].trim(), corpo = m[2], ini = m.index + m[1].length + 1;
      const dre = /(--[\w-]+|[a-z-]+)\s*:\s*([^;]+)/g; let d;
      while ((d = dre.exec(corpo))) {
        const prop = d[1], val = d[2].trim(), linha = linhaDe(css, ini + d.index), onde = `${arq}:${linha}  ${sel.split('\n').pop().slice(0, 50)} { ${prop}: ${val} }`;
        if (liberadas.has(linha)) continue;
        if (prop === 'font-weight' && val === '400' && /(^|,)\s*b\s*,\s*strong\s*$|(^|,)\s*strong\s*,\s*b\s*$/.test(sel)) negrito400 = true;
        if (prop in TOKENS_PIXEL && sel === ':root') raiz[prop] = val;
        if (prop in TOKENS_PIXEL && sel === ':root' && val.replace(/\s+/g, ' ') !== TOKENS_PIXEL[prop]) v.tokens.push(onde + `  (contrato: ${TOKENS_PIXEL[prop]})`);
        if (/--escala-texto/.test(prop + val)) v['escala-texto'].push(onde);
        if (TOKENS.includes(prop)) {
          if (/(^|,)\s*:root\b|\.letras-grandes/.test(sel)) {
            if (sel === ':root' && !(prop in raiz)) raiz[prop] = parseFloat(val);
            if (!/^\d+px$/.test(val) || !ESCALA.includes(parseFloat(val))) v.tokens.push(onde);
          } else v.tokens.push(onde);
        }
        if (prop === 'font-size' && !/^(var\((--texto(-p|-aux|-g|-t|-festa)?)\)|inherit)$/.test(val)) v['font-size'].push(onde);
        if (prop === 'font' && val !== 'inherit') v['font-size'].push(onde);
        if (prop === 'font-weight' && !/^(400|normal|inherit)$/.test(val)) v['font-weight'].push(onde);
        if (prop === 'line-height' && !/^(1|1\.25|1\.5|var\(--entrelinha(-titulo)?\)|inherit)$/.test(val)) v['line-height'].push(onde);
        if (/^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-width)?$/.test(prop) &&
            (px(val).some((n) => n !== 0) || /\b(thin|medium|thick)\b/.test(val))) v.border.push(onde);   // espessura só por token
        if (prop === 'box-shadow' && val !== 'none' && !/:active/.test(sel) && dividir(val).some((s) => {
          if (/^var\(--sombra-(pequena|grande)\)$/.test(s)) return false;
          // fora do token só o brilho interno (inset 0 ±2/4px 0): px solto, desfoque e lateral acusados
          const n = numeros(s);
          return !/inset/.test(s) || !/var\(--brilho(-fraco)?\)/.test(s) || n[0] !== 0 || ![2, 4].includes(Math.abs(n[1])) || (n[2] || 0) !== 0 || n.length > 3;
        })) v['box-shadow'].push(onde);
        if (prop === 'text-shadow' && val !== 'none' && dividir(val).some((s) => {
          const n = numeros(s);
          return n.length < 2 || n.slice(0, 2).some((x) => ![0, 2].includes(Math.abs(x))) || (n[2] || 0) !== 0;
        })) v['text-shadow'].push(onde);
      }
    }
  }
  for (const t of Object.keys(TOKENS_PIXEL)) if (raiz[t] === undefined) v.tokens.push(`ui-base.css :root: falta ${t}`);
  if (!negrito400) v['font-weight'].push('ui-base.css: falta b, strong { font-weight: 400 }');
  return { v, raiz };
}

function arquivosJs(pasta, lista = []) {
  for (const a of fs.readdirSync(pasta, { withFileTypes: true })) {
    const p = path.join(pasta, a.name);
    if (a.isDirectory()) { if (a.name !== 'voz') arquivosJs(p, lista); } else if (a.name.endsWith('.js')) lista.push(p);
  }
  return lista;
}

function verificarJS(jogo, v) {
  v.paraDOM = []; v['estilo-js'] = [];
  for (const arq of arquivosJs(path.join(jogo, 'js'))) {
    const rel = path.relative(jogo, arq);
    const linhas = fs.readFileSync(arq, 'utf8').split('\n');
    linhas.forEach((l, i) => {
      if (/tipografia-ok/.test(l)) return;
      if (/--escala-texto|escalaTexto\b/.test(l) && !/^\s*(\/\/|\*)/.test(l)) v['escala-texto'].push(`${rel}:${i + 1}  ${l.trim().slice(0, 80)}`);
      if (EXCECOES_JS.some((r) => r.test(rel))) return;
      // letra no JS: style.fontSize/lineHeight/fontWeight ou "font-size:" numa string de estilo (use classe e token)
      if (/\.style\.(fontSize|lineHeight|fontWeight|font)\s*=|setProperty\(\s*['"`](font-size|line-height|font-weight|font)['"`]|['"`][^'"`]*\b(font-size|line-height|font-weight)\s*:/.test(l)) v['estilo-js'].push(`${rel}:${i + 1}  ${l.trim().slice(0, 80)}`);
      const re = /paraDOM\(/g; let m;
      while ((m = re.exec(l))) {
        let prof = 1, j = m.index + m[0].length, arg = '';
        for (; j < l.length && prof; j++) { if (l[j] === '(') prof++; if (l[j] === ')') prof--; if (prof) arg += l[j]; }
        const a = dividir(arg);
        if (a[1] && /^\d+(\.\d+)?$/.test(a[1]) && Number(a[1]) % 2 !== 0) v.paraDOM.push(`${rel}:${i + 1}  paraDOM(…, ${a[1]})`);
      }
    });
  }
}

function verificarConfig(jogo, raiz, v) {
  v.config = [];
  const cfg = fs.readFileSync(path.join(jogo, 'js', 'nucleo', 'config.js'), 'utf8');
  const m = /\btexto\s*:\s*\{([^}]*)\}/.exec(cfg);
  if (!m) { v.config.push('js/nucleo/config.js: falta Reino.config.texto = { p: 8, aux: 12, corpo: 16, g: 24 }'); return; }
  for (const [k, tok] of Object.entries(ESPELHO)) {
    const n = (new RegExp('\\b' + k + '\\s*:\\s*(\\d+)').exec(m[1]) || [])[1];
    if (n === undefined) v.config.push(`config.texto.${k}: falta`);
    else if (raiz[tok] === undefined) v.config.push(`:root ${tok}: falta (config.texto.${k} = ${n})`);
    else if (Number(n) !== raiz[tok]) v.config.push(`config.texto.${k} = ${n}, mas :root ${tok} = ${raiz[tok]}px`);
  }
}

function verificar(jogo) {
  const { v, raiz } = verificarCSS(path.join(jogo, 'css'));
  for (const t of TOKENS) if (raiz[t] === undefined) v.tokens.push(`ui-base.css :root: falta ${t}`);
  verificarJS(jogo, v);
  verificarConfig(jogo, raiz, v);
  return v;
}

if (require.main === module) {
  const argv = process.argv.slice(2), k = argv.indexOf('--raiz');
  const jogo = k >= 0 ? path.resolve(argv[k + 1]) : path.join(__dirname, '..', '..');
  const estrito = ESTRITO || argv.includes('--estrito') || process.env.REINO_TIPOGRAFIA_ESTRITA === '1';
  const detalhes = argv.includes('--detalhes');
  const v = verificar(jogo);
  let total = 0;
  for (const [cat, lista] of Object.entries(v)) {
    if (!lista.length) continue;
    total += lista.length;
    console.log(`${estrito ? '✘' : '·'} ${cat}: ${lista.length}`);
    (detalhes || estrito ? lista : lista.slice(0, 3)).forEach((l) => console.log('    ' + l));
  }
  if (!total) { console.log('✔ tipografia e pixel da interface: tudo na escala'); process.exit(0); }
  const resumo = Object.entries(v).filter(([, l]) => l.length).map(([c, l]) => `${c} ${l.length}`).join(', ');
  if (estrito) { console.log(`✘ ${total} fora da escala (${resumo})`); process.exit(1); }
  console.log(`· relatório (não estrito): ${total} a consertar na 2b (${resumo}); --detalhes lista tudo`);
}

module.exports = { verificar, ESTRITO, ESCALA };
