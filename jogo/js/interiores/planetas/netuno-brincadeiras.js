/* Planeta Netuno, as brincadeiras: a ação `netuno-brincadeira` (NPCs e objetos de Netuno), com `b` =
   'catavento' (gira forte), 'geiser' (`i`: o gêiser espirra gelo), 'tubos' (os tubos de ensaio mudam de cor),
   'cristal' (`n`: um dos 5 cristais azuis), 'reliquia' (`r`: uma coisa antiga do Memo conta como era) e
   'curiosidade' (Vovó Ventania: faz dela uma amiga, §6.2). Contrato: docs/contratos/viagem.md §5.
   Só diversão, na memória da sessão (nada no save): o estado fica em Reino._predios.planetas.netuno, que os
   desenhos de netuno-objetos.js leem. Sem Animações: nada se mexe, mas tudo funciona (é estado). */
(function () {
  var R = window.Reino;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var CRISTAIS = 5, VOVO_ID = 'netuno-vovo';

  // estado da sessão: cristais pegos, gêiseres que espirraram, giros do cata-vento, cor dos tubos
  var S = P.netuno = { pegos: {}, jatos: {}, giros: 0, cor: 0 };
  S.cristalPego = function (n) { return !!S.pegos[n]; };
  S.espirrou = function (i) { return !!S.jatos[i]; };
  function zerar() { S.pegos = {}; S.jatos = {}; S.giros = 0; S.cor = 0; }
  if (R.util && R.util.on && R.EVENTOS) R.util.on(R.EVENTOS.CENA, function (m) { if (m && m.para === 'planeta-netuno') zerar(); });

  function falas() {
    var f = R.FALAS_INTERIORES && R.FALAS_INTERIORES.observatorio;
    return (f && f.netuno) || null;
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
  // quem fala: o ET (retrato e nome dele, se já está em Netuno) ou o objeto tocado
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
      return { nome: o.nome || 'Netuno', retrato: retrato, voz: voz };
    }
    return { nome: nomePadrao || 'Netuno', retrato: null, voz: voz };
  }
  function som(nome) { if (R.Som && R.Som.tocar) { try { R.Som.tocar(nome || 'selecionar'); } catch (e) {} } }
  function repetindo(uma) { return function r() { return uma().then(function (v) { return v === 'outra' ? r() : v; }); }; }

  /* ---------- as brincadeiras ---------- */
  function catavento(acao, ctx, F) {
    return repetindo(function () { S.giros++; som(); return falarPaginas(F.catavento, quem(ctx, F.VOZES.NARRA), DE_NOVO); })();
  }
  function geiser(acao, ctx, F) {
    S.jatos[acao.i || 0] = true;
    som();
    return falarPaginas(F.geiser, quem(ctx, F.VOZES.NARRA), OK);
  }
  function tubos(acao, ctx, F) {
    var T = F.tubos;
    return repetindo(function () {
      var k = S.cor % T.cores.length;
      S.cor++;
      som();
      return falarPaginas([T.cores[k], T.fim], quem(ctx, F.VOZES.NARRA), DE_NOVO);
    })();
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
  function reliquia(acao, ctx, F) {
    var pags = F.reliquias[acao.r];
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
    var e = R.util.sortear(livres, 'netuno-curiosidade-' + Object.keys(vistas).length);
    vistas[e.id] = true; ultima = e.id;
    return e;
  }
  function curiosidade(acao, ctx, F) {
    // ouvir a curiosidade com a Vovó Ventania faz dela uma amiga (§6.2)
    if (ctx.npc && ctx.npc.id === VOVO_ID && R.Viagem && R.Viagem.fazerAmigo) R.Viagem.fazerAmigo(VOVO_ID);
    var q = quem(ctx, F.VOZES.VOVO, VOVO_ID, 'Vovó Ventania');
    return repetindo(function () { som(); return falarPaginas(sortearCuriosidade(F).paginas, q, OUTRA); })();
  }

  var B = { catavento: catavento, geiser: geiser, tubos: tubos, cristal: cristal, reliquia: reliquia, curiosidade: curiosidade };
  R.NPCs.registrarAcao('netuno-brincadeira', function (acao, ctx) {
    var F = falas(), fn = B[acao && acao.b];
    if (!F || !fn) return Promise.resolve(null);
    return fn(acao, ctx || {}, F);
  });
})();
