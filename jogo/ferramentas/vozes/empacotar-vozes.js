// Junta os áudios gravados em pacotes que o jogo carrega (js/voz/<pacote>.js).
// Uso: node ferramentas/vozes/empacotar-vozes.js   (grava em js/voz/ e apaga os pacotes que não existem mais)
//      … --saida <pasta>: grava numa pasta em /tmp, para conferir; só escreve os pacotes, NUNCA apaga nada lá
const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'gerado');
const VOZ_JOGO = path.join(__dirname, '..', '..', 'js', 'voz');
const iSaida = process.argv.indexOf('--saida');
let saida = VOZ_JOGO;
if (iSaida >= 0) {
  // pasta pedida: só dentro de /tmp (conferida antes de ler qualquer coisa)
  const pedida = process.argv[iSaida + 1];
  const abs = pedida && !pedida.startsWith('--') ? path.resolve(pedida) : '';
  const real = (p) => { let d = p; while (!fs.existsSync(d)) d = path.dirname(d); return path.join(fs.realpathSync(d), path.relative(d, p)); };
  if (!abs || !abs.startsWith('/tmp/') || abs.split('/').includes('..') || !real(abs).startsWith('/tmp/')) {
    console.error(`✘ proibido: --saida precisa ser uma pasta dentro de /tmp (ex.: /tmp/reino-testes/vozes/saida); recebido: ${pedida || '(nada)'}`);
    process.exit(2);
  }
  saida = abs;
}
const { falas } = JSON.parse(fs.readFileSync(path.join(base, 'falas.json'), 'utf8'));
const indice = JSON.parse(fs.readFileSync(path.join(base, 'vozes-indice.json'), 'utf8'));
fs.mkdirSync(saida, { recursive: true });

const pacotes = {};
const faltando = [];
falas.forEach((f) => {
  const rel = indice[f.chave];
  const arq = rel && path.join(base, 'vozes-cache', rel);
  if (!arq || !fs.existsSync(arq)) { faltando.push(f.voz + ': ' + f.fala); return; }
  const b64 = fs.readFileSync(arq).toString('base64');
  f.pacotes.forEach((p) => { (pacotes[p] = pacotes[p] || {})[f.chave] = b64; });
});
if (faltando.length) {
  console.log('✘ Falas sem áudio (rode o gerar-vozes.py):\n  ' + faltando.join('\n  '));
  process.exit(1);
}

// apaga pacotes antigos que não existem mais (só em js/voz do jogo; na --saida nada é apagado)
if (saida === VOZ_JOGO) fs.readdirSync(saida).filter((a) => a.endsWith('.js') && !pacotes[a.replace(/\.js$/, '')]).forEach((a) => fs.unlinkSync(path.join(saida, a)));

let total = 0, reescritos = 0, iguais = 0;
Object.keys(pacotes).sort().forEach((p) => {
  // chaves em ordem alfabética: a ordem do falas.json não muda o pacote
  const ordenado = {};
  Object.keys(pacotes[p]).sort().forEach((k) => { ordenado[k] = pacotes[p][k]; });
  // o cabeçalho cita o caminho antigo da ferramenta de propósito: mudar o texto mudaria os pacotes já gravados
  const conteudo = '/* vozes gravadas — gerado por ferramentas/empacotar-vozes.js, não editar */\n'
    + 'Reino.Voz.registrar(' + JSON.stringify(p) + ',' + JSON.stringify(ordenado) + ');\n';
  // pacote igual não é regravado (nem republicado no artifact)
  const arq = path.join(saida, p + '.js');
  if (fs.existsSync(arq) && fs.readFileSync(arq, 'utf8') === conteudo) iguais++;
  else { fs.writeFileSync(arq, conteudo); reescritos++; }
  total += conteudo.length;
  console.log(`  js/voz/${p}.js: ${Object.keys(pacotes[p]).length} falas, ${(conteudo.length / 1048576).toFixed(2)} MB`);
});
console.log(`✔ ${Object.keys(pacotes).length} pacotes, ${(total / 1048576).toFixed(1)} MB no total; ${reescritos} reescritos, ${iguais} iguais`);
