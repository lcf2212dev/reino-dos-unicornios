// Álbum de fotos (ui/hud-fotos.js, sistemas/fotos-telas.js): dois toques antes de o banco (IndexedDB) abrir
// não abrem dois álbuns um em cima do outro. O botão confere UI.temTela(), mas o painel só nasce depois que
// o banco abre; num tablet lento (1ª abertura da sessão) o 2º toque passava (auditoria de bugs, fx2-telas).
// Aqui o banco só abre quando o teste manda (o onsuccess do indexedDB.open fica preso) e o jogo corre vivo.
// Servidor e banco de TESTE novos por cenário (cenario.js); saves 100% sintéticos.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

// o indexedDB.open de sempre, mas o onsuccess só chega quando o teste chama __soltarBanco() (o banco de um
// aparelho lento, sem depender do tempo: sob carga, um atraso fixo acabava antes do 2º toque)
const BANCO_LENTO = `(function () {
  var abrir = IDBFactory.prototype.open, fila = [], solto = false;
  window.__soltarBanco = function () { solto = true; fila.splice(0).forEach(function (f) { f(); }); };
  IDBFactory.prototype.open = function () {
    var pedido = abrir.apply(this, arguments), fn = null;
    Object.defineProperty(pedido, 'onsuccess', { configurable: true, get: function () { return fn; }, set: function (f) { fn = f; } });
    pedido.addEventListener('success', function (ev) {
      var chegar = function () { if (fn) fn.call(pedido, ev); };
      if (solto) chegar(); else fila.push(chegar);
    });
    return pedido;
  };
})()`;
const ALBUNS = "document.querySelectorAll('.tela-fotos-album').length";
// um toque curto de verdade (toque pelo CDP, como o cenario-ponteiro.js), sem a espera que o c.segurar faz depois
async function tocar(c, sel) {
  const r = await c.js(`(function () { var b = document.querySelector('${sel}').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`);
  const cdp = c.__cdp || (c.__cdp = await c.context.newCDPSession(c.page));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, id: 1 }] });
  await c.page.waitForTimeout(40);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function comBancoLento(fn) {
  const c = await abrirCenario({ tamanho: 'tablet', save: 'completo', congelar: false });
  try {
    // vivo, a tela de início espera o "Entrar no Reino"
    await c.js("(function () { var b = document.querySelector('.tela-inicio .btn-comecar'); if (b) b.click(); })()");
    // depois da abertura, o login com a senha da Mariana (o save sintético é dela; save-e-mescla.md §12)
    await c.page.waitForSelector('#jogador-entrar-senha', { timeout: 20000 });
    await c.page.fill('#jogador-entrar-login', 'mariana');
    await c.page.fill('#jogador-entrar-senha', 'unicorlice77');
    await c.page.press('#jogador-entrar-senha', 'Enter');
    await c.page.waitForFunction(() => window.__reino.estado() === 'mapa' && !document.querySelector('#hud').hidden && !Reino.UI.temTela(), null, { timeout: 20000 });
    await c.avancar(1000);
    await c.js(BANCO_LENTO);
    await fn(c);
    await c.avancar(300);
    assert.strictEqual(await c.js(ALBUNS), 0, 'o banco ainda não abriu');
    await c.js('window.__soltarBanco()');
    await c.avancar(1200);
    assert.strictEqual(await c.js(ALBUNS), 1, 'um álbum só');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
}

test('dois toques no botão do álbum (150 ms) com o banco ainda abrindo: um álbum só', async () => {
  await comBancoLento(async (c) => {
    await tocar(c, '#hud .btn-album');
    await c.page.waitForTimeout(110);   // 150 ms de um toque ao outro
    await tocar(c, '#hud .btn-album');
  });
});

test('segurar o 📷 e logo depois tocar no álbum, com o banco ainda abrindo: um álbum só', async () => {
  await comBancoLento(async (c) => {
    await c.segurar('#hud .btn-foto,' + ((await c.js('Reino.config.fotos.toqueLongoMs')) + 60));
    await tocar(c, '#hud .btn-album');
  });
});
