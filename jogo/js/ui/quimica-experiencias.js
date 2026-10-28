/* Laboratório de Química: o álbum Experiências do Reino (Reino.UI.abrirExperiencias(idDestaque?)), prêmio da trilha
   perfeita (docs/contratos/quarto-bimestre.md §14.3). Uma grade de cartas (Reino.QUIMICA.experiencias), no visual do
   Álbum de ETs (classes album-* de css/ui-album-ets.css): ainda não ganha = silhueta com "?" e o nome da sala que dá
   a carta; ganha = emoji e nome. Tocar numa ganha abre a carta no mesmo painel (com um adulto, o que precisa, os
   passos, o que acontece e por quê), com a Doutora Proveta lendo (frases 'exp.*': conteudo/quimica/frases-experiencias.js).
   idDestaque: abre direto naquela carta (a festa do prêmio). Estilos: css/ui-quimica-experiencias.css. */
(function () {
  var R = window.Reino, U = R.util, el = U.el, UI = R.UI;

  function nomeDaSala(id) {
    var pt = R.premioTrilha && R.premioTrilha(id), m = pt && R.materia && R.materia(pt.materia);
    var s = m && m.salas.find(function (x) { return x.id === id; });
    return s ? s.nome : String(id || '');
  }
  function hifenizar(s) { return R._ui.hifenizar(s); }

  UI.abrirExperiencias = function (idDestaque) {
    var Q = R.Quimica;
    if (!Q || !Q.experienciaGanha) return null;
    if (UI.temTela() && !idDestaque) return null;
    var cartas = (R.QUIMICA && R.QUIMICA.experiencias) || [];
    var pn = UI.painel('quimica-experiencias', '🧪 Experiências do Reino', { curto: '🧪 Experiências' });
    pn.tela.setAttribute('aria-label', 'Experiências do Reino');
    var rodape = null;
    function falar(ps) { if (ps && ps.length) R.Som.falar(ps, { voz: Q.VOZ }); }
    function trocar(nos, botoes) {
      pn.conteudo.textContent = '';
      nos.forEach(function (n) { pn.conteudo.appendChild(n); });
      pn.conteudo.scrollTop = 0;
      if (rodape) rodape.remove();
      rodape = botoes ? el('footer.rodape-acao.xp-rodape', botoes) : null;
      if (rodape) pn.card.appendChild(rodape);
    }

    function grade(foco) {
      var n = cartas.filter(function (x) { return Q.experienciaGanha(x.id); }).length;
      var lista = el('ul.album-grade.xp-grade', cartas.map(function (x) {
        var ganha = Q.experienciaGanha(x.id), sala = nomeDaSala(x.sala);
        var b = el('button.album-cartao.xp-cartao' + (ganha ? '.amigo' : '.silhueta'), { type: 'button', 'data-exp': x.id,
          'aria-label': ganha ? x.nome + ', carta ganha, tocar para abrir' : 'Carta secreta. Faça a trilha de ' + sala + ' sem errar' },
          el('span.xp-figura', { 'aria-hidden': 'true' }, ganha ? x.emoji : el('span.album-interroga', '?')),
          el('b', ganha ? hifenizar(x.nome) : 'Carta secreta'),
          el('small', ganha ? 'Com um adulto' : 'Trilha: ' + sala));
        b.addEventListener('click', function () {
          R.Som.tocar('toque'); R.Som.calar();
          if (ganha) abrirCarta(x); else falar(Q.frase('exp.bloqueada'));
        });
        return el('li', b);
      }));
      trocar([el('p.album-contador', { 'aria-live': 'polite' }, n + ' de ' + cartas.length + ' cartas'),
        el('p.qt-dica', 'Faça uma trilha de Língua Portuguesa sem errar e ganhe uma carta.'), lista], null);
      var alvo = (foco && lista.querySelector('[data-exp="' + foco + '"]')) || lista.querySelector('button');
      if (alvo) setTimeout(function () { if (pn.tela.isConnected) { alvo.focus({ preventScroll: true }); alvo.scrollIntoView({ block: 'nearest' }); } }, 80);
    }

    function abrirCarta(x) {
      var titulo = el('h3.xp-nome', { tabIndex: -1 }, x.nome);
      var carta = el('article.xp-carta',
        el('div.xp-topo', el('span.xp-emoji', { 'aria-hidden': 'true' }, x.emoji), titulo),
        el('p.xp-adulto', '👩 Faça com um adulto'),
        el('section.xp-bloco', el('h4', 'Você vai precisar'), el('ul', x.precisa.map(function (p) { return el('li', hifenizar(p)); }))),
        el('section.xp-bloco', el('h4', 'Como fazer'), el('ol', x.passos.map(function (p) { return el('li', hifenizar(p)); }))),
        el('section.xp-bloco', el('h4', 'O que acontece'), el('p', hifenizar(x.acontece))),
        el('section.xp-bloco', el('h4', 'Por quê?'), x.porque.map(function (p) { return el('p', hifenizar(p)); })));
      var voltar = el('button.btn-grande.btn-secundario', { type: 'button' }, '← Voltar');
      voltar.addEventListener('click', function () { R.Som.tocar('toque'); R.Som.calar(); grade(x.id); });
      trocar([carta], [voltar]);
      UI.focarTroca(voltar, titulo, 400);
      falar([].concat(Q.frase('exp.adulto'), x.precisa, x.passos, [x.acontece], x.porque));
    }

    var destaque = idDestaque && cartas.filter(function (x) { return x.id === idDestaque && Q.experienciaGanha(x.id); })[0];
    Reino.Som.tocar('porta');
    if (destaque) abrirCarta(destaque);
    else { grade(null); falar(Q.frase('exp.oi')); }
    return pn;
  };
})();
