// O avancar do e2e (referencias-pagina.js) espera os pacotes de voz terminarem, com teto. Regressão de 2026-09-27:
// com o buffer do Resource Timing cheio, o pacote que chegava "sumia" e o avancar girava sem fim, abrindo um
// MessageChannel por volta, até o Chromium passar de 10 GB. Agora a espera olha window.__scriptsProntos (navegador.js).
process.env.REINO_ESPERA_VOZ_MS = '1500'; // teto curto aqui (antes de carregar referencias-pagina.js)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const PEDIR = (nome) => `(function () { var s = document.createElement('script'); s.src = 'js/voz/${nome}.js'; document.head.appendChild(s); })()`;

async function comCenario(fn) {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular' });
  try { await fn(c); } finally { await c.fechar(); }
}

test('pacote de voz carregado com o buffer do Resource Timing cheio não trava o avancar', async () => {
  await comCenario(async (c) => {
    await c.page.route('**/js/voz/teste-buffer.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.__vozTeste = 1;' }));
    // buffer "cheio": nenhuma entrada nova entra nele (o que acontecia depois de 250 recursos)
    await c.js('performance.clearResourceTimings(); performance.setResourceTimingBufferSize(0); ' + PEDIR('teste-buffer'));
    const t0 = Date.now();
    await c.avancar(500);
    assert.strictEqual(await c.js('window.__vozTeste'), 1);
    assert.ok(Date.now() - t0 < 1500, `avancar levou ${Date.now() - t0} ms`);
  });
});

test('pacote de voz que nunca termina vira erro em segundos, com o nome dele', async () => {
  await comCenario(async (c) => {
    // segura a requisição (sem resposta) até o fim do teste; solta antes de fechar, senão o fechar espera por ela
    let presa = null;
    await c.page.route('**/js/voz/nunca-chega.js', (r) => { presa = r; });
    await c.js(PEDIR('nunca-chega'));
    const t0 = Date.now();
    try {
      await assert.rejects(c.avancar(500), /nunca-chega\.js/);
      assert.ok(Date.now() - t0 < 10000, `o erro levou ${Date.now() - t0} ms`);
    } finally { if (presa) await presa.abort().catch(() => {}); }
  });
});

test('pacote de voz que falha (404) não trava o avancar', async () => {
  await comCenario(async (c) => {
    await c.page.route('**/js/voz/nao-existe.js', (r) => r.fulfill({ status: 404, body: '' }));
    await c.js(PEDIR('nao-existe'));
    await c.avancar(500);
  });
});
