/* Baú do Tesouro: quanto ela já ganhou, por matéria. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var UI = Reino.UI, R = Reino._ui;
  var painel = R.painel, barraDinheiro = R.barraDinheiro;

  /* ---------- baú do tesouro ---------- */
  UI.telaBau = function () {
    var pn = painel('lugar', '💰 Baú do Tesouro');
    var c = pn.conteudo;
    c.appendChild(el('div.bau-total', el('span.bau-moeda', '🪙'), el('div', el('small', 'Você já ganhou'), el('b', U.colado(U.reais(P.dinheiroTotal()))))));
    Reino.materias.forEach(function (m) {
      c.appendChild(el('div.bau-materia', el('b', m.emoji + ' ' + m.nome), barraDinheiro(m),
        el('small', U.colado(P.salasFeitas(m) + ' de ' + m.salas.length + ' salas feitas • cada sala vale ' + U.reais(P.valorSala(m)) +
          (P.bonusMateria(m) > 0 ? ' + ' + U.reais(P.bonusMateria(m)) + ' de bônus ao completar' : '')))));
    });
    c.appendChild(el('div.aviso-medalha',
      el('span.aviso-medalha-icone', '🥇'),
      el('p', 'E tem mais: a medalha de ouro da escola vale ', el('b', U.colado(U.reais(Reino.config.medalhaEscolaValor))), '! Para ganhar, é só fazer a prova com calma e revisar tudo antes de entregar.')));
    c.appendChild(el('p.bau-nota', 'Novas matérias vão chegar ao Reino, e cada uma vale mais ' + U.reais(Reino.config.valorPorMateria) + '!'));
  };
})();
