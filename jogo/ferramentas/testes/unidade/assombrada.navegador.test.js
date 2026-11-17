// Casa Mal-Assombrada na Vila Arco-Íris (docs/contratos/vila.md §2; os monstros das matérias: monstros.md §10): o terreno
// de cima da esquerda virou a casa (fachada 'vila-assombrada-predio' em (3, 12), porta = escada `portal` (5, 17)); a porta
// leva ao interior 'vila-assombrada' (chega em (8, 9)) e a saída (8, 10) volta para a frente da porta (5, 18). Lá dentro, 6
// jaulas, uma por monstro de matéria (Reino.Monstros.daMateria, na ordem), com a ação 'assombrada-monstro'. Tocar numa
// jaula: sem a matéria completa, "Termine a <matéria>!" / "E ganhe o <monstro>!"; com ela completa (todas as salas da
// matéria de agora feitas no save sintético), "O <monstro> é seu!" / "Quer levar com você?" e "Levar comigo" põe o monstro
// na fila (Monstros.equipados) e diz "Ele está com você!" (de novo: "é seu" e "está com você"); sem vaga, "Não tem vaga
// para mais um." / "Deixe um monstro em casa." e a fila não muda.
// Anda de verdade (tecla de seta), no jogo congelado; servidor e banco de TESTE novos (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'assombrada-'));
const ONDE = `(() => { const c = Reino.Cena.atual(), t = Jogador.tile(); return { cena: c && c.id, x: t.x, y: t.y }; })()`;
// o balão aberto: o texto e os botões (null = fechado; o emoji e a seta dos botões viram desenho, fora do texto)
const BALAO = `(() => { const b = document.querySelector('#claude-balao');
  if (!b || b.hidden) return null;
  return { texto: b.querySelector('.claude-texto').textContent.trim(),
    botoes: [...b.querySelectorAll('.claude-acoes .btn-dialogo, .claude-acoes .btn-ok-claude')].map((x) => x.textContent.trim()) }; })()`;
// todas as salas da matéria de agora do monstro feitas (ou nenhuma), no save sintético
const SALAS = (esp, feitas) => `(() => { const d = Reino.Monstros.daMateria().find((x) => x.id === '${esp}'), m = Reino.materia(d.materia);
  const e = Reino.Progresso.estado();
  m.salas.forEach((s) => { if (${feitas}) e.salas[s.id] = { vezes: 1, melhor: 6, feita: 1 }; else delete e.salas[s.id]; });
  return Reino.Monstros.quantos('${esp}'); })()`;

