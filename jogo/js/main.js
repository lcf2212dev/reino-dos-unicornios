/* Início do jogo: carrega o progresso, desenha o reino e liga os controles. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso, UI = Reino.UI, J = Jogador, T = Mapa.T;
  var canvas, ctx, buffer, bctx, escala = 3, dpr = 1;
  var cam = { x: 0, y: 0 };
  var teclas = {};
  var ultimo = 0, pausado = false, jogoAtivo = false;

  function est() { return P.estado(); }

  /* ---------- tamanho e escala ---------- */
  function redimensionar() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    var w = window.innerWidth, h = window.innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    escala = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) / (T * 12.5)));
    buffer.width = Math.ceil(canvas.width / escala) + 1;
    buffer.height = Math.ceil(canvas.height / escala) + 1;
    bctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    desenhar(performance.now());
  }

  /* ---------- lugares concluídos ganham arco-íris ---------- */
  function concluidos() {
    var ids = [];
    Reino.materias.forEach(function (m) { if (P.materiaCompleta(m)) ids.push('materia:' + m.id); });
    var ouro = Reino.materias.some(function (m) { var t = est().treinos[m.id]; return t && t.melhor === 'ouro'; });
    if (ouro) ids.push('castelo');
    return ids;
  }

  function atualizarCamera() {
    var vw = buffer.width, vh = buffer.height;
    var mw = Mapa.largura(), mh = Mapa.altura();
    var alvoX = J.x - vw / 2, alvoY = J.y - 10 - vh / 2;
    cam.x = mw <= vw ? (mw - vw) / 2 : U.clamp(alvoX, 0, mw - vw);
    cam.y = mh <= vh ? (mh - vh) / 2 : U.clamp(alvoY, 0, mh - vh);
  }

  // desenha personagens direto em pixels de tela: andam suave, sem tremer
  var pintor = {
    ret: function (x, y, w, h, cor) {
      var x0 = Math.round((x - cam.x) * escala), y0 = Math.round((y - cam.y) * escala);
      var x1 = Math.round((x + w - cam.x) * escala), y1 = Math.round((y + h - cam.y) * escala);
      ctx.fillStyle = cor;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    },
    sprite: function (img, x, yPes) {
      var dx = Math.round((x - img.width / 2 - cam.x) * escala), dy = Math.round((yPes - img.height - cam.y) * escala);
      ctx.drawImage(img, dx, dy, img.width * escala, img.height * escala);
    },
  };

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
    J.sombra(p, x, y, 6);
    p.sprite(spr, x, y - pulo);
    if (animar) desenharBalaoGuia(p, t, x, y - pulo - spr.height);
  }

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
    if (l.tipo === 'materia') {
      var m = Reino.materia(l.materiaId);
      return concluidos().indexOf(l.id) >= 0 ? 'Pronto' : P.salasFeitas(m) + '/' + m.salas.length;
    }
    if (l.tipo === 'estabulo' && P.ovosParaChocar().length) return 'Ovo';
    return '';
  }
  // placa ao lado da construção, com a fonte pixel (acentos inclusos).
  // Press Start 2P só fica nítida em múltiplos de 8px e em posições inteiras;
  // o tamanho acompanha a escala do mapa (em tela de alta densidade o mapa cresce junto).
  function desenharPlacas() {
    var fonte = 8 * Math.max(2, Math.round(escala / 2));
    var k = fonte / 16;
    function px(v) { return Math.round(v * k); }
    var familia = FONTE_PIXEL;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fonte + 'px ' + familia;
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
      var naDireita = l.rect.x + l.rect.w / 2 < Mapa.W / 2;
      var x = naDireita ? (l.rect.x + l.rect.w) * T + 3 : l.rect.x * T - ww - 3;
      var y = (l.rect.y + l.rect.h) * T - wh - 2;
      x = Math.max(T + 1, Math.min(x, Mapa.largura() - ww - T - 1));
      var sx = Math.round((x - cam.x) * escala);
      var sy = Math.round((y - cam.y) * escala);
      if (sx > canvas.width || sy > canvas.height || sx + sw < 0 || sy + sh < 0) return;
      var perto = J.x > x - 6 && J.x < x + ww + 6 && J.y > y - 4 && J.y < y + wh + 8;
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

  function desenharLuz() {
    var g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.62);
    g.addColorStop(0, 'rgba(255,236,200,0.08)');
    g.addColorStop(0.42, 'rgba(255,236,200,0)');
    g.addColorStop(0.72, 'rgba(58,36,70,0)');
    g.addColorStop(1, 'rgba(58,36,70,0.16)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function desenhar(t) {
    if (!est()) return;
    var animar = est().ajustes.animacoes && jogoAtivo;
    atualizarCamera();
    // o cenário é desenhado em pixels do jogo e deslizado com precisão de pixel da tela
    var ox = Math.floor(cam.x), oy = Math.floor(cam.y);
    bctx.setTransform(1, 0, 0, 1, -ox, -oy);
    bctx.fillStyle = '#c6e15a';
    bctx.fillRect(ox, oy, buffer.width, buffer.height);
    Mapa.desenharAnimado(bctx, t, { concluidos: concluidos(), semAnimacao: !animar });
    J.desenharMarcador(bctx, t);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buffer, -Math.round((cam.x - ox) * escala), -Math.round((cam.y - oy) * escala), buffer.width * escala, buffer.height * escala);
    desenharPlacas();
    // quem está mais embaixo aparece na frente
    var ct = Mapa.claudeTile;
    if (J.y < ct.y * T + 14) { J.desenhar(pintor, animar); desenharClaude(pintor, t, animar); }
    else { desenharClaude(pintor, t, animar); J.desenhar(pintor, animar); }
    desenharLuz();
  }

  function laco(t) {
    requestAnimationFrame(laco);
    var dt = Math.min(0.05, (t - (ultimo || t)) / 1000);
    ultimo = t;
    if (!jogoAtivo || pausado) return;
    var tx = (teclas.dir ? 1 : 0) - (teclas.esq ? 1 : 0);
    var ty = (teclas.baixo ? 1 : 0) - (teclas.cima ? 1 : 0);
    J.atualizar(dt, { x: tx, y: ty }, entrarLugar);
    desenhar(t);
  }

  /* ---------- entrar nos lugares ---------- */
  function entrarLugar(lugar) {
    J.parar();
    teclas = {};
    // ao sair, a Mariana aparece na frente da porta
    esperarTelasFecharem(function () { J.posicionar(lugar.porta.x, lugar.porta.y + 1); J.portaIgnorada = null; });
    UI.abrirLugar(lugar);
  }
  var esperandoFechar = null;
  function esperarTelasFecharem(fn) { esperandoFechar = fn; }
  U.on('telas', function (n) {
    pausado = n > 0;
    if (n === 0 && esperandoFechar) { var f = esperandoFechar; esperandoFechar = null; f(); }
    if (n === 0) desenhar(performance.now());
  });

  function irAoLugar(lugar) {
    var ok = J.irPara(lugar.porta.x, lugar.porta.y, function () { entrarLugar(lugar); });
    if (!ok) { J.posicionar(lugar.porta.x, lugar.porta.y + 1); entrarLugar(lugar); }
  }
  U.on('irPara', irAoLugar);

  function falarComClaude() {
    Reino.Som.tocar('selecionar');
    var tipos = ['dica', 'dica', 'curiosidade'];
    Reino.Claude.falar(Reino.Claude.frase(U.sortear(tipos)));
  }

  /* ---------- controles ---------- */
  var MAPA_TECLAS = { ArrowLeft: 'esq', a: 'esq', A: 'esq', ArrowRight: 'dir', d: 'dir', D: 'dir', ArrowUp: 'cima', w: 'cima', W: 'cima', ArrowDown: 'baixo', s: 'baixo', S: 'baixo' };
  function ligarControles() {
    window.addEventListener('keydown', function (e) {
      if (UI.temTela() || !jogoAtivo) return;
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      var k = MAPA_TECLAS[e.key];
      if (k) { teclas[k] = true; e.preventDefault(); }
      if (e.key === 'Enter' || e.key === ' ') {
        var tl = J.tile();
        var p = Mapa.portaEm(tl.x, tl.y);
        if (p) { e.preventDefault(); entrarLugar(p); }
        var ct = Mapa.claudeTile;
        if (Math.abs(tl.x - ct.x) + Math.abs(tl.y - ct.y) === 1) { e.preventDefault(); falarComClaude(); }
      }
    });
    window.addEventListener('keyup', function (e) { var k = MAPA_TECLAS[e.key]; if (k) teclas[k] = false; });
    window.addEventListener('blur', function () { teclas = {}; });

    canvas.addEventListener('pointerdown', function (e) {
      if (!jogoAtivo || UI.temTela()) return;
      Reino.Som.ativar();
      var r = canvas.getBoundingClientRect();
      var wx = cam.x + ((e.clientX - r.left) * dpr) / escala;
      var wy = cam.y + ((e.clientY - r.top) * dpr) / escala;
      var tx = Math.floor(wx / T), ty = Math.floor(wy / T);
      var ct = Mapa.claudeTile;
      // tocou no Claude (ou bem perto dele)
      if (Math.abs(wx - (ct.x * T + 8)) < 12 && wy > ct.y * T - 14 && wy < ct.y * T + 16) {
        var vizinho = Mapa.maisPerto(ct.x - 1, ct.y, J.tile());
        J.irPara(vizinho.x, vizinho.y, function () { J.virar(1, 0); falarComClaude(); });
        return;
      }
      var lugar = Mapa.lugarNoTile(tx, ty);
      // tocou na plaquinha embaixo do prédio também vale
      if (!lugar) lugar = Mapa.lugarNoTile(tx, ty - 1);
      if (lugar) { irAoLugar(lugar); return; }
      var destino = Mapa.solido(tx, ty) ? Mapa.maisPerto(tx, ty, J.tile()) : { x: tx, y: ty };
      if (destino) J.irPara(destino.x, destino.y);
    });
  }

  function montarSetas() {
    var box = U.$('#setas');
    box.innerHTML = '';
    [['cima', '▲'], ['esq', '◀'], ['dir', '▶'], ['baixo', '▼']].forEach(function (s) {
      var b = el('button.seta.seta-' + s[0], { type: 'button', 'aria-label': 'Andar para ' + s[0] }, PA.iconeEmoji(s[1], 2));
      function on(e) { e.preventDefault(); teclas[s[0]] = true; Reino.Som.ativar(); }
      function off() { teclas[s[0]] = false; }
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
      box.appendChild(b);
    });
    box.hidden = !est().ajustes.setas;
  }

  /* ---------- telas de entrada ---------- */
  function logo() {
    var d = Reino.Unicornios.def('inicial', est().corInicial);
    return el('div.logo',
      el('div.logo-arco'),
      PA.paraDOM(PA.montada(d, 3, 0, est().aparencia, {}), 6, 'logo-uni'),
      el('h1.titulo-jogo', el('span', 'Mariana'), el('small', 'e o Reino dos Unicórnios')));
  }

  function telaInicio() {
    return new Promise(function (resolver) {
      var t = UI.abrirTela('inicio');
      var ir = el('button.btn-grande.btn-principal.btn-comecar', { type: 'button' }, 'Entrar no Reino ✨');
      t.appendChild(el('div.inicio', logo(), ir,
        el('p.inicio-sub', 'Revisão de História • Museu das Memórias')));
      ir.addEventListener('click', function () {
        Reino.Som.ativar(); Reino.Som.tocar('porta');
        UI.telaCheia(true);
        if (est().ajustes.musica) Reino.Som.musica(true);
        UI.fecharTela(t); resolver();
      });
      setTimeout(function () { ir.focus(); }, 50);
    });
  }

  function telaBemVinda() {
    return new Promise(function (resolver) {
      var t = UI.abrirTela('inicio');
      var ir = el('button.btn-grande.btn-principal.btn-comecar', { type: 'button' }, 'Vamos lá! ✨');
      t.appendChild(el('div.inicio', logo(),
        el('div.intro-claude.intro-claude-grande', PA.paraDOM(PA.claude(0), 5, 'claude-intro'),
          el('p', 'Oi, ' + Reino.config.nomeJogadora + '! Eu sou o Claude! Vou ser o seu guia neste reino mágico cheio de unicórnios. Aqui a gente revisa a matéria da escola brincando!')),
        ir));
      ir.addEventListener('click', function () {
        Reino.Som.ativar(); Reino.Som.tocar('porta');
        UI.telaCheia(true);
        UI.fecharTela(t); resolver();
      });
    });
  }

  function escolherCor() {
    return new Promise(function (resolver) {
      var pn = UI.painel('cores', 'Escolha seu primeiro unicórnio', { semFechar: true });
      pn.conteudo.appendChild(el('p', 'Qual cor você quer? Ele vai nascer de um ovo mágico! 🥚'));
      var grade = el('div.grade-unis');
      Object.keys(Reino.Unicornios.CORES_INICIAIS).forEach(function (k) {
        var c = Reino.Unicornios.CORES_INICIAIS[k];
        var d = { id: 'prev-' + k, raridade: 'comum', cores: { corpo: c.corpo, crina: c.crina, chifre: c.chifre } };
        var b = el('button.carta-uni.rar-comum', { type: 'button' }, PA.paraDOM(PA.unicornio(d, 3, 0), 3), el('b.carta-nome', c.nome));
        b.addEventListener('click', function () { Reino.Som.tocar('selecionar'); UI.fecharTela(pn.tela); resolver(k); });
        grade.appendChild(b);
      });
      pn.conteudo.appendChild(grade);
    });
  }

  function telaRegras() {
    return new Promise(function (resolver) {
      var pn = UI.painel('regras', 'Como funciona o Reino', { semFechar: true });
      var ir = el('button.btn-grande.btn-principal', { type: 'button' }, 'Entrar no Reino 🦄');
      pn.conteudo.appendChild(el('ul.regras',
        el('li', el('span.regra-icone', '🏛️'), el('span', el('b', 'Missões: '), 'cada matéria tem um lugar no reino. O Museu das Memórias é de História e tem 5 salas.')),
        el('li', el('span.regra-icone', '💰'), el('span', el('b', 'Dinheiro: '), 'cada sala vale ' + U.reais(P.valorSala(Reino.materias[0])) + '. A revisão inteira de uma matéria vale ' + U.reais(Reino.config.valorPorMateria) + '!')),
        el('li', el('span.regra-icone', '🦄'), el('span', el('b', 'Unicórnios: '), 'ganhe ovos de unicórnio comum, raro, épico e lendário. Eles nascem bebês e crescem quando você acerta!')),
        el('li', el('span.regra-icone', '⏳'), el('span', el('b', 'Sem relógio: '), 'aqui ninguém tem pressa. Leia com calma e toque em "Conferir".')),
        el('li.regra-destaque', el('span.regra-icone', '🥇'), el('span', el('b', 'A medalha de ouro da escola vale ' + U.reais(Reino.config.medalhaEscolaValor) + '! '), 'Ela vem de acertar com calma e revisar a prova, não de terminar primeiro.'))));
      pn.conteudo.appendChild(el('div.intro-botoes', ir));
      ir.addEventListener('click', function () { Reino.Som.tocar('porta'); UI.fecharTela(pn.tela); resolver(); });
    });
  }

  function primeiraVez() {
    return telaBemVinda()
      .then(function () { return UI.telaAparencia(true); })
      .then(escolherCor)
      .then(function (cor) {
        est().corInicial = cor;
        P.ganharUni('inicial');
        est().montaria = 'inicial';
        P.salvar(true);
        return UI.chocarUm('inicial', { primeiro: true });
      })
      .then(function () {
        est().comecou = true;
        P.salvar();
        return telaRegras();
      });
  }

  function entrarNoReino(novo) {
    jogoAtivo = true;
    U.$('#hud').hidden = false;
    UI.montarHUD();
    montarSetas();
    var m = Mapa.lugar('materia:' + Reino.materias[0].id);
    J.posicionar(17, 10);
    desenhar(performance.now());
    if (novo) {
      Reino.Claude.falar(Reino.Falas.tutorialMapa(Reino.materias[0]))
        .then(function () { return Reino.Claude.falar(Reino.Claude.frase('dica')); });
    } else {
      var ovos = P.ovosParaChocar().length;
      var oi = Reino.Claude.frase('boasVindas');
      Reino.Claude.falar(oi + (ovos ? ' E você tem ' + (ovos === 1 ? 'um ovo' : ovos + ' ovos') + ' para chocar! 🥚' : ''), { fala: [oi, ovos ? Reino.Falas.fixas.ovosParaChocar : null] });
    }
  }

  /* ---------- início ---------- */
  function iniciar() {
    P.carregar();
    UI.aplicarAjustes();
    Mapa.criar(Reino.materias);
    Mapa.prerender();
    if (!est().comecou) J.posicionar(17, 10);
    canvas = U.$('#reino');
    ctx = canvas.getContext('2d');
    buffer = PA.novoCanvas(10, 10);
    bctx = buffer.getContext('2d');
    redimensionar();
    if (document.fonts && document.fonts.load) {
      document.fonts.load('16px "Press Start 2P"').then(function () { desenhar(performance.now()); });
    }
    window.addEventListener('resize', redimensionar);
    ligarControles();
    requestAnimationFrame(laco);

    U.on('progresso', function () { UI.atualizarHUD(); });
    U.on('progressoRemoto', function () { UI.aplicarAjustes(); if (jogoAtivo) UI.atualizarHUD(); });
    U.on('mapaMudou', function () { UI.atualizarHUD(); desenhar(performance.now()); });
    U.on('setas', function () { U.$('#setas').hidden = !est().ajustes.setas; });

    P.iniciarNuvem();
    // vozes gravadas: frases do Claude e de cada matéria (as salas carregam quando abrem)
    Reino.Voz.carregarVarios(['geral'].concat(Reino.materias.map(function (m) { return m.id + '-extra'; })));

    var novo = !est().comecou;
    (novo ? primeiraVez() : telaInicio()).then(function () { entrarNoReino(novo); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
