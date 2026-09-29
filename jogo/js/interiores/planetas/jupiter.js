/* Planeta Júpiter (viagem de foguete): interior do Observatório alcançado só pelo foguete do Hangar.
   Júpiter é de gás: a Mariana passeia em ilhas de nuvens fofas, com Júpiter de faixas e a Grande Mancha Vermelha no
   céu. Fixos (contrato): id 'planeta-jupiter', o spawn/chegada (13, 4), o foguete de pouso em (14, 3), perto do horizonte (a chegada mostra o céu) e as vagas dos
   ETs (observatorio/reservas.js): Tinta (8, 7), Bolha (16, 9), Vovô Tempestade (5, 12). Matéria dos portais do voo e
   do ET do desafio: portugues. Objetos e céu em jupiter-objetos.js, brincadeiras em jupiter-brincadeiras.js, falas em
   jupiter-falas.js. */
(function () {
  var R = window.Reino;
  var CHEGADA = { x: 13, y: 4 };
  var P = R._predios.planetas;
  function letra(x, y, l) {
    return { tipo: 'jupiter-letra', x: x, y: y, nome: 'Letra ' + l, var: { l: l }, acao: { tipo: 'jupiter-brincadeira', b: 'letra', l: l } };
  }
  function cristal(x, y, n) {
    return { tipo: 'jupiter-cristal', x: x, y: y, nome: 'Cristal de amônia', acao: { tipo: 'jupiter-brincadeira', b: 'cristal', n: n } };
  }
  var BALAO = ['Um balão flutuando no céu!', 'Aqui tudo flutua de leve.'];
  var RAIO = ['Um raio de tempestade!', 'Ele é pequeno e não machuca.'];

  // sem o sistema da viagem (a prévia dos interiores só carrega os prédios), o interior existe mesmo assim
  if (R.Viagem) R.Viagem.registrarPlaneta({ id: 'jupiter', nome: 'Júpiter', artigo: 'em', interior: 'planeta-jupiter',
    chegada: CHEGADA, ordem: 4, cor: '#d9a066', materia: 'portugues', depois: 'saturno' });

  var COMODO = { id: 'jupiter', nome: 'Júpiter', placa: 'Júpiter', rect: { x: 1, y: 1, w: 22, h: 15 }, piso: 'jupiter-nuvem', parede: 'jupiter-horizonte' };
  R.registrarInterior({
    id: 'planeta-jupiter',
    lugar: 'observatorio',
    nome: 'Júpiter',
    pacote: 'interior-observatorio',
    fundo: P.fundo('planeta-jupiter', COMODO),   // o chão vai até a borda (planetas-comum.js)
    tamanho: { w: 24, h: 28 },   // da fileira 16 para baixo, só o chão (a câmera nunca mostra o espaço embaixo)
    spawn: CHEGADA,
    comodos: [COMODO],
    // o caminho da chegada ao foguete e aos ETs
    corredores: [{ x: 11, y: 3, w: 5, h: 4 }],
    objetos: [
      // o foguete de pouso, ao lado da chegada: volta ao Hangar
      { tipo: 'planeta-foguete', x: 14, y: 3, nome: 'Foguete', acao: { tipo: 'viagem', para: 'observatorio-2', chegada: { x: 7, y: 9 } } },
      { tipo: 'jupiter-placa', x: 12, y: 3, nome: 'Placa', fala: ['{Bem-vinda|Bem-vindo} a Júpiter, {nome}!', 'Aqui a gente anda nas nuvens!'] },
      // no lugar antigo da chegada
      { tipo: 'jupiter-fiapo', x: 10, y: 11 }, { tipo: 'jupiter-gotas', x: 10, y: 13 }, { tipo: 'jupiter-gotas', x: 12, y: 11 }, { tipo: 'jupiter-fiapo', x: 8, y: 13 },
      // brincadeiras
      { tipo: 'jupiter-trampolim', x: 18, y: 4, nome: 'Nuvem-trampolim', acao: { tipo: 'jupiter-brincadeira', b: 'trampolim' } },
      { tipo: 'jupiter-redemoinho', x: 13, y: 7, nome: 'Redemoinho', acao: { tipo: 'jupiter-brincadeira', b: 'redemoinho' } },
      { tipo: 'jupiter-redemoinho', x: 20, y: 13, nome: 'Redemoinho', acao: { tipo: 'jupiter-brincadeira', b: 'redemoinho' } },
      cristal(3, 4, 0), cristal(21, 8, 1), cristal(2, 9, 2), cristal(17, 12, 3), cristal(7, 15, 4),
      // letras que flutuam: cada uma ensina uma palavra
      letra(6, 4, 'A'), letra(12, 13, 'B'), letra(22, 11, 'E'), letra(2, 14, 'I'), letra(15, 14, 'U'),
      { tipo: 'jupiter-luneta', x: 3, y: 11, nome: 'Luneta', acao: { tipo: 'jupiter-brincadeira', b: 'curiosidade' } },
      { tipo: 'jupiter-correio', x: 10, y: 6, nome: 'Correio', fala: ['A caixa de cartas da Tinta!', 'Ela adora escrever cartas.'] },
      { tipo: 'jupiter-nuvem-grande', x: 20, y: 5, nome: 'Nuvem fofa', fala: ['Uma nuvem de algodão!', 'Parece um travesseiro macio!'] },
      { tipo: 'jupiter-balao', x: 11, y: 4, nome: 'Balão', var: { c: 0 }, fala: BALAO },
      { tipo: 'jupiter-balao', x: 7, y: 11, nome: 'Balão', var: { c: 1 }, fala: BALAO },
      { tipo: 'jupiter-balao', x: 19, y: 10, nome: 'Balão', var: { c: 3 }, fala: BALAO },
      { tipo: 'jupiter-raio', x: 8, y: 3, nome: 'Raio', fala: RAIO },
      { tipo: 'jupiter-raio', x: 22, y: 14, nome: 'Raio', fala: RAIO },
      // enfeites
      { tipo: 'jupiter-algodao', x: 1, y: 3 }, { tipo: 'jupiter-algodao', x: 13, y: 3 }, { tipo: 'jupiter-algodao', x: 22, y: 3 },
      { tipo: 'jupiter-algodao', x: 5, y: 8 }, { tipo: 'jupiter-algodao', x: 16, y: 6 }, { tipo: 'jupiter-algodao', x: 1, y: 12 },
      { tipo: 'jupiter-algodao', x: 22, y: 8 }, { tipo: 'jupiter-algodao', x: 5, y: 15 }, { tipo: 'jupiter-algodao', x: 18, y: 15 },
      { tipo: 'jupiter-ponte', x: 3, y: 6 }, { tipo: 'jupiter-ponte', x: 14, y: 10 }, { tipo: 'jupiter-ponte', x: 19, y: 7 },
      { tipo: 'jupiter-cartas', x: 9, y: 8 }, { tipo: 'jupiter-cartas', x: 11, y: 7 },
      { tipo: 'jupiter-fiapo', x: 4, y: 3 }, { tipo: 'jupiter-fiapo', x: 17, y: 3 }, { tipo: 'jupiter-fiapo', x: 12, y: 9 },
      { tipo: 'jupiter-fiapo', x: 3, y: 13 }, { tipo: 'jupiter-fiapo', x: 21, y: 11 }, { tipo: 'jupiter-fiapo', x: 16, y: 15 },
      { tipo: 'jupiter-gotas', x: 9, y: 4 }, { tipo: 'jupiter-gotas', x: 1, y: 7 }, { tipo: 'jupiter-gotas', x: 18, y: 9 },
      { tipo: 'jupiter-gotas', x: 6, y: 13 }, { tipo: 'jupiter-gotas', x: 20, y: 15 },
      { tipo: 'jupiter-vento', x: 11, y: 5 }, { tipo: 'jupiter-vento', x: 7, y: 9 }, { tipo: 'jupiter-vento', x: 17, y: 11 },
      { tipo: 'jupiter-algodao', x: 6, y: 6 }, { tipo: 'jupiter-fiapo', x: 5, y: 10 }, { tipo: 'jupiter-gotas', x: 15, y: 12 },
      { tipo: 'jupiter-vento', x: 3, y: 15 }, { tipo: 'jupiter-vento', x: 14, y: 5 }, { tipo: 'jupiter-vento', x: 22, y: 6 },
    ],
    npcs: P.npcsDoPlaneta('planeta-jupiter'),
  });
})();
