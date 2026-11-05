// Casa do jogador, poses dos usos (casa.md §13; Reino._casaUsos, js/sistemas/casa-usos-animar.js e casa-usos-poses-*.js):
// 1) prancha: cada pose (sentar, deitar ela e o unicórnio, banho dela, chuveiro ela e o unicórnio, cozinhar) em cada
//    móvel e em cada direção que ele aceita, desenhada com um pintor de teste por cima do desenho do móvel; confere que
//    desenha algo e salva as pranchas em /tmp/reino-testes/cu-poses/ para olhar;
// 2) no jogo: peças colocadas por Reino.Casa.colocar num save sintético, I.animar direto: a cena fica ocupada, os
//    toques são engolidos, pular só depois de pularDepoisMs, o temporizador de segurança libera, versão curta, o desenho
//    normal dela some pelo gancho de jogador-desenho.js; fotos nos 3 tamanhos. Servidor de TESTE (cenario.js).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');

const PASTA = '/tmp/reino-testes/cu-poses';
const MATERIAS = ['ingles4', 'historia4', 'matematica4', 'ciencias4', 'geografia4', 'portugues4'];

// [uso, quem, objeto, direções]
const CASOS = [
  ['sentar', 'ela', 'casa-estar-sofa', 4], ['sentar', 'ela', 'casa-estar-poltrona', 4], ['sentar', 'ela', 'casa-jantar-cadeira', 4],
  ['sentar', 'ela', 'casa-quarto-jogador-cadeira', 4], ['sentar', 'ela', 'casa-cozinha-banquinho', 1], ['sentar', 'ela', 'casa-movel-pufe', 1],
  ['sentar', 'ela', 'casa-movel-banco', 2], ['sentar', 'ela', 'casa-movel-banco-banho', 2],
  ['deitar', 'ela', 'casa-quarto-jogador-cama', 4], ['deitar', 'ela', 'casa-movel-cama-dossel', 4], ['deitar', 'ela', 'casa-movel-beliche', 4], ['deitar', 'ela', 'casa-movel-cama-foguete', 4],
  ['deitar', 'uni', 'casa-quarto-jogador-cama', 4], ['deitar', 'uni', 'casa-movel-cama-dossel', 4], ['deitar', 'uni', 'casa-movel-beliche', 4], ['deitar', 'uni', 'casa-movel-cama-foguete', 4],
  ['deitar', 'uni', 'casa-quarto-uni-almofadao', 2], ['deitar', 'uni', 'casa-movel-caminha-nuvem', 2],
  ['banho', 'ela', 'casa-banheiro-banheira', 4],
  ['chuveiro', 'ela', 'casa-movel-chuveiro', 1], ['chuveiro', 'uni', 'casa-movel-chuveiro', 1],
  ['cozinhar', 'ela', 'casa-cozinha-fogao', 4],
];

