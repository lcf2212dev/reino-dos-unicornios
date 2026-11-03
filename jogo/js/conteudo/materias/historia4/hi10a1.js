/* Sala hi10a1 (Livro de Aprendizagem, capítulo 10, pp. 2 a 5): o sumário, a abertura com o bombeiro (Conversa
   vai...), a dica do vigia (Conversa vem...) e o texto O que é trabalho? (docs/contratos/quarto-bimestre.md §3).
   As duas perguntas de conversa da p. 3 viraram escolha e várias; a p. 5 é só leitura. */
Reino.registrarSala('historia4',
    {
      id: 'hi10a1', nome: 'O que é trabalho?', emoji: '🚒',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 2 a 5', ordem: 'livro',
      cartas: ['hi-a02', 'hi-a03', 'hi-a04', 'hi-a05', 'hi-a05b'],
      intro: 'Vamos conhecer o bombeiro, descobrir uma profissão pela dica e aprender o que é trabalho!',
      desafios: [
        { id: 'hi10a1-01', tipo: 'escolha', origem: 'APR-03-qA', pagina: 3, livro: 'hi-a03',
          figura: { img: '🚒' },
          pergunta: 'Qual é o nome da profissão mostrada na imagem?',
          opcoes: [
            { t: 'bombeiro' },
            { t: 'médico' },
            { t: 'policial' },
            { t: 'carteiro' },
          ], certa: 0,
          adaptacao: 'A conversa oral virou escolher o nome da profissão.',
          explica: 'É o bombeiro! Ele usa a mangueira de água para apagar o incêndio.' },
        { id: 'hi10a1-02', tipo: 'varias', origem: 'APR-03-qB', pagina: 3, livro: 'hi-a03',
          pergunta: 'Em quais situações o trabalho desse profissional é importante? Toque em TODAS.',
          opcoes: [
            { t: 'Apagar um incêndio', ok: true },
            { t: 'Cortar o cabelo' },
            { t: 'Salvar uma pessoa presa', ok: true },
            { t: 'Comprar pão' },
            { t: 'Ajudar num acidente', ok: true },
            { t: 'Uma consulta no dentista' },
          ],
          adaptacao: 'A conversa oral virou marcar as situações em que se chama o bombeiro.',
          explica: 'O bombeiro apaga incêndios e também ajuda em resgates, salvamentos e acidentes.' },
        { id: 'hi10a1-03', tipo: 'digitar', origem: 'APR-04-qA', pagina: 4, livro: 'hi-a04',
          pergunta: 'Enquanto dormimos, esse profissional vigia as casas e os prédios para garantir que todos fiquem seguros. Qual é a profissão dessa pessoa?',
          frases: [
            { antes: '', depois: '', certas: ['vigia', 'o vigia', 'vigia noturno', 'vigilante', 'o vigilante', 'vigilante noturno',
              'segurança', 'o segurança', 'guarda', 'o guarda', 'guarda noturno', 'porteiro noturno'] },
          ],
          explica: 'É o vigia (ou vigilante): ele cuida das casas e dos prédios durante a noite.' },
        { id: 'hi10a1-04', tipo: 'desenho', origem: 'APR-04-qB', pagina: 4, livro: 'hi-a04', guardar: true,
          pergunta: 'Faça um desenho dessa profissão.',
          requisitos: ['formas', 'cores'],
          adaptacao: 'O quadro em branco do livro virou a prancheta de desenho do jogo.',
          explica: 'Que vigia caprichado! Ele pode ter uniforme, lanterna e apito.' },
        { id: 'hi10a1-05', tipo: 'digitar', livre: true, origem: 'APR-04-qC', pagina: 4, livro: 'hi-a04',
          pergunta: 'Agora, pense em alguém da sua família, ou um conhecido, que tenha uma profissão. Qual é a profissão dessa pessoa?',
          frases: [
            { antes: '', depois: '' },
          ],
          explica: 'Que legal! Toda profissão é importante para a comunidade.' },
      ],
    });
