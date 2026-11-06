// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, ?debug=1&congelar=1): a Teleportadora
// (docs/contratos/vila.md §6). No mapa ela ocupa config.vila.teleportadoraMapa (e o tile da direita), sólida; tocar
// nela abre o balão dela (oi e convite); "Vamos! ✨" leva à Vila em config.vila.chegadaVila; na Vila, o convite de
// volta leva à praça em config.vila.chegadaCidade. O toque no cofre continua valendo (o toque é encadeado).
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const esperarJogo = (page) => page.waitForFunction(() => window.__congelar && window.Reino && Reino.Cena && Reino.Teleportadora && window.Jogador, null, { timeout: 30000 });
const avancar = (page, ms) => page.evaluate((m) => window.__congelar.avancar(m), ms);
const semEmoji = (t) => t.replace(/[^\p{L}\p{N}\p{P}\s]/gu, '').replace(/\s+/g, ' ').trim();

test('Teleportadora: sólida no mapa, balão, viagem para a Vila e de volta à praça', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  try {
    const a = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await esperarJogo(a.page);
    const save = (await a.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await a.context.close();

    const { page } = await abrir({ browser, url: servidor.url, save, query: '?debug=1&congelar=1' });
    await esperarJogo(page);
    await page.waitForFunction(() => Reino.Cena.estado() === 'mapa', null, { timeout: 30000 });
    await page.evaluate(() => Reino.Claude.limpar());

    // no mapa: sólida, a chegada livre, o desenho pronto e o toque nela (e no cofre)
    const mapa = await page.evaluate(() => {
      var c = Reino.config.vila, t = c.teleportadoraMapa, T = Mapa.T, A = Reino.TeleportadoraArte;
      var alvo = Reino.Cena.mapa.alvoEm(t.x * T + 8, t.y * T + 4);
      var cofre = Mapa.CIDADE.objetos.find(function (o) { return o.tipo === 'cofre'; });
      var alvoCofre = Mapa.alvoObjeto(cofre.x * T + 20, cofre.y * T + 20);
      var r = A.retrato();
      return {
        solida: Mapa.solido(t.x, t.y), solidaDireita: Mapa.solido(t.x + 1, t.y),
        chegadaLivre: !Mapa.solido(c.chegadaCidade.x, c.chegadaCidade.y),
        alvo: alvo && alvo.id, alvoLivre: alvo && !Mapa.solido(alvo.tile.x, alvo.tile.y),
        cofre: alvoCofre && alvoCofre.id,
        perto: (Mapa.alvoObjetoPerto({ x: t.x - 1, y: t.y }, { x: 1, y: 0 }) || {}).id,
        retrato: [r.width, r.height], imagem: [A.parado().width, A.parado().height],
        pontos: A.pontos(A.fase(1234, true)).length, parado: A.pontos(A.PARADO).length,
        voz: Reino.config.vozes['npc-teleportadora'] && Reino.config.vozes['npc-teleportadora'].voz,
        falas: Reino.Teleportadora.falas().map(function (f) { return f.voz + '|' + f.pacote; }),
      };
    });
    assert.ok(mapa.solida && mapa.solidaDireita, 'os 2 tiles dela são sólidos');
    assert.ok(mapa.chegadaLivre, 'a chegada da cidade é andável');
    assert.strictEqual(mapa.alvo, 'teleportadora', 'tocar nela acha a Teleportadora');
    assert.ok(mapa.alvoLivre, 'ela para num tile livre ao lado');
    assert.strictEqual(mapa.cofre, 'cofre', 'o cofre continua tocável');
    assert.strictEqual(mapa.perto, 'teleportadora', 'Enter ao lado dela também vale');
    assert.deepStrictEqual(mapa.retrato, [21, 21], 'retrato do balão');
    assert.deepStrictEqual(mapa.imagem, [48, 46], 'imagem dela');
    assert.ok(mapa.pontos === 0 && mapa.parado === 0, 'sem aura: ela fica parada (pedido do Leandro, 06/11)');
    assert.ok(mapa.voz, 'voz npc-teleportadora registrada');
    assert.ok(mapa.falas.length === 3 && mapa.falas.every((f) => f === 'npc-teleportadora|geral'), 'falas com a voz dela no pacote geral');

    // o balão: oi (1ª vez) e o convite
    const texto = () => page.evaluate(() => document.querySelector('#claude-balao .claude-texto').textContent).then(semEmoji);
    await page.evaluate(() => {
      var t = Reino.config.vila.teleportadoraMapa;
      window.__viagem = Reino.Cena.mapa.alvoEm(t.x * Mapa.T + 8, t.y * Mapa.T + 4).agir();
    });
    await page.waitForFunction(() => { var b = document.querySelector('#claude-balao'); return b && !b.hidden; });
    assert.strictEqual(await texto(), 'Oi! Eu sou a Teleportadora.');
    await page.click('#claude-balao .claude-acoes :is(.btn-ok-claude, .btn-dialogo.principal)');
    await page.waitForFunction(() => /Vila/.test(document.querySelector('#claude-balao .claude-texto').textContent));
    assert.strictEqual(await texto(), 'Quer ir para a Vila Arco-Íris?');
    const temVila = await page.evaluate(() => !!(Reino.interiores || []).find(function (d) { return d.id === 'vila'; }));
    await page.click('#claude-balao .claude-acoes :is(.btn-ok-claude, .btn-dialogo.principal)');
    for (let i = 0; i < 40; i++) await avancar(page, 100);
    if (!temVila) {
      // antes da Vila existir (outra frente), Cena.irPara('vila') não faz nada
      assert.strictEqual(await page.evaluate(() => Reino.Cena.atual().tipo), 'mapa');
      return;
    }
    const naVila = await page.evaluate(() => ({ id: Reino.Cena.atual().id, tile: Jogador.tile(), quer: Reino.config.vila.chegadaVila }));
    assert.strictEqual(naVila.id, 'vila', 'chegou na Vila');
    assert.deepStrictEqual(naVila.tile, { x: naVila.quer.x, y: naVila.quer.y }, 'na chegada da Vila');

    // na Vila: o convite de volta, sem o oi
    await page.evaluate(() => { window.__volta = Reino.Teleportadora.tocar('cidade'); });
    await page.waitForFunction(() => { var b = document.querySelector('#claude-balao'); return b && !b.hidden && /cidade/.test(b.textContent); });
    assert.strictEqual(await texto(), 'Quer voltar para a cidade?');
    await page.click('#claude-balao .claude-acoes :is(.btn-ok-claude, .btn-dialogo.principal)');
    for (let i = 0; i < 40; i++) await avancar(page, 100);
    const volta = await page.evaluate(() => ({ tipo: Reino.Cena.atual().tipo, tile: Jogador.tile(), quer: Reino.config.vila.chegadaCidade }));
    assert.strictEqual(volta.tipo, 'mapa', 'voltou ao mapa');
    assert.deepStrictEqual(volta.tile, { x: volta.quer.x, y: volta.quer.y }, 'na chegada da praça');
  } finally {
    await browser.close();
    servidor.parar();
  }
});
