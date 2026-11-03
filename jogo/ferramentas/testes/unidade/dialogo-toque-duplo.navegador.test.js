// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, ?debug=1&congelar=1): um toque duplo no
// "Continuar →" do balão de um NPC não pode pular a página seguinte nem tocar no botão do balão que entra no
// lugar. Hoje o 1º clique fecha o balão e o próximo (Continuar ou "Vamos! ✨") aparece na hora no mesmo lugar:
// o 2º clique do toque duplo acerta o botão novo (pula a página; no fim do diálogo, começa a sala sem ela ler).
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const esperarJogo = (page) => page.waitForFunction(() => window.__congelar && window.Reino && Reino.NPCs && Reino.Interiores, null, { timeout: 30000 });

test('toque duplo no "Continuar →" avança só uma página e não aciona o botão seguinte', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  try {
    const a = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await esperarJogo(a.page);
    const save = (await a.page.evaluate(`(${gerarSaves.toString()})()`)).inicio;
    await a.context.close();

    const { page } = await abrir({ browser, url: servidor.url, save, query: '?debug=1&congelar=1' });
    await esperarJogo(page);
  await require('./ajudantes/terceiro-bimestre').noNavegador(page);
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      Reino.Claude.limpar();
      // um NPC de sala com a apresentação em mais de uma página (a 1ª conversa da sessão). Os NPCs publicados de
      // sala só anunciam a sala numa página (no 4º bimestre as salas são estações), e com ?congelar=1 o NPC do jogo
      // é imutável: o teste usa uma cópia de um NPC de prédio, com a ação de uma sala de verdade e a saudação de
      // duas páginas.
      var achado = null;
      var m = Reino.materias.find(function (x) { return x.salas && x.salas.length; });
      Reino.interiores.some(function (d) {
        return (d.npcs || []).some(function (n0) {
          var n = Object.assign({}, n0, {
            acao: { tipo: 'sala', materia: m.id, sala: m.salas[0].id },
            falas: { oi: ['Olá! Vamos conversar?', 'Esta é a segunda página.'] },
          });
          var pags = [].concat.apply([], Reino._npcs.falas(n, 'oi').map(function (t) { return Reino._npcs.paginas([t]); }));
          if (pags.length >= 2) { achado = { d: d, n: n, pags: pags }; return true; }
          return false;
        });
      });
      window.__salas = [];
      Reino.Missao.iniciar = function (m, s, fim) { window.__salas.push(s.id); };
      Reino.NPCs.interagir(achado.n, { interior: achado.d, cena: null });
      return { npc: achado.n.id, pags: achado.pags.map(function (p) { return p.join(' '); }) };
    });
    // o emoji do balão vira ícone pixel art (fora do textContent): compara só letras, números e pontuação
    const semEmoji = (t) => t.replace(/[^\p{L}\p{N}\p{P}\s]/gu, '').replace(/\s+/g, ' ').trim();
    info.pags = info.pags.map(semEmoji);
    const texto = () => page.evaluate(() => document.querySelector('#claude-balao .claude-texto').textContent).then(semEmoji);
    await page.waitForFunction(() => { var b = document.querySelector('#claude-balao'); return b && !b.hidden; });
    assert.strictEqual(await texto(), info.pags[0], 'começa na 1ª página');
    await page.dblclick('#claude-balao .claude-acoes .btn-dialogo.principal');
    await page.waitForTimeout(100);
    assert.strictEqual(await texto(), info.pags[1], 'o toque duplo leva só à 2ª página (' + info.npc + ')');
    assert.deepStrictEqual(await page.evaluate(() => window.__salas), [], 'nenhuma sala começou');
    // o teclado não passa pela guarda: Enter na 2ª página avança na hora (o relógio congelado não andou,
    // a guarda do toque duplo ainda está de pé); depois dela vem a 3ª página ou o convite do NPC
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    const depois = await texto();
    assert.ok(await page.evaluate(() => !document.querySelector('#claude-balao').hidden), 'o balão seguinte abriu');
    if (info.pags.length >= 3) assert.strictEqual(depois, info.pags[2], 'Enter leva à 3ª página na hora');
    else assert.notStrictEqual(depois, info.pags[1], 'Enter sai da 2ª página na hora');
  } finally {
    await browser.close();
    servidor.parar();
  }
});
