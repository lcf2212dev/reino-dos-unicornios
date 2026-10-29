// fluxo/integrar.js em repositórios git TEMPORÁRIOS (/tmp/reino-testes/fluxo-int-*; nunca o de verdade):
// cherry-pick linear, apply --3way de worktree sem commit, conflito do index.html resolvido sozinho, conflito de
// verdade + --continuar, branch `integracao` antiga (e em conflito) e retomada de integração antiga com barra (estado
// no /tmp, levado para o git da worktree), colisão igual (movida só com --merge) e diferente (recusa o merge),
// --trocar-base (base `@` no último commit, sem commit à parte e sem npm test de novo), --esperado, mensagem sem
// prefixo dobrado nem Claude-Session, --podar no começo, --merge e --push (só aqui, no repositório temporário).
// As vozes: fluxo-integrar-vozes.test.js.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const C = require('../../fluxo/comum');
const { criarRepo } = require('../../fluxo/repo-de-teste');
const { integrar, lerArgv } = require('../../fluxo/integrar');
const G = require('../../fluxo/integrar-git');
const E = require('../../fluxo/integrar-e2e');

const rodar = (R, args) => integrar(args, { cwd: R.principal, quieto: true, antesDoMerge: path.join(R.base, 'antes-do-merge') });
// nome único por execução (o relatório mora em /tmp/reino-testes/integrar/<nome>/)
const nm = (R, t) => `${t}-${path.basename(R.base).split('-').pop()}`;
const assuntos = (pasta, n) => C.git(pasta, 'log', `-${n}`, '--format=%s').split('\n').reverse();

test('integrar: argumentos (--assunto vale para a entrada logo antes)', () => {
  const op = lerArgv(['feat/a', '/x/reino-b', '--assunto', 'frente B', '--nome', 'n1', '--commit', '--trocar-base', 'desc']);
  assert.deepStrictEqual(op.entradas, [{ entrada: 'feat/a' }, { entrada: '/x/reino-b', assunto: 'frente B' }]);
  assert.strictEqual(op.nome, 'n1'); assert.strictEqual(op.commit, true); assert.strictEqual(op['trocar-base'], 'desc');
  assert.throws(() => lerArgv(['--assunto', 'x']), /logo depois/);
  const o2 = lerArgv(['--nome', 'n', '--vozes', '--esperado', 'tela-(loja|mapa)']);
  assert.strictEqual(o2.vozes, true); assert.strictEqual(o2.esperado, 'tela-(loja|mapa)');
});

test('integrar: mensagem do commit sem prefixo dobrado e sem Claude-Session', () => {
  const antes = process.env.CLAUDE_SESSION_URL;
  process.env.CLAUDE_SESSION_URL = 'https://claude.ai/code/session_x';
  try {
    assert.strictEqual(G.mensagem('frente A'), 'Reino dos Unicórnios: frente A');
    assert.strictEqual(G.mensagem('Reino dos Unicórnios: frente A'), 'Reino dos Unicórnios: frente A');
  } finally { if (antes === undefined) delete process.env.CLAUDE_SESSION_URL; else process.env.CLAUDE_SESSION_URL = antes; }
});

