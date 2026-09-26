// Testes de unidade: o save carrega com os mesmos valores (estadoNovo, completar) e as regras de P.mesclar dos campos de hoje e dos campos novos (cuidados, despensa, surpresa), novo ciclo e apagar tudo.
// Alvo: js/sistemas/progresso*.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/save-carregar-mesclar.test.js   (tudo: npm test, na raiz do repositório)
// Casos vindos de ferramentas/testes/testar-save.js (divididos por assunto na Fase 3).
const { test } = require('node:test');
const assert = require('assert');
const { montar, saveAtual, copia, semNovos } = require('./ajudantes/jogo-save');

test('save no formato de hoje carrega com os mesmos valores e unicórnios satisfeitos', () => {
  const orig = saveAtual();
  const j = montar({ save: orig });
  const e = j.P.carregar();
  assert.deepStrictEqual(semNovos(e), orig, 'algum campo de hoje mudou ao carregar');
  assert.deepStrictEqual(copia(e.cuidados), {});
  assert.deepStrictEqual(copia(e.despensa), {});
  assert.strictEqual(e.ajustes.surpresa, true);
  assert.deepStrictEqual(copia(j.C.niveis('inicial')), { fome: 100, sede: 100, banho: 100 });
  assert.deepStrictEqual(copia(j.C.niveis('h-cartinha')), { fome: 100, sede: 100, banho: 100 });
  assert.strictEqual(j.C.fatorVelocidade(), 1);
  assert.strictEqual(j.C.iconeMontaria(), null);
  // dinheiro e estrelas iguais
  assert.strictEqual(j.P.estrelas(), 29);
});

test('estadoNovo tem surpresa ligada; completar não liga a surpresa desligada', () => {
  const j = montar();
  const e = j.P.carregar();
  assert.strictEqual(e.ajustes.surpresa, true);
  assert.deepStrictEqual(copia(e.cuidados), {});
  const s = saveAtual(); s.ajustes.surpresa = false;
  const j2 = montar({ save: s });
  assert.strictEqual(j2.P.carregar().ajustes.surpresa, false);
});

test('mescla: estado novo x antigo mais recente sem os campos preserva cuidados e despensa', () => {
  const j = montar();
  const novo = saveAtual();
  novo.atualizado = 1750500000000;
  novo.cuidados = { inicial: { fome: 20, sede: 10, em: 1750500000000 } };
  novo.despensa = { maca: { compradas: 3, usadas: 1 } };
  const antigo = saveAtual();
  antigo.atualizado = 1750900000000;   // aparelho com a versão antiga, gravou por último
  [[novo, antigo], [antigo, novo]].forEach(([a, b]) => {
    const r = j.P.mesclar(copia(a), copia(b));
    assert.deepStrictEqual(r.cuidados, novo.cuidados);
    assert.deepStrictEqual(r.despensa, novo.despensa);
    assert.strictEqual(r.atualizado, 1750900000000);
  });
});

test('mescla: por unicórnio vale o `em` mais recente (empate: o lado mais recente)', () => {
  const j = montar();
  const a = saveAtual(); a.atualizado = 1750900000000;
  const b = saveAtual(); b.atualizado = 1750500000000;
  a.cuidados = { inicial: { fome: 80, sede: 80, em: 100 }, 'h-cartinha': { fome: 50, sede: 50, em: 500 }, soA: { fome: 1, sede: 1, em: 1 } };
  b.cuidados = { inicial: { fome: 30, sede: 90, em: 200 }, 'h-cartinha': { fome: 60, sede: 60, em: 500 }, soB: { fome: 2, sede: 2, em: 2 } };
  [[a, b], [b, a]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    assert.deepStrictEqual(r.cuidados.inicial, b.cuidados.inicial, 'em maior vence');
    assert.deepStrictEqual(r.cuidados['h-cartinha'], a.cuidados['h-cartinha'], 'empate: lado mais recente');
    assert.deepStrictEqual(r.cuidados.soA, a.cuidados.soA);
    assert.deepStrictEqual(r.cuidados.soB, b.cuidados.soB);
  });
});

