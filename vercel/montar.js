/* Build da Vercel: copia de ../jogo só o que o servidor de casa deixa público (index.html, css/<arquivo>, js/**)
   para public/ e grava public/js/versao.json (o jogo aberto percebe a versão nova e se atualiza).
   A API (api/) é a do servidor de casa (jogo/servidor/servidor.js) sobre Postgres: lib/banco.js. */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const JOGO = path.join(__dirname, '..', 'jogo');
const SAIDA = path.join(__dirname, 'public');

fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(path.join(SAIDA, 'css'), { recursive: true });
fs.copyFileSync(path.join(JOGO, 'index.html'), path.join(SAIDA, 'index.html'));
fs.readdirSync(path.join(JOGO, 'css'), { withFileTypes: true })
  .filter((e) => e.isFile())
  .forEach((e) => fs.copyFileSync(path.join(JOGO, 'css', e.name), path.join(SAIDA, 'css', e.name)));
fs.cpSync(path.join(JOGO, 'js'), path.join(SAIDA, 'js'), { recursive: true, filter: (o) => !o.endsWith('versao.json') });
execFileSync(process.execPath, [path.join(JOGO, 'ferramentas', 'gerar-versao.js'), '--raiz', SAIDA], { stdio: 'inherit' });
console.log('jogo copiado para', SAIDA);
