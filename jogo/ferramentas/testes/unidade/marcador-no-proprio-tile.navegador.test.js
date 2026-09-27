// Marcador do toque (personagens/jogador.js, J.irPara): tocar no chão do próprio tile em que a Mariana está dá
// caminho vazio; sem aoChegar, a cruz rosa (J.marcador) ficava acesa embaixo dela até andar de novo (bug da auditoria
// motor-central). Servidor e banco de TESTE novos por cenário (cenario.js); save sintético; modo congelado.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'marcador-'));

test('clique no próprio tile não deixa o marcador do toque aceso', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo',
    pasta: pasta() });
  try {
    await c.js("Reino.Claude.limpar && Reino.Claude.limpar(); Jogador.posicionar(27, 28); 'ok'");
    await c.avancar(200);
    // ponto do chão no meio do tile dela (27,28), em px CSS
    const p = await c.js('__reino.paraTela(27 * 16 + 8, 28 * 16 + 8)');
    await c.page.mouse.click(p.x, p.y);
    await c.avancar(2000);
    const r = await c.js('({ marcador: Jogador.marcador, caminho: Jogador.caminho.length, tile: Jogador.tile() })');
    assert.deepStrictEqual(r.tile, { x: 27, y: 28 });
    assert.strictEqual(r.caminho, 0);
    assert.strictEqual(r.marcador, null, 'parada no destino, o marcador some (veio ' + JSON.stringify(r.marcador) + ')');
  } finally { await c.fechar(); }
});

// controle (passa hoje): clique num tile vizinho — ela chega e o marcador some
test('controle: clique no tile ao lado, ela chega e o marcador some', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo',
    pasta: pasta() });
  try {
    await c.js("Reino.Claude.limpar && Reino.Claude.limpar(); Jogador.posicionar(27, 28); 'ok'");
    await c.avancar(200);
    const p = await c.js('__reino.paraTela(28 * 16 + 8, 28 * 16 + 8)');
    await c.page.mouse.click(p.x, p.y);
    await c.avancar(2000);
    assert.deepStrictEqual(await c.js('Jogador.tile()'), { x: 28, y: 28 });
    assert.strictEqual(await c.js('Jogador.marcador'), null);
  } finally { await c.fechar(); }
});