test('mescla: despensa pelo maior contador', () => {
  const j = montar();
  const a = saveAtual(); a.atualizado = 1750900000000;
  const b = saveAtual(); b.atualizado = 1750500000000;
  a.despensa = { maca: { compradas: 2, usadas: 2 }, bolo: { compradas: 1, usadas: 0 } };
  b.despensa = { maca: { compradas: 5, usadas: 1 }, feno: { compradas: 1, usadas: 0 } };
  [[a, b], [b, a]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    assert.deepStrictEqual(r.despensa, { maca: { compradas: 5, usadas: 2 }, bolo: { compradas: 1, usadas: 0 }, feno: { compradas: 1, usadas: 0 } });
  });
});

test('mescla: geração maior vence inteira', () => {
  const j = montar();
  const velho = saveAtual(); velho.atualizado = 1750900000000;
  velho.cuidados = { inicial: { fome: 5, sede: 5, em: 9e12 } }; velho.despensa = { bolo: { compradas: 9, usadas: 0 } };
  const apagou = saveAtual(); apagou.geracao = 2; apagou.atualizado = 1750100000000; apagou.cuidados = {}; apagou.despensa = {};
  [[velho, apagou], [apagou, velho]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    assert.deepStrictEqual(r, apagou);
  });
});

test('mescla: as regras dos campos de hoje não mudam com os campos novos', () => {
  const j = montar();
  const a = saveAtual(); a.atualizado = 1750900000000;
  a.salas.h3 = { vezes: 1, melhor: 3, feita: 1750800000000 }; a.estrelas = { ganhas: 50, gastas: 20 }; a.loja.coroa = true;
  a.unis.inicial.xp = 120; a.provas['historia-3bim'] = { tentativas: 2, notas: [8.5, 10], melhor: 10, premio: 'raro', premioEm: 1750850000000 };
  const b = saveAtual(); b.atualizado = 1750500000000; b.pago.historia = 6; b.treinos.historia.melhor = 'ouro';
  const sem = j.P.mesclar(copia(a), copia(b));
  const a2 = copia(a), b2 = copia(b);
  a2.cuidados = { inicial: { fome: 10, sede: 10, em: 5 } }; b2.despensa = { maca: { compradas: 1, usadas: 0 } };
  const com = j.P.mesclar(a2, b2);
  assert.deepStrictEqual(copia(semNovos(com)), copia(sem));
  assert.strictEqual(sem.estrelas.ganhas, 50); assert.strictEqual(sem.pago.historia, 6); assert.strictEqual(sem.treinos.historia.melhor, 'ouro');
  assert.strictEqual(sem.loja.coroa, true); assert.strictEqual(sem.salas.h3.melhor, 3); assert.strictEqual(sem.provas['historia-3bim'].premio, 'raro');
  // dois saves de hoje: a mescla não inventa campos novos
  assert.strictEqual('cuidados' in sem, false); assert.strictEqual('despensa' in sem, false);
});

test('novo ciclo mantém cuidados e despensa; apagar tudo zera', () => {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 40, sede: 30, em: 1750500000000 } };
  s.despensa = { maca: { compradas: 3, usadas: 1 } };
  const j = montar({ save: s });
  j.P.carregar();
  j.P.novoCiclo();
  let e = j.P.estado();
  assert.strictEqual(e.ciclo, 2);
  assert.deepStrictEqual(copia(e.salas), {});
  assert.deepStrictEqual(copia(e.cuidados), s.cuidados);
  assert.deepStrictEqual(copia(e.despensa), s.despensa);
  j.P.apagarTudo();
  e = j.P.estado();
  assert.strictEqual(e.geracao, 2);
  assert.deepStrictEqual(copia(e.cuidados), {});
  assert.deepStrictEqual(copia(e.despensa), {});
  assert.strictEqual(e.ajustes.surpresa, true);
});
