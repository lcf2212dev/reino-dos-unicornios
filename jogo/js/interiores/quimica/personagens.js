/* Laboratório de Química: o visual da Doutora Proveta (Reino.registrarPersonagem({ id, sprite }); a reserva em
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
})();
