// Rodapé de ação (docs/contratos/arte.md §20; D10-B02, D7-03, D12f-01, D6-09): nos 3 tamanhos, o botão
// de seguir fica à vista sem rolar e no mesmo lugar. Mede, numa página só: a intro e cada carta do resumo das salas
// (todas), cada carta dos livros (todos), a capa das provas (todas) e o rodapé da questão 2 da prova de História.
// Servidor e banco de TESTE novos (cenario.js); save 100% sintético.
const { test } = require('node:test');
const assert = require('assert');
const path = require('path');
const { PASTA_VER } = require('../cenario');
const { abrirCenario } = require('./ajudantes/terceiro-bimestre');
const pasta = (n) => path.join(PASTA_VER, n);   // dentro da REINO_TESTES (guardas.js)

// caixa de um elemento: topo, x, fundo, altura e se o texto passa da largura (botão de 1 linha que não coube)
const MEDIR = `window.__caixa = function (sel) {
  var e = document.querySelector(sel);
  if (!e) return null;
  var r = e.getBoundingClientRect();
  return { top: Math.round(r.top), x: Math.round(r.left), bottom: Math.round(r.bottom), h: Math.round(r.height), vaza: e.scrollWidth > e.clientWidth + 1 };
};`;

const SALAS = `(function () {
  var out = [];
  Reino.materias.forEach(function (m) { m.salas.forEach(function (s) {
    Reino.UI.fecharTodas();
    Reino.Missao.iniciar(m, s);
    var intro = __caixa('.intro-botoes .btn-principal'), cartas = [];
    document.querySelector('.intro-botoes .btn-principal').click();
    for (var k = 0; k < 40 && document.querySelector('.resumo-sala'); k++) {
      cartas.push(__caixa('.resumo-botoes .btn-principal'));
      document.querySelector('.resumo-botoes .btn-principal').click();
    }
    out.push({ sala: s.id, intro: intro, cartas: cartas });
  }); });
  Reino.UI.fecharTodas();
  return out;
})()`;

const LIVROS = `(function () {
  var out = [];
  Reino.materias.forEach(function (m) {
    if (!m.livro || !m.livro.length) return;
    Reino.UI.fecharTodas();
    Reino.UI.abrirLivro(m);
    for (var i = 0; i < m.livro.length; i++) {
      out.push({ carta: m.id + ' ' + (i + 1), nav: __caixa('.livro-nav'), seta: __caixa('.livro-nav button:last-child'),
        ouvir: __caixa('.livro-rodape .intro-botoes .btn-principal') });
      document.querySelector('.livro-nav button:last-child').click();
    }
  });
  Reino.UI.fecharTodas();
  return out;
})()`;

const CAPAS = `(function () {
  var out = Reino.provas.map(function (p) {
    Reino.UI.fecharTodas();
    Reino.Provas.iniciar(p);
    var b = [].slice.call(document.querySelectorAll('.tela-prova button')).filter(function (x) { return x.textContent.indexOf('Começar a prova') >= 0; })[0];
    b.classList.add('medir-capa');
    return { prova: p.id, ir: __caixa('.medir-capa') };
  });
  Reino.UI.fecharTodas();
  return out;
})()`;

