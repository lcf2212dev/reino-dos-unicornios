// Testes de unidade: a comida de graça da Minha Casa (Reino.Cuidados.comerEmCasa; docs/contratos/cuidados.md §2 e §4).
// Alvo: js/sistemas/cuidados.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/cuidados-casa.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { copia, jogoCarregado } = require('./ajudantes/jogo-save');

test('comerEmCasa: fome + quanto (no máximo 100), de graça, sem despensa; grava e avisa na hora', () => {
  const j = jogoCarregado((s) => { s.estrelas = { ganhas: 50, gastas: 0 }; s.despensa = { maca: { compradas: 2, usadas: 0 } }; });
  j.C.avancar(60 * 60 * 1000);                    // fome 50, sede 0
  const n0 = j.C.niveis('inicial'), estrelas = j.P.estrelas(), salvar = j.contagem.salvar, ev = j.eventos.length;
  const sede0 = j.P.estado().cuidados.inicial.acaoSede;
  j.relogio.agora += 1000;
  const r = j.C.comerEmCasa('inicial', 30);
  assert.deepStrictEqual(copia(r), { ok: true, antes: n0.fome, depois: n0.fome + 30 });
  assert.strictEqual(j.C.niveis('inicial').fome, n0.fome + 30);
  assert.strictEqual(j.C.niveis('inicial').sede, n0.sede, 'comer mexeu na sede');
  assert.strictEqual(j.P.estrelas(), estrelas, 'comida de casa gastou estrela');
  assert.deepStrictEqual(copia(j.P.estado().despensa), { maca: { compradas: 2, usadas: 0 } }, 'comida de casa usou a despensa');
  assert.strictEqual(j.contagem.salvar, salvar + 1, 'não gravou na hora');
  assert.ok(j.eventos.length > ev, 'não emitiu cuidados');
  const reg = j.P.estado().cuidados.inicial;
  assert.strictEqual(reg.acaoFome, j.relogio.agora, 'carimbo da fome');
  assert.strictEqual(reg.acaoSede, sede0, 'comer mudou o carimbo da sede');
  assert.strictEqual(j.lido().cuidados.inicial.fome, n0.fome + 30, 'o save gravado não tem a fome nova');
  // passa de 100: fica em 100; cheio (>= 99,5): não muda nem grava
  assert.strictEqual(j.C.comerEmCasa('inicial', 60).depois, 100);
  const s2 = j.contagem.salvar;
  assert.deepStrictEqual(copia(j.C.comerEmCasa('inicial', 30)), { ok: false, motivo: 'cheio' });
  assert.strictEqual(j.contagem.salvar, s2);
});

test('comerEmCasa: sem uniId = a montaria; unicórnio não chocado = sem-uni; quanto inválido = sem-comida', () => {
  const j = jogoCarregado();
  j.C.avancar(60 * 60 * 1000);
  const f = j.C.niveis('inicial').fome;
  assert.strictEqual(j.C.comerEmCasa(null, 10).depois, f + 10, 'sem id: a montaria');
  assert.deepStrictEqual(copia(j.C.comerEmCasa('h-postal', 30)), { ok: false, motivo: 'sem-uni' });
  assert.strictEqual(j.P.estado().cuidados['h-postal'], undefined, 'criou registro para ovo');
  // quanto <= 0 ou não numérico: sem-comida, sem gravar nem carimbar
  const reg = copia(j.P.estado().cuidados.inicial), salvar = j.contagem.salvar;
  ['muito', -40, 0, NaN, Infinity, undefined, '30'].forEach((q) => {
    assert.deepStrictEqual(copia(j.C.comerEmCasa('inicial', q)), { ok: false, motivo: 'sem-comida' }, String(q));
  });
  assert.deepStrictEqual(copia(j.P.estado().cuidados.inicial), reg, 'quanto inválido mexeu no registro');
  assert.strictEqual(j.contagem.salvar, salvar, 'quanto inválido gravou');
});
