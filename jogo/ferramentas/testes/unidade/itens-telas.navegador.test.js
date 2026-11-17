// Telas dos itens (docs/contratos/itens.md §6, §7, §13): o botão 🎒 do HUD só com item (ou a espada), o aviso no alto
// (não é tela, some sozinho), a Mochila (20 espaços, pilhas, vestir, tirar, usar fora da arena, dar ao unicórnio,
// jogar fora com a guarda de toque, figura vestida), o Baú de Guardados (objeto na Sala de Estar, mover pilha, Guardar
// tudo, mochila cheia), teclado (Tab, Enter, Esc) e os 3 tamanhos (grade 4 × 5; no celular 5 × 4; nada passa da tela).
// Servidor e banco de TESTE novos (cenario.js), save sintético; modo congelado.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'itens-telas-'));
const tem = (sel) => `!!document.querySelector(${JSON.stringify(sel)})`;
const ganhar = (id) => `(Reino.Itens.ganhar(${JSON.stringify(id)}) || {}).uid`;
const onde = (uid) => `(Reino.Progresso.estado().itens[${JSON.stringify(uid)}] || {}).onde`;
// clique de mouse de verdade (detail > 0): o botão que gasta e ainda está armando não age
const clicar = async (c, sel) => {
  const r = await c.page.locator(sel).first().boundingBox();
  await c.page.mouse.click(r.x + r.width / 2, r.y + r.height / 2);
  await c.avancar(100);
};

