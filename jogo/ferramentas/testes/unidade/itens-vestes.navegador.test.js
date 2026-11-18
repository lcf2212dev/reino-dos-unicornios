// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético): as roupas de aventura no desenho dela
// (docs/contratos/itens.md §8). Sem vestes, PA.mariana e PA.montada saem pixel a pixel iguais aos do commit de base;
// cada capacete, chapéu, armadura, calça e botas aparece nas 5 vistas, a pé e montada (filhote e adulto), menina e menino,
// com ela até 21 px de altura a pé e os pés no mesmo lugar; PA.espadaItem/PA.escudoItem; os ícones item:<id> e
// bau-guardados; jogador-desenho.js passa Reino.Itens.vestes(). Pranchas para olhar em <REINO_TESTES>/itens-vestes/.
// Rodar (da raiz): npm run unidade -- --so itens-vestes
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const PASTA = path.join(PASTA_TESTES, 'itens-vestes');
const RAIZ = path.join(__dirname, '..', '..', '..', '..');
const CABECA = ['capacete-panela', 'capacete-cavaleira', 'capacete-polar', 'capacete-cristal', 'capacete-dragao',
  'chapeu-flor', 'chapeu-bruxinha', 'chapeu-gorro', 'chapeu-palha', 'chapeu-coroa'];
const ARMADURAS = ['armadura-colete', 'armadura-folhas', 'armadura-polar', 'armadura-cristal', 'armadura-dragao'];
const BOTAS = ['botas-galocha', 'botas-neve', 'botas-vento', 'botas-cristal', 'botas-dragao'];
// o Conjunto da Pluma (conteudo/itens/pluma.js): a única calça do jogo e as outras 5 peças da letra cursiva
const CALCAS = ['calca-pluma'];
const PLUMA = { espada: 'espada-pluma', escudo: 'escudo-pluma', cabeca: 'capacete-pluma', armadura: 'armadura-pluma', calca: 'calca-pluma', botas: 'botas-pluma' };
const ESPADAS = ['espada-madeira', 'espada-bambu', 'espada-gelo', 'espada-sol', 'espada-cristal', 'espada-dragao'];
const ESCUDOS = ['escudo-madeira', 'escudo-concha', 'escudo-neve', 'escudo-cristal', 'escudo-dragao'];
const ITENS = [...ESPADAS, ...ESCUDOS, ...CABECA, ...ARMADURAS, ...BOTAS, 'pocao-pequena', 'pocao-grande'];

// o pixelart-personagens.js do commit de base, para comparar o desenho sem vestes (vazio se o git não achar)
function personagensBase() {
  try { return execFileSync('git', ['show', 'HEAD:jogo/js/arte/pixelart-personagens.js'], { cwd: RAIZ, encoding: 'utf8' }); } catch (e) { return ''; }
}

