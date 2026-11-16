/* Treinadores de Monstros, na Vila Arco-Íris (docs/contratos/monstros.md): comprar MonsterBalls e Super MonsterBalls e
   a pergunta antes da conversa com a Treinadora Kiara (a mesma das lojas da Vila, vila.md §5). Reino.Treinadores:
     ID, ID_SUPER          'bola-monster' e 'bola-super' (os itens, conteudo/itens/catalogo.js)
     ofertas()             [{ id, def, preco, chance }] das bolas que existem no catálogo, na ordem da loja
                           (MonsterBall: config.monstros.precoBola / chanceCaptura; Super: precoSuper / chanceSuper)
     preco(id?) chance(id?) o preço e a chance de uma bola (sem id: a MonsterBall)
     max()                 quantas de cada cabem numa compra (config.monstros.maxCarrinho)
     tem(id?)              quantas daquela bola ela tem (mochila e baú)
     total(itens)          o preço de [{ id, qtd }] (0 se algo não fecha); um número n = n MonsterBalls
     comprar(itens)        tudo ou nada: confere o saldo, gasta e dá as bolas (Itens.ganhar; mochila cheia, o baú)
                           → { ok, total, motivo?: 'sem-save' | 'itens' | 'saldo', falta?, ganhos? }
   Módulo 'treinadores': porteira(npc) (NPC com a ação 'treinadores' → UI.perguntaVila) e a ação 'treinadores' (abre
   UI.telaTreinadores e resolve 'tchau'). Nada novo no save (as bolas são itens, o campo `itens`). node: true: nada
   de DOM no carregamento. */
(function () {
  var R = window.Reino, U = R.util;
  var ID = 'bola-monster', ID_SUPER = 'bola-super';

  function cfg() { return (R.config && R.config.monstros) || {}; }
  function P() { return R.Progresso; }
  function def(id) { return R.ItensCatalogo ? R.ItensCatalogo.def(id) : null; }
  function numero(v, padrao) { return typeof v === 'number' && isFinite(v) ? v : padrao; }
  function preco(id) {
    var d = def(id || ID), c = cfg();
    if (id === ID_SUPER) return numero(c.precoSuper, (d && d.preco) || 125);
    return numero(c.precoBola, (d && d.preco) || 50);
  }
  function chance(id) { return id === ID_SUPER ? numero(cfg().chanceSuper, 1) : numero(cfg().chanceCaptura, 0.4); }
  function max() { return cfg().maxCarrinho || 10; }
  function ofertas() {
    return [ID, ID_SUPER].filter(function (id) { return !!def(id); })
      .map(function (id) { return { id: id, def: def(id), preco: preco(id), chance: chance(id) }; });
  }
  function tem(id) {
    var It = R.Itens, alvo = id || ID;
    if (!It || !P() || !P().estado()) return 0;
    return It.pecas().filter(function (p) { return p.id === alvo && (p.onde === 'mochila' || p.onde === 'bau'); }).length;
  }
  // [{ id, qtd }] (ou n = n MonsterBalls) → [{ oferta, qtd }] ou null se algo não fecha (bola de fora, qtd fora de 1..max)
  function conferir(itens) {
    if (typeof itens === 'number') itens = [{ id: ID, qtd: itens }];
    if (!Array.isArray(itens) || !itens.length) return null;
    var por = {}, visto = {}, r = [];
    ofertas().forEach(function (o) { por[o.id] = o; });
    for (var i = 0; i < itens.length; i++) {
      var x = itens[i], o = x && por[x.id], q = x && x.qtd;
      if (!o || visto[x.id] || typeof q !== 'number' || q !== Math.floor(q) || q < 1 || q > max()) return null;
      visto[x.id] = true;
      r.push({ oferta: o, qtd: q });
    }
    return r;
  }
  function soma(l) { return l.reduce(function (s, x) { return s + x.oferta.preco * x.qtd; }, 0); }
  function total(itens) { var l = conferir(itens); return l ? soma(l) : 0; }
  function comprar(itens) {
    var Pr = P();
    if (!Pr || !Pr.estado()) return { ok: false, motivo: 'sem-save', total: 0 };
    var l = conferir(itens);
    if (!l || !(R.Itens && R.Itens.ganhar)) return { ok: false, motivo: 'itens', total: 0 };
    var t = soma(l), saldo = Pr.estrelas();
    if (saldo < t) return { ok: false, motivo: 'saldo', total: t, falta: t - saldo };
    if (!Pr.gastarEstrelas(t)) return { ok: false, motivo: 'saldo', total: t, falta: t - Pr.estrelas() };
    var ganhos = [];
    l.forEach(function (x) {
      for (var k = 0; k < x.qtd; k++) {
        var g = R.Itens.ganhar(x.oferta.id);
        ganhos.push({ id: x.oferta.id, uid: g && g.uid, onde: g && g.onde });
      }
    });
    Pr.salvar();
    U.emit(R.EVENTOS.MAPA_MUDOU);
    return { ok: true, total: t, ganhos: ganhos };
  }

  // só a Kiara (ação 'treinadores'); sem pergunta (ou sem a tela), conversa direto
  function porteira(npc) {
    var a = npc && npc.acao;
    if (!a || a.tipo !== 'treinadores') return null;
    var UI = R.UI, V = R.VilaLojas;
    if (!UI || !UI.perguntaVila || !V || !V.perguntas().length) return Promise.resolve(true);
    return UI.perguntaVila(npc);
  }
  function abrir() {
    var UI = R.UI;
    if (!UI || !UI.telaTreinadores) return Promise.resolve('tchau');
    return Promise.resolve(UI.telaTreinadores()).then(function () { return 'tchau'; });
  }

  R.Treinadores = { ID: ID, ID_SUPER: ID_SUPER, ofertas: ofertas, preco: preco, chance: chance, max: max, tem: tem,
    total: total, comprar: comprar };

  R.registrarModulo({
    id: 'treinadores',
    acoes: { treinadores: abrir },
    porteira: porteira,
    depurar: function () {
      return { ofertas: ofertas().map(function (o) { return [o.id, o.preco, o.chance]; }), tem: P() && P().estado() ? [tem(ID), tem(ID_SUPER)] : null };
    },
  });
})();
