// Operações de git do integrar.js: classificar as entradas, cherry-pick linear, `apply --3way` de worktree sem
// commit, conflitos (jogo/index.html se resolve sozinho: um lado + `npm run index`; os gerados das vozes também:
// integrar-vozes.js), colisões com arquivos não rastreados da árvore principal, troca da base do e2e (à parte, só
// para e2e.js antigo) e commits. Só escreve na worktree de integração, exceto moverColisoes/devolver (só com --merge).
const fs = require('fs');
const path = require('path');
const C = require('./comum');
const V = require('./integrar-vozes');

const INDEX = 'jogo/index.html';
const BASE_E2E = 'jogo/ferramentas/testes/base-referencia.txt';
const TROCAR_BASE = 'jogo/ferramentas/testes/trocar-base.js';
const SEM_EDITOR = { GIT_EDITOR: 'true' };

// "Reino dos Unicórnios: …" sem repetir o prefixo; nada de Claude-Session nem atribuição (regra do Leandro)
const PREFIXO = 'Reino dos Unicórnios: ';
function mensagem(titulo) {
  const t = String(titulo).trim();
  return t.startsWith(PREFIXO) ? t : PREFIXO + t;
}

// status sem o link do node_modules (ele não conta como mudança)
function mudancas(pasta) {
  return C.git(pasta, 'status', '--porcelain', '--untracked-files=all').split('\n')
    .filter((l) => l.trim() && !/^.. node_modules(\/|$)/.test(l));
}

// branches que impedem criar `branch`: ela mesma, um "pai" (integracao impede integracao/x) ou um "filho"
// (integracao-x/y impede integracao-x). O git não deixa as duas ao mesmo tempo.
function branchesEmConflito(repo, branch) {
  const todas = C.git(repo, 'for-each-ref', '--format=%(refname:short)', 'refs/heads/').split('\n').filter(Boolean);
  return todas.filter((b) => b === branch || branch.startsWith(b + '/') || b.startsWith(branch + '/'));
}

