/* Laboratório de Química, 2º andar: a ação `quimica-curiosidade` ({ tipo: 'quimica-curiosidade', tema }) do Professor
   Carbono e dos objetos do andar. Sorteia com Reino.Quimica.curiosidade(tema) e fala na voz do Professor Carbono
   (Reino.Quimica.VOZ_CARBONO), com "Outra curiosidade! ✨" e "Tchau! 💛" no fim; o balão mostra o retrato e o nome
   de quem conta (o objeto tocado ou o Professor Carbono). No jeito da do Observatório (observatorio/acoes.js).
   Contrato: docs/contratos/quimica.md §9. Só guarda funções: nada roda no carregamento. Nada de estrela nem save. */
(function () {
  var R = window.Reino;
  var T = 16;
  var RESERVA = 'A química está em todo lugar.';
  var CONTINUAR = { texto: 'Continuar →', valor: 'mais', principal: true };
  var FIM = [{ texto: 'Outra curiosidade! ✨', valor: 'outra', principal: true }, { texto: 'Tchau! 💛', valor: 'tchau' }];

  function voz() { return (R.Quimica && R.Quimica.VOZ_CARBONO) || 'npc-quimica-carbono'; }
  // a curiosidade do tema (tema sem nenhuma cai em todas); sem dados ou sem páginas, a frase de reserva
  function curiosidadeDe(tema) {
    var Q = R.Quimica;
    if (Q && Q.curiosidade) {
      try {
        var c = Q.curiosidade(tema);
        if ((!c || !c.paginas || !c.paginas.length) && tema !== 'todas') c = Q.curiosidade('todas');
        if (c && c.paginas && c.paginas.length) return c;
      } catch (e) { if (window.console) console.error(e); }
    }
    return { id: 'reserva', tema: tema, paginas: [RESERVA] };
  }
  // páginas no balão modal: "Continuar →" entre elas; a última com os botões do fim
  function falarPaginas(pags, quem) {
    var Cl = R.Claude, i = 0;
    if (!Cl || !Cl.falar) return Promise.resolve(null);
    function prox(v) {
      if (v === null || v === undefined || v === 'tchau') return v === undefined ? null : v;
      var pg = pags[i], ultima = i >= pags.length - 1;
      i++;
      var r = Cl.falar(pg, { quem: quem, modal: true, voz: quem.voz, fala: [pg], botoes: ultima ? FIM : [CONTINUAR] });
      return ultima ? r : r.then(prox);
    }
    return prox('ok');
  }
  // retrato de um objeto para o balão: o próprio desenho dele (guardado por tipo e posição)
  var retratos = {};
  function retratoDe(o) {
    var I = R.Interiores;
    if (!o || !I || !I.OBJETOS) return null;
    var k = o.tipo + ':' + o.x + ',' + o.y;
    if (retratos[k]) return retratos[k];
    var lib = I.OBJETOS[o.tipo];
    if (!lib || !lib.desenhar) return null;
    var w = (o.w || lib.w || 1) * T, h = (o.h || lib.h || 1) * T, topo = o.topo !== undefined ? o.topo : (lib.topo || 0);
    var c = document.createElement('canvas');
    c.width = w + 4; c.height = topo + h + 4;
    var cx = c.getContext('2d');
    cx.save(); cx.translate(2 - o.x * T, 2 + topo - o.y * T);
    lib.desenhar(cx, o.x * T, o.y * T, o, R.Progresso);
    if (lib.anim) lib.anim(cx, o.x * T, o.y * T, 0, o);
    cx.restore();
    retratos[k] = c;
    return c;
  }
  // o Professor Carbono do interior (nome e retrato do NPC)
  function quemCarbono(ctx) {
    var I = R.Interiores, N = R.NPCs, e = (N && N.ELENCO && N.ELENCO['quimica-carbono']) || {};
    var def = (ctx && ctx.interior) || (I && I.def && I.def('quimica-2')) || {};
    var n = (def.npcs || []).find(function (x) { return x.id === 'quimica-carbono'; }) || null;
    var retrato = null;
    try { if (n && N && N.retrato) retrato = [N.retrato(n, 0), N.retrato(n, 1)]; } catch (err) { retrato = null; }
    return { nome: (n && n.nome) || e.nome || 'Professor Carbono', retrato: retrato, voz: voz() };
  }
  // quem conta: o objeto tocado (com o desenho dele) ou o Professor Carbono
  function quemConta(ctx) {
    var o = ctx && ctx.objeto;
    if (!o) return quemCarbono(ctx);
    var retrato = null;
    try { retrato = retratoDe(o); } catch (e) { retrato = null; }
    return { nome: o.nome || 'Laboratório de Química', retrato: retrato, voz: voz() };
  }

  function contar(acao, ctx) {
    var tema = (acao && acao.tema) || 'todas', quem = quemConta(ctx);
    function uma() {
      var c = curiosidadeDe(tema);
      if (R.Som && R.Som.tocar) { try { R.Som.tocar('selecionar'); } catch (e) {} }
      return falarPaginas(c.paginas, quem).then(function (v) { return v === 'outra' ? uma() : v; });
    }
    return uma();
  }

  if (R.NPCs && R.NPCs.registrarAcao) R.NPCs.registrarAcao('quimica-curiosidade', contar);
})();
