/* Desafio digitar: completar escrevendo, como no livro (4º bimestre). Uma caixa por frase e uma fileira de acentos
   que acompanha a caixa com foco (logo depois da frase dela; escreve nessa caixa: desafios/campo-texto.js).
   { tipo: 'digitar', pergunta, frases: [{ antes, depois, certas: ['…'], img?, alt?, letra?, inicial? }], colado?, livre?, qualquerOrdem? }
   qualquerOrdem: [[0, 1], [2, 3]] — caixas que valem em qualquer ordem entre si (um par de rimas): cada caixa do grupo aceita
   as certas de qualquer caixa do grupo, sem repetir a mesma. inicial: 'maiuscula' | 'minuscula' — a resposta (também
   a livre) tem de começar com essa letra (nome próprio x comum). trocarGrupos: true — os grupos de qualquerOrdem do mesmo
   tamanho também valem trocados entre si (os dois pares de rimas em qualquer ordem). junto: true (na frase) — a caixa
   fica na mesma linha da frase anterior ("____ e ____").
   colado: a caixa fica dentro da palavra (PA + caixa + ARINHO); livre: questão pessoal, vale qualquer resposta.
   Certo = _d.digitadaCerta (sem diferença de maiúsculas, espaços e ponto final; o acento conta).
   valor: [texto por frase]. Pontuação: fração das frases certas. Contrato: docs/contratos/quarto-bimestre.md §12. */
