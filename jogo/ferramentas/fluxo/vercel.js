// Publica o jogo na Vercel (https://reino-dos-unicornios.vercel.app), com a API e o banco Postgres de vercel/:
// Uso: node jogo/ferramentas/fluxo/vercel.js [--ref main]        (npm run vercel)
// Exporta <ref> (padrão HEAD) com git archive (jogo/index.html, jogo/css, jogo/js, jogo/ferramentas e vercel/) para
// /tmp/reino-testes/vercel/<commit>/ e ali roda vercel pull, vercel build --prod e vercel deploy --prebuilt --prod.
// Não escreve na árvore do repositório. Token: VERCEL_TOKEN do ambiente ou a linha VERCEL_TOKEN= do
// /home/leandro/PersonalDevelopment/SaaS/.env. O banco da Vercel guarda saves reais: intocável (CLAUDE.md da raiz).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
if (require.main === module) require('../ajuda').ajuda(__filename);
const { conferirOpcoes } = require('../ajuda');

const PROJETO = { projectId: 'prj_JxmsaMptKQmgJ1bbDBJXryIuA3T7', orgId: 'team_Zl72UlmUcKooFmnViP6qziOp' };
const ENV_SAAS = '/home/leandro/PersonalDevelopment/SaaS/.env';
const CAMINHOS = ['jogo/index.html', 'jogo/css', 'jogo/js', 'jogo/ferramentas', 'vercel'];

function token() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  const linha = fs.existsSync(ENV_SAAS) && fs.readFileSync(ENV_SAAS, 'utf8').split('\n').find((l) => /^VERCEL_TOKEN=/.test(l));
  if (!linha) throw new Error('sem VERCEL_TOKEN (nem no ambiente nem em ' + ENV_SAAS + ')');
  return linha.slice('VERCEL_TOKEN='.length).trim().replace(/^["']|["']$/g, '');
}

function rodar(cmd, args, cwd) {
  execFileSync(cmd, args, { cwd, stdio: 'inherit' });
}

function main() {
  const argv = process.argv.slice(2);
  conferirOpcoes(argv, { valores: ['--ref'] });
  const i = argv.indexOf('--ref');
  const ref = i >= 0 ? argv[i + 1] : 'HEAD';
  const raizRepo = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  const commit = execFileSync('git', ['rev-parse', '--short', ref], { cwd: raizRepo, encoding: 'utf8' }).trim();
  const pasta = path.join('/tmp/reino-testes/vercel', commit);
  fs.mkdirSync(pasta, { recursive: true });
  const tar = path.join(pasta, '..', commit + '.tar');
  rodar('git', ['archive', '--format=tar', '-o', tar, ref, '--', ...CAMINHOS], raizRepo);
  rodar('tar', ['-xf', tar, '-C', pasta], raizRepo);
  fs.mkdirSync(path.join(pasta, '.vercel'), { recursive: true });
  fs.writeFileSync(path.join(pasta, '.vercel', 'project.json'), JSON.stringify(PROJETO) + '\n');
  const t = ['--token', token()];
  rodar('npx', ['-y', 'vercel@latest', 'pull', '--yes', '--environment=production', ...t], pasta);
  rodar('npx', ['-y', 'vercel@latest', 'build', '--prod', ...t], pasta);
  rodar('npx', ['-y', 'vercel@latest', 'deploy', '--prebuilt', '--prod', ...t], pasta);
  console.log(`\nPublicado ${commit} em https://reino-dos-unicornios.vercel.app`);
}

if (require.main === module) main();
