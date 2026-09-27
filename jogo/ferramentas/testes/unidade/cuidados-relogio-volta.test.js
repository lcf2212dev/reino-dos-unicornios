// Testes de unidade: relógio do aparelho que volta no tempo com o jogo aberto (js/sistemas/cuidados.js, C.ativo).
// Bug da auditoria (suspeita fx2): relógio adiantado corrigido pela rede deixava o último toque "no futuro", e os
// cuidados continuavam ativos (gastando fome e sede e gravando) sem nenhum toque por até o salto + 5 min.
// Confere que, sem toque, eles param em no máximo 5 min depois da volta, e que um toque novo religa na hora;
// e que a gravação periódica (60 s) e o próximo lembrete (10 min) não atrasam pelo tamanho do salto.
// Saves 100% sintéticos, num vm com relógio de mentira (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/cuidados-relogio-volta.test.js
const { test } = require('node:test');
const assert = require('assert');
const { jogoCarregado } = require('./ajudantes/jogo-save');

const MIN = 60 * 1000;

test('relógio volta 1 h depois do toque: sem toque, os cuidados param em até 5 min', () => {
  const j = jogoCarregado();
  j.C.iniciar();
  j.tocar();
  j.andar(MIN);
  j.relogio.agora -= 60 * MIN;             // o aparelho acerta o relógio (estava 1 h adiantado)
  j.andar(5 * MIN + 2000);                 // 5 min sem nenhum toque
  assert.strictEqual(j.C.ativo(), false, 'cuidados ativos sem toque depois de o relógio voltar');
  const sede = j.C.niveis().sede, salvos = j.contagem.salvar;
  j.andar(20 * MIN);
  assert.strictEqual(j.C.niveis().sede, sede, 'gastou sem toque depois de o relógio voltar');
  assert.strictEqual(j.contagem.salvar, salvos, 'gravou sem toque depois de o relógio voltar');
  j.tocar();                               // um toque novo religa na hora
  assert.strictEqual(j.C.ativo(), true);
  j.andar(MIN);
  assert.ok(j.C.niveis().sede < sede, 'não voltou a gastar depois do toque');
});

test('relógio volta 1 h: com toque contínuo, a gravação periódica sai no prazo normal (60 s)', () => {
  const j = jogoCarregado();
  j.C.iniciar();
  j.tocar();
  j.andar(90 * 1000);                      // já gravou uma vez pelo tempo
  j.relogio.agora -= 60 * MIN;
  const salvos = j.contagem.salvar;
  for (let s = 0; s < 65; s += 5) { j.tocar(); j.andar(5000); }
  assert.ok(j.contagem.salvar > salvos, 'não gravou em 65 s depois de o relógio voltar');
});

test('relógio volta 1 h: com toque contínuo, o próximo lembrete sai no prazo normal (10 min)', () => {
  const j = jogoCarregado();
  j.C.avancar(46 * MIN);                   // sede abaixo de 25: lembra
  j.C.iniciar();
  j.tocar();
  j.andar(2000);
  assert.strictEqual(j.balao.falas.length, 1, 'o primeiro lembrete não saiu');
  j.relogio.agora -= 60 * MIN;
  for (let m = 0; m < 11; m++) { j.tocar(); j.andar(MIN); }
  assert.strictEqual(j.balao.falas.length, 2, 'o lembrete seguinte não saiu em 11 min depois de o relógio voltar');
});
