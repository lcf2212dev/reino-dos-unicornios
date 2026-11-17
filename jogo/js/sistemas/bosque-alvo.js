/* Bosque dos Fantasmas: o ataque por alvo (docs/contratos/bosque.md §5). Clicar ou tocar num fantasma: ela anda até
   ficar no alcance, vira para ele e golpeia a cada recargaMs, sozinha, seguindo-o se ele fugir, até ele sumir
   (vencido, sumiu ou desmaio). Clique ou toque fora de um fantasma, tecla de andar, tela aberta ou troca de cena
   param. Espaço, Enter e o botão da espada seguem como antes (bosque-combate.js:ligar, ui/bosque-hud.js).
   O clique no fantasma é pego na CAPTURA do pointerdown da janela, antes do motor (motor/entrada.js), e só numa arena
   (o Bosque ou um mapa novo; arenas.md) com a espada: o motor não o vê (nem o tocar para andar nem o mouse
   segurado); fora dela, nada muda. A caixa do toque (TOQUE) serve aos desenhos de até 17 × 20.
   Parte de bosque-combate.js (interno Reino._bosqueCombate): S.quadro(est, j) roda a cada quadro, depois do passo.
   O alvo é est.alvo (o id do fantasma). Puros, testáveis no Node: fantasmaEm, mirarNo, pararNo, seguirAlvo.
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino;
  var S = R._bosqueCombate, BC = R.BosqueCombate;
  var T = 16;
  var ATIVOS = { vagando: 1, perseguindo: 1, voltando: 1, recuando: 1 };   // os que levam golpe (bosque-combate.js)
  // a caixa do toque em volta dos pés do fantasma (px do jogo): o desenho (13 × 17 flutuando acima do chão, com a
  // barrinha de vida em cima; bosque-desenho.js) e uma folguinha para o dedo
  var TOQUE = { lado: 9, cima: 28, baixo: 4 };
  var PERTO = 0.75;   // para de andar a esse tanto do alcance (folga para o fantasma que balança ou recua um pouco)
  // px da tela: o dedo que anda mais que isso em cima do fantasma é arrasto (o thumbstick), não toque; o mesmo
  // limiar do motor (entrada.js), senão o arrasto curto viraria "andar até o fantasma"
  function arrasto() { var c = R.config && R.config.controles; return (c && c.limiarToque) || 12; }
  var TECLAS_ANDAR = { ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, a: 1, A: 1, d: 1, D: 1, w: 1, W: 1, s: 1, S: 1 };

  /* ================= PURO (sem Cena, sem DOM) ================= */
  function achar(est, id) {
    for (var i = 0; i < est.fantasmas.length; i++) if (est.fantasmas[i].id === id) return est.fantasmas[i];
    return null;
  }
  // o fantasma no ponto (px do jogo), entre os que levam golpe: o mais à frente (mais embaixo); ou null
  function fantasmaEm(est, wx, wy) {
    var melhor = null;
    for (var i = 0; i < est.fantasmas.length; i++) {
      var f = est.fantasmas[i];
      if (!ATIVOS[f.estado] || Math.abs(wx - f.x) > TOQUE.lado || wy < f.y - TOQUE.cima || wy > f.y + TOQUE.baixo) continue;
      if (!melhor || f.y > melhor.y) melhor = f;
    }
    return melhor;
  }
  function mirarNo(est, id) {
    var f = achar(est, id);
    est.alvo = f && ATIVOS[f.estado] && !est.desmaiado ? id : null;
    return !!est.alvo;
  }
  function pararNo(est) { est.alvo = null; }
  /* o ataque neste quadro (depois do passo). null = sem alvo ou acabou (sumiu, vencido, desmaio: est.alvo volta a
     null); senão { andar, x, y, golpeou } (o MESMO objeto a cada chamada: nada criado por quadro): andar = mais longe
     que PERTO do alcance (ir até x, y, os pés dele); no alcance, vira o `j` para ele (olharX/olharY) e golpeia quando a
     recarga deixa (golpear de bosque-combate.js) */
  var RES = { andar: false, x: 0, y: 0, golpeou: false };
  function seguirAlvo(est, j) {
    var f = est.alvo ? achar(est, est.alvo) : null;
    if (!f || !ATIVOS[f.estado] || est.desmaiado) { est.alvo = null; return null; }
    var alc = est.cfg.jogador.alcance, vx = f.x - j.x, vy = f.y - j.y, d = Math.sqrt(vx * vx + vy * vy), golpeou = false;
    if (d <= alc) {
      if (d > 0.01) { j.olharX = vx / d; j.olharY = vy / d; }
      golpeou = BC.golpear(est, j);
    }
    RES.andar = d > alc * PERTO; RES.x = f.x; RES.y = f.y; RES.golpeou = golpeou;
    return RES;
  }

  /* ================= NO JOGO ================= */
  // numa arena (o Bosque ou um mapa novo; bosque-combate.js:naCena)
  function naCena() { return S.naCena ? S.naCena() : null; }
  function bloqueado() { return !!(R.Cena && R.Cena.bloqueado && R.Cena.bloqueado()) || !!(R.UI && R.UI.temTela && R.UI.temTela()); }
  // ela anda até o alvo por um caminho NOSSO (parar o ataque a para); (destX, destY) = o tile do fantasma desse caminho
  var andando = false, destX = -1, destY = -1;
  var PONTO = { x: 0, y: 0 }, RETO = [PONTO];   // o caminho reto até ele (reaproveitado)
  function soltarCaminho() { andando = false; destX = destY = -1; }
  function parar() {
    if (S.estado) pararNo(S.estado);
    if (andando && window.Jogador) window.Jogador.parar();
    soltarCaminho();
  }
  /* até os pés dele: no tile dele ou ao lado (livre), reto; senão pelo caminho dos tiles, feito UMA vez por tile dele
     (ele mudou de tile: refaz). Sobre um tile sólido, o caminho vai ao livre mais perto; chegou lá e ele segue fora do
     alcance: ela espera ali, sem buscar de novo, até ele mudar de tile */
  function ir(x, y) {
    var J = window.Jogador, cena = R.Cena.atual(), tx = Math.floor(x / T), ty = Math.floor((y - 2) / T);
    var ax = Math.floor(J.x / T), ay = Math.floor((J.y - 2) / T), livre = !cena.solido(tx, ty);
    if (livre && Math.abs(tx - ax) + Math.abs(ty - ay) <= 1) {
      PONTO.x = x; PONTO.y = y; RETO.length = 1; RETO[0] = PONTO;
      J.caminho = RETO; J.aoChegar = null; J.marcador = null;
      andando = true; destX = destY = -1;
      return;
    }
    if (andando && tx === destX && ty === destY) return;
    var d = livre ? { x: tx, y: ty } : cena.maisPerto(tx, ty, J.tile());
    if (!d || !J.irPara(d.x, d.y)) { parar(); return; }
    J.marcador = null;   // sem as setinhas do toque no chão: quem ela segue é o fantasma
    andando = true; destX = tx; destY = ty;
  }
  function quadro(est, j) {
    if (!est.alvo || !window.Jogador) return;
    var J = window.Jogador, r = seguirAlvo(est, j);
    if (!r) { parar(); return; }
    if (r.andar) { ir(r.x, r.y); return; }
    if (andando) { J.parar(); soltarCaminho(); }
    J.virar8(r.x - J.x, r.y - J.y);   // parada, sempre virada para ele (8 direções, sem piscar entre duas)
  }
  // o fantasma sob o ponto da tela (clientX/Y), numa arena; ou null
  function fantasmaNaTela(cx, cy) {
    var V = R._motor, est = S.estado;
    if (!V || !V.canvas || !est || !naCena()) return null;
    var r = V.canvas.getBoundingClientRect();
    return fantasmaEm(est, V.cam.x + ((cx - r.left) * V.dpr) / V.escala, V.cam.y + ((cy - r.top) * V.dpr) / V.escala);
  }
  /* pointerdown (captura): no fantasma, mira e o motor não vê o toque; fora dele, para o ataque e o motor segue.
     Dedo na metade esquerda (onde o motor abre o thumbstick): mira só no toque curto (pointerup); se o dedo andar mais
     que o limiarToque do motor, o pointerdown é repassado ao motor (com o ponto de onde começou) e vira o arrasto de sempre */
  var pendente = null, repassando = false;
  function tocar(e) {
    var V = R._motor;
    if (repassando || !V || e.target !== V.canvas || !naCena() || !V.jogoAtivo || bloqueado()) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.isTrusted && R.UI && R.UI.toqueSegurado && R.UI.toqueSegurado(e.clientX, e.clientY)) return;
    var f = BC.temEspada() ? fantasmaNaTela(e.clientX, e.clientY) : null;
    if (!f) { if (S.estado && S.estado.alvo) parar(); return; }
    e.preventDefault();
    e.stopPropagation();
    if (R.Som && R.Som.ativar) R.Som.ativar();
    if (e.pointerType !== 'mouse' && e.clientX < window.innerWidth / 2) {
      pendente = { id: f.id, p: e.pointerId, x: e.clientX, y: e.clientY };
      return;
    }
    API.mirar(f.id);
  }
  function moverDedo(e) {
    var p = pendente;
    if (!p || e.pointerId !== p.p || Math.hypot(e.clientX - p.x, e.clientY - p.y) <= arrasto()) return;
    pendente = null;
    var V = R._motor;
    if (!V || !V.canvas || !naCena()) return;
    repassando = true;
    try {
      V.canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: p.p,
        pointerType: e.pointerType, isPrimary: true, button: 0, clientX: p.x, clientY: p.y }));
    } finally { repassando = false; }
  }
  function soltarDedo(e) {
    var p = pendente;
    if (!p || e.pointerId !== p.p) return;
    pendente = null;
    if (e.type === 'pointerup') API.mirar(p.id);
  }

  var ligado = false;
  function ligar() {
    if (ligado) return;
    ligado = true;
    S.quadro = quadro;
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('pointerdown', tocar, true);
      window.addEventListener('pointermove', moverDedo, true);
      window.addEventListener('pointerup', soltarDedo, true);
      window.addEventListener('pointercancel', soltarDedo, true);
      window.addEventListener('keydown', function (e) { if (TECLAS_ANDAR[e.key] && S.estado && S.estado.alvo) parar(); });
    }
    R.util.on(R.EVENTOS.TELAS, function (n) { if (n > 0) parar(); });
    R.util.on(R.EVENTOS.CENA, parar);
  }

  var API = {
    // mira o fantasma `id` (ele precisa estar levando golpe); quem anda e golpeia é o quadro
    mirar: function (id) {
      var est = S.estado;
      if (!est || !naCena() || !BC.temEspada()) return false;
      parar();
      if (window.Jogador) window.Jogador.parar();   // o que ela fazia antes (andar até um ponto) para
      return mirarNo(est, id);
    },
    alvo: function () { return (S.estado && S.estado.alvo) || null; },
    pararAlvo: parar,
    fantasmaNaTela: function (cx, cy) { var f = fantasmaNaTela(cx, cy); return f ? { id: f.id, tipo: f.tipo } : null; },
    // puros (testes no Node)
    fantasmaEm: fantasmaEm, mirarNo: mirarNo, pararNo: pararNo, seguirAlvo: seguirAlvo,
  };
  Object.keys(API).forEach(function (k) { BC[k] = API[k]; });

  R.registrarModulo({
    id: 'bosque-alvo',
    iniciar: ligar,
    depurar: function () { return { alvo: API.alvo(), andando: andando, pendente: !!pendente }; },
  });
})();
