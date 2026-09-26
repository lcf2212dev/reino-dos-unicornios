// E2E de um comando só: referências do jogo ATUAL comparadas com as do commit BASE (tem que dar idêntico).
// Uso (da raiz do repositório):
//   node jogo/ferramentas/testes/e2e.js                  completo: dados, imagens (celular, tablet, notebook) e vozes
//   node jogo/ferramentas/testes/e2e.js --so-dados       só dados + vozes (rápido; parte do npm test)
//   … --base <hash>          outra base (padrão: o hash em jogo/ferramentas/testes/base-referencia.txt)
//   … --desempenho           também o A/B de desempenho contra a base (desempenho.js, ~5 min)
//   … --tamanhos celular     só alguns tamanhos nas imagens   · --raiz <pasta jogo>: outro jogo "atual"
//   … --cenas <regex>        só as imagens cujo nome (sem .png) casa, ex.: --cenas 'interior-loja|tela-bau'.
//                            Só imagens: dados e vozes ficam de fora (rode --so-dados à parte, ~30 s). A página
//                            faz o mesmo caminho (as outras cenas andam o relógio sem foto) e cada aba para quando
//                            o tamanho já tem todas as pedidas; a base é a completa (capturada antes, em cache).
//   … --paralelo N           abas ao mesmo tempo (padrão: metade das CPUs, até 12). Cada grupo de cenas (e cada
//                            lote de interiores) abre a própria aba com servidor e banco próprios.
// Relatório: no topo, "Resumo: N imagens diferentes — só HUD a · só dock b · só balão c · outras d" por tamanho
// (regiões em referencias-regioes.js); as de região conhecida só como contagem + 5 nomes, as "outras" na lista
// com as caixas (px CSS). O resumo vai também para e2e-<data>/resumo.json.
// Diferença em imagem: o relatório dá o caminho da base, do atual e de e2e-<data>/diferencas/<tamanho>/<nome>.png
// (a imagem atual apagada com os pixels diferentes em magenta).
// Tempo: o piso é a fila mapa + interiores de cada tamanho (uma aba só, ver referencias.js); REINO_TEMPOS=1
// mostra quanto levou cada grupo.
//   … --manter               guarda a captura do atual mesmo quando dá idêntico (sem ele, idêntico = apagada)
//   … --trocar-base <hash> "<descrição>"   só troca a base (trocar-base.js: commit ancestral de HEAD, comentários
//                            intactos, "# <curto> = <descrição>" acima do hash, grava atômico, mostra o diff; sem commit)
//   … --podar                só poda e sai: e2e-* com mais de 1 h e ref-<base>/…-h<hash> de harness que não é o
//                            atual nem o da main (h83b7a60d); lista antes o que apaga e quanto libera
// Disco: abaixo de 1,5 GB livres o e2e nem começa (diz o que podar). A pasta é /tmp/reino-testes ou a de
// REINO_TESTES (só dentro de /tmp ou /dev/shm; ver guardas.js), ex.: REINO_TESTES=/dev/shm/reino-testes.
// Como funciona (tudo na pasta de testes; com diferença, a captura do atual fica para inspecionar):
//   1. base-<hash>/jogo/   = `git archive <hash>` de index.html, css/, js/ e servidor/ (extraído uma vez, reusado)
//   2. ref-<hash>/<partes>-h<harness>/ = referências da base, capturadas UMA vez com o harness ATUAL
//      (referencias*.js, que só usa globais estáveis do jogo); mudou o harness, muda a pasta e captura de novo
//   3. e2e-<data>/atual/   = referências do jogo atual (sempre novas; apagadas se idêntico, salvo --manter)
//   4. compara (referencias-comparar.js) e diz o resultado; código de saída 0 = idêntico
// Seguro: servidores de teste em portas livres com banco em /tmp, navegador isolado (ver guardas.js).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawnSync } = require('child_process');
const { PASTA_TESTES, conferirPastaTmp } = require('./guardas');
const { capturar, PARALELO_PADRAO } = require('./referencias');
const { comparar } = require('./referencias-comparar');
const disco = require('./e2e-disco');

const REPO = path.resolve(__dirname, '..', '..', '..');
const ARQ_BASE = path.join(__dirname, 'base-referencia.txt');
// o que o harness usa do jogo: o resto (ferramentas, vozes-cache) fica de fora da cópia
const PARTES_JOGO = ['jogo/index.html', 'jogo/css', 'jogo/js', 'jogo/servidor'];
const ARQS_HARNESS = ['referencias.js', 'referencias-pagina.js', 'referencias-cenas.js', 'referencias-dados.js', 'saves.js', 'navegador.js'];

