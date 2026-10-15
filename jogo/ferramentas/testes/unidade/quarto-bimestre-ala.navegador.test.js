// Aceite do 4º bimestre (Língua Portuguesa), parte 1: o térreo da Casa das Palavras, no jogo de verdade, nos 3 tamanhos
// (docs/contratos/quarto-bimestre.md §7). Do mapa: toca a porta da casa e chega ao saguão; anda pelos 7 cômodos (uma
// foto de cada em /tmp/reino-testes/aceite-4bim/; foto não reprova); cada estação abre a missão da sala certa por
// toque (celular e tablet) ou clique (notebook), a 1ª pelo teclado; os 2 púlpitos abrem o livro na aba certa; os 4
// NPCs (a guia no saguão e o anfitrião de cada galeria) falam com o nome e a apresentação deles; sai pelo
// tapete do saguão na frente da porta; o menu Lugares tem UMA linha da Casa das Palavras, a 1ª, com as salas da
// Língua Portuguesa (sem "Novo!" depois da visita), e o "Ir" dela entra no saguão. O Museu fica sem escada. Sem erro de
// console. As salas vêm de Reino.materia('portugues4').salas (as que existirem).
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1).
// Rodar (da raiz): npm run unidade -- --so quarto-bimestre-ala
const { test } = require('node:test');
const assert = require('assert');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');
const { esperar, tocarTile, andarAte } = require('./ajudantes/quarto-bimestre');

const FOTOS = path.join(PASTA_TESTES, 'aceite-4bim');
// a volta pela casa: do saguão às galerias e ateliês, sempre por portas de vizinhos
const VOLTA = ['lp-saguao', 'lp-galeria10', 'lp-atelie10', 'lp-atelie11', 'lp-galeria11', 'lp-galeria12', 'lp-atelie12'];
const BALAO_BOTAO = "#claude-balao .claude-acoes .btn-dialogo.principal, #claude-balao .claude-acoes .btn-ok-claude";

// anota cada missão aberta (matéria/sala), sem mudar nada do jogo
const PREPARO = `(function () {
  if (window.__lp) return;
  var ini = Reino.Missao.iniciar;
  window.__lp = { salas: [] };
  Reino.Missao.iniciar = function (m, s) { window.__lp.salas.push(m.id + '/' + s.id); return ini.apply(this, arguments); };
})()`;
// estações e púlpitos da casa, com a pegada e o cômodo de cada um
const OBJETOS = `(function (cena) {
  var def = cena.def;
  function comodo(x, y) { var c = def.comodos.find(function (c) { var r = c.rect; return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h; }); return c ? c.id : null; }
  return cena._objetos.filter(function (it) { return it.o.tipo === 'lp-estacao' || it.o.tipo === 'lp-pulpito'; }).map(function (it) {
    return { tipo: it.o.tipo, x: it.o.x, y: it.o.y, acao: it.o.acao, chave: it.o.chave, comodo: comodo(it.o.x, it.o.y) };
  });
})(Reino.Cena.atual())`;

