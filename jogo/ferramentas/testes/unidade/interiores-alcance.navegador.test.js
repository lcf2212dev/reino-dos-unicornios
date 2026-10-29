// Corte do que está fora da câmera (interiores-cena.js): cada animação de móvel tem de ficar dentro da caixa dele
// (o sprite + ALCANCE_ANIM nos baixos, + FOLGA_ITEM nos altos). Desenha cada animação de cada interior por 15 s,
// parada e depois de cada toque que dispara uma animação (brincadeiras dos planetas e experiências da NASA), num
// contexto que anota até onde cada desenho chegou. Animação nova que dispara com toque de outro tipo: entre em TOQUES.
// Servidor e banco de TESTE novos (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const TOQUES = '-brincadeira$|^nasa-experiencia$';
// animação que dispara por uma ação que não está nos dados do objeto (tipo do objeto → ação): o foguete da NASA
// decola com a experiência 'foguete' (nasa-experiencias.js), a maior subida de todas
const EXTRAS = { 'nasa-foguete': { tipo: 'nasa-experiencia', exp: 'foguete' } };

// roda na página: mede um interior; devolve { animados, toques, passou: [...], maiorAcima }
async function medirInterior(id, toques) {
  var R = window.Reino, cena = R.Interiores.cena(id), def = R.Interiores.def(id);
  var cv = document.createElement('canvas'); cv.width = 8; cv.height = 8;
  var real = cv.getContext('2d'), caixa = null, trilha = [];
  function pt(x, y) { var m = real.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; }
  function pos(p) { if (!isFinite(p[0]) || !isFinite(p[1])) return; if (!caixa) caixa = [p[0], p[1], p[0], p[1]]; else { caixa[0] = Math.min(caixa[0], p[0]); caixa[1] = Math.min(caixa[1], p[1]); caixa[2] = Math.max(caixa[2], p[0]); caixa[3] = Math.max(caixa[3], p[1]); } }
  function ret(x, y, w, h) { pos(pt(x, y)); pos(pt(x + w, y)); pos(pt(x, y + h)); pos(pt(x + w, y + h)); }
  var ctx = new Proxy(real, {
    get: function (o, k) {
      var v = o[k];
      if (typeof v !== 'function') return v;
      return function () {
        var a = arguments;
        switch (k) {
          case 'fillRect': case 'strokeRect': case 'clearRect': ret(a[0], a[1], a[2], a[3]); break;
          case 'drawImage': if (a.length >= 9) ret(a[5], a[6], a[7], a[8]); else if (a.length >= 5) ret(a[1], a[2], a[3], a[4]); else ret(a[1], a[2], a[0].width, a[0].height); break;
          case 'putImageData': ret(a[1], a[2], a[0].width, a[0].height); break;
          case 'fillText': case 'strokeText': ret(a[1] - 50, a[2] - 20, 100, 40); break;
          case 'moveTo': case 'lineTo': trilha.push(pt(a[0], a[1])); break;
          case 'quadraticCurveTo': trilha.push(pt(a[0], a[1]), pt(a[2], a[3])); break;
          case 'bezierCurveTo': trilha.push(pt(a[0], a[1]), pt(a[2], a[3]), pt(a[4], a[5])); break;
          case 'arc': trilha.push(pt(a[0] - a[2], a[1] - a[2]), pt(a[0] + a[2], a[1] + a[2])); break;
          case 'ellipse': trilha.push(pt(a[0] - a[2], a[1] - a[3]), pt(a[0] + a[2], a[1] + a[3])); break;
          case 'rect': trilha.push(pt(a[0], a[1]), pt(a[0] + a[2], a[1] + a[3])); break;
          case 'beginPath': trilha = []; break;
          case 'fill': case 'stroke': trilha.forEach(pos); break;
        }
        return v.apply(o, a);
      };
    },
    set: function (o, k, v) { o[k] = v; return true; },
  });
  var animados = cena._objetos.filter(function (it) { return it.lib.anim; }), passou = [], maiorAcima = 0;
  function varrer(it, quando) {
    for (var t = quando === 'parada' ? 0 : 1; t <= 15000; t += 16) {
      caixa = null; trilha = []; real.setTransform(1, 0, 0, 1, 0, 0);
      it.lib.anim(ctx, it.px, it.py, t, it.o);
      if (!caixa) continue;
      var c = it.caixa, s = it.py - it.topo;
      maiorAcima = Math.max(maiorAcima, s - caixa[1]);
      var fora = Math.max(c.x0 - caixa[0], c.y0 - caixa[1], caixa[2] - c.x1, caixa[3] - c.y1);
      if (fora > 0) { passou.push(id + ': ' + it.o.tipo + ' (' + quando + ', t=' + t + ') passa ' + Math.ceil(fora) + ' px da caixa'); return; }
    }
  }
  animados.forEach(function (it) { varrer(it, 'parada'); });
  for (var i = 0; i < toques.length; i++) {
    for (var j = 0; j < animados.length; j++) {
      var q = toques[i];
      R.NPCs.executar(q.acao, q.npc ? { interior: def, npc: q.npc } : { interior: def, cena: cena, objeto: q.objeto });
      await window.__congelar.respirar(10);
      varrer(animados[j], 'toque ' + JSON.stringify(q.acao));
    }
  }
  return { animados: animados.length, toques: toques.length, passou: passou, maiorAcima: maiorAcima };
}

