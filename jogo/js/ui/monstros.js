/* Meus monstros (Reino.UI.telaMonstros; docs/contratos/monstros.md): um cartão por espécie, como o Álbum de ETs: a que
   ela pegou em cores (desenho do inimigo, nome, de onde veio e "×N"), a que falta como silhueta com "?" e o lugar onde
   mora. No cartão de um capturado: "Levar comigo" / "Deixar em casa" (Reino.Monstros.equipar / deixar; até
   Monstros.vagas(): 4, e mais 1 por matéria terminada; o ET continua) e o selo "Está com você"; sem vaga, o "Levar
   comigo" fica indisponível e o topo diz "Termine uma matéria para levar mais um!". Os que ela tem vêm primeiro. Sem nenhum: o convite para comprar MonsterBalls nos Treinadores de Monstros da Vila.
   Os monstros das matérias (Casa Mal-Assombrada, monstros.md §10) vêm por último; o que falta diz a matéria que o dá.
   Abre pelo botão da Mochila (ui/mochila.js) e pela loja da Kiara (UI.telaTreinadores). Também o aviso pequeno da bola
   ("Pegou!" / "Escapou!", UI.avisoItem) no EVENTOS.MONSTROS. Só na tela, sem voz. Estilos: css/ui-monstros.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI, EV = Reino.EVENTOS;
  var ICONE = 'item:bola-monster';
  var aberta = null;   // { tela, montar } da tela aberta

  // de onde ele é: o lugar (arena), ou a matéria que o dá (Casa Mal-Assombrada; monstros.md §10)
  function deOnde(e) {
    if (!e.daMateria) return e.curto;
    var d = Reino.Monstros.daMateria().filter(function (x) { return x.id === e.id; })[0], m = d && Reino.materia(d.materia);
    return m ? m.nome : e.curto;
  }
  // o monstro de corpo inteiro, nítido (4 px CSS por pixel); o que falta = silhueta
  function figura(e, tem) {
    try {
      var c = Reino.Monstros.sprite(e.id, 0);
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
        var todas = M.especies(), tem = {}, juntos = M.equipados(), vagas = M.vagas(), cheio = juntos.length >= vagas;
        // sem vaga: com matéria por terminar, o caminho para mais uma; com todas terminadas, o máximo
        var porque = M.maisVagas() ? 'Termine uma matéria para levar mais um!' : 'Você já leva o máximo de monstros!';
        M.capturados().forEach(function (c) { tem[c.id] = c.qtd; });
        var n = Object.keys(tem).length;
        topo.textContent = n ? n + ' de ' + todas.length + ' monstros • com você: ' + juntos.length + ' de ' + vagas +
          (cheio && n > juntos.length ? '. ' + porque : '') :
          'Você ainda não tem monstros. Compre MonsterBalls nos Treinadores de Monstros, na Vila Arco-Íris, e jogue perto de um monstro nas arenas! Ou termine uma matéria e ganhe o monstro dela.';
        topo.classList.toggle('monstros-vazio', !n);
        grade.textContent = '';
        // os que ela tem primeiro (na ordem das arenas), depois os que faltam
        todas.filter(function (e) { return tem[e.id]; }).concat(todas.filter(function (e) { return !tem[e.id]; })).forEach(function (e) {
          var qtd = tem[e.id] || 0, nome = U.colado ? U.colado(e.nome) : e.nome;
          var junto = juntos.indexOf(e.id) >= 0;
          var li = el('li.monstros-cartao' + (qtd ? '.tem' : '.silhueta') + (junto ? '.junto' : ''),
            el('div.monstros-figura', figura(e, !!qtd), qtd ? '' : el('span.monstros-interroga', { 'aria-hidden': 'true' }, '?')));
          li.tabIndex = 0;
          li.setAttribute('aria-label', qtd ? e.nome + ', de ' + e.lugar + ', ' + qtd :
            e.daMateria ? 'Monstro da Casa Mal-Assombrada: termine ' + deOnde(e) + ' para ganhar' : 'Monstro de ' + e.lugar + ', ainda não pegou');
          if (!qtd) {
            li.appendChild(el('b', '?'));
            li.appendChild(el('small', U.colado && e.daMateria ? U.colado(deOnde(e)) : deOnde(e)));
            grade.appendChild(li);
            return;
          }
          li.appendChild(el('b', nome));
          li.appendChild(el('small', U.colado ? U.colado(e.curto) : e.curto));
          li.appendChild(el('span.monstros-qtd', '×' + qtd));
          if (junto) li.appendChild(el('span.monstros-selo', 'Está com você'));
          var leva = !junto, semVaga = leva && cheio;
          var b = el('button.btn-grande' + (leva && !semVaga ? '.btn-principal' : '') + '.monstros-levar', { type: 'button', 'data-monstro': e.id },
            leva ? 'Levar comigo' : 'Deixar em casa');
          b.setAttribute('aria-label', (leva ? 'Levar ' : 'Deixar em casa ') + e.nome + (leva ? ' comigo' : '') +
            (semVaga ? '. Sem vaga. ' + porque : ''));
          if (semVaga) b.setAttribute('aria-disabled', 'true');
          b.addEventListener('click', function () {
            if (semVaga) { Reino._ui.toqueIgnorado(b); UI.avisoItem({ icone: ICONE, texto: porque }); return; }
            Reino.Som.tocar(leva ? 'selecionar' : 'toque');
            if (leva) M.equipar(e.id); else M.deixar(e.id);
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
