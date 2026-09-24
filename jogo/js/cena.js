/* Cena ativa: o mapa ou o interior de uma construção. Cuida das portas, do tapete de saída,
   das escadas e da transição em íris (o círculo que fecha e abre centrado na Mariana).
   O main.js desenha e lê os controles; aqui fica o que muda de uma cena para outra. */
(function () {
  var U = Reino.util, T = Mapa.T;
  var COR_IRIS = '#3a2446';
  var TEMPO = { fechar: 450, fechada: 120, abrir: 450, limite: 4000 };
  var TEMPO_RAPIDO = { fechar: 50, fechada: 50, abrir: 50, limite: 4000 };

  var Cena = {
    MAPA: 'mapa', TRANSICAO: 'transicao', INTERIOR: 'interior', DIALOGO: 'dialogo', ATIVIDADE: 'atividade',
  };
  var ativa = null;       // cena ativa (null = mapa)
  var trans = null;       // transição em curso
  var vista = null;       // ligações com o main.js: pintor, soltarTeclas, desenhar

  function J() { return window.Jogador; }
  function P() { return Reino.Progresso; }
  function UI() { return Reino.UI; }
  function interiores() { return Reino.Interiores || null; }

  /* ---------- ligação com o main.js ---------- */
  // v = { pintor, soltarTeclas(), desenhar() }
  Cena.ligar = function (v) { vista = v; };
  function pintor() { return vista && vista.pintor; }

  /* ---------- lugares concluídos ganham arco-íris ---------- */
  function concluidos() {
    var p = P(), est = p.estado(), ids = [];
    Reino.materias.forEach(function (m) { if (p.materiaCompleta(m)) ids.push('materia:' + m.id); });
    var ouro = Reino.materias.some(function (m) { var t = est.treinos[m.id]; return t && t.melhor === 'ouro'; });
    if (ouro) ids.push('castelo');
    // escola ganha arco-íris quando todas as provas já deram acessório
    if (Reino.provas.length && Reino.provas.every(function (pv) { return p.regProva(pv).premio; })) ids.push('escola');
    return ids;
  }
  Cena.concluidos = concluidos;

  /* ---------- Claude parado na praça ---------- */
  function chanfro(p, x, y, w, h, cor) {
    p.ret(x + 2, y, w - 4, h, cor);
    p.ret(x, y + 2, w, h - 4, cor);
    p.ret(x + 1, y + 1, 1, 1, cor);
    p.ret(x + w - 2, y + 1, 1, 1, cor);
    p.ret(x + 1, y + h - 2, 1, 1, cor);
    p.ret(x + w - 2, y + h - 2, 1, 1, cor);
  }
  function desenharBalaoGuia(p, t, x, yTopo) {
    var ciclo = (t % 5200) / 5200;
    var a = ciclo < 0.18 ? ciclo / 0.18 : ciclo > 0.72 ? Math.max(0, (1 - ciclo) / 0.28) : 1;
    if (a < 0.04) return;
    var bx = x - 6, by = yTopo - 14;
    var linha = 'rgba(58,36,70,' + (0.38 * a).toFixed(3) + ')';
    var fundo = 'rgba(255,244,250,' + (0.94 * a).toFixed(3) + ')';
    chanfro(p, bx, by, 16, 10, linha);
    chanfro(p, bx + 1, by + 1, 14, 8, fundo);
    p.ret(bx + 4, by + 2, 6, 1, 'rgba(255,255,255,' + (0.8 * a).toFixed(3) + ')');
    p.ret(bx + 5, by + 9, 3, 1, fundo);
    p.ret(bx + 4, by + 10, 1, 1, linha);
    p.ret(bx + 5, by + 10, 3, 1, fundo);
    p.ret(bx + 8, by + 10, 1, 1, linha);
    p.ret(bx + 5, by + 11, 1, 1, linha);
    p.ret(bx + 6, by + 11, 1, 1, fundo);
    p.ret(bx + 7, by + 11, 1, 1, linha);
    p.ret(bx + 5, by + 12, 2, 1, linha);
    var tons = ['255,156,198', '201,166,255', '255,211,77'];
    for (var i = 0; i < 3; i++) {
      var dy = Math.round(Math.sin(t / 280 + i * 1.05));
      p.ret(bx + 4 + i * 4, by + 4 + dy, 2, 2, 'rgba(' + tons[i] + ',' + a.toFixed(3) + ')');
    }
  }
  function desenharClaude(p, t, animar) {
    var ct = Mapa.claudeTile;
    var x = ct.x * T + 8, y = ct.y * T + 14;
    var pulo = animar ? Math.abs(Math.sin(t / 400)) * 2 : 0;
    var piscar = animar && Math.floor(t / 180) % 22 === 0;
    var spr = PA.claude(piscar ? 1 : 0).canvas;
    J().sombra(p, x, y, 6);
    p.sprite(spr, x, y - pulo);
    if (animar) desenharBalaoGuia(p, t, x, y - pulo - spr.height);
  }
  function falarComClaude() {
    Reino.Som.tocar('selecionar');
    var tipos = ['dica', 'dica', 'curiosidade'];
    Reino.Claude.falar(Reino.Claude.frase(U.sortear(tipos)));
  }

  /* ---------- placas do mapa (fonte pixel, em px da tela) ---------- */
  var FONTE_PIXEL = '"Press Start 2P", "Trebuchet MS", sans-serif';
  function linhasDaPlaca(nome) {
    var palavras = nome.split(/\s+/);
    var linhas = [], atual = '';
    palavras.forEach(function (p) {
      var prox = atual ? atual + ' ' + p : p;
      if (atual && prox.length > 12) { linhas.push(atual); atual = p; }
      else atual = prox;
    });
    if (atual) linhas.push(atual);
    return linhas;
  }
  function extraDaPlaca(l) {
    var p = P();
    if (l.tipo === 'materia') {
      var m = Reino.materia(l.materiaId);
      return concluidos().indexOf(l.id) >= 0 ? 'Pronto' : p.salasFeitas(m) + '/' + m.salas.length;
    }
    if (l.tipo === 'estabulo' && p.ovosParaChocar().length) return 'Ovo';
    if (l.tipo === 'escola' && Reino.provas.some(function (pv) { return !p.regProva(pv).premio; })) return 'Prova';
    return '';
  }
  // placa ao lado da construção, com a fonte pixel (acentos inclusos).
  // Press Start 2P só fica nítida em múltiplos de 8px e em posições inteiras;
  // o tamanho acompanha a escala do mapa (em tela de alta densidade o mapa cresce junto).
  // caixas das placas do último desenho, em px do jogo (para tocar na placa)
  var placasNaTela = [];
  function desenharPlacas(ctx, pn) {
    placasNaTela = [];
    var canvas = ctx.canvas, escala = pn.escala, dpr = pn.dpr, cam = pn.cam, Jg = J();
    var fonte = 8 * Math.max(2, Math.round(escala / 2));
    var k = fonte / 16;
    function px(v) { return Math.round(v * k); }
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fonte + 'px ' + FONTE_PIXEL;
    var c = canvas.getBoundingClientRect();
    var hud = Array.prototype.map.call(document.querySelectorAll('#hud > *'), function (e) {
      var r = e.getBoundingClientRect();
      return { left: (r.left - c.left) * dpr, right: (r.right - c.left) * dpr, top: (r.top - c.top) * dpr, bottom: (r.bottom - c.top) * dpr };
    }).filter(function (r) { return r.right > r.left; });
    Mapa.lugares().forEach(function (l) {
      var linhas = linhasDaPlaca(l.nome);
      var extra = extraDaPlaca(l);
      var largura = 0;
      linhas.forEach(function (linha) { largura = Math.max(largura, ctx.measureText(linha).width); });
      // o contador (0/5, Pronto, Ovo) vai numa etiqueta lilás separada do nome
      var etiquetaW = extra ? Math.ceil(ctx.measureText(extra).width) + px(16) : 0;
      var etiquetaH = px(24);
      largura = Math.max(largura, etiquetaW);
      var pad = px(12), topo = px(8), lh = px(24), vao = px(6), borda = px(3), filete = px(2);
      var sw = Math.ceil(largura + pad * 2);
      var sh = topo * 2 + linhas.length * lh + (extra ? vao + etiquetaH : 0);
      var ww = sw / escala, wh = sh / escala;
      // l.placa: 'acima' põe a placa sobre o telhado; 'direita'/'esquerda' forçam o lado;
      // sem nada, fica ao lado virada para o meio do mapa
      var x, y;
      if (l.placa === 'acima') {
        x = (l.rect.x + l.rect.w / 2) * T - ww / 2;
        y = l.rect.y * T - wh - 8;
      } else {
        var naDireita = l.placa ? l.placa === 'direita' : l.rect.x + l.rect.w / 2 < Mapa.W / 2;
        x = naDireita ? (l.rect.x + l.rect.w) * T + 3 : l.rect.x * T - ww - 3;
        y = (l.rect.y + l.rect.h) * T - wh - 2;
      }
      x = Math.max(T + 1, Math.min(x, Mapa.largura() - ww - T - 1));
      var sx = Math.round((x - cam.x) * escala);
      var sy = Math.round((y - cam.y) * escala);
      // no alto do mapa a placa desce para não ficar escondida atrás do HUD
      hud.forEach(function (r) {
        if (sx < r.right && sx + sw > r.left && sy < r.bottom && sy + sh > r.top) sy = Math.max(sy, r.bottom + borda * 2);
      });
      if (sx > canvas.width || sy > canvas.height || sx + sw < 0 || sy + sh < 0) return;
      // guarda a caixa como ficou na tela (inclusive quando desceu por causa do HUD)
      placasNaTela.push({ lugar: l, x: cam.x + (sx - borda) / escala, y: cam.y + (sy - borda) / escala,
        w: (sw + borda * 2) / escala, h: (sh + borda * 2) / escala });
      var perto = Jg.x > x - 6 && Jg.x < x + ww + 6 && Jg.y > y - 4 && Jg.y < y + wh + 8;
      var meio = sx + Math.round(sw / 2);
      ctx.globalAlpha = perto ? 0.35 : 1;
      ctx.fillStyle = '#3a2446';
      ctx.fillRect(sx - borda, sy - borda, sw + borda * 2, sh + borda * 2);
      ctx.fillStyle = '#fff8ee';
      ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = '#f3e6c8';
      ctx.fillRect(sx, sy, sw, borda);
      var poste = Math.max(4, Math.round(escala));
      ctx.fillStyle = '#8a604a';
      ctx.fillRect(meio - Math.round(poste / 2), sy + sh + borda, poste, Math.round(10 * escala / 3));
      ctx.fillStyle = '#3a2446';
      linhas.forEach(function (linha, i) {
        ctx.fillText(linha, meio, sy + topo + lh * i + lh / 2);
      });
      if (extra) {
        var ex = meio - Math.round(etiquetaW / 2), ey = sy + topo + lh * linhas.length + vao;
        ctx.fillStyle = '#b58cff';
        ctx.fillRect(ex, ey, etiquetaW, etiquetaH);
        ctx.fillStyle = '#efe4ff';
        ctx.fillRect(ex + filete, ey + filete, etiquetaW - filete * 2, etiquetaH - filete * 2);
        ctx.fillStyle = '#6a4cd6';
        ctx.fillText(extra, meio, ey + etiquetaH / 2);
      }
      ctx.globalAlpha = 1;
    });
    ctx.restore();
    ctx.imageSmoothingEnabled = false;
  }

  /* ---------- a cena do mapa (adaptador sobre Mapa) ---------- */
  function alvoLugar(lugar) {
    return {
      tipo: 'lugar', id: lugar.id,
      tile: { x: lugar.porta.x, y: lugar.porta.y },
      olhar: { x: 0, y: -1 },
      agir: function () { entrarLugar(lugar); },
      // sem caminho até a porta: aparece na frente dela e entra (como sempre foi)
      semCaminho: function () { J().posicionar(lugar.porta.x, lugar.porta.y + 1); entrarLugar(lugar); },
    };
  }
  var mapa = {
    id: 'mapa', tipo: 'mapa', lugarId: null, corFundo: '#c6e15a',
    largura: function () { return Mapa.largura(); },
    altura: function () { return Mapa.altura(); },
    solido: function (x, y) { return Mapa.solido(x, y); },
    portaEm: function (x, y) { return Mapa.portaEm(x, y); },
    saidaEm: function () { return null; },
    caminho: function (a, b) { return Mapa.caminho(a, b); },
    maisPerto: function (x, y, de) { return Mapa.maisPerto(x, y, de); },
    alvoEm: function (wx, wy) {
      var ct = Mapa.claudeTile;
      var tx = Math.floor(wx / T), ty = Math.floor(wy / T);
      // tocou no Claude (ou bem perto dele)
      if (Math.abs(wx - (ct.x * T + 8)) < 12 && wy > ct.y * T - 14 && wy < ct.y * T + 16) {
        var vizinho = Mapa.maisPerto(ct.x - 1, ct.y, J().tile());
        return { tipo: 'claude', id: 'claude', tile: vizinho, olhar: { x: 1, y: 0 }, agir: falarComClaude };
      }
      // tocou na placa com o nome (a de cima fica na frente)
      for (var i = placasNaTela.length - 1; i >= 0; i--) {
        var pl = placasNaTela[i];
        if (wx >= pl.x && wx < pl.x + pl.w && wy >= pl.y && wy < pl.y + pl.h) return alvoLugar(pl.lugar);
      }
      var lugar = Mapa.lugarNoTile(tx, ty);
      // tocou na plaquinha embaixo do prédio também vale
      if (!lugar) lugar = Mapa.lugarNoTile(tx, ty - 1);
      return lugar ? alvoLugar(lugar) : null;
    },
    alvoPerto: function (tl) {
      var p = Mapa.portaEm(tl.x, tl.y);
      if (p) return alvoLugar(p);
      var ct = Mapa.claudeTile;
      if (Math.abs(tl.x - ct.x) + Math.abs(tl.y - ct.y) === 1) {
        return { tipo: 'claude', id: 'claude', tile: { x: tl.x, y: tl.y }, olhar: null, agir: falarComClaude };
      }
      return null;
    },
    // caixas das placas no último desenho (px do jogo), para o debug e os testes
    placas: function () { return placasNaTela.map(function (p) { return { id: p.lugar.id, x: p.x, y: p.y, w: p.w, h: p.h }; }); },
    npcs: function () { return []; },
    preparar: function () { return Promise.resolve(); },   // o mapa já é pré-renderizado no início
    desenharFundo: function (bctx, t, animar) {
      Mapa.desenharAnimado(bctx, t, { concluidos: concluidos(), semAnimacao: !animar });
    },
    desenharTela: function (ctx, pn) { desenharPlacas(ctx, pn); },
    itensDesenho: function (pn, t, animar) {
      var ct = Mapa.claudeTile;
      // empate com a Mariana: o Claude fica atrás (como sempre foi)
      return [{ y: ct.y * T + 14 - 0.0001, desenhar: function () { desenharClaude(pn, t, animar); } }];
    },
  };
  Cena.mapa = mapa;

  /* ---------- estado ---------- */
  function dialogoModal() {
    var C = Reino.Claude;
    try { return !!(C && typeof C.dialogoAberto === 'function' && C.dialogoAberto()); } catch (e) { return false; }
  }
  // balão modal de NPC aberto e ela vai fazer outra coisa (tela, menu Lugares): fecha o balão
  function fecharDialogoModal() {
    if (dialogoModal() && Reino.Claude.limpar) Reino.Claude.limpar();
  }
  Cena.fecharDialogoModal = fecharDialogoModal;
  Cena.atual = function () { return ativa || mapa; };
  Cena.emTransicao = function () { return !!trans; };
  // fase da transição em curso ('fechando' | 'fechada' | 'abrindo'), para o debug e os testes
  Cena.faseTransicao = function () { return trans ? trans.fase : null; };
  Cena.estado = function () {
    if (trans) return Cena.TRANSICAO;
    if (UI() && UI().temTela && UI().temTela()) return Cena.ATIVIDADE;
    if (dialogoModal()) return Cena.DIALOGO;
    return Cena.atual().tipo === 'interior' ? Cena.INTERIOR : Cena.MAPA;
  };
  Cena.bloqueado = function () {
    var e = Cena.estado();
    return e === Cena.TRANSICAO || e === Cena.ATIVIDADE || e === Cena.DIALOGO;
  };

  function trocarCena(nova) {
    var de = Cena.atual().id;
    ativa = nova && nova.tipo !== 'mapa' ? nova : null;
    var para = Cena.atual().id;
    if (de !== para) U.emit('cena', { de: de, para: para });
  }

  /* ---------- lugar sem interior: o painel de sempre ---------- */
  var esperandoFechar = null;
  U.on('telas', function (n) {
    if (n === 0 && esperandoFechar) { var f = esperandoFechar; esperandoFechar = null; f(); }
  });
  function painelAntigo(lugar) {
    J().parar();
    if (vista && vista.soltarTeclas) vista.soltarTeclas();
    // ao sair, a Mariana aparece na frente da porta
    esperandoFechar = function () { J().posicionar(lugar.porta.x, lugar.porta.y + 1); J().portaIgnorada = null; };
    UI().abrirLugar(lugar);
  }

  function defDoLugar(lugarId) {
    var I = interiores();
    if (!I || typeof I.doLugar !== 'function') return null;
    try { return I.doLugar(lugarId) || null; } catch (e) { console.error(e); return null; }
  }
  function cenaDoInterior(id) {
    var I = interiores();
    return I && typeof I.cena === 'function' ? I.cena(id) : null;
  }
  function defDoInterior(id) {
    var I = interiores();
    return I && typeof I.def === 'function' ? I.def(id) : null;
  }

  // pisou na porta, tocou no prédio ou apertou Enter na porta (no mapa)
  function entrarLugar(lugar) {
    if (trans) return trans.promessa;
    if (defDoLugar(lugar.id)) return Cena.entrar(lugar.id);
    painelAntigo(lugar);
    return Promise.resolve();
  }
  Cena.entrarLugar = entrarLugar;

  /* ---------- transição em íris ---------- */
  function semAnimacao() {
    var est = P() && P().estado();
    return (est && est.ajustes && est.ajustes.animacoes === false) || !!U.reduzMovimentoSistema;
  }
  // resolve com 'ok', 'erro' (preparar falhou) ou 'tempo' (passou do limite); nunca rejeita
  function comLimite(fn, ms) {
    return new Promise(function (resolver) {
      var feito = false;
      function fim(r) { if (!feito) { feito = true; resolver(r); } }
      setTimeout(function () { fim('tempo'); }, ms);
      try {
        Promise.resolve(fn()).then(function () { fim('ok'); }, function (e) { console.error(e); fim('erro'); });
      } catch (e) { console.error(e); fim('erro'); }
    });
  }
  function redesenhar() {
    try { if (vista && vista.desenhar) vista.desenhar(); } catch (e) { console.error(e); }
  }

  // destino: { cena, pacote, depois() } — depois() posiciona a Mariana na cena nova.
  // Aconteça o que acontecer (erro no preparar ou no desenho), a transição sempre termina
  // e o jogo continua: se o destino não ficou pronto por erro, ela fica onde estava.
  function transicionar(destino) {
    if (trans) return trans.promessa;
    var tempos = semAnimacao() ? TEMPO_RAPIDO : TEMPO;
    var Jg = J();
    Jg.parar();
    if (vista && vista.soltarTeclas) vista.soltarTeclas();
    try { Reino.Som.tocar('porta'); } catch (e) { console.error(e); }
    var t = { fase: 'fechando', inicio: performance.now(), tempos: tempos, circulo: tempos === TEMPO, destino: destino };
    trans = t;
    t.promessa = new Promise(function (resolver) {
      var concluida = false;
      function concluir() {
        if (concluida) return;
        concluida = true;
        trans = null;
        redesenhar();
        resolver();
      }
      function abrir(resultado) {
        try {
          if (resultado === 'erro') console.error('Cena: o destino não ficou pronto; ela continua em', Cena.atual().id);
          else {
            trocarCena(destino.cena);
            if (destino.depois) destino.depois();
          }
          Jg.portaIgnorada = null;
        } catch (e) { console.error(e); }
        t.fase = 'abrindo'; t.inicio = performance.now();
        redesenhar();
        setTimeout(concluir, tempos.abrir);
      }
      setTimeout(function () {
        t.fase = 'fechada'; t.inicio = performance.now();
        var pronto = comLimite(function () {
          return Promise.all([
            destino.cena && destino.cena.preparar ? destino.cena.preparar() : null,
            destino.pacote && Reino.Voz && Reino.Voz.carregar ? Reino.Voz.carregar(destino.pacote) : null,
          ]);
        }, tempos.limite);
        Promise.all([pronto, U.esperar(tempos.fechada)])
          .then(function (r) { abrir(r[0]); })
          .catch(function (e) { console.error(e); abrir('erro'); });
      }, tempos.fechar);
      // rede de segurança: nada segura a íris fechada para sempre
      setTimeout(concluir, tempos.fechar + tempos.limite + tempos.fechada + tempos.abrir + 1000);
    });
    return t.promessa;
  }

  // quanto da tela está coberto: 0 = aberta, 1 = fechada
  function fechamento(agora) {
    var t = trans, d = agora - t.inicio;
    if (t.fase === 'fechada') return 1;
    if (t.fase === 'fechando') { var p = U.clamp(d / t.tempos.fechar, 0, 1); return p * p; }            // ease-in
    var q = U.clamp(d / t.tempos.abrir, 0, 1);
    return (1 - q) * (1 - q);                                                                            // ease-out
  }
  Cena.desenharIris = function (ctx, pn, agora) {
    if (!trans) return;
    var W = ctx.canvas.width, H = ctx.canvas.height;
    var f = fechamento(agora);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COR_IRIS;
    if (!trans.circulo) {
      // sem animação: só escurece e clareia rapidinho
      ctx.globalAlpha = f;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      return;
    }
    if (f >= 1) { ctx.fillRect(0, 0, W, H); ctx.restore(); return; }
    var Jg = J(), c = pn.tela(Jg.x, Jg.y - 10);
    // raio aberto: até o canto mais longe (recalculado a cada quadro; resize não quebra)
    var R = Math.max(Math.hypot(c.x, c.y), Math.hypot(W - c.x, c.y), Math.hypot(c.x, H - c.y), Math.hypot(W - c.x, H - c.y));
    var r = R * (1 - f);
    var passo = Math.max(1, Math.round(pn.escala));
    // borda em degraus: faixas horizontais de `escala` px, larguras em múltiplos de `escala`
    var y0 = c.y - Math.floor(c.y / passo) * passo;
    if (y0 > 0) ctx.fillRect(0, 0, W, y0);
    for (var y = y0; y < H; y += passo) {
      var meioY = y + passo / 2 - c.y;
      if (Math.abs(meioY) >= r) { ctx.fillRect(0, y, W, passo); continue; }
      var meia = Math.round(Math.sqrt(r * r - meioY * meioY) / passo) * passo;
      var esq = Math.round(c.x - meia), dir = Math.round(c.x + meia);
      if (esq > 0) ctx.fillRect(0, y, esq, passo);
      if (dir < W) ctx.fillRect(dir, y, W - dir, passo);
    }
    ctx.restore();
  };

  // durante a transição, toques e cliques no HUD não abrem nada
  function bloquearHud(e) {
    if (!trans) return;
    var alvo = e.target;
    if (alvo && alvo.closest && alvo.closest('#hud, #setas')) { e.stopPropagation(); e.preventDefault(); }
  }
  ['click', 'pointerdown', 'pointerup', 'touchstart'].forEach(function (tipo) {
    document.addEventListener(tipo, bloquearHud, { capture: true, passive: false });
  });

  /* ---------- entrar, trocar de andar e sair ---------- */
  Cena.entrar = function (lugarId) {
    if (trans) return trans.promessa;
    var lugar = Mapa.lugar(lugarId);
    var def = defDoLugar(lugarId);
    if (!def) {
      if (lugar) painelAntigo(lugar);
      return Promise.resolve();
    }
    var cena = cenaDoInterior(def.id);
    if (!cena) { if (lugar) painelAntigo(lugar); return Promise.resolve(); }
    return transicionar({
      cena: cena, pacote: def.pacote,
      depois: function () { J().posicionar(def.spawn.x, def.spawn.y); J().virar(0, -1); },
    });
  };

  Cena.irPara = function (interiorId, chegada, olhar) {
    if (trans) return trans.promessa;
    var cena = cenaDoInterior(interiorId);
    if (!cena) return Promise.resolve();
    var def = defDoInterior(interiorId) || {};
    if (!chegada) chegada = def.spawn;
    return transicionar({
      cena: cena, pacote: def.pacote,
      depois: function () {
        if (chegada) J().posicionar(chegada.x, chegada.y);
        if (olhar) J().virar(olhar.x, olhar.y); else J().virar(0, 1);
      },
    });
  };

  Cena.sair = function () {
    if (trans) return trans.promessa;
    var atual = Cena.atual();
    if (atual.tipo !== 'interior') return Promise.resolve();
    var lugar = Mapa.lugar(atual.lugarId);
    return transicionar({
      cena: mapa,
      depois: function () {
        // reaparece na frente da porta, virada para baixo
        if (lugar) J().posicionar(lugar.porta.x, lugar.porta.y + 1);
        J().virar(0, 1);
      },
    });
  };

  // gatilho pisado (porta do mapa, tapete ou escada)
  Cena.acionar = function (g) {
    if (!g || trans) return trans ? trans.promessa : Promise.resolve();
    if (g.tipo === 'saida') return Cena.sair();
    if (g.tipo === 'escada') return Cena.irPara(g.para, g.chegada, g.olhar);
    if (g.porta && g.rect) return entrarLugar(g);   // lugar do mapa
    return Promise.resolve();
  };

  // menu Lugares: no mapa anda até a porta; dentro de um prédio sai, anda e entra
  function irAoAlvo(alvo) {
    var Jg = J();
    var ok = Jg.irPara(alvo.tile.x, alvo.tile.y, function () {
      if (alvo.olhar) Jg.virar(alvo.olhar.x, alvo.olhar.y);
      alvo.agir();
    });
    if (!ok && alvo.semCaminho) alvo.semCaminho();
    return ok;
  }
  Cena.irAoAlvo = irAoAlvo;
  Cena.irAoLugar = function (lugar) {
    if (trans) return trans.promessa;
    fecharDialogoModal();
    var atual = Cena.atual();
    if (atual.tipo === 'interior') {
      if (atual.lugarId === lugar.id) {
        var def = defDoLugar(lugar.id);
        if (def) return Cena.irPara(def.id, def.spawn, { x: 0, y: -1 });
      }
      return Cena.sair().then(function () { irAoAlvo(alvoLugar(lugar)); });
    }
    irAoAlvo(alvoLugar(lugar));
    return Promise.resolve();
  };

  /* ---------- medidas ---------- */
  // px do jogo → px CSS da página
  Cena.paraTela = function (wx, wy) {
    var pn = pintor();
    if (!pn || !pn.ctx) return null;
    var r = pn.ctx.canvas.getBoundingClientRect();
    return { x: r.left + (wx - pn.cam.x) * pn.escala / pn.dpr, y: r.top + (wy - pn.cam.y) * pn.escala / pn.dpr };
  };
  var tempos = [];
  Cena.quadros = {
    ultimo: 0,
    registrar: function (ms) {
      Cena.quadros.ultimo = ms;
      tempos.push(ms);
      if (tempos.length > 120) tempos.shift();
    },
    media: function () {
      if (!tempos.length) return 0;
      return tempos.reduce(function (a, b) { return a + b; }, 0) / tempos.length;
    },
  };

  Reino.Cena = Cena;
})();
