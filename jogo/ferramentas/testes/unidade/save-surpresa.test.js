// Testes de unidade: o carimbo do interruptor da surpresa (ajustes.surpresaEm) no save, na mescla e na cópia.
// Alvo: js/sistemas/progresso*.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/save-surpresa.test.js   (tudo: npm test, na raiz do repositório)
// Casos vindos de ferramentas/testes/testar-save.js (divididos por assunto na Fase 3).
const { test } = require('node:test');
const assert = require('assert');
const { montar, saveAtual, copia, semNovos } = require('./ajudantes/jogo-save');

/* ---------- carimbo da surpresa (ajustes.surpresaEm) ---------- */
test('surpresa: trocar e salvar carimba; carregar, salvar sem trocar, estadoNovo e apagar tudo não carimbam', () => {
  const j = montar({ save: saveAtual() });
  let e = j.P.carregar();
  assert.strictEqual(e.ajustes.surpresaEm, undefined, 'carregar não carimba');
  j.P.salvar(true);
  assert.strictEqual(j.P.estado().ajustes.surpresaEm, undefined, 'salvar sem trocar não carimba');
  j.relogio.agora += 1000;
  j.P.estado().ajustes.surpresa = false; j.P.salvar(true);          // o que o interruptor de ui.js faz
  assert.strictEqual(j.P.estado().ajustes.surpresaEm, j.relogio.agora);
  assert.strictEqual(j.copiaGuardada().surpresaEm, j.relogio.agora, 'a cópia leva o carimbo');
  const em = j.relogio.agora;
  j.relogio.agora += 1000; j.P.salvar(true);
  assert.strictEqual(j.P.estado().ajustes.surpresaEm, em, 'salvar de novo sem trocar mantém o carimbo');
  j.relogio.agora += 1000; j.P.estado().ajustes.surpresa = true; j.P.salvar(true);
  assert.strictEqual(j.P.estado().ajustes.surpresaEm, j.relogio.agora, 'religar também carimba');
  j.P.apagarTudo();
  assert.strictEqual(j.P.estado().ajustes.surpresaEm, undefined, 'apagar tudo não carimba');
  assert.strictEqual(montar().P.carregar().ajustes.surpresaEm, undefined, 'estadoNovo sem carimbo');
});

test('surpresa: na mescla vale o carimbo maior, qualquer que seja o lado mais recente; sem carimbo, a regra de antes', () => {
  const j = montar();
  const a = saveAtual(); a.atualizado = 1750900000000; a.ajustes.surpresa = true;
  const b = saveAtual(); b.atualizado = 1750500000000; b.ajustes.surpresa = false; b.ajustes.surpresaEm = 1750400000000;
  [[a, b], [b, a]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    assert.strictEqual(r.ajustes.surpresa, false); assert.strictEqual(r.ajustes.surpresaEm, 1750400000000);
  });
  const a2 = copia(a); a2.ajustes.surpresaEm = 1750450000000;   // religou depois
  [[a2, b], [b, a2]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    assert.strictEqual(r.ajustes.surpresa, true); assert.strictEqual(r.ajustes.surpresaEm, 1750450000000);
  });
  const a3 = copia(a); delete a3.ajustes.surpresaEm; const b3 = copia(b); delete b3.ajustes.surpresaEm;
  assert.strictEqual(j.P.mesclar(copia(a3), copia(b3)).ajustes.surpresa, true, 'sem carimbo: lado mais recente');
  const a4 = semNovos(a);
  assert.strictEqual(j.P.mesclar(copia(a4), copia(b3)).ajustes.surpresa, false, 'sem carimbo e o mais recente sem o campo: vale o outro');
  assert.strictEqual(j.P.mesclar(copia(a4), copia(b)).ajustes.surpresaEm, 1750400000000);
});

test('surpresa: três aparelhos (desliga no 1, o antigo grava sem o campo, um 3º novo abre) ficam desligados', () => {
  // aparelho 1 (novo): ela desliga
  const um = montar({ save: saveAtual() });
  um.P.carregar(); um.relogio.agora += 1000;
  um.P.estado().ajustes.surpresa = false; um.P.salvar(true);
  let banco = copia(um.P.estado());
  // aparelho antigo: grava por último sem o campo (nem o carimbo)
  const antigo = semNovos(banco); antigo.atualizado = banco.atualizado + 60000; antigo.estrelas.ganhas += 2;
  banco = antigo;
  // aparelho 3 (novo), surpresa ligada por padrão, abre e sincroniza
  const tres = montar({ save: saveAtual() });
  const e3 = tres.P.carregar();
  assert.strictEqual(e3.ajustes.surpresa, true);
  banco = copia(tres.P.mesclar(copia(e3), copia(banco)));
  assert.strictEqual(banco.ajustes.surpresa, true, 'aqui o 3º religa (ninguém tem carimbo no banco)');
  // o aparelho 1 sincroniza: o carimbo dele vence, e o banco e o 3º voltam a desligado
  banco = copia(um.P.mesclar(copia(um.P.estado()), copia(banco)));
  assert.strictEqual(banco.ajustes.surpresa, false); assert.ok(banco.ajustes.surpresaEm > 0);
  assert.strictEqual(tres.P.mesclar(copia(e3), copia(banco)).ajustes.surpresa, false);
  assert.strictEqual(banco.estrelas.ganhas, antigo.estrelas.ganhas);
  // e o aparelho 1 sozinho, mesmo com o banco religado pelo 3º, fica desligado ao reabrir (a cópia tem o carimbo)
  um.guardado[um.R.config.chaveSave] = JSON.stringify(Object.assign(semNovos(antigo), { ajustes: Object.assign({}, antigo.ajustes, { surpresa: true }) }));
  assert.strictEqual(um.P.carregar().ajustes.surpresa, false);
});

test('surpresa na cópia: carimbo mais novo que o do estado vence; mais velho não', () => {
  const s = saveAtual(); s.ajustes.surpresa = true; s.ajustes.surpresaEm = 5000;
  let j = montar({ save: s, copia: { geracao: 1, surpresa: false, surpresaEm: 6000 } });
  let e = j.P.carregar();
  assert.strictEqual(e.ajustes.surpresa, false); assert.strictEqual(e.ajustes.surpresaEm, 6000);
  j = montar({ save: s, copia: { geracao: 1, surpresa: false, surpresaEm: 4000 } });
  e = j.P.carregar();
  assert.strictEqual(e.ajustes.surpresa, true); assert.strictEqual(e.ajustes.surpresaEm, 5000);
  const s2 = saveAtual(); s2.ajustes.surpresa = true;           // estado sem carimbo (padrão), cópia com carimbo
  j = montar({ save: s2, copia: { geracao: 1, surpresa: false, surpresaEm: 10 } });
  assert.strictEqual(j.P.carregar().ajustes.surpresa, false);
  j = montar({ save: s2, copia: { geracao: 1, surpresa: false, surpresaEm: 'ontem' } });   // carimbo estragado = sem carimbo
  assert.strictEqual(j.P.carregar().ajustes.surpresa, true);
});
