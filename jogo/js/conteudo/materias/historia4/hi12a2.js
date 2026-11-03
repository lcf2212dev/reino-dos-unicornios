/* Sala hi12a2 (Livro de Aprendizagem, capítulo 12, pp. 27 a 29): o Organizando o conhecimento da coleta seletiva e
   da obra Derrubada de uma floresta, e a leitura dos trabalhos de preservação (fiscais ambientais, ambientalistas)
   e das comunidades tradicionais (docs/contratos/quarto-bimestre.md §3). As pp. 28 e 29 são só leitura. */
Reino.registrarSala('historia4',
    {
      id: 'hi12a2', nome: 'Quem protege a natureza', emoji: '🌳',
      livroOrigem: 'aprendizagem', capitulo: 12, paginas: 'pp. 27 a 29', ordem: 'livro',
      cartas: ['hi-a27', 'hi-a28', 'hi-a28b', 'hi-a29', 'hi-a29b'],
      intro: 'Vamos ver uma floresta sendo derrubada e conhecer as pessoas que trabalham para proteger a natureza!',
      desafios: [
        { id: 'hi12a2-01', tipo: 'completar', origem: 'APR-27-q1', pagina: 27, livro: 'hi-a27',
          pergunta: 'Complete o texto usando as palavras do quadro.',
          palavras: ['meio ambiente', 'material', 'reciclagem', 'diminuir'],
          frases: [
            { antes: 'As lixeiras de coleta seletiva são usadas para separar o lixo por tipo de', depois: ', como papel, plástico, vidro e metal.', certa: 1 },
            { antes: 'Essas lixeiras facilitam a', depois: ',', certa: 2 },
            { antes: 'ajudam a', depois: 'a poluição, economizam recursos naturais', certa: 3 },
            { antes: 'e protegem o', depois: '.', certa: 0 },
          ],
          explica: 'As lixeiras separam o lixo por tipo de material, facilitam a reciclagem, ajudam a diminuir a poluição e protegem o meio ambiente.' },
        { id: 'hi12a2-02', tipo: 'escolha', origem: 'APR-27-q2a', pagina: 27, livro: 'hi-a27',
          pergunta: 'Observe a obra de arte abaixo. a) O que as pessoas que aparecem nessa pintura estão fazendo?',
          figura: { img: '🪓' },
          opcoes: [
            { t: 'Estão derrubando as árvores da floresta.' },
            { t: 'Estão plantando árvores.' },
            { t: 'Estão limpando um rio.' },
          ], certa: 0,
          adaptacao: 'A resposta escrita virou escolher a frase certa.',
          explica: 'Na obra de Rugendas, de 1835, os homens estão cortando as árvores: é a derrubada de uma floresta.' },
        { id: 'hi12a2-03', tipo: 'separar', origem: 'APR-27-q2b', pagina: 27, livro: 'hi-a27',
          pergunta: 'b) O que mudou na forma como as pessoas cortam árvores atualmente? O que continua igual à época da obra?',
          grupos: [{ e: '🚜', t: 'Mudou' }, { e: '🌳', t: 'Continua igual' }],
          itens: [
            { t: 'Hoje usam motosserras, tratores e caminhões.', g: 0 },
            { t: 'Hoje o corte é bem mais rápido.', g: 0 },
            { t: 'As pessoas ainda derrubam florestas.', g: 1 },
            { t: 'Derrubar a floresta ainda prejudica o meio ambiente.', g: 1 },
          ],
          adaptacao: 'A resposta escrita virou separar o que mudou e o que continua igual.',
          explica: 'Antes o corte era com machado e a força dos braços; hoje há máquinas e é bem mais rápido. Mas as florestas ainda são derrubadas, e isso ainda prejudica a natureza.' },
        { id: 'hi12a2-04', tipo: 'escolha', origem: 'APR-27-q2c', pagina: 27, livro: 'hi-a27',
          pergunta: 'c) A atividade realizada por essas pessoas traz um impacto positivo ou negativo para o meio ambiente?',
          opcoes: [
            { t: 'Positivo' },
            { t: 'Negativo' },
          ], certa: 1,
          explica: 'Negativo: derrubar a floresta destrói o habitat dos animais e das plantas.' },
      ],
    });
