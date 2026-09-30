/* Laboratório de Química, a bancada, parte 2 de 3: as animações das reações (docs/contratos/quimica.md §3, efeitos).
   Registra em Reino._quimicaPalco.EFEITOS (criado por quimica-palco.js) os 9 efeitos e o 'nada' (mistura sem receita):
   { dur (ms), sons: [[ms, som]] (só sons que já existem), som (o único, sem animação), desenhar(ctx, t, info) }.
   desenhar(ctx, dur, info) é o quadro final: é ele que aparece sem animação. Tudo em pixel art: cor em 3 ou 4 degraus,
   fumaça pontilhada, confete com Reino.config.paleta.confete; posições fixas por Reino.Desenho.sorte (sem Math.random). */
(function () {
  var R = window.Reino;
  var P = R._quimicaPalco, D = R.Desenho, K = D.K, C = D.C, BEQ = P.BEQ;
  var ret = D.ret, clarear = D.clarear, escurecer = D.escurecer, sorte = D.sorte;
  var XW = BEQ.dentroW, FUNDO = BEQ.fundo, MEIO = BEQ.meio, BOCA = BEQ.topo, MESA = P.MESA, BRANCO = C.branco;
  function fase(t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); }   // 0..1 entre a e b
  function degrau(p, n) { return Math.floor(p * n + 1e-9) / n; }                     // p em n degraus
  function topoDe(nivel) { return FUNDO + 1 - nivel; }
  var ESPERA = [0, 1, 1, 0, -1, -1];   // balanço de lado, em degraus de 1 px

  // os primeiros 600 ms de toda reação: as camadas viram uma cor só em 4 degraus, com a colher girando
  var MISTURA = 600;
  function misturando(ctx, t, info, cor, dx) {
    var s = Math.min(4, Math.floor(t / 150));
    P.bequer(ctx, function (c, x0) {
      if (s >= 4) { P.liquido(c, x0, topoDe(info.nivel), XW, info.nivel, cor); return; }
      var lista = info.cores.map(function (co, i) {
        return { cor: D.misturar(co, cor, s / 4), tipo: s < 2 ? info.tipos[i] : 'liquido', h: BEQ.camada };
      });
      var topo = P.camadas(c, lista, x0);
      for (var k = 0; k < 10; k++) {
        var a = k * 0.63 + Math.floor(t / 50) * 0.5;
        ret(c, Math.round(MEIO + Math.cos(a) * 12), Math.round(topo + info.nivel / 2 + Math.sin(a) * (info.nivel / 2 - 2)), 1, 1, clarear(cor, 0.55));
      }
    }, dx);
  }
  // bolhinhas subindo no líquido
  function borbulhas(c, x0, topo, t, cor, qtd) {
    var alto = Math.max(2, FUNDO - topo - 1);
    for (var k = 0; k < qtd; k++) {
      var x = x0 + 3 + Math.floor(sorte(k, 1, 9) * (XW - 6)), y = FUNDO - ((Math.floor(t / 30) + k * 7) % alto);
      ret(c, x, y, k % 3 ? 1 : 2, k % 3 ? 1 : 2, clarear(cor, 0.6));
    }
  }
  // faixa de espuma dentro do vidro (topo irregular, pontilhada por baixo)
  function faixaEspuma(c, x0, y, h, cor) {
    if (h <= 0) return;
    ret(c, x0, y + 1, XW, h - 1, cor);
    for (var i = 0; i < XW; i++) {
      if (sorte(i, 2, 4) > 0.35) ret(c, x0 + i, y, 1, 1, cor);
      if ((i + y) % 2 === 0) ret(c, x0 + i, y + h - 1, 1, 1, escurecer(cor, 0.12));
      if (sorte(i, 5, 6) < 0.15) ret(c, x0 + i, y + 1, 1, 1, BRANCO);
    }
  }
  // brilhinhos que piscam em volta do béquer (parados no quadro final)
  var BRILHOS = [[52, 40, 1], [106, 36, 1], [48, 60, 0], [110, 58, 0], [80, 22, 0]];
  function brilhos(ctx, t, fim, dur, quantos) {
    BRILHOS.slice(0, quantos || 5).forEach(function (b, i) {
      if (t >= dur || (t > fim + i * 120 && Math.floor((t + i * 90) / 150) % 3)) P.brilho(ctx, b[0], b[1], !!b[2], i % 2 ? C.rosa : C.ouro);
    });
  }

  /* ---------- explosão (POF!): borbulha, treme, clarão, jato de espuma, chuva de confete e a plaquinha ---------- */
  var LETRAS = { P: ['####.', '#...#', '####.', '#....', '#....'], O: ['.###.', '#...#', '#...#', '#...#', '.###.'],
    F: ['#####', '#....', '####.', '#....', '#....'], '!': ['#', '#', '#', '.', '#'] };
  function placa(ctx, x, y) {
    ret(ctx, x, y, 44, 16, K); ret(ctx, x + 1, y + 1, 42, 14, C.ouro);
    ret(ctx, x + 1, y + 1, 42, 1, C.ouro3); ret(ctx, x + 1, y + 14, 42, 1, C.ouro2);
    var cx = x + 3;
    'POF!'.split('').forEach(function (ch) {
      LETRAS[ch].forEach(function (lin, j) {
        for (var i = 0; i < lin.length; i++) if (lin[i] === '#') {
          ret(ctx, cx + i * 2 + 1, y + 3 + j * 2 + 1, 2, 2, K); ret(ctx, cx + i * 2, y + 3 + j * 2, 2, 2, C.vermelho);
        }
      });
      cx += LETRAS[ch][0].length * 2 + 2;
    });
  }
  var DOMO = [[66, 33, 4], [73, 31, 5], [80, 30, 6], [87, 31, 5], [94, 33, 4], [61, 37, 2], [99, 39, 2]];
  function confeteVoando(ctx, t, qtd, t0, x0, y0) {
    for (var k = 0; k < qtd; k++) {
      var sai = t0 + (k % 8) * 40;
      if (t < sai) continue;
      var vx = (sorte(k, 2, 1) - 0.5) * 110, vy = -(40 + sorte(k, 3, 1) * 60), g = 150;
      var yChao = MESA + 1 + Math.floor(sorte(k, 4, 1) * 7), xi = x0 + (sorte(k, 5, 1) - 0.5) * 12;
      var tau = (t - sai) / 1000, tChao = (-vy + Math.sqrt(vy * vy + 2 * g * (yChao - y0))) / g;
      tau = Math.min(tau, tChao);
      var x = Math.max(1, Math.min(P.W - 3, xi + vx * tau)), y = Math.min(yChao, y0 + vy * tau + g * tau * tau / 2);
      P.confete(ctx, x, y, k);
    }
  }
  P.EFEITOS.explosao = { dur: 3800, som: 'rachar', sons: [[MISTURA, 'bolhas'], [1400, 'bolhas'], [2000, 'rachar'], [2150, 'splash']],
    desenhar: function (ctx, t, info) {
      var rec = info.rec || {}, cor = rec.cor || info.media, esp = rec.cor2 || clarear(cor, 0.5), dur = this.dur;
      if (t < MISTURA) { misturando(ctx, t, info, cor); return; }
      var dx = t >= 1500 && t < 2000 ? [0, 2, 0, -2][Math.floor(t / 50) % 4] : 0;
      var nivel = Math.min(BEQ.fundo - BOCA - 2, info.nivel + Math.round(degrau(fase(t, MISTURA, 2000), 4) * 6));
      var banda = Math.round(degrau(fase(t, MISTURA, 2000), 4) * 8);
      P.bequer(ctx, function (c, x0) {
        P.liquido(c, x0, topoDe(nivel), XW, nivel, cor);
        faixaEspuma(c, x0, topoDe(nivel) - (t >= 2000 ? 10 : 0), banda + (t >= 2000 ? 10 : 0), esp);
        if (t < 2000) borbulhas(c, x0, topoDe(nivel), t, cor, 8);
      }, dx);
      if (t >= 2000 && t < 3200) {   // o jato sobe até o alto e desce de volta
        var sobe = degrau(fase(t, 2000, 2400), 5), desce = degrau(fase(t, 2700, 3200), 4);
        var alto = Math.round(BOCA - 2 - (BOCA - 4) * sobe * (1 - desce));
        var col = [];
        for (var y = BOCA; y >= alto; y -= 3) {   // o jato: grosso embaixo, com bolas dos lados e uma cabeça redonda
          var x = MEIO + Math.round((sorte(y, 1, 2) - 0.5) * 4), r = Math.max(4, 7 - Math.floor((BOCA - y) / 10));
          col.push([x, y, r], [x - 4, y + 1, r - 2], [x + 4, y + 1, r - 2]);
        }
        col.push([MEIO - 3, alto, 6], [MEIO + 4, alto + 1, 5]);
        P.espuma(ctx, col.concat(DOMO.slice(1, 4)), esp);
      }
      if (t >= 2600) P.espuma(ctx, DOMO, esp);
      if (t >= 2000 && t < 2400) {   // clarão em anel de pixels
        var r = 8 + Math.floor(fase(t, 2000, 2400) * 4) * 8;
        for (var i = 0; i < 20; i++) {
          var a = i * Math.PI / 10;
          ret(ctx, Math.round(MEIO + Math.cos(a) * r), Math.round(28 + Math.sin(a) * r * 0.75), 2, 2, i % 2 ? C.ouro : BRANCO);
        }
      }
      if (t >= 2400) {   // fumaça pontilhada subindo e sumindo
        var f = Math.floor((t - 2400) / 120);
        P.fumaca(ctx, 64 - Math.floor(f / 3), 24 - f, 4, t < 3100 ? 2 : 1);
        if (t < 3400) P.fumaca(ctx, 98 + Math.floor(f / 4), 22 - f, 3, t < 2900 ? 2 : 1);
      }
      confeteVoando(ctx, t, 40, 2100, MEIO, 14);
      if (t >= 2500) placa(ctx, 108, 6 - (3 - Math.min(3, Math.floor((t - 2500) / 60))) * 6);
      if (t >= 3000) brilhos(ctx, t, 3000, dur, 2);
      if (t >= 2000 && t < 2060) { ctx.fillStyle = 'rgba(255,248,224,0.6)'; ctx.fillRect(0, 0, P.W, P.H); }
    } };

  /* ---------- vulcão: a espuma sobe, transborda e escorre pelo vidro até a mesa ---------- */
  var ESCORRE = [[57, 0, 44], [102, 0, 44], [68, 1, 16], [91, 1, 22]];   // x, na frente do vidro?, comprimento
  P.EFEITOS.vulcao = { dur: 3400, som: 'bolhas', sons: [[MISTURA, 'bolhas'], [1400, 'bolhas'], [2200, 'splash']],
    desenhar: function (ctx, t, info) {
      var rec = info.rec || {}, esp = rec.cor || info.media, liq = rec.cor2 || escurecer(esp, 0.15);
      if (t < MISTURA) { misturando(ctx, t, info, liq); return; }
      var espaco = topoDe(info.nivel) - (BOCA + 1), banda = Math.round(degrau(fase(t, MISTURA, 1400), 4) * espaco);
      function escorrer(frente) {
        ESCORRE.forEach(function (e, i) {
          if (e[1] !== frente || t < 2200) return;
          var h = Math.round(degrau(fase(t, 2200 + i * 150, 3000 + i * 150), 6) * e[2]);
          if (h < 2) return;
          var gotas = [];   // a espuma escorrendo: bolinhas encostadas, mais gordas na ponta
          for (var y = BOCA; y < BOCA + h; y += 3) gotas.push([e[0] + ESPERA[(y >> 2) % 6], y, 2]);
          gotas.push([e[0], BOCA + h, 3]);
          P.espuma(ctx, gotas, esp);
        });
      }
      escorrer(0);
      if (t >= 3000) {   // poças na mesa
        var rx = 3 + Math.round(degrau(fase(t, 3000, 3400), 3) * 5);
        P.espuma(ctx, [[54 - rx, 80, 2], [55, 79, 3], [104, 79, 3], [105 + rx, 80, 2]], esp);
      }
      P.bequer(ctx, function (c, x0) {
        P.liquido(c, x0, topoDe(info.nivel), XW, info.nivel, liq);
        faixaEspuma(c, x0, topoDe(info.nivel) - banda, banda, esp);
        borbulhas(c, x0, topoDe(info.nivel), t, liq, 6);
      });
      if (t >= 1400) {
        var sobe = Math.round(degrau(fase(t, 1400, 2200), 3) * 6);
        P.espuma(ctx, DOMO.slice(0, 5).map(function (b) { return [b[0], b[1] + 6 - sobe, b[2]]; }).concat(t >= 2200 ? DOMO.slice(5) : []), esp);
      }
      escorrer(1);
    } };

  /* ---------- cor: o líquido troca de cor em degraus, com brilhinhos ---------- */
  P.EFEITOS.cor = { dur: 2600, som: 'estrela', sons: [[MISTURA, 'estrela'], [1800, 'estrela']],
    desenhar: function (ctx, t, info) {
      var rec = info.rec || {}, ini = info.media, fim = rec.cor || ini;
      if (t < MISTURA) { misturando(ctx, t, info, ini); return; }
      var s = degrau(fase(t, MISTURA, 1800), 4), cor = D.misturar(ini, fim, s);
      P.bequer(ctx, function (c, x0) {
        var topo = topoDe(info.nivel);
        P.liquido(c, x0, topo, XW, info.nivel, cor);
        if (rec.cor2 && t >= 1800) P.liquido(c, x0, topo, XW, 3, rec.cor2);
        for (var k = 0; k < 8; k++) {   // cintilado dentro do líquido
          if (t < 1800 && (Math.floor(t / 100) + k) % 3) continue;
          if (t >= 1800 && k > 2) continue;
          ret(c, x0 + 3 + Math.floor(sorte(k, 3, 8) * (XW - 6)), topo + 3 + Math.floor(sorte(k, 4, 8) * (info.nivel - 5)), 1, 1, BRANCO);
        }
      });
      brilhos(ctx, t, 1800, this.dur);
    } };

  /* ---------- espuma gigante: uma coluna listrada sobe do béquer até o alto e escorre para a mesa ---------- */
  P.EFEITOS['espuma-gigante'] = { dur: 3600, som: 'bolhas', sons: [[MISTURA, 'bolhas'], [1200, 'chuveiro'], [2600, 'splash']],
    desenhar: function (ctx, t, info) {
      var rec = info.rec || {}, esp = rec.cor || info.media, lista = rec.cor2 || clarear(esp, 0.5), liq = D.misturar(info.media, esp, 0.5);
      if (t < MISTURA) { misturando(ctx, t, info, liq); return; }
      var espaco = topoDe(info.nivel) - (BOCA + 1), banda = Math.round(degrau(fase(t, MISTURA, 1200), 3) * espaco);
      if (t >= 2600) {   // montinhos na mesa
        var r = 2 + Math.round(degrau(fase(t, 2600, 3400), 3) * 4);
        P.espuma(ctx, [[50, 79 - r + 2, r], [44, 80, Math.max(1, r - 2)], [110, 79 - r + 2, r], [116, 80, Math.max(1, r - 2)]], esp);
      }
      P.bequer(ctx, function (c, x0) {
        P.liquido(c, x0, topoDe(info.nivel), XW, info.nivel, liq);
        faixaEspuma(c, x0, topoDe(info.nivel) - banda, banda, esp);
        borbulhas(c, x0, topoDe(info.nivel), t, liq, 10);
      });
      if (t < 1200) return;
      var alto = BOCA - 3 * Math.round(degrau(fase(t, 1200, 2600), 8) * (BOCA + 8) / 3), col = [];
      for (var y = BOCA + 2; y >= alto; y -= 4) {
        var larg = 5 + Math.floor((BOCA - y) / 14), bal = t >= this.dur ? 0 : ESPERA[(Math.floor(t / 120) + y) % 6];
        var x = MEIO + bal + Math.round((sorte(y, 3, 2) - 0.5) * 2);
        col.push([x - larg, y, larg], [x + larg, y, larg], [x, y - 2, larg + 1]);
      }
      P.espuma(ctx, col, esp);
      ctx.save(); ctx.beginPath();   // listras que sobem com a coluna
      for (var yy = alto - 8; yy < BOCA + 8; yy += 12) ctx.rect(0, yy, P.W, 5);
      ctx.clip(); P.espuma(ctx, col, lista, true); ctx.restore();
    } };

  /* ---------- dissolver: os grãos somem na água, com um brilho ---------- */
  P.EFEITOS.dissolver = { dur: 2800, som: 'estrela', sons: [[0, 'gotas'], [MISTURA, 'bolhas'], [2300, 'estrela']],
    desenhar: function (ctx, t, info) {
      var rec = info.rec || {}, agua = info.corDe('agua') || info.media, fim = rec.cor || agua;
      var cor = D.misturar(agua, fim, degrau(fase(t, 500, 2300), 3));
      P.bequer(ctx, function (c, x0) {
        var topo = topoDe(info.nivel);
        P.liquido(c, x0, topo, XW, info.nivel, cor);
        for (var k = 0; k < 26; k++) {
          var some = 500 + sorte(k, 7, 3) * 1800, x = x0 + 2 + Math.floor(sorte(k, 8, 3) * (XW - 4));
          var yFim = FUNDO - Math.floor(sorte(k, 9, 3) * 4), y = Math.round(topo + 2 + (yFim - topo - 2) * degrau(fase(t, 0, 500), 5));
          if (t < some) ret(c, x, y, k % 2 ? 2 : 1, 1, k % 3 ? BRANCO : C.creme2);
          else if (t < some + 120) D.brilho(c, x, y - 1, BRANCO);
        }
        if (t >= 2300) [[10, 6], [22, 12], [30, 4]].forEach(function (p, i) {
          if (t >= this.dur || Math.floor(t / 150 + i) % 2) ret(c, x0 + p[0], topo + p[1], 1, 1, BRANCO);
        }, this);
      }.bind(this));
      brilhos(ctx, t, 2300, this.dur, 3);
    } };

  /* ---------- camadas: água e óleo se separam; o óleo boia ---------- */
  function aguaOleo(info) {
    var rec = info.rec || {};
    return { agua: info.corDe('agua') || rec.cor || info.media, oleo: info.corDe('oleo') || rec.cor2 || C.ouro };
  }
  P.EFEITOS.camadas = { dur: 2600, som: 'gole', sons: [[0, 'gole'], [400, 'bolhas']],
    desenhar: function (ctx, t, info) {
      var c2 = aguaOleo(info), L = info.nivel, hO = Math.round(L / 2), topo = topoDe(L);
      var sep = degrau(fase(t, 400, 2200), 5), oleoH = Math.round(sep * hO);
      P.bequer(ctx, function (c, x0) {
        P.liquido(c, x0, topo + oleoH, XW, L - oleoH, c2.agua);
        if (sep < 1) {   // a mistura sacudida: blocos de 2×2 de óleo que ainda não subiram
          for (var y = topo + oleoH; y <= FUNDO; y += 2) for (var x = 0; x < XW; x += 2) {
            if (sorte(x, y + Math.floor(t / 80), 3) < 0.5 * (1 - sep)) ret(c, x0 + x, y, 2, 2, c2.oleo);
          }
        }
        if (oleoH > 0) P.liquido(c, x0, topo, XW, oleoH, c2.oleo);
        if (t >= 2200) { ret(c, x0 + 6, topo + 2, 4, 1, BRANCO); ret(c, x0 + 12, topo + 2, 1, 1, BRANCO); }
      });
    } };

  /* ---------- gotas: gotas azuis descem devagar pelo óleo e viram fios de cor na água ---------- */
  var GOTAS = [[600, 14], [1100, 14], [1600, 14], [2100, 14], [2600, 8], [3000, 8]];   // quando cai, velocidade (px/s)
  P.EFEITOS.gotas = { dur: 3600, som: 'gotas', sons: [[600, 'gotas'], [1100, 'gotas'], [1600, 'gotas'], [2600, 'gotas']],
    desenhar: function (ctx, t, info) {
      var c2 = aguaOleo(info), gota = info.corDe('corante') || (info.rec || {}).cor || C.azul;
      var L = info.nivel, hO = Math.min(14, Math.round(L * 0.4)), topo = topoDe(L), yI = topo + hO;
      var feitas = GOTAS.filter(function (g) { return t >= g[0] + (hO / g[1]) * 1000; }).length;
      P.bequer(ctx, function (c, x0) {
        P.liquido(c, x0, yI, XW, L - hO, D.misturar(c2.agua, gota, degrau(feitas / GOTAS.length, 3) * 0.35));
        P.liquido(c, x0, topo, XW, hO, c2.oleo);
        if (t < 500) for (var y = topo + 2; y < yI; y += 2) for (var x = 0; x < XW; x += 2) {   // o óleo acabando de subir
          if (sorte(x, y, 6) < 0.4) ret(c, x0 + x, y, 2, 2, c2.agua);
        }
        GOTAS.forEach(function (g, k) {
          if (t < g[0]) return;
          var x = x0 + 6 + (k * 11) % 28, desce = (t - g[0]) / 1000 * g[1];
          if (desce < hO) {   // a gota ainda no óleo
            var y = topo + 1 + Math.floor(desce);
            ret(c, x, y, 1, 1, gota); ret(c, x - 1, y + 1, 3, 2, gota); ret(c, x, y + 3, 1, 1, gota); ret(c, x - 1, y + 1, 1, 1, clarear(gota, 0.5));
            return;
          }
          var tf = (t - g[0]) - (hO / g[1]) * 1000, len = Math.round(degrau(Math.min(1, tf / 1200), 6) * (FUNDO - yI - 1));
          for (var yy = 0; yy <= len; yy++) {   // o fio de cor, balançando em degraus
            var xx = x + ESPERA[(Math.floor(yy / 2) + k) % 6];
            ret(c, xx, yI + 1 + yy, yy < 4 ? 2 : 1, 1, yy % 3 ? gota : clarear(gota, 0.35));
          }
        });
      });
    } };

  /* ---------- redemoinho: no leite, a gota de detergente faz as cores fugirem em espiral ---------- */
  P.EFEITOS.redemoinho = { dur: 3200, som: 'bolhas', sons: [[600, 'gotas'], [900, 'bolhas']],
    desenhar: function (ctx, t, info) {
      var leite = info.corDe('leite') || C.creme, det = info.corDe('detergente') || C.verde;
      var cor = info.corDe('corante') || (info.rec || {}).cor || C.azul;
      var cores = [cor, clarear(cor, 0.4), det];
      var L = info.nivel, cy = topoDe(L) + Math.floor(L / 2), cresce = 0.2 + 0.8 * degrau(fase(t, 900, 3000), 7);
      var gira = Math.floor(Math.min(t, 3000) / 100) * 0.22;
      P.bequer(ctx, function (c, x0) {
        P.liquido(c, x0, topoDe(L), XW, L, leite);
        for (var a = 0; a < 3; a++) for (var j = 0; j < 22; j++) {   // 3 braços de espiral, grossos no meio
          var r = 1 + j * 0.8 * cresce, th = a * 2.094 + j * 0.28 + (t >= 900 ? gira : 0);
          ret(c, Math.round(MEIO + Math.cos(th) * r * 1.6), Math.round(cy + Math.sin(th) * Math.min(r * 0.6, L / 2 - 3)), j < 10 ? 2 : 1, j < 14 ? 2 : 1, cores[a]);
        }
      });
      if (t >= 600 && t < 900) {   // a gota de detergente caindo
        var y = BOCA - 6 + Math.round(degrau(fase(t, 600, 900), 4) * (cy - BOCA + 4));
        ret(ctx, MEIO, y, 1, 1, det); ret(ctx, MEIO - 1, y + 1, 3, 2, det); ret(ctx, MEIO, y + 3, 1, 1, det);
      }
    } };

  /* ---------- bolhas: bolhas de sabão sobem e flutuam para fora ---------- */
  var ANEIS = [C.azul, C.lilas, C.rosa];
  P.EFEITOS.bolhas = { dur: 3600, som: 'bolhas', sons: [[MISTURA, 'bolhas'], [1500, 'bolhas'], [2400, 'bolhas']],
    desenhar: function (ctx, t, info) {
      var rec = info.rec || {}, cor = rec.cor || info.media;
      if (t < MISTURA) { misturando(ctx, t, info, cor); return; }
      var topo = topoDe(info.nivel), dur = this.dur;
      P.bequer(ctx, function (c, x0) {
        P.liquido(c, x0, topo, XW, info.nivel, cor);
        faixaEspuma(c, x0, topo - 3, 4, rec.cor2 || BRANCO);
      });
      for (var k = 0; k < 9; k++) {
        var sai = MISTURA + k * 300;
        if (t < sai) continue;
        var tau = (t - sai) / 1000, v = 18 + sorte(k, 2, 7) * 10, r = 3 + Math.floor(sorte(k, 3, 7) * 3);
        var y = Math.round(topo - 4 - tau * v), x = 66 + Math.floor(sorte(k, 4, 7) * 28) + ESPERA[(Math.floor(tau * 5) + k) % 6] * (t >= dur ? 0 : 1) + Math.round((sorte(k, 5, 7) - 0.5) * tau * 20);
        if (y + r < 0) continue;
        P.bolha(ctx, x, y, r, ANEIS[k % 3]);
      }
    } };

  /* ---------- nada (mistura sem receita): mistura, duas bolhinhas e fica assim ---------- */
  P.EFEITOS.nada = { dur: 1400, som: 'bolhas', sons: [[700, 'bolhas']],
    desenhar: function (ctx, t, info) {
      if (t < MISTURA) { misturando(ctx, t, info, info.media); return; }
      var topo = topoDe(info.nivel);
      P.bequer(ctx, function (c, x0) {
        P.liquido(c, x0, topo, XW, info.nivel, info.media);
        var sobe = degrau(fase(t, MISTURA, 1300), 4);
        [[x0 + 12, 1], [x0 + 24, 0]].forEach(function (b, i) {
          var y = Math.round(FUNDO - 3 - (FUNDO - 3 - topo) * Math.min(1, sobe + i * 0.25));
          if (y > topo + 1) ret(c, b[0], y, 2, 2, clarear(info.media, 0.6));
          else P.bolha(c, b[0], topo, 2 - b[1], clarear(info.media, 0.5));
        });
      });
    } };
})();
