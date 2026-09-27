// Todo comando do package.json responde a --ajuda com o "Uso" e sai com 0, sem fazer mais nada (antes, 12 deles
// ignoravam o --ajuda e rodavam de verdade: o e2e inteiro, a gravação das vozes, o index reescrito).
// Primeiro confere no código que o arquivo trata o --ajuda: arquivo sem o tratamento nem chega a rodar aqui.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const scripts = require(path.join(REPO, 'package.json')).scripts;
const comandos = Object.entries(scripts).map(([nome, cmd]) => ({ nome, arq: (/^node (\S+\.js)$/.exec(cmd) || [])[1] }));

test('todo script do package.json é "node <arquivo>.js"', () => {
  assert.deepStrictEqual(comandos.filter((c) => !c.arq).map((c) => c.nome), []);
});

for (const { nome, arq } of comandos.filter((c) => c.arq)) {
  test(`npm run ${nome} -- --ajuda mostra o uso e sai`, () => {
    const codigo = fs.readFileSync(path.join(REPO, arq), 'utf8');
    // o tratamento de verdade (não basta a palavra num comentário): ajuda.js, ou o --ajuda da própria ferramenta
    const TRATA = /\.ajuda\(__filename\)|['"]--ajuda['"]|booleanas:\s*\[[^\]]*['"]ajuda['"]/;
    assert.ok(TRATA.test(codigo), `${arq} não trata --ajuda (use require('…/ajuda').ajuda(__filename))`);
    const r = spawnSync(process.execPath, [arq, '--ajuda'], { cwd: REPO, encoding: 'utf8', timeout: 20000 });
    assert.strictEqual(r.status, 0, `${arq} --ajuda saiu com ${r.status} ${r.signal || ''}\n${r.stderr}`);
    assert.match(r.stdout, /Uso/, `${arq} --ajuda não mostrou o "Uso"`);
  });
}

test('e2e e servidor de teste recusam opção desconhecida (não rodam sem ela)', () => {
  for (const arq of ['jogo/ferramentas/testes/e2e.js', 'jogo/ferramentas/testes/servidor-teste.js']) {
    const r = spawnSync(process.execPath, [arq, '--opcao-que-nao-existe'], { cwd: REPO, encoding: 'utf8', timeout: 20000 });
    assert.strictEqual(r.status, 2, `${arq}: ${r.stderr}`);
    assert.match(r.stderr, /opção desconhecida: --opcao-que-nao-existe/);
  }
});

test('opção sem o valor dela é recusada (não vira outra coisa nem roda sem ela)', () => {
  for (const args of [['--cenas'], ['--cenas', '--manter'], ['--trocar-base', 'abc123']]) {
    const r = spawnSync(process.execPath, ['jogo/ferramentas/testes/e2e.js', ...args], { cwd: REPO, encoding: 'utf8', timeout: 20000 });
    assert.strictEqual(r.status, 2, `e2e.js ${args.join(' ')}: ${r.stderr}`);
    assert.match(r.stderr, /precisa de/);
  }
});
