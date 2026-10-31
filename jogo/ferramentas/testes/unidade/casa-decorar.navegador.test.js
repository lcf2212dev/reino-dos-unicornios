// Modo decorar da casa (casa.md §9.3): o botão do HUD só dentro da casa; painel → peça → fantasma movido pelo toque na
// cena (verde/vermelho, Colocar apagado no vermelho), girar troca a pegada, colocar deixa a peça sólida; pegar a peça
// colocada e guardar; teclado (setas, R, Enter, Esc); depois de recarregar a página, a peça continua no lugar.
// Servidor de TESTE (cenario.js), save sintético com o kit dado por uma matéria do 4º bimestre forjada completa.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'casa-decorar-'));
const FANT = "Reino.modulo('casa-decorar').depurar()";
const peca = (uid) => `Reino.Casa.pecas().find(function (p) { return p.uid === ${JSON.stringify(uid)}; })`;

async function esperar(c, js) {
  for (let i = 0; i < 80; i++) { if (await c.js(js)) return true; await c.avancar(100); }
  return false;
}
// toque (mouse) no meio de um tile da cena
async function tocarTile(c, x, y) {
  const p = await c.js(`Reino.Cena.paraTela(${x} * 16 + 8, ${y} * 16 + 8)`);
  await c.page.mouse.click(p.x, p.y);
  await c.avancar(200);
}
// um tile à vista (acima da barra), no cômodo dela, onde a peça cabe e longe dela
const LIVRE = (uid, dir) => `(function () {
  var C = Reino.Casa, jt = Jogador.tile(), andar = Reino.Cena.atual().id, com = C.comodoEm(andar, jt.x, jt.y);
  var barra = document.querySelector('.decorar-barra'), fundo = barra ? barra.getBoundingClientRect().top : innerHeight;
  for (var y = 3; y < 12; y++) for (var x = 0; x < 49; x++) {
    if (C.comodoEm(andar, x, y) !== com || Math.abs(x - jt.x) + Math.abs(y - jt.y) < 4) continue;
    var a = Reino.Cena.paraTela(x * 16, y * 16), b = Reino.Cena.paraTela(x * 16 + 64, y * 16 + 48);
    if (a.x < 0 || a.y < 120 || b.x > innerWidth || b.y > fundo) continue;
    if (C.podeColocar(${JSON.stringify(uid)}, andar, x, y, ${JSON.stringify(dir)}).ok) return { x: x, y: y };
  }
  return null;
})()`;

