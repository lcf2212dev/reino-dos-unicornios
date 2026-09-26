// Testes de unidade: a pergunta surpresa (js/sistemas/surpresa.js) — o que é puro: frases, sorteio das
// perguntas (só das salas feitas, só dos tipos combinados) e o relógio de jogo livre, com relógio de mentira
// e Math.random fixo. O painel (surpresa-painel.js, DOM) não entra: a abertura para no Voz.carregarSala.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/surpresa.test.js   (tudo: npm test, na raiz)
// Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, jogoCarregado, montar } = require('./ajudantes/jogo-save');

const MIN = 60 * 1000;
// jogo carregado (salas h1 e h2 feitas) + surpresa, com sorteio fixo e a voz de mentira (registra e não resolve)
function comSurpresa(opcoes = {}) {
  const j = opcoes.semSave ? montar() : jogoCarregado(opcoes.ajuste);
  if (opcoes.semSave) j.P.carregar();
  Jogo.carregar(j.ctx, Jogo.scripts({ nomes: ['sistemas/surpresa'] }));
  j.ctx.Math = Object.create(Math);
  j.ctx.Math.random = () => (opcoes.sorteio === undefined ? 0.5 : opcoes.sorteio);
  j.voz = [];
  j.R.Voz = { carregarSala: (m, s) => { j.voz.push(m.id + '/' + s.id); return new Promise(() => {}); } };
  j.S = j.R.Surpresa;
  return j;
}
// ela jogando: um toque por segundo
function jogar(j, ms) { for (let t = 0; t < ms; t += 1000) { j.tocar(); j.andar(1000); } }

test('frases: vale duas estrelas; falas para o pacote de voz', () => {
  const { S, R } = comSurpresa();
  assert.strictEqual(R.config.surpresa.estrelas, 2);
  assert.strictEqual(S.frases().vale, 'Se acertar, você ganha duas estrelas! ⭐');
  assert.strictEqual(S.frases().ganhou, 'Você ganhou duas estrelas! ⭐');
  const falas = S.falas();
  assert.strictEqual(falas.length, 7);
  assert.ok(falas.every((f) => f.voz === 'claude' && typeof f.texto === 'string' && f.texto.length));
});

test('sorteio: só perguntas das salas feitas, dos tipos combinados e sem "livre"; a mesma até ser usada', () => {
  const j = comSurpresa();
  const tipos = j.R.config.surpresa.tipos;
  const feitas = Object.keys(j.P.estado().salas).filter((id) => j.P.estado().salas[id].feita);
  for (const r of [0, 0.3, 0.6, 0.99]) {
    const k = comSurpresa({ sorteio: r });
    const p = k.S.proximaPergunta();
    assert.ok(feitas.includes(p.sala.id), 'sala não feita: ' + p.sala.id);
    assert.ok(tipos.includes(p.desafio.tipo) && !p.desafio.livre, p.desafio.id);
    assert.strictEqual(k.S.proximaPergunta(), p, 'a pergunta guardada muda antes de ser usada');
  }
  // o número de possíveis é o de desafios dessas salas nos tipos combinados
  const esperado = j.R.materias.flatMap((m) => m.salas).filter((s) => feitas.includes(s.id))
    .flatMap((s) => s.desafios).filter((d) => tipos.includes(d.tipo) && !d.livre).length;
  assert.strictEqual(j.S._depurar().possiveis, esperado);
  // nenhuma sala feita: nenhuma pergunta
  assert.strictEqual(comSurpresa({ semSave: true }).S.proximaPergunta(), null);
});

test('relógio: sorteia entre 3 e 10 minutos e só conta com ela jogando no mapa, com o interruptor ligado', () => {
  const lento = comSurpresa({ sorteio: 1 });        // 10 minutos
  assert.strictEqual(lento.S.restante(), null, 'antes de iniciar');
  lento.S.iniciar();
  assert.strictEqual(lento.S.restante(), 10 * MIN);
  const rapido = comSurpresa({ sorteio: 0 });       // 3 minutos
  rapido.S.iniciar();
  assert.strictEqual(rapido.S.restante(), 3 * MIN);

  const j = lento;
  jogar(j, 100 * 1000);
  assert.strictEqual(j.S.restante(), 10 * MIN - 100 * 1000);
  // sala, treino, prova ou tela: não conta
  j.cena.estado = 'sala'; jogar(j, 60 * 1000); j.cena.estado = 'mapa';
  assert.strictEqual(j.S.restante(), 10 * MIN - 100 * 1000);
  // balão do Claude aberto: não conta
  j.balao.aberto = true; jogar(j, 30 * 1000); j.balao.aberto = false;
  assert.strictEqual(j.S.restante(), 10 * MIN - 100 * 1000);
  // parou de tocar: conta no máximo até 5 minutos sem toque
  const antes = j.S.restante();
  j.andar(20 * MIN);
  const contou = antes - j.S.restante();
  assert.ok(contou <= 5 * MIN && contou >= 5 * MIN - 2000, 'contou ' + contou);
  // interruptor desligado: sem relógio
  j.P.estado().ajustes.surpresa = false;
  assert.strictEqual(j.S.restante(), null);
});

test('tempo vencido: espera ela livre por alguns segundos e só então abre a pergunta de uma sala feita', () => {
  const j = comSurpresa({ sorteio: 0 });            // 3 minutos
  j.S.iniciar();
  jogar(j, 3 * MIN);
  assert.strictEqual(j.S.restante(), 0);
  assert.deepStrictEqual(j.voz, [], 'abriu sem esperar ela ficar livre');
  jogar(j, j.R.config.surpresa.esperaLivreMs + 1000);
  assert.strictEqual(j.voz.length, 1);
  assert.ok(['historia/h1', 'historia/h2'].includes(j.voz[0]), j.voz[0]);
  // nada da surpresa vai para o save nem para o localStorage
  assert.deepStrictEqual(Object.keys(j.guardado).sort(), [j.chave, j.chaveCopia].filter((k) => k in j.guardado).sort());
  assert.ok(!('surpresa' in j.P.estado()));
});
