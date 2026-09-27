// Integra frentes numa worktree nova a partir da main, em histórico LINEAR (npm run integrar -- …):
//   node jogo/ferramentas/fluxo/integrar.js <branch|/caminho/worktree> [--assunto "<texto>"]… [opções]
// a. confere: árvore principal sem mudança em arquivo rastreado (pastas de material e config local não
//    rastreadas podem); cada entrada existe; nenhum processo vivo nas worktrees das frentes (mostra os PIDs e para)
// b. worktree <ao lado da principal>/reino-integracao-<nome> com -b integracao-<nome> main (sem barra: uma branch
//    `integracao` antiga impediria integracao/<x>; branch existente ou em conflito = para e pede outro --nome;
//    integrações antigas com barra, como integracao/licoes, continuam sendo retomadas pelo --nome); node_modules por link
// c. aplica em ordem: commits além da main → cherry-pick; worktree com mudanças soltas → `diff --binary HEAD`
//    com `apply --3way` + cópia dos não rastreados. Com --commit, um commit por frente solta
//    ("Reino dos Unicórnios: <assunto>"); sem --commit, as soltas vão depois de todos os cherry-picks e ficam
//    sem commit. Conflito: para, lista e grava o estado (/tmp/reino-testes/integrar/<nome>.json); resolva na
//    worktree de integração (git add) e rode de novo com --continuar --nome <nome>. Conflito só no
//    jogo/index.html: um lado + npm run index, sozinho.
// d. npm run index; aviso se o falas.json mudou; npm test; npm run e2e (e o resumo.json dele, se houver);
//    relatório em /tmp/reino-testes/integrar/<nome>/relatorio.txt
// e. colisões: arquivo NÃO rastreado na árvore principal que a integração passa a rastrear. Igual byte a
//    byte = "mover" (só com --merge, para /tmp/reino-testes/antes-do-merge/<data>/); diferente = para.
// f. entrega (autorizada pelo CLAUDE.md da raiz): --trocar-base "<descrição>" (base do e2e = HEAD da integração,
//    com commit), --merge (move as colisões iguais, `merge --ff-only` na árvore principal e grava o versao.json
//    dela; exige npm test verde), --push (git push origin main; nunca --force).
// Sem entradas, retoma a integração <nome> (padrão: a de hoje) e roda só as fases que faltam ou foram pedidas.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const C = require('./comum');
const G = require('./integrar-git');

const FALAS = 'jogo/ferramentas/gerado/falas.json';
const AJUDA = `Uso: node jogo/ferramentas/fluxo/integrar.js <branch|/caminho/worktree> [--assunto "<texto>"]… [opções]
  --assunto "<t>"   assunto do commit da frente logo antes (com --commit; padrão: o tema da branch)
  --nome <n>        nome da integração (padrão: a data de hoje) → reino-integracao-<n>, integracao-<n>
  --commit          um commit por frente sem commit (e o do index.html refeito)
  --continuar       retoma depois de resolver um conflito (git add na worktree de integração)
  --sem-e2e         pula o npm run e2e
  Só com autorização escrita do Leandro:
  --trocar-base "<descrição>"   base do e2e = HEAD da integração (+ commit)
  --merge           move colisões iguais e git merge --ff-only na árvore principal (exige npm test verde)
  --push            git push origin main (nunca --force)`;

// argumentos: --assunto vale para a entrada logo antes dele
function lerArgv(argv) {
  const entradas = []; const resto = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--assunto') {
      if (!entradas.length || argv[i + 1] === undefined) throw new Error('--assunto vem logo depois de uma entrada, com o texto');
      entradas[entradas.length - 1].assunto = argv[++i];
    } else if (!argv[i].startsWith('--')) entradas.push({ entrada: argv[i] });
    else resto.push(argv[i]);
    if (['--nome', '--trocar-base'].includes(argv[i]) && argv[i + 1] !== undefined) resto.push(argv[++i]);
  }
  const op = C.lerArgs(resto, { booleanas: ['commit', 'merge', 'push', 'continuar', 'sem-e2e', 'ajuda'] });
  op.entradas = entradas;
  return op;
}

