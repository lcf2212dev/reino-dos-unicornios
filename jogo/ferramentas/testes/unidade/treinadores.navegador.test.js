// Treinadores de Monstros na Vila Arco-Íris (docs/contratos/monstros.md §2): o terreno da direita virou o prédio
// (fachada 'vila-treinadores-predio' em (31, 12), porta = escada `portal` (33, 17)); a porta leva ao interior
// 'vila-treinadores' (chega em (8, 9)) e a saída (8, 10) volta para a frente da porta (33, 18). A Treinadora Kiara (ação
// 'treinadores') pede a pergunta do 4º bimestre antes da conversa (UI.perguntaVila). Na loja (UI.telaTreinadores), dois
// cartões: comprar 2 MonsterBalls tira 100 estrelas e põe 2 'bola-monster' na mochila; 1 de cada (MonsterBall + Super
// MonsterBall) tira 175 e põe 1 'bola-monster' + 1 'bola-super'; sem estrelas, o botão fica apagado e
// Reino.Treinadores.comprar recusa sem gastar nada. Trava (config.monstros.libera): sem salas da Matemática do Dia a Dia
// as duas bolas ficam trancadas (cartão apagado, comprar recusa 'trancada'); 16 salas abrem a MonsterBall; 32, a Super.
// Anda de verdade (tecla de seta), no jogo congelado; servidor e banco de TESTE novos (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'treinadores-'));
const ONDE = `(() => { const c = Reino.Cena.atual(), t = Jogador.tile(); return { cena: c && c.id, x: t.x, y: t.y }; })()`;
const BOLAS = `Reino.Itens.pecas().filter((p) => p.id === 'bola-monster' && p.onde === 'mochila').length`;
const SUPER = `Reino.Itens.pecas().filter((p) => p.id === 'bola-super' && p.onde === 'mochila').length`;
// marca as n primeiras salas da matéria da trava como feitas (save sintético) e devolve as ofertas
const SALAS = (n) => `(() => { const m = Reino.materia(Reino.config.monstros.libera.materia), e = Reino.Progresso.estado();
  m.salas.forEach((s, i) => { if (i < ${n}) e.salas[s.id] = { vezes: 1, melhor: 6, feita: 1 }; else delete e.salas[s.id]; });
  return Reino.Treinadores.ofertas().map((o) => [o.id, o.liberada, o.feitas, o.precisa]); })()`;

