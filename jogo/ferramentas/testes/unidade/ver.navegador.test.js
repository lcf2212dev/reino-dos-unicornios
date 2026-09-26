// Teste de NAVEGADOR do `npm run ver` (Chromium, servidor de TESTE, save sintético): roda o CLI em 2 casos
// num tamanho só (mapa com save completo; loja com 500 estrelas; console do --js) e confere PNG, estado e zero erros.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/ver.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const VER = path.join(__dirname, '..', 'ver.js');
const rodar = (nome, args) => {
  const saida = execFileSync(process.execPath, [VER, '--tamanhos', 'celular', '--nome', nome].concat(args), { encoding: 'utf8', timeout: 90000 });
  const pasta = path.join('/tmp/reino-testes/ver', nome);
  return { saida, pasta, estado: JSON.parse(fs.readFileSync(path.join(pasta, 'estado.json'), 'utf8')).celular };
};
const id = Date.now();

test('ver: mapa com save completo', () => {
  const r = rodar(`teste-mapa-${id}`, ['--save', 'completo']);
  assert.ok(fs.statSync(path.join(r.pasta, 'celular.png')).size > 1000);
  assert.strictEqual(r.estado.estado, 'mapa');
  assert.match(r.saida, /✔ celular: cena mapa, estado mapa, 0 erro/);
});

test('ver: tela loja com 500 estrelas', () => {
  const r = rodar(`teste-loja-${id}`, ['--estrelas', '500', '--tela', 'loja', '--recorte', '0,0,100,50', '--ampliar', '2']);
  ['celular.png', 'celular-recorte.png', 'celular-recorte-x2.png'].forEach((f) => assert.ok(fs.existsSync(path.join(r.pasta, f)), f));
  assert.strictEqual(r.estado.progresso.estrelas, 500);
  assert.strictEqual(r.estado.estado, 'atividade');
});

test('ver: o console.log do --js vai para o console.txt e para o fim da saída, com o valor devolvido', () => {
  const r = rodar(`teste-console-${id}`, ['--js', 'console.log("oi do teste", 40 + 2)', '--js', '6 * 7']);
  assert.match(fs.readFileSync(path.join(r.pasta, 'console.txt'), 'utf8'), /\[log\] \(--js 1\) oi do teste 42/);
  assert.match(r.saida, /\[log\] \(--js 1\) oi do teste 42/);
  assert.match(r.saida, /--js 2 → 42/);
});

test('ver: --tela desafio:<id> abre esse desafio (sem o sorteio da sala)', () => {
  const r = rodar(`teste-desafio-${id}`, ['--tela', 'desafio:h1-03']);
  assert.ok(fs.statSync(path.join(r.pasta, 'celular.png')).size > 1000);
  assert.strictEqual(r.estado.estado, 'atividade');
  assert.throws(() => rodar(`teste-desafio-nao-${id}`, ['--tela', 'desafio:nao-existe']), /desafio "nao-existe" não existe/);
});
