/* NPCs, sprite de pessoa: cabeça (olhos, bochechas, boca), cabelo da frente, rosto (barba,
   bigode, óculos, nariz), rosto de palhaço e chapéus. Só funções de pintar numa Grade; ver npcs.js. */
(function () {
  var _n = window.Reino._npcs;
  var CX = _n.CX, HY = _n.HY, esc = _n.esc, cla = _n.cla, mis = _n.mis;

  /* ---------- cabeça ---------- */
  function pintarCabeca(g, o, piscar) {
    var x = CX, y = HY, K = o.pele;
    g.l(y, x - 2, x + 2, K); g.l(y + 1, x - 3, x + 3, K);
    for (var j = 2; j <= 5; j++) g.l(y + j, x - 4, x + 4, K);
    g.l(y + 6, x - 3, x + 3, K);
    var olho = piscar ? esc(K, 0.4) : OLHO;
    g.p(x - 2, y + 4, olho); g.p(x + 2, y + 4, olho);
    var bochecha = mis(K, '#ff6b8a', 0.42);
    g.p(x - 3, y + 5, bochecha); g.p(x + 3, y + 5, bochecha);
    if (o.boca) g.p(x, y + 6, mis(K, '#b03a5a', 0.5));
  }

  function pintarCabeloFrente(g, o) {
    var x = CX, y = HY, H = o.cabelo, L = cla(H, 0.28), Hd = esc(H, 0.18), K = o.pele;
    function topo(volume) {
      if (volume) g.l(y - 1, x - 2, x + 2, H);
      g.l(y, x - 3, x + 3, H); g.l(y + 1, x - 4, x + 4, H); g.l(y + 2, x - 4, x + 4, H);
      g.p(x - 2, y, L); g.p(x - 1, y, L); g.p(x - 3, y + 1, L);
    }
    function lados(ate, largo) {
      g.p(x - 4, y + 3, H); g.p(x + 4, y + 3, H);
      if (largo) { g.p(x - 3, y + 3, H); g.p(x + 3, y + 3, H); }
      for (var j = 4; j <= ate; j++) { g.p(x - 4, y + j, H); g.p(x + 4, y + j, H); }
    }
    function queixoFino() { g.apagar(x - 3, y + 6); g.apagar(x + 3, y + 6); }
    switch (o.penteado) {
      case 'careca':
        g.p(x - 1, y, cla(K, 0.45)); g.p(x - 2, y + 1, cla(K, 0.25));
        g.p(x - 4, y + 2, H); g.p(x - 3, y + 2, H); g.p(x + 3, y + 2, H); g.p(x + 4, y + 2, H);
        g.p(x - 4, y + 3, H); g.p(x + 4, y + 3, H);
        queixoFino();
        break;
      case 'cachos':
        // cabeleira de cachinhos fofos: franja cacheada na testa e dois cachos redondos de cada lado
        g.l(y, x - 3, x + 3, H); g.l(y + 1, x - 4, x + 4, H);
        [-3, -1, 1, 3].forEach(function (d) { g.p(x + d, y, L); });
        [-4, -2, 0, 2, 4].forEach(function (d) { g.p(x + d, y + 1, Hd); });
        [-1, 1].forEach(function (s) {
          g.l(y + 1, Math.min(x + s * 5, x + s * 5), Math.max(x + s * 5, x + s * 5), H);
          g.l(y + 2, Math.min(x + s * 4, x + s * 6), Math.max(x + s * 4, x + s * 6), H);
          g.l(y + 3, Math.min(x + s * 4, x + s * 6), Math.max(x + s * 4, x + s * 6), H);
          g.l(y + 4, Math.min(x + s * 5, x + s * 6), Math.max(x + s * 5, x + s * 6), H);
          g.l(y + 5, Math.min(x + s * 5, x + s * 6), Math.max(x + s * 5, x + s * 6), H);
          g.p(x + s * 5, y + 6, H);
          g.p(x + s * 5, y + 2, L); g.p(x + s * 6, y + 4, L); g.p(x + s * 5, y + 5, Hd); g.p(x + s * 6, y + 3, Hd); g.p(x + s * 5, y + 6, Hd);
        });
        queixoFino();
        break;
      case 'espetado':
        topo(true);
        g.p(x - 3, y - 1, H); g.p(x + 3, y - 1, H); g.p(x - 2, y - 2, H); g.p(x + 1, y - 2, H); g.p(x + 3, y - 2, Hd);
        lados(3);
        queixoFino();
        break;
      case 'longo': case 'trancas':
        topo(true); lados(6, true);
        break;
      case 'chanel':
        topo(true); g.l(y + 3, x - 4, x + 4, H); g.p(x, y + 3, Hd); lados(6);
        break;
      case 'rabo': case 'rabos':
        topo(false); lados(4, true);
        break;
      case 'coque':
        topo(false); lados(4, true);
        g.l(y - 3, x - 1, x + 1, H); g.l(y - 2, x - 2, x + 2, H); g.l(y - 1, x - 1, x + 1, Hd);
        g.p(x - 1, y - 3, L); g.p(x + 2, y - 2, o.cor2);
        break;
      case 'black': case 'cacheado':
        g.l(y, x - 3, x + 3, H); g.l(y + 1, x - 4, x + 4, H); g.l(y + 2, x - 4, x + 4, H);
        g.p(x - 4, y + 3, H); g.p(x + 4, y + 3, H); g.p(x - 1, y + 1, L); g.p(x + 2, y, L);
        break;
      default: // curto
        topo(true); lados(3);
        g.p(x + 1, y + 2, Hd);
        queixoFino();
    }
  }

  // luminância relativa (WCAG) de '#rrggbb' e a armação clareada até dar 3:1 com o olho
  function lum(h) {
    var v = [1, 3, 5].map(function (i) { var c = parseInt(h.substr(i, 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  var OLHO = '#2a1838';
  function armacao(c) {
    for (var t = 0; t < 0.9 && (lum(c) + 0.05) / (lum(OLHO) + 0.05) < 3; t += 0.1) c = cla(c, 0.1);
    return c;
  }

  function pintarRosto(g, o) {
    var x = CX, y = HY, H = o.cabelo;
    if (o.barba) {
      var Bb = o.barba === true ? H : o.barba;
      g.p(x - 4, y + 5, Bb); g.p(x + 4, y + 5, Bb); g.p(x - 4, y + 4, Bb); g.p(x + 4, y + 4, Bb);
      g.l(y + 6, x - 3, x + 3, Bb); g.l(y + 7, x - 2, x + 2, Bb); g.p(x, y + 6, esc(Bb, 0.25));
    }
    if (o.bigode) {
      var Bg = o.bigode === true ? H : o.bigode;
      g.l(y + 5, x - 2, x + 2, Bg); g.p(x, y + 5, esc(Bg, 0.15));
    }
    if (o.oculos) {
      // armação em cima e dos lados de cada olho, ponte no alto; as colunas x±1 ficam com a pele (com elas a
      // armação lia como uma faixa nos olhos). A cor clareia até contrastar 3:1 com o olho (D4-16)
      var Oc = armacao(o.oculosCor || '#8a6bb0');
      g.l(y + 3, x - 3, x - 2, Oc); g.l(y + 3, x + 2, x + 3, Oc); g.p(x, y + 3, Oc);
      g.p(x - 3, y + 4, Oc); g.p(x + 3, y + 4, Oc);
    }
    if (o.nariz) {
      // nariz redondo de palhaço, entre os olhos e a boca, com um brilhinho
      var Nz = o.nariz === true ? '#ff3b3b' : o.nariz;
      g.p(x, y + 4, Nz); g.l(y + 5, x - 1, x + 1, Nz); g.p(x + 1, y + 5, esc(Nz, 0.2)); g.p(x - 1, y + 5, cla(Nz, 0.5));
    }
  }

  // rosto de palhaço alegre, com a pele de sempre: bochechas redondas pintadas de rosa,
  // nariz vermelho redondinho com brilho e um sorrisão
  function pintarPalhaco(g, o) {
    if (!o.palhaco) return;
    var x = CX, y = HY, Nz = '#ff3b3b', Bc = '#c2304f', Rs = '#ff7fa8';
    g.p(x - 3, y + 5, Rs); g.p(x + 3, y + 5, Rs); g.p(x - 4, y + 5, mis(o.pele, Rs, 0.6)); g.p(x + 4, y + 5, mis(o.pele, Rs, 0.6));
    g.p(x, y + 4, Nz); g.l(y + 5, x - 1, x + 1, Nz); g.p(x, y + 4, cla(Nz, 0.2)); g.p(x - 1, y + 5, cla(Nz, 0.55)); g.p(x + 1, y + 5, esc(Nz, 0.2));
    g.l(y + 6, x - 2, x + 2, Bc); g.p(x, y + 6, esc(Bc, 0.2));
  }

  function pintarChapeu(g, o) {
    var x = CX, y = HY, C = o.chapeuCor, Cd = esc(C, 0.22), Cl = cla(C, 0.3), c2 = o.cor2;
    switch (o.chapeu) {
      case 'bone':
        g.l(y - 1, x - 3, x + 3, C); g.l(y, x - 4, x + 4, C); g.l(y + 1, x - 4, x + 4, C);
        g.l(y + 2, x - 5, x + 5, Cd); g.p(x, y, c2); g.p(x - 2, y - 1, Cl);
        break;
      case 'chapeu': case 'palha':
        var palha = o.chapeu === 'palha';
        if (palha) { C = o.chapeuCor && o.chapeuCor !== o.cor2 ? o.chapeuCor : '#f2cf6b'; Cd = esc(C, 0.2); Cl = cla(C, 0.35); }
        g.l(y - 3, x - 2, x + 2, C); g.l(y - 2, x - 3, x + 3, C); g.l(y - 1, x - 3, x + 3, C);
        g.l(y, x - 3, x + 3, palha ? '#d6453d' : c2);
        g.l(y + 1, x - (palha ? 7 : 6), x + (palha ? 7 : 6), Cd);
        g.p(x - 2, y - 2, Cl);
        if (palha) { g.p(x - 5, y + 1, Cl); g.p(x - 1, y + 1, Cl); g.p(x + 3, y + 1, Cl); g.p(x + 1, y - 2, Cd); g.p(x - 1, y - 1, Cd); }
        break;
      case 'cartola':
        g.r(x - 3, y - 5, 7, 5, C); g.l(y - 1, x - 3, x + 3, c2); g.l(y, x - 5, x + 5, Cd);
        g.r(x - 2, y - 4, 1, 3, Cl);
        break;
      case 'boina':
        g.p(x, y - 2, Cd); g.l(y - 1, x - 3, x + 4, C); g.l(y, x - 4, x + 5, C); g.l(y + 1, x - 4, x + 4, Cd);
        g.p(x - 2, y - 1, Cl);
        break;
      case 'coroa':
        var O = '#ffd34d', Od = '#e09a1e';
        g.p(x - 3, y - 3, O); g.p(x, y - 3, O); g.p(x + 3, y - 3, O);
        g.p(x - 3, y - 2, O); g.l(y - 2, x - 1, x + 1, O); g.p(x + 3, y - 2, O);
        g.l(y - 1, x - 3, x + 3, O); g.l(y, x - 3, x + 3, Od);
        g.p(x - 2, y, '#ff4f9a'); g.p(x, y, '#5fb4ff'); g.p(x + 2, y, '#ff4f9a'); g.p(x, y - 2, '#ffffff');
        break;
      case 'tiara':
        g.l(y + 1, x - 3, x + 3, '#ffd34d'); g.p(x, y, '#ff4f9a'); g.p(x - 1, y, '#ffd34d'); g.p(x + 1, y, '#ffd34d');
        break;
      case 'elmo':
        var AC = o.armaduraCor, M = AC ? mis('#c3cde0', AC, 0.7) : '#c3cde0', Md = AC ? esc(M, 0.3) : '#8791ad', Ml = AC ? cla(M, 0.6) : '#eef2fa';
        g.l(y - 1, x - 3, x + 3, M); g.l(y, x - 4, x + 4, M); g.l(y + 1, x - 4, x + 4, M); g.l(y + 2, x - 4, x + 4, Md);
        for (var j = 3; j <= 5; j++) { g.p(x - 4, y + j, M); g.p(x + 4, y + j, M); }
        g.p(x - 3, y + 3, Md); g.p(x + 3, y + 3, Md);
        g.p(x - 2, y, Ml); g.p(x - 3, y + 1, Ml); g.p(x, y + 1, Md);
        // pluma alta (o cavaleiro fica da altura da estátua de armadura da ala, ui.md §10.12)
        g.l(y - 6, x + 1, x + 2, c2); g.l(y - 5, x, x + 2, c2);
        g.l(y - 4, x, x + 2, c2); g.l(y - 3, x - 1, x + 2, c2); g.l(y - 2, x - 1, x + 1, c2); g.p(x + 1, y - 4, cla(c2, 0.4));
        break;
      case 'turbante':
        g.l(y - 3, x - 3, x + 1, C); g.p(x + 2, y - 4, C); g.p(x + 3, y - 4, c2); g.l(y - 3, x + 2, x + 3, c2);
        g.l(y - 2, x - 4, x + 4, c2); g.l(y - 1, x - 4, x + 4, C); g.l(y, x - 4, x + 4, c2); g.l(y + 1, x - 4, x + 4, C);
        g.p(x - 2, y - 1, Cl); g.p(x + 1, y + 1, Cd); g.p(x - 3, y - 2, cla(c2, 0.3));
        break;
      case 'gorro':
        g.l(y - 3, x - 1, x + 3, C); g.l(y - 2, x - 3, x + 3, C); g.l(y - 1, x - 4, x + 4, C);
        g.l(y, x - 4, x + 4, C); g.l(y + 1, x - 4, x + 4, '#f4f2fa');
        g.l(y - 4, x + 2, x + 4, C); g.p(x + 5, y - 3, C); g.p(x + 5, y - 2, Cd); g.p(x + 6, y - 1, '#ffffff'); g.p(x + 6, y - 2, '#f4f2fa');
        g.p(x - 1, y - 1, c2); g.p(x - 2, y, c2); g.p(x + 2, y - 2, Cl);
        break;
      case 'lenco':
        g.l(y - 1, x - 2, x + 2, C); g.l(y, x - 4, x + 4, C); g.l(y + 1, x - 4, x + 4, C);
        g.p(x - 2, y, c2); g.p(x + 1, y + 1, c2); g.p(x + 3, y, c2); g.p(x + 5, y + 1, C); g.p(x + 5, y + 2, Cd); g.p(x + 6, y + 2, C);
        break;
      case 'chef':
        // touca alta branca e fofinha, com a faixa dobrada na testa
        var Tb = '#ffffff', Ts = '#dcd8e8', Tm = '#eeebf5';
        g.l(y + 1, x - 4, x + 4, Ts); g.l(y, x - 4, x + 4, Tm); g.p(x - 3, y, Tb); g.p(x - 2, y, Tb);
        g.r(x - 3, y - 2, 7, 2, Tb); g.p(x + 3, y - 2, Tm); g.p(x + 3, y - 1, Tm);
        g.l(y - 3, x - 4, x + 4, Tb); g.l(y - 4, x - 4, x + 4, Tb); g.l(y - 5, x - 3, x + 3, Tb); g.l(y - 6, x - 2, x + 2, Tb);
        g.p(x - 1, y - 4, Ts); g.p(x + 2, y - 5, Ts); g.p(x + 4, y - 3, Tm); g.p(x + 4, y - 4, Tm); g.p(x + 1, y - 3, Ts);
        break;
      case 'quepe':
        // quepe de capitã: copa na cor do chapéu, faixa escura com a âncora dourada e a pala na testa
        var Fq = '#2a2f66', Pq = '#1f1b2e', Oq = '#ffd34d';
        g.l(y - 2, x - 3, x + 3, C); g.l(y - 1, x - 5, x + 5, C); g.p(x - 5, y - 1, Cd); g.p(x + 5, y - 1, Cd);
        g.p(x - 2, y - 2, Cl); g.p(x - 3, y - 1, Cl);
        g.l(y, x - 4, x + 4, Fq); g.p(x, y, Oq); g.p(x, y - 1, Oq);
        g.l(y + 1, x - 4, x + 4, Pq); g.p(x - 2, y + 1, '#4a4466');
        break;
      case 'pescador':
        // chapéu de pescador (molinho) com uma folhinha brotando em cima
        g.l(y - 2, x - 3, x + 3, C); g.l(y - 1, x - 4, x + 4, C);
        g.l(y, x - 4, x + 4, esc(C, 0.35)); g.p(x - 2, y, c2);
        g.l(y + 1, x - 6, x + 6, Cd); g.p(x - 6, y + 2, Cd); g.p(x + 6, y + 2, Cd);
        g.p(x - 2, y - 2, Cl); g.p(x - 3, y - 1, Cl); g.p(x - 4, y + 1, Cl); g.p(x + 2, y + 1, Cl);
        g.p(x + 1, y - 3, '#4a8a3a'); g.p(x + 1, y - 4, '#6fdc5c'); g.p(x + 2, y - 4, '#9af07a'); g.p(x, y - 5, '#6fdc5c');
        break;
      case 'festa':
        // chapeuzinho de festa em cone, listrado, com pompom no alto
        g.l(y - 1, x - 3, x + 3, C); g.l(y - 2, x - 2, x + 2, c2); g.l(y - 3, x - 2, x + 1, C);
        g.l(y - 4, x - 1, x + 1, c2); g.p(x, y - 5, C);
        g.p(x + 3, y - 1, Cd); g.p(x + 2, y - 2, esc(c2, 0.2)); g.p(x + 1, y - 3, Cd); g.p(x - 2, y - 1, Cl);
        g.l(y, x - 3, x + 3, c2); g.p(x + 3, y, esc(c2, 0.2)); g.p(x - 3, y, cla(c2, 0.3));
        g.p(x, y - 6, '#ffffff'); g.p(x + 1, y - 6, '#ffffff'); g.p(x + 1, y - 5, '#dcd8e8');
        break;
      case 'faixa':
        // faixa de cabelo com lacinho do lado
        g.l(y, x - 5, x + 5, C); g.p(x - 3, y, Cl); g.p(x + 5, y, Cd);
        g.p(x - 6, y - 1, C); g.p(x - 7, y - 1, Cl); g.p(x - 6, y + 1, Cd); g.p(x - 7, y + 1, C);
        break;
      case 'flores':
        var cores = ['#ff6b8a', '#ffe066', '#ffffff', '#b58cff', '#ff9d2e'];
        [-4, -2, 0, 2, 4].forEach(function (dx, i) { g.p(x + dx, y + 1, cores[i]); });
        [-3, -1, 1, 3].forEach(function (dx) { g.p(x + dx, y + 1, '#6fdc8c'); });
        g.p(x, y, '#ffe066');
        break;
    }
  }

  _n.pintarCabeca = pintarCabeca;
  _n.pintarCabeloFrente = pintarCabeloFrente;
  _n.pintarRosto = pintarRosto;
  _n.pintarPalhaco = pintarPalhaco;
  _n.pintarChapeu = pintarChapeu;
})();
