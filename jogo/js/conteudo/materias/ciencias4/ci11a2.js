/* Sala ci11a2 (Livro de Aprendizagem, capítulo 11, pp. 16 a 19): o caule e as folhas (continuação da p. 15), Flor,
   fruto e semente e o Organizando o conhecimento (docs/contratos/quarto-bimestre.md §3). Quase tudo é leitura; a
   única questão é a aba de recortar da p. 19, que virou ligar cada parte à figura dela. */
Reino.registrarSala('ciencias4',
    {
      id: 'ci11a2', nome: 'Flor, fruto e semente', emoji: '🌸',
      livroOrigem: 'aprendizagem', capitulo: 11, paginas: 'pp. 16 a 19', ordem: 'livro',
      cartas: ['ci-a16', 'ci-a16b', 'ci-a17', 'ci-a17b', 'ci-a18', 'ci-a18b', 'ci-a19'],
      intro: 'Vamos descobrir para que servem o caule, as folhas, as flores, os frutos e as sementes!',
      desafios: [
        { id: 'ci11a2-01', tipo: 'ligar', origem: 'APR-19-q1', pagina: 19, livro: 'ci-a19',
          avulsa: { carta: 'ci-a15' },
          pergunta: 'Ligue cada figura ao nome da parte da planta.',
          pares: [
            [{ img: 'ci:11-raiz', alt: 'raiz fina com ramificações' }, { t: 'Raiz' }],
            [{ img: 'ci:11-caule', alt: 'ramo verde comprido' }, { t: 'Caule' }],
            [{ img: '🍃', alt: 'folha verde' }, { t: 'Folha' }],
            [{ img: 'ci:11-flor', alt: 'flor amarela' }, { t: 'Flor' }],
            [{ img: 'ci:11-melancia', alt: 'melancia' }, { t: 'Fruto' }],
          ],
          adaptacao: 'Recortar e colar as figuras da aba virou ligar cada parte à sua figura.',
          explica: 'A raiz fica no solo, o caule é o ramo que sustenta a planta, a folha é verde, a flor é amarela e a melancia é o fruto.' },
      ],
    });
