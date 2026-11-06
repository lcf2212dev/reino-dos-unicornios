// Escadas pareadas (motor/interiores-toque.js): sem `chegada`, ela chega ao lado da escada do destino que volta
// para o andar de onde veio (`chegar`, padrão (0, 1)). A tabela abaixo é CONGELADA: são as coordenadas fixas
// que as escadas tinham antes do pareamento (andar2-escadas.js, andar3-escadas.js, torre.js). Mudou uma posição
// de propósito? Atualize a tabela junto (e o e2e mostra a diferença).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/escadas.test.js
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

const TORRE = ['torre', 'torre-1', 'torre-2', 'torre-3', 'torre-4', 'torre-relogio'];
// 'origem:índice da escada' → chegada no destino
const CONGELADA = {
  'observatorio:0': { para: 'observatorio-2', x: 22, y: 12 },
  'observatorio-2:0': { para: 'observatorio', x: 26, y: 4 },
  'observatorio-2:1': { para: 'observatorio-3', x: 18, y: 22 },
  'observatorio-3:0': { para: 'observatorio-2', x: 26, y: 4 },
  'quimica:0': { para: 'quimica-2', x: 21, y: 11 },
  'quimica-2:0': { para: 'quimica', x: 21, y: 4 },
  'portugues:0': { para: 'portugues-1', x: 18, y: 11 },   // Casa das Palavras: do saguão, logo abaixo do vão no Ateliê 11
  'portugues-1:0': { para: 'portugues', x: 24, y: 26 },   // e de volta, logo abaixo do arco no fundo do saguão
  'casa:0': { para: 'casa-2', x: 2, y: 10 },             // Minha Casa: da Sala de Estar, logo acima do vão no Quarto
  'casa-2:0': { para: 'casa', x: 36, y: 4 },             // e de volta, logo abaixo do arco no canto da Sala de Estar
  // Torre dos Números: o arco do saguão (e do ateliê de cada andar) sobe para o vão da 1ª galeria do andar de cima
  'matematica:0': { para: 'matematica-1', x: 3, y: 10 },
  'matematica-1:0': { para: 'matematica-2', x: 3, y: 10 }, 'matematica-1:1': { para: 'matematica', x: 9, y: 3 },
  'matematica-2:0': { para: 'matematica-3', x: 3, y: 10 }, 'matematica-2:1': { para: 'matematica-1', x: 33, y: 3 },
  'matematica-3:0': { para: 'matematica-2', x: 33, y: 3 },
  // Vila Arco-Íris (vila.md §2): o portal do Bosque e o da Vila (sentido 'portal'), e a porta de cada loja ↔ a saída dela
  'bosque:0': { para: 'vila', x: 2, y: 19 },
  'vila:0': { para: 'vila-casa', x: 8, y: 9 }, 'vila:1': { para: 'vila-armas', x: 8, y: 9 },
  'vila:2': { para: 'vila-cabecas', x: 8, y: 9 }, 'vila:3': { para: 'vila-armaduras', x: 8, y: 9 },
  'vila:4': { para: 'bosque', x: 52, y: 22 },
  'vila-casa:0': { para: 'vila', x: 6, y: 9 }, 'vila-armas:0': { para: 'vila', x: 15, y: 9 },
  'vila-cabecas:0': { para: 'vila', x: 24, y: 9 }, 'vila-armaduras:0': { para: 'vila', x: 33, y: 9 },
};
TORRE.forEach((id, i) => {
  let k = 0;
  if (i < TORRE.length - 1) CONGELADA[`${id}:${k++}`] = { para: TORRE[i + 1], x: 3, y: 10 };   // sobe: à direita do vão
  if (i > 0) CONGELADA[`${id}:${k++}`] = { para: TORRE[i - 1], x: 9, y: 3 };                  // desce: à esquerda do arco
});

function jogo() {
  const ctx = Jogo.contexto({ console: { warn() {}, log() {}, error: console.error }, setTimeout, clearTimeout, Math, Date });
  return Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts())).Reino;
}

test('cada escada de hoje chega onde chegava com a coordenada fixa', () => {
  const R = jogo();
  const vistas = {};
  R.interiores.forEach((d) => (d.escadas || []).forEach((e, i) => {
    const k = `${d.id}:${i}`, esperado = CONGELADA[k];
    assert.ok(esperado, `escada nova ${k} (${e.x},${e.y}) → ${e.para}: ponha na tabela CONGELADA`);
    assert.strictEqual(e.para, esperado.para, k);
    assert.deepStrictEqual(JSON.parse(JSON.stringify(R.Interiores.chegadaDaEscada(d.id, i))), { x: esperado.x, y: esperado.y }, k);
    assert.strictEqual(e.chegada, undefined, `${k}: tem chegada fixa (use o \`chegar\` da escada de volta)`);
    vistas[k] = true;
  }));
  assert.deepStrictEqual(Object.keys(vistas).sort(), Object.keys(CONGELADA).sort(), 'alguma escada da tabela sumiu');
});

test('chegadaVindoDe: par com chegar, padrão (0, 1) e sem par (null → spawn)', () => {
  const I = jogo().Interiores;
  assert.deepStrictEqual({ ...I.chegadaVindoDe('observatorio-2', 'observatorio') }, { x: 22, y: 12 });   // chegar (1, 0)
  assert.deepStrictEqual({ ...I.chegadaVindoDe('observatorio', 'observatorio-2') }, { x: 26, y: 4 });    // padrão (0, 1)
  assert.strictEqual(I.chegadaVindoDe('observatorio', 'torre'), null);
  assert.strictEqual(I.chegadaVindoDe('naoexiste', 'observatorio'), null);
  assert.strictEqual(I.chegadaDaEscada('observatorio', 9), null);
});

test('chegada explícita continua valendo (compatibilidade) e sem par cai no spawn', () => {
  const R = jogo();
  const d = R.interiores.find((x) => x.id === 'observatorio');
  d.escadas[0].chegada = { x: 20, y: 10 };
  assert.deepStrictEqual({ ...R.Interiores.chegadaDaEscada('observatorio', 0) }, { x: 20, y: 10 });
  delete d.escadas[0].chegada;
  const nasa = R.interiores.find((x) => x.id === 'observatorio-2');
  nasa.escadas = nasa.escadas.filter((e) => e.para !== 'observatorio');
  nasa.spawn = { x: 5, y: 5 };
  assert.deepStrictEqual({ ...R.Interiores.chegadaDaEscada('observatorio', 0) }, { x: 5, y: 5 });
});
