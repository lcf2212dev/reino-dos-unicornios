// fluxo/limpar.js num repositório git temporário (/tmp/reino-testes/fluxo-limpar-*; nunca o de verdade):
// lista sem mexer; o --aplicar só tira worktree limpa e branch contida na main (nunca --force nem -D).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { criarRepo } = require('../../fluxo/repo-de-teste');
const { limpar } = require('../../fluxo/limpar');

test('limpar: lista, e o --aplicar só tira o que é seguro', async () => {
  const R = criarRepo('fluxo-limpar');
  const limpa = R.frente('limpa');                       // sai, e a branch dela também
  const suja = R.frente('suja'); R.escrever('solto.txt', 'x', suja);
  const frente = R.frente('frente'); R.escrever('novo.txt', 'y', frente);
  R.git(frente, 'add', '-A'); R.git(frente, 'commit', '-q', '-m', 'à frente');
  const viva = R.frente('viva');
  const sumiu = R.frente('sumiu'); fs.rmSync(sumiu, { recursive: true });   // vira prunable
  R.git(R.principal, 'branch', 'feat/mesclada', 'main');                    // sem worktree, contida na main
  R.git(R.principal, 'branch', 'feat/aberta', 'feat/frente');               // não contida
  fs.mkdirSync(path.join(R.base, 'nm'));
  fs.symlinkSync(path.join(R.base, 'nm'), path.join(limpa, 'node_modules')); // o link não conta como solto
  R.escrever('jogo/js/versao.json', '{}', limpa);                            // ignorado gerado: não segura
  R.escrever('.gitignore', 'node_modules\njogo/js/versao.json\n.vozes/\nsegredo.txt\n');
  R.git(R.principal, 'commit', '-qam', 'ignorados');
  [limpa, suja, frente, viva].forEach((p) => R.git(p, 'merge', '-q', 'main'));
  R.git(frente, 'reset', '-q', '--hard', 'HEAD^2'); R.escrever('novo.txt', 'y', frente);
  R.git(frente, 'add', '-A'); R.git(frente, 'commit', '-q', '-m', 'à frente de novo');
  R.escrever('.vozes/venv/bin/python', 'x', limpa);                         // só o venv: aviso, mas sai
  const comIgnorado = R.frente('ignorado'); R.escrever('segredo.txt', 's', comIgnorado);
  R.escrever('.vozes/tmp', 'arquivo solto, não pasta', comIgnorado);              // só pasta tmp é descartável
  const protegida = R.frente('ef-plano');                                    // limpa, mas protegida pelo --manter
  const proc = spawn('sleep', ['60'], { cwd: viva, stdio: 'ignore' });
  try {
    await new Promise((ok) => setTimeout(ok, 200));
    const antes = R.git(R.principal, 'worktree', 'list');
    const l = limpar(['--manter', 'reino-ef-'], R.principal);
    assert.strictEqual(R.git(R.principal, 'worktree', 'list'), antes, 'sem --aplicar não mexe em nada');
    assert.match(l.texto, /prunable \(a pasta sumiu\): 1/);
    assert.match(l.texto, /✔ .*reino-limpa.*limpa/);
    assert.match(l.texto, /reino-suja.*mudança\(s\) solta/);
    assert.match(l.texto, /reino-frente.*1 commit\(s\) fora da main/);
    assert.match(l.texto, new RegExp(`reino-viva.*processo vivo \\(PID ${proc.pid}`));
    assert.match(l.texto, /reino-limpa.*⚠ some com ela: \.vozes\/venv/);
    assert.match(l.texto, /reino-ignorado.*arquivos ignorados \.vozes\/tmp, segredo\.txt/);
    assert.match(l.texto, /reino-ef-plano.*protegida pelo --manter/);
    assert.match(l.texto, /feat\/aberta: 1 commit\(s\) à frente/);

    const a = limpar(['--aplicar', '--manter', 'reino-ef-'], R.principal);
    const restantes = R.git(R.principal, 'worktree', 'list');
    assert.ok(!fs.existsSync(limpa) && !restantes.includes('reino-limpa'));
    assert.ok(!restantes.includes('reino-sumiu'));
    ['reino-suja', 'reino-frente', 'reino-viva', 'reino-ignorado', 'reino-ef-plano'].forEach((p) => assert.ok(restantes.includes(p), p));
    assert.ok(fs.existsSync(path.join(suja, 'solto.txt')));
    assert.ok(fs.existsSync(path.join(comIgnorado, 'segredo.txt')));
    const branches = R.git(R.principal, 'branch', '--format=%(refname:short)').split('\n');
    // a branch da prunable conta como livre já na listagem (o prune vem antes)
    // contidas: limpa, suja, viva, sumiu, mesclada, ignorado, ef-plano; saem a limpa, a sumiu e a mesclada
    assert.match(l.texto, /contidas na main: 7 \(3 podem sair/);
    ['feat/limpa', 'feat/sumiu', 'feat/mesclada'].forEach((b) => assert.ok(!branches.includes(b), b));
    ['main', 'feat/suja', 'feat/frente', 'feat/viva', 'feat/aberta', 'feat/ignorado', 'feat/ef-plano'].forEach((b) => assert.ok(branches.includes(b), b));
    assert.match(a.texto, /branch feat\/suja ficou: em uso/);
    assert.match(a.texto, /ficou .*reino-viva: processo vivo/);

    // rodando de dentro de uma worktree: ela não sai
    R.git(viva, 'status');
    proc.kill();
    await new Promise((ok) => proc.once('exit', ok));
    limpar(['--aplicar', '--manter', 'reino-ef-'], viva);
    assert.ok(fs.existsSync(viva), 'a worktree de onde roda fica');
  } finally { proc.kill(); }
});
