// Testes de unidade: dois aparelhos e os carimbos de comer e beber (acao, acaoFome, acaoSede): D1, S3-5 e a aba da versão anterior (L2).
// Alvo: js/sistemas/cuidados.js e progresso-mescla.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/cuidados-carimbos.test.js   (tudo: npm test, na raiz do repositório)
// Casos vindos de ferramentas/testes/testar-save.js (divididos por assunto na Fase 3).
const { test } = require('node:test');
const assert = require('assert');
const { montar, saveAtual, copia, semNovos, jogoCarregado, sincronizar, esperar, docFalso } = require('./ajudantes/jogo-save');

/* ---------- D1: dois aparelhos, o carimbo `acao` (comer/beber) e o gasto do relógio ---------- */

// dois aparelhos com o mesmo save, relógios juntos, os dois iniciados (jogo aberto e tocado)
function doisAparelhos(ajuste) {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 20, sede: 90, em: 1750500000000, acao: 1750400000000 } };
  s.despensa = { maca: { compradas: 1, usadas: 0 } };
  if (ajuste) ajuste(s);
  const A = montar({ save: s }), B = montar({ save: s });
  B.relogio.agora = A.relogio.agora;
  A.P.carregar(); B.P.carregar();
  A.C.iniciar(); B.C.iniciar();
  return { A, B, banco: { valor: null } };
}
// os dois relógios andam juntos, de 1 em 1 s; `ativos` diz quem está jogando (tocado)
function andarJuntos(A, B, ms, ativos) {
  for (let t = 0; t < ms; t += 1000) {
    ativos.forEach((j) => j.tocar());
    A.andar(1000); B.andar(1000);
  }
}
const fomeDe = (e, id = 'inicial') => e.cuidados[id].fome;

test('D1: com os dois aparelhos ativos, a maçã dada num deles vale nos dois e no banco', () => {
  const { A, B, banco } = doisAparelhos();
  sincronizar(A, banco); sincronizar(B, banco);
  andarJuntos(A, B, 60 * 1000, [A, B]);
  const r = A.C.alimentar('inicial', 'maca');
  assert.strictEqual(r.ok, true);
  const depois = r.depois;                 // ~49,5
  sincronizar(A, banco);
  // de 25 em 25 s por 100 s, cada um sincroniza na sua vez (o validador viu B ficar em ~19)
  for (let i = 0; i < 4; i++) {
    andarJuntos(A, B, 25 * 1000, [A, B]);
    sincronizar(i % 2 ? A : B, banco);
    sincronizar(i % 2 ? B : A, banco);
  }
  const gasto100s = 100 / (120 * 60) * 100;   // ~1,39 ponto de fome
  [A.P.estado(), B.P.estado(), banco.valor].forEach((e, n) => {
    assert.ok(Math.abs(fomeDe(e) - (depois - gasto100s)) < 0.05, ['A', 'B', 'banco'][n] + ': fome ' + fomeDe(e));
    assert.strictEqual(e.despensa.maca.usadas, 1, 'a maçã conta uma vez só');
  });
});

test('D1: dois aparelhos comendo em horários diferentes: vale a ação mais recente, nas duas ordens', () => {
  const { A, B } = doisAparelhos((s) => { s.despensa = { maca: { compradas: 2, usadas: 0 }, bolo: { compradas: 1, usadas: 0 } }; });
  andarJuntos(A, B, 30 * 1000, [A, B]);
  A.C.alimentar('inicial', 'maca');        // A come primeiro (~49,7)
  andarJuntos(A, B, 30 * 1000, [A, B]);
  B.C.alimentar('inicial', 'bolo');        // B come depois, sem ter visto a maçã: enche
  andarJuntos(A, B, 30 * 1000, [A, B]);    // A continua gastando, com `em` mais novo que a ação do B
  const b = B.P.estado(), a = A.P.estado();
  assert.ok(a.cuidados.inicial.em >= b.cuidados.inicial.acao);
  [A.P.mesclar(a, b), A.P.mesclar(b, a)].forEach((r) => {
    assert.strictEqual(r.cuidados.inicial.acao, b.cuidados.inicial.acao, 'ação do B é a mais recente');
    assert.strictEqual(r.cuidados.inicial.fome, b.cuidados.inicial.fome);
  });
  // agora A come de novo: a ação dele passa a ser a mais recente
  A.C.alimentar('inicial', 'maca');
  const a2 = A.P.estado();
  [A.P.mesclar(a2, b), A.P.mesclar(b, a2)].forEach((r) => assert.strictEqual(r.cuidados.inicial.fome, a2.cuidados.inicial.fome));
});

