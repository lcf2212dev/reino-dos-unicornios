// Shopping Terrazo na Vila Arco-Íris (docs/contratos/vila.md §2): o terreno de baixo da esquerda virou o shopping (fachada
// 'vila-shopping-predio' em (3, 22), o totem do "T" em (9, 26), porta = escada `portal` (5, 27)); a porta leva ao interior
// 'vila-shopping' (chega em (18, 11), no Corredor das Lojas) e a saída (18, 12) volta para a frente da porta (5, 28). Lá
// dentro, os três cômodos (Terraço Gourmet, Corredor das Lojas e Zoo Parque) ligados pelas portas da fileira 8–9, e os
// objetos que falam (voz da narradora, pacote interior-bosque): tocar na girafa, na pipoqueira e no totem abre o balão
// com a fala. Anda de verdade (tecla de seta), no jogo congelado; servidor e banco de TESTE novos (cenario.js); save
// sintético.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'shopping-'));
const ONDE = `(() => { const c = Reino.Cena.atual(), t = Jogador.tile(); return { cena: c && c.id, x: t.x, y: t.y }; })()`;
// o balão aberto: o texto (null = fechado)
const BALAO = `(() => { const b = document.querySelector('#claude-balao');
  return !b || b.hidden ? null : b.querySelector('.claude-texto').textContent.trim(); })()`;

