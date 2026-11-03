/* Sala ma11a6 (Livro de Aprendizagem, capítulo 11, pp. 43 a 47): Problemas envolvendo a divisão (as bexigas e os
   cupcakes da festa de Vanessa) e o Organizando o conhecimento das balas de Carla, da turma de Luísa, dos passos de
   André e Juliana e dos grupos de 6 alunos (docs/contratos/quarto-bimestre.md §3). O "Explique aos colegas" da p. 43
   fica como leitura (soLeitura na carta da resolução). Pintar os cupcakes e desenhar as balas viraram escrever a
   quantidade; a pergunta do balão da p. 47 virou marcar os jeitos em que ninguém sobra. */
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
      id: 'ma11a6', nome: 'Problemas de divisão', emoji: '🎂',
      livroOrigem: 'aprendizagem', capitulo: 11, paginas: 'pp. 43 a 47', ordem: 'livro',
      cartas: ['ma-a43', 'ma-a43b', 'ma-a44', 'ma-a45', 'ma-a46', 'ma-a47'],
      intro: 'Vamos resolver problemas de divisão na festa de Vanessa e na escola!',
      desafios: [
        { id: 'ma11a6-01', tipo: 'marcar', origem: 'APR-43-qA', pagina: 43, livro: 'ma-a43',
          pergunta: 'Identifique no texto do problema as informações descritas a seguir. Depois, pinte no texto do problema cada informação seguindo as cores indicadas em cada lápis de cor.',
          marca: 'pintar',
          cores: [
            { nome: 'Vermelho: quantidade de bexigas em cada pacote', cor: '#ff5c6a' },
            { nome: 'Amarelo: quantidade de pacotes de bexigas', cor: '#ffd34d' },
            { nome: 'Verde: quantidade de grupos de bexigas', cor: '#4cc26b' },
            { nome: 'Azul: pergunta do problema', cor: '#5fb4ff' },
          ],
          texto: 'Elas vão encher as bexigas destes {4 pacotes|1}.\nEm cada pacote: BEXIGA {10 UNIDADES|0}.\n' +
            'Para pendurar as bexigas no salão de festas, elas vão formar {5 grupos|2} com a mesma quantidade de bexigas em cada um.\n' +
            '{Quantas bexigas cada grupo terá|3}{?|3?}',
          adaptacao: 'O "10 unidades" escrito nos pacotes da figura virou uma linha do texto, para pintar.',
          explica: 'Vermelho: 10 unidades. Amarelo: 4 pacotes. Verde: 5 grupos. Azul: Quantas bexigas cada grupo terá?' },
        { id: 'ma11a6-02', tipo: 'digitar', origem: 'APR-44-qA', pagina: 44, livro: 'ma-a44',
          pergunta: 'Para resolver esse problema, pinte de marrom as figuras dos cupcakes de chocolate e de rosa as figuras dos cupcakes de morango.',
          frases: [
            { antes: 'Marrom (chocolate):', depois: 'cupcakes', certas: ['10', 'dez'] },
            { antes: 'Rosa (morango):', depois: 'cupcakes', certas: ['20', 'vinte'] },
          ],
          adaptacao: 'Pintar os 30 cupcakes virou escrever quantos ficam de cada cor.',
          explica: 'A terça parte de 30 é 10: 10 de chocolate. O restante: 30 - 10 = 20 de morango.' },
        { id: 'ma11a6-03', tipo: 'digitar', origem: 'APR-45-q1a', pagina: 45, livro: 'ma-a45',
          pergunta: 'Carla comprou um pacote com 18 balas e distribuiu igualmente essas balas entre seus 6 sobrinhos. Desenhe as balas para descobrir quantos doces cada sobrinho ganhou. a) Escreva a divisão que representa essa situação.',
          frases: divisao('18', '6', '3'),
          adaptacao: 'Desenhar as balas nos quadros virou só escrever a divisão.',
          explica: '18 balas para 6 sobrinhos: 18 ÷ 6 = 3 balas para cada um.' },
        { id: 'ma11a6-04', tipo: 'escolha', origem: 'APR-45-q1b', pagina: 45, livro: 'ma-a45',
          pergunta: 'b) Para que cada sobrinho ganhasse 4 balas, quantas balas Carla deveria ter comprado no total?',
          opcoes: [
            { t: '10' },
            { t: '18' },
            { t: '22' },
            { t: '24' },
          ], certa: 3,
          adaptacao: 'Completar o quadro com o número virou escolher entre as opções.',
          explica: '6 sobrinhos com 4 balas cada: 4 + 4 + 4 + 4 + 4 + 4 = 24 balas.' },
        { id: 'ma11a6-05', tipo: 'digitar', origem: 'APR-46-q2a', pagina: 46, livro: 'ma-a46',
          pergunta: 'A turma de Luísa tem 24 alunos. A terça parte desses alunos vai para a escola a pé e o restante vai de carro. a) Quantos alunos dessa turma vão para a escola a pé?',
          frases: [{ antes: 'São', depois: 'alunos dessa turma que vão para a escola a pé.', certas: ['8', 'oito'] }],
          explica: 'A terça parte de 24 é 8: 24 ÷ 3 = 8.' },
        { id: 'ma11a6-06', tipo: 'digitar', origem: 'APR-46-q2b', pagina: 46, livro: 'ma-a46',
          pergunta: 'b) Quantos alunos dessa turma vão para a escola de carro?',
          frases: [{ antes: 'São', depois: 'alunos dessa turma que vão para a escola de carro.', certas: ['16', 'dezesseis'] }],
          explica: 'O restante vai de carro: 24 - 8 = 16 alunos.' },
        { id: 'ma11a6-07', tipo: 'digitar', origem: 'APR-46-q3a', pagina: 46, livro: 'ma-a46',
          pergunta: 'Para ir da cantina até a biblioteca da escola, André deu 30 passos. Juliana deu a metade da quantidade de passos de André. a) Quantos passos ela deu para ir da cantina até a biblioteca da escola?',
          frases: [{ antes: 'Juliana deu', depois: 'passos para ir da cantina até a biblioteca.', certas: ['15', 'quinze'] }],
          explica: 'A metade de 30 é 15: 30 ÷ 2 = 15, porque 15 + 15 = 30.' },
        { id: 'ma11a6-08', tipo: 'escolha', origem: 'APR-46-q3b', pagina: 46, livro: 'ma-a46',
          pergunta: 'b) Quem tem o passo maior?',
          opcoes: [
            { t: 'André' },
            { t: 'Juliana' },
            { t: 'Os dois têm o passo do mesmo tamanho.' },
          ], certa: 1,
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: 'Juliana fez o mesmo caminho com menos passos. Então o passo dela é maior!' },
        { id: 'ma11a6-09', tipo: 'digitar', origem: 'APR-47-q4a', pagina: 47, livro: 'ma-a47',
          pergunta: 'A professora do 2º ano vai dividir a turma em grupos iguais. Cada grupo terá 6 alunos cada um. Observe a quantidade de alunos que estudam nessa turma. a) Quantos alunos tem nessa turma ao todo?',
          frases: [{ antes: '', depois: 'alunos', certas: ['32', 'trinta e dois'] }],
          explica: 'As fileiras têm 8, 8, 7 e 9 alunos: 8 + 8 + 7 + 9 = 32.' },
        { id: 'ma11a6-10', tipo: 'digitar', origem: 'APR-47-q4b', pagina: 47, livro: 'ma-a47',
          pergunta: 'b) Circule os alunos para formar os grupos e responda: Quantos grupos você formou?',
          frases: [{ antes: '', depois: 'grupos', certas: ['5', 'cinco'] }],
          adaptacao: 'Circular os alunos virou só escrever quantos grupos de 6 cabem.',
          explica: 'Grupos de 6: 6, 12, 18, 24, 30. Com 32 alunos dá para formar 5 grupos.' },
        { id: 'ma11a6-11', tipo: 'escolha', origem: 'APR-47-q4c', pagina: 47, livro: 'ma-a47',
          pergunta: 'c) Sobraram alunos fora dos grupos? Quantos?',
          opcoes: [
            { t: 'Não sobrou nenhum aluno.' },
            { t: 'Sim, sobraram 2 alunos.' },
            { t: 'Sim, sobraram 4 alunos.' },
            { t: 'Sim, sobraram 6 alunos.' },
          ], certa: 1,
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: '5 grupos de 6 são 30 alunos. Sobram 32 - 30 = 2 alunos.' },
        { id: 'ma11a6-12', tipo: 'varias', origem: 'APR-47-qA', pagina: 47, livro: 'ma-a47',
          pergunta: 'Como você pode dividir essa turma para que todos os alunos participem de um grupo? Toque em todos os jeitos em que ninguém sobra.',
          opcoes: [
            { t: '4 grupos de 8 alunos', ok: true },
            { t: '5 grupos de 6 alunos' },
            { t: '8 grupos de 4 alunos', ok: true },
            { t: '3 grupos de 10 alunos' },
            { t: '2 grupos de 16 alunos', ok: true },
          ],
          adaptacao: 'A pergunta de conversa do balão virou marcar os jeitos de dividir em que ninguém sobra.',
          explica: '4 × 8, 8 × 4 e 2 × 16 dão 32: ninguém sobra. Com 5 grupos de 6 ou 3 grupos de 10, são só 30 alunos e sobram 2.' },
      ],
    });
})();