test('casa: modo decorar pelo toque e pelo teclado, e a peça fica depois de recarregar', async () => {
  const c = await abrirCenario({ tamanho: 'tablet', save: 'completo', materiasCompletas: ['ingles4'], pasta: pasta() });
  try {
    // botão do HUD: escondido no mapa, à vista dentro da casa
    assert.strictEqual(await c.js("!!document.querySelector('#hud .btn-casa-decorar') && document.querySelector('#hud .btn-casa-decorar').hidden"), true);
    await c.ir('casa');
    assert.ok(await esperar(c, "!document.querySelector('#hud .btn-casa-decorar').hidden"), 'botão à vista na casa');
    assert.strictEqual(await c.js("Reino.Casa.escolherKit('estar')"), true);
    // as salas feitas do Inglês já deram móvel (senão a caixa abre antes a escolha dos móveis: casa.md §12)
    await c.js("Reino.CasaMoveis.pendentes().forEach(function (s) { Reino.CasaMoveis.escolher(s, Reino.CasaMoveis.opcoes(s)[0]); })");
    assert.strictEqual(await c.js('Reino.CasaMoveis.pendentes().length'), 0);

    // painel pelo botão; o sofá guardado entra no modo colocar
    await c.tocar('#hud .btn-casa-decorar');
    assert.ok(await esperar(c, "!!document.querySelector('.tela-decorar .decorar-peca')"), 'painel abriu');
    assert.strictEqual(await c.js("document.querySelector('.tela-decorar [data-uid=\"estar.sofa.1\"] .decorar-peca-estado').textContent"), 'Guardado');
    await c.tocar('.tela-decorar [data-uid="estar.sofa.1"]');
    assert.ok(await esperar(c, "!!document.querySelector('.decorar-barra') && !document.querySelector('.tela-decorar')"), 'modo colocar');
    assert.strictEqual(await c.js("Reino.Cena.ocupada()"), 'decorar');
    assert.strictEqual(await c.js("!!document.querySelector('.decorar-guardar')"), false, 'peça guardada não tem Guardar');

    // toque num tile livre: o fantasma vai para lá, verde
    const alvo = await c.js(LIVRE('estar.sofa.1', 'baixo'));
    assert.ok(alvo, 'achou um tile livre à vista');
    await tocarTile(c, alvo.x, alvo.y);
    let f = await c.js(FANT);
    assert.ok(f.ok && alvo.x >= f.x && alvo.x < f.x + 3 && alvo.y >= f.y && alvo.y < f.y + 2, 'fantasma no tile tocado: ' + JSON.stringify(f));
    assert.strictEqual(await c.js("document.querySelector('.decorar-barra').classList.contains('pode') && !document.querySelector('.decorar-colocar').hasAttribute('aria-disabled')"), true);

    // girar: a pegada troca (3×2 → 2×3); a volta completa das 4 direções
    const dirs = [f.dir];
    for (let i = 0; i < 4; i++) { await c.tocar('.decorar-girar'); dirs.push((await c.js(FANT)).dir); }
    assert.deepStrictEqual(dirs, ['baixo', 'esq', 'cima', 'dir', 'baixo']);
    await c.tocar('.decorar-girar');
    assert.deepStrictEqual(await c.js("Reino._ui.casaDecorar.pegada('casa-estar-sofa', 'esq')"), { w: 2, h: 3 });
    const lado = await c.js(LIVRE('estar.sofa.1', 'esq'));
    await tocarTile(c, lado.x, lado.y);
    f = await c.js(FANT);
    assert.ok(f.ok && f.dir === 'esq', 'de lado, verde: ' + JSON.stringify(f));

    // colocar: aparece sólida, o painel volta com "Na casa"
    await c.tocar('.decorar-colocar');
    const posto = await c.js(`(function () { var p = ${peca('estar.sofa.1')}, g = Reino.Cena.atual().grade;
      return { lugar: p.lugar, solido: !!g.solido[p.lugar.y + 2][p.lugar.x], tela: !!document.querySelector('.tela-decorar') }; })()`);
    assert.deepStrictEqual(posto, { lugar: { andar: 'casa', x: f.x, y: f.y, dir: 'esq' }, solido: true, tela: true });
    assert.strictEqual(await c.js("document.querySelector('.tela-decorar [data-uid=\"estar.sofa.1\"] .decorar-peca-estado').textContent"), 'Na casa');

    // tocar na peça colocada (na casa, fora do cartão do painel) pega para mover; aí tem Guardar. No tablet o cartão
    // cobre a sala: o teste o esconde para o toque cair na casa
    await c.js("document.querySelector('.tela-decorar .painel').style.visibility = 'hidden'");
    const pt = await c.js(`Reino.Cena.paraTela(${f.x} * 16 + 8, ${f.y + 1} * 16 + 8)`);
    await c.page.mouse.click(pt.x, pt.y);
    await c.avancar(300);
    assert.ok(await esperar(c, "!!document.querySelector('.decorar-guardar')"), 'pegou a peça colocada');
    // num tile ruim (a parede): vermelho, "Só no chão", Colocar apagado e o toque nele não muda nada
    await tocarTile(c, f.x, 2);
    f = await c.js(FANT);
    assert.strictEqual(f.ok, false);
    assert.deepStrictEqual([f.motivo, await c.js("document.querySelector('.decorar-estado').textContent")], ['parede', 'Só no chão'], 'peça de chão na parede');
    assert.strictEqual(await c.js("document.querySelector('.decorar-barra').classList.contains('nao-pode') && document.querySelector('.decorar-colocar').getAttribute('aria-disabled')"), 'true');
    await c.tocar('.decorar-colocar');
    assert.strictEqual(await c.js("!!document.querySelector('.decorar-barra')"), true, 'Colocar apagado não sai');
    await c.tocar('.decorar-guardar');
    assert.strictEqual(await c.js(`${peca('estar.sofa.1')}.lugar`), null, 'guardou');

    // teclado: Esc cancela sem mudar nada; setas movem, R gira, Enter coloca
    await c.tocar('.tela-decorar [data-uid="estar.poltrona.1"]');
    assert.ok(await esperar(c, "!!document.querySelector('.decorar-barra')"));
    await c.tecla('Escape');
    assert.strictEqual(await c.js("!!document.querySelector('.tela-decorar') && !document.querySelector('.decorar-barra')"), true, 'Esc voltou ao painel');
    assert.strictEqual(await c.js(`${peca('estar.poltrona.1')}.lugar`), null);
    await c.tocar('.tela-decorar [data-uid="estar.poltrona.1"]');
    await c.page.keyboard.press('Enter');   // logo depois de entrar (o 2º Enter de quem escolheu pelo teclado): não coloca
    assert.strictEqual(await c.js(`${peca('estar.poltrona.1')}.lugar`), null, 'Enter logo depois de entrar não coloca');
    const p0 = await c.js(FANT);
    const meta = await c.js(LIVRE('estar.poltrona.1', 'baixo'));
    for (let i = 0; i < Math.abs(meta.x - p0.x); i++) await c.tecla(meta.x > p0.x ? 'ArrowRight' : 'ArrowLeft');
    for (let i = 0; i < Math.abs(meta.y - p0.y); i++) await c.tecla(meta.y > p0.y ? 'ArrowDown' : 'ArrowUp');
    await c.tecla('r');
    const p1 = await c.js(FANT);
    assert.deepStrictEqual({ x: p1.x, y: p1.y, dir: p1.dir }, { x: meta.x, y: meta.y, dir: 'esq' });
    assert.ok(p1.ok, 'poltrona de lado cabe: ' + JSON.stringify(p1));
    await c.tecla('Enter');
    assert.deepStrictEqual(await c.js(`${peca('estar.poltrona.1')}.lugar`), { andar: 'casa', x: meta.x, y: meta.y, dir: 'esq' });
    // Pronto: sai e solta a cena
    await c.tocar('.decorar-pronto');
    assert.deepStrictEqual(await c.js("[!!document.querySelector('.tela-decorar'), Reino.Cena.ocupada()]"), [false, null]);

    // recarregar: a poltrona continua no lugar
    await c.page.reload();
    await c.page.waitForFunction(() => window.__reino && window.Reino && Reino.UI, null, { timeout: 30000 });
    for (let i = 0; i < 400 && !(await c.js("__reino.estado() === 'mapa' && !document.querySelector('#hud').hidden")); i++) await c.avancar(50);
    await c.avancar(1000);
    assert.deepStrictEqual(await c.js(`${peca('estar.poltrona.1')}.lugar`), { andar: 'casa', x: meta.x, y: meta.y, dir: 'esq' });
    assert.strictEqual(await c.js(`${peca('estar.sofa.1')}.lugar`), null);
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});
