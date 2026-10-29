// Publica o jogo na Vercel (https://reino-dos-unicornios.vercel.app), com a API e o banco Postgres de vercel/:
// O normal é a Vercel publicar sozinha: o projeto está ligado ao GitHub e cada push na main que muda o jogo vira
// publicação (só produção, sem preview; regra em vercel/ignorar-build.sh). Esta ferramenta confere e é o plano B.
// Uso: node jogo/ferramentas/fluxo/vercel.js --conferir [--ref main] [--esperar]   (npm run vercel -- --conferir)
//   1º, a regra do vercel/ignorar-build.sh aqui mesmo: pergunta à Vercel o commit da última publicação de produção
//   que deu certo (READY) e, se o jogo dele é o mesmo de <ref> (padrão HEAD), sai na hora com "nada a publicar".
//   Na dúvida (API fora, publicação sem commit, commit que não está aqui), espera como abaixo (--esperar pula o 1º).
//   Senão, espera (até 15 min; costuma levar de 1 a 5) a publicação automática do commit, mostrando o estado e o
//   tempo, e diz como ela terminou: pronta, ignorada (o jogo não mudou) ou com erro (código 1: publique pelo plano
//   B). Não publica nada.
// Uso: node jogo/ferramentas/fluxo/vercel.js [--ref main]        (npm run vercel; plano B, publica na hora)
// Exporta <ref> (padrão HEAD) com git archive (só o que o vercel/montar.js lê: DEPENDENCIAS dele, sem o resto de
// jogo/ferramentas) para /tmp/reino-testes/vercel/<commit>/ e ali roda vercel pull, vercel build --prod e
// vercel deploy --prebuilt --prod.
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
// o que o build lê (vercel/montar.js); o .vercel/project.json vai à parte
const CAMINHOS = require('../../../vercel/montar').DEPENDENCIAS;
const IGNORAR = path.join(__dirname, '..', '..', '..', 'vercel', 'ignorar-build.sh');

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

