// Quebra de linha e desenho dos desafios (arte.md §17; desafios/quebra.js): o desenho com o seletor invisível U+FE0F
// ('✏️') acha a chave '✏' no ligar, no completar e no digitar (nada de ❓); o texto da opção leva os grupos colados e,
// só quando a palavra não cabe, o hífen suave; o sinal depois da lacuna e da caixa fica preso a ela; "R$" preso ao número no enunciado; e, num painel
// sobre o mapa no notebook, o cartão com texto de apoio usa o desenho de uma coluna (caixa recolhível), não o de 2
// colunas da tela cheia. Desafios sintéticos, desenhados por Reino.Desafios.render.
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/desafios-quebra.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('./ajudantes/terceiro-bimestre');
const { PASTA_TESTES } = require('../guardas');

const LIGAR = { id: 'tq-l', tipo: 'ligar', pergunta: 'Ligue.', pares: [[{ img: '✏️', alt: 'lápis' }, { t: 'escrever' }], [{ t: 'sol' }, { t: 'dia' }]] };
const COMPLETAR = { id: 'tq-c', tipo: 'completar', pergunta: 'Complete.', palavras: ['lápis', 'sol'],
  frases: [{ img: '✏️', alt: 'lápis', antes: 'O', depois: '.', certa: 0 }, { antes: 'O', depois: '.', certa: 1 }] };
const DIGITAR = { id: 'tq-d', tipo: 'digitar', pergunta: 'Escreva.', frases: [{ img: '✏️', alt: 'lápis', antes: 'Eu uso o', depois: '").', certas: ['lápis'] },
  { antes: 'Quem mora na lâmpada?', depois: '', certas: ['Gênio da Lâmpada'] }] };
const ESCOLHA = { id: 'tq-e', tipo: 'escolha', pergunta: 'Quanto custa? De R$ 10,00 a R$ 15,00.', opcoes: [{ t: 'Ambientalista' }, { t: 'um carrinho de brinquedo' }], certa: 0 };
const APOIO = { id: 'tq-a', tipo: 'escolha', pergunta: 'Qual?', opcoes: [{ t: 'Sim.' }, { t: 'Não.' }], certa: 0,
  apoio: { titulo: 'Texto', partes: [{ texto: 'Era uma vez um gato que morava num castelo muito alto.' }] } };

test('quebra de linha e desenho dos desafios; cartão num painel do notebook em uma coluna', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'desafios-quebra-')) });
  try {
    // cada desafio desenhado num painel sobre o mapa, como a pergunta sozinha
    const abrir = async (d) => {
      await c.js(`Reino.UI.fecharTodas(); var pn = Reino.UI.painel('teste-quebra', 'Teste');
        pn.conteudo.appendChild(Reino.Desafios.render(${JSON.stringify(d)}, { modo: 'prova', onMudar: function () {} }).card)`);
      await c.avancar(300);
    };
    for (const d of [LIGAR, COMPLETAR, DIGITAR]) {
      await abrir(d);
      const r = await c.js(`(function () { var f = document.querySelector('.ligar-img, .completar-img, .digitar-img');
        return { canvas: !!(f && f.querySelector('canvas')), texto: f ? f.textContent : null }; })()`);
      assert.deepStrictEqual(r, { canvas: true, texto: '' }, `${d.tipo}: o '✏️' virou ❓`);
    }
    // completar e digitar: o sinal logo depois da lacuna/caixa no mesmo pedaço que não quebra
    await abrir(COMPLETAR);
    assert.strictEqual(await c.js(`document.querySelector('.lacuna-cola').textContent.slice(-1)`), '.');
    await abrir(DIGITAR);
    assert.strictEqual(await c.js(`document.querySelector('.digitar-cola').textContent`), '").');
    // resposta longa de várias palavras: caixa que quebra (textarea), sem cortar de lado
    assert.deepStrictEqual(await c.js(`[].map.call(document.querySelectorAll('.digitar .campo-texto'), function (e) { return e.tagName; })`), ['INPUT', 'TEXTAREA']);
    // opção: hífen suave na palavra longa, grupo colado inteiro; "R$" preso ao número no enunciado
    await abrir(ESCOLHA);
    // a palavra que cabe fica inteira; no botão estreito ela ganha o hífen da sílaba (e não passa do botão)
    assert.strictEqual(await c.js(`/\\u00ad/.test(document.querySelector('.opcao-texto').textContent)`), false, 'hífen à toa');
    await c.js(`document.querySelector('.painel .desafio').style.width = '180px'`);
    await c.page.waitForTimeout(200);   // o ResizeObserver vem no quadro de verdade (o relógio congelado não o traz)
    await c.avancar(300);
    assert.deepStrictEqual(await c.js(`[].filter.call(document.querySelectorAll('.opcao'), function (b) { return b.scrollWidth > b.clientWidth + 1; })
      .map(function (b) { var t = b.querySelector('.opcao-texto'); return [b.clientWidth, b.scrollWidth, t.clientWidth, t.scrollWidth, t.className, t.textContent]; })`), [], 'opção vaza');
    const op = await c.js(`(function () { var t = [].map.call(document.querySelectorAll('.opcao-texto'), function (e) { return e.textContent; });
      return { hifen: t.some(function (x) { return /Am\\u00adbi/.test(x); }), grupos: [].map.call(document.querySelectorAll('.grupo-colado'), function (e) { return e.textContent; }),
        reais: (document.querySelector('.pergunta').textContent.match(/R\\$\\u00a0\\d/g) || []).length }; })()`);
    assert.strictEqual(op.hifen, true, 'sem hífen suave em "Ambientalista"');
    assert.ok(op.grupos.some((g) => g.replace(/\u00ad/g, '') === 'de brinquedo'), `"de brinquedo" sem grupo colado (${op.grupos})`);
    assert.strictEqual(op.reais, 2, '"R$" solto do número');
    // texto de apoio num painel do notebook: uma coluna, a caixa recolhível com o botão de abrir à vista
    await abrir(APOIO);
    const ap = await c.js(`(function () { var d = document.querySelector('.painel .desafio.com-apoio');
      return { grade: getComputedStyle(d).display, abrir: getComputedStyle(document.querySelector('.apoio-abrir')).display !== 'none',
        vaza: d.scrollWidth > d.clientWidth + 1 }; })()`);
    assert.deepStrictEqual(ap, { grade: 'flex', abrir: true, vaza: false }, 'cartão do painel no desenho de 2 colunas');
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});

