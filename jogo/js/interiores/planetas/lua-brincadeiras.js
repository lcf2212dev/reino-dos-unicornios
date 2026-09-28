/* Planeta Lua, as brincadeiras: a ação `lua-brincadeira` (NPCs e objetos da Lua), com `b` =
   'pulo' (Lumi e a cratera pula-pula: Jogador.pular), 'flutua' (a pedra que sobe e desce), 'esconde' (o Pipo
   começa), 'pedra' (`i`: uma das pedras grandes onde o Tico se esconde), 'cristal' (`n`: um dos 5 cristais) e
   'curiosidade' (Vovó Cratera, telescópio, módulo lunar). Contrato: docs/contratos/viagem.md §5.
   Só diversão, na memória da sessão (nada no save): o estado fica em Reino._predios.planetas.lua, que os
   desenhos de lua-objetos.js leem. Sem Animações: nada se mexe, mas tudo funciona (o Tico e os cristais são estado). */
(function () {
  var R = window.Reino;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var CRISTAIS = 5, PEDRAS = 3, DURACAO = { flutua: 4200 };

  // estado da sessão: cristais pegos, esconde-esconde e animações ativas
  var L = P.lua = { pegos: {}, esconde: { ativo: false, alvo: -1, achou: -1, rodada: 0 }, ativas: {} };
  L.cristalPego = function (n) { return !!L.pegos[n]; };
  L.ticoEm = function (i) { return L.esconde.achou === i; };
  // progresso de 0 a 1 enquanto roda; null parada (ou sem animação)
  L.progresso = function (nome, t) {
    var e = L.ativas[nome];
    if (!e || !t) return null;
    if (e.inicio === null) e.inicio = t;
    var f = (t - e.inicio) / DURACAO[nome];
    if (f >= 1 || f < 0) { delete L.ativas[nome]; return null; }
    return f;
  };
  function ativar(nome) { if (P.animando && P.animando()) L.ativas[nome] = { inicio: null }; }
  function zerarCristais() { L.pegos = {}; }
  // cada visita da sessão: os cristais voltam a brilhar
  if (R.util && R.util.on && R.EVENTOS) R.util.on(R.EVENTOS.CENA, function (m) { if (m && m.para === 'planeta-lua') zerarCristais(); });

  function falas() {
    var f = R.FALAS_INTERIORES && R.FALAS_INTERIORES.observatorio;
    return (f && f.lua) || null;
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
  // quem fala: o ET (retrato e nome dele, se já está na Lua) ou o objeto tocado
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
      return { nome: o.nome || 'Lua', retrato: retrato, voz: voz };
    }
    return { nome: nomePadrao || 'Lua', retrato: null, voz: voz };
  }
  function som(nome) { if (R.Som && R.Som.tocar) { try { R.Som.tocar(nome || 'selecionar'); } catch (e) {} } }
  function pular() {
    var J = window.Jogador;
    if (J && typeof J.pular === 'function') { try { J.pular(); } catch (e) {} }
  }
  function repetindo(uma) { return function r() { return uma().then(function (v) { return v === 'outra' ? r() : v; }); }; }

  /* ---------- as brincadeiras ---------- */
  function pulo(acao, ctx, F) {
    var lumi = ctx && ctx.npc && ctx.npc.id === 'lua-lumi';
    var V = F.VOZES, q = lumi ? quem(ctx, V.LUMI, 'lua-lumi', 'Lumi') : quem(ctx, V.NARRA);
    return repetindo(function () { pular(); som(); return falarPaginas(lumi ? F.pulo.lumi : F.pulo.cratera, q, DE_NOVO); })();
  }
  function flutua(acao, ctx, F) {
    return repetindo(function () { ativar('flutua'); som(); return falarPaginas(F.flutua, quem(ctx, F.VOZES.NARRA), DE_NOVO); })();
  }
  function novaRodada() {
    var E = L.esconde, ant = E.alvo, livres = [];
    for (var i = 0; i < PEDRAS; i++) if (i !== ant) livres.push(i);
    E.rodada++;
    E.alvo = R.util.sortear(livres, 'lua-esconde-' + E.rodada);
    E.ativo = true; E.achou = -1;
  }
  function esconde(acao, ctx, F) {
    var E = L.esconde, q = quem(ctx, F.VOZES.PIPO, 'lua-pipo', 'Pipo');
    if (E.ativo) return falarPaginas(F.esconde.procurando, q, OK);
    var denovo = E.achou >= 0;
    novaRodada(); som();
    return falarPaginas(denovo ? F.esconde.denovo : F.esconde.comeco, q, OK);
  }
  function pedra(acao, ctx, F) {
    var E = L.esconde, i = acao.i || 0;
    if (!E.ativo) return falarPaginas(F.esconde.pedra, quem(ctx, F.VOZES.NARRA), OK);
    var q = quem(ctx, F.VOZES.PIPO, 'lua-pipo', 'Pipo');
    if (i !== E.alvo) { som(); return falarPaginas(F.esconde.errou, q, OK); }
    E.ativo = false; E.achou = i;
    som('acerto');
    return falarPaginas(F.esconde.achou, q, DE_NOVO).then(function (v) {
      if (v !== 'outra') return v;
      novaRodada();
      return falarPaginas(F.esconde.denovo, q, OK);
    });
  }
  function cristal(acao, ctx, F) {
    var n = acao.n || 0, C = F.cristais, q = quem(ctx, F.VOZES.NARRA);
    if (L.pegos[n]) return falarPaginas(C.ja, q, OK);
    L.pegos[n] = true;
    var faltam = CRISTAIS - Object.keys(L.pegos).length;
    som(faltam ? 'selecionar' : 'acerto');
    if (faltam > 0) return falarPaginas([C.pegou, C.faltam[faltam]], q, OK);
    return falarPaginas(C.todos, q, OK).then(function (v) { zerarCristais(); return v; });
  }
  // curiosidades sorteadas sem repetir na sessão
  var vistas = {}, ultima = null;
  function sortearCuriosidade(F) {
    var lista = F.curiosidades, livres = lista.filter(function (c) { return !vistas[c.id]; });
    if (!livres.length) {
      vistas = {};
      livres = lista.filter(function (c) { return c.id !== ultima; });
    }
    var e = R.util.sortear(livres, 'lua-curiosidade-' + Object.keys(vistas).length);
    vistas[e.id] = true; ultima = e.id;
    return e;
  }
  function curiosidade(acao, ctx, F) {
    var q = quem(ctx, F.VOZES.VOVO, 'lua-vovo', 'Vovó Cratera');
    return repetindo(function () { som(); return falarPaginas(sortearCuriosidade(F).paginas, q, OUTRA); })();
  }

  var B = { pulo: pulo, flutua: flutua, esconde: esconde, pedra: pedra, cristal: cristal, curiosidade: curiosidade };
  R.NPCs.registrarAcao('lua-brincadeira', function (acao, ctx) {
    var F = falas(), fn = B[acao && acao.b];
    if (!F || !fn) return Promise.resolve(null);
    // brincar com um ET faz dele um amigo (viagem.md §6.2)
    if (ctx && ctx.npc && R.Viagem && R.Viagem.fazerAmigo) R.Viagem.fazerAmigo(ctx.npc.id);
    return fn(acao, ctx || {}, F);
  });
})();
