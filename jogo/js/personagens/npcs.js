/* Personagens (NPCs) que moram dentro das construções: sprite em pixel art gerado por
   parâmetros (2 quadros de "respirar" + piscar), retrato para o balão, ícone de status
   derivado do progresso, conversa no balão do Claude e as mesmas ações de sempre.
   No carregamento estes arquivos NÃO tocam em DOM, canvas, PA nem Progresso (as ferramentas
   em Node os carregam num vm); tudo isso só dentro das funções.
   Partes (nesta ordem no manifesto; a API pública é Reino.NPCs):
     npcs.js           cria Reino.NPCs e Reino._npcs; grade de pixels, parâmetros e medidas do sprite
     npcs-corpo.js     pinta o que fica atrás do corpo, o corpo e os acessórios da frente
     npcs-cabeca.js    pinta a cabeça, o cabelo, o rosto e os chapéus
     npcs-sprites.js   dragãozinho, bases (registrarBase), gerar sprite, retrato do balão
     npcs-status.js    ícone de status (registrarStatus, status) e desenhar no mundo
     npcs-falas.js     falas padrão, frases, paginar, convite, falasPossiveis, chips
     npcs-conversa.js  baias, telas e ações (registrarTela/Acao, executar) e interagir
     elenco.js         N.ELENCO (só dados)
   Reino._npcs (uso interno, só entre as partes npcs-*.js): constantes da grade (W, CX, TOPO, HY, BY,
   CONTORNO), cores (esc, cla, mis), Grade, params, medidas, as funções pintar*, gerar, os ajudantes de
   progresso (P, materiaDe, salaDe, raroDaSala, materiaDoLugar) e os de fala (U, PADRAO, LIMITE, tamanho,
   frases, paginas, falas, uma, convite). Cada parte pega o que precisa das anteriores. */
