// Disco do e2e: cada execução grava ~65 MB e o /tmp é um tmpfs dividido com outros projetos; cheio,
// o Chromium cai ("Target crashed"). Aqui: espaço livre, e o plano de poda do `e2e.js --podar`.
//   livre(pasta)                        bytes livres no sistema de arquivos da pasta
//   conferirEspaco(pasta, minimo)       lança erro claro (com o que podar) abaixo do mínimo
//   planoPoda(pasta, op)                [{ caminho, bytes, motivo }] — só o que o e2e e os testes criaram, parado
//     (nada dentro mudou) há mais de op.idadeMs (1 h):
//     e2e-*; temporárias dos testes (TEMPORARIAS: mkdtemp, cópias por worktree <worktree>-<hash>, aceite-*, ver-*,
//     erro-*, empacotar-saida); capturas cap-<conteúdo>/<partes>-h<harness>-n<navegador> (e ref-<base>/… do
//     formato antigo) interrompidas, de harness fora de [op.harness, main, ...op.manter] ou de navegador ≠ op.nav;
//     cap-<conteúdo> substituída por uma mais nova da mesma worktree (.de-<id>), ou sem uso há op.idadeCapturaMs
//     (24 h), salvo as de op.protegidos (conteúdo da base da main e da desta worktree); base-<curto> sem uso há
//     24 h, salvo op.basesProtegidas; ref-* sem uso há 24 h
//   arquivosHarness(ler)                o harness: o que a captura carrega (require('./…') a partir de referencias.js,
//                                       menos a comparação) + ARQS_EXTRAS; ler(f) dá o conteúdo de cada um
//   hashHarness(ler)                    versão do harness: sha256 de arquivosHarness
//   harnessMain()                       o harness como está na main (git show), calculado na hora; null sem main
//   marcarUso(pasta)                    mtime = agora (o e2e chama ao reusar uma captura ou a cópia da base)
//   podar(plano)                        apaga (cada caminho passa por conferirPastaTmp)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { conferirPastaTmp } = require('./guardas');

const MINIMO = 1.5 * 1024 ** 3;
const UMA_HORA = 60 * 60 * 1000, UM_DIA = 24 * UMA_HORA;
const REPO = path.resolve(__dirname, '..', '..', '..');
// o que o e2e.js chama de harness: tudo o que a captura carrega (o cache e o "idêntico por construção" dependem dele).
// referencias-comparar.js (e o referencias-regioes.js dele) só compara: fora. vigia-pai.js entra com `node -r`;
// vagas.js (vagas de Chromium) entra pelo navegador.js, e também aqui caso exista sem require. Extra que não existe: fora.
const ARQS_RAIZ = ['referencias.js'], ARQS_FORA = ['referencias-comparar.js'], ARQS_EXTRAS = ['vigia-pai.js', 'vagas.js'];
function arquivosHarness(ler) {
  const vistos = new Set(), fila = ARQS_RAIZ.concat(ARQS_EXTRAS);
  while (fila.length) {
    const f = fila.shift();
    if (vistos.has(f) || ARQS_FORA.includes(f)) continue;
    let texto;
    try { texto = String(ler(f)); } catch (e) { if (ARQS_EXTRAS.includes(f)) continue; throw e; }
    vistos.add(f);
    for (const m of texto.matchAll(/require\('\.\/([\w.-]+?)(?:\.js)?'\)/g)) fila.push(m[1] + '.js');
  }
  return [...vistos].sort();
}
// pastas temporárias que os testes e ferramentas criam (mkdtemp: sufixo de 6; <pid>; hash): conferidas no grep de quem cria.
// Só nome inteiro casando: travas/, planos/, integrar/, ver/, auditoria/, vercel/, base-*, ref-*, cap-* nunca casam
const MKDTEMP = '[A-Za-z0-9]{6}';
const TEMPORARIAS = new RegExp('^(?:(?:' + [
  'banco', 'banco-mariana', 'sw-nucleo', 'fluxo-int', 'fluxo-intr', 'fluxo-wt', 'fluxo-mat', 'entrada', 'estrelinhas', 'servidor-lento',
  'marcador', 'testar-sinal', 'empacotar-recusa', 'empacotar-ordem', 'indice',
  'validar-docs-[a-z]+', 'validar-uni', 'validar-npc', 'validar-emojis', 'validar-cor', 'trava', 'trava-corrida', 'trava-assumindo',
  'planos', 'vaivem-antiga', 'escolhas-antiga', 'trilhas-antiga', 'guardas-banco-link', 'vozes-pend', 'vigia-fase-dados',
  'e2e-tamanhos', 'e2e-disco-main', 'tela-saida', 'microscopio', 'medalha', 'livro-a', 'livro-acab', 'etapas-missao', 'estados',
  // das frentes de 29/10 (vagas/, a pasta fixa do vagas.js, nunca casa: sem sufixo)
  'vagas', 'verdes', 'fluxo-intv', 'fluxo-limpar', 'fluxo-int-e2e', 'vozes-orfaos',
].join('|') + ')-' + MKDTEMP + '|(?:novo|tipos|tamanho)-\\d+|autocontido-[0-9a-f]{8}' +
  // cópia do jogo por worktree (validadores, musicas, desafio-tipo: <pasta da worktree>-<md5 de 8>)
  '|reino-[a-z0-9-]+-[0-9a-f]{8}|(?:aceite|ver|erro)-[A-Za-z0-9-]+|empacotar-saida)$');
