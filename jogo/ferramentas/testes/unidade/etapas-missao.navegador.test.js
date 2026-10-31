// A missão da sala de livro por etapas (docs/contratos/quarto-bimestre.md §13.3 e §14), pela interface, numa sala com
// uma etapa só de leitura no meio: abrir a sala pela estação mostra a trilha (bolinhas, "Etapa 1 de N", "⭐ 0 de N" e
// o que falta para o prêmio; Tab e Enter nas bolinhas, a apagada não se escolhe); a etapa 1 sem erro ("Carta 1 de …",
// "Desafio 1 de …" contando só a etapa) → "Etapa guardada!" com ⭐; "Descansar" fecha e o Claude aponta o Cantinho do
// Respiro; a tela da matéria mostra ◐ "1/N"; reabrir começa na 2; o ✕ no meio de uma etapa diz que as anteriores estão
// guardadas; a última etapa com um erro conta a sala (o mesmo dinheiro da sala feita de uma vez); reabrir a sala feita
// escolhe a etapa sem ⭐ ("Tentar sem errar ⭐") e refazê-la sem erro dá a festa da trilha perfeita (acessório com
// "Usar agora", elemento e carta), sem contar a sala de novo. Por fim, o prêmio retroativo: o evento TRILHA_PERFEITA
// com ela na Casa abre a festa uma vez só.
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1); tablet. Sem erro de console.
// Rodar (da raiz): npm run unidade -- --so etapas-missao
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');
const { preparar, acionar, responderDaVez, esperar, tocarTile, andarAte, irAEstacao, telaDaMissao, seguirSala, PRINCIPAL } = require('./ajudantes/quarto-bimestre');

const sp = (x) => String(x).replace(/­/g, '').replace(/\s+/g, ' ').trim();
const SALA = 'lp11a3';
const texto = (c, sel) => c.js(`(function (e) { return e ? e.textContent : null; })(document.querySelector(${JSON.stringify(sel)}))`).then((t) => t === null ? null : sp(t));

async function abrirPelaEstacao(c) {
  const e = await irAEstacao(c, SALA);
  await andarAte(c, e.tile.x, e.tile.y);
  await tocarTile(c, e.x, e.y);
  assert.ok(await esperar(c, 'Reino.Claude.dialogoAberto()', 8000), 'a estação não falou');
  // a fala da estação pode ter mais de uma página (sala em andamento): toca o principal até a sala abrir
  for (let i = 0; i < 6 && await c.js('Reino.Claude.dialogoAberto()'); i++) {
    await acionar(c, c.page.locator('#claude-balao .claude-acoes .btn-dialogo.principal'), 'toque');
    await c.avancar(300);
  }
  assert.ok(await esperar(c, "!!document.querySelector('.tela-missao .etapas-trilha')", 8000), 'a estação não abriu a trilha: ' +
    JSON.stringify(await c.js("({ telas: Array.from(document.querySelectorAll('#telas > .tela')).map(function (t) { return t.className + ' ' + t.textContent.slice(0, 80); }), claude: Reino.Claude.textoAberto() })")));
}
const trilha = (c) => c.js(`(function () { var bs = Array.from(document.querySelectorAll('.tela-missao .etapas-trilha .etapa-bolinha'));
  return { classes: bs.map(function (b) { return ['perfeita', 'feita', 'proxima', 'apagada'].find(function (k) { return b.classList.contains(k); }); }),
    escolhida: bs.findIndex(function (b) { return b.classList.contains('escolhida'); }), botao: document.querySelector('${PRINCIPAL}').getAttribute('aria-label') }; })()`);
const etapasNoSave = (c) => c.js(`(function (e) { var r = e.etapas['${SALA}'] || {}; return { feitas: Object.keys(r.feitas || {}).map(Number), perfeitas: Object.keys(r.perfeitas || {}).map(Number),
  sala: e.salas['${SALA}'] || null, dinheiro: Reino.Progresso.dinheiroTotal(), trilha: !!(e.trilhas || {})['${SALA}'] }; })(Reino.Progresso.estado())`);
const certo = (c) => async (id) => { const r = await responderDaVez(c, id, 'dom', { errar: false }); assert.deepStrictEqual(r.problemas, [], id); };

