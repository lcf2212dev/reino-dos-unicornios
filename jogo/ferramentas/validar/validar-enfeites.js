// Enfeites do unicórnio (PA.ENFEITES_MONTARIA, com os prêmios das provas e os da trilha perfeita): desenha de verdade, sem navegador
// (canvas falso em memória, só fillRect/drawImage/getImageData, que é o que a pixel art usa) e confere:
//   - fora do molde: nenhum pixel de enfeite pintado fora do quadro do unicórnio (o canvas cortaria), em todo
//     estágio e vista;
//   - oclusão montada: pixels do enfeite que aparecem com a Mariana montada ÷ os que aparecem solto
//     (diferença entre o sprite com e sem o enfeite). Orelha, cabeça e chifre ≥ 60 % no Pequeno de lado e em
//     3/4 de costas e no Adulto em 3/4 de costas; cauda ≥ 50 % de costas e em 3/4 de costas (Pequeno e Adulto);
//   - montada de frente e em 3/4 de frente (Pequeno e Adulto): nenhum pixel do chifre por cima do tronco dela, e
//     de frente as pernas dela aparecem (≥ 50 % dos pixels das pernas da cavaleira) e nenhum enfeite cobre mais
//     de 6 px do tronco dela (ela não vira busto);
//   - chifre livre (D13-06): em todo estágio e vista, nenhum enfeite da orelha ou da cabeça muda um pixel do chifre,
//     sozinho ou com os 6 encaixes ocupados juntos (menos o capacete, cobreChifre, e o que está quase todo em cima do
//     chifre, como a antena); e, com todos juntos, os olhos continuam à vista (só os óculos os cobrem);
//   - pose cansada (fome ou sede baixa) e pulo: fora do molde e chifre/pernas de frente também com a pose cansada;
//     todo molde com 3 quadros de passo, e o quadro do pulo (patas encolhidas) e o cansado do tamanho do parado.
// Uso: node jogo/ferramentas/validar/validar-enfeites.js [--raiz <pasta jogo>] [--detalhes]   (npm run validar)
//   --raiz: outra cópia do jogo (ex.: a de um commit antigo, para ver o validador acusar o defeito).
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const argv = process.argv.slice(2);
const iRaiz = argv.indexOf('--raiz');
const raiz = path.resolve(iRaiz >= 0 ? argv[iRaiz + 1] : path.join(__dirname, '..', '..'));
const detalhes = argv.includes('--detalhes');

/* ---------- canvas falso (RGBA em memória) ---------- */
let foraDoQuadro = 0;   // fillRect fora do canvas (o navegador corta sem avisar)
function cor(s) {
  s = String(s).trim();
  let m = /^#([0-9a-f]{3})$/i.exec(s);
  if (m) return [...m[1]].map((c) => parseInt(c + c, 16)).concat(255);
  m = /^#([0-9a-f]{6})$/i.exec(s);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).concat(255);
  m = /^rgba?\(([^)]*)\)$/i.exec(s);
  if (m) { const p = m[1].split(',').map(Number); return [p[0], p[1], p[2], Math.round((p.length > 3 ? p[3] : 1) * 255)]; }
  return [255, 0, 255, 255];
}
function novoCanvasFalso() {
  const c = { _w: 0, _h: 0, dados: new Uint8ClampedArray(0) };
  Object.defineProperty(c, 'width', { get: () => c._w, set: (v) => { c._w = v; c.dados = new Uint8ClampedArray(v * c._h * 4); } });
  Object.defineProperty(c, 'height', { get: () => c._h, set: (v) => { c._h = v; c.dados = new Uint8ClampedArray(c._w * v * 4); } });
  const ctx = {
    canvas: c, fillStyle: '#000', imageSmoothingEnabled: false,
    fillRect(x, y, w, h) {
      const rgba = cor(this.fillStyle);
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
        if (i < 0 || j < 0 || i >= c._w || j >= c._h) { foraDoQuadro++; continue; }
        c.dados.set(rgba, (j * c._w + i) * 4);
      }
    },
    drawImage(src, a, b, cw, ch, dx, dy) {
      let sx = 0, sy = 0, w = src._w, h = src._h;
      if (dx !== undefined) { sx = a; sy = b; w = cw; h = ch; } else { dx = a; dy = b; }
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const X = sx + i, Y = sy + j, x = dx + i, y = dy + j;
        if (X < 0 || Y < 0 || X >= src._w || Y >= src._h || x < 0 || y < 0 || x >= c._w || y >= c._h) continue;
        const o = (Y * src._w + X) * 4;
        if (src.dados[o + 3] > 0) c.dados.set(src.dados.subarray(o, o + 4), (y * c._w + x) * 4);
      }
    },
    getImageData(x, y, w, h) {
      const d = new Uint8ClampedArray(w * h * 4);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const X = x + i, Y = y + j;
        if (X >= 0 && Y >= 0 && X < c._w && Y < c._h) d.set(c.dados.subarray((Y * c._w + X) * 4, (Y * c._w + X) * 4 + 4), (j * w + i) * 4);
      }
      return { data: d, width: w, height: h };
    },
    translate() { throw new Error('canvas falso: translate não existe (o espelho não entra aqui)'); },
    scale() { throw new Error('canvas falso: scale não existe'); },
  };
  c.getContext = () => ctx;
  return c;
}

