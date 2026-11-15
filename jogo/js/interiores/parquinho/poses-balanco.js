/* Parquinho, parte 7: o balanço (fase 1), uma pose interativa (interativo: true; o esquema no cabeçalho de brincar.js):
   ela no assento azul e o unicórnio no rosa, parados até ela puxar. Arrastar (para cima = para trás; para baixo também
   puxa, para a frente) ou segurar Espaço/Enter/↑ puxa, com o medidor de força ao lado; soltar faz ele ir e voltar,
   cada vez menos, até parar (ela continua sentada). Puxou tudo (config.parquinho.balanco.cheio) e soltou: no pico da
   frente os dois voam dando cambalhota, caem na caixa de areia (puf de areia, estrelinhas de tontura; chama
   P.areiaTombo, se existir) e saem da caixa; ela fica num tile livre ao lado dela. Descer: toque sem arrastar, Esc ou
   ←/→/↓ (A/D/S). O balanço vai para trás e para a frente na direção da câmera (a caixa de areia fica na frente dele).
   As contas (sem desenho) estão em P.Balanco (balanco.js); as medidas em P.GEO.balanco (objetos.js).
   Sem Animações: segue o dedo e volta logo ao meio ao soltar; puxou tudo = os dois aparecem direto na caixa.
   Estado em st.bal (só desta brincadeira); a mãozinha que ensina o gesto some no 1º puxão da sessão (memória).
   Nada roda no carregamento. */
