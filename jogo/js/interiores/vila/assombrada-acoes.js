/* Vila Arco-Íris, Casa Mal-Assombrada: a ação { tipo: 'assombrada-monstro', especie } das 6 jaulas (assombrada.js;
   docs/contratos/vila.md §2, monstros.md §10). Tocar numa jaula abre o balão da narradora com o monstro no retrato
   (colorido e piscando se ela já ganhou; em silhueta se não) e uma fala conforme o estado, lido na hora de
   Reino.Monstros (só a API: equipar é o único que grava, e é o Monstros que grava):
   - ainda não ganhou (a matéria de agora do prédio por terminar): "Termine a <matéria>!" e "E ganhe o <monstro>!";
   - ganhou e ele não está com ela: "O <monstro> é seu!" e "Quer levar com você?", com "Levar comigo" / "Agora não";
     levar = Monstros.equipar: deu, "Ele está com você!"; sem vaga (false), "Não tem vaga para mais um." e
     "Deixe um monstro em casa.";
   - ganhou e está com ela: "O <monstro> é seu!" e "Ele está com você!".
   As falas (assombrada-falas.js) são lidas na hora e vão para o listar-falas pelo módulo 'assombrada' (voz da
   narradora, pacote interior-bosque). node: true: no carregamento só registra o módulo. */
(function () {
  var R = window.Reino;
  var VOZ = 'narradora', PACOTE = 'interior-bosque';
  var CONTINUAR = { texto: 'Continuar →', valor: 'mais', principal: true };
  var OK = [{ texto: 'Ok! 👍', valor: 'ok', principal: true }];
  var LEVAR = [{ texto: 'Levar comigo', valor: 'levar', principal: true }, { texto: 'Agora não', valor: 'nao' }];

  function falasDaCasa() { var v = (R.FALAS_INTERIORES || {}).vila; return (v && v.assombrada) || null; }
  function som(nome) { if (R.Som && R.Som.tocar) { try { R.Som.tocar(nome || 'selecionar'); } catch (e) { /* sem som */ } } }
  // o retrato: o monstro parado e piscando (o balão alterna os dois), ou a silhueta
  function retrato(id, tem) {
    var M = R.Monstros;
    try {
      var s = M.sprite(id, 0);
      if (!s) return null;
      if (!tem) return window.PA && PA.silhueta ? PA.silhueta(s) : s;
      return [s, M.sprite(id, 1) || s];
    } catch (e) { return null; }
  }
  // páginas curtas, uma por balão; os botões do fim só na última
  function falarPaginas(pags, quem, botoesFim) {
    var Cl = R.Claude, i = 0;
    if (!Cl || !Cl.falar || !pags || !pags.length) return Promise.resolve(null);
    function prox(val) {
      if (val === null || val === undefined) return null;
      var pg = pags[i], ultima = i >= pags.length - 1;
      i++;
      var r = Cl.falar(pg, { quem: quem, modal: true, voz: VOZ, fala: [pg], botoes: ultima ? botoesFim : [CONTINUAR] });
      return ultima ? r : r.then(prox);
    }
    return prox('ok');
  }

  function tocar(acao) {
    var M = R.Monstros, f = falasDaCasa(), id = acao && acao.especie;
    var e = M && M.especie ? M.especie(id) : null, d = f && f.especies && f.especies[id];
    if (!e || !d) return Promise.resolve(null);
    var tem = M.quantos(id) > 0, junto = d.ela ? f.juntoEla : f.junto;
    var quem = { nome: e.nome, retrato: retrato(id, tem), voz: VOZ };
    som();
    if (!tem) return falarPaginas([d.termine, d.ganhe], quem, OK);
    if (M.estaJunto(id)) return falarPaginas([d.seu, junto], quem, OK);
    return falarPaginas([d.seu, f.levar], quem, LEVAR).then(function (v) {
      if (v !== 'levar') return v;
      if (M.equipar(id)) { som('acerto'); return falarPaginas([junto], quem, OK); }
      return falarPaginas(f.semVaga, quem, OK);
    });
  }

  // tudo o que as jaulas dizem, para o pacote de vozes
  function falas() {
    var f = falasDaCasa(), t = [];
    if (!f) return t;
    Object.keys(f.especies || {}).forEach(function (id) { var d = f.especies[id]; t.push(d.termine, d.ganhe, d.seu); });
    t = t.concat([f.levar, f.junto, f.juntoEla], f.semVaga || []);
    return t.filter(Boolean).map(function (texto) { return { texto: texto, voz: VOZ, pacote: PACOTE }; });
  }

  R.registrarModulo({
    id: 'assombrada',
    acoes: { 'assombrada-monstro': tocar },
    falas: falas,
    depurar: function () { var M = R.Monstros; return M && M.daMateria ? M.daMateria() : null; },
  });
})();
