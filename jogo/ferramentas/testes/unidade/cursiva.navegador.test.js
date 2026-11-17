// Letra cursiva na loja da Treinadora Kiara (docs/contratos/cursiva.md), com o dedo de verdade (toque pelo CDP, celular):
// no cartão da MonsterBall, "Escrever 2 frases" abre a tela de escrever com 2 frases do banco. Tocar longe da bolinha
// verde não começa; começar para baixo (o certo é subir) não pinta e avisa ("Por aí não!" e, longe, "Comece de novo…");
// seguindo o tracejado, palavra por palavra, as 2 frases ficam prontas e "Pegar a MonsterBall" põe 1 'bola-monster' na
// mochila sem gastar estrela.
// Fechar no meio guarda as frases e o ponto onde parou ("Continuar a escrever").
// Jogo congelado; servidor e banco de TESTE novos (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { dedo } = require('../cenario-ponteiro');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'cursiva-'));
const BOLAS = `Reino.Itens.pecas().filter((p) => p.id === 'bola-monster' && (p.onde === 'mochila' || p.onde === 'bau')).length`;
const ABRIR_LOJA = 'void Reino.modulo("treinadores").acoes.treinadores({ tipo: "treinadores" }); 1';
// o traço da vez em px da página, da ponta até o fim (de 3 em 3 amostras)
const PONTOS = `(() => {
  const cv = document.querySelector('.tela-cursiva .cursiva-palco');
  if (!cv || !cv.dataset.ponta) return null;
  if (cv.dataset.ponta === 'fim') return { fim: true };
  const r = cv.getBoundingClientRect(), E = +cv.dataset.e, ox = +cv.dataset.ox, base = +cv.dataset.base, s = r.width / cv.width;
  const p = Reino.Cursiva.frase(cv.dataset.texto).palavras[+cv.dataset.palavra], [i, k] = cv.dataset.ponta.split(':').map(Number);
  const tr = p.tracos[i], pts = [];
  for (let j = k; j < tr.n + 3; j += 3) { const q = Math.min(j, tr.n - 1); pts.push([r.left + (ox + tr.x[q] * E) * s, r.top + (base - tr.y[q] * E) * s]); }
  return { pts, ponta: cv.dataset.ponta, palavra: p.texto, xa: E * s };
})()`;
const DICA = `document.querySelector('.tela-cursiva .cursiva-dica').textContent`;
const PONTA = `document.querySelector('.tela-cursiva .cursiva-palco').dataset.ponta`;

