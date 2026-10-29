// O build da Vercel (vercel/montar.js) junta os scripts do manifesto em ~10 lotes e os CSS num só, só no public/
// (o jogo/ não muda). Aqui: os lotes guardam a ordem do manifesto e o caminho de cada arquivo, as vozes ficam
// soltas, o index.html e o sw.js apontam para os lotes, o plano B (fluxo/vercel.js) exporta tudo o que o build lê;
// e, no Chromium de teste, o jogo montado chega no mapa sem erro e a foto do mapa sai igual à do jogo/ (mesmo save
// sintético, modo congelado, servidor e banco de TESTE novos: cenario.js).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { PNG } = require('pngjs');
const { abrirCenario } = require('../cenario');
const { lancar } = require('../navegador');
const { PASTA_TESTES } = require('../guardas');
const montador = require('../../../../vercel/montar');

const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const MANIFESTO = require(path.join(REPO, 'jogo', 'js', 'manifesto.js'));
const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'montar-lotes-'));
const SAIDA = path.join(pasta, 'jogo-montado');
const montado = montador.montar(SAIDA);
const ler = (rel) => fs.readFileSync(path.join(SAIDA, rel), 'utf8');

test('montar: ~10 lotes na ordem do manifesto, cada arquivo com o caminho; CSS num só; vozes soltas', () => {
  const lotes = montado.lotes;
  assert.ok(lotes.length >= 6 && lotes.length <= 14, `${lotes.length} lotes`);
  const ordem = [];
  lotes.forEach((rel) => {
    assert.match(rel, /^js\/lote-\d\d-[a-z]+\.[0-9a-f]{16}\.js$/);
    const texto = ler(rel);
    for (const m of texto.matchAll(/^;\/\* ===== (js\/\S+) ===== \*\/$/gm)) ordem.push(m[1]);
    // o lote é o próprio conteúdo dos arquivos, na ordem
    const quais = [...texto.matchAll(/^;\/\* ===== (js\/\S+) ===== \*\/$/gm)].map((m) => m[1]);
    assert.strictEqual(texto, montador.juntarScripts(quais.map((js) => ({ js })), (r) => fs.readFileSync(path.join(REPO, 'jogo', r), 'utf8')));
  });
  assert.deepStrictEqual(ordem, MANIFESTO.scripts.map((s) => s.js));
  assert.match(montado.css, /^css\/jogo\.[0-9a-f]{16}\.css$/);
  const css = ler(montado.css);
  MANIFESTO.css.forEach((c) => assert.ok(css.includes(`/* ===== ${c} ===== */\n` + fs.readFileSync(path.join(REPO, 'jogo', c), 'utf8')), c));
  // em js/: lotes, vozes e versao.json; nada dos scripts soltos nem dos CLAUDE.md
  const js = Object.keys(montado.arquivos).filter((c) => c.startsWith('js/'));
  assert.deepStrictEqual(js.filter((c) => !c.startsWith('js/voz/') && !c.startsWith('js/lote-')), ['js/versao.json']);
  const vozes = fs.readdirSync(path.join(REPO, 'jogo', 'js', 'voz')).filter((n) => n.endsWith('.js')).map((n) => 'js/voz/' + n);
  assert.deepStrictEqual(js.filter((c) => c.startsWith('js/voz/')).sort(), vozes.sort());
  assert.ok(!Object.keys(montado.arquivos).some((c) => /CLAUDE\.md$/.test(c)));
});

test('montar: index.html e sw.js apontam para os lotes', () => {
  const html = ler('index.html');
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  assert.deepStrictEqual(scripts, montado.lotes);
  const estilos = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);
  assert.deepStrictEqual(estilos, [montado.css]);
  assert.ok(html.includes('<link rel="preload" href="css/press-start-2p.woff2"'));
  const sw = ler('sw.js');
  montado.lotes.concat(montado.css, 'index.html', 'js/versao.json', 'js/voz/geral.js').forEach((c) => assert.ok(sw.includes(`"${c}":`), c));
  assert.ok(!sw.includes('"js/motor/main.js"'));
  // o index de jogo/ fora de sincronia com o manifesto: o build para em vez de publicar um jogo pela metade
  assert.throws(() => montador.trocarNoIndex('<head></head>', MANIFESTO, 'css/x.css', ['js/l.js']), /não bate com o manifesto/);
});

test('plano B (fluxo/vercel.js): exporta tudo o que o montar.js lê, e não jogo/ferramentas inteiro', () => {
  const codigo = `const m = require(${JSON.stringify(path.join(REPO, 'vercel', 'montar.js'))});
    m.montar(${JSON.stringify(path.join(pasta, 'deps'))});
    console.log(JSON.stringify(Object.keys(require.cache)));`;
  const lidos = JSON.parse(execFileSync(process.execPath, ['-e', codigo], { encoding: 'utf8' }));
  const { CAMINHOS } = require('../../fluxo/vercel');
  assert.deepStrictEqual(CAMINHOS, montador.DEPENDENCIAS);
  assert.ok(!CAMINHOS.includes('jogo/ferramentas'));
  lidos.map((f) => path.relative(REPO, f)).filter((r) => !r.startsWith('..')).forEach((r) => {
    assert.ok(CAMINHOS.some((c) => r === c || r.startsWith(c + '/')), `o build lê ${r}, fora do que o plano B exporta`);
  });
});

test('ignorar-build.sh e --conferir comparam tudo o que o build lê (as DEPENDENCIAS do montar.js)', () => {
  const { caminhosDoJogo } = require('../../fluxo/vercel');
  assert.deepStrictEqual(caminhosDoJogo(), montador.DEPENDENCIAS);
});

