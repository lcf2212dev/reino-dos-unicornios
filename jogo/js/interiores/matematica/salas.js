/* Torre dos Números (Matemática): a planta própria de cada cômodo, lida pelo interior padrão (interiores/padrao.js,
   Reino._predios.matematica.planta). Ids, NPCs, falas e ações continuam os do padrão; aqui só piso, parede, paleta
   e móveis, em tiles do cômodo (0–10). Livre: a cruz das fileiras 6–7 e colunas 4–6 (portas), o guia em (7,8) e o
   monitor em (7,5). Móvel alto (topo > 8 px) nunca embaixo de peça de parede nem de outro móvel (validar-interiores).
   Marcadores (@livro, @bancada, @quadro, @bebedouro): os objetos interativos do padrão, com as falas de sempre.
   Hall: números e formas. Sala 1 calendário, 2 relógios, 3 chances, 4 parcelas iguais, 5 dobro e triplo, 6 tabuada. */
(function () {
  var R = window.Reino;
  var S = R._predios.matematica, CO = S.CORES;
  // paleta de cômodo: piso claro (contraste com o contorno da Mariana), parede e rodapé no tom da sala
  function paleta(piso, piso2, parede, parede2, rodape, detalhe) {
    return { piso: piso, piso2: piso2, parede: parede, parede2: parede2, rodape: rodape, detalhe: detalhe };
  }

  S.planta = {
    /* ---------- HALL: números e formas ---------- */
    hall: { piso: 'mosaico', parede: 'papel', paleta: paleta('#eaf2ff', '#cfe0fb', '#f4f8ff', '#ffe7a6', '#2a5bb0', CO.amarelo),
      objetos: [
        { tipo: 'janela', x: 0, y: 0 }, { tipo: 'matematica-numeros', x: 1, y: 0, var: { texto: '123' } },
        { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'arandela', x: 6, y: 0 },
        { tipo: 'matematica-formas', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
        // em cima à esquerda: o Livro dos Números no tapete de números
        { tipo: 'papeis', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 1, y: 2 }, { tipo: 'planta-alta', x: 3, y: 2 },
        { tipo: 'matematica-tapete-numeros', x: 0, y: 4 }, { tipo: '@livro', x: 2, y: 4 }, { tipo: 'matematica-blocos', x: 3, y: 4 },
        // em cima à direita: os sólidos e o ábaco
        { tipo: 'matematica-solidos', x: 7, y: 2 }, { tipo: 'pilha-livros', x: 9, y: 2 }, { tipo: 'flores', x: 10, y: 2 },
        { tipo: '@bancada', x: 8, y: 4 }, { tipo: 'luminaria-pe', x: 10, y: 4 },
        // embaixo à esquerda: o bebedouro e a reta numérica
        { tipo: '@bebedouro', x: 0, y: 8 },
        { tipo: 'matematica-reta', x: 1, y: 8, var: { texto: '01234' } },
        { tipo: 'sofa', x: 1, y: 10 }, { tipo: 'relogio-pe', x: 3, y: 10 },
        // embaixo à direita (o guia fica em 7,8)
        { tipo: 'cabideiro', x: 10, y: 8 }, { tipo: 'matematica-abaco', x: 8, y: 10 },
        { tipo: 'vaso-planta', x: 10, y: 10 },
      ] },

    salas: {
      /* ---------- SALA 1: O Calendário ---------- */
      m1: { piso: 'taco', parede: 'papel', paleta: paleta('#eaf1fd', '#cfdcf5', '#f4f8ff', '#ffd6d2', '#2a5bb0', CO.vermelho),
        objetos: [
          { tipo: 'janela', x: 0, y: 0 }, { tipo: '@quadro', x: 1, y: 0 }, { tipo: 'arandela', x: 4, y: 0 },
          { tipo: 'matematica-calendario', x: 7, y: 0, var: { dia: 10 } }, { tipo: 'janela', x: 10, y: 0 },
          { tipo: 'flores', x: 0, y: 2, var: { vaso: CO.vermelho } }, { tipo: 'pilha-livros', x: 1, y: 2 },
          { tipo: 'planta-alta', x: 3, y: 2 }, { tipo: '@bancada', x: 0, y: 4 }, { tipo: 'matematica-folhinha', x: 2, y: 4, var: { dia: '7' } },
          { tipo: 'vaso-planta', x: 9, y: 2 },
          { tipo: 'mesa', x: 8, y: 3, var: { toalha: '#ffd6d2', itens: ['bolo', 'vela'] } }, { tipo: 'cadeira', x: 7, y: 3, var: { almofada: CO.amarelo } },
          { tipo: 'matematica-reta', x: 0, y: 8, var: { texto: '1234567' } },
          { tipo: 'estante', x: 0, y: 10 }, { tipo: 'bau', x: 2, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 9 },
          { tipo: 'cavalete', x: 7, y: 8 }, { tipo: 'escrivaninha', x: 8, y: 10 }, { tipo: 'matematica-blocos', x: 10, y: 10 },
        ] },
      /* ---------- SALA 2: As Horas ---------- */
      m2: { piso: 'carpete', parede: 'madeira', paleta: paleta('#e6ecfb', '#c9d4f2', '#f2f5ff', '#ffe7a6', '#2a5bb0', CO.amarelo),
        objetos: [
          { tipo: 'matematica-relogio', x: 0, y: 0, var: { hora: 3 } }, { tipo: 'matematica-dia-noite', x: 3, y: 0 },
          { tipo: 'arandela', x: 6, y: 0 }, { tipo: 'relogio-parede', x: 7, y: 0 }, { tipo: '@quadro', x: 8, y: 0 },
          { tipo: 'janela', x: 10, y: 0 },
          { tipo: 'pilha-livros', x: 0, y: 2 }, { tipo: 'relogio-pe', x: 2, y: 2 }, { tipo: 'poltrona', x: 3, y: 4 }, { tipo: '@bancada', x: 1, y: 4 },
          { tipo: 'matematica-despertador', x: 0, y: 5 },
          { tipo: 'matematica-ampulheta', x: 7, y: 3 }, { tipo: 'flores', x: 10, y: 2 },
          { tipo: 'cadeira', x: 8, y: 4, var: { almofada: CO.amarelo } }, { tipo: 'escrivaninha', x: 9, y: 4 },
          { tipo: 'estante', x: 0, y: 8 }, { tipo: 'vaso-planta', x: 0, y: 10 }, { tipo: 'pilha-livros', x: 2, y: 10 },
          { tipo: 'matematica-ampulheta', x: 3, y: 9 },
          { tipo: 'luminaria-pe', x: 7, y: 9 }, { tipo: 'vitrine', x: 8, y: 10, var: { itens: ['relogio', 'estrela', 'relogio'] } },
          { tipo: 'cabideiro', x: 10, y: 8 },
        ] },
      /* ---------- SALA 3: Chances ---------- */
      m3: { piso: 'pedra', parede: 'azulejo', paleta: paleta('#e8f2fb', '#cddff0', '#f2f9ff', '#bfeccf', '#2a5bb0', CO.verde),
        objetos: [
          { tipo: 'janela', x: 0, y: 0 }, { tipo: 'matematica-grafico', x: 1, y: 0, var: { barras: [3, 5, 2, 4] } },
          { tipo: 'arandela', x: 4, y: 0 }, { tipo: '@quadro', x: 7, y: 0 }, { tipo: 'arandela', x: 9, y: 0 },
          { tipo: 'janela', x: 10, y: 0 },
          { tipo: 'matematica-dados', x: 0, y: 2 }, { tipo: 'caixote', x: 1, y: 2, var: { item: 'estrela' } },
          { tipo: 'matematica-roleta', x: 3, y: 2 }, { tipo: '@bancada', x: 0, y: 4 }, { tipo: 'cadeira', x: 2, y: 4, var: { almofada: CO.verde } },
          { tipo: 'flores', x: 7, y: 2 }, { tipo: 'matematica-urna', x: 9, y: 3 },
          { tipo: 'mesa', x: 8, y: 4, var: { toalha: '#dff5e6', itens: ['moedas', 'moedas'] } },
          { tipo: 'tapete', x: 0, y: 8, w: 3, h: 2, var: { cor: '#bfeccf', borda: CO.verde } },
          { tipo: 'armario', x: 0, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 8 }, { tipo: 'matematica-dados', x: 2, y: 10, var: { faces: [1, 5] } },
          { tipo: 'poltrona', x: 7, y: 8 }, { tipo: 'mesa-centro', x: 8, y: 9 }, { tipo: 'pilha-livros', x: 9, y: 10 },
          { tipo: 'planta-alta', x: 10, y: 10 },
        ] },
      /* ---------- SALA 4: Parcelas Iguais ---------- */
      m4: { piso: 'tabuas', parede: 'tijolo', paleta: paleta('#ecf1fb', '#d3ddf2', '#f5f8ff', '#ffd9b8', '#2a5bb0', CO.laranja),
        objetos: [
          { tipo: 'matematica-numeros', x: 0, y: 0, var: { texto: '2+2+2', desloca: 1 } }, { tipo: '@quadro', x: 3, y: 0 },
          { tipo: 'arandela', x: 6, y: 0 }, { tipo: 'prateleira-parede', x: 8, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
          { tipo: 'matematica-caixa-ovos', x: 0, y: 2 }, { tipo: 'planta-alta', x: 2, y: 2 },
          { tipo: 'matematica-potes', x: 0, y: 4 }, { tipo: '@bancada', x: 2, y: 4 },
          { tipo: 'luminaria-pe', x: 7, y: 2 }, { tipo: 'matematica-abaco', x: 8, y: 4 }, { tipo: 'matematica-blocos', x: 10, y: 2, var: { desloca: 2 } },
          { tipo: 'tapete-listrado', x: 0, y: 8, w: 3, h: 1, var: { cores: [CO.laranja, '#fff8ee', CO.azul, '#fff8ee'] } },
          { tipo: 'mesa', x: 0, y: 9, var: { toalha: '#ffe4c2', itens: ['xicara', 'xicara'] } }, { tipo: 'cadeira', x: 2, y: 9, var: { almofada: CO.laranja } },
          { tipo: 'vaso-planta', x: 3, y: 9 },
          { tipo: 'matematica-tapete-numeros', x: 7, y: 8, var: { texto: '2468' } }, { tipo: 'sofa', x: 9, y: 10 },
          { tipo: 'cavalete', x: 10, y: 8 },
        ] },
      /* ---------- SALA 5: Dobro e Triplo ---------- */
      m5: { piso: 'carpete', parede: 'papel', paleta: paleta('#ebeefc', '#d2d8f4', '#f6f6ff', '#ffd0e2', '#2a5bb0', CO.rosa),
        objetos: [
          { tipo: 'arandela', x: 1, y: 0 }, { tipo: 'matematica-varal-pares', x: 2, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
          { tipo: 'espelho', x: 7, y: 0 }, { tipo: '@quadro', x: 8, y: 0 },
          { tipo: 'planta-alta', x: 0, y: 2 }, { tipo: 'matematica-triciclo', x: 0, y: 3 }, { tipo: 'flores', x: 3, y: 2 }, { tipo: '@bancada', x: 1, y: 4 },
          { tipo: 'papeis', x: 0, y: 5 }, { tipo: 'cadeira', x: 3, y: 4, var: { almofada: CO.rosa } },
          { tipo: 'poltrona', x: 7, y: 3 }, { tipo: 'flores', x: 10, y: 2 },
          { tipo: 'mesa', x: 8, y: 4, var: { toalha: '#ffd0e2', itens: ['ursinho', 'ursinho'] } },
          { tipo: 'estante', x: 0, y: 8 }, { tipo: 'pilha-livros', x: 1, y: 10 }, { tipo: 'matematica-domino', x: 3, y: 9 },
          { tipo: 'bau', x: 7, y: 9 }, { tipo: 'escrivaninha', x: 8, y: 9 }, { tipo: 'luminaria-pe', x: 10, y: 9 },
        ] },
      /* ---------- SALA 6: Tabuadas do 4 e do 5 ---------- */
      m6: { piso: 'azulejo', parede: 'madeira', paleta: paleta('#e6f0fb', '#cddff5', '#f4f8ff', '#c9dcff', '#2a5bb0', CO.azul),
        objetos: [
          { tipo: 'matematica-tabuada', x: 0, y: 0, var: { tab: 4 } }, { tipo: 'arandela', x: 3, y: 0 },
          { tipo: '@quadro', x: 6, y: 0 }, { tipo: 'matematica-tabuada', x: 8, y: 0, var: { tab: 5 } }, { tipo: 'janela', x: 10, y: 0 },
          { tipo: 'pilha-livros', x: 0, y: 2 }, { tipo: 'matematica-cartas', x: 2, y: 2, var: { tab: 4 } }, { tipo: 'matematica-blocos', x: 3, y: 2, var: { desloca: 3 } },
          { tipo: '@bancada', x: 0, y: 4 }, { tipo: 'matematica-abaco', x: 2, y: 5 },
          { tipo: 'flores', x: 7, y: 3 }, { tipo: 'escrivaninha', x: 8, y: 3 }, { tipo: 'globo', x: 10, y: 4 },
          { tipo: 'sofa', x: 0, y: 8 }, { tipo: 'matematica-tapete-numeros', x: 0, y: 9, var: { numeros: ['5', '10', '15', '20'] } }, { tipo: 'pilha-livros', x: 2, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 8 },
          { tipo: 'matematica-cartas', x: 7, y: 9, var: { tab: 5 } }, { tipo: 'estante', x: 9, y: 8 },
          { tipo: 'mesa-centro', x: 8, y: 10 }, { tipo: 'vaso-planta', x: 10, y: 10 },
        ] },
    },
  };
})();