test('cursiva: escrever 2 frases na loja da Kiara dá 1 MonsterBall; o caminho errado não pinta', { timeout: 300000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', estrelas: 0, pasta: pasta() });
  const d = await dedo(c, 'toque');
  // segue o traço da vez com o dedo, do começo ao fim
  async function tracar(max) {
    const q = await c.js(PONTOS);
    if (!q || q.fim) return q;
    const pts = q.pts.slice(0, max || q.pts.length);
    await d.down(pts[0][0], pts[0][1]);
    for (const [x, y] of pts.slice(1)) await d.move(x, y);
    await d.up();
    await c.avancar(32);
    return q;
  }
  try {
    assert.strictEqual(await c.js(BOLAS), 0);
    await c.js(ABRIR_LOJA);
    await c.avancar(600);
    assert.match(await c.js(`document.querySelector('[data-id="bola-monster"] .treinadores-escrever').textContent`), /Escrever 2 frases/, 'o botão no cartão da MonsterBall');
    await c.tocar('.treinadores-escrever');
    await c.avancar(600);
    assert.strictEqual(await c.js(`!!document.querySelector('.tela-cursiva .cursiva-palco')`), true, 'a tela de escrever abriu');
    assert.match(await c.js(`document.querySelector('.tela-cursiva .cursiva-conta').textContent`), /Frase 1 de 2/);
    const frases = [await c.js(`document.querySelector('.tela-cursiva .cursiva-palco').dataset.texto`)];
    assert.ok((await c.js('Reino.Cursiva.frases()')).includes(frases[0]), 'a frase é do banco');
    assert.strictEqual(await c.js(PONTA), '0:0');

    // tocar longe da bolinha verde não começa
    const q0 = await c.js(PONTOS), [x0, y0] = q0.pts[0], ul = q0.pts[q0.pts.length - 1];
    await d.down(ul[0], ul[1]);
    for (let i = 1; i <= 6; i++) await d.move(ul[0] - i * 6, ul[1]);
    await d.up();
    await c.avancar(100);
    assert.strictEqual(await c.js(PONTA), '0:0', 'longe da ponta: nada pinta');
    assert.match(await c.js(DICA), /bolinha verde/);
    // na bolinha, para baixo e para trás (o certo é o caminho do tracejado): nada pinta
    await c.avancar(1000);
    await d.down(x0, y0);
    for (let i = 1; i <= 10; i++) await d.move(x0 - i * 2, y0 + i * 6);
    await d.up();
    await c.avancar(100);
    assert.strictEqual(await c.js(PONTA), '0:0', 'para baixo: bloqueado');
    // primeiro "Por aí não!"; longe demais, soltou: "Ops! Comece de novo na bolinha verde."
    assert.match(await c.js(DICA), /Por aí não! Siga a setinha\.|Comece de novo na bolinha verde\./);

    // um pedaço do 1º traço, fechar no meio e voltar: continua do mesmo ponto
    await tracar(12);
    const meio = await c.js(PONTA);
    assert.notStrictEqual(meio, '0:0', 'seguindo o tracejado, pinta');
    await c.tocar('.tela-cursiva .btn-fechar');
    await c.avancar(600);
    assert.match(await c.js(`document.querySelector('.treinadores-escrever').textContent`), /Continuar a escrever/);
    assert.strictEqual(await c.js(BOLAS), 0, 'fechou no meio: sem bola');
    await c.tocar('.treinadores-escrever');
    await c.avancar(600);
    assert.strictEqual(await c.js(PONTA), meio, 'voltou no mesmo ponto');
    assert.strictEqual(await c.js(`document.querySelector('.tela-cursiva .cursiva-palco').dataset.texto`), frases[0], 'as mesmas frases');

    // escreve tudo: palavra por palavra, as 2 frases
    let voltas = 0;
    while (voltas++ < 120) {
      if (await c.js(`!document.querySelector('.tela-cursiva .cursiva-pegar').hidden`)) break;
      const q = await tracar();
      if (!q || q.fim) await c.avancar(1200);
      const t = await c.js(`document.querySelector('.tela-cursiva .cursiva-palco').dataset.texto`);
      if (!frases.includes(t)) frases.push(t);
    }
    assert.strictEqual(frases.length, 2, 'duas frases diferentes');
    assert.match(await c.js(DICA), /Você escreveu as 2 frases!/);
    assert.strictEqual(await c.js(BOLAS), 0, 'a bola só sai no botão');
    await c.tocar('.tela-cursiva .cursiva-pegar');
    await c.avancar(600);
    assert.strictEqual(await c.js(`!!document.querySelector('.tela-cursiva')`), false, 'a tela de escrever fechou');
    assert.strictEqual(await c.js(BOLAS), 1, '1 MonsterBall');
    assert.strictEqual(await c.js('Reino.Progresso.estrelas()'), 0, 'sem gastar estrela');
    assert.match(await c.js(`document.querySelector('.tela-treinadores .vila-recado').textContent`), /Você ganhou 1 MonsterBall!/);
    assert.match(await c.js(`document.querySelector('.treinadores-escrever').textContent`), /Escrever 2 frases/, 'da próxima vez, frases novas');
    assert.deepStrictEqual(c.erros, [], 'sem erro no console');
  } finally {
    await c.fechar();
  }
});
