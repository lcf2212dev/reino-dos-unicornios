// Testes de unidade: tipos do livro do 4º bimestre, parte 2 (docs/contratos/quarto-bimestre.md §12): tabela,
// cruzadinha e cacaPalavras (pontuação, textos da correção, conferência do validar, campos), as figuras nas questões
// (opção com img e soImagem, d.figura, apoio com versos e figuras: D.conferirFiguras) e a fala do texto de apoio.
// Sem DOM: o montar de cada tipo é provado no navegador (missão e prova).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/desafios-livro-b.test.js   (tudo: npm test, na raiz)
// O validador roda numa sala copiada para /tmp/reino-testes/<worktree>/ (o jogo de verdade não muda).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
// o jogo de hoje (a fixture do 3º bimestre troca o falas.js pelo antigo); a fixture só no validar-conteudo, no fim
const JogoNode = require('../../jogo-no-node');
const Jogo = require('./ajudantes/terceiro-bimestre');

function carregar() {
  const ctx = JogoNode.contexto({ console, Math, Date, JSON });
  JogoNode.carregar(ctx, JogoNode.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos', 'sistemas/falas'], grupos: ['atividades'] }));
  return ctx.Reino;
}
const R = carregar();
const D = R.Desafios;
const T = R.tiposDesafio;
const pontos = (d, valores) => valores.map((v) => D.pontuar(d, v));
// o v que o validar-conteudo passa (icones: só os desenhos que o teste diz que existem)
function conferir(d, op = {}) {
  const erros = [], avisos = [];
  const v = { checar: (c, m) => { if (!c) erros.push(m); }, avisar: (m) => avisos.push(m), naProva: !!op.naProva,
    icones: op.icones || { '🐱': {}, '🍌': {} }, textoOk: (t) => typeof t === 'string' && t.trim().length > 0, ilustracao: op.ilustracao };
  if (op.figuras) D.conferirFiguras(d, v);
  else T[d.tipo].validar(d, v);
  return { erros, avisos };
}

const tabela = { id: 'tb', tipo: 'tabela', pergunta: 'Complete.', cab: ['Masculino', 'Feminino'],
  linhas: [['o alemão', { certas: ['a alemã'] }], ['o leão', { certa: 1 }], ['o lobo', { certa: 3 }]], banco: ['a leitoa', 'a leoa', 'a loba', 'a leoa'] };
const cruz = { id: 'cz', tipo: 'cruzadinha', pergunta: 'Resolva.', palavras: [
  { resposta: 'GATO', x: 0, y: 0, dir: 'h', dica: 'Mia.' }, { resposta: 'GALO', x: 0, y: 0, dir: 'v', img: '🐱' },
  { resposta: 'LIMÃO', x: 0, y: 2, dir: 'h', dica: 'Fruta.' }] };
const caca = { id: 'cc', tipo: 'cacaPalavras', pergunta: 'Ache.', grade: ['GATOXP', 'XSXXXA', 'XOXXXT', 'XLUAXO'], palavras: ['GATO', 'PATO', 'SOL', 'LUA'] };

test('registro: os 3 tipos com exemplos, campos e sem treino', () => {
  ['tabela', 'cruzadinha', 'cacaPalavras'].forEach((t) => {
    assert.ok(T[t] && T[t].exemplos && T[t].validar && T[t].textoCerto && T[t].textoResposta, t);
    assert.ok(!D.TREINAVEIS.includes(t), t + ' não é do treino');
  });
  assert.deepStrictEqual([...T.tabela.campos], ['cab', 'banco']);
  assert.ok(T.escolha.campos.includes('soImagem') && T.varias.campos.includes('soImagem'));
});

test('tabela: fração das células a preencher; digitada sem diferença de maiúscula e ponto; banco vale pela palavra', () => {
  const certa = [[null, 'a alemã'], [null, 1], [null, 3]];
  assert.deepStrictEqual(pontos(tabela, [certa, [[null, 'A alemã.'], [null, 3], [null, 1]], [[null, 'a alema'], [null, 1], [null, 0]], [], 'x', [[null, null]]]),
    [1, 1, 1 / 3, 0, 0, 0]);   // banco[1] e banco[3] são a mesma palavra ("a leoa")
  assert.strictEqual(D.respostaCertaTexto(tabela), 'o alemão – a alemã • o leão – a leoa • o lobo – a leoa');
  assert.strictEqual(D.respostaTexto(tabela, [[null, ''], [null, 0], [null, null]]), 'o alemão – ___ • o leão – a leitoa • o lobo – ___');
  assert.deepStrictEqual([...R.Falas.segmentosDesafio(tabela)], ['Complete.']);
  // prova: títulos, banco e células fixas contam no tempo mínimo de leitura
  assert.strictEqual(T.tabela.textoProva(tabela), ' Masculino Feminino a leitoa a leoa a loba a leoa o alemão o leão o lobo');
});

test('tabela: validar acusa linhas tortas, célula estranha, banco que falta e cab de outro tamanho', () => {
  assert.deepStrictEqual(conferir(tabela).erros, []);
  const ruim = { id: 'tb2', tipo: 'tabela', cab: ['A'], linhas: [['x', { certa: 0 }], ['y']], banco: undefined };
  const e = conferir(ruim).erros.join('\n');
  assert.match(e, /mesmo número de células/);
  assert.match(e, /cab precisa/);
  assert.match(e, /certa fora do banco/);
  assert.match(conferir({ id: 'tb3', tipo: 'tabela', linhas: [['x', 'y']] }).erros.join(), /sem célula para preencher/);
  assert.match(conferir({ id: 'tb4', tipo: 'tabela', linhas: [['x', { t: 1 }]] }).erros.join(), /precisa ser texto/);
  assert.match(conferir({ id: 'tb5', tipo: 'tabela', linhas: [['x', { certas: ['a'] }]], banco: ['a', 'b'] }).erros.join(), /banco precisa/);
});

test('cruzadinha: vale sem acento, fração das palavras; números das pistas saem da grade', () => {
  assert.deepStrictEqual(pontos(cruz, [['GATO', 'GALO', 'LIMÃO'], ['gato', 'galo', 'LIMAO'], ['GATO', 'GA O', 'LIMÃO'], ['GATO'], [], [1, 2, 3]]),
    [1, 1, 2 / 3, 1 / 3, 0, 0]);
  // GATO e GALO começam na mesma casa (1; a deitada antes); LIMÃO na 3ª linha (2); número e palavra sem quebra
  // (U+00A0) e sem seta (o desenho dela deixava o Chromium quebrar a linha no meio do grupo)
  assert.strictEqual(D.respostaCertaTexto(cruz), '1.\u00a0GATO\u00a0• 1.\u00a0GALO\u00a0• 2.\u00a0LIMÃO');
  assert.strictEqual(D.respostaTexto(cruz, ['GATO', 'GA O', '']), '1.\u00a0GATO\u00a0• 1.\u00a0GA_O\u00a0• 2.\u00a0___');
  assert.doesNotMatch(D.linhaCerta(cruz) + D.respostaTexto(cruz, ['GATO']), /[→↓]/);
  // prova: as dicas contam no tempo mínimo de leitura
  assert.strictEqual(T.cruzadinha.textoProva(cruz), ' Mia.  Fruta.');
  assert.deepStrictEqual([...R.Falas.segmentosDesafio(cruz)], ['Resolva.']);
});

test('cruzadinha: validar confere cruzamentos, sobreposição, pistas e desenho', () => {
  assert.deepStrictEqual(conferir(cruz), { erros: [], avisos: [] });
  const torta = { id: 'cz2', tipo: 'cruzadinha', palavras: [{ resposta: 'GATO', x: 0, y: 0, dir: 'h', dica: 'a' }, { resposta: 'RATO', x: 0, y: 0, dir: 'v', dica: 'b' }] };
  assert.match(conferir(torta).erros.join(), /cruzamento em 0,0 com letras diferentes \(G e R\)/);
  const minuscula = { id: 'cz2b', tipo: 'cruzadinha', palavras: [{ resposta: 'ovo', x: 5, y: 5, dir: 'h' }, { resposta: 'SOL', x: 0, y: 0, dir: 'd', dica: 'a' }] };
  const e = conferir(minuscula).erros.join('\n');
  assert.match(e, /palavra 1: precisa de resposta \(MAIÚSCULAS/);
  assert.match(e, /palavra 2: precisa de resposta/);
  const sobre = { id: 'cz3', tipo: 'cruzadinha', palavras: [{ resposta: 'GATO', x: 0, y: 0, dir: 'h', dica: 'a' }, { resposta: 'ATO', x: 1, y: 0, dir: 'h', dica: 'c' }, { resposta: 'SOL', x: 0, y: 3, dir: 'h' }] };
  const e2 = conferir(sobre).erros.join('\n');
  assert.match(e2, /se sobrepõem na mesma direção/);
  assert.match(e2, /palavra 3: pista sem dica nem img/);
  // desenho que falta: aviso na sala, erro na prova
  const semDesenho = { id: 'cz4', tipo: 'cruzadinha', palavras: [{ resposta: 'OVO', x: 0, y: 0, dir: 'h', img: '🥚' }] };
  assert.match(conferir(semDesenho).avisos.join(), /falta o desenho "🥚"/);
  assert.match(conferir(semDesenho, { naProva: true }).erros.join(), /falta o desenho "🥚"/);
  // letras encostadas formam palavra que não existe; palavra solta da grade
  const encostada = { id: 'cz6', tipo: 'cruzadinha', palavras: [{ resposta: 'GATO', x: 0, y: 0, dir: 'h', dica: 'a' }, { resposta: 'GALO', x: 0, y: 0, dir: 'v', dica: 'b' },
    { resposta: 'OVO', x: 3, y: 0, dir: 'v', dica: 'c' }, { resposta: 'OLHO', x: 0, y: 3, dir: 'h', dica: 'd' }, { resposta: 'SOL', x: 6, y: 6, dir: 'h', dica: 'e' }] };
  assert.deepStrictEqual(conferir(encostada).erros, ['cz6: letras encostadas na coluna 4 formam "OVOO", que não é palavra da cruzadinha',
    'cz6: palavra 5 (SOL) solta: não cruza com as outras']);
  const fila = { id: 'cz7', tipo: 'cruzadinha', palavras: [{ resposta: 'GATO', x: 0, y: 0, dir: 'h', dica: 'a' }, { resposta: 'PE', x: 4, y: 0, dir: 'h', dica: 'b' }] };
  assert.match(conferir(fila).erros.join(), /linha 1 formam "GATOPE"/);
  // acento diferente no cruzamento: vale (cruzadinha de escola ignora acento)
  const acento = { id: 'cz5', tipo: 'cruzadinha', palavras: [{ resposta: 'PÃO', x: 0, y: 0, dir: 'h', dica: 'a' }, { resposta: 'ANO', x: 1, y: 0, dir: 'v', dica: 'b' }] };
  assert.deepStrictEqual(conferir(acento).erros, []);
});

test('cacaPalavras: fração achada (sem repetir nem índice estranho); validar exige cada palavra uma vez na grade', () => {
  assert.deepStrictEqual(pontos(caca, [[0, 1, 2, 3], [3, 2, 1, 0], [0, 0, 0], [0, 9, -1, 'x'], []]), [1, 1, 0.25, 0.25, 0]);
  assert.strictEqual(D.respostaCertaTexto(caca), 'GATO, PATO, SOL, LUA');
  assert.strictEqual(D.respostaTexto(caca, [2, 0]), 'SOL, GATO');
  assert.strictEqual(T.cacaPalavras.textoProva(caca), ' GATO PATO SOL LUA');
  assert.deepStrictEqual(conferir(caca), { erros: [], avisos: [] });
  const ruim = { id: 'cc2', tipo: 'cacaPalavras', grade: ['GATOG', 'AXXXA', 'TXXXT', 'OXXXX'], palavras: ['GATO', 'RATO', 'GAT'] };
  const e = conferir(ruim).erros.join('\n');
  assert.match(e, /"GATO" aparece 2 vez/);
  assert.match(e, /"RATO" aparece 0 vez/);
  assert.match(e, /"GAT" aparece 3 vez/);
  assert.match(conferir({ id: 'cc3', tipo: 'cacaPalavras', grade: ['abc', 'DEF'], palavras: ['AB'] }).erros.join(), /MAIÚSCULAS/);
});

test('figuras: opção com img (desenho que falta: aviso na sala, erro na prova) e soImagem só com img em todas', () => {
  const e = { id: 'e1', tipo: 'escolha', opcoes: [{ t: 'gato', img: '🐱' }, { t: 'banana', img: '🍌' }, { t: 'pão', img: '🍞' }], certa: 0 };
  assert.match(conferir(e).avisos.join(), /opção "pão": falta o desenho "🍞"/);
  assert.match(conferir(e, { naProva: true }).erros.join(), /opção "pão": falta o desenho "🍞"/);
  const v = { id: 'v1', tipo: 'varias', soImagem: true, opcoes: [{ t: 'gato', img: '🐱', ok: true }, { t: 'sol' }] };
  assert.match(conferir(v).erros.join(), /"soImagem" só vale true, com img em todas/);
  assert.deepStrictEqual(conferir({ id: 'v2', tipo: 'varias', soImagem: true, opcoes: [{ t: 'gato', img: '🐱', ok: true }, { t: 'banana', img: '🍌' }] }), { erros: [], avisos: [] });
  // sem img nem soImagem: nada muda (salas e provas antigas)
  assert.deepStrictEqual(conferir({ id: 'e2', tipo: 'escolha', opcoes: [{ t: 'a' }, { t: 'b' }], certa: 1 }), { erros: [], avisos: [] });
});

test('figuras: d.figura e apoio.partes[].figuras (D.conferirFiguras); ilustração que não existe é erro', () => {
  const ilustracao = (id) => (id === 'casa' ? { w: 1, h: 1 } : null);
  const ok = { id: 'f1', figura: { img: '🐱', legenda: 'gato' }, apoio: { titulo: 'P', partes: [{ figuras: [{ img: '🍌', legenda: 'banana' }] }] } };
  assert.deepStrictEqual(conferir(ok, { figuras: true, ilustracao }), { erros: [], avisos: [] });
  assert.deepStrictEqual(conferir({ id: 'f2', figura: { ilustracao: 'casa', alt: 'Uma casa' } }, { figuras: true, ilustracao }), { erros: [], avisos: [] });
  assert.match(conferir({ id: 'f3', figura: { ilustracao: 'barco', alt: 'Um barco' } }, { figuras: true, ilustracao }).erros.join(), /ilustração "barco" não registrada/);
  assert.match(conferir({ id: 'f4', figura: { ilustracao: 'casa' } }, { figuras: true, ilustracao }).erros.join(), /precisa de alt/);
  assert.match(conferir({ id: 'f5', figura: 'gato' }, { figuras: true }).erros.join(), /figura precisa de img ou ilustracao/);
  const falta = { id: 'f6', figura: { img: '🦆' }, apoio: { titulo: 'P', partes: [{ figuras: [{ img: '🐟' }] }] } };
  assert.strictEqual(conferir(falta, { figuras: true }).avisos.length, 2);
  assert.strictEqual(conferir(falta, { figuras: true, naProva: true }).erros.length, 2);
  // sem figura: nada
  assert.deepStrictEqual(conferir({ id: 'f7' }, { figuras: true }), { erros: [], avisos: [] });
});

test('fala do texto de apoio: uma fala por estrofe, os versos juntos; as legendas das figuras; o resto igual', () => {
  const apoio = { titulo: 'Poema', partes: [{ titulo: 'Bichos', versos: ['Pode ser um peixe', 'Que nunca sai do aquário', '', '', 'Pode ser um hamster', ''] },
    { figuras: [{ img: '🐟', legenda: 'peixe' }, { img: '🐹' }, { img: '🐱', legenda: 'gato' }] }, { figuras: [{ img: '🐟' }] }, { texto: 'Fim.' }] };
  assert.deepStrictEqual([...R.Falas.segmentosApoio(apoio)],
    ['Poema', 'Bichos', 'Pode ser um peixe Que nunca sai do aquário', 'Pode ser um hamster', 'peixe, gato.', 'Fim.']);
  assert.deepStrictEqual([...R.Falas.segmentosApoio({ titulo: 'Receita', partes: [{ titulo: 'Ingredientes:', lista: ['1 banana'] }, { texto: 'Lave.' }] })],
    ['Receita', 'Ingredientes:', '1 banana', 'Lave.']);
  assert.deepStrictEqual([..._estrofes(['a', 'b', '', 'c', '', ''])], [['a', 'b'], ['c']]);
});
function _estrofes(v) { return R._desafios.estrofes(v).map((e) => [...e]); }

test('viagem: escolha com figura ou só com desenho não vira portal do voo', () => {
  const ctx = JogoNode.contexto({ console: { warn() {}, log() {}, error: console.error }, setTimeout, clearTimeout, Math, Date });
  const Rv = JogoNode.carregar(ctx, JogoNode.scripts()).Reino;
  Rv.Progresso.estado = () => ({ salas: {} });
  const e = (id, extra) => Object.assign({ id, tipo: 'escolha', pergunta: 'Qual?', opcoes: [{ t: 'gato' }, { t: 'sol' }], certa: 0 }, extra);
  Rv.materias.push({ id: 'teste-viagem', salas: [{ id: 'tv1', desafios: [e('tv-1'), e('tv-2', { figura: { img: '🐱' } }),
    e('tv-3', { soImagem: true, opcoes: [{ t: 'gato', img: '🐱' }, { t: 'sol', img: '☀' }] }), e('tv-4', { opcoes: [{ t: 'gato', img: '🐱' }, { t: 'sol', img: '☀' }] })] }] });
  assert.deepStrictEqual([...Rv.Viagem.perguntas('teste-viagem', 5, 'x').map((p) => p.desafio.id)].sort(), ['tv-1', 'tv-4']);
});

// validador inteiro: sala 1 de História (fixture do 3º bimestre) copiada, com o 1º desafio trocado pelos tipos novos
const jogo = Jogo.raiz;
const tmp = path.join('/tmp/reino-testes', path.basename(path.dirname(jogo)) + '-' + crypto.createHash('md5').update(jogo).digest('hex').slice(0, 8), 'desafios-livro-b', 'historia');
function validarCom(troca) {
  fs.mkdirSync(tmp, { recursive: true });
  const sala = path.join(tmp, 'h1.js');
  const t = fs.readFileSync(Jogo.arquivo('conteudo/materias/historia/h1'), 'utf8');
  assert.ok(t.includes("tipo: 'varias'"), 'âncora sumiu de h1.js (atualize o teste)');
  fs.writeFileSync(sala, t.replace("tipo: 'varias'", troca));
  const r = spawnSync(process.execPath, ['ferramentas/validar/validar-conteudo.js', '--terceiro-bimestre', '--materia', sala], { cwd: jogo, encoding: 'utf8' });
  return { status: r.status, saida: (r.stdout || '') + (r.stderr || '') };
}

test('validar-conteudo: aceita cruzadinha, tabela e caça-palavras com os campos deles; recusa os campos fora do tipo', () => {
  const ok = validarCom("tipo: 'cruzadinha', palavras: [{ resposta: 'GATO', x: 0, y: 0, dir: 'h', dica: 'Mia.' }, { resposta: 'GALO', x: 0, y: 0, dir: 'v', dica: 'Canta.' }]");
  assert.strictEqual(ok.status, 0, ok.saida);
  const tab = validarCom("tipo: 'tabela', cab: ['A', 'B'], linhas: [['x', { certa: 1 }]], banco: ['p', 'q']");
  assert.strictEqual(tab.status, 0, tab.saida);
  const ruim = validarCom("tipo: 'cacaPalavras', grade: ['GATO'], palavras: ['RATO'], cab: ['A']");
  assert.strictEqual(ruim.status, 1, ruim.saida);
  assert.match(ruim.saida, /h1-01: "RATO" aparece 0 vez/);
  assert.match(ruim.saida, /h1-01: "cab" só vale em tabela/);
  const so = validarCom("tipo: 'escolha', soImagem: true, certa: 0");
  assert.match(so.saida, /h1-01: "soImagem" só vale true, com img em todas as opções/);
});
