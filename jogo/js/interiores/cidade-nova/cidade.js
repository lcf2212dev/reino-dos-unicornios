/* A Cidade Nova (docs/contratos/cidade-nova.md): a cidade menor que se alcança pelo portal no
   centro-direita do Bosque. Uma praça, 4 lojas (Casa & Lar, Forja das Lâminas, Elmos & Chapéus,
   Armaduras & Botas), 3 terrenos livres, o portal de volta e as duas Teleportadoras (entrada e
   praça). `lugar: 'bosque'` porque ela é uma cena extra do mesmo prédio/céu; a entrada no mapa é
   o portal do Bosque, não uma porta da cidade principal. */
(function () {
  var R = window.Reino, I = R.Interiores;
  var P = R.config.lojaCidade || {};
  var LOJAS = [
    { id: 'casa', cor: '#ffb3d9', tipo: 'casa', interior: 'loja-casa', x: 3, y: 3, px: 7, py: 6 },
    { id: 'armas', cor: '#8fd8ff', tipo: 'armas', interior: 'loja-armas', x: 14, y: 3, px: 18, py: 6 },
    { id: 'cabecas', cor: '#c9b8ff', tipo: 'cabecas', interior: 'loja-cabecas', x: 25, y: 3, px: 29, py: 6 },
    { id: 'armaduras', cor: '#ffd34d', tipo: 'armaduras', interior: 'loja-armaduras', x: 36, y: 3, px: 40, py: 6 },
  ];
  var OBJ = [];
  function poe(tipo, x, y, extra) {
    var o = { tipo: tipo, x: x, y: y };
    Object.keys(extra || {}).forEach(function (k) { o[k] = extra[k]; });
    OBJ.push(o);
  }
  // lojas: a fachada e a porta da frente (a porta leva ao interior da loja)
  LOJAS.forEach(function (l) {
    poe('cidade-loja', l.x, l.y, { var: { cor: l.cor, tipo: l.tipo } });
    poe('cidade-porta', l.px, l.py, { junto: true, nome: R.LojaCidade.LOJAS[l.id].nome, var: { cor: l.cor },
      acao: { tipo: 'entrarLoja', interior: l.interior, chegar: { x: 8, y: 9 } } });
  });
  // praça e fonte
  poe('fonte', 23, 14);
  poe('banco', 19, 17); poe('banco', 27, 17);
  poe('tapete', 22, 22);
  [[21, 15], [27, 15], [21, 20], [29, 20], [22, 18], [28, 18], [17, 14], [31, 14]].forEach(function (p) { poe('flores', p[0], p[1]); });
  [[20, 13], [29, 13], [20, 23], [29, 23], [12, 7], [23, 7], [34, 7], [45, 7]].forEach(function (p) { poe('luminaria-pe', p[0], p[1]); });
  poe('cidade-teleportadora', P.teleportadoraPraca.x, P.teleportadoraPraca.y, { nome: 'Teleportadora', acao: { tipo: 'teleportadora', destino: 'principal' } });
  poe('cidade-bandeira', 17, 12); poe('cidade-bandeira', 32, 12);
  poe('cidade-banca', 13, 10, { var: { cor: '#ff9cc6' } });
  poe('cidade-banca', 33, 21, { var: { cor: '#8fd8ff' } });
  poe('cidade-mural', 9, 11);
  poe('cidade-cartaz', 16, 16, { nome: 'Cartaz da praça', fala: ['Bem-vinda à Cidade Nova!'] });
  // entrada: o portal de volta ao Bosque e a Teleportadora da entrada
  poe('cidade-portal-bosque', P.portalCidade.x, P.portalCidade.y, { nome: 'Portal do Bosque', acao: { tipo: 'portalCidade', para: 'bosque' } });
  poe('cidade-teleportadora', P.teleportadoraEntrada.x, P.teleportadoraEntrada.y, { nome: 'Teleportadora', acao: { tipo: 'teleportadora', destino: 'principal' } });
  poe('banco', 31, 32);
  poe('luminaria-pe', 23, 32); poe('luminaria-pe', 34, 32);
  poe('cidade-bandeira', 21, 30);
  // terrenos livres (andáveis, com a placa "?")
  [[2, 24], [42, 24], [11, 30]].forEach(function (p, i) {
    poe('cidade-terreno', p[0], p[1], { nome: 'Terreno livre', fala: ['Terreno livre para a próxima novidade!'] });
    poe('caixote', p[0] - 1, p[1] + 3, { var: { cor: '#c9a27a' } });
  });
  // árvores e vasos
  [[11, 3], [23, 3], [34, 3], [46, 3], [8, 28], [38, 31], [2, 33], [46, 33], [3, 12], [44, 12], [15, 22]].forEach(function (p) { poe('cidade-arvore', p[0], p[1]); });
  [[9, 7], [26, 7], [37, 7], [6, 16], [43, 16], [18, 33], [33, 28]].forEach(function (p) { poe('vaso-planta', p[0], p[1], { var: { vaso: '#ff9cc6' } }); });
  [[5, 20], [45, 20], [7, 31], [40, 30]].forEach(function (p) { poe('barril', p[0], p[1]); });

  R.registrarInterior({
    id: 'cidade-nova', lugar: 'portal:cidade-nova', nome: 'Cidade Nova', entrada: false, portal: true,
    pacote: 'interior-bosque', fundo: 'cidade', tamanho: { w: 50, h: 38 },
    spawn: { x: 25, y: 33 },
    comodos: [{
      id: 'praca', nome: 'Praça da Cidade Nova', rect: { x: 1, y: 1, w: 48, h: 36 },
      piso: 'pedra', parede: 'pedra', paleta: { piso: '#c9b8a0', piso2: '#b8a488', parede: '#d9c4a8', parede2: '#c9b090', rodape: '#8a6a4a', detalhe: '#ff9cc6' },
    }],
    corredores: [{ x: 1, y: 3, w: 48, h: 34 }],
    objetos: OBJ,
  });
})();
