// Guarda-corpos de TODAS as ferramentas de teste: nada chega no progresso de verdade da Mariana.
// O progresso real vive no servidor de casa (porta 80: reinodosunicornios.local, localhost,
// 127.0.0.1 e o IP do PC na rede, banco em servidor/dados/) e no localStorage dos aparelhos.
// Estas funções só conferem e lançam erro; quem abre navegador, sobe servidor ou apaga pasta chama antes.
//   conferirUrl(url)      só http://127.0.0.1:<porta de teste>/… (ou file://); o resto é recusado
//   conferirPorta(porta)  porta de teste: inteira, 1024–65535 (nunca a 80)
//   conferirBanco(arq)    banco de teste: sempre em /tmp, nunca em servidor/dados
//   conferirPastaTmp(p)   pasta que uma ferramenta pode criar/limpar: só dentro de /tmp/reino-testes/ (ou REINO_TESTES)
// Teste: node --test jogo/ferramentas/testes/unidade/guardas.test.js
const fs = require('fs');
const path = require('path');

// REINO_TESTES troca a pasta (ex.: /dev/shm/reino-testes, quando o /tmp está cheio): só dentro de /tmp ou /dev/shm
const PASTA_TESTES = pastaTestes(process.env.REINO_TESTES);
function pastaTestes(pedida) {
  if (!pedida) return '/tmp/reino-testes';
  const abs = path.resolve(pedida);
  if (!/^\/(tmp|dev\/shm)\/[^/]/.test(abs) || abs.includes('..') || /servidor[\\/]+dados/.test(abs)) {
    throw new Error(`proibido: REINO_TESTES fora de /tmp e /dev/shm (recebido: ${abs})`);
  }
  return abs.replace(/\/+$/, '');
}

// IPv4 da rede local / privados (a "rede" onde o PC é achado pelo IP)
function ipDaRede(host) {
  const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(host);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254);
}

function conferirPorta(porta) {
  const n = Number(porta);
  if (!Number.isInteger(n) || n < 1024 || n > 65535) throw new Error(`proibido: porta ${porta} (use uma porta de teste livre acima de 1024, nunca a 80)`);
  return n;
}

function conferirUrl(url) {
  let u;
  try { u = new URL(String(url)); } catch (e) { throw new Error(`proibido: endereço inválido (${url})`); }
  if (u.protocol === 'file:') return u;
  if (u.protocol !== 'http:') throw new Error(`proibido: protocolo ${u.protocol} (só http://127.0.0.1:<porta de teste>)`);
  const host = u.hostname.toLowerCase();
  if (/reinodosunicornios/.test(host)) throw new Error('proibido: reinodosunicornios.local é o servidor de casa (progresso real)');
  if (host === 'localhost' || host.endsWith('.localhost')) throw new Error('proibido: localhost é o servidor de casa na porta 80; use http://127.0.0.1:<porta de teste>');
  if (ipDaRede(host)) throw new Error(`proibido: ${host} é um IP da rede (o PC da casa); use 127.0.0.1 com porta de teste`);
  if (host !== '127.0.0.1') throw new Error(`proibido: só 127.0.0.1 com porta de teste (recebido ${host})`);
  if (!u.port) throw new Error('proibido: 127.0.0.1 sem porta é a porta 80 (servidor de casa); use a porta do servidor de teste');
  conferirPorta(u.port);
  return u;
}

// symlink em /tmp apontando para servidor/dados também é recusado: resolve a pasta e, se o próprio arquivo for link
// (mesmo pendente, ou link de link), segue cada salto; cada caminho passa por `conferir` ANTES de olhar o disco nele
function caminhoReal(abs, conferir) {
  let p = abs;
  for (let saltos = 0; saltos < 40; saltos++) {
    let d = path.dirname(p);
    while (!fs.existsSync(d)) d = path.dirname(d);
    p = path.join(fs.realpathSync(d), path.relative(d, p));
    conferir(p);
    let st;
    try { st = fs.lstatSync(p); } catch (e) { return p; }
    if (!st.isSymbolicLink()) return p;
    p = path.resolve(path.dirname(p), fs.readlinkSync(p));
    conferir(p);
  }
  throw new Error(`proibido: o banco de teste é um link com saltos demais (${abs})`);
}
function conferirBanco(banco) {
  if (!banco || typeof banco !== 'string') throw new Error('proibido: banco de teste sem caminho');
  const abs = path.resolve(banco);
  // 1º o TEXTO do caminho (sem olhar o disco: nem um stat em servidor/dados); depois o caminho real (links)
  const dados = /servidor[\\/]+dados([\\/]|$)/;
  if (dados.test(banco) || dados.test(abs)) throw new Error('proibido: o banco de teste nunca pode ficar em servidor/dados');
  const conferir = (p) => {
    if (dados.test(p)) throw new Error('proibido: o banco de teste nunca pode ficar em servidor/dados');
    if (!p.startsWith('/tmp/')) throw new Error(`proibido: o banco de teste fica sempre em /tmp (recebido: ${p})`);
  };
  conferir(abs);
  caminhoReal(abs, conferir);
  return abs;
}

// pasta de trabalho das ferramentas (cópias da base, caches de referência): só /tmp/reino-testes/<algo>
function conferirPastaTmp(pasta) {
  if (!pasta || typeof pasta !== 'string') throw new Error('proibido: pasta sem caminho');
  const abs = path.resolve(pasta);
  if (abs.includes('..') || !abs.startsWith(PASTA_TESTES + '/') || abs === PASTA_TESTES + '/') throw new Error(`proibido: pasta de trabalho fora de ${PASTA_TESTES}/ (recebido: ${abs})`);
  if (fs.existsSync(abs) && !fs.realpathSync(abs).startsWith(PASTA_TESTES + '/')) throw new Error(`proibido: ${abs} aponta para fora de ${PASTA_TESTES}/`);
  return abs;
}

module.exports = { PASTA_TESTES, pastaTestes, conferirUrl, conferirPorta, conferirBanco, conferirPastaTmp, ipDaRede };