(function () {
  var Reino = window.Reino;
  var N = {};
  Reino.NPCs = N;

  /* ================= GERADOR DE SPRITES ================= */
  var W = 19, CX = 9;          // grade de 19 colunas, centro na coluna 9 (fica centrada no tile)
  var TOPO = 6;                // linhas livres em cima para chapéu, coque, pluma...
  var HY = TOPO;               // primeira linha da cabeça (7 linhas, como a Mariana)
  var BY = HY + 7;             // primeira linha do corpo
  var CONTORNO = Reino.Desenho.K;

  function cor() { return window.PA.cor; }
  function esc(c, t) { return cor().escurecer(c, t); }
  function cla(c, t) { return cor().clarear(c, t); }
  function mis(a, b, t) { return cor().misturar(a, b, t); }

  // grade de pixels; linhas acima de `corte` sobem `dy` (respirar)
  function Grade(h, corte, dy) { this.w = W; this.h = h; this.c = []; this.corte = corte; this.dy = dy || 0; }
  Grade.prototype.p = function (x, y, c) {
    if (y < this.corte) y += this.dy;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !c) return;
    this.c[y * this.w + x] = c;
  };
  Grade.prototype.r = function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.p(x + i, y + j, c); };
  Grade.prototype.l = function (y, x0, x1, c) { for (var x = x0; x <= x1; x++) this.p(x, y, c); };
  Grade.prototype.apagar = function (x, y) {
    if (y < this.corte) y += this.dy;
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.c[y * this.w + x] = null;
  };
  Grade.prototype.tem = function (x, y) { return !!this.c[y * this.w + x]; };
  Grade.prototype.em = function (x, y) { return this.c[y * this.w + x]; };
  // ao respirar, a linha logo acima do corte fica vazia: completa com a cor de baixo
  Grade.prototype.fecharCorte = function () {
    if (!this.dy) return;
    var y = this.corte - 1;
    for (var x = 0; x < this.w; x++) {
      if (!this.tem(x, y) && this.tem(x, y + 1) && this.tem(x, y - 1)) this.c[y * this.w + x] = this.em(x, y + 1);
    }
  };
  Grade.prototype.canvas = function () {
    var c = window.PA.novoCanvas(this.w, this.h), ctx = c.getContext('2d');
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
      var k = this.c[y * this.w + x];
      if (k) { ctx.fillStyle = k; ctx.fillRect(x, y, 1, 1); }
    }
    return c;
  };

  // parâmetros com os padrões preenchidos
  /* chaves aceitas no sprite (tabela com os valores: docs/contratos/npcs-e-dialogo.md §5). Lista = valores
     aceitos; 'cor' = cor '#rrggbb'; 'sim' = true (ou uma cor, onde a tabela diz). Chave fora daqui é ignorada
     pelo desenho, e o validar-interiores avisa. Bases registradas (N.registrarBase) somam as suas. */
  var EXTRAS = ['oculos', 'oculosCor', 'barba', 'bigode', 'avental', 'aventalCor', 'capa', 'capaCor', 'capaEstrelas', 'jaleco', 'apito',
    'bengala', 'bolsa', 'bolsaCor', 'colar', 'gravata', 'cachecol', 'cachecolCor', 'cracha', 'livro', 'carta', 'pincel',
    'violao', 'varinha', 'presilha', 'flor', 'espelhoTesta', 'armadura', 'armaduraCor', 'jardineira', 'colete', 'corrente', 'asas',
    'corpo', 'barriga', 'asa', 'moeda', 'nariz',
    'regador', 'regadorCor', 'gola', 'emblema', 'emblemaCor', 'livroAberto', 'lapis', 'palhaco', 'sapatoes', 'foguete', 'chave', 'mapa', 'tesoura'];
  N.OPCOES_SPRITE = {
    base: ['pessoa', 'fada', 'dragao'], idade: ['adulto', 'crianca', 'idoso'],
    penteado: ['curto', 'careca', 'cachos', 'espetado', 'longo', 'trancas', 'chanel', 'rabo', 'rabos', 'coque', 'black', 'cacheado'],
    chapeu: ['bone', 'chapeu', 'palha', 'cartola', 'boina', 'coroa', 'tiara', 'elmo', 'turbante', 'gorro', 'lenco', 'chef',
      'quepe', 'pescador', 'festa', 'faixa', 'flores'],
    perna: ['calca', 'saia', 'vestido', 'short'], estampa: ['listras', 'xadrez', 'bolinhas', 'estrelas'], emblema: ['A'],
    pele: 'cor', cabelo: 'cor', roupa: 'cor', roupa2: 'cor', sapato: 'cor', cor2: 'cor', chapeuCor: 'cor', boca: 'sim',
  };
  EXTRAS.forEach(function (k) { if (!N.OPCOES_SPRITE[k]) N.OPCOES_SPRITE[k] = /Cor$|^(corpo|barriga|asa|colete)$/.test(k) ? 'cor' : 'sim'; });

  function params(s) {
    s = s || {};
    var idade = s.idade || (s.base === 'fada' ? 'crianca' : 'adulto');
    var roupa = s.roupa || '#7c9cff';
    var o = {
      base: s.base || 'pessoa', idade: idade,
      pele: s.pele || '#f1c7a5',
      cabelo: s.cabelo || (idade === 'idoso' ? '#dcd6e4' : '#5a3825'),
      penteado: s.penteado || 'curto',
      roupa: roupa, roupa2: s.roupa2 || esc(roupa, 0.35),
      perna: s.perna || (s.base === 'fada' ? 'vestido' : 'calca'),
      sapato: s.sapato || '#6b3b5a',
      cor2: s.cor2 || '#ffd34d',
      chapeu: s.chapeu || null, chapeuCor: s.chapeuCor || s.cor2 || '#e0433f',
      estampa: s.estampa || null,
      boca: s.boca !== false,
    };
    EXTRAS.forEach(function (k) { if (s[k] !== undefined) o[k] = s[k]; });
    if (o.base === 'fada' && o.asas === undefined) o.asas = true;
    o.cru = s;   // parâmetros originais (bases novas, como o robô, leem os seus daqui)
    return o;
  }

  // alturas pela tabela do docs/contratos/arte.md §12: criança 17 px de arte (com contorno), adulto e idoso 21
  // sem chapéu (diferença de 4 px: 1 linha a mais de tronco e 1 de perna no adulto)
  function medidas(o) {
    var crianca = o.idade === 'crianca';
    var nT = crianca ? 4 : 6, nL = crianca ? 4 : 6;
    return { nT: nT, nL: nL, crianca: crianca, maos: BY + nT - 1, corte: BY + nT, h: BY + nT + nL };
  }

  // partes compartilhadas com os outros arquivos npcs-*.js
  Reino._npcs = {
    W: W, CX: CX, TOPO: TOPO, HY: HY, BY: BY, CONTORNO: CONTORNO,
    esc: esc, cla: cla, mis: mis, Grade: Grade, params: params, medidas: medidas,
  };
})();