// entrada = branch (feat/x) ou caminho de worktree registrada. Devolve o que aplicar dela.
function classificar(r, base, entrada, cwd = process.cwd()) {
  const abs = path.resolve(cwd, entrada);
  const pareceCaminho = entrada.startsWith('/') || entrada.startsWith('.') || (fs.existsSync(abs) && fs.statSync(abs).isDirectory());
  let pasta = null; let ref; let branch;
  if (pareceCaminho) {
    if (!fs.existsSync(abs)) throw new Error(`a pasta ${abs} não existe`);
    const real = fs.realpathSync(abs);
    const w = r.worktrees.find((x) => fs.existsSync(x.pasta) && fs.realpathSync(x.pasta) === real);
    if (!w) throw new Error(`${abs} não é uma worktree deste repositório (veja git worktree list)`);
    if (w.pasta === r.principal) throw new Error('a árvore principal não é uma frente');
    pasta = w.pasta; ref = w.head; branch = w.branch || null;
  } else {
    if (!C.gitOk(r.repo, 'show-ref', '--verify', '--quiet', `refs/heads/${entrada}`)) throw new Error(`a branch ${entrada} não existe`);
    ref = C.git(r.repo, 'rev-parse', `refs/heads/${entrada}`); branch = entrada;
  }
  const merges = C.git(r.repo, 'rev-list', '--merges', `${base}..${ref}`);
  if (merges) throw new Error(`${entrada} tem merge commit (${merges.split('\n')[0].slice(0, 7)}): o histórico é linear, refaça a branch sem merge`);
  const commits = C.git(r.repo, 'rev-list', '--reverse', '--no-merges', '--right-only', '--cherry-pick', `${base}...${ref}`).split('\n').filter(Boolean);
  const solto = pasta ? mudancas(pasta).length > 0 : false;
  // branch aberta numa worktree com mudanças soltas: elas NÃO entram (passe o caminho da worktree)
  const aviso = [];
  if (!pasta) {
    const w = r.worktrees.find((x) => x.branch === entrada);
    if (w) { pasta = w.pasta; if (mudancas(w.pasta).length) aviso.push(`⚠ ${entrada}: a worktree ${w.pasta} tem mudanças sem commit que NÃO entram (passe o caminho dela para incluí-las)`); }
  }
  const assunto = (branch || path.basename(pasta)).replace(/^feat\//, '').replace(/^reino-/, '');
  return { entrada, pasta, branch, commits, solto: solto && !!pareceCaminho, assunto, aviso, ehWorktree: !!pareceCaminho };
}

const conflitos = (integ) => C.git(integ, 'diff', '--name-only', '--diff-filter=U').split('\n').filter(Boolean);
function emCherryPick(integ) {
  if (C.gitOk(integ, 'rev-parse', '-q', '--verify', 'CHERRY_PICK_HEAD')) return true;
  return fs.existsSync(path.resolve(integ, C.git(integ, 'rev-parse', '--git-path', 'sequencer')));
}

// jogo/index.html é gerado: com conflito, pega um lado (o da frente, se houver) e refaz do manifesto
function refazerIndex(integ, log) {
  if (!C.gitOk(integ, 'checkout', '--theirs', '--', INDEX)) C.gitOk(integ, 'checkout', '--ours', '--', INDEX);
  const r = C.rodar('npm', ['run', '--silent', 'index'], { cwd: integ });
  if (!r.ok) throw new Error(`npm run index falhou ao resolver o conflito do ${INDEX}:\n${r.erro || r.saida}`);
  C.git(integ, 'add', '--', INDEX);
  log(`  • conflito em ${INDEX}: um lado + npm run index (resolvido sozinho)`);
}

// gerado que o conflito resolve sozinho: index.html e os arquivos das vozes
const resolveSozinho = (f) => f === INDEX || V.ehVoz(f);
function resolverGerados(integ, conf, log) {
  if (conf.includes(INDEX)) refazerIndex(integ, log);
  return V.resolverVozes(integ, conf, log);
}

// laço do cherry-pick: resolve os gerados sozinho, pula commit que ficou vazio, para em conflito de verdade
function seguirCherryPick(integ, r, log) {
  let erroAntes = null;
  for (let volta = 0; volta < 1000; volta++) {
    if (r.ok) return { ok: true };
    const conf = conflitos(integ);
    if (!conf.every(resolveSozinho)) return { ok: false, conflitos: conf };
    const erro = (r.erro || r.saida || '').trim();
    if (!emCherryPick(integ) || (!conf.length && erro && erro === erroAntes)) return { ok: false, conflitos: [], erro };
    erroAntes = erro;
    if (conf.length) { const g = resolverGerados(integ, conf, log); if (!g.ok) return g; }
    if (C.gitOk(integ, 'diff', '--cached', '--quiet')) {
      log('  • commit que ficou vazio (já está na main): pulado');
      r = C.rodar('git', ['-C', integ, 'cherry-pick', '--skip'], { env: SEM_EDITOR });
    } else r = C.rodar('git', ['-C', integ, 'cherry-pick', '--continue'], { env: SEM_EDITOR });
  }
  return { ok: false, conflitos: conflitos(integ), erro: 'cherry-pick não terminou' };
}

function aplicarCommits(integ, commits, log) {
  log(`  • cherry-pick de ${commits.length} commit(s): ${commits.map((c) => c.slice(0, 7)).join(' ')}`);
  return seguirCherryPick(integ, C.rodar('git', ['-C', integ, 'cherry-pick', ...commits], { env: SEM_EDITOR }), log);
}

// depois que a pessoa resolveu (git add): termina o cherry-pick em andamento ou o apply da frente solta
function continuar(integ, log) {
  if (emCherryPick(integ)) return seguirCherryPick(integ, { ok: false }, log);
  const conf = conflitos(integ);
  if (conf.length && conf.every(resolveSozinho)) return resolverGerados(integ, conf, log);
  return conf.length ? { ok: false, conflitos: conf } : { ok: true };
}

// worktree sem commit: diff dela contra o próprio HEAD, aplicado com --3way, + cópia dos não rastreados (também
// quando o apply falha: os arquivos novos não somem; `applyFalhou` avisa que as mudanças rastreadas não entraram)
function aplicarSolto(integ, wt, log) {
  const diff = C.rodar('git', ['-C', wt, 'diff', '--binary', 'HEAD'], { binario: true });
  if (!diff.ok) throw new Error(`git diff em ${wt} falhou: ${diff.erro}`);
  let conf = []; let falhou = null; let erroGerados = null;
  if (diff.saida.length) {
    const a = C.rodar('git', ['-C', integ, 'apply', '--3way', '--whitespace=nowarn'], { input: diff.saida });
    conf = conflitos(integ);
    if (!a.ok && !conf.length) {
      // falhou inteiro, sem conflito marcado (ex.: arquivo apagado por uma frente anterior): nada entrou, a não
      // ser que as mudanças já estejam na integração (postas à mão antes do --continuar)
      if (C.rodar('git', ['-C', integ, 'apply', '--reverse', '--check'], { input: diff.saida }).ok) log(`  • as mudanças soltas de ${wt} já estão na integração`);
      else falhou = String(a.erro).trim();
    } else {
      if (conf.length && conf.every(resolveSozinho)) {
        const g = resolverGerados(integ, conf, log);
        if (g.ok) conf = []; else erroGerados = g.erro;
      }
      log(`  • apply --3way das mudanças soltas de ${wt}` + (conf.length ? ' (com conflito)' : ''));
    }
  }
  const novos = C.naoRastreados(wt);
  const c = C.copiarArquivos(wt, integ, novos);
  if (c.copiados.length) C.git(integ, 'add', '--', ...c.copiados);
  if (novos.length) log(`  • ${c.copiados.length} arquivo(s) novo(s) copiado(s)` + (c.iguais.length ? `, ${c.iguais.length} já iguais` : ''));
  const diferentes = c.diferentes.map((f) => `${f} (novo na frente e diferente do que já está na integração)`);
  if (falhou) return { ok: false, conflitos: diferentes, erro: falhou, applyFalhou: true };
  return conf.length || diferentes.length ? { ok: false, conflitos: conf.concat(diferentes), erro: erroGerados } : { ok: true };
}

// por que o último commit NÃO pode ser emendado (null = pode): não é da integração, ou já está na main ou no
// origin/main (o --amend reescreveria um commit publicado)
function naoEmendar(integ, main) {
  if (C.git(integ, 'rev-list', '--count', `${main}..HEAD`) === '0') return 'nada integrado além da main (não há commit da integração para emendar)';
  if (C.gitOk(integ, 'merge-base', '--is-ancestor', 'HEAD', 'main')) return 'o último commit da integração já está na main';
  if (C.gitOk(integ, 'rev-parse', '-q', '--verify', 'refs/remotes/origin/main') && C.gitOk(integ, 'merge-base', '--is-ancestor', 'HEAD', 'origin/main')) {
    return 'o último commit da integração já está no origin/main';
  }
  return null;
}

// arquivos (já mudados) para dentro do último commit da integração (--amend; a branch ainda não está na main);
// se ele não pode ser emendado (naoEmendar: nada além da `main`, ou já publicado), um commit novo com `titulo`
function emendar(integ, arquivos, main, titulo) {
  C.git(integ, 'add', '-A', '--', ...arquivos);
  if (C.gitOk(integ, 'diff', '--cached', '--quiet')) return null;
  if (naoEmendar(integ, main)) C.git(integ, 'commit', '-q', '--no-verify', '-m', mensagem(titulo));
  else C.git(integ, 'commit', '-q', '--amend', '--no-edit', '--no-verify');
  return C.git(integ, 'rev-parse', '--short', 'HEAD');
}

// commit da frente sem commit (com --commit); nada preparado = nada a fazer
function commitFrente(integ, assunto) {
  C.git(integ, 'add', '-A', '--', '.');   // o link node_modules já está no .gitignore (a exclusão ':!' dá erro no git 2.55)
  if (C.gitOk(integ, 'diff', '--cached', '--quiet')) return null;
  C.git(integ, 'commit', '-q', '--no-verify', '-m', mensagem(assunto));
  return C.git(integ, 'rev-parse', '--short', 'HEAD');
}

// arquivos NÃO rastreados na árvore principal que a integração passa a rastrear: iguais (mover antes do
// merge) ou diferentes (param tudo)
function colisoes(principal, integ) {
  const soltos = C.naoRastreados(principal);
  if (!soltos.length) return { iguais: [], diferentes: [] };
  const rastreadosInteg = new Set(C.git(integ, 'ls-files', '-z').split('\0').filter(Boolean));
  const iguais = []; const diferentes = [];
  soltos.filter((f) => rastreadosInteg.has(f)).forEach((f) => {
    (C.mesmoConteudo(path.join(principal, f), path.join(integ, f)) ? iguais : diferentes).push(f);
  });
  return { iguais, diferentes };
}

// move (copia com a data e tira da árvore principal) para /tmp/reino-testes/antes-do-merge/<data>/
function moverColisoes(principal, lista, raiz = path.join(C.PASTA_TESTES, 'antes-do-merge')) {
  let destino = path.join(raiz, C.hoje());
  if (lista.some((f) => fs.existsSync(path.join(destino, f)))) destino += '-' + C.horaCurta();
  lista.forEach((f) => {
    const d = path.join(destino, f);
    fs.mkdirSync(path.dirname(d), { recursive: true });
    fs.cpSync(path.join(principal, f), d, { preserveTimestamps: true });
    if (!C.mesmoConteudo(path.join(principal, f), d)) throw new Error(`cópia de ${f} para ${d} não confere`);
  });
  lista.forEach((f) => fs.unlinkSync(path.join(principal, f)));
  return destino;
}
// se o merge falhar, devolve (a cópia em /tmp fica)
function devolver(principal, destino, lista) {
  lista.forEach((f) => {
    const p = path.join(principal, f);
    if (!fs.existsSync(p)) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.cpSync(path.join(destino, f), p, { preserveTimestamps: true }); }
  });
}

