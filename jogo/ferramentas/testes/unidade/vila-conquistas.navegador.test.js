// As peças épicas da Pluma nas lojas da Vila (docs/contratos/cursiva.md §6), com o dedo de verdade (toque pelo CDP):
// na loja Armaduras e Botas, a faixa "Peças épicas" traz a armadura, a calça e as botas, sem preço e fora do carrinho;
// "Escrever 5 frases" abre a letra cursiva com 5 frases do banco; fechar no meio guarda o ponto, só daquela peça;
// com as 5 prontas, "Pegar a Calça da Pluma" põe a peça na mochila sem gastar estrela, e o cartão passa a dizer
// "Você já tem! ✨". A peça não aparece em Vender. Na Mochila, a calça tem o lugar dela e, vestida, muda o desenho.
// Depois, nos 3 tamanhos: as 3 lojas, a faixa dentro do painel, nada cortado; no notebook, pelo teclado (Tab, Enter, Esc).
// Jogo congelado; servidor e banco de TESTE novos (cenario.js); save sintético. (O ✏ e o ✨ viram ícone: não entram no texto.)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { dedo } = require('../cenario-ponteiro');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'vila-conquistas-'));
const abrirLoja = (l) => `void Reino.modulo("vila-lojas").acoes.vilaLoja({ tipo: "vilaLoja", loja: ${JSON.stringify(l)} }); 1`;
const TEM = (id) => `Reino.Itens.pecas().filter((p) => p.id === ${JSON.stringify(id)}).length`;
const BOTAO = (id) => `.vila-epica[data-id="${id}"] .vila-epica-escrever`;
const texto = (sel) => `(document.querySelector(${JSON.stringify(sel)}) || {}).textContent`;
// o traço da vez em px da página, da ponta até o fim (de 3 em 3 amostras), como em cursiva.navegador.test.js
const PONTOS = `(() => {
  const cv = document.querySelector('.tela-cursiva .cursiva-palco');
  if (!cv || !cv.dataset.ponta) return null;
  if (cv.dataset.ponta === 'fim') return { fim: true };
  const r = cv.getBoundingClientRect(), E = +cv.dataset.e, ox = +cv.dataset.ox, base = +cv.dataset.base, s = r.width / cv.width;
  const p = Reino.Cursiva.frase(cv.dataset.texto).palavras[+cv.dataset.palavra], [i, k] = cv.dataset.ponta.split(':').map(Number);
  const tr = p.tracos[i], pts = [];
  for (let j = k; j < tr.n + 3; j += 3) { const q = Math.min(j, tr.n - 1); pts.push([r.left + (ox + tr.x[q] * E) * s, r.top + (base - tr.y[q] * E) * s]); }
  return { pts };
})()`;
const PONTA = `document.querySelector('.tela-cursiva .cursiva-palco').dataset.ponta`;
const FRASE = `document.querySelector('.tela-cursiva .cursiva-palco').dataset.texto`;
// a faixa na tela: os cartões, o que cada um mostra e se alguma coisa passa do painel ou fica cortada
const FAIXA = `(() => {
  const f = document.querySelector('.tela-vila-loja .vila-epicas');
  if (!f) return null;
  const pn = document.querySelector('.tela-vila-loja .painel-conteudo, .tela-vila-loja .painel').getBoundingClientRect(), fr = f.getBoundingClientRect();
  const fora = [];
  const dentro = (el, nome) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.left < fr.left - 0.5 || r.right > fr.right + 0.5) fora.push(nome); };
  if (fr.left < pn.left - 0.5 || fr.right > pn.right + 0.5) fora.push('faixa');
  const cartoes = Array.from(f.querySelectorAll('.vila-epica')).map((c) => {
    const b = c.querySelector('.vila-epica-escrever'), nome = c.querySelector('.vila-cartao-nome');
    dentro(c, c.dataset.id);
    if (!b.hidden) { dentro(b, c.dataset.id + ' botão'); if (b.scrollWidth > b.clientWidth + 1) fora.push(c.dataset.id + ' botão cortado'); if (b.getBoundingClientRect().height < 44) fora.push(c.dataset.id + ' botão baixo'); }
    if (nome.scrollWidth > nome.clientWidth + 1 || nome.getBoundingClientRect().width < 60) fora.push(c.dataset.id + ' nome apertado');
    return { id: c.dataset.id, nome: nome.textContent.replace(/\\u00a0/g, ' '), rar: c.querySelector('.vila-cartao-rar').textContent,
      botao: b.hidden ? null : b.textContent.trim(), tem: !c.querySelector('.vila-epica-tem').hidden, preco: !!c.querySelector('.vila-cartao-preco'),
      desenho: !!c.querySelector('.vila-cartao-desenho canvas') };
  });
  return { escondida: f.hidden, titulo: f.querySelector('.vila-epicas-titulo').textContent.trim(), dica: f.querySelector('.vila-epicas-dica').textContent,
    cartoes, fora, naGrade: Array.from(document.querySelectorAll('.tela-vila-loja .vila-grade [data-id]')).map((x) => x.dataset.id).filter((id) => /-pluma$/.test(id)) };
})()`;