test('D1: um aparelho parado e outro gastando: vale o que gastou, mesmo se o parado gravou por último', () => {
  const { A, B } = doisAparelhos();
  A.documento.hidden = true;               // A aberto com a aba no fundo: não gasta
  andarJuntos(A, B, 10 * 60 * 1000, [B]);  // só B joga 10 min
  const b = copia(B.P.estado());
  A.relogio.agora += 1000;
  A.P.estado().ajustes.som = false; A.P.salvar();   // A grava depois (atualizado maior) sem ter gastado
  const a = copia(A.P.estado());
  assert.ok(a.atualizado > b.atualizado);
  assert.strictEqual(a.cuidados.inicial.fome, 20);
  [A.P.mesclar(a, b), A.P.mesclar(b, a)].forEach((r) => {
    assert.ok(Math.abs(r.cuidados.inicial.fome - (20 - 10 / 120 * 100)) < 1e-6, 'fome ' + r.cuidados.inicial.fome);
    assert.ok(Math.abs(r.cuidados.inicial.sede - (90 - 10 / 60 * 100)) < 1e-6);
    assert.strictEqual(r.ajustes.som, false);
  });
});

test('D1: mesma ação dos dois lados: menor fome e menor sede, de cada campo, nas duas ordens', () => {
  const P = montar().P;
  const a = saveAtual(), b = saveAtual();
  a.atualizado = 2000; b.atualizado = 1000;
  a.cuidados = { inicial: { fome: 40, sede: 10, em: 900, acao: 500 } };
  b.cuidados = { inicial: { fome: 30, sede: 20, em: 800, acao: 500 } };
  [P.mesclar(a, b), P.mesclar(b, a)].forEach((r) => assert.deepStrictEqual(copia(r.cuidados.inicial), { fome: 30, sede: 10, em: 900, acao: 500 }));
  // os originais não mudam
  assert.strictEqual(a.cuidados.inicial.fome, 40); assert.strictEqual(b.cuidados.inicial.sede, 20);
});

test('D1: um lado sem `acao` (versão anterior desta branch): vale a regra de antes, o `em` maior', () => {
  const P = montar().P;
  const a = saveAtual(), b = saveAtual();
  a.atualizado = 2000; b.atualizado = 1000;
  a.cuidados = { inicial: { fome: 90, sede: 90, em: 500, acao: 400 }, 'h-cartinha': { fome: 50, sede: 50, em: 700 } };
  b.cuidados = { inicial: { fome: 10, sede: 10, em: 600 }, 'h-cartinha': { fome: 60, sede: 60, em: 700, acao: 1 } };
  [P.mesclar(a, b), P.mesclar(b, a)].forEach((r) => {
    assert.deepStrictEqual(copia(r.cuidados.inicial), b.cuidados.inicial, 'em maior vence');
  });
  // empate de `em` sem `acao` num dos lados: o lado mais recente (como antes)
  assert.deepStrictEqual(copia(P.mesclar(a, b).cuidados['h-cartinha']), a.cuidados['h-cartinha']);
  // `acao` estragada conta como ausente
  b.cuidados.inicial = { fome: 10, sede: 10, em: 600, acao: 'ontem' };
  assert.strictEqual(P.mesclar(a, b).cuidados.inicial.fome, 10);
});

