// O resumo do guia ("Já ganhou 80 Robux! 💰") tem de estar em NPCs.falasPossiveis (é dali que as vozes são gravadas).
// Com 6 salas (Matemática) a sala vale 80 Robux (P.valorSala, de 10 em 10) e a última traz o bônus: se o
// npcs-falas.js enumerasse valorPorMateria / salas (83, 166…), a fala dita no balão não teria voz. Save 100% sintético.
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('./ajudantes/terceiro-bimestre');

function jogo() {
  const guardado = {};
  const ctx = Jogo.contexto({ console, Math, Date, JSON, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: (k) => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); }, removeItem() {} },
    PA: { APARENCIA_PADRAO: { pele: '#f1c7a3', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ffd34d' } },
    location: { protocol: 'file:', search: '' }, document: { hidden: false, addEventListener() {} }, addEventListener() {} });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  ctx.Reino.Progresso.carregar();
  return ctx.Reino;
}

test('cada resumo do guia de uma matéria de 6 salas está entre as falas gravadas', () => {
  const R = jogo(), P = R.Progresso;
  const m = R.materias.find((x) => x.salas.length === 6);
  assert.ok(m, 'há matéria com 6 salas (Matemática)');
  let guia = null;
  R.interiores.forEach((d) => (d.npcs || []).forEach((n) => { if (n.acao && n.acao.tipo === 'guia' && n.acao.lugar === 'materia:' + m.id) guia = n; }));
  assert.ok(guia, 'guia da matéria');
  const gravadas = new Set(R.NPCs.falasPossiveis(guia).map((f) => f.texto));
  const faltam = [];
  for (let k = 1; k <= m.salas.length; k++) {
    P.estado().salas[m.salas[k - 1].id] = { vezes: 1, melhor: 5, feita: 1750100000000 };
    R._npcs.convite(guia).segs.forEach((s) => R.NPCs.frases(s).forEach((f) => { if (!gravadas.has(f)) faltam.push(k + ' salas: ' + f); }));
  }
  assert.deepStrictEqual(faltam, []);
});
