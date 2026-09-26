/* Versão nova (Reino.Versao) — docs/contratos/cena-e-motor.md §15.
   O servidor de casa passa a servir um jogo novo (npm run versao grava js/versao.json), mas as abas que já
   estavam abertas nos aparelhos continuam com o velho. Este módulo percebe e atualiza a aba SOZINHO:
   1. confere o js/versao.json (sem cache) ao entrar no Reino (a linha de base), a cada `intervaloMs` e quando a
      aba volta a ficar visível (no máximo 1×/min). Sem versao.json (404): compara o texto do index.html;
   2. só acredita na mudança vista 2 vezes, com `confirmarMs` entre elas, e com a aba aberta há mais de `cacheMs`
      (o servidor deixa css/js 300 s em cache: recarregar antes misturaria arquivos novos e velhos);
   3. espera ela ficar PARADA NO MAPA por `paradaMs` (sem tela, sem balão, sem caminho, aba visível);
   4. o Claude avisa num balão curto que fecha sozinho, o jogo grava (P.salvar) e recarrega `esperaMs` depois.
      Se ela mexer (tocar fora do balão, tecla, andar) no aviso, desiste e tenta de novo na próxima parada.
   Desligado no artifact do claude.ai (a plataforma já entrega a versão nova), aberto do arquivo (file:) e no
   modo determinístico dos testes (?congelar=1), a menos que a URL tenha &versao=1 (teste deste módulo).
   Nada aqui toca em DOM, Progresso ou Cena no carregamento (node: true: listar-falas.js lê as falas num vm).
   Nada vai para o save. */