/* ---------- carrega a pixel art, as provas e os prêmios da trilha, na ordem do manifesto ---------- */
function carregarJogo() {
  const manifesto = require(path.join(raiz, 'js/manifesto.js'));
  const QUEREM = /^js\/(nucleo\/config|arte\/desenho|arte\/icones\/icones|arte\/enfeites-novidades|arte\/pixelart(-unicornio-moldes|-unicornio|-personagens|-mariana-visual)?|nucleo\/registros|conteudo\/provas\/[^/]+|conteudo\/materias\/[^/]+\/premios-trilha-[^/]+|conteudo\/presentes)\.js$/;
  const ctx = { console: { log() {}, warn() {}, error: console.error }, Math, JSON, Object, Array, Map, Set };
  ctx.window = ctx;
  ctx.document = { createElement: () => novoCanvasFalso() };
  vm.createContext(ctx);
  manifesto.scripts.filter((s) => QUEREM.test(s.js)).forEach((s) => {
    vm.runInContext(fs.readFileSync(path.join(raiz, s.js), 'utf8'), ctx, { filename: s.js });
  });
  return ctx;
}

const DEF = { id: 'validar-enfeites', raridade: 'comum', cores: { corpo: '#7a5c3e', crina: ['#41306b', '#305a6b', '#6b3055'], chifre: '#8a8a2e' } };
const TRONCO_MAX = 6;   // px do tronco da cavaleira que um enfeite pode cobrir de frente
const ESTAGIOS = { 0: 'Bebê', 1: 'Pequeno', 2: 'Jovem', 3: 'Adulto' };
// [âncoras, estágio, vista, mínimo visível]
const OCLUSAO = [
  [['orelha', 'cabeca', 'chifre'], 1, 'lado', 0.6], [['orelha', 'cabeca', 'chifre'], 1, 'diagCostas', 0.6],
  [['orelha', 'cabeca', 'chifre'], 3, 'diagCostas', 0.6],
  [['cauda'], 1, 'lado', 0.5], [['cauda'], 3, 'lado', 0.5], [['cauda'], 1, 'costas', 0.5], [['cauda'], 1, 'diagCostas', 0.5], [['cauda'], 3, 'costas', 0.5], [['cauda'], 3, 'diagCostas', 0.5],
];

function diferenca(a, b) {
  if (a.width !== b.width || a.height !== b.height) return Infinity;
  let n = 0;
  for (let i = 0; i < a.dados.length; i += 4) {
    if (a.dados[i] !== b.dados[i] || a.dados[i + 1] !== b.dados[i + 1] || a.dados[i + 2] !== b.dados[i + 2] || a.dados[i + 3] !== b.dados[i + 3]) n++;
  }
  return n;
}

