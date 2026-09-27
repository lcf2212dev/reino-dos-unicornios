// Falas com nome e gênero de quem joga (js/sistemas/genero.js): o marcador {feminino|masculino} vira a forma do
// sexo do perfil (Reino.Jogadores; sem ele = Mariana, menina), {nome} vira o nome, e a lista de gravação
// (Falas.todas) leva as DUAS versões, sempre com o nome da Mariana. Sem perfil, tudo sai como antes.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/genero-falas.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const J = require('../../jogo-no-node');

function jogo() {
  const ctx = J.contexto({ console });
  return J.carregar(ctx, J.ordemDosPredios(J.scripts())).Reino;
}
function comPerfil(R, nome, sexo) { R.Jogadores = { perfil: () => ({ nome, sexo }), definirPerfil() {} }; }

test('gênero: marcador, nome, versões para gravar', () => {
  const R = jogo(), G = R.Genero;
  assert.strictEqual(G.genero('Coisa de {campeã|campeão}!'), 'Coisa de campeã!', 'sem perfil: menina');
  assert.strictEqual(G.texto('Oba, {a|o} {nome} chegou!'), 'Oba, a Mariana chegou!');
  comPerfil(R, 'Pedro', 'menino');
  assert.strictEqual(G.texto('Oba, {a|o} {nome} chegou!'), 'Oba, o Pedro chegou!');
  assert.strictEqual(G.genero('{Toda campeã|Todo campeão} erra.', 'menina'), 'Toda campeã erra.', 'sexo explícito vale');
  assert.deepStrictEqual(Array.from(G.versoes('Oi! {Bem-vinda|Bem-vindo}!')), ['Oi! Bem-vinda!', 'Oi! Bem-vindo!']);
  assert.deepStrictEqual(Array.from(G.versoes('Oba, {a|o} {nome} chegou!')), ['Oba, a Mariana chegou!'], 'com nome: só a da Mariana');
  assert.deepStrictEqual(Array.from(G.versoes('Sem marcador.')), ['Sem marcador.']);
  comPerfil(R, '   ', 'x');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(G.perfil())), { nome: 'Mariana', sexo: 'menina' }, 'perfil estragado = Mariana');
});

test('gênero: falas fixas, Claude e NPCs mudam com o perfil; a gravação tem as duas versões', () => {
  const R = jogo();
  const plano = R.Falas.fixas.plano;
  assert.ok(/coisa de campeã!$/.test(plano), 'menina: como antes');
  assert.ok(!/[{|}]/.test(R.Falas.provas.escola), 'sem marcador à vista');
  comPerfil(R, 'Pedro', 'menino');
  assert.ok(/coisa de campeão!$/.test(R.Falas.fixas.plano));
  assert.ok(/^Bem-vindo à Escola/.test(R.Falas.provas.escola));
  assert.ok(/mais preparado/.test(R.Falas.provas.treinoFeito));
  assert.ok(/de campeão!/.test(R.Falas.medalhas.bronze.frase));
  assert.ok(/crescer juntos!$/.test(R.Unicornios.def('inicial').frase), 'frase do 1º unicórnio pelo gênero');

  const textos = R.Falas.todas().map((f) => f.texto);
  ['Terminar por último é coisa de campeã!', 'Terminar por último é coisa de campeão!',
    'Opa! Toda campeã erra às vezes.', 'Opa! Todo campeão erra às vezes.',
    'Oba, a Mariana chegou!',
    'Bem-vinda à Escola do Reino!', 'Bem-vindo à Escola do Reino!',
    'Revisar é coisa de campeã!', 'Revisar é coisa de campeão!',
    'Que pedestre caprichosa!', 'Que pedestre caprichoso!',
    'Você é uma ótima cientista!', 'Você é um ótimo cientista!',
    'Fui o seu primeiro unicórnio. Vamos crescer juntas!', 'Fui o seu primeiro unicórnio. Vamos crescer juntos!',
    'Até logo, pequeno astrônomo!', 'Vamos treinar a prova juntos?', 'Pense como um cientista de verdade!'].forEach((t) => {
    assert.ok(textos.some((x) => x === t || x.indexOf(t) === 0), 'na gravação: ' + t);
  });
  assert.ok(!textos.some((t) => /\{[^{}]*\|[^{}]*\}|\{nome\}/.test(t)), 'nenhum marcador na lista de gravação');
  assert.ok(!textos.includes('Oba, o Mariana chegou!'));
});
