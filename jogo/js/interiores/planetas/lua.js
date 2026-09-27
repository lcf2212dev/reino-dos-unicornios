/* Planeta Lua (viagem de foguete): interior do Observatório alcançado só pelo foguete do Hangar. Só brincar.
   Fixos (contrato): id 'planeta-lua', o spawn/chegada (11, 14), o foguete de volta ao lado dela e as vagas dos ETs
   (reservas.js): Lumi (8, 7), Pipo (16, 9), Vovó Cratera (5, 12). Céu aberto (fundo 'espaco') com a Terra no
   horizonte; objetos em lua-objetos.js, brincadeiras em lua-brincadeiras.js. */
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
      { id: 'lua', nome: 'Lua', placa: 'Lua', rect: { x: 1, y: 1, w: 22, h: 15 }, piso: 'lua-rocha', parede: 'planeta-horizonte',
        paleta: { terra: 15 } },
    ],
    // o caminho da chegada ao foguete e aos ETs
    corredores: [{ x: 9, y: 11, w: 5, h: 5 }],
    objetos: [
      // o foguete de pouso, ao lado da chegada: volta ao Hangar
      { tipo: 'planeta-foguete', x: 12, y: 13, nome: 'Foguete', acao: { tipo: 'viagem', para: 'observatorio-2', chegada: { x: 7, y: 9 } } },
      { tipo: 'lua-placa', x: 9, y: 13, nome: 'Placa', fala: ['Bem-vinda à Lua, Mariana!', 'Aqui é bom de brincar! 🌙'] },
      // brincadeiras
      { tipo: 'lua-cratera', x: 10, y: 6, nome: 'Cratera pula-pula', var: { pula: true }, acao: { tipo: 'lua-brincadeira', b: 'pulo' } },
      { tipo: 'lua-pedra-flutua', x: 19, y: 6, nome: 'Pedra levinha', acao: { tipo: 'lua-brincadeira', b: 'flutua' } },
      { tipo: 'lua-pedra-grande', x: 2, y: 6, nome: 'Pedra grande', acao: { tipo: 'lua-brincadeira', b: 'pedra', i: 0 } },
      { tipo: 'lua-pedra-grande', x: 21, y: 8, nome: 'Pedra grande', acao: { tipo: 'lua-brincadeira', b: 'pedra', i: 1 } },
      { tipo: 'lua-pedra-grande', x: 3, y: 14, nome: 'Pedra grande', acao: { tipo: 'lua-brincadeira', b: 'pedra', i: 2 } },
      { tipo: 'lua-cristal', x: 8, y: 4, nome: 'Cristal', acao: { tipo: 'lua-brincadeira', b: 'cristal', n: 0 } },
      { tipo: 'lua-cristal', x: 14, y: 7, nome: 'Cristal', acao: { tipo: 'lua-brincadeira', b: 'cristal', n: 1 } },
      { tipo: 'lua-cristal', x: 2, y: 10, nome: 'Cristal', acao: { tipo: 'lua-brincadeira', b: 'cristal', n: 2 } },
      { tipo: 'lua-cristal', x: 17, y: 12, nome: 'Cristal', acao: { tipo: 'lua-brincadeira', b: 'cristal', n: 3 } },
      { tipo: 'lua-cristal', x: 6, y: 15, nome: 'Cristal', acao: { tipo: 'lua-brincadeira', b: 'cristal', n: 4 } },
      { tipo: 'lua-telescopio', x: 4, y: 4, nome: 'Telescópio', acao: { tipo: 'lua-brincadeira', b: 'curiosidade' } },
      { tipo: 'lua-modulo', x: 17, y: 3, nome: 'Módulo lunar', acao: { tipo: 'lua-brincadeira', b: 'curiosidade' } },
      { tipo: 'lua-bandeira', x: 11, y: 3, nome: 'Bandeira', fala: ['A bandeira do nosso Reino!', 'Na Lua não tem vento.', 'Ela fica esticada na vareta.'] },
      { tipo: 'lua-jipe', x: 7, y: 10, nome: 'Jipe lunar', fala: ['Um jipe para passear na Lua!'] },
      // enfeites
      { tipo: 'lua-antena', x: 2, y: 3 }, { tipo: 'lua-rocha-alta', x: 6, y: 3 }, { tipo: 'lua-pegadas', x: 13, y: 4 },
      { tipo: 'lua-pedra', x: 14, y: 3 }, { tipo: 'lua-cratera-p', x: 16, y: 5 }, { tipo: 'lua-caixa', x: 20, y: 3 },
      { tipo: 'lua-seixos', x: 22, y: 5 }, { tipo: 'lua-poeira', x: 5, y: 7 }, { tipo: 'lua-pegadas', x: 12, y: 8, var: { giro: 1 } },
      { tipo: 'lua-pegadas', x: 17, y: 9 }, { tipo: 'lua-seixos', x: 5, y: 9 }, { tipo: 'lua-pedra', x: 12, y: 10 },
      { tipo: 'lua-poeira', x: 15, y: 11 }, { tipo: 'lua-cratera', x: 19, y: 10 }, { tipo: 'lua-rocha-alta', x: 22, y: 12 },
      { tipo: 'lua-cratera-p', x: 3, y: 12 }, { tipo: 'lua-pegadas', x: 8, y: 14, var: { giro: 1 } }, { tipo: 'lua-poeira', x: 15, y: 14 },
      { tipo: 'lua-seixos', x: 18, y: 15 }, { tipo: 'lua-pedra', x: 20, y: 14 }, { tipo: 'lua-cratera-p', x: 22, y: 15 },
      { tipo: 'lua-poeira', x: 1, y: 12 }, { tipo: 'lua-seixos', x: 9, y: 8 }, { tipo: 'lua-pedra', x: 22, y: 10 },
      { tipo: 'lua-cratera-p', x: 16, y: 7 }, { tipo: 'lua-pegadas', x: 1, y: 15 },
      { tipo: 'lua-seixos', x: 6, y: 5 }, { tipo: 'lua-cratera-p', x: 3, y: 8 }, { tipo: 'lua-poeira', x: 19, y: 8 },
      { tipo: 'lua-seixos', x: 14, y: 9 }, { tipo: 'lua-cratera-p', x: 7, y: 12 },
    ],
    // os ETs: os registrados com predio 'planeta-lua' e x/y (Reino.personagensDoPredio; vagas em reservas.js)
    npcs: R.personagensDoPredio('planeta-lua').filter(function (p) { return p.x != null && p.y != null; }).map(npc),
  });
})();
