/* Vila Arco-Íris: as regras das 4 lojas e a pergunta antes da conversa com o lojista (docs/contratos/vila.md §4, §5).
   Reino.VilaLojas:
     LOJAS                       { casa|armas|cabecas|armaduras: { id, nome, familias, icone } }
     aVenda(loja)                [{ id, def, preco }]: casa = os móveis `loja: true` (config.vila.precoDecor);
                                 as outras = as peças do catálogo com aquele `loja` (def.preco)
     compraveis(loja)            [{ id, def, uids, preco }]: as peças dela das famílias da loja (mochila e baú, nunca a
                                 vestida), por id; casa: nada
     precoVenda(def)             floor(preco × vendaFracao) (mínimo 1); sem preço (drop): vendaDrop[raridade]
     total(loja, itens)          a soma da compra de [{ id, qtd }]
     totalVenda(loja, uids)      a soma da venda
     comprar(loja, itens)        tudo ou nada: confere o saldo, gasta e dá as peças (casa: CasaMoveis.guardar na chave
                                 'loja:<id>:<n>', n = a próxima livre; peças: Itens.ganhar) → { ok, total, motivo?, falta? }
     vender(loja, uids)          tudo ou nada: Itens.jogarFora + P.ganharEstrelas → { ok, total, motivo? }
     perguntas() / pergunta()    as perguntas do bimestre config.vila.bimestre (filtros do Bosque); sorteio 'vila:pergunta'
     conquistas(loja)            [{ id, def, tem }]: as peças `cursiva: true` da loja (conteudo/itens/pluma.js), que não
                                 se compram nem se vendem; `tem` = ela tem uma viva (mochila, baú ou vestida)
     frasesPorPeca()             quantas frases em letra cursiva valem uma peça (config.cursiva.frasesPorPeca)
     conquistar(loja, id)        as frases ficaram prontas (UI.telaCursiva; cursiva.md §6): dá a peça (Itens.ganhar), sem
                                 gastar nada; uma de cada → { ok, id, uid?, onde?, motivo?: 'sem-save' | 'itens' | 'ja-tem' }
   Módulo 'vila-lojas': porteira(npc) (lojista com ação vilaLoja → UI.perguntaVila) e a ação vilaLoja (abre a loja e
   resolve 'tchau': o lojista se despede). Nada novo no save. node: true: nada de DOM no carregamento. */
(function () {
  var R = window.Reino, U = R.util;
  var LOJAS = {
    casa: { id: 'casa', nome: 'Casa Bonita', familias: [], icone: '🏠' },
    armas: { id: 'armas', nome: 'Forja Brilhante', familias: ['espada'], icone: 'item:espada-madeira' },
    cabecas: { id: 'cabecas', nome: 'Elmos e Chapéus', familias: ['capacete', 'chapeu'], icone: 'item:chapeu-flor' },
    armaduras: { id: 'armaduras', nome: 'Armaduras e Botas', familias: ['armadura', 'botas'], icone: 'item:armadura-colete' },
  };
  var ONDE_VENDE = { mochila: 1, bau: 1 };

  function cfg() { return R.config.vila; }
  function P() { return R.Progresso; }
  function loja(id) { return Object.prototype.hasOwnProperty.call(LOJAS, id) ? LOJAS[id] : null; }
  function max() { return cfg().maxPorItem || 10; }

  /* ---------- o que cada loja vende e compra ---------- */
  function aVenda(id) {
    var l = loja(id);
    if (!l) return [];
    if (id === 'casa') {
      return (R.moveisCasa || []).filter(function (m) { return m.loja; })
        .map(function (m) { return { id: m.id, def: m, preco: cfg().precoDecor }; });
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
      // a peça conquistada pela letra cursiva não se vende
      if (ONDE_VENDE[p.onde] !== 1 || l.familias.indexOf(p.def.tipo) < 0 || p.def.cursiva) return;
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
  // a próxima chave livre 'loja:<id>:<n>' da casa
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
    var t = l.reduce(function (s, x) { return s + x.oferta.preco * x.qtd; }, 0);
    var saldo = Pr.estrelas();
    if (saldo < t) return { ok: false, motivo: 'saldo', total: t, falta: t - saldo };
    if (id === 'casa' && !(R.CasaMoveis && R.CasaMoveis.guardar)) return { ok: false, motivo: 'itens', total: t };
    if (id !== 'casa' && !(R.Itens && R.Itens.ganhar)) return { ok: false, motivo: 'itens', total: t };
    if (!Pr.gastarEstrelas(t)) return { ok: false, motivo: 'saldo', total: t, falta: t - Pr.estrelas() };
    var ganhos = [];
    l.forEach(function (x) {
      for (var k = 0; k < x.qtd; k++) {
        if (id === 'casa') {
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

  /* ---------- as peças da letra cursiva (docs/contratos/cursiva.md §6) ---------- */
  function conquistas(id) {
    var C = R.ItensCatalogo, It = R.Itens, vivas = {};
    if (!loja(id) || !C) return [];
    if (It && P() && P().estado()) It.pecas().forEach(function (p) { vivas[p.id] = true; });
    return C.todos().filter(function (d) { return d.cursiva === true && d.loja === id; })
      .map(function (d) { return { id: d.id, def: d, tem: vivas[d.id] === true }; });
  }
  function frasesPorPeca() { return Math.max(1, Math.floor((R.config.cursiva || {}).frasesPorPeca) || 5); }
  // uma de cada: quem já tem a peça viva não ganha outra (as frases ficam para quando ela não tiver mais)
  function conquistar(id, pecaId) {
    var Pr = P();
    if (!Pr || !Pr.estado()) return { ok: false, motivo: 'sem-save', id: pecaId };
    var o = conquistas(id).filter(function (c) { return c.id === pecaId; })[0];
    if (!o || !(R.Itens && R.Itens.ganhar)) return { ok: false, motivo: 'itens', id: pecaId };
    if (o.tem) return { ok: false, motivo: 'ja-tem', id: pecaId };
    var g = R.Itens.ganhar(pecaId);
    if (!g) return { ok: false, motivo: 'itens', id: pecaId };
    avisar();
    return { ok: true, id: pecaId, uid: g.uid, onde: g.onde };
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
    totalVenda: totalVenda, comprar: comprar, vender: vender, perguntas: perguntas, pergunta: pergunta,
    conquistas: conquistas, frasesPorPeca: frasesPorPeca, conquistar: conquistar };

  R.registrarModulo({
    id: 'vila-lojas',
    acoes: { vilaLoja: vilaLoja },
    porteira: porteira,
    depurar: function () {
      var r = { perguntas: perguntas().length, aVenda: {}, compraveis: {}, conquistas: {} };
      Object.keys(LOJAS).forEach(function (k) {
        r.aVenda[k] = aVenda(k).length;
        r.conquistas[k] = conquistas(k).map(function (c) { return c.id + (c.tem ? ':tem' : ''); });
        if (P() && P().estado()) r.compraveis[k] = compraveis(k).reduce(function (s, g) { return s + g.uids.length; }, 0);
      });
      return r;
    },
  });
})();
