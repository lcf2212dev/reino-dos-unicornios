// Enter/Espaço com o foco num botão (motor/entrada.js): são do botão, não do motor. Com a Mariana ao lado do Claude
// (ou de um NPC/porta), o keydown do window agia no alvo perto dela (agirNoAlvo + preventDefault) e o botão focado
// do HUD, um chip ou o "Ok! 👍" do balão não funcionava (bug da auditoria motor-central). Com o foco no corpo da página,
// o Enter continua falando com o Claude (pré-condição do último caso).
// Servidor e banco de TESTE novos por cenário (cenario.js); save sintético; modo congelado.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'entrada-'));

for (const tecla of ['Enter', ' ']) {
  test(`${tecla === ' ' ? 'Espaço' : tecla} no botão Ajustes do HUD, ao lado do Claude, abre o painel Ajustes`, async () => {
    const c = await abrirCenario({ tamanho: 'notebook', save: 'completo',
      pasta: pasta() });
    try {
      // fecha qualquer balão e põe a Mariana ao lado do Claude (30,23), parada
      await c.js("Reino.Claude.limpar && Reino.Claude.limpar(); Jogador.posicionar(31, 23); Jogador.virar(-1, 0); 'ok'");
      await c.avancar(200);
      const antes = await c.js("({ estado: __reino.estado(), perto: !!Reino.Cena.atual().alvoPerto(Jogador.tile(), {}) })");
      assert.strictEqual(antes.estado, 'mapa');
      assert.ok(antes.perto, 'pré-condição: o Claude está ao lado dela');
      // Tab até o botão (aqui: foco direto, como o Tab deixaria)
      await c.js("document.querySelector('#hud .btn-ajustes').focus(); document.activeElement.getAttribute('aria-label')");
      await c.page.keyboard.press(tecla);
      await c.avancar(300);
      const depois = await c.js("({ tela: Reino.UI.temTela(), ajustes: !!document.querySelector('.tela-ajustes'), estado: __reino.estado(), balao: !!document.querySelector('#claude-balao:not([hidden])') })");
      assert.ok(depois.tela && depois.ajustes, `o botão focado abre a tela Ajustes (veio: ${JSON.stringify(depois)})`);
      assert.ok(!depois.balao, 'o Claude não fala por causa do Enter no botão do HUD');
    } finally { await c.fechar(); }
  });
}

// controle (passa hoje): longe de qualquer alvo, o mesmo Enter abre o painel Ajustes
test('controle: Enter no botão Ajustes, longe de tudo, abre o painel Ajustes', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo',
    pasta: pasta() });
  try {
    await c.js("Reino.Claude.limpar && Reino.Claude.limpar(); Jogador.posicionar(27, 28); 'ok'");
    await c.avancar(200);
    assert.ok(!(await c.js('!!Reino.Cena.atual().alvoPerto(Jogador.tile(), {})')));
    await c.js("document.querySelector('#hud .btn-ajustes').focus(); 1");
    await c.page.keyboard.press('Enter');
    await c.avancar(300);
    assert.ok(await c.js('Reino.UI.temTela()'), 'longe de alvos o botão funciona');
  } finally { await c.fechar(); }
});

// o mesmo defeito no balão do Claude (não modal): Enter no "Ok! 👍" focado, ao lado do Claude, não fecha o balão
test('Enter no Ok do balão do Claude (focado), ao lado dele, fecha o balão', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo',
    pasta: pasta() });
  try {
    await c.js("Reino.Claude.limpar && Reino.Claude.limpar(); Jogador.posicionar(31, 23); Jogador.virar(-1, 0); 'ok'");
    await c.avancar(200);
    // foco no corpo da página: o Enter continua do motor e fala com o Claude (balão com "Ok! 👍")
    assert.ok(await c.js('!document.activeElement || document.activeElement === document.body'), 'pré-condição: foco no corpo');
    await c.page.keyboard.press('Enter');
    await c.avancar(500);
    assert.ok(await c.js("!!document.querySelector('#claude-balao:not([hidden])')"), 'pré-condição: balão aberto');
    await c.js("document.querySelector('#claude-balao .btn-ok-claude').focus(); 1");
    await c.page.keyboard.press('Enter');
    await c.avancar(500);
    assert.ok(!(await c.js("!!document.querySelector('#claude-balao:not([hidden])')")), 'o Enter no Ok focado fecha o balão');
  } finally { await c.fechar(); }
});
