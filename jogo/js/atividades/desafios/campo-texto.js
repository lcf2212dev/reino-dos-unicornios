/* Campo de digitar dos desafios do 4º bimestre (digitar, escrever, tabela, cruzadinha): a caixa de texto com a
   fileira de acentos (ã á â à é ê í ó ô õ ú ç) que escreve na caixa com foco, e a comparação de respostas
   digitadas. Não é tipo de desafio: só helpers em Reino._desafios (carregado antes dos tipos que usam).
     _d.campoTexto({ valor, aoMudar(texto), rotulo, linhas, max, classe, semAcentos }) → { el, campo, valor(), travar(sim) }
     _d.fileiraAcentos(alvo() → campo|null) → elemento com os botões (o campo de foco recebe a letra)
     _d.acentosNoFoco(fileira, campo, depoisDe?)  uma fileira para várias caixas: quando o campo ganha o foco, a fileira
                            vai para logo depois de `depoisDe` (padrão: o próprio campo), e o Tab do campo leva direto
                            aos acentos dele (o toque também: a fileira fica perto da caixa, acima do teclado da tela)
     _d.normalizar(t)       minúsculas, sem espaço sobrando e sem pontuação no fim (o acento continua)
     _d.semAcento(t)        normalizar e sem acentos (para palavras-chave da escrita livre)
     _d.digitadaCerta(t, certas)  t bate com alguma das certas (normalizar dos dois lados) */
(function () {
  var U = Reino.util, el = U.el, _d = Reino._desafios;
  var ACENTOS = ['ã', 'á', 'â', 'à', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ç'];

  _d.normalizar = function (t) {
    return String(t == null ? '' : t).toLowerCase().replace(/\s+/g, ' ').trim().replace(/[.!?…;:,]+$/, '').trim();
  };
  _d.semAcento = function (t) { return _d.normalizar(t).normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  _d.digitadaCerta = function (t, certas) {
    var n = _d.normalizar(t);
    return !!n && [].concat(certas || []).some(function (c) { return _d.normalizar(c) === n; });
  };

  // escreve a letra no campo, onde está o cursor (ou no fim), e avisa como se fosse digitada
  function escrever(campo, letra) {
    var ini = typeof campo.selectionStart === 'number' ? campo.selectionStart : campo.value.length;
    var fim = typeof campo.selectionEnd === 'number' ? campo.selectionEnd : ini;
    var max = campo.maxLength > 0 ? campo.maxLength : Infinity;
    if (campo.value.length - (fim - ini) + letra.length > max) return;
    var maiuscula = campo.dataset.maiusculas === 'sim';
    var l = maiuscula ? letra.toUpperCase() : letra;
    campo.value = campo.value.slice(0, ini) + l + campo.value.slice(fim);
    var pos = ini + l.length;
    if (campo.setSelectionRange) campo.setSelectionRange(pos, pos);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  }
  _d.fileiraAcentos = function (alvo) {
    var fila = el('div.acentos', { role: 'group', 'aria-label': 'Letras com acento' });
    ACENTOS.forEach(function (a) {
      var b = el('button.acento', { type: 'button', 'aria-label': 'Letra ' + a }, a);
      // o toque não tira o foco do campo (mousedown), e o teclado escreve no último campo que teve foco
      b.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
      b.addEventListener('click', function () {
        var c = alvo();
        if (!c || c.disabled || c.readOnly) return;
        escrever(c, a);
        Reino.Som.tocar('toque');
        if (!_d.doTeclado || !Reino.UI.porTeclado()) c.focus();
      });
      fila.appendChild(b);
    });
    return fila;
  };

  _d.acentosNoFoco = function (fileira, campo, depoisDe) {
    campo.addEventListener('focus', function () {
      var ref = depoisDe || campo;
      if (ref.parentNode && ref.nextSibling !== fileira) ref.parentNode.insertBefore(fileira, ref.nextSibling);
    });
  };

  _d.campoTexto = function (o) {
    o = o || {};
    var linhas = o.linhas || 1;
    var campo = linhas > 1
      ? el('textarea.campo-texto' + (o.classe || ''), { rows: linhas, 'aria-label': o.rotulo || 'Resposta', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off' })
      : el('input.campo-texto' + (o.classe || ''), { type: 'text', 'aria-label': o.rotulo || 'Resposta', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off' });
    if (o.max) campo.maxLength = o.max;
    campo.value = o.valor || '';
    campo.addEventListener('input', function () { if (o.aoMudar) o.aoMudar(campo.value); });
    var caixa = el('div.campo-texto-caixa', campo, o.semAcentos ? null : _d.fileiraAcentos(function () { return campo; }));
    return {
      el: caixa, campo: campo,
      valor: function () { return campo.value; },
      travar: function (sim) { campo.readOnly = !!sim; caixa.classList.toggle('travado', !!sim); },
    };
  };
})();
