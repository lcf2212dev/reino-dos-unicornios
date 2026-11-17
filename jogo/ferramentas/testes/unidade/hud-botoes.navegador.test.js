// Botões do HUD por registro (ui/hud.js): um botão falso registrado aparece depois do álbum e é repintado no evento
// (só os à vista: o da casa, ui/casa-decorar.js, fica escondido fora dela).
// Servidor e banco de TESTE novos (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

test('botão registrado entra depois do álbum e repinta no evento', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: '/tmp/reino-testes/ver/teste-hud-botoes' });
  try {
    await c.js(`window.__pintou = 0;
      Reino.UI.registrarBotaoHud({ id: 'falso', ordem: 30, eventos: ['teste-hud'],
        criar: function () { return Reino.util.el('button.btn-tela-cheia.btn-falso', { type: 'button' }); },
        pintar: function () { window.__pintou++; } });
      Reino.UI.montarHUD();`);
    const ordem = await c.js("[].map.call(document.querySelectorAll('#hud .hud-botoes > button:not([hidden])'), function (b) { return b.className; })");
    assert.deepStrictEqual(ordem.map((k) => k.split(' ')[1] || k), ['btn-tela-cheia', 'btn-juntos', 'btn-foto', 'btn-album', 'btn-ajustes', 'btn-falso']);
    const antes = await c.js('window.__pintou');
    assert.ok(antes >= 1, 'pinta na montagem');
    await c.js("Reino.util.emit('teste-hud')");
    assert.ok(await c.js('window.__pintou') > antes, 'repinta no evento');
  } finally { await c.fechar(); }
});
