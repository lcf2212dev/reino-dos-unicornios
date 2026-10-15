// Testes de unidade: tipos de desafio do livro do 4º bimestre, parte 1 (js/atividades/desafios/marcar.js, digitar.js,
// escrever.js e o `guardar` do desenho.js): os tokens do marcar, a pontuação, os textos da correção, as dicas do
// escrever e as checagens do validador (def.validar), com desafios sintéticos.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/desafios-livro-a.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('./ajudantes/terceiro-bimestre');

function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date, JSON });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos'], grupos: ['atividades'] }));
  return ctx.Reino;
}
const R = carregar();
const D = R.Desafios;
const _d = R._desafios;
const pontos = (d, valores) => valores.map((v) => D.pontuar(d, v));

// def.validar com um v de mentira: devolve { erros, avisos }
function validar(d, naProva = false) {
  const erros = [], avisos = [];
  const textoOk = (t) => typeof t === 'string' && t.trim().length > 0;
  R.tiposDesafio[d.tipo].validar(d, { checar: (c, m) => { if (!c) erros.push(m); }, avisar: (m) => avisos.push(m), naProva, icones: { 'lp:gato': {} }, textoOk });
  return { erros, avisos };
}

/* ---------- marcar ---------- */
const CORES = [{ nome: 'Ponto-final', cor: '#4d8dff' }, { nome: 'Personagem', cor: '#ff7eb6' }];
const marcar = (texto, extra) => Object.assign({ id: 'm', tipo: 'marcar', pergunta: 'Circule.', texto }, extra || {});

test('marcar: cada palavra e cada sinal é um token; "..." e "—" são um sinal só; \\n quebra a linha', () => {
  const a = _d.analisarMarcar('—Oi, {guarda-chuva}... tudo bem?\nSim{!|0}');
  const tokens = Array.from(a.tokens);
  assert.deepStrictEqual(tokens.map((t) => t.t), ['—', 'Oi', ',', 'guarda-chuva', '...', 'tudo', 'bem', '?', 'Sim', '!']);
  assert.deepStrictEqual(tokens.map((t) => t.sinal), [true, false, true, false, true, false, false, true, false, true]);
  assert.deepStrictEqual(tokens.map((t) => t.linha), [0, 0, 0, 0, 0, 0, 0, 0, 1, 1]);
  assert.deepStrictEqual(tokens.map((t) => t.espaco), [false, false, false, true, false, true, true, false, false, false]);
  assert.deepStrictEqual(Array.from(a.alvos).map((x) => [Array.from(x.idx), x.cat]), [[[3], 0], [[9], 0]]);
  assert.strictEqual(a.linhas, 2);
  assert.deepStrictEqual(Array.from(a.erros), []);
});

test('marcar: alvo de várias palavras vale inteiro; pontuação = (alvos certos - marcas erradas) / alvos', () => {
  // tokens: 0 Era 1 uma 2 vez 3 a 4 princesa 5 e 6 o 7 gato 8 .
  const d = marcar('Era uma vez {a princesa} e o {gato}{.|0}');
  assert.deepStrictEqual(pontos(d, [{ 3: 0, 4: 0, 7: 0, 8: 0 }, { 3: 0, 4: 0, 7: 0 }, { 4: 0, 7: 0, 8: 0 }, { 3: 0, 4: 0, 7: 0, 8: 0, 0: 0 }, {}, { 0: 0, 1: 0, 2: 0 }]),
    [1, 2 / 3, 2 / 3, 2 / 3, 0, 0]);
  assert.strictEqual(D.respostaCertaTexto(d), 'a princesa, gato, .');
  assert.strictEqual(D.respostaTexto(d, { 3: 0, 4: 0, 0: 0 }), 'Era, a princesa');
  assert.strictEqual(D.respostaTexto(d, {}), '(nada marcado)');
});

