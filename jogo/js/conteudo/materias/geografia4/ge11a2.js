/* Sala ge11a2 (Livro de Aprendizagem, capítulo 11, pp. 14 e 15): os elementos das paisagens, os sentidos e as
   paisagens naturais, culturais e mistas (docs/contratos/quarto-bimestre.md §3). As duas perguntas da p. 15 são de
   conversa e pessoais: viram escrever (sem gabarito) e escolha livre (qualquer resposta vale). */
Reino.registrarSala('geografia4',
    {
      id: 'ge11a2', nome: 'Os sentidos e a paisagem', emoji: '👂',
      livroOrigem: 'aprendizagem', capitulo: 11, paginas: 'pp. 14 e 15', ordem: 'livro',
      cartas: ['ge-a14', 'ge-a14b', 'ge-a15'],
      intro: 'Vamos perceber as paisagens com os olhos, os ouvidos, o nariz, a boca e as mãos!',
      desafios: [
        { id: 'ge11a2-01', tipo: 'escrever', origem: 'APR-15-qA', pagina: 15, livro: 'ge-a15',
          pergunta: 'Use seus sentidos para perceber a paisagem da sala de aula. Depois, descreva quais elementos fazem parte dessa paisagem.',
          linhas: 2, minPalavras: 3,
          modelo: 'Na minha sala tem carteiras, cadeiras, a lousa, a janela e o barulho dos colegas.',
          adaptacao: 'A conversa com os colegas e o professor virou escrever o que você percebe.',
          explica: 'Que bela descrição! Tudo o que vemos, ouvimos e sentimos faz parte da paisagem.' },
        { id: 'ge11a2-02', tipo: 'completar', livre: true, origem: 'APR-15-qB', pagina: 15, livro: 'ge-a15',
          pergunta: 'No seu dia a dia, você costuma encontrar mais paisagens naturais, culturais ou mistas?',
          palavras: ['naturais', 'culturais', 'mistas'],
          frases: [
            { antes: 'No meu dia a dia, eu encontro mais paisagens', depois: '.' },
          ],
          adaptacao: 'A conversa virou escolher uma palavra; qualquer resposta vale, porque é sobre o seu dia a dia.',
          explica: 'Obrigado por contar! Cada lugar tem as suas paisagens.' },
      ],
    });
