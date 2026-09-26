// Confere as referências da documentação: todo caminho, símbolo e comando citado existe.
// Uso (da raiz do repositório): node jogo/ferramentas/validar/validar-docs.js [--raiz <pasta do repositório>] [--detalhes]
//   (também roda em npm run validar e npm test, por validar/validar-tudo.js)
// Arquivos conferidos: docs/**/*.md, todo CLAUDE.md (raiz e pastas) e .claude/skills/**/SKILL.md.
// O que conta como referência (só texto entre crases, `assim`, e links [texto](caminho) do Markdown):
//   comando   `npm run <script>` / `npm test` → o script existe no package.json;
//             `node <arquivo>` / `python3 <arquivo>` / `uv run … python <arquivo>` → o arquivo existe.
//             Nos blocos ``` só os comandos são conferidos (um por linha).
//   símbolo   `Reino.X.y`, `Mapa.x`, `Jogador.x`, `PA.x`, `UI.x`, `window.__reino`, `__reino.x()`, `__congelar.x`
//             → cada nome depois do primeiro ponto aparece como identificador em jogo/js (fora de js/voz).
//   caminho   texto com "/" ou com extensão conhecida (.js .md .css .html .json .py .txt…) → existe no disco:
//             da raiz, de jogo/, jogo/js/, jogo/ferramentas/, da pasta do .md, de docs/ e subpastas; nome solto
//             (`falas.js`) ou pedaço final (`petshop/fora.js`) vale se algum arquivo ou pasta terminar assim.
// Ignorados: `/tmp/…`; texto com marcador de modelo (<…>, *, {…}, …, $); qualquer coisa em servidor/dados (nem
//   olhamos o disco lá: é o banco da Mariana); blocos entre <!-- validar-docs: ignorar --> e
//   <!-- validar-docs: fim --> (histórico ou exemplo); arquivo com <!-- validar-docs: ignorar-arquivo -->;
//   e os trechos históricos da lista HISTORICOS abaixo.
// Arquivos da lista EM_CONSTRUCAO que ainda não existem viram aviso (outro construtor os entrega), não erro.
// Sai com código 1 e lista cada referência quebrada como arquivo:linha.
const fs = require('fs');
const path = require('path');

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
const RAIZ = path.resolve(arg('--raiz') || path.join(__dirname, '..', '..', '..'));
const DETALHES = process.argv.includes('--detalhes');

