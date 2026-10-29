// E2E de um comando só: referências do jogo ATUAL comparadas com as do commit BASE (tem que dar idêntico).
// Uso (da raiz do repositório):
//   node jogo/ferramentas/testes/e2e.js                  completo: dados, imagens (celular, tablet, notebook) e vozes
//   node jogo/ferramentas/testes/e2e.js --so-dados       só dados + vozes (rápido; parte do npm test)
//   … --base <hash>          outra base (padrão: jogo/ferramentas/testes/base-referencia.txt: um hash, ou "@" = o
//                            commit que mudou aquele arquivo por último; "@" mudado e sem commit = o HEAD, com aviso)
//   … --desempenho           também o A/B de desempenho contra a base (desempenho.js, 6 cenas, ~7 min)
//   … --tamanhos celular     só alguns tamanhos nas imagens   · --raiz <pasta jogo>: outro jogo "atual"
//   … --cenas <regex>        só as imagens cujo nome (sem .png) casa, ex.: --cenas 'interior-loja|tela-bau'.
//                            Só imagens: dados e vozes ficam de fora (rode --so-dados à parte, ~30 s). A página
//                            faz o mesmo caminho (as outras cenas andam o relógio sem foto) e cada aba para quando
//                            o tamanho já tem todas as pedidas; a base é a completa (em cache, ou capturada antes
//                            com todas as vagas).
//   … --mudancas             o --cenas escolhido sozinho: só as imagens das partes que mudaram desde o merge-base
//                            com a main (com mudanças sem commit e arquivos novos; e2e-mudancas.js tem o mapa).
//                            Imprime o regex e o porquê. Mudou css/motor/ui/nucleo/…: tudo; só fora de jogo/ ou em
//                            jogo/ferramentas/: --so-dados. Volta rápida; o fecho é o e2e completo.
//   … --paralelo N           abas ao mesmo tempo (padrão: metade das CPUs, até 12). Cada grupo de cenas (e cada
//                            lote de interiores) abre a própria aba com servidor e banco próprios.
// Relatório: no topo, "Resumo: N imagens diferentes — só HUD a · só dock b · só balão c · outras d" por tamanho
// (regiões em referencias-regioes.js); as de região conhecida só como contagem + 5 nomes, as "outras" na lista
// com as caixas (px CSS). O resumo vai também para e2e-<data>/resumo.json.
// Diferença em imagem: o relatório dá o caminho da base, do atual e de e2e-<data>/diferencas/<tamanho>/<nome>.png
// (a imagem atual apagada com os pixels diferentes em magenta).
// Tempo: a fila mapa + interiores vai em lotes (REINO_LOTES_MAPA, referencias-cenas.js); REINO_TEMPOS=1 mostra quanto
// levou cada grupo.
//   … --manter               guarda a pasta e2e-<data> mesmo quando dá idêntico (sem ele, idêntico = apagada)
//   … --recapturar           ignora o cache e o "idêntico por construção": base e atual capturados agora, em
//                            e2e-<data>/base e e2e-<data>/atual (para conferir o próprio e2e ou ruído); com --cenas,
//                            só as cenas pedidas dos dois lados
//   A chave do atual é conferida de novo no fim da captura: a árvore mudou no meio, a captura não é guardada.
//   … --aceitar "<descrição>"  aceita o jogo como está: grava "@" em base-referencia.txt com "# @ = <descrição>"
//                            (comentários intactos, grava atômico, mostra o diff); sem commit e sem rodar o e2e. A
//                            base passa a ser o commit que levar esse arquivo (o commit da mudança)
//   … --trocar-base <hash> "<descrição>"   só troca a base (trocar-base.js: commit ancestral de HEAD, comentários
//                            intactos, "# <curto> = <descrição>" acima do hash, grava atômico, mostra o diff; sem commit)
//   … --podar                só poda e sai: e2e-*, temporárias dos testes, capturas e cópias de base sem uso (regras
//                            no topo do e2e-disco.js; a base da main e o harness da main nunca saem); lista antes o
//                            que apaga (resumo por tipo acima de 50) e quanto libera
// Disco: abaixo de 1,5 GB livres o e2e nem começa (diz o que podar). A pasta é /tmp/reino-testes ou a de
// REINO_TESTES (só dentro de /tmp ou /dev/shm; ver guardas.js), ex.: REINO_TESTES=/dev/shm/reino-testes.
// Como funciona (tudo na pasta de testes):
//   1. conteúdo = hash das árvores git de jogo/index.html, css/, js/ e servidor/ (da base: do commit; do atual: da
//      árvore de trabalho, com o que não tem commit). Atual com o conteúdo da base e harness igual ao da main =
//      "idêntico por construção": sai OK sem abrir navegador
//   2. cap-<conteúdo>/<partes>-h<harness>-n<navegador>/ = captura de um conteúdo (e2e-cache.js), feita UMA vez com
//      a trava da chave (outra worktree pedindo a mesma espera e reusa). Vale para a base e para o atual: a captura
//      do atual fica guardada e vira a base pronta quando aquele conteúdo for aceito (--aceitar ou --trocar-base)
//   3. base-<hash>/jogo/ = `git archive` da base (só quando a captura dela não está em cache, ou com --desempenho)
//   4. e2e-<data>/atual/ = o atual (hard links da captura em cache; com --cenas sem cache: só as pedidas)
//   5. compara (referencias-comparar.js) e diz o resultado; código de saída 0 = idêntico
// Seguro: servidores de teste em portas livres com banco em /tmp, navegador isolado (ver guardas.js).
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { PASTA_TESTES, conferirPastaTmp } = require('./guardas');
const { capturar, PARALELO_PADRAO } = require('./referencias');
const { comparar } = require('./referencias-comparar');
const disco = require('./e2e-disco');
const B = require('./e2e-base');
const cache = require('./e2e-cache');

