// Minha Casa, o prédio (casa.md §2 e §4): entra na casa pelo jogo, acha os 4 cômodos do térreo e os 2 quartos, sobe
// e desce a escada, lê as placas com o nome do perfil e da montaria; com um kit dado pelo save (matéria do 4º
// bimestre completa, forjada no save sintético), coloca uma peça (aparece e fica sólida) e guarda (some).
// Servidor de TESTE (cenario.js), save sintético.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'casa-predio-'));

const LER = `(function () {
  var c = Reino.Cena.atual(), I = Reino.Interiores, d = I.def(c.id);
  return { id: c.id, comodos: d.comodos.map(function (k) { return k.id + '|' + k.nome + '|' + I.textoPlaca(k.placa); }),
    caixas: d.objetos.filter(function (o) { return o.tipo === 'casa-caixa'; }).map(function (o) { return Reino.Casa.comodoEm(c.id, o.x, o.y) + ':' + o.acao.kit; }),
    uni: Reino.Progresso.nomeUni(Reino.Progresso.montaria()), decoravel: !!d.decoravel };
})()`;

test('casa: entra, 6 cômodos com placas, escadas e uma peça colocada e guardada', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', materiasCompletas: ['ingles4'], pasta: pasta() });
  try {
    await c.ir('casa');
    const t = await c.js(LER);
    assert.strictEqual(t.id, 'casa');
    assert.ok(t.decoravel);
    assert.deepStrictEqual(t.comodos, ['estar|Sala de Estar|Sala de Estar', 'jantar|Sala de Jantar|Sala de Jantar',
      'cozinha|Cozinha|Cozinha', 'banheiro|Banheiro|Banheiro']);
    assert.deepStrictEqual(t.caixas.sort(), ['banheiro:banheiro', 'cozinha:cozinha', 'estar:estar', 'jantar:jantar']);

    // sobe a escada (o mesmo caminho do toque: chegada pareada) e chega no 2º andar
    const subir = await c.js("var ch = Reino.Interiores.chegadaVindoDe('casa-2', 'casa'); Reino.Cena.irPara('casa-2'); ch");
    await c.avancar(1500);
    const a2 = await c.js(LER);
    assert.strictEqual(a2.id, 'casa-2');
    assert.deepStrictEqual(subir, { x: 2, y: 10 });
    const nome = await c.js("Reino.Genero.texto('{da|do} ') + Reino.Progresso.estado().perfil.nome");
    assert.deepStrictEqual(a2.comodos, ['quarto-jogador|Quarto|Quarto ' + nome, 'quarto-uni|Quarto do unicórnio|Quarto de ' + a2.uni]);
    assert.ok(a2.uni && !/\{/.test(a2.comodos.join()), 'placas resolvidas');
    assert.deepStrictEqual(a2.caixas.sort(), ['quarto-jogador:quarto-jogador', 'quarto-uni:quarto-uni']);

    // kit pelo save e uma peça no quarto: aparece e fica sólida; guardada, some
    const r = await c.js(`(function () {
      var C = Reino.Casa, ok = C.escolherKit('quarto-jogador');
      var p = C.pecas('quarto-jogador').filter(function (x) { return !x.parede; })[0];
      var pos = null;
      for (var y = 4; y < 10 && !pos; y++) for (var x = 4; x < 11 && !pos; x++) if (C.podeColocar(p.uid, 'casa-2', x, y, 'baixo').ok) pos = { x: x, y: y };
      var pos2 = C.colocar(p.uid, 'casa-2', pos.x, pos.y, 'baixo');
      var cena = Reino.Cena.atual(), noChao = cena._objetos.some(function (it) { return it.o.tipo === p.objeto; });
      var g = cena.grade, solido = false;
      for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) if (g.solido[pos.y + j] && g.solido[pos.y + j][pos.x + i] && g.objeto[pos.y + j][pos.x + i] != null) solido = true;
      C.guardar(p.uid);
      var depois = Reino.Cena.atual()._objetos.some(function (it) { return it.o.tipo === p.objeto; });
      return { ok: ok, colocou: pos2, noChao: noChao, solido: solido, depois: depois };
    })()`);
    assert.deepStrictEqual(r, { ok: true, colocou: true, noChao: true, solido: true, depois: false });

    // desce de volta: chega logo abaixo do arco da Sala de Estar
    assert.deepStrictEqual(await c.js("Reino.Interiores.chegadaVindoDe('casa', 'casa-2')"), { x: 36, y: 4 });
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});
