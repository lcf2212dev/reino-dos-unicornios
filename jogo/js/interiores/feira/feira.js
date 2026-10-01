/* Feira de Ciências: seis pavilhões conectados, com cinco mundos de descoberta e um hall.
   Trilhas coloridas e portas largas ligam as salas. Cada instalação abre uma brincadeira do seu tema.
   Objetos e cenários em objetos*.js; conteúdo de Ciências em dados.js, sem alterar progresso escolar. */
(function () {
  var R = window.Reino;
  var F = R.FALAS_INTERIORES.feira;
  var salas = [
    { id: 'jardim', nome: 'Jardim da Vida', x: 1, y: 1, cor: '#198b61', clara: '#d5f3bd', parede: '#f0ffd8', piso: 'tabuas',
      pecas: ['estufa', 'formigueiro', 'jardineira'] },
    { id: 'teia', nome: 'Teia dos Bichos', x: 15, y: 1, cor: '#d56831', clara: '#ffe2ba', parede: '#fff1d5', piso: 'mosaico',
      pecas: ['terrario', 'bancada', 'lupa'] },
    { id: 'parcerias', nome: 'Vila das Parcerias', x: 29, y: 1, cor: '#b04489', clara: '#ffdaef', parede: '#fff0f7', piso: 'taco',
      pecas: ['colmeia', 'terrario', 'jardineira'] },
    { id: 'habitats', nome: 'Expedição dos Hábitats', x: 1, y: 15, cor: '#237ba9', clara: '#c9ecff', parede: '#ebf9ff', piso: 'azulejo',
      pecas: ['deserto', 'polar', 'aquario'] },
    { id: 'hall', nome: 'Praça das Descobertas', x: 15, y: 15, cor: '#7650b4', clara: '#ecddff', parede: '#fff1dc', piso: 'mosaico',
      pecas: ['portal', 'passaporte', 'bancada'] },
    { id: 'observatorio', nome: 'Ateliê de Descobertas', x: 29, y: 15, cor: '#497fa2', clara: '#c8f1e3', parede: '#f0fff6', piso: 'tabuas',
      pecas: ['lupa', 'aquario', 'bancada'] },
  ];
  var objetos = [], comodos = [], corredores = [];
  function por(s, tipo, x, y, extras) {
    var o = Object.assign({ tipo: tipo, x: s.x + x, y: s.y + y, var: { cor: s.cor, tema: s.id } }, extras || {});
    objetos.push(o);
    return o;
  }
  function estacao(s, tipo, x, y, chave, nome, missao) {
    var o = por(s, 'feira-' + tipo, x, y);
    o.chave = chave; o.nome = nome; o.fala = F.objetos[chave]; o.voz = 'narradora';
    o.acao = { tipo: 'feira' };
    if (s.id !== 'hall') o.acao.sala = s.id;
    if (missao) o.acao.missao = missao;
    return o;
  }
  salas.forEach(function (s) {
    var tema = R.FeiraCiencias.salas.find(function (t) { return t.id === s.id; });
    if (tema) s.nome = tema.nome;
    comodos.push({ id: s.id, nome: s.nome, placa: s.nome, rect: { x: s.x, y: s.y, w: 13, h: 13 },
      piso: s.piso, parede: 'papel',
      paleta: { piso: s.clara, piso2: R.Desenho.escurecer(s.clara, 0.08), parede: s.parede,
        parede2: s.clara, rodape: s.cor, detalhe: '#ffd34d' } });
    // Parede emoldurada: o centro fica livre para a placa e para a porta entre fileiras.
    por(s, 'janela', 0, 0); por(s, 'vitral', 1, 0);
    por(s, 'feira-bandeirolas', 2, 0);
    por(s, 'feira-painel', 9, 0);
    por(s, 'arandela', 11, 0); por(s, 'janela', 12, 0);
    // Tapetes e pistas no chão indicam as passagens sem formar barreiras.
    por(s, 'tapete', 5, 2, { w: 3, h: s.id === 'hall' ? 9 : 11, var: { cor: s.clara, borda: s.cor } });
    por(s, 'tapete-listrado', 0, 8, { w: 13, h: 2, var: { cores: [s.clara, '#fff8ee', s.clara] } });
    [[6, 3], [6, 6], [3, 9], [9, 9], [6, 11]].forEach(function (p) { if (s.id !== 'hall' || p[1] !== 11) por(s, 'feira-pegadas', p[0], p[1]); });
    por(s, 'flores', 0, 3); por(s, 'pilha-livros', 4, 3);
    por(s, 'almofada', 8, 3, { var: { cor: '#ffd34d' } });
    por(s, 'cesto', 12, 5); por(s, 'feira-flor', 0, 6);
    por(s, 'vaso-planta', 12, 7);
    por(s, 'banco', 0, 12); por(s, 'luminaria-pe', 4, 12);
    por(s, 'mesa-centro', 9, 12, { var: { itens: ['livro', 'vaso'] } });
    por(s, 'feira-jardineira', 10, 2);
    por(s, 'almofada', 2, 11, { var: { cor: s.cor } });
    por(s, 'feira-flor', 8, 11);
    // Três instalações por sala: nunca obstruem a trilha central ou as portas.
    var ch = s.id === 'hall' ? 'boasvindas' : s.id;
    estacao(s, s.pecas[0], 1, 4, ch, s.id === 'hall' ? 'Bem-vindos à Feira!' : s.nome);
    estacao(s, s.pecas[1], 9, 4, s.id === 'hall' ? 'passaporte' : ch,
      s.id === 'hall' ? 'Passaporte da visita' : 'Outra descoberta');
    estacao(s, s.pecas[2], 1, 6, s.id === 'hall' ? 'passaporte' : ch,
      s.id === 'hall' ? 'Escolha sua aventura' : 'Vamos experimentar');
    por(s, 'feira-painel', 9, 6, { parede: false, solido: false });
    // Corredores livres ligam portas a portas e as duas fileiras de pavilhões.
    corredores.push({ x: s.x, y: s.y + 8, w: 13, h: 2 });
    corredores.push({ x: s.x + 5, y: s.y + 2, w: 3, h: 11 });
  });
  // Peças específicas diferenciam os cantinhos além das três instalações principais.
  por(salas[0], 'feira-jardineira', 1, 10);
  por(salas[1], 'feira-terrario', 9, 10);
  por(salas[2], 'feira-colmeia', 0, 10);
  por(salas[3], 'feira-flor', 1, 10);
  por(salas[4], 'feira-bandeirolas', 8, 10, { parede: false, solido: false });
  por(salas[5], 'feira-lupa', 0, 10);
  R.registrarInterior({
    id: 'feira', lugar: 'feira', nome: 'Feira de Ciências', entrada: true, pacote: 'interior-feira',
    tamanho: { w: 43, h: 29 }, saida: { x: 21, y: 27 }, spawn: { x: 21, y: 26 },
    comodos: comodos,
    portas: [
      { x: 14, y: 9, w: 1, h: 2 }, { x: 28, y: 9, w: 1, h: 2 },
      { x: 14, y: 23, w: 1, h: 2 }, { x: 28, y: 23, w: 1, h: 2 },
      { x: 6, y: 14, w: 3, h: 3 }, { x: 20, y: 14, w: 3, h: 3 }, { x: 34, y: 14, w: 3, h: 3 },
    ],
    corredores: corredores, objetos: objetos, npcs: [],
  });
})();
