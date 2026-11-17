/* Arenas: interiores onde ela luta com a espada (docs/contratos/arenas.md). Este arquivo tem o registro (aqui) e o
   layout de céu aberto (Reino.Interiores.arena, a segunda parte). O Bosque dos Fantasmas é a primeira; os
   mapas novos (pântano, gelo, dunas, cristal, vulcão) são outras. O motor do combate, o HUD, a pergunta, o nível e o
   desmaio (sistemas/bosque*.js, ui/bosque*.js) valem em toda arena registrada; o placar é um só (campo `bosque`).
     Reino.registrarArena({ id, nome, emoji })   id = o id do interior da arena (e da chave em Reino.config.arenas);
       nome = o do painel; emoji = o da pergunta e do painel (com desenho 16×16). Repetido ou sem id: recusado (false).
     Reino.registrarDesenhoInimigo('<arena>-<tipo>', molde)   o desenho de um tipo de inimigo da arena (bosque-desenho.js):
       molde = { linhas: [...], paleta: { K: '#3a2446', a: '#..', ... }, pisca?: { <índice da linha>: 'linha' },
                 passo?: { <índice>: 'linha' }, flutua?: px, balanco?: px }
       linhas de largura igual (até 17 × 20; '.' = vazio, cada letra uma cor da paleta); pisca = as linhas com os olhos
       fechados; passo = o 2º quadro andando (troca a cada 220 ms, só com Animações); flutua = quanto fica acima do chão
       (padrão 6, o do fantasma; 0 = anda no chão). O branco do golpe sai sozinho (toda cor menos K vira branco).
     Reino.Arenas = { def(id), ids(), cfg(id), desenho(arena, tipo), daCena(cena) }
       cfg(id): os números da arena = Reino.config.fantasmas (jogador, tempos, perguntas, visão…) com
       Reino.config.arenas[id] por cima (tipos, quantos, zonas e o que mais ela trouxer); o Bosque usa só o fantasmas.
   node: true: só guarda dados no carregamento (carrega antes dos prédios e dos sistemas do Bosque). */
