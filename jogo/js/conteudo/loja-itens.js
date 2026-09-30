/* Lista da Loja das Fadas (dados, sem DOM): a ÚNICA lista de enfeites à venda e dos prêmios da Escola.
   Usada por ui/loja.js (UI.ITENS_LOJA é apelido de ENFEITES), pela Loja por dentro (interiores/loja/loja.js)
   e pelas ferramentas (ferramentas/previas/acessorios.html).
   Nada de DOM, canvas, PA nem Reino.Progresso no carregamento: listar-falas.js e validar-interiores.js
   carregam este arquivo num vm sem DOM. PA, Reino.provas e Reino.config só dentro das funções.
   Tipos (Enfeite, Premio, ItemLoja, LojaItensApi): jogo/ferramentas/testes/tipos-jogo.d.ts. */
(function () {
  /** @type {ReinoGlobal} */
  var R = (window.Reino = window.Reino || {});
  /** @type {LojaItensApi} */
  var L = {};

  // encaixes dos enfeites (um enfeite por encaixe). capa, rastro e asas são especiais (usando.capa,
  // usando.estrelinhas, usando.asasFada); os outros vão em usando.enfeites e têm âncora nos moldes
  // do unicórnio (js/arte/pixelart-unicornio-moldes.js, UNI.adulto e UNI.filhote, em todas as vistas).
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

  // tudo o que se compra com estrelas. icone: emoji com desenho em js/arte/icones/ ou chave 'enfeite:<id>'
  L.ENFEITES = [
    { id: 'flor', nome: 'Flor na orelha', preco: 8, slot: 'orelha', icone: '🌸' },
    { id: 'fitinha-cauda', nome: 'Fitinha na cauda', preco: 10, slot: 'cauda', icone: 'enfeite:fitinha-cauda' },
    { id: 'gravata-borboleta', nome: 'Gravata-borboleta', preco: 10, slot: 'pescoco', icone: 'enfeite:gravata-borboleta' },
    { id: 'laco', nome: 'Laço de fita', preco: 12, slot: 'orelha', icone: '🎀' },
    { id: 'pompom-cauda', nome: 'Pompom na cauda', preco: 14, slot: 'cauda', icone: 'enfeite:pompom-cauda' },
    { id: 'oculos', nome: 'Óculos de coração', preco: 15, slot: 'olho', icone: 'enfeite:oculos' },
    { id: 'brinco-lua', nome: 'Brinco de lua', preco: 16, slot: 'orelha', icone: 'enfeite:brinco-lua', espaco: true },
    { id: 'colar-perolas', nome: 'Colar de pérolas', preco: 18, slot: 'pescoco', icone: 'enfeite:colar-perolas' },
    { id: 'capa', nome: 'Capa mágica (para você)', preco: 20, slot: 'capa', icone: 'enfeite:capa' },
    { id: 'oculos-estrela', nome: 'Oculinhos de estrela', preco: 22, slot: 'olho', icone: 'enfeite:oculos-estrela' },
    { id: 'coroa', nome: 'Coroa real', preco: 25, slot: 'cabeca', icone: 'enfeite:coroa' },
    { id: 'coroa-flores', nome: 'Coroa de flores', preco: 26, slot: 'cabeca', icone: 'enfeite:coroa-flores' },
    { id: 'estrelinhas', nome: 'Rastro de estrelinhas', preco: 30, slot: 'rastro', icone: '✨' },
    { id: 'tiara-estrelas', nome: 'Tiara de estrelas', preco: 32, slot: 'cabeca', icone: 'enfeite:tiara-estrelas', espaco: true },
    { id: 'colar-planetas', nome: 'Colar de planetas', preco: 35, slot: 'pescoco', icone: 'enfeite:colar-planetas', espaco: true },
    { id: 'anel-saturno', nome: 'Anel de Saturno no chifre', preco: 40, slot: 'chifre', icone: 'enfeite:anel-saturno', espaco: true },
    { id: 'cometa-cauda', nome: 'Cometa na cauda', preco: 42, slot: 'cauda', icone: 'enfeite:cometa-cauda', espaco: true },
    { id: 'asasFada', nome: 'Asinhas de fada', preco: 45, slot: 'asas', icone: '🧚' },
    // segunda leva (50 enfeites, de 6 a 80 ⭐). Vão no fim, e não na ordem de preço, para as posições 0–5
    // (as que os saves sintéticos dos testes compram e vestem) não mudarem; a tela da Loja agrupa por
    // encaixe e ordena por preço. Ícone: 'enfeite:<id>' (js/arte/icones/loja-enfeites.js) ou emoji com desenho
    // orelha
    { id: 'tulipa-orelha', nome: 'Tulipa na orelha', preco: 6, slot: 'orelha', icone: '🌷' },
    { id: 'morango-orelha', nome: 'Moranguinho na orelha', preco: 9, slot: 'orelha', icone: '🍓' },
    { id: 'abelhinha-orelha', nome: 'Abelhinha na orelha', preco: 13, slot: 'orelha', icone: '🐝' },
    { id: 'joaninha-orelha', nome: 'Joaninha na orelha', preco: 17, slot: 'orelha', icone: '🐞' },
    { id: 'concha-orelha', nome: 'Conchinha na orelha', preco: 21, slot: 'orelha', icone: '🐚' },
    { id: 'floco-neve-orelha', nome: 'Floquinho de neve', preco: 27, slot: 'orelha', icone: 'enfeite:floco-neve-orelha' },
    { id: 'nota-musical-orelha', nome: 'Nota musical na orelha', preco: 33, slot: 'orelha', icone: '🎵' },
    { id: 'borboleta-orelha', nome: 'Borboleta na orelha', preco: 44, slot: 'orelha', icone: 'enfeite:borboleta-orelha' },
    { id: 'brinco-diamante', nome: 'Brinco de diamante', preco: 62, slot: 'orelha', icone: '💎' },
    // olhos
    { id: 'oculos-redondos', nome: 'Óculos redondinhos', preco: 11, slot: 'olho', icone: 'enfeite:oculos-redondos' },
    { id: 'oculos-flor', nome: 'Óculos de flor', preco: 19, slot: 'olho', icone: 'enfeite:oculos-flor' },
    { id: 'oculos-arco-iris', nome: 'Óculos de arco-íris', preco: 29, slot: 'olho', icone: 'enfeite:oculos-arco-iris' },
    { id: 'oculos-melancia', nome: 'Óculos de melancia', preco: 37, slot: 'olho', icone: 'enfeite:oculos-melancia' },
    { id: 'oculos-gatinho', nome: 'Óculos de gatinho', preco: 48, slot: 'olho', icone: 'enfeite:oculos-gatinho' },
    { id: 'oculos-diamante', nome: 'Óculos de brilhante', preco: 70, slot: 'olho', icone: 'enfeite:oculos-diamante' },
    // cabeça
    { id: 'faixa-bolinhas', nome: 'Faixa de bolinhas', preco: 7, slot: 'cabeca', icone: 'enfeite:faixa-bolinhas' },
    { id: 'chapeu-cogumelo', nome: 'Chapéu de cogumelo', preco: 15, slot: 'cabeca', icone: 'enfeite:chapeu-cogumelo' },
    { id: 'tiara-coracoes', nome: 'Tiara de corações', preco: 20, slot: 'cabeca', icone: 'enfeite:tiara-coracoes' },
    { id: 'orelhinhas-coelho', nome: 'Orelhinhas de coelho', preco: 24, slot: 'cabeca', icone: 'enfeite:orelhinhas-coelho' },
    { id: 'touca-pompom', nome: 'Touca de pompom', preco: 31, slot: 'cabeca', icone: 'enfeite:touca-pompom' },
    { id: 'chapeu-aniversario', nome: 'Chapéu de aniversário', preco: 36, slot: 'cabeca', icone: 'enfeite:chapeu-aniversario' },
    { id: 'arquinho-arco-iris', nome: 'Arquinho de arco-íris', preco: 41, slot: 'cabeca', icone: 'enfeite:arquinho-arco-iris' },
    { id: 'tiara-perolas-mar', nome: 'Tiara de pérolas do mar', preco: 52, slot: 'cabeca', icone: 'enfeite:tiara-perolas-mar' },
    { id: 'coroa-diamantes', nome: 'Coroa de diamantes', preco: 80, slot: 'cabeca', icone: 'enfeite:coroa-diamantes' },
    // chifre
    { id: 'estrelinha-chifre', nome: 'Estrelinha no chifre', preco: 8, slot: 'chifre', icone: '⭐' },
    { id: 'lacinho-chifre', nome: 'Lacinho no chifre', preco: 14, slot: 'chifre', icone: 'enfeite:lacinho-chifre' },
    { id: 'raminho-chifre', nome: 'Raminho no chifre', preco: 18, slot: 'chifre', icone: '🌿' },
    { id: 'coracao-chifre', nome: 'Coração dourado no chifre', preco: 26, slot: 'chifre', icone: '💛' },
    { id: 'anel-arco-iris-chifre', nome: 'Anel de arco-íris no chifre', preco: 39, slot: 'chifre', icone: 'enfeite:anel-arco-iris-chifre' },
    { id: 'sininho-chifre', nome: 'Sininho no chifre', preco: 50, slot: 'chifre', icone: '🔔' },
    { id: 'cristal-gelo-chifre', nome: 'Cristal de gelo no chifre', preco: 66, slot: 'chifre', icone: '🧊' },
    // pescoço
    { id: 'lenco-bolinhas', nome: 'Lencinho de bolinhas', preco: 6, slot: 'pescoco', icone: 'enfeite:lenco-bolinhas' },
    { id: 'colar-margaridas', nome: 'Colar de margaridas', preco: 10, slot: 'pescoco', icone: 'enfeite:colar-margaridas' },
    { id: 'colar-cerejas', nome: 'Colar de cerejinhas', preco: 16, slot: 'pescoco', icone: 'enfeite:colar-cerejas' },
    { id: 'medalhinha-ouro', nome: 'Medalhinha de ouro', preco: 23, slot: 'pescoco', icone: '🥇' },
    { id: 'cachecol-listrado', nome: 'Cachecol listrado', preco: 28, slot: 'pescoco', icone: 'enfeite:cachecol-listrado' },
    { id: 'colar-conchinhas', nome: 'Colar de conchinhas', preco: 34, slot: 'pescoco', icone: 'enfeite:colar-conchinhas' },
    { id: 'colar-balinhas', nome: 'Colar de balinhas', preco: 40, slot: 'pescoco', icone: 'enfeite:colar-balinhas' },
    { id: 'pingente-coracao', nome: 'Pingente de coração azul', preco: 46, slot: 'pescoco', icone: '💙' },
    { id: 'colar-notas', nome: 'Colar de notas musicais', preco: 55, slot: 'pescoco', icone: '🎶' },
    { id: 'colar-rubis', nome: 'Colar de rubis', preco: 75, slot: 'pescoco', icone: 'enfeite:colar-rubis' },
    // cauda
    { id: 'laco-xadrez-cauda', nome: 'Laço xadrez na cauda', preco: 7, slot: 'cauda', icone: 'enfeite:laco-xadrez-cauda' },
    { id: 'flores-cauda', nome: 'Flores na cauda', preco: 12, slot: 'cauda', icone: 'enfeite:flores-cauda' },
    { id: 'peixinho-cauda', nome: 'Peixinho na cauda', preco: 16, slot: 'cauda', icone: '🐟' },
    { id: 'estrelas-cauda', nome: 'Estrelinhas na cauda', preco: 22, slot: 'cauda', icone: '💫' },
    { id: 'fita-arco-iris-cauda', nome: 'Fita de arco-íris na cauda', preco: 30, slot: 'cauda', icone: 'enfeite:fita-arco-iris-cauda' },
    { id: 'pena-cauda', nome: 'Peninha na cauda', preco: 35, slot: 'cauda', icone: '🪶' },
    { id: 'balao-cauda', nome: 'Balãozinho na cauda', preco: 43, slot: 'cauda', icone: '🎈' },
    { id: 'barbatana-sereia', nome: 'Barbatana de sereia', preco: 58, slot: 'cauda', icone: 'enfeite:barbatana-sereia' },
    { id: 'estrela-cadente-cauda', nome: 'Estrela cadente na cauda', preco: 78, slot: 'cauda', icone: '🌠' },
    // viagem espacial (3ª versão): no fim, para não mexer nas posições dos saves sintéticos
    { id: 'capacete-astronauta', nome: 'Capacete de astronauta', preco: 38, slot: 'cabeca', icone: 'enfeite:capacete-astronauta', espaco: true },
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

  /** @type {RaridadePremio[]} */
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
  /** @param {string} id @returns {Premio | null} */
  function premioPorId(id) {
    var ps = L.premios();
    for (var i = 0; i < ps.length; i++) if (ps[i].id === id) return ps[i];
    return null;
  }
  /** @param {Premio} premio @returns {Prova | { id: string }} a prova do prêmio (só o id, se ela não carregou) */
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
