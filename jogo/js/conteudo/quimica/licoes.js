/* Laboratório de Química: as lições do Cantinho dos Átomos (Reino.QUIMICA.licoes). Contrato: docs/contratos/quimica.md §3.
   id, ordem, titulo, emoji (com pixel art), paginas (lidas pela Doutora Proveta; até 30 letras, 3+ palavras),
   desenho (opcional, chave de um desenho da tela da tabela: 'atomo' | 'tabela' | 'h2o' | 'estados' | 'repolho' |
   'mistura'). Ler até o fim = descoberta ('licoes'). Título só na tela (pode ter símbolo); a voz lê as páginas. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.licoes = [
    { id: 'atomos', ordem: 1, titulo: 'Tudo é feito de átomos', emoji: '⚛', desenho: 'atomo',
      paginas: ['Tudo é feito de átomos.', 'Você e a flor também são.', 'O átomo é pequenininho!',
        'No meio dele fica o núcleo.', 'Lá tem prótons e nêutrons.', 'Em volta, giram os elétrons.',
        'São os tijolinhos de tudo!'] },
    { id: 'elemento', ordem: 2, titulo: 'O que é um elemento?', emoji: '🧪', desenho: 'tabela',
      paginas: ['Elemento é um tipo de átomo.', 'Seu número conta os prótons.',
        'O ouro tem 79 prótons.', 'Já conhecemos 118 elementos.', 'A tabela periódica tem todos.',
        'Na coluna, eles se parecem.', 'Cada cor é um tipo diferente.'] },
    { id: 'moleculas', ordem: 3, titulo: 'Moléculas: a água é H₂O', emoji: '💧', desenho: 'h2o',
      paginas: ['Átomos gostam de dar as mãos.', 'Juntos, eles formam moléculas.', 'A água é uma molécula.',
        'Tem dois átomos de hidrogênio.', 'E um átomo de oxigênio.', 'Uma gotinha tem montões delas!'] },
    { id: 'estados', ordem: 4, titulo: 'Sólido, líquido e gás', emoji: '🧊', desenho: 'estados',
      paginas: ['A água tem três jeitos de ser.', 'Sólido: o gelo, bem durinho.', 'Líquido: a água que escorre.',
        'Gás: o vapor que sobe no ar.', 'No gelo, as moléculas grudam.', 'No gás, elas correm soltas!',
        'O calor faz a água mudar.'] },
    { id: 'acidos-bases', ordem: 5, titulo: 'Ácidos e bases', emoji: '🍋', desenho: 'repolho',
      paginas: ['Limão e vinagre são ácidos.', 'Bicarbonato e sabão são bases.', 'O repolho roxo é indicador.',
        'Com ácido, ele fica rosa.', 'Com base, fica verde-azulado.', 'Nunca prove para descobrir!'] },
    { id: 'mistura-reacao', ordem: 6, titulo: 'Mistura ou reação?', emoji: '🥄', desenho: 'mistura',
      paginas: ['Misturar não é sempre reagir.', 'Sal na água é uma mistura.', 'Os átomos continuam iguais.',
        'Na reação, nasce algo novo.', 'No POF, nasceu um gás novo.', 'Bolhas e cor nova dão pistas!'] },
  ];
})();
