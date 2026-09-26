// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico ?debug=1&congelar=1):
// no desafio de ligar, a classe `treme` de um par errado sai dos DOIS botões (bug 3 de
// docs/decisoes/historico/bugs-da-refatoracao.md). Antes, o par era apagado aos 450 ms e o botão da direita, procurado
// pelo par já apagado aos 600 ms, ficava com `treme` para sempre (e não tremia de novo num erro novo).
// Monta um ligar sintético com Reino.Desafios.render, erra um par, anda o relógio 1 s e confere; erra de novo
// com o mesmo botão e confere que ele treme e depois para.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/ligar-treme.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const avancar = (page, ms) => page.evaluate((m) => window.__congelar.avancar(m), ms);
const esperarJogo = (page) => page.waitForFunction(() => window.__congelar && window.Reino && Reino.Desafios, null, { timeout: 30000 });

test('ligar: par errado para de tremer nos dois botões e treme de novo num erro novo', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  try {
    // 1ª aba só para gerar o save sintético com os ids do jogo carregado
    const a = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await esperarJogo(a.page);
    const save = (await a.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await a.context.close();

    const { page } = await abrir({ browser, url: servidor.url, save, query: '?debug=1&congelar=1' });
    await esperarJogo(page);
    await page.evaluate(() => {
      var d = { id: 'teste-ligar', tipo: 'ligar', pergunta: 'Ligue cada letra ao par dela.',
        pares: [[{ t: 'A' }, { t: 'a' }], [{ t: 'B' }, { t: 'b' }], [{ t: 'C' }, { t: 'c' }]], direita: [0, 1, 2] };
      var ctrl = Reino.Desafios.render(d, {});
      ctrl.card.id = 'teste-ligar';
      document.body.appendChild(ctrl.card);
      window.__ligar = ctrl;
      // botões com `treme`, pelo lado e pela posição: E0 = A (esquerda), D1 = b (direita)
      window.__tremem = function () {
        return Array.from(document.querySelectorAll('#teste-ligar .ligar-item')).filter(function (b) { return b.classList.contains('treme'); })
          .map(function (b) { var lado = b.classList.contains('ligar-esq') ? 'E' : 'D'; return lado + Array.from(b.parentNode.children).indexOf(b); }).sort();
      };
    });
    // erra: com o A escolhido (1º da esquerda, já vem escolhido), toca no "b"; confere e marca o erro
    const errar = () => page.evaluate(() => {
      var dir = document.querySelectorAll('#teste-ligar .ligar-dir');
      dir[1].click();
      var res = window.__ligar.conferir();
      window.__ligar.marcarErro(res);
      return { erradas: res.erradas, tremem: window.__tremem() };
    });
    const tremendo = () => page.evaluate(() => window.__tremem());

    const e1 = await errar();
    assert.deepStrictEqual(e1.erradas, [0]);
    assert.deepStrictEqual(e1.tremem, ['D1', 'E0'], 'os dois botões do par errado tremem');
    await avancar(page, 1000);
    assert.deepStrictEqual(await tremendo(), [], 'depois de 1 s nenhum botão fica com `treme`');

    const e2 = await errar();
    assert.deepStrictEqual(e2.tremem, ['D1', 'E0'], 'o mesmo botão treme de novo no erro novo');
    await avancar(page, 1000);
    assert.deepStrictEqual(await tremendo(), [], 'e para de tremer de novo');
    assert.deepStrictEqual(page.__erros, []);
  } finally {
    await browser.close();
    servidor.parar();
  }
});
