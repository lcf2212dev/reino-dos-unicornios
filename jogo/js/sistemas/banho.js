/* Banho de espuma na banheira da Pet Shop (Reino.Banho) — docs/contratos/cuidados.md.
   Tocar na banheira: ela anda até o lado dela (posto), a montaria pula na banheira e toma banho
   (~6 s, config.banho.duracaoMs): entrar (cortado na linha da espuma, como no nado), espuma crescendo
   com bolhas que sobem e estouram, escova indo e vindo, patinho balançando o tempo todo, chuveirinho
   enxaguando, pulo para fora com sacudida e gotas, brilhos de limpinho. Montada, ela desce e fica ao
   lado (só no desenho: J.montado() não muda) e volta a montar no fim; o bebê vai sozinho.
   Com Animações desligado (ou "reduzir movimento" do aparelho): versão curta (~1 s), só com brilho.
   Durante o banho a cena fica ocupada (Cena.ocupar('banho')): ela não anda nem toca em nada; depois de
   config.banho.pularDepoisMs, um toque (ou Enter/Espaço) pula para o fim.
   Tudo é desenhado a partir do tempo decorrido (sem partículas guardadas): pular é só ir ao fim.
   Nada de DOM, canvas, PA, Progresso nem Cena no carregamento: só dentro das funções.
   Em dois arquivos, nesta ordem (Reino.Banho é um só):
     banho.js          começo, fim, pulo, toque/teclado, falas e a API (iniciar, ativo, depurar)
     banho-desenho.js  o desenho: sprites, posição do unicórnio, espuma, bolhas, gotas e brilhos
   O que os dois dividem mora em Reino._banho (interno): `st` (o banho em curso ou null; sempre ler
   I.st), `B` e as funções que cada parte publica no fim dela. */
