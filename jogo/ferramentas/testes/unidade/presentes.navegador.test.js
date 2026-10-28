// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico): o baú dos presentes
// (js/ui/bau-presente.js; pedido 2026-10-28-presente-medalhas). Como a Mariana (o save sintético é o dela): o baú
// aparece, avança pelo toque e pelo teclado (baú → tampa aberta e presente gravado → prata → ouro → final), "Usar a de
// ouro" veste no pescoço e a Loja mostra a seção Ultra Lendários (tocar a de prata troca a do mesmo encaixe). Segunda
// vez: nada pendente, nenhuma tela. Outro jogador (Jogadores.ehMariana falso; a regra pura está em presentes.test.js):
// nada pendente. Congelado = prefers-reduced-motion: os passos aparecem parados.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/presentes.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const ID = 'medalhas-2026', PRATA = 'ultra-medalha-prata-2bim', OURO = 'ultra-medalha-ouro-3bim';

test('baú dos presentes: abre uma vez só para a Mariana, entrega as duas medalhas e a de ouro se usa', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-presentes' });
  try {
    await c.js('Reino.Progresso.estado().presentes = {}');   // o save sintético vem com o baú já aberto (saves.js)
    assert.deepStrictEqual(await c.js('Reino.Progresso.estado().presentes'), {});
    assert.deepStrictEqual(await c.js('Reino.Progresso.presentesPendentes().map(function (d) { return d.id; })'), [ID]);
    await c.js('window.__fim = null; void Reino.UI.abrirPresentesPendentes().then(function (r) { window.__fim = r; })');
    await c.avancar(600);
    assert.ok(await c.js("!!document.querySelector('.tela-presente .presente-bau')"), 'o baú aparece');
    assert.ok((await c.js("document.querySelector('.presente-titulo').textContent")).includes('Um presente especial para você, Mariana!'));
    assert.strictEqual(await c.js('Reino.Progresso.estado().presentes[' + JSON.stringify(ID) + ']'), undefined, 'ainda fechado');
    await c.foto('1-chegada');

    // toque no baú: a tampa abre e o presente fica gravado (no aparelho)
    await c.tocar('.presente-bau');
    const gravado = await c.js(`(function () { var e = Reino.Progresso.estado(), s = JSON.parse(localStorage.getItem(Reino.Progresso.chaveSave()));
      return [typeof e.presentes['${ID}'], !!s.presentes['${ID}'], !!s.loja['${PRATA}'], !!s.loja['${OURO}']]; })()`);
    assert.deepStrictEqual(gravado, ['number', true, true, true]);
    assert.ok(!(await c.js("document.querySelector('.presente-continuar').hidden")));
    await c.foto('2-aberto');

    // teclado: Enter no botão mostra a prata; Enter com o foco na tela mostra o ouro; depois o final
    await c.js("document.querySelector('.presente-continuar').focus()");
    await c.tecla('Enter');
    let txt = await c.js("document.querySelector('.presente-cartao').textContent.replace(/\\u00ad/g, '')");
    assert.ok(txt.includes('ULTRA LENDÁRIO') && txt.includes('Medalha de Prata do 2º Bimestre'), txt);
    await c.foto('3-prata');
    await c.js("document.querySelector('.tela-presente').focus()");
    await c.tecla('Enter');
    txt = await c.js("document.querySelector('.presente-cartao').textContent.replace(/\\u00ad/g, '')");
    assert.ok(txt.includes('Medalha de Ouro do 3º Bimestre'), txt);
    assert.ok(await c.js("document.querySelector('.presente-cartao').classList.contains('maior')"), 'a de ouro maior');
    await c.foto('4-ouro');
    await c.tocar('.presente-continuar');
    const fim = await c.js("[].map.call(document.querySelectorAll('.presente-escolhas button'), function (b) { return b.textContent; })");
    assert.deepStrictEqual(fim, ['Usar a de ouro', 'Usar a de prata', 'Guardar para depois']);
    assert.ok((await c.js("document.querySelector('.presente-final').textContent")).includes('Você mereceu cada uma!'));
    await c.foto('5-final');

    // usar a de ouro: vai para o pescoço, a tela fecha e a promessa resolve
    await c.tocar('[data-usar="' + OURO + '"]');
    assert.strictEqual(await c.js("!!document.querySelector('.tela-presente')"), false);
    assert.deepStrictEqual(await c.js('window.__fim'), [ID]);
    assert.ok(await c.js("Reino.Progresso.estado().usando.enfeites.indexOf('" + OURO + "') >= 0"));
    await c.js('Jogador.virar(1, 0)');
    await c.foto('6-vestida');

    // Loja: a seção Ultra Lendários com as duas; tocar a de prata troca (mesmo encaixe)
    await c.js('void Reino.UI.telaLoja()');
    await c.avancar(600);
    assert.strictEqual(await c.js("document.querySelectorAll('.item-premio.rar-ultra').length"), 2);
    assert.ok((await c.js("document.querySelector('.tela-lugar, .tela').textContent")).includes('Ultra Lendários'));
    await c.js("document.querySelector('[data-item=\"" + PRATA + "\"]').scrollIntoView({ block: 'center' })");
    await c.foto('7-loja');
    await c.tocar('[data-item="' + PRATA + '"]');
    const us = await c.js('Reino.Progresso.estado().usando.enfeites');
    assert.ok(us.indexOf(PRATA) >= 0 && us.indexOf(OURO) < 0, JSON.stringify(us));
    await c.js('Reino.UI.fecharTodas()');

    // segunda vez: nada pendente, nenhuma tela
    await c.js('window.__fim = null; void Reino.UI.abrirPresentesPendentes().then(function (r) { window.__fim = r; })');
    await c.avancar(300);
    assert.deepStrictEqual(await c.js('window.__fim'), []);
    assert.strictEqual(await c.js("!!document.querySelector('.tela-presente')"), false);

    // outro jogador: nem com o presente fechado aparece
    await c.js('(function () { Reino.Progresso.estado().presentes = {}; window.__eh = Reino.Jogadores.ehMariana; Reino.Jogadores.ehMariana = function () { return false; }; })()');
    await c.js('window.__fim = null; void Reino.UI.abrirPresentesPendentes().then(function (r) { window.__fim = r; })');
    await c.avancar(300);
    assert.deepStrictEqual(await c.js('window.__fim'), []);
    assert.strictEqual(await c.js("!!document.querySelector('.tela-presente')"), false);
    await c.js('Reino.Jogadores.ehMariana = window.__eh');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
