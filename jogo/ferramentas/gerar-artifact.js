// Gera a página para publicar no claude.ai (Artifact): o claude.ai já coloca
// doctype, <head> e viewport, então aqui ficam só o título, os estilos e o corpo.
// Este script NUNCA publica nada: só grava a página e a lista dos arquivos que vão junto.
// Uso: npm run artifact                          → /tmp/reino-testes/artifact/<data>/: tudo, em lotes
//      npm run artifact -- --desde <commit|publicado>   → só o que mudou desde o commit (publicado =
//        o registrado em artifact-publicado.txt); recusa mudança fora de commit em jogo/js, css e index.html
//      npm run artifact -- --registrar <hash> --versao vN   → troca a linha de artifact-publicado.txt
//      node jogo/ferramentas/gerar-artifact.js <saida.html>   → só a página, SÓ dentro de /tmp
// Na pasta: index.html, lote-1.json…lote-N.json (mapas `files` com ≤250 entradas; removidos = null; a página
// e os removidos vão no ÚLTIMO lote) e resumo.txt. Sem --desde, também arquivos.txt e arquivos.json (tudo).
// Publicar: skill publicar-artifact (só o orquestrador, com pedido do Leandro).
const fs = require('fs');
const path = require('path');
const D = require('./artifact-delta.js');

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

const args = process.argv.slice(2);
const opc = (n) => { const i = args.indexOf(n); return i >= 0 ? (args[i + 1] || '') : null; };

if (opc('--registrar') !== null) {
  try { D.registrar(opc('--registrar'), opc('--versao')); } catch (e) { console.error('✘ ' + e.message); process.exit(2); }
  console.log('✔ artifact-publicado.txt:', JSON.stringify(D.lerRegistro()), '(deixe para o commit)');
  process.exit(0);
}

const pedida = args[0] && !args[0].startsWith('--') ? args[0] : null;
const saida = path.resolve(pedida || saidaPadrao());
const real = (p) => { let d = p; while (!fs.existsSync(d)) d = path.dirname(d); return path.join(fs.realpathSync(d), path.relative(d, p)); };
if (!saida.startsWith('/tmp/') || !real(saida).startsWith('/tmp/')) {
  console.error(`✘ proibido: a saída tem que ficar dentro de /tmp (recebido: ${saida}). Sem argumento: /tmp/reino-testes/artifact/<data>/`);
  process.exit(2);
}
let desde = opc('--desde');
if (desde !== null) {
  if (desde === 'publicado') desde = D.lerRegistro().hash;
  if (!desde) { console.error('✘ uso: --desde <commit|publicado>'); process.exit(2); }
  const sujo = D.sujas();
  if (sujo.length) { console.error('✘ mudança fora de commit (o delta compara commits):\n  ' + sujo.join('\n  ')); process.exit(2); }
}
const html = pagina();
const lista = arquivos(html);
fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.writeFileSync(saida, html);
console.log('Página gerada em', saida);
if (pedida) { console.log('Nada foi publicado.'); process.exit(0); }   // saída pedida: só a página

const pasta = path.dirname(saida);
const d = desde !== null ? D.delta(desde) : { desde: null, novos: lista, mudados: [], removidos: [], pagina: true };
const grupos = D.lotes(d, JOGO);
grupos.forEach((g, i) => fs.writeFileSync(path.join(pasta, `lote-${i + 1}.json`), JSON.stringify(g, null, 1) + '\n'));
const resumo = [
  desde !== null ? `Delta desde ${desde} até ${require('child_process').execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim()}` : 'Lista inteira',
  `Página: ${saida}${d.pagina ? ' (mudou)' : ' (vai de novo no último lote)'}`,
  `Novos (${d.novos.length}):`, ...d.novos.map((f) => '  + ' + f),
  `Mudados (${d.mudados.length}):`, ...d.mudados.map((f) => '  ~ ' + f),
  `Removidos (${d.removidos.length}, como null no último lote):`, ...d.removidos.map((f) => '  - ' + f),
  `Lotes (${grupos.length}; a página vai no último): ` + grupos.map((g, i) => `lote-${i + 1}.json ${Object.keys(g).length}`).join(', '),
];
fs.writeFileSync(path.join(pasta, 'resumo.txt'), resumo.join('\n') + '\n');
console.log(resumo.join('\n'));
if (desde === null) {
  const mapa = {};
  lista.forEach((f) => { mapa[f] = path.join(JOGO, f); });
  fs.writeFileSync(path.join(pasta, 'arquivos.txt'), lista.join('\n') + '\n');
  fs.writeFileSync(path.join(pasta, 'arquivos.json'), JSON.stringify(mapa, null, 1) + '\n');
}
console.log(`Em ${pasta}. Nada foi publicado.`);
