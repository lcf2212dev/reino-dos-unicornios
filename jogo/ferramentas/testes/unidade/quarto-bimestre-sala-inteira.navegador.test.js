// Aceite do 4º bimestre (Língua Portuguesa), parte 3: salas inteiras jogadas pela interface, como a criança joga. Na Casa
// das Palavras, toca a estação e o "Ok!" do balão; intro ("Começar"), cada carta do resumo ("Continuar →"), cada questão
// respondida só com toques e digitação na tela, a tabela e o desenho também (prancheta: cor, ferramenta, ponto e
// arraste), com calma (espera o tempo de leitura antes do "Conferir"), "Continuar" e "Terminar a sala"; no fim, a sala
// conta como no 3º bimestre (P.concluirSala): o dinheiro da sala no baú e no HUD, as estrelas (acertos de primeira + 3
// da calma), o ovo comum e o raro (perfeita e com calma), chocados pela tela do ovo.
// Por capítulo, as salas que juntas têm todos os tipos de questão dele (separar e montar a frase incluídos): Cap. 10 no
// celular (toque), 11 no tablet (toque), 12 no notebook (clique); capítulo sem salas: pulado, com aviso.
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1). Sem erro de console.
// Rodar (da raiz): npm run unidade -- --so quarto-bimestre-sala-inteira
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');
const { preparar, acionar, responderDaVez, esperar, tocarTile, andarAte, estacao } = require('./ajudantes/quarto-bimestre');

const sp = (x) => String(x).replace(/­/g, '').replace(/\s+/g, ' ').trim();

