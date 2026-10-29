// Vagas de Chromium entre worktrees: todo navegador de teste (navegador.js, lancar) pega uma vaga antes de abrir e
// devolve ao fechar. Sem isso, N worktrees testando ao mesmo tempo somavam N×12 Chromiums e as fotos falhavam.
// Vagas: /tmp/reino-testes/vagas/<n>.json SEMPRE (a mesma para todas as worktrees, mesmo com REINO_TESTES em
// /dev/shm), n de 0 a REINO_VAGAS_CHROMIUM - 1 (padrão: metade das CPUs, até 16), com { pid, inicio, nome, desde,
// chave }. A vaga nasce completa por link atômico (como trava.js). Dono morto (PID que não existe mais, zumbi, ou PID
// reusado: outro `inicio` em /proc) = vaga livre: quem a assume segura antes <n>.json.assumindo (o mesmo link), um
// por vez. Devolve: browser fechado ou caído ('disconnected'), saída do processo; processo morto sem devolver deixa a
// vaga para o próximo.
// Espera: tenta de novo a cada ~0,3 s e avisa quem ocupa (de novo a cada 30 s, com quanto já esperou). Processo sem
// vaga nenhuma há REINO_VAGAS_ESPERA_MS (padrão 60 s) pode usar a reserva: REINO_VAGAS_EXTRA vagas (padrão 4,
// extra-<n>.json, o mesmo link), para um teste da unidade (2 min) não ficar parado atrás de dois e2e. Reserva
// esgotada: continua esperando, até op.prazoMs (sem prazo: sem fim), quando lança "✘ sem vaga de Chromium há N s
// (quem ocupa)" e não abre navegador nenhum. Derrubado (SIGTERM, SIGINT, SIGHUP) esperando: apaga os .tmp-* e, sem
// vaga nenhuma, diz que esperava vaga.
// Risco aceito: quebrar o `.assumindo` de um morto tem uma corrida rara (dois processos conferem o mesmo morto e o
// segundo apaga o `.assumindo` novo de um terceiro) que dá a mesma vaga a dois: no pior caso, +1 Chromium por um
// tempo; nenhuma vaga se perde.
// Em código: const v = await pegar('npm run e2e: fotos', { desistir: () => acabou, prazoMs });  ...  v.soltar();
//   (null: `desistir()` deu verdadeiro durante a espera; op.pasta, op.total, op.extra, op.esperarMs, op.avisoMs e
//   op.intervaloMs para os testes)
const fs = require('fs');
const os = require('os');
const path = require('path');

const PASTA = '/tmp/reino-testes/vagas';
const numero = (v, padrao) => (Number(v) > 0 ? Math.floor(Number(v)) : padrao);
const TOTAL = numero(process.env.REINO_VAGAS_CHROMIUM, Math.max(1, Math.min(16, Math.floor(os.cpus().length / 2))));
const EXTRA = process.env.REINO_VAGAS_EXTRA === '0' ? 0 : numero(process.env.REINO_VAGAS_EXTRA, 4);
const ESPERA_MS = numero(process.env.REINO_VAGAS_ESPERA_MS, 60000);
const AVISO_MS = 30000;
const RAIZ = path.basename(path.resolve(__dirname, '..', '..', '..'));

// estado (Z = zumbi) e início do processo em /proc (tiques desde o boot: distingue um PID reusado); sem Linux, null
function statDe(pid) {
  try { const c = fs.readFileSync(`/proc/${pid}/stat`, 'utf8'); const x = c.slice(c.lastIndexOf(')') + 2).split(' '); return { estado: x[0], inicio: x[19] }; } catch (e) { return null; }
}
const INICIO = (statDe(process.pid) || {}).inicio || null;
function vivo(d) {
  if (!d || !Number.isInteger(d.pid)) return false;
  try { process.kill(d.pid, 0); } catch (e) { if (e.code !== 'EPERM') return false; }
  const st = statDe(d.pid);
  if (st && (st.estado === 'Z' || st.estado === 'X')) return false;   // zumbi: já morreu, só falta o pai recolher
  return !d.inicio || !st || st.inicio === d.inicio;
}
function ler(arq) {
  try { return JSON.parse(fs.readFileSync(arq, 'utf8')); } catch (e) { return null; }
}
function criar(de, para) {
  try { fs.linkSync(de, para); return true; } catch (e) { if (e.code !== 'EEXIST') throw e; return false; }
}
const sair = (arq) => { try { fs.unlinkSync(arq); } catch (e) { /* já saiu */ } };

// vaga de dono morto: só com o `.assumindo` na mão. Com ele, ninguém mais apaga a vaga (o dono morto não devolve),
// então a conferência e o unlink não têm vão (a exceção é o risco aceito do cabeçalho: quebrar o `.assumindo` de
// um morto); quem cria uma vaga livre no meio ganha, e aqui o link dá EEXIST.
// Vaga ilegível (sumiu, ou outro acabou de criá-la) nunca é apagada: só se tenta criar (EEXIST = é de outro).
// `.assumindo` de dono morto (morreu no meio) sai do caminho para a próxima volta; ilegível ou por tempo, nunca.
function assumir(arq, tmp, chave) {
  const a = arq + '.assumindo';
  if (!criar(tmp, a)) {
    const o = ler(a);
    if (o && !vivo(o)) sair(a);
    return false;
  }
  try {
    const d = ler(arq);
    if (!d) return criar(tmp, arq);
    if (vivo(d)) return false;
    sair(arq);
    return criar(tmp, arq);
  } finally { const o = ler(a); if (o && o.chave === chave) sair(a); }
}