(function () {
  var R = window.Reino;
  var P = R._predios.parquinho, GEO = P.GEO, H = P.H, reg = P.registrarPose;
  var K = R.Desenho.K;
  var TONTO_MS = 900, SAIR_MS = 500, ALTO = 34, ATRASO_UNI = 90, PUF_MS = 450, VOLTA_CURTA_MS = 150;
  var DESCER = { ArrowLeft: 1, ArrowRight: 1, ArrowDown: 1, a: 1, A: 1, d: 1, D: 1, s: 1, S: 1 };
  var PUXAR = { ' ': 1, Enter: 1, ArrowUp: 1, w: 1, W: 1 };
  var AREIA = ['#e8c77e', '#f6e2a8', '#d8bd78'];
  var ARCO = ['#ff5c6a', '#ff9f45', '#ffd34d', '#5ed65e', '#5fb4ff', '#a66bff'];
  var jaPuxou = false;

  function Bal() { return P.Balanco; }
  function cfg() { return R.config.parquinho.balanco; }
  function agora() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function tocar(som) { try { if (R.Som && R.Som.tocar) R.Som.tocar(som); } catch (e) {} }
  function noParquinho(st) { var c = R.Cena && R.Cena.atual && R.Cena.atual(); return !!c && c.id === st.interior; }

  /* ---------- a linha do tempo depois de soltar (ms) e o estado ---------- */
  function linha(st) {
    var b = st.bal;
    if (st.curta) return { pico: 0, voo: 0, caido: R.config.parquinho.curtaMs, sair: 0 };
    return { pico: b.pico, voo: cfg().voarMs, caido: TONTO_MS, sair: SAIR_MS };
  }
  // 'balanco' (os dois sentados), 'voo', 'caido' (na areia, tontos), 'sair' (pulando para fora da caixa)
  function fase(st, t) {
    var b = st.bal;
    if (!b.voa) return 'balanco';
    var L = linha(st), ms = t - b.tSolto;
    if (ms < L.pico) return 'balanco';
    if (ms < L.pico + L.voo) return 'voo';
    return ms < L.pico + L.voo + L.caido ? 'caido' : 'sair';
  }
  // a cada quadro: o balanço segue o alvo (segurando) ou vai e volta (solto); o unicórnio um tiquinho atrás
  function atualizar(st, t) {
    var b = st.bal, dt = Math.max(0, Math.min(50, t - (b.tq || t)));
    b.tq = t;
    if (b.modo === 'segura') {
      if (b.tecla) b.alvo = Bal().tecla(b.tecla.a0, t - b.tecla.t0);
      b.a += (b.alvo - b.a) * (st.curta ? 1 : 1 - Math.exp(-dt / 70));
      if (Math.abs(b.alvo) > 0.15) jaPuxou = true;
      if (Bal().voa(b.alvo) && !b.avisou) { b.avisou = true; tocar('brilho'); }
      if (!Bal().voa(b.alvo)) b.avisou = false;
    } else if (b.modo === 'solto') {
      var ms = t - b.tSolto;
      if (st.curta) b.a = b.a0 * Math.max(0, 1 - ms / VOLTA_CURTA_MS);
      else b.a = Bal().solto(b.a0, ms);
      if (b.a === 0 && !b.voa) b.modo = 'parado';
    } else b.a = 0;
    b.au += (b.a - b.au) * (st.curta ? 1 : 1 - Math.exp(-dt / 90));
  }

  function segurar(st, tecla) {
    var b = st.bal;
    b.modo = 'segura'; b.agarrou = b.a; b.alvo = b.a; b.dir = 0; b.tecla = tecla || null; b.gen++;
  }
  function soltar(st) {
    var b = st.bal, puxao = b.alvo, t = agora();
    b.tecla = null; b.gen++;
    b.voa = Bal().voa(puxao);
    b.a0 = b.voa && Math.abs(b.a) < 0.5 ? puxao : b.a;   // soltou antes de o balanço alcançar o dedo: vale o puxão
    b.tSolto = t; b.modo = 'solto'; b.pico = Bal().picoFrente(b.a0);
    if (!b.voa) {
      if (Math.abs(b.a0) < 0.03) { b.modo = 'parado'; b.a = 0; return; }
      if (!st.curta) somDosPicos(st, b.gen, Infinity);
      return;
    }
    // puxou tudo: os picos até o voo, o voo, a queda, a tontura e a saída da caixa; o tile onde ela fica no fim
    b.lado = ladoLivre(st);
    var L = linha(st), g = b.gen;
    if (!st.curta) { somDosPicos(st, g, L.pico); st.depois(L.pico, function () { tocar('sacudida'); }); }
    st.depois(L.pico + L.voo, function () {
      tocar(st.curta ? 'plim' : 'chocalho');
      try { if (P.areiaTombo) P.areiaTombo(); } catch (e) { console.error(e); }
    });
    if (!st.curta) {
      st.depois(L.pico + L.voo + 250, function () { tocar('sininhos'); });
      st.depois(L.pico + L.voo + L.caido, function () { tocar('toque'); });
    }
    st.depois(L.pico + L.voo + L.caido + L.sair, function () { st.acabar(false); });
  }
  function ladoLivre(st) {
    var c = noParquinho(st) ? R.Cena.atual() : null;
    return Bal().ladoDaCaixa(st.bal.caixa, c && c.solido ? function (x, y) { return c.solido(x, y); } : null);
  }
  function somDosPicos(st, g, ate) {
    Bal().picos(st.bal.a0).forEach(function (ms) {
      if (ms < ate) st.depois(ms, function () { if (st.bal.gen === g) tocar('toque'); });
    });
  }

  /* ---------- desenho ---------- */
  // o sprite girado em passos de 90° em volta do meio (cambalhota), com os pés em (x, yPes) quando q = 0
  function girado(p, img, x, yPes, q) {
    if (!q) { H.spr(p, img, x, yPes, false); return; }
    var ctx = p.ctx, c = p.tela(x, yPes - img.height / 2), esc = (p.tela(100, 0).x - p.tela(0, 0).x) / 100;
    var w = Math.round(img.width * esc), h = Math.round(img.height * esc);
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(q * Math.PI / 2);
    ctx.drawImage(img, -Math.round(w / 2), -Math.round(h / 2), w, h);
    ctx.restore();
  }
  // afundado na areia: só o que fica acima da linha yPes, o corpo afunda `fundo` px; uma bordinha de areia na frente
  function afundado(p, img, x, yPes, fundo) {
    H.faixa(p, yPes - 80, yPes, function () { H.spr(p, img, x, yPes + fundo, false); });
    p.ret(Math.round(x - img.width / 2) + 2, yPes - 1, img.width - 4, 1, AREIA[1]);
    p.ret(Math.round(x - img.width / 2) + 1, yPes, img.width - 2, 1, AREIA[0]);
  }
  // o puf de areia: grãos que saem de (x, y) e caem, pelo tempo desde a queda
  function puf(p, x, y, ms, semente) {
    if (ms < 0 || ms > PUF_MS) return;
    for (var i = 0; i < 9; i++) {
      var ang = (i / 8) * Math.PI + (semente % 3) * 0.2, vx = Math.cos(ang) * 0.05, vy = 0.04 + ((i * 7 + semente) % 5) * 0.01;
      var gy = y - (vy * ms - 0.00025 * ms * ms);
      if (gy > y) continue;
      p.ret(Math.round(x + vx * ms * (1 + (i % 2) * 0.4)), Math.round(gy), 1, 1, AREIA[i % 3]);
    }
  }
  // três estrelinhas de tontura girando em volta de (x, y); paradas sem Animações
  function tontura(p, x, y, ms, animar) {
    for (var i = 0; i < 3; i++) {
      var ang = (animar ? ms / 170 : 0.6) + i * Math.PI * 2 / 3;
      var sx = Math.round(x + Math.cos(ang) * 7), sy = Math.round(y + Math.sin(ang) * 2);
      p.ret(sx - 1, sy, 3, 1, '#ffe066'); p.ret(sx, sy - 1, 1, 3, '#ffe066'); p.ret(sx, sy, 1, 1, '#ffffff');
    }
  }
  // o medidor de força ao lado do balanço: vazio, as cores clarinhas mostram o caminho; enche de baixo para cima
  // (verde, amarelo, laranja) e, puxado tudo, vira arco-íris e brilha; a estrelinha em cima é o "tudo"
  var CLARO = ['#cdeecd', '#fff0b8', '#ffdcb8'], CHEIO = ['#5ed65e', '#ffd34d', '#ff9f45'];
  var ESTRELA = ['..K..', '.KyK.', 'KyyyK', '.KyK.', 'K.K.K'];
  function medidor(p, x, y, nivel, e, animar) {
    var A = 40, cheio = cfg().cheio, n = Math.round(Math.max(0, Math.min(1, nivel)) * A), tudo = nivel >= cheio, r;
    p.ret(x - 1, y - 1, 8, A + 2, K);
    for (r = 0; r < A; r++) {
      var f = (r + 1) / A, faixa = f <= 0.5 ? 0 : f <= 0.8 ? 1 : 2, desce = animar ? Math.floor(e / 90) : 0;
      var cor = r >= n ? CLARO[faixa] : tudo ? ARCO[(r + desce) % ARCO.length] : CHEIO[faixa];
      p.ret(x, y + A - 1 - r, 6, 1, cor);
      if (r % 8 === 7 && r < A - 1) p.ret(x, y + A - 1 - r, 1, 1, K);   // os risquinhos da régua
    }
    pontos(p, ESTRELA, x, y - 7, tudo ? '#ffe066' : '#fff6cc');
    if (tudo && (!animar || Math.floor(e / 180) % 2 === 0)) {
      p.ret(x - 2, y - 2, 10, 1, '#fff1a0'); p.ret(x - 2, y + A + 1, 10, 1, '#fff1a0');
      p.ret(x - 2, y - 2, 1, A + 4, '#fff1a0'); p.ret(x + 7, y - 2, 1, A + 4, '#fff1a0');
      [[-4, -5], [9, 2], [-5, 12], [10, -4]].forEach(function (s) { p.ret(x + s[0], y + s[1], 1, 3, '#ffffff'); p.ret(x + s[0] - 1, y + s[1] + 1, 3, 1, '#ffffff'); });
    }
  }
  // a mãozinha que ensina: dedo para cima e a setinha, subindo sem parar (parada sem Animações)
  var MAO = ['.KK....', 'KwwK...', 'KwwK...', 'KwwKKK.', 'KwwwwwK', 'KwwwwwK', 'KwwwwwK', '.KwwwK.', '..KKK..'];
  var SETA = ['..K..', '.KwK.', 'KwwwK', '.KwK.', '.KwK.', '.KKK.'];
  function pontos(p, desenho, x, y, claro) {
    desenho.forEach(function (l, j) {
      for (var i = 0; i < l.length; i++) if (l[i] !== '.') p.ret(x + i, y + j, 1, 1, l[i] === 'K' ? K : claro);
    });
  }
  function mao(p, x, y, e, animar) {
    var sobe = animar ? Math.round(((e % 1200) / 1200) * 12) : 6, y0 = y - sobe;
    pontos(p, MAO, x, y0, '#ffe8d6');
    pontos(p, SETA, x - 1, y0 - 7, '#ffffff');   // a setinha para cima
  }

  reg('balanco', {
    esconde: true,
    interativo: true,
    comecar: function (st, ctx) {
      st.bal = { modo: 'parado', a: 0, au: 0, alvo: 0, a0: 0, agarrou: 0, dir: 0, tecla: null, gen: 0, voa: false, tq: 0,
        caixa: Bal().caixa(ctx && ctx.interior && ctx.interior.objetos) || { x: st.obj.x, y: st.obj.y + 6, w: 3, h: 2 } };
    },
    toque: function (st, ev) {
      var b = st.bal;
      if (b.voa) return;                                  // já voando: nada a fazer
      if (ev.fase === 'apertou') { if (!b.tecla) segurar(st); return; }
      if (b.modo !== 'segura' || b.tecla) return;
      if (ev.fase === 'moveu') {
        if (!b.dir && Math.sqrt(ev.dx * ev.dx + ev.dy * ev.dy) > 6) b.dir = Bal().direcao(ev.dx, ev.dy);
        if (b.dir) b.alvo = Bal().arrasto(b.agarrou, ev.dx, ev.dy, b.dir);
        return;
      }
      if (ev.toque) { st.acabar(true); return; }          // um toque sem arrastar: ela desce
      soltar(st);
    },
    tecla: function (st, ev) {
      var b = st.bal;
      if (b.voa) return;
      if (ev.fase === 'desceu') {
        if (DESCER[ev.key]) { st.acabar(false); return; }
        if (PUXAR[ev.key] && b.modo !== 'segura') segurar(st, { key: ev.key, t0: agora(), a0: b.a });
        return;
      }
      if (b.tecla && b.tecla.key === ev.key) { b.alvo = Bal().tecla(b.tecla.a0, agora() - b.tecla.t0); soltar(st); }
    },
    // puxou tudo: ela fica ao lado da caixa de areia (só se ainda estiver no parquinho)
    saida: function (st) {
      var b = st.bal;
      return b && b.voa && noParquinho(st) ? (b.lado || ladoLivre(st)) : null;
    },
    depurar: function (st) {
      var b = st.bal, r = function (v) { return Math.round(v * 100) / 100; };
      return { modo: b.modo, fase: fase(st, agora()), a: r(b.a), alvo: r(b.alvo), voa: b.voa, maozinha: !jaPuxou };
    },
    itens: function (p, st, e, animar) {
      var t = agora();
      atualizar(st, t);
      var b = st.bal, o = H.origem(st), g = GEO.balanco, L = g.assento - g.barra, fs = fase(st, t), c = P.pintor(p);
      var sentados = fs === 'balanco', itens = [];
      g.assentos.forEach(function (ax0, i) {
        var s = Bal().assento(i ? b.au : b.a, L), ax = o.x + ax0, y = o.y + g.barra + Math.round(s.dy);
        var chao = o.y + 30 + Math.round(s.chao);
        // sempre na frente da armação (para trás ela sobe, mas não some atrás da barra)
        itens.push(H.item(H.base(st) + Math.max(0, s.chao) + i * 0.01, function () {
          if (sentados) H.sombra(p, ax, chao, i ? 7 : 5);
          P.assento(c, ax, o.y + g.barra, ax, y, g.cores[i]);
          if (!sentados) return;
          if (i === 0) H.spr(p, H.ela(true, 'frente'), ax, y + 6, false);
          else H.spr(p, H.uni('frente'), ax, y + 1, false);
          P.linha(c, ax - 5, o.y + g.barra, ax - 5, y, '#8e9ab4'); P.linha(c, ax + 5, o.y + g.barra, ax + 5, y, '#8e9ab4');
        }));
      });
      if (!sentados) itens = itens.concat(voando(p, st, t, fs, animar));
      // no voo e na areia a câmera vai junto com ela (o Jogador anda escondido até o lado da caixa; sem Animações, pula)
      if (!sentados && noParquinho(st) && window.Jogador) {
        var Lt = linha(st), k = Lt.voo > 0 ? Math.min(1, (t - b.tSolto - Lt.pico) / Lt.voo) : 1, lado = b.lado;
        Jogador.x = Math.round(H.lerp(st.de.x, lado.x * 16 + 8, k));
        Jogador.y = Math.round(H.lerp(st.de.y, lado.y * 16 + 12, k));
      }
      return itens;
    },
    sobre: function (p, st, e, animar) {
      var b = st.bal, o = H.origem(st), g = GEO.balanco;
      if (!b || b.voa) return;
      var nivel = b.modo === 'segura' ? Math.abs(b.alvo) : b.modo === 'solto' ? Math.abs(b.a0) * Math.max(0, 1 - (agora() - b.tSolto) / 400) : 0;
      medidor(p, o.x + 53, o.y - 14, nivel, e, animar);
      if (!jaPuxou && b.modo === 'parado') mao(p, o.x + g.assentos[0] - 3, o.y + g.assento + 16, e, animar);
    },
  });

  // os dois fora do balanço: voando, caídos na areia ou pulando para fora da caixa
  function voando(p, st, t, fs, animar) {
    var b = st.bal, L = linha(st), g = GEO.balanco, o = H.origem(st), cx = b.caixa;
    var s0 = { x: cx.x * 16, y: cx.y * 16 }, ms = t - b.tSolto - L.pico, lado = b.lado, atraso = st.curta ? 0 : ATRASO_UNI;
    var aL = st.curta ? 0 : Bal().solto(b.a0, L.pico), corda = g.assento - g.barra;
    var quem = [
      { img: function () { return H.ela(true, 'frente'); }, pe: 6, ax: g.assentos[0], cai: { x: s0.x + 15, y: s0.y + 24 }, fim: { x: lado.x * 16 + 8, y: lado.y * 16 + 12 }, atraso: 0, larg: 5 },
      { img: function () { return H.uni('frente'); }, pe: 1, ax: g.assentos[1], cai: { x: s0.x + 33, y: s0.y + 26 }, fim: { x: lado.x * 16 + 22, y: lado.y * 16 + 12 }, atraso: atraso, larg: 7 },
    ];
    var yItem = (cx.y + cx.h) * 16 + 0.5;   // na frente da caixa de areia (ela é um item no y da base)
    return quem.map(function (q, i) {
      return H.item(yItem + i * 0.01, function () {
        var m = ms - q.atraso, img = q.img();
        if (L.voo > 0 && (fs === 'voo' || (fs === 'caido' && m < L.voo))) {
          var s = Bal().assento(aL, corda), x0 = o.x + q.ax, de = { x: x0, y: o.y + g.barra + Math.round(s.dy) + q.pe, chao: o.y + 30 + Math.round(s.chao) };
          var k = Math.max(0, m / L.voo), pt = Bal().voo(k, de, q.cai, ALTO);
          H.sombra(p, pt.x, pt.chao, Math.max(3, q.larg - Math.round(pt.h / 10)));
          girado(p, img, pt.x, pt.y, Bal().quarto(k, 1));
          return;
        }
        var naAreia = m - L.voo;
        if (fs === 'caido') {
          afundado(p, img, q.cai.x, q.cai.y, 4);
          if (animar) puf(p, q.cai.x, q.cai.y, naAreia, i * 5 + 1);
          if (naAreia > 150) tontura(p, q.cai.x, q.cai.y - img.height + 3, naAreia, animar);
          return;
        }
        // pulando para fora da caixa, até o lado dela
        var kk = Math.min(1, Math.max(0, (naAreia - L.caido) / L.sair)), pt2 = H.arco(q.cai, q.fim, kk, 10);
        H.sombra(p, Math.round(H.lerp(q.cai.x, q.fim.x, kk)), Math.round(H.lerp(q.cai.y, q.fim.y, kk)), q.larg);
        H.spr(p, i ? H.uni('frente', H.passo(m, animar)) : H.ela(false, 'frente', H.passo(m, animar)), pt2.x, pt2.y, false);
      });
    });
  }
})();
