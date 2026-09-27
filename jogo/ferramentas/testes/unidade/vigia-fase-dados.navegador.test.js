// Teste de NAVEGADOR (Chromium, servidor de TESTE): uma espera sem fim na fase de DADOS do e2e (page.evaluate que
// não volta: laço no jogo) é derrubada pelo vigia (vigia-memoria.js) como a das fotos, pelo REINO_TRAVADO_MIN.
// Bug da auditoria: só as abas das fotos eram registradas; a fase de dados (npm run e2e, e2e --so-dados) ficava
// parada para sempre, sem memória subindo, e o vigia nunca disparava.
// Jogo sintético: cópia do jogo desta worktree (pacotes de voz por link) com P.mesclar em laço só para o save
// "geracao2" do corpus da mescla. O filho roda capturarDados com REINO_TRAVADO_MIN=0.1 (6 s) e tem de sair com 3.
// REINO_TESTES própria: o relatório do vigia (esperado aqui) não cai em <pasta de testes>/vigia, que o hook
// vigia-travamento lê e acusaria como travamento de verdade. Sem a correção o teste derruba, em 60 s, o grupo do filho que ele mesmo criou (detached).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/vigia-fase-dados.navegador.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { PASTA_TESTES } = require('../guardas');

const TESTES = path.join(__dirname, '..');
const JOGO = path.join(TESTES, '..', '..');

function jogoQueTrava(pasta) {
  const raiz = path.join(pasta, 'jogo');
  fs.mkdirSync(raiz);
  ['index.html', 'css', 'js', 'servidor'].forEach((p) => fs.cpSync(path.join(JOGO, p), path.join(raiz, p), {
    recursive: true, filter: (de) => de !== path.join(JOGO, 'js', 'voz') && !/servidor[\\/]dados/.test(de) }));
  fs.symlinkSync(path.join(JOGO, 'js', 'voz'), path.join(raiz, 'js', 'voz'));
  const arq = path.join(raiz, 'js', 'sistemas', 'progresso-mescla.js');
  const antes = fs.readFileSync(arq, 'utf8');
  const depois = antes.replace('P.mesclar = function (a, b) {', 'P.mesclar = function (a, b) { if (a && a.geracao === 2) for (;;) {}');
  assert.notStrictEqual(depois, antes, 'não achei P.mesclar para travar');
  fs.writeFileSync(arq, depois);
  return raiz;
}

test('vigia derruba a fase de dados parada', { timeout: 120000, skip: process.platform !== 'linux' }, async () => {
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'vigia-fase-dados-'));
  const raiz = jogoQueTrava(pasta);
  const filho = path.join(pasta, 'filho.js');
  fs.writeFileSync(filho, `const { lancar } = require(${JSON.stringify(path.join(TESTES, 'navegador'))});
const { capturarDados } = require(${JSON.stringify(path.join(TESTES, 'referencias-dados'))});
(async () => { const b = await lancar(); console.log('capturando'); await capturarDados(b, process.argv[2], process.argv[3]); console.log('terminou'); process.exit(0); })()
  .catch((e) => { console.log('erro ' + e.message); process.exit(1); });\n`);
  const p = spawn(process.execPath, [filho, raiz, path.join(pasta, 'saida')],
    { env: Object.assign({}, process.env, { REINO_TRAVADO_MIN: '0.1', REINO_TESTES: path.join(pasta, 'rt') }), detached: true });
  let txt = '';
  p.stdout.on('data', (b) => { txt += b; }); p.stderr.on('data', (b) => { txt += b; });
  const codigo = await new Promise((ok) => {
    const t = setTimeout(() => { try { process.kill(-p.pid, 'SIGKILL'); } catch (e) { /* saiu */ } ok('parado após 60 s'); }, 60000);
    p.on('exit', (c) => { clearTimeout(t); ok(c); });
  });
  assert.strictEqual(codigo, 3, `fase de dados parada não foi derrubada pelo vigia (${codigo}); saída:\n${txt}`);
  assert.match(txt, /VIGIA DOS TESTES: teste travado/);
});
