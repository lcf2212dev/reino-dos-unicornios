// Testes de unidade: a cópia de segurança dos campos novos (chave '<chaveSave>-novidades'): gravar, ler, cópia ausente, corrompida, velha, aba antiga e localStorage bloqueado.
// Alvo: js/sistemas/progresso*.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/save-copia.test.js   (tudo: npm test, na raiz do repositório)
// Casos vindos de ferramentas/testes/testar-save.js (divididos por assunto na Fase 3).
const { test } = require('node:test');
const assert = require('assert');
const { montar, saveAtual, copia, semNovos } = require('./ajudantes/jogo-save');

/* ---------- cópia de segurança dos campos novos (chave '<chaveSave>-novidades') ---------- */
// o que a versão antiga faz: regrava o save principal com o estado dela, sem os campos novos
function abaAntigaGrava(j, e) { j.guardado[j.R.config.chaveSave] = JSON.stringify(semNovos(e)); }

test('cópia: salvar grava a cópia uma vez por gravação, com geração, ciclo e os campos novos', () => {
  const s = saveAtual(); s.despensa = { maca: { compradas: 2, usadas: 0 } }; s.ajustes.surpresa = false;
  const j = montar({ save: s });
  j.P.carregar();
  j.P.salvar(true);
  j.P.salvar(true);
  assert.strictEqual(j.gravacoes[j.R.config.chaveSave], 2);
  assert.strictEqual(j.gravacoes[j.chaveCopia], 2, 'a cópia não pode ser gravada mais vezes que o save');
  const c = j.copiaGuardada();
  assert.strictEqual(c.geracao, 1); assert.strictEqual(c.ciclo, 1); assert.strictEqual(c.atualizado, j.P.estado().atualizado);
  assert.deepStrictEqual(c.despensa, s.despensa); assert.deepStrictEqual(c.cuidados, {}); assert.strictEqual(c.surpresa, false);
});

test('cópia ausente: carrega igual a antes', () => {
  const orig = saveAtual();
  const j = montar({ save: orig });
  const e = j.P.carregar();
  assert.deepStrictEqual(semNovos(e), orig);
  assert.deepStrictEqual(copia(e.despensa), {}); assert.deepStrictEqual(copia(e.cuidados), {}); assert.strictEqual(e.ajustes.surpresa, true);
});

test('cópia corrompida: ignorada sem erro e sem NaN', () => {
  ['{{{', '[]', '"texto"', 'null', '42',
    JSON.stringify({ geracao: 1, despensa: [1, 2], cuidados: 'x', surpresa: 'sim' }),
    JSON.stringify({ geracao: 1, despensa: { maca: { compradas: 'abc', usadas: 0 }, bolo: null, feno: [3] },
      cuidados: { inicial: { fome: 'muita', sede: 1, em: 5 }, x: 7 } }),
  ].forEach((bruto) => {
    const orig = saveAtual(); orig.despensa = { maca: { compradas: 1, usadas: 0 } };
    const j = montar({ save: orig, copia: bruto });
    const e = j.P.carregar();
    assert.deepStrictEqual(copia(e.despensa), orig.despensa, bruto);
    assert.deepStrictEqual(copia(e.cuidados), {}, bruto);
    assert.strictEqual(e.ajustes.surpresa, true, bruto);
    j.P.salvar(true);                       // e regrava a cópia boa por cima
    assert.deepStrictEqual(j.copiaGuardada().despensa, orig.despensa);
  });
});

test('cópia de geração menor (antes de "Apagar tudo"): ignorada e regravada com o estado', () => {
  const s = saveAtual(); s.geracao = 2;
  const j = montar({ save: s, copia: { geracao: 1, ciclo: 1, despensa: { bolo: { compradas: 9, usadas: 0 } },
    cuidados: { inicial: { fome: 3, sede: 3, em: 9e12 } }, surpresa: false } });
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e.despensa), {}); assert.deepStrictEqual(copia(e.cuidados), {}); assert.strictEqual(e.ajustes.surpresa, true);
  j.P.salvar(true);
  const c = j.copiaGuardada();
  assert.strictEqual(c.geracao, 2); assert.deepStrictEqual(c.despensa, {}); assert.deepStrictEqual(c.cuidados, {});
});

