// Repositório git TEMPORÁRIO para os testes fluxo-*.test.js (nunca o repositório de verdade):
//   <pasta>/principal   árvore principal (main), com um "jogo" mínimo: manifesto.txt → jogo/index.html
//                       (uma linha só, para dar conflito fácil), base-referencia.txt, CLAUDE.md e package.json
//                       com os scripts index/test/e2e de mentira (rápidos)
//   <pasta>/remoto.git  o "origin" (bare), para o --push
// As worktrees das frentes nascem ao lado da principal (<pasta>/reino-<tema>), como no repositório real.
const fs = require('fs');
const path = require('path');
const C = require('./comum');

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
function criarRepo(prefixo = 'fluxo') {
  fs.mkdirSync(C.PASTA_TESTES, { recursive: true });
  const base = fs.mkdtempSync(path.join(C.PASTA_TESTES, `${prefixo}-`));
  const principal = path.join(base, 'principal');
  fs.mkdirSync(principal);
  C.git(principal, 'init', '-q', '-b', 'main');
  configurar(principal);
  escrever(principal, 'package.json', JSON.stringify({
    name: 'repo-de-teste', private: true,
    scripts: { index: `node -e "${GERAR_INDEX}"`, test: 'node -e 0', e2e: 'node -e 0' },
  }, null, 2) + '\n');
  escrever(principal, '.gitignore', 'node_modules\n');
  escrever(principal, 'jogo/manifesto.txt', ['a', 'b', 'c', 'd', 'e', 'f', 'g'].join('\n') + '\n');
  escrever(principal, 'CLAUDE.md', '# Regras\n- Skills: gravar-vozes, validar-tudo.\n');
  escrever(principal, 'jogo/ferramentas/testes/base-referencia.txt', '# Commit BASE das referências do e2e.\n# 1234567 = a primeira.\n1234567\n');
  C.rodar('npm', ['run', '--silent', 'index'], { cwd: principal });
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
