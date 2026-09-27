/* Mariana e o Reino dos Unicórnios — configuração (só DADOS: é aqui que se troca o PIN, os valores etc.).
   Números que dá para mudar: estão comentados ao lado de cada bloco. Depois de mudar, peça ao Claude para republicar.
   Scripts clássicos (sem módulos) para funcionar abrindo o arquivo direto.
   As utilidades comuns (Reino.util) estão em js/nucleo/util.js; o registro das matérias e das provas,
   em js/nucleo/registros.js. */
window.Reino = window.Reino || {};

Reino.config = {
  nomeJogadora: 'Mariana',
  valorPorMateria: 20,        // R$ por matéria revisada: cada sala vale um valor redondo (R$ 0,50 em R$ 0,50) e a sobra é bônus ao completar
  medalhaEscolaValor: 100,    // prêmio da medalha de ouro da prova real
  pinPais: '2026',            // troque aqui o PIN da Área dos Pais
  desafiosPorSala: 6,
  perguntasTreino: 10,
  // provas bimestrais (Escola do Reino): o acessório só vem com esta nota ou mais.
  // 10 = acertar tudo. Tentativa 1 → lendário, 2 → raro, depois → comum.
  notaSucessoProva: 10,
  // caminho da persistência: jogar várias vezes também faz nascer o raro/épico.
  // sala: vezes jogando a sala → raro; treinoOuro / treinoPerfeito: treinos terminados → cada um dos 2 épicos
  persistencia: { sala: 3, treinoOuro: 3, treinoPerfeito: 5 },
  chaveSave: 'mariana-reino-v1', // NÃO troque: é onde mora o progresso da Mariana em cada aparelho
  // jogadores (js/sistemas/jogadores.js, docs/contratos/save-e-mescla.md §12): login de loginMin a loginMax letras
  // (minúsculas, números, - e _; o servidor de casa confere 2 a 20), senha de senhaMin a senhaMax (texto, sem segurança).
  // NÃO troque o prefixoSave: é onde mora o progresso de cada outro jogador ('reino-v1-<login>')
  jogadores: { loginMin: 2, loginMax: 20, senhaMin: 3, senhaMax: 30, prefixoSave: 'reino-v1-' },
  // fome e sede da montaria (js/sistemas/cuidados.js): só gastam com o jogo aberto e ela jogando.
  // 100 = satisfeito. Abaixo de `baixo`, ela anda a `fatorLento` da velocidade até comer/beber.
  cuidados: {
    minutosFome: 120,          // de 100 a 0 em 120 minutos de jogo
    minutosSede: 60,           // de 100 a 0 em 60 minutos de jogo
    minutosBanho: 180,         // banho: de 100 (limpinho) a 0 em 180 minutos de jogo (sujinho não fica lento)
    baixo: 25,                 // abaixo disso aparece o aviso (fome/sede: fica lenta; banho: só sujinho)
    fatorLento: 0.7,           // velocidade com fome ou sede baixa (70%)
    semToqueMs: 5 * 60 * 1000, // sem toque nem tecla há 5 minutos: parou de jogar, não gasta
    lembreteMs: 10 * 60 * 1000,// no máximo 1 lembrete do Claude a cada 10 minutos
    gravarMs: 60 * 1000,       // grava no máximo a cada 60 s...
    gravarPontos: 10,          // ...ou a cada 10 pontos de mudança (e sempre ao comer/beber). Melhor não mexer.
  },
  // comidas da Pet Shop (preço em estrelas; `fome` = quanto enche, 0 a 100; `enche` = vai a 100).
  // NÃO troque o `id`: a despensa guarda a comida por ele
  comidas: [
    { id: 'cenoura', nome: 'Cenoura crocante', icone: '🥕', preco: 2, fome: 20 },
    { id: 'maca', nome: 'Maçã do Reino', icone: '🍎', preco: 3, fome: 30 },
    { id: 'feno', nome: 'Feno dourado', icone: '🌾', preco: 4, fome: 45 },
    { id: 'biscoito', nome: 'Biscoito de aveia', icone: '🍪', preco: 5, fome: 60 },
    { id: 'bolo', nome: 'Bolo arco-íris', icone: '🎂', preco: 8, fome: 100, enche: true },
  ],
  // banho de espuma na Pet Shop (js/sistemas/banho.js): de graça, animação de ~6 s (curta ~1 s sem Animações);
  // depois de `pularDepoisMs`, um toque pula para o fim
  banho: { duracaoMs: 6000, duracaoCurtaMs: 1000, pularDepoisMs: 2000 },
  // fotos do jogo (js/sistemas/fotos.js): só no aparelho (IndexedDB 'reino-fotos'), nunca no save nem no servidor.
  // maxLado: px do lado maior; maxAlbum: fotos por aparelho; toqueLongoMs: segurar o 📷 abre o álbum.
  // NÃO troque o `banco`, senão o álbum parece vazio
  fotos: { maxLado: 1600, maxAlbum: 40, banco: 'reino-fotos', toqueLongoMs: 600 },
  // música por ambiente (js/sistemas/som.js + js/sistemas/musicas.js): volume; crossfadeS = segundos da troca;
  // comVoz = volume enquanto uma voz fala (30%). Melhor não mexer em lookaheadS e intervaloMs
  musica: { volume: 0.22, crossfadeS: 1.5, comVoz: 0.3, lookaheadS: 0.25, intervaloMs: 60 },
  // mapa da cidade (js/mundo/): o tamanho (56×42 tiles) e o traçado ficam em js/mundo/mapa.js e js/mundo/lugares.js.
  // contorno dourado do prédio de lugar concluído (js/mundo/contorno.js): espessura em px da linha forte;
  // o brilho pulsa entre brilhoMin e brilhoMax (0 a 1) a cada periodoMs; faiscas = quantas faíscas ao mesmo
  // tempo, cada uma acende e apaga em faiscaMs. Sem Animações: parado no meio do brilho, sem faíscas
  mapa: { contorno: { espessura: 3, brilhoMin: 0.65, brilhoMax: 1, periodoMs: 1800, faiscas: 5, faiscaMs: 900 } },
  // nadar no lago: fator = velocidade na água (60%); custo = quanto a água "pesa" no caminho (3: prefere a terra)
  nado: { fator: 0.6, custo: 3 },
  // controles de andar (js/motor/entrada.js e css/ui-hud.css): mouse segurado e thumbstick do toque
  controles: {
    limiarMouse: 6, limiarToque: 12, // px CSS: até aqui ainda é clique/toque rápido
    segurarMs: 300,                  // mouse parado segurando isso já segue o ponteiro
    zonaMorta: 10,                   // px CSS do thumbstick sem andar
    paraPerto: 6, voltaLonge: 12,    // px do jogo: mouse perto dela para (e só volta mais longe)
    folgaGraus: 10,                  // folga para virar entre as 8 direções (não pisca entre duas)
    base: 110, pino: 48,             // px do thumbstick no celular...
    baseTablet: 130, pinoTablet: 56, // ...e em tela a partir de 700×700
  },
  // Aura (js/sistemas/aura.js): cada pergunta certa soma `passo`, cada errada tira `passo` × `penalidade` (mínimo 0).
  // O passo começa em `passoInicial` e cresce × `multiplicador` a cada faixa: a 1ª faixa começa em `primeiraFaixa`
  // (10), a 2ª em 100, a 3ª em 1000… `cores`: a cor da aura em volta da Mariana em cada faixa (a última vale daí em
  // diante; 'arco-iris' = as cores passando). Se mudar os nomes das cores, regrave as vozes (o Claude fala a cor)
  aura: {
    passoInicial: 0.2, primeiraFaixa: 10, multiplicador: 10, penalidade: 2,
    cores: [
      { nome: 'branca', cor: '#ffffff' }, { nome: 'amarela', cor: '#ffe45c' }, { nome: 'verde', cor: '#6ee07a' },
      { nome: 'azul', cor: '#5cb8ff' }, { nome: 'roxa', cor: '#b57cff' }, { nome: 'rosa', cor: '#ff7ec4' },
      { nome: 'dourada', cor: '#ffb830' }, { nome: 'arco-íris', cor: 'arco-iris' },
    ],
  },
  // pergunta surpresa (js/sistemas/surpresa.js): de 3 a 10 minutos de jogo livre, vale 2 estrelas de primeira;
  // esperaLivreMs: livre e parada há isso antes de aparecer. Se mudar `estrelas`, regrave as vozes (o Claude fala o valor)
  surpresa: { minMinutos: 3, maxMinutos: 10, estrelas: 2, esperaLivreMs: 4000, tipos: ['escolha', 'vf', 'varias'] },
  // versão nova no servidor de casa (js/sistemas/versao.js): confere o js/versao.json a cada `intervaloMs` e ao
  // voltar para a aba; só acredita depois de ver a mudança 2 vezes (`confirmarMs` entre elas) e de `cacheMs` de
  // aba aberta (o servidor guarda css/js em cache por 300 s); parada no mapa há `paradaMs`, o Claude avisa num
  // balão de `avisoMs`, o jogo grava e recarrega `esperaMs` depois (depois do envio ao servidor, que sai em 1,8 s)
  novidadeDias: 45,   // dias em que o selo "✨ Novo!" aparece num lugar novo (lugar.novidade)
  versao: { intervaloMs: 10 * 60000, confirmarMs: 60000, cacheMs: 330000, paradaMs: 8000, avisoMs: 4500, esperaMs: 2500 },
  // acessórios das provas à venda na Loja (só depois de ganhar um da mesma prova)
  precoPremio: { comum: 25, raro: 40, lendario: 70 },
  // ouvir antes de seguir (Reino.Voz.falarEsperando + UI.esperarFala): enquanto a voz fala, os botões de seguir e de
  // sair ficam desabilitados. Teto da espera = letras × msPorLetra × folga (+250 ms por pedaço), entre minS e maxS
  // segundos: libera mesmo se o áudio travar. lerQuestoes: cada questão (sala, treino, prova) é lida sozinha ao
  // aparecer; resumoNaSala: as cartas do livro usadas pela sala aparecem (e são lidas) antes da 1ª questão
  esperaFala: { msPorLetra: 75, folga: 1.6, minS: 2, maxS: 30, lerQuestoes: true, resumoNaSala: true },
  // vozes naturais (gravadas por ferramentas/vozes/gerar-vozes.py). Trocou voz, velocidade ou tom: `npm run vozes`
  // (regrava) e peça para republicar
  vozes: {
    claude: { voz: 'pt-BR-AntonioNeural', velocidade: '-5%', tom: '+0Hz' },
    narradora: { voz: 'pt-BR-FranciscaNeural', velocidade: '-8%', tom: '+0Hz' },
    unicornio: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+0%', tom: '+25Hz' },
    // trechos «em inglês»: inglês britânico (como a apostila), claro e um pouco devagar
    ingles: { voz: 'en-GB-SoniaNeural', velocidade: '-15%', tom: '+0Hz' },

    /* Personagens das construções (elenco em js/personagens/elenco.js): um perfil por personagem, 'npc-<id>'.
       Cada um com voz/velocidade/tom diferentes para ser reconhecido de ouvido.
       `ingles`: perfil dos trechos «em inglês» dessa personagem (padrão: 'ingles'). */
    // Museu das Memórias (História)
    'npc-memoria': { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '-16%', tom: '-12Hz' }, // curadora idosa, calma (diferente da narradora dos objetos)
    'npc-antonio': { voz: 'fr-FR-RemyMultilingualNeural', velocidade: '-14%', tom: '-12Hz' },   // senhor das cartas: devagar, de avô
    'npc-chico': { voz: 'pt-BR-AntonioNeural', velocidade: '+12%', tom: '+16Hz' },             // carteiro animado (voz nativa: as multilíngues embolavam as frases curtas)
    'npc-taina': { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+6%', tom: '+6Hz' },    // guia jovem e alegre
    'npc-contadeira': { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '-18%', tom: '-12Hz' }, // griô: devagar, voz de contar história
    'npc-nina': { voz: 'en-US-AvaMultilingualNeural', velocidade: '+6%', tom: '+12Hz' },         // restauradora curiosa e leve
    // Torre do Relógio (Inglês)
    'npc-ponteiro': { voz: 'it-IT-GiuseppeMultilingualNeural', velocidade: '-10%', tom: '-6Hz' }, // relojoeiro caprichoso, sotaque de avô italiano
    'npc-ben': { voz: 'en-US-AndrewMultilingualNeural', velocidade: '+6%', tom: '+4Hz', ingles: 'npc-ben-en' },     // técnico esportivo, energia
    'npc-ben-en': { voz: 'en-US-AndrewMultilingualNeural', velocidade: '-4%', tom: '+4Hz' },
    'npc-stella': { voz: 'en-US-AvaMultilingualNeural', velocidade: '+0%', tom: '+6Hz', ingles: 'npc-stella-en' },  // astrônoma encantada
    'npc-stella-en': { voz: 'en-US-AvaMultilingualNeural', velocidade: '-10%', tom: '+6Hz' },
    'npc-smile': { voz: 'en-US-BrianMultilingualNeural', velocidade: '+0%', tom: '+8Hz', ingles: 'npc-smile-en' },  // dentista sorridente
    'npc-smile-en': { voz: 'en-US-BrianMultilingualNeural', velocidade: '-10%', tom: '+8Hz' },
    'npc-moon': { voz: 'en-US-AvaMultilingualNeural', velocidade: '-15%', tom: '-8Hz', ingles: 'npc-moon-en' },     // voz de boa-noite, bem calminha
    'npc-moon-en': { voz: 'en-US-AvaMultilingualNeural', velocidade: '-20%', tom: '-8Hz' },
    'npc-joy': { voz: 'en-AU-WilliamMultilingualNeural', velocidade: '+4%', tom: '+10Hz', ingles: 'npc-joy-en' },   // músico feliz
    'npc-joy-en': { voz: 'en-AU-WilliamMultilingualNeural', velocidade: '-6%', tom: '+10Hz' },
    // Castelo da Medalha
    'npc-serena': { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '-6%', tom: '+10Hz' },  // princesa gentil e elegante
    'npc-aurora': { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '+4%', tom: '-10Hz' }, // cavaleira firme e corajosa
    'npc-oliver': { voz: 'en-US-BrianMultilingualNeural', velocidade: '-12%', tom: '-12Hz', ingles: 'npc-oliver-en' }, // cavaleiro nobre, grave
    'npc-oliver-en': { voz: 'en-US-BrianMultilingualNeural', velocidade: '-20%', tom: '-12Hz' },
    // Escola do Reino
    'npc-margarida': { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '-12%', tom: '-14Hz' }, // diretora serena e firme (voz diferente da Teacher Emma, no mesmo prédio)
    'npc-helena': { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '+6%', tom: '-6Hz' },   // professora clara e animada
    'npc-emma': { voz: 'en-US-EmmaMultilingualNeural', velocidade: '-3%', tom: '+2Hz', ingles: 'npc-emma-en' },      // professora de inglês
    'npc-emma-en': { voz: 'en-US-EmmaMultilingualNeural', velocidade: '-12%', tom: '+2Hz' },
    // Estábulo, Loja e Baú
    'npc-feno': { voz: 'de-DE-FlorianMultilingualNeural', velocidade: '-8%', tom: '-14Hz' },     // tratador tranquilo, voz grave
    'npc-petala': { voz: 'en-US-EmmaMultilingualNeural', velocidade: '+8%', tom: '+30Hz' },       // fada: aguda e rápida
    'npc-tostao': { voz: 'ko-KR-HyunsuMultilingualNeural', velocidade: '+10%', tom: '+22Hz' },    // dragãozinho: agudo e engraçado
    // Pet Shop e Observatório
    'npc-aveia': { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '+8%', tom: '+10Hz' },  // dona da Pet Shop: alegre e carinhosa
    // astrônoma calma: voz brasileira nativa (as multilíngues trocavam "Plutão" por "botão" e embolavam "Via Láctea"),
    // bem mais grave (~3 semitons) e um pouco mais rápida que a narradora, para dar para reconhecer de ouvido
    'npc-vega': { voz: 'pt-BR-FranciscaNeural', velocidade: '-4%', tom: '-30Hz' },
    // robô ajudante: `efeito` passa um filtro metálico na gravação (ferramentas/vozes/gerar-vozes.py)
    'npc-cosmo': { voz: 'de-DE-FlorianMultilingualNeural', velocidade: '+0%', tom: '+18Hz', efeito: 'robo-leve' },
    // Casa das Palavras (Português): os que ensinam o som das letras têm voz brasileira nativa
    'npc-palavrinha': { voz: 'pt-BR-FranciscaNeural', velocidade: '-12%', tom: '+16Hz' },        // guia carinhosa, devagar e mais aguda que a narradora
    'npc-manu': { voz: 'en-US-EmmaMultilingualNeural', velocidade: '+6%', tom: '+12Hz' },         // chef animada
    'npc-heitor': { voz: 'pt-BR-AntonioNeural', velocidade: '-10%', tom: '-28Hz' },              // jardineiro calmo, bem mais grave que o Claude
    'npc-chocalho': { voz: 'fr-FR-RemyMultilingualNeural', velocidade: '+12%', tom: '+22Hz' },    // palhaço agudo e rápido
    'npc-brisa': { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '+4%', tom: '-4Hz' },    // capitã firme e aventureira
    'npc-carlos': { voz: 'en-US-AndrewMultilingualNeural', velocidade: '-8%', tom: '-12Hz' },     // senhor do carrossel, tranquilo
    'npc-clara': { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+4%', tom: '-10Hz' },     // cavaleira do treino (Castelo: diferente de Serena, Aurora e Oliver)
    'npc-lucia': { voz: 'pt-BR-FranciscaNeural', velocidade: '+4%', tom: '-14Hz' },              // professora (Escola: diferente de Margarida, Helena e Emma)
    // interior de teste da Fase 1 (js/interiores/teste.js, já removido)
    'npc-teste-guia': { voz: 'de-DE-FlorianMultilingualNeural', velocidade: '+4%', tom: '+8Hz' },
    'npc-teste-sala': { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '-4%', tom: '+12Hz' },
    // interior padrão (js/interiores/padrao.js): guia e monitores de matérias sem interior próprio (1 e 4 masculinos)
    'npc-padrao-guia': { voz: 'pt-BR-FranciscaNeural', velocidade: '+4%', tom: '-8Hz' },
    'npc-padrao-1': { voz: 'pt-BR-AntonioNeural', velocidade: '-16%', tom: '-40Hz' },
    'npc-padrao-2': { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+16%', tom: '-4Hz' },
    'npc-padrao-3': { voz: 'pt-BR-FranciscaNeural', velocidade: '-16%', tom: '+12Hz' },
    'npc-padrao-4': { voz: 'pt-BR-AntonioNeural', velocidade: '+6%', tom: '-22Hz' },
    'npc-padrao-5': { voz: 'pt-BR-FranciscaNeural', velocidade: '+14%', tom: '+20Hz' },
  },
};