(function () {
  var U = Reino.util, el = U.el, _d = Reino._desafios;
  var fracao = _d.fracao;
  var MAX_LETRAS = 40;

  function texto(v) { return v == null ? '' : String(v); }
  function frasesDe(d) { return Array.isArray(d.frases) ? d.frases : []; }
  function inicialOk(f, v) {
    var m = texto(v).match(/\p{L}/u);
    if (!f.inicial || !m) return true;
    return f.inicial === 'maiuscula' ? m[0] !== m[0].toLowerCase() : m[0] === m[0].toLowerCase();
  }
  function certaNa(d, f, v) { return (d.livre ? !!texto(v).trim() : _d.digitadaCerta(texto(v), f.certas)) && inicialOk(f, v); }
  // acerto de cada caixa; nas de um grupo, cada resposta casa com as certas de uma caixa do grupo ainda livre
  // as respostas das caixas g casam, cada uma, com as certas de uma caixa diferente de h? → [acerto de cada caixa de g]
  function casar(d, fr, v, g, h) {
    var usadas = [];
    return g.map(function (i) {
      var j = h.find(function (k) { return usadas.indexOf(k) < 0 && fr[k] && certaNa(d, fr[k], v[i]) && inicialOk(fr[i], v[i]); });
      if (j !== undefined) usadas.push(j);
      return j !== undefined;
    });
  }
  function acertos(d, valor) {
    var v = Array.isArray(valor) ? valor : [], fr = frasesDe(d);
    var ok = fr.map(function (f, i) { return certaNa(d, f, v[i]); });
    var grupos = Array.isArray(d.qualquerOrdem) ? d.qualquerOrdem : [], livres = grupos.slice();
    grupos.forEach(function (g) {
      // trocarGrupos: o grupo inteiro certo em algum grupo ainda livre do mesmo tamanho; senão, o próprio grupo
      var h = d.trocarGrupos && livres.find(function (x) { return x.length === g.length && casar(d, fr, v, g, x).every(Boolean); });
      if (h) livres.splice(livres.indexOf(h), 1);
      casar(d, fr, v, g, h || g).forEach(function (b, k) { ok[g[k]] = b; });
    });
    return ok;
  }
  var pontuar = function (d, valor) {
    var ok = acertos(d, valor);
    return fracao(ok.filter(Boolean).length, frasesDe(d).length);
  };

  // figura de js/arte/icones/ antes da frase (como no completar); desenho que falta: ❓
  function figura(f) {
    var desenho = PA.iconeDesenho(f.img);
    return el('span.digitar-img', { role: 'img', 'aria-label': f.alt ? U.semEn(f.alt) : null },
      desenho ? PA.paraDOM(desenho, PA.escalaNitida(64, desenho.width)) : '❓');
  }
  // colado: [texto antes da palavra, pedaço antes da caixa, pedaço depois, resto da frase] (como no completar)
  function partesColado(f) {
    var a = f.antes.match(/^([\s\S]*\s)?(\S*)$/), b = f.depois.match(/^(\S*)([\s\S]*)$/);
    return [a[1] || '', a[2], b[1], b[2]];
  }

  var montar = function (d, opts) {
    var ini = Array.isArray(opts.valorInicial) ? opts.valorInicial : [];
    var wrap = el('div.digitar' + (d.colado ? '.digitar-colado' : ''));
    var ultimo = null;
    var acentos = _d.fileiraAcentos(function () { return ultimo || campos[0].campo; });
    var campos = d.frases.map(function (f, i) {
      var c = _d.campoTexto({ valor: texto(ini[i]), semAcentos: true, max: MAX_LETRAS, rotulo: 'Resposta ' + (f.letra || i + 1),
        aoMudar: function () { if (_d.marcado(wrap)) wrap.__erroFim(); opts.onMudar(); } });
      // a caixa do tamanho da maior resposta (a fonte pixel tem 1ch por letra)
      // numa caixa de qualquerOrdem, a maior resposta do grupo (a largura não dá pista de qual palavra vai ali)
      var grupo = (Array.isArray(d.qualquerOrdem) ? d.qualquerOrdem : []).find(function (g) { return g.indexOf(i) >= 0; });
      var todas = d.trocarGrupos && grupo ? [].concat.apply([], d.qualquerOrdem) : grupo || [i];
      var letras = Math.max.apply(null, [].concat.apply([], todas.map(function (k) { return (d.frases[k].certas || []).map(function (t) { return String(t).length; }); })).concat(d.livre ? 12 : 3));
      c.campo.style.setProperty('--letras', String(Math.min(letras + 1, 24)));
      c.campo.addEventListener('focus', function () { ultimo = c.campo; });
      // palavra do livro em maiúsculas (PA__ARINHO): o que ela digita aparece em maiúsculas (a comparação não muda)
      if (maiusculas(d, f)) c.campo.dataset.maiusculas = 'sim';
      // Enter passa para a próxima caixa
      c.campo.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Enter') return;
        ev.preventDefault();
        if (campos[i + 1]) campos[i + 1].campo.focus();
      });
      var cola = d.colado && partesColado(f);
      var frase = d.colado
        ? el('div.digitar-frase', f.letra ? el('b', f.letra + ') ') : null, cola[0], el('span.digitar-palavra', cola[1], c.el, cola[2]), cola[3])
        : el('div.digitar-frase', f.letra ? el('b', f.letra + ') ') : null, f.antes ? f.antes + ' ' : '', c.el, /^[.,!?;:]/.test(f.depois) || !f.depois ? '' : ' ', f.depois);
      // junto: a caixa entra na linha da frase anterior
      var ant = f.junto && i > 0 && wrap.lastChild && wrap.lastChild.querySelector('.digitar-frase');
      if (ant) { while (frase.firstChild) ant.appendChild(frase.firstChild); return { c: c, item: wrap.lastChild }; }
      var item = wrap.appendChild(el('div.digitar-item' + (f.img ? '.com-img' : ''), f.img ? figura(f) : null, frase));
      return { c: c, item: item };
    }).map(function (x) {
      // a fileira de acentos acompanha a caixa com foco (logo depois da frase dela); começa depois da 1ª
      _d.acentosNoFoco(acentos, x.c.campo, x.item);
      return x.c;
    });
    wrap.insertBefore(acentos, wrap.children[1] || null);

    function valor() { return campos.map(function (c) { return c.valor(); }); }
    var ctrl = {
      el: wrap, valor: valor,
      pronto: function () { return !_d.marcado(wrap) && campos.every(function (c) { return !!c.valor().trim(); }); },
      conferir: function () {
        var v = valor();
        var ok = acertos(d, v), erradas = d.frases.map(function (f, i) { return ok[i] ? -1 : i; }).filter(function (i) { return i >= 0; });
        // só o acento está errado: a dica diz onde olhar
        var acento = !d.livre && erradas.length && erradas.every(function (i) {
          return d.frases[i].certas.some(function (c) { return _d.semAcento(c) === _d.semAcento(v[i]); });
        });
        return { ok: erradas.length === 0, erradas: erradas, dica: acento ? 'Dica: confira os acentos!' : null };
      },
      // a caixa errada fica marcada (ui.md §10.19.2) até ela mexer de novo; a palavra fica, para ela consertar
      marcarErro: function (res) {
        _d.erroParado(wrap, (res.erradas || []).map(function (i) { return campos[i].campo; }), opts.onMudar);
      },
      marcarCerto: function () {
        wrap.classList.add('tudo-certo');
        campos.forEach(function (c) { c.travar(true); });
        Array.prototype.forEach.call(acentos.querySelectorAll('button'), function (b) { b.disabled = true; });
      },
    };
    return ctrl;
  };

  // a palavra do livro está em maiúsculas? (colado: o pedaço em volta da caixa; solto: as respostas certas)
  function maiusculas(d, f) {
    var s = (d.colado ? f.antes.split(/\s/).pop() + f.depois.split(/\s/)[0] : (f.certas || []).join('')).replace(/[^\p{L}]/gu, '');
    return !!s && s === s.toUpperCase() && s !== s.toLowerCase();
  }
  function letra(f) { return f.letra ? f.letra + ') ' : ''; }
  // a palavra na frase (colado: a palavra inteira, como PASSARINHO; sem resposta: a lacuna)
  function palavra(d, f, t) {
    t = texto(t).trim();
    if (maiusculas(d, f)) t = t.toUpperCase();
    if (d.colado) return f.antes + (t || '_') + f.depois;
    return t || '______';
  }
  Reino.registrarTipoDesafio('digitar', {
    montar: montar, pontuar: pontuar, campos: ['livre', 'colado', 'qualquerOrdem', 'trocarGrupos'],
    exemplos: {
      desafio: { id: 'x', tipo: 'digitar', frases: [{ antes: 'O', depois: 'miou.', certas: ['gato', 'gatinho'] }, { antes: 'A', depois: 'é fria.', certas: ['água'] }] },
      certa: function (d) { return frasesDe(d).map(function (f) { return d.livre ? (f.inicial === 'minuscula' ? 'minha resposta' : 'Minha resposta') : f.certas[0]; }); },
      estranhos: [[], [''], ['agua', 'GATO'], [null, 7], ['gato'], ['  ', '.'], 'gato', {}],
    },
    textoCerto: function (d) {
      return frasesDe(d).map(function (f) {
        var outras = (f.certas || []).slice(1).map(function (t) { return palavra(d, f, t); });
        return letra(f) + palavra(d, f, (f.certas || [])[0]) + (outras.length ? ' (ou ' + outras.join(' ou ') + ')' : '');
      }).join(' • ');
    },
    textoResposta: function (d, valor) {
      var v = Array.isArray(valor) ? valor : [];
      return frasesDe(d).map(function (f, i) { return letra(f) + palavra(d, f, v[i]); }).join(' • ');
    },
    // naProva: figura que falta é erro (nas salas, só aviso: o jogo mostra ❓)
    validar: function (d, v) {
      if (d.qualquerOrdem !== undefined) v.checar(Array.isArray(d.qualquerOrdem) && d.qualquerOrdem.every(function (g) { return Array.isArray(g) && g.length > 1 && g.every(function (i) { return Number.isInteger(i) && i >= 0 && i < frasesDe(d).length; }); }), d.id + ': qualquerOrdem = [[0, 1], …] (índices de frases)');
      frasesDe(d).forEach(function (f, i) { if (f.inicial !== undefined) v.checar(f.inicial === 'maiuscula' || f.inicial === 'minuscula', d.id + ': frase ' + (i + 1) + ': inicial só vale maiuscula ou minuscula'); });
      v.checar(v.textoOk(d.pergunta), d.id + ': digitar sem pergunta');
      if (d.livre !== undefined) v.checar(d.livre === true, d.id + ': "livre" só vale true');
      if (d.colado !== undefined) v.checar(d.colado === true, d.id + ': "colado" só vale true');
      var temFrases = Array.isArray(d.frases) && d.frases.length > 0;
      v.checar(temFrases, d.id + ': digitar sem frases');
      if (!temFrases) return;
      d.frases.forEach(function (f, i) {
        var onde = d.id + ': frase ' + ((f && f.letra) || i + 1);
        if (!f || typeof f.antes !== 'string' || typeof f.depois !== 'string') { v.checar(false, onde + ': precisa de antes e depois (texto, pode ser vazio)'); return; }
        var certasOk = Array.isArray(f.certas) && f.certas.length > 0 && f.certas.every(v.textoOk);
        if (d.livre) v.checar(f.certas === undefined || certasOk, onde + ': certas deve ser uma lista de textos');
        else v.checar(certasOk, onde + ': sem certas (lista com a resposta escrita)');
        if (certasOk) v.checar(f.certas.every(function (c) { return String(c).length <= MAX_LETRAS; }), onde + ': resposta com mais de ' + MAX_LETRAS + ' letras');
        if (certasOk && d.colado) v.checar(f.certas.every(function (c) { return !/\s/.test(String(c).trim()); }), onde + ': colado com espaço na resposta');
        if (f.img === undefined) return;
        v.checar(v.textoOk(f.img) && v.textoOk(f.alt), onde + ': figura precisa de img e alt');
        if (v.textoOk(f.img) && !v.icones[f.img]) {
          if (v.naProva) v.checar(false, onde + ': falta o desenho "' + f.img + '" em js/arte/icones/');
          else v.avisar(onde + ': falta o desenho "' + f.img + '" em js/arte/icones/ (aparece ❓)');
        }
      });
    },
  });
})();
