// E2E de um comando só: referências do jogo ATUAL comparadas com as do commit BASE (tem que dar idêntico).
// Uso (da raiz do repositório):
//   node jogo/ferramentas/testes/e2e.js                  completo: dados, imagens (celular, tablet, notebook) e vozes
//   node jogo/ferramentas/testes/e2e.js --so-dados       só dados + vozes (rápido; parte do npm test)
//   … --base <hash>          outra base (padrão: o hash em jogo/ferramentas/testes/base-referencia.txt)
//   … --desempenho           também o A/B de desempenho contra a base (desempenho.js, ~5 min)
//   … --tamanhos celular     só alguns tamanhos nas imagens   · --raiz <pasta jogo>: outro jogo "atual"
// Como funciona (tudo em /tmp/reino-testes/, nada é apagado):
//   1. base-<hash>/jogo/   = `git archive <hash>` de index.html, css/, js/ e servidor/ (extraído uma vez, reusado)
//   2. ref-<hash>/<partes>-h<harness>/ = referências da base, capturadas UMA vez com o harness ATUAL
//      (referencias*.js, que só usa globais estáveis do jogo); mudou o harness, muda a pasta e captura de novo
//   3. e2e-<data>/atual/   = referências do jogo atual (sempre novas)
//   4. compara (referencias-comparar.js) e diz o resultado; código de saída 0 = idêntico
// Seguro: servidores de teste em portas livres com banco em /tmp, navegador isolado (ver guardas.js).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawnSync } = require('child_process');
const { PASTA_TESTES, conferirPastaTmp } = require('./guardas');
const { capturar } = require('./referencias');
const { comparar } = require('./referencias-comparar');

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
async function refBase(base, raizBase, op) {
  const nome = op.so.replace(/,/g, '-') + (op.tamanhos ? '-' + op.tamanhos.replace(/,/g, '-') : '') + '-h' + hashHarness();
  const destino = conferirPastaTmp(path.join(PASTA_TESTES, `ref-${base.curto}`, nome));
  if (fs.existsSync(path.join(destino, 'erros.txt'))) { console.log(`• referências da base: reusando ${destino}`); return destino; }
  console.log(`• referências da base: capturando uma vez em ${destino}`);
  const parcial = conferirPastaTmp(`${destino}.parcial-${process.pid}`);
  await capturar(parcial, { raiz: raizBase, so: op.so, tamanhos: op.tamanhos });
  if (!fs.existsSync(path.join(destino, 'erros.txt'))) fs.renameSync(parcial, destino);
  return destino;
}

async function e2e(op) {
  const inicio = Date.now();
  const base = hashBase(op.base);
  const raizAtual = path.resolve(op.raiz || path.join(__dirname, '..', '..'));
  const raizBase = extrairBase(base);
  const d = new Date(), n2 = (x) => String(x).padStart(2, '0');
  const quando = `${d.getFullYear()}${n2(d.getMonth() + 1)}${n2(d.getDate())}-${n2(d.getHours())}${n2(d.getMinutes())}${n2(d.getSeconds())}`;
  const atual = conferirPastaTmp(path.join(PASTA_TESTES, `e2e-${quando}-${process.pid}`, 'atual'));
  console.log(`• jogo atual (${raizAtual}): capturando em ${atual}`);
  const [ref] = await Promise.all([refBase(base, raizBase, op), capturar(atual, { raiz: raizAtual, so: op.so, tamanhos: op.tamanhos })]);
  console.log(`• comparando base ${base.curto} × atual (${op.so})`);
  let ok = comparar(ref, atual, {});
  if (op.desempenho) {
    console.log('• desempenho (A/B intercalado, CPU 4× mais lenta; base = referência)');
    const { comparar: compararDesempenho } = require('./desempenho');
    ok = (await compararDesempenho(raizBase, raizAtual)).ok && ok;
  }
  const min = ((Date.now() - inicio) / 60000).toFixed(1);
  console.log(ok
    ? `\n✔ E2E OK: o jogo atual é idêntico à base ${base.curto} (${op.so}${op.desempenho ? ' + desempenho' : ''}; ${min} min)`
    : `\n✘ E2E FALHOU: o jogo atual difere da base ${base.curto} (lista acima; ${min} min).\n  Base: ${ref}\n  Atual: ${atual}\n  Imagens: abra as duas PNG lado a lado; dados: diff -u <base>/dados/x.json <atual>/dados/x.json`);
  return ok;
}

module.exports = { e2e, hashBase, extrairBase };

if (require.main === module) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  const soDados = process.argv.includes('--so-dados');
  e2e({ base: arg('--base'), raiz: arg('--raiz'), tamanhos: arg('--tamanhos'), so: soDados ? 'dados,vozes' : 'dados,imagens,vozes', desempenho: process.argv.includes('--desempenho') })
    .then((ok) => process.exit(ok ? 0 : 1), (e) => { console.error('✘ ' + (e && e.stack || e)); process.exit(1); });
}
