/* Parquinho, parte 9: as contas do balanço, sem desenho (P.Balanco; docs/contratos/parquinho.md). Quanto ele está
   puxado, como vai e volta depois de soltar, quando chega no pico da frente, o voo até a caixa de areia e o tile onde
   ela fica no fim. Quem usa: poses-balanco.js (sempre na hora, nunca no carregamento) e o teste
   parquinho-balanco.test.js. Números em Reino.config.parquinho.balanco.
   a = o balanço de -1 (puxado todo para trás) a +1 (todo para a frente, na direção da câmera); 0 = parado no meio.
   Nada de DOM, canvas, PA, Progresso nem Cena aqui. */
(function () {
  var R = window.Reino;
  var P = R._predios.parquinho;
  var PARADO = 0.03;                    // amplitude abaixo disto: o balanço parou
  var ANG_MAX = 65 * Math.PI / 180;     // o ângulo das correntes com a = ±1
  var FUNDO = 0.8;                      // px de tela por px de profundidade (a câmera olha de cima, meio de lado)
  var FUNDO_TRAS = 0.15;                // para trás o assento quase só sobe: ela não some atrás da barra
  var Bal = P.Balanco = {};

  function cfg() { return R.config.parquinho.balanco; }
  function limitar(v, a, b) { return v < a ? a : v > b ? b : v; }
  function meia(c) { return c.periodoMs / 2; }

  // amplitude que sobra ms depois de soltar em a0 (perde `amortece` a cada ida)
  Bal.amplitude = function (a0, ms, c) { c = c || cfg(); return Math.abs(a0) * Math.pow(c.amortece, Math.max(0, ms) / meia(c)); };
  Bal.parou = function (a0, ms, c) { return Bal.amplitude(a0, ms, c) < PARADO; };
  // onde o balanço solto em a0 está ms depois: vai e volta (cosseno), cada vez menos
  Bal.solto = function (a0, ms, c) {
    c = c || cfg();
    if (Bal.parou(a0, ms, c)) return 0;
    return a0 * Math.pow(c.amortece, Math.max(0, ms) / meia(c)) * Math.cos(2 * Math.PI * Math.max(0, ms) / c.periodoMs);
  };
  // quando (ms depois de soltar) ele chega no 1º pico da frente: de trás, meia ida e volta; já da frente, uma inteira
  Bal.picoFrente = function (a0, c) { c = c || cfg(); return a0 > 0 ? c.periodoMs : meia(c); };
  // os picos (ms depois de soltar) que ainda merecem um som: amplitude de pelo menos `min`
  Bal.picos = function (a0, c, min) {
    c = c || cfg();
    var r = [];
    for (var k = 1; k <= 40 && Bal.amplitude(a0, k * meia(c), c) >= (min || 0.12); k++) r.push(k * meia(c));
    return r;
  };
  // puxou tudo: eles voam para a caixa de areia
  Bal.voa = function (puxao, c) { c = c || cfg(); return Math.abs(puxao) >= c.cheio; };
  // a direção do arrasto, decidida no 1º movimento: para baixo = para a frente; para cima ou para o lado = para trás
  Bal.direcao = function (dx, dy) { return dy > 0 && dy >= Math.abs(dx) ? 1 : -1; };
  // arrastou (dx, dy) px CSS na direção dir, a partir de a0 (onde o balanço estava quando ela apertou)
  Bal.arrasto = function (a0, dx, dy, dir, c) {
    c = c || cfg();
    return limitar(a0 + dir * Math.sqrt(dx * dx + dy * dy) / c.puxarPx, -1, 1);
  };
  // segurando a tecla ms: de a0 para trás, até o fim em teclaMs
  Bal.tecla = function (a0, ms, c) { c = c || cfg(); return limitar(a0 - Math.max(0, ms) / c.teclaMs, -1, 1); };

  // o assento com corrente de L px: dy = quanto ele fica abaixo da barra na tela; chao = quanto a sombra no chão
  // avança (para a frente, +) ou recua (para trás, -). Para trás ele sobe; para a frente desce um pouco e vem para perto.
  Bal.assento = function (a, L) {
    var f = limitar(a, -1, 1) * ANG_MAX, z = L * Math.sin(f);
    return { dy: L * Math.cos(f) + z * (z > 0 ? FUNDO : FUNDO_TRAS), chao: z * FUNDO };
  };
  // o voo em arco, k de 0 a 1: de = { x, y (pés na tela), chao (a linha do chão embaixo) } até ate = { x, y } (no chão),
  // subindo `alto` px além de onde saiu. Devolve { x, y (pés), chao, h (altura) }.
  Bal.voo = function (k, de, ate, alto) {
    k = limitar(k, 0, 1);
    var chao = de.chao + (ate.y - de.chao) * k, h = (de.chao - de.y) * (1 - k) + 4 * alto * k * (1 - k);
    return { x: Math.round(de.x + (ate.x - de.x) * k), y: Math.round(chao - h), chao: Math.round(chao), h: h };
  };
  // a cambalhota em passos de 90° (nada de girar pela metade: o pixel não borra): 0..3, voltas inteiras no voo
  Bal.quarto = function (k, voltas) { return k <= 0 || k >= 1 ? 0 : Math.floor(k * 4 * (voltas || 1)) % 4; };

  // a caixa de areia do interior (o objeto 'parquinho-areia'): { x, y, w, h } em tiles, ou null
  Bal.caixa = function (objetos) {
    var I = R.Interiores;
    for (var i = 0; i < (objetos || []).length; i++) {
      var o = objetos[i];
      if (o.tipo !== 'parquinho-areia') continue;
      var lib = (I && I.OBJETOS[o.tipo]) || {};
      return { x: o.x, y: o.y, w: o.w || lib.w || 1, h: o.h || lib.h || 1 };
    }
    return null;
  };
  // o tile livre ao lado da caixa onde ela fica no fim: embaixo (meio, esquerda, direita), à direita, à esquerda, em
  // cima; solido(x, y) diz se o tile está ocupado. Tudo ocupado: o de baixo, do meio.
  Bal.ladoDaCaixa = function (cx, solido) {
    var meio = cx.x + Math.floor(cx.w / 2), lista = [[meio, cx.y + cx.h], [cx.x, cx.y + cx.h], [cx.x + cx.w - 1, cx.y + cx.h]], j, i;
    for (j = cx.h - 1; j >= 0; j--) lista.push([cx.x + cx.w, cx.y + j]);
    for (j = cx.h - 1; j >= 0; j--) lista.push([cx.x - 1, cx.y + j]);
    for (i = 0; i < cx.w; i++) lista.push([cx.x + i, cx.y - 1]);
    for (i = 0; i < lista.length; i++) if (!solido || !solido(lista[i][0], lista[i][1])) return { x: lista[i][0], y: lista[i][1] };
    return { x: meio, y: cx.y + cx.h };
  };
})();
