// mp3 órfãos do vozes-cache: gravações que nenhuma chave do vozes-indice.json usa (texto que mudou, perfil trocado).
// Usado pelo vozes.js (npm run vozes -- --orfaos [--aplicar]); aqui só a regra, sem ler argv.
const fs = require('fs');
const path = require('path');

// lista os órfãos de <gerado>/vozes-cache: [{ rel, bytes }] (rel = '<voz>/<arquivo>.mp3', como no índice)
function acharOrfaos(gerado) {
  const cache = path.join(gerado, 'vozes-cache');
  // caminhos do índice resolvidos como o empacotar-vozes.js os acha (path.join(cache, rel)): "./claude/x.mp3",
  // "ingles//y.mp3" e "claude/../ingles/z.mp3" são arquivos do cache
  const usados = new Set(Object.values(JSON.parse(fs.readFileSync(path.join(gerado, 'vozes-indice.json'), 'utf8')))
    .map((r) => path.relative(cache, path.join(cache, String(r))).split(path.sep).join('/')));
  if (!fs.existsSync(cache)) return [];
  const saida = [];
  fs.readdirSync(cache, { withFileTypes: true }).filter((d) => d.isDirectory()).sort((a, b) => a.name.localeCompare(b.name)).forEach((d) => {
    fs.readdirSync(path.join(cache, d.name), { withFileTypes: true }).forEach((a) => {
      const rel = d.name + '/' + a.name;
      if (a.isFile() && a.name.endsWith('.mp3') && !usados.has(rel)) saida.push({ rel, bytes: fs.statSync(path.join(cache, rel)).size });
    });
  });
  return saida.sort((a, b) => a.rel.localeCompare(b.rel));
}

// travas antes de apagar: gerado/ e vozes-cache/ de verdade (não link) e índice completo: toda fala do falas.json
// com o seu mp3 na chave certa (pendentes() vazio). Índice vazio, quebrado ou de uma gravação pela metade recusa.
function podeAplicar(gerado) {
  const cache = path.join(gerado, 'vozes-cache');
  if ([gerado, cache].some((d) => fs.lstatSync(d).isSymbolicLink())) return 'gerado/ ou vozes-cache/ é link simbólico';
  if (!fs.existsSync(path.join(gerado, 'falas.json'))) return 'sem falas.json (rode o npm run vozes antes)';
  const falta = require('./vozes').pendentes(gerado).length;
  return falta ? `${falta} fala(s) sem áudio no índice (índice incompleto ou gravação pendente: rode o npm run vozes antes)` : null;
}

// tira só os órfãos (com as travas do podeAplicar): caminho calculado e conferido (real) dentro do vozes-cache,
// arquivo .mp3 comum; o resto fica
function apagarOrfaos(gerado, orfaos) {
  const motivo = podeAplicar(gerado);
  if (motivo) throw new Error(`--aplicar recusado: ${motivo}`);
  const cache = fs.realpathSync(path.join(gerado, 'vozes-cache'));
  let apagados = 0;
  orfaos.forEach(({ rel }) => {
    const arq = path.resolve(cache, rel);
    const dentro = path.relative(cache, arq);
    if (!/^[^/]+\/[^/]+\.mp3$/.test(dentro) || dentro.startsWith('..')) throw new Error(`órfão fora do vozes-cache: ${rel}`);
    const st = fs.lstatSync(arq);
    if (!st.isFile() || path.relative(cache, fs.realpathSync(arq)) !== dentro) throw new Error(`não é um mp3 do vozes-cache: ${rel}`);
    fs.unlinkSync(arq);
    apagados++;
  });
  return apagados;
}

const mb = (b) => (b / 1048576).toFixed(1) + ' MB';

// o passo --orfaos do vozes.js: mostra (e, com aplicar, apaga); devolve quantos achou
function orfaos(gerado, aplicar) {
  const lista = acharOrfaos(gerado);
  const bytes = lista.reduce((t, o) => t + o.bytes, 0);
  console.log(`▶ órfãos do vozes-cache: ${lista.length} mp3 que nenhuma chave do vozes-indice.json usa (${mb(bytes)})`);
  lista.slice(0, 10).forEach((o) => console.log(`    ${o.rel}`));
  if (lista.length > 10) console.log(`    … e mais ${lista.length - 10}`);
  if (!lista.length) return 0;
  if (aplicar) { console.log(`✔ ${apagarOrfaos(gerado, lista)} órfão(s) tirado(s) do vozes-cache (${mb(bytes)})`); return lista.length; }
  const motivo = podeAplicar(gerado);
  console.log(motivo ? `  (só a lista; o --aplicar seria recusado agora: ${motivo})`
    : '  (só a lista; o --aplicar seria aceito: npm run vozes -- --orfaos --aplicar)');
  return lista.length;
}

module.exports = { acharOrfaos, apagarOrfaos, podeAplicar, orfaos };
