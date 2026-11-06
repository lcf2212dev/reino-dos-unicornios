// Testes de unidade: os móveis avulsos da casa, um à escolha por sala feita (js/sistemas/casa-moveis.js e as peças
// 'movel.<id>.<n>' de js/sistemas/casa.js; docs/contratos/casa.md §12). O jogo inteiro (todos os `node: true`) num vm
// com save sintético (ajudantes/jogo-save.js); nada toca no save real. Interior, kit, móveis e matérias sintéticos.
// Rodar: node --test jogo/ferramentas/testes/unidade/casa-moveis.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje, copia } = require('./ajudantes/jogo-save');

const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);

// térreo 12×10 com um cômodo só (estar), paredes nas linhas 1–2, spawn (4,8), saída (4,9)
const CASA = {
  id: 'casa', lugar: 'casa', entrada: true, tamanho: { w: 12, h: 10 },
  comodos: [{ id: 'estar', rect: { x: 1, y: 1, w: 10, h: 8 } }],
  portas: [], objetos: [], npcs: [], spawn: { x: 4, y: 8 }, saida: { x: 4, y: 9 }, escadas: [],
};
const LIB = { 't-cadeira': { w: 1, h: 1, solido: 'base' }, 't-quadro': { w: 1, h: 1, parede: true } };
const KITS = [{ id: 'estar', nome: 'Sala de Estar', capa: 't-cadeira', comodo: 'estar', itens: [{ id: 'cadeira', nome: 'Cadeira', objeto: 't-cadeira', direcoes: 4 }] }];
const MOVEIS = [
  { id: 'pufe', nome: 'Pufe', objeto: 't-cadeira', comodo: 'estar', direcoes: 1 },
  { id: 'vaso', nome: 'Vaso', objeto: 't-cadeira', comodo: 'cozinha', direcoes: 4 },
  { id: 'relogio', nome: 'Relógio', objeto: 't-quadro', comodo: 'estar', direcoes: 1, parede: true },
  { id: 'piano', nome: 'Piano', objeto: 't-cadeira', comodo: 'quarto-uni', direcoes: 4 },
  { id: 'globo', nome: 'Globo', objeto: 't-cadeira', comodo: 'banheiro', direcoes: 1 },
  { id: 'urso', nome: 'Urso', objeto: 't-cadeira', comodo: 'estar', direcoes: 4 },
  { id: 'fonte', nome: 'Fonte', objeto: 't-cadeira', comodo: 'jantar', direcoes: 1 },
];
const MATERIAS = [
  { id: 't-m3', bimestre: 3, salas: [{ id: 't-s1' }] },
  { id: 't-m4a', bimestre: 4, salas: [{ id: 't-s2' }, { id: 't-s3' }] },
  { id: 't-m4b', bimestre: 4, salas: [{ id: 't-s4' }] },
];

function jogo(opcoes = {}, moveis = MOVEIS) {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar(opcoes); } finally { Jogo.scripts = orig; }
  const R = j.R;
  R.interiores.splice(0, R.interiores.length, ...R.interiores.filter((d) => d.id !== 'casa' && d.id !== 'casa-2'), copia(CASA));
  Object.keys(LIB).forEach((k) => { R.Interiores.OBJETOS[k] = LIB[k]; });
  R.kitsCasa.length = 0;
  KITS.forEach((k) => R.registrarKitCasa(copia(k)));
  R.moveisCasa.length = 0;
  moveis.forEach((m) => R.registrarMovelCasa(copia(m)));
  R.materias.splice(0, R.materias.length, ...copia(MATERIAS));
  R.Interiores.refazer = () => {};
  j.P.carregar();
  j.Casa = R.Casa; j.CM = R.CasaMoveis;
  return j;
}
function feita(j, ...salas) { salas.forEach((s) => { j.P.estado().salas[s] = { vezes: 1, melhor: 6, feita: j.relogio.agora }; }); }
// com a casa ganha e as 4 salas feitas
function pronto(opcoes, moveis) { const j = jogo(opcoes, moveis); j.Casa.abrirBau(); feita(j, 't-s1', 't-s2', 't-s3', 't-s4'); return j; }

test('casa-moveis: registro recusa repetido, sem objeto e id com ponto; dados de verdade: 50', () => {
  const j = jogo(), R = j.R;
  assert.strictEqual(R.registrarMovelCasa({ id: 'pufe', nome: 'X', objeto: 't', comodo: 'estar', direcoes: 1 }), false);
  assert.strictEqual(R.registrarMovelCasa({ id: 'a.b', nome: 'X', objeto: 't', comodo: 'estar', direcoes: 1 }), false);
  assert.strictEqual(R.registrarMovelCasa({ id: 'sem-objeto', nome: 'X', comodo: 'estar', direcoes: 1 }), false);
  assert.strictEqual(R.movelCasa('urso').nome, 'Urso');
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let real;
  try { real = montar({}); } finally { Jogo.scripts = orig; }
  var daLoja = real.R.moveisCasa.filter(function (m) { return m.loja === 'casa'; });
  assert.strictEqual(real.R.moveisCasa.length - daLoja.length, 50);
  assert.strictEqual(daLoja.length, 50, 'Cidade Nova: 50 móveis de decoração');
  assert.strictEqual(real.R.config.casa.moveisOpcoes, 5);
  real.R.moveisCasa.forEach((m) => assert.ok(real.R.config.casa.comodos.includes(m.comodo), m.id + ': cômodo de config.casa.comodos'));
});

