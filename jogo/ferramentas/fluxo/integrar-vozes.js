// Vozes na integração (integrar.js): falas sem áudio, a fase --vozes (listar-falas → npm run vozes → commit) e o
// conflito nos arquivos gerados das vozes resolvido sozinho (como o index.html). Só escreve na worktree de
// integração. Os arquivos gerados (falas.json, índice, pacotes) só passam pelo código, nunca pela tela.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const C = require('./comum');

const GERADO = 'jogo/ferramentas/gerado';
const FALAS = `${GERADO}/falas.json`;
const INDICE = `${GERADO}/vozes-indice.json`;
const PACOTES = 'jogo/js/voz';
const LISTAR = 'jogo/ferramentas/vozes/listar-falas.js';
const EMPACOTAR = 'jogo/ferramentas/vozes/empacotar-vozes.js';

// arquivo gerado das vozes que o conflito resolve sozinho (os mp3 do cache têm nome por hash: não conflitam)
const ehVoz = (f) => f === FALAS || f === INDICE || new RegExp(`^${PACOTES}/[^/]+\\.js$`).test(f);

// CÓPIA do pendentes(gerado) de vozes/vozes.js (a frente das vozes passou a exportá-lo, com require.main):
// trocar por require('../vozes/vozes').pendentes na integração.
// Áudio = vozes-cache/<voz>/<sha1(voz|velocidade|tom|fala[|efeito])[:16]>.mp3, e o índice tem de apontar para ele.
function pendentesGerado(gerado) {
  const { vozes, falas } = JSON.parse(fs.readFileSync(path.join(gerado, 'falas.json'), 'utf8'));
  const arqIndice = path.join(gerado, 'vozes-indice.json');
  const indice = fs.existsSync(arqIndice) ? JSON.parse(fs.readFileSync(arqIndice, 'utf8')) : {};
  return falas.filter((f) => {
    const v = vozes[f.voz] || {};
    const partes = [v.voz, v.velocidade, v.tom, f.fala].concat(v.efeito ? [v.efeito] : []);
    const h = crypto.createHash('sha1').update(partes.join('|'), 'utf8').digest('hex').slice(0, 16);
    return !fs.existsSync(path.join(gerado, 'vozes-cache', f.voz, h + '.mp3')) || indice[f.chave] !== `${f.voz}/${h}.mp3`;
  });
}
// falas sem áudio da worktree `integ` (sem falas.json: nenhuma)
const pendentes = (integ) => (fs.existsSync(path.join(integ, FALAS)) ? pendentesGerado(path.join(integ, GERADO)) : []);

// roda uma ferramenta de vozes da integração (null se ela não existe nesse repositório)
function ferramenta(integ, rel) {
  return fs.existsSync(path.join(integ, rel)) ? C.rodar(process.execPath, [rel], { cwd: integ }) : null;
}
const fimDe = (r) => (r.erro + '\n' + r.saida).trim().split('\n').slice(-15).join('\n');

