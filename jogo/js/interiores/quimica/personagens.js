/* Laboratório de Química: o visual da Doutora Proveta, do Professor Carbono e da Dona Caramela (Reino.registrarPersonagem({ id, sprite }); a reserva em
   quimica/reservas.js é o contrato: nome, voz e vaga). */
(function () {
  // cientista: black power roxo, óculos de proteção verde-água, jaleco branco comprido (jaleco + avental branco),
  // crachá rosa e um frasquinho verde-água na mão (o 'livro' pequeno na cor do líquido; o motor não tem proveta).
  // A Doutora Vega do Observatório tem coque escuro e óculos amarelos: as duas não se confundem.
  Reino.registrarPersonagem({ id: 'quimica-proveta',
    sprite: { pele: '#8a5236', cabelo: '#8a4fd0', penteado: 'black', jaleco: true, avental: true, aventalCor: '#f4f2fa',
      roupa: '#2fb8a0', roupa2: '#4a3f7a', sapato: '#3a2f5a', oculos: true, oculosCor: '#5fe8d0', cracha: true,
      cor2: '#ff8ac4', livro: '#7cf0d0' },
  });

  // Professor Carbono: idoso calmo, cabelo e bigode grisalhos, óculos redondos, jaleco com gravata-borboleta roxa e
  // colete rosa por baixo; careca em cima (penteado 'careca' deixa só as laterais), bem diferente do black da Proveta.
  Reino.registrarPersonagem({ id: 'quimica-carbono',
    sprite: { idade: 'idoso', pele: '#f0c8a8', cabelo: '#c4c0cc', penteado: 'careca', bigode: '#a8a4b4', oculos: true,
      oculosCor: '#9b6bd6', jaleco: true, roupa: '#9b6bd6', roupa2: '#5a5470', sapato: '#4a3a30', gravata: '#ff8ac4',
      cor2: '#9b6bd6', livro: '#9b6bd6' },
  });

  // Dona Caramela: cozinheira-cientista de chapéu de chef, avental creme, roupa caramelo e laranja, cabelo ruivo em
  // coque; o colar verde-água e o frasquinho são o toque do laboratório (a Chef Manu é criança, de rabo e avental rosa).
  Reino.registrarPersonagem({ id: 'quimica-caramela',
    sprite: { pele: '#c98a5e', cabelo: '#b8541c', penteado: 'coque', chapeu: 'chef', chapeuCor: '#fff6e4', avental: true,
      aventalCor: '#fff0cc', roupa: '#d9892f', roupa2: '#8a4a1c', perna: 'saia', sapato: '#6b3a1c', cor2: '#f5b041',
      colar: '#5fe8d0', livro: '#ff9a3c' },
  });
})();
