/* Sala ge12t1 (Livro de Atividades, capítulo 12, pp. 9 e 10): a natureza transforma as paisagens, com as marés da
   Baía de Fundy e o gelo do Lago Baikal (docs/contratos/quarto-bimestre.md §3). Todas as questões são de marcar X. */
Reino.registrarSala('geografia4',
    {
      id: 'ge12t1', nome: 'A natureza transforma', emoji: '🌊',
      livroOrigem: 'atividades', capitulo: 12, paginas: 'pp. 9 a 10', ordem: 'livro',
      cartas: ['ge-t09', 'ge-t10'],
      intro: 'O mar sobe e desce, e o lago vira gelo. Vamos ver a natureza mudando a paisagem!',
      desafios: [
        { id: 'ge12t1-01', tipo: 'escolha', origem: 'ATI-09-q1', pagina: 9, livro: 'ge-t09',
          pergunta: 'Observe as imagens da Baía de Fundy. Marque um X na afirmativa correta.',
          opcoes: [
            { t: 'As imagens mostram alterações feitas pelo ser humano na paisagem da Baía de Fundy.' },
            { t: 'As imagens mostram alterações causadas por processos naturais na paisagem da Baía de Fundy.' },
            { t: 'O elemento natural que tem maior atuação na modificação da paisagem acima é o calor do sol.' },
          ], certa: 1,
          explica: 'Quem muda essa paisagem é a água do mar: a maré baixa e a maré alta. É um processo natural!' },
        { id: 'ge12t1-02', tipo: 'escolha', origem: 'ATI-10-q2a', pagina: 10, livro: 'ge-t10',
          pergunta: 'a) As transformações da paisagem do Lago Baikal foram causadas por qual tipo de ação?',
          opcoes: [
            { t: 'Ação humana.' },
            { t: 'Ação da natureza.' },
          ], certa: 1,
          explica: 'Foi a natureza: no frio do inverno, a água do lago congela; no verão, o gelo derrete.' },
        { id: 'ge12t1-03', tipo: 'escolha', origem: 'ATI-10-q2b', pagina: 10, livro: 'ge-t10',
          pergunta: 'b) Em que momento essas transformações ocorreram?',
          opcoes: [
            { t: 'Durante grandes períodos de chuva.' },
            { t: 'Durante as estações do ano inverno e verão.' },
          ], certa: 1,
          explica: 'As mudanças acontecem nas estações do ano: no inverno o lago vira gelo, e no verão volta a ser água.' },
        { id: 'ge12t1-04', tipo: 'escolha', origem: 'ATI-10-q2c', pagina: 10, livro: 'ge-t10',
          pergunta: 'c) Marque a afirmativa correta.',
          opcoes: [
            { t: 'Os elementos da natureza transformam as paisagens.' },
            { t: 'Apenas a ação humana transforma as paisagens.' },
          ], certa: 0,
          explica: 'A natureza também transforma as paisagens: o mar, a chuva, o vento e o gelo!' },
      ],
    });
