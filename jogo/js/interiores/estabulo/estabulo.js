/* Estábulo Mágico: entrada com o Seu Feno e o ninho + cômodo das baias.
   As baias são geradas pelo tamanho do baralho (7 por ala): matéria nova ganha baias sozinha.
   Só dados e os objetos temáticos do estábulo; as falas moram em estabulo/falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  // cores da moldura e da raridade: Reino.config.paleta (arte.md §8), lida na hora; chave que faltar cai na
  // reserva (o hex do contrato), nunca num TypeError
  var RESERVA = { papel: '#fff8ee', tintaSuave: '#6b5378', raridade: { comum: { fundo: '#fff8ee', desenho: '#ff9cc6', texto: '#6b5378' }, raro: { fundo: '#dcebff', desenho: '#5fb4ff', texto: '#2b5ea8' }, epico: { fundo: '#eadcff', desenho: '#a66bff', texto: '#5b2aa8' }, lendario: { fundo: '#ffe39a', desenho: '#ffb020', texto: '#8a5200' } } };
  function pal(k) { var P = (R.config && R.config.paleta) || {}; return P[k] || RESERVA[k]; }
  function rar(r, k) { var t = (pal('raridade') || {})[r] || {}; return t[k] || RESERVA.raridade[r][k]; }
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.estabulo) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var PALHA = '#f5d77a', PALHA2 = '#d9ab45', PALHA3 = '#fff0a8';

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  var brilho = R.Desenho.brilho;   // brilho em cruz (aqui sempre com a cor)
  // tufos de palha espalhados
  function palha(ctx, x, y, w, h) {
    ret(ctx, x, y, w, h, PALHA);
    for (var i = 0; i < w; i += 3) {
      ret(ctx, x + i, y + (i * 7) % Math.max(1, h), 2, 1, PALHA2);
      ret(ctx, x + ((i * 5) % w), y + ((i * 3) % Math.max(1, h)), 1, 1, PALHA3);
    }
  }
  // desenha um canvas cabendo numa caixa, a 1× ou numa miniatura inteira (loja/desenhos.js)
  function caber(ctx, img, cx, base, maxW, maxH) { if (I.caberNitido) I.caberNitido(ctx, img, cx, base, maxW, maxH); }
  // baias fixas: a baia n é sempre do n-ésimo unicórnio do álbum (vazia até ele nascer)
  function daBaia(n) {
    try { return (R.NPCs && R.NPCs.unicornioDaBaia) ? R.NPCs.unicornioDaBaia(n) : null; } catch (e) { return null; }
  }
  function moradorDaBaia(P, n) {
    var cor; try { cor = P && P.estado ? P.estado().corInicial : undefined; } catch (e) {}
    return R.Unicornios.todos(cor)[n] || null;
  }
  function estagioDe(P, id) {
    try { var u = P.estado().unis[id]; return R.Unicornios.estagio(u ? u.xp : 0); } catch (e) { return 0; }
  }
  // 💧/🍎/🛁 da baia quando a sede, a fome ou o banho está baixo (Reino.Cuidados.icone; ausente nas ferramentas);
  // caixaVisivel: última coluna e linha com desenho do ícone (cada ícone tem uma margem transparente)
  var caixas = typeof WeakMap === 'function' ? new WeakMap() : null;
  function caixaVisivel(img) {
    var c = caixas && caixas.get(img); if (c) return c; c = { dir: img.width - 1, baixo: img.height - 1 };
    try {
      var d = img.getContext('2d').getImageData(0, 0, img.width, img.height).data, dir = -1, baixo = -1;
      for (var y = 0; y < img.height; y++) for (var x = 0; x < img.width; x++) {
        if (d[(y * img.width + x) * 4 + 3] > 0) { if (x > dir) dir = x; if (y > baixo) baixo = y; }
      }
      if (dir >= 0) c = { dir: dir, baixo: baixo };
    } catch (e) {}
    if (caixas) caixas.set(img, c);
    return c;
  }
  function iconeCuidado(id) {
    try { return (R.Cuidados && R.Cuidados.icone) ? R.Cuidados.icone(id) : null; } catch (e) { return null; }
  }
  // o desenho das baias (madeira das alas, pendurados, silhueta e "?" da baia vazia) mora em estabulo/baias.js
  var B = R._predios.estabulo, ALAS_MADEIRA = B.ALAS_MADEIRA, PENDURADOS = B.PENDURADOS, INTERROGACAO = B.INTERROGACAO, poseDaBaia = B.poseDaBaia;
  function ovos(P) { try { return P && P.ovosParaChocar ? P.ovosParaChocar() : []; } catch (e) { return []; } }

  /* ================= OBJETOS DO ESTÁBULO ================= */
  // baia: o unicórnio chocado de índice var.indice (ou palha vazia)
  I.objeto('estabulo-baia', { w: 2, h: 2, solido: true, semSombra: true,
    chave: function (P, o) {
      var n = v(o, 'indice', 0), m = moradorDaBaia(P, n), d = P ? daBaia(n) : null;
      if (!d) return 'baia:' + n + ':' + (m ? m.id : '-') + ':0';
      return 'baia:' + n + ':' + d.id + ':1:' + estagioDe(P, d.id) + ':' + (P.montaria && P.montaria() === d.id ? 1 : 0) + ':' + (iconeCuidado(d.id) || '');
    },
    desenhar: function (ctx, px, py, o, P) {
      var n = v(o, 'indice', 0), d = P ? daBaia(n) : null, m = moradorDaBaia(P, n);
      // paredes de tábuas e o chão de palha
      // cada ala com a sua madeira; cada baia com uma coisinha pendurada (a fileira não fica clonada)
      var ala = ALAS_MADEIRA[Math.floor(n / 7) % ALAS_MADEIRA.length];
      ret(ctx, px, py, 32, 32, K);
      ret(ctx, px + 1, py + 1, 30, 20, ala[0]);
      for (var y = py + 4; y < py + 21; y += 5) ret(ctx, px + 1, y, 30, 1, ala[1]);
      ret(ctx, px + 1, py + 1, 30, 2, ala[2]);
      var pend = PENDURADOS[(n * 3 + Math.floor(n / 7)) % PENDURADOS.length];
      if (pend && d) R.Desenho.matriz(ctx, px + 2, py + 3, pend, { k: K, w: C.branco, b: '#c8c0d4', a: ala[3], z: '#9fb8c8', p: '#ff7eb6', r: '#ffb3d9' });
      palha(ctx, px + 1, py + 21, 30, 10);
      ret(ctx, px, py, 2, 32, K); ret(ctx, px + 30, py, 2, 32, K);
      ret(ctx, px + 1, py, 1, 31, C.madeira); ret(ctx, px + 30, py, 1, 31, C.madeira);
      // plaquinha da baia (cor da raridade): na parede; na baia vazia, pendurada na porteira (a silhueta ocupa a parede)
      var cr = (window.PA && PA.CORES_RARIDADE && m && PA.CORES_RARIDADE[m.raridade]) || { base: rar('comum', 'fundo'), borda: rar('comum', 'desenho') }, yp = d ? py + 3 : py + 26;
      function placa() { ret(ctx, px + 11, yp, 10, 5, K); ret(ctx, px + 12, yp + 1, 8, 3, cr.base); ret(ctx, px + 13, yp + 2, 6, 1, cr.borda); }
      if (d) placa();
      if (d && window.PA && PA.unicornio) {
        var e = estagioDe(P, d.id), spr = PA.unicornio(d, e, 0), c = spr && (spr.canvas || spr);
        if (c) caber(ctx, c, px + 16, py + 29, 28, 23);   // adulto 28×23: a 1×
        if (P.montaria && P.montaria() === d.id) {
          // laço de montaria e brilhos
          ret(ctx, px + 3, py + 9, 3, 3, K); ret(ctx, px + 7, py + 9, 3, 3, K); ret(ctx, px + 5, py + 10, 3, 3, K);
          ret(ctx, px + 4, py + 10, 1, 1, C.rosa); ret(ctx, px + 8, py + 10, 1, 1, C.rosa); ret(ctx, px + 6, py + 11, 1, 1, '#ff7eb6');
          brilho(ctx, px + 26, py + 10, C.ouro3); brilho(ctx, px + 24, py + 15, C.branco);
        }
      } else {
        // baia vazia: palha e a silhueta de quem vai morar aqui, com o "?" em --papel
        elipse(ctx, px + 16, py + 26, 9, 3, PALHA2); elipse(ctx, px + 16, py + 25, 7, 2, PALHA3);
        var pose = m && window.PA && PA.unicornio ? poseDaBaia(m, n) : null;
        if (pose) { ctx.drawImage(pose.c, px + pose.x, py + pose.y); if (pose.qx != null) R.Desenho.matriz(ctx, px + pose.qx, py + pose.qy, INTERROGACAO, { k: K, w: pal('papel') }); }
      }
      // porteira baixa
      ret(ctx, px + 1, py + 26, 30, 2, K); ret(ctx, px + 2, py + 26, 28, 1, C.madeiraClara);
      ret(ctx, px + 1, py + 30, 30, 2, K);
      for (var x = px + 4; x < px + 30; x += 6) ret(ctx, x, py + 26, 2, 6, K);
      if (!d) placa();
      // sede, fome ou banho baixo: o ícone (1 px = 1 px do jogo, nítido) no canto de cima da baia, com a
      // parte desenhada terminando logo acima da plaquinha (py + 3) e encostada na parede da direita:
      // a banheira (16 px de largura) cobria metade da plaquinha quando ficava no mesmo nível
      var ic = d ? iconeCuidado(d.id) : null, img = ic && window.PA && PA.iconeDesenho ? PA.iconeDesenho(ic) : null;
      img = img && (img.canvas || img);
      if (img) {
        var vis = caixaVisivel(img);
        ctx.drawImage(img, px + 31 - vis.dir, py + 2 - vis.baixo);
      }
    } });
  // ninho de palha com os ovos que ainda não chocaram
  I.objeto('estabulo-ninho', { w: 2, h: 1, topo: 8, solido: true,
    chave: function (P) { return 'ninho:' + ovos(P).map(function (id) { var d = P.defUni(id); return d ? d.raridade : '?'; }).join(','); },
    desenhar: function (ctx, px, py, o, P) {
      var cx = px + 16; elipse(ctx, cx, py + 9, 15, 6, K); elipse(ctx, cx, py + 9, 14, 5, PALHA2); elipse(ctx, cx, py + 8, 11, 3, '#b8862e');
      var lista = ovos(P).slice(0, 5), pos = [[0, 0], [-7, 1], [7, 1], [-3, 3], [4, 3]];
      lista.forEach(function (id, i) {
        var d = P.defUni(id), img = window.PA && PA.ovo ? PA.ovo(d ? d.raridade : 'comum', 0) : null; img = img && (img.canvas || img);
        if (img) caber(ctx, img, cx + pos[i][0], py + 10 + pos[i][1], 10, 12);
      });
      // aba da frente do ninho
      for (var x = -14; x <= 14; x += 2) {
        var y = py + 11 + Math.round(Math.abs(x) / 5);
        ret(ctx, cx + x, y - 1, 2, 3, K); ret(ctx, cx + x, y - 1, 2, 2, x % 4 ? PALHA : PALHA3);
      }
      if (!lista.length) { ret(ctx, cx - 4, py + 7, 3, 1, PALHA3); ret(ctx, cx + 2, py + 6, 3, 1, PALHA3); }
    } });
  // cocho de água (a água brilha)
  I.objeto('estabulo-cocho', { w: 2, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 11, 3, 4, K); ret(ctx, px + 27, py + 11, 3, 4, K);
      ret(ctx, px + 1, py - 2, 30, 14, K); ret(ctx, px + 2, py - 1, 28, 12, C.madeira);
      ret(ctx, px + 2, py + 3, 28, 1, C.madeira2); ret(ctx, px + 2, py + 8, 28, 1, C.madeira2);
      ret(ctx, px + 3, py, 26, 4, '#5fb4ff'); ret(ctx, px + 3, py, 26, 1, '#9fdcff');
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 220) % 26;
      ret(ctx, px + 3 + f, py + 1, 3, 1, C.branco);
      ret(ctx, px + 3 + (f + 13) % 26, py + 2, 2, 1, '#c8ecff');
    } });
  // fardo de feno
  I.objeto('estabulo-feno', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 3, 14, 17, K); ret(ctx, px + 2, py - 2, 12, 15, PALHA);
      for (var y = py - 1; y < py + 13; y += 3) ret(ctx, px + 2, y, 12, 1, PALHA2);
      ret(ctx, px + 2, py - 2, 12, 1, PALHA3);
      ret(ctx, px + 5, py - 2, 1, 15, '#b8452e'); ret(ctx, px + 10, py - 2, 1, 15, '#b8452e');
      ret(ctx, px + 13, py - 5, 1, 3, PALHA2); ret(ctx, px + 3, py - 4, 1, 2, PALHA2);
    } });
  // saco de cenouras
  I.objeto('estabulo-cenouras', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py - 1, 13, 16, K); ret(ctx, cx - 5, py, 11, 14, '#d8c09a'); ret(ctx, cx - 5, py, 2, 14, '#ecdcc0');
      ret(ctx, cx - 3, py + 6, 7, 1, '#b89a70');
      [[-3, -5], [0, -6], [3, -4]].forEach(function (c) {
        ret(ctx, cx + c[0] - 1, py + c[1], 3, 6, K); ret(ctx, cx + c[0], py + c[1] + 1, 1, 5, C.laranja);
        ret(ctx, cx + c[0] - 1, py + c[1] - 2, 1, 2, C.verde); ret(ctx, cx + c[0] + 1, py + c[1] - 2, 1, 2, C.folha3 || C.verde);
      });
    } });
  // cestinho com escovas de crina
  I.objeto('estabulo-escovas', { w: 1, h: 1, topo: 5, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 5, 12, 10, K); ret(ctx, px + 3, py + 6, 10, 8, '#c9a8ff'); ret(ctx, px + 3, py + 9, 10, 1, '#9b6bd6');
      ret(ctx, px + 3, py - 3, 5, 9, K); ret(ctx, px + 4, py - 2, 3, 3, C.rosa); ret(ctx, px + 5, py + 1, 1, 4, C.madeira);
      ret(ctx, px + 8, py - 1, 6, 7, K); ret(ctx, px + 9, py, 4, 2, '#9fdcff'); ret(ctx, px + 10, py + 2, 2, 3, C.madeira);
      for (var i = 0; i < 3; i++) ret(ctx, px + 4 + i, py - 4, 1, 1, K);
    } });
  // sela no cavalete
  I.objeto('estabulo-sela', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', '#b95a36');
      ret(ctx, px + 2, py + 4, 2, 11, K); ret(ctx, px + 12, py + 4, 2, 11, K);
      ret(ctx, px + 1, py + 2, 14, 3, K); ret(ctx, px + 2, py + 3, 12, 1, C.madeira);
      ret(ctx, px + 1, py - 6, 14, 9, K); ret(ctx, px + 2, py - 5, 12, 7, c); ret(ctx, px + 2, py - 5, 12, 1, '#e07a4a');
      ret(ctx, px + 2, py - 8, 4, 3, K); ret(ctx, px + 10, py - 8, 4, 3, K);
      ret(ctx, px + 7, py - 3, 2, 2, C.ouro);
      ret(ctx, px + 6, py + 2, 1, 6, K); ret(ctx, px + 5, py + 8, 3, 2, C.metal2);
    } });
  // pá e forcado de brinquedo encostados
  I.objeto('estabulo-ferramentas', { w: 1, h: 1, topo: 12, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py - 12, 2, 24, K); ret(ctx, px + 4, py - 11, 1, 22, C.madeiraClara);
      ret(ctx, px + 2, py + 10, 6, 5, K); ret(ctx, px + 3, py + 10, 4, 4, C.metal2);
      ret(ctx, px + 10, py - 12, 2, 20, K); ret(ctx, px + 10, py - 11, 1, 18, C.madeira);
      ret(ctx, px + 7, py + 7, 8, 2, K);
      for (var i = 0; i < 4; i++) ret(ctx, px + 7 + i * 2, py + 8, 1, 7, i % 2 ? '#ff9cc6' : C.metal);
    } });
  // carrinho de mão com feno
  I.objeto('estabulo-carrinho', { w: 2, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      circulo(ctx, px + 7, py + 11, 4, K); circulo(ctx, px + 7, py + 11, 2, C.metal2);
      ret(ctx, px + 20, py + 7, 12, 2, K); ret(ctx, px + 24, py + 9, 2, 6, K);
      ret(ctx, px + 2, py - 1, 22, 10, K); ret(ctx, px + 3, py, 20, 8, '#ff7eb6'); ret(ctx, px + 3, py, 20, 1, '#ffc2d8');
      palha(ctx, px + 4, py - 5, 18, 5);
      ret(ctx, px + 8, py - 7, 1, 2, PALHA2); ret(ctx, px + 15, py - 6, 1, 1, PALHA2);
    } });
  // cata-vento colorido (gira devagar)
  I.objeto('estabulo-catavento', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py + 12, 2, 16, K); ret(ctx, px + 7, py + 12, 1, 15, C.madeira);
      circulo(ctx, px + 8, py + 12, 2, K);
    },
    anim: function (ctx, px, py, t) {
      var a = (t / 600) % (Math.PI * 2), cs = [C.rosa, C.ouro, '#5fb4ff', C.verde];
      for (var i = 0; i < 4; i++) {
        var ang = a + i * Math.PI / 2, x = Math.round(px + 8 + Math.cos(ang) * 4), y = Math.round(py + 12 + Math.sin(ang) * 4);
        ret(ctx, x - 1, y - 1, 3, 3, cs[i]);
      }
      ret(ctx, px + 8, py + 12, 1, 1, C.branco);
    } });
  // ferraduras da sorte na parede
  I.objeto('estabulo-ferraduras', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 2, py + 6, 12, 20, C.madeira2);
      function ferradura(x, y, c) {
        ret(ctx, x, y, 2, 6, K); ret(ctx, x + 5, y, 2, 6, K); ret(ctx, x, y + 5, 7, 2, K);
        ret(ctx, x + 1, y + 1, 1, 5, c); ret(ctx, x + 5, y + 1, 1, 5, c); ret(ctx, x + 1, y + 5, 5, 1, c);
      }
      ferradura(px + 5, py + 8, C.ouro); ferradura(px + 5, py + 17, C.metal);
    } });
  // lanterna pendurada (a chama tremula)
  I.objeto('estabulo-lanterna', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 8, 10, 2, K); ret(ctx, cx - 1, py + 10, 2, 3, K);
      ret(ctx, cx - 4, py + 13, 8, 11, K); ret(ctx, cx - 3, py + 14, 6, 9, '#fff3c8');
      ret(ctx, cx - 5, py + 13, 10, 2, K); ret(ctx, cx - 5, py + 23, 10, 2, K);
      ret(ctx, cx - 1, py + 18, 2, 4, C.laranja);
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8, h = 2 + Math.round(Math.sin(t / 150) * 1);
      ret(ctx, cx - 1, py + 19 - h, 2, h, C.ouro3);
      elipse(ctx, cx, py + 18, 7, 7, 'rgba(255,210,120,0.14)');
    } });
  // vitral de unicórnio (arco com vidro colorido)
  I.objeto('estabulo-vitral', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var x = px + 4, y = py + 4, w = 24, h = 24;
      ret(ctx, x - 1, y + 5, w + 2, h - 4, K); elipse(ctx, x + 12, y + 6, 13, 7, K);
      var cs = ['#ffb3d9', '#ffe28a', '#9fe0a0', '#9fdcff', '#c9a8ff'];
      for (var i = 0; i < 5; i++) ret(ctx, x + i * 5, y + 5, 4, h - 6, cs[i]);
      elipse(ctx, x + 12, y + 6, 11, 5, '#c9a8ff'); elipse(ctx, x + 12, y + 6, 6, 3, '#ffe28a');
      // unicórnio branco no meio
      ret(ctx, x + 7, y + 13, 10, 5, K); ret(ctx, x + 8, y + 14, 8, 3, C.branco);
      ret(ctx, x + 15, y + 9, 5, 6, K); ret(ctx, x + 16, y + 10, 3, 4, C.branco);
      ret(ctx, x + 18, y + 6, 1, 4, C.ouro); ret(ctx, x + 14, y + 10, 2, 5, '#ff7eb6');
      ret(ctx, x + 8, y + 18, 1, 3, K); ret(ctx, x + 14, y + 18, 1, 3, K); ret(ctx, x + 6, y + 13, 2, 4, '#9b6bd6');
      ret(ctx, x - 1, y + h, w + 2, 2, C.madeira2);
    } });
  // quadro de avisos do estábulo (ferradura e fichinhas)
  I.objeto('estabulo-quadro', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 2, py + 7, 28, 19, C.madeira2); ret(ctx, px + 3, py + 8, 26, 17, '#e8bd84');
      var cs = ['comum', 'raro', 'epico', 'lendario'].map(function (r) { return rar(r, 'fundo'); });
      for (var i = 0; i < 4; i++) {
        var x = px + 5 + (i % 2) * 12, y = py + 10 + Math.floor(i / 2) * 7;
        ret(ctx, x, y, 10, 6, K); ret(ctx, x + 1, y + 1, 8, 4, cs[i]); ret(ctx, x + 2, y + 2, 5, 1, pal('tintaSuave'));
        ret(ctx, x + 4, y, 1, 1, C.vermelho);
      }
    } });
  // mangueira enrolada no suporte
  I.objeto('estabulo-mangueira', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 6, py + 10, 4, 3, K);
      circulo(ctx, px + 8, py + 18, 6, K); circulo(ctx, px + 8, py + 18, 5, '#4caf50');
      circulo(ctx, px + 8, py + 18, 3, K); circulo(ctx, px + 8, py + 18, 2, '#6fdc8c');
      ret(ctx, px + 12, py + 22, 2, 6, K); ret(ctx, px + 12, py + 22, 1, 5, '#4caf50');
      ret(ctx, px + 11, py + 27, 4, 2, C.ouro);
    } });

  /* ================= AJUDANTES DE MONTAGEM ================= */
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  /** NPC do interior com sprite e voz do elenco. @param {string} id @param {number} x @param {number} y
      @param {AcaoNpc} acao @returns {Npc} */
  function npc(id, x, y, acao) {
    /** @type {Partial<PersonagemElenco>} */
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }

  /* ================= GERADOR DAS BAIAS ================= */
  // uma baia para cada unicórnio do baralho; 7 por ala; cada ala = fileira de baias + corredor de 2
  var POR_ALA = 7, LARG = 18;
  var TOTAL = R.Unicornios.todos().length;
  var ALAS = Math.ceil(TOTAL / POR_ALA);
  var ALT_BAIAS = 2 + ALAS * 4;              // parede + alas
  var HALL_Y = 1 + ALT_BAIAS + 1;             // 1 tile de vão entre os cômodos
  // pontas das fileiras: só coisa baixa (uma por ala, sem tapar a vizinha nem a parede)
  // (flores e cenouras também aqui: com o baralho num múltiplo de 7 não sobra cantinho de guardados, e o cômodo
  // continua com 15 tipos ou mais)
  var ESQ = ['cesto', 'estabulo-feno', 'caixote', 'balde', 'flores', 'estabulo-escovas', 'caixote'];
  var DIR = ['caixote', 'barril', 'cesto', 'estabulo-feno', 'caixote', 'balde', 'estabulo-cenouras'];
  var PAREDE = ['janela', 'estabulo-lanterna', 'estabulo-ferraduras', 'estabulo-catavento', 'estabulo-lanterna', 'janela',
    'estabulo-mangueira', 'estabulo-lanterna', 'estabulo-ferraduras', 'janela', 'estabulo-lanterna', 'estabulo-catavento',
    'estabulo-ferraduras', 'estabulo-lanterna', 'janela'];

  function baias() {
    var lista = [];
    PAREDE.forEach(function (t, i) { lista.push({ tipo: t, x: i, y: 0 }); });
    lista.push({ tipo: 'estandarte', x: 15, y: 0, var: { cor: '#ff7eb6', emblema: 'coracao' } });
    lista.push({ tipo: 'estabulo-lanterna', x: 16, y: 0 }, { tipo: 'estandarte', x: 17, y: 0, var: { cor: '#9b6bd6', emblema: 'estrela' } });
    var SOBRA = [['estabulo-feno', 'balde'], ['flores', 'estabulo-cenouras'], ['barril', 'estabulo-feno'], ['cesto', 'balde']];
    for (var n = 0; n < ALAS * POR_ALA; n++) {
      var a = Math.floor(n / POR_ALA), j = n % POR_ALA, bx = 1 + j * 2, by = 2 + a * 4;
      if (n < TOTAL) {
        lista.push({ tipo: 'estabulo-baia', x: bx, y: by, var: { indice: n }, nome: 'Baia', acao: { tipo: 'unicornio', indice: n } });
      } else {
        // fim da última fileira: cantinho de guardados (só enfeite, sem baia vazia prometendo alguém)
        var k = n % SOBRA.length;
        lista.push({ tipo: SOBRA[k][0], x: bx, y: by }, { tipo: SOBRA[k][1], x: bx + 1, y: by });   // só uma fileira: nada empilhado
      }
    }
    // enfeites nas pontas de cada fileira (coluna 0 e coluna 17), na 1ª fileira de cada ala; atrás e à frente fica livre
    for (var y = 2; y < ALT_BAIAS; y++) {
      if ((y - 2) % 4) continue;
      lista.push({ tipo: ESQ[y % ESQ.length], x: 0, y: y });
      lista.push({ tipo: DIR[y % DIR.length], x: 17, y: y });
    }
    return sala(1, 1, lista);
  }

  /* ================= LAYOUT ================= */
  // cômodo das baias em cima (cresce com o baralho); entrada embaixo, com o Seu Feno e o ninho
  var entrada = sala(1, HALL_Y, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'estabulo-ferraduras', x: 1, y: 0 },
    inter('vitral', 'Vitral de unicórnio', { tipo: 'estabulo-vitral', x: 2, y: 0 }),
    { tipo: 'estabulo-lanterna', x: 4, y: 0 }, { tipo: 'estabulo-quadro', x: 5, y: 0 },
    { tipo: 'janela', x: 7, y: 0 }, { tipo: 'estabulo-catavento', x: 8, y: 0 }, { tipo: 'estabulo-lanterna', x: 9, y: 0 },
    { tipo: 'estabulo-mangueira', x: 10, y: 0 }, { tipo: 'estabulo-ferraduras', x: 11, y: 0 }, { tipo: 'janela', x: 12, y: 0 },
    { tipo: 'estabulo-vitral', x: 13, y: 0 }, { tipo: 'estabulo-lanterna', x: 17, y: 0 },
    // fundo
    { tipo: 'estabulo-feno', x: 0, y: 2 }, { tipo: 'estabulo-feno', x: 1, y: 2 },
    inter('cenouras', 'Saco de cenouras', { tipo: 'estabulo-cenouras', x: 1, y: 4 }), { tipo: 'balde', x: 4, y: 2 },
    { tipo: 'barril', x: 5, y: 2 }, { tipo: 'estabulo-sela', x: 6, y: 2 },
    { tipo: 'flores', x: 8, y: 2 }, { tipo: 'cesto', x: 10, y: 2 },
    inter('escovas', 'Escovas de crina', { tipo: 'estabulo-escovas', x: 11, y: 2 }),
    { tipo: 'estabulo-carrinho', x: 13, y: 3 }, { tipo: 'barril', x: 17, y: 2 },
    // meio: Seu Feno, ninho e cocho
    { tipo: 'tapete', x: 2, y: 4, w: 3, h: 2, var: { cor: '#ffc2d8', borda: '#b95a36' } },
    inter('ninho', 'Ninho de ovos', { tipo: 'estabulo-ninho', x: 6, y: 4, acao: { tipo: 'tela', tela: 'ovos' } }),
    { tipo: 'tapete-redondo', x: 6, y: 5, w: 2, h: 2 },
    inter('cocho', 'Cocho de água', { tipo: 'estabulo-cocho', x: 10, y: 4 }),
    { tipo: 'balde', x: 12, y: 4 }, { tipo: 'estabulo-feno', x: 14, y: 5 }, { tipo: 'barril', x: 17, y: 4 },
    { tipo: 'vaso-planta', x: 0, y: 4 }, { tipo: 'estabulo-escovas', x: 0, y: 6 },
    { tipo: 'caixote', x: 2, y: 6, var: { item: 'estrela' } }, { tipo: 'estabulo-cenouras', x: 9, y: 6 },
    { tipo: 'tapete-listrado', x: 11, y: 6, w: 3, h: 1, var: { cores: ['#ff9cc6', '#fff8ee', '#ffd34d', '#fff8ee'] } },
    { tipo: 'estabulo-sela', x: 17, y: 6, var: { cor: '#9b6bd6' } },
    { tipo: 'cesto', x: 3, y: 8 }, { tipo: 'estabulo-feno', x: 4, y: 7 }, { tipo: 'caixote', x: 14, y: 7 }, { tipo: 'caixote', x: 16, y: 8 },
    // frente
    { tipo: 'bau', x: 0, y: 8 }, { tipo: 'banco', x: 6, y: 8 }, { tipo: 'estabulo-escovas', x: 3, y: 10 }, { tipo: 'almofada', x: 5, y: 9, var: { cor: '#ffd34d' } },
    { tipo: 'barril', x: 0, y: 10 }, { tipo: 'balde', x: 4, y: 10 }, { tipo: 'cesto', x: 6, y: 10 },
    { tipo: 'estabulo-carrinho', x: 10, y: 10 }, { tipo: 'vaso-planta', x: 12, y: 10 }, { tipo: 'estabulo-feno', x: 13, y: 10 },
    { tipo: 'estabulo-feno', x: 17, y: 10 }, { tipo: 'estabulo-ferramentas', x: 16, y: 10 },
  ]);

  Reino.registrarInterior({
    id: 'estabulo',
    lugar: 'estabulo',
    nome: 'Estábulo Mágico',
    entrada: true,
    pacote: 'interior-estabulo',
    tamanho: { w: LARG + 2, h: HALL_Y + 12 },
    saida: { x: 9, y: HALL_Y + 10 },
    spawn: { x: 9, y: HALL_Y + 9 },
    comodos: [
      { id: 'entrada', nome: 'Estábulo Mágico', placa: 'Estábulo Mágico', rect: { x: 1, y: HALL_Y, w: LARG, h: 11 },
        piso: 'tabuas', parede: 'madeira', paleta: { piso: '#e6b07a', piso2: '#c98a52', parede: '#fff1d6', parede2: '#ffb070', rodape: '#8a4a2a', detalhe: '#ffd34d' } },
      { id: 'baias', nome: 'Baias', placa: 'Baias', rect: { x: 1, y: 1, w: LARG, h: ALT_BAIAS },
        piso: 'palha', parede: 'madeira', paleta: { piso: '#f5dc8a', piso2: '#dcb458', parede: '#ffe6c4', parede2: '#e8a060', rodape: '#8a4a2a' } },
    ],
    portas: [{ x: 16, y: HALL_Y - 1, w: 2, h: 3 }],   // baias ↔ entrada (atravessa a parede da entrada)
    corredores: [
      { x: 16, y: 3, w: 2, h: ALT_BAIAS - 2 },                       // passagem lateral das baias
      { x: 16, y: HALL_Y + 2, w: 2, h: 9 }, { x: 7, y: HALL_Y + 8, w: 11, h: 2 }, { x: 8, y: HALL_Y + 8, w: 3, h: 3 },
    ].concat(Array.apply(null, Array(ALAS)).map(function (_, a) { return { x: 2, y: 1 + 2 + a * 4 + 2, w: 14, h: 2 }; })),
    objetos: baias().concat(entrada),
    npcs: [
      npc('feno', 4, HALL_Y + 4, { tipo: 'tela', tela: 'estabulo' }),
    // + os registrados com predio: 'estabulo' e x/y (Reino.personagensDoPredio; prédio antigo não tem vagas: sem x/y, o validador acusa)
    ].concat(R.personagensDoPredio('estabulo').filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      return npc(p.id, p.x, p.y, p.acao || { tipo: 'tela', tela: 'estabulo' });
    })),
  });
})();