const semTela = (c) => esperar(c, "!Reino.UI.temTela() && !Reino.Claude.dialogoAberto() && __reino.estado() === 'interior'", 8000);
// o balão do objeto: toca no botão principal até o "Ok!" da última página (o 2º toque no mesmo lugar só vale
// depois da guarda contra o toque duplo, UI.segurarToques: 800 ms)
async function okDoBalao(c) {
  for (let i = 0; i < 6; i++) {
    assert.ok(await esperar(c, 'Reino.Claude.dialogoAberto()', 8000), 'o balão do objeto não abriu');
    const b = c.page.locator(BALAO_BOTAO).first();
    const texto = await b.textContent();
    if (c.tamanho === 'notebook') await b.click(); else await b.tap();
    await c.avancar(900);
    if (!/Continuar/.test(texto)) return;
  }
  assert.fail('o balão não termina');
}
// a missão aberta é a da sala esperada (registro e título); sai pelo ✕ e "Sair"
async function conferirMissao(c, salaId, nome, como) {
  assert.ok(await esperar(c, "!!document.querySelector('.tela-missao')", 8000), `a estação de ${salaId} (${como}) não abriu a missão`);
  const aberta = await c.js('window.__lp.salas[window.__lp.salas.length - 1]');
  assert.strictEqual(aberta, 'portugues4/' + salaId, `a estação de ${salaId} abriu outra sala (${como})`);
  const titulo = await c.js("document.querySelector('.tela-missao .missao-titulo').textContent.replace(/\\u00ad/g, '')");
  assert.ok(titulo.indexOf(nome) >= 0, `título da missão "${titulo}" sem o nome da sala "${nome}"`);
  await c.page.locator('.tela-missao .btn-sair').click();
  assert.ok(await esperar(c, "!!document.querySelector('.tela-confirmar .btn-principal')", 4000), 'sem a pergunta de sair');
  await c.page.locator('.tela-confirmar .btn-principal').click();
  assert.ok(await semTela(c), `a missão de ${salaId} não fechou`);
  await c.avancar(700);   // o dedo que tocou o "Sair" não vale no canvas logo depois (UI.toqueSegurado)
}
// o tile onde ela para para usar o objeto (o mesmo cálculo do toque) e o objeto que o toque acha
const alvoDo = (c, o) => c.js(`(function (a) { return a && { tipo: a.tipo, tile: a.tile, olhar: a.olhar, chave: a.objeto && a.objeto.chave }; })(Reino.Cena.atual().alvoEm(${o.x * 16 + 8}, ${o.y * 16 + 8}))`);

async function abrirEstacao(c, o, sala, porTeclado) {
  const a = await alvoDo(c, o);
  assert.ok(a && a.tipo === 'objeto' && a.chave === 'lp-sala-' + sala.id, `o toque na estação de ${sala.id} acha outra coisa: ${JSON.stringify(a)}`);
  await andarAte(c, a.tile.x, a.tile.y);
  if (porTeclado) {
    await c.js(`Jogador.virar(${a.olhar.x}, ${a.olhar.y})`);
    await c.tecla('Enter');
    assert.ok(await esperar(c, 'Reino.Claude.dialogoAberto()', 8000), 'Enter na frente da estação não abriu o balão');
    // pelo teclado o foco vai ao "Ok!": Enter de novo
    for (let i = 0; i < 4 && !(await c.js("!!document.activeElement && document.activeElement.matches('.claude-acoes button:not(.btn-ouvir-claude)')")); i++) await c.tecla('Tab');
    await c.tecla('Enter');
    await c.avancar(300);
  } else {
    await tocarTile(c, o.x, o.y);
    await okDoBalao(c);
  }
  await conferirMissao(c, sala.id, sala.nome, porTeclado ? 'teclado' : c.tamanho === 'notebook' ? 'clique' : 'toque');
}

// conversa: toca no NPC, o balão abre com o nome e a 1ª fala dele; "Continuar" até os botões e "Agora não"
async function conversar(c, n) {
  const a = await c.js(`(function (a) { return a && { tipo: a.tipo, tile: a.tile, id: a.npc && a.npc.id }; })(Reino.Cena.atual().alvoEm(${n.x * 16 + 8}, ${n.y * 16 + 8}))`);
  assert.ok(a && a.tipo === 'npc' && a.id === n.id, `o toque em ${n.id} acha outra coisa: ${JSON.stringify(a)}`);
  await andarAte(c, a.tile.x, a.tile.y);
  await tocarTile(c, n.x, n.y);
  assert.ok(await esperar(c, 'Reino.Claude.dialogoAberto()', 8000), `${n.id} não falou`);
  const balao = await c.js("document.querySelector('#claude-balao').textContent.replace(/\\u00ad/g, '').replace(/\\s+/g, ' ')");
  const oi = n.oi.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').trim();
  assert.ok(balao.indexOf(n.nome) >= 0 && balao.indexOf(oi) >= 0, `o balão de ${n.id} sem o nome "${n.nome}" ou a fala "${oi}": ${balao}`);
  for (let i = 0; i < 8 && (await c.js('Reino.Claude.dialogoAberto()')); i++) {
    const nao = c.page.locator('#claude-balao .claude-acoes button', { hasText: 'Agora não' });
    const b = (await nao.count()) ? nao.first() : c.page.locator(BALAO_BOTAO).first();
    if (c.tamanho === 'notebook') await b.click(); else await b.tap();
    await c.avancar(900);
  }
  assert.ok(await semTela(c), `a conversa com ${n.id} não fechou`);
  await c.avancar(700);
}