test('D1: save antigo sem cuidados: nada some; o primeiro gasto cria o registro com acao 0', () => {
  const antigo = semNovos(saveAtual()); antigo.atualizado = 1750900000000;
  const novo = saveAtual();
  novo.cuidados = { inicial: { fome: 20, sede: 30, em: 1750500000000, acao: 1750400000000 } };
  const P = montar().P;
  [P.mesclar(novo, antigo), P.mesclar(antigo, novo)].forEach((r) => assert.deepStrictEqual(copia(r.cuidados), novo.cuidados));
  const j = montar({ save: antigo });
  j.P.carregar();
  j.C.avancar(60 * 1000);
  const reg = j.P.estado().cuidados.inicial;
  assert.strictEqual(reg.acao, 0);
  assert.ok(reg.fome < 100 && reg.sede < 100);
});

test('D1: registro da versão anterior ganha acao 0 no gasto, e uma comida do outro aparelho vence', () => {
  const { A, B } = doisAparelhos((s) => { s.cuidados = { inicial: { fome: 20, sede: 90, em: 1750500000000 } }; });
  andarJuntos(A, B, 5 * 1000, [A, B]);
  assert.strictEqual(B.P.estado().cuidados.inicial.acao, 0);
  A.C.alimentar('inicial', 'maca');
  andarJuntos(A, B, 20 * 1000, [A, B]);    // B gasta depois da maçã (em mais novo que a ação do A)
  const a = A.P.estado(), b = B.P.estado();
  assert.ok(b.cuidados.inicial.em > a.cuidados.inicial.acao);
  [A.P.mesclar(a, b), A.P.mesclar(b, a)].forEach((r) => assert.ok(r.cuidados.inicial.fome > 45, 'fome ' + r.cuidados.inicial.fome));
});

test('D1: duas ações no mesmo milissegundo não empatam (acao sempre cresce)', () => {
  const j = jogoCarregado((s) => { s.despensa = { maca: { compradas: 1, usadas: 0 } }; });
  j.C.avancar(50 * 60 * 1000);
  j.C.beber('inicial');
  const a1 = j.P.estado().cuidados.inicial.acao;
  j.C.alimentar('inicial', 'maca');        // mesmo relógio
  const r = j.P.estado().cuidados.inicial;
  assert.ok(r.acao > a1);
  assert.strictEqual(r.sede, 100);
});

test('D1: a cópia de segurança segue a mesma regra (ação mais nova vence; empate, o menor)', () => {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 70, sede: 70, em: 1000, acao: 900 } };
  // cópia com `em` mais novo, mas ação mais velha: não desfaz a comida do estado
  let j = montar({ save: s, copia: { geracao: 1, cuidados: { inicial: { fome: 10, sede: 10, em: 5000, acao: 100 } } } });
  assert.strictEqual(j.P.carregar().cuidados.inicial.fome, 70);
  // mesma ação: vale o menor de cada
  j = montar({ save: s, copia: { geracao: 1, cuidados: { inicial: { fome: 60, sede: 80, em: 950, acao: 900 } } } });
  const e = j.P.carregar().cuidados.inicial;
  assert.strictEqual(e.fome, 60); assert.strictEqual(e.sede, 70);
  // ação mais nova na cópia: vence
  j = montar({ save: s, copia: { geracao: 1, cuidados: { inicial: { fome: 99, sede: 99, em: 950, acao: 950 } } } });
  assert.strictEqual(j.P.carregar().cuidados.inicial.fome, 99);
});

/* ---------- S3-5: um carimbo por campo (`acaoFome`, `acaoSede`) ---------- */
function aparelhosS35(ajuste) {
  const s = saveAtual();
  s.estrelas = { ganhas: 100, gastas: 0 };
  s.despensa = { maca: { compradas: 1, usadas: 0 } };
  s.cuidados = { 'h-cartinha': { fome: 30, sede: 30, em: 1750000000000, acao: 1750000000000 } };   // registro da versão anterior (só `acao`)
  if (ajuste) ajuste(s);
  const A = montar({ save: copia(s) }), B = montar({ save: copia(s) });
  A.P.carregar(); B.P.carregar();
  return { A, B };
}

