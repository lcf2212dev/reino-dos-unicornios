// Confere o tamanho dos arquivos (em linhas): código ≤ 420, dados ≤ 800, tipos ≤ 1000, gerados sem limite.
// Uso: node ferramentas/tamanho.js              (npm run tamanho, na raiz do repositório)
//      node ferramentas/tamanho.js --todos      (lista também os que estão dentro do limite)
//      node ferramentas/tamanho.js --raiz <pasta jogo>   (confere outra cópia do jogo; usado pelos testes)
// Sai com código 1 e lista os arquivos que passam do limite. Só olha js/, css/, ferramentas/ e o index.html
// (nunca entra em servidor/: o banco da Mariana mora em servidor/dados/).
// Arquivo grande demais: divida por responsabilidade (ver docs/decisoes/divisao-em-arquivos.md). Exceção só
// com motivo, na lista EXCECOES abaixo, e temporária.
if (require.main === module) require('./ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');

const LIMITE = { codigo: 420, dados: 800, tipos: 1000 };

// A regra de cada arquivo, por caminho (a partir de jogo/). A PRIMEIRA regra que casa vale.
//   gerado  sem limite e fora da conta (pacotes de voz, cache das vozes, index.html do gerar-index)
//   dados   listas e desenhos (conteúdo das salas, ícones em pixel, falas, elenco, moldes, partituras):
//           crescem com o jogo e se leem por item, então o limite é maior
//   tipos   declarações do TypeScript (.d.ts) do npm run tipos: uma lista de formas lida por item, como os
//           dados; limite maior (1000) porque tipos-jogo.d.ts junta TODAS as formas num arquivo só, citado
//           pelos comentários JSDoc do jogo e pela documentação (dividir mudaria essas referências)
//   codigo  todo o resto: lógica do jogo, estilos e ferramentas (inclusive .ts que não seja declaração)
const REGRAS = [
  { tipo: 'gerado', casa: /^js\/voz\// },
  { tipo: 'gerado', casa: /^ferramentas\/gerado\// },
  { tipo: 'gerado', casa: /^index\.html$/ },
  { tipo: 'dados', casa: /^js\/conteudo\// },
  { tipo: 'dados', casa: /^js\/arte\/icones\// },
  { tipo: 'dados', casa: /^js\/.*\/falas\.js$/ },
  { tipo: 'dados', casa: /^js\/personagens\/elenco\.js$/ },
  { tipo: 'dados', casa: /^js\/arte\/pixelart-unicornio-moldes\.js$/ },
  { tipo: 'dados', casa: /^js\/sistemas\/musicas-faixas\.js$/ },
  { tipo: 'codigo', casa: /^js\/.*\.js$/ },
  { tipo: 'codigo', casa: /^css\/.*\.css$/ },
  { tipo: 'tipos', casa: /\.d\.ts$/ },
  { tipo: 'codigo', casa: /^ferramentas\/.*\.(js|py|html|ts)$/ },
];

// Exceções temporárias: caminho → motivo. O arquivo aparece na saída, mas não faz falhar.
// Exceção que não precisa mais (arquivo já dentro do limite) vira aviso: tire daqui.
const EXCECOES = {
};

// pastas que a conferência percorre (e só elas)
const PASTAS = ['js', 'css', 'ferramentas'];
const AVULSOS = ['index.html'];
const EXTENSOES = /\.(js|css|py|html|ts)$/;

function regra(rel) {
  const r = REGRAS.find((x) => x.casa.test(rel));
  return r ? r.tipo : null;
}

// linhas como o `wc -l` conta num arquivo terminado em \n (sem \n no fim, a última linha também conta)
function linhas(arq) {
  const t = fs.readFileSync(arq, 'utf8');
  if (!t.length) return 0;
  const n = t.split('\n').length;
  return t.endsWith('\n') ? n - 1 : n;
}

function listar(raiz) {
  const lista = [];
  function andar(dir) {
    const abs = path.join(raiz, dir);
    if (!fs.existsSync(abs)) return;
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      const rel = dir + '/' + ent.name;
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
        // gerados inteiros: nem entra (js/voz tem dezenas de MB)
        if (regra(rel + '/x.js') === 'gerado' || regra(rel + '/x.json') === 'gerado') continue;
        andar(rel);
      } else if (ent.isFile() && EXTENSOES.test(ent.name)) lista.push(rel);
    }
  }
  PASTAS.forEach(andar);
  AVULSOS.forEach((f) => { if (fs.existsSync(path.join(raiz, f))) lista.push(f); });
  return lista.sort();
}

// confere uma pasta do jogo; devolve { passam, excecoes, sobrando, semRegra, total }
function conferir(raiz) {
  const passam = [], excecoes = [], sobrando = [], semRegra = [], todos = [];
  for (const rel of listar(raiz)) {
    const tipo = regra(rel);
    if (tipo === 'gerado') continue;
    if (!tipo) { semRegra.push(rel); continue; }
    const n = linhas(path.join(raiz, rel));
    const limite = LIMITE[tipo];
    const item = { rel, tipo, linhas: n, limite };
    todos.push(item);
    if (EXCECOES[rel]) {
      if (n > limite) excecoes.push(Object.assign(item, { motivo: EXCECOES[rel] }));
      else sobrando.push(item);
    } else if (n > limite) passam.push(item);
  }
  Object.keys(EXCECOES).forEach((rel) => {
    if (!todos.some((t) => t.rel === rel)) sobrando.push({ rel, linhas: 0, limite: 0, sumiu: true });
  });
  return { passam, excecoes, sobrando, semRegra, todos };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const iRaiz = args.indexOf('--raiz');
  const raiz = iRaiz >= 0 ? path.resolve(args[iRaiz + 1]) : path.join(__dirname, '..');
  const r = conferir(raiz);
  if (args.includes('--todos')) r.todos.forEach((t) => console.log(`  ${String(t.linhas).padStart(5)} / ${t.limite}  ${t.rel}`));
  r.excecoes.forEach((t) => console.log(`⚠ exceção: ${t.rel} (${t.linhas} linhas > ${t.limite}): ${t.motivo}`));
  r.sobrando.forEach((t) => console.log(`⚠ exceção sobrando em EXCECOES: ${t.rel} ${t.sumiu ? '(arquivo não existe mais)' : `(${t.linhas} linhas, já cabe em ${t.limite})`}`));
  r.semRegra.forEach((rel) => console.log(`⚠ sem regra de tamanho: ${rel}`));
  if (r.passam.length) {
    console.log(`✘ ${r.passam.length} arquivo(s) acima do limite (código ${LIMITE.codigo}, dados ${LIMITE.dados}, tipos ${LIMITE.tipos} linhas):`);
    r.passam.sort((a, b) => b.linhas - a.linhas).forEach((t) => console.log(`  ${t.rel}: ${t.linhas} linhas (${t.tipo}, limite ${t.limite})`));
    console.log('  Divida o arquivo por responsabilidade (docs/decisoes/divisao-em-arquivos.md).');
    process.exit(1);
  }
  console.log(`✔ tamanho: ${r.todos.length - r.excecoes.length} arquivos dentro do limite${r.excecoes.length ? ` e ${r.excecoes.length} exceção(ões)` : ''} (código ${LIMITE.codigo}, dados ${LIMITE.dados}, tipos ${LIMITE.tipos} linhas; gerados fora)`);
}

module.exports = { LIMITE, REGRAS, EXCECOES, regra, linhas, conferir };
