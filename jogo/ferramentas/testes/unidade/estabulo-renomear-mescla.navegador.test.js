// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, ?debug=1&congelar=1):
// "✏️ Mudar o nome" no Estábulo grava no objeto `u` guardado quando o detalhe abriu (ui/estabulo.js, detalheUni:
// `var u = est().unis[d.id]` … `u.nome = nome; P.salvar()`). Se, com o detalhe ou a caixa do nome abertos, outra aba
// (ou a nuvem) grava e a mescla TROCA o objeto do estado (save-e-mescla.md §8.2), o nome vai para o objeto velho
// e o P.salvar grava o estado novo sem ele: o nome que ela digitou some.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/estabulo-renomear-mescla.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const esperarJogo = (page) => page.waitForFunction(() => window.__congelar && window.Reino && Reino.UI && Reino.UI.telaEstabulo && Reino.Progresso.estado(), null, { timeout: 30000 });

test('estábulo: o nome novo não some quando outra aba grava com a caixa do nome aberta', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  try {
    const a = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await esperarJogo(a.page);
    const save = (await a.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await a.context.close();

    const { page } = await abrir({ browser, url: servidor.url, save, query: '?debug=1&congelar=1' });
    await esperarJogo(page);
    const id = await page.evaluate(() => Reino.Progresso.montaria());
    // Estábulo → carta da montaria → "✏️ Mudar o nome"
    await page.evaluate(() => Reino.UI.telaEstabulo());
    await page.locator('.carta-uni.montado').click();
    await page.locator('button', { hasText: 'Mudar o nome' }).click();
    await page.locator('#campo-nome').waitFor();
    // outra aba do mesmo aparelho ganha 1 estrela e grava: o navegador avisa esta aba (evento storage)
    await page.evaluate(() => {
      var k = Reino.config.chaveSave, s = JSON.parse(localStorage.getItem(k));
      s.estrelas.ganhas += 1; s.atualizado = Date.now() - 1000;   // gravação um pouco mais velha que a que ela vai fazer
      var v = JSON.stringify(s);
      localStorage.setItem(k, v);
      window.dispatchEvent(new StorageEvent('storage', { key: k, newValue: v }));
    });
    await page.locator('#campo-nome').fill('Pipoca');
    await page.locator('button', { hasText: 'Pronto!' }).click();
    const r = await page.evaluate((uid) => ({
      memoria: Reino.Progresso.estado().unis[uid].nome,
      gravado: JSON.parse(localStorage.getItem(Reino.config.chaveSave)).unis[uid].nome,
      estrelaDaOutraAba: Reino.Progresso.estado().estrelas.ganhas,
    }), id);
    assert.strictEqual(r.memoria, 'Pipoca', 'o nome novo está no estado do jogo');
    assert.strictEqual(r.gravado, 'Pipoca', 'e foi gravado no aparelho');
  } finally {
    await browser.close();
    servidor.parar();
  }
});
