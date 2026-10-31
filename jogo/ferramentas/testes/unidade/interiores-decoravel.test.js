// Interior decorável (docs/contratos/casa.md §4): objetosExtras somados aos objetos na grade, no desenho e no toque;
// Reino.Interiores.refazer(id) refaz a mesma cena (a ativa continua a mesma, com ela onde está); placa com {nome},
// {a|b} e {uni}; o validador dispensa o critério de "rico" para decoravel: true, mas continua acusando escada sem par.
// Interior sintético, registrado só aqui (o jogo de verdade não muda). Save sintético (localStorage de mentira).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/interiores-decoravel.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const Jogo = require('../../jogo-no-node.js');
const { PASTA_TESTES } = require('../guardas');

// canvas de mentira (o ctx aceita qualquer chamada), como em interiores-lru.test.js
function paFalso() {
  function novoCanvas(w, h) {
    const c = { width: w, height: h };
    const alvo = { canvas: c, getImageData: (x, y, ww, hh) => ({ data: new Uint8ClampedArray(ww * hh * 4) }), measureText: () => ({ width: 0 }) };
    const ctx = new Proxy(alvo, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
    c.getContext = () => ctx;
    return c;
  }
  return { novoCanvas, APARENCIA_PADRAO: { pele: '#f1c7a3', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ffd34d' },
    contornar: (c) => c, iconeEmoji: () => null, iconeDesenho: () => null, cor: { escurecer: (c) => c, clarear: (c) => c, misturar: (a) => a } };
}
function carregarJogo() {
  const guardado = {};
  const ctx = Jogo.contexto({ console: { warn() {}, log() {}, error: console.error }, Math, Date, JSON, Promise,
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: (k) => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); }, removeItem() {} },
    location: { protocol: 'file:', search: '' }, document: { hidden: false, addEventListener() {} }, addEventListener() {}, PA: paFalso() });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  ctx.Reino.Progresso.carregar();
  return ctx;
}

// 1 cômodo vazio 8×7 (2 fileiras de parede), saída embaixo; um enfeite fixo de parede
function defSintetico(id, extra) {
  return Object.assign({
    id, lugar: id, nome: 'Casa de Teste', entrada: true, pacote: 'interior-' + id, decoravel: true,
    tamanho: { w: 10, h: 9 }, saida: { x: 4, y: 7 }, spawn: { x: 4, y: 6 },
    comodos: [{ id: 'quarto', nome: 'Quarto', placa: 'Quarto {da|do} {nome}', rect: { x: 1, y: 1, w: 8, h: 7 }, piso: 'taco', parede: 'papel' }],
    objetos: [{ tipo: 'janela', x: 3, y: 1 }],
  }, extra);
}

test('objetosExtras: o extra sólido entra na grade, nos objetos da cena e no toque', () => {
  const R = carregarJogo().Reino, I = R.Interiores;
  let extras = [{ tipo: 'caixote', x: 2, y: 4, solido: true, nome: 'Caixa', fala: 'Oi!' }];
  R.registrarInterior(defSintetico('casa-teste', { objetosExtras: () => extras }));
  const cena = I.cena('casa-teste');
  assert.strictEqual(cena.solido(2, 4), true, 'o caixote extra é sólido');
  assert.strictEqual(cena.solido(5, 4), false);
  assert.strictEqual(cena.grade.objeto[4][2], 1, 'índice do extra depois do fixo');
  assert.deepStrictEqual(cena._objetos.map((it) => it.o.tipo), ['janela', 'caixote']);
  // I.grade(def) também soma os extras (a mesma regra da cena)
  assert.strictEqual(I.grade(I.def('casa-teste')).solido[4][2], true);
  const alvo = cena.alvoEm(2 * 16 + 8, 4 * 16 + 8);
  assert.ok(alvo && alvo.tipo === 'objeto' && alvo.objeto.tipo === 'caixote', 'o toque acha o extra interativo');
});

