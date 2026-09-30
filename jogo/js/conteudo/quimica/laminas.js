/* Laboratório de Química: as lâminas do microscópio, nenhuma de bicho (Reino.QUIMICA.laminas).
   Contrato: docs/contratos/quimica.md §3. id (o desenho da lâmina na tela do microscópio), nome, emoji (com pixel
   art), explica (páginas ao olhar pela 1ª vez), aumentos: { 10: página, 40: página, 100: página } (o que se vê em
   cada aumento). Olhar uma lâmina nítida = descoberta ('laminas'). Até 30 letras por página, 3+ palavras. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.laminas = [
    { id: 'sal', nome: 'Sal', emoji: '🧂',
      explica: ['O sal é feito de cristais.', 'Os átomos ficam em fileiras.', 'Por isso o cristal é um cubo.'],
      aumentos: { 10: 'Parecem grãozinhos brancos.', 40: 'Olha os cubinhos de sal!', 100: 'Os cubos têm bordas retinhas.' } },
    { id: 'acucar', nome: 'Açúcar', emoji: '🍬',
      explica: ['O açúcar também é cristal.', 'Mas não é um cubo como o sal.', 'Parece um tijolinho inclinado.'],
      aumentos: { 10: 'Os grãozinhos brilham na luz.', 40: 'Os cristais são transparentes.', 100: 'Os cantos são inclinados.' } },
    { id: 'folha', nome: 'Folha', emoji: '🍃',
      explica: ['A folha é feita de células.', 'Elas têm grãozinhos verdes.', 'São os cloroplastos, sabia?',
        'Com luz, eles fazem açúcar.'],
      aumentos: { 10: 'As veias parecem estradas.', 40: 'Olha as celulinhas juntinhas!', 100: 'Tem grãos verdes e boquinhas!' } },
    { id: 'cebola', nome: 'Casca de cebola', emoji: '🧅',
      explica: ['É a pele fininha da cebola.', 'Ela é feita de células.', 'Parecem tijolinhos de parede.'],
      aumentos: { 10: 'A pele é fina e transparente.', 40: 'São fileiras de tijolinhos!', 100: 'Cada célula tem um núcleo.' } },
    { id: 'polen', nome: 'Pólen de flor', emoji: '🌸',
      explica: ['Pólen é o pozinho da flor.', 'Abelhas e vento levam o pólen.', 'Assim nascem sementes novas.'],
      aumentos: { 10: 'O pozinho amarelo se espalha.', 40: 'São muitas bolinhas, olha!', 100: 'Cada bolinha tem espinhos!' } },
    { id: 'areia', nome: 'Areia', emoji: '🪨',
      explica: ['A areia é pedra quebradinha.', 'Rios e ondas gastam as pedras.', 'A maior parte é quartzo.'],
      aumentos: { 10: 'São pedrinhas de muitas cores.', 40: 'Tem redondas e pontudas.', 100: 'Algumas brilham como vidro.' } },
    { id: 'algodao', nome: 'Fio de algodão', emoji: '☁',
      explica: ['O algodão vem de uma planta.', 'Ele é feito de fibras.', 'Fibra é um fiozinho comprido.'],
      aumentos: { 10: 'São muitos fiozinhos brancos.', 40: 'Os fios estão enroscados.', 100: 'Cada fibra é uma fita torcida.' } },
    { id: 'neve', nome: 'Floco de neve', emoji: '❄',
      explica: ['O floco de neve é gelo.', 'É um cristal de água.', 'Os flocos têm seis pontas.'],
      aumentos: { 10: 'Parece uma estrelinha branca.', 40: 'Olha as seis pontas dela!', 100: 'Cada ponta tem raminhos.' } },
  ];
})();
