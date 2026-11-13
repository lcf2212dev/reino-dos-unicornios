// Varredura de layout: a parte que roda NA PÁGINA (varredura.js manda cada função inteira por page.evaluate; por
// isso cada uma se basta: nada de fora, nada de Node). Não muda o jogo: só lê a geometria da tela aberta.
//   medir({ raiz, toque })  olha a tela `raiz` (seletor) e devolve { achados: [{ tipo, onde, texto, det }], rola }
//     tipos (o que a geometria mostra de quebrado; a regra de cada um está em varredura.js, TIPOS):
//     vaza, cortado, rola-de-lado, vaza-baixo, cortado-baixo, rola-dentro, resposta-nao-cabe, fora-da-tela,
//     palavra-partida, sobreposto, coberto, inalcancavel, fim-coberto, texto-cru, emoji-texto, imagem-vazia,
//     acento-deslocado, letra-pequena, alvo-pequeno
//     toque: true = também traz cada controle para o meio da tela e confere que o toque chega nele (rola e devolve
//     a rolagem ao lugar)
//   rolarFotos({ raiz, passo })  rola a área principal da tela um passo para baixo; devolve false no fim

function medir(op) {
  var raiz = document.querySelector(op.raiz);
  if (!raiz) return { achados: [{ tipo: 'sem-tela', onde: op.raiz, texto: '', det: '' }], rola: null };
  var vw = window.innerWidth, vh = window.innerHeight, TOL = 1.5;
  var achados = [], vistos = {};
  var cs = function (e) { return getComputedStyle(e); };
  function nome(e) {
    var c = typeof e.className === 'string' ? e.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.') : '';
    return e.tagName.toLowerCase() + (c ? '.' + c : '');
  }
  function onde(e) { var p = []; for (var x = e; x && x !== raiz.parentElement && p.length < 3; x = x.parentElement) p.unshift(nome(x)); return p.join(' > '); }
  function trecho(e) {
    var t = /^(INPUT|TEXTAREA)$/.test(e.tagName) ? e.value : e.textContent;
    return String(t || '').replace(/\s+/g, ' ').trim().slice(0, 70);
  }
  function achar(tipo, e, det, chave) {
    var k = tipo + '|' + (chave || onde(e) + '|' + trecho(e));
    if (vistos[k]) return;
    vistos[k] = 1;
    achados.push({ tipo: tipo, onde: onde(e), texto: trecho(e), det: det || '' });
  }
  function visivel(e) {
    if (e.checkVisibility && !e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    var r = e.getBoundingClientRect();
    return r.width > 0.5 && r.height > 0.5;
  }
  var todos = Array.prototype.filter.call(raiz.querySelectorAll('*'), visivel);

  // a área que rola na vertical (o corpo da missão, o conteúdo do painel): a maior das que rolam de verdade (ou, se
  // nada rola, a maior que poderia rolar)
  var rolaveis = [raiz].concat(todos).filter(function (e) { return /auto|scroll/.test(cs(e).overflowY) && e.clientHeight > 0; });
  var rola = function (e) { return e.scrollHeight - e.clientHeight > 3; };
  var maior = function (l) { return l.reduce(function (m, e) { return !m || e.clientWidth * e.clientHeight > m.clientWidth * m.clientHeight ? e : m; }, null); };
  var rolador = maior(rolaveis.filter(rola)) || maior(rolaveis);
  // o que se vê de `e`: a caixa dele cortada por toda caixa de cima que corta ou rola (null = nada à vista)
  function aVista(e) {
    var r = e.getBoundingClientRect(), v = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    for (var x = e.parentElement; x && x !== raiz.parentElement; x = x.parentElement) {
      var s = cs(x);
      if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
      var c = x.getBoundingClientRect(), l = c.left + x.clientLeft, t = c.top + x.clientTop;
      if (s.overflowX !== 'visible') { v.left = Math.max(v.left, l); v.right = Math.min(v.right, l + x.clientWidth); }
      if (s.overflowY !== 'visible') { v.top = Math.max(v.top, t); v.bottom = Math.min(v.bottom, t + x.clientHeight); }
    }
    return v.right - v.left > 1 && v.bottom - v.top > 1 ? v : null;
  }

  // quem passa da borda de `e` (direita ou de baixo): o descendente que mais passa
  function culpado(e, eixo) {
    var r = e.getBoundingClientRect();
    var lim = eixo === 'x' ? r.left + e.clientLeft + e.clientWidth : r.top + e.clientTop + e.clientHeight, pior = null, quanto = 0;
    Array.prototype.forEach.call(e.querySelectorAll('*'), function (f) {
      if (!visivel(f)) return;
      var q = f.getBoundingClientRect(), passa = (eixo === 'x' ? q.right : q.bottom) - lim;
      if (passa > quanto + 0.5 || (passa > TOL && pior && pior.contains(f) && passa >= quanto - 0.5)) { quanto = Math.max(quanto, passa); pior = f; }
    });
    if (pior) return pior;
    // nenhum descendente passa: o texto da própria caixa? (senão é enfeite, um ::after mais largo: não conta)
    var rg0 = document.createRange();
    rg0.selectNodeContents(e);
    var q0 = rg0.getBoundingClientRect();
    return e.textContent.trim() && (eixo === 'x' ? q0.right : q0.bottom) - lim > TOL ? e : null;
  }

  /* 1 e 2: conteúdo maior que a caixa (dos mais fundos para os de fora: o mesmo culpado conta uma vez) */
  todos.slice().reverse().forEach(function (e) {
    var s = cs(e), campo = /^(INPUT|TEXTAREA)$/.test(e.tagName);
    var px = e.scrollWidth - e.clientWidth;
    if (e.clientWidth > 0 && px > TOL) {
      if (campo) achar('resposta-nao-cabe', e, 'o texto passa ' + px + 'px da caixa');
      else {
        var c = culpado(e, 'x'), chave = c && onde(c) + '|' + trecho(c);
        if (!/visible|hidden|clip/.test(s.overflowX)) achar('rola-de-lado', e, px + 'px de rolagem de lado');
        else if (c && s.overflowX === 'visible') achar('vaza', c, 'passa ' + px + 'px de ' + nome(e), chave);
        else if (c) achar('cortado', c, 'some ' + px + 'px em ' + nome(e), chave);
      }
    }
    var py = e.scrollHeight - e.clientHeight;
    if (!campo && e.clientHeight > 0 && py > 3) {
      if (/auto|scroll/.test(s.overflowY)) {
        // rolar na vertical é o normal; o aviso é a rolagem DENTRO de outra área que também rola
        var fora = false;
        for (var x = e.parentElement; x && x !== raiz.parentElement && !fora; x = x.parentElement) fora = rolaveis.indexOf(x) >= 0 && rola(x);
        if (fora) achar('rola-dentro', e, py + 'px de rolagem dentro de outra área que rola');
      } else {
        var b = culpado(e, 'y'), ch = b && onde(b) + '|' + trecho(b);
        if (b && s.overflowY === 'visible') achar('vaza-baixo', b, 'passa ' + py + 'px de ' + nome(e), ch);
        else if (b) achar('cortado-baixo', b, 'some ' + py + 'px em ' + nome(e), ch);
      }
    }
  });

  /* 3: fora da tela pelos lados, sem caixa que corte (a cortada já saiu acima) */
  function cortadoPor(e) {
    for (var x = e.parentElement; x && x !== raiz.parentElement; x = x.parentElement) if (cs(x).overflowX !== 'visible') return true;
    return false;
  }
  function foraDosLados(e) { var r = e.getBoundingClientRect(); return r.left < -TOL || r.right > vw + TOL; }
  todos.forEach(function (e) {
    if (!foraDosLados(e) || cortadoPor(e) || (e.parentElement && e !== raiz && foraDosLados(e.parentElement))) return;
    var r = e.getBoundingClientRect();
    achar('fora-da-tela', e, 'de ' + Math.round(r.left) + ' a ' + Math.round(r.right) + ' numa tela de ' + vw + 'px');
  });

  /* 4: palavra partida no meio sem hífen (arte.md §17.2); 7: letra pequena; 8 e 9: marcação e emoji crus */
  var CRU = /undefined|\bnull\b|\bNaN\b|\[object |[{}]|\\n|&(nbsp|amp|lt|gt|quot);|<\/?(b|i|br|span|strong|em|u)\b/;
  var tw = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT), n, rg = document.createRange(), fontes = {};
  while ((n = tw.nextNode())) {
    var pai = n.parentElement, t = n.nodeValue;
    if (!pai || !t.trim() || /^(SCRIPT|STYLE|TEXTAREA|OPTION)$/.test(pai.tagName) || !visivel(pai)) continue;
    var fonte = Math.round(parseFloat(cs(pai).fontSize) * 10) / 10;
    fontes[fonte] = (fontes[fonte] || 0) + 1;
    if (fonte < 12) achar('letra-pequena', pai, fonte + 'px', fonte + '|' + onde(pai));
    var cru = CRU.exec(t);
    if (cru) achar('texto-cru', pai, '"' + cru[0] + '"');
    var emo = t.match(/\p{Extended_Pictographic}/gu);
    if (emo) achar('emoji-texto', pai, emo.filter(function (x, i) { return emo.indexOf(x) === i; }).join(' '));
    rg.selectNodeContents(n);
    if (rg.getClientRects().length < 2) continue;   // o nó inteiro numa linha só
    var re = /[^\s ​]+/g, m;
    while ((m = re.exec(t))) {
      if (m[0].length < 2) continue;
      rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
      if (rg.getClientRects().length < 2) continue;
      var antes = null, partida = false;
      for (var k = m.index; k < m.index + m[0].length; k++) {
        rg.setStart(n, k); rg.setEnd(n, k + 1);
        // a caixa da letra é a última: a 1ª letra de uma linha traz junto uma caixa vazia no fim da linha de cima
        var qs = rg.getClientRects(), q = null;
        for (var z = qs.length - 1; z >= 0 && !q; z--) if (qs[z].width > 0.1) q = qs[z];
        if (!q) continue;   // hífen suave que não quebrou
        if (antes && q.top - antes.top > antes.height * 0.5 && !/[-­‐‑\/]/.test(t[k - 1])) partida = true;
        antes = q;
      }
      if (partida) achar('palavra-partida', pai, '"' + m[0].replace(/­/g, '·') + '"');
    }
  }

  /* 5: caixas uma em cima da outra na mesma camada (o que é posto por cima de propósito fica em outra camada) */
  var CONTROLE = 'button, input, textarea, select, [role="button"], canvas, img, svg, td, th';
  function textoProprio(e) {
    for (var x = e.firstChild; x; x = x.nextSibling) if (x.nodeType === 3 && x.nodeValue.trim()) return true;
    return false;
  }
  function camada(e) {
    for (var x = e; x && x !== raiz; x = x.parentElement) if (/absolute|fixed|sticky/.test(cs(x).position)) return x;
    return raiz;
  }
  var caixas = todos.filter(function (e) { return e.matches(CONTROLE) || (textoProprio(e) && !/^inline$/.test(cs(e).display)); }).slice(0, 400)
    .map(function (e) { return { e: e, r: aVista(e), c: camada(e) }; }).filter(function (x) { return x.r; });
  for (var i = 0; i < caixas.length; i++) for (var j = i + 1; j < caixas.length; j++) {
    var A = caixas[i], B = caixas[j];
    if (A.c !== B.c || A.e.contains(B.e) || B.e.contains(A.e)) continue;
    var lx = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left), ly = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
    if (lx > 2 && ly > 2) achar('sobreposto', A.e, Math.round(lx) + '×' + Math.round(ly) + 'px em cima de ' + nome(B.e) + ' "' + trecho(B.e).slice(0, 30) + '"');
  }

  /* 6: o toque chega em cada controle? (traz para o meio da tela; no fim a rolagem volta) */
  var controles = todos.filter(function (e) {
    return e.matches('button, input, textarea, select, [role="button"]') && !e.disabled && e.getAttribute('aria-disabled') !== 'true';
  });
  controles.forEach(function (e) {
    var r = e.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) achar('alvo-pequeno', e, Math.round(r.width) + '×' + Math.round(r.height) + 'px');
  });
  if (op.toque) {
    var guardado = [raiz].concat(todos).filter(function (e) { var s = cs(e); return /auto|scroll/.test(s.overflowY + s.overflowX) || e.scrollTop || e.scrollLeft; })
      .map(function (e) { return [e, e.scrollTop, e.scrollLeft]; });
    var dentro = function (e, t) { return !!t && (t === e || e.contains(t) || (t.closest('label') && t.closest('label').contains(e))); };
    controles.slice(0, 150).forEach(function (e) {
      e.scrollIntoView({ block: 'center', inline: 'center' });
      var r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (x < 0 || x > vw || y < 0 || y > vh) { achar('inalcancavel', e, 'o meio fica em ' + Math.round(x) + ',' + Math.round(y)); return; }
      var t = document.elementFromPoint(x, y);
      if (!dentro(e, t)) achar('coberto', e, 'por ' + (t ? nome(t) : 'nada'));
    });
    // o fim do que rola: a última coisa da área aparece inteira acima do rodapé?
    if (rolador) {
      rolador.scrollTop = rolador.scrollHeight;
      // a de mais baixo na tela (não a última do HTML: em duas colunas a última fica em cima)
      // (o que se vê dela: o que uma caixa de dentro corta ou rola não conta)
      var ultimo = null, u = null;
      Array.prototype.forEach.call(rolador.querySelectorAll('*'), function (e) {
        if (e.children.length || !visivel(e)) return;
        var v = aVista(e);
        if (v && (!u || v.bottom > u.bottom)) { u = v; ultimo = e; }
      });
      if (ultimo) {
        var tu = document.elementFromPoint(Math.min(vw - 2, Math.max(2, (u.left + u.right) / 2)), u.bottom - 2);
        if (!tu || !rolador.contains(tu)) achar('fim-coberto', ultimo, 'por ' + (tu ? nome(tu) : 'nada'));
      }
    }
    guardado.forEach(function (g) { g[0].scrollTop = g[1]; g[0].scrollLeft = g[2]; });
  }

  /* 10: figura sem tamanho */
  Array.prototype.forEach.call(raiz.querySelectorAll('canvas, img'), function (e) {
    if (e.tagName === 'CANVAS' ? !(e.width && e.height) : e.complete && !e.naturalWidth) achar('imagem-vazia', e.parentElement || e, nome(e));
  });

  /* 11: maiúscula acentuada fora do lugar: a letra é desenhada por ::before/::after (css/ui-desafios.css) e um recuo
     herdado da caixa (text-indent dos versos) a empurra para cima da letra vizinha */
  Array.prototype.forEach.call(raiz.querySelectorAll('span.mai-acento'), function (e) {
    var recuo = parseFloat(getComputedStyle(e, '::before').textIndent) || 0;
    if (recuo && e.parentElement && visivel(e.parentElement)) achar('acento-deslocado', e.parentElement, 'a letra ' + e.textContent + ' sai ' + recuo + 'px do lugar');
  });

  return { achados: achados, fontes: fontes, rola: rolador ? { alto: rolador.scrollHeight, cabe: rolador.clientHeight, topo: rolador.scrollTop } : null };
}

// rola a área principal um passo; false quando já está no fim (as fotos seguintes de uma tela comprida)
function rolarFotos(op) {
  var raiz = document.querySelector(op.raiz);
  if (!raiz) return false;
  var rolaveis = [raiz].concat(Array.prototype.slice.call(raiz.querySelectorAll('*'))).filter(function (e) { return /auto|scroll/.test(getComputedStyle(e).overflowY) && e.clientHeight > 0; });
  var maior = function (l) { return l.reduce(function (m, e) { return !m || e.clientWidth * e.clientHeight > m.clientWidth * m.clientHeight ? e : m; }, null); };
  var rolador = maior(rolaveis.filter(function (e) { return e.scrollHeight - e.clientHeight > 3; }));
  if (!rolador) return false;
  if (op.topo) { rolador.scrollTop = 0; return true; }
  var antes = rolador.scrollTop;
  rolador.scrollTop = antes + Math.max(80, rolador.clientHeight - 60);
  return rolador.scrollTop > antes + 4;
}

module.exports = { medir, rolarFotos };
