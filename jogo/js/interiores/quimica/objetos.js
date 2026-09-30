/* Laboratório de Química, parte 2 de 3: as cores, os ajudantes de vidraria e os objetos da Bancada de Misturas
   ('quimica-<nome>'). A biblioteca comum (js/motor/interiores-objetos-*.js) já tem janela, estante, sofá…: aqui só
   o que é da cara dele. Reino._predios.quimica guarda: COR, COR2, PAREDE (fora.js usa), v, tempo, LAB, LAB2,
   VIDRO, VIDRO2, LIQ (cores das poções) e os ajudantes frasco, tubo, bequer, conico, balao, tampo (objetos-2.js usa).
   Nada de canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, contornoRet = D.contornoRet, matriz = D.matriz;
  var K = R.Desenho.K;
  var S = (R._predios = R._predios || {})['quimica'] = {};
  // cores do prédio (fora.js usa as mesmas): roxo, rosa e o creme da parede
  S.COR = '#9b6bd6'; S.COR2 = '#ff8ac4'; S.PAREDE = '#fff6e4';
  var LAB = '#f7f3ff', LAB2 = '#e2d6fb', LAB3 = '#c4b0ee', VIDRO = '#d9f3ff', VIDRO2 = '#a8dcf0';
  var VERDE_SEG = '#3fb86a', VERDE_SEG2 = '#2a8a4e';
  // as poções: vermelho, laranja, amarelo, verde, azul, roxo, rosa, verde-água
  var LIQ = { vermelho: '#ff5c6a', laranja: '#ff9d3d', amarelo: '#ffd34d', verde: '#6fdc8c', azul: '#5fb4ff',
    roxo: '#b58cff', rosa: '#ff8ac4', agua: '#62d8c8' };

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  // sem Animações do sistema, o quadro fica parado no instante 0
  function tempo(t) { return (R.util && R.util.reduzMovimentoSistema) ? 0 : (t || 0); }

  /* ================= VIDRARIA (base em by) ================= */
  // frasco reto com líquido pela metade
  function frasco(ctx, x, by, w, h, cor) {
    ret(ctx, x, by - h, w, h, K); ret(ctx, x + 1, by - h + 1, w - 2, h - 2, VIDRO);
    ret(ctx, x + 1, by - (h >> 1), w - 2, (h >> 1) - 1, cor); ret(ctx, x + 1, by - h + 1, 1, h - 3, C.branco);
  }
  // tubo de ensaio (4 px de largura), fundo arredondado
  function tubo(ctx, x, by, h, cor) {
    ret(ctx, x, by - h, 4, h - 1, K); ret(ctx, x + 1, by - 1, 2, 1, K);
    ret(ctx, x + 1, by - h + 1, 2, h - 2, VIDRO); ret(ctx, x + 1, by - (h >> 1), 2, (h >> 1) - 1, cor);
    ret(ctx, x + 1, by - h + 1, 1, 2, C.branco);
  }
  // béquer com bico e risquinhos de medida
  function bequer(ctx, x, by, w, h, cor) {
    ret(ctx, x, by - h, w, h, K); ret(ctx, x - 1, by - h, 2, 2, K);
    ret(ctx, x + 1, by - h + 1, w - 2, h - 2, VIDRO);
    ret(ctx, x + 1, by - (h >> 1) - 1, w - 2, (h >> 1), cor); ret(ctx, x + 1, by - (h >> 1) - 1, w - 2, 1, D.clarear(cor, 0.35));
    for (var i = 0; i < 3; i++) ret(ctx, x + w - 3, by - h + 3 + i * 2, 2, 1, VIDRO2);
    ret(ctx, x + 1, by - h + 1, 1, h - 3, C.branco);
  }
  // erlenmeyer: gargalo e corpo cônico, líquido na metade de baixo
  function conico(ctx, cx, by, w, h, cor) {
    var nh = Math.max(3, Math.floor(h * 0.4)), hb = h - nh, meio = w >> 1;
    ret(ctx, cx - 3, by - h, 7, 1, K); ret(ctx, cx - 2, by - h + 1, 5, nh, K); ret(ctx, cx - 1, by - h + 1, 3, nh, VIDRO);
    for (var j = 0; j < hb; j++) {
      var y = by - hb + j, meia = Math.round(2 + (meio - 2) * j / Math.max(1, hb - 1));
      ret(ctx, cx - meia, y, meia * 2 + 1, 1, K);
      if (j < hb - 1) ret(ctx, cx - meia + 1, y, meia * 2 - 1, 1, j >= (hb >> 1) - 1 ? cor : VIDRO);
    }
    ret(ctx, cx - 1, by - h + 2, 1, 2, C.branco);
  }
  // balão de fundo redondo (centro do bojo em cx, cy)
  function balao(ctx, cx, cy, r, cor) {
    ret(ctx, cx - 2, cy - r - 5, 5, 6, K); ret(ctx, cx - 1, cy - r - 4, 3, 5, VIDRO);
    circulo(ctx, cx, cy, r, K); circulo(ctx, cx, cy, r - 1, VIDRO);
    ctx.fillStyle = cor;
    for (var j = 0; j < r; j++) { var m = Math.floor(Math.sqrt((r - 1) * (r - 1) - j * j) + 0.35); ctx.fillRect(cx - m, cy + j, m * 2 + 1, 1); }
    ret(ctx, cx - r + 2, cy - 2, 1, 2, C.branco);
  }
  // tampo branco de laboratório com pés de metal: tampo em ty, base em py+15, largura em tiles
  function tampo(ctx, px, py, ty, tiles) {
    var w = tiles * 16 - 2;
    ret(ctx, px + 2, ty + 3, 2, py + 15 - ty - 3, C.metal2); ret(ctx, px + w - 3, ty + 3, 2, py + 15 - ty - 3, C.metal2);
    ret(ctx, px + 1, ty, w, 5, K); ret(ctx, px + 2, ty + 1, w - 2, 3, LAB); ret(ctx, px + 2, ty + 3, w - 2, 1, LAB2);
  }
  // armário lilás embaixo de tampo (portas com puxador), de py+1 até py+15
  function armario(ctx, px, py, tiles) {
    var w = tiles * 16 - 2, n = tiles;
    ret(ctx, px + 1, py + 1, w, 15, K); ret(ctx, px + 2, py + 2, w - 2, 12, LAB2);
    for (var i = 0; i < n; i++) {
      var x = px + 3 + i * 16;
      ret(ctx, x, py + 4, 12, 9, K); ret(ctx, x + 1, py + 5, 10, 7, LAB); ret(ctx, x + 1, py + 11, 10, 1, LAB3);
      ret(ctx, x + 4, py + 7, 4, 1, S.COR);
    }
  }
  // bolhinhas subindo de (x, y): n bolhas, cada uma num ponto do ciclo
  function bolhas(ctx, x, y, t, n, alto) {
    var tt = tempo(t);
    for (var i = 0; i < n; i++) {
      var f = ((tt / 1100) + i / n) % 1, sobe = Math.floor(f * alto), lado = (Math.floor(f * 6) + i) % 2;
      var bx = x + i * 3 - n + lado, by = y - sobe;
      if (f < 0.55) { ret(ctx, bx, by, 2, 2, C.branco); ret(ctx, bx + 1, by + 1, 1, 1, VIDRO2); }
      else ret(ctx, bx, by, 1, 1, C.branco);
    }
  }

  /* ================= BANCADA DE MISTURAS ================= */
  // a bancada comprida (abre a tela): suporte com tubos, béquer e erlenmeyer borbulhando
  I.objeto('quimica-bancada', { w: 3, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      armario(ctx, px, py, 3);
      ret(ctx, px, py - 2, 48, 5, K); ret(ctx, px + 1, py - 1, 46, 2, LAB); ret(ctx, px + 1, py + 1, 46, 1, LAB3);
      var by = py - 2;
      // suporte de tubos: vermelho, amarelo, azul
      [LIQ.vermelho, LIQ.amarelo, LIQ.azul].forEach(function (cor, i) { tubo(ctx, px + 3 + i * 5, by, 13, cor); });
      ret(ctx, px + 2, by - 5, 17, 4, K); ret(ctx, px + 3, by - 4, 15, 2, C.madeiraClara); ret(ctx, px + 3, by - 2, 15, 1, C.madeira2);
      // béquer rosa no meio e erlenmeyer roxo
      bequer(ctx, px + 21, by, 10, 11, LIQ.rosa);
      conico(ctx, px + 39, by, 12, 13, LIQ.roxo);
      // plaquinha da bancada na frente do armário
      ret(ctx, px + 18, py + 6, 12, 5, K); ret(ctx, px + 19, py + 7, 10, 3, C.ouro); ret(ctx, px + 21, py + 8, 6, 1, C.ouro2);
    },
    anim: function (ctx, px, py, t) {
      var by = py - 2;
      bolhas(ctx, px + 26, by - 12, t, 3, 6);
      bolhas(ctx, px + 39, by - 14, t + 500, 2, 5);
      // bolhinhas dentro do líquido do béquer
      var f = (tempo(t) / 700) % 1;
      ret(ctx, px + 23, by - 2 - Math.floor(f * 4), 1, 1, C.branco); ret(ctx, px + 28, by - 3 - Math.floor(((f + 0.5) % 1) * 3), 1, 1, C.branco);
    } });

  // capela de exaustão: armário, vidro de correr e o cano do exaustor
  I.objeto('quimica-capela', { w: 2, h: 1, topo: 26, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      armario(ctx, px, py, 2);
      ret(ctx, px + 12, py - 26, 8, 4, K); ret(ctx, px + 13, py - 25, 6, 3, C.metal);
      ret(ctx, px + 1, py - 23, 30, 25, K); ret(ctx, px + 2, py - 22, 28, 23, '#e8ecf6');
      ret(ctx, px + 2, py - 22, 28, 4, S.COR); ret(ctx, px + 4, py - 21, 12, 2, D.clarear(S.COR, 0.4));
      ret(ctx, px + 25, py - 21, 2, 2, K); ret(ctx, px + 25, py - 21, 1, 1, C.verde);   // luz de ligado
      // o vão com o vidro e as coisas lá dentro
      ret(ctx, px + 4, py - 17, 24, 16, K); ret(ctx, px + 5, py - 16, 22, 14, '#cfe6f4');
      conico(ctx, px + 11, py - 3, 8, 9, LIQ.verde); frasco(ctx, px + 17, py - 3, 4, 8, LIQ.laranja); tubo(ctx, px + 22, py - 3, 9, LIQ.azul);
      ret(ctx, px + 5, py - 3, 22, 1, C.metal2);
      // vidro de correr, com reflexo e puxador
      ret(ctx, px + 5, py - 16, 22, 1, C.metal2); ret(ctx, px + 7, py - 15, 1, 3, C.branco); ret(ctx, px + 8, py - 12, 1, 1, C.branco);
      ret(ctx, px + 20, py - 15, 1, 1, C.branco); ret(ctx, px + 10, py - 9, 12, 1, C.metal2);
      ret(ctx, px + 2, py - 1, 28, 2, C.metal); ret(ctx, px + 2, py + 1, 28, 1, K);
    } });

  // chuveiro de segurança (cano verde, puxador amarelo) e lava-olhos
  I.objeto('quimica-chuveiro', { w: 1, h: 1, topo: 30, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 11, 10, 4, K); ret(ctx, px + 2, py + 12, 8, 2, C.metal);
      ret(ctx, px + 3, py - 30, 4, 42, K); ret(ctx, px + 4, py - 29, 2, 40, VERDE_SEG); ret(ctx, px + 4, py - 29, 1, 40, D.clarear(VERDE_SEG, 0.35));
      // braço e o chuveiro
      ret(ctx, px + 3, py - 30, 9, 4, K); ret(ctx, px + 4, py - 29, 7, 2, VERDE_SEG);
      ret(ctx, px + 8, py - 27, 7, 4, K); ret(ctx, px + 9, py - 26, 5, 2, C.metal);
      ret(ctx, px + 9, py - 22, 1, 1, C.azul2); ret(ctx, px + 12, py - 21, 1, 1, C.azul2); ret(ctx, px + 10, py - 19, 1, 1, C.azul2);
      // puxador triangular amarelo
      ret(ctx, px + 7, py - 23, 1, 7, K);
      matriz(ctx, px + 4, py - 17, ['..k..', '.kyk.', 'kyyyk', 'kkkkk'], { k: K, y: C.ouro });
      // lava-olhos: a bacia verde com os dois biquinhos
      ret(ctx, px + 5, py - 5, 11, 5, K); ret(ctx, px + 6, py - 4, 9, 3, VERDE_SEG); ret(ctx, px + 6, py - 4, 9, 1, D.clarear(VERDE_SEG, 0.4));
      ret(ctx, px + 7, py - 8, 3, 3, K); ret(ctx, px + 8, py - 7, 1, 1, C.branco);
      ret(ctx, px + 11, py - 8, 3, 3, K); ret(ctx, px + 12, py - 7, 1, 1, C.branco);
      ret(ctx, px + 9, py, 2, 11, K);
      // plaquinha verde com o olho
      contornoRet(ctx, px + 9, py - 16, 7, 6, VERDE_SEG); ret(ctx, px + 10, py - 14, 5, 2, C.branco); ret(ctx, px + 12, py - 14, 1, 2, K);
    } });

  // cabide com jalecos brancos e óculos de proteção
  I.objeto('quimica-cabide', { w: 1, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 11, 10, 4, K); ret(ctx, px + 4, py + 12, 8, 2, C.madeira);
      ret(ctx, px + 7, py - 19, 2, 31, K); ret(ctx, px + 7, py - 18, 1, 29, C.madeira);
      ret(ctx, px + 3, py - 20, 10, 2, K); ret(ctx, px + 4, py - 20, 8, 1, C.madeira2);
      // dois jalecos pendurados: o grande (botões roxos) e o pequeno (bolso rosa)
      var W = C.branco, pal = { k: K, w: W, l: LAB2, p: S.COR, r: S.COR2 };
      matriz(ctx, px - 1, py - 18, ['..kkkk..', '.kwllwk.', 'kwwkkwwk', 'klwwpwlk', 'klwwkwlk', 'klwwpwlk', 'klwwkwlk', 'klwwpwlk',
        'klwwkwlk', 'klllkwlk', 'klwwkwlk', 'klwwkwlk', 'klwwkwlk', 'klwwkwlk', 'klwwkwlk', 'kkkkkkkk'], pal);
      matriz(ctx, px + 9, py - 16, ['.kkkk..', 'kwrrwk.', 'kwwkwwk', 'klwkwlk', 'klwkwlk', 'klwkrrk', 'klwkrrk', 'klwkwlk',
        'klwkwlk', 'klwkwlk', 'kkkkkkk'], pal);
      // óculos de proteção pendurados no alto
      ret(ctx, px + 4, py - 23, 9, 4, K); ret(ctx, px + 5, py - 22, 3, 2, C.azul2); ret(ctx, px + 9, py - 22, 3, 2, C.azul2);
      ret(ctx, px + 5, py - 22, 1, 1, C.branco); ret(ctx, px + 9, py - 22, 1, 1, C.branco);
    } });

  // estante alta de frascos coloridos, com etiquetas
  I.objeto('quimica-estante-frascos', { w: 2, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 22, 30, 37, K); ret(ctx, px + 2, py - 21, 28, 35, C.madeira);
      ret(ctx, px + 3, py - 20, 26, 33, '#f6eefe');
      [py - 11, py - 1, py + 9].forEach(function (y) { ret(ctx, px + 2, y, 28, 3, K); ret(ctx, px + 3, y + 1, 26, 1, C.madeiraClara); });
      var by = py - 11;
      [[4, 3, 7, LIQ.vermelho], [8, 4, 9, LIQ.amarelo], [13, 3, 6, LIQ.verde], [17, 4, 8, LIQ.azul], [22, 5, 7, LIQ.roxo]].forEach(function (f) {
        frasco(ctx, px + f[0], by, f[1], f[2], f[3]); ret(ctx, px + f[0] + 1, by - 3, f[1] - 2, 1, C.creme);
      });
      by = py - 1;
      conico(ctx, px + 7, by, 8, 9, LIQ.rosa); balao(ctx, px + 16, by - 4, 3, LIQ.laranja); conico(ctx, px + 24, by, 8, 8, LIQ.agua);
      by = py + 9;
      ret(ctx, px + 3, by - 6, 8, 6, K); ret(ctx, px + 4, by - 5, 6, 4, C.creme2); ret(ctx, px + 5, by - 4, 4, 1, S.COR);
      frasco(ctx, px + 13, by, 5, 8, LIQ.azul); frasco(ctx, px + 19, by, 4, 6, LIQ.rosa); frasco(ctx, px + 24, by, 4, 8, LIQ.amarelo);
    } });

  // carrinho baixo com balões e provetas (miudezas até 8 px, cabe embaixo dos quadros)
  I.objeto('quimica-vidrarias', { w: 2, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      tampo(ctx, px, py, py + 3, 2);
      ret(ctx, px + 3, py + 10, 26, 2, K); ret(ctx, px + 4, py + 10, 24, 1, C.metal);
      // proveta alta com risquinhos
      ret(ctx, px + 3, py - 8, 6, 11, K); ret(ctx, px + 2, py + 2, 8, 1, K); ret(ctx, px + 4, py - 7, 4, 9, VIDRO);
      ret(ctx, px + 4, py - 2, 4, 4, LIQ.azul); ret(ctx, px + 7, py - 6, 1, 1, VIDRO2); ret(ctx, px + 7, py - 4, 1, 1, VIDRO2);
      balao(ctx, px + 15, py - 1, 4, LIQ.rosa);
      ret(ctx, px + 20, py - 6, 5, 9, K); ret(ctx, px + 19, py + 2, 7, 1, K); ret(ctx, px + 21, py - 5, 3, 7, VIDRO); ret(ctx, px + 21, py - 1, 3, 3, LIQ.verde);
      bequer(ctx, px + 26, py + 3, 5, 6, LIQ.amarelo);
    } });

  // lixeiras de reciclagem: papel (azul), plástico (vermelho) e vidro (verde), com a setinha da reciclagem
  I.objeto('quimica-lixeira', { w: 1, h: 1, topo: 0, solido: true,
    desenhar: function (ctx, px, py) {
      [C.azul, LIQ.vermelho, VERDE_SEG].forEach(function (cor, i) {
        var x = px + i * 5;
        ret(ctx, x, py + 4, 6, 3, K); ret(ctx, x + 1, py + 5, 4, 1, D.escurecer(cor, 0.25)); ret(ctx, x + 2, py + 3, 2, 1, K);
        ret(ctx, x, py + 7, 6, 8, K); ret(ctx, x + 1, py + 7, 4, 7, cor); ret(ctx, x + 1, py + 7, 1, 7, D.clarear(cor, 0.35));
        ret(ctx, x + 2, py + 9, 2, 1, C.branco); ret(ctx, x + 3, py + 10, 1, 1, C.branco); ret(ctx, x + 2, py + 11, 2, 1, C.branco);
      });
    } });

  // pia de laboratório com torneira alta, sabonete e papel-toalha
  I.objeto('quimica-pia', { w: 2, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      armario(ctx, px, py, 2);
      ret(ctx, px, py - 2, 32, 5, K); ret(ctx, px + 1, py - 1, 30, 2, LAB); ret(ctx, px + 1, py + 1, 30, 1, LAB3);
      ret(ctx, px + 7, py - 1, 16, 2, K); ret(ctx, px + 8, py - 1, 14, 1, C.metal2);
      // torneira em pescoço de ganso
      ret(ctx, px + 14, py - 11, 2, 10, K); ret(ctx, px + 14, py - 12, 7, 2, K); ret(ctx, px + 19, py - 12, 2, 4, K);
      ret(ctx, px + 15, py - 10, 1, 8, C.metal); ret(ctx, px + 15, py - 12, 5, 1, C.metal);
      ret(ctx, px + 12, py - 4, 6, 2, K); ret(ctx, px + 13, py - 4, 1, 1, C.azul); ret(ctx, px + 16, py - 4, 1, 1, LIQ.vermelho);
      // sabonete rosa e o rolo de papel
      ret(ctx, px + 3, py - 7, 5, 6, K); ret(ctx, px + 4, py - 6, 3, 4, S.COR2); ret(ctx, px + 5, py - 9, 1, 2, K);
      ret(ctx, px + 24, py - 8, 6, 7, K); ret(ctx, px + 25, py - 7, 4, 5, C.branco); ret(ctx, px + 26, py - 5, 2, 1, C.creme2);
    } });

  // extintor vermelho no suporte
  I.objeto('quimica-extintor', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 12, 10, 3, K); ret(ctx, px + 4, py + 13, 8, 1, C.metal2);
      ret(ctx, px + 4, py - 3, 8, 16, K); ret(ctx, px + 5, py - 2, 6, 14, LIQ.vermelho); ret(ctx, px + 5, py - 2, 2, 14, D.clarear(LIQ.vermelho, 0.3));
      ret(ctx, px + 5, py + 3, 6, 3, C.branco); ret(ctx, px + 6, py + 4, 4, 1, LIQ.vermelho);
      ret(ctx, px + 6, py - 7, 4, 5, K); ret(ctx, px + 7, py - 6, 2, 3, C.metal);
      ret(ctx, px + 9, py - 8, 5, 2, K); ret(ctx, px + 12, py - 6, 2, 10, K);
    } });

  // banqueta redonda de laboratório
  I.objeto('quimica-banqueta', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      var cor = v(o, 'cor', S.COR);
      ret(ctx, px + 4, py + 6, 2, 9, K); ret(ctx, px + 10, py + 6, 2, 9, K); ret(ctx, px + 5, py + 11, 6, 1, K);
      elipse(ctx, px + 8, py + 3, 6, 3, K); elipse(ctx, px + 8, py + 2, 5, 2, cor); ret(ctx, px + 5, py + 1, 3, 1, D.clarear(cor, 0.4));
    } });

  // púlpito com o caderno de receitas aberto (abre a tela)
  I.objeto('quimica-pulpito', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, C.madeira2);
      ret(ctx, cx - 3, py - 2, 7, 14, K); ret(ctx, cx - 2, py - 2, 5, 13, S.COR); ret(ctx, cx - 2, py - 2, 1, 13, D.clarear(S.COR, 0.4));
      ret(ctx, cx - 8, py - 7, 17, 6, K); ret(ctx, cx - 7, py - 6, 15, 4, C.madeira); ret(ctx, cx - 7, py - 6, 15, 1, C.madeiraClara);
      // caderno aberto: capa rosa, um frasco de um lado e linhas do outro, fitinha
      ret(ctx, cx - 8, py - 14, 17, 8, K); ret(ctx, cx - 7, py - 13, 15, 6, S.COR2);
      ret(ctx, cx - 6, py - 13, 6, 5, C.creme); ret(ctx, cx + 1, py - 13, 6, 5, C.creme); ret(ctx, cx, py - 13, 1, 6, K);
      ret(ctx, cx - 4, py - 12, 2, 1, K); ret(ctx, cx - 4, py - 11, 2, 1, VIDRO); ret(ctx, cx - 5, py - 10, 4, 1, LIQ.roxo);
      ret(ctx, cx + 2, py - 12, 4, 1, LAB3); ret(ctx, cx + 2, py - 10, 3, 1, LAB3);
      ret(ctx, cx + 4, py - 8, 1, 3, C.vermelho);
    } });

  /* ================= PAREDE ================= */
  // pôster 1×2: seguranca (óculos e luvas), cebola (células), neve (floco), cristal (cubinhos de sal)
  I.objeto('quimica-poster', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var d = v(o, 'desenho', 'seguranca'), cx = px + 8, cy = py + 15;
      var faixa = { seguranca: VERDE_SEG, cebola: S.COR2, neve: C.azul, cristal: S.COR }[d] || S.COR;
      contornoRet(ctx, px + 1, py + 4, 14, 21, d === 'neve' ? '#2f3f8a' : '#fffaf0');
      ret(ctx, px + 2, py + 5, 12, 3, faixa); ret(ctx, px + 4, py + 6, 8, 1, C.branco);
      if (d === 'seguranca') {
        // óculos de proteção grandes e um frasco com o sinal de certo
        ret(ctx, cx - 6, cy - 6, 13, 6, K); ret(ctx, cx - 5, cy - 5, 5, 4, C.azul2); ret(ctx, cx + 1, cy - 5, 5, 4, C.azul2);
        ret(ctx, cx - 5, cy - 5, 2, 1, C.branco); ret(ctx, cx + 1, cy - 5, 2, 1, C.branco); ret(ctx, cx - 7, cy - 4, 1, 2, VERDE_SEG); ret(ctx, cx + 7, cy - 4, 1, 2, VERDE_SEG);
        conico(ctx, cx - 2, cy + 8, 7, 7, LIQ.rosa);
        matriz(ctx, cx + 2, cy + 2, ['....k', '...kg', 'k.kg.', 'kgg..', '.k...'], { k: K, g: VERDE_SEG });
      } else if (d === 'cebola') {
        // células em tijolinhos, cada uma com o núcleo, cortadas na janela do pôster (3..12, 9..21)
        var X0 = px + 3, X1 = px + 12, Y0 = py + 9, Y1 = py + 21;
        var dentro = function (x, y, w, h, cor) {
          var a = Math.max(x, X0), b = Math.max(y, Y0), c = Math.min(x + w, X1 + 1), e = Math.min(y + h, Y1 + 1);
          if (c > a && e > b) ret(ctx, a, b, c - a, e - b, cor);
        };
        for (var j = 0; j < 3; j++) for (var x = X0 - (j % 2 ? 2 : 0); x <= X1; x += 4) {
          var y = Y0 + j * 4;
          dentro(x, y, 5, 5, S.COR); dentro(x + 1, y + 1, 3, 3, '#ffe0ef'); dentro(x + 2, y + 2, 1, 1, LIQ.roxo);
        }
      } else if (d === 'neve') {
        // gelo é hexagonal: 6 braços a 60° (um em pé e quatro em degrau), cada ponta brilhando
        var az = '#bfe6ff', DEG = [[1, 1], [2, 1], [3, 2], [4, 2], [5, 3]];
        ret(ctx, cx, cy - 6, 1, 13, az); ret(ctx, cx, cy - 6, 1, 1, C.branco); ret(ctx, cx, cy + 6, 1, 1, C.branco);
        [-1, 1].forEach(function (sy) {
          [-1, 1].forEach(function (sx) {
            DEG.forEach(function (p) { ret(ctx, cx + sx * p[0], cy + sy * p[1], 1, 1, az); });
            ret(ctx, cx + sx * 5, cy + sy * 3, 1, 1, C.branco);
          });
        });
        ret(ctx, cx, cy, 1, 1, C.branco);
      } else {
        [[cx - 5, cy - 3], [cx + 1, cy - 5], [cx - 2, cy + 2]].forEach(function (p) {
          ret(ctx, p[0], p[1], 6, 6, K); ret(ctx, p[0] + 1, p[1] + 1, 4, 4, '#f4fbff'); ret(ctx, p[0] + 1, p[1] + 1, 4, 1, C.branco); ret(ctx, p[0] + 4, p[1] + 2, 1, 3, VIDRO2);
        });
      }
    } });

  // quadro-verde 2×2 com giz: formulas (água e gás carbônico) ou estados (sólido, líquido, gás)
  var GIZ = { H: ['k.k', 'k.k', 'kkk', 'k.k', 'k.k'], O: ['kkk', 'k.k', 'k.k', 'k.k', 'kkk'], C: ['kkk', 'k..', 'k..', 'k..', 'kkk'],
    2: ['kk', '.k', 'kk', 'k.', 'kk'] };
  function giz(ctx, x, y, texto, cor) {
    for (var i = 0; i < texto.length; i++) {
      var ch = texto[i], sub = ch === '2';
      matriz(ctx, x, y + (sub ? 2 : 0), GIZ[ch], { k: cor });
      x += sub ? 3 : 4;
    }
  }
  I.objeto('quimica-quadro', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var d = v(o, 'desenho', 'formulas'), G = '#f4fbff';
      ret(ctx, px + 1, py + 3, 30, 23, C.madeira2); ret(ctx, px + 2, py + 4, 28, 21, K); ret(ctx, px + 3, py + 5, 26, 19, '#2f6a5a');
      ret(ctx, px + 4, py + 24, 24, 2, C.madeiraClara); ret(ctx, px + 8, py + 23, 4, 1, C.branco); ret(ctx, px + 20, py + 23, 2, 1, S.COR2);
      if (d === 'formulas') {
        giz(ctx, px + 5, py + 7, 'H2O', G);
        circulo(ctx, px + 23, py + 10, 2, LIQ.vermelho); ret(ctx, px + 19, py + 12, 2, 2, G); ret(ctx, px + 26, py + 12, 2, 2, G);
        giz(ctx, px + 5, py + 16, 'CO2', G);
        ret(ctx, px + 22, py + 18, 3, 3, '#7a7a8a'); ret(ctx, px + 19, py + 18, 2, 3, LIQ.vermelho); ret(ctx, px + 26, py + 18, 2, 3, LIQ.vermelho);
      } else {
        // três caixinhas: bolinhas juntas, soltas e espalhadas
        for (var i = 0; i < 3; i++) { var x = px + 4 + i * 8; ret(ctx, x, py + 8, 7, 12, G); ret(ctx, x + 1, py + 9, 5, 10, '#2f6a5a'); }
        ret(ctx, px + 5, py + 14, 2, 2, C.azul2); ret(ctx, px + 7, py + 14, 2, 2, C.azul); ret(ctx, px + 5, py + 16, 2, 2, C.azul); ret(ctx, px + 7, py + 16, 2, 2, C.azul2);
        ret(ctx, px + 13, py + 17, 2, 1, C.azul2); ret(ctx, px + 15, py + 16, 2, 1, C.azul); ret(ctx, px + 14, py + 15, 2, 1, C.azul2);
        ret(ctx, px + 21, py + 10, 1, 1, C.azul2); ret(ctx, px + 24, py + 13, 1, 1, C.azul2); ret(ctx, px + 22, py + 16, 1, 1, C.azul2); ret(ctx, px + 25, py + 18, 1, 1, C.azul2);
        ret(ctx, px + 5, py + 6, 5, 1, G); ret(ctx, px + 13, py + 6, 5, 1, G); ret(ctx, px + 21, py + 6, 5, 1, G);
      }
    } });

  S.v = v; S.tempo = tempo; S.LAB = LAB; S.LAB2 = LAB2; S.LAB3 = LAB3; S.VIDRO = VIDRO; S.VIDRO2 = VIDRO2; S.LIQ = LIQ;
  S.frasco = frasco; S.tubo = tubo; S.bequer = bequer; S.conico = conico; S.balao = balao; S.tampo = tampo; S.armario = armario;
})();
