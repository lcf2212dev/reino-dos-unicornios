// Testes de unidade: os itens na luta (docs/contratos/itens.md §5 "Animação no chão" e §9). Proteção com teto e mínimo 1,
// vida por item sem curar na troca (o ponto em Vida continua enchendo), curar (poção) até a máxima, Força no dano,
// Rapidez com o teto de sempre, e o item no chão (js/sistemas/itens-chao.js): quica, brilha e voa, para fora da arena
// e não mexe no passo puro do combate. O jogo inteiro (todos os `node: true`) num vm com save sintético
// (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/itens-combate.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje } = require('./ajudantes/jogo-save');

function jogo() {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: saveHoje() }); } finally { Jogo.scripts = orig; }
  j.P.carregar();
  j.BC = j.R.BosqueCombate; j.B = j.R.Bosque; j.It = j.R.Itens; j.cfg = j.R.config.fantasmas;
  return j;
}
const MAPA = {
  comodo: { x: 1, y: 1, w: 54, h: 40 }, spawn: { x: 28, y: 39 },
  solido: (x, y) => x < 1 || y < 3 || x > 54 || y > 40,
};
const vestir = (j, id) => { const g = j.It.ganhar(id); assert.ok(j.It.vestir(g.uid), 'vestiu ' + id); return g.uid; };

test('itens na luta: Proteção corta 8% por ponto, até 60%, e o toque nunca tira menos de 1', () => {
  const { BC, R } = jogo(), ci = R.config.itens;
  assert.strictEqual(BC.toque(3, 0), 3, 'sem Proteção: a força do inimigo');
  assert.strictEqual(BC.toque(5, 2), Math.round(5 * (1 - 2 * ci.defesaPorPonto)));
  assert.strictEqual(BC.toque(10, 50), Math.round(10 * (1 - ci.defesaMax)), 'teto');
  assert.strictEqual(BC.toque(1, 50), 1, 'mínimo 1');
  assert.strictEqual(BC.toque(2, 7), 1);
  // no passo: o toque do inimigo tira menos com Proteção
  const tirou = (defesa) => {
    const est = BC.novoEstado(MAPA, jogo().cfg);
    est.vida = est.max = 30; est.maxPontos = 30;
    const f = est.fantasmas.find((x) => x.tipo === 'dificil'), forca = est.cfg.tipos.dificil.forca;
    BC.passo(est, 16, { x: f.x, y: f.y + 2, olharX: 0, olharY: -1, vidaMax: 30, defesa });
    return { tirou: 30 - est.vida, forca };
  };
  const sem = tirou(0), com = tirou(5);
  assert.strictEqual(sem.tirou, sem.forca);
  assert.strictEqual(com.tirou, BC.toque(com.forca, 5));
});

test('itens na luta: vida por item sobe o teto sem curar; tirar baixa o teto; o ponto em Vida continua enchendo', () => {
  const { BC, cfg } = jogo();
  const est = BC.novoEstado(MAPA, cfg), base = cfg.jogador.vidaBase;
  est.parados = true;
  const j = (vidaMax, vidaItens) => ({ x: 28 * 16 + 8, y: 39 * 16 + 12, olharX: 0, olharY: -1, vidaMax, vidaItens });
  est.regenEm = 1e12;   // sem a regeneração no meio
  BC.passo(est, 16, j(base + 4, 4));
  assert.strictEqual(est.max, base + 4);
  assert.strictEqual(est.vida, base, 'vestir não cura');
  BC.passo(est, 16, j(base, 0));
  assert.strictEqual(est.vida, base);
  assert.strictEqual(est.max, base);
  // cheia com a armadura e tira: fica no máximo novo
  BC.passo(est, 16, j(base + 4, 4)); est.vida = base + 4;
  BC.passo(est, 16, j(base, 0));
  assert.strictEqual(est.vida, base);
  // ponto em Vida (com o item vestido): a vida nova já vem cheia, como sempre
  BC.passo(est, 16, j(base + 4, 4));
  const antes = est.vida;
  BC.passo(est, 16, j(base + 6, 4));
  assert.strictEqual(est.vida, antes + 2);
  assert.strictEqual(est.max, base + 6);
});

test('itens na luta: curar soma até a máxima e emite vida; desmaiada ou fora da arena = null', () => {
  const { BC, cfg } = jogo();
  const est = BC.novoEstado(MAPA, cfg);
  est.vida = 3;
  assert.deepStrictEqual({ ...BC.curarNo(est, 4) }, { antes: 3, depois: 7 });
  assert.ok(est.eventos.some((e) => e.tipo === 'vida' && e.n === 7));
  assert.deepStrictEqual({ ...BC.curarNo(est, 100) }, { antes: 7, depois: est.max });
  est.desmaiado = true;
  assert.strictEqual(BC.curarNo(est, 4), null);
  assert.strictEqual(BC.curar(4), null, 'fora da arena');
});

