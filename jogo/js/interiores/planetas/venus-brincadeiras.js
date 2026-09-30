/* Planeta Vênus, as brincadeiras: a ação `venus-brincadeira` (NPCs e objetos de Vênus), com `b` =
   'quentinho' (pular no vapor com o Quentinho: Jogador.pular), 'geiser' (o gêiser solta vapor), 'vulcao' (`i`: o
   vulcãozinho fumega), 'cristal' (`n`: um dos 5 cristais), 'rosa' (a rosa dos ventos acende a próxima ponta),
   'direcao' (`p`: a placa ensina um ponto cardeal) e 'curiosidade' (Vovó Nuvem e a luneta).
   Contrato: docs/contratos/viagem.md §5; ação de ET faz amizade (§6.2).
   Só diversão, na memória da sessão (nada no save): o estado fica em Reino._predios.planetas.venus, que os
   desenhos de venus-objetos.js leem. Sem Animações: nada se mexe, mas tudo funciona (vapor e cristais são estado). */
(function () {
  var R = window.Reino;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var CRISTAIS = 5;

  // estado da sessão: cristais pegos, vulcões fumegando, gêiser jorrando e a ponta acesa da rosa
  var S = P.venus = { pegos: {}, fumaca: {}, jorro: false, ponta: null, pontas: {} };
  S.cristalPego = function (n) { return !!S.pegos[n]; };
  S.fumegando = function (i) { return !!S.fumaca[i]; };
  S.jorrando = function () { return S.jorro; };
  function zerar() { S.pegos = {}; S.fumaca = {}; S.jorro = false; S.ponta = null; S.pontas = {}; }
  // cada visita da sessão: os cristais voltam e o vapor acalma
  if (R.util && R.util.on && R.EVENTOS) R.util.on(R.EVENTOS.CENA, function (m) { if (m && m.para === 'planeta-venus') zerar(); });

  function falas() {
    var f = R.FALAS_INTERIORES && R.FALAS_INTERIORES.observatorio;
    return (f && f.venus) || null;
  }
  var CONTINUAR = { texto: 'Continuar →', valor: 'mais', principal: true };
  var OK = [{ texto: 'Ok! 👍', valor: 'ok', principal: true }];
  var DE_NOVO = [{ texto: 'De novo! ✨', valor: 'outra', principal: true }, { texto: 'Tchau! 💛', valor: 'tchau' }];
  var OUTRA = [{ texto: 'Outra curiosidade! ✨', valor: 'outra', principal: true }, { texto: 'Tchau! 💛', valor: 'tchau' }];
  function falarPaginas(pags, q, botoesFim) {
    var Cl = R.Claude, i = 0;
    if (!Cl || !Cl.falar || !pags || !pags.length) return Promise.resolve(null);
    function prox(val) {
      if (val === null || val === undefined || val === 'tchau') return val === undefined ? null : val;
      var pg = pags[i], ultima = i >= pags.length - 1;
      i++;
      var r = Cl.falar(pg, { quem: q, modal: true, voz: q.voz, fala: [pg], botoes: ultima ? botoesFim : [CONTINUAR] });
      return ultima ? r : r.then(prox);
    }
    return prox('ok');
  }
  // quem fala: o ET (retrato e nome dele, se já está em Vênus) ou o objeto tocado
  function quem(ctx, voz, npcId, nomePadrao) {
    var retrato = null, n = null;
    if (npcId) n = ((ctx && ctx.interior && ctx.interior.npcs) || []).find(function (x) { return x.id === npcId; });
    if (!n && ctx && ctx.npc && ctx.npc.id === npcId) n = ctx.npc;
    if (n) {
      try { if (R.NPCs && R.NPCs.retrato) retrato = [R.NPCs.retrato(n, 0), R.NPCs.retrato(n, 1), R.NPCs.retrato(n, 2)]; } catch (e) { retrato = null; }
      return { nome: n.nome || nomePadrao, retrato: retrato, voz: voz };
    }
    var o = ctx && ctx.objeto, OI = R.ObservatorioInterior;
    if (o && !npcId) {
      try { retrato = OI && OI.retratoDe ? OI.retratoDe(o) : null; } catch (e) { retrato = null; }
      return { nome: o.nome || 'Vênus', retrato: retrato, voz: voz };
    }
    return { nome: nomePadrao || 'Vênus', retrato: null, voz: voz };
  }
  function som(nome) { if (R.Som && R.Som.tocar) { try { R.Som.tocar(nome || 'selecionar'); } catch (e) {} } }
  // o ET que brincou vira amigo (§6.2); só quando foi o próprio ET (não a luneta)
  function amizade(ctx) {
    var V = R.Viagem, id = ctx && ctx.npc && ctx.npc.id;
    if (id && V && typeof V.fazerAmigo === 'function') { try { V.fazerAmigo(id); } catch (e) {} }
  }
  // pulo alto no vapor (sem Animações não pula, e a fala segue igual)
  function pularNoVapor() {
    S.jorro = true;
    var J = window.Jogador;
    if (J && typeof J.pular === 'function') { try { J.pular({ altura: 24, ms: 700 }); } catch (e) {} }
  }
  function repetindo(uma) { return function r() { return uma().then(function (v) { return v === 'outra' ? r() : v; }); }; }

  /* ---------- as brincadeiras ---------- */
  function quentinho(acao, ctx, F) {
    amizade(ctx);
    var q = quem(ctx, F.VOZES.QUENTE, 'venus-quentinho', 'Quentinho');
    return repetindo(function () { pularNoVapor(); som(); return falarPaginas(F.quentinho, q, DE_NOVO); })();
  }
  function geiser(acao, ctx, F) {
    return repetindo(function () { S.jorro = true; som(); return falarPaginas(F.geiser, quem(ctx, F.VOZES.NARRA), DE_NOVO); })();
  }
  function vulcao(acao, ctx, F) {
    S.fumaca[acao.i || 0] = true;
    som();
    return falarPaginas(F.vulcao, quem(ctx, F.VOZES.NARRA), OK);
  }
  function cristal(acao, ctx, F) {
    var n = acao.n || 0, C = F.cristais, q = quem(ctx, F.VOZES.NARRA);
    if (S.pegos[n]) return falarPaginas(C.ja, q, OK);
    S.pegos[n] = true;
    var faltam = CRISTAIS - Object.keys(S.pegos).length;
    som(faltam ? 'selecionar' : 'acerto');
    if (faltam > 0) return falarPaginas([C.pegou, C.faltam[faltam]], q, OK);
    return falarPaginas(C.todos, q, OK).then(function (v) { S.pegos = {}; return v; });
  }
  // rosa dos ventos: cada toque acende a próxima ponta; nas quatro, a comemoração
  function rosa(acao, ctx, F) {
    var Ro = F.rosa, ord = Ro.ordem, q = quem(ctx, F.VOZES.NARRA);
    var k = ord[(ord.indexOf(S.ponta) + 1) % ord.length];
    S.ponta = k; S.pontas[k] = true;
    var achou = ord.every(function (x) { return S.pontas[x]; });
    som(achou ? 'acerto' : 'selecionar');
    if (!achou) return falarPaginas(Ro[k], q, OK);
    S.pontas = {};
    return falarPaginas(Ro[k].concat(Ro.todas), q, OK);
  }
  function direcao(acao, ctx, F) {
    var pags = F.direcoes[acao.p];
    if (!pags) return Promise.resolve(null);
    som();
    return falarPaginas(pags, quem(ctx, F.VOZES.NARRA), OK);
  }
  // curiosidades sorteadas sem repetir na sessão
  var vistas = {}, ultima = null;
  function sortearCuriosidade(F) {
    var lista = F.curiosidades, livres = lista.filter(function (c) { return !vistas[c.id]; });
    if (!livres.length) {
      vistas = {};
      livres = lista.filter(function (c) { return c.id !== ultima; });
    }
    var e = R.util.sortear(livres, 'venus-curiosidade-' + Object.keys(vistas).length);
    vistas[e.id] = true; ultima = e.id;
    return e;
  }
  function curiosidade(acao, ctx, F) {
    amizade(ctx);
    var q = quem(ctx, F.VOZES.VOVO, 'venus-vovo', 'Vovó Nuvem');
    return repetindo(function () { som(); return falarPaginas(sortearCuriosidade(F).paginas, q, OUTRA); })();
  }

  var B = { quentinho: quentinho, geiser: geiser, vulcao: vulcao, cristal: cristal, rosa: rosa, direcao: direcao, curiosidade: curiosidade };
  R.NPCs.registrarAcao('venus-brincadeira', function (acao, ctx) {
    var F = falas(), fn = B[acao && acao.b];
    if (!F || !fn) return Promise.resolve(null);
    return fn(acao, ctx || {}, F);
  });
})();
