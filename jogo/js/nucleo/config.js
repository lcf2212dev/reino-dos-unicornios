/* Mariana e o Reino dos Unicórnios — configuração (só DADOS: é aqui que se troca o PIN, os valores etc.).
   Números que dá para mudar: estão comentados ao lado de cada bloco. Depois de mudar, peça ao Claude para republicar.
   Scripts clássicos (sem módulos) para funcionar abrindo o arquivo direto.
   As utilidades comuns (Reino.util) estão em js/nucleo/util.js; o registro das matérias e das provas,
   em js/nucleo/registros.js. */
window.Reino = window.Reino || {};

Reino.config = {
  nomeJogadora: 'Mariana',
  valorPorMateria: 50,        // moedas por matéria revisada: cada sala vale um número inteiro de moedas e a sobra é bônus ao completar
                              // (era 500 Robux; pedido do Leandro, 2026-10-31: 20 Robux = 2 moedas)
  medalhaEscolaValor: 250,    // moedas da medalha de ouro da prova real (combinado fora do jogo; era 2.500 Robux)
  // o cofre (pote) da praça: cheio quando as matérias do bimestre estão completas (6 matérias × 50 moedas)
  cofre: { cheio: 300 },
  // cartões de experiência do Laboratório (sistemas/cartoes.js): um por sala feita (1ª vez) a partir desta data
  // (o começo do 4º bimestre); fixa, para os cartões não sumirem quando o bimestre mudar
  cartoes: { desde: '2026-10-05' },
  // tempo de celular (sistemas/tempo-celular.js): minutos por sala feita (1ª vez) a partir de `desde`; sem teto.
  // passo = de quantos em quantos minutos ela escolhe no Baú
  tempoCelular: { minutosPorSala: 5, desde: '2026-11-01', passo: 5 },
  // a casa do jogador (sistemas/casa.js; docs/contratos/casa.md): 1 kit de móveis por matéria completa de um
  // bimestre >= desdeBimestre (as do 3º, arquivadas, não contam: daria todos de uma vez). kits = a ordem na tela
  // de escolha; passoGirar = a ordem das direções no botão Girar
  casa: {
    desdeBimestre: 4,
    kits: ['estar', 'jantar', 'cozinha', 'banheiro', 'quarto-jogador', 'quarto-uni'],
    // os cômodos, na ordem das abas do modo decorar: os dos kits e os que só têm móveis avulsos (o quarto do ET)
    comodos: ['estar', 'jantar', 'cozinha', 'banheiro', 'quarto-jogador', 'quarto-uni', 'quarto-et'],
    passoGirar: ['baixo', 'esq', 'cima', 'dir'],
    // a cada sala feita de uma matéria que conta, a tela sorteia este tanto de móveis avulsos (casa.md §12) e ela escolhe 1
    moveisOpcoes: 5,
    // os móveis funcionam (casa.md §13): quanto a comida de casa enche a fome do unicórnio (de 100) e quanto dura
    // cada uso, em ms (curtaMs = sem Animações; depois de pularDepoisMs um toque pula para o fim)
    usos: { fomeFruta: 30, fomeComedouro: 45, fomeFogao: 60, sentarMs: 4000, deitarMs: 5000, banhoMs: 5000,
      chuveiroMs: 4500, cozinharMs: 4000, efeitoMs: 2500, curtaMs: 800, pularDepoisMs: 700 },
  },
  pinPais: '2026',            // troque aqui o PIN da Área dos Pais
  desafiosPorSala: 6,
  desafiosSalaLivro: 14,      // sala de livro (ordem: 'livro', 4º bimestre): todos os desafios, na ordem; no máximo este tanto
  // etapas da sala de livro (docs/contratos/quarto-bimestre.md §13): cada etapa junta poucas cartas e as perguntas
  // delas. etapaDesafiosMax = pontos de desafio por etapa (escrever e desenho valem etapaPesoEscrever, o resto 1);
  // etapaCartasMax e etapaPalavrasMax = leitura máxima de uma etapa (passou: as primeiras cartas viram etapa só de leitura)
  etapaDesafiosMax: 4,
  etapaPesoEscrever: 2,
  etapaCartasMax: 3,
  etapaPalavrasMax: 250,
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
  // abertura (tela de início): durações em ms, quantidades e tamanho do pixel da cena (menos pixels = pixel maior)
  abertura: { tituloMs: 1600, estrelas: 70, unicornios: 3, arcoMs: 1800, entrarMs: 600, pixelsAlvo: 70000 },
  // festa da medalha de ouro da prova real do 3º bimestre (js/ui/abertura-medalha.js): a tela de início vira festa
  // (medalha, confete dourado) e o Claude dá parabéns, só para a Mariana, até o dia `ate` (inclusive); depois some sozinha
  festaMedalha: { ate: '2026-12-20' },
  // a novidade em destaque na tela de início (ui/abertura-novidade.js), para todos os jogadores, até `ate` (inclusive):
  // a faixa de cima, o texto grande ao lado do desenho e a linha pequena. Enquanto vale, ela fica no lugar da
  // medalha de ouro (a festa continua no confete e no parabéns do Claude no mapa)
  // id: a 1ª vez que o aparelho vê esta novidade, o botão é "Atualizar" e passa a atualização de mentira (atualizarMs,
  // com Animações; sem elas, atualizarParadoMs); depois volta o "Entrar no Reino". Trocar o id mostra de novo
  novidadeInicio: { id: 'casa-2026-10-31', faixa: 'Nova atualização!', texto: 'Decore sua casa!',
    detalhe: 'Cada matéria completa dá móveis', ate: '2026-11-30', atualizarMs: 3600, atualizarParadoMs: 1500 },
  // jogadores: tamanho do login e da senha; senhaMariana = senha da conta 'mariana' (sem segurança). Ninguém entra
  // direto: vale quando não há banco ou ele não responde (com banco, vale a senha guardada nele); vazio = não entra
  // sem rede ao abrir, com o save no aparelho: joga e tenta a nuvem de novo a cada reconectarMs (e quando a rede volta)
  reconectarMs: 30000,
  jogadores: { loginMin: 2, loginMax: 20, senhaMin: 3, senhaMax: 30, prefixoSave: 'reino-v1-', senhaMariana: 'unicorlice77' },
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
  // vida no mapa (js/sistemas/vida-mapa.js), só com Animações: bichinhos de enfeite, sem toque nem prêmio.
  // borboletas: quantas perto de flores e canteiros; libelulas: sobre o lago; folhas: caindo das árvores;
  // passarinhoACadaMs: de quanto em quanto tempo passa um bando; passarinhoPxS: velocidade (px do jogo por s);
  // asaMs: troca de quadro das asas da borboleta
  vidaMapa: { borboletas: 10, libelulas: 3, folhas: 4, passarinhoACadaMs: 14000, passarinhoPxS: 46, asaMs: 160 },
  // fotos do jogo (js/sistemas/fotos.js): só no aparelho (IndexedDB 'reino-fotos'), nunca no save nem no servidor.
  // maxLado: px do lado maior; maxAlbum: fotos por aparelho; toqueLongoMs: segurar o 📷 abre o álbum.
  // NÃO troque o `banco`, senão o álbum parece vazio
  fotos: { maxLado: 1600, maxAlbum: 40, banco: 'reino-fotos', toqueLongoMs: 600 },
  // música por ambiente (js/sistemas/som.js + js/sistemas/musicas.js): volume; crossfadeS = segundos da troca;
  // comVoz = volume enquanto uma voz fala (30%). Melhor não mexer em lookaheadS e intervaloMs
  musica: { volume: 0.22, crossfadeS: 1.5, comVoz: 0.3, lookaheadS: 0.25, intervaloMs: 60 },
  // tamanhos de letra (px CSS) que o canvas e o JS usam: espelho dos tokens --texto-p, --texto-aux, --texto e
  // --texto-g do :root de css/ui-base.css (docs/contratos/arte.md §9.1). Mudou aqui, mude lá. A placa do cômodo
  // usa corpo × devicePixelRatio (arte.md §9.5)
  texto: { p: 8, aux: 12, corpo: 16, g: 24 },
  // durações (ms) de animação e transição: espelho dos tokens --rapido, --normal e --lento do :root de
  // css/ui-base.css (docs/contratos/arte.md §15.3; o validar-movimento confere). Mudou aqui, mude lá.
  // rapido = resposta ao toque e entrada/saída de tela (arte.md §15.8), normal = abrir/fechar/trocar, lento = chegada
  movimento: { rapido: 120, normal: 240, lento: 600 },
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
    pixel: 5, pixelTablet: 6,        // px de cada pixel do thumbstick (pixel art: base de 22, pino de 10) no
                                     // celular (110 px) e em tela a partir de 700×700 (132 px); número inteiro
  },
  // Aura (js/sistemas/aura.js): cada pergunta certa soma `passo`; respostas erradas mantêm a pontuação.
  // O passo começa em `passoInicial` e cresce × `multiplicador` a cada faixa: a 1ª faixa começa em `primeiraFaixa`
  // (10), a 2ª em 100, a 3ª em 1000… `cores`: a cor da aura em volta da Mariana em cada faixa (a última vale daí em
  // diante; 'arco-iris' = as cores passando). Se mudar os nomes das cores, regrave as vozes (o Claude fala a cor)
  aura: {
    passoInicial: 0.2, primeiraFaixa: 10, multiplicador: 10,
    cores: [
      { nome: 'branca', cor: '#ffffff' }, { nome: 'amarela', cor: '#ffe45c' }, { nome: 'verde', cor: '#6ee07a' },
      { nome: 'azul', cor: '#5cb8ff' }, { nome: 'roxa', cor: '#b57cff' }, { nome: 'rosa', cor: '#ff7ec4' },
      { nome: 'dourada', cor: '#ffb830' }, { nome: 'arco-íris', cor: 'arco-iris' },
    ],
    // matéria do dia (pedido do Leandro): no dia 'aaaa-mm-dd' (fuso do aparelho), cada pergunta certa da matéria
    // (id de conteudo/materias) soma `vezes` × o passo. Dia fora da lista: nada muda
    materiaDoDia: { vezes: 4, dias: { '2026-09-30': 'geografia', '2026-10-01': 'matematica', '2026-10-02': 'ciencias' } },
  },
  // pergunta surpresa (js/sistemas/surpresa.js): de 3 a 10 minutos de jogo livre, vale 2 estrelas de primeira;
  // esperaLivreMs: livre e parada há isso antes de aparecer. Se mudar `estrelas`, regrave as vozes (o Claude fala o valor)
  surpresa: { minMinutos: 3, maxMinutos: 10, estrelas: 2, esperaLivreMs: 4000, tipos: ['escolha', 'vf', 'varias'] },
  // versão nova no servidor de casa (js/sistemas/versao.js): confere o js/versao.json a cada `intervaloMs` e ao
  // voltar para a aba; só acredita depois de ver a mudança 2 vezes (`confirmarMs` entre elas) e de `cacheMs` de
  // aba aberta (o servidor guarda css/js em cache por 300 s); parada no mapa há `paradaMs`, o Claude avisa num
  // balão de `avisoMs`, o jogo grava e recarrega `esperaMs` depois (depois do envio ao servidor, que sai em 1,8 s)
  // viagem de foguete (js/sistemas/viagem.js, atividades/voo.js): cada resposta certa põe 1 no tanque (até `tanque`);
  // decolar gasta o tanque cheio e a volta é de graça. `cheioNoComeco`: save sem o campo começa com o tanque cheio.
  // O voo dura `vooSegundos` (sem pressa: o mesmo tempo aconteça o que acontecer) e as estrelas pegas viram estrelas
  // de verdade, até `estrelasPorVoo`. Se mudar `tanque`, regrave as vozes (o painel fala quantas faltam)
  // 2ª versão: no voo para um planeta com matéria, `portaisPorVoo` portais de resposta (certo = `estrelasPorPortal`
  // estrela a mais e conta na Aura; errado não tira nada). O ET do desafio faz `desafioPerguntas` perguntas da matéria
  // (cada acerto de primeira vale `estrelasPorAcertoET`; errada mostra a certa); ajudar até o fim faz dele um amigo.
  // 3ª versão: o ET amigo que acompanha a Mariana anda `companheiroDistancia` px atrás dela
  viagem: { tanque: 10, cheioNoComeco: true, vooSegundos: 30, estrelasPorVoo: 5, portaisPorVoo: 3, estrelasPorPortal: 1,
    desafioPerguntas: 3, estrelasPorAcertoET: 1, companheiroDistancia: 30 },
  // Laboratório de Química (js/sistemas/quimica.js): estrelas só na 1ª vez de cada descoberta (receita, lâmina do
  // microscópio, lição lida até o fim) e uma vez ao completar o caderno; nada de dinheiro nem Aura (é diversão).
  // `maxTubos`: quantos tubos cabem no béquer. Se mudar as estrelas, regrave as vozes (a Doutora Proveta fala o valor)
  // 2º andar (js/sistemas/quimica-andar2.js), também só na 1ª vez: cada mudança de estado vista no Fogão dos Estados,
  // cada mistura separada na Mesa e cada livro lido até o fim. `grausPorToque`: quanto o termômetro do Fogão anda a
  // cada toque em Esquentar ou Esfriar
  quimica: { estrelasReceitaNova: 2, estrelasLaminaNova: 1, estrelasLicaoNova: 1, estrelasCadernoCompleto: 10, maxTubos: 3,
    estrelasEstadoNovo: 1, estrelasMisturaNova: 1, estrelasLivroNovo: 1, grausPorToque: 10 },
  // Bosque dos Fantasmas (docs/contratos/bosque.md; sistemas/bosque.js e bosque-combate.js). Tempos em ms, distâncias
  // em px do mundo (tile = 16), velocidades em px/s (ela a pé anda 58). Nada se perde: errar e desmaiar não tiram nada
  fantasmas: {
    acertosPorNivel: 10,         // acertos para subir 1 nível (nível = 1 + acertos / acertosPorNivel)
    nivelMax: 1000,              // o nível não passa daqui (os acertos continuam contando)
    estrelasPorAcerto: 1,        // estrelas por pergunta certa (se mudar, regrave as vozes: o Claude fala da estrela)
    // pergunta do fantasma: sorteio uniforme entre todas as perguntas do bimestre em curso (sala feita ou não), de
    // todo tipo da sala menos estes. Também ficam de fora a pergunta pessoal (`livre: true`) e o `escrever` sem
    // `chaves` (aceita qualquer texto): a estrela só vem de resposta certa
    perguntaForaTipos: [
      'memoria',                 // jogo da memória: sem resposta certa (termina sozinho ao achar os pares; vale 0)
      'desenho',                 // desenho livre: qualquer desenho vale, não há resposta certa
      'cacaPalavras',            // na tentativa única libera "Conferir" com uma palavra achada e dá errado
    ],
    jogador: {
      vidaBase: 10,              // vida máxima sem pontos em Vida
      vidaPorPonto: 2,           // vida máxima a mais por ponto em Vida
      danoBase: 1,               // dano da espada sem pontos em Força
      danoPorPonto: 1,           // dano a mais por ponto em Força
      velocidadePorPonto: 0.04,  // fator de velocidade a mais por ponto em Velocidade (só no Bosque)
      velocidadeMax: 1.6,        // teto do fator de velocidade
      alcance: 20,               // alcance da espada
      recargaMs: 350,            // espera entre dois golpes
      golpeMs: 180,              // duração do golpe (desenho da espada)
      invencivelMs: 1000,        // depois de levar um toque, esse tempo sem levar outro
      regenSemDanoMs: 5000,      // tempo sem levar toque para a vida começar a voltar
      regenACadaMs: 3000,        // depois disso, 1 de vida a cada esse tempo
    },
    // cada tipo de fantasma: vida (golpes de dano 1), forca (vida que tira por toque), velocidade (px/s)
    tipos: {
      facil: { vida: 2, forca: 1, velocidade: 16 },    // lilás
      medio: { vida: 4, forca: 1, velocidade: 24 },    // azul-turquesa (mais vida e mais rápido que o fácil)
      dificil: { vida: 5, forca: 2, velocidade: 28 },  // rosa-vinho com coroa: o único que bate mais forte (nível 1, 1 golpe a cada 700 ms: vence com folga)
    },
    quantos: { facil: 5, medio: 4, dificil: 3 },        // fantasmas de cada tipo no Bosque ao mesmo tempo
    zonas: { facil: [27, 38], medio: [15, 26], dificil: [3, 14] },   // fileiras (tiles) onde cada tipo nasce e vagueia
    zonaSegura: 4,               // tiles em volta do começo (spawn) sem fantasma
    visao: 80,                   // distância em que o fantasma a vê e vem atrás dela
    coleira: 144,                // distância máxima do ponto onde nasceu (depois disso ele volta)
    raioToque: 9,                // distância em que o fantasma encosta nela
    recuoMs: 700,                // o fantasma recua por esse tempo depois de encostar ou de levar golpe
    voltaMs: 20000,              // fantasma vencido volta a aparecer depois desse tempo
    vencidoMs: 500,              // animação do fantasma sumindo antes da pergunta
    vencidoPresoMs: 60000,       // proteção: vencido há mais que isso sem a pergunta devolver volta a contar voltaMs
                                 // (quando ela entra no Bosque vinda de fora)
    desmaioMs: 1600,             // animação do desmaio antes de voltar ao começo
  },
  novidadeDias: 45,   // dias em que o selo "✨ Novo!" aparece num lugar novo (lugar.novidade)
  versao: { intervaloMs: 10 * 60000, confirmarMs: 60000, cacheMs: 330000, paradaMs: 8000, avisoMs: 4500, esperaMs: 2500 },
  // acessórios das provas à venda na Loja (só depois de ganhar um da mesma prova)
  precoPremio: { comum: 25, raro: 40, lendario: 70 },
  // falas com botão de seguir ou sair (Reino.Voz.falarEsperando + UI.esperarFala). travar: true = ouvir antes de
  // seguir (enquanto a voz fala, os botões de seguir e de sair ficam desabilitados e o Esc não fecha); false (pedido do
  // Leandro, 29/09/2026) = a voz fala e ela pula, responde ou sai quando quiser (seguir ou fechar cala a fala).
  // Teto da espera = letras × msPorLetra × folga (+250 ms por pedaço), entre minS e maxS segundos: libera mesmo se o
  // áudio travar (e é quando a próxima fala encadeada começa). lerQuestoes: cada questão (sala, treino, prova) é lida
  // sozinha ao aparecer; resumoNaSala: as cartas do livro usadas pela sala aparecem (e são lidas) antes da 1ª questão
  esperaFala: { travar: false, msPorLetra: 75, folga: 1.6, minS: 2, maxS: 30, lerQuestoes: true, resumoNaSala: true },
  // cores da moldura que o canvas e o JS usam: espelho do :root de css/ui-base.css (mesmo hex, conferido pelo
  // validar-cores.js; papéis em docs/contratos/arte.md §8). Mudou aqui, mude lá. Não é cor de save (D8B-03)
  paleta: {
    tinta: '#3a2446', tintaSuave: '#6b5378', noite: '#24162e', noite2: '#33224a',
    papel: '#fff8ee', papel2: '#efe8e2', papelQuente: '#fff1cc', grama: '#c6e15a',
    raridade: {
      comum: { texto: '#6b5378', fundo: '#fff8ee', desenho: '#ff9cc6' },
      raro: { texto: '#2b5ea8', fundo: '#dcebff', desenho: '#5fb4ff' },
      epico: { texto: '#5b2aa8', fundo: '#eadcff', desenho: '#a66bff' },
      lendario: { texto: '#8a5200', fundo: '#ffe39a', desenho: '#ffb020' },
    },
    confete: ['#ff7eb6', '#ffd34d', '#7c5cff', '#5fb4ff', '#ff8a3d', '#9ccc4a'],   // --rosa --ouro --roxo --azul --laranja --verde-folha (arte.md §14.2)
  },
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
    'npc-taina': { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+10%', tom: '+26Hz' },  // guia mirim, criança alegre
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
    'npc-moon': { voz: 'en-US-AvaMultilingualNeural', velocidade: '-6%', tom: '+24Hz', ingles: 'npc-moon-en' },     // menina de boa-noite, calminha
    'npc-moon-en': { voz: 'en-US-AvaMultilingualNeural', velocidade: '-12%', tom: '+24Hz' },
    'npc-joy': { voz: 'en-AU-WilliamMultilingualNeural', velocidade: '+4%', tom: '+10Hz', ingles: 'npc-joy-en' },   // músico feliz
    'npc-joy-en': { voz: 'en-AU-WilliamMultilingualNeural', velocidade: '-6%', tom: '+10Hz' },
    // Castelo da Medalha
    'npc-serena': { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '-6%', tom: '+10Hz' },  // princesa gentil e elegante
    'npc-aurora': { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '+4%', tom: '-10Hz' }, // cavaleira firme e corajosa
    'npc-oliver': { voz: 'en-US-BrianMultilingualNeural', velocidade: '-12%', tom: '-12Hz', ingles: 'npc-oliver-en' }, // cavaleiro nobre, grave
    'npc-oliver-en': { voz: 'en-US-BrianMultilingualNeural', velocidade: '-20%', tom: '-12Hz' },
    'npc-caio': { voz: 'de-DE-FlorianMultilingualNeural', velocidade: '-4%', tom: '-8Hz' },     // cavaleiro da Matemática, calmo (diferente do Oliver)
    'npc-rosa': { voz: 'pt-BR-FranciscaNeural', velocidade: '+6%', tom: '+14Hz' },               // cavaleira da Geografia, alegre (mais aguda que a narradora)
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
    'npc-manu': { voz: 'en-US-EmmaMultilingualNeural', velocidade: '+10%', tom: '+28Hz' },        // chef mirim, criança animada
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