test('marcar com cores: a cor tem de ser a do alvo; a correção diz o nome da cor', () => {
  // tokens: 0 A 1 menina 2 riu 3 . 4 O 5 gato 6 correu 7 !
  const d = marcar('A {menina|1} riu{.|0} O {gato|1} correu{!|0}', { cores: CORES });
  assert.deepStrictEqual(pontos(d, [{ 1: 1, 3: 0, 5: 1, 7: 0 }, { 1: 0, 3: 0, 5: 1, 7: 0 }, { 1: 1, 3: 1, 5: 1, 7: 0 }, { 1: 1, 3: 0, 5: 1, 7: 0, 2: 1 }]),
    [1, 0.5, 0.5, 0.75]);
  assert.strictEqual(D.respostaCertaTexto(d), 'Ponto-final: ., ! • Personagem: menina, gato');
  assert.strictEqual(D.respostaTexto(d, { 1: 1, 2: 1, 3: 0 }), 'Ponto-final: . • Personagem: menina riu');
});

test('marcar: alvo opcional ({x?}, {x|n?}) não é erro marcado na cor dele, não falta e fica fora do total', () => {
  const a = _d.analisarMarcar('{Oi?} {?} {??} {sol|1?} {lua}');
  assert.deepStrictEqual(Array.from(a.alvos).map((x) => [x.t, x.cat, x.opcional]), [['Oi', 0, true], ['?', 0, false], ['?', 0, true], ['sol', 1, true], ['lua', 0, false]]);
  // tokens: 0 O 1 gato 2 e 3 a 4 gata 5 .
  const d = marcar('O {gato|1} e {a gata|1?}{.|0}', { cores: CORES });
  assert.deepStrictEqual(pontos(d, [{ 1: 1, 5: 0 }, { 1: 1, 5: 0, 3: 1, 4: 1 }, { 1: 1, 5: 0, 4: 1 }, { 1: 1, 5: 0, 4: 0 }, { 1: 1 }, { 3: 1, 4: 1 }]),
    [1, 1, 1, 0.5, 0.5, 0]);
  assert.strictEqual(D.respostaCertaTexto(d), 'Ponto-final: . • Personagem: gato (também vale: Personagem: a gata)');
  assert.strictEqual(D.respostaCertaTexto(marcar('O {gato} e {a gata|?}.')), 'gato (também vale: a gata)');
  assert.deepStrictEqual(validar(marcar('O {gato} e {a gata|?}.')).erros, []);
  assert.match(validar(marcar('O {gato?} miou.')).erros.join(), /sem alvo obrigatório/);
  assert.match(validar(marcar('O {gato} e {a gata|1?}.')).erros.join(), /só vale com cores/);
  assert.match(validar(marcar('O {gato} e {a gata|x?}.', { cores: CORES })).erros.join(), /cor inválida/);
});

test('marcar: respostas estranhas não quebram (índice fora, cor inválida, valor que não é objeto)', () => {
  const d = marcar('O {gato} miou.');
  assert.deepStrictEqual(pontos(d, [{ 99: 0 }, { 1: -1 }, { 1: 'x' }, 'x', 5, [], { 1: 0, 99: 0 }]), [0, 0, 0, 0, 0, 0, 0]);
});

test('marcar: o validador aceita o certo e recusa chave sem par, alvo no meio da palavra, cor que não existe', () => {
  assert.deepStrictEqual(validar(marcar('O {gato} miou.')).erros, []);
  assert.deepStrictEqual(validar(marcar('O {gato|1} miou{.|0}', { cores: CORES, marca: 'pintar' })).erros, []);
  const erros = (d) => validar(d).erros.join(' | ');
  assert.match(erros(marcar('O {gato miou.')), /chave sem par/);
  assert.match(erros(marcar('O {gat {o}} miou.')), /chave sem par/);
  assert.match(erros(marcar('O {gat}o miou.')), /meio de uma palavra/);
  assert.match(erros(marcar('O ga{to} miou.')), /meio de uma palavra/);
  assert.match(erros(marcar('O gato miou.')), /sem alvo obrigatório/);
  assert.match(erros(marcar('O { } miou.')), /alvo vazio/);
  assert.match(erros(marcar('O {gato|1} miou.')), /só vale com cores/);
  assert.match(erros(marcar('O {gato|2} miou.', { cores: CORES })), /cor que não existe/);
  assert.match(erros(marcar('O {gato|x} miou.', { cores: CORES })), /cor inválida/);
  assert.match(erros(marcar('O {gato} miou.', { cores: [{ nome: 'Azul', cor: 'azul' }] })), /cores = /);
  assert.match(erros(marcar('O {gato} miou.', { marca: 'riscar' })), /marca deve ser/);
  assert.match(validar(marcar('O {gato} miou.', { cores: CORES })).avisos.join(), /Personagem não marca nada/);
});

