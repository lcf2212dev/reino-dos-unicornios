// Aceite do 4º bimestre, todas as questões: o código comum às partes (quarto-bimestre-questoes*.navegador.test.js),
// uma por capítulo, para rodarem ao mesmo tempo.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');
const { preparar, responderDaVez, seguirSala } = require('./ajudantes/quarto-bimestre');

async function jogarSala(c, salaId) {
  const sala = await c.js(`(function (s) { return { id: s.id, cartas: (s.cartas || []).length, ids: s.desafios.map(function (d) { return d.id; }) }; })(
    Reino.materia('portugues4').salas.find(function (s) { return s.id === ${JSON.stringify(salaId)}; }))`);
  await c.js(`Reino.UI.fecharTodas(); document.body.classList.remove('em-missao');
    void Reino.Missao.iniciar(Reino.materia('portugues4'), Reino.materia('portugues4').salas.find(function (s) { return s.id === ${JSON.stringify(salaId)}; }))`);
  await c.avancar(300);
  // a trilha ("Começar"), e em cada etapa as cartas dela e as questões, na ordem do livro (a esperada é a da vez na sala)
  const rels = [];
  const r = await seguirSala(c, async (id) => { rels.push(await responderDaVez(c, sala.ids[rels.length] || id, 'dom')); });
  assert.strictEqual(r.cartas.length, sala.cartas, `${salaId}: cartas vistas`);
  return { rels, fim: r.fim === 'fimSala' };
}

// devolve [nome, função] para o test() do arquivo de cada parte (o test() chamado lá: a duração fica no nome dele)
function capitulo(cap) {
  return [`Língua Portuguesa, Cap. ${cap}: cada questão começa em branco, erra de verdade e é consertada na tela`, async (t) => {
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
  }];
}

module.exports = { capitulo };
