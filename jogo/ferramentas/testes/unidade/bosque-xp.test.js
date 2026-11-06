// Testes de unidade: o XP do Bosque e das outras arenas (js/sistemas/bosque.js; docs/contratos/bosque.md §3–§5 e
// arenas.md). A curva (config.fantasmas.xpNivel), a pergunta a cada terço do nível, a conta do placar antigo de mortos
// (30 por nível, pergunta a cada 10) virando XP sem gravar nada (mesmo nível, mesma fração, mesmas pendentes), dois
// aparelhos (um da versão antiga) na mescla e o XP de cada arena. O jogo inteiro (todos os `node: true`) num vm com
// save sintético (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/bosque-xp.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje, copia } = require('./ajudantes/jogo-save');

const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);
const MATERIAS = [{ id: 'q4a', bimestre: 4, salas: [{ id: 'a1', nome: 'A1', desafios: [{ id: 'a1-1', tipo: 'escolha' }] }] }];

function jogo(opcoes = {}) {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar(opcoes); } finally { Jogo.scripts = orig; }
  j.R.materias.splice(0, j.R.materias.length, ...copia(MATERIAS));
  j.R.Interiores.refazer = () => {};
  j.P.carregar();
  j.B = j.R.Bosque;
  return j;
}
const legado = (n) => 1 + Math.floor(n / 30);   // o nível do placar antigo

test('xp: a curva (base 300, passo 30), o nível de um XP e os limites de cada nível', () => {
  const j = jogo(), C = j.B.curva, cfg = j.R.config.fantasmas;
  igual(cfg.xpNivel, { base: 300, passo: 30 });
  assert.strictEqual(cfg.perguntasPorNivel, 3);
  assert.deepStrictEqual([C.xpDoNivel(1), C.xpDoNivel(2), C.xpDoNivel(10)], [300, 330, 570]);
  assert.deepStrictEqual([C.xpAte(1), C.xpAte(2), C.xpAte(3), C.xpAte(10)], [0, 300, 630, 3780]);
  assert.deepStrictEqual([0, 299, 300, 629, 630].map(C.nivelDoXp), [1, 1, 2, 2, 3]);
  for (let n = 2; n <= 1000; n++) {
    assert.strictEqual(C.nivelDoXp(C.xpAte(n)), n, 'começo do nível ' + n);
    assert.strictEqual(C.nivelDoXp(C.xpAte(n) - 1), n - 1, 'fim do nível ' + (n - 1));
  }
  assert.strictEqual(C.nivelDoXp(C.xpAte(1000) * 3), 1000, 'nunca passa do nivelMax');
  // os XP de cada tipo do Bosque: os mais fortes dão mais
  const t = cfg.tipos;
  assert.ok(t.facil.xp < t.medio.xp && t.medio.xp < t.dificil.xp && t.dificil.xp < t.mosca.xp);
});

test('xp: perguntas a cada terço do nível (33%, 66% e ao fechar), também no nível máximo', () => {
  const j = jogo(), C = j.B.curva;
  // nível 1 (300): marcas em 100, 200 e 300; nível 2 (330): em 410, 520 e 630
  assert.deepStrictEqual([0, 99, 100, 199, 200, 299, 300, 409, 410, 519, 520, 629, 630].map(C.tercosDe), [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6]);
  for (let n = 1; n < 60; n++) {
    const X = C.xpDoNivel(n), a = C.xpAte(n);
    assert.strictEqual(C.tercosDe(a), 3 * (n - 1));
    assert.strictEqual(C.tercosDe(a + Math.ceil(X / 3)), 3 * (n - 1) + 1);
    assert.strictEqual(C.tercosDe(a + Math.ceil(2 * X / 3)), 3 * (n - 1) + 2);
  }
  const fim = C.xpAte(1000), X = C.xpDoNivel(1000);
  assert.strictEqual(C.tercosDe(fim + X), 3 * 999 + 3, 'no máximo, a barra cheia ainda dá pergunta');
});

test('xp: matando no jogo, a pergunta abre em cada terço e o nível ao fechar a barra (e não antes)', () => {
  const j = jogo(), B = j.B;
  const r = [];
  for (let i = 1; i <= 30; i++) {   // 10 de XP cada; a pergunta é respondida assim que abre
    const x = B.abater('facil');
    r.push(x);
    if (x.perguntas) { assert.strictEqual(x.perguntas, 1, 'uma por vez'); assert.ok(B.consumirPergunta()); }
  }
  assert.deepStrictEqual(r.map((x, i) => (x.perguntas ? i + 1 : 0)).filter(Boolean), [10, 20, 30], 'aos 100, 200 e 300 de XP');
  assert.deepStrictEqual(r.map((x) => x.subiu).filter(Boolean), [2], 'sobe uma vez, no 30º, junto com a 3ª pergunta');
  assert.strictEqual(r[29].premioNivel.chave, 'bosque:2');
  igual(B.xp(), { n: 0, de: 330, maximo: false });
  igual(B.proximaPergunta(), { n: 0, de: 110, pct: 0, marca: 1 });
  B.abater('mosca');   // 25
  igual(B.proximaPergunta(), { n: 25, de: 110, pct: 22, marca: 1 });
  assert.strictEqual(B.mortos(), 32, 'o placar: a mosca conta 2');
  const b = j.P.estado().bosque;
  assert.deepStrictEqual([b.mortos, b.perguntasFeitas, b.abates, b.xp], [0, 0, 32, 325], 'os contadores antigos ficam quietos');
});

