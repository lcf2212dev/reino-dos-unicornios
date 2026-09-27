/* Loja das Fadas, parte 1 de 3: cores, o que a loja deriva do save (comprados, estado dos prêmios)
   e os desenhos pequenos dos objetos (etiquetas de preço, selos, o reflexo do espelho mágico).
   O que as outras partes usam fica em Reino._predios.loja (ver o fim do arquivo). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.loja) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  // o que as partes do prédio compartilham (criado aqui; cada parte põe o seu no fim do arquivo)
  var S = (R._predios = R._predios || {}).loja = {};
  var LILAS = '#c9a8ff', LILAS2 = '#9b6bd6', MUSGO = '#7fa84a', MUSGO2 = '#5e8a36', ROSA = '#ff9cc6';

  // a lista única da Loja (js/conteudo/loja-itens.js): os mesmos enfeites e prêmios da tela da Loja
  function enfeites() { return (R.LojaItens && R.LojaItens.ENFEITES) || []; }

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  var brilho = R.Desenho.brilho;   // brilho em cruz (aqui sempre com a cor)
  function est(P) { try { return P && P.estado ? P.estado() : null; } catch (e) { return null; } }
  function comprados(P) { var e = est(P); return (e && e.loja) || {}; }
  function premios() { try { return R.LojaItens ? R.LojaItens.premios() : []; } catch (e) { return []; } }
  // 'bloqueado' | 'aVenda' | 'ganho' | 'comprado' (derivado do save, como na tela da Loja)
  function estadoPremio(a, P) { try { return R.LojaItens.estadoPremio(a, P); } catch (e) { return 'bloqueado'; } }
  function icone(chave) { return (window.PA && PA.iconeDesenho) ? PA.iconeDesenho(chave) : null; }
  // desenha um canvas cabendo numa caixa (sem suavizar), com a base encostada embaixo
  function caber(ctx, img, cx, base, maxW, maxH) {
    img = img && (img.canvas || img);
    if (!img) return;
    var s = Math.min(1, maxW / img.width, maxH / img.height);
    var w = Math.round(img.width * s), h = Math.round(img.height * s);
    var lig = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, Math.round(cx - w / 2), base - h, w, h);
    ctx.imageSmoothingEnabled = lig;
  }
  // estrelinha de etiqueta (5×5)
  function estrelinha(ctx, x, y, c) {
    ret(ctx, x + 2, y, 1, 5, c); ret(ctx, x, y + 2, 5, 1, c); ret(ctx, x + 1, y + 1, 3, 3, c);
  }
  // algarismos 3×5 para as etiquetas de preço
  var DIGITOS = {
    0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'],
    3: ['111', '001', '111', '001', '111'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'],
    6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'], 8: ['111', '101', '111', '101', '111'],
    9: ['111', '101', '111', '001', '111'],
  };
  function numero(ctx, x, y, n, cor) {
    String(n).split('').forEach(function (d, i) {
      (DIGITOS[d] || []).forEach(function (l, j) {
        for (var k = 0; k < 3; k++) if (l[k] === '1') ret(ctx, x + i * 4 + k, y + j, 1, 1, cor);
      });
    });
  }
  // etiqueta de preço (creme, com o número): canto de baixo à direita em (x, y)
  // (contorno de 1 px e 1 px de margem creme em volta dos algarismos: 11×9 para dois algarismos)
  function etiquetaPreco(ctx, x, y, n) {
    var w = larguraEtiqueta(n);
    ret(ctx, x, y, w, 9, K); ret(ctx, x + 1, y + 1, w - 2, 7, C.creme);
    numero(ctx, x + 2, y + 2, n, K);
  }
  function larguraEtiqueta(n) { return String(n).length * 4 + 3; }
  // moedinha de estrela (5×5, a mesma da vitrine dos enfeites) centrada em cx: "à venda" onde a etiqueta não cabe
  function moedinha(ctx, cx, y) {
    ret(ctx, cx - 2, y, 5, 5, K); ret(ctx, cx - 1, y + 1, 3, 3, C.ouro2); ret(ctx, cx, y + 2, 1, 1, C.ouro3);
  }
  // cadeado pequeno (prêmio que ainda não dá para comprar)
  function cadeado(ctx, x, y) {
    ret(ctx, x + 1, y, 3, 1, K); ret(ctx, x, y + 1, 1, 2, K); ret(ctx, x + 4, y + 1, 1, 2, K);
    ret(ctx, x - 1, y + 3, 7, 5, K); ret(ctx, x, y + 4, 5, 3, C.ouro); ret(ctx, x + 2, y + 5, 1, 1, K);
  }
  // medalha de fita arco-íris: ganho na prova
  function medalha(ctx, x, y) {
    ret(ctx, x, y, 3, 4, K); ret(ctx, x + 4, y, 3, 4, K);
    ret(ctx, x + 1, y, 1, 3, '#ff7eb6'); ret(ctx, x + 5, y, 1, 3, '#5fb4ff');
    ret(ctx, x + 1, y + 3, 5, 5, K); ret(ctx, x + 2, y + 4, 3, 3, C.ouro); ret(ctx, x + 2, y + 4, 1, 1, C.ouro3);
  }
  // lacinho rosa de "é seu"
  function lacinho(ctx, x, y) {
    ret(ctx, x, y, 3, 3, K); ret(ctx, x + 4, y, 3, 3, K); ret(ctx, x + 2, y + 1, 3, 3, K);
    ret(ctx, x + 1, y + 1, 1, 1, '#ff7eb6'); ret(ctx, x + 5, y + 1, 1, 1, '#ff7eb6'); ret(ctx, x + 3, y + 2, 1, 1, '#ffc2d8');
  }
  // o que o espelho mostra: montaria, estágio e enfeites em uso
  function espelhoInfo(P) {
    var e = est(P);
    if (!e || !P.montaria) return null;
    var id = P.montaria(), d = id && P.defUni ? P.defUni(id) : null;
    if (!d) return null;
    var u = e.unis && e.unis[id];
    var estagio = R.Unicornios.estagio(u ? u.xp : 0);
    var us = e.usando || {};
    var enf = (us.enfeites || []).slice();
    // o reflexo mostra o unicórnio de frente, que é onde aparecem os enfeites da cabeça (o chapéu de chef, a pena...).
    // De frente a cauda não aparece: com enfeite de cauda, na diagonal
    var cauda = enf.some(function (id) { var it = R.LojaItens && R.LojaItens.item ? R.LojaItens.item(id) : null; return it && it.slot === 'cauda'; });
    return { id: id, def: d, estagio: estagio, enfeites: enf, capa: !!us.capa, asasFada: !!us.asasFada, aparencia: e.aparencia,
      vista: cauda ? 'diagFrente' : 'frente' };
  }

  // Monta o reflexo do espelho (o vidro é a elipse de raios 26×25 com centro em (cx, top + 30)):
  // o unicórnio em dobro onde os enfeites fiquem inteiros dentro do vidro (e a cabeça de preferência inteira)
  // e a Mariana (tamanho normal) num lugar que não cubra nenhum enfeite; se não houver, ela fica atrás dele.
  // Só roda quando muda o que o espelho mostra (a chave do objeto).
  function cenaEspelho(m, cx, top) {
    var sprU = PA.unicornio(m.def, m.estagio, 0, { enfeites: m.enfeites, asasFada: m.asasFada, vista: m.vista });
    var sprB = PA.unicornio(m.def, m.estagio, 0, { vista: m.vista });
    var uImg = sprU.canvas || sprU, bImg = sprB.canvas || sprB, W = uImg.width, H = uImg.height;
    var du = uImg.getContext('2d').getImageData(0, 0, W, H).data;
    var db = (bImg.width === W && bImg.height === H) ? bImg.getContext('2d').getImageData(0, 0, W, H).data : null;
    // pixels do unicórnio: os dos enfeites (o que muda em relação a ele sem enfeite) e os do corpo
    var enf = [], corpo = [];
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var i = (y * W + x) * 4;
      if (du[i + 3] === 0 && !(db && db[i + 3] > 0)) continue;
      var igual = db && du[i] === db[i] && du[i + 1] === db[i + 1] && du[i + 2] === db[i + 2] && du[i + 3] === db[i + 3];
      (igual ? corpo : enf).push(x, y);
    }
    function noVidro(x, y) { var a = (x + 0.5 - cx) / 26, b = (y + 0.5 - top - 30) / 25; return a * a + b * b <= 1; }
    // conta os pixels (em dobro) de uma lista que ficam fora do vidro com o unicórnio em (ux, uy)
    function fora(lista, ux, uy, pesoCima) {
      var n = 0;
      for (var k = 0; k < lista.length; k += 2) {
        var px = ux + lista[k] * 2, py = uy + lista[k + 1] * 2, f = 0;
        if (!noVidro(px, py)) f++; if (!noVidro(px + 1, py)) f++; if (!noVidro(px, py + 1)) f++; if (!noVidro(px + 1, py + 1)) f++;
        n += f * (pesoCima && lista[k + 1] < H / 2 ? pesoCima : 1);
      }
      return n;
    }
    // posição do unicórnio: nenhum enfeite cortado; depois a cabeça (metade de cima) e o resto; empate: mais perto do meio
    var melhor = null, x0 = cx - W, yMin = top + 2, yMax = Math.max(yMin, top + 52 - H * 2);
    for (var dx = -6; dx <= 6; dx++) for (var uy = yMin; uy <= yMax; uy++) {
      var ux = x0 + dx;
      var nota = fora(enf, ux, uy) * 1000 + fora(corpo, ux, uy, 4) + Math.abs(dx) * 0.1 + (yMax - uy) * 0.01;
      if (!melhor || nota < melhor.nota) melhor = { nota: nota, x: ux, y: uy };
    }
    var cena = { uni: { img: uImg, x: melhor.x, y: melhor.y }, mariana: null, atras: false };
    var spr = PA.mariana(m.aparencia, false, 1, { capa: m.capa, vista: 'frente' });
    var mImg = spr && (spr.canvas || spr);
    if (!mImg) return cena;
    var mw = mImg.width, mh = mImg.height, dm = mImg.getContext('2d').getImageData(0, 0, mw, mh).data;
    // o que o unicórnio ocupa na cena (em dobro): 2 = enfeite, 1 = cabeça (até o focinho), 0 = resto do corpo
    var ocupa = {};
    function marcar(lista, tipo) {
      for (var k = 0; k < lista.length; k += 2) {
        var ex = melhor.x + lista[k] * 2, ey = melhor.y + lista[k + 1] * 2, t = tipo || (lista[k + 1] < H * 0.62 ? 1 : 0);
        ocupa[ex + ',' + ey] = ocupa[(ex + 1) + ',' + ey] = ocupa[ex + ',' + (ey + 1)] = ocupa[(ex + 1) + ',' + (ey + 1)] = t;
      }
    }
    marcar(corpo, 0); marcar(enf, 2);
    // lugares para ela, de pé na grama (na ordem de preferência: à direita, à esquerda, mais para o meio),
    // na frente dele (sem cobrir enfeite nem a cabeça) ou, se não der, atrás (aparecendo o máximo possível)
    var escolhido = null;
    [cx + 23 - mw, cx + 21 - mw, cx + 19 - mw, cx - 22, cx - 20, cx - 18, cx + 4, cx - 9].forEach(function (lx, ordem) {
      [top + 47, top + 49, top + 45, top + 51].forEach(function (pe) {
        var ly = pe - mh, enfeite = 0, cabeca = 0, corpoCob = 0, cortado = 0, total = 0;
        for (var y = 0; y < mh; y++) for (var x = 0; x < mw; x++) {
          if (dm[(y * mw + x) * 4 + 3] === 0) continue;
          total++;
          if (!noVidro(lx + x, ly + y)) { cortado++; continue; }
          var t = ocupa[(lx + x) + ',' + (ly + y)];
          if (t === 2) enfeite++; else if (t === 1) cabeca++; else if (t === 0) corpoCob++;
        }
        var frente = enfeite * 1000 + cabeca * 20 + cortado * 10 + ordem;
        // atrás: o que o unicórnio tapa dela conta como cortado
        var atras = 60 + (enfeite + cabeca + corpoCob + cortado) * 10 + ordem;
        [[frente, false], [atras, true]].forEach(function (op) {
          if (!escolhido || op[0] < escolhido.nota) escolhido = { nota: op[0], x: lx, y: ly, atras: op[1] };
        });
      });
    });
    cena.mariana = { img: mImg, x: escolhido.x, y: escolhido.y };
    cena.atras = escolhido.atras;
    return cena;
  }

  // para as outras partes (R._predios.loja)
  S.LILAS = LILAS; S.LILAS2 = LILAS2; S.MUSGO = MUSGO; S.MUSGO2 = MUSGO2; S.ROSA = ROSA; S.enfeites = enfeites;
  S.v = v; S.brilho = brilho; S.comprados = comprados; S.premios = premios; S.estadoPremio = estadoPremio;
  S.icone = icone; S.caber = caber; S.estrelinha = estrelinha; S.etiquetaPreco = etiquetaPreco; S.cadeado = cadeado;
  S.larguraEtiqueta = larguraEtiqueta; S.moedinha = moedinha;
  S.medalha = medalha; S.lacinho = lacinho; S.espelhoInfo = espelhoInfo; S.cenaEspelho = cenaEspelho;
})();
