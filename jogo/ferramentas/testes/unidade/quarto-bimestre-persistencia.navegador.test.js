// Aceite do 4º bimestre (Língua Portuguesa), parte 4: o que ela fez fica guardado (quarto-bimestre.md §8 e
// save-e-mescla.md §11). Abre pela estação uma sala com desenho guardado e escrita livre; acerta o desenho, escreve um
// texto que ainda não está certo, confere ("Quase!": já fica guardado, §8.2) e sai no meio pelo ✕: a sala não conta e o
// dinheiro não muda, mas o desenho e o texto ficam em `producoes` (no save e na cópia de segurança). Sai da Casa das
// Palavras andando (tapete do saguão), volta andando e recarrega a página (o save sintético no localStorage do contexto de
// teste): tudo igual. Reabre a sala: o desenho e o texto voltam nas questões, com o Conferir já ligado; ela conserta o
// texto no mesmo controle e termina a sala, que agora conta (dinheiro e texto novo guardado); recarrega de novo: igual.
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1); tablet. Sem erro de console.
// Rodar (da raiz): npm run unidade -- --so quarto-bimestre-persistencia
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');
const { preparar, respostas, acionar, levarA, conferir, botaoDoRetorno, responderDaVez, esperar, tocarTile, andarAte, estacao } = require('./ajudantes/quarto-bimestre');

const estado = (c, sala) => c.js(`(function (P) { var e = P.estado(), s = e.salas['${sala}']; return { feita: !!(s && s.feita), reg: s || null, dinheiro: P.dinheiroTotal(),
  producoes: e.producoes, guardado: JSON.parse(localStorage.getItem(Reino.config.chaveSave)).producoes,
  copia: (JSON.parse(localStorage.getItem(Reino.config.chaveSave + '-novidades') || '{}').campos || {}).producoes }; })(Reino.Progresso)`);

// pela estação da Casa das Palavras (toque) até a 1ª questão
async function abrirSala(c, sala) {
  const e = await estacao(c, sala.id);
  await andarAte(c, e.tile.x, e.tile.y);
  await tocarTile(c, e.x, e.y);
  assert.ok(await esperar(c, 'Reino.Claude.dialogoAberto()', 8000), 'a estação não falou');
  await acionar(c, c.page.locator('#claude-balao .claude-acoes .btn-dialogo.principal'), 'toque');
  assert.ok(await esperar(c, "!!document.querySelector('.tela-missao .intro-sala')", 8000), 'a estação não abriu a sala');
  for (let i = 0; i <= sala.cartas; i++) await acionar(c, c.page.locator('.tela-missao footer.rodape-acao:not([hidden]) .btn-principal'), 'dom');
  assert.ok(await c.js("!!document.querySelector('.tela-missao .desafio')"), 'a sala não chegou às questões');
}
// sai da Casa das Palavras andando: tapete do saguão para o mapa; volta: porta da casa, direto no saguão
async function sairEVoltarAndando(c) {
  const saida = await c.js('Reino.Cena.atual().def.saida');
  await andarAte(c, saida.x, saida.y - 1);
  await tocarTile(c, saida.x, saida.y);
  assert.ok(await esperar(c, "__reino.cena() === 'mapa' && __reino.estado() === 'mapa'"), 'não saiu da Casa das Palavras');
  const porta = await c.js("Mapa.lugar('materia:portugues').porta");
  await c.avancar(800);
  await tocarTile(c, porta.x, porta.y);
  assert.ok(await esperar(c, "__reino.cena() === 'portugues' && __reino.estado() === 'interior'"), 'não entrou de novo na Casa das Palavras');
}
async function recarregar(c) {
  await c.page.reload();
  await c.page.waitForFunction(() => window.__reino && window.Reino && Reino.UI, null, { timeout: 30000 });
  for (let i = 0; i < 400 && !(await c.js("__reino.estado() === 'mapa' && !document.querySelector('#hud').hidden")); i++) await c.avancar(50);
  await c.avancar(1000);
  assert.strictEqual(await c.js('typeof window.__q'), 'undefined', 'a página não recarregou');
}

