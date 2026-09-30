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
  // quem abre uma tela de serviço mostra o ofício no balãozinho (D4-11): loja, salão e baú
  var OFICIO = {
    loja: { icone: '🛍️', rotulo: 'Loja' }, bau: { icone: '🪙', rotulo: 'Baú de moedas' },
    'salao-cabelo': { icone: '✂️', rotulo: 'Salão' }, 'salao-roupa': { icone: '✂️', rotulo: 'Salão' },
  };
  // a sacola de compras (o ✂ é do Salão, salao/icones.js; a 🪙, de arte/icones/premios.js)
  if (Reino.registrarIcones && !(window.ICONES && window.ICONES['🛍'])) Reino.registrarIcones({
    '🛍': { n: 'sacola de compras', p: { k: '#3a2446', p: '#ff7eb6', P: '#d8588f', w: '#ffd1e6', y: '#ffd34d' }, d: [
      '................',
      '.....kkkkkk.....',
      '....kk....kk....',
      '....k......k....',
      '..kkkkkkkkkkkk..',
      '..kwwpppppppPk..',
      '..kwpppppppPPk..',
      '..kpppkyykpPPk..',
      '..kpppkyykpPPk..',
      '..kppppkkppPPk..',
      '..kpppppppPPPk..',
      '..kpppppppPPPk..',
      '..kppppppPPPPk..',
      '..kPPPPPPPPPPk..',
      '..kkkkkkkkkkkk..',
      '................',
    ] },
  });

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
      // 💙 é só "valendo raro" (prova); o raro da sala que já nasceu é o 🦄 (D4-12)
      if (raro && p.temUni(raro.id)) return { icone: '🦄', rotulo: 'Raro já nasceu' };
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
    if (a.tipo === 'tela' && OFICIO[a.tela]) return OFICIO[a.tela];
    return { icone: '💬', rotulo: 'Conversar' };
  };

  /* ---------- balãozinho do status (pré-desenhado, 1 px = 1 px do ícone) ---------- */
  var bolhas = {};
  function bolha(icone) {
    if (bolhas[icone]) return bolhas[icone];
    var PA = window.PA;
    var chave = icone.replace(/️/g, ''), ic = PA.iconeDesenho(chave);
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

  /* ação de vez em quando (D4-17), cada um no seu ritmo: a cada 4,2 a 5 s (pela fase), 960 ms de gesto em degraus.
     Pessoa e fada adultas acenam (quadros 4 e 4|8, 240 ms cada), o dragãozinho bate as asas, e criança e as
     outras bases (ET, robô...) dão dois pulinhos (1-2 px, 120 ms por degrau). Parado sem animação (quadro 0). */
  var ACAO_MS = 960, PULO = [-1, -2, -1, 0, -1, -2, -1, 0];
  function gesto(npc) {
    var s = npc.sprite || {}, base = s.base || 'pessoa';
    if (base === 'dragao') return 'asas';
    if ((base === 'pessoa' || base === 'fada') && (s.idade || (base === 'fada' ? 'crianca' : 'adulto')) !== 'crianca') return 'aceno';
    return 'pulo';
  }
  function acao(npc, t, f) {
    var periodo = 4200 + (f % 5) * 200, ta = (t + (f >>> 4) % periodo) % periodo;
    if (ta >= ACAO_MS) return null;
    var g = gesto(npc);
    if (g === 'pulo') return { quadro: 0, dy: PULO[Math.floor(ta / 120)] };
    return { quadro: 4 | (Math.floor(ta / 240) % 2 ? 8 : 0), dy: 0 };
  }

  // os balãozinhos e os corpos desenhados neste quadro (px do canvas): as placas dos cômodos desviam dos balõezinhos
  // e, quando descem da parede, também dos corpos (interiores-placas.js)
  var bolhasQuadro = { rects: [], corpos: [] };
  _n.bolhasQuadro = bolhasQuadro;
  N.desenhar = function (pintor, npc, x, yPes, t, animar) {
    // quem lê (as placas) esvazia a lista a cada quadro; sem leitor (mapa), no máximo 64
    if (bolhasQuadro.rects.length >= 64) bolhasQuadro.rects = [];
    if (bolhasQuadro.corpos.length >= 64) bolhasQuadro.corpos = [];
    var f = fase(npc);
    var quadro = 0, dy = 0;
    var ac = animar ? acao(npc, t, f) : null;
    if (ac) { quadro = ac.quadro; dy = ac.dy; }
    else if (animar) {
      quadro = Math.floor((t + f % 700) / 700) % 2;
      if ((t + f % 3900) % 3900 < 140) quadro |= 2;   // pisca de vez em quando
    }
    if (window.Jogador && window.Jogador.sombra) window.Jogador.sombra(pintor, x, yPes, 5);
    var spr = gerar(npc.sprite, quadro);
    pintor.sprite(spr, x, yPes + 1 + dy);
    // ícone de status acima da cabeça, em px da tela, na densidade da interface (ui.md §10.11): 2 px CSS por px
    // do balãozinho (s = 2 × dpr px de aparelho), 46 px CSS de altura nos 3 tamanhos, menor que o NPC
    var st = N.status(npc);
    var b = bolha(st.icone), ctx = pintor.ctx;
    if (!ctx) return;
    var s = Math.max(1, Math.round(2 * (pintor.dpr || 1)));
    var cabeca = pintor.tela(x, yPes + 1 - spr.height + (spr.topo || 0));
    var bob = animar ? Math.round(Math.sin(t / 420 + (f % 10))) * s : 0;
    var bx = Math.round(cabeca.x - (b.width * s) / 2), by = Math.round(cabeca.y - b.height * s - s + bob);
    var bw = b.width * s, bh = b.height * s;
    // some enquanto cobre a Mariana: ela já está encostada no personagem. A conta é em px do jogo, com o
    // quadro parado e sem o balanço: câmera deslizando, respiração e sobe-e-desce não fazem o balãozinho piscar
    var spr0 = gerar(npc.sprite, 0), esc = pintor.escala || 3, meia = bw / 2 / esc;
    // o corpo parado (quadro 0, sem o pulinho), da cabeça aos pés, com a sombra de chão (3 px abaixo, 2 de cada lado)
    var c0 = pintor.tela(x - spr0.width / 2 - 2, yPes + 1 - spr0.height + (spr0.topo || 0)), c1 = pintor.tela(x + spr0.width / 2 + 2, yPes + 4);
    bolhasQuadro.corpos.push({ canvas: ctx.canvas, left: c0.x, top: c0.y, right: c1.x, bottom: c1.y });
    var baixo = yPes + 1 - spr0.height + (spr0.topo || 0) - s / esc;
    if (cobreMariana(x - meia, baixo - bh / esc, x + meia, baixo)) return;
    var antes = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(b, bx, by, bw, bh);
    bolhasQuadro.rects.push({ canvas: ctx.canvas, left: bx, top: by, right: bx + bw, bottom: by + bh });
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