test('integrar: diferenças do e2e (resumo.json + saída) e o --esperado', () => {
  const pasta = fs.mkdtempSync(path.join(C.PASTA_TESTES, 'fluxo-int-e2e-'));
  const esc = (nome, texto) => { const f = path.join(pasta, nome); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, texto); return f; };
  const resumo = esc('e2e-1/resumo.json', JSON.stringify({ total: 2, porTamanho: { celular: { nomes: { dock: ['tela-loja'], outras: ['mapa-dia'] } } } }));
  const fimE2e = `\n✘ E2E FALHOU: o jogo atual difere da base x (lista acima).\n  Base: /b\n  Atual: ${path.join(pasta, 'e2e-1', 'atual')}\n`;
  const txt = esc('e2e.txt', '✘ 4 diferença(s) em 900 arquivos (1 só em HUD/dock/balão, no resumo acima):\n' +
    '  dados/provas.json: conteúdo diferente (diff -u a b)\n  falta imagens/tablet/tela-loja.png\n' +
    '  imagens/celular/mapa-dia.png: 900 pixels diferentes (800 fora do ruído)\n' + fimE2e);
  // (d) a pasta vem da linha "  Atual:", nunca do resumo.json mais novo de outro e2e-*
  esc('e2e-2/resumo.json', '{}');
  assert.strictEqual(E.resumo(txt), resumo);
  assert.strictEqual(E.resumo(esc('sem-atual.txt', '✘ 1 diferença(s) em 9 arquivos:\n')), null);
  assert.deepStrictEqual(E.diferencas(txt, resumo).itens.sort(), ['celular/mapa-dia', 'celular/tela-loja', 'dados/provas.json', 'tablet/tela-loja']);
  const conf = { e2e: false, e2eSaida: txt, resumo };
  assert.deepStrictEqual(E.conferirEsperado(/tela-loja|mapa-dia|provas/, conf), { ok: true, total: 4, fora: [] });
  assert.deepStrictEqual(E.conferirEsperado(/^tela-/, conf).fora.sort(), ['celular/mapa-dia', 'dados/provas.json']);
  assert.strictEqual(E.conferirEsperado(/x/, { e2e: true }).ok, true, 'e2e idêntico: nada a conferir');
  assert.strictEqual(E.conferirEsperado(/x/, { e2e: false, e2eSaida: path.join(pasta, 'nada.txt') }).ok, false, 'falhou sem lista = recusa');
  // (a) o e2e só imprime as 200 primeiras falhas: contou mais do que se lê = recusa
  const cortado = esc('cortado.txt', '✘ 250 diferença(s) em 900 arquivos:\n  dados/a.json: conteúdo diferente (diff -u a b)\n');
  assert.match(E.conferirEsperado(/./, { e2e: false, e2eSaida: cortado, resumo: null }).fora[0], /contou 250 .* só 1/);
  // (b) sem resumo.json: a imagem vem da linha "<f>: N pixels diferentes"
  const semResumo = esc('sem-resumo.txt', '✘ 1 diferença(s) em 900 arquivos:\n  imagens/celular/tela-loja.png: 300 pixels diferentes (200 fora do ruído)\n');
  assert.deepStrictEqual(E.conferirEsperado(/tela-loja/, { e2e: false, e2eSaida: semResumo, resumo: null }), { ok: true, total: 1, fora: [] });
  // (c) referência vazia é diferença (e não casa com o regex das imagens)
  const vazia = esc('vazia.txt', '✘ 1 diferença(s) em 0 arquivos:\n  referência vazia: /tmp/ref\n');
  assert.deepStrictEqual(E.conferirEsperado(/tela-loja/, { e2e: false, e2eSaida: vazia, resumo: null }).fora, ['referência vazia']);
});

