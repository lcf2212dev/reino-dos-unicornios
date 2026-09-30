// Movimento da interface (docs/contratos/ui.md §10.15.2-§10.15.8; pedido 2026-09-29-tv-3i §14.9).
// Uso: node ferramentas/validar/validar-movimento.js [--raiz <pasta jogo>] [--detalhes] [--estrito]
//   (roda no npm run validar)
// CSS (css/*.css, sem os comentários):
//   (a) duração de animation/transition (e -duration) só por token: var(--rapido|--normal|--lento) ou
//       calc(<inteiro> * var(--lento)); 0ms/0s/0.01ms só nas saídas (body.sem-animacao, prefers-reduced-motion);
//       repetição infinite com período de 2 × --lento ou mais (§10.15.3); exceções do §10.15.5 em EXCECOES;
//   (b) tocável com sombra de degrau (0 Npx 0 sem inset, --sombra-pequena/-grande ou custom property do :root que
//       vira isso) declara --degrau: Npx na mesma regra ou na regra da classe base; fora NAO_TOCAVEIS e o
//       indisponível (§10.15.7.1, §10.15.7.6, §10.19.1);
//   (c) :active com transform ou box-shadow só na regra única do ui-base.css (§10.15.7.1);
// JS: :root --rapido/--normal/--lento igual a Reino.config.movimento { rapido, normal, lento } (§10.15.3).
// Exceção de propósito: "/* movimento-ok: <motivo> */" na mesma linha.
// Modo estrito (desde a integração da 3i): qualquer violação sai 1.
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');

const ESTRITO = true;
const TOKENS = { '--rapido': 'rapido', '--normal': 'normal', '--lento': 'lento' };   // :root → Reino.config.movimento
// §10.15.7.6: com sombra de degrau, mas não tocáveis (classe no último composto do seletor)
const NAO_TOCAVEIS = ['painel', 'painel-ovo', 'dock', 'claude-fala', 'titulo-jogo', 'nota-folha', 'selo-tentativa',
  'linha-premio', 'jogadores-guardando', 'criar-plaquinha', 'apoio', 'fotos-vazio'];
// §10.15.5: exceções escritas de duração (arquivo + trecho do seletor ou do valor)
const EXCECOES = [
  { arq: 'ui-base.css', val: /\barmar-encher\b/ },          // barra em scaleX, dura ARMAR_MS
  { arq: 'ui-prova.css', sel: /\.balao-respira\b/ },        // Ritual da Calma, 3,1 s
  { arq: 'ui-abertura.css', val: /--entrar-ms\b/ },         // zoom da abertura, Reino.config.abertura
];
const ULTIMA_REGRA = /^:is\(button,\s*\[role="button"\]\):active/;   // a regra única de afundar (ui-base.css)
const PARAGRAFO = { duracao: '§10.15.3', degrau: '§10.15.7.1', active: '§10.15.7.1', config: '§10.15.3' };

function semComentarios(css) { return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')); }
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
function palavras(s) {   // por espaço de nível 0
  const p = []; let prof = 0, atual = '';
  for (const c of s) {
    if (c === '(') prof++;
    if (c === ')') prof--;
    if (prof === 0 && /\s/.test(c)) { if (atual) p.push(atual); atual = ''; continue; }
    atual += c;
  }
  if (atual) p.push(atual);
  return p;
}

// regras mais internas, com os cabeçalhos em volta (@media…): [{ sel, corpo, ini, contexto }]
function regras(css) {
  const lista = [], pilha = []; let inicio = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') { pilha.push({ cab: css.slice(inicio, i).trim(), ini: i + 1, interno: true }); if (pilha.length > 1) pilha[pilha.length - 2].interno = false; inicio = i + 1; }
    else if (css[i] === '}') {
      const b = pilha.pop();
      if (b && b.interno) lista.push({ sel: b.cab, corpo: css.slice(b.ini, i), ini: b.ini, contexto: pilha.map((x) => x.cab).join(' ') });
      inicio = i + 1;
    } else if (css[i] === ';' && pilha.length && !pilha[pilha.length - 1].interno) inicio = i + 1;
  }
  return lista;
}
function declaracoes(r) {
  const out = [], dre = /(--[\w-]+|[a-z-]+)\s*:\s*([^;]+)/g; let d;
  while ((d = dre.exec(r.corpo))) out.push({ prop: d[1], val: d[2].replace(/!important/, '').trim(), i: r.ini + d.index });
  return out;
}

