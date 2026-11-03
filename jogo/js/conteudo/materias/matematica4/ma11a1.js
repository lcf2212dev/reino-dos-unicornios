/* Sala ma11a1 (Livro de Aprendizagem, capítulo 11, pp. 26 a 28): a abertura do capítulo (Conversa vai... e
   Conversa vem...) e Repartir em partes iguais, com os brinquedos de Beatriz nas prateleiras e as pelúcias nas caixas
   (docs/contratos/quarto-bimestre.md §3). As perguntas de conversa da p. 26 e o "De que maneira…" da p. 27 ficam como
   leitura (soLeitura nas cartas). Recortar e colar e traçar linhas viraram escolher ou escrever as quantidades. */
(function () {
  var BRINQUEDOS = { titulo: 'Os brinquedos', partes: [{ figuras: [
    { img: 'ma:11-boneca', legenda: 'boneca' }, { img: '🤖', legenda: 'robô' }, { img: '🧸', legenda: 'ursinho' },
    { img: '⚽', legenda: 'bola' }, { img: '🥁', legenda: 'tambor' }, { img: '🚗', legenda: 'carrinho' },
  ] }] };
  var PELUCIAS = { titulo: 'As pelúcias', partes: [{ figuras: [
    { img: '🧸' }, { img: '🐻' }, { img: '🐰' }, { img: '🐒' }, { img: '🧸' }, { img: '🐻' }, { img: '🐰' }, { img: '🐒' },
  ] }] };
  Reino.registrarSala('matematica4',
    {
      id: 'ma11a1', nome: 'Arrumando o quarto', emoji: '🧸',
      livroOrigem: 'aprendizagem', capitulo: 11, paginas: 'pp. 26 a 28', ordem: 'livro',
      cartas: ['ma-a26', 'ma-a27', 'ma-a28'],
      intro: 'Vamos ajudar Beatriz a arrumar o quarto e repartir os brinquedos em partes iguais!',
      desafios: [
        { id: 'ma11a1-01', tipo: 'escolha', origem: 'APR-27-qA', pagina: 27, livro: 'ma-a27', apoio: BRINQUEDOS,
          pergunta: 'Quantos brinquedos aparecem ao todo na imagem?',
          opcoes: [
            { t: '4' },
            { t: '5' },
            { t: '6' },
            { t: '8' },
          ], certa: 2,
          adaptacao: 'A conversa oral virou escolher a resposta.',
          explica: 'São 6 brinquedos: a boneca, o robô, o ursinho, a bola, o tambor e o carrinho.' },
        { id: 'ma11a1-02', tipo: 'escolha', origem: 'APR-27-qB', pagina: 27, livro: 'ma-a27',
          pergunta: 'Quantas prateleiras há na estante?',
          opcoes: [
            { t: '1' },
            { t: '2' },
            { t: '3' },
            { t: '4' },
          ], certa: 1,
          adaptacao: 'A conversa oral virou escolher a resposta.',
          explica: 'A estante tem 2 prateleiras.' },
        { id: 'ma11a1-03', tipo: 'escolha', origem: 'APR-27-qD', pagina: 27, livro: 'ma-a27', apoio: BRINQUEDOS,
          pergunta: 'Beatriz quer colocar a mesma quantidade de brinquedos em cada prateleira. Como ela pode fazer?',
          opcoes: [
            { t: '4 brinquedos em uma prateleira e 2 na outra.' },
            { t: '3 brinquedos em cada prateleira.' },
            { t: '5 brinquedos em uma prateleira e 1 na outra.' },
            { t: 'Os 6 brinquedos numa prateleira só.' },
          ], certa: 1,
          adaptacao: 'Recortar e colar os brinquedos nas prateleiras virou escolher o jeito de arrumar com a mesma quantidade em cada uma.',
          explica: 'Com 3 em cima e 3 embaixo, as duas prateleiras ficam com a mesma quantidade: 3 + 3 = 6.' },
        { id: 'ma11a1-04', tipo: 'digitar', origem: 'APR-27-qE', pagina: 27, livro: 'ma-a27',
          pergunta: 'Quantos brinquedos Beatriz deve colocar em cada prateleira?',
          frases: [{ antes: '', depois: 'brinquedos em cada prateleira.', certas: ['3', 'três'] }],
          explica: 'São 6 brinquedos em 2 prateleiras: 3 em cada uma.' },
        { id: 'ma11a1-05', tipo: 'digitar', origem: 'APR-28-qA', pagina: 28, livro: 'ma-a28', apoio: PELUCIAS,
          pergunta: 'Quantos bichinhos de pelúcia Beatriz doará?',
          frases: [{ antes: '', depois: 'bichinhos de pelúcia.', certas: ['8', 'oito'] }],
          explica: 'Contando um por um, são 8 bichinhos de pelúcia.' },
        { id: 'ma11a1-06', tipo: 'digitar', origem: 'APR-28-qB', pagina: 28, livro: 'ma-a28',
          pergunta: 'Quantas caixas ela usará para colocar essas pelúcias?',
          frases: [{ antes: '', depois: 'caixas.', certas: ['2', 'duas'] }],
          explica: 'Beatriz vai usar 2 caixas.' },
        { id: 'ma11a1-07', tipo: 'digitar', origem: 'APR-28-qC', pagina: 28, livro: 'ma-a28', apoio: PELUCIAS,
          pergunta: 'Trace linhas para ligar cada bichinho de pelúcia a uma caixa.',
          frases: [
            { antes: '1ª caixa:', depois: 'pelúcias', certas: ['4', 'quatro'] },
            { antes: '2ª caixa:', depois: 'pelúcias', certas: ['4', 'quatro'] },
          ],
          adaptacao: 'Traçar linhas das pelúcias até as caixas virou escrever quantas pelúcias vão em cada caixa.',
          explica: 'A mesma quantidade em cada caixa: 4 numa e 4 na outra, porque 4 + 4 = 8.' },
        { id: 'ma11a1-08', tipo: 'digitar', origem: 'APR-28-qD', pagina: 28, livro: 'ma-a28',
          pergunta: 'Quantas pelúcias Beatriz deve colocar em cada caixa?',
          frases: [{ antes: '', depois: 'pelúcias em cada caixa.', certas: ['4', 'quatro'] }],
          explica: '8 pelúcias distribuídas igualmente em 2 caixas é igual a 4 pelúcias em cada caixa.' },
      ],
    });
})();
