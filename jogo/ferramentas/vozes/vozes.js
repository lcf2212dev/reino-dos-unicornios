// Vozes de ponta a ponta (npm run vozes): listar → gravar → empacotar → conferir por transcrição.
// Uso (da raiz do repositório):
//   node jogo/ferramentas/vozes/vozes.js [--sem-listar] [--sem-gravar] [--sem-empacotar] [--sem-conferir] [--saida <pasta>]
//   1. listar     listar-falas.js: tudo o que o jogo fala → ferramentas/gerado/falas.json
//   2. gravar     gerar-vozes.py: grava SÓ as falas sem áudio no cache (precisa de uv ou python com edge-tts,
//                 ffmpeg e internet). Sem fala nova, nem roda. Antes, guarda o índice antigo em .vozes/
//   3. empacotar  empacotar-vozes.js: junta os áudios em js/voz/<pacote>.js (ou em --saida <pasta>; aí
//                 também compara com os js/voz/*.js do jogo e diz se ficou idêntico)
//   4. conferir   conferir-vozes.py: transcreve só as gravações novas (faster-whisper) e acusa as que divergem.
//                 Python, nesta ordem: .vozes/venv-whisper; senão `uv run --with faster-whisper`; senão cria o
//                 .vozes/venv-whisper (python3 -m venv + pip install faster-whisper; baixa pacotes).
//                 O modelo do whisper fica no cache do usuário (~/.cache/huggingface).
// Temporários das vozes em <raiz do repositório>/.vozes/ (ignorado pelo git; o /tmp é memória).
// Cada passo pode ser pulado. As vozes são achadas pelo TEXTO EXATO: texto falado mudou = gravação nova.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const AQUI = __dirname;
const GERADO = path.join(AQUI, '..', 'gerado');
const VOZ_JOGO = path.join(AQUI, '..', '..', 'js', 'voz');
const RAIZ = path.resolve(AQUI, '..', '..', '..');
const PASTA_VOZES = path.join(RAIZ, '.vozes');
const VENV = path.join(PASTA_VOZES, 'venv-whisper');
const tem = (o) => process.argv.includes(o);
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };

