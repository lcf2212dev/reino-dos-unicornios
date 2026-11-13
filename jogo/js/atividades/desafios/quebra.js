/* Quebra de linha nos desafios (arte.md §17; helpers em Reino._desafios, sem tipo de desafio; carregado logo depois
   de desafios.js, usado só na hora de desenhar):
     _d.sinalColado(depois) → o sinal colado logo depois da lacuna/caixa ('.', '").'), que fica preso a ela
     _d.colarReais(t)       → "R$" preso ao número de depois (espaço inquebrável)
     _d.textoOpcao(t)       → fragmento do texto da opção: colado e com "R$" preso
     _d.caberTexto(span, degrau?) → a palavra que não cabe: um degrau abaixo (degrau), hífen suave, ou (último recurso) parte */
(function () {
  var U = Reino.util, _d = Reino._desafios;

  // o sinal que vem colado logo depois de uma lacuna ou caixa ('.', ',', '").', '?'): fica preso a ela na quebra de linha
  _d.sinalColado = function (depois) { return (String(depois || '').match(/^[.,!?;:…"”')»]+/) || [''])[0]; };
  // "R$" preso ao número que vem depois (arte.md §17.4): "R$ 10,00" nunca fica "R$" | "10,00" na quebra de linha.
  // O U.colado prende o "R$" só no começo de um grupo ("De R$" | "10,00"); no enunciado e no apoio ninguém colava.
  _d.colarReais = function (t) { return typeof t === 'string' ? t.replace(/R\$ (?=\d)/g, 'R$\u00a0') : t; };
  // texto de opção: os grupos colados do U.colado ("de brinquedo", "100 reais") viram .grupo-colado (inteiros na linha;
  // mais largos que o botão, quebram entre as palavras: ui-missao.css) e o "R$" fica preso ao número
  _d.textoOpcao = function (t) {
    var frag = U.colado(_d.colarReais(t));
    Array.prototype.forEach.call(frag.querySelectorAll('span'), function (sp) {
      if (sp.style.whiteSpace !== 'nowrap') return;
      sp.removeAttribute('style');
      sp.classList.add('grupo-colado');
    });
    return frag;
  };
  // texto num botão estreito (opção, ligar com emoji): a palavra que não cabe nunca parte no meio (arte.md §17). Só
  // quando ela não cabe: o nome curto (degrau: a opção com desenho; até 12 letras, §17.3) desce um degrau (16 → 12);
  // a palavra de 9 letras ou mais ganha o hífen suave do hifenizar (quebra na sílaba, §17.2); nada disso, ela quebra
  // no meio, o último recurso (.texto-parte, como antes). A palavra que cabe fica inteira (sem hífen à toa).
  _d.caberTexto = function (span, degrau) {
    var ro = window.ResizeObserver ? new ResizeObserver(medir) : null;
    // rótulo curto (até 12 letras, §17.3) desce o degrau; o texto mais longo quebra na sílaba
    var curto = span.textContent.replace(/[\s\u00ad]/g, '').length <= 12;
    function vaza() { return span.scrollWidth > span.clientWidth + 1; }
    function hifenizar() {
      var h = Reino._ui && Reino._ui.hifenizar, n;
      if (!h || span.dataset.hifen) return;
      span.dataset.hifen = '1';
      var tw = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
      while ((n = tw.nextNode())) n.nodeValue = h(n.nodeValue);
    }
    function medir() {
      if (!span.isConnected) { if (ro) ro.disconnect(); return; }
      span.classList.remove('texto-menor', 'texto-parte');
      if (!vaza()) return;
      var aux = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--texto-aux'));
      var desce = degrau && aux < parseFloat(getComputedStyle(span).fontSize);
      if (desce && curto) {
        span.classList.add('texto-menor');
        if (!vaza()) return;
      }
      hifenizar();
      if (!vaza()) return;
      // a palavra curta que nem com hífen cabe ("floresta." no botão estreito): o degrau abaixo também no texto longo
      if (desce) span.classList.add('texto-menor');
      if (vaza()) span.classList.add('texto-parte');
    }
    if (ro) ro.observe(span);
    // a 1ª medida assim que entra na tela (também no jogo congelado, sem quadros); de novo com a fonte pronta
    (function esperar(n) {
      if (!span.isConnected) { if (n < 20) setTimeout(function () { esperar(n + 1); }, 0); return; }
      medir();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
    })(0);
    return span;
  };
})();
