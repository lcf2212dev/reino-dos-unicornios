/* Escolha do móvel avulso de uma sala feita (docs/contratos/casa.md §12). Cartões dos móveis sorteados
   (Reino.CasaMoveis.opcoes(sala), em geral 5): a capa desenhada pelo objeto da biblioteca (UI.capaCasa, de
   ui/casa-kits.js), o nome e o cômodo onde combina; o que ela já tem diz "Mais um!".
   UI.escolherMovelCasa(salaId, { de, total }) → Promise(bool): o toque dá o móvel (CasaMoveis.escolher), festa e
   fala do Claude → true; "Depois" (ou Esc) → false, a sala fica pendente (volta no próximo login, no fim da próxima
   sala e na caixa de mudança).
   UI.casaMoveisPendentes() → Promise: abre a escolha uma vez por sala pendente, em ordem; sem nenhuma, resolve
   na hora; "Depois" para a fila. Estilos: css/ui-casa-kits.css (os cartões) e css/ui-casa-moveis.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;
  var FALAS = Reino.CasaFalas;   // ui/casa-falas.js

  /** @returns {Promise<boolean>} true se escolheu um móvel */
  UI.escolherMovelCasa = function (salaId, ordem) {
    var CM = Reino.CasaMoveis, C = Reino.Casa, info = CM && CM.salaInfo(salaId);
    var ids = info && CM.pendentes().indexOf(salaId) >= 0 ? CM.opcoes(salaId) : [];
    if (!ids.length || !window.PA || !UI.capaCasa) return Promise.resolve(false);
    ordem = ordem || {};
    return new Promise(function (resolver) {
      var pn = UI.painel('movel-casa', 'Escolha um móvel!', { semFechar: true });
      var feito = false;
      pn.tela.classList.add('tela-movel-casa');
      var conta = ordem.total > 1 ? el('span.cmovel-conta', (ordem.de || 1) + ' de ' + ordem.total) : null;
      pn.conteudo.appendChild(el('p.ckit-dica.cmovel-dica', U.colado('Presente da sala “' + info.sala.nome + '”'), conta));
      var grade = el('div.ckit-grade.cmovel-grade');
      ids.forEach(function (id) {
        var m = Reino.movelCasa(id), tem = CM.qtd(id);
        var b = el('button.ckit-cartao.cmovel-cartao', { type: 'button', 'data-movel': id },
          el('span.ckit-moldura', UI.capaCasa(m.objeto)), el('b.ckit-nome', U.colado(m.nome)),
          el('span.cmovel-comodo', U.colado(C.nomeKit(m.comodo))),
          tem ? el('span.cmovel-mais', 'Mais um!') : null);
        b.addEventListener('click', function () { escolher(id, b); });
        grade.appendChild(b);
      });
      var depois = el('button.btn-grande.btn-secundario.ckit-depois', { type: 'button' }, 'Depois');
      depois.addEventListener('click', function () { if (!feito) sair(false); });
      pn.conteudo.appendChild(grade);
      pn.conteudo.appendChild(el('div.ckit-botoes', depois));
      pn.tela._aoEsc = function () { if (!feito) sair(false); };
      // a fala só na primeira tela da fila (são muitas seguidas)
      if (!(ordem.de > 1)) Reino.Som.falar([FALAS.movel], { voz: 'claude' });

      function escolher(id, b) {
        if (feito) return;
        if (!CM.escolher(salaId, id)) { Reino.Som.tocar('erro'); return; }
        feito = true;
        b.classList.add('escolhido');
        UI.festa(2, { item: b });
        Reino.Som.calar();
        Reino.Som.falar([FALAS.movelGanhou], { voz: 'claude' });
        if (U.animar()) setTimeout(function () { sair(true); }, Reino.config.movimento.lento * 2);
        else sair(true);
      }
      function sair(ok) {
        feito = true;
        if (!ok) Reino.Som.tocar('toque');
        UI.fecharTela(pn.tela);
        resolver(ok);
      }
    });
  };

  /** Uma escolha por sala pendente, em ordem; "Depois" para a fila. @returns {Promise<void>} */
  UI.casaMoveisPendentes = function () {
    var CM = Reino.CasaMoveis, total = CM ? CM.pendentes().length : 0, de = 0;
    function proxima() {
      var p = CM.pendentes();
      if (!p.length) return Promise.resolve();
      de++;
      return UI.escolherMovelCasa(p[0], { de: de, total: total }).then(function (ok) { return ok ? proxima() : undefined; });
    }
    return total ? proxima() : Promise.resolve();
  };
})();
