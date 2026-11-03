/* Laboratório de Ciências do 4º bimestre: os enfeites dos cômodos de cada capítulo (a galeria do Livro de Aprendizagem
   embaixo e a estufa do Livro de Atividades em cima), em coordenadas locais do cômodo (0..10; fileiras 0 e 1 são a
   parede). As estações e o anfitrião vêm do lab-andar3.js, que chama Reino._predios.observatorio.ci.comodos(inter).
   Em todo cômodo: a cruz de corredores (fileiras 5 a 7; colunas 4 a 6 até a porta), as vagas (1,4) (3,4) (7,4) (9,4)
   (3,8) (7,8) e a fileira 3 inteira livres (o caminho atrás das estações: a estação é alta e cobre o tile de cima).
   Móvel alto (topo > 8) só com o tile de cima vazio: na fileira 2 só coisa baixa (a parede é enfeitada), alto na 4 e
   na 8; na 9 e na 10, alto só embaixo de tile vazio. Galeria: o anfitrião fica em (5,8) e a porta da estufa corta
   a parede em 4 a 6 (nada pendurado ali). Estufa: o canteiro do meio em (5,2), alcançado por (5,3) e (5,4) livres. */
(function () {
  var R = window.Reino;
  var S = R._predios.observatorio, L = S.lab;
  var AGUA = L.AGUA, AMARELO = L.AMARELO, FOLHA = L.FOLHA;

  function cartaz(x, desenho, faixa) { return { tipo: 'lab-cartaz', x: x, y: 0, var: { desenho: desenho, faixa: faixa } }; }
  function listras(x, cores) { return { tipo: 'tapete-listrado', x: x, y: 6, w: 3, h: 1, var: { cores: cores } }; }

  S.ci.comodos = function (inter) {
    return {
      /* ---------- Cap. 10, galeria: Conhecendo as plantas (no vaso, no deserto e na água) ---------- */
      galeria10: [
        { tipo: 'janela', x: 0, y: 0 }, cartaz(1, 'vivo', FOLHA), cartaz(2, 'sol', '#ff9d2e'),
        { tipo: 'cortina', x: 3, y: 0, var: { cor: '#9fe0a0' } }, { tipo: 'lab-quadro', x: 7, y: 0, var: { desenho: 'seres' } },
        { tipo: 'janela', x: 9, y: 0 }, { tipo: 'relogio-parede', x: 10, y: 0 },
        { tipo: 'vaso-grande', x: 0, y: 2 }, { tipo: 'ci-sementes', x: 1, y: 2 }, { tipo: 'lab-bancada', x: 2, y: 2, var: { itens: 'vasos' } },
        { tipo: 'cesto', x: 7, y: 2 }, { tipo: 'flores', x: 8, y: 2 }, { tipo: 'portugues-canteiro', x: 9, y: 2 },
        inter('ci-cacto', 'Cacto', { tipo: 'lab-cacto', x: 0, y: 4 }), { tipo: 'flores', x: 2, y: 4, var: { vaso: AGUA } },
        { tipo: 'balde', x: 8, y: 4 }, { tipo: 'vaso-planta', x: 10, y: 4 },
        listras(0, [FOLHA, '#f4fbff', AMARELO, '#f4fbff']), listras(8, [FOLHA, '#f4fbff', AMARELO, '#f4fbff']),
        inter('ci-aguape', 'Aquário com aguapé', { tipo: 'lab-aquario', x: 0, y: 8 }), { tipo: 'caixote', x: 2, y: 8, var: { item: 'planta' } },
        { tipo: 'planta-alta', x: 8, y: 8 }, { tipo: 'lab-pedras', x: 9, y: 8 }, inter('ci-girassol', 'Girassol', { tipo: 'ci-girassol', x: 10, y: 8 }),
        { tipo: 'pilha-livros', x: 0, y: 9 }, { tipo: 'cesto', x: 1, y: 9 }, { tipo: 'almofada', x: 2, y: 9, var: { cor: '#9fe0a0' } },
        { tipo: 'tapete-redondo', x: 4, y: 9, var: { cor: '#c8f0cc' } }, { tipo: 'banco', x: 8, y: 9 }, { tipo: 'balde', x: 10, y: 9 },
        { tipo: 'caixote', x: 0, y: 10 }, { tipo: 'flores', x: 1, y: 10 }, { tipo: 'vaso-grande', x: 2, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 10 },
        { tipo: 'portugues-regador', x: 6, y: 10 }, { tipo: 'vaso-planta', x: 7, y: 10 }, { tipo: 'pilha-livros', x: 8, y: 10 },
        { tipo: 'cesto', x: 9, y: 10 }, { tipo: 'lab-pedras', x: 10, y: 10 },
      ],
      /* ---------- Cap. 10, estufa: o que a planta precisa (água, luz, ar e terra) ---------- */
      estufa10: [
        { tipo: 'janela', x: 0, y: 0 }, cartaz(1, 'vivo', FOLHA), { tipo: 'janela', x: 2, y: 0 }, { tipo: 'prateleira-parede', x: 3, y: 0 },
        { tipo: 'estandarte', x: 5, y: 0, var: { cor: FOLHA, emblema: 'estrela' } }, { tipo: 'janela', x: 6, y: 0 }, cartaz(7, 'sol', '#ff9d2e'),
        { tipo: 'janela', x: 8, y: 0 }, { tipo: 'relogio-parede', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
        { tipo: 'portugues-canteiro', x: 0, y: 2 }, { tipo: 'balde', x: 2, y: 2 }, { tipo: 'cesto', x: 3, y: 2 },
        { tipo: 'portugues-hortela', x: 4, y: 2 }, inter('ci-broto', 'Feijão brotando', { tipo: 'lab-broto', x: 5, y: 2 }),
        { tipo: 'flores', x: 6, y: 2 }, { tipo: 'lab-bancada', x: 7, y: 2, var: { itens: 'vasos' } }, { tipo: 'barril', x: 9, y: 2 },
        { tipo: 'vaso-grande', x: 10, y: 2 },
        { tipo: 'caixote', x: 0, y: 4, var: { item: 'planta' } }, { tipo: 'flores', x: 2, y: 4 }, { tipo: 'portugues-hibisco', x: 4, y: 4 },
        inter('ci-regador', 'Regador', { tipo: 'portugues-regador', x: 6, y: 4 }), { tipo: 'cesto', x: 8, y: 4 }, { tipo: 'vaso-planta', x: 10, y: 4 },
        listras(0, [AMARELO, '#fff8ee', FOLHA, '#fff8ee']), listras(8, [AMARELO, '#fff8ee', FOLHA, '#fff8ee']),
        { tipo: 'portugues-canteiro', x: 0, y: 8 }, { tipo: 'flores', x: 2, y: 8, var: { vaso: AGUA } },
        { tipo: 'lab-flores', x: 8, y: 8 }, { tipo: 'portugues-canteiro', x: 9, y: 8 },
        { tipo: 'quimica-banqueta', x: 0, y: 9 }, { tipo: 'portugues-carrinho', x: 1, y: 9 }, { tipo: 'cesto', x: 2, y: 9 },
        { tipo: 'ci-sementes', x: 8, y: 9 }, { tipo: 'balde', x: 9, y: 9 }, { tipo: 'portugues-canteiro-flores', x: 10, y: 9 },
        { tipo: 'vaso-grande', x: 0, y: 10, var: { cor: AGUA, faixa: '#d9fff4' } }, { tipo: 'flores', x: 1, y: 10 }, { tipo: 'caixote', x: 2, y: 10 },
        { tipo: 'luminaria-pe', x: 3, y: 10 }, { tipo: 'planta-alta', x: 7, y: 10 }, { tipo: 'banco', x: 8, y: 10 },
        { tipo: 'vaso-grande', x: 10, y: 10, var: { cor: AGUA, faixa: '#d9fff4' } },   // var própria nos dois: o kit não cola no Salão nem na Música
      ],
      /* ---------- Cap. 11, galeria: As partes das plantas (raiz, caule, folhas, flores, frutos e sementes) ---------- */
      galeria11: [
        { tipo: 'janela', x: 0, y: 0 }, { tipo: 'ci-cartaz-partes', x: 1, y: 0 }, cartaz(2, 'vivo', FOLHA), { tipo: 'arandela', x: 3, y: 0 },
        { tipo: 'arandela', x: 7, y: 0 }, { tipo: 'quadro', x: 8, y: 0, var: { cena: 'paisagem' } },
        { tipo: 'estandarte', x: 9, y: 0, var: { cor: FOLHA, emblema: 'estrela' } }, { tipo: 'janela', x: 10, y: 0 },
        { tipo: 'pilha-livros', x: 0, y: 2 }, { tipo: 'flores', x: 1, y: 2 }, { tipo: 'quimica-lupas', x: 2, y: 2 },
        { tipo: 'quimica-vidrarias', x: 7, y: 2 }, { tipo: 'lab-flores', x: 9, y: 2 }, { tipo: 'caixote', x: 10, y: 2, var: { item: 'planta' } },
        inter('ci-raizes', 'Vaso de vidro', { tipo: 'ci-vaso-raizes', x: 0, y: 4 }), { tipo: 'flores', x: 2, y: 4, var: { vaso: AGUA } },
        { tipo: 'cesto', x: 8, y: 4 }, inter('ci-frutas', 'Cesta de frutas', { tipo: 'portugues-cesta-frutas', x: 10, y: 4 }),
        listras(0, [FOLHA, '#fff8ee', '#ff7eb6', '#fff8ee']), listras(8, [FOLHA, '#fff8ee', '#ff7eb6', '#fff8ee']),
        { tipo: 'portugues-arvore', x: 0, y: 8 }, { tipo: 'ci-sementes', x: 1, y: 8 }, { tipo: 'petshop-cesta-macas', x: 2, y: 8 },
        { tipo: 'quimica-microscopio', x: 8, y: 8 }, { tipo: 'vaso-grande', x: 10, y: 8 },
        { tipo: 'cesto', x: 0, y: 9 }, { tipo: 'balde', x: 1, y: 9 }, { tipo: 'almofada', x: 2, y: 9, var: { cor: '#ff9cc6' } },
        { tipo: 'tapete-redondo', x: 4, y: 9, var: { cor: '#c8f0cc' } }, { tipo: 'mesa-centro', x: 8, y: 9 }, { tipo: 'flores', x: 10, y: 9 },
        { tipo: 'banco', x: 0, y: 10 }, { tipo: 'vaso-planta', x: 2, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 10 },
        { tipo: 'portugues-regador', x: 6, y: 10 }, { tipo: 'planta-alta', x: 7, y: 10 }, { tipo: 'pilha-livros', x: 8, y: 10 },
        { tipo: 'cesto', x: 9, y: 10 }, { tipo: 'caixote', x: 10, y: 10 },
      ],
      /* ---------- Cap. 11, estufa: a horta (raiz, folha e fruto que a gente come) ---------- */
      estufa11: [
        { tipo: 'janela', x: 0, y: 0 }, cartaz(1, 'vivo', FOLHA), { tipo: 'janela', x: 2, y: 0 },
        { tipo: 'cortina', x: 3, y: 0, var: { cor: '#ffe066' } }, { tipo: 'ci-cartaz-partes', x: 4, y: 0 },
        { tipo: 'quimica-ciclo-agua', x: 5, y: 0 }, { tipo: 'janela', x: 7, y: 0 }, { tipo: 'prateleira-parede', x: 8, y: 0 },
        { tipo: 'janela', x: 10, y: 0 },
        { tipo: 'vaso-grande', x: 0, y: 2 }, { tipo: 'lab-bancada', x: 1, y: 2, var: { itens: 'vasos' } }, { tipo: 'cesto', x: 3, y: 2 },
        { tipo: 'lab-flores', x: 4, y: 2 }, inter('ci-cenouras', 'Cenouras', { tipo: 'estabulo-cenouras', x: 5, y: 2 }),
        { tipo: 'portugues-canteiro-flores', x: 6, y: 2 }, { tipo: 'quimica-vidrarias', x: 7, y: 2 }, { tipo: 'barril', x: 9, y: 2 },
        { tipo: 'caixote', x: 10, y: 2, var: { item: 'planta' } },
        { tipo: 'balde', x: 0, y: 4 }, { tipo: 'flores', x: 2, y: 4 }, inter('ci-folhas', 'Hortelã', { tipo: 'portugues-hortela', x: 4, y: 4 }),
        { tipo: 'portugues-abacaxi', x: 6, y: 4 }, { tipo: 'cesto', x: 8, y: 4 }, { tipo: 'vaso-planta', x: 10, y: 4 },
        listras(0, [AMARELO, '#fff8ee', FOLHA, '#fff8ee']), listras(8, [AMARELO, '#fff8ee', FOLHA, '#fff8ee']),
        { tipo: 'portugues-canteiro', x: 0, y: 8 }, { tipo: 'petshop-cesta-macas', x: 2, y: 8 },
        { tipo: 'ci-girassol', x: 8, y: 8 }, { tipo: 'portugues-canteiro', x: 9, y: 8 },
        { tipo: 'portugues-carrinho', x: 0, y: 9 }, { tipo: 'quimica-banqueta', x: 1, y: 9 }, { tipo: 'cesto', x: 2, y: 9 },
        { tipo: 'ci-sementes', x: 8, y: 9 }, { tipo: 'balde', x: 9, y: 9 }, { tipo: 'flores', x: 10, y: 9 },
        { tipo: 'caixote', x: 0, y: 10 }, { tipo: 'vaso-grande', x: 1, y: 10 }, { tipo: 'flores', x: 2, y: 10 },
        { tipo: 'luminaria-pe', x: 3, y: 10 }, { tipo: 'vaso-planta', x: 7, y: 10 }, { tipo: 'banco', x: 8, y: 10 },
        { tipo: 'lab-pedras', x: 10, y: 10 },
      ],
      /* ---------- Cap. 12, galeria: As plantas se relacionam (com as abelhas, os pássaros e os bichos) ---------- */
      galeria12: [
        { tipo: 'janela', x: 0, y: 0 }, cartaz(1, 'abelha', AMARELO), cartaz(2, 'passaro', '#5fb4ff'),
        { tipo: 'cortina', x: 3, y: 0, var: { cor: '#ff9cc6' } }, { tipo: 'quadro', x: 7, y: 0, var: { cena: 'paisagem' } },
        { tipo: 'estandarte', x: 8, y: 0, var: { cor: '#ff7eb6', emblema: 'coracao' } }, { tipo: 'janela', x: 9, y: 0 },
        { tipo: 'relogio-parede', x: 10, y: 0 },
        { tipo: 'lab-flores', x: 0, y: 2 }, { tipo: 'flores', x: 1, y: 2 }, { tipo: 'portugues-canteiro', x: 2, y: 2 },
        { tipo: 'portugues-canteiro-flores', x: 7, y: 2 }, { tipo: 'lab-flores', x: 8, y: 2 }, { tipo: 'cesto', x: 9, y: 2 },
        { tipo: 'vaso-grande', x: 10, y: 2 },
        inter('ci-colmeia', 'Colmeia', { tipo: 'lab-colmeia', x: 0, y: 4 }), { tipo: 'flores', x: 2, y: 4, var: { vaso: '#ff7eb6' } },
        inter('ci-ninho', 'Ninho', { tipo: 'portugues-ninho', x: 8, y: 4 }), inter('ci-beija-flor', 'Beija-flor', { tipo: 'lab-beija-flor', x: 10, y: 4 }),
        listras(0, ['#ff7eb6', '#fff8ee', FOLHA, '#fff8ee']), listras(8, ['#ff7eb6', '#fff8ee', FOLHA, '#fff8ee']),
        { tipo: 'portugues-hibisco', x: 0, y: 8 }, { tipo: 'lab-capim', x: 1, y: 8 },
        { tipo: 'lab-gafanhoto', x: 8, y: 8 }, { tipo: 'planta-alta', x: 9, y: 8 }, { tipo: 'portugues-arvore', x: 10, y: 8 },
        { tipo: 'cesto', x: 0, y: 9 }, { tipo: 'lab-flores', x: 1, y: 9 }, { tipo: 'almofada', x: 2, y: 9, var: { cor: '#ff9cc6' } },
        { tipo: 'tapete-redondo', x: 4, y: 9, var: { cor: '#ffd1e6' } }, { tipo: 'banco', x: 8, y: 9 }, { tipo: 'flores', x: 10, y: 9 },
        { tipo: 'vaso-grande', x: 0, y: 10 }, { tipo: 'caixote', x: 1, y: 10, var: { item: 'planta' } }, { tipo: 'vaso-planta', x: 2, y: 10 },
        { tipo: 'luminaria-pe', x: 3, y: 10 }, { tipo: 'lab-pedras', x: 6, y: 10 }, { tipo: 'portugues-canteiro-flores', x: 7, y: 10 },
        { tipo: 'pilha-livros', x: 8, y: 10 }, { tipo: 'cesto', x: 9, y: 10 }, { tipo: 'balde', x: 10, y: 10 },
      ],
      /* ---------- Cap. 12, estufa: o jardim das abelhas e dos passarinhos (a parede em cima da árvore fica lisa) ---------- */
      estufa12: [
        { tipo: 'janela', x: 0, y: 0 }, cartaz(1, 'abelha', AMARELO), { tipo: 'janela', x: 2, y: 0 }, cartaz(3, 'passaro', '#5fb4ff'),
        { tipo: 'janela', x: 4, y: 0 }, { tipo: 'janela', x: 6, y: 0 }, { tipo: 'bandeirinhas', x: 7, y: 0 }, { tipo: 'janela', x: 9, y: 0 },
        { tipo: 'relogio-parede', x: 10, y: 0 },
        { tipo: 'lab-flores', x: 0, y: 2 }, { tipo: 'lab-bancada', x: 1, y: 2, var: { itens: 'vasos' } }, { tipo: 'cesto', x: 3, y: 2 },
        { tipo: 'portugues-canteiro-flores', x: 4, y: 2 }, inter('ci-arvore', 'Árvore', { tipo: 'portugues-arvore', x: 5, y: 2 }),
        { tipo: 'lab-flores', x: 6, y: 2 }, { tipo: 'lab-capim', x: 7, y: 2 }, { tipo: 'balde', x: 9, y: 2 }, { tipo: 'vaso-grande', x: 10, y: 2 },
        { tipo: 'portugues-mel', x: 0, y: 4 }, { tipo: 'flores', x: 2, y: 4 }, { tipo: 'lab-colmeia', x: 4, y: 4 },
        { tipo: 'portugues-ninho', x: 6, y: 4 }, { tipo: 'cesto', x: 8, y: 4 }, { tipo: 'lab-beija-flor', x: 10, y: 4 },
        listras(0, ['#ff7eb6', '#fff8ee', AMARELO, '#fff8ee']), listras(8, ['#ff7eb6', '#fff8ee', AMARELO, '#fff8ee']),
        { tipo: 'portugues-canteiro', x: 0, y: 8 }, { tipo: 'lab-flores', x: 2, y: 8 },
        { tipo: 'planta-alta', x: 8, y: 8 }, { tipo: 'portugues-canteiro', x: 9, y: 8 },
        { tipo: 'portugues-carrinho', x: 0, y: 9 }, { tipo: 'ci-sementes', x: 1, y: 9 }, { tipo: 'balde', x: 2, y: 9 },
        { tipo: 'cesto', x: 8, y: 9 }, { tipo: 'caixote', x: 9, y: 9 }, { tipo: 'flores', x: 10, y: 9, var: { vaso: '#ff7eb6' } },
        { tipo: 'caixote', x: 0, y: 10, var: { item: 'planta' } }, { tipo: 'vaso-grande', x: 1, y: 10 }, { tipo: 'flores', x: 2, y: 10 },
        { tipo: 'luminaria-pe', x: 3, y: 10 }, { tipo: 'vaso-planta', x: 7, y: 10 }, { tipo: 'banco', x: 8, y: 10 },
        { tipo: 'lab-pedras', x: 10, y: 10 },
      ],
    };
  };
})();
