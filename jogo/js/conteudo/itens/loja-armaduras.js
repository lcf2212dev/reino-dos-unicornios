/* Vila Arco-Íris: as 20 armaduras e as 20 botas de Armaduras e Botas (loja 'armaduras'; docs/contratos/vila.md §2 e
   §4). Só se compram (arenas vazias); o preço sai da raridade (config.vila.precos). Armadura dá vida (e proteção);
   botas dão rapidez. Cada uma: id, nome, raridade, bônus, forma e tema de cor (Reino._lojaMoldes, de loja-moldes.js,
   registra o catálogo, o molde de vestir e o ícone).
   NÃO troque o `id` de uma peça: o save guarda as peças por ele. Só dados (node: true). */
(function () {
  var peca = window.Reino._lojaMoldes.peca;

  /* ---------- ARMADURAS ---------- */
  peca('armadura-chocolate', 'Colete de Chocolate', 'comum', { vida: 2 }, 'gibao', 'chocolate');
  peca('armadura-morango', 'Túnica de Morango', 'comum', { vida: 2 }, 'tunica', 'morango');
  peca('armadura-limao', 'Túnica de Limão', 'comum', { vida: 3 }, 'tunica', 'limao');
  peca('armadura-bronze', 'Peitoral de Bronze', 'comum', { vida: 3 }, 'peitoral', 'bronze');
  peca('armadura-floresta', 'Malha da Floresta', 'comum', { vida: 3 }, 'cota', 'floresta');
  peca('armadura-algodao', 'Vestido Algodão-Doce', 'comum', { vida: 4 }, 'vestido', 'algodao');
  peca('armadura-girassol', 'Vestido de Girassol', 'comum', { vida: 4 }, 'vestido', 'girassol');
  peca('armadura-coral', 'Colete de Coral', 'comum', { vida: 4 }, 'gibao', 'coral');
  peca('armadura-pirata', 'Casaca de Pirata', 'raro', { vida: 6, defesa: 1 }, 'gibao', 'pirata');
  peca('armadura-prata', 'Cota de Prata', 'raro', { vida: 5, defesa: 1 }, 'cota', 'prata');
  peca('armadura-oceano', 'Túnica do Oceano', 'raro', { vida: 6, defesa: 1 }, 'tunica', 'oceano');
  peca('armadura-fada', 'Vestido de Fada', 'raro', { vida: 6, defesa: 1 }, 'vestido', 'fada');
  peca('armadura-esmeralda', 'Peitoral de Esmeralda', 'raro', { vida: 6, defesa: 1 }, 'peitoral', 'esmeralda');
  peca('armadura-lua', 'Malha da Lua', 'raro', { vida: 7, defesa: 1 }, 'cota', 'lua');
  peca('armadura-rubi', 'Peitoral de Rubi', 'epico', { vida: 8, defesa: 1 }, 'peitoral', 'rubi');
  peca('armadura-noite', 'Túnica da Noite', 'epico', { vida: 8, defesa: 2 }, 'tunica', 'noite');
  peca('armadura-safira', 'Cota de Safira', 'epico', { vida: 9, defesa: 1 }, 'cota', 'safira');
  peca('armadura-trovao', 'Colete do Trovão', 'epico', { vida: 8, defesa: 2 }, 'gibao', 'trovao');
  peca('armadura-arcoiris', 'Vestido Arco-Íris', 'lendario', { vida: 12, defesa: 2 }, 'vestido', 'arcoiris');
  peca('armadura-ouro', 'Peitoral de Ouro', 'lendario', { vida: 11, defesa: 3 }, 'peitoral', 'ouro');

  /* ---------- BOTAS ---------- */
  peca('botas-chocolate', 'Botinhas de Chocolate', 'comum', { velocidade: 0.04 }, 'cano', 'chocolate');
  peca('botas-morango', 'Sapatilha de Morango', 'comum', { velocidade: 0.04 }, 'meia', 'morango');
  peca('botas-limao', 'Botas de Limão', 'comum', { velocidade: 0.05 }, 'bico', 'limao');
  peca('botas-abobora', 'Botas de Abóbora', 'comum', { velocidade: 0.05 }, 'cano', 'abobora');
  peca('botas-algodao', 'Pantufas Algodão-Doce', 'comum', { velocidade: 0.05 }, 'pelinho', 'algodao');
  peca('botas-menta', 'Sapatilha de Menta', 'comum', { velocidade: 0.06 }, 'meia', 'menta');
  peca('botas-coral', 'Botas de Coral', 'comum', { velocidade: 0.06 }, 'bico', 'coral');
  peca('botas-ceu', 'Botinhas do Céu', 'comum', { velocidade: 0.06 }, 'asinha', 'ceu');
  peca('botas-pinguim', 'Botas do Pinguim', 'raro', { velocidade: 0.08 }, 'pelinho', 'pinguim');
  peca('botas-pirata', 'Botas de Pirata', 'raro', { velocidade: 0.08 }, 'cano', 'pirata');
  peca('botas-oceano', 'Botas do Oceano', 'raro', { velocidade: 0.09 }, 'bico', 'oceano');
  peca('botas-fada', 'Sapatilhas de Fada', 'raro', { velocidade: 0.09 }, 'meia', 'fada');
  peca('botas-lua', 'Botas da Lua', 'raro', { velocidade: 0.10 }, 'asinha', 'lua');
  peca('botas-quartzo', 'Botas de Quartzo', 'raro', { velocidade: 0.10 }, 'pelinho', 'quartzo');
  peca('botas-rubi', 'Botas de Rubi', 'epico', { velocidade: 0.12 }, 'cano', 'rubi');
  peca('botas-trovao', 'Botas do Trovão', 'epico', { velocidade: 0.12 }, 'asinha', 'trovao');
  peca('botas-ametista', 'Sapatilhas de Ametista', 'epico', { velocidade: 0.13 }, 'meia', 'ametista');
  peca('botas-esmeralda', 'Botas de Esmeralda', 'epico', { velocidade: 0.13 }, 'bico', 'esmeralda');
  peca('botas-arcoiris', 'Botas Arco-Íris', 'lendario', { velocidade: 0.15 }, 'asinha', 'arcoiris');
  peca('botas-estrela', 'Botas das Estrelas', 'lendario', { velocidade: 0.15 }, 'pelinho', 'estrela');
})();
