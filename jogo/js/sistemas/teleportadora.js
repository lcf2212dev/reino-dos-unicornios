/* A Teleportadora (docs/contratos/cidade-nova.md): o balão dela e as viagens entre a Cidade
   Principal, a Cidade Nova e o portal do Bosque. A mesma pessoa aparece na praça principal
   (mundo/teleportadora.js), na entrada e na praça da Cidade Nova (interiores/cidade-nova).
   Sem voz nova: o balão usa a voz `narradora` e o retrato é o unicórnio desenhado em
   arte/teleportadora.js. Nada de DOM no carregamento. */
(function () {
  var R = window.Reino, CFG = (R.config && R.config.lojaCidade) || {};
  function chegadaCidade() { return CFG.chegadaCidade || { x: 25, y: 33 }; }
  function chegadaPrincipal() { return CFG.chegadaPrincipal || { x: 32, y: 22 }; }

  function quem() {
    var retrato = R.TeleportadoraArte && R.TeleportadoraArte.retrato ? R.TeleportadoraArte.retrato() : null;
    return { nome: 'Teleportadora', retrato: retrato, voz: 'narradora' };
  }

  function irCidade() {
    if (!R.Cena || !R.Cena.irPara) return Promise.resolve();
    R.Som.tocar('estrela');
    return R.Cena.irPara('cidade-nova', chegadaCidade(), { x: 0, y: -1 });
  }

  function irPrincipal() {
    var J = window.Jogador;
    R.Som.tocar('estrela');
    var p = R.Cena && R.Cena.sair ? R.Cena.sair() : Promise.resolve();
    return p.then(function () {
      if (J && J.posicionar) J.posicionar(chegadaPrincipal().x, chegadaPrincipal().y);
      if (J && J.virar) J.virar(0, -1);
    });
  }

  /** o balão da Teleportadora: `destino` = 'cidade' (ir para a Cidade Nova) ou 'principal' (voltar) */
  function falar(destino) {
    var paraCidade = destino !== 'principal';
    var texto = paraCidade ? 'Quer conhecer a Cidade Nova? Eu levo você! ✨' : 'Quer voltar para a Cidade Principal? Eu levo você! ✨';
    var sim = paraCidade ? 'Ir para a Cidade Nova ✨' : 'Voltar para a Cidade Principal ✨';
    return R.Claude.falar(texto, {
      quem: quem(), voz: 'narradora', modal: true,
      botoes: [{ texto: 'Agora não', valor: 'nao', seguro: true }, { texto: sim, valor: 'sim', principal: true }],
    }).then(function (v) {
      if (v !== 'sim') return false;
      return (paraCidade ? irCidade() : irPrincipal()).then(function () { return true; });
    });
  }

  /** o portal do Bosque ↔ Cidade Nova: `para` = 'cidade' ou 'bosque' */
  function portal(para) {
    if (!R.Cena || !R.Cena.irPara) return Promise.resolve();
    R.Som.tocar('estrela');
    if (para === 'bosque') {
      var p = CFG.portalBosque || { x: 43, y: 21 };
      return R.Cena.irPara('bosque', { x: p.x + 1, y: p.y + 2 }, { x: 0, y: -1 });
    }
    return R.Cena.irPara('cidade-nova', chegadaCidade(), { x: 0, y: -1 });
  }

  R.Teleportadora = { falar: falar, irCidade: irCidade, irPrincipal: irPrincipal, portal: portal, quem: quem };

  R.registrarModulo({
    id: 'teleportadora',
    // as duas falas do balão da Teleportadora entram no pacote geral (voz `narradora`)
    falas: function () {
      return [
        { texto: 'Quer conhecer a Cidade Nova? Eu levo você! ✨', voz: 'narradora', pacote: 'geral' },
        { texto: 'Quer voltar para a Cidade Principal? Eu levo você! ✨', voz: 'narradora', pacote: 'geral' },
      ];
    },
    acoes: {
      teleportadora: function (acao) { return falar(acao && acao.destino); },
      portalCidade: function (acao) { return portal(acao && acao.para); },
    },
  });
})();