const MEDIR = (arg) => `(function (a) {
  var VISTAS = ['frente', 'lado', 'costas', 'diagFrente', 'diagCostas'];
  var P = Reino.Progresso, def = P.defUni(P.montaria());
  function px(s) { return Array.from(s.canvas.getContext('2d').getImageData(0, 0, s.w, s.h).data).join(); }
  // altura de desenho (da 1ª à última linha com pixel)
  function altura(s) {
    var d = s.canvas.getContext('2d').getImageData(0, 0, s.w, s.h).data, a = -1, b = -1;
    for (var y = 0; y < s.h; y++) for (var x = 0; x < s.w; x++) if (d[(y * s.w + x) * 4 + 3]) { if (a < 0) a = y; b = y; }
    return b - a + 1;
  }
  // o PA de antes (sem vestes), num PA de mentira com cache próprio
  var velho = null;
  if (a.base) {
    var w = { PA: Object.assign({}, PA, { _interno: Object.assign({}, PA._interno, { cache: {} }) }) };
    new Function('window', a.base)(w);
    velho = w.PA;
  }
  var aps = { menina: Object.assign({}, PA.APARENCIA_PADRAO, { sexo: 'menina' }), menino: Object.assign({}, PA.APARENCIA_PADRAO, { sexo: 'menino' }) };
  var erros = [], medidas = {};
  // 1. sem vestes: igual ao de antes e igual com vestes vazias ou desconhecidas
  var vazias = [undefined, null, {}, { cabeca: null, armadura: null, calca: null, botas: null },
    { cabeca: 'xx', armadura: 'espada-gelo', calca: 'botas-neve', botas: 'chapeu-flor' }];
  Object.keys(aps).forEach(function (sx) {
    var ap = aps[sx];
    VISTAS.forEach(function (v) {
      [[false, 0], [false, 1], [false, 2], [true, 0]].forEach(function (q) {
        var ref = velho ? px(velho.mariana(ap, q[0], q[1], { vista: v })) : px(PA.mariana(ap, q[0], q[1], { vista: v }));
        vazias.forEach(function (vz, i) {
          var s = PA.mariana(ap, q[0], q[1], { vista: v, vestes: vz });
          if (px(s) !== ref) erros.push('sem vestes diferente: ' + sx + ' ' + v + ' ' + q + ' #' + i);
          if (s.topoExtra !== 0) erros.push('topoExtra sem vestes: ' + sx + ' ' + v);
        });
      });
      [1, 2].forEach(function (est) {
        var ref = velho ? px(velho.montada(def, est, 0, ap, { vista: v })) : px(PA.montada(def, est, 0, ap, { vista: v }));
        vazias.forEach(function (vz, i) {
          if (px(PA.montada(def, est, 0, ap, { vista: v, vestes: vz })) !== ref) erros.push('montada sem vestes diferente: ' + sx + ' ' + v + ' ' + est + ' #' + i);
        });
      });
    });
  });
  // 2. cada peça: aparece, cabe na altura, os pés não saem do lugar
  var pecas = [].concat(a.cabeca.map(function (id) { return { cabeca: id }; }), a.armaduras.map(function (id) { return { armadura: id }; }),
    a.calcas.map(function (id) { return { calca: id }; }), a.botas.map(function (id) { return { botas: id }; }));
  pecas.forEach(function (vz) {
    var id = vz.cabeca || vz.armadura || vz.calca || vz.botas, m = medidas[id] = { aPe: 0, montada: 0 };
    Object.keys(aps).forEach(function (sx) {
      var ap = aps[sx];
      VISTAS.forEach(function (v) {
        [0, 1, 2].forEach(function (q) {
          var s0 = PA.mariana(ap, false, q, { vista: v }), s = PA.mariana(ap, false, q, { vista: v, vestes: vz });
          if (px(s) === px(s0)) erros.push(id + ' não aparece: ' + sx + ' ' + v + ' a pé ' + q);
          var h = altura(s); m.aPe = Math.max(m.aPe, h);
          if (h > 21) erros.push(id + ': altura ' + h + ' > 21 (' + sx + ' ' + v + ')');
          if (s.h !== s0.h + s.topoExtra || s.w !== s0.w) erros.push(id + ': tamanho errado ' + sx + ' ' + v);
          if (vz.cabeca ? !(s.topoExtra >= 0 && s.topoExtra <= 4) : s.topoExtra !== 0) erros.push(id + ': topoExtra ' + s.topoExtra);
        });
        var c0 = PA.mariana(ap, true, 0, { vista: v }), c = PA.mariana(ap, true, 0, { vista: v, vestes: vz });
        if (px(c) === px(c0)) erros.push(id + ' não aparece sentada: ' + sx + ' ' + v);
        [1, 2].forEach(function (est) {
          var u0 = PA.montada(def, est, 0, ap, { vista: v }), u = PA.montada(def, est, 0, ap, { vista: v, vestes: vz });
          // na diagonal de frente a cabeça do unicórnio fica na frente do corpo dela: lá só a cabeça tem que aparecer
          if (px(u) === px(u0) && (vz.cabeca || v !== 'diagFrente')) erros.push(id + ' não aparece montada: ' + sx + ' ' + v + ' ' + est);
          var hu = altura(u), hu0 = altura(u0); m.montada = Math.max(m.montada, hu - hu0);
          if (hu > hu0 + 4) erros.push(id + ': montada ' + hu + ' > ' + hu0 + ' + 4 (' + sx + ' ' + v + ' ' + est + ')');
          if (u.topoExtra !== c.topoExtra) erros.push(id + ': topoExtra da montada');
        });
      });
    });
  });
  // 2b. a calça: cobre as pernas (nenhum ponto de pele abaixo da cintura, a pé), o pé levantado do passo continua
  // sapato, o cano das botas fica por cima dela e a armadura de saia por cima do quadril
  function conta(s, cor, y0) {
    var d = s.canvas.getContext('2d').getImageData(0, 0, s.w, s.h).data, n = 0, r = parseInt(cor.slice(1, 3), 16), g = parseInt(cor.slice(3, 5), 16), b = parseInt(cor.slice(5, 7), 16);
    for (var y = y0 || 0; y < s.h; y++) for (var x = 0; x < s.w; x++) { var i = (y * s.w + x) * 4; if (d[i + 3] && d[i] === r && d[i + 1] === g && d[i + 2] === b) n++; }
    return n;
  }
  var apC = aps.menina, CALCA = Reino.VESTES['calca-pluma'].paleta.a, SAPATO = '#6b3b5a';
  VISTAS.forEach(function (v) {
    [0, 1, 2].forEach(function (q) {
      var s0 = PA.mariana(apC, false, q, { vista: v }), s = PA.mariana(apC, false, q, { vista: v, vestes: { calca: 'calca-pluma' } });
      // da linha da saia para baixo (12 = contorno + 7 da cabeça + 4 do corpo)
      if (conta(s, apC.pele, 12) !== 0) erros.push('calça: sobrou perna de fora ' + v + ' ' + q);
      if (conta(s, CALCA) < 4) erros.push('calça: quase não aparece ' + v + ' ' + q);
      if (conta(s, SAPATO) !== conta(s0, SAPATO)) erros.push('calça: mexeu no sapato ' + v + ' ' + q);
      if (conta(s, apC.pele, 0) !== conta(s0, apC.pele, 0) - conta(s0, apC.pele, 12)) erros.push('calça: mexeu na pele de cima ' + v + ' ' + q);
      var cb = PA.mariana(apC, false, q, { vista: v, vestes: { calca: 'calca-pluma', botas: 'botas-pluma' } });
      if (conta(cb, SAPATO) !== 0 || conta(cb, CALCA) >= conta(s, CALCA) || conta(cb, CALCA) < 2) erros.push('calça com botas ' + v + ' ' + q);
      // armadura de saia (a do Dragão): o quadril fica da armadura, a calça só nas pernas
      var cs = PA.mariana(apC, false, q, { vista: v, vestes: { calca: 'calca-pluma', armadura: 'armadura-dragao' } });
      if (conta(cs, CALCA) >= conta(s, CALCA)) erros.push('calça por cima da saia da armadura ' + v + ' ' + q);
    });
  });
  // 2c. roupas e cortes do Salão com a calça (conferência de 18/11): a saia comprida de princesa esconde a calça em
  // pé (o desenho sai igual ao de sem calça; montada, a calça aparece) e a calça nunca pinta cabelo nem laço
  // (montada de costas, a ponta do Cacheado e o laço da Trança caem na linha do quadril)
  var princesa = Object.assign({}, apC, { modelo: 'princesa', corte: 'solto', semLaco: false });
  VISTAS.forEach(function (v) {
    [0, 1, 2].forEach(function (q) {
      if (px(PA.mariana(princesa, false, q, { vista: v, vestes: { calca: 'calca-pluma' } })) !== px(PA.mariana(princesa, false, q, { vista: v })))
        erros.push('calça por cima da saia comprida ' + v + ' ' + q);
    });
    if (px(PA.mariana(princesa, true, 0, { vista: v, vestes: { calca: 'calca-pluma' } })) === px(PA.mariana(princesa, true, 0, { vista: v })))
      erros.push('princesa montada sem calça ' + v);
  });
  var CABELO2 = PA.cor.misturar(apC.cabelo, '#ffe3c4', 0.2);
  (PA.CORTES || []).forEach(function (ct) {
    (PA.MODELOS || []).forEach(function (md) {
      var ap = Object.assign({}, apC, { corte: ct.id, modelo: md.id, semLaco: false });
      VISTAS.forEach(function (v) {
        [[false, 0], [false, 1], [false, 2], [true, 0]].forEach(function (qq) {
          var s0 = PA.mariana(ap, qq[0], qq[1], { vista: v });
          [{ calca: 'calca-pluma' }, { calca: 'calca-pluma', botas: 'botas-pluma' }].forEach(function (vz) {
            var s = PA.mariana(ap, qq[0], qq[1], { vista: v, vestes: vz });
            [ap.cabelo, CABELO2, ap.laco].forEach(function (cor) {
              if (conta(s, cor) !== conta(s0, cor)) erros.push('calça mexeu no cabelo ou no laço: ' + ct.id + ' ' + md.id + ' ' + v + ' ' + qq);
            });
          });
        });
      });
    });
  });
  // 3. espadas e escudos
  a.espadas.forEach(function (id) { var c = PA.espadaItem(id); if (!c || c.width !== 5 || c.height !== 11) erros.push('espada ' + id); });
  a.escudos.forEach(function (id) { var c = PA.escudoItem(id); if (!c || c.width > 8 || c.height > 9) erros.push('escudo ' + id); });
  if (PA.espadaItem('xx') !== null || PA.espadaItem('escudo-madeira') !== null || PA.escudoItem('espada-gelo') !== null) erros.push('arma desconhecida não dá null');
  if (PA.espadaItem('espada-gelo') !== PA.espadaItem('espada-gelo')) erros.push('espada sem cache');
  // 4. ícones
  a.itens.concat(['bau-guardados']).forEach(function (id) {
    var k = id === 'bau-guardados' ? id : 'item:' + id, ic = window.ICONES[k];
    if (!ic) erros.push('sem ícone ' + k); else if (Reino.conferirIcone(ic).length) erros.push('ícone torto ' + k);
    else if (!PA.iconeDesenho(k)) erros.push('ícone não desenha ' + k);
  });

  /* ---------- pranchas ---------- */
  var ESC = 4, FUNDO = '#f6e7d2';
  function prancha(linhas) {
    var larg = 0, alt = 0;
    linhas.forEach(function (l) { var s = 0, h = 0; l.forEach(function (c) { s += (c ? c.width : 6) + 3; h = Math.max(h, c ? c.height : 0); }); larg = Math.max(larg, s); alt += h + 3; });
    var pr = document.createElement('canvas'); pr.width = larg * ESC; pr.height = alt * ESC;
    var g = pr.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = FUNDO; g.fillRect(0, 0, pr.width, pr.height);
    var yy = 0;
    linhas.forEach(function (l) {
      var xx = 0, h = 0;
      l.forEach(function (c) { h = Math.max(h, c ? c.height : 0); });
      l.forEach(function (c) { if (c) g.drawImage(c, xx * ESC, (yy + h - c.height) * ESC, c.width * ESC, c.height * ESC); xx += (c ? c.width : 6) + 3; });
      yy += h + 3;
    });
    return pr.toDataURL();
  }
  // por peça: 5 vistas a pé (passo 1), 5 montada no filhote e 5 no adulto
  function linha(ap, vz) {
    var l = VISTAS.map(function (v) { return PA.mariana(ap, false, 1, { vista: v, vestes: vz }).canvas; });
    l.push(null);
    [1, 2].forEach(function (est) { VISTAS.forEach(function (v) { l.push(PA.montada(def, est, 0, ap, { vista: v, vestes: vz }).canvas); }); l.push(null); });
    return l;
  }
  var pr = {};
  Object.keys(aps).forEach(function (sx) {
    var ap = aps[sx];
    pr['cabeca-' + sx] = prancha([linha(ap, null)].concat(a.cabeca.map(function (id) { return linha(ap, { cabeca: id }); })));
    pr['corpo-' + sx] = prancha([linha(ap, null)].concat(a.armaduras.map(function (id) { return linha(ap, { armadura: id }); }),
      a.botas.map(function (id) { return linha(ap, { botas: id }); })));
    // a calça sozinha, com botas, com armadura curta e de saia, e o Conjunto da Pluma inteiro
    pr['calca-' + sx] = prancha([{ calca: a.calcas[0] }, { calca: a.calcas[0], botas: a.botas[1] }, { calca: a.calcas[0], armadura: a.armaduras[0] },
      { calca: a.calcas[0], armadura: a.armaduras[4], botas: a.botas[4] }, a.pluma].map(function (vz) { return linha(ap, vz); }));
    pr['conjuntos-' + sx] = prancha(a.armaduras.map(function (id, i) {
      return linha(ap, { cabeca: a.cabeca[i * 2 + (sx === 'menino' ? 0 : 1)], armadura: id, botas: a.botas[i] });
    }));
  });
  // grande, de frente (como na Mochila): os 10 da cabeça com armadura e botas
  pr['mochila'] = prancha([a.cabeca.slice(0, 5), a.cabeca.slice(5)].map(function (ids) {
    return ids.map(function (id, i) { return PA.mariana(aps.menina, false, 0, { vista: 'frente', vestes: { cabeca: id, armadura: a.armaduras[i], botas: a.botas[i] } }).canvas; });
  }));
  pr['armas'] = prancha([a.espadas.map(PA.espadaItem), a.escudos.map(PA.escudoItem)]);
  pr['icones'] = prancha([a.itens.slice(0, 11), a.itens.slice(11, 22), a.itens.slice(22).concat(['bau']), ].map(function (ids) {
    return ids.map(function (id) { return PA.iconeDesenho(id === 'bau' ? 'bau-guardados' : 'item:' + id); });
  }));
  return { erros: erros, medidas: medidas, pranchas: pr, comBase: !!velho };
})(${JSON.stringify(arg)})`;

