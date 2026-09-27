/* Planeta Lua (viagem de foguete): interior do Observatório alcançado só pelo foguete do Hangar. Só brincar.
   CONTRATO (onda 0): layout provisório; a frente do cenário da Lua o refaz. Fixos (contrato): id 'planeta-lua',
   o spawn/chegada (11, 14), o foguete de volta perto dela e as vagas dos ETs (reservas.js): Lumi (8, 7),
   Pipo (16, 9), Vovó Cratera (5, 12). */
(function () {
  var R = window.Reino;
  var CHEGADA = { x: 11, y: 14 };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.observatorio;
  // ET reservado (observatorio/reservas.js): nome, sprite e voz do elenco, falas do prédio (personagens-falas.js)
  function npc(p) {
    var e = ELENCO[p.id] || {}, f = S.falas().npcs || {};
    var n = { id: p.id, nome: e.nome || p.id, sprite: e.sprite || { base: 'pessoa' }, voz: e.voz || 'npc-' + p.id,
      x: p.x, y: p.y, falas: f[p.id] || {} };
    if (p.acao) n.acao = p.acao;
    return n;
  }

  R.Viagem.registrarPlaneta({ id: 'lua', nome: 'Lua', interior: 'planeta-lua', chegada: CHEGADA, ordem: 1, cor: '#c9c9d6' });

  R.registrarInterior({
    id: 'planeta-lua',
    lugar: 'observatorio',
    nome: 'Lua',
    pacote: 'interior-observatorio',
    fundo: 'espaco',
    tamanho: { w: 24, h: 17 },
    spawn: CHEGADA,
    comodos: [
      { id: 'lua', nome: 'Lua', placa: 'Lua', rect: { x: 1, y: 1, w: 22, h: 15 }, piso: 'lua-rocha', parede: 'planeta-horizonte' },
    ],
    corredores: [{ x: 1, y: 3, w: 22, h: 13 }],
    objetos: [
      { tipo: 'observatorio-foguete', x: 11, y: 11, nome: 'Foguete', acao: { tipo: 'viagem', para: 'observatorio-2', chegada: { x: 7, y: 9 } } },
      { tipo: 'globo', x: 2, y: 3, nome: 'Terra', fala: 'Lá longe está a Terra!' },
      { tipo: 'pedestal', x: 20, y: 3, nome: 'Pedra da Lua', fala: 'Uma pedra da Lua!' },
      { tipo: 'caixote', x: 4, y: 3 }, { tipo: 'barril', x: 6, y: 3 }, { tipo: 'vaso-planta', x: 8, y: 3 },
      { tipo: 'banco', x: 13, y: 3 }, { tipo: 'cesto', x: 17, y: 3 }, { tipo: 'balde', x: 18, y: 3 },
      { tipo: 'flores', x: 2, y: 15 }, { tipo: 'planta-alta', x: 21, y: 14 }, { tipo: 'almofada', x: 4, y: 15 },
      { tipo: 'luminaria-pe', x: 19, y: 15 }, { tipo: 'pilha-livros', x: 16, y: 15 }, { tipo: 'placa-chao', x: 9, y: 15 },
      { tipo: 'papeis', x: 7, y: 15 },
    ],
    // os ETs: os registrados com predio 'planeta-lua' e x/y (Reino.personagensDoPredio; vagas em reservas.js)
    npcs: R.personagensDoPredio('planeta-lua').filter(function (p) { return p.x != null && p.y != null; }).map(npc),
  });
})();