(function () {
  var R = window.Reino;
  R.arenas = [];
  R.desenhosInimigo = {};
  R.registrarArena = function (def) {
    if (!def || !def.id || R.arenas.some(function (a) { return a.id === def.id; })) {
      if (typeof console !== 'undefined') console.warn('Reino.registrarArena: arena "' + (def && def.id) + '" recusada (sem id ou repetida)');
      return false;
    }
    R.arenas.push(def);
    return true;
  };
  R.registrarDesenhoInimigo = function (chave, molde) {
    var ok = typeof chave === 'string' && /^[a-z0-9]+-[a-z0-9]+$/.test(chave) && molde && Array.isArray(molde.linhas) && molde.linhas.length &&
      molde.paleta && !R.desenhosInimigo[chave] && molde.linhas.every(function (l) { return typeof l === 'string' && l.length === molde.linhas[0].length; }) &&
      ['pisca', 'passo'].every(function (k) {
        var t = molde[k] || {};
        return Object.keys(t).every(function (i) { return +i >= 0 && +i < molde.linhas.length && t[i].length === molde.linhas[0].length; });
      });
    if (!ok) throw new Error('Reino.registrarDesenhoInimigo: "' + chave + '" repetido ou molde torto (linhas da mesma largura e paleta)');
    R.desenhosInimigo[chave] = molde;
    return true;
  };
  function def(id) { for (var i = 0; i < R.arenas.length; i++) if (R.arenas[i].id === id) return R.arenas[i]; return null; }
  R.Arenas = {
    def: def,
    ids: function () { return R.arenas.map(function (a) { return a.id; }); },
    // a config efetiva: as chaves da arena por cima das do Bosque (só o primeiro nível; jogador é sempre o do Bosque)
    cfg: function (id) {
      var base = R.config.fantasmas, extra = (R.config.arenas || {})[id];
      if (!extra || id === 'bosque') return base;
      var c = {};
      Object.keys(base).forEach(function (k) { c[k] = base[k]; });
      Object.keys(extra).forEach(function (k) { if (k !== 'jogador') c[k] = extra[k]; });
      return c;
    },
    desenho: function (arena, tipo) { return R.desenhosInimigo[arena + '-' + tipo] || null; },
    // o id da arena da cena (interior registrado como arena), ou null
    daCena: function (cena) { return cena && cena.tipo !== 'mapa' && cena.id && def(cena.id) ? cena.id : null; },
  };
})();
/* Segunda parte: o layout de uma arena de céu aberto (docs/contratos/arenas.md): Reino.Interiores.arena(op) → { objetos, comodo, spawn,
   saida, tamanho }, sempre igual (semente). É o jeito do Bosque dos Fantasmas (interiores/bosque/bosque.js, que tem o
   dele, fixo) generalizado para os mapas novos: cada pasta só diz QUAIS objetos e ONDE ficam as clareiras e as trilhas.
   Ordem: fixos com fala (com uma folga sem sólido em volta) → enfeites postos → a mata das bordas → os bosquezinhos
   (densidade por zona) → os bolsões que ela não alcança viram enfeite sólido → miudezas (não sólidas) onde ainda
   sobra janela 3×3 vazia (a regra do "rico", interiores.md §7, sem `corredores`). Nunca põe sólido na trilha, nas
   clareiras nem na zona segura do spawn (config.fantasmas.zonaSegura + 1), para os inimigos e ela andarem.
   op = {
     semente, tamanho?: { w: 56, h: 44 }, comodo?: { x: 1, y: 1, w: 54, h: 40 }, spawn?: { x: 28, y: 39 }, saida?: { x: 28, y: 40 },
     zonas?: { facil: [y0, y1], medio, dificil }   // para a densidade da mata (padrão: as do Bosque)
     trilha?(tx, ty) → bool, clareiras?: [[cx, cy, raio]],
     fixos: [[tipo, x, y, nome, fala]]   // os que se tocam (≥ 3); a fala é a lista do falas.js
     enfeites?: [[tipo, x, y, var?]]     // postos onde couber (fora da trilha e das clareiras, se sólidos)
     altos: { tipo: true }               // os que podem ficar atrás de outro igual (árvores: a mata)
     borda: { lado: tipo, baixo: [tipo, tipo2] }   // as colunas das pontas e a fileira de baixo (com a saída aberta)
     base?: { facil, medio, dificil }, bosques?: [[cx, cy, raio]], mata: [[ate, tipo], …]   // ate = sorteio cumulativo 0–1
     bolsao: [tipo, …], coberto: tipo    // chão que ela não alcança: à vista / sob uma copa
     miudos: { comum: [tipos], fundo?: [tipos], fundoAte?: y, trilha?: tipo, varN?: { tipo: n } }
   }
   node: true: só registra a função; usa I.OBJETOS (as dimensões) quando chamada, depois dos objetos da pasta. */
