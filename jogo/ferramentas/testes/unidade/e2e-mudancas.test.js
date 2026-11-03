// e2e --mudancas (e2e-mudancas.js): arquivos mudados desde o merge-base com a main (repositório de teste) e o mapa
// arquivo → imagens, com os ids reais do jogo (carregado no Node) e os nomes de cena do referencias-cenas.js.
// Uso: node --test jogo/ferramentas/testes/unidade/e2e-mudancas.test.js
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const { criarRepo } = require('../../fluxo/repo-de-teste');
const M = require('../e2e-mudancas');

const ids = M.idsDoJogo();
const casa = (e, nomes) => nomes.filter((n) => e.regex.test(n));

test('idsDoJogo: pasta → ids registrados (e os sem registro próprio pelo nome); fachadas em fora.js', () => {
  assert.deepStrictEqual(ids.interiores.loja, ['loja']);
  assert.deepStrictEqual(ids.interiores.observatorio.slice().sort(), ['observatorio', 'observatorio-2', 'observatorio-3']);
  assert.deepStrictEqual(ids.interiores.matematica, ['matematica', 'matematica-1', 'matematica-2', 'matematica-3']);   // Torre dos Números (4º bimestre)
  assert.ok(ids.interiores.torre.includes('torre-relogio'));
  assert.ok(ids.fora.includes('quimica') && !ids.fora.includes('loja'));
  const p4 = ids.materias.portugues4[0];
  assert.strictEqual(p4.id, 'portugues4');
  assert.ok(p4.salas.length > 5);
  Object.keys(ids.interiores).forEach((p) => assert.ok(ids.interiores[p].length, `pasta ${p} sem id`));
});

test('loja: só as imagens da loja (interior, cômodos, NPCs, tela), nada do mapa nem dos outros prédios', () => {
  const e = M.escolher(['jogo/js/interiores/loja/objetos.js', 'jogo/js/interiores/loja/falas.js'], ids);
  assert.strictEqual(e.modo, 'cenas');
  assert.deepStrictEqual(casa(e, ['interior-loja', 'comodo-loja-balcao', 'npc-loja-vendedora', 'mapa', 'interior-museu',
    'npc-museu-guia', 'tela-loja', 'tela-lojinha', 'sala-x-intro', 'interior-lojinha']), ['interior-loja', 'comodo-loja-balcao', 'npc-loja-vendedora', 'tela-loja']);
  assert.strictEqual(e.motivos.length, 1);
});

test('prédio com fachada (fora.js) leva o mapa junto; matéria leva salas, treino, telas e desafios', () => {
  const q = M.escolher(['jogo/js/interiores/quimica/andar2.js'], ids);
  assert.deepStrictEqual(casa(q, ['mapa', 'mapa-inicio', 'mapa-avancado', 'interior-quimica-2', 'comodo-quimica-bancada', 'tela-quimica-bancada']),
    ['mapa', 'mapa-inicio', 'mapa-avancado', 'interior-quimica-2', 'comodo-quimica-bancada', 'tela-quimica-bancada']);
  const sala = ids.materias.portugues4[0].salas[0];
  const m = M.escolher(['jogo/js/conteudo/materias/portugues4/unicornios-10.js'], ids);
  // a casa que gera as estações das salas dela, a ala e o cavaleiro do castelo, as telas (unicórnios) e o mapa
  const dela = [`sala-${sala}-intro`, `sala-${sala}-resumo`, `sala-${sala}-desafio1`, 'treino-portugues4', 'tela-materia-portugues4',
    'tela-livro-portugues4', 'desafio-vf', 'interior-portugues', 'comodo-portugues-saguao', 'npc-portugues-1-lp-tito', 'interior-portugues-1',
    'comodo-castelo-ala-portugues4', 'npc-castelo-cav-portugues4', 'tela-estabulo', 'tela-bau', 'mapa', 'mapa-avancado'];
  assert.deepStrictEqual(casa(m, dela.concat(['treino-portugues', 'prova-ingles-3bim-capa', 'interior-museu', 'comodo-castelo-ala-portugues',
    'npc-castelo-cav-historia', 'sala-h1-intro'])), dela);
  const p = M.escolher(['jogo/js/conteudo/provas/ingles-3bim.js'], ids);
  // as professoras registradas nas provas ficam na Escola
  assert.deepStrictEqual(casa(p, ['prova-ingles-3bim-capa', 'prova-ingles-3bim-q01', 'tela-escola', 'tela-escola-x', 'interior-escola', 'npc-escola-prof-flora', 'interior-museu']),
    ['prova-ingles-3bim-capa', 'prova-ingles-3bim-q01', 'tela-escola', 'interior-escola', 'npc-escola-prof-flora']);
  // o desenho dos ETs fica em planetas/; os ETs são registrados no observatorio/: os dois levam os planetas e o álbum de ETs
  const ets = M.escolher(['jogo/js/interiores/planetas/ets.js'], ids);
  assert.deepStrictEqual(casa(ets, ['tela-album-ets', 'tela-voo', 'tela-foguete', 'npc-planeta-lua-lua-lumi', 'interior-observatorio', 'tela-album']),
    ['tela-album-ets', 'tela-voo', 'tela-foguete', 'npc-planeta-lua-lua-lumi']);
  const obs = M.escolher(['jogo/js/interiores/observatorio/reservas.js'], ids);
  assert.deepStrictEqual(casa(obs, ['interior-observatorio-2', 'npc-planeta-marte-marte-rubi', 'tela-album-ets', 'interior-museu']),
    ['interior-observatorio-2', 'npc-planeta-marte-marte-rubi', 'tela-album-ets']);
  // juntas: um regex só com as duas partes
  const j = M.escolher(['jogo/js/interiores/loja/loja.js', 'jogo/js/conteudo/provas/ingles-3bim.js'], ids);
  assert.deepStrictEqual(casa(j, ['interior-loja', 'prova-ingles-3bim-capa', 'mapa']), ['interior-loja', 'prova-ingles-3bim-capa']);
});

