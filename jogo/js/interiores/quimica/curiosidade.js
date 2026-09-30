/* Laboratório de Química, 2º andar: a ação `quimica-curiosidade` ({ tipo: 'quimica-curiosidade', tema }) do Professor
   Carbono e dos objetos do andar. Sorteia com Reino.Quimica.curiosidade(tema) e fala na voz do Professor Carbono
   (Reino.Quimica.VOZ_CARBONO), com "Outra curiosidade! ✨" e "Tchau! 💛" no fim. Contrato: docs/contratos/quimica.md §9.
   Só guarda funções: nada roda no carregamento.
   (Versão mínima do contrato: a frente das curiosidades completa — retrato do objeto no balão, reserva sem dados.) */
(function () {
  var R = window.Reino;
  var CONTINUAR = { texto: 'Continuar →', valor: 'ok', principal: true };
  var FIM = [{ texto: 'Outra curiosidade! ✨', valor: 'outra', principal: true }, { texto: 'Tchau! 💛', valor: 'tchau' }];

  // páginas no balão modal: "Continuar →" entre elas; a última com os botões do fim
  function falarPaginas(pags, quem, voz) {
    var Cl = R.Claude, i = 0;
    if (!Cl || !Cl.falar) return Promise.resolve(null);
    function prox(v) {
      if (v === null || v === undefined || v === 'tchau') return v === undefined ? null : v;
      var pg = pags[i], ultima = i >= pags.length - 1;
      i++;
      var r = Cl.falar(pg, { quem: quem, modal: true, voz: voz, fala: [pg], botoes: ultima ? FIM : [CONTINUAR] });
      return ultima ? r : r.then(prox);
    }
    return prox('ok');
  }

  function contar(acao, ctx) {
    var Q = R.Quimica, tema = (acao && acao.tema) || 'todas';
    var o = ctx && ctx.objeto, nome = (o && o.nome) || 'Professor Carbono';
    function uma() {
      var c = Q && Q.curiosidade ? Q.curiosidade(tema) : null;
      if (!c) return Promise.resolve(null);
      return falarPaginas(c.paginas, { nome: nome }, Q.VOZ_CARBONO).then(function (v) { return v === 'outra' ? uma() : v; });
    }
    return uma();
  }

  if (R.NPCs && R.NPCs.registrarAcao) R.NPCs.registrarAcao('quimica-curiosidade', contar);
})();
