// Feira: cobertura do currículo e falas exatas. Usa só dados do jogo e registro de interiores no Node.
const test = require('node:test');
const assert = require('node:assert/strict');
const { montar } = require('./ajudantes/predios');

test('feira: todo tópico do livro de Ciências aparece em brincadeira acessível', () => {
  const { R, janela } = montar();
  const salas = R.FeiraCiencias.salas;
  const livro = R.materia('ciencias').livro;
  assert.equal(salas.length, 5);
  const vistos = new Set(), topicos = new Set();
  for (const s of salas) {
    assert.ok(R.materia('ciencias').salas.some(c => c.id === s.origem), s.id + ': origem válida');
    assert.ok(s.missoes.length >= 5, s.id + ': experiências variadas');
    for (const m of s.missoes) {
      assert.ok(!vistos.has(m.id), m.id + ': id único'); vistos.add(m.id);
      assert.equal(m.opcoes.filter(o => o.id === m.certa).length, 1, m.id + ': peça certa disponível');
      assert.equal(new Set(m.opcoes.map(o => o.id)).size, m.opcoes.length);
      assert.ok(m.convite.length && m.dica.length && m.descoberta.length);
      for (const t of m.topicos) { assert.ok(livro.some(p => p.id === t), t); topicos.add(t); }
      for (const o of m.opcoes) assert.ok(janela.ICONES[o.emoji.replace(/\uFE0F/g, '')], m.id + ': ícone ' + o.emoji);
    }
  }
  assert.deepEqual(Array.from(livro, p => p.id).filter(id => !topicos.has(id)), [], 'não sobra tópico sem brincadeira');
});

test('feira: convite, ajuda e descoberta têm texto exato registrado para narração', () => {
  const { R } = montar();
  const falas = R.FALAS_INTERIORES.feira;
  const gravadas = new Set(falas.extras.filter(f => f.voz === 'narradora').map(f => f.texto));
  for (const s of R.FeiraCiencias.salas) for (const m of s.missoes) {
    for (const t of [].concat(m.convite, m.dica, m.descoberta)) assert.ok(gravadas.has(t), m.id + ': ' + t);
  }
  assert.ok(falas.objetos.passaporte.length);
});

test('feira: prédio independente com cinco salas e hall, entrada e ação de exploração', () => {
  const { R } = montar();
  const feira = R.interiores.find(i => i.id === 'feira');
  assert.ok(feira.entrada && feira.lugar === 'feira');
  assert.equal(feira.comodos.length, 6);
  for (const s of R.FeiraCiencias.salas) {
    assert.ok(feira.comodos.some(c => c.id === s.id), s.id + ': sala física');
    assert.ok(feira.objetos.some(o => o.acao && o.acao.tipo === 'feira' && o.acao.sala === s.id), s.id + ': instalação');
  }
  assert.ok(R.NPCs.acoes().includes('feira'));
  assert.ok(R.lugaresRegistrados.some(l => l.id === 'feira' && l.caminho.length));
});
