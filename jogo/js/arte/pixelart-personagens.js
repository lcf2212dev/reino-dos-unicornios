/* Pixel art dos personagens: Mariana (moldes das 5 vistas, aparência padrão e opções,
   PA.mariana), Mariana montada no unicórnio (PA.montada, com a cabeça do unicórnio por cima
   dela) e o Claude, mascote (PA.claude). */
(function () {
  var PA = window.PA, I = PA._interno;
  var CONTORNO = I.CONTORNO, cache = I.cache, usarCombo = I.usarCombo;
  var misturar = PA.cor.misturar, escurecer = PA.cor.escurecer;
  var novoCanvas = PA.novoCanvas, pintarMatriz = PA.pintarMatriz, matriz = PA.matriz, contornar = PA.contornar;

  /* ---------- MARIANA ---------- */
  var CAPA = ['.PP', 'PPP', 'PPP', 'PP.'];
  var MARI = {
    lado: {
      cabeca: [
        '..BHHHH....',
        '.BBHHHHHH..',
        '..HHHHHHHH.',
        '..HHHKKKKK.',
        '..HHKKKEKK.',
        '..HHKKKKRK.',
        '..HHHKKKK..',
      ],
      emPe: [
        ['..HH.CCC...',
         '..HHACACKK.',
         '...HAAACC..',
         '...CCACCC..',
         '...DDDDDD..',
         '....KK.KK..',
         '....KK.KK..',
         '....SS.SS..'],
        ['..HH.CCC...',
         '..HHACACKK.',
         '...HAAACC..',
         '...CCACCC..',
         '...DDDDDD..',
         '...KK...KK.',
         '...KK...KK.',
         '...SS...SS.'],
      ],
      sentada: [
        '..HH.CCC...',
        '..HHCCCCKK.',
        '...HCCCC...',
        '...DDDDD...',
        '.....DD....',
        '.....DD....',
        '.....SS....',
      ],
      capa: { linhas: CAPA, x: 0, y: 7 },
    },
    frente: {
      cabeca: [
        '...HHHHBB..',
        '..HHHHHHBB.',
        '.HHHHHHHHH.',
        '.HHKKKKKHH.',
        '.HKEKKKEKH.',
        '.HRKKKKKRH.',
        '.HHKKKKKHH.',
      ],
      emPe: [
        ['.HHCCCCCHH.',
         '.HKCACACKH.',
         '..KCAAACK..',
         '...CCACC...',
         '..DDDDDDD..',
         '...KK.KK...',
         '...KK.KK...',
         '...SS.SS...'],
        ['.HHCCCCCHH.',
         '.HKCACACKH.',
         '..KCAAACK..',
         '...CCACC...',
         '..DDDDDDD..',
         '...KK.KK...',
         '...SS.KK...',
         '......SS...'],
        ['.HHCCCCCHH.',
         '.HKCACACKH.',
         '..KCAAACK..',
         '...CCACC...',
         '..DDDDDDD..',
         '...KK.KK...',
         '...KK.SS...',
         '...SS......'],
      ],
      sentada: [
        '.HHCCCCCHH.',
        '.HKCCCCCKH.',
        '..KCCCCCK..',
        '..DDDDDDD..',
        '.DD.....DD.',
        '.KK.....KK.',
        '.SS.....SS.',
      ],
      capa: { linhas: ['P.........P', 'PP.......PP', 'PP.......PP', 'P.........P'], x: 0, y: 7 },
    },
    costas: {
      cabeca: [
        '..BBHHHH...',
        '.BBHHHHHH..',
        '.HHHLLHHHH.',
        '.HHLHHHHHH.',
        '.HHHHHHHHH.',
        '.HHHHHHHHH.',
        '.HHHHHHHHH.',
      ],
      emPe: [
        ['.HHHHHHHHH.',
         '..KHHHHHK..',
         '..KCHHHCK..',
         '...CACAC...',
         '..DDDADDD..',
         '...KK.KK...',
         '...KK.KK...',
         '...SS.SS...'],
        ['.HHHHHHHHH.',
         '..KHHHHHK..',
         '..KCHHHCK..',
         '...CACAC...',
         '..DDDADDD..',
         '...KK.KK...',
         '...SS.KK...',
         '......SS...'],
        ['.HHHHHHHHH.',
         '..KHHHHHK..',
         '..KCHHHCK..',
         '...CACAC...',
         '..DDDADDD..',
         '...KK.KK...',
         '...KK.SS...',
         '...SS......'],
      ],
      sentada: [
        '.HHHHHHHHH.',
        '..KHHHHHK..',
        '..KCHHHCK..',
        '..DDDDDDD..',
        '.DD.....DD.',
        '.KK.....KK.',
        '.SS.....SS.',
      ],
      capa: { linhas: ['.PPPPP.', 'PPPPPPP', 'PPPPPPP', 'PPPPPPP'], x: 2, y: 8, sobre: true },
    },
    diagFrente: {
      cabeca: [
        '..BHHHHH...',
        '.BBHHHHHHH.',
        '..HHHHHHHH.',
        '..HHKKKKKH.',
        '..HHKEKKEK.',
        '..HHKKKKRK.',
        '..HHHKKKK..',
      ],
      emPe: [
        ['..HHCCCC...',
         '..HKCACAK..',
         '...KCAAAK..',
         '...CCACCC..',
         '...DDDDDD..',
         '....KK.KK..',
         '....KK.KK..',
         '....SS.SS..'],
        ['..HHCCCC...',
         '..HKCACAK..',
         '...KCAAAK..',
         '...CCACCC..',
         '...DDDDDD..',
         '...KK..KK..',
         '...SS..KK..',
         '.......SS..'],
        ['..HHCCCC...',
         '..HKCACAK..',
         '...KCAAAK..',
         '...CCACCC..',
         '...DDDDDD..',
         '...KK..KK..',
         '...KK..SS..',
         '...SS......'],
      ],
      sentada: [
        '..HHCCCC...',
        '..HKCCCCK..',
        '...KCCCCK..',
        '...DDDDD...',
        '.....DD....',
        '.....DD....',
        '.....SS....',
      ],
      capa: { linhas: CAPA, x: 0, y: 7 },
    },
    diagCostas: {
      cabeca: [
        '..BHHHH....',
        '.BBHHHHHH..',
        '..HHHLLHHH.',
        '..HHLHHHHH.',
        '..HHHHHHHK.',
        '..HHHHHHKK.',
        '..HHHHHKK..',
      ],
      emPe: [
        ['..HHHHHC...',
         '..HHHHHCK..',
         '...HHHCCK..',
         '...CCACAC..',
         '...DDADDD..',
         '....KK.KK..',
         '....KK.KK..',
         '....SS.SS..'],
        ['..HHHHHC...',
         '..HHHHHCK..',
         '...HHHCCK..',
         '...CCACAC..',
         '...DDADDD..',
         '...KK..KK..',
         '...KK..SS..',
         '...SS......'],
        ['..HHHHHC...',
         '..HHHHHCK..',
         '...HHHCCK..',
         '...CCACAC..',
         '...DDADDD..',
         '...KK..KK..',
         '...SS..KK..',
         '.......SS..'],
      ],
      sentada: [
        '..HHHHHC...',
        '..HHHHHCK..',
        '...HHHCCK..',
        '...DDDDD...',
        '.....DD....',
        '.....DD....',
        '.....SS....',
      ],
      capa: { linhas: ['PPPP.', 'PPPPP', 'PPPPP', '.PPP.'], x: 2, y: 8, sobre: true },
    },
  };

  PA.APARENCIA_PADRAO = { pele: '#f1c7a5', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ff4f9a' };
  PA.OPCOES_APARENCIA = {
    pele: ['#ffe0c7', '#f1c7a5', '#d9a07a', '#a86b4a', '#7a4a32'],
    cabelo: ['#2b1b17', '#5a3825', '#a0673a', '#e8c16a', '#c2532b'],
    roupa: ['#ff7eb6', '#9b7bff', '#4fc3f7', '#6fdc8c', '#ffb74d'],
    laco: ['#ff4f9a', '#ffd34d', '#7c5cff', '#39c5bb', '#ffffff'],
  };

  function paletaMariana(ap) {
    return {
      H: ap.cabelo, L: misturar(ap.cabelo, '#ffe3c4', 0.2), K: ap.pele, E: '#2a1838', R: '#ff9cc6',
      C: ap.roupa, D: escurecer(ap.roupa, 0.2), A: escurecer(ap.roupa, 0.34), S: '#6b3b5a', B: ap.laco,
    };
  }

  PA.mariana = function (ap, sentada, quadro, opcoes) {
    opcoes = opcoes || {};
    ap = ap || PA.APARENCIA_PADRAO;
    var vista = opcoes.vista || 'lado';
    var chave = ['mar', ap.pele, ap.cabelo, ap.roupa, ap.laco, sentada ? 1 : 0, quadro % 3, opcoes.capa ? 1 : 0, vista].join('|');
    if (cache[chave]) return cache[chave];
    var molde = MARI[vista];
    var corpo = sentada ? molde.sentada : (molde.emPe[quadro % 3] || molde.emPe[1]);
    var linhas = molde.cabeca.concat(corpo);
    var base = novoCanvas(linhas[0].length, linhas.length);
    var ctx = base.getContext('2d');
    var capa = opcoes.capa && molde.capa;
    if (capa && !capa.sobre) pintarMatriz(ctx, capa.linhas, { P: '#9b5cff' }, capa.x, capa.y);
    pintarMatriz(ctx, linhas, paletaMariana(ap), 0, 0);
    if (capa && capa.sobre) pintarMatriz(ctx, capa.linhas, { P: '#9b5cff' }, capa.x, capa.y);
    var final = contornar(base, CONTORNO);
    var res = { canvas: final, w: final.width, h: final.height };
    cache[chave] = res;
    return res;
  };

  // Mariana montada: composição unicórnio + cavaleira (+ o pedaço do unicórnio que fica na frente dela)
  PA.montada = function (def, estagio, quadro, ap, opcoes) {
    opcoes = opcoes || {};
    var vista = opcoes.vista || 'lado';
    var combo = (opcoes.enfeites || []).join('+');
    var chave = ['mont', def.id, estagio, quadro % 3, ap.pele, ap.cabelo, ap.roupa, ap.laco,
      combo, opcoes.capa ? 1 : 0, opcoes.asasFada ? 1 : 0, vista].join('|');
    if (cache[chave]) { usarCombo(combo); return cache[chave]; }
    var uni = PA.unicornio(def, estagio, quadro, opcoes);
    var cav = PA.mariana(ap, true, 0, { capa: opcoes.capa, vista: vista });
    var px = uni.cavaleira[0], py = uni.cavaleira[1];
    // o canvas cresce para caber a cavaleira; o centro dos pés continua no meio do unicórnio
    var esq = Math.max(0, -px), dir = Math.max(0, px + cav.w - uni.w);
    // (pelo menos 8px livres em cima, como sempre foi: a logo e o estábulo contam com isso)
    var margem = Math.max(esq, dir), topo = Math.max(8, -py);
    var c = novoCanvas(uni.w + margem * 2, uni.h + topo);
    var ctx = c.getContext('2d');
    ctx.drawImage(uni.canvas, margem, topo);
    ctx.drawImage(cav.canvas, margem + px, topo + py);
    if (uni.naFrente) pintarNaFrente(ctx, uni, cav, margem, topo, px, py);
    var res = { canvas: c, w: c.width, h: c.height };
    cache[chave] = res;
    usarCombo(combo, chave);   // sai do cache junto com a combinação de enfeites (teto TETO_COMBOS)
    return res;
  };

  // redesenha a cabeça do unicórnio por cima da cavaleira, com contorno só onde encosta nela
  function pintarNaFrente(ctx, uni, cav, margem, topo, px, py) {
    var r = uni.naFrente, bw = uni.base.width, bh = uni.base.height;
    var larg = r[2] - r[0] + 1, alt = r[3] - r[1] + 1;
    var cab = novoCanvas(bw, bh);
    cab.getContext('2d').drawImage(uni.base, r[0], r[1], larg, alt, r[0], r[1], larg, alt);
    // enfeites que ficam por cima da cavaleira mesmo fora do retângulo (o brinco de lua na diagonal)
    (uni.enfeitesNaFrente || []).forEach(function (e) { pintarMatriz(cab.getContext('2d'), e.linhas, e.paleta, e.x, e.y); });
    var dc = cab.getContext('2d').getImageData(0, 0, bw, bh).data;
    var dv = cav.alfa || (cav.alfa = cav.canvas.getContext('2d').getImageData(0, 0, cav.w, cav.h).data);
    var ox = margem + 1, oy = topo + 1; // o molde começa 1px para dentro por causa do contorno
    function cheio(x, y) { return x >= 0 && y >= 0 && x < bw && y < bh && dc[(y * bw + x) * 4 + 3] > 0; }
    function temCavaleira(x, y) {
      var cx = x + ox - (margem + px), cy = y + oy - (topo + py);
      return cx >= 0 && cy >= 0 && cx < cav.w && cy < cav.h && dv[(cy * cav.w + cx) * 4 + 3] > 0;
    }
    ctx.fillStyle = CONTORNO;
    for (var y = -1; y <= bh; y++) for (var x = -1; x <= bw; x++) {
      if (cheio(x, y) || !temCavaleira(x, y)) continue;
      if (cheio(x - 1, y) || cheio(x + 1, y) || cheio(x, y - 1) || cheio(x, y + 1)) ctx.fillRect(x + ox, y + oy, 1, 1);
    }
    ctx.drawImage(cab, ox, oy);
  }

  /* ---------- CLAUDE (mascote original) ---------- */
  var CLAUDE = [
    '.......s........',
    '......sss.......',
    '.......a........',
    '.......a........',
    '.....cccccc.....',
    '...cccccccccc...',
    '..ccyyyyyyyycc..',
    '..ccleyyyylecc..',
    '..cceeyyyyeecc..',
    '..cryyyyyyyyrc..',
    '..ccymyyyymycc..',
    '..kkyymmmmyykk..',
    '.kkknnkkkkkkkkk.',
    '...dnnyyyyydd...',
    '....dddddddd....',
    '....dd....dd....',
  ];
  var CLAUDE_PISCA = CLAUDE.slice();
  CLAUDE_PISCA[7] = '..cceeyyyyeecc..';
  CLAUDE_PISCA[8] = '..ccyyyyyyyycc..';
  var PAL_CLAUDE = { c: '#f28c5e', d: '#d4684a', y: '#ffe6cc', e: '#2a1838', l: '#ffffff', r: '#ff9cc6', m: '#8a3b3b', a: '#6b4b7a', s: '#ffd34d', k: '#c9a6ff', n: '#7a52c4' };

  PA.claude = function (quadro) {
    var chave = 'claude|' + quadro;
    if (cache[chave]) return cache[chave];
    var linhas = quadro === 1 ? CLAUDE_PISCA : CLAUDE;
    var c = contornar(matriz(linhas, PAL_CLAUDE), CONTORNO);
    var res = { canvas: c, w: c.width, h: c.height };
    cache[chave] = res;
    return res;
  };
})();
