/* Torre do Relógio: tudo o que os personagens e os objetos dizem (gravado com a voz de cada um). */
Reino.FALAS_INTERIORES = Reino.FALAS_INTERIORES || {};
Reino.FALAS_INTERIORES.torre = {
  npcs: {
    // guia do térreo (o convite é o resumo automático do motor)
    ponteiro: {
      oi: ['Tic-tac! Sou o Seu Ponteiro. ⏰', 'Cada andar tem uma sala.'],
    },
    // andar 1: «Living Together»
    ben: {
      oi: ['«Hello!» Eu sou o «Coach Ben».', 'Regras ajudam a viver juntos!'],
      nova: ['Vamos ver as regras juntos?', 'Quer jogar limpo comigo? ⚽'],
      feita: ['Quer rever as regras comigo?', 'Vamos treinar de novo juntos?'],
      depois: ['Você leu com muita calma! 🏆', '«Good job!» Que time lindo, hein!'],
    },
    // andar 2: «Here Comes the Sun»
    stella: {
      oi: ['«Hello!» Eu sou a «Miss Stella».', 'O sol é uma estrela! ☀️'],
      nova: ['Vamos olhar o céu juntas?', 'Quer conhecer os planetas?'],
      feita: ['Quer ver os planetas de novo?', 'Vamos olhar o sol outra vez?'],
      depois: ['Você olhou tudo com calma! ✨', '«Amazing!» Que viagem linda!'],
    },
    // andar 3: «I Brush My Teeth Every Day»
    smile: {
      oi: ['«Hi!» Eu sou o «Doctor Smile».', 'Escovo os dentes todo dia! 🪥'],
      nova: ['Vamos cantar a rotina juntos?', 'Quer escovar os dentes comigo?'],
      feita: ['Quer cantar a rotina de novo?', 'Vamos revisar a rotina juntos?'],
      depois: ['Que sorriso lindo e limpinho! 😁', 'Você cantou com muita calma!'],
    },
    // andar 4: «A Day in My Life»
    moon: {
      oi: ['«Hello!» Eu sou a «Miss Moon».', 'Cuido do dia, do sol à lua. 🌙'],
      nova: ['Vamos contar o dia do David?', 'Quer ver a manhã e a noite?'],
      feita: ['Quer rever o dia do David?', 'Vamos ver a rotina de novo?'],
      depois: ['Você leu com muita atenção! ✨', '«Great!» Que dia bem contado!'],
    },
    // andar 5: «If You're Happy, Clap Your Hands»
    joy: {
      oi: ['«Hi!» Eu sou o «Mister Joy».', 'Todo sentimento é normal! 🎵'],
      nova: ['Vamos cantar e bater palmas?', 'Quer falar dos sentimentos?'],
      feita: ['Quer cantar a música de novo?', 'Vamos bater palmas outra vez?'],
      depois: ['Você cantou com o coração! 💛', '«I\'m happy!» E você também?'],
    },
  },
  objetos: {
    // térreo
    'livro': ['O Livro das Palavras! 📖', 'Vamos ler com calma?'],
    'andares': ['A torre tem cinco andares.', 'São 5 salas, uma por andar. 🗼', 'Suba a escada sem pressa.'],
    'engrenagens': ['Engrenagens do relógio! ⚙️', 'Uma gira a outra, sem pressa.'],
    'relogio-grande': ['O relógio faz tic-tac! 🕰️', 'Lá no alto mora o relógio.'],
    // andar 1
    'regras-escola': ['«Raise your hand!»', 'Levante a mão para falar. ✋'],
    'regras-casa': ['«Put your toys away!»', 'Guarde os seus brinquedos.'],
    'torcida': ['«Cheer for your team!»', 'Torça pelo seu time! 📣'],
    'trave': ['«Play a fair game!»', 'No esporte, jogue limpo! ⚽'],
    // andar 2
    'sol': ['«The sun is a star.»', 'O sol é uma estrela! ☀️'],
    'planetas': ['São oito planetas! 🪐', '«Earth» é o terceiro planeta.'],
    'arte': ['As formas da arte! 🎨', '«Circle», «square», «triangle»!', '«Circle» é o círculo.'],
    'luneta': ['Uma luneta para ver o céu! 🔭', 'Ela mostra as estrelas! ⭐'],
    'relogio-sol': ['É um relógio de sol! ☀️', '«Sundial» é o relógio de sol.', 'A sombra mostra a hora.'],
    'protetor': ['É o protetor solar! 🧴', '«Sunscreen» é o protetor solar.', 'Ele protege a nossa pele.'],
    // andar 3
    'toalhas': ['Toalhas para depois do banho!', '«Have a shower» é tomar banho.'],
    'sorriso': ['«I brush my teeth every day.»', 'Eu escovo os dentes todo dia.'],
    'pia': ['A pia com água fresquinha! 💧', '«Brush» quer dizer escovar.'],
    'escova': ['Uma escova gigante! 🪥', '«Get up» quer dizer levantar.', '«Go to bed» é ir dormir.'],
    // andar 4
    'rotina': ['O dia, do sol até a lua! 🌙', '«Morning» quer dizer manhã.', '«Afternoon» quer dizer tarde.', '«Night» quer dizer noite.'],
    'cama': ['Uma cama bem fofinha! 💤', '«Go to bed» é ir dormir.'],
    'licao': ['A lição de casa! ✏️', '«Homework» é a lição de casa.'],
    'lanche': ['A mesa do almoço! 🍎', '«Lunch» quer dizer almoço.'],
    // andar 5
    'carinhas': ['«Happy», «sad», «angry»!', '«Sleepy», «bored», «excited»!', 'Todo sentimento é normal. 💛'],
    'piano': ['Um piano colorido! 🎹', '«Clap your hands!»', 'Bata palmas bem feliz!'],
    'pandeiro': ['Um pandeiro alegre! 🎵', '«Stamp your foot!»', 'Bata o pé no chão!'],
    // no alto
    'mostrador': ['O mostrador visto por dentro!', 'Os ponteiros giram devagar.'],
    'pendulo': ['O pêndulo vai e volta.', 'Tic, tac, sempre com calma.'],
    'engrenagem-grande': ['A engrenagem gigante! ⚙️', 'Ela faz os ponteiros girarem.'],
    'sino': ['O sino da torre! 🔔', 'Ele toca na hora certa.'],
  },
};
