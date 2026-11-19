// Entrar nos lugares famosos (pedido de 19/11; docs/contratos/casa.md §2): na Vila dos Lugares Famosos, a porta na
// frente de cada lote (escada `portal` com `aberta`) só leva para dentro do lugar ('casa-lugar-<nome>') depois de
// comprado; sem comprar, ela passa pela porta e nada acontece, e o toque no lote só mostra onde comprar. Comprado: a
// porta e o toque no lugar levam para dentro, e a saída de lá volta para a frente do lote. Os 12 interiores existem.
// Anda de verdade (tecla de seta), no jogo congelado; servidor e banco de TESTE novos (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'lugares-dentro-'));
const ONDE = `(() => { const c = Reino.Cena.atual(), t = Jogador.tile(); return { cena: c && c.id, x: t.x, y: t.y }; })()`;

test('lugares famosos: comprado entra pela porta do lote e volta para a frente dele; sem comprar, não entra', { timeout: 240000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', pasta: pasta() });
  // de pé no tile (x, y), anda na direção k por até `max` passos de 100 ms ou até mudar de cena
  async function pisar(x, y, k, max = 40) {
    await c.js(`Reino.UI.fecharTodas && Reino.UI.fecharTodas(); Jogador.posicionar(${x}, ${y}); Reino._motor.teclas = { ${k}: true }; 1`);
    const antes = (await c.js(ONDE)).cena;
    for (let i = 0; i < max && (await c.js(ONDE)).cena === antes; i++) await c.avancar(100);
    await c.js('Reino._motor.teclas = {}; 1');
    await c.avancar(2500);
    return c.js(ONDE);
  }
  try {
    // os 12 interiores, um por lugar, cada um com a saída pareada com a porta do lote dele
    const d = await c.js(`(() => { const I = Reino.Interiores, v = I.def('casa-lugares');
      return Reino.moveisCasa.filter((m) => m.loja === 'lugares').map((m) => {
        const id = 'casa-lugar-' + m.id.replace(/^lugar-/, ''), def = I.def(id), porta = v.escadas.find((e) => e.para === id);
        const saida = def && def.escadas.find((e) => e.para === 'casa-lugares');
        return { lugar: m.id, id, existe: !!def, casa: def && def.lugar, pacote: def && def.pacote, porta: porta && [porta.x, porta.y],
          aberta: porta && typeof porta.aberta === 'function' ? porta.aberta() : null, saida: saida && [saida.x, saida.y],
          falas: def ? def.objetos.filter((o) => o.fala).length : 0 };
      }); })()`);
    assert.strictEqual(d.length, 12, 'os 12 lugares famosos');
    d.forEach((x) => {
      assert.ok(x.existe, `${x.id} existe`);
      assert.deepStrictEqual([x.casa, x.pacote], ['casa', 'interior-casa'], x.id);
      assert.ok(x.porta && x.saida, `${x.id}: a porta do lote e a saída de dentro`);
      assert.strictEqual(x.aberta, false, `${x.id}: a porta começa fechada (nada comprado)`);
      assert.strictEqual(x.falas, 2, `${x.id}: dois objetos que falam`);
    });
    const L = d[0], [px, py] = L.porta;

    // sem comprar: ela passa pela porta e continua na vila; o toque no lote só avisa onde comprar
    await c.ir('casa-lugares');
    let onde = await pisar(px, py + 1, 'cima', 12);
    assert.strictEqual(onde.cena, 'casa-lugares', 'sem comprar, a porta não leva: ' + JSON.stringify(onde));
    assert.ok(onde.y < py + 1, 'ela andou por cima da porta: ' + JSON.stringify(onde));
    const aviso = await c.js(`(() => { const o = Reino.Interiores.def('casa-lugares').objetos.find((x) => x.lugar === ${JSON.stringify(L.lugar)});
      const a = Reino.Cena.atual().alvoEm(o.x * 16 + 8, o.y * 16 + 8);
      if (!a || !a.objeto) return null; void a.agir(); return a.objeto.acao.tipo; })()`);
    assert.strictEqual(aviso, 'lugaresVer', 'o toque acha o lote');
    await c.avancar(600);
    const txt = await c.js(`(() => { const e = document.querySelector('.itens-aviso-texto'); return { t: e && e.textContent, cena: Reino.Cena.atual().id }; })()`);
    assert.strictEqual(txt.cena, 'casa-lugares', 'o toque no lote sem comprar não entra');
    assert.match(txt.t || '', /compre no Mercado da Garagem/);

    // comprar: a porta abre e leva para dentro, ao lado da saída; a saída volta para a frente do lote
    const comprou = await c.js(`(() => { Reino.Progresso.ganharEstrelas(500); const m = Reino.movelCasa(${JSON.stringify(L.lugar)});
      const r = Reino.VilaLojas.comprar('lugares', [{ id: m.id, qtd: 1 }]); Reino.Interiores.refazer('casa-lugares');
      return { ok: r.ok, aberta: Reino.Interiores.def('casa-lugares').escadas.find((e) => e.para === ${JSON.stringify(L.id)}).aberta() }; })()`);
    assert.deepStrictEqual(comprou, { ok: true, aberta: true });
    onde = await pisar(px, py + 1, 'cima');
    assert.strictEqual(onde.cena, L.id, 'comprado, a porta leva para dentro: ' + JSON.stringify(onde));
    assert.deepStrictEqual([onde.x, onde.y], [L.saida[0], L.saida[1] - 1], 'chega logo acima da saída');
    onde = await pisar(L.saida[0], L.saida[1] - 1, 'baixo');
    assert.strictEqual(onde.cena, 'casa-lugares', 'a saída volta para a vila');
    assert.deepStrictEqual([onde.x, onde.y], [px, py + 1], 'na frente do lote, logo abaixo da porta');

    // tocar no lugar comprado (em pé no lote: o desenho que sobe acima da pegada) também entra
    const tocou = await c.js(`(() => { const cena = Reino.Cena.atual(), o = cena._objetos.map((it) => it.o).find((x) => x.tipo === 'casa-lugares-' + ${JSON.stringify(L.lugar)});
      if (!o) return null; const w = Reino.Interiores.OBJETOS[o.tipo].w, a = cena.alvoEm(o.x * 16 + w * 8, o.y * 16 - 4);
      if (!a || !a.objeto) return 'sem alvo'; void a.agir(); return a.objeto.tipo; })()`);
    assert.strictEqual(tocou, 'casa-lugares-' + L.lugar, 'o toque acha o lugar');
    await c.avancar(2500);
    assert.strictEqual((await c.js(ONDE)).cena, L.id, 'o toque no lugar comprado entra');

    // lá dentro, a maquete mostra o nome e o país
    const maq = await c.js(`(() => { const cena = Reino.Cena.atual(), o = cena._objetos.map((it) => it.o).find((x) => x.acao && x.acao.tipo === 'lugarMaquete');
      const a = cena.alvoEm(o.x * 16 + 8, o.y * 16 + 8); if (!a || !a.objeto) return null; void a.agir(); return o.acao.lugar; })()`);
    assert.strictEqual(maq, L.lugar);
    await c.avancar(600);
    const t2 = await c.js(`(() => { const m = Reino.movelCasa(${JSON.stringify(L.lugar)}), e = document.querySelector('.itens-aviso-texto');
      return { visto: e && e.textContent, esperado: m.nome + ', ' + m.pais + '!' }; })()`);
    assert.strictEqual(t2.visto, t2.esperado, 'o aviso da maquete');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
