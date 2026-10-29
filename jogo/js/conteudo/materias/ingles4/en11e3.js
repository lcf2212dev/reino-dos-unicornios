/* Sala en11e3 (English, capítulo 11, pp. 142 a 144): «The Alphabet Song» e o Hands on do cartaz, o código secreto
   (A DANCE, B BORED, C ALPHABET), o Writing time e o Talk to a friend (docs/contratos/quarto-bimestre.md §3).
   As respostas pessoais (o que ela faz quando está triste, o nome soletrado) valem como ela escrever. */
(function () {
  var CODIGO = { titulo: 'O código', partes: [{ lista: ['nuvem com chuva = A', 'folha = B', 'avião de papel = C',
    'nuvem = D', 'âncora = E', 'lâmpada = H', 'câmera = L', 'estrela = N', 'lua = O', 'bola = P', 'coração = R',
    'castelo = T'] }] };
  Reino.registrarSala('ingles4',
    {
      id: 'en11e3', nome: '«The Alphabet Song»', emoji: '🔤',
      livroOrigem: 'english', capitulo: 11, paginas: 'pp. 142 a 144', ordem: 'livro',
      cartas: ['en-e142', 'en-e143', 'en-e144'],
      intro: 'Vamos cantar o alfabeto em inglês e descobrir um código secreto! «A, B, C!»',
      desafios: [
        { id: 'en11e3-01', tipo: 'escolha', origem: 'ENG-142-q9', pagina: 142, livro: 'en-e142',
          pergunta: '«Let\'s sing the alphabet.» Na canção, qual letra vem depois do «G»?',
          opcoes: [
            { t: '«F»' },
            { t: '«H»' },
            { t: '«J»' },
          ], certa: 1,
          explica: '«A, B, C, D, E, F, G, H, I, J...»: depois do «G» vem o «H».' },
        { id: 'en11e3-02', tipo: 'escolha', origem: 'ENG-142-q9b', pagina: 142, livro: 'en-e142',
          pergunta: 'Complete a canção: «Now I know my...»',
          opcoes: [
            { t: '«ABCs.»' },
            { t: '«friends.»' },
            { t: '«name.»' },
          ], certa: 0,
          explica: '«Now I know my ABCs.» quer dizer: agora eu sei o meu ABC!' },
        { id: 'en11e3-03', tipo: 'desenho', origem: 'ENG-142-qA', pagina: 142, livro: 'en-e142', guardar: true,
          pergunta: '«Hands on.» «Make an alphabet poster!» Faça um cartaz com as letras do alfabeto.',
          requisitos: ['formas', 'cores'],
          adaptacao: 'O cartaz de papel virou um desenho na prancheta do jogo.',
          explica: 'Que cartaz colorido! O alfabeto tem 26 letras, do «A» ao «Z».' },
        { id: 'en11e3-04', tipo: 'digitar', origem: 'ENG-143-q10', pagina: 143, livro: 'en-e143', apoio: CODIGO,
          pergunta: '«Break the code. Spell the words.» Troque cada desenho pela letra e escreva a palavra.',
          frases: [
            { letra: 'a', antes: 'nuvem, nuvem com chuva, estrela, avião de papel, âncora:', depois: '', certas: ['dance'] },
            { letra: 'b', antes: 'folha, lua, coração, âncora, nuvem:', depois: '', certas: ['bored'] },
            { letra: 'c', antes: 'nuvem com chuva, câmera, bola, lâmpada, nuvem com chuva, folha, âncora, castelo:', depois: '', certas: ['alphabet'] },
          ],
          adaptacao: 'Os desenhos do código viraram os nomes deles, com a chave no texto de apoio.',
          explica: 'As palavras secretas são «dance», «bored» e «alphabet»!' },
        { id: 'en11e3-05', tipo: 'digitar', livre: true, origem: 'ENG-144-q11a', pagina: 144, livro: 'en-e144',
          pergunta: '«Writing time.» «What do you do when you feel sad?» Escreva o que você faz.',
          frases: [
            { antes: '«I»', depois: '.' },
          ],
          adaptacao: 'Resposta pessoal: qualquer resposta vale.',
          explica: 'Muito bem! Você pode escrever «I cry.», «I sleep.» ou «I hug my mum.»' },
        { id: 'en11e3-06', tipo: 'digitar', livre: true, origem: 'ENG-144-q11b', pagina: 144, livro: 'en-e144',
          pergunta: '«How do you spell your name?» Escreva o seu nome, letra por letra.',
          frases: [
            { antes: 'Meu nome:', depois: '', inicial: 'maiuscula' },
          ],
          adaptacao: 'Resposta pessoal: qualquer nome vale.',
          explica: 'Que lindo! Soletrar é dizer o nome letra por letra, em inglês.' },
        { id: 'en11e3-07', tipo: 'escolha', origem: 'ENG-144-q12a', pagina: 144, livro: 'en-e144',
          pergunta: '«Talk to a friend.» «What do you do when a toy breaks?» Na figura, o brinquedo do menino quebrou. O que ele faz?',
          opcoes: [
            { img: '😢', t: '«I cry.»' },
            { img: '💃', t: '«I dance.»' },
            { img: '🤸', t: '«I jump.»' },
          ], certa: 0,
          adaptacao: 'A conversa com o amigo virou escolher a resposta que combina com a foto.',
          explica: 'Brinquedo quebrado deixa a gente triste: «I cry.», eu choro.' },
        { id: 'en11e3-08', tipo: 'escolha', origem: 'ENG-144-q12b', pagina: 144, livro: 'en-e144',
          pergunta: '«What do you do when you go to a party?» Na figura, as crianças estão numa festa. O que elas fazem?',
          opcoes: [
            { img: '😢', t: '«I cry.»' },
            { img: '🦶', t: '«I stamp my foot.»' },
            { img: '💃', t: '«I dance.»' },
          ], certa: 2,
          adaptacao: 'A conversa com o amigo virou escolher a resposta que combina com a foto.',
          explica: 'Na festa, a gente fica feliz e dança: «I dance.»' },
      ],
    });
})();
