// O app da Play Store (android/, uma Trusted Web Activity que abre https://reino-dos-unicornios.vercel.app no Chrome).
// Guia da publicação e do acesso restrito: android/README.md.
// Uso: node jogo/ferramentas/android/android.js [opções]            (npm run android -- [opções])
//   (sem opção)        build do .aab (o que vai para a Play Console) e do .apk (para instalar por cabo), assinados
//                      com a chave de envio, em ~/Documents/reino-dos-unicornios-play/ (--saida <pasta> muda).
//                      Na primeira vez cria a chave de envio, FORA do repositório:
//                      ~/.config/reino-dos-unicornios/android/ (envio.jks + assinatura.properties com a senha).
//                      Guarde uma cópia dessa pasta: sem ela, trocar a chave pede suporte do Google.
//   --nova-versao      soma 1 no versionCode (android/versao.properties) antes do build: cada .aab enviado à Play
//                      precisa de um número maior. O jogo em si atualiza pela Vercel, sem novo envio.
//   --impressao <SHA-256>   põe essa impressão digital no vercel/loja/assetlinks.json (o site publicado em
//                      /.well-known/assetlinks.json). A da chave de envio entra sozinha no build; a da "chave de
//                      assinatura do app" vem da Play Console (Testar e lançar > Integridade do app > Assinatura do
//                      app > Certificado da chave de assinatura do app > SHA-256). Depois: commit, push (a Vercel publica).
//   --instalar         instala o .apk no aparelho ligado por cabo (adb install -r), depois do build.
//   --conferir-site    confere o /.well-known/assetlinks.json publicado na Vercel contra o do repositório e pergunta
//                      à API de Digital Asset Links do Google se o app está ligado ao site. Não faz build.
//   --sem-build        com --impressao: só grava a impressão, sem build.
//   --loja             só as imagens da página da loja, em <saida>/loja/ (pelo npm run ver, save sintético): capturas
//                      de celular (recortadas em 1:2, o limite da Play) e de tablet e o "recurso gráfico" 1024×500.
// Precisa do JDK 17+ e do Android SDK (ANDROID_HOME ou ~/Android/Sdk). Não toca no jogo, no banco nem em save algum.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawnSync } = require('child_process');
if (require.main === module) require('../ajuda').ajuda(__filename);
const { conferirOpcoes } = require('../ajuda');

const RAIZ = path.join(__dirname, '..', '..', '..');
const ANDROID = path.join(RAIZ, 'android');
const VERSAO = path.join(ANDROID, 'versao.properties');
const ASSETLINKS = path.join(RAIZ, 'vercel', 'loja', 'assetlinks.json');
const PASTA_CHAVE = process.env.REINO_ANDROID_CHAVES || path.join(os.homedir(), '.config', 'reino-dos-unicornios', 'android');
const ASSINATURA = path.join(PASTA_CHAVE, 'assinatura.properties');
const SITE = 'https://reino-dos-unicornios.vercel.app';
const APP_ID = /applicationId\s*:\s*'([^']+)'/.exec(fs.readFileSync(path.join(ANDROID, 'app', 'build.gradle'), 'utf8'))[1];
const SHA256 = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

