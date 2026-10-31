/* INGLÊS — 2º ano, English Volume 2, 3º bimestre, Chapters 6 a 10.
   Lugar no reino: Torre do Relógio. 5 salas que dividem as 50 moedas.
   Convenção: todo trecho em inglês fica entre « e » (a voz inglesa lê só esse pedaço).
   Salas em i1.js, i2.js, i3.js, i4.js, i5.js e o livro em livro.js (carregados antes deste arquivo, na ordem do
   manifesto; ver conteudo/materias/registro.js). */
Reino.registrarMateria({
  arquivada: true,
  id: 'ingles',
  nome: 'Inglês',
  emoji: '🔤',
  cor: '#e0a020',   // a cor da matéria (docs/contratos/arte.md §22)
  nomeLivro: 'Livro do Inglês',   // não "das Palavras": confundia com a Casa das Palavras (Português)
  lugar: {
    nome: 'Torre do Relógio',
    sprite: 'relogio',
    rect: { x: 14, y: 5, w: 5, h: 5 },   // fileira de cima, entre o Museu e o Castelo
    placa: 'acima',   // ao lado cobriria o castelo ou o museu
    cores: { parede: '#eef3ff', detalhe: '#ffcf3d' },
  },
  guia: 'Em breve teremos novos conteúdos do quarto bimestre!',

  salas: Reino.salasDa('ingles'),         // i1.js, i2.js, i3.js, i4.js, i5.js, na ordem do manifesto

  /* Livro do Inglês: resumos curtos para ler antes ou quando errar. */
  livro: Reino.livroDa('ingles'),         // livro.js

  /* Unicórnios de Inglês: 1 comum e 1 raro por sala, 2 épicos e o lendário. */
  unicornios: [
    { id: 'i-amiguinho', nome: 'Amiguinho', raridade: 'comum', sala: 'i1',
      cores: { corpo: '#e9fbf3', crina: ['#2fbf8f', '#ffd166', '#7ad3ff'], chifre: '#ff9f68' },
      frase: 'Vamos brincar juntos? «Let\'s play!»' },
    { id: 'i-torcida', nome: 'Torcida', raridade: 'raro', sala: 'i1',
      cores: { corpo: '#fff4e0', crina: ['#ff4d6d', '#ffd23f', '#3a86ff'], chifre: '#ffffff' },
      frase: 'Eu torço pelo seu time! «Go, team, go!»' },
    { id: 'i-sunny', nome: 'Sunny', raridade: 'comum', sala: 'i2',
      cores: { corpo: '#fff8c9', crina: ['#ffb703', '#fb8500', '#ffe66d'], chifre: '#ff7b00' },
      frase: 'Não esqueça o protetor solar! «Sunscreen!»' },
    { id: 'i-planetinha', nome: 'Planetinha', raridade: 'raro', sala: 'i2',
      cores: { corpo: '#e3e0ff', crina: ['#3d348b', '#7678ed', '#f7b801'], chifre: '#f35b04' },
      frase: 'Sou o nono planeta... de brincadeira! «Eight planets!»' },
    { id: 'i-escovinha', nome: 'Escovinha', raridade: 'comum', sala: 'i3',
      cores: { corpo: '#eafcff', crina: ['#48cae4', '#ffffff', '#90e0ef'], chifre: '#ff8fab' },
      frase: 'Brilho no sorriso! «I brush my teeth every day!»' },
    { id: 'i-chuveirinho', nome: 'Chuveirinho', raridade: 'raro', sala: 'i3',
      cores: { corpo: '#dff6ff', crina: ['#0096c7', '#caf0f8', '#b388ff'], chifre: '#ffe66d' },
      frase: 'Hora do banho, cheirinho bom! «Have a shower!»' },
    { id: 'i-hora-do-cha', nome: 'Hora do Chá', raridade: 'comum', sala: 'i4',
      cores: { corpo: '#fbeee6', crina: ['#c9ada7', '#e56b6f', '#b5838d'], chifre: '#eaac8b' },
      frase: 'Uma xícara de chá? «Good afternoon!»' },
    { id: 'i-noitinha', nome: 'Noitinha', raridade: 'raro', sala: 'i4',
      cores: { corpo: '#d9dcf5', crina: ['#22223b', '#4a4e69', '#ffd6ff'], chifre: '#fff3b0' },
      frase: 'Durma bem, até amanhã! «Good night!»' },
    { id: 'i-happy', nome: 'Happy', raridade: 'comum', sala: 'i5',
      cores: { corpo: '#fff0f6', crina: ['#ff5d8f', '#ffca3a', '#8ac926'], chifre: '#6a4c93' },
      frase: 'Se está feliz, bate palmas! «Clap your hands!»' },
    { id: 'i-sleepy', nome: 'Sleepy', raridade: 'raro', sala: 'i5',
      cores: { corpo: '#ecebff', crina: ['#a0c4ff', '#bdb2ff', '#ffc6ff'], chifre: '#fdffb6' },
      frase: 'Uaaah... estou com soninho. «I\'m sleepy!»' },
    { id: 'i-goldie', nome: 'Goldie', raridade: 'epico', treino: 'ouro',
      cores: { corpo: '#fff1a8', crina: ['#e09f3e', '#9e2a2b', '#fff8dc'], chifre: '#ffffff', asa: '#fffbe0' },
      frase: 'Asas de ouro para você! «Well done!»' },
    { id: 'i-tic-tac', nome: 'Tic-Tac', raridade: 'epico', treino: 'perfeito',
      cores: { corpo: '#e0fbfc', crina: ['#3d5a80', '#98c1d9', '#ee6c4d'], chifre: '#ffd166', asa: '#f0fcff' },
      frase: 'Tic-tac, sem pressa! «Perfect!»' },
    { id: 'i-rainha-relogio', nome: 'Rainha da Torre do Relógio', raridade: 'lendario', materiaCompleta: true,
      cores: { corpo: '#f5f3ff', crina: ['#4361ee', '#f72585', '#ffd60a'], chifre: '#ffd60a', asa: '#e8e6ff' },
      frase: 'Você aprendeu todo o inglês da Torre! «You are amazing!»' },
  ],
});
