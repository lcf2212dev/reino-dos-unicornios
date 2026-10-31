// Testes de unidade: a casa do jogador no save e nas regras (js/sistemas/casa.js; docs/contratos/casa.md §6–§8).
// O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js); nada toca no save real.
// O prédio e os kits de verdade vêm de outras frentes: aqui um interior `casa`/`casa-2`, 2 kits e 3 matérias sintéticos.
// Rodar: node --test jogo/ferramentas/testes/unidade/casa.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje, copia } = require('./ajudantes/jogo-save');

const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);

/* Térreo 16×10: estar (x 1..7) | coluna fechada x=8 com a porta em (8,6) | cozinha (x 9..14). Paredes nas linhas 1–2.
   Spawn (4,8), saída (4,9), caixa interativa em (2,3), escada para cima em (12,3) (chega em (12,4)).
   Em cima 10×8: quarto (x 1..8, chão y 3..6), escada em (2,3), chega em (2,4). */
const CASA = {
  id: 'casa', lugar: 'casa', entrada: true, tamanho: { w: 16, h: 10 },
  comodos: [{ id: 'estar', rect: { x: 1, y: 1, w: 7, h: 8 } }, { id: 'cozinha', rect: { x: 9, y: 1, w: 6, h: 8 } }],
  portas: [{ x: 8, y: 6 }],
  objetos: [{ tipo: 't-caixa', x: 2, y: 3, acao: { tipo: 'casaDecorar' } }],
  npcs: [], spawn: { x: 4, y: 8 }, saida: { x: 4, y: 9 },
  escadas: [{ x: 12, y: 3, para: 'casa-2', chegar: { x: 0, y: 1 }, olhar: { x: 0, y: 1 }, sentido: 'sobe' }],
};
const CASA2 = {
  id: 'casa-2', lugar: 'casa', tamanho: { w: 10, h: 8 },
  comodos: [{ id: 'quarto', rect: { x: 1, y: 1, w: 8, h: 6 } }],
  portas: [], objetos: [], npcs: [], spawn: { x: 5, y: 5 },
  escadas: [{ x: 2, y: 3, para: 'casa', chegar: { x: 0, y: 1 }, olhar: { x: 0, y: 1 }, sentido: 'desce' }],
};
const LIB = {
  't-caixa': { w: 1, h: 1, solido: 'base' },
  't-sofa': { w: 3, h: 2, solido: 'base' },
  't-quadro': { w: 1, h: 1, parede: true },
  't-tapete': { w: 2, h: 2, solido: false, plano: true },
  't-cadeira': { w: 1, h: 1, solido: 'base' },
  't-cama': { w: 2, h: 3, solido: true },
};
const KITS = [
  { id: 'estar', nome: 'Sala de Estar', capa: 't-sofa', comodo: 'estar', itens: [
    { id: 'sofa', nome: 'Sofá', objeto: 't-sofa', direcoes: 4 },
    { id: 'quadro', nome: 'Quadro', objeto: 't-quadro', direcoes: 1, parede: true },
    { id: 'tapete', nome: 'Tapete', objeto: 't-tapete', direcoes: 2 },
    { id: 'cadeira', nome: 'Cadeira', objeto: 't-cadeira', qtd: 2, direcoes: 4 },
  ] },
  { id: 'quarto-uni', nome: 'Quarto de {uni}', capa: 't-cama', comodo: 'quarto', itens: [
    { id: 'cama', nome: 'Cama', objeto: 't-cama', direcoes: 4 },
  ] },
];
const MATERIAS = [
  { id: 't-m3', bimestre: 3, salas: [{ id: 't-s1' }] },
  { id: 't-m4a', bimestre: 4, salas: [{ id: 't-s2' }, { id: 't-s3' }] },
  { id: 't-m4b', bimestre: 4, salas: [{ id: 't-s4' }] },
];