test('montar.js: só apaga e refaz vercel/public ou uma pasta de teste; --ajuda não faz nada', () => {
  assert.strictEqual(montador.conferirSaida(path.join(REPO, 'vercel', 'public')), path.join(REPO, 'vercel', 'public'));
  assert.strictEqual(montador.conferirSaida(path.join(pasta, 'x')), path.join(pasta, 'x'));
  [path.join(REPO, 'jogo'), REPO, path.join(REPO, 'vercel'), '/tmp/x', PASTA_TESTES, '/'].forEach((p) =>
    assert.throws(() => montador.conferirSaida(p), /proibido/, p));
  const alvo = path.join(pasta, 'ajuda');
  const saida = execFileSync(process.execPath, [path.join(REPO, 'vercel', 'montar.js'), '--saida', alvo, '--ajuda'], { encoding: 'utf8' });
  assert.match(saida, /Uso: node montar\.js/);
  assert.ok(!fs.existsSync(alvo), '--ajuda montou');
  // a aba só deixa de lembrar o SW com o "guardado" de quem a controla, e recomeça quando outro assume
  const html = ler('index.html');
  assert.ok(html.includes('e.source === sw.controller') && html.includes('"controllerchange", function () { pronto = false;'));
});

// a API da Vercel de mentira: as publicações de produção READY (a mais nova primeiro)
const api = (lista, ok = true) => async (url, op) => {
  assert.match(url, /target=production&state=READY/);
  assert.ok(op.headers.Authorization);
  return { ok, json: async () => ({ deployments: lista }) };
};
const pub = (sha, created, target = 'production') => ({ readyState: 'READY', target, created, meta: sha ? { githubCommitSha: sha } : {} });

test('vercel.js --conferir: "nada a publicar" só se o jogo é o da última publicação READY (API simulada)', async () => {
  const { semNadaAPublicar } = require('../../fluxo/vercel');
  const antes = process.env.VERCEL_TOKEN;
  process.env.VERCEL_TOKEN = 'teste-sem-rede';
  try {
    const git = (args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8' }).trim();
    const doJogo = git(['log', '-1', '--format=%H', '--', 'jogo/js']);
    const pai = git(['rev-parse', doJogo + '^']);
    const nada = (sha, buscar) => semNadaAPublicar(sha, REPO, buscar);
    assert.strictEqual(await nada(doJogo, api([pub(doJogo, 2), pub(pai, 1)])), doJogo, 'publicado = nada a publicar');
    assert.strictEqual(await nada(doJogo, api([pub(doJogo, 1), pub(pai, 2)])), null, 'a mais nova é a do pai: o jogo mudou');
    assert.strictEqual(await nada(doJogo, api([pub(pai, 3, null), pub(doJogo, 2)])), doJogo, 'prévia mais nova não conta');
    assert.strictEqual(await nada(doJogo, api([pub(pai, 2)])), null, 'jogo mudou desde a última: espera');
    assert.strictEqual(await nada(doJogo, api([pub(null, 3), pub(doJogo, 2)])), null, 'última sem commit (plano B): espera');
    assert.strictEqual(await nada(doJogo, api([pub('f'.repeat(40), 2)])), null, 'commit que não está aqui: espera');
    assert.strictEqual(await nada(doJogo, api([])), null, 'nenhuma publicação: espera');
    assert.strictEqual(await nada(doJogo, api([pub(doJogo, 2)], false)), null, 'API com erro: espera');
    assert.strictEqual(await nada(doJogo, async () => { throw new Error('sem rede'); }), null, 'sem rede: espera');
  } finally {
    if (antes === undefined) delete process.env.VERCEL_TOKEN; else process.env.VERCEL_TOKEN = antes;
  }
});

test('montar: o jogo montado chega no mapa sem erro e a foto sai igual à do jogo/', async () => {
  // o servidor de teste (servidor-teste.js) quer <raiz>/servidor/servidor.js: o mesmo do jogo/, com banco novo em /tmp
  fs.symlinkSync(path.join(REPO, 'jogo', 'servidor'), path.join(SAIDA, 'servidor'));
  const browser = await lancar();
  try {
    const fotos = [];
    for (const [nome, raiz] of [['jogo', undefined], ['montado', SAIDA]]) {
      const c = await abrirCenario({ browser, raiz, tamanho: 'notebook', save: 'completo', pasta: path.join(pasta, nome) });
      try {
        assert.strictEqual(await c.js('__reino.estado()'), 'mapa', nome);
        if (raiz) {
          const carregados = await c.js(`performance.getEntriesByType('resource').filter((e) => /\\/(js\\/lote-|css\\/jogo\\.)/.test(e.name)).map((e) => e.responseStatus)`);
          assert.deepStrictEqual(carregados, Array(montado.lotes.length + 1).fill(200), 'lotes e CSS carregados');
        }
        fotos.push(PNG.sync.read(fs.readFileSync((await c.foto('mapa'))[0])));
        assert.deepStrictEqual(c.erros, [], nome);
      } finally { await c.fechar(); }
    }
    const [a, b] = fotos;
    assert.deepStrictEqual([b.width, b.height], [a.width, a.height]);
    let dif = 0;
    for (let i = 0; i < a.data.length; i++) if (a.data[i] !== b.data[i]) dif++;
    assert.strictEqual(dif, 0, `foto do mapa diferente em ${dif} bytes (${pasta})`);
  } finally { await browser.close().catch(() => {}); }
});
