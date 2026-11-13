/* Desafios de escolha única: escolha (uma opção certa; também serve para "completar a frase")
   e vf (Verdadeiro ou Falso, a escolha com duas opções fixas). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  var botaoOpcao = _d.botaoOpcao;

  /* opção com desenho (4º bimestre): o.img (chave de window.ICONES) em 64 px em cima do texto; desenho que falta: ❓.
     d.soImagem: só o desenho, com o nome no aria-label. As opções com desenho ficam em grade (.opcoes-img). */
  _d.temImg = function (d) { return d.opcoes.some(function (o) { return o.img; }); };
  _d.botaoImg = function (o, d, extra) {
    return el('button.opcao.opcao-img' + (extra || ''), { type: 'button', 'aria-label': d.soImagem ? U.semEn(o.t) : null },
      el('span.opcao-figura', { 'aria-hidden': 'true' }, o.img ? _d.figuraIcone(o.img, 64) : null),
      d.soImagem ? null : _d.caberTexto(el('span.opcao-texto', _d.textoOpcao(o.t)), true));
  };
  // validar: desenho das opções (aviso na sala, erro na prova) e soImagem só com desenho em todas
  _d.conferirOpcoesImg = function (d, v) {
    var com = (d.opcoes || []).filter(function (o) { return o && o.img !== undefined; });
    if (d.soImagem !== undefined) v.checar(d.soImagem === true && com.length === (d.opcoes || []).length, d.id + ': "soImagem" só vale true, com img em todas as opções');
    com.forEach(function (o) { _d.conferirDesenho(o.img, d.id + ': opção "' + o.t + '"', v); });
  };

  // opções que começam todas com um rótulo em sequência ("A:", "b)", "Foto 1:", "Grupo 2:", "3)"): a ordem do conteúdo,
  // sem sorteio (B, C, E, A embaralhados confundem); as outras continuam sorteadas pela mesma chave
  var RE_ROTULO = /^\s*(?:(?:foto|quadro|grupo|imagem)\s+(\d+)\s*[:).-]?|([a-z])\s*[):]|(\d+)\s*\))/i;
  _d.ordemRotulada = function (d) {
    var ops = d.opcoes || [];
    var ok = ops.length > 1 && ops.every(function (o, i) {
      var m = RE_ROTULO.exec(String(o && o.t || ''));
      if (!m) return false;
      var n = m[1] || m[3] ? Number(m[1] || m[3]) : m[2].toLowerCase().charCodeAt(0) - 96;
      return n === i + 1;
    });
    return ok ? ops.map(function (_, i) { return i; }) : null;
  };

  // escolha única (também serve para "completar a frase")
  function montarEscolha(d, opts) {
    var ordem = opts.ordem || _d.ordemRotulada(d) || U.embaralhar(d.opcoes.map(function (_, i) { return i; }), ['escolha', d]);
    var sel = opts.valorInicial != null ? opts.valorInicial : null;
    var bloqueadas = {};
    var comImg = _d.temImg(d);
    var lista = el('div.opcoes' + (d.opcoes.length === 2 ? '.opcoes-duas' : '') + (comImg ? '.opcoes-img' : ''));
    var botoes = {};
    ordem.forEach(function (i) {
      var o = d.opcoes[i], b = comImg ? _d.botaoImg(o, d) : botaoOpcao({ e: o.e, t: String(o.t) });   // colado e hifenizado: _d.textoOpcao (arte.md §17)
      b.addEventListener('click', function () {
        if (bloqueadas[i] || ctrl.travado) return;
        sel = i; Reino.Som.tocar('selecionar'); pintar(); opts.onMudar();
      });
      botoes[i] = b; lista.appendChild(b);
    });
    function pintar() { Object.keys(botoes).forEach(function (k) { botoes[k].setAttribute('aria-pressed', String(+k === sel)); }); }
    pintar();
    var ctrl = {
      el: lista, ordem: ordem,
      valor: function () { return sel; },
      pronto: function () { return sel !== null; },
      conferir: function () { return { ok: sel === d.certa }; },
      marcarErro: function () { if (sel === null) return; bloqueadas[sel] = true; botoes[sel].classList.add('errada'); botoes[sel].disabled = true; sel = null; pintar(); },
      marcarCerto: function () { botoes[d.certa].classList.add('certa'); },
      revelar: function () { botoes[d.certa].classList.add('certa'); if (sel !== null && sel !== d.certa) botoes[sel].classList.add('errada'); },
    };
    return ctrl;
  }

  function montarVf(d, opts) {
    var d2 = { opcoes: [{ e: '👍', t: 'Verdadeiro' }, { e: '👎', t: 'Falso' }], certa: d.certo ? 0 : 1 };
    var c = montarEscolha(d2, Object.assign({}, opts, { ordem: [0, 1] }));
    c.el.classList.add('opcoes-vf');
    return c;
  }

  // opções lidas depois do enunciado (fala da prova e 🔊), na ordem da tela
  function opcoesFaladas(d, todos, segs) {
    if (d.opcoes) todos(d.opcoes).forEach(function (i) { segs.push(d.opcoes[i].t); });
    return segs;
  }
  _d.opcoesFaladas = opcoesFaladas;
  _d.textoOpcoes = function (d) { return '. ' + d.opcoes.map(function (o) { return o.t; }).join('. '); };

  Reino.registrarTipoDesafio('escolha', {
    montar: montarEscolha, treinavel: true, campos: ['soImagem'],
    // exemplos: para o teste de unidade (desafio sintético, resposta certa de qualquer desafio, respostas estranhas)
    exemplos: { desafio: { id: 'x', tipo: 'escolha', opcoes: [{ t: 'a' }, { t: 'b' }, { t: 'c' }], certa: 2 },
      certa: function (d) { return d.certa; }, estranhos: [-1, 99, '0', true] },
    pontuar: function (d, valor) { return valor === d.certa ? 1 : 0; },
    textoFala: _d.textoOpcoes, falas: opcoesFaladas,
    textoCerto: function (d) { return d.opcoes[d.certa].t; },
    textoResposta: function (d, valor) { return d.opcoes[valor].t; },
    validar: function (d, v) {
      _d.conferirOpcoesImg(d, v);
      if (!v.naProva) {
        v.checar(Array.isArray(d.opcoes) && d.opcoes.length >= 2, d.id + ': poucas opções');
        var textos = d.opcoes.map(function (o) { return o.t; });
        v.checar(Number.isInteger(d.certa) && d.certa >= 0 && d.certa < d.opcoes.length, d.id + ': índice certo inválido');
        v.checar(new Set(textos).size === textos.length, d.id + ': opções repetidas');
      } else v.checar(Number.isInteger(d.certa) && d.certa >= 0 && d.certa < d.opcoes.length, d.id + ': índice certo inválido');
    },
  });

  Reino.registrarTipoDesafio('vf', {
    montar: montarVf, treinavel: true,
    exemplos: { desafio: { id: 'y', tipo: 'vf', afirmacao: 'a', certo: false },
      certa: function (d) { return d.certo ? 0 : 1; }, estranhos: [-1, 2, '0', true] },
    pontuar: function (d, valor) { return valor === (d.certo ? 0 : 1) ? 1 : 0; },
    enunciado: function (d) { return 'Verdadeiro ou falso? ' + d.afirmacao; },
    enunciadoTela: function (d) { return [el('p.pergunta', 'Verdadeiro ou falso?'), el('blockquote.afirmacao', d.afirmacao)]; },
    // só a pergunta fixa e a afirmação (sem a instrução)
    falas: function (d) { return [Reino.Falas.fixas.verdadeiroOuFalso, d.afirmacao]; },
    textoCerto: function (d) { return d.certo ? 'Verdadeiro' : 'Falso'; },
    textoResposta: function (d, valor) { return valor === 0 ? 'Verdadeiro' : 'Falso'; },
    validar: function (d, v) { if (!v.naProva) v.checar(typeof d.certo === 'boolean' && d.afirmacao, d.id + ': V/F incompleto'); },
  });
})();