// linha nova "# <curto> = <descrição>" acima do hash; os outros comentários ficam byte a byte
function trocarTexto(texto, curto, descricao) {
  const linhas = texto.split('\n');
  const i = linhas.findIndex((l) => !l.startsWith('#'));
  if (i < 0 || !linhas[i].trim()) throw new Error(`${BASE_E2E} sem linha de hash`);
  linhas.splice(i, 1, `# ${curto} = ${descricao}`, curto);
  return linhas.join('\n');
}

// base do e2e = HEAD da integração, num commit à parte: só para e2e.js sem --aceitar (integrar-e2e.js)
function trocarBase(integ, descricao, log) {
  if (!descricao || /[\r\n#]/.test(descricao)) throw new Error('--trocar-base: descrição de uma linha, sem "#"');
  if (mudancas(integ).length) throw new Error('--trocar-base: a integração tem mudanças sem commit (use --commit)');
  const arq = path.join(integ, BASE_E2E);
  if (!fs.existsSync(arq)) throw new Error(`--trocar-base: ${BASE_E2E} não existe`);
  const curto = C.git(integ, 'rev-parse', '--short=7', 'HEAD');
  if (fs.existsSync(path.join(integ, TROCAR_BASE))) {
    const r = C.rodar(process.execPath, ['-e', 'require(process.argv[1]).trocarBase(process.argv[2], process.argv[3])', path.join(integ, TROCAR_BASE), curto, descricao], { cwd: integ });
    if (!r.ok) throw new Error(`${TROCAR_BASE} falhou:\n${r.erro || r.saida}`);
    log(`  • base trocada por ${TROCAR_BASE}`);
  } else {
    const novo = trocarTexto(fs.readFileSync(arq, 'utf8'), curto, descricao);
    fs.writeFileSync(arq + '.tmp', novo);
    fs.renameSync(arq + '.tmp', arq);
    log(`  • base trocada em ${BASE_E2E}`);
  }
  C.git(integ, 'add', '--', BASE_E2E);
  C.git(integ, 'commit', '-q', '--no-verify', '-m', mensagem(`base do e2e em ${curto} (${descricao})`));
  return { curto, commit: C.git(integ, 'rev-parse', '--short', 'HEAD') };
}

module.exports = {
  INDEX, BASE_E2E, mensagem, mudancas, branchesEmConflito, classificar, conflitos, emCherryPick, aplicarCommits, continuar,
  aplicarSolto, naoEmendar, emendar, commitFrente, colisoes, moverColisoes, devolver, trocarTexto, trocarBase,
};