function conferir() {
  const ctx = carregarJogo();
  const PA = ctx.PA, ENF = PA.ENFEITES_MONTARIA, AP = PA.APARENCIA_PADRAO;
  const erros = [], linhas = [];
  const ids = Object.keys(ENF);

  // fora do molde
  let totalFora = 0;
  [false, true].forEach((cansado) => [0, 1, 2, 3].forEach((est) => PA.VISTAS.forEach((vista) => {
    ids.forEach((id) => {
      foraDoQuadro = 0;
      PA.unicornio(DEF, est, 0, { vista, enfeites: [id], cansado });
      if (foraDoQuadro) { totalFora += foraDoQuadro; erros.push(`${id}: ${foraDoQuadro} px fora do molde (${ESTAGIOS[est]}, ${vista}${cansado ? ', cansado' : ''})`); }
    });
  })));

  // passo, pulo e pose cansada
  const UNI0 = ctx.PA._interno.UNI, PULO = ctx.PA._interno.PULO;
  Object.keys(UNI0).forEach((m) => Object.keys(UNI0[m]).forEach((vista) => {
    if (UNI0[m][vista].pernas.length !== 3) erros.push(`${m} ${vista}: ${UNI0[m][vista].pernas.length} quadros de passo, precisa de 3`);
  }));
  [0, 1, 3].forEach((est) => PA.VISTAS.forEach((vista) => {
    const parado = PA.unicornio(DEF, est, 0, { vista }), rot = `(${ESTAGIOS[est]}, ${vista})`;
    const pulo = PA.unicornio(DEF, est, PULO, { vista }), cans = PA.unicornio(DEF, est, 0, { vista, cansado: true });
    if (pulo.w !== parado.w || pulo.h !== parado.h || cans.w !== parado.w || cans.h !== parado.h) erros.push(`pulo ou cansado muda o tamanho do sprite ${rot}`);
    if (diferenca(pulo.canvas, parado.canvas) === 0) erros.push(`o quadro do pulo é igual ao parado ${rot}`);
    if (diferenca(cans.canvas, parado.canvas) === 0) erros.push(`a pose cansada é igual à parada ${rot}`);
  }));
  linhas.push('3 quadros de passo em todo molde; pulo e pose cansada com desenho próprio e do mesmo tamanho');

  // oclusão montada
  OCLUSAO.forEach(([ancoras, est, vista, minimo]) => {
    const soltoSem = PA.unicornio(DEF, est, 0, { vista, enfeites: [] }).canvas;
    const montSem = PA.montada(DEF, est, 0, AP, { vista, enfeites: [] }).canvas;
    ids.filter((id) => ancoras.includes(ENF[id].ancora)).forEach((id) => {
      const solto = diferenca(PA.unicornio(DEF, est, 0, { vista, enfeites: [id] }).canvas, soltoSem);
      if (!solto) return;   // a vista não mostra o encaixe (âncora null)
      const mont = diferenca(PA.montada(DEF, est, 0, AP, { vista, enfeites: [id] }).canvas, montSem);
      const f = Math.min(mont, solto) / solto;
      const txt = `${id} (${ENF[id].ancora}): ${Math.round(f * 100)} % visível montada (${Math.min(mont, solto)}/${solto} px; ${ESTAGIOS[est]}, ${vista})`;
      if (f < minimo) erros.push(`${txt}, mínimo ${minimo * 100} %`);
      else linhas.push(txt);
    });
  });
  // chifre x tronco e pernas da cavaleira (tronco = as 4 primeiras linhas do molde sentada, pernas = as 3 últimas;
  // no canvas com contorno: linhas 8–11 e 12–14, depois das 7 da cabeça)
  const chifre = DEF.cores.chifre, corChifre = new Set([chifre, PA.cor.escurecer(chifre, 0.25), PA.cor.clarear(chifre, 0.45)]
    .map((c) => cor(c).slice(0, 3).join(',')));
  [false, true].forEach((cansado) => [1, 3].forEach((est) => ['frente', 'diagFrente'].forEach((vista) => {
    const uni = PA.unicornio(DEF, est, 0, { vista, enfeites: [], cansado });
    const mont = PA.montada(DEF, est, 0, AP, { vista, enfeites: [], cansado }).canvas;
    const rotulo = ESTAGIOS[est] + (cansado ? ', cansado' : '');
    const cav = PA.mariana(AP, true, 0, { vista }).canvas;
    const ox = (mont.width - uni.w) / 2 + uni.cavaleira[0], oy = mont.height - uni.h + uni.cavaleira[1];
    let noTronco = 0, pernas = 0, pernasVistas = 0;
    for (let y = 8; y <= 14; y++) for (let x = 0; x < cav.width; x++) {
      const o = (y * cav.width + x) * 4;
      if (!cav.dados[o + 3]) continue;
      const X = ox + x, Y = oy + y;
      if (X < 0 || Y < 0 || X >= mont.width || Y >= mont.height) continue;
      const m = (Y * mont.width + X) * 4, rgb = [0, 1, 2].map((k) => mont.dados[m + k]).join(',');
      if (y <= 11 && corChifre.has(rgb)) noTronco++;
      if (y >= 12) { pernas++; if (rgb === [0, 1, 2].map((k) => cav.dados[o + k]).join(',')) pernasVistas++; }
    }
    if (noTronco) erros.push(`chifre: ${noTronco} px por cima do tronco da cavaleira (${rotulo}, ${vista})`);
    else linhas.push(`chifre fora do tronco da cavaleira (${rotulo}, ${vista})`);
    if (vista === 'frente') {
      const txt = `pernas da cavaleira: ${Math.round(pernasVistas / pernas * 100)} % visíveis (${rotulo}, frente)`;
      if (pernasVistas / pernas < 0.5) erros.push(txt + ', mínimo 50 %'); else linhas.push(txt);
      // enfeite por cima do tronco: pixels do tronco que mudam com o enfeite
      ids.forEach((id) => {
        const com = PA.montada(DEF, est, 0, AP, { vista, enfeites: [id], cansado }).canvas;
        if (com.width !== mont.width || com.height !== mont.height) return;
        let n = 0;
        for (let y = 8; y <= 11; y++) for (let x = 0; x < cav.width; x++) {
          if (!cav.dados[(y * cav.width + x) * 4 + 3]) continue;
          const X = ox + x, Y = oy + y;
          if (X < 0 || Y < 0 || X >= mont.width || Y >= mont.height) continue;
          const m = (Y * mont.width + X) * 4;
          if ([0, 1, 2, 3].some((k) => com.dados[m + k] !== mont.dados[m + k])) n++;
        }
        if (n > TRONCO_MAX) erros.push(`${id}: cobre ${n} px do tronco da cavaleira (${rotulo}, frente), máximo ${TRONCO_MAX}`);
      });
    }
  })));
  // chifre livre e olhos à vista
  const UNI = ctx.PA._interno.UNI;
  const TODOS = ['fitinha-cauda', 'colar-perolas', 'laco', 'coroa', 'anel-saturno'];
  let chifreOk = 0;
  [0, 1, 2, 3].forEach((est) => PA.VISTAS.forEach((vista) => {
    const molde = UNI[est >= 2 ? 'adulto' : 'filhote'][vista];
    const corpo = molde.corpo.concat(molde.pernas[0]);
    const sem = PA.unicornio(DEF, est, 0, { vista, enfeites: [] }).canvas;
    const pontos = (letras) => { const r = []; corpo.forEach((l, y) => { for (let x = 0; x < l.length; x++) if (letras.includes(l[x])) r.push([x + 1, y + 1]); }); return r; };
    // o bebê só tem o toquinho: sem as 2 linhas de cima e sem o g (como em PA.unicornio)
    const chifre = pontos('hgk').filter(([x, y]) => !(est === 0 && (y <= 2 || corpo[y - 1][x - 1] === 'g')));
    const mudou = (c, pts) => pts.filter(([x, y]) => [0, 1, 2, 3].some((k) => c.dados[(y * c.width + x) * 4 + k] !== sem.dados[(y * sem.width + x) * 4 + k])).length;
    const conferirUm = (lista, rotulo) => {
      const n = mudou(PA.unicornio(DEF, est, 0, { vista, enfeites: lista }).canvas, chifre);
      if (n) erros.push(`${rotulo}: cobre ${n} px do chifre (${ESTAGIOS[est]}, ${vista})`); else chifreOk++;
    };
    ids.filter((id) => ['orelha', 'cabeca'].includes(ENF[id].ancora) && !ENF[id].cobreChifre).forEach((id) => {
      // quase todo em cima do chifre (a antena): é feito para ficar ali (a mesma conta da arte, PA._interno.QUASE_NO_CHIFRE)
      const e = ENF[id];
      const d = ctx.PA._interno.lugarDoEnfeite(molde, id, e, est, corpo[0].length, corpo.length);
      if (!d) return;
      let tot = 0, sobre = 0;
      d.linhas.forEach((l, j) => { for (let i = 0; i < l.length; i++) if (e.paleta[l[i]]) { tot++; if (chifre.some(([x, y]) => x === d.x + i + 1 && y === d.y + j + 1)) sobre++; } });
      if (sobre >= tot * ctx.PA._interno.QUASE_NO_CHIFRE) return;
      conferirUm([id], id);
    });
    conferirUm(TODOS.filter((id) => id !== 'anel-saturno'), 'todos os encaixes');
    const olhos = pontos('el');
    const todos = PA.unicornio(DEF, est, 0, { vista, enfeites: TODOS }).canvas;
    const n = mudou(todos, olhos);
    if (n) erros.push(`todos os encaixes: cobrem ${n} px dos olhos (${ESTAGIOS[est]}, ${vista})`);
  }));
  linhas.push(`chifre livre dos enfeites da orelha e da cabeça (${chifreOk} conferências)`);
  return { erros, linhas, totalFora, n: ids.length };
}

if (require.main === module) {
  const r = conferir();
  if (detalhes) r.linhas.forEach((l) => console.log('  ✔ ' + l));
  r.erros.forEach((e) => console.log('  ✘ ' + e));
  if (r.erros.length) { console.log(`✘ ${r.erros.length} erro(s) nos enfeites (${r.totalFora} px fora do molde)`); process.exit(1); }
  console.log(`✔ ${r.n} enfeites: 0 px fora do molde, oclusão montada ok (${r.linhas.length} medidas)`);
}

module.exports = { conferir, carregarJogo };
