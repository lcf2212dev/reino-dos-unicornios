/* Sala ge12a3 (Livro de Aprendizagem, capítulo 12, pp. 27 a 29): o Organizando o conhecimento (o mar que gasta o
   paredão de rocha, a construção de ruas em Gália e a Pedra Furada) e os impactos ambientais nos rios, que é só
   leitura (docs/contratos/quarto-bimestre.md §3). As respostas escritas ficam escritas, com as palavras que a
   resposta precisa ter. */
Reino.registrarSala('geografia4',
    {
      id: 'ge12a3', nome: 'Mar, rochas e rios', emoji: '🌊',
      livroOrigem: 'aprendizagem', capitulo: 12, paginas: 'pp. 27 a 29', ordem: 'livro',
      cartas: ['ge-a27', 'ge-a28', 'ge-a29', 'ge-a29b', 'ge-a29c'],
      intro: 'Vamos ver o mar desenhar a rocha e aprender a cuidar dos rios!',
      desafios: [
        { id: 'ge12a3-01', tipo: 'escrever', origem: 'APR-27-q1a', pagina: 27, livro: 'ge-a27',
          apoio: { titulo: 'O processo', partes: [{ figuras: [
            { img: 'ge:12-rocha-1', legenda: '1' }, { img: 'ge:12-rocha-2', legenda: '2' },
            { img: 'ge:12-rocha-3', legenda: '3' }, { img: 'ge:12-rocha-4', legenda: '4' },
          ] }] },
          pergunta: 'Observe o processo ilustrado. a) Qual elemento da natureza foi responsável pela transformação da paisagem?',
          linhas: 2, minPalavras: 1,
          chaves: [['mar', 'água', 'águas', 'onda', 'ondas']],
          modelo: 'A água do mar, com as ondas.',
          explica: 'Foi a água do mar! As ondas bateram na rocha, cavaram um arco e, no fim, sobrou uma coluna de pedra.' },
        { id: 'ge12a3-02', tipo: 'escolha', origem: 'APR-27-q1b', pagina: 27, livro: 'ge-a27',
          pergunta: 'b) Em quanto tempo esse processo aconteceu?',
          opcoes: [
            { t: 'De maneira muito rápida, em apenas alguns dias.' },
            { t: 'De maneira lenta, durante muitos anos.' },
          ], certa: 1,
          explica: 'A água leva muitos e muitos anos para gastar a rocha. Água mole em pedra dura tanto bate até que fura!' },
        { id: 'ge12a3-03', tipo: 'escolha', origem: 'APR-28-q2a', pagina: 28, livro: 'ge-a28',
          pergunta: 'Observe as imagens. Marque um X na afirmativa correta.',
          opcoes: [
            { t: 'A paisagem só foi alterada na imagem 1.' },
            { t: 'As duas imagens mostram algum tipo de alteração na paisagem, seja pela ação da natureza ou pela ação humana.' },
          ], certa: 1,
          explica: 'As duas mudaram! Na imagem 1, as pessoas construíram ruas e casas. Na imagem 2, a natureza furou a rocha.' },
        { id: 'ge12a3-04', tipo: 'escrever', origem: 'APR-28-q2b', pagina: 28, livro: 'ge-a28',
          pergunta: 'Explique como aconteceram as mudanças na paisagem da imagem 1.',
          linhas: 3, minPalavras: 4,
          chaves: [['pessoas', 'humana', 'humano', 'humanos', 'homem', 'homens', 'construíram', 'construção', 'construir', 'construindo', 'casas', 'ruas', 'moradias']],
          modelo: 'As pessoas tiraram a vegetação, abriram ruas e construíram moradias.',
          explica: 'Foi a ação humana: as pessoas abriram ruas e construíram casas, bem depressa.' },
        { id: 'ge12a3-05', tipo: 'escrever', origem: 'APR-28-q2c', pagina: 28, livro: 'ge-a28',
          pergunta: 'Escreva quais mudanças você acha que aconteceram ao longo dos anos na paisagem da imagem 2.',
          linhas: 4, minPalavras: 4,
          chaves: [['chuva', 'chuvas', 'vento', 'ventos', 'água', 'águas', 'natureza', 'mar', 'onda', 'ondas', 'buraco', 'furo', 'furou', 'furada', 'gastou', 'desgastou', 'tempo', 'anos']],
          modelo: 'A chuva e o vento gastaram a rocha durante muitos anos e formaram o buraco da Pedra Furada.',
          explica: 'Foi a natureza: a chuva e o vento gastaram a rocha, devagarinho, até fazer o grande buraco.' },
      ],
    });
