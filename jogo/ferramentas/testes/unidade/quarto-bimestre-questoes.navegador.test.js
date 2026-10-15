// Aceite do 4º bimestre (Língua Portuguesa), parte 2: TODAS as questões, uma a uma, na tela real da missão
// (Reino.Missao.iniciar com a sala de verdade, intro e cartas do resumo; um capítulo por teste). Cada questão começa em
// branco, como ela vê (sem valor inicial: nada marcado, Conferir desligado); recebe pela tela uma resposta errada de
// verdade (a que a tela produziria: outro índice, par trocado, ordem trocada, palavra errada, marca errada, grupo trocado,
// texto sem as palavras pedidas, V/F invertido, desenho sem o pedido) e dá "Quase!"; depois do "Tentar de novo" é
// consertada NO MESMO controle até a certa (exemplos.certa) e dá "Isso!", na ordem do livro, até "Terminar a sala"
// (a sala conta como feita). Só as livres (pessoais: qualquer resposta vale) não têm errada: a contagem sai no teste.
// Toques pelo DOM (rápido; toque e teclado de verdade: quarto-bimestre-recuperacao). Sem erro de console.
// As salas vêm de Reino.materia('portugues4').salas (capítulo sem salas: pulado, com aviso).
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1); celular.
// Rodar (da raiz): npm run unidade -- --so quarto-bimestre-questoes
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');
const { preparar, responderDaVez } = require('./ajudantes/quarto-bimestre');

async function jogarSala(c, salaId) {
  const sala = await c.js(`(function (s) { return { id: s.id, cartas: (s.cartas || []).length, ids: s.desafios.map(function (d) { return d.id; }) }; })(
    Reino.materia('portugues4').salas.find(function (s) { return s.id === ${JSON.stringify(salaId)}; }))`);
  await c.js(`Reino.UI.fecharTodas(); document.body.classList.remove('em-missao');
    void Reino.Missao.iniciar(Reino.materia('portugues4'), Reino.materia('portugues4').salas.find(function (s) { return s.id === ${JSON.stringify(salaId)}; }))`);
  await c.avancar(300);
  // intro ("Começar") e as cartas do resumo ("Continuar →" … "Começar 🦄")
  for (let i = 0; i <= sala.cartas; i++) {
    await c.js("document.querySelector('.tela-missao footer.rodape-acao:not([hidden]) .btn-principal').click()");
    await c.avancar(100);
  }
  assert.ok(await c.js("!!document.querySelector('.tela-missao .desafio')"), `${salaId}: depois de ${sala.cartas} cartas, nenhum desafio na tela`);
  const rels = [];
  for (const id of sala.ids) {
    rels.push(await responderDaVez(c, id, 'dom'));
    if (rels[rels.length - 1].certo !== 'certo') break;   // a missão não andou: as próximas sairiam fora da ordem
  }
  return { rels, fim: await c.js("!!document.querySelector('.tela-missao .fim-sala')") };
}

for (const cap of [10, 11, 12]) {
  test(`Língua Portuguesa, Cap. ${cap}: cada questão começa em branco, erra de verdade e é consertada na tela`, async (t) => {
    const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'aceite-4bim-questoes-')) });
    try {
      const salas = await c.js(`Reino.materia('portugues4').salas.filter(function (s) { return s.capitulo === ${cap}; }).map(function (s) { return s.id; })`);
      if (!salas.length) { t.skip(`Cap. ${cap} ainda sem salas neste jogo`); return; }
      await c.page.evaluate(preparar);
      const problemas = [], livres = [], porTipo = {};
      let total = 0;
      for (const s of salas) {
        const r = await jogarSala(c, s);
        r.rels.forEach((x) => {
          total++;
          if (x.livre) livres.push(x.id);
          else porTipo[x.tipo] = (porTipo[x.tipo] || 0) + 1;
          if (x.problemas.length) problemas.push(`${s}/${x.id} (${x.tipo}): ${x.problemas.join('; ')}`);
        });
        if (!r.fim) problemas.push(`${s}: a sala não terminou ("Sala concluída!")`);
        if (!(r.rels.length && r.rels[r.rels.length - 1].ultimo)) problemas.push(`${s}: o último desafio não tinha "Terminar a sala"`);
      }
      console.log(`Cap. ${cap}: ${salas.length} salas, ${total} questões; errada e conserto: ${total - livres.length} (${Object.keys(porTipo).sort().map((k) => k + ' ' + porTipo[k]).join(', ')}); ` +
        `livres (sem errada): ${livres.length}${livres.length ? ' (' + livres.join(', ') + ')' : ''}`);
      assert.deepStrictEqual(problemas, [], 'questões com problema');
      assert.deepStrictEqual(await c.js('window.__q.erros'), [], 'erro na página durante as questões');
      assert.deepStrictEqual(c.erros, [], 'erro de console');
      const naoFeitas = await c.js(`${JSON.stringify(salas)}.filter(function (s) { var r = Reino.Progresso.estado().salas[s]; return !(r && r.feita); })`);
      assert.deepStrictEqual(naoFeitas, [], 'salas jogadas até o fim que não contaram como feitas');
    } finally { await c.fechar(); }
  });
}