// desenha cada caso num canvas próprio (px do jogo, 1:1) e junta numa prancha por uso, ampliada
const PRANCHA = (casos, frac, animar) => `(function () {
  var I = Reino._casaUsos, OBJ = Reino._interiores.OBJETOS, J = Jogador, T = 16, ESC = 4, out = { casos: [], pranchas: {} };
  function dirs(n) { return n >= 4 ? ['baixo', 'cima', 'esq', 'dir'] : n === 2 ? ['baixo', 'esq'] : ['baixo']; }
  function pintor(ctx) {
    return { ctx: ctx, escala: 1, dpr: 1, cam: { x: 0, y: 0 }, tela: function (x, y) { return { x: x, y: y }; },
      ret: function (x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
      sprite: function (img, x, yPes) { ctx.drawImage(img, Math.round(x - img.width / 2), Math.round(yPes - img.height)); } };
  }
  function cena(lib, obj, base) {
    var cv = document.createElement('canvas'); cv.width = 8 * T; cv.height = 8 * T;
    var ctx = cv.getContext('2d'); ctx.fillStyle = '#f6e7d2'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#ead6bd'; for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) if ((x + y) % 2) ctx.fillRect(x * T, y * T, T, T);
    if (lib) lib.desenhar(ctx, obj.x * T, obj.y * T, obj, Reino.Progresso.estado());
    else { ctx.strokeStyle = '#3a2446'; ctx.setLineDash([2, 2]); ctx.strokeRect(obj.x * T + 0.5, obj.y * T + 0.5, obj.w * T - 1, obj.h * T - 1); }
    return cv;
  }
  var linhas = {};
  ${JSON.stringify(casos)}.forEach(function (c) {
    var uso = c[0], quem = c[1], tipo = c[2], lib = OBJ[tipo];
    dirs(c[3]).forEach(function (dir) {
      var lado = dir === 'esq' || dir === 'dir', w0 = lib ? lib.w : 2, h0 = lib ? lib.h : 2;
      var obj = { tipo: tipo, uid: 'teste.' + tipo, x: 2, y: 3, w: lado ? h0 : w0, h: lado ? w0 : h0, dir: dir };
      // ela (e a montaria) ao lado do móvel, olhando para ele: na frente dele
      var W = obj.w * T, Hh = obj.h * T, px = obj.x * T, py = obj.y * T;
      var viz = dir === 'baixo' ? { x: px + W / 2, y: py + Hh + 12 } : dir === 'cima' ? { x: px + W / 2, y: py - 4 }
        : dir === 'esq' ? { x: px - 10, y: py + Hh - 4 } : { x: px + W + 10, y: py + Hh - 4 };
      var ax = J.x, ay = J.y, ox = J.olharX, oy = J.olharY;
      J.x = viz.x; J.y = viz.y; J.olharX = px + W / 2 - viz.x; J.olharY = py + Hh / 2 - viz.y;
      var st = { uso: uso, quem: quem, obj: obj, uniId: Reino.Progresso.montaria(), montado: J.montado(), curta: false,
        dur: 4000, inicio: 0, comecou: true, fim: false, pulou: false };
      var r = { uso: uso, quem: quem, tipo: tipo, dir: dir, erro: null, mudou: 0 };
      try {
        st.geo = I.poses[uso].geo(st);
        var cv = cena(lib, obj), antes = cena(lib, obj).getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
        var p = pintor(cv.getContext('2d')), e = ${frac} * st.dur;
        var its = I.poses[uso].itens(p, st, e, ${animar}).slice();
        // os móveis altos entram na ordem por y como na cena (a peça é o item y = base - 1)
        if (lib && lib.alto) its.push({ y: py + Hh - 1, desenhar: function () { lib.desenhar(cv.getContext('2d'), px, py, obj, null); } });
        its.sort(function (a, b) { return a.y - b.y; }).forEach(function (it) { it.desenhar(); });
        if (I.poses[uso].sobre) I.poses[uso].sobre(p, st, e, ${animar});
        var depois = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
        for (var i = 0; i < depois.length; i += 4) if (depois[i] !== antes[i] || depois[i + 1] !== antes[i + 1] || depois[i + 2] !== antes[i + 2]) r.mudou++;
        (linhas[uso + '-' + quem] = linhas[uso + '-' + quem] || []).push({ cv: cv, rotulo: tipo.replace(/^casa-(movel-)?/, '') + ' ' + dir });
      } catch (x) { r.erro = String(x && x.stack || x); }
      J.x = ax; J.y = ay; J.olharX = ox; J.olharY = oy;
      out.casos.push(r);
    });
  });
  Object.keys(linhas).forEach(function (k) {
    var l = linhas[k], col = 4, cel = 8 * T * ESC, rot = 14;
    var pr = document.createElement('canvas'); pr.width = col * (cel + 8); pr.height = Math.ceil(l.length / col) * (cel + rot + 8);
    var g = pr.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#ffffff'; g.fillRect(0, 0, pr.width, pr.height);
    l.forEach(function (x, i) {
      var cx = (i % col) * (cel + 8), cy = Math.floor(i / col) * (cel + rot + 8);
      g.fillStyle = '#3a2446'; g.font = '12px sans-serif'; g.fillText(x.rotulo, cx + 2, cy + 11);
      g.drawImage(x.cv, cx, cy + rot, cel, cel);
    });
    out.pranchas[k] = pr.toDataURL();
  });
  return out;
})()`;

function salvarPng(nome, url) {
  fs.mkdirSync(PASTA, { recursive: true });
  const arq = path.join(PASTA, nome + '.png');
  fs.writeFileSync(arq, Buffer.from(url.split(',')[1], 'base64'));
  return arq;
}

