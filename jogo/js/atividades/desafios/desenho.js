/* Desafio desenho: prancheta de pixel art 24×24 com lápis, linha, formas e borracha, por toque ou teclado
   (D.desenhoFaltam, D.desenhoCumpriu, D.miniaturaDesenho para a correção da prova). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;

  /* ---------- desenho: prancheta de pixel art ----------
     { tipo: 'desenho', pergunta, requisitos: ['linhas', 'formas', 'cores'] }
     valor: { px: 'string de 24x24 dígitos (0 = vazio, 1-8 = cor)', usou: { linhas, formas, cores: [índices] } }
     Vale 1 só quando todos os requisitos foram cumpridos.
     Teclado: a prancheta entra no Tab; setas andam um cursor (só aparece com o foco vindo do teclado), Enter/Espaço
     pintam; linha e formas: Enter no começo e Enter no fim, como o arraste; Esc desiste do começo.
     guardar: true (4º bimestre): o desenho certo fica em Reino.Producoes e volta ao abrir de novo a questão. */
  var GRADE = 24;
  var CORES_DESENHO = [
    ['#3a2446', 'Preto'], ['#ff4d6d', 'Vermelho'], ['#ffa133', 'Laranja'], ['#ffd93d', 'Amarelo'],
    ['#4cc26b', 'Verde'], ['#4d8dff', 'Azul'], ['#9b5cff', 'Roxo'], ['#ff8fc8', 'Rosa'],
  ];
  var NOME_REQUISITO = { linhas: 'linhas', formas: 'formas', cores: 'cores' };

  function requisitoOk(r, usou) {
    usou = usou || {};
    if (r === 'linhas') return !!usou.linhas;
    if (r === 'formas') return !!usou.formas;
    if (r === 'cores') return (usou.cores || []).length >= 2;
    return false;
  }
  D.desenhoFaltam = function (d, valor) {
    return (d.requisitos || []).filter(function (r) { return !requisitoOk(r, valor && valor.usou); }).map(function (r) { return NOME_REQUISITO[r] || r; });
  };
  D.desenhoCumpriu = function (d, valor) { return !!(valor && valor.px) && D.desenhoFaltam(d, valor).length === 0; };

  // riscos na grade (todos devolvem uma lista de [x, y])
  function riscoLinha(x0, y0, x1, y1) {
    var pts = [], dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
    for (;;) {
      pts.push([x0, y0]);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return pts;
  }
  // caixa quadrada a partir do arraste (um toque só faz uma forma de tamanho médio)
  function caixa(x0, y0, x1, y1) {
    var lado = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    if (lado < 2) { lado = 6; x0 -= 3; y0 -= 3; x1 = x0 + 1; y1 = y0 + 1; }
    var sx = x1 < x0 ? -1 : 1, sy = y1 < y0 ? -1 : 1;
    var xa = x0, xb = x0 + sx * lado, ya = y0, yb = y0 + sy * lado;
    return { x: Math.min(xa, xb), y: Math.min(ya, yb), l: lado };
  }
  function riscoForma(forma, x0, y0, x1, y1) {
    var c = caixa(x0, y0, x1, y1), x = c.x, y = c.y, l = c.l, pts = [];
    function seg(a, b, cc, dd) { pts = pts.concat(riscoLinha(a, b, cc, dd)); }
    if (forma === 'quadrado') { seg(x, y, x + l, y); seg(x + l, y, x + l, y + l); seg(x + l, y + l, x, y + l); seg(x, y + l, x, y); }
    else if (forma === 'triangulo') { var m = x + Math.round(l / 2); seg(x, y + l, x + l, y + l); seg(x + l, y + l, m, y); seg(m, y, x, y + l); }
    else {
      var r = l / 2, cx = x + r, cy = y + r, ant = null, passos = Math.max(16, Math.round(l * 4));
      for (var i = 0; i <= passos; i++) {
        var a = (i / passos) * Math.PI * 2;
        var p = [Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r)];
        if (ant) seg(ant[0], ant[1], p[0], p[1]);
        ant = p;
      }
    }
    return pts;
  }

  // desenha a grade num canvas (tam = pixels por quadradinho)
  function pintarGrade(canvas, px, tam, comLinhas) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < GRADE * GRADE; i++) {
      var c = +px[i];
      if (!c) continue;
      ctx.fillStyle = CORES_DESENHO[c - 1][0];
      ctx.fillRect((i % GRADE) * tam, Math.floor(i / GRADE) * tam, tam, tam);
    }
    if (comLinhas) {
      ctx.fillStyle = 'rgba(58, 36, 70, 0.08)';
      for (var k = 1; k < GRADE; k++) { ctx.fillRect(k * tam, 0, 1, canvas.height); ctx.fillRect(0, k * tam, canvas.width, 1); }
    }
  }

  // miniatura do desenho salvo (para a correção)
  D.miniaturaDesenho = function (valor, tam) {
    if (!valor || !valor.px) return null;
    tam = tam || 4;
    var c = document.createElement('canvas');
    c.width = c.height = GRADE * tam;
    c.className = 'pixel desenho-mini';
    pintarGrade(c, valor.px, tam, false);
    return c;
  };

  // ícones das formas (16×16 cheios, com contorno, como os de js/arte/icones/)
  var P_FORMA = { k: '#3a2446', r: '#ff8fc8', R: '#ffd0e8', a: '#4d8dff', A: '#b8d4ff', v: '#4cc26b', V: '#b4f5b8' };
  if (Reino.registrarIcones && !(window.ICONES || {})['desenho:circulo']) Reino.registrarIcones({
    'desenho:circulo': { n: 'círculo', p: P_FORMA, d: [
      '................', '.....kkkkkk.....', '...kkRRrrrrkk...', '..kRRrrrrrrrrk..', '..kRrrrrrrrrrk..', '.kRrrrrrrrrrrrk.',
      '.kRrrrrrrrrrrrk.', '.krrrrrrrrrrrrk.', '.krrrrrrrrrrrrk.', '.krrrrrrrrrrrrk.', '.krrrrrrrrrrrrk.', '..krrrrrrrrrrk..',
      '..krrrrrrrrrrk..', '...kkrrrrrrkk...', '.....kkkkkk.....', '................'] },
    'desenho:quadrado': { n: 'quadrado', p: P_FORMA, d: [
      '................', '.kkkkkkkkkkkkkk.', '.kAAAAAAAAAAAAk.', '.kAaaaaaaaaaaak.', '.kAaaaaaaaaaaak.', '.kAaaaaaaaaaaak.',
      '.kAaaaaaaaaaaak.', '.kAaaaaaaaaaaak.', '.kAaaaaaaaaaaak.', '.kAaaaaaaaaaaak.', '.kAaaaaaaaaaaak.', '.kAaaaaaaaaaaak.',
      '.kAaaaaaaaaaaak.', '.kaaaaaaaaaaaak.', '.kkkkkkkkkkkkkk.', '................'] },
    'desenho:triangulo': { n: 'triângulo', p: P_FORMA, d: [
      '................', '.......kk.......', '......kVVk......', '......kVvk......', '.....kVvvvk.....', '.....kVvvvk.....',
      '....kVvvvvvk....', '....kVvvvvvk....', '...kVvvvvvvvk...', '...kVvvvvvvvk...', '..kVvvvvvvvvvk..', '..kvvvvvvvvvvk..',
      '.kvvvvvvvvvvvvk.', '.kvvvvvvvvvvvvk.', '.kkkkkkkkkkkkkk.', '................'] },
  });
  // ícone de ferramenta a 32 px nítidos (formas e emojis iguais)
  function iconeFerr(chave) {
    var c = PA.iconeEmoji(chave, 2), lado = c.width * PA.escalaNitida(32, c.width);
    c.style.width = lado + 'px';
    c.style.height = (c.height * lado / c.width) + 'px';
    c.classList.add('desenho-icone-ferr');
    return c;
  }

  // d.guardar (4º bimestre): sem resposta dada (a prova passa a dela), começa com o desenho guardado (só nas salas).
  // Ele foi guardado ao acertar: linhas e formas já foram feitas; as cores saem da grade
  function desenhoGuardado(d, opts) {
    if (!d.guardar || opts.valorInicial != null || opts.modo === 'prova' || !Reino.Producoes) return null;
    var g = Reino.Producoes.ler(d.id), cores = [];
    if (!g || !g.px) return null;
    g.px.split('').forEach(function (c) { c = +c; if (c && cores.indexOf(c) < 0) cores.push(c); });
    return { px: g.px, usou: { linhas: true, formas: true, cores: cores } };
  }

  var montar = function (d, opts) {
    var ini = opts.valorInicial || desenhoGuardado(d, opts) || {};
    var px = (ini.px && ini.px.length === GRADE * GRADE ? ini.px : new Array(GRADE * GRADE + 1).join('0')).split('');
    var usou = { linhas: !!(ini.usou && ini.usou.linhas), formas: !!(ini.usou && ini.usou.formas), cores: ((ini.usou && ini.usou.cores) || []).slice() };
    var ferramenta = 'lapis', cor = 1;
    var TAM = 12;
    var canvas = el('canvas.desenho-tela', { width: GRADE * TAM, height: GRADE * TAM, tabindex: '0', 'aria-label': 'Prancheta de desenho' });
    var wrap = el('div.desenho');

    var FERRAMENTAS = [
      ['lapis', 'Lápis', '✏'], ['linha', 'Linha', '📏'],
      ['circulo', 'Círculo', null], ['quadrado', 'Quadrado', null], ['triangulo', 'Triângulo', null],
      ['borracha', 'Borracha', '🧹'],
    ];
    var botoesFerr = {};
    var barraFerr = el('div.desenho-ferramentas', FERRAMENTAS.map(function (f) {
      var b = el('button.desenho-ferr', { type: 'button', 'aria-label': f[1], title: f[1] },
        iconeFerr(f[2] || 'desenho:' + f[0]), el('small', f[1]));
      b.addEventListener('click', function () { if (ctrl.travado) return; ferramenta = f[0]; Reino.Som.tocar('toque'); pintarBotoes(); });
      botoesFerr[f[0]] = b;
      return b;
    }));
    var limpar = el('button.desenho-ferr.desenho-limpar', { type: 'button', 'aria-label': 'Limpar tudo', title: 'Limpar' }, iconeFerr('🗑'), el('small', 'Limpar'));
    limpar.addEventListener('click', function () {
      if (ctrl.travado) return;
      Reino.UI.confirmar('Apagar o desenho inteiro e começar de novo?', 'Apagar', 'Não').then(function (sim) {
        if (!sim) return;
        px = new Array(GRADE * GRADE + 1).join('0').split('');
        usou = { linhas: false, formas: false, cores: [] };
        redesenhar(); pintarRequisitos(); opts.onMudar();
      });
    });
    barraFerr.appendChild(limpar);

    var botoesCor = [];
    var paleta = el('div.desenho-paleta', CORES_DESENHO.map(function (c, i) {
      var b = el('button.desenho-cor', { type: 'button', 'aria-label': c[1], title: c[1], style: { background: c[0] } });
      b.addEventListener('click', function () {
        if (ctrl.travado) return;
        cor = i + 1;
        if (ferramenta === 'borracha') ferramenta = 'lapis';
        Reino.Som.tocar('selecionar'); pintarBotoes();
      });
      botoesCor.push(b);
      return b;
    }));

    var reqs = (d.requisitos || []).map(function (r) {
      var li = el('li.desenho-req', el('span.req-marca'), el('span', NOME_REQUISITO[r] || r));
      return { r: r, li: li };
    });
    var listaReq = el('ul.desenho-requisitos', reqs.map(function (q) { return q.li; }));

    function pintarBotoes() {
      Object.keys(botoesFerr).forEach(function (k) { botoesFerr[k].setAttribute('aria-pressed', String(k === ferramenta)); });
      botoesCor.forEach(function (b, i) { b.setAttribute('aria-pressed', String(ferramenta !== 'borracha' && cor === i + 1)); });
    }
    function pintarRequisitos() {
      reqs.forEach(function (q) {
        var ok = requisitoOk(q.r, usou);
        q.li.classList.toggle('feito', ok);
        U.preencher(q.li.firstChild, ok ? '✓' : '');
      });
    }
    function redesenhar(extra, corExtra) {
      pintarGrade(canvas, px, TAM, true);
      var ctx = canvas.getContext('2d');
      if (extra) {
        ctx.fillStyle = corExtra ? CORES_DESENHO[corExtra - 1][0] : '#ffffff';
        extra.forEach(function (p) { ctx.fillRect(p[0] * TAM, p[1] * TAM, TAM, TAM); });
      }
      if (comCursor()) {
        if (marca) moldura(ctx, marca.x0, marca.y0, true);
        moldura(ctx, cursor[0], cursor[1], false);
      }
    }
    // cursor do teclado: anel escuro de 2 px por fora do quadradinho e 2 px brancos por dentro (aparece sobre qualquer
    // cor da paleta). O começo marcado (linha e formas) fica só com os cantos escuros, aberto no meio de cada lado
    function moldura(ctx, x, y, soCantos) {
      var a = x * TAM - 2, b = y * TAM - 2, l = TAM + 4;
      function anel(a, b, l, t) { ctx.fillRect(a, b, l, t); ctx.fillRect(a, b + l - t, l, t); ctx.fillRect(a, b, t, l); ctx.fillRect(a + l - t, b, t, l); }
      ctx.fillStyle = '#3a2446';
      if (!soCantos) anel(a, b, l, 2);
      else {
        var c = l - 6, d = l - 2;
        [[0, 0], [c, 0], [0, d], [c, d]].forEach(function (p) { ctx.fillRect(a + p[0], b + p[1], 6, 2); });
        [[0, 0], [d, 0], [0, c], [d, c]].forEach(function (p) { ctx.fillRect(a + p[0], b + p[1], 2, 6); });
      }
      ctx.fillStyle = '#ffffff'; anel(x * TAM, y * TAM, TAM, 2);
    }
    function aplicar(pts, valor) {
      var mudou = false;
      pts.forEach(function (p) {
        if (p[0] < 0 || p[1] < 0 || p[0] >= GRADE || p[1] >= GRADE) return;
        var i = p[1] * GRADE + p[0];
        if (px[i] !== String(valor)) { px[i] = String(valor); mudou = true; }
      });
      if (mudou && valor && usou.cores.indexOf(valor) < 0) usou.cores.push(valor);
      return mudou;
    }
    function dentro(pts) { return pts.filter(function (p) { return p[0] >= 0 && p[1] >= 0 && p[0] < GRADE && p[1] < GRADE; }); }
    function borrachaEm(x, y) { return [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]]; }

    // toque/arraste (mouse, dedo ou caneta)
    var arraste = null;
    function celula(ev) {
      var r = canvas.getBoundingClientRect();
      return [U.clamp(Math.floor((ev.clientX - r.left) / r.width * GRADE), 0, GRADE - 1),
        U.clamp(Math.floor((ev.clientY - r.top) / r.height * GRADE), 0, GRADE - 1)];
    }
    canvas.addEventListener('pointerdown', function (ev) {
      if (ctrl.travado) return;
      ev.preventDefault();
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) {}
      var c = celula(ev);   // antes de mexer na tela
      peloTeclado = false; marca = null; mostrarDica();
      arraste = { id: ev.pointerId, x0: c[0], y0: c[1], x: c[0], y: c[1] };
      if (ferramenta === 'lapis') aplicar([c], cor);
      else if (ferramenta === 'borracha') aplicar(borrachaEm(c[0], c[1]), 0);
      mover();
    });
    canvas.addEventListener('pointermove', function (ev) {
      if (!arraste || ev.pointerId !== arraste.id) return;
      ev.preventDefault();
      var c = celula(ev);
      if (c[0] === arraste.x && c[1] === arraste.y) return;
      if (ferramenta === 'lapis') aplicar(riscoLinha(arraste.x, arraste.y, c[0], c[1]), cor);
      else if (ferramenta === 'borracha') riscoLinha(arraste.x, arraste.y, c[0], c[1]).forEach(function (p) { aplicar(borrachaEm(p[0], p[1]), 0); });
      arraste.x = c[0]; arraste.y = c[1];
      mover();
    });
    // a = o arraste do dedo ou a marca do teclado: { x0, y0 } é o começo, { x, y } onde está agora
    function previa(a) {
      if (ferramenta === 'linha') return riscoLinha(a.x0, a.y0, a.x, a.y);
      if (ferramenta === 'circulo' || ferramenta === 'quadrado' || ferramenta === 'triangulo') return riscoForma(ferramenta, a.x0, a.y0, a.x, a.y);
      return null;
    }
    function mover() { var a = arraste || marca, p = a && previa(a); redesenhar(p ? dentro(p) : null, cor); }
    // fim do arraste (ou o 2º Enter): linha e formas entram na grade e contam nos requisitos
    function concluir(a) {
      var p = previa(a);
      if (p) {
        var mudou = aplicar(p, cor);
        if (ferramenta === 'linha' && (a.x !== a.x0 || a.y !== a.y0)) usou.linhas = true;
        else if (ferramenta !== 'linha' && mudou) usou.formas = true;
      }
      Reino.Som.tocar('toque');
      redesenhar(); pintarRequisitos(); opts.onMudar();
    }
    function soltar(ev) {
      if (!arraste || ev.pointerId !== arraste.id) return;
      var a = arraste;
      arraste = null;
      concluir(a);
    }
    canvas.addEventListener('pointerup', soltar);
    canvas.addEventListener('pointercancel', soltar);
    // no celular, o dedo na prancheta não rola a página
    canvas.addEventListener('touchmove', function (ev) { ev.preventDefault(); }, { passive: false });

    // teclado: cursor na grade, visível só com o foco vindo do teclado (o toque não muda nada)
    var SETAS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    var cursor = [GRADE / 2, GRADE / 2], marca = null, peloTeclado = false;
    // as dicas ficam empilhadas no mesmo lugar (css): o espaço é sempre o da maior e a prancheta nunca pula
    var DICAS = { pinta: 'Setas andam, Enter pinta.', apaga: 'Setas andam, Enter apaga.',
      comeco: 'Setas andam. Enter marca o começo.', fim: 'Vá até o fim e aperte Enter. Esc desiste.' };
    var dicaTecla = el('p.dica-toque.desenho-dica-tecla', Object.keys(DICAS).map(function (k) { return el('span', { 'data-dica': k }, DICAS[k]); }));
    function comCursor() { return peloTeclado && !arraste && !(ctrl && ctrl.travado) && document.activeElement === canvas; }
    function mostrarDica() {
      var ver = comCursor(), qual = marca ? 'fim' : ferramenta === 'lapis' ? 'pinta' : ferramenta === 'borracha' ? 'apaga' : 'comeco';
      Array.prototype.forEach.call(dicaTecla.children, function (s) { s.classList.toggle('dica-atual', ver && s.getAttribute('data-dica') === qual); });
    }
    // foco do teclado: a dica, a prancheta e o "Use no desenho" à vista, o que couber (no notebook a lista ficava
    // embaixo do rodapé); rola só a caixa que rola por dentro, sem tirar a dica do alto nem a prancheta de baixo
    function mostrarPrancheta() {
      var caixa = wrap.parentElement;
      while (caixa && !(/auto|scroll/.test(getComputedStyle(caixa).overflowY) && caixa.scrollHeight > caixa.clientHeight)) caixa = caixa.parentElement;
      if (!caixa) return;
      var r = caixa.getBoundingClientRect(), lista = wrap.querySelector('.desenho-lista'), FOLGA = 20;
      var topo = dicaTecla.getBoundingClientRect().top, baixo = canvas.getBoundingClientRect().bottom;
      var fim = Math.max(baixo, lista ? lista.getBoundingClientRect().bottom : 0);
      if (fim > r.bottom - FOLGA) caixa.scrollTop += Math.min(fim - r.bottom + FOLGA, Math.max(0, topo - r.top - FOLGA));
      else if (topo < r.top + FOLGA) caixa.scrollTop -= Math.min(r.top + FOLGA - topo, Math.max(0, r.bottom - FOLGA - baixo));
    }
    function apertar() {
      var x = cursor[0], y = cursor[1];
      if (ferramenta === 'lapis' || ferramenta === 'borracha') {
        if (ferramenta === 'lapis') aplicar([[x, y]], cor); else aplicar(borrachaEm(x, y), 0);
        Reino.Som.tocar('toque');
        redesenhar(); pintarRequisitos(); opts.onMudar();
      } else if (!marca) {
        marca = { x0: x, y0: y, x: x, y: y };
        Reino.Som.tocar('selecionar'); mover();
      } else {
        var a = marca;
        marca = null;
        concluir(a);
      }
      mostrarDica();
    }
    canvas.addEventListener('keydown', function (ev) {
      if (ctrl.travado || arraste || ev.altKey || ev.ctrlKey || ev.metaKey) return;
      var s = SETAS[ev.key];
      if (s) {
        ev.preventDefault();
        cursor = [U.clamp(cursor[0] + s[0], 0, GRADE - 1), U.clamp(cursor[1] + s[1], 0, GRADE - 1)];
        if (marca) { marca.x = cursor[0]; marca.y = cursor[1]; }
        peloTeclado = true; mover(); mostrarDica();
      } else if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        peloTeclado = true; apertar();
      } else if (ev.key === 'Escape' && marca) {
        ev.preventDefault();   // o Esc desiste do começo; a tela não fecha
        marca = null; mover(); mostrarDica();
      }
    });
    canvas.addEventListener('focus', function () {
      peloTeclado = Reino.UI.porTeclado();
      if (!arraste) redesenhar();
      mostrarDica();
      if (peloTeclado) mostrarPrancheta();
    });
    canvas.addEventListener('blur', function () { marca = null; if (!arraste) redesenhar(); mostrarDica(); });

    wrap.appendChild(el('p.dica-toque', 'Escolha uma ferramenta e uma cor, depois desenhe com o dedo. Linha e formas: arraste de um ponto a outro.'));
    wrap.appendChild(barraFerr);
    wrap.appendChild(paleta);
    wrap.appendChild(dicaTecla);   // logo acima da prancheta, com o espaço sempre guardado
    wrap.appendChild(el('div.desenho-moldura', canvas));
    if (reqs.length) wrap.appendChild(el('div.desenho-lista', el('b', 'Use no desenho:'), listaReq));
    pintarBotoes(); pintarRequisitos(); redesenhar();
    // o desenho guardado já está pronto: o "Conferir" da sala liga logo depois de a questão entrar na tela
    if (!opts.valorInicial && ini.px) setTimeout(function () { if (wrap.isConnected) opts.onMudar(); }, 0);

    function temAlgo() { return px.some(function (v) { return v !== '0'; }); }
    function valor() { return temAlgo() ? { px: px.join(''), usou: U.copia(usou) } : null; }
    var ctrl = {
      el: wrap,
      valor: valor,
      pronto: function () { return !_d.marcado(wrap) && temAlgo(); },
      conferir: function () {
        var v = valor(), ok = D.desenhoCumpriu(d, v);
        // o desenho guarda só no acerto (a escrita guarda sempre): o save tem só a grade, sem o "usou" (linhas, formas),
        // e o desenho guardado volta como cumprido; um errado voltaria valendo certo
        if (ok && d.guardar && Reino.Producoes) Reino.Producoes.guardar(d.id, { px: v.px });
        return { ok: ok, faltam: D.desenhoFaltam(d, v) };
      },
      marcarErro: function () {
        // o requisito que falta fica marcado (nada se apaga no desenho)
        _d.erroParado(wrap, reqs.filter(function (q) { return !requisitoOk(q.r, usou); }).map(function (q) { return q.li; }), opts.onMudar);
      },
      // conferido: o cursor e a dica do teclado somem (ctrl.travado)
      marcarCerto: function () { wrap.classList.add('tudo-certo'); marca = null; redesenhar(); mostrarDica(); },
    };
    return ctrl;
  };
  var pontuar = function (d, valor) { return D.desenhoCumpriu(d, valor) ? 1 : 0; };

  Reino.registrarTipoDesafio('desenho', {
    montar: montar, pontuar: pontuar, especial: true, pista: 'pistaDesenho', campos: ['guardar'],
    exemplos: { desafio: { id: 'x', tipo: 'desenho', requisitos: ['linhas', 'formas', 'cores'] },
      certa: function () { return { px: '1', usou: { linhas: true, formas: true, cores: [1, 2] } }; },
      estranhos: [{}, { px: '1' }, { usou: {} }, { px: '', usou: { linhas: true, formas: true, cores: [1, 2] } }] },
    // na correção da prova a miniatura aparece sempre (e a lista da correção também, mesmo com nota dez)
    extraCorrecao: function (d, valor) { var mini = D.miniaturaDesenho(valor, 3); return mini ? el('div.correcao-desenho', mini) : null; },
    textoCerto: function (d) { return 'Um desenho usando ' + d.requisitos.join(', ') + '.'; },
    textoResposta: function (d, valor) { return D.desenhoCumpriu(d, valor) ? 'Desenho com tudo o que foi pedido.' : 'Desenho sem ' + D.desenhoFaltam(d, valor).join(', ') + '.'; },
    validar: function (d, v) {
      var req = Object.keys(NOME_REQUISITO);
      v.checar(d.pergunta, d.id + ': desenho sem pergunta');
      if (d.guardar !== undefined) v.checar(d.guardar === true, d.id + ': "guardar" só vale true');
      v.checar(Array.isArray(d.requisitos) && d.requisitos.length > 0 && d.requisitos.every(function (r) { return req.indexOf(r) >= 0; }), d.id + ': requisitos do desenho devem ser de ' + req.join('/'));
    },
  });
})();
