/* Sala ma10a5 (Livro de Aprendizagem, capítulo 10, pp. 20 a 22): Saberes em ação (o jogo Memória das quantias) e o
   Testando as ideias q1 a q3 (docs/contratos/quarto-bimestre.md §3). O jogo em dupla virou ligar os pares de cartas;
   desenhar o par das cédulas de 20 e de 200 reais virou marcar os grupos certos (um desafio para cada cédula, os dois
   com a origem APR-20-qB). A conversa APR-20-qC é leitura (soLeitura). */
(function () {
  function reais(n) { return [n + '', n + ',00', 'R$ ' + n + ',00', 'R$' + n + ',00', 'R$ ' + n, 'R$' + n, n + ' reais']; }
  Reino.registrarSala('matematica4',
    {
      id: 'ma10a5', nome: 'Memória das quantias', emoji: '🃏',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 20 a 22', ordem: 'livro',
      cartas: ['ma-a20', 'ma-a20b', 'ma-a21', 'ma-a22'],
      intro: 'Vamos achar os pares de cartas com a mesma quantia e testar tudo o que você já sabe sobre o dinheiro!',
      desafios: [
        { id: 'ma10a5-01', tipo: 'ligar', origem: 'APR-20-qA', pagina: 20, livro: 'ma-a20',
          pergunta: 'Memória das quantias: ligue cada carta à carta que tem a mesma quantia.',
          pares: [
            [{ t: 'R$ 10,00' }, { t: '2 cédulas de 5 reais' }],
            [{ t: 'R$ 1,00' }, { t: '2 moedas de 50 centavos' }],
            [{ t: 'R$ 2,50' }, { t: '1 cédula de 2 reais e 1 moeda de 50 centavos' }],
            [{ t: 'R$ 50,00' }, { t: '2 cédulas de 20 reais e 1 cédula de 10 reais' }],
          ],
          adaptacao: 'O jogo da memória com as cartas recortadas, em dupla, virou ligar os pares de cartas.',
          explica: '5 + 5 = 10; 50 + 50 centavos = 1 real; 2 reais e 50 centavos = R$ 2,50; 20 + 20 + 10 = 50.' },
        { id: 'ma10a5-02', tipo: 'varias', origem: 'APR-20-qB', pagina: 20, livro: 'ma-a20b',
          figura: { img: 'ma:cedula-20', legenda: 'cédula de 20 reais' },
          pergunta: 'Para cada quantia a seguir, forme o par. Quais grupos têm o mesmo valor da cédula de 20 reais? Marque todos.',
          opcoes: [
            { t: '2 cédulas de 10 reais', ok: true },
            { t: '1 cédula de 10 reais e 2 cédulas de 5 reais', ok: true },
            { t: '2 cédulas de 5 reais' },
            { t: '4 cédulas de 5 reais', ok: true },
            { t: '1 cédula de 10 reais e 1 cédula de 2 reais' },
          ],
          adaptacao: 'Desenhar as cédulas e moedas do par virou marcar os grupos que formam o par.',
          explica: '10 + 10, 10 + 5 + 5 e 5 + 5 + 5 + 5 dão 20. Já 5 + 5 dá 10 e 10 + 2 dá 12.' },
        { id: 'ma10a5-03', tipo: 'varias', origem: 'APR-20-qB', pagina: 20, livro: 'ma-a20b',
          figura: { img: 'ma:cedula-200', legenda: 'cédula de 200 reais' },
          pergunta: 'Agora, quais grupos têm o mesmo valor da cédula de 200 reais? Marque todos.',
          opcoes: [
            { t: '2 cédulas de 100 reais', ok: true },
            { t: '2 cédulas de 50 reais' },
            { t: '1 cédula de 100 reais e 2 cédulas de 50 reais', ok: true },
            { t: '1 cédula de 100 reais e 1 cédula de 20 reais' },
            { t: '4 cédulas de 50 reais', ok: true },
          ],
          adaptacao: 'Desenhar as cédulas e moedas do par virou marcar os grupos que formam o par.',
          explica: '100 + 100, 100 + 50 + 50 e 50 + 50 + 50 + 50 dão 200. Já 50 + 50 dá 100 e 100 + 20 dá 120.' },
        { id: 'ma10a5-04', tipo: 'escolha', origem: 'APR-21-q1', pagina: 21, livro: 'ma-a21',
          pergunta: 'Quais cédulas e moedas Denise pode usar para pagar esse sanduíche, que custa R$ 12,75?',
          opcoes: [
            { t: '1 cédula de 10 reais, 1 moeda de 1 real e 3 moedas de 50 centavos' },
            { t: '1 cédula de 10 reais, 1 cédula de 2 reais e 3 moedas de 25 centavos' },
          ], certa: 1,
          explica: '10 + 2 = 12 reais, e 25 + 25 + 25 = 75 centavos: R$ 12,75. O outro grupo dá R$ 12,50.' },
        { id: 'ma10a5-05', tipo: 'escolha', origem: 'APR-21-q2', pagina: 21, livro: 'ma-a21',
          pergunta: 'Marque um X no grupo de moedas que pode ser trocado exatamente por uma cédula de R$ 2,00.',
          opcoes: [
            { t: '5 moedas de 10 centavos e 2 moedas de 5 centavos' },
            { t: '8 moedas de 25 centavos' },
            { t: '1 moeda de 1 real e 4 moedas de 50 centavos' },
            { t: '1 moeda de 50 centavos, 4 moedas de 25 centavos e 1 moeda de 10 centavos' },
          ], certa: 1,
          explica: '4 moedas de 25 centavos fazem 1 real. Então 8 moedas fazem 2 reais! Os outros grupos dão R$ 0,60, R$ 3,00 e R$ 1,60.' },
        { id: 'ma10a5-06', tipo: 'tabela', origem: 'APR-22-q3a', pagina: 22, livro: 'ma-a22',
          pergunta: 'a) Escreva no quadro abaixo a quantidade de moedas de cada valor.',
          cab: ['Valor da moeda', 'Quantidade de moedas'],
          linhas: [
            ['5 centavos', { certas: ['6', 'seis'] }],
            ['10 centavos', { certas: ['7', 'sete'] }],
            ['25 centavos', { certas: ['8', 'oito'] }],
            ['50 centavos', { certas: ['4', 'quatro'] }],
          ],
          explica: 'Paulo tem 6 moedas de 5 centavos, 7 de 10 centavos, 8 de 25 centavos e 4 de 50 centavos.' },
        { id: 'ma10a5-07', tipo: 'digitar', origem: 'APR-22-q3b', pagina: 22, livro: 'ma-a22',
          pergunta: 'b) Que quantia Paulo tinha?',
          frases: [{ antes: 'Paulo tinha', depois: '', certas: reais(5) }],
          explica: '30 centavos + 70 centavos = 1 real. 8 moedas de 25 centavos = 2 reais. 4 moedas de 50 centavos = 2 reais. Ao todo: R$ 5,00.' },
        { id: 'ma10a5-08', tipo: 'escolha', origem: 'APR-22-q3c', pagina: 22, livro: 'ma-a22',
          pergunta: 'c) Paulo recebeu nessa troca a menor quantidade possível de cédulas. Qual cédula ele recebeu?',
          opcoes: [
            { t: '2 reais', img: 'ma:cedula-2' },
            { t: '5 reais', img: 'ma:cedula-5' },
            { t: '10 reais', img: 'ma:cedula-10' },
            { t: '20 reais', img: 'ma:cedula-20' },
          ], certa: 1,
          explica: 'Paulo tinha R$ 5,00: uma única cédula de 5 reais é a menor quantidade possível.' },
      ],
    });
})();
