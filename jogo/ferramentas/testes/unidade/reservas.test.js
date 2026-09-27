// Reino.reservarPersonagem (nucleo/registros.js): a reserva é o contrato de um NPC (docs/contratos/plano-paralelo.md §2).
// Sem registro, a vaga tracejada (base 'reserva') aparece no interior com o nome, a voz e o tile; o registro que a
// preenche dá o MESMO resultado de registrar sem reserva; campo diferente da reserva é erro. Validador e elenco-vozes.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/reservas.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');
const Extras = require('../../validar/interiores-extras');
const Elenco = require('../../vozes/elenco-vozes');

// o jogo no vm; antes(Reino) roda logo antes do primeiro script dos prédios
function reino(antes) {
  const ctx = Jogo.contexto({ console, setTimeout, clearTimeout, Math, Date });
  const lista = Jogo.ordemDosPredios(Jogo.scripts());
  const k = lista.findIndex((s) => s.grupo === 'interiores');
  Jogo.carregar(ctx, lista.slice(0, k));
  if (antes) antes(ctx.Reino);
  Jogo.carregar(ctx, lista.slice(k));
  return ctx.Reino;
}
const PERFIL = { voz: 'pt-BR-FranciscaNeural', velocidade: '+4%', tom: '+10Hz' };
const RESERVA = { id: 'visitante-teste', nome: 'Visitante', genero: 'f', idade: 'jovem', perfil: PERFIL, predio: 'museu', x: 22, y: 21 };
const SPRITE = { base: 'pessoa', pele: '#f1c7a5', cabelo: '#5a3825', penteado: 'rabo', roupa: '#e36b8a', roupa2: '#5a4a8a', perna: 'saia' };
const noMuseu = (R) => R.interiores.find((d) => d.id === 'museu').npcs.find((p) => p.id === RESERVA.id);
const json = (o) => JSON.parse(JSON.stringify(o));

test('reserva sem registro: vaga tracejada no tile reservado, com nome, voz e perfil', () => {
  const R = reino((R) => R.reservarPersonagem(RESERVA));
  const n = noMuseu(R);
  assert.ok(n, 'a vaga não entrou nos npcs do museu');
  assert.deepStrictEqual([n.nome, n.voz, n.x, n.y], ['Visitante', 'npc-visitante-teste', 22, 21]);
  assert.deepStrictEqual(json(n.sprite), { base: 'reserva', genero: 'f', idade: 'adulto' });   // jovem desenha como adulto
  assert.deepStrictEqual(json(R.config.vozes['npc-visitante-teste']), PERFIL);
  assert.ok(R.NPCs.OPCOES_SPRITE.base.includes('reserva'), 'a base reserva não foi registrada');
  assert.strictEqual(R.reservas[RESERVA.id].preenchida, false);
});

test('reserva + registro (só id e sprite) = registrar sem reserva: mesmo NPC e mesmo ELENCO', () => {
  const direto = reino((R) => R.registrarPersonagem({ id: RESERVA.id, nome: 'Visitante', sprite: SPRITE, perfil: PERFIL, predio: 'museu', x: 22, y: 21 }));
  const reservado = reino((R) => { R.reservarPersonagem(RESERVA); R.registrarPersonagem({ id: RESERVA.id, sprite: SPRITE }); });
  assert.deepStrictEqual(json(noMuseu(reservado)), json(noMuseu(direto)));
  assert.deepStrictEqual(json(reservado.NPCs.ELENCO[RESERVA.id]), json(direto.NPCs.ELENCO[RESERVA.id]));
  assert.deepStrictEqual(json(reservado.personagensDoPredio('museu')), json(direto.personagensDoPredio('museu')));
  assert.strictEqual(reservado.reservas[RESERVA.id].preenchida, true);
});

test('sem ação na reserva, a do registro vale no lugar reservado; campo repetido igual passa', () => {
  const acao = { tipo: 'tela', tela: 'loja' };
  const R = reino((R) => { R.reservarPersonagem(RESERVA); R.registrarPersonagem({ id: RESERVA.id, nome: 'Visitante', x: 22, sprite: SPRITE, acao }); });
  assert.deepStrictEqual(json(noMuseu(R).acao), acao);
});