// os caminhos que o vercel/ignorar-build.sh compara (relativos à raiz do repositório; ele roda em vercel/)
function caminhosDoJogo(texto = fs.readFileSync(IGNORAR, 'utf8')) {
  const m = /git diff --quiet "\$VERCEL_GIT_PREVIOUS_SHA" HEAD -- ((?:[^\n\\]|\\\n)+)/.exec(texto);
  if (!m) throw new Error('não achei o git diff do ' + IGNORAR);
  return m[1].replace(/\\\n/g, ' ').trim().split(/\s+/).map((c) => (c === '.' ? 'vercel' : c.replace(/^\.\.\//, '')));
}
// a mesma regra do ignorar-build.sh: o jogo mudou entre `base` e `sha`? (sem dar para comparar: mudou, publica)
function jogoMudou(base, sha, raiz) {
  try {
    execFileSync('git', ['diff', '--quiet', base, sha, '--', ...caminhosDoJogo()], { cwd: raiz, stdio: 'ignore' });
    return false;
  } catch (e) { return true; }
}
// atalho do --conferir: o commit da última publicação de produção que deu certo (READY, a que a Vercel usa como
// VERCEL_GIT_PREVIOUS_SHA) tem o mesmo jogo que `sha`? Devolve esse commit, ou null na dúvida (API falhou, a última
// foi pelo plano B e não tem commit, commit fora deste clone, jogo diferente): aí se espera a Vercel, como sempre.
// `buscar` é o fetch (os testes passam um de mentira)
async function semNadaAPublicar(sha, raiz, buscar = fetch) {
  try {
    const url = `https://api.vercel.com/v6/deployments?projectId=${PROJETO.projectId}&teamId=${PROJETO.orgId}`
      + '&target=production&state=READY&limit=20';
    const r = await buscar(url, { headers: { Authorization: 'Bearer ' + token() } });
    if (!r.ok) return null;
    // a URL já pede produção READY; o filtro repete no código (a API não pode trazer uma prévia por engano)
    const ultima = ((await r.json()).deployments || []).filter((d) => (d.readyState || d.state) === 'READY' && d.target === 'production')
      .sort((x, y) => (y.created || 0) - (x.created || 0))[0];
    const pub = ultima && ultima.meta && ultima.meta.githubCommitSha;
    if (!pub || !/^[0-9a-f]{40}$/.test(pub)) return null;
    execFileSync('git', ['cat-file', '-e', pub + '^{commit}'], { cwd: raiz, stdio: 'ignore' });
    return jogoMudou(pub, sha, raiz) ? null : pub;
  } catch (e) { return null; }
}

const minutos = (ms) => { const s = Math.round(ms / 1000); return s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + (s % 60) + ' s'; };

// a publicação automática (pela integração com o GitHub) do commit `sha`: espera ela terminar e diz como foi
async function conferir(sha, raiz) {
  const url = `https://api.vercel.com/v6/deployments?projectId=${PROJETO.projectId}&teamId=${PROJETO.orgId}&limit=20`;
  const cabecalho = { Authorization: 'Bearer ' + token() };
  const inicio = Date.now(), limite = inicio + 15 * 60000;
  console.log(`esperando a publicação de ${sha.slice(0, 7)} na Vercel: costuma levar de 1 a 5 min; desisto em 15 min`);
  let visto = null, ultimoAviso = inicio;
  while (Date.now() < limite) {
    const r = await fetch(url, { headers: cabecalho });
    if (!r.ok) throw new Error('API da Vercel respondeu ' + r.status);
    const d = (await r.json()).deployments.find((x) => x.meta && x.meta.githubCommitSha === sha);
    const estado = (d && (d.readyState || d.state)) || 'ainda não chegou à Vercel';
    if (estado !== visto || Date.now() - ultimoAviso >= 30000) {
      console.log(`• ${sha.slice(0, 7)}: ${estado} (${minutos(Date.now() - inicio)} de até 15 min)`);
      visto = estado; ultimoAviso = Date.now();
    }
    if (estado === 'READY') { console.log(`✔ publicado ${sha.slice(0, 7)} em https://reino-dos-unicornios.vercel.app`); return 0; }
    // CANCELED: o ignorar-build.sh achou o jogo igual; confere de novo pela última de produção antes de dar ok
    if (estado === 'CANCELED') {
      const pub = await semNadaAPublicar(sha, raiz);
      if (pub) { console.log(`✔ ignorado pela Vercel (o jogo é o de ${pub.slice(0, 7)}, já publicado: vercel/ignorar-build.sh); nada a publicar`); return 0; }
      console.log(`✘ a Vercel cancelou ${sha.slice(0, 7)}, mas não deu para confirmar que o jogo é o da última publicação de produção: publique com npm run vercel`);
      return 1;
    }
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
  conferirOpcoes(argv, { valores: ['--ref'], booleanas: ['--conferir', '--esperar'] });
  const i = argv.indexOf('--ref');
  const ref = i >= 0 ? argv[i + 1] : 'HEAD';
  const raizRepo = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  if (argv.includes('--conferir')) {
    const sha = execFileSync('git', ['rev-parse', ref], { cwd: raizRepo, encoding: 'utf8' }).trim();
    return (argv.includes('--esperar') ? Promise.resolve(null) : semNadaAPublicar(sha, raizRepo)).then((pub) => {
      if (pub) {
        console.log(`✔ o jogo de ${sha.slice(0, 7)} é o da última publicação de produção (${pub.slice(0, 7)}; regra do`
          + ' vercel/ignorar-build.sh): nada a publicar');
        return;
      }
      return conferir(sha, raizRepo).then((codigo) => { process.exitCode = codigo; });
    });
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

module.exports = { CAMINHOS, caminhosDoJogo, jogoMudou, semNadaAPublicar };

if (require.main === module) main();
