// Testes de unidade: a viagem de foguete (js/sistemas/viagem.js e viagem-fluxo.js): tanque, passaporte, fluxo.
// Rodar: node --test jogo/ferramentas/testes/unidade/viagem.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');
const { Jogo: JS, montar, copia } = require('./ajudantes/jogo-save');

test('viagem: o módulo se registra, a Lua está nos planetas e as falas cabem', () => {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  const R = ctx.Reino, m = R.modulo('viagem');
  assert.ok(m && m.acoes.viagem);
  assert.ok(R.Viagem.planeta('lua'), 'a Lua não se registrou');
  const falas = m.falas();
  assert.ok(falas.some((f) => f.texto === 'Chegamos na Lua!'));
  assert.ok(falas.some((f) => f.texto === 'Faltam 10 respostas certas!'));
  assert.ok(falas.some((f) => f.texto === 'Falta 1 resposta certa!'));
  falas.forEach((f) => {
    assert.ok(f.texto.length <= 30, 'fala longa: ' + f.texto);
    assert.strictEqual(f.voz, 'claude');
  });
});

// o jogo no vm com o save sintético, a aura e a viagem
function comSave(save) {
  const j = montar({ agora: Date.UTC(2026, 8, 27), save });
  if (!j.R.registrarModulo) j.R.registrarModulo = function () {};
  ['sistemas/progresso-campos', 'sistemas/aura', 'sistemas/viagem', 'sistemas/viagem-fluxo']
    .forEach((n) => vm.runInContext(fs.readFileSync(JS.arquivo(n), 'utf8'), j.ctx, { filename: n }));
  j.P.carregar();
  j.R.Viagem.registrarPlaneta({ id: 'lua', nome: 'Lua', interior: 'planeta-lua', chegada: { x: 11, y: 14 }, ordem: 1, cor: '#ddd' });
  return j;
}
const vazio = (j) => { j.R.Viagem.gastar(); assert.strictEqual(j.R.Viagem.tanque().n, 0); };

test('viagem: save sem o campo = tanque cheio (cheioNoComeco); passaporte vazio', () => {
  const j = comSave();
  assert.deepStrictEqual(copia(j.R.Viagem.tanque()), { n: 10, max: 10 });
  assert.ok(j.R.Viagem.cheio());
  assert.deepStrictEqual(copia(j.R.Viagem.carimbos()), {});
});

test('viagem: resposta certa enche 1 gotinha, errada não tira, nunca passa do máximo', () => {
  const j = comSave(), V = j.R.Viagem;
  vazio(j);
  j.R.Aura.contar(true);
  assert.strictEqual(V.tanque().n, 1);
  j.R.Aura.contar([false, false]);
  assert.strictEqual(V.tanque().n, 1);
  j.R.Aura.contar([true, true, false, null, true]);
  assert.strictEqual(V.tanque().n, 4);
  assert.strictEqual(j.lido().combustivel.mariana.n, 4);
  for (let i = 0; i < 20; i++) j.R.Aura.contar(true);
  assert.strictEqual(V.tanque().n, 10);
  V.ganhar(50);
  assert.strictEqual(j.lido().combustivel.mariana.n, 10);
});

test('viagem: gastar zera e o limpar prende 0..máximo', () => {
  const j = comSave({ v: 1, combustivel: { mariana: { n: 99, em: 5 } } });
  assert.strictEqual(j.R.Viagem.tanque().n, 10);
  j.R.Viagem.gastar();
  assert.strictEqual(j.lido().combustivel.mariana.n, 0);
  assert.ok(!j.R.Viagem.cheio());
});

test('viagem: carimbar novo = true, repetido = false, e vai para o save', () => {
  const j = comSave(), V = j.R.Viagem;
  assert.strictEqual(V.carimbar('lua'), true);
  assert.strictEqual(V.carimbar('lua'), false);
  assert.deepStrictEqual(copia(V.carimbos()), { lua: true });
  assert.deepStrictEqual(j.lido().passaporte, { lua: true });
});

test('viagem: decolar sem Voo vai à Lua, gasta e carimba; vazio não decola', async () => {
  const j = comSave(), V = j.R.Viagem, idas = [];
  j.R.Cena.irPara = (i, c) => { idas.push([i, c.x, c.y]); return Promise.resolve(); };
  assert.strictEqual(await V.decolar('lua'), true);
  assert.deepStrictEqual(idas, [['planeta-lua', 11, 14]]);
  assert.strictEqual(V.tanque().n, 0);
  assert.deepStrictEqual(copia(V.carimbos()), { lua: true });
  assert.ok(j.balao.falas.some((f) => /Chegamos na Lua!/.test(f.t) && /Carimbo novo/.test(f.t)));
  assert.strictEqual(await V.decolar('lua'), false);
  assert.strictEqual(idas.length, 1);
});

