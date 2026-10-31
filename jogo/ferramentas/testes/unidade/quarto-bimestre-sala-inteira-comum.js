// Comum às partes do aceite das salas inteiras do 4º bimestre (quarto-bimestre-sala-inteira*.navegador.test.js): uma
// parte por capítulo, para rodarem ao mesmo tempo. O que cada parte confere está no cabeçalho de
// quarto-bimestre-sala-inteira.navegador.test.js.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');
const { preparar, acionar, responderDaVez, esperar, tocarTile, andarAte, irAEstacao, seguirSala } = require('./ajudantes/quarto-bimestre');

const sp = (x) => String(x).replace(/­/g, '').replace(/\s+/g, ' ').trim();

// a sala inteira, da estação na Casa das Palavras até os ovos chocados, e o que ela soma no progresso
async function jogarSala(c, salaId) {
  const sala = await c.js(`(function (s) { return { id: s.id, nome: s.nome, paginas: s.paginas, cartas: (s.cartas || []).length, ids: s.desafios.map(function (d) { return d.id; }) }; })(
    Reino.materia('portugues4').salas.find(function (s) { return s.id === '${salaId}'; }))`);
  const n = sala.ids.length;
  const nEtapas = await c.js(`Reino.etapasDaSala(Reino.materia('portugues4'), Reino.materia('portugues4').salas.find(function (s) { return s.id === '${salaId}'; })).length`);
  const antes = await c.js(`(function (P, m) { var e = P.estado(); return { dinheiro: P.dinheiroTotal(), valorSala: P.valorSala(m), ganhas: e.estrelas.ganhas,
    feita: !!(e.salas['${sala.id}'] && e.salas['${sala.id}'].feita), unis: Object.keys(e.unis),
    ovos: m.unicornios.filter(function (u) { return u.sala === '${sala.id}'; }).map(function (u) { return u.raridade + ':' + u.id; }).sort() }; })(Reino.Progresso, Reino.materia('portugues4'))`);
  assert.strictEqual(antes.feita, false);
  assert.deepStrictEqual(antes.ovos.map((x) => x.split(':')[0]), ['comum', 'raro'], 'a sala com 1 unicórnio comum e 1 raro');

  // na Casa das Palavras (o andar da estação): anda até a estação da sala, toca nela e no "Ok!"
  const e = await irAEstacao(c, sala.id);
  await andarAte(c, e.tile.x, e.tile.y);
  await tocarTile(c, e.x, e.y);
  assert.ok(await esperar(c, 'Reino.Claude.dialogoAberto()', 8000), 'a estação não falou');
  await acionar(c, c.page.locator('#claude-balao .claude-acoes .btn-dialogo.principal'), 'toque');
  await c.avancar(800);

  // a trilha das etapas (a intro da sala de livro)
  assert.ok(await esperar(c, "!!document.querySelector('.tela-missao .intro-sala .etapas-trilha')", 8000), 'sem a trilha da sala');
  const intro = sp(await c.js("document.querySelector('.tela-missao .intro-sala').textContent"));
  assert.ok(intro.indexOf(sp(sala.nome)) >= 0 && intro.indexOf(sp(sala.paginas)) >= 0, 'trilha sem o nome ou as páginas: ' + intro);
  assert.strictEqual(await c.js("document.querySelectorAll('.tela-missao .etapa-bolinha').length"), nEtapas, 'uma bolinha por etapa');

  // etapa por etapa: as cartas e as questões, na ordem do livro, todas certas de primeira e com calma, pelos toques
  const tipos = [], ids = [];
  const r = await seguirSala(c, async (id) => {
    const q = await responderDaVez(c, id, 'toque', { errar: false, calma: true });
    assert.deepStrictEqual(q.problemas, [], `${q.id} (${q.tipo})`);
    assert.ok(q.primeira, `${q.id}: sem a estrela de primeira`);
    tipos.push(q.tipo); ids.push(id);
  }, { modo: 'toque' });
  assert.strictEqual(r.fim, 'fimSala', 'a sala não terminou: ' + JSON.stringify(r));
  assert.deepStrictEqual(ids, sala.ids, 'as questões na ordem do livro');
  assert.strictEqual(r.cartas.length, sala.cartas, 'todas as cartas, cada uma uma vez');
  assert.strictEqual(r.etapas, nEtapas - 1, 'um fim de etapa entre as etapas');
  assert.ok(r.festa, 'tudo certo de primeira: a festa da trilha perfeita');
  assert.ok(await c.js(`Reino.Progresso.estado().loja[Reino.premioTrilha('${sala.id}').acessorio.id] === true`), 'o acessório da trilha na loja');
  console.log(`${sala.id} no ${c.tamanho} (${nEtapas} etapas): ${tipos.join(', ')}`);

  // o fim da sala: os prêmios de sempre
  assert.ok(await esperar(c, "!!document.querySelector('.tela-missao .fim-sala')", 4000), 'sem o fim da sala');
  const fim = sp(await c.js("document.querySelector('.tela-missao .fim-sala').textContent"));
  assert.match(fim, new RegExp(`Acertos de primeira: ${n} de ${n}`));
  assert.match(fim, /Estrela da Calma/);
  assert.match(fim, /no Baú do Tesouro/);
  assert.match(fim, /Você ganhou 2 ovos mágicos!/);
  assert.ok(fim.indexOf(sp('+ ' + await c.js(`Reino.util.moedas(${antes.valorSala})`))) >= 0, 'o fim sem o valor da sala: ' + fim);
  const depois = await c.js(`(function (P) { var e = P.estado(), r = e.salas['${sala.id}']; return { dinheiro: P.dinheiroTotal(), ganhas: e.estrelas.ganhas, reg: r,
    novos: Object.keys(e.unis).filter(function (id) { return ${JSON.stringify(antes.unis)}.indexOf(id) < 0; }).sort() }; })(Reino.Progresso)`);
  assert.ok(depois.reg && depois.reg.feita && depois.reg.perfeita && depois.reg.calma && depois.reg.vezes === 1, 'registro da sala: ' + JSON.stringify(depois.reg));
  assert.strictEqual(Math.round((depois.dinheiro - antes.dinheiro) * 100), Math.round(antes.valorSala * 100), 'o dinheiro da sala');
  assert.strictEqual(depois.ganhas - antes.ganhas, n + 3, 'estrelas: acertos de primeira + 3 da calma');
  assert.deepStrictEqual(depois.novos, antes.ovos.map((x) => x.split(':')[1]).sort(), 'os ovos da sala');

  // "Chocar os ovos": três toques em cada ovo e "Guardar no estábulo"; o móvel da sala; volta à Casa das Palavras
  await acionar(c, c.page.locator('.tela-missao .fim-sala .btn-principal'), 'toque');
  for (let k = 0; k < 2; k++) {
    assert.ok(await esperar(c, "!!document.querySelector('.tela-ovo .ovo-grande')", 4000), `sem o ovo ${k + 1}`);
    for (let i = 0; i < 3; i++) { await acionar(c, c.page.locator('.tela-ovo .ovo-grande'), 'toque'); await c.avancar(800); }
    assert.ok(await esperar(c, "/Nasceu/.test(document.querySelector('.tela-ovo').textContent)", 4000), `o ovo ${k + 1} não chocou`);
    await acionar(c, c.page.locator('.tela-ovo .btn-secundario'), 'toque');
    await c.avancar(800);
  }
  // o móvel da casa (casa.md §12): uma escolha por sala pendente (esta e as feitas antes, sem móvel); toca o 1º cartão
  assert.ok(await esperar(c, "!!document.querySelector('.tela-movel-casa .cmovel-cartao')", 4000), 'sem a escolha do móvel da sala');
  for (let k = 0; k < 40 && await c.js("!!document.querySelector('.tela-movel-casa .cmovel-cartao')"); k++) {
    await acionar(c, c.page.locator('.tela-movel-casa .cmovel-cartao').first(), 'toque');
    await c.avancar(1500);
  }
  assert.ok(await c.js(`!!Reino.Progresso.estado().casaMoveis['${sala.id}']`), 'o móvel da sala gravado');
  assert.ok(await esperar(c, "!Reino.UI.temTela() && /^portugues/.test(__reino.cena())", 6000), 'não voltou à Casa das Palavras');
  assert.deepStrictEqual(await c.js(`${JSON.stringify(depois.novos)}.map(function (id) { return Reino.Progresso.estado().unis[id].chocado; })`), [true, true]);
  assert.ok(sp(await c.js("document.querySelector('.chip-dinheiro').textContent")).indexOf(sp(await c.js('Reino.util.moedasNumero(Reino.Progresso.saldoMoedas())'))) >= 0,
    'o HUD sem o dinheiro novo');
  return tipos;
}

