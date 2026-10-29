// Repositório git TEMPORÁRIO para os testes fluxo-*.test.js (nunca o repositório de verdade):
//   <pasta>/principal   árvore principal (main), com um "jogo" mínimo: manifesto.txt → jogo/index.html
//                       (uma linha só, para dar conflito fácil), base-referencia.txt, CLAUDE.md e package.json
//                       com os scripts index/test/e2e de mentira (rápidos). O test anota cada rodada em
//                       <pasta>/test.log e, com <pasta>/test-exige-base, só passa com a base `@` (como o passo de
//                       dados do npm test, que compara com a base). O e2e.js de mentira anota em <pasta>/e2e.log,
//                       aceita --podar e --aceitar "<d>" (grava a base `@`; sem ele com { e2eAntigo: true }) e, com
//                       <pasta>/e2e-diferencas.json (["celular/x", …]), sai com 1, grava o resumo.json numa pasta e2e-*
//                       e imprime "✘ N diferença(s) em …" e "  Atual: <pasta>/atual" (como o de verdade).
//   com { vozes: true }: listar-falas.js (falas de jogo/falas/*.txt, linhas "chave|fala"), empacotar-vozes.js e
//                       vozes.js (npm run vozes: grava o "áudio" no vozes-cache, anota em <pasta>/vozes.log;
//                       fala com REPROVA = conferência reprovada) de mentira, sem rede
//   <pasta>/remoto.git  o "origin" (bare), para o --push
// As worktrees das frentes nascem ao lado da principal (<pasta>/reino-<tema>), como no repositório real.
const fs = require('fs');
const path = require('path');
const C = require('./comum');

// e2e.js de mentira (mesmas opções que o integrar usa do de verdade)
const E2E = `const fs = require('fs'); const path = require('path');
const base = path.resolve(__dirname, '../../../..'); const a = process.argv.slice(2);
if (a[0] === '--testar') {
  fs.appendFileSync(path.join(base, 'test.log'), 'test\\n');
  const ok = !fs.existsSync(path.join(base, 'test-exige-base')) || /^@$/m.test(fs.readFileSync(path.join(__dirname, 'base-referencia.txt'), 'utf8'));
  process.exit(ok ? 0 : 1);
}
fs.appendFileSync(path.join(base, 'e2e.log'), (a.join(' ') || 'e2e') + '\\n');
if (a[0] === '--podar') { console.log('• nada a podar'); process.exit(0); }
if (a[0] === '--aceitar') {
  const arq = path.join(__dirname, 'base-referencia.txt');
  const l = fs.readFileSync(arq, 'utf8').split('\\n'); const i = l.findIndex((x) => !x.startsWith('#'));
  l.splice(i, 1, '# @ = ' + a[1], '@'); fs.writeFileSync(arq, l.join('\\n')); process.exit(0);
}
const arqDif = path.join(base, 'e2e-diferencas.json');
if (!fs.existsSync(arqDif)) { console.log('✔ E2E OK'); process.exit(0); }
const pasta = fs.mkdtempSync(path.join(base, 'e2e-'));
const porTamanho = {}; const difs = JSON.parse(fs.readFileSync(arqDif, 'utf8'));
difs.forEach((d) => { const [tm, n] = d.split('/'); const t = porTamanho[tm] || (porTamanho[tm] = { hudTopo: 0, dock: 0, balao: 0, outras: 0, nomes: {} }); t.outras++; (t.nomes.outras = t.nomes.outras || []).push(n); });
fs.writeFileSync(path.join(pasta, 'resumo.json'), JSON.stringify({ total: difs.length, porTamanho, outras: [] }));
console.log('✘ ' + difs.length + ' diferença(s) em 10 arquivos');
console.log('\\n✘ E2E FALHOU: o jogo atual difere da base.\\n  Base: x\\n  Atual: ' + pasta + '/atual'); process.exit(1);
`;

