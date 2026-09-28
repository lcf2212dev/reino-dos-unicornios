/* Planeta Júpiter (viagem de foguete): interior do Observatório alcançado só pelo foguete do Hangar.
   CONTRATO (onda 0 da 2ª versão): layout provisório; a frente do cenário de Júpiter o refaz. Fixos (contrato): id
   'planeta-jupiter', o spawn/chegada (11, 14), o foguete de pouso em (12, 13) e as vagas dos ETs (observatorio/reservas.js):
   Tinta (8, 7), Bolha (16, 9), Vovô Tempestade (5, 12). Matéria dos portais do voo e do ET do desafio: portugues. */
(function () {
  var R = window.Reino;
  var CHEGADA = { x: 11, y: 14 };
  var P = R._predios.planetas;

  // sem o sistema da viagem (a prévia dos interiores só carrega os prédios), o interior existe mesmo assim
  if (R.Viagem) R.Viagem.registrarPlaneta({ id: 'jupiter', nome: 'Júpiter', artigo: 'em', interior: 'planeta-jupiter',
    chegada: CHEGADA, ordem: 4, cor: '#d9a066', materia: 'portugues', depois: 'saturno' });

  R.registrarInterior({
    id: 'planeta-jupiter',
    lugar: 'observatorio',
    nome: 'Júpiter',
    pacote: 'interior-observatorio',
    fundo: 'espaco',
    tamanho: { w: 24, h: 17 },
    spawn: CHEGADA,
    comodos: [
      { id: 'jupiter', nome: 'Júpiter', placa: 'Júpiter', rect: { x: 1, y: 1, w: 22, h: 15 }, piso: 'lua-rocha', parede: 'planeta-horizonte',
        paleta: { piso: '#e8cfa8', piso2: '#dcc096', detalhe: '#c4a57a' } },
    ],
    corredores: [{ x: 1, y: 3, w: 22, h: 13 }],
    objetos: [
      { tipo: 'planeta-foguete', x: 12, y: 13, nome: 'Foguete', acao: { tipo: 'viagem', para: 'observatorio-2', chegada: { x: 7, y: 9 } } },
      { tipo: 'globo', x: 2, y: 3, nome: 'Globo', fala: 'Um globo do espaço!' },
      { tipo: 'pedestal', x: 20, y: 3, nome: 'Pedra', fala: 'Uma pedra do espaço!' },
      { tipo: 'caixote', x: 4, y: 3 }, { tipo: 'barril', x: 6, y: 3 }, { tipo: 'vaso-planta', x: 8, y: 3 },
      { tipo: 'banco', x: 13, y: 3 }, { tipo: 'cesto', x: 17, y: 3 }, { tipo: 'balde', x: 18, y: 3 },
      { tipo: 'flores', x: 2, y: 15 }, { tipo: 'planta-alta', x: 21, y: 14 }, { tipo: 'almofada', x: 4, y: 15 },
      { tipo: 'luminaria-pe', x: 19, y: 15 }, { tipo: 'pilha-livros', x: 16, y: 15 }, { tipo: 'placa-chao', x: 9, y: 15 },
      { tipo: 'papeis', x: 7, y: 15 },
    ],
    npcs: P.npcsDoPlaneta('planeta-jupiter'),
  });
})();