test('registro que difere da reserva, reserva repetida e registro antes da reserva são erro', () => {
  assert.throws(() => reino((R) => { R.reservarPersonagem(RESERVA); R.registrarPersonagem({ id: RESERVA.id, sprite: SPRITE, x: 5 }); }), /x difere da reserva/);
  assert.throws(() => reino((R) => { R.reservarPersonagem(RESERVA); R.registrarPersonagem({ id: RESERVA.id, sprite: SPRITE, nome: 'Outra' }); }), /nome difere da reserva/);
  assert.throws(() => reino((R) => { R.reservarPersonagem(RESERVA); R.reservarPersonagem(RESERVA); }), /id repetido/);
  assert.throws(() => reino((R) => { R.registrarPersonagem({ id: RESERVA.id, nome: 'V', sprite: SPRITE }); R.reservarPersonagem(RESERVA); }), /id repetido/);
  // preenchida, um segundo registro do mesmo id continua sendo id repetido
  assert.throws(() => reino((R) => { R.reservarPersonagem(RESERVA); R.registrarPersonagem({ id: RESERVA.id, sprite: SPRITE }); R.registrarPersonagem({ id: RESERVA.id, sprite: SPRITE }); }), /id repetido/);
});

test('validador: reserva sem registro é erro (aviso só com REINO_RESERVAS_ABERTAS), incompleta é erro', () => {
  const tudo = () => true;
  const aberta = reino((R) => R.reservarPersonagem(RESERVA));
  const r1 = Extras.reservas(aberta, tudo, false);
  assert.strictEqual(r1.erros.length, 1);
  assert.match(r1.erros[0], /reserva visitante-teste: ainda sem registrarPersonagem/);
  const r2 = Extras.reservas(aberta, tudo, true);
  assert.deepStrictEqual([r2.erros.length, r2.avisos.length], [0, 1]);
  const cheia = reino((R) => { R.reservarPersonagem(RESERVA); R.registrarPersonagem({ id: RESERVA.id, sprite: SPRITE }); });
  assert.deepStrictEqual(Extras.reservas(cheia, tudo, false), { erros: [], avisos: [] });
  const torta = reino((R) => { R.reservarPersonagem({ id: 'torta-teste', nome: 'Torta', genero: 'x', idade: 'bebe', predio: 'museu', x: 22, y: 21 }); R.registrarPersonagem({ id: 'torta-teste', sprite: SPRITE }); });
  const e = Extras.reservas(torta, tudo, false).erros.join('\n');
  assert.match(e, /genero "x"/); assert.match(e, /idade "bebe"/); assert.match(e, /sem perfil de voz/);
  // --so de outro prédio: fora da conta
  assert.deepStrictEqual(Extras.reservas(aberta, (id) => id === 'petshop', false), { erros: [], avisos: [] });
});

test('elenco-vozes: o gênero da reserva manda (voz masculina para reserva feminina é acusada)', () => {
  assert.strictEqual(Elenco.generoDoPersonagem({ nome: 'Seu Fulano', genero: 'f', falas: ['Eu sou o Fulano.'] }), 'f');
  const pers = [{ id: 'x', nome: 'Visitante', voz: 'npc-x', pacotes: ['interior-museu'], falas: [], genero: 'f' }];
  const r = Elenco.checarElenco(pers, { 'npc-x': { voz: 'pt-BR-AntonioNeural', velocidade: '-20%', tom: '-30Hz' } });
  assert.ok(r.avisos.some((a) => /feminino/.test(a)), r.avisos.join('\n'));
});

test('campo de contrato que falta na reserva não entra pelo registro', () => {
  const semXY = Object.assign({}, RESERVA, { x: undefined, y: undefined });
  assert.throws(() => reino((R) => { R.reservarPersonagem(semXY); R.registrarPersonagem({ id: RESERVA.id, sprite: SPRITE, x: 22, y: 21 }); }), /x falta na reserva/);
});
