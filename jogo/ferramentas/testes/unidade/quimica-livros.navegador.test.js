// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico): a Estante da Biblioteca da
// Química (Reino.UI.telaQuimicaLivros, docs/contratos/quimica.md §2 e §9). Abre, mostra os 8 livros e "Lidos: n de 8";
// folheia um livro até o fim (descoberta gravada, estrela só na 1ª vez); cada livro tem o seu desenho; teclado (Tab,
// Enter, setas, Esc); nada vaza para o lado no celular, no tablet e no notebook. Zero erro de console.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/quimica-livros.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const estrelas = 'Reino.Progresso.estado().estrelas.ganhas';
const semVazar = `(function () {
  var t = document.querySelector('.tela-quimica-livros'), r = [];
  var c = t.querySelector('.painel-conteudo').getBoundingClientRect();
  t.querySelectorAll('.painel-conteudo *').forEach(function (y) { var q = y.getBoundingClientRect(); if (q.width && (q.right > c.right + 1 || q.left < c.left - 1)) r.push('fora: ' + y.className); });
  var p = t.querySelector('.painel').getBoundingClientRect();
  t.querySelectorAll('footer.ql-rodape button').forEach(function (b) { var q = b.getBoundingClientRect(); if (q.left < p.left || q.right > p.right) r.push('botão fora: ' + b.textContent); });
  return r;
})()`;

test('livros: estante, folhear até o fim, estrela só na 1ª vez, teclado e Esc', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-quimica-livros' });
  try {
    await c.js('void Reino.UI.telaQuimicaLivros()');
    await c.avancar(600);
    assert.strictEqual(await c.js("document.querySelectorAll('.ql-livro').length"), 8);
    assert.match(await c.js("document.querySelector('.ql-contagem').textContent"), /Lidos: 0 de 8/);
    assert.deepStrictEqual(await c.js(semVazar), [], 'estante sem corte');

    const antes = await c.js(estrelas);
    await c.tocar('.ql-livro[data-livro="fogo"]');
    const n = await c.js("Reino.Quimica.livro('fogo').paginas.length");
    assert.ok(await c.js("!!document.querySelector('.ql-pagina canvas[data-desenho=fogo]')"), 'desenho do livro');
    assert.strictEqual(await c.js("Reino.Quimica.descoberto('livros', 'fogo')"), false, 'na 1ª página ainda não');
    for (let i = 1; i < n; i++) await c.tocar('[aria-label="Próxima página"]');
    assert.strictEqual(await c.js("Reino.Quimica.descoberto('livros', 'fogo')"), true, 'chegou ao fim');
    assert.strictEqual(await c.js(estrelas), antes + (await c.js('Reino.config.quimica.estrelasLivroNovo')));
    assert.strictEqual(await c.js("document.querySelector('.ql-selo').hidden"), false, 'selo');
    assert.deepStrictEqual(await c.js(semVazar), [], 'livro sem corte');
    await c.tocar('[aria-label="Página anterior"]');
    await c.tocar('[aria-label="Próxima página"]');
    await c.tocar('[aria-label="Voltar para a estante"]');
    assert.ok(await c.js("document.querySelector('.ql-livro[data-livro=fogo]').classList.contains('lido')"), '✔ na estante');
    assert.match(await c.js("document.querySelector('.ql-contagem').textContent"), /Lidos: 1 de 8/);
    await c.tocar('.ql-livro[data-livro="fogo"]');
    for (let i = 1; i < n; i++) await c.tocar('[aria-label="Próxima página"]');
    assert.strictEqual(await c.js(estrelas), antes + 1, 'a 2ª leitura não dá estrela');
    assert.strictEqual(await c.js("document.querySelector('.ql-selo').hidden"), true);

    // cada livro tem o seu desenho, em todas as páginas
    assert.strictEqual(await c.js("Reino.Quimica.livros().filter(function (l) { return l.paginas.every(function (p, i) { return !!Reino._quimicaLivros.desenho(l.desenho, i); }); }).length"), 8);

    // teclado: Tab até um livro, Enter abre, → folheia, Esc fecha
    await c.js('Reino.UI.fecharTodas(); void Reino.UI.telaQuimicaLivros()');
    await c.avancar(600);
    for (let i = 0; i < 4 && !(await c.js("document.activeElement.classList.contains('ql-livro')")); i++) await c.tecla('Tab');
    assert.ok(await c.js("document.activeElement.classList.contains('ql-livro')"), 'Tab chega nos livros');
    await c.tecla('Enter');
    await c.avancar(500);
    assert.ok(await c.js("!!document.querySelector('.ql-pagina')"), 'Enter abre');
    await c.tecla('ArrowRight');
    assert.match(await c.js("document.querySelector('.ql-pag').textContent"), /^(Página )?2 de/);
    await c.tecla('Escape');
    assert.strictEqual(await c.js('Reino.UI.temTela()'), false, 'Esc fecha');
    assert.deepStrictEqual(c.erros, [], 'sem erro de console');
  } finally { await c.fechar(); }
});

for (const tamanho of ['tablet', 'notebook']) {
  test(`livros sem corte no ${tamanho}`, async () => {
    const c = await abrirCenario({ save: 'completo', tamanho, pasta: '/tmp/reino-testes/ver/teste-quimica-livros-' + tamanho });
    try {
      await c.js('void Reino.UI.telaQuimicaLivros()');
      await c.avancar(600);
      assert.deepStrictEqual(await c.js(semVazar), [], 'estante');
      await c.js("Reino.UI.fecharTodas(); void Reino.UI.telaQuimicaLivros({ livro: 'cientistas', pagina: 2 })");
      await c.avancar(600);
      assert.deepStrictEqual(await c.js(semVazar), [], 'livro');
      assert.deepStrictEqual(c.erros, [], 'sem erro de console');
    } finally { await c.fechar(); }
  });
}
