// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico): a tabela periódica do
// Laboratório de Química (Reino.UI.telaQuimicaTabela, docs/contratos/quimica.md §2). Abre, desenha uma casa por dado
// da tabela, toca num cartão, anda para o vizinho e volta; lê uma lição até o fim (descoberta gravada, +1 estrela só
// na 1ª vez); pelo teclado (Tab, setas, Enter, Esc); nada vaza para o lado no celular, no tablet e no notebook.
// Enquanto os dados do laboratório estão incompletos, o teste completa na página as 118 casas, um 2º cartão e uma
// lição de 2 páginas (sem mexer nos arquivos). Zero erro de console.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/quimica-tabela.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

// completa os dados que faltam (só na página): 118 casas nas linhas 1-7 e 9-10, 2 cartões, uma lição de 2 páginas
const COMPLETAR = `(function () {
  var Q = Reino.QUIMICA, fam = Object.keys(Q.familias || {})[0] || 'nao-metal';
  if (!Q.familias || !Q.familias[fam]) Q.familias = { 'nao-metal': { nome: 'Não metais', cor: '#7ee07e' } };
  function pos(z) {
    if (z === 1) return [1, 1]; if (z === 2) return [1, 18];
    if (z <= 4) return [2, z - 2]; if (z <= 10) return [2, z + 8];
    if (z <= 12) return [3, z - 10]; if (z <= 18) return [3, z];
    if (z <= 36) return [4, z - 18]; if (z <= 54) return [5, z - 36];
    if (z <= 56) return [6, z - 54]; if (z <= 71) return [9, z - 54]; if (z <= 86) return [6, z - 68];
    if (z <= 88) return [7, z - 86]; if (z <= 103) return [10, z - 86]; return [7, z - 100];
  }
  if (Q.tabela.length < 118) {
    var tem = {}; Q.tabela.forEach(function (c) { tem[c.z] = 1; });
    for (var z = 1; z <= 118; z++) if (!tem[z]) { var p = pos(z); Q.tabela.push({ z: z, simbolo: 'X' + (z % 10), familia: fam, linha: p[0], coluna: p[1] }); }
  }
  if (Q.elementos.length < 2) Q.elementos.push({ z: 2, simbolo: 'He', nome: 'Hélio', familia: fam, onde: 'Nos balões que flutuam.', curiosidade: ['Ele deixa a voz fininha.'] });
  if (!Q.licoes.some(function (l) { return l.paginas.length > 1; })) Q.licoes.push({ id: 'teste-duas', ordem: 99, titulo: 'Lição de teste', emoji: '⚛', desenho: 'h2o', paginas: ['Primeira página da lição.', 'Segunda página da lição.'] });
  return Q.tabela.length;
})()`;

const estrelas = 'Reino.Progresso.estado().estrelas.ganhas';
// nada vaza para o lado: o conteúdo e o rodapé cabem na largura do painel
const semVazar = `(function () {
  var t = document.querySelector('.tela-quimica-tabela'), r = [];
  t.querySelectorAll('.painel-conteudo, footer.qt-rodape, .qt-abas').forEach(function (x) { if (x.scrollWidth > x.clientWidth + 1) r.push(x.className + ' ' + x.scrollWidth + '>' + x.clientWidth); });
  var p = t.querySelector('.painel').getBoundingClientRect();
  t.querySelectorAll('footer.qt-rodape button').forEach(function (b) { var q = b.getBoundingClientRect(); if (q.left < p.left || q.right > p.right) r.push('botão fora: ' + b.textContent); });
  return r;
})()`;

