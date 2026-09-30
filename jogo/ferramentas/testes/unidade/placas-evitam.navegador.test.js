// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, congelado): a placa do cômodo (motor/
// interiores-placas.js, interiores.md §6.4 e §6.5) nunca fica embaixo do balão do NPC (#claude-balao, com o
// retrato e a plaquinha do nome), fica a 8 px CSS de qualquer retângulo do HUD (ui.md §10.18.2), não cobre objeto
// pendurado na parede nem móvel de chão alto que sobe nela, não é desenhada translúcida e tem fundo próprio (--laranja-claro, não o --papel dos chips),
// não invade outro cômodo (cruza no máximo um) e a do cômodo da Mariana nunca some (D12a-01).
// Cenas: as do D12c-02 e D12c-03 (conversa, tablet), as do D2A-08 (cômodo, notebook) e o corredor da escola com a
// câmera rolada (celular).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/placas-evitam.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');
const { lancar } = require('../navegador');

const CONVERSAS = [
  ['padrao-matematica', 'sala-matematica-m3'], ['padrao-matematica', 'sala-matematica-m4'], ['padrao-matematica', 'sala-matematica-m6'],
  ['museu', 'nina'], ['museu', 'taina'], ['observatorio-3', 'lab-lupa'], ['observatorio-3', 'lab-malu'], ['observatorio-3', 'lab-ravi'],
  ['geografia', 'geo-teo'], ['portugues', 'carlos'], ['portugues', 'brisa'], ['portugues', 'chocalho'],
  ['planeta-lua', 'lua-pipo'], ['bau', 'tostao'], ['castelo', 'aurora'],
];
const COMODOS = [['castelo', 'ala-ciencias'], ['escola', 'sala-matematica-3bim'], ['padrao-matematica', 'sala6'], ['museu', 'galeria1'], ['torre-relogio', null]];

// um quadro desenhado com o fillRect espiado: as placas (retângulo grande com o fundo da placa) em px CSS, o alfa na
// hora de pintar, os retângulos do HUD e do balão e os objetos de parede de cada cômodo, também em px CSS
function medirQuadro() {
  return (async function () {
    var V = Reino._motor, cv = V.canvas, P = CanvasRenderingContext2D.prototype, orig = P.fillRect, achou = [];
    var fundo = getComputedStyle(document.documentElement).getPropertyValue('--laranja-claro').trim().toLowerCase();
    var papel = getComputedStyle(document.documentElement).getPropertyValue('--papel').trim().toLowerCase();
    P.fillRect = function (x, y, w, h) {
      var f = String(this.fillStyle).toLowerCase();
      if (this.canvas === cv && (f === fundo || f === papel) && w > 40 && h > 20) achou.push({ x: x, y: y, w: w, h: h, alfa: this.globalAlpha, cor: f });
      return orig.apply(this, arguments);
    };
    try { await window.__congelar.avancar(48); } finally { P.fillRect = orig; }
    var c = cv.getBoundingClientRect(), k = cv.width / c.width;
    function css(r) { return { left: c.left + r.x / k, top: c.top + r.y / k, right: c.left + (r.x + r.w) / k, bottom: c.top + (r.y + r.h) / k, alfa: r.alfa, cor: r.cor }; }
    function caixa(e) { var r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, nome: e.className || e.id }; }
    var hud = [].map.call(document.querySelectorAll('#hud > *:not(.hud-topo), #hud .hud-topo > * > *'), caixa)
      .filter(function (r) { return r.right > r.left && r.bottom > r.top; });
    var b = document.getElementById('claude-balao'), balao = b && !b.hidden ? caixa(b) : null;
    var def = Reino.Interiores.def(Reino.Cena.atual().id), II = Reino._interiores, T = II.T;
    var tela = V.pintor && V.pintor.tela ? V.pintor.tela.bind(V.pintor) : function (x, y) { return { x: (x - V.cam.x) * V.escala, y: (y - V.cam.y) * V.escala }; };
    var parede = [];
    (def.objetos || []).forEach(function (o) {
      // de parede, ou de chão alto cujo desenho sobe até a faixa da parede do cômodo (suporte de armas, microscópio)
      var d = II.dimensoes(o);
      var alto = (def.comodos || []).some(function (k) { var r = k.rect; return o.x < r.x + r.w && o.x + d.w > r.x && o.y >= r.y && o.y < r.y + r.h && o.y * T - d.topo < (r.y + 2) * T; });
      if (!II.ehParede(o) && !alto) return;
      var a = tela(o.x * T, o.y * T - d.topo), z = tela((o.x + d.w) * T, (o.y + d.h) * T);
      parede.push({ left: c.left + a.x / k, top: c.top + a.y / k, right: c.left + z.x / k, bottom: c.top + z.y / k, nome: o.tipo + '@' + o.x + ',' + o.y });
    });
    // a moldura (1 u = 2 px CSS) fica fora do fundo: a placa inteira vai 2 px além do retângulo achado
    var comodos = (def.comodos || []).map(function (o) {
      var a = tela(o.rect.x * T, o.rect.y * T), z = tela((o.rect.x + o.rect.w) * T, (o.rect.y + o.rect.h) * T);
      var fp = tela(0, (o.rect.y + 2) * T);
      return { left: c.left + a.x / k, top: c.top + a.y / k, right: c.left + z.x / k, bottom: c.top + z.y / k, nome: o.id, chao: c.top + fp.y / k };
    });
    // a Mariana em pé (16×24 px do jogo acima dos pés) e meio tile, em px CSS
    var J = window.Jogador, ma = tela(J.x - 8, J.y - 24), mz = tela(J.x + 8, J.y), t0 = tela(0, 0), t8 = tela(T / 2, 0);
    var mari = { left: c.left + ma.x / k, top: c.top + ma.y / k, right: c.left + mz.x / k, bottom: c.top + mz.y / k, meio: (t8.x - t0.x) / k };
    return { mari: mari, comodos: comodos, placas: achou.map(css).map(function (r) { return Object.assign(r, { left: r.left - 2, top: r.top - 2, right: r.right + 2, bottom: r.bottom + 2 }); }), hud: hud, balao: balao, parede: parede };
  })();
}
function distancia(a, b) {   // 0 se cruzam; senão, a menor folga entre as bordas
  const dx = Math.max(b.left - a.right, a.left - b.right, 0), dy = Math.max(b.top - a.bottom, a.top - b.bottom, 0);
  return Math.max(dx, dy);
}
function cruza(a, b) { return a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5; }

