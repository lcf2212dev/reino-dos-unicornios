/* Casa do jogador: a animação de um uso em que ela ou o unicórnio USAM o móvel (Reino._casaUsos; docs/contratos/casa.md
   §13): sentar, deitar, banho dela na banheira, chuveiro e cozinhar. O mesmo esquema do banho de espuma (banho.js):
   Cena.ocupar('casa-uso') no começo e liberar no fim; toques e teclas engolidos enquanto dura; depois de
   config.casa.usos.pularDepoisMs um toque (ou Enter/Espaço) pula para o fim; um temporizador de segurança sempre
   libera; sem Animações (ou "reduzir movimento"), versão curta (curtaMs) com a pose parada.
   Tudo é desenhado a partir do tempo decorrido: pular é só ir ao fim. Montada, ela desce só no desenho
   (J.montado() não muda); o desenho normal dela some pelo gancho de personagens/jogador-desenho.js.
   Em três arquivos (Reino._casaUsos é um só; o esqueleto vem de casa-usos.js):
     casa-usos-animar.js   começo, fim, pulo, toque/teclado, a camada e o que as poses dividem (I.H)
     casa-usos-poses-a.js  sentar e deitar          casa-usos-poses-b.js  banho dela, chuveiro e cozinhar
   Cada pose: I.poses[uso] = { sons: [[fração, som]], geo(st) → geo, itens(p, st, e, animar) → itens, sobre? }.
   Quem põe I.itens e I.sobre no quadro é a camada do módulo 'casa-usos' (casa-usos.js), que também cria e limpa I.st
   e toca o som do móvel no começo (def.som); aqui só os sons do meio e do fim (na versão curta, nenhum).
   Nada de DOM, canvas, PA, Progresso nem Cena no carregamento: só dentro das funções. */