test('poses: cada uso em cada móvel e direção desenha algo (pranchas em /tmp/reino-testes/cu-poses/)', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', pasta: path.join(PASTA, 'cenario-prancha') });
  try {
    for (const [sufixo, frac, animar] of [['', 0.5, true], ['-parada', 0.5, false], ['-pulinho', 0.04, true]]) {
      const r = await c.js(PRANCHA(CASOS, frac, animar));
      for (const [k, url] of Object.entries(r.pranchas)) salvarPng('prancha-' + k + sufixo, url);
      for (const x of r.casos) {
        const onde = `${x.uso}/${x.quem} ${x.tipo} ${x.dir}${sufixo}`;
        assert.strictEqual(x.erro, null, onde);
        // no pulinho, quem sai de trás de um móvel alto ainda está escondido atrás dele
        if (!sufixo.includes('pulinho')) assert.ok(x.mudou > 40, `${onde}: desenhou só ${x.mudou} px`);
      }
    }
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});

// coloca uma peça de um kit no 1º lugar livre do andar e devolve o objeto (com o uid) e o tile da frente dele
const COLOCAR = (kit, item, andar, dir) => `(function () {
  var C = Reino.Casa;
  if (C.kitsGanhos().indexOf(${JSON.stringify(kit)}) < 0) C.escolherKit(${JSON.stringify(kit)});
  var p = C.pecas(${JSON.stringify(kit)}).filter(function (x) { return x.item === ${JSON.stringify(item)}; })[0];
  var d = Reino.Interiores.def(${JSON.stringify(andar)}), pos = null;
  for (var y = 3; y < d.tamanho.h - 3 && !pos; y++) for (var x = 2; x < d.tamanho.w - 3 && !pos; x++) {
    if (C.podeColocar(p.uid, ${JSON.stringify(andar)}, x, y, ${JSON.stringify(dir)}).ok) pos = { x: x, y: y };
  }
  if (!pos || !C.colocar(p.uid, ${JSON.stringify(andar)}, pos.x, pos.y, ${JSON.stringify(dir)})) return null;
  var o = C.objetosDoAndar(${JSON.stringify(andar)}).filter(function (o) { return o.tipo === p.objeto && o.x === pos.x && o.y === pos.y; })[0];
  var w = o.w || Reino._interiores.OBJETOS[o.tipo].w, h = o.h || Reino._interiores.OBJETOS[o.tipo].h;
  return { tipo: o.tipo, uid: p.uid, x: o.x, y: o.y, w: w, h: h, dir: o.dir || 'baixo' };
})()`;
// st de um uso (o mesmo formato que o casa-usos.js monta), com ela no tile da frente do móvel
const PREPARAR = (obj, uso, quem, extra) => `(function () {
  var o = ${JSON.stringify(obj)}, J = Jogador;
  J.posicionar(o.x + Math.floor(o.w / 2), o.y + o.h);
  J.virar(0, -1);
  var st = Object.assign({ uso: ${JSON.stringify(uso)}, quem: ${JSON.stringify(quem)}, obj: o, uniId: Reino.Progresso.montaria(),
    montado: J.montado(), inicio: 0, comecou: false, fim: false, pulou: false }, ${JSON.stringify(extra || {})});
  // o que o casa-usos.js (frente A) faz em volta da animação ainda é esqueleto: simula só aqui (a camada do módulo
  // 'casa-usos' e o gancho do desenho ligado à I.quemDesenha)
  var I = Reino._casaUsos;
  if (!Reino.modulo('casa-usos')) Reino.registrarModulo({ id: 'casa-usos', camada: { ativo: function () { return !!(I.st && I.itens); },
    itensDesenho: function (p, t, a) { return I.itens(p, t, a); }, sobre: function (ctx, p, t, a) { I.sobre(ctx, p, t, a); } } });
  Reino.CasaUsos.desenhandoEla = function () { return I.quemDesenha(I.st).ela; };
  Reino.CasaUsos.desenhandoUni = function () { return I.quemDesenha(I.st).uni; };
  window.__fimUso = null;
  I.animar(st).then(function (r) { window.__fimUso = r; });
  return true;
})()`;
const LER = `({ cena: Reino.Cena.ocupada(), st: !!Reino._casaUsos.st, dep: Reino._casaUsos.depurarAnim(), fim: window.__fimUso,
  itensJ: Jogador.itensDesenho(Reino._motor.pintor || { ret: function () {}, sprite: function () {}, tela: function () { return { x: 0, y: 0 }; } }, false).length,
  ela: Reino.CasaUsos.desenhandoEla(), uni: Reino.CasaUsos.desenhandoUni() })`;

async function tocarTela(c) {
  const vp = c.page.viewportSize();
  await c.page.mouse.click(Math.round(vp.width / 2), Math.round(vp.height / 2));
}

