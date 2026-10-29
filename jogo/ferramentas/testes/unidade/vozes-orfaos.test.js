// npm run vozes -- --orfaos [--aplicar] (ferramentas/vozes/orfaos.js): lista e tira só os mp3 do vozes-cache que
// nenhuma chave do vozes-indice.json usa. Tudo num vozes-cache de mentira na pasta de testes (nada do repositório).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { PASTA_TESTES } = require('../guardas');
const { acharOrfaos, apagarOrfaos, podeAplicar } = require('../../vozes/orfaos');
const W = path.join(__dirname, '..', '..');

function montar() {
  const raiz = fs.mkdtempSync(path.join(PASTA_TESTES, 'vozes-orfaos-'));
  const F = path.join(raiz, 'jogo/ferramentas');
  const G = path.join(F, 'gerado');
  fs.mkdirSync(path.join(F, 'vozes'), { recursive: true });
  fs.copyFileSync(path.join(W, 'ajuda.js'), path.join(F, 'ajuda.js'));
  ['vozes.js', 'orfaos.js'].forEach((a) => fs.copyFileSync(path.join(W, 'vozes', a), path.join(F, 'vozes', a)));
  const cache = path.join(G, 'vozes-cache');
  ['claude', 'ingles'].forEach((v) => fs.mkdirSync(path.join(cache, v), { recursive: true }));
  // 3 falas gravadas, com os caminhos do índice escritos de jeitos diferentes ("./", "//", "a/../")
  const vozes = { claude: { voz: 'pt-X', velocidade: '+0%', tom: '+0Hz' }, ingles: { voz: 'en-X', velocidade: '+0%', tom: '+0Hz' } };
  const h = (v, t) => crypto.createHash('sha1').update([vozes[v].voz, '+0%', '+0Hz', t].join('|'), 'utf8').digest('hex').slice(0, 16) + '.mp3';
  const falas = [['claude', 'Oi!'], ['claude', 'Tchau!'], ['ingles', 'Hello!']].map(([v, t], i) => ({ chave: 'k' + i, voz: v, fala: t, pacotes: ['geral'] }));
  const usados = falas.map((f) => f.voz + '/' + h(f.voz, f.fala));
  usados.forEach((u) => fs.writeFileSync(path.join(cache, u), 'u'));
  fs.writeFileSync(path.join(G, 'falas.json'), JSON.stringify({ vozes, falas }));
  // o pendentes() do vozes.js confere o índice exato; aqui o índice normalizado é o do disco
  fs.writeFileSync(path.join(G, 'vozes-indice.json'), JSON.stringify({ k0: usados[0], k1: usados[1], k2: usados[2] }));
  fs.writeFileSync(path.join(G, 'indice-torto.json'), JSON.stringify({ k0: './' + usados[0], k1: usados[1].replace('/', '//'), k2: 'claude/../' + usados[2] }));
  fs.writeFileSync(path.join(cache, 'claude', 'velho.mp3'), 'bb');
  fs.writeFileSync(path.join(cache, 'ingles', 'velho2.mp3'), 'ccc');
  fs.writeFileSync(path.join(cache, 'ingles', 'nota.txt'), 'não é mp3');          // fica
  fs.writeFileSync(path.join(cache, 'ingles', 'usado.mp3.bruto.mp3'), 'x');      // .mp3 sem chave: órfão também
  fs.writeFileSync(path.join(raiz, 'fora.mp3'), 'fora');                          // fora do cache: nunca
  return { raiz, F, G, cache, usados };
}

test('acharOrfaos: só mp3 do vozes-cache sem chave no índice, com o tamanho', () => {
  const { G } = montar();
  const esperado = [{ rel: 'claude/velho.mp3', bytes: 2 }, { rel: 'ingles/usado.mp3.bruto.mp3', bytes: 1 }, { rel: 'ingles/velho2.mp3', bytes: 3 }];
  assert.deepStrictEqual(acharOrfaos(G), esperado);
  fs.copyFileSync(path.join(G, 'indice-torto.json'), path.join(G, 'vozes-indice.json'));   // "./x", "a//b" e "a/../b/x" contam como usados
  assert.deepStrictEqual(acharOrfaos(G), esperado);
});

test('apagarOrfaos recusa caminho fora do vozes-cache e não apaga nada', () => {
  const { raiz, G } = montar();
  assert.throws(() => apagarOrfaos(G, [{ rel: '../../../../fora.mp3' }]), /fora do vozes-cache|não é um mp3/);
  assert.throws(() => apagarOrfaos(G, [{ rel: 'claude' }]), /fora do vozes-cache|não é um mp3/);
  assert.ok(fs.existsSync(path.join(raiz, 'fora.mp3')));
});

test('npm run vozes -- --orfaos lista sem apagar; --aplicar tira só os órfãos', () => {
  const { raiz, F, cache } = montar();
  const rodar = (...a) => spawnSync(process.execPath, [path.join(F, 'vozes', 'vozes.js'), '--orfaos', ...a],
    { cwd: raiz, encoding: 'utf8', env: { ...process.env, PATH: '/usr/bin:/bin' } });
  const lista = rodar();
  assert.strictEqual(lista.status, 0, lista.stderr);
  assert.match(lista.stdout, /3 mp3 que nenhuma chave/);
  assert.match(lista.stdout, /claude\/velho\.mp3/);
  assert.match(lista.stdout, /o --aplicar seria aceito/);
  assert.ok(fs.existsSync(path.join(cache, 'claude', 'velho.mp3')), 'sem --aplicar não apaga');
  assert.strictEqual(fs.readFileSync(path.join(F, 'gerado', 'falas.json'), 'utf8').includes('"Oi!"'), true, 'não roda o listar');
  const ap = rodar('--aplicar');
  assert.strictEqual(ap.status, 0, ap.stderr);
  assert.match(ap.stdout, /3 órfão\(s\) tirado/);
  const sobrou = (v) => fs.readdirSync(path.join(cache, v)).sort();
  assert.deepStrictEqual(sobrou('claude').length, 2);
  assert.deepStrictEqual(sobrou('ingles').length, 2);
  assert.ok(sobrou('ingles').includes('nota.txt'));
  assert.ok(fs.existsSync(path.join(raiz, 'fora.mp3')));
});

test('--aplicar recusado: índice vazio ({}) e gerado/vozes-cache como link; nada é apagado', () => {
  const { raiz, F, G, cache } = montar();
  const antes = fs.readdirSync(path.join(cache, 'claude')).length;
  fs.writeFileSync(path.join(G, 'vozes-indice.json'), '{}');
  assert.match(podeAplicar(G), /3 fala\(s\) sem áudio/);
  const so = spawnSync(process.execPath, [path.join(F, 'vozes', 'vozes.js'), '--orfaos'], { cwd: raiz, encoding: 'utf8' });
  assert.match(so.stdout, /o --aplicar seria recusado agora: 3 fala\(s\) sem áudio/);
  const r = spawnSync(process.execPath, [path.join(F, 'vozes', 'vozes.js'), '--orfaos', '--aplicar'], { cwd: raiz, encoding: 'utf8' });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /recusado/);
  assert.strictEqual(fs.readdirSync(path.join(cache, 'claude')).length, antes);
  const link = path.join(raiz, 'gerado-link');
  fs.symlinkSync(G, link);
  assert.match(podeAplicar(link), /link simbólico/);
  const g2 = path.join(raiz, 'g2');
  fs.mkdirSync(g2);
  fs.symlinkSync(cache, path.join(g2, 'vozes-cache'));
  assert.match(podeAplicar(g2), /link simbólico/);
});