test('refazer: a mesma cena muda a grade e os objetos; ela continua onde está', async () => {
  const ctx = carregarJogo(), R = ctx.Reino, I = R.Interiores;
  let extras = [{ tipo: 'caixote', x: 2, y: 4, solido: true }];
  R.registrarInterior(defSintetico('casa-teste', { objetosExtras: () => extras }));
  const cena = I.cena('casa-teste');
  await cena.preparar();
  // a Cena e a personagem de mentira: a cena ativa é esta
  R.Cena = { atual: () => cena };
  const J = { x: 4 * 16 + 8, y: 6 * 16 + 12 };
  ctx.Jogador = J;
  extras = [{ tipo: 'caixote', x: 6, y: 4, solido: true }, { tipo: 'estante', x: 2, y: 3 }];
  assert.strictEqual(I.refazer('casa-teste'), cena, 'refazer devolve a mesma cena');
  assert.strictEqual(I.cena('casa-teste'), cena, 'o cache guarda a mesma cena');
  assert.strictEqual(cena.solido(2, 4), false, 'o caixote saiu daqui');
  assert.strictEqual(cena.solido(6, 4), true, 'e foi para cá');
  assert.strictEqual(cena.grade.objeto[4][6], 1);
  assert.ok(cena.caminho({ x: 2, y: 5 }, { x: 2, y: 4 }), 'caminho pelo tile livre de novo');
  assert.deepStrictEqual(cena._objetos.map((it) => it.o.tipo), ['janela', 'caixote', 'estante']);
  // o móvel alto novo entra nos itens por Y; o estático é refeito no próximo desenho (sem íris)
  assert.ok(cena.itensDesenho({}, 0, false).some((it) => it.objeto && it.objeto.tipo === 'estante'));
  await cena.preparar();
  assert.ok(cena._temEstatico());
  assert.deepStrictEqual({ x: J.x, y: J.y }, { x: 4 * 16 + 8, y: 6 * 16 + 12 }, 'ela fica onde está');
  assert.strictEqual(R.Cena.atual(), cena);
  // cena ainda não criada: nada a refazer
  assert.strictEqual(I.refazer('nao-existe'), null);
});

test('objetosExtras que lança erro (ou não devolve lista) não derruba a cena: vira []', () => {
  const R = carregarJogo().Reino, I = R.Interiores;
  R.registrarInterior(defSintetico('casa-erro', { objetosExtras: () => { throw new Error('quebrou'); } }));
  R.registrarInterior(defSintetico('casa-nada', { objetosExtras: () => null }));
  ['casa-erro', 'casa-nada'].forEach((id) => {
    const cena = I.cena(id);
    assert.deepStrictEqual(cena._objetos.map((it) => it.o.tipo), ['janela'], id);
    assert.strictEqual(I.refazer(id), cena, id);
  });
});

test('interior que não é decorável: a lista de objetos é a do def, sem cópia', () => {
  const R = carregarJogo().Reino, I = R.Interiores;
  const d = R.interiores.find((x) => !x.objetosExtras && (x.objetos || []).length);
  assert.strictEqual(R._interiores.objetosDe(d), d.objetos);
  const cena = I.cena(d.id), n = cena._objetos.length;
  assert.strictEqual(n, d.objetos.length);
  assert.strictEqual(I.refazer(d.id), cena);
  assert.strictEqual(cena._objetos.length, n);
});

test('placa: {nome}, {a|b} e {uni} trocados; sem Genero, o texto fica legível', () => {
  const R = carregarJogo().Reino, I = R.Interiores;
  const uni = R.Progresso.nomeUni(R.Progresso.montaria());
  assert.ok(uni);
  assert.strictEqual(I.textoPlaca('Quarto {da|do} {nome}'), 'Quarto da Mariana');
  assert.strictEqual(I.textoPlaca('Quarto de {uni}'), 'Quarto de ' + uni);
  assert.strictEqual(I.textoPlaca('Sala de Estar'), 'Sala de Estar');
  // trocou o perfil (evento PERFIL): a placa guardada sai
  R.Jogadores = Object.assign({}, R.Jogadores, { perfil: () => ({ nome: 'Leo', sexo: 'menino' }) });
  R.util.emit(R.EVENTOS.PERFIL);
  assert.strictEqual(I.textoPlaca('Quarto {da|do} {nome}'), 'Quarto do Leo');
  delete R.Genero;
  R.util.emit(R.EVENTOS.PERFIL);
  assert.strictEqual(I.textoPlaca('Quarto {da|do} {nome}'), 'Quarto da Mariana');
});

