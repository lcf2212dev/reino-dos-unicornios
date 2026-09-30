/* GEOGRAFIA — 2º ano, Volume 3, Capítulos 8 e 9 (pp. 13 a 31 da apostila).
   Capítulo 8, "Os lugares se conectam: meios de comunicação"; Capítulo 9, trânsito e uso seguro da internet.
   Lugar no reino: Estação dos Caminhos. 5 salas que dividem os R$20.
   Fotos em matérias/geografia/: a IMG_7536 é de Ciências (não usada); a escrita à mão é da Mariana, não gabarito.
   Salas em g1.js, g2.js, g3.js, g4.js, g5.js e o livro em livro.js (carregados antes deste arquivo, na ordem do
   manifesto; ver conteudo/materias/registro.js). */
Reino.registrarMateria({
  id: 'geografia',
  nome: 'Geografia',
  emoji: '🌍',
  cor: '#39a860',   // a cor da matéria (docs/contratos/ui.md §10.22)
  nomeLivro: 'Livro dos Caminhos',
  lugar: {
    nome: 'Estação dos Caminhos',
    artigo: 'a',   // "até a Estação dos Caminhos"
    sprite: 'caminhos',   // desenho de fora em interiores/geografia/fora.js
    rect: { x: 36, y: 5, w: 5, h: 5 },   // fileira de cima, entre o Castelo e o Baú
    placa: 'acima',
    porCima: true,     // entra depois do sorteio dos enfeites: o resto do reino fica igual (js/mundo/mapa.js)
    cores: { parede: '#eaf6ff', telhado: '#2f8fd6', detalhe: '#39a860' },
    novidade: '2026-09-26',   // selo "✨ Novo!" no menu Lugares até ela entrar (ou config.novidadeDias dias)
  },
  guia: 'Eu sou o guia da Estação dos Caminhos! Aqui tem comunicação, telefone, internet e trânsito.',

  salas: Reino.salasDa('geografia'),         // g1.js, g2.js, g3.js, g4.js, g5.js, na ordem do manifesto

  /* Livro dos Caminhos: resumos para ler antes ou quando errar. */
  livro: Reino.livroDa('geografia'),         // livro.js

  /* Unicórnios de Geografia: 1 comum e 1 raro por sala, 2 épicos e o lendário. */
  unicornios: [
    { id: 'g-sinalzinho', nome: 'Sinalzinho', raridade: 'comum', sala: 'g1',
      cores: { corpo: '#fff4e0', crina: ['#ff9d2e', '#ffd34d', '#6fa8ff'], chifre: '#ff6b8a' },
      frase: 'Eu converso com as mãos, em Libras!' },
    { id: 'g-recadinho', nome: 'Recadinho', raridade: 'raro', sala: 'g1',
      cores: { corpo: '#ffe8f2', crina: ['#ff6b8a', '#fff4d6', '#9b6bd6'], chifre: '#ffd34d' },
      frase: 'Bom dia! Deixei um desenho para você!' },
    { id: 'g-antena', nome: 'Antena', raridade: 'comum', sala: 'g2',
      cores: { corpo: '#e8f1ff', crina: ['#5fb4ff', '#c0c8d8', '#ffffff'], chifre: '#c0c8d8' },
      frase: 'Levo notícias para muita gente!' },
    { id: 'g-radinho', nome: 'Radinho', raridade: 'raro', sala: 'g2',
      cores: { corpo: '#fff0d0', crina: ['#e0433f', '#ffb020', '#5a3a2a'], chifre: '#ffe066' },
      frase: 'Aumenta o som que eu vou cantar!' },
    { id: 'g-alo', nome: 'Alô', raridade: 'comum', sala: 'g3',
      cores: { corpo: '#ffe6e0', crina: ['#e0433f', '#ff9cc6', '#ffffff'], chifre: '#ffcf5c' },
      frase: 'Alô, alô! Tem alguém no copinho?' },
    { id: 'g-conexao', nome: 'Conexão', raridade: 'raro', sala: 'g3',
      cores: { corpo: '#e6fbff', crina: ['#39c5bb', '#5a6cff', '#b8f0ff'], chifre: '#8ee3c8' },
      frase: 'Na internet, eu navego com um adulto!' },
    { id: 'g-sinal-verde', nome: 'Sinal Verde', raridade: 'comum', sala: 'g4',
      cores: { corpo: '#e8ffe8', crina: ['#39a860', '#ffd34d', '#e0433f'], chifre: '#6fdc8c' },
      frase: 'Verde: pode seguir com cuidado!' },
    { id: 'g-faixinha', nome: 'Faixinha', raridade: 'raro', sala: 'g4',
      cores: { corpo: '#ffffff', crina: ['#3a3a4a', '#ffffff', '#3a3a4a'], chifre: '#ffd34d' },
      frase: 'Atravesse sempre na faixa, tá?' },
    { id: 'g-pedalada', nome: 'Pedalada', raridade: 'comum', sala: 'g5',
      cores: { corpo: '#fff8d8', crina: ['#6fdc8c', '#5fb4ff', '#ffd34d'], chifre: '#ff9d2e' },
      frase: 'Vou de bicicleta, sem fumaça!' },
    { id: 'g-ar-puro', nome: 'Ar Puro', raridade: 'raro', sala: 'g5',
      cores: { corpo: '#eefcff', crina: ['#a9e4ff', '#e8fff1', '#8ee3c8'], chifre: '#ffffff' },
      frase: 'Sem fumaça, o céu fica azulzinho!' },
    { id: 'g-bussola', nome: 'Bússola', raridade: 'epico', treino: 'ouro',
      cores: { corpo: '#ffe98a', crina: ['#e0433f', '#ffffff', '#2f6fd6'], chifre: '#ffffff', asa: '#fff6d6' },
      frase: 'Ganhei asas para achar todos os caminhos!' },
    { id: 'g-rosa-ventos', nome: 'Rosa dos Ventos', raridade: 'epico', treino: 'perfeito',
      cores: { corpo: '#e6f0ff', crina: ['#2f8fd6', '#39a860', '#ffd34d'], chifre: '#ffd34d', asa: '#eef6ff' },
      frase: 'Norte, sul, leste e oeste: acertou tudo!' },
    { id: 'g-guardia-caminhos', nome: 'Guardiã dos Caminhos', raridade: 'lendario', materiaCompleta: true,
      cores: { corpo: '#f4fbff', crina: ['#2f8fd6', '#39a860', '#ffd34d'], chifre: '#ffd34d', asa: '#e6f6ff' },
      frase: 'Eu cuido de todos os caminhos do reino!' },
  ],
});
