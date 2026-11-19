/* Minha Casa, a Vila dos Lugares Famosos (interior `casa-lugares`; pedido de 19/11: "os lugares vão ficar em uma vila
   nova, não na garagem"; casa.md §2). Pelo portão da Garagem, céu aberto (a parede 'vila-colinas' e o fundo de
   árvores da Vila Arco-Íris), 12 lotes, um por lugar famoso (conteudo/casa/lugares.js, `loja: 'lugares'`): o lugar
   comprado no Mercado da Garagem aparece em pé no lote dele, o desenho da miniatura em escala 2 (pixels inteiros:
   um monumento do tamanho de uma casa); o que falta é um lote vazio com a plaquinha "?". Derivado da compra
   (CasaMoveis.qtd > 0), nada no save. Comprado, dá para entrar nele (pedido de 19/11): a porta na frente do lote (escada
   `portal` com `aberta`, o capacho e a seta só com ele comprado) ou o toque no lote ou no lugar levam ao interior
   'casa-lugar-<nome>' (casa/lugares-dentro.js), e a saída de lá volta para a frente do lote. Sem comprar, o toque
   mostra onde comprar, no aviso pequeno, só na tela. A avenida do meio, com a fonte e os bancos, e os caminhos entre
   as fileiras são corredores.
   Formato: docs/contratos/interiores.md §3. Confira com node jogo/ferramentas/validar/validar-interiores.js --so casa-lugares --detalhes. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = R.Desenho, K = D.K, C = D.C, ret = D.ret, escurecer = D.escurecer, clarear = D.clarear;
  var sorte = D.sorte;

  /* ---------- os lugares e os lotes ---------- */
  function lugares() { return (R.moveisCasa || []).filter(function (m) { return m.loja === 'lugares'; }); }
  function comprado(id) { var CM = R.CasaMoveis; try { return !!(CM && CM.qtd(id) > 0); } catch (e) { return false; } }
  // 4 colunas × 3 fileiras de lotes 4 × 2, com a avenida de 5 no meio (x 12 a 16)
  var COLS = [2, 7, 17, 22], FILAS = [5, 10, 15];
  function lote(i) { return { x: COLS[i % 4], y: FILAS[Math.floor(i / 4)] }; }
  // a porta de cada lote (pedido de 19/11, "permitir entrar nos lugares"): logo na frente dele, do lado da avenida; leva
  // para dentro do lugar (casa/lugares-dentro.js), só com ele comprado. O interior: 'lugar-x' → 'casa-lugar-x'
  function porta(i) { var l = lote(i); return { x: l.x + (l.x < 12 ? 2 : 1), y: l.y + 2 }; }
  function dentro(id) { return 'casa-lugar-' + String(id).replace(/^lugar-/, ''); }
  var CASA = (R._predios = R._predios || {}).casa = R._predios.casa || {};
  CASA.dentroDoLugar = dentro;

  /* ---------- o chão: grama com os caminhos de pedrinhas (a avenida e as 3 ruas entre as fileiras) ---------- */
  var PEDRAS = ['#e2d4c0', '#d6c4ac', '#ecdfcb'];
  function caminho(tx, ty) { return (tx >= 12 && tx <= 16 && ty >= 3) || ty === 8 || ty === 13 || ty === 18; }
  I.PISOS['lugares-grama'] = { cores: { piso: '#9ad86a', piso2: '#8ccc5c', detalhe: '#68b04a', luz: '#c2ee8e' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      if (caminho(tx, ty)) {
        ret(ctx, px, py, 16, 16, '#c4a98a');
        for (var j = 0; j < 2; j++) for (var i = -1; i < 2; i++) {
          var ox = i * 8 + ((ty * 2 + j) & 1) * 4, x0 = Math.max(0, ox + 1), x1 = Math.min(16, ox + 8);
          var c = PEDRAS[Math.floor(sorte(tx * 3 + i, ty * 2 + j, 71) * PEDRAS.length)];
          if (x1 > x0) { ret(ctx, px + x0, py + j * 8 + 1, x1 - x0, 6, c); ret(ctx, px + x0, py + j * 8 + 1, x1 - x0, 1, C.branco); }
        }
        return;
      }
      ret(ctx, px, py, 16, 16, p.piso);
      if (sorte(tx, ty, 1) < 0.5) ret(ctx, px + Math.floor(sorte(tx, ty, 2) * 8), py + 2, 8, 5, p.piso2);
      for (var k = 0; k < 3; k++) {
        var gx = px + 1 + Math.floor(sorte(tx, ty, 10 + k) * 13), gy = py + 3 + Math.floor(sorte(tx, ty, 20 + k) * 11);
        ret(ctx, gx, gy - 2, 1, 3, p.detalhe); ret(ctx, gx + 1, gy - 3, 1, 3, p.detalhe);
      }
    } };

  /* ---------- o lote (4 × 2, plano): terra cercada; vazio, a plaquinha "?" ---------- */
  I.objeto('casa-lugares-lote', { w: 4, h: 2, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      ret(ctx, px + 1, py + 1, 62, 30, '#c79a64'); ret(ctx, px + 2, py + 2, 60, 2, '#d8b07c');
      for (var i = 0; i < 6; i++) ret(ctx, px + 4 + Math.floor(sorte(o.x + i, o.y, 9) * 54), py + 6 + Math.floor(sorte(o.x, o.y + i, 8) * 20), 3, 1, '#a87c4c');
      // a cerquinha baixa em volta (contorno), com os postinhos nos cantos
      ret(ctx, px, py, 64, 1, K); ret(ctx, px, py + 31, 64, 1, K); ret(ctx, px, py, 1, 32, K); ret(ctx, px + 63, py, 1, 32, K);
      [[0, 0], [61, 0], [0, 29], [61, 29]].forEach(function (c) { ret(ctx, px + c[0], py + c[1], 3, 3, C.branco); ret(ctx, px + c[0], py + c[1] + 2, 3, 1, K); });
      if (comprado(o.lugar)) return;
      // a plaquinha "?" na frente
      ret(ctx, px + 30, py + 14, 2, 14, K); ret(ctx, px + 23, py + 6, 18, 11, K); ret(ctx, px + 24, py + 7, 16, 9, '#fff3d6');
      ret(ctx, px + 30, py + 8, 4, 1, '#8a6a9a'); ret(ctx, px + 33, py + 9, 1, 2, '#8a6a9a'); ret(ctx, px + 31, py + 11, 2, 1, '#8a6a9a');
      ret(ctx, px + 31, py + 12, 1, 1, '#8a6a9a'); ret(ctx, px + 31, py + 14, 1, 1, '#8a6a9a');
    } });

  /* ---------- o monumento: a miniatura do lugar em escala 2 (inteira: pixels de 2 × 2) ---------- */
  lugares().forEach(function (m) {
    var b = I.OBJETOS[m.objeto];
    if (!b) return;
    I.objeto('casa-lugares-' + m.id, { w: b.w * 2, h: b.h * 2, topo: (b.topo || 0) * 2, solido: true, alto: true,
      desenhar: function (ctx, px, py) {
        ctx.save(); ctx.translate(px, py); ctx.scale(2, 2);
        b.desenhar(ctx, 0, 0, { dir: 'baixo', w: b.w, h: b.h, x: 0, y: 0 });
        ctx.restore();
      } });
  });

  /* ---------- enfeites da vila ---------- */
  // o mastro com a bandeirinha (1 × 1, cores do arco-íris)
  I.objeto('casa-lugares-mastro', { w: 1, h: 1, topo: 24, solido: true,
    desenhar: function (ctx, px, py, o) {
      var cor = ['#ff5c6a', '#ffe066', '#5fb4ff', '#6fdc8c', '#a66bff'][(o.x + o.y) % 5];
      ret(ctx, px + 4, py + 12, 8, 3, K); ret(ctx, px + 5, py + 12, 6, 2, '#b8b0cc');
      ret(ctx, px + 7, py - 24, 2, 37, K); ret(ctx, px + 7, py - 23, 1, 35, '#e8e4f2');
      ret(ctx, px + 9, py - 22, 7, 6, K); ret(ctx, px + 9, py - 21, 6, 4, cor); ret(ctx, px + 9, py - 21, 6, 1, clarear(cor, 0.35));
      ret(ctx, px + 6, py - 26, 4, 3, K); ret(ctx, px + 7, py - 25, 2, 1, '#ffd34d');
    } });
  // o arco da entrada (3 × 1), com o globo no alto
  I.objeto('casa-lugares-arco', { w: 3, h: 1, topo: 30, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 22, 6, 36, K); ret(ctx, px + 2, py - 21, 4, 34, '#d9a066'); ret(ctx, px + 2, py - 21, 1, 34, clarear('#d9a066', 0.25));
      ret(ctx, px + 41, py - 22, 6, 36, K); ret(ctx, px + 42, py - 21, 4, 34, '#d9a066'); ret(ctx, px + 45, py - 21, 1, 34, escurecer('#d9a066', 0.2));
      ret(ctx, px, py - 26, 48, 7, K); ret(ctx, px + 1, py - 25, 46, 5, '#ff7eb6'); ret(ctx, px + 1, py - 25, 46, 1, clarear('#ff7eb6', 0.35));
      for (var i = 0; i < 5; i++) ret(ctx, px + 6 + i * 8, py - 23, 4, 2, ['#ff5c6a', '#ffe066', '#6fdc8c', '#5fb4ff', '#a66bff'][i]);
      R.Interiores.desenho.circulo(ctx, px + 24, py - 30, 5, K); R.Interiores.desenho.circulo(ctx, px + 24, py - 30, 4, '#5cb8ff');
      ret(ctx, px + 22, py - 32, 3, 2, '#6ee07a'); ret(ctx, px + 25, py - 29, 2, 2, '#6ee07a');
    } });

  /* ---------- o interior ---------- */
  var objetos = [], L = lugares();
  L.forEach(function (m, i) { var l = lote(i); objetos.push({ tipo: 'casa-lugares-lote', x: l.x, y: l.y, lugar: m.id, nome: 'Lote: ' + m.nome, acao: { tipo: 'lugaresVer', lugar: m.id } }); });
  objetos.push(
    { tipo: 'casa-lugares-arco', x: 13, y: 19, nome: 'Vila dos Lugares Famosos' },
    { tipo: 'vila-fonte', x: 13, y: 10, nome: 'Fonte' },
    { tipo: 'banco', x: 12, y: 14 }, { tipo: 'banco', x: 15, y: 14 },
    { tipo: 'vila-poste', x: 12, y: 6 }, { tipo: 'vila-poste', x: 16, y: 6 }, { tipo: 'vila-poste', x: 12, y: 17 }, { tipo: 'vila-poste', x: 16, y: 17 },
    { tipo: 'vila-bandeirolas', x: 12, y: 3 },
    { tipo: 'casa-lugares-mastro', x: 6, y: 5 }, { tipo: 'casa-lugares-mastro', x: 21, y: 5 },
    { tipo: 'casa-lugares-mastro', x: 6, y: 15 }, { tipo: 'casa-lugares-mastro', x: 21, y: 15 },
    { tipo: 'flores', x: 6, y: 10 }, { tipo: 'flores', x: 21, y: 10 },
    { tipo: 'vila-canteiro', x: 4, y: 3 }, { tipo: 'vila-canteiro', x: 23, y: 3 },
    { tipo: 'vila-arvore', x: 1, y: 3 }, { tipo: 'vila-arvore', x: 27, y: 3 }, { tipo: 'vila-arvore', x: 1, y: 20 }, { tipo: 'vila-arvore', x: 27, y: 20 },
    { tipo: 'vila-arvore', x: 1, y: 11 }, { tipo: 'vila-arvore', x: 27, y: 11 },
    { tipo: 'flores', x: 2, y: 3 }, { tipo: 'flores', x: 26, y: 3 }, { tipo: 'flores', x: 2, y: 20 }, { tipo: 'flores', x: 26, y: 20 },
    { tipo: 'vaso-planta', x: 11, y: 21 }, { tipo: 'vaso-planta', x: 17, y: 21 },
    { tipo: 'vila-poco', x: 10, y: 3 }, { tipo: 'vila-carrinho', x: 18, y: 3 },
    { tipo: 'placa-chao', x: 11, y: 19, nome: 'Vila dos Lugares Famosos' },
    { tipo: 'vila-placa', x: 17, y: 19, nome: 'Mercado na Garagem' }
  );

  R.registrarInterior({
    id: 'casa-lugares',
    lugar: 'casa',
    nome: 'Vila dos Lugares Famosos',
    pacote: 'interior-casa',
    fundo: 'vila',
    // os lugares comprados, em pé no lote de cada um, com o capacho na porta (derivado da compra; refeito ao entrar e
    // depois de comprar)
    objetosExtras: function () {
      var r = [];
      lugares().forEach(function (m, i) {
        var b = I.OBJETOS[m.objeto], l = lote(i), p = porta(i);
        if (!b || !comprado(m.id)) return;
        var w = b.w * 2, h = b.h * 2;
        r.push({ tipo: 'casa-lugares-' + m.id, x: l.x + Math.floor((4 - w) / 2), y: l.y + 2 - h, nome: m.nome + (m.pais ? ' (' + m.pais + ')' : ''),
          acao: { tipo: 'lugaresVer', lugar: m.id } }, { tipo: 'vila-capacho', x: p.x, y: p.y });
      });
      return r;
    },
    tamanho: { w: 30, h: 23 },
    spawn: { x: 14, y: 20 },
    // volta para a Garagem pelo arco de baixo; quem chega da Garagem aparece logo acima. Depois, a porta de cada lote
    // (aberta só com o lugar comprado: interiores.md §3), pareada com a saída de dentro; quem sai chega logo abaixo
    escadas: [{ x: 14, y: 21, para: 'casa-garagem', sentido: 'portal', seta: 'desce', chegar: { x: 0, y: -1 }, olhar: { x: 0, y: -1 } }]
      .concat(L.map(function (m, i) {
        var p = porta(i);
        return { x: p.x, y: p.y, para: dentro(m.id), sentido: 'portal', chegar: { x: 0, y: 1 }, olhar: { x: 0, y: -1 },
          aberta: function () { return comprado(m.id); } };
      })),
    comodos: [{ id: 'lugares', nome: 'Vila dos Lugares Famosos', placa: 'Lugares Famosos', rect: { x: 1, y: 1, w: 28, h: 21 },
      piso: 'lugares-grama', parede: 'vila-colinas' }],
    portas: [],
    // a avenida do meio e as ruas entre as fileiras de lotes (e a primeira fileira, junto às colinas)
    corredores: [{ x: 12, y: 3, w: 5, h: 19 }, { x: 1, y: 3, w: 28, h: 2 }, { x: 1, y: 7, w: 28, h: 3 }, { x: 1, y: 12, w: 28, h: 3 },
      { x: 1, y: 17, w: 28, h: 5 }],
    objetos: objetos,
    npcs: [],
  });

  /* ---------- tocar num lote ou num lugar; refazer ao entrar e depois de comprar ---------- */
  // comprado: entra nele (a mesma chegada da porta do lote, ao lado da saída de dentro); senão, o aviso de onde comprar
  function ver(acao) {
    var m = R.movelCasa && R.movelCasa(acao && acao.lugar), UI = R.UI, II = R.Interiores, Ce = R.Cena;
    if (!m) return Promise.resolve();
    var tem = comprado(m.id);
    if (tem && Ce && Ce.irPara && II && II.def(dentro(m.id))) return Ce.irPara(dentro(m.id), null, { x: 0, y: -1 }, 'casa-lugares');
    if (!UI || !UI.avisoItem) return Promise.resolve();
    UI.avisoItem({ icone: '🗽', texto: tem ? m.nome + (m.pais ? ', ' + m.pais : '') + '!' : m.nome + ': compre no Mercado da Garagem!' });
    return Promise.resolve();
  }
  function refazer() { var II = R.Interiores; if (II && II.refazer) try { II.refazer('casa-lugares'); } catch (e) { /* cena ainda não montada */ } }
  R.registrarModulo({ id: 'lugares-vila', acoes: { lugaresVer: ver } });
  // no carregamento só guarda as funções (U.on); rodam depois, no jogo
  R.util.on(R.EVENTOS.CENA, function (c) { if (c && c.para === 'casa-lugares') refazer(); });
  R.util.on(R.EVENTOS.MAPA_MUDOU, function () { var c = R.Cena && R.Cena.atual(); if (c && c.id === 'casa-lugares') refazer(); });
})();
