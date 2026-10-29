// fluxo/integrar.js e as vozes, em repositórios git TEMPORÁRIOS (/tmp/reino-testes/fluxo-intv-*; nunca o de verdade),
// com as ferramentas de vozes de mentira do repo-de-teste.js (sem rede):
// - o fluxo completo --commit --vozes --trocar-base --merge: só os commits das frentes + o das vozes, nenhum
//   "base do e2e", npm test uma vez só; conflito no falas.json resolvido sozinho mesmo faltando áudio;
// - conflito de vozes junto com um conflito de verdade: --continuar resolve as vozes sozinho;
// - a mesma fala com áudios diferentes nos dois lados: para; resolvida à mão, o --continuar segue;
// - conferência das vozes reprovada: para; o --continuar faz o commit sem gravar de novo;
// - fala sem áudio sem --vozes: aviso, e o --merge recusa.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const C = require('../../fluxo/comum');
const V = require('../../fluxo/integrar-vozes');
const { criarRepo } = require('../../fluxo/repo-de-teste');
const { integrar } = require('../../fluxo/integrar');

const rodar = (R, args) => integrar(args, { cwd: R.principal, quieto: true, antesDoMerge: path.join(R.base, 'antes-do-merge') });
const nm = (R, t) => `${t}-${path.basename(R.base).split('-').pop()}`;
const assuntos = (pasta, n) => C.git(pasta, 'log', `-${n}`, '--format=%s').split('\n').reverse();
const npm = (pasta, s) => C.rodar('npm', ['run', '--silent', s], { cwd: pasta });
const listar = (pasta) => C.rodar(process.execPath, ['jogo/ferramentas/vozes/listar-falas.js'], { cwd: pasta });
// frente com fala nova: grava (npm run vozes) e faz o commit, como a frente faria
function frenteComVoz(R, tema, linha, extra) {
  const p = R.frente(tema);
  R.escrever(`jogo/falas/${tema}.txt`, linha + '\n', p);
  if (extra) extra(p);
  assert.ok(npm(p, 'vozes').ok);
  R.git(p, 'add', '-A'); R.git(p, 'commit', '-q', '-m', `Reino dos Unicórnios: frente ${tema}`);
  return p;
}

test('integrar-vozes: índice em 3 vias (só um lado mudou = fica a mudança; os dois = choque), na ordem do arquivo', () => {
  const base = [['a', '1'], ['b', '2']];
  assert.deepStrictEqual(V.juntarIndice(base, [['a', '1'], ['b', '2'], ['c', '3']], [['a', '1'], ['b', '7'], ['d', '4']]),
    { pares: [['a', '1'], ['b', '7'], ['c', '3'], ['d', '4']], choques: [] });
  assert.deepStrictEqual(V.juntarIndice(base, [['a', '5'], ['b', '2']], [['a', '1'], ['b', '2']]).pares, [['a', '5'], ['b', '2']], 'só a nossa mudou');
  assert.deepStrictEqual(V.juntarIndice(base, [['a', '1']], [['a', '1'], ['b', '2']]).pares, [['a', '1']], 'apagada de um lado só');
  assert.deepStrictEqual(V.juntarIndice(base, [['a', '5'], ['b', '2']], [['a', '9'], ['b', '2']]).choques, ['a']);
  assert.deepStrictEqual(V.juntarIndice([], [['k', '1']], [['k', '2']]).choques, ['k'], 'nova dos dois lados, diferente');
  // chave numérica fica onde estava (o JSON.parse a poria no topo); o texto sai como o json.dump do gerar-vozes.py
  const texto = '{\n "zeta": "n/1.mp3",\n "10": "n/2.mp3",\n "a\\u00e7a\\"o": "n/3.mp3"\n}';
  const pares = V.paresIndice(texto);
  assert.deepStrictEqual(pares, [['zeta', 'n/1.mp3'], ['10', 'n/2.mp3'], ['aça"o', 'n/3.mp3']]);
  assert.strictEqual(V.textoIndice(pares), texto);
  assert.strictEqual(V.textoIndice([]), '{}');
  assert.strictEqual(V.paresIndice('{"a": {"b": "c"}}'), null, 'não é um índice plano');
  assert.ok(V.ehVoz('jogo/js/voz/geral.js') && V.ehVoz(V.FALAS) && V.ehVoz(V.INDICE));
  assert.ok(!V.ehVoz('jogo/js/voz/sub/x.js') && !V.ehVoz('jogo/ferramentas/gerado/vozes-cache/n/x.mp3'));
});

