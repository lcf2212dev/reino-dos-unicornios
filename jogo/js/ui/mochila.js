/* A tela da Mochila (docs/contratos/itens.md §6, §13): UI.telaMochila({ uid? }) → Promise (resolve ao fechar).
   À esquerda a figura dela vestida (PA.mariana com as vestes, escala 8) e os 6 slots do corpo; à direita
   "Espaços: N de 20" e a grade de 20 (4 × 5; no celular 5 × 4, css/ui-itens.css). Tocar num espaço ou num slot
   abre o cartão do item (ui/mochila-item.js); { uid } abre direto no cartão daquele item. Com monstro ou MonsterBall,
   o botão "Meus monstros" (UI.telaMonstros; monstros.md). Repinta no EVENTOS.ITENS
   (o cartão, a nuvem ou outra aba mexeram), lendo Reino.Itens na hora. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI, EV = Reino.EVENTOS;
  var aberta = null;   // { tela, pintar } da Mochila aberta

  function T() { return Reino._itensTelas; }

  function figura() {
    var ap = Reino._ui.aparencia(), v = Reino.Itens.vestes();
    var vestes = { cabeca: v.cabeca, armadura: v.armadura, calca: v.calca, botas: v.botas };
    return PA.paraDOM(PA.mariana(ap, false, 0, { vista: 'frente', vestes: vestes }), 8, 'moch-figura-canvas');
  }

  function slots(abrir) {
    var I = Reino.Itens, vest = I.vestido();
    return el('div.moch-slots', I.SLOTS.map(function (s) {
      var v = vest[s], nome = T().nomeVestido(s), bosque = !v && s === 'espada' && T().temEspadaBosque();
      var ic = v ? T().icone(v.def.icone, 32) : bosque ? T().icone('🗡', 32) : el('span.moch-slot-vazio', { 'aria-hidden': 'true' });
      var b = el('button.moch-slot' + (v ? '.rar-' + v.def.raridade : '.moch-slot-livre'),
        { type: 'button', 'data-slot': s, 'data-foco': 'slot:' + s, 'aria-label': T().SLOT_NOME[s] + ': ' + nome },
        el('span.moch-slot-icone', ic), el('span.moch-slot-texto', el('small', T().SLOT_NOME[s]), el('b', U.colado(nome))));
      b.addEventListener('click', function () {
        if (!v) { Reino._ui.toqueIgnorado(b); return; }
        Reino.Som.tocar('toque');
        abrir({ slot: s });
      });
      return b;
    }));
  }

  // "Meus monstros" (monstros.md): só para quem já tem um monstro ou uma MonsterBall
  function botaoMonstros() {
    var M = Reino.Monstros;
    if (!M || !UI.telaMonstros || !(M.capturados().length || M.bolas().length)) return null;
    var b = el('button.btn-grande.btn-secundario.moch-monstros', { type: 'button', 'data-foco': 'monstros' },
      T().icone('item:bola-monster', 32), 'Meus monstros');
    b.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaMonstros(); });
    return b;
  }

  /** @returns {Promise<void>} */
  UI.telaMochila = function (opcoes) {
    opcoes = opcoes || {};
    if (!Reino.Itens || !T()) return Promise.resolve();
    return new Promise(function (resolver) {
      var pn = UI.painel('mochila', '🎒 Mochila', { aoFechar: function () { aberta = null; resolver(); } });
      var corpo = el('div.moch-corpo');
      pn.conteudo.appendChild(corpo);
      // o cartão por cima; ao voltar, o foco do teclado volta ao mesmo espaço (a grade foi repintada)
      function abrir(alvo) {
        var chave = alvo.slot ? 'slot:' + alvo.slot : null;
        if (!chave) { var f = document.activeElement; chave = f && f.dataset ? f.dataset.foco : null; }
        T().cartao(alvo).then(function () {
          if (!pn.tela.isConnected || !UI.porTeclado()) return;
          var alvoFoco = (chave && pn.tela.querySelector('[data-foco="' + chave + '"]')) || pn.tela.querySelector('.itens-espaco:not(.itens-livre), .moch-slot');
          if (alvoFoco) UI.focarTeclado(alvoFoco);
        });
      }
      function pintar() {
        var I = Reino.Itens, esp = I.espacos(), grupos = I.mochila();
        corpo.textContent = '';
        var grade = el('div.moch-grade');
        grupos.forEach(function (g) { grade.appendChild(T().espaco(g, function () { Reino.Som.tocar('toque'); abrir({ uid: g.uids[0] }); })); });
        for (var i = grupos.length; i < esp.total; i++) grade.appendChild(T().espacoVazio());
        corpo.appendChild(el('div.moch-esq', el('div.moch-figura', figura()), slots(abrir)));
        corpo.appendChild(el('div.moch-dir',
          el('p.moch-espacos', 'Espaços: ' + esp.usados + ' de ' + esp.total),
          grupos.length ? null : el('p.moch-vazia', 'Sua mochila está vazia. Vença monstros nos portais para achar tesouros!'),
          grade, botaoMonstros()));
      }
      pn.tela.classList.add('tela-mochila');
      aberta = { tela: pn.tela, pintar: pintar };
      pintar();
      if (opcoes.uid) abrir({ uid: opcoes.uid });
    });
  };

  U.on(EV.ITENS, function (c) {
    if (!aberta || !c || c.tipo === 'estrelas') return;
    if (!aberta.tela.isConnected) { aberta = null; return; }
    aberta.pintar();
  });
})();
