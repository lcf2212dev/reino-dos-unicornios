// Testes de unidade das ferramentas de conferência: validar-conteudo, validar-interiores, validar-tudo e
// tamanho acusam um erro plantado numa cópia em /tmp (o jogo de verdade não muda). Que o jogo de hoje passa, o próprio
// `npm test` confere no passo dos validadores: aqui não roda de novo.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/validadores.test.js   (tudo: npm test, na raiz)
// A cópia fica em /tmp/reino-testes/<worktree>/ (uma pasta por worktree, reaproveitada a cada rodada; o
// sistema limpa /tmp ao reiniciar). Só js/ (sem js/voz) e ferramentas/ (sem ferramentas/gerado) são copiados; o
// arquivo/ (vozes aposentadas, 63 MB, só lido) entra por link.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const Jogo = require('../../jogo-no-node');

const jogo = Jogo.raiz;
const tmp = path.join('/tmp/reino-testes', path.basename(path.dirname(jogo)) + '-v2-' + crypto.createHash('md5').update(jogo).digest('hex').slice(0, 8));

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
  const arquivo = path.resolve(destino, '../arquivo');
  try { fs.lstatSync(arquivo); } catch (e) { fs.symlinkSync(path.resolve(jogo, '../arquivo'), arquivo); }
  return destino;
}
function plantar(arq, de, para) {
  const t = fs.readFileSync(arq, 'utf8');
  assert.ok(t.includes(de), `âncora do erro plantado sumiu de ${arq}: ${de} (atualize o teste)`);
  fs.writeFileSync(arq, t.replace(de, para));
}

test('validar-conteudo: acusa um tipo de desafio errado numa sala plantada (--materia)', () => {
  const sala = path.join(tmp, 'conteudo', 'historia', 'h1.js');
  fs.mkdirSync(path.dirname(sala), { recursive: true });
  fs.copyFileSync(require('./ajudantes/terceiro-bimestre').arquivo('conteudo/materias/historia/h1'), sala);
  plantar(sala, "tipo: 'escolha'", "tipo: 'escolhaPlantada'");
  const r = node('ferramentas/validar/validar-conteudo.js', ['--terceiro-bimestre', '--materia', sala]);
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /tipo desconhecido escolhaPlantada/);
});

test('validar-interiores: acusa uma tela que não existe num prédio plantado', () => {
  const copia = copiaDoJogo('interiores');
  plantar(path.join(copia, 'js/interiores/castelo/castelo.js'), "tela: 'plano'", "tela: 'telaPlantada'");
  const r = node('ferramentas/validar/validar-interiores.js', [], copia);
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /tela "telaPlantada" não existe/);
});

test('validar-interiores: escada sem par no destino e lado de chegada na parede são acusados (validar-escadas)', () => {
  const copia = copiaDoJogo('escadas');
  // o 3º andar do Observatório desce para o térreo (que não tem escada de volta) em vez do 2º
  plantar(path.join(copia, 'js/interiores/observatorio/lab-andar3.js'), "para: 'observatorio-2', chegar", "para: 'observatorio', chegar");
  // quem desce na torre chegaria acima do arco (na parede)
  plantar(path.join(copia, 'js/interiores/torre/torre.js'), 'chegar: { x: -1, y: 0 }', 'chegar: { x: 0, y: -1 }');
  const r = node('ferramentas/validar/validar-interiores.js', [], copia);
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /observatorio-3: escada 0 \(18,23\): precisa de exatamente 1 escada de volta em "observatorio" \(para: 'observatorio-3'\), tem 0/);
  assert.match(r.saida, /observatorio-2: escada 1 \(26,3\): precisa de exatamente 1 escada de volta em "observatorio-3" \(para: 'observatorio-2'\), tem 0/);
  assert.match(r.saida, /torre-1: escada 1 \(2,10\): chegada \(lado `chegar` \{"x":0,"y":-1\} da escada de volta\) \(10,2\) em "torre" não é andável/);
});

test('validar-interiores: personagem registrado com predio museu e x/y passa; sem x/y (prédio antigo, sem vagas) é acusado', () => {
  const copia = copiaDoJogo('personagem');
  const falas = path.join(copia, 'js/interiores/museu/falas.js');
  const original = fs.readFileSync(falas, 'utf8');
  const registro = (xy) => `Reino.registrarPersonagem({ id: 'visitante-teste', nome: 'Visitante', predio: 'museu'${xy},
  sprite: { base: 'pessoa', pele: '#f1c7a5', cabelo: '#5a3825', penteado: 'rabo', roupa: '#e36b8a', roupa2: '#5a4a8a', perna: 'saia' } });\n`;
  // relativo: o museu tem um NPC a mais que antes (vale com outros personagens já registrados no jogo)
  const npcsDoMuseu = (saida) => Number((/✔ museu — .* (\d+) NPCs/.exec(saida) || [])[1]);
  const antes = node('ferramentas/validar/validar-interiores.js', ['--detalhes'], copia);
  assert.match(antes.saida, /^✔ castelo — /m, '--detalhes lista cada interior');
  fs.writeFileSync(falas, registro(', x: 22, y: 21') + original);
  const ok = node('ferramentas/validar/validar-interiores.js', ['--detalhes'], copia);
  assert.strictEqual(ok.status, 0, ok.saida);
  assert.strictEqual(npcsDoMuseu(ok.saida), npcsDoMuseu(antes.saida) + 1, ok.saida);
  fs.writeFileSync(falas, registro('') + original);
  const r = node('ferramentas/validar/validar-interiores.js', [], copia);
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /personagem visitante-teste: registrado em 'museu' sem x\/y, e esse prédio não tem vagas/);
});

