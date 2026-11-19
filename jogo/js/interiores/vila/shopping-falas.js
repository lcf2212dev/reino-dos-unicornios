/* Vila Arco-Íris, Shopping Terrazo (o terreno de baixo da esquerda; docs/contratos/vila.md §2): o que o totem da Vila e
   os objetos do shopping dizem. Parte das falas da Vila (Reino.falasDoPredio('vila', …)); tudo na voz da narradora,
   pacote interior-bosque. Cada página com até ~30 letras, frases de 3 ou mais palavras. Só tipos de loja e atrações,
   nenhuma marca de verdade. Carrega antes de vila.js e shopping.js (que leem estas falas). */
(function () {
  var R = window.Reino;

  R.falasDoPredio('vila', {
    objetos: {
      // na Vila, no lugar da placa do terreno
      'shopping-totem': ['O Shopping Terrazo chegou!', 'Venha passear lá dentro!'],
      // Corredor das Lojas: as vitrines, o cinema e o carro antigo
      'shopping-roupas': ['Roupas novas e coloridas!'],
      'shopping-brinquedos': ['Quantos brinquedos lindos!'],
      'shopping-sapatos': ['Sapatos para todos os pés!'],
      'shopping-cinema': ['Hoje tem filme de unicórnio!'],
      'shopping-pipoca': ['Pipoca quentinha para o filme!'],
      'shopping-carro': ['Um carro antigo bem lustroso!'],
      // Terraço Gourmet: a praça de alimentação
      'shopping-pizza': ['Pizza de queijo saindo agora!'],
      'shopping-hamburguer': ['Um hambúrguer bem gostoso!'],
      'shopping-japones': ['Sushi bonitinho e colorido!'],
      'shopping-sorvete': ['Sorvete geladinho de morango!'],
      'shopping-churrasco': ['Cheirinho bom de churrasco!'],
      // Zoo Parque e o cantinho Pet Park
      'shopping-girafa': ['A girafa estica o pescoço!'],
      'shopping-leao': ['O leão faz um rugido fofinho!'],
      'shopping-elefante': ['O elefante balança a tromba!'],
      'shopping-zebra': ['A zebra é cheia de listras!'],
      'shopping-escorregador': ['Escorregar é muito divertido!'],
      'shopping-cachorro': ['O cachorrinho quer um petisco!'],
    },
  });
})();