// o jogo com o save sintético e os dados de mentira no lugar dos de verdade
function jogo(opcoes = {}) {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar(opcoes); } finally { Jogo.scripts = orig; }
  const R = j.R;
  R.interiores.splice(0, R.interiores.length, ...R.interiores.filter((d) => d.id !== 'casa' && d.id !== 'casa-2'), copia(CASA), copia(CASA2));
  Object.keys(LIB).forEach((k) => { R.Interiores.OBJETOS[k] = LIB[k]; });
  R.kitsCasa.length = 0;
  KITS.forEach((k) => R.registrarKitCasa(copia(k)));
  R.materias.splice(0, R.materias.length, ...copia(MATERIAS));
  j.refeitos = [];
  R.Interiores.refazer = (id) => j.refeitos.push(id);
  j.P.carregar();
  j.Casa = R.Casa;
  return j;
}
function feita(j, ...salas) { salas.forEach((s) => { j.P.estado().salas[s] = { vezes: 1, melhor: 6, feita: j.relogio.agora }; }); }
// com o kit 'estar' já escolhido
function comEstar(opcoes) { const j = jogo(opcoes); feita(j, 't-s2', 't-s3'); assert.ok(j.Casa.escolherKit('estar')); return j; }
const podeMotivo = (j, ...a) => j.Casa.podeColocar(...a).motivo;

test('casa: kits contam só pelas matérias completas do bimestre >= desdeBimestre', () => {
  const j = jogo({ save: saveHoje() }), C = j.Casa;
  assert.strictEqual(j.R.config.casa.desdeBimestre, 4);
  igual(C.kitsGanhos(), []);
  igual(C.kitsLivres(), ['estar', 'quarto-uni'], 'só os kits registrados, na ordem de config.casa.kits');
  assert.strictEqual(C.kitsPendentes(), 0);
  feita(j, 't-s1');
  assert.strictEqual(C.kitsPendentes(), 0, 'matéria do 3º bimestre não conta');
  feita(j, 't-s2');
  assert.strictEqual(C.kitsPendentes(), 0, 'matéria pela metade não conta');
  feita(j, 't-s3', 't-s4');
  assert.strictEqual(C.kitsPendentes(), 2);
  j.R.materias[1].arquivada = true;
  assert.strictEqual(C.kitsPendentes(), 2, 'arquivada continua contando');
  assert.strictEqual(C.nomeKit('quarto-uni'), 'Quarto de Teste Azul', '{uni} = o nome da montaria');
  assert.strictEqual(C.nomeKit('nao-existe'), '');
});

test('casa: escolher dá o kit à 1ª matéria sem kit; repetido, desconhecido e sem matéria são recusados', () => {
  const j = jogo(), C = j.Casa;
  assert.strictEqual(C.escolherKit('estar'), false, 'sem matéria completa');
  feita(j, 't-s2', 't-s3', 't-s4');
  const antes = j.contagem.salvar;
  assert.strictEqual(C.escolherKit('estar'), true);
  assert.ok(j.contagem.salvar > antes, 'salvou');
  igual(j.P.estado().casaKits, { 't-m4a': { kit: 'estar', em: j.relogio.agora } });
  assert.strictEqual(C.escolherKit('estar'), false, 'kit repetido');
  assert.strictEqual(C.escolherKit('cozinha'), false, 'kit sem registro');
  igual(C.kitsLivres(), ['quarto-uni']);
  assert.strictEqual(C.kitsPendentes(), 1);
  assert.strictEqual(C.escolherKit('quarto-uni'), true);
  igual(j.P.estado().casaKits['t-m4b'].kit, 'quarto-uni');
  assert.strictEqual(C.kitsPendentes(), 0);
  igual(C.kitsGanhos(), ['estar', 'quarto-uni']);
  igual(C.pecas('quarto-uni').map((p) => p.uid), ['quarto-uni.cama.1']);
  igual(C.pecas().map((p) => p.uid), ['estar.sofa.1', 'estar.quadro.1', 'estar.tapete.1', 'estar.cadeira.1', 'estar.cadeira.2', 'quarto-uni.cama.1']);
});