test('S3-5: maçã dada em B e água dada em A (sem ter visto a maçã): as duas valem, nos dois sentidos da mescla', () => {
  const { A, B } = aparelhosS35();
  B.relogio.agora += 1000;
  assert.ok(B.C.alimentar('h-cartinha', 'maca').ok);                   // fome 30 → 60
  A.relogio.agora += 5000;                                               // ~4 s depois, sem ter visto
  assert.ok(A.C.beber('h-cartinha').ok);                                  // sede 30 → 100
  const rb = B.P.estado().cuidados['h-cartinha'], ra = A.P.estado().cuidados['h-cartinha'];
  assert.strictEqual(rb.acaoSede, 1750000000000, 'comer não mexe no carimbo da sede');
  assert.strictEqual(ra.acaoFome, 1750000000000, 'beber não mexe no carimbo da fome');
  [[A, B], [B, A]].forEach(([x, y]) => {
    const r = x.P.mesclar(copia(x.P.estado()), copia(y.P.estado()));
    const c = r.cuidados['h-cartinha'];
    assert.strictEqual(c.fome, 60, 'a maçã vale'); assert.strictEqual(c.sede, 100, 'a água vale');
    assert.strictEqual(c.acaoFome, rb.acaoFome); assert.strictEqual(c.acaoSede, ra.acaoSede);
    assert.strictEqual(c.acao, Math.max(rb.acao, ra.acao));
    assert.deepStrictEqual(r.despensa.maca, { compradas: 1, usadas: 1 });
  });
});

test('S3-5: empate por campo = menor valor; `acao` sozinho vale para os dois campos; sem carimbo, o `em`', () => {
  const P = montar().P;
  const a = saveAtual(), b = saveAtual(); a.atualizado = 2000; b.atualizado = 1000;
  // empate nos dois campos (a mesma ação vista pelos dois, o relógio gastou diferente)
  a.cuidados = { inicial: { fome: 40, sede: 10, em: 900, acao: 500, acaoFome: 500, acaoSede: 300 } };
  b.cuidados = { inicial: { fome: 30, sede: 20, em: 800, acao: 500, acaoFome: 500, acaoSede: 300 } };
  [P.mesclar(copia(a), copia(b)), P.mesclar(copia(b), copia(a))].forEach((r) =>
    assert.deepStrictEqual(copia(r.cuidados.inicial), { fome: 30, sede: 10, em: 900, acao: 500, acaoFome: 500, acaoSede: 300 }));
  // um lado da versão anterior (só `acao` = 400): perde a fome (500 > 400) e ganha a sede (400 > 300)
  b.cuidados = { inicial: { fome: 5, sede: 95, em: 800, acao: 400 } };
  [P.mesclar(copia(a), copia(b)), P.mesclar(copia(b), copia(a))].forEach((r) => {
    const c = r.cuidados.inicial;
    assert.strictEqual(c.fome, 40); assert.strictEqual(c.sede, 95); assert.strictEqual(c.acaoFome, 500); assert.strictEqual(c.acaoSede, 400);
  });
  // os dois só com `acao` (versão anterior dos dois lados): como antes, os dois campos do lado com a `acao` maior
  const x = saveAtual(), y = saveAtual();
  x.cuidados = { inicial: { fome: 90, sede: 90, em: 500, acao: 400 } }; y.cuidados = { inicial: { fome: 10, sede: 20, em: 450, acao: 450 } };
  [P.mesclar(copia(x), copia(y)), P.mesclar(copia(y), copia(x))].forEach((r) => {
    const c = r.cuidados.inicial;
    assert.strictEqual(c.fome, 10); assert.strictEqual(c.sede, 20); assert.strictEqual(c.acao, 450);
    assert.ok(!('acaoFome' in c) && !('acaoSede' in c), 'não inventa campos');
  });
  // um lado sem carimbo nenhum: o registro do `em` maior
  y.cuidados = { inicial: { fome: 10, sede: 20, em: 600 } };
  assert.deepStrictEqual(copia(P.mesclar(copia(x), copia(y)).cuidados.inicial), { fome: 10, sede: 20, em: 600 });
});

