/* A Teleportadora (docs/contratos/vila.md §6): unicórnio adulto alado, branco-perolado com crina arco-íris, de lado
   olhando para a esquerda, dentro de uma AURA arco-íris: faixas de cor que seguem a silhueta dela (1 e 2 px cheias,
   a 3ª em xadrez, a 4ª em pontinhos só no pulso) e um anel de luz no chão. Animada, as cores andam para fora
   (onda) e a aura pulsa (3 ↔ 4 px); brilhinhos sobem em volta. Parada: a aura de 3 px, sem brilhinhos.
   Tudo pronto em cache (14 imagens LARG × ALT, uma por fase, feitas na 1ª vez): nada de canvas novo por quadro.
   node: true: nada de PA, canvas nem DOM no carregamento; tudo dentro das funções.
   Entrega Reino.TeleportadoraArte = { LARG, ALT, CX, BASE, PARADO, fase(t, animar), imagem(fase), parado(),
   pontos(fase), brilhos(ret, cx, base, t, animar), retrato() }.
   (cx, base) = o meio dela e a última fileira dos cascos, em px de arte; a imagem vai em (cx - CX, base - BASE). */
(function () {
  var R = window.Reino;
  var K = '#3a2446';
  var ARCO = ['#ff6b8b', '#ff9f43', '#ffe066', '#7ee081', '#5fc8ff', '#8f7cff', '#d98cff'];   // vermelho a violeta
  var LARG = 48, ALT = 46, CX = 24, BASE = 39;
  var PASSO = 200;              // ms por passo da onda de cores (7 passos = 1,4 s; arte.md §15.3)
  var PULSO = 3;                // passos em cada metade do pulso (6 × 200 = 1,2 s = 2 × --lento)
  var PARADO = 7;               // fase da imagem parada: cores na posição 0, aura de 3 px
  var DEF = { id: 'teleportadora', raridade: 'lendario',
    cores: { corpo: '#fbf6ff', crina: ['#ff7eb6', '#ffd34d', '#5fb4ff'], chifre: '#ffe066', asa: '#e2d2ff', casco: '#e8a92e' } };
  var ENFEITES = ['tiara-estrelas'];

  /* ----- a unicórnio, olhando para a esquerda (o molde olha para a direita) ----- */
  var uni = null;   // { canvas, x, y, mascara: Uint8Array LARG × ALT }
  function unicornio() {
    if (uni) return uni;
    var PA = window.PA, s = PA.unicornio(DEF, 3, 0, { enfeites: ENFEITES, vista: 'lado' });
    var c = PA.espelhado(s.canvas || s), x = CX - Math.floor(c.width / 2), y = BASE + 1 - c.height;
    var m = PA.novoCanvas(LARG, ALT), mx = m.getContext('2d');
    mx.drawImage(c, x, y);
    var d = mx.getImageData(0, 0, LARG, ALT).data, mascara = new Uint8Array(LARG * ALT);
    for (var i = 0; i < LARG * ALT; i++) mascara[i] = d[i * 4 + 3] > 0 ? 1 : 0;
    uni = { canvas: c, x: x, y: y, mascara: mascara };
    return uni;
  }
  // distância (quadrada, até 4) de cada pixel à silhueta; 0 = dentro dela ou longe demais
  var dist = null;
  function distancias() {
    if (dist) return dist;
    var mk = unicornio().mascara;
    dist = new Uint8Array(LARG * ALT);
    for (var y = 0; y < ALT; y++) for (var x = 0; x < LARG; x++) {
      if (mk[y * LARG + x]) continue;
      var dd = 9;
      for (var dy = -4; dy <= 4 && dd > 1; dy++) for (var dx = -4; dx <= 4; dx++) {
        var xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= LARG || yy >= ALT || !mk[yy * LARG + xx]) continue;
        dd = Math.min(dd, Math.max(Math.abs(dx), Math.abs(dy)));
      }
      if (dd <= 4 && y <= BASE) dist[y * LARG + x] = dd;
    }
    return dist;
  }

  /* ----- uma fase: onda (0..6) e pulso (0 = 3 px, 1 = 4 px) ----- */
  function partes(f) { return { onda: f % 7, pulso: f < 7 ? 1 : 0 }; }
  function cor(i) { return ARCO[((i % 7) + 7) % 7]; }
  // a cor de um pixel da aura: o arco-íris em 7 fatias pelo ângulo em volta do meio dela (vermelho em cima), cada
  // faixa (distância) meia fatia adiante (as cores se trançam), girando com a onda
  var MEIO_Y = BASE - 11;
  function pixelAura(x, y, d, onda, pulso) {
    if (d === 3 && (x + y) % 2) return null;
    if (d === 4 && (!pulso || x % 2 || y % 2)) return null;
    var ang = Math.atan2(x - CX, MEIO_Y - y) / (2 * Math.PI) + 1;   // 0 em cima, crescendo no sentido do relógio
    return cor(Math.floor(ang * 7 + d * 0.5) - onda);
  }
  // o anel do chão: elipse de 1 px (rx 15, ry 3) com as cores pelo ângulo, girando com a onda
  function anelChao(r, cx, base, onda) {
    var rx = 17, ry = 4, cy = base + 1;
    // a luz no miolo do anel (véu claro, 2 degraus)
    for (var j = -ry + 1; j < ry; j++) {
      var m = Math.round((rx - 1) * Math.sqrt(1 - (j * j) / (ry * ry)));
      r(cx - m, cy + j, m * 2 + 1, 1, 'rgba(255,244,251,0.35)');
      if (Math.abs(j) < 2) r(cx - m + 4, cy + j, m * 2 - 7, 1, 'rgba(255,244,251,0.3)');
    }
    for (var x = -rx; x <= rx; x++) {
      var h = Math.round(ry * Math.sqrt(Math.max(0, 1 - (x * x) / (rx * rx))));
      [cy - h, cy + h].forEach(function (y) {
        var ang = Math.atan2((y - cy) / ry, x / rx), i = Math.floor((ang / (2 * Math.PI) + 1) * 7 + onda);
        r(cx + x, y, 1, 1, cor(i));
      });
    }
  }

  var imagens = [], pontosDe = [];
  function imagem(f) {
    if (imagens[f]) return imagens[f];
    var PA = window.PA, c = PA.novoCanvas(LARG, ALT), ctx = c.getContext('2d'), p = partes(f), dd = distancias(), u = unicornio();
    function r(x, y, w, h, cr) { ctx.fillStyle = cr; ctx.fillRect(x, y, w, h); }
    // sombra de chão (2 níveis), o anel de luz, a aura e ela por cima
    ctx.fillStyle = 'rgba(58,36,70,0.18)'; ctx.fillRect(CX - 12, BASE + 1, 25, 2); ctx.fillRect(CX - 14, BASE + 2, 29, 1);
    anelChao(r, CX, BASE, p.onda);
    for (var y = 0; y < ALT; y++) for (var x = 0; x < LARG; x++) {
      var d = dd[y * LARG + x];
      if (!d) continue;
      var cr = pixelAura(x, y, d, p.onda, p.pulso);
      if (cr) r(x, y, 1, 1, cr);
    }
    ctx.drawImage(u.canvas, u.x, u.y);
    imagens[f] = c;
    return c;
  }
  // o que muda da imagem parada para a da fase f: [[x, y, w, cor]] em fileiras (só pixels opacos; para desenhar
  // por cima da parada com fillRect, como a animação dos interiores faz). A parada está contida em todas.
  function pontos(f) {
    if (pontosDe[f]) return pontosDe[f];
    var a = imagem(PARADO).getContext('2d').getImageData(0, 0, LARG, ALT).data;
    var b = imagem(f).getContext('2d').getImageData(0, 0, LARG, ALT).data, lista = [];
    function hex(i) { return '#' + [b[i], b[i + 1], b[i + 2]].map(function (v) { return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
    for (var y = 0; y < ALT; y++) {
      var corrida = null;
      for (var x = 0; x <= LARG; x++) {
        var i = (y * LARG + x) * 4, muda = x < LARG && b[i + 3] === 255 && (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== 255);
        var cr = muda ? hex(i) : null;
        if (corrida && corrida[3] === cr) { corrida[2]++; continue; }
        if (corrida) lista.push(corrida);
        corrida = cr ? [x, y, 1, cr] : null;
      }
    }
    pontosDe[f] = lista;
    return lista;
  }
  function fase(t, animar) {
    if (!animar) return PARADO;
    var p = Math.floor(t / PASSO);
    return (p % 7) + (Math.floor(p / PULSO) % 2 ? 0 : 7);
  }

  /* ----- brilhinhos que sobem em volta dela (só animada) ----- */
  var BRILHOS = [[-17, 0], [15, 330], [-9, 760], [19, 1090], [-20, 1420], [7, 1750]];
  var SUBIDA = 2000;
  function brilhos(r, cx, base, t, animar) {
    if (!animar) return;
    BRILHOS.forEach(function (b, i) {
      var p = ((t + b[1]) % SUBIDA) / SUBIDA, x = cx + b[0] + (Math.floor(p * 6) % 2), y = base - 3 - Math.round(p * 34);
      var c = ARCO[(i * 2) % 7];
      if (p < 0.15 || p > 0.85) r(x, y, 1, 1, c);
      else if (p < 0.4 || p > 0.65) { r(x, y, 1, 1, '#ffffff'); r(x - 1, y, 1, 1, c); r(x + 1, y, 1, 1, c); r(x, y - 1, 1, 1, c); r(x, y + 1, 1, 1, c); }
      else { r(x - 2, y, 5, 1, c); r(x, y - 2, 1, 5, c); r(x - 1, y, 3, 1, '#ffffff'); r(x, y - 1, 1, 3, '#ffffff'); }
    });
  }

  /* ----- retrato do balão: o busto com a aura, 21 × 21 (o balão amplia a 4) ----- */
  var retratoFeito = null;
  function retrato() {
    if (retratoFeito) return retratoFeito;
    var u = unicornio(), c = window.PA.novoCanvas(21, 21), ctx = c.getContext('2d');
    // a cabeça fica à esquerda do sprite (ela olha para a esquerda): o quadro começa 3 px antes dela
    ctx.drawImage(imagem(PARADO), u.x - 3, Math.max(0, u.y - 3), 21, 21, 0, 0, 21, 21);
    c.personagem = true;
    retratoFeito = c;
    return c;
  }

  R.TeleportadoraArte = {
    LARG: LARG, ALT: ALT, CX: CX, BASE: BASE, PARADO: PARADO, DEF: DEF,
    fase: fase, imagem: imagem, parado: function () { return imagem(PARADO); }, pontos: pontos, brilhos: brilhos,
    retrato: retrato,
  };
})();
