/* Ícones dos planetas (Reino.IconesPlanetas): o MESMO desenho do Planetário (Reino.ObservatorioCenas.desenharPlaneta,
   observatorio/planetas.js), num quadro 16×16 (anel em Saturno, faixas em Júpiter, crateras na Lua), e o carimbo do
   passaporte (selo de moldura serrilhada com o planeta dentro, 27×27). Quem usa: ui/foguete.js (destinos e
   passaporte) e ui/album-ets.js; o voo (atividades/voo-desenho.js) usa o desenhar do Planetário direto, maior.
   No carregamento só registra funções (roda no Node, sem DOM); cada quadro é pintado uma vez e fica em cache.
   Sem o Observatório carregado: reserva de um disco na cor do planeta, com contorno. */
(function () {
  var R = window.Reino = window.Reino || {};
  var K = '#3a2446';
  // raio no quadro 16×16 (disco de 13 px + contorno); Saturno menor para o anel caber inteiro
  var RAIO = { saturno: 3, sol: 4 }, RAIO_PADRAO = 6;
  var cache = {};

  function novo(w, h) {
    var c = window.PA.novoCanvas(w, h), x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return c;
  }
  // reserva: disco liso com contorno e um brilho de 1 px no alto à esquerda
  function disco(x, cor, cx, cy, r) {
    for (var j = -r - 1; j <= r + 1; j++) for (var i = -r - 1; i <= r + 1; i++) {
      var d = Math.sqrt(i * i + j * j);
      if (d > r + 0.5) continue;
      x.fillStyle = d > r - 0.5 ? K : cor;
      x.fillRect(cx + i, cy + j, 1, 1);
    }
    x.fillStyle = '#ffffff'; x.fillRect(cx - Math.round(r * 0.45), cy - Math.round(r * 0.45), 1, 1);
  }
  // desenha o planeta com o centro em (cx, cy): o do Planetário ou a reserva
  function pintar(x, id, cor, cx, cy, r) {
    var OC = R.ObservatorioCenas;
    if (OC && OC.desenharPlaneta) {
      try { OC.desenharPlaneta(x, id, cx, cy, r); return; } catch (e) { if (window.console) console.error(e); }
    }
    disco(x, cor || '#c9c9d6', cx, cy, r);
  }

  // o planeta num quadro 16×16 (centro no pixel 8, 8)
  function icone(id, cor) {
    var k = 'i|' + id;
    if (cache[k]) return cache[k];
    var c = novo(16, 16);
    pintar(c.getContext('2d'), id, cor, 8, 8, RAIO[id] || RAIO_PADRAO);
    cache[k] = c;
    return c;
  }
  // o mesmo desenho só em silhueta (cor única), mantendo o contorno
  function silhueta(src, cor) {
    var c = novo(src.width, src.height), x = c.getContext('2d');
    x.drawImage(src, 0, 0);
    var img = x.getImageData(0, 0, c.width, c.height), d = img.data;
    var r = parseInt(cor.slice(1, 3), 16), g = parseInt(cor.slice(3, 5), 16), b = parseInt(cor.slice(5, 7), 16);
    for (var i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      var contorno = d[i] === 0x3a && d[i + 1] === 0x24 && d[i + 2] === 0x46;
      if (!contorno) { d[i] = r; d[i + 1] = g; d[i + 2] = b; }
      d[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return c;
  }

  // carimbo 27×27: papel de selo 23×23 (2 a 24) com a borda picotada (um dente a cada 3 px, simétrico),
  // contorno por fora, filete na cor do planeta e, dentro, o planeta no céu (--noite). Sem carimbo: papel
  // lilás, fundo claro e o planeta em silhueta (--tinta-suave com contorno).
  var S = 27, A = 2, B = 24;
  function papel(x, y) {
    if (x < A || y < A || x > B || y > B) return false;
    var borda = x === A || x === B || y === A || y === B;
    if (!borda) return true;
    var ao = (x === A || x === B) ? y : x;   // posição ao longo da borda
    return (ao - A) % 3 !== 2;
  }
  function carimbo(id, cor, feito) {
    var k = 'c|' + id + '|' + (feito ? 1 : 0);
    if (cache[k]) return cache[k];
    var c = novo(S, S), x = c.getContext('2d');
    var corPapel = feito ? '#fff8ee' : '#e9e0f2', fundo = feito ? '#24162e' : '#fff8ee';
    var filete = feito ? (cor || '#c9b6ff') : '#b9a8cc';
    for (var y = 0; y < S; y++) for (var i = 0; i < S; i++) {
      var p = papel(i, y);
      if (!p) {
        // contorno de 1 px por fora do papel (4 vizinhos)
        if (papel(i - 1, y) || papel(i + 1, y) || papel(i, y - 1) || papel(i, y + 1)) { x.fillStyle = K; x.fillRect(i, y, 1, 1); }
        continue;
      }
      x.fillStyle = corPapel; x.fillRect(i, y, 1, 1);
    }
    // filete (4 e 22) e o céu de dentro (5 a 21)
    x.fillStyle = filete; x.fillRect(4, 4, 19, 19);
    x.fillStyle = fundo; x.fillRect(5, 5, 17, 17);
    var ic = icone(id, cor);
    x.drawImage(feito ? ic : silhueta(ic, '#6b5378'), 5, 5);
    // no carimbado, 2 estrelinhas no céu
    if (feito) { x.fillStyle = '#fff6a8'; x.fillRect(7, 19, 1, 1); x.fillRect(19, 7, 1, 1); }
    cache[k] = c;
    return c;
  }

  // no DOM, nítido: 2 px CSS por pixel de arte (ui.md §10.10)
  function dom(src, classe) {
    var PA = window.PA;
    return PA.paraDOM(src, PA.escalaNitida(2 * src.width, src.width), classe);
  }

  R.IconesPlanetas = {
    // p: um planeta de Reino.Viagem.planetas() ({ id, cor }) ou só o id
    icone: function (p) { p = typeof p === 'string' ? { id: p } : p || {}; return icone(p.id || 'lua', p.cor); },
    carimbo: function (p, feito) { p = typeof p === 'string' ? { id: p } : p || {}; return carimbo(p.id || 'lua', p.cor, !!feito); },
    iconeDOM: function (p, classe) { return dom(R.IconesPlanetas.icone(p), classe); },
    carimboDOM: function (p, feito, classe) { return dom(R.IconesPlanetas.carimbo(p, feito), classe); },
  };
})();
