/* Torre dos Números da Matemática do Dia a Dia (4º bimestre, docs/contratos/quarto-bimestre.md §7), parte 1 dos
   objetos (prefixo ma-): a estação de cada sala do livro (com o selo ❗/✓/🦄/◐ derivado do progresso, como a
   lp-estacao da Casa das Palavras e a torre-estacao da Torre do Relógio) e o quadro dos andares do saguão.
   Os enfeites dos capítulos (moedas, partes iguais e pesquisas) estão em matematica/ma-objetos-temas.js.
   Carrega depois de matematica/objetos-*.js (S.CORES) e antes de matematica/salas.js (o que gera as estações).
   Põe em Reino._predios.matematica: LIVROS (as cores dos dois livros da escola) e ANIL (a cor da matéria). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, matriz = D.matriz, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var S = R._predios.matematica, CO = S.CORES;   // criado pelo matematica/objetos-parede.js
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }

  // os dois livros da escola (📗 verde, 📒 amarelo: as mesmas cores da Casa das Palavras) e o anil da matéria
  var ANIL = '#4a3cc9';
  var LIVROS = {
    aprendizagem: { capa: '#3fae5a', capa2: '#2a7a3e', claro: '#a8ecb4' },
    atividades: { capa: '#ffc61a', capa2: '#c98a00', claro: '#fff0a0' },
  };
  function livroDe(o) { return LIVROS[v(o, 'livro', 'aprendizagem')] || LIVROS.aprendizagem; }

  // algarismos 3×5 (o número da primeira página da sala)
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
  // Um atril de madeira com um ábaco de três contas no pé, o livro aberto na cor do livro e o número da página;
  // o selo flutua acima do livro, à direita, sem cobrir o número
  I.objeto('ma-estacao', { w: 1, h: 1, topo: 21, solido: true, alto: true,
    chave: chaveSala,
    desenhar: function (ctx, px, py, o, P) {
      var cx = px + 8, L = livroDe(o);
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, C.madeira2);
      ret(ctx, cx - 2, py, 5, 12, K); ret(ctx, cx - 1, py, 3, 11, C.madeira); ret(ctx, cx - 1, py, 1, 11, C.madeiraClara);
      // o ábaco do pé: a vareta e três contas (vermelha, a do livro e azul)
      ret(ctx, cx - 7, py + 5, 15, 1, K);
      [[cx - 7, CO.vermelho], [cx + 3, L.capa], [cx + 6, CO.azul]].forEach(function (b) {
        ret(ctx, b[0], py + 3, 3, 5, K); ret(ctx, b[0] + 1, py + 4, 1, 3, b[1]);
      });
      ret(ctx, cx - 8, py - 4, 17, 5, K); ret(ctx, cx - 7, py - 3, 15, 3, C.madeira2); ret(ctx, cx - 7, py - 3, 15, 1, C.madeiraClara);
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
      ret(ctx, cx + 5, y + 8, 1, 3, L.capa2);   // a fitinha marcadora
      selo(ctx, px + 12, py - 17, estadoSala(P, o));
    } });

  /* ================= QUADRO DOS ANDARES (saguão) ================= */
  // a torre pintada num quadro: o telhado anil, o 3º andar (gráfico de barras), o 2º (pizza em partes iguais),
  // o 1º (moeda) e o térreo com a porta; var.cores: a parede de cada andar, de baixo para cima
  I.objeto('ma-andares', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var cores = v(o, 'cores', ['#e6e2ff', '#fff1c2', '#ffe0cc', '#dff5e6']);
      contornoRet(ctx, px + 2, py + 1, 28, 30, C.madeira2);
      ret(ctx, px + 4, py + 3, 24, 26, C.creme);
      ret(ctx, px + 4, py + 3, 24, 1, C.branco);
      triangulo(ctx, px + 8, py + 3, 16, 5, ANIL); ret(ctx, px + 15, py + 2, 2, 2, C.ouro);
      var x = px + 9, w = 14;
      for (var i = 0; i < 4; i++) {
        var y = py + 23 - i * 5;
        ret(ctx, x, y, w, 6, K); ret(ctx, x + 1, y + 1, w - 2, 4, cores[i]);
      }
      // térreo: a porta
      ret(ctx, x + 6, py + 25, 3, 4, K); ret(ctx, x + 6, py + 26, 3, 3, C.madeira);
      // 1º andar: a moeda dourada
      circulo(ctx, x + 7, py + 20, 2, K); circulo(ctx, x + 7, py + 20, 1, C.ouro);
      // 2º andar: a pizza em quatro partes
      circulo(ctx, x + 7, py + 15, 2, K); circulo(ctx, x + 7, py + 15, 1, C.laranja); ret(ctx, x + 7, py + 15, 1, 1, K);
      // 3º andar: três barrinhas
      ret(ctx, x + 4, py + 10, 2, 3, CO.azul); ret(ctx, x + 7, py + 9, 2, 4, CO.verde); ret(ctx, x + 10, py + 11, 2, 2, CO.vermelho);
    } });

  S.LIVROS = LIVROS; S.ANIL = ANIL;
})();
