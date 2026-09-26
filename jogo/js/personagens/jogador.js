/* A Mariana no mapa: anda com setas ou tocando no chão, monta o unicórnio
   (ou passeia ao lado dele quando ainda é bebê). Os dois olham para 8 direções.
   No lago ela nada: a água é andável, o sprite some embaixo da linha d'água, com ondinhas,
   respingo ao entrar e gotinhas ao sair. */
(function () {
  var T = Mapa.T;
  var J = { tPulo: 0, x: 0, y: 0, olharX: 0, olharY: 1, andando: false, caminho: [], aoChegar: null, t: 0, rastro: [], faiscas: [], portaIgnorada: null, marcador: null };
  var espelhos = new WeakMap();
  var DIST_BEBE = 17;   // quantos pixels o bebê anda atrás da Mariana
  var PASSOS = [1, 0, 2, 0];   // quadros do andar: pé, junto, outro pé, junto
  // largura da sombra conforme a vista (de frente e de costas o corpo fica mais estreito)
  var SOMBRA = { lado: 1, diagFrente: 0.85, diagCostas: 0.85, frente: 0.6, costas: 0.6 };

  /* ---------- nado ----------
     "Nadando" (velocidade, som) = o tile dela é água (Jogador.nadando()).
     O desenho (linha d'água, ondinhas, respingo, gotinhas) segue a água DESENHADA
     (Mapa.fundura): cresce devagar nos primeiros px da margem, sem tranco, e nas pontas
     da elipse, onde o tile é água mas o desenho é areia, ela não aparece cortada. */
  var RAMPA = 12;            // px da margem até a água funda (o corte cresce aos pouquinhos)
  var ENTRA = 0.5, SAI = 0.15;   // fundura (0–1) que conta como entrar e sair (sem piscar na margem)
  // quantos px de baixo do sprite ficam embaixo d'água na parte funda (pernas e barriga);
  // uma parte pequena disso o corpo afunda (AFUNDA), o resto é o corte. Afundar pouco e devagar
  // mantém o passo na margem sem "puxão" (o desenho quase não muda de velocidade ao entrar)
  var CORTE = { montadaGrande: 8, montadaPequena: 7, mariana: 7, bebe: 7 };
  var AFUNDA = 0.25;
  var SUAVE_VEL = 0.18;      // s: a velocidade muda aos poucos ao entrar/sair da água (sem solavanco)
  var CORES_AGUA = ['#ffffff', '#9fdcff', '#d9fff4', '#3eaea3'];   // aparecem na água e no unicórnio branco

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
    if (!cam.length && aoChegar) { var f = aoChegar; J.aoChegar = null; J.marcador = null; f(); }
    return true;
  };
  J.parar = function () { J.caminho = []; J.aoChegar = null; J.marcador = null; };

  // teclas: {x: -1..1, y: -1..1}
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
    var K = '#3a2446', w = 20, h = 23, c = PA.novoCanvas(w, h), ctx = c.getContext('2d');
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
    if (J.faiscas.length) itens.unshift({ y: menor - 0.00001, desenhar: faiscas });
    return itens;
  };

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

  window.Jogador = J;
})();