test('treinadores: prédio na Vila, porta e volta, Kiara com a pergunta, compra de MonsterBalls', { timeout: 240000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', estrelas: 400, pasta: pasta() });
  async function pisar(x, y, k) {
    await c.js(`Reino.UI.fecharTodas && Reino.UI.fecharTodas(); Jogador.posicionar(${x}, ${y}); Reino._motor.teclas = { ${k}: true }; 1`);
    const antes = (await c.js(ONDE)).cena;
    for (let i = 0; i < 40 && (await c.js(ONDE)).cena === antes; i++) await c.avancar(100);
    await c.js('Reino._motor.teclas = {}; 1');
    await c.avancar(2500);
    return c.js(ONDE);
  }
  try {
    const d = await c.js(`(() => {
      const I = Reino.Interiores, v = I.def('vila'), t = I.def('vila-treinadores'), n = (t.npcs || [])[0];
      return {
        predio: v.objetos.filter((o) => o.tipo === 'vila-treinadores-predio').map((o) => [o.x, o.y]),
        porta: v.escadas.filter((e) => e.para === 'vila-treinadores').map((e) => [e.x, e.y, e.sentido]),
        terrenos: v.objetos.filter((o) => o.tipo === 'vila-terreno').length,
        interior: [t.lugar, t.entrada, t.pacote, t.tamanho.w, t.tamanho.h, t.escadas[0].x, t.escadas[0].y, t.escadas[0].para],
        kiara: [n.id, n.nome, n.voz, n.acao.tipo, (n.falas.oi || []).length > 0],
        porteira: typeof Reino.modulo('treinadores').porteira,
      };
    })()`);
    assert.deepStrictEqual(d.predio, [[31, 12]]);
    assert.deepStrictEqual(d.porta, [[33, 17, 'portal']]);
    assert.strictEqual(d.terrenos, 2, 'os outros 2 terrenos continuam livres');
    assert.deepStrictEqual(d.interior, ['bosque', false, 'interior-bosque', 16, 12, 8, 10, 'vila']);
    assert.deepStrictEqual(d.kiara, ['kiara', 'Treinadora Kiara', 'npc-kiara', 'treinadores', true]);
    assert.strictEqual(d.porteira, 'function');

    await c.ir('vila');
    assert.deepStrictEqual(await pisar(33, 18, 'cima'), { cena: 'vila-treinadores', x: 8, y: 9 }, 'a porta leva aos Treinadores');

    // a Kiara pede a pergunta do 4º bimestre (a tela da Vila); fechar não abre a loja
    const pergunta = await c.js(`(() => {
      const n = Reino.Interiores.def('vila-treinadores').npcs[0];
      void Reino.modulo('treinadores').porteira(n);
      return !!document.querySelector('.tela-vila-pergunta');
    })()`);
    await c.avancar(600);
    assert.strictEqual(pergunta || await c.js(`!!document.querySelector('.tela-vila-pergunta')`), true, 'abriu a pergunta da Vila');
    await c.js('Reino.UI.fecharTodas(); 1');
    await c.avancar(600);

    // a trava: sem salas de Matemática, as duas trancadas; 16 abrem a MonsterBall; 32, a Super
    assert.deepStrictEqual(await c.js(SALAS(0)), [['bola-monster', false, 0, 16], ['bola-super', false, 0, 32]]);
    const tranc = await c.js(`(() => { const a = Reino.Progresso.estrelas(), r = Reino.Treinadores.comprar(1); return [r.ok, r.motivo, Reino.Progresso.estrelas() === a]; })()`);
    assert.deepStrictEqual(tranc, [false, 'trancada', true], 'trancada: não compra nem gasta');
    await c.js('void Reino.modulo("treinadores").acoes.treinadores({ tipo: "treinadores" }); 1');
    await c.avancar(600);
    assert.deepStrictEqual(await c.js(`[...document.querySelectorAll('.tela-treinadores .treinadores-cartao')].map((e) => [e.classList.contains('treinadores-trancada'), /Abre com \\d+ salas de Matemática/.test(e.textContent)])`),
      [[true, true], [true, true]], 'os dois cartões trancados, dizendo quantas salas faltam');
    assert.strictEqual(await c.js(`document.querySelector('.tela-treinadores .vila-botao-total').disabled`), true);
    await c.js('Reino.UI.fecharTodas(); 1');
    await c.avancar(600);
    assert.deepStrictEqual(await c.js(SALAS(16)), [['bola-monster', true, 16, 16], ['bola-super', false, 16, 32]]);
    assert.strictEqual(await c.js(`Reino.Treinadores.comprar([{ id: 'bola-super', qtd: 1 }]).motivo`), 'trancada', 'a Super pede as 32');
    assert.deepStrictEqual(await c.js(SALAS(32)), [['bola-monster', true, 32, 16], ['bola-super', true, 32, 32]]);

    // a loja: + uma (2 bolas = 100 estrelas), Comprar, confirmar
    await c.js('void Reino.modulo("treinadores").acoes.treinadores({ tipo: "treinadores" }); 1');
    await c.avancar(600);
    assert.strictEqual(await c.js(`!!document.querySelector('.tela-treinadores')`), true, 'a loja abriu');
    assert.deepStrictEqual(await c.js(`[...document.querySelectorAll('.tela-treinadores .treinadores-cartao')].map((e) => [e.dataset.id, e.textContent.includes('100%') || e.textContent.includes('40%')])`),
      [['bola-monster', true], ['bola-super', true]], 'os dois cartões, com a chance');
    const antes = await c.js('Reino.Progresso.estrelas()');
    await c.tocar('[data-id="bola-monster"] .vila-mais');
    assert.match(await c.js(`document.querySelector('.tela-treinadores .vila-botao-total').textContent`), /100/);
    await c.tocar('.tela-treinadores .vila-botao-total');
    await c.avancar(1500);   // o botão que gasta só arma depois de um tempinho (UI.confirmar com gasta)
    await c.tocar('Sim, quero!');
    await c.avancar(600);
    assert.strictEqual(await c.js('Reino.Progresso.estrelas()'), antes - 100, 'gastou 100 estrelas');
    assert.strictEqual(await c.js(BOLAS), 2, '2 MonsterBalls na mochila');
    assert.strictEqual(await c.js('Reino.Treinadores.tem()'), 2);

    // 1 de cada: a MonsterBall já vem com 1; + na Super; 50 + 125 = 175
    await c.tocar('[data-id="bola-super"] .vila-mais');
    assert.match(await c.js(`document.querySelector('.tela-treinadores .vila-botao-total').textContent`), /175/);
    await c.tocar('.tela-treinadores .vila-botao-total');
    await c.avancar(1500);
    await c.tocar('Sim, quero!');
    await c.avancar(600);
    assert.strictEqual(await c.js('Reino.Progresso.estrelas()'), antes - 275, 'gastou mais 175 estrelas');
    assert.strictEqual(await c.js(BOLAS), 3, '+1 MonsterBall');
    assert.strictEqual(await c.js(SUPER), 1, '+1 Super MonsterBall');

    // sem estrelas: o botão apagado, e a regra recusa sem gastar
    const sem = await c.js(`(() => {
      const r = Reino.Treinadores.comprar([{ id: 'bola-super', qtd: Math.floor(Reino.Progresso.estrelas() / 125) + 1 }]);
      return { ok: r.ok, motivo: r.motivo, falta: r.falta > 0, botao: document.querySelector('.tela-treinadores .vila-botao-total').disabled };
    })()`);
    assert.strictEqual(sem.ok, false);
    assert.strictEqual(sem.motivo, 'saldo');
    assert.strictEqual(sem.falta, true);
    assert.strictEqual(await c.js(SUPER), 1, 'não ganhou bola sem pagar');
    assert.strictEqual(await c.js('Reino.Progresso.estrelas()'), antes - 275, 'não gastou nada');
    for (let i = 0; i < 12; i++) await c.js(`(() => { const b = document.querySelector('[data-id="bola-super"] .vila-mais'); if (b && !b.disabled) b.click(); return 1; })()`);
    await c.avancar(300);
    assert.strictEqual(await c.js(`document.querySelector('.tela-treinadores .vila-botao-total').disabled`), true, 'sem saldo, o botão fica apagado');
    assert.match(await c.js(`document.querySelector('.tela-treinadores .vila-aviso').textContent`), /Faltam/);

    assert.deepStrictEqual(await pisar(8, 9, 'baixo'), { cena: 'vila', x: 33, y: 18 }, 'a saída volta para a frente da porta');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