test('integrar: --commit --vozes --trocar-base --merge → só as frentes + vozes, nenhum "base do e2e", npm test 1×', async () => {
  const R = criarRepo('fluxo-intv', { vozes: true });
  frenteComVoz(R, 'a', 'a1|Oi, eu sou a frente A.');
  // frente B sem commit: fala nova num arquivo rastreado, listada (falas.json mudou, conflita com o da A) e SEM
  // áudio gravado
  const b = R.frente('b');
  R.escrever('jogo/falas/comeco.txt', 'b1|E eu sou a frente B.\nc0|Olá, Mariana!\n', b);   // antes da c0, como a1
  assert.ok(listar(b).ok);
  const gravacoes = R.linhas('vozes.log').length;
  const r = await rodar(R, ['feat/a', b, '--assunto', 'frente B', '--commit', '--vozes', '--trocar-base', 'falas A e B', '--merge', '--nome', nm(R, 'v1')]);
  assert.strictEqual(r.codigo, 0, r.texto);
  assert.match(r.texto, /conflito nas vozes .*resolvido sozinho/);
  assert.match(r.texto, /faltou áudio/);
  assert.match(r.texto, /npm run vozes \(1 fala\(s\) sem áudio\)/);
  assert.deepStrictEqual(assuntos(R.principal, 4), ['Reino dos Unicórnios: começo', 'Reino dos Unicórnios: frente a',
    'Reino dos Unicórnios: frente B', `Reino dos Unicórnios: vozes das falas novas (integração ${nm(R, 'v1')})`]);
  assert.doesNotMatch(C.git(R.principal, 'log', '--format=%B', 'main'), /base do e2e|Claude-Session/);
  assert.match(R.ler('jogo/ferramentas/testes/base-referencia.txt'), /^@$/m);
  assert.deepStrictEqual(R.linhas('test.log'), ['test']);
  assert.strictEqual(R.linhas('vozes.log').length, gravacoes + 1);
  assert.strictEqual(V.pendentes(R.principal).length, 0);
  assert.match(R.ler('jogo/js/voz/geral.js'), /"a1".*"b1".*"c0"/);
  assert.strictEqual(R.git(R.principal, 'status', '--porcelain'), '');
});

test('integrar: conflito de vozes junto com um de verdade → resolva o de verdade e o --continuar faz as vozes', async () => {
  const R = criarRepo('fluxo-intv', { vozes: true });
  frenteComVoz(R, 'x', 'x1|Fala do X.', (p) => R.escrever('CLAUDE.md', '# Regras\n- Skills: x.\n', p));
  frenteComVoz(R, 'y', 'y1|Fala do Y.', (p) => R.escrever('CLAUDE.md', '# Regras\n- Skills: y.\n', p));
  const nome = nm(R, 'v2');
  const r1 = await rodar(R, ['feat/x', 'feat/y', '--commit', '--vozes', '--sem-e2e', '--nome', nome]);
  assert.strictEqual(r1.codigo, 2, r1.texto);
  assert.match(r1.texto, /- CLAUDE\.md/);
  assert.match(r1.texto, /- jogo\/ferramentas\/gerado\/vozes-indice\.json/);
  R.escrever('CLAUDE.md', '# Regras\n- Skills: x, y.\n', r1.pasta);
  R.git(r1.pasta, 'add', 'CLAUDE.md');
  const r2 = await rodar(R, ['--continuar', '--nome', nome, '--vozes', '--sem-e2e']);
  assert.strictEqual(r2.codigo, 0, r2.texto);
  assert.match(r2.texto, /conflito nas vozes .*resolvido sozinho/);
  assert.match(r2.texto, /nenhuma fala sem áudio/);
  assert.deepStrictEqual(assuntos(r1.pasta, 2), ['Reino dos Unicórnios: frente x', 'Reino dos Unicórnios: frente y']);
  const indice = JSON.parse(R.ler(V.INDICE, r1.pasta));
  assert.deepStrictEqual(Object.keys(indice).sort(), ['c0', 'x1', 'y1']);
  assert.match(R.ler('jogo/js/voz/geral.js', r1.pasta), /"x1".*"y1"/);
  assert.strictEqual(C.git(r1.pasta, 'status', '--porcelain'), '');
});

test('integrar: a mesma fala com áudios diferentes para; resolvida à mão, o --continuar segue', async () => {
  const R = criarRepo('fluxo-intv', { vozes: true });
  frenteComVoz(R, 'p', 'k1|Oi, versão P.');
  frenteComVoz(R, 'q', 'k1|Oi, versão Q.');
  const nome = nm(R, 'v3');
  const r1 = await rodar(R, ['feat/p', 'feat/q', '--commit', '--vozes', '--sem-e2e', '--nome', nome]);
  assert.strictEqual(r1.codigo, 2, r1.texto);
  assert.match(r1.texto, /1 fala\(s\) regravada\(s\) diferente nos dois lados \(k1\)/);
  // vale a da frente Q: o índice dela, e a fala da P sai
  R.git(r1.pasta, 'checkout', '--theirs', '--', V.INDICE);
  R.git(r1.pasta, 'add', '--', V.INDICE);
  R.git(r1.pasta, 'rm', '-q', '--', 'jogo/falas/p.txt');
  const r2 = await rodar(R, ['--continuar', '--nome', nome, '--vozes', '--sem-e2e']);
  assert.strictEqual(r2.codigo, 0, r2.texto);
  assert.strictEqual(V.pendentes(r1.pasta).length, 0);
  assert.match(R.ler('jogo/js/voz/geral.js', r1.pasta), /"k1":"Oi, versão Q\."/);
});

