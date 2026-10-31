/* Casa do jogador, modo decorar (docs/contratos/casa.md §9.3), parte 1: o modo colocar e o desenho do fantasma.
   O painel some e a cena fica à vista: o fantasma da peça vai para o tile tocado (ou pelas setas), a barra de baixo
   tem Girar, Colocar, Cancelar (e Guardar, se a peça já estava na casa). Verde = Reino.Casa.podeColocar diz ok;
   vermelho = não pode, com o motivo na barra e o Colocar apagado. Teclado: setas movem, R/Espaço giram, Enter
   coloca, Esc cancela.
   Desenho: módulo com `camada` (o fantasma entra na ordem por Y; a moldura e o pontilhado por cima). Sprite de cada
   (objeto, direção) feito UMA vez e guardado; o fantasma é o mesmo sprite pontilhado 1 pixel sim, 1 não (nada de
   globalAlpha: arte.md §13.4). A moldura pisca devagar só com Animações.
   A câmera segue o fantasma (Reino._motor.ajusteCamera). Publica Reino._ui.casaDecorar = { sprite, pegada, entrar,
   soltarCamera, ativo } (o painel, ui/casa-decorar.js, usa). */
(function () {
  var R = window.Reino, U = R.util, el = U.el, EV = R.EVENTOS;
  var T = 16, ANDARES = ['casa', 'casa-2'];

  /* ---------- sprites guardados ---------- */
  var sprites = {};
  function lib(objeto) { var II = R.Interiores; return (II && II.OBJETOS && II.OBJETOS[objeto]) || {}; }
  // a pegada na direção: w/h da biblioteca são os de 'baixo'; de lado, trocados (casa.md §5.3)
  function pegada(objeto, dir) {
    var l = lib(objeto), w = l.w || 1, h = l.h || 1;
    return dir === 'esq' || dir === 'dir' ? { w: h, h: w } : { w: w, h: h };
  }
  // { normal, fantasma, topo }: 2 px de folga dos lados e embaixo, o topo acima do tile (como o motor faz os móveis)
  function sprite(objeto, dir) {
    var k = objeto + '|' + dir;
    if (sprites[k]) return sprites[k];
    var l = lib(objeto), pg = pegada(objeto, dir), topo = l.topo || 0, W = pg.w * T, H = pg.h * T;
    var c = PA.novoCanvas(W + 4, topo + H + 2), cx = c.getContext('2d');
    cx.save(); cx.translate(2, topo);
    try { if (l.desenhar) l.desenhar(cx, 0, 0, { tipo: objeto, x: 0, y: 0, w: pg.w, h: pg.h, dir: dir }, R.Progresso.estado()); } catch (e) { console.error(e); }
    cx.restore();
    // o fantasma: pontilhado (metade dos pixels some), sem transparência parcial
    var f = PA.novoCanvas(c.width, c.height), fx = f.getContext('2d');
    fx.drawImage(c, 0, 0);
    var img = fx.getImageData(0, 0, f.width, f.height), d = img.data;
    for (var y = 0; y < f.height; y++) for (var x = (y % 2); x < f.width; x += 2) d[(y * f.width + x) * 4 + 3] = 0;
    fx.putImageData(img, 0, 0);
    sprites[k] = { normal: c, fantasma: f, topo: topo, w: pg.w, h: pg.h };
    return sprites[k];
  }

  /* ---------- cores (desenho de código: literais permitidos, arte.md §8) ---------- */
  var COR = { tinta: '#3a2446', verde: '#6fdc8c', verde2: '#b9f2c8', vermelho: '#ff5c6a', vermelho2: '#ffc2c8', ouro: '#ffd34d', branco: '#ffffff' };
  // pontilhado de um tile (1 pixel a cada 2×2) na cor do estado, feito uma vez por cor
  var malhas = {};
  function malha(cor) {
    if (malhas[cor]) return malhas[cor];
    var c = PA.novoCanvas(T, T), cx = c.getContext('2d');
    cx.fillStyle = cor;
    for (var y = 0; y < T; y += 2) for (var x = (y % 4) / 2; x < T; x += 2) cx.fillRect(x, y, 1, 1);
    return (malhas[cor] = c);
  }

  /* ---------- estado do modo colocar ---------- */
  // g = { uid, objeto, nome, parede, tinha, andar, x, y, dir, res: { ok, motivo } }
  var g = null, aoFim = null, barra = null, brilho = null, primeira = true, entrouEm = -1e9, CALMA_MS = 400;
  var MOTIVOS = { fora: 'Fora do cômodo', ocupado: 'Já tem algo aqui', bloqueia: 'Bloqueia a passagem', parede: 'Só na parede', jogador: 'Você está aqui' };
  var FALA = 'Toque onde quer colocar!';
  function V() { return R._motor; }

  function avaliar() {
    g.res = R.Casa.podeColocar(g.uid, g.andar, g.x, g.y, g.dir);
    pintarBarra();
  }
  function tamanhoGrade() { var d = R.Interiores.def(g.andar); return (d && d.tamanho) || { w: 1, h: 1 }; }
  // a parte da cena à vista (tiles), acima da barra
  function vista() {
    var v = V(), r = v.canvas.getBoundingClientRect(), fundo = barra ? barra.getBoundingClientRect().top : r.bottom;
    var x0 = v.cam.x, y0 = v.cam.y, k = v.dpr / v.escala;
    return { x0: Math.ceil(x0 / T), y0: Math.ceil(y0 / T), x1: Math.floor((x0 + r.width * k) / T) - 1,
      y1: Math.floor((y0 + (fundo - r.top) * k) / T) - 1 };
  }
  function tileDoPonto(cx, cy) {
    var v = V(), r = v.canvas.getBoundingClientRect();
    return { x: Math.floor((v.cam.x + (cx - r.left) * v.dpr / v.escala) / T), y: Math.floor((v.cam.y + (cy - r.top) * v.dpr / v.escala) / T) };
  }
  function prender(x, y) {
    var tg = tamanhoGrade(), pg = pegada(g.objeto, g.dir);
    return { x: U.clamp(x, 0, Math.max(0, tg.w - pg.w)), y: U.clamp(y, 0, Math.max(0, tg.h - pg.h)) };
  }
  function mover(x, y) {
    var p = prender(x, y);
    if (p.x === g.x && p.y === g.y && g.res) return;
    g.x = p.x; g.y = p.y;
    avaliar();
  }
  // toque num tile: a pegada cobre o tile tocado; de todos os jeitos de cobrir, o 1º que pode (do meio para fora)
  function moverPara(tx, ty) {
    var pg = pegada(g.objeto, g.dir), cx = tx - Math.floor((pg.w - 1) / 2), cy = ty - Math.floor((pg.h - 1) / 2), opcoes = [];
    for (var dy = 0; dy < pg.h; dy++) for (var dx = 0; dx < pg.w; dx++) opcoes.push(prender(tx - dx, ty - dy));
    opcoes.sort(function (a, b) { return (Math.abs(a.x - cx) + Math.abs(a.y - cy)) - (Math.abs(b.x - cx) + Math.abs(b.y - cy)); });
    var boa = opcoes.find(function (o) { return R.Casa.podeColocar(g.uid, g.andar, o.x, o.y, g.dir).ok; });
    var p = boa || prender(cx, cy);
    g.x = p.x; g.y = p.y;
    avaliar();
  }
  // onde o fantasma nasce: no lugar dela (se já está neste andar) ou no tile livre mais perto da Mariana, no cômodo dela
  function lugarInicial(lugar) {
    if (lugar && lugar.andar === g.andar) { g.x = lugar.x; g.y = lugar.y; g.dir = lugar.dir; return; }
    var jt = window.Jogador ? Jogador.tile() : { x: 0, y: 0 }, C = R.Casa, tg = tamanhoGrade(), vs = vista();
    var com = C.comodoEm(g.andar, jt.x, jt.y), lista = [], pg = pegada(g.objeto, g.dir);
    for (var y = 0; y < tg.h; y++) for (var x = 0; x < tg.w; x++) {
      if (com && C.comodoEm(g.andar, x, y) !== com) continue;
      // a pegada inteira à vista (acima da barra) e sem encostar nela (2 tiles de folga): senão, depois
      var dentro = x >= vs.x0 && y >= vs.y0 && x + pg.w - 1 <= vs.x1 && y + pg.h - 1 <= vs.y1;
      // longe dela o bastante para não cobrir o desenho dela (logo acima, a cabeça dela fica embaixo da peça)
      var dx = Math.max(x - jt.x, 0, jt.x - (x + pg.w - 1)), dy = Math.max(y - jt.y, 0, jt.y - (y + pg.h - 1));
      var cobre = Math.max(dx, dy) < 2 || (dx === 0 && y < jt.y && dy < 3);
      lista.push({ x: x, y: y, d: dx + dy + (dentro ? 0 : 1000) + (cobre ? 100 : 0) });
    }
    lista.sort(function (a, b) { return a.d - b.d; });
    var boa = lista.find(function (t) { return C.podeColocar(g.uid, g.andar, t.x, t.y, g.dir).ok; }) || lista[0] || jt;
    g.x = boa.x; g.y = boa.y;
  }

  /* ---------- a barra de baixo ---------- */
  function botao(cls, emoji, rotulo, acao) {
    var b = el('button.btn-grande.decorar-btn.' + cls, { type: 'button', 'aria-label': rotulo }, PA.iconeTexto(emoji), el('span.decorar-rotulo', rotulo));
    b.addEventListener('click', function () {
      if (b.getAttribute('aria-disabled') === 'true') { R._ui.toqueIgnorado(b); return; }
      acao();
    });
    return b;
  }
  function montarBarra() {
    var bts = [botao('decorar-girar', '🔄', 'Girar', girar)];
    if (g.tinha) bts.push(botao('decorar-guardar', '📦', 'Guardar', guardar));
    bts.push(botao('decorar-cancelar', '✕', 'Cancelar', function () { terminar('cancelou'); }));
    bts.push(botao('decorar-colocar.btn-principal', '✅', 'Colocar', colocar));
    barra = el('div.decorar-barra', { role: 'toolbar', tabindex: '-1', 'aria-label': 'Colocar ' + g.nome },
      el('p.decorar-msg', el('b.decorar-nome', g.nome), el('span.decorar-estado', '')), el('div.decorar-botoes', bts));
    document.body.appendChild(barra);
    document.body.classList.add('casa-decorando');
  }
  function pintarBarra() {
    if (!barra) return;
    var ok = g.res && g.res.ok, mot = g.res && g.res.motivo;
    // 'parede' quer dizer que a peça está na fileira errada: a de chão pede o chão
    var txt = ok ? (primeira ? FALA : 'Pode colocar aqui!') : mot === 'parede' && !g.parede ? 'Só no chão' : MOTIVOS[mot] || MOTIVOS.fora;
    var est = barra.querySelector('.decorar-estado');
    if (est.textContent !== txt) est.textContent = txt;
    barra.classList.toggle('pode', !!ok);
    barra.classList.toggle('nao-pode', !ok);
    var col = barra.querySelector('.decorar-colocar');
    if (ok) col.removeAttribute('aria-disabled'); else col.setAttribute('aria-disabled', 'true');
    var gir = barra.querySelector('.decorar-girar'), umaDir = R.Casa.proximaDirecao(g.uid, g.dir) === g.dir;
    if (umaDir) gir.setAttribute('aria-disabled', 'true'); else gir.removeAttribute('aria-disabled');
  }

  /* ---------- ações ---------- */
  function girar() {
    var nova = R.Casa.proximaDirecao(g.uid, g.dir);
    if (nova === g.dir) return;
    R.Som.tocar('toque');
    g.dir = nova;
    var p = prender(g.x, g.y);
    g.x = p.x; g.y = p.y;
    avaliar();
  }
  function colocar() {
    if (!g.res || !g.res.ok || !R.Casa.colocar(g.uid, g.andar, g.x, g.y, g.dir)) { avaliar(); if (barra) R._ui.toqueIgnorado(barra.querySelector('.decorar-colocar')); return; }
    R.Som.tocar('plim');
    brilho = { andar: g.andar, x: g.x, y: g.y, w: pegada(g.objeto, g.dir).w, h: pegada(g.objeto, g.dir).h, ate: performance.now() + 2 * (R.config.movimento.lento || 600) };
    terminar('colocou');
  }
  function guardar() {
    R.Casa.guardar(g.uid);
    R.Som.tocar('toque');
    terminar('guardou');
  }
  function terminar(como) {
    var fim = aoFim;
    soltarPonteiro();
    if (barra) barra.remove();
    barra = null; g = null; aoFim = null;
    document.body.classList.remove('casa-decorando');
    if (fim) fim(como);
  }

  /* ---------- toque na cena e teclado ---------- */
  var arrastando = null;
  function aoApertar(e) {
    if (!g || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    arrastando = e.pointerId;
    try { V().canvas.setPointerCapture(e.pointerId); } catch (x) { /* sem captura: segue sem ela */ }
    var t = tileDoPonto(e.clientX, e.clientY);
    moverPara(t.x, t.y);
  }
  function aoArrastar(e) {
    if (!g || arrastando !== e.pointerId) return;
    var t = tileDoPonto(e.clientX, e.clientY), pg = pegada(g.objeto, g.dir);
    // só quando o dedo passa para outro tile fora da pegada de agora
    if (t.x >= g.x && t.x < g.x + pg.w && t.y >= g.y && t.y < g.y + pg.h) return;
    moverPara(t.x, t.y);
  }
  function aoSoltar(e) { if (arrastando === e.pointerId) arrastando = null; }
  function soltarPonteiro() { arrastando = null; }
  var ligado = false;
  function ligarPonteiro() {
    if (ligado || !V() || !V().canvas) return;
    ligado = true;
    var c = V().canvas;
    c.addEventListener('pointerdown', aoApertar);
    c.addEventListener('pointermove', aoArrastar);
    c.addEventListener('pointerup', aoSoltar);
    c.addEventListener('pointercancel', aoSoltar);
  }
  var SETAS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  document.addEventListener('keydown', function (e) {
    if (!g || (R.UI.temTela && R.UI.temTela())) return;
    var s = SETAS[e.key], foco = document.activeElement, noBotao = foco && barra && barra.contains(foco) && foco.tagName === 'BUTTON';
    if (s) { e.preventDefault(); mover(g.x + s[0], g.y + s[1]); return; }
    if (e.repeat) return;
    if (e.key === 'r' || e.key === 'R' || e.key === ' ') { e.preventDefault(); girar(); return; }
    if (e.key === 'Escape') { e.preventDefault(); terminar('cancelou'); return; }
    // o Enter que escolheu a peça no painel (ou um 2º logo depois) não coloca: só depois de CALMA_MS
    if (e.key === 'Enter' && !noBotao) { e.preventDefault(); if (performance.now() - entrouEm > CALMA_MS) colocar(); }
  });
  // o Espaço solto num botão da barra também o apertaria: o Espaço aqui só gira
  document.addEventListener('keyup', function (e) { if (g && e.key === ' ') e.preventDefault(); });
  U.on(EV.CENA, function (c) { if (g && (c && c.para) !== g.andar) terminar('cancelou'); });

  /* ---------- câmera: segue o fantasma (Reino._motor.ajusteCamera, motor/camera.js) ----------
     No modo colocar, o fantasma fica dentro da parte à vista (a tela menos a barra), com folga de 1 tile: quando ele
     chega perto da borda, a câmera desliza. No painel ela fica parada; ao sair do modo decorar, volta para a Mariana. */
  var camD = null, voltando = false, FOLGA = T, DESLIZE = 0.25;
  function deslizar(a, b) { var d = b - a; return !U.animar() || Math.abs(d) < 0.5 ? b : a + d * DESLIZE; }
  function ajusteCamera(cam, cena) {
    var v = V();
    if (!camD || !cena || ANDARES.indexOf(cena.id) < 0) { camD = null; voltando = false; return; }
    if (voltando) {
      camD.x = deslizar(camD.x, cam.x); camD.y = deslizar(camD.y, cam.y);
      if (camD.x === cam.x && camD.y === cam.y) { camD = null; voltando = false; return; }
    } else if (g && g.andar === cena.id) {
      var r = v.canvas.getBoundingClientRect(), k = v.dpr / v.escala, vw = r.width * k;
      var vh = ((barra ? barra.getBoundingClientRect().top : r.bottom) - r.top) * k;
      var s = sprite(g.objeto, g.dir), x0 = g.x * T, y0 = g.y * T - s.topo, x1 = (g.x + s.w) * T, y1 = (g.y + s.h) * T;
      var mw = cena.largura(), mh = cena.altura(), tx = camD.x, ty = camD.y;
      if (x0 - FOLGA < tx) tx = x0 - FOLGA;
      if (x1 + FOLGA > tx + vw) tx = x1 + FOLGA - vw;
      if (y0 - FOLGA < ty) ty = y0 - FOLGA;
      if (y1 + FOLGA > ty + vh) ty = y1 + FOLGA - vh;
      // sem passar da casa mais que a folga; casa que cabe na vista: só o fantasma move (a câmera de sempre fica onde
      // está, e as placas dos cômodos não mudam de lugar à toa)
      if (mw + 2 * FOLGA > vw) tx = U.clamp(tx, -FOLGA, mw - vw + FOLGA);
      if (mh + 2 * FOLGA > vh) ty = U.clamp(ty, -FOLGA, mh - vh + FOLGA);
      camD.x = deslizar(camD.x, tx); camD.y = deslizar(camD.y, ty);
    }
    cam.x = camD.x; cam.y = camD.y;
  }
  function prenderCamera() { var v = V(); voltando = false; if (!camD && v && v.cam) camD = { x: v.cam.x, y: v.cam.y }; v.ajusteCamera = ajusteCamera; }
  function soltarCamera() { if (camD) voltando = true; }

  /* ---------- entrar no modo colocar ---------- */
  // peca = item de Reino.Casa.pecas(); fim(como) com como = 'colocou' | 'guardou' | 'cancelou'
  function entrar(peca, fim) {
    var c = R.Cena.atual();
    if (!c || ANDARES.indexOf(c.id) < 0) { if (fim) fim('cancelou'); return; }
    ligarPonteiro();
    prenderCamera();
    g = { uid: peca.uid, objeto: peca.objeto, nome: peca.nome, parede: peca.parede, tinha: !!peca.lugar, andar: c.id, x: 0, y: 0, dir: 'baixo', res: null };
    aoFim = fim;
    entrouEm = performance.now();
    montarBarra();
    lugarInicial(peca.lugar);
    avaliar();
    if (primeira && R.Voz && R.Voz.falar) R.Voz.falar(FALA, { voz: 'claude' });
    // pelo teclado o foco vai para a barra (Enter coloca, Tab chega aos botões); pelo toque, nada muda
    if (R.UI.porTeclado && R.UI.porTeclado()) R._ui.focar(barra);
    else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    primeira = false;
  }

  /* ---------- a camada: fantasma, moldura e o brilho de quando coloca ---------- */
  function vivoBrilho() { if (brilho && performance.now() > brilho.ate) brilho = null; return brilho; }
  function moldura(p, x, y, w, h, cor) {
    p.ret(x - 2, y - 2, w + 4, 1, COR.tinta); p.ret(x - 2, y + h + 1, w + 4, 1, COR.tinta);
    p.ret(x - 2, y - 1, 1, h + 2, COR.tinta); p.ret(x + w + 1, y - 1, 1, h + 2, COR.tinta);
    p.ret(x - 1, y - 1, w + 2, 2, cor); p.ret(x - 1, y + h - 1, w + 2, 2, cor);
    p.ret(x - 1, y + 1, 2, h - 2, cor); p.ret(x + w - 1, y + 1, 2, h - 2, cor);
  }
  // brilhinho em cruz (5 pixels) nos cantos da peça, trocando de canto a cada 120 ms
  function faisca(p, x, y, cor) { p.ret(x - 1, y, 3, 1, cor); p.ret(x, y - 1, 1, 3, cor); }
  R.registrarModulo({
    id: 'casa-decorar',
    falas: function () { return [{ texto: FALA }]; },
    depurar: function () { return g ? { uid: g.uid, andar: g.andar, x: g.x, y: g.y, dir: g.dir, ok: !!(g.res && g.res.ok), motivo: g.res && g.res.motivo } : null; },
    camada: {
      ativo: function () { var c = R.Cena.atual(); return !!(g || vivoBrilho()) && !!c && c.id === (g ? g.andar : brilho.andar); },
      itensDesenho: function (p) {
        if (!g) return [];
        var s = sprite(g.objeto, g.dir), px = g.x * T, base = (g.y + s.h) * T;
        return [{ y: base, desenhar: function () { p.sprite(s.fantasma, px + s.w * T / 2, base + 2); } }];
      },
      sobre: function (ctx, p, t, animar) {
        if (g) {
          var ok = g.res && g.res.ok, fase = animar ? Math.floor(t / (R.config.movimento.lento || 600)) % 2 : 0;
          var cor = ok ? (fase ? COR.verde2 : COR.verde) : (fase ? COR.vermelho2 : COR.vermelho), m = malha(COR.vermelho);
          var pg = pegada(g.objeto, g.dir);
          // pontilhado vermelho só quando não pode (o verde deixaria a peça confusa)
          if (!ok) for (var j = 0; j < pg.h; j++) for (var i = 0; i < pg.w; i++) p.sprite(m, (g.x + i) * T + T / 2, (g.y + j + 1) * T);
          moldura(p, g.x * T, g.y * T, pg.w * T, pg.h * T, cor);
        }
        var b = vivoBrilho();
        if (b && animar) {
          var k = Math.floor(t / (R.config.movimento.rapido || 120)) % 4, cx = [b.x * T, (b.x + b.w) * T, (b.x + b.w) * T, b.x * T][k];
          var cy = [b.y * T, b.y * T, (b.y + b.h) * T, (b.y + b.h) * T][k];
          faisca(p, cx, cy, COR.ouro); faisca(p, (b.x + b.w / 2) * T, b.y * T - 4, COR.branco);
        }
      },
    },
  });

  R._ui.casaDecorar = { sprite: sprite, pegada: pegada, entrar: entrar, soltarCamera: soltarCamera, ativo: function () { return !!g; } };
})();