async function abrirPulpito(c, o) {
  const a = await alvoDo(c, o);
  assert.ok(a && a.tipo === 'objeto', 'o toque no púlpito acha outra coisa: ' + JSON.stringify(a));
  await andarAte(c, a.tile.x, a.tile.y);
  await tocarTile(c, o.x, o.y);
  await okDoBalao(c);
  assert.ok(await esperar(c, "!!document.querySelector('.livro-aba[aria-selected=\"true\"]')", 8000), `o púlpito ${o.acao.livro} não abriu o livro com abas`);
  assert.strictEqual(await c.js("document.querySelector('.livro-aba[aria-selected=\"true\"]').getAttribute('data-livro')"), o.acao.livro, 'aba errada no púlpito');
  await c.tecla('Escape');
  assert.ok(await semTela(c), 'o livro não fechou com Esc');
  await c.avancar(700);
}

for (const tamanho of ['celular', 'tablet', 'notebook']) {
  test(`Língua Portuguesa na Casa das Palavras no ${tamanho}: entrar, 7 cômodos, estações, púlpitos, sair e "Ir"`, async () => {
    const c = await abrirCenario({ tamanho, save: 'completo', pasta: FOTOS });
    try {
      await c.js(PREPARO);
      const M = await c.js("(function (m) { return m && { salas: m.salas.map(function (s) { return { id: s.id, nome: s.nome }; }), lugar: m.lugar }; })(Reino.materia('portugues4'))");
      assert.ok(M && M.salas.length >= 17, 'a matéria portugues4 não está no jogo');
      assert.deepStrictEqual([M.lugar.dentro, M.lugar.interior], ['materia:portugues', 'portugues']);
      // o Museu (História arquivada) como era: sem escada nem andar da Língua Portuguesa
      assert.deepStrictEqual(await c.js("[!!Reino.Interiores.def('museu').escadas, !!Reino.Interiores.def('museu-lp')]"), [false, false], 'o Museu com a ala');

      // do mapa: na frente da Casa das Palavras, toca a porta e entra no saguão
      const porta = await c.js("Mapa.lugar('materia:portugues').porta");
      await c.js(`Jogador.posicionar(${porta.x}, ${porta.y + 2}); Jogador.virar(0, -1)`);
      await c.avancar(800);
      await tocarTile(c, porta.x, porta.y);
      assert.ok(await esperar(c, "__reino.cena() === 'portugues' && __reino.estado() === 'interior'"), 'o toque na porta não entrou na Casa das Palavras');
      const def = await c.js(`(function (d) { function comodo(x, y) { var c = d.comodos.find(function (c) { var r = c.rect; return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h; }); return c ? c.id : null; }
        return { spawn: d.spawn, saida: d.saida, escadas: d.escadas, comodos: d.comodos.map(function (c) { return { id: c.id, rect: c.rect }; }),
          npcs: d.npcs.map(function (n) { return { id: n.id, nome: n.nome, x: n.x, y: n.y, oi: (n.falas.oi || [''])[0], comodo: comodo(n.x, n.y) }; }) }; })(Reino.Cena.atual().def)`);
      assert.deepStrictEqual(await c.js('Jogador.tile()'), def.spawn, 'entrou fora do spawn');
      assert.ok(!def.escadas && def.saida, 'o saguão tem o tapete de saída e nenhuma escada');
      assert.deepStrictEqual(def.comodos.map((x) => x.id).sort(), VOLTA.slice().sort(), 'os cômodos da casa mudaram (atualize VOLTA)');
      assert.deepStrictEqual(def.npcs.map((n) => n.id).sort(), ['lp-celeste', 'lp-leticia', 'lp-pingo', 'lp-sol'], 'os NPCs da casa');

      // cada sala da matéria tem uma estação, e cada estação é de uma sala dela
      const objs = await c.js(OBJETOS);
      const estacoes = objs.filter((o) => o.tipo === 'lp-estacao');
      assert.deepStrictEqual(estacoes.map((o) => o.acao.sala).sort(), M.salas.map((s) => s.id).sort(), 'estações x salas');
      assert.ok(estacoes.every((o) => o.acao.tipo === 'sala' && o.acao.materia === 'portugues4'));

      // a volta: anda até cada cômodo (pelas portas), fotografa e abre as estações dele
      let feitas = 0, teclado = false, falaram = 0;
      for (const id of VOLTA) {
        const r = def.comodos.find((x) => x.id === id).rect;
        const meio = await c.js(`Reino.Cena.atual().maisPerto(${r.x + Math.floor(r.w / 2)}, ${r.y + Math.floor(r.h / 2)})`);
        await andarAte(c, meio.x, meio.y);
        await c.foto(`${tamanho}-${id}`).catch((e) => console.log(`foto ${tamanho}-${id} não saiu: ${e.message}`));
        for (const n of def.npcs.filter((x) => x.comodo === id)) { await conversar(c, n); falaram++; }
        // as estações do cômodo na ordem do livro, lidas na tela como um livro: fileira de cima primeiro, da esquerda
        // para a direita (o ponto de cada uma na página, com a câmera onde ela está)
        const naTela = [];
        for (const o of estacoes.filter((x) => x.comodo === id)) naTela.push({ sala: o.acao.sala, p: await c.js(`__reino.paraTela(${o.x * 16 + 8}, ${o.y * 16 + 8})`) });
        naTela.sort((a, b) => (Math.abs(a.p.y - b.p.y) > 4 ? a.p.y - b.p.y : a.p.x - b.p.x));
        const lidas = naTela.map((x) => x.sala);
        assert.deepStrictEqual(lidas, M.salas.map((x) => x.id).filter((x) => lidas.includes(x)), `ordem das estações na tela em ${id}`);
        for (const o of objs.filter((x) => x.comodo === id)) {
          if (o.tipo === 'lp-pulpito') { await abrirPulpito(c, o); continue; }
          const sala = M.salas.find((s) => s.id === o.acao.sala);
          await abrirEstacao(c, o, sala, !teclado);
          teclado = true; feitas++;
        }
      }
      assert.strictEqual(feitas, M.salas.length, 'nem toda estação foi aberta');
      assert.strictEqual(falaram, def.npcs.length, 'nem todo NPC falou');
      assert.strictEqual(objs.filter((o) => o.tipo === 'lp-pulpito').length, 2, 'os 2 púlpitos');

      // sai pelo tapete do saguão: aparece na frente da porta da casa
      await andarAte(c, def.saida.x, def.saida.y - 1);
      await tocarTile(c, def.saida.x, def.saida.y);
      assert.ok(await esperar(c, "__reino.cena() === 'mapa' && __reino.estado() === 'mapa'"), 'não saiu da Casa das Palavras');
      assert.deepStrictEqual(await c.js('Jogador.tile()'), { x: porta.x, y: porta.y + 1 }, 'saiu longe da porta da casa');

      // menu Lugares: uma linha só da Casa das Palavras, a 1ª (matéria ativa), com as salas da Língua Portuguesa;
      // já visitada, sem o "Novo!"; o "Ir" dela anda até a casa e entra no saguão
      await c.tela('lugares');
      const linhas = await c.js("[...document.querySelectorAll('.sala-card')].map(function (b) { return b.textContent.replace(/\\u00ad/g, '').replace(/\\s+/g, ' '); })");
      const casa = linhas.map((t, i) => (t.indexOf('Casa das Palavras') >= 0 ? i : -1)).filter((i) => i >= 0);
      assert.deepStrictEqual(casa, [0], 'a Casa das Palavras: uma linha só, a primeira do menu');
      assert.ok(linhas[0].indexOf(`de ${M.salas.length} salas`) >= 0 && linhas[0].indexOf('em breve') < 0, 'a linha da casa sem as salas da Língua Portuguesa: ' + linhas[0]);
      assert.ok(linhas[0].indexOf('Dentro') < 0 && linhas[0].indexOf('Novo!') < 0, 'a linha da casa com "Dentro" ou "Novo!" depois da visita: ' + linhas[0]);
      await c.page.locator('.sala-card').nth(0).click();
      assert.ok(await esperar(c, "__reino.cena() === 'portugues' && __reino.estado() === 'interior'", 40000, 500), 'o "Ir" não entrou na Casa das Palavras');
      assert.deepStrictEqual(await c.js('Jogador.tile()'), def.spawn);
      assert.deepStrictEqual(c.erros, [], 'erro de console');
    } finally { await c.fechar(); }
  });
}
