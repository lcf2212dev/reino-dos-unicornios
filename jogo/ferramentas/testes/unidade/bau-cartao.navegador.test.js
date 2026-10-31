// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico = sem animações): o baú do
// cartão de experiência (js/ui/bau-cartao.js) e as moedas voando (js/ui/moedas-festa.js); docs/contratos/quimica.md §10.
// 1) Direto: o baú chega, abre pelo toque, mostra a cartinha e, com produto novo, os frascos; "Ok!" fecha e resolve;
//    Esc pula para o fim e fecha; cartão que não existe não abre nada; sem animação a festa das moedas resolve na hora,
//    com o número final no chip e nada pendurado. 2) Pela sala: a 1ª vez de uma sala (desde = hoje) mostra as moedas e
//    "Cartão de experiência novo!"; o botão final abre o baú do cartão 1, e o caderno passa a ter a receita.
// Rodar (da raiz): npm run unidade -- --so bau-cartao
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');
const { preparar, responderDaVez, seguirSala } = require('./ajudantes/quarto-bimestre');

const sp = (x) => String(x).replace(/­/g, '').replace(/\s+/g, ' ').trim();
const texto = (c, sel) => c.js(`(function (e) { return e ? e.textContent : null; })(document.querySelector(${JSON.stringify(sel)}))`).then((t) => t === null ? null : sp(t));
const tela = (c) => c.js("!!document.querySelector('#telas > .tela-cartao-bau.tela-presente')");

test('baú do cartão: chegada, baú aberto, cartinha, produtos novos, Ok e Esc; festa das moedas sem animação', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-bau-cartao' });
  try {
    const r1 = await c.js("(function (r) { return { nome: r.nome, novos: Reino.Cartoes.produtosNovos(1).map(function (g) { return g.nome; }) }; })(Reino.Cartoes.cartao(1))");
    assert.ok(r1.nome, 'o cartão 1 existe');
    await c.js('window.__fim = null; void Reino.UI.abrirCartaoBau(1).then(function () { window.__fim = true; })');
    await c.avancar(300);
    assert.ok(await tela(c), 'o baú aparece');
    assert.strictEqual(await texto(c, '.presente-titulo'), 'Um cartão novo para você!');
    await c.foto('1-chegada');
    await c.tocar('.presente-bau');
    await c.avancar(300);
    assert.match(await texto(c, '.cbau-continuar'), /Ver o cartão/);
    await c.tocar('.cbau-continuar');
    await c.avancar(300);
    const cartinha = await texto(c, '.cbau-cartao');
    assert.ok(cartinha.includes('Cartão 1') && cartinha.includes(sp(r1.nome)), cartinha);
    assert.ok(cartinha.includes('Experimente no Laboratório!'), cartinha);
    await c.foto('2-cartao');
    if (r1.novos.length) {
      assert.match(await texto(c, '.cbau-continuar'), /Ver o produto/);
      await c.tocar('.cbau-continuar');
      await c.avancar(300);
      const prod = await texto(c, '.cbau-produtos');
      assert.ok(/Novos? no laboratório!/.test(prod) && r1.novos.every((n) => prod.includes(sp(n))), prod);
      await c.foto('3-produtos');
    }
    assert.match(await texto(c, '.cbau-continuar'), /Ok!/);
    await c.tocar('.cbau-continuar');
    await c.avancar(300);
    assert.ok(!(await tela(c)), 'Ok! fecha');
    assert.strictEqual(await c.js('window.__fim'), true, 'a promessa resolve');

    // Esc: pula para o fim; no fim, fecha
    await c.js('window.__fim = null; void Reino.UI.abrirCartaoBau(1).then(function () { window.__fim = true; })');
    await c.avancar(300);
    await c.tecla('Escape');
    await c.avancar(200);
    assert.ok(await c.js("!!document.querySelector('.tela-cartao-bau .cbau-cartao')"), 'Esc pulou para o fim');
    await c.tecla('Escape');
    await c.avancar(300);
    assert.ok(!(await tela(c)) && await c.js('window.__fim'), 'o 2º Esc fecha');

    // cartão que não existe: nada
    assert.strictEqual(await c.js('Reino.UI.abrirCartaoBau(9999).then(function () { return !!document.querySelector(".tela-cartao-bau"); })'), false);

    // moedas sem animação: resolve na hora, chip com o saldo, nada pendurado
    const m = await c.js(`Reino.UI.festaMoedas(10).then(function () { return { chip: document.querySelector('#hud .chip-dinheiro').textContent,
      saldo: Reino.util.moedasNumero(Reino.Progresso.saldoMoedas()), sobra: document.querySelectorAll('.moedas-festa, .moeda-voa').length }; })`);
    assert.deepStrictEqual([sp(m.chip), m.sobra], [m.saldo, 0]);
    assert.strictEqual(await c.js('Reino.UI.festaMoedas(0).then(function () { return 1; })'), 1);
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('fim da sala: moedas, "Cartão de experiência novo!" e o baú do cartão 1 depois do botão', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'tablet', pasta: '/tmp/reino-testes/ver/teste-bau-cartao-sala' });
  try {
    await c.page.evaluate(preparar);
    // a sala lp10a2 (Português do 4º bimestre) ainda não feita e os cartões contando de hoje (no save sintético, nada foi feito hoje)
    const info = await c.js(`(function () {
      var e = Reino.Progresso.estado(), d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
      delete e.salas.lp10a2;
      Reino.config.cartoes.desde = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
      var r = Reino.Cartoes.cartao(1);
      return { ganhos: Reino.Cartoes.ganhos(), receita: r.id, noCaderno: Reino.Quimica.noCaderno(r.id) };
    })()`);
    assert.deepStrictEqual([info.ganhos, info.noCaderno], [0, false]);
    await c.js(`(function () { var m = Reino.materia('portugues4'); Reino.Missao.iniciar(m, m.salas.find(function (s) { return s.id === 'lp10a2'; })); })()`);
    await c.avancar(600);
    const fim = await seguirSala(c, async (id) => { const r = await responderDaVez(c, id, 'dom', { errar: false }); assert.deepStrictEqual(r.problemas, [], id); });
    assert.strictEqual(fim.fim, 'fimSala');
    const telaFim = await texto(c, '.tela-missao .fim-sala');
    assert.ok(/\+ \d+ moedas? no Baú do Tesouro!/.test(telaFim), telaFim);
    assert.ok(telaFim.includes('Cartão de experiência novo!'), telaFim);
    assert.strictEqual(await c.js("Reino.Cartoes.daSala('lp10a2')"), 1);
    await c.foto('4-fim-sala');
    await c.tocar('.tela-missao .fim-sala .btn-principal');
    await c.avancar(600);
    assert.ok(await tela(c), 'o baú do cartão abriu depois da sala');
    assert.strictEqual(await c.js("!!document.querySelector('.tela-missao')"), false);
    await c.tecla('Escape');
    await c.avancar(200);
    await c.tecla('Escape');
    await c.avancar(600);
    assert.ok(!(await tela(c)));
    assert.deepStrictEqual(await c.js(`[Reino.Cartoes.ganhos(), Reino.Quimica.noCaderno(${JSON.stringify(info.receita)}),
      Reino.Quimica.receitas().some(function (r) { return r.id === ${JSON.stringify(info.receita)}; })]`), [1, true, true]);
    assert.deepStrictEqual(await c.js('window.__q.erros'), []);
  } finally { await c.fechar(); }
});
