/* Letra cursiva: a tela de escrever (docs/contratos/cursiva.md). UI.telaCursiva({ frases, estado?, titulo?, premio? })
   → Promise(true quando as frases todas ficaram prontas; false se fechou antes). `estado` ({}): até onde ela foi
   (frase f, palavra w, ponta ks de cada traço, pronto); quem chama guarda o objeto e o devolve na próxima vez, e ela
   continua dali (nada no save).
   Em cima: "Frase 1 de 2", a frase em letra de forma e a frase toda em cursiva pequena (as palavras feitas em tinta).
   No meio, o papel: a palavra da vez grande, na pauta do caderno de caligrafia, tracejada; a bolinha verde é onde a
   caneta está e a setinha laranja diz para onde ir. O dedo (ou o mouse) só pinta seguindo o caminho, no sentido
   certo (Reino.Cursiva.seguir): ao contrário ou fora do caminho, nada sai e a setinha fica vermelha. Tocar longe da
   bolinha não começa. Pingos, acentos e o corte do t aparecem sozinhos quando a palavra acaba. "Ver como faz" mostra a
   caneta fazendo o caminho que falta (sem animação: as setinhas no caminho todo). Embaixo, a dica do que fazer.
   Pixel art: canvas em px de arte (1 = 2 px CSS), riscos por carimbo (sem serrilhado borrado). Só texto (sem voz). */
