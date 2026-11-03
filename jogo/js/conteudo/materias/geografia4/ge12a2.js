/* Sala ge12a2 (Livro de Aprendizagem, capítulo 12, pp. 24 a 26): a natureza transforma as paisagens (ventos, chuva,
   as ondas do mar na Gruta das Encantadas) e as atividades humanas também, no Rio de Janeiro de 1816 e de 2024
   (docs/contratos/quarto-bimestre.md §3). As pp. 24 e 25 são só leitura; a única questão é a conversa do Pão de
   Açúcar (p. 26), que virou escolha, com o porquê no explica. */
Reino.registrarSala('geografia4',
    {
      id: 'ge12a2', nome: 'Quem muda a paisagem?', emoji: '🪨',
      livroOrigem: 'aprendizagem', capitulo: 12, paginas: 'pp. 24 a 26', ordem: 'livro',
      cartas: ['ge-a24', 'ge-a24b', 'ge-a25', 'ge-a25b', 'ge-a26', 'ge-a26b'],
      intro: 'O vento, a chuva, o mar e as pessoas mudam as paisagens. Vamos descobrir como!',
      desafios: [
        { id: 'ge12a2-01', tipo: 'escolha', origem: 'APR-26-qA', pagina: 26, livro: 'ge-a26b',
          pergunta: 'Observe com atenção as imagens do Pão de Açúcar. O que mais mudou na paisagem foram os elementos naturais ou os elementos culturais?',
          opcoes: [
            { t: 'Os elementos culturais: foram construídas muitas ruas e prédios.' },
            { t: 'Os elementos naturais: o Pão de Açúcar mudou de formato.' },
          ], certa: 0,
          adaptacao: 'A conversa com os colegas virou escolher a resposta; o porquê vem na explicação.',
          explica: 'O Pão de Açúcar quase não mudou! O que mudou foram as ruas e os prédios, porque a cidade cresceu e as pessoas transformaram a paisagem para morar e viver nela.' },
      ],
    });
