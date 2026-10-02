// Matéria dentro de um prédio que já existe, no jogo de verdade: a linha do menu Lugares, o "Ir" que anda até a
// porta do Observatório e entra direto no andar da matéria, e a saída pela porta do anfitrião.
// Matéria e andar SINTÉTICOS (cópias de História e do térreo do Observatório). Servidor e save de TESTE (cenario.js).
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const MONTAR = `
  var h = Reino.materia('historia');
  Reino.materias.push(Object.assign({}, h, { id: 'sintetica', nome: 'Sintética', arquivada: false,
    lugar: { nome: 'Sala Sintética', artigo: 'a', dentro: 'observatorio', interior: 'sint-andar' } }));
  var obs = Reino.Interiores.doLugar('observatorio');
  Reino.registrarInterior(Object.assign({}, obs, { id: 'sint-andar', lugar: 'materia:sintetica', entrada: true }));
  Mapa.criar(Reino.materias);`;

test('menu Lugares: "Ir" na matéria de dentro chega ao andar dela; sair volta à porta do anfitrião', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'inicio', pasta: '/tmp/reino-testes/ver/teste-materia-dentro' });
  try {
    await c.js(MONTAR);
    await c.tela('lugares');
    // o menu hifeniza os nomes (hífen suave): compara sem eles
    const ACHAR = "[...document.querySelectorAll('.sala-card')].find(function (b) { return b.textContent.replace(/\\u00ad/g, '').indexOf('Sala Sintética') >= 0; })";
    const linha = await c.js(ACHAR + '.textContent');
    assert.ok(/0 de 5 salas/.test(linha), 'linha do menu: ' + linha);
    await c.js(ACHAR + '.click()');
    for (let i = 0; i < 40 && (await c.js('Reino.Cena.atual().id')) !== 'sint-andar'; i++) await c.avancar(1000);
    assert.strictEqual(await c.js('Reino.Cena.atual().id'), 'sint-andar');
    // saindo, aparece na frente da porta do Observatório
    await c.js('Reino.Cena.sair(), 0');   // sem esperar a promessa: o relógio está congelado
    await c.avancar(2500);
    const r = await c.js("({ cena: Reino.Cena.atual().id, tile: Jogador.tile(), porta: Mapa.lugar('observatorio').porta })");
    assert.strictEqual(r.cena, 'mapa');
    assert.deepStrictEqual(r.tile, { x: r.porta.x, y: r.porta.y + 1 });
    // do térreo do anfitrião, vai direto ao andar, sem sair
    await c.ir('observatorio');
    await c.js("Reino.Cena.irAoLugar(Mapa.lugar('materia:sintetica')), 0");
    await c.avancar(2500);
    assert.strictEqual(await c.js('Reino.Cena.atual().id'), 'sint-andar');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