(function () {
  var R = window.Reino;
  var I = R._casaUsos;
  var H = I.H = {}, POSES = I.poses = {};
  var T = 16;
  var DUR = { sentar: 'sentarMs', deitar: 'deitarMs', banho: 'banhoMs', chuveiro: 'chuveiroMs', cozinhar: 'cozinharMs' };
  var ultimo = null, timers = [], resolver = null, atual = null, vigia = null;

  function cfg() { return (R.config && R.config.casa && R.config.casa.usos) || { curtaMs: 800, pularDepoisMs: 700 }; }
  function agora() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function tocar(som) { try { if (R.Som && R.Som.tocar) R.Som.tocar(som); } catch (e) {} }
  function limitar(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function animacoesLigadas() {
    var est = R.Progresso && R.Progresso.estado();
    return !!(est && est.ajustes && est.ajustes.animacoes !== false) && !(R.util && R.util.reduzMovimentoSistema);
  }
  function ativo(st) { return !!(st && st.comecou && !st.fim && st.geo && POSES[st.uso]); }

  /* ---------- toque e teclado durante a animação (o mesmo do banho.js) ---------- */
  var engolirAte = 0;
  function podePular() { var s = atual; return !!s && I.st === s && ativo(s) && agora() - s.inicio >= (cfg().pularDepoisMs || 0); }
  function aoToque(e) {
    if (!atual && agora() > engolirAte) return;
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();
    if (e.type === 'pointerdown' && podePular()) pular(true);
  }
  var TECLAS_PULAR = { Enter: 1, ' ': 1, Escape: 1 };
  var TECLAS_ANDAR = { ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, a: 1, A: 1, d: 1, D: 1, w: 1, W: 1, s: 1, S: 1 };
  function aoTeclar(e) {
    if (!atual && agora() > engolirAte) return;
    if (!TECLAS_PULAR[e.key] && !TECLAS_ANDAR[e.key]) return;
    e.stopPropagation();
    e.preventDefault();
    if (TECLAS_PULAR[e.key] && !e.repeat && podePular()) pular(false);
  }
  var ouvindo = false;
  function ouvir(ligar) {
    if (ligar === ouvindo) return;
    ouvindo = ligar;
    var f = ligar ? window.addEventListener : window.removeEventListener;
    f.call(window, 'pointerdown', aoToque, true);
    f.call(window, 'click', aoToque, true);
    f.call(window, 'keydown', aoTeclar, true);
  }

  /* ---------- começo, fim e pulo ----------
     `atual` = o st que esta animação está rodando. Quem chamou (casa-usos.js) pode encerrar de fora (st.fim = true ou
     I.st trocado/limpo, na rede de segurança dele): a vigia percebe e termina sem mexer no uso novo. */
  function depois(st, ms, fn) { timers.push(setTimeout(function () { if (atual === st) fn(); }, ms)); }
  function vigiar() { if (atual && (atual.fim || I.st !== atual)) terminar(atual, false); }
  function comecar(st) {
    var pose = POSES[st.uso];
    st.comecou = true;
    st.inicio = agora();
    try { st.geo = pose.geo(st); } catch (e) { console.error(e); st.geo = null; }
    if (!st.geo) { terminar(st, false); return; }
    var sons = pose.sons || [];
    if (!st.curta) sons.forEach(function (x) { depois(st, x[0] * st.dur, function () { tocar(x[1]); }); });
    depois(st, st.dur, function () { terminar(st, false); });
  }
  function pular(porToque) {
    if (!podePular()) return;
    atual.pulou = true;
    terminar(atual, porToque);
  }
  function terminar(st, porToque) {
    if (!st || st !== atual) return;
    atual = null;
    timers.forEach(clearTimeout); timers = [];
    if (vigia) { clearInterval(vigia); vigia = null; }
    st.fim = true;
    ultimo = { ativo: false, uso: st.uso, quem: st.quem, t: Math.round(agora() - (st.inicio || agora())), curta: !!st.curta, pulou: !!st.pulou };
    // só a própria ocupação: se um uso novo já está em I.st, a cena (e os ouvintes) são dele
    var minha = !I.st || I.st === st;
    if (I.st === st) I.st = null;
    // o toque que pulou ainda vai soltar o dedo (click): não pode apertar nada do HUD nem do balão que vem depois
    engolirAte = porToque ? agora() + 400 : 0;
    setTimeout(function () { if (!atual) ouvir(false); }, porToque ? 420 : 0);
    if (minha && R.Cena && R.Cena.liberar && R.Cena.ocupada && R.Cena.ocupada() === 'casa-uso') R.Cena.liberar('casa-uso');
    var ok = resolver;
    resolver = null;
    setTimeout(function () { if (ok) ok({ pulou: !!st.pulou }); }, porToque ? 450 : 0);
  }

  /* ---------- API (contrato da onda 0) ---------- */
  // st = { uso, quem: 'ela'|'uni', obj: { tipo, uid, x, y, w, h, dir }, uniId, montado, curta, dur, … } → Promise<{ pulou }>
  I.animar = function (st) {
    var J = window.Jogador;
    if (!st || (I.st && I.st !== st)) return Promise.resolve({ pulou: false });
    if (atual && atual !== st) terminar(atual, false);   // a anterior foi encerrada de fora e a vigia ainda não viu
    if (!POSES[st.uso] || !st.obj || !J) return Promise.resolve({ pulou: false });
    if (st.curta === undefined || st.curta === null) st.curta = !animacoesLigadas();
    if (!st.dur) st.dur = st.curta ? (cfg().curtaMs || 800) : (cfg()[DUR[st.uso]] || 4000);
    if (st.montado === undefined || st.montado === null) st.montado = !!(J.montado && J.montado());
    st.comecou = false; st.fim = false; st.pulou = false; st.geo = null;
    var promessa = new Promise(function (ok) { resolver = ok; });
    I.st = st;
    atual = st;
    ultimo = null;
    if (R.Cena && R.Cena.ocupar) R.Cena.ocupar('casa-uso');
    ouvir(true);
    vigia = setInterval(vigiar, 200);
    comecar(st);
    // rede de segurança: nunca fica preso ocupado
    depois(st, st.dur + 2000, function () { terminar(st, false); });
    return promessa;
  };
  // quem a animação desenha agora (o desenho normal de quem estiver aqui some); o banho do unicórnio é do Reino.Banho
  var NADA = Object.freeze({ ela: false, uni: false }), SO_UNI = Object.freeze({ ela: false, uni: true });
  var OS_DOIS = Object.freeze({ ela: true, uni: true });
  function emCurso(st) { return !!st && st === atual && I.st === st && ativo(st); }
  I.quemDesenha = function (st) {
    if (!emCurso(st) || (st.uso === 'banho' && st.quem === 'uni')) return NADA;
    return st.quem === 'uni' ? SO_UNI : OS_DOIS;
  };
  function elapsed(st) { return Math.min(st.dur, Math.max(0, agora() - st.inicio)); }
  I.itens = function (p, t, animar) {
    var st = I.st;
    if (!emCurso(st)) return [];
    return POSES[st.uso].itens(p, st, elapsed(st), !!animar && !st.curta) || [];
  };
  I.sobre = function (ctx, p, t, animar) {
    var st = I.st;
    if (!emCurso(st) || !POSES[st.uso].sobre) return;
    POSES[st.uso].sobre(p, st, elapsed(st), !!animar && !st.curta);
  };
  I.depurarAnim = function () {
    var st = atual;
    if (!st) return ultimo || { ativo: false, uso: null, quem: null, t: 0, curta: false, pulou: false };
    return { ativo: emCurso(st), uso: st.uso, quem: st.quem, t: st.comecou ? Math.round(agora() - st.inicio) : 0, curta: !!st.curta, pulou: !!st.pulou };
  };

  /* ---------- o que as poses dividem (I.H) ---------- */
  H.agora = agora; H.limitar = limitar;
  H.trecho = function (s, a, b) { return limitar((s - a) / (b - a)); };
  H.suave = function (k) { return k * k * (3 - 2 * k); };
  H.lerp = function (a, b, k) { return a + (b - a) * k; };
  // 'baixo' | 'cima' | 'lado' (esq e dir usam o desenho de lado; dir sai espelhado)
  H.lado = function (obj) { var d = obj.dir || 'baixo'; return d === 'esq' || d === 'dir' ? 'lado' : d; };
  // um ponto da tabela de um móvel ([x, y, …] em px da pegada, por 'baixo'/'cima'/'lado') em px do jogo; em 'dir', x espelhado
  H.ponto = function (obj, tab) {
    var v = tab[H.lado(obj)] || tab.baixo, W = (obj.w || 1) * T;
    return { x: obj.x * T + (obj.dir === 'dir' ? W - v[0] : v[0]), y: obj.y * T + v[1], v: v };
  };
  H.base = function (obj) { return (obj.y + (obj.h || 1)) * T; };
  H.centro = function (obj) { return { x: (obj.x + (obj.w || 1) / 2) * T, y: (obj.y + (obj.h || 1) / 2) * T }; };
  // fases de quem entra no móvel: pulinho de ida, lá, pulinho de volta (PULO_MS cada, no máximo 15% da duração); parado = lá
  var PULO_MS = 320;
  H.fase = function (st, e, animar) {
    var d = Math.min(PULO_MS, st.dur * 0.15);
    if (!animar) return { nome: 'la', k: 1 };
    if (e < d) return { nome: 'ida', k: H.suave(H.trecho(e, 0, d)) };
    if (e >= st.dur - d) return { nome: 'volta', k: H.suave(H.trecho(e, st.dur - d, st.dur)) };
    return { nome: 'la', k: 1 };
  };
  // arco de um pulinho de a até b (pés, px do jogo)
  H.arco = function (a, b, k, alto) { return { x: Math.round(H.lerp(a.x, b.x, k)), y: Math.round(H.lerp(a.y, b.y, k) - 4 * (alto || 10) * k * (1 - k)) }; };

  function estado() { return R.Progresso.estado(); }
  // a Mariana: sentada ou em pé (quadro 0), vista e capa do que ela usa
  H.ela = function (sentada, vista) {
    var est = estado(), usa = est.usando || {};
    return PA.mariana(est.aparencia, !!sentada, 0, { capa: usa.capa, vista: vista || 'frente' });
  };
  H.aparencia = function () { return estado().aparencia || PA.APARENCIA_PADRAO; };
  // o unicórnio do uso (st.uniId; sem ele, a montaria), com os enfeites que ela usa
  H.uni = function (st, vista, cansado) {
    var P = R.Progresso, id = st.uniId || P.montaria(), u = estado().unis[id], usa = estado().usando || {};
    return PA.unicornio(P.defUni(id), R.Unicornios.estagio(u ? u.xp : 0), 0,
      { enfeites: usa.enfeites, asasFada: usa.asasFada, vista: vista || 'lado', cansado: !!cansado });
  };
  H.sujo = function (st, img) {
    try { return R.Cuidados && R.Cuidados.sujo && R.Cuidados.sujo(st.uniId || R.Progresso.montaria()) && Jogador.sujar ? Jogador.sujar(img) : img; } catch (e) { return img; }
  };
  H.vista = function (dx, dy) { return PA.vistaDaDirecao(dx, dy); };
  H.sprite = function (p, img, x, yPes, espelhar) { Jogador.desenharSprite(p, img, x, yPes, espelhar); };
  H.sombra = function (p, x, y, larg) { Jogador.sombra(p, x, y, larg); };
  // desenha fn() só acima da linha y (px do jogo): o que fica atrás do encosto, dentro da água…
  H.acima = function (p, y, fn) {
    var ctx = p.ctx, yt = p.tela(0, y).y;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, Math.max(0, yt));
    ctx.clip();
    try { fn(); } finally { ctx.restore(); }
  };
  // quem não usa o móvel fica onde estava: montada, o unicórnio no lugar dela; bebê, no rastro (Jogador.posMontaria)
  H.ondeUni = function () { var m = Jogador.posMontaria(); return { x: m.x, y: m.y, vista: m.vista, espelhar: m.espelhar }; };
  H.itemUniParado = function (p, st, onde) {
    return { y: onde.y, desenhar: function () {
      var spr = H.uni(st, onde.vista, false);
      H.sombra(p, onde.x, onde.y, spr.w / 2.6);
      H.sprite(p, H.sujo(st, spr.canvas), onde.x, onde.y + 1, onde.espelhar);
    } };
  };
  // ela em pé (a pé), com sombra: no pulinho de ida e de volta, e ao lado do fogão
  H.elaEmPe = function (p, x, y, vista, espelhar) {
    H.sombra(p, x, y, 5);
    H.sprite(p, H.ela(false, vista).canvas, x, y + 1, espelhar);
  };

  /* sprites pequenos (feitos uma vez): canvas de uma matriz de letras */
  var cache = {};
  H.canvasDe = function (chave, w, h, pintar) {
    if (!cache[chave]) { var c = PA.novoCanvas(w, h); pintar(c.getContext('2d')); cache[chave] = c; }
    return cache[chave];
  };
  H.matriz = function (chave, linhas, cores) {
    return H.canvasDe(chave, linhas[0].length, linhas.length, function (ctx) { R.Desenho.matriz(ctx, 0, 0, linhas, cores); });
  };
  // bolha de espuma de raio r (a mesma do banho de espuma)
  H.bolha = function (r) {
    return H.canvasDe('bolha' + r, r * 2 + 1, r * 2 + 1, function (ctx) {
      R.Desenho.circulo(ctx, r, r, r, R.Desenho.K);
      if (r >= 2) R.Desenho.circulo(ctx, r, r, r - 1, '#ffffff'); else { ctx.fillStyle = '#ffffff'; ctx.fillRect(r, r, 1, 1); }
      if (r > 2) { ctx.fillStyle = '#e3eefc'; ctx.fillRect(r + 1, r + 1, r - 2, 1); }
    });
  };
  // brilho em cruz no pintor (tam 1: 3 px; tam 2: 5 px com o miolo branco)
  H.brilho = function (p, x, y, tam, cor) {
    if (tam <= 0) return;
    if (tam === 1) { p.ret(x - 1, y, 3, 1, cor); p.ret(x, y - 1, 1, 3, cor); return; }
    p.ret(x - 2, y, 5, 1, cor); p.ret(x, y - 2, 1, 5, cor); p.ret(x, y, 1, 1, '#ffffff');
  };
  // brilhos de limpinho em volta de (x, y pés), altura h; aparecem no fim (k 0–1)
  var BRILHOS = [[-10, -0.75], [9, -0.9], [12, -0.35], [-12, -0.3], [1, -1.15], [6, -0.55]];
  H.brilhos = function (p, x, y, h, e, animar, k) {
    BRILHOS.forEach(function (b, i) {
      if (animar && i / BRILHOS.length > k) return;
      var tam = animar ? [0, 1, 2, 1][Math.floor(e / 130 + i * 1.7) % 4] : (i % 2 ? 1 : 2);
      brilhoCor(p, Math.round(x + b[0]), Math.round(y + b[1] * h), tam, i);
    });
  };
  function brilhoCor(p, x, y, tam, i) { H.brilho(p, x, y, tam, i % 3 === 0 ? '#ffd1e6' : i % 3 === 1 ? '#fff6a8' : '#ffffff'); }
})();
