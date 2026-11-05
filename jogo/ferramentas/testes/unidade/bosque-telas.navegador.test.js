// Bosque dos Fantasmas, telas e HUD (docs/contratos/bosque.md §5 e §7; js/ui/bosque-*.js): chip e botão da espada só
// dentro do Bosque; o prêmio da espada na 1ª entrada e não na 2ª; a pergunta do fantasma (certo: +1 estrela e +1 XP;
// errado ou fechada: nada, e o fantasma volta; o texto-base do livro acima da pergunta); segurar a espada repete o
// golpe; a dica sem o Espaço no toque; o 10º acerto abre o ponto e depois o móvel (com casa) ou a fala do
// móvel guardado (sem casa); Esc e Tab/Enter no ponto; a vida zero não perde nada. Todo tipo de pergunta da sala
// (um caso por tipo: certo dá +1 estrela, errado não dá nada) e a digitação de verdade pelo teclado. Servidor e banco de TESTE novos
// (cenario.js), modo congelado (o prêmio só abre com Reino.congelado desligado de propósito, na entrada).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'bosque-telas-'));

// o estado do HUD e do Bosque, de uma vez
const OLHAR = `(() => {
  const chip = document.querySelector('#hud .chip-bosque'), acao = document.querySelector('#hud .bosque-acao');
  const P = Reino.Progresso, B = Reino.Bosque;
  return { cena: Reino.Cena.atual().id, chip: !!chip && !chip.hidden, acao: !!acao && !acao.hidden,
    chipTexto: chip ? chip.textContent : '', estrelas: P.estrelas(), acertos: B.acertos(), nivel: B.nivel(),
    xp: B.xp().n, vencidos: P.estado().bosque.vencidos, pontos: B.pontos(), pendentes: B.pontosPendentes(),
    telas: [...document.querySelectorAll('#telas > .tela')].map((t) => t.className.split(' ').find((k) => k.startsWith('tela-') && k !== 'tela-presente')) };
})()`;

// um fantasma vencido (f1) e a pergunta de escolha; pontuar devolve window.__ok (o teste escolhe certo ou errado)
const PREPARAR = `(() => {
  const B = Reino.Bosque, D = Reino.Desafios;
  if (!window.__pontuar) window.__pontuar = D.pontuar;
  D.pontuar = function () { return window.__ok ? 1 : 0; };
  B.pergunta = function () { return B.perguntas().find((q) => q.desafio.tipo === 'escolha'); };
  return !!B.pergunta();
})()`;
const VENCER = `(() => {
  const est = Reino._bosqueCombate.estado, f = est.fantasmas[0];
  f.estado = 'vencido';
  Reino.util.emit(Reino.EVENTOS.BOSQUE, { tipo: 'vencido', id: f.id, fantasma: f.tipo });
  return f.id;
})()`;