test('migração: o placar antigo vira XP no mesmo nível, mesma fração e mesmas perguntas (de 0 a 3000 mortos)', () => {
  const j = jogo(), C = j.B.curva;
  for (let m = 0; m <= 3000; m++) {
    const x = C.xpLegado(m), L = legado(m);
    assert.strictEqual(C.nivelDoXp(x), L, 'nível de ' + m);
    assert.strictEqual(C.tercosDe(x), Math.floor(m / 10), 'perguntas de ' + m);
    const frac = (x - C.xpAte(L)) / C.xpDoNivel(L);
    assert.ok(Math.abs(frac - (m % 30) / 30) < 1e-9, 'fração de ' + m);
    if (m) assert.ok(x > C.xpLegado(m - 1), 'só cresce');
  }
});

test('migração: save antigo (sem xp) com mortos e uma pergunta pendente: nada muda e nada é gravado', () => {
  const s = Object.assign(saveHoje(), { bosque: { acertos: 7, espada: 1, vencidos: 6, mortos: 75, perguntasFeitas: 6, migrado: 1 }, bosquePontos: {} });
  const j = jogo({ save: s }), B = j.B, antes = copia(j.P.estado().bosque), grav = j.contagem.salvar;
  assert.strictEqual(B.nivel(), 3, '75 mortos = nível 3, como antes');
  assert.strictEqual(B.perguntasPendentes(), 1, 'a pendente de antes (7 blocos, 6 feitos) continua');
  igual(B.xp(), { n: 180, de: 360, maximo: false }, '15 de 30 = metade da barra');
  igual(B.pontosPendentes(), [2, 3], 'nenhum ponto a mais nem a menos');
  assert.strictEqual(B.mortos(), 75);
  igual(j.P.estado().bosque, antes, 'ler não grava nada');
  assert.strictEqual(j.contagem.salvar, grav, 'nenhuma gravação');
  // a pergunta pendente recebe o presente seguinte da numeração antiga (6 feitos: bosque:p7)
  assert.strictEqual(B.acertou('q4a').presente.chave, 'bosque:p7');
  assert.strictEqual(B.perguntasPendentes(), 0);
});

test('migração: dois aparelhos, um ainda na versão antiga: a mescla não perde nível nem dá perguntas de volta', () => {
  const base = Object.assign(saveHoje(), { bosque: { acertos: 3, espada: 1, vencidos: 3, mortos: 40, perguntasFeitas: 4, migrado: 1 }, bosquePontos: {} });
  const A = jogo({ save: copia(base), agora: 1000 });   // versão nova: mata 12 fáceis e responde as perguntas
  for (let i = 0; i < 12; i++) { A.B.abater('facil'); while (A.B.perguntasPendentes()) A.B.acertou('q4a'); }
  A.P.salvar();
  // o aparelho antigo jogou mais 25 no placar antigo (o código antigo só conhece mortos e perguntasFeitas)
  const velho = copia(base); velho.bosque.mortos = 65; velho.bosque.perguntasFeitas = 6;
  [[A.lido(), velho], [velho, A.lido()]].forEach(([x, y]) => {
    const m = A.P.mesclar(copia(x), copia(y));
    const k = jogo({ save: m });
    assert.ok(k.B.nivel() >= A.B.nivel(), 'não perde o nível do aparelho novo');
    assert.ok(k.B.nivel() >= legado(65), 'nem o do antigo');
    assert.strictEqual(k.B.xpTotal(), k.B.curva.xpLegado(65) + A.P.estado().bosque.xp, 'cada aparelho conta o que é dele');
    const t = k.B.curva.tercosDe(k.B.xpTotal());
    assert.strictEqual(k.B.perguntasPendentes(), t - 6 - A.P.estado().bosque.tercos, 'só as que ninguém fez');
    assert.ok(k.B.perguntasPendentes() <= 3, 'nada de enxurrada de perguntas');
  });
});

test('arenas: o XP e o placar vêm dos números da arena (config.arenas); sem arena, os do Bosque', () => {
  const j = jogo(), B = j.B, A = j.R.config.arenas;
  igual(B.abater('facil', 'pantano'), { mortos: 1, perguntas: 0, subiu: null, premioNivel: null, xp: A.pantano.tipos.facil.xp });
  assert.strictEqual(B.abater('voador', 'pantano').mortos, 3, 'o voador conta 2');
  assert.strictEqual(B.abater('facil').xp, j.R.config.fantasmas.tipos.facil.xp);
  // de mapa em mapa, mais forte e mais XP
  const ordem = ['pantano', 'gelo', 'dunas', 'cristal', 'vulcao'];
  ordem.slice(1).forEach((id, i) => ['facil', 'medio', 'dificil', 'voador'].forEach((t) => {
    const a = A[ordem[i]].tipos[t], b = A[id].tipos[t];
    assert.ok(b.vida > a.vida && b.forca >= a.forca && b.xp > a.xp, id + ' ' + t + ' mais forte que ' + ordem[i]);
  }));
  ordem.forEach((id, i) => assert.ok(!i || A[id].nivel > A[ordem[i - 1]].nivel, id + ': nível recomendado crescente'));
});
