/* O desenho da Mariana e do unicórnio (montada, ou a pé com o bebê atrás): sprites nas 8
   direções (espelhados pelo cache), sombra, corte na linha d'água com ondinhas, o sujinho
   (manchas de lama e poeira), o ícone de fome/sede, as faíscas e o marcador do toque.
   Veio de personagens/jogador.js. Usa Reino._jogador (J, DIST_BEBE, pontoAtras, fundura). */
(function () {
  var T = Mapa.T;
  var I = Reino._jogador, J = I.J, pontoAtras = I.pontoAtras, fundura = I.fundura;
  var espelhos = new WeakMap();
  var DIST_BEBE = I.DIST_BEBE;   // quantos pixels o bebê anda atrás da Mariana
  var PASSOS = [1, 0, 2, 0];   // quadros do andar: pé, junto, outro pé, junto
  // largura da sombra conforme a vista (de frente e de costas o corpo fica mais estreito)
  var SOMBRA = { lado: 1, diagFrente: 0.85, diagCostas: 0.85, frente: 0.6, costas: 0.6 };

  // quantos px de baixo do sprite ficam embaixo d'água na parte funda (pernas e barriga);
  // uma parte pequena disso o corpo afunda (AFUNDA), o resto é o corte. Afundar pouco e devagar
  // mantém o passo na margem sem "puxão" (o desenho quase não muda de velocidade ao entrar)
  var CORTE = { montadaGrande: 8, montadaPequena: 7, mariana: 7, bebe: 7 };
  var AFUNDA = 0.25;

  function espelho(c) {
    var e = espelhos.get(c);
    if (!e) { e = PA.espelhado(c); espelhos.set(c, e); }
    return e;
  }

  /* ---------- sujinho (banho < 25: Cuidados.sujo) ----------
     Manchinhas de lama no pelo: cada sprite ganha, UMA vez, uma cópia com manchas (cache por canvas,
     como o espelho), nada de canvas novo por quadro. O pelo é a cor mais comum do sprite (sem o
     contorno); as manchas só caem em blocos 2×2 de pelo, espalhadas, sempre nos mesmos pontos. */
  var sujos = new WeakMap();
  var LAMA = [138, 100, 70], LAMA2 = [104, 72, 50];
  function misturarRGB(a, b, k) { return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * k); }); }
  function sujar(c) {
    var s = sujos.get(c);
    if (s) return s;
    s = PA.novoCanvas(c.width, c.height);
    var sc = s.getContext('2d');
    sc.drawImage(c, 0, 0);
    try {
      var w = c.width, h = c.height, img = sc.getImageData(0, 0, w, h), d = img.data;
      var conta = {}, pelo = -1, max = 0;
      for (var i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 200) continue;
        var k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
        if (k === 0x3a2446) continue;
        conta[k] = (conta[k] || 0) + 1;
        if (conta[k] > max) { max = conta[k]; pelo = k; }
      }
      var ehPelo = function (x, y) {
        if (x < 0 || y < 0 || x >= w || y >= h) return false;
        var o = (y * w + x) * 4;
        return d[o + 3] >= 200 && ((d[o] << 16) | (d[o + 1] << 8) | d[o + 2]) === pelo;
      };
      var cand = [];
      for (var y = 0; y < h - 1; y++) for (var x = 0; x < w - 1; x++) {
        if (ehPelo(x, y) && ehPelo(x + 1, y) && ehPelo(x, y + 1) && ehPelo(x + 1, y + 1)) cand.push({ x: x, y: y, o: ((x * 73) ^ (y * 151) ^ (x * y * 7)) % 97 });
      }
      cand.sort(function (a, b) { return a.o - b.o; });
      var quantas = Math.max(4, Math.min(7, Math.round(max / 30))), manchas = [];
      for (var j = 0; j < cand.length && manchas.length < quantas; j++) {
        var q = cand[j];
        if (manchas.every(function (m) { return Math.abs(m.x - q.x) + Math.abs(m.y - q.y) >= 5; })) manchas.push(q);
      }
      var cor = [(pelo >> 16) & 255, (pelo >> 8) & 255, pelo & 255];
      var clara = misturarRGB(cor, LAMA, 0.5), escura = misturarRGB(cor, LAMA2, 0.75);
      var pintar = function (x, y, rgb) { var o = (y * w + x) * 4; d[o] = rgb[0]; d[o + 1] = rgb[1]; d[o + 2] = rgb[2]; };
      manchas.forEach(function (m, n) {
        // mancha de 3 pixels claros e 1 escuro (o canto que falta muda de uma para outra)
        pintar(m.x, m.y, n % 2 ? escura : clara); pintar(m.x + 1, m.y + 1, n % 2 ? clara : escura);
        if (n % 3 !== 0) pintar(m.x + 1, m.y, clara);
        if (n % 3 !== 1) pintar(m.x, m.y + 1, clara);
      });
      sc.putImageData(img, 0, 0);
    } catch (e) {}
    sujos.set(c, s);
    return s;
  }
  J.sujar = sujar;
  function montariaSuja() {
    try { return !!(Reino.Cuidados && Reino.Cuidados.sujo && Reino.Cuidados.sujo()); } catch (e) { return false; }
  }
  // o banho de espuma (js/sistemas/banho.js) desenha o unicórnio enquanto dura: ela fica a pé, ao lado
  function banhoComUni() {
    var B = Reino.Banho;
    try { return !!(B && B.desenhandoUni && B.desenhandoUni()); } catch (e) { return false; }
  }
  // nuvenzinha de poeira do sujinho: 3 fiapos cinza-terra atrás do unicórnio (px do jogo, pintor.ret).
  // Com Animações, sobem e somem devagar; sem, ficam parados. forca 0–1 (na água some)
  var POEIRA = ['rgba(150,120,92,', 'rgba(196,172,140,'];
  function poeira(p, x, yPes, larg, alto, lado, animar, forca) {
    if (forca <= 0.05) return;
    for (var i = 0; i < 3; i++) {
      var f = animar ? (J.t / 1.8 + i / 3) % 1 : [0.25, 0.5, 0.75][i];
      var a = Math.sin(f * Math.PI) * 0.75 * forca;
      if (a < 0.04) continue;
      var r = 1 + f * 2.2;
      var cx = x - lado * (larg * 0.45 + f * 4) + (i - 1) * 3, cy = yPes - 3 - alto * 0.18 - f * 7 - (i % 2) * 2;
      for (var j = -Math.ceil(r); j <= Math.ceil(r); j++) {
        var m = Math.sqrt(Math.max(0, r * r - j * j));
        if (m < 0.4) continue;
        p.ret(cx - m, cy + j, m * 2, 1, POEIRA[j < 0 ? 1 : 0] + a.toFixed(3) + ')');
      }
    }
  }

  // p = pintor que desenha em pixels de tela (movimento suave, sem tremer)
  // forca: 0–1 (na água a sombra some aos poucos)
  function sombra(p, x, y, larg, forca) {
    var k = forca === undefined ? 1 : forca;
    if (k <= 0.02) return;
    var alfa = { 0: 0.28, 1: 0.18, 2: 0.10, 3: 0.05 };
    for (var j = -3; j <= 3; j++) {
      var m = Math.round(larg * Math.sqrt(1 - (j * j) / 12.25));
      p.ret(x - m, y + j, m * 2, 1, 'rgba(58,36,70,' + (alfa[Math.abs(j)] * k).toFixed(3) + ')');
    }
  }
  J.sombra = function (p, x, y, larg) { sombra(p, x, y, larg); };

  function desenharSprite(p, c, x, y, espelhar) {
    p.sprite(espelhar ? espelho(c) : c, x, y);
  }

  // anel de ondinhas em volta de quem nada (px do jogo, com pintor.ret: nada de canvas novo).
  // Com animação, dois anéis crescem e somem devagar; sem animação, um anel parado.
  function anelElipse(p, x, y, rx, cor) {
    var ry = Math.max(1, rx / 3.2);
    var linhas = Math.ceil(ry);
    for (var j = -linhas; j <= linhas; j++) {
      var q = 1 - (j * j) / (ry * ry);
      if (q < 0) continue;
      var m = rx * Math.sqrt(q);
      var prox = 1 - ((Math.abs(j) + 1) * (Math.abs(j) + 1)) / (ry * ry);
      var mProx = prox > 0 ? rx * Math.sqrt(prox) : 0;
      var w = Math.max(1, m - mProx);
      if (Math.abs(j) === linhas || m - mProx >= m) { p.ret(x - m, y + j, m * 2, 1, cor); continue; }
      p.ret(x - m, y + j, w, 1, cor);
      p.ret(x + m - w, y + j, w, 1, cor);
    }
  }
  function ondinhas(p, x, y, rx, prof, animar) {
    if (prof <= 0.02) return;
    if (!animar) { anelElipse(p, x, y, rx + 1.5, 'rgba(255,255,255,' + (0.55 * prof).toFixed(3) + ')'); return; }
    for (var k = 0; k < 2; k++) {
      var fase = (J.t / 1.6 + k / 2) % 1;
      var alfa = 0.6 * prof * Math.sin(fase * Math.PI);
      if (alfa > 0.02) anelElipse(p, x, y, rx + fase * 5, 'rgba(255,255,255,' + alfa.toFixed(3) + ')');
    }
  }
  // desenha o sprite cortado na linha d'água. prof 0–1; corte = px escondidos na água funda.
  // O corpo afunda AFUNDA do corte, o resto fica embaixo da linha; o recorte é feito com
  // clip em px da tela (desliza suave, sem saltos de pixel inteiro do sprite).
  function desenharNaAgua(p, img, x, yPes, espelhar, prof, corte) {
    if (prof <= 0) { desenharSprite(p, img, x, yPes, espelhar); return; }
    var fundo = prof * corte, afunda = fundo * AFUNDA;
    var linha = linhaDagua(yPes, prof, corte);       // linha d'água, px do jogo
    var ctx = p.ctx, yTela = p.tela(x, linha).y;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, Math.max(0, yTela));
    ctx.clip();
    desenharSprite(p, img, x, yPes + afunda, espelhar);
    ctx.restore();
    // um fio de água clarinho na linha d'água
    p.ret(x - img.width / 2 + 3, linha, img.width - 6, 1, 'rgba(217,255,244,' + (0.55 * prof).toFixed(3) + ')');
  }
  function linhaDagua(yPes, prof, corte) { return yPes - prof * corte * (1 - AFUNDA); }

  /* ---------- ícone de fome/sede acima do unicórnio (px da tela, nítido) ---------- */
  var bolhas = {};
  function bolha(icone) {
    if (bolhas[icone] !== undefined) return bolhas[icone];
    var ic = PA.iconeDesenho ? PA.iconeDesenho(icone.replace(/\uFE0F/g, '')) : null;
    if (!ic) return null;                           // ícone ainda não desenhado: tenta de novo depois
    var K = Reino.Desenho.K, w = 20, h = 23, c = PA.novoCanvas(w, h), ctx = c.getContext('2d');
    function r(x, y, a, b, k) { ctx.fillStyle = k; ctx.fillRect(x, y, a, b); }
    // o mesmo balãozinho do status dos NPCs: caixa arredondada com contorno + rabinho
    r(2, 0, 16, 1, K); r(2, 19, 16, 1, K); r(0, 2, 1, 16, K); r(19, 2, 1, 16, K);
    r(1, 1, 1, 1, K); r(18, 1, 1, 1, K); r(1, 18, 1, 1, K); r(18, 18, 1, 1, K);
    r(2, 1, 16, 18, '#fff8ee'); r(1, 2, 18, 16, '#fff8ee');
    r(2, 17, 16, 1, '#f0dcea'); r(17, 2, 1, 16, '#f0dcea');
    r(8, 19, 4, 1, '#fff8ee'); r(7, 19, 1, 1, K); r(12, 19, 1, 1, K);
    r(9, 20, 2, 1, '#f0dcea'); r(8, 20, 1, 1, K); r(11, 20, 1, 1, K);
    r(9, 21, 2, 1, K);
    ctx.drawImage(ic, 2, 2);
    bolhas[icone] = c;
    return c;
  }
  // 🍎/💧 sobre ela; some durante uma conversa (balão modal), para não empilhar com o balão do personagem
  function iconeMontaria() {
    try {
      if (Reino.Claude && Reino.Claude.dialogoAberto && Reino.Claude.dialogoAberto()) return null;
      return Reino.Cuidados && Reino.Cuidados.iconeMontaria ? Reino.Cuidados.iconeMontaria() : null;
    } catch (e) { return null; }
  }
  // altura estável do sprite (a maior das 5 vistas): o ícone não pula quando ela vira
  var alturas = {};
  function alturaEstavel(chave, gerar) {
    if (alturas[chave] === undefined) {
      var h = 0;
      PA.VISTAS.forEach(function (v) { h = Math.max(h, gerar(v).h); });
      alturas[chave] = h;
    }
    return alturas[chave];
  }
  // x, yTopo em px do jogo (o topo da cabeça de quem leva o ícone)
  function desenharIcone(p, icone, x, yTopo, animar) {
    var b = bolha(icone), ctx = p.ctx;
    if (!b || !ctx) return;
    var s = Math.max(1, Math.round((p.escala || 3) / 2));
    var topo = p.tela(x, yTopo);
    var bob = animar ? Math.round(Math.sin(J.t * 2.4)) * s : 0;
    var bx = Math.round(topo.x - (b.width * s) / 2), by = Math.round(topo.y - b.height * s - s + bob);
    var antes = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(b, bx, by, b.width * s, b.height * s);
    ctx.imageSmoothingEnabled = antes;
  }

  // itens para desenhar na ordem por Y junto com NPCs, móveis e o Claude:
  // montada = um item; bebê e Mariana separados. As faíscas vêm logo antes dela.
  J.itensDesenho = function (p, animar) {
    var P = Reino.Progresso, est = P.estado();
    var id = P.montaria(), def = P.defUni(id), u = est.unis[id];
    var estagio = Reino.Unicornios.estagio(u ? u.xp : 0);
    var quadro = J.andando && animar ? PASSOS[Math.floor(J.t / 0.16) % 4] : 0;
    var usa = est.usando;
    var olhar = PA.vistaDaDirecao(J.olharX, J.olharY);
    var opcoes = { enfeites: usa.enfeites, capa: usa.capa, asasFada: usa.asasFada, vista: olhar.vista };
    var pulo = animar ? Math.abs(Math.sin(J.tPulo * 10)) : 0;
    // prefers-reduced-motion também para tudo o que é da água (ondinhas, partículas, ícone balançando)
    if (Reino.util.reduzMovimentoSistema) animar = false;
    var particulas = animar;
    var icone = iconeMontaria();
    var sujo = montariaSuja();
    // lado para onde o unicórnio olha (a poeira fica atrás dele): 0 de frente ou de costas
    function ladoDe(o) { return o.vista === 'frente' || o.vista === 'costas' ? 0 : (o.espelhar ? -1 : 1); }

    // faíscas do rastro de estrelinhas
    J.faiscas = J.faiscas.filter(function (f) { f.v += 0.016; return f.v < 0.7; });
    function faiscas() {
      J.faiscas.forEach(function (f) {
        var cor = f.v < 0.35 ? '#fff6a8' : '#ffd1e6', fy = f.y - f.v * 6;
        p.ret(f.x, fy, 1, 1, cor);
        if (f.v < 0.3) { p.ret(f.x - 1, fy, 3, 1, cor); p.ret(f.x, fy - 1, 1, 3, cor); }
      });
    }

    var itens, sobre = null;
    if (banhoComUni()) {
      // banho de espuma: o unicórnio está na banheira (quem desenha é o banho) e ela fica a pé, ao lado
      var aPe = PA.mariana(est.aparencia, false, 0, { capa: usa.capa, vista: olhar.vista });
      return [{ y: J.y, desenhar: function () {
        sombra(p, J.x, J.y, 5);
        desenharSprite(p, aPe.canvas, J.x, J.y + 1, olhar.espelhar);
      } }];
    }
    if (estagio >= 1) {
      var spr = PA.montada(def, estagio, quadro, est.aparencia, opcoes);
      var prof = fundura(J.x, J.y), corte = estagio >= 2 ? CORTE.montadaGrande : CORTE.montadaPequena;
      var puloM = pulo * (1 - prof);                 // na água o trote vira deslizar
      var raio = (estagio >= 2 ? 28 : 20) / 2.6 * SOMBRA[olhar.vista];
      var imgM = sujo ? sujar(spr.canvas) : spr.canvas;
      itens = [{ y: J.y, desenhar: function () {
        sombra(p, J.x, J.y, raio, 1 - prof);
        ondinhas(p, J.x, linhaDagua(J.y + 1, prof, corte), raio + 2, prof, animar);
        desenharNaAgua(p, imgM, J.x, J.y + 1 - puloM, olhar.espelhar, prof, corte);
        if (sujo) poeira(p, J.x, J.y + 1 - puloM, spr.w, spr.h, ladoDe(olhar), animar, 1 - prof * 1.5);
      } }];
      if (icone) {
        var hM = alturaEstavel(['m', def.id, estagio, (usa.enfeites || []).join('+')].join('|'), function (v) {
          return PA.montada(def, estagio, 0, est.aparencia, Object.assign({}, opcoes, { vista: v }));
        });
        sobre = function () { desenharIcone(p, icone, J.x, J.y + 1 + prof * corte * AFUNDA - hM, animar); };
      }
    } else {
      // bebê vem atrás, seguindo o rastro, e olha para onde ele mesmo está indo
      var r = pontoAtras(DIST_BEBE);
      var frente = pontoAtras(DIST_BEBE - 3), tras = pontoAtras(DIST_BEBE + 3);
      if (Math.hypot(frente.x - tras.x, frente.y - tras.y) > 1) J.olharBebe = PA.vistaDaDirecao(frente.x - tras.x, frente.y - tras.y);
      var olharB = J.olharBebe || olhar;
      var bebe = PA.unicornio(def, 0, quadro, Object.assign({}, opcoes, { vista: olharB.vista }));
      var menina = PA.mariana(est.aparencia, false, quadro, { capa: usa.capa, vista: olhar.vista });
      pulo *= 1.5;
      var ry = r.y;
      var profB = fundura(r.x, ry), profM = fundura(J.x, J.y);
      var puloB = pulo * (1 - profB);
      var imgB = sujo ? sujar(bebe.canvas) : bebe.canvas;
      itens = [
        { y: ry - 1, desenhar: function () {
          sombra(p, r.x, ry, 7 * SOMBRA[olharB.vista], 1 - profB);
          ondinhas(p, r.x, linhaDagua(ry + 1, profB, CORTE.bebe), 9 * SOMBRA[olharB.vista] + 1, profB, animar);
          desenharNaAgua(p, imgB, r.x, ry + 1 - puloB, olharB.espelhar, profB, CORTE.bebe);
          if (sujo) poeira(p, r.x, ry + 1 - puloB, bebe.w, bebe.h, ladoDe(olharB), animar, 1 - profB * 1.5);
        } },
        { y: J.y, desenhar: function () {
          sombra(p, J.x, J.y, 5, 1 - profM);
          ondinhas(p, J.x, linhaDagua(J.y + 1, profM, CORTE.mariana), 7, profM, animar);
          desenharNaAgua(p, menina.canvas, J.x, J.y + 1, olhar.espelhar, profM, CORTE.mariana);
        } },
      ];
      if (icone) {
        var hB = alturaEstavel(['b', def.id, (usa.enfeites || []).join('+'), usa.asasFada ? 1 : 0].join('|'), function (v) {
          return PA.unicornio(def, 0, 0, Object.assign({}, opcoes, { vista: v }));
        });
        sobre = function () { desenharIcone(p, icone, r.x, ry + 1 + profB * CORTE.bebe * AFUNDA - hB, animar); };
      }
    }
    // respingo e gotinhas: logo na frente de quem está na água
    if (particulas && J.respingos && J.respingos.length) {
      itens.push({ y: J.y + 0.5, desenhar: function () {
        J.respingos.forEach(function (g) {
          var a = 1 - g.v / g.vida;
          if (a > 0.35) p.ret(g.x, g.y, 1, g.pinga || g.vy < -20 ? 2 : 1, g.cor);   // pingando ou subindo, a gota estica
          else p.ret(g.x, g.y, 1, 1, 'rgba(217,255,244,' + (a / 0.35).toFixed(3) + ')');
        });
      } });
    }
    // o ícone de fome/sede fica por cima de todos os personagens
    if (sobre) itens.push({ y: 1e9, desenhar: sobre });
    // as faíscas ficam logo antes do primeiro item dela (atrás dela e do unicórnio)
    var menor = Math.min.apply(null, itens.map(function (i) { return i.y; }));
    if (J.faiscas.length && particulas) itens.unshift({ y: menor - 0.00001, desenhar: faiscas });
    return itens;
  };

  // desenha um sprite com os pés em (x, yPes), espelhado pelo cache de espelhos
  J.desenharSprite = function (p, c, x, yPes, espelhar) { desenharSprite(p, c, x, yPes, espelhar); };

  // desenha a Mariana (e o bebê) na ordem certa, sem mais ninguém
  J.desenhar = function (p, animar) {
    J.itensDesenho(p, animar).sort(function (a, b) { return a.y - b.y; }).forEach(function (i) { i.desenhar(); });
  };

  J.desenharMarcador = function (ctx, t) {
    if (!J.marcador) return;
    var m = J.marcador;
    var x = m.x * T + 8, y = m.y * T + 10;
    var s = 2 + Math.round((Math.sin(t / 150) + 1));
    ctx.fillStyle = '#ff4f9a';
    ctx.fillRect(x - s, y, s * 2 + 1, 1);
    ctx.fillRect(x, y - s, 1, s * 2 + 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, 1, 1);
  };
})();
