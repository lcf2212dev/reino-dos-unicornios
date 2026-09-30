/* Laboratório de Química: o que os objetos dizem (voz da narradora, pacote interior-quimica).
   As falas da Doutora Proveta ficam em quimica/personagens-falas.js; as das telas, em conteudo/quimica/frases-*.js.
   Cada página com até 30 letras (sem contar «» e emoji) e frases de 3+ palavras. Símbolo químico só na tela:
   a voz fala por extenso. */
Reino.falasDoPredio('quimica', {
  objetos: {
    // os quatro que abrem as telas (docs/contratos/quimica.md §5)
    'bancada': ['Hora de misturar poções!'],
    'caderno': ['O caderno de receitas!', 'Cada descoberta fica aqui.'],
    'microscopio': ['Um microscópio bem grande!', 'Vamos olhar as lâminas?'],
    'tabela': ['A tabela periódica!', 'Cada casinha é um elemento.'],
    // Bancada de Misturas
    'seguranca': ['Aqui diz: segurança primeiro!', 'Sempre com um adulto junto.'],
    'formulas': ['São fórmulas de moléculas.', 'A água tem dois hidrogênios.', 'E também um oxigênio!'],
    'capela': ['É a capela de exaustão.', 'Ela leva o cheiro embora.'],
    'lixeira': ['Lixeiras de reciclagem!', 'Papel, plástico e vidro.'],
    'vidrarias': ['Balões e provetas de vidro.', 'A proveta mede os líquidos.'],
    'frascos': ['Frascos de todas as cores!', 'Cada um tem uma etiqueta.'],
    'chuveiro': ['O chuveiro de segurança!', 'E o lava-olhos, bem aqui.'],
    'cabide': ['Jaleco e óculos de proteção.', 'Cientista se protege sempre!'],
    'extintor': ['Um extintor para emergências.', 'Tomara que nunca precise!'],
    'pia': ['A pia do laboratório.', 'Lavar as mãos é importante!'],
    // Sala do Microscópio
    'laminas': ['Uma caixa de lâminas!', 'Tem sal, folha e areia.'],
    'cristais': ['Olha quantos cristais!', 'O sal também é um cristal.'],
    'lupas': ['Lupas deixam tudo maior.', 'O microscópio, muito mais!'],
    'cebolas': ['Cebolas brotando na água!', 'A casquinha vira lâmina.'],
    'poster-cebola': ['A célula da cebola!', 'Parece uma parede de tijolos.'],
    'poster-neve': ['Um floco de neve de perto.', 'Ele tem seis pontas!'],
    // Cantinho dos Átomos
    'atomo': ['Um modelo de átomo!', 'Os elétrons giram em volta.'],
    'agua': ['A molécula da água!', 'Tem dois hidrogênios.', 'E um oxigênio no meio!'],
    'estados': ['Sólido, líquido e gás!', 'São os estados da matéria.'],
  },
});
