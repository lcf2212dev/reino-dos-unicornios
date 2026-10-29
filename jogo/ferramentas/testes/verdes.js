// Verde por árvore: o `npm test` que passa grava /tmp/reino-testes/verdes/<chave>.json (ou dentro de REINO_TESTES);
// o próximo `npm test` na MESMA árvore só diz "já verde" e sai 0 (`npm test -- --forcar` roda tudo).
// Chave = sha1 de: a árvore de trabalho inteira como o git a veria (git add -A num índice temporário, cópia do
// índice da worktree, então só o que mudou é re-hasheado; node_modules fora; arquivos do .gitignore fora) + versão
// do Node + versão do Playwright + as variáveis REINO_* que mudam o que os testes conferem (todas, menos as de
// FORA_DA_CHAVE: tempos, concorrência, memória, vigia, trava, pasta de testes, detalhes de saída).
// Uso: node jogo/ferramentas/testes/verdes.js [--raiz <pasta>]   (mostra a chave e se a árvore já está verde)
// Em código: const V = require('./verdes'); const k = V.chave(); V.verde(k) → { quando, worktree } | null;
//   V.marcar(k, { worktree }) grava.
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { PASTA_TESTES } = require('./guardas');

const REPO = path.resolve(__dirname, '..', '..', '..');
const PASTA = path.join(PASTA_TESTES, 'verdes');

function git(raiz, args, env) {
  return execFileSync('git', args, { cwd: raiz, encoding: 'utf8', env: Object.assign({}, process.env, env), stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function versaoPlaywright(raiz) {
  try { return require(require.resolve('playwright/package.json', { paths: [raiz] })).version; } catch (e) { return 'sem playwright'; }
}

// o hash da árvore de trabalho (sem mexer no índice de verdade da worktree)
function arvore(raiz = REPO) {
  const indice = path.resolve(raiz, git(raiz, ['rev-parse', '--git-path', 'index']));
  fs.mkdirSync(PASTA, { recursive: true });
  const tmp = path.join(PASTA, `indice-${process.pid}-${Date.now()}`);
  try {
    if (fs.existsSync(indice)) fs.copyFileSync(indice, tmp);
    const env = { GIT_INDEX_FILE: tmp };
    git(raiz, ['add', '-A'], env);
    git(raiz, ['rm', '-r', '-q', '--cached', '--ignore-unmatch', 'node_modules'], env);   // o link nunca entra
    return git(raiz, ['write-tree'], env);
  } finally { try { fs.unlinkSync(tmp); } catch (e) { /* não chegou a existir */ } }
}

// não mudam o resultado (só tempo, ritmo, onde ficam os temporários ou quanto se mostra); variável REINO_* nova entra
// na chave sozinha (ex.: REINO_RESERVAS_ABERTAS, REINO_TIPOGRAFIA_ESTRITA, REINO_MOVIMENTO_ESTRITO)
const FORA_DA_CHAVE = new Set(['REINO_TEMPO', 'REINO_TEMPOS', 'REINO_UNIDADE_NODE', 'REINO_UNIDADE_NAVEGADOR', 'REINO_TRAVA_DONA',
  'REINO_SERVIDOR_SUBIR_MS', 'REINO_ESPERA_VOZ_MS', 'REINO_ESPERA_JS_MS', 'REINO_MEMORIA_GB', 'REINO_MEMORIA_TOTAL_GB',
  'REINO_VIGIA_TOTAL_GB', 'REINO_VIGIA_TESTE_MIN', 'REINO_TRAVADO_MIN', 'REINO_TESTES', 'REINO_TIPOGRAFIA_DETALHES']);
function ambiente(env = process.env) {
  return Object.keys(env).filter((k) => /^REINO_/.test(k) && !FORA_DA_CHAVE.has(k) && env[k] !== '').sort().map((k) => `${k}=${env[k]}`);
}

function chave(raiz = REPO) {
  const partes = [arvore(raiz), process.version, versaoPlaywright(raiz)].concat(ambiente());
  return crypto.createHash('sha1').update(partes.join('\n')).digest('hex');
}
const arquivoDa = (k) => path.join(PASTA, k + '.json');
function verde(k) {
  try { return JSON.parse(fs.readFileSync(arquivoDa(k), 'utf8')); } catch (e) { return null; }
}
function marcar(k, info = {}) {
  fs.mkdirSync(PASTA, { recursive: true });
  const tmp = arquivoDa(k) + '.' + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(Object.assign({ quando: new Date().toISOString(), worktree: REPO }, info)) + '\n');
  fs.renameSync(tmp, arquivoDa(k));
}

module.exports = { chave, arvore, ambiente, verde, marcar, PASTA, FORA_DA_CHAVE };

if (require.main === module) {
  require('../ajuda').conferirOpcoes(process.argv.slice(2), { valores: ['--raiz'], booleanas: [] });
  const i = process.argv.indexOf('--raiz');
  const k = chave(i > 0 ? path.resolve(process.argv[i + 1]) : REPO);
  const v = verde(k);
  console.log(`chave ${k}: ${v ? `verde (${v.quando}, ${v.worktree})` : 'ainda não verde'}`);
}
