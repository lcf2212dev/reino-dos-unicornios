// "📖 Livro" na pergunta da sala de livro (D.render, opção aoLivro; missao.js): na 1ª pergunta de uma sala de livro o
// botão está no cartão do enunciado, ao lado do "🔊 Ouvir" e na mesma linha (celular); pelo teclado (foco e Enter) abre o
// livro na carta da pergunta (d.livro); o Esc fecha, a opção marcada continua marcada e o foco volta ao botão. Não existe
// na pergunta sozinha (Hora da pergunta!), no treino do Castelo, na prova da Escola nem na sala sorteada.
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1); celular (o botão também no tablet e
// no notebook, e com Letras grandes nos 3). Sem erro de console.
// Rodar (da raiz): npm run unidade -- --so desafio-livro
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');
const { preparar, seguirSala } = require('./ajudantes/quarto-bimestre');

const MAT = 'matematica4', SALA = 'ma11a7', D1 = 'ma11a7-01';
const temBotao = (c, tela) => c.js(`!!document.querySelector('${tela} .btn-livro')`);

// na 1ª pergunta da sala de livro: o botão, a carta certa pelo teclado, o Esc e a resposta que continua
async function naSala(c, onde) {
  await c.page.evaluate(preparar);
  await c.js(`void Reino.Missao.iniciar(Reino.materia('${MAT}'), Reino.materia('${MAT}').salas.find(function (s) { return s.id === '${SALA}'; }))`);
  await c.avancar(1500);
  assert.strictEqual((await seguirSala(c, async () => {}, { antesDe: D1 })).fim, 'desafio', 'não chegou à 1ª pergunta' + onde);
  const b = await c.js(`(function () { var b = document.querySelector('.tela-missao .enunciado .btn-livro'), o = document.querySelector('.tela-missao .enunciado .btn-ouvir:not(.btn-livro)');
    return b && { texto: b.textContent, aria: b.getAttribute('aria-label'), mesmaLinha: !o || Math.abs(b.getBoundingClientRect().top - o.getBoundingClientRect().top) < 2,
      dentro: b.getBoundingClientRect().right <= document.querySelector('.tela-missao .enunciado').getBoundingClientRect().right }; })()`);
  assert.ok(b, 'sem o botão do livro na pergunta da sala de livro' + onde);
  assert.match(b.texto, /Livro/);
  assert.deepStrictEqual([b.aria, b.mesmaLinha, b.dentro], ['Ver no livro', true, true], 'rótulo, linha do 🔊 e dentro do cartão' + onde);
  // a resposta em andamento: uma opção marcada
  await c.page.locator('.tela-missao .opcao').first().click();
  await c.avancar(200);
  // teclado: foco no botão e Enter abre o livro na carta da pergunta
  await c.page.locator('.tela-missao .btn-livro').focus();
  await c.page.keyboard.press('Enter');
  await c.avancar(800);
  const livro = await c.js(`(function () { var m = Reino.materia('${MAT}'), d = m.salas.find(function (s) { return s.id === '${SALA}'; }).desafios[0];
    var carta = m.livro.find(function (x) { return x.id === d.livro; }), t = document.querySelector('#telas > .tela:last-child');
    var h = t && t.querySelector('.livro-carta h3');
    return { tela: t && t.className, titulo: h && h.textContent.replace(/\\u00ad/g, ''), esperado: carta.titulo }; })()`);
  assert.ok(!/tela-missao/.test(livro.tela), 'o livro não abriu: ' + livro.tela);
  assert.ok(livro.titulo && livro.titulo.indexOf(livro.esperado.slice(0, 12)) >= 0, `carta errada: ${livro.titulo} (esperava ${livro.esperado})`);
  await c.page.keyboard.press('Escape');
  await c.avancar(800);
  const volta = await c.js(`({ topo: document.querySelector('#telas > .tela:last-child').className,
    marcada: !!document.querySelector('.tela-missao .opcao[aria-pressed="true"]'), foco: document.activeElement && document.activeElement.classList.contains('btn-livro') })`);
  assert.match(volta.topo, /tela-missao/, 'o Esc não fechou o livro' + onde);
  assert.deepStrictEqual([volta.marcada, volta.foco], [true, true], 'a resposta sumiu ou o foco não voltou ao botão' + onde);
}

test('"📖 Livro" só na pergunta da sala de livro: abre a carta, fecha com Esc e a resposta continua', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'desafio-livro-')) });
  try {
    await naSala(c, ' (celular)');

    // a pergunta sozinha (o "Leia antes" faz esse papel)
    await c.js(`(function () { Reino.UI.fecharTodas(); document.body.classList.remove('em-missao'); var m = Reino.materia('${MAT}'), s = m.salas.find(function (x) { return x.id === '${SALA}'; });
      var q = { materia: m, sala: s, desafio: s.desafios[0] }; Reino.Bosque.pergunta = function () { return q; };
      void Reino.UI.perguntaFantasma({ id: null, arena: 'bosque' }); })()`);
    await c.avancar(600);
    assert.ok(await c.js("!!document.querySelector('.tela-bosque-pergunta .desafio')"), 'a pergunta sozinha não abriu');
    assert.strictEqual(await temBotao(c, '.tela-bosque-pergunta'), false, 'botão do livro na pergunta sozinha');
    await c.js('Reino.UI.fecharTodas(); document.body.classList.remove("em-missao")');
    await c.avancar(300);

    // a sala sorteada (não é de livro; matéria sintética, pois as do bimestre são todas de livro): a pergunta tem `livro`
    await c.js(`(function () { var m = { id: 'teste-livro', nome: 'Teste', emoji: '✏️', cor: '#8e4fd6', livro: [], unicornios: [], lugar: { nome: 'Ala de Teste', artigo: 'a' }, salas: [] };
      var s = { id: 'teste-livro-1', nome: 'Teste', emoji: '✏️', paginas: 'p. 1', intro: 'Teste.', desafios: [{ id: 'teste-livro-d1', tipo: 'escolha', pergunta: 'Qual?', livro: 'x', explica: 'x', opcoes: ['Sim.', 'Não.'], certa: 0 }] };
      void Reino.Missao.iniciar(m, s); })()`);
    await c.avancar(2000);
    await c.page.locator('.tela-missao .intro-botoes .btn-principal').click();
    await c.avancar(2500);
    assert.ok(await c.js("!!document.querySelector('.tela-missao .desafio')"), 'a sala sorteada não chegou à pergunta');
    assert.strictEqual(await temBotao(c, '.tela-missao'), false, 'botão do livro na sala sorteada');
    await c.js('Reino.UI.fecharTodas(); document.body.classList.remove("em-missao")');
    await c.avancar(300);

    // o treino do Castelo e a prova da Escola
    // (as provas da Escola são do bimestre passado, arquivadas e sem questões: uma cópia com uma questão que tem `livro`)
    const prova = "Object.assign({}, Reino.provas[0], { arquivada: false, questoes: [{ id: 'tq-p1', tipo: 'escolha', pergunta: 'Qual?', livro: 'x', explica: 'x', opcoes: ['Sim.', 'Não.'], certa: 0 }] })";
    for (const abrir of [`void Reino.Prova.iniciar(Reino.materia('${MAT}'))`, `void Reino.Provas.iniciar(${prova})`]) {
      await c.js(abrir);
      await c.avancar(1500);
      for (let i = 0; i < 4 && !(await c.js("!!document.querySelector('.tela-prova .desafio')")); i++) {
        // o ritual da calma: "Já respirei, pular"; a capa da prova: o principal
        const pular = c.page.locator('.tela-prova .ritual .btn-secundario:visible'), prin = c.page.locator('.tela-prova .btn-principal:visible').first();
        if (await pular.count()) await pular.first().click();
        else if (await prin.count()) await prin.click();
        await c.avancar(800);
      }
      assert.ok(await c.js("!!document.querySelector('.tela-prova .desafio')"), 'não chegou à pergunta: ' + abrir);
      assert.strictEqual(await temBotao(c, '.tela-prova'), false, 'botão do livro em ' + abrir);
      await c.js('Reino.UI.fecharTodas(); document.body.classList.remove("em-missao")');
      await c.avancar(300);
    }
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});

test('"📖 Livro" no tablet e no notebook, e com Letras grandes nos 3 tamanhos', async () => {
  for (const [tamanho, grandes] of [['tablet', false], ['notebook', false], ['celular', true], ['tablet', true], ['notebook', true]]) {
    const c = await abrirCenario({ tamanho, save: 'completo', ajustes: grandes ? { texto: 1.15 } : undefined, pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'desafio-livro-')) });
    try {
      await naSala(c, ` (${tamanho}${grandes ? ', Letras grandes' : ''})`);
      assert.deepStrictEqual(c.erros || [], []);
    } finally { await c.fechar(); }
  }
});
