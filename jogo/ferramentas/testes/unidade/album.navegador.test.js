// Álbum de fotos (ui/hud.js e sistemas/fotos-telas.js): o botão à vista abre o álbum com um toque, e a
// foto grande compartilha pela Web Share API (aqui falsa, um stub) ou cai no "Salvar no aparelho".
// Servidor e banco de TESTE novos por cenário (cenario.js); saves 100% sintéticos; fotos no IndexedDB do perfil de teste.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

// share/canShare falsos: modo 'ok' | 'abort' | 'erro' | 'sem' (sem canShare) | 'artifact' (canShare sim, mas
// window.claude.use existe; posto depois da carga, a nuvem já começou só no aparelho); conta os downloads (a.download)
const STUB = (modo) => `
  window.__t = { share: [], baixou: 0 };
  var clicar = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { if (this.download) { window.__t.baixou++; return; } return clicar.call(this); };
  if (${JSON.stringify(modo)} === 'artifact') window.claude = { use: function () { return new Promise(function () {}); } };
  if (${JSON.stringify(modo)} === 'sem') {
    Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
  } else {
    Object.defineProperty(navigator, 'canShare', { value: function (d) { return !!(d && d.files && d.files.length); }, configurable: true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: function (d) {
      var f = d.files[0];
      window.__t.share.push({ file: f instanceof File, tipo: f.type, nome: f.name, tamanho: f.size, titulo: d.title });
      if (${JSON.stringify(modo)} === 'abort') return Promise.reject(new DOMException('cancelou', 'AbortError'));
      if (${JSON.stringify(modo)} === 'erro') return Promise.reject(new DOMException('não deu', 'NotAllowedError'));
      return Promise.resolve();
    } });
  }`;

// relógio congelado: anda aos poucos até a condição valer (o IndexedDB responde fora do relógio)
async function espera(c, js) {
  for (let i = 0; i < 100; i++) {
    if (await c.js(js)) return;
    await c.avancar(100);
    await c.page.waitForTimeout(20);
  }
  throw new Error('não aconteceu: ' + js);
}
const visivel = (sel) => `(function () { var b = document.querySelector('${sel}'); return !!(b && !b.hidden && b.offsetParent); })()`;

async function comUmaFoto(modo, fn) {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: '/tmp/reino-testes/ver/teste-album' });
  try {
    await c.js(STUB(modo));
    // o botão do álbum, à vista no HUD: um toque abre (vazio, com a mensagem gentil)
    await c.tocar('#hud .btn-album');
    await espera(c, "!!document.querySelector('.tela-fotos-album .fotos-msg')");
    assert.match(await c.js("document.querySelector('.tela-fotos-album').textContent"), /O álbum ainda está vazio/);
    await c.js('Reino.UI.fecharTodas()');
    await c.avancar(400);
    // tira e guarda uma foto
    await c.js('void Reino.Fotos.tirar()');   // (sem esperar: a promessa só acaba quando a prévia fecha)
    await espera(c, visivel('.fotos-guardar'));
    await c.tocar('.fotos-guardar');
    await espera(c, '!document.querySelector(".tela-fotos-previa") && Reino.Fotos.depurar().quantidade === 1');
    await c.avancar(400);
    await c.tocar('#hud .btn-album');
    await espera(c, "!!document.querySelector('.fotos-mini')");
    await c.tocar('.fotos-mini');
    await espera(c, "!!document.querySelector('.tela-fotos-ver .fotos-salvar')");
    await fn(c);
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
}
const t = (c) => c.js('window.__t');
const dica = (c) => c.js("(function () { var d = document.querySelector('.tela-fotos-ver .fotos-dica'); return d ? d.textContent : ''; })()");
const callout = (c) => c.js("getComputedStyle(document.querySelector('.tela-fotos-ver .fotos-img')).webkitTouchCallout");
const msg = (c) => c.js("(function () { var m = document.querySelector('.tela-fotos-ver .fotos-msg'); return m.hidden ? '' : m.textContent; })()");

test('Compartilhar: chama share com um File PNG da foto', async () => {
  await comUmaFoto('ok', async (c) => {
    assert.ok(await c.js(visivel('.fotos-compartilhar')), 'o Compartilhar aparece');
    assert.strictEqual(await dica(c), '', 'com o Compartilhar, sem dica');
    await c.tocar('.fotos-compartilhar');
    await c.avancar(300);
    const r = await t(c);
    assert.strictEqual(r.share.length, 1);
    assert.ok(r.share[0].file && r.share[0].tipo === 'image/png' && r.share[0].tamanho > 0, JSON.stringify(r.share[0]));
    assert.match(r.share[0].nome, /^reino-.*\.png$/);
    assert.strictEqual(r.baixou, 0);
    assert.strictEqual(await msg(c), '');
  });
});

test('Compartilhar cancelado (AbortError): nenhum aviso, nada baixado', async () => {
  await comUmaFoto('abort', async (c) => {
    await c.tocar('.fotos-compartilhar');
    await c.avancar(300);
    const r = await t(c);
    assert.strictEqual(r.share.length, 1);
    assert.strictEqual(r.baixou, 0);
    assert.strictEqual(await msg(c), '');
    assert.strictEqual(await c.js("document.querySelector('.fotos-compartilhar').disabled"), false);
  });
});

test('Compartilhar com erro de verdade: salva no aparelho', async () => {
  await comUmaFoto('erro', async (c) => {
    await c.tocar('.fotos-compartilhar');
    await c.avancar(300);
    assert.strictEqual((await t(c)).baixou, 1);
    assert.match(await msg(c), /salva no aparelho/);
  });
});

test('sem canShare: sem o Compartilhar, o "Salvar no aparelho" é o principal e baixa', async () => {
  await comUmaFoto('sem', async (c) => {
    assert.strictEqual(await c.js(visivel('.fotos-compartilhar')), false);
    assert.ok(await c.js("document.querySelector('.tela-fotos-ver .fotos-salvar').classList.contains('btn-principal')"));
    assert.strictEqual(await dica(c), 'Segure a foto para compartilhar ou salvar.');
    assert.notStrictEqual(await callout(c), 'none', 'segurar a foto abre o menu do navegador');
    await c.tocar('.tela-fotos-ver .fotos-salvar');
    assert.strictEqual((await t(c)).baixou, 1);
    assert.match(await msg(c), /salva no aparelho/);
  });
});

test('no artifact do claude.ai: sem Compartilhar nem Salvar (lá não funcionam), com a dica; Apagar fica', async () => {
  await comUmaFoto('artifact', async (c) => {
    // a foto grande já estava aberta antes do window.claude: abre de novo
    await c.js('Reino.UI.fecharTodas()');
    await c.avancar(400);
    await c.tocar('#hud .btn-album');
    await espera(c, "!!document.querySelector('.fotos-mini')");
    await c.tocar('.fotos-mini');
    await espera(c, "!!document.querySelector('.tela-fotos-ver .fotos-apagar')");
    assert.strictEqual(await c.js(visivel('.tela-fotos-ver .fotos-compartilhar')), false);
    assert.strictEqual(await c.js(visivel('.tela-fotos-ver .fotos-salvar')), false);
    assert.ok(await c.js(visivel('.tela-fotos-ver .fotos-apagar')));
    assert.strictEqual(await dica(c), 'Segure a foto para compartilhar ou salvar.');
    assert.notStrictEqual(await callout(c), 'none');
  });
});
