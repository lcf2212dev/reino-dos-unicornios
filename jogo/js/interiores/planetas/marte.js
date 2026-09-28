/* Planeta Marte (viagem de foguete): interior do Observatório alcançado só pelo foguete do Hangar.
   Areia vermelha, o Monte Olimpo e as luazinhas Fobos e Deimos no horizonte; objetos em marte-objetos.js,
   brincadeiras em marte-brincadeiras.js, falas em marte-falas.js. Fixos (contrato): id
   'planeta-marte', o spawn/chegada (11, 14), o foguete de pouso em (12, 13) e as vagas dos ETs (observatorio/reservas.js):
   Rubi (8, 7), Faísca (16, 9), Vovô Vulcão (5, 12). Matéria dos portais do voo e do ET do desafio: matematica. */
(function () {
  var R = window.Reino;
  var CHEGADA = { x: 11, y: 14 };
  var P = R._predios.planetas;

  // sem o sistema da viagem (a prévia dos interiores só carrega os prédios), o interior existe mesmo assim
  if (R.Viagem) R.Viagem.registrarPlaneta({ id: 'marte', nome: 'Marte', artigo: 'em', interior: 'planeta-marte',
    chegada: CHEGADA, ordem: 2, cor: '#d8613c', materia: 'matematica', depois: 'lua' });

  R.registrarInterior({
    id: 'planeta-marte',
    lugar: 'observatorio',
    nome: 'Marte',
    pacote: 'interior-observatorio',
    fundo: 'espaco',
    tamanho: { w: 24, h: 17 },
    spawn: CHEGADA,
    comodos: [
      { id: 'marte', nome: 'Marte', placa: 'Marte', rect: { x: 1, y: 1, w: 22, h: 15 }, piso: 'marte-areia', parede: 'marte-horizonte',
        paleta: { olimpo: 6, fobos: 15, deimos: 19 } },
    ],
    // o caminho da chegada ao foguete e aos ETs
    corredores: [{ x: 9, y: 11, w: 5, h: 5 }],
    objetos: [
      // o foguete de pouso, ao lado da chegada: volta ao Hangar
      { tipo: 'planeta-foguete', x: 12, y: 13, nome: 'Foguete', acao: { tipo: 'viagem', para: 'observatorio-2', chegada: { x: 7, y: 9 } } },
      { tipo: 'marte-placa', x: 9, y: 13, nome: 'Placa', fala: ['{Bem-vinda|Bem-vindo} a Marte, {nome}!', 'O planeta vermelho! ✨'] },
      // brincadeiras
      { tipo: 'marte-duna', x: 10, y: 6, nome: 'Tobogã de areia', acao: { tipo: 'marte-brincadeira', b: 'duna' } },
      { tipo: 'marte-redemoinho', x: 19, y: 6, nome: 'Redemoinho', acao: { tipo: 'marte-brincadeira', b: 'redemoinho' } },
      { tipo: 'marte-jipe', x: 17, y: 3, nome: 'Jipe-robô', acao: { tipo: 'marte-brincadeira', b: 'jipe' } },
      { tipo: 'marte-pedrinha', x: 8, y: 4, nome: 'Pedrinha', acao: { tipo: 'marte-brincadeira', b: 'pedrinha', n: 0 } },
      { tipo: 'marte-pedrinha', x: 14, y: 7, nome: 'Pedrinha', acao: { tipo: 'marte-brincadeira', b: 'pedrinha', n: 1 } },
      { tipo: 'marte-pedrinha', x: 2, y: 10, nome: 'Pedrinha', acao: { tipo: 'marte-brincadeira', b: 'pedrinha', n: 2 } },
      { tipo: 'marte-pedrinha', x: 17, y: 12, nome: 'Pedrinha', acao: { tipo: 'marte-brincadeira', b: 'pedrinha', n: 3 } },
      { tipo: 'marte-pedrinha', x: 6, y: 15, nome: 'Pedrinha', acao: { tipo: 'marte-brincadeira', b: 'pedrinha', n: 4 } },
      { tipo: 'marte-antena', x: 4, y: 4, nome: 'Antena', acao: { tipo: 'marte-brincadeira', b: 'curiosidade' } },
      // a nave da Rubi em pedaços (ela pede ajuda com as contas para consertar)
      { tipo: 'marte-nave', x: 7, y: 10, nome: 'Nave da Rubi', fala: ['A nave da Rubi quebrou!', 'Ajude a Rubi a consertar.'] },
      { tipo: 'marte-peca', x: 2, y: 6, var: { p: 0 }, nome: 'Asa da nave', fala: ['Um pedaço da nave da Rubi!'] },
      { tipo: 'marte-peca', x: 21, y: 8, var: { p: 1 }, nome: 'Motor da nave', fala: ['O motor da nave da Rubi!'] },
      { tipo: 'marte-peca', x: 3, y: 14, var: { p: 2 }, nome: 'Parafusos', fala: ['Parafusos da nave da Rubi!'] },
      { tipo: 'marte-painel', x: 9, y: 3, nome: 'Painel solar', fala: ['Um painel que pega sol.', 'Ele dá energia ao robô.'] },
      { tipo: 'marte-gelo', x: 20, y: 3, nome: 'Gelo', fala: ['Cristais de gelo de Marte!', 'Eles são bem geladinhos.'] },
      // enfeites
      { tipo: 'marte-gelo', x: 2, y: 3 }, { tipo: 'marte-seixos', x: 6, y: 3 }, { tipo: 'marte-rastro', x: 16, y: 5 },
      { tipo: 'marte-rocha', x: 14, y: 3 }, { tipo: 'marte-cratera-p', x: 13, y: 5 }, { tipo: 'marte-duninha', x: 11, y: 4 },
      { tipo: 'marte-seixos', x: 22, y: 5 }, { tipo: 'marte-seixos', x: 13, y: 4 }, { tipo: 'marte-poeira', x: 5, y: 7 },
      { tipo: 'marte-rastro', x: 12, y: 8, var: { giro: 1 } },
      { tipo: 'marte-rastro', x: 17, y: 9 }, { tipo: 'marte-seixos', x: 5, y: 9 }, { tipo: 'marte-seixos', x: 12, y: 10 }, { tipo: 'marte-rocha-alta', x: 1, y: 9 }, { tipo: 'marte-rocha', x: 20, y: 12 },
      { tipo: 'marte-duninha', x: 15, y: 11 }, { tipo: 'marte-cratera', x: 19, y: 10 }, { tipo: 'marte-rocha-alta', x: 22, y: 12 },
      { tipo: 'marte-cratera-p', x: 3, y: 12 }, { tipo: 'marte-rastro', x: 8, y: 14, var: { giro: 1 } }, { tipo: 'marte-poeira', x: 15, y: 14 },
      { tipo: 'marte-seixos', x: 18, y: 15 }, { tipo: 'marte-rocha', x: 20, y: 14 }, { tipo: 'marte-cratera-p', x: 22, y: 15 },
      { tipo: 'marte-poeira', x: 1, y: 12 }, { tipo: 'marte-seixos', x: 9, y: 8 }, { tipo: 'marte-rocha', x: 22, y: 10 },
      { tipo: 'marte-cratera-p', x: 16, y: 7 }, { tipo: 'marte-duninha', x: 1, y: 15 },
      { tipo: 'marte-seixos', x: 6, y: 5 }, { tipo: 'marte-cratera-p', x: 3, y: 8 }, { tipo: 'marte-poeira', x: 19, y: 8 },
      { tipo: 'marte-seixos', x: 14, y: 9 }, { tipo: 'marte-cratera-p', x: 7, y: 12 },
    ],
    npcs: P.npcsDoPlaneta('planeta-marte'),
  });
})();

