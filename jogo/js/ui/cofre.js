/* Tela do cofre da praça (tocar no pote de moedas, mundo/cofre-desenho.js): o pote grande, quantas moedas já tem,
   quantas faltam para encher (cheio em Reino.config.cofre.cheio) e uma linha por matéria do bimestre (as não
   arquivadas), com as moedas dela de Reino.config.valorPorMateria. Só lê o progresso. */
(function () {
  var U = Reino.util, el = U.el;
  var UI = Reino.UI;

  UI.telaCofre = function () {
    var P = Reino.Progresso, C = Reino.Cofre;
    var moedas = C.moedas(), cheio = C.cheio(), falta = Math.max(0, cheio - moedas);
    var pn = UI.painel('cofre', '🪙 Cofre de moedas', { curto: '🪙 Cofre' });
    var c = pn.conteudo;
    // o pote: escala par (arte.md §10.7), 4 onde cabe, 2 no celular
    var escala = window.innerWidth < 600 ? 2 : 4;
    var pote = PA.paraDOM(C.canvas(moedas), escala, 'cofre-pote');
    pote.setAttribute('aria-hidden', 'true');
    var frases = el('div.cofre-frases',
      el('p.cofre-total', U.colado('Você já tem ' + U.moedas(moedas) + ' no cofre! 🪙')),
      el('p.cofre-falta', falta > 0 ? U.colado('Faltam ' + U.moedas(falta) + ' para encher.') : 'O cofre está cheio! 🎉'),
      el('div.cofre-barra', { 'aria-hidden': 'true' }, el('span', { style: { width: Math.round(Math.min(1, moedas / cheio) * 100) + '%' } })));
    var lista = el('ul.cofre-lista');
    var total = Reino.config.valorPorMateria;
    Reino.materias.filter(function (m) { return !m.arquivada; }).forEach(function (m) {
      var ganho = P.dinheiroMateria(m);
      lista.appendChild(el('li.cofre-materia' + (ganho >= total ? '.completa' : ''),
        el('span.cofre-nome', (m.emoji ? m.emoji + ' ' : '') + m.nome),
        el('span.cofre-valor', U.colado('🪙 ' + U.moedasNumero(ganho) + ' de ' + U.moedas(total)))));
    });
    c.appendChild(el('div.cofre-topo', pote, frases));
    c.appendChild(el('h3.cofre-subtitulo', 'Moedas de cada matéria'));
    c.appendChild(lista);
    return pn;
  };
})();
