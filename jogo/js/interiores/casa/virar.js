/* Casa do jogador, parte 0 (contrato): o desenho de um móvel nas 4 direções (docs/contratos/casa.md §5).
   Reino.CasaArte.virado({ baixo, cima?, lado? }) devolve o `desenhar(ctx, px, py, obj, P)` de um objeto da
   biblioteca. obj.dir escolhe o lado: 'baixo' (padrão) e 'cima' usam baixo/cima; 'esq' usa `lado` (o móvel
   virado para a esquerda); 'dir' é o `lado` espelhado. Nas direções de lado a pegada já chega trocada (obj.w ↔ obj.h,
   feito por sistemas/casa.js). Sem `cima`, vale `baixo`; sem `lado`, vale `baixo`. Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var T = 16;

  /** @param {{ baixo: Function, cima?: Function, lado?: Function }} d */
  function virado(d) {
    return function (ctx, px, py, obj, P) {
      var dir = (obj && obj.dir) || 'baixo';
      if (dir === 'cima') return (d.cima || d.baixo)(ctx, px, py, obj, P);
      if (dir === 'esq') return (d.lado || d.baixo)(ctx, px, py, obj, P);
      if (dir === 'dir') {
        var w = ((obj && obj.w) || 1) * T;
        ctx.save();
        ctx.translate(px * 2 + w, 0);
        ctx.scale(-1, 1);
        (d.lado || d.baixo)(ctx, px, py, obj, P);
        ctx.restore();
        return;
      }
      return d.baixo(ctx, px, py, obj, P);
    };
  }

  R.CasaArte = { virado: virado };
})();
