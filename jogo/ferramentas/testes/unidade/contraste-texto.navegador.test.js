// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético): contraste do TEXTO da interface (ui.md §10.8.1).
// Em cada tela (as mesmas cenas do e2e: tela-materia-*, prova-*-capa, tela-plano, tela-estabulo, telas do menu,
// um desafio de cada tipo, prova-portugues-3bim-q11), mede a cor do texto (getComputedStyle, com a opacidade de
// quem está por cima) × o fundo efetivo (as camadas de background-color até a primeira opaca; faixa de degradê
// duro conta a pior faixa) e exige ≥ 4,5:1 (3:1 com 24 px ou mais), inclusive nos ::before/::after com texto.
// A conta é a de validar/contraste.js. Também confere que um par ruim de propósito é acusado.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/contraste-texto.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');
const { mostrarDesafio } = require('../referencias-cenas');
const CT = require('../../validar/contraste');

// roda na página: devolve [{ onde, texto, cor, fundo, px, fg, bg }] do texto visível dentro da tela do topo
function coletarTexto(seletorRaiz) {
  function rgba(s) {
    var m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) return null;
    var p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  function sobre(c, base) {   // c (com alfa) por cima de base (opaca)
    var a = c[3];
    return [0, 1, 2].map(function (i) { return Math.round(c[i] * a + base[i] * (1 - a)); }).concat(1);
  }
  // cores das faixas de um linear-gradient (duro, §10.2): a pior faixa decide
  function faixas(img) {
    if (!img || img === 'none' || img.indexOf('linear-gradient') < 0) return null;
    var cores = (img.match(/rgba?\([^)]+\)/g) || []).map(rgba);
    return cores.length && cores.every(function (c) { return c[3] >= 0.99; }) ? cores : null;
  }
  // fundos possíveis sob o elemento: camadas até a primeira opaca (ou degradê opaco)
  function fundos(el) {
    var camadas = [];
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var cs = getComputedStyle(n), g = faixas(cs.backgroundImage);
      if (g) { return g.map(function (base) { return camadas.reduceRight(function (b, c) { return sobre(c, b); }, base); }); }
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && cs.backgroundImage.indexOf('gradient') < 0) return null;   // imagem: fundo desconhecido
      var c = rgba(cs.backgroundColor);
      if (c && c[3] >= 0.99) return [camadas.reduceRight(function (b, x) { return sobre(x, b); }, c)];
      if (c && c[3] > 0) camadas.unshift(c);   // a de cima fica no começo
    }
    return null;
  }
  function opacidade(el) {
    var o = 1;
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
    return o;
  }
  function nome1(el) { return el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).join('.') : ''); }
  function nome(el) { var n = nome1(el); return n.indexOf('.') < 0 && el.parentElement ? nome1(el.parentElement) + ' > ' + n : n; }   // sem classe: com a do pai
  var telas = [...document.querySelectorAll(seletorRaiz)].filter(function (t) { return !t.hidden; });
  var raiz = telas[telas.length - 1];
  if (!raiz) return { erro: 'nenhuma tela aberta (' + seletorRaiz + ')' };
  var saida = [];
  function medir(el, texto, cs, onde) {
    if (!/[\p{L}\p{N}_]|\.\.\.|…/u.test(texto)) return;   // letra, número, a lacuna "______" e a vaga "..."
    var cor = rgba(cs.color);
    if (!cor) return;
    cor[3] *= opacidade(el);
    if (cor[3] < 0.05) return;   // texto escondido de propósito (color: transparent)
    var fs = fundos(el);
    if (!fs) return;
    fs.forEach(function (bg) {
      saida.push({ onde: onde, texto: texto.trim().slice(0, 40), px: parseFloat(cs.fontSize), fg: sobre(cor, bg).slice(0, 3), bg: bg.slice(0, 3) });
    });
  }
  raiz.querySelectorAll('*').forEach(function (el) {
    var cs = getComputedStyle(el);
    if (cs.visibility !== 'visible' || cs.display === 'none') return;
    // controle inativo (disabled, aria-disabled): o WCAG não pede contraste; o visual dele é o do estado
    // indisponível (ui.md §10.19.1, item D10-B04)
    if (el.closest(':disabled, [aria-disabled="true"]')) return;
    var r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return;
    var proprio = [...el.childNodes].filter(function (n) { return n.nodeType === 3; }).map(function (n) { return n.textContent; }).join('');
    if (proprio.trim()) medir(el, proprio, cs, nome(el));
    ['::before', '::after'].forEach(function (p) {
      var ps = getComputedStyle(el, p), c = ps.content;
      if (!c || c === 'none' || c === 'normal' || ps.display === 'none') return;
      var m = /^"(.*)"$/.exec(c);
      if (m) medir(el, m[1], ps, nome(el) + p);
    });
  });
  return saida;
}

function reprovados(medidas, cena) {
  return medidas.map((m) => {
    const r = CT.razao(CT.luminancia(...m.fg), CT.luminancia(...m.bg));
    const min = m.px >= 24 ? 3 : 4.5;
    return r + 1e-9 < min ? `${cena}: ${m.onde} "${m.texto}" ${r.toFixed(2)}:1 < ${min} (texto rgb(${m.fg}) sobre rgb(${m.bg}), ${m.px}px)` : null;
  }).filter(Boolean);
}