/* ---------- digitar ---------- */
const digitar = (extra) => Object.assign({ id: 'g', tipo: 'digitar', pergunta: 'Complete.',
  frases: [{ antes: 'O', depois: 'miou.', certas: ['gato', 'gatinho'] }, { antes: 'A', depois: 'é fria.', certas: ['água'] }] }, extra || {});

test('digitar: sem diferença de maiúsculas, espaços e ponto final; o acento conta', () => {
  const d = digitar();
  assert.deepStrictEqual(pontos(d, [['gato', 'água'], [' GATINHO ', 'Água.'], ['gato', 'agua'], ['cão', ''], [], [null, 7], 'gato']), [1, 1, 0.5, 0, 0, 0, 0]);
  assert.strictEqual(D.respostaCertaTexto(d), 'gato (ou gatinho) • água');
  assert.strictEqual(D.respostaTexto(d, ['gato', '']), 'gato • ______');
});

test('digitar: livre vale qualquer resposta; colado mostra a palavra inteira na correção', () => {
  const livre = digitar({ livre: true, frases: [{ antes: 'Eu gosto de', depois: '.' }] });
  assert.deepStrictEqual(pontos(livre, [['pizza'], ['  '], []]), [1, 0, 0]);
  assert.strictEqual(D.respostaCertaTexto(livre), D.TEXTO_PESSOAL);
  const colado = digitar({ colado: true, frases: [{ antes: 'PA', depois: 'ARINHO', certas: ['SS'] }] });
  assert.deepStrictEqual(pontos(colado, [['ss'], ['s']]), [1, 0]);
  assert.strictEqual(D.respostaCertaTexto(colado), 'PASSARINHO');
  assert.strictEqual(D.respostaTexto(colado, ['S']), 'PASARINHO');
  assert.strictEqual(D.respostaTexto(colado, ['ss']), 'PASSARINHO');   // a palavra do livro em maiúsculas
});

test('digitar: o validador pede certas, antes/depois e figura com desenho (erro só na prova)', () => {
  assert.deepStrictEqual(validar(digitar()).erros, []);
  assert.deepStrictEqual(validar(digitar({ livre: true, frases: [{ antes: 'Eu', depois: '.' }] })).erros, []);
  const erros = (d, p) => validar(d, p).erros.join(' | ');
  assert.match(erros(digitar({ frases: [{ antes: 'O', depois: '.', certas: [] }] })), /sem certas/);
  assert.match(erros(digitar({ frases: [{ antes: 'O', certas: ['x'] }] })), /antes e depois/);
  assert.match(erros(digitar({ frases: [] })), /sem frases/);
  assert.match(erros(digitar({ colado: true, frases: [{ antes: 'PA', depois: 'O', certas: ['s s'] }] })), /colado com espaço/);
  assert.match(erros(digitar({ livre: 'sim' })), /"livre" só vale true/);
  const fig = digitar({ frases: [{ antes: '', depois: '', certas: ['sapo'], img: 'lp:sapo', alt: 'sapo' }] });
  assert.deepStrictEqual(validar(fig).erros, []);
  assert.match(validar(fig).avisos.join(), /falta o desenho/);
  assert.match(erros(fig, true), /falta o desenho/);
  assert.match(erros(digitar({ frases: [{ antes: '', depois: '', certas: ['gato'], img: 'lp:gato' }] })), /img e alt/);
});

/* ---------- escrever ---------- */
const escrever = (extra) => Object.assign({ id: 'e', tipo: 'escrever', pergunta: 'Escreva sobre o gato.' }, extra || {});
const dica = (d, t) => _d.avaliarEscrever(d, t).dica;

