/* Sala ma11t3 (Livro de Atividades, capítulo 11, pp. 11 e 12): Problemas envolvendo a divisão. Os morangos de
   Deise, os livros de Carla, as páginas de Lucas e o gibi de João (docs/contratos/quarto-bimestre.md §3). */
(function () {
  function reais(v) {
    var r = [];
    (v.indexOf(',') < 0 ? [v, v + ',00'] : [v]).forEach(function (x) { r.push(x, 'R$ ' + x, 'R$' + x, x + ' reais'); });
    return r;
  }
  var JOAO = { titulo: 'A quantia de João', partes: [{ figuras: [
    { img: 'ma:cedula-10', legenda: '10 reais' }, { img: 'ma:cedula-10', legenda: '10 reais' }, { img: 'ma:cedula-10', legenda: '10 reais' },
    { img: 'ma:cedula-5', legenda: '5 reais' }, { img: 'ma:cedula-5', legenda: '5 reais' }, { img: 'ma:cedula-5', legenda: '5 reais' },
  ] }] };

  Reino.registrarSala('matematica4',
    {
      id: 'ma11t3', nome: 'Problemas de dividir', emoji: '🍓',
      livroOrigem: 'atividades', capitulo: 11, paginas: 'pp. 11 a 12', ordem: 'livro',
      cartas: ['ma-t11', 'ma-t12'],
      intro: 'Vamos resolver problemas de metade e terça parte com morangos, livros e dinheiro!',
      desafios: [
        { id: 'ma11t3-01', tipo: 'escolha', origem: 'ATI-11-q1', pagina: 11, livro: 'ma-t11',
          pergunta: 'Deise colheu morangos da horta. Ela deu 12 morangos para seu filho Miguel e a metade dessa quantidade para sua filha Marina. Quantos morangos Marina recebeu?',
          opcoes: [
            { t: '3 morangos' },
            { t: '6 morangos' },
            { t: '8 morangos' },
            { t: '10 morangos' },
          ], certa: 1,
          explica: 'A metade de 12 é 6: 12 ÷ 2 = 6. Marina recebeu 6 morangos.' },
        { id: 'ma11t3-02', tipo: 'digitar', origem: 'ATI-11-q2', pagina: 11, livro: 'ma-t11',
          pergunta: 'Carla tem 18 livros infantis na estante. Ela disse: "Já li a terça parte desses livros." Quantos livros Carla ainda tem para ler?',
          frases: [{ antes: 'Carla ainda tem', depois: 'livros para ler.', certas: ['12', 'doze'] }],
          explica: 'A terça parte de 18 é 6: 18 ÷ 3 = 6. Ela já leu 6, então faltam 18 - 6 = 12 livros.' },
        { id: 'ma11t3-03', tipo: 'digitar', origem: 'ATI-12-q3a', pagina: 12, livro: 'ma-t12',
          pergunta: 'Lucas leu 18 páginas de um livro na segunda-feira e a metade dessa quantidade de páginas na terça-feira. a) Quantas páginas desse livro ele leu na terça-feira?',
          frases: [{ antes: 'Ele leu', depois: 'páginas na terça-feira.', certas: ['9', 'nove'] }],
          explica: 'A metade de 18 é 9: 18 ÷ 2 = 9. Ele leu 9 páginas na terça-feira.' },
        { id: 'ma11t3-04', tipo: 'digitar', origem: 'ATI-12-q3b', pagina: 12, livro: 'ma-t12',
          pergunta: 'b) Quantas páginas Lucas leu nesses dois dias?',
          frases: [{ antes: 'Lucas leu', depois: 'páginas nesses dois dias.', certas: ['27', 'vinte e sete'] }],
          explica: '18 páginas na segunda e 9 na terça: 18 + 9 = 27 páginas.' },
        { id: 'ma11t3-05', tipo: 'digitar', origem: 'ATI-12-q4a', pagina: 12, livro: 'ma-t12', apoio: JOAO,
          pergunta: 'João gastou a terça parte da quantia que tinha na compra de um gibi. Observe a quantia que ele tinha. a) Quantos reais João tinha?',
          frases: [{ antes: '', depois: '', certas: reais('45') }],
          explica: '10 + 10 + 10 = 30 e 5 + 5 + 5 = 15. 30 + 15 = 45. João tinha R$ 45,00.' },
        { id: 'ma11t3-06', tipo: 'digitar', origem: 'ATI-12-q4b', pagina: 12, livro: 'ma-t12', apoio: JOAO,
          pergunta: 'b) Quantos reais João gastou na compra do gibi?',
          frases: [{ antes: '', depois: '', certas: reais('15') }],
          explica: 'A terça parte de 45 é 15: 45 ÷ 3 = 15. O gibi custou R$ 15,00.' },
        { id: 'ma11t3-07', tipo: 'digitar', origem: 'ATI-12-q4c', pagina: 12, livro: 'ma-t12', apoio: JOAO,
          pergunta: 'c) Quantos reais sobraram para João depois dessa compra?',
          frases: [{ antes: 'Sobraram', depois: 'depois dessa compra.', certas: reais('30') }],
          explica: '45 - 15 = 30. Sobraram R$ 30,00 para João.' },
      ],
    });
})();
