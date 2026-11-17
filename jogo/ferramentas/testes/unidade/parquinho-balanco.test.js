// Testes de unidade: o balanço do Parquinho (js/interiores/parquinho/brincar.js, balanco.js, poses-balanco.js;
// docs/contratos/parquinho.md §4). Ela puxa e solta; não sai sozinha; puxou tudo, os dois voam para a caixa de areia.
// O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js), relógio e timers de mentira
// (o tempo só anda no andar()); toques e teclas pelos ouvintes do window. Nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/parquinho-balanco.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje } = require('./ajudantes/jogo-save');

// o vm tem outro Object: compara pelo JSON
const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);

function jogo(opcoes = {}) {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: saveHoje() }); } finally { Jogo.scripts = orig; }
  j.P.carregar();
  if (opcoes.semAnimacoes) j.P.estado().ajustes.animacoes = false;
  // relógio e timers de mentira: performance.now = o relógio do vm; setTimeout guarda e o andar() dispara
  const fila = [];
  let seq = 0;
  j.ctx.performance = { now: () => j.relogio.agora };
  j.ctx.setTimeout = (fn, ms) => { fila.push({ id: ++seq, em: j.relogio.agora + (ms || 0), fn }); return seq; };
  j.ctx.clearTimeout = (id) => { const i = fila.findIndex((x) => x.id === id); if (i >= 0) fila.splice(i, 1); };
  j.passar = (ms, passo = 16) => {
    for (let t = 0; t < ms; t += passo) {
      j.relogio.agora += passo;
      fila.sort((a, b) => a.em - b.em);
      while (fila.length && fila[0].em <= j.relogio.agora) fila.shift().fn();
      j.R.ParquinhoBrincar.itens({}, j.relogio.agora, true);   // um quadro (o balanço anda no desenho)
    }
  };
  // a cena: o parquinho, com uns tiles sólidos à escolha; o Jogador de mentira
  const def = j.R.Interiores.doLugar('parquinho');
  const solidos = new Set(opcoes.solidos || []);
  j.cenaAtual = { id: 'parquinho', solido: (x, y) => solidos.has(x + ',' + y) };
  let ocupada = null;
  Object.assign(j.R.Cena, { atual: () => j.cenaAtual, ocupar: (m) => { ocupada = m; }, liberar: (m) => { if (m === ocupada) ocupada = null; }, ocupada: () => ocupada });
  j.posicoes = [];
  j.ctx.Jogador = { x: 4 * 16 + 8, y: 6 * 16 + 12, posicionar(tx, ty) { this.x = tx * 16 + 8; this.y = ty * 16 + 12; j.posicoes.push([tx, ty]); }, virar() {} };
  j.tombos = 0;
  j.R._predios.parquinho.areiaTombo = () => { j.tombos++; };
  j.def = def;
  j.objeto = (brinquedo) => def.objetos.find((o) => o.acao && o.acao.brinquedo === brinquedo);
  j.brincar = (brinquedo) => j.R.ParquinhoBrincar.brincar({ tipo: 'parquinhoBrincar', brinquedo }, { interior: def, objeto: j.objeto(brinquedo) });
  const ev = (type, extra) => Object.assign({ type, pointerId: 1, clientX: 200, clientY: 400, cancelable: true, stopPropagation() {}, preventDefault() {} }, extra);
  j.disparar = (type, extra) => (j.ouvintes['win:' + type] || []).slice().forEach((fn) => fn(ev(type, extra)));
  j.apertar = (x, y) => j.disparar('pointerdown', { clientX: x, clientY: y });
  j.mover = (x, y) => j.disparar('pointermove', { clientX: x, clientY: y });
  j.soltar = (x, y) => j.disparar('pointerup', { clientX: x, clientY: y });
  j.tecla = (key, sobe) => j.disparar(sobe ? 'keyup' : 'keydown', { key, repeat: false });
  j.estado = () => j.R.ParquinhoBrincar.depurar();
  return j;
}
const C = (j) => j.R.config.parquinho.balanco;

