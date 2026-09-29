/* Planeta Saturno (viagem de foguete): interior do Observatório alcançado só pelo foguete do Hangar.
   Só brincar nos anéis (Saturno é de gás): gelo e pedra no chão, Saturno gigante no céu. Fixos (contrato): id
   'planeta-saturno', o spawn/chegada (13, 4), o foguete de pouso em (14, 3), perto do horizonte (a chegada mostra o céu) e as vagas dos ETs (observatorio/reservas.js):
   «Sky» (8, 7), Nico (16, 9), Vovó Anel (5, 12). Matéria dos portais do voo e do ET do desafio: ingles.
   Objetos e céu em saturno-objetos.js, brincadeiras em saturno-brincadeiras.js, falas em saturno-falas.js. */
(function () {
  var R = window.Reino;
  var CHEGADA = { x: 13, y: 4 };
  var P = R._predios.planetas;

  // sem o sistema da viagem (a prévia dos interiores só carrega os prédios), o interior existe mesmo assim
  if (R.Viagem) R.Viagem.registrarPlaneta({ id: 'saturno', nome: 'Saturno', artigo: 'em', interior: 'planeta-saturno',
    chegada: CHEGADA, ordem: 3, cor: '#e8c77a', materia: 'ingles', depois: 'marte' });

  var COMODO = { id: 'saturno', nome: 'Saturno', placa: 'Saturno', rect: { x: 1, y: 1, w: 22, h: 15 }, piso: 'saturno-gelo', parede: 'saturno-horizonte' };
  R.registrarInterior({
    id: 'planeta-saturno',
    lugar: 'observatorio',
    nome: 'Saturno',
    pacote: 'interior-observatorio',
    fundo: P.fundo('planeta-saturno', COMODO),   // o chão vai até a borda (planetas-comum.js)
    tamanho: { w: 24, h: 28 },   // da fileira 16 para baixo, só o chão (a câmera nunca mostra o espaço embaixo)
    spawn: CHEGADA,
    comodos: [COMODO],
    // o caminho da chegada ao foguete e aos ETs
    corredores: [{ x: 11, y: 3, w: 5, h: 4 }],
    objetos: [
      // o foguete de pouso, ao lado da chegada: volta ao Hangar
      { tipo: 'planeta-foguete', x: 14, y: 3, nome: 'Foguete', acao: { tipo: 'viagem', para: 'observatorio-2', chegada: { x: 7, y: 9 } } },
      { tipo: 'saturno-placa', x: 12, y: 3, nome: 'Placa', fala: ['{Bem-vinda|Bem-vindo} a Saturno, {nome}!', 'Aqui a gente passeia no anel!'] },
      // no lugar antigo da chegada
      { tipo: 'saturno-neve', x: 10, y: 11 },
      // brincadeiras
      { tipo: 'saturno-pista', x: 10, y: 6, nome: 'Pista de patinação', acao: { tipo: 'saturno-brincadeira', b: 'pista' } },
      { tipo: 'saturno-boneco', x: 2, y: 6, nome: 'Boneco de gelo', acao: { tipo: 'saturno-brincadeira', b: 'boneco', i: 0 } },
      { tipo: 'saturno-boneco', x: 21, y: 8, nome: 'Boneco de gelo', acao: { tipo: 'saturno-brincadeira', b: 'boneco', i: 1 } },
      { tipo: 'saturno-boneco', x: 3, y: 14, nome: 'Boneco de gelo', acao: { tipo: 'saturno-brincadeira', b: 'boneco', i: 2 } },
      { tipo: 'saturno-cristal', x: 8, y: 4, nome: 'Cristal de gelo', acao: { tipo: 'saturno-brincadeira', b: 'cristal', n: 0 } },
      { tipo: 'saturno-cristal', x: 14, y: 7, nome: 'Cristal de gelo', acao: { tipo: 'saturno-brincadeira', b: 'cristal', n: 1 } },
      { tipo: 'saturno-cristal', x: 2, y: 10, nome: 'Cristal de gelo', acao: { tipo: 'saturno-brincadeira', b: 'cristal', n: 2 } },
      { tipo: 'saturno-cristal', x: 17, y: 12, nome: 'Cristal de gelo', acao: { tipo: 'saturno-brincadeira', b: 'cristal', n: 3 } },
      { tipo: 'saturno-cristal', x: 6, y: 15, nome: 'Cristal de gelo', acao: { tipo: 'saturno-brincadeira', b: 'cristal', n: 4 } },
      // placas de palavras em inglês
      { tipo: 'saturno-palavra', x: 2, y: 3, nome: 'Placa de inglês', var: { p: 'ice' }, acao: { tipo: 'saturno-brincadeira', b: 'palavra', p: 'ice' } },
      { tipo: 'saturno-palavra', x: 19, y: 6, nome: 'Placa de inglês', var: { p: 'star' }, acao: { tipo: 'saturno-brincadeira', b: 'palavra', p: 'star' } },
      { tipo: 'saturno-palavra', x: 20, y: 3, nome: 'Placa de inglês', var: { p: 'ring' }, acao: { tipo: 'saturno-brincadeira', b: 'palavra', p: 'ring' } },
      { tipo: 'saturno-palavra', x: 22, y: 12, nome: 'Placa de inglês', var: { p: 'moon' }, acao: { tipo: 'saturno-brincadeira', b: 'palavra', p: 'moon' } },
      { tipo: 'saturno-telescopio', x: 4, y: 4, nome: 'Telescópio', acao: { tipo: 'saturno-brincadeira', b: 'curiosidade' } },
      { tipo: 'saturno-iglu', x: 17, y: 3, nome: 'Iglu', fala: ['Uma casinha de gelo!', 'Os ETs brincam aqui dentro.'] },
      { tipo: 'saturno-bandeira', x: 9, y: 3, nome: 'Bandeira', fala: ['A bandeira do nosso Reino!', 'Ela fica firme no gelo.'] },
      { tipo: 'saturno-treno', x: 7, y: 10, nome: 'Trenó', fala: ['Um trenó para o gelo!', 'Ele desliza pelo anel.'] },
      // enfeites
      { tipo: 'saturno-cristal-alto', x: 6, y: 3 }, { tipo: 'saturno-risco', x: 12, y: 13 },
      { tipo: 'saturno-bloco', x: 11, y: 14 }, { tipo: 'saturno-poca', x: 16, y: 5 },
      { tipo: 'saturno-pedrinhas', x: 22, y: 5 }, { tipo: 'saturno-pedrinhas', x: 11, y: 4 }, { tipo: 'saturno-neve', x: 5, y: 7 }, { tipo: 'saturno-risco', x: 12, y: 8, var: { giro: 1 } },
      { tipo: 'saturno-risco', x: 17, y: 9 }, { tipo: 'saturno-pedrinhas', x: 5, y: 9 }, { tipo: 'saturno-pedra', x: 12, y: 10 },
      { tipo: 'saturno-neve', x: 15, y: 11 }, { tipo: 'saturno-blocos', x: 19, y: 10 },
      { tipo: 'saturno-poca', x: 3, y: 12 }, { tipo: 'saturno-risco', x: 8, y: 14, var: { giro: 1 } }, { tipo: 'saturno-neve', x: 15, y: 14 },
      { tipo: 'saturno-pedrinhas', x: 18, y: 15 }, { tipo: 'saturno-pedra', x: 20, y: 14 }, { tipo: 'saturno-poca', x: 22, y: 15 },
      { tipo: 'saturno-neve', x: 1, y: 12 }, { tipo: 'saturno-pedrinhas', x: 9, y: 8 }, { tipo: 'saturno-bloco', x: 22, y: 10 },
      { tipo: 'saturno-poca', x: 16, y: 7 }, { tipo: 'saturno-risco', x: 1, y: 15 },
      { tipo: 'saturno-pedrinhas', x: 6, y: 5 }, { tipo: 'saturno-poca', x: 3, y: 8 }, { tipo: 'saturno-neve', x: 19, y: 8 },
      { tipo: 'saturno-pedrinhas', x: 14, y: 9 }, { tipo: 'saturno-poca', x: 7, y: 12 },
    ],
    npcs: P.npcsDoPlaneta('planeta-saturno'),
  });
})();

