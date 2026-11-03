/* Sala ma12a9 (Livro de Aprendizagem, capítulo 12, pp. 77 a 80): Testando as ideias (pulos de corda, animal de
   estimação, merenda da escola) e o Agora você já sabe... do fim do livro (docs/contratos/quarto-bimestre.md §3).
   A votação da turma (APR-79-q3d) é leitura na carta ma-a79; pintar a barra da p. 78 fica na explicação; a troca de
   livro com o colega da p. 80 fica de fora. */
(function () {
  var PULOS = { titulo: 'Pulos de corda sem errar', partes: [{ lista: [
    'Olívia: Eu dei 10 pulos.', 'Beatriz: Eu dei a metade dos pulos de José.',
    'José: Eu dei 40 pulos.', 'Caio: Eu dei o dobro dos pulos de Olívia.'] }] };
  var PULOS_TABELA = { titulo: 'Pulos de corda sem errar', partes: [{ lista: [
    'Olívia: 10 pulos', 'Beatriz: 20 pulos', 'José: 40 pulos', 'Caio: 20 pulos'] }] };
  var ANIMAIS = { titulo: 'Animal de estimação dos alunos do 2º ano', partes: [{ lista: [
    'Cão: 27 alunos', 'Gato: 21 alunos', 'Peixe: 6 alunos', 'Hamster: 9 alunos', 'Não tem animal: ?'] }] };
  Reino.registrarSala('matematica4',
    {
      id: 'ma12a9', nome: 'Pulos, bichos e merenda', emoji: '🐶',
      livroOrigem: 'aprendizagem', capitulo: 12, paginas: 'pp. 77 a 80', ordem: 'livro',
      cartas: ['ma-a77', 'ma-a78', 'ma-a79', 'ma-a80'],
      intro: 'Pular corda, cuidar de bichinhos e escolher a merenda: vamos testar tudo o que você aprendeu!',
      desafios: [
        { id: 'ma12a9-01', tipo: 'tabela', origem: 'APR-77-q1a', pagina: 77, livro: 'ma-a77', apoio: PULOS,
          pergunta: 'a) Complete a tabela com as informações que as crianças deram.',
          cab: ['Nome', 'Quantidade de pulos'],
          linhas: [
            ['Olívia', { certas: ['10'] }],
            ['Beatriz', { certas: ['20'] }],
            ['José', { certas: ['40'] }],
            ['Caio', { certas: ['20'] }],
          ],
          explica: 'Beatriz deu a metade de 40: 20 + 20 = 40, então 20 pulos. Caio deu o dobro de 10: 10 + 10 = 20 pulos.' },
        { id: 'ma12a9-02', tipo: 'varias', origem: 'APR-77-q1b', pagina: 77, livro: 'ma-a77', apoio: PULOS_TABELA,
          pergunta: 'b) Quais crianças deram a mesma quantidade de pulos de corda sem errar? Toque em TODAS.',
          opcoes: [
            { t: 'Olívia' },
            { t: 'Beatriz', ok: true },
            { t: 'José' },
            { t: 'Caio', ok: true },
          ],
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: 'Beatriz e Caio deram 20 pulos cada um.' },
        { id: 'ma12a9-03', tipo: 'escolha', origem: 'APR-77-q1c', pagina: 77, livro: 'ma-a77', apoio: PULOS_TABELA,
          pergunta: 'c) Quem deu mais pulos de corda sem errar?',
          opcoes: [
            { t: 'Olívia' },
            { t: 'Beatriz' },
            { t: 'José' },
            { t: 'Caio' },
          ], certa: 2,
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: 'José deu 40 pulos, mais que todos.' },
        { id: 'ma12a9-04', tipo: 'digitar', origem: 'APR-77-q1d', pagina: 77, livro: 'ma-a77', apoio: PULOS_TABELA,
          pergunta: 'd) Quantos pulos de corda todas as crianças deram sem errar?',
          frases: [{ antes: 'As crianças deram', depois: 'pulos de corda sem errar.', certas: ['90', 'noventa'] }],
          explica: '10 + 20 + 40 + 20 = 90 pulos.' },
        { id: 'ma12a9-05', tipo: 'digitar', origem: 'APR-78-q2', pagina: 78, livro: 'ma-a78', apoio: ANIMAIS,
          pergunta: 'Foram entrevistados 81 alunos no total. Com essa informação, descubra a quantidade de alunos que não têm animal de estimação. Depois, pinte a barra para completar o gráfico.',
          frases: [{ antes: 'São', depois: 'alunos que não têm animal de estimação.', certas: ['18', 'dezoito'] }],
          adaptacao: 'Pintar a barra fica de fora: a explicação mostra até onde ela vai.',
          explica: 'Os que têm animal: 27 + 21 + 6 + 9 = 63. Faltam 81 - 63 = 18 alunos. A barra de Não tem animal vai até o 18.' },
        { id: 'ma12a9-06', tipo: 'escolha', origem: 'APR-79-q3a', pagina: 79, livro: 'ma-a79',
          pergunta: 'a) Qual é o tema dessa pesquisa?',
          opcoes: [
            { t: 'Locais preferidos dos alunos para a hora do lanche.' },
            { t: 'Alimentos preferidos dos alunos para a hora do lanche.' },
          ], certa: 1,
          explica: 'A direção quer descobrir quais alimentos os alunos preferem para a hora do lanche.' },
        { id: 'ma12a9-07', tipo: 'escrever', origem: 'APR-79-q3b', pagina: 79, livro: 'ma-a79',
          pergunta: 'b) Qual pergunta você faria nessa pesquisa?',
          linhas: 2, minPalavras: 4,
          chaves: [['lanche', 'merenda', 'alimento', 'alimentos', 'comer', 'comida', 'fruta', 'frutas', 'prefere', 'preferido', 'preferida', 'gosta', 'favorito', 'favorita', 'bebida', 'bebidas', 'suco', 'sucos', 'leite', 'agua', 'beber', 'cardapio', 'lanchar', 'lanches', 'merendas', 'gostam', 'gostaria', 'preferem', 'comem', 'bolo', 'pao', 'sanduiche']],
          modelo: 'Qual alimento você prefere na hora do lanche?',
          explica: 'Boa pergunta! Ela ajuda a descobrir o lanche preferido dos alunos.' },
        { id: 'ma12a9-08', tipo: 'digitar', livre: true, origem: 'APR-79-q3c', pagina: 79, livro: 'ma-a79',
          pergunta: 'c) Com os colegas, escolha 4 opções de alimentos para o novo cardápio da merenda dessa escola. Escreva as opções a seguir.',
          frases: [
            { antes: 'Opção 1:', depois: '' },
            { antes: 'Opção 2:', depois: '' },
            { antes: 'Opção 3:', depois: '' },
            { antes: 'Opção 4:', depois: '' },
          ],
          adaptacao: 'As opções, que no livro são escolhidas com os colegas, ela escolhe sozinha.',
          explica: 'Que cardápio gostoso! Frutas, iogurte e sanduíche natural são ótimas escolhas.' },
        { id: 'ma12a9-09', tipo: 'escrever', origem: 'APR-80-q3e', pagina: 80, livro: 'ma-a80',
          pergunta: 'e) Escreva uma pergunta que envolva as informações da tabela.',
          linhas: 2, minPalavras: 4,
          chaves: [['qual', 'quais', 'quantos', 'quantas', 'quem', 'que']],
          modelo: 'Qual opção de lanche teve mais votos?',
          adaptacao: 'A troca de livro com o colega para responder fica de fora.',
          explica: 'Muito bem! Uma boa pergunta se responde olhando a tabela.' },
        { id: 'ma12a9-10', tipo: 'completar', livre: true, origem: 'APR-80-qA', pagina: 80, livro: 'ma-a80',
          pergunta: 'Agora você já sabe... Para cada item, escolha: Já sei, Preciso saber mais ou Ainda não sei.',
          palavras: ['Já sei', 'Preciso saber mais', 'Ainda não sei'],
          frases: [
            { antes: 'Ler informações em tabelas e gráficos.', depois: '' },
            { antes: 'Comparar informações de pesquisas apresentadas em tabelas.', depois: '' },
            { antes: 'Comparar informações de pesquisas apresentadas em gráficos.', depois: '' },
            { antes: 'Realizar pesquisas e apresentar os dados obtidos em tabelas.', depois: '' },
            { antes: 'Realizar pesquisas e apresentar os dados obtidos em gráficos.', depois: '' },
          ],
          adaptacao: 'As carinhas da legenda viraram as palavras Já sei, Preciso saber mais e Ainda não sei.',
          explica: 'Obrigado por contar! O que ainda não sabe, dá para treinar de novo.' },
      ],
    });
})();