const TEMPO = /^-?\d*\.?\d+m?s$/;
const ms = (t) => (/ms$/.test(t) ? parseFloat(t) : parseFloat(t) * 1000);
// (a) devolve o motivo, ou '' se a duração vale
function duracaoRuim(prop, val, saida) {
  if (/^(none|initial|inherit|unset)$/.test(val)) return '';
  for (const parte of dividir(val)) {
    const ws = palavras(parte);
    // a primeira duração da parte (a segunda é o atraso)
    const dur = /-duration$/.test(prop) ? ws[0] : ws.find((w) => TEMPO.test(w) || /^(var|calc)\(/.test(w));
    if (!dur) continue;
    if (TEMPO.test(dur)) {
      if (saida && ms(dur) <= 0.01) continue;
      return `duração solta ${dur}`;
    }
    const n = (/^calc\(\s*(\d+)\s*\*\s*var\(--lento\)\s*\)$/.exec(dur) || [])[1];
    if (!/^var\(--(rapido|normal|lento)\)$/.test(dur) && n === undefined) return `duração ${dur}`;
    if (ws.includes('infinite') && !(n >= 2)) return `infinite com período ${dur} (mínimo calc(2 * var(--lento)))`;
  }
  return '';
}

// custom properties do :root que são sombra de degrau (e os dois tokens)
function alturaDegrau(val, raiz) {
  let alt = 0;
  for (const s of dividir(val)) {
    if (/inset/.test(s)) continue;
    const t = /^var\((--[\w-]+)\)$/.exec(s);
    if (t) { if (t[1] === '--sombra-pequena') alt = 2; else if (t[1] === '--sombra-grande') alt = 4; else if (raiz[t[1]]) alt = alturaDegrau(raiz[t[1]], {}) || alt; continue; }
    let limpo = s;   // var() aninhada: tira de dentro para fora
    while (/(var|rgba?)\([^()]*\)/.test(limpo)) limpo = limpo.replace(/(var|rgba?)\([^()]*\)/g, ' ');
    const n = limpo.replace(/#\w+/g, ' ').trim().split(/\s+/).filter((x) => /^-?\d*\.?\d+(px)?$/.test(x)).map(parseFloat);
    if (n.length >= 2 && n[0] === 0 && n[1] > 0 && !(n[2] > 0)) alt = n[1];
  }
  return alt;
}
// último composto do seletor (combinador só no nível 0, fora de parênteses)
function ultimoComposto(sel) {
  let prof = 0, ini = 0;
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (c === '(') prof++; else if (c === ')') prof--;
    else if (!prof && /[\s>+~]/.test(c)) ini = i + 1;
  }
  return sel.slice(ini);
}
// tira :not(...) com parênteses aninhados (:active negado não é apertado)
function semNot(sel) {
  let r = '', i = 0;
  while (i < sel.length) {
    if (sel.startsWith(':not(', i)) {
      let prof = 0, j = i + 4;
      for (; j < sel.length; j++) { if (sel[j] === '(') prof++; else if (sel[j] === ')' && !--prof) break; }
      i = j + 1;
    } else r += sel[i++];
  }
  return r;
}
const apertado = (sel) => /:active/.test(semNot(sel));
const classesDoFim = (sel) => ultimoComposto(sel.trim()).replace(/::?[\w-]+(\([^)]*\))?/g, (m) => (/^:(is|where|not)\(/.test(m) ? m : ''))
  .match(/\.[\w-]+/g) || [];
const indisponivel = (sel) => /:disabled|aria-disabled|\.indisponivel|\.armando/.test(sel);

// arquivos: { 'nome.css': texto }; cfgMov: { rapido, normal, lento } ou null
function checar(arquivos, cfgMov) {
  const v = { duracao: [], degrau: [], active: [], config: [] };
  const raiz = {}, todas = [];
  for (const arq of Object.keys(arquivos).sort()) {
    const cru = arquivos[arq], css = semComentarios(cru);
    const liberadas = new Set(cru.split('\n').map((l, i) => (/movimento-ok/.test(l) ? i + 1 : 0)).filter(Boolean));
    for (const r of regras(css)) {
      if (/^@keyframes|^(from|to|\d+%)/.test(r.sel) || /@keyframes/.test(r.contexto)) continue;
      const ds = declaracoes(r).map((d) => ({ ...d, linha: linhaDe(css, d.i) }));
      if (r.sel === ':root') ds.forEach((d) => { if (d.prop.startsWith('--')) raiz[d.prop] = d.val; });
      todas.push({ arq, r, ds, liberadas });
    }
  }
  const degrauDe = {};   // classe base → valor do --degrau na regra só dela
  for (const { r, ds } of todas) for (const s of dividir(r.sel)) {
    const d = ds.find((x) => x.prop === '--degrau');
    if (d && /^\.[\w-]+$/.test(s)) degrauDe[s] = d.val;
  }
  for (const { arq, r, ds, liberadas } of todas) {
    const onde = (d) => `${arq}:${d.linha}  ${r.sel.split('\n').pop().slice(0, 60)} { ${d.prop}: ${d.val.slice(0, 60)} }`;
    const saida = /sem-animacao/.test(r.sel) || /prefers-reduced-motion/.test(r.contexto);
    for (const d of ds) {
      if (liberadas.has(d.linha)) continue;
      // (a) durações
      if (/^(animation|transition)(-duration)?$/.test(d.prop)) {
        const exc = EXCECOES.some((e) => e.arq === arq && (e.sel ? e.sel.test(r.sel) : e.val.test(d.val)));
        const ruim = !exc && duracaoRuim(d.prop, d.val, saida);
        if (ruim) v.duracao.push(`${onde(d)}  (${ruim})`);
      }
      // (b) sombra de degrau x --degrau
      if (d.prop === 'box-shadow' && alturaDegrau(d.val, raiz)) {
        const alt = alturaDegrau(d.val, raiz);
        const proprio = (ds.find((x) => x.prop === '--degrau') || {}).val;
        for (const s of dividir(r.sel)) {
          if (indisponivel(s) || apertado(s)) continue;
          const cls = classesDoFim(s);
          if (cls.some((c) => NAO_TOCAVEIS.includes(c.slice(1)))) continue;
          const val = proprio || (cls[0] && degrauDe[cls[0]]);
          if (val !== `${alt}px`) v.degrau.push(`${arq}:${d.linha}  ${s.slice(0, 60)}  (sombra ${alt} px, --degrau ${val || 'falta'})`);
        }
      }
      // (c) :active com transform/box-shadow fora da regra única
      if (/^(transform|box-shadow)$/.test(d.prop) && dividir(r.sel).some(apertado) && !(arq === 'ui-base.css' && ULTIMA_REGRA.test(r.sel))) v.active.push(onde(d));
    }
  }
  // (d) :root x Reino.config.movimento
  for (const [tok, k] of Object.entries(TOKENS)) {
    const n = raiz[tok] === undefined ? undefined : ms(raiz[tok]);
    if (n === undefined) v.config.push(`ui-base.css :root: falta ${tok}`);
    else if (!cfgMov) v.config.push('js/nucleo/config.js: falta Reino.config.movimento = { rapido, normal, lento }');
    else if (cfgMov[k] !== n) v.config.push(`config.movimento.${k} = ${cfgMov[k]}, mas :root ${tok} = ${raiz[tok]}`);
  }
  v.config = [...new Set(v.config)];
  for (const [cat, lista] of Object.entries(v)) v[cat] = lista.map((l) => `${l}  [ui.md ${PARAGRAFO[cat]}]`);
  return v;
}

function lerConfig(jogo) {
  const cfg = fs.readFileSync(path.join(jogo, 'js', 'nucleo', 'config.js'), 'utf8');
  const m = /\bmovimento\s*:\s*\{([^}]*)\}/.exec(cfg);
  if (!m) return null;
  const o = {};
  for (const k of Object.values(TOKENS)) { const n = (new RegExp('\\b' + k + '\\s*:\\s*(\\d+)').exec(m[1]) || [])[1]; if (n !== undefined) o[k] = Number(n); }
  return o;
}

