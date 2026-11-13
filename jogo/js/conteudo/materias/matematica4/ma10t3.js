/* Sala ma10t3 (Livro de Atividades, capítulo 10, pp. 5 e 6): Problemas envolvendo o nosso dinheiro, com os cofrinhos
   de 10 reais, a adição e a multiplicação das cédulas de Jorge e de Denise e o dinheiro que Bruno, Ana e Paula
   pouparam (dobro e triplo) (docs/contratos/quarto-bimestre.md §3). A sentença matemática da linha do livro vira
   caixas para os números; na multiplicação, os fatores valem em qualquer ordem. */
(function () {
  function reais(v, ext) { // ext (opcional): a quantia por extenso, que também vale
    var r = [];
    (v.indexOf(',') < 0 ? [v, v + ',00'] : [v]).forEach(function (x) { r.push(x, 'R$ ' + x, 'R$' + x, x + ' reais'); });
    return ext ? r.concat(ext, ext + ' reais') : r;
  }
  function num(n) { return { antes: '', depois: '', certas: [String(n)], junto: true }; }
  var CEDULA_2 = { img: 'ma:cedula-2', legenda: '2 reais' };
  var BRUNO = { titulo: 'A quantia de Bruno', partes: [{ figuras: [
    { img: 'ma:cedula-5', legenda: '5 reais' }, { img: 'ma:cedula-2', legenda: '2 reais' }, { img: 'ma:cedula-2', legenda: '2 reais' },
  ] }] };
  var IRMAOS = { titulo: 'O que os irmãos pouparam', partes: [
    { titulo: 'Bruno', figuras: BRUNO.partes[0].figuras },
    { texto: 'Ana poupou o dobro da quantia de Bruno. Paula poupou o triplo da quantia de Bruno.' },
  ] };

  Reino.registrarSala('matematica4',
    {
      id: 'ma10t3', nome: 'Cofrinhos e poupança', emoji: '🐷',
      livroOrigem: 'atividades', capitulo: 10, paginas: 'pp. 5 a 6', ordem: 'livro',
      cartas: ['ma-t05', 'ma-t06'],
      intro: 'Vamos encher cofrinhos, juntar cédulas e descobrir quanto cada um poupou!',
      desafios: [
        { id: 'ma10t3-01', tipo: 'tabela', origem: 'ATI-05-q1', pagina: 5, livro: 'ma-t05',
          pergunta: 'Em cada cofrinho representado a seguir, há 10 moedas de 1 real. Escreva a quantia total em reais em cada situação.',
          cab: ['Quantidade de cofrinhos', 'Quantia total'],
          linhas: [
            ['2 cofrinhos', { certas: reais('20', 'vinte') }],
            ['3 cofrinhos', { certas: reais('30', 'trinta') }],
            ['5 cofrinhos', { certas: reais('50', 'cinquenta') }],
            ['8 cofrinhos', { certas: reais('80', 'oitenta') }],
          ],
          adaptacao: 'Os porquinhos desenhados de cada linha viraram o número de cofrinhos.',
          explica: 'Cada cofrinho tem 10 reais. 2 cofrinhos: R$ 20,00. 3: R$ 30,00. 5: R$ 50,00. 8: R$ 80,00.' },
        { id: 'ma10t3-02', tipo: 'digitar', origem: 'ATI-05-q2a', pagina: 5, livro: 'ma-t05', figura: CEDULA_2,
          pergunta: 'Jorge ganhou do avô 3 cédulas iguais à cédula que está representada ao lado. Quantos reais Jorge ganhou do avô? Escreva uma adição para representar essa situação.',
          frases: [
            { antes: '', depois: '+', certas: ['2'] },
            { antes: '', depois: '+', certas: ['2'], junto: true },
            { antes: '', depois: '=', certas: ['2'], junto: true },
            num(6),
          ],
          explica: '2 + 2 + 2 = 6. Jorge ganhou R$ 6,00 do avô.' },
        { id: 'ma10t3-03', tipo: 'digitar', origem: 'ATI-05-q2b', pagina: 5, livro: 'ma-t05', figura: CEDULA_2,
          pergunta: 'Jorge ganhou do avô 3 cédulas iguais à cédula ao lado. Escreva uma multiplicação para representar essa situação.',
          qualquerOrdem: [[0, 1]],
          frases: [
            { antes: '', depois: '×', certas: ['3'] },
            { antes: '', depois: '=', certas: ['2'], junto: true },
            num(6),
          ],
          explica: '3 vezes 2 reais: 3 × 2 = 6. Também vale 2 × 3 = 6.' },
        { id: 'ma10t3-04', tipo: 'digitar', origem: 'ATI-06-q3', pagina: 6, livro: 'ma-t06',
          apoio: { titulo: 'Os filhos de Denise', partes: [{ figuras: [
            { img: '👦', legenda: 'menino com ursinho' }, { img: '👧', legenda: 'menina com livros' }, { img: '👦', legenda: 'menino com bola' },
          ] }] },
          pergunta: 'Denise deu uma cédula de 5 reais para cada um de seus filhos. Na imagem ao lado estão os filhos de Denise. Qual quantia Denise distribuiu entre seus filhos? Escreva uma multiplicação para representar essa situação.',
          qualquerOrdem: [[0, 1]],
          frases: [
            { antes: '', depois: '×', certas: ['3'] },
            { antes: '', depois: '=', certas: ['5'], junto: true },
            num(15),
            { antes: 'Denise distribuiu', depois: '.', certas: reais('15') },
          ],
          explica: 'São 3 filhos, e cada um ganhou 5 reais: 3 × 5 = 15. Denise distribuiu R$ 15,00.' },
        { id: 'ma10t3-05', tipo: 'digitar', origem: 'ATI-06-q4a', pagina: 6, livro: 'ma-t06', apoio: BRUNO,
          pergunta: 'Ana, Paula e Bruno são irmãos e começaram a poupar. Depois de algum tempo, Bruno conseguiu poupar a quantia representada a seguir. a) Quantos reais Bruno conseguiu poupar?',
          frases: [{ antes: '', depois: '', certas: reais('9', 'nove') }],
          explica: '5 + 2 + 2 = 9. Bruno poupou R$ 9,00.' },
        { id: 'ma10t3-06', tipo: 'digitar', origem: 'ATI-06-q4b', pagina: 6, livro: 'ma-t06', apoio: BRUNO,
          pergunta: 'b) Ana poupou o dobro da quantia de Bruno. Quantos reais Ana poupou?',
          frases: [{ antes: '', depois: '', certas: reais('18') }],
          explica: 'O dobro é duas vezes: 9 + 9 = 18. Ana poupou R$ 18,00.' },
        { id: 'ma10t3-07', tipo: 'digitar', origem: 'ATI-06-q4c', pagina: 6, livro: 'ma-t06', apoio: BRUNO,
          pergunta: 'c) Paula poupou o triplo da quantia de Bruno. Quantos reais Paula poupou?',
          frases: [{ antes: '', depois: '', certas: reais('27') }],
          explica: 'O triplo é três vezes: 9 + 9 + 9 = 27. Paula poupou R$ 27,00.' },
        { id: 'ma10t3-08', tipo: 'digitar', origem: 'ATI-06-q4d', pagina: 6, livro: 'ma-t06', apoio: IRMAOS,
          pergunta: 'd) Quantos reais os três irmãos pouparam juntos?',
          frases: [
            { antes: 'Os três irmãos pouparam', depois: 'juntos.', certas: reais('54') },
          ],
          explica: 'Bruno 9, Ana 18 e Paula 27: 9 + 18 + 27 = 54. Os três pouparam R$ 54,00 juntos.' },
      ],
    });
})();
