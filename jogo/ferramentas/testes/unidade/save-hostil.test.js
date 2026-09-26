// Testes de unidade: saves hostis ou estragados (__proto__, números estragados, registros inválidos) no carregar, na mescla, na cópia e na nuvem.
// Alvo: js/sistemas/progresso*.js e cuidados.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/save-hostil.test.js   (tudo: npm test, na raiz do repositório)
// Casos vindos de ferramentas/testes/testar-save.js (divididos por assunto na Fase 3).
const { test } = require('node:test');
const assert = require('assert');
const vm = require('vm');
const { montar, saveAtual, copia, sincronizar } = require('./ajudantes/jogo-save');

/* ---------- revisão de segurança: saves hostis ou estragados ---------- */
// o Object.prototype e o Object de DENTRO do vm e os de fora (o JSON do vm é o daqui, então U.copia cria objetos deste lado)
function prototipoLimpo(j) {
  const dentro = vm.runInContext('[({}).compradas, ({}).usadas, ({}).fome, ({}).em, ({}).polluted, Object.compradas, Object.prototype.compradas]', j.ctx);
  const fora = [({}).compradas, ({}).usadas, ({}).fome, ({}).em, ({}).polluted, Object.compradas, Object.prototype.compradas];
  return dentro.concat(fora).every((v) => v === undefined);
}
const hostil = (json) => JSON.parse(json);   // JSON.parse cria "__proto__" como chave própria, como chega do servidor

test('mescla hostil (__proto__, constructor, prototype) não suja o Object.prototype e não perde o outro lado', () => {
  const j = montar();
  const local = saveAtual(); local.atualizado = 1750900000000;
  local.despensa = { maca: { compradas: 2, usadas: 1 } };
  local.cuidados = { inicial: { fome: 50, sede: 50, em: 100 } };
  const remoto = saveAtual(); remoto.atualizado = 1750500000000;
  remoto.despensa = hostil('{"__proto__":{"compradas":7,"usadas":1,"polluted":1},"constructor":{"compradas":2,"usadas":0},"prototype":{"compradas":3,"usadas":0},"bolo":{"compradas":1,"usadas":0}}');
  remoto.cuidados = hostil('{"__proto__":{"fome":1,"sede":1,"em":9999999999999},"constructor":{"fome":1,"sede":1,"em":5},"h-postal":{"fome":30,"sede":40,"em":7}}');
  const txt = (o) => hostil(JSON.stringify(o));   // JSON.stringify mantém "__proto__" como chave própria
  [[local, remoto], [remoto, local]].forEach(([a, b]) => {
    const r = j.P.mesclar(txt(a), txt(b));
    assert.ok(prototipoLimpo(j), 'Object.prototype sujo');
    ['bolo', 'maca'].forEach((k) => assert.ok(Object.prototype.hasOwnProperty.call(r.despensa, k), k));
    ['h-postal', 'inicial'].forEach((k) => assert.ok(Object.prototype.hasOwnProperty.call(r.cuidados, k), 'o unicórnio que só está de um lado continua: ' + k));
    assert.deepStrictEqual(r.despensa.maca, { compradas: 2, usadas: 1 });
  });
  // o save hostil como lado mais recente (copiado inteiro pela mescla) também não suja
  j.P.mesclar(txt(local), Object.assign(txt(remoto), { atualizado: 1760000000000 }));
  assert.ok(prototipoLimpo(j));
});

