/* Lugares fixos do mapa (DADOS): prédios que não são matéria, e as clareiras das matérias.
   Os prédios de hoje ficam aqui. Prédio novo NÃO entra aqui: usa Reino.registrarLugar na pasta dele
   (js/interiores/<p>/lugar.js; docs/contratos/interiores.md §9.7) + o desenho em Mapa.PREDIOS[sprite].
   Cada entrada vira um lugar de Mapa.lugares() assim: { tipo: id, porta, ...a entrada }.
     id, nome (a placa), sprite (chave de Mapa.PREDIOS), rect (em tiles; a porta fica no meio da
     última linha), placa ('acima' ou 'direita'; sem ela, o padrão da placa).
     caminho: tiles de rua da rua até a frente da porta. Lugar COM caminho entra no mapa DEPOIS do
       sorteio dos enfeites, para o resto do reino continuar com as mesmas árvores e flores de
       sempre (o sorteio segue a ordem dos tiles). Lugar SEM caminho (os primeiros) entra antes do
       sorteio e ganha uma ligação reta até a rua mais próxima. Todo lugar novo vai COM caminho.
   Ordem de Mapa.lugares(): os sem caminho (nesta ordem), as matérias, as matérias porCima e os
   com caminho (nesta ordem). As matérias trazem o lugar em Reino.materias (lugar.rect ou uma
   clareira). */
(function () {
  var Mapa = window.Mapa;

  // clareiras onde as próximas matérias vão ganhar um lugar
  Mapa.CLAREIRAS = [
    { x: 10, y: 4, w: 5, h: 5 },
    { x: 23, y: 4, w: 5, h: 5 },
    { x: 22, y: 15, w: 5, h: 5 },
  ];

  Mapa.LUGARES_FIXOS = [
    // castelo com placa à direita (à esquerda cobriria a torre da clareira); a do baú vai no telhado
    { id: 'castelo', nome: 'Castelo da Medalha', sprite: 'castelo', rect: { x: 15, y: 1, w: 7, h: 5 }, placa: 'direita' },
    { id: 'bau', nome: 'Baú do Tesouro', sprite: 'bau', rect: { x: 29, y: 3, w: 5, h: 4 }, placa: 'acima' },
    // placa em cima do telhado: à direita ela cobriria a Escola do Reino
    { id: 'estabulo', nome: 'Estábulo Mágico', sprite: 'estabulo', rect: { x: 2, y: 15, w: 6, h: 4 }, placa: 'acima' },
    // placa em cima do telhado: ao lado ela cobria a Casa das Palavras (clareira 22,15)
    { id: 'loja', nome: 'Loja das Fadas', sprite: 'loja', rect: { x: 29, y: 15, w: 5, h: 4 }, placa: 'acima' },
    { id: 'escola', nome: 'Escola do Reino', sprite: 'escola', rect: { x: 9, y: 15, w: 5, h: 5 } },
    // chegaram depois (Pet Shop e Observatório): ao sul da rua de baixo, fora das clareiras;
    // a porta fica embaixo, virada para o sul
    // em frente ao Estábulo, do outro lado da rua
    // placa em cima: ao lado da porta, ela passava na frente e cobria o "Sede"/"Fome"
    { id: 'petshop', nome: 'Pet Shop', sprite: 'petshop', rect: { x: 2, y: 21, w: 5, h: 4 }, placa: 'acima',
      caminho: [[7, 21], [7, 22], [7, 23], [7, 24], [7, 25], [6, 25], [5, 25], [4, 25]] },
    // no morro a leste do lago (o ponto alto do reino)
    // placa em cima: a área inclui a ilha do morro, e ao lado a placa ficava longe da cúpula
    { id: 'observatorio', nome: 'Observatório', sprite: 'observatorio', rect: { x: 28, y: 21, w: 6, h: 5 }, placa: 'acima',
      caminho: [[27, 21], [27, 22], [27, 23], [27, 24], [27, 25], [27, 26], [28, 26], [29, 26], [30, 26], [31, 26]] },
  ];
})();
