// Vigias de memória e de travamento: a decisão do vigia de dentro dos testes (testes/vigia-memoria.js) e o que o
// hook do Claude Code reconhece como comando de teste (fluxo/vigia-travamento.js). Sem navegador.
const { test } = require('node:test');
const assert = require('assert');
const { avaliar, descendentes, processos } = require('../vigia-memoria');
const { TESTE, mensagem } = require('../../fluxo/vigia-travamento');

const GB = 1024 ** 3;
const LIM = { processo: 4 * GB, total: 24 * GB, paradoMs: 5 * 60000 };

test('processo acima do limite = memória, com o PID e o tamanho', () => {
  const m = avaliar([{ pid: 7, nome: 'chrome-headless', rss: 0.5 * GB }, { pid: 9, nome: 'chrome-headless', rss: 17 * GB }], [], 0, LIM);
  assert.strictEqual(m.tipo, 'memoria');
  assert.match(m.texto, /processo 9 \(chrome-headless\) com 17\.0 GB/);
});

test('soma acima do limite = memória, mesmo sem processo gordo', () => {
  const procs = Array.from({ length: 10 }, (_, i) => ({ pid: i, nome: 'chrome-headless', rss: 3 * GB }));
  assert.match(avaliar(procs, [], 0, LIM).texto, /somam 30\.0 GB/);
});

test('aba sem foto nova há mais de 5 min = travado, com o que ela fazia', () => {
  const abas = [{ rotulo: 'celular/completo cenasMapaEInteriores', marca: 'interior-salao', quando: 0 }];
  const m = avaliar([], abas, 6 * 60000, LIM);
  assert.strictEqual(m.tipo, 'travado');
  assert.match(m.texto, /cenasMapaEInteriores.*interior-salao.*6 min/);
});

test('tudo normal = nada', () => {
  const procs = [{ pid: 1, nome: 'chrome-headless', rss: 0.6 * GB }, { pid: 2, nome: 'node', rss: 0.1 * GB }];
  assert.strictEqual(avaliar(procs, [{ rotulo: 'x', marca: 'y', quando: 1000 }], 60000, LIM), null);
});

test('descendentes sobe a árvore inteira a partir da raiz, sem ela e sem os de fora', () => {
  const lista = [{ pid: 10, ppid: 1 }, { pid: 11, ppid: 10 }, { pid: 12, ppid: 11 }, { pid: 13, ppid: 12 }, { pid: 20, ppid: 1 }];
  assert.deepStrictEqual(descendentes(lista, 10).map((p) => p.pid).sort(), [11, 12, 13]);
});

test('processos() acha este próprio processo em /proc (Linux)', { skip: process.platform !== 'linux' }, () => {
  const eu = processos().find((p) => p.pid === process.pid);
  assert.ok(eu && eu.rss > 0 && eu.ppid > 0);
});

test('o hook reconhece os comandos de teste e deixa o servidor de teste de fora', () => {
  assert.ok(TESTE.test('node jogo/ferramentas/testes/e2e.js --tamanhos celular'));
  assert.ok(TESTE.test('/usr/bin/node /home/x/reino-a/jogo/ferramentas/testar-tudo.js'));
  assert.ok(TESTE.test('node --test jogo/ferramentas/testes/unidade/x.navegador.test.js'));
  assert.ok(!TESTE.test('node jogo/ferramentas/testes/servidor-teste.js --fundo'));
  assert.ok(!TESTE.test('node -r vigia-pai.js /home/x/jogo/servidor/servidor.js'));
});

test('a mensagem do hook aponta a skill investigar-vazamento', () => {
  assert.match(mensagem([{ chave: 'a', texto: 'Chromium de teste PID 1 com 9.0 GB' }]), /PID 1 com 9\.0 GB[\s\S]*investigar-vazamento/);
});
