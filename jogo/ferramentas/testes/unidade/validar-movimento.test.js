// Testes de unidade: o validador de movimento (ferramentas/validar/validar-movimento.js; docs/contratos/arte.md §15).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/validar-movimento.test.js
const { test } = require('node:test');
const assert = require('assert');
const { checar } = require('../../validar/validar-movimento');

const RAIZ = ':root { --rapido: 120ms; --normal: 240ms; --lento: 600ms; }\n';
const UNICA = ':is(button, [role="button"]):active:not(:disabled):not([aria-disabled="true"]):not(.indisponivel) { transform: translateY(var(--degrau, 0px)); box-shadow: var(--brilho-apertado, none); animation: none; }\n';
const CFG = { rapido: 120, normal: 240, lento: 600 };
const erros = (css, arq = 'x.css', cfg = CFG) => checar({ 'ui-base.css': RAIZ + UNICA, [arq]: css }, cfg);
const total = (v) => Object.values(v).reduce((n, l) => n + l.length, 0);

test('movimento: durações só por token', () => {
  assert.strictEqual(total(erros('.a { transition: transform var(--rapido); } .b { animation: x calc(3 * var(--lento)) steps(2) infinite; } .c { animation: y var(--normal) steps(1) 3; }')), 0);
  assert.strictEqual(erros('.a { transition: transform 0.08s, box-shadow 0.08s; }').duracao.length, 1);
  assert.strictEqual(erros('.a { animation: x var(--lento) infinite; }').duracao.length, 1, 'infinite curto');
  assert.strictEqual(erros('.a { animation: x calc(1.5 * var(--lento)); }').duracao.length, 1, 'fator não inteiro');
  assert.strictEqual(total(erros('body.sem-animacao .a { transition-duration: 0ms; } @media (prefers-reduced-motion: reduce) { .a { animation-duration: 0.01ms !important; } }')), 0, 'saídas');
  assert.strictEqual(erros('.a { transition-duration: 0ms; }').duracao.length, 1, '0ms fora da saída');
  assert.strictEqual(total(erros('.a { transition: left 0.15s; } /* movimento-ok: teste */')), 0, 'marca de exceção');
  assert.strictEqual(total(erros('.balao-respira { transition: transform 3.1s ease-in-out; }', 'ui-prova.css')), 0, 'exceção escrita');
});

test('movimento: tocável com sombra declara --degrau igual', () => {
  assert.strictEqual(erros('.b { box-shadow: var(--sombra-grande); }').degrau.length, 1);
  assert.strictEqual(erros('.b { box-shadow: 0 2px 0 var(--borda); --degrau: 4px; }').degrau.length, 1, 'altura errada');
  assert.strictEqual(total(erros('.b { box-shadow: var(--sombra-pequena); --degrau: 2px; } .b.certa { box-shadow: var(--sombra-pequena); }')), 0, 'regra da classe base');
  assert.strictEqual(total(erros('.painel { box-shadow: var(--sombra-grande); } .b { box-shadow: inset 0 2px 0 var(--brilho); } .c:active { color: red; }')), 0, 'não tocável e brilho inset');
  assert.strictEqual(total(erros(':is(button:disabled, .indisponivel) { box-shadow: var(--sombra-pequena); }')), 0, 'indisponível');
  assert.strictEqual(erros('.e, .f:active { box-shadow: 0 4px 0 #000; }').degrau.length, 1, 'parte sem :active na lista é cobrada');
  assert.strictEqual(erros('.w :is(.g, .h) { box-shadow: 0 2px 0 #000; }').degrau.length, 1, ':is com vírgula no fim');
  assert.strictEqual(erros('.k { box-shadow: 0 4px 0 var(--x, var(--y)); }').degrau.length, 1, 'var aninhada');
  assert.strictEqual(total(erros('.k { box-shadow: 0 4px 0 var(--x, var(--y)); --degrau: 4px; }')), 0, 'var aninhada com --degrau');
});

test('movimento: :active só na regra única', () => {
  assert.strictEqual(erros('.b:active { transform: translateY(2px); }').active.length, 1);
  assert.strictEqual(erros('.b:active { box-shadow: none; }').active.length, 1);
  assert.strictEqual(total(erros('.b:not(:active) { transform: scale(1); }')), 0, ':not(:active) não é apertado');
  assert.strictEqual(erros(':is(.x:active, .y) { transform: translateY(2px); }').active.length, 1, ':active dentro de :is');
  assert.strictEqual(erros('body.sem-animacao .b:active { transform: none; }').active.length, 1, 'saída não desliga o afundar');
  assert.strictEqual(total(erros('.dock-btn:active { background: var(--ambar-claro); }')), 0);
  assert.strictEqual(erros('', 'x.css', { rapido: 100, normal: 240, lento: 600 }).config.length, 1, ':root x config');
  assert.strictEqual(checar({ 'ui-base.css': UNICA }, CFG).config.length, 3, 'tokens faltando');
});
