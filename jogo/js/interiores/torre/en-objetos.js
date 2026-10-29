/* Torre do Relógio do English (4º bimestre, docs/contratos/quarto-bimestre.md §7): a estação de cada sala do livro
   (objeto torre-estacao, com o selo ❗/✓/🦄/◐ derivado do progresso, como a lp-estacao da Casa das Palavras).
   Carrega depois de torre/objetos.js e antes de torre/torre.js (o layout, que gera as estações dos dados).
   Põe em Reino._predios.torre: LIVROS (as cores dos dois livros: English e Projetos). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, matriz = D.matriz;
  var K = R.Desenho.K;
  var S = R._predios.torre;   // criado pelo torre/objetos.js
  var BRONZE = S.BRONZE, BRONZE2 = S.BRONZE2;
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }

  // English (📔, o rosa-framboesa da capa) e Projetos (📖, verde-água)
  var LIVROS = {
    english: { capa: '#d23c9b', capa2: '#9a2370', claro: '#ffc2e4' },
    projetos: { capa: '#2f9f8f', capa2: '#1f6f64', claro: '#b8eee4' },
  };
  function livroDe(o) { return LIVROS[v(o, 'livro', 'english')] || LIVROS.english; }

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
  // var: { livro: 'english'|'projetos', pagina } ; acao: { tipo: 'sala', materia, sala } (o selo lê a sala dela).
  // Um atril de relojoeiro: pé de bronze com uma engrenagem, o livro aberto na cor do livro e o número da página;
  // o selo flutua acima do livro, à direita, sem cobrir o número
  I.objeto('torre-estacao', { w: 1, h: 1, topo: 21, solido: true, alto: true,
    chave: chaveSala,
    desenhar: function (ctx, px, py, o, P) {
      var cx = px + 8, L = livroDe(o);
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, BRONZE2);
      ret(ctx, cx - 2, py, 5, 12, K); ret(ctx, cx - 1, py, 3, 11, BRONZE); ret(ctx, cx - 1, py, 1, 11, '#f0c078');
      circulo(ctx, cx, py + 6, 3, K); circulo(ctx, cx, py + 6, 2, L.capa); ret(ctx, cx, py + 6, 1, 1, C.creme);   // engrenagem na cor do livro
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
      else if (p.length === 3) { ret(ctx, cx - 6, y + 1, 13, 6, C.creme); numero(ctx, cx - 5, y + 1, p, '#5a4a6a'); }   // 3 algarismos: no meio do livro
      else { ret(ctx, cx + 2, y + 2, 5, 1, L.claro); ret(ctx, cx + 2, y + 4, 4, 1, L.claro); }
      ret(ctx, cx + 5, y + 8, 1, 3, L.capa2);   // a fitinha marcadora
      selo(ctx, px + 12, py - 17, estadoSala(P, o));
    } });

  S.LIVROS = LIVROS;
})();
