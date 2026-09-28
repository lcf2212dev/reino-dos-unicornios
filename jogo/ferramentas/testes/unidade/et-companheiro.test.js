// Testes de unidade: o sistema et-companheiro (js/sistemas/et-companheiro.js), carregado com o jogo no vm (todos os `node: true`).
// Esqueleto do `npm run novo`: acrescente os testes das regras. Modelo: unidade/modulos.test.js.
// Rodar: node --test jogo/ferramentas/testes/unidade/et-companheiro.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return ctx.Reino;
}

test('et-companheiro: o módulo se registra e o depurar responde', () => {
  const R = carregar();
  const m = R.modulo('et-companheiro');
  assert.ok(m, 'módulo et-companheiro não registrado');
  assert.strictEqual(typeof m.depurar(), 'object');
});

// o jogo no vm com o save (ajudantes/jogo-save.js, saves sintéticos): o desafio (etsAmigos) e o companheiro
const fs = require('fs');
const vm = require('vm');
const { Jogo: JS, montar, saveHoje } = require('./ajudantes/jogo-save');
function comSave() {
  const j = montar({ agora: Date.UTC(2026, 8, 27) });
  if (!j.R.registrarModulo) j.R.registrarModulo = function () {};
  ['sistemas/progresso-campos', 'sistemas/viagem-desafio', 'sistemas/et-companheiro'].forEach((n) => vm.runInContext(fs.readFileSync(JS.arquivo(n), 'utf8'), j.ctx, { filename: n }));
  j.P.carregar();
  return j;
}

test('et-companheiro: só leva ET amigo; null deixa em casa', () => {
  const j = comSave(), V = j.R.Viagem;
  assert.strictEqual(V.companheiro(), null);
  assert.strictEqual(V.escolherCompanheiro('lua-lumi'), false);   // ainda não é amigo
  assert.strictEqual(V.escolherCompanheiro(42), false);
  V.fazerAmigo('lua-lumi');
  assert.strictEqual(V.escolherCompanheiro('lua-lumi'), true);
  assert.strictEqual(V.companheiro(), 'lua-lumi');
  assert.strictEqual(j.lido().etCompanheiro.mariana.id, 'lua-lumi');
  assert.strictEqual(V.escolherCompanheiro(null), true);
  assert.strictEqual(V.companheiro(), null);
  assert.strictEqual(j.lido().etCompanheiro.mariana.id, null);
  // deixou de ser amigo (outro aparelho, save mexido): some
  V.escolherCompanheiro('lua-lumi');
  j.P.estado().etsAmigos = {};
  assert.strictEqual(V.companheiro(), null);
});

test('et-companheiro: save ida e volta, mescla pelo mais recente e limpeza', () => {
  const j = comSave();
  j.R.Viagem.fazerAmigo('lua-lumi');
  j.R.Viagem.escolherCompanheiro('lua-lumi');
  j.P.carregar();
  assert.strictEqual(j.R.Viagem.companheiro(), 'lua-lumi');
  const a = Object.assign(saveHoje(), { atualizado: 2, etCompanheiro: { mariana: { id: 'lua-lumi', em: 10 } } });
  const b = Object.assign(saveHoje(), { atualizado: 1, etCompanheiro: { mariana: { id: null, em: 20 } } });
  assert.strictEqual(j.P.mesclar(a, b).etCompanheiro.mariana.id, null);
  assert.strictEqual(j.P.mesclar(b, a).etCompanheiro.mariana.id, null);
  const velho = saveHoje(); delete velho.etCompanheiro; velho.atualizado = 5;
  assert.strictEqual(j.P.mesclar(velho, a).etCompanheiro.mariana.id, 'lua-lumi');
});

test('et-companheiro: o rastro segue o caminho e recomeça ao saltar ou trocar de cena', () => {
  const R = carregar(), S = R._etCompanheiro, d = S.distancia();
  S.atualizar(100, 100, 'mapa', 1, 0);
  let q = S.pontoAtras(d);
  assert.ok(q.x > 100 + d - 1 && q.y < 100, 'começa de lado (à direita, longe do bebê), um pouco atrás');
  for (let x = 101; x <= 100 + d; x++) S.atualizar(x, 100, 'mapa', 1, 0);
  for (let y = 101; y <= 110; y++) S.atualizar(100 + d, y, 'mapa', 0, 1);
  q = S.pontoAtras(d);
  assert.ok(Math.abs(q.x - (100 + 10)) < 0.01 && Math.abs(q.y - 100) < 0.01, 'segue a curva do caminho');
  S.atualizar(500, 500, 'mapa', 0, 1);   // porta, escada: salto
  q = S.pontoAtras(d);
  assert.ok(q.x > 500 && q.y < 500);
  S.atualizar(500, 501, 'casa-1', 0, 1);   // cena nova, mesmo perto
  assert.strictEqual(S.cena, 'casa-1');
  assert.strictEqual(S.rastro.length, 2);
});
