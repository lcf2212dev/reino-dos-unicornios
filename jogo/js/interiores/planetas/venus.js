/* Planeta Vênus (viagem de foguete): interior do Observatório alcançado só pelo foguete do Hangar.
   Rocha amarela, nuvens grossas, vulcões e vapor; a Mapi se perdeu, então tem Geografia pelo chão (rosa dos ventos,
   placas de direção, globo, mapa, bússola). Fixos (contrato): id 'planeta-venus', o spawn/chegada (11, 14), o foguete
   de pouso em (12, 13) e as vagas dos ETs (observatorio/reservas.js): Mapi (8, 7), Quentinho (16, 9), Vovó Nuvem (5, 12).
   Matéria dos portais do voo e do ET do desafio: geografia.
   Objetos e céu em venus-objetos.js, brincadeiras em venus-brincadeiras.js, falas em venus-falas.js. */
(function () {
  var R = window.Reino;
  var CHEGADA = { x: 11, y: 14 };
  var P = R._predios.planetas;

  // sem o sistema da viagem (a prévia dos interiores só carrega os prédios), o interior existe mesmo assim
  if (R.Viagem) R.Viagem.registrarPlaneta({ id: 'venus', nome: 'Vênus', artigo: 'em', interior: 'planeta-venus',
    chegada: CHEGADA, ordem: 5, cor: '#e8c547', materia: 'geografia', depois: 'jupiter' });

  // a ação de uma brincadeira: { tipo: 'venus-brincadeira', b, (n | i | p) }
  function b(o) { o.tipo = 'venus-brincadeira'; return o; }
  R.registrarInterior({
    id: 'planeta-venus',
    lugar: 'observatorio',
    nome: 'Vênus',
    pacote: 'interior-observatorio',
    fundo: 'espaco',
    tamanho: { w: 24, h: 17 },
    spawn: CHEGADA,
    comodos: [
      { id: 'venus', nome: 'Vênus', placa: 'Vênus', rect: { x: 1, y: 1, w: 22, h: 15 }, piso: 'venus-rocha', parede: 'venus-horizonte' },
    ],
    // o caminho da chegada ao foguete e aos ETs
    corredores: [{ x: 9, y: 11, w: 5, h: 5 }],
    objetos: [
      // o foguete de pouso, ao lado da chegada: volta ao Hangar
      { tipo: 'planeta-foguete', x: 12, y: 13, nome: 'Foguete', acao: { tipo: 'viagem', para: 'observatorio-2', chegada: { x: 7, y: 9 } } },
      { tipo: 'venus-placa', x: 9, y: 13, nome: 'Placa', fala: ['{Bem-vinda|Bem-vindo} a Vênus, {nome}!', 'Aqui é quentinho de verdade!'] },
      // brincadeiras
      { tipo: 'venus-geiser', x: 10, y: 6, nome: 'Gêiser', acao: b({ b: 'geiser' }) },
      { tipo: 'venus-vulcao', x: 2, y: 6, nome: 'Vulcãozinho', acao: b({ b: 'vulcao', i: 0 }) },
      { tipo: 'venus-vulcao', x: 21, y: 8, nome: 'Vulcãozinho', acao: b({ b: 'vulcao', i: 1 }) },
      { tipo: 'venus-vulcao', x: 3, y: 14, nome: 'Vulcãozinho', acao: b({ b: 'vulcao', i: 2 }) },
      { tipo: 'venus-cristal', x: 8, y: 4, nome: 'Cristal', acao: b({ b: 'cristal', n: 0 }) },
      { tipo: 'venus-cristal', x: 14, y: 7, nome: 'Cristal', acao: b({ b: 'cristal', n: 1 }) },
      { tipo: 'venus-cristal', x: 2, y: 10, nome: 'Cristal', acao: b({ b: 'cristal', n: 2 }) },
      { tipo: 'venus-cristal', x: 17, y: 12, nome: 'Cristal', acao: b({ b: 'cristal', n: 3 }) },
      { tipo: 'venus-cristal', x: 6, y: 15, nome: 'Cristal', acao: b({ b: 'cristal', n: 4 }) },
      // Geografia: rosa dos ventos e placas de direção, cada uma no seu lado
      { tipo: 'venus-rosa', x: 17, y: 3, nome: 'Rosa dos ventos', acao: b({ b: 'rosa' }) },
      { tipo: 'venus-direcao', x: 12, y: 3, nome: 'Placa do Norte', var: { p: 'norte' }, acao: b({ b: 'direcao', p: 'norte' }) },
      { tipo: 'venus-direcao', x: 16, y: 15, nome: 'Placa do Sul', var: { p: 'sul' }, acao: b({ b: 'direcao', p: 'sul' }) },
      { tipo: 'venus-direcao', x: 22, y: 12, nome: 'Placa do Leste', var: { p: 'leste' }, acao: b({ b: 'direcao', p: 'leste' }) },
      { tipo: 'venus-direcao', x: 1, y: 8, nome: 'Placa do Oeste', var: { p: 'oeste' }, acao: b({ b: 'direcao', p: 'oeste' }) },
      { tipo: 'venus-luneta', x: 4, y: 4, nome: 'Luneta', acao: b({ b: 'curiosidade' }) },
      { tipo: 'venus-globo', x: 9, y: 3, nome: 'Globo', fala: ['O globo mostra a Terra toda!', 'Ela é redondinha assim.'] },
      { tipo: 'venus-mapa', x: 7, y: 10, nome: 'Mapa-múndi', fala: ['Um mapa com o mundo todo!', 'Tem terra e muito mar azul.'] },
      { tipo: 'venus-bussola', x: 14, y: 3, nome: 'Bússola', fala: ['Uma bússola bem grandona!', 'A agulha aponta o Norte.'] },
      // enfeites
      { tipo: 'venus-pedra-alta', x: 6, y: 3 }, { tipo: 'venus-pedra-alta', x: 2, y: 3 }, { tipo: 'venus-rachadura', x: 13, y: 4 },
      { tipo: 'venus-enxofre', x: 16, y: 5 }, { tipo: 'venus-pedra-quente', x: 20, y: 3 }, { tipo: 'venus-rocha', x: 19, y: 6 },
      { tipo: 'venus-pedrinhas', x: 22, y: 5 }, { tipo: 'venus-pedrinhas', x: 11, y: 4 }, { tipo: 'venus-vapor', x: 5, y: 7 },
      { tipo: 'venus-rachadura', x: 12, y: 8 }, { tipo: 'venus-rachadura', x: 17, y: 9 }, { tipo: 'venus-pedrinhas', x: 5, y: 9 },
      { tipo: 'venus-pedra-quente', x: 12, y: 10 }, { tipo: 'venus-vapor', x: 15, y: 11 }, { tipo: 'venus-rochas', x: 19, y: 10 },
      { tipo: 'venus-enxofre', x: 3, y: 12 }, { tipo: 'venus-rachadura', x: 8, y: 14 }, { tipo: 'venus-vapor', x: 15, y: 14 },
      { tipo: 'venus-pedrinhas', x: 18, y: 15 }, { tipo: 'venus-pedra-quente', x: 20, y: 14 }, { tipo: 'venus-enxofre', x: 22, y: 15 },
      { tipo: 'venus-vapor', x: 1, y: 12 }, { tipo: 'venus-pedrinhas', x: 9, y: 8 }, { tipo: 'venus-rocha', x: 22, y: 10 },
      { tipo: 'venus-enxofre', x: 16, y: 7 }, { tipo: 'venus-rachadura', x: 1, y: 15 },
      { tipo: 'venus-pedrinhas', x: 6, y: 5 }, { tipo: 'venus-enxofre', x: 3, y: 8 }, { tipo: 'venus-vapor', x: 19, y: 8 },
      { tipo: 'venus-pedrinhas', x: 14, y: 9 }, { tipo: 'venus-enxofre', x: 7, y: 12 },
    ],
    npcs: P.npcsDoPlaneta('planeta-venus'),
  });
})();