test('cópia com despensa maior: vale o maior contador, nunca diminui', () => {
  const s = saveAtual(); s.despensa = { maca: { compradas: 2, usadas: 2 }, bolo: { compradas: 4, usadas: 1 } };
  const j = montar({ save: s, copia: { geracao: 1, despensa: { maca: { compradas: 5, usadas: 1 }, feno: { compradas: 1, usadas: 0 }, bolo: { compradas: 1, usadas: 0 } } } });
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e.despensa), { maca: { compradas: 5, usadas: 2 }, bolo: { compradas: 4, usadas: 1 }, feno: { compradas: 1, usadas: 0 } });
});

test('cópia com cuidados: vale o `em` mais recente (empate: o estado)', () => {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 80, sede: 80, em: 1000 }, 'h-cartinha': { fome: 50, sede: 50, em: 900 }, 'h-postal': { fome: 70, sede: 70, em: 500 } };
  const j = montar({ save: s, copia: { geracao: 1, cuidados: {
    inicial: { fome: 20, sede: 30, em: 2000 },     // mais recente: vence
    'h-cartinha': { fome: 10, sede: 10, em: 100 }, // mais antigo: não vence
    'h-postal': { fome: 1, sede: 1, em: 500 },     // empate: fica o do estado
    soCopia: { fome: 60, sede: 40, em: 50 },
  } } });
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e.cuidados), { inicial: { fome: 20, sede: 30, em: 2000 }, 'h-cartinha': s.cuidados['h-cartinha'], 'h-postal': s.cuidados['h-postal'], soCopia: { fome: 60, sede: 40, em: 50 } });
});

test('cópia com surpresa: só vale quando o estado não tem o campo', () => {
  let j = montar({ save: saveAtual(), copia: { geracao: 1, surpresa: false } });
  assert.strictEqual(j.P.carregar().ajustes.surpresa, false, 'estado sem o campo: vale a cópia');
  const s = saveAtual(); s.ajustes.surpresa = true;
  j = montar({ save: s, copia: { geracao: 1, surpresa: false } });
  assert.strictEqual(j.P.carregar().ajustes.surpresa, true, 'estado com o campo: vale o estado');
});

test('aba antiga no mesmo navegador grava por último: comida e cuidados voltam da cópia', () => {
  const j = montar({ save: saveAtual() });
  j.P.carregar();
  j.P.estado().despensa.maca = { compradas: 3, usadas: 1 };
  j.P.estado().cuidados.inicial = { fome: 40, sede: 60, em: j.relogio.agora };
  j.P.estado().ajustes.surpresa = false;
  j.P.gastarEstrelas(6); j.P.salvar(true);
  const gastas = j.P.estado().estrelas.gastas;
  abaAntigaGrava(j, j.P.estado());         // a aba velha regrava o save principal sem os campos novos
  const e = j.P.carregar();                 // tudo fechado; abre de novo com o código novo
  assert.deepStrictEqual(copia(e.despensa), { maca: { compradas: 3, usadas: 1 } });
  assert.deepStrictEqual(copia(e.cuidados.inicial), { fome: 40, sede: 60, em: j.relogio.agora });
  assert.strictEqual(e.ajustes.surpresa, false);
  assert.strictEqual(e.estrelas.gastas, gastas);
});