// o ajuste da palavra que não cabe (_d.caberTexto): a casa de uma letra fica fora, medir de novo dá o mesmo resultado,
// o escondido não é marcado e os irmãos (as opções da pergunta) descem o degrau juntos. Celular.
const CACA = { id: 'tq-cp', tipo: 'cacaPalavras', pergunta: 'Ache.', grade: ['GATOXYZ', 'ABCDEFG', 'SAPOHIJ'], palavras: ['GATO', 'SAPO'] };
const CRUZ = { id: 'tq-cz', tipo: 'cruzadinha', pergunta: 'Complete.', palavras: [{ resposta: 'GATO', x: 0, y: 0, dir: 'h', dica: 'Mia.' }, { resposta: 'GALO', x: 0, y: 0, dir: 'v', dica: 'Canta.' }] };
const IMG = { id: 'tq-im', tipo: 'varias', pergunta: 'Quais?', opcoes: [{ t: 'cabeleireiro', img: '✏️', ok: true }, { t: 'cozinheiro', img: '✏️' },
  { t: 'astrônomo', img: '✏️' }, { t: 'pé', img: '✏️' }] };
const ESCONDIDO = { id: 'tq-es', tipo: 'escolha', pergunta: 'Qual?', opcoes: [{ t: 'Sim.' }, { t: 'Não.' }], certa: 0,
  apoio: { titulo: 'Texto', partes: [{ texto: 'Era uma vez um gato.' }] } };

