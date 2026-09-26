// Testes de unidade: save com ids "do futuro" (unicórnio, ovo, matéria, prova, comida e enfeite que esta versão não
// conhece, vindos pela mescla de uma aba mais nova). A leitura cai na reserva (montaria 'inicial', ovo escondido) e a
// gravação conserva os ids (docs/contratos/save-e-mescla.md §6).
// Alvo: js/sistemas/progresso-regras.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/futuro.test.js   (tudo: npm test, na raiz do repositório)
const { test } = require('node:test');
const assert = require('assert');
const { montar, saveHoje, copia, sincronizar } = require('./ajudantes/jogo-save');

// o save de hoje com tudo o que uma versão futura poderia trazer
function saveFuturo() {
  const s = saveHoje();
  s.unis['uni-futuro'] = { em: 1750300000000, xp: 40, chocado: true, nome: 'Do Futuro' };
  s.unis['ovo-futuro'] = { em: 1750310000000, xp: 0, chocado: false };
  s.montaria = 'uni-futuro';
  s.salas['sala-futuro'] = { vezes: 2, melhor: 5, feita: 1750320000000 };
  s.provas['prova-futuro'] = { tentativas: 1, notas: [9], melhor: 9 };
  s.treinos['materia-futuro'] = { vezes: 1, melhor: 'ouro' };
  s.pago['materia-futuro'] = 3;
  s.despensa['comida-futuro'] = { compradas: 2, usadas: 1 };
  s.loja['enfeite-futuro'] = true;
  s.usando.enfeites = ['enfeite-futuro', 'flor'];
  s.cuidados['uni-futuro'] = { fome: 50, sede: 50, em: 1750550000000, acao: 0, acaoFome: 0, acaoSede: 0 };
  return s;
}

function conferirIds(e, onde) {
  assert.strictEqual(e.montaria, 'uni-futuro', onde + ': estado.montaria guarda o id desconhecido');
  assert.ok(e.unis['uni-futuro'] && e.unis['uni-futuro'].chocado, onde + ': uni-futuro');
  assert.ok(e.unis['ovo-futuro'] && !e.unis['ovo-futuro'].chocado, onde + ': ovo-futuro');
  assert.ok(e.salas['sala-futuro'], onde + ': sala');
  assert.ok(e.provas['prova-futuro'], onde + ': prova');
  assert.ok(e.treinos['materia-futuro'], onde + ': treino');
  assert.strictEqual(e.pago['materia-futuro'], 3, onde + ': pago');
  assert.ok(e.despensa['comida-futuro'], onde + ': despensa');
  assert.strictEqual(e.loja['enfeite-futuro'], true, onde + ': loja');
  assert.ok(e.usando.enfeites.indexOf('enfeite-futuro') >= 0, onde + ': usando.enfeites');
}

test('futuro: montaria desconhecida cai em "inicial" só na leitura; ovo desconhecido não aparece', () => {
  const j = montar({ save: saveFuturo() });
  const e = j.P.carregar();
  assert.strictEqual(j.P.defUni('uni-futuro'), null, 'o id não existe nesta versão');
  assert.strictEqual(j.P.montaria(), 'inicial');
  assert.strictEqual(e.montaria, 'uni-futuro');
  assert.deepStrictEqual(copia(j.P.ovosParaChocar()), ['h-postal'], 'só o ovo conhecido');
  // as regras que usam a montaria andam na reserva (xp e cuidados), sem mexer no desconhecido
  const xpAntes = e.unis['uni-futuro'].xp;
  j.P.xpMontaria(5);
  assert.strictEqual(e.unis['uni-futuro'].xp, xpAntes, 'xp não vai para o unicórnio desconhecido');
  assert.strictEqual(e.unis.inicial.xp, 100);
  assert.deepStrictEqual(copia(j.C.niveis()), copia(j.C.niveis('inicial')));
  conferirIds(e, 'carregado');
});

test('futuro: salvar e mesclar conservam todos os ids desconhecidos', () => {
  const j = montar({ save: saveFuturo() });
  j.P.carregar();
  j.P.salvar();
  conferirIds(j.lido(), 'salvo');
  // mescla nos dois sentidos com um save desta versão (sem os ids)
  const hoje = saveHoje(); hoje.atualizado = 1750900000000;
  [[j.P.estado(), hoje], [hoje, j.P.estado()]].forEach(([a, b], n) => {
    const r = j.P.mesclar(copia(a), copia(b));
    const onde = 'mescla ' + n;
    ['uni-futuro', 'ovo-futuro'].forEach((id) => assert.ok(r.unis[id], onde + ': ' + id));
    assert.ok(r.salas['sala-futuro'] && r.provas['prova-futuro'] && r.treinos['materia-futuro'], onde + ': salas/provas/treinos');
    assert.strictEqual(r.pago['materia-futuro'], 3, onde + ': pago');
    assert.ok(r.despensa['comida-futuro'], onde + ': despensa');
  });
  // sincronização de ida e volta com o "banco": a aba desta versão não perde nada
  const banco = { valor: copia(j.P.estado()) };
  const outra = montar({ save: saveHoje() });
  outra.P.carregar();
  sincronizar(outra, banco);
  assert.strictEqual(outra.P.montaria(), 'inicial');
  assert.ok(banco.valor.unis['uni-futuro'] && banco.valor.unis['ovo-futuro'], 'o banco continua com os unicórnios futuros');
  assert.ok(banco.valor.salas['sala-futuro'] && banco.valor.despensa['comida-futuro'], 'o banco continua com sala e comida futuras');
});
