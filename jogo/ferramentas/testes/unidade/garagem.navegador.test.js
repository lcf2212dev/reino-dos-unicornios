// A Garagem da casa e o Mercado de Lugares Famosos (pedido de 19/11; docs/contratos/casa.md §2, vila.md §4): a porta de
// baixo da Cozinha (térreo) leva à Garagem (interior 'casa-garagem') e a porta do fundo da Garagem volta para a
// Cozinha; tocar no balcão abre a loja "Mercado de Lugares Famosos" (só compra, miniaturas com o preço de cada uma);
// uma miniatura comprada vira móvel da casa e pode ficar na Garagem (Casa.colocar; regras do casa.md §8).
// Anda de verdade (tecla de seta), no jogo congelado; servidor e banco de TESTE novos (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'garagem-'));
const ONDE = `(() => { const c = Reino.Cena.atual(), t = Jogador.tile(); return { cena: c && c.id, x: t.x, y: t.y }; })()`;

test('garagem: porta da Cozinha e volta, o balcão abre o Mercado de Lugares Famosos e a miniatura fica na Garagem', { timeout: 240000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', pasta: pasta() });
  // de pé no tile (x, y), anda na direção k até mudar de cena
  async function pisar(x, y, k) {
    await c.js(`Reino.UI.fecharTodas && Reino.UI.fecharTodas(); Jogador.posicionar(${x}, ${y}); Reino._motor.teclas = { ${k}: true }; 1`);
    const antes = (await c.js(ONDE)).cena;
    for (let i = 0; i < 40 && (await c.js(ONDE)).cena === antes; i++) await c.avancar(100);
    await c.js('Reino._motor.teclas = {}; 1');
    await c.avancar(2500);
    return c.js(ONDE);
  }
  try {
    // as duas pontas da porta, pareadas
    const d = await c.js(`(() => { const I = Reino.Interiores, t = I.def('casa'), g = I.def('casa-garagem');
      const ida = t.escadas.find((e) => e.para === 'casa-garagem'), volta = g.escadas.find((e) => e.para === 'casa');
      return { ida: ida && [ida.x, ida.y], volta: volta && [volta.x, volta.y], decoravel: !!g.decoravel, lugar: g.lugar,
        balcao: g.objetos.filter((o) => o.acao && o.acao.tipo === 'vilaLoja' && o.acao.loja === 'lugares').length,
        andares: Reino.Casa.ANDARES.slice() }; })()`);
    assert.ok(d.ida && d.volta, 'as duas pontas: ' + JSON.stringify(d));
    assert.deepStrictEqual(d.andares, ['casa', 'casa-2', 'casa-garagem']);
    assert.strictEqual(d.decoravel, true);
    assert.strictEqual(d.lugar, 'casa', 'a mesma casa');
    assert.strictEqual(d.balcao, 1, 'um balcão do Mercado');

    // do térreo, pela porta de baixo da Cozinha, até a Garagem; e de volta pela porta do fundo
    await c.ir('casa');
    let onde = await pisar(d.ida[0], d.ida[1] - 1, 'baixo');
    assert.strictEqual(onde.cena, 'casa-garagem', 'a porta da Cozinha leva à Garagem: ' + JSON.stringify(onde));
    onde = await pisar(d.volta[0], d.volta[1] + 1, 'cima');
    assert.strictEqual(onde.cena, 'casa', 'a porta do fundo volta para a casa: ' + JSON.stringify(onde));
    assert.deepStrictEqual([onde.x, onde.y], [d.ida[0], d.ida[1] - 1], 'chega logo acima da porta');

    // tocar no balcão abre o Mercado (só compra: sem as abas Comprar/Vender)
    await c.ir('casa-garagem');
    const ok = await c.js(`(() => { const c = Reino.Cena.atual(), o = c.def.objetos.find((x) => x.acao && x.acao.loja === 'lugares');
      const a = c.alvoEm(o.x * 16 + 16, o.y * 16 + 8);
      if (!a || !a.objeto || a.objeto.acao.loja !== 'lugares') return false;
      void a.agir(); return true; })()`);
    assert.ok(ok, 'o toque acha o balcão');
    await c.avancar(800);
    const tela = await c.js(`(() => { const t = document.querySelector('.tela-vila-loja-lugares');
      return t && { titulo: t.querySelector('h2, .painel-titulo') ? t.querySelector('h2, .painel-titulo').textContent.trim() : t.textContent.slice(0, 40),
        abas: t.querySelectorAll('[role="tab"]').length, cartoes: Reino.VilaLojas.aVenda('lugares').length }; })()`);
    assert.ok(tela, 'a tela do Mercado abriu');
    assert.match(tela.titulo, /Mercado de Lugares Famosos/);
    assert.strictEqual(tela.abas, 0, 'só compra');
    await c.js('Reino.UI.fecharTodas(); 1');
    await c.avancar(300);

    // uma miniatura (ou, sem miniaturas, um enfeite sólido de chão da Casa Bonita: tapete pode ficar embaixo de objeto fixo) vira móvel da casa e fica na Garagem
    const pos = await c.js(`(() => { const Ca = Reino.Casa, M = Reino.CasaMoveis;
      if (!Ca.ganhou()) Ca.abrirBau();
      const m = Reino.moveisCasa.find((x) => x.loja === 'lugares') || Reino.moveisCasa.find((x) => x.loja === true && !x.parede && !(Reino.Interiores.OBJETOS[x.objeto] || {}).plano);
      M.guardar('loja:' + m.id + ':1', m.id);
      const uid = 'movel.' + m.id + '.1';
      for (let y = 4; y <= 11; y++) for (let x = 2; x <= 19; x++) {
        if (Ca.podeColocar(uid, 'casa-garagem', x, y, 'baixo').ok) {
          const feito = Ca.colocar(uid, 'casa-garagem', x, y, 'baixo');
          const lugar = (Ca.pecas().find((p) => p.uid === uid) || {}).lugar || {};
          return { feito, x, y, no: lugar.andar === 'casa-garagem' && Ca.objetosDoAndar('casa-garagem').length > 0, comodo: Ca.comodoEm('casa-garagem', x, y) };
        }
      }
      return null; })()`);
    assert.ok(pos && pos.feito && pos.no, 'a miniatura fica na Garagem: ' + JSON.stringify(pos));
    assert.strictEqual(pos.comodo, 'garagem');
    // a regra de lugar vale lá: em cima do balcão, não
    const emCima = await c.js(`(() => { const o = Reino.Interiores.def('casa-garagem').objetos.find((x) => x.acao && x.acao.loja === 'lugares');
      const m = Reino.moveisCasa.find((x) => x.loja === 'lugares') || Reino.moveisCasa.find((x) => x.loja === true && !x.parede && !(Reino.Interiores.OBJETOS[x.objeto] || {}).plano);
      Reino.CasaMoveis.guardar('loja:' + m.id + ':2', m.id);
      return Reino.Casa.podeColocar('movel.' + m.id + '.2', 'casa-garagem', o.x, o.y + 1, 'baixo').ok; })()`);
    assert.strictEqual(emCima, false, 'não fica em cima do balcão');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
