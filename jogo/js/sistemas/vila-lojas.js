/* Vila Arco-Íris: as regras das 4 lojas e a pergunta antes da conversa com o lojista (docs/contratos/vila.md §4, §5),
   mais o Mercado de Lugares Famosos, o balcão da Garagem da casa (casa.md §2).
   Reino.VilaLojas:
     LOJAS                       { casa|armas|cabecas|armaduras|lugares: { id, nome, familias, icone, moveis?, varios? } }
                                 (varios: como a tela chama várias de uma vez; sem ele, "peças")
     aVenda(loja)                [{ id, def, preco }]: loja de móveis (`moveis: true`: casa, lugares) = os móveis da casa
                                 daquela loja (`loja: true` é a Casa Bonita; `loja: '<id>'` as outras), pelo `preco` do
                                 móvel (sem ele, config.vila.precoDecor); as outras = as peças do catálogo com aquele
                                 `loja` (def.preco)
     compraveis(loja)            [{ id, def, uids, preco }]: as peças dela das famílias da loja (mochila e baú, nunca a
                                 vestida), por id; loja de móveis: nada
     precoVenda(def)             floor(preco × vendaFracao) (mínimo 1); sem preço (drop): vendaDrop[raridade]
     total(loja, itens)          a soma da compra de [{ id, qtd }]
     totalVenda(loja, uids)      a soma da venda
     comprar(loja, itens)        tudo ou nada: confere o saldo, gasta e dá as peças (móveis: CasaMoveis.guardar na chave
                                 'loja:<id>:<n>', n = a próxima livre; peças: Itens.ganhar) → { ok, total, motivo?, falta? }
     vender(loja, uids)          tudo ou nada: Itens.jogarFora + P.ganharEstrelas → { ok, total, motivo? }
     perguntas() / pergunta()    as perguntas do bimestre config.vila.bimestre (filtros do Bosque); sorteio 'vila:pergunta'
   Módulo 'vila-lojas': porteira(npc) (lojista com ação vilaLoja → UI.perguntaVila) e a ação vilaLoja (abre a loja e
   resolve 'tchau': o lojista se despede). Nada novo no save. node: true: nada de DOM no carregamento. */
