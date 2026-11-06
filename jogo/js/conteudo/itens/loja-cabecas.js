/* Vila Arco-Íris: os 20 capacetes e os 20 chapéus de Elmos e Chapéus (loja 'cabecas'; docs/contratos/vila.md §2 e §4).
   Só se compram (arenas vazias); o preço sai da raridade (config.vila.precos). Capacete protege (defesa, vida); chapéu
   dá sorte (e vida ou rapidez). Cada um: id, nome, raridade, bônus, forma e tema de cor (Reino._lojaMoldes, de
   loja-moldes.js, registra o catálogo, o molde da cabeça e o ícone).
   NÃO troque o `id` de uma peça: o save guarda as peças por ele. Só dados (node: true). */
(function () {
  var peca = window.Reino._lojaMoldes.peca;

  /* ---------- CAPACETES ---------- */
  peca('capacete-bronze', 'Elmo de Bronze', 'comum', { defesa: 1 }, 'crista', 'bronze');
  peca('capacete-chocolate', 'Elmo de Chocolate', 'comum', { defesa: 1 }, 'chifres', 'chocolate');
  peca('capacete-limao', 'Elmo de Limão', 'comum', { defesa: 1 }, 'ponta', 'limao');
  peca('capacete-abobora', 'Elmo de Abóbora', 'comum', { defesa: 1 }, 'asas', 'abobora');
  peca('capacete-floresta', 'Elmo da Floresta', 'comum', { defesa: 1, vida: 1 }, 'chifres', 'floresta');
  peca('capacete-coral', 'Elmo de Coral', 'comum', { defesa: 1, vida: 1 }, 'unicornio', 'coral');
  peca('capacete-prata', 'Elmo de Prata', 'comum', { defesa: 1, vida: 1 }, 'crista', 'prata');
  peca('capacete-menta', 'Elmo de Menta', 'comum', { defesa: 1, vida: 2 }, 'asas', 'menta');
  peca('capacete-pinguim', 'Elmo do Pinguim', 'raro', { defesa: 2 }, 'ponta', 'pinguim');
  peca('capacete-oceano', 'Elmo do Oceano', 'raro', { defesa: 1, vida: 2 }, 'crista', 'oceano');
  peca('capacete-lua', 'Elmo da Lua', 'raro', { defesa: 2 }, 'asas', 'lua');
  peca('capacete-quartzo', 'Elmo de Quartzo', 'raro', { defesa: 2, vida: 1 }, 'unicornio', 'quartzo');
  peca('capacete-esmeralda', 'Elmo de Esmeralda', 'raro', { defesa: 2, vida: 2 }, 'ponta', 'esmeralda');
  peca('capacete-trovao', 'Elmo do Trovão', 'raro', { defesa: 2, vida: 2 }, 'chifres', 'trovao');
  peca('capacete-rubi', 'Elmo de Rubi', 'epico', { defesa: 2, vida: 4 }, 'crista', 'rubi');
  peca('capacete-safira', 'Elmo de Safira', 'epico', { defesa: 3, vida: 2 }, 'ponta', 'safira');
  peca('capacete-ouro', 'Elmo de Ouro', 'epico', { defesa: 3, vida: 2 }, 'asas', 'ouro');
  peca('capacete-noite', 'Elmo da Noite', 'epico', { defesa: 2, vida: 4 }, 'unicornio', 'noite');
  peca('capacete-arcoiris', 'Elmo Arco-Íris', 'lendario', { defesa: 3, vida: 6 }, 'unicornio', 'arcoiris');
  peca('capacete-vulcao', 'Elmo do Vulcão', 'lendario', { defesa: 4, vida: 4 }, 'chifres', 'vulcao');

  /* ---------- CHAPÉUS ---------- */
  peca('chapeu-morango', 'Boina de Morango', 'comum', { sorte: 0.10 }, 'boina', 'morango');
  peca('chapeu-girassol', 'Sombreiro Girassol', 'comum', { sorte: 0.10, velocidade: 0.03 }, 'sombreiro', 'girassol');
  peca('chapeu-chocolate', 'Cartola de Chocolate', 'comum', { sorte: 0.10, vida: 2 }, 'cartola', 'chocolate');
  peca('chapeu-limao', 'Boina de Limão', 'comum', { sorte: 0.10, velocidade: 0.03 }, 'boina', 'limao');
  peca('chapeu-abobora', 'Chapéu de Abóbora', 'comum', { sorte: 0.10, vida: 2 }, 'mago', 'abobora');
  peca('chapeu-coral', 'Tricórnio de Coral', 'comum', { sorte: 0.10 }, 'pirata', 'coral');
  peca('chapeu-margarida', 'Coroa de Margaridas', 'comum', { sorte: 0.10, vida: 2 }, 'flores', 'margarida');
  peca('chapeu-menta', 'Boina de Menta', 'comum', { sorte: 0.10, vida: 2 }, 'boina', 'menta');
  peca('chapeu-pirata', 'Chapéu de Pirata', 'raro', { sorte: 0.15, vida: 2 }, 'pirata', 'pirata');
  peca('chapeu-ceu', 'Boina do Céu', 'raro', { sorte: 0.15, velocidade: 0.05 }, 'boina', 'ceu');
  peca('chapeu-lavanda', 'Sombreiro de Lavanda', 'raro', { sorte: 0.15, vida: 2 }, 'sombreiro', 'lavanda');
  peca('chapeu-violeta', 'Coroa de Violetas', 'raro', { sorte: 0.15, velocidade: 0.05 }, 'flores', 'quartzo');
  peca('chapeu-pinguim', 'Cartola do Pinguim', 'raro', { sorte: 0.15, vida: 2 }, 'cartola', 'pinguim');
  peca('chapeu-fada', 'Chapéu de Fada', 'raro', { sorte: 0.15, velocidade: 0.05 }, 'mago', 'fada');
  peca('chapeu-noite', 'Chapéu do Mago Noturno', 'epico', { sorte: 0.20, vida: 2 }, 'mago', 'noite');
  peca('chapeu-rosas', 'Coroa de Rosas', 'epico', { sorte: 0.20, velocidade: 0.05 }, 'flores', 'rosa');
  peca('chapeu-uva', 'Cartola de Uva', 'epico', { sorte: 0.20, vida: 2 }, 'cartola', 'uva');
  peca('chapeu-oceano', 'Chapéu do Capitão', 'epico', { sorte: 0.20, velocidade: 0.05 }, 'pirata', 'oceano');
  peca('chapeu-arcoiris', 'Sombreiro Arco-Íris', 'lendario', { sorte: 0.25, vida: 4 }, 'sombreiro', 'arcoiris');
  peca('chapeu-estrela', 'Cartola das Estrelas', 'lendario', { sorte: 0.25, velocidade: 0.08 }, 'cartola', 'estrela');
})();
