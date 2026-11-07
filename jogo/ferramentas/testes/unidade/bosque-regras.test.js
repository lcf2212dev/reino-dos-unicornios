// Testes de unidade: as regras e o save do Bosque dos Fantasmas (js/sistemas/bosque.js, Reino.Bosque) e o móvel
// surpresa da casa (CasaMoveis.presente/guardar, js/sistemas/casa-moveis.js). Contratos: docs/contratos/bosque.md §4,
// §5, arenas.md e casa.md §12. XP por inimigo (curva de config.fantasmas.xpNivel), pergunta a cada terço do nível, o
// placar antigo de mortos (30 por nível, pergunta a cada 10) vira XP sem perder o nível nem abrir presentes retroativos. O jogo inteiro (todos os `node: true`) num vm com save
// sintético (ajudantes/jogo-save.js); nada toca no save real. Matérias, casa e móveis sintéticos.
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
// mortos do placar ANTIGO e blocos de pergunta já consumidos (migrado = 1: não deixa a migração por acertos mexer);
// zera os contadores novos (abates, xp, tercos): o XP vem todo do placar antigo (xpLegado)
function comMortos(j, n, feitas) {
  const b = j.P.estado().bosque;
  b.mortos = n; b.migrado = 1; b.abates = 0; b.xp = 0; b.tercos = 0;
  b.perguntasFeitas = feitas === undefined ? Math.floor(n / 10) : feitas;
}

test('bosque: campos registrados (contadores e carimbo), mantêm no Novo ciclo, na cópia; save antigo ganha o padrão', () => {
  const j = jogo({ save: saveHoje() }), I = j.R._progresso;
  ['bosque', 'bosquePontos'].forEach((c) => assert.ok(j.P.camposRegistrados().includes(c), c));
  assert.strictEqual(I.campos.bosque.mesclar, 'contadores');
  assert.strictEqual(I.campos.bosquePontos.mesclar, 'carimbo');
  ['bosque', 'bosquePontos'].forEach((c) => {
    assert.strictEqual(I.campos[c].novoCiclo, 'mantem', c);
    assert.strictEqual(I.campos[c].copiaSeguranca, true, c);
  });
  igual(j.P.estado().bosque, { acertos: 0, espada: 0, vencidos: 0, mortos: 0, perguntasFeitas: 0, migrado: 0 });
  igual(j.P.estado().bosquePontos, {});
  assert.strictEqual(j.B.nivel(), 1);
  igual(j.B.xp(), { n: 0, de: 300, maximo: false });
  igual(j.B.proximaPergunta(), { n: 0, de: 100, pct: 0, marca: 1 });
  assert.strictEqual(j.B.perguntasPendentes(), 0);
  igual(j.B.pontosPendentes(), []);
});

test('bosque: o placar antigo de mortos (30 por nível) vira XP no mesmo nível e fração; nível máximo 1000; a mosca conta 2', () => {
  const j = jogo(), B = j.B, cfg = j.R.config.fantasmas;
  assert.strictEqual(cfg.mortosPorNivel, 30);
  assert.strictEqual(cfg.perguntasPorBloco, 10);
  assert.strictEqual(cfg.nivelMax, 1000);
  comMortos(j, 29);
  assert.strictEqual(B.nivel(), 1);
  igual(B.xp(), { n: 290, de: 300, maximo: false });
  comMortos(j, 30);
  assert.strictEqual(B.nivel(), 2);
  igual(B.xp(), { n: 0, de: 330, maximo: false });
  comMortos(j, 67);
  assert.strictEqual(B.nivel(), 3);
  igual(B.xp(), { n: 84, de: 360, maximo: false }, '7 de 30 = 84 de 360');
  comMortos(j, 29969);
  assert.strictEqual(B.nivel(), 999);
  comMortos(j, 29970);
  assert.strictEqual(B.nivel(), 1000);
  igual(B.xp(), { n: 30270, de: 30270, maximo: true }, 'no máximo, a barra cheia');
  comMortos(j, 50000);
  assert.strictEqual(B.nivel(), 1000);
  assert.strictEqual(B.mortos(), 50000);
  assert.strictEqual(B.pontosPendentes().length, 999, 'um ponto por nível, do 2 ao 1000');
  // estragado: mortos que não é número conta 0
  j.P.estado().bosque.mortos = { a: 3 };
  assert.strictEqual(B.nivel(), 1);
  // a mosca vale 2 no placar
  const k = jogo();
  igual(k.B.abater('mosca'), { mortos: 2, perguntas: 0, subiu: null, premioNivel: null, xp: 25 });
  igual(k.B.abater('facil'), { mortos: 3, perguntas: 0, subiu: null, premioNivel: null, xp: 10 });
});

