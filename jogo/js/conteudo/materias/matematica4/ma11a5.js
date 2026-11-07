/* Sala ma11a5 (Livro de Aprendizagem, capítulo 11, pp. 39 a 42): Organizando o conhecimento da metade e da terça
   parte (bolas, ovos do quindim, balões, pães de queijo, os carrinhos de Lucas) e o Bingo da divisão
   (docs/contratos/quarto-bimestre.md §3). A aba recortável da p. 41 foi cortada: os 18 carrinhos vêm do INVENTARIO.md.
   O bingo depende do professor: a cartela fica como leitura (soLeitura na carta da p. 42). Pintar, desenhar e recortar
   viraram escrever ou escolher a quantidade. */
(function () {
  function divisao(a, b, c) {
    return [
      { antes: '', depois: '÷', certas: [a] },
      { antes: '', depois: '=', certas: [b], junto: true },
      { antes: '', depois: '', certas: [c], junto: true },
    ];
  }
  Reino.registrarSala('matematica4',
    {
      id: 'ma11a5', nome: 'Bingo da divisão', emoji: '🎈',
      livroOrigem: 'aprendizagem', capitulo: 11, paginas: 'pp. 39 a 42', ordem: 'livro',
      cartas: ['ma-a39', 'ma-a40', 'ma-a41', 'ma-a42'],
      intro: 'Vamos pintar a metade e a terça parte, dividir carrinhos e jogar o Bingo da divisão!',
      desafios: [
        { id: 'ma11a5-01', tipo: 'tabela', origem: 'APR-39-q1', pagina: 39, livro: 'ma-a39',
          pergunta: 'Pinte a metade da quantidade de bolas em cada situação. Depois, escreva a divisão correspondente.',
          cab: ['Quantidade de bolas', 'Bolas pintadas (a metade)', 'Divisão'],
          linhas: [
            ['2', { certas: ['1'] }, '2 ÷ 2'],
            ['4', { certas: ['2'] }, '4 ÷ 2'],
            ['6', { certas: ['3'] }, '6 ÷ 2'],
            ['10', { certas: ['5'] }, '10 ÷ 2'],
          ],
          adaptacao: 'Pintar a metade das bolas virou escrever quantas bolas pintar; a divisão de cada linha já vem escrita.',
          explica: 'A metade é dividir por 2: 2 ÷ 2 = 1, 4 ÷ 2 = 2, 6 ÷ 2 = 3 e 10 ÷ 2 = 5.' },
        { id: 'ma11a5-02', tipo: 'escolha', origem: 'APR-39-q2', pagina: 39, livro: 'ma-a39',
          pergunta: 'Renata usou meia dúzia de ovos para fazer um quindim. Desenhe a quantidade de ovos que Renata usou para fazer esse doce. Quantos ovos ela usou?',
          opcoes: [
            { t: '3 ovos' },
            { t: '5 ovos' },
            { t: '6 ovos' },
            { t: '12 ovos' },
          ], certa: 2,
          adaptacao: 'Desenhar os ovos virou escolher a quantidade de ovos.',
          explica: 'Uma dúzia são 12 ovos. Meia dúzia é a metade: 6 ovos.' },
        { id: 'ma11a5-03', tipo: 'tabela', origem: 'APR-40-q3', pagina: 40, livro: 'ma-a40',
          pergunta: 'Pinte a terça parte da quantidade de balões em cada situação. Depois, escreva a divisão correspondente.',
          cab: ['Quantidade de balões', 'Balões pintados (a terça parte)', 'Divisão'],
          linhas: [
            ['3', { certas: ['1'] }, '3 ÷ 3'],
            ['6', { certas: ['2'] }, '6 ÷ 3'],
            ['9', { certas: ['3'] }, '9 ÷ 3'],
          ],
          adaptacao: 'Pintar a terça parte dos balões virou escrever quantos balões pintar; a divisão de cada linha já vem escrita.',
          explica: 'A terça parte é dividir por 3: 3 ÷ 3 = 1, 6 ÷ 3 = 2 e 9 ÷ 3 = 3.' },
        { id: 'ma11a5-04', tipo: 'digitar', origem: 'APR-40-q4a', pagina: 40, livro: 'ma-a40',
          pergunta: 'Observe a quantidade de pães de queijo que a mãe de Isaque assou. Ela separou a terça parte dessa quantidade para o lanche de Isaque na escola. Quantos pães de queijo a mãe dele separou?',
          frases: [{ antes: 'A mãe dele separou', depois: 'pães de queijo.', certas: ['5', 'cinco'] }],
          explica: 'São 8 + 7 = 15 pães de queijo. A terça parte de 15 é 5, porque 5 + 5 + 5 = 15.' },
        { id: 'ma11a5-05', tipo: 'digitar', origem: 'APR-40-q4b', pagina: 40, livro: 'ma-a40',
          apoio: { titulo: 'Os pães de queijo', partes: [{ texto: 'A mãe de Isaque separou a terça parte dos pães de queijo para o lanche de Isaque na escola.' }] },
          pergunta: 'Escreva a divisão que representa essa situação.',
          frases: divisao('15', '3', '5'),
          explica: '15 pães de queijo divididos em 3 partes iguais: 15 ÷ 3 = 5.' },
        { id: 'ma11a5-06', tipo: 'escolha', origem: 'APR-41-q5a', pagina: 41, livro: 'ma-a41',
          pergunta: 'a) Lucas quer arrumar esses carrinhos. Cole no espaço a seguir a metade desses carrinhos para Lucas colocá-los numa estante. Quantos carrinhos você vai colar?',
          opcoes: [
            { t: '6 carrinhos' },
            { t: '8 carrinhos' },
            { t: '9 carrinhos' },
            { t: '18 carrinhos' },
          ], certa: 2,
          adaptacao: 'Recortar e colar os carrinhos virou escolher quantos carrinhos colar.',
          explica: 'A coleção tem 18 carrinhos. A metade de 18 é 9, porque 9 + 9 = 18.' },
        { id: 'ma11a5-07', tipo: 'escolha', origem: 'APR-41-q5b', pagina: 41, livro: 'ma-a41',
          apoio: { titulo: 'Os carrinhos de Lucas', partes: [{ texto: 'Lucas tem 18 carrinhos. Ele colocou a metade desses carrinhos numa estante. Os outros sobraram.' }] },
          pergunta: 'b) Dos carrinhos que sobraram, Lucas separou a terça parte para brincar. Cole no espaço a seguir a quantidade que ele separou. Quantos carrinhos ele separou?',
          opcoes: [
            { t: '2 carrinhos' },
            { t: '3 carrinhos' },
            { t: '6 carrinhos' },
            { t: '9 carrinhos' },
          ], certa: 1,
          adaptacao: 'Recortar e colar os carrinhos virou escolher quantos carrinhos colar.',
          explica: 'Sobraram 9 carrinhos. A terça parte de 9 é 3, porque 3 + 3 + 3 = 9.' },
        { id: 'ma11a5-08', tipo: 'digitar', origem: 'APR-42-q6a', pagina: 42, livro: 'ma-a42',
          pergunta: 'a) O professor ditou a divisão 15 ÷ 3. Qual número deve estar escrito na cartela de Marcelo para que ele marque um X?',
          frases: [{ antes: 'O número', depois: '', certas: ['5', 'cinco'] }],
          explica: '15 ÷ 3 = 5. Marcelo precisa ter o número 5 na cartela.' },
        { id: 'ma11a5-09', tipo: 'varias', origem: 'APR-42-q6b', pagina: 42, livro: 'ma-a42',
          pergunta: 'b) Sofia marcou um X no número 3 da cartela dela. Qual divisão o professor pode ter ditado? Toque em todas as que dão 3.',
          opcoes: [
            { t: '6 ÷ 2', ok: true },
            { t: '10 ÷ 2' },
            { t: '9 ÷ 3', ok: true },
            { t: '8 ÷ 4' },
            { t: '12 ÷ 4', ok: true },
          ],
          adaptacao: 'Escrever uma divisão virou marcar todas as divisões que dão 3.',
          explica: 'Dão 3: 6 ÷ 2, 9 ÷ 3 e 12 ÷ 4. Já 10 ÷ 2 = 5 e 8 ÷ 4 = 2.' },
      ],
    });
})();
