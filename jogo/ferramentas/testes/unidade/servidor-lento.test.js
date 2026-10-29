// servidor-teste.js: quando o servidor não diz "na porta" a tempo (10 s; aqui 1,5 s por REINO_SERVIDOR_SUBIR_MS), iniciar() falha — e o processo que ele subiu
// tem de morrer junto. Bug da auditoria: ele ficava vivo; com --fundo (grupo próprio, sem vigia-pai), órfão para sempre.
// Servidor FALSO (raiz sintética na pasta de testes): só demora 15 s para dizer "na porta" e sai sozinho em 25 s
// (o teste não manda sinal a nada: sem a correção, o órfão some sozinho). Sem navegador.
// Uso: node --test jogo/ferramentas/testes/unidade/servidor-lento.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { PASTA_TESTES } = require('../guardas');
const { iniciar } = require('../servidor-teste');
const { vivo } = require('../trava');

process.env.REINO_SERVIDOR_SUBIR_MS = '1500';   // a espera de verdade (10 s) só alongava o teste

function raizLenta() {
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const raiz = fs.mkdtempSync(path.join(PASTA_TESTES, 'servidor-lento-'));
  fs.mkdirSync(path.join(raiz, 'servidor'));
  fs.writeFileSync(path.join(raiz, 'servidor', 'servidor.js'), "setTimeout(() => console.log('ouvindo na porta ' + process.env.PORTA), 15000); setTimeout(() => process.exit(0), 25000);\n");
  return raiz;
}
// PIDs dos processos cujo comando cita o servidor falso (só os deste teste)
function pidsDe(raiz) {
  return fs.readdirSync('/proc').filter((d) => /^\d+$/.test(d)).filter((d) => {
    try { return fs.readFileSync(`/proc/${d}/cmdline`, 'utf8').includes(raiz); } catch (e) { return false; }
  }).map(Number);
}

for (const fundo of [false, true]) {
  test(`servidor que não sobe a tempo não fica vivo (fundo=${fundo})`, { timeout: 30000, skip: process.platform !== 'linux' }, async () => {
    const raiz = raizLenta();
    await assert.rejects(iniciar({ raiz, fundo }), /não subiu/);
    await new Promise((ok) => setTimeout(ok, 500));
    const sobra = pidsDe(raiz).filter(vivo);
    assert.deepStrictEqual(sobra, [], `servidor ainda vivo depois da falha: PID ${sobra.join(', ')}`);
  });
}
