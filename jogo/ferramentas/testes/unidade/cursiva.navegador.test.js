// Letra cursiva na loja da Treinadora Kiara (docs/contratos/cursiva.md), com o dedo de verdade (toque pelo CDP, celular):
// no cartão da MonsterBall, "Escrever 2 frases" abre a tela de escrever com 2 frases do banco. Tocar longe da bolinha
// verde não começa; começar para baixo (o certo é subir) não pinta e avisa ("Por aí não!" e, longe, "Comece de novo…");
// seguindo o tracejado, palavra por palavra, as 2 frases ficam prontas e "Pegar a MonsterBall" põe 1 'bola-monster' na
// mochila sem gastar estrela.
// Fechar no meio guarda as frases e o ponto onde parou ("Continuar a escrever").
// 2º teste: a Mini por 1 frase e a Super por 3, cada uma no cartão dela e com as frases dela guardadas.
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
// cada cartão de bola tem o seu botão de escrever (Mini 1 frase, MonsterBall 2, Super 3)
const BOTAO = (id) => `[data-id="${id}"] .treinadores-escrever`;
const ESCREVER = BOTAO('bola-monster');
const TEM = (id) => `Reino.Itens.pecas().filter((p) => p.id === '${id}' && (p.onde === 'mochila' || p.onde === 'bau')).length`;
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
// o recado está à vista dentro do conteúdo que rola (não ficou para cima da tela)
const RECADO_A_VISTA = (tela) => `(() => { const m = document.querySelector('${tela} .vila-recado'), c = document.querySelector('${tela} .painel-conteudo');
  if (!m || m.hidden || !c) return false; const r = m.getBoundingClientRect(), k = c.getBoundingClientRect(); return r.top >= k.top - 1 && r.bottom <= k.bottom + 1; })()`;
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
    await c.tocar(ESCREVER);
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
    assert.match(await c.js(`document.querySelector('${ESCREVER}').textContent`), /Continuar a escrever/);
    assert.strictEqual(await c.js(BOLAS), 0, 'fechou no meio: sem bola');
    await c.tocar(ESCREVER);
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
    assert.match(await c.js(`document.querySelector('${ESCREVER}').textContent`), /Escrever 2 frases/, 'da próxima vez, frases novas');
    assert.deepStrictEqual(c.erros, [], 'sem erro no console');
  } finally {
    await c.fechar();
  }
});

