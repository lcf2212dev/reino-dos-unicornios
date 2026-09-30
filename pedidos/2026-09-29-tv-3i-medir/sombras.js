// Inventário da onda 3i: todo seletor com sombra de degrau (box-shadow "0 Npx 0" sem inset, ou os tokens
// --sombra-pequena/--sombra-grande da 2b) e o :active que ele tem hoje. Só lê jogo/css/*.css.
// Uso: node pedidos/2026-09-29-tv-3i-medir/sombras.js [raiz] [--json]
'use strict';
const fs = require('fs');
const path = require('path');
const raiz = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '.';
const json = process.argv.includes('--json');
const pasta = path.join(raiz, 'jogo/css');

function regras(txt) {
  // devolve {sel, corpo, linha, media}; @media/@supports entram como prefixo
  const out = [];
  const semComent = txt.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const pilha = [];
  let i = 0, ini = 0;
  while (i < semComent.length) {
    const c = semComent[i];
    if (c === '{') {
      const cab = semComent.slice(ini, i).trim();
      const linha = semComent.slice(0, ini + (semComent.slice(ini, i).search(/\S/) || 0)).split('\n').length;
      if (cab.startsWith('@media') || cab.startsWith('@supports')) { pilha.push(cab); ini = i + 1; i++; continue; }
      if (cab.startsWith('@keyframes')) { // pula o bloco inteiro
        let d = 1; i++; while (i < semComent.length && d) { if (semComent[i] === '{') d++; else if (semComent[i] === '}') d--; i++; }
        ini = i; continue;
      }
      const fim = semComent.indexOf('}', i);
      out.push({ sel: cab.replace(/\s+/g, ' '), corpo: semComent.slice(i + 1, fim), linha, media: pilha.join(' ') });
      i = fim + 1; ini = i; continue;
    }
    if (c === '}') { pilha.pop(); ini = i + 1; }
    i++;
  }
  return out;
}

const VARS = {}; // custom properties do :root com sombra de degrau (ex.: --sombra-botao: 0 5px 0 …)
function degrau(corpo) {
  const m = corpo.match(/box-shadow\s*:\s*([^;]+)/);
  if (!m) return null;
  const valor = m[1].replace(/var\((--[\w-]+)\)/g, (x, n) => VARS[n] || x);
  const partes = valor.split(/,(?![^(]*\))/).map((s) => s.trim());
  for (const p of partes) {
    if (/^inset/.test(p)) continue;
    let q = p.match(/^0\s+(\d+)px\s+0(\s|$)/);
    if (q && +q[1] > 0) return { px: +q[1], valor: m[1].trim() };
    if (/var\(--sombra-pequena\)/.test(p)) return { px: 2, valor: m[1].trim() };
    if (/var\(--sombra-grande\)/.test(p)) return { px: 4, valor: m[1].trim() };
  }
  return null;
}

const arquivos = fs.readdirSync(pasta).filter((f) => f.endsWith('.css')).sort();
const todas = [];
for (const f of arquivos) for (const r of regras(fs.readFileSync(path.join(pasta, f), 'utf8'))) todas.push({ arq: f, ...r });
for (const r of todas) if (r.sel === ':root') for (const m of r.corpo.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) if (/^0\s+\d+px\s+0\b/.test(m[2].trim())) VARS[m[1]] = m[2].trim();

// tocável? procura a classe no JS do jogo (fora dos pacotes de voz): criada como botão ou com clique
const jsArqs = [];
(function andar(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const q = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'voz') andar(q); } else if (e.name.endsWith('.js')) jsArqs.push(q); } })(path.join(raiz, 'jogo/js'));
const jsTxt = jsArqs.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
function tocavel(sel) {
  const classes = (sel.split(' ').pop().match(/\.[\w-]+/g) || []).map((c) => c.slice(1));
  if (/(^|\s)button\b/.test(sel)) return 'botão';
  for (const c of classes) {
    const re = new RegExp("[\\s'\"]" + c.replace(/-/g, '\\-') + "[\\s'\"]");
    for (const l of jsTxt.split('\n')) if (re.test(l) && /'button'|onclick|'click'|role: ?'button'|toque|pointerdown/.test(l)) return 'botão';
  }
  return '?';
}

const ativos = todas.filter((r) => r.sel.includes(':active'));
const linhas = [];
for (const r of todas) {
  if (r.sel.includes(':active')) continue;
  const d = degrau(r.corpo);
  if (!d) continue;
  for (const s of r.sel.split(/,(?![^(]*\))/).map((x) => x.trim())) {
    const base = s.replace(/:(hover|focus-visible|focus|not\([^)]*\))/g, '');
    const alvo = base.split(' ').pop();
    const act = ativos.filter((a) => a.sel.split(',').some((x) => x.replace(/:active.*$/, '').replace(/:not\([^)]*\)/g, '').trim().split(' ').pop() === alvo));
    linhas.push({
      arquivo: r.arq, linha: r.linha, seletor: s, media: r.media || '', sombra: d.px, tocavel: tocavel(s),
      active: act.map((a) => `${a.arq}:${a.linha} ${(a.corpo.match(/transform\s*:\s*[^;]+/) || ['sem transform'])[0].trim()}; ${(a.corpo.match(/box-shadow\s*:\s*[^;]+/) || ['sombra igual'])[0].trim()}`).join(' ; ') || '—',
    });
  }
}
if (json) { console.log(JSON.stringify(linhas, null, 1)); process.exit(0); }
console.log('| arquivo:linha | seletor | sombra | JS (heurística) | :active hoje |');
console.log('|---|---|---|---|---|');
for (const l of linhas) console.log(`| ${l.arquivo}:${l.linha}${l.media ? ' (' + l.media + ')' : ''} | \`${l.seletor}\` | ${l.sombra} px | ${l.tocavel} | ${l.active} |`);
console.log('\nTodo :active de jogo/css (com ou sem sombra):');
for (const a of ativos) console.log(`- ${a.arq}:${a.linha} \`${a.sel}\` → ${a.corpo.trim().replace(/\s+/g, ' ')}`);
console.log(`\n${linhas.length} seletores com sombra de degrau; ${linhas.filter((l) => l.active === '—').length} sem :active.`);
