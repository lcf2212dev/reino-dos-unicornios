// Saída de tela (ui/base.js, UI.fecharTela; docs/contratos/ui.md §2 item 7 e arte.md §15.8): com animação, a tela sai
// da pilha na hora e espera --rapido em #telas-saindo (sem toque nem foco); sem animação, some na hora.
// Servidor e banco de TESTE novos por cenário (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'tela-saida-'));
const ESTADO = `(function () { var t = window.__t; return { naPilha: !!t.closest('#telas'), noDom: t.isConnected,
  saindo: !!t.closest('#telas-saindo'), comTela: document.body.classList.contains('com-tela'), vivas: document.querySelectorAll('#telas > .tela').length }; })()`;
const TRANSICAO = `(function () { return ['.btn-grande', '.interruptor-bola'].map(function (s) {
  var b = document.querySelector(s) || document.body.appendChild(Reino.util.el('button' + s));
  return getComputedStyle(b, s === '.interruptor-bola' ? '::after' : null).transitionDuration; }); })()`;

test('com animação: a loja sai da pilha na hora e some do DOM depois de --rapido', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: pasta(), congelar: false, entrarDireto: true });
  try {
    // o save sintético vem com Animações desligado: liga só nesta aba
    await c.js(`Reino.Progresso.estado().ajustes.animacoes = true; document.body.classList.remove('sem-animacao'); 'ok'`);
    assert.strictEqual(await c.js('Reino.util.animar()'), true, 'pré-condição: animações ligadas');
    const r = await c.js(`new Promise(function (ok) {
      var ev = []; Reino.util.on(Reino.EVENTOS.TELAS, function (n) { ev.push(n); });
      window.__t = Reino.UI.painel('loja', 'Loja').tela; Reino.UI.fecharTela(window.__t);
      var agora = ${ESTADO}; agora.ev = ev.slice();
      var s = document.getElementById('telas-saindo');
      agora.bloqueada = !!(s && s.inert && s.getAttribute('aria-hidden') === 'true' && s.style.pointerEvents === 'none');
      agora.classe = window.__t.classList.contains('saindo');
      // reabrir a mesma tela durante a saída: a nova vive na pilha, a velha segue saindo
      var nova = Reino.UI.painel('loja', 'Loja').tela; agora.reaberta = nova.parentNode.id;
      setTimeout(function () { var a50 = ${ESTADO}; Reino.UI.fecharTodas();
        setTimeout(function () { ok({ agora: agora, a50: a50, a200: ${ESTADO}, nova: nova.isConnected, ev: ev }); }, 150); }, 50);
    })`);
    assert.deepStrictEqual(r.agora.ev, [1, 0], 'EV.TELAS na hora');
    assert.strictEqual(r.agora.comTela, false, 'com-tela sai na hora');
    assert.ok(!r.agora.naPilha && r.agora.saindo && r.agora.noDom && r.agora.classe, 'na hora: em #telas-saindo, .saindo');
    assert.ok(r.agora.bloqueada, '#telas-saindo inert, aria-hidden e sem pointer-events');
    assert.strictEqual(r.agora.reaberta, 'telas', 'reaberta vai para a pilha');
    assert.ok(!r.a50.naPilha && r.a50.noDom && r.a50.vivas === 1, 'aos 50 ms: ainda no DOM, fora de #telas');
    assert.ok(!r.a200.noDom && r.a200.vivas === 0 && !r.nova, 'aos 200 ms: fora do DOM; fecharTodas tirou a nova');
  } finally { await c.fechar(); }
});

for (const modo of ['reduzir movimento', 'Ajustes → Animações desligado']) {
  test(`sem animação (${modo}): a loja some do DOM na hora`, async () => {
    const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: pasta(), congelar: modo.startsWith('reduzir'), entrarDireto: true });
    try {
      if (!modo.startsWith('reduzir')) await c.js(`Reino.Progresso.estado().ajustes.animacoes = false; document.body.classList.add('sem-animacao'); 'ok'`);
      assert.strictEqual(await c.js('Reino.util.animar()'), false, 'pré-condição: sem animação');
      const r = await c.js(`window.__t = Reino.UI.painel('loja', 'Loja').tela; Reino.UI.fecharTela(window.__t); ${ESTADO}`);
      assert.ok(!r.noDom && r.vivas === 0 && !r.comTela, 'fora do DOM na hora');
      // CSS da frente css (.btn-grande sem transition; .interruptor-bola::after com saída em sem-animacao/reduce)
      const d = await c.js(TRANSICAO);
      assert.deepStrictEqual(d.map(parseFloat), [0, 0], '.btn-grande e .interruptor-bola sem transition: ' + d);
    } finally { await c.fechar(); }
  });
}