(function () {
  var R = window.Reino, U = R.util;
  var LOJAS = {
    casa: { id: 'casa', nome: 'Casa Bonita', familias: [], icone: '🏠', moveis: true, varios: 'enfeites' },
    armas: { id: 'armas', nome: 'Forja Brilhante', familias: ['espada'], icone: 'item:espada-madeira' },
    cabecas: { id: 'cabecas', nome: 'Elmos e Chapéus', familias: ['capacete', 'chapeu'], icone: 'item:chapeu-flor' },
    armaduras: { id: 'armaduras', nome: 'Armaduras e Botas', familias: ['armadura', 'botas'], icone: 'item:armadura-colete' },
    // o balcão da Garagem da casa (interiores/casa/garagem.js): as miniaturas de lugares famosos, móveis da casa
    lugares: { id: 'lugares', nome: 'Mercado de Lugares Famosos', familias: [], icone: '🗽', moveis: true, varios: 'miniaturas' },
  };
  var ONDE_VENDE = { mochila: 1, bau: 1 };

  function cfg() { return R.config.vila; }
  function P() { return R.Progresso; }
  function loja(id) { return Object.prototype.hasOwnProperty.call(LOJAS, id) ? LOJAS[id] : null; }
  function max() { return cfg().maxPorItem || 10; }

  /* ---------- o que cada loja vende e compra ---------- */
  // a loja de um móvel da casa: `loja: true` (os enfeites de antes) é a Casa Bonita; senão o id da loja (ou null)
  function lojaDoMovel(m) { return m.loja === true ? 'casa' : typeof m.loja === 'string' ? m.loja : null; }
  function precoMovel(m) { return typeof m.preco === 'number' && m.preco > 0 ? m.preco : cfg().precoDecor; }
  function aVenda(id) {
    var l = loja(id);
    if (!l) return [];
    if (l.moveis) {
      return (R.moveisCasa || []).filter(function (m) { return lojaDoMovel(m) === id; })
        .map(function (m) { return { id: m.id, def: m, preco: precoMovel(m) }; });
    }
    var C = R.ItensCatalogo;
    return (C ? C.todos() : []).filter(function (d) { return d.loja === id && d.preco > 0; })
      .map(function (d) { return { id: d.id, def: d, preco: d.preco }; });
  }
  function precoVenda(def) {
    if (!def) return 0;
    if (typeof def.preco === 'number' && def.preco > 0) return Math.max(1, Math.floor(def.preco * cfg().vendaFracao));
    var t = cfg().vendaDrop;
    return t[def.raridade] || t.comum;
  }
  function compraveis(id) {
    var l = loja(id), It = R.Itens;
    if (!l || !l.familias.length || !It || !P().estado()) return [];
    var grupos = [], por = {};
    It.pecas().forEach(function (p) {
      if (ONDE_VENDE[p.onde] !== 1 || l.familias.indexOf(p.def.tipo) < 0) return;
      if (!por[p.id]) { por[p.id] = { id: p.id, def: p.def, uids: [], preco: precoVenda(p.def) }; grupos.push(por[p.id]); }
      por[p.id].uids.push(p.uid);
    });
    // na ordem do catálogo (as famílias juntas, como a loja vende)
    var todos = R.ItensCatalogo.todos();
    return grupos.sort(function (a, b) { return todos.indexOf(a.def) - todos.indexOf(b.def); });
  }

  /* ---------- totais ---------- */
  // [{ id, qtd }] → [{ oferta, qtd }] ou null se algo não fecha (id de fora da loja, qtd fora de 1..maxPorItem)
  function conferirCompra(id, itens) {
    if (!Array.isArray(itens) || !itens.length) return null;
    var ofertas = {}, visto = {}, r = [];
    aVenda(id).forEach(function (o) { ofertas[o.id] = o; });
    for (var i = 0; i < itens.length; i++) {
      var x = itens[i], o = x && ofertas[x.id], q = x && x.qtd;
      if (!o || visto[x.id] || typeof q !== 'number' || q !== Math.floor(q) || q < 1 || q > max()) return null;
      visto[x.id] = true;
      r.push({ oferta: o, qtd: q });
    }
    return r;
  }
  function total(id, itens) {
    var l = conferirCompra(id, itens);
    return l ? l.reduce(function (s, x) { return s + x.oferta.preco * x.qtd; }, 0) : 0;
  }
  // uids → as peças (cada uma uma vez só) ou null
  function conferirVenda(id, uids) {
    if (!Array.isArray(uids) || !uids.length) return null;
    var vale = {}, visto = {}, r = [];
    compraveis(id).forEach(function (g) { g.uids.forEach(function (u) { vale[u] = g; }); });
    for (var i = 0; i < uids.length; i++) {
      var g = vale[uids[i]];
      if (!g || visto[uids[i]]) return null;
      visto[uids[i]] = true;
      r.push({ uid: uids[i], preco: g.preco });
    }
    return r;
  }
  function totalVenda(id, uids) {
    var l = conferirVenda(id, uids);
    return l ? l.reduce(function (s, x) { return s + x.preco; }, 0) : 0;
  }

  /* ---------- comprar e vender ---------- */
  // a próxima chave livre 'loja:<id>:<n>' da casa (a mesma para as lojas de móveis: o id do móvel não se repete)
  function chaveLivre(movelId) {
    var e = P().estado(), c = e && e.casaMoveis && typeof e.casaMoveis === 'object' ? e.casaMoveis : {}, n = 1;
    while (Object.prototype.hasOwnProperty.call(c, 'loja:' + movelId + ':' + n)) n++;
    return 'loja:' + movelId + ':' + n;
  }
  function avisar() {
    P().salvar();
    U.emit(R.EVENTOS.MAPA_MUDOU);
  }
  function comprar(id, itens) {
    var Pr = P();
    if (!Pr.estado()) return { ok: false, motivo: 'sem-save', total: 0 };
    var l = conferirCompra(id, itens);
    if (!l) return { ok: false, motivo: 'itens', total: 0 };
    var t = l.reduce(function (s, x) { return s + x.oferta.preco * x.qtd; }, 0), moveis = loja(id).moveis;
    var saldo = Pr.estrelas();
    if (saldo < t) return { ok: false, motivo: 'saldo', total: t, falta: t - saldo };
    if (moveis && !(R.CasaMoveis && R.CasaMoveis.guardar)) return { ok: false, motivo: 'itens', total: t };
    if (!moveis && !(R.Itens && R.Itens.ganhar)) return { ok: false, motivo: 'itens', total: t };
    if (!Pr.gastarEstrelas(t)) return { ok: false, motivo: 'saldo', total: t, falta: t - Pr.estrelas() };
    var ganhos = [];
    l.forEach(function (x) {
      for (var k = 0; k < x.qtd; k++) {
        if (moveis) {
          var chave = chaveLivre(x.oferta.id);
          R.CasaMoveis.guardar(chave, x.oferta.id);
          ganhos.push({ id: x.oferta.id, chave: chave });
        } else {
          var g = R.Itens.ganhar(x.oferta.id);
          ganhos.push({ id: x.oferta.id, uid: g && g.uid, onde: g && g.onde });
        }
      }
    });
    avisar();
    return { ok: true, total: t, ganhos: ganhos };
  }
  function vender(id, uids) {
    var Pr = P();
    if (!Pr.estado()) return { ok: false, motivo: 'sem-save', total: 0 };
    var l = conferirVenda(id, uids);
    if (!l) return { ok: false, motivo: 'pecas', total: 0 };
    var t = l.reduce(function (s, x) { return s + x.preco; }, 0);
    // as estrelas primeiro: o jogarFora já grava as duas coisas juntas
    Pr.ganharEstrelas(t);
    R.Itens.jogarFora(l.map(function (x) { return x.uid; }));
    avisar();
    return { ok: true, total: t };
  }

  /* ---------- a pergunta do lojista ---------- */
  // todas as perguntas das matérias do bimestre da Vila, não arquivadas, com os filtros do Bosque (bosque.js: perguntas)
  function perguntas() {
    var fora = (R.config.fantasmas && R.config.fantasmas.perguntaForaTipos) || [], bim = cfg().bimestre, lista = [];
    (R.materias || []).forEach(function (m) {
      if (m.arquivada || m.bimestre !== bim) return;
      (m.salas || []).forEach(function (s) {
        (s.desafios || []).forEach(function (d) {
          if (R.tiposDesafio[d.tipo] && R.avulsa(d) && fora.indexOf(d.tipo) < 0 && !d.livre && !(d.tipo === 'escrever' && !(d.chaves && d.chaves.length))) lista.push({ materia: m, sala: s, desafio: d });
        });
      });
    });
    return lista;
  }
  function pergunta() {
    var l = perguntas();
    return l.length ? U.sortear(l, 'vila:pergunta') : null;
  }

  /* ---------- o lojista ---------- */
  // só o lojista com a ação vilaLoja; sem pergunta (ou sem a tela), conversa direto
  function porteira(npc) {
    var a = npc && npc.acao;
    if (!a || a.tipo !== 'vilaLoja') return null;
    var UI = R.UI;
    if (!UI || !UI.perguntaVila || !perguntas().length) return Promise.resolve(true);
    return UI.perguntaVila(npc);
  }
  function vilaLoja(acao) {
    var UI = R.UI;
    if (!UI || !UI.telaVilaLoja || !loja(acao && acao.loja)) return Promise.resolve('tchau');
    return Promise.resolve(UI.telaVilaLoja(acao.loja)).then(function () { return 'tchau'; });
  }

  R.VilaLojas = { LOJAS: LOJAS, loja: loja, aVenda: aVenda, compraveis: compraveis, precoVenda: precoVenda, total: total,
    totalVenda: totalVenda, comprar: comprar, vender: vender, perguntas: perguntas, pergunta: pergunta };

  R.registrarModulo({
    id: 'vila-lojas',
    acoes: { vilaLoja: vilaLoja },
    porteira: porteira,
    depurar: function () {
      var r = { perguntas: perguntas().length, aVenda: {}, compraveis: {} };
      Object.keys(LOJAS).forEach(function (k) {
        r.aVenda[k] = aVenda(k).length;
        if (P() && P().estado()) r.compraveis[k] = compraveis(k).reduce(function (s, g) { return s + g.uids.length; }, 0);
      });
      return r;
    },
  });
})();
