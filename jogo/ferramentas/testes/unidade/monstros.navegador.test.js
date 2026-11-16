// Treinadores de Monstros no jogo (docs/contratos/monstros.md): o botão da MonsterBall na arena (escondido para quem
// nunca teve bola, apagado sem bola ou longe), jogar com o sorteio fixo (pega: gasta 1, o inimigo some, aviso "Pegou!";
// escapa: gasta 1, aviso "Escapou!"), a tela Meus monstros (pela Mochila; Levar comigo tira o ET), o monstro seguindo
// no lugar do ET e a ajuda tirando vida de um inimigo. Servidor e banco de TESTE novos (cenario.js), save sintético;
// modo congelado.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'monstros-'));
// a Mariana do lado do 1º inimigo ativo da arena
const PERTO = `(() => { const f = Reino.BosqueCombate.fantasmas().find((x) => x.estado === 'vagando');
  Jogador.x = f.x + 12; Jogador.y = f.y; return f.id; })()`;
const BOTAO = `(() => { const c = document.querySelector('#hud .monstros-bola'), b = c && c.querySelector('button');
  return { ver: !!c && !c.hidden, apagado: !!b && b.getAttribute('aria-disabled') === 'true', n: b ? b.querySelector('.monstros-bola-n').textContent : '' }; })()`;