test('casa: colocar válido grava, salva e refaz; inválido diz o motivo e não grava', () => {
  const j = comEstar(), C = j.Casa;
  igual(C.pecas('estar')[0], { uid: 'estar.sofa.1', kit: 'estar', item: 'sofa', objeto: 't-sofa', nome: 'Sofá', direcoes: 4, parede: false, lugar: null });
  igual(C.podeColocar('estar.sofa.1', 'casa', 3, 6, 'baixo'), { ok: true, motivo: null });
  const antes = j.contagem.salvar;
  assert.strictEqual(C.colocar('estar.sofa.1', 'casa', 3, 6, 'baixo'), true);
  assert.ok(j.contagem.salvar > antes);
  igual(j.refeitos, ['casa']);
  igual(j.P.estado().casaItens['estar.sofa.1'], { andar: 'casa', x: 3, y: 6, dir: 'baixo', em: j.relogio.agora });
  igual(C.objetosDoAndar('casa'), [{ tipo: 't-sofa', x: 3, y: 6, w: 3, h: 2, dir: 'baixo' }]);
  igual(C.pecas('estar')[0].lugar, { andar: 'casa', x: 3, y: 6, dir: 'baixo' });
  // fora: fora da grade, na coluna entre os cômodos, metade em cada cômodo, andar que não é da casa
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 20, 5, 'baixo'), 'fora');
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 8, 4, 'baixo'), 'fora');
  assert.strictEqual(podeMotivo(j, 'estar.tapete.1', 'casa', 7, 3, 'baixo'), 'fora');
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'castelo', 3, 4, 'baixo'), 'fora');
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 5, 5, 'esq'), null);
  assert.strictEqual(podeMotivo(j, 'estar.quadro.1', 'casa', 3, 1, 'esq'), 'fora', 'quadro não gira');
  // parede: móvel de chão nas fileiras da parede; quadro no chão
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 5, 2, 'baixo'), 'parede');
  assert.strictEqual(podeMotivo(j, 'estar.quadro.1', 'casa', 5, 4, 'baixo'), 'parede');
  assert.strictEqual(podeMotivo(j, 'estar.quadro.1', 'casa', 5, 1, 'baixo'), null);
  // ocupado: outro móvel, objeto fixo, porta, escada, spawn, chegada da escada
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 4, 7, 'baixo'), 'ocupado');
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 2, 3, 'baixo'), 'ocupado');
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 4, 8, 'baixo'), 'ocupado');
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 12, 3, 'baixo'), 'ocupado');
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 12, 4, 'baixo'), 'ocupado');
  // tapete embaixo do sofá pode; dois tapetes não
  assert.strictEqual(C.colocar('estar.tapete.1', 'casa', 3, 6, 'baixo'), true);
  assert.strictEqual(podeMotivo(j, 'estar.sofa.1', 'casa', 3, 6, 'baixo'), null, 'a própria peça não conta');
  // bloqueia: a cadeira na frente da porta fecha a cozinha e a escada
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 7, 6, 'baixo'), 'bloqueia');
  assert.strictEqual(C.colocar('estar.cadeira.1', 'casa', 7, 6, 'baixo'), false);
  assert.strictEqual(j.P.estado().casaItens['estar.cadeira.1'], undefined, 'recusado não grava');
  // bloqueia: a caixa sem vizinho livre ((1,3), (3,3) e (2,4); em cima dela é parede)
  feita(j, 't-s4');
  assert.ok(C.escolherKit('quarto-uni'));
  assert.strictEqual(C.colocar('estar.cadeira.1', 'casa', 1, 3, 'baixo'), true);
  assert.strictEqual(C.colocar('estar.cadeira.2', 'casa', 3, 3, 'baixo'), true);
  assert.strictEqual(podeMotivo(j, 'quarto-uni.cama.1', 'casa', 1, 4, 'baixo'), 'bloqueia');
  assert.strictEqual(podeMotivo(j, 'estar.tapete.1', 'casa', 1, 4, 'baixo'), null, 'tapete não bloqueia');
  assert.strictEqual(podeMotivo(j, 'estar.sofa.1', 'casa', 1, 4, 'baixo'), null, 'sofá: só a fileira de baixo é sólida');
});

test('casa: a personagem no tile impede; outro andar não', () => {
  const j = comEstar(), C = j.Casa;
  j.ctx.Jogador = { x: 5 * 16 + 8, y: 6 * 16 + 12, tile() { return { x: Math.floor(this.x / 16), y: Math.floor((this.y - 2) / 16) }; } };
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 5, 6, 'baixo'), null, 'cena ativa não é a casa');
  j.cena.atual = { id: 'casa', tipo: 'interior' };
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 5, 6, 'baixo'), 'jogador');
  assert.strictEqual(podeMotivo(j, 'estar.sofa.1', 'casa', 4, 5, 'baixo'), 'jogador');
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 5, 5, 'baixo'), null);
});