test('doc/servidor sem os campos e save local sem os campos: a cópia devolve e o doc é regravado com eles', async () => {
  const j = montar({ save: saveAtual() });
  j.P.carregar();
  j.P.estado().despensa.bolo = { compradas: 2, usadas: 0 };
  j.P.estado().cuidados.inicial = { fome: 30, sede: 30, em: j.relogio.agora };
  j.P.salvar(true);
  const antigo = semNovos(j.P.estado()); antigo.atualizado = j.relogio.agora + 5000; antigo.estrelas.ganhas += 1;
  abaAntigaGrava(j, antigo);
  const gravados = [];
  let ouvir = null;
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: true, data: () => ({ estado: copia(antigo), atualizado: antigo.atualizado }) }),
    set: (d) => { gravados.push(copia(d)); return Promise.resolve(); },
    onSnapshot: (fn) => { ouvir = fn; },
  }) }) };
  j.P.carregar();
  await j.P.iniciarNuvem();
  let e = j.P.estado();
  assert.deepStrictEqual(copia(e.despensa), { bolo: { compradas: 2, usadas: 0 } });
  assert.strictEqual(e.cuidados.inicial.fome, 30);
  assert.strictEqual(e.estrelas.ganhas, antigo.estrelas.ganhas);
  assert.ok(gravados.length && gravados[gravados.length - 1].estado.despensa.bolo.compradas === 2, 'o doc volta a ter a despensa');
  // chega pelo onSnapshot outro estado antigo, mais recente, sem os campos, e o save local de novo sem eles
  const antigo2 = copia(antigo); antigo2.atualizado += 5000;
  abaAntigaGrava(j, antigo2);
  j.P.estado().despensa = undefined;        // pior caso: nem a memória tem mais
  ouvir({ exists: true, data: () => ({ estado: copia(antigo2) }), metadata: { hasPendingWrites: false } });
  e = j.P.estado();
  assert.deepStrictEqual(copia(e.despensa), { bolo: { compradas: 2, usadas: 0 } });
  assert.strictEqual(e.cuidados.inicial.fome, 30);
});

test('"Novo ciclo" mantém e "Apagar tudo" não ressuscita despensa nem cuidados pela cópia', () => {
  const s = saveAtual();
  s.despensa = { maca: { compradas: 3, usadas: 1 } }; s.cuidados = { inicial: { fome: 40, sede: 30, em: 1750500000000 } };
  const j = montar({ save: s });
  j.P.carregar(); j.P.salvar(true);
  j.P.novoCiclo();
  assert.deepStrictEqual(copia(j.P.carregar().despensa), s.despensa);
  assert.strictEqual(j.copiaGuardada().ciclo, 2);
  j.P.apagarTudo();
  assert.deepStrictEqual(j.copiaGuardada().despensa, {}); assert.strictEqual(j.copiaGuardada().geracao, 2);
  let e = j.P.carregar();
  assert.deepStrictEqual(copia(e.despensa), {}); assert.deepStrictEqual(copia(e.cuidados), {});
  // aba antiga apaga tudo (geração 2, sem os campos) com a cópia ainda da geração 1
  const j2 = montar({ save: Object.assign(semNovos(saveAtual()), { geracao: 2, salas: {} }), copia: { geracao: 1, despensa: s.despensa, cuidados: s.cuidados } });
  e = j2.P.carregar();
  assert.deepStrictEqual(copia(e.despensa), {}); assert.deepStrictEqual(copia(e.cuidados), {});
  // e a mescla com um doc da geração 2 também não traz a cópia velha de volta
  const r = j2.P.mesclar(copia(e), Object.assign(semNovos(saveAtual()), { geracao: 2, atualizado: 9e12 }));
  assert.strictEqual(r.despensa && Object.keys(r.despensa).length || 0, 0);
});

test('localStorage bloqueado: carrega, salva e mescla sem erro', () => {
  const j = montar({ semArmazenamento: true });
  const e = j.P.carregar();
  assert.strictEqual(e.geracao, 1); assert.strictEqual(e.ajustes.surpresa, true);
  e.despensa.maca = { compradas: 1, usadas: 0 };
  j.P.salvar(true);
  assert.deepStrictEqual(copia(j.P.estado().despensa), { maca: { compradas: 1, usadas: 0 } });
});
