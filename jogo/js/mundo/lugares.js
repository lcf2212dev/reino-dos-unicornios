/* Lugares fixos do mapa e o traçado da cidade (DADOS): prédios que não são matéria, as clareiras das
   matérias, o terreno reservado, as ruas, a praça, o lago e os enfeites postos à mão.
   Prédio novo NÃO entra aqui: usa Reino.registrarLugar na pasta dele
   (js/interiores/<p>/lugar.js; docs/contratos/interiores.md §9.7) + o desenho em Mapa.PREDIOS[sprite].
   Cada entrada de LUGARES_FIXOS vira um lugar de Mapa.lugares() assim: { tipo: id, porta, ...a entrada }.
     id, nome, sprite (chave de Mapa.PREDIOS), rect (em tiles; a porta fica no meio da última linha),
     placa (sem uso no mapa: cena-e-motor.md §9).
     caminho (opcional): tiles de rua da rua até a frente da porta. Sem ele, a frente da porta desce reta
       até a primeira rua (é assim que as clareiras e as matérias se ligam).
   Todos os daqui entram ANTES do sorteio dos enfeites (o reino é desenhado em volta deles).
   Ordem de Mapa.lugares(): os sem caminho (nesta ordem), as matérias, as matérias porCima e os
   com caminho (nesta ordem), os registrados e, no fim, as matérias com lugar.dentro (só menu).
   Mapa 56×42 (mundo/mapa.js). Fileiras: prédios de cima (portas na linha 9), Avenida das Flores (11-12),
   prédios do meio (portas 19), Rua da Praça (21-22), prédios de baixo (portas 28), Avenida do Lago (30-31),
   prédios do lago (portas 37) e as trilhas do sul (39). Praça no meio (21..33 × 15..27), castelo no alto do eixo. */