const git = (...a) => execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8' }).trim();

function hashBase(pedido) {
  const bruto = pedido || fs.readFileSync(ARQ_BASE, 'utf8').split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('#'));
  if (!/^[0-9a-f]{4,40}$/i.test(bruto || '')) throw new Error(`hash de base inválido: "${bruto}" (veja ${ARQ_BASE})`);
  const cheio = git('rev-parse', '--verify', `${bruto}^{commit}`);
  return { cheio, curto: cheio.slice(0, 7) };
}

// 1. cópia do jogo da base (uma vez; a pasta pronta tem a marca .base-pronta)
function extrairBase(base) {
  const destino = conferirPastaTmp(path.join(PASTA_TESTES, `base-${base.curto}`));
  const marca = path.join(destino, 'jogo', '.base-pronta');
  if (fs.existsSync(marca)) { console.log(`• base ${base.curto}: reusando ${destino}/jogo`); return path.join(destino, 'jogo'); }
  console.log(`• base ${base.curto}: extraindo com git archive para ${destino}/jogo`);
  const parcial = conferirPastaTmp(`${destino}.parcial-${process.pid}`);
  fs.mkdirSync(parcial, { recursive: true });
  const arq = spawnSync('git', ['-C', REPO, 'archive', base.cheio, ...PARTES_JOGO], { maxBuffer: 1 << 30 });
  if (arq.status !== 0) throw new Error('git archive falhou: ' + arq.stderr);
  const tar = spawnSync('tar', ['-x', '-C', parcial], { input: arq.stdout });
  if (tar.status !== 0) throw new Error('tar falhou: ' + tar.stderr);
  fs.writeFileSync(path.join(parcial, 'jogo', '.base-pronta'), base.cheio + '\n');
  if (!fs.existsSync(marca)) fs.renameSync(parcial, destino);   // outra execução pode ter terminado antes
  return path.join(destino, 'jogo');
}

function hashHarness() {
  const h = crypto.createHash('sha256');
  ARQS_HARNESS.forEach((f) => h.update(f + '\0' + fs.readFileSync(path.join(__dirname, f))));
  return h.digest('hex').slice(0, 8);
}

// 2. referências da base (cache por partes, tamanhos e versão do harness)
function pastaRefBase(base, op) {
  // com imagens, a base é sempre a completa (a mesma pasta serve ao --cenas)
  const so = op.so.includes('imagens') ? 'dados,imagens,vozes' : op.so;
  const nome = so.replace(/,/g, '-') + (op.tamanhos ? '-' + op.tamanhos.replace(/,/g, '-') : '') + '-h' + hashHarness();
  return { so, destino: conferirPastaTmp(path.join(PASTA_TESTES, `ref-${base.curto}`, nome)) };
}
async function refBase(base, raizBase, op) {
  const { so, destino } = pastaRefBase(base, op);
  op = { ...op, so };
  if (fs.existsSync(path.join(destino, 'erros.txt'))) { console.log(`• referências da base: reusando ${destino}`); return destino; }
  console.log(`• referências da base: capturando uma vez em ${destino}`);
  const parcial = conferirPastaTmp(`${destino}.parcial-${process.pid}`);
  await capturar(parcial, { raiz: raizBase, so: op.so, tamanhos: op.tamanhos, paralelo: op.paralelo });
  if (!fs.existsSync(path.join(destino, 'erros.txt'))) fs.renameSync(parcial, destino);
  return destino;
}

// --podar: lista o que o e2e criou e não serve mais, quanto libera, e apaga
function podar() {
  const plano = disco.planoPoda(PASTA_TESTES, { harness: hashHarness() });
  if (!plano.length) { console.log(`• nada a podar em ${PASTA_TESTES} (${disco.gb(disco.livre(PASTA_TESTES))} livres)`); return true; }
  plano.forEach((x) => console.log(`  apagar ${x.caminho}  (${disco.gb(x.bytes)}; ${x.motivo})`));
  const total = disco.podar(plano);
  console.log(`✔ podado: ${plano.length} pasta(s), ${disco.gb(total)} liberados; ${disco.gb(disco.livre(PASTA_TESTES))} livres agora`);
  return true;
}