test('casa-moveis: pendentes só com a casa ganha, salas feitas das matérias que contam, na ordem', () => {
  const j = jogo({ save: saveHoje() }), CM = j.CM;
  igual(j.P.estado().casaMoveis, {}, 'save antigo: o padrão');
  feita(j, 't-s1', 't-s4', 't-s2');
  igual(CM.pendentes(), [], 'sem a casa');
  j.Casa.abrirBau();
  igual(CM.pendentes(), ['t-s2', 't-s4'], 'do 3º bimestre não conta; ordem das matérias e das salas');
  assert.strictEqual(CM.salaInfo('t-s4').materia.id, 't-m4b');
  assert.strictEqual(CM.salaInfo('t-s1'), null);
});

test('casa-moveis: sorteio fixo por sala e casa; os que ela não tem primeiro; config.casa.moveisOpcoes', () => {
  const j = pronto({ agora: 1790000000000 }), CM = j.CM;
  const o2 = CM.opcoes('t-s2');
  assert.strictEqual(o2.length, 5);
  assert.strictEqual(new Set(o2).size, 5, 'sem repetir');
  igual(CM.opcoes('t-s2'), o2, 'abrir de novo mostra os mesmos');
  const outro = pronto({ agora: 1790000000000 });
  igual(outro.CM.opcoes('t-s2'), o2, 'outro aparelho com a mesma casa: os mesmos');
  assert.ok(['t-s3', 't-s4'].some((s) => JSON.stringify(CM.opcoes(s)) !== JSON.stringify(o2)), 'salas diferentes, sorteios diferentes');
  // escolhido vai para o fim nas outras salas (enquanto houver novos)
  assert.ok(CM.escolher('t-s2', o2[0]));
  assert.ok(!CM.opcoes('t-s3').includes(o2[0]), 'com 6 novos, o que ela tem não aparece');
  j.R.config.casa.moveisOpcoes = 3;
  assert.strictEqual(CM.opcoes('t-s3').length, 3);
});

test('casa-moveis: escolher grava, salva, conta a peça; recusa sala fora, móvel não sorteado e repetir a sala', () => {
  const j = pronto(), CM = j.CM, C = j.Casa;
  const id = CM.opcoes('t-s2')[0], fora = MOVEIS.map((m) => m.id).find((m) => !CM.opcoes('t-s2').includes(m));
  assert.strictEqual(CM.escolher('t-s1', id), false, 'sala que não conta');
  assert.strictEqual(CM.escolher('t-s2', fora), false, 'móvel não sorteado');
  const antes = j.contagem.salvar;
  assert.strictEqual(CM.escolher('t-s2', id), true);
  assert.ok(j.contagem.salvar > antes, 'salvou');
  igual(j.P.estado().casaMoveis, { 't-s2': { movel: id, em: j.relogio.agora } });
  assert.strictEqual(CM.escolher('t-s2', CM.opcoes('t-s2')[0]), false, 'sala já escolhida');
  igual(CM.pendentes(), ['t-s3', 't-s4']);
  assert.strictEqual(CM.qtd(id), 1);
  igual(CM.ganhos(), [id]);
  const com = j.R.movelCasa(id).comodo;
  igual(C.abas(), [com], 'a aba do cômodo do móvel, mesmo sem kit');
  igual(C.pecas(com).map((p) => p.uid), ['movel.' + id + '.1']);
  igual(C.pecas().map((p) => p.uid), ['movel.' + id + '.1']);
});

test('casa-moveis: faltando novos, repete; a peça 2 do mesmo móvel; colocar e o kit na mesma aba', () => {
  const j = pronto({}, MOVEIS.slice(0, 2)), CM = j.CM, C = j.Casa;   // só pufe e vaso: 2 opções
  igual(CM.opcoes('t-s2').slice().sort(), ['pufe', 'vaso']);
  assert.ok(CM.escolher('t-s2', 'pufe'));
  igual(CM.opcoes('t-s3'), ['vaso', 'pufe'], 'o novo primeiro, depois o repetido');
  assert.ok(CM.escolher('t-s3', 'pufe'));
  assert.strictEqual(CM.qtd('pufe'), 2);
  feita(j, 't-s2', 't-s3'); assert.ok(C.escolherKit('estar'));
  igual(C.abas(), ['estar']);
  igual(C.pecas('estar').map((p) => p.uid), ['estar.cadeira.1', 'movel.pufe.1', 'movel.pufe.2']);
  igual(C.pecas('estar')[1], { uid: 'movel.pufe.1', kit: 'movel', item: 'pufe', objeto: 't-cadeira', nome: 'Pufe', direcoes: 1, parede: false, lugar: null });
  assert.strictEqual(C.colocar('movel.pufe.2', 'casa', 5, 5, 'baixo'), true);
  assert.strictEqual(C.podeColocar('movel.pufe.1', 'casa', 5, 5, 'baixo').motivo, 'ocupado');
  assert.strictEqual(C.podeColocar('movel.pufe.1', 'casa', 6, 5, 'esq').motivo, 'fora', 'direcoes 1: não gira');
  igual(C.objetosDoAndar('casa'), [{ tipo: 't-cadeira', x: 5, y: 5, w: 1, h: 1, dir: 'baixo' }]);
  // peça além do que ela tem e móvel sem registro: ignoradas
  const itens = j.P.estado().casaItens;
  itens['movel.pufe.3'] = { andar: 'casa', x: 7, y: 5, dir: 'baixo', em: 1 };
  itens['movel.nada.1'] = { andar: 'casa', x: 8, y: 5, dir: 'baixo', em: 1 };
  assert.strictEqual(C.objetosDoAndar('casa').length, 1);
});

