/* Falas dos personagens reservados do prédio observatorio (reservas.js), numa parte própria de
   Reino.falasDoPredio: a frente das falas escreve aqui e as vozes são gravadas sem esperar o visual.
   Cada página com até 30 letras (sem contar «» e emoji) e frases de 3+ palavras.
   ETs da Lua (planeta-lua, viagem de foguete; docs/contratos/viagem.md). */
Reino.falasDoPredio('observatorio', { npcs: {
  'lua-lumi': {
    oi: ['Oi! Eu me chamo Lumi.', 'Eu sou uma ET da Lua!', 'Que bom que você veio!'],
    nova: ['Vamos pular bem alto?'],
    depois: ['Aqui a gente pula bem alto!', 'Pule na cratera. É divertido!'],
  },
} });
Reino.falasDoPredio('observatorio', { npcs: {
  'lua-pipo': {
    oi: ['Oi! Eu sou o Pipo.', 'Eu adoro brincar de esconder!', 'Será que você me acha?'],
    nova: ['Quer brincar de esconder?'],
    depois: ['Eu me escondo muito bem!', 'Vamos brincar de novo?'],
  },
} });
Reino.falasDoPredio('observatorio', { npcs: {
  'lua-vovo': {
    oi: ['{Olá, minha querida!|Olá, meu querido!}', 'Eu sou a Vovó Cratera.', 'Moro na Lua faz muito tempo.'],
    nova: ['Quer ouvir uma curiosidade?'],
    depois: ['A Lua não tem luz própria.', 'Ela brilha com a luz do Sol!'],
  },
} });
// ETs de Marte (planeta-marte) e de Saturno (planeta-saturno), 2ª versão da viagem
Reino.falasDoPredio('observatorio', { npcs: {
  'marte-rubi': {
    oi: ['Oi! Eu me chamo Rubi.', 'Eu moro aqui em Marte!'],
    nova: ['Você me ajuda com as contas?'],
    depois: ['Minha nave voa de novo!', 'Obrigada, {amiga|amigo}!'],
  },
  'marte-faisca': {
    oi: ['Oi! Eu sou o Faísca.', 'Aqui a areia é vermelha!'],
    nova: ['Vamos rolar nas dunas?'],
    depois: ['Marte é muito divertido!', 'Volte para brincar de novo!'],
  },
  'marte-vovo': {
    oi: ['Olá! Sou o Vovô Vulcão.', 'Moro perto do vulcão gigante.'],
    nova: ['Vamos ouvir uma curiosidade?'],
    depois: ['Marte é o planeta vermelho.', 'A cor vem da ferrugem!'],
  },
  'saturno-sky': {
    oi: ['«Hello»! Eu sou a «Sky».', '«Hello» quer dizer olá.', 'Eu falo inglês, sabia?'],
    nova: ['Quer praticar inglês comigo?'],
    depois: ['«Thank you»! Quer dizer obrigada.', 'Você fala inglês muito bem!'],
  },
  'saturno-nico': {
    oi: ['Oi! Eu sou o Nico.', 'Eu moro nos anéis de Saturno!'],
    nova: ['Vamos patinar no gelo?'],
    depois: ['O gelo daqui brilha muito!', 'Volte para patinar comigo!'],
  },
  'saturno-vovo': {
    oi: ['{Olá, minha querida!|Olá, meu querido!}', 'Eu sou a Vovó Anel.', 'Moro nos anéis faz tempo.'],
    nova: ['Vamos ouvir uma curiosidade?'],
    depois: ['Os anéis são de gelo e pedra.', 'Eles brilham com a luz do Sol!'],
  },
} });
// ETs de Júpiter, Vênus e Netuno (3ª versão da viagem)
Reino.falasDoPredio('observatorio', { npcs: {
  'jupiter-tinta': {
    oi: ['Oi! Eu me chamo Tinta.', 'Eu escrevo cartas nas nuvens.'],
    nova: ['Você me ajuda com as palavras?'],
    depois: ['Minha carta ficou linda!', 'Obrigada, {amiga|amigo}!'],
  },
  'jupiter-bolha': {
    oi: ['Oi! Eu sou o Bolha.', 'Eu pulo de nuvem em nuvem!'],
    nova: ['Vamos pular nas nuvens?'],
    depois: ['Júpiter é fofo como algodão!', 'Volte para pular comigo!'],
  },
  'jupiter-vovo': {
    oi: ['Olá! Sou o Vovô Tempestade.', 'Eu conheço todos os ventos.'],
    nova: ['Vamos ouvir uma curiosidade?'],
    depois: ['Júpiter é o maior planeta.', 'Ele é gigante de verdade!'],
  },
  'venus-mapi': {
    oi: ['Oi! Eu me chamo Mapi.', 'Eu adoro mapas e viagens!', 'Mas hoje eu me perdi!'],
    nova: ['Você me ajuda com o mapa?'],
    depois: ['Agora eu sei o caminho!', 'Obrigada, {amiga|amigo}!'],
  },
  'venus-quentinho': {
    oi: ['Oi! Eu sou o Quentinho.', 'Aqui em Vênus é bem quente!'],
    nova: ['Vamos brincar no vapor?'],
    depois: ['Que calor mais gostoso!', 'Volte para brincar de novo!'],
  },
  'venus-vovo': {
    oi: ['{Olá, minha querida!|Olá, meu querido!}', 'Eu sou a Vovó Nuvem.', 'Moro no meio das nuvens.'],
    nova: ['Vamos ouvir uma curiosidade?'],
    depois: ['Vênus é o planeta mais quente.', 'Mais quente até que Mercúrio!'],
  },
  'netuno-gota': {
    oi: ['Oi! Eu me chamo Gota.', 'Eu sou cientista, sabia?'],
    nova: ['Vamos fazer uma experiência?'],
    depois: ['A ciência é muito divertida!', 'Obrigada, {amiga|amigo}!'],
  },
  'netuno-memo': {
    oi: ['Oi! Eu sou o Memo.', 'Eu guardo histórias antigas.'],
    nova: ['Vamos lembrar da história?'],
    depois: ['Você lembra muita coisa!', 'Obrigado, {amiga|amigo}!'],
  },
  'netuno-vovo': {
    oi: ['{Olá, minha querida!|Olá, meu querido!}', 'Eu sou a Vovó Ventania.', 'Aqui venta muito, muito!'],
    nova: ['Vamos ouvir uma curiosidade?'],
    depois: ['Que bom que você veio!', 'Volte para ouvir mais!'],
  },
} });
