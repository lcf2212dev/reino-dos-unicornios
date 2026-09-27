/* A Mariana no mapa: anda com setas ou tocando no chão, monta o unicórnio
   (ou passeia ao lado dele quando ainda é bebê). Os dois olham para 8 direções.
   No lago ela nada: a água é andável, o sprite some embaixo da linha d'água, com ondinhas,
   respingo ao entrar e gotinhas ao sair.
   Aqui: posição, caminho, velocidade, água (fundura, respingo, gotinhas) e o rastro do bebê.
   O desenho (sprites, sombra, ondinhas, sujinho, ícone de fome/sede) fica em
   personagens/jogador-desenho.js, que usa Reino._jogador (INTERNO: J, DIST_BEBE, pontoAtras, fundura). */
(function () {
  var T = Mapa.T;
  var J = { tPulo: 0, x: 0, y: 0, olharX: 0, olharY: 1, andando: false, caminho: [], aoChegar: null, t: 0, rastro: [], faiscas: [], portaIgnorada: null, marcador: null };
  var DIST_BEBE = 17;   // quantos pixels o bebê anda atrás da Mariana

  /* ---------- nado ----------
     "Nadando" (velocidade, som) = o tile dela é água (Jogador.nadando()).
     O desenho (linha d'água, ondinhas, respingo, gotinhas) segue a água DESENHADA
     (Mapa.fundura): cresce devagar nos primeiros px da margem, sem tranco, e nas pontas
     da elipse, onde o tile é água mas o desenho é areia, ela não aparece cortada. */
  var RAMPA = 12;            // px da margem até a água funda (o corte cresce aos pouquinhos)
  var ENTRA = 0.5, SAI = 0.15;   // fundura (0–1) que conta como entrar e sair (sem piscar na margem)
  var SUAVE_VEL = 0.18;      // s: a velocidade muda aos poucos ao entrar/sair da água (sem solavanco)
  var CORES_AGUA = ['#ffffff', '#9fdcff', '#d9fff4', '#3eaea3'];   // aparecem na água e no unicórnio branco

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
  // vira para a mais próxima das 8 direções, com folga (histerese): só troca quando o ângulo passa
  // 10° além da metade do caminho até a vizinha, para não piscar entre duas (thumbstick e mouse)
  // (folgaGraus em Reino.config.controles; com 10 dá exatamente Math.PI / 18)
  var OITAVO = Math.PI / 4;
  J.virar8 = function (dx, dy) {
    if (Math.hypot(dx, dy) < 0.001) return;
    var ang = Math.atan2(dy, dx), atual = Math.round(Math.atan2(J.olharY, J.olharX) / OITAVO);
    var dif = Math.atan2(Math.sin(ang - atual * OITAVO), Math.cos(ang - atual * OITAVO));
    var c = (Reino.config && Reino.config.controles) || {};
    var FOLGA = Math.PI / (180 / (typeof c.folgaGraus === 'number' ? c.folgaGraus : 10));
    if (Math.abs(dif) <= OITAVO / 2 + FOLGA) return J.virar(Math.cos(atual * OITAVO), Math.sin(atual * OITAVO));
    var novo = Math.round(ang / OITAVO) * OITAVO;
    J.virar(Math.cos(novo), Math.sin(novo));
  };
  J.posicionar = function (tx, ty) {
    J.x = tx * T + 8; J.y = ty * T + 12;
    // teleporte ou troca de cena: nada de respingo nem gotinhas; o estado da água recomeça calado
    J.molhado = { ela: null, bebe: null };
    J.gotasAte = { ela: 0, bebe: 0 };
    J.respingos = [];
    J.vel = null;
    J.caminho = []; J.aoChegar = null; J.marcador = null; J.olharBebe = null;
    J.virar(0, 1);   // chega olhando para quem está jogando
    // o bebê começa um pouquinho à esquerda, olhando para ela
    J.rastro = [{ x: J.x - DIST_BEBE - 4, y: J.y }, { x: J.x, y: J.y }];
  };

  // tile de água na cena ativa (só o mapa tem água; interior sem o método = sem água)
  function aguaEm(tx, ty) {
    var c = cena();
    return !!(c.agua && c.agua(tx, ty));
  }
  function livre(x, y, semAgua) {
    var c = cena();
    var pts = [[x - 4, y - 4], [x + 4, y - 4], [x - 4, y - 1], [x + 4, y - 1]];
    return pts.every(function (p) {
      var tx = Math.floor(p[0] / T), ty = Math.floor(p[1] / T);
      return !c.solido(tx, ty) && !(semAgua && aguaEm(tx, ty));
    });
  }
  // dá para ir em linha reta de a até b sem esbarrar em nada (e, com semAgua, sem molhar os pés)?
  function linhaLivre(a, b, semAgua) {
    var d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(d / 2);
    for (var i = 1; i <= n; i++) {
      var t = i / n;
      if (!livre(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, semAgua)) return false;
    }
    return true;
  }
  // tira as curvinhas do caminho de tiles: ela anda reto sempre que dá.
  // A reta só pode passar pela água se o próprio trecho do caminho que ela pula passa pela água
  // (senão, tocar do outro lado do lago faria ela atravessar nadando o que o caminho contornou).
  function suavizar(tiles) {
    var pts = tiles.map(function (t) { return { x: t.x * T + 8, y: t.y * T + 12 }; });
    var molhado = tiles.map(function (t) { return aguaEm(t.x, t.y); });
    var ini = J.tile(), comecaNaAgua = aguaEm(ini.x, ini.y);
    function trechoMolhado(i, j) {
      if (i === 0 && comecaNaAgua) return true;
      for (var k = Math.max(0, i - 1); k <= j; k++) if (molhado[k]) return true;
      return false;
    }
    var saida = [], atual = { x: J.x, y: J.y }, i = 0;
    while (i < pts.length) {
      var j = pts.length - 1;
      while (j > i && !linhaLivre(atual, pts[j], !trechoMolhado(i, j))) j--;
      saida.push(pts[j]);
      atual = pts[j]; i = j + 1;
    }
    return saida;
  }

  J.montado = function () {
    var P = Reino.Progresso, u = P.estado().unis[P.montaria()];
    return Reino.Unicornios.estagio(u ? u.xp : 0) >= 1;
  };
  // ela está num tile de água (o nado deixa mais devagar)
  J.nadando = function () { var t = J.tile(); return aguaEm(t.x, t.y); };
  function fatorCuidados() {
    try {
      var C = Reino.Cuidados, f = C && C.fatorVelocidade ? C.fatorVelocidade() : 1;
      return typeof f === 'number' && f > 0 ? f : 1;
    } catch (e) { return 1; }
  }
  // px/s: montada 82, a pé 58; × fator do nado na água; × fome/sede (Cuidados.fatorVelocidade)
  J.velocidade = function () {
    var nado = (Reino.config && Reino.config.nado) || {};
    return (J.montado() ? 82 : 58) * (J.nadando() ? (nado.fator || 0.6) : 1) * fatorCuidados();
  };
  // a velocidade usada no passo chega à de J.velocidade() aos poucos (sem tranco na margem)
  function velocidade(dt) {
    var alvo = J.velocidade();
    if (J.vel == null || !(dt > 0)) J.vel = alvo;
    else J.vel += (alvo - J.vel) * (1 - Math.exp(-dt / SUAVE_VEL));
    return J.vel;
  }

  J.irPara = function (tx, ty, aoChegar) {
    var ini = J.tile();
    var cam = cena().caminho(ini, { x: tx, y: ty });
    if (!cam) return false;
    J.caminho = suavizar(cam);
    J.aoChegar = aoChegar || null;
    J.marcador = { x: tx, y: ty, t: 0 };
    // já está no destino: o marcador apaga (e o aoChegar, se houver, roda na hora)
    if (!cam.length) { var f = aoChegar; J.aoChegar = null; J.marcador = null; if (f) f(); }
    return true;
  };
  J.parar = function () { J.caminho = []; J.aoChegar = null; J.marcador = null; };

  // teclas: {x: -1..1, y: -1..1, livre?} (livre: direção analógica do thumbstick/mouse, vira em 8 com folga)
  J.atualizar = function (dt, teclas, aoPisarPorta) {
    mover(dt, teclas, aoPisarPorta);
    atualizarAgua(dt);
  };
  function mover(dt, teclas, aoPisarPorta) {
    J.t += dt;
    var passo = velocidade(dt) * dt;
    // o pulinho do trote termina com calma quando ela para (sem tranco)
    if (J.andando || Math.abs(Math.sin(J.tPulo * 10)) > 0.06) J.tPulo += dt;
    var vx = 0, vy = 0;
    if (teclas && (teclas.x || teclas.y)) {
      J.caminho = []; J.aoChegar = null; J.marcador = null;
      vx = teclas.x; vy = teclas.y;
      var n = Math.hypot(vx, vy) || 1; vx /= n; vy /= n;
    } else if (J.caminho.length) {
      // segue o caminho sem frear nas curvas: o que sobra do passo continua no próximo trecho
      var resto = passo;
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
      var s = passo;
      var x0 = J.x, y0 = J.y;
      var nx = J.x + vx * s, ny = J.y + vy * s;
      if (livre(nx, J.y)) J.x = nx;
      if (livre(J.x, ny)) J.y = ny;
      // olha para onde anda de verdade (encostada numa parede, desliza de lado)
      var virar = teclas.livre ? J.virar8 : J.virar;
      if (J.x !== x0 || J.y !== y0) virar(J.x - x0, J.y - y0); else virar(vx, vy);
      J.andando = true;
      guardarRastro();
      // pisou numa porta, tapete ou escada andando com as setas, o mouse ou o thumbstick
      var tl = J.tile();
      var porta = gatilhoEm(tl.x, tl.y);
      if (porta && J.portaIgnorada !== porta.id && aoPisarPorta) { J.portaIgnorada = porta.id; aoPisarPorta(porta); }
      if (!porta) J.portaIgnorada = null;
    } else {
      J.andando = false;
      var tl2 = J.tile();
      if (!gatilhoEm(tl2.x, tl2.y)) J.portaIgnorada = null;
    }
  }

  /* ---------- água: fundura, respingo e gotinhas ---------- */
  function animacoesLigadas() {
    var est = Reino.Progresso && Reino.Progresso.estado();
    return !!(est && est.ajustes && est.ajustes.animacoes !== false) && !Reino.util.reduzMovimentoSistema;
  }
  // 0 (seco) a 1 (água funda) no ponto dos pés, pela água desenhada do mapa
  function fundura(x, y) {
    var c = cena();
    if (c.tipo !== 'mapa' || !c.agua || !Mapa.fundura) return 0;
    var d = Mapa.fundura(x, y) / RAMPA;
    if (d <= 0) return 0;
    if (d >= 1) return 1;
    return d * d * (3 - 2 * d);
  }
  J.fundura = fundura;
  // quem está no mapa agora: ela (ou o conjunto montado) e, a pé, o bebê
  function corpos() {
    var lista = [{ id: 'ela', x: J.x, y: J.y, larg: 7, alto: 14 }];
    if (J.montado()) { lista[0].larg = 11; lista[0].alto = 18; }
    else { var r = pontoAtras(DIST_BEBE); lista.push({ id: 'bebe', x: r.x, y: r.y, larg: 7, alto: 10 }); }
    return lista;
  }
  // coroa de gotas saindo dos dois lados do corpo, subindo e caindo de volta (~0,6 s)
  function respingar(x, y, larg) {
    for (var i = 0; i < 16; i++) {
      var lado = i % 2 ? 1 : -1;
      var abre = 0.25 + Math.random() * 0.75;          // 0 = sobe reto, 1 = bem aberta
      var v = 70 + Math.random() * 40;
      J.respingos.push({ x: x + lado * (larg * 0.6 + Math.random() * 3), y: y - 1 - Math.random() * 2,
        vx: lado * v * abre * 0.55, vy: -v * (1 - abre * 0.35),
        v: 0, vida: 0.5 + Math.random() * 0.2, cor: CORES_AGUA[i % 4], g: 320 });
    }
  }
  // gotinha pingando do corpo (depois de sair da água)
  function pingar(c) {
    J.respingos.push({ x: c.x + (Math.random() - 0.5) * c.larg * 1.6, y: c.y - 2 - Math.random() * c.alto * 0.7,
      vx: 0, vy: 8 + Math.random() * 8, v: 0, vida: 0.35 + Math.random() * 0.15, cor: Math.random() < 0.6 ? CORES_AGUA[1] : CORES_AGUA[3], g: 110, pinga: true });
  }
  function atualizarAgua(dt) {
    if (!J.molhado) { J.molhado = { ela: null, bebe: null }; J.gotasAte = { ela: 0, bebe: 0 }; J.respingos = []; }
    var anima = animacoesLigadas();
    corpos().forEach(function (c) {
      var f = fundura(c.x, c.y), antes = J.molhado[c.id];
      if (antes === null || antes === undefined) { J.molhado[c.id] = f >= ENTRA; return; }
      if (!antes && f >= ENTRA) {
        J.molhado[c.id] = true;
        J.gotasAte[c.id] = 0;
        if (c.id === 'ela') Reino.Som.tocar('splash');
        if (anima) respingar(c.x, c.y, c.larg);
      } else if (antes && f <= SAI) {
        J.molhado[c.id] = false;
        J.gotasAte[c.id] = J.t + 1;          // gotinhas por 1 s
        if (c.id === 'ela') Reino.Som.tocar('gotas');
      }
      if (anima && J.gotasAte[c.id] > J.t && Math.random() < dt / 0.045) pingar(c);
    });
    if (!anima) { J.respingos.length = 0; return; }
    J.respingos = J.respingos.filter(function (g) {
      g.v += dt; g.vy += g.g * dt;
      g.x += g.vx * dt; g.y += g.vy * dt;
      return g.v < g.vida;
    });
  }

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
    if (usa.estrelinhas && animacoesLigadas() && Math.random() < 0.35) J.faiscas.push({ x: J.x - J.olharX * 8 + (Math.random() * 6 - 3), y: J.y - 6 - J.olharY * 4 - Math.random() * 10, v: 0 });
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

  /* ---------- para o banho de espuma (js/sistemas/banho.js) ---------- */
  // onde o unicórnio está agora (pés, px do jogo) e para onde olha: montada, com ela; bebê, no rastro
  J.posMontaria = function () {
    if (J.montado()) {
      var o = PA.vistaDaDirecao(J.olharX, J.olharY);
      return { x: J.x, y: J.y + 1, montado: true, vista: o.vista, espelhar: o.espelhar };
    }
    var r = pontoAtras(DIST_BEBE), ob = J.olharBebe || PA.vistaDaDirecao(J.olharX, J.olharY);
    return { x: r.x, y: r.y + 1, montado: false, vista: ob.vista, espelhar: ob.espelhar };
  };
  // o bebê volta do banho: fica a DIST_BEBE dela, na direção de (x, y), olhando para ela
  // (o rastro vira uma reta dela até um pouco além dele: pontoAtras cai exatamente ali)
  J.bebeVoltou = function (x, y) {
    var d = Math.hypot(x - J.x, y - J.y);
    var ux = d > 0.5 ? (x - J.x) / d : -1, uy = d > 0.5 ? (y - J.y) / d : 0;
    J.rastro = [{ x: J.x + ux * (DIST_BEBE + 8), y: J.y + uy * (DIST_BEBE + 8) }, { x: J.x, y: J.y }];
    J.olharBebe = PA.vistaDaDirecao(-ux, -uy);
  };
  J.DIST_BEBE = DIST_BEBE;

  Reino._jogador = { J: J, DIST_BEBE: DIST_BEBE, pontoAtras: pontoAtras, fundura: fundura };
  window.Jogador = J;
})();
