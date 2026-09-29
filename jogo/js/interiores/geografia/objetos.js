/* Estação dos Caminhos (Geografia), objetos temáticos (prefixo geografia-): comunicação e trânsito.
   O que as outras partes usam fica em Reino._predios.geografia (ver o fim do arquivo). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K;
  var S = (R._predios = R._predios || {}).geografia = {};
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  var AZUL = '#2f8fd6', VERDE = '#39a860', VERM = '#e0433f', AMAR = '#ffd34d', CINZA = '#4a4a5a';

  // poste cinza com base (semáforo e placas)
  function poste(ctx, cx, py, alto) {
    ret(ctx, cx - 4, py + 12, 9, 3, K); ret(ctx, cx - 3, py + 12, 7, 2, C.metal2);
    ret(ctx, cx - 1, py + 12 - alto, 3, alto, K); ret(ctx, cx, py + 12 - alto, 1, alto - 1, C.metal);
  }

  // púlpito do Livro dos Caminhos: livro aberto com um mapinha e uma trilha tracejada
  I.objeto('geografia-pulpito', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 11, 11, 4, K); ret(ctx, cx - 4, py + 12, 9, 2, C.madeira2);
      ret(ctx, cx - 2, py - 3, 5, 15, K); ret(ctx, cx - 1, py - 3, 3, 14, C.madeira); ret(ctx, cx - 1, py - 3, 1, 14, C.madeiraClara);
      ret(ctx, cx - 7, py - 5, 15, 3, K); ret(ctx, cx - 6, py - 4, 13, 1, VERDE);
      ret(ctx, cx - 7, py - 12, 15, 8, K);
      ret(ctx, cx - 6, py - 11, 6, 6, '#9fcfff'); ret(ctx, cx + 1, py - 11, 6, 6, '#9fcfff');
      ret(ctx, cx, py - 11, 1, 7, AZUL);
      // terra verde e a trilha vermelha passando pelas duas páginas
      ret(ctx, cx - 5, py - 10, 3, 3, VERDE); ret(ctx, cx + 3, py - 9, 3, 3, VERDE);
      ret(ctx, cx - 3, py - 7, 1, 1, VERM); ret(ctx, cx - 1, py - 8, 1, 1, VERM); ret(ctx, cx + 2, py - 8, 1, 1, VERM);
      ret(ctx, cx + 4, py - 13, 1, 3, AMAR);
    } });

  /* ================= TRÂNSITO ================= */
  // semáforo de carros (var.pedestre: o de pedestres, com o bonequinho)
  I.objeto('geografia-semaforo', { w: 1, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8;
      poste(ctx, cx, py, 12);
      if (v(o, 'pedestre', false)) {
        contornoRet(ctx, cx - 5, py - 16, 11, 18, CINZA);
        ret(ctx, cx - 3, py - 14, 7, 6, '#5a2a2a'); ret(ctx, cx - 3, py - 6, 7, 6, VERDE);
        ret(ctx, cx - 1, py - 13, 3, 1, VERM); ret(ctx, cx - 1, py - 12, 3, 3, VERM);   // parado
        ret(ctx, cx, py - 5, 1, 1, C.branco); ret(ctx, cx - 1, py - 4, 3, 2, C.branco); ret(ctx, cx - 2, py - 2, 1, 1, C.branco); ret(ctx, cx + 2, py - 2, 1, 1, C.branco);
        return;
      }
      contornoRet(ctx, cx - 5, py - 20, 11, 22, CINZA);
      [[VERM, -17], [AMAR, -11], [VERDE, -5]].forEach(function (l) {
        circulo(ctx, cx, py + l[1] + 2, 3, K); circulo(ctx, cx, py + l[1] + 2, 2, l[0]); ret(ctx, cx - 1, py + l[1] + 1, 1, 1, clarear(l[0], 0.6));
      });
    },
    anim: function (ctx, px, py, t, o) {
      if (v(o, 'pedestre', false)) return;
      // a luz acesa troca devagar: verde, amarelo, vermelho
      var fase = Math.floor(t / 1600) % 3, cores = [VERDE, AMAR, VERM], dy = [-3, -9, -15][fase];
      circulo(ctx, px + 8, py + dy, 3, clarear(cores[fase], 0.35)); ret(ctx, px + 7, py + dy - 1, 1, 1, C.branco);
    } });
  // placa de trânsito redonda (var.tipo: 'E', 'E-cortado', '80', 'seta')
  I.objeto('geografia-placa', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, cy = py - 6, tipo = v(o, 'tipo', 'E');
      poste(ctx, cx, py, 8);
      circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, VERM); circulo(ctx, cx, cy, 4, C.branco);
      if (tipo === '80') {
        D.matriz(ctx, cx - 3, cy - 2, ['###.###', '#.#.#.#', '###.#.#', '#.#.#.#', '###.###'], { '#': K });
      } else if (tipo === 'seta') {
        D.matriz(ctx, cx - 3, cy - 3, ['.....#.', '######.', '#....#.', '#......', '#......'].map(function (l) { return l; }), { '#': K });
      } else {
        D.matriz(ctx, cx - 2, cy - 3, ['####', '#...', '###.', '#...', '####'], { '#': K });
      }
      if (tipo === 'E-cortado' || tipo === 'seta') for (var i = -4; i <= 4; i++) ret(ctx, cx + i, cy + i, 2, 1, VERM);
    } });
  // faixa de pedestres pintada no chão
  I.objeto('geografia-faixa', { w: 3, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 3) * 16;
      ret(ctx, px, py + 1, W, 14, '#5a5a6a');
      for (var x = px + 2; x < px + W - 2; x += 6) ret(ctx, x, py + 3, 3, 10, '#f4f6fb');
    } });
  // bicicleta verde de pé
  I.objeto('geografia-bicicleta', { w: 2, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      var y = py + 10;
      [px + 7, px + 25].forEach(function (x) { circulo(ctx, x, y, 6, K); circulo(ctx, x, y, 5, '#dfe6f0'); circulo(ctx, x, y, 3, K); ret(ctx, x, y, 1, 1, C.metal2); });
      ret(ctx, px + 7, y - 1, 18, 2, K); ret(ctx, px + 8, y - 1, 16, 1, VERDE);
      ret(ctx, px + 12, y - 8, 2, 8, K); ret(ctx, px + 12, y - 7, 1, 7, VERDE);
      ret(ctx, px + 12, y - 8, 12, 2, K); ret(ctx, px + 13, y - 8, 10, 1, VERDE);
      ret(ctx, px + 23, y - 11, 2, 10, K); ret(ctx, px + 20, y - 12, 7, 2, K);
      ret(ctx, px + 9, y - 10, 6, 2, K); ret(ctx, px + 10, y - 10, 4, 1, '#6b4428');
    } });
  // carrinho vermelho (miniatura do trânsito)
  I.objeto('geografia-carro', { w: 2, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', VERM), y = py + 2;
      contornoRet(ctx, px + 8, y - 4, 16, 7, clarear(c, 0.2)); ret(ctx, px + 10, y - 3, 5, 4, C.vidro); ret(ctx, px + 17, y - 3, 5, 4, C.vidro);
      contornoRet(ctx, px + 2, y + 2, 28, 8, c); ret(ctx, px + 3, y + 3, 26, 1, clarear(c, 0.3));
      ret(ctx, px + 3, y + 5, 2, 2, AMAR); ret(ctx, px + 27, y + 5, 2, 2, '#ff9a9a');
      [px + 8, px + 24].forEach(function (x) { circulo(ctx, x, y + 10, 3, K); circulo(ctx, x, y + 10, 1, C.metal); });
    } });
  // ponto de ônibus com o banquinho e o ônibus na placa
  I.objeto('geografia-ponto', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      poste(ctx, cx, py, 14);
      contornoRet(ctx, cx - 6, py - 16, 13, 10, AZUL);
      contornoRet(ctx, cx - 4, py - 14, 9, 6, AMAR); ret(ctx, cx - 3, py - 13, 7, 2, C.vidro);
      ret(ctx, cx - 3, py - 9, 1, 1, K); ret(ctx, cx + 3, py - 9, 1, 1, K);
    } });

  /* ================= COMUNICAÇÃO ================= */
  // rádio antigo em cima de uma mesinha
  I.objeto('geografia-radio', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 7, py + 2, 15, 3, K); ret(ctx, cx - 6, py + 3, 13, 1, C.madeira);
      ret(ctx, cx - 5, py + 5, 2, 10, K); ret(ctx, cx + 4, py + 5, 2, 10, K);
      contornoRet(ctx, cx - 7, py - 8, 15, 10, VERM); ret(ctx, cx - 6, py - 7, 13, 1, '#ff8a7a');
      ret(ctx, cx - 5, py - 5, 5, 5, K); ret(ctx, cx - 4, py - 4, 3, 3, '#8a604a');
      ret(ctx, cx + 1, py - 5, 5, 2, AMAR); circulo(ctx, cx + 3, py - 1, 1, K);
      ret(ctx, cx + 4, py - 13, 1, 5, K); ret(ctx, cx + 5, py - 14, 1, 1, K);
    },
    anim: function (ctx, px, py, t) {
      // notinhas musicais saindo do rádio
      var f = (t / 900) % 1, y = py - 12 - Math.round(f * 6);
      ret(ctx, px + 1, y, 1, 3, K); ret(ctx, px, y + 2, 2, 1, K); ret(ctx, px + 2, y, 2, 1, K);
    } });
  // televisão antiga de antena
  I.objeto('geografia-tv', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 6, 2, 9, K); ret(ctx, cx + 4, py + 6, 2, 9, K);
      contornoRet(ctx, cx - 7, py - 7, 15, 13, C.madeira);
      contornoRet(ctx, cx - 6, py - 6, 10, 10, '#7ed9c8'); ret(ctx, cx - 5, py - 5, 3, 1, C.branco);
      ret(ctx, cx + 5, py - 5, 2, 2, AMAR); ret(ctx, cx + 5, py - 1, 2, 2, VERM);
      for (var i = 0; i < 5; i++) { ret(ctx, cx - 2 - i, py - 8 - i, 1, 1, K); ret(ctx, cx + 2 + i, py - 8 - i, 1, 1, K); }
    } });
  // telefone antigo de disco numa mesinha, com o fio enrolado
  I.objeto('geografia-telefone', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py + 1, 13, 3, K); ret(ctx, cx - 5, py + 2, 11, 1, C.madeiraClara);
      ret(ctx, cx - 1, py + 4, 3, 11, K); ret(ctx, cx - 4, py + 13, 9, 2, K);
      contornoRet(ctx, cx - 5, py - 5, 11, 7, VERM);
      circulo(ctx, cx, py - 1, 2, K); circulo(ctx, cx, py - 1, 1, C.creme);
      ret(ctx, cx - 6, py - 8, 13, 3, K); ret(ctx, cx - 5, py - 7, 11, 1, '#ff7a6a');
      for (var i = 0; i < 4; i++) ret(ctx, cx + 6 + (i % 2), py + 2 + i * 2, 1, 1, K);
    } });
  // telefone de copos: dois copinhos e o fio esticado
  I.objeto('geografia-copos', { w: 2, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py) {
      function copo(x, cor) { ret(ctx, x - 3, py + 4, 7, 9, K); ret(ctx, x - 2, py + 5, 5, 7, cor); ret(ctx, x - 2, py + 5, 1, 7, clarear(cor, 0.4)); }
      copo(px + 5, '#ff9cc6'); copo(px + 27, '#5fb4ff');
      ret(ctx, px + 9, py + 8, 14, 1, '#8a604a');
    } });
  // caixa de correio azul
  I.objeto('geografia-correio', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 1, py + 4, 3, 11, K); ret(ctx, cx - 3, py + 13, 7, 2, K);
      contornoRet(ctx, cx - 6, py - 8, 13, 13, AMAR);
      elipse(ctx, cx, py - 8, 6, 3, K); elipse(ctx, cx, py - 8, 5, 2, AMAR);
      ret(ctx, cx - 4, py - 4, 9, 2, K);
      ret(ctx, cx - 3, py, 7, 3, AZUL);
    } });
  // mesa com o computador (e-mail e videochamada)
  I.objeto('geografia-computador', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 8, py + 2, 16, 3, K); ret(ctx, cx - 7, py + 3, 14, 1, C.madeira);
      ret(ctx, cx - 7, py + 5, 2, 10, K); ret(ctx, cx + 5, py + 5, 2, 10, K);
      contornoRet(ctx, cx - 6, py - 10, 12, 10, '#3a4a6a');
      ret(ctx, cx - 5, py - 9, 10, 8, '#bfe9ff'); circulo(ctx, cx - 2, py - 6, 1, '#ff9cc6'); circulo(ctx, cx + 2, py - 6, 1, AMAR);
      ret(ctx, cx - 1, py, 2, 2, K); ret(ctx, cx - 5, py + 1, 10, 1, C.metal2);
    } });
  // cartaz de parede com as mãos da Libras
  I.objeto('geografia-libras', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var x = px + 1, y = py + 9;
      contornoRet(ctx, x, y, 14, 16, C.creme);
      D.matriz(ctx, x + 2, y + 3, ['.#..#.#..', '.#..#.#..', '.##.####.', '..######.', '..#####..', '...###...'], { '#': '#f1b58a' });
      ret(ctx, x + 2, y + 11, 10, 1, AZUL); ret(ctx, x + 3, y + 13, 7, 1, '#c4b4d4');
    } });
  // painel "linha do tempo dos meios de comunicação" (parede, 2 de largura)
  I.objeto('geografia-linha-tempo', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var x = px + 1, y = py + 9;
      contornoRet(ctx, x, y, 30, 16, '#eaf6ff');
      ret(ctx, x + 2, y + 9, 26, 1, AZUL);
      // carta, telefone, rádio, tv, celular
      ret(ctx, x + 3, y + 3, 5, 4, C.creme2); ret(ctx, x + 3, y + 3, 5, 1, K);
      ret(ctx, x + 9, y + 4, 4, 3, VERM);
      ret(ctx, x + 14, y + 3, 5, 4, '#8a604a');
      ret(ctx, x + 20, y + 3, 4, 4, '#7ed9c8');
      ret(ctx, x + 25, y + 2, 3, 5, '#3a4a6a');
      [4, 10, 16, 21, 26].forEach(function (d) { ret(ctx, x + d, y + 8, 1, 3, K); });
    } });

  // compartilhado com geografia.js e fora.js
  S.AZUL = AZUL; S.VERDE = VERDE; S.VERM = VERM; S.AMAR = AMAR; S.CINZA = CINZA;
})();
