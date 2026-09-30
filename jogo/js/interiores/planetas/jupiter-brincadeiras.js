/* Planeta Júpiter, as brincadeiras: a ação `jupiter-brincadeira` (NPCs e objetos de Júpiter), com `b` =
   'bolha' (pular de nuvem em nuvem com o Bolha: Jogador.pular), 'trampolim' (a nuvem-trampolim), 'redemoinho'
   (o redemoinho gira), 'cristal' (`n`: um dos 5 cristais de amônia), 'letra' (`l`: a letra ensina uma palavra) e
   'curiosidade' (Vovô Tempestade e a luneta). Contrato: docs/contratos/viagem.md §5; ação de ET faz amizade (§6.2).
   Só diversão, na memória da sessão (nada no save): o estado fica em Reino._predios.planetas.jupiter, que os
   desenhos de jupiter-objetos.js leem. Sem Animações: nada se mexe, mas tudo funciona (cristais e letras são estado). */
(function () {
  var R = window.Reino;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var CRISTAIS = 5;

  // estado da sessão: cristais pegos, letras lidas e o redemoinho girando
  var S = P.jupiter = { pegos: {}, lidas: {}, giro: 0 };
  S.cristalPego = function (n) { return !!S.pegos[n]; };
  S.letraLida = function (l) { return !!S.lidas[l]; };
  function zerar() { S.pegos = {}; S.lidas = {}; S.giro = 0; }
  // cada visita da sessão: os cristais voltam a brilhar
  if (R.util && R.util.on && R.EVENTOS) R.util.on(R.EVENTOS.CENA, function (m) { if (m && m.para === 'planeta-jupiter') zerar(); });

  function falas() {
    var f = R.FALAS_INTERIORES && R.FALAS_INTERIORES.observatorio;
    return (f && f.jupiter) || null;
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
  // quem fala: o ET (retrato e nome dele, se já está em Júpiter) ou o objeto tocado
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
      return { nome: o.nome || 'Júpiter', retrato: retrato, voz: voz };
    }
    return { nome: nomePadrao || 'Júpiter', retrato: null, voz: voz };
  }
  // brincar com um ET faz dele um amigo (álbum de ETs, §6.2), só quando é o ET que foi tocado
  function amigo(ctx, npcId) {
    if (ctx && ctx.objeto && !ctx.npc) return;
    var V = R.Viagem;
    if (V && typeof V.fazerAmigo === 'function') { try { V.fazerAmigo(npcId); } catch (e) {} }
  }
  function som(nome) { if (R.Som && R.Som.tocar) { try { R.Som.tocar(nome || 'selecionar'); } catch (e) {} } }
  // pular de nuvem: um pulo alto e fofo (sem Animações não pula, e a fala segue igual)
  function pular(altura) {
    var J = window.Jogador;
    if (J && typeof J.pular === 'function') { try { J.pular({ altura: altura, ms: 650 }); } catch (e) {} }
  }
  function repetindo(uma) { return function r() { return uma().then(function (v) { return v === 'outra' ? r() : v; }); }; }

  /* ---------- as brincadeiras ---------- */
  function bolha(acao, ctx, F) {
    amigo(ctx, 'jupiter-bolha');
    var q = quem(ctx, F.VOZES.BOLHA, 'jupiter-bolha', 'Bolha');
    return repetindo(function () { pular(26); som(); return falarPaginas(F.pulo.bolha, q, DE_NOVO); })();
  }
  function trampolim(acao, ctx, F) {
    return repetindo(function () { pular(34); som(); return falarPaginas(F.pulo.trampolim, quem(ctx, F.VOZES.NARRA), DE_NOVO); })();
  }
  function redemoinho(acao, ctx, F) {
    S.giro++;
    som();
    return falarPaginas(F.redemoinho, quem(ctx, F.VOZES.NARRA), OK);
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
  function letra(acao, ctx, F) {
    var pags = F.letras[acao.l];
    if (!pags) return Promise.resolve(null);
    S.lidas[acao.l] = true;
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
    var e = R.util.sortear(livres, 'jupiter-curiosidade-' + Object.keys(vistas).length);
    vistas[e.id] = true; ultima = e.id;
    return e;
  }
  function curiosidade(acao, ctx, F) {
    amigo(ctx, 'jupiter-vovo');
    var q = quem(ctx, F.VOZES.VOVO, 'jupiter-vovo', 'Vovô Tempestade');
    return repetindo(function () { som(); return falarPaginas(sortearCuriosidade(F).paginas, q, OUTRA); })();
  }

  var B = { bolha: bolha, trampolim: trampolim, redemoinho: redemoinho, cristal: cristal, letra: letra, curiosidade: curiosidade };
  R.NPCs.registrarAcao('jupiter-brincadeira', function (acao, ctx) {
    var F = falas(), fn = B[acao && acao.b];
    if (!F || !fn) return Promise.resolve(null);
    return fn(acao, ctx || {}, F);
  });
})();