test('assombrada: casa na Vila, porta e volta, as 6 jaulas, ganhar e levar o monstro da matéria', { timeout: 240000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', pasta: pasta() });
  async function pisar(x, y, k) {
    await c.js(`Reino.UI.fecharTodas && Reino.UI.fecharTodas(); Jogador.posicionar(${x}, ${y}); Reino._motor.teclas = { ${k}: true }; 1`);
    const antes = (await c.js(ONDE)).cena;
    for (let i = 0; i < 40 && (await c.js(ONDE)).cena === antes; i++) await c.avancar(100);
    await c.js('Reino._motor.teclas = {}; 1');
    await c.avancar(2500);
    return c.js(ONDE);
  }
  // toca na jaula da espécie (o toque de verdade, no meio da pegada) e devolve o 1º balão
  async function tocarJaula(esp) {
    const ok = await c.js(`(() => { const c = Reino.Cena.atual(), o = c.def.objetos.find((x) => x.acao && x.acao.especie === '${esp}');
      const a = c.alvoEm(o.x * 16 + 16, o.y * 16 + 16);
      if (!a || !a.objeto || a.objeto.acao.especie !== '${esp}') return false;
      void a.agir(); return true; })()`);
    assert.ok(ok, `o toque acha a jaula de ${esp}`);
    await c.avancar(600);
    return c.js(BALAO);
  }
  // aperta o botão do balão (o principal, ou o de texto) e devolve o próximo balão (clique do código: a guarda do toque
  // duplo, ui/base.js, seguraria o 2º toque de dedo no mesmo lugar)
  async function apertar(texto) {
    await c.tocar(texto || '#claude-balao .claude-acoes :is(.btn-ok-claude, .btn-dialogo.principal)');
    await c.avancar(600);
    return c.js(BALAO);
  }
  try {
    const d = await c.js(`(() => {
      const I = Reino.Interiores, v = I.def('vila'), a = I.def('vila-assombrada');
      return {
        predio: v.objetos.filter((o) => o.tipo === 'vila-assombrada-predio').map((o) => [o.x, o.y]),
        porta: v.escadas.filter((e) => e.para === 'vila-assombrada').map((e) => [e.x, e.y, e.sentido]),
        interior: [a.lugar, a.entrada, a.pacote, a.tamanho.w, a.tamanho.h, a.escadas[0].x, a.escadas[0].y, a.escadas[0].para, a.escadas[0].sentido],
        jaulas: a.objetos.filter((o) => o.tipo === 'vila-assombrada-jaula').map((o) => [o.acao.tipo, o.acao.especie, o.nome]),
        especies: Reino.Monstros.daMateria().map((x) => [x.id, x.nome]),
        acao: typeof Reino.modulo('assombrada').acoes['assombrada-monstro'],
        falas: Reino.modulo('assombrada').falas().every((f) => f.voz === 'narradora' && f.pacote === 'interior-bosque'),
      };
    })()`);
    assert.deepStrictEqual(d.predio, [[3, 12]]);
    assert.deepStrictEqual(d.porta, [[5, 17, 'portal']]);
    assert.deepStrictEqual(d.interior, ['bosque', false, 'interior-bosque', 16, 12, 8, 10, 'vila', 'portal']);
    assert.strictEqual(d.especies.length, 6, 'um monstro por matéria');
    assert.deepStrictEqual(d.jaulas, d.especies.map((e) => ['assombrada-monstro', e[0], e[1]]), 'as 6 jaulas, na ordem');
    assert.strictEqual(d.acao, 'function');
    assert.ok(d.falas, 'as falas das jaulas na voz da narradora, pacote interior-bosque');

    await c.ir('vila');
    assert.deepStrictEqual(await pisar(5, 18, 'cima'), { cena: 'vila-assombrada', x: 8, y: 9 }, 'a porta leva à casa');
    assert.deepStrictEqual(await pisar(8, 9, 'baixo'), { cena: 'vila', x: 5, y: 18 }, 'a saída volta para a frente da porta');
    assert.deepStrictEqual(await pisar(5, 18, 'cima'), { cena: 'vila-assombrada', x: 8, y: 9 });

    // sem a matéria: termine e ganhe (o nome da matéria de agora, com o artigo)
    const [mat, ing] = d.especies.map((e) => e[0]);
    assert.strictEqual(await c.js(SALAS(mat, false)), 0);
    const nomeMat = await c.js(`Reino.materia(Reino.Monstros.daMateria()[0].materia).nome`);
    let b = await tocarJaula(mat);
    assert.deepStrictEqual(b, { texto: `Termine a ${nomeMat}!`, botoes: ['Continuar'] });
    b = await apertar();
    assert.deepStrictEqual(b, { texto: 'E ganhe o Fantasma das Contas!', botoes: ['Ok!'] });
    assert.strictEqual(await apertar(), null, 'Ok fecha o balão');

    // com a matéria completa: é seu, quer levar? Levar comigo põe na fila
    assert.strictEqual(await c.js(SALAS(mat, true)), 1, 'matéria completa: ganhou o monstro');
    assert.strictEqual(await c.js(`Reino.Monstros.estaJunto('${mat}')`), false);
    b = await tocarJaula(mat);
    assert.deepStrictEqual(b, { texto: 'O Fantasma das Contas é seu!', botoes: ['Continuar'] });
    b = await apertar();
    assert.deepStrictEqual(b, { texto: 'Quer levar com você?', botoes: ['Levar comigo', 'Agora não'] });
    b = await apertar('Levar comigo');
    assert.deepStrictEqual(b, { texto: 'Ele está com você!', botoes: ['Ok!'] });
    assert.ok((await c.js('Reino.Monstros.equipados()')).includes(mat), 'foi para a fila');
    await apertar();
    b = await tocarJaula(mat);
    assert.strictEqual(b.texto, 'O Fantasma das Contas é seu!');
    assert.deepStrictEqual(await apertar(), { texto: 'Ele está com você!', botoes: ['Ok!'] });
    await apertar();

    // sem vaga: a fila cheia de capturados; a jaula avisa e a fila não muda
    assert.strictEqual(await c.js(SALAS(ing, true)), 1);
    const fila = await c.js(`(() => { const M = Reino.Monstros, e = Reino.Progresso.estado();
      const outros = M.especies().filter((x) => !x.daMateria).slice(0, 8).map((x) => x.id);
      e.monstros = Object.assign({}, e.monstros); outros.forEach((id) => { e.monstros[id] = 1; });
      for (const id of outros) { if (M.equipados().length >= M.vagas()) break; M.equipar(id); }
      return { n: M.equipados().length, vagas: M.vagas(), lista: M.equipados() }; })()`);
    assert.strictEqual(fila.n, fila.vagas, 'a fila está cheia');
    b = await tocarJaula(ing);
    assert.strictEqual(b.texto, 'O Vampirinho Inglês é seu!');
    assert.strictEqual((await apertar()).texto, 'Quer levar com você?');
    assert.deepStrictEqual(await apertar('Levar comigo'), { texto: 'Não tem vaga para mais um.', botoes: ['Continuar'] });
    assert.deepStrictEqual(await apertar(), { texto: 'Deixe um monstro em casa.', botoes: ['Ok!'] });
    await apertar();
    assert.deepStrictEqual(await c.js('Reino.Monstros.equipados()'), fila.lista, 'sem vaga, a fila não muda');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
