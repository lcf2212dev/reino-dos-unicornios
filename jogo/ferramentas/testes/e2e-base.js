// Base do e2e e chaves por conteúdo (usado pelo e2e.js e pela poda).
//   resolverBase({ repo, pedido })   { cheio, curto, aviso }: `pedido` (--base) ou o valor de base-referencia.txt:
//                                     hash, ou "@" = o commit que mudou o arquivo por último
//                                     (git log -1 -- base-referencia.txt); "@" mudado e sem commit: o HEAD (com aviso)
//   baseDaMain(repo)                 o commit base como está na main (null sem main)
//   conteudoCommit(repo, commit)     chave do jogo de um commit: árvores git de index.html, css, js e servidor
//   conteudoArvore(repo)             a mesma chave para a árvore de trabalho (índice temporário copiado do real,
//                                     git add -A das partes, git write-tree): inclui mudanças sem commit e arquivos novos
//   versaoNavegador(repo)            Playwright + revisão do Chromium (8 hex), para a chave da captura
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { PASTA_TESTES } = require('./guardas');

const ARQ_REL = 'jogo/ferramentas/testes/base-referencia.txt';
// o que o harness usa do jogo (o e2e extrai só isto da base; a chave do conteúdo é só disto)
const PARTES_JOGO = ['jogo/index.html', 'jogo/css', 'jogo/js', 'jogo/servidor'];

function git(repo, args, env) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: env || process.env }).trim();
}
const tentar = (fn) => { try { return fn(); } catch (e) { return null; } };
const sha = (t) => crypto.createHash('sha256').update(t).digest('hex');

// o valor da base: a primeira linha que não começa com #
function valorDaBase(texto) {
  return (texto.split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('#')) || '');
}

function commitDe(repo, hash) {
  if (!/^[0-9a-f]{4,40}$/i.test(hash || '')) throw new Error(`hash de base inválido: "${hash}" (veja ${ARQ_REL})`);
  const cheio = git(repo, ['rev-parse', '--verify', `${hash}^{commit}`]);
  return { cheio, curto: cheio.slice(0, 7) };
}

function resolverBase(op = {}) {
  const repo = op.repo;
  if (op.pedido) return commitDe(repo, op.pedido);
  const valor = valorDaBase(fs.readFileSync(path.join(repo, ARQ_REL), 'utf8'));
  if (valor !== '@') return commitDe(repo, valor);
  // "@" ainda sem commit (aceite de agora): a base é o HEAD
  if (git(repo, ['status', '--porcelain', '--', ARQ_REL])) {
    const b = commitDe(repo, git(repo, ['rev-parse', 'HEAD']));
    return { ...b, aviso: `base-referencia.txt tem "@" ainda sem commit: comparo com o HEAD (${b.curto})` };
  }
  const ultimo = git(repo, ['log', '-1', '--format=%H', '--', ARQ_REL]);
  if (!ultimo) throw new Error(`base "@" sem nenhum commit de ${ARQ_REL}`);
  return { ...commitDe(repo, ultimo), aviso: null };
}

// a base que a main usa (a poda nunca apaga a captura dela)
function baseDaMain(repo) {
  return tentar(() => {
    const valor = valorDaBase(git(repo, ['show', `main:${ARQ_REL}`]));
    const c = valor === '@' ? git(repo, ['log', '-1', '--format=%H', 'main', '--', ARQ_REL]) : valor;
    return commitDe(repo, c);
  });
}

// árvore (commit ou tree) → chave de 16 hex; parte que não existe conta como "-"
function conteudoDe(repo, arvore) {
  const ids = PARTES_JOGO.map((p) => tentar(() => git(repo, ['rev-parse', '--verify', '-q', `${arvore}:${p}`])) || '-');
  return sha(ids.join('\n')).slice(0, 16);
}
const conteudoCommit = (repo, commit) => conteudoDe(repo, commit);

function conteudoArvore(repo) {
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'indice-'));
  try {
    const indice = path.join(pasta, 'index');
    const real = path.resolve(repo, git(repo, ['rev-parse', '--git-path', 'index']));
    // cópia com o mesmo mtime do índice real: o git só relê o que mudou, e o arquivo mexido no mesmo tique em que o
    // índice foi gravado continua "racy" (relido); com o mtime de agora ele passava por limpo e a chave era a do índice
    if (fs.existsSync(real)) {
      const st = fs.statSync(real);
      fs.copyFileSync(real, indice);
      fs.utimesSync(indice, st.atime, st.mtime);
    }
    const env = { ...process.env, GIT_INDEX_FILE: indice };
    const existem = PARTES_JOGO.filter((p) => fs.existsSync(path.join(repo, p)));
    const somem = PARTES_JOGO.filter((p) => !existem.includes(p));
    if (existem.length) git(repo, ['add', '-A', '--', ...existem], env);
    if (somem.length) git(repo, ['rm', '-r', '-q', '--cached', '--ignore-unmatch', '--', ...somem], env);
    return conteudoDe(repo, git(repo, ['write-tree'], env));
  } finally { fs.rmSync(pasta, { recursive: true, force: true }); }
}

// raiz do jogo "atual" (--raiz) → a árvore git dela, se for a pasta jogo/ de uma worktree; senão null (sem cache)
function repoDoJogo(raiz) {
  const topo = tentar(() => git(raiz, ['rev-parse', '--show-toplevel']));
  return topo && path.resolve(topo, 'jogo') === path.resolve(raiz) ? topo : null;
}

function versaoNavegador(repo) {
  const ler = (m) => tentar(() => fs.readFileSync(require.resolve(m, { paths: [repo] }), 'utf8')) || '?';
  const pw = tentar(() => JSON.parse(ler('playwright/package.json')).version) || '?';
  const cr = tentar(() => JSON.parse(ler('playwright-core/browsers.json')).browsers
    .filter((b) => /^chromium/.test(b.name)).map((b) => `${b.name}:${b.revision}:${b.browserVersion}`).join(',')) || '?';
  return sha(pw + '\n' + cr).slice(0, 8);
}

module.exports = { ARQ_REL, PARTES_JOGO, valorDaBase, resolverBase, baseDaMain, conteudoCommit, conteudoArvore, repoDoJogo, versaoNavegador };