// roda e mostra ao vivo, guardando a saída num arquivo
function rodarTee(cmd, args, cwd, arqLog, quieto) {
  return new Promise((ok) => {
    const f = fs.createWriteStream(arqLog);
    const p = spawn(cmd, args, { cwd, env: C.ambiente(), stdio: ['ignore', 'pipe', 'pipe'] });
    const passa = (d) => { f.write(d); if (!quieto) process.stdout.write(d); };
    p.stdout.on('data', passa); p.stderr.on('data', passa);
    p.on('error', (e) => passa(String(e.message) + '\n'));
    p.on('close', (code) => f.end(() => ok(code === 0)));
  });
}
const temScript = (pasta, s) => { try { return !!JSON.parse(fs.readFileSync(path.join(pasta, 'package.json'), 'utf8')).scripts[s]; } catch (e) { return false; } };

// resumo.json da execução do e2e que acabou de rodar (a pasta e2e-* mais nova criada depois de `desde`)
function resumoE2e(desde) {
  let pastas = [];
  try { pastas = fs.readdirSync(C.PASTA_TESTES).filter((d) => d.startsWith('e2e-')); } catch (e) { return null; }
  const achado = pastas.map((d) => path.join(C.PASTA_TESTES, d, 'resumo.json'))
    .filter((f) => fs.existsSync(f) && fs.statSync(f).mtimeMs >= desde)
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
  return achado ? { arquivo: achado, texto: fs.readFileSync(achado, 'utf8') } : null;
}

