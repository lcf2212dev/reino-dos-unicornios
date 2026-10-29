// Pacotes de voz no jogo de verdade (vivo, sem congelar): a abertura só pede o `geral`; toda fala de um
// <matéria>-extra (guia, salas, pistas, unicórnios, também das matérias arquivadas) ainda toca, pedindo o pacote
// na hora; com o teto apertado, os pacotes saem da memória e voltam quando uma fala deles é pedida.
// O AudioContext é trocado por um de mentira (decodifica e "toca" na hora): o teste não depende do som da máquina.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const AC_FALSO = `(function () {
  var ac = { state: 'running',
    decodeAudioData: function (b, ok) { setTimeout(function () { ok({ length: 10, numberOfChannels: 1 }); }, 0); },
    createBufferSource: function () { return { connect: function () {}, stop: function () {},
      start: function () { var s = this; setTimeout(function () { if (s.onended) s.onended(); }, 0); } }; } };
  Reino.Som.contexto = function () { return ac; };
  Reino.Som.saidaVoz = function () { return {}; };
  Reino.Progresso.estado().ajustes.voz = true;   // o save sintético vem com a voz desligada (só na memória)
})()`;
const PEDIDOS = `[...document.querySelectorAll('script[src*="js/voz/"]')].map(function (s) { return s.src.replace(/^.*js\\/voz\\//, '').replace(/\\.js.*$/, ''); })`;

test('abertura só com o geral; falas dos -extra tocam e os pacotes saem e voltam', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', congelar: false, entrarDireto: true });
  try {
    await c.page.waitForFunction(() => Reino._motor && Reino._motor.jogoAtivo, null, { timeout: 60000, polling: 'raf' });
    assert.deepStrictEqual(await c.js(PEDIDOS), ['geral'], 'até o 1º quadro do mapa, só o geral');
    // depois, ocioso e com o geral em mãos, vem o -extra das matérias em uso (portugues4)
    await c.page.waitForFunction(() => Reino.Voz.memoriaPacotes().pacotes.includes('portugues4-extra'), null, { timeout: 60000 });
    await c.js(AC_FALSO);
    // teto apertado (6 MB): o portugues4-extra (7,5 MB) entra e sai a cada troca
    const r = await c.page.evaluate(async () => {
      var V = Reino.Voz, F = Reino.Falas;
      V.tetoPacotes = 6 * 1048576;
      var extras = F.todas().filter(function (f) { return /-extra$/.test(f.pacote); });
      var pacotes = {};
      for (var i = 0; i < extras.length; i++) {
        var f = extras[i];
        await V.falar({ texto: f.texto, voz: f.voz });
        pacotes[f.pacote] = true;
        // de vez em quando, um prédio grande no meio (empurra os -extra para fora)
        if (i % 60 === 59) await V.carregar('interior-quimica');
      }
      return { falas: extras.length, pacotes: Object.keys(pacotes).sort(), faltando: V.faltando.slice(), memoria: V.memoriaPacotes() };
    });
    assert.deepStrictEqual(r.faltando, []);
    assert.ok(r.pacotes.length >= 7, 'todos os -extra: ' + r.pacotes.join(', '));
    // cada -extra foi pedido pela rede (a tag de quem saiu já não está na página)
    const baixados = await c.js(`performance.getEntriesByType('resource').map(function (e) { return e.name; }).join(' ')`);
    r.pacotes.forEach((p) => assert.ok(baixados.includes('js/voz/' + p + '.js'), 'pedido: ' + p));
    // acima do teto só ficam os que nunca saem: o geral, o prédio atual e o último que chegou
    assert.ok(r.memoria.pacotes.length <= 3, 'memória limitada: ' + JSON.stringify(r.memoria));
    // uma fala do prédio que saiu volta a tocar
    const volta = await c.page.evaluate(async () => {
      var V = Reino.Voz;
      await V.carregar('interior-feira');
      await V.carregar('interior-quimica');
      await V.carregar('interior-feira');   // a Química deixa de ser o prédio atual e sai
      var antes = V.memoriaPacotes().pacotes.includes('interior-quimica');
      // uma fala que só a Química tem (a que também está no geral não precisaria do pacote)
      var todas = Reino.Falas.todas(), donos = {};
      todas.forEach(function (x) { var k = V.chave(x.voz, x.texto); (donos[k] = donos[k] || {})[x.pacote] = true; });
      var f = todas.find(function (x) { var d = Object.keys(donos[V.chave(x.voz, x.texto)]); return d.length === 1 && d[0] === 'interior-quimica'; });
      await V.falar({ texto: f.texto, voz: f.voz });
      return { antes: antes, depois: V.memoriaPacotes().pacotes.includes('interior-quimica'), faltando: V.faltando.slice() };
    });
    assert.deepStrictEqual(volta, { antes: false, depois: true, faltando: [] });
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
