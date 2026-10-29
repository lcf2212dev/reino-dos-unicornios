// Integra frentes numa worktree nova a partir da main, em histórico LINEAR (npm run integrar -- …).
// Uso: node jogo/ferramentas/fluxo/integrar.js <branch|/caminho/worktree> [--assunto "<texto>"]… [opções]
//   --assunto "<t>"      assunto do commit da frente logo antes (com --commit; padrão: o tema da branch)
//   --nome <n>           nome da integração (padrão: a data de hoje) → reino-integracao-<n>, integracao-<n>
//   --commit             um commit por frente sem commit
//   --vozes              fala sem áudio: npm run vozes (grava, empacota, confere) + commit "vozes …", antes do npm test
//   --continuar          retoma depois de um conflito (resolva e git add) ou da conferência das vozes reprovada
//   --sem-e2e            pula o npm run e2e
//   --esperado '<re>'    e2e diferente: recusa (código 1, sem trocar a base nem merge) se alguma diferença não casar
//                        com o regex (nome da imagem sem .png, <tamanho>/<nome> ou caminho do arquivo; resumo.json)
//   Entrega (autorizada pelo CLAUDE.md da raiz):
//   --trocar-base "<d>"  aceita o e2e atual: e2e.js --aceitar "<d>" (base `@`) dentro do ÚLTIMO commit da integração
//   --merge              move colisões iguais e merge --ff-only na árvore principal (npm test verde, nenhuma fala
//                        sem áudio, nada solto)
//   --push               git push origin main (nunca --force)
// Sem entradas, retoma a integração <nome> (padrão: a de hoje) e roda só as fases que faltam ou foram pedidas.
// a. e2e.js --podar (o /tmp é RAM); confere: árvore principal sem mudança em arquivo rastreado (pastas de material
//    e config local não rastreadas podem); cada entrada existe; nenhum processo vivo nas worktrees das frentes
// b. worktree <ao lado da principal>/reino-integracao-<nome> com -b integracao-<nome> main (branch existente ou em
//    conflito = para e pede outro --nome; integrações antigas com barra, integracao/<x>, são retomadas pelo --nome);
//    node_modules por link. O estado (para o --continuar) mora no git dela: `git rev-parse --git-path reino-integrar`.
// c. aplica em ordem: commits além da main → cherry-pick; worktree com mudanças soltas → `diff --binary HEAD` com
//    `apply --3way` + cópia dos não rastreados. Com --commit, um commit por frente solta ("Reino dos Unicórnios:
//    <assunto>", sem repetir o prefixo); sem --commit, as soltas vão depois dos cherry-picks e ficam sem commit.
//    Conflito: para e lista; resolva na worktree de integração (git add) e rode --continuar --nome <nome>.
//    Resolvidos sozinhos: jogo/index.html (um lado + npm run index) e as vozes (js/voz/*.js, falas.json e
//    vozes-indice.json: índice juntado, um lado do resto, listar-falas + empacotar-vozes; a mesma fala com áudios
//    diferentes = para).
// d. npm run index (mudou: entra no último commit); vozes (listar-falas, conta das falas sem áudio; --vozes grava);
//    npm test; npm run e2e (e o resumo.json dele). Relatório e saídas em /tmp/reino-testes/integrar/<nome>/.
//    O npm test não roda de novo se estava verde e depois só mudou o base-referencia.txt, como o --aceitar gravou.
// e. colisões: arquivo NÃO rastreado na árvore principal que a integração passa a rastrear. Igual byte a byte =
//    "mover" (só com --merge, para /tmp/reino-testes/antes-do-merge/<data>/); diferente = para.
// f. entrega: --esperado, --trocar-base, --merge, --push (acima).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const C = require('./comum');
const G = require('./integrar-git');
const V = require('./integrar-vozes');
const E = require('./integrar-e2e');

const AJUDA = require('../ajuda').textoDoTopo(__filename);