async function integrar(argv, op2 = {}) {
  const cwd = op2.cwd || process.cwd();
  const quieto = !!op2.quieto;
  const saida = [];
  const log = (s) => { saida.push(s); if (!quieto) console.log(s); };
  const op = lerArgv(argv);
  if (op.ajuda || (!op.entradas.length && !op.nome && !op.continuar && !op.merge && !op.push && !op['trocar-base'])) return { codigo: 0, texto: AJUDA };
  const r = C.raizes(cwd);
  const nome = op.nome || C.hoje();
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(nome)) throw new Error(`--nome inválido: ${nome}`);
  const pasta = path.join(r.mae, `reino-integracao-${nome}`);
  const dirEstado = path.join(C.PASTA_TESTES, 'integrar');
  const arqEstado = path.join(dirEstado, `${nome}.json`);
  const dirRel = path.join(dirEstado, nome);
  fs.mkdirSync(dirRel, { recursive: true });
  let estado = fs.existsSync(arqEstado) ? JSON.parse(fs.readFileSync(arqEstado, 'utf8')) : null;
  // retomada: a branch gravada no estado (integrações antigas usavam integracao/<nome>)
  const branch = (estado && estado.branch) || `integracao-${nome}`;
  const salvar = () => fs.writeFileSync(arqEstado, JSON.stringify(estado, null, 1) + '\n');
  const sujaPrincipal = () => G.mudancas(r.principal).filter((l) => !l.startsWith('??'));
  let codigo = 0;

  const fim = (c) => {
    codigo = c;
    const rel = path.join(dirRel, 'relatorio.txt');
    const cab = [`=== integração ${nome} — ${new Date().toISOString()}`, `worktree ${pasta} (branch ${branch})`, ''];
    fs.appendFileSync(rel, cab.concat(saida).join('\n') + '\n\n');   // cada execução acrescenta a sua parte
    if (!quieto) console.log(`\nrelatório: ${rel}`);
    return { codigo, texto: saida.join('\n'), estado, pasta, branch, relatorio: rel };
  };

  /* ---------- a + b: começo ---------- */
  if (op.entradas.length) {
    if (estado || fs.existsSync(pasta) || C.gitOk(r.repo, 'show-ref', '--verify', '--quiet', `refs/heads/${branch}`)) {
      throw new Error(`a integração "${nome}" já existe (${pasta}): use --continuar --nome ${nome} ou outro --nome`);
    }
    const emConflito = G.branchesEmConflito(r.repo, branch);
    if (emConflito.length) {
      throw new Error(`não dá para criar a branch ${branch}: já existe ${emConflito.join(', ')} (o git não deixa as duas juntas).\n` +
        `  Nada foi mudado. Use outro nome, ex.: --nome ${nome}-2 (não renomeio nem apago branch sozinho).`);
    }
    const suja = sujaPrincipal();
    if (suja.length) throw new Error(`a árvore principal tem mudança em arquivo rastreado (${r.principal}):\n  ${suja.join('\n  ')}`);
    const frentes = op.entradas.map((e) => Object.assign(G.classificar(r, 'main', e.entrada, cwd), e.assunto ? { assunto: e.assunto } : {}));
    frentes.forEach((f) => f.aviso.forEach(log));
    const vivos = frentes.filter((f) => f.pasta).flatMap((f) => C.processosNaPasta(f.pasta).map((p) => ({ ...p, frente: f.entrada })));
    if (vivos.length) {
      log('✘ processos vivos nas worktrees das frentes (espere terminarem; não derrube o que não é seu):');
      vivos.forEach((p) => log(`  PID ${p.pid} [${p.frente}] ${p.cmd}`));
      return fim(1);
    }
    const passos = [];
    frentes.forEach((f) => { if (f.commits.length) passos.push({ tipo: 'commits', entrada: f.entrada, commits: f.commits }); });
    frentes.forEach((f) => { if (f.solto) passos.push({ tipo: 'solto', entrada: f.entrada, pasta: f.pasta, assunto: f.assunto }); });
    if (op.commit) passos.sort((a, b) => op.entradas.findIndex((e) => e.entrada === a.entrada) - op.entradas.findIndex((e) => e.entrada === b.entrada) || (a.tipo === 'commits' ? -1 : 1));
    frentes.filter((f) => !f.commits.length && !f.solto).forEach((f) => log(`⚠ ${f.entrada}: nada além da main (nenhum commit novo nem mudança solta)`));
    C.git(r.repo, 'worktree', 'add', '-q', pasta, '-b', branch, 'main');
    log(`✔ worktree de integração ${pasta} (${branch}, da main ${C.git(pasta, 'rev-parse', '--short', 'HEAD')})`);
    log('• ' + C.prepararNodeModules(r, pasta, false));
    estado = { nome, pasta, branch, main: C.git(r.repo, 'rev-parse', 'main'), commit: !!op.commit, passos, feito: 0, pendente: false, conferido: null };
    salvar();
  } else if (!estado) {
    throw new Error(`não há integração "${nome}" para retomar (${arqEstado}); passe as frentes`);
  } else log(`• retomando a integração ${nome} (${estado.feito}/${estado.passos.length} passos feitos)`);

  const integ = estado.pasta;
  const parar = (res, passo) => {
    passo.applyFalhou = !!res.applyFalhou;   // o --continuar deste passo tenta o apply de novo
    estado.pendente = true; salvar();
    log(`✘ conflito ao aplicar ${passo.entrada}` + (res.erro ? `:\n${res.erro}` : ''));
    res.conflitos.forEach((f) => log(`  - ${f}`));
    if (res.applyFalhou) {
      log(`⚠ o apply falhou inteiro: NADA das mudanças em arquivos rastreados de ${passo.entrada} entrou (só os arquivos novos foram copiados).`);
      log(`  Traga-as para ${integ} (veja \`git -C ${passo.pasta} diff HEAD\`; ex.: restaure o arquivo que falta): o --continuar tenta o apply`);
      log('  de novo e só segue quando elas estiverem lá. Se NÃO devem entrar, não siga: integre de novo (outro --nome) sem esta frente ou com ela ajustada.');
    }
    log(`Resolva em ${integ} (conflito na lista de skills do CLAUDE.md = junte as duas listas), \`git add\` os arquivos e rode:`);
    log(`  node jogo/ferramentas/fluxo/integrar.js --continuar --nome ${nome}`);
    return fim(2);
  };

  /* ---------- c: aplicar ---------- */
  if (estado.pendente) {
    if (!op.continuar) throw new Error(`a integração "${nome}" parou num conflito: resolva e use --continuar`);
    const passo = estado.passos[estado.feito];
    const res = passo.applyFalhou ? G.aplicarSolto(integ, passo.pasta, log) : G.continuar(integ, log);
    if (!res.ok) return parar(res, passo);
    if (passo.tipo === 'solto' && estado.commit) log(`  • commit ${G.commitFrente(integ, passo.assunto) || '(nada a commitar)'}: ${passo.assunto}`);
    estado.feito++; estado.pendente = false; salvar();
  }
  for (; estado.feito < estado.passos.length; estado.feito++, salvar()) {
    const passo = estado.passos[estado.feito];
    log(`→ ${passo.entrada} (${passo.tipo === 'commits' ? 'commits' : 'mudanças sem commit'})`);
    const res = passo.tipo === 'commits' ? G.aplicarCommits(integ, passo.commits, log) : G.aplicarSolto(integ, passo.pasta, log);
    if (!res.ok) return parar(res, passo);
    if (passo.tipo === 'solto' && estado.commit) log(`  • commit ${G.commitFrente(integ, passo.assunto) || '(nada a commitar)'}: ${passo.assunto}`);
  }

  // o que a pessoa resolveu à mão (ex.: colisão diferente: o da árvore principal copiado + git add) vira commit;
  // só em integração começada com --commit (sem ele, as mudanças soltas das frentes não viram um commit só)
  if (op.continuar && estado.commit && G.mudancas(integ).length) {
    log(`  • commit ${G.commitFrente(integ, `resolução da integração ${nome}`)}: resolução da integração ${nome}`);
  }

  /* ---------- d: index, falas, test, e2e ---------- */
  const marca = () => C.git(integ, 'rev-parse', 'HEAD') + ' ' + G.mudancas(integ).join('|');
  if (!estado.conferido || estado.conferido.marca !== marca()) {
    if (temScript(integ, 'index')) {
      const x = C.rodar('npm', ['run', '--silent', 'index'], { cwd: integ });
      log(x.ok ? '✔ npm run index' : `✘ npm run index falhou:\n${x.erro || x.saida}`);
      if (estado.commit && G.mudancas(integ).length && G.mudancas(integ).every((l) => l.endsWith(' ' + G.INDEX))) {
        log(`  • commit ${G.commitFrente(integ, `index.html refeito do manifesto (integração ${nome})`)}: index.html refeito`);
      }
    }
    if (!C.gitOk(integ, 'diff', '--quiet', 'main', '--', FALAS)) log(`⚠ ${FALAS} mudou: vozes: rode gravar-vozes (e validar-vozes para personagem novo)`);
    const conf = { marca: '', teste: null, e2e: null, resumo: null };
    if (temScript(integ, 'test')) {
      log('… npm test');
      conf.teste = await rodarTee('npm', ['test'], integ, path.join(dirRel, 'npm-test.txt'), quieto);
      log(`${conf.teste ? '✔' : '✘'} npm test (saída em ${path.join(dirRel, 'npm-test.txt')})`);
    } else log('⚠ sem script "test" no package.json: npm test pulado');
    if (op['sem-e2e']) log('• npm run e2e pulado (--sem-e2e)');
    else if (temScript(integ, 'e2e')) {
      log('… npm run e2e');
      const desde = Date.now();
      conf.e2e = await rodarTee('npm', ['run', 'e2e'], integ, path.join(dirRel, 'e2e.txt'), quieto);
      log(`${conf.e2e ? '✔ e2e idêntico' : '✘ e2e com diferença'} (saída em ${path.join(dirRel, 'e2e.txt')})`);
      const rs = resumoE2e(desde);
      if (rs) { conf.resumo = rs.arquivo; log(`resumo do e2e (${rs.arquivo}):\n${rs.texto.trimEnd()}`); }
    }
    conf.marca = marca();
    estado.conferido = conf; salvar();
  } else log(`• index/test/e2e já conferidos neste mesmo estado (npm test ${estado.conferido.teste ? 'verde' : 'vermelho'})`);

  /* ---------- f1: trocar a base do e2e ---------- */
  if (op['trocar-base']) {
    const t = G.trocarBase(integ, op['trocar-base'], log);
    log(`✔ base do e2e em ${t.curto}: commit ${t.commit}`);
    estado.baseTrocada = t; salvar();
  }

  /* ---------- e: colisões com a árvore principal ---------- */
  const col = G.colisoes(r.principal, integ);
  col.iguais.forEach((f) => log(`• colisão igual (mover antes do merge): ${f}`));
  if (col.diferentes.length) {
    log('✘ colisões DIFERENTES (arquivo não rastreado na árvore principal com outro conteúdo na integração):');
    col.diferentes.forEach((f) => log(`  - ${f}`));
    codigo = 1;
  }

  /* ---------- f2: merge e push ---------- */
  if (op.merge) {
    const motivos = [];
    if (col.diferentes.length) motivos.push('colisões diferentes');
    if (G.mudancas(integ).length) motivos.push('a integração tem mudanças sem commit (use --commit)');
    if (sujaPrincipal().length) motivos.push('a árvore principal tem mudança em arquivo rastreado');
    const ramo = C.rodar('git', ['-C', r.principal, 'symbolic-ref', '--short', 'HEAD']).saida.trim();
    if (ramo !== 'main') motivos.push(`a árvore principal está em "${ramo}", não na main`);
    if (!C.gitOk(r.repo, 'merge-base', '--is-ancestor', 'main', branch)) motivos.push('a main andou: não dá fast-forward (integre de novo com outro --nome)');
    if (!motivos.length && estado.conferido.marca !== marca()) {
      log('… npm test de novo (o HEAD mudou depois da conferência)');
      estado.conferido.teste = temScript(integ, 'test') && await rodarTee('npm', ['test'], integ, path.join(dirRel, 'npm-test-merge.txt'), quieto);
      estado.conferido.marca = marca(); salvar();
    }
    if (!estado.conferido.teste) motivos.push('npm test não está verde');
    if (motivos.length) { log(`✘ --merge recusado: ${motivos.join('; ')}`); return fim(1); }
    let destino = null;
    if (col.iguais.length) { destino = G.moverColisoes(r.principal, col.iguais, op2.antesDoMerge); log(`• ${col.iguais.length} colisão(ões) igual(is) movida(s) para ${destino}`); }
    const m = C.rodar('git', ['-C', r.principal, 'merge', '--ff-only', branch]);
    if (!m.ok) {
      if (destino) G.devolver(r.principal, destino, col.iguais);
      log(`✘ git merge --ff-only falhou (colisões devolvidas):\n${(m.erro || m.saida).trim()}`);
      return fim(1);
    }
    log(`✔ main = ${C.git(r.principal, 'rev-parse', '--short', 'HEAD')} (merge --ff-only de ${branch})`);
    estado.mergeado = C.git(r.principal, 'rev-parse', 'HEAD'); salvar();
    // impressão digital nova: as abas abertas do servidor de casa percebem e se atualizam (cena-e-motor.md §15)
    const gerador = path.join(r.principal, 'jogo/ferramentas/gerar-versao.js');
    if (fs.existsSync(gerador)) {
      const v = C.rodar('node', [gerador], { cwd: r.principal });
      log(v.ok ? '✔ npm run versao na árvore principal' : `⚠ npm run versao falhou (rode à mão):\n${(v.erro || v.saida).trim()}`);
    }
  }
  if (op.push) {
    if (C.git(r.repo, 'rev-parse', 'main') !== C.git(r.repo, 'rev-parse', branch)) { log('✘ --push recusado: a main não é o HEAD da integração (faça o --merge antes)'); return fim(1); }
    const p = C.rodar('git', ['-C', r.principal, 'push', 'origin', 'main']);
    log(p.ok ? '✔ git push origin main' : `✘ git push falhou:\n${(p.erro || p.saida).trim()}`);
    if (!p.ok) return fim(1);
  }

  if (!op.merge) {
    log('');
    log('Próximos passos (cada flag só com autorização escrita do Leandro):');
    if (!estado.commit && G.mudancas(integ).length) log(`  commit: refaça com --commit, ou faça os commits em ${integ}`);
    log(`  node jogo/ferramentas/fluxo/integrar.js --nome ${nome} [--trocar-base "<descrição>"] --merge [--push]`);
  }
  if (estado.conferido && estado.conferido.teste === false) codigo = 1;
  return fim(codigo);
}

if (require.main === module) {
  integrar(process.argv.slice(2)).then((r) => {
    if (r.texto === AJUDA) console.log(AJUDA);
    process.exit(r.codigo);
  }, (e) => { console.error('✘ ' + e.message); process.exit(1); });
}

module.exports = { integrar, lerArgv };