test('integrar: cherry-pick + worktree sem commit + index.html + colisão igual; depois base, merge e push', async () => {
  const R = criarRepo('fluxo-int');
  const mainAntes = R.git(R.principal, 'rev-parse', 'main');
  // frente A: branch com commit (linha b do manifesto + material rastreado)
  const a = R.frente('a');
  R.escrever('Material/foto.txt', 'foto igual', a);
  R.mudarManifesto(a, 'b', 'b-A', 'Reino dos Unicórnios: frente A');
  // frente B: worktree SEM commit (linha f do manifesto, index.html refeito, arquivo novo não rastreado)
  const b = R.frente('b');
  R.mudarManifesto(b, 'f', 'f-B');
  R.escrever('novo-B.txt', 'novo', b);
  // árvore principal: a mesma foto, não rastreada (idêntica) + config local não rastreada
  R.escrever('Material/foto.txt', 'foto igual');
  R.escrever('.mcp.json', '{}');

  const sessao = process.env.CLAUDE_SESSION_URL;
  process.env.CLAUDE_SESSION_URL = 'https://claude.ai/code/session_x';   // não pode ir para commit nenhum
  const r1 = await rodar(R, ['feat/a', b, '--assunto', 'Reino dos Unicórnios: frente B', '--commit', '--nome', nm(R, 't1')]);
  if (sessao === undefined) delete process.env.CLAUDE_SESSION_URL; else process.env.CLAUDE_SESSION_URL = sessao;
  assert.strictEqual(r1.codigo, 0, r1.texto);
  assert.deepStrictEqual(R.linhas('e2e.log'), ['--podar', 'e2e'], 'poda no começo, depois o e2e');
  assert.deepStrictEqual(R.linhas('test.log'), ['test']);
  const integ = r1.pasta;
  assert.strictEqual(integ, path.join(R.base, `reino-integracao-${nm(R, 't1')}`));
  assert.deepStrictEqual(assuntos(integ, 3), ['Reino dos Unicórnios: começo', 'Reino dos Unicórnios: frente A', 'Reino dos Unicórnios: frente B']);
  assert.strictEqual(C.git(integ, 'rev-list', '--merges', 'main..HEAD'), '', 'histórico linear');
  assert.match(R.ler('jogo/index.html', integ), /^<!-- gerado --> a b-A c d e f-B g$/m);
  assert.match(r1.texto, /conflito em jogo\/index\.html: um lado \+ npm run index/);
  assert.strictEqual(R.ler('novo-B.txt', integ), 'novo');
  assert.strictEqual(C.git(integ, 'status', '--porcelain'), '');
  assert.match(r1.texto, /colisão igual \(mover antes do merge\): Material\/foto\.txt/);
  assert.match(r1.texto, /✔ npm test/);
  assert.ok(fs.existsSync(r1.relatorio));
  // nada mudou na árvore principal nem na main
  assert.strictEqual(R.git(R.principal, 'rev-parse', 'main'), mainAntes);
  assert.strictEqual(R.ler('Material/foto.txt'), 'foto igual');

  // de novo com o mesmo nome: recusa
  await assert.rejects(rodar(R, ['feat/a', '--nome', nm(R, 't1')]), /já existe/);

  // base do e2e, merge e push (autorizados: só no repositório temporário): a base `@` entra no último commit
  // (frente B), sem commit "base do e2e" à parte, e o npm test não roda de novo
  const r2 = await rodar(R, ['--nome', nm(R, 't1'), '--trocar-base', 'frentes A e B', '--merge', '--push']);
  assert.strictEqual(r2.codigo, 0, r2.texto);
  assert.match(r2.texto, /já conferidos/);
  assert.doesNotMatch(r2.texto, /npm test de novo/);
  assert.deepStrictEqual(R.linhas('test.log'), ['test'], 'npm test uma vez só');
  const baseTxt = R.ler('jogo/ferramentas/testes/base-referencia.txt');
  assert.strictEqual(baseTxt, '# Commit BASE das referências do e2e.\n# 1234567 = a primeira.\n# @ = frentes A e B\n@\n');
  assert.deepStrictEqual(assuntos(R.principal, 3), ['Reino dos Unicórnios: começo', 'Reino dos Unicórnios: frente A', 'Reino dos Unicórnios: frente B']);
  assert.strictEqual(C.git(R.principal, 'log', '-1', '--format=%H', '--', 'jogo/ferramentas/testes/base-referencia.txt'), C.git(R.principal, 'rev-parse', 'HEAD'));
  assert.doesNotMatch(C.git(R.principal, 'log', '--format=%B', 'main'), /Claude-Session/);
  assert.strictEqual(R.git(R.principal, 'rev-parse', 'main'), R.git(R.principal, 'rev-parse', `integracao-${nm(R, 't1')}`));
  assert.strictEqual(R.git(R.remoto, 'rev-parse', 'main'), R.git(R.principal, 'rev-parse', 'main'));
  // a foto não rastreada foi movida para antes-do-merge/<data>/ e o merge trouxe a rastreada (igual)
  const destino = /movida\(s\) para (\S+)/.exec(r2.texto)[1];
  assert.strictEqual(destino, path.join(R.base, 'antes-do-merge', C.hoje()));
  assert.strictEqual(R.ler('Material/foto.txt', destino), 'foto igual');
  assert.strictEqual(R.ler('Material/foto.txt'), 'foto igual');
  assert.strictEqual(R.git(R.principal, 'status', '--porcelain'), '?? .mcp.json');
});

