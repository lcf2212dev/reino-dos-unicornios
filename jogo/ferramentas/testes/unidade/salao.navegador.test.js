// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico): o Salão de Beleza.
// A tela de cortes abre, o toque numa opção troca a prévia, o Pronto grava aparencia.corte e o corte continua
// depois de recarregar; a tela das roupas funciona pelo teclado (Tab, Enter e Esc) e grava aparencia.modelo.
// O desenho padrão (sem os campos) sai pixel a pixel igual ao de 'solto' + 'vestido'. Zero erro de console.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/salao.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const ap = () => 'JSON.parse(JSON.stringify(Reino.Progresso.estado().aparencia))';

test('salão: escolher corte e roupa, gravar, recarregar; teclado; desenho padrão igual', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-salao' });
  try {
    const antes = await c.js(ap());
    assert.strictEqual(antes.corte, undefined, 'save sintético sem corte');
    // o desenho padrão não muda com os campos explícitos de hoje
    const igual = await c.js(`(function () {
      var a = Reino.Progresso.estado().aparencia, b = Object.assign({}, a, { corte: 'solto', modelo: 'vestido' });
      function px(s) { return Array.from(s.canvas.getContext('2d').getImageData(0, 0, s.w, s.h).data).join(); }
      return ['frente', 'lado', 'costas', 'diagFrente', 'diagCostas'].every(function (v) {
        return px(PA.mariana(a, false, 1, { vista: v })) === px(PA.mariana(b, false, 1, { vista: v })) &&
          px(PA.mariana(a, true, 0, { vista: v })) === px(PA.mariana(b, true, 0, { vista: v }));
      });
    })()`);
    assert.ok(igual, 'padrão pixel a pixel igual');

    // cortes pelo toque
    await c.js("void Reino.UI.telaSalao('cabelo')");
    await c.avancar(600);
    assert.strictEqual(await c.js("document.querySelectorAll('.tela-salao .salao-opcao').length"), 8);
    await c.tocar('Coque');
    assert.strictEqual(await c.js("document.querySelector('.salao-opcao[aria-pressed=true]').textContent"), 'Coque');
    await c.tocar('Pronto!');
    assert.strictEqual(await c.js('Reino.UI.temTela()'), false);
    assert.strictEqual((await c.js(ap())).corte, 'coque');
    assert.strictEqual(await c.js(`JSON.parse(localStorage.getItem(Reino.config.chaveSave)).aparencia.corte`), 'coque', 'gravado no aparelho');

    // roupas pelo teclado: Tab até a 2ª opção (Macacão), Enter, Esc fecha e grava
    await c.js("void Reino.UI.telaSalao('roupa')");
    await c.avancar(600);
    for (let i = 0; i < 12; i++) {
      await c.tecla('Tab');
      if (await c.js("document.activeElement && document.activeElement.textContent === 'Macacão'")) break;
    }
    assert.ok(await c.js("document.activeElement.textContent === 'Macacão'"), 'Tab chega nas opções');
    await c.tecla('Enter');
    assert.strictEqual((await c.js(ap())).modelo, 'macacao');
    await c.tecla('Escape');
    assert.strictEqual(await c.js('Reino.UI.temTela()'), false, 'Esc fecha');
    assert.strictEqual(await c.js(`JSON.parse(localStorage.getItem(Reino.config.chaveSave)).aparencia.modelo`), 'macacao');

    // recarregar: continua
    await c.page.reload();
    await c.page.waitForFunction(() => window.Reino && Reino.Progresso && Reino.Progresso.estado(), null, { timeout: 30000 });
    await c.avancar(2000);
    const depois = await c.js(ap());
    assert.strictEqual(depois.corte, 'coque'); assert.strictEqual(depois.modelo, 'macacao');
    assert.strictEqual(depois.roupa, antes.roupa, 'cores iguais');
    assert.deepStrictEqual(c.erros, [], 'sem erro de console');
  } finally { await c.fechar(); }
});
