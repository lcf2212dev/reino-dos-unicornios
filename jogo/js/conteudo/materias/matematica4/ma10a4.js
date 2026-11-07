/* Sala ma10a4 (Livro de Aprendizagem, capítulo 10, pp. 16 a 19): Organizando o conhecimento q1 a q5, com a pesquisa de
   preços, o dobro e o triplo, os pirulitos de Davi, a papelaria e o videogame de Joana e Bruno
   (docs/contratos/quarto-bimestre.md §3). A conta no quadro e a frase com lacuna viraram digitar a quantia. */
(function () {
  // ext (opcional): a quantia por extenso, que também vale ("cinco", "cinco reais")
  function reais(n, ext) {
    var r = [n + '', n + ',00', 'R$ ' + n + ',00', 'R$' + n + ',00', 'R$ ' + n, 'R$' + n, n + ' reais'];
    return ext ? r.concat(ext, ext + ' reais') : r;
  }
  Reino.registrarSala('matematica4',
    {
      id: 'ma10a4', nome: 'Problemas com o Real', emoji: '🛒',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 16 a 19', ordem: 'livro',
      cartas: ['ma-a16', 'ma-a17', 'ma-a18', 'ma-a19'],
      intro: 'Vamos pesquisar preços, calcular o dobro e o triplo e descobrir quanto cada um gastou!',
      desafios: [
        { id: 'ma10a4-01', tipo: 'escolha', origem: 'APR-16-q1a', pagina: 16, livro: 'ma-a16',
          pergunta: 'a) Em qual loja o pai de Caio deve comprar esses brinquedos para pagar mais barato pelos produtos?',
          opcoes: [
            { t: 'Na loja Brinca Mais.' },
            { t: 'Na loja Brinquedão.' },
          ], certa: 1,
          adaptacao: 'A conta no quadro e a frase com lacuna viraram escolher a loja.',
          explica: 'Brinca Mais: 14 + 79 = 93. Brinquedão: 16 + 75 = 91. Na Brinquedão fica mais barato!' },
        { id: 'ma10a4-02', tipo: 'digitar', origem: 'APR-16-q1b', pagina: 16, livro: 'ma-a16',
          figura: { img: 'ma:cedula-100', legenda: 'cédula de 100 reais' },
          pergunta: 'b) Se o pai de Caio comprar na loja mais barata e pagar com a cédula ao lado, quantos reais ele vai receber de troco?',
          frases: [{ antes: 'Ele vai receber', depois: 'de troco.', certas: reais(9, 'nove') }],
          explica: 'Na Brinquedão ele gasta 91. 100 - 91 = 9. O troco é de R$ 9,00.' },
        { id: 'ma10a4-03', tipo: 'tabela', origem: 'APR-17-q2', pagina: 17, livro: 'ma-a17',
          pergunta: 'Calcule o dobro e o triplo de cada uma das quantias mostradas a seguir.',
          cab: ['Quantia em reais', 'Dobro', 'Triplo'],
          linhas: [
            ['cédula de 2 reais', { certas: reais(4, 'quatro') }, { certas: reais(6, 'seis') }],
            ['cédula de 5 reais', { certas: reais(10, 'dez') }, { certas: reais(15, 'quinze') }],
            ['cédula de 10 reais', { certas: reais(20) }, { certas: reais(30) }],
            ['cédula de 10 reais e cédula de 2 reais', { certas: reais(24) }, { certas: reais(36) }],
          ],
          explica: 'O dobro é 2 vezes e o triplo é 3 vezes: 2 dá 4 e 6; 5 dá 10 e 15; 10 dá 20 e 30; 12 dá 24 e 36.' },
        { id: 'ma10a4-04', tipo: 'digitar', origem: 'APR-17-q3', pagina: 17, livro: 'ma-a17',
          figura: { img: 'ma:cedula-2', legenda: 'cédula de 2 reais' },
          pergunta: 'Davi comprou na cantina 4 pirulitos para ele e os colegas. Cada pirulito custou a quantia representada ao lado. Quantos reais Davi gastou nessa compra?',
          frases: [{ antes: 'Davi gastou', depois: 'nessa compra.', certas: reais(8, 'oito') }],
          explica: '2 + 2 + 2 + 2 = 8, ou 4 × 2 = 8. Davi gastou R$ 8,00.' },
        { id: 'ma10a4-05', tipo: 'digitar', origem: 'APR-18-q4a', pagina: 18, livro: 'ma-a18',
          pergunta: 'a) Se Catarina comprar uma caixa de lápis de cor e um estojo, quantos reais ela vai gastar?',
          frases: [{ antes: 'Catarina vai gastar', depois: '', certas: reais(60) }],
          explica: '32 + 28 = 60. Catarina vai gastar R$ 60,00.' },
        { id: 'ma10a4-06', tipo: 'escolha', origem: 'APR-18-q4b', pagina: 18, livro: 'ma-a18',
          figura: { img: 'ma:cedula-200', legenda: 'cédula de 200 reais' },
          pergunta: 'b) A mãe de Jorge foi até essa papelaria com a cédula representada ao lado. Com essa quantia, a mãe de Jorge vai poder comprar um item de cada um desses produtos?',
          opcoes: [
            { t: 'Sim.' },
            { t: 'Não.' },
          ], certa: 0,
          explica: '79 + 29 + 28 + 32 = 168. Como 168 é menos que 200, dá para comprar tudo, e ainda sobram R$ 32,00!' },
        { id: 'ma10a4-07', tipo: 'digitar', origem: 'APR-19-q5a', pagina: 19, livro: 'ma-a19',
          pergunta: 'a) Fazendo as trocas necessárias, calcule a quantia que Joana e Bruno pouparam no total.',
          frases: [{ antes: 'Joana e Bruno pouparam', depois: 'no total.', certas: reais(300) }],
          adaptacao: 'Recortar e colar as cédulas do Material de apoio virou digitar o total.',
          explica: 'Joana tem 100 + 20 + 8 = 128. Bruno tem 100 + 50 + 20 + 2 = 172. Juntos: R$ 300,00.' },
        { id: 'ma10a4-08', tipo: 'tabela', origem: 'APR-19-q5b', pagina: 19, livro: 'ma-a19',
          pergunta: 'b) Agora, resolva essa adição no quadro de ordens. Complete a última linha.',
          cab: ['C', 'D', 'U'],
          linhas: [
            ['1', '2', '8'],
            ['+ 1', '7', '2'],
            [{ certas: ['3'] }, { certas: ['0'] }, { certas: ['0'] }],
          ],
          explica: '8 U + 2 U = 10 U: fica 0 e vai 1 D. 1 D + 2 D + 7 D = 10 D: fica 0 e vai 1 C. 1 C + 1 C + 1 C = 3 C. Total: 300.' },
      ],
    });
})();