const REPO = path.resolve(__dirname, '..', '..', '..');

// compatível com quem já chamava: hash da base pedida ou do base-referencia.txt
const hashBase = (pedido) => B.resolverBase({ repo: REPO, pedido });

// cópia do jogo da base (uma vez; a pasta pronta tem a marca .base-pronta)
function extrairBase(base) {
  const destino = conferirPastaTmp(path.join(PASTA_TESTES, `base-${base.curto}`));
  const marca = path.join(destino, 'jogo', '.base-pronta');
  if (fs.existsSync(marca)) { disco.marcarUso(destino); console.log(`• base ${base.curto}: reusando ${destino}/jogo`); return path.join(destino, 'jogo'); }
  console.log(`• base ${base.curto}: extraindo com git archive para ${destino}/jogo`);
  const parcial = conferirPastaTmp(`${destino}.parcial-${process.pid}`);
  fs.mkdirSync(parcial, { recursive: true });
  const arq = spawnSync('git', ['-C', REPO, 'archive', base.cheio, ...B.PARTES_JOGO], { maxBuffer: 1 << 30 });
  if (arq.status !== 0) throw new Error('git archive falhou: ' + arq.stderr);
  const tar = spawnSync('tar', ['-x', '-C', parcial], { input: arq.stdout });
  if (tar.status !== 0) throw new Error('tar falhou: ' + tar.stderr);
  fs.writeFileSync(path.join(parcial, 'jogo', '.base-pronta'), base.cheio + '\n');
  if (!fs.existsSync(marca)) fs.renameSync(parcial, destino);   // outra execução pode ter terminado antes
  return path.join(destino, 'jogo');
}

// mesma conta do harnessMain() da poda (e2e-disco.js), sobre os arquivos desta worktree
const hashHarness = () => disco.hashHarness((f) => fs.readFileSync(path.join(__dirname, f)));

// nome da captura: partes (com imagens, sempre a completa: a mesma serve ao --cenas), tamanhos, harness, navegador
function subCaptura(op, harness, nav) {
  const so = op.so.includes('imagens') ? 'dados,imagens,vozes' : op.so;
  return { so, nome: so.replace(/,/g, '-') + (op.tamanhos ? '-' + op.tamanhos.replace(/,/g, '-') : '') + `-h${harness}-n${nav}` };
}

// nomes das imagens de uma captura completa que casam com o filtro, por tamanho (cada aba para quando tem todas)
function nomesPedidos(cap, filtro) {
  const faltam = {};
  fs.readdirSync(path.join(cap, 'imagens')).forEach((tm) => {
    faltam[tm] = new Set(fs.readdirSync(path.join(cap, 'imagens', tm)).map((f) => path.basename(f, '.png')).filter((n) => filtro.test(n)));
  });
  return faltam;
}

