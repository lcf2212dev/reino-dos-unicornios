/* Montanha Gelada: o portal no mapa (Reino.Portal, arte/portal.js: o portal do Bosque com o redemoinho azul-gelo) e o lugar
   (Reino.registrarLugar, docs/contratos/interiores.md §9.7 e arenas.md). rect 1×1 = o próprio tile do portal,
   na mata da borda norte, no fim da travessa que sobe entre a História e o Inglês (a porta é o tile); caminho = a travessa seguindo para o norte até a frente do portal.
   Livre de verdade: node jogo/ferramentas/validar/lugares-do-mapa.js --livres 1x1. Sem trava de nível: o menu
   mostra o nível recomendado (config.arenas.gelo.nivel). A frente do mapa pode mudar as cores e o emoji (com o ícone). */
if (Reino.Portal) Reino.Portal.registrar('portal-gelo', { aro: '#8fd8ff', aroLuz: '#e0f6ff', aroSombra: '#5aa8d8', fundo: '#2f5ab0', braco: '#ffffff', ponto: '#d8f0ff', miolo: '#f0faff', halo: [196, 232, 255], luz: [240, 250, 255], pulso: ['#ffffff', '#e0f6ff', '#bfe9ff', '#e0f6ff'], faisca: ['#ffffff', '#bfe9ff', '#8fd8ff', '#e0f6ff'] });
Reino.registrarLugar({
  id: 'gelo', nome: 'Montanha Gelada', sprite: 'portal-gelo',
  rect: { x: 11, y: 3, w: 1, h: 1 },
  caminho: [[11, 10], [11, 9], [11, 8], [11, 7], [11, 6], [11, 5], [11, 4]],
  novidade: { desde: '2026-11-06', interior: 'gelo' },
  menu: {
    emoji: '🐧',
    info: function () { return 'Nível recomendado: ' + Reino.config.arenas.gelo.nivel; },
  },
});

/* Montanha Gelada: o interior MÍNIMO da arena 'gelo' (docs/contratos/arenas.md), feito na onda 0 para o portal já levar a
   algum lugar; a frente do mapa troca este arquivo pelo dela (fundo, objetos, inimigos e falas próprios, como o
   Pântano: interiores/pantano/). Por enquanto: o layout de Reino.Interiores.arena com os objetos do Bosque, um piso
   chapado na cor do mapa, o céu de copas do Bosque e o portal de volta na cor do mapa. Sem desenho de inimigo
   registrado, a arena usa os fantasmas e a mosca do Bosque (bosque-desenho.js). Os números: config.arenas.gelo.
   Fixos (contrato das arenas): id 'gelo', 56 × 44, cômodo { x: 1, y: 1, w: 54, h: 40 }, saída (28, 40), spawn (28, 39).
   Falas: as do Bosque (mesmo texto, pacote 'interior-bosque': nenhuma voz nova). */
(function () {
  var R = window.Reino, I = R.Interiores;
  if (!I || !I.arena) return;   // o validador de lugares carrega só o registrarLugar acima
  var D = I.desenho, ret = D.ret, sorte = R.Desenho.sorte;
  I.PISOS['gelo-chao'] = { cores: { piso: '#e4f2fa', piso2: '#d0e6f4', detalhe: '#a8cce4', luz: '#ffffff' },
    desenhar: function (ctx, px, py, tx, ty, c) {
      ret(ctx, px, py, 16, 16, c.piso);
      if (sorte(tx, ty, 1) < 0.5) ret(ctx, px + Math.floor(sorte(tx, ty, 2) * 8), py + 3, 8, 5, c.piso2);
      if (sorte(tx, ty, 3) < 0.4) ret(ctx, px + 2 + Math.floor(sorte(tx, ty, 4) * 10), py + 10, 3, 2, c.detalhe);
      if (sorte(tx, ty, 5) < 0.3) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 6) * 6), py + 6, 2, 2, c.luz);
    } };
  I.FUNDOS['gelo'] = { cor: '#2f6b34',
    desenhar: function (ctx, w, h) { I.FUNDOS.bosque.desenhar(ctx, w, h); },
    saida: R.Portal.saida({ pedra: ['#8a9cb0', '#b8c8d8', '#e8f2fa'], anel: ['#3f7fd0', '#8fd8ff', '#d8f0ff', '#ffffff'] }) };
  var L = I.arena({
    semente: 20261107,
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
  R.registrarArena({ id: 'gelo', nome: 'Montanha Gelada', curto: 'Montanha', emoji: '🐧' });
  R.registrarInterior({
    id: 'gelo', lugar: 'gelo', nome: 'Montanha Gelada', entrada: true, pacote: 'interior-bosque', fundo: 'gelo',
    tamanho: L.tamanho, saida: L.saida, spawn: L.spawn,
    comodos: [{ id: 'gelo', nome: 'Montanha Gelada', rect: L.comodo, piso: 'gelo-chao', parede: 'bosque-copas' }],
    objetos: L.objetos,
  });
})();
