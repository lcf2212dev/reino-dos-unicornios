// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético): tipografia e pixel RENDERIZADOS (ui.md §10.9 e
// §10.10; onda 2b). Nas 25 cenas do inventário da 2b, nos 3 tamanhos, normal e com "Letras grandes" (texto 1.15):
//   - todo texto visível com font-size da escala 8/12/16/24/32/48 px, font-weight 400 e entrelinha 1, 1,25 ou 1,5;
//   - todo <canvas> do DOM (sprite do paraDOM) com um número PAR de px CSS por px de arte (fora o voo e o joystick).
// Enquanto a 2b conserta, só RELATA (sai verde); com ESTRITO do validar-tipografia.js (ou REINO_TIPOGRAFIA_ESTRITA=1)
// qualquer violação reprova. Sempre reprova se uma cena não abriu ou não mediu nada.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/tipografia.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');
const { lancar } = require('../navegador');
const VT = require('../../validar/validar-tipografia');

const ESTRITO = VT.ESTRITO || process.env.REINO_TIPOGRAFIA_ESTRITA === '1';
const TELAS = ['estabulo', 'loja', 'bau', 'ajustes', 'pais', 'lugares', 'aparencia', 'album', 'foguete', 'album-ets', 'plano',
  'escola', 'castelo', 'petshop', 'materia:historia', 'livro:historia', 'sala:h1', 'prova:historia-3bim', 'prova:historia-3bim:2', 'foto'];
const ENTRELINHAS = [1, 1.25, 1.5];

// roda na página: { fs: {px: [quem]}, lh, fw, px, n } do que está visível
function medir() {
  var r = { fs: {}, lh: {}, fw: {}, px: {}, n: 0 };
  function quem(e) { var c = e.className; if (c && c.baseVal !== undefined) c = c.baseVal; return (e.tagName.toLowerCase() + '.' + String(c || '').trim().split(/\s+/).slice(0, 2).join('.')).replace(/\.$/, ''); }
  function por(m, k, s) { (m[k] = m[k] || []); if (m[k].length < 4 && m[k].indexOf(s) < 0) m[k].push(s); }
  document.querySelectorAll('body *').forEach(function (e) {
    var b = e.getBoundingClientRect(); if (!b.width || !b.height) return;
    var cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return;
    if (e.tagName === 'CANVAS') {
      if (e.id === 'reino' || !e.width || /voo|joystick/.test(quem(e))) return;
      r.n++; por(r.px, String(Math.round(b.width / e.width * 100) / 100), quem(e)); return;
    }
    var t = false; for (var i = 0; i < e.childNodes.length; i++) { var c = e.childNodes[i]; if (c.nodeType === 3 && c.textContent.trim()) { t = true; break; } }
    if (!t) return;
    r.n++;
    var f = parseFloat(cs.fontSize); por(r.fs, String(Math.round(f * 100) / 100), quem(e));
    por(r.lh, cs.lineHeight === 'normal' ? 'normal' : String(Math.round(parseFloat(cs.lineHeight) / f * 100) / 100), quem(e));
    if (cs.fontWeight !== '400') por(r.fw, cs.fontWeight, quem(e));
  });
  return r;
}

// o que está fora da escala numa medida: [ 'categoria valor (quem)' ]
function foraDaEscala(m) {
  const f = [];
  for (const [k, q] of Object.entries(m.fs)) if (!VT.ESCALA.includes(Number(k))) f.push(`font-size ${k}px (${q.join(' ')})`);
  for (const [k, q] of Object.entries(m.lh)) if (!ENTRELINHAS.includes(Number(k))) f.push(`entrelinha ${k} (${q.join(' ')})`);
  for (const [k, q] of Object.entries(m.fw)) f.push(`font-weight ${k} (${q.join(' ')})`);
  for (const [k, q] of Object.entries(m.px)) { const n = Number(k); if (Math.abs(n - Math.round(n)) > 0.02 || Math.round(n) % 2) f.push(`pixel ${k} px CSS (${q.join(' ')})`); }
  return f;
}

async function umaRodada(browser, tamanho, grande, relatorio) {
  const c = await abrirCenario({ save: 'completo', estrelas: 500, tamanho, browser, ajustes: grande ? { texto: 1.15 } : undefined });
  const nomeModo = `${tamanho}${grande ? ' (letras grandes)' : ''}`;
  const limpar = () => c.js('try { Reino.Claude.limpar(); } catch (e) {} Reino.UI.fecharTodas(); document.body.classList.remove("em-missao")').then(() => c.avancar(400));
  const anotar = async (cena) => {
    const m = await c.page.evaluate(medir);
    assert.ok(m.n > 0, `${nomeModo} ${cena}: nada medido (a cena abriu?)`);
    foraDaEscala(m).forEach((v) => relatorio.push(`${nomeModo} ${cena}: ${v}`));
  };
  try {
    await c.avancar(300); await anotar('mapa');
    for (const t of TELAS) {
      await c.tela(t);
      if (t === 'sala:h1') {
        await anotar('sala-h1-intro');
        if (await c.js("!!document.querySelector('.intro-botoes .btn-principal')")) await c.tocar('.intro-botoes .btn-principal');
        for (let i = 0; i < 40 && await c.js("!!document.querySelector('.resumo-botoes .btn-principal')"); i++) await c.tocar('.resumo-botoes .btn-principal');
        await c.avancar(600); await anotar('sala-h1-pergunta');
      } else { await c.avancar(300); await anotar(t); }
      await limpar();
    }
    await c.js('void Reino.Claude.falar(Reino.Claude.frase("dica"))'); await c.avancar(600); await anotar('claude'); await limpar();
    await c.ir('escola'); await c.avancar(300); await anotar('interior-escola');
    await c.ir('museu');
    await c.js("void Reino.NPCs.interagir(Reino.Cena.atual().npcs()[0],{interior:Reino.interiores.find(function(d){return d.id==='museu';}),cena:Reino.Cena.atual()})");
    await c.avancar(800); await anotar('npc-museu');
    assert.deepStrictEqual(c.erros, [], `${nomeModo}: erros na página`);
  } finally { await c.fechar(); }
}

test('texto e sprites do DOM na escala da 2b (8/12/16/24/32/48 px, peso 400, pixel par) nas 25 cenas', { timeout: 900000 }, async () => {
  const browser = await lancar();
  const relatorio = [];
  try {
    for (const tamanho of ['celular', 'tablet', 'notebook']) for (const grande of [false, true]) await umaRodada(browser, tamanho, grande, relatorio);
  } finally { await browser.close().catch(() => {}); }
  if (relatorio.length) {
    const cat = {}; relatorio.forEach((l) => { const k = l.split(': ')[1].split(' ')[0]; cat[k] = (cat[k] || 0) + 1; });
    console.log(`${ESTRITO ? '✘' : '·'} tipografia renderizada: ${relatorio.length} fora da escala (${Object.entries(cat).map(([k, n]) => `${k} ${n}`).join(', ')})`);
    if (ESTRITO || process.env.REINO_TIPOGRAFIA_DETALHES) relatorio.forEach((l) => console.log('    ' + l));
  }
  if (ESTRITO) assert.deepStrictEqual(relatorio, [], 'texto ou sprite fora da escala');
});