test('save hostil pelo doc e pela cópia: carregar e sincronizar deixam o protótipo limpo', async () => {
  const s = saveAtual(); s.atualizado = 1750500000000;
  const j = montar({ save: s, copia: '{"geracao":1,"despensa":{"__proto__":{"compradas":7,"usadas":0}},"cuidados":{"constructor":{"fome":1,"sede":1,"em":5}}}' });
  j.P.carregar();
  assert.ok(prototipoLimpo(j));
  const doc = Object.assign(saveAtual(), { atualizado: 1760000000000 });
  const bruto = JSON.stringify(doc).replace(/}$/, ',"despensa":{"__proto__":{"compradas":7,"usadas":0,"polluted":1},"maca":{"compradas":1,"usadas":0}},"cuidados":{"__proto__":{"fome":1,"sede":1,"em":9e15}}}');
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: true, data: () => ({ estado: JSON.parse(bruto) }) }),
    set: () => Promise.resolve(), onSnapshot: () => {},
  }) }) };
  await j.P.iniciarNuvem();
  assert.ok(prototipoLimpo(j));
  assert.deepStrictEqual(copia(j.P.estado().despensa), { maca: { compradas: 1, usadas: 0 } });
  assert.deepStrictEqual(copia(j.P.estado().cuidados), {});
});

test('completar normaliza cuidados e despensa; comprar cobra e entrega certo', () => {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 'abc', sede: -50, em: 'x' }, 'h-cartinha': { fome: 1e308, sede: null, em: -1 }, 'h-postal': 'lixo', ok: { fome: 42.5, sede: 99, em: 1750000000000 } };
  s.despensa = { maca: { compradas: '5', usadas: 0 }, feno: { compradas: 0, usadas: 9 }, bolo: { compradas: -3, usadas: 'x' }, biscoito: { compradas: 2.7, usadas: 1 }, cenoura: 7 };
  const j = montar({ save: s });
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e.cuidados), {
    inicial: { fome: 100, sede: 0, em: 0 }, 'h-cartinha': { fome: 100, sede: 100, em: 0 }, ok: { fome: 42.5, sede: 99, em: 1750000000000 },
  });
  assert.deepStrictEqual(copia(e.despensa), {
    maca: { compradas: 5, usadas: 0 }, feno: { compradas: 0, usadas: 0 }, bolo: { compradas: 0, usadas: 0 }, biscoito: { compradas: 2, usadas: 1 },
  });
  const e0 = j.P.estrelas();
  assert.ok(j.C.comprar('maca').ok);
  assert.strictEqual(j.P.estado().despensa.maca.compradas, 6, 'texto "5" + 1 = 6, não "51"');
  assert.ok(j.C.comprar('feno').ok);
  assert.strictEqual(j.C.quantidade('feno'), 1, 'usadas > compradas não come a compra');
  assert.strictEqual(j.P.estrelas(), e0 - 3 - 4);
  j.C.iniciar(); j.tocar(); j.andar(3000);
  assert.ok(j.P.estado().cuidados.inicial.fome < 100, 'o relógio da fome anda sem erro');
});

test('cuidados e despensa que não são objetos viram {}; comprar, dar, beber e o relógio sem erro', () => {
  ['texto', 5, null, [1, 2], true].forEach((ruim) => {
    const s = saveAtual(); s.cuidados = ruim; s.despensa = ruim;
    const j = montar({ save: s });
    const e = j.P.carregar();
    assert.deepStrictEqual(copia(e.cuidados), {}); assert.deepStrictEqual(copia(e.despensa), {});
    const e0 = j.P.estrelas();
    assert.ok(j.C.comprar('maca').ok);
    assert.strictEqual(j.C.quantidade('maca'), 1); assert.strictEqual(j.P.estrelas(), e0 - 3);
    j.C.beber('inicial'); j.C.alimentar('inicial', 'maca');
    j.C.iniciar(); j.tocar(); j.andar(3000);
  });
});

test('estrelas estragadas contam como 0: o saldo nunca é NaN e nada sai de graça', () => {
  [{ ganhas: 'abc', gastas: 0 }, { ganhas: null, gastas: null }, { ganhas: {}, gastas: 3 }].forEach((est) => {
    const s = saveAtual(); s.estrelas = est;
    const j = montar({ save: s });
    j.P.carregar();
    assert.strictEqual(j.P.estrelas(), 0);
    assert.strictEqual(j.C.comprar('maca').ok, false);
    assert.strictEqual(j.C.quantidade('maca'), 0);
  });
  const s = saveAtual(); s.estrelas = { ganhas: 10, gastas: 'x' };
  const j = montar({ save: s }); j.P.carregar();
  assert.strictEqual(j.P.estrelas(), 10);
  assert.ok(j.C.comprar('maca').ok);
  assert.strictEqual(j.P.estado().estrelas.gastas, 3); assert.strictEqual(j.P.estrelas(), 7);
});