async function e2e(op) {
  const inicio = Date.now();
  disco.conferirEspaco(PASTA_TESTES);
  const base = hashBase(op.base);
  const raizAtual = path.resolve(op.raiz || path.join(__dirname, '..', '..'));
  const raizBase = extrairBase(base);
  const d = new Date(), n2 = (x) => String(x).padStart(2, '0');
  const quando = `${d.getFullYear()}${n2(d.getMonth() + 1)}${n2(d.getDate())}-${n2(d.getHours())}${n2(d.getMinutes())}${n2(d.getSeconds())}`;
  const atual = conferirPastaTmp(path.join(PASTA_TESTES, `e2e-${quando}-${process.pid}`, 'atual'));
  console.log(`• jogo atual (${raizAtual}): capturando em ${atual}`);
  // base e atual capturando juntas dividem as vagas (Chromium demais ao mesmo tempo falha nas fotos)
  if (!op.paralelo && !fs.existsSync(path.join(pastaRefBase(base, op).destino, 'erros.txt'))) {
    op = { ...op, paralelo: Math.max(1, Math.floor(PARALELO_PADRAO / 2)) };
  }
  const capAtual = (faltam) => capturar(atual, { raiz: raizAtual, so: op.so, tamanhos: op.tamanhos, paralelo: op.paralelo, filtro: op.filtro, faltam });
  let ref;
  if (op.filtro) {
    // com --cenas, a base (completa) vem antes: os nomes dela dizem quando cada tamanho já tem tudo
    ref = await refBase(base, raizBase, op);
    const faltam = {};
    fs.readdirSync(path.join(ref, 'imagens')).forEach((tm) => {
      faltam[tm] = new Set(fs.readdirSync(path.join(ref, 'imagens', tm)).map((f) => path.basename(f, '.png')).filter((n) => op.filtro.test(n)));
    });
    await capAtual(faltam);
  } else [ref] = await Promise.all([refBase(base, raizBase, op), capAtual()]);
  console.log(`• comparando base ${base.curto} × atual (${op.so}${op.filtro ? `; só /${op.filtro.source}/` : ''})`);
  let ok = comparar(ref, atual, { filtro: op.filtro }).ok;
  if (op.desempenho) {
    console.log('• desempenho (A/B intercalado, CPU 4× mais lenta; base = referência)');
    const { comparar: compararDesempenho } = require('./desempenho');
    ok = (await compararDesempenho(raizBase, raizAtual)).ok && ok;
  }
  // idêntico: nada a inspecionar, a captura do atual sai do disco (--manter guarda)
  const pastaE2e = path.dirname(atual);
  if (ok && !op.manter) fs.rmSync(conferirPastaTmp(pastaE2e), { recursive: true, force: true });
  const min = ((Date.now() - inicio) / 60000).toFixed(1);
  console.log(ok
    ? `\n✔ E2E OK: o jogo atual é idêntico à base ${base.curto} (${op.so}${op.filtro ? ` só /${op.filtro.source}/` : ''}${op.desempenho ? ' + desempenho' : ''}; ${min} min)`
    : `\n✘ E2E FALHOU: o jogo atual difere da base ${base.curto} (lista acima; ${min} min).\n  Base: ${ref}\n  Atual: ${atual}\n  Imagens: base, atual e diferença (magenta) na lista acima; dados: diff -u <base>/dados/x.json <atual>/dados/x.json`);
  return ok;
}

module.exports = { e2e, hashBase, extrairBase };

if (require.main === module) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  const soDados = process.argv.includes('--so-dados'), cenas = arg('--cenas');
  if (soDados && cenas) { console.error('✘ --cenas é só para imagens; --so-dados não tem imagens'); process.exit(2); }
  const so = soDados ? 'dados,vozes' : cenas ? 'imagens' : 'dados,imagens,vozes';
  const paralelo = arg('--paralelo') ? Number(arg('--paralelo')) : undefined;
  if (process.argv.includes('--trocar-base')) {
    try { require('./trocar-base').trocarBase(arg('--trocar-base'), process.argv[process.argv.indexOf('--trocar-base') + 2]); process.exit(0); }
    catch (e) { console.error('✘ ' + e.message); process.exit(2); }
  }
  if (process.argv.includes('--podar')) process.exit(podar() ? 0 : 1);
  require('./trava').pegar('npm run e2e').then(() => e2e({ manter: process.argv.includes('--manter'), base: arg('--base'), raiz: arg('--raiz'), tamanhos: arg('--tamanhos'), so, filtro: cenas ? new RegExp(cenas) : undefined, paralelo, desempenho: process.argv.includes('--desempenho') }))
    .then((ok) => process.exit(ok ? 0 : 1), (e) => { console.error('✘ ' + (e && e.stack || e)); process.exit(1); });
}
