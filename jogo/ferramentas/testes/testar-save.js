// Atalho: os testes do save, da fome e sede e do banho moram em ferramentas/testes/unidade/ (node:test,
// um arquivo por assunto: save-*.test.js, cuidados-*.test.js, banho*.test.js).
// Uso: node ferramentas/testes/testar-save.js   (o mesmo que node --test nesses arquivos; sai com 1 se algum falhar)
// Tudo de uma vez (unidade + validadores + referências de dados): npm test, na raiz do repositório.
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const pasta = path.join(__dirname, 'unidade');
const arquivos = fs.readdirSync(pasta).filter((f) => /^(save-|cuidados-|banho).*\.test\.js$/.test(f)).sort().map((f) => path.join(pasta, f));
// morto por sinal (status null) conta como falha, como em processo.js
const { status } = spawnSync(process.execPath, ['--test'].concat(arquivos), { stdio: 'inherit' });
process.exit(status === null ? 1 : status);