test('casa: girar segue config.casa.passoGirar e troca a pegada de lado', () => {
  const j = comEstar(), C = j.Casa;
  igual(j.R.config.casa.passoGirar, ['baixo', 'esq', 'cima', 'dir']);
  igual(['baixo', 'esq', 'cima', 'dir'].map((d) => C.proximaDirecao('estar.sofa.1', d)), ['esq', 'cima', 'dir', 'baixo']);
  igual(['baixo', 'esq'].map((d) => C.proximaDirecao('estar.tapete.1', d)), ['esq', 'baixo'], '2 direções: baixo e esq');
  assert.strictEqual(C.proximaDirecao('estar.quadro.1', 'baixo'), 'baixo', 'de parede não gira');
  assert.strictEqual(podeMotivo(j, 'estar.tapete.1', 'casa', 3, 4, 'cima'), 'fora', 'direção que a peça não aceita');
  assert.strictEqual(C.colocar('estar.sofa.1', 'casa', 4, 4, 'dir'), true);
  igual(C.objetosDoAndar('casa'), [{ tipo: 't-sofa', x: 4, y: 4, w: 2, h: 3, dir: 'dir' }]);
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 6, 4, 'baixo'), null, 'de lado ela tem 2 de largura');
  assert.strictEqual(podeMotivo(j, 'estar.cadeira.1', 'casa', 5, 6, 'baixo'), 'ocupado', 'e 3 de altura');
});

test('casa: guardar grava o guardado (não apaga), salva e refaz o andar; mudar de andar refaz os dois', () => {
  const j = comEstar(), C = j.Casa;
  feita(j, 't-s4');
  assert.ok(C.escolherKit('quarto-uni'));
  assert.ok(C.colocar('quarto-uni.cama.1', 'casa', 10, 4, 'baixo'));
  j.relogio.agora += 1000;
  assert.ok(C.colocar('quarto-uni.cama.1', 'casa-2', 6, 3, 'baixo'));
  igual(j.refeitos, ['casa', 'casa', 'casa-2']);
  assert.strictEqual(podeMotivo(j, 'quarto-uni.cama.1', 'casa-2', 2, 4, 'baixo'), 'ocupado', 'chegada da escada de cima');
  j.relogio.agora += 1000;
  const antes = j.contagem.salvar;
  assert.strictEqual(C.guardar('quarto-uni.cama.1'), true);
  assert.ok(j.contagem.salvar > antes);
  igual(j.P.estado().casaItens['quarto-uni.cama.1'], { guardado: true, em: j.relogio.agora });
  igual(j.refeitos.slice(-1), ['casa-2']);
  igual(C.objetosDoAndar('casa-2'), []);
  assert.strictEqual(C.pecas('quarto-uni')[0].lugar, null);
  assert.strictEqual(C.guardar('quarto-uni.cama.9'), false, 'peça que não existe');
  // o relógio voltou: o carimbo ainda cresce
  j.relogio.agora -= 50000;
  assert.ok(C.colocar('quarto-uni.cama.1', 'casa-2', 6, 3, 'baixo'));
  assert.ok(j.P.estado().casaItens['quarto-uni.cama.1'].em > j.relogio.agora + 40000);
});

test('casa: baú carimba uma vez', () => {
  const j = jogo(), C = j.Casa;
  assert.strictEqual(C.ganhou(), false);
  assert.strictEqual(C.abrirBau(), true);
  const em = j.relogio.agora;
  j.relogio.agora += 5000;
  assert.strictEqual(C.abrirBau(), false);
  igual(j.P.estado().casaBau, { em });
  assert.strictEqual(C.ganhou(), true);
});