(function () {
  var R = window.Reino;
  var B = {};
  // etapas (fração da duração): entrar, espuma, esfregar, chuveiro, sacudir (pulo + sacudida), brilhos
  var FASES = [['entrar', 0], ['espuma', 0.12], ['esfregar', 0.30], ['chuveiro', 0.50], ['sacudir', 0.66], ['brilhos', 0.86]];

  var I = R._banho = { st: null, B: B };   // o que as partes do banho dividem; I.st = o banho em curso
  var ultimo = null;    // o último que terminou (para os testes)

  function cfg() { return (R.config && R.config.banho) || { duracaoMs: 6000, duracaoCurtaMs: 1000, pularDepoisMs: 2000 }; }
  function agora() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function tocar(som) { try { if (R.Som && R.Som.tocar) R.Som.tocar(som); } catch (e) {} }
  function limitar(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function trecho(s, a, b) { return limitar((s - a) / (b - a)); }
  function suave(k) { return k * k * (3 - 2 * k); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function animacoesLigadas() {
    var est = R.Progresso && R.Progresso.estado();
    return !!(est && est.ajustes && est.ajustes.animacoes !== false) && !(R.util && R.util.reduzMovimentoSistema);
  }

  /* ---------- falas ---------- */
  function retratoUni(id) {
    try {
      var P = R.Progresso, d = P.defUni(id), u = P.estado().unis[id];
      var s = PA.unicornio(d, R.Unicornios.estagio(u ? u.xp : 0), 0);
      return s ? (s.canvas || s) : null;
    } catch (e) { return null; }
  }
  // balão modal de uma frase do Reino.Cuidados, na voz de quem fala (o unicórnio ou o Claude)
  function falarFrase(chave, id) {
    var Cu = R.Cuidados, Cl = R.Claude;
    var texto = Cu && Cu.frases && Cu.frases[chave];
    if (!texto || !Cl || !Cl.falar) return Promise.resolve(null);
    var voz = Cu.vozDaFrase ? Cu.vozDaFrase(chave) : 'claude';
    var op = { modal: true, voz: voz, botoes: [{ texto: 'Ok! 👍', valor: 'ok', principal: true }] };
    if (voz === 'unicornio') {
      var P = R.Progresso;
      op.quem = { nome: (P.nomeUni && P.nomeUni(id)) || 'Unicórnio', retrato: retratoUni(id), voz: voz };
    }
    return Cl.falar(texto, op);
  }
  // sem unicórnio chocado: a narradora conta para que serve a banheira
  function falarSemUni() {
    var Cl = R.Claude, F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.petshop) || {};
    var ex = (F.extras || []).filter(function (x) { return x.para === 'banheira'; })[0];
    if (!ex || !Cl || !Cl.falar) return Promise.resolve(null);
    return Cl.falar(ex.texto, { modal: true, voz: ex.voz, quem: { nome: 'Banho de espuma', voz: ex.voz },
      botoes: [{ texto: 'Ok! 👍', valor: 'ok', principal: true }] });
  }

  /* ---------- toque e teclado durante o banho ----------
     Ouvinte próprio, na captura da janela: nada chega ao mapa nem ao HUD enquanto dura
     (o do canvas no motor/entrada.js já ignora com a cena ocupada). Depois de pularDepoisMs, pula para o fim. */
  var engolirAte = 0;
  function podePular() { return I.st && I.st.comecou && !I.st.fim && agora() - I.st.inicio >= cfg().pularDepoisMs; }
  function aoToque(e) {
    if (!I.st && agora() > engolirAte) return;
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();
    if (e.type === 'pointerdown' && podePular()) pular(true);
  }
  var TECLAS_PULAR = { Enter: 1, ' ': 1, Escape: 1 };
  var TECLAS_ANDAR = { ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, a: 1, A: 1, d: 1, D: 1, w: 1, W: 1, s: 1, S: 1 };
  function aoTeclar(e) {
    if (!I.st && agora() > engolirAte) return;
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

  /* ---------- começo, fim e pulo ---------- */
  function limparTimers() { (I.st.timers || []).forEach(clearTimeout); I.st.timers = []; }
  function depois(ms, fn) { I.st.timers.push(setTimeout(fn, ms)); }

  // a banheira da cena ativa (a da Pet Shop): { x, y, w, h } em tiles
  function acharBanheira() {
    try {
      var c = R.Cena && R.Cena.atual(), objs = (c && c._objetos) || [];
      for (var i = 0; i < objs.length; i++) if (objs[i].o.tipo === 'petshop-banheira') return { x: objs[i].o.x, y: objs[i].o.y, w: objs[i].w, h: objs[i].h };
    } catch (e) {}
    return null;
  }

  function comecar() {
    if (!I.st || I.st.comecou) return;
    var J = window.Jogador, T = 16;
    I.st.comecou = true;
    I.st.inicio = agora();
    var ban = I.st.banheira;
    if (ban) {
      var px = ban.x * T, py = ban.y * T;
      // ela olha para a banheira
      J.virar(px + 24 - J.x, 0);
      var de = J.posMontaria();
      var alto = 0;
      PA.VISTAS.forEach(function (v) { alto = Math.max(alto, I.uniSprite(v, 0).h); });
      var linha = py + 4;                                  // borda de cima da banheira (a linha da espuma)
      // pés lá dentro: as pernas somem e a espuma cobre a barriga (o bebê, mais baixinho, fica mais para cima)
      var ty = linha + 1 - Math.round(Math.max(0, 23 - alto) * 0.6);
      var tx = px + 23;
      var lx = px + 14, ly = py + 32 + 9;                  // onde ele cai ao sair: no chão, na frente da banheira
      var fim;
      if (I.st.montado) fim = { x: J.x, y: J.y + 1 };
      else {
        var dx = lx - J.x, dy = ly - 1 - J.y, dd = Math.hypot(dx, dy) || 1;
        fim = { x: J.x + dx / dd * J.DIST_BEBE, y: J.y + dy / dd * J.DIST_BEBE + 1 };
      }
      var vistaFim = I.st.montado ? PA.vistaDaDirecao(J.olharX, J.olharY) : PA.vistaDaDirecao(J.x - fim.x, J.y + 1 - fim.y);
      I.st.geo = { px: px, py: py, linha: linha, x0: de.x, y0: de.y, tx: tx, ty: ty, lx: lx, ly: ly, fx: fim.x, fy: fim.y,
        altoUni: alto, altoEntra: Math.max(18, (de.y - linha) / 2 + 6), altoSai: Math.max(22, (ly - ty) / 2 + 8),
        vistaDentro: PA.vistaDaDirecao(J.x - tx, Math.abs(J.x - tx) * 0.8 + 1), vistaFim: vistaFim };
    }
    if (I.st.curta) {
      tocar('estrela');
      depois(I.st.dur, function () { terminar(false); });
      return;
    }
    var d = I.st.dur;
    depois(0.11 * d, function () { tocar('bolhas'); });
    depois(0.30 * d, function () { tocar('esfregar'); });
    depois(0.40 * d, function () { tocar('esfregar'); });
    depois(0.50 * d, function () { tocar('chuveiro'); });
    depois(0.745 * d, function () { tocar('sacudida'); });
    depois(0.86 * d, function () { tocar('estrela'); });
    depois(d, function () { terminar(false); });
  }

  function pular(porToque) {
    if (!podePular()) return;
    I.st.pulou = true;
    terminar(porToque);
  }

  function terminar(porToque) {
    if (!I.st || I.st.fim) return;
    var s = I.st, J = window.Jogador, Cu = R.Cuidados;
    s.fim = true;
    limparTimers();
    var res = { ok: false, motivo: 'sem-cuidados' };
    try { if (Cu && Cu.banhar) res = Cu.banhar(s.uniId) || res; } catch (e) { console.error(e); }
    try {
      if (s.banheira && s.geo && J) {
        if (!s.montado && !s.curta) J.bebeVoltou(s.geo.fx, s.geo.fy - 1);
        J.virar(s.geo.px + 24 - J.x, 0);
      }
    } catch (e) { console.error(e); }
    ultimo = { ativo: false, fase: 'fim', t: Math.round(agora() - (s.inicio || agora())), curta: s.curta, uniId: s.uniId, pulou: !!s.pulou, resultado: res };
    I.st = null;
    // o toque que pulou ainda vai soltar o dedo (click): não pode apertar nada do HUD
    engolirAte = porToque ? agora() + 400 : 0;
    setTimeout(function () { if (!I.st) ouvir(false); }, porToque ? 420 : 0);
    if (R.Cena && R.Cena.liberar) R.Cena.liberar('banho');
    var fala = function () { return res.motivo === 'sem-uni' ? Promise.resolve(null) : falarFrase('banhou', s.uniId); };
    var atraso = porToque ? 450 : 0;
    new Promise(function (ok) { setTimeout(ok, atraso); })
      .then(fala)
      .catch(function (e) { console.error(e); return null; })
      .then(function () { s.resolver(Object.assign({ pulou: !!s.pulou }, res)); });
  }

  /* ---------- API ---------- */
  // op.banheira = { x, y, w, h } (tiles); sem ela, procura a da cena ativa
  B.iniciar = function (uniId, op) {
    if (I.st) return I.st.promessa;
    op = op || {};
    var P = R.Progresso, Cu = R.Cuidados, J = window.Jogador;
    uniId = uniId || (P && P.montaria && P.montaria());
    var u = uniId && P.estado().unis[uniId];
    if (!u || !u.chocado) return falarSemUni().then(function () { return { ok: false, motivo: 'sem-uni' }; });
    // barra cheia: fala gentil, sem animação
    if (Cu && Cu.niveis && Cu.niveis(uniId).banho >= 99.5) {
      return falarFrase('jaLimpinho', uniId).then(function () { return { ok: false, motivo: 'cheio' }; });
    }
    var banheira = op.banheira || acharBanheira();
    var curta = !animacoesLigadas() || !banheira;
    var resolver;
    var promessa = new Promise(function (ok) { resolver = ok; });
    I.st = { uniId: uniId, def: P.defUni(uniId), estagio: R.Unicornios.estagio(u.xp || 0), montado: J.montado(),
      sujo: !!(Cu && Cu.sujo && Cu.sujo(uniId)), curta: curta, banheira: banheira,
      dur: curta ? cfg().duracaoCurtaMs : cfg().duracaoMs, inicio: 0, comecou: false, fim: false, pulou: false,
      timers: [], promessa: promessa, resolver: resolver };
    ultimo = null;
    if (R.Cena && R.Cena.ocupar) R.Cena.ocupar('banho');
    ouvir(true);
    // ela vai até o posto (à esquerda da banheira, olhando para ela); se não der, fica onde está
    var posto = banheira ? { x: banheira.x - 1, y: banheira.y + banheira.h - 1 } : null;
    var tl = J.tile();
    if (posto && (tl.x !== posto.x || tl.y !== posto.y) && J.irPara(posto.x, posto.y, comecar)) {
      J.marcador = null;
      depois(3000, comecar);                                // demorou demais: começa onde ela estiver
    } else comecar();
    // rede de segurança: nunca fica preso ocupado
    depois(3000 + I.st.dur + 2000, function () { if (I.st) terminar(false); });
    return promessa;
  };

  B.ativo = function () { return !!I.st; };
  // o banho é quem desenha o unicórnio agora (na versão curta ele fica com ela, como sempre)
  B.desenhandoUni = function () { return !!(I.st && I.st.comecou && !I.st.curta && I.st.banheira && I.st.geo && !I.st.fim); };
  function faseEm(e) {
    if (!I.st.comecou) return 'indo';
    if (I.st.curta) return 'brilhos';
    var s = e / I.st.dur, f = 'entrar';
    FASES.forEach(function (x) { if (s >= x[1]) f = x[0]; });
    return f;
  }
  B.depurar = function () {
    if (!I.st) return ultimo || { ativo: false, fase: null, t: 0, curta: false, uniId: null, pulou: false };
    var e = I.st.comecou ? agora() - I.st.inicio : 0;
    return { ativo: true, fase: faseEm(e), t: Math.round(e), curta: I.st.curta, uniId: I.st.uniId, pulou: I.st.pulou };
  };

  // para a outra parte
  I.agora = agora; I.trecho = trecho; I.suave = suave; I.lerp = lerp;

  R.Banho = B;
  // módulo (js/nucleo/modulos.js): o desenho (banho-desenho.js) entra no quadro como camada
  if (R.registrarModulo) R.registrarModulo({ id: 'banho', depurar: function () { return B.depurar(); }, camada: {
    ativo: function () { return B.ativo(); },
    itensDesenho: function (p, t, animar) { return B.itensDesenho(p, t, animar); },
    sobre: function (ctx, p, t, animar) { B.sobre(ctx, p, t, animar); },
  } });
})();