// as salas do capítulo que juntas têm todos os tipos de questão dele (cada vez a que mais junta tipos novos; no
// empate, a com menos questões)
async function salasDoCapitulo(c, cap) {
  const salas = await c.js(`Reino.materia('portugues4').salas.filter(function (s) { return s.capitulo === ${cap}; })
    .map(function (s) { return { id: s.id, tipos: s.desafios.map(function (d) { return d.tipo; }) }; })`);
  const falta = new Set(salas.flatMap((s) => s.tipos)), escolhidas = [];
  while (falta.size) {
    const novos = (s) => new Set(s.tipos.filter((t) => falta.has(t))).size;
    const melhor = salas.filter((s) => !escolhidas.includes(s)).sort((a, b) => novos(b) - novos(a) || a.tipos.length - b.tipos.length)[0];
    escolhidas.push(melhor);
    melhor.tipos.forEach((t) => falta.delete(t));
  }
  return { ids: escolhidas.map((s) => s.id), tipos: [...new Set(salas.flatMap((s) => s.tipos))].sort() };
}

// devolve [nome, função] para o test() do arquivo de cada capítulo (o test() chamado lá: a duração fica no nome dele)
function capitulo(cap, tamanho) {
  return [`Língua Portuguesa, Cap. ${cap}: salas inteiras pela interface no ${tamanho}, e elas contam no progresso`, async (t) => {
    const c = await abrirCenario({ tamanho, save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'aceite-4bim-sala-')) });
    try {
      const { ids, tipos } = await salasDoCapitulo(c, cap);
      if (!ids.length) { t.skip(`Cap. ${cap} ainda sem salas neste jogo`); return; }
      await c.page.evaluate(preparar);
      const feitos = new Set();
      for (const id of ids) (await jogarSala(c, id)).forEach((x) => feitos.add(x));
      assert.deepStrictEqual([...feitos].sort(), tipos, 'todos os tipos do capítulo respondidos pela tela');
      assert.deepStrictEqual(await c.js('window.__q.erros'), [], 'erro na página');
      assert.deepStrictEqual(c.erros, [], 'erro de console');
    } finally { await c.fechar(); }
  }];
}

module.exports = { capitulo };