test('surpresa em texto vira booleano; outro valor volta ao padrão; o carimbo não muda', () => {
  [['false', false], ['true', true], ['x', true], [0, true], [null, true], [false, false]].forEach(([v, esperado]) => {
    const s = saveAtual(); s.ajustes.surpresa = v; s.ajustes.surpresaEm = 1234;
    const e = montar({ save: s }).P.carregar();
    assert.strictEqual(e.ajustes.surpresa, esperado, JSON.stringify(v));
    assert.strictEqual(e.ajustes.surpresaEm, 1234);
  });
});

test('normalização não muda nada de um save bom (antigo nem novo)', () => {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 12.25, sede: 100, em: 1750500000000 }, 'h-postal': { fome: 0, sede: 55, em: 1 } };
  s.despensa = { maca: { compradas: 3, usadas: 1 }, bolo: { compradas: 1, usadas: 1 } };
  s.ajustes.surpresa = false; s.ajustes.surpresaEm = 99;
  const e = montar({ save: s }).P.carregar();
  assert.deepStrictEqual(copia(e), s);
});

/* ---------- revalidação de segurança: a mescla com um lado estragado ---------- */
test('mescla: estrelas estragadas de um lado não apagam as boas do outro; números bons dão o mesmo de antes', () => {
  const j = montar();
  const bom = saveAtual(); bom.atualizado = 1750500000000; bom.estrelas = { ganhas: 40, gastas: 12 };
  [{ ganhas: 'abc', gastas: 'abc' }, { ganhas: null, gastas: null }, { ganhas: {}, gastas: [] }, null, 'x'].forEach((ruim) => {
    const mau = saveAtual(); mau.atualizado = 1750900000000; mau.estrelas = ruim;   // o estragado é o mais recente
    [[bom, mau], [mau, bom]].forEach(([a, b]) => {
      const r = j.P.mesclar(copia(a), copia(b));
      assert.deepStrictEqual(copia(r.estrelas), { ganhas: 40, gastas: 12 }, JSON.stringify(ruim));
    });
  });
  const neg = saveAtual(); neg.estrelas = { ganhas: 5, gastas: -30 };
  const zero = saveAtual(); zero.estrelas = { ganhas: 1, gastas: -2 };
  assert.deepStrictEqual(copia(j.P.mesclar(copia(neg), copia(zero)).estrelas), { ganhas: 5, gastas: 0 }, 'gastas negativo vira 0');
  const x = saveAtual(); x.estrelas = { ganhas: 7, gastas: 3 };
  const y = saveAtual(); y.atualizado += 1; y.estrelas = { ganhas: 9, gastas: 1 };
  assert.deepStrictEqual(copia(j.P.mesclar(copia(x), copia(y)).estrelas), { ganhas: 9, gastas: 3 });
  const z = saveAtual(); z.estrelas = { ganhas: '12', gastas: 2 };   // texto com número: como Math.max já fazia
  assert.deepStrictEqual(copia(j.P.mesclar(copia(z), copia(x)).estrelas), { ganhas: 12, gastas: 3 });
});

test('mescla: despensa ou cuidados que não são objeto no lado mais recente não apagam os do outro lado', () => {
  const j = montar();
  const bom = saveAtual(); bom.atualizado = 1750500000000;
  bom.despensa = { maca: { compradas: 3, usadas: 1 } }; bom.cuidados = { inicial: { fome: 20, sede: 30, em: 1750500000000 } };
  ['texto', 5, true, [1, 2], null].forEach((ruim) => {
    const mau = saveAtual(); mau.atualizado = 1750900000000; mau.despensa = ruim; mau.cuidados = ruim;
    [[bom, mau], [mau, bom]].forEach(([a, b]) => {
      const r = j.P.mesclar(copia(a), copia(b));
      assert.deepStrictEqual(copia(r.despensa), bom.despensa, JSON.stringify(ruim));
      assert.deepStrictEqual(copia(r.cuidados), bom.cuidados, JSON.stringify(ruim));
    });
  });
});