test('tudo: css, motor, ui, nucleo, manifesto, index, servidor, harness, padrao.js, pasta desconhecida', () => {
  ['jogo/css/hud.css', 'jogo/js/motor/laco.js', 'jogo/js/ui/telas.js', 'jogo/js/nucleo/config.js', 'jogo/js/sistemas/som.js',
    'jogo/js/arte/icones.js', 'jogo/js/personagens/npcs.js', 'jogo/js/mundo/mapa.js', 'jogo/js/manifesto.js', 'jogo/index.html',
    'jogo/servidor/servidor.js', 'jogo/ferramentas/testes/referencias-cenas.js', 'jogo/js/interiores/padrao.js',
    'jogo/js/interiores/predio-novo/predio-novo.js', 'jogo/js/conteudo/materias/registro.js', 'jogo/js/conteudo/loja-itens.js']
    .forEach((f) => assert.strictEqual(M.escolher(['jogo/js/interiores/loja/loja.js', f], ids).modo, 'tudo', f));
});

test('nenhuma imagem: fora de jogo/, ferramentas que não são o harness, ou nada mudou', () => {
  for (const l of [['docs/receitas/x.md', 'package.json'], ['jogo/ferramentas/fluxo/integrar.js', 'jogo/ferramentas/testes/e2e.js'], []]) {
    const e = M.escolher(l, ids);
    assert.strictEqual(e.modo, 'dados', l.join(' '));
    assert.ok(e.motivos.length);
  }
});

test('arquivosMudados: desde o merge-base com a main, com commit, sem commit e arquivo novo', () => {
  const r = criarRepo('fluxo-wt');
  const wt = r.frente('mudancas');
  r.escrever('jogo/js/interiores/loja/loja.js', 'var x;\n', wt);
  r.git(wt, 'add', '-A'); r.git(wt, 'commit', '-q', '-m', 'loja');
  r.escrever('jogo/css/a.css', 'a{}\n', wt);                      // novo, sem add
  r.escrever('jogo/manifesto.txt', 'mudou\n', wt);                // sem commit
  r.git(wt, 'mv', 'jogo/ferramentas/testes/base-referencia.txt', 'jogo/base-movida.txt'); // movido: os dois caminhos
  r.escrever('docs/fora.md', 'x\n');                               // na main depois: não entra
  r.git(r.principal, 'add', '-A'); r.git(r.principal, 'commit', '-q', '-m', 'main andou');
  assert.deepStrictEqual(M.arquivosMudados(wt), ['jogo/base-movida.txt', 'jogo/css/a.css', 'jogo/ferramentas/testes/base-referencia.txt',
    'jogo/js/interiores/loja/loja.js', 'jogo/manifesto.txt']);
  assert.ok(fs.existsSync(path.join(wt, 'jogo/css/a.css')));
});
