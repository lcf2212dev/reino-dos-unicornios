// Testes de unidade: as regras e o save do Bosque dos Fantasmas (js/sistemas/bosque.js, Reino.Bosque) e o móvel da
// casa por nível (fonte 'bosque' de js/sistemas/casa-moveis.js). Contratos: docs/contratos/bosque.md §4, §5 e
// casa.md §12. O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js); nada toca
// no save real. Matérias, casa e móveis sintéticos.
// Rodar: node --test jogo/ferramentas/testes/unidade/bosque-regras.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje, copia } = require('./ajudantes/jogo-save');

const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);

const CASA = {
  id: 'casa', lugar: 'casa', entrada: true, tamanho: { w: 12, h: 10 },
  comodos: [{ id: 'estar', rect: { x: 1, y: 1, w: 10, h: 8 } }],
  portas: [], objetos: [], npcs: [], spawn: { x: 4, y: 8 }, saida: { x: 4, y: 9 }, escadas: [],
};
const MOVEIS = ['pufe', 'vaso', 'piano', 'globo', 'urso', 'fonte'].map((id) => ({ id, nome: id, objeto: 't-cadeira', comodo: 'estar', direcoes: 1 }));
const d = (id, tipo, extra) => Object.assign({ id, tipo }, extra || {});
// 4º bimestre: q4a (5 perguntas que valem: todo tipo, menos a memória, o tipo que não existe e a pessoal) e q4b (6);
// arquivada e 3º bimestre não entram
const MATERIAS = [
  { id: 'q4a', bimestre: 4, salas: [
    { id: 'a1', nome: 'Sala A1', desafios: [d('a1-1', 'escolha'), d('a1-2', 'vf'), d('a1-3', 'livre'), d('a1-4', 'escolha', { livre: true })] },
    { id: 'a2', nome: 'Sala A2', desafios: [d('a2-1', 'varias'), d('a2-2', 'ordenar'), d('a2-3', 'memoria'), d('a2-4', 'digitar')] },
  ] },
  { id: 'q4b', bimestre: 4, salas: [{ id: 'b1', nome: 'Sala B1', desafios: [1, 2, 3, 4, 5, 6].map((n) => d('b1-' + n, 'escolha')) }] },
  { id: 'q4x', bimestre: 4, arquivada: true, salas: [{ id: 'x1', nome: 'X', desafios: [d('x1-1', 'escolha')] }] },
  { id: 'q3', bimestre: 3, salas: [{ id: 'c1', nome: 'Sala C1', desafios: [d('c1-1', 'escolha'), d('c1-2', 'vf')] }] },
];
const VALEM = ['a1-1', 'a1-2', 'a2-1', 'a2-2', 'a2-4', 'b1-1', 'b1-2', 'b1-3', 'b1-4', 'b1-5', 'b1-6'];

function jogo(opcoes = {}) {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar(opcoes); } finally { Jogo.scripts = orig; }
  const R = j.R;
  R.interiores.splice(0, R.interiores.length, ...R.interiores.filter((x) => x.id !== 'casa' && x.id !== 'casa-2'), copia(CASA));
  R.Interiores.OBJETOS['t-cadeira'] = { w: 1, h: 1, solido: 'base' };
  R.kitsCasa.length = 0;
  R.moveisCasa.length = 0;
  MOVEIS.forEach((m) => R.registrarMovelCasa(copia(m)));
  R.materias.splice(0, R.materias.length, ...copia(MATERIAS));
  R.Interiores.refazer = () => {};
  j.P.carregar();
  j.B = R.Bosque; j.CM = R.CasaMoveis;
  j.bosque = [];
  R.util.on(R.EVENTOS.BOSQUE, (c) => j.bosque.push(c));
  return j;
}
function comAcertos(j, n) { j.P.estado().bosque.acertos = n; }

test('bosque: campos registrados (contadores e carimbo), mantêm no Novo ciclo, na cópia; save antigo ganha o padrão', () => {
  const j = jogo({ save: saveHoje() }), I = j.R._progresso;
  ['bosque', 'bosquePontos'].forEach((c) => assert.ok(j.P.camposRegistrados().includes(c), c));
  assert.strictEqual(I.campos.bosque.mesclar, 'contadores');
  assert.strictEqual(I.campos.bosquePontos.mesclar, 'carimbo');
  ['bosque', 'bosquePontos'].forEach((c) => {
    assert.strictEqual(I.campos[c].novoCiclo, 'mantem', c);
    assert.strictEqual(I.campos[c].copiaSeguranca, true, c);
  });
  igual(j.P.estado().bosque, { acertos: 0, espada: 0, vencidos: 0 });
  igual(j.P.estado().bosquePontos, {});
  assert.strictEqual(j.B.nivel(), 1);
  igual(j.B.xp(), { n: 0, de: 10, maximo: false });
  igual(j.B.pontosPendentes(), []);
});

