// Gera a página para publicar no claude.ai (Artifact): o claude.ai já coloca
// doctype, <head> e viewport, então aqui ficam só o título, os estilos e o corpo.
// Este script NUNCA publica nada: só grava a página e a lista dos arquivos que vão junto.
// Uso: node jogo/ferramentas/gerar-artifact.js                → /tmp/reino-testes/artifact/<data>/index.html
//      node jogo/ferramentas/gerar-artifact.js <saida.html>   → grava onde pedido, SÓ dentro de /tmp
//        (a publicação é feita pelo Leandro/orquestrador a partir de /tmp; nada é gravado no repositório)
// Sem argumento, ao lado da página: arquivos.txt (um caminho publicado por linha, na ordem de carga) e
// arquivos.json ({ "css/x.css": "/caminho/absoluto/jogo/css/x.css", … }, o mapa `files` da publicação):
// todos os css e js do manifesto (js/manifesto.js), na ordem, e depois os pacotes js/voz/*.js.
const fs = require('fs');
const path = require('path');

const JOGO = path.join(__dirname, '..');
const MANIFESTO = require(path.join(JOGO, 'js', 'manifesto.js'));

function pagina() {
  const html = fs.readFileSync(path.join(JOGO, 'index.html'), 'utf8');
  return html
    .replace(/<!doctype html>\s*/i, '')
    .replace(/<!-- Gerado por ferramentas\/gerar-index\.js[^>]*-->\s*/, '')
    .replace(/<\/?html[^>]*>\s*/gi, '')
    .replace(/<\/?head>\s*/gi, '')
    .replace(/<\/?body>\s*/gi, '')
    .replace(/<meta charset[^>]*>\s*/i, '')
    .replace(/<meta name="viewport"[^>]*>\s*/i, '').trim() + '\n';
}

// arquivos que a página carrega (manifesto, na ordem) + os pacotes de voz (carregados sob demanda)
function arquivos(html) {
  const vozes = fs.readdirSync(path.join(JOGO, 'js', 'voz')).filter((f) => f.endsWith('.js')).sort().map((f) => 'js/voz/' + f);
  const lista = MANIFESTO.css.concat(MANIFESTO.scripts.map((s) => s.js), vozes);
  // a página tem que citar exatamente os arquivos do manifesto (senão o index.html está desatualizado)
  const citados = [...html.matchAll(/(?:href|src)="((?:css|js)\/[^"]+)"/g)].map((m) => m[1]);
  const fora = citados.filter((c) => !lista.includes(c)).concat(lista.filter((c) => !c.startsWith('js/voz/') && !citados.includes(c)));
  if (fora.length) throw new Error('index.html e js/manifesto.js não batem (rode npm run index): ' + fora.join(', '));
  lista.forEach((f) => { if (!fs.existsSync(path.join(JOGO, f))) throw new Error('arquivo do manifesto não existe: ' + f); });
  return lista;
}

function saidaPadrao() {
  const d = new Date(), n2 = (x) => String(x).padStart(2, '0');
  const quando = `${d.getFullYear()}${n2(d.getMonth() + 1)}${n2(d.getDate())}-${n2(d.getHours())}${n2(d.getMinutes())}${n2(d.getSeconds())}`;
  return path.join('/tmp/reino-testes/artifact', quando, 'index.html');
}

const pedida = process.argv[2];
const saida = path.resolve(pedida || saidaPadrao());
const real = (p) => { let d = p; while (!fs.existsSync(d)) d = path.dirname(d); return path.join(fs.realpathSync(d), path.relative(d, p)); };
if (!saida.startsWith('/tmp/') || !real(saida).startsWith('/tmp/')) {
  console.error(`✘ proibido: a saída tem que ficar dentro de /tmp (recebido: ${saida}). Sem argumento: /tmp/reino-testes/artifact/<data>/`);
  process.exit(2);
}
const html = pagina();
const lista = arquivos(html);
fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.writeFileSync(saida, html);
console.log('Página gerada em', saida);
console.log(`Arquivos que vão junto na publicação (${lista.length}, na ordem; caminho publicado = caminho sob jogo/):`);
lista.forEach((f) => console.log('  ' + f));
if (!pedida) {
  // só na pasta própria em /tmp: com saída pedida, grava apenas a página (como sempre)
  const mapa = {};
  lista.forEach((f) => { mapa[f] = path.join(JOGO, f); });
  const pasta = path.dirname(saida);
  fs.writeFileSync(path.join(pasta, 'arquivos.txt'), lista.join('\n') + '\n');
  fs.writeFileSync(path.join(pasta, 'arquivos.json'), JSON.stringify(mapa, null, 1) + '\n');
  console.log(`Lista em ${path.join(pasta, 'arquivos.txt')} e mapa "files" em ${path.join(pasta, 'arquivos.json')}.`);
}
console.log('Nada foi publicado.');