function conferir(nome, m, falhas, semParede) {
  m.placas.forEach((p) => {
    const rot = `${nome}: placa em ${Math.round(p.left)},${Math.round(p.top)}`;
    if (p.alfa !== 1) falhas.push(`${rot} translúcida (globalAlpha ${p.alfa})`);
    if (p.cor !== m.placas[0].cor || /fff8ee/.test(p.cor)) falhas.push(`${rot} com o fundo dos chips (${p.cor})`);
    if (m.balao && cruza(p, m.balao)) falhas.push(`${rot} embaixo do balão`);
    m.hud.forEach((h) => { const d = distancia(p, h); if (d < 7.5) falhas.push(`${rot} a ${d.toFixed(1)} px de ${h.nome} (mínimo 8)`); });
    if (!semParede) m.parede.forEach((o) => { if (cruza(p, o)) falhas.push(`${rot} sobre ${o.nome}`); });
    const dentro = m.comodos.filter((o) => cruza(p, o)).map((o) => o.nome);
    // no chão (abaixo das 2 fileiras da parede do cômodo), a meio tile da Mariana (D2A-08)
    const noChao = m.comodos.some((o) => cruza(p, o) && p.top >= o.chao - 0.5);
    if (noChao) { const d = distancia(p, m.mari); if (d < m.mari.meio - 1) falhas.push(`${rot} no chão a ${d.toFixed(1)} px da Mariana (mínimo ${m.mari.meio.toFixed(1)})`); }
    if (dentro.length > 1) falhas.push(`${rot} invade outro cômodo (${dentro.join(', ')})`);
  });
}