test('placa: guardada entre quadros; trocar o nome do unicórnio troca a placa', () => {
  const R = carregarJogo().Reino, I = R.Interiores, P = R.Progresso;
  let chamadas = 0;
  const nomeUni = P.nomeUni;
  P.nomeUni = function () { chamadas++; return nomeUni.apply(this, arguments); };
  const antes = I.textoPlaca('Quarto de {uni}');
  for (let i = 0; i < 5; i++) assert.strictEqual(I.textoPlaca('Quarto de {uni}'), antes);
  assert.strictEqual(chamadas, 1, 'um quadro depois do outro não pergunta o nome de novo');
  // renomear no Estábulo grava o save (evento PROGRESSO)
  const id = P.montaria(), unis = P.estado().unis;
  unis[id] = Object.assign({}, unis[id], { nome: 'Pipoca' });
  P.salvar();
  assert.strictEqual(I.textoPlaca('Quarto de {uni}'), 'Quarto de Pipoca');
  assert.strictEqual(chamadas, 2);
});

// validador: o interior sintético plantado depois do carregar (preload que embrulha Jogo.carregar), com --so
fs.mkdirSync(PASTA_TESTES, { recursive: true });
const tmp = fs.mkdtempSync(path.join(PASTA_TESTES, 'decoravel-'));
function validar(nome, defs) {
  const preload = path.join(tmp, nome + '.js');
  fs.writeFileSync(preload, `
const Jogo = require(${JSON.stringify(path.join(Jogo.raiz, 'ferramentas', 'jogo-no-node.js'))});
const carregar = Jogo.carregar;
Jogo.carregar = function (ctx) {
  const r = carregar.apply(this, arguments);
  ctx.Reino.registrarLugar({ id: 'casa-teste', nome: 'Casa de Teste', rect: { x: 1, y: 1, w: 2, h: 2 }, caminho: [[1, 3]] });
  ${JSON.stringify(defs)}.forEach((d) => ctx.Reino.registrarInterior(d));
  return r;
};
`);
  const r = spawnSync(process.execPath, ['-r', preload, 'ferramentas/validar/validar-interiores.js', '--so', 'casa-teste'], { cwd: Jogo.raiz, encoding: 'utf8' });
  return { status: r.status, saida: r.stdout + r.stderr };
}

test('validador: aceita o decorável vazio; sem decoravel, cobra o critério de "rico"', () => {
  const ok = validar('vazio', [defSintetico('casa-teste')]);
  assert.strictEqual(ok.status, 0, ok.saida);
  assert.match(ok.saida, /1 interiores de casa-teste/);
  const rico = validar('rico', [defSintetico('casa-teste', { decoravel: undefined })]);
  assert.strictEqual(rico.status, 1, rico.saida);
  assert.match(rico.saida, /mínimo 15/);
  assert.match(rico.saida, /janelas 3×3/);
  assert.match(rico.saida, /mínimo 3/);
});

test('validador: o decorável ainda recusa escada sem par e objeto inalcançável', () => {
  const baixo = defSintetico('casa-teste', { escadas: [{ x: 2, y: 3, para: 'casa-teste-2', sentido: 'sobe' }] });
  const cima = defSintetico('casa-teste-2', { lugar: 'casa-teste', entrada: false, saida: undefined, pacote: 'interior-casa-teste' });
  const r = validar('escada', [baixo, cima]);
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /escada 0 \(2,3\): precisa de exatamente 1 escada de volta/);
  // parede de caixotes atravessando o cômodo: o objeto interativo do outro lado fica sem vizinho alcançável
  const muro = [{ tipo: 'caixote', x: 5, y: 3, nome: 'Caixa', fala: 'Oi!' }];
  for (let x = 1; x < 9; x++) muro.push({ tipo: 'caixote', x, y: 4, solido: true });
  const preso = validar('preso', [defSintetico('casa-teste', { objetos: muro })]);
  assert.strictEqual(preso.status, 1, preso.saida);
  assert.match(preso.saida, /objeto interativo 0 \(caixote\) sem vizinho livre alcançável/);
});
