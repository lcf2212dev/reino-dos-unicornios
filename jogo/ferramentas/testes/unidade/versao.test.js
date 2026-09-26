// Testes de unidade: a versão nova (js/sistemas/versao.js) e o gerador do js/versao.json (ferramentas/gerar-versao.js).
// Desligado no artifact, em file: e no modo determinístico (a menos de &versao=1); falas no pacote geral; o gerador
// dá o mesmo hash para a mesma árvore, muda com qualquer arquivo e ignora o próprio versao.json.
// O comportamento no navegador (tela aberta, andando, parada no mapa) está em versao.navegador.test.js.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/versao.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Jogo = require('../../jogo-no-node');
const G = require('../../gerar-versao');

function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return ctx.Reino;
}

test('versao: desligado no artifact, em file: e no congelado; &versao=1 liga', () => {
  const V = carregar().Versao;
  const casa = { claude: undefined, protocolo: 'http:', busca: '', congelado: false };
  const com = (o) => Object.assign({}, casa, o);
  assert.strictEqual(V.motivoDesligado(casa), null, 'servidor de casa: ligado');
  assert.strictEqual(V.motivoDesligado(com({ protocolo: 'https:' })), null);
  assert.strictEqual(V.motivoDesligado(com({ claude: { use: () => null } })), 'artifact');
  assert.strictEqual(V.motivoDesligado(com({ claude: {} })), null, 'window.claude sem use() não é o artifact');
  assert.strictEqual(V.motivoDesligado(com({ protocolo: 'file:' })), 'arquivo');
  assert.strictEqual(V.motivoDesligado(com({ congelado: true, busca: '?debug=1&congelar=1' })), 'congelado');
  assert.strictEqual(V.motivoDesligado(com({ congelado: true, busca: '?debug=1&congelar=1&versao=1' })), null);
  assert.strictEqual(V.motivoDesligado(com({ claude: { use: () => null }, busca: '?versao=1' })), null);
  assert.strictEqual(V.motivoDesligado(com({ congelado: true, busca: '?versao=10' })), 'congelado', 'versao=10 não conta');
});

test('versao: falas do aviso no pacote geral, voz do Claude, depois das fotos', () => {
  const R = carregar();
  const ids = Array.from(R.modulos, (m) => m.id);
  assert.ok(ids.indexOf('versao') > ids.indexOf('fotos'));
  const todas = R.Falas.todas();
  ['Chegou novidade no Reino! ✨', 'O que você fez fica guardado.'].forEach((t) => {
    const f = todas.find((x) => x.texto === t);
    assert.ok(f, 'fala na lista: ' + t);
    assert.strictEqual(f.voz, 'claude');
    assert.strictEqual(f.pacote, 'geral');
  });
  const d = R.modulo('versao').depurar();
  assert.strictEqual(d.fase, 'desligado', 'sem iniciar, nada roda');
  assert.strictEqual(d.relogio, false);
  const c = R.config.versao;
  ['intervaloMs', 'confirmarMs', 'cacheMs', 'paradaMs', 'avisoMs', 'esperaMs'].forEach((k) => assert.strictEqual(typeof c[k], 'number', k));
  assert.ok(c.cacheMs > 300000, 'cache do servidor (300 s) vencido antes de acreditar');
});

test('gerar-versao: mesma árvore = mesmo hash; muda com qualquer arquivo; ignora o versao.json', () => {
  const raiz = path.join('/tmp/reino-testes/versao-gerador', String(process.pid));
  const escrever = (rel, txt) => { fs.mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true }); fs.writeFileSync(path.join(raiz, rel), txt); };
  escrever('index.html', '<!doctype html>');
  escrever('css/base.css', 'a{}');
  escrever('js/b.js', 'var b;');
  escrever('js/a/c.js', 'var c;');
  escrever('js/voz/geral.js', 'voz 1');
  escrever('servidor/fora.js', 'não entra');
  const h1 = G.calcular(raiz);
  assert.match(h1, /^[0-9a-f]{64}$/);
  assert.strictEqual(G.calcular(raiz), h1, 'duas vezes: igual');
  assert.deepStrictEqual(G.arquivos(raiz), ['css/base.css', 'index.html', 'js/a/c.js', 'js/b.js', 'js/voz/geral.js']);
  const v = G.gravar(raiz);
  assert.strictEqual(v.versao, h1);
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(raiz, 'js/versao.json'), 'utf8')).versao, h1);
  assert.strictEqual(G.calcular(raiz), h1, 'o próprio versao.json não entra');
  escrever('servidor/fora.js', 'mudou');
  assert.strictEqual(G.calcular(raiz), h1, 'fora de index/css/js não entra');
  escrever('js/voz/geral.js', 'voz 2');
  const h2 = G.calcular(raiz);
  assert.notStrictEqual(h2, h1, 'pacote de voz mudou: hash muda');
  escrever('js/voz/geral.js', 'voz 1');
  assert.strictEqual(G.calcular(raiz), h1, 'voltou: o mesmo hash');
  // mesmo conteúdo em outro caminho muda o hash
  fs.renameSync(path.join(raiz, 'js/b.js'), path.join(raiz, 'js/d.js'));
  assert.notStrictEqual(G.calcular(raiz), h1);
});

test('gerar-versao: o jogo de verdade dá o mesmo hash duas vezes', () => {
  const jogo = path.join(__dirname, '..', '..', '..');
  assert.strictEqual(G.calcular(jogo), G.calcular(jogo));
});