// ferramentas de vozes de mentira: a regra do áudio é a mesma do vozes.js (sha1 de voz|velocidade|tom|fala)
const VOZES_COMUM = `const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const raiz = path.resolve(__dirname, '../../..'); const G = path.join(raiz, 'jogo/ferramentas/gerado');
const ler = (f, p) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : p);
const hash = (v, fala) => crypto.createHash('sha1').update([v.voz, v.velocidade, v.tom, fala].join('|'), 'utf8').digest('hex').slice(0, 16);
`;
const LISTAR = VOZES_COMUM + `const d = path.join(raiz, 'jogo/falas'); const falas = [];
(fs.existsSync(d) ? fs.readdirSync(d).sort() : []).forEach((a) => fs.readFileSync(path.join(d, a), 'utf8').split('\\n').filter(Boolean)
  .forEach((l) => { const [chave, fala] = l.split('|'); falas.push({ chave, voz: 'narradora', fala, pacotes: ['geral'] }); }));
fs.mkdirSync(G, { recursive: true });
fs.writeFileSync(path.join(G, 'falas.json'), JSON.stringify({ vozes: { narradora: { voz: 'pt-BR-Teste', velocidade: '+0%', tom: '+0Hz' } }, falas }, null, 1));
`;
const EMPACOTAR = VOZES_COMUM + `const { falas } = ler(path.join(G, 'falas.json')); const indice = ler(path.join(G, 'vozes-indice.json'), {});
const pac = {}; const faltando = falas.filter((f) => !indice[f.chave] || !fs.existsSync(path.join(G, 'vozes-cache', indice[f.chave])));
if (faltando.length) { console.log('✘ Falas sem áudio: ' + faltando.map((f) => f.fala).join(', ')); process.exit(1); }
falas.forEach((f) => f.pacotes.forEach((p) => { (pac[p] = pac[p] || {})[f.chave] = fs.readFileSync(path.join(G, 'vozes-cache', indice[f.chave]), 'utf8'); }));
const V = path.join(raiz, 'jogo/js/voz'); fs.mkdirSync(V, { recursive: true });
fs.readdirSync(V).filter((a) => !pac[a.replace(/\\.js$/, '')]).forEach((a) => fs.unlinkSync(path.join(V, a)));
Object.keys(pac).forEach((p) => { const o = {}; Object.keys(pac[p]).sort().forEach((k) => { o[k] = pac[p][k]; }); fs.writeFileSync(path.join(V, p + '.js'), 'Reino.Voz.registrar(' + JSON.stringify(p) + ',' + JSON.stringify(o) + ');\\n'); });
`;
const VOZES = VOZES_COMUM + `const { execFileSync } = require('child_process');
fs.appendFileSync(path.join(raiz, '..', 'vozes.log'), 'vozes\\n');
execFileSync(process.execPath, [path.join(__dirname, 'listar-falas.js')]);
const { vozes, falas } = ler(path.join(G, 'falas.json')); const indice = ler(path.join(G, 'vozes-indice.json'), {}); const novas = [];
falas.forEach((f) => { const rel = f.voz + '/' + hash(vozes[f.voz], f.fala) + '.mp3'; const arq = path.join(G, 'vozes-cache', rel);
  if (!fs.existsSync(arq)) { fs.mkdirSync(path.dirname(arq), { recursive: true }); fs.writeFileSync(arq, f.fala); novas.push(f); }
  indice[f.chave] = rel; });
fs.writeFileSync(path.join(G, 'vozes-indice.json'), JSON.stringify(indice, null, 1));
execFileSync(process.execPath, [path.join(__dirname, 'empacotar-vozes.js')]);
const ruins = novas.filter((f) => f.fala.includes('REPROVA'));
ruins.forEach((f) => console.log('✘ reprovada: ' + f.fala));
if (ruins.length) { console.log('✘ vozes: falhou em conferir (gravações que não batem com o texto)'); process.exit(1); }
console.log('✔ vozes: tudo certo');
`;

const GERAR_INDEX = "const f=require('fs');f.writeFileSync('jogo/index.html','<!-- gerado --> '+f.readFileSync('jogo/manifesto.txt','utf8').trim().split('\\n').join(' ')+'\\n')";

