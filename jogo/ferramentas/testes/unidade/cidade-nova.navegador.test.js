// Teste de navegador: a Cidade Nova (docs/contratos/cidade-nova.md) — portal no Bosque, cidade com 4 lojas,
// 3 terrenos livres, duas Teleportadoras, a entrada da loja com a pergunta do 4º bimestre (certo entra, errado não)
// e o carrinho comprando 2 móveis de uma vez. Servidor e banco de TESTE (cenario.js); modo congelado.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'cidade-nova-'));

test('cidade-nova: portal, 4 lojas, terrenos, Teleportadoras e a entrada com pergunta', { timeout: 120000 }, async () => {
  const c = await abrirCenario({ tamanho: 'notebook', pasta: pasta() });
  try {
    await c.js(`(() => { Reino.UI.fecharTodas(); Reino.Claude.limpar && Reino.Claude.limpar();
      Reino.Progresso.ganharEstrelas(500); return 1; })()`);
    // o portal do Bosque está no centro-direita, e a entrada da Cidade Nova funciona
    const portal = await c.js(`(() => { const p = Reino.config.lojaCidade.portalBosque;
      return { x: p.x, y: p.y, objeto: !!Reino.Interiores.OBJETOS['bosque-portal-cidade'] }; })()`);
    assert.deepStrictEqual(portal, { x: 43, y: 21, objeto: true });
    await c.js(`void Reino.Cena.irPara('cidade-nova', { x: 25, y: 33 }, { x: 0, y: -1 }); 1`);
    await c.avancar(2200);
    assert.strictEqual(await c.js('__reino.cena()'), 'cidade-nova');
    const resumo = await c.js(`(() => { const d = Reino.Interiores.def('cidade-nova');
      const tipos = {}; d.objetos.forEach((o) => { tipos[o.tipo] = (tipos[o.tipo] || 0) + 1; });
      return { bau: tipos['cidade-loja'], portas: tipos['cidade-porta'], terrenos: tipos['cidade-terreno'],
        teleportadoras: tipos['cidade-teleportadora'], portal: tipos['cidade-portal-bosque'],
        mapaTele: (Mapa.CIDADE.objetos || []).some((o) => o.tipo === 'teleportadora'),
        lojas: Reino.interiores.filter((i) => i.lugar === 'portal:casa' || i.lugar === 'portal:armas' || i.lugar === 'portal:cabecas' || i.lugar === 'portal:armaduras').length }; })()`);
    assert.deepStrictEqual(resumo, { bau: 4, portas: 4, terrenos: 3, teleportadoras: 2, portal: 1, mapaTele: true, lojas: 4 });
    // a porta da Casa & Lar leva ao interior; o tapete de dentro volta para a frente da porta
    const porta = await c.js(`(() => { const a = Reino.Cena.atual().alvoPerto({ x: 7, y: 7 }, { x: 0, y: -1 });
      return a && a.objeto && a.objeto.acao; })()`);
    assert.deepStrictEqual(porta, { tipo: 'entrarLoja', interior: 'loja-casa', chegar: { x: 8, y: 9 } });
    await c.js(`void Reino.Cena.irPara('loja-casa', { x: 8, y: 9 }, { x: 0, y: -1 }); 1`);
    await c.avancar(1800);
    assert.strictEqual(await c.js('__reino.cena()'), 'loja-casa');
    // a pergunta (sintética e certa) libera a loja; 2 móveis comprados de uma vez
    await c.js(`(() => { Reino.Bosque.perguntaDoBimestre = function () { return { materia: { nome: 'Teste', emoji: '📚', cor: '#8e4fd6', livro: [] },
      sala: { nome: 'Teste' }, desafio: { id: 'teste', tipo: 'escolha', opcoes: [{ t: 'Azul' }, { t: 'Verde' }], certa: 0 } }; };
      void Reino.LojaCidade.abrir('casa'); return 1; })()`);
    await c.avancar(600);
    await c.js(`(() => { const b = [].slice.call(document.querySelectorAll('.opcao')).find((x) => x.textContent.indexOf('Azul') >= 0); b.click();
      return 1; })()`);
    await c.js("document.querySelector('.lc-conferir').click(); 1");
    await c.avancar(300);
    await c.js("document.querySelector('.lc-conferir').click(); 1");
    await c.avancar(800);
    assert.strictEqual(await c.js("!!document.querySelector('.tela-loja-cidade')"), true, 'certo: entrou na loja');
    const antes = await c.js('Reino.Progresso.estrelas()');
    await c.js("document.querySelector('.lc-card').click(); document.querySelector('.lc-card').click(); 1");
    assert.match(await c.js("document.querySelector('.lc-total').textContent"), /60/);
    await c.js("document.querySelector('.lc-acao').click(); 1");
    await c.avancar(300);
    await c.js("document.querySelector('.tela-confirmar .btn-principal').click(); 1");
    await c.avancar(800);
    assert.strictEqual(await c.js('Reino.Progresso.estrelas()'), antes - 60);
    assert.strictEqual(await c.js("Reino.CasaMoveis.qtd('vaso-rosas')"), 2);
    // errado não entra
    await c.js('Reino.UI.fecharTodas(); 1');
    await c.avancar(300);
    await c.js(`(() => { Reino.Bosque.perguntaDoBimestre = function () { return { materia: { nome: 'Teste', emoji: '📚', cor: '#8e4fd6', livro: [] },
      sala: { nome: 'Teste' }, desafio: { id: 'teste', tipo: 'escolha', opcoes: [{ t: 'Azul' }, { t: 'Verde' }], certa: 0 } }; };
      void Reino.LojaCidade.abrir('casa'); return 1; })()`);
    await c.avancar(600);
    await c.js(`(() => { const b = [].slice.call(document.querySelectorAll('.opcao')).find((x) => x.textContent.indexOf('Verde') >= 0); b.click();
      return 1; })()`);
    await c.js("document.querySelector('.lc-conferir').click(); 1");
    await c.avancar(300);
    await c.js("document.querySelector('.lc-conferir').click(); 1");
    await c.avancar(800);
    assert.strictEqual(await c.js("!!document.querySelector('.tela-loja-cidade')"), false, 'errado: não entrou');
  } finally { await c.fechar(); }
});
