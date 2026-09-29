// Teste de NAVEGADOR do `npm run ver` (Chromium, servidor de TESTE, save sintético): roda o CLI em 2 casos
// num tamanho só (mapa com save completo; loja com 500 estrelas; console do --js) e confere PNG, estado e zero erros.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/ver.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { PASTA_TESTES } = require('../guardas');

const VER = path.join(__dirname, '..', 'ver.js');
const rodar = (nome, args) => {
  const saida = execFileSync(process.execPath, [VER, '--tamanhos', 'celular', '--nome', nome].concat(args), { encoding: 'utf8', timeout: 90000 });
  const pasta = path.join(PASTA_TESTES, 'ver', nome);
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

test('ver: arrastar na metade esquerda do celular mostra o thumbstick e a Mariana anda', () => {
  const antes = rodar(`teste-parado-${id}`, []).estado.pos;
  const r = rodar(`teste-arrastar-${id}`, ['--passos', 'arrastar:100,600,170,600,600,preso;js:console.log("thumbstick", !document.querySelector("#controle").hidden)']);
  assert.match(r.saida, /\(--passos\) thumbstick true/, 'o thumbstick aparece com o dedo na tela');
  assert.ok(r.estado.pos.x > antes.x + 5, `a Mariana anda para a direita (${antes.x} → ${r.estado.pos.x})`);
});

test('ver: --tela album:1 chega à foto grande', () => {
  const r = rodar(`teste-album-${id}`, ['--tela', 'album:1']);
  assert.ok(r.estado.telas.some((t) => /tela-fotos-ver/.test(t)), JSON.stringify(r.estado.telas));
});

test('ver: --tela prova:<id>:2 mostra a 2ª questão', () => {
  const r = rodar(`teste-prova-q2-${id}`, ['--tela', 'prova:historia-3bim:2', '--js', 'document.querySelector(".desafio-num").textContent']);
  assert.match(r.saida, /--js 1 → Questão 2/);
});