for (const tamanho of ['celular', 'tablet', 'notebook']) {
  test(`${tamanho}: salas, livros e capas com o botão de seguir à vista e parado`, async () => {
    const c = await abrirCenario({ save: 'completo', tamanho, pasta: pasta('rodape-acao-' + tamanho) });
    try {
      await c.js(MEDIR);
      const alt = await c.js('innerHeight');
      const fora = (b) => !b || b.bottom > alt || b.top < 0 || b.vaza;

      const salas = await c.js(SALAS);
      assert.ok(salas.length >= 31, 'salas: ' + salas.length);
      const introRuim = salas.filter((s) => fora(s.intro)).map((s) => s.sala);
      assert.deepStrictEqual(introRuim, [], '"Começar" fora da tela ou vazando');
      const cartas = salas.reduce((n, s) => n + s.cartas.length, 0);
      assert.ok(cartas >= 105, 'cartas do resumo: ' + cartas);
      const cartaRuim = [];
      salas.forEach((s) => s.cartas.forEach((b, i) => { if (fora(b)) cartaRuim.push(s.sala + ' ' + (i + 1)); }));
      assert.deepStrictEqual(cartaRuim, [], '"Continuar" fora da tela ou vazando');
      // o "Continuar" não muda de lugar de uma carta para outra (a última, "Começar as perguntas", também não)
      salas.forEach((s) => s.cartas.forEach((b) => assert.deepStrictEqual([b.top, b.x], [s.cartas[0].top, s.cartas[0].x], s.sala)));

      const livro = await c.js(LIVROS);
      assert.ok(livro.length >= 95, 'cartas dos livros: ' + livro.length);
      const livroRuim = livro.filter((l) => fora(l.nav) || fora(l.seta) || (l.ouvir && fora(l.ouvir))).map((l) => l.carta);
      assert.deepStrictEqual(livroRuim, [], 'navegação do livro fora da tela');
      const topos = new Set(livro.map((l) => l.seta.top + ',' + l.seta.x));
      assert.strictEqual(topos.size, 1, 'a seta → muda de lugar: ' + [...topos].join(' | '));

      const capas = await c.js(CAPAS);
      assert.ok(capas.length >= 6, 'provas: ' + capas.length);
      assert.deepStrictEqual(capas.filter((p) => fora(p.ir)).map((p) => p.prova), [], '"Começar a prova" fora da tela');
      assert.deepStrictEqual(c.erros, []);
    } finally { await c.fechar(); }
  });
}

