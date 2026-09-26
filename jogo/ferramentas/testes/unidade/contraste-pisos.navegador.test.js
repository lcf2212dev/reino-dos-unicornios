// Teste de NAVEGADOR (Chromium, servidor de TESTE): contraste do chão de cada cômodo com o contorno da Mariana.
// Para cada interior e cômodo, desenha 4×4 tiles do piso com a paleta efetiva do cômodo
// (Reino._interiores.paletaComodo), lê os pixels e exige MEDIANA da razão WCAG contra Reino.Desenho.K ≥ 2,9.
// Exceções com motivo em validar/contraste.js. Também confere a conta (luminância e razão) no Node.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/contraste-pisos.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const CT = require('../../validar/contraste');

test('contraste: conta WCAG (preto × branco = 21, igual = 1)', () => {
  const b = CT.luminancia(255, 255, 255), p = CT.luminancia(0, 0, 0);
  assert.ok(Math.abs(CT.razao(b, p) - 21) < 1e-9);
  assert.strictEqual(CT.razao(b, b), 1);
  assert.strictEqual(CT.mediana([3, 1, 2]), 2);
});

test('contraste: chão de cada cômodo x contorno da Mariana (mediana ≥ 2,9)', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  try {
    const { page } = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await page.waitForFunction(() => window.Reino && Reino._interiores && Reino._interiores.paletaComodo && Reino.interiores.length, null, { timeout: 30000 });
    // pixels do piso (4×4 tiles) de cada cômodo, como [r,g,b] únicos com contagem
    const pisos = await page.evaluate(() => {
      const II = Reino._interiores, T = II.T || 16, out = [];
      Reino.interiores.forEach((d) => (d.comodos || []).forEach((c) => {
        const pc = II.paletaComodo(c);
        const cv = document.createElement('canvas'); cv.width = cv.height = 4 * T;
        const ctx = cv.getContext('2d');
        for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) pc.piso.desenhar(ctx, x * T, y * T, x + 3, y + 5, pc.p);
        const px = ctx.getImageData(0, 0, cv.width, cv.height).data, cont = {};
        for (let i = 0; i < px.length; i += 4) { if (px[i + 3] < 128) continue; const k = px[i] + ',' + px[i + 1] + ',' + px[i + 2]; cont[k] = (cont[k] || 0) + 1; }
        out.push({ chave: d.id + ':' + c.id, piso: c.piso || 'taco', cont });
      }));
      return out;
    });
    assert.ok(pisos.length > 10, 'poucos cômodos: ' + pisos.length);
    const lk = CT.luminancia(...CT.hexParaRgb(CT.CONTORNO));
    const falhas = [], sobrando = [];
    pisos.forEach((p) => {
      const vals = [];
      Object.entries(p.cont).forEach(([k, n]) => { const r = CT.razao(CT.luminancia(...k.split(',').map(Number)), lk); for (let i = 0; i < n; i++) vals.push(r); });
      const med = CT.mediana(vals);
      if (med >= CT.MINIMO) { if (CT.EXCECOES[p.chave]) sobrando.push(p.chave); return; }
      if (!CT.EXCECOES[p.chave]) falhas.push(`${p.chave} (piso ${p.piso}): mediana ${med.toFixed(2)}`);
    });
    assert.deepStrictEqual(falhas, [], 'chão com pouco contraste com o contorno da Mariana:\n' + falhas.join('\n'));
    // exceção que já passa (ou cômodo que sumiu) deve sair da lista
    const chaves = new Set(pisos.map((p) => p.chave));
    Object.keys(CT.EXCECOES).forEach((k) => { if (!chaves.has(k)) sobrando.push(k + ' (não existe)'); });
    assert.deepStrictEqual(sobrando, [], 'exceções sem uso em validar/contraste.js:\n' + sobrando.join('\n'));
  } finally { await browser.close(); servidor.parar(); }
});