test('tabela periódica: mapa, cartões, lição até o fim, teclado e Esc', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-quimica-tabela' });
  try {
    assert.strictEqual(await c.js(COMPLETAR), 118);
    await c.js('void Reino.UI.telaQuimicaTabela()');
    await c.avancar(600);
    // o mapa: uma casa por dado da tabela; os cartões: um por elemento
    assert.strictEqual(await c.js("+document.querySelector('.tela-quimica-tabela .qt-mapa').dataset.casas"), await c.js('Reino.Quimica.tabela().length'));
    assert.strictEqual(await c.js("document.querySelectorAll('.qt-cartao').length"), await c.js('Reino.Quimica.elementos().length'));
    assert.deepStrictEqual(await c.js(semVazar), [], 'aba Tabela sem corte');

    // toca no 1º cartão: a ficha no mesmo painel; ▶ vai ao vizinho; Voltar acende a casa dele
    const [e1, e2] = await c.js('Reino.Quimica.elementos().slice(0, 2).map(function (e) { return e.nome; })');
    await c.tocar('.qt-cartao');
    assert.strictEqual(await c.js("document.querySelector('.qt-ficha-nome').textContent"), e1);
    assert.strictEqual(await c.js("document.querySelectorAll('.tela-quimica-tabela').length"), 1, 'não empilha outra tela');
    assert.deepStrictEqual(await c.js(semVazar), [], 'ficha sem corte');
    await c.tocar('[aria-label="Próximo elemento"]');
    assert.strictEqual(await c.js("document.querySelector('.qt-ficha-nome').textContent"), e2);
    await c.tocar('Voltar');
    assert.ok(await c.js("!!document.querySelector('.qt-grade')"), 'voltou para a grade');
    assert.strictEqual(await c.js("document.querySelector('.qt-cartao[aria-current=true]').dataset.z"), String(await c.js('Reino.Quimica.elementos()[1].z')));

    // lições: a de 2+ páginas até o fim grava a descoberta e dá a estrela só na 1ª vez
    await c.tocar('.qt-aba[data-aba=licoes]');
    assert.strictEqual(await c.js("document.querySelectorAll('.qt-licao').length"), await c.js('Reino.Quimica.licoes().length'));
    const id = await c.js('Reino.Quimica.licoes().filter(function (l) { return l.paginas.length > 1; })[0].id');
    const n = await c.js(`Reino.Quimica.licao(${JSON.stringify(id)}).paginas.length`);
    const antes = await c.js(estrelas);
    await c.tocar(`.qt-licao[data-licao="${id}"]`);
    assert.ok(await c.js("!!document.querySelector('.qt-licao-pagina canvas[data-desenho]')"), 'desenho da lição');
    assert.strictEqual(await c.js(`Reino.Quimica.descoberto('licoes', ${JSON.stringify(id)})`), false, 'na 1ª página ainda não');
    for (let i = 1; i < n; i++) await c.tocar('[aria-label="Próxima página"]');
    assert.strictEqual(await c.js(`Reino.Quimica.descoberto('licoes', ${JSON.stringify(id)})`), true, 'chegou ao fim: descoberta');
    assert.strictEqual(await c.js(estrelas), antes + (await c.js('Reino.config.quimica.estrelasLicaoNova')), '+1 estrela');
    assert.strictEqual(await c.js("document.querySelector('.qt-selo').hidden"), false, 'selo da lição lida');
    assert.strictEqual(await c.js("document.querySelector('[aria-label=\"Próxima página\"]').getAttribute('aria-disabled')"), 'true');
    assert.deepStrictEqual(await c.js(semVazar), [], 'lição sem corte');
    await c.tocar('Voltar');
    assert.ok(await c.js(`document.querySelector('.qt-licao[data-licao="${id}"]').classList.contains('lida')`), '✔ na lista');
    // de novo: nada a mais
    await c.tocar(`.qt-licao[data-licao="${id}"]`);
    for (let i = 1; i < n; i++) await c.tocar('[aria-label="Próxima página"]');
    assert.strictEqual(await c.js(estrelas), antes + 1, 'a 2ª leitura não dá estrela');
    assert.strictEqual(await c.js("document.querySelector('.qt-selo').hidden"), true);
    assert.strictEqual(await c.js('JSON.parse(localStorage.getItem(Reino.config.chaveSave)).quimica.licoes[' + JSON.stringify(id) + ']'), 1, 'gravado no aparelho');

    // os seis desenhos saem sem erro
    const desenhos = await c.js("Object.keys(Reino._quimicaTabela.desenhos).filter(function (k) { return !!Reino._quimicaTabela.desenho(k); })");
    assert.deepStrictEqual(desenhos.sort(), ['atomo', 'estados', 'h2o', 'mistura', 'repolho', 'tabela']);

    // teclado: Tab até a aba Lições, ← volta para Tabela, Tab até o 1º cartão, Enter abre, → anda, Esc fecha
    await c.js('Reino.UI.fecharTodas(); void Reino.UI.telaQuimicaTabela()');
    await c.avancar(600);
    for (let i = 0; i < 6 && !(await c.js("document.activeElement.dataset.aba === 'licoes'")); i++) await c.tecla('Tab');
    assert.strictEqual(await c.js('document.activeElement.dataset.aba'), 'licoes', 'Tab chega nas abas');
    await c.tecla('ArrowLeft');
    assert.strictEqual(await c.js("document.querySelector('.qt-aba[aria-selected=true]').dataset.aba"), 'tabela');
    for (let i = 0; i < 3 && !(await c.js("document.activeElement.classList.contains('qt-cartao')")); i++) await c.tecla('Tab');
    assert.ok(await c.js("document.activeElement.classList.contains('qt-cartao')"), 'Tab chega nos cartões');
    assert.strictEqual(await c.js("document.querySelector('.qt-mapa').dataset.aceso"), await c.js('String(Reino.Quimica.elementos()[0].z)'), 'o foco acende a casa');
    await c.tecla('Enter');
    await c.avancar(500);
    assert.strictEqual(await c.js("document.querySelector('.qt-ficha-nome').textContent"), e1);
    await c.tecla('ArrowRight');
    assert.strictEqual(await c.js("document.querySelector('.qt-ficha-nome').textContent"), e2);
    await c.tecla('Escape');
    assert.strictEqual(await c.js('Reino.UI.temTela()'), false, 'Esc fecha');
    assert.deepStrictEqual(c.erros, [], 'sem erro de console');
  } finally { await c.fechar(); }
});

for (const tamanho of ['tablet', 'notebook']) {
  test(`tabela periódica sem corte no ${tamanho}`, async () => {
    const c = await abrirCenario({ save: 'completo', tamanho, pasta: '/tmp/reino-testes/ver/teste-quimica-tabela-' + tamanho });
    try {
      await c.js(COMPLETAR);
      await c.js('void Reino.UI.telaQuimicaTabela()');
      await c.avancar(600);
      assert.deepStrictEqual(await c.js(semVazar), [], 'aba Tabela');
      assert.ok(await c.js("+getComputedStyle(document.querySelector('.qt-cartao')).height.replace('px', '') >= 44"), 'alvo de toque');
      await c.tocar('.qt-cartao');
      assert.deepStrictEqual(await c.js(semVazar), [], 'ficha');
      const id = await c.js('Reino.Quimica.licoes()[0].id');
      await c.js(`Reino.UI.fecharTodas(); void Reino.UI.telaQuimicaTabela({ licao: ${JSON.stringify(id)} })`);
      await c.avancar(600);
      assert.deepStrictEqual(await c.js(semVazar), [], 'lição');
      assert.deepStrictEqual(c.erros, [], 'sem erro de console');
    } finally { await c.fechar(); }
  });
}
