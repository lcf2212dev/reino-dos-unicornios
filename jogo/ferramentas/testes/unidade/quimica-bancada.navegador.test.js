// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico): a bancada do Laboratório de
// Química (UI.telaQuimicaBancada, docs/contratos/quimica.md §2). Abre com os produtos por grupo; tocar despeja; vinagre +
// bicarbonato e Misturar! grava a receita na hora e dá +2 estrelas só na 1ª vez (com o cartão, o Misturar! se apaga); sem animação (congelado) o palco
// já mostra o quadro final e o cartão; béquer cheio não aceita o 4º tubo; tubo sozinho dá "Quase!"; arrastar o tubo
// até o béquer despeja; Esvaziar; teclado (Tab, Enter) e Esc fecha. Zero erro de console.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/quimica-bancada.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const noBequer = "document.querySelectorAll('.tela-quimica-bancada .bancada-tubo.no-bequer').length";
const aVista = (sel) => `(function (e) { return !!e && !e.hidden && !e.closest('[hidden]') && e.getClientRects().length > 0; })(document.querySelector(${JSON.stringify(sel)}))`;
const quadro = "document.querySelector('.bancada-cena').dataset.quadro";

test('bancada de química: despejar, misturar, descobrir, estrelas só na 1ª vez; cheio; quase; arrastar; teclado', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-quimica-bancada' });
  try {
    const estrelas = () => c.js('Reino.Progresso.estrelas()');
    const antes = await estrelas();
    assert.strictEqual(await c.js("Reino.Quimica.descoberto('receitas', 'pof')"), false, 'save sintético sem a receita');

    await c.js('void Reino.UI.telaQuimicaBancada()');
    await c.avancar(600);
    assert.strictEqual(await c.js("document.querySelectorAll('.tela-quimica-bancada .bancada-tubo').length"), 32, '32 produtos');
    assert.strictEqual(await c.js("document.querySelector('.bancada-misturar').getAttribute('aria-disabled')"), 'true', 'Misturar! apagado vazio');

    // tocar despeja: vinagre e bicarbonato
    await c.tocar('[data-tubo="vinagre"]');
    await c.tocar('[data-tubo="bicarbonato"]');
    assert.strictEqual(await c.js(noBequer), 2);
    assert.strictEqual(await c.js("document.querySelector('.bancada-mistura').textContent"), 'Vinagre + Bicarbonato');
    assert.strictEqual(await c.js(quadro), 'bequer', 'sem animação: o tubo já caiu, sem quadro de despejo');
    assert.strictEqual(await c.js("document.querySelector('.bancada-misturar').getAttribute('aria-disabled')"), 'false');

    // Misturar!: grava na hora, quadro final sem esperar nada, cartão com a receita
    const r1 = await c.js(`(function () {
      document.querySelector('.bancada-misturar').click();
      var cv = document.querySelector('.bancada-cena');
      return { quadro: cv.dataset.quadro, efeito: cv.dataset.efeito, gravou: Reino.Quimica.descoberto('receitas', 'pof'),
        titulo: (document.querySelector('.bancada-resultado .bancada-titulo') || {}).textContent };
    })()`);
    assert.deepStrictEqual(r1, { quadro: 'final', efeito: 'explosao', gravou: true, titulo: 'POF! Explosão de confete' }, 'quadro final e cartão na hora');
    // +2 (estrelasReceitaNova); com os dados de hoje ainda incompletos, a receita pode fechar o caderno (+10)
    const ganho = await c.js('Reino.config.quimica.estrelasReceitaNova + (Reino.Quimica.cadernoCompleto() ? Reino.config.quimica.estrelasCadernoCompleto : 0)');
    assert.strictEqual(await estrelas(), antes + ganho, 'estrelas da 1ª vez');
    assert.ok(await c.js(aVista('.bancada-estrelas')), 'chip da receita nova');
    assert.ok(!(await c.js(aVista('.bancada-prateleira'))), 'o cartão fica no lugar da prateleira');
    assert.strictEqual(await c.js("document.querySelector('.bancada-misturar').getAttribute('aria-disabled')"), 'true', 'com o cartão, só o Outra mistura é principal');
    assert.strictEqual(await c.js("document.querySelector('.bancada-porque').open"), false, 'no celular, a explicação começa recolhida');
    assert.ok(await c.js(`JSON.parse(localStorage.getItem(Reino.config.chaveSave)).quimica.receitas.pof === 1`), 'gravado no aparelho');
    // o canvas tem desenho (não ficou em branco)
    assert.ok(await c.js(`(function () { var d = document.querySelector('.bancada-cena').getContext('2d').getImageData(0, 0, 160, 96).data;
      var cores = {}; for (var i = 0; i < d.length; i += 4) cores[d[i] + ',' + d[i + 1] + ',' + d[i + 2]] = 1; return Object.keys(cores).length > 20; })()`));

    // outra vez: nada de estrela
    await c.tocar('.bancada-outra');
    assert.strictEqual(await c.js(noBequer), 0, 'Outra mistura esvazia');
    assert.ok(await c.js(aVista('.bancada-prateleira')));
    await c.tocar('[data-tubo="bicarbonato"]');
    await c.tocar('[data-tubo="vinagre"]');
    await c.tocar('.bancada-misturar');
    assert.strictEqual(await estrelas(), antes + ganho, 'repetida não dá estrela');
    assert.ok(await c.js(aVista('.bancada-conhecida')), 'repetida: já está no caderno');

    // Esvaziar; béquer cheio não aceita o 4º tubo
    await c.tocar('.bancada-esvaziar');
    assert.strictEqual(await c.js(noBequer), 0);
    for (const t of ['agua', 'sal', 'leite', 'oleo']) await c.tocar(`[data-tubo="${t}"]`);
    assert.strictEqual(await c.js(noBequer), 3, 'cabem 3 (config.quimica.maxTubos)');
    assert.strictEqual(await c.js("document.querySelector('.bancada-fala').textContent"), await c.js("Reino.Quimica.frase('bancada.cheio').join(' ')"), 'frase do cheio');

    // um tubo só: "Quase!", sem estrela e sem erro
    await c.tocar('.bancada-esvaziar');
    await c.tocar('[data-tubo="vinagre"]');
    await c.tocar('.bancada-misturar');
    assert.strictEqual(await c.js("document.querySelector('.bancada-resultado .bancada-titulo').textContent"), 'Quase!');
    assert.ok(!(await c.js("document.querySelector('.bancada-resultado .bancada-acontece').textContent")).startsWith('Quase'), 'o texto não repete o título');
    assert.strictEqual(await estrelas(), antes + ganho);

    // arrastar o óleo até o béquer (toque de verdade)
    await c.tocar('.bancada-outra');
    const pos = await c.js(`(function () {
      var a = document.querySelector('[data-tubo="oleo"] canvas').getBoundingClientRect(), b = document.querySelector('.bancada-palco').getBoundingClientRect();
      return [Math.round(a.left + a.width / 2), Math.round(a.top + a.height / 2), Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)];
    })()`);
    await c.arrastar(pos.join(',') + ',400,toque');
    assert.strictEqual(await c.js(noBequer), 1, 'arrastar até o béquer despeja');
    assert.strictEqual(await c.js("document.querySelector('.bancada-mistura').textContent"), 'Óleo');
    assert.strictEqual(await c.js("document.querySelectorAll('.bancada-fantasma').length"), 0, 'o tubo que seguia o dedo sumiu');

    // teclado: Tab até o limão, Enter despeja; Esc fecha
    await c.tocar('.bancada-esvaziar');
    for (let i = 0; i < 20; i++) {
      await c.tecla('Tab');
      if (await c.js("document.activeElement && document.activeElement.dataset.tubo === 'limao'")) break;
    }
    assert.ok(await c.js("document.activeElement.dataset.tubo === 'limao'"), 'Tab chega nos tubos');
    await c.tecla('Enter');
    assert.strictEqual(await c.js(noBequer), 1, 'Enter despeja');
    await c.tecla('Escape');
    assert.strictEqual(await c.js('Reino.UI.temTela()'), false, 'Esc fecha');
    assert.deepStrictEqual(c.erros, [], 'sem erro de console');
  } finally { await c.fechar(); }
});