test('as animações dos móveis ficam dentro da caixa que o corte usa, paradas e depois do toque', async () => {
  const c = await abrirCenario({ tamanho: 'celular' });
  try {
    // animações ligadas (as de toque só disparam assim) e o balão respondendo na hora
    await c.js("Reino.Progresso.estado().ajustes.animacoes = true; Reino.util.reduzMovimentoSistema = false; Reino.Claude.falar = function () { return Promise.resolve(null); }; 0");
    const lista = await c.page.evaluate(([re, extras]) => Reino.interiores.map(function (d) {
      var cena = Reino.Interiores.cena(d.id), r = new RegExp(re), toques = 0;
      cena._objetos.forEach(function (it) { if ((it.o.acao && r.test(it.o.acao.tipo)) || extras[it.o.tipo]) toques++; });
      cena.npcs().forEach(function (n) { if (n.acao && r.test(n.acao.tipo)) toques++; });
      return { id: d.id, toques: toques };
    }), [TOQUES, EXTRAS]);
    const passou = [];
    let animados = 0, toques = 0, maiorAcima = 0;
    for (const d of lista) {
      // com toque, dentro do interior (a brincadeira pode depender da cena ativa)
      if (d.toques) await c.ir(d.id);
      const r = await c.page.evaluate(async ([id, re, extras, fn]) => {
        var cena = Reino.Interiores.cena(id), rx = new RegExp(re), toques = [];
        cena._objetos.forEach(function (it) {
          if (it.o.acao && rx.test(it.o.acao.tipo)) toques.push({ acao: it.o.acao, objeto: it.o });
          if (extras[it.o.tipo]) toques.push({ acao: extras[it.o.tipo], objeto: it.o });
        });
        cena.npcs().forEach(function (n) { if (n.acao && rx.test(n.acao.tipo)) toques.push({ acao: n.acao, npc: n }); });
        return (0, eval)('(' + fn + ')')(id, toques);
      }, [d.id, TOQUES, EXTRAS, medirInterior.toString()]);
      animados += r.animados; toques += r.toques; maiorAcima = Math.max(maiorAcima, r.maiorAcima); passou.push(...r.passou);
    }
    assert.ok(animados > 50 && toques > 20, `poucos animados (${animados}) ou toques (${toques}) medidos`);
    // o foguete da NASA decolando sobe ~180 px acima do sprite: sem isso, os toques não dispararam nada
    assert.ok(maiorAcima >= 150, `os toques não dispararam as animações (maior subida: ${maiorAcima} px)`);
    assert.deepStrictEqual(passou, []);
  } finally { await c.fechar(); }
});