test('casa: mescla de 2 aparelhos (A coloca, B guarda depois e vence; kits diferentes para a mesma matéria)', () => {
  const A = comEstar({ agora: 1790000000000 });
  A.Casa.abrirBau();
  assert.ok(A.Casa.colocar('estar.sofa.1', 'casa', 3, 6, 'baixo'));
  assert.ok(A.Casa.colocar('estar.cadeira.1', 'casa', 6, 4, 'baixo'));
  A.P.salvar();
  // B começa do save de A, um pouco depois, e guarda o sofá
  const B = jogo({ save: A.lido(), agora: 1790000060000 });
  B.Casa.abrirBau();
  assert.ok(B.Casa.guardar('estar.sofa.1'));
  B.P.salvar();
  // A, sem saber, move a cadeira (antes do guardar de B)
  A.relogio.agora = 1790000030000;
  assert.ok(A.Casa.colocar('estar.cadeira.1', 'casa', 5, 4, 'baixo'));
  A.P.salvar();
  [[A.lido(), B.lido()], [B.lido(), A.lido()]].forEach(([x, y]) => {
    const m = A.P.mesclar(copia(x), copia(y));
    igual(m.casaItens['estar.sofa.1'], { guardado: true, em: 1790000060000 }, 'o guardar de B é mais novo');
    igual(m.casaItens['estar.cadeira.1'].x, 5, 'a cadeira movida por A fica');
    igual(m.casaBau, { em: 1790000000000 }, 'o baú: o menor em');
    const J = jogo({ save: m });
    igual(J.Casa.objetosDoAndar('casa'), [{ tipo: 't-cadeira', x: 5, y: 4, w: 1, h: 1, dir: 'baixo' }]);
  });
  // kits diferentes para a mesma matéria: o mais novo vence; as peças do kit perdido somem (sem apagar o save)
  const K1 = jogo({ agora: 1000 }), K2 = jogo({ agora: 2000 });
  feita(K1, 't-s2', 't-s3'); feita(K2, 't-s2', 't-s3');
  assert.ok(K1.Casa.escolherKit('estar'));
  assert.ok(K1.Casa.colocar('estar.sofa.1', 'casa', 3, 6, 'baixo'));
  assert.ok(K2.Casa.escolherKit('quarto-uni'));
  K1.P.salvar(); K2.P.salvar();
  const m = K1.P.mesclar(K1.lido(), K2.lido());
  igual(m.casaKits, { 't-m4a': { kit: 'quarto-uni', em: 2000 } });
  assert.ok(m.casaItens['estar.sofa.1'], 'a peça continua no save');
  const J = jogo({ save: m });
  igual(J.Casa.kitsGanhos(), ['quarto-uni']);
  igual(J.Casa.objetosDoAndar('casa'), [], 'peça do kit perdido é ignorada');
  igual(J.Casa.kitsLivres(), ['estar']);
});

test('casa: kit repetido (dois aparelhos) ou desconhecido não gasta a matéria: escolher sobrescreve essa entrada', () => {
  // A dá 'estar' à t-m4a; B dá 'estar' à t-m4b; mesclados, as duas matérias têm o mesmo kit
  const A = jogo({ agora: 1000 }), B = jogo({ agora: 2000 });
  [A, B].forEach((j) => feita(j, 't-s2', 't-s3', 't-s4'));
  assert.ok(A.Casa.escolherKit('estar'));
  B.P.estado().casaKits['t-m4a'] = { kit: 'quarto-uni', em: 10 };   // B escolheu 'quarto-uni' para a m4a antes…
  B.P.estado().casaKits['t-m4b'] = { kit: 'estar', em: 2000 };      // …e 'estar' para a m4b
  A.P.salvar(); B.P.salvar();
  const m = A.P.mesclar(A.lido(), B.lido());
  igual(m.casaKits, { 't-m4a': { kit: 'estar', em: 1000 }, 't-m4b': { kit: 'estar', em: 2000 } });
  const J = jogo({ save: m, agora: 3000 });
  igual(J.Casa.kitsGanhos(), ['estar']);
  assert.strictEqual(J.Casa.kitsPendentes(), 1, 'duas matérias completas, um kit só');
  assert.strictEqual(J.Casa.escolherKit('quarto-uni'), true);
  igual(J.P.estado().casaKits, { 't-m4a': { kit: 'estar', em: 1000 }, 't-m4b': { kit: 'quarto-uni', em: 3000 } }, 'a que repete é sobrescrita');
  assert.strictEqual(J.Casa.kitsPendentes(), 0);
  assert.strictEqual(J.Casa.escolherKit('estar'), false);
  // carimbo novo maior que o antigo, mesmo com o relógio atrás: a escolha vence a mescla
  const V = jogo({ save: m, agora: 500 });
  assert.ok(V.Casa.escolherKit('quarto-uni'));
  igual(V.P.estado().casaKits['t-m4b'], { kit: 'quarto-uni', em: 2001 });
  igual(V.P.mesclar(V.P.estado(), B.lido()).casaKits['t-m4b'].kit, 'quarto-uni');
  // kit desconhecido ou que não é texto (entrada hostil) também não gasta a matéria
  [7, 'kit-do-futuro', null].forEach((kit) => {
    const H = jogo({ save: Object.assign(saveHoje(), { casaKits: { 't-m4a': { kit, em: 5 } } }) });
    feita(H, 't-s2', 't-s3');
    assert.strictEqual(H.Casa.kitsPendentes(), 1, String(kit));
    assert.ok(H.Casa.escolherKit('estar'), String(kit));
    igual(H.P.estado().casaKits['t-m4a'].kit, 'estar');
  });
});

