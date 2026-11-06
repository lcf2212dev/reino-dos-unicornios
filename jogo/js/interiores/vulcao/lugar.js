/* Vulcão dos Dragõezinhos: o portal no mapa (Reino.Portal, arte/portal.js: o portal do Bosque com o redemoinho vermelho-lava) e o lugar
   (Reino.registrarLugar, docs/contratos/interiores.md §9.7 e arenas.md). rect 1×1 = o próprio tile do portal,
   na mata da borda leste, no fim da avenida de cima (a porta é o tile); caminho = o tile entre a ponta da avenida e o portal.
   Livre de verdade: node jogo/ferramentas/validar/lugares-do-mapa.js --livres 1x1. Sem trava de nível: o menu
   mostra o nível recomendado (config.arenas.vulcao.nivel). A frente do mapa pode mudar as cores e o emoji (com o ícone). */
if (Reino.Portal) Reino.Portal.registrar('portal-vulcao', { aro: '#ff6a3d', aroLuz: '#ffd0b8', aroSombra: '#c83a1a', fundo: '#5a1010', braco: '#ffd34d', ponto: '#fff1a0', miolo: '#ffe0b0', halo: [255, 190, 150], luz: [255, 240, 220], pulso: ['#ffffff', '#fff1a0', '#ffd0b8', '#fff1a0'], faisca: ['#ffffff', '#ffd34d', '#ff8a3d', '#ff5c4a'] });
Reino.registrarLugar({
  id: 'vulcao', nome: 'Vulcão dos Dragõezinhos', sprite: 'portal-vulcao',
  rect: { x: 53, y: 10, w: 1, h: 1 },
  caminho: [[53, 11]],
  novidade: { desde: '2026-11-06', interior: 'vulcao' },
  menu: {
    emoji: '🐉',
    info: function () { return 'Nível recomendado: ' + Reino.config.arenas.vulcao.nivel; },
  },
});

/* Vulcão dos Dragõezinhos: o interior MÍNIMO da arena 'vulcao' (docs/contratos/arenas.md), feito na onda 0 para o portal já levar a
   algum lugar; a frente do mapa troca este arquivo pelo dela (fundo, objetos, inimigos e falas próprios, como o
   Pântano: interiores/pantano/). Por enquanto: o layout de Reino.Interiores.arena com os objetos do Bosque, um piso
   chapado na cor do mapa, o céu de copas do Bosque e o portal de volta na cor do mapa. Sem desenho de inimigo
   registrado, a arena usa os fantasmas e a mosca do Bosque (bosque-desenho.js). Os números: config.arenas.vulcao.
   Fixos (contrato das arenas): id 'vulcao', 56 × 44, cômodo { x: 1, y: 1, w: 54, h: 40 }, saída (28, 40), spawn (28, 39).
   Falas: as do Bosque (mesmo texto, pacote 'interior-bosque': nenhuma voz nova). */
(function () {
  var R = window.Reino, I = R.Interiores;
  if (!I || !I.arena) return;   // o validador de lugares carrega só o registrarLugar acima
  var D = I.desenho, ret = D.ret, sorte = R.Desenho.sorte;
  I.PISOS['vulcao-chao'] = { cores: { piso: '#c9a58f', piso2: '#b8927a', detalhe: '#8a6650', luz: '#e0c2ae' },
    desenhar: function (ctx, px, py, tx, ty, c) {
      ret(ctx, px, py, 16, 16, c.piso);
      if (sorte(tx, ty, 1) < 0.5) ret(ctx, px + Math.floor(sorte(tx, ty, 2) * 8), py + 3, 8, 5, c.piso2);
      if (sorte(tx, ty, 3) < 0.4) ret(ctx, px + 2 + Math.floor(sorte(tx, ty, 4) * 10), py + 10, 3, 2, c.detalhe);
      if (sorte(tx, ty, 5) < 0.3) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 6) * 6), py + 6, 2, 2, c.luz);
    } };
  I.FUNDOS['vulcao'] = { cor: '#2f6b34',
    desenhar: function (ctx, w, h) { I.FUNDOS.bosque.desenhar(ctx, w, h); },
    saida: R.Portal.saida({ pedra: ['#5a4a4a', '#7a6a6a', '#a89898'], anel: ['#a82a10', '#ff6a3d', '#ffd34d', '#fff1a0'] }) };
  var L = I.arena({
    semente: 20261110,
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
  R.registrarArena({ id: 'vulcao', nome: 'Vulcão dos Dragõezinhos', curto: 'Vulcão', emoji: '🐉' });
  R.registrarInterior({
    id: 'vulcao', lugar: 'vulcao', nome: 'Vulcão dos Dragõezinhos', entrada: true, pacote: 'interior-bosque', fundo: 'vulcao',
    tamanho: L.tamanho, saida: L.saida, spawn: L.spawn,
    comodos: [{ id: 'vulcao', nome: 'Vulcão dos Dragõezinhos', rect: L.comodo, piso: 'vulcao-chao', parede: 'bosque-copas' }],
    objetos: L.objetos,
  });
})();
