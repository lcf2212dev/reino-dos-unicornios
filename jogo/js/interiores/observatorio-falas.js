/* Observatório: tudo o que a Doutora Vega, o Robô Cosmo e os objetos dizem (gravado com a voz de cada um),
   as curiosidades do espaço (cada uma conferida numa fonte oficial, com a URL no comentário) e as piadas
   do Cosmo. Cada página é uma frase inteira com até 30 letras (sem contar «» e emoji) e 3+ palavras.
   Sem DOM no carregamento: ferramentas/listar-falas.js e validar-interiores.js carregam este arquivo num vm.

   Reino.Observatorio sorteia sem repetir na sessão (a memória fica só aqui, nada vai para o save). */
(function () {
  var R = window.Reino;
  R.FALAS_INTERIORES = R.FALAS_INTERIORES || {};

  var OBS = R.FALAS_INTERIORES.observatorio = {
    npcs: {
      // a astrônoma, guia do Observatório: conta curiosidades (voz npc-vega)
      vega: {
        oi: ['Olá, eu sou a Doutora Vega! 🔭', 'Eu estudo as estrelas do céu.'],
        nova: ['Quer ouvir uma curiosidade? ✨', 'Vamos descobrir o céu juntas?', 'Tenho um segredo do espaço!'],
        depois: ['Volte para olhar o céu! 🌙', 'O céu tem muitos segredos.', 'Até logo, pequena astrônoma! ⭐'],
      },
      // o ajudante engraçado: conta piadas (voz npc-cosmo, com efeito de robô)
      cosmo: {
        oi: ['Bip bop, eu sou o Robô Cosmo! 🤖', 'Minha bateria está feliz!'],
        nova: ['Quer ouvir uma piada, bip bop?', 'Carreguei uma piada nova!', 'Processando uma piada boa!'],
        depois: ['Minha bateria riu muito, bip!', 'Tchau, tchau, meu bip bop!', 'Volte logo, bip bop, bip bop!'],
      },
    },

    // falas curtas dos objetos sem ação (voz narradora), se o interior quiser
    objetos: {
      'telescopio': 'O telescópio do Observatório! Ele mostra o céu de pertinho.',
      'foguete': 'Um foguete pronto para voar! Ele sobe até o espaço.',
      'traje': 'Um traje de astronauta! Ele protege quem vai ao espaço.',
      'pedra-lua': 'Uma pedra que veio da Lua! Astronautas trouxeram de lá.',
      'meteorito': 'Um meteorito de verdade! Ele caiu do espaço na Terra.',
      'mapa-constelacoes': 'O mapa das constelações! Ligue as estrelas com os olhos.',
    },

    // nomes para placas e balões (Plutão é planeta-anão)
    nomes: {
      sol: 'Sol', mercurio: 'Mercúrio', venus: 'Vênus', terra: 'Terra', marte: 'Marte',
      jupiter: 'Júpiter', saturno: 'Saturno', urano: 'Urano', netuno: 'Netuno',
      plutao: 'Plutão, o planeta-anão', lua: 'Lua',
      telescopio: 'Telescópio', foguete: 'Foguete', traje: 'Traje de astronauta',
      'pedra-lua': 'Pedra da Lua', meteorito: 'Meteorito', 'mapa-constelacoes': 'Mapa das constelações',
    },

    // nomes dos temas (para botões ou títulos, se o interior quiser)
    nomesTemas: {
      sol: 'Sol', lua: 'Lua', mercurio: 'Mercúrio', venus: 'Vênus', terra: 'Terra', marte: 'Marte',
      jupiter: 'Júpiter', saturno: 'Saturno', urano: 'Urano', netuno: 'Netuno', plutao: 'Plutão',
      estrelas: 'Estrelas', constelacoes: 'Constelações', astronautas: 'Astronautas',
      foguetes: 'Foguetes', cometas: 'Cometas', galaxias: 'Galáxias',
    },

    curiosidades: [
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-sun/en/ */
      { id: 'sol-estrela', tema: 'sol', paginas: ['O Sol é uma estrela!', 'É uma bola de gás quentinha.', 'Ela brilha lá no céu.'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-sun/en/ */
      { id: 'sol-largo', tema: 'sol', paginas: ['Imagine cem Terras em fila.', 'O Sol é largo desse jeito!'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-moon/en/ */
      { id: 'lua-espelho', tema: 'lua', paginas: ['A Lua não tem luz própria.', 'Ela reflete a luz do Sol.', 'Parece um espelho no céu!'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-moon/en/ */
      { id: 'lua-primeiros-passos', tema: 'lua', paginas: ['Astronautas já foram à Lua!', 'Andaram na poeira de lá.', 'Que passeio mais incrível!'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-mercury/en/ */
      { id: 'mercurio-pequeno', tema: 'mercurio', paginas: ['Mercúrio é o menor planeta.', 'Ele mora pertinho do Sol.'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-mercury/en/ */
      { id: 'mercurio-ano', tema: 'mercurio', paginas: ['Em Mercúrio, o ano é curto!', 'Dura oitenta e oito dias.'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-venus/en/ */
      { id: 'venus-quente', tema: 'venus', paginas: ['Vênus é o planeta mais quente.', 'Mais quente até que Mercúrio!'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-venus/en/ */
      { id: 'venus-contrario', tema: 'venus', paginas: ['Vênus gira ao contrário!', 'Lá o Sol nasce no oeste.'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-earth/en/ */
      { id: 'terra-vida', tema: 'terra', paginas: ['A Terra é o terceiro planeta.', 'É o único com vida conhecida.', 'Tem plantas, bichos e você!'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-earth/en/ */
      { id: 'terra-agua', tema: 'terra', paginas: ['A Terra tem muita água!', 'A água cobre mais que o chão.'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-mars/en/ */
      { id: 'marte-ferrugem', tema: 'marte', paginas: ['Marte é o planeta vermelho.', 'O chão dele tem ferrugem!'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-mars/en/ */
      { id: 'marte-robos', tema: 'marte', paginas: ['Tem robôs passeando em Marte!', 'Eles tiram fotos de lá.'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-jupiter/en/ */
      { id: 'jupiter-gigante', tema: 'jupiter', paginas: ['Júpiter é o maior planeta.', 'Ele é feito quase só de gás.'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-jupiter/en/ */
      { id: 'jupiter-mancha', tema: 'jupiter', paginas: ['Júpiter tem mancha vermelha.', 'É uma tempestade gigante!', 'Ela é maior que a Terra.'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-saturn/en/ */
      { id: 'saturno-aneis', tema: 'saturno', paginas: ['Saturno tem anéis lindos.', 'Eles são de gelo e de rocha!'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-saturn/en/ */
      { id: 'saturno-gas', tema: 'saturno', paginas: ['Saturno é uma bola de gás.', 'Igualzinho a Júpiter!'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-uranus/en/ */
      { id: 'urano-deitado', tema: 'urano', paginas: ['Urano gira deitado de lado!', 'Nenhum outro planeta faz isso.'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-uranus/en/ */
      { id: 'urano-azul', tema: 'urano', paginas: ['Urano tem uma cor azulada.', 'Um gás do ar dele faz isso.'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-neptune/en/ */
      { id: 'netuno-longe', tema: 'netuno', paginas: ['Netuno é o oitavo planeta.', 'É o mais longe do Sol!'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-neptune/en/ */
      { id: 'netuno-vento', tema: 'netuno', paginas: ['Netuno é azul e tem vento.', 'Lá venta muito, muito forte!'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/ice-dwarf/en/ */
      { id: 'plutao-anao', tema: 'plutao', paginas: ['Plutão é um planeta-anão.', 'Ele mora bem longe do Sol.'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/ice-dwarf/en/ */
      { id: 'plutao-coracao', tema: 'plutao', paginas: ['Plutão tem um coração claro!', 'É uma mancha no chão dele.'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-sun/en/ */
      { id: 'estrelas-vizinha', tema: 'estrelas', paginas: ['O Sol é a estrela mais perto.', 'A vizinha se chama Próxima.', 'É um nome bem engraçado!'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/review/cosmic-colors/hubble.html */
      { id: 'estrelas-piscam', tema: 'estrelas', paginas: ['Por que a estrela pisca?', 'A luz dela passa pelo ar.', 'O ar mexe, e a luz balança!'] },

      /* fonte: Agência Espacial Brasileira — https://www.gov.br/aeb/pt-br/centrais-de-conteudo/publicacoes/instagram-do-periodo-de-defeso-eleitoral-2022/curiosidades-do-espaco-bandeira-nacional-e-constelacoes */
      { id: 'constelacoes-bandeira', tema: 'constelacoes', paginas: ['Olhe a bandeira do Brasil!', 'Tem o Cruzeiro do Sul nela.', 'São estrelas do nosso céu!'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/constellations/en/ */
      { id: 'constelacoes-ligar', tema: 'constelacoes', paginas: ['Ligue as estrelas com linhas.', 'Surge um bicho ou uma pessoa!', 'Isso é uma constelação.'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/constellations/en/ */
      { id: 'constelacoes-lugar', tema: 'constelacoes', paginas: ['Cada lugar vê um céu.', 'No Brasil vemos o Cruzeiro.'] },

      /* fonte: NASA — https://www.nasa.gov/history/space-station-20th-space-flight-participants/ */
      { id: 'astronautas-marcos-pontes', tema: 'astronautas', paginas: ['Marcos Pontes foi ao espaço!', 'Foi o primeiro brasileiro lá!', 'Foi em dois mil e seis.'] },
      /* fonte: NASA — https://www.nasa.gov/history/space-station-20th-space-flight-participants/ */
      { id: 'astronautas-estacao', tema: 'astronautas', paginas: ['Marcos Pontes foi à Estação!', 'Lá ele fez experiências.'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/launching-into-space/en/ */
      { id: 'foguetes-empurrao', tema: 'foguetes', paginas: ['O foguete joga gás para baixo.', 'E ele vai para cima!', 'É um empurrão bem forte.'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/comets/en/ */
      { id: 'cometas-gelo', tema: 'cometas', paginas: ['O cometa é feito de gelo.', 'Tem poeira misturada também.'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/comets/en/ */
      { id: 'cometas-cauda', tema: 'cometas', paginas: ['O cometa tem uma cauda.', 'Ela aponta para longe do Sol.', 'O Sol empurra a cauda!'] },

      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/galaxy/en/ */
      { id: 'galaxias-via-lactea', tema: 'galaxias', paginas: ['Nós moramos na Via Láctea.', 'Ela é uma galáxia enorme!'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/galaxy/en/ */
      { id: 'galaxias-cata-vento', tema: 'galaxias', paginas: ['A Via Láctea tem braços.', 'Parece um cata-vento!'] },
      /* fonte: NASA Space Place — https://spaceplace.nasa.gov/galaxy/en/ */
      { id: 'galaxias-bilhoes', tema: 'galaxias', paginas: ['Uma galáxia tem muita estrela.', 'São bilhões de estrelas!'] },
    ],

    // piadas gentis do Robô Cosmo (pergunta e resposta; ninguém é alvo)
    piadas: [
      { id: 'lua-cheia', paginas: ['Por que a Lua não tem fome?', 'Porque ela já está cheia!'] },
      { id: 'estrela-estuda', paginas: ['Por que a estrela estuda?', 'Para ficar mais brilhante!'] },
      { id: 'saturno-vaidoso', paginas: ['Qual é o planeta vaidoso?', 'Saturno, cheio de anéis!'] },
      { id: 'lua-obrigada', paginas: ['O que a Lua disse ao Sol?', 'Obrigada pela luz emprestada!'] },
      { id: 'astronauta-calmo', paginas: ['Por que o astronauta é calmo?', 'Porque ele tem muito espaço!'] },
      { id: 'robo-chips', paginas: ['Qual é o lanche do robô?', 'Batata chips, bip bop!'] },
      { id: 'terra-fofa', paginas: ['Qual é o planeta mais fofo?', 'A Terra, porque tem você!'] },
      { id: 'cometa-penteado', paginas: ['Qual é o penteado do cometa?', 'Um rabo de cavalo brilhante!'] },
      { id: 'terra-abraco', paginas: ['O que a Terra deu para a Lua?', 'Um abraço bem apertado!'] },
      { id: 'robo-escuro', paginas: ['O que o robô faz no escuro?', 'Acende os olhos de lanterna!'] },
      { id: 'estrela-robo', paginas: ['O que a estrela disse ao robô?', 'Você também é brilhante!'] },
      { id: 'foguete-alegre', paginas: ['Como o foguete fica alegre?', 'Ele dá um pulo até o céu!'] },
      { id: 'robo-danca', paginas: ['Qual é a dança do robô?', 'A dança do robô, bip bop!'] },
      { id: 'robo-memoria', paginas: ['Onde o robô guarda piadas?', 'Na memória de risadas, bip!'] },
    ],

    extras: [],
  };

  // ---- extras: cada página falada fora do balão do NPC (curiosidades: Vega; piadas: Cosmo) ----
  // montado aqui no fim, depois das listas; o orquestrador acrescenta curiosidades acima.
  (function montarExtras() {
    var vistos = {};
    function add(texto, voz) {
      var k = voz + '|' + texto;
      if (vistos[k]) return;
      vistos[k] = true;
      OBS.extras.push({ texto: texto, voz: voz });
    }
    OBS.curiosidades.forEach(function (c) { c.paginas.forEach(function (p) { add(p, 'npc-vega'); }); });
    OBS.piadas.forEach(function (pd) { pd.paginas.forEach(function (p) { add(p, 'npc-cosmo'); }); });
  })();

  // ---- sorteio sem repetir na sessão ----
  var vistas = {};        // id da curiosidade → true (já contada nesta sessão)
  var ultimaCur = null;   // id da última curiosidade contada
  var piadasVistas = {};
  var ultimaPiada = null;

  function sortear(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function copia(o) {
    var c = {};
    Object.keys(o).forEach(function (k) { c[k] = Array.isArray(o[k]) ? o[k].slice() : o[k]; });
    return c;
  }

  // escolhe da lista sem repetir; esgotou: zera só a memória dessa lista (sem repetir a última)
  function escolher(lista, memoria, ultima) {
    if (!lista.length) return null;
    var livres = lista.filter(function (x) { return !memoria[x.id]; });
    if (!livres.length) {
      lista.forEach(function (x) { delete memoria[x.id]; });
      livres = lista.length > 1 ? lista.filter(function (x) { return x.id !== ultima; }) : lista.slice();
    }
    var e = sortear(livres);
    memoria[e.id] = true;
    return e;
  }

  R.Observatorio = {
    // temas que têm pelo menos uma curiosidade, na ordem da lista
    temas: function () {
      var out = [];
      OBS.curiosidades.forEach(function (c) { if (out.indexOf(c.tema) < 0) out.push(c.tema); });
      return out;
    },
    // tema 'todas' (ou vazio) = qualquer uma; a memória é a mesma para todos os temas
    curiosidade: function (tema) {
      var lista = (!tema || tema === 'todas') ? OBS.curiosidades
        : OBS.curiosidades.filter(function (c) { return c.tema === tema; });
      var e = escolher(lista, vistas, ultimaCur);
      if (!e) return null;
      ultimaCur = e.id;
      return copia(e);
    },
    piada: function () {
      var e = escolher(OBS.piadas, piadasVistas, ultimaPiada);
      if (!e) return null;
      ultimaPiada = e.id;
      return copia(e);
    },
    // só para testes: zera a memória da sessão
    reiniciar: function () { vistas = {}; ultimaCur = null; piadasVistas = {}; ultimaPiada = null; },
  };
})();
