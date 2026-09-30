/* Laboratório de Química: a tabela periódica, parte 2 de 2 (a parte 1, quimica-tabela.js, cria a tela e o interno
   Reino._quimicaTabela). Aqui: a aba "Lições" (lista com ✔ nas lidas) e a lição paginada (◀ ▶, "página N de M"),
   cada página falada pela Doutora Proveta, com o desenho pixel art do campo `desenho` da lição. Chegar à última
   página grava a descoberta (Reino.Quimica.descobrir) e dá a estrela da 1ª vez. Acrescenta ao interno:
   mostrarLicoes(v), abrirLicao(v, id) e desenhos (chave → função que desenha no ctx de 64×48 px de arte). */
(function () {
  var R = window.Reino, T = R._quimicaTabela, el = T.el, ret = T.ret, UI = R.UI, D = R.Desenho, U = R.util;
  var K = D.K, C = D.C;
  var W = 64, H = 48;   // o quadro de cada desenho, em px de arte

  /* ---------- a lista ---------- */
  function licoes() { return T.Q.licoes().sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); }); }
  T.mostrarLicoes = function (v, focarId) {
    var ls = licoes(), lidas = ls.filter(function (l) { return T.Q.descoberto('licoes', l.id); }).length;
    var n = R.config.quimica.estrelasLicaoNova;
    var lista = el('div.qt-licoes', ls.map(function (l) {
      var lida = T.Q.descoberto('licoes', l.id);
      var b = el('button.qt-licao' + (lida ? '.lida' : ''), { type: 'button', 'data-licao': l.id },
        el('span.qt-licao-emoji', l.emoji || '⚛'), el('span.qt-licao-nome', T.hifenizar(l.titulo)),
        el('span.chip-mini.qt-licao-estado', lida ? '✔ Lida' : '+' + n + ' ⭐'));
      b.addEventListener('click', function () { R.Som.tocar('toque'); T.abrirLicao(v, l.id); });
      return b;
    }));
    v.trocar([el('p.qt-contagem', 'Lições lidas: ', el('b', lidas + ' de ' + ls.length)), lista], null);
    var alvo = focarId && lista.querySelector('[data-licao="' + focarId + '"]');
    if (alvo) UI.focarTroca(alvo, null, 400);
  };

  /* ---------- a lição, página por página ---------- */
  T.abrirLicao = function (v, id) {
    var l = T.Q.licao(id);
    if (!l) return;
    var pags = T.paginas(l.paginas), i = 0, n = pags.length || 1;
    var titulo = el('h3.qt-licao-titulo', (l.emoji ? l.emoji + ' ' : '') + l.titulo);
    var texto = el('p.qt-licao-texto'), selo = el('p.qt-selo', { hidden: true });
    var voltar = T.rodapeBotao(['←', el('span.rotulo-longo', ' Voltar')], 'Voltar', 'btn-secundario.qt-voltar');
    var ant = T.rodapeBotao('◀', 'Página anterior', 'btn-secundario.so-seta');
    var prox = T.rodapeBotao('▶', 'Próxima página', 'btn-principal.so-seta');
    var pag = el('span.qt-pag');
    voltar.addEventListener('click', function () { R.Som.tocar('toque'); R.Som.calar(); T.mostrarLicoes(v, l.id); });
    ant.addEventListener('click', function () { if (i > 0) { i--; R.Som.tocar('toque'); mostrar(); } });
    prox.addEventListener('click', function () { if (i < n - 1) { i++; R.Som.tocar('toque'); mostrar(); } });
    function mostrar() {
      U.preencher(texto, T.hifenizar(pags[i] || ''));
      pag.textContent = '';
      pag.appendChild(el('span.rotulo-longo', 'Página '));
      pag.appendChild(document.createTextNode((i + 1) + ' de ' + n));
      ant.setAttribute('aria-disabled', String(i === 0));
      prox.setAttribute('aria-disabled', String(i === n - 1));
      var fala = [pags[i]];
      if (i === n - 1) {   // chegou ao fim: a descoberta (e a estrela da 1ª vez)
        var r = T.Q.descobrir('licoes', l.id);
        if (r.nova) {
          U.preencher(selo, 'Lição lida! +' + r.estrelas + ' ⭐');
          selo.hidden = false;
          R.Som.tocar('estrela');
          UI.festa(1, { item: selo });
          if (UI.estrelaVoa) UI.estrelaVoa(selo);
          fala = fala.concat(T.Q.frase('tabela.licaoNova'));
          if (T.Q.descobertas('licoes').length === T.Q.licoes().length) fala = fala.concat(T.Q.frase('tabela.todasLicoes'));
        }
      }
      T.falar(fala);
    }
    var quadro = desenho(l.desenho);
    v.trocar([el('article.qt-licao-pagina', titulo, quadro, texto, selo)],
      [voltar, el('div.qt-nav', ant, pag, prox)], { ant: ant, prox: prox });
    mostrar();
    UI.focarTroca(prox, titulo, 400);
  };

  /* ---------- os desenhos (64×48 px de arte; ui.md §10: contorno #3a2446, sem arc, luz em faixas) ---------- */
  function bola(ctx, cx, cy, r, cor) {
    D.circulo(ctx, cx, cy, r + 1, K);
    D.circulo(ctx, cx, cy, r, cor);
    ret(ctx, cx - Math.ceil(r / 2), cy - Math.ceil(r / 2), 1, 1, D.clarear(cor, 0.6));   // brilho em cima, à esquerda
  }
  function quadroFundo(ctx, cor) { ret(ctx, 0, 0, W, H, K); ret(ctx, 1, 1, W - 2, H - 2, cor); }
  // linha de pixels de espessura e (Bresenham)
  function linha(ctx, x0, y0, x1, y1, e, cor) {
    var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, er = dx + dy;
    for (;;) {
      ret(ctx, x0, y0, e, e, cor);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * er;
      if (e2 >= dy) { er += dy; x0 += sx; }
      if (e2 <= dx) { er += dx; y0 += sy; }
    }
  }
  // letras de 3×5 px para os símbolos dentro das bolas
  var LETRAS = { H: ['x.x', 'x.x', 'xxx', 'x.x', 'x.x'], O: ['xxx', 'x.x', 'x.x', 'x.x', 'xxx'] };
  function letra(ctx, ch, cx, cy, cor) { D.matriz(ctx, cx - 1, cy - 2, LETRAS[ch], { x: cor }); }
  // copo de vidro aberto em cima, com o líquido até `nivel` px e a linha d'água
  function copo(ctx, x, y, w, h, liq, nivel) {
    ret(ctx, x, y, 1, h, K); ret(ctx, x + w - 1, y, 1, h, K); ret(ctx, x, y + h - 1, w, 1, K);
    ret(ctx, x - 1, y, 1, 1, K); ret(ctx, x + w, y, 1, 1, K);
    ret(ctx, x + 1, y, w - 2, h - 1, C.vidro);
    if (nivel > 0) { ret(ctx, x + 1, y + h - 1 - nivel, w - 2, nivel, liq); ret(ctx, x + 1, y + h - 1 - nivel, w - 2, 1, D.clarear(liq, 0.5)); }
    ret(ctx, x + 2, y + 2, 1, h - 5, C.branco);
  }
  // tubo de ensaio de 6 px, fundo arredondado em degraus
  function tubo(ctx, x, y, h, liq) {
    ret(ctx, x, y, 1, h - 2, K); ret(ctx, x + 5, y, 1, h - 2, K); ret(ctx, x + 1, y + h - 2, 1, 1, K); ret(ctx, x + 4, y + h - 2, 1, 1, K);
    ret(ctx, x + 2, y + h - 1, 2, 1, K); ret(ctx, x - 1, y, 8, 1, K);
    ret(ctx, x + 1, y + 1, 4, h - 3, C.vidro); ret(ctx, x + 2, y + h - 2, 2, 1, liq);
    ret(ctx, x + 1, y + 9, 4, h - 11, liq); ret(ctx, x + 1, y + 9, 4, 1, D.clarear(liq, 0.5));
    ret(ctx, x + 2, y + 3, 1, 4, C.branco);
  }
  // mini tabela periódica: casas de 3 px; a cor da família quando o dado tem a casa, senão a do bloco
  function temCasa(l, c) {
    if (l === 1) return c === 1 || c === 18;
    if (l <= 3) return c <= 2 || c >= 13;
    if (l <= 7) return true;
    return (l === 9 || l === 10) && c >= 3 && c <= 17;
  }
  function corBloco(l, c) { return l >= 9 ? C.lilas : c <= 2 ? C.rosa : c <= 12 ? C.azul2 : c === 18 ? C.ouro : C.verde; }

  var desenhos = T.desenhos = {
    atomo: function (ctx, t) {
      quadroFundo(ctx, '#ebe5ff');
      var cx = 32, cy = 24, orbitas = [0, Math.PI / 3, 2 * Math.PI / 3];
      function ponto(a, rot) { var x = 21 * Math.cos(a), y = 7 * Math.sin(a); return [Math.round(cx + x * Math.cos(rot) - y * Math.sin(rot)), Math.round(cy + x * Math.sin(rot) + y * Math.cos(rot))]; }
      orbitas.forEach(function (rot) { for (var a = 0; a < 2 * Math.PI; a += 0.02) { var p = ponto(a, rot); ret(ctx, p[0], p[1], 1, 1, C.lilas); } });
      // o núcleo: prótons (vermelhos) e nêutrons (cinza) juntinhos
      // o núcleo: prótons (vermelhos) e nêutrons (cinza), cada bolinha com o seu contorno, de trás para a frente
      [[-3, -3, 'n'], [3, -3, 'p'], [-4, 2, 'p'], [4, 2, 'n'], [0, 0, 'p'], [0, 4, 'n']].forEach(function (b) {
        bola(ctx, cx + b[0], cy + b[1], 3, b[2] === 'p' ? C.vermelho : C.metal);
      });
      orbitas.forEach(function (rot, k) { var p = ponto(t + k * 2.1, rot); bola(ctx, p[0], p[1], 2, C.azul); });
    },
    tabela: function (ctx) {
      quadroFundo(ctx, C.creme);
      var casas = {}, fs = T.Q.familias();
      T.Q.tabela().forEach(function (x) { casas[x.linha + ':' + x.coluna] = x; });
      var x0 = 4, y0 = 9;
      for (var l = 1; l <= 10; l++) for (var c = 1; c <= 18; c++) {
        if (l === 8 || !temCasa(l, c)) continue;
        var x = x0 + (c - 1) * 3, y = y0 + (l <= 7 ? (l - 1) * 3 : 7 * 3 + 2 + (l - 9) * 3);
        var d = casas[l + ':' + c], cor = d && fs[d.familia] ? fs[d.familia].cor : corBloco(l, c);
        ret(ctx, x, y, 4, 4, K); ret(ctx, x + 1, y + 1, 2, 2, cor);
      }
    },
    h2o: function (ctx) {
      quadroFundo(ctx, C.ceu);
      linha(ctx, 31, 21, 18, 33, 2, K); linha(ctx, 32, 21, 45, 33, 2, K);   // as ligações
      bola(ctx, 32, 20, 9, C.vermelho); letra(ctx, 'O', 32, 20, C.creme);
      bola(ctx, 17, 34, 6, C.creme); letra(ctx, 'H', 17, 34, K);
      bola(ctx, 47, 34, 6, C.creme); letra(ctx, 'H', 47, 34, K);
    },
    estados: function (ctx) {
      quadroFundo(ctx, '#d9d0f0');
      for (var y = 3; y < H - 3; y += 2) { ret(ctx, 21, y, 1, 1, K); ret(ctx, 42, y, 1, 1, K); }
      // gelo: dois cubos
      [[4, 28, 11], [8, 19, 9]].forEach(function (g) {
        ret(ctx, g[0], g[1], g[2], g[2], K); ret(ctx, g[0] + 1, g[1] + 1, g[2] - 2, g[2] - 2, C.azul2);
        ret(ctx, g[0] + 1, g[1] + 1, g[2] - 2, 1, C.branco); ret(ctx, g[0] + 1, g[1] + 2, 1, 2, C.branco);
        ret(ctx, g[0] + g[2] - 3, g[1] + g[2] - 3, 1, 1, C.branco);
      });
      ret(ctx, 3, 40, 15, 1, C.azul);   // poça
      copo(ctx, 26, 22, 12, 20, C.azul, 11);   // água
      copo(ctx, 48, 30, 11, 12, C.azul, 5);    // vapor: o copo quente e as ondinhas subindo
      [[50, 11], [54, 7], [52, 18]].forEach(function (f) {
        for (var k = 0; k < 9; k++) ret(ctx, f[0] + (k % 4 < 2 ? 0 : 2), f[1] + k, 2, 1, C.branco);
      });
    },
    repolho: function (ctx) {
      quadroFundo(ctx, C.creme);
      [[13, '#ff7eb6'], [29, '#9b5de5'], [45, '#6fdc8c']].forEach(function (t) { tubo(ctx, t[0], 5, 26, t[1]); });
      var faixas = ['#ff5c8a', '#ff7eb6', '#d77be0', '#9b5de5', '#7c7ce0', '#4fb8b0', '#6fdc8c'];
      ret(ctx, 4, 36, 56, 7, K);
      faixas.forEach(function (c, k) { ret(ctx, 5 + k * 8, 37, 8, 5, c); ret(ctx, 5 + k * 8, 37, 8, 1, D.clarear(c, 0.4)); });
    },
    mistura: function (ctx) {
      quadroFundo(ctx, C.creme);
      for (var y = 3; y < H - 3; y += 2) ret(ctx, 32, y, 1, 1, K);
      // mistura: o sal cai e some na água
      copo(ctx, 8, 18, 18, 24, C.azul2, 16);
      [[12, 6], [17, 10], [14, 13], [20, 4]].forEach(function (g) { ret(ctx, g[0] - 1, g[1] - 1, 4, 4, K); ret(ctx, g[0], g[1], 2, 2, C.branco); });
      [[12, 30], [19, 34], [15, 38]].forEach(function (g) { ret(ctx, g[0], g[1], 1, 1, C.branco); });
      // reação: bolhas novas sobem e a espuma transborda
      copo(ctx, 38, 18, 18, 24, C.ouro, 16);
      [[42, 34, 2], [49, 29, 1], [45, 26, 2], [51, 37, 1]].forEach(function (b) { bola(ctx, b[0], b[1], b[2], C.ouro3); });
      [[40, 16], [44, 14], [49, 15], [53, 16]].forEach(function (b) { bola(ctx, b[0], b[1], 3, C.branco); });
    },
  };
  // o que aparece embaixo de cada desenho (só na tela; a voz lê as páginas)
  var LEGENDAS = {
    atomo: [[C.vermelho, 'Próton'], [C.metal, 'Nêutron'], [C.azul, 'Elétron']],
    h2o: [[C.creme, 'Hidrogênio'], [C.vermelho, 'Oxigênio']],
    estados: [[null, 'Sólido'], [null, 'Líquido'], [null, 'Gás']],
    repolho: [[null, 'Ácido'], [null, 'Neutro'], [null, 'Base']],
    mistura: [[null, 'Mistura'], [null, 'Reação']],
  };

  // px CSS por px de arte: 4 no celular, 5 no notebook (tela baixa), 6 no tablet
  function escala() { var w = window.innerWidth, h = window.innerHeight; return w <= 480 ? 4 : h <= 820 ? 5 : 6; }
  function desenho(chave) {
    var f = desenhos[chave];
    if (!f) return null;
    var k = escala(), c = T.canvasNitido(W, H, k);
    c.cv.setAttribute('data-desenho', chave);
    c.cv.setAttribute('aria-hidden', 'true');
    var fase = 0;
    f(c.ctx, fase);
    // só o átomo se mexe: os elétrons andam na órbita em degraus, só com animação (e param quando a tela sai)
    if (chave === 'atomo' && U.animar()) {
      var antes = 0;
      var passo = function (agora) {
        if (!c.cv.isConnected) return;
        if (agora - antes >= R.config.movimento.rapido) { antes = agora; fase += 0.3; f(c.ctx, fase); }
        requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    }
    var leg = LEGENDAS[chave];
    return el('figure.qt-quadro', c.cv, leg ? el('figcaption.qt-quadro-legenda' + (leg[0][0] ? '' : '.partes'),
      leg.map(function (x) { return el('span', x[0] ? el('span.qt-cor', { style: { background: x[0] } }) : null, x[1]); })) : null);
  }
  T.desenho = desenho;
})();