// argumentos: --assunto vale para a entrada logo antes dele
function lerArgv(argv) {
  const entradas = []; const resto = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--assunto') {
      if (!entradas.length || argv[i + 1] === undefined) throw new Error('--assunto vem logo depois de uma entrada, com o texto');
      entradas[entradas.length - 1].assunto = argv[++i];
    } else if (!argv[i].startsWith('--')) entradas.push({ entrada: argv[i] });
    else resto.push(argv[i]);
    if (['--nome', '--trocar-base', '--esperado'].includes(argv[i]) && argv[i + 1] !== undefined) resto.push(argv[++i]);
  }
  const op = C.lerArgs(resto, { booleanas: ['commit', 'merge', 'push', 'continuar', 'sem-e2e', 'vozes', 'ajuda'] });
  op.entradas = entradas;
  return op;
}
const temScript = (pasta, s) => { try { return !!JSON.parse(fs.readFileSync(path.join(pasta, 'package.json'), 'utf8')).scripts[s]; } catch (e) { return false; } };

// estado da integração, dentro do git da worktree dela (sobrevive a reinício); null se a pasta não é worktree
function arqEstadoDe(pasta) {
  if (!fs.existsSync(pasta)) return null;
  try { return path.join(path.resolve(pasta, C.git(pasta, 'rev-parse', '--git-path', 'reino-integrar')), 'estado.json'); } catch (e) { return null; }
}

