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
    oi: ['Oi! Eu me chamo Rubi.', 'Eu moro aqui em Marte!', 'Minha nave quebrou!'],
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
    nova: ['Quer ouvir uma curiosidade?'],
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
    nova: ['Quer ouvir uma curiosidade?'],
    depois: ['Os anéis são de gelo e pedra.', 'Eles brilham com a luz do Sol!'],
  },
} });
