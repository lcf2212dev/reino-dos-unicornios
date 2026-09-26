// fluxo/worktree.js num repositório git temporário (/tmp/reino-testes/fluxo-wt-*; nunca o de verdade):
// worktree ao lado da principal, branch feat/<tema>, node_modules por link, só o material NÃO rastreado copiado.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { criarRepo } = require('../../fluxo/repo-de-teste');
const { criarWorktree } = require('../../fluxo/worktree');
const C = require('../../fluxo/comum');

test('worktree: cria a pasta, a branch, o link do node_modules e copia só o material não rastreado', () => {
  const R = criarRepo('fluxo-wt');
  // material: matérias/ciências/ não rastreada (com subpasta); Rastreada/ já no git
  R.escrever('matérias/ciências/IMG_1.jpeg', 'foto 1');
  R.escrever('matérias/ciências/prova/IMG_2.jpeg', 'foto 2');
  R.escrever('Rastreada/x.txt', 'x');
  R.git(R.principal, 'add', 'Rastreada');
  R.git(R.principal, 'commit', '-q', '-m', 'rastreada');
  // node_modules "instalado" na principal (ignorado pelo .gitignore)
  fs.mkdirSync(path.join(R.principal, 'node_modules/playwright'), { recursive: true });

  const r = criarWorktree(['ciencias', '--material', 'Ciências', '--material', 'Rastreada/'], R.principal);
  const pasta = path.join(R.base, 'reino-ciencias');
  assert.strictEqual(r.pasta, pasta);
  assert.strictEqual(R.git(pasta, 'rev-parse', '--abbrev-ref', 'HEAD'), 'feat/ciencias');
  assert.strictEqual(R.git(pasta, 'rev-parse', 'HEAD'), R.git(R.principal, 'rev-parse', 'main'));
  assert.strictEqual(fs.realpathSync(path.join(pasta, 'node_modules')), fs.realpathSync(path.join(R.principal, 'node_modules')));
  assert.strictEqual(R.ler('matérias/ciências/prova/IMG_2.jpeg', pasta), 'foto 2');
  assert.strictEqual(R.ler('matérias/ciências/IMG_1.jpeg', pasta), 'foto 1');
  assert.match(r.texto, /Rastreada\/: já rastreada/);
  assert.match(r.texto, /material\.js "matérias\/ciências"/);
  // a árvore principal continua igual (só lida)
  assert.strictEqual(R.git(R.principal, 'status', '--porcelain', '-z').replace(/\0$/, ''), '?? matérias/');

  assert.throws(() => criarWorktree(['ciencias'], R.principal), /já existe/);
  assert.throws(() => criarWorktree(['outra', '--material', 'NaoExiste'], R.principal), /não existe/);
  assert.ok(!fs.existsSync(path.join(R.base, 'reino-outra')), 'material inválido não pode deixar worktree pela metade');
  assert.throws(() => criarWorktree(['Maiuscula'], R.principal), /tema inválido/);
});

test('pastaMaterial: nome da matéria em matérias/ sem diferença de maiúsculas, ou o caminho a partir da raiz', () => {
  const R = criarRepo('fluxo-wt');
  R.escrever('matérias/ciências/Revisão/IMG_1.jpeg', 'x');
  R.escrever('Solta/IMG_2.jpeg', 'x');
  const P = (n) => C.pastaMaterial(R.principal, n);
  assert.strictEqual(P('Ciências'), 'matérias/ciências');
  assert.strictEqual(P('ciências/'), 'matérias/ciências');
  assert.strictEqual(P('Ciências/Revisão'), 'matérias/ciências/Revisão');
  assert.strictEqual(P('Ciências'.normalize('NFD')), 'matérias/ciências');
  assert.strictEqual(P('matérias/ciências/Revisão'), 'matérias/ciências/Revisão');
  assert.strictEqual(P('Solta'), 'Solta');
  assert.strictEqual(P('Geografia'), null);
  assert.strictEqual(P('../fora'), null);
});

test('worktree: sem node_modules na principal, usa o de outra worktree registrada', () => {
  const R = criarRepo('fluxo-wt');
  const outra = R.frente('antiga');
  fs.mkdirSync(path.join(outra, 'node_modules/playwright'), { recursive: true });
  const r = criarWorktree(['nova', '--base', 'main'], R.principal);
  assert.strictEqual(fs.realpathSync(path.join(r.pasta, 'node_modules')), fs.realpathSync(path.join(outra, 'node_modules')));
  assert.ok(!fs.existsSync(path.join(R.principal, 'node_modules')));
});
