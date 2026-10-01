// Laboratório de Química: o caderno de receitas (ui/quimica-caderno.js, docs/contratos/quimica.md §2).
// Save novo: a 'pof' aberta com "Experimente!", os segredos com "?" e a dica; depois de descobrir, aberta e com
// o selo; contador certo; teclado (Enter abre, Esc fecha); nada cortado nos 3 tamanhos.
// Servidor e banco de TESTE novos por cenário (cenario.js); saves 100% sintéticos.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

// receitas de teste (ids 'qcad-teste-*') quando os dados ainda têm menos de 3: a 1ª é segredo, a 2ª é descoberta
const DADOS = `(function () {
  var Q = Reino.QUIMICA.receitas;
  [['qcad-teste-a', ['agua', 'sal'], 'Tem no mar e na cozinha.'], ['qcad-teste-b', ['agua', 'oleo'], 'Dois que não se misturam.']]
    .forEach(function (x, i) {
      if (Reino.Quimica.receitas().length >= 3) return;
      Q.push({ id: x[0], ordem: 90 + i, nome: 'Receita de teste', emoji: '⭐', ingredientes: x[1], efeito: 'bolhas',
        cor: '#9fd8ff', acontece: 'Aconteceu uma coisa.', explica: ['Por causa disso.'], dica: x[2] });
    });
  return Reino.Quimica.receitas().map(function (r) { return r.id; });
})()`;
const aberta = "!!document.querySelector('.tela-quimica-caderno')";
const texto = (c, sel) => c.js(`(function () { var e = document.querySelector(${JSON.stringify(sel)}); return e ? e.textContent : null; })()`);