test('shopping: prédio na Vila, porta e volta, os três cômodos e os objetos que falam', { timeout: 240000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', pasta: pasta() });
  // põe ela em (x, y) e anda para `k` até a cena trocar (a íris e a chegada inclusas)
  async function pisar(x, y, k) {
    await c.js(`Reino.UI.fecharTodas && Reino.UI.fecharTodas(); Jogador.posicionar(${x}, ${y}); Reino._motor.teclas = { ${k}: true }; 1`);
    const antes = (await c.js(ONDE)).cena;
    for (let i = 0; i < 40 && (await c.js(ONDE)).cena === antes; i++) await c.avancar(100);
    await c.js('Reino._motor.teclas = {}; 1');
    await c.avancar(2500);
    return c.js(ONDE);
  }
  // toca no objeto de tipo `tipo` da cena (o toque de verdade, no meio do 1º tile da pegada) e devolve o texto do balão
  async function tocar(tipo) {
    const ok = await c.js(`(() => { const c = Reino.Cena.atual(), o = c.def.objetos.find((x) => x.tipo === '${tipo}');
      const a = o && c.alvoEm(o.x * 16 + 8, o.y * 16 + 8);
      if (!a || !a.objeto || a.objeto.tipo !== '${tipo}') return false;
      void a.agir(); return true; })()`);
    assert.ok(ok, `o toque acha ${tipo}`);
    await c.avancar(600);
    const b = await c.js(BALAO);
    // fecha o balão pelo botão dele (Continuar… Ok!), como ela faria
    for (let i = 0; i < 4 && (await c.js(BALAO)) !== null; i++) {
      await c.tocar('#claude-balao .claude-acoes :is(.btn-ok-claude, .btn-dialogo.principal)');
      await c.avancar(600);
    }
    assert.strictEqual(await c.js(BALAO), null, 'o balão fecha');
    return b;
  }
  try {
    const d = await c.js(`(() => {
      const I = Reino.Interiores, v = I.def('vila'), s = I.def('vila-shopping'), F = Reino.FALAS_INTERIORES.vila.objetos;
      const interativos = s.objetos.filter((o) => o.fala && o.fala.length);
      return {
        predio: v.objetos.filter((o) => o.tipo === 'vila-shopping-predio').map((o) => [o.x, o.y]),
        totem: v.objetos.filter((o) => o.tipo === 'vila-shopping-totem').map((o) => [o.x, o.y, o.nome, o.fala]),
        porta: v.escadas.filter((e) => e.para === 'vila-shopping').map((e) => [e.x, e.y, e.sentido]),
        interior: [s.nome, s.lugar, s.entrada, s.pacote, s.tamanho.w, s.tamanho.h, s.escadas.length, s.escadas[0].x, s.escadas[0].y,
          s.escadas[0].para, s.escadas[0].sentido, s.escadas[0].seta],
        comodos: s.comodos.map((x) => [x.id, x.nome, x.placa]),
        portas: s.portas.map((p) => [p.x, p.y]),
        falas: interativos.map((o) => o.fala.every((f) => typeof f === 'string' && f.length > 0 && f.length <= 32)),
        voz: Reino.Falas.todas().filter((f) => f.pacote === 'interior-bosque' && Object.keys(F).filter((k) => /^shopping-/.test(k))
          .some((k) => F[k].includes(f.texto))).every((f) => f.voz === 'narradora'),
        nInterativos: interativos.length,
      };
    })()`);
    assert.deepStrictEqual(d.predio, [[3, 22]]);
    assert.deepStrictEqual(d.totem, [[9, 26, 'Shopping Terrazo', ['O Shopping Terrazo chegou!', 'Venha passear lá dentro!']]]);
    assert.deepStrictEqual(d.porta, [[5, 27, 'portal']]);
    assert.deepStrictEqual(d.interior, ['Shopping Terrazo', 'bosque', false, 'interior-bosque', 37, 14, 1, 18, 12, 'vila', 'portal', 'desce']);
    assert.deepStrictEqual(d.comodos, [
      ['vila-shopping-gourmet', 'Terraço Gourmet', 'Terraço Gourmet'],
      ['vila-shopping-lojas', 'Corredor das Lojas', 'Shopping Terrazo'],
      ['vila-shopping-zoo', 'Zoo Parque', 'Zoo Parque'],
    ]);
    assert.deepStrictEqual(d.portas, [[11, 8], [25, 8]]);
    assert.ok(d.nInterativos >= 10 && d.falas.every(Boolean), 'os objetos do shopping têm fala curta');
    assert.ok(d.voz, 'as falas do shopping na voz da narradora, pacote interior-bosque');

    await c.ir('vila');
    assert.strictEqual(await tocar('vila-shopping-totem'), 'O Shopping Terrazo chegou!', 'o totem fala');
    assert.deepStrictEqual(await pisar(5, 28, 'cima'), { cena: 'vila-shopping', x: 18, y: 11 }, 'a porta leva ao shopping');
    assert.deepStrictEqual(await pisar(18, 11, 'baixo'), { cena: 'vila', x: 5, y: 28 }, 'a saída volta para a frente da porta');
    assert.deepStrictEqual(await pisar(5, 28, 'cima'), { cena: 'vila-shopping', x: 18, y: 11 });

    // os cômodos: anda pelas portas até o Terraço Gourmet e o Zoo Parque (o caminho do jogo, pela grade)
    const comodoDe = `(() => { const c = Reino.Cena.atual(), t = Jogador.tile();
      const k = c.def.comodos.find((x) => t.x >= x.rect.x && t.x < x.rect.x + x.rect.w && t.y >= x.rect.y && t.y < x.rect.y + x.rect.h);
      return k && k.id; })()`;
    for (const [x, id] of [[5, 'vila-shopping-gourmet'], [30, 'vila-shopping-zoo'], [18, 'vila-shopping-lojas']]) {
      await c.js(`Jogador.posicionar(${x}, 9); 1`);
      await c.avancar(300);
      assert.strictEqual(await c.js(comodoDe), id, `(${x}, 9) fica no ${id}`);
    }
    const anda = await c.js(`(() => { const I = Reino.Interiores, g = I.grade(I.def('vila-shopping'));
      const ok = (b) => { const p = I.caminhoNaGrade(g, { x: 18, y: 11 }, b); return !!(p && p.length); };
      return { terraco: ok({ x: 2, y: 9 }), zoo: ok({ x: 34, y: 9 }), petPark: ok({ x: 34, y: 11 }) }; })()`);
    assert.deepStrictEqual(anda, { terraco: true, zoo: true, petPark: true }, 'da entrada dá para andar até o Terraço, o Zoo e o Pet Park');

    // os objetos que falam
    assert.strictEqual(await tocar('vila-shopping-pipoqueira'), 'Pipoca quentinha para o filme!');
    assert.strictEqual(await tocar('vila-shopping-girafa'), 'A girafa estica o pescoço!');
    assert.strictEqual(await tocar('vila-shopping-cachorro'), 'O cachorrinho quer um petisco!');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
