/* Laboratório de Química, 2º andar: o que os objetos do andar dizem (voz da narradora, pacote interior-quimica).
   Os objetos de curiosidade não têm fala aqui: contam uma curiosidade do tema deles (quimica/curiosidade.js).
   Cada página com até 30 letras (sem contar «» e emoji) e frases de 3+ palavras. Chaves diferentes das do térreo
   (quimica/falas.js): as duas partes somam no mesmo Reino.falasDoPredio('quimica'). */
Reino.falasDoPredio('quimica', {
  objetos: {
    // os três que abrem as telas (docs/contratos/quimica.md §9)
    'fogao': ['O Fogão dos Estados!', 'O gelo derrete no calor.'],
    'mesa-separar': ['A Mesa de Separar Misturas!', 'Cada mistura tem um jeito.'],
    'estante-livros': ['Uma estante cheia de livros!', 'Qual livro vamos ler?'],
    // enfeites que falam
    'pia-cozinha': ['A pia da cozinha!', 'A água lava a louça.'],
  },
});