async function integrar(argv, op2 = {}) {
  const cwd = op2.cwd || process.cwd();
  const quieto = !!op2.quieto;
  const saida = [];
  const log = (s) => { saida.push(s); if (!quieto) console.log(s); };
  const op = lerArgv(argv);
  if (op.ajuda || (!op.entradas.length && !op.nome && !op.continuar && !op.merge && !op.push && !op['trocar-base'] && !op.vozes)) return { codigo: 0, texto: AJUDA };
  const esperado = op.esperado !== undefined ? new RegExp(op.esperado) : null;
  const r = C.raizes(cwd);
  const nome = op.nome || C.hoje();
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(nome)) throw new Error(`--nome inválido: ${nome}`);
  const pasta = path.join(r.mae, `reino-integracao-${nome}`);
  const dirRel = path.join(C.PASTA_TESTES, 'integrar', nome);
  const arqVelho = path.join(C.PASTA_TESTES, 'integrar', `${nome}.json`);   // estado das integrações de antes (no /tmp)
  fs.mkdirSync(dirRel, { recursive: true });
  let arqEstado = arqEstadoDe(pasta);
  const ler = (f) => (f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null);
  let estado = ler(arqEstado) || ler(arqVelho);
  // retomada: a branch gravada no estado (integrações antigas usavam integracao/<nome>)
  const branch = (estado && estado.branch) || `integracao-${nome}`;
  const salvar = () => {
    arqEstado = arqEstado || arqEstadoDe(estado.pasta);
    fs.mkdirSync(path.dirname(arqEstado), { recursive: true });
    fs.writeFileSync(arqEstado, JSON.stringify(estado, null, 1) + '\n');
  };
  const sujaPrincipal = () => G.mudancas(r.principal).filter((l) => !l.startsWith('??'));
  let codigo = 0;

  const fim = (c) => {
    codigo = c;
    const rel = path.join(dirRel, 'relatorio.txt');
    const cab = [`=== integração ${nome} — ${new Date().toISOString()}`, `worktree ${pasta} (branch ${branch})`, ''];
    fs.appendFileSync(rel, cab.concat(saida).join('\n') + '\n\n');   // cada execução acrescenta a sua parte
    if (!quieto) console.log(`\nrelatório: ${rel}`);
    return { codigo, texto: saida.join('\n'), estado, pasta, branch, relatorio: rel, arqEstado };
  };

  E.podar(r.repo, log);

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
    throw new Error(`não há integração "${nome}" para retomar (${arqEstado || pasta}); passe as frentes`);
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
  if (estado.vozesParada && !op.continuar) throw new Error(`a integração "${nome}" parou nas vozes: confira e use --continuar`);
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
  // só em integração começada com --commit (sem ele, as mudanças soltas das frentes não viram um commit só).
  // Parada nas vozes: o que ficou solto é das vozes, e vai no commit delas.
  if (op.continuar && estado.commit && !estado.vozesParada && G.mudancas(integ).length) {
    log(`  • commit ${G.commitFrente(integ, `resolução da integração ${nome}`)}: resolução da integração ${nome}`);
  }

  /* ---------- d: index, vozes, test, e2e ---------- */
  // marca do que foi conferido: a árvore do HEAD e o que está solto (semBase: fora o base-referencia.txt)
  const marca = (semBase) => {
    const fora = (l, sep) => semBase && l.endsWith(sep + G.BASE_E2E);
    const arvore = C.git(integ, 'ls-tree', '-r', 'HEAD').split('\n').filter((l) => !fora(l, '\t'));
    const soltas = G.mudancas(integ).filter((l) => !fora(l, ' '));
    return crypto.createHash('sha1').update(arvore.join('\n') + '\n--\n' + soltas.join('\n')).digest('hex');
  };
  const mesmo = () => estado.conferido.marca === marca();
  // depois da conferência só mudou o base-referencia.txt, e exatamente como o --aceitar gravou
  const soBaseAceita = () => !!(estado.baseTrocada && estado.baseTrocada.blob) && estado.conferido.marcaSemBase === marca(true) &&
    C.gitOk(integ, 'diff', '--quiet', 'HEAD', '--', G.BASE_E2E) && C.git(integ, 'rev-parse', `HEAD:${G.BASE_E2E}`) === estado.baseTrocada.blob;
  const marcar = (conf) => { conf.marca = marca(); conf.marcaSemBase = marca(true); };
  // a base aceita não muda o jogo: index/vozes/test/e2e não se refazem por ela (o npm test vermelho, sim: no --merge)
  const precisa = () => !estado.conferido || !(mesmo() || soBaseAceita());
  if (precisa() && temScript(integ, 'index')) {
    const x = C.rodar('npm', ['run', '--silent', 'index'], { cwd: integ });
    log(x.ok ? '✔ npm run index' : `✘ npm run index falhou:\n${x.erro || x.saida}`);
    if (estado.commit && G.mudancas(integ).length && G.mudancas(integ).every((l) => l.endsWith(' ' + G.INDEX))) {
      log(`  • index.html refeito, no último commit da integração (${G.emendar(integ, [G.INDEX], estado.main, `index.html refeito do manifesto (integração ${nome})`)})`);
    }
  }
  if (precisa() || op.vozes || estado.vozesParada) {
    const v = await V.faseVozes(integ, { log, nome, quieto, dirRel, gravar: op.vozes || !!estado.vozesParada, commit: estado.commit, mensagem: G.mensagem });
    estado.vozesParada = !!v.parar; salvar();
    if (v.parar) return fim(2);
  }
  if (precisa()) {
    const conf = { marca: '', teste: null, e2e: null, resumo: null, e2eSaida: null };
    if (temScript(integ, 'test')) {
      log('… npm test');
      conf.teste = await C.rodarTee('npm', ['test'], integ, path.join(dirRel, 'npm-test.txt'), quieto);
      log(`${conf.teste ? '✔' : '✘'} npm test (saída em ${path.join(dirRel, 'npm-test.txt')})`);
    } else log('⚠ sem script "test" no package.json: npm test pulado');
    if (op['sem-e2e']) log('• npm run e2e pulado (--sem-e2e)');
    else if (temScript(integ, 'e2e')) {
      log('… npm run e2e');
      conf.e2eSaida = path.join(dirRel, 'e2e.txt');
      conf.e2e = await C.rodarTee('npm', ['run', 'e2e'], integ, conf.e2eSaida, quieto);
      log(`${conf.e2e ? '✔ e2e idêntico' : '✘ e2e com diferença'} (saída em ${conf.e2eSaida})`);
      conf.resumo = E.resumo(conf.e2eSaida);
      if (conf.resumo) log(`resumo do e2e (${conf.resumo}):\n${fs.readFileSync(conf.resumo, 'utf8').trimEnd()}`);
    }
    marcar(conf);
    estado.conferido = conf; salvar();
  } else log(`• index/test/e2e já conferidos neste mesmo estado (npm test ${estado.conferido.teste ? 'verde' : 'vermelho'})`);

  /* ---------- f0: as diferenças do e2e são as esperadas? ---------- */
  if (esperado) {
    if (estado.conferido.e2e === null) log('• --esperado: o e2e não rodou (--sem-e2e): nada a conferir');
    else {
      const x = E.conferirEsperado(esperado, estado.conferido);
      if (!x.ok) {
        log(`✘ --esperado /${esperado.source}/: ${x.fora.length} diferença(s) do e2e fora do esperado (base e merge recusados):`);
        x.fora.slice(0, 50).forEach((f) => log(`  - ${f}`));
        return fim(1);
      }
      if (x.total) log(`✔ as ${x.total} diferença(s) do e2e casam com --esperado /${esperado.source}/`);
    }
  }

  /* ---------- f1: aceitar o e2e atual como base ---------- */
  if (op['trocar-base']) {
    if (estado.mergeado) throw new Error('--trocar-base: esta integração já está na main');
    estado.baseTrocada = E.aceitarBase(integ, op['trocar-base'], estado.main, log); salvar();
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
    const semAudio = V.pendentes(integ).length;
    if (semAudio) motivos.push(`${semAudio} fala(s) sem áudio (rode com --vozes)`);
    if (sujaPrincipal().length) motivos.push('a árvore principal tem mudança em arquivo rastreado');
    const ramo = C.rodar('git', ['-C', r.principal, 'symbolic-ref', '--short', 'HEAD']).saida.trim();
    if (ramo !== 'main') motivos.push(`a árvore principal está em "${ramo}", não na main`);
    if (!C.gitOk(r.repo, 'merge-base', '--is-ancestor', 'main', branch)) motivos.push('a main andou: não dá fast-forward (integre de novo com outro --nome)');
    // npm test de novo se algo mudou depois dele; só a base aceita com o test já verde não conta (o passo de dados
    // do npm test compara com a base: vermelho por ela tem de rodar de novo)
    if (!motivos.length && !mesmo() && !(soBaseAceita() && estado.conferido.teste === true)) {
      log(soBaseAceita() ? '… npm test de novo (estava vermelho; a base do e2e foi aceita depois dele)' : '… npm test de novo (o HEAD mudou depois da conferência)');
      estado.conferido.teste = temScript(integ, 'test') && await C.rodarTee('npm', ['test'], integ, path.join(dirRel, 'npm-test-merge.txt'), quieto);
      marcar(estado.conferido); salvar();
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
  }
  if (op.push) {
    if (C.git(r.repo, 'rev-parse', 'main') !== C.git(r.repo, 'rev-parse', branch)) { log('✘ --push recusado: a main não é o HEAD da integração (faça o --merge antes)'); return fim(1); }
    const p = C.rodar('git', ['-C', r.principal, 'push', 'origin', 'main']);
    log(p.ok ? '✔ git push origin main' : `✘ git push falhou:\n${(p.erro || p.saida).trim()}`);
    if (!p.ok) return fim(1);
  }

  if (!op.merge) {
    log('');
    log('Próximos passos (entrega autorizada pelo CLAUDE.md da raiz):');
    if (!estado.commit && G.mudancas(integ).length) log(`  commit: refaça com --commit, ou faça os commits em ${integ}`);
    log(`  node jogo/ferramentas/fluxo/integrar.js --nome ${nome} [--vozes] [--esperado '<regex>'] [--trocar-base "<descrição>"] --merge [--push]`);
  }
  if (estado.conferido && estado.conferido.teste === false) codigo = 1;
  return fim(codigo);
}

if (require.main === module) {
  require('../ajuda').ajuda(__filename);
  integrar(process.argv.slice(2)).then((r) => {
    if (r.texto === AJUDA) console.log(AJUDA);
    process.exit(r.codigo);
  }, (e) => { console.error('✘ ' + e.message); process.exit(1); });
}

module.exports = { integrar, lerArgv };