test('celular: "← Anterior" e "Próxima →" da prova numa linha, com 44 px ou mais', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: pasta('rodape-acao-prova') });
  try {
    await c.js(MEDIR);
    await c.tela('prova:historia-3bim');
    for (const [p, ms] of [['Começar a prova', 800], ['Já respirei', 1500], ['.opcao', 20000], ['Próxima', 1500]]) { await c.tocar(p); await c.avancar(ms); }
    const r = await c.js(`({ n: document.querySelector('.desafio-num').textContent, ant: __caixa('.prova-rodape .btn-secundario'),
      prox: __caixa('.prova-rodape .btn-principal'), rodape: __caixa('.prova-rodape') })`);
    assert.match(r.n, /Questão 2/);
    for (const b of [r.ant, r.prox]) { assert.ok(b.h >= 44 && b.h <= 60 && !b.vaza, JSON.stringify(b)); }
    assert.ok(r.rodape.h <= 84, 'rodapé: ' + r.rodape.h);
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

// rodapé sem botão (a memória não tem "Conferir"): não guarda os 80 px; no celular, some
for (const [tamanho, max] of [['celular', 0], ['tablet', 60]]) {
  test(`${tamanho}: memória sem "Conferir", rodapé sem espaço guardado`, async () => {
    const c = await abrirCenario({ save: 'completo', tamanho, pasta: pasta('rodape-acao-memoria-' + tamanho) });
    try {
      await c.tela('desafio:c1-12');
      const h = await c.js("Math.round(document.querySelector('.tela-missao .missao-rodape').getBoundingClientRect().height)");
      assert.ok(h <= max, 'rodapé da memória: ' + h + ' px');
      assert.deepStrictEqual(c.erros, []);
    } finally { await c.fechar(); }
  });
}

// botões de uma tela no rodapé de ação: todos à vista, dentro da tela e sem o texto vazar (D8B-26, D8B-05)
const BOTOES_VISIVEIS = `(function (sel) {
  return [].slice.call(document.querySelectorAll(sel)).filter(function (b) { return b.offsetParent; }).map(function (b) {
    var r = b.getBoundingClientRect();
    return { b: b.getAttribute('aria-label') || b.textContent.trim(), ok: r.top >= 0 && r.bottom <= innerHeight && b.scrollWidth <= b.clientWidth + 1 };
  });
})`;
for (const tamanho of ['celular', 'tablet', 'notebook']) {
  test(`${tamanho}: "Pronto!" da aparência e os botões da foto à vista sem rolar`, async () => {
    const c = await abrirCenario({ save: 'completo', tamanho, pasta: pasta('rodape-acao-telas-' + tamanho) });
    try {
      const ver = async (tela, sel, min) => {
        await c.tela(tela);
        const bs = await c.js(`${BOTOES_VISIVEIS}(${JSON.stringify(sel)})`);
        assert.ok(bs.length >= min, tela + ': ' + JSON.stringify(bs));
        assert.deepStrictEqual(bs.filter((x) => !x.ok), [], tela);
        await c.js('Reino.UI.fecharTodas()'); await c.avancar(300);
      };
      await ver('aparencia', '.tela-aparencia .criar-botoes .btn-grande', 1);
      await ver('foto', '.tela-fotos-previa .fotos-botoes .btn-grande', 3);
      await ver('album:2', '.tela-fotos-ver .fotos-botoes .btn-grande', 2);
      assert.deepStrictEqual(c.erros, []);
    } finally { await c.fechar(); }
  });
}

// separar no celular (D6-10): o item escolhido e os dois baús juntos na tela, sem rolar
test('celular: separar com o item escolhido e os dois baús à vista', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: pasta('rodape-acao-separar') });
  try {
    await c.tela('desafio:c4-11');
    await c.tocar('.separar-monte .sep-item'); await c.avancar(300);
    const r = await c.js(`(function () {
      var corpo = document.querySelector('.missao-corpo').getBoundingClientRect();
      var cx = [].slice.call(document.querySelectorAll('.bau, .sep-item.escolhido')).map(function (e) { return e.getBoundingClientRect(); });
      return { n: cx.length, dentro: cx.every(function (x) { return x.top >= corpo.top && x.bottom <= corpo.bottom; }) };
    })()`);
    assert.deepStrictEqual(r, { n: 3, dentro: true });
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

// última página do guia (D5-04): nenhum ícone sozinho numa linha, "Livro das Memórias" em até 2 linhas, mesma altura na linha
for (const tamanho of ['celular', 'notebook']) {
  test(`${tamanho}: botões da última página do guia sem escada`, async () => {
    const c = await abrirCenario({ save: 'completo', tamanho, pasta: pasta('rodape-acao-guia-' + tamanho) });
    try {
      await c.ir('museu');
      await c.js("void Reino.NPCs.interagir(Reino.Cena.atual().npcs().find(function (n) { return n.id === 'memoria'; }), { interior: Reino.interiores.find(function (d) { return d.id === 'museu'; }), cena: Reino.Cena.atual() })");
      await c.avancar(800);
      for (let i = 0; i < 6; i++) {
        await c.js("(function () { var b = [].slice.call(document.querySelectorAll('.claude-acoes button')).find(function (x) { return /Continuar/.test(x.textContent); }); if (b) b.click(); })()");
        await c.avancar(400);
      }
      const bs = await c.js(`[].slice.call(document.querySelectorAll('.claude-acoes button')).filter(function (b) { return b.offsetParent; }).map(function (b) {
        var r = b.getBoundingClientRect(), lh = parseFloat(getComputedStyle(b).lineHeight), cv = b.querySelector('canvas');
        var linhas = Math.round((b.clientHeight - parseFloat(getComputedStyle(b).paddingTop) - parseFloat(getComputedStyle(b).paddingBottom)) / lh);
        var t = document.createRange(); t.selectNodeContents(b); var rs = [].slice.call(t.getClientRects());
        var textoTopo = rs.filter(function (x) { return x.width > 1; }).map(function (x) { return Math.round(x.top); });
        return { t: b.textContent.trim(), top: Math.round(r.top), h: Math.round(r.height), linhas: linhas,
          iconeSo: !!cv && cv.offsetParent !== null && b.textContent.trim() !== '' && Math.round(cv.getBoundingClientRect().top) > Math.min.apply(null, textoTopo) + lh / 2 };
      })`);
      assert.ok(bs.some((b) => /Livro das Memórias/.test(b.t)), JSON.stringify(bs));
      assert.deepStrictEqual(bs.filter((b) => b.iconeSo).map((b) => b.t), [], 'ícone sozinho na linha de baixo');
      const livro = bs.find((b) => /Livro das Memórias/.test(b.t));
      assert.ok(livro.linhas <= 2, 'Livro das Memórias: ' + livro.linhas + ' linhas');
      const porLinha = {};
      bs.forEach((b) => { (porLinha[b.top] = porLinha[b.top] || []).push(b.h); });
      Object.values(porLinha).forEach((hs) => assert.strictEqual(new Set(hs).size, 1, 'alturas na mesma linha: ' + hs));
      assert.deepStrictEqual(c.erros, []);
    } finally { await c.fechar(); }
  });
}
