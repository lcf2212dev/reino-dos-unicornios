// Testes de unidade das ferramentas de conferência: validar-conteudo, validar-interiores, validar-tudo e
// tamanho passam no jogo de hoje e acusam um erro plantado numa cópia em /tmp (o jogo de verdade não muda).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/validadores.test.js   (tudo: npm test, na raiz)
// A cópia fica em /tmp/reino-testes/<worktree>/ (uma pasta por worktree, reaproveitada a cada rodada; o
// sistema limpa /tmp ao reiniciar). Só js/ (sem js/voz) e ferramentas/ (sem ferramentas/gerado) são copiados.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const Jogo = require('../../jogo-no-node');

const jogo = Jogo.raiz;
const tmp = path.join('/tmp/reino-testes', path.basename(path.dirname(jogo)) + '-' + crypto.createHash('md5').update(jogo).digest('hex').slice(0, 8));

function node(arq, args = [], cwd = jogo) {
  const r = spawnSync(process.execPath, [arq].concat(args), { cwd, encoding: 'utf8' });
  return { status: r.status, saida: (r.stdout || '') + (r.stderr || '') };
}
// cópia do jogo (js sem voz, ferramentas sem gerado, css e index.html) para plantar erros
function copiaDoJogo(nome) {
  const destino = path.join(tmp, nome, 'jogo');
  const fora = [path.join(jogo, 'js', 'voz'), path.join(jogo, 'ferramentas', 'gerado')];
  ['js', 'ferramentas', 'css'].forEach((p) => fs.cpSync(path.join(jogo, p), path.join(destino, p), {
    recursive: true, force: true, filter: (src) => !fora.some((f) => src === f || src.startsWith(f + path.sep)),
  }));
  fs.copyFileSync(path.join(jogo, 'index.html'), path.join(destino, 'index.html'));
  return destino;
}
function plantar(arq, de, para) {
  const t = fs.readFileSync(arq, 'utf8');
  assert.ok(t.includes(de), `âncora do erro plantado sumiu de ${arq}: ${de} (atualize o teste)`);
  fs.writeFileSync(arq, t.replace(de, para));
}

test('validar-conteudo: passa no jogo de hoje e acusa um tipo de desafio errado numa sala plantada (--materia)', () => {
  const ok = node('ferramentas/validar/validar-conteudo.js');
  assert.strictEqual(ok.status, 0, ok.saida);
  const sala = path.join(tmp, 'conteudo', 'historia', 'h1.js');
  fs.mkdirSync(path.dirname(sala), { recursive: true });
  fs.copyFileSync(path.join(jogo, 'js/conteudo/materias/historia/h1.js'), sala);
  plantar(sala, "tipo: 'escolha'", "tipo: 'escolhaPlantada'");
  const r = node('ferramentas/validar/validar-conteudo.js', ['--materia', sala]);
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /tipo desconhecido escolhaPlantada/);
});

test('validar-interiores: passa no jogo de hoje e acusa uma tela que não existe num prédio plantado', () => {
  const ok = node('ferramentas/validar/validar-interiores.js');
  assert.strictEqual(ok.status, 0, ok.saida);
  const copia = copiaDoJogo('interiores');
  plantar(path.join(copia, 'js/interiores/castelo/castelo.js'), "tela: 'plano'", "tela: 'telaPlantada'");
  const r = node('ferramentas/validar/validar-interiores.js', [], copia);
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /tela "telaPlantada" não existe/);
});

test('validar-tudo: resume os validadores e falha quando um deles falha', () => {
  const ok = node('ferramentas/validar/validar-tudo.js');
  assert.strictEqual(ok.status, 0, ok.saida);
  assert.match(ok.saida, /✔ conteúdo das matérias/);
  assert.match(ok.saida, /✔ interiores/);
  assert.match(ok.saida, /✔ index\.html x manifesto/);
  const copia = copiaDoJogo('validar-tudo');
  // index.html fora do manifesto: o gerar-index --conferir acusa
  plantar(path.join(copia, 'index.html'), '</body>', '<script src="js/plantado.js"></script>\n</body>');
  const r = node('ferramentas/validar/validar-tudo.js', [], copia);
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /✘ index\.html x manifesto/);
});

test('tamanho: o jogo de hoje passa; código acima de 420, dados acima de 800 são acusados (EXCECOES hoje vazia)', () => {
  const ok = node('ferramentas/tamanho.js');
  assert.strictEqual(ok.status, 0, ok.saida);
  const T = require('../../tamanho');
  // regras por caminho (um lugar só: REGRAS em ferramentas/tamanho.js)
  assert.strictEqual(T.regra('js/voz/geral.js'), 'gerado');
  assert.strictEqual(T.regra('index.html'), 'gerado');
  assert.strictEqual(T.regra('js/conteudo/materias/historia/h1.js'), 'dados');
  assert.strictEqual(T.regra('js/arte/icones/natureza.js'), 'dados');
  assert.strictEqual(T.regra('js/interiores/observatorio/falas.js'), 'dados');
  assert.strictEqual(T.regra('js/sistemas/cuidados.js'), 'codigo');
  assert.strictEqual(T.regra('css/ui-base.css'), 'codigo');
  assert.strictEqual(T.regra('ferramentas/vozes/gerar-vozes.py'), 'codigo');
  // árvore sintética pequena (não precisa copiar o jogo)
  const raiz = path.join(tmp, 'tamanho', 'jogo');
  const escrever = (rel, n) => { fs.mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true }); fs.writeFileSync(path.join(raiz, rel), 'x\n'.repeat(n)); };
  escrever('js/sistemas/grande.js', 421);
  escrever('js/sistemas/cabe.js', 420);
  escrever('js/conteudo/materias/muita.js', 801);
  escrever('js/arte/icones/cabe.js', 800);
  escrever('js/voz/enorme.js', 5000);
  escrever('css/estilo.css', 10);
  const r = node(path.join(jogo, 'ferramentas/tamanho.js'), ['--raiz', raiz]);
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /js\/sistemas\/grande\.js: 421 linhas \(codigo, limite 420\)/);
  assert.match(r.saida, /js\/conteudo\/materias\/muita\.js: 801 linhas \(dados, limite 800\)/);
  assert.doesNotMatch(r.saida, /cabe\.js|enorme\.js/);
});