test('bancada: filtros preservam o béquer; novas descobertas, gases e caderno nos três tamanhos', async () => {
  for (const tamanho of ['celular', 'tablet', 'notebook']) {
    const c = await abrirCenario({ save: 'completo', tamanho, pasta: '/tmp/reino-testes/ver/teste-quimica-produtos-' + tamanho });
    try {
      await c.js('void Reino.UI.telaQuimicaBancada()'); await c.avancar(600);
      await c.tocar('.bancada-filtro[data-grupo="reagentes"]');
      if (tamanho === 'celular') {
        const pos = await c.js(`(function () {
          var r = document.querySelector('[data-tubo="cloreto-ferrico"] .bancada-tubo-nome').getBoundingClientRect();
          return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)];
        })()`);
        await c.arrastar([pos[0], pos[1], pos[0], pos[1] - 200, 500, 'toque'].join(','));
        assert.ok(await c.js("document.querySelector('.tela-quimica-bancada .painel-conteudo').scrollTop > 0"), 'rolar pelo rótulo');
        await c.tocar('[data-tubo="acucar"]');
        assert.ok((await c.js("document.querySelector('.bancada-mistura').textContent")).includes('Açúcar'));
        await c.tocar('.bancada-esvaziar');
      }
      await c.tocar('[data-tubo="cloreto-ferrico"]');
      await c.tocar('.bancada-filtro[data-grupo="gases"]');
      assert.strictEqual(await c.js(noBequer), 1, 'trocar grupo preserva o béquer');
      assert.ok(await c.js(aVista('[data-tubo="hidrogenio"]')));
      assert.strictEqual(await c.js("document.querySelector('.bancada-filtro[data-grupo=gases]').getAttribute('aria-pressed')"), 'true');
      await c.tocar('.bancada-filtro[data-grupo="reagentes"]');
      await c.tocar('[data-tubo="tiocianato-potassio"]');
      await c.tocar('.bancada-misturar');
      assert.strictEqual(await c.js("Reino.Quimica.descoberto('receitas', 'vermelho-ferrico')"), true);
      assert.strictEqual(await c.js("document.querySelector('.bancada-cena').dataset.efeito"), 'cor');
      await c.tocar('.bancada-outra');
      await c.tocar('.bancada-filtro[data-grupo="gases"]');
      await c.tocar('[data-tubo="hidrogenio"]');
      await c.tocar('[data-tubo="helio"]');
      await c.tocar('.bancada-misturar');
      assert.strictEqual(await c.js("document.querySelector('.bancada-cena').dataset.efeito"), 'gases');
      assert.strictEqual(await c.js(quadro), 'final');
      // O quadro final tem partículas, sem uma faixa de líquido (centro interno do béquer).
      assert.ok(await c.js(`(function () {
        var ctx = document.querySelector('.bancada-cena').getContext('2d'), d = ctx.getImageData(70, 50, 18, 26).data, vidro = 0;
        for (var i = 0; i < d.length; i += 4) if (d[i] === 238 && d[i + 1] === 249 && d[i + 2] === 255) vidro++;
        return vidro > 350;
      })()`));
      await c.tocar('.bancada-caderno'); await c.avancar(600);
      assert.ok((await c.js("document.querySelector('.qcad-titulo').textContent")).includes('Gases das estrelas'));
      await c.tocar('.qcad-voltar');
      assert.strictEqual(await c.js("document.querySelectorAll('.qcad-cartao').length"), 21);
      await c.tocar('[data-receita="gases-estrelas"]');
      assert.ok((await c.js("document.querySelector('.qcad-tubos').textContent")).includes('Hidrogênio'));
      assert.strictEqual(await c.js('document.documentElement.scrollWidth > innerWidth'), false);
      assert.deepStrictEqual(c.erros, []);
    } finally { await c.fechar(); }
  }
});


test('bancada: todas as novas receitas desenham, gravam e encerram sem animação', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-quimica-reacoes' });
  try {
    const receitas = await c.js('Reino.Quimica.receitas().slice(10)');
    for (const receita of receitas) {
      await c.js('void Reino.UI.telaQuimicaBancada(' + JSON.stringify({ tubos: receita.ingredientes }) + ')');
      await c.avancar(600);
      await c.tocar('.bancada-misturar');
      assert.strictEqual(await c.js(quadro), 'final', receita.id);
      assert.strictEqual(await c.js("document.querySelector('.bancada-cena').dataset.efeito"), receita.efeito, receita.id);
      assert.ok(await c.js('Reino.Quimica.descoberto("receitas", ' + JSON.stringify(receita.id) + ')'));
      if (['precipitado', 'deposito', 'efervescencia', 'gases'].includes(receita.efeito)) await c.foto(receita.id);
      await c.tecla('Escape');
    }
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
