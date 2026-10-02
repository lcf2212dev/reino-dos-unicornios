// Perguntas da viagem (js/sistemas/viagem-perguntas.js): só escolha curta e V/F, primeiro das salas feitas,
// determinístico no modo congelado. Rodar: node --test jogo/ferramentas/testes/unidade/viagem-perguntas.test.js
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('./ajudantes/terceiro-bimestre');

function carregar(salasFeitas) {
  const ctx = Jogo.contexto({ console: { warn() {}, log() {}, error: console.error }, setTimeout, clearTimeout, Math, Date });
  const R = Jogo.carregar(ctx, Jogo.scripts()).Reino;
  // modo congelado de mentira: sorteio só pela chave (o de verdade vive em nucleo/congelar.js, só no navegador)
  R.congelado = true;
  R.sorteioDaChave = (k) => { let h = 7; for (const c of String(k)) h = (h * 31 + c.charCodeAt(0)) % 2147483647; return () => (h = (h * 48271) % 2147483647) / 2147483647; };
  const salas = {};
  (salasFeitas || []).forEach((id) => { salas[id] = { feita: true }; });
  R.Progresso.estado = () => ({ salas });
  return R;
}

test('perguntas: formato, opções curtas, certa dentro, sem repetir', () => {
  const R = carregar();
  ['matematica', 'ingles', 'ciencias'].forEach((m) => {
    const l = R.Viagem.perguntas(m, 3, 'x');
    assert.strictEqual(l.length, 3, m);
    assert.strictEqual(new Set(l.map((p) => p.id)).size, 3);
    l.forEach((p) => {
      assert.strictEqual(p.materia, m);
      assert.ok(p.opcoes.length >= 2 && p.opcoes.length <= 3, p.id);
      assert.ok(p.opcoes.every((t) => t.length <= 16), p.id);
      assert.ok(p.certa >= 0 && p.certa < p.opcoes.length);
      assert.ok(!p.desafio.apoio && ['escolha', 'vf'].includes(p.desafio.tipo));
      assert.strictEqual(p.texto, R.Desafios.enunciado(p.desafio));
      const certaOriginal = p.desafio.tipo === 'vf' ? (p.desafio.certo ? 'Verdadeiro' : 'Falso') : p.desafio.opcoes[p.desafio.certa].t;
      assert.strictEqual(p.opcoes[p.certa], certaOriginal);
    });
  });
});

test('perguntas: mesma chave, mesma lista (jogo novo); matéria sem nada ou n = 0: vazia', () => {
  const R = carregar();
  const a = R.Viagem.perguntas('matematica', 3, 'voo:marte').map((p) => p.id + p.opcoes.join());
  const b = carregar().Viagem.perguntas('matematica', 3, 'voo:marte').map((p) => p.id + p.opcoes.join());
  assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
  assert.strictEqual(R.Viagem.perguntas('nada', 3, 'x').length, 0);
  assert.strictEqual(R.Viagem.perguntas('matematica', 0, 'x').length, 0);
});

test('perguntas: primeiro das salas feitas', () => {
  const R0 = carregar();
  const m = R0.materias.find((x) => x.id === 'matematica');
  const comPergunta = m.salas.filter((s) => R0.Viagem.perguntas('matematica', 99, 'x').some((p) => p.sala === s.id));
  const sala = comPergunta[0].id;
  const R = carregar([sala]);
  const l = R.Viagem.perguntas('matematica', 2, 'x');
  const daSala = R.Viagem.perguntas('matematica', 99, 'x').filter((p) => p.sala === sala).length;
  l.slice(0, Math.min(2, daSala)).forEach((p) => assert.strictEqual(p.sala, sala));
});

test('perguntas: `ordem` leva cada opção da tela ao índice original', () => {
  const R = carregar();
  R.Viagem.perguntas('ingles', 3, 'x').forEach((p) => {
    if (p.desafio.tipo !== 'escolha') return;
    p.ordem.forEach((i, j) => assert.strictEqual(p.opcoes[j], p.desafio.opcoes[i].t));
  });
});