// jogador-desenho.js passa Reino.Itens.vestes() (Reino.Itens de mentira, se ainda não existir)
const JOGADOR = `(function () {
  var J = window.Jogador, antes = Reino.Itens, h = {};
  function medir() { J.itensDesenho({}, false); return J.silhueta && J.silhueta.img ? J.silhueta.img.height : 0; }
  try {
    Reino.Itens = Object.assign({}, antes || {}, { vestes: function () { return { cabeca: null, armadura: null, botas: null, escudo: null, espada: null }; } });
    h.sem = medir();
    Reino.Itens = Object.assign({}, antes || {}, { vestes: function () { return { cabeca: 'chapeu-bruxinha', armadura: 'armadura-polar', botas: null, escudo: null, espada: null }; } });
    h.com = medir();
  } finally { if (antes) Reino.Itens = antes; else delete Reino.Itens; }
  h.depois = medir();
  return h;
})()`;

test('itens: roupas de aventura no desenho, armas e ícones', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'notebook', pasta: path.join(PASTA, 'cenario') });
  try {
    const base = personagensBase();
    const r = await c.js(MEDIR({ base, cabeca: CABECA.concat(PLUMA.cabeca), armaduras: ARMADURAS.concat(PLUMA.armadura), calcas: CALCAS,
      botas: BOTAS.concat(PLUMA.botas), espadas: ESPADAS.concat(PLUMA.espada), escudos: ESCUDOS.concat(PLUMA.escudo),
      itens: ITENS.concat(Object.values(PLUMA)), pluma: PLUMA }));
    fs.mkdirSync(PASTA, { recursive: true });
    for (const [nome, url] of Object.entries(r.pranchas)) fs.writeFileSync(path.join(PASTA, `${nome}.png`), Buffer.from(url.split(',')[1], 'base64'));
    fs.writeFileSync(path.join(PASTA, 'medidas.json'), JSON.stringify(r.medidas, null, 1));
    assert.ok(!base || r.comBase, 'comparou com o desenho do commit de base');
    assert.deepStrictEqual(r.erros, []);
    const h = await c.js(JOGADOR);
    assert.ok(h.sem > 0, 'desenhou');
    assert.ok(h.com > h.sem, `com chapéu fica mais alta (${h.sem} → ${h.com})`);
    assert.strictEqual(h.depois, h.sem, 'sem Itens, o de sempre');
    assert.deepStrictEqual(c.erros, [], 'sem erro de console');
  } finally { await c.fechar(); }
});
