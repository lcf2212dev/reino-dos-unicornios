/* Cartas do Livro de Atividades, página da turminha (sem número: pagina 0) e Capítulo 10 "Conta uma história?"
   (pp. 1 a 6), na ordem das páginas (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra;
   página só de questões: carta curta com o título da seção e o que ela pede. */
(function () {
  var L = 'atividades', C = 10;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  Reino.registrarCartas('portugues4', [
    // a turminha SAE (página sem número)
    carta('lp-t00', '👥', 'Conheça a turminha SAE (1 de 3)', 0, [
      { t: 'texto', texto: 'A turminha SAE é composta de oito personagens e um brinquedo, que tornam as descobertas dos Anos Iniciais ainda mais significativas. Os personagens demarcam o trabalho com a educação integral, como os aspectos socioemocionais, a consciência ambiental, a iniciação científica e a educação financeira. Eles demonstram como cada pessoa é única e especial à sua maneira.' },
      { t: 'lista', itens: [
        { termo: 'Digi', texto: 'Digi é um robô muito esperto que acompanha a turminha SAE. Ele é programado para ajudar em atividades que envolvem recursos digitais.' },
        { termo: 'Laura', texto: 'Laura é uma menina curiosa que adora brincar de massinha. Ela inventa cenários incríveis e, quando crescer, quer ser cientista.' },
      ] },
    ]),
    carta('lp-t00b', '👥', 'Conheça a turminha SAE (2 de 3)', 0, [
      { t: 'lista', itens: [
        { termo: 'Júlia', texto: 'Júlia é uma menina com síndrome de Down que tem uma paixão especial por música e dança. Adora brincar com instrumentos musicais e criar ritmos. Ela quer ser cantora quando crescer.' },
        { termo: 'Gui', texto: 'Gui é um menino curioso e observador. Sonha em ser piloto quando crescer. Ele sempre acolhe os colegas e inclui todos eles nas brincadeiras.' },
        { termo: 'Pedro', texto: 'Pedro é um menino que adora escalar e andar de «skate» com seus pais. Quando crescer, quer ser jogador de futebol.' },
      ] },
    ]),
    carta('lp-t00c', '👥', 'Conheça a turminha SAE (3 de 3)', 0, [
      { t: 'lista', itens: [
        { termo: 'Toni', texto: 'Toni é um garoto investigativo e questionador, sempre desmonta e remonta os brinquedos para entender como eles funcionam. Quando crescer, quer ser construtor.' },
        { termo: 'Ane', texto: 'Ane é uma menina que adora os animais. Com os amigos, ela organiza brincadeiras que envolvem a natureza. Quando crescer, quer ser bióloga ou veterinária.' },
        { termo: 'Nina', texto: 'Janaína é mais conhecida como Nina. Adora ler, ouvir e contar histórias. Ela gosta de envolver seus amigos em brincadeiras de faz de conta. Quando crescer, quer ser escritora.' },
        { termo: 'Guto', texto: 'Guto é um garoto tímido e atento. Adora brincar com peças de encaixar e que envolvem números e criatividade. Quer ser professor quando crescer.' },
      ] },
    ]),

    // Conto: Lenda da Sereia Iara (pp. 1 e 2)
    carta('lp-t01', '🐟', 'Lenda da Sereia Iara (1 de 2)', 1, [
      { t: 'quadro', titulo: 'Conto', texto: 'Leia o texto a seguir.' },
      { t: 'texto', texto: 'Nas profundezas do rio, em um lindo palácio, vive a Iara. Seu nome significa "moça das águas".' },
      { t: 'texto', texto: 'Iara é muito vaidosa. Todas as manhãs, ela passa horas se admirando e contemplando sua beleza no espelho. Metade peixe, metade mulher, ela tem uma linda cauda que a ajuda a nadar e vive rodeada de muitos corais e algas. Peixinhos, tartarugas e siris adoram enfeitá-la.' },
    ]),
    carta('lp-t01b', '🐟', 'Lenda da Sereia Iara (2 de 2)', 1, [
      { t: 'texto', texto: 'A Iara sobe até as margens do rio e ajuda os animais da floresta a cuidar das águas e a jogar toda a sujeira no lixo. Ela traz do fundo do rio muitas algas e plantas medicinais para curar os animais da floresta quando eles estão doentes. [...]' },
      { t: 'fonte', texto: 'TURMA do Folclore - Lenda da Sereia Iara. Publicado pelo canal Turma do Folclore. 1 vídeo (3 min). Disponível em: https://www.youtube.com/watch?v=gDEnVgMcJDA. Acesso em: 9 abr. 2025. Transcrição.' },
    ]),
    carta('lp-t02', '📝', 'Conto', 2, [
      { t: 'texto', texto: 'Questões 4 a 7 sobre a Lenda da Sereia Iara: o que ela faz todas as manhãs, os animais do fundo do rio, como ela ajuda os animais da floresta e um desenho da Iara.' },
    ]),

    // Sinais de pontuação: ponto-final, ponto de interrogação, ponto de exclamação (pp. 3 e 4)
    carta('lp-t03', '❓', 'Sinais de pontuação', 3, [
      { t: 'texto', texto: 'Ponto-final, ponto de interrogação, ponto de exclamação.' },
      { t: 'texto', texto: 'Questões 1 a 3: colocar o sinal no fim das frases, ligar as frases à pontuação correta e achar as frases com a pontuação final errada.' },
    ]),
    carta('lp-t04', '📝', 'Sinais de pontuação', 4, [
      { t: 'texto', texto: 'Questões 4 e 5: reescrever frases com a pontuação correta e colocar palavras em ordem para formar frases.' },
    ]),

    // Conto: Os Três Porquinhos; dois-pontos, aspas e travessão; marcadores (pp. 5 e 6)
    carta('lp-t05', '🐷', 'Os Três Porquinhos (1 de 2)', 5, [
      { t: 'quadro', titulo: 'Conto • Sinais de pontuação: dois-pontos, aspas e travessão • Marcadores temporais e espaciais', texto: 'Leia o conto a seguir. Depois, responda às questões.' },
      { t: 'texto', texto: 'Era uma vez três porquinhos que viviam com a mãe. Um dia, ela disse:' },
      { t: 'fala', texto: 'Meus filhos, é hora de construírem suas próprias casas.' },
      { t: 'texto', texto: 'Naquela manhã, partiram animados. O primeiro construiu sua casa de palha. Logo apareceu o lobo e gritou:' },
      { t: 'fala', texto: 'Porquinho, porquinho, deixe-me entrar!' },
      { t: 'fala', texto: 'De jeito nenhum! – respondeu o porquinho, assustado.' },
      { t: 'texto', texto: 'O lobo soprou: "Fuuuuuu!" – e a casa voou pelos ares. O porquinho correu para a casa de madeira do irmão.' },
      { t: 'texto', texto: 'Logo, o lobo voltou:' },
      { t: 'fala', texto: 'Porquinhos, porquinhos, deixem-me entrar!' },
      { t: 'fala', texto: 'De jeito nenhum! – disseram.' },
    ]),
    carta('lp-t05b', '🐷', 'Os Três Porquinhos (2 de 2)', 5, [
      { t: 'texto', texto: 'O lobo soprou mais forte: "Fuuuuuu!" – e a casa caiu. Os dois fugiram para a casa de tijolos do terceiro irmão.' },
      { t: 'texto', texto: 'No fim da tarde, o lobo apareceu de novo e gritou:' },
      { t: 'fala', texto: 'Porquinhos, porquinhos, deixem-me entrar!' },
      { t: 'fala', texto: 'De jeito nenhum! – disseram os três.' },
      { t: 'texto', texto: 'O lobo assoprou: "FUUUUUUU!" Mas a casa resistiu. Cansado, ele foi embora. Os porquinhos comemoraram:' },
      { t: 'fala', texto: 'Estamos salvos!' },
      { t: 'fonte', texto: 'Fonte: MINISTÉRIO DA EDUCAÇÃO (MEC). Os três porquinhos. Disponível em: https://alfabetizacao.mec.gov.br/images/conta-pra-mim/livros/versao_digital/os_3_porquinhos_versao_digital.pdf. Acesso em: 10 abr. 2025.' },
    ]),
    carta('lp-t06', '📝', 'Dois-pontos, aspas e travessão', 6, [
      { t: 'texto', texto: 'Marcadores temporais e espaciais. Questões 1 a 3 sobre o conto Os Três Porquinhos: a função de cada sinal de pontuação, os marcadores temporais e os marcadores espaciais.' },
    ]),
  ]);
})();
