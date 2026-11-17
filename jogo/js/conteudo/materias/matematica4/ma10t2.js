/* Sala ma10t2 (Livro de Atividades, capítulo 10, pp. 3 e 4): Problemas envolvendo o nosso dinheiro. A troca de
   Renato e de Jairo, as compras de Amanda, o troco do pai de Felipe e as compras de Marina
   (docs/contratos/quarto-bimestre.md §3). O quadro da conta do livro vira a frase com a caixa da resposta. */
(function () {
  function reais(v, ext) { // ext (opcional): a quantia por extenso, que também vale
    var r = [];
    (v.indexOf(',') < 0 ? [v, v + ',00'] : [v]).forEach(function (x) { r.push(x, 'R$ ' + x, 'R$' + x, x + ' reais'); });
    return ext ? r.concat(ext, ext + ' reais') : r;
  }
  function dinheiro(lista) {
    var nome = { 'moeda-50c': '50 centavos', 'moeda-1': '1 real', 'cedula-2': '2 reais', 'cedula-5': '5 reais',
      'cedula-10': '10 reais', 'cedula-50': '50 reais', 'cedula-100': '100 reais', 'cedula-200': '200 reais' };
    return lista.map(function (k) { return { img: 'ma:' + k, legenda: nome[k] }; });
  }
  var TROCA = { titulo: 'A troca de Renato', partes: [
    { titulo: 'A cédula:', figuras: dinheiro(['cedula-5']) },
    { titulo: 'Grupo 1', figuras: dinheiro(['moeda-50c', 'moeda-50c', 'moeda-50c', 'moeda-50c', 'moeda-50c', 'moeda-1', 'moeda-1']) },
    { titulo: 'Grupo 2', figuras: dinheiro(['moeda-50c', 'moeda-50c', 'moeda-50c', 'moeda-50c', 'moeda-50c', 'moeda-50c', 'moeda-1', 'moeda-1']) },
  ] };

  Reino.registrarSala('matematica4',
    {
      id: 'ma10t2', nome: 'Contas com dinheiro', emoji: '🛒',
      livroOrigem: 'atividades', capitulo: 10, paginas: 'pp. 3 a 4', ordem: 'livro',
      cartas: ['ma-t03', 'ma-t04'],
      intro: 'Vamos trocar cédulas, fazer compras e calcular o troco!',
      desafios: [
        { id: 'ma10t2-01', tipo: 'escolha', origem: 'ATI-03-q1a', pagina: 3, livro: 'ma-t03', apoio: TROCA,
          pergunta: 'Renato trocou esta cédula por moedas para colocar em seu cofrinho. a) Marque um X no grupo de moedas que ele pode ter recebido nessa troca.',
          opcoes: [
            { t: 'Grupo 1: cinco moedas de 50 centavos e duas moedas de 1 real.' },
            { t: 'Grupo 2: seis moedas de 50 centavos e duas moedas de 1 real.' },
          ], certa: 1,
          explica: 'A cédula é de 5 reais. Seis moedas de 50 centavos fazem 3 reais, e mais 2 reais: 5 reais! O grupo 1 só tem R$ 4,50.' },
        { id: 'ma10t2-02', tipo: 'digitar', origem: 'ATI-03-q1b', pagina: 3, livro: 'ma-t03',
          pergunta: 'b) Renato já tem 10 moedas de 50 centavos no cofrinho. Quantos reais ele terá no total se acrescentar as moedas que recebeu na troca da cédula de 5 reais?',
          adaptacao: 'O "valor indicado no item a" virou a troca da cédula de 5 reais, para a pergunta valer sozinha.',
          frases: [
            { antes: 'Renato terá', depois: 'no total.', certas: reais('10', 'dez') },
          ],
          explica: 'Duas moedas de 50 centavos fazem 1 real; então 10 moedas fazem 5 reais. 5 + 5 = 10. Ele terá R$ 10,00.' },
        { id: 'ma10t2-03', tipo: 'escolha', origem: 'ATI-03-q2', pagina: 3, livro: 'ma-t03',
          figura: { img: 'ma:cedula-100', legenda: '100 reais' },
          pergunta: 'Jairo trocou a cédula ao lado. Nessa troca, ele recebeu 5 cédulas iguais. Qual é o valor de cada cédula que Jairo recebeu?',
          opcoes: [
            { t: 'R$ 2,00' },
            { t: 'R$ 5,00' },
            { t: 'R$ 20,00' },
            { t: 'R$ 50,00' },
          ], certa: 2,
          explica: 'Cinco cédulas de 20 reais: 20 + 20 + 20 + 20 + 20 = 100. Cada cédula é de R$ 20,00.' },
        { id: 'ma10t2-04', tipo: 'digitar', origem: 'ATI-04-q3', pagina: 4, livro: 'ma-t04',
          pergunta: 'Na volta da escola, Amanda e a mãe dela passaram na padaria e na farmácia. Elas gastaram R$ 25,00 na padaria e R$ 52,00 na farmácia. Quantos reais elas gastaram ao todo nessas duas compras?',
          frases: [
            { antes: 'Elas gastaram', depois: 'ao todo.', certas: reais('77') },
          ],
          explica: '25 + 52 = 77. Elas gastaram R$ 77,00 ao todo.' },
        { id: 'ma10t2-05', tipo: 'digitar', origem: 'ATI-04-q4', pagina: 4, livro: 'ma-t04',
          apoio: { titulo: 'O troco', partes: [{ figuras: dinheiro(['cedula-10', 'cedula-2']) }] },
          pergunta: 'O pai de Felipe comprou um brinquedo e pagou com uma cédula de R$ 50,00. Observe a quantia que ele recebeu de troco. Quantos reais custou o brinquedo que o pai de Felipe comprou?',
          frases: [
            { antes: 'O brinquedo custou', depois: '.', certas: reais('38') },
          ],
          explica: 'O troco foi 10 + 2 = 12 reais. 50 - 12 = 38. O brinquedo custou R$ 38,00.' },
        { id: 'ma10t2-06', tipo: 'digitar', origem: 'ATI-04-q5', pagina: 4, livro: 'ma-t04',
          apoio: { titulo: 'O jogo de «videogame»', partes: [{ figuras: dinheiro(['cedula-200', 'cedula-100', 'cedula-50', 'cedula-2']) }] },
          pergunta: 'Marina já tinha comprado um patinete que custou R$ 175,00 quando gastou esta quantia na compra de um jogo de «videogame». Quanto Marina gastou no total com essas duas compras?',
          frases: [
            { antes: 'Marina gastou', depois: 'no total.', certas: reais('527') },
          ],
          explica: 'O jogo custou 200 + 100 + 50 + 2 = 352 reais. 175 + 352 = 527. Marina gastou R$ 527,00 no total.' },
      ],
    });
})();
