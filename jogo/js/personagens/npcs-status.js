/* NPCs: ícone de status derivado do progresso (N.registrarStatus, N.status), o balãozinho
   pré-desenhado dele e N.desenhar (sprite animado + ícone em cima da cabeça). Ver npcs.js. */
(function () {
  var Reino = window.Reino;
  var N = Reino.NPCs, _n = Reino._npcs;
  var CONTORNO = _n.CONTORNO, gerar = _n.gerar;


  /* ================= STATUS ================= */
  function P() { return Reino.Progresso; }
  function materiaDe(acao) { return acao && Reino.materia(acao.materia); }
  function salaDe(acao) {
    var m = materiaDe(acao);
    return m && m.salas.find(function (s) { return s.id === acao.sala; });
  }
  function raroDaSala(m, s) { return (m.unicornios || []).find(function (u) { return u.raridade === 'raro' && u.sala === s.id; }); }
  function materiaDoLugar(lugar) { return /^materia:/.test(lugar || '') ? Reino.materia(lugar.slice(8)) : null; }
  var MEDALHA = { ouro: '🥇', prata: '🥈', bronze: '🥉' };
  var VALENDO = { lendario: '🌈', raro: '💙', comum: '🤍' };

  // status vindos de outros módulos (ex.: Dona Aveia com a montaria faminta): fn(npc) → {icone, rotulo} | null
  var STATUS = [];
  N.registrarStatus = function (fn) { STATUS.push(fn); };
  N.status = function (npc) {
    for (var si = 0; si < STATUS.length; si++) {
      try { var st = STATUS[si](npc); if (st) return st; } catch (e) { console.error(e); }
    }
    var a = npc.acao || {}, p = P(), est = p.estado();
    if (a.tipo === 'sala') {
      var m = materiaDe(a), s = salaDe(a);
      if (!s) return { icone: '💬', rotulo: 'Conversar' };
      var raro = raroDaSala(m, s);
      if (raro && p.temUni(raro.id)) return { icone: '💙', rotulo: 'Raro já nasceu' };
      var reg = est.salas[s.id];
      return reg && reg.feita ? { icone: '✓', rotulo: 'Sala feita' } : { icone: '❗', rotulo: 'Sala nova' };
    }
    if (a.tipo === 'treino') {
      var mt = materiaDe(a);
      if (!mt) return { icone: '💬', rotulo: 'Conversar' };
      if (!p.materiaCompleta(mt)) return { icone: '🔒', rotulo: 'Treino fechado' };
      /** @type {Partial<RegTreino>} */
      var t = est.treinos[mt.id] || {};
      return MEDALHA[t.melhor] ? { icone: MEDALHA[t.melhor], rotulo: 'Melhor medalha' } : { icone: '❗', rotulo: 'Treino aberto' };
    }
    if (a.tipo === 'prova') {
      var pv = Reino.prova(a.prova);
      if (!pv) return { icone: '💬', rotulo: 'Conversar' };
      var v = p.valendoProva(pv);
      return v ? { icone: VALENDO[v], rotulo: 'Valendo ' + v } : { icone: '✓', rotulo: 'Acessório ganho' };
    }
    if (a.tipo === 'tela' && (a.tela === 'estabulo' || a.tela === 'ovos') && p.ovosParaChocar().length) return { icone: '🥚', rotulo: 'Ovos para chocar' };
    return { icone: '💬', rotulo: 'Conversar' };
  };

  /* ---------- balãozinho do status (pré-desenhado, 1 px = 1 px do ícone) ---------- */
  var bolhas = {};
  function bolha(icone) {
    if (bolhas[icone]) return bolhas[icone];
    var PA = window.PA;
    var ic = PA.iconeDesenho(icone.replace(/️/g, ''));
    var w = 20, h = 23, c = PA.novoCanvas(w, h), ctx = c.getContext('2d');
    function r(x, y, a, b, k) { ctx.fillStyle = k; ctx.fillRect(x, y, a, b); }
    // caixa arredondada com contorno + rabinho
    r(2, 0, 16, 1, CONTORNO); r(2, 19, 16, 1, CONTORNO); r(0, 2, 1, 16, CONTORNO); r(19, 2, 1, 16, CONTORNO);
    r(1, 1, 1, 1, CONTORNO); r(18, 1, 1, 1, CONTORNO); r(1, 18, 1, 1, CONTORNO); r(18, 18, 1, 1, CONTORNO);
    r(2, 1, 16, 18, '#fff8ee'); r(1, 2, 18, 16, '#fff8ee');
    r(2, 17, 16, 1, '#f0dcea'); r(17, 2, 1, 16, '#f0dcea');
    r(8, 19, 4, 1, '#fff8ee'); r(7, 19, 1, 1, CONTORNO); r(12, 19, 1, 1, CONTORNO);
    r(9, 20, 2, 1, '#f0dcea'); r(8, 20, 1, 1, CONTORNO); r(11, 20, 1, 1, CONTORNO);
    r(9, 21, 2, 1, CONTORNO);
    if (ic) ctx.drawImage(ic, 2, 2);
    bolhas[icone] = c;
    return c;
  }

  function fase(npc) {
    var h = 0, s = String(npc.id || '');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }

  N.desenhar = function (pintor, npc, x, yPes, t, animar) {
    var f = fase(npc);
    var quadro = 0;
    if (animar) {
      quadro = Math.floor((t + f % 700) / 700) % 2;
      if ((t + f % 3900) % 3900 < 140) quadro |= 2;   // pisca de vez em quando
    }
    if (window.Jogador && window.Jogador.sombra) window.Jogador.sombra(pintor, x, yPes, 5);
    var spr = gerar(npc.sprite, quadro);
    pintor.sprite(spr, x, yPes + 1);
    // ícone de status acima da cabeça, em px da tela (nítido: inteiro de px por px do ícone)
    var st = N.status(npc);
    var b = bolha(st.icone), ctx = pintor.ctx;
    if (!ctx) return;
    var s = Math.max(1, Math.round((pintor.escala || 3) / 2));
    var cabeca = pintor.tela(x, yPes + 1 - spr.height + (spr.topo || 0));
    var bob = animar ? Math.round(Math.sin(t / 420 + (f % 10))) * s : 0;
    var bx = Math.round(cabeca.x - (b.width * s) / 2), by = Math.round(cabeca.y - b.height * s - s + bob);
    var bw = b.width * s, bh = b.height * s;
    // some enquanto cobre a Mariana: ela já está encostada no personagem. A conta é em px do jogo, com o
    // quadro parado e sem o balanço: câmera deslizando, respiração e sobe-e-desce não fazem o balãozinho piscar
    var spr0 = gerar(npc.sprite, 0), esc = pintor.escala || 3, meia = bw / 2 / esc;
    var baixo = yPes + 1 - spr0.height + (spr0.topo || 0) - s / esc;
    if (cobreMariana(x - meia, baixo - bh / esc, x + meia, baixo)) return;
    var antes = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(b, bx, by, bw, bh);
    ctx.imageSmoothingEnabled = antes;
  };

  // o retângulo do ícone (px do jogo) cruza o do corpo da Mariana, dos pés para cima?
  // Os 10 px de baixo (pés e cascos) ficam de fora: a 2 tiles, o ícone só roçava os cascos e sumia longe dela.
  // Montada, 18 px de largura (o corpo dela e a cabeça do unicórnio): ao lado, o ícone do vizinho fica no chão vazio
  function cobreMariana(x0, y0, x1, y1) {
    var J = window.Jogador;
    if (!J || typeof J.x !== 'number') return false;
    var montada = false;
    try { montada = J.montado && J.montado(); } catch (e) {}
    var w = montada ? 18 : 16, h = montada ? 34 : 24;
    return x0 < J.x + w / 2 && x1 > J.x - w / 2 && y0 < J.y - 10 && y1 > J.y - h;
  }

  _n.P = P; _n.materiaDe = materiaDe; _n.salaDe = salaDe; _n.raroDaSala = raroDaSala; _n.materiaDoLugar = materiaDoLugar;
})();
