/* Lista da Loja das Fadas (dados, sem DOM): a ÚNICA lista de enfeites à venda e dos prêmios da Escola.
   Usada por ui.js (UI.ITENS_LOJA é apelido de ENFEITES), pela Loja por dentro (interiores/loja.js)
   e pelas ferramentas (ferramentas/acessorios.html).
   Nada de DOM, canvas, PA nem Reino.Progresso no carregamento: listar-falas.js e validar-interiores.js
   carregam este arquivo num vm sem DOM. PA, Reino.provas e Reino.config só dentro das funções. */
(function () {
  var R = (window.Reino = window.Reino || {});
  var L = {};

  // encaixes dos enfeites (um enfeite por encaixe). capa, rastro e asas são especiais (usando.capa,
  // usando.estrelinhas, usando.asasFada); os outros vão em usando.enfeites e têm âncora nos moldes
  // do unicórnio (js/pixelart.js, UNI.adulto e UNI.filhote, em todas as vistas).
  L.SLOTS = {
    orelha: { nome: 'Orelha' },
    olho: { nome: 'Olhos' },
    cabeca: { nome: 'Cabeça' },
    chifre: { nome: 'Chifre' },
    pescoco: { nome: 'Pescoço' },
    cauda: { nome: 'Cauda' },
    capa: { nome: 'Capa (para você)' },
    rastro: { nome: 'Rastro' },
    asas: { nome: 'Asas' },
  };

  // tudo o que se compra com estrelas. icone: emoji com desenho em js/icones.js ou chave 'enfeite:<id>'
  L.ENFEITES = [
    { id: 'flor', nome: 'Flor na orelha', preco: 8, slot: 'orelha', icone: '🌸' },
    { id: 'fitinha-cauda', nome: 'Fitinha na cauda', preco: 10, slot: 'cauda', icone: 'enfeite:fitinha-cauda' },
    { id: 'gravata-borboleta', nome: 'Gravata-borboleta', preco: 10, slot: 'pescoco', icone: 'enfeite:gravata-borboleta' },
    { id: 'laco', nome: 'Laço de fita', preco: 12, slot: 'orelha', icone: '🎀' },
    { id: 'pompom-cauda', nome: 'Pompom na cauda', preco: 14, slot: 'cauda', icone: 'enfeite:pompom-cauda' },
    { id: 'oculos', nome: 'Óculos de coração', preco: 15, slot: 'olho', icone: '💗' },
    { id: 'brinco-lua', nome: 'Brinco de lua', preco: 16, slot: 'orelha', icone: 'enfeite:brinco-lua', espaco: true },
    { id: 'colar-perolas', nome: 'Colar de pérolas', preco: 18, slot: 'pescoco', icone: 'enfeite:colar-perolas' },
    { id: 'capa', nome: 'Capa mágica (para você)', preco: 20, slot: 'capa', icone: '🦸' },
    { id: 'oculos-estrela', nome: 'Oculinhos de estrela', preco: 22, slot: 'olho', icone: 'enfeite:oculos-estrela' },
    { id: 'coroa', nome: 'Coroa real', preco: 25, slot: 'cabeca', icone: '👑' },
    { id: 'coroa-flores', nome: 'Coroa de flores', preco: 26, slot: 'cabeca', icone: 'enfeite:coroa-flores' },
    { id: 'estrelinhas', nome: 'Rastro de estrelinhas', preco: 30, slot: 'rastro', icone: '✨' },
    { id: 'tiara-estrelas', nome: 'Tiara de estrelas', preco: 32, slot: 'cabeca', icone: 'enfeite:tiara-estrelas', espaco: true },
    { id: 'colar-planetas', nome: 'Colar de planetas', preco: 35, slot: 'pescoco', icone: 'enfeite:colar-planetas', espaco: true },
    { id: 'anel-saturno', nome: 'Anel de Saturno no chifre', preco: 40, slot: 'chifre', icone: 'enfeite:anel-saturno', espaco: true },
    { id: 'cometa-cauda', nome: 'Cometa na cauda', preco: 42, slot: 'cauda', icone: 'enfeite:cometa-cauda', espaco: true },
    { id: 'asasFada', nome: 'Asinhas de fada', preco: 45, slot: 'asas', icone: '🧚' },
  ];

  // o que a Loja fala de novo (o orquestrador grava; Falas.todas põe no pacote geral)
  L.FALAS = {
    premiosAVenda: 'Os outros prêmios da prova agora se trocam por estrelas! ⭐',
    faltamPremio: 'Ainda faltam estrelas para esse prêmio. Cada acerto de primeira vale uma estrela! ⭐',
  };

  L.enfeite = function (id) {
    for (var i = 0; i < L.ENFEITES.length; i++) if (L.ENFEITES[i].id === id) return L.ENFEITES[i];
    return null;
  };

  var RARIDADES = ['lendario', 'raro', 'comum'];
  L.precoPremio = function (raridade) {
    var t = (R.config && R.config.precoPremio) || { comum: 25, raro: 40, lendario: 70 };
    return t[raridade];
  };
  function encaixe(id) {
    var e = window.PA && window.PA.ENFEITES_MONTARIA && window.PA.ENFEITES_MONTARIA[id];
    return e ? e.ancora : null;
  }
  // os acessórios de todas as provas (Reino.provas), na ordem lendário, raro, comum de cada prova
  L.premios = function () {
    var lista = [];
    (R.provas || []).forEach(function (pv) {
      RARIDADES.forEach(function (r) {
        var a = pv.acessorios && pv.acessorios[r];
        if (!a) return;
        lista.push({ id: a.id, nome: a.nome, raridade: r, provaId: pv.id, preco: L.precoPremio(r), slot: encaixe(a.id) });
      });
    });
    return lista;
  };
  function premioPorId(id) {
    var ps = L.premios();
    for (var i = 0; i < ps.length; i++) if (ps[i].id === id) return ps[i];
    return null;
  }
  function provaDe(premio) {
    var ps = R.provas || [];
    for (var i = 0; i < ps.length; i++) if (ps[i].id === premio.provaId) return ps[i];
    return { id: premio.provaId };
  }
  // derivado do save (nada novo nele):
  //   ganho: é o prêmio da prova • comprado: está na loja e não é o ganho
  //   aVenda: já ganhou algum desta prova • bloqueado: ainda não ganhou nenhum desta prova
  L.estadoPremio = function (premio, P) {
    var reg = (P && P.regProva) ? P.regProva(provaDe(premio)) : {};
    if (reg && reg.premio === premio.raridade) return 'ganho';
    var est = (P && P.estado) ? P.estado() : null;
    if (est && est.loja && est.loja[premio.id]) return 'comprado';
    return (reg && reg.premio) ? 'aVenda' : 'bloqueado';
  };
  // enfeite ou prêmio no formato de item da loja
  L.item = function (id) {
    var e = L.enfeite(id);
    if (e) return e;
    var p = premioPorId(id);
    if (!p) return null;
    return { id: p.id, nome: p.nome, slot: p.slot, preco: p.preco, raridade: p.raridade, provaId: p.provaId,
      icone: 'acessorio:' + p.id, premio: true };
  };

  R.LojaItens = L;
})();
