// Atalho: os testes do banho moram em ferramentas/testes/unidade/banho.test.js, banho-versao-antiga.test.js e banho-casa.navegador.test.js (este abre o navegador).
// Uso: node ferramentas/testes/testar-banho.js   (o mesmo que node --test nesses arquivos; sai com 1 se algum falhar)
const path = require('path');
const { spawnSync } = require('child_process');

const arquivos = ['banho.test.js', 'banho-versao-antiga.test.js', 'banho-casa.navegador.test.js'].map((f) => path.join(__dirname, 'unidade', f));
// morto por sinal (status null) conta como falha, como em processo.js
const { status } = spawnSync(process.execPath, ['--test'].concat(arquivos), { stdio: 'inherit' });
process.exit(status === null ? 1 : status);
