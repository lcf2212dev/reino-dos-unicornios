/* CIÊNCIAS — 2º ano, Volume 3, Ciências, Capítulos 8 e 9 (pp. 13 a 32 da apostila).
   Capítulo 8, "Seres vivos e suas relações" (pp. 13 a 22); Capítulo 9, "Características dos seres vivos" (pp. 23 a 32).
   Lugar no reino: Laboratório de Ciências, no 3º andar do Observatório (lugar.dentro; sem rect nem sprite).
   5 salas que dividem os R$20, na ordem do livro. Salas em c1.js … c5.js e o livro em livro.js (carregados antes
   deste arquivo, na ordem do manifesto; ver conteudo/materias/registro.js). Ícones novos em icones.js. */
Reino.registrarMateria({
  id: 'ciencias',
  nome: 'Ciências',
  emoji: '🔬',
  nomeLivro: 'Caderno do Cientista',
  lugar: { nome: 'Laboratório de Ciências', artigo: 'o', dentro: 'observatorio', interior: 'observatorio-3' },
  guia: 'Eu sou o guia do Laboratório de Ciências! Aqui a gente descobre os seres vivos e onde cada um mora.',

  salas: Reino.salasDa('ciencias'),         // c1.js, c2.js, c3.js, c4.js, c5.js, na ordem do manifesto

  /* Caderno do Cientista: resumos curtos para ler antes ou quando errar. */
  livro: Reino.livroDa('ciencias'),         // livro.js

  /* Unicórnios de Ciências: 1 comum e 1 raro por sala, 2 épicos e o lendário. */
  unicornios: [
    { id: 'c-brotinho', nome: 'Brotinho', raridade: 'comum', sala: 'c1',
      cores: { corpo: '#effbe6', crina: ['#5cb85c', '#a8e063', '#fff7d6'], chifre: '#ffd34d' },
      frase: 'Eu nasci, cresci e vou crescer mais! Sou um ser vivo! 🌱' },
    { id: 'c-formiguinha', nome: 'Formiguinha', raridade: 'raro', sala: 'c1',
      cores: { corpo: '#fff0e6', crina: ['#b0452f', '#7bc86c', '#3a2446'], chifre: '#9bd65a' },
      frase: 'Uma folhinha de cada vez, todas juntas até o formigueiro! 🐜' },
    { id: 'c-pintadinha', nome: 'Pintadinha', raridade: 'comum', sala: 'c2',
      cores: { corpo: '#fff3c4', crina: ['#e0a020', '#5a3a1a', '#ffe07a'], chifre: '#ffffff' },
      frase: 'Tenho pintinhas como a onça-pintada! 🐆' },
    { id: 'c-colmeia', nome: 'Colmeia', raridade: 'raro', sala: 'c2',
      cores: { corpo: '#fff8d6', crina: ['#ffcf33', '#3a2446', '#ffe9a0'], chifre: '#ff9e1b' },
      frase: 'Na colmeia, cada abelha ajuda todo mundo! 🐝' },
    { id: 'c-beija-flor', nome: 'Beija-Flor', raridade: 'comum', sala: 'c3',
      cores: { corpo: '#e8fff6', crina: ['#1fb58f', '#ff5fa2', '#7ad3ff'], chifre: '#ffd34d' },
      frase: 'Hum, que néctar docinho nas flores! 🌸' },
    { id: 'c-parceria', nome: 'Parceria', raridade: 'raro', sala: 'c3',
      cores: { corpo: '#eef0f4', crina: ['#5a5f6e', '#f2c14e', '#a0c4ff'], chifre: '#fff4d6' },
      frase: 'O búfalo e os pássaros são amigos: é bom para os dois! 🐃' },
    { id: 'c-mandacaru', nome: 'Mandacaru', raridade: 'comum', sala: 'c4',
      cores: { corpo: '#f3ffe8', crina: ['#3f9b4a', '#ffd166', '#e0433f'], chifre: '#ffb5c5' },
      frase: 'Guardo água aqui dentro, igual a um cacto! 🌵' },
    { id: 'c-aguape', nome: 'Aguapé', raridade: 'raro', sala: 'c4',
      cores: { corpo: '#e6f7ff', crina: ['#2c9fd6', '#7bd389', '#c7b3ff'], chifre: '#ffffff' },
      frase: 'Eu flutuo na água, bem leve, pertinho do Sol! 🌊' },
    { id: 'c-lupinha', nome: 'Lupinha', raridade: 'comum', sala: 'c5',
      cores: { corpo: '#f6f1ff', crina: ['#6a4cc7', '#ffcf5c', '#8fd3ff'], chifre: '#c98b4d' },
      frase: 'Observe as cores, os tamanhos e o que cada um faz! 🔎' },
    { id: 'c-feneco', nome: 'Feneco', raridade: 'raro', sala: 'c5',
      cores: { corpo: '#fff1dc', crina: ['#e8a25c', '#fff7ea', '#c46a2c'], chifre: '#ffe169' },
      frase: 'Minhas orelhas grandes me ajudam a espantar o calor! 🦊' },
    { id: 'c-cientista', nome: 'Cientista', raridade: 'epico', treino: 'ouro',
      cores: { corpo: '#ffe07a', crina: ['#e0a800', '#39a860', '#fff4c2'], chifre: '#ffffff', asa: '#fff3c4' },
      frase: 'Brilhei de orgulho: você é ouro em Ciências! 🔬' },
    { id: 'c-descoberta', nome: 'Descoberta', raridade: 'epico', treino: 'perfeito',
      cores: { corpo: '#e8fbff', crina: ['#00b4d8', '#90e0ef', '#ff7aa8'], chifre: '#ffd166', asa: '#effaff' },
      frase: 'Nenhum errinho! Que descoberta perfeita!' },
    { id: 'c-rainha-natureza', nome: 'Rainha da Natureza', raridade: 'lendario', materiaCompleta: true,
      cores: { corpo: '#f4fff0', crina: ['#39a860', '#4cc9f0', '#ffd166'], chifre: '#ff8ac4', asa: '#eafff0' },
      frase: 'Você conheceu todos os seres vivos do Laboratório! 👑' },
  ],
});