test('casa-moveis: móvel desconhecido no save não conta e a sala volta a ficar pendente; estragado não quebra', () => {
  const s = Object.assign(saveHoje(), { casaBau: { em: 5 }, casaMoveis: { 't-s2': { movel: 'sumiu', em: 3 }, 't-s4': { movel: 7, em: 3 }, 't-s3': 'x' } });
  const j = jogo({ save: s }), CM = j.CM;
  feita(j, 't-s2', 't-s3', 't-s4');
  igual(CM.pendentes(), ['t-s2', 't-s3', 't-s4']);
  igual(CM.ganhos(), []);
  assert.ok(CM.escolher('t-s2', CM.opcoes('t-s2')[0]));
  assert.ok(j.P.estado().casaMoveis['t-s2'].em > 3, 'carimbo maior que o antigo');
  const j2 = jogo({ save: Object.assign(saveHoje(), { casaMoveis: [1] }) });
  igual(j2.P.estado().casaMoveis, {});
});

test('casa-moveis: mescla de 2 aparelhos (a mesma sala: o mais novo; salas diferentes: as duas)', () => {
  const A = pronto({ agora: 1000 }), B = jogo({ save: A.lido(), agora: 2000 });
  feita(B, 't-s1', 't-s2', 't-s3', 't-s4');
  const a = A.CM.opcoes('t-s2')[0], b = B.CM.opcoes('t-s2')[1];
  assert.ok(A.CM.escolher('t-s2', a));
  assert.ok(A.CM.escolher('t-s4', A.CM.opcoes('t-s4')[0]));
  assert.ok(B.CM.escolher('t-s2', b));
  assert.ok(B.CM.escolher('t-s3', B.CM.opcoes('t-s3')[0]));
  A.P.salvar(); B.P.salvar();
  [[A.lido(), B.lido()], [B.lido(), A.lido()]].forEach(([x, y]) => {
    const m = A.P.mesclar(copia(x), copia(y));
    igual(Object.keys(m.casaMoveis).sort(), ['t-s2', 't-s3', 't-s4']);
    igual(m.casaMoveis['t-s2'], { movel: b, em: 2000 }, 'a escolha mais nova');
    const J = jogo({ save: m });
    feita(J, 't-s1', 't-s2', 't-s3', 't-s4');
    igual(J.CM.pendentes(), []);
  });
});

test('casa-moveis: aparelho de versão antiga (sem o campo) e mais novo não apaga as escolhas', () => {
  const A = pronto({ agora: 1000 });
  assert.ok(A.CM.escolher('t-s2', A.CM.opcoes('t-s2')[0]));
  A.P.salvar();
  const velho = A.lido();
  delete velho.casaMoveis;
  [[A.lido(), velho], [velho, A.lido()]].forEach(([x, y]) => {
    const m = A.P.mesclar(copia(x), copia(y));
    igual(m.casaMoveis, A.lido().casaMoveis, 'a escolha continua');
  });
});

test('casa-moveis: a caixa de mudança abre antes os móveis pendentes, depois os kits e o painel', async () => {
  const j = pronto(), R = j.R, acao = R.modulos.find((m) => m.id === 'casa').acoes.casaDecorar, chamadas = [];
  R.UI = R.UI || {};
  R.UI.casaMoveisPendentes = () => { chamadas.push('moveis'); j.CM.pendentes().forEach((s) => j.CM.escolher(s, j.CM.opcoes(s)[0])); return Promise.resolve(); };
  R.UI.casaKitsPendentes = () => { chamadas.push('kits'); j.Casa.escolherKit('estar'); return Promise.resolve(); };
  R.UI.decorarCasa = (o) => { chamadas.push(['decorar', o.kit]); };
  await acao({ tipo: 'casaDecorar' }, {});
  await acao({ tipo: 'casaDecorar', kit: 'estar' }, {});
  igual(chamadas, ['moveis', 'kits', ['decorar', null], ['decorar', 'estar']]);
});