(function () {
  var Mapa = window.Mapa;

  // clareiras onde as próximas matérias vão ganhar um lugar (a porta desce reta até a rua)
  Mapa.CLAREIRAS = [
    { x: 37, y: 24, w: 5, h: 5 },
    { x: 46, y: 24, w: 5, h: 5 },
    { x: 13, y: 33, w: 5, h: 5 },
  ];

  // terrenos guardados para um prédio que vem por Reino.registrarLugar: só grama (sem enfeite nem flor),
  // com o rect e o caminho que o prédio deve usar
  Mapa.RESERVADOS = [
    // Salão de Beleza: embaixo e à esquerda da praça, entre a Escola e a Avenida do Lago
    { id: 'salao', rect: { x: 13, y: 24, w: 6, h: 5 }, caminho: [[16, 29]] },
  ];

  Mapa.LUGARES_FIXOS = [
    { id: 'castelo', nome: 'Castelo da Medalha', sprite: 'castelo', rect: { x: 24, y: 3, w: 7, h: 5 }, placa: 'direita' },
    { id: 'bau', nome: 'Baú do Tesouro', sprite: 'bau', rect: { x: 46, y: 6, w: 5, h: 4 }, placa: 'acima' },
    { id: 'estabulo', nome: 'Estábulo Mágico', sprite: 'estabulo', rect: { x: 4, y: 16, w: 6, h: 4 }, placa: 'acima' },
    { id: 'loja', nome: 'Loja das Fadas', sprite: 'loja', rect: { x: 37, y: 16, w: 5, h: 4 }, placa: 'acima' },
    { id: 'escola', nome: 'Escola do Reino', sprite: 'escola', rect: { x: 13, y: 15, w: 5, h: 5 } },
    // à beira do lago, com a trilha do sul na frente
    { id: 'petshop', nome: 'Pet Shop', sprite: 'petshop', rect: { x: 4, y: 34, w: 5, h: 4 }, placa: 'acima',
      caminho: [[6, 38]] },
    // no morro a leste do lago (o ponto alto do reino)
    { id: 'observatorio', nome: 'Observatório', sprite: 'observatorio', rect: { x: 37, y: 33, w: 6, h: 5 }, placa: 'acima',
      caminho: [[40, 38]] },
  ];

  /* O traçado da cidade (mundo/mapa.js pinta; mundo/cidade-desenho.js desenha).
     ruas: rects de rua ('c'); praca: o rect da praça ('p'); lago: a elipse da água, em tiles (dá para nadar);
     objetos: peças grandes e sólidas da praça (fonte, coreto, canteiro redondo), sem enfeite no tile;
     enfeites: [tipo, x, y] de 1 tile ('poste', 'banco', 'canteiro', 'arvore'), sólidos. Tile que cair em rua,
     prédio, reservado ou outro enfeite é pulado. As cercas saem sozinhas na frente de cada prédio de hoje.
     motivos: como enfeites, mas postos depois do sorteio (um campo vazio ganha peça sem mudar o resto do reino). */
  Mapa.CIDADE = {
    inicio: { x: 27, y: 28 },       // onde ela aparece ao abrir o jogo: na saída sul da praça, com a fonte à vista
    claude: { x: 30, y: 23 },       // o Claude, ao lado da fonte
    praca: { x: 21, y: 15, w: 13, h: 13 },
    // estilo do calçamento (mundo/mapa-desenho.js): 'pedra' = paralelepípedo (avenidas), 'ladrilho' = ladrilho claro
    // (travessas, alameda, eixos e os caminhos até as portas), 'terra' = terra batida (trilhas do sul)
    ruas: [
      { x: 3, y: 11, w: 50, h: 2, estilo: 'pedra' },    // Avenida das Flores
      { x: 26, y: 8, w: 3, h: 3, estilo: 'ladrilho' },  // alameda do castelo
      { x: 26, y: 13, w: 3, h: 2, estilo: 'ladrilho' }, // eixo: avenida → praça
      { x: 3, y: 21, w: 18, h: 2, estilo: 'pedra' },    // Rua da Praça (oeste)
      { x: 34, y: 21, w: 19, h: 2, estilo: 'pedra' },   // Rua da Praça (leste)
      { x: 26, y: 28, w: 3, h: 2, estilo: 'ladrilho' }, // eixo: praça → avenida
      { x: 3, y: 30, w: 50, h: 2, estilo: 'pedra' },    // Avenida do Lago
      { x: 11, y: 13, w: 1, h: 8, estilo: 'ladrilho' }, { x: 11, y: 23, w: 1, h: 7, estilo: 'ladrilho' }, { x: 11, y: 32, w: 1, h: 7, estilo: 'ladrilho' },   // travessa oeste
      { x: 44, y: 13, w: 1, h: 8, estilo: 'ladrilho' }, { x: 44, y: 23, w: 1, h: 7, estilo: 'ladrilho' }, { x: 44, y: 32, w: 1, h: 7, estilo: 'ladrilho' },   // travessa leste
      { x: 4, y: 39, w: 14, h: 1, estilo: 'terra' },    // trilha do sul (oeste)
      { x: 38, y: 39, w: 7, h: 1, estilo: 'terra' },    // trilha do sul (leste)
    ],
    lago: { cx: 27.5, cy: 35.6, rx: 7.5, ry: 2.9 },
    objetos: [
      { tipo: 'fonte', x: 25, y: 19, w: 5, h: 4 },
      { tipo: 'coreto', x: 22, y: 16, w: 3, h: 3 },
      { tipo: 'canteiro', x: 30, y: 16, w: 3, h: 3 },
      { tipo: 'canteiro', x: 22, y: 24, w: 3, h: 3 },
      { tipo: 'canteiro', x: 30, y: 24, w: 3, h: 3 },
    ],
    enfeites: [
      // praça: postes nos cantos e nas entradas do eixo, bancos olhando a fonte
      ['poste', 21, 15], ['poste', 33, 15], ['poste', 21, 27], ['poste', 33, 27],
      ['poste', 25, 15], ['poste', 29, 15], ['poste', 25, 27], ['poste', 29, 27],
      ['banco', 21, 19], ['banco', 33, 19], ['banco', 21, 23], ['banco', 33, 23],   // fora do anel da rosa dos ventos; (30,23) é o Claude
      // alameda do castelo
      ['poste', 25, 9], ['poste', 29, 9], ['canteiro', 25, 8], ['canteiro', 29, 8],
      // Avenida das Flores
      ['poste', 11, 10], ['poste', 21, 10], ['poste', 33, 10], ['poste', 43, 10],
      ['poste', 5, 13], ['poste', 19, 13], ['poste', 35, 13], ['poste', 50, 13],
      ['banco', 20, 10], ['banco', 34, 10], ['canteiro', 22, 10], ['canteiro', 32, 10],
      // Rua da Praça
      ['poste', 10, 20], ['poste', 19, 20], ['poste', 35, 20], ['poste', 45, 20],
      ['poste', 10, 23], ['poste', 45, 23],
      // Avenida do Lago
      ['poste', 5, 32], ['poste', 19, 32], ['poste', 35, 32], ['poste', 50, 32],
      ['poste', 10, 29], ['poste', 20, 29], ['poste', 34, 29], ['poste', 43, 29],
      ['banco', 21, 32], ['banco', 33, 32],
      ['canteiro', 12, 29], ['canteiro', 36, 29],
    ],
    // um motivo em cada campo vazio, posto depois do sorteio das flores e árvores (mundo/mapa.js): [tipo, x, y].
    // 'frutifera' (árvore com fruta), 'poco', 'correio', 'placa' (de direção): sólidos; 'pedrinhas': chão, dá para pisar
    motivos: [
      ['poco', 22, 7],                                             // ao lado do castelo, a oeste
      ['frutifera', 32, 4], ['frutifera', 34, 4], ['frutifera', 33, 6],   // o pomar, a leste do castelo
      ['correio', 51, 18],                                         // ao lado da Matemática
      ['placa', 48, 35],                                           // o campo a leste do Observatório
      ['canteiro', 19, 17],                                        // entre a Escola e a praça
      ['pedrinhas', 26, 32], ['pedrinhas', 27, 32], ['pedrinhas', 28, 32],   // o eixo da praça segue até o lago
      // as pontas das ruas: as avenidas acabam num arco de árvores junto do bosque; as trilhas, numa peça
      ['arvore', 2, 11], ['arvore', 2, 12], ['arvore', 53, 11], ['arvore', 53, 12],
      ['arvore', 2, 21], ['arvore', 2, 22], ['arvore', 53, 21], ['arvore', 53, 22],
      ['arvore', 2, 30], ['arvore', 2, 31], ['arvore', 53, 30], ['arvore', 53, 31],
      ['arvore', 3, 39], ['canteiro', 18, 39], ['placa', 37, 39],
    ],
  };
  Mapa.claudeTile = Mapa.CIDADE.claude;
  Mapa.inicio = Mapa.CIDADE.inicio;
})();
