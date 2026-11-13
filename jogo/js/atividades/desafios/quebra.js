/* Quebra de linha nos desafios (arte.md §17; helpers em Reino._desafios, sem tipo de desafio; carregado logo depois
   de desafios.js, usado só na hora de desenhar):
     _d.sinalColado(depois) → o sinal colado logo depois da lacuna/caixa ('.', '").'), que fica preso a ela
     _d.colarTexto(t)       → "R$" e o número, "( ? )", "(J - j)", "8 ÷ 2 = 4" presos (espaço inquebrável)
     _d.textoOpcao(t)       → fragmento do texto da opção: colado (U.colado) e com o colarTexto
     _d.caberTexto(el, degrau?) → a palavra que não cabe: um degrau abaixo (degrau), hífen suave, ou (último recurso) parte;
                            os irmãos do mesmo grupo (as opções, o ligar…) descem juntos
     _d.caberDentro(raiz)   → o caberTexto em cada bloco de texto de dentro (cartão, retorno, carta do livro) */
(function () {
  var U = Reino.util, _d = Reino._desafios;

  // o sinal que vem colado logo depois de uma lacuna ou caixa ('.', ',', '").', '?'): fica preso a ela na quebra de linha
  _d.sinalColado = function (depois) { return (String(depois || '').match(/^[.,!?;:…"”')»]+/) || [''])[0]; };
  // o que não se separa na quebra de linha (arte.md §17.4), com espaço inquebrável: "R$" e o número de depois ("R$ 10,00";
  // o U.colado prende o "R$" só no começo de um grupo, "De R$" | "10,00"), o sinal entre parênteses ("( ? )", "(J - j)"),
  // a conta ("8 ÷ 2 = 4") e a letra do rótulo no fim ("Imagem A.")
  _d.colarTexto = function (t) {
    if (typeof t !== 'string') return t;
    return t.replace(/R\$ (?=\d)/g, 'R$\u00a0')
      .replace(/\( (\S{1,3}) \)/g, '(\u00a0$1\u00a0)')
      .replace(/\((\S{1,3}) ([-–—]) (\S{1,3})\)/g, '($1\u00a0$2\u00a0$3)')
      .replace(/(\d) ([÷×+=–-]) (?=\d)/g, '$1\u00a0$2\u00a0')
      .replace(/(\p{L}) (\p{Lu}[.:)]?)$/u, '$1\u00a0$2');   // a letra do rótulo no fim ("Imagem A.") fica com a palavra
  };
  // texto de opção: os grupos colados do U.colado ("de brinquedo", "100 reais") viram .grupo-colado (inteiros na linha;
  // mais largos que o botão, quebram entre as palavras: ui-missao.css), com o colarTexto
  _d.textoOpcao = function (t) {
    var frag = U.colado(_d.colarTexto(t));
    Array.prototype.forEach.call(frag.querySelectorAll('span'), function (sp) {
      if (sp.style.whiteSpace !== 'nowrap') return;
      sp.removeAttribute('style');
      sp.classList.add('grupo-colado');
    });
    return frag;
  };
  // irmãos que descem juntos: quando um item de um destes grupos desce o degrau, os do mesmo tipo descem com ele (as
  // opções de uma pergunta, as duas colunas do ligar, os baús, o completar, a lista do vfLista, as legendas (e os
  // blocos do mesmo tipo) da carta, as células da tabela)
  var GRUPO = '.opcoes, .ligar-colunas, .baus, .completar, .vf-lista, .livro-carta, .caca-lista, .marcar-legenda, .quadro-palavras, .tabela-quadro';
  var ORIGINAL = typeof WeakMap === 'function' ? new WeakMap() : null;   // nó de texto → { antes, hifen }
  function chaveDe(el) {
    var c = Array.prototype.filter.call(el.classList, function (k) { return !/^(texto-|grupo-colado$)/.test(k); })[0];
    return el.tagName + '.' + (c || '');
  }
  function sincronizar(el) {
    var g = el.closest(GRUPO), membros = g ? Array.prototype.filter.call(g.querySelectorAll('*'), function (m) { return m._caber && m._chave === el._chave; }) : [el];
    var algum = membros.some(function (m) { return m._menor; });
    membros.forEach(function (m) { m.classList.toggle('texto-menor', !!(m._menor || algum)); });
  }
  // texto que pode não caber (opção, ligar com emoji, enunciado, texto de apoio, retorno, carta): a palavra que não cabe
  // nunca parte no meio (arte.md §17). Só quando ela não cabe, nesta ordem: o rótulo curto (degrau; até 12 letras, §17.3)
  // desce um degrau (.texto-menor: o token de baixo, --texto-aux); a palavra de 9 letras ou mais ganha o hífen suave do
  // hifenizar (sílaba, §17.2); depois a de 6 a 8 letras; a onomatopeia sem sílaba ("Vuuuuu!") um hífen a cada 6 letras;
  // o degrau abaixo também no texto longo; nada disso, ela quebra no meio (.texto-parte, como antes). A palavra que cabe
  // fica inteira (sem hífen à toa). Toda medida começa do texto original (o resultado não depende de quantas vezes mediu),
  // sem a quebra no meio do body (overflow-wrap: normal), que volta no fim. Nome próprio (célula da tabela) não leva hífen.
  _d.caberTexto = function (el, degrau) {
    if (el._caber) return el;
    var ro = window.ResizeObserver ? new ResizeObserver(function () { medir(); }) : null, pai = null;
    // rótulo curto (até 12 letras, §17.3) desce o degrau; o texto mais longo quebra na sílaba
    var curto = el.textContent.replace(/[\s\u00ad]/g, '').length <= 12, nome = el.matches('.tabela-fixa') && /^\s*\p{Lu}\p{Ll}+\s*$/u.test(el.textContent);
    el._chave = chaveDe(el);
    // alguma letra passa da caixa de conteúdo (mede só o texto: a folga do fundo do «inglês» não conta); escondido não
    function vaza() {
      if (!el.getClientRects().length) return false;
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
    function nos(fn) { var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n; while ((n = tw.nextNode())) fn(n); }
    function trocar(n, v) {
      if (v === n.nodeValue) return;
      var r = ORIGINAL && ORIGINAL.get(n);
      if (ORIGINAL) ORIGINAL.set(n, { antes: r && r.hifen === n.nodeValue ? r.antes : n.nodeValue, hifen: v });
      n.nodeValue = v;
    }
    function original() {
      if (ORIGINAL) nos(function (n) { var r = ORIGINAL.get(n); if (r && r.hifen === n.nodeValue) n.nodeValue = r.antes; });
    }
    // o hífen olha a palavra inteira, mesmo partida em vários nós (a maiúscula acentuada vem num span: "FOTOSS" + "Í" +
    // "NTESE"); o hífen fica no fim do nó da letra de antes (nunca dentro do span da letra desenhada por cima)
    function hifenizar(min) {
      var h = Reino._ui && Reino._ui.hifenizar;
      if (!h) return;
      var ns = [], S = '';
      nos(function (n) { ns.push(n); S += n.nodeValue; });
      var H = S.replace(/\S+/g, function (w) {
        if (nome) return w;   // a célula de um nome próprio não quebra: desce o degrau (§17.3)
        if (min !== 0) return h(w, min);
        return /\u00ad/.test(w) ? w : w.replace(/(\p{L}{6})(?=\p{L}{3})/gu, '$1\u00ad');   // sem sílaba: a cada 6 letras
      });
      if (H === S) return;
      var novos = ns.map(function () { return ''; }), k = 0, usado = 0, i = 0;
      for (var j = 0; j < H.length; j++) {
        var hifen = H[j] === '\u00ad' && S[i] !== '\u00ad';
        if (!hifen) {
          while (k < ns.length - 1 && usado >= ns[k].nodeValue.length) { k++; usado = 0; }
          novos[k] += H[j]; usado++; i++;
        } else novos[k] += H[j];   // fica com a letra de antes (o nó de agora, ainda não avançado)
      }
      ns.forEach(function (n, x) { trocar(n, novos[x]); });
    }
    function menor(sim) { el.classList.toggle('texto-menor', sim); }   // o token de baixo (css: .texto-menor)
    function medir() {
      if (!el.isConnected) { if (ro) ro.disconnect(); return; }
      // a caixa que tem o tamanho do texto (lacuna, nome da opção com figura) não muda quando quem a contém estreita ou
      // alarga (o retorno que abre, a barra de rolagem, o tablet que gira): observa também o pai, já na tela (o span
      // chega aqui antes de entrar no botão)
      if (ro && el.parentElement !== pai) { if (pai) ro.unobserve(pai); pai = el.parentElement; if (pai) ro.observe(pai); }
      original();
      menor(false);
      el.classList.remove('texto-parte');
      el.style.overflowWrap = 'normal';
      if (vaza()) {
        var aux = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--texto-aux'));
        var desce = aux < parseFloat(getComputedStyle(el).fontSize);
        if ((degrau || nome) && desce && curto) menor(true);
        if (vaza()) hifenizar();
        // a palavra de até 8 letras que não cabe: primeiro o degrau abaixo; a sílaba nela e o hífen a cada 6 letras só
        // depois, como último recurso antes de partir no meio (arte.md §17.2 só manda a sílaba na de 9 ou mais)
        if (vaza() && desce) menor(true);
        if (vaza()) hifenizar(6);
        if (vaza()) hifenizar(0);
        if (vaza()) el.classList.add('texto-parte');
      }
      el.style.overflowWrap = el.classList.contains('texto-parte') ? 'break-word' : '';
      el._menor = el.classList.contains('texto-menor');
      sincronizar(el);
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
  var ROTULO = 'figcaption, button, .chip-palavra, .caca-palavra, .lista-termo, .tabela-fixa';
  // fora: campos, a tabela da carta (tem o ajuste dela), a fonte da carta (o endereço não tem sílaba) e a casa de uma
  // letra (caça-palavras, cruzadinha: a margem de -2 px da grade não é texto que vaza)
  var FORA = 'input, textarea, summary, .bloco-tabela th, .bloco-tabela td, .bloco-fonte, .caca-letra, .cruz-casa, .cruz-letra, .cruz-num';
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
        if (b && blocos.indexOf(b) < 0 && !b.matches(FORA) && b.textContent.replace(/\s/g, '').length > 2) blocos.push(b);
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
