/* Museu das Memórias, História da Gente (4º bimestre): os objetos das três galerias (Livro de Aprendizagem, uma por
   capítulo, no meio da planta) e das três oficinas (Livro de Atividades, em cima de cada galeria). Só monta as
   listas: as estações das salas (geradas dos dados) e o registro do interior ficam em museu/museu.js, que chama
   S.hiComodos({ sala, inter, estacoes }) e devolve a lista de objetos destes seis cômodos.
   Galeria (11×11): parede x0–3 enfeitada e x7–10 livre (a placa do capítulo, que é comprida); vagas das estações na fileira 4 (x1, x3, x7, x9), com a
   fileira 3 livre atrás delas; cruz de corredores: x4–6 (portas de cima e de baixo) e fileiras 5–7 (portas dos lados);
   o anfitrião em (9,8) e o (9,10) livre (chão de visita).
   Oficina (11×9): vagas encostadas na parede do fundo (x1, x3, x7, x9; sem enfeite na parede em cima delas), a
   fileira 3 livre embaixo delas; corredores: x4–6 (porta de baixo) e a fileira 5 (portas dos lados).
   Carrega depois de museu/objetos.js (que cria Reino._predios.museu) e antes de museu/museu.js. */
(function () {
  var R = window.Reino;
  var S = R._predios.museu;

  S.hiComodos = function (A) {
    var sala = A.sala, inter = A.inter, estacoes = A.estacoes;
    // pedestais de museu na fileira de baixo de toda galeria, ao lado das legendas
    function pedestais(ox, oy, itens) {
      return sala(ox, oy, [{ tipo: 'pedestal', x: 1, y: 8, var: { item: itens[0] } }, { tipo: 'pedestal', x: 3, y: 8, var: { item: itens[1] } },
        { tipo: 'pedestal', x: 7, y: 8, var: { item: itens[2] } }]);
    }
    return [].concat(
      /* ---------- GALERIA 10: O trabalho de cada um (o sítio, a casa e o leite: terra e laranja) ---------- */
      sala(1, 11, [
        { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro', x: 2, y: 0, var: { cena: 'paisagem' } }, { tipo: 'museu-fotos', x: 3, y: 0 },
        { tipo: 'estandarte', x: 1, y: 0, var: { cor: '#ff8a3d', emblema: 'coracao' } },   // x7–10 sem enfeite: a placa do capítulo
        { tipo: 'balde', x: 0, y: 2 }, { tipo: 'estabulo-feno', x: 1, y: 2 }, { tipo: 'cesto', x: 2, y: 2 },
        { tipo: 'flores', x: 3, y: 2, var: { vaso: '#b95a36' } }, { tipo: 'matematica-caixa-ovos', x: 7, y: 2 },
        { tipo: 'papeis', x: 8, y: 2 }, { tipo: 'pilha-livros', x: 9, y: 2 }, { tipo: 'vaso-planta', x: 10, y: 2 },
        { tipo: 'planta-alta', x: 0, y: 4 }, { tipo: 'museu-legenda', x: 2, y: 4 },
        inter('hi-leite', 'Garrafas de leite', { tipo: 'museu-leite', x: 8, y: 4 }), { tipo: 'portugues-cesta-frutas', x: 10, y: 4 },
        { tipo: 'tapete', x: 4, y: 6, w: 3, h: 2, var: { cor: '#ffd6a8', borda: '#b95a36' } },
        inter('hi-vassoura', 'Vassoura e pazinha', { tipo: 'museu-vassoura', x: 0, y: 8 }), { tipo: 'museu-legenda', x: 2, y: 8 },
        { tipo: 'cesto', x: 0, y: 9 }, { tipo: 'museu-tapete-marajoara', x: 1, y: 9, var: { cor: '#ffb070' } },
        { tipo: 'museu-tapete-marajoara', x: 2, y: 9, var: { cor: '#ffb070' } },
        { tipo: 'museu-banco-veludo', x: 0, y: 10, var: { cor: '#b95a36' } }, { tipo: 'barril', x: 2, y: 10 }, { tipo: 'papeis', x: 3, y: 10 },
        { tipo: 'castelo-feno', x: 10, y: 8 },
        { tipo: 'tapete-listrado', x: 7, y: 9, var: { cores: ['#ff8a3d', '#ffd34d', '#e0433f', '#fff8ee'] } },
        { tipo: 'estabulo-carrinho', x: 7, y: 10 }, { tipo: 'planta-alta', x: 10, y: 10 },
      ]), estacoes(10, 'galeria', 1, 11), pedestais(1, 11, ['vaso', 'pergaminho', 'concha']),
      /* ---------- GALERIA 11: Profissionais da comunidade (profissões de ontem e de hoje: azul-correio) ---------- */
      sala(13, 11, [
        { tipo: 'janela', x: 0, y: 0 }, { tipo: 'museu-selos', x: 1, y: 0 }, { tipo: 'museu-mural-cartas', x: 2, y: 0 },
        { tipo: 'museu-fotos', x: 3, y: 0, var: { sepia: '#dfe8f5' } },   // x7–10 sem enfeite: a placa do capítulo
        { tipo: 'cesto', x: 0, y: 2 }, { tipo: 'papeis', x: 1, y: 2 }, { tipo: 'pilha-livros', x: 2, y: 2 },
        { tipo: 'flores', x: 3, y: 2, var: { vaso: '#2f6fd6' } }, { tipo: 'quimica-extintor', x: 7, y: 2 },
        { tipo: 'escola-mochila', x: 8, y: 2 }, { tipo: 'museu-maleta', x: 9, y: 2 }, { tipo: 'vaso-planta', x: 10, y: 2 },
        inter('hi-lampiao', 'Lampião da rua', { tipo: 'portugues-poste', x: 0, y: 4 }), { tipo: 'museu-legenda', x: 2, y: 4 },
        inter('hi-telefone', 'Telefone antigo', { tipo: 'geografia-telefone', x: 8, y: 4 }), { tipo: 'geografia-computador', x: 10, y: 4 },
        { tipo: 'tapete', x: 4, y: 6, w: 3, h: 2, var: { cor: '#9fcfff', borda: '#ffd34d' } },
        inter('hi-camera', 'Câmera do fotógrafo', { tipo: 'museu-camera', x: 0, y: 8 }), { tipo: 'museu-legenda', x: 2, y: 8 },
        { tipo: 'museu-moedas', x: 0, y: 9 }, { tipo: 'museu-tapete-marajoara', x: 1, y: 9, var: { cor: '#9fcfff' } },
        { tipo: 'museu-tapete-marajoara', x: 2, y: 9, var: { cor: '#ffe28a' } },
        { tipo: 'museu-banco-veludo', x: 0, y: 10, var: { cor: '#2f4f8a' } }, { tipo: 'cavalete', x: 2, y: 10 }, { tipo: 'papeis', x: 3, y: 10 },
        { tipo: 'geografia-correio', x: 10, y: 8 },
        { tipo: 'tapete-listrado', x: 7, y: 9, var: { cores: ['#2f6fd6', '#ffd34d', '#2f6fd6', '#fff8ee'] } },
        { tipo: 'museu-documentos', x: 7, y: 10 }, { tipo: 'planta-alta', x: 10, y: 10 },
      ]), estacoes(11, 'galeria', 13, 11), pedestais(13, 11, ['pergaminho', 'medalha', 'relogio']),
      /* ---------- GALERIA 12: Trabalho e meio ambiente (coleta seletiva, árvores e rios: verde) ---------- */
      sala(25, 11, [
        { tipo: 'janela', x: 0, y: 0 }, { tipo: 'museu-mapa-brasil', x: 1, y: 0 },   // x7–10 sem enfeite: a placa do capítulo
        { tipo: 'lab-broto', x: 0, y: 2 }, { tipo: 'portugues-regador', x: 1, y: 2 }, { tipo: 'flores', x: 2, y: 2, var: { vaso: '#2e8b3e' } },
        { tipo: 'pilha-livros', x: 3, y: 2 }, { tipo: 'portugues-cesta-frutas', x: 7, y: 2 }, { tipo: 'cesto', x: 8, y: 2 },
        { tipo: 'pilha-livros', x: 9, y: 2 }, { tipo: 'flores', x: 10, y: 2 },
        { tipo: 'planta-alta', x: 0, y: 4 }, { tipo: 'museu-legenda', x: 2, y: 4, var: { cor: '#e8f5d0' } },
        inter('hi-muda', 'Mudinha de árvore', { tipo: 'lab-broto', x: 8, y: 4 }), { tipo: 'quimica-lixeira', x: 10, y: 4 },
        { tipo: 'tapete', x: 4, y: 6, w: 3, h: 2, var: { cor: '#9fe0a0', borda: '#ffd34d' } },
        { tipo: 'portugues-arvore', x: 0, y: 8 }, { tipo: 'museu-legenda', x: 2, y: 8 },
        { tipo: 'museu-tapete-marajoara', x: 0, y: 9, var: { cor: '#b8e0a0' } }, { tipo: 'museu-tapete-marajoara', x: 1, y: 9, var: { cor: '#b8e0a0' } },
        { tipo: 'museu-banco-veludo', x: 0, y: 10, var: { cor: '#2e8b3e' } }, { tipo: 'portugues-canteiro', x: 2, y: 10 },
        { tipo: 'lab-pedras', x: 10, y: 8 },
        { tipo: 'tapete-listrado', x: 7, y: 9, var: { cores: ['#4caf50', '#ffd34d', '#4caf50', '#fff8ee'] } },
        inter('hi-lixeiras', 'Lixeiras da coleta seletiva', { tipo: 'museu-lixeiras', x: 7, y: 10 }), { tipo: 'planta-alta', x: 10, y: 10 },
      ]), estacoes(12, 'galeria', 25, 11), pedestais(25, 11, ['globo', 'concha', 'gema']),
      /* ---------- OFICINA 10: a casa onde cada um faz a sua parte (varal, fogão, pia) ---------- */
      sala(1, 1, [
        { tipo: 'janela', x: 0, y: 0 }, { tipo: 'museu-fotos', x: 2, y: 0 }, { tipo: 'portugues-varal', x: 4, y: 0 },
        { tipo: 'arandela', x: 6, y: 0 }, { tipo: 'relogio-parede', x: 8, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
        { tipo: 'flores', x: 0, y: 2, var: { vaso: '#ff8a3d' } }, { tipo: 'pilha-livros', x: 2, y: 2 }, { tipo: 'papeis', x: 5, y: 2 },
        { tipo: 'cesto', x: 8, y: 2 }, { tipo: 'flores', x: 10, y: 2 },
        { tipo: 'tapete', x: 4, y: 3, w: 3, h: 1, var: { cor: '#ffd6a8', borda: '#ff8a3d' } },
        { tipo: 'portugues-fogao', x: 0, y: 4 }, { tipo: 'museu-vassoura', x: 2, y: 4 },
        { tipo: 'quimica-pia-cozinha', x: 8, y: 4 }, { tipo: 'balde', x: 10, y: 4 },
        { tipo: 'mesa', x: 0, y: 6, var: { toalha: '#ffd6a8', itens: ['xicara', 'bolo'] } }, { tipo: 'cadeira', x: 2, y: 6, var: { almofada: '#ff8a3d' } },
        { tipo: 'bau', x: 0, y: 8 }, { tipo: 'museu-leite', x: 1, y: 8 },   // (3,7): a Vovó Contadeira
        inter('hi-panelas', 'Panelas de barro', { tipo: 'museu-panelas', x: 8, y: 6 }), { tipo: 'planta-alta', x: 10, y: 6 },
        { tipo: 'tapete-listrado', x: 7, y: 7, var: { cores: ['#ff8a3d', '#fff8ee', '#ffd34d', '#fff8ee'] } },
        { tipo: 'museu-anfora', x: 7, y: 8 }, { tipo: 'caixote', x: 8, y: 8, var: { item: 'moedas' } }, { tipo: 'vaso-grande', x: 10, y: 8 },
      ]), estacoes(10, 'oficina', 1, 1),
      /* ---------- OFICINA 11: o ateliê das profissões (costura, lousa e balança) ---------- */
      sala(13, 1, [
        { tipo: 'janela', x: 0, y: 0 }, { tipo: 'salao-espelho', x: 2, y: 0 }, { tipo: 'prateleira-parede', x: 4, y: 0 },
        { tipo: 'arandela', x: 6, y: 0 }, { tipo: 'museu-fotos', x: 8, y: 0, var: { sepia: '#dfe8f5' } }, { tipo: 'janela', x: 10, y: 0 },
        { tipo: 'flores', x: 0, y: 2, var: { vaso: '#2f6fd6' } }, { tipo: 'pilha-livros', x: 2, y: 2 }, { tipo: 'lp-maquina', x: 5, y: 2 },
        { tipo: 'papeis', x: 8, y: 2 }, { tipo: 'flores', x: 10, y: 2, var: { vaso: '#7c5cff' } },
        { tipo: 'tapete', x: 4, y: 3, w: 3, h: 1, var: { cor: '#c9a8ff', borda: '#2f6fd6' } },
        { tipo: 'escrivaninha', x: 0, y: 4 }, { tipo: 'salao-cadeira', x: 2, y: 4 },
        { tipo: 'matematica-balanca', x: 8, y: 4 }, { tipo: 'museu-maleta', x: 9, y: 4 }, { tipo: 'luminaria-pe', x: 10, y: 4 },
        { tipo: 'cabideiro', x: 0, y: 6 }, { tipo: 'mesa', x: 1, y: 6, var: { toalha: '#dfe8f5', itens: ['xicara', 'relogio'] } },
        { tipo: 'museu-tapete-marajoara', x: 3, y: 7, var: { cor: '#c9a8ff' } },
        { tipo: 'cesto', x: 0, y: 8 }, { tipo: 'caixote', x: 1, y: 8, var: { item: 'ursinho' } }, { tipo: 'museu-moedas', x: 3, y: 8 },
        inter('hi-roupas', 'Arara de roupas', { tipo: 'salao-arara', x: 7, y: 6 }),
        { tipo: 'tapete-listrado', x: 7, y: 7, var: { cores: ['#2f6fd6', '#fff8ee', '#ffd34d', '#fff8ee'] } },
        { tipo: 'salao-carrinho', x: 7, y: 8 }, { tipo: 'museu-banco-veludo', x: 8, y: 8, var: { cor: '#7c5cff' } }, { tipo: 'planta-alta', x: 10, y: 8 },
      ]), estacoes(11, 'oficina', 13, 1),
      /* ---------- OFICINA 12: o canteiro de quem cuida da natureza (horta, regador e reaproveitar) ---------- */
      sala(25, 1, [
        { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro', x: 2, y: 0, var: { cena: 'paisagem' } }, { tipo: 'lab-cartaz', x: 4, y: 0 },
        { tipo: 'arandela', x: 6, y: 0 }, { tipo: 'cortina', x: 8, y: 0, var: { cor: '#6fdc8c' } }, { tipo: 'janela', x: 10, y: 0 },
        { tipo: 'flores', x: 0, y: 2, var: { vaso: '#2e8b3e' } }, { tipo: 'pilha-livros', x: 2, y: 2 }, { tipo: 'lab-broto', x: 5, y: 2 },
        { tipo: 'cesto', x: 8, y: 2 }, { tipo: 'flores', x: 10, y: 2 },
        { tipo: 'tapete', x: 4, y: 3, w: 3, h: 1, var: { cor: '#c8f0d0', borda: '#2e8b3e' } },
        { tipo: 'portugues-canteiro', x: 0, y: 4 }, { tipo: 'lab-pedras', x: 2, y: 4 },
        { tipo: 'museu-lixeiras', x: 8, y: 4 }, { tipo: 'quimica-lixeira', x: 10, y: 4 },
        { tipo: 'escrivaninha', x: 0, y: 6 }, { tipo: 'cadeira', x: 2, y: 6, var: { almofada: '#6fdc8c' } },
        { tipo: 'bau', x: 0, y: 8 }, { tipo: 'museu-piao', x: 1, y: 8 },   // (3,7): a Restauradora Nina
        inter('hi-regador', 'Regador', { tipo: 'portugues-regador', x: 10, y: 6 }), { tipo: 'portugues-arvore', x: 7, y: 6 },
        { tipo: 'tapete-listrado', x: 7, y: 7, var: { cores: ['#4caf50', '#fff8ee', '#ffd34d', '#fff8ee'] } },
        { tipo: 'portugues-leira', x: 7, y: 8 }, { tipo: 'vaso-grande', x: 10, y: 8 },
      ]), estacoes(12, 'oficina', 25, 1)
    );
  };
})();