test('outro navegador (sem cópia) com doc estragado e mais recente: comida, cuidados e estrelas continuam', async () => {
  const s = saveAtual(); s.atualizado = 1750500000000; s.estrelas = { ganhas: 40, gastas: 12 };
  s.despensa = { bolo: { compradas: 2, usadas: 0 } }; s.cuidados = { inicial: { fome: 20, sede: 30, em: 1750500000000 } };
  const j = montar({ save: s });
  j.P.carregar();
  const doc = saveAtual(); doc.atualizado = 1760000000000; doc.despensa = 'lixo'; doc.cuidados = 7; doc.estrelas = { ganhas: 'abc', gastas: 'abc' };
  const gravados = [];
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: true, data: () => ({ estado: copia(doc) }) }),
    set: (d) => { gravados.push(copia(d)); return Promise.resolve(); }, onSnapshot: () => {},
  }) }) };
  await j.P.iniciarNuvem();
  const e = j.P.estado();
  assert.deepStrictEqual(copia(e.despensa), s.despensa);
  assert.strictEqual(e.cuidados.inicial.fome, 20);
  assert.deepStrictEqual(copia(e.estrelas), { ganhas: 40, gastas: 12 });
  assert.strictEqual(j.P.estrelas(), 28);
  const ult = gravados[gravados.length - 1].estado;
  assert.deepStrictEqual(ult.estrelas, { ganhas: 40, gastas: 12 }, 'o doc volta a ter números');
  assert.deepStrictEqual(ult.despensa, s.despensa);
});

test('mescla: um registro estragado da despensa num lado não apaga o registro bom do outro', () => {
  const j = montar();
  const bom = saveAtual(); bom.atualizado = 1750500000000;
  bom.despensa = { cenoura: { compradas: 3, usadas: 1 }, maca: { compradas: 2, usadas: 0 }, bolo: { compradas: 4, usadas: 2 } };
  const mau = saveAtual(); mau.atualizado = 1750900000000;   // o estragado é o mais recente
  mau.despensa = { cenoura: 'lixo', maca: [1], bolo: { compradas: 'abc', usadas: null }, feno: { compradas: 1, usadas: 0 } };
  [[bom, mau], [mau, bom]].forEach(([a, b]) => {
    const r = j.P.mesclar(copia(a), copia(b));
    assert.deepStrictEqual(copia(r.despensa), {
      cenoura: { compradas: 3, usadas: 1 }, maca: { compradas: 2, usadas: 0 }, bolo: { compradas: 4, usadas: 2 }, feno: { compradas: 1, usadas: 0 },
    });
  });
  // registro estragado dos dois lados: nada de NaN
  const m2 = saveAtual(); m2.despensa = { bolo: { compradas: 'x', usadas: 'y' } };
  const r2 = j.P.mesclar(copia(mau), copia(m2));
  assert.deepStrictEqual(copia(r2.despensa.bolo), { compradas: 0, usadas: 0 });
});

