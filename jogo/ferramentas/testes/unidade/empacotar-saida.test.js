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
const rodar = (...args) => spawnSync(process.execPath, [EMPACOTAR, ...args], { encoding: 'utf8' });

test('--saida fora de /tmp é recusada sem criar nem apagar nada', () => {
  const casa = PASTA;
  fs.mkdirSync(casa, { recursive: true });
  if (!fs.existsSync(path.join(casa, 'atalho'))) fs.symlinkSync(path.join(__dirname, '..'), path.join(casa, 'atalho'));   // link em /tmp que aponta para fora
  const pedidas = [path.join(__dirname, 'nao-crie-isto'), '/home/leandro/nao-crie-isto', 'relativa-nao-crie', '/tmp', '/tmp/../home/x', path.join(casa, 'atalho', 'x'), '--outra', undefined];
  for (const p of pedidas) {
    const r = rodar(...['--saida'].concat(p === undefined ? [] : [p]));
    assert.strictEqual(r.status, 2, `${p}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /proibido: --saida/);
  }
  assert.ok(!fs.existsSync(path.join(__dirname, 'nao-crie-isto')));
  assert.ok(!fs.existsSync(path.join(process.cwd(), 'relativa-nao-crie')));
  assert.ok(!fs.existsSync(path.join(__dirname, '..', 'x')));
});

test('--saida em /tmp não apaga os .js que já estavam lá', () => {
  const pasta = path.join(PASTA, 'saida');   // pasta fixa: cada execução regrava os ~30 MB no mesmo lugar
  fs.mkdirSync(pasta, { recursive: true });
  fs.writeFileSync(path.join(pasta, 'meu-arquivo.js'), '// não é pacote de voz\n');
  const r = rodar('--saida', pasta);
  assert.strictEqual(r.status, 0, r.stdout + r.stderr);
  assert.ok(fs.existsSync(path.join(pasta, 'meu-arquivo.js')), 'o .js que não é pacote tem que continuar lá');
  assert.ok(fs.existsSync(path.join(pasta, 'geral.js')));
});