test('bosque: nível e XP derivados dos acertos; nível máximo 1000 (os acertos continuam contando)', () => {
  const j = jogo(), B = j.B, cfg = j.R.config.fantasmas;
  assert.strictEqual(cfg.acertosPorNivel, 10);
  assert.strictEqual(cfg.nivelMax, 1000);
  comAcertos(j, 9);
  assert.strictEqual(B.nivel(), 1);
  igual(B.xp(), { n: 9, de: 10, maximo: false });
  comAcertos(j, 10);
  assert.strictEqual(B.nivel(), 2);
  igual(B.xp(), { n: 0, de: 10, maximo: false });
  comAcertos(j, 37);
  assert.strictEqual(B.nivel(), 4);
  igual(B.xp(), { n: 7, de: 10, maximo: false });
  comAcertos(j, 9989);
  assert.strictEqual(B.nivel(), 999);
  comAcertos(j, 9990);
  assert.strictEqual(B.nivel(), 1000);
  igual(B.xp(), { n: 10, de: 10, maximo: true }, 'no máximo, a barra cheia');
  comAcertos(j, 50000);
  assert.strictEqual(B.nivel(), 1000);
  assert.strictEqual(B.acertos(), 50000);
  assert.strictEqual(B.pontosPendentes().length, 999, 'um ponto por nível, do 2 ao 1000');
  // estragado: acertos que não é número conta 0
  j.P.estado().bosque.acertos = { a: 3 };
  assert.strictEqual(B.nivel(), 1);
});

test('bosque: acertou dá XP, estrela, salva, Aura e evento; subiu só quando passa de nível; errou não tira nada', () => {
  const j = jogo(), B = j.B, P = j.P;
  comAcertos(j, 8);
  const estrelas = P.estrelas(), salvar = j.contagem.salvar;
  igual(B.acertou('q4a'), { estrelas: 1, nivel: 1, subiu: null });
  assert.strictEqual(P.estrelas(), estrelas + 1);
  assert.ok(j.contagem.salvar > salvar, 'salvou');
  igual(B.acertou('q4b'), { estrelas: 1, nivel: 2, subiu: 2 });
  igual(j.bosque.map((c) => c.tipo), ['acerto', 'acerto']);
  igual(P.estado().bosque, { acertos: 10, espada: 0, vencidos: 2 });
  B.errou('q4a');
  igual(P.estado().bosque, { acertos: 10, espada: 0, vencidos: 3 }, 'errou conta o fantasma, não o acerto');
  assert.strictEqual(P.estrelas(), estrelas + 2, 'errou não tira estrela');
  assert.strictEqual(B.chaveMovel(7), 'bosque:7');
});

test('bosque: a espada uma vez só', () => {
  const j = jogo(), B = j.B;
  assert.strictEqual(B.temEspada(), false);
  assert.strictEqual(B.ganharEspada(), true);
  assert.strictEqual(B.ganharEspada(), false);
  assert.strictEqual(B.temEspada(), true);
  assert.strictEqual(j.P.estado().bosque.espada, 1);
});

