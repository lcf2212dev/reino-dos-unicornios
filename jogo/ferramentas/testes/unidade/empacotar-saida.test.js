// empacotar-vozes.js --saida: só aceita pasta dentro de /tmp e nunca apaga nada lá (em js/voz do jogo
// continua apagando os pacotes órfãos, como sempre). As recusas saem antes de ler ou gravar qualquer coisa.
// Uso: node --test jogo/ferramentas/testes/unidade/empacotar-saida.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const EMPACOTAR = path.join(__dirname, '..', '..', 'vozes', 'empacotar-vozes.js');
const PASTA = '/tmp/reino-testes/empacotar-saida';
// recusas rodam com cwd = / (nunca em /tmp, mesmo com o repositório numa cópia em /tmp)
const rodar = (args, cwd) => spawnSync(process.execPath, [EMPACOTAR, ...args], { encoding: 'utf8', cwd });

test('--saida fora de /tmp é recusada sem criar nem apagar nada', () => {
  // pasta própria desta execução (worktrees e cópias rodando ao mesmo tempo não dividem o link)
  fs.mkdirSync('/tmp/reino-testes', { recursive: true });
  const casa = fs.mkdtempSync('/tmp/reino-testes/empacotar-recusa-');
  fs.symlinkSync('/usr', path.join(casa, 'atalho'));   // link em /tmp que aponta para fora (fixo: /usr)
  // caminhos que nunca estão em /tmp; o do repositório só quando o repositório não está em /tmp
  const pedidas = ['/home/leandro/nao-crie-isto', '/usr/nao-crie-isto', 'relativa-nao-crie', '/tmp', '/tmp/../home/leandro/nao-crie-isto',
    path.join(casa, 'atalho', 'nao-crie-isto'), '--outra', undefined];
  const noRepo = __dirname.startsWith('/tmp/') ? null : path.join(__dirname, 'nao-crie-isto');
  if (noRepo) pedidas.push(noRepo);
  for (const p of pedidas) {
    const r = rodar(['--saida'].concat(p === undefined ? [] : [p]), '/');
    assert.strictEqual(r.status, 2, `${p}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /proibido: --saida/);
  }
  ['/home/leandro/nao-crie-isto', '/usr/nao-crie-isto', '/relativa-nao-crie'].concat(noRepo ? [noRepo] : [])
    .forEach((p) => assert.ok(!fs.existsSync(p), p + ' não pode ter sido criado'));
});

test('--saida em /tmp não apaga os .js que já estavam lá', () => {
  const pasta = path.join(PASTA, 'saida');   // pasta fixa: cada execução regrava os ~30 MB no mesmo lugar
  fs.mkdirSync(pasta, { recursive: true });
  fs.writeFileSync(path.join(pasta, 'meu-arquivo.js'), '// não é pacote de voz\n');
  const r = rodar(['--saida', pasta]);
  assert.strictEqual(r.status, 0, r.stdout + r.stderr);
  assert.ok(fs.existsSync(path.join(pasta, 'meu-arquivo.js')), 'o .js que não é pacote tem que continuar lá');
  assert.ok(fs.existsSync(path.join(pasta, 'geral.js')));
});

test('ordem do falas.json não muda os bytes e pacote igual não é regravado', () => {
  // cópia do empacotador numa árvore falsa em /tmp (não toca no gerado/ real)
  fs.mkdirSync('/tmp/reino-testes', { recursive: true });
  const casa = fs.mkdtempSync('/tmp/reino-testes/empacotar-ordem-');
  const ger = path.join(casa, 'jogo', 'ferramentas', 'gerado');
  fs.mkdirSync(path.join(ger, 'vozes-cache'), { recursive: true });
  fs.mkdirSync(path.join(casa, 'jogo', 'ferramentas', 'vozes'), { recursive: true });
  const copia = path.join(casa, 'jogo', 'ferramentas', 'vozes', 'empacotar-vozes.js');
  fs.copyFileSync(EMPACOTAR, copia);
  const falas = ['c', 'a', 'd', 'b'].map((k) => ({ chave: k, voz: 'v', fala: k, pacotes: ['geral', 'p' + (k < 'c' ? 1 : 2)] }));
  const indice = {};
  falas.forEach((f) => { indice[f.chave] = f.chave + '.mp3'; fs.writeFileSync(path.join(ger, 'vozes-cache', f.chave + '.mp3'), 'audio ' + f.chave); });
  fs.writeFileSync(path.join(ger, 'vozes-indice.json'), JSON.stringify(indice));
  const saida = path.join(casa, 'saida');
  const vez = (ordem) => {
    fs.writeFileSync(path.join(ger, 'falas.json'), JSON.stringify({ falas: ordem }));
    const r = spawnSync(process.execPath, [copia, '--saida', saida], { encoding: 'utf8' });
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    return r.stdout;
  };
  assert.match(vez(falas), /3 reescritos, 0 iguais/);
  const bytes = fs.readFileSync(path.join(saida, 'geral.js'), 'utf8');
  const mtime = fs.statSync(path.join(saida, 'geral.js')).mtimeMs;
  assert.match(bytes, /\{"a":.*"b":.*"c":.*"d":/);
  assert.match(vez(falas.slice().reverse()), /0 reescritos, 3 iguais/);
  assert.strictEqual(fs.readFileSync(path.join(saida, 'geral.js'), 'utf8'), bytes);
  assert.strictEqual(fs.statSync(path.join(saida, 'geral.js')).mtimeMs, mtime);
});
