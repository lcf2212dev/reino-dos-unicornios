/* As 4 lojas da Cidade Nova (docs/contratos/cidade-nova.md): Casa & Lar (decoração), Forja das
   Lâminas (armas), Elmos & Chapéus (capacetes e chapéus) e Armaduras & Botas. Cada uma tem um
   NPC atrás do balcão; falar com ele abre a pergunta do 4º bimestre e, só com a resposta certa,
   a tela da loja (ação `lojaCidade`, sistemas/loja-cidade.js). O tapete da entrada volta para a
   frente da porta na Cidade Nova. */
(function () {
  var R = window.Reino;
  var LOJAS = [
    { id: 'casa', interior: 'loja-casa', nome: 'Casa & Lar', cor: '#ffb3d9', porta: { x: 7, y: 7 },
      piso: 'taco', parede: 'papel', paleta: { piso: '#d9b88a', piso2: '#c9a27a', parede: '#ffe6f2', parede2: '#ffd1e6', rodape: '#c9a27a', detalhe: '#ff9cc6' },
      npc: { id: 'aconchego', nome: 'Dona Aconchego', voz: 'npc-petala',
        sprite: { base: 'pessoa', pele: '#f1c7a5', cabelo: '#a0673a', penteado: 'coque', chapeu: 'flores', chapeuCor: '#ff9cc6', roupa: '#ffb3d9', roupa2: '#8a5a3a', perna: 'saia', avental: true, aventalCor: '#fff1d0', cor2: '#ffd34d' },
        falas: { oi: ['Oi! Que bom te ver por aqui! 😄'], nova: ['Responda uma pergunta e entre!'], depois: ['Volte sempre! 💛'] } } },
    { id: 'armas', interior: 'loja-armas', nome: 'Forja das Lâminas', cor: '#8fd8ff', porta: { x: 18, y: 7 },
      piso: 'pedra', parede: 'tijolo', paleta: { piso: '#8e9ab4', piso2: '#7a869e', parede: '#a86b4a', parede2: '#8a5530', rodape: '#5a3a22', detalhe: '#ff9d2e' },
      npc: { id: 'faisca', nome: 'Mestre Faísca', voz: 'npc-feno',
        sprite: { base: 'pessoa', pele: '#c68a5e', cabelo: '#2b1b17', penteado: 'curto', barba: true, roupa: '#8a5530', colete: '#5a3a22', avental: true, aventalCor: '#c9a27a', cor2: '#ff9d2e' },
        falas: { oi: ['Oi! A forja está quente! 🔥'], nova: ['Responda uma pergunta e entre!'], depois: ['Volte sempre! 💛'] } } },
    { id: 'cabecas', interior: 'loja-cabecas', nome: 'Elmos & Chapéus', cor: '#c9b8ff', porta: { x: 29, y: 7 },
      piso: 'carpete', parede: 'papel', paleta: { piso: '#b58cff', piso2: '#9b5cff', parede: '#e6d6ff', parede2: '#d1b8ff', rodape: '#7c5cff', detalhe: '#ffd34d' },
      npc: { id: 'charme', nome: 'Dona Charme', voz: 'npc-aveia',
        sprite: { base: 'pessoa', pele: '#ffe0c7', cabelo: '#5a3825', penteado: 'chanel', chapeu: 'cartola', chapeuCor: '#9b5cff', roupa: '#9b5cff', roupa2: '#5a3a8a', perna: 'saia', colar: true, cor2: '#ffd34d' },
        falas: { oi: ['Oi! Que chapéu lindo o seu! 😄'], nova: ['Responda uma pergunta e entre!'], depois: ['Volte sempre! 💛'] } } },
    { id: 'armaduras', interior: 'loja-armaduras', nome: 'Armaduras & Botas', cor: '#ffd34d', porta: { x: 40, y: 7 },
      piso: 'pedra', parede: 'madeira', paleta: { piso: '#a8b0c0', piso2: '#8e9ab4', parede: '#c9a27a', parede2: '#a8804a', rodape: '#6b4430', detalhe: '#8fd8ff' },
      npc: { id: 'couro', nome: 'Capitão Couro', voz: 'npc-chico',
        sprite: { base: 'pessoa', pele: '#a86b4a', cabelo: '#2b1b17', penteado: 'espetado', armadura: true, armaduraCor: '#8a5530', roupa: '#c9a27a', capa: true, capaCor: '#3f7fe0', cor2: '#ffd34d' },
        falas: { oi: ['Oi! Pronta para a aventura? 🛡️'], nova: ['Responda uma pergunta e entre!'], depois: ['Volte sempre! 💛'] } } },
  ];

  function objetosDe(l) {
    return [
      { tipo: 'estante', x: 2, y: 3 }, { tipo: 'armario', x: 13, y: 3 },
      { tipo: 'prateleira-parede', x: 7, y: 1 }, { tipo: 'quadro', x: 3, y: 1 }, { tipo: 'cortina', x: 11, y: 1 },
      { tipo: 'vitrine', x: 5, y: 3 }, { tipo: 'mesa', x: 4, y: 5 }, { tipo: 'cadeira', x: 3, y: 6 },
      { tipo: 'poltrona', x: 12, y: 6 }, { tipo: 'banco', x: 2, y: 8 }, { tipo: 'tapete', x: 6, y: 7 },
      { tipo: 'vaso-planta', x: 1, y: 6, var: { vaso: l.cor } }, { tipo: 'flores', x: 15, y: 7, var: { cores: [l.cor, '#ffffff', '#ffd34d'] } },
      { tipo: 'luminaria-pe', x: 13, y: 7, var: { cor: l.cor } }, { tipo: 'bau', x: 14, y: 6, var: { cor: '#c9a27a' },
        nome: 'Baú da loja', fala: ['Só o dono da loja abre este baú.'] },
      { tipo: 'caixote', x: 15, y: 5, var: { cor: '#c9a27a' } }, { tipo: 'barril', x: 1, y: 5 },
      { tipo: 'cidade-cartaz', x: 10, y: 6, nome: 'Cartaz da loja', fala: ['Responda certinho para entrar!'] },
      { tipo: 'cidade-saida', x: 9, y: 9, nome: 'Saída da loja', acao: { tipo: 'sairLoja', chegar: { x: l.porta.x, y: l.porta.y } } },
    ];
  }

  LOJAS.forEach(function (l) {
    R.registrarInterior({
      id: l.interior, lugar: 'portal:' + l.id, nome: l.nome, entrada: false, portal: true,
      pacote: 'interior-bosque', tamanho: { w: 18, h: 12 },
      spawn: { x: 8, y: 9 },
      comodos: [{ id: 'loja', nome: l.nome, rect: { x: 1, y: 1, w: 16, h: 9 }, piso: l.piso, parede: l.parede, paleta: l.paleta }],
      corredores: [{ x: 1, y: 3, w: 16, h: 7 }],
      objetos: objetosDe(l),
      npcs: [Object.assign({ x: 8, y: 4, acao: { tipo: 'lojaCidade', loja: l.id } }, l.npc)],
    });
  });
})();
