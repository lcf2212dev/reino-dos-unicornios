/* Planeta Netuno (viagem de foguete): interior do Observatório alcançado só pelo foguete do Hangar.
   Netuno é de gás e gelado: o passeio é em Tritão, a maior lua dele, com Netuno azul gigante no céu. Fixos
   (contrato): id 'planeta-netuno', o spawn/chegada (13, 4), o foguete de pouso em (14, 3), perto do horizonte (a chegada mostra o céu) e as vagas dos ETs
   (observatorio/reservas.js): Gota (8, 7), Memo (16, 9), Vovó Ventania (5, 12). Matéria dos portais do voo e do
   ET do desafio: ciencias. Objetos e céu em netuno-objetos.js, brincadeiras em netuno-brincadeiras.js, falas em
   netuno-falas.js. */
(function () {
  var R = window.Reino;
  var CHEGADA = { x: 13, y: 4 };
  var P = R._predios.planetas;

  // sem o sistema da viagem (a prévia dos interiores só carrega os prédios), o interior existe mesmo assim
  if (R.Viagem) R.Viagem.registrarPlaneta({ id: 'netuno', nome: 'Netuno', artigo: 'em', interior: 'planeta-netuno',
    chegada: CHEGADA, ordem: 6, cor: '#4a6fd8', materia: 'ciencias', depois: 'venus' });

  var COMODO = { id: 'netuno', nome: 'Netuno', placa: 'Netuno', rect: { x: 1, y: 1, w: 22, h: 15 }, piso: 'netuno-gelo', parede: 'netuno-horizonte' };
  R.registrarInterior({
    id: 'planeta-netuno',
    lugar: 'observatorio',
    nome: 'Netuno',
    pacote: 'interior-observatorio',
    fundo: P.fundo('planeta-netuno', COMODO),   // o chão vai até a borda (planetas-comum.js)
    tamanho: { w: 24, h: 28 },   // da fileira 16 para baixo, só o chão (a câmera nunca mostra o espaço embaixo)
    spawn: CHEGADA,
    comodos: [COMODO],
    // o caminho da chegada ao foguete e aos ETs
    corredores: [{ x: 11, y: 3, w: 5, h: 4 }],
    objetos: [
      // o foguete de pouso, ao lado da chegada: volta ao Hangar
      { tipo: 'planeta-foguete', x: 14, y: 3, nome: 'Foguete', acao: { tipo: 'viagem', para: 'observatorio-2', chegada: { x: 7, y: 9 } } },
      { tipo: 'netuno-placa', x: 12, y: 3, nome: 'Placa', fala: ['{Bem-vinda|Bem-vindo} a Netuno, {nome}!', 'Aqui é Tritão, lua de Netuno.'] },
      // no lugar antigo da chegada
      { tipo: 'netuno-neve', x: 10, y: 11 }, { tipo: 'netuno-racha', x: 10, y: 13 }, { tipo: 'netuno-pedrinhas', x: 13, y: 12 }, { tipo: 'netuno-neve', x: 12, y: 14 },
      { tipo: 'netuno-placa', x: 20, y: 3, nome: 'Placa de Tritão', fala: ['Netuno é feito só de gás.', 'Por isso a gente pousou aqui.', 'Olhe Netuno azul no céu!'] },
      // vento
      { tipo: 'netuno-catavento', x: 10, y: 6, nome: 'Cata-vento', acao: { tipo: 'netuno-brincadeira', b: 'catavento' } },
      { tipo: 'netuno-biruta', x: 4, y: 3, nome: 'Biruta', fala: ['A biruta mostra o vento.', 'Olhe como ela está esticada!'] },
      // gêiseres de gelo
      { tipo: 'netuno-geiser', x: 2, y: 6, nome: 'Gêiser de gelo', acao: { tipo: 'netuno-brincadeira', b: 'geiser', i: 0 } },
      { tipo: 'netuno-geiser', x: 21, y: 8, nome: 'Gêiser de gelo', acao: { tipo: 'netuno-brincadeira', b: 'geiser', i: 1 } },
      { tipo: 'netuno-geiser', x: 3, y: 14, nome: 'Gêiser de gelo', acao: { tipo: 'netuno-brincadeira', b: 'geiser', i: 2 } },
      // cristais azuis para pegar
      { tipo: 'netuno-cristal', x: 9, y: 12, nome: 'Cristal azul', acao: { tipo: 'netuno-brincadeira', b: 'cristal', n: 0 } },
      { tipo: 'netuno-cristal', x: 13, y: 7, nome: 'Cristal azul', acao: { tipo: 'netuno-brincadeira', b: 'cristal', n: 1 } },
      { tipo: 'netuno-cristal', x: 2, y: 10, nome: 'Cristal azul', acao: { tipo: 'netuno-brincadeira', b: 'cristal', n: 2 } },
      { tipo: 'netuno-cristal', x: 18, y: 13, nome: 'Cristal azul', acao: { tipo: 'netuno-brincadeira', b: 'cristal', n: 3 } },
      { tipo: 'netuno-cristal', x: 6, y: 15, nome: 'Cristal azul', acao: { tipo: 'netuno-brincadeira', b: 'cristal', n: 4 } },
      // o laboratório da Gota (Ciências)
      { tipo: 'netuno-bancada', x: 5, y: 5, nome: 'Laboratório', fala: ['O laboratório da Gota!', 'Aqui ela faz experiências.'] },
      { tipo: 'netuno-tubos', x: 7, y: 6, nome: 'Tubos de ensaio', acao: { tipo: 'netuno-brincadeira', b: 'tubos' } },
      { tipo: 'netuno-microscopio', x: 7, y: 8, nome: 'Microscópio', fala: ['O microscópio aumenta tudo.', 'Mostra o que é pequenininho!'] },
      // as coisas antigas do Memo (História)
      { tipo: 'netuno-reliquia', x: 14, y: 8, nome: 'Carta antiga', var: { r: 'carta' }, acao: { tipo: 'netuno-brincadeira', b: 'reliquia', r: 'carta' } },
      { tipo: 'netuno-reliquia', x: 18, y: 8, nome: 'Telefone antigo', var: { r: 'telefone' }, acao: { tipo: 'netuno-brincadeira', b: 'reliquia', r: 'telefone' } },
      { tipo: 'netuno-reliquia', x: 15, y: 11, nome: 'Relógio antigo', var: { r: 'relogio' }, acao: { tipo: 'netuno-brincadeira', b: 'reliquia', r: 'relogio' } },
      { tipo: 'netuno-reliquia', x: 18, y: 10, nome: 'Foto antiga', var: { r: 'foto' }, acao: { tipo: 'netuno-brincadeira', b: 'reliquia', r: 'foto' } },
      { tipo: 'netuno-reliquia', x: 14, y: 10, nome: 'Livro velho', var: { r: 'livro' }, acao: { tipo: 'netuno-brincadeira', b: 'reliquia', r: 'livro' } },
      { tipo: 'netuno-linha', x: 16, y: 5, nome: 'Linha do tempo', fala: ['A linha do tempo do Memo!', 'Vai de antigamente até hoje.'] },
      { tipo: 'netuno-bau', x: 20, y: 6, nome: 'Baú', fala: ['O baú de lembranças do Memo.', 'Tem muita coisa antiga aqui!'] },
      { tipo: 'netuno-bandeira', x: 8, y: 3, nome: 'Bandeira', fala: ['A bandeira do nosso Reino!', 'Ela fica firme no vento.'] },
      // enfeites de gelo
      { tipo: 'netuno-cristal-alto', x: 2, y: 3 }, { tipo: 'netuno-cristal-alto', x: 22, y: 5 }, { tipo: 'netuno-blocos', x: 20, y: 11 },
      { tipo: 'netuno-bloco', x: 11, y: 14 }, { tipo: 'netuno-bloco', x: 2, y: 8 }, { tipo: 'netuno-bloco', x: 22, y: 14 },
      { tipo: 'netuno-cristal-alto', x: 7, y: 11 }, { tipo: 'netuno-bloco', x: 16, y: 14 },
      { tipo: 'netuno-neve', x: 5, y: 7 }, { tipo: 'netuno-neve', x: 11, y: 9 }, { tipo: 'netuno-neve', x: 19, y: 4 }, { tipo: 'netuno-neve', x: 1, y: 12 },
      { tipo: 'netuno-neve', x: 15, y: 14 }, { tipo: 'netuno-neve', x: 21, y: 9 }, { tipo: 'netuno-neve', x: 4, y: 10 },
      { tipo: 'netuno-racha', x: 10, y: 4 }, { tipo: 'netuno-racha', x: 12, y: 8 }, { tipo: 'netuno-racha', x: 17, y: 12 }, { tipo: 'netuno-racha', x: 3, y: 12 },
      { tipo: 'netuno-racha', x: 8, y: 14 }, { tipo: 'netuno-racha', x: 20, y: 15 }, { tipo: 'netuno-racha', x: 6, y: 9 },
      { tipo: 'netuno-pedrinhas', x: 6, y: 3 }, { tipo: 'netuno-pedrinhas', x: 17, y: 3 }, { tipo: 'netuno-pedrinhas', x: 9, y: 9 },
      { tipo: 'netuno-pedrinhas', x: 19, y: 7 }, { tipo: 'netuno-pedrinhas', x: 5, y: 14 }, { tipo: 'netuno-pedrinhas', x: 22, y: 11 },
      { tipo: 'netuno-pedrinhas', x: 15, y: 6 }, { tipo: 'netuno-pedrinhas', x: 1, y: 15 },
    ],
    npcs: P.npcsDoPlaneta('planeta-netuno'),
  });
})();