function escrever(raiz, rel, texto) {
  const p = path.join(raiz, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
const git = (pasta, ...a) => C.git(pasta, ...a);
function configurar(pasta) {
  git(pasta, 'config', 'user.name', 'Teste do Fluxo');
  git(pasta, 'config', 'user.email', 'fluxo@teste.invalido');
  git(pasta, 'config', 'commit.gpgsign', 'false');
}

// cria o repositório e devolve { base, principal, remoto, ... ajudantes }
function criarRepo(prefixo = 'fluxo', op = {}) {
  fs.mkdirSync(C.PASTA_TESTES, { recursive: true });
  const base = fs.mkdtempSync(path.join(C.PASTA_TESTES, `${prefixo}-`));
  const principal = path.join(base, 'principal');
  fs.mkdirSync(principal);
  C.git(principal, 'init', '-q', '-b', 'main');
  configurar(principal);
  escrever(principal, 'package.json', JSON.stringify({
    name: 'repo-de-teste', private: true,
    scripts: {
      index: `node -e "${GERAR_INDEX}"`, test: 'node jogo/ferramentas/testes/e2e.js --testar',
      e2e: 'node jogo/ferramentas/testes/e2e.js', vozes: 'node jogo/ferramentas/vozes/vozes.js',
    },
  }, null, 2) + '\n');
  // e2e.js antigo: sem o --aceitar (o integrar cai no commit à parte "base do e2e em <hash>")
  escrever(principal, 'jogo/ferramentas/testes/e2e.js', op.e2eAntigo ? E2E.replace(/if \(a\[0\] === '--aceitar'\)[\s\S]*?\n}\n/, '') : E2E);
  if (op.vozes) {
    escrever(principal, 'jogo/ferramentas/vozes/listar-falas.js', LISTAR);
    escrever(principal, 'jogo/ferramentas/vozes/empacotar-vozes.js', EMPACOTAR);
    escrever(principal, 'jogo/ferramentas/vozes/vozes.js', VOZES);
    escrever(principal, 'jogo/falas/comeco.txt', 'c0|Olá, Mariana!\n');
  }
  escrever(principal, '.gitignore', 'node_modules\n');
  escrever(principal, 'jogo/manifesto.txt', ['a', 'b', 'c', 'd', 'e', 'f', 'g'].join('\n') + '\n');
  escrever(principal, 'CLAUDE.md', '# Regras\n- Skills: gravar-vozes, validar-tudo.\n');
  escrever(principal, 'jogo/ferramentas/testes/base-referencia.txt', '# Commit BASE das referências do e2e.\n# 1234567 = a primeira.\n1234567\n');
  C.rodar('npm', ['run', '--silent', 'index'], { cwd: principal });
  if (op.vozes) C.rodar('npm', ['run', '--silent', 'vozes'], { cwd: principal });
  git(principal, 'add', '-A');
  git(principal, 'commit', '-q', '-m', 'Reino dos Unicórnios: começo');
  const remoto = path.join(base, 'remoto.git');
  C.git(base, 'init', '-q', '--bare', remoto);
  git(principal, 'remote', 'add', 'origin', remoto);
  git(principal, 'push', '-q', 'origin', 'main');
  return {
    base, principal, remoto,
    escrever: (rel, texto, raiz = principal) => escrever(raiz, rel, texto),
    ler: (rel, raiz = principal) => fs.readFileSync(path.join(raiz, rel), 'utf8'),
    git,
    linhas: (arq) => (fs.existsSync(path.join(base, arq)) ? fs.readFileSync(path.join(base, arq), 'utf8').split('\n').filter(Boolean) : []),
    // frente: worktree <base>/reino-<tema> na branch feat/<tema>
    frente(tema) {
      const p = path.join(base, `reino-${tema}`);
      git(principal, 'worktree', 'add', '-q', p, '-b', `feat/${tema}`, 'main');
      return p;
    },
    // troca uma linha do manifesto, refaz o index.html e (se `mensagem`) faz commit
    mudarManifesto(pasta, de, para, mensagem) {
      const arq = path.join(pasta, 'jogo/manifesto.txt');
      fs.writeFileSync(arq, fs.readFileSync(arq, 'utf8').replace(new RegExp(`^${de}$`, 'm'), para));
      C.rodar('npm', ['run', '--silent', 'index'], { cwd: pasta });
      if (mensagem) { git(pasta, 'add', '-A'); git(pasta, 'commit', '-q', '-m', mensagem); }
    },
  };
}

module.exports = { criarRepo };
