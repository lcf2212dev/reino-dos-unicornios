// Testes de unidade: cadência do passo pela distância (D3-07), pose cansada e patas encolhidas no pulo (D3-13).
// Carrega personagens/jogador.js e jogador-desenho.js num vm, com Mapa, Reino, PA e o save de mentira (nada toca
// no save real); o PA de mentira só anota o quadro e as opções pedidas.
// Rodar: node --test jogo/ferramentas/testes/unidade/passo-cadencia.test.js
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function montar({ estagio = 2, fator = 1 } = {}) {
  const pedidos = [];
  const sprite = () => ({ canvas: { width: 20, height: 20 }, w: 20, h: 20 });
  const ctx = {
    Math, console, WeakMap, Object,
    Mapa: { T: 16 },
    PA: {
      VISTAS: ['frente', 'costas', 'lado', 'diagFrente', 'diagCostas'],
      _interno: { PULO: 3 },
      vistaDaDirecao: () => ({ vista: 'lado', espelhar: false }),
      montada: (def, est, quadro, ap, op) => { pedidos.push({ quem: 'montada', quadro, cansado: !!op.cansado }); return sprite(); },
      unicornio: (def, est, quadro, op) => { pedidos.push({ quem: 'bebe', quadro, cansado: !!op.cansado }); return sprite(); },
      mariana: (ap, sentada, quadro) => { pedidos.push({ quem: 'mariana', quadro }); return sprite(); },
    },
    Reino: {
      util: { reduzMovimentoSistema: false },
      Progresso: {
        estado: () => ({ unis: { u: { xp: 0 } }, usando: { enfeites: [] }, aparencia: {}, ajustes: { animacoes: true } }),
        montaria: () => 'u', defUni: () => ({ id: 'u' }),
      },
      Unicornios: { estagio: () => estagio },
      Cuidados: { fatorVelocidade: () => fator, iconeMontaria: () => null, sujo: () => false },
    },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  ['jogador.js', 'jogador-desenho.js'].forEach((f) => {
    const arq = path.join(__dirname, '../../../js/personagens', f);
    vm.runInContext(fs.readFileSync(arq, 'utf8'), ctx, { filename: arq });
  });
  const J = ctx.Jogador;
  // um quadro desenhado: devolve o que foi pedido ao PA
  J.desenharAgora = () => { pedidos.length = 0; J.itensDesenho({}, true); return pedidos.slice(); };
  return J;
}
const PASSOS = [1, 0, 2, 0];

test('passo: com o relógio parado, o quadro avança pela distância andada', () => {
  const J = montar();
  J.t = 5; J.andando = true; J.x = 100; J.y = 100;
  const quadros = [];
  for (let d = 0; d <= 96; d += 2) { J.x = 100 + d; quadros.push(J.desenharAgora()[0].quadro); }
  // montada: um quadro a cada 12 px (d = 0, 2, 4…: índice d / 2)
  for (let d = 0; d <= 96; d += 2) assert.strictEqual(quadros[d / 2], PASSOS[Math.floor(d / 12) % 4], 'd=' + d);
  assert.deepStrictEqual([...new Set(quadros)].sort(), [0, 1, 2], 'os três quadros aparecem');
});

test('passo: parada no mesmo lugar, o tempo passando não troca o quadro', () => {
  const J = montar();
  J.andando = true; J.x = 50; J.y = 50;
  const quadros = [];
  for (let i = 0; i < 20; i++) { J.t = i * 0.1; quadros.push(J.desenharAgora()[0].quadro); }
  assert.strictEqual(new Set(quadros).size, 1);
});

test('passo: mais devagar (fome, sede, nado) o passo encolhe junto: mesma distância, mesmos quadros', () => {
  const seq = (dt, vel) => {
    const J = montar();
    J.andando = true; J.x = 0; J.y = 0;
    const q = [];
    for (let i = 0; i < 40; i++) { J.t = i * dt; J.x = i * dt * vel; q.push(J.desenharAgora()[0].quadro); }
    return q;
  };
  // 82 px/s a cada 1/60 s × 57,4 px/s (70 %) a cada 1/42 s: o mesmo 1,37 px por desenho
  assert.deepStrictEqual(seq(1 / 60, 82), seq(1 / 42, 57.4));
});

test('passo: um salto de mais de um tile (entrar num prédio) não conta como passo', () => {
  const J = montar();
  J.andando = true; J.x = 0; J.y = 0; J.desenharAgora();
  J.x = 400; J.y = 300;
  assert.strictEqual(J.desenharAgora()[0].quadro, PASSOS[0]);
  assert.strictEqual(J.passo.dist, 0);
});

test('passo: a pé, um quadro a cada 8 px, e a Mariana e o bebê no mesmo tempo', () => {
  const J = montar({ estagio: 0 });
  J.t = 1; J.andando = true; J.x = 0; J.y = 0;
  J.desenharAgora();
  J.x = 8;
  const p = J.desenharAgora();
  assert.strictEqual(p.find((x) => x.quem === 'mariana').quadro, PASSOS[1]);
  assert.strictEqual(p.find((x) => x.quem === 'bebe').quadro, PASSOS[1]);
});

test('pose cansada: só com Cuidados.fatorVelocidade() < 1', () => {
  assert.strictEqual(montar({ fator: 0.7 }).desenharAgora()[0].cansado, true);
  assert.strictEqual(montar({ fator: 1 }).desenharAgora()[0].cansado, false);
});

test('pulo alto: acima da metade da altura, o unicórnio encolhe as patas (quadro PULO); a Mariana a pé, não', () => {
  const J = montar();
  J.t = 10; J.salto = { t0: 10 - 0.45, altura: 28, ms: 900 };   // no alto do pulo
  assert.strictEqual(J.desenharAgora()[0].quadro, 3);
  J.salto = { t0: 10 - 0.05, altura: 28, ms: 900 };            // saindo do chão
  assert.notStrictEqual(J.desenharAgora()[0].quadro, 3);
  const B = montar({ estagio: 0 });
  B.t = 10; B.salto = { t0: 10 - 0.45, altura: 28, ms: 900 };
  const p = B.desenharAgora();
  assert.strictEqual(p.find((x) => x.quem === 'bebe').quadro, 3);
  assert.notStrictEqual(p.find((x) => x.quem === 'mariana').quadro, 3);
});
