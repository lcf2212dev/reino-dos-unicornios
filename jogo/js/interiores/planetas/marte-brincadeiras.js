/* Planeta Marte, as brincadeiras: a ação `marte-brincadeira` (NPCs e objetos de Marte), com `b` =
   'faisca' (o Faísca chama para rolar na duna: Jogador.pular), 'duna' (o tobogã de areia), 'jipe' (o jipe-robô anda
   e volta), 'redemoinho' (gira mais alto), 'pedrinha' (`n`: uma das 5 pedrinhas coloridas) e 'curiosidade'
   (Vovô Vulcão e a antena). Contrato: docs/contratos/viagem.md §5.
   Só diversão, na memória da sessão (nada no save): o estado fica em Reino._predios.planetas.marte, que os
   desenhos de marte-objetos.js leem. Sem Animações: nada se mexe, mas tudo funciona (as pedrinhas são estado). */
(function () {
  var R = window.Reino;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var PEDRINHAS = 5, DURACAO = { jipe: 3600, redemoinho: 3000 };

  // estado da sessão: pedrinhas pegas e animações ativas
  var M = P.marte = { pegas: {}, ativas: {} };
  M.pedrinhaPega = function (n) { return !!M.pegas[n]; };
  // progresso de 0 a 1 enquanto roda; null parada (ou sem animação)
  M.progresso = function (nome, t) {
    var e = M.ativas[nome];
    if (!e || !t) return null;
    if (e.inicio === null) e.inicio = t;
    var f = (t - e.inicio) / DURACAO[nome];
    if (f >= 1 || f < 0) { delete M.ativas[nome]; return null; }
    return f;
  };
  function ativar(nome) { if (P.animando && P.animando()) M.ativas[nome] = { inicio: null }; }
  function zerarPedrinhas() { M.pegas = {}; }
  // cada visita da sessão: as pedrinhas voltam para a areia
  if (R.util && R.util.on && R.EVENTOS) R.util.on(R.EVENTOS.CENA, function (m) { if (m && m.para === 'planeta-marte') zerarPedrinhas(); });

  function falas() {
    var f = R.FALAS_INTERIORES && R.FALAS_INTERIORES.observatorio;
    return (f && f.marte) || null;
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
  // quem fala: o ET (retrato e nome dele, se já está em Marte) ou o objeto tocado
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
      return { nome: o.nome || 'Marte', retrato: retrato, voz: voz };
    }
    return { nome: nomePadrao || 'Marte', retrato: null, voz: voz };
  }
  function som(nome) { if (R.Som && R.Som.tocar) { try { R.Som.tocar(nome || 'selecionar'); } catch (e) {} } }
  function pular() {
    var J = window.Jogador;
    if (J && typeof J.pular === 'function') { try { J.pular(); } catch (e) {} }
  }
  function repetindo(uma) { return function r() { return uma().then(function (v) { return v === 'outra' ? r() : v; }); }; }

  /* ---------- as brincadeiras ---------- */
  function faisca(acao, ctx, F) {
    var q = quem(ctx, F.VOZES.FAISCA, 'marte-faisca', 'Faísca');
    return repetindo(function () { pular(); som(); return falarPaginas(F.duna.faisca, q, DE_NOVO); })();
  }
  function duna(acao, ctx, F) {
    return repetindo(function () { pular(); som(); return falarPaginas(F.duna.duna, quem(ctx, F.VOZES.NARRA), DE_NOVO); })();
  }
  function animado(nome) {
    return function (acao, ctx, F) {
      return repetindo(function () { ativar(nome); som(); return falarPaginas(F[nome], quem(ctx, F.VOZES.NARRA), DE_NOVO); })();
    };
  }
  function pedrinha(acao, ctx, F) {
    var n = acao.n || 0, C = F.pedrinhas, q = quem(ctx, F.VOZES.NARRA);
    if (M.pegas[n]) return falarPaginas(C.ja, q, OK);
    M.pegas[n] = true;
    var faltam = PEDRINHAS - Object.keys(M.pegas).length;
    som(faltam ? 'selecionar' : 'acerto');
    if (faltam > 0) return falarPaginas([C.pegou, C.faltam[faltam]], q, OK);
    return falarPaginas(C.todas, q, OK).then(function (v) { zerarPedrinhas(); return v; });
  }
  // curiosidades sorteadas sem repetir na sessão
  var vistas = {}, ultima = null;
  function sortearCuriosidade(F) {
    var lista = F.curiosidades, livres = lista.filter(function (c) { return !vistas[c.id]; });
    if (!livres.length) {
      vistas = {};
      livres = lista.filter(function (c) { return c.id !== ultima; });
    }
    var e = R.util.sortear(livres, 'marte-curiosidade-' + Object.keys(vistas).length);
    vistas[e.id] = true; ultima = e.id;
    return e;
  }
  function curiosidade(acao, ctx, F) {
    var q = quem(ctx, F.VOZES.VOVO, 'marte-vovo', 'Vovô Vulcão');
    return repetindo(function () { som(); return falarPaginas(sortearCuriosidade(F).paginas, q, OUTRA); })();
  }

  var B = { faisca: faisca, duna: duna, jipe: animado('jipe'), redemoinho: animado('redemoinho'), pedrinha: pedrinha, curiosidade: curiosidade };
  R.NPCs.registrarAcao('marte-brincadeira', function (acao, ctx) {
    var F = falas(), fn = B[acao && acao.b];
    if (!F || !fn) return Promise.resolve(null);
    // brincar com um ET faz dele um amigo (viagem.md §6.2)
    if (ctx && ctx.npc && R.Viagem && R.Viagem.fazerAmigo) R.Viagem.fazerAmigo(ctx.npc.id);
    return fn(acao, ctx || {}, F);
  });
})();
