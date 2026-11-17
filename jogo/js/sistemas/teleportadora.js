/* A Teleportadora (docs/contratos/vila.md §6): o unicórnio de aura arco-íris que leva entre a praça da cidade e a
   Vila Arco-Íris. Módulo 'teleportadora' com a ação { tipo: 'teleportadora', para: 'vila' | 'cidade' } (o objeto
   vila-teleportadora da Vila; no mapa, mundo/teleportadora.js chama Reino.Teleportadora.tocar('vila')) e as falas
   dela (voz 'npc-teleportadora', pacote 'geral'). Na cidade: oi (1ª vez na sessão) e o convite; "Vamos! ✨" leva a
   Cena.irPara('vila', chegadaVila). Na Vila: o convite de volta; "Vamos! ✨" leva a Cena.sair(chegadaCidade).
   node: true: no carregamento só registra (personagem com a voz e o módulo). */
(function () {
  var R = window.Reino;
  var VOZ = 'npc-teleportadora';
  var F = {
    oi: 'Oi! Eu sou a Teleportadora.',
    vila: 'Quer ir para a Vila Arco-Íris?',
    cidade: 'Quer voltar para a cidade?',
  };
  var BOTOES = [{ texto: 'Vamos! ✨', valor: 'vamos', principal: true }, { texto: 'Agora não', valor: 'nao' }];

  // a voz dela: fada alegre, aguda e ligeira (diferente do Claude, da narradora e da voz dos unicórnios)
  R.registrarPersonagem({ id: 'teleportadora', nome: 'Teleportadora',
    sprite: { pele: '#fbf6ff', cabelo: '#ff7eb6', penteado: 'longo', roupa: '#b894ff', perna: 'vestido', chapeu: 'tiara' },
    perfil: { voz: 'pt-BR-FranciscaNeural', velocidade: '+16%', tom: '+30Hz' } });

  var jaDisseOi = false;   // o oi é só na 1ª vez da sessão (não vai para o save)
  function cfg() { return (R.config && R.config.vila) || {}; }
  function quem() {
    var A = R.TeleportadoraArte;
    return { nome: 'Teleportadora', retrato: A && A.retrato ? A.retrato() : null, voz: VOZ };
  }
  function falar(texto, botoes) {
    var op = { quem: quem(), voz: VOZ, fala: [texto], modal: true };
    if (botoes) op.botoes = botoes;
    return R.Claude.falar(texto, op);
  }
  // para: 'vila' (da praça da cidade) ou 'cidade' (da Vila)
  function tocar(para) {
    var naVila = para === 'cidade';
    var p = Promise.resolve('ok');
    if (!naVila && !jaDisseOi) { jaDisseOi = true; p = falar(F.oi); }   // botão padrão "Ok! 👍"
    return p.then(function (v) {
      if (v === null) return null;
      return falar(naVila ? F.cidade : F.vila, BOTOES);
    }).then(function (v) {
      if (v !== 'vamos') return null;
      viajar(para);
      return v;
    });
  }
  function viajar(para) {
    var C = R.Cena, c = cfg();
    if (!C) return;
    if (R.Som && R.Som.tocar) R.Som.tocar('estrela');
    if (para === 'cidade') return C.sair(c.chegadaCidade);
    return C.irPara('vila', c.chegadaVila, { x: 0, y: 1 });
  }

  var T = {
    tocar: tocar,
    falas: function () {
      return [F.oi, F.vila, F.cidade].map(function (t) { return { texto: t, voz: VOZ, pacote: 'geral' }; });
    },
  };
  R.registrarModulo({ id: 'teleportadora', falas: T.falas,
    acoes: { teleportadora: function (acao) { return tocar((acao && acao.para) || 'vila'); } },
    depurar: function () { return { jaDisseOi: jaDisseOi }; } });
  R.Teleportadora = T;
})();