const lerProps = (arq) => Object.fromEntries(fs.readFileSync(arq, 'utf8').split('\n')
  .filter((l) => /^\s*[^#\s][^=]*=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));

function ambiente() {
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(os.homedir(), 'Android', 'Sdk');
  if (!fs.existsSync(path.join(sdk, 'platforms'))) throw new Error(`Android SDK não encontrado em ${sdk} (ANDROID_HOME)`);
  const jdks = ['/usr/lib/jvm/java-21-openjdk', '/usr/lib/jvm/java-17-openjdk'];
  const javaHome = process.env.JAVA_HOME || jdks.find((j) => fs.existsSync(path.join(j, 'bin', 'java')));
  return Object.assign({}, process.env, { ANDROID_HOME: sdk }, javaHome ? { JAVA_HOME: javaHome } : {});
}

// a chave de envio: cria na primeira vez (senha aleatória, guardada ao lado, só o dono lê)
function garantirChave() {
  if (fs.existsSync(ASSINATURA)) return lerProps(ASSINATURA);
  fs.mkdirSync(PASTA_CHAVE, { recursive: true, mode: 0o700 });
  const jks = path.join(PASTA_CHAVE, 'envio.jks');
  if (fs.existsSync(jks)) throw new Error(`${jks} existe sem assinatura.properties: não sobrescrevo; ponha o arquivo de volta`);
  const senha = crypto.randomBytes(18).toString('base64url');
  execFileSync('keytool', ['-genkeypair', '-keystore', jks, '-storetype', 'PKCS12', '-alias', 'envio',
    '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000', '-storepass', senha, '-keypass', senha,
    '-dname', 'CN=Reino dos Unicornios, O=Reino dos Unicornios, C=BR'], { stdio: 'pipe' });
  fs.chmodSync(jks, 0o600);
  fs.writeFileSync(ASSINATURA, ['# Chave de ENVIO do app da Play Store (android/README.md). Guarde uma cópia desta pasta.',
    `storeFile=${jks}`, `storePassword=${senha}`, 'keyAlias=envio', `keyPassword=${senha}`, ''].join('\n'), { mode: 0o600 });
  console.log(`✔ chave de envio criada em ${PASTA_CHAVE} (guarde uma cópia desta pasta)`);
  return lerProps(ASSINATURA);
}

function impressaoDaChave(p) {
  const saida = execFileSync('keytool', ['-list', '-v', '-keystore', p.storeFile, '-alias', p.keyAlias,
    '-storepass', p.storePassword], { encoding: 'utf8' });
  const m = /SHA256:\s*([0-9A-F:]{95})/.exec(saida);
  if (!m) throw new Error('não achei o SHA256 na saída do keytool');
  return m[1];
}

function lerAssetlinks(arq = ASSETLINKS) { return JSON.parse(fs.readFileSync(arq, 'utf8')); }
// põe a impressão no assetlinks.json (uma vez só); devolve true se mudou
function porImpressao(sha, arq = ASSETLINKS) {
  sha = sha.trim().toUpperCase();
  if (!SHA256.test(sha)) throw new Error(`impressão inválida: ${sha} (esperado 32 pares hexadecimais separados por ":")`);
  const links = lerAssetlinks(arq);
  const alvo = links.find((l) => l.target && l.target.package_name === APP_ID);
  if (!alvo) throw new Error(`${arq} sem o app ${APP_ID}`);
  if (alvo.target.sha256_cert_fingerprints.includes(sha)) return false;
  alvo.target.sha256_cert_fingerprints.push(sha);
  fs.writeFileSync(arq, JSON.stringify(links, null, 2) + '\n');
  return true;
}

function novaVersao() {
  const v = lerProps(VERSAO), code = Number(v.versionCode) + 1;
  const nome = v.versionName.split('.').map(Number);
  nome[2] = (nome[2] || 0) + 1;
  const texto = fs.readFileSync(VERSAO, 'utf8').replace(/^versionCode=.*$/m, `versionCode=${code}`)
    .replace(/^versionName=.*$/m, `versionName=${nome.join('.')}`);
  fs.writeFileSync(VERSAO, texto);
  console.log(`✔ versão ${nome.join('.')} (versionCode ${code}) em android/versao.properties (faça o commit)`);
}

// o build do gradle mora em /tmp (nada se grava no android/ além do que é do repositório), um por árvore
const TMP = path.join(process.env.REINO_TESTES || '/tmp/reino-testes', 'android',
  crypto.createHash('sha1').update(path.resolve(RAIZ)).digest('hex').slice(0, 10));

function build(saida) {
  const r = spawnSync(path.join(ANDROID, 'gradlew'), ['--no-daemon', '-q', `-PreinoBuild=${TMP}/build`,
    '--project-cache-dir', path.join(TMP, 'gradle'), 'bundleRelease', 'assembleRelease'],
    { cwd: ANDROID, env: Object.assign(ambiente(), { REINO_ANDROID_ASSINATURA: ASSINATURA }), stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`gradle falhou (código ${r.status})`);
  const v = lerProps(VERSAO), base = `reino-dos-unicornios-${v.versionName}-${v.versionCode}`;
  fs.mkdirSync(saida, { recursive: true });
  const aab = path.join(saida, base + '.aab'), apk = path.join(saida, base + '.apk');
  fs.copyFileSync(path.join(TMP, 'build', 'app', 'outputs', 'bundle', 'release', 'app-release.aab'), aab);
  fs.copyFileSync(path.join(TMP, 'build', 'app', 'outputs', 'apk', 'release', 'app-release.apk'), apk);
  return { aab, apk };
}

// cenas da página da loja: [nome, opções do npm run ver]
const CENAS_LOJA = [
  ['1-mapa', []],
  ['2-pergunta', ['--tela', 'sala:ma10a1', '--passos', 'perguntas']],
  ['3-estabulo', ['--tela', 'estabulo']],
  ['4-loja', ['--tela', 'loja', '--estrelas', '500']],
];
function imagensDaLoja(saida) {
  const pasta = path.join(saida, 'loja'), ver = path.join(__dirname, '..', 'testes', 'ver.js');
  const verFoto = (nome, opcoes, tamanho, recorte) => {
    const id = `play-${nome}-${tamanho}`;
    const r = spawnSync(process.execPath, [ver, ...opcoes, '--tamanhos', tamanho, '--nome', id,
      ...(recorte ? ['--recorte', recorte] : [])], { cwd: RAIZ, encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`npm run ver falhou em ${id}:\n${r.stdout}${r.stderr}`);
    return path.join(process.env.REINO_TESTES || '/tmp/reino-testes', 'ver', id, tamanho + (recorte ? '-recorte' : '') + '.png');
  };
  // a Play só aceita PNG de 24 bits (sem canal alfa)
  const { PNG } = require('pngjs');
  const copiar = (de, nome) => fs.writeFileSync(path.join(pasta, nome),
    PNG.sync.write(PNG.sync.read(fs.readFileSync(de)), { colorType: 2, inputHasAlpha: true }));
  fs.mkdirSync(pasta, { recursive: true });
  CENAS_LOJA.forEach(([nome, opcoes]) => {
    // celular 390×844 passa de 1:2 (a Play recusa): recorte de 390×780
    copiar(verFoto(nome, opcoes, 'celular', '0,0,390,780'), `celular-${nome}.png`);
    copiar(verFoto(nome, opcoes, 'tablet'), `tablet-${nome}.png`);
  });
  // recurso gráfico: o meio do mapa no notebook (1366×768), 1024×500 em escala 1
  copiar(verFoto('recurso', [], 'notebook', '171,134,1024,500'), 'recurso-grafico-1024x500.png');
  // o ícone da loja é PNG de 32 bits (com alfa): o do app, como está
  fs.copyFileSync(path.join(RAIZ, 'vercel', 'pwa', 'icone-512.png'), path.join(pasta, 'icone-512.png'));
  return pasta;
}

// devolve true se o site publicado e o Google batem com o repositório
async function conferirSite() {
  const local = lerAssetlinks();
  let ok = true;
  let publicado = null;
  try {
    const r = await fetch(`${SITE}/.well-known/assetlinks.json`, { cache: 'no-store' });
    publicado = r.ok ? await r.json() : null;
    if (!r.ok) ok = false;
    if (!r.ok) console.log(`✘ ${SITE}/.well-known/assetlinks.json: HTTP ${r.status} (ainda não publicado?)`);
  } catch (e) { ok = false; console.log('✘ não deu para baixar o assetlinks.json publicado:', e.message); }
  if (publicado) {
    const igual = JSON.stringify(publicado) === JSON.stringify(local);
    ok = ok && igual;
    console.log(igual ? '✔ o assetlinks.json publicado é igual ao do repositório'
      : '✘ o assetlinks.json publicado é diferente do do repositório (falta publicar na Vercel?)');
  }
  const api = 'https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site='
    + encodeURIComponent(SITE) + '&relation=delegate_permission/common.handle_all_urls';
  try {
    const j = await (await fetch(api)).json();
    const achados = (j.statements || []).filter((s) => s.target && s.target.androidApp
      && s.target.androidApp.packageName === APP_ID).map((s) => s.target.androidApp.certificate.sha256Fingerprint);
    console.log(achados.length ? `✔ Google vê o app ${APP_ID} ligado ao site, com ${achados.length} chave(s):`
      : `✘ Google ainda não vê o app ${APP_ID} ligado ao site (o cache dele pode levar algumas horas)`);
    achados.forEach((a) => console.log('   ' + a));
    const faltam = local[0].target.sha256_cert_fingerprints.filter((x) => !achados.includes(x));
    faltam.forEach((x) => console.log('✘ o Google ainda não vê esta chave:', x));
    ok = ok && !faltam.length;
  } catch (e) { ok = false; console.log('✘ API de Digital Asset Links fora:', e.message); }
  return ok;
}

async function principal(argv) {
  conferirOpcoes(argv, { valores: ['--impressao', '--saida'], booleanas: ['--nova-versao', '--instalar', '--conferir-site', '--sem-build', '--loja'] });
  const valor = (o) => (argv.includes(o) ? argv[argv.indexOf(o) + 1] : null);
  if (argv.includes('--conferir-site')) { if (!(await conferirSite())) process.exitCode = 1; return; }
  if (argv.includes('--sem-build') && !valor('--impressao')) throw new Error('--sem-build só vale com --impressao');
  const saida = path.resolve(valor('--saida') || path.join(os.homedir(), 'Documents', 'reino-dos-unicornios-play'));
  if (argv.includes('--loja')) return console.log('✔ imagens da página da loja em', imagensDaLoja(saida));
  if (valor('--impressao')) {
    const mudou = porImpressao(valor('--impressao'));
    console.log(mudou ? `✔ impressão posta em ${path.relative(RAIZ, ASSETLINKS)} (faça o commit e o push: a Vercel publica)`
      : '• essa impressão já estava no assetlinks.json');
    if (argv.includes('--sem-build')) return;
  }
  const chave = garantirChave();
  const sha = impressaoDaChave(chave);
  if (porImpressao(sha)) console.log(`✔ impressão da chave de envio posta em ${path.relative(RAIZ, ASSETLINKS)} (faça o commit e o push)`);
  if (argv.includes('--nova-versao')) novaVersao();
  const r = build(saida);
  const v = lerProps(VERSAO);
  console.log(`\n✔ ${APP_ID} versão ${v.versionName} (versionCode ${v.versionCode})`);
  console.log(`  para a Play Console: ${r.aab}`);
  console.log(`  para instalar por cabo: ${r.apk}`);
  console.log(`  chave de envio (SHA-256): ${sha}`);
  if (argv.includes('--instalar')) execFileSync('adb', ['install', '-r', r.apk], { stdio: 'inherit' });
}

module.exports = { porImpressao, lerProps, SHA256, APP_ID };

if (require.main === module) {
  principal(process.argv.slice(2)).catch((e) => { console.error('✘', e.message); process.exit(1); });
}