test('integrar: conflito de verdade para, --continuar retoma; colisão diferente recusa o --merge', async () => {
  const R = criarRepo('fluxo-int');
  const x = R.frente('x');
  R.escrever('Pasta/z.txt', 'da frente', x);
  R.mudarManifesto(x, 'c', 'c-X', 'Reino dos Unicórnios: frente X');
  const y = R.frente('y');
  R.mudarManifesto(y, 'c', 'c-Y', 'Reino dos Unicórnios: frente Y');
  R.escrever('Pasta/z.txt', 'outro conteúdo');   // não rastreado na principal, diferente do da frente X

  const r1 = await rodar(R, ['feat/x', 'feat/y', '--commit', '--nome', nm(R, 't2'), '--sem-e2e']);
  assert.strictEqual(r1.codigo, 2, r1.texto);
  assert.match(r1.texto, /conflito ao aplicar feat\/y/);
  assert.match(r1.texto, /- jogo\/manifesto\.txt/);
  assert.match(r1.texto, new RegExp(`--continuar --nome ${nm(R, 't2')}`));
  // o estado mora no git da worktree de integração (sobrevive a reinício), não no /tmp
  const noGit = path.resolve(r1.pasta, C.git(r1.pasta, 'rev-parse', '--git-path', 'reino-integrar'));
  assert.strictEqual(r1.arqEstado, path.join(noGit, 'estado.json'));
  assert.ok(!fs.existsSync(path.join(C.PASTA_TESTES, 'integrar', `${nm(R, 't2')}.json`)));
  const estado = JSON.parse(fs.readFileSync(r1.arqEstado, 'utf8'));
  assert.strictEqual(estado.pendente, true);
  await assert.rejects(rodar(R, ['--nome', nm(R, 't2')]), /use --continuar/);

  // resolve o manifesto (o index.html fica em conflito: o --continuar refaz sozinho)
  const integ = r1.pasta;
  R.escrever('jogo/manifesto.txt', 'a\nb\nc-XY\nd\ne\nf\ng\n', integ);
  R.git(integ, 'add', 'jogo/manifesto.txt');
  const r2 = await rodar(R, ['--continuar', '--nome', nm(R, 't2'), '--sem-e2e']);
  assert.strictEqual(r2.codigo, 1, r2.texto);   // 1 = colisão diferente
  assert.deepStrictEqual(assuntos(integ, 2), ['Reino dos Unicórnios: frente X', 'Reino dos Unicórnios: frente Y']);
  assert.match(R.ler('jogo/index.html', integ), /^<!-- gerado --> a b c-XY d e f g$/m);
  assert.match(r2.texto, /colisões DIFERENTES[\s\S]*- Pasta\/z\.txt/);

  const main = R.git(R.principal, 'rev-parse', 'main');
  const r3 = await rodar(R, ['--nome', nm(R, 't2'), '--merge']);
  assert.strictEqual(r3.codigo, 1);
  assert.match(r3.texto, /--merge recusado: colisões diferentes/);
  assert.strictEqual(R.git(R.principal, 'rev-parse', 'main'), main);
  assert.strictEqual(R.ler('Pasta/z.txt'), 'outro conteúdo');
});

test('integrar: sem --commit, soltas depois dos cherry-picks e sem commit; --merge recusado', async () => {
  const R = criarRepo('fluxo-int');
  const s = R.frente('solta');
  R.mudarManifesto(s, 'a', 'a-S');
  const c = R.frente('comcommit');
  R.mudarManifesto(c, 'g', 'g-C', 'Reino dos Unicórnios: frente C');
  const r1 = await rodar(R, [s, 'feat/comcommit', '--nome', nm(R, 't3'), '--sem-e2e']);
  assert.strictEqual(r1.codigo, 0, r1.texto);
  assert.deepStrictEqual(assuntos(r1.pasta, 1), ['Reino dos Unicórnios: frente C']);
  assert.match(C.git(r1.pasta, 'status', '--porcelain'), /M {1,2}jogo\/manifesto\.txt/);
  assert.match(R.ler('jogo/index.html', r1.pasta), /a-S b c d e f g-C/);
  const r2 = await rodar(R, ['--nome', nm(R, 't3'), '--merge']);
  assert.strictEqual(r2.codigo, 1);
  assert.match(r2.texto, /mudanças sem commit/);
});

test('integrar: processo vivo numa worktree de frente para tudo', async () => {
  const R = criarRepo('fluxo-int');
  const v = R.frente('viva');
  R.mudarManifesto(v, 'd', 'd-V', 'Reino dos Unicórnios: frente viva');
  const { spawn } = require('child_process');
  const p = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 20000)'], { cwd: v, stdio: 'ignore' });
  try {
    const r = await rodar(R, ['feat/viva', '--nome', nm(R, 't4'), '--sem-e2e']);
    assert.strictEqual(r.codigo, 1);
    assert.match(r.texto, new RegExp(`PID ${p.pid} \\[feat/viva\\]`));
    assert.ok(!fs.existsSync(path.join(R.base, `reino-integracao-${nm(R, 't4')}`)));
  } finally { p.kill(); }
});

