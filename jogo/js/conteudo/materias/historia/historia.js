/* HISTÓRIA — 2º ano, Volume 3, Capítulos 8 e 9 (pp. 14–32 da apostila).
   Lugar no reino: Museu das Memórias. 5 salas que dividem os R$20.
   Salas em h1.js, h2.js, h3.js, h4.js, h5.js e o livro em livro.js (carregados antes deste arquivo, na ordem do
   manifesto; ver conteudo/materias/registro.js). */
Reino.registrarMateria({
  id: 'historia',
  nome: 'História',
  emoji: '🏛️',
  lugar: {
    nome: 'Museu das Memórias',
    sprite: 'museu',
    rect: { x: 3, y: 3, w: 6, h: 5 },   // em tiles; a porta fica no meio da última linha
    placa: 'acima',   // ao lado cobriria a Torre do Relógio
    cores: { parede: '#fff6e4', telhado: '#f0a04a', detalhe: '#ff8a3d' },
  },
  guia: 'Eu sou o guia do Museu das Memórias! Em cada sala tem um pedacinho da apostila de História.',

  salas: Reino.salasDa('historia'),         // h1.js, h2.js, h3.js, h4.js, h5.js, na ordem do manifesto

  /* Livro das Memórias: resumos para ler antes ou quando errar. */
  livro: Reino.livroDa('historia'),         // livro.js

  /* Unicórnios de História: 1 comum e 1 raro por sala, 2 épicos e o lendário. */
  unicornios: [
    { id: 'h-cartinha', nome: 'Cartinha', raridade: 'comum', sala: 'h1',
      cores: { corpo: '#fffaf0', crina: ['#6fa8ff', '#ff6b8a', '#ffffff'], chifre: '#ffcf5c' },
      frase: 'Adoro receber cartinhas... demoram, mas chegam!' },
    { id: 'h-conchinha', nome: 'Conchinha', raridade: 'raro', sala: 'h1',
      cores: { corpo: '#ffe4ef', crina: ['#ffb3c9', '#a9e4ff', '#fff4d6'], chifre: '#fff0f5' },
      frase: 'Vim da caixinha de lembranças da Dona Sara!' },
    { id: 'h-postal', nome: 'Postal', raridade: 'comum', sala: 'h2',
      cores: { corpo: '#e6f4ff', crina: ['#e0433f', '#ffffff', '#2f6fd6'], chifre: '#ffd34d' },
      frase: 'Vale a pena conhecer o Maranhão!' },
    { id: 'h-selinho', nome: 'Selinho', raridade: 'raro', sala: 'h2',
      cores: { corpo: '#fff3b8', crina: ['#6fd18c', '#ff9d2e', '#5fb4ff'], chifre: '#ff6b8a' },
      frase: 'Eu colo em qualquer cartão-postal!' },
    { id: 'h-pincelada', nome: 'Pincelada', raridade: 'comum', sala: 'h3',
      cores: { corpo: '#f1e8ff', crina: ['#8a5cff', '#ffcf5c', '#ff7eb6'], chifre: '#8ee3c8' },
      frase: 'Moro num quadro do museu.' },
    { id: 'h-fossil', nome: 'Fóssil', raridade: 'raro', sala: 'h3',
      cores: { corpo: '#f3e6cf', crina: ['#b98b5e', '#8ee3c8', '#fff7e6'], chifre: '#fff7e6' },
      frase: 'Sou antigo como um dinossauro, mas bem mais fofinho!' },
    { id: 'h-ciranda', nome: 'Ciranda', raridade: 'comum', sala: 'h4',
      cores: { corpo: '#e8fff1', crina: ['#ff7eb6', '#ffd34d', '#6fdc8c'], chifre: '#ff9d2e' },
      frase: 'Vamos todos cirandar!' },
    { id: 'h-carimbo', nome: 'Carimbó', raridade: 'raro', sala: 'h4',
      cores: { corpo: '#fff0d9', crina: ['#ff5c8a', '#ffb020', '#39c5bb'], chifre: '#ffe066' },
      frase: 'Danço com a saia rodada, no ritmo da Amazônia!' },
    { id: 'h-quadrinha', nome: 'Quadrinha', raridade: 'comum', sala: 'h5',
      cores: { corpo: '#ece6ff', crina: ['#7c5cff', '#ff9cc6', '#b8f0d8'], chifre: '#ffd34d' },
      frase: 'Eu sozinho canto bem, com você canto melhor!' },
    { id: 'h-grio', nome: 'Griô', raridade: 'raro', sala: 'h5',
      cores: { corpo: '#f7d9b5', crina: ['#ff8a3d', '#ffd34d', '#8a4dff'], chifre: '#fff4cc' },
      frase: 'Quer ouvir uma história antiga?' },
    { id: 'h-ourinho', nome: 'Ourinho', raridade: 'epico', treino: 'ouro',
      cores: { corpo: '#ffe98a', crina: ['#ff9d2e', '#ff5c8a', '#fff1b3'], chifre: '#ffffff', asa: '#fff6d6' },
      frase: 'Ganhei asas porque você revisou com calma!' },
    { id: 'h-calmaria', nome: 'Calmaria', raridade: 'epico', treino: 'perfeito',
      cores: { corpo: '#dfe6ff', crina: ['#5a6cff', '#9fd8ff', '#ffffff'], chifre: '#ffd34d', asa: '#eef2ff' },
      frase: 'Respira fundo... sem pressa a gente acerta tudo!' },
    { id: 'h-guardia', nome: 'Guardiã das Memórias', raridade: 'lendario', materiaCompleta: true,
      cores: { corpo: '#fff7fb', crina: ['#ff6b8a', '#ffb020', '#5fb4ff'], chifre: '#ffd34d', asa: '#ffe6f5' },
      frase: 'Eu guardo todas as histórias do Museu das Memórias!' },
  ],
});
