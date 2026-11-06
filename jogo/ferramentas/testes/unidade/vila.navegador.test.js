// Vila Arco-Íris por dentro (docs/contratos/vila.md §2): pisar no portal do Bosque (53, 22), colado na borda direita, leva à Vila (chega em
// (20, 28)); a porta da Forja (15, 8) leva à loja (chega em (8, 9)) e a saída (8, 10) traz de volta para a frente da
// porta (15, 9); o portal (20, 29) volta ao Bosque, à esquerda do portal (52, 22). E os dados: os 4 lojistas com a
// ação vilaLoja da loja deles, 3 terrenos cercados com a placa "Terreno livre" e 1 Teleportadora (a da praça) levando à cidade.
// Anda de verdade (tecla de seta), no jogo congelado; servidor e banco de TESTE novos (cenario.js).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'vila-'));

const ONDE = `(() => { const c = Reino.Cena.atual(), t = Jogador.tile(); return { cena: c && c.id, x: t.x, y: t.y }; })()`;

test('vila: portal do Bosque, Vila, porta da loja e volta; lojistas, terrenos e Teleportadoras', { timeout: 240000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', pasta: pasta() });
  // põe ela em (x, y) e anda para `k` ('cima'/'baixo'/'dir') até a cena trocar (a íris e a chegada inclusas)
  async function pisar(x, y, k) {
    await c.js(`Reino.UI.fecharTodas && Reino.UI.fecharTodas(); Jogador.posicionar(${x}, ${y}); Reino._motor.teclas = { ${k}: true }; 1`);
    const antes = (await c.js(ONDE)).cena;
    for (let i = 0; i < 40 && (await c.js(ONDE)).cena === antes; i++) await c.avancar(100);
    await c.js('Reino._motor.teclas = {}; 1');
    await c.avancar(2500);
    return c.js(ONDE);
  }
  try {
    const d = await c.js(`(() => {
      const I = Reino.Interiores, v = I.def('vila'), b = I.def('bosque');
      return {
        bosque: b.escadas.filter((e) => e.para === 'vila').map((e) => [e.x, e.y, e.sentido]),
        portal: b.objetos.filter((o) => o.tipo === 'bosque-portal-vila').map((o) => [o.x, o.y]),
        vila: [v.lugar, v.entrada, v.pacote, v.fundo, v.tamanho.w, v.tamanho.h, v.spawn.x, v.spawn.y],
        portas: v.escadas.map((e) => [e.x, e.y, e.para]),
        terrenos: v.objetos.filter((o) => o.tipo === 'vila-terreno').length,
        placas: v.objetos.filter((o) => o.tipo === 'vila-placa-terreno' && o.nome === 'Terreno livre' && o.fala.length).length,
        teles: v.objetos.filter((o) => o.tipo === 'vila-teleportadora' && o.acao && o.acao.tipo === 'teleportadora' && o.acao.para === 'cidade').length,
        lojistas: ['casa', 'armas', 'cabecas', 'armaduras'].map((l) => {
          const dl = I.def('vila-' + l), n = (dl.npcs || [])[0];
          return [dl.lugar, dl.pacote, n && n.id, n && n.nome, n && n.acao.tipo, n && n.acao.loja, n && (n.falas.oi || []).length > 0];
        }),
      };
    })()`);
    assert.deepStrictEqual(d.bosque, [[53, 22, 'portal']]);
    assert.deepStrictEqual(d.portal, [[53, 20]]);
    assert.deepStrictEqual(d.vila, ['bosque', false, 'interior-bosque', 'vila', 40, 32, 20, 28]);
    assert.deepStrictEqual(d.portas, [[6, 8, 'vila-casa'], [15, 8, 'vila-armas'], [24, 8, 'vila-cabecas'], [33, 8, 'vila-armaduras'], [20, 29, 'bosque']]);
    assert.strictEqual(d.terrenos, 3);
    assert.strictEqual(d.placas, 3);
    assert.strictEqual(d.teles, 1);
    assert.deepStrictEqual(d.lojistas, [
      ['bosque', 'interior-bosque', 'lavanda', 'Dona Lavanda', 'vilaLoja', 'casa', true],
      ['bosque', 'interior-bosque', 'bigorna', 'Seu Bigorna', 'vilaLoja', 'armas', true],
      ['bosque', 'interior-bosque', 'plumita', 'Madame Plumita', 'vilaLoja', 'cabecas', true],
      ['bosque', 'interior-bosque', 'ferrolho', 'Capitão Ferrolho', 'vilaLoja', 'armaduras', true],
    ]);

    await c.ir('bosque');
    assert.deepStrictEqual(await pisar(52, 22, 'dir'), { cena: 'vila', x: 20, y: 28 }, 'o portal do Bosque leva à Vila');
    assert.deepStrictEqual(await pisar(15, 9, 'cima'), { cena: 'vila-armas', x: 8, y: 9 }, 'a porta da Forja leva à loja');
    assert.deepStrictEqual(await pisar(8, 9, 'baixo'), { cena: 'vila', x: 15, y: 9 }, 'a saída da loja volta para a frente da porta');
    assert.deepStrictEqual(await pisar(20, 28, 'baixo'), { cena: 'bosque', x: 52, y: 22 }, 'o portal da Vila volta ao Bosque');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
