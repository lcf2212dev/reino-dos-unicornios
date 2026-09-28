// Testes de unidade: o desafio do ET (js/sistemas/viagem-desafio.js): amigos no save, estrela só no acerto, falas.
// Rodar: node --test jogo/ferramentas/testes/unidade/viagem-desafio.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');
const { Jogo: JS, montar, copia } = require('./ajudantes/jogo-save');

function comSave(save) {
  const j = montar({ agora: Date.UTC(2026, 8, 27), save });
  if (!j.R.registrarModulo) j.R.registrarModulo = function () {};
  ['sistemas/progresso-campos', 'sistemas/aura', 'sistemas/viagem', 'sistemas/viagem-desafio']
    .forEach((n) => vm.runInContext(fs.readFileSync(JS.arquivo(n), 'utf8'), j.ctx, { filename: n }));
  j.P.carregar();
  return j;
}

test('desafio do ET: falas na voz do ET, pacote do Observatório, curtas', () => {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  const m = ctx.Reino.modulo('viagem-desafio');
  assert.ok(m && m.acoes['viagem-desafio']);
  const falas = m.falas();
  assert.ok(falas.some((f) => f.voz === 'npc-marte-rubi') && falas.some((f) => f.voz === 'npc-saturno-sky'));
  falas.forEach((f) => {
    assert.strictEqual(f.pacote, 'interior-observatorio');
    ctx.Reino.Genero.versoes(f.texto).forEach((t) => assert.ok(t.length <= 30, 'fala longa: ' + t));
    assert.ok(f.texto.split(/\s+/).length >= 3, 'fala curta demais: ' + f.texto);
  });
});

test('desafio do ET: perguntas da matéria; estrela só no acerto; terminar = amigo (salvo)', () => {
  const j = comSave(), V = j.R.Viagem, X = j.R._viagemDesafio;
  assert.deepStrictEqual(copia(V.amigos()), {});
  const d = X.comecar('marte-rubi', 'matematica');
  assert.strictEqual(d.perguntas.length, j.R.config.viagem.desafioPerguntas);
  d.perguntas.forEach((p) => assert.strictEqual(p.materia, 'matematica'));
  const saldo = () => j.P.estado().estrelas.ganhas, antes = saldo();
  assert.strictEqual(X.conferir(d, false), 0);
  assert.strictEqual(saldo(), antes);
  assert.strictEqual(X.conferir(d, true), j.R.config.viagem.estrelasPorAcertoET);
  assert.strictEqual(saldo(), antes + j.R.config.viagem.estrelasPorAcertoET);
  assert.ok(!V.ehAmigo('marte-rubi'));
  assert.strictEqual(X.terminar(d), true);
  assert.ok(V.ehAmigo('marte-rubi'));
  assert.strictEqual(j.lido().etsAmigos['marte-rubi'], true);
  // 2ª vez: outras perguntas (outra chave), já amigo
  const d2 = X.comecar('marte-rubi', 'matematica');
  assert.ok(d2.amigoAntes);
  assert.notDeepStrictEqual(d2.perguntas.map((p) => p.id), d.perguntas.map((p) => p.id));
  assert.strictEqual(X.terminar(d2), false);
});
