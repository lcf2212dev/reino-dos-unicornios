/* Laboratório de Ciências do 4º bimestre (Ciências da Natureza, 3º andar do Observatório): os objetos novos.
   A estação de cada sala do livro (ci-estacao, com o selo ❗/✓/🦄/◐ derivado do progresso, como a torre-estacao),
   o púlpito de cada livro, o mapa do andar e os enfeites das plantas. Prefixo ci-.
   Carrega depois dos lab-objetos-*.js (usa Reino._predios.observatorio.lab) e antes do lab-andar3.js (o layout).
   Põe em Reino._predios.observatorio.ci: LIVROS (as cores dos dois livros). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, matriz = D.matriz;
  var K = R.Desenho.K;
  var S = R._predios.observatorio, L0 = S.lab;   // L0: as cores do laboratório (lab-objetos-1.js)
  var AGUA = L0.AGUA, AGUA2 = L0.AGUA2, FOLHA = L0.FOLHA, FOLHA2 = L0.FOLHA2, TERRA = L0.TERRA, TERRA2 = L0.TERRA2;
  var VIDRO = L0.VIDRO, AMARELO = L0.AMARELO, v = L0.v;

  // Aprendizagem (📗, verde) e Atividades (📒, amarelo)
  var LIVROS = {
    aprendizagem: { capa: '#3fae5a', capa2: '#2a7a3e', claro: '#c8f0cc' },
    atividades: { capa: '#f0b020', capa2: '#b07a10', claro: '#ffe9a8' },
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
  // o selo redondo: ❗ nova, ✓ feita, 🦄 raro ganho, ◐ em andamento (as mesmas marcas da Casa e da Torre)
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
  // folhinha de duas pontas (centro em cx, cy)
  function folha(ctx, cx, cy, cor) { elipse(ctx, cx, cy, 3, 2, K); elipse(ctx, cx, cy, 2, 1, cor || FOLHA); }

  /* ================= ESTAÇÃO DA SALA ================= */
  // var: { livro: 'aprendizagem'|'atividades', pagina } ; acao: { tipo: 'sala', materia, sala } (o selo lê a sala dela).
  // Um atril de laboratório: pé verde-água com um brotinho, o livro aberto na cor do livro e o número da página;
  // o selo flutua acima do livro, à direita, sem cobrir o número
  I.objeto('ci-estacao', { w: 1, h: 1, topo: 21, solido: true, alto: true,
    chave: chaveSala,
    desenhar: function (ctx, px, py, o, P) {
      var cx = px + 8, L = livroDe(o);
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, AGUA2);
      ret(ctx, cx - 2, py, 5, 12, K); ret(ctx, cx - 1, py, 3, 11, AGUA); ret(ctx, cx - 1, py, 1, 11, '#bff0ea');
      folha(ctx, cx - 4, py + 6, FOLHA); folha(ctx, cx + 5, py + 4, L.capa);   // o brotinho que sobe pelo pé
      ret(ctx, cx - 8, py - 4, 17, 5, K); ret(ctx, cx - 7, py - 3, 15, 3, C.branco); ret(ctx, cx - 7, py - 1, 15, 1, '#d6eef8');
      // o livro aberto: páginas creme, a capa por baixo e o número da página à direita
      var y = py - 12;
      ret(ctx, cx - 8, y, 17, 9, K);
      ret(ctx, cx - 7, y + 7, 15, 1, L.capa);
      ret(ctx, cx - 7, y + 1, 7, 6, C.creme); ret(ctx, cx + 1, y + 1, 7, 6, C.creme);
      ret(ctx, cx, y + 1, 1, 7, L.capa2);
      ret(ctx, cx - 6, y + 2, 5, 1, L.claro); ret(ctx, cx - 6, y + 4, 4, 1, L.claro); ret(ctx, cx - 6, y + 6, 5, 1, L.claro);
      var p = String(v(o, 'pagina', ''));
      if (p && p.length <= 2) numero(ctx, cx + 1 + Math.floor((7 - (p.length * 4 - 1)) / 2), y + 1, p, '#5a4a6a');
      else if (p.length === 3) { ret(ctx, cx - 6, y + 1, 13, 6, C.creme); numero(ctx, cx - 5, y + 1, p, '#5a4a6a'); }   // 3 algarismos: no meio
      else { ret(ctx, cx + 2, y + 2, 5, 1, L.claro); ret(ctx, cx + 2, y + 4, 4, 1, L.claro); }
      ret(ctx, cx + 5, y + 8, 1, 3, L.capa2);   // a fitinha marcadora
      selo(ctx, px + 12, py - 17, estadoSala(P, o));
    } });

  /* ================= PÚLPITO DE UM LIVRO (hall) ================= */
  // o livro em pé, de capa para a frente: verde (Aprendizagem, com uma folha) ou amarelo (Atividades, com um lápis)
  I.objeto('ci-pulpito', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, L = livroDe(o);
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, AGUA2);
      ret(ctx, cx - 3, py + 1, 7, 11, K); ret(ctx, cx - 2, py + 1, 5, 10, AGUA); ret(ctx, cx - 2, py + 1, 1, 10, '#bff0ea');
      ret(ctx, cx - 8, py - 2, 17, 4, K); ret(ctx, cx - 7, py - 1, 15, 2, C.branco);
      ret(ctx, cx - 7, py - 20, 14, 19, K);
      ret(ctx, cx - 6, py - 19, 12, 17, L.capa); ret(ctx, cx - 6, py - 19, 2, 17, L.capa2);
      ret(ctx, cx + 5, py - 18, 1, 15, C.creme);
      ret(ctx, cx - 3, py - 17, 7, 3, C.creme); ret(ctx, cx - 2, py - 16, 5, 1, L.capa2);
      if (v(o, 'livro', '') === 'atividades') {
        matriz(ctx, cx - 3, py - 12, ['.....kk', '....kpk', '...kyk.', '..kyk..', '.kyk...', 'kkk....', 'k......'],
          { k: K, p: C.rosa, y: '#ff8a3d' });
      } else {
        matriz(ctx, cx - 3, py - 12, ['...kk..', '..kggk.', '.kgggk.', '.kgggk.', '..kgk..', '...k...', '...k...'],
          { k: K, g: '#8fe08a' });
      }
      ret(ctx, cx - 3, py - 4, 7, 1, L.claro);
    } });

  /* ================= MAPA DO LABORATÓRIO (hall) ================= */
  // a planta do andar, de cima: em baixo as galerias verdes e o hall; em cima as estufas amarelas e as experiências
  I.objeto('ci-mapa', { w: 2, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py, 3, 15, K); ret(ctx, px + 25, py, 3, 15, K);
      ret(ctx, px + 5, py, 1, 14, C.metal2); ret(ctx, px + 26, py, 1, 14, C.metal2);
      ret(ctx, px + 1, py - 15, 30, 17, K); ret(ctx, px + 2, py - 14, 28, 15, C.creme);
      ret(ctx, px + 2, py - 14, 28, 2, AGUA);
      var x0 = px + 3, y0 = py - 11;
      for (var i = 0; i < 4; i++) {
        var x = x0 + i * 7, meio = i === 1;
        ret(ctx, x, y0, 6, 5, K); ret(ctx, x + 1, y0 + 1, 4, 3, meio ? '#bff0ea' : LIVROS.atividades.claro);
        ret(ctx, x, y0 + 6, 6, 5, K); ret(ctx, x + 1, y0 + 7, 4, 3, meio ? C.branco : LIVROS.aprendizagem.capa);
        ret(ctx, x + 2, y0 + 5, 2, 1, C.creme);   // a porta entre a galeria e a estufa
      }
      ret(ctx, x0 + 9, y0 + 8, 2, 2, C.vermelho);   // você está aqui (o hall)
      ret(ctx, x0 + 6, y0 + 8, 1, 1, C.creme); ret(ctx, x0 + 13, y0 + 8, 1, 1, C.creme); ret(ctx, x0 + 20, y0 + 8, 1, 1, C.creme);
    } });

  /* ================= ENFEITES DAS PLANTAS ================= */
  // cartaz das partes da planta (parede, 1×2): flor, folhas, caule, fruto e raízes embaixo da terra
  I.objeto('ci-cartaz-partes', { w: 1, h: 2, parede: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 2, 14, 26, K); ret(ctx, px + 2, py + 3, 12, 24, C.creme);
      ret(ctx, px + 2, py + 19, 12, 8, '#c8a070');                       // a terra
      ret(ctx, px + 7, py + 9, 2, 11, FOLHA2);                           // o caule
      folha(ctx, px + 4, py + 13, FOLHA); folha(ctx, px + 12, py + 11, FOLHA);
      circulo(ctx, px + 8, py + 7, 3, K); circulo(ctx, px + 8, py + 7, 2, C.rosa); ret(ctx, px + 8, py + 7, 1, 1, AMARELO);   // a flor
      circulo(ctx, px + 12, py + 16, 2, K); ret(ctx, px + 11, py + 15, 2, 2, C.vermelho);   // o fruto
      ret(ctx, px + 7, py + 20, 2, 3, TERRA2); ret(ctx, px + 5, py + 22, 2, 3, TERRA2); ret(ctx, px + 9, py + 22, 3, 1, TERRA2);   // as raízes
      ret(ctx, px + 4, py + 25, 1, 1, TERRA2); ret(ctx, px + 11, py + 24, 1, 2, TERRA2);
    } });
  // girassol alto num vaso de barro
  I.objeto('ci-girassol', { w: 1, h: 1, topo: 26, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 6, 10, 9, K); ret(ctx, px + 4, py + 7, 8, 7, C.terracota); ret(ctx, px + 2, py + 5, 12, 3, K); ret(ctx, px + 3, py + 6, 10, 1, C.terracota2);
      ret(ctx, px + 7, py - 14, 2, 20, K); ret(ctx, px + 7, py - 13, 1, 18, FOLHA2);
      folha(ctx, px + 4, py - 2, FOLHA); folha(ctx, px + 12, py - 6, FOLHA);
      circulo(ctx, px + 8, py - 18, 7, K); circulo(ctx, px + 8, py - 18, 6, AMARELO);
      for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; ret(ctx, Math.round(px + 8 + Math.cos(a) * 5), Math.round(py - 18 + Math.sin(a) * 5), 1, 1, C.ouro2); }
      circulo(ctx, px + 8, py - 18, 3, TERRA2); ret(ctx, px + 7, py - 19, 1, 1, TERRA);
    } });
  // vaso de vidro: dá para ver as raízes dentro da terra
  I.objeto('ci-vaso-raizes', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 1, 10, 14, K); ret(ctx, px + 4, py + 2, 8, 12, VIDRO);
      ret(ctx, px + 4, py + 6, 8, 8, '#c8a070');
      ret(ctx, px + 7, py + 6, 2, 4, TERRA2); ret(ctx, px + 5, py + 9, 2, 3, TERRA2); ret(ctx, px + 9, py + 10, 2, 3, TERRA2); ret(ctx, px + 8, py + 12, 1, 2, TERRA2);
      ret(ctx, px + 7, py - 6, 2, 8, FOLHA2); folha(ctx, px + 4, py - 5, FOLHA); folha(ctx, px + 12, py - 8, FOLHA);
      ret(ctx, px + 4, py + 2, 1, 4, C.branco);
    } });
  // potinhos de sementes (feijão, milho e girassol) numa bandeja
  I.objeto('ci-sementes', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 11, 14, 4, K); ret(ctx, px + 2, py + 12, 12, 2, C.madeiraClara);
      var cores = [['#7a3a2a', '#a0543a'], [AMARELO, C.ouro2], ['#5a4a3a', C.creme2]];
      for (var i = 0; i < 3; i++) {
        var x = px + 2 + i * 4;
        ret(ctx, x, py + 4, 4, 8, K); ret(ctx, x + 1, py + 5, 2, 6, VIDRO); ret(ctx, x + 1, py + 8, 2, 3, cores[i][0]); ret(ctx, x + 2, py + 9, 1, 1, cores[i][1]);
      }
    } });

  S.ci = { LIVROS: LIVROS };
})();