test('monstros: MonsterBall na arena, Meus monstros, o monstro seguindo no lugar do ET e a ajuda', { timeout: 300000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', pasta: pasta() });
  try {
    await c.js('Reino.UI.fecharTodas(); 1');
    await c.ir('bosque');
    await c.js('Reino.UI.fecharTodas(); 1');
    // os avisos pedidos (a fila mostra um por vez)
    await c.js('window.__avisos = []; const a = Reino.UI.avisoItem; Reino.UI.avisoItem = function (x) { __avisos.push(x.texto); return a.apply(this, arguments); }; 1');
    await c.avancar(600);
    // 1) nunca teve bola: sem botão (as fotos do e2e não mudam)
    assert.strictEqual((await c.js(BOTAO)).ver, false);

    // 2) com 2 bolas, longe: aparece apagado; perto: aceso
    await c.js("Reino.Itens.ganhar('bola-monster'); Reino.Itens.ganhar('bola-monster'); 1");
    await c.js('Jogador.x = 28 * 16 + 8; Jogador.y = 39 * 16 + 12; 1');
    await c.avancar(600);
    assert.deepStrictEqual(await c.js(BOTAO), { ver: true, apagado: true, n: '2' });
    const alvo = await c.js(PERTO);
    await c.avancar(600);
    assert.deepStrictEqual(await c.js(BOTAO), { ver: true, apagado: false, n: '2' });

    // 3) pega (sorteio fixo): gasta 1, o inimigo entra na bola, "Pegou!" e a espécie gravada
    await c.js('Reino.config.monstros.chanceCaptura = 1; 1');
    await c.js("document.querySelector('#hud .monstros-bola button').click(); 1");
    await c.avancar(100);
    assert.strictEqual(await c.js('Reino.Monstros.bolas().length'), 1, 'gastou 1');
    // no ar: o alvo fica preso (nem a espada nem o monstro o ferem: sem prêmio dobrado) e ainda não contou
    assert.deepStrictEqual(await c.js(`(() => { const f = Reino._bosqueCombate.estado.fantasmas.find((x) => x.id === ${JSON.stringify(alvo)}), v = f.vida;
      Reino._bosqueCombate.estado.recargaAte = 0;
      Reino.BosqueCombate.golpear(Reino._bosqueCombate.estado, { x: f.x + 4, y: f.y, olharX: -1, olharY: 0, dano: 9999 });
      return { estado: f.estado, ferido: f.vida !== v, ajuda: Reino.BosqueCombate.ferir(f.id, 9999), cap: Reino.Monstros.capturados().length }; })()`),
    { estado: 'preso', ferido: false, ajuda: null, cap: 0 });
    await c.avancar(2000);
    const pegou = await c.js(`({ estado: Reino.BosqueCombate.fantasmas().find((x) => x.id === ${JSON.stringify(alvo)}).estado,
      aviso: __avisos.filter((t) => /^Pegou/.test(t)).join('|'), cap: Reino.Monstros.capturados().map((x) => x.id) })`);
    assert.strictEqual(pegou.estado, 'esperando', 'o inimigo some (sem vencido)');
    assert.ok(/^Pegou! .+ é seu!$/.test(pegou.aviso), pegou.aviso);
    assert.strictEqual(pegou.cap.length, 1);
    const especie = pegou.cap[0];

    // 4) escapa: gasta a outra, nada novo
    await c.js('Reino.config.monstros.chanceCaptura = 0; 1');
    await c.avancar(2000);
    await c.js(PERTO);
    await c.avancar(600);
    assert.ok(await c.js('Reino.Monstros.jogar()'));
    await c.avancar(2500);
    const esc = await c.js(`({ bolas: Reino.Monstros.bolas().length, cap: Reino.Monstros.capturados().length,
      aviso: __avisos.join('|') })`);
    assert.deepStrictEqual([esc.bolas, esc.cap, /Escapou!/.test(esc.aviso)], [0, 1, true], JSON.stringify(esc));
    // sem bola: apagado, e conta 0
    await c.avancar(2000);
    assert.deepStrictEqual(await c.js(BOTAO), { ver: true, apagado: true, n: '0' });

    // 4b) a Super: o botão só aparece com Super na mochila; pega sempre (com a chance da comum em 0) e gasta a Super
    const SUPER = "(() => { const c = document.querySelector('#hud .monstros-super'); return !!c && !c.hidden; })()";
    assert.strictEqual(await c.js(SUPER), false, 'sem Super, sem botão');
    await c.js("Reino.Itens.ganhar('bola-super'); 1");
    await c.js(PERTO);
    await c.avancar(600);
    assert.strictEqual(await c.js(SUPER), true);
    await c.js("document.querySelector('#hud .monstros-super button').click(); 1");
    await c.avancar(2500);
    assert.deepStrictEqual(await c.js("({ s: Reino.Monstros.bolas('super').length, cap: Reino.Monstros.capturados().reduce((n, x) => n + x.qtd, 0) })"), { s: 0, cap: 2 });
    assert.strictEqual(await c.js(SUPER), false, 'acabou a Super: o botão some');

    // 5) com um ET levado, equipa o monstro pela Mochila → Meus monstros: o ET fica em casa e o monstro segue
    await c.js("Reino.Viagem.fazerAmigo('lua-lumi'); Reino.Viagem.escolherCompanheiro('lua-lumi'); 1");
    assert.strictEqual(await c.js('Reino.Viagem.companheiro()'), 'lua-lumi');
    await c.js("document.querySelector('#hud .btn-mochila').click(); 1");
    await c.avancar(400);
    assert.ok(await c.js("!!document.querySelector('.tela-mochila .moch-monstros')"), 'botão Meus monstros na Mochila');
    await c.js("document.querySelector('.tela-mochila .moch-monstros').click(); 1");
    await c.avancar(400);
    const tela = await c.js(`({ tem: document.querySelectorAll('.tela-monstros .monstros-cartao.tem').length,
      silhuetas: document.querySelectorAll('.tela-monstros .monstros-cartao.silhueta').length, total: Reino.Monstros.especies().length,
      figura: !!document.querySelector('.tela-monstros .monstros-cartao.tem canvas') })`);
    assert.deepStrictEqual(tela, { tem: 1, silhuetas: tela.total - 1, total: tela.total, figura: true });
    await c.js(`document.querySelector('.tela-monstros [data-monstro="${especie}"]').click(); 1`);
    await c.avancar(300);
    assert.deepStrictEqual(await c.js(`({ eq: Reino.Monstros.equipado(), et: Reino.Viagem.companheiro(),
      selo: !!document.querySelector('.tela-monstros .monstros-cartao.junto .monstros-selo'),
      botao: document.querySelector('.tela-monstros [data-monstro="${especie}"]').textContent })`),
    { eq: especie, et: null, selo: true, botao: 'Deixar em casa' });
    await c.js('Reino.UI.fecharTodas(); 1');
    await c.avancar(600);
    const dep = await c.js("({ ativo: !!Reino.modulo('monstros').camada.ativo(), et: !!Reino.modulo('et-companheiro').camada.ativo() })");
    assert.strictEqual(dep.ativo, true, 'o monstro aparece');
    assert.strictEqual(dep.et, false, 'o ET some');

    // 6) a ajuda: perto de um inimigo, o monstro tira vida dele sozinho
    const id2 = await c.js(PERTO);
    await c.avancar(3000);
    const ferido = await c.js(`(() => { const f = Reino.BosqueCombate.fantasmas().find((x) => x.id === ${JSON.stringify(id2)}); return { vida: f.vida, max: f.max, estado: f.estado }; })()`);
    assert.ok(ferido.vida < ferido.max || ferido.estado !== 'vagando', 'o monstro bateu: ' + JSON.stringify(ferido));

    // 7) levar o ET de novo tira o monstro
    await c.js("Reino.Viagem.escolherCompanheiro('lua-lumi'); 1");
    assert.deepStrictEqual(await c.js('({ eq: Reino.Monstros.equipado(), et: Reino.Viagem.companheiro() })'), { eq: null, et: 'lua-lumi' });
  } finally {
    await c.fechar();
  }
});