function rodar(titulo, cmd, args) {
  console.log(`\n▶ ${titulo}: ${cmd} ${args.map((a) => path.relative(process.cwd(), a) || a).join(' ')}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit' });
  if (r.error) throw new Error(`${titulo}: não consegui rodar ${cmd} (${r.error.message})`);
  return r.status;
}
const existe = (cmd) => spawnSync('sh', ['-c', 'command -v "$0"', cmd]).status === 0;

// mesma regra do gerar-vozes.py (arquivo()): o áudio de uma fala é <voz>/<sha1(voz|velocidade|tom|fala[|efeito])[:16]>.mp3
function pendentes() {
  const { vozes, falas } = JSON.parse(fs.readFileSync(path.join(GERADO, 'falas.json'), 'utf8'));
  return falas.filter((f) => {
    const v = vozes[f.voz];
    const partes = [v.voz, v.velocidade, v.tom, f.fala].concat(v.efeito ? [v.efeito] : []);
    const h = crypto.createHash('sha1').update(partes.join('|'), 'utf8').digest('hex').slice(0, 16);
    return !fs.existsSync(path.join(GERADO, 'vozes-cache', f.voz, h + '.mp3'));
  });
}

// python do conferir: .vozes/venv-whisper → uv run --with faster-whisper → cria o venv (avisa que baixa)
function pythonDoConferir() {
  const py = path.join(VENV, 'bin', 'python');
  if (fs.existsSync(py)) return { cmd: py, pre: [] };
  if (existe('uv')) return { cmd: 'uv', pre: ['run', '--with', 'faster-whisper', 'python'] };
  console.log(`\n⚠ sem o ${path.relative(RAIZ, VENV)} e sem uv: vou criar o venv e instalar o faster-whisper (baixa pacotes da internet)`);
  if (rodar('4. conferir (criar venv)', 'python3', ['-m', 'venv', VENV]) !== 0) return null;
  if (rodar('4. conferir (pip install)', path.join(VENV, 'bin', 'pip'), ['install', 'faster-whisper']) !== 0) return null;
  return { cmd: py, pre: [] };
}

const hash = (arq) => crypto.createHash('sha256').update(fs.readFileSync(arq)).digest('hex');
function compararComJogo(saida) {
  const lista = (d) => fs.readdirSync(d).filter((f) => f.endsWith('.js')).sort();
  const a = lista(VOZ_JOGO), b = lista(saida);
  const dif = a.filter((f) => !b.includes(f) || hash(path.join(VOZ_JOGO, f)) !== hash(path.join(saida, f))).concat(b.filter((f) => !a.includes(f)));
  if (dif.length) console.log(`  ✘ ${dif.length} pacote(s) diferentes dos js/voz/*.js do jogo: ${dif.join(', ')}`);
  else console.log(`  ✔ os ${a.length} pacotes em ${saida} são idênticos aos js/voz/*.js do jogo (sha256)`);
  return dif.length === 0;
}

function principal() {
  const falhas = [];
  const d = new Date(), n2 = (x) => String(x).padStart(2, '0');
  const quando = `${d.getFullYear()}${n2(d.getMonth() + 1)}${n2(d.getDate())}-${n2(d.getHours())}${n2(d.getMinutes())}${n2(d.getSeconds())}`;
  let antes = null;

  if (!tem('--sem-listar') && rodar('1. listar', process.execPath, [path.join(AQUI, 'listar-falas.js')]) !== 0) return ['listar'];

  if (!tem('--sem-gravar')) {
    const novas = pendentes();
    console.log(`\n▶ 2. gravar: ${novas.length} fala(s) sem áudio no cache`);
    if (novas.length) {
      novas.slice(0, 20).forEach((f) => console.log(`    ${f.voz}: ${f.fala}`));
      if (novas.length > 20) console.log(`    … e mais ${novas.length - 20}`);
      fs.mkdirSync(PASTA_VOZES, { recursive: true });
      antes = path.join(PASTA_VOZES, `indice-antes-${quando}.json`);
      fs.copyFileSync(path.join(GERADO, 'vozes-indice.json'), antes);
      console.log(`    índice antigo guardado em ${antes}`);
      const py = path.join(AQUI, 'gerar-vozes.py');
      const st = existe('uv') ? rodar('2. gravar', 'uv', ['run', '--with', 'edge-tts', 'python', py]) : rodar('2. gravar', 'python3', [py]);
      if (st !== 0) { falhas.push('gravar (precisa de edge-tts, ffmpeg e internet; sem uv: pip install edge-tts)'); return falhas; }
    } else console.log('    nada novo: gerar-vozes.py não precisa rodar');
  }

  if (!tem('--sem-empacotar')) {
    const saida = arg('--saida');
    const args = [path.join(AQUI, 'empacotar-vozes.js')].concat(saida ? ['--saida', path.resolve(saida)] : []);
    if (rodar('3. empacotar', process.execPath, args) !== 0) falhas.push('empacotar');
    else if (saida && !compararComJogo(path.resolve(saida))) falhas.push('empacotar (--saida difere do jogo)');
  }

  if (!tem('--sem-conferir')) {
    const py = path.join(AQUI, 'conferir-vozes.py');
    const args = [py].concat(antes ? ['--antes', antes] : []);
    const p = pythonDoConferir();
    const st = p ? rodar('4. conferir', p.cmd, p.pre.concat(args)) : 2;
    if (st !== 0) falhas.push(st === 2 ? 'conferir (instale o faster-whisper: instruções acima)' : 'conferir (gravações que não batem com o texto)');
  }
  return falhas;
}

try {
  const falhas = principal();
  console.log(falhas.length ? `\n✘ vozes: falhou em ${falhas.join('; ')}` : '\n✔ vozes: tudo certo');
  process.exit(falhas.length ? 1 : 0);
} catch (e) { console.error('✘ ' + e.message); process.exit(1); }