test('animar no jogo: cena ocupada, toque engolido, pular, segurança, versão curta e o gancho do desenho', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', materiasCompletas: MATERIAS, pasta: path.join(PASTA, 'cenario-ciclo') });
  try {
    await c.ir('casa');
    const sofa = await c.js(COLOCAR('estar', 'sofa', 'casa', 'baixo'));
    assert.ok(sofa, 'colocou o sofá');
    const dur = await c.js('Reino.config.casa.usos.sentarMs');
    const pularMs = await c.js('Reino.config.casa.usos.pularDepoisMs');
    await c.js(PREPARAR(sofa, 'sentar', 'ela', { curta: false }));
    let r = await c.js(LER);
    assert.strictEqual(r.cena, 'casa-uso');
    assert.ok(r.st && r.dep.ativo && r.dep.uso === 'sentar');
    assert.deepStrictEqual([r.ela, r.uni], [true, true]);
    assert.strictEqual(r.itensJ, 0, 'o desenho normal dela não sumiu');
    // toque antes de pularDepoisMs: engolido, não pula
    await tocarTela(c);
    r = await c.js(LER);
    assert.ok(r.st, 'pulou cedo demais');
    await c.avancar(pularMs + 100);
    await tocarTela(c);
    await c.avancar(600);
    r = await c.js(LER);
    assert.strictEqual(r.cena, null, 'a cena não foi liberada ao pular');
    assert.ok(!r.st);
    assert.deepStrictEqual(r.fim, { pulou: true });
    assert.deepStrictEqual([r.ela, r.uni], [false, false]);
    assert.ok(r.itensJ > 0, 'o desenho normal dela não voltou');

    // até o fim, sem tocar: termina sozinha na duração
    await c.js(PREPARAR(sofa, 'sentar', 'ela', { curta: false }));
    await c.avancar(dur + 300);
    r = await c.js(LER);
    assert.deepStrictEqual([r.cena, r.st, r.fim], [null, false, { pulou: false }]);

    // Enter pula; tecla de andar é engolida
    await c.js(PREPARAR(sofa, 'sentar', 'ela', { curta: false }));
    await c.avancar(pularMs + 100);
    await c.page.keyboard.press('ArrowLeft');
    r = await c.js(LER);
    assert.ok(r.st, 'seta pulou a animação');
    await c.page.keyboard.press('Enter');
    await c.avancar(100);
    r = await c.js(LER);
    assert.deepStrictEqual([r.cena, r.st, r.fim], [null, false, { pulou: true }]);

    // versão curta: sem st.curta, decide pelas Animações (o cenário congelado reduz o movimento) e dura curtaMs
    const curta = await c.js('Reino.config.casa.usos.curtaMs');
    await c.js(PREPARAR(sofa, 'deitar', 'uni', {}));
    r = await c.js(LER);
    assert.strictEqual(r.dep.curta, true);
    assert.deepStrictEqual([r.ela, r.uni], [false, true]);
    assert.ok(r.itensJ > 0, 'ela some quando só o unicórnio usa o móvel');
    await c.avancar(curta + 100);
    r = await c.js(LER);
    assert.deepStrictEqual([r.cena, r.st], [null, false]);

    // segurança: sem o temporizador do fim (aqui jogado fora de propósito), a cena é liberada em dur + 2 s
    await c.js(`(function () { var orig = window.setTimeout;
      window.setTimeout = function (fn, ms) { return ms === 1000 ? 0 : orig.apply(window, arguments); };
      try { ${PREPARAR(sofa, 'sentar', 'ela', { curta: false, dur: 1000 })}; } finally { window.setTimeout = orig; } })()`);
    await c.avancar(1500);
    r = await c.js(LER);
    assert.ok(r.st, 'o fim não devia ter vindo (temporizador jogado fora)');
    await c.avancar(1800);
    r = await c.js(LER);
    assert.deepStrictEqual([r.cena, r.st, r.fim], [null, false, { pulou: false }]);
    // a rede de segurança do casa-usos.js (frente A) encerra de fora: st.fim = true, st.pulou = true, I.st = null
    await c.js(PREPARAR(sofa, 'sentar', 'ela', { curta: false }));
    await c.js("var s = Reino._casaUsos.st; window.__velho = s; s.fim = true; s.pulou = true; Reino._casaUsos.st = null; void 0");
    await c.avancar(400);
    r = await c.js(LER);
    assert.deepStrictEqual([r.cena, r.st, r.fim, r.ela], [null, false, { pulou: true }, false], 'não terminou quando st.fim veio de fora');
    // encerrada de fora com um uso NOVO já começando: a velha não libera a ocupação do novo
    await c.js(PREPARAR(sofa, 'sentar', 'ela', { curta: false }));
    const novo = await c.js(`(function () { var I = Reino._casaUsos, velho = I.st; window.__fimVelho = null;
      velho.fim = true; velho.pulou = true; I.st = null;
      var st = { uso: 'deitar', quem: 'uni', obj: ${JSON.stringify(sofa)}, uniId: Reino.Progresso.montaria(), curta: false };
      I.st = st; Reino.Cena.ocupar('casa-uso');
      I.animar(st).then(function (r) { window.__fimNovo = r; });
      return { cena: Reino.Cena.ocupada(), uso: I.depurarAnim().uso, ativo: I.depurarAnim().ativo };
    })()`);
    assert.deepStrictEqual(novo, { cena: 'casa-uso', uso: 'deitar', ativo: true });
    await c.avancar(300);
    r = await c.js(LER);
    assert.deepStrictEqual([r.cena, r.st, r.uni], ['casa-uso', true, true], 'a velha mexeu na ocupação do uso novo');
    // I.st trocado por outro st (que esta animação não roda): não desenha nada
    const troca = await c.js(`(function () { var I = Reino._casaUsos, meu = I.st, outro = Object.assign({}, meu);
      I.st = outro; var res = { itens: I.itens(Reino._motor.pintor, 0, true).length, quem: I.quemDesenha(outro) };
      I.st = meu; return res; })()`);
    assert.deepStrictEqual(troca, { itens: 0, quem: { ela: false, uni: false } });
    await c.avancar(pularMs);
    await c.page.keyboard.press('Enter');
    await c.avancar(800);
    r = await c.js(LER);
    assert.deepStrictEqual([r.cena, r.st], [null, false]);
    // o banho do unicórnio na banheira é do Reino.Banho: aqui não desenha ninguém
    assert.deepStrictEqual(await c.js("Reino._casaUsos.quemDesenha({ uso: 'banho', quem: 'uni', comecou: true, fim: false, geo: {}, obj: {} })"), { ela: false, uni: false });
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});

