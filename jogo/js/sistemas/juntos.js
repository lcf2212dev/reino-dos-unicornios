/* Jogar juntos no mesmo servidor (docs/contratos/juntos.md): a presença ao vivo dentro de um servidor.
   Como no PKXD: alguém CRIA um servidor (um código de 4 letras e um link de convite), manda para os amigos, e quem
   entra joga junto — cada um no seu save. Quem não cria nem entra em nenhum fica SOZINHO, como sempre foi (sem
   pedido de rede nenhum).
   Dentro do servidor, cada jogador manda a cada `intervaloMs` um POST com login, sala (a cena ativa), posição, olhar,
   nome, aparência e o unicórnio montado, e recebe a lista de quem está no MESMO servidor. Sem servidor com a rota
   (404), no modo congelado, no artifact ou em `file:`, nada acontece (nem rede, nem pixel).
   O desenho dos outros fica em sistemas/juntos-desenho.js (`Reino.JuntosDesenho`); a tela, em ui/juntos.js.
   node: true: no carregamento só guarda funções (nada de DOM, Progresso, Cena ou rede). */
(function () {
  var R = window.Reino, U = R.util, EV = R.EVENTOS;
  var J = (R.Juntos = {});
  var CHAVE_PRESENCA = 'api/presenca', CHAVE_SERVIDOR = 'api/juntos', GUARDADO = 'reino-juntos-servidor';
  var S = { tentou: false, pode: false, ligado: false, servidor: '', dono: '', nomeServidor: '', aviso: '',
    sala: '', total: 0, jogadores: [], pendente: null, enviando: false, deNovo: false, erro: 0, timer: 0, t: 0, assinatura: '' };

  function cfg(k, padrao) {
    var c = (R.config && R.config.juntos) || {};
    return typeof c[k] === 'number' ? c[k] : padrao;
  }
  function meuLogin() {
    try { return R.Progresso && R.Progresso.jogador ? R.Progresso.jogador() : ''; } catch (e) { return ''; }
  }
  function salaAtual() {
    try { var c = R.Cena && R.Cena.atual ? R.Cena.atual() : null; return c && c.id ? c.id : 'mapa'; } catch (e) { return 'mapa'; }
  }
  function num(v, padrao) { return typeof v === 'number' && isFinite(v) ? v : padrao; }
  function textoCurto(v, max) { return typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max) : ''; }
  // o código do servidor: 4 letras/números (sem I, O, 0 e 1, que confundem), como o servidor gera
  function codigoValido(c) { return typeof c === 'string' && /^[A-HJ-NP-Z2-9]{4}$/.test(c); }
  function soCodigo(v) { return typeof v === 'string' ? v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) : ''; }
  function mensagem(txt) {
    try { if (typeof navigator !== 'undefined' && navigator.onLine === false) txt = 'Sem internet agora. Tente de novo quando a rede voltar.'; } catch (e) { /* segue */ }
    S.aviso = txt;
    U.emit(EV.JUNTOS, { total: S.total, sala: salaAtual(), jogadores: J.todos(), servidor: J.servidor(), aviso: S.aviso });
  }
  function guardar(codigo) { try { localStorage.setItem(GUARDADO, codigo || ''); } catch (e) { /* sem armazenamento */ } }
  function guardado() { try { var c = soCodigo(localStorage.getItem(GUARDADO) || ''); return codigoValido(c) ? c : ''; } catch (e) { return ''; } }
  // tira o ?servidor= do endereço: sair do servidor (ou ele fechar) não pode voltar nele ao recarregar
  function limparLink() {
    try {
      if (!history || !history.replaceState) return;
      var q = (location.search || '').replace(/^\?/, '').split('&').filter(function (p) { return p && p.indexOf('servidor=') !== 0; });
      history.replaceState(null, '', location.pathname + (q.length ? '?' + q.join('&') : '') + (location.hash || ''));
    } catch (e) { /* sem histórico: o servidor guardado resolve */ }
  }
  // o link do convite (?servidor=XXXX) entra na frente do que está guardado
  function doLink() {
    try {
      var m = /[?&]servidor=([^&#]*)/.exec(location.search || '');
      var c = soCodigo(decodeURIComponent(m ? m[1] : ''));
      return codigoValido(c) ? c : '';
    } catch (e) { return ''; }
  }

  /* ---------- o que eu mando ---------- */
  function unicornio(est, P) {
    try {
      var Jg = window.Jogador;
      if (!Jg || !Jg.montado || !Jg.montado()) return null;   // a pé (bebê ou sem montaria): o outro desenha a menina
      var id = P.montaria(), u = est.unis && est.unis[id], def = R.Unicornios && R.Unicornios.def ? R.Unicornios.def(id, est.corInicial) : null;
      if (!def || !def.cores || !def.cores.crina) return null;
      return { id: id, estagio: R.Unicornios.estagio(u ? u.xp : 0),
        cores: { corpo: def.cores.corpo, crina: def.cores.crina.slice(0, 3), chifre: def.cores.chifre } };
    } catch (e) { return null; }
  }
  function corpo(login) {
    var P = R.Progresso, Jg = window.Jogador, est = null;
    try { est = P.estado() || {}; } catch (e) { est = {}; }
    var perfil = { nome: login, sexo: 'menina' };
    try { if (R.Jogadores && R.Jogadores.perfil) perfil = R.Jogadores.perfil(); } catch (e) { /* fica o login */ }
    var ap = est.aparencia || {};
    return {
      login: login, servidor: S.servidor, sala: salaAtual(),
      x: Jg ? num(Jg.x, 0) : 0, y: Jg ? num(Jg.y, 0) : 0,
      olharX: Jg ? num(Jg.olharX, 0) : 0, olharY: Jg ? num(Jg.olharY, 1) : 1,
      nome: perfil.nome, sexo: perfil.sexo,
      aparencia: { pele: ap.pele, cabelo: ap.cabelo, roupa: ap.roupa, laco: ap.laco },
      visual: { corte: ap.corte, modelo: ap.modelo, semLaco: ap.semLaco === true },
      uni: unicornio(est, P),
    };
  }

  /* ---------- a lista que chega ---------- */
  // Carimbo do servidor → relógio do desenho (performance.now), sem depender do relógio deste aparelho
  function receber(d) {
    var agora = num(d && d.agora, Date.now()), lista = Array.isArray(d && d.jogadores) ? d.jogadores : [];
    var eu = meuLogin(), agoraDesenho = performance.now(), antes = {}, novos = [];
    S.jogadores.forEach(function (j) { antes[j.login] = j; });
    for (var i = 0; i < lista.length; i++) {
      var j = lista[i];
      if (!j || typeof j.login !== 'string' || j.login === eu) continue;
      var velho = antes[j.login];
      var x = num(j.x, 0), y = num(j.y, 0);
      var n = {
        login: j.login, nome: textoCurto(j.nome, 20) || j.login, sala: textoCurto(j.sala, 32) || 'mapa',
        sexo: j.sexo === 'menino' ? 'menino' : 'menina',
        x: x, y: y, olharX: num(j.olharX, 0), olharY: num(j.olharY, 1),
        aparencia: j.aparencia || null, visual: j.visual || null, uni: j.uni || null,
        dx: velho ? velho.dx : x, dy: velho ? velho.dy : y,   // posição desenhada (persegue x/y a cada quadro)
        dist: velho ? velho.dist : 0, andando: false,
        aceno: velho ? velho.aceno : 0, recado: velho ? velho.recado : '', recadoEm: velho ? velho.recadoEm : 0,
      };
      // troca de sala/teleporte: começa no lugar novo, sem atravessar o mapa
      if (velho && velho.sala !== n.sala) { n.dx = x; n.dy = y; n.dist = 0; }
      if (num(j.acenoEm, 0) > 0) n.aceno = Math.max(1, agoraDesenho - Math.max(0, agora - j.acenoEm));
      if (num(j.recadoEm, 0) > 0 && typeof j.recado === 'string' && j.recado) {
        n.recado = j.recado; n.recadoEm = Math.max(1, agoraDesenho - Math.max(0, agora - j.recadoEm));
      }
      novos.push(n);
    }
    S.jogadores = novos;
    S.total = novos.length;
    S.sala = salaAtual();
    var assinatura = novos.map(function (j) { return j.login + ':' + j.sala + ':' + j.nome; }).sort().join('|') + '#' + S.servidor;
    if (assinatura !== S.assinatura) {
      S.assinatura = assinatura;
      U.emit(EV.JUNTOS, { total: S.total, sala: S.sala, jogadores: J.todos(), servidor: J.servidor(), aviso: S.aviso });
    }
  }

  /* ---------- o relógio da rede ---------- */
  function agendar() {
    if (!S.ligado) return;
    clearTimeout(S.timer);
    var escondida = typeof document !== 'undefined' && document.hidden;
    var ms = escondida ? cfg('intervaloParadoMs', 8000) : cfg('intervaloMs', 2500);
    if (S.erro >= 2) ms = Math.max(ms, cfg('intervaloMs', 2500) * 3);   // rede ruim: insiste mais devagar
    S.timer = setTimeout(enviar, ms);
  }
  function enviar() {
    clearTimeout(S.timer); S.timer = 0;
    if (!S.ligado || !S.servidor) return;
    if (S.enviando) { S.deNovo = true; return; }
    var login = meuLogin();
    if (!login) { pararPresenca(); return; }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { agendar(); return; }
    if (typeof fetch !== 'function') { pararPresenca(); return; }
    var dados = corpo(login), pendente = S.pendente;
    if (pendente) { if (pendente.aceno) dados.aceno = true; if (pendente.recado) dados.recado = pendente.recado; }
    S.enviando = true;
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var limite = (R.config && R.config.limiteRedeMs) || 15000;
    var t = ctl ? setTimeout(function () { ctl.abort(); }, limite) : 0;
    var opcoes = { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) };
    if (ctl) opcoes.signal = ctl.signal;
    fetch(CHAVE_PRESENCA, opcoes).then(function (r) {
      clearTimeout(t);
      if (r.status === 404) {
        // sem a rota = servidor sem "Jogar juntos" (o jogo é o de sempre); com `erro: servidor` = o servidor fechou
        return r.json().catch(function () { return null; }).then(function (e) {
          if (e && e.erro === 'servidor') perderServidor('O servidor fechou. Você continua jogando sozinha.');
          else desligar();
          return null;
        });
      }
      if (!r.ok) throw new Error('presenca ' + r.status);
      return r.json();
    }).then(function (d) {
      if (!S.ligado || !d) return;
      if (S.pendente === pendente) S.pendente = null;   // o aceno/recado saiu: nunca vai duas vezes
      S.erro = 0;
      receber(d);
    }).catch(function () {
      // qualquer falha (rede, resposta, um ouvinte do JUNTOS): a presença não trava; tenta de novo depois
      clearTimeout(t);
      if (S.ligado) S.erro++;
    }).then(function () {
      S.enviando = false;
      if (!S.ligado) return;
      if (S.deNovo) { S.deNovo = false; enviar(); return; }
      agendar();
    });
  }
  function desligar() {
    S.ligado = false;
    clearTimeout(S.timer); S.timer = 0;
    if (S.jogadores.length) {
      S.jogadores = []; S.total = 0; S.assinatura = '';
      U.emit(EV.JUNTOS, { total: 0, sala: salaAtual(), jogadores: [], servidor: J.servidor(), aviso: S.aviso });
    }
  }
  function pararPresenca() { desligar(); }
  function iniciarPresenca() {
    if (S.ligado || !S.servidor) return;
    S.ligado = true; S.erro = 0; S.assinatura = '';
    enviar();
  }
  // o servidor sumiu (fechado pelo dono ou vencido): sai dele e avisa
  function perderServidor(aviso) {
    S.servidor = ''; S.dono = ''; S.nomeServidor = '';
    guardar('');
    limparLink();
    desligar();
    S.jogadores = []; S.total = 0;
    mensagem(aviso || 'O servidor fechou.');
  }
  // saiu da página: tira a linha na hora (keepalive: o pedido termina mesmo com a aba fechando)
  function sairDaPagina() {
    if (!S.ligado) return;
    var login = meuLogin();
    S.ligado = false;
    if (!login || typeof fetch !== 'function') return;
    var dados = corpo(login); dados.saiu = true;
    try {
      fetch(CHAVE_PRESENCA, { method: 'POST', cache: 'no-store', keepalive: true,
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
    } catch (e) { /* sem rede na saída: o TTL do servidor tira a linha */ }
  }

  /* ---------- servidores (criar, entrar, sair, fechar) ---------- */
  function pedir(url, opcoes) {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var limite = (R.config && R.config.limiteRedeMs) || 15000;
    var t = ctl ? setTimeout(function () { ctl.abort(); }, limite) : 0;
    if (ctl) opcoes.signal = ctl.signal;
    return fetch(url, opcoes).then(function (r) {
      clearTimeout(t);
      return r.json().catch(function () { return null; }).then(function (d) { return { status: r.status, ok: r.ok, dados: d }; });
    }, function (e) { clearTimeout(t); throw e; });
  }
  function adotar(servidor) {
    S.servidor = servidor.codigo;
    S.dono = servidor.dono || '';
    S.nomeServidor = textoCurto(servidor.nome, 20) || servidor.dono || 'Servidor';
    S.aviso = '';
    guardar(S.servidor);
    iniciarPresenca();
    U.emit(EV.JUNTOS, { total: S.total, sala: salaAtual(), jogadores: J.todos(), servidor: J.servidor(), aviso: '' });
  }
  // entra num servidor pelo código (convite ou o que ficou guardado). Resolve com true/false.
  J.entrar = function (codigo) {
    var c = soCodigo(codigo || '');
    if (!codigoValido(c)) { mensagem('O código do servidor tem 4 letras ou números.'); return Promise.resolve(false); }
    if (c === S.servidor && S.ligado) return Promise.resolve(true);
    if (typeof fetch !== 'function') return Promise.resolve(false);
    return pedir(CHAVE_SERVIDOR + '?codigo=' + encodeURIComponent(c), { cache: 'no-store' }).then(function (r) {
      if (r.status === 404) { mensagem('Esse servidor não está aberto. Confira o código com quem convidou você.'); return false; }
      if (!r.ok || !r.dados || !r.dados.servidor) { mensagem('Não deu para falar com o reino agora. Tente de novo.'); return false; }
      adotar(r.dados.servidor);
      return true;
    }, function () { mensagem('Não deu para falar com o reino agora. Tente de novo.'); return false; });
  };
  // cria um servidor novo (o código vem do reino) e entra nele
  J.criar = function () {
    var login = meuLogin();
    if (!login || typeof fetch !== 'function') return Promise.resolve(false);
    var perfil = { nome: login };
    try { if (R.Jogadores && R.Jogadores.perfil) perfil = R.Jogadores.perfil(); } catch (e) { /* fica o login */ }
    return pedir(CHAVE_SERVIDOR, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'criar', login: login, nome: perfil.nome }) }).then(function (r) {
      if (!r.ok || !r.dados || !r.dados.servidor) { mensagem('Não deu para criar o servidor agora. Tente de novo.'); return false; }
      adotar(r.dados.servidor);
      return true;
    }, function () { mensagem('Não deu para criar o servidor agora. Tente de novo.'); return false; });
  };
  // sai do servidor: o progresso fica, a presença sai na hora
  J.sair = function () {
    if (!S.servidor) return Promise.resolve();
    sairDaPagina();
    limparLink();
    S.servidor = ''; S.dono = ''; S.nomeServidor = ''; S.aviso = '';
    guardar('');
    S.jogadores = []; S.total = 0; S.assinatura = '';
    U.emit(EV.JUNTOS, { total: 0, sala: salaAtual(), jogadores: [], servidor: null, aviso: '' });
    return Promise.resolve();
  };
  // só o dono fecha o servidor: os outros saem (o próximo POST deles recebe 404)
  J.fechar = function () {
    if (!S.servidor) return Promise.resolve(false);
    var login = meuLogin(), codigo = S.servidor;
    if (!login || typeof fetch !== 'function') return Promise.resolve(false);
    return pedir(CHAVE_SERVIDOR, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'fechar', login: login, codigo: codigo }) }).then(function (r) {
      if (!r.ok) { mensagem('Só quem criou o servidor pode fechá-lo.'); return false; }
      return J.sair().then(function () { return true; });
    }, function () { mensagem('Não deu para fechar o servidor agora. Tente de novo.'); return false; });
  };

  /* ---------- API ---------- */
  J.iniciar = function () {
    if (S.tentou) return;
    S.tentou = true;
    if (!(R.config && R.config.juntos && R.config.juntos.ligado !== false)) return;
    if (R.congelado) return;                                        // modo determinístico dos testes: nada
    if (R.ambiente.artifact() || !(R.ambiente.http() || R.ambiente.https())) return;   // file:, artifact
    if (!meuLogin()) return;
    S.pode = true;
    U.on(EV.CENA, function () { if (S.ligado) enviar(); });         // trocou de sala: conta já
    U.on(EV.PERFIL, function () { if (S.ligado) enviar(); });       // nome novo: conta já
    if (typeof window !== 'undefined') {
      window.addEventListener('online', function () { if (S.pode) { S.erro = 0; if (S.ligado) enviar(); else if (S.servidor) iniciarPresenca(); } });
      window.addEventListener('offline', function () { clearTimeout(S.timer); });
      window.addEventListener('pagehide', function (e) { if (!e || !e.persisted) sairDaPagina(); });
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', function () { if (!document.hidden && S.ligado) { S.erro = 0; enviar(); } });
    }
    // convite (?servidor=XXXX) na frente do servidor guardado deste aparelho
    var convite = doLink(), lembrado = guardado();
    if (convite) J.entrar(convite);
    else if (lembrado) J.entrar(lembrado);
  };
  J.parar = function () { desligar(); S.servidor = ''; S.dono = ''; S.nomeServidor = ''; guardar(''); };
  J.pode = function () { return S.pode; };
  J.ligado = function () { return S.ligado; };
  J.servidor = function () { return S.servidor ? { codigo: S.servidor, dono: S.dono, nome: S.nomeServidor } : null; };
  J.dono = function () { return !!S.servidor && S.dono === meuLogin(); };
  J.aviso = function () { return S.aviso; };
  J.limparAviso = function () { S.aviso = ''; };
  // a cada quadro (camada): a posição desenhada persegue a que chegou, e o passo conta a distância andada
  J.atualizar = function (t) {
    var dt = S.t ? Math.min(0.1, (t - S.t) / 1000) : 0;
    S.t = t;
    var k = dt > 0 ? 1 - Math.exp(-dt * cfg('suavidade', 8)) : 0;
    for (var i = 0; i < S.jogadores.length; i++) {
      var j = S.jogadores[i], d = Math.hypot(j.x - j.dx, j.y - j.dy);
      if (d > 400) { j.dx = j.x; j.dy = j.y; j.andando = false; continue; }   // salto enorme (teleporte): aparece no lugar
      var ax = j.dx, ay = j.dy;
      j.dx += (j.x - j.dx) * k; j.dy += (j.y - j.dy) * k;
      var andou = Math.hypot(j.dx - ax, j.dy - ay);
      j.andando = d > 0.4;
      if (andou < 8) j.dist += andou;   // o passo anda com o desenho, não com o envio
    }
  };
  J.todos = function () { return S.jogadores.slice(); };
  // quem está na MINHA sala (é o que se desenha)
  J.outros = function () {
    var sala = salaAtual();
    return S.jogadores.filter(function (j) { return j.sala === sala; });
  };
  J.total = function () { return S.total; };
  J.salaAtual = salaAtual;
  J.nomeDaSala = function (id) {
    if (!id || id === 'mapa') return 'Reino';
    try { var d = R.Interiores && R.Interiores.def ? R.Interiores.def(id) : null; if (d && d.nome) return d.nome; } catch (e) { /* sem interiores */ }
    return 'Um lugar do reino';
  };
  J.acenar = function () { J.pendente({ aceno: true }); };
  J.recado = function (chave) { if (typeof chave === 'string' && chave) J.pendente({ recado: chave }); };
  J.pendente = function (novo) {
    if (!S.ligado) return false;
    S.pendente = Object.assign({}, S.pendente || {}, novo);
    enviar();   // sai já, sem esperar o relógio
    return true;
  };
  J.codigoDoLink = doLink;
  J.depurar = function () {
    return { pode: S.pode, ligado: S.ligado, servidor: S.servidor, dono: S.dono, aviso: S.aviso,
      sala: salaAtual(), total: S.total, enviando: S.enviando, erro: S.erro, pendente: S.pendente,
      jogadores: S.jogadores.map(function (j) { return { login: j.login, nome: j.nome, sala: j.sala, x: j.x, y: j.y }; }) };
  };

  // o módulo: o gancho iniciar liga a presença; a camada desenha os outros (sistemas/juntos-desenho.js)
  if (R.registrarModulo) R.registrarModulo({
    id: 'juntos',
    iniciar: function () { J.iniciar(); },
    camada: {
      ativo: function () { return !!(S.ligado && R.JuntosDesenho && J.outros().length); },
      itensDesenho: function (p, t, animar) { J.atualizar(t); return R.JuntosDesenho ? R.JuntosDesenho.itensDesenho(p, t, animar) : []; },
    },
    depurar: J.depurar,
  });
})();