test('mescla: cuidados com registro ou carimbo estragado num lado não apagam o registro bom do outro', () => {
  const j = montar();
  const bom = saveAtual(); bom.atualizado = 1750500000000;
  bom.cuidados = { inicial: { fome: 20, sede: 30, em: 1000, acao: 900 }, 'h-cartinha': { fome: 40, sede: 40, em: 800 }, 'h-postal': { fome: 50, sede: 50, em: 700, acao: 600 } };
  const mau = saveAtual(); mau.atualizado = 1750900000000;
  mau.cuidados = { inicial: 'lixo', 'h-cartinha': { fome: 99, sede: 99, em: 'abc' }, 'h-postal': { fome: 99, sede: 99, em: 'abc', acao: 600 } };
  [[bom, mau], [mau, bom]].forEach(([a, b]) => {
    const r = j.P.mesclar(copia(a), copia(b));
    assert.deepStrictEqual(copia(r.cuidados.inicial), bom.cuidados.inicial);
    assert.deepStrictEqual(copia(r.cuidados['h-cartinha']), bom.cuidados['h-cartinha'], 'em estragado conta como 0');
    const p = r.cuidados['h-postal'];   // mesma ação: menor fome e sede, em sem NaN
    assert.strictEqual(p.fome, 50); assert.strictEqual(p.sede, 50); assert.strictEqual(p.acao, 600);
    assert.strictEqual(p.em, 700, 'em estragado conta como 0, sem NaN');
  });
});

test('outro navegador (sem cópia) com um registro da despensa estragado no doc mais recente: a comida continua', async () => {
  const s = saveAtual(); s.atualizado = 1750500000000;
  s.despensa = { cenoura: { compradas: 3, usadas: 1 }, maca: { compradas: 1, usadas: 0 } };
  const j = montar({ save: s });
  j.P.carregar();
  const doc = saveAtual(); doc.atualizado = 1760000000000; doc.despensa = { cenoura: 'lixo', maca: { compradas: 'abc', usadas: 0 } };
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: true, data: () => ({ estado: copia(doc) }) }),
    set: () => Promise.resolve(), onSnapshot: () => {},
  }) }) };
  await j.P.iniciarNuvem();
  assert.deepStrictEqual(copia(j.P.estado().despensa), s.despensa);
  assert.strictEqual(j.C.quantidade('cenoura'), 2);
});

test('cópia hostil que aparece depois de carregar: o que se grava sai normalizado (usadas ≤ compradas, fome ≤ 100)', () => {
  const s = saveAtual(); s.despensa = { maca: { compradas: 3, usadas: 0 } }; s.cuidados = { inicial: { fome: 50, sede: 50, em: 10 } };
  const j = montar({ save: s });
  j.P.carregar();
  j.guardado[j.chaveCopia] = JSON.stringify({ geracao: 1, despensa: { maca: { compradas: 3, usadas: 7 }, bolo: { compradas: 1.5, usadas: 4 } },
    cuidados: { inicial: { fome: 500, sede: 900, em: 20 } } });
  j.P.salvar(true);
  const principal = JSON.parse(j.guardado[j.R.config.chaveSave]), c = j.copiaGuardada();
  [principal.despensa, c.despensa, copia(j.P.estado().despensa)].forEach((d) => {
    assert.deepStrictEqual(d, { maca: { compradas: 3, usadas: 3 }, bolo: { compradas: 1, usadas: 1 } });
  });
  [principal.cuidados.inicial, c.cuidados.inicial].forEach((r) => { assert.strictEqual(r.fome, 100); assert.strictEqual(r.sede, 100); });
  assert.strictEqual(j.C.quantidade('maca'), 0);
  // e ao carregar com a mesma cópia hostil
  const j2 = montar({ save: s, copia: { geracao: 1, despensa: { maca: { compradas: 3, usadas: 7 } } } });
  assert.deepStrictEqual(copia(j2.P.carregar().despensa.maca), { compradas: 3, usadas: 3 });
});

