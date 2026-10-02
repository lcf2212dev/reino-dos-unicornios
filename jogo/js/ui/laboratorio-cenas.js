/* Ilustrações em grade de pixels: só redesenha após uma ação, sem laço ou timers. */
(function () {
  var L = window.Reino._laboratorio;
  L.cena = function (id, escolha, estado) {
    estado = estado || { etapa: 0, fios: [false, false] };
    var cv = L.el('canvas', 'laboratorio-cena'); cv.width = 160; cv.height = 80;
    cv.setAttribute('aria-hidden', 'true');
    var c = cv.getContext('2d'), tinta = '#3a2446';
    function r(x, y, w, h, cor) { c.fillStyle = cor; c.fillRect(Math.round(x), Math.round(y), w, h); }
    function caixa(x, y, w, h, cor) { r(x, y, w, h, tinta); r(x + 1, y + 1, w - 2, h - 2, cor); r(x + 2, y + 2, w - 4, 1, '#ffffff'); }
    function vaso(x, y) { caixa(x, y, 35, 38, '#d6eef8'); r(x + 2, y + 26, 31, 10, '#9dd9ed'); r(x + 4, y + 24, 27, 5, '#ffffff'); }
    function flor(x, y) { caixa(x + 3, y + 6, 3, 12, '#4e873d'); caixa(x, y, 10, 9, '#ff9cc6'); caixa(x + 3, y + 3, 4, 4, '#f8d36e'); }
    r(0, 0, 160, 80, '#eaf8f4'); r(0, 62, 160, 18, '#d1b390'); r(0, 62, 160, 2, tinta);
    for (var t = 0; t < 160; t += 16) r(t, 64, 1, 16, '#b89579');
    if (id === 'flutua' || id === 'mistura') {
      caixa(34, 17, 90, 48, '#d6eef8'); r(36, 35, 86, 28, '#9dd9ed'); r(36, 34, 86, 1, '#2f6fd6');
      if (escolha >= 0) {
        if (id === 'flutua') caixa(68, escolha === 1 ? 53 : 30, 20, 9, ['#b88b57', '#8a8294', '#ff9cc6'][escolha]);
        else if (escolha === 2) { r(36, 35, 86, 7, '#edc856'); r(36, 42, 86, 1, '#987929'); }
        else if (escolha === 1 || !estado.etapa) { for (var g = 0; g < 16; g++) r(60 + (g % 8) * 4, 56 + Math.floor(g / 8) * 3, 2, 2, escolha ? '#a06b39' : '#ffffff'); }
        else { for (var d = 0; d < 15; d++) r(43 + d * 5, 43 + (d % 3) * 5, 1, 1, '#d6eef8'); }
        if (id === 'mistura' && estado.etapa) { caixa(99, 15, 3, 35, '#b88b57'); caixa(96, 46, 9, 7, '#b88b57'); }
      }
    } else if (id === 'ima') {
      caixa(24, 26, 27, 25, '#e0433f'); r(33, 26, 9, 17, '#eaf8f4'); caixa(24, 24, 9, 8, '#d6eef8'); caixa(42, 24, 9, 8, '#d6eef8');
      var x = escolha === 0 ? 58 : 106;
      if (escolha !== 1 && escolha !== 2) { caixa(x, 32, 7, 18, '#a0acba'); r(x + 2, 35, 3, 11, '#eaf8f4'); }
      if (escolha === 1) caixa(x, 37, 23, 8, '#b88b57');
      if (escolha === 2) { caixa(x, 30, 21, 20, '#c8d4e2'); r(x + 5, 36, 9, 1, '#ffffff'); }
    } else if (id === 'sombra') {
      var pos = [69, 44, 19][Math.max(0, escolha)], tamanho = [40, 28, 20][Math.max(0, escolha)];
      caixa(136, 7, 9, 56, '#c8b9de'); r(138, 36 - tamanho / 2, 5, tamanho, tinta);
      c.fillStyle = '#fff0b3'; c.beginPath(); c.moveTo(pos + 14, 35); c.lineTo(136, 9); c.lineTo(136, 62); c.fill();
      caixa(pos, 30, 15, 12, '#e0a020'); caixa(104, 29, 9, 17, '#8a5a3a');
    } else if (id === 'broto') {
      vaso(28, 26); vaso(96, 26); r(98, 52, 31, 10, '#fff5d6'); r(100, 50, 27, 5, '#ffffff');
      [42, 110].forEach(function (sx) { caixa(sx, 48, 8, 5, '#b88b57'); });
      var h = estado.etapa * 6;
      if (h) { caixa(45, 48 - h, 3, h + 3, '#4e873d'); r(45, 53, 2, Math.min(9, estado.etapa * 2), '#fff5d6'); }
      if (estado.etapa > 1) { caixa(35, 45 - h, 11, 7, '#85bd62'); caixa(47, 39 - h, 11, 7, '#85bd62'); }
      r(24, 70, 43, 2, '#2f6fd6'); r(92, 70, 43, 2, '#b88b57');
    } else if (id === 'circuito') {
      var aceso = estado.fios.every(Boolean);
      // Bulbo em degraus: o vidro termina no pescoço; os fios chegam só aos dois contatos da base.
      r(74, 8, 12, 2, tinta); r(70, 10, 20, 3, tinta); r(68, 13, 24, 15, tinta);
      r(70, 28, 20, 4, tinta); r(73, 32, 14, 3, tinta);
      var vidro = aceso ? '#f8d36e' : '#d6eef8';
      r(74, 10, 12, 3, vidro); r(71, 13, 18, 15, vidro); r(73, 28, 14, 4, vidro);
      r(72, 14, 2, 8, '#ffffff');
      // Filamento dentro do vidro e casquilho metálico, isolado do contato inferior.
      r(76, 22, 2, 10, '#a0744a'); r(82, 22, 2, 10, '#a0744a'); r(77, 21, 6, 2, '#a0744a');
      caixa(73, 34, 14, 8, '#a0acba'); r(75, 37, 10, 1, tinta); r(75, 40, 10, 1, tinta);
      r(77, 42, 7, 2, tinta); caixa(79, 44, 3, 3, '#a0acba');
      // Pilha deitada. Polo positivo à esquerda; polo negativo à direita.
      caixa(61, 55, 38, 12, '#e0a020'); r(84, 56, 14, 10, '#a0acba');
      caixa(59, 58, 3, 6, '#a0acba'); caixa(98, 58, 3, 6, '#a0acba');
      r(67, 58, 2, 6, tinta); r(65, 60, 6, 2, tinta); r(90, 60, 5, 2, tinta);
      // Vermelho: positivo → lateral do casquilho. Azul: negativo → contato inferior.
      r(28, 35, 45, 2, '#e0433f'); r(28, 35, 2, 27, '#e0433f');
      r(28, 60, 13, 2, '#e0433f'); r(52, 60, 8, 2, '#e0433f');
      r(81, 45, 51, 2, '#2f6fd6'); r(130, 45, 2, 17, '#2f6fd6');
      r(100, 60, 10, 2, '#2f6fd6'); r(121, 60, 11, 2, '#2f6fd6');
      if (estado.fios[0]) r(41, 60, 11, 2, '#e0433f');
      else { r(39, 59, 2, 4, '#a0acba'); r(52, 59, 2, 4, '#a0acba'); }
      if (estado.fios[1]) r(110, 60, 11, 2, '#2f6fd6');
      else { r(108, 59, 2, 4, '#a0acba'); r(121, 59, 2, 4, '#a0acba'); }
      if (aceso) { r(79, 1, 2, 4, '#e0a020'); r(57, 18, 6, 2, '#e0a020'); r(97, 18, 6, 2, '#e0a020'); }
    } else if (id === 'polen') {
      flor(29, 36); flor(113, 34); caixa(74, 23, 15, 10, '#f8d36e'); r(79, 24, 3, 8, tinta); caixa(75, 16, 8, 7, '#d6eef8');
    } else if (id === 'memoria') {
      [26, 65, 104].forEach(function (x, i) { caixa(x, 19, 27, 36, ['#d6eef8', '#f8d36e', '#9fe0a0'][i]); caixa(x + 9, 29, 10, 13, '#b58cff'); });
    } else { caixa(25, 18, 18, 18, '#f8d36e'); caixa(76, 18, 40, 15, '#ffffff'); r(80, 39, 2, 8, '#2f6fd6'); r(100, 44, 2, 8, '#2f6fd6'); r(40, 57, 73, 5, '#9dd9ed'); }
    return cv;
  };
})();
