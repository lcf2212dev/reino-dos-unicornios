/* Três ambientes ligados por um corredor: estúdio, laboratório e palco dos jogos. */
(function () {
  var R = window.Reino, S = R._predios['escola-musica'];
  var F = R.FALAS_INTERIORES['escola-musica'], objetos = [];
  function por(tipo, x, y, extra) { objetos.push(Object.assign({ tipo: tipo, x: x, y: y }, extra)); }
  function tocar(chave, nome, tipo, x, y, tela) {
    var o = { chave: chave, nome: nome, fala: F.objetos[chave], voz: 'narradora' };
    if (tela) o.acao = { tipo: 'tela', tela: tela };
    por(tipo, x, y, o);
  }
  function detalhes(x, cor) {
    por('janela', x, 1); por('arandela', x + 4, 1); por('arandela', x + 8, 1);
    por('vitral', x + 9, 1); por('janela', x + 10, 1);
    por('flores', x, 3); por('pilha-livros', x + 1, 3); por('papeis', x + 3, 3);
    por('vaso-planta', x + 10, 4); por('almofada', x + 8, 5, { var: { cor: cor } });
    por('tapete-listrado', x, 9, { w: 3, h: 1, var: { cores: [cor, '#fff8ee', S.COR2, '#fff8ee'] } });
    por('banco', x, 11); por('cesto', x + 2, 11); por('luminaria-pe', x + 3, 9);
    por('escola-musica-discos', x + 7, 10); por('vaso-grande', x + 10, 11);
    por('tapete-redondo', x + 7, 8, { w: 2, h: 2, var: { cor: cor } });
    por('cabideiro', x + 10, 9);
  }
  detalhes(1, '#d9c8f1'); detalhes(13, '#bce4da');
  // Estúdio: tratamento acústico, teclado completo, banco e partituras.
  por('escola-musica-pauta', 2, 1); por('escola-musica-acustica', 6, 1);
  por('escola-musica-tapete', 1, 4);
  tocar('teclado', 'Aula de teclado', 'escola-musica-teclado', 1, 4, 'musica-teclado');
  por('escola-musica-banco-piano', 1, 6);
  tocar('partitura', 'Estante de partituras', 'escola-musica-estante-partitura', 8, 4);
  tocar('metronomo', 'Metrônomo', 'escola-musica-metronomo', 10, 5);
  tocar('fones', 'Fones do estúdio', 'escola-musica-fones', 4, 5);
  tocar('aulas', 'Aulas e jogos', 'escola-musica-aulas', 8, 9, 'musica-aulas');
  // Laboratório: ondas sonoras na parede e instrumentos de alturas diferentes.
  por('escola-musica-ondas', 14, 1); por('relogio-parede', 19, 1);
  por('escola-musica-tapete', 13, 4, { var: { cor: '#bce4da' } });
  tocar('xilofone', 'Xilofone das alturas', 'escola-musica-xilofone', 13, 4, 'musica-fundamentos');
  tocar('fundamentos', 'Fundamentos musicais', 'escola-musica-aulas', 20, 5, 'musica-fundamentos');
  tocar('tamborins', 'Tamborins da pulsação', 'escola-musica-tamborins', 13, 6, 'musica-ritmo');
  tocar('bebedouro', 'Bebedouro', 'bebedouro', 14, 8);
  // Palco: cortina, bateria e microfone; as estações ficam voltadas para a passagem.
  por('janela', 25, 1); por('escola-musica-cortina-palco', 28, 1); por('vitral', 35, 1);
  por('arandela', 27, 1); por('arandela', 34, 1);
  por('escola-musica-palco', 28, 3);
  tocar('bateria', 'Bateria do palco', 'escola-musica-bateria', 29, 4, 'musica-ritmo');
  tocar('microfone', 'Microfone do palco', 'escola-musica-microfone', 32, 5);
  por('escola-musica-caixa-som', 27, 4); por('escola-musica-caixa-som', 33, 4);
  por('flores', 25, 3); por('papeis', 26, 3); por('vaso-planta', 35, 4);
  por('escola-musica-fones', 25, 5);
  tocar('jogos', 'Jogos musicais', 'escola-musica-aulas', 34, 5, 'musica-jogos');
  por('tapete-listrado', 25, 9, { w: 11, h: 2, var: { cores: ['#e8c0d0', '#fff8ee', S.COR2, '#fff8ee'] } });
  tocar('eco', 'Eco Musical', 'escola-musica-eco', 25, 9, 'musica-eco');
  tocar('ritmo', 'Ritmo em Peças', 'escola-musica-ritmo', 29, 9, 'musica-ritmo');
  tocar('ouvido', 'Detetive dos Sons', 'escola-musica-ouvido', 33, 9, 'musica-ouvido');
  por('almofada', 27, 11, { var: { cor: '#d9c8f1' } }); por('cesto', 28, 10);
  por('pilha-livros', 31, 11); por('vaso-grande', 35, 11); por('luminaria-pe', 35, 8);
  R.registrarInterior({
    id: 'escola-musica', lugar: 'escola-musica', nome: 'Escola de Música', entrada: true,
    pacote: 'interior-escola-musica', tamanho: { w: 37, h: 13 },
    saida: { x: 6, y: 11 }, spawn: { x: 6, y: 10 },
    comodos: [
      { id: 'teclado', nome: 'Estúdio de Teclado', placa: 'Estúdio de Teclado', rect: { x: 1, y: 1, w: 11, h: 11 }, piso: 'taco', parede: 'papel',
        paleta: { piso: '#f3d8b4', piso2: '#e4c397', parede: S.PAREDE, parede2: '#e4d8f5', rodape: S.COR, detalhe: S.COR2 } },
      { id: 'fundamentos', nome: 'Laboratório dos Sons', placa: 'Laboratório dos Sons', rect: { x: 13, y: 1, w: 11, h: 11 }, piso: 'mosaico', parede: 'papel',
        paleta: { piso: '#e2f0de', piso2: '#cbe2cf', parede: '#f5fae9', parede2: '#cce8df', rodape: '#4f877f', detalhe: S.COR2 } },
      { id: 'jogos', nome: 'Palco dos Jogos', placa: 'Palco dos Jogos', rect: { x: 25, y: 1, w: 11, h: 11 }, piso: 'tabuas', parede: 'papel',
        paleta: { piso: '#f5ddce', piso2: '#e9c7b1', parede: '#fff1e4', parede2: '#e6c6d6', rodape: '#a15380', detalhe: S.COR2 } },
    ],
    portas: [{ x: 12, y: 7, w: 1, h: 2 }, { x: 24, y: 7, w: 1, h: 2 }],
    corredores: [{ x: 1, y: 7, w: 35, h: 2 }, { x: 5, y: 3, w: 3, h: 9 },
      { x: 17, y: 3, w: 3, h: 9 }, { x: 28, y: 6, w: 5, h: 3 }],
    objetos: objetos, npcs: [],
  });
})();
