/* Desafio escrever: resposta escrita e produção de texto, como no livro (4º bimestre).
   { tipo: 'escrever', pergunta, linhas?: 3, minPalavras?, minFrases?, chaves?: [['gato', 'gata'], …], maiusculas?, modelo? }
   minNomes: N — pelo menos N nomes próprios (palavras com maiúscula fora do começo da frase).
   maiusculas: true (questões de nome próprio e letra maiúscula): cada frase começa com maiúscula e a palavra das chaves
   escrita com maiúscula (ex.: 'Jonas') tem de vir com maiúscula.
   Confere: palavras ≥ minPalavras, frases (terminadas em . ! ?) ≥ minFrases e, em cada grupo de chaves, alguma
   palavra (sem acento, palavra inteira). Errou: res.dica diz o que falta. Acertou: mostra o modelo ("Uma resposta
   possível:"). Todo Conferir guarda o texto (Reino.Producoes, quarto-bimestre.md §8), que volta ao abrir de novo a questão.
   valor: o texto. Pontuação: 1 se cumpriu tudo, senão a fração das regras cumpridas. */
(function () {
  var U = Reino.util, el = U.el, _d = Reino._desafios;
  var RE_PALAVRA = /[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu;
  var MAX_TEXTO = 600;   // o mesmo de Reino.Producoes.MAX_TEXTO

  // o que não é texto vale como vazio
  function texto(t) { return typeof t === 'string' ? t : ''; }
  function palavras(t) { return texto(t).match(RE_PALAVRA) || []; }
  // frases terminadas (. ! ? …) e se sobrou um pedaço com palavra sem ponto no fim
  function frases(t) {
    t = texto(t);
    var n = 0, m, re = /[^.!?…\n]*(?:[.!?…]+|\n)/g, fim = 0;   // a quebra de linha também fecha a frase (uma resposta por linha)
    while ((m = re.exec(t))) { if (/[\p{L}\p{N}]/u.test(m[0])) n++; fim = re.lastIndex; }
    return { n: n, sobra: /[\p{L}\p{N}]/u.test(t.slice(fim)) };
  }
  // sem acento, com as maiúsculas (para conferir nome próprio)
  function semAcentoCaso(t) { return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  // cada frase (até . ! ? …) começa com letra maiúscula
  function inicioMaiusculo(t) {
    return texto(t).split(/[.!?…]+/).every(function (f) { var m = f.match(/\p{L}/u); return !m || m[0] !== m[0].toLowerCase(); });
  }
  // palavras que costumam abrir frase ou bilhete: com maiúscula no começo, não contam como nome próprio
  var ABRE_FRASE = ('a o as os um uma uns umas eu ele ela eles elas nós nos você vocês meu minha meus minhas seu sua ' +
    'nosso nossa este esta esse essa isso isto aquele aquela hoje ontem amanhã depois agora quando onde como porque ' +
    'que quem se mas e no na nos nas em de do da para pra com sem mamãe papai vovó vovô titia titio querida querido ' +
    'oi olá beijos beijo abraços abraço era foi tem há lá aqui sim não muito muita tudo todos todas').split(' ');
  function nomesProprios(t) {
    var n = 0;
    // frase acaba em . ! ? … e também na quebra de linha (bilhete: "Mamãe,⏎Ontem…")
    texto(t).split(/[.!?…\n]+/).forEach(function (f) {
      (f.match(RE_PALAVRA) || []).forEach(function (w, i) {
        if (w.charAt(0) === w.charAt(0).toLowerCase()) return;
        if (i > 0 || ABRE_FRASE.indexOf(w.toLowerCase()) < 0) n++;
      });
    });
    return n;
  }
  function plural(n, um, varios) { return n === 1 ? '1 ' + um : n + ' ' + varios; }

  // as regras do desafio, na ordem em que a dica fala delas: [{ ok, dica, texto (para a resposta certa) }]
  function regras(d, t) {
    var lista = [], ps = palavras(t), fr = frases(t);
    var juntas = ' ' + ps.map(_d.semAcento).join(' ') + ' ';
    if (d.minFrases) {
      var falta = fr.n < d.minFrases, soPonto = falta && fr.n + (fr.sobra ? 1 : 0) >= d.minFrases;
      lista.push({ ok: !falta, texto: d.minFrases === 1 ? 'uma frase inteira' : 'pelo menos ' + d.minFrases + ' frases',
        dica: soPonto ? (d.minFrases === 1 ? 'Termine a frase com um ponto final.' : 'Termine cada frase com um ponto final.')
          : d.minFrases === 1 ? 'Escreva uma frase inteira, com ponto final.' : 'Escreva pelo menos ' + d.minFrases + ' frases.' });
    }
    if (d.minPalavras) lista.push({ ok: ps.length >= d.minPalavras, texto: 'pelo menos ' + plural(d.minPalavras, 'palavra', 'palavras'),
      dica: 'Escreva pelo menos ' + plural(d.minPalavras, 'palavra', 'palavras') + '.' });
    if (d.maiusculas) lista.push({ ok: inicioMaiusculo(t), texto: 'cada frase começando com letra maiúscula',
      dica: 'Comece cada frase com letra maiúscula.' });
    // minNomes: nomes próprios = palavras com maiúscula fora do começo da frase
    if (d.minNomes) lista.push({ ok: nomesProprios(t) >= d.minNomes, texto: 'pelo menos ' + plural(d.minNomes, 'nome próprio', 'nomes próprios'),
      dica: 'Escreva ' + (d.minNomes === 1 ? 'um nome próprio' : d.minNomes + ' nomes próprios') + ' com letra maiúscula.' });
    var juntasCaso = ' ' + ps.map(semAcentoCaso).join(' ') + ' ';
    (d.chaves || []).forEach(function (g) {
      var ok = g.some(function (k) { return juntas.indexOf(' ' + palavras(k).map(_d.semAcento).join(' ') + ' ') >= 0; });
      // com maiusculas, a chave com maiúscula (nome próprio) só vale escrita com maiúscula
      // (só a chave que começa com maiúscula; a em minúscula vale escrita de qualquer jeito)
      var caso = !d.maiusculas || g.some(function (k) {
        var p = ' ' + palavras(k).map(semAcentoCaso).join(' ') + ' ', i = p.match(/\p{L}/u);
        return i && i[0] === i[0].toLowerCase() ? juntas.indexOf(' ' + palavras(k).map(_d.semAcento).join(' ') + ' ') >= 0 : juntasCaso.indexOf(p) >= 0;
      });
      lista.push({ ok: ok && caso, texto: 'a palavra "' + g[0] + '"',
        dica: ok ? 'Nome próprio começa com letra maiúscula: "' + g[0] + '".' : 'Use a palavra "' + g[0] + '" na sua resposta.' });
    });
    return lista;
  }
  function avaliar(d, t) {
    if (!palavras(t).length) return { pontos: 0, dica: 'Escreva a sua resposta.' };
    var rs = regras(d, t), falta = rs.filter(function (r) { return !r.ok; });
    return { pontos: rs.length ? (rs.length - falta.length) / rs.length : 1, dica: falta.length ? falta[0].dica : null };
  }
  var pontuar = function (d, valor) { return typeof valor === 'string' ? avaliar(d, valor).pontos : 0; };

  var montar = function (d, opts) {
    // sem resposta dada (a prova passa a dela): começa com o texto guardado da última vez (só nas salas)
    var guardado = opts.valorInicial == null && opts.modo !== 'prova' && Reino.Producoes ? Reino.Producoes.ler(d.id) : null;
    var inicial = typeof opts.valorInicial === 'string' ? opts.valorInicial : guardado && guardado.texto ? guardado.texto : '';
    var wrap = el('div.escrever');
    var contador = el('small.escrever-contador');
    var c = _d.campoTexto({ valor: inicial, linhas: d.linhas || 3, max: (Reino.Producoes && Reino.Producoes.MAX_TEXTO) || MAX_TEXTO, rotulo: 'Sua resposta',
      aoMudar: function () { if (_d.marcado(wrap)) wrap.__erroFim(); contar(); opts.onMudar(); } });
    function contar() {
      var n = palavras(c.valor()).length;
      // com mínimo: "3 de 6 palavras" até chegar lá
      U.preencher(contador, d.minPalavras && n < d.minPalavras ? n + ' de ' + plural(d.minPalavras, 'palavra', 'palavras') : plural(n, 'palavra', 'palavras'));
    }
    contar();
    // o texto guardado já está pronto: o "Conferir" da sala liga logo depois de a questão entrar na tela
    if (guardado && inicial) setTimeout(function () { if (wrap.isConnected) opts.onMudar(); }, 0);
    c.el.insertBefore(contador, c.campo.nextSibling);   // o contador logo embaixo da caixa, antes dos acentos
    wrap.appendChild(c.el);
    var ctrl = {
      el: wrap,
      valor: function () { return c.valor(); },
      pronto: function () { return !_d.marcado(wrap) && palavras(c.valor()).length > 0; },
      conferir: function () {
        var a = avaliar(d, c.valor()), ok = a.pontos === 1;
        // grava a cada Conferir com alguma palavra, certo ou errado (quarto-bimestre.md §8.2): saindo pelo ✕, o texto fica
        if (palavras(c.valor()).length && Reino.Producoes) Reino.Producoes.guardar(d.id, { texto: c.valor().trim() });
        return { ok: ok, dica: a.dica };
      },
      // a caixa fica marcada (ui.md §10.19.2) até ela escrever de novo; o texto fica
      marcarErro: function () { _d.erroParado(wrap, [c.campo], opts.onMudar); },
      marcarCerto: function () {
        wrap.classList.add('tudo-certo');
        c.travar(true);
        Array.prototype.forEach.call(c.el.querySelectorAll('.acentos button'), function (b) { b.disabled = true; });
        if (d.modelo && !wrap.querySelector('.escrever-modelo')) wrap.appendChild(el('div.escrever-modelo', el('p.escrever-modelo-titulo', 'Uma resposta possível:'), el('p', d.modelo)));
      },
    };
    return ctrl;
  };

  // um texto que cumpre as regras de qualquer desafio do tipo (exemplos.certa): as chaves e palavras a mais, em frases
  function respostaQueCumpre(d) {
    var itens = (d.chaves || []).map(function (g) { return g[0]; });
    var nFrases = d.minFrases || 1;
    while (itens.length < Math.max(d.minPalavras || 1, nFrases)) itens.push('casa');
    // minNomes: nomes próprios depois da 1ª palavra da frase
    for (var k = 0; k < (d.minNomes || 0); k++) itens.push(['Ana', 'Pedro', 'Bia', 'Rui', 'Lia', 'Teo', 'Duda', 'Caio'][k % 8]);
    var fr = [];
    itens.forEach(function (p, i) { (fr[i % nFrases] = fr[i % nFrases] || []).push(p); });
    // maiusculas: cada frase começa com maiúscula (com uma palavra comum na frente, o nome próprio fica no meio)
    return fr.map(function (f) {
      var t = (d.maiusculas || d.minNomes ? 'Eu vi ' : '') + f.join(' ');
      return (d.maiusculas ? t.charAt(0).toUpperCase() + t.slice(1) : t) + '.';
    }).join(' ');
  }

  Reino.registrarTipoDesafio('escrever', {
    montar: montar, pontuar: pontuar, especial: true, campos: ['minPalavras', 'minFrases', 'chaves', 'maiusculas', 'minNomes'],
    exemplos: {
      desafio: { id: 'x', tipo: 'escrever', minFrases: 2, minPalavras: 6, chaves: [['gato', 'gata'], ['Gato de Botas']], modelo: 'O Gato de Botas era esperto. A gata gostou dele.' },
      certa: respostaQueCumpre,
      estranhos: ['', '   ', 'gato', 'O cachorro late.', 'gato gato gato gato gato gato', 'Gato de Botas', '...'],
    },
    textoCerto: function (d) {
      if (d.modelo) return d.modelo;
      var rs = regras(d, '');
      return rs.length ? 'Uma resposta com ' + rs.map(function (r) { return r.texto; }).join(', ') + '.' : 'Uma resposta com as suas palavras.';
    },
    textoResposta: function (d, valor) { return (typeof valor === 'string' && valor.trim()) || '(sem resposta)'; },
    validar: function (d, v) {
      v.checar(v.textoOk(d.pergunta), d.id + ': escrever sem pergunta');
      function inteiro(k, min, max) { if (d[k] !== undefined) v.checar(Number.isInteger(d[k]) && d[k] >= min && d[k] <= max, d.id + ': "' + k + '" deve ser um número de ' + min + ' a ' + max); }
      inteiro('linhas', 2, 8); inteiro('minPalavras', 1, 80); inteiro('minFrases', 1, 8); inteiro('minNomes', 1, 8);
      var chavesOk = d.chaves === undefined || (Array.isArray(d.chaves) && d.chaves.length > 0 && d.chaves.every(function (g) {
        return Array.isArray(g) && g.length > 0 && g.every(function (k) { return v.textoOk(k) && palavras(k).length > 0; });
      }));
      v.checar(chavesOk, d.id + ': chaves = [[\'gato\', \'gata\'], …] (cada grupo com palavras)');
      if (d.modelo !== undefined) {
        v.checar(v.textoOk(d.modelo) && d.modelo.length <= MAX_TEXTO, d.id + ': modelo deve ser um texto (até ' + MAX_TEXTO + ' letras)');
        if (chavesOk && v.textoOk(d.modelo)) v.checar(avaliar(d, d.modelo).pontos === 1, d.id + ': o modelo não cumpre as regras (' + avaliar(d, d.modelo).dica + ')');
      }
      if (d.maiusculas !== undefined) v.checar(d.maiusculas === true, d.id + ': "maiusculas" só vale true');
      if (!d.minPalavras && !d.minFrases && !d.chaves) v.avisar(d.id + ': escrever sem regra (qualquer texto vale)');
    },
  });
  // para os testes de unidade
  _d.avaliarEscrever = avaliar;
})();