(function () {
  var R = window.Reino, I = R.Interiores;
  if (!I) return;   // só o registro (testes que não carregam o motor dos interiores)
  I.arena = function (op) {
    var tam = op.tamanho || { w: 56, h: 44 }, cm = op.comodo || { x: 1, y: 1, w: 54, h: 40 };
    var W = tam.w, H = tam.h, X0 = cm.x, X1 = cm.x + cm.w - 1, Y0 = cm.y + 2, Y1 = cm.y + cm.h - 1;
    var SPAWN = op.spawn || { x: 28, y: 39 }, SAIDA = op.saida || { x: 28, y: 40 };
    var CF = R.config.fantasmas, SEG = CF.zonaSegura + 1, ZON = op.zonas || CF.zonas;
    var rnd = R.Desenho.rng(op.semente || 1), trilha = op.trilha || function () { return false; };
    var CLAREIRAS = op.clareiras || [], ALTOS = op.altos || {};
    function sorteio(n) { return Math.floor(rnd() * n); }
    function escolha(l) { return l[sorteio(l.length)]; }
    var objetos = [], occ = [], sol = [], reservado = [], semAlto = [], quem = [], cobre = [], x, y;
    for (y = 0; y < H; y++) {
      occ.push([]); sol.push([]); reservado.push([]); semAlto.push([]); quem.push([]); cobre.push([]);
      for (x = 0; x < W; x++) { occ[y].push(false); sol[y].push(false); reservado[y].push(false); semAlto[y].push(false); quem[y].push(0); cobre[y].push(0); }
    }
    function chao(x, y) { return x >= X0 && x <= X1 && y >= Y0 && y <= Y1; }
    function seguro(x, y, m) { return Math.abs(x - SPAWN.x) <= m && Math.abs(y - SPAWN.y) <= m; }
    function emClareira(x, y) { return CLAREIRAS.some(function (c) { return (x - c[0]) * (x - c[0]) + (y - c[1]) * (y - c[1]) <= c[2] * c[2]; }); }
    function zona(y) { return y >= ZON.facil[0] ? 'facil' : y >= ZON.medio[0] ? 'medio' : 'dificil'; }
    function lib(tipo) { return I.OBJETOS[tipo] || {}; }
    function dim(tipo) { var l = lib(tipo); return { w: l.w || 1, h: l.h || 1, s: l.solido === undefined ? 'base' : l.solido }; }
    function conta(tipo) { var l = lib(tipo); return l.solido !== false || !!l.topo; }
    function acima(tipo) { var t = lib(tipo).topo || 0, n = 0; while (t > 16 * n + 8) n++; return n; }
    // cabe aqui? (chão livre; sólido fora da trilha, clareira e zona segura; alto não cobre o que se toca; copa só sobre copa)
    function livre(tipo, x, y) {
      var d = dim(tipo), alto = lib(tipo).alto, arv = ALTOS[tipo], n = acima(tipo), cnt = conta(tipo), i, j;
      for (j = 0; j < d.h; j++) for (i = 0; i < d.w; i++) {
        if (!chao(x + i, y + j) || occ[y + j][x + i] || reservado[y + j][x + i]) return false;
        if (alto && semAlto[y + j][x + i]) return false;
        if (d.s !== false && (seguro(x + i, y + j, SEG) || trilha(x + i, y + j) || emClareira(x + i, y + j))) return false;
        if (cnt && (cobre[y + j][x + i] === 2 || (cobre[y + j][x + i] === 1 && !arv))) return false;
      }
      for (i = 0; i < d.w; i++) for (var k = 1; k <= n && y - k >= 0; k++) { var q = quem[y - k][x + i]; if (q && !(arv && q === 1)) return false; }
      return true;
    }
    function poe(tipo, x, y, ex) {
      var d = dim(tipo), o = { tipo: tipo, x: x, y: y }, i, j;
      Object.keys(ex || {}).forEach(function (k) { o[k] = ex[k]; });
      objetos.push(o);
      for (j = 0; j < d.h; j++) for (i = 0; i < d.w; i++) {
        if (!chao(x + i, y + j)) continue;
        occ[y + j][x + i] = true;
        if (conta(tipo)) quem[y + j][x + i] = ALTOS[tipo] ? 1 : 2;
        if (d.s === true || (d.s === 'base' && j === d.h - 1)) sol[y + j][x + i] = true;
      }
      for (i = 0; i < d.w; i++) for (var k = 1; k <= acima(tipo) && y - k >= 0; k++) cobre[y - k][x + i] = ALTOS[tipo] && cobre[y - k][x + i] !== 2 ? 1 : 2;
      return o;
    }
    function tenta(tipo, x, y, ex) { if (!livre(tipo, x, y)) return false; poe(tipo, x, y, ex); return true; }

    // 1. os fixos com fala: folga de 1 tile sem nada em volta e nenhum alto logo ao sul (a copa não cobre o que se toca)
    (op.fixos || []).forEach(function (f) {
      var d = dim(f[0]), p, q;
      for (q = -2; q <= d.h + 3; q++) for (p = -2; p <= d.w + 1; p++) if (chao(f[1] + p, f[2] + q)) semAlto[f[2] + q][f[1] + p] = true;
      for (q = -1; q <= d.h; q++) for (p = -1; p <= d.w; p++) if (chao(f[1] + p, f[2] + q)) reservado[f[2] + q][f[1] + p] = true;
      poe(f[0], f[1], f[2], { nome: f[3], fala: f[4] || [] });
    });
    // 2. enfeites postos (sem fala)
    (op.enfeites || []).forEach(function (e) { tenta(e[0], e[1], e[2], e[3] ? { var: e[3] } : null); });
    // 3. a mata: as colunas das pontas e a fileira de baixo (a saída e a zona segura abertas)
    var B = op.borda || {};
    for (y = Y0; y <= Y1; y++) { if (B.lado) { tenta(B.lado, X0, y); tenta(B.lado, X1 - 1, y); } }
    if (B.baixo) for (x = X0 + 2; x <= X1 - 2; x++) if (!seguro(x, Y1, SEG)) tenta(x % 3 ? B.baixo[0] : B.baixo[1] || B.baixo[0], x, Y1);
    // … e os bosquezinhos: probabilidade = base da zona + o quanto está perto do miolo de um [cx, cy, raio]
    var BASE = op.base || { facil: 0.025, medio: 0.07, dificil: 0.11 }, BOSQUES = op.bosques || [], MATA = op.mata || [];
    function bonus(x, y) { var m = 0; BOSQUES.forEach(function (b) { m = Math.max(m, 1 - Math.sqrt((x - b[0]) * (x - b[0]) + (y - b[1]) * (y - b[1])) / b[2]); }); return Math.max(0, m); }
    for (y = Y0; y < Y1; y++) for (x = X0 + 2; x <= X1 - 2; x++) {
      if (occ[y][x] || rnd() > BASE[zona(y)] + bonus(x, y) * 0.55) continue;
      var r = rnd();
      for (var m = 0; m < MATA.length; m++) if (r < MATA[m][0]) { tenta(MATA[m][1], x, y); break; }
    }
    // 4. bolsões: chão livre que ela não alcança vira enfeite sólido (sob uma copa, o `coberto`)
    var alc = [];
    for (y = 0; y < H; y++) { alc.push([]); for (x = 0; x < W; x++) alc[y].push(false); }
    var fila = [[SPAWN.x, SPAWN.y]]; alc[SPAWN.y][SPAWN.x] = true;
    while (fila.length) {
      var pt = fila.pop();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var nx = pt[0] + d[0], ny = pt[1] + d[1];
        if (chao(nx, ny) && !sol[ny][nx] && !alc[ny][nx]) { alc[ny][nx] = true; fila.push([nx, ny]); }
      });
    }
    var BOLSAO = op.bolsao || [];
    for (y = Y0; y <= Y1; y++) for (x = X0; x <= X1; x++) if (!sol[y][x] && !alc[y][x]) {
      if (occ[y][x]) { sol[y][x] = true; continue; }
      if (cobre[y][x] && op.coberto) { poe(op.coberto, x, y); quem[y][x] = 3; continue; }
      if (BOLSAO.length) poe(escolha(BOLSAO), x, y);
    }
    // 5. miudezas em toda janela 3×3 ainda vazia (no fundo, as `fundo`; na trilha, a `trilha`)
    var MI = op.miudos || { comum: [] }, VARN = MI.varN || {};
    for (y = Y0; y + 3 <= Y1 + 1; y++) for (x = X0; x + 3 <= X1 + 1; x++) {
      var vazia = true, i, j;
      for (j = 0; j < 3; j++) for (i = 0; i < 3; i++) if (occ[y + j][x + i] || (x + i === SAIDA.x && y + j === SAIDA.y)) vazia = false;
      if (!vazia || !MI.comum.length) continue;
      var c = null;
      for (var k = 0; k < 9 && !c; k++) { var t = { x: x + sorteio(3), y: y + sorteio(3) }; if (!trilha(t.x, t.y) && !seguro(t.x, t.y, 0)) c = t; }
      if (!c) c = { x: x + 1, y: y + 1 };
      var tipo = trilha(c.x, c.y) && MI.trilha ? MI.trilha : escolha(MI.fundo && c.y < (MI.fundoAte || 20) ? MI.fundo : MI.comum);
      poe(tipo, c.x, c.y, VARN[tipo] ? { var: { n: sorteio(VARN[tipo]) } } : null);
    }
    // alto atrás de alto igual (a mata) leva `junto`: o aviso de "alto cobrindo" não vale para eles
    objetos.forEach(function (o) {
      if (!ALTOS[o.tipo]) return;
      var d = dim(o.tipo), n = acima(o.tipo);
      for (var i = 0; i < d.w; i++) for (var k = 1; k <= n && o.y - k >= 0; k++) if (quem[o.y - k][o.x + i] === 1 || quem[o.y - k][o.x + i] === 3) o.junto = true;
    });
    return { objetos: objetos, comodo: cm, spawn: SPAWN, saida: SAIDA, tamanho: tam };
  };
})();
