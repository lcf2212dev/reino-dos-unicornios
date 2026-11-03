/* Aura (aura): a pontuação que cresce com cada pergunta certa e se mantém nas erradas, e o brilho que
   contorna a figura da Mariana (J.silhueta, de personagens/jogador-desenho.js), que muda de cor a cada faixa (branca
   no começo). Números em Reino.config.aura.
   Cada contagem também avisa o barramento (Reino.EVENTOS.RESPOSTAS: { certas, erradas }), para o foguete.
   Quem conta: atividades/missao.js (cada Conferir da sala), atividades/treino.js e atividades/provas.js (na entrega,
   questão por questão), sistemas/surpresa-painel.js (cada resposta), atividades/voo-portais.js e
   sistemas/viagem-desafio.js, por Reino.Aura.contar(certas, materiaId): a matéria do dia vale mais na certa.
   Guarda em décimos inteiros (sem erro de ponto flutuante): 0,2 = 2. Chip do HUD: ui/hud-aura.js.
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino;
  // o que as partes do sistema dividem: a cor que o Claude ainda vai comemorar quando ela voltar ao mapa
  var S = R._aura = { comemorar: null, vigiando: false };
  function cfg() { return R.config.aura; }

  /* ================= FALAS ================= */
  // uma por cor nova (a branca é a do começo: não se comemora); texto exato = voz (npm run vozes)
  function fraseDaCor(nome) { return 'Uau! Sua aura ficou ' + nome + '!'; }
  function falasDasCores() { return cfg().cores.slice(1).map(function (c) { return fraseDaCor(c.nome); }); }

  /* ================= NO SAVE ================= */
  // aura: { mariana: { d: décimos, em } } (docs/contratos/save-e-mescla.md §11): entre aparelhos vale a mais
  // recente, preservando a compatibilidade com saves das versões anteriores. Novo ciclo mantém.
  R.Progresso.registrarCampo('aura', {
    padrao: function () { return {}; },
    mesclar: 'carimbo',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    limpar: function (v) {
      var m = v.mariana;
      if (m === undefined) return v;
      var d = typeof m.d === 'number' && isFinite(m.d) ? Math.max(0, Math.round(m.d)) : 0;
      return { mariana: { d: d, em: m.em } };
    },
    exemplos: [{ mariana: { d: 98, em: 10 } }, { mariana: { d: 240, em: 20 } }],
  });
  function estado() { try { return R.Progresso.estado(); } catch (e) { return null; } }

  /* ================= REGRAS ================= */
  var A = R.Aura = {};
  // a Aura em décimos (0 sem save ou sem o campo)
  A.decimos = function () {
    var est = estado(), m = est && est.aura && est.aura.mariana;
    return m && typeof m.d === 'number' ? m.d : 0;
  };
  A.valor = function () { return A.decimos() / 10; };
  // faixa: 0 abaixo de primeiraFaixa, 1 de lá até × multiplicador, e assim por diante
  A.faixa = function (d) {
    var c = cfg(), lim = Math.round(c.primeiraFaixa * 10), f = 0;
    while (d >= lim && f < 60) { f++; lim *= c.multiplicador; }
    return f;
  };
  // quanto uma pergunta certa vale (em décimos) na faixa em que ela está
  A.passo = function (d) {
    var c = cfg();
    return Math.round(c.passoInicial * 10) * Math.pow(c.multiplicador, A.faixa(d));
  };
  // a cor (e o nome dela) de uma faixa; a última vale daí em diante
  A.corDaFaixa = function (f) { var cs = cfg().cores; return cs[Math.min(f, cs.length - 1)]; };
  // onde começa a próxima faixa (em décimos)
  A.proximaFaixa = function (d) {
    var c = cfg(), lim = Math.round(c.primeiraFaixa * 10);
    for (var f = A.faixa(d); f > 0; f--) lim *= c.multiplicador;
    return lim;
  };
  // a matéria do dia (Reino.config.aura.materiaDoDia): { materia, vezes } de hoje, ou null
  A.materiaDoDia = function (dia) {
    var md = cfg().materiaDoDia, id = md && md.dias && md.dias[dia || R.util.hoje()];
    return id ? { materia: id, vezes: md.vezes } : null;
  };
  // quantas vezes o passo vale numa certa desta matéria hoje (1 fora da matéria do dia)
  A.vezesDaMateria = function (materiaId, dia) {
    var h = materiaId && A.materiaDoDia(dia);
    return h && h.materia === materiaId ? h.vezes : 1;
  };
  // um passo só, sem gravar: certa soma o passo × vezes (matéria do dia; 1 se omitido), errada mantém a Aura
  A.aplicar = function (d, certa, vezes) {
    return certa ? d + A.passo(d) * (vezes || 1) : d;
  };
  // conta as respostas (true = certa, false = errada, null = não conta), em ordem, grava e
  // guarda a cor nova para o Claude comemorar ao voltar ao mapa. materiaId: a matéria das perguntas (a do dia vale
  // mais). Devolve { antes, depois } em décimos.
  A.contar = function (respostas, materiaId) {
    var lista = [].concat(respostas);
    if (R.util && R.util.emit) R.util.emit(R.EVENTOS.RESPOSTAS, {
      certas: lista.filter(function (r) { return r === true; }).length,
      erradas: lista.filter(function (r) { return r === false; }).length });
    var est = estado();
    if (!est) return null;
    var antes = A.decimos(), d = antes, vezes = A.vezesDaMateria(materiaId);
    lista.forEach(function (r) { if (r === true || r === false) d = A.aplicar(d, r, vezes); });
    if (d === antes) return { antes: antes, depois: d };
    var mar = est.aura && est.aura.mariana;
    est.aura = est.aura || {};
    est.aura.mariana = { d: d, em: Math.max(Date.now(), (mar && mar.em || 0) + 1) };
    var fa = A.faixa(antes), fd = A.faixa(d);
    if (fd > fa) S.comemorar = fd;
    else if (S.comemorar !== null && fd < S.comemorar) S.comemorar = null;
    R.Progresso.salvar();
    vigiar();
    return { antes: antes, depois: d };
  };
  // "12,4": sempre com uma casa e vírgula ("1.234,0" com o ponto dos milhares)
  A.texto = function (d) {
    if (d === undefined) d = A.decimos();
    var inteiro = Math.floor(d / 10);
    return inteiro.toLocaleString('pt-BR') + ',' + (d % 10);
  };
  // o do chip do HUD (D13-01), de até 8 letras: "1.234,5" até 9.999,9; daí "12,3 mil", "123 mil", "1,2 mi", "45 bi"…
  // (arredonda para baixo: nunca mostra mais do que ela tem). O painel da Aura mostra o texto inteiro
  var UNIDADES = ['mil', 'mi', 'bi', 'tri'];
  A.textoCurto = function (d) {
    if (d === undefined) d = A.decimos();
    var inteiro = Math.floor(d / 10);
    if (inteiro < 10000) return A.texto(d);
    var u = 0, div = 1000;   // só inteiros: sem erro de vírgula flutuante
    while (inteiro >= div * 1000 && u < UNIDADES.length - 1) { div *= 1000; u++; }
    var v = Math.floor(inteiro / div), casa = v < 100 ? Math.floor(inteiro * 10 / div) % 10 : 0;
    return v.toLocaleString('pt-BR') + (casa ? ',' + casa : '') + ' ' + UNIDADES[u];
  };

  /* ================= COMEMORAÇÃO ================= */
  // a cor nova é comemorada quando ela volta ao mapa (sem tela por cima), para não falar por cima do retorno da sala
  function vigiar() {
    if (S.vigiando || !R.util || !R.util.on || !R.EVENTOS) return;
    S.vigiando = true;
    R.util.on(R.EVENTOS.TELAS, function (n) { if (!n) setTimeout(comemorarSePrecisar, 400); });
  }
  function comemorarSePrecisar() {
    if (S.comemorar === null || !R.UI || R.UI.temTela()) return;
    var f = S.comemorar;
    S.comemorar = null;
    if (f !== A.faixa(A.decimos())) return;
    var t = fraseDaCor(A.corDaFaixa(f).nome);
    if (R.Som && R.Som.tocar) R.Som.tocar('estrela');
    if (R.UI.festa) R.UI.festa(2, { som: false });   // subir de faixa: nível 2 (arte.md §16)
    if (R.Claude) R.Claude.falar(t, { fala: [t], voz: 'claude' });
  }
  A.comemorarSePrecisar = comemorarSePrecisar;

  /* ================= DESENHO ================= */
  // cor em rgba com transparência a
  function rgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  var ARCO = ['#ff6b6b', '#ffb830', '#ffe45c', '#6ee07a', '#5cb8ff', '#b57cff', '#ff7ec4'];
  function corAgora(f, t, animar) {
    var c = A.corDaFaixa(f).cor;
    if (c !== 'arco-iris') return c;
    return ARCO[animar ? Math.floor(t / 250) % ARCO.length : 0];
  }
  // contorno da figura: para cada sprite (o canvas já espelhado, em cache no desenho dela), UMA vez, os pixels vazios
  // colados na figura (anel 1, cheio) e os do anel seguinte (anel 2, clarinho); depois, um canvas por cor, também
  // guardado. Nada de getImageData por quadro.
  var BORDA = 2, contornos = new WeakMap();
  function mascara(img) {
    var m = contornos.get(img);
    if (m) return m;
    var w = img.width, h = img.height, W = w + BORDA * 2, H = h + BORDA * 2;
    var cheio = new Uint8Array(W * H), anel = new Uint8Array(W * H), pontos = [];
    try {
      var d = img.getContext('2d').getImageData(0, 0, w, h).data;
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) cheio[(y + BORDA) * W + x + BORDA] = 1;
    } catch (e) { cheio = null; }
    if (cheio) {
      // anel k: vazio, a no máximo k pixels (em volta, com diagonal) de um pixel da figura
      for (var k = 1; k <= BORDA; k++) {
        for (var yy = 0; yy < H; yy++) for (var xx = 0; xx < W; xx++) {
          var i = yy * W + xx;
          if (cheio[i] || anel[i]) continue;
          var perto = false;
          for (var dy = -1; dy <= 1 && !perto; dy++) for (var dx = -1; dx <= 1 && !perto; dx++) {
            var x2 = xx + dx, y2 = yy + dy;
            if (x2 < 0 || y2 < 0 || x2 >= W || y2 >= H) continue;
            var j = y2 * W + x2;
            if (cheio[j] || (anel[j] && anel[j] < k)) perto = true;
          }
          if (perto) { anel[i] = k; if (k === 1) pontos.push(i); }
        }
      }
    }
    m = { W: W, H: H, anel: cheio ? anel : null, fig: cheio, pontos: pontos, cores: {} };
    contornos.set(img, m);
    return m;
  }
  function contornoNaCor(m, cor) {
    if (m.cores[cor]) return m.cores[cor];
    var c = window.PA.novoCanvas(m.W, m.H), ctx = c.getContext('2d'), img = ctx.createImageData(m.W, m.H), d = img.data;
    var n = parseInt(cor.slice(1), 16), rgb = [n >> 16, (n >> 8) & 255, n & 255];
    for (var i = 0; i < m.anel.length; i++) {
      if (!m.anel[i]) continue;
      d[i * 4] = rgb[0]; d[i * 4 + 1] = rgb[1]; d[i * 4 + 2] = rgb[2];
      d[i * 4 + 3] = m.anel[i] === 1 ? 235 : 90;
    }
    ctx.putImageData(img, 0, 0);
    m.cores[cor] = c;
    return c;
  }
  // o halo em pixel (sem desfoque): a figura com o contorno, deslocada 1 e 2 px nos 4 lados, menos ela mesma.
  // Faixa 1 (a 1 px) mais forte, faixa 2 (a 2 px) mais clara. Calculado UMA vez por sprite; um canvas por cor.
  // O brilho só enfraquece para fora: as faixas do halo (ALFA_HALO, × 0,75–1) ficam sempre mais claras que o anel 2
  // do contorno (90, × 0,85–1). Faixa do halo mais forte que o anel 2 vira uma 2ª linha a 3 px, de lados retos
  // (enche o vão das patas e entre as cabeças): um retângulo em volta dela em vez do contorno da figura.
  var HALO = 2, ALFA_HALO = [0, 70, 30];
  function halo(m) {
    if (m.halo) return m.halo;
    var W = m.W + HALO * 2, H = m.H + HALO * 2, faixa = new Uint8Array(W * H), cheio = new Uint8Array(W * H);
    var fig = m.fig;
    for (var y = 0; y < m.H; y++) for (var x = 0; x < m.W; x++) {
      var i = y * m.W + x;
      if (m.anel[i] || (fig && fig[i])) cheio[(y + HALO) * W + x + HALO] = 1;
    }
    for (var k = 1; k <= HALO; k++) {
      for (var yy = 0; yy < H; yy++) for (var xx = 0; xx < W; xx++) {
        var j = yy * W + xx;
        if (cheio[j] || faixa[j]) continue;
        if ((xx >= k && cheio[j - k]) || (xx + k < W && cheio[j + k]) ||
            (yy >= k && cheio[j - k * W]) || (yy + k < H && cheio[j + k * W])) faixa[j] = k;
      }
    }
    m.halo = { W: W, H: H, faixa: faixa, cores: {} };
    return m.halo;
  }
  function haloNaCor(h, cor) {
    if (h.cores[cor]) return h.cores[cor];
    var c = window.PA.novoCanvas(h.W, h.H), ctx = c.getContext('2d'), img = ctx.createImageData(h.W, h.H), d = img.data;
    var n = parseInt(cor.slice(1), 16), rgb = [n >> 16, (n >> 8) & 255, n & 255];
    for (var i = 0; i < h.faixa.length; i++) {
      if (!h.faixa[i]) continue;
      d[i * 4] = rgb[0]; d[i * 4 + 1] = rgb[1]; d[i * 4 + 2] = rgb[2];
      d[i * 4 + 3] = ALFA_HALO[h.faixa[i]];
    }
    ctx.putImageData(img, 0, 0);
    h.cores[cor] = c;
    return c;
  }
  // brilhinho de 1 px com bracinhos na cor, no ponto k do anel 1 (px do jogo)
  function brilhinho(p, s, m, k, cor, a) {
    var i = m.pontos[k % m.pontos.length];
    var bx = s.x - m.W / 2 + (i % m.W), by = s.yPes + BORDA - m.H + Math.floor(i / m.W);
    if (s.linha !== null && by >= s.linha) return;
    p.ret(bx, by, 1, 1, 'rgba(255,255,255,' + a + ')');
    var c = rgba(cor, 0.8 * a);
    p.ret(bx - 1, by, 1, 1, c); p.ret(bx + 1, by, 1, 1, c); p.ret(bx, by - 1, 1, 1, c); p.ret(bx, by + 1, 1, 1, c);
  }
  A.itensDesenho = function (p, t, animar) {
    var J = window.Jogador, s = J.silhueta;
    if (!s || !s.img || !window.PA) return [];
    if (R.util && R.util.reduzMovimentoSistema) animar = false;
    var m = mascara(s.img);
    if (!m.anel) return [];
    var cor = corAgora(A.faixa(A.decimos()), t, animar), img = contornoNaCor(m, cor);
    var onda = animar ? (Math.sin(t / 420) + 1) / 2 : 0.5;   // 0..1: o brilho respira devagar
    // logo atrás dela (y um pouco menor que o dos pés: o sort do laço a põe antes da Mariana e do unicórnio)
    return [{ y: J.y - 0.5, desenhar: function () {
      var ctx = p.ctx;
      ctx.save();
      if (s.linha !== null) {
        // na água, só o que está acima da linha d'água (como a figura)
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.width, Math.max(0, p.tela(s.x, s.linha).y));
        ctx.clip();
      }
      // o halo: faixas de pixel em volta do contorno, respirando no alfa, por baixo do contorno nítido
      ctx.globalAlpha = 0.75 + 0.25 * onda;
      p.sprite(haloNaCor(halo(m), cor === '#ffffff' ? '#fff8d8' : cor), s.x, s.yPes + BORDA + HALO);
      ctx.globalAlpha = 0.85 + 0.15 * onda;
      p.sprite(img, s.x, s.yPes + BORDA);
      ctx.restore();
      // brilhinhos acendendo e apagando em pontos do contorno (parados com animações desligadas)
      if (!m.pontos.length) return;
      for (var b = 0; b < 3; b++) {
        var fase = animar ? t / 700 + b / 3 : 0.5, vez = Math.floor(fase);
        var a = animar ? Math.sin((fase - vez) * Math.PI) : 1;
        brilhinho(p, s, m, vez * 7919 + b * Math.floor(m.pontos.length / 3), cor, a.toFixed(3));
      }
    } }];
  };

  R.registrarModulo({
    id: 'aura',
    iniciar: function () { vigiar(); },
    falas: function () { return falasDasCores().map(function (t) { return { texto: t }; }); },
    // o estado para os testes e para __reino.modulo('aura')
    depurar: function () {
      var d = A.decimos(), f = A.faixa(d);
      return { decimos: d, valor: A.texto(d), faixa: f, cor: A.corDaFaixa(f).nome, passo: A.passo(d), comemorar: S.comemorar };
    },
    // o brilho em volta dela no mapa e nos interiores (o laço junta com a Mariana e ordena por y)
    camada: {
      ativo: function () { return !!window.Jogador && !!estado(); },
      itensDesenho: function (p, t, animar) { return A.itensDesenho(p, t, animar); },
    },
  });
})();
