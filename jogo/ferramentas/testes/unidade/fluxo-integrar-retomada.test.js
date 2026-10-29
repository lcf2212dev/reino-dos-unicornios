// fluxo/integrar.js em repositórios git TEMPORÁRIOS (/tmp/reino-testes/fluxo-intr-*; nunca o de verdade): os casos
// de parar e retomar achados na auditoria de bugs.
// - frente sem commit cujo `apply --3way` falha inteiro, sem conflito marcado (o arquivo que ela muda foi apagado
//   por uma frente anterior): o --continuar não pode dar o passo por feito e a frente sumir calada;
// - colisão DIFERENTE resolvida como a skill entregar manda (copiar o da árvore principal, git add, --continuar)
//   numa integração --commit: o que foi resolvido vira commit e o --merge sai;
// - frente sem commit que só apaga o que outra frente já apagou: o apply falha, mas a mudança já está lá (feito);
// - integração começada sem --commit e retomada com --continuar --commit: nenhum commit "resolução" engole as frentes;
// - sem --merge, o relatório traz o cabeçalho "Próximos passos" antes do comando sugerido.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const C = require('../../fluxo/comum');
const { criarRepo } = require('../../fluxo/repo-de-teste');
const { integrar } = require('../../fluxo/integrar');

const rodar = (R, args) => integrar(args, { cwd: R.principal, quieto: true, antesDoMerge: path.join(R.base, 'antes-do-merge') });
// nome único por execução (o relatório mora em /tmp/reino-testes/integrar/<nome>/)
const nm = (R, t) => `${t}-${path.basename(R.base).split('-').pop()}`;

test('integrar: apply que falha sem conflito marcado → o --continuar não perde a frente calado', async () => {
  const R = criarRepo('fluxo-intr');
  const nome = nm(R, 'intr-apply');
  // frente A (commit): apaga o CLAUDE.md
  const a = R.frente('a');
  R.git(a, 'rm', '-q', 'CLAUDE.md');
  R.git(a, 'commit', '-q', '-m', 'Reino dos Unicórnios: A apaga CLAUDE.md');
  // frente B (sem commit): muda o CLAUDE.md e cria um arquivo novo
  const b = R.frente('b');
  R.escrever('CLAUDE.md', '# Regras\n- Skills: gravar-vozes, validar-tudo, nova.\n', b);
  R.escrever('novo-B.txt', 'arquivo novo da frente B', b);

  const r1 = await rodar(R, ['feat/a', b, '--commit', '--sem-e2e', '--nome', nome]);
  assert.strictEqual(r1.codigo, 2, r1.texto);
  const integ = r1.pasta;
  assert.strictEqual(C.git(integ, 'diff', '--name-only', '--diff-filter=U'), '', 'nenhum arquivo marcado em conflito');
  assert.match(r1.texto, /NADA das mudanças/, r1.texto);
  // o arquivo novo da frente entra mesmo assim
  assert.ok(fs.existsSync(path.join(integ, 'novo-B.txt')), r1.texto);

  // --continuar sem resolver nada: tenta de novo, falha de novo e para de novo com o aviso
  const r2 = await rodar(R, ['--continuar', '--nome', nome, '--sem-e2e']);
  assert.strictEqual(r2.codigo, 2, r2.texto);
  assert.strictEqual(r2.estado.feito, 1);
  assert.match(r2.texto, /NADA das mudanças/, r2.texto);

  // quem orquestra põe a mudança à mão (aqui: recria o CLAUDE.md) e git add: no --continuar o apply --3way de novo
  // entra limpo (o arquivo já tem o conteúdo da frente), e só então o passo se dá por feito
  R.escrever('CLAUDE.md', '# Regras\n- Skills: gravar-vozes, validar-tudo, nova.\n', integ);
  R.git(integ, 'add', '--', 'CLAUDE.md');
  const r3 = await rodar(R, ['--continuar', '--nome', nome, '--sem-e2e']);
  assert.strictEqual(r3.codigo, 0, r3.texto);
  assert.strictEqual(r3.estado.feito, 2);
  assert.strictEqual(C.git(integ, 'show', 'HEAD:novo-B.txt'), 'arquivo novo da frente B');
});

