/* Planetas (viagem de foguete), o que todos dividem: o céu aberto em volta (fundo 'espaco'), o chão e o horizonte
   de cada planeta e o foguete de pouso ('planeta-foguete'). Os planetas são interiores do Observatório (lugar
   'observatorio', sem entrada), alcançados só pelo foguete do Hangar (ação `viagem`; docs/contratos/viagem.md).
   Horizonte: a paleta do cômodo escolhe as cores dos morros e, com `terra: <coluna>`, a Terra no céu.
   O que as partes dos planetas dividem fica em Reino._predios.planetas (P.estrelas, P.terra, P.tempo, P.animando).
   No carregamento só registra funções: nada de DOM, canvas nem PA aqui fora. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, triangulo = D.triangulo;
  var K = R.Desenho.K;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var CEU = '#0b0820';
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  // tempo das animações: parado (t = 0) com "reduzir movimento" do aparelho
  function tempo(t) { return (R.util && R.util.reduzMovimentoSistema) ? 0 : (t || 0); }
  // o mesmo critério do motor para passar t (motor/laco.js)
  function animando() {
    try {
      var e = R.Progresso && R.Progresso.estado && R.Progresso.estado();
      return !!(e && e.ajustes && e.ajustes.animacoes) && !(R.util && R.util.reduzMovimentoSistema);
    } catch (err) { return false; }
  }

  // estrelas de brilhos diferentes num retângulo (sorteio com semente: sai sempre igual)
  function estrelas(ctx, x, y, w, h, densidade, semente) {
    var rng = R.Desenho.rng(semente);
    var n = Math.round((w * h) / densidade);
    for (var i = 0; i < n; i++) {
      var sx = x + Math.floor(rng() * w), sy = y + Math.floor(rng() * h), r = rng();
      if (r < 0.06) {   // estrela grande em cruz
        ret(ctx, sx, sy - 1, 1, 3, '#fff6c8'); ret(ctx, sx - 1, sy, 3, 1, '#fff6c8'); ret(ctx, sx, sy, 1, 1, '#ffffff');
      } else if (r < 0.25) ret(ctx, sx, sy, 1, 1, rng() < 0.5 ? '#b8c0ff' : '#fff3a0');
      else if (r < 0.6) ret(ctx, sx, sy, 1, 1, '#ffffff');
      else ret(ctx, sx, sy, 1, 1, '#5a5a8a');
    }
  }
  // nuvem da nebulosa em pontilhado (Bayer): mais densa no meio, some nas bordas
  function nebulosa(ctx, cx, cy, rx, ry, cor, forca) {
    for (var y = Math.floor(cy - ry); y < cy + ry; y += 2) for (var x = Math.floor(cx - rx); x < cx + rx; x += 2) {
      var dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy;
      if (d >= 1) continue;
      if ((1 - d) * forca > (BAYER[((y >> 1) & 3) * 4 + ((x >> 1) & 3)] + 0.5) / 16) ret(ctx, x, y, 2, 2, cor);
    }
  }

  // céu preto com uma nebulosa suave e estrelas (pintado uma vez, na camada parada)
  I.FUNDOS.espaco = { cor: CEU, desenhar: function (ctx, w, h) {
    var rng = R.Desenho.rng(11);
    nebulosa(ctx, w * (0.2 + rng() * 0.2), h * 0.3, w * 0.35, h * 0.3, '#1c1448', 0.8);
    nebulosa(ctx, w * 0.75, h * 0.7, w * 0.3, h * 0.25, '#1a1a52', 0.7);
    nebulosa(ctx, w * 0.3, h * 0.3, w * 0.18, h * 0.14, '#2c1a5c', 0.6);
    estrelas(ctx, 0, 0, w, h, 260, 7);
  } };

  // chão da Lua: rocha cinza clara com manchas, crateras pequenas e poeira (contraste com a Mariana ≥ 2,9)
  var sorte = R.Desenho.sorte;
  I.PISOS['lua-rocha'] = { cores: { piso: '#cfcfdc', piso2: '#c2c2d2', detalhe: '#a2a2b8', luz: '#e4e4ee' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      // manchas suaves (sem xadrez)
      var s = sorte(tx, ty, 1);
      if (s < 0.5) ret(ctx, px + Math.floor(s * 16), py + 3, 7, 5, p.piso2);
      if (sorte(tx, ty, 2) < 0.4) ret(ctx, px + 2, py + 9 + Math.floor(sorte(tx, ty, 3) * 4), 9, 4, p.piso2);
      // cratera pequena: borda escura em cima, clara embaixo
      if (sorte(tx, ty, 4) < 0.22) {
        var cx = px + 4 + Math.floor(sorte(tx, ty, 5) * 8), cy = py + 4 + Math.floor(sorte(tx, ty, 6) * 7);
        ret(ctx, cx - 2, cy - 1, 5, 3, p.piso2); ret(ctx, cx - 2, cy - 2, 5, 1, p.detalhe); ret(ctx, cx - 3, cy - 1, 1, 2, p.detalhe);
        ret(ctx, cx - 2, cy + 2, 5, 1, p.luz); ret(ctx, cx + 3, cy, 1, 2, p.luz);
      }
      // poeira e pedrinhas
      for (var i = 0; i < 3; i++) {
        var r = sorte(tx, ty, 10 + i);
        ret(ctx, px + Math.floor(r * 15), py + Math.floor(sorte(tx, ty, 20 + i) * 15), 1, 1, r < 0.5 ? p.detalhe : p.luz);
      }
    } };

  // a Terra vista de longe: azul com continentes verdes, nuvens e o lado da noite
  function terra(ctx, cx, cy, r) {
    circulo(ctx, cx, cy, r + 2, 'rgba(111,182,255,0.25)');
    circulo(ctx, cx, cy, r + 1, K);
    circulo(ctx, cx, cy, r, '#2f6fd6');
    circulo(ctx, cx - 1, cy - 1, r - 2, '#4a8ef0');
    ret(ctx, cx - r + 3, cy - 4, 5, 4, '#4fb85e'); ret(ctx, cx - r + 4, cy, 3, 4, '#4fb85e');
    ret(ctx, cx + 1, cy - 5, 4, 3, '#4fb85e'); ret(ctx, cx + 2, cy - 2, 3, 5, '#3f9a4e'); ret(ctx, cx - 2, cy + 4, 3, 2, '#4fb85e');
    ret(ctx, cx - 5, cy - r + 2, 6, 1, '#ffffff'); ret(ctx, cx + 1, cy + 1, 5, 1, '#ffffff'); ret(ctx, cx - 6, cy + 3, 4, 1, '#eaf4ff');
    // lado da noite (direita)
    for (var y = -r; y <= r; y++) {
      var m = Math.floor(Math.sqrt(r * r - y * y));
      if (m > 2) ret(ctx, cx + m - 2, cy + y, 2, 1, 'rgba(10,16,60,0.45)');
    }
    ret(ctx, cx - 3, cy - r + 3, 1, 1, '#ffffff');
  }

  // horizonte: o céu e os morros do planeta ao longe (as 2 fileiras de "parede" do cômodo)
  I.PAREDES['planeta-horizonte'] = { cores: { parede: CEU, parede2: '#8a8aa0', rodape: '#b8b8c8', detalhe: '#6a6a82' },
    desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      estrelas(ctx, px, py, 16, 20, 60, 100 + tx);
      // a Terra (ou outro astro) no céu, recortada por coluna
      if (typeof p.terra === 'number' && Math.abs(tx - p.terra) <= 1) {
        ctx.save(); ctx.beginPath(); ctx.rect(px, py, 16, 32); ctx.clip();
        terra(ctx, p.terra * 16 + 8, py + 11, 9);
        ctx.restore();
      }
      // morros ao longe: duas camadas de silhueta
      var a = 22 + Math.round(Math.sin(tx * 0.9) * 2 + Math.sin(tx * 0.37) * 3);
      for (var i = 0; i < 16; i++) {
        var h1 = a + Math.round(Math.sin((tx * 16 + i) / 9) * 2);
        ret(ctx, px + i, py + h1, 1, 32 - h1, p.detalhe);
        var h2 = 26 + Math.round(Math.sin((tx * 16 + i) / 5) * 1.5);
        ret(ctx, px + i, py + h2, 1, 32 - h2, p.parede2);
      }
      ret(ctx, px, py + 30, 16, 2, p.rodape);
    } };

  /* ---------- o foguete de pouso (volta para casa), branco e vermelho, 2 tiles ---------- */
  var F = { branco: '#f4f6fb', cinza: '#c8d0e0', cinza2: '#9aa4bc', vermelho: '#e0433f', vermelho2: '#a82a2a', vidro: '#6fd6ff' };
  I.objeto('planeta-foguete', { w: 2, h: 2, topo: 70, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16, base = py + 26;
      // sombra e pés de pouso
      ret(ctx, px + 2, base + 2, 28, 3, 'rgba(40,40,70,0.25)');
      ret(ctx, cx - 14, base - 16, 2, 16, K); ret(ctx, cx + 12, base - 16, 2, 16, K);
      ret(ctx, cx - 16, base - 1, 6, 2, K); ret(ctx, cx + 10, base - 1, 6, 2, K);
      // aletas
      ret(ctx, cx - 13, base - 24, 7, 20, K); ret(ctx, cx - 12, base - 22, 5, 17, F.vermelho);
      ret(ctx, cx + 6, base - 24, 7, 20, K); ret(ctx, cx + 7, base - 22, 5, 17, F.vermelho);
      // corpo
      ret(ctx, cx - 8, base - 78, 16, 76, K); ret(ctx, cx - 7, base - 77, 14, 74, F.branco);
      ret(ctx, cx + 3, base - 77, 4, 74, F.cinza); ret(ctx, cx - 7, base - 77, 2, 74, '#ffffff');
      ret(ctx, cx - 7, base - 14, 14, 4, F.vermelho); ret(ctx, cx - 7, base - 40, 14, 2, F.vermelho);
      ret(ctx, cx - 7, base - 60, 14, 1, F.cinza2);
      // escadinha
      for (var e = 0; e < 5; e++) ret(ctx, cx - 3, base - 4 - e * 5, 6, 1, F.cinza2);
      // bico
      triangulo(ctx, cx - 9, base - 100, 18, 23, K); triangulo(ctx, cx - 7, base - 97, 14, 19, F.vermelho);
      ret(ctx, cx - 3, base - 88, 1, 7, '#ff8a94');
      // janela
      circulo(ctx, cx, base - 66, 5, K); circulo(ctx, cx, base - 66, 4, F.vidro); ret(ctx, cx - 2, base - 68, 2, 1, '#ffffff');
      // estrela do Reino
      ret(ctx, cx - 1, base - 52, 2, 6, '#ffd34d'); ret(ctx, cx - 3, base - 50, 6, 2, '#ffd34d');
      // bocal
      ret(ctx, cx - 5, base - 3, 10, 4, K); ret(ctx, cx - 4, base - 2, 8, 2, F.cinza2);
    } });

  P.estrelas = estrelas; P.terra = terra; P.tempo = tempo; P.animando = animando; P.nebulosa = nebulosa;

  /* ================= ETs DOS PLANETAS ================= */
  // o ET reservado (observatorio/reservas.js) no interior do planeta: nome, sprite e voz do elenco, falas do prédio
  // (observatorio/personagens-falas.js); `acao` da reserva. Chamada no carregamento do planeta (o elenco já existe).
  P.npcsDoPlaneta = function (interior) {
    var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {}, S = R._predios.observatorio, f = (S && S.falas().npcs) || {};
    return R.personagensDoPredio(interior).filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      var e = ELENCO[p.id] || {};
      var n = { id: p.id, nome: e.nome || p.id, sprite: e.sprite || { base: 'pessoa' }, voz: e.voz || 'npc-' + p.id,
        x: p.x, y: p.y, falas: f[p.id] || {} };
      if (p.acao) n.acao = p.acao;
      return n;
    });
  };
})();