test('placa do cômodo: fora do balão, a 8 px do HUD, fora dos objetos da parede, opaca e com fundo próprio', async () => {
  const browser = await lancar();
  const falhas = [];
  let comPlaca = 0;
  try {
    const t = await abrirCenario({ browser, tamanho: 'tablet', save: 'completo', pasta: '/tmp/reino-testes/ver/teste-placas-tablet' });
    try {
      for (const [interior, npc] of CONVERSAS) {
        await t.ir(interior);
        await t.js(`(function () {
          var cena = Reino.Cena.atual(), def = Reino.Interiores.def(${JSON.stringify(interior)});
          var npc = cena.npcs().find(function (n) { return n.id === ${JSON.stringify(npc)}; });
          var alvo = cena.alvoEm(npc.x * 16 + 8, npc.y * 16 + 4);
          if (alvo && alvo.tipo === 'npc' && alvo.npc === npc) { Jogador.posicionar(alvo.tile.x, alvo.tile.y); Jogador.virar(alvo.olhar.x, alvo.olhar.y); }
          else Jogador.posicionar(npc.x, npc.y + 1);
          Reino.NPCs.interagir(npc, { interior: def, cena: cena });
        })()`);
        await t.avancar(1200);
        const m = await t.page.evaluate(medirQuadro);
        assert.ok(m.balao, `${interior}/${npc}: o balão abriu`);
        if (m.placas.length) comPlaca++;
        conferir(`${interior}/${npc}`, m, falhas);
        await t.js('Reino.Claude.limpar()');
      }
    } finally { await t.fechar(); }
    const n = await abrirCenario({ browser, tamanho: 'notebook', save: 'completo', pasta: '/tmp/reino-testes/ver/teste-placas-notebook' });
    try {
      for (const [interior, comodo] of COMODOS) {
        await n.ir(interior);
        if (comodo) {
          await n.js(`(function () {
            var c = Reino.Interiores.def(${JSON.stringify(interior)}).comodos.find(function (k) { return k.id === ${JSON.stringify(comodo)}; }).rect;
            var cena = Reino.Cena.atual(), x = c.x + Math.floor(c.w / 2), y = c.y + Math.floor(c.h / 2);
            var p = cena.solido(x, y) ? cena.maisPerto(x, y, Jogador.tile()) : { x: x, y: y };
            Jogador.posicionar(p.x, p.y); Jogador.virar(0, 1);
          })()`);
        }
        await n.avancar(600);
        const m = await n.page.evaluate(medirQuadro);
        assert.ok(m.placas.length, `${interior}/${comodo}: nenhuma placa desenhada`);
        comPlaca++;
        conferir(`${interior}/${comodo || 'entrada'}`, m, falhas);
      }
    } finally { await n.fechar(); }
    // celular: os cômodos do D2A-08 (a placa descia para o chão colada nos pés da Mariana)
    const cc = await abrirCenario({ browser, tamanho: 'celular', save: 'completo', pasta: '/tmp/reino-testes/ver/teste-placas-celular-comodos' });
    try {
      for (const [interior, comodo] of [['castelo', 'ala-ciencias'], ['museu', 'galeria1']]) {
        await cc.ir(interior);
        await cc.js(`(function () {
          var c = Reino.Interiores.def(${JSON.stringify(interior)}).comodos.find(function (k) { return k.id === ${JSON.stringify(comodo)}; }).rect;
          var cena = Reino.Cena.atual(), x = c.x + Math.floor(c.w / 2), y = c.y + Math.floor(c.h / 2);
          var p = cena.solido(x, y) ? cena.maisPerto(x, y, Jogador.tile()) : { x: x, y: y };
          Jogador.posicionar(p.x, p.y); Jogador.virar(0, 1);
        })()`);
        await cc.avancar(600);
        const m = await cc.page.evaluate(medirQuadro);
        if (!m.placas.length) falhas.push(`celular ${interior}/${comodo}: nenhuma placa desenhada`);
        comPlaca++;
        conferir(`celular ${interior}/${comodo}`, m, falhas);
      }
    } finally { await cc.fechar(); }
    // Letras grandes (O-32): a letra da placa sobe um degrau (16 → 24 px CSS) e as regras seguem valendo
    for (const tam of ['celular', 'tablet', 'notebook']) {
      const lg = await abrirCenario({ browser, tamanho: tam, save: 'completo', pasta: '/tmp/reino-testes/ver/teste-placas-lg-' + tam });
      try {
        for (const [interior, comodo] of [['castelo', 'ala-ciencias'], ['museu', 'galeria1'], ['escola', null], ['bau', null], ['loja', null]]) {
          await lg.ir(interior);
          if (comodo) {
            await lg.js(`(function () {
              var c = Reino.Interiores.def(${JSON.stringify(interior)}).comodos.find(function (k) { return k.id === ${JSON.stringify(comodo)}; }).rect;
              var cena = Reino.Cena.atual(), x = c.x + Math.floor(c.w / 2), y = c.y + Math.floor(c.h / 2);
              var p = cena.solido(x, y) ? cena.maisPerto(x, y, Jogador.tile()) : { x: x, y: y };
              Jogador.posicionar(p.x, p.y); Jogador.virar(0, 1);
            })()`);
          }
          const alturas = [];
          for (const grande of [false, true]) {
            await lg.js(`document.documentElement.classList.toggle('letras-grandes', ${grande})`);
            await lg.avancar(600);
            const m = await lg.page.evaluate(medirQuadro);
            const nome = `${tam} ${interior}/${comodo || 'entrada'}${grande ? ' LG' : ''}`;
            if (!m.placas.length) { falhas.push(`${nome}: nenhuma placa desenhada`); continue; }
            comPlaca++;
            alturas.push(Math.max.apply(null, m.placas.map((p) => Math.round((p.bottom - p.top) * (p.right - p.left)))));
            conferir(nome, m, falhas);
          }
          if (alturas.length === 2 && !(alturas[1] > alturas[0])) falhas.push(`${tam} ${interior}: a placa não cresceu com Letras grandes (${alturas.join(' → ')})`);
          await lg.js(`document.documentElement.classList.remove('letras-grandes')`);
        }
      } finally { await lg.fechar(); }
    }
    // celular, corredor da escola: a Mariana anda de ponta a ponta (a câmera rola), com e sem o balão da Margarida;
    // a placa do cômodo dela aparece em todo quadro e nunca sobe para a sala de cima
    const cel = await abrirCenario({ browser, tamanho: 'celular', save: 'completo', pasta: '/tmp/reino-testes/ver/teste-placas-celular' });
    try {
      await cel.ir('escola');
      const larg = await cel.js(`Reino.Interiores.def('escola').comodos[0].rect.w`);
      for (const balao of [false, true]) {
        for (let x = 2; x < larg; x += 5) {
          await cel.js(`(function () {
            Reino.Claude.limpar(); Jogador.posicionar(${x}, 17); Jogador.virar(0, -1);
            if (${balao}) { var cena = Reino.Cena.atual(), npc = cena.npcs().find(function (n) { return n.id === 'margarida'; });
              Reino.NPCs.interagir(npc, { interior: Reino.Interiores.def('escola'), cena: cena }); }
          })()`);
          await cel.avancar(900);
          const m = await cel.page.evaluate(medirQuadro);
          const nome = `escola/corredor x=${x}${balao ? ' com balão' : ''}`;
          if (!m.placas.length) falhas.push(`${nome}: a placa do cômodo da Mariana sumiu`);
          comPlaca++;
          // com o balão no celular só sobra a faixa da parede: a do cômodo dela pode cobrir um enfeite de parede
          // (exceção do interiores.md §6.5), mas nunca some nem invade a sala de cima
          conferir(nome, m, falhas, balao);
        }
      }
      await cel.js('Reino.Claude.limpar()');
      // O-37: da entrada, -6, +6 e +12 tiles (como na auditoria), com e sem Letras grandes: a placa do corredor fica
      // inteira de um lado da passadeira ou sobre ela, e nunca cruza uma sala de cima
      await cel.ir('escola');
      const x0 = await cel.js('Jogador.tile().x'), y0 = await cel.js('Jogador.tile().y');
      for (const grande of [false, true]) {
        await cel.js(`document.documentElement.classList.toggle('letras-grandes', ${grande})`);
        for (const x of [x0 - 6, x0, x0 + 12]) {
          await cel.js(`Jogador.posicionar(${x}, ${y0})`);
          await cel.avancar(800);
          const m = await cel.page.evaluate(medirQuadro);
          const nome = `escola/corredor O-37 x=${x}${grande ? ' LG' : ''}`;
          conferir(nome, m, falhas);
          const pas = await cel.js(`(function () { var V = Reino._motor, cv = V.canvas, c = cv.getBoundingClientRect(), k = cv.width / c.width;
            var o = Reino.Interiores.def('escola').objetos.find(function (q) { return q.tipo === 'escola-passadeira'; });
            var a = V.pintor.tela(0, o.y * 16), z = V.pintor.tela(0, (o.y + o.h) * 16); return { top: c.top + a.y / k, bottom: c.top + z.y / k }; })()`);
          m.placas.forEach((p) => {
            const fora = m.comodos.filter((o) => o.nome !== 'corredor' && cruza(p, o)).map((o) => o.nome);
            if (fora.length) falhas.push(`${nome}: placa cruza ${fora.join(', ')}`);
            const meio = (a) => a > p.top + 0.5 && a < p.bottom - 0.5;
            if (meio(pas.top) || meio(pas.bottom)) falhas.push(`${nome}: placa meio em cima, meio fora da passadeira`);
          });
        }
      }
      await cel.js(`document.documentElement.classList.remove('letras-grandes')`);
    } finally { await cel.fechar(); }
  } finally { await browser.close(); }
  assert.ok(comPlaca >= 10, 'poucas cenas com placa: ' + comPlaca);
  assert.deepStrictEqual(falhas, [], falhas.join('\n'));
});
