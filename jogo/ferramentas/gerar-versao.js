// Gera o jogo/js/versao.json: a "impressão digital" do jogo servido (sistemas/versao.js compara com a da aba
// aberta e, quando muda, o jogo se atualiza sozinho). Contrato: docs/contratos/cena-e-motor.md §15.
// versao = sha256 de index.html + css/** + js/** (inclusive js/voz/), fora o próprio versao.json; cada arquivo
// entra com o caminho e o conteúdo, em ordem alfabética: a mesma árvore dá sempre o mesmo hash.
// O versao.json está no .gitignore (cada checkout gera o seu); o gerar-index.js chama este gerador ao escrever.
// Uso: node jogo/ferramentas/gerar-versao.js            → grava jogo/js/versao.json (npm run versao)
//      node jogo/ferramentas/gerar-versao.js --raiz <pasta jogo>   → outra cópia do jogo (testes)
//      node jogo/ferramentas/gerar-versao.js --imprimir → só mostra o hash, sem gravar
if (require.main === module) require('./ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ARQUIVO = 'js/versao.json';

// caminhos (relativos à pasta jogo/, com '/') que entram no hash, em ordem
function arquivos(raiz) {
  const lista = [];
  if (fs.existsSync(path.join(raiz, 'index.html'))) lista.push('index.html');
  function andar(rel) {
    const abs = path.join(raiz, rel);
    if (!fs.existsSync(abs)) return;
    fs.readdirSync(abs, { withFileTypes: true }).forEach((e) => {
      const r = rel + '/' + e.name;
      if (e.isDirectory()) andar(r);
      else if (e.isFile() && r !== ARQUIVO) lista.push(r);
    });
  }
  andar('css');
  andar('js');
  return lista.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function calcular(raiz) {
  const h = crypto.createHash('sha256');
  arquivos(raiz).forEach((rel) => {
    const dados = fs.readFileSync(path.join(raiz, rel));
    h.update(rel + '\0' + dados.length + '\0');
    h.update(dados);
  });
  return h.digest('hex');
}

// grava js/versao.json e devolve o objeto gravado
function gravar(raiz) {
  raiz = raiz || path.join(__dirname, '..');
  const obj = { versao: calcular(raiz), gerado: new Date().toISOString() };
  fs.writeFileSync(path.join(raiz, ARQUIVO), JSON.stringify(obj) + '\n');
  return obj;
}

module.exports = { arquivos, calcular, gravar, ARQUIVO };

if (require.main === module) {
  const i = process.argv.indexOf('--raiz');
  const raiz = i > 0 ? path.resolve(process.argv[i + 1]) : path.join(__dirname, '..');
  if (process.argv.includes('--imprimir')) console.log(calcular(raiz));
  else {
    const v = gravar(raiz);
    console.log(`${ARQUIVO} gerado: ${v.versao.slice(0, 12)}… (${arquivos(raiz).length} arquivos)`);
  }
}
