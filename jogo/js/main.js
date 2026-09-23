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

  function desenharClaude(p, t, animar) {
    var ct = Mapa.claudeTile;
    var x = ct.x * T + 8, y = ct.y * T + 14;
    var pulo = animar ? Math.abs(Math.sin(t / 400)) * 2 : 0;
    var piscar = animar && Math.floor(t / 180) % 22 === 0;
    var spr = PA.claude(piscar ? 1 : 0).canvas;
    p.ret(x - 6, y - 1, 12, 2, 'rgba(58,36,70,0.22)');
    p.sprite(spr, x, y - pulo);
    // balãozinho chamando
    if (animar && Math.floor(t / 2200) % 3 === 0) {
      var bx = x + 6, by = y - spr.height - 12;
      p.ret(bx - 1, by - 1, 12, 9, '#3a2446');
      p.ret(bx, by, 10, 7, '#ffffff');
      p.ret(bx + 2, by + 3, 1, 1, '#3a2446'); p.ret(bx + 5, by + 3, 1, 1, '#3a2446'); p.ret(bx + 8, by + 3, 1, 1, '#3a2446');
    }
  }

  // plaquinhas com o nome de cada lugar (em pixels de tela, texto nítido)
  function desenharPlacas() {
    var fonte = Math.round(Math.max(12, Math.min(16, 5 * escala / dpr)) * dpr);
    ctx.font = '700 ' + fonte + 'px "Andika", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var feitos = concluidos();
    Mapa.lugares().forEach(function (l) {
      var wx = (l.rect.x + l.rect.w / 2) * T, wy = (l.rect.y + l.rect.h) * T + 6;
      var sx = (wx - cam.x) * escala, sy = (wy - cam.y) * escala;
      if (sx < -200 || sy < -50 || sx > canvas.width + 200 || sy > canvas.height + 50) return;
      var extra = '';
      if (l.tipo === 'materia') { var m = Reino.materia(l.materiaId); extra = feitos.indexOf(l.id) >= 0 ? ' 🌈' : ' ' + P.salasFeitas(m) + '/' + m.salas.length; }
      if (l.tipo === 'estabulo' && P.ovosParaChocar().length) extra = ' 🥚';
      var txt = l.nome + extra;
      var w = ctx.measureText(txt).width + fonte * 1.1, h = fonte * 1.7;
      // fica transparente quando a Mariana passa por trás da plaquinha
      var perto = Math.abs(J.x - wx) < (w / escala) / 2 + 6 && J.y - 26 < wy + 6 && J.y + 2 > wy - 6;
      ctx.globalAlpha = perto ? 0.3 : 1;
      ctx.fillStyle = 'rgba(58,36,70,0.9)';
      arred(ctx, sx - w / 2 - 2 * dpr, sy - h / 2 - 2 * dpr, w + 4 * dpr, h + 4 * dpr, h / 2 + 2 * dpr);
      ctx.fillStyle = '#fffafd';
      arred(ctx, sx - w / 2, sy - h / 2, w, h, h / 2);
      ctx.fillStyle = '#3a2446';
      ctx.fillText(txt, sx, sy + fonte * 0.05);
      ctx.globalAlpha = 1;
    });
  }
  function arred(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fill();
  }

  function desenhar(t) {
    if (!est() || !est().comecou) return;
    var animar = est().ajustes.animacoes;
    atualizarCamera();
    // o cenário é desenhado em pixels do jogo e deslizado com precisão de pixel da tela
    var ox = Math.floor(cam.x), oy = Math.floor(cam.y);
    bctx.setTransform(1, 0, 0, 1, -ox, -oy);
    bctx.fillStyle = '#a9e6a3';
    bctx.fillRect(ox, oy, buffer.width, buffer.height);
    Mapa.desenharAnimado(bctx, t, { concluidos: concluidos(), semAnimacao: !animar });
    J.desenharMarcador(bctx, t);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buffer, -Math.round((cam.x - ox) * escala), -Math.round((cam.y - oy) * escala), buffer.width * escala, buffer.height * escala);
    // quem está mais embaixo aparece na frente
    var ct = Mapa.claudeTile;
    if (J.y < ct.y * T + 14) { J.desenhar(pintor, animar); desenharClaude(pintor, t, animar); }
    else { desenharClaude(pintor, t, animar); J.desenhar(pintor, animar); }
    desenharPlacas();
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
      var b = el('button.seta.seta-' + s[0], { type: 'button', 'aria-label': 'Andar para ' + s[0] }, s[1]);
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
    canvas = U.$('#reino');
    ctx = canvas.getContext('2d');
    buffer = PA.novoCanvas(10, 10);
    bctx = buffer.getContext('2d');
    redimensionar();
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