test('contraste do texto da interface ≥ 4,5:1 (3:1 com ≥ 24 px) sobre o fundo real', async () => {
  const c = await abrirCenario({ save: 'completo', estrelas: 500, tamanho: 'celular' });
  const vistos = new Set();   // classes medidas (as vagas de espera têm de estar entre elas)
  const medidas = {};   // cena → quantos textos medidos (cena sem texto medido = teste quebrado)
  const medir = async (cena) => {
    const m = await c.page.evaluate(coletarTexto, '#telas .tela');
    if (m.erro) throw new Error(`${cena}: ${m.erro}`);
    medidas[cena] = m.length;
    m.forEach((x) => (x.onde.match(/[\w-]+/g) || []).forEach((k) => vistos.add(k)));
    return m;
  };
  const limpar = () => c.js('try { Reino.Claude.limpar(); } catch (e) {} Reino.UI.fecharTodas(); document.body.classList.remove("em-missao")').then(() => c.avancar(400));
  try {
    // o próprio teste acusa: roxo de seleção sobre o papel (4,1:1) e a vaga #b3a6cc (2,15:1); tinta passa
    await c.js(`(function () { var t = Reino.UI.abrirTela('teste-contraste'); t.style.background = '#fff8ee';
      t.innerHTML = '<p style="color:#7c5cff">Entrar</p><p style="color:#b3a6cc">...vaga</p><span style="color:#b3a6cc">______</span><p style="color:#3a2446">ok</p>'; })()`);
    await c.avancar(200);
    const ruins = reprovados(await medir('teste'), 'teste');
    assert.strictEqual(ruins.length, 3, 'o teste deveria acusar os 3 pares ruins de propósito (roxo, vaga, lacuna):\n' + ruins.join('\n'));
    await limpar();

    const falhas = [];
    const cenas = [];
    for (const t of ['plano', 'estabulo', 'lugares', 'loja', 'escola', 'bau', 'castelo', 'ajustes']) cenas.push(['tela-' + t, t]);
    const ids = await c.js('({ materias: Reino.materias.map(function (m) { return m.id; }), provas: Reino.provas.map(function (p) { return p.id; }) })');
    ids.materias.forEach((id) => cenas.push(['tela-materia-' + id, 'materia:' + id]));
    ids.provas.forEach((id) => cenas.push([`prova-${id}-capa`, 'prova:' + id]));
    for (const [cena, tela] of cenas) {
      await c.tela(tela);
      falhas.push(...reprovados(await medir(cena), cena));
      await limpar();
    }
    // um desafio de cada tipo das salas (as vagas .frase-vazia, .copiar-vazia, .seq-vaga, .lacuna) e a q11 da prova de Português
    // o detalhe de um unicórnio de cada raridade (o nome da raridade na cor dela)
    for (const rar of ['comum', 'raro', 'epico', 'lendario']) {
      await c.tela('estabulo');
      const abriu = await c.js(`(function () { var b = document.querySelector('#telas .tela .carta-uni.rar-${rar}:not(.escondida)'); if (!b) return false; b.click(); return true; })()`);
      if (abriu) { await c.avancar(600); falhas.push(...reprovados(await medir('estabulo-detalhe-' + rar), 'estabulo-detalhe-' + rar)); }
      await limpar();
    }
    const tipos = await c.js(`(function () { var v = {}; Reino.materias.forEach(function (m) { m.salas.forEach(function (s) { s.desafios.forEach(function (d, i) {
      if (!v[d.tipo]) v[d.tipo] = { m: m.id, s: s.id, i: i }; }); }); }); return v; })()`);
    // depois de medir vazio, marca a 1ª opção (seleção em roxo, o "(X)" da prova) e, se houver, preenche a 1ª lacuna
    const medirComSelecao = async (cena) => {
      falhas.push(...reprovados(await medir(cena), cena));
      const marcou = await c.js(`(function () { var t = [...document.querySelectorAll('#telas .tela')].pop();
        var b = t && t.querySelector('button[aria-pressed="false"]:not(:disabled)'); if (!b) return false; b.click(); return true; })()`);
      if (!marcou) return;
      await c.avancar(300);
      await c.js(`(function () { var l = document.querySelector('#telas .tela .lacuna'); if (l) l.click(); })()`);
      await c.avancar(300);
      falhas.push(...reprovados(await medir(cena + ' (marcada)'), cena + ' (marcada)'));
    };
    for (const [tipo, ref] of Object.entries(tipos)) {
      await mostrarDesafio(c.page, 'missao', ref);
      await c.avancar(600);
      await medirComSelecao('desafio-' + tipo);
      await limpar();
    }
    // q11 de Português (a vaga do copiar) e a q1 de História (marcar com "(X)")
    for (const [id, n] of [['portugues-3bim', 11], ['historia-3bim', 1]]) {
      if (!ids.provas.includes(id)) continue;
      await c.tela(`prova:${id}:${n}`);
      await medirComSelecao(`prova-${id}-q${String(n).padStart(2, '0')}`);
      await limpar();
    }
    const faltam = ['lacuna', 'frase-vazia', 'copiar-vazia', 'seq-vaga', 'sala-ir', 'plano-frase'].filter((k) => !vistos.has(k));
    assert.deepStrictEqual(faltam, [], 'textos que o teste devia medir e não mediu');
    const vazias = Object.keys(medidas).filter((k) => !medidas[k]);
    assert.deepStrictEqual(vazias, [], 'cenas sem nenhum texto medido');
    assert.ok(Object.keys(medidas).length >= 30, 'poucas cenas medidas: ' + Object.keys(medidas).join(', '));
    if (process.env.REINO_CONTRASTE_LISTA) console.log(medidas);
    assert.deepStrictEqual([...new Set(falhas)], [], 'texto abaixo do contraste mínimo (ui.md §10.8.1):\n' + [...new Set(falhas)].join('\n'));
  } finally { await c.fechar(); }
});
