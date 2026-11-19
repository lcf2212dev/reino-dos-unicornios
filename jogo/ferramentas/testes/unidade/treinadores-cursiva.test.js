// Testes de unidade: as bolas dos Treinadores de Monstros pela letra cursiva (docs/contratos/cursiva.md §5;
// js/sistemas/treinadores.js: Treinadores.frases e ganharEscrevendo). Mini por 1 frase, MonsterBall por 2 e Super por 3
// (config.cursiva.frasesMini, frasesPorBola e frasesSuper); cada uma dá 1 bola do tipo dela, sem gastar estrela, na
// mochila (cheia: no baú); 0 no número tira a bola da escrita; a compra com estrelas continua igual.
// O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/treinadores-cursiva.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje } = require('./ajudantes/jogo-save');

const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);
function jogo() {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: saveHoje() }); } finally { Jogo.scripts = orig; }
  j.P.carregar();
  j.T = j.R.Treinadores; j.It = j.R.Itens; j.cfg = j.R.config.cursiva;
  return j;
}
const tem = (j) => ['bola-mini', 'bola-monster', 'bola-super'].map((id) => j.T.tem(id));

test('treinadores: Mini por 1 frase, MonsterBall por 2 e Super por 3 (config.cursiva)', () => {
  const j = jogo(), T = j.T;
  igual([j.cfg.frasesMini, j.cfg.frasesPorBola, j.cfg.frasesSuper], [1, 2, 3], 'pedido do Leandro');
  igual([T.frases('bola-mini'), T.frases('bola-monster'), T.frases('bola-super'), T.frases()], [1, 2, 3, 2]);
  igual(T.ofertas().map((o) => [o.id, o.frases]), [['bola-mini', 1], ['bola-monster', 2], ['bola-super', 3]]);
  igual([T.frases('pocao-pequena'), T.frases('espada-pluma'), T.frases('xx')], [0, 0, 0], 'só as bolas');
  // o número é da config: muda na hora; 0, negativo ou torto tira a bola da escrita
  j.cfg.frasesSuper = 4; j.cfg.frasesMini = 0;
  igual([T.frases('bola-mini'), T.frases('bola-super')], [0, 4]);
  j.cfg.frasesSuper = 'três'; j.cfg.frasesPorBola = 2.9;
  igual([T.frases('bola-super'), T.frases('bola-monster')], [0, 2]);
});

test('treinadores: escrevendo ganha 1 bola daquele cartão, sem gastar estrela; sem id, a MonsterBall', () => {
  const j = jogo(), T = j.T;
  let mapa = 0;
  j.R.util.on(j.R.EVENTOS.MAPA_MUDOU, () => { mapa++; });
  const estrelas = j.P.estrelas();
  igual(tem(j), [0, 0, 0]);
  const s = T.ganharEscrevendo('bola-super');
  igual([s.ok, s.id, s.onde], [true, 'bola-super', 'mochila']);
  igual(tem(j), [0, 0, 1]);
  igual(T.ganharEscrevendo('bola-mini').id, 'bola-mini');
  igual(T.ganharEscrevendo().id, 'bola-monster', 'sem id: a MonsterBall');
  assert.strictEqual(j.cfg.bola, undefined, 'config.cursiva.bola saiu: cada botão dá a bola do cartão dele');
  igual(tem(j), [1, 1, 1]);
  assert.strictEqual(j.P.estrelas(), estrelas, 'sem gastar estrela');
  assert.strictEqual(mapa, 3, 'MAPA_MUDOU a cada bola');
  assert.strictEqual(Object.values(j.lido().itens).filter((x) => x.id === 'bola-super' && x.onde === 'mochila').length, 1, 'gravou');
  // o que não se ganha escrevendo: nada entra
  const antes = j.It.pecas().length;
  igual([T.ganharEscrevendo('espada-pluma').motivo, T.ganharEscrevendo('pocao-pequena').motivo, T.ganharEscrevendo('xx').motivo], ['itens', 'itens', 'itens']);
  j.cfg.frasesSuper = 0;
  igual(T.ganharEscrevendo('bola-super'), { ok: false, motivo: 'itens', id: 'bola-super' }, 'com 0 frases a Super não sai pela escrita');
  assert.strictEqual(j.It.pecas().length, antes);
});

test('treinadores: mochila cheia, a bola escrita vai para o baú; a compra com estrelas continua igual', () => {
  const j = jogo(), T = j.T, It = j.It;
  while (It.espacos().usados < It.CAPACIDADE()) It.ganhar('espada-madeira');
  igual(T.ganharEscrevendo('bola-super').onde, 'bau');
  igual(tem(j), [0, 0, 1], 'a do baú conta no "Você tem"');
  j.P.ganharEstrelas(1000);
  const saldo = j.P.estrelas(), preco = T.preco('bola-super');
  const r = T.comprar([{ id: 'bola-super', qtd: 1 }]);
  igual([r.ok, r.total, j.P.estrelas()], [true, preco, saldo - preco]);
  igual(tem(j), [0, 0, 2]);
});