test('pluma: escrever 5 frases na loja dá a peça épica, sem estrela; a calça veste pela Mochila', { timeout: 600000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', estrelas: 7, pasta: pasta() });
  const d = await dedo(c, 'toque');
  async function tracar(max) {
    const q = await c.js(PONTOS);
    if (!q || q.fim) return q;
    const pts = q.pts.slice(0, max || q.pts.length);
    await d.down(pts[0][0], pts[0][1]);
    for (const [x, y] of pts.slice(1)) await d.move(x, y);
    await d.up();
    await c.avancar(32);
    return q;
  }
  try {
    assert.strictEqual(await c.js(TEM('calca-pluma')), 0);
    await c.js(abrirLoja('armaduras'));
    await c.avancar(600);
    // 1) a faixa: as 3 peças da loja, épicas, sem preço e fora da grade do carrinho
    const f = await c.js(FAIXA);
    assert.strictEqual(f.escondida, false);
    assert.match(f.titulo, /Peças épicas/);
    assert.match(f.dica, /conquiste escrevendo 5 frases em letra cursiva/);
    assert.deepStrictEqual(f.cartoes.map((x) => [x.id, x.nome, x.rar, x.botao, x.tem, x.preco, x.desenho]), [
      ['armadura-pluma', 'Armadura da Pluma', 'Épico', 'Escrever 5 frases', false, false, true],
      ['calca-pluma', 'Calça da Pluma', 'Épico', 'Escrever 5 frases', false, false, true],
      ['botas-pluma', 'Botas da Pluma', 'Épico', 'Escrever 5 frases', false, false, true]]);
    assert.deepStrictEqual(f.naGrade, [], 'não estão à venda');
    assert.deepStrictEqual(f.fora, [], 'tudo cabe no celular');
    // a aba Vender esconde a faixa
    await c.tocar('.vila-aba[data-aba="vender"]');
    await c.avancar(200);
    assert.strictEqual((await c.js(FAIXA)).escondida, true);
    await c.tocar('.vila-aba[data-aba="comprar"]');
    await c.avancar(200);

    // 2) escrever: 5 frases do banco; fechar no meio guarda o ponto, só desta peça
    await c.tocar(BOTAO('calca-pluma'));
    await c.avancar(600);
    assert.strictEqual(await c.js(`!!document.querySelector('.tela-cursiva .cursiva-palco')`), true, 'a tela de escrever abriu');
    assert.match(await c.js(texto('.tela-cursiva .cursiva-conta')), /Frase 1 de 5/);
    const frases = [await c.js(FRASE)];
    assert.ok((await c.js('Reino.Cursiva.frases()')).includes(frases[0]), 'a frase é do banco');
    await tracar(12);
    const meio = await c.js(PONTA);
    assert.notStrictEqual(meio, '0:0', 'seguindo o tracejado, pinta');
    await c.tocar('.tela-cursiva .btn-fechar');
    await c.avancar(600);
    assert.strictEqual(await c.js(TEM('calca-pluma')), 0, 'fechou no meio: sem peça');
    const f2 = await c.js(FAIXA);
    assert.deepStrictEqual(f2.cartoes.map((x) => x.botao), ['Escrever 5 frases', 'Continuar a escrever', 'Escrever 5 frases']);
    await c.tocar(BOTAO('calca-pluma'));
    await c.avancar(600);
    assert.strictEqual(await c.js(PONTA), meio, 'voltou no mesmo ponto');
    assert.strictEqual(await c.js(FRASE), frases[0], 'as mesmas frases');

    // 3) escreve tudo: palavra por palavra, as 5 frases
    let voltas = 0;
    while (voltas++ < 300) {
      if (await c.js(`!document.querySelector('.tela-cursiva .cursiva-pegar').hidden`)) break;
      const q = await tracar();
      if (!q || q.fim) await c.avancar(1200);
      const t = await c.js(FRASE);
      if (!frases.includes(t)) frases.push(t);
    }
    assert.strictEqual(frases.length, 5, 'cinco frases diferentes');
    assert.match(await c.js(texto('.tela-cursiva .cursiva-dica')), /Você escreveu as 5 frases!/);
    assert.strictEqual(await c.js(texto('.tela-cursiva .cursiva-pegar')), 'Pegar a Calça da Pluma');
    assert.strictEqual(await c.js(TEM('calca-pluma')), 0, 'a peça só sai no botão');
    await c.tocar('.tela-cursiva .cursiva-pegar');
    await c.avancar(600);
    assert.strictEqual(await c.js(`!!document.querySelector('.tela-cursiva')`), false, 'a tela de escrever fechou');
    assert.strictEqual(await c.js(TEM('calca-pluma')), 1, '1 Calça da Pluma');
    assert.strictEqual(await c.js('Reino.Progresso.estrelas()'), 7, 'sem gastar estrela');
    assert.match(await c.js(texto('.tela-vila-loja .vila-recado')), /Você conquistou a Calça da Pluma!.*Está na sua mochila\./);
    const f3 = await c.js(FAIXA);
    assert.deepStrictEqual(f3.cartoes.map((x) => [x.botao, x.tem]), [['Escrever 5 frases', false], [null, true], ['Escrever 5 frases', false]], 'Você já tem!');
    assert.deepStrictEqual(f3.fora, []);
    assert.deepStrictEqual(await c.js(`Reino.VilaLojas.conquistar('armaduras', 'calca-pluma')`), { ok: false, motivo: 'ja-tem', id: 'calca-pluma' });
    // não se vende
    await c.tocar('.vila-aba[data-aba="vender"]');
    await c.avancar(200);
    assert.strictEqual(await c.js(`!!document.querySelector('.tela-vila-loja .vila-grade [data-id="calca-pluma"]')`), false, 'fora da venda');
    await c.tocar('.tela-vila-loja .btn-fechar');
    await c.avancar(600);

    // 4) a Mochila: 6 lugares no corpo, a calça no dela; vestida, muda o desenho
    await c.js('Reino.UI.fecharTodas(); void Reino.UI.telaMochila(); 1');
    await c.avancar(400);
    assert.deepStrictEqual(await c.js(`Array.from(document.querySelectorAll('.tela-mochila .moch-slot')).map((b) => b.dataset.slot + '=' + b.querySelector('small').textContent + ':' + b.querySelector('b').textContent)`),
      ['espada=Espada:Vazio', 'escudo=Escudo:Vazio', 'cabeca=Cabeça:Vazio', 'armadura=Armadura:Vazio', 'calca=Calça:Vazio', 'botas=Botas:Vazio']);
    assert.strictEqual(await c.js(`(() => { const p = document.querySelector('.tela-mochila .painel').getBoundingClientRect();
      return Array.from(document.querySelectorAll('.tela-mochila .moch-slot, .tela-mochila .moch-figura')).every((e) => { const r = e.getBoundingClientRect(); return r.left >= p.left && r.right <= p.right + 0.5; }); })()`), true, 'os 6 lugares cabem no celular');
    const antes = await c.js(`document.querySelector('.tela-mochila .moch-figura canvas').toDataURL()`);
    await c.js(`document.querySelector('.tela-mochila .itens-espaco[data-id="calca-pluma"]').click(); 1`);
    await c.avancar(300);
    assert.match(await c.js(texto('.tela-mochila-item .mitem-raridade')), /Épico/);
    await c.js(`document.querySelector('.tela-mochila-item [data-acao="vestir"]').click(); 1`);
    await c.avancar(400);
    assert.strictEqual(await c.js('Reino.Itens.vestes().calca'), 'calca-pluma');
    assert.strictEqual((await c.js(texto('.tela-mochila .moch-slot[data-slot="calca"] b'))).replace(/ /g, ' '), 'Calça da Pluma');
    assert.notStrictEqual(await c.js(`document.querySelector('.tela-mochila .moch-figura canvas').toDataURL()`), antes, 'a figura ganhou a calça');
    assert.deepStrictEqual(await c.js('Reino.Itens.bonus()'), { dano: 0, defesa: 1, vida: 3, velocidade: 0, sorte: 0 });
    assert.deepStrictEqual(c.erros, [], 'sem erro no console');
  } finally {
    await c.fechar();
  }
});

