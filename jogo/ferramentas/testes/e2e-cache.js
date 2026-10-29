// Cache de capturas do e2e, por conteúdo: <pasta>/cap-<conteúdo>/<partes>[-<tamanhos>]-h<harness>-n<navegador>/
// (conteúdo = e2e-base.js conteudoCommit/conteudoArvore). Serve tanto à base quanto ao atual: o atual capturado
// hoje (idêntico ou não) vira a base pronta quando aquele conteúdo for aceito.
//   pastaCaptura(pasta, conteudo, sub)    caminho da captura (pronta = tem erros.txt)
//   obterCaptura(destino, capturarFn, op) reusa a pronta ou captura uma vez com a trava da chave; op.guardar() falso no
//                                          fim (a chave mudou): vai para op.semGuardar em vez do cache ({ guardada: false })
//                                          (<destino>.trava, link atômico como o trava.js: outra worktree que
//                                          pede a mesma chave espera e reusa); devolve { destino, reusada }
//   ligarArvore(de, para)                 cópia por hard link (sem gastar disco; cai para cópia comum)
//   marcarOrigem(pastaCap, repo)          .de-<worktree>: de quem é a captura (a poda guarda a mais nova de cada uma)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { conferirPastaTmp } = require('./guardas');
const { marcarUso } = require('./e2e-disco');

const BATIDA_MS = 20000, SEM_BATIDA_MS = 120000;

const pastaCaptura = (pasta, conteudo, sub) => conferirPastaTmp(path.join(pasta, `cap-${conteudo}`, sub));
const pronta = (p) => fs.existsSync(path.join(p, 'erros.txt'));
const vivo = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
const ler = (arq) => { try { return JSON.parse(fs.readFileSync(arq, 'utf8')); } catch (e) { return null; } };

// trava de uma chave: nasce completa (temporário + link atômico); dono morto ou sem batida há 2 min sai do
// caminho por rename para um nome só nosso, conferindo o inode (dois assumindo juntos: só um tira a trava certa)
function pegarTrava(arq) {
  const tmp = `${arq}.${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify({ pid: process.pid, desde: new Date().toISOString() }));
  try {
    for (let volta = 0; volta < 2; volta++) {
      try { fs.linkSync(tmp, arq); return true; } catch (e) { if (e.code !== 'EEXIST') throw e; }
      let st; try { st = fs.statSync(arq); } catch (e) { continue; }
      const dono = ler(arq);
      const parada = Date.now() - st.mtimeMs > SEM_BATIDA_MS;
      if (dono ? vivo(dono.pid) && !parada : Date.now() - st.mtimeMs < 2000) return dono || { pid: '?' };
      const fora = `${arq}.morta.${process.pid}`;
      try { fs.renameSync(arq, fora); } catch (e) { continue; }
      if (fs.statSync(fora).ino !== st.ino) { try { fs.linkSync(fora, arq); } catch (e) { /* outro já criou */ } }
      fs.unlinkSync(fora);
    }
    return { pid: '?' };
  } finally { try { fs.unlinkSync(tmp); } catch (e) { /* já saiu */ } }
}
function soltarTrava(arq) {
  const d = ler(arq);
  if (d && d.pid === process.pid) try { fs.unlinkSync(arq); } catch (e) { /* já saiu */ }
}

async function obterCaptura(destino, capturarFn, op = {}) {
  const espera = op.esperaMs || 1000, arq = destino + '.trava';
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  let avisou = false;
  for (;;) {
    if (pronta(destino)) { marcarUso(destino); return { destino, reusada: true, guardada: true }; }
    const dono = pegarTrava(arq);
    if (dono === true) break;
    if (!avisou) { console.log(`⏳ outra execução (PID ${dono.pid}) está capturando ${destino}: espero e reuso`); avisou = true; }
    await new Promise((r) => setTimeout(r, espera));
  }
  const batida = setInterval(() => { try { const t = new Date(); fs.utimesSync(arq, t, t); } catch (e) { /* saiu */ } }, BATIDA_MS);
  const largar = () => soltarTrava(arq);
  process.once('exit', largar);
  try {
    if (pronta(destino)) { marcarUso(destino); return { destino, reusada: true, guardada: true }; } // terminou enquanto eu pegava
    const parcial = conferirPastaTmp(`${destino}.parcial-${process.pid}`);
    fs.rmSync(parcial, { recursive: true, force: true });
    await capturarFn(parcial);
    if (!pronta(parcial)) throw new Error(`captura sem erros.txt: ${parcial}`);
    if (op.guardar && !op.guardar()) {
      fs.mkdirSync(path.dirname(op.semGuardar), { recursive: true });
      fs.renameSync(parcial, op.semGuardar);
      return { destino: op.semGuardar, reusada: false, guardada: false };
    }
    fs.renameSync(parcial, destino);
    return { destino, reusada: false, guardada: true };
  } finally { clearInterval(batida); process.removeListener('exit', largar); largar(); }
}

function ligarArvore(de, para) {
  fs.mkdirSync(para, { recursive: true });
  for (const f of fs.readdirSync(de, { withFileTypes: true })) {
    const a = path.join(de, f.name), b = path.join(para, f.name);
    if (f.isDirectory()) ligarArvore(a, b);
    else try { fs.linkSync(a, b); } catch (e) { if (e.code !== 'EXDEV' && e.code !== 'EPERM') throw e; fs.copyFileSync(a, b); }
  }
}

function marcarOrigem(pastaCap, repo) {
  const id = crypto.createHash('sha1').update(path.resolve(repo)).digest('hex').slice(0, 8);
  fs.writeFileSync(path.join(pastaCap, `.de-${id}`), path.resolve(repo) + '\n');
}

module.exports = { pastaCaptura, pronta, obterCaptura, ligarArvore, marcarOrigem, pegarTrava, soltarTrava, SEM_BATIDA_MS };
