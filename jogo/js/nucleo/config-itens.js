/* Números dos itens (drops dos monstros, Mochila, Baú de Guardados, roupas de aventura): Reino.config.itens.
   Contrato: docs/contratos/itens.md §12. Fica à parte porque o config.js já está perto do limite de tamanho.
   Só dados (sem DOM): carrega logo depois de js/nucleo/config.js e também roda no Node. Os atributos de cada item
   (força, proteção, vida, rapidez, sorte) ficam no catálogo (js/conteudo/itens/catalogo.js), não aqui. */
window.Reino = window.Reino || {};
Reino.config = Reino.config || {};

Reino.config.itens = {
  mochila: 20,               // espaços da Mochila (o que está vestido não ocupa espaço)
  pilha: 10,                 // poções e comidinhas iguais empilham até 10 num espaço (equipamento: 1 por espaço)
  drop: {
    // chance de um inimigo vencido deixar cair alguma coisa, por tipo (a mosca do Bosque vale como voador).
    // Igual em todas as arenas: o que muda de mapa em mapa é O QUE cai, não quanto
    chance: { facil: 0.12, medio: 0.15, dificil: 0.20, voador: 0.30, mosca: 0.30 },
    chanceMax: 0.5,          // teto da chance, mesmo com muita Sorte vestida
    // caiu: o peso de cada categoria no sorteio (equipamento, poção, comidinha, estrelas)
    categorias: { equip: 35, pocao: 30, comida: 23, estrelas: 12 },
    raridade: { comum: 60, raro: 28, epico: 10, lendario: 3 },   // peso de cada raridade no sorteio do equipamento
    repetido: 0.3,           // equipamento que ela já tem (mochila, baú ou vestido) sai 30% das vezes do de um novo
    // estrelas que caem de uma vez, [mínimo, máximo] por arena (arena sem linha: [1, 1])
    estrelas: { bosque: [1, 1], pantano: [1, 1], gelo: [1, 2], dunas: [1, 2], cristal: [2, 3], vulcao: [2, 3] },
  },
  defesaPorPonto: 0.08,      // cada ponto de Proteção tira 8% do toque do inimigo...
  defesaMax: 0.6,            // ...até 60% (o toque nunca tira menos de 1)
  // poção pequena: cura 40% da vida máxima (no mínimo 3); grande: enche (1 = 100%)
  pocao: { pequena: 0.4, pequenaMin: 3, grande: 1 },
  pocaoRecargaMs: 1000,      // intervalo mínimo entre duas poções na arena
  // peso de cada comidinha no sorteio da categoria (pelo id de config.comidas); comida nova sem linha: o padrão
  pesoComida: { cenoura: 30, maca: 26, feno: 20, biscoito: 16, bolo: 8 },
  pesoComidaPadrao: 15,
  pesoPocao: { pequena: 85, grande: 15 },   // peso de cada poção no sorteio da categoria (a grande só do gelo em diante)
  chao: { quicaMs: 350, brilhaMs: 300, voaMs: 450 },   // o item no chão: quica, brilha e voa até ela
  avisoMs: 2600,             // quanto tempo o aviso "<nome>!" fica na tela
  avisosMax: 3,              // avisos na fila, no máximo
};
