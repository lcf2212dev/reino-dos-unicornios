/* Início do jogo: carrega o progresso, desenha a cena ativa (mapa ou interior) e liga os controles.
   O que é de cada cena (placas, Claude, portas, NPCs) fica em cena.js e nos interiores. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso, UI = Reino.UI, J = Jogador, T = Mapa.T, Cena = Reino.Cena;
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
    pintor.ctx = ctx; pintor.escala = escala; pintor.dpr = dpr;
    desenhar(performance.now());
  }

  // nos interiores, o HUD de cima e o menu de baixo não podem esconder a primeira e a última
  // fileira (o tapete de saída fica embaixo): a câmera pode passar da borda até o fim do HUD
  function margensHUD() {
    var m = { topo: 0, baixo: 0 };
    var r = canvas.getBoundingClientRect();
    U.$$('#hud .hud-topo > *').forEach(function (e) {
      var b = e.getBoundingClientRect();
      if (b.bottom > b.top) m.topo = Math.max(m.topo, b.bottom - r.top);
    });
    var dock = U.$('#hud .dock');
    if (dock) { var d = dock.getBoundingClientRect(); if (d.bottom > d.top) m.baixo = Math.max(0, r.bottom - d.top); }
    m.topo = m.topo * dpr / escala; m.baixo = m.baixo * dpr / escala;
    return m;
  }

  function atualizarCamera() {
    var vw = buffer.width, vh = buffer.height;
    var c = Cena.atual();
    var mw = c.largura(), mh = c.altura();
    var alvoX = J.x - vw / 2, alvoY = J.y - 10 - vh / 2;
    cam.x = mw <= vw ? (mw - vw) / 2 : U.clamp(alvoX, 0, mw - vw);
    if (c.tipo !== 'interior') { cam.y = mh <= vh ? (mh - vh) / 2 : U.clamp(alvoY, 0, mh - vh); return; }
    var m = margensHUD(), livre = vh - m.topo - m.baixo;
    cam.y = mh <= livre ? (mh - livre) / 2 - m.topo : U.clamp(alvoY, -m.topo, mh - vh + m.baixo);
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
    // px do jogo → px do canvas
    tela: function (x, y) { return { x: Math.round((x - cam.x) * escala), y: Math.round((y - cam.y) * escala) }; },
    ctx: null, escala: escala, dpr: dpr, cam: cam,
  };

  function desenharLuz() {
    var g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.62);
    g.addColorStop(0, 'rgba(255,236,200,0.08)');
    g.addColorStop(0.42, 'rgba(255,236,200,0)');
    g.addColorStop(0.72, 'rgba(58,36,70,0)');
    g.addColorStop(1, 'rgba(58,36,70,0.16)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function ordemY(a, b) { return a.y - b.y; }
  // um erro no desenho de uma cena não derruba o quadro (nem a íris); avisa uma vez por parte
  var errosVistos = {};
  function seguro(cena, parte, fn) {
    try { return fn(); } catch (e) {
      var k = cena.id + ':' + parte;
      if (!errosVistos[k]) { errosVistos[k] = true; console.error('Erro ao desenhar ' + k, e); }
    }
  }
  function desenhar(t) {
    if (!est() || !ctx) return;
    var t0 = performance.now();
    // Ajustes → Animações e o "reduzir movimento" do aparelho valem para tudo o que se mexe no cenário
    var animar = est().ajustes.animacoes && !U.reduzMovimentoSistema && jogoAtivo;
    var cena = Cena.atual();
    atualizarCamera();
    // o cenário é desenhado em pixels do jogo e deslizado com precisão de pixel da tela
    var ox = Math.floor(cam.x), oy = Math.floor(cam.y);
    bctx.setTransform(1, 0, 0, 1, -ox, -oy);
    bctx.fillStyle = cena.corFundo;
    bctx.fillRect(ox, oy, buffer.width, buffer.height);
    seguro(cena, 'fundo', function () { cena.desenharFundo(bctx, t, animar); });
    J.desenharMarcador(bctx, t);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buffer, -Math.round((cam.x - ox) * escala), -Math.round((cam.y - oy) * escala), buffer.width * escala, buffer.height * escala);
    seguro(cena, 'tela', function () { cena.desenharTela(ctx, pintor, t, animar); });
    // quem está mais embaixo aparece na frente
    var itens = J.itensDesenho(pintor, animar).concat(seguro(cena, 'itens', function () { return cena.itensDesenho(pintor, t, animar); }) || []);
    itens.sort(ordemY).forEach(function (i) { seguro(cena, 'item', function () { i.desenhar(); }); });
    // por cima dos personagens (ex.: placas dos cômodos que descem para desviar do HUD)
    if (cena.desenharSobre) seguro(cena, 'sobre', function () { cena.desenharSobre(ctx, pintor, t, animar); });
    desenharLuz();
    Cena.desenharIris(ctx, pintor, performance.now());
    Cena.quadros.registrar(performance.now() - t0);
  }

  function laco(t) {
    requestAnimationFrame(laco);
    var dt = Math.min(0.05, (t - (ultimo || t)) / 1000);
    ultimo = t;
    if (!jogoAtivo || pausado) return;
    // em transição ou com um diálogo aberto ela não anda nem aciona portas
    if (Cena.bloqueado()) {
      if (Cena.estado() === Cena.DIALOGO && (J.caminho.length || J.aoChegar)) J.parar();
      J.atualizar(dt, { x: 0, y: 0 }, null);
    }
    else {
      var tx = (teclas.dir ? 1 : 0) - (teclas.esq ? 1 : 0);
      var ty = (teclas.baixo ? 1 : 0) - (teclas.cima ? 1 : 0);
      J.atualizar(dt, { x: tx, y: ty }, Cena.acionar);
    }
    desenhar(t);
  }

  U.on('telas', function (n) {
    // abriu uma tela (menu, HUD) com o balão modal de um NPC aberto: o balão fecha
    if (n > 0) Cena.fecharDialogoModal();
    pausado = n > 0;
    if (n === 0) desenhar(performance.now());
  });

  // menu Lugares: anda até a porta (de dentro de um prédio, sai primeiro)
  U.on('irPara', function (lugar) { Cena.irAoLugar(lugar); });

  // alvo tocado ou ao lado: anda até ele (se precisar), vira e age
  function agirNoAlvo(alvo) {
    var tl = J.tile();
    if (alvo.tile.x === tl.x && alvo.tile.y === tl.y) {
      if (alvo.olhar) J.virar(alvo.olhar.x, alvo.olhar.y);
      alvo.agir();
      return;
    }
    Cena.irAoAlvo(alvo);
  }

  /* ---------- controles ---------- */
  var MAPA_TECLAS = { ArrowLeft: 'esq', a: 'esq', A: 'esq', ArrowRight: 'dir', d: 'dir', D: 'dir', ArrowUp: 'cima', w: 'cima', W: 'cima', ArrowDown: 'baixo', s: 'baixo', S: 'baixo' };
  function ligarControles() {
    window.addEventListener('keydown', function (e) {
      if (!jogoAtivo || Cena.bloqueado()) return;
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      var k = MAPA_TECLAS[e.key];
      if (k) { teclas[k] = true; e.preventDefault(); }
      if (e.key === 'Enter' || e.key === ' ') {
        var alvo = Cena.atual().alvoPerto(J.tile(), { x: J.olharX, y: J.olharY });
        if (alvo) { e.preventDefault(); agirNoAlvo(alvo); }
      }
    });
    window.addEventListener('keyup', function (e) { var k = MAPA_TECLAS[e.key]; if (k) teclas[k] = false; });
    window.addEventListener('blur', function () { teclas = {}; });

    canvas.addEventListener('pointerdown', function (e) {
      if (!jogoAtivo || Cena.bloqueado()) return;
      Reino.Som.ativar();
      var r = canvas.getBoundingClientRect();
      var wx = cam.x + ((e.clientX - r.left) * dpr) / escala;
      var wy = cam.y + ((e.clientY - r.top) * dpr) / escala;
      var tx = Math.floor(wx / T), ty = Math.floor(wy / T);
      var cena = Cena.atual();
      // tocou em alguém ou em algo (Claude, prédio, placa, NPC, objeto, tapete, escada)
      var alvo = cena.alvoEm(wx, wy);
      if (alvo) { Cena.irAoAlvo(alvo); return; }
      var destino = cena.solido(tx, ty) ? cena.maisPerto(tx, ty, J.tile()) : { x: tx, y: ty };
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
        el('p.inicio-sub', 'Revisão de ' + Reino.materias.map(function (m) { return m.nome; }).join(' e '))));
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
        el('li', el('span.regra-icone', '🏛️'), el('span', el('b', 'Missões: '), 'cada matéria tem um lugar no reino, com 5 salas: ' + Reino.materias.map(function (m) { return m.lugar.nome + ' (' + m.nome + ')'; }).join(' e ') + '.')),
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
    J.posicionar(17, 10);
    desenhar(performance.now());
    // fome e sede da montaria só contam daqui em diante (jogo aberto e ela jogando)
    if (Reino.Cuidados) Reino.Cuidados.iniciar();
    var tutorial = null;
    if (novo) {
      tutorial = Reino.Claude.falar(Reino.Falas.tutorialMapa(Reino.materias[0]))
        .then(function () { return Reino.Claude.falar(Reino.Claude.frase('dica')); });
    } else {
      var ovos = P.ovosParaChocar().length;
      var oi = Reino.Claude.frase('boasVindas');
      Reino.Claude.falar(oi + (ovos ? ' E você tem ' + (ovos === 1 ? 'um ovo' : ovos + ' ovos') + ' para chocar! 🥚' : ''), { fala: [oi, ovos ? Reino.Falas.fixas.ovosParaChocar : null] });
    }
    // pergunta surpresa: o relógio só começa depois do tutorial da primeira vez
    if (Reino.Surpresa) Reino.Surpresa.iniciar({ tutorial: tutorial });
  }

  /* o jogo só começa com o progresso guardado em mãos (servidor de casa ou claude.ai):
     sem ele, um aparelho novo abriria a primeira vez e trocaria as escolhas dela */
  function esperarProgresso() {
    return new Promise(function (resolver) {
      var t = null, msg = null, botao = null;
      function aviso(texto) {
        var novo = el('p.inicio-sub', texto);
        msg.parentNode.replaceChild(novo, msg);
        msg = novo;
      }
      function mostrar() {
        if (t) return;
        t = UI.abrirTela('inicio');
        msg = el('p.inicio-sub', 'Abrindo o reino...');
        botao = el('button.btn-grande.btn-principal.btn-comecar', { type: 'button' }, 'Tentar de novo 🔄');
        botao.hidden = true;
        botao.addEventListener('click', tentar);
        t.appendChild(el('div.inicio', logo(), msg, botao));
      }
      function tentar() {
        if (t) { aviso('Abrindo o reino...'); botao.hidden = true; }
        var espera = setTimeout(mostrar, 400);   // resposta rápida: nem aparece
        P.iniciarNuvem().then(function () {
          clearTimeout(espera);
          if (t) UI.fecharTela(t);
          resolver();
        }, function () {
          clearTimeout(espera);
          mostrar();
          aviso('O reino não abriu agora. Chame o papai e tente de novo.');
          botao.hidden = false;
          botao.focus();
        });
      }
      tentar();
    });
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
    Cena.ligar({ pintor: pintor, soltarTeclas: function () { teclas = {}; }, desenhar: function () { desenhar(performance.now()); } });
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

    // vozes gravadas: frases do Claude e de cada matéria (as salas carregam quando abrem)
    Reino.Voz.carregarVarios(['geral'].concat(Reino.materias.map(function (m) { return m.id + '-extra'; })));

    esperarProgresso().then(function () {
      var novo = !est().comecou;
      (novo ? primeiraVez() : telaInicio()).then(function () { entrarNoReino(novo); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
