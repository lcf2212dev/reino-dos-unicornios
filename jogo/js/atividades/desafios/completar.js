/* Desafio completar: completar frases com as palavras do quadro (lacuna solta ou colada na palavra, com figura opcional). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  var TIPOS = _d.TIPOS, PONTUAR = _d.PONTUAR, fracao = _d.fracao;

  // completar: a palavra j vale na frase f? (a certa ou uma das aceitas)
  function completarAceita(f, j) { return j === f.certa || (f.aceitas || []).indexOf(j) >= 0; }
  // figura de js/arte/icones.js (32×32) para uma frase do completar; desenho que falta: ❓
  function figuraCompletar(f) {
    var desenho = PA.iconeDesenho(f.img);
    return el('span.completar-img', { role: 'img', 'aria-label': f.alt ? U.semEn(f.alt) : null },
      desenho ? PA.paraDOM(desenho, PA.escalaNitida(desenho.width > 16 ? 64 : 48, desenho.width)) : '❓');
  }

  // colado: [texto antes da palavra, pedaço da palavra antes da lacuna, pedaço depois, resto da frase]
  // ('Meu pai dirigiu o ca' + lacuna + 'o até o local.' → 'Meu pai dirigiu o ', 'ca', 'o', ' até o local.')
  function partesColado(f) {
    var a = f.antes.match(/^([\s\S]*\s)?(\S*)$/), b = f.depois.match(/^(\S*)([\s\S]*)$/);
    return [a[1] || '', a[2], b[1], b[2]];
  }

  // completar frases com as palavras do quadro — valor: [índice da palavra ou null por frase]
  // campos opcionais: d.colado (lacuna dentro da palavra), frases[i].img + alt (figura), frases[i].aceitas (outros índices certos)
  TIPOS.completar = function (d, opts) {
    var escolha = opts.valorInicial ? opts.valorInicial.slice() : d.frases.map(function () { return null; });
    // colado com frase inteira (espaço no antes/depois): a caixa ocupa a largura toda e a linha quebra nos espaços
    var coladoLongo = !!d.colado && d.frases.some(function (f) { return /\s/.test((f.antes + f.depois).trim()); });
    // com figura ou com a lacuna dentro da palavra solta: os itens ficam numa grade compacta
    var comFigura = d.frases.some(function (f) { return f.img; }) || (!!d.colado && !coladoLongo);
    var wrap = el('div.completar' + (d.colado ? '.completar-colado' : '') + (coladoLongo ? '.completar-colado-longo' : '') + (comFigura ? '.completar-grade' : ''));
    wrap.appendChild(el('div.quadro-palavras', d.palavras.map(function (p, i) {
      return [i ? el('span.quadro-traco', '–') : null, el('b', p)];
    })));
    var grade = comFigura ? el('div.completar-itens') : wrap;
    // quantos botões cada item tem: a coluna da grade fica larga o bastante para botões de 48 px (css)
    if (comFigura) grade.style.setProperty('--opcoes', String(d.palavras.length));
    if (comFigura) wrap.appendChild(grade);
    var frases = d.frases.map(function (f, i) {
      var lacuna = el('span.lacuna' + (d.colado ? '.lacuna-colada' : ''));
      var botoes = d.palavras.map(function (p, j) {
        var b = el('button.chip-palavra', { type: 'button' }, p);
        b.addEventListener('click', function () {
          if (ctrl.travado) return;
          escolha[i] = escolha[i] === j ? null : j;
          Reino.Som.tocar(escolha[i] === null ? 'toque' : 'selecionar'); pintar(); opts.onMudar();
        });
        return b;
      });
      // colado: PA + lacuna + ARINHO, sem espaços; só a palavra da lacuna fica inteira (o resto da frase quebra nos espaços)
      var cola = d.colado && partesColado(f);
      var texto = d.colado
        ? el('p.frase-texto.frase-colada', f.letra ? el('b', f.letra + ') ') : null, cola[0], el('span.palavra-colada', cola[1], lacuna, cola[2]), cola[3])
        : el('p.frase-texto', f.letra ? el('b', f.letra + ') ') : null, f.antes + ' ', lacuna, f.depois.match(/^[.,!?]/) ? '' : ' ', f.depois);
      // colado na grade: quantas letras a linha "a) PA__ARINHO" tem (a fonte pixel tem 1em por letra; a lacuna
      // vale a maior palavra do quadro, no mínimo 2). O css encolhe um pouco a fonte só se a linha não couber.
      if (d.colado && !coladoLongo) {
        var maior = Math.max.apply(null, d.palavras.map(function (p) { return String(p).length; }).concat(2));
        texto.style.setProperty('--letras', String((f.letra ? f.letra.length + 2 : 0) + cola.join('').length + maior));
      }
      var caixa = el('div.frase-completar' + (f.img ? '.com-img' : ''),
        f.img ? figuraCompletar(f) : null,
        texto,
        el('div.frase-opcoes', botoes));
      grade.appendChild(caixa);
      return { caixa: caixa, lacuna: lacuna, botoes: botoes };
    });
    function pintar() {
      frases.forEach(function (f, i) {
        U.preencher(f.lacuna, escolha[i] === null ? (d.colado ? '  ' : '______') : d.palavras[escolha[i]]);
        f.lacuna.classList.toggle('preenchida', escolha[i] !== null);
        f.botoes.forEach(function (b, j) { b.setAttribute('aria-pressed', String(escolha[i] === j)); });
      });
    }
    pintar();
    var ctrl = {
      el: wrap,
      valor: function () { return escolha.slice(); },
      pronto: function () { return escolha.every(function (e) { return e !== null; }); },
      conferir: function () {
        // livre: questão pessoal, vale qualquer palavra (a mesma pode ir em mais de uma lacuna)
        if (d.livre) return { ok: escolha.every(function (e) { return e !== null; }), erradas: [] };
        var erradas = escolha.map(function (e, i) { return completarAceita(d.frases[i], e) ? -1 : i; }).filter(function (i) { return i >= 0; });
        return { ok: erradas.length === 0, erradas: erradas };
      },
      marcarErro: function (res) { (res.erradas || []).forEach(function (i) { escolha[i] = null; }); pintar(); opts.onMudar(); },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  };
  PONTUAR.completar = function (d, valor) {
    if (d.livre) return valor.every(function (v) { return v != null; }) ? 1 : 0;
    return fracao(d.frases.filter(function (f, i) { return valor[i] != null && completarAceita(f, valor[i]); }).length, d.frases.length);
  };
})();
