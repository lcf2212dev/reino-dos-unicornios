/* O desenho dos outros jogadores no mapa e nos interiores ("Jogar juntos"; docs/contratos/juntos.md §7).
   Quem desenha é a camada do módulo 'juntos' (sistemas/juntos.js): aqui entram na ordem por Y do quadro, como a
   Mariana e os NPCs, com o nome em cima e o balão do aceno/recado. A posição já vem suavizada (Reino.Juntos.atualizar).
   Sem animações (Ajustes, prefers-reduced-motion), o outro jogador aparece parado: nada de pulinho nem balanço. */
(function () {
  var R = window.Reino;
  var D = (R.JuntosDesenho = {});
  var PASSOS = [1, 0, 2, 0];   // os mesmos 4 quadros do andar da Mariana
  var PX_QUADRO = { montada: 12, aPe: 8 };   // os mesmos do jogador (personagens/jogador-desenho.js)
  var RECADOS = { oi: 'Oi!', vem: 'Vem cá!', legal: 'Que legal!', tchau: 'Até logo!' };
  var NOME_MAX = 16;   // letras no nome em cima da cabeça (o resto vira …)

  function num(k, padrao) { var c = (R.config && R.config.juntos) || {}; return typeof c[k] === 'number' ? c[k] : padrao; }
  function fonte() { return 'Press Start 2P'; }
  // o espelho do sprite (o mesmo de personagens/jogador-desenho.js): um canvas novo por desenho, guardado no cache
  var espelhos = new WeakMap();
  function espelho(c) {
    var e = espelhos.get(c);
    if (!e) { e = PA.espelhado(c); espelhos.set(c, e); }
    return e;
  }
  function cor(k, padrao) { return ((R.config && R.config.paleta) || {})[k] || padrao; }
  function aparencia(j) {
    var a = j.aparencia || {}, v = j.visual || {};
    return { pele: a.pele, cabelo: a.cabelo, roupa: a.roupa, laco: a.laco,
      corte: v.corte || null, modelo: v.modelo || null, semLaco: v.semLaco === true, sexo: j.sexo };
  }
  // o unicórnio montado que ele mandou (id só para o cache do desenho; as cores são as dele)
  function defDe(j) {
    if (!j.uni || !j.uni.cores) return null;
    var c = j.uni.cores, crina = (c.crina || []).join('-');
    // o id entra no cache do PA: sem as cores nele, trocar de unicórnio no mesmo estágio deixava a cor velha
    return { id: 'jog-' + j.login + '-' + c.corpo + '-' + crina + '-' + c.chifre, raridade: 'comum', cores: c };
  }
  function encurtar(s) { return s.length > NOME_MAX ? s.slice(0, NOME_MAX - 1) + '…' : s; }

  // caixa de pixel com borda (fundo e tinta do Reino), em px de aparelho
  function caixa(ctx, x, y, w, h, u, fundo, borda) {
    ctx.fillStyle = borda;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = fundo;
    ctx.fillRect(x + u, y + u, w - u * 2, h - u * 2);
  }

  /* ---------- um jogador ---------- */
  function desenharUm(pintor, j, t, animar) {
    var Jg = window.Jogador;
    var vista = PA.vistaDaDirecao(j.olharX, j.olharY);
    var ap = aparencia(j), def = defDe(j);
    var px = def ? PX_QUADRO.montada : PX_QUADRO.aPe;
    var spr = def ? PA.montada(def, j.uni.estagio, (animar && j.andando) ? PASSOS[Math.floor(j.dist / px) % 4] : 0, ap, { vista: vista.vista })
      : PA.mariana(ap, false, (animar && j.andando) ? PASSOS[Math.floor(j.dist / px) % 4] : 0, { vista: vista.vista });
    var largura = def ? (j.uni.estagio >= 2 ? 7 : 6) : 5;
    if (Jg && Jg.sombra) Jg.sombra(pintor, j.dx, j.dy, largura);
    pintor.sprite(vista.espelhar ? espelho(spr.canvas) : spr.canvas, j.dx, j.dy + 1);
    // balanço do aceno (com animações: um pulinho de 1 px, em degrau)
    var pulo = animar && j.aceno && performance.now() - j.aceno < num('acenoMs', 2000)
      ? Math.round(Math.abs(Math.sin(performance.now() / 120))) : 0;
    etiquetas(pintor, j, spr, pulo);
  }

  // nome, aceno e recado, em px de tela (como as placas dos cômodos): ficam nítidos e não entram no buffer do mundo
  function etiquetas(pintor, j, spr, pulo) {
    var ctx = pintor.ctx;
    if (!ctx) return;
    var dpr = pintor.dpr || 1, u = Math.max(1, Math.round(2 * dpr));
    var px = Math.round(((R.config.texto && R.config.texto.aux) || 12) * dpr);
    var cabeca = pintor.tela(j.dx, j.dy + 1 - spr.h + (spr.topoExtra || 0) - pulo);
    var antes = ctx.imageSmoothingEnabled, tex = ctx.textAlign, base = ctx.textBaseline, fonteAntes = ctx.font;
    ctx.imageSmoothingEnabled = true;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = px + 'px "' + fonte() + '"';
    ctx.textRendering = 'optimizeSpeed';
    function rotulo(texto, yBaixo, fundo, altura) {
      var w = Math.ceil(ctx.measureText(texto).width) + u * 8, h = altura || Math.round(px * 1.5) + u * 2;
      var x = Math.round(cabeca.x - w / 2), y = Math.round(yBaixo - h);
      caixa(ctx, x, y, w, h, u, fundo, cor('tinta', '#3a2446'));
      ctx.fillStyle = cor('tinta', '#3a2446');
      ctx.fillText(texto, Math.round(cabeca.x), y + h / 2 + u);
      return { x: x, y: y, w: w, h: h };
    }
    var nome = rotulo(encurtar(j.nome || j.login), cabeca.y - u, cor('papelQuente', '#fff1cc'));
    var agora = performance.now();
    // 👋 do aceno, em cima do nome (o desenho do ícone é o mesmo do botão do HUD)
    if (j.aceno && agora - j.aceno < num('acenoMs', 2000)) {
      var ic = window.PA && PA.iconeDesenho ? PA.iconeDesenho('👋') : null;
      if (ic) {
        var lado = ic.width * u;
        ctx.drawImage(ic, Math.round(cabeca.x - lado / 2), Math.round(nome.y - lado - u), lado, lado);
      }
    }
    // balão do recado, acima do nome (com a pontinha para baixo)
    var rec = RECADOS[j.recado];
    if (rec && j.recadoEm && agora - j.recadoEm < num('recadoMs', 4500)) {
      var b = rotulo(rec, nome.y - u, cor('papel', '#fff8ee'), Math.round(px * 1.6) + u * 3);
      ctx.fillStyle = cor('tinta', '#3a2446');
      ctx.fillRect(Math.round(cabeca.x - u), b.y + b.h, u * 2, u * 2);
      ctx.fillStyle = cor('papel', '#fff8ee');
      ctx.fillRect(Math.round(cabeca.x - u) + u, b.y + b.h, u, u);
    }
    ctx.imageSmoothingEnabled = antes; ctx.textAlign = tex; ctx.textBaseline = base; ctx.font = fonteAntes;
  }

  /* ---------- a camada do módulo ---------- */
  D.aparencia = aparencia;   // a tela "Quem está no reino" desenha o retrato com a mesma aparência do mapa
  function item(pintor, j, t, animar) { return { y: j.dy, desenhar: function () { desenharUm(pintor, j, t, animar); } }; }
  D.itensDesenho = function (pintor, t, animar) {
    var lista = R.Juntos.outros(), itens = [];
    for (var i = 0; i < lista.length; i++) itens.push(item(pintor, lista[i], t, animar));
    return itens;
  };
})();
