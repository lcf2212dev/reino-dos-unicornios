/* Quebra de linha nos desafios (arte.md §17; helpers em Reino._desafios, sem tipo de desafio; carregado logo depois
   de desafios.js, usado só na hora de desenhar):
     _d.sinalColado(depois) → o sinal colado logo depois da lacuna/caixa ('.', '").'), que fica preso a ela
     _d.colarReais(t)       → "R$" preso ao número de depois (espaço inquebrável)
     _d.textoOpcao(t)       → fragmento do texto da opção: colado e com "R$" preso
     _d.caberTexto(el, degrau?) → a palavra que não cabe: um degrau abaixo (degrau), hífen suave, ou (último recurso) parte
     _d.caberDentro(raiz)   → o caberTexto em cada bloco de texto de dentro (cartão, retorno, carta do livro) */
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
  // texto que pode não caber (opção, ligar com emoji, enunciado, texto de apoio, retorno, carta): a palavra que não cabe
  // nunca parte no meio (arte.md §17). Só quando ela não cabe: o rótulo curto (degrau; até 12 letras, §17.3) desce um
  // degrau (.texto-menor: o token de baixo, --texto-aux); a palavra de 9 letras ou mais ganha o hífen suave do hifenizar (quebra na
  // sílaba, §17.2); nada disso, ela quebra no meio, o último recurso (.texto-parte, como antes). A palavra que cabe fica
  // inteira (sem hífen à toa). Mede sem a quebra no meio do body (overflow-wrap: normal) e devolve a dele no fim.
  _d.caberTexto = function (el, degrau) {
    if (el._caber) return el;
    var ro = window.ResizeObserver ? new ResizeObserver(function () { medir(); }) : null;
    // rótulo curto (até 12 letras, §17.3) desce o degrau; o texto mais longo quebra na sílaba
    var curto = el.textContent.replace(/[\s\u00ad]/g, '').length <= 12;
    // alguma letra passa da caixa de conteúdo (mede só o texto: a folga do fundo do «inglês» não conta)
    function vaza() {
      var cs = getComputedStyle(el), b = el.getBoundingClientRect(), g = document.createRange(), n;
      var fim = b.left + el.clientLeft + el.clientWidth - parseFloat(cs.paddingRight) + 1;
      // a caixa que cresce com o texto (lacuna, botão de palavra): passar da linha de quem a contém também conta
      var pai = el.parentElement;
      if (pai && /^(inline-|block|flex|grid)/.test(cs.display) && getComputedStyle(pai).display !== 'inline') {
        var pc = getComputedStyle(pai), pb = pai.getBoundingClientRect();
        if (b.right > pb.left + pai.clientLeft + pai.clientWidth - parseFloat(pc.paddingRight) + 1) return true;
      }
      var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while ((n = tw.nextNode())) {
        if (!/\S/.test(n.nodeValue)) continue;
        g.selectNodeContents(n);
        if (g.getBoundingClientRect().right > fim) return true;
      }
      return false;
    }
    function hifenizar(min) {
      var h = Reino._ui && Reino._ui.hifenizar, n, v;
      if (!h) return;
      var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while ((n = tw.nextNode())) { v = h(n.nodeValue, min); if (v !== n.nodeValue) n.nodeValue = v; }
    }
    function menor(sim) { el.classList.toggle('texto-menor', sim); }   // o token de baixo (css: .texto-menor)
    function medir() {
      if (!el.isConnected) { if (ro) ro.disconnect(); return; }
      menor(false);
      el.classList.remove('texto-parte');
      el.style.overflowWrap = 'normal';
      if (vaza()) {
        var aux = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--texto-aux'));
        var desce = aux < parseFloat(getComputedStyle(el).fontSize);
        if (degrau && desce && curto) menor(true);
        if (vaza()) hifenizar();
        // a palavra que nem com hífen cabe ("floresta." no botão estreito): o degrau abaixo também no texto longo; nem
        // assim, a sílaba também na palavra de 6 a 8 letras ("flo-res-ta."), antes de partir no meio
        if (vaza() && desce) menor(true);
        if (vaza()) hifenizar(6);
        if (vaza()) el.classList.add('texto-parte');
      }
      el.style.overflowWrap = el.classList.contains('texto-parte') ? 'break-word' : '';
    }
    el._caber = medir;
    if (ro) ro.observe(el);
    // a 1ª medida assim que entra na tela (também no jogo congelado, sem quadros); de novo com a fonte pronta
    (function esperar(n) {
      if (!el.isConnected) { if (n < 20) setTimeout(function () { esperar(n + 1); }, 0); return; }
      medir();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
    })(0);
    return el;
  };
  // todo bloco de texto dentro de `raiz` (o cartão do desafio, o retorno, a carta do livro) ganha o _d.caberTexto; os
  // rótulos (legenda, botão de palavra, cor da legenda) com o degrau. O que já tem o seu (opção) fica como está.
  var ROTULO = 'figcaption, button, .chip-palavra, .caca-palavra, .lista-termo';
  // fora: campos, a célula de tabela (as tabelas têm o ajuste delas) e a fonte da carta (o endereço não tem sílaba)
  var FORA = 'input, textarea, summary, th, td, .bloco-fonte';
  _d.caberDentro = function (raiz) {
    // o que o desafio redesenha depois (sequência, separar, lacuna preenchida) entra na próxima busca
    if (!raiz._caberMO && window.MutationObserver) {
      raiz._caberMO = new MutationObserver(function () { if (raiz.isConnected) _d.caberDentro(raiz); });
      raiz._caberMO.observe(raiz, { childList: true, subtree: true });
    }
    if (raiz._caberPedido) return raiz;   // vários pedidos seguidos (a carta que se desenha bloco a bloco): uma busca só
    raiz._caberPedido = true;
    setTimeout(function esperar(n) {
      n = n || 0;
      if (!raiz.isConnected) { if (n < 20) setTimeout(function () { esperar(n + 1); }, 0); else raiz._caberPedido = false; return; }
      raiz._caberPedido = false;
      var blocos = [], tw = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT), t;
      while ((t = tw.nextNode())) {
        if (!/\S/.test(t.nodeValue)) continue;
        var b = t.parentElement;
        while (b && b !== raiz.parentElement && getComputedStyle(b).display === 'inline') b = b.parentElement;
        if (b && blocos.indexOf(b) < 0 && !b.matches(FORA)) blocos.push(b);
      }
      // a lacuna nasce vazia e recebe a palavra depois: entra mesmo sem texto ainda
      Array.prototype.forEach.call(raiz.querySelectorAll('.lacuna'), function (l) { if (blocos.indexOf(l) < 0) blocos.push(l); });
      // os que já têm o ajuste medem de novo (a lacuna que recebeu a palavra, o item que mudou de lugar)
      blocos.forEach(function (b) { if (b._caber) b._caber(); else _d.caberTexto(b, b.matches(ROTULO)); });
    }, 0);
    return raiz;
  };
  // o retorno, as cartas do livro, a fala do Claude na intro e o fim da sala entram na tela por vários caminhos (sala,
  // pergunta sozinha, Vila, surpresa, ET, livro): um observador só pega cada um quando chega (no carregamento só se o DOM existe: node: true)
  var ALVOS = '.retorno-explica, .livro-carta, .intro-claude, .fim-sala';
  if (window.MutationObserver && typeof document !== 'undefined' && document.body) {
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) {
          if (n.nodeType !== 1) return;
          var dono = n.closest(ALVOS);
          if (dono) _d.caberDentro(dono);
          else Array.prototype.forEach.call(n.querySelectorAll(ALVOS), _d.caberDentro);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }
})();
