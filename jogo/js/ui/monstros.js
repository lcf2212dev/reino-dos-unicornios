/* Meus monstros (Reino.UI.telaMonstros; docs/contratos/monstros.md): um cartão por espécie, como o Álbum de ETs: a que
   ela pegou em cores (desenho do inimigo, nome, de onde veio e "×N"), a que falta como silhueta com "?" e o lugar onde
   mora. No cartão de um capturado: "Levar comigo" / "Deixar em casa" (Reino.Monstros.equipar; só 1, e tira o ET) e o
   selo "Está com você"; os que ela tem vêm primeiro. Sem nenhum: o convite para comprar MonsterBalls nos Treinadores de Monstros da Vila.
   Abre pelo botão da Mochila (ui/mochila.js) e pela loja da Kiara (UI.telaTreinadores). Também o aviso pequeno da bola
   ("Pegou!" / "Escapou!", UI.avisoItem) no EVENTOS.MONSTROS. Só na tela, sem voz. Estilos: css/ui-monstros.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI, EV = Reino.EVENTOS;
  var ICONE = 'item:bola-monster';
  var aberta = null;   // { tela, montar } da tela aberta

  // o monstro de corpo inteiro, nítido (4 px CSS por pixel); o que falta = silhueta
  function figura(e, tem) {
    var BC = Reino.BosqueCombate;
    try {
      var c = BC && BC.spriteInimigo ? BC.spriteInimigo(e.tipo, 0, e.arena) : null;
      if (!c) return null;
      if (!tem && PA.silhueta) c = PA.silhueta(c);
      return PA.paraDOM(c, 4, 'monstros-sprite');
    } catch (err) { return null; }
  }

  function telaMonstros() {
    var M = Reino.Monstros;
    if (!M) return Promise.resolve();
    return new Promise(function (resolver) {
      var pn = UI.painel('monstros', 'Meus monstros', { icone: ICONE, aoFechar: function () { aberta = null; resolver(); } });
      pn.tela.setAttribute('aria-label', 'Meus monstros');
      pn.conteudo.classList.add('monstros-conteudo');
      var topo = el('p.monstros-contador', { 'aria-live': 'polite' }), grade = el('ul.monstros-grade');
      pn.conteudo.appendChild(topo);
      pn.conteudo.appendChild(grade);

      function montar(foco) {
        var todas = M.especies(), tem = {}, junto = M.equipado();
        M.capturados().forEach(function (c) { tem[c.id] = c.qtd; });
        var n = Object.keys(tem).length;
        topo.textContent = n ? n + ' de ' + todas.length + ' monstros' :
          'Você ainda não tem monstros. Compre MonsterBalls nos Treinadores de Monstros, na Vila Arco-Íris, e jogue perto de um monstro nas arenas!';
        topo.classList.toggle('monstros-vazio', !n);
        grade.textContent = '';
        // os que ela tem primeiro (na ordem das arenas), depois os que faltam
        todas.filter(function (e) { return tem[e.id]; }).concat(todas.filter(function (e) { return !tem[e.id]; })).forEach(function (e) {
          var qtd = tem[e.id] || 0, nome = U.colado ? U.colado(e.nome) : e.nome;
          var li = el('li.monstros-cartao' + (qtd ? '.tem' : '.silhueta') + (junto === e.id ? '.junto' : ''),
            el('div.monstros-figura', figura(e, !!qtd), qtd ? '' : el('span.monstros-interroga', { 'aria-hidden': 'true' }, '?')));
          li.tabIndex = 0;
          li.setAttribute('aria-label', qtd ? e.nome + ', de ' + e.lugar + ', ' + qtd : 'Monstro de ' + e.lugar + ', ainda não pegou');
          if (!qtd) {
            li.appendChild(el('b', '?'));
            li.appendChild(el('small', e.curto));
            grade.appendChild(li);
            return;
          }
          li.appendChild(el('b', nome));
          li.appendChild(el('small', U.colado ? U.colado(e.curto) : e.curto));
          li.appendChild(el('span.monstros-qtd', '×' + qtd));
          if (junto === e.id) li.appendChild(el('span.monstros-selo', 'Está com você'));
          var leva = junto !== e.id;
          var b = el('button.btn-grande' + (leva ? '.btn-principal' : '') + '.monstros-levar', { type: 'button', 'data-monstro': e.id },
            leva ? 'Levar comigo' : 'Deixar em casa');
          b.setAttribute('aria-label', (leva ? 'Levar ' : 'Deixar em casa ') + e.nome + (leva ? ' comigo' : ''));
          b.addEventListener('click', function () {
            Reino.Som.tocar(leva ? 'selecionar' : 'toque');
            M.equipar(leva ? e.id : null);
            montar(e.id);
          });
          li.appendChild(b);
          grade.appendChild(li);
        });
        if (foco) {
          var bf = grade.querySelector('.monstros-levar[data-monstro="' + foco + '"]');
          if (bf) { bf.focus({ preventScroll: true }); bf.scrollIntoView({ block: 'nearest' }); }
        }
      }
      aberta = { tela: pn.tela, montar: montar };
      montar(null);
      Reino.Som.tocar('porta');
      setTimeout(function () {
        var b = grade.querySelector('.monstros-levar') || pn.card.querySelector('.btn-fechar');
        if (b && pn.tela.isConnected && UI.porTeclado && UI.porTeclado()) b.focus({ preventScroll: true });
      }, 80);
    });
  }
  UI.telaMonstros = telaMonstros;

  U.on(EV.MONSTROS, function (c) {
    if (!c) return;
    var e = Reino.Monstros && Reino.Monstros.especie(c.especie);
    if (c.tipo === 'capturou' && e) UI.avisoItem({ icone: ICONE, texto: 'Pegou! ' + e.nome + ' é seu!', raridade: 'raro' });
    else if (c.tipo === 'escapou') UI.avisoItem({ icone: ICONE, texto: 'Escapou! Tente de novo.' });
    else if (c.tipo === 'voltou') UI.avisoItem({ icone: ICONE, texto: 'A MonsterBall voltou para a mochila.' });
    if (aberta && aberta.tela.isConnected && (c.tipo === 'equipou' || c.tipo === 'capturou')) aberta.montar(null);
  });
})();
