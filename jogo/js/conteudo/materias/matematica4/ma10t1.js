/* Sala ma10t1 (Livro de Atividades, capítulo 10, pp. 1 e 2): Nosso dinheiro. Ligar cada criança à quantia do
   cofrinho, o quanto Daniel e Helena gastaram, a troca da cédula de André e as moedas de 50 centavos de Ana
   (docs/contratos/quarto-bimestre.md §3). As cédulas e moedas são os ícones ma:cedula-* e ma:moeda-* (icones-10.js). */
(function () {
  // as respostas em reais valem com ou sem "R$", ",00" e "reais"
  function reais(v) {
    var r = [];
    (v.indexOf(',') < 0 ? [v, v + ',00'] : [v]).forEach(function (x) { r.push(x, 'R$ ' + x, 'R$' + x, x + ' reais'); });
    return r;
  }
  function dinheiro(lista) {
    var nome = { 'moeda-5c': '5 centavos', 'moeda-10c': '10 centavos', 'moeda-25c': '25 centavos', 'moeda-50c': '50 centavos',
      'moeda-1': '1 real', 'cedula-2': '2 reais', 'cedula-5': '5 reais', 'cedula-10': '10 reais', 'cedula-20': '20 reais',
      'cedula-50': '50 reais', 'cedula-100': '100 reais', 'cedula-200': '200 reais' };
    return lista.map(function (k) { return { img: 'ma:' + k, legenda: nome[k] }; });
  }
  var QUADROS = { titulo: 'As quantias dos cofrinhos', partes: [
    { titulo: 'Quadro 1', figuras: dinheiro(['cedula-50', 'cedula-10', 'cedula-20', 'moeda-5c']) },
    { titulo: 'Quadro 2', figuras: dinheiro(['cedula-100', 'cedula-20', 'moeda-1', 'moeda-10c']) },
    { titulo: 'Quadro 3', figuras: dinheiro(['cedula-20', 'cedula-5', 'cedula-5', 'cedula-5', 'moeda-25c', 'moeda-50c']) },
    { titulo: 'Quadro 4', figuras: dinheiro(['cedula-100', 'cedula-2', 'moeda-25c']) },
    { titulo: 'Quadro 5', figuras: dinheiro(['cedula-20', 'cedula-20', 'cedula-5', 'moeda-50c', 'moeda-10c', 'moeda-10c', 'moeda-10c']) },
  ] };
  var LOJA = { titulo: 'Na loja de brinquedos', partes: [
    { titulo: 'Daniel', figuras: dinheiro(['cedula-50', 'cedula-20', 'moeda-1', 'moeda-25c']) },
    { titulo: 'Helena', figuras: dinheiro(['cedula-50', 'cedula-20', 'cedula-5', 'moeda-50c']) },
  ] };

  Reino.registrarSala('matematica4',
    {
      id: 'ma10t1', nome: 'Nosso dinheiro', emoji: '💰',
      livroOrigem: 'atividades', capitulo: 10, paginas: 'pp. 1 a 2', ordem: 'livro',
      cartas: ['ma-t01', 'ma-t02'],
      intro: 'Vamos contar cédulas e moedas e descobrir quanto dinheiro cada um tem!',
      desafios: [
        { id: 'ma10t1-01', tipo: 'ligar', origem: 'ATI-01-q1', pagina: 1, livro: 'ma-t01', apoio: QUADROS,
          pergunta: 'Ligue cada criança à quantia que ela tem no cofrinho.',
          pares: [
            [{ t: 'Menina de cabelo preso: R$ 35,75' }, { t: 'Quadro 3' }],
            [{ t: 'Menina de cabelo crespo: R$ 102,25' }, { t: 'Quadro 4' }],
            [{ t: 'Menino de sardas: R$ 80,05' }, { t: 'Quadro 1' }],
            [{ t: 'Menina de coques: R$ 45,80' }, { t: 'Quadro 5' }],
            [{ t: 'Menino de cabelo preto: R$ 121,10' }, { t: 'Quadro 2' }],
          ],
          adaptacao: 'As crianças da foto viraram uma descrição curta, e os quadros de dinheiro ficam no texto de apoio.',
          explica: 'Quadro 1: 50 + 10 + 20 reais e 5 centavos = R$ 80,05. Quadro 2: 100 + 20 + 1 real e 10 centavos = R$ 121,10. Quadro 3: 20 + 5 + 5 + 5 reais, 25 e 50 centavos = R$ 35,75. Quadro 4: 100 + 2 reais e 25 centavos = R$ 102,25. Quadro 5: 20 + 20 + 5 reais, 50 centavos e três moedas de 10 centavos = R$ 45,80.' },
        { id: 'ma10t1-02', tipo: 'tabela', origem: 'ATI-02-q2a', pagina: 2, livro: 'ma-t02', apoio: LOJA,
          pergunta: 'Observe a quantia que Daniel e Helena gastaram na loja de brinquedos. a) Escreva no quadro a seguir a quantia que cada um deles gastou.',
          cab: ['Daniel', 'Helena'],
          linhas: [[{ certas: reais('71,25').concat('71 reais e 25 centavos') }, { certas: reais('75,50').concat(reais('75,5'), '75 reais e 50 centavos') }]],
          explica: 'Daniel: 50 + 20 + 1 real e 25 centavos = R$ 71,25. Helena: 50 + 20 + 5 reais e 50 centavos = R$ 75,50.' },
        { id: 'ma10t1-03', tipo: 'escolha', origem: 'ATI-02-q2b', pagina: 2, livro: 'ma-t02', apoio: LOJA,
          pergunta: 'b) Quem gastou a maior quantia?',
          opcoes: [
            { t: 'Daniel' },
            { t: 'Helena' },
          ], certa: 1,
          explica: 'Helena gastou R$ 75,50, e Daniel, R$ 71,25. Helena gastou mais!' },
        { id: 'ma10t1-04', tipo: 'escolha', origem: 'ATI-02-q3', pagina: 2, livro: 'ma-t02',
          apoio: { titulo: 'Trocar dinheiro', partes: [
            { texto: 'Trocar dinheiro é entregar um valor e receber em troca o mesmo valor, mas com uma quantidade diferente de cédulas ou moedas.' },
            { titulo: 'André recebeu:', figuras: dinheiro(['cedula-50', 'cedula-50', 'cedula-50', 'cedula-50']) },
          ] },
          pergunta: 'Ao trocar uma cédula, André recebeu a seguinte quantia. Qual é o valor da cédula que ele tinha antes da troca?',
          opcoes: [
            { t: 'R$ 10,00' },
            { t: 'R$ 50,00' },
            { t: 'R$ 100,00' },
            { t: 'R$ 200,00' },
          ], certa: 3,
          explica: 'Quatro cédulas de 50 reais: 50 + 50 + 50 + 50 = 200. A cédula era de R$ 200,00.' },
        { id: 'ma10t1-05', tipo: 'digitar', origem: 'ATI-02-q4', pagina: 2, livro: 'ma-t02',
          figura: { img: 'ma:moeda-50c', legenda: '50 centavos' },
          pergunta: 'Observe a moeda que Ana tirou do cofrinho. Quantas moedas iguais a essa são necessárias para Ana ter R$ 1,50?',
          frases: [
            { antes: '', depois: 'moedas', certas: ['3', 'três', '3 moedas', 'três moedas'] },
          ],
          explica: 'Duas moedas de 50 centavos fazem 1 real. Mais uma: R$ 1,50. São 3 moedas!' },
      ],
    });
})();
