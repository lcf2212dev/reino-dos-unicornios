// Servidor de TESTE do jogo: sobe o mesmo servidor/servidor.js numa porta livre (nunca a 80)
// com um banco novo em /tmp. O servidor de casa (porta 80, banco em servidor/dados/) nunca é tocado.
// Uso: node jogo/ferramentas/testes/servidor-teste.js [--porta 8800] [--raiz <pasta jogo>] [--banco /tmp/…/x.db] [--fundo]
//   sem --fundo: fica rodando e mostra o endereço; Ctrl+C (ou kill <pid>) para parar
//   --fundo: o servidor fica rodando sozinho (grupo de processos próprio, log em /tmp/reino-testes/),
//            este comando sai com 0 e mostra o PID para `kill <pid>` (o jeito certo em tarefa de segundo plano)
// Em código: const { iniciar } = require('./servidor-teste'); const s = await iniciar(); … s.parar();
// Espera o servidor dizer "na porta" por até 10 s (REINO_SERVIDOR_SUBIR_MS muda; os testes usam menos).
// O servidor filho morre junto com o pai (vigia-pai.js, canal IPC): nenhum servidor órfão fica
// para trás se o pai cair, mesmo com kill -9.
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { PASTA_TESTES, conferirPorta, conferirBanco } = require('./guardas');

const RAIZ_PADRAO = path.join(__dirname, '..', '..');
const VIGIA = path.join(__dirname, 'vigia-pai.js');
const subirMs = () => Number(process.env.REINO_SERVIDOR_SUBIR_MS) || 10000;

function portaLivre(de) {
  return new Promise((resolver, falhar) => {
    const tentar = (p) => {
      if (p > 65000) return falhar(new Error('nenhuma porta livre'));
      const s = net.createServer();
      s.once('error', () => tentar(p + 1));
      s.listen(p, '127.0.0.1', () => s.close(() => resolver(p)));
    };
    tentar(conferirPorta(de));
  });
}

// IPv4 da rede (não internos): para o pai abrir o jogo de TESTE à mão no celular/tablet. O Playwright fica no 127.0.0.1.
function enderecosRede(interfaces = os.networkInterfaces()) {
  const ips = [];
  Object.values(interfaces || {}).forEach((lista) => (lista || []).forEach((i) => {
    if ((i.family === 'IPv4' || i.family === 4) && !i.internal && ips.indexOf(i.address) < 0) ips.push(i.address);
  }));
  return ips;
}

