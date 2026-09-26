// Servidor de TESTE do jogo: sobe o mesmo servidor/servidor.js numa porta livre (nunca a 80)
// com um banco novo em /tmp. O servidor de casa (porta 80, banco em servidor/dados/) nunca é tocado.
// Uso: node ferramentas/testes/servidor-teste.js [--porta 8800] [--raiz <pasta jogo>]
//      (fica rodando e mostra o endereço; Ctrl+C para parar)
// Em código: const { iniciar } = require('./servidor-teste'); const s = await iniciar(); … s.parar();
const fs = require('fs');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const PASTA_TMP = '/tmp/reino-testes';
const RAIZ_PADRAO = path.join(__dirname, '..', '..');

// recusa tudo o que poderia chegar no progresso de verdade
function conferirPorta(porta) {
  porta = Number(porta);
  if (!Number.isInteger(porta) || porta < 1024 || porta > 65535) throw new Error(`porta de teste inválida: ${porta} (use uma livre acima de 1024, nunca a 80)`);
  return porta;
}
function conferirBanco(banco) {
  const abs = path.resolve(banco);
  if (!abs.startsWith('/tmp/')) throw new Error(`o banco de teste fica sempre em /tmp (recebido: ${abs})`);
  if (/servidor[\\/]dados/.test(abs)) throw new Error('o banco de teste nunca pode ficar em servidor/dados');
  return abs;
}

function portaLivre(de) {
  return new Promise((resolver, falhar) => {
    const tentar = (p) => {
      if (p > 65000) return falhar(new Error('nenhuma porta livre'));
      const s = net.createServer();
      s.once('error', () => tentar(p + 1));
      s.listen(p, '127.0.0.1', () => s.close(() => resolver(p)));
    };
    tentar(de);
  });
}

// duas subidas ao mesmo tempo podem escolher a mesma porta: tenta outra (só quando a porta não foi pedida)
async function iniciar(op = {}) {
  for (let i = 0; ; i++) {
    try { return await subir(op); } catch (e) { if (op.porta || i >= 5 || !/EADDRINUSE/.test(e.message)) throw e; }
  }
}
async function subir(op) {
  const raiz = path.resolve(op.raiz || RAIZ_PADRAO);
  const porta = conferirPorta(op.porta || await portaLivre(8800 + Math.floor(Math.random() * 900)));
  fs.mkdirSync(PASTA_TMP, { recursive: true });
  const banco = conferirBanco(op.banco || fs.mkdtempSync(path.join(PASTA_TMP, 'banco-')) + '/reino-teste.db');
  const proc = spawn(process.execPath, [path.join(raiz, 'servidor', 'servidor.js')], {
    env: Object.assign({}, process.env, { PORTA: String(porta), BANCO: banco, RAIZ: raiz }),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolver, falhar) => {
    let saida = '';
    const tempo = setTimeout(() => falhar(new Error('servidor de teste não subiu: ' + saida)), 10000);
    const ler = (b) => { saida += b; if (/na porta/.test(saida)) { clearTimeout(tempo); resolver(); } };
    proc.stdout.on('data', ler); proc.stderr.on('data', ler);
    proc.once('exit', (c) => { clearTimeout(tempo); falhar(new Error(`servidor de teste saiu (${c}): ${saida}`)); });
  });
  return {
    porta, banco, raiz, url: `http://127.0.0.1:${porta}/`,
    parar() { try { proc.kill(); } catch (e) { /* já parou */ } },
  };
}

module.exports = { iniciar, portaLivre, conferirPorta, conferirBanco };

if (require.main === module) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  iniciar({ porta: arg('--porta'), raiz: arg('--raiz'), banco: arg('--banco') }).then((s) => {
    console.log(`Servidor de TESTE em ${s.url} (banco ${s.banco})`);
    console.log(`Jogo em modo de teste: ${s.url}?debug=1   ·   determinístico: ${s.url}?debug=1&congelar=1`);
    process.on('SIGINT', () => { s.parar(); process.exit(0); });
  }, (e) => { console.error('✘ ' + e.message); process.exit(1); });
}
