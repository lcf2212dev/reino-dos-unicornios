/* Ilustrações em pixel art maiores que um ícone (cenas de uma questão, poema visual), redesenhadas em código no
   estilo do jogo. Registro só de dados (node: true); o canvas só nasce no navegador, quando a carta ou a questão
   mostra a ilustração. Contrato: docs/contratos/quarto-bimestre.md §4 (bloco `ilustracao`) e §12 (`figura`).
     Reino.registrarIlustracao(id, def)   def = { w, h, linhas: ['..kk..', …], paleta: { k: '#3a2446', … } }
                                          ou   { w, h, desenhar(ctx, D) }   (D = Reino.Desenho: ret, circulo, K…)
     Reino.ilustracao(id) → def | null ;  Reino.ilustracoes() → [ids]
     Reino.canvasIlustracao(id) → canvas 1× (cacheado) | null   (só no navegador) */
(function () {
  var R = window.Reino;
  var defs = {};
  var cache = {};
  function tem(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  R.registrarIlustracao = function (id, def) {
    if (typeof id !== 'string' || !id) throw new Error('ilustração sem id');
    if (tem(defs, id)) throw new Error('ilustração repetida: ' + id);
    if (!def || !(def.w > 0 && def.h > 0)) throw new Error('ilustração ' + id + ': sem w e h');
    if (def.linhas) {
      if (def.linhas.length !== def.h || def.linhas.some(function (l) { return typeof l !== 'string' || l.length !== def.w; })) throw new Error('ilustração ' + id + ': linhas fora de ' + def.w + '×' + def.h);
      var falta = def.linhas.join('').split('').filter(function (c) { return c !== '.' && !(def.paleta && tem(def.paleta, c)); });
      if (falta.length) throw new Error('ilustração ' + id + ': letras sem cor na paleta: ' + falta.filter(function (c, i) { return falta.indexOf(c) === i; }).join(' '));
    } else if (typeof def.desenhar !== 'function') throw new Error('ilustração ' + id + ': sem linhas nem desenhar');
    defs[id] = def;
  };
  R.ilustracao = function (id) { return tem(defs, id) ? defs[id] : null; };
  R.ilustracoes = function () { return Object.keys(defs); };

  R.canvasIlustracao = function (id) {
    var def = R.ilustracao(id);
    if (!def || typeof document === 'undefined') return null;
    if (cache[id]) return cache[id];
    var c = document.createElement('canvas');
    c.width = def.w; c.height = def.h;
    var ctx = c.getContext('2d');
    if (def.linhas) {
      def.linhas.forEach(function (l, y) {
        for (var x = 0; x < l.length; x++) {
          var k = l.charAt(x);
          if (k === '.') continue;
          ctx.fillStyle = def.paleta[k];
          ctx.fillRect(x, y, 1, 1);
        }
      });
    } else def.desenhar(ctx, R.Desenho);
    cache[id] = c;
    return c;
  };
})();