test('escrever: frases terminadas em . ! ?, palavras e chaves (sem acento, palavra inteira)', () => {
  const d = escrever({ minFrases: 2, minPalavras: 6, chaves: [['gato', 'gata'], ['Gato de Botas']] });
  assert.strictEqual(D.pontuar(d, 'O Gato de Botas é esperto. A gata gostou!'), 1);
  assert.strictEqual(D.pontuar(d, 'O GATO DE BOTAS é esperto. A gáta gostou?'), 1);   // sem acento nem maiúscula
  assert.strictEqual(D.pontuar(d, 'O Gato de Botas é esperto. A gata gostou'), 3 / 4);   // a 2ª frase sem ponto
  assert.strictEqual(D.pontuar(d, 'Os gatos de botas. Eles correm muito.'), 2 / 4);   // "gatos" não é "gato"
  assert.deepStrictEqual(pontos(d, ['', '   ', '...', 5, null]), [0, 0, 0, 0, 0]);
  assert.strictEqual(dica(d, 'O Gato de Botas é esperto. A gata gostou'), 'Termine cada frase com um ponto final.');
  assert.strictEqual(dica(d, 'O Gato de Botas é esperto.'), 'Escreva pelo menos 2 frases.');
  assert.strictEqual(dica(d, 'Gato. Gata.'), 'Escreva pelo menos 6 palavras.');
  assert.strictEqual(dica(d, 'O gato é muito esperto. Ele gosta de botas.'), 'Use a palavra "Gato de Botas" na sua resposta.');
  assert.strictEqual(dica(escrever({ minFrases: 1 }), 'Eu gosto de gatos'), 'Termine a frase com um ponto final.');
  assert.strictEqual(dica(d, 'O Gato de Botas é esperto. A gata gostou.'), null);
});

test('escrever: sem regras, qualquer texto com palavra vale; a correção mostra o modelo ou as regras', () => {
  const d = escrever();
  assert.deepStrictEqual(pontos(d, ['oi', '!!', '']), [1, 0, 0]);
  assert.strictEqual(D.respostaCertaTexto(escrever({ modelo: 'O gato miou.' })), 'O gato miou.');
  assert.strictEqual(D.respostaCertaTexto(escrever({ minFrases: 2, chaves: [['gato']] })), 'Uma resposta com pelo menos 2 frases, a palavra "gato".');
  assert.strictEqual(D.respostaTexto(d, '  Eu gosto.  '), 'Eu gosto.');
  // o que não é texto vale como vazio
  assert.deepStrictEqual([{}, ['oi'], 7].map((v) => D.respostaTexto(d, v)), ['(sem resposta)', '(sem resposta)', '(sem resposta)']);
  assert.deepStrictEqual(pontos(d, [{}, ['oi'], 7]), [0, 0, 0]);
});

test('escrever: o validador confere números, chaves e que o modelo cumpre as regras', () => {
  assert.deepStrictEqual(validar(escrever({ linhas: 4, minFrases: 2, chaves: [['gato']], modelo: 'O gato dorme. Ele sonha.' })).erros, []);
  const erros = (d) => validar(d).erros.join(' | ');
  assert.match(erros(escrever({ minFrases: 0 })), /minFrases/);
  assert.match(erros(escrever({ linhas: 20 })), /linhas/);
  assert.match(erros(escrever({ chaves: ['gato'] })), /chaves =/);
  assert.match(erros(escrever({ chaves: [[]] })), /chaves =/);
  assert.match(erros(escrever({ minFrases: 2, modelo: 'O gato dorme.' })), /modelo não cumpre/);
  assert.match(validar(escrever()).avisos.join(), /sem regra/);
});

/* ---------- desenho: guardar ---------- */
test('desenho: "guardar" só vale true; os outros tipos não aceitam os campos novos', () => {
  const d = { id: 'd', tipo: 'desenho', pergunta: 'Desenhe.', requisitos: ['cores'] };
  assert.deepStrictEqual(validar(d).erros, []);
  assert.deepStrictEqual(validar({ ...d, guardar: true }).erros, []);
  assert.match(validar({ ...d, guardar: 'sim' }).erros.join(), /"guardar" só vale true/);
  assert.ok(R.tiposDesafio.desenho.campos.includes('guardar'));
  assert.deepStrictEqual(Array.from(R.tiposDesafio.marcar.campos), ['cores', 'marca']);
  assert.ok(!D.TREINAVEIS.includes('marcar') && !D.TREINAVEIS.includes('digitar') && !D.TREINAVEIS.includes('escrever'));
});