test('bosque: migração do save antigo mantém o nível, não abre pergunta nem presente retroativo e roda uma vez', () => {
  const s = Object.assign(saveHoje(), { bosque: { acertos: 25, espada: 1, vencidos: 40 }, bosquePontos: {} });
  const j = jogo({ save: s }), b = () => j.P.estado().bosque;
  assert.strictEqual(j.B.nivel(), 3, '25 acertos = nível 3 no save antigo');
  igual(b(), { acertos: 25, espada: 1, vencidos: 40, mortos: 60, perguntasFeitas: 6, migrado: 1 });
  assert.strictEqual(j.B.perguntasPendentes(), 0, 'nenhuma pergunta retroativa');
  j.R.Casa.abrirBau();
  igual(j.CM.pendentes(), [], 'nenhum móvel retroativo na fila');
  // um acerto novo de verdade no nível 3 (o piso legado é 60) não mexe no nível; mortos novos sim
  b().acertos = 26;
  assert.strictEqual(j.B.nivel(), 3);
  b().mortos = 90;
  assert.strictEqual(j.B.nivel(), 4);
  // a migração não perde o que já estava maior e não roda de novo
  const antes = copia(b());
  assert.strictEqual(j.R.modulo('bosque').iniciar(), false);
  igual(b(), antes);
  // nível antigo com o ponto pendente: o presente sai na hora de pôr o ponto (sob demanda), não em fila
  igual(j.B.pontosPendentes(), [2, 3, 4]);
  assert.strictEqual(j.CM.escolhida('bosque:2'), false);
  const p = j.CM.presente('bosque:2');
  assert.strictEqual(p.chave, 'bosque:2');
  assert.strictEqual(j.CM.escolhida('bosque:2'), true);
  assert.strictEqual(j.CM.pendentes().indexOf('bosque:2'), -1, 'fora da fila das salas');
});

test('bosque: abater soma o placar, salva, emite e, ao subir de nível, já grava o móvel do nível', () => {
  const j = jogo(), B = j.B, P = j.P;
  comMortos(j, 9);
  const salvar = j.contagem.salvar;
  const r = B.abater('facil');
  assert.strictEqual(r.mortos, 10);
  assert.strictEqual(r.perguntas, 1);
  assert.strictEqual(r.subiu, null);
  assert.strictEqual(r.premioNivel, null);
  assert.ok(j.contagem.salvar > salvar, 'salvou');
  igual(j.bosque.filter((c) => c.tipo === 'abate').map((c) => [c.mortos, c.subiu]), [[10, null]]);
  // mosca no 29: 31 mortos, subiu ao nível 2 e o móvel bosque:2 já está no save
  comMortos(j, 28, 2);
  const r2 = B.abater('mosca');
  assert.deepStrictEqual([r2.mortos, r2.perguntas, r2.subiu], [30, 1, 2]);
  assert.strictEqual(r2.premioNivel.chave, 'bosque:2');
  assert.ok(MOVEIS.some((m) => m.id === r2.premioNivel.movel));
  assert.strictEqual(j.CM.escolhida('bosque:2'), true, 'gravado antes do baú');
  igual(j.bosque.filter((c) => c.tipo === 'abate').map((c) => [c.mortos, c.subiu]), [[10, null], [30, 2]]);
  assert.strictEqual(B.pontosPendentes()[0], 2);
});

test('bosque: acertou dá estrela e Aura, consome UMA pergunta e grava o móvel; errou consome sem prêmio', () => {
  const j = jogo(), B = j.B, P = j.P;
  comMortos(j, 10, 0);
  const estrelas = P.estrelas(), salvar = j.contagem.salvar;
  const r = B.acertou('q4a');
  assert.deepStrictEqual([r.estrelas, r.nivel], [1, 1]);
  assert.strictEqual(r.presente.chave, 'bosque:p1');
  assert.ok(MOVEIS.some((m) => m.id === r.presente.movel));
  assert.strictEqual(P.estrelas(), estrelas + 1);
  assert.ok(j.contagem.salvar > salvar, 'salvou');
  const bq = j.P.estado().bosque;
  assert.deepStrictEqual([B.acertos(), bq.acertos, bq.certas, bq.vencidos, bq.perguntasFeitas, bq.tercos], [1, 0, 1, 1, 0, 1], 'a versão nova soma certas e tercos, não os contadores antigos');
  assert.strictEqual(B.perguntasPendentes(), 0);
  assert.strictEqual(j.CM.escolhida('bosque:p1'), true);
  igual(j.bosque.filter((c) => c.tipo === 'acerto').map((c) => c.presente.chave), ['bosque:p1']);
  // sem pergunta pendente: estrela sim, móvel não, e não cria bloco
  const r2 = B.acertou('q4b');
  assert.strictEqual(r2.presente, null);
  assert.strictEqual(j.P.estado().bosque.tercos, 1);
  // errou: consome a pergunta pendente, conta o vencido e não dá prêmio
  comMortos(j, 20, 1);
  const antes = copia(j.P.estado().bosque);
  B.errou('q4a');
  igual(j.P.estado().bosque, Object.assign(antes, { vencidos: antes.vencidos + 1, tercos: 1 }));
  assert.strictEqual(B.perguntasPendentes(), 0);
  // consumirPergunta: sem prêmio, true só quando havia uma pendente
  comMortos(j, 30, 2);
  assert.strictEqual(B.consumirPergunta(), true);
  assert.strictEqual(B.consumirPergunta(), false);
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
  comMortos(j, 90);   // nível 4: pontos dos níveis 2, 3 e 4
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
  comMortos(j, 3000);
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
  igual(j2.P.estado().bosque, { acertos: 0, espada: 0, vencidos: 0, mortos: 0, perguntasFeitas: 0, migrado: 0 });
  igual(j2.P.estado().bosquePontos, {});
});