test('bosque: porPonto, um por nível do 2 ao atual; dano, vida máxima e velocidade (com teto) pelos pontos', () => {
  const j = jogo(), B = j.B, J = j.R.config.fantasmas.jogador;
  comAcertos(j, 35);   // nível 4: pontos dos níveis 2, 3 e 4
  igual(B.pontosPendentes(), [2, 3, 4]);
  assert.strictEqual(B.porPonto(1, 'forca'), false, 'nível 1 não dá ponto');
  assert.strictEqual(B.porPonto(5, 'forca'), false, 'nível que não chegou');
  assert.strictEqual(B.porPonto(2, 'magia'), false, 'habilidade que não existe');
  assert.strictEqual(B.porPonto('2', 'forca'), false, 'nível precisa ser número');
  assert.strictEqual(B.dano(), J.danoBase);
  assert.strictEqual(B.vidaMax(), J.vidaBase);
  assert.strictEqual(B.fatorVelocidade(), 1);
  assert.strictEqual(B.porPonto(2, 'forca'), true);
  assert.strictEqual(B.porPonto(2, 'vida'), false, 'a escolha é para sempre');
  assert.strictEqual(B.porPonto(3, 'vida'), true);
  assert.strictEqual(B.porPonto(4, 'velocidade'), true);
  igual(B.pontos(), { forca: 1, vida: 1, velocidade: 1 });
  igual(B.pontosPendentes(), []);
  assert.strictEqual(B.dano(), J.danoBase + J.danoPorPonto);
  assert.strictEqual(B.vidaMax(), J.vidaBase + J.vidaPorPonto);
  assert.strictEqual(B.fatorVelocidade(), 1 + J.velocidadePorPonto);
  igual(j.bosque.filter((c) => c.tipo === 'ponto').map((c) => [c.nivel, c.h]), [[2, 'forca'], [3, 'vida'], [4, 'velocidade']]);
  // teto da velocidade
  comAcertos(j, 1000);
  B.pontosPendentes().forEach((n) => B.porPonto(n, 'velocidade'));
  assert.strictEqual(B.fatorVelocidade(), J.velocidadeMax);
  // o fator só vale dentro do Bosque (o que o Jogador recebe)
  assert.strictEqual(B.noBosque(), false);
  j.cena.atual = { tipo: 'interior', id: 'bosque' };
  assert.strictEqual(B.noBosque(), true);
  j.cena.atual = { tipo: 'interior', id: 'casa' };
  assert.strictEqual(B.noBosque(), false);
});

test('bosque: escolha estragada ou de nível que não chegou não conta (o nível fica pendente)', () => {
  const s = Object.assign(saveHoje(), { bosque: { acertos: 25, espada: 1, vencidos: 40 },
    bosquePontos: { 1: { h: 'forca', em: 1 }, 2: { h: 'magia', em: 1 }, 3: { h: 'vida', em: 1 }, 9: { h: 'forca', em: 1 }, x: 'y' } });
  const j = jogo({ save: s }), B = j.B;
  igual(B.pontos(), { forca: 0, vida: 1, velocidade: 0 });
  igual(B.pontosPendentes(), [2]);
  assert.strictEqual(B.porPonto(2, 'forca'), true);
  assert.ok(j.P.estado().bosquePontos[2].em > 1, 'carimbo novo');
  const j2 = jogo({ save: Object.assign(saveHoje(), { bosque: [1], bosquePontos: 'x' }) });
  igual(j2.P.estado().bosque, { acertos: 0, espada: 0, vencidos: 0 });
  igual(j2.P.estado().bosquePontos, {});
});

test('bosque: dois aparelhos escolhem o mesmo nível: a mescla guarda uma escolha por nível (nenhum ponto sobra)', () => {
  const base = Object.assign(saveHoje(), { bosque: { acertos: 30, espada: 1, vencidos: 30 }, bosquePontos: {} });
  const A = jogo({ save: copia(base), agora: 1000 }), B = jogo({ save: copia(base), agora: 2000 });
  assert.ok(A.B.porPonto(2, 'forca'));
  assert.ok(A.B.porPonto(3, 'vida'));
  assert.ok(B.B.porPonto(2, 'velocidade'));
  B.B.acertou('q4a'); B.B.acertou('q4a');
  A.P.salvar(); B.P.salvar();
  [[A.lido(), B.lido()], [B.lido(), A.lido()]].forEach(([x, y]) => {
    const m = A.P.mesclar(copia(x), copia(y));
    igual(m.bosque, { acertos: 32, espada: 1, vencidos: 32 });
    igual(m.bosquePontos, { 2: { h: 'velocidade', em: 2000 }, 3: { h: 'vida', em: 1000 } }, 'a escolha mais nova');
    const J = jogo({ save: m });
    igual(J.B.pontos(), { forca: 0, vida: 1, velocidade: 1 });
    igual(J.B.pontosPendentes(), [4]);
    const p = J.B.pontos();
    assert.strictEqual(p.forca + p.vida + p.velocidade + J.B.pontosPendentes().length, J.B.nivel() - 1, 'um ponto por nível, nem mais nem menos');
  });
});

test('bosque: aparelho de versão antiga (sem os campos) não apaga nada', () => {
  const A = jogo({ agora: 1000 });
  comAcertos(A, 22);
  A.B.ganharEspada();
  assert.ok(A.B.porPonto(2, 'vida'));
  A.P.salvar();
  const velho = A.lido();
  delete velho.bosque; delete velho.bosquePontos;
  [[A.lido(), velho], [velho, A.lido()]].forEach(([x, y]) => {
    const m = A.P.mesclar(copia(x), copia(y));
    igual(m.bosque, A.lido().bosque);
    igual(m.bosquePontos, A.lido().bosquePontos);
  });
});

