/* Salão de Beleza: a cabeleireira Dona Lulu (Reino.registrarPersonagem, docs/contratos/npcs-e-dialogo.md §5)
   e as falas dela. Voz própria, diferente da do Claude e da dos outros personagens.
   Cada página com até 30 letras (sem contar emoji) e frases de 3+ palavras. */
(function () {
  var R = window.Reino;
  R.registrarPersonagem({ id: 'salao-lulu', nome: 'Dona Lulu',
    sprite: { pele: '#a86b4a', cabelo: '#9b6bd6', penteado: 'coque', roupa: '#ff8ac4', roupa2: '#6b4a8a', perna: 'saia',
      avental: true, aventalCor: '#fff0f7', colar: '#ffd34d', presilha: true, cor2: '#ffd34d', tesoura: true },
    // alegre e caprichosa: a Ava mais rápida e aguda (longe do Claude, da Nina e da Stella)
    perfil: { voz: 'en-US-AvaMultilingualNeural', velocidade: '+12%', tom: '+24Hz' },
    predio: 'salao', x: 3, y: 5, acao: { tipo: 'tela', tela: 'salao-cabelo' },
  });
  R.falasDoPredio('salao', {
    npcs: {
      'salao-lulu': {
        oi: ['Oi, eu sou a Dona Lulu!', 'Aqui o cabelo fica lindo!'],
        nova: ['Vamos mudar o seu cabelo?'],
        depois: ['Ficou lindo demais, viu?', 'A arara tem roupas novas!'],
      },
    },
    objetos: {},
  });
})();