test('integrar: branch `integracao` antiga não atrapalha; branch em conflito para sem mexer; retomada com barra', async () => {
  const R = criarRepo('fluxo-int');
  R.git(R.principal, 'branch', 'integracao');   // a antiga que impedia integracao/<nome>
  const f = R.frente('f');
  R.mudarManifesto(f, 'e', 'e-F', 'Reino dos Unicórnios: frente F');
  const r1 = await rodar(R, ['feat/f', '--nome', nm(R, 't5'), '--sem-e2e']);
  assert.strictEqual(r1.codigo, 0, r1.texto);
  assert.strictEqual(r1.branch, `integracao-${nm(R, 't5')}`);
  assert.strictEqual(C.git(r1.pasta, 'rev-parse', '--abbrev-ref', 'HEAD'), `integracao-${nm(R, 't5')}`);

  // um "filho" com o mesmo nome (integracao-<n>/x) impede integracao-<n>: para, sem criar nem apagar nada
  const n6 = nm(R, 't6');
  R.git(R.principal, 'branch', `integracao-${n6}/velha`);
  const refsAntes = R.git(R.principal, 'for-each-ref', '--format=%(refname)', 'refs/heads/');
  await assert.rejects(rodar(R, ['feat/f', '--nome', n6, '--sem-e2e']),
    new RegExp(`integracao-${n6}: já existe integracao-${n6}/velha[\\s\\S]*--nome ${n6}-2`));
  assert.strictEqual(R.git(R.principal, 'for-each-ref', '--format=%(refname)', 'refs/heads/'), refsAntes);
  assert.ok(!fs.existsSync(path.join(R.base, `reino-integracao-${n6}`)));
  assert.ok(!fs.existsSync(path.join(C.PASTA_TESTES, 'integrar', `${n6}.json`)));

  // integração antiga com barra (integracao/<n>, estado gravado): --nome retoma pela branch do estado
  const n7 = nm(R, 't7');
  R.git(R.principal, 'branch', '-D', 'integracao');
  const velha = path.join(R.base, `reino-integracao-${n7}`);
  R.git(R.principal, 'worktree', 'add', '-q', velha, '-b', `integracao/${n7}`, 'main');
  fs.writeFileSync(path.join(C.PASTA_TESTES, 'integrar', `${n7}.json`), JSON.stringify({
    nome: n7, pasta: velha, branch: `integracao/${n7}`, main: R.git(R.principal, 'rev-parse', 'main'),
    commit: false, passos: [], feito: 0, pendente: false, conferido: null,
  }));
  const r3 = await rodar(R, ['--nome', n7, '--sem-e2e']);
  assert.strictEqual(r3.codigo, 0, r3.texto);
  assert.strictEqual(r3.branch, `integracao/${n7}`);
  assert.match(r3.texto, /retomando a integração/);
  assert.ok(fs.existsSync(r3.arqEstado), 'o estado antigo do /tmp passa para o git da worktree');
});