test('validar-conteudo: emoji sem desenho é erro; com ícone registrado num prédio (Reino.registrarIcones em interiores/) passa', () => {
  const copia = copiaDoJogo('icone');
  require('./ajudantes/terceiro-bimestre').copiarPara(copia);
  const sala = path.join(copia, 'js/conteudo/materias/historia/h1.js');
  const falas = path.join(copia, 'js/interiores/museu/falas.js');
  const original = fs.readFileSync(falas, 'utf8');
  fs.writeFileSync(falas, original);   // a cópia é reaproveitada: sempre do jogo de hoje
  plantar(sala, "explica: '", "explica: '🍦 ");
  const sem = node('ferramentas/validar/validar-conteudo.js', [], copia);
  assert.strictEqual(sem.status, 1, sem.saida);
  assert.match(sem.saida, /emoji 🍦 sem pixel art em js\/arte\/icones\/ \(em js\/conteudo\/materias\/historia\/h1\.js\)/);
  const d = Array.from({ length: 16 }, () => '..aaaaaaaaaaaa..');
  fs.writeFileSync(falas, `Reino.registrarIcones({ '🍦': { n: 'sorvete', p: { a: '#ffd1e0' }, d: ${JSON.stringify(d)} } });\n` + original);
  const com = node('ferramentas/validar/validar-conteudo.js', [], copia);
  assert.strictEqual(com.status, 0, com.saida);
  assert.doesNotMatch(com.saida, /🍦/);
});

test('validar-interiores: por padrão só o resumo; --detalhes lista; --so filtra; ação de módulo e sprite (aviso)', () => {
  // (o --detalhes no jogo inteiro: no teste do personagem, acima)
  const so = node('ferramentas/validar/validar-interiores.js', ['--so', 'escola']);
  assert.strictEqual(so.status, 0, so.saida);
  assert.ok(!/^✔ /m.test(so.saida), so.saida);
  assert.match(so.saida.trim().split('\n').pop(), /^Tudo certo! 1 interiores de escola/);
  assert.strictEqual(node('ferramentas/validar/validar-interiores.js', ['--so', 'naoexiste']).status, 1);
  // um sistema declara a ação no def do módulo (carrega antes dos NPCs) e um prédio a usa; sprite com chave errada
  const copia = copiaDoJogo('acao-de-modulo');
  fs.appendFileSync(path.join(copia, 'js/sistemas/cuidados.js'), "\nReino.registrarModulo({ id: 'plantado', acoes: { assarPlantado: function () { return Promise.resolve(null); } } });\n");
  plantar(path.join(copia, 'js/interiores/castelo/castelo.js'), "acao: { tipo: 'tela', tela: 'plano' }", "acao: { tipo: 'assarPlantado' }");
  plantar(path.join(copia, 'js/personagens/elenco.js'), "penteado: 'coque', oculos: true, flor: true", "penteado: 'coque', oculos: true, flor: true, toucaPlantada: true");
  const r = node('ferramentas/validar/validar-interiores.js', [], copia);
  assert.strictEqual(r.status, 0, r.saida);
  assert.match(r.saida, /⚠ elenco margarida: chave de sprite "toucaPlantada" desconhecida/);
});

test('validar-conteudo: --so filtra e --detalhes mostra a linha de cada uma', () => {
  const so = node('ferramentas/validar/validar-conteudo.js', ['--so', 'historia-3bim', '--detalhes']);
  assert.strictEqual(so.status, 0, so.saida);
  assert.match(so.saida, /0 matéria\(s\), 1 prova\(s\)/);
  assert.match(so.saida, /^✔ Revisão Bimestral de História/m);
  assert.ok(!/^✔ /m.test(node('ferramentas/validar/validar-conteudo.js', ['--so', 'historia-3bim']).saida));
});

test('validar-tudo: resume os validadores e falha quando um deles falha', () => {
  const copia = copiaDoJogo('validar-tudo');
  // index.html fora do manifesto: o gerar-index --conferir acusa
  plantar(path.join(copia, 'index.html'), '</body>', '<script src="js/plantado.js"></script>\n</body>');
  const r = node('ferramentas/validar/validar-tudo.js', [], copia);
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /✘ index\.html x manifesto/);
  assert.match(r.saida, /✔ conteúdo das matérias/);   // os outros seguem passando (a cópia só mudou o index)
  assert.match(r.saida, /✔ interiores/);
});

test('tamanho: código acima de 420, dados acima de 800 são acusados (EXCECOES hoje vazia)', () => {
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
