/* As 4 lojas da Cidade Nova (docs/contratos/cidade-nova.md): a lista do que cada uma vende e
   aceita de volta, os preços em estrelas, o carrinho de VÁRIOS itens por vez, a entrada com a
   pergunta sorteada do 4º bimestre (Reino.Bosque.perguntaDoBimestre) e a ação `lojaCidade` dos
   NPCs. Compra de decoração vai para a CasaMoveis (chave `loja:<id>:<n>`); equipamento vai para
   a Mochila/Baú de Guardados (Reino.Itens). Nada de DOM no carregamento (node: true). */
(function () {
  var R = window.Reino, P = R.Progresso, U = R.util;
  var CFG = (R.config && R.config.lojaCidade) || {};

  var LOJAS = {
    casa: { id: 'casa', nome: 'Casa & Lar', emoji: '🏠', tipo: 'decor', tipos: [],
      desc: 'Móveis e enfeites para deixar a sua casa do seu jeito.' },
    armas: { id: 'armas', nome: 'Forja das Lâminas', emoji: '🪓', tipo: 'equip', tipos: ['espada'],
      desc: 'Armas novas para a aventura. Também compramos as suas armas usadas.' },
    cabecas: { id: 'cabecas', nome: 'Elmos & Chapéus', emoji: '👑', tipo: 'equip', tipos: ['capacete', 'chapeu'],
      desc: 'Capacetes que protegem e chapéus que dão sorte. Compramos os seus também.' },
    armaduras: { id: 'armaduras', nome: 'Armaduras & Botas', emoji: '🛡️', tipo: 'equip', tipos: ['armadura', 'botas'],
      desc: 'Armaduras e botas para a batalha. Aceitamos as suas peças usadas.' },
  };

  function precoDecor() { return CFG.precoDecor || 30; }
  function maxPorItem() { return CFG.maxPorItem || 20; }
  function def(id) { return R.ItensCatalogo && R.ItensCatalogo.def(id); }

  // a lista de compra: equipamentos com `loja` igual ao id, ou os 50 móveis da decoração
  function compra(lojaId) {
    if (lojaId === 'casa') {
      return (R.LOJA_DECOR_ITENS || []).map(function (m) {
        var movel = R.movelCasa ? R.movelCasa(m.id) : null;
        return { id: m.id, nome: m.nome, preco: precoDecor(), tipo: 'movel', objeto: (movel && movel.objeto) || m.objeto, comodo: m.comodo };
      });
    }
    return R.ItensCatalogo.todos().filter(function (d) { return d.loja === lojaId; });
  }

  // preço de venda: os itens da loja já trazem `venda`; os que caem de monstro, pela raridade
  function precoVenda(d) {
    if (!d) return 0;
    if (typeof d.venda === 'number' && d.venda > 0) return Math.floor(d.venda);
    if (typeof d.preco === 'number' && d.preco > 0) return Math.max(1, Math.floor(d.preco / 2));
    var tab = CFG.vendaPorRaridade || { comum: 8, raro: 16, epico: 28, lendario: 45 };
    return tab[d.raridade] || 5;
  }

  // o que a loja aceita de volta: as famílias de equipamento dela
  function aceita(lojaId, d) {
    var l = LOJAS[lojaId];
    return !!(l && l.tipo === 'equip' && d && l.tipos.indexOf(d.tipo) >= 0);
  }

  // os itens que ela tem na mochila/baú e a loja compra, agrupados por id
  function itensVendaveis(lojaId) {
    var I = R.Itens;
    if (!I || !LOJAS[lojaId] || LOJAS[lojaId].tipo !== 'equip') return [];
    var porId = {};
    function somar(lista) {
      (lista || []).forEach(function (g) {
        if (!aceita(lojaId, g.def)) return;
        var x = porId[g.id];
        if (!x) x = porId[g.id] = { id: g.id, def: g.def, qtd: 0, uids: [] };
        x.qtd += g.qtd; x.uids = x.uids.concat(g.uids || []);
      });
    }
    somar(I.mochila());
    somar(I.bau());
    return Object.keys(porId).map(function (k) { return porId[k]; });
  }

  // preço de compra de um item da loja (unidade)
  function preco(lojaId, id) {
    var d = compra(lojaId).filter(function (x) { return x.id === id; })[0];
    return d ? d.preco : 0;
  }

  function totalDe(lojaId, itens) {
    var t = 0;
    (itens || []).forEach(function (x) { t += preco(lojaId, x.id) * Math.max(0, Math.floor(x.qtd || 0)); });
    return t;
  }

  function itemDe(lojaId, id) { return compra(lojaId).filter(function (x) { return x.id === id; })[0] || null; }

  /* ---------- comprar vários de uma vez ---------- */
  function comprar(lojaId, itens) {
    var l = LOJAS[lojaId];
    if (!l) return { ok: false, motivo: 'loja' };
    var pedido = [];
    for (var i = 0; i < (itens || []).length; i++) {
      var x = itens[i], q = Math.floor(x && x.qtd), item = itemDe(lojaId, x && x.id);
      if (!item || !(q > 0)) return { ok: false, motivo: 'item' };
      if (q > maxPorItem()) return { ok: false, motivo: 'limite', max: maxPorItem() };
      pedido.push({ item: item, qtd: q });
    }
    if (!pedido.length) return { ok: false, motivo: 'vazio' };
    var total = totalDe(lojaId, pedido.map(function (p) { return { id: p.item.id, qtd: p.qtd }; }));
    if (P.estrelas() < total) return { ok: false, motivo: 'estrelas', falta: total - P.estrelas(), total: total };
    if (!P.gastarEstrelas(total)) return { ok: false, motivo: 'estrelas', falta: 1, total: total };
    var entregues = 0;
    pedido.forEach(function (p) {
      for (var k = 0; k < p.qtd; k++) {
        if (l.tipo === 'decor') {
          var CM = R.CasaMoveis;
          if (CM && CM.guardar) {
            var e = P.estado(), c = (e && e.casaMoveis) || {}, n = 1;
            while (c['loja:' + p.item.id + ':' + n]) n++;
            if (CM.guardar('loja:' + p.item.id + ':' + n, p.item.id)) entregues++;
          }
        } else {
          var r = R.Itens && R.Itens.ganhar(p.item.id);
          if (r) entregues++;
        }
      }
    });
    P.salvar();
    U.emit(R.EVENTOS.MAPA_MUDOU);
    return { ok: true, total: total, entregues: entregues, estrelas: P.estrelas() };
  }

  /* ---------- vender vários de uma vez (uids) ---------- */
  function vender(lojaId, uids) {
    var I = R.Itens;
    if (!I || !LOJAS[lojaId] || LOJAS[lojaId].tipo !== 'equip') return { ok: false, motivo: 'loja' };
    var pecas = I.pecas(), porUid = {}, total = 0, lista = [];
    (uids || []).forEach(function (uid) {
      if (porUid[uid]) return;
      var p = pecas.filter(function (x) { return x.uid === uid; })[0];
      if (!p || (p.onde !== 'mochila' && p.onde !== 'bau') || !aceita(lojaId, p.def)) return;
      porUid[uid] = true; lista.push(uid); total += precoVenda(p.def);
    });
    if (!lista.length) return { ok: false, motivo: 'vazio' };
    I.jogarFora(lista);
    P.ganharEstrelas(total);
    P.salvar();
    U.emit(R.EVENTOS.MAPA_MUDOU);
    return { ok: true, total: total, itens: lista.length, estrelas: P.estrelas() };
  }

  function pergunta() {
    if (R.Bosque && R.Bosque.perguntaDoBimestre) return R.Bosque.perguntaDoBimestre(CFG.bimestre || 4);
    return null;
  }

  // ação do NPC da loja: primeiro a pergunta do 4º bimestre, depois a tela da loja
  function abrir(lojaId) {
    var l = LOJAS[lojaId], UI = R.UI;
    if (!l || !UI) return Promise.resolve(false);
    var q = pergunta();
    var gate = UI.perguntaLoja ? UI.perguntaLoja(l, q) : Promise.resolve(true);
    return gate.then(function (ok) {
      if (!ok) return false;
      return UI.telaLojaCidade ? UI.telaLojaCidade(lojaId) : false;
    });
  }

  R.LojaCidade = {
    LOJAS: LOJAS, loja: function (id) { return LOJAS[id] || null; },
    compra: compra, vende: itensVendaveis, itensVendaveis: itensVendaveis, aceita: aceita,
    preco: preco, precoVenda: precoVenda, totalDe: totalDe, itemDe: itemDe,
    comprar: comprar, vender: vender, pergunta: pergunta, abrir: abrir,
    maxPorItem: maxPorItem,
    // para os testes e a depuração
    resumo: function () {
      return { casa: compra('casa').length, armas: compra('armas').length, cabecas: compra('cabecas').length,
        armaduras: compra('armaduras').length, pergunta: !!pergunta() };
    },
  };

  R.registrarModulo({
    id: 'loja-cidade',
    acoes: {
      lojaCidade: function (acao) { return abrir(acao && acao.loja); },
      // entrar/sair de uma loja: a porta da Cidade Nova manda para o interior da loja; o tapete
      // de dentro volta para a frente da porta (chegar = onde ela aparece na Cidade Nova)
      entrarLoja: function (acao) {
        if (!acao || !R.Cena || !R.Cena.irPara) return Promise.resolve();
        R.Som.tocar('porta');
        return R.Cena.irPara(acao.interior, acao.chegar, { x: 0, y: -1 });
      },
      sairLoja: function (acao) {
        if (!acao || !R.Cena || !R.Cena.irPara) return Promise.resolve();
        R.Som.tocar('porta');
        return R.Cena.irPara('cidade-nova', acao.chegar, { x: 0, y: 1 });
      },
    },
  });
})();