test('itens: HUD, aviso, Mochila, Baú de Guardados, teclado e 3 tamanhos', { timeout: 300000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', pasta: pasta() });
  try {
    await c.js('Reino.UI.fecharTodas(); 1');
    // 1) sem espada e sem item: o 🎒 não aparece
    assert.strictEqual(await c.js('Reino.Itens.temMochila()'), false, 'o save sintético não tem espada nem item');
    await c.avancar(600);
    assert.strictEqual(await c.js("document.querySelector('#hud .btn-mochila').hidden"), true, '🎒 escondido');

    // 2) ganhou: aparece com o brilhinho, e o aviso no alto (não é tela) some sozinho
    const espada = await c.js(ganhar('espada-gelo'));
    await c.avancar(600);
    assert.deepStrictEqual(await c.js(`({ ver: !document.querySelector('#hud .btn-mochila').hidden,
      novo: document.querySelector('#hud .btn-mochila').classList.contains('com-novo'),
      aviso: (document.querySelector('.itens-aviso') || {}).textContent, tela: Reino.UI.temTela() })`),
    { ver: true, novo: true, aviso: 'Espada de Gelo!', tela: false });
    await c.avancar(Number(await c.js('Reino.config.itens.avisoMs')) + 200);
    assert.strictEqual(await c.js(tem('.itens-aviso')), false, 'o aviso sumiu');

    // 3) a Mochila: 20 espaços, pilha com número, a figura; abrir apaga o brilhinho
    const pocoes = [];
    for (let i = 0; i < 3; i++) pocoes.push(await c.js(ganhar('pocao-pequena')));
    const maca = await c.js(ganhar('comida-maca'));
    const elmo = await c.js(ganhar('capacete-cavaleira'));
    await c.js("document.querySelector('#hud .btn-mochila').click(); 1");
    await c.avancar(400);
    assert.deepStrictEqual(await c.js(`({ espacos: document.querySelectorAll('.tela-mochila .moch-grade > .itens-espaco').length,
      cheios: document.querySelectorAll('.tela-mochila .moch-grade > .itens-espaco:not(.itens-livre)').length,
      texto: document.querySelector('.tela-mochila .moch-espacos').textContent,
      pilha: document.querySelector('.tela-mochila .itens-espaco[data-id="pocao-pequena"] .itens-qtd').textContent,
      figura: !!document.querySelector('.tela-mochila .moch-figura canvas'),
      novo: document.querySelector('#hud .btn-mochila').classList.contains('com-novo') })`),
    { espacos: 20, cheios: 4, texto: 'Espaços: 4 de 20', pilha: '3', figura: true, novo: false });

    // 4) vestir pelo cartão: sai da grade, vai para o slot e para o desenho
    await c.js("document.querySelector('.tela-mochila .itens-espaco[data-id=\"capacete-cavaleira\"]').click(); 1");
    await c.avancar(300);
    assert.strictEqual(await c.js("document.querySelector('.tela-mochila-item .mitem-agora').textContent"), 'Agora: Vazio');
    await c.js("document.querySelector('.tela-mochila-item [data-acao=\"vestir\"]').click(); 1");
    await c.avancar(300);
    assert.deepStrictEqual(await c.js(`({ onde: ${onde(elmo)}, vestes: Reino.Itens.vestes().cabeca, cartao: ${tem('.tela-mochila-item')},
      slot: document.querySelector('.tela-mochila .moch-slot[data-slot="cabeca"] b').textContent })`),
    { onde: 'vestido', vestes: 'capacete-cavaleira', cartao: false, slot: 'Elmo de Cavaleira' });
    // tirar pelo slot
    await c.js("document.querySelector('.tela-mochila .moch-slot[data-slot=\"cabeca\"]').click(); 1");
    await c.avancar(300);
    await c.js("document.querySelector('.tela-mochila-item [data-acao=\"tirar\"]').click(); 1");
    await c.avancar(300);
    assert.deepStrictEqual(await c.js(`({ onde: ${onde(elmo)}, cabeca: Reino.Itens.vestes().cabeca })`), { onde: 'mochila', cabeca: null });

    // 5) usar a poção fora da arena: não gasta e explica
    await c.js("document.querySelector('.tela-mochila .itens-espaco[data-id=\"pocao-pequena\"]').click(); 1");
    await c.avancar(300);
    await c.js("document.querySelector('.tela-mochila-item [data-acao=\"usar\"]').click(); 1");
    await c.avancar(300);
    assert.deepStrictEqual(await c.js(`({ msg: document.querySelector('.tela-mochila-item .mitem-msg').textContent, n: Reino.Itens.mochila().find((g) => g.id === 'pocao-pequena').qtd })`),
      { msg: 'Use a poção numa arena, quando a vida baixar.', n: 3 });

    // 6) jogar fora 1 da pilha: a guarda de toque (o mouse logo de cara não apaga), depois apaga
    await c.js("document.querySelector('.tela-mochila-item [data-acao=\"jogar\"]').click(); 1");
    await c.avancar(100);
    const rotulos = await c.js("[...document.querySelectorAll('.tela-confirmar button')].map((b) => b.textContent.replace(/Espera um pouquinho…/, '').trim())");
    assert.deepStrictEqual(rotulos.slice().sort(), ['Agora não', 'Jogar fora 1', 'Jogar fora todas'].sort());
    assert.strictEqual(await c.js("[...document.querySelectorAll('.tela-confirmar button')].find((b) => b.textContent.startsWith('Jogar fora 1')).classList.contains('armando')"), true);
    await c.js("[...document.querySelectorAll('.tela-confirmar button')].forEach((b, i) => { if (b.textContent.startsWith('Jogar fora 1')) b.id = 'jogar-um'; }); 1");
    await clicar(c, '#jogar-um');
    assert.strictEqual(await c.js(tem('.tela-confirmar')), true, 'armando: o toque não apaga');
    await c.avancar(1300);
    await clicar(c, '#jogar-um');
    await c.avancar(300);
    assert.deepStrictEqual(await c.js(`({ n: Reino.Itens.mochila().find((g) => g.id === 'pocao-pequena').qtd, fora: [${pocoes.map(onde).join(',')}].filter((o) => o === 'fora').length,
      cartao: ${tem('.tela-mochila-item')} })`), { n: 2, fora: 1, cartao: false });

    // 7) dar ao unicórnio: gasta só se comeu (barriga cheia não gasta)
    await c.js("document.querySelector('.tela-mochila .itens-espaco[data-id=\"comida-maca\"]').click(); 1");
    await c.avancar(300);
    const fomeAntes = await c.js('Reino.Cuidados.niveis(Reino.Progresso.montaria()).fome');
    await c.js("document.querySelector('.tela-mochila-item [data-acao=\"dar\"]').click(); 1");
    await c.avancar(300);
    assert.strictEqual(await c.js(onde(maca)), fomeAntes >= 99.5 ? 'mochila' : 'fora');
    await c.js('Reino.Claude && Reino.Claude.fechar && Reino.Claude.fechar(); Reino.UI.fecharTodas(); 1');
    await c.avancar(300);

    // 8) teclado: Tab chega num espaço, Enter abre o cartão, Esc fecha o cartão e depois a Mochila
    await c.js('void Reino.UI.telaMochila()');
    await c.avancar(300);
    for (let i = 0; i < 12; i++) {
      await c.page.keyboard.press('Tab');
      if (await c.js("document.activeElement && document.activeElement.classList.contains('itens-espaco')")) break;
    }
    assert.strictEqual(await c.js("document.activeElement.classList.contains('itens-espaco')"), true, 'o Tab chega na grade');
    await c.page.keyboard.press('Enter');
    await c.avancar(300);
    assert.strictEqual(await c.js(tem('.tela-mochila-item')), true, 'Enter abre o cartão');
    await c.page.keyboard.press('Escape');
    await c.avancar(300);
    assert.deepStrictEqual(await c.js(`({ cartao: ${tem('.tela-mochila-item')}, mochila: ${tem('.tela-mochila')}, foco: document.activeElement.classList.contains('itens-espaco') })`),
      { cartao: false, mochila: true, foco: true });
    await c.page.keyboard.press('Escape');
    await c.avancar(300);
    assert.strictEqual(await c.js(tem('.tela-mochila')), false, 'Esc fecha a Mochila');

    // 9) o Baú de Guardados: o objeto na Sala de Estar abre a tela pela ação
    await c.ir('casa');
    assert.deepStrictEqual(await c.js(`(() => { const o = Reino.Interiores.def('casa').objetos.find((x) => x.tipo === 'casa-guardados');
      return o && { x: o.x, y: o.y, acao: o.acao.tipo, nome: o.nome }; })()`), { x: 26, y: 3, acao: 'guardados', nome: 'Baú de Guardados' });
    await c.js("void Reino.NPCs.executar({ tipo: 'guardados' }, {})");
    await c.avancar(300);
    const titulos = () => c.js("[...document.querySelectorAll('.tela-guardados .guard-titulo')].map((h) => h.textContent)");
    const n0 = await c.js('Reino.Itens.espacos().usados');   // 4 (ou 3, se a maçã foi comida)
    assert.deepStrictEqual(await titulos(), [`Mochila (${n0} de 20)`, 'Baú (0)']);
    assert.strictEqual(await c.js("document.querySelector('.tela-guardados .guard-bau .guard-vazio').textContent"), 'O baú está vazio.');
    // a pilha inteira vai para o baú e volta
    await c.js("document.querySelector('.tela-guardados .guard-mochila .itens-espaco[data-id=\"pocao-pequena\"]').click(); 1");
    await c.avancar(200);
    assert.deepStrictEqual(await titulos(), [`Mochila (${n0 - 1} de 20)`, 'Baú (2)']);
    await c.js("document.querySelector('.tela-guardados .guard-bau .itens-espaco').click(); 1");
    await c.avancar(200);
    assert.deepStrictEqual(await titulos(), [`Mochila (${n0} de 20)`, 'Baú (0)']);
    // Guardar tudo (o vestido fica)
    await c.js(`Reino.Itens.vestir(${JSON.stringify(espada)}); 1`);
    await c.avancar(100);
    await c.js("document.querySelector('.tela-guardados .guard-tudo').click(); 1");
    await c.avancar(200);
    assert.deepStrictEqual(await c.js(`({ m: Reino.Itens.espacos().usados, espada: ${onde(espada)}, t: [...document.querySelectorAll('.tela-guardados .guard-titulo')].map((h) => h.textContent)[0] })`),
      { m: 0, espada: 'vestido', t: 'Mochila (0 de 20)' });
    // mochila cheia: o que não cabe fica no baú, com o aviso na tela; o drop seguinte vai para o baú
    const ids = await c.js("Reino.ItensCatalogo.equipamentos().map((d) => d.id).filter((id) => id !== 'espada-gelo').slice(0, 20)");
    for (const id of ids) await c.js(ganhar(id));
    assert.deepStrictEqual(await c.js('Reino.Itens.espacos()'), { usados: 20, total: 20 });
    await c.js("document.querySelector('.tela-guardados .guard-bau .itens-espaco').click(); 1");
    await c.avancar(200);
    assert.strictEqual(await c.js("document.querySelector('.tela-guardados .guard-msg').textContent"), 'A mochila está cheia!');
    await c.js('Reino.UI.fecharTodas(); 1');
    await c.avancar(4 * (Number(await c.js('Reino.config.itens.avisoMs')) + 100));   // a fila dos avisos de antes acaba
    assert.strictEqual(await c.js(tem('.itens-aviso')), false);
    const extra = await c.js("Reino.Itens.ganhar('comida-bolo')");
    await c.avancar(100);
    assert.deepStrictEqual({ onde: extra.onde, aviso: await c.js("(document.querySelector('.itens-aviso') || {}).textContent") },
      { onde: 'bau', aviso: 'Mochila cheia! Foi para o baú da casa.' });

    // 10) os 3 tamanhos: grade 5 × 4 no celular, 4 × 5 no tablet e notebook; nada passa da largura da tela
    for (const [w, h, colunas] of [[390, 844, 5], [820, 1180, 4], [1366, 768, 4]]) {
      await c.page.setViewportSize({ width: w, height: h });
      await c.js('Reino.UI.fecharTodas(); void Reino.UI.telaMochila()');
      await c.avancar(400);
      const r = await c.js(`(() => { const g = document.querySelector('.tela-mochila .moch-grade'), p = document.querySelector('.tela-mochila .painel');
        const b = p.getBoundingClientRect(), cols = getComputedStyle(g).gridTemplateColumns.split(' ').length;
        const hud = document.querySelector('#hud .btn-mochila').getBoundingClientRect();
        return { cols, dentro: b.left >= 0 && b.right <= innerWidth, rola: p.querySelector('.painel-conteudo').scrollWidth <= p.querySelector('.painel-conteudo').clientWidth,
          hud: hud.width > 0 && hud.right <= innerWidth }; })()`);
      assert.deepStrictEqual(r, { cols: colunas, dentro: true, rola: true, hud: true }, `tamanho ${w}×${h}`);
    }
    await c.js('Reino.UI.fecharTodas(); 1');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
