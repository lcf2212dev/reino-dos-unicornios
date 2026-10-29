// trava.js com vários processos disputando a MESMA trava ao mesmo tempo: só um pode ficar com ela.
// Bug da auditoria: dois caminhos de corrida davam dois donos: (1) trava de PID morto assumida por dois ao mesmo
// tempo (temp + rename + releitura); (2) arquivo recém-criado com 'wx' ainda vazio lido por outro como "morto".
// Uso: node --test jogo/ferramentas/testes/unidade/trava-corrida.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { PASTA_TESTES } = require('../guardas');

const TRAVA = path.join(__dirname, '..', 'trava.js');
const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'trava-corrida-'));
const env = Object.assign({}, process.env, { REINO_TRAVA_DONA: '' });
const RODADAS = 12, DISPUTANTES = 6, JUNTAS = 4;   // rodadas em lotes de 4 ao mesmo tempo (arquivos diferentes)

function disputante(arq, largada) {
  const cod = `while (Date.now() < ${largada}) {}
    require(${JSON.stringify(TRAVA)}).pegar('p' + process.pid, { arquivo: ${JSON.stringify(arq)}, esperarMs: 0 })
      .then(() => { console.log('peguei'); setTimeout(() => process.exit(0), 600); }, () => process.exit(4));`;
  const p = spawn(process.execPath, ['-e', cod], { env });
  let saida = '';
  p.stdout.on('data', (b) => { saida += b; });
  return new Promise((ok) => p.on('close', () => ok(saida)));
}

// todos prontos antes de largar; devolve quantos pegaram
async function rodada(arq, n, largada = Date.now() + 400) {
  const saidas = await Promise.all(Array.from({ length: n }, () => disputante(arq, largada)));
  return saidas.filter((s) => /peguei/.test(s)).length;
}
// as rodadas em lotes: cada uma no seu arquivo, as do lote com a mesma largada (prepara o arquivo antes)
async function rodadas(nomeDe, preparar = () => {}) {
  const donos = [];
  for (let i = 0; i < RODADAS; i += JUNTAS) {
    const lote = Array.from({ length: Math.min(JUNTAS, RODADAS - i) }, (_, k) => path.join(pasta, nomeDe(i + k)));
    lote.forEach(preparar);
    const largada = Date.now() + 700;
    donos.push(...await Promise.all(lote.map((arq) => rodada(arq, DISPUTANTES, largada))));
  }
  return donos;
}

// PID que com certeza já morreu
const morto = Number(spawnSync(process.execPath, ['-e', 'console.log(process.pid)'], { encoding: 'utf8' }).stdout.trim());

test('trava de PID morto: só UM disputante assume', async () => {
  const donos = await rodadas((i) => `morto-${i}.json`, (arq) => fs.writeFileSync(arq, JSON.stringify({ pid: morto, nome: 'morto', desde: 'x' })));
  assert.ok(Math.max(...donos) <= 1, `donos simultâneos por rodada: ${donos.join(',')}`);
  assert.ok(Math.min(...donos) >= 1, `ninguém assumiu a trava morta: ${donos.join(',')}`);
});

test('trava livre: só UM disputante pega', async () => {
  const donos = await rodadas((i) => `livre-${i}.json`);
  assert.ok(Math.max(...donos) <= 1, `donos simultâneos por rodada: ${donos.join(',')}`);
});

test('arquivo da trava ainda vazio (dono no meio da criação) não é assumido', async () => {
  const arq = path.join(pasta, 'vazio.json');
  fs.writeFileSync(arq, '');
  const saida = await disputante(arq, Date.now());
  assert.doesNotMatch(saida, /peguei/, 'assumiu uma trava que outro acabou de criar');
});
