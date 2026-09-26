/* Cena ativa: o mapa ou o interior de uma construção. Cuida das portas, do tapete de saída,
   das escadas, de entrar/sair e do estado (mapa, interior, diálogo, atividade, transição).
   A transição em íris (o círculo que fecha e abre centrado na Mariana) fica em motor/transicao.js.
   O motor (camera.js, laco.js, entrada.js e main.js) desenha e lê os controles; aqui fica o que muda de uma cena para outra.
   Reino._cena (INTERNO, só deste arquivo e de transicao.js): trans (transição em curso), vista
   (ligações com o main.js), trocarCena(nova) e transicionar(destino) (transicao.js). */
(function () {
  var U = Reino.util, T = Mapa.T;
  var EV = Reino.EVENTOS;

  var Cena = {
    MAPA: 'mapa', TRANSICAO: 'transicao', INTERIOR: 'interior', DIALOGO: 'dialogo', ATIVIDADE: 'atividade',
  };
  var ativa = null;       // cena ativa (null = mapa)
  var S = Reino._cena = {
    trans: null,          // transição em curso
    vista: null,          // ligações com o main.js: pintor, soltarTeclas, desenhar
  };

  function J() { return window.Jogador; }
  function P() { return Reino.Progresso; }
  function UI() { return Reino.UI; }
  function interiores() { return Reino.Interiores || null; }

  /* ---------- ligação com o main.js ---------- */
  // v = { pintor, soltarTeclas(), desenhar() }
  Cena.ligar = function (v) { S.vista = v; };
  function pintor() { return S.vista && S.vista.pintor; }

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
    // água do lago (os interiores não têm este método: sem água)
    agua: function (x, y) { return Mapa.agua(x, y); },
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
      var lugar = Mapa.lugarNoTile(tx, ty);
      // tocou logo embaixo do prédio (na frente da porta) também vale
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
    npcs: function () { return []; },
    preparar: function () { return Promise.resolve(); },   // o mapa já é pré-renderizado no início
    desenharFundo: function (bctx, t, animar) {
      Mapa.desenharAnimado(bctx, t, { concluidos: concluidos(), semAnimacao: !animar });
    },
    // o mapa não tem nada por cima dos personagens: os prédios não têm mais placa (o nome e os avisos
    // de cada lugar ficam no menu Lugares, UI.telaLugares)
    desenharTela: function () {},
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
  Cena.emTransicao = function () { return !!S.trans; };
  // fase da transição em curso ('fechando' | 'fechada' | 'abrindo'), para o debug e os testes
  Cena.faseTransicao = function () { return S.trans ? S.trans.fase : null; };
  /* Cena ocupada por uma animação no canvas (o banho de espuma, js/sistemas/banho.js): o estado vira 'atividade'
     (ela não anda, não toca em nada, as teclas não agem) e o jogo continua desenhando.
     ocupar(motivo) → liga; liberar(motivo) → desliga só se for o mesmo motivo. Evento 'ocupada' (motivo | null). */
  var ocupadaPor = null;
  Cena.ocupar = function (motivo) {
    ocupadaPor = motivo || 'atividade';
    if (J() && J().parar) J().parar();
    if (S.vista && S.vista.soltarTeclas) S.vista.soltarTeclas();
    U.emit(EV.OCUPADA, ocupadaPor);
  };
  Cena.liberar = function (motivo) {
    if (!ocupadaPor || (motivo && motivo !== ocupadaPor)) return;
    ocupadaPor = null;
    U.emit(EV.OCUPADA, null);
  };
  Cena.ocupada = function () { return ocupadaPor; };
  Cena.estado = function () {
    if (S.trans) return Cena.TRANSICAO;
    if (ocupadaPor) return Cena.ATIVIDADE;
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
    if (de !== para) U.emit(EV.CENA, { de: de, para: para });
  }

  /* ---------- lugar sem interior: o painel de sempre ---------- */
  var esperandoFechar = null;
  U.on(EV.TELAS, function (n) {
    if (n === 0 && esperandoFechar) { var f = esperandoFechar; esperandoFechar = null; f(); }
  });
  function painelAntigo(lugar) {
    J().parar();
    if (S.vista && S.vista.soltarTeclas) S.vista.soltarTeclas();
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
    if (S.trans) return S.trans.promessa;
    if (defDoLugar(lugar.id)) return Cena.entrar(lugar.id);
    painelAntigo(lugar);
    return Promise.resolve();
  }
  Cena.entrarLugar = entrarLugar;

  S.trocarCena = trocarCena;

  /* ---------- entrar, trocar de andar e sair ---------- */
  Cena.entrar = function (lugarId) {
    if (S.trans) return S.trans.promessa;
    var lugar = Mapa.lugar(lugarId);
    // matéria dentro de um prédio (lugar.interior): entra direto no andar dela
    var def = (lugar && lugar.interior && defDoInterior(lugar.interior)) || defDoLugar(lugarId);
    if (!def) {
      if (lugar) painelAntigo(lugar);
      return Promise.resolve();
    }
    var cena = cenaDoInterior(def.id);
    if (!cena) { if (lugar) painelAntigo(lugar); return Promise.resolve(); }
    return S.transicionar({
      cena: cena, pacote: def.pacote,
      depois: function () { J().posicionar(def.spawn.x, def.spawn.y); J().virar(0, -1); },
    });
  };

  Cena.irPara = function (interiorId, chegada, olhar) {
    if (S.trans) return S.trans.promessa;
    var cena = cenaDoInterior(interiorId);
    if (!cena) return Promise.resolve();
    var def = defDoInterior(interiorId) || {};
    if (!chegada) chegada = def.spawn;
    return S.transicionar({
      cena: cena, pacote: def.pacote,
      depois: function () {
        if (chegada) J().posicionar(chegada.x, chegada.y);
        if (olhar) J().virar(olhar.x, olhar.y); else J().virar(0, 1);
      },
    });
  };

  Cena.sair = function () {
    if (S.trans) return S.trans.promessa;
    var atual = Cena.atual();
    if (atual.tipo !== 'interior') return Promise.resolve();
    var lugar = Mapa.lugar(atual.lugarId);
    return S.transicionar({
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
    if (!g || S.trans) return S.trans ? S.trans.promessa : Promise.resolve();
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
    if (S.trans) return S.trans.promessa;
    fecharDialogoModal();
    var atual = Cena.atual();
    if (atual.tipo === 'interior') {
      // já no prédio (ou no anfitrião da matéria de dentro): vai direto, sem sair
      if (atual.lugarId === lugar.id || (lugar.dentro && atual.lugarId === lugar.dentro)) {
        var def = (lugar.interior && defDoInterior(lugar.interior)) || defDoLugar(lugar.id);
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