// uma volta pelas vagas (<prefixo><n>.json): o arquivo da que pegou, ou a lista de quem ocupa
function tentar(pasta, prefixo, total, tmp, chave) {
  const donos = [];
  for (let n = 0; n < total; n++) {
    const arq = path.join(pasta, prefixo + n + '.json');
    if (criar(tmp, arq)) return arq;
    const d = ler(arq);
    if (d && vivo(d)) { donos.push(d); continue; }
    if (assumir(arq, tmp, chave)) return arq;
    donos.push({ rotulo: d ? 'sendo assumida' : 'ilegível' });
  }
  return donos;
}

const minhas = new Map(); // arquivo -> chave (das vagas deste processo)
const pendentes = new Set(); // .tmp-<chave> das esperas em curso (o process.exit pula o finally)
let seq = 0, registrado = false, ultimoAviso = '', esperando = 0, ultimoQuem = '';
// o mesmo aviso uma vez por processo (as abas do e2e esperam juntas)
const avisar = (t) => { if (t !== ultimoAviso) console.log(ultimoAviso = t); };
// SIGTERM (tempo do teste estourado, processo.js), SIGINT (Ctrl+C) ou SIGHUP (terminal fechado) com alguém
// esperando: sai pelo process.exit, que apaga os .tmp-* (soltarTodas); sem vaga nenhuma, a causa é a espera
const SINAIS = { SIGTERM: 143, SIGINT: 130, SIGHUP: 129 };   // os códigos do processo.js
function derrubado(sinal) {
  if (!minhas.size) console.log(`✘ derrubado enquanto esperava vaga de Chromium (${ultimoQuem}); veja vagas.js`);
  process.exit(SINAIS[sinal] || 143);
}
function soltarTodas() {
  for (const [arq, chave] of minhas) { const d = ler(arq); if (d && d.chave === chave) sair(arq); }
  minhas.clear();
  pendentes.forEach(sair);
}

const hora = (iso) => { const d = new Date(iso); return isNaN(d) ? '?' : d.toTimeString().slice(0, 8); };
function quem(donos) {
  const g = {};
  donos.forEach((d) => {
    const k = d.rotulo || `de PID ${d.pid} "${d.nome}"`;
    g[k] = g[k] || { n: 0, desde: d.rotulo ? '' : ` desde ${hora(d.desde)}` }; g[k].n++;
  });
  return Object.keys(g).map((k) => `${g[k].n} ${k}${g[k].desde}`).join('; ');
}

async function pegar(nome, op = {}) {
  const pasta = op.pasta || PASTA, total = op.total || TOTAL, extra = op.extra !== undefined ? op.extra : EXTRA;
  const esperarMs = op.esperarMs !== undefined ? op.esperarMs : ESPERA_MS, avisoMs = op.avisoMs || AVISO_MS;
  fs.mkdirSync(pasta, { recursive: true });
  if (!registrado) { registrado = true; process.once('exit', soltarTodas); }
  const chave = `${process.pid}-${++seq}-${Math.random().toString(36).slice(2, 8)}`;
  const tmp = path.join(pasta, `.tmp-${chave}`);
  pendentes.add(tmp);
  fs.writeFileSync(tmp, JSON.stringify({ pid: process.pid, inicio: INICIO, nome: `${nome} (${RAIZ})`, desde: new Date().toISOString(), chave }));
  const inicio = Date.now();
  let proxAviso = 0, arq = null, aguardou = false;
  try {
    for (;;) {
      let r = tentar(pasta, '', total, tmp, chave);
      // sem vaga nenhuma há esperarMs: a reserva (quem já tem vaga anda com as que tem)
      if (typeof r !== 'string' && extra && !minhas.size && Date.now() - inicio >= esperarMs) {
        const x = tentar(pasta, 'extra-', extra, tmp, chave);
        r = typeof x === 'string' ? x : r.concat(x);
      }
      if (typeof r === 'string') {
        arq = r;
        if (path.basename(arq).startsWith('extra-')) avisar(`⚠ Chromium sem vaga há ${Math.round((Date.now() - inicio) / 1000)} s: uso a reserva (${path.basename(arq)})`);
        break;
      }
      if (op.desistir && op.desistir()) return null;
      ultimoQuem = quem(r);
      const s = Math.round((Date.now() - inicio) / 1000);
      if (op.prazoMs !== undefined && Date.now() - inicio >= op.prazoMs) throw new Error(`✘ sem vaga de Chromium há ${s} s (${ultimoQuem})`);
      if (Date.now() >= proxAviso) {
        avisar(`⏳ Chromium: ${total > 1 ? `as ${total} vagas estão ocupadas` : 'a vaga está ocupada'}` +
          (Date.now() - inicio >= esperarMs && extra && !minhas.size ? ` e a reserva (${extra}) também` : '') + ` (${ultimoQuem}); ` +
          (s ? `esperando vaga há ${s} s` : 'espero'));
        proxAviso = Date.now() + avisoMs;
      }
      if (!aguardou) { aguardou = true; if (!esperando++) Object.keys(SINAIS).forEach((x) => process.on(x, derrubado)); }
      await new Promise((ok) => setTimeout(ok, op.intervaloMs || 200 + Math.random() * 200));
    }
  } finally {
    sair(tmp);
    pendentes.delete(tmp);
    if (aguardou && !--esperando) Object.keys(SINAIS).forEach((x) => process.removeListener(x, derrubado));
  }
  minhas.set(arq, chave);
  let solta = false;
  return {
    arquivo: arq,
    soltar() {
      if (solta) return;
      solta = true;
      const d = ler(arq);
      if (d && d.chave === chave) sair(arq);
      minhas.delete(arq);
    },
  };
}

module.exports = { pegar, vivo, TOTAL, EXTRA, PASTA };
