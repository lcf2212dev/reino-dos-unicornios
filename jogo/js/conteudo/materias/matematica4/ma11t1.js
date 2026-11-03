/* Sala ma11t1 (Livro de Atividades, capítulo 11, pp. 7 e 8): Repartir em partes iguais. As balas de Murilo, os
   palitos de picolé e as crianças em grupos (docs/contratos/quarto-bimestre.md §3). Traçar as linhas entre as balas
   vira tocar onde cada linha passa; as balas são a ilustração ma-t07-balas (icones-t.js). */
(function () {
  var BALAS = { ilustracao: 'ma-t07-balas', alt: '12 balas embrulhadas, numa fileira só: azul, rosa, amarela e roxa, repetidas.' };
  var CRIANCAS = { titulo: 'As crianças', partes: [{ texto: 'Murilo e os 3 amigos dele: 4 crianças.' }] };
  // "8 crianças em 4 grupos: __ ÷ __ = __"
  function divisao(rotulo, a, b, c) {
    return [
      { antes: rotulo, depois: '÷', certas: [String(a)] },
      { antes: '', depois: '=', certas: [String(b)], junto: true },
      { antes: '', depois: '', certas: [String(c)], junto: true },
    ];
  }

  Reino.registrarSala('matematica4',
    {
      id: 'ma11t1', nome: 'Repartir igualzinho', emoji: '🍫',
      livroOrigem: 'atividades', capitulo: 11, paginas: 'pp. 7 a 8', ordem: 'livro',
      cartas: ['ma-t07', 'ma-t08'],
      intro: 'Vamos repartir balas, palitos e crianças em partes iguaizinhas!',
      desafios: [
        { id: 'ma11t1-01', tipo: 'varias', origem: 'ATI-07-q1a', pagina: 7, livro: 'ma-t07', figura: BALAS, apoio: CRIANCAS,
          pergunta: 'Murilo comprou um pacote de balas e vai dividir essas balas com os amigos dele. Trace linhas para dividir igualmente as balas entre Murilo e os amigos. Onde passam as linhas?',
          opcoes: [
            { t: 'Depois da segunda bala' },
            { t: 'Depois da terceira bala', ok: true },
            { t: 'Depois da quarta bala' },
            { t: 'Depois da sexta bala', ok: true },
            { t: 'Depois da oitava bala' },
            { t: 'Depois da nona bala', ok: true },
          ],
          adaptacao: 'Traçar as linhas entre as balas virou tocar nos lugares por onde as linhas passam.',
          explica: 'São 12 balas para 4 crianças. Separando de 3 em 3, as linhas passam depois da terceira, da sexta e da nona bala.' },
        { id: 'ma11t1-02', tipo: 'digitar', origem: 'ATI-07-q1b', pagina: 7, livro: 'ma-t07', figura: BALAS,
          pergunta: 'Quantas balas cada criança recebeu?',
          frases: [{ antes: '', depois: 'balas', certas: ['3', 'três', '3 balas', 'três balas'] }],
          explica: '12 balas divididas igualmente por 4 crianças: 12 ÷ 4 = 3. Cada criança recebeu 3 balas.' },
        { id: 'ma11t1-03', tipo: 'desenho', origem: 'ATI-07-q2a', pagina: 7, livro: 'ma-t07', guardar: true,
          pergunta: 'Para uma atividade, serão distribuídos igualmente 18 palitos de picolé entre 3 alunos. Desenhe a quantidade de palitos de picolé que cada aluno vai receber.',
          requisitos: ['linhas'],
          adaptacao: 'Os três quadros do livro viraram a prancheta de desenho do jogo: desenhe os palitos dos 3 alunos.',
          explica: '18 palitos para 3 alunos: 6 palitos para cada um. Três grupos de 6 palitos!' },
        { id: 'ma11t1-04', tipo: 'digitar', origem: 'ATI-07-q2b', pagina: 7, livro: 'ma-t07',
          pergunta: 'Quantos palitos de picolé cada aluno recebeu?',
          frases: [{ antes: '', depois: 'palitos', certas: ['6', 'seis', '6 palitos', 'seis palitos'] }],
          explica: '18 ÷ 3 = 6. Cada aluno recebeu 6 palitos de picolé.' },
        { id: 'ma11t1-05', tipo: 'digitar', origem: 'ATI-08-q3', pagina: 8, livro: 'ma-t08',
          pergunta: 'As crianças devem ser divididas em grupos com a mesma quantidade de participantes. Complete o quadro escrevendo a divisão que representa cada situação.',
          frases: [].concat(
            divisao('8 crianças em 4 grupos:', 8, 4, 2),
            divisao('12 crianças em 2 grupos:', 12, 2, 6),
            divisao('20 crianças em 5 grupos:', 20, 5, 4)),
          adaptacao: 'Cada linha do quadro virou uma divisão com caixas para os números; as crianças desenhadas viraram o número.',
          explica: '8 ÷ 4 = 2, 12 ÷ 2 = 6 e 20 ÷ 5 = 4. Em cada grupo fica a mesma quantidade de crianças.' },
      ],
    });
})();