test('caberTexto: casa de grade fora, mesma medida duas vezes, escondido sem marca e irmãos juntos', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'desafios-quebra-')) });
  try {
    const abrir = async (d, largura) => {
      await c.js(`Reino.UI.fecharTodas(); var pn = Reino.UI.painel('teste-quebra', 'Teste'), k = Reino.Desafios.render(${JSON.stringify(d)}, { modo: 'prova', onMudar: function () {} }).card;
        ${largura ? `k.style.width = '${largura}px';` : ''} pn.conteudo.appendChild(k)`);
      await c.avancar(300);
      await c.page.waitForTimeout(150);   // o ResizeObserver vem no quadro de verdade
      await c.avancar(100);
    };
    // a grade do caça-palavras e da cruzadinha: toda casa com a mesma letra, nenhuma marcada (a margem de -2 px não vaza)
    for (const d of [CACA, CRUZ]) {
      await abrir(d);
      const casas = await c.js(`(function () { var cs = [].slice.call(document.querySelectorAll('.caca-letra, .cruz-casa'));
        return { n: cs.length, letras: cs.map(function (e) { return getComputedStyle(e.querySelector('.cruz-letra') || e).fontSize; }).filter(function (v, i, a) { return a.indexOf(v) === i; }),
          marcadas: cs.filter(function (e) { return e.querySelector('.texto-menor, .texto-parte') || e.matches('.texto-menor, .texto-parte'); }).length }; })()`);
      assert.ok(casas.n > 0, d.tipo + ': sem casas');
      assert.deepStrictEqual([casas.letras.length, casas.marcadas], [1, 0], `${d.tipo}: a letra da casa mudou (${casas.letras})`);
    }
    // as opções com desenho num cartão estreito: medir de novo dá o mesmo; quem desce leva os irmãos junto
    await abrir(IMG, 330);
    const foto = `[].map.call(document.querySelectorAll('.opcao-texto'), function (e) { return e.className + '|' + getComputedStyle(e).fontSize + '|' + e.textContent; }).join(' / ')`;
    const antes = await c.js(foto);
    await c.js(`[].forEach.call(document.querySelectorAll('.opcao-texto'), function (e) { e._caber(); e._caber(); })`);
    assert.strictEqual(await c.js(foto), antes, 'medir duas vezes mudou o resultado');
    const tam = await c.js(`[].map.call(document.querySelectorAll('.opcao-texto'), function (e) { return getComputedStyle(e).fontSize; }).filter(function (v, i, a) { return a.indexOf(v) === i; })`);
    assert.strictEqual(tam.length, 1, 'as opções da mesma pergunta em tamanhos diferentes: ' + tam);
    assert.ok(/texto-menor/.test(antes), 'o cartão estreito não fez nenhuma opção descer (o teste não testou nada): ' + antes);
    // escondido (o rótulo "Texto de apoio" no celular): nenhuma marca nem hífen
    await abrir(ESCONDIDO);
    const esc = await c.js(`(function () { var r = document.querySelector('.apoio-rotulo'); return { visivel: !!r.getClientRects().length, classe: r.className, hifen: /\\u00ad/.test(r.textContent) }; })()`);
    assert.deepStrictEqual(esc, { visivel: false, classe: 'apoio-rotulo', hifen: false }, 'o escondido foi marcado');
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});

// a lacuna preenchida (completar, celular com Letras grandes): as palavras postas ficam todas no mesmo tamanho, nenhuma
// parte no meio, e o ajuste roda de novo quando o bloco estreita depois (o retorno que abre, a barra de rolagem)
const LACUNAS = { id: 'tq-la', tipo: 'completar', pergunta: 'Complete.', palavras: ['FOTOSSÍNTESE', 'GÁS OXIGÊNIO', 'LUZ DO SOL'],
  frases: [{ antes: 'a) Durante a', depois: ', as plantas produzem açúcares.', certa: 0 }, { antes: 'b) As folhas soltam', depois: 'no ar.', certa: 1 },
    { antes: 'c) A planta usa a', depois: 'para crescer.', certa: 2 }] };

test('lacuna preenchida: mesmo tamanho nas frases irmãs, inteira, e medida de novo quando o bloco estreita', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', ajustes: { texto: 1.15 }, pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'desafios-quebra-')) });
  try {
    await c.js(`Reino.UI.fecharTodas(); var pn = Reino.UI.painel('teste-quebra', 'Teste');
      pn.conteudo.appendChild(Reino.Desafios.render(${JSON.stringify(LACUNAS)}, { modo: 'prova', onMudar: function () {} }).card)`);
    await c.avancar(300);
    // cada frase com a sua palavra
    await c.js(`[].forEach.call(document.querySelectorAll('.frase-completar'), function (f, i) { f.querySelectorAll('.chip-palavra')[i].click(); })`);
    await c.avancar(300);
    await c.page.waitForTimeout(150);   // o ResizeObserver vem no quadro de verdade
    await c.avancar(100);
    const olhar = () => c.js(`(function () { var ls = [].slice.call(document.querySelectorAll('.lacuna.preenchida'));
      return { n: ls.length, tamanhos: ls.map(function (l) { return getComputedStyle(l).fontSize; }).filter(function (v, i, a) { return a.indexOf(v) === i; }),
        partidas: ls.filter(function (l) { return l.classList.contains('texto-parte'); }).length,
        vazam: ls.filter(function (l) { var g = document.createRange(); g.selectNodeContents(l); var t = g.getBoundingClientRect(), p = l.closest('.frase-texto').getBoundingClientRect(); return t.right > p.right + 1; }).length }; })()`);
    const r = await olhar();
    assert.deepStrictEqual([r.n, r.tamanhos.length, r.partidas, r.vazam], [3, 1, 0, 0], 'lacunas preenchidas: ' + JSON.stringify(r));
    // o bloco estreita depois (como quando o retorno abre): a lacuna mede de novo e continua inteira
    await c.js(`document.querySelector('.painel .desafio').style.width = '230px'`);
    await c.page.waitForTimeout(200);
    await c.avancar(100);
    const r2 = await olhar();
    assert.deepStrictEqual([r2.tamanhos.length, r2.partidas, r2.vazam], [1, 0, 0], 'depois de estreitar: ' + JSON.stringify(r2));
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});