// trechos históricos (caminhos de antes da refatoração): arquivo inteiro (secao: null) ou a seção cujo título casa
// (rastreio.md: regras antigas → novas; refatoracao-plano.md: o plano com a tabela "antigo → novo";
// contratos-consolidados.md: por que os 4 contratos antigos, com os caminhos de então, foram juntados)
const HISTORICOS = [
  { arquivo: 'docs/contratos/rastreio.md', secao: null },
  { arquivo: 'docs/decisoes/refatoracao-plano.md', secao: null },
  { arquivo: 'docs/decisoes/contratos-consolidados.md', secao: null },
];
// entregues por outro construtor na mesma fase: enquanto não existem, aviso (não erro).
// Hoje vazia: tudo o que estava aqui já existe (faltar é erro). Só para uso temporário entre construtores.
const EM_CONSTRUCAO = [];
const PULAR_PASTAS = new Set(['node_modules', '.git']);
const PULAR_CAMINHOS = ['jogo/js/voz', 'jogo/ferramentas/gerado/vozes-cache', 'jogo/servidor/dados'];
const RAIZES_SIMBOLO = /^(?:window\.)?(Reino|Mapa|Jogador|PA|UI|__reino|__congelar)(?=\.|$)/;
const EXT = /\.(js|mjs|cjs|md|css|html|json|py|txt|db|ts|sh|yml|yaml|mp3|png|service)$/i;
const MODELO = /[<>*{}…$|()'"=,;!?]|\.\.\./;

/* ---------- índice do disco (nomes; nenhum arquivo é lido) ---------- */
const indice = [];            // caminhos relativos à raiz, de arquivos e pastas (pasta com / no fim)
(function andar(rel) {
  let itens;
  try { itens = fs.readdirSync(path.join(RAIZ, rel), { withFileTypes: true }); } catch (e) { return; }
  itens.forEach((e) => {
    if (PULAR_PASTAS.has(e.name)) return;
    const r = rel ? rel + '/' + e.name : e.name;
    if (PULAR_CAMINHOS.includes(r)) { indice.push(r + '/'); return; }
    let pasta = e.isDirectory();
    if (e.isSymbolicLink()) { try { pasta = fs.statSync(path.join(RAIZ, r)).isDirectory(); } catch (x) { return; } }
    if (pasta) { indice.push(r + '/'); andar(r); } else indice.push(r);
  });
})('');
// raízes de caminho: as fixas + as pastas de primeiro nível do disco (as de material: História/, Geografia/…)
const RAIZES_FIXAS = ['./', '../', '/home/', '/tmp/', 'jogo/', 'js/', 'css/', 'docs/', 'ferramentas/', '.claude/', 'amostras-de-voz/'];
const RAIZES_DISCO = indice.filter((p) => /^[^/]+\/$/.test(p));
const RAIZES = RAIZES_FIXAS.concat(RAIZES_DISCO.filter((p) => !RAIZES_FIXAS.includes(p)));
const comecaNumaRaiz = (t) => RAIZES.some((r) => t.startsWith(r));
const porFim = (fim) => indice.some((p) => p === fim || p === fim + '/' || p.endsWith('/' + fim) || p.endsWith('/' + fim + '/'));

/* ---------- identificadores do jogo (jogo/js, fora de js/voz) ---------- */
const nomes = new Set();
indice.filter((p) => /^jogo\/js\/.*\.js$/.test(p)).forEach((p) => {
  for (const m of fs.readFileSync(path.join(RAIZ, p), 'utf8').matchAll(/[A-Za-z_$][\w$]*/g)) nomes.add(m[0]);
});

let scripts = {};
try { scripts = JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8')).scripts || {}; } catch (e) { /* sem package.json */ }

/* ---------- conferência de uma referência ---------- */
const proibido = (t) => /servidor\/dados/.test(t);
function existeCaminho(tok, docDir) {
  let t = tok.replace(/^\.\//, '').replace(/:\d+(-\d+)?$/, '');
  if (t.startsWith('/')) return proibido(t) || !t.startsWith('/home/') || fs.existsSync(t);
  const semBarra = t.replace(/\/$/, '');
  const bases = ['', 'jogo', 'jogo/js', 'jogo/ferramentas', docDir, 'docs', 'docs/contratos', 'docs/decisoes', 'docs/receitas'];
  if (bases.some((b) => fs.existsSync(path.join(RAIZ, b, semBarra)))) return true;
  return porFim(semBarra);
}
function emConstrucao(tok) {
  const t = tok.replace(/^\.\//, '');
  return EM_CONSTRUCAO.find((e) => (e === t || e.endsWith('/' + t)) && !fs.existsSync(path.join(RAIZ, e)));
}
function ehCaminho(t) {
  if (/\s/.test(t) || MODELO.test(t) || /^[a-z]+:\/\//i.test(t) || /^[\d/.:]+$/.test(t)) return false;
  if (t.startsWith('.') && !t.startsWith('./') && !t.startsWith('../')) return false;   // .classe do CSS
  if (EXT.test(t)) return true;
  // sem extensão: só pasta terminada em / ou que começa numa pasta conhecida (senão `progresso/mariana`,
  // `ocupar/liberar`, `feat/<branch>` e `/api/…` virariam caminho)
  return t.includes('/') && /\p{L}/u.test(t) && (t.endsWith('/') || comecaNumaRaiz(t));
}
// devolve null (ok), { erro } ou { aviso }
function conferirCaminho(t, docDir) {
  if (t.startsWith('/tmp/') || t === '/tmp' || proibido(t)) return null;
  if (existeCaminho(t, docDir)) return null;
  const pend = emConstrucao(t);
  if (pend) return { aviso: `${t}: ainda não existe (${pend}, de outro construtor)` };
  return { erro: `caminho não existe: ${t}` };
}
function conferirSimbolo(t) {
  const cadeia = t.match(/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/)[0];
  const partes = cadeia.split('.').filter((p) => p !== 'window');
  const faltam = partes.filter((p) => !nomes.has(p));
  return faltam.length ? { erro: `símbolo não achado em jogo/js: ${cadeia} (${faltam.join(', ')})` } : null;
}
// um comando (pode ter várias partes com && ou ;): devolve a lista de problemas
function conferirComando(cmd, docDir) {
  const res = [];
  cmd.split(/&&|;|\|\|/).map((p) => p.trim()).forEach((p) => {
    let m = p.match(/^npm\s+(?:run(?:-script)?\s+([\w:.-]+)|(test|t))\b/);
    if (m) {
      const nome = m[1] || 'test';
      if (!scripts[nome]) res.push({ erro: `script não existe no package.json: npm run ${nome}` });
      return;
    }
    m = p.match(/(?:^|\s)(?:node|python3?|python)\s+((?:[^\s-][^\s]*))/);
    if (m && !MODELO.test(m[1]) && ehCaminho(m[1])) { const r = conferirCaminho(m[1], docDir); if (r) res.push(r); }
  });
  return res;
}
const ehComando = (t) => /^(npm\s|node\s|python3?\s|uv\s+run\s|cd\s)/.test(t);

/* ---------- um arquivo .md ---------- */
function conferirArquivo(rel) {
  const texto = fs.readFileSync(path.join(RAIZ, rel), 'utf8');
  const problemas = [];
  if (texto.includes('<!-- validar-docs: ignorar-arquivo -->')) return { problemas, refs: 0 };
  const hist = HISTORICOS.filter((h) => h.arquivo === rel);
  if (hist.some((h) => h.secao === null)) return { problemas, refs: 0 };
  const docDir = path.dirname(rel);
  let ignorando = false, cerca = false, secaoHist = false, nivelHist = 0, refs = 0;
  texto.split('\n').forEach((linha, i) => {
    const n = i + 1;
    const add = (r, ref) => { if (r) problemas.push(Object.assign({ onde: `${rel}:${n}`, ref }, r)); };
    if (linha.includes('<!-- validar-docs: ignorar -->')) { ignorando = true; return; }
    if (linha.includes('<!-- validar-docs: fim -->')) { ignorando = false; return; }
    const titulo = !cerca && linha.match(/^(#{1,6})\s/);
    if (titulo) {
      if (secaoHist && titulo[1].length <= nivelHist) secaoHist = false;
      if (hist.some((h) => h.secao.test(linha))) { secaoHist = true; nivelHist = titulo[1].length; }
    }
    if (/^\s*```/.test(linha)) { cerca = !cerca; return; }
    if (ignorando || secaoHist) return;
    if (cerca) {
      const cmd = linha.replace(/#.*$/, '').trim();
      if (ehComando(cmd)) { refs++; conferirComando(cmd, docDir).forEach((r) => add(r, cmd)); }
      return;
    }
    // links do Markdown para arquivos do repositório
    for (const m of linha.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const alvo = m[1].replace(/#.*$/, '');
      if (!alvo || /^[a-z]+:/i.test(alvo)) continue;
      refs++;
      const abs = path.join(RAIZ, docDir, decodeURI(alvo));
      if (!proibido(alvo) && !fs.existsSync(abs)) add({ erro: `link quebrado: ${alvo}` }, alvo);
    }
    // texto entre crases
    for (const m of linha.matchAll(/`([^`]+)`/g)) {
      const t = m[1].trim();
      if (!t) continue;
      if (ehComando(t)) { refs++; conferirComando(t, docDir).forEach((r) => add(r, t)); continue; }
      if (RAIZES_SIMBOLO.test(t)) { refs++; add(conferirSimbolo(t), t); continue; }
      if (ehCaminho(t)) { refs++; add(conferirCaminho(t, docDir), t); }
    }
  });
  return { problemas, refs };
}

/* ---------- quais arquivos ---------- */
function arquivosDocs() {
  return indice.filter((p) => !p.endsWith('/') && (
    (/^docs\/.*\.md$/.test(p)) || /(^|\/)CLAUDE\.md$/.test(p) || /^\.claude\/skills\/.*\/SKILL\.md$/.test(p)
  )).filter((p) => !/^jogo\/servidor\//.test(p)).sort();
}

if (require.main === module) {
  const lista = arquivosDocs();
  let erros = 0, avisos = 0, total = 0;
  lista.forEach((rel) => {
    const { problemas, refs } = conferirArquivo(rel);
    total += refs;
    problemas.forEach((p) => {
      if (p.erro) { erros++; console.log(`✘ ${p.onde}: ${p.erro}`); }
      else { avisos++; console.log(`⚠ ${p.onde}: ${p.aviso}`); }
    });
    if (DETALHES) console.log(`  ${rel}: ${refs} referências`);
  });
  if (erros) {
    console.log(`✘ ${erros} referência(s) quebrada(s) em ${lista.length} arquivos (${total} conferidas${avisos ? `, ${avisos} aviso(s)` : ''})`);
    process.exit(1);
  }
  console.log(`✔ docs: ${total} referências conferidas em ${lista.length} arquivos${avisos ? ` (${avisos} aviso(s): arquivos ainda em construção)` : ''}`);
}

module.exports = { conferirArquivo, arquivosDocs, RAIZ };
