/* MATEMÁTICA — 2º ano, Volume 3, Capítulos 8 e 9 (pp. 32 a 80 da apostila).
   Capítulo 8, "Tempo e probabilidade" (pp. 32 a 54); Capítulo 9, "Multiplicação" (pp. 55 a 80).
   Lugar no reino: Torre dos Números, na faixa do meio, à direita da praça. 6 salas: 80 Robux cada + 20 de bônus.
   Fotos em matérias/matemática/ (IMG_7492 a 7514): duas páginas por foto (a 7506 deitada, pp. 64–65).
   As respostas à mão são da Mariana e não são gabarito: cada conta foi conferida (ex.: p. 75, 8 + 16 = 24 mudas).
   Contagens de figuras que não dão para conferir na foto ficaram de fora.
   Salas em m1.js … m6.js e o livro em livro.js (carregados antes deste arquivo, na ordem do manifesto). */
Reino.registrarMateria({
  arquivada: true,
  id: 'matematica',
  nome: 'Matemática',
  emoji: '🔢',
  cor: '#3f7fe0',   // a cor da matéria (docs/contratos/ui.md §10.22)
  nomeLivro: 'Livro dos Números',
  lugar: {
    nome: 'Torre dos Números',
    artigo: 'a',
    sprite: 'numeros',  // desenho próprio: interiores/matematica/fora.js (Mapa.PREDIOS.numeros)
    rect: { x: 46, y: 15, w: 4, h: 5 },   // fileira do meio, a leste da praça; a porta (48,19) desce até a Rua da Praça
    placa: 'acima',
    porCima: true,     // entra depois do sorteio dos enfeites: o resto do reino fica igual (js/mundo/mapa.js)
    cores: { parede: '#eaf4ff', detalhe: '#ffc93c' },
    novidade: '2026-09-26',
  },
  guia: 'Em breve teremos novos conteúdos do quarto bimestre!',

  salas: Reino.salasDa('matematica'),         // m1.js … m6.js, na ordem do manifesto

  livro: Reino.livroDa('matematica'),         // livro.js

  /* Unicórnios de Matemática: 1 comum e 1 raro por sala, 2 épicos e o lendário. */
  unicornios: [
    { id: 'm-domingo', nome: 'Domingo', raridade: 'comum', sala: 'm1',
      cores: { corpo: '#fff4f4', crina: ['#e0433f', '#ffffff', '#6fa8ff'], chifre: '#ffcf5c' },
      frase: 'Domingo, segunda, terça... a semana tem 7 dias! 📅' },
    { id: 'm-bissexto', nome: 'Bissexto', raridade: 'raro', sala: 'm1',
      cores: { corpo: '#eefbe8', crina: ['#4cae4f', '#ffe066', '#a8e6a1'], chifre: '#ff8ac4' },
      frase: 'Eu só faço aniversário a cada quatro anos, no dia 29!' },
    { id: 'm-tique-taque', nome: 'Tique-Taque', raridade: 'comum', sala: 'm2',
      cores: { corpo: '#e6f4ff', crina: ['#2f6fd6', '#ffffff', '#ffb627'], chifre: '#e0433f' },
      frase: 'Tique-taque! Uma hora tem 60 minutos! ⏰' },
    { id: 'm-meia-noite', nome: 'Meia-Noite', raridade: 'raro', sala: 'm2',
      cores: { corpo: '#2e2b5f', crina: ['#8a5cff', '#fff3a0', '#5bc0eb'], chifre: '#fff3a0' },
      frase: 'Quando o relógio marca 24:00, eu acordo!' },
    { id: 'm-sortudo', nome: 'Sortudo', raridade: 'comum', sala: 'm3',
      cores: { corpo: '#fffaf0', crina: ['#ffd23f', '#3fbf7f', '#ff6b8a'], chifre: '#6fa8ff' },
      frase: 'Muito provável que você acerte! 🎲' },
    { id: 'm-trevinho', nome: 'Trevinho', raridade: 'raro', sala: 'm3',
      cores: { corpo: '#e8fff0', crina: ['#1f8a5b', '#6fdc8c', '#ffffff'], chifre: '#ffd34d' },
      frase: 'Impossível não gostar de matemática!' },
    { id: 'm-parcela', nome: 'Parcela', raridade: 'comum', sala: 'm4',
      cores: { corpo: '#fff1e6', crina: ['#ff8c42', '#ffd166', '#ff5d8f'], chifre: '#7fd6ff' },
      frase: '2 + 2 + 2 é o mesmo que 3 vezes 2!' },
    { id: 'm-vezes', nome: 'Vezes', raridade: 'raro', sala: 'm4',
      cores: { corpo: '#f1e8ff', crina: ['#9b5de5', '#f15bb5', '#00bbf9'], chifre: '#fee440' },
      frase: 'Meu chifre tem a forma do sinal de vezes! ✖️' },
    { id: 'm-dobrinho', nome: 'Dobrinho', raridade: 'comum', sala: 'm5',
      cores: { corpo: '#ffe4ef', crina: ['#ff7aa8', '#ffffff', '#ffb3c9'], chifre: '#8ee3c8' },
      frase: 'Tudo que eu ganho vem em dobro! ✌️' },
    { id: 'm-triplinha', nome: 'Triplinha', raridade: 'raro', sala: 'm5',
      cores: { corpo: '#e3f6ff', crina: ['#5cc8e8', '#ffcf5c', '#ff7eb6'], chifre: '#ffffff' },
      frase: 'Um, dois, três: eu sou o triplo de alegria!' },
    { id: 'm-tabuada', nome: 'Tabuada', raridade: 'comum', sala: 'm6',
      cores: { corpo: '#fdf6e3', crina: ['#d62828', '#fcbf49', '#2f6fd6'], chifre: '#3fbf7f' },
      frase: 'De 5 em 5: 5, 10, 15, 20! 🧮' },
    { id: 'm-detetive', nome: 'Xereta', raridade: 'raro', sala: 'm6',
      cores: { corpo: '#f2ece4', crina: ['#8a5a2b', '#dbb68a', '#3a2446'], chifre: '#ffd166' },
      frase: 'Primeiro as informações, depois a conta. Problema resolvido!' },
    { id: 'm-calculadora', nome: 'Calculadora', raridade: 'epico', treino: 'ouro',
      cores: { corpo: '#ffe07a', crina: ['#e0a800', '#ff7a59', '#fff4c2'], chifre: '#ffffff', asa: '#fff3c4' },
      frase: 'Conta certa, medalha de ouro!' },
    { id: 'm-infinito', nome: 'Infinito', raridade: 'epico', treino: 'perfeito',
      cores: { corpo: '#f0e6ff', crina: ['#7b2ff7', '#f107a3', '#5ee7df'], chifre: '#00bbf9', asa: '#f6f0ff' },
      frase: 'Tudo certinho! Minha alegria não tem fim!' },
    { id: 'm-rainha-numeros', nome: 'Rainha dos Números', raridade: 'lendario', materiaCompleta: true,
      cores: { corpo: '#fffaf2', crina: ['#3f7fe0', '#ffc93c', '#ef476f'], chifre: '#ffd166', asa: '#e6f0ff' },
      frase: 'Você conquistou todos os números da Torre! 👑' },
  ],
});
