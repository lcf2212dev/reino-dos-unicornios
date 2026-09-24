/* Museu das Memórias: tudo o que os personagens e os objetos dizem (gravado com a voz de cada um). */
Reino.FALAS_INTERIORES = Reino.FALAS_INTERIORES || {};
Reino.FALAS_INTERIORES.museu = {
  npcs: {
    // guia do hall (o convite é o resumo automático do motor)
    memoria: {
      oi: ['Oi! Sou a Dona Memória. 🏛️', 'Cuido de todas as salas.'],
    },
    // sala 1: Cartas e Lembranças
    antonio: {
      oi: ['Oi! Eu sou o Seu Antônio. ✉️', 'Esperei o carteiro todo dia!'],
      nova: ['Vamos ler as cartas juntos?', 'Vamos ver minhas cartas? 💌'],
      feita: ['Quer reler as cartas comigo?', 'Vamos abrir a caixinha?'],
      depois: ['Você leu com calma! 💌', 'Que leitura atenta! ✨'],
    },
    // sala 2: Pedacinhos, Documentos e Cartão-Postal
    chico: {
      oi: ['Olá! Sou o Carteiro Chico!', 'Trago selos e postais! 📮'],
      nova: ['Vamos abrir minha bolsa?', 'Vamos ver os documentos?'],
      feita: ['Quer ver os postais de novo?', 'Vamos revisar os documentos?'],
      depois: ['Entrega feita com carinho! 📬', 'Você leu com atenção! ✨'],
    },
    // sala 3: Museus pelo Brasil
    taina: {
      oi: ['Oi! Eu sou a Guia Tainá! 🗺️', 'Adoro os museus do Brasil!'],
      nova: ['Vamos viajar pelos museus?', 'Quer conhecer museus comigo?'],
      feita: ['Quer fazer a viagem de novo?', 'Vamos passear outra vez?'],
      depois: ['Que viagem linda! 🧭', 'Você olhou tudo com calma! ✨'],
    },
    // sala 4: Tradições de Geração em Geração
    contadeira: {
      oi: ['Oi! Sou a Vovó Contadeira.', 'Sou griô: conto histórias! 🥁'],
      nova: ['Vamos ouvir histórias?', 'Quer aprender tradições?'],
      feita: ['Quer ouvir tudo de novo?', 'Vamos cantar a ciranda?'],
      depois: ['Você ouviu com carinho! 💛', 'Você prestou muita atenção! ✨'],
    },
    // sala 5: Material ou Imaterial?
    nina: {
      oi: ['Oi! Sou a Restauradora Nina.', 'Cuido dos brinquedos antigos.'],
      nova: ['Dá para pegar? Vamos ver?', 'Vamos separar os vestígios?'],
      feita: ['Quer separar tudo de novo?', 'Vamos revisar os vestígios?'],
      depois: ['Você pensou com calma! 🌟', 'Separou com atenção! ✨'],
    },
  },
  objetos: {
    // hall
    'livro': ['O Livro das Memórias! 📖', 'Vamos ler com calma?'],
    'mapa-museu': ['É o mapa do museu! 🗺️', 'São cinco salas de memórias.', 'Entre numa sala sem pressa.'],
    'bebedouro': ['Um golinho de água? 💧', 'Descanse os olhos um pouco.'],
    // sala 1
    'caixinha-lembrancas': ['A caixinha da Dona Sara. 🐚', 'Cada objeto tem uma história.'],
    'caixa-correio': ['Uma caixa de correio! 📮', 'Aqui as cartas esperavam.'],
    // sala 2
    'postais': ['Cartões-postais de todo lugar!', 'Na frente, uma foto.', 'Atrás vai um recado. ✍️'],
    'documentos': ['Vacina, identidade, passaporte', 'Documentos contam de nós.'],
    // sala 3
    'mapa-brasil': ['O mapa do Brasil! 🇧🇷', 'Tem museus pelo Brasil todo.'],
    'miniatura': ['Uma miniatura de museu! 🏛️', 'Museus guardam histórias.'],
    // sala 4
    'tambor': ['O tambor do carimbó! 🥁', 'Dança e música da Amazônia!'],
    'panela-barro': ['Uma panela de barro. 🏺', 'Tradição do Espírito Santo.'],
    // sala 5
    'caderno-quadrinhas': ['Um caderno de quadrinhas! 📒', 'O caderno é material.', 'A quadrinha a gente canta! 🎵'],
    'brinquedos': ['Brinquedos antigos! 🪀', 'São materiais: dá para pegar!'],
  },
};
