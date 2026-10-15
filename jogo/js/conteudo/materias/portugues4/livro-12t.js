/* Cartas do Livro de Atividades, Capítulo 12 "O visual do poema" (pp. 13 a 18), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). O poema visual "Falta de sorte" é ilustração (ilustracoes-12.js) e o
   texto dele vem também em `versos`, na leitura linear do INVENTARIO.md. Página só de questões: carta curta. */
(function () {
  var L = 'atividades', C = 12;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  Reino.registrarCartas('portugues4', [
    // poema e poema visual (pp. 13 e 14)
    carta('lp-t13', '🏃', 'Falta de sorte', 13, [
      { t: 'quadro', titulo: 'Poema e poema visual', texto: 'Leia o poema visual e responda às questões.' },
      { t: 'ilustracao', id: 'lp-12-falta-de-sorte', alt: 'Poema visual Falta de sorte: as letras da palavra cai vão descendo, uma em cada linha; embaixo, uma bola vermelha é a cabeça de um boneco correndo, com o corpo, os braços e as pernas feitos de palavras.' },
      { t: 'versos', versos: ['Hoje estou sem sorte', 'Tudo me cai da mão', 'Para não perder a cabeça', 'vou fugir para o Japão.'] },
      { t: 'fonte', texto: 'CAPPARELLI, Sérgio. Falta de sorte. In: 111 poemas para crianças. Ilustrações de Ana Gruszynski. Porto Alegre: Via Láctea, 2021. p. 120.' },
    ]),
    carta('lp-t14', '📝', 'Poema e poema visual', 14, [
      { t: 'texto', texto: 'Questões 1 a 4 sobre o poema visual Falta de sorte: a imagem formada, o significado de cada trecho, a palavra cai escrita com uma letra em cada linha e a diferença entre o poema tradicional e o poema visual.' },
    ]),

    // palavras terminadas em -ã, -ão, -ães (pp. 15 e 16)
    carta('lp-t15', '📝', 'Palavras terminadas em -ã, -ão, -ães', 15, [
      { t: 'texto', texto: 'Questões 1 a 3: ligar cada palavra à terminação dela, completar as palavras das frases com as terminações corretas e trocar a terminação -ÃO por -Ã para descobrir o feminino.' },
      { t: 'quadro', texto: 'Ã – ÃO – ÃES' },
    ]),
    carta('lp-t16', '📝', 'Palavras terminadas em -ã, -ão, -ães', 16, [
      { t: 'texto', texto: 'Questões 4 e 5: escrever o nome dos objetos das imagens e passar pão e mãe para o plural com a terminação -ÃES, escrevendo uma frase com cada palavra.' },
      { t: 'figuras', itens: [{ img: '🍎' }, { img: '🧲' }, { img: 'lp:12-balao' }, { img: 'lp:12-coracao' }] },
    ]),

    // letras maiúsculas e minúsculas; substantivos próprios e comuns (pp. 17 e 18)
    carta('lp-t17', '🔠', 'Maiúsculas e minúsculas; próprios e comuns', 17, [
      { t: 'texto', texto: 'Questões 1 a 3: completar palavras com a letra que falta (a letra inicial é maiúscula em nomes próprios), ligar cada substantivo ao seu tipo e completar frases com as letras indicadas nos parênteses.' },
      { t: 'quadro', texto: 'Substantivo próprio – Substantivo comum' },
    ]),
    carta('lp-t18', '📝', 'Maiúsculas e minúsculas; próprios e comuns', 18, [
      { t: 'texto', texto: 'Questões 4 e 5: conferir o uso das letras maiúsculas e minúsculas em duas frases, reescrever as frases com os ajustes e escrever frases com o nome de uma pessoa da família, de um objeto da escola e de uma rua.' },
    ]),
  ]);
})();
