/* Aura (aura): a pontuação que cresce com cada pergunta certa e cai com cada errada (o dobro), e o brilho em
   volta da Mariana, que muda de cor a cada faixa (branca no começo). Números em Reino.config.aura.
   Cada contagem também avisa o barramento (Reino.EVENTOS.RESPOSTAS: { certas, erradas }), para o foguete.
   Quem conta: atividades/missao.js (cada Conferir da sala), atividades/treino.js e atividades/provas.js (na entrega,
   questão por questão), sistemas/surpresa-painel.js (cada resposta), por Reino.Aura.contar(certas).
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
  // recente (a Aura também desce, então "a maior" traria de volta o que ela perdeu). Novo ciclo mantém.
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
  // um passo só, sem gravar: certa soma o passo, errada tira o passo × penalidade (nunca abaixo de 0)
  A.aplicar = function (d, certa) {
    var p = A.passo(d);
    return certa ? d + p : Math.max(0, d - p * cfg().penalidade);
  };
  // conta as respostas (true = certa, false = errada, null = não conta), em ordem, grava e
  // guarda a cor nova para o Claude comemorar ao voltar ao mapa. Devolve { antes, depois } em décimos.
  A.contar = function (respostas) {
    var lista = [].concat(respostas);
    if (R.util && R.util.emit) R.util.emit(R.EVENTOS.RESPOSTAS, {
      certas: lista.filter(function (r) { return r === true; }).length,
      erradas: lista.filter(function (r) { return r === false; }).length });
    var est = estado();
    if (!est) return null;
    var antes = A.decimos(), d = antes;
    lista.forEach(function (r) { if (r === true || r === false) d = A.aplicar(d, r); });
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
    if (R.UI.confete && !(R.util && R.util.reduzMovimentoSistema)) R.UI.confete(30);
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
  // uma oval de pixels (meia-largura rx, meia-altura ry) centrada em (cx, cy), só a borda (esp px) ou cheia
  function oval(p, cx, cy, rx, ry, cor, esp) {
    for (var yy = -ry; yy <= ry; yy++) {
      var w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (yy * yy) / (ry * ry))));
      if (w <= 0) continue;
      if (!esp) { p.ret(cx - w, cy + yy, w * 2, 1, cor); continue; }
      var dentro = Math.round((rx - esp) * Math.sqrt(Math.max(0, 1 - (yy * yy) / ((ry - esp) * (ry - esp)))));
      if (Math.abs(yy) > ry - esp) dentro = 0;
      var lado = Math.max(1, w - dentro);
      p.ret(cx - w, cy + yy, lado, 1, cor);
      p.ret(cx + w - lado, cy + yy, lado, 1, cor);
    }
  }
  // o tamanho do corpo em volta do qual a aura brilha (a pé, montada no unicórnio pequeno ou grande)
  function tamanho() {
    var J = window.Jogador;
    // no banho de espuma o unicórnio está na banheira e ela fica a pé, ao lado
    var B = R.Banho, noBanho = false;
    try { noBanho = !!(B && B.desenhandoUni && B.desenhandoUni()); } catch (e) { noBanho = false; }
    if (noBanho || !J.montado || !J.montado()) return { rx: 9, ry: 14, alto: 26 };
    var P = R.Progresso, u = P.estado().unis[P.montaria()];
    var grande = R.Unicornios.estagio(u ? u.xp : 0) >= 2;
    return grande ? { rx: 19, ry: 20, alto: 38 } : { rx: 15, ry: 16, alto: 30 };
  }
  A.itensDesenho = function (p, t, animar) {
    var J = window.Jogador;
    if (R.util && R.util.reduzMovimentoSistema) animar = false;
    var f = A.faixa(A.decimos()), cor = corAgora(f, t, animar), tam = tamanho();
    var pulsa = animar ? Math.round(Math.sin(t / 420)) : 0;
    var x = Math.round(J.x), yPe = Math.round(J.y), cy = yPe - Math.round(tam.alto / 2);
    var rx = tam.rx + pulsa, ry = tam.ry + pulsa;
    // atrás dela (y um pouco menor que o dos pés: o sort do laço a põe antes da Mariana e do unicórnio)
    return [{ y: J.y - 0.5, desenhar: function () {
      oval(p, x, cy, rx + 2, ry + 2, rgba(cor === '#ffffff' ? '#fff8d8' : cor, 0.2), 0);
      oval(p, x, cy, rx, ry, rgba(cor, 0.3), 0);
      oval(p, x, cy, rx + 2, ry + 2, rgba(cor, 0.8), 1);
      // brilhinhos girando em volta (parados com animações desligadas)
      for (var i = 0; i < 3; i++) {
        var ang = (animar ? t / 900 : 0.6) + i * 2.094;
        var bx = Math.round(x + Math.cos(ang) * (rx + 3)), by = Math.round(cy + Math.sin(ang) * (ry + 3));
        p.ret(bx, by, 1, 1, '#ffffff');
        p.ret(bx - 1, by, 1, 1, rgba(cor, 0.8)); p.ret(bx + 1, by, 1, 1, rgba(cor, 0.8));
        p.ret(bx, by - 1, 1, 1, rgba(cor, 0.8)); p.ret(bx, by + 1, 1, 1, rgba(cor, 0.8));
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
