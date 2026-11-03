/* Museu das Memórias, História da Gente (4º bimestre): o que os personagens e os objetos dizem (gravado com a voz de
   cada um, pacote interior-museu). Cada página com até ~30 letras (sem contar emoji) e frases de 3+ palavras.
   As estações das salas falam a página e o nome da sala (gerado em museu/museu.js a partir dos dados).
   As falas do 3º bimestre estão em arquivo/terceiro-bimestre/jogo/js/interiores/museu/falas.js. */
Reino.falasDoPredio('museu', {
  npcs: {
    // a guia do hall (o convite é o resumo automático do motor)
    memoria: {
      oi: ['Oi! Sou a Dona Memória. 🏛️', 'Aqui mora a História da Gente!', 'Cada capítulo tem uma galeria.',
        'Depois vêm as oficinas.'],
      nova: ['Vamos ler os livros {juntas|juntos}?', 'Quer ver a lista de salas? ✨'],
      depois: ['Você leu com muita calma! 💖', 'Volte sempre ao museu! 🏛️'],
    },
    // galeria do capítulo 10, "O trabalho de cada um"
    antonio: {
      oi: ['Oi! Eu sou o Seu Antônio.', 'Trabalhei a vida toda no sítio!', 'Eu tirava o leite das vacas. 🐄'],
      nova: ['Vamos ver o trabalho de cada um?', 'Em casa, cada um ajuda! 🧹'],
      depois: ['Que trabalho bem-feito! ✨', 'O leite vem lá do campo! 🥛'],
    },
    // galeria do capítulo 11, "Profissionais da comunidade"
    chico: {
      oi: ['Olá! Sou o Carteiro Chico! 📮', 'Carteiro também é profissão!', 'Eu levo cartas pelo bairro.'],
      nova: ['Vamos conhecer as profissões?', 'Umas são antigas, outras novas!'],
      depois: ['Entrega feita com carinho! 📬', 'Toda profissão é importante!'],
    },
    // galeria do capítulo 12, "Trabalho e meio ambiente"
    taina: {
      oi: ['Oi! Eu sou a Guia Tainá! 🌳', 'Eu adoro cuidar da natureza.'],
      nova: ['Vamos cuidar da natureza?', 'Vamos separar o lixo {juntas|juntos}?'],
      depois: ['A natureza agradece! 🌱', 'Você cuidou muito bem! ✨'],
    },
    // oficina do capítulo 10 (Livro de Atividades)
    contadeira: {
      oi: ['Oi! Sou a Vovó Contadeira.', 'Na minha casa, todos ajudavam!'],
      nova: ['Vamos fazer as atividades?', 'Cada um faz a sua parte! 💛'],
      depois: ['Você fez a sua parte direitinho!', 'Que capricho, hein! 💛'],
    },
    // oficina do capítulo 12 (Livro de Atividades)
    nina: {
      oi: ['Oi! Sou a Restauradora Nina.', 'Eu conserto as peças antigas.', 'Consertar ajuda a natureza! 🌿'],
      nova: ['Vamos fazer as atividades?', 'Antes de jogar fora, conserte!'],
      depois: ['Você pensou com calma! 🌟', 'Que trabalho caprichado! ✨'],
    },
  },
  objetos: {
    // hall
    'hi-livro-aprendizagem': ['Este é o livro verde! 📗', 'É o Livro de Aprendizagem.'],
    'hi-livro-atividades': ['Este é o livro amarelo! 📒', 'É o Livro de Atividades.'],
    'hi-mapa': ['É o mapa do museu! 🗺️', 'Você está aqui, no hall.', 'Em cima, as três galerias.',
      'Depois delas, as oficinas.'],
    'hi-bebedouro': ['Um golinho de água? 💧', 'Descanse os olhos um pouco.'],
    'hi-caixinha': ['Uma caixinha de lembranças. 🐚', 'Cada objeto tem uma história.'],
    'hi-brinquedos': ['Brinquedos de antigamente! 🪀', 'As crianças brincavam com eles.'],
    // galeria do capítulo 10
    'hi-leite': ['Garrafas de leite fresquinho! 🥛', 'O leite vem da vaca, no sítio.', 'Muita gente trabalha nele!'],
    'hi-vassoura': ['Uma vassoura e uma pazinha! 🧹', 'Em casa, cada um ajuda.'],
    // galeria do capítulo 11
    'hi-camera': ['Uma câmera bem antiga! 📷', 'O fotógrafo usava um pano preto.'],
    'hi-telefone': ['Um telefone antigo! ☎️', 'A telefonista ligava as chamadas.'],
    'hi-lampiao': ['Um lampião de antigamente!', 'Alguém acendia um por um.'],
    // galeria do capítulo 12
    'hi-lixeiras': ['As lixeiras da coleta seletiva!', 'Azul é papel, vermelha é plástico.', 'Verde é vidro, amarela é metal.'],
    'hi-muda': ['Uma mudinha de árvore! 🌱', 'Plantar árvores ajuda a natureza.'],
    // oficinas
    'hi-panelas': ['Panelas de barro! 🏺', 'Feitas à mão, com muito trabalho.'],
    'hi-roupas': ['Roupas feitas pelo costureiro! 🧵', 'Costurar é uma profissão.'],
    'hi-regador': ['Um regador para a horta! 💧', 'Cuidar das plantas é trabalho.'],
  },
});
