// Junta os áudios gravados em pacotes que o jogo carrega (js/voz/<pacote>.js).
// Uso: node ferramentas/vozes/empacotar-vozes.js   (--saida <pasta>: grava em outra pasta, para conferir)
const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'gerado');
const { falas } = JSON.parse(fs.readFileSync(path.join(base, 'falas.json'), 'utf8'));
const indice = JSON.parse(fs.readFileSync(path.join(base, 'vozes-indice.json'), 'utf8'));
const iSaida = process.argv.indexOf('--saida');
const saida = iSaida >= 0 ? path.resolve(process.argv[iSaida + 1]) : path.join(__dirname, '..', '..', 'js', 'voz');
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

// apaga pacotes antigos que não existem mais
fs.readdirSync(saida).filter((a) => a.endsWith('.js') && !pacotes[a.replace(/\.js$/, '')]).forEach((a) => fs.unlinkSync(path.join(saida, a)));

let total = 0;
Object.keys(pacotes).sort().forEach((p) => {
  // o cabeçalho cita o caminho antigo da ferramenta de propósito: mudar o texto mudaria os pacotes já gravados
  const conteudo = '/* vozes gravadas — gerado por ferramentas/empacotar-vozes.js, não editar */\n'
    + 'Reino.Voz.registrar(' + JSON.stringify(p) + ',' + JSON.stringify(pacotes[p]) + ');\n';
  fs.writeFileSync(path.join(saida, p + '.js'), conteudo);
  total += conteudo.length;
  console.log(`  js/voz/${p}.js: ${Object.keys(pacotes[p]).length} falas, ${(conteudo.length / 1048576).toFixed(2)} MB`);
});
console.log(`✔ ${Object.keys(pacotes).length} pacotes, ${(total / 1048576).toFixed(1)} MB no total`);
