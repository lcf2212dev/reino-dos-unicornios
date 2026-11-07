/* Sala lp11a4 (Livro de Aprendizagem, capítulo 11, pp. 41 a 45): graus do substantivo, o aumentativo, com o trecho
   da canção Fundo do mar ("montão" conta como aumentativo, de monte), os sentidos do aumentativo, marcar, ligar,
   reescrever, a aba recortável e as adivinhas. */
(function () {
  var FUNDO_DO_MAR = { titulo: 'Fundo do mar', partes: [{ versos: [
    'Como é legal lá no fundo do mar,', 'no fundo do mar, água de montão.', 'Peixes, peixinhos, peixões a nadar,', 'formando um grande coração.', '',
    'A maré é mansa,', 'eu quero ver quem dança', 'a dança das estrelinhas.', 'Quem sabe essa questão:', 'quantos dentes tem o tubarão?',
  ] }] };
  // o trecho para tocar nas palavras: {alvos} entre chaves
  function trecho(alvos) {
    var t = 'Como é legal lá no fundo do mar,\nno fundo do mar, água de montão.\nPeixes, peixinhos, peixões a nadar,\nformando um grande coração.\n\n' +
      'A maré é mansa,\neu quero ver quem dança\na dança das estrelinhas.\nQuem sabe essa questão:\nquantos dentes tem o tubarão?';
    alvos.forEach(function (p) { t = t.replace(new RegExp('\\b' + p + '(?![\\p{L}])', 'u'), '{' + p + '}'); });
    return t;
  }

  Reino.registrarSala('portugues4',
    {
      id: 'lp11a4', nome: 'Aumentativo', emoji: '🌊',
      livroOrigem: 'aprendizagem', capitulo: 11, paginas: 'pp. 41 a 45', ordem: 'livro',
      cartas: ['lp-a41', 'lp-a41b', 'lp-a41c', 'lp-a42', 'lp-a42b', 'lp-a43', 'lp-a44', 'lp-a45'],
      intro: 'Vamos mergulhar no fundo do mar e conhecer o aumentativo: peixe, peixão!',
      desafios: [
        { id: 'lp11a4-01', tipo: 'marcar', origem: 'APR-41-qA', pagina: 41, livro: 'lp-a41', marca: 'circular',
          pergunta: 'Qual palavra foi usada para indicar que tem muita água no fundo do mar?',
          texto: trecho(['montão']),
          adaptacao: 'A conversa oral virou tocar a palavra no trecho da canção.',
          explica: '"Água de montão" quer dizer muita, muita água! Montão é o aumentativo de monte.' },
        { id: 'lp11a4-02', tipo: 'escolha', origem: 'APR-41-qB', pagina: 41, livro: 'lp-a41',
          apoio: FUNDO_DO_MAR,
          pergunta: 'Qual palavra foi usada para indicar que tem peixes grandes a nadar?',
          opcoes: [
            { t: 'peixes' },
            { t: 'peixinhos' },
            { t: 'peixões' },
          ], certa: 2,
          adaptacao: 'A conversa oral virou escolher a palavra.',
          explica: 'Peixões são peixes grandes! A palavra peixão está no grau aumentativo.' },
        { id: 'lp11a4-03', tipo: 'marcar', origem: 'APR-42-qA', pagina: 42, livro: 'lp-a42', marca: 'circular',
          pergunta: 'Quais palavras do trecho da canção terminam em -ÃO mas não estão no grau aumentativo?',
          texto: trecho(['coração', 'questão', 'tubarão']),
          adaptacao: 'A conversa oral virou tocar as palavras no trecho da canção.',
          explica: 'Coração, questão e tubarão terminam em -ão, mas não são aumentativos. Já montão e peixões estão no aumentativo!' },
        { id: 'lp11a4-04', tipo: 'varias', origem: 'APR-43-q1', pagina: 43, livro: 'lp-a41c',
          pergunta: 'Marque um X nas palavras que estão no grau aumentativo.',
          opcoes: [
            { t: 'bonitão', ok: true },
            { t: 'vozeirão', ok: true },
            { t: 'inspiração' },
            { t: 'cabeção', ok: true },
            { t: 'avião' },
            { t: 'balcão' },
            { t: 'casacão', ok: true },
            { t: 'livrão', ok: true },
            { t: 'bichão', ok: true },
            { t: 'animalzão', ok: true },
            { t: 'emoção' },
            { t: 'festão', ok: true },
          ],
          adaptacao: 'Marcar X virou tocar nas palavras.',
          explica: 'Bonitão, vozeirão, cabeção, casacão, livrão, bichão, animalzão e festão estão no aumentativo. Inspiração, avião, balcão e emoção só terminam em -ão.' },
        { id: 'lp11a4-05', tipo: 'ligar', origem: 'APR-43-q2', pagina: 43, livro: 'lp-a42',
          pergunta: 'Ligue cada substantivo à sua forma no aumentativo.',
          pares: [
            [{ img: '🏠', alt: 'casa' }, { t: 'Casarão' }],
            [{ img: '🌸', alt: 'flor' }, { t: 'Florzona' }],
            [{ img: 'lp:11-porta', alt: 'porta' }, { t: 'Portona ou portão' }],
          ],
          direita: [1, 0, 2],
          explica: 'Casa, casarão; flor, florzona; porta, portona ou portão.' },
        { id: 'lp11a4-06', tipo: 'digitar', origem: 'APR-44-q3', pagina: 44, livro: 'lp-a41c',
          apoio: { titulo: 'As frases', partes: [{ lista: [
            'a) Gabriela foi à clínica para saber se tinha quebrado o DEDO.',
            'b) Francisco decidiu aparar seu BIGODE.',
            'c) O cachorrinho Tom estava assustado com o BARULHO dos fogos.',
          ] }] },
          pergunta: 'Reescreva as frases trocando a palavra destacada pelo seu aumentativo.',
          frases: [
            { letra: 'a', antes: 'Gabriela foi à clínica para saber se tinha quebrado o', depois: '.', certas: ['dedão'] },
            { letra: 'b', antes: 'Francisco decidiu aparar seu', depois: '.', certas: ['bigodão'] },
            { letra: 'c', antes: 'O cachorrinho Tom estava assustado com o', depois: 'dos fogos.', certas: ['barulhão'] },
          ],
          adaptacao: 'Reescrever a frase inteira virou escrever só a palavra trocada (dedo, bigode e barulho).',
          explica: 'Dedo, dedão; bigode, bigodão; barulho, barulhão.' },
        { id: 'lp11a4-07', tipo: 'completar', origem: 'APR-44-q4', pagina: 44, livro: 'lp-a44', avulsa: { carta: 'lp-a41c' },
          pergunta: 'Qual é o aumentativo das palavras a seguir? Coloque cada palavra do quadro no espaço correto.',
          palavras: ['carrão', 'olhão', 'casona', 'janelona', 'pedregulho', 'barracão'],
          frases: [
            { antes: 'OLHO:', depois: '', certa: 1 },
            { antes: 'CARRO:', depois: '', certa: 0 },
            { antes: 'PEDRA:', depois: '', certa: 4 },
            { antes: 'JANELA:', depois: '', certa: 3 },
            { antes: 'CASA:', depois: '', certa: 2 },
            { antes: 'BARRACA:', depois: '', certa: 5 },
          ],
          adaptacao: 'Recortar e colar virou tocar na palavra certa.',
          explica: 'Olho, olhão; carro, carrão; pedra, pedregulho; janela, janelona; casa, casona; barraca, barracão.' },
        { id: 'lp11a4-08', tipo: 'escolha', origem: 'APR-45-q5', pagina: 45, livro: 'lp-a42b',
          pergunta: 'Encontre e pinte a frase que usa o aumentativo para mostrar admiração.',
          opcoes: [
            { t: 'Eduardo é amigão de Amanda.' },
            { t: 'O aniversário da Júlia foi um festão.' },
            { t: 'O meninão correu pela sala e derrubou as cadeiras.' },
          ], certa: 1,
          adaptacao: 'Pintar a frase virou tocar nela.',
          explica: 'Festão mostra admiração: a festa foi incrível! Amigão mostra carinho, e meninão fala do tamanho do menino.' },
        { id: 'lp11a4-09', tipo: 'completar', origem: 'APR-45-q6', pagina: 45, livro: 'lp-a45', avulsa: { carta: 'lp-a41c' },
          pergunta: 'Leia as dicas e descubra quais são as palavras no aumentativo.',
          palavras: ['pezão', 'garrafona', 'colheraça', 'vozeirão'],
          frases: [
            { letra: 'a', antes: 'Sou uma colher tão grande que dá para servir sopa para todo mundo da família de uma vez só. Por isso, me chamam de...', depois: '', certa: 2 },
            { letra: 'b', antes: 'Sou um pé grande, que não cabe em qualquer calçado. Por isso, me chamam de...', depois: '', certa: 0 },
            { letra: 'c', antes: 'Sou uma garrafa grande e armazeno bastante água. Por isso, me chamam de...', depois: '', certa: 1 },
            { letra: 'd', antes: 'Minha voz é tão forte e grave que parece o trovão. Por isso, chamam minha voz de...', depois: '', certa: 3 },
          ],
          adaptacao: 'Escrever a palavra na linha virou tocar na palavra do quadro.',
          explica: 'Colher grande é colheraça; pé grande é pezão; garrafa grande é garrafona; voz forte é vozeirão.' },
      ],
    });
})();
