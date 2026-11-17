// Testes de unidade: os monstros das matérias da Casa Mal-Assombrada (docs/contratos/monstros.md §10; pedido de 17/11:
// "monstros de cada matéria e pra ganhar ele precisa completar a matéria dele e vai dar pra equipar ele com os monstros
// e os aliens"). Um por matéria, ganho com a matéria do bimestre de agora completa (derivado, nunca gravado), equipável
// na fila com os da MonsterBall e o ET junto; a MonsterBall não pega nenhum deles.
// O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/monstros-materias.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje } = require('./ajudantes/jogo-save');

function jogo(save) {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: save || saveHoje(), agora: Date.UTC(2026, 10, 17) }); } finally { Jogo.scripts = orig; }
  j.P.carregar();
  j.M = j.R.Monstros;
  return j;
}
const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);   // objetos do vm (outro realm)
const ASSUNTOS = ['matematica', 'ingles', 'portugues', 'geografia', 'ciencias', 'historia'];
// todas as salas da matéria feitas (o que materiaCompleta confere)
const completar = (j, id) => j.R.materia(id).salas.forEach((s) => { j.P.estado().salas[s.id] = { feita: true }; });

test('monstros das matérias: um por matéria, com nome, desenho certo e a matéria de agora com salas', () => {
  const { M, R } = jogo();
  const l = M.especies().filter((e) => e.daMateria);
  igual(l.map((e) => e.assunto), ASSUNTOS);
  igual(M.daMateria().map((d) => d.id), l.map((e) => e.id));
  l.forEach((e) => {
    assert.ok(/^assombrada-[a-z]+$/.test(e.id), e.id);
    assert.ok(e.nome && e.lugar === 'Casa Mal-Assombrada' && e.curto, e.id);
    assert.strictEqual(M.especie(e.id), e, 'especie() acha');
    const d = M.daMateria().find((x) => x.id === e.id), m = R.materia(d.materia);
    assert.ok(m && !m.arquivada && m.salas.length, e.id + ': matéria ' + d.materia + ' ativa e com salas');
    assert.strictEqual(m.lugar.dentro, 'materia:' + e.assunto, e.id + ': a do mesmo prédio');
    // o molde: linhas da mesma largura, só cores da paleta, contorno K; o piscar troca linhas da mesma largura
    const mo = M.molde(e.id), w = mo.linhas[0].length;
    assert.strictEqual(mo, e.molde);
    mo.linhas.concat(Object.values(mo.pisca || {})).forEach((ln, i) => {
      assert.strictEqual(ln.length, w, e.id + ': largura da linha ' + i);
      [...ln].forEach((ch) => assert.ok(ch === '.' || mo.paleta[ch], e.id + ': cor ' + ch));
    });
    assert.strictEqual(mo.paleta.K, '#3a2446', e.id + ': contorno');
    Object.keys(mo.pisca || {}).forEach((k) => assert.ok(+k < mo.linhas.length, e.id + ': piscar fora'));
  });
  assert.strictEqual(new Set(l.map((e) => e.nome)).size, 6, 'nomes diferentes');
});

test('monstros das matérias: sem a matéria completa não tem; completa, tem 1 e vai na fila com o ET', () => {
  const j = jogo(), { M, R } = j, id = 'assombrada-matematica';
  assert.strictEqual(M.quantos(id), 0);
  assert.ok(!M.capturados().some((c) => c.id === id));
  assert.strictEqual(M.equipar(id), false, 'ainda não ganhou');
  assert.ok(M.daMateria().every((d) => !d.ganho));
  // a matéria do 3º bimestre (arquivada) não dá o monstro
  completar(j, 'matematica');
  assert.strictEqual(M.quantos(id), 0, 'arquivada não conta');
  // a de agora: ganhou
  const nova = R.Bimestres.ativa('matematica');
  completar(j, nova);
  assert.strictEqual(M.quantos(id), 1);
  assert.ok(M.daMateria().find((d) => d.id === id).ganho);
  assert.strictEqual(M.capturados().find((c) => c.id === id).qtd, 1);
  assert.ok(!('monstros' in j.lido()) || !(id in (j.lido().monstros || {})), 'derivado: não vai para o campo monstros');
  // na fila com um da MonsterBall, e o ET levado continua junto
  assert.ok(M.registrarCaptura('lua-dificil'));
  R.Viagem.fazerAmigo('lua-lumi');
  assert.ok(R.Viagem.escolherCompanheiro('lua-lumi'));
  assert.ok(M.equipar('lua-dificil'));
  assert.ok(M.equipar(id));
  igual(M.equipados(), ['lua-dificil', id]);
  assert.ok(M.estaJunto(id));
  igual(j.lido().monstrosJuntos.mariana.ids, ['lua-dificil', id]);
  assert.strictEqual(R.Viagem.companheiro(), 'lua-lumi', 'o ET continua');
  assert.ok(M.danoAjuda(id, 10) >= 1, 'ajuda na luta');
  // recarregar: continua
  j.P.carregar();
  igual(j.R.Monstros.equipados(), ['lua-dificil', id]);
});

test('monstros das matérias: a MonsterBall não pega e o campo monstros não guarda', () => {
  const j = jogo(), { M } = j;
  assert.strictEqual(M.registrarCaptura('assombrada-ingles'), false);
  igual(j.lido().monstros || {}, {});
  // número no campo (lixo de outra versão) não dá o monstro: só a matéria completa
  const k = jogo(Object.assign(saveHoje(), { monstros: { 'assombrada-ingles': 3 } }));
  assert.strictEqual(k.M.quantos('assombrada-ingles'), 0);
});

test('monstros das matérias: sem a matéria (outro aparelho, Novo ciclo) ele sai da fila sem apagar a lista gravada', () => {
  const j = jogo(), { M, R } = j, id = 'assombrada-historia', nova = R.Bimestres.ativa('historia');
  completar(j, nova);
  assert.ok(M.equipar(id));
  R.materia(nova).salas.forEach((s) => { delete j.P.estado().salas[s.id]; });
  igual(M.equipados(), []);
  igual(j.lido().monstrosJuntos.mariana.ids, [id], 'a lista fica');
  completar(j, nova);
  igual(M.equipados(), [id], 'volta com a matéria');
});

test('monstros das matérias: com as 6 completas, os 6 contam e a vaga cresce junto', () => {
  const j = jogo(), { M, R } = j;
  ASSUNTOS.forEach((a) => completar(j, R.Bimestres.ativa(a)));
  assert.strictEqual(M.daMateria().filter((d) => d.ganho).length, 6);
  assert.ok(M.vagas() >= 4 + 6);
  M.daMateria().forEach((d) => assert.ok(M.equipar(d.id), d.id));
  assert.strictEqual(M.equipados().length, 6);
});