// o degrau não fica preso: a opção com figura que desceu num cartão estreito volta ao tamanho cheio quando o cartão
// alarga, e também depois de girar o tablet (deitado e em pé de novo). Tablet, letra normal.
const IMG2 = { id: 'tq-i2', tipo: 'varias', pergunta: 'Quais?', opcoes: [{ t: 'cabeleireiro', img: '✏️', ok: true }, { t: 'cozinheiro', img: '✏️' }] };
test('o degrau volta quando o cartão alarga e quando o tablet gira', async () => {
  const c = await abrirCenario({ tamanho: 'tablet', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'desafios-quebra-')) });
  try {
    const quadro = async () => { await c.avancar(200); await c.page.waitForTimeout(200); await c.avancar(100); };
    const menores = () => c.js(`document.querySelectorAll('.opcao-texto.texto-menor').length`);
    await c.js(`Reino.UI.fecharTodas(); var pn = Reino.UI.painel('teste-quebra', 'Teste'), k = Reino.Desafios.render(${JSON.stringify(IMG2)}, { modo: 'prova', onMudar: function () {} }).card;
      k.style.width = '330px'; pn.conteudo.appendChild(k)`);
    await quadro();
    assert.ok(await menores() > 0, 'em 330 px nenhuma opção desceu (o teste não testou nada)');
    await c.js(`document.querySelector('.painel .desafio').style.width = '600px'`);
    await quadro();
    assert.strictEqual(await menores(), 0, 'o degrau ficou preso depois de alargar');
    // girar: estreita de novo, gira deitado e volta em pé com o cartão largo
    await c.js(`document.querySelector('.painel .desafio').style.width = '330px'`);
    await quadro();
    await c.js(`document.querySelector('.painel .desafio').style.width = ''`);
    await c.page.setViewportSize({ width: 1180, height: 820 });
    await quadro();
    await c.page.setViewportSize({ width: 820, height: 1180 });
    await quadro();
    assert.strictEqual(await menores(), 0, 'o degrau ficou preso depois de girar o tablet');
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});

// o «inglês» curto no nome da opção com figura fica numa linha só quando há espaço ("I cry.", não "I / cry."; arte.md
// §17.4): o grupo colado tem a largura inteira do nome (sem a folga do fundo do «inglês» descontada). Tablet e celular.
const INGLES = { id: 'tq-en', tipo: 'escolha', pergunta: 'How do you feel?', opcoes: [{ t: '«I cry.»', img: '✏️' }, { t: '«I jump.»', img: '✏️' }, { t: '«I dance.»', img: '✏️' }], certa: 0 };
test('«I cry.» numa linha só no nome da opção com figura', async () => {
  for (const tamanho of ['tablet', 'celular']) {
    const c = await abrirCenario({ tamanho, save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'desafios-quebra-')) });
    try {
      await c.js(`Reino.UI.fecharTodas(); var pn = Reino.UI.painel('teste-quebra', 'Teste');
        pn.conteudo.appendChild(Reino.Desafios.render(${JSON.stringify(INGLES)}, { modo: 'prova', onMudar: function () {} }).card)`);
      await c.avancar(300); await c.page.waitForTimeout(150); await c.avancar(100);
      const linhas = await c.js(`[].map.call(document.querySelectorAll('.opcao-img .opcao-texto'), function (e) { var g = document.createRange(); g.selectNodeContents(e);
        var tops = []; [].forEach.call(g.getClientRects(), function (r) { if (r.width > 1 && !tops.some(function (t) { return Math.abs(t - r.top) < 4; })) tops.push(r.top); });
        return e.textContent + '=' + tops.length; })`);
      assert.deepStrictEqual(Array.from(linhas).sort(), ['I cry.=1', 'I dance.=1', 'I jump.=1'], `${tamanho}: rótulo curto em inglês partido em duas linhas`);
      assert.deepStrictEqual(c.erros || [], []);
    } finally { await c.fechar(); }
  }
});
