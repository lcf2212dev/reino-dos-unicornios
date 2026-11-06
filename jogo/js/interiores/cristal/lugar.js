/* Caverna de Cristal: o portal no mapa (Reino.Portal, arte/portal.js: o portal do Bosque com o redemoinho ciano e roxo) e o lugar
   (Reino.registrarLugar, docs/contratos/interiores.md §9.7 e arenas.md). rect 1×1 = o próprio tile do portal,
   na mata da borda oeste, no fim da avenida de baixo (a porta é o tile); caminho = o tile entre a ponta da avenida e o portal.
   Livre de verdade: node jogo/ferramentas/validar/lugares-do-mapa.js --livres 1x1. Sem trava de nível: o menu
   mostra o nível recomendado (config.arenas.cristal.nivel). A frente do mapa pode mudar as cores e o emoji (com o ícone). */
if (Reino.Portal) Reino.Portal.registrar('portal-cristal', { aro: '#5fe0e8', aroLuz: '#d0fbff', aroSombra: '#2fa8b8', fundo: '#3a1f7a', braco: '#c89cff', ponto: '#eadcff', miolo: '#e0f8ff', halo: [180, 240, 255], luz: [235, 250, 255], pulso: ['#ffffff', '#e0f8ff', '#c8f4ff', '#e0f8ff'], faisca: ['#ffffff', '#5fe0e8', '#c89cff', '#a66bff'] });
Reino.registrarLugar({
  id: 'cristal', nome: 'Caverna de Cristal', sprite: 'portal-cristal',
  rect: { x: 2, y: 29, w: 1, h: 1 },
  caminho: [[2, 30]],
  novidade: { desde: '2026-11-06', interior: 'cristal' },
  menu: {
    emoji: '💎',
    info: function () { return 'Nível recomendado: ' + Reino.config.arenas.cristal.nivel; },
  },
});

/* Caverna de Cristal: o interior MÍNIMO da arena 'cristal' (docs/contratos/arenas.md), feito na onda 0 para o portal já levar a
   algum lugar; a frente do mapa troca este arquivo pelo dela (fundo, objetos, inimigos e falas próprios, como o
   Pântano: interiores/pantano/). Por enquanto: o layout de Reino.Interiores.arena com os objetos do Bosque, um piso
   chapado na cor do mapa, o céu de copas do Bosque e o portal de volta na cor do mapa. Sem desenho de inimigo
   registrado, a arena usa os fantasmas e a mosca do Bosque (bosque-desenho.js). Os números: config.arenas.cristal.
   Fixos (contrato das arenas): id 'cristal', 56 × 44, cômodo { x: 1, y: 1, w: 54, h: 40 }, saída (28, 40), spawn (28, 39).
   Falas: as do Bosque (mesmo texto, pacote 'interior-bosque': nenhuma voz nova). */
(function () {
  var R = window.Reino, I = R.Interiores;
  if (!I || !I.arena) return;   // o validador de lugares carrega só o registrarLugar acima
  var D = I.desenho, ret = D.ret, sorte = R.Desenho.sorte;
  I.PISOS['cristal-chao'] = { cores: { piso: '#b9a6e0', piso2: '#a892d4', detalhe: '#7e66b8', luz: '#d8ccf4' },
    desenhar: function (ctx, px, py, tx, ty, c) {
      ret(ctx, px, py, 16, 16, c.piso);
      if (sorte(tx, ty, 1) < 0.5) ret(ctx, px + Math.floor(sorte(tx, ty, 2) * 8), py + 3, 8, 5, c.piso2);
      if (sorte(tx, ty, 3) < 0.4) ret(ctx, px + 2 + Math.floor(sorte(tx, ty, 4) * 10), py + 10, 3, 2, c.detalhe);
      if (sorte(tx, ty, 5) < 0.3) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 6) * 6), py + 6, 2, 2, c.luz);
    } };
  I.FUNDOS['cristal'] = { cor: '#2f6b34',
    desenhar: function (ctx, w, h) { I.FUNDOS.bosque.desenhar(ctx, w, h); },
    saida: R.Portal.saida({ pedra: ['#6a5a8a', '#8a7aaa', '#b8a8d8'], anel: ['#5a2fb0', '#5fe0e8', '#c89cff', '#eadcff'] }) };
  var L = I.arena({
    semente: 20261109,
    clareiras: [[28, 37, 5.5], [13, 32, 4], [45, 31, 4], [13, 22, 4.5], [44, 20, 4.5], [28, 23, 3.5], [14, 9, 4], [42, 9, 4], [28, 6, 3.5]],
    fixos: [
      ['bosque-lanterna', 23, 36, 'Lanterna', ['Uma lanterna das fadas.', 'A luz dela nunca se apaga.']],
      ['bosque-cogumelo', 42, 29, 'Cogumelo', ['Um cogumelo que brilha!', 'Ele ilumina o caminho.']],
      ['bosque-arvore-velha', 11, 25, 'Árvore velha', ['Esta árvore é muito velhinha.']],
    ],
    enfeites: [['bosque-poca', 11, 33], ['bosque-poca', 27, 22], ['bosque-lanterna', 22, 33], ['bosque-lanterna', 34, 33], ['bosque-lanterna', 24, 27],
      ['bosque-lanterna', 33, 23], ['bosque-lanterna', 26, 19], ['bosque-lanterna', 30, 9], ['bosque-placa', 34, 36]],
    altos: { 'bosque-arvore': 1, 'bosque-arvore-p': 1, 'bosque-pinheiro': 1 },
    borda: { lado: 'bosque-arvore', baixo: ['bosque-arbusto', 'bosque-arvore-p'] },
    bosques: [[8, 36, 4], [48, 37, 4], [20, 29, 3], [38, 28, 3], [8, 18, 5], [22, 19, 4], [37, 24, 4], [49, 15, 5], [8, 6, 5], [21, 4, 4], [36, 4, 4], [49, 6, 5], [21, 11, 4], [36, 12, 4]],
    mata: [[0.35, 'bosque-arvore'], [0.55, 'bosque-arvore-p'], [0.7, 'bosque-pinheiro'], [0.86, 'bosque-arbusto'], [0.93, 'bosque-pedra'], [1, 'bosque-toco']],
    bolsao: ['bosque-arbusto', 'bosque-pedra', 'bosque-toco'], coberto: 'bosque-arbusto',
    miudos: { comum: ['bosque-mato', 'bosque-mato', 'bosque-flores', 'bosque-margaridas', 'bosque-trevo', 'bosque-samambaia'],
      fundo: ['bosque-cogumelos', 'bosque-flor-brilho', 'bosque-vagalumes', 'bosque-mato'], fundoAte: 20, varN: { 'bosque-flores': 5, 'bosque-cogumelos': 4 } },
  });
  R.registrarArena({ id: 'cristal', nome: 'Caverna de Cristal', curto: 'Caverna', emoji: '💎' });
  R.registrarInterior({
    id: 'cristal', lugar: 'cristal', nome: 'Caverna de Cristal', entrada: true, pacote: 'interior-bosque', fundo: 'cristal',
    tamanho: L.tamanho, saida: L.saida, spawn: L.spawn,
    comodos: [{ id: 'cristal', nome: 'Caverna de Cristal', rect: L.comodo, piso: 'cristal-chao', parede: 'bosque-copas' }],
    objetos: L.objetos,
  });
})();