test('casa: entrada hostil (kit não texto, uid __proto__/constructor, x/y em texto) não quebra nem polui', () => {
  const s = Object.assign(saveHoje(), {
    casaKits: JSON.parse('{"__proto__":{"kit":"estar","em":9},"constructor":{"kit":"estar","em":9},"t-m4a":{"kit":{"x":1},"em":3}}'),
    casaItens: JSON.parse('{"__proto__":{"andar":"casa","x":3,"y":4,"dir":"baixo","em":9},"constructor":{"andar":"casa","x":3,"y":4,"dir":"baixo","em":9},' +
      '"estar.sofa.1":{"andar":"casa","x":"3","y":"6","dir":"baixo","em":9},"estar.cadeira.1":{"andar":"__proto__","x":3,"y":4,"dir":"baixo","em":9}}'),
  });
  const j = jogo({ save: s });
  feita(j, 't-s2', 't-s3');
  assert.strictEqual(({}).poluido, undefined);
  igual(j.Casa.kitsGanhos(), []);
  assert.ok(j.Casa.escolherKit('estar'), 'a matéria com kit estragado ganha a escolha');
  igual(j.Casa.objetosDoAndar('casa'), [], 'x/y em texto e andar estranho contam como guardados');
  assert.strictEqual(j.Casa.podeColocar('estar.sofa.1', 'casa', '3', 6, 'baixo').motivo, 'fora');
  assert.strictEqual(j.Casa.podeColocar('__proto__', 'casa', 3, 6, 'baixo').motivo, 'fora');
  assert.strictEqual(j.Casa.colocar('constructor', 'casa', 3, 6, 'baixo'), false);
  assert.strictEqual(j.Casa.guardar('__proto__'), false);
  assert.strictEqual(j.Casa.escolherKit({ toString: () => 'jantar' }), false);
  assert.strictEqual(j.Casa.guardar('estar.cadeira.1'), true);
  igual(j.refeitos, [], 'guardar uma peça que não estava na casa não refaz andar nenhum');
  assert.ok(j.Casa.colocar('estar.sofa.1', 'casa', 3, 6, 'baixo'));
  igual(j.Casa.objetosDoAndar('casa'), [{ tipo: 't-sofa', x: 3, y: 6, w: 3, h: 2, dir: 'baixo' }]);
});

test('casa: save antigo sem os campos carrega com os padrões', () => {
  const s = saveHoje();
  ['casaBau', 'casaKits', 'casaItens'].forEach((k) => assert.ok(!(k in s)));
  const j = jogo({ save: s }), e = j.P.estado();
  igual([e.casaBau, e.casaKits, e.casaItens], [{}, {}, {}]);
  assert.strictEqual(j.Casa.ganhou(), false);
  igual(j.Casa.kitsGanhos(), []);
  igual(j.Casa.pecas(), []);
  igual(j.Casa.objetosDoAndar('casa'), []);
  // estragado volta ao padrão / é ignorado na leitura
  const j2 = jogo({ save: Object.assign(saveHoje(), { casaBau: 'x', casaKits: [1], casaItens: { 'estar.sofa.1': { andar: 'casa', x: 'a', y: 3, dir: 'baixo', em: 1 } } }) });
  igual([j2.P.estado().casaBau, j2.P.estado().casaKits], [{}, {}]);
  igual(j2.Casa.objetosDoAndar('casa'), []);
});

