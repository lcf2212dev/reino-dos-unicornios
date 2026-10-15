// Aceite do 4º bimestre (Língua Portuguesa), parte 6: fumaça de regressão (o e2e já fotografa as telas). O 3º
// bimestre continua em espera: a sala, o treino e a prova de uma matéria arquivada e a guia do térreo do Museu
// (tocada de verdade) mostram o aviso do quarto bimestre e não abrem nada; e as outras áreas abrem sem erro: mapa,
// Castelo (prédio e tela), Estábulo com uma baia para cada unicórnio do álbum (as da Língua Portuguesa também),
// Escola (prédio e tela) e Loja (prédio e tela). Uma foto de cada em /tmp/reino-testes/aceite-4bim/ (não reprova).
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1); celular.
// Rodar (da raiz): npm run unidade -- --so quarto-bimestre-regressao
const { test } = require('node:test');
const assert = require('assert');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const FOTOS = path.join(PASTA_TESTES, 'aceite-4bim');

async function esperar(c, cond, msMax = 8000, passo = 200) {
  for (let t = 0; t <= msMax; t += passo) { if (await c.js(cond)) return true; await c.avancar(passo); }
  return false;
}
const foto = (c, nome) => c.foto('regressao-celular-' + nome).catch((e) => console.log(`foto ${nome} não saiu: ${e.message}`));
// o aviso do quarto bimestre aberto no balão: confere o texto, toca no "Ok!" e confere que nada abriu
async function aviso(c, onde) {
  assert.ok(await esperar(c, 'Reino.Claude.dialogoAberto()'), `${onde}: sem o aviso`);
  const texto = await c.js("document.querySelector('#claude-balao .claude-texto').textContent");
  assert.strictEqual(texto.replace(/\s+/g, ' ').trim(), await c.js('Reino.Bimestres.aviso'), `${onde}: outro texto no balão`);
  await c.page.locator('#claude-balao .claude-acoes .btn-dialogo.principal').tap();
  await c.avancar(900);
  assert.ok(await esperar(c, '!Reino.Claude.dialogoAberto()'), `${onde}: o aviso não fechou`);
  assert.strictEqual(await c.js("!!document.querySelector('.tela-missao, .tela-prova, .tela-treino')"), false, `${onde}: abriu a atividade arquivada`);
}

test('regressão: o 3º bimestre em espera e mapa, Castelo, Estábulo, Escola e Loja abrindo', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: FOTOS });
  try {
    // mapa
    assert.strictEqual(await c.js('__reino.estado()'), 'mapa');
    assert.strictEqual(await c.js("document.querySelector('#hud').hidden"), false);
    await foto(c, 'mapa');

    // o 3º bimestre em espera: sala, treino e prova de uma matéria arquivada
    const arq = await c.js("(function (m) { return { id: m.id, sala: m.salas[0].id, prova: Reino.provas.find(function (p) { return p.arquivada; }).id }; })(Reino.materias.find(function (m) { return m.arquivada; }))");
    await c.js(`void Reino.Missao.iniciar(Reino.materia('${arq.id}'), Reino.materia('${arq.id}').salas[0])`);
    await aviso(c, 'sala ' + arq.sala);
    await c.js(`void Reino.NPCs.executar({ tipo: 'treino', materia: '${arq.id}' })`);
    await aviso(c, 'treino de ' + arq.id);
    await c.js(`void Reino.NPCs.executar({ tipo: 'prova', prova: '${arq.prova}' })`);
    await aviso(c, 'prova ' + arq.prova);
    // a guia do térreo do Museu (História arquivada), tocada de verdade
    await c.ir('museu');
    const guia = await c.js("__reino.npcs().find(function (n) { return n.id === 'memoria'; })");
    assert.ok(guia, 'a guia do Museu');
    await c.js(`Jogador.irPara(${guia.x - 1}, ${guia.y})`);
    assert.ok(await esperar(c, `(function (t) { return t.x === ${guia.x - 1} && t.y === ${guia.y} && !Jogador.caminho.length; })(Jogador.tile())`, 20000, 300));
    const p = await c.js(`__reino.paraTela(${guia.x * 16 + 8}, ${guia.y * 16})`);
    await c.page.touchscreen.tap(p.x, p.y);
    await aviso(c, 'guia do Museu');

    // Castelo, Escola e Loja: o prédio e a tela de cada um. O Castelo já tem o treino da Língua Portuguesa; a Escola,
    // só com as provas do 3º bimestre (arquivadas), mostra o aviso do quarto bimestre
    const TELAS = { castelo: /Castelo da Medalha[\s\S]*Língua Portuguesa/, escola: null, loja: /Loja das Fadas/ };
    for (const lugar of Object.keys(TELAS)) {
      await c.ir(lugar);
      assert.strictEqual(await c.js('__reino.cena()'), lugar, `não entrou: ${lugar}`);
      assert.strictEqual(await c.js('__reino.estado()'), 'interior');
      await foto(c, lugar);
      await c.ir('mapa');
      await c.tela(lugar);
      const texto = await c.js("(function (t) { return t ? t.textContent.replace(/\\u00ad/g, '').replace(/\\s+/g, ' ') : ''; })(document.querySelector('#telas .tela:last-child'))");
      if (TELAS[lugar]) assert.match(texto, TELAS[lugar], `a tela ${lugar}`);
      else assert.ok(texto.indexOf(await c.js('Reino.Bimestres.aviso')) >= 0, 'a Escola sem o aviso do quarto bimestre: ' + texto);
      await foto(c, 'tela-' + lugar);
      await c.js('Reino.UI.fecharTodas()');
      await c.avancar(400);
    }
    assert.ok(await c.js("Reino.provas.filter(function (p) { return p.arquivada; }).every(function (p) { return Reino.Bimestres.acaoEmEspera({ tipo: 'prova', prova: p.id }); })"));

    // Estábulo: uma baia para cada unicórnio do álbum, as da Língua Portuguesa também
    await c.ir('estabulo');
    assert.strictEqual(await c.js('__reino.cena()'), 'estabulo');
    const baias = await c.js(`(function (objs, todos) {
      var idx = objs.filter(function (o) { return o.tipo === 'estabulo-baia'; }).map(function (o) { return o.var.indice; }).sort(function (a, b) { return a - b; });
      return { n: idx.length, seguidas: idx.every(function (v, i) { return v === i; }), todos: todos.length,
        lp: todos.map(function (u, i) { return u.id.indexOf('lp') === 0 || Reino.materia('portugues4').unicornios.some(function (x) { return x.id === u.id; }) ? i : -1; }).filter(function (i) { return i >= 0; }) };
    })(Reino.Cena.atual().def.objetos, Reino.Unicornios.todos(Reino.Progresso.estado().corInicial))`);
    assert.strictEqual(baias.n, baias.todos, 'uma baia por unicórnio do álbum');
    assert.ok(baias.seguidas, 'baias 0..n-1');
    assert.strictEqual(baias.lp.length, await c.js("Reino.materia('portugues4').unicornios.length"), 'as baias dos unicórnios da Língua Portuguesa');
    await c.js(`Jogador.posicionar(17, 4)`);
    await c.avancar(800);
    await foto(c, 'estabulo-baias');
    await c.ir('mapa');
    await c.tela('estabulo');
    assert.ok(await c.js("!!document.querySelector('.tela-estabulo')"), 'a tela do Estábulo');
    await c.js('Reino.UI.fecharTodas()');
    await c.avancar(400);
    assert.deepStrictEqual(c.erros, [], 'erro de console');
  } finally { await c.fechar(); }
});