test('bosque: dois aparelhos escolhem o mesmo nível: a mescla guarda uma escolha por nível (nenhum ponto sobra)', () => {
  const base = Object.assign(saveHoje(), { bosque: { acertos: 30, espada: 1, vencidos: 30, mortos: 90, perguntasFeitas: 9, migrado: 1 }, bosquePontos: {} });
  const A = jogo({ save: copia(base), agora: 1000 }), B = jogo({ save: copia(base), agora: 2000 });
  assert.ok(A.B.porPonto(2, 'forca'));
  assert.ok(A.B.porPonto(3, 'vida'));
  assert.ok(B.B.porPonto(2, 'velocidade'));
  B.B.acertou('q4a'); B.B.acertou('q4a');
  A.P.salvar(); B.P.salvar();
  [[A.lido(), B.lido()], [B.lido(), A.lido()]].forEach(([x, y]) => {
    const m = A.P.mesclar(copia(x), copia(y));
    igual(m.bosque, { acertos: 30, espada: 1, vencidos: 32, mortos: 90, perguntasFeitas: 9, migrado: 1, certas: 2 });
    igual(m.bosquePontos, { 2: { h: 'velocidade', em: 2000 }, 3: { h: 'vida', em: 1000 } }, 'a escolha mais nova');
    const J = jogo({ save: m });
    igual(J.B.pontos(), { forca: 0, vida: 1, velocidade: 1 });
    igual(J.B.pontosPendentes(), [4]);
    const p = J.B.pontos();
    assert.strictEqual(p.forca + p.vida + p.velocidade + J.B.pontosPendentes().length, J.B.nivel() - 1, 'um ponto por nível, nem mais nem menos');
  });
});

test('bosque: a mescla dos campos novos é por contador (o maior; nada regride)', () => {
  const a = Object.assign(saveHoje(), { bosque: { acertos: 3, espada: 1, vencidos: 4, mortos: 20, perguntasFeitas: 1, migrado: 0 } });
  const b = Object.assign(saveHoje(), { bosque: { acertos: 2, espada: 0, vencidos: 9, mortos: 50, perguntasFeitas: 2, migrado: 1 } });
  const j = jogo({ save: a });
  const m = j.P.mesclar(copia(a), copia(b));
  igual(m.bosque, { acertos: 3, espada: 1, vencidos: 9, mortos: 50, perguntasFeitas: 2, migrado: 1 });
});

test('bosque: aparelho novo (migrado=1, mortos=0) + save antigo na mescla: o nível antigo sobe o piso, não regride nem abre pergunta retroativa', () => {
  // o aparelho novo já gravou uma vez (migrado=1) mas nunca jogou o Bosque; o antigo tem 25 acertos = nível 3
  const novo = Object.assign(saveHoje(), { bosque: { acertos: 0, espada: 0, vencidos: 0, mortos: 0, perguntasFeitas: 0, migrado: 1 } });
  const antigo = Object.assign(saveHoje(), { bosque: { acertos: 25, espada: 1, vencidos: 40 }, bosquePontos: {} });
  const j = jogo({ save: novo });
  const m = j.P.mesclar(copia(novo), copia(antigo));
  const k = jogo({ save: m });
  assert.strictEqual(k.B.nivel(), 3, 'o piso do nível antigo é reaplicado mesmo com migrado=1');
  igual(k.P.estado().bosque, { acertos: 25, espada: 1, vencidos: 40, mortos: 60, perguntasFeitas: 6, migrado: 1 });
  assert.strictEqual(k.B.perguntasPendentes(), 0, 'nada retroativo');
  // e de novo não muda (idempotente)
  const antes = copia(k.P.estado().bosque);
  assert.strictEqual(k.R.modulo('bosque').iniciar(), false);
  igual(k.P.estado().bosque, antes);
});

