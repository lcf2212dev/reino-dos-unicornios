/* Vila Arco-Íris (docs/contratos/vila.md): os 4 lojistas e o que eles e os objetos dizem. Os interiores vila* são parte
   do Bosque (lugar 'bosque', pacote 'interior-bosque'): as vozes são diferentes entre si, do Claude e da narradora.
   Cada página com até 30 letras, frases de 3 ou mais palavras ({a|b} = ela|ele, Reino.Genero).
   Carrega antes de vila.js e lojas.js (que leem o elenco e estas falas). */
(function () {
  var R = window.Reino;

  /* ---------- lojistas (registrados antes do layout; a loja de cada um é a ação vilaLoja) ---------- */
  // Casa Bonita: senhora de cabelo lavanda, avental florido
  R.registrarPersonagem({ id: 'lavanda', nome: 'Dona Lavanda',
    sprite: { pele: '#f1c7a5', cabelo: '#9a7ad8', penteado: 'coque', roupa: '#f4a6c8', roupa2: '#c86aa0', perna: 'saia',
      avental: true, aventalCor: '#fff4fa', flor: true, colar: '#ffffff' },
    perfil: { voz: 'pt-BR-FranciscaNeural', velocidade: '+2%', tom: '+12Hz' } });
  // Forja Brilhante: ferreiro forte, de barba e avental de couro
  R.registrarPersonagem({ id: 'bigorna', nome: 'Seu Bigorna',
    sprite: { pele: '#b07a52', cabelo: '#3a2418', penteado: 'careca', barba: '#3a2418', roupa: '#d0503a', roupa2: '#4a3a3a',
      avental: true, aventalCor: '#7a5234', sapatoes: true },
    perfil: { voz: 'pt-BR-AntonioNeural', velocidade: '-4%', tom: '-34Hz' } });
  // Elmos e Chapéus: senhora elegante de chapéu, colar e óculos
  R.registrarPersonagem({ id: 'plumita', nome: 'Madame Plumita',
    sprite: { idade: 'idoso', pele: '#f6d3b8', penteado: 'chanel', chapeu: 'chapeu', chapeuCor: '#8a4fd0', roupa: '#b57cff',
      roupa2: '#6a3fb0', perna: 'vestido', colar: '#ffe066', oculos: true, oculosCor: '#c9a6ff', flor: true },
    perfil: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '-12%', tom: '-12Hz' } });
  // Armaduras e Botas: capitão de armadura, bigode e capa
  R.registrarPersonagem({ id: 'ferrolho', nome: 'Capitão Ferrolho',
    sprite: { pele: '#e0a87a', cabelo: '#8a8a9c', penteado: 'curto', bigode: true, armadura: true, armaduraCor: '#5fb4ff',
      capa: true, capaCor: '#3a6fd8', roupa: '#b0b0c2', roupa2: '#5a5a7a' },
    perfil: { voz: 'pt-BR-AntonioNeural', velocidade: '+10%', tom: '-18Hz' } });

  /* ---------- falas ---------- */
  R.falasDoPredio('vila', {
    npcs: {
      lavanda: { oi: ['Oi, eu sou a Dona Lavanda!', 'Tenho enfeites para sua casa.'],
        nova: ['Quer ver os enfeites?'], depois: ['Sua casa vai ficar linda!'] },
      bigorna: { oi: ['Olá, eu sou o Seu Bigorna!', 'Eu faço espadas brilhantes.'],
        nova: ['Quer ver as minhas espadas?'], depois: ['Use com coragem e carinho!'] },
      plumita: { oi: ['Olá, eu sou a Madame Plumita!', 'Tenho chapéus e elmos lindos.'],
        nova: ['Vamos escolher um chapéu?'], depois: ['Ficou uma graça em você!'] },
      ferrolho: { oi: ['Olá, sou o Capitão Ferrolho!', 'Armadura boa protege você.'],
        nova: ['Quer ver armaduras e botas?'], depois: ['Agora você está {protegida|protegido}!'] },
    },
    objetos: {
      'terreno': ['Este terreno está livre!', 'Um dia vai ter novidade aqui.'],
      'placa': ['{Bem-vinda|Bem-vindo} à Vila Arco-Íris!', 'Aqui tem quatro lojas.'],
      'fonte': ['A fonte tem água de arco-íris.', 'Ela brilha com todas as cores.'],
      'poco': ['Um poço dos desejos.', 'Faça um pedido bem bonito!'],
      // dentro das lojas
      'casa-vasos': ['Vasos de todas as cores!'],
      'casa-almofadas': ['Almofadas bem fofinhas!'],
      'casa-tapetes': ['Tapetes para a sala toda.'],
      'armas-forja': ['O fogo da forja é quentinho.'],
      'armas-bigorna': ['Aqui o ferro vira espada.'],
      'armas-espadas': ['Espadas que brilham muito!'],
      'cabecas-cabide': ['Chapéus de todas as cores!'],
      'cabecas-busto': ['Um elmo com uma pluma linda.'],
      'cabecas-caixas': ['Caixas cheias de chapéus.'],
      'armaduras-manequim': ['Uma armadura bem forte.'],
      'armaduras-botas': ['Botas para longas viagens.'],
      'armaduras-elmo': ['Um elmo para a cabeça.'],
    },
  });
})();