function verificar(jogo) {
  const pasta = path.join(jogo, 'css'), arquivos = {};
  for (const a of fs.readdirSync(pasta).filter((x) => x.endsWith('.css'))) arquivos[a] = fs.readFileSync(path.join(pasta, a), 'utf8');
  return checar(arquivos, lerConfig(jogo));
}

if (require.main === module) {
  const argv = process.argv.slice(2), k = argv.indexOf('--raiz');
  const jogo = k >= 0 ? path.resolve(argv[k + 1]) : path.join(__dirname, '..', '..');
  const estrito = ESTRITO || argv.includes('--estrito') || process.env.REINO_MOVIMENTO_ESTRITO === '1';
  const detalhes = argv.includes('--detalhes');
  const v = verificar(jogo);
  let total = 0;
  for (const [cat, lista] of Object.entries(v)) {
    if (!lista.length) continue;
    total += lista.length;
    console.log(`${estrito ? '✘' : '·'} ${cat}: ${lista.length}`);
    (detalhes || estrito ? lista : lista.slice(0, 3)).forEach((l) => console.log('    ' + l));
  }
  if (!total) { console.log('✔ movimento: durações em token, afundar na regra única, :root = config'); process.exit(0); }
  const resumo = Object.entries(v).filter(([, l]) => l.length).map(([c, l]) => `${c} ${l.length}`).join(', ');
  if (estrito) { console.log(`✘ ${total} fora do contrato de movimento (${resumo})`); process.exit(1); }
  console.log(`· relatório (não estrito): ${total} a consertar na 3i (${resumo}); --detalhes lista tudo`);
}

module.exports = { verificar, checar, ESTRITO };
