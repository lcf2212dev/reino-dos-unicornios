/* Casa das Palavras: tudo o que os personagens e os objetos dizem (gravado com a voz de cada um).
   Cada página com até 30 letras (sem contar emoji), frases de 3 ou mais palavras. */
Reino.FALAS_INTERIORES = Reino.FALAS_INTERIORES || {};
Reino.FALAS_INTERIORES.portugues = {
  npcs: {
    // guia do hall (o convite é o resumo automático do motor)
    palavrinha: {
      oi: ['Oi, eu sou a Dona Palavrinha!', 'Aqui moram as palavras! 📖'],
    },
    // sala 1: Receita de Quê? (Cozinha das Receitas)
    manu: {
      oi: ['Olá, eu sou a Chef Manu! 🍰', 'Receita tem passo a passo.'],
      nova: ['Vamos ler uma receita? 🥣', 'Vamos cozinhar com palavras?'],
      feita: ['Quer cozinhar de novo comigo?', 'Vamos repetir a receita?'],
      depois: ['Que receita caprichada! 🍰', 'Você seguiu cada passo! ✨'],
    },
    // sala 2: O H Silencioso (Horta do H)
    heitor: {
      oi: ['Sou o Jardineiro Heitor! 🌱', 'Na horta tem um H calado.'],
      nova: ['Vamos regar as palavras?', 'Vamos achar o H calado? 🌱'],
      feita: ['Quer plantar palavras de novo?', 'Vamos colher mais palavras?'],
      depois: ['Que horta linda você fez! 🌸', 'Você achou o H calado! ✨'],
    },
    // sala 3: CH, LH, NH e o X (Pátio do Circo)
    chocalho: {
      oi: ['Oi, eu sou o Palhaço Chocalho!', 'O meu nome tem CH! 🤡'],
      nova: ['Vamos pular a amarelinha?', 'Vamos brincar com CH e NH?'],
      feita: ['Quer brincar de novo comigo?', 'Vamos pular outra vez? 🎈'],
      depois: ['Que pulo mais bonito! 🎉', 'Você brincou com as letras!'],
    },
    // sala 4: Expedição Antártida (Porto da Expedição)
    brisa: {
      oi: ['Olá, eu sou a Capitã Brisa!', 'Já naveguei até a Antártida!'],
      nova: ['Vamos para a expedição? 🐧', 'Vamos ver os icebergs juntas?'],
      feita: ['Quer viajar de novo comigo?', 'Vamos navegar outra vez? 🌊'],
      depois: ['Que expedição corajosa! 🐧', 'Você relatou tudo direitinho!'],
    },
    // sala 5: L, R e RR (Parque do Carrossel)
    carlos: {
      oi: ['Oi, eu sou o Seu Carlos!', 'Eu cuido do carrossel! 🎵'],
      nova: ['Vamos girar no carrossel?', 'Vamos brincar com L e R?'],
      feita: ['Quer dar outra voltinha?', 'Vamos girar de novo? 🎈'],
      depois: ['Que volta mais divertida! 🎉', 'Você girou com as letras! ✨'],
    },
  },
  objetos: {
    // hall
    'livro': ['O Livro das Letras! 📖', 'Vamos ler com calma?'],
    'dicionario': ['Um dicionário bem grandão!', 'Ele guarda muitas palavras.'],
    'mapa-casa': ['É o mapa da Casa das Palavras.', 'São cinco salas para visitar.'],
    'blocos': ['Blocos com as letras do ABC!', 'Letras juntas formam palavras.'],
    // sala 1: cozinha
    'salada': ['Uma salada de frutas! 🍎', 'A receita tem ingredientes.', 'E tem o modo de preparo.'],
    'liquidificador': ['Suco de morango geladinho!', 'Primeiro, lave bem as frutas.'],
    'caneca-bolo': ['Um bolo feito na caneca! 🎂', 'Siga os passos em ordem.'],
    'abacaxi': ['Olha que abacaxi grandão!', 'Abacaxi se escreve com X.'],
    // sala 2: horta
    'placa-horta': ['Aqui está escrito HORTA.', 'O H do começo não tem som.'],
    'hortela': ['Um vaso de hortelã cheiroso!', 'Hortelã começa com H. 🌱'],
    'hibisco': ['As flores do hibisco! 🌸', 'O H fica bem quietinho.'],
    'helicoptero': ['Um helicóptero de brinquedo!', 'Ele começa com a letra H.'],
    // sala 3: circo
    'amarelinha': ['A amarelinha dos dias!', 'A semana tem sete dias.', 'Pule de casa em casa!'],
    'chocalho': ['Chocalho começa com CH!', 'Escute o barulhinho dele! 🎵'],
    'ninho': ['Olha o ninho com três ovinhos! 🥚', 'Ninho se escreve com NH.'],
    'pipoca': ['A pipoca é feita de milho!', 'Milho se escreve com LH.'],
    // sala 4: porto
    'iceberg': ['Isso é só a ponta do iceberg!', 'A maior parte fica embaixo.'],
    'pinguins': ['Pinguins na neve gelada! 🐧', 'Eles moram na Antártida.'],
    'diario': ['O diário da expedição! 📔', 'O relato conta o que houve.', 'Ele conta tudo em ordem.'],
    'focas': ['As focas descansam no gelo!', 'Elas nadam muito bem! 🐟'],
    // sala 5: parque
    'carrossel': ['Carrossel tem RR no meio!', 'O RR tem um som forte. 🎵'],
    'arvore': ['Uma árvore bem bonita! 🌳', 'Ár-vo-re: o R fecha a sílaba.'],
    'mel': ['Um pote de mel docinho!', 'O L no fim soa como U.'],
    'baloes': ['Balões para a festa! 🎈', 'Balão se escreve com L.'],
  },
};
