/* Voo de foguete (Reino.Voo): o minijogo entre o Observatório e um planeta. Contrato: docs/contratos/viagem.md §4.
   Contagem 3, 2, 1 → voo de config.viagem.vooSegundos (sem pressa: dura o mesmo tempo aconteça o que acontecer)
   → chegada (o planeta cresce no alto). Asteroide só dá uma tremidinha (conta `batidas`); estrela soma `estrelas`.
   A física (V.novoEstado/V.passo) é pura e roda no Node (teste: ferramentas/testes/unidade/voo.test.js).
   O desenho mora em voo-desenho.js (Reino.VooDesenho). 2ª versão: `perguntas` vira portais de resposta
   (s.portais; física e tela em voo-portais.js). */
(function () {
  var R = window.Reino;
  var V = {};
  // mundo lógico (pixels do canvas, antes de ampliar)
  V.L = 120; V.A = 180;
  V.CONTAGEM_MS = 3000; V.CHEGADA_MS = 3200;
  // foguete 16×26 (centro do corpo em FOGUETE_Y); estrela 11 px; asteroide 10, 13 ou 16 px
  var FOGUETE_Y = V.A - 40, FOGUETE_MEIO_L = 7, FOGUETE_MEIO_A = 11, TAMANHOS = [10, 13, 16];
  V.FOGUETE_Y = FOGUETE_Y;
  var VEL_FOGUETE = 90, VEL_OBJ = V.VEL_OBJ = 50, INTERVALO = 1000, SEM_OBJ_NO_FIM = 3000;

  function segundos() { var c = R.config && R.config.viagem; return (c && c.vooSegundos) || 30; }

  // rng: função 0..1 (Reino.sorteioDaChave no jogo; qualquer uma com semente no teste)
  // perguntas: de Reino.Viagem.perguntas (viram portais; sem elas, nenhum portal)
  V.novoEstado = function (op) {
    op = op || {};
    var vooMs = (op.segundos || segundos()) * 1000;
    return {
      fase: 'contagem', t: 0, total: 0, vooMs: vooMs,
      x: V.L / 2, objs: [], proximo: 600, estrelas: 0, batidas: 0, tremer: 0, brilhos: [],
      portais: V.novosPortais ? V.novosPortais(op.perguntas, vooMs) : [], portaisCertos: 0, portaisErros: 0,
      rng: op.rng || Math.random,
    };
  };
  // quanto do caminho já foi (0..1): a barra de distância
  V.distancia = function (s) {
    if (s.fase === 'contagem') return 0;
    if (s.fase === 'voo') return Math.min(1, s.t / s.vooMs);
    return 1;
  };
  V.contagem = function (s) { return s.fase === 'contagem' ? Math.max(1, 3 - Math.floor(s.t / 1000)) : 0; };
  V.bateu = function (s, o) {
    // estrela: caixa inteira (fácil de pegar); asteroide: 70% do raio (só bate de verdade)
    var r = (o.tam || 10) / 2 * (o.tipo === 'estrela' ? 1 : 0.7);
    return Math.abs(o.x - s.x) < FOGUETE_MEIO_L + r && Math.abs(o.y - FOGUETE_Y) < FOGUETE_MEIO_A + r;
  };
  function sortear(s) {
    var tipo = s.rng() < 0.55 ? 'estrela' : 'asteroide';
    var tam = tipo === 'estrela' ? 11 : TAMANHOS[Math.floor(s.rng() * TAMANHOS.length)];
    s.objs.push({ tipo: tipo, tam: tam, x: 12 + Math.floor(s.rng() * (V.L - 24)), y: -10, giro: Math.floor(s.rng() * 4) });
  }
  // um passo da física. entrada: { dir: -1|0|1 (teclas), alvoX: número|null (dedo) }. Devolve os eventos do passo.
  V.passo = function (s, dt, entrada) {
    var ev = [];
    dt = Math.max(0, Math.min(50, dt || 0));
    s.t += dt; s.total += dt;
    if (s.tremer > 0) s.tremer = Math.max(0, s.tremer - dt);
    s.brilhos = s.brilhos.filter(function (b) { b.vida -= dt; return b.vida > 0; });
    if (s.fase === 'contagem') {
      if (s.t >= V.CONTAGEM_MS) { s.fase = 'voo'; s.t = 0; ev.push({ tipo: 'fase', fase: 'voo' }); }
      return ev;
    }
    if (s.fase === 'chegada') {
      if (s.t >= V.CHEGADA_MS) { s.fase = 'fim'; ev.push({ tipo: 'fase', fase: 'fim' }); }
      return ev;
    }
    if (s.fase !== 'voo') return ev;
    // o foguete: teclas andam; o dedo leva até onde tocou
    entrada = entrada || {};
    var passo = VEL_FOGUETE * dt / 1000;
    if (entrada.dir) s.x += entrada.dir * passo;
    else if (entrada.alvoX != null) {
      var d = entrada.alvoX - s.x;
      s.x += Math.abs(d) <= passo ? d : (d > 0 ? passo : -passo);
    }
    s.x = Math.max(8, Math.min(V.L - 8, s.x));
    // objetos descendo
    if (s.t < s.vooMs - SEM_OBJ_NO_FIM) {
      s.proximo -= dt;
      while (s.proximo <= 0) { if (!V.pertoDePortal || !V.pertoDePortal(s)) sortear(s); s.proximo += INTERVALO; }
    }
    var cai = VEL_OBJ * dt / 1000;
    s.objs = s.objs.filter(function (o) {
      o.y += cai;
      if (V.bateu(s, o)) {
        if (o.tipo === 'estrela') { s.estrelas++; s.brilhos.push({ x: o.x, y: o.y, vida: 400 }); ev.push({ tipo: 'estrela' }); }
        else { s.batidas++; s.tremer = 400; ev.push({ tipo: 'batida' }); }
        return false;
      }
      return o.y < V.A + 10;
    });
    if (V.passoPortais) V.passoPortais(s, ev);
    if (s.t >= s.vooMs) { s.fase = 'chegada'; s.t = 0; s.objs = []; ev.push({ tipo: 'fase', fase: 'chegada' }); }
    return ev;
  };

  /* ---------- falas (voz do Claude, pacote geral) ---------- */
  V.FALA_CONTAGEM = 'Três, dois, um... já!';
  V.falaChegada = function (planeta) {
    planeta = planeta || {};
    return 'Chegamos ' + (planeta.artigo || 'na') + ' ' + (planeta.nome || 'Lua') + '!';
  };
  V.falas = function () {
    var ps = (R.Viagem && R.Viagem.planetas && R.Viagem.planetas()) || [{ nome: 'Lua' }];
    var t = [V.FALA_CONTAGEM].concat(ps.map(V.falaChegada));
    if (V.FALA_CERTO) t.push(V.FALA_CERTO, V.FALA_ERRADO);   // portais (voo-portais.js)
    return t.map(function (x) { return { texto: x, voz: 'claude' }; });
  };
  function falar(texto) {
    try { if (R.Som && R.Som.falar) R.Som.falar(texto, { voz: 'claude' }); } catch (e) { if (window.console) console.error(e); }
  }
  function som(nome) { try { if (R.Som && R.Som.tocar) R.Som.tocar(nome); } catch (e) {} }
  function animacoes() {
    var P = R.Progresso, aj = P && P.estado && P.estado().ajustes;
    return !(aj && aj.animacoes === false) && !(R.util && R.util.reduzMovimentoSistema);
  }

  /* ---------- a tela ---------- */
  var atual = null;
  V.aberto = function () { return !!atual; };
  var porPortal = 1;
  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined) R.util.preencher(e, texto);   // emoji vira o ícone pixel
    return e;
  }
  // ampliação por fator inteiro em pixels do aparelho, cabendo na tela (como o telescópio do Observatório)
  function ajustar(cv, comPortais) {
    var dpr = window.devicePixelRatio || 1;
    // deitado (notebook): a barra vai para o lado e o canvas usa a altura toda (ui-voo.css)
    var deitado = window.innerWidth > window.innerHeight;
    var larg = window.innerWidth - (deitado ? 280 : 30), alt = window.innerHeight - (deitado ? 36 : 120) - (comPortais ? 112 : 0);
    var k = Math.max(1, Math.min(Math.floor(larg * dpr / V.L), Math.floor(alt * dpr / V.A)));
    cv.style.width = (V.L * k / dpr) + 'px'; cv.style.height = (V.A * k / dpr) + 'px';
  }

  V.iniciar = function (op) {
    op = op || {};
    if (atual) return atual.promessa;
    var UI = R.UI, planeta = op.planeta || { id: 'lua', nome: 'Lua', cor: '#c9c9d6' };
    var rng = R.sorteioDaChave ? R.sorteioDaChave('voo:' + (planeta.id || '')) : Math.random;
    porPortal = (R.config.viagem && R.config.viagem.estrelasPorPortal) || 1;
    var s = V.novoEstado({ rng: rng, perguntas: planeta.materia ? op.perguntas : null });
    var resolver;
    var promessa = new Promise(function (r) { resolver = r; });
    function resultado(chegou) {
      return { chegou: chegou, estrelas: s.estrelas, batidas: s.batidas, portais: { certos: s.portaisCertos, erros: s.portaisErros } };
    }
    if (!UI || typeof document === 'undefined') { resolver(resultado(false)); return promessa; }

    var t = UI.abrirTela('voo');
    var topo = el('div', 'voo-topo');
    var barra = el('div', 'voo-barra'), enche = el('div', 'voo-barra-enche');
    barra.setAttribute('role', 'progressbar'); barra.setAttribute('aria-label', 'Distância até ' + (planeta.artigo || 'a') + ' ' + planeta.nome);
    barra.setAttribute('aria-valuemin', '0'); barra.setAttribute('aria-valuemax', '100');
    barra.appendChild(enche);
    var conta = el('div', 'voo-estrelas', '⭐ 0');
    conta.setAttribute('aria-live', 'polite');
    var fechar = el('button', 'btn-icone btn-fechar voo-fechar', '✕');
    fechar.type = 'button'; fechar.setAttribute('aria-label', 'Sair do voo');
    topo.appendChild(barra); topo.appendChild(conta); topo.appendChild(fechar);
    var cv = el('canvas', 'voo-cena');
    cv.width = V.L; cv.height = V.A;
    cv.setAttribute('aria-label', 'Foguete voando até ' + (planeta.artigo || 'a') + ' ' + planeta.nome + '. Use as setas ou arraste o dedo.');
    var aviso = el('div', 'voo-aviso');
    var palco = el('div', 'voo-palco');
    palco.appendChild(cv); palco.appendChild(aviso);
    // com portais: a faixa da pergunta acima do canvas (coluna = faixa + palco)
    var coluna = el('div', 'voo-coluna'), faixa = s.portais.length ? el('div', 'voo-pergunta') : null;
    if (faixa) coluna.appendChild(faixa);
    coluna.appendChild(palco);
    var dica = el('p', 'voo-dica', 'Arraste o dedo ou use as setas para pegar estrelas!');
    topo.appendChild(dica); if (faixa) t.classList.add('tela-voo-portais'); t.appendChild(topo); t.appendChild(coluna);
    var comPortais = !!faixa;
    ajustar(cv, comPortais);
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // entrada: teclas e dedo
    var teclas = { esq: false, dir: false }, alvoX = null, dedo = null;
    function tecla(e, baixo) {
      var k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') teclas.esq = baixo;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') teclas.dir = baixo;
      else return;
      e.preventDefault(); alvoX = null;
    }
    function desce(e) { tecla(e, true); }
    function sobe(e) { tecla(e, false); }
    function xDoDedo(e) {
      var r = cv.getBoundingClientRect();
      return (e.clientX - r.left) / (r.width || 1) * V.L;
    }
    function tocar(e) {
      if (e.target === fechar) return;
      dedo = e.pointerId;
      try { palco.setPointerCapture(e.pointerId); } catch (x) {}
      alvoX = xDoDedo(e); e.preventDefault();
    }
    function mover(e) { if (dedo === e.pointerId) alvoX = xDoDedo(e); }
    function soltar(e) { if (dedo === e.pointerId) { dedo = null; alvoX = null; } }
    document.addEventListener('keydown', desce);
    document.addEventListener('keyup', sobe);
    palco.addEventListener('pointerdown', tocar);
    palco.addEventListener('pointermove', mover);
    palco.addEventListener('pointerup', soltar);
    palco.addEventListener('pointercancel', soltar);
    function redimensionar() { ajustar(cv, comPortais); }
    window.addEventListener('resize', redimensionar);

    var raf = 0, ultimo = null, animar = animacoes(), faseAntes = '', contaAntes = -1;
    var portais = faixa && V.portaisTela ? V.portaisTela({ faixa: faixa, palco: palco, cv: cv, s: s, animar: animar }) : null;
    function terminar(chegou) {
      if (!atual) return;
      atual = null;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      document.removeEventListener('keydown', desce);
      document.removeEventListener('keyup', sobe);
      window.removeEventListener('resize', redimensionar);
      if (!chegou && R.Som && R.Som.calar) R.Som.calar();
      if (portais) portais.fim();
      if (t.isConnected) UI.fecharTela(t);
      resolver(resultado(chegou));
    }
    fechar.addEventListener('click', function () { som('toque'); terminar(false); });
    t._aoEsc = function () { fechar.click(); };

    function textos() {
      var n = V.contagem(s);
      if (s.fase !== faseAntes || n !== contaAntes) {
        aviso.textContent = s.fase === 'contagem' ? String(n) : (s.fase === 'chegada' || s.fase === 'fim') ? V.falaChegada(planeta) : '';
        aviso.className = 'voo-aviso' + (aviso.textContent ? ' voo-aviso-ligado' : '') + (s.fase === 'contagem' ? ' voo-aviso-numero' : ' voo-aviso-chegada');
        // a dica só vale na contagem; depois some sem mexer o canvas (visibility)
        dica.style.visibility = s.fase === 'contagem' ? '' : 'hidden';
        faseAntes = s.fase; contaAntes = n;
      }
      var pct = Math.round(V.distancia(s) * 100);
      enche.style.width = pct + '%';
      barra.setAttribute('aria-valuenow', String(pct));
      R.util.preencher(conta, '⭐ ' + (s.estrelas + s.portaisCertos * porPortal));
    }
    function quadro(agora) {
      raf = 0;
      if (!atual) return;
      if (!t.isConnected) { terminar(false); return; }   // a tela foi fechada por fora (UI.fecharTodas)
      var dt = ultimo == null ? 0 : agora - ultimo;
      ultimo = agora;
      var dir = (teclas.dir ? 1 : 0) - (teclas.esq ? 1 : 0);
      var ev = V.passo(s, dt, { dir: dir, alvoX: dir ? null : alvoX });
      ev.forEach(function (e) {
        if (e.tipo === 'estrela') som('estrela');
        else if (e.tipo === 'batida') som('toque');
        else if (e.tipo === 'portal') { som(e.certo ? 'estrela' : 'toque'); if (portais) portais.evento(e); }
        else if (e.tipo === 'pergunta') { if (portais) portais.evento(e); }
        else if (e.fase === 'chegada') { som('fanfarra'); falar(V.falaChegada(planeta)); }
      });
      if (R.VooDesenho) {
        try { R.VooDesenho.quadro(ctx, s, planeta, animar, agora); } catch (x) { if (window.console) console.error(x); }
      }
      textos();
      if (portais) portais.quadro();
      if (s.fase === 'fim') { terminar(true); return; }
      raf = requestAnimationFrame(quadro);
    }
    atual = { promessa: promessa, terminar: terminar };
    falar(V.FALA_CONTAGEM);
    textos();
    raf = requestAnimationFrame(quadro);
    setTimeout(function () { if (atual && !t.contains(document.activeElement)) try { t.focus({ preventScroll: true }); } catch (x) {} }, 80);
    return promessa;
  };
  V.depurar = function () { return { aberto: V.aberto() }; };

  // sem registrarModulo: atividades carregam antes dos sistemas e mudariam a ordem dos módulos. As falas
  // (V.falas) entram pelo Reino.Viagem.falas() (contrato viagem.md §3: tudo o que o fluxo fala)
  R.Voo = V;
})();