test('bosque: HUD, prêmio, pergunta, nível, móvel e desmaio', { timeout: 300000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', pasta: pasta() });
  const olhar = () => c.js(OLHAR);
  // responde a pergunta aberta (certo = ok) e devolve o estado logo depois do Conferir
  async function responder(ok) {
    await c.js(`window.__ok = ${ok}; 1`);
    await c.js(VENCER);
    await c.avancar(300);
    assert.ok((await olhar()).telas.includes('tela-bosque-pergunta'), 'a pergunta abre no fantasma vencido');
    await c.js("document.querySelector('.tela-bosque-pergunta .opcao').click(); 1");
    await c.avancar(100);
    await c.js("document.querySelector('.tela-bosque-pergunta .bosque-botao').click(); 1");
    await c.avancar(100);
    return c.js(`({ texto: document.querySelector('.tela-bosque-pergunta .bosque-retorno').textContent, ...${OLHAR} })`);
  }
  async function continuar() {
    await c.avancar(700);   // o botão nasce travado 600 ms
    await c.js("document.querySelector('.tela-bosque-pergunta .bosque-botao').click(); 1");
    await c.avancar(300);
  }
  try {
    await c.js(`(() => { const e = Reino.Progresso.estado(); e.bosque = { acertos: 0, espada: 0, vencidos: 0 }; e.bosquePontos = {};
      Reino.UI.fecharTodas(); return 1; })()`);
    await c.avancar(600);

    // 1) no mapa: chip e botão escondidos
    let o = await olhar();
    assert.deepStrictEqual([o.cena, o.chip, o.acao], ['mapa', false, false], 'fora do Bosque nada aparece');

    // 2) 1ª entrada: o prêmio da espada abre ao fim da íris (fora do modo congelado) e dá a espada
    await c.js('Reino.congelado = false; 1');
    await c.ir('bosque');
    await c.js('Reino.congelado = true; Reino._bosqueCombate.estado.parados = true; 1');
    o = await olhar();
    assert.strictEqual(o.cena, 'bosque');
    assert.ok(o.telas.includes('tela-espada-bosque'), 'o prêmio abre na 1ª entrada: ' + o.telas);
    assert.strictEqual(await c.js('Reino.Bosque.temEspada()'), true);
    await c.avancar(700);
    await c.js("document.querySelector('.tela-espada-bosque .presente-continuar').click(); 1");
    await c.avancar(600);
    o = await olhar();
    assert.deepStrictEqual([o.telas.length, o.chip, o.acao], [0, true, true], 'no Bosque: chip e espada à vista');
    assert.match(o.chipTexto, /10\/10/);
    assert.match(o.chipTexto, /Nv\s1/);
    assert.strictEqual(await c.js("!document.querySelector('#hud .bosque-dica').hidden"), true, 'a dica até o 1º golpe');

    // 3) 2ª entrada: sem prêmio
    await c.ir('mapa');
    o = await olhar();
    assert.deepStrictEqual([o.cena, o.chip, o.acao], ['mapa', false, false]);
    await c.js('Reino.congelado = false; 1');
    await c.ir('bosque');
    await c.js('Reino.congelado = true; Reino._bosqueCombate.estado.parados = true; 1');
    await c.avancar(300);
    o = await olhar();
    assert.deepStrictEqual([o.cena, o.telas.length, o.chip, o.acao], ['bosque', 0, true, true], 'sem prêmio na 2ª entrada');

    // 3b) a dica: no toque, sem o Espaço; no teclado, a frase inteira
    assert.deepStrictEqual(await c.js(`({ texto: document.querySelector('#hud .bosque-dica').textContent,
      esperado: Reino.ambiente.toque() ? 'Toque na espada para atacar.' : 'Toque na espada, ou aperte Espaço, para atacar.' })`).then((r) => r.texto === r.esperado), true);

    // 3c) segurar a espada repete o golpe a cada recargaMs; solta (pointerup) ou sai do Bosque: para
    const SEGURAR = `(() => {
      window.__golpes = 0; window.__atacar = Reino.BosqueCombate.atacar;
      Reino.BosqueCombate.atacar = function () { __golpes++; return true; };
      document.querySelector('#hud .btn-bosque-espada').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 7, button: 0, pointerType: 'touch' }));
      return __golpes;
    })()`;
    const recarga = await c.js('Reino.config.fantasmas.jogador.recargaMs');
    assert.strictEqual(await c.js(SEGURAR), 1, 'o dedo encostou: um golpe na hora');
    await c.avancar(recarga * 3 + 20);
    assert.strictEqual(await c.js('__golpes'), 4, 'segurando: um golpe a cada recargaMs');
    await c.js("document.querySelector('#hud .btn-bosque-espada').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7 })); 1");
    await c.avancar(recarga * 3);
    assert.strictEqual(await c.js('__golpes'), 4, 'soltou: para');
    await c.js(SEGURAR);
    await c.avancar(recarga + 20);
    await c.ir('mapa');
    const fora = await c.js('__golpes');
    await c.avancar(recarga * 3);
    assert.strictEqual(await c.js('__golpes'), fora, 'fora do Bosque: para');
    await c.js('Reino.BosqueCombate.atacar = __atacar; 1');
    await c.ir('bosque');
    await c.js('Reino._bosqueCombate.estado.parados = true; 1');

    // 3d) contexto: a pergunta que depende do texto do livro ("a) Alice tem dinheiro…?") mostra a página dele
    await c.js(`(() => { window.__perg = Reino.Bosque.pergunta;
      Reino.Bosque.pergunta = () => Reino.Bosque.perguntas().find((q) => /Alice tem dinheiro/.test(q.desafio.pergunta || '')); return 1; })()`);
    await c.js("window.__ctx = null; Reino.UI.perguntaFantasma({ id: 'f2' }).then((v) => { __ctx = v; }); 1");
    await c.avancar(300);
    const ctx = await c.js(`(() => { const d = document.querySelector('.tela-bosque-pergunta .bosque-contexto');
      return { aberto: !!d && d.open, texto: d ? d.textContent : '', ordem: !!d && !!(d.compareDocumentPosition(document.querySelector('.tela-bosque-pergunta .desafio')) & 4) }; })()`);
    assert.strictEqual(ctx.aberto, true, 'a página do livro aparece aberta');
    assert.match(ctx.texto, /Alice tem R\$ 30,00/, 'com o texto-base da pergunta');
    assert.strictEqual(ctx.ordem, true, 'acima da pergunta');
    await c.page.keyboard.press('Escape');
    await c.avancar(300);
    assert.strictEqual(await c.js('__ctx'), 'depois');
    await c.js('Reino.Bosque.pergunta = __perg; 1');

    // 4) certo: +1 estrela, +1 XP, o fantasma volta
    assert.strictEqual(await c.js(PREPARAR), true);
    const antes = await olhar();
    o = await responder(true);
    assert.deepStrictEqual([o.estrelas, o.acertos, o.xp], [antes.estrelas + 1, antes.acertos + 1, antes.xp + 1], 'certo dá estrela e XP');
    assert.match(o.texto, /\+1/);
    await continuar();
    o = await olhar();
    assert.strictEqual(o.telas.length, 0);
    assert.strictEqual(await c.js("Reino._bosqueCombate.estado.fantasmas[0].estado"), 'esperando', 'o fantasma volta depois');

    // 5) errado: nada se ganha, a resposta certa aparece
    const antes2 = await olhar();
    o = await responder(false);
    assert.deepStrictEqual([o.estrelas, o.acertos, o.vencidos], [antes2.estrelas, antes2.acertos, antes2.vencidos + 1], 'errado não dá nada');
    assert.match(o.texto, /Quase/);
    await continuar();

    // 6) fechada pelo Esc antes de responder: conta como erro, nada se perde
    await c.js(VENCER);
    await c.avancar(300);
    await c.page.keyboard.press('Escape');
    await c.avancar(300);
    o = await olhar();
    assert.deepStrictEqual([o.telas.length, o.estrelas, o.acertos, o.vencidos], [0, antes2.estrelas, antes2.acertos, antes2.vencidos + 2]);
    assert.strictEqual(await c.js("Reino._bosqueCombate.estado.fantasmas[0].estado"), 'esperando');

    // 7) o 10º acerto: o ponto (Força) e depois o móvel do nível (ela tem casa)
    await c.js('Reino.Progresso.estado().bosque.acertos = 9; 1');
    o = await responder(true);
    assert.deepStrictEqual([o.acertos, o.nivel, o.pendentes], [10, 2, [2]]);
    assert.strictEqual(await c.js('Reino.Casa.ganhou() && Reino.CasaMoveis.pendentes().includes("bosque:2")'), true);
    await continuar();
    assert.ok((await olhar()).telas.includes('tela-bosque-nivel'), 'subiu: a tela do ponto');
    await c.avancar(700);
    await c.js("document.querySelector('.tela-bosque-nivel [data-hab=forca]').click(); 1");
    await c.avancar(4000);
    o = await olhar();
    assert.deepStrictEqual([o.pontos.forca, o.pendentes], [1, []]);
    assert.ok(o.telas.includes('tela-movel-casa'), 'depois do ponto, o móvel: ' + o.telas);
    await c.js("document.querySelector('.tela-movel-casa .ckit-depois').click(); 1");
    await c.avancar(400);

    // 8) sem casa: o ponto e a fala do móvel guardado (nenhuma tela de móvel)
    await c.js(`(() => { window.__ganhou = Reino.Casa.ganhou; Reino.Casa.ganhou = () => false;
      window.__falas = []; const f = Reino.Claude.falar; window.__falar = f;
      Reino.Claude.falar = function (t, op) { __falas.push(t); return f.apply(this, arguments); };
      Reino.Progresso.estado().bosque.acertos = 19; return 1; })()`);
    o = await responder(true);
    assert.deepStrictEqual([o.nivel, o.pendentes], [3, [3]]);
    await continuar();
    await c.avancar(700);
    await c.js("document.querySelector('.tela-bosque-nivel [data-hab=vida]').click(); 1");
    await c.avancar(4000);
    o = await olhar();
    assert.deepStrictEqual([o.pontos.vida, o.telas.includes('tela-movel-casa')], [1, false]);
    const semCasa = await c.js('Reino.BosqueFalas.semCasa.join(" ")');
    assert.ok((await c.js('__falas')).includes(semCasa), 'sem casa: o Claude diz que o móvel fica guardado');
    await c.js('Reino.Casa.ganhou = __ganhou; Reino.Claude.falar = __falar; Reino.Claude.fechar && Reino.Claude.fechar(); 1');
    await c.avancar(300);

    // 9) teclado: o painel pelo chip; Esc no ponto deixa pendente; Tab + Enter põe o ponto
    await c.js('Reino.Progresso.estado().bosque.acertos = 30; Reino.UI.atualizarHUD(); 1');
    await c.js("document.querySelector('#hud .chip-bosque').click(); 1");
    await c.avancar(300);
    assert.ok((await olhar()).telas.includes('tela-bosque'));
    assert.strictEqual(await c.js("!!document.querySelector('.tela-bosque .bosque-por')"), true, 'o botão de pôr o ponto pendente');
    await c.js("document.querySelector('.tela-bosque .bosque-por').click(); 1");
    await c.avancar(300);
    assert.ok((await olhar()).telas.includes('tela-bosque-nivel'));
    await c.page.keyboard.press('Escape');
    await c.avancar(300);
    o = await olhar();
    assert.deepStrictEqual([o.telas.length, o.pendentes], [0, [4]], 'Esc = Depois: o ponto fica pendente');
    await c.js('void Reino.UI.subirNivelBosque(4)');
    await c.avancar(700);
    let hab = null;
    for (let i = 0; i < 6 && !hab; i++) {
      await c.page.keyboard.press('Tab');
      await c.avancar(50);
      hab = await c.js('document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.hab || null : null');
    }
    assert.ok(hab, 'o Tab chega aos cartões');
    await c.page.keyboard.press('Enter');
    await c.avancar(4000);
    o = await olhar();
    assert.deepStrictEqual(o.pendentes, [], 'Enter no cartão põe o ponto');
    await c.js('Reino.UI.fecharTodas(); 1');
    await c.avancar(300);

    // 10) a vida zero: desmaia, volta ao começo do bosque com a vida cheia e nada se perde
    const antes3 = await olhar();
    await c.js(`(() => {
      const est = Reino._bosqueCombate.estado, J = window.Jogador, f = est.fantasmas.find((x) => x.estado === 'vagando');
      est.vida = 1; est.invencivelAte = 0; est.regenEm = 1e12; f.x = J.x; f.y = J.y;   // sem a vida voltar antes do toque
      Reino.BosqueCombate.passo(est, 16, { x: J.x, y: J.y, olharX: 0, olharY: 1, vidaMax: est.max, dano: 1 });
      Reino.BosqueCombate.atacar();   // emite os eventos do passo (o desmaio)
      return est.desmaiado;
    })()`);
    await c.avancar(Number(await c.js('Reino.config.fantasmas.desmaioMs')) + 3000);
    o = await olhar();
    const vida = await c.js('Reino.BosqueCombate.vida()');
    assert.strictEqual(o.cena, 'bosque');
    assert.strictEqual(vida.n, vida.max, 'a vida enche de novo');
    assert.deepStrictEqual([o.estrelas, o.acertos, o.pontos], [antes3.estrelas, antes3.acertos, antes3.pontos], 'nada se perde');
    assert.strictEqual(await c.js('Reino.Cena.ocupada()'), null);
    await c.js('Reino.Desafios.pontuar = __pontuar; 1');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

// abre a pergunta do fantasma com o desafio de id `id`; certo: a resposta certa do tipo (def.exemplos.certa) posta no
// controle (opts.valorInicial: a tela real do tipo, preenchida); errado: o controle devolve null (pontuar 0) e está pronto
const PERGUNTA_TIPO = (id, certo) => `(() => {
  const B = Reino.Bosque, D = Reino.Desafios, q = B.perguntas().find((x) => x.desafio.id === ${JSON.stringify(id)});
  if (!window.__render) window.__render = D.render;
  D.render = function (d, opts) {
    const def = Reino.tiposDesafio[d.tipo];
    const v = def.exemplos.certa(d);
    if (d.tipo === 'desenho') v.px = '1'.padEnd(24 * 24, '0');   // a prancheta inteira (o exemplo tem só 1 quadradinho)
    const ctrl = __render(d, ${certo} ? Object.assign({}, opts, { valorInicial: v }) : opts);
    // errado: null (pontuar 0); tipo que não lê valorInicial (separar): a certa vem pelo valor()
    if (!${certo}) { ctrl.valor = () => null; ctrl.pronto = () => true; } else if (!ctrl.pronto()) { ctrl.valor = () => v; ctrl.pronto = () => true; }
    return ctrl;
  };
  B.pergunta = () => q;
  window.__fim = null;
  Reino.UI.perguntaFantasma({ id: 'fx' }).then((v) => { __fim = v; });
  return q.desafio.tipo;
})()`;

test('bosque: a pergunta de todo tipo da sala (certo: +1 estrela; errado: nada e a certa por escrito) e o teclado', { timeout: 300000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', pasta: pasta() });
  try {
    await c.js('Reino.UI.fecharTodas(); Reino.Progresso.estado().bosque = { acertos: 0, espada: 1, vencidos: 0 }; 1');
    await c.avancar(300);
    // um desafio de cada tipo que entra no sorteio (o 1º de cada); a lista tem de ter os tipos da sala, menos os de fora
    const casos = await c.js(`(() => { const vistos = {};
      Reino.Bosque.perguntas().forEach((q) => { if (!vistos[q.desafio.tipo]) vistos[q.desafio.tipo] = q.desafio.id; });
      return vistos; })()`);
    const fora = await c.js('Reino.config.fantasmas.perguntaForaTipos');
    ['digitar', 'ligar', 'completar', 'tabela', 'marcar', 'escrever', 'separar', 'vfLista', 'escolha', 'varias']
      .forEach((t) => assert.ok(casos[t], 'o tipo ' + t + ' entra no sorteio'));
    fora.forEach((t) => assert.ok(!casos[t], t + ' fica de fora'));
    const estado = () => c.js(`({ estrelas: Reino.Progresso.estrelas(), acertos: Reino.Bosque.acertos(),
      vencidos: Reino.Progresso.estado().bosque.vencidos, fim: window.__fim,
      texto: (document.querySelector('.tela-bosque-pergunta .bosque-retorno') || {}).textContent || '',
      editaveis: [...document.querySelectorAll('.tela-bosque-pergunta .desafio input, .tela-bosque-pergunta .desafio textarea')].filter((x) => !x.readOnly).length })`);
    for (const [tipo, id] of Object.entries(casos)) {
      for (const certo of [true, false]) {
        // sem subir de nível no meio (a tela do ponto): o acerto nunca é o 10º (só para cima: a mescla guarda o maior)
        await c.js('(() => { const b = Reino.Progresso.estado().bosque; if (b.acertos % 10 === 9) b.acertos++; return 1; })()');
        const antes = await estado();
        assert.strictEqual(await c.js(PERGUNTA_TIPO(id, certo)), tipo);
        await c.avancar(300);
        assert.strictEqual(await c.js("!document.querySelector('.tela-bosque-pergunta .bosque-botao').disabled"), true, tipo + ': pronta, o Conferir liga');
        await c.js("document.querySelector('.tela-bosque-pergunta .bosque-botao').click(); 1");
        await c.avancar(100);
        const o = await estado();
        const ganho = [o.estrelas - antes.estrelas, o.acertos - antes.acertos, o.vencidos - antes.vencidos];
        assert.deepStrictEqual(ganho, certo ? [1, 1, 1] : [0, 0, 1], tipo + (certo ? ': certo dá 1 estrela' : ': errado não dá nada'));
        assert.match(o.texto, certo ? /\+1/ : /Quase[\s\S]*Certo:/, tipo);
        assert.strictEqual(o.editaveis, 0, tipo + ': respondida, as caixas ficam só de leitura');
        await c.avancar(700);
        await c.js("document.querySelector('.tela-bosque-pergunta .bosque-botao').click(); 1");
        await c.avancar(300);
        assert.strictEqual((await estado()).fim, certo ? 'certo' : 'errado', tipo);
        await c.js('Reino.UI.fecharTodas(); 1');
      }
    }
    await c.js('Reino.Desafios.render = __render; 1');

    // digitar de verdade: o foco pelo teclado vai para a 1ª caixa; digita as certas (Enter passa de caixa) e Conferir
    const id = casos.digitar;
    await c.page.keyboard.press('Tab');   // a última coisa usada é o teclado
    await c.js(`(() => { const B = Reino.Bosque, q = B.perguntas().find((x) => x.desafio.id === '${id}'); B.pergunta = () => q;
      window.__fim = null; Reino.UI.perguntaFantasma({ id: 'fx' }).then((v) => { __fim = v; }); return 1; })()`);
    await c.avancar(300);
    assert.strictEqual(await c.js("document.activeElement && document.activeElement.matches('.tela-bosque-pergunta .digitar input')"), true, 'o foco na 1ª caixa');
    const certas = await c.js(`Reino.Bosque.perguntas().find((x) => x.desafio.id === '${id}').desafio.frases.map((f) => f.certas[0])`);
    const antes = await estado();
    for (const [i, t] of certas.entries()) {
      await c.page.keyboard.type(t);
      if (i < certas.length - 1) await c.page.keyboard.press('Enter');
    }
    await c.avancar(100);
    await c.js("document.querySelector('.tela-bosque-pergunta .bosque-botao').click(); 1");
    await c.avancar(100);
    const o = await estado();
    assert.deepStrictEqual([o.estrelas - antes.estrelas, o.acertos - antes.acertos], [1, 1], 'digitado certo: +1 estrela');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
