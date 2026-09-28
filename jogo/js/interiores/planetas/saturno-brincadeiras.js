/* Planeta Saturno, as brincadeiras: a ação `saturno-brincadeira` (NPCs e objetos de Saturno), com `b` =
   'nico' (patinar com o Nico: Jogador.pular), 'pista' (a pista de patinação), 'boneco' (`i`: o boneco de gelo acena),
   'cristal' (`n`: um dos 5 cristais de gelo), 'palavra' (`p`: a placa ensina uma palavra em inglês) e 'curiosidade'
   (Vovó Anel e o telescópio). Contrato: docs/contratos/viagem.md §5.
   Só diversão, na memória da sessão (nada no save): o estado fica em Reino._predios.planetas.saturno, que os
   desenhos de saturno-objetos.js leem. Sem Animações: nada se mexe, mas tudo funciona (bonecos e cristais são estado). */
(function () {
  var R = window.Reino;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var CRISTAIS = 5;

  // estado da sessão: cristais pegos e bonecos que acenaram
  var S = P.saturno = { pegos: {}, acenos: {} };
  S.cristalPego = function (n) { return !!S.pegos[n]; };
  S.acenando = function (i) { return !!S.acenos[i]; };
  function zerar() { S.pegos = {}; S.acenos = {}; }
  // cada visita da sessão: os cristais voltam a brilhar e os bonecos abaixam o braço
  if (R.util && R.util.on && R.EVENTOS) R.util.on(R.EVENTOS.CENA, function (m) { if (m && m.para === 'planeta-saturno') zerar(); });

  function falas() {
    var f = R.FALAS_INTERIORES && R.FALAS_INTERIORES.observatorio;
    return (f && f.saturno) || null;
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
  // quem fala: o ET (retrato e nome dele, se já está em Saturno) ou o objeto tocado
  function quem(ctx, voz, npcId, nomePadrao) {
    var retrato = null, n = null;
    if (npcId) n = ((ctx && ctx.interior && ctx.interior.npcs) || []).find(function (x) { return x.id === npcId; });
    if (!n && ctx && ctx.npc && ctx.npc.id === npcId) n = ctx.npc;
    if (n) {
      try { if (R.NPCs && R.NPCs.retrato) retrato = [R.NPCs.retrato(n, 0), R.NPCs.retrato(n, 1)]; } catch (e) { retrato = null; }
      return { nome: n.nome || nomePadrao, retrato: retrato, voz: voz };
    }
    var o = ctx && ctx.objeto, OI = R.ObservatorioInterior;
    if (o && !npcId) {
      try { retrato = OI && OI.retratoDe ? OI.retratoDe(o) : null; } catch (e) { retrato = null; }
      return { nome: o.nome || 'Saturno', retrato: retrato, voz: voz };
    }
    return { nome: nomePadrao || 'Saturno', retrato: null, voz: voz };
  }
  function som(nome) { if (R.Som && R.Som.tocar) { try { R.Som.tocar(nome || 'selecionar'); } catch (e) {} } }
  // patinar: um pulinho baixo e comprido (sem Animações não pula, e a fala segue igual)
  function patinar() {
    var J = window.Jogador;
    if (J && typeof J.pular === 'function') { try { J.pular({ altura: 14, ms: 700 }); } catch (e) {} }
  }
  function repetindo(uma) { return function r() { return uma().then(function (v) { return v === 'outra' ? r() : v; }); }; }

  /* ---------- as brincadeiras ---------- */
  function nico(acao, ctx, F) {
    var q = quem(ctx, F.VOZES.NICO, 'saturno-nico', 'Nico');
    return repetindo(function () { patinar(); som(); return falarPaginas(F.patina.nico, q, DE_NOVO); })();
  }
  function pista(acao, ctx, F) {
    return repetindo(function () { patinar(); som(); return falarPaginas(F.patina.pista, quem(ctx, F.VOZES.NARRA), DE_NOVO); })();
  }
  function boneco(acao, ctx, F) {
    S.acenos[acao.i || 0] = true;
    som();
    return falarPaginas(F.boneco, quem(ctx, F.VOZES.NARRA), OK);
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
  function palavra(acao, ctx, F) {
    var pags = F.palavras[acao.p];
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
    var e = R.util.sortear(livres, 'saturno-curiosidade-' + Object.keys(vistas).length);
    vistas[e.id] = true; ultima = e.id;
    return e;
  }
  function curiosidade(acao, ctx, F) {
    var q = quem(ctx, F.VOZES.VOVO, 'saturno-vovo', 'Vovó Anel');
    return repetindo(function () { som(); return falarPaginas(sortearCuriosidade(F).paginas, q, OUTRA); })();
  }

  var B = { nico: nico, pista: pista, boneco: boneco, cristal: cristal, palavra: palavra, curiosidade: curiosidade };
  R.NPCs.registrarAcao('saturno-brincadeira', function (acao, ctx) {
    var F = falas(), fn = B[acao && acao.b];
    if (!F || !fn) return Promise.resolve(null);
    // brincar com um ET faz dele um amigo (viagem.md §6.2)
    if (ctx && ctx.npc && R.Viagem && R.Viagem.fazerAmigo) R.Viagem.fazerAmigo(ctx.npc.id);
    return fn(acao, ctx || {}, F);
  });
})();
