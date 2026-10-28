/* Língua Portuguesa do 4º bimestre (Casa das Palavras), parte 1 dos objetos (prefixo lp-): as estações das salas (com o
   selo ❗/✓/🦄/◐), os púlpitos dos dois livros, o mapa da casa (os dois andares) e o que mora nos ateliês. Os enfeites dos capítulos estão em
   portugues/lp-objetos-temas.js; o layout, em portugues/portugues.js.
   Divide em Reino._predios.portugues.lp: LIVROS (cores de cada livro), livroAberto e numero (algarismos 3×5). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, contornoRet = D.contornoRet, matriz = D.matriz;
  var K = R.Desenho.K, misturar = R.Desenho.misturar;
  var S = (R._predios = R._predios || {}).portugues = R._predios.portugues || {};
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }

  // cores dos dois livros da escola (📗 verde, 📒 amarelo) e o roxo da matéria
  var ROXO = '#8e4fd6';
  var LIVROS = {
    aprendizagem: { capa: '#3fae5a', capa2: '#2a7a3e', claro: '#a8ecb4' },
    atividades: { capa: '#ffc61a', capa2: '#c98a00', claro: '#fff0a0' },
  };
  function livroDe(o) { return LIVROS[v(o, 'livro', 'aprendizagem')] || LIVROS.aprendizagem; }

  // algarismos 3×5 (o número da página no livro aberto)
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
  // livro aberto de 17×9 (topo em y): páginas creme, a capa do livro por baixo e o número da página à direita
  function livroAberto(ctx, cx, y, L, pagina) {
    ret(ctx, cx - 8, y, 17, 9, K);
    ret(ctx, cx - 7, y + 7, 15, 1, L.capa);
    ret(ctx, cx - 7, y + 1, 7, 6, C.creme); ret(ctx, cx + 1, y + 1, 7, 6, C.creme);
    ret(ctx, cx, y + 1, 1, 7, L.capa2);
    ret(ctx, cx - 6, y + 2, 5, 1, '#c8b8d8'); ret(ctx, cx - 6, y + 4, 4, 1, '#c8b8d8'); ret(ctx, cx - 6, y + 6, 5, 1, '#c8b8d8');
    var p = String(pagina || '');
    if (p && p.length <= 2) numero(ctx, cx + 1 + Math.floor((7 - (p.length * 4 - 1)) / 2), y + 1, p, '#5a4a6a');
    else { ret(ctx, cx + 2, y + 2, 5, 1, '#c8b8d8'); ret(ctx, cx + 2, y + 4, 4, 1, '#c8b8d8'); }
    ret(ctx, cx + 5, y + 8, 1, 3, ROXO);   // a fitinha marcadora
  }

  /* ---------- estado da sala (como o status dos NPCs de sala, npcs-e-dialogo.md §4) ---------- */
  // as etapas da sala (quarto-bimestre.md §13.2), se a API estiver no jogo
  function etapas(a) {
    try { return R.Etapas && R.Etapas.estado && a.materia && a.sala ? R.Etapas.estado(a.materia, a.sala) : null; } catch (e) { return null; }
  }
  function estadoSala(P, o) {
    var a = o.acao || {}, m = a.materia && R.materia(a.materia);
    var s = m && (m.salas || []).find(function (x) { return x.id === a.sala; });
    if (!s || !P || !P.estado) return 'nova';
    var et = etapas(a);
    var feita = !!(P.estado().salas[s.id] || {}).feita;
    if (et && et.emAndamento && !feita) return 'andamento';   // 1ª trilha começada e falta etapa: ◐ (sala feita fica ✓/🦄)
    var raro = (m.unicornios || []).find(function (u) { return u.raridade === 'raro' && u.sala === s.id; });
    if (raro && P.temUni(raro.id)) return 'raro';
    return feita ? 'feita' : 'nova';
  }
  // a chave do pré-render: o selo e as etapas feitas (muda a cada etapa guardada)
  function chaveSala(P, o) {
    var et = P && P.estado ? etapas(o.acao || {}) : null;
    return estadoSala(P, o) + (et ? ':' + (et.feitas || []).length + '/' + (et.perfeitas || []).length + '/' + et.total : '');
  }
  // o selo redondo: ❗ nova (branco, ponto vermelho), ✓ feita (verde), 🦄 raro ganho (rosa, chifre dourado),
  // ◐ em andamento (branco, metade esquerda laranja)
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
  // O selo flutua acima do livro, à direita (como o balãozinho dos NPCs), sem cobrir o número da página
  I.objeto('lp-estacao', { w: 1, h: 1, topo: 21, solido: true, alto: true,
    chave: chaveSala,
    desenhar: function (ctx, px, py, o, P) {
      var cx = px + 8, L = livroDe(o);
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, C.madeira3);
      ret(ctx, cx - 2, py, 5, 12, K); ret(ctx, cx - 1, py, 3, 11, C.madeira); ret(ctx, cx - 1, py, 1, 11, C.madeiraClara);
      ret(ctx, cx - 1, py + 4, 3, 3, L.capa);   // plaquinha na cor do livro
      ret(ctx, cx - 8, py - 4, 17, 5, K); ret(ctx, cx - 7, py - 3, 15, 3, C.madeira2); ret(ctx, cx - 7, py - 3, 15, 1, C.madeiraClara);
      livroAberto(ctx, cx, py - 12, L, v(o, 'pagina', ''));
      selo(ctx, px + 12, py - 17, estadoSala(P, o));   // acima do livro: o número da página fica à mostra
    } });

  /* ================= PÚLPITO DE UM LIVRO (saguão) ================= */
  // o livro em pé, de capa para a frente: verde (Aprendizagem, com um livrinho) ou amarelo (Atividades, com um lápis)
  I.objeto('lp-pulpito', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, L = livroDe(o);
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, C.madeira3);
      ret(ctx, cx - 3, py + 1, 7, 11, K); ret(ctx, cx - 2, py + 1, 5, 10, C.madeira); ret(ctx, cx - 2, py + 1, 1, 10, C.madeiraClara);
      ret(ctx, cx - 8, py - 2, 17, 4, K); ret(ctx, cx - 7, py - 1, 15, 2, C.madeira2);
      ret(ctx, cx - 7, py - 20, 14, 19, K);
      ret(ctx, cx - 6, py - 19, 12, 17, L.capa); ret(ctx, cx - 6, py - 19, 2, 17, L.capa2);
      ret(ctx, cx + 5, py - 18, 1, 15, C.creme);
      ret(ctx, cx - 3, py - 17, 7, 3, C.creme); ret(ctx, cx - 2, py - 16, 5, 1, L.capa2);
      if (v(o, 'livro', '') === 'atividades') {
        matriz(ctx, cx - 3, py - 12, ['.....kk', '....kpk', '...kyk.', '..kyk..', '.kyk...', 'kkk....', 'k......'],
          { k: K, p: C.rosa, y: '#ff8a3d' });
      } else {
        matriz(ctx, cx - 3, py - 12, ['kkk.kkk', 'kwwkwwk', 'kwwkwwk', 'kwwkwwk', '.kkkkk.'], { k: K, w: C.branco });
      }
      ret(ctx, cx - 3, py - 4, 7, 1, L.claro);
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 280) % 9;
      if (f < 3) { ret(ctx, px + 2 + f * 5, py - 22 - f, 1, 3, C.ouro3); ret(ctx, px + 1 + f * 5, py - 21 - f, 3, 1, C.ouro3); }
    } });

  /* ================= MAPA DA CASA ================= */
  // as duas plantas lado a lado. À esquerda, o térreo: Salas de Leitura e galerias (verdes) e o saguão (roxo), com a
  // escada e o "você está aqui"; à direita, o 1º andar: ateliês (amarelos), o Cantinho do Respiro (verde-água) e a
  // Galeria dos Tesouros (dourada), com a escada no ateliê do meio
  var COLS = [[1, 3], [5, 2], [8, 3]];   // as três colunas de cômodos de cada planta (x, largura), dentro de 12 px
  function escadinha(ctx, x, y) { ret(ctx, x, y + 2, 1, 1, C.branco); ret(ctx, x + 1, y + 1, 1, 1, C.branco); ret(ctx, x + 2, y, 1, 1, C.branco); }
  I.objeto('lp-mapa', { w: 2, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py, 3, 15, K); ret(ctx, px + 25, py, 3, 15, K);
      ret(ctx, px + 5, py, 1, 14, C.madeira); ret(ctx, px + 26, py, 1, 14, C.madeira);
      contornoRet(ctx, px + 1, py - 14, 30, 16, C.madeira2);
      ret(ctx, px + 3, py - 12, 26, 12, C.creme);
      // térreo (x 3–14)
      var x0 = px + 3, y0 = py - 12;
      ret(ctx, x0, y0, 12, 12, K);
      for (var i = 0; i < 3; i++) {
        var x = x0 + COLS[i][0], w = COLS[i][1];
        ret(ctx, x, y0 + 1, w, 2, LIVROS.aprendizagem.claro);   // Sala de Leitura
        ret(ctx, x, y0 + 4, w, 3, LIVROS.aprendizagem.capa);    // galeria
        ret(ctx, x + 1, y0 + 3, 1, 1, C.creme); ret(ctx, x + 1, y0 + 7, 1, 1, C.creme);   // portas
      }
      ret(ctx, x0 + 1, y0 + 8, 10, 3, '#b58cff');                // saguão
      escadinha(ctx, x0 + 7, y0 + 8);
      ret(ctx, x0 + 5, y0 + 9, 2, 2, C.vermelho);                // você está aqui
      // 1º andar (x 17–28)
      var x1 = px + 17;
      ret(ctx, x1, y0, 12, 12, K);
      for (var j = 0; j < 3; j++) ret(ctx, x1 + COLS[j][0], y0 + 1, COLS[j][1], 5, LIVROS.atividades.capa);
      escadinha(ctx, x1 + 5, y0 + 3);
      ret(ctx, x1 + 1, y0 + 7, 5, 4, '#9fd8c8');                 // Cantinho do Respiro
      ret(ctx, x1 + 7, y0 + 7, 4, 4, C.ouro);                    // Galeria dos Tesouros
      ret(ctx, x1 + 2, y0 + 6, 1, 1, C.creme); ret(ctx, x1 + 9, y0 + 6, 1, 1, C.creme); ret(ctx, x1 + 6, y0 + 8, 1, 2, C.creme);
      // a setinha do térreo para o 1º andar
      ret(ctx, px + 15, py - 7, 2, 1, C.ouro3 || C.ouro); ret(ctx, px + 16, py - 8, 1, 3, C.ouro3 || C.ouro);
      ret(ctx, px + 1, py - 15, 30, 2, K); ret(ctx, px + 2, py - 14, 28, 1, C.ouro);
    } });

  /* ================= ATELIÊ (Livro de Atividades) ================= */
  // mesa de trabalho com o caderno amarelo aberto, lápis e borracha
  I.objeto('lp-mesa-atividades', { w: 2, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16, A = LIVROS.atividades;
      ret(ctx, px + 3, py + 3, 3, 12, K); ret(ctx, px + W - 6, py + 3, 3, 12, K);
      ret(ctx, px + 4, py + 3, 1, 11, C.madeira); ret(ctx, px + W - 5, py + 3, 1, 11, C.madeira3);
      ret(ctx, px + 1, py - 2, W - 2, 6, K); ret(ctx, px + 2, py - 1, W - 4, 3, C.madeiraClara);
      ret(ctx, px + 2, py + 2, W - 4, 1, C.madeira2);
      ret(ctx, px + 5, py - 6, 15, 6, K); ret(ctx, px + 6, py - 2, 13, 1, A.capa);
      ret(ctx, px + 6, py - 5, 6, 3, C.creme); ret(ctx, px + 13, py - 5, 6, 3, C.creme); ret(ctx, px + 12, py - 5, 1, 4, A.capa2);
      ret(ctx, px + 7, py - 4, 4, 1, '#c8b8d8'); ret(ctx, px + 14, py - 4, 3, 1, '#c8b8d8');
      ret(ctx, px + 22, py - 3, 7, 2, K); ret(ctx, px + 23, py - 3, 4, 1, '#ff8a3d'); ret(ctx, px + 27, py - 3, 1, 1, C.rosa);
      ret(ctx, px + 22, py - 1, 3, 2, K); ret(ctx, px + 23, py - 1, 1, 1, C.rosa2);
    } });
  // pote de lápis de cor e gizes de cera
  I.objeto('lp-potes', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      var cores = ['#e0433f', '#ffc61a', '#3fae5a', '#5fb4ff', ROXO];
      cores.forEach(function (c, i) { ret(ctx, px + 4 + i * 2, py - 5 + (i % 2) * 2, 2, 9, K); ret(ctx, px + 4 + i * 2, py - 4 + (i % 2) * 2, 1, 7, c); });
      contornoRet(ctx, px + 3, py + 3, 11, 12, '#5fb4ff');
      ret(ctx, px + 4, py + 4, 2, 10, '#9fdcff'); ret(ctx, px + 4, py + 8, 9, 2, C.ouro);
    } });
  // varal de desenhos na parede (sol, casinha, coração) e uma folha amarela de atividade
  I.objeto('lp-varal', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      for (var x = px + 1; x < px + 31; x++) ret(ctx, x, py + 8 + Math.round(Math.sin((x - px) / 30 * Math.PI) * 2), 1, 1, C.madeira3);
      var folhas = [[px + 2, C.branco], [px + 10, C.branco], [px + 18, LIVROS.atividades.claro], [px + 25, C.branco]];
      folhas.forEach(function (f, i) {
        var y = py + 10 + (i === 1 || i === 2 ? 2 : 1);
        contornoRet(ctx, f[0], y, 6, 8, f[1]);
        ret(ctx, f[0] + 2, y - 1, 2, 2, ['#e0433f', '#5fb4ff', ROXO, '#3fae5a'][i]);
      });
      circulo(ctx, px + 5, py + 15, 1, C.ouro);
      ret(ctx, px + 11, py + 15, 4, 3, '#ff8a3d'); ret(ctx, px + 12, py + 14, 2, 1, '#e0433f');
      ret(ctx, px + 19, py + 14, 3, 1, '#c8b8d8'); ret(ctx, px + 19, py + 16, 4, 1, '#c8b8d8');
      ret(ctx, px + 26, py + 14, 1, 1, C.rosa); ret(ctx, px + 28, py + 14, 1, 1, C.rosa); ret(ctx, px + 26, py + 15, 3, 1, C.rosa); ret(ctx, px + 27, py + 16, 1, 1, C.rosa);
    } });
  // cartaz do alfabeto: "Aa" grande na cor da matéria, com linhas de caderno
  I.objeto('lp-cartaz-abc', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', ROXO);
      contornoRet(ctx, px + 1, py + 7, 14, 18, C.creme);
      ret(ctx, px + 2, py + 20, 12, 1, '#9fdcff'); ret(ctx, px + 2, py + 23, 12, 1, '#9fdcff');
      matriz(ctx, px + 3, py + 10, ['.cc.....', 'c..c....', 'cccc.cc.', 'c..cc.c.', 'c..c.ccc'], { c: c });
      ret(ctx, px + 4, py + 7, 2, 2, C.vermelho); ret(ctx, px + 10, py + 7, 2, 2, '#5fb4ff');
      ret(ctx, px + 3, py + 17, 9, 1, misturar(c, C.branco, 0.5));
    } });

  S.lp = { LIVROS: LIVROS, ROXO: ROXO, livroAberto: livroAberto, numero: numero };
})();
