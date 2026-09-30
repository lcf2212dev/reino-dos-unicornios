/* Desafio vfLista: várias afirmações, cada uma com ( V ) e ( F ) (ou os rótulos de d.rotulos). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  var fracao = _d.fracao;

  // rótulos dos botões do vfLista: d.rotulos (ex.: ['T', 'F'], ['✓', 'X']); sem rotulos, V/F
  var NOME_ROTULO = { T: 'True', '✓': 'Certo', X: 'Errado' };
  // rótulos com desenho (ex.: ✓): os dois viram desenho (X → ✘, mesma família) a 32 px, 1 pixel de arte = 2 px
  // CSS em escala inteira (ui.md §10.10); o nome falado continua no aria-label
  var DESENHO_ROTULO = { X: '✘' };
  function comDesenho(r) { return !!(window.ICONES && window.ICONES[r] && window.PA && PA.iconeEmoji); }
  function rotuloEl(d, v) {
    var rot = rotulosVF(d), r = rot[v];
    if (!rot.some(comDesenho)) return el('span.vf-rotulo', r);
    var k = comDesenho(r) ? r : DESENHO_ROTULO[r];
    if (!k || !comDesenho(k)) return el('span.vf-rotulo', r);
    var c = PA.iconeEmoji(k, 2), t = 16 * PA.escalaNitida(32, 16);
    c.style.width = c.style.height = t + 'px';
    c.style.display = 'block';
    return el('span.vf-rotulo', c);
  }
  function rotulosVF(d) { return d.rotulos || ['V', 'F']; }
  function nomeRotulo(d, v) {
    var r = rotulosVF(d)[v];
    if (!d.rotulos) return v ? 'Falso' : 'Verdadeiro';
    if (r === 'F') return rotulosVF(d)[0] === 'T' ? 'False' : 'Falso';
    return NOME_ROTULO[r] || r;
  }

  // várias afirmações, cada uma com ( V ) e ( F ) — valor: [0 = V, 1 = F, null]
  var montar = function (d, opts) {
    var marcas = opts.valorInicial ? opts.valorInicial.slice() : d.itens.map(function () { return null; });
    var lista = el('div.vf-lista');
    var linhas = d.itens.map(function (it, i) {
      var rot = rotulosVF(d);
      var bV = el('button.vf-botao', { type: 'button', 'aria-label': nomeRotulo(d, 0) }, rotuloEl(d, 0));
      if (rot.some(comDesenho)) bV.classList.add('vf-com-icone');
      var bF = el('button.vf-botao', { type: 'button', 'aria-label': nomeRotulo(d, 1) }, rotuloEl(d, 1));
      if (rot.some(comDesenho)) bF.classList.add('vf-com-icone');   // botão com desenho: CSS centraliza (padding 0)
      [bV, bF].forEach(function (b, v) {
        b.addEventListener('click', function () {
          if (ctrl.travado) return;
          marcas[i] = v; Reino.Som.tocar('selecionar'); pintar(); opts.onMudar();
        });
      });
      var linha = el('div.vf-linha', el('span.vf-botoes', bV, bF), el('span.vf-texto', it.t));
      lista.appendChild(linha);
      return { linha: linha, b: [bV, bF] };
    });
    function pintar() {
      linhas.forEach(function (l, i) { l.b.forEach(function (b, v) { b.setAttribute('aria-pressed', String(marcas[i] === v)); }); });
    }
    pintar();
    function certo(i) { return d.itens[i].v ? 0 : 1; }
    var ctrl = {
      el: lista,
      valor: function () { return marcas.slice(); },
      pronto: function () { return !_d.marcado(lista) && marcas.every(function (m) { return m !== null; }); },
      conferir: function () {
        var erradas = marcas.map(function (m, i) { return m === certo(i) ? -1 : i; }).filter(function (i) { return i >= 0; });
        return { ok: erradas.length === 0, erradas: erradas };
      },
      marcarErro: function (res) {
        // a linha errada fica marcada com a resposta dela; só depois a marca apaga
        _d.erroParado(lista, (res.erradas || []).map(function (i) { return linhas[i].linha; }), function () {
          (res.erradas || []).forEach(function (i) { marcas[i] = null; });
          pintar(); opts.onMudar();
        });
      },
      marcarCerto: function () { lista.classList.add('tudo-certo'); },
    };
    return ctrl;
  };
  var pontuar = function (d, valor) { return fracao(d.itens.filter(function (it, i) { return valor[i] === (it.v ? 0 : 1); }).length, d.itens.length); };

  function marca(d, v) { return '(' + rotulosVF(d)[v] + ') '; }
  Reino.registrarTipoDesafio('vfLista', {
    montar: montar, pontuar: pontuar, campos: ['rotulos'],
    exemplos: { desafio: { id: 'x', tipo: 'vfLista', itens: [{ t: 'a', v: true }, { t: 'b', v: false }] },
      certa: function (d) { return d.itens.map(function (it) { return it.v ? 0 : 1; }); }, estranhos: [[], [null], [99, 99]] },
    falas: function (d, todos, segs) { d.itens.forEach(function (it) { segs.push(it.t); }); return segs; },
    textoCerto: function (d) { return d.itens.map(function (it) { return marca(d, it.v ? 0 : 1) + it.t; }).join(' • '); },
    textoResposta: function (d, valor) { return d.itens.map(function (it, i) { return (valor[i] === 0 || valor[i] === 1 ? marca(d, valor[i]) : '( ) ') + it.t; }).join(' • '); },
    validar: function (d, v) {
      if (d.rotulos !== undefined) v.checar(Array.isArray(d.rotulos) && d.rotulos.length === 2 && d.rotulos.every(function (r) { return typeof r === 'string' && r; }), d.id + ": rotulos deve ser ['T', 'F'] (2 textos) num vfLista");
      v.checar(d.itens.length >= 2 && d.itens.every(function (i) { return i.t && typeof i.v === 'boolean'; }), d.id + ': V/F inválido');
    },
  });
})();