test('bosque: aparelho de versão antiga (sem os campos) não apaga nada', () => {
  const A = jogo({ agora: 1000 });
  comMortos(A, 45, 4);
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

test('pergunta sozinha (quarto-bimestre.md §12.1): avulsa false fica só na sala; avulsa.carta troca o Leia antes', () => {
  const j = jogo(), B = j.B, R = j.R, m = R.materias.find((x) => x.id === 'q4b');
  m.livro = [{ id: 'pg1', titulo: 'Página 1' }, { id: 'pg2', titulo: 'Página 2' }];
  const ds = m.salas[0].desafios;
  ds[0].avulsa = false;
  igual(B.perguntas().map((p) => p.desafio.id), VALEM.filter((id) => id !== 'b1-1'), 'avulsa: false sai do sorteio');
  ds[1].livro = 'pg2';
  assert.strictEqual(R.cartaAvulsa(m, ds[1]).id, 'pg2', 'sem avulsa: a carta livro');
  ds[1].avulsa = { carta: 'pg1' };
  assert.strictEqual(R.cartaAvulsa(m, ds[1]).id, 'pg1', 'avulsa.carta: a outra carta');
  ds[1].avulsa = { carta: null };
  assert.strictEqual(R.cartaAvulsa(m, ds[1]), null, 'avulsa.carta null: nenhuma');
  assert.ok(B.perguntas().some((p) => p.desafio.id === 'b1-2'), 'com carta trocada continua no sorteio');
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

test('bosque: o presente do nível grava o móvel fora da fila, prefere os novos e, com todos, dá mais um igual', () => {
  const j = jogo(), B = j.B, CM = j.CM, cm = () => j.P.estado().casaMoveis;
  comMortos(j, 90, 9);   // nível 4
  assert.strictEqual(CM.titulo('bosque:p1'), 'Presente do Bosque');
  assert.strictEqual(CM.titulo('bosque:2'), '');
  // sem casa, o presente já grava (fica guardado até ela ganhar a casa)
  const p1 = CM.presente('bosque:2');
  assert.strictEqual(p1.chave, 'bosque:2');
  assert.ok(MOVEIS.some((m) => m.id === p1.movel));
  assert.strictEqual(CM.escolhida('bosque:2'), true);
  assert.strictEqual(CM.qtd(p1.movel), 1);
  igual(CM.presente('bosque:2'), p1, 'a chave já com móvel devolve o mesmo, sem trocar');
  j.R.Casa.abrirBau();
  igual(CM.pendentes(), [], 'os níveis não entram na fila das salas');
  j.P.estado().salas.a1 = { vezes: 1, melhor: 6, feita: 1 };
  igual(CM.pendentes(), ['a1'], 'só a sala');
  // prefere os que ela ainda não tem: 4 dos outros 5 já ganhos (o do nível 2 é o 6º)
  MOVEIS.map((m) => m.id).filter((id) => id !== p1.movel).slice(0, 4).forEach((m, i) => { cm()['zz' + i] = { movel: m, em: 1 }; });
  const faltam = MOVEIS.map((m) => m.id).filter((id) => !CM.qtd(id));
  const p2 = CM.presente('bosque:3');
  assert.ok(faltam.includes(p2.movel), 'só os que faltam: ' + p2.movel);
  // com todos, mais um igual
  const p3 = CM.presente('bosque:4');
  assert.ok(MOVEIS.some((m) => m.id === p3.movel));
  assert.strictEqual(CM.qtd(p3.movel), 2, 'Mais um!');
  // guardar valida o móvel e não exige a casa
  assert.strictEqual(CM.guardar('bosque:5', 'inexistente'), false);
  assert.strictEqual(CM.guardar('bosque:5', 'piano'), true);
  assert.strictEqual(CM.escolhida('bosque:5'), true);
});

test('bosque: o presente é determinístico (mesma chave e mesmo estado, mesmo móvel)', () => {
  const a = jogo({ agora: 1790000000000 }), b = jogo({ agora: 1790000000000 });
  comMortos(a, 30); comMortos(b, 30);
  a.R.Casa.abrirBau(); b.R.Casa.abrirBau();
  igual(a.CM.presente('bosque:2'), b.CM.presente('bosque:2'));
  igual(a.CM.presente('bosque:p1'), b.CM.presente('bosque:p1'));
});