test('S3-5: carimbo por campo estragado conta como ausente (vale o `acao`); normalização e cópia de segurança', () => {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 50, sede: 50, em: 10, acao: 100, acaoFome: 'ontem', acaoSede: 90 } };
  const j = montar({ save: s, copia: { geracao: 1, cuidados: { inicial: { fome: 77, sede: 1, em: 5, acao: 200, acaoFome: 200, acaoSede: 50 } } } });
  const c = j.P.carregar().cuidados.inicial;
  assert.strictEqual(c.fome, 77, 'a comida mais nova da cópia vale (200 > acao 100 do estado)');
  assert.strictEqual(c.sede, 50, 'a água do estado é mais nova que a da cópia (50)');
  // (L2) o `acao` 100 do estado é mais novo que o único carimbo de campo válido (90): vale para a sede também
  assert.strictEqual(c.acaoFome, 200); assert.strictEqual(c.acaoSede, 100);
  j.P.salvar(true);
  const cop = j.copiaGuardada().cuidados.inicial;
  assert.strictEqual(cop.acaoFome, 200); assert.strictEqual(cop.acaoSede, 100);
  // normalização: carimbo por campo estragado sai (o `acao` continua valendo para ele)
  const s2 = saveAtual(); s2.cuidados = { inicial: { fome: 50, sede: 50, em: 10, acao: 100, acaoFome: 'x', acaoSede: -3 } };
  const c2 = montar({ save: s2 }).P.carregar().cuidados.inicial;
  assert.ok(!('acaoFome' in c2) && !('acaoSede' in c2)); assert.strictEqual(c2.acao, 100);
});

test('S3-5: a água dada aqui volta ao banco que só tem a comida do outro aparelho (e o banco igual não reenvia)', async () => {
  const { A, B } = aparelhosS35();
  B.relogio.agora += 1000; B.C.alimentar('h-cartinha', 'maca');
  A.relogio.agora += 5000; A.C.beber('h-cartinha');
  const banco = copia(B.P.estado()); banco.atualizado = A.P.estado().atualizado + 1000;   // o banco tem a maçã de B
  const d = docFalso(A, banco);
  await A.P.iniciarNuvem(); await esperar();
  const env = d.enviados[d.enviados.length - 1].estado.cuidados['h-cartinha'];
  assert.strictEqual(env.fome, 60); assert.strictEqual(env.sede, 100);
  const n = d.enviados.length;
  d.chegou(copia(A.P.estado())); d.rodarTimers(); await esperar();
  assert.strictEqual(d.enviados.length, n, 'sem vaivém');
});

/* ---------- L2: aba da versão anterior desta branch (só conhece o `acao`) ---------- */
// o que a versão anterior (D1) fazia ao dar comida ou água: mexe no campo e marca só o `acao` (e o `em`)
function acaoVersaoAnterior(r, campo, valor, t) { r[campo] = valor; r.em = r.acao = Math.max(t, r.acao + 1); }

