/* Casa do jogador, parte 0 (contrato): o desenho de um móvel nas 4 direções (docs/contratos/casa.md §5).
   Reino.CasaArte.virado({ baixo, cima?, lado? }) devolve o `desenhar(ctx, px, py, obj, P)` de um objeto da
   biblioteca. obj.dir escolhe o lado: 'baixo' (padrão) e 'cima' usam baixo/cima; 'esq' usa `lado` (o móvel
   virado para a esquerda); 'dir' é o `lado` espelhado. Nas direções de lado a pegada já chega trocada (obj.w ↔ obj.h,
   feito por sistemas/casa.js). Sem `cima`, vale `baixo`; sem `lado`, vale `baixo`.
   Reino.CasaArte.objeto(id, def, est) registra o móvel com o estado ligado (casa-usos, casa.md §13).
   Reino.CasaArte.sempre({ baixo, cima?, lado?, junto? }, hoje?) devolve o `anim` do movimento de sempre (casa.md §13.7:
   água, peixes, pêndulo, brilho), que roda sem tocar, ligado ou não. Nada de DOM no carregamento. */
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

  /* Estado ligado/aberto (casa-usos): pincel em px da pegada, espelhado em 'dir'; só fillRect (vale nos móveis altos). */
  function pincelDe(ctx, px, py, obj) {
    var D = R.Desenho, K = D.K, W = ((obj && obj.w) || 1) * T, esp = !!obj && obj.dir === 'dir';
    var p = {
      W: W, H: ((obj && obj.h) || 1) * T,
      r: function (x, y, w, h, c) { D.ret(ctx, px + (esp ? W - x - w : x), py + y, w, h, c); },
      caixa: function (x, y, w, h, c) {
        p.r(x, y, w, h, K); p.r(x + 1, y + 1, w - 2, h - 2, c);
        p.r(x + 1, y + 1, w - 2, 1, D.clarear(c, 0.4)); p.r(x + 1, y + 2, 1, h - 3, D.clarear(c, 0.2));
        p.r(x + 2, y + h - 2, w - 3, 1, D.escurecer(c, 0.2));
      },
      m: function (x, y, linhas, pal) {
        for (var j = 0; j < linhas.length; j++) for (var i = 0; i < linhas[j].length; i++) {
          var c = pal[linhas[j][i]]; if (c) p.r(x + i, y + j, 1, 1, c);
        }
      },
    };
    return p;
  }
  function ligado(obj) { return !!(R.CasaUsos && R.CasaUsos.ligado(obj)); }
  function porDir(tabela, obj) {
    var dir = (obj && obj.dir) || 'baixo';
    return dir === 'cima' ? (tabela.cima || tabela.baixo) : (dir === 'esq' || dir === 'dir') ? (tabela.lado || tabela.baixo) : tabela.baixo;
  }
  /** Registra o objeto com o estado ligado: est = { baixo, cima?, lado?: f(p) } desenhado POR CIMA do desenho de
      hoje quando Reino.CasaUsos.ligado(obj); est.anim = { baixo, cima?, lado?: f(p, t) } só roda ligado (depois do
      anim que o objeto já tenha). Desligado ou sem uid = o desenho de hoje, intacto. */
  function objeto(id, def, est) {
    var base = def.desenhar, orig = def.anim, anim = est.anim;
    def.desenhar = function (ctx, px, py, obj, P) {
      base(ctx, px, py, obj, P);
      var f = ligado(obj) && porDir(est, obj);
      if (f) f(pincelDe(ctx, px, py, obj));
    };
    if (anim || orig) def.anim = function (ctx, px, py, t, obj) {
      if (orig) orig(ctx, px, py, t, obj);
      if (!anim || !ligado(obj)) return;   // desligado: sai na hora, sem montar pincel
      var f = porDir(anim, obj);
      if (f) f(pincelDe(ctx, px, py, obj), t);
    };
    return R.Interiores.objeto(id, def);
  }

  /** Movimento de sempre: d = { baixo, cima?, lado?: f(p, t, obj) }; p = pincel com r(x, y, w, h, c) e m(x, y, linhas, pal)
      em px da pegada, espelhado em 'dir', só fillRect (vale nos móveis altos). É um só, reaproveitado (anim não se
      aninha): nada se monta por quadro. t = 0 (Animações desligadas, movimento reduzido, e2e) é a pose parada: f desenha
      só a parte que o `desenhar` deixa de fora quando a peça tem uid (pêndulo, peixes, patinho), na pose de sempre;
      gotas, bolhas e brilhos só com t > 0 (saia antes, sem pintar). hoje?: o anim de hoje (só desenha ligado); ligado,
      ele roda no lugar deste (com d.junto, os dois). Sem hoje, o de sempre roda ligado também. */
  var PS = { ctx: null, px: 0, py: 0, W: T, esp: false,
    r: function (x, y, w, h, c) { R.Desenho.ret(PS.ctx, PS.px + (PS.esp ? PS.W - x - w : x), PS.py + y, w, h, c); },
    m: function (x, y, linhas, pal) {
      for (var j = 0; j < linhas.length; j++) for (var i = 0; i < linhas[j].length; i++) {
        var c = pal[linhas[j][i]]; if (c) PS.r(x + i, y + j, 1, 1, c);
      }
    },
  };
  function sempre(d, hoje) {
    return function (ctx, px, py, t, obj) {
      if (hoje && ligado(obj)) {
        hoje(ctx, px, py, t, obj);
        if (!d.junto) return;
      }
      var f = porDir(d, obj);
      if (!f) return;
      PS.ctx = ctx; PS.px = px; PS.py = py; PS.W = ((obj && obj.w) || 1) * T; PS.esp = !!obj && obj.dir === 'dir';
      f(PS, t, obj);
      PS.ctx = null;   // não segura o canvas de ninguém
    };
  }

  R.CasaArte = { virado: virado, objeto: objeto, sempre: sempre };
})();
