// Testes de unidade do validador da documentação (jogo/ferramentas/validar/validar-docs.js).
// 1. Numa árvore inventada em /tmp: acusa caminho, símbolo, script e link quebrados com arquivo:linha, e
//    respeita /tmp, modelos (<…>), blocos ignorados, arquivos históricos e servidor/dados.
// 2. Numa cópia da documentação de verdade em /tmp (docs/, CLAUDE.md, .claude/, package.json e um link
//    para o jogo): uma referência plantada aparece como erro novo, na linha certa.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/validar-docs.test.js   (tudo: npm test)
// Os temporários ficam em /tmp/reino-testes/validar-docs-*/ (não são apagados; o sistema limpa ao reiniciar).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const VALIDADOR = path.join(__dirname, '..', '..', 'validar', 'validar-docs.js');
const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const TMP = '/tmp/reino-testes';

function rodar(raiz) {
  const r = spawnSync(process.execPath, [VALIDADOR, '--raiz', raiz], { encoding: 'utf8' });
  const saida = (r.stdout || '') + (r.stderr || '');
  return { status: r.status, saida, erros: saida.split('\n').filter((l) => l.startsWith('✘ ') && /:\d+: /.test(l)) };
}
function escrever(raiz, rel, texto) {
  fs.mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true });
  fs.writeFileSync(path.join(raiz, rel), texto);
}
function pastaNova(nome) {
  fs.mkdirSync(TMP, { recursive: true });
  return fs.mkdtempSync(path.join(TMP, 'validar-docs-' + nome + '-'));
}

test('árvore inventada: acusa cada referência quebrada com arquivo:linha e ignora o que deve', () => {
  const raiz = pastaNova('inventada');
  escrever(raiz, 'package.json', JSON.stringify({ scripts: { test: 'x', validar: 'y' } }));
  escrever(raiz, 'jogo/js/nucleo/coisa.js', 'Reino.Coisa = { fazer: function () {} };\nwindow.__reino = {};\n');
  escrever(raiz, 'jogo/ferramentas/ferramenta.js', '// nada\n');
  escrever(raiz, 'docs/outro.md', '# Outro\n');
  escrever(raiz, 'docs/decisoes/historico/velho.md', 'Histórico: `js/que-nao-existe.js`\n');
  escrever(raiz, 'CLAUDE.md', 'Regras: `npm test` e `npm run validar`.\nQuebrado: `npm run nao-existe`.\n');
  escrever(raiz, 'docs/guia.md', [
    '# Guia',                                                   // 1
    'Bom: `jogo/js/nucleo/coisa.js`, `nucleo/coisa.js`, `coisa.js`, `jogo/js/nucleo/`.',   // 2
    'Bom: `Reino.Coisa.fazer`, `window.__reino`, `node jogo/ferramentas/ferramenta.js --x`.', // 3
    'Ruim: `jogo/js/sumiu.js`.',                                // 4
    'Ruim: `Reino.Coisa.desfazer()`.',                          // 5
    'Ignorado: `/tmp/qualquer/coisa.js`, `js/voz/<pacote>.js`, `jogo/servidor/dados/reino.db`, `progresso/mariana`.', // 6
    '<!-- validar-docs: ignorar -->',                           // 7
    'Exemplo: `jogo/js/exemplo-que-nao-existe.js`.',            // 8
    '<!-- validar-docs: fim -->',                               // 9
    '```',                                                      // 10
    'node jogo/ferramentas/sumiu.js    # comando quebrado',     // 11
    'npm run validar',                                          // 12
    'Reino.Inventado.nada()   // símbolo em bloco: não conferido', // 13
    '```',                                                      // 14
    'Link bom: [outro](outro.md). Link ruim: [x](nada.md).',    // 15
  ].join('\n') + '\n');
  const r = rodar(raiz);
  assert.strictEqual(r.status, 1, r.saida);
  const onde = r.erros.map((l) => l.split(': ')[0].slice(2)).sort();
  assert.deepStrictEqual(onde, ['CLAUDE.md:2', 'docs/guia.md:11', 'docs/guia.md:15', 'docs/guia.md:4', 'docs/guia.md:5'].sort(), r.saida);
  assert.match(r.saida, /docs\/guia\.md:5: símbolo não achado em jogo\/js: Reino\.Coisa\.desfazer \(desfazer\)/);
  assert.match(r.saida, /CLAUDE\.md:2: script não existe no package\.json: npm run nao-existe/);
  assert.match(r.saida, /docs\/guia\.md:15: link quebrado: nada\.md/);
});

test('árvore inventada e toda certa: sai com 0', () => {
  const raiz = pastaNova('certa');
  escrever(raiz, 'package.json', JSON.stringify({ scripts: { test: 'x' } }));
  escrever(raiz, 'jogo/js/a.js', 'Reino.A = {};\n');
  escrever(raiz, 'docs/a.md', 'Veja `jogo/js/a.js` e `Reino.A` e rode `npm test`.\n');
  const r = rodar(raiz);
  assert.strictEqual(r.status, 0, r.saida);
  assert.match(r.saida, /✔ docs: 3 referências conferidas em 1 arquivos/);
});

test('cópia da documentação de verdade: a referência plantada vira um erro novo na linha certa', () => {
  const raiz = pastaNova('copia');
  ['docs', '.claude'].forEach((p) => { if (fs.existsSync(path.join(REPO, p))) fs.cpSync(path.join(REPO, p), path.join(raiz, p), { recursive: true }); });
  ['CLAUDE.md', 'package.json', 'COMO-USAR.md'].forEach((f) => { if (fs.existsSync(path.join(REPO, f))) fs.copyFileSync(path.join(REPO, f), path.join(raiz, f)); });
  // o jogo entra por link (só leitura: o validador lê nomes e o texto de jogo/js, nada é escrito lá)
  fs.symlinkSync(path.join(REPO, 'jogo'), path.join(raiz, 'jogo'));
  const antes = rodar(raiz);
  const alvo = path.join(raiz, 'docs', 'plantado.md');
  fs.writeFileSync(alvo, '# Plantado\n\nLinha boa: `jogo/js/manifesto.js`.\nLinha ruim: `jogo/js/nucleo/nao-existe.js`.\n');
  const depois = rodar(raiz);
  assert.strictEqual(depois.status, 1, depois.saida);
  const novos = depois.erros.filter((l) => !antes.erros.includes(l));
  assert.deepStrictEqual(novos, ['✘ docs/plantado.md:4: caminho não existe: jogo/js/nucleo/nao-existe.js'], depois.saida);
});

test('pasta de material nova na raiz (Geografia/): vira raiz de caminho sem lista fixa', () => {
  const raiz = pastaNova('material');
  escrever(raiz, 'package.json', JSON.stringify({ scripts: {} }));
  escrever(raiz, 'Geografia/prints/mapa.png', 'x');
  escrever(raiz, 'docs/guia.md', [
    '# Guia',                                            // 1
    'Bom: `Geografia/prints`, `Geografia/`.',            // 2
    'Ruim: `Geografia/sumiu`.',                          // 3
    'Não é caminho: `Ciencias/sumiu` (pasta que não existe no disco).', // 4
  ].join('\n') + '\n');
  const r = rodar(raiz);
  assert.strictEqual(r.status, 1, r.saida);
  assert.deepStrictEqual(r.erros.map((l) => l.split(': ')[0].slice(2)), ['docs/guia.md:3'], r.saida);
});
