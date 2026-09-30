// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico): a Mesa de Separar Misturas do
// 2º andar do Laboratório de Química (UI.telaQuimicaSeparar, docs/contratos/quimica.md §9). Abre com 6 misturas e 6
// ferramentas; ferramenta sem mistura só pede a mistura; a errada não grava nem dá estrela; a certa grava na hora e dá
// a estrela só na 1ª vez; sem animação (congelado) o palco já está no quadro final; teclado (Tab, Enter) e Esc fecha.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/quimica-separar.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const palco = (campo) => `document.querySelector('.sep-palco').dataset.${campo}`;
const texto = "document.querySelector('.sep-texto').textContent";

test('mesa de separar: errada não pune, certa grava e dá estrela só na 1ª vez, quadro final, teclado', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-quimica-separar' });
  try {
    const estrelas = () => c.js('Reino.Progresso.estrelas()');
    const antes = await estrelas();
    assert.strictEqual(await c.js("Reino.Quimica.descoberto('separar', 'cafe')"), false, 'save sintético sem a mistura');

    await c.js('void Reino.UI.telaQuimicaSeparar()');
    await c.avancar(600);
    assert.strictEqual(await c.js("document.querySelectorAll('.sep-misturas .sep-opcao').length"), 6);
    assert.strictEqual(await c.js("document.querySelectorAll('.sep-ferramentas .sep-opcao').length"), 6);
    assert.strictEqual(await c.js("document.querySelector('.sep-contagem').textContent"), 'Separadas: 0 de 6');
    assert.strictEqual(await c.js(palco('quadro')), 'vazio');

    // ferramenta sem mistura: só pede a mistura
    await c.tocar('.sep-ferramentas [data-id="coador"]');
    assert.strictEqual(await c.js(texto), await c.js("Reino.Quimica.frase('separar.semMistura').join(' ')"));

    // café + ímã: não serve, nada muda
    await c.tocar('.sep-misturas [data-id="cafe"]');
    assert.strictEqual(await c.js(palco('quadro')), 'mistura');
    await c.tocar('.sep-ferramentas [data-id="ima"]');
    assert.strictEqual(await c.js("Reino.Quimica.descoberto('separar', 'cafe')"), false, 'errada não grava');
    assert.strictEqual(await estrelas(), antes, 'errada não dá nem tira estrela');
    assert.strictEqual(await c.js(texto), await c.js("Reino.Quimica.frase('separar.naoSepara').join(' ')"));
    assert.ok(await c.js("document.querySelector('.sep-jeito').hidden"), 'sem o nome do jeito');

    // café + coador: grava na hora, estrela, quadro final sem esperar
    const r = await c.js(`(function () {
      document.querySelector('.sep-ferramentas [data-id="coador"]').click();
      return { gravou: Reino.Quimica.descoberto('separar', 'cafe'), quadro: document.querySelector('.sep-palco').dataset.quadro,
        jeito: document.querySelector('.sep-jeito').textContent, premio: !document.querySelector('.sep-premio').hidden };
    })()`);
    assert.deepStrictEqual(r, { gravou: true, quadro: 'final', jeito: 'Filtrar!', premio: true });
    assert.strictEqual(await estrelas(), antes + await c.js('Reino.config.quimica.estrelasMisturaNova'), 'estrela da 1ª vez');
    assert.strictEqual(await c.js("document.querySelector('.sep-contagem').textContent"), 'Separadas: 1 de 6');
    assert.ok(await c.js(`JSON.parse(localStorage.getItem(Reino.config.chaveSave)).quimica.separar.cafe === 1`), 'gravado no aparelho');
    assert.ok(await c.js(`(function () { var d = document.querySelector('.sep-palco').getContext('2d').getImageData(0, 0, 160, 96).data;
      var cores = {}; for (var i = 0; i < d.length; i += 4) cores[d[i] + ',' + d[i + 1] + ',' + d[i + 2]] = 1; return Object.keys(cores).length > 20; })()`), 'palco desenhado');

    // de novo: sem estrela
    const meio = await estrelas();
    await c.tocar('.sep-misturas [data-id="cafe"]');
    await c.tocar('.sep-ferramentas [data-id="coador"]');
    assert.strictEqual(await estrelas(), meio, 'repetida não dá estrela');
    assert.ok(await c.js("document.querySelector('.sep-premio').hidden"));

    // todas as certas desenham o quadro final sem erro
    for (const [m, f] of [['feijao', 'mao'], ['areia-pedras', 'peneira'], ['agua-sal', 'sol'], ['areia-ferro', 'ima'], ['agua-barrenta', 'esperar']]) {
      await c.tocar(`.sep-misturas [data-id="${m}"]`);
      await c.tocar(`.sep-ferramentas [data-id="${f}"]`);
      assert.strictEqual(await c.js(palco('quadro')), 'final', m);
    }
    assert.strictEqual(await c.js("document.querySelector('.sep-contagem').textContent"), 'Separadas: 6 de 6');

    // teclado: Tab até o feijão, Enter escolhe; Esc fecha
    for (let i = 0; i < 30; i++) {
      await c.tecla('Tab');
      if (await c.js("document.activeElement && document.activeElement.dataset.id === 'feijao'")) break;
    }
    await c.tecla('Enter');
    assert.strictEqual(await c.js(palco('mistura')), 'feijao', 'Enter escolhe');
    await c.tecla('Escape');
    assert.strictEqual(await c.js('Reino.UI.temTela()'), false, 'Esc fecha');
    assert.deepStrictEqual(c.erros, [], 'sem erro de console');
  } finally { await c.fechar(); }
});