function hashHarness(ler) {
  const h = crypto.createHash('sha256');
  arquivosHarness(ler).forEach((f) => h.update(f + '\0' + ler(f)));
  return h.digest('hex').slice(0, 8);
}
// harness da main (a árvore principal usa essa cache): nunca é podado. Na hora, nunca constante (ficava velha e a
// poda de uma worktree apagava a cache da main); sem main legível: null, e nenhuma referência é podada
function harnessMain() {
  try {
    return hashHarness((f) => execFileSync('git', ['-C', REPO, 'show', `main:jogo/ferramentas/testes/${f}`], { stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch (e) { return null; }
}

function livre(pasta) {
  let d = pasta;
  while (!fs.existsSync(d)) d = path.dirname(d);
  const s = fs.statfsSync(d);
  return s.bavail * s.bsize;
}
const gb = (b) => (b / 1024 ** 3).toFixed(1) + ' GB';

function conferirEspaco(pasta, minimo = MINIMO) {
  const l = livre(pasta);
  if (l >= minimo) return l;
  throw new Error(`pouco espaço em ${pasta}: ${gb(l)} livres (mínimo ${gb(minimo)}); com o disco cheio o Chromium cai.\n` +
    '  Pode: npm run e2e -- --podar   (e2e-* e temporárias de teste com mais de 1 h, referências de harness antigos)\n' +
    `  Ou rode noutra pasta: REINO_TESTES=/dev/shm/reino-testes npm run e2e   (veja também: du -sh ${pasta}/*)`);
}

function tamanho(p) {
  const st = fs.lstatSync(p);
  if (!st.isDirectory()) return st.size;
  return fs.readdirSync(p).reduce((n, f) => n + tamanho(path.join(p, f)), 0);
}

// último uso: o mtime mais novo da pasta e de tudo dentro (outra worktree lendo/gravando a referência a mantém viva)
function ultimoUso(p) {
  const st = fs.lstatSync(p);
  if (!st.isDirectory()) return st.mtimeMs;
  return fs.readdirSync(p).reduce((n, f) => Math.max(n, ultimoUso(path.join(p, f))), st.mtimeMs);
}

// marca o uso de uma referência reusada (só lida não muda mtime): a poda de outra worktree não a apaga no meio
function marcarUso(p) { const t = new Date(); fs.utimesSync(p, t, t); }

const SUB = /-h([0-9a-f]{8})(?:-n([0-9a-f]{8}))?(\.parcial-\d+)?$/;
function planoPoda(pasta, op = {}) {
  const agora = op.agora || Date.now(), idade = op.idadeMs == null ? UMA_HORA : op.idadeMs;
  const idadeCap = op.idadeCapturaMs == null ? UM_DIA : op.idadeCapturaMs;
  const main = harnessMain();
  const manter = new Set([op.harness, main].concat(op.manter || []).filter(Boolean));
  const protegidos = new Set(op.protegidos || []), basesProtegidas = new Set(op.basesProtegidas || []);
  const plano = [], parada = (p, ms) => agora - ultimoUso(p) > ms;
  if (!fs.existsSync(pasta)) return plano;
  const caps = [];
  for (const nome of fs.readdirSync(pasta).sort()) {
    const p = path.join(pasta, nome);
    if (!fs.lstatSync(p).isDirectory()) continue;
    if (/^e2e-/.test(nome)) { if (agora - fs.statSync(p).mtimeMs > idade) plano.push({ caminho: p, motivo: 'e2e com mais de 1 h' }); continue; }
    if (TEMPORARIAS.test(nome)) { if (parada(p, idade)) plano.push({ caminho: p, motivo: 'temporária de teste parada há mais de 1 h' }); continue; }
    const base = /^base-([0-9a-f]+)(\.parcial-\d+)?$/.exec(nome);
    if (base) {
      if (base[2] ? parada(p, idade) : !basesProtegidas.has(base[1]) && agora - fs.statSync(p).mtimeMs > idadeCap) {
        plano.push({ caminho: p, motivo: base[2] ? 'extração interrompida' : 'cópia de base sem uso há 24 h' });
      }
      continue;
    }
    const ref = /^ref-[0-9a-f]+$/.test(nome), cap = /^cap-([0-9a-f]+)$/.exec(nome);
    if (!ref && !cap) continue;
    const antes = plano.length;
    for (const sub of fs.readdirSync(p).sort()) {
      const m = SUB.exec(sub), q = path.join(p, sub);
      if (!m || !fs.lstatSync(q).isDirectory() || !parada(q, idade)) continue; // em uso (ou captura em andamento): nunca sai
      if (m[3]) plano.push({ caminho: q, motivo: 'captura interrompida' });
      else if (main && !manter.has(m[1])) plano.push({ caminho: q, motivo: `harness antigo h${m[1]}` });
      else if (op.nav && m[2] && m[2] !== op.nav) plano.push({ caminho: q, motivo: `navegador antigo n${m[2]}` });
      else if (ref && parada(q, idadeCap)) plano.push({ caminho: q, motivo: 'formato antigo (ref-*) sem uso há 24 h' });
    }
    if (cap && plano.length === antes && !protegidos.has(cap[1])) caps.push({ caminho: p, uso: ultimoUso(p), de: fs.readdirSync(p).filter((f) => /^\.de-/.test(f)) });
  }
  // cap-*: a mais nova de cada worktree fica (vira a base quando o conteúdo dela for aceito); as outras, paradas, saem
  const maisNova = {};
  caps.forEach((c) => c.de.forEach((d) => { if (!maisNova[d] || maisNova[d].uso < c.uso) maisNova[d] = c; }));
  caps.forEach((c) => {
    if (agora - c.uso > idadeCap) plano.push({ caminho: c.caminho, motivo: 'captura sem uso há 24 h' });
    else if (c.de.length && !c.de.some((d) => maisNova[d] === c) && agora - c.uso > idade) plano.push({ caminho: c.caminho, motivo: 'captura substituída por uma mais nova da mesma worktree' });
  });
  plano.forEach((x) => { x.bytes = tamanho(x.caminho); });
  return plano;
}

function podar(plano) {
  plano.forEach((x) => fs.rmSync(conferirPastaTmp(x.caminho), { recursive: true, force: true }));
  return plano.reduce((n, x) => n + x.bytes, 0);
}

module.exports = { livre, conferirEspaco, planoPoda, podar, gb, MINIMO, arquivosHarness, hashHarness, harnessMain, TEMPORARIAS, ultimoUso, marcarUso };
