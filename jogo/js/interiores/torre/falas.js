/* Torre do Relógio do English (4º bimestre): o que os personagens e os objetos dizem (gravado com a voz de cada um,
   pacote interior-torre). Cada página com até 30 letras (sem contar «» e emoji) e frases de 3+ palavras; inglês
   entre « e ». As estações das salas falam a página e o nome da sala (gerado em torre/torre.js a partir dos dados).
   As falas do 3º bimestre estão em arquivo/terceiro-bimestre/jogo/js/interiores/torre/falas.js. */
Reino.falasDoPredio('torre', {
  npcs: {
    // o guia do saguão (o convite é o resumo automático do motor)
    ponteiro: {
      oi: ['Tic-tac! Sou o Seu Ponteiro. ⏰', 'Aqui mora o livro de «English»!', 'Cada andar tem um capítulo. 🗼'],
      depois: ['Suba a escada sem pressa! ✨'],
    },
    // andar 1: English, capítulo 10 «If You're Happy, Clap Your Hands» (sentimentos)
    joy: {
      oi: ['«Hi!» Eu sou o «Mister Joy».', 'Aqui falamos de sentimentos. 💛'],
      nova: ['Vamos cantar e bater palmas?', '«How do you feel today?»'],
      depois: ['Você cantou com o coração! 💛', '«I\'m happy!» E você também?'],
    },
    // andar 2: English, capítulo 11 «I Dance When I'm Happy!» (ações, abrigo de animais e alfabeto)
    ben: {
      oi: ['«Hello!» Eu sou o «Coach Ben».', 'Eu danço quando estou feliz!'],
      nova: ['Vamos pular e dançar {juntas|juntos}?', 'Você conhece o Pingo? 🐶'],
      depois: ['«Good job!» Que time lindo, hein!', '«I dance when I\'m happy!»'],
    },
    // andar 3: English, capítulo 12 «Book Time» (tempo, roupas, tempo livre e rotina)
    stella: {
      oi: ['«Hello!» Eu sou a «Miss Stella».', 'Hoje é dia de ler um livro! 📖'],
      nova: ['Faz sol ou chove hoje? ☀️', 'Que roupa vamos vestir hoje?'],
      depois: ['Você olhou tudo com calma! ✨', '«Amazing!» Que leitura linda!'],
    },
    // andar 4: Projetos, capítulo 11 «Be Kind!» (diferenças, empatia e gentileza)
    moon: {
      oi: ['«Hello!» Eu sou a «Miss Moon».', 'Aqui todo mundo é gentil. 💖'],
      nova: ['Vamos ser gentis {juntas|juntos}?', 'Ser diferente é muito bonito!'],
      depois: ['Você tem um coração gentil! 💖', '«You are a good friend!»'],
    },
    // andar 5: Projetos, capítulo 12 «I Have a Healthy Diet!» (comida, de onde ela vem e gráficos)
    smile: {
      oi: ['«Hi!» Eu sou o «Doctor Smile».', 'Comida boa nos deixa fortes!'],
      nova: ['De onde vem a nossa comida?', '«Milk comes from cows.»'],
      depois: ['Que escolha mais saudável! 🍎', 'Beba água todos os dias! 💧'],
    },
  },
  objetos: {
    // térreo
    'livro-english': ['O livro de «English»! 📔', 'São os capítulos 10, 11 e 12.'],
    'livro-projetos': ['O livro dos Projetos! 📖', 'São os capítulos 11 e 12.'],
    'andares': ['A torre tem cinco andares.', 'Um capítulo em cada andar. 🗼', 'Suba a escada sem pressa.'],
    'engrenagens': ['Engrenagens do relógio! ⚙️', 'Uma gira a outra, sem pressa.'],
    'relogio-grande': ['O relógio faz tic-tac! 🕰️', 'Lá no alto mora o relógio.'],
    // andar 1
    'carinhas': ['«Happy», «sad», «angry»!', '«Sleepy», «bored», «excited»!', 'Todo sentimento é normal. 💛'],
    'piano': ['Um piano colorido! 🎹', '«Clap your hands!»', 'Bata palmas bem feliz!'],
    'pandeiro': ['Um pandeiro alegre! 🎵', '«Stamp your foot!»', 'Bata o pé no chão!'],
    // andar 2
    'alfabeto': ['Um cartaz com o alfabeto! 🔤', '«Now I know my ABCs!»'],
    'trave': ['Uma trave de futebol! ⚽', '«Jump» quer dizer pular.', '«Dance» quer dizer dançar.'],
    'casinha': ['A casinha do cachorrinho! 🐶', '«Puppy» quer dizer filhote.', '«Vet» é a veterinária.'],
    // andar 3
    'rotina': ['O dia, do sol até a lua! 🌙', '«Morning» quer dizer manhã.', '«Afternoon» quer dizer tarde.', '«Night» quer dizer noite.'],
    'cama': ['Uma cama bem fofinha! 💤', '«Go to bed» é ir dormir.'],
    'roupas': ['Roupas para o frio e o calor!', '«Coat» quer dizer casaco.', '«Hat» quer dizer chapéu.'],
    'protetor': ['É o protetor solar! 🧴', '«It\'s sunny!» Hoje faz sol!'],
    // andar 4
    'amigos': ['Somos todos diferentes!', 'E somos todos amigos! 💖'],
    'gentileza': ['A caixa da gentileza! 🎁', 'Ponha um bilhete gentil nela.'],
    'brinquedos': ['Uma caixa de brinquedos! 🧸', 'Dividir brinquedos é gentil.'],
    // andar 5
    'grafico': ['Um gráfico das comidas!', 'A coluna mais alta ganhou!'],
    'salada': ['Uma salada bem colorida! 🥗', '«Vegetables» são os legumes.'],
    'horta': ['A comida vem da terra! 🥕', '«Fruits come from trees.»', 'As frutas vêm das árvores.'],
    'pia': ['A pia com água fresquinha! 💧', 'Lave as mãos antes de comer.'],
    // no alto
    'mostrador': ['O mostrador visto por dentro!', 'Os ponteiros giram devagar.'],
    'pendulo': ['O pêndulo vai e volta.', 'Tic, tac, sempre com calma.'],
    'engrenagem-grande': ['A engrenagem gigante! ⚙️', 'Ela faz os ponteiros girarem.'],
    'sino': ['O sino da torre! 🔔', 'Ele toca na hora certa.'],
  },
});
