/* Vila Arco-Íris, Casa Mal-Assombrada (docs/contratos/vila.md §2; os monstros: monstros.md §10): a fachada 6 × 5 no
   terreno de cima da esquerda (porta desenhada embaixo, no tile 2 da pegada, logo acima do tile da escada `portal`), a
   jaula de um monstro de matéria e a abóbora. Assombrada de mentirinha, fofa para criança: roxo e lilás, telhado torto,
   torre pontuda com a lua na ponta, janelas acesas (amarela e verde), morcegos pequenos, teia no canto e um fantasminha
   na janela (com Animações ele pisca; sem, fica parado). Os enfeites de dentro: assombrada-objetos-2.js.
   Usa Reino._predios.vila (V, de fundo.js e objetos.js) e cria V.assombrada (A), que a parte 2 usa:
     A.abobora(ctx, x, y, rosto)  A.teia(ctx, x, y, n, espelho)  A.fantasminha(ctx, x, y, piscando)  A.morcego(ctx, x, y)
     A.cores (a paleta da casa)
   A jaula (2 × 2, sólida) lê na hora o monstro da espécie (acao.especie): Reino.Monstros.quantos (ganho com a matéria
   completa: colorido, porta aberta e coração) e Reino.Monstros.sprite (o desenho; em silhueta com "?" se ainda não);
   na plaquinha, o ícone da matéria de agora do prédio (Monstros.daMateria). Só lê: nada no save. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret;
  var K = R.Desenho.K, matriz = R.Desenho.matriz;
  var V = R._predios.vila, caixa = V.caixa, MADEIRA = V.MADEIRA;
  var A = V.assombrada = {};

  var C = A.cores = {
    parede: '#6a4c93', parede2: '#58407c', paredeLuz: '#8a6cb4', torre: '#5e4486',
    telhado: '#3f2a5e', telhado2: '#4f3874', telhadoLuz: '#6a52a0',
    pedra: '#4a3a5e', pedra2: '#5e4c74',
    luz: '#ffe27a', luz2: '#fff3b8', verde: '#9ef08a', verde2: '#d4ffc6',
    porta: '#8a5a3a', porta2: '#6e4428', portaLuz: '#a8744c',
    teia: '#efe8f7', fantasma: '#f6f2ff', fantasma2: '#d9d0f0', rosa: '#ff9cc6',
  };

  /* ---------- pecinhas (também usadas por dentro) ---------- */
  var ABOBORA = ['.....kk......', '.....kgk.....', '..kkkkkkkkk..', '.klodooodook.', 'kloyydoyyodok',
    'kloodooodoook', 'kloyyyyyyyook', 'klodyoyoydook', '.koodooodook.', '..kkkkkkkkk..'];
  var PAL_ABOBORA = { k: K, o: '#ff8a3d', d: '#e0621e', l: '#ffb06a', g: '#5e9a3a', y: '#ffe27a' };
  var PAL_ABOBORA_LISA = { k: K, o: '#ff8a3d', d: '#e0621e', l: '#ffb06a', g: '#5e9a3a', y: '#ff8a3d' };
  // abóbora 13 × 10 (canto x, y); rosto aceso ou lisa
  A.abobora = function (ctx, x, y, rosto) { matriz(ctx, x, y, ABOBORA, rosto ? PAL_ABOBORA : PAL_ABOBORA_LISA); };
  // teia n × n presa no canto (x, y): raios e dois fios ligando os raios; espelho = presa no canto da direita
  A.teia = function (ctx, x, y, n, espelho) {
    for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
      var s = i + j, liga = i === 0 || j === 0 || i === j || i === 2 * j || j === 2 * i || s === Math.round(n * 0.45) || s === n - 1;
      if (liga && s < n) ret(ctx, espelho ? x - i : x + i, y + j, 1, 1, C.teia);
    }
  };
  var FANTASMA = ['..kkk..', '.kwwwk.', 'kwwwwwk', 'kwewewk', 'kpwwwpk', 'kwwwwwk', 'kwkwkwk', '.k.k.k.'];
  // fantasminha 7 × 8 (canto x, y); piscando = olhos fechados
  A.fantasminha = function (ctx, x, y, piscando) {
    matriz(ctx, x, y, FANTASMA, { k: K, w: C.fantasma, e: piscando ? C.fantasma : '#2a1838', p: C.rosa });
  };
  var MORCEGO = ['..k...k..', 'k.kkkkk.k', 'kkkpkpkkk', '.kkkkkkk.', '..k.k.k..'];
  A.morcego = function (ctx, x, y) { matriz(ctx, x, y, MORCEGO, { k: K, p: C.rosa }); };
  var LUA = ['.kkkk.', 'kyyyk.', 'kyk...', 'kyk...', 'kyyyk.', '.kkkk.'];

  /* ---------- por fora: a fachada (6 × 5; a porta no tile 2, sobre a fileira de baixo) ---------- */
  function janela(ctx, x, y, w, h, luz, luz2) {
    caixa(ctx, x, y, w, h, luz); ret(ctx, x + 1, y + 1, w - 2, 3, luz2);
    ret(ctx, x + 1, y + 1, 2, 2, '#ffffff');
    ret(ctx, x + Math.floor(w / 2), y, 1, h, K); ret(ctx, x, y + Math.floor(h / 2), w, 1, K);
    // cortininhas lilás nos cantos de cima
    for (var i = 0; i < 4; i++) { ret(ctx, x + 1, y + 1 + i, 4 - i, 1, '#b58cff'); ret(ctx, x + w - 5 + i, y + 1 + i, 4 - i, 1, '#b58cff'); }
    caixa(ctx, x - 2, y + h - 1, w + 4, 4, MADEIRA[0]); ret(ctx, x - 1, y + h, w + 2, 1, MADEIRA[2]);
  }
  // telhado torto: a ponta à esquerda do meio, a água da esquerda mais em pé (fileiras de 2 px)
  function telhado(ctx, px, py) {
    for (var i = 0; i < 12; i++) {
      var y = py + i * 2, l = Math.max(px, px + 34 - (i + 1) * 3), r = Math.min(px + 95, px + 34 + (i + 1) * 5);
      ret(ctx, l, y, r - l, 2, K);
      if (i) ret(ctx, l + 1, y, r - l - 2, 2, Math.floor(i / 2) % 2 ? C.telhado2 : C.telhado);
      if (i) ret(ctx, l + 1, y, 1, 2, C.telhadoLuz);
    }
    ret(ctx, px, py + 24, 95, 2, K);
    for (i = 0; i < 6; i++) ret(ctx, px + 4 + i * 16, py + 26, 6, 1, C.pedra);   // beiral recortadinho
  }
  // torre pontuda (direita), com a ponta torta e a lua em cima
  function torre(ctx, px, py) {
    var cx = px + 78, i;
    for (var j = 0; j < 10; j++) {
      var y = py - 30 + j * 2, meia = Math.round(j * 1.25) + 1, x = cx + (j < 3 ? 2 - j : 0);
      ret(ctx, x - meia - 1, y, meia * 2 + 3, 2, K);
      if (j) { ret(ctx, x - meia, y, meia * 2 + 1, 2, j % 2 ? C.telhado2 : C.telhado); ret(ctx, x - meia, y, 1, 2, C.telhadoLuz); }
    }
    matriz(ctx, cx + 1, py - 36, LUA, { k: K, y: C.luz2 });
    caixa(ctx, px + 68, py - 12, 20, 38, C.torre);
    for (i = 0; i < 5; i++) ret(ctx, px + 69, py - 4 + i * 7, 18, 1, C.parede2);
    ret(ctx, px + 69, py - 11, 1, 36, C.paredeLuz);
    ret(ctx, px + 64, py - 12, 28, 2, K);
    // janelinha em arco, de luz verde
    ret(ctx, px + 74, py - 5, 9, 12, K); ret(ctx, px + 75, py - 7, 7, 2, K);
    ret(ctx, px + 75, py - 4, 7, 10, C.verde); ret(ctx, px + 76, py - 6, 5, 2, C.verde); ret(ctx, px + 76, py - 4, 2, 2, C.verde2);
    ret(ctx, px + 78, py - 6, 1, 12, K);
  }
  I.objeto('vila-assombrada-predio', { w: 6, h: 5, solido: true, alto: false, topo: 36, junto: true,
    desenhar: function (ctx, px, py) {
      var W = 96, i;
      ret(ctx, px + 2, py + 78, W - 4, 3, 'rgba(58,36,70,0.25)');                         // sombra no chão
      caixa(ctx, px + 6, py + 20, 84, 60, C.parede);                                       // a parede
      for (i = 0; i < 7; i++) ret(ctx, px + 7, py + 30 + i * 7, 82, 1, C.parede2);
      ret(ctx, px + 7, py + 21, 1, 50, C.paredeLuz);
      ret(ctx, px + 7, py + 72, 82, 7, C.pedra); ret(ctx, px + 7, py + 72, 82, 1, K);     // alicerce de pedra
      for (i = 0; i < 8; i++) ret(ctx, px + 12 + i * 10 + (i % 2) * 3, py + 75, 1, 4, C.pedra2);
      A.teia(ctx, px + 7, py + 27, 12, false);                                           // a teia no canto
      telhado(ctx, px, py);
      // janelinha redonda do sótão, de luz verde
      ret(ctx, px + 29, py + 9, 11, 9, K); ret(ctx, px + 31, py + 8, 7, 11, K);
      ret(ctx, px + 30, py + 10, 9, 7, C.verde); ret(ctx, px + 32, py + 9, 5, 9, C.verde); ret(ctx, px + 31, py + 10, 2, 2, C.verde2);
      ret(ctx, px + 34, py + 8, 1, 11, K);
      torre(ctx, px, py);
      A.morcego(ctx, px + 48, py - 10); A.morcego(ctx, px + 86, py - 26);
      // as janelas: a da direita com o fantasminha espiando
      janela(ctx, px + 10, py + 41, 19, 17, C.luz, C.luz2);
      janela(ctx, px + 60, py + 41, 19, 17, C.luz, C.luz2);
      A.fantasminha(ctx, px + 62, py + 49, false);
      // a placa: tábua creme pendurada, com um fantasminha e as letras em tracinhos
      ret(ctx, px + 25, py + 25, 1, 3, K); ret(ctx, px + 55, py + 25, 1, 3, K);
      caixa(ctx, px + 21, py + 27, 39, 12, '#fff4d8'); ret(ctx, px + 22, py + 28, 37, 1, '#ffffff');
      matriz(ctx, px + 23, py + 29, FANTASMA.slice(0, 7), { k: K, w: C.fantasma2, e: '#2a1838', p: C.rosa });
      for (i = 0; i < 4; i++) ret(ctx, px + 33 + i * 5, py + 30, 4, 2, '#7c5cff');
      for (i = 0; i < 5; i++) ret(ctx, px + 33 + i * 5, py + 34, 4, 2, i === 1 ? '#ff8a3d' : '#a66bff');
      // a porta de madeira em arco (centrada no tile 2: x 32..48), com o batedor dourado e a janelinha
      ret(ctx, px + 31, py + 54, 19, 26, K); ret(ctx, px + 33, py + 51, 15, 3, K); ret(ctx, px + 35, py + 50, 11, 1, K);
      ret(ctx, px + 32, py + 55, 17, 25, C.porta); ret(ctx, px + 34, py + 52, 13, 3, C.porta); ret(ctx, px + 36, py + 51, 9, 1, C.porta);
      [36, 40, 44].forEach(function (x) { ret(ctx, px + x, py + 53, 1, 27, C.porta2); });
      ret(ctx, px + 33, py + 55, 1, 24, C.portaLuz);
      caixa(ctx, px + 37, py + 57, 7, 5, C.luz); ret(ctx, px + 40, py + 57, 1, 5, K);
      ret(ctx, px + 45, py + 66, 2, 3, K); ret(ctx, px + 45, py + 66, 1, 2, '#ffd34d');
      caixa(ctx, px + 27, py + 79, 27, 5, '#8a7f9a'); ret(ctx, px + 28, py + 80, 25, 1, '#aaa0bc');   // degrau
      // abóboras dos lados da porta
      A.abobora(ctx, px + 15, py + 69, true); A.abobora(ctx, px + 52, py + 69, false);
    },
    anim: function (ctx, px, py, t) {   // o fantasminha da janela pisca e a janela do sótão cintila
      if (t % 2600 >= 2380) A.fantasminha(ctx, px + 62, py + 49, true);
      if (Math.floor(t / 700) % 3 === 1) { ret(ctx, px + 36, py + 11, 1, 3, '#ffffff'); ret(ctx, px + 35, py + 12, 3, 1, '#ffffff'); }
    } });

  /* ---------- a abóbora (1 × 1): rosto aceso (var.rosto false = lisa) ---------- */
  I.objeto('vila-assombrada-abobora', { w: 1, h: 1, solido: true, topo: 0,
    desenhar: function (ctx, px, py, o) { A.abobora(ctx, px + 2, py + 5, !(o.var && o.var.rosto === false)); } });

  /* ---------- a jaula de um monstro de matéria (2 × 2, sólida) ---------- */
  var FERRO = '#4b3f63', FERRO2 = '#7d6fa0', FERRO3 = '#b8acd8', ESCURO = '#1f1830', CLARO = '#56468a';
  var GANHO = {};   // espécie → ganho, do último desenho (a animação lê; o desenho refaz quando a chave muda)
  function especieDe(o) { return (o && o.acao && o.acao.especie) || null; }
  function ganhou(id) { try { return !!(id && R.Monstros && R.Monstros.quantos(id) > 0); } catch (e) { return false; } }
  function materiaDe(id) {
    var M = R.Monstros, d = M && M.daMateria ? M.daMateria().filter(function (x) { return x.id === id; })[0] : null;
    return d ? R.materia(d.materia) : null;
  }
  function iconeDe(m) {
    if (!m || !m.emoji || !window.PA || !PA.iconeEmoji) return null;
    try { return PA.iconeEmoji(m.emoji, 1); } catch (e) { return null; }
  }
  function spriteDe(id, q) { try { return R.Monstros && R.Monstros.sprite ? R.Monstros.sprite(id, q) : null; } catch (e) { return null; } }
  var INTERROGA = ['.kkkk.', 'kppppk', 'kpkkpk', 'kkkpk.', '.kpk..', '.kkk..', '.kpk..', '.kkk..'];
  var CORACAO = ['.kk.kk.', 'kppkppk', 'kpppppk', '.kpppk.', '..kpk..', '...k...'];
  // onde o monstro fica: em pé na grade de baixo, no meio
  function posMonstro(px, py, s) { return { x: px + 16 - Math.ceil(s.width / 2), y: py + 10 - s.height }; }
  I.objeto('vila-assombrada-jaula', { w: 2, h: 2, solido: true, alto: true, topo: 16,
    chave: function (P, o) { var id = especieDe(o); return 'jaula:' + id + ':' + (ganhou(id) ? 1 : 0); },
    desenhar: function (ctx, px, py, o) {
      var id = especieDe(o), tem = GANHO[id] = ganhou(id);
      // pedestal de madeira escura
      caixa(ctx, px + 2, py + 15, 28, 16, '#5c3d32'); ret(ctx, px + 3, py + 16, 26, 1, '#8a6448'); ret(ctx, px + 3, py + 16, 1, 14, '#8a6448');
      // a gaiola: contorno, fundo, grades de cima e de baixo, colunas
      ret(ctx, px + 1, py - 11, 30, 25, K);
      ret(ctx, px + 2, py - 8, 28, 18, tem ? CLARO : ESCURO);
      if (tem) { ret(ctx, px + 5, py - 6, 1, 1, '#ffffff'); ret(ctx, px + 26, py - 3, 1, 1, C.luz2); ret(ctx, px + 24, py + 6, 1, 1, '#ffffff'); }
      ret(ctx, px + 2, py - 10, 28, 2, FERRO); ret(ctx, px + 2, py - 10, 28, 1, FERRO3);
      ret(ctx, px + 2, py + 10, 28, 3, FERRO); ret(ctx, px + 2, py + 10, 28, 1, FERRO2);
      ret(ctx, px + 2, py - 8, 1, 18, FERRO2); ret(ctx, px + 29, py - 8, 1, 18, FERRO);
      // a cúpula e a argola (ganhou: um coração no lugar da argola)
      ret(ctx, px + 4, py - 13, 24, 2, K); ret(ctx, px + 5, py - 12, 22, 1, FERRO2);
      ret(ctx, px + 9, py - 15, 14, 2, K); ret(ctx, px + 10, py - 14, 12, 1, FERRO3);
      if (tem) matriz(ctx, px + 12, py - 16, CORACAO, { k: K, p: C.rosa });
      else { ret(ctx, px + 14, py - 16, 4, 2, K); ret(ctx, px + 15, py - 16, 2, 1, FERRO2); }
      // o monstro: colorido se ganhou, silhueta com "?" se ainda não
      var s = spriteDe(id, 0);
      if (s) {
        var img = tem ? s : (window.PA && PA.silhueta ? PA.silhueta(s) : s), p = posMonstro(px, py, s);
        ctx.save(); ctx.beginPath(); ctx.rect(px + 3, py - 8, 26, 18); ctx.clip();
        ctx.drawImage(img, p.x, p.y);
        ctx.restore();
      }
      // grades da frente: fechada, finas (a silhueta aparece entre elas) e o cadeado; aberta, a porta virada para a direita
      if (tem) { ret(ctx, px + 5, py - 8, 1, 18, FERRO3); ret(ctx, px + 6, py - 8, 1, 18, FERRO); }
      else [5, 10, 15, 20, 25].forEach(function (x) { ret(ctx, px + x, py - 8, 1, 18, FERRO2); });
      if (tem) {
        ret(ctx, px + 24, py - 11, 7, 25, K); ret(ctx, px + 25, py - 10, 5, 23, FERRO);
        ret(ctx, px + 26, py - 8, 1, 18, FERRO3); ret(ctx, px + 28, py - 8, 1, 18, FERRO3);
        ret(ctx, px + 25, py - 10, 5, 1, FERRO3);
      } else {
        ret(ctx, px + 13, py + 3, 7, 6, K); ret(ctx, px + 14, py + 4, 5, 4, '#ffd34d'); ret(ctx, px + 14, py + 4, 5, 1, '#fff3a0');
        ret(ctx, px + 14, py + 1, 1, 2, K); ret(ctx, px + 18, py + 1, 1, 2, K); ret(ctx, px + 15, py, 3, 1, K);
        ret(ctx, px + 16, py + 5, 1, 2, K);
        matriz(ctx, px + 22, py - 7, INTERROGA, { k: K, p: '#fff8ee' });   // o "?" por cima das grades
      }
      // a plaquinha com o ícone da matéria
      caixa(ctx, px + 7, py + 14, 18, 18, '#fff4d8'); ret(ctx, px + 8, py + 15, 16, 1, '#ffffff');
      var ic = iconeDe(materiaDe(id));
      if (ic) ctx.drawImage(ic, px + 16 - Math.floor(ic.width / 2), py + 23 - Math.floor(ic.height / 2));
    },
    // o monstro que ela ganhou pisca de vez em quando (no instante 0, parado, de olho aberto). Móvel alto: a animação
    // desenha com o pintor (só fillRect), então o piscar são só as linhas trocadas do molde (Monstros.molde().pisca)
    anim: function (ctx, px, py, t, o) {
      var id = especieDe(o), M = R.Monstros;
      if (!GANHO[id] || t % 3200 < 3000 || !M || !M.molde) return;
      var m = M.molde(id), s = spriteDe(id, 0);
      if (!m || !m.pisca || !s) return;
      var p = posMonstro(px, py, s);
      Object.keys(m.pisca).forEach(function (j) { matriz(ctx, p.x, p.y + Number(j), [m.pisca[j]], m.paleta); });
    } });
})();