test('integrar: conferência das vozes reprovada para; o --continuar faz o commit sem gravar de novo', async () => {
  const R = criarRepo('fluxo-intv', { vozes: true });
  const s = R.frente('s');
  R.escrever('jogo/falas/s.txt', 's1|Esta REPROVA na conferência.\n', s);
  const nome = nm(R, 'v4');
  const r1 = await rodar(R, [s, '--assunto', 'frente S', '--commit', '--vozes', '--sem-e2e', '--nome', nome]);
  assert.strictEqual(r1.codigo, 2, r1.texto);
  assert.match(r1.texto, /reprovada: Esta REPROVA/);
  assert.match(r1.texto, new RegExp(`--continuar --nome ${nome}`));
  assert.deepStrictEqual(R.linhas('test.log'), [], 'o npm test espera as vozes');
  await assert.rejects(rodar(R, ['--nome', nome, '--sem-e2e']), /parou nas vozes/);
  const gravacoes = R.linhas('vozes.log').length;
  const r2 = await rodar(R, ['--continuar', '--nome', nome, '--sem-e2e']);
  assert.strictEqual(r2.codigo, 0, r2.texto);
  assert.strictEqual(R.linhas('vozes.log').length, gravacoes, 'não gravou de novo');
  assert.deepStrictEqual(assuntos(r1.pasta, 2), ['Reino dos Unicórnios: frente S', `Reino dos Unicórnios: vozes das falas novas (integração ${nome})`]);
  assert.deepStrictEqual(R.linhas('test.log'), ['test']);
  assert.strictEqual(C.git(r1.pasta, 'status', '--porcelain'), '');
});

test('integrar: fala sem áudio sem --vozes → aviso, e o --merge recusa', async () => {
  const R = criarRepo('fluxo-intv', { vozes: true });
  const t = R.frente('t');
  R.escrever('jogo/falas/t.txt', 't1|Fala sem áudio.\n', t);
  assert.ok(listar(t).ok);
  const nome = nm(R, 'v5');
  const r1 = await rodar(R, [t, '--assunto', 'frente T', '--commit', '--sem-e2e', '--nome', nome]);
  assert.strictEqual(r1.codigo, 0, r1.texto);
  assert.match(r1.texto, /1 fala\(s\) sem áudio: rode com --vozes/);
  const main = R.git(R.principal, 'rev-parse', 'main');
  const r2 = await rodar(R, ['--nome', nome, '--merge']);
  assert.strictEqual(r2.codigo, 1, r2.texto);
  assert.match(r2.texto, /--merge recusado: .*1 fala\(s\) sem áudio/);
  assert.strictEqual(R.git(R.principal, 'rev-parse', 'main'), main);
});

test('integrar: P regrava c0 e Q só acrescenta q1 → índice em 3 vias, sem choque falso', async () => {
  const R = criarRepo('fluxo-intv', { vozes: true });
  const p = R.frente('p');
  R.escrever('jogo/falas/comeco.txt', 'c0|Olá de novo, Mariana!\n', p);
  assert.ok(npm(p, 'vozes').ok);
  R.git(p, 'add', '-A'); R.git(p, 'commit', '-q', '-m', 'Reino dos Unicórnios: frente p');
  const regravada = JSON.parse(R.ler(V.INDICE, p)).c0;
  frenteComVoz(R, 'q', 'q1|Fala nova do Q.');
  const r = await rodar(R, ['feat/p', 'feat/q', '--commit', '--vozes', '--sem-e2e', '--nome', nm(R, 'v6')]);
  assert.strictEqual(r.codigo, 0, r.texto);
  assert.match(r.texto, /conflito nas vozes .*resolvido sozinho/);
  assert.deepStrictEqual(V.paresIndice(R.ler(V.INDICE, r.pasta)).map(([k]) => k), ['c0', 'q1'], 'na ordem das falas');
  assert.strictEqual(JSON.parse(R.ler(V.INDICE, r.pasta)).c0, regravada, 'fica a regravação da P');
  assert.strictEqual(V.pendentes(r.pasta).length, 0);
});