test('sala de livro por etapas: trilha, fim de etapa, descansar, voltar, sala contada e a trilha perfeita', async () => {
  const c = await abrirCenario({ tamanho: 'tablet', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'etapas-missao-')) });
  try {
    const info = await c.js(`(function (m) { var s = m.salas.find(function (x) { return x.id === '${SALA}'; }), et = Reino.etapasDaSala(m, s), pr = Reino.premioTrilha('${SALA}');
      return { etapas: et.map(function (e) { return { cartas: e.cartas.length, desafios: e.desafios.length }; }), valor: Reino.Progresso.valorSala(m), nome: s.nome,
        acessorio: pr.acessorio.id, acessorioNome: pr.acessorio.nome, z: pr.elemento, exp: pr.experiencia }; })(Reino.materia('portugues4'))`);
    const N = info.etapas.length;
    assert.ok(N >= 3 && info.etapas.some((e) => !e.desafios), 'a sala de teste tem 3+ etapas e uma só de leitura: ' + JSON.stringify(info.etapas));
    const antes = await etapasNoSave(c);
    assert.ok(!antes.sala && !antes.feitas.length, 'a sala já começada no save sintético');

    // 1) a trilha
    await c.page.evaluate(preparar);
    await abrirPelaEstacao(c);
    assert.deepStrictEqual(await trilha(c), { classes: ['proxima'].concat(Array(N - 1).fill('apagada')), escolhida: 0, botao: 'Começar' });
    assert.strictEqual(await texto(c, '.tela-missao .etapas-conta'), `Etapa 1 de ${N}`);
    assert.match(await texto(c, '.tela-missao .etapas-estrelas'), new RegExp(`0 de ${N} sem erro ?Faltam ${N} etapas para o prêmio lendário!`));
    assert.ok(await c.js("!!document.querySelector('.tela-missao .etapas-premio canvas')"), 'sem o ícone do acessório da sala');
    // teclado: Tab e Enter na bolinha da etapa 1 (fica escolhida); a apagada não se escolhe
    await acionar(c, c.page.locator('.tela-missao .etapa-bolinha').nth(0), 'teclado');
    await acionar(c, c.page.locator('.tela-missao .etapa-bolinha').nth(1), 'teclado');
    assert.strictEqual((await trilha(c)).escolhida, 0, 'a etapa apagada ficou escolhida');

    // 2) a etapa 1, sem erro: só as cartas e os desafios dela
    await acionar(c, c.page.locator(PRINCIPAL), 'dom');
    const e1 = await seguirSala(c, certo(c), { ate: 'fimEtapa' });
    assert.strictEqual(e1.fim, 'fimEtapa');
    assert.deepStrictEqual(e1.cartas, Array.from({ length: info.etapas[0].cartas }, (_, i) => `Carta ${i + 1} de ${info.etapas[0].cartas}`));
    assert.deepStrictEqual(e1.desafios, Array.from({ length: info.etapas[0].desafios }, (_, i) => `Desafio ${i + 1} de ${info.etapas[0].desafios}`));
    const fim1 = await texto(c, '.tela-missao .fim-etapa');
    assert.match(fim1, /Etapa guardada!/); assert.match(fim1, /Tudo certo de primeira!/); assert.match(fim1, new RegExp(`Etapa 1 de ${N}`));
    assert.deepStrictEqual(await c.js("Array.from(document.querySelectorAll('.tela-missao footer.rodape-acao:not([hidden]) button')).map(function (b) { return b.textContent.trim(); })"),
      ['Descansar', 'Próxima etapa']);
    let s = await etapasNoSave(c);
    assert.deepStrictEqual([s.feitas, s.perfeitas, s.sala, s.dinheiro], [[0], [0], null, antes.dinheiro], 'a etapa 1 guardada, a sala ainda não');

    // 3) descansar: fecha, e o Claude aponta o Cantinho do Respiro
    await acionar(c, c.page.locator('.tela-missao footer.rodape-acao:not([hidden]) .btn-secundario'), 'dom');
    assert.ok(await esperar(c, "!document.querySelector('#telas > .tela-missao')", 3000), 'o Descansar não fechou');
    assert.match(sp(await c.js('Reino.Claude.textoAberto()')), /Tudo ficou guardado\. Vá ao Cantinho do Respiro\. Ele fica no primeiro andar\./);
    await c.js('Reino.Claude.limpar()');
    // a tela da matéria: ◐ e "1/N"
    await c.js("Reino.UI.telaMateria(Reino.materia('portugues4'))");
    await c.avancar(300);
    const card = await c.js(`(function (b) { return b && { chip: b.querySelector('.chip-mini.andamento') ? b.querySelector('.chip-mini.andamento').textContent.trim() : null,
      meia: !!b.querySelector('.meia-lua'), rotulo: b.getAttribute('aria-label') }; })(Array.from(document.querySelectorAll('.lista-materia .sala-card')).find(function (b) { return /${info.nome}/.test(b.getAttribute('aria-label')); }))`);
    assert.deepStrictEqual([card.chip, card.meia], [`1/${N}`, true], 'o chip em andamento: ' + JSON.stringify(card));
    assert.match(card.rotulo, new RegExp(`em andamento, 1 de ${N} etapas`));
    await c.js('Reino.UI.fecharTodas()');
    await c.avancar(300);

    // 4) reabrir: começa na etapa 2 (a só de leitura passa por "Terminar ✓"); ✕ no meio da etapa 3
    await abrirPelaEstacao(c);
    const t2 = await trilha(c);
    assert.deepStrictEqual([t2.classes[0], t2.classes[1], t2.escolhida], ['perfeita', 'proxima', 1], 'reabrir: ⭐ na 1 e a 2 escolhida');
    assert.match(await texto(c, '.tela-missao .etapas-estrelas'), new RegExp(`1 de ${N} sem erro`));
    await acionar(c, c.page.locator(PRINCIPAL), 'dom');
    const e2 = await seguirSala(c, certo(c), { ate: 'fimEtapa' });
    assert.strictEqual(e2.fim, 'fimEtapa');
    await acionar(c, c.page.locator(PRINCIPAL), 'dom');   // "Próxima etapa ▶"
    assert.ok(['carta', 'desafio'].includes(await telaDaMissao(c)), 'a próxima etapa não abriu');
    await acionar(c, c.page.locator('.tela-missao .btn-sair'), 'dom');
    assert.ok(await esperar(c, "!!document.querySelector('.tela-confirmar .btn-principal')", 4000), 'sem a pergunta de sair');
    assert.match(sp(await c.js("document.querySelector('.tela-confirmar').textContent")), /As etapas que você terminou estão guardadas\. Só esta etapa começa de novo\./);
    await acionar(c, c.page.locator('.tela-confirmar .btn-principal'), 'dom');
    assert.ok(await esperar(c, "!document.querySelector('#telas > .tela-missao')", 3000), 'não saiu');
    s = await etapasNoSave(c);
    assert.deepStrictEqual(s.feitas.sort(), [0, 1], 'as etapas 1 e 2 guardadas');

    // 5) as etapas que faltam, a última com um erro: a sala conta, com o dinheiro de sempre
    await abrirPelaEstacao(c);
    assert.strictEqual((await trilha(c)).escolhida, 2, 'reabrir: a etapa 3');
    let errou = false;
    const fim = await seguirSala(c, async (id) => {
      const r = await responderDaVez(c, id, 'dom', { errar: !errou });
      assert.deepStrictEqual(r.problemas, [], id);
      if (r.errado === 'quase') errou = true;
    });
    assert.ok(errou, 'nenhuma questão errada na última etapa');
    assert.deepStrictEqual([fim.fim, fim.festa], ['fimSala', false]);
    const total = info.etapas.reduce((t, e) => t + e.desafios, 0);
    const telaFim = await texto(c, '.tela-missao .fim-sala');
    assert.match(telaFim, /Sala concluída!/);
    assert.match(telaFim, new RegExp(`Acertos de primeira: ${total - 1} de ${total}`));
    s = await etapasNoSave(c);
    assert.ok(s.sala && s.sala.feita && s.sala.vezes === 1 && !s.sala.perfeita, 'a sala contada: ' + JSON.stringify(s.sala));
    assert.strictEqual(Math.round((s.dinheiro - antes.dinheiro) * 100), Math.round(info.valor * 100), 'o dinheiro da sala, igual ao da sala feita de uma vez');
    assert.ok(telaFim.indexOf(sp('+ ' + await c.js(`Reino.util.moedas(${info.valor})`))) >= 0, 'o fim sem o valor da sala');
    await c.js("Reino.UI.fecharTodas(); document.body.classList.remove('em-missao')");
    await c.avancar(600);

    // 6) a sala feita: a trilha escolhe a etapa sem ⭐; refazer só ela sem erro dá a festa da trilha perfeita
    await abrirPelaEstacao(c);
    const t3 = await trilha(c);
    assert.deepStrictEqual([t3.escolhida, t3.botao], [2, 'Tentar sem errar'], 'a sala feita: ' + JSON.stringify(t3));
    assert.deepStrictEqual(t3.classes.slice(0, 2), ['perfeita', 'perfeita']);
    assert.strictEqual(t3.classes[2], 'feita');
    await acionar(c, c.page.locator(PRINCIPAL), 'dom');
    const festa = await seguirSala(c, certo(c), { ate: 'festa' });
    assert.strictEqual(festa.fim, 'festa');
    const telaFesta = await texto(c, '.tela-missao .festa-trilha');
    assert.match(telaFesta, /Trilha perfeita!/);
    assert.ok(telaFesta.indexOf(sp(info.acessorioNome)) >= 0, 'a festa sem o acessório: ' + telaFesta);
    assert.strictEqual(await c.js("document.querySelectorAll('.tela-missao .cartao-trilha').length"), 3, 'os 3 cartões');
    assert.strictEqual(await c.js("!!document.querySelector('.tela-missao .btn-ver-carta')"), await c.js('typeof Reino.UI.abrirExperiencias === "function"'), 'o "Ver carta" só com o álbum');
    await acionar(c, c.page.locator('.tela-missao .btn-usar'), 'dom');
    assert.ok(await c.js(`Reino.Progresso.estado().usando.enfeites.indexOf('${info.acessorio}') >= 0`), '"Usar agora" não vestiu o acessório');
    assert.ok(await c.js("!!document.querySelector('.tela-missao .cartao-trilha .chip-mini.ok')"), 'sem o "Usando ✓"');
    s = await etapasNoSave(c);
    assert.ok(s.trilha && s.sala.vezes === 1, 'a trilha ganha, sem contar a sala de novo: ' + JSON.stringify(s));
    assert.strictEqual(Math.round((s.dinheiro - antes.dinheiro) * 100), Math.round(info.valor * 100), 'refazer uma etapa não dá dinheiro');
    assert.ok(await c.js(`Reino.Progresso.estado().loja['${info.acessorio}'] === true`), 'o acessório na loja');
    await acionar(c, c.page.locator('.tela-missao .festa-trilha > .btn-principal'), 'dom');
    assert.ok(await esperar(c, "!document.querySelector('#telas > .tela-missao')", 3000), 'a festa não fechou');
    // a sala feita com uma etapa refeita (rodada nova) continua ✓ na tela da matéria, agora com a ⭐ da trilha
    await c.js("Reino.UI.telaMateria(Reino.materia('portugues4'))");
    await c.avancar(300);
    assert.deepStrictEqual(await c.js(`(function (b) { return [!!b.querySelector('.chip-mini.ok'), !!b.querySelector('.chip-mini.andamento'), !!b.querySelector('.chip-mini.trilha-perfeita')]; })(
      Array.from(document.querySelectorAll('.lista-materia .sala-card')).find(function (b) { return /${info.nome}/.test(b.getAttribute('aria-label')); }))`), [true, false, true], 'a sala feita: ✓ e ⭐, sem ◐');
    await c.js('Reino.UI.fecharTodas()');
    await c.avancar(300);

    // 7) prêmio retroativo: o evento com ela na Casa abre a festa, uma vez só
    await c.js("Reino.UI.fecharTodas(); Reino.Claude.limpar(); Reino.util.emit(Reino.EVENTOS.TRILHA_PERFEITA, { sala: 'lp10a2', materia: 'portugues4' })");
    assert.ok(await esperar(c, "!!document.querySelector('#telas > .tela-festa-trilha .cartao-trilha')", 4000), 'a festa retroativa não abriu');
    assert.strictEqual(await c.js("document.querySelectorAll('#telas > .tela-festa-trilha .cartao-trilha').length"), 3);
    await acionar(c, c.page.locator('.tela-festa-trilha .festa-solta .intro-botoes .btn-principal'), 'dom');
    await c.js("Reino.util.emit(Reino.EVENTOS.TRILHA_PERFEITA, { sala: 'lp10a2', materia: 'portugues4' })");
    await c.avancar(1500);
    assert.strictEqual(await c.js("!!document.querySelector('#telas > .tela-festa-trilha')"), false, 'a festa da mesma sala abriu de novo');

    assert.deepStrictEqual(await c.js('window.__q.erros'), [], 'erro na página');
    assert.deepStrictEqual(c.erros, [], 'erro de console');
  } finally { await c.fechar(); }
});
