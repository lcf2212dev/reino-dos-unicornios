/* Vila Arco-Íris, Shopping Terrazo por dentro (docs/contratos/vila.md §2): 'vila-shopping', 37 × 14 tiles, parte do
   Bosque (lugar 'bosque', entrada: false, pacote 'interior-bosque'), três cômodos lado a lado (chão nas fileiras 3 a 12)
   ligados por portas na fileira 8–9:
   - 'vila-shopping-gourmet' Terraço Gourmet { x: 1, w: 10 }: os balcões de pizzaria, hamburgueria e sushi na parede, as
     mesas de guarda-sol com cadeiras, o carrinho de sorvete e a churrasqueira de espetinhos;
   - 'vila-shopping-lojas' Corredor das Lojas { x: 12, w: 13 }, o da entrada: a saída é a escada `portal` (18, 12) com
     seta de descer (volta para a porta do shopping na Vila, (5, 27)); as vitrines de roupas e de brinquedos, a entrada
     do cinema (bilheteria, pipoqueira, cartaz e cordão), o quiosque de sapatos, os balões, a escada rolante de enfeite e
     o carro antigo do encontro de carros;
   - 'vila-shopping-zoo' Zoo Parque { x: 26, w: 10 }: a girafa, o leão, o elefante e a zebra de brinquedo, as árvores da
     savana, o escorregador e, no canto de baixo da direita, o Pet Park (cerquinha, cachorrinho, casinha e petiscos).
   A passagem das portas (fileiras 8–9) e a avenida da entrada até as vitrines (x 17–19) são `corredores`.
   Objetos de shopping-objetos*.js e da biblioteca; falas de shopping-falas.js. */
