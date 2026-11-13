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
