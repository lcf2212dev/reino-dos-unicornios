// --ajuda (ou -h, --help) em qualquer ferramenta do package.json: mostra o comentário do topo do arquivo (o "Uso")
// e sai com 0 ANTES de fazer qualquer coisa. Sem isto, a ferramenta ignorava o --ajuda e rodava de verdade (o e2e
// inteiro com 12 Chromium, a gravação das vozes, o index reescrito).
// Em código, logo depois dos require e antes de qualquer trabalho:
//   if (require.main === module) require('../ajuda').ajuda(__filename);
//   … e, onde a ferramenta só aceita opções conhecidas: conferirOpcoes(argv, { valores: ['--raiz'], booleanas: ['--fundo'] })
// Todo comando do package.json responde a --ajuda (testes/unidade/ajuda.test.js confere).
const fs = require('fs');

const PEDIDOS = ['--ajuda', '-h', '--help'];

// as linhas de comentário // do começo do arquivo, sem o "// "
function textoDoTopo(arquivo) {
  const topo = [];
  for (const l of fs.readFileSync(arquivo, 'utf8').split('\n')) {
    if (/^\s*\/\//.test(l)) topo.push(l.replace(/^\s*\/\/ ?/, ''));
    else if (topo.length || l.trim()) break;
  }
  return topo.join('\n');
}

function ajuda(arquivo, argv = process.argv.slice(2)) {
  if (!argv.some((a) => PEDIDOS.includes(a))) return;
  console.log(textoDoTopo(arquivo));
  process.exit(0);
}

// opção desconhecida = erro (código 2), em vez de ser ignorada e a ferramenta rodar sem ela.
// op: { valores: opções que levam um valor, duplas: opções que levam dois, booleanas: opções sem valor,
//       posicionais: quantos argumentos soltos aceita (padrão 0) }
function conferirOpcoes(argv, op = {}) {
  const valores = op.valores || [], duplas = op.duplas || [], booleanas = op.booleanas || [];
  const parar = (texto) => { console.error(`✘ ${texto} (veja --ajuda)`); process.exit(2); };
  // valor que falta ou que é outra opção (ex.: "--cenas --manter") também é erro: senão a opção vira outra coisa
  const pegar = (i, n, a) => {
    for (let k = 1; k <= n; k++) if (argv[i + k] === undefined || argv[i + k].startsWith('--')) parar(`${a} precisa de ${n > 1 ? n + ' valores' : 'um valor'}`);
    return i + n;
  };
  let soltos = 0;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (valores.includes(a)) { i = pegar(i, 1, a); continue; }
    if (duplas.includes(a)) { i = pegar(i, 2, a); continue; }
    if (booleanas.includes(a)) continue;
    if (!a.startsWith('-') && soltos < (op.posicionais || 0)) { soltos++; continue; }
    parar(`opção desconhecida: ${a}`);
  }
}

module.exports = { ajuda, conferirOpcoes, textoDoTopo, PEDIDOS };