(function () {
  var R = window.Reino;
  var F = ((R.FALAS_INTERIORES || {}).vila || {}).objetos || {};
  var SAIDA = { x: 18, y: 12 };

  // [tipo, x, y, extra?]; `fala: 'chave'` vira a fala do falas (o nome vem junto)
  function objetos(lista) {
    return lista.map(function (o) {
      var r = { tipo: o[0], x: o[1], y: o[2] }, ex = o[3] || {};
      Object.keys(ex).forEach(function (k) { if (k !== 'fala') r[k] = ex[k]; });
      if (ex.fala) r.fala = F[ex.fala] || [];
      return r;
    });
  }
  function loja(tipo, x, nome) { return ['vila-shopping-loja', x, 3, { var: { tipo: tipo }, nome: nome, fala: 'shopping-' + tipo }]; }
  function balcao(tipo, x, nome) { return ['vila-shopping-balcao', x, 3, { var: { tipo: tipo }, nome: nome, fala: 'shopping-' + tipo }]; }

  var gourmet = [
    // os balcões na parede (a janela no vão entre a pizzaria e a hamburgueria)
    balcao('pizza', 1, 'Pizzaria'), ['janela', 4, 1], ['flores', 4, 3], balcao('hamburguer', 5, 'Hamburgueria'),
    balcao('japones', 8, 'Comida japonesa'),
    // as mesas de cima, com cadeiras dos lados, e o bebedouro
    ['cadeira', 1, 6, { var: { almofada: '#ff8a3d' } }], ['vila-shopping-mesa', 2, 6, { var: { cor: '#ff8a3d', comida: 'pizza' } }],
    ['cadeira', 4, 6, { var: { almofada: '#ff8a3d' } }], ['cadeira', 6, 6, { var: { almofada: '#4fc8b8' } }],
    ['vila-shopping-mesa', 7, 6, { var: { cor: '#4fc8b8', comida: 'hamburguer' } }], ['cadeira', 9, 6, { var: { almofada: '#4fc8b8' } }],
    ['bebedouro', 10, 7],
    // embaixo: o sorvete, a mesa rosa, a churrasqueira e os enfeites
    ['vila-shopping-sorvete', 1, 10, { nome: 'Sorveteria', fala: 'shopping-sorvete' }],
    ['cadeira', 4, 10, { var: { almofada: '#ff86bb' } }], ['vila-shopping-mesa', 5, 10, { var: { cor: '#ff86bb', comida: 'sorvete' } }],
    ['cadeira', 7, 10, { var: { almofada: '#ff86bb' } }],
    ['vila-shopping-churrasqueira', 9, 10, { nome: 'Churrascaria', fala: 'shopping-churrasco' }],
    ['vaso-grande', 1, 12], ['placa-chao', 3, 12], ['vaso-planta', 4, 12], ['planta-alta', 5, 12], ['cesto', 7, 12], ['luminaria-pe', 9, 12],
    ['vila-shopping-lixeira', 10, 12],
  ];
  var lojas = [
    // as vitrines na parede, com plantas e a lixeira entre elas
    loja('roupas', 12, 'Loja de Roupas'), ['planta-alta', 15, 3], ['vila-shopping-lixeira', 16, 3],
    loja('brinquedos', 17, 'Loja de Brinquedos'), ['vaso-planta', 20, 3], ['planta-alta', 21, 3],
    ['vila-shopping-loja', 22, 3, { var: { tipo: 'cinema' }, nome: 'Cinema', fala: 'shopping-cinema' }],
    // em cima, à esquerda: o manequim, o banco e os balões; à direita, a fila do cinema
    ['vila-shopping-manequim', 12, 5], ['banco', 13, 6, { var: { cor: '#ff8a3d' } }], ['vila-shopping-baloes', 16, 6],
    ['vila-shopping-pipoqueira', 21, 5, { nome: 'Pipoqueira', fala: 'shopping-pipoca' }], ['vila-shopping-cartaz', 20, 6],
    ['vila-shopping-bilheteria', 23, 6], ['vila-shopping-cordao', 21, 7],
    // embaixo: a escada rolante e o quiosque de sapatos; o carro antigo no tablado
    ['vila-shopping-escada', 12, 10], ['flores', 12, 12, { var: { vaso: '#4fc8b8' } }],
    ['vila-shopping-quiosque', 15, 11, { nome: 'Loja de Sapatos', fala: 'shopping-sapatos' }],
    ['vila-shopping-carro', 21, 10, { nome: 'Carro antigo', fala: 'shopping-carro' }],
    ['vaso-planta', 24, 12],
    // a porta: o capacho e as plantinhas dos lados
    ['vila-capacho', SAIDA.x, SAIDA.y], ['vaso-planta', 17, 12], ['vaso-planta', 19, 12],
  ];
  var zoo = [
    // parede: o mural da savana, bandeirinhas e a janela; no chão de trás, as árvores, as pedras e flores
    ['vila-shopping-mural', 28, 1], ['bandeirinhas', 31, 1], ['janela', 33, 1],
    ['vila-shopping-arvore', 26, 3], ['vila-shopping-pedras', 28, 3], ['flores', 32, 3, { var: { cores: ['#ffd34d', '#ff8a3d', '#ff86bb'] } }],
    ['vila-shopping-arvore', 34, 3],
    // os bichos de brinquedo
    ['vila-shopping-girafa', 29, 5, { nome: 'Girafa', fala: 'shopping-girafa' }],
    ['vila-shopping-leao', 27, 6, { nome: 'Leão', fala: 'shopping-leao' }],
    ['vila-shopping-elefante', 32, 6, { nome: 'Elefante', fala: 'shopping-elefante' }],
    ['vila-shopping-placa', 26, 7, { var: { tipo: 'zoo' } }],
    // embaixo: o escorregador, a zebra, o banco e o Pet Park cercado
    ['vila-shopping-escorregador', 26, 10, { nome: 'Escorregador', fala: 'shopping-escorregador' }],
    ['vila-shopping-zebra', 29, 10, { nome: 'Zebra', fala: 'shopping-zebra' }],
    ['flores', 26, 12], ['banco', 30, 12, { var: { cor: '#c08a5a' } }],
    ['vila-shopping-placa', 31, 10, { var: { tipo: 'pet' } }],
    ['vila-shopping-cerca', 32, 10], ['vila-shopping-cerca', 33, 10], ['vila-shopping-cerca', 34, 10],
    ['vila-shopping-cachorro', 33, 11, { nome: 'Cachorrinho', fala: 'shopping-cachorro', junto: true }],
    ['vila-shopping-casinha', 35, 10], ['almofada', 32, 12, { var: { cor: '#ff86bb' } }], ['vila-shopping-petiscos', 35, 12],
  ];

  R.registrarInterior({
    id: 'vila-shopping',
    lugar: 'bosque',
    nome: 'Shopping Terrazo',
    entrada: false,
    pacote: 'interior-bosque',
    tamanho: { w: 37, h: 14 },
    spawn: { x: SAIDA.x, y: SAIDA.y - 1 },
    comodos: [
      { id: 'vila-shopping-gourmet', nome: 'Terraço Gourmet', placa: 'Terraço Gourmet', rect: { x: 1, y: 1, w: 10, h: 12 },
        piso: 'azulejo', parede: 'tijolo',
        paleta: { piso: '#fff1de', piso2: '#f0cfae', detalhe: '#ff8a3d' } },
      { id: 'vila-shopping-lojas', nome: 'Corredor das Lojas', placa: 'Shopping Terrazo', rect: { x: 12, y: 1, w: 13, h: 12 },
        piso: 'mosaico', parede: 'papel',
        paleta: { piso: '#f7f3ec', piso2: '#ffb06a', detalhe: '#4fc8b8', parede: '#fff4e8', parede2: '#f3e4d0', rodape: '#e0621e' } },
      { id: 'vila-shopping-zoo', nome: 'Zoo Parque', placa: 'Zoo Parque', rect: { x: 26, y: 1, w: 10, h: 12 },
        piso: 'carpete', parede: 'papel',
        paleta: { piso: '#bfe69a', piso2: '#a2d47c', parede: '#ffe9b8', parede2: '#ffd890', rodape: '#c0782a', detalhe: '#ffffff' } },
    ],
    portas: [{ x: 11, y: 8, w: 1, h: 2 }, { x: 25, y: 8, w: 1, h: 2 }],   // Terraço ↔ Lojas ↔ Zoo
    corredores: [{ x: 1, y: 8, w: 35, h: 2 }, { x: 17, y: 4, w: 3, h: 8 }],
    escadas: [{ x: SAIDA.x, y: SAIDA.y, para: 'vila', sentido: 'portal', seta: 'desce', chegar: { x: 0, y: -1 } }],
    objetos: objetos(gourmet.concat(lojas, zoo)),
  });
})();
