// Bosque dos Fantasmas, telas e HUD (docs/contratos/bosque.md §5 e §7; js/ui/bosque-*.js): chip e botão da espada só
// dentro do Bosque; o prêmio da espada na 1ª entrada e não na 2ª; a pergunta a cada terço da barra de XP (o fácil dá
// 10 de XP: um terço do nível 1 = 10 fáceis; o chip com a barra e as 2 marquinhas) (certo:
// +1 estrela e o baú do móvel; errado ou fechada: consome a pergunta, sem baú; o texto-base do livro acima da
// pergunta); segurar a espada repete o golpe; a dica sem o Espaço no toque; o 30º morto abre o nível (ponto + baú do
// móvel); sem casa o móvel fica guardado e o baú avisa; Esc e Tab/Enter no ponto e o Esc no baú (antes de abrir abre,
// depois fecha); a vida zero não perde nada. Todo tipo de pergunta da sala (um caso por tipo: certo dá +1 estrela,
// errado não dá nada) e a digitação de verdade pelo teclado. Servidor e banco de TESTE novos (cenario.js), modo
// congelado (o prêmio só abre com Reino.congelado desligado de propósito, na entrada).
// O ataque por alvo (js/sistemas/bosque-alvo.js): clicar no fantasma golpeia até vencer, clicar no chão, tecla de andar
// ou tela param, o toque faz o mesmo, o cursor de espada em cima dele; e a espada não treme andando.
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
  const barra = chip && chip.querySelector('.bosque-xp-cheia');
  return { cena: Reino.Cena.atual().id, chip: !!chip && !chip.hidden, acao: !!acao && !acao.hidden,
    chipTexto: chip ? chip.textContent : '', chipAria: chip ? chip.getAttribute('aria-label') : '',
    xpBarra: barra ? barra.style.width : '', estrelas: P.estrelas(), acertos: B.acertos(), mortos: B.mortos(),
    nivel: B.nivel(), xp: B.xp().n, xpDe: B.xp().de, proxima: B.proximaPergunta(),
    vencidos: P.estado().bosque.vencidos, feitas: (P.estado().bosque.perguntasFeitas || 0) + (P.estado().bosque.tercos || 0),
    marcas: chip ? chip.querySelectorAll('.bosque-xp-marca').length : 0,
    pendentesQ: B.perguntasPendentes(), pontos: B.pontos(), pendentes: B.pontosPendentes(),
    telas: [...document.querySelectorAll('#telas > .tela')].map((t) => t.className.split(' ').find((k) => k.startsWith('tela-') && k !== 'tela-presente')) };
})()`;

// um inimigo vencido: emite o BOSQUE 'vencido' (o ouvinte chama Bosque.abater e enfileira)
const VENCER = `(() => {
  const est = Reino._bosqueCombate.estado, f = est.fantasmas[0];
  f.estado = 'vencido';
  Reino.util.emit(Reino.EVENTOS.BOSQUE, { tipo: 'vencido', id: f.id, fantasma: f.tipo });
  return f.id;
})()`;
const VENCER_N = (n) => `(() => {
  const est = Reino._bosqueCombate.estado, f = est.fantasmas[0];
  for (let i = 0; i < ${n}; i++) { f.estado = 'vencido'; Reino.util.emit(Reino.EVENTOS.BOSQUE, { tipo: 'vencido', id: f.id, fantasma: f.tipo }); }
  return ${n};
})()`;
// o placar de mortos, o XP e as perguntas já feitas, sem passar pelo combate (os testes de tela): nos contadores
// novos (o placar antigo fica em 0), com o XP de `mortos` mortos do placar antigo (xpLegado: o fácil dá 10, um morto
// antigo no nível 1). Os contadores só sobem (a mescla com o banco de teste é pelo maior): cada PLACAR é maior que o anterior
const PLACAR = (mortos, feitas) => `(() => { const b = Reino.Progresso.estado().bosque;
  b.mortos = 0; b.perguntasFeitas = 0; b.migrado = 1; b.abates = ${mortos}; b.xp = Reino.Bosque.curva.xpLegado(${mortos}); b.tercos = ${feitas}; return 1; })()`;
// a pergunta de escolha; pontuar devolve window.__ok (o teste escolhe certo ou errado)
const PREPARAR = `(() => {
  const B = Reino.Bosque, D = Reino.Desafios;
  if (!window.__pontuar) window.__pontuar = D.pontuar;
  D.pontuar = function () { return window.__ok ? 1 : 0; };
  B.pergunta = function () { return B.perguntas().find((q) => q.desafio.tipo === 'escolha'); };
  return !!B.pergunta();
})()`;

test('bosque: HUD, prêmio, pergunta a cada terço do XP, baú, nível ao fechar a barra, sem casa, teclado e desmaio', { timeout: 300000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', pasta: pasta() });
  const olhar = () => c.js(OLHAR);
  // responde a pergunta aberta (certo = ok) e devolve o estado logo depois do Conferir
  async function responder(ok) {
    await c.js(`window.__ok = ${ok}; 1`);
    await c.js(VENCER);
    await c.avancar(300);
    assert.ok((await olhar()).telas.includes('tela-bosque-pergunta'), 'a pergunta abre no bloco de 10');
    await c.js("document.querySelector('.tela-bosque-pergunta .opcao').click(); 1");
    await c.avancar(100);
    await c.js("document.querySelector('.tela-bosque-pergunta .bosque-botao').click(); 1");
    await c.avancar(100);
    return c.js(`({ texto: document.querySelector('.tela-bosque-pergunta .bosque-retorno').textContent, ...${OLHAR} })`);
  }
  // abre o baú fechado pelo toque, confere o cartão do móvel e fecha; `esc` faz o Esc antes de abrir (abre) e depois (fecha)
  async function abrirEFecharBau(esc) {
    assert.ok((await olhar()).telas.includes('tela-bosque-bau'), 'o baú do prêmio abre: ' + (await olhar()).telas);
    if (esc) {
      await c.page.keyboard.press('Escape');
    } else {
      await c.js("document.querySelector('.tela-bosque-bau .presente-bau').click(); 1");
    }
    await c.avancar(1500);
    const cartao = await c.js(`(() => { const k = document.querySelector('.tela-bosque-bau .bosque-bau-cartao');
      return { visivel: !!k && !k.hidden, nome: k ? (k.querySelector('.presente-nome') || {}).textContent || '' : '',
        comodo: k ? (k.querySelector('.bosque-bau-comodo') || {}).textContent || '' : '',
        nota: !!document.querySelector('.tela-bosque-bau .bosque-bau-nota') && !document.querySelector('.tela-bosque-bau .bosque-bau-nota').hidden }; })()`);
    assert.strictEqual(cartao.visivel, true, 'o cartão com o móvel aparece');
    assert.ok(cartao.nome && cartao.comodo, 'com o nome e o cômodo');
    if (esc) await c.page.keyboard.press('Escape');
    else await c.js("document.querySelector('.tela-bosque-bau .presente-continuar').click(); 1");
    await c.avancar(300);
    return cartao;
  }
  async function continuar(comBau) {
    await c.avancar(700);   // o botão nasce travado 600 ms
    await c.js("document.querySelector('.tela-bosque-pergunta .bosque-botao').click(); 1");
    await c.avancar(300);
    if (comBau) await abrirEFecharBau(false);
  }
  try {
    await c.js(`(() => { const e = Reino.Progresso.estado(); e.bosque = { acertos: 0, espada: 0, vencidos: 0, mortos: 0, perguntasFeitas: 0, migrado: 1 }; e.bosquePontos = {};
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
    assert.match(o.chipAria, /0 de 300 de XP/, 'a barra é de XP até o próximo nível');
    assert.match(o.chipAria, /próxima pergunta em 0 por cento/);
    assert.strictEqual(o.xpBarra, '0%', 'a barra vazia');
    assert.strictEqual(o.marcas, 2, 'as marquinhas dos terços (onde vem a pergunta)');
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

    // 4) só a cada 10: nove inimigos mortos não abrem a pergunta
    assert.strictEqual(await c.js(PREPARAR), true);
    await c.js(PLACAR(0, 0));
    await c.js(VENCER_N(9));
    await c.avancar(600);
    o = await olhar();
    assert.deepStrictEqual([o.mortos, o.pendentesQ, o.telas.length], [9, 0, 0], '9 mortos: nenhuma pergunta');
    assert.match(o.chipAria, /90 de 300 de XP/);
    assert.strictEqual(o.xpBarra, '30%');
    assert.match(o.chipAria, /próxima pergunta em 90 por cento/);

    // 5) o 10º abre a pergunta; certo: +1 estrela, consome o bloco e abre o baú do móvel
    const antes = await olhar();
    o = await responder(true);
    assert.deepStrictEqual([o.estrelas, o.acertos, o.mortos, o.feitas, o.nivel], [antes.estrelas + 1, antes.acertos + 1, 10, 1, 1], 'certo dá estrela e consome o bloco');
    assert.match(o.texto, /\+1/);
    assert.match(o.texto, /presente para a casa/);
    assert.strictEqual(await c.js("Reino.CasaMoveis.escolhida('bosque:p1')"), true, 'o móvel da pergunta já está gravado');
    await continuar(true);
    o = await olhar();
    assert.strictEqual(o.telas.length, 0, 'o baú fecha');
    assert.strictEqual(await c.js("Reino._bosqueCombate.estado.fantasmas[0].estado"), 'esperando', 'o inimigo volta depois');

    // 6) errado no 20º: nada se ganha e não abre baú
    await c.js(PLACAR(19, 1));
    await c.avancar(50);
    const antes2 = await olhar();
    o = await responder(false);
    assert.deepStrictEqual([o.estrelas, o.acertos, o.vencidos, o.feitas, o.mortos], [antes2.estrelas, antes2.acertos, antes2.vencidos + 1, 2, 20], 'errado consome o bloco e não dá nada');
    assert.match(o.texto, /Quase/);
    await continuar(false);
    o = await olhar();
    assert.deepStrictEqual([o.telas.length, o.telas.includes('tela-bosque-bau')], [0, false], 'errado: sem baú');

    // 7) o 30º: pergunta (Esc = erro) e depois o nível, com o ponto e o baú do nível
    await c.js(PLACAR(29, 2));
    await c.avancar(50);
    await c.js(VENCER);
    await c.avancar(300);
    assert.ok((await olhar()).telas.includes('tela-bosque-pergunta'), 'a pergunta do 30º bloco abre');
    assert.strictEqual(await c.js("Reino.CasaMoveis.escolhida('bosque:2')"), true, 'o móvel do nível é gravado no abate');
    await c.page.keyboard.press('Escape');
    await c.avancar(500);
    o = await olhar();
    assert.ok(o.telas.includes('tela-bosque-nivel'), 'subiu: a tela do ponto: ' + o.telas);
    assert.deepStrictEqual([o.mortos, o.feitas, o.nivel, o.pendentes], [30, 3, 2, [2]]);
    await c.avancar(700);
    await c.js("document.querySelector('.tela-bosque-nivel [data-hab=forca]').click(); 1");
    await c.avancar(4000);
    await abrirEFecharBau(true);   // Esc antes de abrir o baú, Esc depois de aberto
    o = await olhar();
    assert.deepStrictEqual([o.pontos.forca, o.pendentes, o.telas.length], [1, [], 0]);

    // 8) sem casa: o móvel fica guardado e o baú avisa na tela
    await c.js(`(() => { window.__ganhou = Reino.Casa.ganhou; Reino.Casa.ganhou = () => false; return 1; })()`);
    await c.js(PLACAR(60, 6));
    await c.avancar(50);
    await c.js('void Reino.UI.subirNivelBosque(3)');
    await c.avancar(700);
    await c.js("document.querySelector('.tela-bosque-nivel [data-hab=vida]').click(); 1");
    await c.avancar(4000);
    const semCasa = await abrirEFecharBau(false);
    assert.strictEqual(semCasa.nota, true, 'sem casa: a nota na tela do baú');
    assert.strictEqual(semCasa.nome.length > 0, true);
    o = await olhar();
    assert.deepStrictEqual([o.pontos.vida, o.pendentes.length], [1, 0]);
    await c.js('Reino.Casa.ganhou = __ganhou; 1');
    await c.avancar(300);

    // 9) teclado: o painel pelo chip; Esc no ponto abre o baú do nível e deixa o ponto pendente; Tab + Enter põe
    await c.js(PLACAR(90, 9));
    await c.avancar(50);
    await c.js('Reino.UI.atualizarHUD(); 1');
    await c.js("document.querySelector('#hud .chip-bosque').click(); 1");
    await c.avancar(300);
    assert.ok((await olhar()).telas.includes('tela-bosque'));
    assert.strictEqual(await c.js("!!document.querySelector('.tela-bosque .bosque-por')"), true, 'o botão de pôr o ponto pendente');
    await c.js("document.querySelector('.tela-bosque .bosque-por').click(); 1");
    await c.avancar(300);
    assert.ok((await olhar()).telas.includes('tela-bosque-nivel'));
    await c.avancar(700);
    await c.page.keyboard.press('Escape');
    await c.avancar(400);
    await abrirEFecharBau(false);   // o baú do nível já sai no Esc/Depois
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
    assert.deepStrictEqual([o.pendentes, o.telas.length], [[], 0], 'Enter no cartão põe o ponto (o baú já saiu no Esc)');
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
    // mortos/perguntas altos: o teste responde direto, sem matar, e o piso legado não pode entrar no meio
    await c.js('Reino.UI.fecharTodas(); Reino.Progresso.estado().bosque = { acertos: 0, espada: 1, vencidos: 0, mortos: 1000, perguntasFeitas: 100, migrado: 1 }; 1');
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

// ponto da tela (px CSS) do corpo do fantasma `id` (12 px do jogo acima dos pés) ou de um ponto do jogo
const NA_TELA = `((wx, wy) => { const V = Reino._motor, r = V.canvas.getBoundingClientRect();
  return { x: r.left + (wx - V.cam.x) * V.escala / V.dpr, y: r.top + (wy - V.cam.y) * V.escala / V.dpr }; })`;
const FANTASMA_NA_TELA = (id) => `(() => { const f = Reino._bosqueCombate.estado.fantasmas.find((x) => x.id === '${id}');
  return ${NA_TELA}(f.x, f.y - 12); })()`;
// põe a jogadora num tile livre a ~4 tiles abaixo (ou acima) do fantasma do tipo pedido; devolve o id dele
// (deLado: a ~4 tiles à direita, para ele ficar na metade esquerda da tela)
const PERTO_DE = (tipo, deLado) => `(() => {
  const est = Reino._bosqueCombate.estado, cena = Reino.Cena.atual();
  const f = est.fantasmas.find((x) => x.tipo === '${tipo}' && x.estado === 'vagando');
  const tx = Math.floor(f.x / 16), ty = Math.floor(f.y / 16);
  for (const d of ${deLado ? '[4, 5, 3, 6]' : '[4, -4, 3, -3, 5, -5]'}) {
    const x = tx + ${deLado ? 'd' : '0'}, y = ty + ${deLado ? '0' : 'd'};
    if (!cena.solido(x, y) && cena.caminho({ x, y }, { x: tx, y: ty })) { Jogador.posicionar(x, y); return f.id; }
  }
  throw new Error('sem tile livre perto de ' + f.id);
})()`;

test('bosque: clicar no fantasma ataca sozinho até vencer; chão, tecla e toque; cursor de espada; a espada não treme', { timeout: 300000 }, async () => {
  const c = await abrirCenario({ tamanho: 'notebook', pasta: pasta() });
  try {
    await c.js(`(() => { const e = Reino.Progresso.estado(); e.bosque = { acertos: 0, espada: 1, vencidos: 0, mortos: 0, perguntasFeitas: 0, migrado: 1 }; e.bosquePontos = {};
      Reino.UI.fecharTodas(); return 1; })()`);
    await c.ir('bosque');
    await c.js(`(() => { Reino._bosqueCombate.estado.parados = true; Reino.UI.fecharTodas();
      window.__golpes = 0; Reino.util.on(Reino.EVENTOS.BOSQUE, (e) => { if (e.tipo === 'golpe') __golpes++; }); return 1; })()`);
    await c.avancar(300);
    const cfg = await c.js('Reino.config.fantasmas');
    const vidaDe = (id) => c.js(`Reino._bosqueCombate.estado.fantasmas.find((x) => x.id === '${id}').vida`);
    const estadoDe = (id) => c.js(`Reino._bosqueCombate.estado.fantasmas.find((x) => x.id === '${id}').estado`);
    const alvo = () => c.js('Reino.BosqueCombate.alvo()');
    const cursor = () => c.js('Reino._motor.canvas.style.cursor');

    // 1) cursor: espada em cima do fantasma, o de sempre fora dele
    const f1 = await c.js(PERTO_DE('facil'));
    await c.avancar(100);
    let p = await c.js(FANTASMA_NA_TELA(f1));
    await c.page.mouse.move(p.x, p.y);
    assert.match(await cursor(), /^url\("?data:image\/png;base64,.+\) \d+ \d+, pointer$/, 'cursor de espada em cima do fantasma');
    const chao = await c.js(`${NA_TELA}(Jogador.x + 24, Jogador.y - 6)`);
    assert.strictEqual(await c.js(`Reino.BosqueCombate.fantasmaNaTela(${chao.x}, ${chao.y})`), null, 'o ponto do chão está livre');
    await c.page.mouse.move(chao.x, chao.y);
    assert.strictEqual(await cursor(), '', 'fora do fantasma: o cursor de sempre');

    // 2) clicar no fantasma: ela vai até ele e golpeia sozinha, um golpe por vida, até vencer; aí o ataque acaba
    await c.page.mouse.click(p.x, p.y);
    assert.strictEqual(await alvo(), f1);
    assert.strictEqual(await c.js('Jogador.marcador'), null, 'sem as setinhas do toque no chão');
    await c.js('__golpes = 0; 1');
    for (let i = 0; i < 40 && !/sumindo|vencido/.test(await estadoDe(f1)); i++) await c.avancar(200);
    assert.strictEqual(await estadoDe(f1), 'sumindo', 'venceu sem outro clique');
    assert.strictEqual(await c.js('__golpes'), cfg.tipos.facil.vida, 'um golpe por vida (dano 1)');
    await c.avancar(cfg.vencidoMs + 300);
    assert.strictEqual(await alvo(), null, 'vencido: o ataque para');
    await c.js('Reino.UI.fecharTodas(); 1');
    await c.avancar(300);

    // 3) clicar no chão para o ataque (ela anda até lá e não golpeia mais)
    const f2 = await c.js(PERTO_DE('medio'));
    await c.avancar(100);
    p = await c.js(FANTASMA_NA_TELA(f2));
    await c.page.mouse.click(p.x, p.y);
    for (let i = 0; i < 40 && (await vidaDe(f2)) === cfg.tipos.medio.vida; i++) await c.avancar(100);
    const vida2 = await vidaDe(f2);
    assert.ok(vida2 < cfg.tipos.medio.vida, 'golpeou');
    // um tile de chão livre (sem árvore, objeto nem fantasma) a 3 tiles dela
    const longe = await c.js(`(() => {
      const cena = Reino.Cena.atual(), est = Reino._bosqueCombate.estado, t = Jogador.tile();
      for (const [dx, dy] of [[-3, 0], [3, 0], [0, 3], [0, -3], [-3, 3], [3, 3]]) {
        const wx = (t.x + dx) * 16 + 8, wy = (t.y + dy) * 16 + 8;
        if (!cena.solido(t.x + dx, t.y + dy) && !cena.alvoEm(wx, wy) && !Reino.BosqueCombate.fantasmaEm(est, wx, wy)) return ${NA_TELA}(wx, wy);
      }
      throw new Error('sem chão livre perto dela');
    })()`);
    await c.page.mouse.click(longe.x, longe.y);
    assert.strictEqual(await alvo(), null, 'clicou no chão: parou');
    assert.ok(await c.js('Jogador.caminho.length > 0'), 'e o clique no chão anda, como sempre');
    await c.avancar(cfg.jogador.recargaMs * 4);
    assert.strictEqual(await vidaDe(f2), vida2, 'sem mais golpes');

    // 4) tecla de andar e tela aberta param
    await c.js(PERTO_DE('medio'));
    await c.avancar(100);
    p = await c.js(FANTASMA_NA_TELA(f2));
    await c.page.mouse.click(p.x, p.y);
    assert.strictEqual(await alvo(), f2);
    await c.page.keyboard.press('ArrowLeft');
    assert.strictEqual(await alvo(), null, 'seta: parou');
    await c.page.mouse.click(p.x, p.y);
    assert.strictEqual(await alvo(), f2);
    await c.js('Reino.UI.telaBosque(); 1');
    await c.avancar(300);
    assert.strictEqual(await alvo(), null, 'tela aberta: parou');
    await c.js('Reino.UI.fecharTodas(); 1');
    await c.avancar(300);

    // 5) toque (dedo) no fantasma: o mesmo ataque, e o motor não recebe o toque
    await c.js(PERTO_DE('medio'));
    await c.avancar(100);
    p = await c.js(FANTASMA_NA_TELA(f2));
    await c.js(`(() => { const o = { bubbles: true, pointerId: 9, pointerType: 'touch', isPrimary: true, clientX: ${p.x}, clientY: ${p.y} };
      Reino._motor.canvas.dispatchEvent(new PointerEvent('pointerdown', o));
      Reino._motor.canvas.dispatchEvent(new PointerEvent('pointerup', o)); return 1; })()`);
    assert.strictEqual(await alvo(), f2, 'tocou: ataca');
    const antes5 = await vidaDe(f2);
    for (let i = 0; i < 40 && (await vidaDe(f2)) === antes5; i++) await c.avancar(100);
    assert.ok((await vidaDe(f2)) < antes5, 'no toque também golpeia sozinha');
    await c.js('Reino.BosqueCombate.pararAlvo(); 1');

    // 5b) dedo na metade esquerda em cima do fantasma: arrastar abre o thumbstick (sem ataque); o toque curto ataca
    await c.js(PERTO_DE('medio', true));
    await c.avancar(100);
    p = await c.js(FANTASMA_NA_TELA(f2));
    assert.ok(p.x < (await c.js('innerWidth')) / 2, 'o fantasma na metade esquerda');
    const DEDO = (tipo, dx) => `(() => { Reino._motor.canvas.dispatchEvent(new PointerEvent('${tipo}', { bubbles: true, pointerId: 11,
      pointerType: 'touch', isPrimary: true, clientX: ${p.x} + ${dx}, clientY: ${p.y} })); return 1; })()`;
    await c.js(DEDO('pointerdown', 0));
    assert.strictEqual(await alvo(), null, 'o dedo encostou: ainda não ataca');
    await c.js(DEDO('pointermove', 30));
    assert.strictEqual(await c.js("!document.querySelector('#controle').hidden"), true, 'arrastou: o thumbstick aparece');
    await c.js(DEDO('pointerup', 30));
    assert.deepStrictEqual([await alvo(), await c.js("document.querySelector('#controle').hidden")], [null, true], 'soltou: sem ataque');
    await c.js(DEDO('pointerdown', 0));
    await c.js(DEDO('pointerup', 0));
    assert.strictEqual(await alvo(), f2, 'o toque curto ataca');
    await c.js('Reino.BosqueCombate.pararAlvo(); 1');
    await c.avancar(cfg.jogador.golpeMs + 300);   // o último golpe acaba (a espada avança no golpe)

    // 6) a espada não treme: andando numa direção, a posição dela (px da tela) em relação ao corpo fica constante
    const tremor = await c.page.evaluate(async () => {
      const P = Reino.Progresso, V = Reino._motor, u = P.estado().unis[P.montaria()], xp = u.xp;
      P.estado().ajustes.animacoes = true; Reino.util.reduzMovimentoSistema = false;   // com o trote e os passos
      const s0 = V.pintor.sprite, reg = [];
      V.pintor.sprite = function (img, x, yPes) {
        const dx = Math.round((x - img.width / 2 - V.cam.x) * V.escala), dy = Math.round((yPes - img.height - V.cam.y) * V.escala);
        if (img.width === 5 && img.height === 11) reg.push(['e', dx, dy]);
        else if (Jogador.silhueta && img === Jogador.silhueta.img) reg.push(['c', dx, dy]);
        return s0.apply(this, arguments);
      };
      const saida = {};
      try {
        for (const montada of [true, false]) {
          u.xp = montada ? xp : 0;
          for (const k of ['dir', 'esq', 'cima', 'baixo']) {
            Jogador.posicionar(28, 34); V.teclas = { [k]: true };
            const vistos = new Set();
            for (let i = 0; i < 40; i++) {
              reg.length = 0;
              await window.__congelar.avancar(16);
              const e = reg.find((r) => r[0] === 'e'), b = reg.find((r) => r[0] === 'c');
              if (e && b) vistos.add((e[1] - b[1]) + ',' + (e[2] - b[2]));
            }
            saida[(montada ? 'montada ' : 'a pé ') + k] = [...vistos];
          }
        }
      } finally { V.teclas = {}; V.pintor.sprite = s0; u.xp = xp; }
      return saida;
    });
    Object.entries(tremor).forEach(([k, v]) => assert.strictEqual(v.length, 1, k + ': a espada mexeu em relação a ela ' + JSON.stringify(v)));
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