test('integrar: colisão diferente resolvida como a skill manda → --continuar --commit --merge sai', async () => {
  const R = criarRepo('fluxo-intr');
  const nome = nm(R, 'intr-col');
  const b = R.frente('b');                                   // frente sem commit com o print (versão antiga)
  R.escrever('matérias/história/foto 1.txt', 'print antigo', b);
  R.escrever('matérias/história/foto 1.txt', 'print NOVO');  // árvore principal: o mais novo, não rastreado

  const r1 = await rodar(R, [b, '--assunto', 'frente B', '--commit', '--sem-e2e', '--nome', nome, '--merge']);
  assert.strictEqual(r1.codigo, 1, r1.texto);
  assert.match(r1.texto, /colisões DIFERENTES[\s\S]*matérias\/história\/foto 1\.txt/);

  // skill entregar, Integrar 7: vale o da árvore principal; copie para a integração, git add e --continuar
  const integ = r1.pasta;
  fs.copyFileSync(path.join(R.principal, 'matérias/história/foto 1.txt'), path.join(integ, 'matérias/história/foto 1.txt'));
  R.git(integ, 'add', '--', 'matérias/história/foto 1.txt');
  const r2 = await rodar(R, ['--continuar', '--nome', nome, '--commit', '--merge']);   // o --merge exige o e2e
  assert.strictEqual(r2.codigo, 0, r2.texto);
  assert.strictEqual(R.ler('matérias/história/foto 1.txt'), 'print NOVO');
  assert.match(C.git(R.principal, 'log', '-1', '--format=%s'), /resolução da integração/);
});

test('integrar: sem --merge, o relatório mostra "Próximos passos"', async () => {
  const R = criarRepo('fluxo-intr');
  const a = R.frente('a');
  R.mudarManifesto(a, 'b', 'b-A', 'Reino dos Unicórnios: frente A');
  const r = await rodar(R, ['feat/a', '--sem-e2e', '--nome', nm(R, 'intr-prox')]);
  assert.strictEqual(r.codigo, 0, r.texto);
  assert.match(r.texto, /Próximos passos[^\n]*\n[\s\S]*--merge \[--push\]/, r.texto);
});

test('integrar: frente sem commit que só apaga o que outra frente já apagou → o passo conta como feito', async () => {
  const R = criarRepo('fluxo-intr');
  const nome = nm(R, 'intr-apagado');
  const a = R.frente('a');
  R.git(a, 'rm', '-q', 'CLAUDE.md');
  R.git(a, 'commit', '-q', '-m', 'Reino dos Unicórnios: A apaga CLAUDE.md');
  const b = R.frente('b');
  fs.unlinkSync(path.join(b, 'CLAUDE.md'));                 // B apaga o mesmo arquivo, sem commit
  R.escrever('novo-B.txt', 'arquivo novo da frente B', b);

  const r = await rodar(R, ['feat/a', b, '--commit', '--sem-e2e', '--nome', nome]);
  assert.strictEqual(r.codigo, 0, r.texto);
  assert.match(r.texto, /já estão na integração/, r.texto);
  assert.strictEqual(r.estado.feito, 2);
  assert.strictEqual(C.git(r.pasta, 'show', 'HEAD:novo-B.txt'), 'arquivo novo da frente B');
  assert.ok(!fs.existsSync(path.join(r.pasta, 'CLAUDE.md')));
});

test('integrar: começada sem --commit, --continuar --commit não junta as frentes num commit "resolução"', async () => {
  const R = criarRepo('fluxo-intr');
  const nome = nm(R, 'intr-semcommit');
  const b = R.frente('b');
  R.escrever('novo-B.txt', 'arquivo novo da frente B', b);
  const r1 = await rodar(R, [b, '--sem-e2e', '--nome', nome]);
  assert.strictEqual(r1.codigo, 0, r1.texto);
  const main = C.git(R.principal, 'rev-parse', 'main');
  const r2 = await rodar(R, ['--continuar', '--nome', nome, '--commit', '--sem-e2e']);
  assert.doesNotMatch(r2.texto, /resolução da integração/, r2.texto);
  assert.strictEqual(C.git(r1.pasta, 'rev-parse', 'HEAD'), main, 'nenhum commit novo na integração');
  assert.ok(fs.existsSync(path.join(r1.pasta, 'novo-B.txt')), 'a mudança da frente continua solta');
});
