/* Vila Arco-Íris, Treinadores de Monstros (docs/contratos/monstros.md §2): a Treinadora Kiara (mulher, jovem; a ação
   'treinadores' abre a loja das MonsterBalls) e o que ela e os objetos do prédio dizem. Parte das falas da Vila
   (Reino.falasDoPredio('vila', …); pacote interior-bosque): a voz dela é diferente das dos 4 lojistas, do Claude e da
   narradora. Cada página com até 30 letras. Carrega antes de vila.js e treinadores.js (que leem o elenco e as falas). */
(function () {
  var R = window.Reino;

  // treinadora jovem de boné vermelho e rabo de cavalo, colete de aventura e a bolsa das MonsterBalls
  R.registrarPersonagem({ id: 'kiara', nome: 'Treinadora Kiara',
    sprite: { pele: '#e8b48c', cabelo: '#4a2a1a', penteado: 'rabo', chapeu: 'bone', chapeuCor: '#e8384f',
      roupa: '#ff5c9a', roupa2: '#3a3a5a', perna: 'short', colete: '#ffe066', bolsa: true, bolsaCor: '#e8384f' },
    perfil: { voz: 'en-US-AvaMultilingualNeural', velocidade: '+6%', tom: '+8Hz' } });

  R.falasDoPredio('vila', {
    npcs: {
      kiara: { oi: ['Oi, eu sou a Treinadora Kiara!', 'Eu cuido de monstrinhos.'],
        nova: ['Quer uma MonsterBall?'], depois: ['Boa sorte na aventura!'] },
    },
    objetos: {
      'treinadores-bolas': ['Bolas para pegar monstros!'],
      'treinadores-vitrine': ['Monstrinhos bem cuidados.'],
      'treinadores-tapete': ['Aqui se treina com carinho.'],
      'treinadores-estatua': ['Uma MonsterBall gigante!'],
    },
  });
})();