test('o que ela fez fica: saindo no meio depois de conferir, andando para fora e de volta, recarregando e terminando', async () => {
  const c = await abrirCenario({ tamanho: 'tablet', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'aceite-4bim-persistencia-')) });
  try {
    // a 1ª sala com um desenho guardado e, depois dele, uma escrita com regras (que pode estar errada)
    const sala = await c.js(`(function (m) {
      var s = m.salas.find(function (s) { var i = s.desafios.findIndex(function (d) { return d.tipo === 'desenho' && d.guardar; });
        return i >= 0 && s.desafios.slice(i).some(function (d) { return d.tipo === 'escrever' && (d.chaves || d.minFrases || d.maiusculas); }); });
      if (!s) return null;
      var dz = s.desafios.find(function (d) { return d.tipo === 'desenho' && d.guardar; });
      var es = s.desafios.slice(s.desafios.indexOf(dz)).find(function (d) { return d.tipo === 'escrever' && (d.chaves || d.minFrases || d.maiusculas); });
      return { id: s.id, cartas: (s.cartas || []).length, ids: s.desafios.map(function (d) { return d.id; }), desenho: dz.id, escrever: es.id };
    })(Reino.materia('portugues4'))`);
    assert.ok(sala, 'nenhuma sala com desenho guardado e escrita depois dele');
    console.log(`sala ${sala.id}: desenho ${sala.desenho}, escrita ${sala.escrever}`);
    const antes = await estado(c, sala.id);
    assert.ok(!antes.feita && Object.keys(antes.producoes).length === 0, 'a sala já feita ou produções no save sintético');

    // 1) acerta até a escrita, escreve errado, confere e sai pelo ✕
    await c.ir('portugues');
    await c.page.evaluate(preparar);
    await abrirSala(c, sala);
    for (const id of sala.ids.slice(0, sala.ids.indexOf(sala.escrever))) {
      const r = await responderDaVez(c, id, 'dom', { errar: false });
      assert.deepStrictEqual(r.problemas, [], id);
    }
    const resp = await c.page.evaluate(respostas, sala.escrever);
    await levarA(c, resp, resp.errada, 'dom');
    assert.strictEqual(await conferir(c, 'dom'), 'quase', 'o texto errado deu certo');
    await botaoDoRetorno(c, 'Tentar de novo', 'dom');
    await acionar(c, c.page.locator('.tela-missao .btn-sair'), 'toque');
    assert.ok(await esperar(c, "!!document.querySelector('.tela-confirmar .btn-principal')", 4000), 'sem a pergunta de sair');
    await acionar(c, c.page.locator('.tela-confirmar .btn-principal'), 'toque');
    assert.ok(await esperar(c, "!Reino.UI.temTela() && __reino.cena() === 'portugues'", 6000), 'não saiu da sala');
    const meio = await estado(c, sala.id);
    assert.strictEqual(meio.feita, false, 'sair no meio não conta a sala');
    assert.strictEqual(meio.dinheiro, antes.dinheiro, 'sair no meio não dá dinheiro');
    assert.strictEqual(meio.producoes[sala.escrever] && meio.producoes[sala.escrever].texto, resp.errada, 'o texto conferido não ficou guardado');
    assert.ok(meio.producoes[sala.desenho] && /^[0-8]{576}$/.test(meio.producoes[sala.desenho].px), 'o desenho certo não ficou guardado');
    assert.deepStrictEqual(meio.guardado, meio.producoes, 'producoes gravado no aparelho');
    assert.deepStrictEqual(meio.copia, meio.producoes, 'producoes na cópia de segurança (-novidades)');

    // 2) sai da Casa das Palavras e volta andando; recarrega: tudo igual
    await sairEVoltarAndando(c);
    await recarregar(c);
    const recarregado = await estado(c, sala.id);
    assert.strictEqual(recarregado.feita, false);
    assert.strictEqual(recarregado.dinheiro, meio.dinheiro);
    assert.deepStrictEqual(recarregado.producoes, meio.producoes, 'as produções depois de recarregar');

    // 3) reabre: o desenho e o texto voltam prontos; conserta o texto no mesmo controle e termina a sala
    await c.ir('portugues');
    await c.page.evaluate(preparar);
    await abrirSala(c, sala);
    for (const id of sala.ids) {
      // as questões sem produção guardada começam em branco; as com produção (o desenho, o texto e outra escrita
      // acertada antes) voltam com ela
      if (!recarregado.producoes[id]) {
        const r = await responderDaVez(c, id, 'dom', { errar: false });
        assert.deepStrictEqual(r.problemas, [], id + ' (de novo)');
        continue;
      }
      await c.avancar(200);
      const volta = await c.js(`(function (a, b) { var v = a.ctrl.valor(); return { id: a.d.id, ligado: !b.disabled, px: v && v.px, texto: typeof v === 'string' ? v : null }; })(
        window.__q.atual, document.querySelector('.tela-missao .btn-conferir'))`);
      assert.strictEqual(volta.id, id);
      assert.ok(volta.ligado, `${id}: o guardado voltou sem ligar o Conferir`);
      const g = recarregado.producoes[id];
      if (g.px) assert.strictEqual(volta.px, g.px, `${id}: o desenho guardado não voltou`);
      else assert.strictEqual(volta.texto, g.texto, `${id}: o texto guardado não voltou`);
      if (id === sala.escrever) { assert.strictEqual(g.texto, resp.errada); await levarA(c, resp, resp.certa, 'dom'); }
      assert.strictEqual(await conferir(c, 'dom'), 'certo', id + ' depois de voltar');
      await botaoDoRetorno(c, 'Continuar|Terminar', 'dom');
    }
    assert.ok(await c.js("!!document.querySelector('.tela-missao .fim-sala')"), 'a sala reaberta não terminou');
    await c.js("Reino.UI.fecharTodas(); document.body.classList.remove('em-missao')");
    await c.avancar(600);
    const fim = await estado(c, sala.id);
    assert.ok(fim.feita, 'terminada, a sala conta');
    assert.strictEqual(Math.round((fim.dinheiro - antes.dinheiro) * 100), Math.round((await c.js("Reino.Progresso.valorSala(Reino.materia('portugues4'))")) * 100), 'o dinheiro da sala');
    assert.strictEqual(fim.producoes[sala.escrever].texto, resp.certa, 'o texto consertado ficou guardado');

    // 4) recarrega de novo: igual (o registro ganha como false os campos que faltavam, ex.: calma)
    await recarregar(c);
    const depois = await estado(c, sala.id);
    const reg = (r) => Object.assign({ perfeita: false, calma: false }, r);
    assert.deepStrictEqual(reg(depois.reg), reg(fim.reg), 'a sala depois de recarregar');
    assert.strictEqual(depois.dinheiro, fim.dinheiro, 'o dinheiro depois de recarregar');
    assert.deepStrictEqual(depois.producoes, fim.producoes, 'as produções depois de recarregar');
    assert.deepStrictEqual(c.erros, [], 'erro de console');
  } finally { await c.fechar(); }
});
