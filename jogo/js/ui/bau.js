/* Baú do Tesouro: quantos Robux ela já ganhou, por matéria (o 💰 é o símbolo do Robux). */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var UI = Reino.UI, R = Reino._ui;
  var painel = R.painel, barraDinheiro = R.barraDinheiro;

  /* ---------- baú do tesouro ---------- */
  UI.telaBau = function () {
    var pn = painel('lugar', '💰 Baú do Tesouro');
    var c = pn.conteudo;
    // os três números: o que ganhou, o que os pais já deram e o que falta receber (o 💰 do HUD)
    function total(icone, rotulo, valor) { return el('div.bau-total', el('span.bau-moeda', icone), el('div', el('small', rotulo), el('b', U.colado(U.robux(valor))))); }
    c.appendChild(el('div.bau-totais', total('💰', 'Você já ganhou', P.dinheiroTotal()), total('🎁', 'Já recebeu', P.pagoTotal()),
      total('✨', 'Para receber', P.saldoRobux())));
    Reino.materias.forEach(function (m) {
      c.appendChild(el('div.bau-materia', el('b', m.emoji + ' ' + m.nome), barraDinheiro(m),
        el('small', U.colado(P.salasFeitas(m) + ' de ' + m.salas.length + ' salas feitas • cada sala vale ' + U.robux(P.valorSala(m)) +
          (P.bonusMateria(m) > 0 ? ' + ' + U.robux(P.bonusMateria(m)) + ' de bônus ao completar' : '')))));
    });
    c.appendChild(el('div.aviso-medalha',
      el('span.aviso-medalha-icone', '🥇'),
      el('p', 'E tem mais: a medalha de ouro da escola vale ', el('b', U.colado(U.robux(Reino.config.medalhaEscolaValor))), '! Para ganhar, é só fazer a prova com calma e revisar tudo antes de entregar.')));
    c.appendChild(el('p.bau-nota', 'Novas matérias vão chegar ao Reino, e cada uma vale mais ' + U.robux(Reino.config.valorPorMateria) + '!'));
  };
})();
