/* Vila Arco-Íris: as 20 espadas da Forja Brilhante (loja 'armas'; docs/contratos/vila.md §2 e §4). Só se compram (arenas
   vazias); o preço sai da raridade (config.vila.precos). Cada uma: id, nome, raridade, bônus, forma da lâmina e tema
   de cor (Reino._lojaMoldes, de loja-moldes.js, registra o catálogo, o molde da mão e o ícone).
   NÃO troque o `id` de uma peça: o save guarda as peças por ele. Só dados (node: true). */
(function () {
  var peca = window.Reino._lojaMoldes.peca;
  // comuns
  peca('espada-morango', 'Espada de Morango', 'comum', { dano: 1 }, 'reta', 'morango');
  peca('espada-limao', 'Espada de Limão', 'comum', { dano: 1 }, 'larga', 'limao');
  peca('espada-chocolate', 'Espada de Chocolate', 'comum', { dano: 2 }, 'coracao', 'chocolate');
  peca('espada-girassol', 'Espada Girassol', 'comum', { dano: 2 }, 'forquilha', 'girassol');
  peca('espada-bronze', 'Espada de Bronze', 'comum', { dano: 3 }, 'reta', 'bronze');
  peca('espada-coral', 'Espada de Coral', 'comum', { dano: 3 }, 'cristal', 'coral');
  peca('espada-floresta', 'Espada da Floresta', 'comum', { dano: 4 }, 'larga', 'floresta');
  peca('espada-algodao', 'Espada Algodão-Doce', 'comum', { dano: 4 }, 'coracao', 'algodao');
  // raras
  peca('espada-esmeralda', 'Espada de Esmeralda', 'raro', { dano: 4 }, 'cristal', 'esmeralda');
  peca('espada-oceano', 'Espada do Oceano', 'raro', { dano: 5 }, 'forquilha', 'oceano');
  peca('espada-pirata', 'Sabre do Pirata', 'raro', { dano: 5 }, 'larga', 'pirata');
  peca('espada-lua', 'Espada da Lua', 'raro', { dano: 6 }, 'reta', 'lua');
  peca('espada-fada', 'Espada da Fada', 'raro', { dano: 6 }, 'coracao', 'fada');
  peca('espada-trovao', 'Espada do Trovão', 'raro', { dano: 7 }, 'forquilha', 'trovao');
  // épicas
  peca('espada-rubi', 'Espada de Rubi', 'epico', { dano: 8 }, 'cristal', 'rubi');
  peca('espada-safira', 'Espada de Safira', 'epico', { dano: 8 }, 'reta', 'safira');
  peca('espada-ametista', 'Espada de Ametista', 'epico', { dano: 9 }, 'larga', 'ametista');
  peca('espada-fogo', 'Espada de Fogo', 'epico', { dano: 10 }, 'forquilha', 'fogo');
  // lendárias
  peca('espada-arcoiris', 'Espada Arco-Íris', 'lendario', { dano: 11 }, 'coracao', 'arcoiris');
  peca('espada-estrela', 'Espada das Estrelas', 'lendario', { dano: 12 }, 'cristal', 'estrela');
})();
