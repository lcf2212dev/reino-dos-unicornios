/* O que cai de um inimigo vencido numa arena (docs/contratos/itens.md §5): Reino.ItensDrop.
   Ouve EVENTOS.BOSQUE 'vencido' ({ id, fantasma, arena }) e, na hora:
   1. chance do tipo do inimigo (config.itens.drop.chance; a mosca vale como voador) × (1 + Sorte vestida), até chanceMax;
   2. caiu: sorteia a categoria (equip, pocao, comida, estrelas) pelos pesos do config;
   3. equip: os equipamentos da arena, com o peso da raridade × `repetido` para o que ela já tem vivo; poção e comidinha:
      as da arena, pelo `peso`; estrelas: n entre o [min, max] da arena. Categoria sem item na arena = estrelas.
   O item é gravado na hora (Itens.ganhar: mochila, ou baú se não couber) e as estrelas também (P.ganharEstrelas +
   P.salvar): fechar o jogo logo depois não perde nada; o que aparece no chão é só a animação (sistemas/itens-chao.js).
   Sem pressa: a chance é por inimigo vencido, nunca por tempo. Sorteios por Itens.rolar (modo congelado estável, com as
   chaves 'itens:drop', 'itens:categoria', 'itens:qual', 'itens:estrelas'). node: true: nada de DOM no carregamento. */
(function () {
  var R = window.Reino, U = R.util, P = R.Progresso, EV = R.EVENTOS;
  function cfg() { return R.config.itens.drop; }
  function tem(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); }

  /** chance (0 a 1) de um inimigo do tipo deixar cair alguma coisa (tipo desconhecido vale como fácil) */
  function chance(arena, tipo) {
    var c = cfg().chance, base = tem(c, tipo) ? c[tipo] : tipo === 'mosca' && tem(c, 'voador') ? c.voador : c.facil;
    var sorte = R.Itens ? R.Itens.bonus().sorte : 0;
    return Math.max(0, Math.min(cfg().chanceMax, (base || 0) * (1 + Math.max(0, sorte || 0))));
  }
  // um da lista pelo peso (null se nenhum tem peso)
  function porPeso(lista, peso, chave) {
    var total = 0;
    lista.forEach(function (x) { total += Math.max(0, peso(x) || 0); });
    if (!(total > 0)) return null;
    var r = R.Itens.rolar(chave) * total;
    for (var i = 0; i < lista.length; i++) {
      r -= Math.max(0, peso(lista[i]) || 0);
      if (r < 0) return lista[i];
    }
    return lista[lista.length - 1];
  }
  /** sorteia o que cai: { item: id } | { estrelas: n } | null (não caiu nada). Não grava */
  function rolar(arena, tipo) {
    var c = cfg(), Cat = R.ItensCatalogo;
    if (R.Itens.rolar('itens:drop') >= chance(arena, tipo)) return null;
    var cat = porPeso(Object.keys(c.categorias), function (k) { return c.categorias[k]; }, 'itens:categoria'), d = null;
    if (cat === 'equip') {
      var vivos = {};
      R.Itens.pecas().forEach(function (p) { vivos[p.id] = true; });
      d = porPeso(Cat.daArena(arena, 'equip'), function (x) {
        return (c.raridade[x.raridade] || 0) * (vivos[x.id] ? c.repetido : 1);
      }, 'itens:qual');
    } else if (cat === 'pocao' || cat === 'comida') {
      d = porPeso(Cat.daArena(arena, cat), function (x) { return x.peso; }, 'itens:qual');
    }
    if (d) return { item: d.id };
    var f = (tem(c.estrelas, arena) && c.estrelas[arena]) || [1, 1], min = Math.max(1, f[0] | 0), max = Math.max(min, f[1] | 0);
    return { estrelas: min + Math.min(max - min, Math.floor(R.Itens.rolar('itens:estrelas') * (max - min + 1))) };
  }
  // onde o inimigo sumiu (px do jogo); sem ele, os pés dela
  function posicao(id) {
    var f = R.BosqueCombate && R.BosqueCombate.fantasmas ? R.BosqueCombate.fantasmas().find(function (x) { return x.id === id; }) : null;
    if (f) return { x: f.x, y: f.y };
    var J = window.Jogador;
    return J && typeof J.x === 'number' ? { x: J.x, y: J.y } : { x: null, y: null };
  }
  /** um inimigo foi vencido (a carga do 'vencido'): sorteia, grava e avisa. → { item, uid, onde } | { estrelas } | null */
  function aoVencer(carga) {
    if (!carga || !P.estado() || !R.Itens || !R.ItensCatalogo) return null;
    var arena = carga.arena || (R.Bosque && R.Bosque.arenaAtual && R.Bosque.arenaAtual()) || 'bosque';
    var r = rolar(arena, carga.fantasma);
    if (!r) return null;
    var pos = posicao(carga.id);
    if (r.item) {
      var g = R.Itens.ganhar(r.item, { arena: arena, x: pos.x, y: pos.y });
      return g ? { item: r.item, uid: g.uid, onde: g.onde } : null;
    }
    P.ganharEstrelas(r.estrelas);
    P.salvar();
    U.emit(EV.ITENS, { tipo: 'estrelas', n: r.estrelas, arena: arena, x: pos.x, y: pos.y });
    return { estrelas: r.estrelas };
  }

  U.on(EV.BOSQUE, function (c) { if (c && c.tipo === 'vencido') aoVencer(c); });

  R.ItensDrop = { chance: chance, rolar: rolar, aoVencer: aoVencer };

  R.registrarModulo({
    id: 'itens-drop',
    depurar: function () {
      var a = (R.Bosque && R.Bosque.arenaAtual && R.Bosque.arenaAtual()) || 'bosque';
      return { arena: a, chance: { facil: chance(a, 'facil'), medio: chance(a, 'medio'), dificil: chance(a, 'dificil'), voador: chance(a, 'voador') } };
    },
  });
})();