(function () {
  var R = window.Reino, U = R.util, el = U.el, UI = R.UI;
  var COR = { papel: '#fff8ee', faixa: '#eef7ff', pauta: '#5fb4ff', pautaClara: '#bfe9ff', guia: '#e2d6f3', guiaPonto: '#9b7ce0',
    tinta: '#5a3cc4', inicio: '#4cc26b', contorno: '#3a2446', seta: '#ff8a3d', forte: '#e06a12', contra: '#b02c47',
    branco: '#ffffff', mostra: '#ffc58f' };
  var DICAS = {
    comeco: 'Comece na bolinha verde e siga a setinha.',
    longe: 'Comece na bolinha verde!',
    contra: 'Por aí não! Siga a setinha.',
    solto: 'Ops! Comece de novo na bolinha verde.',
    palavra: 'Muito bem!',
    frase: 'Frase pronta!',
    teclado: 'Escreva com o dedo ou com o mouse.',
  };
  var carimbos = {};
  function carimbo(r, cor) {
    var k = r + cor;
    if (carimbos[k]) return carimbos[k];
    var c = document.createElement('canvas'), x = c.getContext('2d');
    c.width = c.height = 2 * r + 1;
    x.fillStyle = cor;
    for (var i = -r; i <= r; i++) for (var j = -r; j <= r; j++) if (i * i + j * j <= r * r + r * 0.6) x.fillRect(i + r, j + r, 1, 1);
    return (carimbos[k] = c);
  }
  function agora() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  var aberta = null;
  // a tela saiu da pilha sem o ✕ (UI.fecharTodas, troca de cena): a promessa resolve do mesmo jeito
  U.on(R.EVENTOS.TELAS, function () { if (aberta && R._ui.pilha.indexOf(aberta.tela) < 0) aberta.fim(); });

  UI.telaCursiva = function (op) {
    op = op || {};
    var C = R.Cursiva;
    if (!C || !Array.isArray(op.frases) || !op.frases.length) return Promise.resolve(false);
    return new Promise(function (resolver) {
      var cfg = (R.config && R.config.cursiva) || {}, est = op.estado || {};
      var Jg = window.Jogador;
      if (Jg && Jg.parar) Jg.parar();
      var frases = op.frases.map(function (t) { return C.frase(t); });
      if (!(est.f >= 0 && est.f < frases.length)) { est.f = 0; est.w = 0; est.ks = null; est.pronto = false; }
      var acabou = false;
      var pn = UI.painel('cursiva', op.titulo || 'Letra cursiva', { icone: '✏', aoFechar: function () { fim(!!est.pronto); } });
      var tela = pn.tela;
      var conta = el('p.cursiva-conta'), modelo = el('p.cursiva-modelo');
      var cvFrase = el('canvas.cursiva-frase', { 'aria-hidden': 'true' });
      var cv = el('canvas.cursiva-palco');
      var papel = el('div.cursiva-papel', cv);
      var dica = el('p.cursiva-dica');
      var ver = el('button.btn-secundario.cursiva-ver', { type: 'button' }, 'Ver como faz');
      var pegar = el('button.btn-grande.btn-principal.cursiva-pegar', { type: 'button', hidden: true }, op.premio || 'Pronto!');
      pn.conteudo.appendChild(el('div.cursiva', el('div.cursiva-cima', conta, modelo), cvFrase, papel,
        el('div.cursiva-baixo', dica, ver), pegar));
      var ctx = cv.getContext('2d'), fundo = document.createElement('canvas'), tinta = document.createElement('canvas');
      var L = null, contra = false, mostra = null, raf = 0, trocando = null, dedo = null, ultimoAviso = 0, soltoAvisado = false;

      function fim(ok) {
        if (acabou) return;
        acabou = true;
        if (aberta && aberta.tela === tela) aberta = null;
        window.removeEventListener('resize', medirDepois);
        if (raf) cancelAnimationFrame(raf);
        if (trocando) { clearTimeout(trocando); trocando = null; seguinte(); }   // fechou na pausa: volta já na próxima palavra
        resolver(ok || !!est.pronto);
      }
      aberta = { tela: tela, fim: function () { fim(false); } };

      function frase() { return frases[est.f]; }
      function palavra() { return frase().palavras[est.w]; }
      function ks() {
        var p = palavra();
        if (!Array.isArray(est.ks) || est.ks.length !== p.tracos.length) est.ks = p.tracos.map(function () { return 0; });
        return est.ks;
      }
      function feito(tr, k) { return tr.s[k] >= tr.comp - 0.2; }   // o fim é a saidinha: o dedo parado ali já vale
      // o traço da vez: o 1º que ainda não chegou ao fim
      function tracoAtual() {
        var p = palavra(), k = ks();
        for (var i = 0; i < p.tracos.length; i++) if (!feito(p.tracos[i], k[i])) return { i: i, tr: p.tracos[i], k: k[i] };
        return null;
      }
      function dizer(t) { U.preencher(dica, t); }

      /* ---------- medir e montar as camadas (fundo: papel, pauta e tracejado; tinta: o que ela fez) ---------- */
      function medir() {
        var p = palavra(), larg = Math.max(1, p.larg), w = Math.max(80, Math.floor(papel.clientWidth / 2));
        var altaTela = Math.floor((window.innerHeight || 700) * 0.42 / 2);
        var E = Math.floor(Math.min((w - 12) / (larg + 0.6), (altaTela - 8) / 3.7, cfg.xAlturaMax || 30));
        E = Math.max(10, E);
        var h = Math.ceil(E * 3.7) + 8;
        L = { E: E, w: w, h: h, ox: Math.round((w - larg * E) / 2), base: Math.round(E * 2.45) + 4,
          rg: Math.max(1, Math.round(E * 0.11)), rt: Math.max(1, Math.round(E * 0.1)) };
        [cv, fundo, tinta].forEach(function (c) { c.width = w; c.height = h; });
        cv.style.width = (w * 2) + 'px'; cv.style.height = (h * 2) + 'px';
        cv.dataset.e = E; cv.dataset.ox = L.ox; cv.dataset.base = L.base; cv.dataset.frase = est.f; cv.dataset.palavra = est.w; cv.dataset.texto = frase().texto;
        pintarFundo();
        pintarTinta();
        pintarFrase();
        pedir();
      }
      var medindo = 0;
      function medirDepois() { clearTimeout(medindo); medindo = setTimeout(function () { if (!acabou) medir(); }, 120); }
      window.addEventListener('resize', medirDepois);
      function X(u) { return L.ox + u * L.E; }
      function Y(v) { return L.base - v * L.E; }
      function linha(x, y0, larg, cor, tracejada) {
        x.fillStyle = cor;
        for (var i = 0; i < larg; i++) if (!tracejada || i % 6 < 3) x.fillRect(i, y0, 1, 1);
      }
      function carimbar(x, tr, de, ate, r, cor, passo) {
        var c = carimbo(r, cor);
        for (var j = de; j <= ate; j += (passo || 1)) x.drawImage(c, Math.round(X(tr.x[j])) - r, Math.round(Y(tr.y[j])) - r);
      }
      function marcas(x, p, r, cor) {
        p.marcas.forEach(function (m) {
          if (m.tipo === 'ponto') { var c = carimbo(r + 1, cor); x.drawImage(c, Math.round(X(m.x[0])) - r - 1, Math.round(Y(m.y[0])) - r - 1); return; }
          var cc = carimbo(r, cor);
          for (var i = 1; i < m.x.length; i++) {
            var n = Math.max(1, Math.ceil(Math.hypot(m.x[i] - m.x[i - 1], m.y[i] - m.y[i - 1]) * L.E));
            for (var j = 0; j <= n; j++) {
              var u = m.x[i - 1] + (m.x[i] - m.x[i - 1]) * j / n, v = m.y[i - 1] + (m.y[i] - m.y[i - 1]) * j / n;
              x.drawImage(cc, Math.round(X(u)) - r, Math.round(Y(v)) - r);
            }
          }
        });
      }
      function pintarFundo() {
        var x = fundo.getContext('2d'), p = palavra();
        x.fillStyle = COR.papel; x.fillRect(0, 0, L.w, L.h);
        x.fillStyle = COR.faixa; x.fillRect(0, Math.round(Y(1)), L.w, Math.round(Y(0)) - Math.round(Y(1)));
        linha(x, Math.round(Y(2)), L.w, COR.pautaClara, true);
        linha(x, Math.round(Y(1)), L.w, COR.pautaClara);
        linha(x, Math.round(Y(0)), L.w, COR.pauta);
        linha(x, Math.round(Y(-1)), L.w, COR.pautaClara, true);
        var cada = Math.max(2, Math.round(4 / (C.PASSO * L.E)));
        p.tracos.forEach(function (tr) {
          carimbar(x, tr, 0, tr.n - 1, L.rg, COR.guia);
          carimbar(x, tr, 0, tr.n - 1, 0, COR.guiaPonto, cada);
        });
      }
      function pintarTinta() {
        var x = tinta.getContext('2d'), p = palavra(), k = ks();
        x.clearRect(0, 0, L.w, L.h);
        p.tracos.forEach(function (tr, i) { if (k[i] > 0) carimbar(x, tr, 0, k[i], L.rt, COR.tinta); });
        if (!tracoAtual()) marcas(x, p, L.rt, COR.tinta);
      }
      // a frase toda, pequena: as palavras feitas em tinta, a da vez tracejada mais forte
      function pintarFrase() {
        var f = frase(), w = Math.max(60, Math.floor(papel.clientWidth / 2));
        var e = Math.max(4, Math.min(9, Math.floor((w - 8) / (f.larg + 0.4))));
        var h = Math.ceil(e * 3.6) + 2, ox = Math.round((w - f.larg * e) / 2), base = Math.round(e * 2.45) + 1;
        cvFrase.width = w; cvFrase.height = h;
        cvFrase.style.width = (w * 2) + 'px'; cvFrase.style.height = (h * 2) + 'px';
        var x = cvFrase.getContext('2d');
        x.clearRect(0, 0, w, h);
        f.palavras.forEach(function (p, i) {
          var cor = i < est.w || est.pronto ? COR.tinta : i === est.w ? COR.guiaPonto : COR.guia;
          var c = carimbo(0, cor);
          function ponto(u, v) { x.drawImage(c, Math.round(ox + (p.x0 + u) * e), Math.round(base - v * e)); }
          p.tracos.forEach(function (tr) { for (var j = 0; j < tr.n; j++) ponto(tr.x[j], tr.y[j]); });
          if (i < est.w || est.pronto) p.marcas.forEach(function (m) { for (var j = 0; j < m.x.length; j++) ponto(m.x[j], m.y[j]); });
        });
      }

      /* ---------- desenhar: fundo + tinta + a ponta (bolinha e setinhas) + a caneta do "Ver como faz" ---------- */
      // a setinha em j aponta para onde o caminho chega em j (de 3 amostras antes): antes de um bico, aponta para ele
      function seta(x, tr, j, cor, r) {
        var a = Math.max(0, j - 3), b = Math.max(a + 1, j);
        var dx = X(tr.x[b]) - X(tr.x[a]), dy = Y(tr.y[b]) - Y(tr.y[a]), d = Math.hypot(dx, dy) || 1;
        dx /= d; dy /= d;
        var px = X(tr.x[j]), py = Y(tr.y[j]), t = Math.max(4, Math.round(L.E * 0.26)), c = carimbo(r, cor);
        [[1, 1], [1, -1]].forEach(function (lado) {
          for (var i = 0; i <= t; i++) {
            var f = i / t;
            x.drawImage(c, Math.round(px - dx * t * f + (-dy) * lado[1] * t * 0.7 * f) - r, Math.round(py - dy * t * f + dx * lado[1] * t * 0.7 * f) - r);
          }
        });
      }
      function indice(tr, k, ds) {
        var alvo = tr.s[k] + ds, j = k;
        while (j < tr.n - 1 && tr.s[j] < alvo) j++;
        return j;
      }
      // o próximo bico (virada seca: o alto do i, o fundo do m) até `ate` de arco à frente da ponta, ou -1
      function bico(tr, k, ate) {
        for (var j = k + 3; j < tr.n - 2 && tr.s[j] - tr.s[k] <= ate; j++) {
          if (tr.dx[j - 3] * tr.dx[j + 1] + tr.dy[j - 3] * tr.dy[j + 1] < -0.3) return j;
        }
        return -1;
      }
      // onde vão as setinhas: com um bico logo à frente, só uma (no vai-e-volta do t, do i e do m, duas cairiam uma em
      // cima da outra): longe do bico, bem antes dele e apontando para ele (vá até lá); perto, depois dele, para onde
      // virar, a pelo menos 0,35 da bolinha (senão fica debaixo dela); sem bico, duas
      function lugaresDasSetas(tr, k) {
        var b = bico(tr, k, 0.7);
        if (b > 0) {
          var falta = tr.s[b] - tr.s[k];
          return falta > 0.35 ? [indice(tr, k, falta - 0.06)] : [indice(tr, b, Math.max(0.3, falta + 0.35))];
        }
        return [indice(tr, k, 0.38), indice(tr, k, 0.8)];
      }
      function desenhar() {
        raf = 0;
        if (acabou || !L) return;
        ctx.clearRect(0, 0, L.w, L.h);
        ctx.drawImage(fundo, 0, 0);
        ctx.drawImage(tinta, 0, 0);
        var t = tracoAtual(), anima = U.animar();
        if (mostra && t) {
          var tm = mostra, tr0 = tm.tr;
          if (anima) {
            var ate = Math.min(tr0.n - 1, indice(tr0, tm.k, (agora() - tm.t0) / 1000 * 2.2));
            carimbar(ctx, tr0, tm.k, ate, L.rt, COR.mostra);
            seta(ctx, tr0, ate, COR.seta, 1);
            if (ate >= tr0.n - 1) mostra = null;
          } else {
            carimbar(ctx, tr0, tm.k, tr0.n - 1, Math.max(1, L.rt - 1), COR.mostra);
            for (var j = indice(tr0, tm.k, 0.5); j < tr0.n - 3; j = indice(tr0, j, 1.2)) seta(ctx, tr0, j, COR.forte, 1);
            if (agora() - tm.t0 > 2500) mostra = null;
          }
        }
        if (t) {
          var cor = contra ? COR.contra : COR.seta;
          if (!mostra) lugaresDasSetas(t.tr, t.k).forEach(function (j) { if (j > t.k + 2 && j < t.tr.n - 1) seta(ctx, t.tr, j, cor, 1); });
          var rb = Math.max(3, Math.round(L.E * 0.16)), px = Math.round(X(t.tr.x[t.k])), py = Math.round(Y(t.tr.y[t.k]));
          ctx.drawImage(carimbo(rb + 1, COR.contorno), px - rb - 1, py - rb - 1);
          ctx.drawImage(carimbo(rb, COR.inicio), px - rb, py - rb);
          ctx.fillStyle = COR.branco; ctx.fillRect(px - 1, py - 1, 1, 1);
        }
        cv.dataset.ponta = t ? t.i + ':' + t.k : 'fim';
        if (mostra) raf = requestAnimationFrame(desenhar);
      }
      function pedir() { if (!raf) raf = requestAnimationFrame(desenhar); }

      /* ---------- o dedo ---------- */
      function unid(e) {
        var r = cv.getBoundingClientRect();
        var ax = (e.clientX - r.left) / r.width * L.w, ay = (e.clientY - r.top) / r.height * L.h;
        return { x: (ax - L.ox) / L.E, y: (L.base - ay) / L.E };
      }
      function avisar(qual) {
        var t = agora();
        dizer(DICAS[qual]);
        if (t - ultimoAviso > 900) { R.Som.tocar('toque'); ultimoAviso = t; }
      }
      // a op do dedo pelo tamanho da letra na tela (Cursiva.opTela: tolerância, toque inicial e passada em px)
      function opDedo() { return C.opTela(L.E * cv.getBoundingClientRect().width / L.w || L.E * 2); }
      cv.addEventListener('pointerdown', function (e) {
        if (dedo || est.pronto || trocando || !L || (e.button && e.button > 0)) return;
        var t = tracoAtual(), u = unid(e);
        if (!t) return;
        e.preventDefault();
        dedo = C.tocar(t.tr, t.k, u.x, u.y, opDedo());
        dedo.id = e.pointerId;
        soltoAvisado = false;
        try { cv.setPointerCapture(e.pointerId); } catch (x) { /* sem captura */ }
        if (dedo.pegou) { mostra = null; contra = false; dizer(DICAS.comeco); } else { contra = true; avisar('longe'); }
        pedir();
      });
      cv.addEventListener('pointermove', function (e) {
        if (!dedo || e.pointerId !== dedo.id) return;
        e.preventDefault();
        var lista = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
        (lista.length ? lista : [e]).forEach(function (ev) { if (dedo) mover(unid(ev)); });
      });
      function soltar(e) { if (dedo && e.pointerId === dedo.id) dedo = null; }
      cv.addEventListener('pointerup', soltar);
      cv.addEventListener('pointercancel', soltar);
      function mover(u) {
        var t = tracoAtual();
        if (!t) return;
        var k0 = dedo.k, antes = contra;
        C.arrastar(dedo, u.x, u.y);
        if (dedo.k > k0) {
          carimbar(tinta.getContext('2d'), t.tr, k0, dedo.k, L.rt, COR.tinta);
          ks()[t.i] = dedo.k;
          if (feito(t.tr, dedo.k)) {
            ks()[t.i] = t.tr.n - 1;
            carimbar(tinta.getContext('2d'), t.tr, dedo.k, t.tr.n - 1, L.rt, COR.tinta);
            if (!tracoAtual()) { contra = false; palavraPronta(); pedir(); return; }
            // a palavra tem outro traço (o O maiúsculo levanta a caneta): o dedo começa de novo na bolinha
            dedo = null;
          }
        }
        contra = !!(dedo && dedo.contra);
        if (dedo && dedo.solto && !soltoAvisado) { soltoAvisado = true; avisar('solto'); }
        else if (contra && !antes) avisar('contra');
        else if (!contra && antes) dizer(DICAS.comeco);
        pedir();
      }

      /* ---------- palavra, frase e o fim ---------- */
      function palavraPronta() {
        dedo = null; mostra = null; contra = false;
        pintarTinta();
        var f = frase(), ultimaPalavra = est.w >= f.palavras.length - 1, ultimaFrase = est.f >= frases.length - 1;
        if (ultimaPalavra && ultimaFrase) { est.pronto = true; pintarFrase(); terminar(); return; }
        R.Som.tocar(ultimaPalavra ? 'plim' : 'acerto');
        dizer(ultimaPalavra ? DICAS.frase : DICAS.palavra);
        ver.disabled = true;
        trocando = setTimeout(function () {
          trocando = null;
          if (acabou) return;
          seguinte();
          ver.disabled = false;
          mostrar();
        }, (cfg.esperaPalavraMs || 700) * (ultimaPalavra ? 1.4 : 1));
      }
      function seguinte() {
        if (est.w >= frase().palavras.length - 1) { est.f++; est.w = 0; } else est.w++;
        est.ks = null;
      }
      function terminar() {
        var n = frases.length;
        dizer(n === 1 ? 'Você escreveu a frase!' : 'Você escreveu as ' + n + ' frases!');
        ver.hidden = true;
        pegar.hidden = false;
        UI.festa(2, { titulo: dica });
        pedir();
        if (UI.porTeclado && UI.porTeclado()) setTimeout(function () { if (!acabou) UI.focarTeclado(pegar, 400); }, 60);
      }
      pegar.addEventListener('click', function () { R.Som.tocar('toque'); UI.fecharTela(tela); fim(true); });
      ver.addEventListener('click', function () {
        var t = tracoAtual();
        if (!t || trocando) return;
        R.Som.tocar('toque');
        mostra = { tr: t.tr, k: t.k, t0: agora() };
        pedir();
      });

      function mostrar() {
        var f = frase();
        U.preencher(conta, frases.length > 1 ? 'Frase ' + (est.f + 1) + ' de ' + frases.length : 'Frase');
        U.preencher(modelo, f.texto);
        if (est.pronto) { terminar(); } else dizer(UI.porTeclado && UI.porTeclado() ? DICAS.teclado : DICAS.comeco);
        medir();
      }
      Reino.Som.tocar('porta');
      // o papel só tem largura depois de entrar na página
      setTimeout(function () { if (!acabou) mostrar(); }, 0);
    });
  };
})();
