/* Salão de Beleza: escolher o FORMATO do corte de cabelo (cadeira da Dona Lulu) ou o MODELO da roupa (arara),
   todos (os de menina e os de menino, os do sexo de quem joga primeiro), com a prévia grande (de frente, de lado, de costas e montada). Grátis. As cores continuam na tela de aparência
   (Ajustes). Grava em aparencia.corte / aparencia.modelo (os ids de PA.CORTES / PA.MODELOS) ao fechar. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var UI = Reino.UI, R = Reino._ui;
  var painel = R.painel, aparencia = R.aparencia;

  var TIPOS = {
    cabelo: { campo: 'corte', titulo: '✂ Cortes de cabelo', lista: function () { return PA.CORTES; }, rotulo: 'Corte' },
    roupa: { campo: 'modelo', titulo: '👗 Roupas', lista: function () { return PA.MODELOS; }, rotulo: 'Roupa' },
  };

  // a montaria de agora (a de reserva se não houver), para a prévia montada
  function defMontaria() {
    try { var id = P.montaria(); return P.defUni(id) ? { def: P.defUni(id), estagio: Reino.Unicornios.estagio((P.estado().unis[id] || {}).xp || 0) } : null; }
    catch (e) { return null; }
  }

  /** Abre a escolha de corte ('cabelo') ou de roupa ('roupa'). @param {string} tipo @returns {Promise<void>} */
  UI.telaSalao = function (tipo) {
    var T = TIPOS[tipo] || TIPOS.cabelo;
    return new Promise(function (resolver) {
      var antes = PA.visualMariana(aparencia())[T.campo];
      var pn = painel('salao', T.titulo, { aoFechar: fechou });
      function fechou() {
        // grava só se mudou (cada P.salvar sincroniza); lê o estado na hora (a mescla troca o objeto)
        if (PA.visualMariana(aparencia())[T.campo] !== antes) P.salvar();
        resolver();
      }
      var grande = el('div.salao-grande'), vistas = el('div.salao-vistas');
      pn.conteudo.appendChild(el('div.salao-previa', grande, vistas));
      function pintar() {
        var ap = aparencia();
        grande.innerHTML = ''; vistas.innerHTML = '';
        grande.appendChild(PA.paraDOM(PA.mariana(ap, false, 1, { vista: 'frente' }), 8));
        [['lado', 'De lado'], ['costas', 'De costas']].forEach(function (v) {
          vistas.appendChild(el('div.salao-vista', PA.paraDOM(PA.mariana(ap, false, 1, { vista: v[0] }), 4), el('small.salao-legenda', v[1])));
        });
        var m = defMontaria();
        if (m) vistas.appendChild(el('div.salao-vista.salao-montada', PA.paraDOM(PA.montada(m.def, m.estagio, 0, ap, { vista: 'lado' }), 2), el('small.salao-legenda', 'Montada')));
      }
      var grade = el('div.salao-opcoes', { role: 'group', 'aria-label': T.rotulo });
      // todos os cortes e roupas, os do sexo de quem joga primeiro (a ordem de cada grupo fica a de sempre)
      var sexo = PA.sexoJogador();
      var lista = T.lista().filter(function (o) { return (o.sexo || 'menina') === sexo; })
        .concat(T.lista().filter(function (o) { return (o.sexo || 'menina') !== sexo; }));
      lista.forEach(function (o) {
        var ap = aparencia(), prova = Object.assign({}, ap);
        prova[T.campo] = o.id;
        var b = el('button.salao-opcao', { type: 'button', 'aria-pressed': String(PA.visualMariana(ap)[T.campo] === o.id) },
          el('span.salao-retrato', PA.paraDOM(PA.mariana(prova, false, 1, { vista: 'frente' }), 4)),
          el('span.salao-nome', o.nome));
        b.addEventListener('click', function () {
          aparencia()[T.campo] = o.id;
          Reino.Som.tocar('selecionar'); pintar();
          U.$$('button.salao-opcao', grade).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        });
        grade.appendChild(b);
      });
      pn.conteudo.appendChild(grade);
      var ok = el('button.btn-grande.btn-principal', { type: 'button' }, 'Pronto! ✨');
      ok.addEventListener('click', function () { UI.fecharTela(pn.tela); fechou(); });
      pn.conteudo.appendChild(el('div.intro-botoes', ok));
      pintar();
    });
  };
})();