test('cursiva: a Mini MonsterBall por 1 frase e a Super por 3, cada uma no cartão dela', { timeout: 300000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', estrelas: 3, pasta: pasta() });
  const d = await dedo(c, 'toque');
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
  const FRASE = `document.querySelector('.tela-cursiva .cursiva-palco').dataset.texto`;
  const CONTA = `document.querySelector('.tela-cursiva .cursiva-conta').textContent`;
  const botoes = () => c.js(`['bola-mini', 'bola-monster', 'bola-super'].map((id) => document.querySelector('[data-id="' + id + '"] .treinadores-escrever').textContent.trim())`);
  try {
    await c.js(ABRIR_LOJA);
    await c.avancar(600);
    assert.deepStrictEqual(await botoes(), ['Escrever 1 frase', 'Escrever 2 frases', 'Escrever 3 frases']);
    assert.deepStrictEqual(await c.js(`Reino.Treinadores.ofertas().map((o) => [o.id, o.frases])`), [['bola-mini', 1], ['bola-monster', 2], ['bola-super', 3]]);

    // a Super: 3 frases; fechar no meio guarda só as dela
    await c.tocar(BOTAO('bola-super'));
    await c.avancar(600);
    assert.match(await c.js(CONTA), /Frase 1 de 3/);
    const daSuper = await c.js(FRASE);
    await tracar(12);
    const meio = await c.js(PONTA);
    assert.notStrictEqual(meio, '0:0');
    await c.tocar('.tela-cursiva .btn-fechar');
    await c.avancar(600);
    assert.deepStrictEqual(await botoes(), ['Escrever 1 frase', 'Escrever 2 frases', 'Continuar a escrever']);
    assert.strictEqual(await c.js(TEM('bola-super')), 0, 'fechou no meio: sem bola');

    // a Mini: 1 frase, do começo ao fim
    await c.tocar(BOTAO('bola-mini'));
    await c.avancar(600);
    assert.strictEqual(await c.js(CONTA), 'Frase', 'uma frase só: sem "1 de 1"');
    assert.strictEqual(await c.js(PONTA), '0:0', 'a Mini começa do zero (não herda o ponto da Super)');
    const frases = [await c.js(FRASE)];
    let voltas = 0;
    while (voltas++ < 80) {
      if (await c.js(`!document.querySelector('.tela-cursiva .cursiva-pegar').hidden`)) break;
      const q = await tracar();
      if (!q || q.fim) await c.avancar(1200);
      const t = await c.js(FRASE);
      if (!frases.includes(t)) frases.push(t);
    }
    assert.strictEqual(frases.length, 1, 'uma frase só');
    assert.match(await c.js(DICA), /Você escreveu a frase!/);
    assert.strictEqual(await c.js(`document.querySelector('.tela-cursiva .cursiva-pegar').textContent`), 'Pegar a Mini MonsterBall');
    await c.tocar('.tela-cursiva .cursiva-pegar');
    await c.avancar(600);
    assert.deepStrictEqual(await c.js(`[${TEM('bola-mini')}, ${TEM('bola-monster')}, ${TEM('bola-super')}, Reino.Progresso.estrelas()]`), [1, 0, 0, 3], '1 Mini, sem gastar estrela');
    assert.match(await c.js(`document.querySelector('.tela-treinadores .vila-recado').textContent`), /Você ganhou 1 Mini MonsterBall!/);
    assert.match(await c.js(`document.querySelector('[data-id="bola-mini"] .treinadores-tem').textContent`), /Você tem 1/);
    assert.deepStrictEqual(await botoes(), ['Escrever 1 frase', 'Escrever 2 frases', 'Continuar a escrever'], 'a Super continua guardada');

    // de volta à Super: as mesmas frases, no mesmo ponto; pronta, dá 1 Super
    await c.tocar(BOTAO('bola-super'));
    await c.avancar(600);
    assert.deepStrictEqual([await c.js(FRASE), await c.js(PONTA)], [daSuper, meio], 'voltou no mesmo ponto');
    const daS = [daSuper];
    voltas = 0;
    while (voltas++ < 200) {
      if (await c.js(`!document.querySelector('.tela-cursiva .cursiva-pegar').hidden`)) break;
      const q = await tracar();
      if (!q || q.fim) await c.avancar(1200);
      const t = await c.js(FRASE);
      if (!daS.includes(t)) daS.push(t);
    }
    assert.strictEqual(daS.length, 3, 'três frases diferentes');
    assert.match(await c.js(DICA), /Você escreveu as 3 frases!/);
    assert.strictEqual(await c.js(`document.querySelector('.tela-cursiva .cursiva-pegar').textContent`), 'Pegar a Super MonsterBall');
    await c.tocar('.tela-cursiva .cursiva-pegar');
    await c.avancar(600);
    assert.deepStrictEqual(await c.js(`[${TEM('bola-mini')}, ${TEM('bola-monster')}, ${TEM('bola-super')}, Reino.Progresso.estrelas()]`), [1, 0, 1, 3], '1 Super, sem gastar estrela');
    assert.match(await c.js(`document.querySelector('.tela-treinadores .vila-recado').textContent`), /Você ganhou 1 Super MonsterBall!/);
    assert.strictEqual(await c.js(RECADO_A_VISTA('.tela-treinadores')), true, 'no celular, o recado da Super (3º cartão) entra na tela');
    assert.deepStrictEqual(await botoes(), ['Escrever 1 frase', 'Escrever 2 frases', 'Escrever 3 frases']);
    // os 3 botões cabem no cartão (nada cortado nem para fora)
    assert.deepStrictEqual(await c.js(`Array.from(document.querySelectorAll('.treinadores-escrever')).filter((b) => { const r = b.getBoundingClientRect(), k = b.closest('.treinadores-cartao').getBoundingClientRect(); return b.scrollWidth > b.clientWidth + 1 || r.left < k.left || r.right > k.right || r.height < 44; }).length`), 0);
    assert.deepStrictEqual(c.erros, [], 'sem erro no console');
  } finally {
    await c.fechar();
  }
});
