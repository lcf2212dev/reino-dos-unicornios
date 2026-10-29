// Conferência de tipos (npm run tipos): o TypeScript lê os arquivos do jogo listados em tipos.json
// (JavaScript puro com anotações JSDoc) e acusa erros. Não gera nada e o jogo continua sem build.
// Uso: node jogo/ferramentas/testes/tipos.js [arquivo.js …]   (sem argumentos: os de tipos.json)
// O TypeScript é baixado sob demanda pelo npx (versão fixa abaixo); não é dependência do projeto. Já baixado (cache do
// npx, ~/.npm/_npx/*/node_modules/typescript na versão certa): roda direto, sem o npx (bem mais rápido).
// Como acrescentar um arquivo:
//   1. anote o arquivo com JSDoc (/** @param {string} id */, /** @type {…} */, @typedef…);
//   2. ponha o caminho (a partir da raiz do repositório) em jogo/ferramentas/testes/tipos.json;
//   3. globais novas (window.X, Reino.X usado por outro arquivo) entram em tipos-globais.d.ts;
//   4. rode npm run tipos até passar sem erro.
// As formas (EstadoSave, Materia, Desafio…) estão em tipos-jogo.d.ts, puxado por tipos-globais.d.ts.
// O tsconfig é gerado numa pasta própria de cada execução, /tmp/reino-testes/tipos-<pid>/ (duas execuções
// ao mesmo tempo não se atropelam; nada é escrito no repositório).
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const TYPESCRIPT = 'typescript@5.9.3';
const REPO = path.resolve(__dirname, '..', '..', '..');
const PASTA = `/tmp/reino-testes/tipos-${process.pid}`;

// o tsc da versão certa já no cache do npx (null: não há; vai pelo npx)
function tscNoCache() {
  const cache = path.join(process.env.npm_config_cache || path.join(require('os').homedir(), '.npm'), '_npx');
  let pastas = [];
  try { pastas = fs.readdirSync(cache); } catch (e) { return null; }
  for (const p of pastas) {
    const ts = path.join(cache, p, 'node_modules', 'typescript');
    try {
      if (JSON.parse(fs.readFileSync(path.join(ts, 'package.json'), 'utf8')).version === TYPESCRIPT.split('@')[1]) return path.join(ts, 'bin', 'tsc');
    } catch (e) { /* não é esta */ }
  }
  return null;
}

const pedidos = process.argv.slice(2);
const lista = pedidos.length ? pedidos : JSON.parse(fs.readFileSync(path.join(__dirname, 'tipos.json'), 'utf8')).arquivos;
const arquivos = lista.map((f) => path.resolve(pedidos.length ? process.cwd() : REPO, f));
const faltam = arquivos.filter((f) => !fs.existsSync(f));
if (faltam.length) { console.error('✘ não existem: ' + faltam.join(', ')); process.exit(1); }

const tsconfig = {
  compilerOptions: {
    allowJs: true, checkJs: true, noEmit: true, skipLibCheck: true,
    target: 'es2020', lib: ['es2020', 'dom', 'dom.iterable'],
    // scripts clássicos (sem módulos): cada arquivo vê as globais dos outros e de tipos-globais.d.ts
    moduleDetection: 'legacy', types: [], strict: false, noImplicitAny: false,
  },
  files: [path.join(__dirname, 'tipos-globais.d.ts')].concat(arquivos),
};
fs.mkdirSync(PASTA, { recursive: true });
const arqConfig = path.join(PASTA, 'tsconfig.json');
fs.writeFileSync(arqConfig, JSON.stringify(tsconfig, null, 1) + '\n');

console.log(`Conferindo tipos de ${arquivos.length} arquivo(s) com ${TYPESCRIPT}…`);
const tsc = tscNoCache();
const r = tsc ? spawnSync(process.execPath, [tsc, '-p', arqConfig, '--pretty', 'false'], { cwd: REPO, encoding: 'utf8' })
  : spawnSync('npx', ['-y', '-p', TYPESCRIPT, 'tsc', '-p', arqConfig, '--pretty', 'false'], { cwd: REPO, encoding: 'utf8' });
const saida = ((r.stdout || '') + (r.stderr || '')).trim();
if (r.error) { console.error(`✘ não consegui rodar o ${tsc ? 'tsc' : 'npx'}: ` + r.error.message); process.exit(1); }
// rodado da raiz do repositório: os erros saem com caminhos jogo/js/…
if (saida) console.log(saida);
if (r.status === 0) console.log(`✔ tipos ok (${arquivos.map((f) => path.relative(REPO, f)).join(', ')})`);
else console.log(`✘ erros de tipo acima (tsconfig gerado em ${arqConfig})`);
process.exit(r.status === 0 ? 0 : 1);