test('integrar: --esperado recusa diferença fora do regex (sem base nem merge) e aceita quando todas casam', async () => {
  const R = criarRepo('fluxo-int');
  const a = R.frente('a');
  R.mudarManifesto(a, 'b', 'b-A', 'Reino dos Unicórnios: frente A');
  fs.writeFileSync(path.join(R.base, 'e2e-diferencas.json'), JSON.stringify(['celular/tela-loja', 'tablet/mapa-dia']));
  const main = R.git(R.principal, 'rev-parse', 'main');
  const baseAntes = R.ler('jogo/ferramentas/testes/base-referencia.txt');
  const r1 = await rodar(R, ['feat/a', '--commit', '--nome', nm(R, 't8'), '--esperado', 'tela-loja', '--trocar-base', 'loja', '--merge']);
  assert.strictEqual(r1.codigo, 1, r1.texto);
  assert.match(r1.texto, /1 diferença\(s\) do e2e fora do esperado[\s\S]*- tablet\/mapa-dia/);
  assert.strictEqual(R.git(R.principal, 'rev-parse', 'main'), main);
  assert.strictEqual(R.ler('jogo/ferramentas/testes/base-referencia.txt', r1.pasta), baseAntes);
  const r2 = await rodar(R, ['--nome', nm(R, 't8'), '--esperado', 'tela-loja|mapa-dia', '--trocar-base', 'loja e mapa', '--merge']);
  assert.strictEqual(r2.codigo, 0, r2.texto);
  assert.match(r2.texto, /as 2 diferença\(s\) do e2e casam/);
  assert.deepStrictEqual(assuntos(R.principal, 1), ['Reino dos Unicórnios: frente A']);
  assert.match(R.ler('jogo/ferramentas/testes/base-referencia.txt'), /^# @ = loja e mapa\n@$/m);
  assert.deepStrictEqual(R.linhas('test.log'), ['test']);
});

test('integrar: npm test vermelho pela base → --trocar-base --merge roda o npm test UMA vez a mais e entra', async () => {
  const R = criarRepo('fluxo-int');
  const a = R.frente('a');
  R.mudarManifesto(a, 'b', 'b-A', 'Reino dos Unicórnios: frente A');
  fs.writeFileSync(path.join(R.base, 'test-exige-base'), '');   // o passo de dados só passa com a base aceita
  const r = await rodar(R, ['feat/a', '--commit', '--trocar-base', 'dados novos', '--merge', '--nome', nm(R, 't9')]);
  assert.strictEqual(r.codigo, 0, r.texto);
  assert.match(r.texto, /✘ npm test[\s\S]*npm test de novo \(estava vermelho/);
  assert.deepStrictEqual(R.linhas('test.log'), ['test', 'test']);
  assert.deepStrictEqual(assuntos(R.principal, 1), ['Reino dos Unicórnios: frente A']);
});

test('integrar: --trocar-base não emenda commit que já está na main ou no origin/main', async () => {
  const R = criarRepo('fluxo-int');
  const a = R.frente('a');
  R.mudarManifesto(a, 'b', 'b-A', 'Reino dos Unicórnios: frente A');
  const r1 = await rodar(R, ['feat/a', '--commit', '--sem-e2e', '--nome', nm(R, 't10')]);
  assert.strictEqual(r1.codigo, 0, r1.texto);
  // o HEAD da integração foi para o origin/main por fora (a main local não)
  R.git(r1.pasta, 'push', '-q', 'origin', `HEAD:main`);
  R.git(R.principal, 'fetch', '-q', 'origin');
  await assert.rejects(rodar(R, ['--nome', nm(R, 't10'), '--trocar-base', 'x']), /já está no origin\/main/);
  // e para a main local
  R.git(R.principal, 'merge', '-q', '--ff-only', `integracao-${nm(R, 't10')}`);
  await assert.rejects(rodar(R, ['--nome', nm(R, 't10'), '--trocar-base', 'x']), /já está na main/);
  assert.strictEqual(R.git(r1.pasta, 'status', '--porcelain'), '', 'base não mexida');
});

test('integrar: e2e.js sem --aceitar → base num commit à parte (caminho de reserva)', async () => {
  const R = criarRepo('fluxo-int', { e2eAntigo: true });
  const a = R.frente('a');
  R.mudarManifesto(a, 'b', 'b-A', 'Reino dos Unicórnios: frente A');
  const r1 = await rodar(R, ['feat/a', '--commit', '--nome', nm(R, 't11')]);
  const cabeca = R.git(r1.pasta, 'rev-parse', '--short=7', 'HEAD');
  const r2 = await rodar(R, ['--nome', nm(R, 't11'), '--trocar-base', 'antiga', '--merge']);
  assert.strictEqual(r2.codigo, 0, r2.texto);
  assert.match(r2.texto, /sem --aceitar: base num commit à parte/);
  assert.deepStrictEqual(assuntos(R.principal, 2), ['Reino dos Unicórnios: frente A', `Reino dos Unicórnios: base do e2e em ${cabeca} (antiga)`]);
  assert.match(R.ler('jogo/ferramentas/testes/base-referencia.txt'), new RegExp(`^${cabeca}$`, 'm'));
  assert.deepStrictEqual(R.linhas('test.log'), ['test'], 'a base à parte, com o test verde, não roda o test de novo');
});
