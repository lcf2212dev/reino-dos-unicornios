// A câmera descobre y < 0 para acomodar o HUD: bosque e copas precisam continuar acima do mapa.
// Só servidor de teste e saves sintéticos. Os pixels são lidos antes do véu de luz do motor.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { abrirCenario } = require('../cenario');

async function acomodar(c) {
  for (let i = 0; i < 12; i++) await c.avancar(100);
}

async function medirTopo(c) {
  return c.page.evaluate(() => {
    const v = Reino._motor, h = Math.max(0, -Math.floor(v.cam.y));
    if (!h) return { y: v.cam.y, altura: h, cores: 0, transparente: 0 };
    const px = v.bctx.getImageData(0, 0, v.buffer.width, h).data, cores = new Set();
    let transparente = 0;
    for (let i = 0; i < px.length; i += 4) {
      cores.add(px[i] + ',' + px[i + 1] + ',' + px[i + 2]);
      if (px[i + 3] !== 255) transparente++;
    }
    return { y: v.cam.y, altura: h, cores: cores.size, transparente };
  });
}

for (const tamanho of ['celular', 'tablet', 'notebook']) {
  test(`mapa: topo e cantos têm bosque, com HUD normal e letras grandes (${tamanho})`, async () => {
    const c = await abrirCenario({ tamanho, save: 'completo' });
    try {
      for (const grande of [false, true]) {
        await c.page.evaluate((g) => {
          document.documentElement.classList.toggle('letras-grandes', g);
          Reino.UI.medirAreaUtil();
        }, grande);
        for (const [x, y] of [[15, 3], [0, 3], [55, 3], [15, 5], [15, 6]]) {
          await c.page.evaluate(([x, y]) => Jogador.posicionar(x, y), [x, y]);
          await acomodar(c);
          const m = await medirTopo(c);
          if (y === 6) assert.equal(Math.abs(m.y), 0, 'ao sair das seis primeiras fileiras, a margem recolhe');
          else {
            assert.ok(m.altura > 20, 'câmera expõe a região acima do mapa');
            assert.ok(m.cores > 3, 'a faixa superior contém bosque, não só a cor de fundo');
            assert.equal(m.transparente, 0, 'nenhum buraco no cenário');
          }
        }
      }
      assert.deepEqual(c.erros, []);
    } finally { await c.fechar(); }
  });
}

test('mapa: copas completas, bosque estável ao crescer o buffer e estático com a mesma origem', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo' });
  try {
    const r = await c.page.evaluate(() => {
      const I = Mapa._interno, w = Mapa.largura(), topo = 96;
      function desenhar(h) {
        const cv = PA.novoCanvas(w, h), ctx = cv.getContext('2d');
        ctx.translate(0, topo);
        Mapa.desenharAnimado(ctx, 0, { semAnimacao: true });
        return ctx;
      }
      function iguais(a, b) { return a.length === b.length && a.every((v, i) => v === b[i]); }
      const pequeno = desenhar(topo + 16), antes = pequeno.getImageData(0, 0, w, topo).data;
      const grande = desenhar(640), depois = grande.getImageData(0, 0, w, topo).data;
      const esperado = PA.novoCanvas(w, topo), ec = esperado.getContext('2d');
      ec.translate(0, topo);
      I.altas.forEach((a) => { if (a.y < 0) ec.drawImage(a.frente, a.x, a.y); });
      const copas = ec.getImageData(0, 0, w, topo).data;
      let pixelsCopa = 0, cortes = 0;
      for (let i = 0; i < copas.length; i += 4) if (copas[i + 3] === 255) {
        pixelsCopa++;
        if (copas[i] !== depois[i] || copas[i + 1] !== depois[i + 1] || copas[i + 2] !== depois[i + 2]) cortes++;
      }
      const origem = iguais(grande.getImageData(0, topo, w, 16).data, I.estatico.getContext('2d').getImageData(0, 0, w, 16).data);
      const estavel = iguais(antes, depois);
      Mapa.prerender();
      const recriado = iguais(depois, desenhar(640).getImageData(0, 0, w, topo).data);
      return { estavel, recriado, origem, pixelsCopa, cortes, alturaEstatica: I.estatico.height };
    });
    assert.ok(r.estavel, 'o bosque não muda ao aumentar o buffer');
    assert.ok(r.recriado, 'recriar o mapa mantém o desenho determinístico');
    assert.ok(r.origem, 'y = 0 continua na origem do estático');
    assert.equal(r.alturaEstatica, (42 + 4) * 16, 'o cache do lago continua com as mesmas coordenadas');
    assert.ok(r.pixelsCopa > 100, 'há copas atravessando a borda');
    assert.equal(r.cortes, 0, 'todos os pixels opacos das copas aparecem acima de y = 0');
    assert.deepEqual(c.erros, []);
  } finally { await c.fechar(); }
});
