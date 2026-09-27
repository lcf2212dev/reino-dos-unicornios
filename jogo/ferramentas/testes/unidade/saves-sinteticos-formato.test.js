// Testes de unidade: os saves sintéticos do e2e/ver (testes/saves.js) no formato que o jogo grava de verdade
// (P.registrarTreino: melhor = 'ouro'|'prata'|'bronze', ouro/perfeito = carimbo; P.registrarProva: prêmio só com a
// nota de sucesso e o acessório do prêmio na loja). Formato impossível faz as imagens mostrarem um estado que não existe.
// gerarSaves roda dentro do jogo inteiro num vm (node: true), como na página. Nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/saves-sinteticos-formato.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');
const { gerarSaves } = require('../saves');

const ctx = Jogo.carregar(Jogo.contexto({ console, Math, Date }), Jogo.ordemDosPredios(Jogo.scripts()));
const R = ctx.Reino;
const bases = vm.runInContext(`(${gerarSaves.toString()})()`, ctx);
const MEDALHAS = ['ouro', 'prata', 'bronze'];

for (const nome of ['completo', 'avancado', 'ovos', 'inicio']) {
  test(`save sintético "${nome}": treinos no formato de P.registrarTreino`, () => {
    Object.entries(bases[nome].treinos || {}).forEach(([m, t]) => {
      assert.ok(t.melhor === undefined || MEDALHAS.includes(t.melhor), `${nome}.treinos.${m}.melhor = ${JSON.stringify(t.melhor)} (o jogo grava a medalha)`);
      ['ouro', 'perfeito'].forEach((k) => assert.ok(t[k] === undefined || (typeof t[k] === 'number' && t[k] > 0), `${nome}.treinos.${m}.${k} = ${JSON.stringify(t[k])} (o jogo grava o carimbo)`));
    });
  });
  test(`save sintético "${nome}": prova com prêmio tem nota de sucesso e o acessório na loja`, () => {
    Object.entries(bases[nome].provas || {}).forEach(([id, p]) => {
      if (!p.premio) return;
      const pv = R.prova(id);
      assert.ok(p.melhor >= R.config.notaSucessoProva, `${nome}.provas.${id}: prêmio ${p.premio} com melhor nota ${p.melhor} (< ${R.config.notaSucessoProva})`);
      assert.strictEqual(bases[nome].loja[pv.acessorios[p.premio].id], true, `${nome}.provas.${id}: prêmio ${p.premio} sem o acessório ${pv.acessorios[p.premio].id} na loja`);
    });
  });
}