test('casa: peça órfã ignorada; duas no mesmo tile: a mais nova fica, a outra conta como guardada (sem gravar)', () => {
  const j = comEstar(), C = j.Casa, itens = j.P.estado().casaItens;
  itens['quarto-uni.cama.1'] = { andar: 'casa', x: 10, y: 4, dir: 'baixo', em: 50 };   // kit que ela não tem
  itens['estar.nada.1'] = { andar: 'casa', x: 10, y: 6, dir: 'baixo', em: 50 };        // item que não existe
  itens['estar.cadeira.3'] = { andar: 'casa', x: 11, y: 6, dir: 'baixo', em: 50 };     // além da qtd
  itens['estar.sofa.1'] = { andar: 'casa', x: 10, y: 5, dir: 'cima', em: 50 };         // direção válida
  itens['estar.tapete.1'] = { andar: 'casa', x: 3, y: 5, dir: 'cima', em: 50 };        // direção que o tapete não tem
  itens['estar.cadeira.1'] = { andar: 'casa', x: 5, y: 5, dir: 'baixo', em: 100 };
  itens['estar.cadeira.2'] = { andar: 'casa', x: 5, y: 5, dir: 'esq', em: 200 };
  const antes = copia(itens);
  igual(C.objetosDoAndar('casa'), [
    { tipo: 't-cadeira', x: 5, y: 5, w: 1, h: 1, dir: 'esq' },
    { tipo: 't-sofa', x: 10, y: 5, w: 3, h: 2, dir: 'cima' },
  ]);
  const lugar = Object.fromEntries(C.pecas().map((p) => [p.uid, p.lugar]));
  assert.strictEqual(lugar['estar.cadeira.1'], null);
  igual(lugar['estar.cadeira.2'], { andar: 'casa', x: 5, y: 5, dir: 'esq' });
  assert.strictEqual(lugar['estar.tapete.1'], null);
  igual(j.P.estado().casaItens, antes, 'derivado: nada gravado');
  // a perdedora pode ser colocada em outro lugar
  assert.strictEqual(C.colocar('estar.cadeira.1', 'casa', 6, 5, 'baixo'), true);
  assert.strictEqual(C.objetosDoAndar('casa').length, 3);
  assert.strictEqual(C.comodoEm('casa', 3, 4), 'estar');
  assert.strictEqual(C.comodoEm('casa', 10, 4), 'cozinha');
  assert.strictEqual(C.comodoEm('casa', 8, 4), null);
  assert.strictEqual(C.comodoEm('casa', 99, 4), null);
  assert.strictEqual(C.comodoEm('casa-2', 3, 3), 'quarto');
});

test('casa: a ação casaDecorar abre as telas (com guarda) ou o Claude fala', async () => {
  const j = jogo(), R = j.R, acao = R.modulos.find((m) => m.id === 'casa').acoes.casaDecorar, chamadas = [];
  R.UI = R.UI || {};
  await acao({ tipo: 'casaDecorar', kit: 'estar' }, {});
  igual(j.balao.falas.map((f) => f.t), ['Complete uma matéria! Assim você ganha móveis.']);
  igual(j.balao.falas[0].o.voz, 'claude');
  feita(j, 't-s2', 't-s3');
  R.UI.casaKitsPendentes = () => { chamadas.push('kits'); j.Casa.escolherKit('estar'); return Promise.resolve(); };
  R.UI.decorarCasa = (o) => { chamadas.push(['decorar', o.kit]); };
  await acao({ tipo: 'casaDecorar', kit: 'estar' }, {});
  await acao({ tipo: 'casaDecorar' }, {});
  igual(chamadas, ['kits', ['decorar', 'estar'], ['decorar', null]]);
  igual(R.modulos.find((m) => m.id === 'casa').falas(), [{ texto: 'Complete uma matéria!' }, { texto: 'Assim você ganha móveis.' }]);
});
