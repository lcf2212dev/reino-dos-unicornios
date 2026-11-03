/* Museu das Memórias, História da Gente (4º bimestre, docs/contratos/quarto-bimestre.md §7): a estação de cada sala
   do livro (objeto museu-estacao, com o selo ❗/✓/🦄/◐ derivado do progresso, como a torre-estacao da Torre do Relógio)
   e as peças dos capítulos: vassoura e pá (cap. 10, cada um faz sua parte), caixote de leite (cap. 10, do campo à
   mesa), câmera antiga do fotógrafo (cap. 11, profissões do passado) e lixeiras da coleta seletiva (cap. 12).
   Carrega depois de museu/objetos-acervo.js e antes de museu/museu.js (o layout, que gera as estações dos dados).
   Põe em Reino._predios.museu: LIVROS_HI (as cores dos dois livros: Aprendizagem e Atividades). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, matriz = D.matriz;
  var K = R.Desenho.K;
  var S = R._predios.museu;   // criado pelo museu/objetos.js
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  var MARMORE = '#eeeaf4', MARMORE2 = '#c9c4d8', ARDOSIA = '#6c6f86';

  // Livro de Aprendizagem (📗, verde) e Livro de Atividades (📒, amarelo)
  var LIVROS = {
    aprendizagem: { capa: '#3fae5a', capa2: '#2a7a3e', claro: '#c8f0d0' },
    atividades: { capa: '#ffc61a', capa2: '#c98a00', claro: '#fff0b0' },
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
  // o selo redondo: ❗ nova, ✓ feita, 🦄 raro ganho, ◐ em andamento (as mesmas marcas da Torre e da Casa)
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
  // Uma coluna de mármore do museu com a plaquinha de bronze e, em cima, o livro aberto na cor do livro e o número
  // da página; o selo flutua acima do livro, à direita, sem cobrir o número
  I.objeto('museu-estacao', { w: 1, h: 1, topo: 21, solido: true, alto: true,
    chave: chaveSala,
    desenhar: function (ctx, px, py, o, P) {
      var cx = px + 8, L = livroDe(o);
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, MARMORE2);
      ret(ctx, cx - 4, py, 9, 12, K); ret(ctx, cx - 3, py, 7, 11, MARMORE); ret(ctx, cx - 3, py, 1, 11, C.branco);
      ret(ctx, cx + 2, py, 1, 11, MARMORE2); ret(ctx, cx - 1, py + 1, 1, 9, MARMORE2);   // as caneluras da coluna
      ret(ctx, cx - 2, py + 5, 5, 3, K); ret(ctx, cx - 1, py + 6, 3, 1, C.ouro);          // a plaquinha de bronze
      ret(ctx, cx - 8, py - 4, 17, 5, K); ret(ctx, cx - 7, py - 3, 15, 3, ARDOSIA); ret(ctx, cx - 7, py - 3, 15, 1, MARMORE2);
      // o livro aberto: páginas creme, a capa por baixo e o número da página à direita
      var y = py - 12;
      ret(ctx, cx - 8, y, 17, 9, K);
      ret(ctx, cx - 7, y + 7, 15, 1, L.capa);
      ret(ctx, cx - 7, y + 1, 7, 6, C.creme); ret(ctx, cx + 1, y + 1, 7, 6, C.creme);
      ret(ctx, cx, y + 1, 1, 7, L.capa2);
      ret(ctx, cx - 6, y + 2, 5, 1, L.claro); ret(ctx, cx - 6, y + 4, 4, 1, L.claro); ret(ctx, cx - 6, y + 6, 5, 1, L.claro);
      var p = String(v(o, 'pagina', ''));
      if (p && p.length <= 2) numero(ctx, cx + 1 + Math.floor((7 - (p.length * 4 - 1)) / 2), y + 1, p, '#5a4a6a');
      else if (p.length === 3) { ret(ctx, cx - 6, y + 1, 13, 6, C.creme); numero(ctx, cx - 5, y + 1, p, '#5a4a6a'); }
      else { ret(ctx, cx + 2, y + 2, 5, 1, L.claro); ret(ctx, cx + 2, y + 4, 4, 1, L.claro); }
      ret(ctx, cx + 5, y + 8, 1, 3, L.capa2);   // a fitinha marcadora
      selo(ctx, px + 12, py - 17, estadoSala(P, o));
    } });

  /* ================= AS PEÇAS DOS CAPÍTULOS ================= */
  // cap. 10: vassoura encostada num balde, com a pazinha (em casa, cada um faz sua parte)
  I.objeto('museu-vassoura', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // o cabo, inclinado para a direita
      for (var i = 0; i < 18; i++) { ret(ctx, cx - 4 + Math.floor(i / 3), py - 14 + i, 3, 1, K); }
      for (var j = 0; j < 17; j++) { ret(ctx, cx - 3 + Math.floor(j / 3), py - 13 + j, 1, 1, C.madeira); }
      // a palha da vassoura
      ret(ctx, cx - 1, py + 3, 9, 3, K); ret(ctx, cx - 2, py + 6, 11, 8, K);
      ret(ctx, cx, py + 4, 7, 2, '#c8701a'); ret(ctx, cx - 1, py + 7, 9, 6, '#ffd34d');
      ret(ctx, cx + 1, py + 7, 1, 6, '#e0a800'); ret(ctx, cx + 4, py + 7, 1, 6, '#e0a800');
      // a pazinha azul, no chão à esquerda
      ret(ctx, cx - 8, py + 9, 6, 6, K); ret(ctx, cx - 7, py + 10, 4, 4, '#5fb4ff'); ret(ctx, cx - 7, py + 10, 4, 1, '#9fdcff');
      ret(ctx, cx - 6, py + 5, 2, 5, K); ret(ctx, cx - 5, py + 6, 1, 3, '#2f6fd6');
    } });
  // cap. 10: caixote de madeira com garrafas de leite (do campo até a mesa)
  I.objeto('museu-leite', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      // três garrafas de vidro: leite branco e tampinha azul
      [2, 6, 10].forEach(function (x, i) {
        var t = i === 1 ? 1 : 0;
        ret(ctx, px + x, py - 6 - t, 5, 11, K); ret(ctx, px + x + 1, py - 5 - t, 3, 9, C.branco);
        ret(ctx, px + x + 1, py - 7 - t, 3, 2, K); ret(ctx, px + x + 1, py - 8 - t, 3, 1, '#2f6fd6');
        ret(ctx, px + x + 1, py - 4 - t, 1, 3, '#dfe8f5');
      });
      // o caixote
      ret(ctx, px + 1, py + 2, 14, 13, K); ret(ctx, px + 2, py + 3, 12, 11, C.madeira);
      ret(ctx, px + 2, py + 3, 12, 1, C.madeiraClara); ret(ctx, px + 2, py + 8, 12, 1, C.madeira3);
      ret(ctx, px + 6, py + 5, 4, 2, C.creme); ret(ctx, px + 7, py + 5, 2, 1, '#2f6fd6');   // a etiqueta "LEITE"
    } });
  // cap. 11: câmera antiga de fole no tripé, com o pano preto do fotógrafo
  I.objeto('museu-camera', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // o tripé de madeira
      ret(ctx, cx - 1, py - 2, 3, 16, K); ret(ctx, cx, py - 2, 1, 15, C.madeira);
      for (var i = 0; i < 12; i++) {
        ret(ctx, cx - 2 - Math.floor(i / 2), py + 2 + i, 2, 1, K); ret(ctx, cx + 1 + Math.floor(i / 2), py + 2 + i, 2, 1, K);
      }
      // a caixa da câmera, o fole sanfonado e a lente
      ret(ctx, cx - 7, py - 12, 9, 10, K); ret(ctx, cx - 6, py - 11, 7, 8, C.madeira2); ret(ctx, cx - 6, py - 11, 7, 1, C.madeiraClara);
      ret(ctx, cx + 1, py - 11, 4, 8, K); ret(ctx, cx + 2, py - 10, 2, 6, '#3a3a4a'); ret(ctx, cx + 2, py - 8, 2, 1, '#6a6a7a');
      circulo(ctx, cx + 6, py - 7, 3, K); circulo(ctx, cx + 6, py - 7, 2, C.metal2); ret(ctx, cx + 6, py - 8, 1, 1, C.branco);
      // o pano preto caindo atrás
      ret(ctx, cx - 9, py - 13, 4, 12, K); ret(ctx, cx - 8, py - 12, 2, 10, '#4a3a5a');
      ret(ctx, cx - 4, py - 14, 3, 2, K); ret(ctx, cx - 3, py - 14, 1, 1, C.ouro);   // o botãozinho
    },
    anim: function (ctx, px, py, t) {
      if (Math.floor(t / 300) % 12 === 0) { ret(ctx, px + 13, py - 12, 1, 3, C.ouro3); ret(ctx, px + 12, py - 11, 3, 1, C.ouro3); }   // o flash
    } });
  // cap. 12: as quatro lixeiras da coleta seletiva (papel, plástico, vidro e metal)
  var LIXEIRAS = ['#2f6fd6', '#e0433f', '#3fae5a', '#ffc61a'];
  I.objeto('museu-lixeiras', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      LIXEIRAS.forEach(function (c, i) {
        var x = px + 1 + i * 8;
        ret(ctx, x, py - 4, 7, 19, K); ret(ctx, x + 1, py - 3, 5, 17, c);
        ret(ctx, x + 1, py - 3, 1, 17, D.clarear(c, 0.35)); ret(ctx, x + 5, py - 3, 1, 17, D.escurecer(c, 0.2));
        ret(ctx, x - 1, py - 8, 9, 4, K); ret(ctx, x, py - 7, 7, 2, D.escurecer(c, 0.15));   // a tampa
        ret(ctx, x + 2, py - 10, 3, 2, K);
        // a setinha da reciclagem
        ret(ctx, x + 2, py + 2, 3, 1, C.branco); ret(ctx, x + 2, py + 3, 1, 2, C.branco); ret(ctx, x + 4, py + 3, 1, 2, C.branco);
      });
    } });

  S.LIVROS_HI = LIVROS;
})();
