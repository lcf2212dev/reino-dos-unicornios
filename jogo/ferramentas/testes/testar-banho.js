// Atalho: os testes do banho moram em ferramentas/testes/unidade/banho.test.js e banho-versao-antiga.test.js.
// Uso: node ferramentas/testes/testar-banho.js   (o mesmo que node --test nesses arquivos; sai com 1 se algum falhar)
const path = require('path');
const { spawnSync } = require('child_process');

const arquivos = ['banho.test.js', 'banho-versao-antiga.test.js'].map((f) => path.join(__dirname, 'unidade', f));
process.exit(spawnSync(process.execPath, ['--test'].concat(arquivos), { stdio: 'inherit' }).status);