test('viagem: o voo dá as estrelas (até estrelasPorVoo); sair com Esc não gasta', async () => {
  const j = comSave(), V = j.R.Viagem;
  j.R.Cena.irPara = () => Promise.resolve();
  j.R.Voo = { iniciar: () => Promise.resolve({ chegou: false, estrelas: 3, batidas: 0 }) };
  assert.strictEqual(await V.decolar('lua'), false);
  assert.strictEqual(V.tanque().n, 10);
  const antes = j.P.estado().estrelas.ganhas || 0;
  j.R.Voo = { iniciar: () => Promise.resolve({ chegou: true, estrelas: 9, batidas: 2 }) };
  assert.strictEqual(await V.decolar('lua'), true);
  assert.strictEqual(j.P.estado().estrelas.ganhas - antes, 5);
  assert.ok(j.balao.falas.some((f) => /Você ganhou 5 estrelas!/.test(f.t)));
});

test('viagem: a volta pergunta e só vai com "sim", de graça', async () => {
  const j = comSave(), V = j.R.Viagem, idas = [];
  V.gastar();
  j.R.Cena.irPara = (i) => { idas.push(i); return Promise.resolve(); };
  let resposta = 'nao';
  j.R.Claude.falar = () => Promise.resolve(resposta);
  const acao = { tipo: 'viagem', para: 'observatorio-2', chegada: { x: 7, y: 9 } };
  await V.voltar(acao);
  assert.deepStrictEqual(idas, []);
  resposta = 'sim';
  await V.voltar(acao);
  assert.deepStrictEqual(idas, ['observatorio-2']);
  assert.strictEqual(V.tanque().n, 0);
});

test('viagem: cadeado — Marte só abre com o carimbo da Lua; o painel diz qual visitar', async () => {
  const j = comSave(), V = j.R.Viagem;
  j.R.Cena.irPara = () => Promise.resolve();
  V.registrarPlaneta({ id: 'marte', nome: 'Marte', artigo: 'em', depois: 'lua', interior: 'planeta-marte', chegada: { x: 1, y: 1 }, ordem: 2, cor: '#c44' });
  V.registrarPlaneta({ id: 'saturno', nome: 'Saturno', artigo: 'em', depois: 'marte', interior: 'planeta-saturno', chegada: { x: 1, y: 1 }, ordem: 3, cor: '#dc8' });
  assert.deepStrictEqual([V.aberto('lua'), V.aberto('marte'), V.aberto('saturno'), V.aberto('pluto')], [true, false, false, false]);
  assert.strictEqual(await V.decolar('marte'), false);
  assert.strictEqual(V.tanque().n, 10);
  V.carimbar('lua');
  assert.deepStrictEqual([V.aberto('marte'), V.aberto('saturno')], [true, false]);
  const t = V.falas().map((f) => f.texto);
  assert.ok(t.includes('Visite a Lua primeiro!') && t.includes('Visite Marte primeiro!'));
});

test('viagem: portais — perguntas da matéria no voo; certo = estrela a mais e volta ao tanque', async () => {
  const j = comSave(), V = j.R.Viagem;
  j.R.Cena.irPara = () => Promise.resolve();
  V.registrarPlaneta({ id: 'marte', nome: 'Marte', artigo: 'em', materia: 'matematica', interior: 'planeta-marte', chegada: { x: 1, y: 1 }, ordem: 2, cor: '#c44' });
  let pedido = null;
  V.perguntas = (m, n, k) => { pedido = [m, n, k]; return [{ id: 'x' }]; };
  let recebeu = null;
  j.R.Voo = { iniciar: (op) => { recebeu = op; return Promise.resolve({ chegou: true, estrelas: 9, batidas: 0, portais: { certos: 2, erros: 1 } }); } };
  const antes = j.P.estado().estrelas.ganhas || 0;
  assert.strictEqual(await V.decolar('marte'), true);
  assert.deepStrictEqual(pedido, ['matematica', 3, 'voo:marte']);
  assert.strictEqual(recebeu.perguntas.length, 1);
  assert.strictEqual(j.P.estado().estrelas.ganhas - antes, 7);
  assert.strictEqual(V.tanque().n, 2);
  assert.ok(j.balao.falas.some((f) => /Você ganhou 7 estrelas!/.test(f.t)));
  // a Lua (sem matéria) não pede perguntas
  pedido = null; V.ganhar(10);
  await V.decolar('lua');
  assert.strictEqual(pedido, null);
  assert.strictEqual(recebeu.perguntas.length, 0);
});