test('caderno: pof aberta num save novo, segredo com dica, descoberta com selo, teclado', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'inicio', pasta: '/tmp/reino-testes/ver/teste-quimica-caderno' });
  try {
    const ids = await c.js(DADOS);
    assert.strictEqual(ids[0], 'pof', 'a pof é a 1ª receita');
    const segredo = ids[1], outra = ids[2], total = ids.length;
    await c.tela('quimica-caderno');
    assert.ok(await c.js(aberta), 'o caderno abriu');
    assert.strictEqual(await texto(c, '.qcad-contador'), `0 de ${total} receitas feitas`);
    // a pof: aberta desde o começo, com "Experimente!"
    assert.ok(await c.js("document.querySelector('.qcad-cartao[data-receita=\"pof\"]').classList.contains('aberta')"));
    assert.match(await texto(c, '.qcad-cartao[data-receita="pof"]'), /Experimente!/);
    // o segredo: silhueta com "?" e a dica
    const dica = await c.js(`Reino.Quimica.receita(${JSON.stringify(segredo)}).dica`);
    const cs = `.qcad-cartao[data-receita="${segredo}"]`;
    assert.ok(await c.js(`document.querySelector('${cs}').classList.contains('segredo')`));
    assert.ok(await c.js(`!!document.querySelector('${cs} .qcad-interroga')`), 'o "?" na silhueta');
    assert.strictEqual(await c.js(`document.querySelector('${cs} .qcad-dica').textContent.replace(/\\u00ad/g, '')`), dica);
    // a página da pof: ingredientes em tubinhos, o aviso e o selo
    await c.tocar('.qcad-cartao[data-receita="pof"]');
    assert.strictEqual(await c.js("document.querySelectorAll('.qcad-tubo').length"), 2);
    const seguranca = await c.js("Reino.Quimica.frase('comum.seguranca').join(' ')");
    assert.ok(seguranca && (await texto(c, '.qcad-pagina .qcad-aviso')) === seguranca, 'o aviso de segurança');
    assert.match(await texto(c, '.qcad-pagina .qcad-selo'), /Experimente!/);
    // a página de um segredo: a dica e o convite para a bancada
    await c.tocar('.qcad-voltar');
    await c.tocar(cs);
    assert.ok(await c.js("!!document.querySelector('.qcad-pagina-segredo')"));
    assert.match(await texto(c, '.qcad-pagina'), /Misture na bancada e descubra!/);
    // Esc fecha
    await c.tecla('Escape');
    assert.ok(!(await c.js(aberta)), 'Esc fechou o caderno');

    // descobre a pof e o segredo: aberto, com "✔ Feita", e o contador anda
    await c.js(`Reino.Quimica.descobrir('receitas', 'pof'); Reino.Quimica.descobrir('receitas', ${JSON.stringify(segredo)})`);
    await c.js(`Reino.UI.telaQuimicaCaderno({ receita: ${JSON.stringify(segredo)} })`);
    await c.avancar(600);
    assert.ok(await c.js("!document.querySelector('.qcad-pagina-segredo') && !!document.querySelector('.qcad-pagina')"), 'abriu direto na receita');
    assert.match(await texto(c, '.qcad-pagina .qcad-selo.feita'), /Feita/);
    await c.tocar('.qcad-voltar');
    assert.strictEqual(await texto(c, '.qcad-contador'), `2 de ${total} receitas feitas`);
    assert.match(await texto(c, '.qcad-cartao[data-receita="pof"]'), /Feita/);
    assert.ok(await c.js(`document.querySelector('.qcad-cartao[data-receita="${outra}"]').classList.contains('segredo')`));

    // teclado: Enter no cartão abre a página e o foco vai para o rodapé ou o título; Esc fecha
    await c.js("document.querySelector('.qcad-cartao[data-receita=\"pof\"]').focus()");
    await c.tecla('Enter');
    await c.avancar(200);
    assert.ok(await c.js("!!document.querySelector('.qcad-pagina')"), 'Enter abriu a receita');
    assert.ok(await c.js("(function (a) { return !!a && (a.classList.contains('qcad-voltar') || a.classList.contains('qcad-titulo')); })(document.activeElement)"),
      'o foco seguiu para a página');
    // folhear pelo teclado: Enter na seta passa a página e o foco fica na seta (Enter de novo segue folheando)
    await c.js("document.querySelector('.qcad-seta[aria-label=\"Próxima receita\"]').focus()");
    await c.tecla('Enter');
    await c.avancar(200);
    assert.match(await texto(c, '.qcad-pag'), /^Receita 2 de/);
    assert.strictEqual(await c.js("document.activeElement.getAttribute('aria-label')"), 'Próxima receita', 'o foco ficou na seta');
    await c.tecla('Enter');
    await c.avancar(200);
    assert.match(await texto(c, '.qcad-pag'), /^Receita 3 de/);
    await c.tecla('Escape');
    assert.ok(!(await c.js(aberta)), 'Esc fechou');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

// nada cortado: o painel inteiro na tela, sem rolagem de lado, e os botões do rodapé com o texto inteiro
for (const tamanho of ['celular', 'tablet', 'notebook']) {
  test(`caderno: cabe no ${tamanho}`, async () => {
    const c = await abrirCenario({ tamanho, save: 'inicio', pasta: '/tmp/reino-testes/ver/teste-quimica-caderno-' + tamanho });
    try {
      await c.js(DADOS);
      await c.js("Reino.UI.telaQuimicaCaderno({ receita: 'pof' })");
      await c.avancar(600);
      const r = await c.js(`(function () {
        var p = document.querySelector('.tela-quimica-caderno .painel').getBoundingClientRect(), ruim = [];
        if (p.left < 0 || p.right > innerWidth || p.top < 0 || p.bottom > innerHeight) ruim.push('painel fora da tela');
        document.querySelectorAll('.qcad-rodape .btn-grande, .qcad-folha, .qcad-tubos').forEach(function (b) {
          if (b.offsetParent && b.scrollWidth > b.clientWidth + 1) ruim.push('cortado: ' + b.className);
        });
        var f = document.querySelector('.qcad-folha').getBoundingClientRect();
        document.querySelectorAll('.qcad-rodape .btn-grande, .qcad-tubo, .qcad-seta').forEach(function (b) {
          var q = b.getBoundingClientRect(), dentro = b.closest('.qcad-folha') ? f : p;
          if (b.offsetParent && (q.left < dentro.left - 1 || q.right > dentro.right + 1)) ruim.push('saiu: ' + b.className);
        });
        return ruim;
      })()`);
      assert.deepStrictEqual(r, []);
      assert.deepStrictEqual(c.erros, []);
    } finally { await c.fechar(); }
  });
}