// --podar: lista o que o e2e criou e não serve mais, quanto libera, e apaga
function podar() {
  const protegidos = [], basesProtegidas = [];
  [B.baseDaMain(REPO), (() => { try { return hashBase(); } catch (e) { return null; } })()].filter(Boolean).forEach((b) => {
    protegidos.push(B.conteudoCommit(REPO, b.cheio)); basesProtegidas.push(b.curto);
  });
  const plano = disco.planoPoda(PASTA_TESTES, { harness: hashHarness(), nav: B.versaoNavegador(REPO), protegidos, basesProtegidas });
  if (!plano.length) { console.log(`• nada a podar em ${PASTA_TESTES} (${disco.gb(disco.livre(PASTA_TESTES))} livres)`); return true; }
  if (plano.length <= 50) plano.forEach((x) => console.log(`  apagar ${x.caminho}  (${disco.gb(x.bytes)}; ${x.motivo})`));
  else { // muitas: resumo por tipo (nome sem o sufixo aleatório)
    const tipos = {};
    plano.forEach((x) => {
      const t = path.relative(PASTA_TESTES, x.caminho).replace(/-(?:[A-Za-z0-9]{6}|\d+|[0-9a-f]{8}|[0-9a-f]{16})$/, '-*');
      tipos[t] = tipos[t] || { n: 0, bytes: 0, motivo: x.motivo };
      tipos[t].n++; tipos[t].bytes += x.bytes;
    });
    Object.keys(tipos).sort((a, b) => tipos[b].bytes - tipos[a].bytes).forEach((t) =>
      console.log(`  apagar ${tipos[t].n}× ${path.join(PASTA_TESTES, t)}  (${disco.gb(tipos[t].bytes)}; ${tipos[t].motivo})`));
  }
  const total = disco.podar(plano);
  console.log(`✔ podado: ${plano.length} pasta(s), ${disco.gb(total)} liberados; ${disco.gb(disco.livre(PASTA_TESTES))} livres agora`);
  return true;
}

// --mudancas: escolhe so/filtro pelas partes do jogo que mudaram desde a main
function porMudancas(op) {
  const M = require('./e2e-mudancas');
  const arquivos = M.arquivosMudados(REPO);
  const e = M.escolher(arquivos, M.idsDoJogo());
  console.log(`• --mudancas (volta rápida; o fecho é o e2e completo): ${arquivos.length} arquivo(s) mudado(s) desde o merge-base com a main`);
  e.motivos.forEach((m) => console.log(`    ${m}`));
  if (e.modo === 'tudo') { console.log('  → e2e completo (dados, imagens e vozes)'); return { ...op, so: 'dados,imagens,vozes' }; }
  if (e.modo === 'dados') { console.log('  → nenhuma imagem: só dados e vozes (como --so-dados)'); return { ...op, so: 'dados,vozes' }; }
  console.log(`  → só as imagens que casam com /${e.regex.source}/ (dados e vozes: o npm test roda o --so-dados)`);
  return { ...op, so: 'imagens', filtro: e.regex };
}