test('L2: água dada numa aba da versão anterior (só `acao`) vale na mescla, nos dois sentidos', () => {
  const P = montar().P;
  const base = { fome: 30, sede: 30, em: 1000, acao: 1000, acaoFome: 1000, acaoSede: 1000 };
  const a = saveAtual(), b = saveAtual(); a.atualizado = 2000; b.atualizado = 3000;
  a.cuidados = { 'h-cartinha': copia(base) }; b.cuidados = { 'h-cartinha': copia(base) };
  acaoVersaoAnterior(b.cuidados['h-cartinha'], 'sede', 100, 5000);          // a aba velha deu água
  a.cuidados['h-cartinha'].sede = 20; a.cuidados['h-cartinha'].em = 6000;  // aqui o relógio só gastou
  [[a, b], [b, a]].forEach(([x, y]) => {
    const c = P.mesclar(copia(x), copia(y)).cuidados['h-cartinha'];
    assert.strictEqual(c.sede, 100, 'a água da aba velha vale');
    assert.strictEqual(c.acaoSede, 5000); assert.strictEqual(c.acao, 5000);
  });
  // a aba velha deu comida e a nova deu água depois: as duas valem
  const x = saveAtual(), y = saveAtual();
  x.cuidados = { 'h-cartinha': copia(base) }; y.cuidados = { 'h-cartinha': copia(base) };
  acaoVersaoAnterior(x.cuidados['h-cartinha'], 'fome', 60, 5000);
  Object.assign(y.cuidados['h-cartinha'], { sede: 100, em: 7000, acao: 7000, acaoSede: 7000 });
  [[x, y], [y, x]].forEach(([p, q]) => {
    const c = P.mesclar(copia(p), copia(q)).cuidados['h-cartinha'];
    assert.strictEqual(c.fome, 60); assert.strictEqual(c.sede, 100);
    assert.strictEqual(c.acaoFome, 5000); assert.strictEqual(c.acaoSede, 7000); assert.strictEqual(c.acao, 7000);
  });
});

test('L2: a normalização sobe os carimbos de campo até o `acao` mais novo (e não mexe no registro de hoje)', () => {
  const s = saveAtual();
  s.cuidados = {
    velha: { fome: 30, sede: 100, em: 5000, acao: 5000, acaoFome: 1000, acaoSede: 1000 },   // a aba velha agiu depois
    hoje: { fome: 60, sede: 100, em: 7000, acao: 7000, acaoFome: 5000, acaoSede: 7000 },    // registro da versão atual
    soAcao: { fome: 50, sede: 50, em: 10, acao: 10 },                                        // versão anterior: sem campos
  };
  const e = montar({ save: s }).P.carregar();
  assert.strictEqual(e.cuidados.velha.acaoFome, 5000); assert.strictEqual(e.cuidados.velha.acaoSede, 5000);
  assert.deepStrictEqual(copia(e.cuidados.hoje), s.cuidados.hoje);
  assert.ok(!('acaoFome' in e.cuidados.soAcao), 'não inventa campos');
  // e comer aqui depois não esconde a água da aba velha (o carimbo da sede já subiu)
  const j = montar({ save: s }); j.P.carregar();
  j.P.estado().unis.velha = { em: 1, xp: 0, chocado: true };
  j.relogio.agora = 9000; j.P.estado().despensa.maca = { compradas: 1, usadas: 0 };
  assert.ok(j.C.alimentar('velha', 'maca').ok);
  const r = j.P.estado().cuidados.velha;
  assert.strictEqual(r.acaoSede, 5000); assert.strictEqual(r.acaoFome, r.acao); assert.ok(r.acaoFome >= 9000);
});

test('L2: o S3-5 continua (comida em B e água em A valem as duas) com o carimbo efetivo', () => {
  const { A, B } = aparelhosS35();
  B.relogio.agora += 1000; assert.ok(B.C.alimentar('h-cartinha', 'maca').ok);
  A.relogio.agora += 5000; assert.ok(A.C.beber('h-cartinha').ok);
  [[A, B], [B, A]].forEach(([x, y]) => {
    const c = x.P.mesclar(copia(x.P.estado()), copia(y.P.estado())).cuidados['h-cartinha'];
    assert.strictEqual(c.fome, 60); assert.strictEqual(c.sede, 100);
  });
  // e depois de carregar (normalização) também
  const junto = A.P.mesclar(copia(A.P.estado()), copia(B.P.estado()));
  const C3 = montar({ save: junto }); const c = C3.P.carregar().cuidados['h-cartinha'];
  assert.strictEqual(c.fome, 60); assert.strictEqual(c.sede, 100);
});
