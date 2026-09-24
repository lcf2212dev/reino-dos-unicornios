/* A Mariana no mapa: anda com setas ou tocando no chão, monta o unicórnio
   (ou passeia ao lado dele quando ainda é bebê). Os dois olham para 8 direções. */
(function () {
  var T = Mapa.T;
  var J = { tPulo: 0, x: 0, y: 0, olharX: 0, olharY: 1, andando: false, caminho: [], aoChegar: null, t: 0, rastro: [], faiscas: [], portaIgnorada: null, marcador: null };
  var espelhos = new WeakMap();
  var DIST_BEBE = 17;   // quantos pixels o bebê anda atrás da Mariana
  var PASSOS = [1, 0, 2, 0];   // quadros do andar: pé, junto, outro pé, junto
  // largura da sombra conforme a vista (de frente e de costas o corpo fica mais estreito)
  var SOMBRA = { lado: 1, diagFrente: 0.85, diagCostas: 0.85, frente: 0.6, costas: 0.6 };

  function espelho(c) {
    var e = espelhos.get(c);
    if (!e) { e = PA.espelhado(c); espelhos.set(c, e); }
    return e;
  }

  // a cena ativa (mapa ou interior); antes de a cena existir, o próprio Mapa
  function cena() { return (Reino.Cena && Reino.Cena.atual()) || Mapa; }
  // gatilho no tile: porta de prédio (mapa), tapete de saída ou escada (interior)
  function gatilhoEm(tx, ty) {
    var c = cena();
    var g = c.portaEm ? c.portaEm(tx, ty) : null;
    if (!g && c.saidaEm) g = c.saidaEm(tx, ty);
    return g || null;
  }
  J.gatilhoEm = gatilhoEm;

  J.tile = function () { return { x: Math.floor(J.x / T), y: Math.floor((J.y - 2) / T) }; };
  // vira para a direção (dx, dy) da tela
  J.virar = function (dx, dy) {
    var n = Math.hypot(dx, dy);
    if (n > 0.001) { J.olharX = dx / n; J.olharY = dy / n; }
  };
  J.posicionar = function (tx, ty) {
    J.x = tx * T + 8; J.y = ty * T + 12;
    J.caminho = []; J.aoChegar = null; J.marcador = null; J.olharBebe = null;
    J.virar(0, 1);   // chega olhando para quem está jogando
    // o bebê começa um pouquinho à esquerda, olhando para ela
    J.rastro = [{ x: J.x - DIST_BEBE - 4, y: J.y }, { x: J.x, y: J.y }];
  };

  function livre(x, y) {
    var c = cena();
    var pts = [[x - 4, y - 4], [x + 4, y - 4], [x - 4, y - 1], [x + 4, y - 1]];
    return pts.every(function (p) { return !c.solido(Math.floor(p[0] / T), Math.floor(p[1] / T)); });
  }
  // dá para ir em linha reta de a até b sem esbarrar em nada?
  function linhaLivre(a, b) {
    var d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(d / 2);
    for (var i = 1; i <= n; i++) {
      var t = i / n;
      if (!livre(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false;
    }
    return true;
  }
  // tira as curvinhas do caminho de tiles: ela anda reto sempre que dá
  function suavizar(tiles) {
    var pts = tiles.map(function (t) { return { x: t.x * T + 8, y: t.y * T + 12 }; });
    var saida = [], atual = { x: J.x, y: J.y }, i = 0;
    while (i < pts.length) {
      var j = pts.length - 1;
      while (j > i && !linhaLivre(atual, pts[j])) j--;
      saida.push(pts[j]);
      atual = pts[j]; i = j + 1;
    }
    return saida;
  }

  J.montado = function () {
    var P = Reino.Progresso, u = P.estado().unis[P.montaria()];
    return Reino.Unicornios.estagio(u ? u.xp : 0) >= 1;
  };
  function velocidade() { return J.montado() ? 82 : 58; }

  J.irPara = function (tx, ty, aoChegar) {
    var ini = J.tile();
    var cam = cena().caminho(ini, { x: tx, y: ty });
    if (!cam) return false;
    J.caminho = suavizar(cam);
    J.aoChegar = aoChegar || null;
    J.marcador = { x: tx, y: ty, t: 0 };
    if (!cam.length && aoChegar) { var f = aoChegar; J.aoChegar = null; J.marcador = null; f(); }
    return true;
  };
  J.parar = function () { J.caminho = []; J.aoChegar = null; J.marcador = null; };

  // teclas: {x: -1..1, y: -1..1}
  J.atualizar = function (dt, teclas, aoPisarPorta) {
    J.t += dt;
    // o pulinho do trote termina com calma quando ela para (sem tranco)
    if (J.andando || Math.abs(Math.sin(J.tPulo * 10)) > 0.06) J.tPulo += dt;
    var vx = 0, vy = 0;
    if (teclas && (teclas.x || teclas.y)) {
      J.caminho = []; J.aoChegar = null; J.marcador = null;
      vx = teclas.x; vy = teclas.y;
      var n = Math.hypot(vx, vy) || 1; vx /= n; vy /= n;
    } else if (J.caminho.length) {
      // segue o caminho sem frear nas curvas: o que sobra do passo continua no próximo trecho
      var resto = velocidade() * dt;
      while (resto > 0 && J.caminho.length) {
        var alvo = J.caminho[0];
        var dx = alvo.x - J.x, dy = alvo.y - J.y, dist = Math.hypot(dx, dy);
        if (dist > 0.2) J.virar(dx, dy);
        if (dist <= resto) { J.x = alvo.x; J.y = alvo.y; resto -= dist; J.caminho.shift(); }
        else { J.x += dx / dist * resto; J.y += dy / dist * resto; resto = 0; }
      }
      J.andando = true;
      guardarRastro();
      if (!J.caminho.length) {
        J.marcador = null;
        J.andando = false;
        var f = J.aoChegar; J.aoChegar = null;
        if (f) f();
      }
      return;
    }
    if (vx || vy) {
      var s = velocidade() * dt;
      var x0 = J.x, y0 = J.y;
      var nx = J.x + vx * s, ny = J.y + vy * s;
      if (livre(nx, J.y)) J.x = nx;
      if (livre(J.x, ny)) J.y = ny;
      // olha para onde anda de verdade (encostada numa parede, desliza de lado)
      if (J.x !== x0 || J.y !== y0) J.virar(J.x - x0, J.y - y0); else J.virar(vx, vy);
      J.andando = true;
      guardarRastro();
      // pisou numa porta, tapete ou escada andando com as setas
      var tl = J.tile();
      var porta = gatilhoEm(tl.x, tl.y);
      if (porta && J.portaIgnorada !== porta.id && aoPisarPorta) { J.portaIgnorada = porta.id; aoPisarPorta(porta); }
      if (!porta) J.portaIgnorada = null;
    } else {
      J.andando = false;
      var tl2 = J.tile();
      if (!gatilhoEm(tl2.x, tl2.y)) J.portaIgnorada = null;
    }
  };

  // o rastro guarda o caminho feito (a cada quadro) para o bebê seguir de forma contínua
  function guardarRastro() {
    var ult = J.rastro[J.rastro.length - 1];
    if (!ult || Math.hypot(ult.x - J.x, ult.y - J.y) > 0.05) {
      J.rastro.push({ x: J.x, y: J.y });
      var total = 0;
      for (var i = J.rastro.length - 1; i > 0; i--) {
        total += Math.hypot(J.rastro[i].x - J.rastro[i - 1].x, J.rastro[i].y - J.rastro[i - 1].y);
        if (total > DIST_BEBE * 3) { J.rastro.splice(0, i - 1); break; }
      }
    }
    var usa = Reino.Progresso.estado().usando;
    if (usa.estrelinhas && Math.random() < 0.35) J.faiscas.push({ x: J.x - J.olharX * 8 + (Math.random() * 6 - 3), y: J.y - 6 - J.olharY * 4 - Math.random() * 10, v: 0 });
  }

  // ponto do rastro a uma distância exata atrás da Mariana (interpolado, sem saltos)
  function pontoAtras(d) {
    var px = J.x, py = J.y, falta = d;
    for (var i = J.rastro.length - 1; i >= 0; i--) {
      var q = J.rastro[i];
      var seg = Math.hypot(px - q.x, py - q.y);
      if (seg > 0 && seg >= falta) {
        var t = falta / seg;
        return { x: px + (q.x - px) * t, y: py + (q.y - py) * t };
      }
      falta -= seg; px = q.x; py = q.y;
    }
    return { x: px, y: py };
  }

  // p = pintor que desenha em pixels de tela (movimento suave, sem tremer)
  function sombra(p, x, y, larg) {
    var alfa = { 0: 0.28, 1: 0.18, 2: 0.10, 3: 0.05 };
    for (var j = -3; j <= 3; j++) {
      var m = Math.round(larg * Math.sqrt(1 - (j * j) / 12.25));
      p.ret(x - m, y + j, m * 2, 1, 'rgba(58,36,70,' + alfa[Math.abs(j)] + ')');
    }
  }
  J.sombra = sombra;

  function desenharSprite(p, c, x, y, espelhar) {
    p.sprite(espelhar ? espelho(c) : c, x, y);
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

    // faíscas do rastro de estrelinhas
    J.faiscas = J.faiscas.filter(function (f) { f.v += 0.016; return f.v < 0.7; });
    function faiscas() {
      J.faiscas.forEach(function (f) {
        var cor = f.v < 0.35 ? '#fff6a8' : '#ffd1e6', fy = f.y - f.v * 6;
        p.ret(f.x, fy, 1, 1, cor);
        if (f.v < 0.3) { p.ret(f.x - 1, fy, 3, 1, cor); p.ret(f.x, fy - 1, 1, 3, cor); }
      });
    }

    var itens;
    if (estagio >= 1) {
      var spr = PA.montada(def, estagio, quadro, est.aparencia, opcoes);
      itens = [{ y: J.y, desenhar: function () {
        sombra(p, J.x, J.y, (estagio >= 2 ? 28 : 20) / 2.6 * SOMBRA[olhar.vista]);
        desenharSprite(p, spr.canvas, J.x, J.y + 1 - pulo, olhar.espelhar);
      } }];
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
      itens = [
        { y: ry - 1, desenhar: function () { sombra(p, r.x, ry, 7 * SOMBRA[olharB.vista]); desenharSprite(p, bebe.canvas, r.x, ry + 1 - pulo, olharB.espelhar); } },
        { y: J.y, desenhar: function () { sombra(p, J.x, J.y, 5); desenharSprite(p, menina.canvas, J.x, J.y + 1, olhar.espelhar); } },
      ];
    }
    // as faíscas ficam logo antes do primeiro item dela (atrás dela e do unicórnio)
    var menor = Math.min.apply(null, itens.map(function (i) { return i.y; }));
    if (J.faiscas.length) itens.unshift({ y: menor - 0.00001, desenhar: faiscas });
    return itens;
  };

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

  window.Jogador = J;
})();
