/* A tela do Baú de Guardados da casa (docs/contratos/itens.md §7, §13): UI.telaGuardados() → Promise (resolve ao
   fechar). Abre só pelo baú da Sala de Estar (ação 'guardados', interiores/casa/guardados.js). Duas colunas,
   "Mochila (N de 20)" e "Baú (N)": tocar numa pilha leva a pilha inteira para o outro lado (para a mochila, só o que
   couber: "A mochila está cheia!"); "Guardar tudo" leva a mochila inteira para o baú (o vestido fica); "Mochila"
   abre a tela da Mochila por cima (vestir e tirar). Nada se apaga aqui: sem guarda de toque. Repinta no EVENTOS.ITENS. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI, EV = Reino.EVENTOS;
  var aberta = null;   // { tela, pintar }

  function T() { return Reino._itensTelas; }

  /** @returns {Promise<void>} */
  UI.telaGuardados = function () {
    if (!Reino.Itens || !T()) return Promise.resolve();
    return new Promise(function (resolver) {
      var pn = UI.painel('guardados', 'Baú de Guardados', { icone: 'bau-guardados', aoFechar: function () { aberta = null; resolver(); } });
      var colunas = el('div.guard-colunas'), msg = el('p.guard-msg', { hidden: true });
      var tudo = el('button.btn-grande.btn-principal.guard-tudo', { type: 'button' }, 'Guardar tudo');
      var mochila = el('button.btn-grande.btn-secundario.guard-mochila', { type: 'button', 'aria-label': 'Mochila', title: 'Mochila' },
        PA.iconeTexto('🎒'), el('span.guard-mochila-texto', 'Mochila'));
      var focoDepois = null;   // a chave do espaço que o teclado tocou (volta para perto dele depois de repintar)
      function aviso(t) { msg.textContent = t; msg.hidden = !t; }
      function mover(g, b, praBau) {
        var I = Reino.Itens;
        focoDepois = UI.porTeclado() ? (praBau ? 'col:mochila' : 'col:bau') : null;
        if (praBau) { I.guardar(g.uids); Reino.Som.tocar('selecionar'); aviso(''); return; }
        var n = I.retirar(g.uids);
        if (n < g.uids.length) { aviso('A mochila está cheia!'); Reino.Som.tocar(n ? 'selecionar' : 'erro'); if (!n) Reino._ui.toqueIgnorado(b); }
        else { aviso(''); Reino.Som.tocar('selecionar'); }
      }
      function coluna(cls, titulo, grupos, vazio, praBau) {
        var grade = el('div.guard-grade', { 'data-foco': 'col:' + cls });
        grupos.forEach(function (g) { grade.appendChild(T().espaco(g, function (gg, b) { mover(gg, b, praBau); })); });
        return el('section.guard-coluna.guard-' + cls, el('h3.guard-titulo', titulo), grupos.length ? grade : el('p.guard-vazio', vazio));
      }
      function pintar() {
        var I = Reino.Itens, esp = I.espacos(), m = I.mochila(), b = I.bau();
        var noBau = b.reduce(function (s, g) { return s + g.qtd; }, 0);
        colunas.textContent = '';
        colunas.appendChild(coluna('mochila', 'Mochila (' + esp.usados + ' de ' + esp.total + ')', m, 'A mochila está vazia.', true));
        colunas.appendChild(coluna('bau', 'Baú (' + noBau + ')', b, 'O baú está vazio.', false));
        if (m.length) { tudo.removeAttribute('aria-disabled'); } else tudo.setAttribute('aria-disabled', 'true');
        if (focoDepois) {
          var alvo = pn.tela.querySelector('.guard-' + focoDepois.slice(4) + ' .itens-espaco') || pn.tela.querySelector('.itens-espaco') || tudo;
          focoDepois = null;
          UI.focarTeclado(alvo);
        }
      }
      tudo.addEventListener('click', function () {
        var uids = [];
        Reino.Itens.mochila().forEach(function (g) { uids = uids.concat(g.uids); });
        if (!uids.length) { Reino._ui.toqueIgnorado(tudo); return; }
        Reino.Itens.guardar(uids);
        aviso('');
        Reino.Som.tocar('selecionar');
      });
      mochila.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaMochila(); });
      pn.tela.classList.add('tela-guardados');
      pn.conteudo.appendChild(el('p.guard-dica', 'Toque num item para mudar de lugar.'));
      pn.conteudo.appendChild(colunas);
      pn.conteudo.appendChild(msg);
      pn.card.appendChild(el('footer.rodape-acao.guard-rodape', mochila, tudo));
      aberta = { tela: pn.tela, pintar: pintar };
      pintar();
    });
  };

  U.on(EV.ITENS, function (c) {
    if (!aberta || !c || c.tipo === 'estrelas') return;
    if (!aberta.tela.isConnected) { aberta = null; return; }
    aberta.pintar();
  });
})();