// a sala inteira, da estação na Casa das Palavras até os ovos chocados, e o que ela soma no progresso
async function jogarSala(c, salaId) {
  const sala = await c.js(`(function (s) { return { id: s.id, nome: s.nome, paginas: s.paginas, cartas: (s.cartas || []).length, ids: s.desafios.map(function (d) { return d.id; }) }; })(
    Reino.materia('portugues4').salas.find(function (s) { return s.id === '${salaId}'; }))`);
  const n = sala.ids.length;
  const antes = await c.js(`(function (P, m) { var e = P.estado(); return { dinheiro: P.dinheiroTotal(), valorSala: P.valorSala(m), ganhas: e.estrelas.ganhas,
    feita: !!(e.salas['${sala.id}'] && e.salas['${sala.id}'].feita), unis: Object.keys(e.unis),
    ovos: m.unicornios.filter(function (u) { return u.sala === '${sala.id}'; }).map(function (u) { return u.raridade + ':' + u.id; }).sort() }; })(Reino.Progresso, Reino.materia('portugues4'))`);
  assert.strictEqual(antes.feita, false);
  assert.deepStrictEqual(antes.ovos.map((x) => x.split(':')[0]), ['comum', 'raro'], 'a sala com 1 unicórnio comum e 1 raro');

  // na Casa das Palavras: anda até a estação da sala, toca nela e no "Ok!"
  if ((await c.js('__reino.cena()')) !== 'portugues') await c.ir('portugues');
  const e = await estacao(c, sala.id);
  await andarAte(c, e.tile.x, e.tile.y);
  await tocarTile(c, e.x, e.y);
  assert.ok(await esperar(c, 'Reino.Claude.dialogoAberto()', 8000), 'a estação não falou');
  await acionar(c, c.page.locator('#claude-balao .claude-acoes .btn-dialogo.principal'), 'toque');
  await c.avancar(800);

  // intro e cartas do resumo
  assert.ok(await esperar(c, "!!document.querySelector('.tela-missao .intro-sala')", 8000), 'sem a intro da sala');
  const intro = sp(await c.js("document.querySelector('.tela-missao .intro-sala').textContent"));
  assert.ok(intro.indexOf(sp(sala.nome)) >= 0 && intro.indexOf(sp(sala.paginas)) >= 0, 'intro sem o nome ou as páginas: ' + intro);
  const principal = c.page.locator('.tela-missao footer.rodape-acao:not([hidden]) .btn-principal');
  await acionar(c, principal, 'toque');
  for (let i = 1; i <= sala.cartas; i++) {
    assert.match(await c.js("document.querySelector('.tela-missao .resumo-pag').textContent"), new RegExp(`Carta ${i} de ${sala.cartas}`));
    assert.ok(await c.js("document.querySelector('.tela-missao .livro-carta').textContent.trim().length > 0"), `carta ${i} vazia`);
    await acionar(c, principal, 'toque');
  }

  // as questões, na ordem do livro, todas certas de primeira e com calma, pelos toques
  const tipos = [];
  for (let k = 0; k < n; k++) {
    assert.match(await c.js("document.querySelector('.tela-missao .desafio-num').textContent"), new RegExp(`Desafio ${k + 1} de ${n}`));
    const r = await responderDaVez(c, sala.ids[k], 'toque', { errar: false, calma: true });
    assert.deepStrictEqual(r.problemas, [], `${r.id} (${r.tipo})`);
    assert.ok(r.primeira, `${r.id}: sem a estrela de primeira`);
    tipos.push(r.tipo);
  }
  console.log(`${sala.id} no ${c.tamanho}: ${tipos.join(', ')}`);

  // o fim da sala: os prêmios de sempre
  assert.ok(await esperar(c, "!!document.querySelector('.tela-missao .fim-sala')", 4000), 'sem o fim da sala');
  const fim = sp(await c.js("document.querySelector('.tela-missao .fim-sala').textContent"));
  assert.match(fim, new RegExp(`Acertos de primeira: ${n} de ${n}`));
  assert.match(fim, /Estrela da Calma/);
  assert.match(fim, /no Baú do Tesouro/);
  assert.match(fim, /Você ganhou 2 ovos mágicos!/);
  assert.ok(fim.indexOf(sp('+ ' + await c.js(`Reino.util.robux(${antes.valorSala})`))) >= 0, 'o fim sem o valor da sala: ' + fim);
  const depois = await c.js(`(function (P) { var e = P.estado(), r = e.salas['${sala.id}']; return { dinheiro: P.dinheiroTotal(), ganhas: e.estrelas.ganhas, reg: r,
    novos: Object.keys(e.unis).filter(function (id) { return ${JSON.stringify(antes.unis)}.indexOf(id) < 0; }).sort() }; })(Reino.Progresso)`);
  assert.ok(depois.reg && depois.reg.feita && depois.reg.perfeita && depois.reg.calma && depois.reg.vezes === 1, 'registro da sala: ' + JSON.stringify(depois.reg));
  assert.strictEqual(Math.round((depois.dinheiro - antes.dinheiro) * 100), Math.round(antes.valorSala * 100), 'o dinheiro da sala');
  assert.strictEqual(depois.ganhas - antes.ganhas, n + 3, 'estrelas: acertos de primeira + 3 da calma');
  assert.deepStrictEqual(depois.novos, antes.ovos.map((x) => x.split(':')[1]).sort(), 'os ovos da sala');

  // "Chocar os ovos": três toques em cada ovo e "Guardar no estábulo"; volta à Casa das Palavras
  await acionar(c, c.page.locator('.tela-missao .fim-sala .btn-principal'), 'toque');
  for (let k = 0; k < 2; k++) {
    assert.ok(await esperar(c, "!!document.querySelector('.tela-ovo .ovo-grande')", 4000), `sem o ovo ${k + 1}`);
    for (let i = 0; i < 3; i++) { await acionar(c, c.page.locator('.tela-ovo .ovo-grande'), 'toque'); await c.avancar(800); }
    assert.ok(await esperar(c, "/Nasceu/.test(document.querySelector('.tela-ovo').textContent)", 4000), `o ovo ${k + 1} não chocou`);
    await acionar(c, c.page.locator('.tela-ovo .btn-secundario'), 'toque');
    await c.avancar(800);
  }
  assert.ok(await esperar(c, "!Reino.UI.temTela() && __reino.cena() === 'portugues'", 6000), 'não voltou à Casa das Palavras');
  assert.deepStrictEqual(await c.js(`${JSON.stringify(depois.novos)}.map(function (id) { return Reino.Progresso.estado().unis[id].chocado; })`), [true, true]);
  assert.ok(sp(await c.js("document.querySelector('.chip-dinheiro').textContent")).indexOf(sp(await c.js('Reino.util.robuxNumero(Reino.Progresso.dinheiroTotal())'))) >= 0,
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

for (const [cap, tamanho] of [[10, 'celular'], [11, 'tablet'], [12, 'notebook']]) {
  test(`Língua Portuguesa, Cap. ${cap}: salas inteiras pela interface no ${tamanho}, e elas contam no progresso`, async (t) => {
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
  });
}
