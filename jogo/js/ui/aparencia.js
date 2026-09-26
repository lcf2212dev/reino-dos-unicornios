/* Aparência: escolher as cores da personagem (primeira vez e pelos Ajustes). */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var UI = Reino.UI, R = Reino._ui;
  var painel = R.painel, aparencia = R.aparencia;

  /* ---------- aparência ---------- */
  UI.telaAparencia = function (primeiraVez) {
    return new Promise(function (resolver) {
      var pn = painel('aparencia', primeiraVez ? 'Como você é?' : '👧 Minha personagem', { semFechar: !!primeiraVez, aoFechar: resolver });
      var ap = aparencia();
      var previa = el('div.previa-personagem');
      function pintar() { previa.innerHTML = ''; previa.appendChild(PA.paraDOM(PA.mariana(ap, false, 0), 8)); }
      var grupos = [['pele', 'Pele'], ['cabelo', 'Cabelo'], ['roupa', 'Roupa'], ['laco', 'Laço']];
      pn.conteudo.appendChild(previa);
      grupos.forEach(function (g) {
        var linha = el('div.linha-cores', el('span.rotulo-cor', g[1]));
        PA.OPCOES_APARENCIA[g[0]].forEach(function (cor) {
          var b = el('button.bolinha-cor', { type: 'button', 'aria-label': g[1] + ' ' + cor, 'aria-pressed': String(ap[g[0]] === cor), style: { background: cor } });
          b.addEventListener('click', function () {
            ap[g[0]] = cor; Reino.Som.tocar('selecionar'); pintar();
            U.$$('button', linha).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          });
          linha.appendChild(b);
        });
        pn.conteudo.appendChild(linha);
      });
      var ok = el('button.btn-grande.btn-principal', { type: 'button' }, 'Pronto! ✨');
      ok.addEventListener('click', function () { P.salvar(); UI.fecharTela(pn.tela); resolver(); });
      pn.conteudo.appendChild(el('div.intro-botoes', ok));
      pintar();
    });
  };
})();