test('bosque: pergunta só do bimestre atual (não arquivada), sala feita ou não, todo tipo menos os de fora do config, sem livre', () => {
  const j = jogo(), B = j.B, R = j.R;
  assert.strictEqual(R.Bimestres.atual, 4);
  assert.deepStrictEqual([...R.config.fantasmas.perguntaForaTipos], ['memoria', 'desenho', 'cacaPalavras']);
  igual(B.perguntas().map((p) => p.desafio.id), VALEM);
  j.P.estado().salas.a1 = { vezes: 1, melhor: 6, feita: 1 };
  igual(B.perguntas().map((p) => p.desafio.id), VALEM, 'sala feita não muda nada');
  const p = B.pergunta();
  assert.ok(VALEM.includes(p.desafio.id));
  assert.ok(p.materia.id && p.sala.id, '{ materia, sala, desafio }');
  // o sorteio é UM só, sobre a lista inteira (e não matéria, depois sala), pela chave do modo congelado
  const visto = [];
  const orig = R.util.sortear;
  R.util.sortear = (l, k) => { visto.push([l.map((x) => x.desafio.id), k]); return l[0]; };
  B.pergunta();
  R.util.sortear = orig;
  igual(visto, [[VALEM, 'bosque:pergunta']]);
  R.Bimestres.atual = 3;
  igual(B.perguntas().map((x) => x.desafio.id), ['c1-1', 'c1-2'], 'outro bimestre: as matérias dele');
  R.Bimestres.atual = 7;
  assert.strictEqual(B.pergunta(), null, 'nenhuma pergunta');
});

test('bosque: o sorteio é uniforme por pergunta (a matéria com mais perguntas sai mais)', () => {
  const j = jogo(), B = j.B, n = 18000, conta = {};
  for (let i = 0; i < n; i++) { const id = B.pergunta().desafio.id; conta[id] = (conta[id] || 0) + 1; }
  igual(Object.keys(conta).sort(), VALEM.slice().sort(), 'todas saem, nenhuma de fora');
  const esperado = n / VALEM.length;   // ~1636 cada
  VALEM.forEach((id) => assert.ok(Math.abs(conta[id] - esperado) < esperado * 0.15, id + ': ' + conta[id] + ' (esperado ~' + esperado + ')'));
  // q4b tem 6 das 11: ~6/11 (sortear a matéria primeiro daria ~1/2)
  const q4b = VALEM.filter((id) => id.startsWith('b1')).reduce((s, id) => s + conta[id], 0) / n;
  assert.ok(Math.abs(q4b - 6 / 11) < 0.03, 'fração da q4b: ' + q4b);
});

test('bosque: móvel da casa por nível: sem casa nada; com casa, as salas e depois bosque:2..atual', () => {
  const j = jogo(), B = j.B, CM = j.CM;
  comAcertos(j, 31);   // nível 4
  j.P.estado().salas.a1 = { vezes: 1, melhor: 6, feita: 1 };
  igual(CM.pendentes(), [], 'sem a casa, nada');
  j.R.Casa.abrirBau();
  igual(CM.pendentes(), ['a1', 'bosque:2', 'bosque:3', 'bosque:4'], 'as salas primeiro, depois os níveis');
  assert.strictEqual(CM.titulo('a1'), 'Presente da sala “Sala A1”', 'o texto das salas não muda');
  assert.strictEqual(CM.titulo('bosque:3'), 'Presente do nível 3');
  assert.strictEqual(CM.titulo('bosque:9'), '', 'nível que não chegou: de ninguém');
  assert.strictEqual(CM.escolher('bosque:9', CM.opcoes('bosque:9')[0]), false);
  const m = CM.opcoes('bosque:3')[0];
  assert.strictEqual(CM.escolher(B.chaveMovel(3), m), true);
  igual(CM.pendentes(), ['a1', 'bosque:2', 'bosque:4']);
  assert.strictEqual(CM.qtd(m), 1, 'o móvel do nível conta como peça');
  assert.strictEqual(CM.registrarFonte({ id: 'bosque', chaves: () => [], titulo: () => '' }), false, 'fonte repetida');
  // nível 1: nenhuma chave
  const k = jogo();
  k.R.Casa.abrirBau();
  igual(k.CM.pendentes(), []);
});