async function e2e(op) {
  const inicio = Date.now();
  disco.conferirEspaco(PASTA_TESTES);
  const base = hashBase(op.base);
  if (base.aviso) console.log(`⚠ ${base.aviso}`);
  const raizAtual = path.resolve(op.raiz || path.join(__dirname, '..', '..'));
  const harness = hashHarness(), nav = B.versaoNavegador(REPO);
  const repoAtual = B.repoDoJogo(raizAtual);
  const contBase = B.conteudoCommit(REPO, base.cheio), contAtual = repoAtual ? B.conteudoArvore(repoAtual) : null;
  const escopo = `${op.so}${op.filtro ? ` só /${op.filtro.source}/` : ''}${op.desempenho ? ' + desempenho' : ''}`;
  const min = () => ((Date.now() - inicio) / 60000).toFixed(1);
  if (contAtual === contBase && !op.recapturar) {
    const main = disco.harnessMain();
    if (main === harness) {
      console.log(`\n✔ E2E OK: idêntico por construção — o jogo atual tem o mesmo conteúdo da base ${base.curto} ` +
        `(index.html, css, js e servidor: ${contAtual}) e o harness é o da main; nada capturado (${escopo}; ${min()} min)`);
      return true;
    }
    console.log(`• conteúdo igual ao da base, mas o harness (h${harness}) não é o da main (h${main}): capturo para exercitá-lo`);
  }
  const d = new Date(), n2 = (x) => String(x).padStart(2, '0');
  const quando = `${d.getFullYear()}${n2(d.getMonth() + 1)}${n2(d.getDate())}-${n2(d.getHours())}${n2(d.getMinutes())}${n2(d.getSeconds())}`;
  const pastaE2e = conferirPastaTmp(path.join(PASTA_TESTES, `e2e-${quando}-${process.pid}`));
  const atual = path.join(pastaE2e, 'atual');
  const sub = subCaptura(op, harness, nav);
  const dirBase = op.recapturar ? path.join(pastaE2e, 'base') : cache.pastaCaptura(PASTA_TESTES, contBase, sub.nome);
  const dirCacheAtual = contAtual && !op.recapturar ? cache.pastaCaptura(PASTA_TESTES, contAtual, sub.nome) : null;
  // atual sai do cache (ou entra nele) quando é completo, ou quando o completo já está pronto; com o conteúdo da
  // base (harness mudado) o atual é capturado à parte: a mesma captura dos dois lados não conferiria nada
  const atualNoCache = dirCacheAtual && dirCacheAtual !== dirBase && (!op.filtro || cache.pronta(dirCacheAtual));
  const baseFria = !cache.pronta(dirBase), atualFrio = !(atualNoCache && cache.pronta(dirCacheAtual));
  // base e atual capturando juntos dividem as vagas (Chromium demais ao mesmo tempo falha nas fotos); com --cenas
  // a base vem antes e sozinha, com todas
  let paralelo = op.paralelo;
  if (!paralelo && baseFria && atualFrio && !op.filtro) paralelo = Math.max(1, Math.floor(PARALELO_PADRAO / 2));
  const capBase = async (faltam) => {
    const fn = (saida) => capturar(saida, { raiz: extrairBase(base), so: sub.so, tamanhos: op.tamanhos, paralelo });
    if (op.recapturar) {
      console.log(`• base ${base.curto}: capturando agora em ${dirBase}${op.filtro ? ' (só as cenas pedidas)' : ''}`);
      if (op.filtro) await capturar(dirBase, { raiz: extrairBase(base), so: op.so, tamanhos: op.tamanhos, paralelo, filtro: op.filtro, faltam });
      else await fn(dirBase);
      return dirBase;
    }
    console.log(baseFria ? `• base ${base.curto}: capturando uma vez em ${dirBase}` : `• base ${base.curto}: reusando ${dirBase}`);
    return (await cache.obterCaptura(dirBase, fn)).destino;
  };
  const capAtual = async (faltam) => {
    if (!atualNoCache) {
      console.log(`• jogo atual (${raizAtual}): capturando em ${atual}`);
      return capturar(atual, { raiz: raizAtual, so: op.so, tamanhos: op.tamanhos, paralelo, filtro: op.filtro, faltam });
    }
    console.log(atualFrio ? `• jogo atual (${raizAtual}): capturando em ${dirCacheAtual} (fica guardado; ligado em ${atual})`
      : `• jogo atual: mesmo conteúdo já capturado, reusando ${dirCacheAtual}`);
    // a árvore pode mudar durante a captura: só guarda com a chave se ela ainda for a mesma no fim
    const r = await cache.obterCaptura(dirCacheAtual, (saida) => capturar(saida, { raiz: raizAtual, so: sub.so, tamanhos: op.tamanhos, paralelo }),
      { guardar: () => B.conteudoArvore(repoAtual) === contAtual, semGuardar: atual });
    if (!r.guardada) { naoGuardada = true; console.log('⚠ a árvore mudou durante a captura: comparo o que foi capturado, mas não guardo (rode de novo)'); return; }
    cache.marcarOrigem(path.dirname(dirCacheAtual), REPO);
    cache.ligarArvore(dirCacheAtual, atual);
  };
  let ref, naoGuardada = false;
  if (op.filtro && op.recapturar) {
    // as duas capturas só com as cenas pedidas; os nomes da base em cache (se houver) dizem quando parar. Uma lista
    // para cada lado: as abas apagam o nome a cada foto, e a lista dividida deixava o lado atrasado sem as últimas
    const pronto = cache.pastaCaptura(PASTA_TESTES, contBase, sub.nome);
    const faltam = () => (cache.pronta(pronto) ? nomesPedidos(pronto, op.filtro) : undefined);
    if (!paralelo) paralelo = Math.max(1, Math.floor(PARALELO_PADRAO / 2));
    [ref] = await Promise.all([capBase(faltam()), capAtual(faltam())]);
  } else if (op.filtro) {
    // com --cenas, a base (completa) vem antes: os nomes dela dizem quando cada tamanho já tem tudo
    ref = await capBase();
    await capAtual(nomesPedidos(ref, op.filtro));
  } else [ref] = await Promise.all([capBase(), capAtual()]);
  console.log(`• comparando base ${base.curto} × atual (${op.so}${op.filtro ? `; só /${op.filtro.source}/` : ''})`);
  let ok = comparar(ref, atual, { filtro: op.filtro }).ok;
  if (op.desempenho) {
    console.log('• desempenho (A/B intercalado, CPU 4× mais lenta; base = referência)');
    const { comparar: compararDesempenho } = require('./desempenho');
    ok = (await compararDesempenho(extrairBase(base), raizAtual)).ok && ok;
  }
  // idêntico: nada a inspecionar, a pasta do e2e sai do disco (--manter guarda; o cache fica)
  if (ok && !op.manter) fs.rmSync(pastaE2e, { recursive: true, force: true });
  const guardado = atualNoCache && !naoGuardada ? `\n  Captura do atual guardada em ${dirCacheAtual}: aceito este conteúdo (--aceitar), ela vira a base pronta.` : '';
  console.log(ok
    ? `\n✔ E2E OK: o jogo atual é idêntico à base ${base.curto} (${escopo}; ${min()} min)`
    : `\n✘ E2E FALHOU: o jogo atual difere da base ${base.curto} (lista acima; ${min()} min).\n  Base: ${ref}\n  Atual: ${atual}\n  Imagens: base, atual e diferença (magenta) na lista acima; dados: diff -u <base>/dados/x.json <atual>/dados/x.json${guardado}`);
  return ok;
}