test('pluma: a faixa nas 3 lojas e nos 3 tamanhos; pelo teclado no notebook', { timeout: 300000 }, async () => {
  const LOJAS = { armas: ['espada-pluma', 'escudo-pluma'], cabecas: ['capacete-pluma'], armaduras: ['armadura-pluma', 'calca-pluma', 'botas-pluma'] };
  for (const tamanho of ['celular', 'tablet', 'notebook']) {
    const c = await abrirCenario({ tamanho, estrelas: 0, pasta: pasta() });
    try {
      for (const loja of Object.keys(LOJAS)) {
        await c.js('Reino.UI.fecharTodas(); 1');
        await c.js(abrirLoja(loja));
        await c.avancar(600);
        const f = await c.js(FAIXA);
        assert.deepStrictEqual(f.cartoes.map((x) => x.id), LOJAS[loja], `${tamanho} ${loja}`);
        assert.deepStrictEqual(f.fora, [], `${tamanho} ${loja}: nada passa nem corta`);
        assert.ok(f.cartoes.every((x) => x.botao === 'Escrever 5 frases' && !x.preco && x.desenho), `${tamanho} ${loja}`);
      }
      // a Casa Bonita não tem peça épica
      await c.js('Reino.UI.fecharTodas(); 1');
      await c.js(abrirLoja('casa'));
      await c.avancar(600);
      assert.strictEqual(await c.js(FAIXA), null, `${tamanho}: casa sem faixa`);
      if (tamanho === 'notebook') {
        // teclado: Tab chega no botão da 1ª peça, Enter abre a letra cursiva, Esc volta para a loja
        await c.js('Reino.UI.fecharTodas(); 1');
        await c.js(abrirLoja('cabecas'));
        await c.avancar(600);
        let achou = false;
        for (let i = 0; i < 12 && !achou; i++) {
          await c.page.keyboard.press('Tab');
          achou = await c.js(`!!document.activeElement && document.activeElement.matches('.vila-epica-escrever')`);
        }
        assert.strictEqual(achou, true, 'Tab chega em "Escrever 5 frases"');
        await c.page.keyboard.press('Enter');
        await c.avancar(600);
        assert.strictEqual(await c.js(`!!document.querySelector('.tela-cursiva .cursiva-palco')`), true, 'Enter abre a letra cursiva');
        assert.match(await c.js(texto('.tela-cursiva .cursiva-conta')), /Frase 1 de 5/);
        await c.page.keyboard.press('Escape');
        await c.avancar(600);
        assert.strictEqual(await c.js(`!!document.querySelector('.tela-cursiva')`), false, 'Esc fecha');
        assert.match(await c.js(texto(BOTAO('capacete-pluma'))), /Continuar a escrever/);
        assert.strictEqual(await c.js(TEM('capacete-pluma')), 0);
      }
      assert.deepStrictEqual(c.erros, [], `${tamanho}: sem erro no console`);
    } finally {
      await c.fechar();
    }
  }
});