test('bosque: o móvel do nível só entre os que ela ainda não tem (sem repetido); com todos, o nível fica sem móvel', () => {
  const j = jogo({ agora: 1790000000000 }), CM = j.CM, cm = () => j.P.estado().casaMoveis;
  comAcertos(j, 31);   // nível 4
  j.P.estado().salas.a1 = { vezes: 1, melhor: 6, feita: 1 };
  j.R.Casa.abrirBau();
  assert.strictEqual(j.R.config.casa.moveisOpcoes, 5);
  assert.strictEqual(CM.opcoes('bosque:2').length, 5, 'todos novos: as 5 de sempre');
  // ela tem 4 dos 6 (de outras chaves) e a sala a1 pendente: faltam 2, a sala leva 1, o nível 2 fica com o outro
  ['pufe', 'vaso', 'piano', 'globo'].forEach((m, i) => { cm()['zz' + i] = { movel: m, em: 1 }; });
  igual(CM.pendentes(), ['a1', 'bosque:2'], 'só o que pode virar móvel novo');
  igual(CM.opcoes('bosque:2').slice().sort(), ['fonte', 'urso'], 'só os que ela não tem, sem completar');
  assert.strictEqual(CM.opcoes('a1').length, 5, 'sala: completa com repetidos, como sempre');
  assert.strictEqual(CM.escolher('bosque:3', 'urso'), false, 'nível fora da fila');
  assert.strictEqual(CM.escolher('bosque:2', 'pufe'), false, 'repetido não vale no nível');
  // na sala ela escolhe um repetido: os 2 novos voltam para os níveis
  assert.ok(CM.escolher('a1', CM.opcoes('a1').find((m) => CM.qtd(m) > 0)));
  igual(CM.pendentes(), ['bosque:2', 'bosque:3']);
  assert.ok(CM.escolher('bosque:3', 'urso'));
  igual(CM.pendentes(), ['bosque:2'], 'o nível 4 não entra: falta só 1 móvel');
  igual(CM.opcoes('bosque:2'), ['fonte']);
  // com todos os móveis: nenhum nível pendente
  assert.ok(CM.escolher('bosque:2', 'fonte'));
  igual(CM.pendentes(), [], 'nível 4 fica sem móvel');
  assert.strictEqual(CM.titulo('bosque:4'), '');
  assert.strictEqual(CM.escolher('bosque:4', CM.opcoes('bosque:4')[0]), false);
  j.P.estado().salas.b1 = { vezes: 1, melhor: 6, feita: 1 };
  igual(CM.pendentes(), ['b1'], 'a sala ainda dá móvel (Mais um!)');
  assert.strictEqual(CM.opcoes('b1').length, 5);
});

test('bosque: a fila de móveis do nível tem no máximo os móveis que faltam, menos as salas pendentes (níveis mais baixos primeiro)', () => {
  const j = jogo({ agora: 1790000000000 }), CM = j.CM, cm = () => j.P.estado().casaMoveis;
  comAcertos(j, 395);   // nível 40
  j.R.Casa.abrirBau();
  igual(CM.pendentes(), ['bosque:2', 'bosque:3', 'bosque:4', 'bosque:5', 'bosque:6', 'bosque:7'], 'nenhum móvel: 6 níveis, não 39');
  // 4 dos 6 já ganhos (o do nível 2 é um deles): faltam 2, nos níveis mais baixos ainda sem móvel
  ['pufe', 'vaso', 'piano'].forEach((m, i) => { cm()['zz' + i] = { movel: m, em: 1 }; });
  cm()['bosque:2'] = { movel: 'globo', em: 1 };
  igual(CM.pendentes(), ['bosque:3', 'bosque:4'], '"1 de 2", não "1 de 39"');
  assert.strictEqual(CM.titulo('bosque:3'), 'Presente do nível 3');
  assert.strictEqual(CM.titulo('bosque:5'), '', 'fora da fila: de ninguém');
  // salas pendentes descontam (a sala oferece os novos primeiro)
  j.P.estado().salas.a1 = { vezes: 1, melhor: 6, feita: 1 };
  igual(CM.pendentes(), ['a1', 'bosque:3']);
  j.P.estado().salas.b1 = { vezes: 1, melhor: 6, feita: 1 };
  igual(CM.pendentes(), ['a1', 'b1'], 'as salas levam os 2 que faltam');
  j.P.estado().salas.a2 = { vezes: 1, melhor: 6, feita: 1 };
  igual(CM.pendentes(), ['a1', 'a2', 'b1'], 'mais salas que móveis novos: nenhum nível');
  igual(CM.salasPendentes(), ['a1', 'a2', 'b1']);
  assert.strictEqual(CM.escolhida('bosque:2'), true);
  assert.strictEqual(CM.escolhida('bosque:3'), false);
});
