// Publica o jogo na Vercel (https://reino-dos-unicornios.vercel.app), com a API e o banco Postgres de vercel/:
// O normal é a Vercel publicar sozinha: o projeto está ligado ao GitHub e cada push na main que muda o jogo vira
// publicação (só produção, sem preview; regra em vercel/ignorar-build.sh). Esta ferramenta confere e é o plano B.
// Uso: node jogo/ferramentas/fluxo/vercel.js --conferir [--ref main]   (npm run vercel -- --conferir)
//   espera (até 15 min) a publicação automática do commit <ref> (padrão HEAD) e diz como ela terminou: pronta,
//   ignorada (o jogo não mudou) ou com erro (código 1: publique pelo plano B). Não publica nada.
// Uso: node jogo/ferramentas/fluxo/vercel.js [--ref main]        (npm run vercel; plano B, publica na hora)
// Exporta <ref> (padrão HEAD) com git archive (jogo/index.html, jogo/css, jogo/js, jogo/ferramentas e vercel/) para
// /tmp/reino-testes/vercel/<commit>/ e ali roda vercel pull, vercel build --prod e vercel deploy --prebuilt --prod.
// Não escreve na árvore do repositório. Token: VERCEL_TOKEN do ambiente ou a linha VERCEL_TOKEN= do .env do SaaS
// (/home/leandro/Development/my-apps/SaaS/.env, ou os antigos /home/leandro/Development/SaaS/.env e /home/leandro/PersonalDevelopment/SaaS/.env).
// O banco da Vercel guarda saves reais: intocável (CLAUDE.md da raiz).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
if (require.main === module) require('../ajuda').ajuda(__filename);
const { conferirOpcoes } = require('../ajuda');

const PROJETO = { projectId: 'prj_JxmsaMptKQmgJ1bbDBJXryIuA3T7', orgId: 'team_Zl72UlmUcKooFmnViP6qziOp' };
const ENV_SAAS = ['/home/leandro/Development/my-apps/SaaS/.env', '/home/leandro/Development/SaaS/.env', '/home/leandro/PersonalDevelopment/SaaS/.env'];
const CAMINHOS = ['jogo/index.html', 'jogo/css', 'jogo/js', 'jogo/ferramentas', 'vercel'];

function token() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  const linha = ENV_SAAS.filter((arq) => fs.existsSync(arq))
    .map((arq) => fs.readFileSync(arq, 'utf8').split('\n').find((l) => /^VERCEL_TOKEN=/.test(l))).find(Boolean);
  if (!linha) throw new Error('sem VERCEL_TOKEN (nem no ambiente nem em ' + ENV_SAAS.join(' nem em ') + ')');
  return linha.slice('VERCEL_TOKEN='.length).trim().replace(/^["']|["']$/g, '');
}

function rodar(cmd, args, cwd) {
  execFileSync(cmd, args, { cwd, stdio: 'inherit' });
}

// a publicação automática (pela integração com o GitHub) do commit `sha`: espera ela terminar e diz como foi
async function conferir(sha) {
  const url = `https://api.vercel.com/v6/deployments?projectId=${PROJETO.projectId}&teamId=${PROJETO.orgId}&limit=20`;
  const cabecalho = { Authorization: 'Bearer ' + token() };
  const limite = Date.now() + 15 * 60000;
  let visto = null;
  while (Date.now() < limite) {
    const r = await fetch(url, { headers: cabecalho });
    if (!r.ok) throw new Error('API da Vercel respondeu ' + r.status);
    const d = (await r.json()).deployments.find((x) => x.meta && x.meta.githubCommitSha === sha);
    const estado = d && (d.readyState || d.state);
    if (estado && estado !== visto) { console.log(`• ${sha.slice(0, 7)}: ${estado}`); visto = estado; }
    if (estado === 'READY') { console.log(`✔ publicado ${sha.slice(0, 7)} em https://reino-dos-unicornios.vercel.app`); return 0; }
    if (estado === 'CANCELED') { console.log('✔ ignorado pela Vercel (o jogo não mudou: vercel/ignorar-build.sh); nada a publicar'); return 0; }
    if (estado === 'ERROR') { console.log(`✘ a publicação de ${sha.slice(0, 7)} falhou (veja https://${d.url}): publique com npm run vercel`); return 1; }
    // BLOCKED: a Vercel não reconheceu o autor do commit como alguém do time (o e-mail do commit tem que ser da conta
    // lcf2212dev no GitHub: git config user.email deste repositório, o noreply dela)
    if (estado === 'BLOCKED') {
      const autor = (d.meta && (d.meta.githubCommitAuthorLogin || d.meta.githubCommitAuthorEmail)) || '?';
      console.log(`✘ a Vercel bloqueou a publicação de ${sha.slice(0, 7)}: autor do commit não reconhecido (${autor}); publique com npm run vercel`);
      return 1;
    }
    await new Promise((ok) => setTimeout(ok, 10000));
  }
  console.log(`✘ nenhuma publicação de ${sha.slice(0, 7)} terminou em 15 min (o push chegou ao GitHub?): publique com npm run vercel`);
  return 1;
}

function main() {
  const argv = process.argv.slice(2);
  conferirOpcoes(argv, { valores: ['--ref'], booleanas: ['--conferir'] });
  const i = argv.indexOf('--ref');
  const ref = i >= 0 ? argv[i + 1] : 'HEAD';
  const raizRepo = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  if (argv.includes('--conferir')) {
    const sha = execFileSync('git', ['rev-parse', ref], { cwd: raizRepo, encoding: 'utf8' }).trim();
    return conferir(sha).then((codigo) => { process.exitCode = codigo; });
  }
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