test('balanço: as contas (vai e volta perdendo amortece, pico da frente, puxou tudo, direção e tecla)', () => {
  const j = jogo(), B = j.R._predios.parquinho.Balanco, c = C(j), T = c.periodoMs;
  assert.ok(Math.abs(B.solto(-1, 0) + 1) < 1e-9, 'soltou de trás: começa lá');
  assert.ok(Math.abs(B.solto(-1, T / 2) - c.amortece) < 1e-9, 'meia ida e volta depois: na frente, com amortece');
  assert.ok(Math.abs(B.solto(-1, T) + c.amortece * c.amortece) < 1e-9, 'uma inteira: atrás de novo, menor');
  assert.strictEqual(B.picoFrente(-1), T / 2);
  assert.strictEqual(B.picoFrente(0.8), T, 'puxado para a frente: o próximo pico da frente é uma volta depois');
  assert.ok(B.parou(-1, 40 * T) && B.solto(-1, 40 * T) === 0, 'para sozinho');
  assert.ok(B.picos(-1).length > 3 && B.picos(-1).every((ms, i) => ms === (i + 1) * T / 2));
  assert.strictEqual(B.voa(c.cheio), true); assert.strictEqual(B.voa(-c.cheio), true); assert.strictEqual(B.voa(c.cheio - 0.01), false);
  assert.strictEqual(B.direcao(0, -50), -1, 'para cima = para trás');
  assert.strictEqual(B.direcao(30, 0), -1, 'para o lado também puxa para trás');
  assert.strictEqual(B.direcao(5, 50), 1, 'para baixo = para a frente');
  assert.strictEqual(B.arrasto(0, 0, -c.puxarPx / 2, -1), -0.5);
  assert.strictEqual(B.arrasto(0, 0, -c.puxarPx * 3, -1), -1, 'não passa de tudo');
  assert.strictEqual(B.tecla(0, c.teclaMs / 2), -0.5);
  assert.strictEqual(B.tecla(0, c.teclaMs * 2), -1);
  const v0 = B.voo(0, { x: 0, y: 10, chao: 30 }, { x: 40, y: 100 }, 20), v1 = B.voo(1, { x: 0, y: 10, chao: 30 }, { x: 40, y: 100 }, 20);
  igual([v0.x, v0.y, v1.x, v1.y], [0, 10, 40, 100], 'o voo sai do assento e cai no ponto da areia');
  igual([0, 0.2, 0.3, 0.6, 0.8, 1].map((k) => B.quarto(k, 1)), [0, 0, 1, 2, 3, 0], 'cambalhota em quartos');
});

test('balanço: a caixa de areia do interior e o tile livre ao lado dela', () => {
  const j = jogo(), B = j.R._predios.parquinho.Balanco;
  const cx = B.caixa(j.def.objetos);
  igual(cx, { x: 3, y: 10, w: 3, h: 2 }, 'a caixa logo abaixo do balanço');
  igual(B.ladoDaCaixa(cx, () => false), { x: 4, y: 12 }, 'embaixo, no meio');
  igual(B.ladoDaCaixa(cx, (x, y) => y === 12), { x: 6, y: 11 }, 'embaixo ocupado: à direita');
  igual(B.ladoDaCaixa(cx, () => true), { x: 4, y: 12 }, 'tudo ocupado: o de baixo');
});

test('balanço: senta e fica sentada; não balança nem sai sozinha', () => {
  const j = jogo();
  j.brincar('balanco');
  j.passar(20000);
  const e = j.estado();
  assert.strictEqual(e.ativo, true, 'continua no balanço depois de 20 s');
  assert.strictEqual(e.modo, 'parado'); assert.strictEqual(e.a, 0);
  assert.strictEqual(e.maozinha, true, 'a mãozinha ensina o gesto');
  // o Enter que começou não solta nada; Esc desce
  j.tecla('Enter', true);
  assert.strictEqual(j.estado().ativo, true);
  j.tecla('Escape');
  assert.strictEqual(j.estado().ativo, false);
  igual(j.posicoes, [], 'desceu onde estava');
});

test('balanço: arrastar puxa, soltar vai e volta e para aos poucos; ela continua sentada; toque sem arrastar desce', () => {
  const j = jogo(), c = C(j);
  j.brincar('balanco');
  j.apertar(200, 400);   // antes de pularDepoisMs: o toque que sentou não conta
  j.soltar(200, 400);
  assert.strictEqual(j.estado().ativo, true);
  j.passar(800);
  j.apertar(200, 400); j.mover(200, 400 - c.puxarPx / 2); j.passar(400);
  let e = j.estado();
  assert.strictEqual(e.modo, 'segura'); assert.ok(e.a < -0.45 && e.alvo === -0.5, 'puxado meio para trás: ' + JSON.stringify(e));
  assert.strictEqual(e.maozinha, false, 'a mãozinha some depois do 1º puxão');
  j.soltar(200, 400 - c.puxarPx / 2);
  j.passar(c.periodoMs / 2);
  e = j.estado();
  assert.strictEqual(e.modo, 'solto'); assert.ok(e.a > 0.3, 'meia volta depois: lá na frente (' + e.a + ')');
  assert.strictEqual(e.voa, false);
  j.passar(c.periodoMs * 20);
  e = j.estado();
  assert.strictEqual(e.ativo, true); assert.strictEqual(e.modo, 'parado'); assert.strictEqual(e.a, 0);
  // toque sem arrastar: desce
  j.apertar(100, 300); j.passar(100); j.soltar(103, 302);
  assert.strictEqual(j.estado().ativo, false);
  igual(j.posicoes, []);
});

