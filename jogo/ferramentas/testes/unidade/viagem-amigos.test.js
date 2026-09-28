// Testes de unidade: os ETs e a amizade (js/sistemas/viagem-amigos.js): ets() lista todos, fazerAmigo guarda,
// o amigo aparece no álbum (dados), brincar com um ET faz amigo. Rodar: node --test <este arquivo>   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');
const { Jogo: JS, montar, copia } = require('./ajudantes/jogo-save');

// quieto: a brincadeira começa e para no primeiro DOM (não há tela no Node); o erro vai para o console do jogo
function jogoInteiro(quieto) {
  const mudo = { log() {}, warn() {}, error() {}, info() {} };
  const ctx = Jogo.contexto({ console: quieto ? mudo : console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return ctx;
}

test('ets(): todos os ETs dos planetas, sem repetir, na ordem dos planetas', () => {
  const R = jogoInteiro().Reino, V = R.Viagem;
  const ets = V.ets(), ordem = V.planetas().map((p) => p.id);
  const esperados = [];
  V.planetas().forEach((p) => R.personagensDoPredio(p.interior).forEach((n) => { if (!esperados.includes(n.id)) esperados.push(n.id); }));
  assert.deepStrictEqual(copia(ets.map((e) => e.id)), esperados);
  ['lua-lumi', 'lua-pipo', 'lua-vovo', 'marte-rubi', 'marte-faisca', 'marte-vovo', 'saturno-sky', 'saturno-nico', 'saturno-vovo']
    .forEach((id) => assert.ok(esperados.includes(id), 'falta ' + id));
  let ultimo = -1;
  ets.forEach((e) => {
    assert.ok(e.nome && e.nome !== e.id, 'sem nome: ' + e.id);
    const i = ordem.indexOf(e.planeta);
    assert.ok(i >= ultimo, 'fora de ordem: ' + e.id);
    ultimo = i;
    assert.strictEqual(e.amigo, false);
  });
});

test('fazerAmigo guarda no save e o amigo aparece no álbum', () => {
  const j = montar({ agora: Date.UTC(2026, 8, 27) });
  if (!j.R.registrarModulo) j.R.registrarModulo = function () {};
  ['sistemas/progresso-campos', 'sistemas/aura', 'sistemas/viagem', 'sistemas/viagem-desafio', 'sistemas/viagem-amigos']
    .forEach((n) => vm.runInContext(fs.readFileSync(JS.arquivo(n), 'utf8'), j.ctx, { filename: n }));
  j.P.carregar();
  const R = j.R, V = R.Viagem;
  V.registrarPlaneta({ id: 'teste', nome: 'Teste', interior: 'planeta-teste', chegada: { x: 1, y: 1 }, ordem: 99, cor: '#fff' });
  R.personagemTambemEm('teste-a', { predio: 'planeta-teste', x: 1, y: 1 });
  R.personagemTambemEm('teste-b', { predio: 'planeta-teste', x: 2, y: 1 });
  const doTeste = () => V.ets().filter((e) => e.planeta === 'teste');
  assert.deepStrictEqual(copia(doTeste().map((e) => e.amigo)), [false, false]);
  assert.strictEqual(V.fazerAmigo('teste-b'), true);
  assert.strictEqual(V.fazerAmigo('teste-b'), false);
  assert.deepStrictEqual(copia(doTeste().map((e) => e.amigo)), [false, true]);
  assert.strictEqual(j.lido().etsAmigos['teste-b'], true);
});

test('brincar com um ET da Lua, de Marte ou de Saturno faz dele um amigo', async () => {
  const R = jogoInteiro(true).Reino, V = R.Viagem, feitos = [];
  V.fazerAmigo = (id) => { feitos.push(id); return true; };
  const acoes = [['lua-brincadeira', 'lua-pipo', 'esconde'], ['marte-brincadeira', 'marte-faisca', 'faisca'], ['saturno-brincadeira', 'saturno-nico', 'nico']];
  for (const [tipo, id, b] of acoes) {
    assert.ok(R.NPCs.acoes().includes(tipo), 'sem ação ' + tipo);
    try { R.NPCs.executar({ tipo, b }, { npc: { id } }); } catch (e) { /* sem tela no Node */ }
  }
  assert.deepStrictEqual(feitos.filter((x, i) => feitos.indexOf(x) === i), ['lua-pipo', 'marte-faisca', 'saturno-nico']);
});
