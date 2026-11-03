/* Sala ci10a2 (Livro de Aprendizagem, capítulo 10, pp. 6 a 8): o esquema da fotossíntese, a importância das plantas
   e o Organizando o conhecimento (docs/contratos/quarto-bimestre.md §3). Páginas quase todas de leitura; a única
   questão é colar as palavras na imagem da fotossíntese, que virou completar. */
Reino.registrarSala('ciencias4',
    {
      id: 'ci10a2', nome: 'A fotossíntese', emoji: '🌞',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 6 a 8', ordem: 'livro',
      cartas: ['ci-a06', 'ci-a06b', 'ci-a07', 'ci-a08'],
      intro: 'Vamos descobrir como a planta faz o próprio alimento com a luz do sol!',
      desafios: [
        { id: 'ci10a2-01', tipo: 'completar', origem: 'APR-08-q1', pagina: 8, livro: 'ci-a08',
          pergunta: 'Observe a imagem que mostra elementos usados e produzidos na fotossíntese. Depois, coloque as palavras nos locais corretos para completar a imagem.',
          palavras: ['LUZ DO SOL', 'GÁS OXIGÊNIO', 'AÇÚCARES', 'GÁS CARBÔNICO', 'ÁGUA'],
          frases: [
            { antes: 'Perto do sol, nas setas que chegam às folhas:', depois: '', certa: 0 },
            { antes: 'Na seta azul, que sai das folhas para o céu:', depois: '', certa: 1 },
            { antes: 'Dentro da planta, nas folhas:', depois: '', certa: 2 },
            { antes: 'Na seta vermelha, que sai do ar e entra na folha:', depois: '', certa: 3 },
            { antes: 'Na seta que sobe do solo até a raiz:', depois: '', certa: 4 },
          ],
          adaptacao: 'Recortar e colar as palavras na imagem virou tocar na palavra de cada lugar, descrito em texto.',
          explica: 'A planta recebe luz do sol, gás carbônico do ar e água do solo. Ela faz açúcares nas folhas e solta gás oxigênio no ar.' },
      ],
    });
