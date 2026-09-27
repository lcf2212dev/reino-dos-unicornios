// Testes de unidade: o AudioContext volta a tocar depois de uma interrupção (js/sistemas/som.js, S.ativar).
// Bug da auditoria (suspeita fx2, sem iPad para confirmar): o Safari do iPad/iPhone põe o contexto em
// 'interrupted' (tela bloqueada, ligação, outro app tocando), e o S.ativar só retomava em 'suspended':
// efeitos, música e voz ficavam mudos até recarregar. Confere que o toque seguinte retoma em 'suspended' e
// 'interrupted', e nunca num contexto 'closed' (resume() nele rejeita). Num vm com um AudioContext de mentira.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/som-interrompido.test.js
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');

// som.js sozinho, com um AudioContext de mentira que conta os resume()
function montarSom() {
  const contextos = [];
  class ContextoFalso {
    constructor() { this.state = 'running'; this.resumes = 0; this.destination = {}; contextos.push(this); }
    createGain() { return { gain: { value: 1 }, connect() {} }; }
    resume() { this.resumes++; return Promise.resolve(); }
  }
  const ctx = { Reino: {}, console, Math, JSON };
  ctx.window = ctx; ctx.AudioContext = ContextoFalso;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(Jogo.arquivo('sistemas/som'), 'utf8'), ctx, { filename: 'som.js' });
  return { S: ctx.Reino.Som, contextos };
}

for (const [estado, retoma] of [['suspended', true], ['interrupted', true], ['closed', false], ['running', false]]) {
  test('S.ativar com o contexto em ' + estado + ': ' + (retoma ? 'retoma' : 'não chama resume()'), () => {
    const { S, contextos } = montarSom();
    S.ativar();                              // 1º toque: cria o contexto
    assert.strictEqual(contextos.length, 1);
    contextos[0].state = estado;             // ex.: o Safari interrompeu (tela bloqueada, ligação)
    S.ativar();                              // o toque seguinte
    assert.strictEqual(contextos.length, 1, 'criou outro contexto');
    assert.strictEqual(contextos[0].resumes, retoma ? 1 : 0);
  });
}