test('balanço: puxou tudo e soltou: os dois voam, caem na caixa de areia e ela fica em pé ao lado', () => {
  const j = jogo(), c = C(j);
  j.brincar('balanco');
  j.passar(800);
  j.apertar(200, 500); j.mover(200, 500 - c.puxarPx * 1.2); j.passar(300);
  assert.strictEqual(j.estado().alvo, -1);
  j.soltar(200, 500 - c.puxarPx * 1.2);
  assert.strictEqual(j.estado().voa, true);
  j.passar(c.periodoMs / 2 + 100);
  assert.strictEqual(j.estado().fase, 'voo');
  // durante o voo um toque não faz nada
  j.apertar(10, 10); j.soltar(10, 10);
  assert.strictEqual(j.estado().ativo, true);
  j.passar(c.voarMs);
  assert.strictEqual(j.estado().fase, 'caido');
  assert.strictEqual(j.tombos, 1, 'avisou a caixa de areia da queda');
  j.passar(3000);
  assert.strictEqual(j.estado().ativo, false, 'acabou sozinho depois de sair da caixa');
  igual(j.posicoes, [[4, 12]], 'em pé no tile embaixo da caixa');
});

test('balanço: o tile ao lado da caixa respeita o que está ocupado', () => {
  const j = jogo({ solidos: ['4,12', '3,12', '5,12'] }), c = C(j);
  j.brincar('balanco');
  j.passar(800);
  j.apertar(200, 500); j.mover(200, 900); j.passar(300); j.soltar(200, 900);   // para baixo também puxa (para a frente)
  assert.strictEqual(j.estado().voa, true);
  j.passar(c.periodoMs + c.voarMs + 3000);
  igual(j.posicoes, [[6, 11]]);
});

test('balanço: pelo teclado, segurar puxa e soltar solta; ← desce', () => {
  const j = jogo(), c = C(j);
  j.brincar('balanco');
  j.passar(800);
  j.tecla(' '); j.passar(c.teclaMs / 2);
  assert.ok(Math.abs(j.estado().alvo + 0.5) < 0.05, 'meio puxado: ' + j.estado().alvo);
  j.tecla(' ', true);
  assert.strictEqual(j.estado().voa, false);
  j.passar(c.periodoMs * 20);
  j.tecla('ArrowUp'); j.passar(c.teclaMs + 100); j.tecla('ArrowUp', true);
  assert.strictEqual(j.estado().voa, true, 'segurou até o fim: voa');
  j.passar(c.periodoMs + c.voarMs + 3000);
  assert.strictEqual(j.estado().ativo, false);
  // de novo, e ← desce
  j.posicoes.length = 0;
  j.brincar('balanco'); j.passar(800); j.tecla('ArrowLeft');
  assert.strictEqual(j.estado().ativo, false);
  igual(j.posicoes, []);
});

test('balanço: sem Animações, puxou tudo = os dois na caixa direto, e ela fica ao lado', () => {
  const j = jogo({ semAnimacoes: true });
  j.brincar('balanco');
  j.passar(800);
  j.apertar(200, 500); j.mover(200, 100); j.passar(32);
  assert.strictEqual(j.estado().a, -1, 'segue o dedo na hora');
  j.soltar(200, 100);
  j.passar(32);
  assert.strictEqual(j.estado().fase, 'caido');
  assert.strictEqual(j.tombos, 1);
  j.passar(j.R.config.parquinho.curtaMs + 100);
  assert.strictEqual(j.estado().ativo, false);
  igual(j.posicoes, [[4, 12]]);
  // meio puxado: volta logo ao meio
  j.brincar('balanco'); j.passar(800);
  j.apertar(200, 500); j.mover(200, 450); j.passar(32); j.soltar(200, 450); j.passar(200);
  assert.strictEqual(j.estado().modo, 'parado');
});

test('balanço: os outros brinquedos continuam acabando sozinhos, pelo tempo', () => {
  const j = jogo(), ms = j.R.config.parquinho.ms;
  ['escorregador', 'gangorra', 'areia'].forEach((b) => {
    j.brincar(b);
    assert.strictEqual(j.estado().ativo, true, b + ' começou');
    j.passar(ms[b] + 50);
    assert.strictEqual(j.estado().ativo, false, b + ' acabou sozinho');
  });
});