test('itens na luta: Força no dano, Vida na vida máxima, Rapidez com o teto de sempre; tirar volta ao de antes', () => {
  const { B, It, cfg, P, R } = jogo(), cj = cfg.jogador;
  const d0 = B.dano(), v0 = B.vidaMax(), r0 = B.fatorVelocidade();
  vestir({ It }, 'espada-gelo');
  assert.strictEqual(B.dano(), d0 + 4);
  vestir({ It }, 'armadura-dragao');
  assert.strictEqual(B.vidaMax(), v0 + 12);
  assert.strictEqual(B.bonus().defesa, 2);
  vestir({ It }, 'botas-vento');
  assert.ok(Math.abs(B.fatorVelocidade() - (r0 + 0.10)) < 1e-9);
  // muitos pontos em Velocidade + botas: o teto velocidadeMax
  const e = P.estado();
  e.bosque.xp = 1e7;
  e.bosquePontos = {};
  for (let n = 2; n <= B.nivel(); n++) e.bosquePontos[n] = { h: 'velocidade', em: n };
  R.Itens.tirar('espada');
  assert.strictEqual(B.fatorVelocidade(), cj.velocidadeMax);
  It.tirar('botas'); It.tirar('armadura');
  assert.strictEqual(B.vidaMax(), v0);
});

test('itens no chão: salta, brilha e voa até ela; sem Animações fica parado por brilhaMs; não mexe no combate', () => {
  const { R, BC, cfg } = jogo(), C = R.ItensChao, c = R.config.itens.chao;
  const d = C.novo({ tipo: 'ganhou', id: 'espada-gelo', x: 100, y: 200 }, 0);
  assert.strictEqual(d.icone, 'item:espada-gelo');
  assert.strictEqual(C.onde(d, true, 300, 300).fase, 'quica');
  d.idade = c.quicaMs * 0.35;
  assert.ok(C.onde(d, true, 300, 300).alto > 5, 'no alto do salto');
  d.idade = c.quicaMs + 1;
  const b = C.onde(d, true, 300, 300);
  assert.strictEqual(b.fase, 'brilha');
  assert.strictEqual(b.alto, 0);
  assert.ok(Math.abs(b.x - 100) <= 8, 'pertinho de onde o inimigo sumiu');
  d.idade = c.quicaMs + c.brilhaMs + c.voaMs - 1;
  const v = C.onde(d, true, 300, 300);
  assert.strictEqual(v.fase, 'voa');
  assert.ok(Math.abs(v.x - 300) < 2 && Math.abs(v.y - 300) < 2, 'chegou nela');
  // o relógio: acaba no tempo todo (com Animações) ou em brilhaMs (sem)
  const lista = [C.novo({ tipo: 'ganhou', id: 'pocao-pequena', x: 0, y: 0 }, 0)];
  assert.strictEqual(C.avancar(lista, c.quicaMs + c.brilhaMs, true).length, 0);
  assert.strictEqual(C.avancar(lista, c.voaMs, true).length, 1);
  assert.strictEqual(lista.length, 0);
  const parado = [C.novo({ tipo: 'estrelas', x: 0, y: 0 }, 0)];
  assert.strictEqual(C.onde(parado[0], false, 50, 50).fase, 'parado');
  assert.strictEqual(C.onde(parado[0], false, 50, 50).alto, 0);
  assert.strictEqual(C.avancar(parado, c.brilhaMs, false).length, 1);
  // três estrelas: em leque, uma depois da outra
  const tres = [0, 1, 2].map((i) => C.novo({ tipo: 'estrelas', n: 3, x: 50, y: 50 }, i));
  assert.deepStrictEqual(tres.map((x) => Math.sign(x.x1 - 50)), [-1, 0, 1]);
  assert.ok(tres[2].x1 - tres[1].x1 >= 16, 'uma estrela não tapa a outra');
  assert.ok(tres[2].idade < tres[1].idade);
  // fora da arena (no Node não há cena): o drop não vira animação, e o passo puro segue igual com ou sem ele
  R.util.emit(R.EVENTOS.ITENS, { tipo: 'ganhou', id: 'espada-gelo', arena: 'bosque', x: 1, y: 2 });
  assert.strictEqual(C.lista().length, 0);
  const a = BC.novoEstado(MAPA, cfg), z = BC.novoEstado(MAPA, cfg);
  const jog = { x: 28 * 16 + 8, y: 39 * 16 + 12, olharX: 0, olharY: -1 };
  for (let t = 0; t < 2000; t += 16) {
    BC.passo(a, 16, jog);
    C.avancar([C.novo({ tipo: 'estrelas', x: 0, y: 0 }, 0)], 16, true);
    BC.passo(z, 16, jog);
  }
  assert.deepStrictEqual(a.fantasmas.map((f) => [f.x, f.y]), z.fantasmas.map((f) => [f.x, f.y]));
});
