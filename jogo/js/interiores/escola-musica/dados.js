/* Escola de Música: conteúdo das aulas, notas MIDI e todas as páginas faladas na voz Claude.
   EscolaMusica é a API da feature; as outras partes acrescentam telas e utilitários sem DOM na carga. */
(function () {
  var R = window.Reino, M = R.EscolaMusica = {};
  M.notas = [
    { midi: 60, nome: 'Dó', branca: 0 }, { midi: 61, nome: 'Dó sustenido', curta: 'Dó♯', preta: 1 },
    { midi: 62, nome: 'Ré', branca: 1 }, { midi: 63, nome: 'Ré sustenido', curta: 'Ré♯', preta: 2 },
    { midi: 64, nome: 'Mi', branca: 2 }, { midi: 65, nome: 'Fá', branca: 3 },
    { midi: 66, nome: 'Fá sustenido', curta: 'Fá♯', preta: 4 }, { midi: 67, nome: 'Sol', branca: 4 },
    { midi: 68, nome: 'Sol sustenido', curta: 'Sol♯', preta: 5 }, { midi: 69, nome: 'Lá', branca: 5 },
    { midi: 70, nome: 'Lá sustenido', curta: 'Lá♯', preta: 6 }, { midi: 71, nome: 'Si', branca: 6 },
    { midi: 72, nome: 'Dó agudo', curta: 'Dó ↑', branca: 7 }
  ];
  M.melodia = [60, 62, 64, 65, 67, 65, 64, 62, 60];
  M.falas = {
    convite: ['Vamos fazer música juntos?', 'Escolha uma das duas aulas.'],
    teclado: ['Cada tecla tem um som.', 'Toque e descubra as notas.'],
    guiada: ['Siga as notas com calma.', 'Pode tentar quantas quiser.'],
    fim: ['Você tocou a melodia toda!', 'Vamos fazer música de novo?'],
    fundamentos: ['Vamos descobrir os sons?', 'Explore e depois responda.']
  };
  M.licoes = [
    { id: 'altura', titulo: 'Altura', texto: 'Um som pode ser grave ou agudo. No teclado, as notas ficam mais agudas quando vamos para a direita. Isso é diferente de tocar forte!',
      fala: ['O som pode ser bem grave.', 'Também pode ser agudo.', 'Vamos ouvir e comparar?'],
      exemplos: [{ nome: 'Som grave', notas: [[48, 0, 0.7]] }, { nome: 'Som agudo', notas: [[72, 0, 0.7]] }],
      pergunta: 'Qual som fica mais agudo?', opcoes: ['A nota à direita', 'A nota à esquerda'], certa: 0,
      explicacao: 'Isso! Indo para a direita, as notas do teclado ficam mais agudas.' },
    { id: 'duracao', titulo: 'Duração', texto: 'Um som pode ser curto ou longo. A duração é o tempo que ele fica soando. Ouça a mesma nota por tempos diferentes.',
      fala: ['O som pode ser curtinho.', 'Ou pode durar mais tempo.', 'Ouça a mesma nota agora.'],
      exemplos: [{ nome: 'Som curto', notas: [[60, 0, 0.15]] }, { nome: 'Som longo', notas: [[60, 0, 1.4]] }],
      pergunta: 'O que muda entre estes dois sons?', opcoes: ['O tempo que duram', 'O nome da nota'], certa: 0,
      explicacao: 'Isso! A nota é a mesma, mas um som dura mais que o outro.' },
    { id: 'intensidade', titulo: 'Intensidade', texto: 'Podemos tocar suave ou forte. Isso muda a intensidade do som. A nota pode continuar a mesma. Vamos ouvir em um volume confortável.',
      fala: ['Podemos tocar bem suave.', 'Ou tocar um pouco forte.', 'A nota continua a mesma.'],
      exemplos: [{ nome: 'Som suave', notas: [[60, 0, 0.6, 0.06]] }, { nome: 'Som mais forte', notas: [[60, 0, 0.6, 0.2]] }],
      pergunta: 'Tocar a mesma nota mais forte muda…', opcoes: ['A altura da nota', 'A intensidade do som'], certa: 1,
      explicacao: 'Isso! Forte e suave falam da intensidade. Grave e agudo falam da altura.' },
    { id: 'timbre', titulo: 'Timbre', texto: 'O timbre é o jeito de soar. Uma flauta e um piano têm timbres diferentes, mesmo tocando a mesma nota. Aqui usamos dois sons eletrônicos para comparar.',
      fala: ['Cada instrumento soa de um jeito.', 'Esse jeito se chama timbre.', 'Compare dois sons eletrônicos.'],
      exemplos: [{ nome: 'Som redondo', notas: [[60, 0, 0.8, 0.18, 'sine']] }, { nome: 'Som brilhante', notas: [[60, 0, 0.8, 0.1, 'triangle']] }],
      pergunta: 'O timbre ajuda a perceber…', opcoes: ['O jeito de soar', 'Só quanto tempo dura'], certa: 0,
      explicacao: 'Isso! Podemos reconhecer instrumentos pelo jeito como soam: o timbre.' },
    { id: 'ritmo', titulo: 'Pulsação e ritmo', texto: 'A pulsação marca batidas regulares, como passos constantes. O ritmo combina sons e silêncios sobre essa pulsação. Bata palmas junto, se quiser!',
      fala: ['A pulsação tem batidas regulares.', 'O ritmo mistura sons e pausas.', 'Bata palmas se você quiser.'],
      exemplos: [{ nome: 'Pulsação: 1, 2, 3, 4', notas: [[60, 0, 0.16], [60, 0.65, 0.16], [60, 1.3, 0.16], [60, 1.95, 0.16]] },
        { nome: 'Ritmo: tá, tá-tá, pausa, tá', notas: [[60, 0, 0.16], [60, 0.65, 0.16], [60, 0.975, 0.16], [60, 1.95, 0.16]] }],
      pergunta: 'O que marca batidas regulares?', opcoes: ['A pulsação', 'O timbre'], certa: 0,
      explicacao: 'Isso! A pulsação é regular. O ritmo pode ter sons de durações diferentes e pausas.' }
  ];
  var extras = [];
  Object.keys(M.falas).forEach(function (k) { M.falas[k].forEach(add); });
  M.licoes.forEach(function (l) { l.fala.forEach(add); });
  function add(texto) { extras.push({ texto: texto, voz: 'claude' }); }
  R.falasDoPredio('escola-musica', { extras: extras });
})();
