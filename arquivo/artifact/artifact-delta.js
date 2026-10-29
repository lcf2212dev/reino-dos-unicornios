// Artifact por delta: o que o artifact publicado tinha num commit e o que mudou desde então.
// Só lê o git (show, ls-tree, diff, status): nunca publica nem grava no repositório.
// Caminho publicado = caminho sob jogo/ (css/x.css, js/…, js/voz/<pacote>.js); a página (index.html)
// vai à parte, como file_path da publicação, e não entra nas listas.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..', '..');
const REGISTRO = path.join(__dirname, 'artifact-publicado.txt');
const MAX_LOTE = 250;   // entradas por publicação (limite do claude.ai é 255; os null contam)
const PASTAS = ['jogo/js', 'jogo/css', 'jogo/index.html'];

// quotePath=false: nome com acento sai como está, e não entre aspas com \303\247 (sumia do delta; auditoria)
const git = (repo, args) => execFileSync('git', ['-c', 'core.quotePath=false', ...args], { cwd: repo, encoding: 'utf8', maxBuffer: 64 << 20 });

// manifesto de um commit, avaliado num vm (dados puros, sem DOM)
function manifestoDe(commit, repo) {
  const codigo = git(repo, ['show', commit + ':jogo/js/manifesto.js']);
  const mod = { exports: {} };
  vm.runInNewContext(codigo, { module: mod }, { filename: 'manifesto.js' });
  return JSON.parse(JSON.stringify(mod.exports));   // tira do contexto do vm (arrays comuns)
}

// arquivos que o artifact teria naquele commit (na ordem: css, scripts, pacotes de voz)
function listaPublicada(commit, repo = RAIZ) {
  const m = manifestoDe(commit, repo);
  const vozes = git(repo, ['ls-tree', '--name-only', commit, 'jogo/js/voz/']).split('\n')
    .filter((f) => f.endsWith('.js')).map((f) => f.replace(/^jogo\//, '')).sort();
  return m.css.concat(m.scripts.map((s) => s.js), vozes);
}

// novos, mudados e removidos entre `desde` e HEAD (renomeado = removido + novo)
function delta(desde, repo = RAIZ) {
  const antes = new Set(listaPublicada(desde, repo));
  const agora = listaPublicada('HEAD', repo);
  const atual = new Set(agora);
  const novos = new Set(), mudados = new Set(), removidos = new Set();
  let pagina = false;
  const pub = (f) => f.replace(/^jogo\//, '');
  git(repo, ['diff', '--name-status', '-M', desde, 'HEAD', '--', ...PASTAS]).split('\n').filter(Boolean).forEach((l) => {
    const [st, a, b] = l.split('\t');
    if (pub(a) === 'index.html') { pagina = true; return; }
    if (st[0] === 'R') { if (antes.has(pub(a))) removidos.add(pub(a)); if (atual.has(pub(b))) novos.add(pub(b)); return; }
    const f = pub(a);
    if (st[0] === 'D') { if (antes.has(f)) removidos.add(f); return; }
    if (!atual.has(f)) return;   // não publicado (CLAUDE.md, manifesto.js, …)
    (antes.has(f) ? mudados : novos).add(f);
  });
  // entrou ou saiu da lista sem mudar de conteúdo (ex.: linha nova no manifesto)
  agora.forEach((f) => { if (!antes.has(f)) { novos.add(f); mudados.delete(f); } });
  antes.forEach((f) => { if (!atual.has(f)) removidos.add(f); });
  const ordem = (s) => agora.filter((f) => s.has(f));
  return { desde, novos: ordem(novos), mudados: ordem(mudados), removidos: [...removidos].sort(), pagina };
}

// mapas `files` de até MAX_LOTE entradas: novos e mudados primeiro; os removidos (null) todos no ÚLTIMO lote,
// que é o que leva a página (uma aba aberta entre lotes nunca pede arquivo que não existe)
function lotes(d, jogo, max = MAX_LOTE) {
  const envia = d.novos.concat(d.mudados);
  if (d.removidos.length > max) throw new Error(`removidos demais para um lote só (${d.removidos.length} > ${max})`);
  const grupos = [];
  for (let i = 0; i < envia.length; i += max) grupos.push(envia.slice(i, i + max));
  const ult = grupos[grupos.length - 1];
  if (!ult || ult.length + d.removidos.length > max) grupos.push([]);
  return grupos.map((g, i) => {
    const mapa = {};
    g.forEach((f) => { mapa[f] = path.join(jogo, f); });
    if (i === grupos.length - 1) d.removidos.forEach((f) => { mapa[f] = null; });
    return mapa;
  });
}

// mudança fora de commit nas pastas publicadas (o delta compara commits)
function sujas(repo = RAIZ) {
  return git(repo, ['status', '--porcelain', '--', ...PASTAS]).split('\n').filter(Boolean);
}

// registro: comentários # e uma linha "<hash> <url> <versão>"
function lerRegistro(arq = REGISTRO) {
  const l = fs.readFileSync(arq, 'utf8').split('\n').find((x) => x.trim() && !x.startsWith('#'));
  if (!l) throw new Error('artifact-publicado.txt sem linha de dados');
  const [hash, url, versao] = l.trim().split(/\s+/);
  return { hash, url, versao };
}

function registrar(hash, versao, arq = REGISTRO) {
  if (!/^[0-9a-f]{7,40}$/.test(hash || '') || !/^v\d+$/.test(versao || '')) throw new Error('uso: --registrar <hash> --versao vN');
  const { url } = lerRegistro(arq);
  let feito = false;
  const linhas = fs.readFileSync(arq, 'utf8').split('\n').map((x) => {
    if (feito || !x.trim() || x.startsWith('#')) return x;
    feito = true;
    return `${hash} ${url} ${versao}`;
  });
  fs.writeFileSync(arq, linhas.join('\n'));
}

module.exports = { listaPublicada, delta, lotes, sujas, lerRegistro, registrar, MAX_LOTE, REGISTRO };