// índice (objeto plano de textos) → pares [chave, valor] NA ORDEM do arquivo (o JSON.parse põe chave numérica
// no topo); null se não for um objeto plano de textos
function paresIndice(texto) {
  let obj;
  try { obj = JSON.parse(texto); } catch (e) { return null; }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Object.values(obj).every((v) => typeof v === 'string')) return null;
  const pares = [];
  const re = /"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(texto))) pares.push([JSON.parse(`"${m[1]}"`), JSON.parse(`"${m[2]}"`)]);
  const confere = pares.length === Object.keys(obj).length && pares.every(([k, v]) => obj[k] === v);
  return confere ? pares : null;
}
// como o gerar-vozes.py grava (json.dump indent=1, ensure_ascii): na ordem dada, sem \n no fim
function textoIndice(pares) {
  if (!pares.length) return '{}';
  const asc = (x) => JSON.stringify(x).replace(/[\u0080-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  return '{\n' + pares.map(([k, v]) => ` ${asc(k)}: ${asc(v)}`).join(',\n') + '\n}';
}

// merge de 3 vias do índice: chave mudada (ou apagada) só de um lado = fica a mudança; os DOIS lados mudaram a
// mesma chave para valores diferentes = choque (a pessoa escolhe). Ordem: a nossa, depois as chaves novas da frente.
function juntarIndice(base, a, b) {
  const m0 = new Map(base); const ma = new Map(a); const mb = new Map(b);
  const ordem = [...new Set(a.map(([k]) => k).concat(b.map(([k]) => k)))];
  const pares = []; const choques = [];
  ordem.forEach((k) => {
    const v0 = m0.get(k); const va = ma.get(k); const vb = mb.get(k);
    let v;
    if (va === vb || vb === v0) v = va;
    else if (va === v0) v = vb;
    else { choques.push(k); return; }
    if (v !== undefined) pares.push([k, v]);
  });
  return { pares, choques };
}
// pares na ordem das falas do falas.json (a do gerar-vozes.py); as chaves que sobram, depois, como estavam
function ordenarPorFalas(integ, pares) {
  let chaves = [];
  try { chaves = JSON.parse(fs.readFileSync(path.join(integ, FALAS), 'utf8')).falas.map((f) => f.chave); } catch (e) { return pares; }
  const pos = new Map(); chaves.forEach((k, i) => { if (!pos.has(k)) pos.set(k, i); });
  return pares.map((p, i) => [p, pos.has(p[0]) ? pos.get(p[0]) : chaves.length + i]).sort((x, y) => x[1] - y[1]).map((x) => x[0]);
}

// conflito em falas.json, vozes-indice.json ou js/voz/*.js: junta o índice (3 vias), pega um lado do resto (o da
// frente, se houver) e refaz com listar-falas + empacotar-vozes. Faltou áudio: segue (a fase --vozes grava).
function resolverVozes(integ, conf, log) {
  const lista = conf.filter(ehVoz);
  if (!lista.length) return { ok: true };
  let junto = null;
  if (lista.includes(INDICE)) {
    const lado = (n) => {
      const r = C.rodar('git', ['-C', integ, 'show', `:${n}:${INDICE}`]);
      return r.ok ? paresIndice(r.saida) : [];   // sem esse estágio: não existia (ou foi apagado) nesse lado
    };
    const l0 = lado(1); const la = lado(2); const lb = lado(3);
    if (!l0 || !la || !lb) return { ok: false, conflitos: lista, erro: `${INDICE} ilegível num dos lados: resolva à mão` };
    junto = juntarIndice(l0, la, lb);
    if (junto.choques.length) {
      return { ok: false, conflitos: lista, erro: `${INDICE}: ${junto.choques.length} fala(s) regravada(s) diferente nos dois lados ` +
        `(${junto.choques.slice(0, 5).join(', ')}${junto.choques.length > 5 ? ', …' : ''}): escolha o lado de cada uma e git add` };
    }
  }
  lista.filter((f) => f !== INDICE).forEach((f) => {
    if (!C.gitOk(integ, 'checkout', '--theirs', '--', f) && !C.gitOk(integ, 'checkout', '--ours', '--', f)) C.gitOk(integ, 'rm', '-q', '--', f);
  });
  const l = ferramenta(integ, LISTAR);
  if (l && !l.ok) return { ok: false, conflitos: lista, erro: `listar-falas falhou ao resolver o conflito das vozes:\n${fimDe(l)}` };
  if (junto) fs.writeFileSync(path.join(integ, INDICE), textoIndice(ordenarPorFalas(integ, junto.pares)));
  const e = ferramenta(integ, EMPACOTAR);
  C.git(integ, 'add', '-A', '--', PACOTES, FALAS, INDICE);
  log(`  • conflito nas vozes (${lista.length} arquivo(s)): índice juntado + listar-falas + empacotar-vozes (resolvido sozinho)`);
  if (e && !e.ok) log('  ⚠ empacotar-vozes: faltou áudio; a fase --vozes grava e empacota de novo');
  return { ok: true };
}

// commit só dos arquivos das vozes (pacotes, falas.json, índice e cache); null se nada mudou
function commitVozes(integ, titulo, mensagem) {
  C.git(integ, 'add', '-A', '--', PACOTES, GERADO);
  if (C.gitOk(integ, 'diff', '--cached', '--quiet')) return null;
  C.git(integ, 'commit', '-q', '--no-verify', '-m', mensagem(titulo));
  return C.git(integ, 'rev-parse', '--short', 'HEAD');
}

// fase de vozes, antes do npm test: listar-falas; com `gravar` (--vozes) e fala sem áudio, npm run vozes
// (grava, empacota e confere por transcrição) e o commit. Falhou (ex.: conferência reprovou) = { parar: true }.
async function faseVozes(integ, op) {
  const { log, nome } = op;
  if (!fs.existsSync(path.join(integ, LISTAR))) return { parar: false, pendentes: 0 };
  const l = ferramenta(integ, LISTAR);
  if (!l.ok) { log(`✘ listar-falas falhou (sem conta das falas sem áudio):\n${fimDe(l)}`); return { parar: false, pendentes: 0 }; }
  log('✔ listar-falas');
  let pend = pendentes(integ);
  if (pend.length && op.gravar) {
    const arq = path.join(op.dirRel, 'vozes.txt');
    log(`… npm run vozes (${pend.length} fala(s) sem áudio)`);
    if (!(await C.rodarTee('npm', ['run', 'vozes'], integ, arq, op.quieto))) {
      const linhas = fs.readFileSync(arq, 'utf8').split('\n').filter((x) => /✘|reprov|diverg|não bate/i.test(x)).slice(-20);
      log(`✘ npm run vozes falhou (saída em ${arq}):`);
      linhas.forEach((x) => log('  ' + x.trim()));
      log(`Confira (skill validar-vozes): regrave em ${integ} o que precisar, ou aceite como está, e rode:`);
      log(`  node jogo/ferramentas/fluxo/integrar.js --continuar --nome ${nome}`);
      return { parar: true };
    }
    log(`✔ npm run vozes (saída em ${arq})`);
    pend = pendentes(integ);
  }
  if (op.gravar && op.commit) {
    const c = commitVozes(integ, `vozes das falas novas (integração ${nome})`, op.mensagem);
    if (c) log(`  • commit ${c}: vozes das falas novas`);
  } else if (!op.gravar && !C.gitOk(integ, 'diff', '--quiet', '--', FALAS)) log(`⚠ ${FALAS} mudou com o listar-falas: rode com --vozes (grava e faz o commit)`);
  log(pend.length ? `⚠ ${pend.length} fala(s) sem áudio` + (op.gravar ? '' : ': rode com --vozes (o --merge recusa)') : '✔ nenhuma fala sem áudio');
  return { parar: false, pendentes: pend.length };
}

module.exports = { FALAS, INDICE, ehVoz, pendentes, paresIndice, textoIndice, juntarIndice, resolverVozes, commitVozes, faseVozes };