test('nomes de Object.prototype (hasOwnProperty, toString…) nunca viram comida nem unicórnio; id desconhecido fica', async () => {
  const nomes = ['hasOwnProperty', 'toString', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', '__defineGetter__', '__lookupSetter__'];
  const lixoD = {}, lixoC = {};
  nomes.forEach((k) => { lixoD[k] = { compradas: 5, usadas: 0 }; lixoC[k] = { fome: 1, sede: 1, em: 9e12 }; });
  const s = saveAtual();
  s.despensa = Object.assign({ maca: { compradas: 2, usadas: 0 }, 'comida-nova': { compradas: 1, usadas: 0 } }, lixoD);
  s.cuidados = Object.assign({ inicial: { fome: 40, sede: 40, em: 5 }, 'uni-novo': { fome: 70, sede: 70, em: 5 } }, lixoC);
  const esperadoD = { maca: { compradas: 2, usadas: 0 }, 'comida-nova': { compradas: 1, usadas: 0 } };
  const esperadoC = { inicial: { fome: 40, sede: 40, em: 5 }, 'uni-novo': { fome: 70, sede: 70, em: 5 } };
  // carregar
  const j = montar({ save: s, copia: { geracao: 1, despensa: lixoD, cuidados: lixoC } });
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e.despensa), esperadoD); assert.deepStrictEqual(copia(e.cuidados), esperadoC);
  // sincronizar com um doc que traz esses nomes, mais recente e mais antigo (a mescla + completar do jogo)
  for (const atualizado of [1760000000000, 1700000000000]) {
    const doc = Object.assign(copia(s), { atualizado });
    const jj = montar({ save: Object.assign(saveAtual(), { despensa: { maca: { compradas: 2, usadas: 0 } } }) });
    jj.P.carregar();
    jj.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
      get: () => Promise.resolve({ exists: true, data: () => ({ estado: copia(doc) }) }), set: () => Promise.resolve(), onSnapshot: () => {},
    }) }) };
    await jj.P.iniciarNuvem();
    const r = jj.P.estado();
    nomes.forEach((k) => {
      assert.ok(!Object.prototype.hasOwnProperty.call(r.despensa, k), 'despensa: ' + k);
      assert.ok(!Object.prototype.hasOwnProperty.call(r.cuidados, k), 'cuidados: ' + k);
    });
    assert.deepStrictEqual(copia(r.despensa), esperadoD);
    assert.ok(r.cuidados['uni-novo'] && r.cuidados.inicial);
  }
  j.P.salvar(true);
  const principal = JSON.parse(j.guardado[j.R.config.chaveSave]);
  assert.deepStrictEqual(principal.despensa, esperadoD); assert.deepStrictEqual(j.copiaGuardada().despensa, esperadoD);
  assert.strictEqual(typeof j.P.estado().despensa.hasOwnProperty, 'function', 'hasOwnProperty continua o de Object.prototype');
});

test('rede lenta: gravação pendurada vira erro no limite, a próxima sai sozinha e leva tudo', async () => {
  const j = montar({ save: saveAtual(), timersReais: true });
  j.R.config.limiteRedeMs = 60; j.R.config.novaTentativaMs = 80;
  j.P.carregar();
  const sets = [], status = [];
  j.R.util.on('nuvem', (st) => status.push(st));
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: false, data: () => undefined }),
    // a 1ª gravação nunca responde (conexão pendurada); as outras respondem
    set: (d) => { sets.push(copia(d)); return sets.length === 1 ? new Promise(() => {}) : Promise.resolve(); },
    onSnapshot: () => {},
  }) }) };
  await j.P.iniciarNuvem();
  assert.strictEqual(sets.length, 1);
  j.P.gastarEstrelas(3); j.P.estado().despensa.maca = { compradas: 1, usadas: 0 };   // compra durante a trava
  j.P.salvar(true);
  await new Promise((ok) => setTimeout(ok, 100));
  assert.strictEqual(j.P.statusNuvem(), 'erro', 'passou do limite: erro');
  await new Promise((ok) => setTimeout(ok, 150));
  assert.ok(sets.length >= 2, 'a próxima gravação saiu');
  assert.strictEqual(j.P.statusNuvem(), 'sincronizado', 'e o indicador voltou');
  const ult = sets[sets.length - 1].estado;
  assert.deepStrictEqual(ult.despensa.maca, { compradas: 1, usadas: 0 });
  assert.strictEqual(ult.estrelas.gastas, j.P.estado().estrelas.gastas);
  assert.deepStrictEqual(status.slice(-2), ['erro', 'sincronizado']);
  await new Promise((ok) => setTimeout(ok, 200));
  assert.strictEqual(sets.length, 2, 'sem erro, não fica regravando');
});
