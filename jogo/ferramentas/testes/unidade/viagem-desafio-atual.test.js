// Testes de unidade: os ETs de desafio com o conteúdo de VERDADE (o jogo publicado, sem o arquivo do 3º bimestre).
// O desafio de cada ET pede a matéria do 3º bimestre (arquivada, sem perguntas): vale a nova do mesmo prédio
// (Reino.Bimestres.ativa). Sem isso o painel não abria e o ET nunca virava amigo nem ficava colorido no Álbum de ETs
// (pedido de 17/11: "ela achou o alien que falta e não apareceu"). Também os portais do voo de cada planeta.
// O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/viagem-desafio-atual.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje } = require('./ajudantes/jogo-save');

function jogo() {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: saveHoje(), agora: Date.UTC(2026, 10, 17) }); } finally { Jogo.scripts = orig; }
  j.P.carregar();
  return j;
}
// os ETs de desafio: a ação de cada um na reserva (observatorio/reservas.js)
function etsDeDesafio(R) {
  return R.Viagem.ets().map((e) => ({ id: e.id, acao: (R.reservas[e.id] || {}).acao })).filter((e) => e.acao && e.acao.tipo === 'viagem-desafio');
}

test('Bimestres.ativa: a matéria arquivada vira a nova do mesmo prédio; a ativa fica', () => {
  const { R } = jogo(), B = R.Bimestres;
  ['matematica', 'ingles', 'portugues', 'geografia', 'ciencias', 'historia'].forEach((m) => {
    const nova = B.ativa(m), def = R.materia(nova);
    assert.ok(R.materia(m).arquivada, m + ' é do 3º bimestre');
    assert.ok(def && !def.arquivada, m + ' → ' + nova);
    assert.strictEqual(def.lugar.dentro, 'materia:' + m, 'mesmo prédio');
    assert.strictEqual(B.ativa(nova), nova);
  });
  assert.strictEqual(B.ativa('nao-existe'), 'nao-existe');
});

test('todo ET de desafio abre com perguntas de matéria ativa e, no fim, vira amigo e fica colorido no álbum', () => {
  const j = jogo(), R = j.R, V = R.Viagem, X = R._viagemDesafio, n = R.config.viagem.desafioPerguntas;
  const ets = etsDeDesafio(R);
  assert.strictEqual(ets.length, 6, 'os 6 ETs de desafio');
  ets.forEach((e) => {
    const d = X.comecar(e.id, e.acao.materia);
    assert.strictEqual(d.perguntas.length, n, e.id + ': ' + d.perguntas.length + ' perguntas');
    assert.ok(!R.materia(d.materia).arquivada, e.id + ': matéria ativa');
    d.perguntas.forEach((p) => {
      assert.ok(p.desafio && (p.desafio.tipo === 'escolha' || p.desafio.tipo === 'vf'), e.id + ': ' + p.id);
      assert.ok(R.avulsa(p.desafio), e.id + ': pergunta que vale sozinha');
    });
    assert.strictEqual(new Set(d.perguntas.map((p) => p.id)).size, n, e.id + ': sem repetir');
    assert.strictEqual(V.ehAmigo(e.id), false);
    assert.strictEqual(X.terminar(d), true, e.id + ': amigo novo');
    assert.ok(V.ets().find((x) => x.id === e.id).amigo, e.id + ': colorido no álbum');
  });
  assert.strictEqual(Object.keys(j.lido().etsAmigos || {}).length, 6, 'gravado no save');
});

test('os portais do voo de cada planeta com matéria têm perguntas (a matéria nova do prédio)', () => {
  const { R } = jogo(), V = R.Viagem;
  V.planetas().filter((p) => p.materia).forEach((p) => {
    const l = V.perguntas(p.materia, R.config.viagem.portaisPorVoo, 'voo:' + p.id);
    assert.ok(l.length >= 1, p.id + ': sem perguntas para os portais');
    l.forEach((q) => assert.ok(!R.materia(q.materia).arquivada, p.id + ': ' + q.id));
  });
});