(function () {
  var V = {};
  var PADRAO = { intervaloMs: 10 * 60000, confirmarMs: 60000, cacheMs: 330000, paradaMs: 8000, avisoMs: 4500, esperaMs: 2500 };
  var VISIVEL_MIN_MS = 60000;   // conferir ao voltar para a aba: no máximo 1×/min

  function cfg(k) {
    var c = Reino.config && Reino.config.versao;
    return c && typeof c[k] === 'number' ? c[k] : PADRAO[k];
  }
  // monotônico (o relógio do aparelho voltando não engana); no modo determinístico é o relógio virtual
  function agora() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }

  /* ---------- o que o Claude fala (pacote geral, voz do Claude) ---------- */
  var AVISO = ['Chegou novidade no Reino! ✨', 'O que você fez fica guardado.'];
  V.falas = function () { return AVISO.map(function (t) { return { texto: t, voz: 'claude' }; }); };

  /* ---------- ligado ou não ---------- */
  // amb = { claude, protocolo, busca, congelado } (os testes passam um de mentira); devolve o motivo de estar
  // desligado ('artifact', 'arquivo', 'congelado') ou null
  V.motivoDesligado = function (amb) {
    if (/[?&]versao=1(&|$)/.test(amb.busca || '')) return null;
    if (amb.claude && typeof amb.claude.use === 'function') return 'artifact';
    if (!/^https?:$/.test(amb.protocolo || '')) return 'arquivo';
    if (amb.congelado) return 'congelado';
    return null;
  };
  function ambiente() {
    return { claude: window.claude, protocolo: location.protocol, busca: location.search, congelado: !!Reino.congelado };
  }

  /* ---------- estado (só na memória) ---------- */
  // fase: 'desligado' | 'vigiando' | 'nova' (confirmada, esperando a parada) | 'aviso' | 'gravado' | 'recarregando'
  var fase = 'desligado', motivo = null, iniciado = false, relogio = null;
  var base = null;            // a impressão da versão desta aba ('v:<hash>' ou 'i:<hash do index>')
  var suspeita = null;        // { marca, em }: uma leitura diferente da base, esperando a confirmação
  var nova = null;            // a marca confirmada
  var buscando = false, ultimaBusca = -Infinity, buscas = 0;
  var paradaDesde = null, avisos = 0, cancelados = 0, vezAviso = 0, avisoNaTela = false, timerRecarga = null;

  // marca curta de um texto (djb2), para o index.html quando não há versao.json
  function marcaDoTexto(t) {
    var h = 5381;
    for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
    return 'i:' + (h >>> 0).toString(16) + ':' + t.length;
  }
  function semCache(url) { return fetch(url + '?t=' + Date.now(), { cache: 'no-store' }); }
  // a marca da versão servida agora, ou null (rede fora, erro do servidor)
  function lerMarca() {
    return semCache('js/versao.json').then(function (r) {
      if (r.ok) return r.json().then(function (d) { return d && d.versao ? 'v:' + d.versao : null; });
      if (r.status !== 404) return null;
      return semCache('index.html').then(function (ri) { return ri.ok ? ri.text().then(marcaDoTexto) : null; });
    }).catch(function () { return null; });
  }

  function buscar() {
    if (buscando || fase !== 'vigiando') return;
    buscando = true;
    ultimaBusca = agora();
    buscas++;
    lerMarca().then(function (m) {
      buscando = false;
      if (!m || fase !== 'vigiando') return;
      var t = agora();
      if (base === null) { base = m; return; }
      if (m === base) { suspeita = null; return; }
      if (!suspeita || suspeita.marca !== m) { suspeita = { marca: m, em: t }; return; }
      // a mesma mudança vista de novo, `confirmarMs` depois, com o cache do servidor já vencido
      if (t - suspeita.em >= cfg('confirmarMs') && t > cfg('cacheMs')) { nova = m; fase = 'nova'; paradaDesde = null; }
    });
  }

  /* ---------- parada no mapa ---------- */
  function visivel() { return !(typeof document !== 'undefined' && document.hidden); }
  function andando() {
    var J = window.Jogador;
    return !!(J && ((J.caminho && J.caminho.length) || J.aoChegar || J.andando));
  }
  // no mapa (não num prédio), sem tela DOM, transição, diálogo nem pergunta surpresa
  function noMapa() {
    var C = Reino.Cena;
    if (!C || !C.estado || C.estado() !== 'mapa') return false;
    if (C.bloqueado && C.bloqueado()) return false;
    if (Reino.UI && Reino.UI.temTela && Reino.UI.temTela()) return false;
    return !(Reino.Surpresa && Reino.Surpresa.aberta && Reino.Surpresa.aberta());
  }
  function balao() { return !!(Reino.Claude && Reino.Claude.aberto && Reino.Claude.aberto()); }
  function parada() { return noMapa() && !balao() && !andando() && visivel(); }

  // ela mexeu: a parada recomeça; no aviso (fora do próprio balão) ou na espera, desiste por agora
  function mexeu(ev) {
    paradaDesde = null;
    if (fase !== 'aviso' && fase !== 'gravado') return;
    var alvo = ev && ev.target, bal = document.getElementById('claude-balao');
    if (fase === 'aviso' && bal && alvo && alvo.nodeType === 1 && bal.contains(alvo)) return;   // o "Ok!" do balão
    cancelar();
  }
  function cancelar() {
    vezAviso++;
    clearTimeout(timerRecarga);
    cancelados++;
    fase = 'nova';
    paradaDesde = null;
    if (avisoNaTela) { avisoNaTela = false; Reino.Claude.fechar(); }
  }

  /* ---------- aviso, gravar e recarregar ---------- */
  function avisar() {
    fase = 'aviso';
    avisos++;
    var minha = ++vezAviso;
    avisoNaTela = true;
    Reino.Claude.falar(AVISO.join(' '), { fala: AVISO.slice(), tempo: cfg('avisoMs') }).then(function () {
      if (minha !== vezAviso) return;
      avisoNaTela = false;
      // o balão fechou (sozinho ou no "Ok!"): ela ainda está parada no mapa?
      if (!noMapa() || andando() || !visivel()) { cancelar(); return; }
      fase = 'gravado';
      Reino.Progresso.salvar();
      timerRecarga = setTimeout(function () {
        if (minha !== vezAviso) return;
        if (!noMapa() || andando()) { cancelar(); return; }
        fase = 'recarregando';
        V._recarregar();
      }, cfg('esperaMs'));
    });
  }

  function tique() {
    var t = agora();
    if (fase === 'vigiando') {
      var espera = suspeita ? cfg('confirmarMs') : cfg('intervaloMs');
      if (base === null || t - ultimaBusca >= espera) buscar();
      return;
    }
    if (fase === 'nova') {
      if (!parada()) { paradaDesde = null; return; }
      if (paradaDesde === null) paradaDesde = t;
      if (t - paradaDesde >= cfg('paradaMs')) avisar();
      return;
    }
    // no aviso ela saiu andando (setas, caminho) ou a cena mudou: desiste por agora
    if (fase === 'aviso' && (andando() || !noMapa() || !visivel())) cancelar();
  }

  V.iniciar = function () {
    if (iniciado) return;
    iniciado = true;
    motivo = V.motivoDesligado(ambiente());
    if (motivo) return;
    fase = 'vigiando';
    var op = { capture: true, passive: true };
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, mexeu, op); });
    document.addEventListener('visibilitychange', function () {
      if (visivel() && fase === 'vigiando' && agora() - ultimaBusca >= VISIVEL_MIN_MS) buscar();
    });
    buscar();
    relogio = setInterval(tique, 1000);
  };

  // ponto trocável (os testes põem um de mentira no lugar)
  V._recarregar = function () { location.reload(); };

  // para os testes: __reino.modulo('versao')
  V.depurar = function () {
    return { ligado: !motivo && iniciado, motivo: motivo, fase: fase, base: base, suspeita: suspeita ? suspeita.marca : null,
      nova: nova, buscas: buscas, avisos: avisos, cancelados: cancelados, parada: paradaDesde !== null, relogio: !!relogio };
  };

  Reino.Versao = V;
  // módulo (js/nucleo/modulos.js); o if é para os testes que carregam só este arquivo
  if (Reino.registrarModulo) Reino.registrarModulo({ id: 'versao', iniciar: function () { V.iniciar(); }, falas: V.falas, depurar: V.depurar });
})();