module.exports = { e2e, hashBase, extrairBase, subCaptura };

if (require.main === module) {
  // opção desconhecida (ou com erro de digitação) para aqui: antes ela era ignorada e o e2e inteiro rodava
  require('../ajuda').conferirOpcoes(process.argv.slice(2), {
    valores: ['--base', '--raiz', '--tamanhos', '--cenas', '--paralelo', '--aceitar'], duplas: ['--trocar-base'],
    booleanas: ['--so-dados', '--desempenho', '--manter', '--podar', '--sem-esperar', '--mudancas', '--recapturar'] });
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  const tem = (n) => process.argv.includes(n);
  const parar = (m) => { console.error('✘ ' + m); process.exit(2); };
  // tamanho com erro de digitação também para: antes virava a janela padrão (1280×720) e o e2e dizia OK
  const { TAMANHOS } = require('./navegador');
  const tamanhoRuim = (arg('--tamanhos') || '').split(',').filter(Boolean).find((t) => !Object.prototype.hasOwnProperty.call(TAMANHOS, t));
  if (tamanhoRuim) parar(`tamanho desconhecido: ${tamanhoRuim} (${Object.keys(TAMANHOS).join(', ')})`);
  const soDados = tem('--so-dados'), cenas = arg('--cenas');
  if (soDados && cenas) parar('--cenas é só para imagens; --so-dados não tem imagens');
  if (tem('--mudancas') && (soDados || cenas)) parar('--mudancas escolhe sozinho: não junte com --cenas nem --so-dados');
  const so = soDados ? 'dados,vozes' : cenas ? 'imagens' : 'dados,imagens,vozes';
  const paralelo = arg('--paralelo') ? Number(arg('--paralelo')) : undefined;
  if (tem('--trocar-base')) {
    try { require('./trocar-base').trocarBase(arg('--trocar-base'), process.argv[process.argv.indexOf('--trocar-base') + 2]); process.exit(0); }
    catch (e) { parar(e.message); }
  }
  if (tem('--aceitar')) {
    try { require('./trocar-base').aceitar(arg('--aceitar')); process.exit(0); } catch (e) { parar(e.message); }
  }
  if (tem('--podar')) process.exit(podar() ? 0 : 1);
  let op = { manter: tem('--manter'), recapturar: tem('--recapturar'), base: arg('--base'), raiz: arg('--raiz'), tamanhos: arg('--tamanhos'),
    so, filtro: cenas ? new RegExp(cenas) : undefined, paralelo, desempenho: tem('--desempenho') };
  if (tem('--mudancas')) op = porMudancas(op);
  require('./trava').pegar('npm run e2e').then(() => e2e(op))
    .then((ok) => process.exit(ok ? 0 : 1), (e) => { console.error('✘ ' + (e && e.stack || e)); process.exit(1); });
}
