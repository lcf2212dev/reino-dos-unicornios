// Aceite do 4º bimestre (Língua Portuguesa), parte 2b: errar e consertar pela tela, como ela faz. Uma questão de cada
// tipo usado nos livros (a 1ª de cada tipo que não é livre; marcar com legenda de cores, tabela com banco de palavras e
// com caixa de digitar), numa missão com essas questões: cada uma começa em branco, recebe a resposta errada pelos
// controles, "Conferir" dá "Quase!", "Tentar de novo", e ela conserta NO MESMO controle até "Isso!". Por toque de
// verdade no celular e só pelo teclado (Tab, setas, Enter, digitação) no notebook. Sem erro de console.
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1).
// Rodar (da raiz): npm run unidade -- --so quarto-bimestre-recuperacao
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');
const { preparar, acionar, responderDaVez } = require('./ajudantes/quarto-bimestre');

// roda NA PÁGINA: as questões (ids) e a missão com elas, na ordem dos tipos
function escolher() {
  var m = Reino.materia('portugues4'), todas = [];
  m.salas.forEach(function (s) { s.desafios.forEach(function (d) { if (!d.livre) todas.push(d); }); });
  var ids = [], tipos = [];
  function pegar(f) { var d = todas.find(f); if (d && ids.indexOf(d.id) < 0) ids.push(d.id); }
  todas.forEach(function (d) { if (tipos.indexOf(d.tipo) < 0) tipos.push(d.tipo); });
  tipos.forEach(function (t) {
    if (t === 'marcar') pegar(function (d) { return d.tipo === t && d.cores; });
    else if (t === 'tabela') {
      pegar(function (d) { return d.tipo === t && d.banco; });
      pegar(function (d) { return d.tipo === t && d.linhas.some(function (l) { return l.some(function (c) { return c && c.certas; }); }); });
    } else if (t === 'escrever') pegar(function (d) { return d.tipo === t && d.chaves; });
    else pegar(function (d) { return d.tipo === t; });
  });
  return ids;
}

for (const [modo, tamanho] of [['toque', 'celular'], ['teclado', 'notebook']]) {
  test(`errar e consertar no mesmo controle, uma questão de cada tipo, por ${modo} no ${tamanho}`, async () => {
    const c = await abrirCenario({ tamanho, save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'aceite-4bim-recuperacao-')) });
    try {
      await c.page.evaluate(preparar);
      const ids = await c.page.evaluate(escolher);
      const tipos = await c.js(`(function (ids) { var t = {}; Reino.materia('portugues4').salas.forEach(function (s) { s.desafios.forEach(function (d) { if (ids.indexOf(d.id) >= 0) t[d.tipo] = 1; }); }); return Object.keys(t); })(${JSON.stringify(ids)})`);
      assert.ok(tipos.length >= 12, 'tipos da matéria: ' + tipos);
      await c.js(`(function (m, ids) {
        var ds = []; m.salas.forEach(function (s) { s.desafios.forEach(function (d) { if (ids.indexOf(d.id) >= 0) ds.push(d); }); });
        ds.sort(function (a, b) { return ids.indexOf(a.id) - ids.indexOf(b.id); });
        void Reino.Missao.iniciar(m, { id: 'aceite-conserto', nome: 'Errar e consertar', emoji: '✏️', paginas: 'p. 1', intro: 'Vamos errar e consertar!',
          ordem: 'livro', livroOrigem: 'aprendizagem', capitulo: 10, cartas: [], desafios: ds });
      })(Reino.materia('portugues4'), ${JSON.stringify(ids)})`);
      await c.avancar(600);
      await acionar(c, c.page.locator('.tela-missao footer.rodape-acao:not([hidden]) .btn-principal'), modo);
      const problemas = [];
      for (const id of ids) {
        const r = await responderDaVez(c, id, modo);
        if (r.errado !== 'quase') r.problemas.push('a errada não foi conferida');
        if (r.problemas.length) problemas.push(`${id} (${r.tipo}): ${r.problemas.join('; ')}`);
        if (r.certo !== 'certo') break;   // a missão não andou: as próximas sairiam fora da ordem
      }
      console.log(`${modo} no ${tamanho}: ${ids.length} questões, tipos ${tipos.sort().join(', ')}`);
      assert.deepStrictEqual(problemas, [], `questões com problema (${modo})`);
      assert.ok(await c.js("!!document.querySelector('.tela-missao .fim-sala')"), 'a missão não terminou');
      if (modo === 'teclado') assert.strictEqual(await c.js('Reino.UI.porTeclado()'), true, 'a última entrada não foi o teclado');
      assert.deepStrictEqual(await c.js('window.__q.erros'), [], 'erro na página');
      assert.deepStrictEqual(c.erros, [], 'erro de console');
    } finally { await c.fechar(); }
  });
}
