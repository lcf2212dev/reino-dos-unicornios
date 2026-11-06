/* Os 50 móveis da Loja de Decoração da Cidade Nova (docs/contratos/cidade-nova.md): cada um é uma
   variante de um objeto que já existe, com a cor/var fixa de conteudo/casa/loja-decoracao.js.
   Registra `loja-movel-<id>` na biblioteca do motor; os dados (Reino.LOJA_DECOR_ITENS) vêm do
   grupo conteudo, que carrega antes. Nada de DOM no carregamento. */
(function () {
  var R = window.Reino, I = R.Interiores;
  if (!I || !R.LOJA_DECOR_ITENS) return;
  R.LOJA_DECOR_ITENS.forEach(function (m) {
    var base = I.OBJETOS[m.base];
    if (!base || !base.desenhar) return;
    var def = Object.assign({}, base);
    function comVar(o) { return Object.assign({}, o || {}, { var: Object.assign({}, (o && o.var) || {}, m.var || {}) }); }
    // recorta no espaço do objeto (a pegada + o topo): o desenho genérico não vaza para o vizinho
    def.desenhar = function (ctx, px, py, o, P) {
      var oo = comVar(o), w = (oo.w || def.w || 1) * 16, h = (oo.h || def.h || 1) * 16, topo = def.topo || 0;
      ctx.save();
      ctx.beginPath(); ctx.rect(px, py - topo, w, h + topo); ctx.clip();
      try { return base.desenhar(ctx, px, py, oo, P); } finally { ctx.restore(); }
    };
    if (base.anim) def.anim = function (ctx, px, py, t, o) { return base.anim(ctx, px, py, t, comVar(o)); };
    I.objeto('loja-movel-' + m.id, def);
  });
})();
