// Limpeza segura das worktrees e branches que sobraram das frentes e integrações.
// Uso: npm run limpar              → SÓ lista: entradas "prunable" (a pasta sumiu), cada worktree com o estado
//                                     (mudanças soltas, commits fora da main, processo vivo dentro, tamanho),
//                                     branches já contidas na main e as não contidas; e quanto dá para liberar.
//      npm run limpar -- --aplicar → git worktree prune; git worktree remove (sem --force) só de worktree limpa,
//                                     sem commit fora da main e sem processo vivo (nunca a árvore principal nem a
//                                     worktree de onde roda); git branch -d (nunca -D) só das branches contidas na
//                                     main e fora de uso. Nunca apaga pasta com rm. Diz o que fez e o que deixou.
//      --manter '<regex>'          → protege as worktrees cujo caminho casa (ex.: 'reino-ef-|reino-eficiencia',
//                                     as frentes de um plano em andamento que ainda não começaram).
// Arquivos ignorados pelo git somem no remove: node_modules, vercel/public/ e jogo/js/versao.json são gerados;
// .vozes/ só com venv/temporários vira aviso; qualquer outro ignorado segura a worktree.
if (require.main === module) require('../ajuda').ajuda(__filename);
const C = require('./comum');

// git worktree list --porcelain, com a marca "prunable"
function listarWorktrees(repo) {
  return C.git(repo, 'worktree', 'list', '--porcelain').split('\n\n').filter((b) => b.trim()).map((b) => {
    const w = { prunable: false };
    b.split('\n').forEach((l) => {
      if (l.startsWith('worktree ')) w.pasta = l.slice(9);
      else if (l.startsWith('branch ')) w.branch = l.slice(7).replace(/^refs\/heads\//, '');
      else if (l.startsWith('prunable')) w.prunable = true;
    });
    return w;
  });
}

// tamanho em KB (du não segue o link do node_modules)
function tamanhoKB(pasta) {
  const r = C.rodar('du', ['-sk', pasta]);
  return Number((r.saida.split('\t')[0] || '0').trim()) || 0;
}
// ignorados pelo git que somem no `worktree remove`: os regeneráveis não contam; os de .vozes/ que são só o venv
// do transcritor ou temporários viram aviso; o resto segura a worktree (o mais seguro: não se perde nada)
const GERADOS = /^(node_modules\/?|vercel\/public\/.*|jogo\/js\/versao\.json)$/;
const VOZES_DESCARTAVEIS = /^\.vozes\/(\.?venv[^/]*|tmp|temp[^/]*)(\/|$)/;
function ignorados(pasta) {
  const todos = C.git(pasta, '--no-optional-locks', 'ls-files', '-o', '-i', '--exclude-standard').split('\n').filter(Boolean)
    .filter((f) => !GERADOS.test(f));
  return { avisos: todos.filter((f) => VOZES_DESCARTAVEIS.test(f)), seguram: todos.filter((f) => !VOZES_DESCARTAVEIS.test(f)) };
}
const curta = (l) => l.slice(0, 4).join(', ') + (l.length > 4 ? ` e mais ${l.length - 4}` : '');
const mb = (kb) => (kb >= 1024 * 1024 ? (kb / 1024 / 1024).toFixed(1) + ' GB' : Math.round(kb / 1024) + ' MB');

// o retrato de tudo: { prunable, worktrees: [{ pasta, branch, soltas, aFrente, vivos, kb, principal, aqui }], mescladas, abertas }
function examinar(cwd) {
  const repo = C.git(cwd, 'rev-parse', '--show-toplevel');
  const lista = listarWorktrees(repo);
  const principal = lista[0].pasta;
  const wts = lista.slice(1).filter((w) => !w.prunable).map((w) => {
    const soltas = C.git(w.pasta, '--no-optional-locks', 'status', '--porcelain').split('\n').filter((l) => l.trim() && !/ node_modules\/?$/.test(l));
    const aFrente = Number(C.git(w.pasta, 'rev-list', '--count', 'main..HEAD'));
    return { ...w, soltas, aFrente, ign: ignorados(w.pasta), vivos: C.processosNaPasta(w.pasta), kb: tamanhoKB(w.pasta), aqui: w.pasta === repo };
  });
  // branch presa só a entrada prunable fica livre: o --aplicar faz o prune antes
  const emUso = new Set(lista.filter((w) => w.branch && !w.prunable).map((w) => w.branch));
  const branches = C.git(repo, 'for-each-ref', '--format=%(refname:short)', 'refs/heads').split('\n').filter(Boolean);
  const mescladasSet = new Set(C.git(repo, 'branch', '--merged', 'main', '--format=%(refname:short)').split('\n').filter(Boolean));
  const mescladas = branches.filter((b) => b !== 'main' && mescladasSet.has(b)).map((b) => ({ nome: b, emUso: emUso.has(b) }));
  const abertas = branches.filter((b) => b !== 'main' && !mescladasSet.has(b))
    .map((b) => ({ nome: b, aFrente: Number(C.git(repo, 'rev-list', '--count', `main..${b}`)), emUso: emUso.has(b) }));
  return { repo, principal, prunable: lista.filter((w) => w.prunable), worktrees: wts, mescladas, abertas };
}

// por que uma worktree fica (vazio = pode sair)
function motivosDeFicar(w) {
  const m = [];
  if (w.aqui) m.push('é a worktree de onde o comando roda');
  if (w.soltas.length) m.push(`${w.soltas.length} mudança(s) solta(s)`);
  if (w.aFrente) m.push(`${w.aFrente} commit(s) fora da main`);
  if (w.manter) m.push('protegida pelo --manter');
  if (w.ign.seguram.length) m.push(`arquivos ignorados ${curta(w.ign.seguram)}`);
  if (w.vivos.length) m.push(`processo vivo (PID ${w.vivos.map((p) => p.pid).join(', ')})`);
  return m;
}

function limpar(argv, cwd = process.cwd()) {
  const op = C.lerArgs(argv, { booleanas: ['aplicar'] });
  if (op._.length || Object.keys(op).some((k) => !['_', 'aplicar', 'manter'].includes(k))) throw new Error('opção desconhecida (veja --ajuda)');
  const e = examinar(cwd);
  if (op.manter) { const re = new RegExp(op.manter); e.worktrees.forEach((w) => { w.manter = re.test(w.pasta); }); }
  const aviso = (w) => (w.ign.avisos.length ? ` (⚠ some com ela: ${curta(w.ign.avisos)})` : '');
  const linhas = []; const log = (t) => linhas.push(t);
  const saem = e.worktrees.filter((w) => !motivosDeFicar(w).length);
  const ficam = e.worktrees.filter((w) => motivosDeFicar(w).length);

  if (!op.aplicar) {
    log(`Árvore principal (nunca se mexe): ${e.principal}`);
    log(`\nEntradas prunable (a pasta sumiu): ${e.prunable.length}`);
    e.prunable.forEach((w) => log(`  - ${w.pasta}${w.branch ? ` (${w.branch})` : ''}`));
    log(`\nWorktrees: ${e.worktrees.length} (${saem.length} limpas, podem sair; ${ficam.length} ficam)`);
    saem.forEach((w) => log(`  ✔ ${w.pasta} [${w.branch || 'sem branch'}] ${mb(w.kb)}: limpa, nada fora da main${aviso(w)}`));
    ficam.forEach((w) => log(`  • ${w.pasta} [${w.branch || 'sem branch'}] ${mb(w.kb)}: ${motivosDeFicar(w).join('; ')}`));
    const podemSair = e.mescladas.filter((b) => !b.emUso || saem.some((w) => w.branch === b.nome));
    log(`\nBranches contidas na main: ${e.mescladas.length} (${podemSair.length} podem sair com -d)`);
    log(`Branches NÃO contidas na main (ficam): ${e.abertas.length}`);
    e.abertas.forEach((b) => log(`  • ${b.nome}: ${b.aFrente} commit(s) à frente${b.emUso ? ' (em uso)' : ''}`));
    log(`\nDá para liberar: ${mb(saem.reduce((s, w) => s + w.kb, 0))} (${saem.length} worktrees), ${e.prunable.length} entradas prunable, ${podemSair.length} branches.`);
    log('Para aplicar: npm run limpar -- --aplicar');
    return { texto: linhas.join('\n'), exame: e };
  }

  C.git(e.repo, 'worktree', 'prune');
  log(`✔ git worktree prune (${e.prunable.length} entrada(s) sem pasta)`);
  const removidas = [];
  saem.forEach((w) => {
    const r = C.rodar('git', ['-C', e.repo, 'worktree', 'remove', w.pasta]);
    if (r.ok) { removidas.push(w); log(`✔ worktree removida: ${w.pasta} (${mb(w.kb)})${aviso(w)}`); } else log(`• ficou ${w.pasta}: o git recusou (${r.erro.trim()})`);
  });
  ficam.forEach((w) => log(`• ficou ${w.pasta}: ${motivosDeFicar(w).join('; ')}`));
  const emUso = new Set(listarWorktrees(e.repo).filter((w) => w.branch).map((w) => w.branch));
  let apagadas = 0;
  e.mescladas.forEach((b) => {
    if (emUso.has(b.nome)) { log(`• branch ${b.nome} ficou: em uso por uma worktree`); return; }
    const r = C.rodar('git', ['-C', e.principal, 'branch', '-d', b.nome]);
    if (r.ok) apagadas++; else log(`• branch ${b.nome} ficou: ${r.erro.trim()}`);
  });
  log(`✔ ${apagadas} branch(es) contidas na main apagadas com -d`);
  log(`• ${e.abertas.length} branch(es) não contidas na main ficaram (nunca -D)`);
  log(`Liberado: ${mb(removidas.reduce((s, w) => s + w.kb, 0))}`);
  return { texto: linhas.join('\n'), exame: e };
}

if (require.main === module) {
  try { console.log(limpar(process.argv.slice(2)).texto); } catch (err) { console.error('✘ ' + err.message); process.exit(1); }
}

module.exports = { limpar, examinar };
