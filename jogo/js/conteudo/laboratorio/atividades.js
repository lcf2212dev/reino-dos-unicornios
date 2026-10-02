/* Dados das experiências do laboratório. Simulações seguras, sem save ou prêmios. */
(function () {
  window.Reino.LABORATORIO = {
    experiencias: [
      { id: 'flutua', nome: 'Flutua ou afunda?', guia: 'Escolha um objeto e coloque na água. Compare os resultados.', fala: ['Vamos testar na água.', 'O que será que flutua?'], opcoes: ['Rolha', 'Pedra', 'Tampa de plástico'], resultados: ['A rolha flutua. Ela fica na superfície da água.', 'A pedra afunda. Ela vai para o fundo do tanque.', 'Esta tampa de plástico flutua. Nem todo plástico flutua!'], conclusao: ['O material faz diferença.', 'O formato também importa.'] },
      { id: 'ima', nome: 'O poder do ímã', guia: 'Aproxime o ímã de cada material. Ele atrai todos?', fala: ['Vamos aproximar o ímã.', 'O que será que ele atrai?'], opcoes: ['Clipe de aço', 'Pedaço de madeira', 'Papel-alumínio'], resultados: ['O clipe de aço se aproxima do ímã.', 'A madeira fica no lugar. O ímã não a atrai.', 'O alumínio fica no lugar. Nem todo metal é atraído pelo ímã.'], conclusao: ['O ímã atrai o ferro.', 'Mas não atrai todo metal.'] },
      { id: 'sombra', nome: 'Teatro de sombras', guia: 'Mova a lanterna. Veja a sombra do bloco na parede.', fala: ['Vamos mover a lanterna.', 'Observe o tamanho da sombra.'], opcoes: ['Lanterna perto', 'Lanterna no meio', 'Lanterna longe'], resultados: ['Perto do bloco, a lanterna forma uma sombra maior.', 'No meio do caminho, a sombra tem tamanho intermediário.', 'Longe do bloco, a sombra fica menor. O bloco continua no mesmo lugar.'], conclusao: ['O bloco impede a luz.', 'Atrás dele fica a sombra.'] },
      { id: 'broto', nome: 'Uma semente acorda', guia: 'Compare dois potes. Só um recebe água. Avance os dias.', fala: ['Vamos observar a semente.', 'Um pote recebe água.'], opcoes: ['Passar um dia'], resultados: [], conclusao: ['A semente precisa de água.', 'Também precisa de ar.', 'Aqui o tempo passa depressa.'] },
      { id: 'mistura', nome: 'Misturar e observar', guia: 'Escolha o material, coloque na água e mexa com a colher.', fala: ['Vamos misturar com água.', 'Observe o que acontece.'], opcoes: ['Açúcar', 'Areia', 'Óleo'], resultados: ['O açúcar se dissolve na água. Ele continua na mistura, mesmo sem aparecer.', 'A areia não se dissolve. Depois de mexer, ela volta para o fundo.', 'O óleo não se dissolve na água e forma uma camada por cima.'], conclusao: ['Nem tudo se dissolve.', 'O açúcar continua na água.'] },
      { id: 'circuito', nome: 'Acenda a lâmpada', guia: 'Feche o caminho dos fios. Esta experiência usa apenas uma pilha virtual.', fala: ['Vamos ligar os dois fios.', 'A pilha fornece energia.'], opcoes: ['Ligar fio esquerdo', 'Ligar fio direito'], resultados: [], conclusao: ['O caminho está completo.', 'Agora a lâmpada acende.'] }
    ],
    jogos: [
      { id: 'memoria', nome: 'Pares da natureza', guia: 'Vire duas cartas. Encontre cada animal e seu hábitat.', fala: ['Vamos encontrar os pares.', 'Cada animal tem seu hábitat.'] },
      { id: 'polen', nome: 'Caminho da abelha', guia: 'Use as setas ou os botões. Visite as três flores e volte para a colmeia.', fala: ['Vamos visitar três flores.', 'Depois volte para a colmeia.'] },
      { id: 'ciclo', nome: 'Viagem da gotinha', guia: 'Toque nas peças para montar a viagem da água, começando no sol.', fala: ['O sol aquece a água.', 'Vamos montar essa viagem.'] }
    ],
    pares: [['Urso-polar', 'Região polar'], ['Camelo', 'Deserto'], ['Peixe-palhaço', 'Recife de coral']],
    ciclo: ['O sol aquece a água', 'A água evapora', 'O vapor forma gotinhas nas nuvens', 'A chuva cai'],
    fim: ['Você fez uma descoberta!', 'Pode experimentar de novo.']
  };
})();
