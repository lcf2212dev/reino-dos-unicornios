/* Minha Casa, por dentro dos lugares famosos (pedido de 19/11: "coloque pra permitir ENTRAR nos lugares"; casa.md §2):
   um interior pequeno por lugar comprado no Mercado da Garagem, 'casa-lugar-<nome>' ('lugar-torre-eiffel' →
   'casa-lugar-torre-eiffel', Reino._predios.casa.dentroDoLugar, de casa/vila-lugares.js). Entra-se pela porta do lote
   na Vila dos Lugares Famosos (escada `portal` aberta só com o lugar comprado) ou tocando nele; a saída, a escada
   `portal` de baixo (8, 10), volta para a frente do lote (o par dela na vila). Um cômodo de 14 × 10, montado por
   `montar(tema)`: piso, parede e paleta da biblioteca, a lista de objetos do tema e o que todos têm (o capacho da
   saída e a maquete do lugar, que mostra o nome e o país no aviso pequeno: ação `lugarMaquete`). Dois objetos falam
   uma curiosidade de cada lugar (voz da narradora, pacote interior-casa). Objetos temáticos: lugares-dentro-objetos.js
   e -2.js ('casa-dentro-*'). Formato: docs/contratos/interiores.md §3. Confira com
   node jogo/ferramentas/validar/validar-interiores.js --so casa --detalhes. */
