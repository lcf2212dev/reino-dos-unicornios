// Testes de unidade: Jogador.pular (docs/contratos/viagem.md §7). Carrega só personagens/jogador.js num vm,
// com Mapa, Reino e o save de mentira (nada toca no save real). Rodar: node --test jogo/ferramentas/testes/unidade/pulo.test.js
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function montar({ animacoes = true, reduz = false } = {}) {
  const ctx = {
    Math, console,
    Mapa: { T: 16 },
    PA: { vistaDaDirecao: () => ({ vista: 'frente', espelhar: false }) },
    Reino: {
      util: { reduzMovimentoSistema: reduz },
      Progresso: { estado: () => ({ ajustes: { animacoes } }) },
    },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  const arq = path.join(__dirname, '../../../js/personagens/jogador.js');
  vm.runInContext(fs.readFileSync(arq, 'utf8'), ctx, { filename: arq });
  return ctx.Jogador;
}

test('pulo: sobe até a altura no meio e volta a 0 em ms', () => {
  const J = montar();
  assert.strictEqual(J.pulando(), false);
  assert.strictEqual(J.alturaPulo(), 0);
  assert.strictEqual(J.pular({ altura: 28, ms: 900 }), true);
  assert.strictEqual(J.pulando(), true);
  const alturas = [];
  for (let i = 1; i <= 9; i++) { J.t = i / 10; alturas.push(J.alturaPulo()); }
  assert.ok(alturas[0] > 7, 'sai rápido do chão (parábola, não elevador)');
  assert.ok(alturas.every(Number.isInteger), 'altura em pixel inteiro do jogo');
  assert.ok(Math.max.apply(null, alturas.slice(0, 8)) > 26, 'chega perto dos 28 px no meio');
  assert.ok(alturas[1] < alturas[3] && alturas[6] < alturas[4], 'sobe e desce');
  assert.strictEqual(alturas[8], 0, 'em 900 ms volta ao chão');
  assert.strictEqual(J.pulando(), false);
});

test('pulo: pular no meio do pulo não reinicia', () => {
  const J = montar();
  assert.strictEqual(J.pular(), true);
  J.t += 0.3;
  const antes = J.alturaPulo();
  assert.strictEqual(J.pular(), false);
  assert.strictEqual(J.alturaPulo(), antes);
  J.t += 0.7;
  assert.strictEqual(J.pular(), true, 'depois do fim pode pular de novo');
});

test('pulo: relógio parado (determinístico) congela a altura', () => {
  const J = montar();
  J.pular(); J.t += 0.45;
  const a = J.alturaPulo();
  assert.strictEqual(J.alturaPulo(), a);
  assert.ok(a > 27);
});

test('pulo: sem Animações ou com movimento reduzido não pula', () => {
  assert.strictEqual(montar({ animacoes: false }).pular(), false);
  const J = montar({ reduz: true });
  assert.strictEqual(J.pular(), false);
  assert.strictEqual(J.pulando(), false);
});

// fração das amostras acima de 75 % da altura, num pulo inteiro
function noAlto(op) {
  const J = montar();
  J.pular(op);
  const t0 = J.t, n = 200;
  let alto = 0;
  for (let i = 0; i < n; i++) { J.t = t0 + (i + 0.5) / n * op.ms / 1000; if (J.alturaPulo() > 0.75 * op.altura) alto++; }
  return alto / n;
}

test('pulo: parábola, e a Lua fica mais tempo no alto que Júpiter (D9-14)', () => {
  const lua = noAlto({ altura: 28, ms: 900 }), jupiter = noAlto({ altura: 34, ms: 650 });
  assert.ok(lua >= 0.5, `Lua no alto: ${lua}`);
  assert.ok(jupiter >= 0.5, `Júpiter no alto: ${jupiter}`);
  assert.ok(lua > jupiter, `Lua (${lua}) mais que Júpiter (${jupiter})`);
});
