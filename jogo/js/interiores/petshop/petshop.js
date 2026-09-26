/* Pet Shop, parte 3 de 5: a Loja (balcão da Dona Aveia, comidinhas, aquário, casinha) e o Cantinho da Água
   (o bebedouro grande, toalhas e a banheira de espuma). O bebedouro é o ÚNICO lugar com água:
   enche a sede da montaria na hora, de graça (Reino.Cuidados.beber), com som e animação.
   A banheira dá o banho de espuma, também de graça (Reino.Banho, js/sistemas/banho.js).
   Aqui: ajudantes de montagem, o layout e o registro do interior. Os objetos ficam em
   petshop/objetos-loja.js e petshop/objetos-agua.js; as ações e o status da Dona Aveia em
   petshop/acoes.js; o desenho de fora, no mapa, em petshop/fora.js.
   Só dados, objetos e registros (funções guardadas); nada de DOM, PA ou Progresso no carregamento.
   As falas moram em petshop/falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.petshop) || { npcs: {}, objetos: {}, extras: [] };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  /* ================= AJUDANTES DE MONTAGEM ================= */
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  /** NPC do interior com sprite e voz do elenco. @param {string} id @param {number} x @param {number} y
      @param {AcaoNpc} acao @returns {Npc} */
  function npc(id, x, y, acao) {
    /** @type {Partial<PersonagemElenco>} */
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }
  var TELA = { tipo: 'tela', tela: 'petshop' };

  /* ================= LAYOUT ================= */
  // Loja (14×11) à esquerda, com a Dona Aveia ao lado do balcão; Cantinho da Água (9×11) à direita
  var loja = [
    // parede do fundo (y 1-2)
    { tipo: 'petshop-escovas', x: 1, y: 1 },
    { tipo: 'cortina', x: 3, y: 1, var: { cor: '#8fe0d0' } },
    { tipo: 'janela', x: 4, y: 1 },
    { tipo: 'petshop-placa-patinha', x: 5, y: 1 },
    { tipo: 'relogio-parede', x: 7, y: 1 },
    { tipo: 'prateleira-parede', x: 8, y: 1, var: { itens: ['bolo', 'planta', 'ursinho'] } },
    { tipo: 'bandeirinhas', x: 10, y: 1 },
    { tipo: 'janela', x: 12, y: 1 },
    { tipo: 'petshop-coleiras', x: 13, y: 1 },
    // fundo: nada que se toca nos cantos de cima, que somem sob as colunas do HUD (à esquerda os avisos,
    // como "🥚 1 ovo!"; à direita o ↙ e o cartão da montaria). A estante fica uma fileira à frente, à direita
    { tipo: 'petshop-sacos-feno', x: 1, y: 3 },
    { tipo: 'planta-alta', x: 2, y: 3 },
    { tipo: 'petshop-potes-biscoito', x: 3, y: 3 },
    { tipo: 'petshop-cesta-cenouras', x: 4, y: 3 },
    { tipo: 'petshop-cesta-macas', x: 5, y: 3 },
    { tipo: 'flores', x: 6, y: 3, var: { vaso: '#ff9cc6' } },
    { tipo: 'petshop-sacos-feno', x: 9, y: 3 },
    { tipo: 'caixote', x: 10, y: 3, var: { item: 'estrela' } },
    { tipo: 'petshop-potes-biscoito', x: 11, y: 3 },
    { tipo: 'petshop-sacos-feno', x: 12, y: 3 },
    { tipo: 'planta-alta', x: 13, y: 3 },
    { tipo: 'petshop-sacos-feno', x: 14, y: 3 },
    { tipo: 'petshop-balcao', x: 9, y: 4 },
    // lado esquerdo
    { tipo: 'cesto', x: 1, y: 4 },
    { tipo: 'petshop-tapete-patinhas', x: 3, y: 5, w: 3, h: 2 },
    { tipo: 'petshop-sacos-feno', x: 1, y: 6 },
    inter('aquario', 'Aquário', { tipo: 'petshop-aquario', x: 1, y: 8 }),
    { tipo: 'flores', x: 3, y: 8, var: { vaso: '#8fe0d0' } },
    inter('casinha', 'Casinha', { tipo: 'petshop-casinha', x: 4, y: 10 }),
    { tipo: 'almofada', x: 6, y: 8, var: { cor: '#ffd34d' } },
    { tipo: 'petshop-cesta-macas', x: 1, y: 11 },
    { tipo: 'cesto', x: 2, y: 11 },
    { tipo: 'caixote', x: 6, y: 11 },
    // lado direito: atrás da estante, só enfeites (o chão ali ficaria preso)
    { tipo: 'petshop-potes-biscoito', x: 13, y: 4 },
    { tipo: 'cesto', x: 14, y: 4 },
    inter('estante', 'Estante das comidinhas', { tipo: 'petshop-estante-comida', x: 13, y: 5, acao: TELA }),
    inter('bolo', 'Bolo arco-íris', { tipo: 'petshop-vitrine-bolo', x: 10, y: 6, acao: TELA }),
    inter('balanca', 'Balança', { tipo: 'petshop-balanca', x: 14, y: 7 }),
    { tipo: 'flores', x: 14, y: 6, var: { vaso: '#b58cff' } },
    { tipo: 'almofada', x: 12, y: 7, var: { cor: '#ff9cc6' } },
    { tipo: 'petshop-tapete-patinhas', x: 10, y: 10, w: 3, h: 2 },
    { tipo: 'vaso-planta', x: 14, y: 10, var: { vaso: '#8fe0d0' } },
    { tipo: 'petshop-cesta-cenouras', x: 13, y: 11 },
    { tipo: 'flores', x: 14, y: 11, var: { vaso: '#ff9cc6' } },
  ];
  var agua = [
    // parede do fundo (y 1-2)
    { tipo: 'janela', x: 16, y: 1 },
    { tipo: 'arandela', x: 17, y: 1 },            // longe da placa do cômodo (a chama não encosta)
    { tipo: 'petshop-chuveirinho', x: 18, y: 1 },
    { tipo: 'espelho', x: 22, y: 1 },
    inter('toalhas', 'Toalhas', { tipo: 'petshop-toalhas', x: 23, y: 1 }),
    // fundo: o bebedouro grande no meio
    { tipo: 'petshop-xampus', x: 16, y: 3 },
    { tipo: 'petshop-pilha-toalhas', x: 17, y: 3 },
    { tipo: 'petshop-balde-espuma', x: 18, y: 3 },
    { tipo: 'petshop-bebedouro', x: 19, y: 3, nome: 'Bebedouro', acao: { tipo: 'beber' } },
    { tipo: 'balde', x: 22, y: 3 },
    { tipo: 'flores', x: 24, y: 3, var: { vaso: '#ff9cc6' } },
    { tipo: 'petshop-xampus', x: 18, y: 4 },
    { tipo: 'vaso-planta', x: 16, y: 5, var: { vaso: '#5fb4ff' } },   // 1 fileira abaixo: os xampus aparecem inteiros
    { tipo: 'tapete-redondo', x: 17, y: 5, w: 2, h: 2, var: { cores: ['#5fb4ff', '#bfe9ff', '#ffffff', '#9fdcff'] } },
    { tipo: 'petshop-tapete-banho', x: 19, y: 5, w: 3, h: 1 },
    { tipo: 'flores', x: 24, y: 5, var: { vaso: '#9fdcff' } },
    // banheira de espuma à direita
    // banheira de espuma: o banho da montaria, de graça (js/sistemas/banho.js); ela para à esquerda, no corredor
    { tipo: 'petshop-banheira', x: 22, y: 6, nome: 'Banho de espuma', acao: { tipo: 'banho' } },
    { tipo: 'petshop-balde-espuma', x: 16, y: 7 },
    { tipo: 'petshop-espuma', x: 21, y: 7 },
    // frente
    { tipo: 'petshop-secador', x: 24, y: 9 },
    { tipo: 'petshop-pilha-toalhas', x: 16, y: 10 },
    { tipo: 'petshop-espuma', x: 18, y: 11 },
    { tipo: 'petshop-patinhos', x: 19, y: 11 },
    { tipo: 'petshop-patinhos', x: 18, y: 7 },
    { tipo: 'petshop-tapete-banho', x: 20, y: 10, w: 2, h: 1 },
    { tipo: 'cesto', x: 23, y: 11, var: { cor: '#9fdcff' } },
    { tipo: 'vaso-planta', x: 24, y: 11, var: { vaso: '#ff9cc6' } },
    { tipo: 'petshop-balde-espuma', x: 22, y: 10 },
  ];

  Reino.registrarInterior({
    id: 'petshop',
    lugar: 'petshop',
    nome: 'Pet Shop',
    entrada: true,
    pacote: 'interior-petshop',
    tamanho: { w: 26, h: 13 },
    saida: { x: 8, y: 11 },
    spawn: { x: 8, y: 10 },
    comodos: [
      { id: 'loja', nome: 'Pet Shop', placa: 'Pet Shop', rect: { x: 1, y: 1, w: 14, h: 11 },
        piso: 'taco', parede: 'papel',
        paleta: { piso: '#f3cfa0', piso2: '#dcae78', parede: '#e9fbf5', parede2: '#bfeee2', rodape: '#4fbfae', detalhe: '#ff9cc6' } },
      { id: 'agua', nome: 'Cantinho da Água', placa: 'Cantinho da Água', rect: { x: 16, y: 1, w: 9, h: 11 },
        piso: 'azulejo', parede: 'azulejo',
        paleta: { piso: '#eef8ff', piso2: '#c4e6f7', detalhe: '#8fd0ec', parede: '#f4fcff', parede2: '#a8e4f0', rodape: '#4fa8c8' } },
    ],
    portas: [{ x: 15, y: 8, w: 1, h: 2 }],   // Loja ↔ Cantinho da Água
    corredores: [
      { x: 7, y: 5, w: 3, h: 7 },     // da porta até o fundo
      { x: 9, y: 5, w: 4, h: 1 },     // até a Dona Aveia
      { x: 9, y: 8, w: 6, h: 2 },     // até o Cantinho da Água
      { x: 16, y: 8, w: 6, h: 2 },    // entrada do Cantinho
      { x: 19, y: 6, w: 3, h: 2 },    // até o bebedouro
    ],
    objetos: loja.concat(agua),
    npcs: [
      npc('aveia', 12, 4, TELA),
    ],
  });

})();
