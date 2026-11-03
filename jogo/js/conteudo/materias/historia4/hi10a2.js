/* Sala hi10a2 (Livro de Aprendizagem, capítulo 10, pp. 6 a 8): trabalho e emprego, o pagamento de antigamente,
   o Organizando o conhecimento das quatro fotos e Cada um faz sua parte, com a escritora Ruth Rocha
   (docs/contratos/quarto-bimestre.md §3). A foto A (mulher regando as plantas) é trabalho de casa, como diz o
   INVENTARIO.md. A pergunta pessoal sobre Ruth Rocha (APR-08-qB) é só leitura, na carta hi-a08b. */
Reino.registrarSala('historia4',
    {
      id: 'hi10a2', nome: 'Trabalho e emprego', emoji: '💼',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 6 a 8', ordem: 'livro',
      cartas: ['hi-a06', 'hi-a06b', 'hi-a07', 'hi-a08', 'hi-a08b'],
      intro: 'Vamos descobrir a diferença entre trabalho e emprego e conhecer a escritora Ruth Rocha!',
      desafios: [
        { id: 'hi10a2-01', tipo: 'ligar', origem: 'APR-07-q1', pagina: 7, livro: 'hi-a07',
          pergunta: 'Observe as imagens a seguir e responda aos itens. Qual é o trabalho representado em cada imagem?',
          pares: [
            [{ img: '🌱', alt: 'Foto A: uma mulher com um regador no jardim' }, { t: 'regar as plantas' }],
            [{ img: '🪥', alt: 'Foto B: uma dentista com um paciente na cadeira' }, { t: 'cuidar dos dentes' }],
            [{ img: '🧽', alt: 'Foto C: um menino na pia da cozinha' }, { t: 'lavar a louça' }],
            [{ img: '✂', alt: 'Foto D: um barbeiro com pente e tesoura' }, { t: 'cortar o cabelo' }],
          ],
          adaptacao: 'Escrever o trabalho no quadro de cada foto virou ligar a foto ao trabalho.',
          explica: 'A: regar as plantas. B: cuidar dos dentes (a dentista). C: lavar a louça. D: cortar o cabelo (o barbeiro).' },
        { id: 'hi10a2-02', tipo: 'varias', origem: 'APR-07-q2', pagina: 7, livro: 'hi-a07',
          pergunta: 'Circule os trabalhos que também são empregos. Toque em TODOS.',
          opcoes: [
            { img: '🌱', t: 'A: regar as plantas de casa' },
            { img: '🪥', t: 'B: a dentista cuidando dos dentes', ok: true },
            { img: '🧽', t: 'C: o menino lavando a louça' },
            { img: '✂', t: 'D: o barbeiro cortando o cabelo', ok: true },
          ],
          adaptacao: 'Circular as fotos virou tocar nelas.',
          explica: 'A dentista e o barbeiro recebem pagamento pelo trabalho: é emprego. Regar as plantas e lavar a louça em casa são trabalhos domésticos, sem pagamento.' },
        { id: 'hi10a2-03', tipo: 'escolha', origem: 'APR-08-qA', pagina: 8, livro: 'hi-a08b',
          pergunta: 'De acordo com o texto, você acha que Ruth Rocha gosta de escrever?',
          opcoes: [
            { t: 'Sim, ela gosta muito: "É a minha vida."' },
            { t: 'Não, ela não gosta de escrever.' },
            { t: 'Ela nunca escreveu livros.' },
          ], certa: 0,
          adaptacao: 'A conversa com os colegas e o professor virou escolher a resposta.',
          explica: 'Sim! Ruth Rocha diz: "eu gosto muito de escrever. É a minha vida."' },
      ],
    });
