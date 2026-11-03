/* Estação dos Caminhos da Geografia do Mundo (4º bimestre, docs/contratos/quarto-bimestre.md §7), parte 1 dos objetos
   novos: a estação de cada sala do livro (com o selo ❗/✓/🦄/◐ derivado do progresso, como a lp-estacao da Casa das
   Palavras), o púlpito de cada livro, o mapa da estação, o painel de partidas, a bilheteria, os trilhos e as malas.
   Os enfeites dos capítulos estão em geografia/ge-objetos-temas.js; o layout, em geografia/geografia.js.
   Carrega depois de geografia/objetos.js (que cria Reino._predios.geografia). Põe nele: LIVROS (as cores dos dois
   livros), LARANJA (a cor da matéria) e CORES_CAP (a cor de cada capítulo). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, contornoRet = D.contornoRet, matriz = D.matriz;
  var K = R.Desenho.K;
  var S = R._predios.geografia;   // criado pelo geografia/objetos.js
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }

  // a cor da matéria (o laranja da bússola), as dos dois livros da escola (📗 verde, 📒 amarelo) e a de cada capítulo
  var LARANJA = '#e5731a', LARANJA2 = '#b5520f', LARANJA_CLARO = '#ffc08a';
  var METAL = '#4a5a7a', METAL_LUZ = '#7a8aaa';
  var LIVROS = {
    aprendizagem: { capa: '#3fae5a', capa2: '#2a7a3e', claro: '#a8ecb4' },
    atividades: { capa: '#ffc61a', capa2: '#c98a00', claro: '#fff0a0' },
  };
  var CORES_CAP = { 10: '#c98a4b', 11: '#39a860', 12: '#2f8fd6' };
  function livroDe(o) { return LIVROS[v(o, 'livro', 'aprendizagem')] || LIVROS.aprendizagem; }

  // algarismos 3×5 (o número da página e os capítulos do painel)
  var DIGITOS = {
    0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'],
    3: ['111', '001', '111', '001', '111'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'],
    6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'], 8: ['111', '101', '111', '101', '111'],
    9: ['111', '101', '111', '001', '111'],
  };
  function numero(ctx, x, y, n, cor) {
    String(n).split('').forEach(function (d, i) {
      (DIGITOS[d] || []).forEach(function (l, j) {
        for (var k = 0; k < 3; k++) if (l[k] === '1') ret(ctx, x + i * 4 + k, y + j, 1, 1, cor);
      });
    });
  }

  /* ---------- estado da sala (como o status dos NPCs de sala, npcs-e-dialogo.md §4) ---------- */
  function etapas(a) {
    try { return R.Etapas && R.Etapas.estado && a.materia && a.sala ? R.Etapas.estado(a.materia, a.sala) : null; } catch (e) { return null; }
  }
  function estadoSala(P, o) {
    var a = o.acao || {}, m = a.materia && R.materia(a.materia);
    var s = m && (m.salas || []).find(function (x) { return x.id === a.sala; });
    if (!s || !P || !P.estado) return 'nova';
    var et = etapas(a);
    var feita = !!(P.estado().salas[s.id] || {}).feita;
    if (et && et.emAndamento && !feita) return 'andamento';   // trilha começada e falta etapa: ◐
    var raro = (m.unicornios || []).find(function (u) { return u.raridade === 'raro' && u.sala === s.id; });
    if (raro && P.temUni(raro.id)) return 'raro';
    return feita ? 'feita' : 'nova';
  }
  // a chave do pré-render: o selo e as etapas feitas (muda a cada etapa guardada)
  function chaveSala(P, o) {
    var et = P && P.estado ? etapas(o.acao || {}) : null;
    return estadoSala(P, o) + (et ? ':' + (et.feitas || []).length + '/' + (et.perfeitas || []).length + '/' + et.total : '');
  }
  // o selo redondo: ❗ nova, ✓ feita, 🦄 raro ganho, ◐ em andamento (as mesmas marcas da Casa das Palavras)
  var SELOS = {
    nova: { fundo: C.branco, marca: ['..r..', '..r..', '..r..', '.....', '..r..'] },
    feita: { fundo: '#3fae5a', marca: ['.....', '....w', '...w.', 'w.w..', '.w...'] },
    raro: { fundo: C.rosa2, marca: ['....Y', '...yY', '..yY.', '.yY..', '.....'] },
    andamento: { fundo: C.branco, marca: ['.ooo.', 'ooo..', 'ooo..', 'ooo..', '.ooo.'] },
  };
  function selo(ctx, cx, cy, estado) {
    var s = SELOS[estado] || SELOS.nova;
    circulo(ctx, cx, cy, 4, K); circulo(ctx, cx, cy, 3, s.fundo);
    matriz(ctx, cx - 2, cy - 2, s.marca, { r: '#e0433f', w: C.branco, y: C.ouro, Y: C.ouro2, o: '#ff8a3d' });
  }

  /* ================= ESTAÇÃO DA SALA ================= */
  // var: { livro: 'aprendizagem'|'atividades', pagina } ; acao: { tipo: 'sala', materia, sala } (o selo lê a sala dela).
  // Uma placa de plataforma: poste de metal azul com a faixa laranja da matéria, a bandeja laranja com o livro aberto
  // na cor do livro e o número da página; o selo flutua acima do livro, à direita, sem cobrir o número
  I.objeto('geografia-estacao', { w: 1, h: 1, topo: 21, solido: true, alto: true,
    chave: chaveSala,
    desenhar: function (ctx, px, py, o, P) {
      var cx = px + 8, L = livroDe(o);
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, C.metal2);
      ret(ctx, cx - 2, py, 5, 12, K); ret(ctx, cx - 1, py, 3, 11, METAL); ret(ctx, cx - 1, py, 1, 11, METAL_LUZ);
      ret(ctx, cx - 1, py + 4, 3, 3, LARANJA);
      ret(ctx, cx - 8, py - 4, 17, 5, K); ret(ctx, cx - 7, py - 3, 15, 3, LARANJA); ret(ctx, cx - 7, py - 3, 15, 1, LARANJA_CLARO);
      // o livro aberto: páginas creme, a capa por baixo e o número da página à direita
      var y = py - 12;
      ret(ctx, cx - 8, y, 17, 9, K);
      ret(ctx, cx - 7, y + 7, 15, 1, L.capa);
      ret(ctx, cx - 7, y + 1, 7, 6, C.creme); ret(ctx, cx + 1, y + 1, 7, 6, C.creme);
      ret(ctx, cx, y + 1, 1, 7, L.capa2);
      ret(ctx, cx - 6, y + 2, 5, 1, L.claro); ret(ctx, cx - 6, y + 4, 4, 1, L.claro); ret(ctx, cx - 6, y + 6, 5, 1, L.claro);
      var p = String(v(o, 'pagina', ''));
      if (p && p.length <= 2) numero(ctx, cx + 1 + Math.floor((7 - (p.length * 4 - 1)) / 2), y + 1, p, '#5a4a6a');
      else { ret(ctx, cx + 2, y + 2, 5, 1, L.claro); ret(ctx, cx + 2, y + 4, 4, 1, L.claro); }
      ret(ctx, cx + 5, y + 8, 1, 3, LARANJA2);   // a fitinha marcadora
      selo(ctx, px + 12, py - 17, estadoSala(P, o));
    } });

  /* ================= PÚLPITO DE UM LIVRO (saguão) ================= */
  // o livro em pé, de capa para a frente, num pé de metal: verde (Aprendizagem, com a rosa dos ventos) ou amarelo
  // (Atividades, com um lápis)
  I.objeto('geografia-livro', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, L = livroDe(o);
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, C.metal2);
      ret(ctx, cx - 2, py + 1, 5, 11, K); ret(ctx, cx - 1, py + 1, 3, 10, METAL); ret(ctx, cx - 1, py + 1, 1, 10, METAL_LUZ);
      ret(ctx, cx - 8, py - 2, 17, 4, K); ret(ctx, cx - 7, py - 1, 15, 2, LARANJA);
      ret(ctx, cx - 7, py - 20, 14, 19, K);
      ret(ctx, cx - 6, py - 19, 12, 17, L.capa); ret(ctx, cx - 6, py - 19, 2, 17, L.capa2);
      ret(ctx, cx + 5, py - 18, 1, 15, C.creme);
      ret(ctx, cx - 3, py - 17, 7, 3, C.creme); ret(ctx, cx - 2, py - 16, 5, 1, L.capa2);
      if (v(o, 'livro', '') === 'atividades') {
        matriz(ctx, cx - 3, py - 12, ['.....kk', '....kpk', '...kyk.', '..kyk..', '.kyk...', 'kkk....', 'k......'],
          { k: K, p: C.rosa, y: '#ff8a3d' });
      } else {
        matriz(ctx, cx - 3, py - 12, ['...k...', '..kok..', 'kkwowkk', '.kwwwk.', 'kkwkwkk', '..kwk..', '...k...'],
          { k: K, o: LARANJA, w: C.branco });
      }
      ret(ctx, cx - 3, py - 4, 7, 1, L.claro);
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 280) % 9;
      if (f < 3) { ret(ctx, px + 2 + f * 5, py - 22 - f, 1, 3, C.ouro3); ret(ctx, px + 1 + f * 5, py - 21 - f, 3, 1, C.ouro3); }
    } });

  /* ================= MAPA DA ESTAÇÃO ================= */
  // a planta num cavalete de metal: em cima, os vagões de Atividades (amarelos); no meio, as plataformas de
  // Aprendizagem (verdes); embaixo, o saguão (laranja) com o "você está aqui"; o trilho passa pelas plataformas
  var COLS = [[1, 7], [10, 6], [18, 7]];   // as três colunas de cômodos (x, largura), dentro de 26 px
  I.objeto('geografia-mapa-estacao', { w: 2, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py, 3, 15, K); ret(ctx, px + 25, py, 3, 15, K);
      ret(ctx, px + 5, py, 1, 14, METAL_LUZ); ret(ctx, px + 26, py, 1, 14, METAL_LUZ);
      contornoRet(ctx, px + 1, py - 14, 30, 16, METAL);
      var x0 = px + 3, y0 = py - 12;
      ret(ctx, x0, y0, 26, 12, K);
      COLS.forEach(function (c) {
        ret(ctx, x0 + c[0], y0 + 1, c[1], 2, LIVROS.atividades.capa);     // vagão
        ret(ctx, x0 + c[0], y0 + 4, c[1], 3, LIVROS.aprendizagem.capa);   // plataforma
        var meio = x0 + c[0] + Math.floor(c[1] / 2);
        ret(ctx, meio, y0 + 3, 1, 1, C.creme); ret(ctx, meio, y0 + 7, 1, 1, C.creme);   // portas
      });
      ret(ctx, x0 + 1, y0 + 6, 24, 1, METAL_LUZ);                          // o trilho
      ret(ctx, x0 + 1, y0 + 8, 24, 3, LARANJA_CLARO);                      // saguão
      ret(ctx, x0 + 12, y0 + 9, 2, 2, C.vermelho);                         // você está aqui
      ret(ctx, px + 1, py - 15, 30, 2, K); ret(ctx, px + 2, py - 14, 28, 1, LARANJA);
    } });

  /* ================= PAINEL DE PARTIDAS (parede) ================= */
  // o quadro escuro dos trens: uma linha por capítulo (a bolinha na cor dele, o número e o destino em tracinhos)
  I.objeto('geografia-painel', { w: 3, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var x = px + 1, y = py + 5;
      ret(ctx, x + 6, py + 1, 1, 4, K); ret(ctx, x + 39, py + 1, 1, 4, K);   // as correntes
      contornoRet(ctx, x, y, 46, 23, '#2a2a3a');
      ret(ctx, x + 1, y + 1, 44, 3, LARANJA); ret(ctx, x + 2, y + 2, 3, 1, LARANJA_CLARO);
      [10, 11, 12].forEach(function (cap, i) {
        var ly = y + 6 + i * 6;
        circulo(ctx, x + 5, ly + 2, 2, CORES_CAP[cap]);
        numero(ctx, x + 10, ly, cap, C.ouro);
        for (var k = 0; k < 5; k++) ret(ctx, x + 20 + k * 4, ly + 2, 3, 1, '#d8dce8');
      });
    },
    anim: function (ctx, px, py, t) {
      if (Math.floor(t / 600) % 2) ret(ctx, px + 42, py + 8, 2, 1, C.branco);   // a luzinha do relógio do painel
    } });

  /* ================= BILHETERIA ================= */
  // o balcão de madeira com o vidro, a janelinha redonda, o bilhete e a placa laranja em cima
  I.objeto('geografia-bilheteria', { w: 2, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py - 1, 30, 16, C.madeira); ret(ctx, px + 2, py, 28, 2, C.madeiraClara);
      ret(ctx, px + 4, py + 5, 10, 7, C.madeira2); ret(ctx, px + 18, py + 5, 10, 7, C.madeira2);
      contornoRet(ctx, px + 3, py - 15, 26, 15, METAL, C.vidro);
      ret(ctx, px + 15, py - 14, 1, 13, METAL);
      ret(ctx, px + 5, py - 12, 2, 6, C.branco); ret(ctx, px + 18, py - 12, 2, 6, C.branco);   // o brilho do vidro
      circulo(ctx, px + 9, py - 5, 2, K); circulo(ctx, px + 9, py - 5, 1, C.creme);
      ret(ctx, px + 20, py - 3, 7, 4, K); ret(ctx, px + 21, py - 2, 5, 2, C.ouro3);              // o bilhete
      contornoRet(ctx, px + 6, py - 20, 20, 6, LARANJA);
      ret(ctx, px + 9, py - 18, 3, 2, C.creme); ret(ctx, px + 13, py - 18, 6, 2, C.creme); ret(ctx, px + 20, py - 18, 3, 2, C.creme);
    } });

  /* ================= TRILHO (no chão) ================= */
  // dormentes de madeira e os dois trilhos de metal (enfeite plano: anda-se por cima)
  I.objeto('geografia-trilho', { w: 3, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 3) * 16;
      for (var x = px + 2; x < px + W - 2; x += 7) { ret(ctx, x, py + 2, 4, 12, C.madeira3); ret(ctx, x, py + 2, 4, 1, C.madeira2); }
      ret(ctx, px, py + 4, W, 2, METAL); ret(ctx, px, py + 4, W, 1, C.metal);
      ret(ctx, px, py + 10, W, 2, METAL); ret(ctx, px, py + 10, W, 1, C.metal);
    } });

  /* ================= MALAS ================= */
  // uma mala grande com a menor em cima (var.cor: a da grande)
  I.objeto('geografia-mala', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', LARANJA);
      contornoRet(ctx, px + 1, py + 3, 14, 12, c); ret(ctx, px + 2, py + 4, 12, 1, D.clarear(c, 0.3));
      ret(ctx, px + 5, py + 4, 1, 10, D.escurecer(c, 0.25)); ret(ctx, px + 10, py + 4, 1, 10, D.escurecer(c, 0.25));
      contornoRet(ctx, px + 3, py - 5, 10, 9, '#5fb4ff'); ret(ctx, px + 4, py - 4, 8, 1, '#9fdcff');
      ret(ctx, px + 6, py - 8, 4, 1, K); ret(ctx, px + 5, py - 7, 1, 2, K); ret(ctx, px + 10, py - 7, 1, 2, K);   // a alça
      ret(ctx, px + 7, py - 1, 2, 2, C.ouro);
    } });

  S.LIVROS = LIVROS; S.LARANJA = LARANJA; S.CORES_CAP = CORES_CAP;
})();
