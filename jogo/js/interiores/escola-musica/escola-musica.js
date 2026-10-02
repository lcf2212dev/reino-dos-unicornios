/* Duas salas ligadas por um vão: prática de teclado e fundamentos musicais. */
(function () {
  var R = window.Reino, S = R._predios['escola-musica'];
  var F = R.FALAS_INTERIORES['escola-musica'];
  function inter(chave, nome, objeto, tela) {
    objeto.chave = chave; objeto.nome = nome; objeto.fala = F.objetos[chave]; objeto.voz = 'narradora';
    if (tela) objeto.acao = { tipo: 'tela', tela: tela };
    return objeto;
  }
  var objetos = [];
  function sala(x, fundamentos) {
    var cor = fundamentos ? '#bce4da' : '#d9c8f1';
    function por(tipo, dx, y, extra) { objetos.push(Object.assign({ tipo: tipo, x: x + dx, y: y }, extra)); }
    por('janela', 0, 1); por('escola-musica-pauta', 1, 1);
    por('arandela', 4, 1); por('arandela', 6, 1); por('vitral', 9, 1); por('janela', 10, 1);
    por('flores', 0, 3); por('pilha-livros', 1, 3); por('papeis', 3, 3);
    por('vaso-planta', 10, 4);
    por('escola-musica-tapete', 0, 4, { var: { cor: cor } });
    if (fundamentos) {
      objetos.push(inter('fundamentos', 'Fundamentos musicais', { tipo: 'escola-musica-aulas', x: x + 1, y: 5 }, 'musica-fundamentos'));
    } else {
      objetos.push(inter('teclado', 'Aula de teclado', { tipo: 'escola-musica-teclado', x: x, y: 4 }, 'musica-teclado'));
    }
    objetos.push(inter('partitura', 'Estante de partituras', { tipo: 'escola-musica-estante-partitura', x: x + 7, y: 4 }));
    objetos.push(inter('metronomo', 'Metrônomo', { tipo: 'escola-musica-metronomo', x: x + 9, y: 5 }));
    por('almofada', 8, 5, { var: { cor: cor } });
    por('tapete-listrado', 0, 9, { w: 3, h: 1, var: { cores: [cor, '#fff8ee', S.COR2, '#fff8ee'] } });
    por('banco', 0, 11); por('cesto', 2, 11); por('luminaria-pe', 3, 9);
    por('estante', 7, 11); por('vaso-grande', 10, 11);
    por('tapete-redondo', 7, 8, { w: 2, h: 2, var: { cor: cor } });
    por('cabideiro', 10, 9);
  }
  sala(1, false); sala(13, true);
  objetos.push(inter('aulas', 'Aulas de música', { tipo: 'escola-musica-aulas', x: 8, y: 9 }, 'musica-aulas'));
  objetos.push(inter('bebedouro', 'Bebedouro', { tipo: 'bebedouro', x: 14, y: 8 }));
  R.registrarInterior({
    id: 'escola-musica', lugar: 'escola-musica', nome: 'Escola de Música', entrada: true,
    pacote: 'interior-escola-musica', tamanho: { w: 25, h: 13 },
    saida: { x: 6, y: 11 }, spawn: { x: 6, y: 10 },
    comodos: [
      { id: 'teclado', nome: 'Teclado', placa: 'Teclado', rect: { x: 1, y: 1, w: 11, h: 11 }, piso: 'taco', parede: 'papel',
        paleta: { piso: '#f3d8b4', piso2: '#e4c397', parede: S.PAREDE, parede2: '#e4d8f5', rodape: S.COR, detalhe: S.COR2 } },
      { id: 'fundamentos', nome: 'Fundamentos musicais', placa: 'Fundamentos musicais', rect: { x: 13, y: 1, w: 11, h: 11 }, piso: 'mosaico', parede: 'papel',
        paleta: { piso: '#e2f0de', piso2: '#cbe2cf', parede: '#f5fae9', parede2: '#cce8df', rodape: '#4f877f', detalhe: S.COR2 } },
    ],
    portas: [{ x: 12, y: 7, w: 1, h: 2 }],
    corredores: [{ x: 1, y: 7, w: 23, h: 2 }, { x: 5, y: 3, w: 3, h: 9 }, { x: 17, y: 3, w: 3, h: 9 }],
    objetos: objetos, npcs: [],
  });
})();