(function () {
  var R = window.Reino;
  var CASA = R._predios.casa;
  var SAIDA = { x: 8, y: 10 };

  /* ---------- as falas (texto exato = voz; até 30 letras por página) ---------- */
  var F = {
    'dentro-eiffel-elevador': ['O elevador sobe a torre!', 'Ela tem mais de 300 metros!'],
    'dentro-eiffel-cafe': ['Um croissant de Paris!', 'A torre é toda de ferro!'],
    'dentro-piramides-hieroglifos': ['Olha os hieróglifos!', 'Era a escrita do Egito antigo.'],
    'dentro-piramides-sarcofago': ['O sarcófago do faraó!', 'Faraó era o rei do Egito.'],
    'dentro-big-ben-sino': ['O sino se chama «Big Ben»!', 'Ele toca de hora em hora.'],
    'dentro-big-ben-relogio': ['O relógio, visto por dentro!', 'Ele tem 4 mostradores.'],
    'dentro-pisa-caracol': ['Uma escada em caracol!', 'São quase 300 degraus!'],
    'dentro-pisa-coluna': ['Ela é uma torre torta!', 'O chão embaixo dela é mole.'],
    'dentro-liberdade-tocha': ['A tocha de verdade da estátua!', 'Ela foi presente da França.'],
    'dentro-liberdade-coroa': ['A coroa tem 7 pontas!', 'Ela é de cobre e ficou verde.'],
    'dentro-cristo-vista': ['Que vista linda do Rio!', 'O Cristo tem 30 metros!'],
    'dentro-cristo-capela': ['Uma capelinha bem pequena!', 'Ela fica no pé do Cristo.'],
    'dentro-pao-bondinho': ['O bondinho anda no cabo!', 'Ele passeia desde 1912!'],
    'dentro-pao-binoculo': ['Olha o mar lá embaixo!', 'O morro tem 396 metros!'],
    'dentro-muralha-vista': ['Olha a muralha lá fora!', 'Ela tem mais de 2 mil anos!'],
    'dentro-muralha-luneta': ['O vigia olhava daqui!', 'A muralha protegia a China.'],
    'dentro-cataratas-vista': ['Que barulhão de água!', 'São cerca de 275 quedas!'],
    'dentro-cataratas-quati': ['Olha um quati de rabo listrado!', 'Ele mora perto das quedas.'],
    'dentro-taj-arco': ['Tudo aqui é de mármore!', 'Um rei fez para a rainha.'],
    'dentro-taj-pavao': ['Um pavão bem colorido!', 'Ele é a ave da Índia!'],
    'dentro-basilio-cupula': ['Cada cúpula tem uma cor!', 'A catedral fica em Moscou.'],
    'dentro-basilio-matrioska': ['Bonecas uma dentro da outra!', 'São as matrioscas da Rússia.'],
    'dentro-fuji-vista': ['O Monte Fuji é um vulcão!', 'É o mais alto do Japão.'],
    'dentro-fuji-cha': ['Hora do chá verde!', 'No Japão se toma muito chá.'],
  };
  R.falasDoPredio('casa', { objetos: F });

  /* ---------- os temas: [tipo, x, y, extra?]; 'casa-dentro-' abrevia-se '~'; extra.fala = chave de F ---------- */
  var TEMAS = {
    'lugar-torre-eiffel': { piso: 'taco', parede: 'papel', maquete: [8, 4],
      paleta: { piso: '#f0cfa0', piso2: '#d8ae78', parede: '#f6ead6', parede2: '#e8d2b0', rodape: '#8a5a3a', detalhe: '#5fb4ff' },
      objetos: [['~trelica', 1, 1], ['~janela-paris', 2, 1], ['quadro', 4, 1], ['relogio-parede', 10, 1], ['~janela-paris', 11, 1], ['~trelica', 14, 1],
        ['cesto', 1, 3], ['banco', 2, 3], ['flores', 4, 3], ['~elevador', 5, 3, { nome: 'Elevador', fala: 'dentro-eiffel-elevador' }],
        ['cesto', 11, 3], ['pilha-livros', 12, 3], ['planta-alta', 13, 3], ['vaso-grande', 14, 3],
        ['cadeira', 1, 5], ['~mesa-cafe', 2, 5, { nome: 'Mesinha do café', fala: 'dentro-eiffel-cafe' }], ['cadeira', 3, 5], ['flores', 5, 5],
        ['cadeira', 1, 8], ['~mesa-cafe', 2, 8], ['cadeira', 3, 8], ['vaso-planta', 5, 8],
        ['cavalete', 13, 5], ['luminaria-pe', 10, 5], ['tapete-redondo', 11, 6], ['poltrona', 14, 6], ['sofa', 12, 8],
        ['cesto', 1, 10], ['vaso-planta', 7, 10], ['vaso-planta', 9, 10], ['flores', 12, 10], ['vaso-planta', 14, 10]] },
    'lugar-piramides': { piso: 'pedra', parede: 'pedra', maquete: [3, 8],
      paleta: { piso: '#ecd29a', piso2: '#d8b878', parede: '#e8c88a', parede2: '#d4ac6a', rodape: '#a8784a', detalhe: '#3a6ab0' },
      objetos: [['bau-tocha', 1, 1], ['~hieroglifos', 2, 1, { nome: 'Hieróglifos', fala: 'dentro-piramides-hieroglifos' }], ['bau-tocha', 5, 1],
        ['bau-tocha', 11, 1], ['~hieroglifos', 12, 1], ['bau-tocha', 14, 1],
        ['bau-saco', 1, 3], ['dunas-vaso', 4, 3], ['bau-gemas', 5, 3], ['dunas-coluna', 6, 3], ['~sarcofago', 8, 3, { nome: 'Sarcófago', fala: 'dentro-piramides-sarcofago' }],
        ['dunas-coluna', 10, 3], ['bau-saco', 11, 3], ['bau-arca', 12, 3], ['bau-saco', 14, 3],
        ['~gato-egito', 2, 5], ['castelo-pergaminhos', 4, 5], ['museu-anfora', 6, 5], ['dunas-vaso', 1, 8], ['bau-saco', 6, 8],
        ['bau-monte', 11, 5], ['bau-pilha', 14, 6], ['museu-anfora', 10, 7], ['bau-gemas', 12, 7], ['bau', 14, 8], ['tapete-listrado', 11, 9],
        ['dunas-pedra', 1, 10], ['bau-saco', 4, 10], ['dunas-vaso', 7, 10], ['dunas-vaso', 9, 10], ['bau-cristal', 13, 10]] },
    'lugar-big-ben': { piso: 'tabuas', parede: 'tijolo', maquete: [11, 5],
      paleta: { piso: '#e2b98a', piso2: '#c99a68', parede: '#d89a7a', parede2: '#b87a5a', rodape: '#6b4428', detalhe: '#ffd34d' },
      objetos: [['torre-mostrador', 1, 1, { nome: 'Relógio', fala: 'dentro-big-ben-relogio' }], ['relogio-parede', 4, 1], ['torre-engrenagem-grande', 10, 1],
        ['janela', 12, 1], ['bandeirinhas', 13, 1],
        ['caixote', 2, 3], ['torre-caixa-pecas', 3, 3], ['cadeira', 4, 3], ['~sino-grande', 6, 3, { nome: 'Sino', fala: 'dentro-big-ben-sino' }],
        ['torre-pendulo', 9, 3], ['caixote', 10, 3], ['barril', 11, 3], ['flores', 12, 3], ['banco', 13, 3],
        ['torre-maquina', 2, 5], ['~guarda', 5, 5], ['tapete', 1, 7], ['cadeira', 4, 8],
        ['~cabine', 14, 5], ['torre-engrenagens', 11, 8], ['relogio-pe', 14, 8],
        ['torre-caixa-pecas', 1, 10], ['torre-engrenagens', 3, 10], ['vaso-planta', 7, 10], ['vaso-planta', 9, 10], ['caixote', 11, 10], ['torre-sino', 12, 10], ['barril', 14, 10]] },
    'lugar-torre-pisa': { piso: 'mosaico', parede: 'pedra', maquete: [11, 5],
      paleta: { piso: '#f2eee6', piso2: '#d8d0c4', parede: '#f4f0ea', parede2: '#ddd4c6', rodape: '#9a8a7a', detalhe: '#7fc85a' },
      objetos: [['vitral', 1, 1], ['~janela-pisa', 2, 1], ['quadro', 4, 1], ['~janela-pisa', 11, 1], ['estandarte', 13, 1, { var: { cor: '#ff5c6a' } }], ['vitral', 14, 1],
        ['flores', 1, 3], ['banco', 2, 3], ['cesto', 4, 3], ['~coluna', 5, 3], ['~caracol', 7, 3, { nome: 'Escada em caracol', fala: 'dentro-pisa-caracol' }],
        ['~coluna', 10, 3], ['banco', 11, 3], ['flores', 13, 3], ['cesto', 14, 3],
        ['vaso-grande', 1, 5], ['~coluna', 3, 5, { nome: 'Coluna de mármore', fala: 'dentro-pisa-coluna' }], ['torre-sino', 5, 5],
        ['mesa', 1, 8], ['cadeira', 3, 8], ['luminaria-pe', 5, 8],
        ['torre-sino', 13, 5], ['tapete', 11, 7], ['planta-alta', 14, 8],
        ['vaso-planta', 1, 10], ['pilha-livros', 4, 10], ['vaso-planta', 7, 10], ['vaso-planta', 9, 10], ['globo', 12, 10], ['vaso-planta', 14, 10]] },
    'lugar-liberdade': { piso: 'mosaico', parede: 'papel', maquete: [11, 5],
      paleta: { piso: '#e4f2ec', piso2: '#bfe0d4', parede: '#e8f6f0', parede2: '#c8e8dc', rodape: '#3f9a82', detalhe: '#ffd34d' },
      objetos: [['museu-fotos', 1, 1], ['mapa-parede', 2, 1], ['quadro', 4, 1], ['estandarte', 10, 1, { var: { cor: '#5fb4ff' } }], ['bandeirinhas', 11, 1],
        ['museu-fotos', 13, 1], ['janela', 14, 1],
        ['cesto', 1, 3], ['museu-legenda', 2, 3], ['luminaria-pe', 5, 3], ['vaso-planta', 6, 3], ['flores', 7, 3], ['~tocha', 8, 3, { nome: 'Tocha', fala: 'dentro-liberdade-tocha' }],
        ['museu-cordao', 6, 4], ['museu-cordao', 9, 4], ['flores', 12, 3], ['cesto', 14, 3],
        ['~coroa', 2, 5, { nome: 'Coroa', fala: 'dentro-liberdade-coroa' }], ['banco', 4, 7], ['vitrine', 1, 8], ['~tabua', 5, 9],
        ['pedestal', 13, 5], ['vitrine', 11, 8], ['vaso-grande', 14, 8], ['museu-legenda', 10, 6],
        ['vaso-planta', 1, 10], ['museu-legenda', 4, 10], ['vaso-planta', 7, 10], ['vaso-planta', 9, 10], ['banco', 11, 10], ['vaso-planta', 14, 10]] },
    'lugar-cristo': { piso: 'pedra', parede: 'papel', maquete: [13, 5],
      paleta: { piso: '#e6e1ee', piso2: '#cfc8dc', parede: '#f8f6ff', parede2: '#e2ddf2', rodape: '#8a7aaa', detalhe: '#ffd34d' },
      objetos: [['vitral', 1, 1], ['~janela-rio', 2, 1, { nome: 'Janela', fala: 'dentro-cristo-vista' }], ['vitral', 4, 1], ['arandela', 6, 1], ['arandela', 9, 1],
        ['vitral', 11, 1], ['~janela-rio', 12, 1], ['vitral', 14, 1],
        ['flores', 1, 3], ['flores', 4, 3], ['castelo-candelabro', 5, 3], ['~altar', 7, 3, { nome: 'Altar', fala: 'dentro-cristo-capela' }],
        ['flores', 9, 3], ['castelo-candelabro', 10, 3], ['flores', 11, 3], ['pilha-livros', 12, 3], ['cesto', 14, 3],
        ['castelo-tapete-real', 7, 5], ['banco', 2, 5], ['banco', 2, 7], ['vaso-planta', 5, 6], ['planta-alta', 1, 9], ['cesto', 4, 9],
        ['banco', 10, 5], ['banco', 10, 7], ['museu-vela', 14, 8], ['pedestal', 12, 9],
        ['vaso-grande', 1, 10], ['flores', 4, 10], ['flores', 7, 10], ['flores', 9, 10], ['flores', 12, 10], ['vaso-grande', 14, 10]] },
    'lugar-pao-de-acucar': { piso: 'azulejo', parede: 'papel', maquete: [11, 5],
      paleta: { piso: '#eef4f8', piso2: '#d0dfe8', parede: '#e8f4ff', parede2: '#c8e4f8', rodape: '#5fb4ff', detalhe: '#ffc94d' },
      objetos: [['~janela-mar', 1, 1], ['cartaz', 3, 1], ['relogio-parede', 4, 1], ['relogio-parede', 9, 1], ['~janela-mar', 12, 1], ['cartaz', 14, 1],
        ['flores', 1, 3], ['banco', 2, 3], ['geografia-placa', 5, 3], ['~bondinho', 6, 3, { nome: 'Bondinho', fala: 'dentro-pao-bondinho' }],
        ['geografia-bilheteria', 10, 3], ['banco', 12, 3], ['cesto', 14, 3],
        ['~binoculo', 2, 5, { nome: 'Binóculo', fala: 'dentro-pao-binoculo' }], ['~binoculo', 4, 5], ['geografia-mala', 1, 7], ['geografia-mapa-estacao', 2, 8], ['~mico', 5, 8],
        ['geografia-mala', 14, 5], ['banco', 11, 7], ['planta-alta', 14, 8], ['cesto', 10, 9],
        ['vaso-planta', 1, 10], ['geografia-mala', 4, 10], ['vaso-planta', 7, 10], ['vaso-planta', 9, 10], ['flores', 12, 10], ['vaso-planta', 14, 10]] },
    'lugar-muralha': { piso: 'pedra', parede: 'pedra', maquete: [11, 5],
      paleta: { piso: '#d8d4e4', piso2: '#c2bcd4', parede: '#c9c2d6', parede2: '#a8a0b8', rodape: '#e0403a', detalhe: '#ffd34d' },
      objetos: [['~lanterna-china', 1, 1], ['~janela-muralha', 2, 1, { nome: 'Janela', fala: 'dentro-muralha-vista' }], ['~lanterna-china', 4, 1],
        ['~lanterna-china', 10, 1], ['~janela-muralha', 11, 1], ['~lanterna-china', 13, 1], ['estandarte', 14, 1, { var: { cor: '#e0403a' } }],
        ['barril', 1, 3], ['caixote', 4, 3], ['torre-luneta', 6, 3, { nome: 'Luneta', fala: 'dentro-muralha-luneta' }], ['museu-tambor', 8, 3],
        ['barril', 10, 3], ['caixote', 11, 3], ['bau', 12, 3], ['cesto', 14, 3],
        ['~panda', 2, 5], ['casa-movel-jogo-cha', 4, 5], ['tapete', 1, 7], ['castelo-pergaminhos', 5, 7], ['casa-movel-bambu', 1, 9], ['vaso-grande', 4, 9],
        ['casa-movel-bambu', 14, 5], ['castelo-arca', 11, 8], ['vaso-grande', 14, 8],
        ['cesto', 1, 10], ['vaso-planta', 7, 10], ['vaso-planta', 9, 10], ['cesto', 12, 10], ['barril', 14, 10]] },
    'lugar-cataratas': { piso: 'tabuas', parede: 'pedra', maquete: [11, 5],
      paleta: { piso: '#e2b98a', piso2: '#c99a68', parede: '#b8d8a8', parede2: '#98c088', rodape: '#5e9a3a', detalhe: '#5fb4ff' },
      objetos: [['casa-movel-arco-iris', 1, 1], ['~janela-cataratas', 3, 1, { nome: 'Janela', fala: 'dentro-cataratas-vista' }], ['~janela-cataratas', 10, 1],
        ['casa-movel-arco-iris', 12, 1], ['janela', 14, 1],
        ['bosque-samambaia', 1, 3], ['bosque-flores', 2, 3], ['planta-alta', 5, 3], ['~tucano', 6, 3], ['dunas-lago', 7, 3], ['bosque-pedra', 9, 3],
        ['bosque-samambaia', 10, 3], ['flores', 11, 3], ['bosque-arbusto', 12, 3], ['bosque-pedra', 14, 3],
        ['~quati', 2, 5, { nome: 'Quati', fala: 'dentro-cataratas-quati' }], ['lab-beija-flor', 5, 5], ['bosque-flores', 5, 7], ['~passarela', 1, 7], ['cabideiro', 1, 9], ['banco', 3, 9],
        ['lab-onca', 14, 5], ['~passarela', 10, 7], ['~tucano', 13, 8], ['placa-chao', 10, 9],
        ['bosque-pedra', 1, 10], ['vaso-planta', 7, 10], ['vaso-planta', 9, 10], ['bosque-samambaia', 12, 10], ['planta-alta', 14, 10]] },
    'lugar-taj-mahal': { piso: 'mosaico', parede: 'azulejo', maquete: [11, 5],
      paleta: { piso: '#f8f6f2', piso2: '#e4ded4', parede: '#fbf9f5', parede2: '#ece6dc', rodape: '#b58cff', detalhe: '#6fdc8c' },
      objetos: [['cortina', 1, 1], ['~arco-mogol', 2, 1, { nome: 'Arco de mármore', fala: 'dentro-taj-arco' }], ['arandela', 4, 1], ['arandela', 10, 1],
        ['~arco-mogol', 11, 1], ['espelho', 13, 1], ['cortina', 14, 1],
        ['vaso-grande', 1, 3], ['flores', 4, 3], ['planta-alta', 5, 3], ['fonte', 7, 3], ['planta-alta', 9, 3], ['flores', 10, 3], ['vaso-grande', 12, 3], ['vaso-grande', 14, 3],
        ['~espelho-agua', 2, 5], ['~pavao', 5, 5, { nome: 'Pavão', fala: 'dentro-taj-pavao' }], ['flores', 1, 5], ['flores', 4, 8], ['vila-almofadas', 1, 9],
        ['castelo-candelabro', 14, 5], ['tapete', 11, 7], ['vila-almofadas', 14, 7], ['casa-movel-jogo-cha', 12, 9],
        ['vaso-grande', 1, 10], ['flores', 4, 10], ['vaso-planta', 7, 10], ['vaso-planta', 9, 10], ['vaso-grande', 14, 10]] },
    'lugar-sao-basilio': { piso: 'mosaico', parede: 'tijolo', maquete: [11, 5],
      paleta: { piso: '#fbe6c8', piso2: '#e8c0a0', parede: '#e07a5a', parede2: '#c05a3a', rodape: '#3a6ab0', detalhe: '#ffd34d' },
      objetos: [['vitral', 1, 1], ['~pintura-flores', 2, 1], ['arandela', 4, 1], ['~pintura-flores', 11, 1], ['arandela', 13, 1], ['vitral', 14, 1],
        ['flores', 1, 3], ['banco', 2, 3], ['castelo-candelabro', 5, 3], ['~cupula', 6, 3, { var: { c1: '#e0403a', c2: '#6fdc8c' } }],
        ['~cupula', 8, 3, { nome: 'Cúpula', fala: 'dentro-basilio-cupula', var: { c1: '#5fb4ff', c2: '#ffffff' } }], ['~cupula', 10, 3, { var: { c1: '#ffd34d', c2: '#6fdc8c' } }],
        ['banco', 11, 3], ['flores', 13, 3], ['vaso-grande', 14, 3],
        ['~matrioska', 2, 5, { nome: 'Matrioscas', fala: 'dentro-basilio-matrioska' }], ['~samovar', 4, 5], ['tapete-listrado', 1, 7], ['museu-vela', 5, 7], ['pedestal', 1, 9],
        ['~matrioska', 14, 5], ['tapete', 11, 7], ['castelo-candelabro', 14, 8], ['vila-almofadas', 12, 9],
        ['vaso-grande', 1, 10], ['cesto', 4, 10], ['flores', 7, 10], ['flores', 9, 10], ['vaso-grande', 14, 10]] },
    'lugar-monte-fuji': { piso: 'palha', parede: 'madeira', maquete: [11, 5],
      paleta: { piso: '#e8dca0', piso2: '#c8bc80', parede: '#f4ecd8', parede2: '#d8c8a0', rodape: '#8a4a3a', detalhe: '#e0403a' },
      objetos: [['estandarte', 1, 1, { var: { cor: '#e0403a' } }], ['~janela-fuji', 2, 1, { nome: 'Janela', fala: 'dentro-fuji-vista' }], ['quadro', 4, 1],
        ['~janela-fuji', 11, 1], ['estandarte', 13, 1, { var: { cor: '#e0403a' } }], ['cortina', 14, 1],
        ['flores', 1, 3], ['cesto', 4, 3], ['casa-movel-bambu', 5, 3], ['~cerejeira', 6, 3], ['~lanterna-pedra', 8, 3], ['~cerejeira', 10, 3],
        ['cesto', 12, 3], ['flores', 13, 3], ['bosque-pedra', 14, 3], ['~torii', 7, 7],
        ['vila-almofadas', 1, 5], ['~mesa-cha', 2, 5, { nome: 'Mesa do chá', fala: 'dentro-fuji-cha' }], ['vila-almofadas', 4, 5], ['bosque-pedra', 1, 8], ['dunas-lago', 2, 8], ['~lanterna-pedra', 5, 8],
        ['~cerejeira', 14, 5], ['~mesa-cha', 11, 8], ['vila-almofadas', 13, 8], ['casa-movel-bambu', 14, 9],
        ['vaso-planta', 1, 10], ['bosque-pedra', 4, 10], ['flores', 7, 10], ['flores', 9, 10], ['flores', 14, 10]] },
  };

  /* ---------- a montagem ---------- */
  function lugares() { return (R.moveisCasa || []).filter(function (m) { return m.loja === 'lugares'; }); }
  function objeto(o) {
    var r = { tipo: o[0].replace(/^~/, 'casa-dentro-'), x: o[1], y: o[2] }, ex = o[3] || {};
    Object.keys(ex).forEach(function (k) { if (k !== 'fala') r[k] = ex[k]; });
    if (ex.fala) r.fala = F[ex.fala];
    return r;
  }
  function montar(m, t) {
    var id = CASA.dentroDoLugar(m.id);
    var objetos = t.objetos.map(objeto).concat([
      { tipo: 'vila-capacho', x: SAIDA.x, y: SAIDA.y },
      { tipo: m.objeto, x: t.maquete[0], y: t.maquete[1], alto: true, nome: 'Maquete: ' + m.nome, acao: { tipo: 'lugarMaquete', lugar: m.id } },
    ]);
    R.registrarInterior({
      id: id,
      lugar: 'casa',
      nome: m.nome,
      pacote: 'interior-casa',
      tamanho: { w: 16, h: 12 },
      spawn: { x: SAIDA.x, y: SAIDA.y - 1 },
      // a saída volta para a porta do lote na vila (o par: casa/vila-lugares.js); quem chega aparece logo acima dela
      escadas: [{ x: SAIDA.x, y: SAIDA.y, para: 'casa-lugares', sentido: 'portal', seta: 'desce', chegar: { x: 0, y: -1 }, olhar: { x: 0, y: 1 } }],
      comodos: [{ id: id, nome: m.nome, placa: m.nome, rect: { x: 1, y: 1, w: 14, h: 10 }, piso: t.piso, parede: t.parede, paleta: t.paleta }],
      portas: [],
      // o caminho da saída até o meio
      corredores: [{ x: 7, y: 6, w: 3, h: 4 }],
      objetos: objetos,
      npcs: [],
    });
  }
  lugares().forEach(function (m) { if (TEMAS[m.id]) montar(m, TEMAS[m.id]); });

  /* ---------- a maquete: o nome e o país no aviso pequeno (só na tela) ---------- */
  function maquete(acao) {
    var m = R.movelCasa && R.movelCasa(acao && acao.lugar), UI = R.UI;
    if (m && UI && UI.avisoItem) UI.avisoItem({ icone: '🗽', texto: m.nome + (m.pais ? ', ' + m.pais : '') + '!' });
    return Promise.resolve();
  }
  R.registrarModulo({ id: 'lugares-dentro', acoes: { lugarMaquete: maquete } });
})();
