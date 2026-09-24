/* REVISÃO BIMESTRAL DE INGLÊS — 2º ano, 3º bimestre (folha "Revisão de Inglês", 11 questões).
   Os enunciados e as alternativas são os da folha, na mesma ordem. O que muda é só
   o jeito de responder: tocar, ligar, montar ou desenhar. Inglês sempre entre «».
   Acessórios: lendário (acertou tudo na 1ª tentativa), raro (na 2ª), comum (depois). */
Reino.registrarProva({
  id: 'ingles-3bim',
  materiaId: 'ingles',
  nome: 'Revisão Bimestral de Inglês',
  bimestre: '3º bimestre',
  emoji: '🔠',
  acessorios: {
    lendario: { id: 'coroa-big-ben', nome: 'Coroa do Big Ben' },
    raro: { id: 'oculos-de-sol', nome: 'Óculos de Sol' },
    comum: { id: 'lacinho-estrela', nome: 'Lacinho de Estrela' },
  },
  questoes: [
    { id: 'ib3-01', tipo: 'ligar', livro: 'rotina', lerItens: true,
      pergunta: '«Name the actions according to the pictures:» Ligue cada figura à ação.',
      pares: [
        [{ img: 'acao:escovar', alt: 'menina escovando os dentes' }, { t: '«brush my teeth»' }],
        [{ img: 'acao:levantar', alt: 'menina sentada na cama, acordando, com o despertador' }, { t: '«get up»' }],
        [{ img: 'acao:escola', alt: 'menina de mochila indo para a escola' }, { t: '«go to school»' }],
        [{ img: 'acao:dormir', alt: 'menina dormindo na cama' }, { t: '«go to bed»' }],
      ],
      direita: [2, 0, 3, 1],
      explica: 'Escovando os dentes é «brush my teeth». Acordando e levantando é «get up». Indo para a escola é «go to school». Indo dormir é «go to bed».' },

    { id: 'ib3-02', tipo: 'varias', livre: true, livro: 'rotina',
      pergunta: '«Choose the actions that are part of your routine:» Toque nas ações que fazem parte da sua rotina.',
      opcoes: [
        { t: '«I brush my teeth every day.»' },
        { t: '«I go to school every day.»' },
        { t: '«I go to the dentist every day.»' },
        { t: '«I have a shower every day.»' },
        { t: '«I play video games every day.»' },
      ],
      explica: 'Aqui não tem resposta errada: cada pessoa tem a sua rotina. «Every day» quer dizer "todo dia".' },

    { id: 'ib3-03', tipo: 'completar', livre: true, livro: 'dia',
      pergunta: '«Write one activity that is part of your routine that you do:» Escolha uma atividade para cada hora do dia.',
      palavras: ['«have breakfast»', '«brush my teeth»', '«go to school»', '«do my homework»', '«read a book»', '«play»', '«watch TV»', '«have a shower»', '«go to bed»'],
      frases: [
        { letra: 'a', antes: '«In the morning:»', depois: '.', certa: 0 },
        { letra: 'b', antes: '«In the afternoon:»', depois: '.', certa: 2 },
        { letra: 'c', antes: '«In the evening:»', depois: '.', certa: 8 },
      ],
      explica: 'Qualquer atividade vale, porque é a sua rotina! «Morning» é manhã, «afternoon» é tarde e «evening» é noite.' },

    { id: 'ib3-04', tipo: 'ligar', livro: 'sentimentos', lerItens: true,
      pergunta: '«Name the feelings below:» Ligue cada figura ao sentimento.',
      pares: [
        [{ img: 'sentimento:bored', alt: 'menina com a mão no rosto, entediada' }, { t: '«bored»' }],
        [{ img: 'sentimento:angry', alt: 'menina brava, soltando fumacinha' }, { t: '«angry»' }],
        [{ img: 'sentimento:sleepy', alt: 'menina bocejando' }, { t: '«sleepy»' }],
        [{ img: 'sentimento:excited', alt: 'menina de braços para cima, com um sorrisão' }, { t: '«excited»' }],
      ],
      direita: [3, 1, 0, 2],
      explica: 'Entediada é «bored». Brava é «angry». Com sono, bocejando, é «sleepy». Animada, de braços para cima, é «excited».' },

    { id: 'ib3-05', tipo: 'varias', estilo: 'marcar-x', livro: 'regras',
      pergunta: '«Read the sentences and tick what you can do at school:»',
      opcoes: [
        { t: '«Collaborate and help your friends.»', ok: true },
        { t: '«Throw a tantrum.»' },
        { t: '«Do your homework everyday.»', ok: true },
        { t: '«Disrespect teachers, friends and other people at school.»' },
        { t: '«Raise your hand to speak.»', ok: true },
      ],
      explica: 'Na escola podemos ajudar os amigos, fazer a lição de casa e levantar a mão para falar. Fazer birra («throw a tantrum») e desrespeitar as pessoas não pode.' },

    { id: 'ib3-06', tipo: 'varias', estilo: 'marcar-x', livro: 'regras',
      pergunta: '«Choose the alternatives that are NOT sport\'s rules:» Toque nas que NÃO são regras do esporte.',
      opcoes: [
        { t: '«Cheer for your team»' },
        { t: '«Yell at people.»', ok: true },
        { t: '«Hurt the opponent.»', ok: true },
        { t: '«Respect the other team\'s audience.»' },
      ],
      explica: 'A pergunta pede o que NÃO é regra. Gritar com as pessoas («yell at people») e machucar o adversário («hurt the opponent») não são regras. Torcer pelo time e respeitar a torcida do outro time são!' },

    { id: 'ib3-07', tipo: 'vfLista', rotulos: ['T', 'F'], livro: 'sol',
      pergunta: '«Write T for true and F for false about the solar system:»',
      itens: [
        { t: '«The sun isn\'t a star.»', v: false },
        { t: '«The sun is really small and cold.»', v: false },
        { t: '«There are 8 planets in the solar system.»', v: true },
        { t: '«The Earth is the third planet closer to the sun.»', v: true },
        { t: '«The moon isn\'t a planet.»', v: true },
      ],
      explica: 'O sol é uma estrela, e é enorme e quente, então as duas primeiras são falsas (F). Há 8 planetas, a Terra é o terceiro e a lua não é planeta: verdadeiras (T).' },

    { id: 'ib3-08', tipo: 'ordenar', livro: 'sol',
      pergunta: '«Number the order of the planets:» Toque nos planetas do mais perto ao mais longe do sol.',
      itens: ['«Mercury»', '«Venus»', '«Earth»', '«Mars»', '«Jupiter»', '«Saturn»', '«Uranus»', '«Neptune»'],
      explica: 'A ordem a partir do sol é: «Mercury», «Venus», «Earth», «Mars», «Jupiter», «Saturn», «Uranus» e «Neptune».' },

    { id: 'ib3-09', tipo: 'vfLista', rotulos: ['√', 'X'], livro: 'sol',
      pergunta: '«Put a tick (√) for the good effects of the sun and a cross (X) for the bad effects:»',
      itens: [
        { t: '«Solar radiation can generate energy.»', v: true },
        { t: '«Overexposure to the sun can cause eye diseases.»', v: false },
        { t: '«Plants need the sunlight to grow.»', v: true },
        { t: '«Our body needs the sunlight to make vitamin D.»', v: true },
        { t: '«Overexposure to the sun may cause sunburn.»', v: false },
      ],
      explica: 'Energia, plantas crescendo e vitamina D são efeitos bons do sol (√). Doenças nos olhos e queimadura de sol («sunburn») são efeitos ruins (X).' },

    { id: 'ib3-10', tipo: 'frase', livro: 'sol', lerItens: true,
      pergunta: '«Why is it important to wear sunscreen?» Monte a resposta com os blocos.',
      blocos: ['«Because»', '«it protects»', '«our skin.»'],
      explica: 'O protetor solar («sunscreen») protege a nossa pele: «Because it protects our skin.»' },

    { id: 'ib3-11', tipo: 'desenho', livro: 'sol',
      pergunta: '«Draw a picture using the elements of the art (shapes, lines and colors)»',
      requisitos: ['linhas', 'formas', 'cores'],
      explica: 'Os elementos da arte são linhas («lines»), formas («shapes») e cores («colours»). Todo desenho bonito usa os três!' },
  ],
});