// duas subidas ao mesmo tempo podem escolher a mesma porta: tenta outra (só quando a porta não foi pedida)
async function iniciar(op = {}) {
  for (let i = 0; ; i++) {
    try { return await subir(op); } catch (e) { if (op.porta || i >= 5 || !/EADDRINUSE/.test(e.message)) throw e; }
  }
}
async function subir(op) {
  const raiz = path.resolve(op.raiz || RAIZ_PADRAO);
  const servidorJs = path.join(raiz, 'servidor', 'servidor.js');
  if (!fs.existsSync(servidorJs)) throw new Error(`não achei ${servidorJs} (--raiz deve ser a pasta jogo/)`);
  const porta = conferirPorta(op.porta || await portaLivre(8800 + Math.floor(Math.random() * 900)));
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const banco = conferirBanco(op.banco || fs.mkdtempSync(path.join(PASTA_TESTES, 'banco-')) + '/reino-teste.db');
  // PORTA e BANCO sempre explícitos: o padrão do servidor.js é a porta 80 e o banco de casa
  const env = Object.assign({}, process.env, { PORTA: String(porta), BANCO: banco, RAIZ: raiz });
  let proc, log = null;
  if (op.fundo) {
    log = path.join(PASTA_TESTES, `servidor-${porta}.log`);
    const fd = fs.openSync(log, 'w');
    proc = spawn(process.execPath, [servidorJs], { env, stdio: ['ignore', fd, fd], detached: true });
    fs.closeSync(fd);
  } else {
    proc = spawn(process.execPath, ['-r', VIGIA, servidorJs], { env, stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
  }
  const subiu = new Promise((resolver, falhar) => {
    let saida = '';
    const tempo = setTimeout(() => falhar(new Error('servidor de teste não subiu: ' + saida)), subirMs());
    const ler = (b) => { saida += b; if (/na porta/.test(saida)) { clearTimeout(tempo); resolver(); } };
    proc.once('exit', (c) => { clearTimeout(tempo); falhar(new Error(`servidor de teste saiu (${c}): ${saida}`)); });
    if (!op.fundo) { proc.stdout.on('data', ler); proc.stderr.on('data', ler); return; }
    const olhar = setInterval(() => { try { ler(fs.readFileSync(log, 'utf8').slice(saida.length)); } catch (e) { /* ainda sem log */ } if (/na porta/.test(saida)) clearInterval(olhar); }, 100);
    proc.once('exit', () => clearInterval(olhar));
  });
  // não subiu a tempo (ou caiu): o processo não pode ficar para trás (com --fundo, o grupo inteiro; órfão para sempre)
  try { await subiu; } catch (e) {
    // só com o filho ainda vivo: o PID de um filho já recolhido pode ser de outro processo (ou grupo)
    const vivo = proc.exitCode === null && proc.signalCode === null;
    if (vivo) try { if (op.fundo) process.kill(-proc.pid, 'SIGKILL'); else proc.kill('SIGKILL'); } catch (e2) { /* já saiu */ }
    throw e;
  }
  proc.removeAllListeners('exit');
  if (op.fundo) proc.unref();
  return {
    porta, banco, raiz, log, pid: proc.pid, proc, url: `http://127.0.0.1:${porta}/`,
    urlsRede: enderecosRede().map((ip) => `http://${ip}:${porta}/`),
    parar() { try { proc.kill(); } catch (e) { /* já parou */ } },
  };
}

module.exports = { iniciar, portaLivre, enderecosRede, conferirPorta, conferirBanco };

if (require.main === module) {
  require('../ajuda').conferirOpcoes(process.argv.slice(2), { valores: ['--porta', '--raiz', '--banco'], booleanas: ['--fundo'] });
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  const fundo = process.argv.includes('--fundo');
  iniciar({ porta: arg('--porta'), raiz: arg('--raiz'), banco: arg('--banco'), fundo }).then((s) => {
    console.log(`Servidor de TESTE em ${s.url} (banco ${s.banco})`);
    s.urlsRede.forEach((u) => console.log(`No celular/tablet da mesma rede: ${u} (servidor de TESTE)`));
    console.log(`Jogo em modo de teste: ${s.url}?debug=1   ·   determinístico: ${s.url}?debug=1&congelar=1`);
    if (fundo) {
      console.log(`Rodando sozinho: PID ${s.pid} (log em ${s.log}). Para parar: kill ${s.pid}`);
      process.exit(0);
    }
    console.log(`PID ${process.pid} (servidor ${s.pid}). Para parar: Ctrl+C ou kill ${process.pid}`);
    // o servidor caiu sozinho: avisa e sai com erro (antes o comando ficava parado sem servidor)
    s.proc.once('exit', (c, sinal) => { console.error(`✘ o servidor de teste parou (${sinal || 'código ' + c})`); process.exit(1); });
    // parado de fora (Ctrl+C, kill, fim da tarefa de segundo plano): diz por quê e leva o servidor junto
    const CODIGOS = { SIGINT: 130, SIGTERM: 143, SIGHUP: 129 };
    Object.keys(CODIGOS).forEach((sinal) => process.on(sinal, () => {
      console.log(`Recebi ${sinal}: servidor de teste parado.`);
      s.proc.removeAllListeners('exit');
      s.parar();
      process.exit(CODIGOS[sinal]);
    }));
  }, (e) => { console.error('✘ ' + e.message); process.exit(1); });
}