// fotos no jogo: a pose no meio da animação (com Animações), nos 3 tamanhos
for (const tamanho of ['celular', 'tablet', 'notebook']) {
  test(`fotos no jogo (${tamanho}): sentada no sofá, deitada na cama e o unicórnio no almofadão`, async () => {
    const c = await abrirCenario({ tamanho, save: 'completo', materiasCompletas: MATERIAS, ajustes: { animacoes: true },
      pasta: path.join(PASTA, 'jogo-' + tamanho) });
    try {
      await c.ir('casa');
      const sofa = await c.js(COLOCAR('estar', 'sofa', 'casa', 'baixo'));
      await c.js(PREPARAR(sofa, 'sentar', 'ela', { curta: false, dur: 60000 }));
      await c.avancar(1500);
      await c.foto('sentar-sofa');
      await c.page.keyboard.press('Enter');   // pula para o fim
      await c.avancar(800);
      assert.strictEqual(await c.js('Reino.Cena.ocupada()'), null);
      await c.ir('casa-2');
      const cama = await c.js(COLOCAR('quarto-jogador', 'cama', 'casa-2', 'baixo'));
      const alm = await c.js(COLOCAR('quarto-uni', 'almofadao', 'casa-2', 'baixo'));
      assert.ok(cama && alm, 'colocou a cama e o almofadão');
      await c.js(PREPARAR(cama, 'deitar', 'ela', { curta: false, dur: 60000 }));
      await c.avancar(1500);
      await c.foto('deitar-cama');
      await c.page.keyboard.press('Enter');   // pula para o fim
      await c.avancar(800);
      assert.strictEqual(await c.js('Reino.Cena.ocupada()'), null);
      await c.js(PREPARAR(alm, 'deitar', 'uni', { curta: false, dur: 60000 }));
      await c.avancar(1500);
      await c.foto('deitar-almofadao');
      assert.strictEqual(await c.js('Reino._casaUsos.depurarAnim().uso'), 'deitar');
      assert.deepStrictEqual(c.erros || [], []);
    } finally { await c.fechar(); }
  });
}
