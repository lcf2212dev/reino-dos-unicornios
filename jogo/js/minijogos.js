/* Desafios (cada tipo de minijogo) e o fluxo de uma missão (sala). */
(function () {
  var U = Reino.util, el = U.el;
  var D = {};
  var CORES_LIGAR = ['#ff7eb6', '#7c5cff', '#39c5bb', '#ffb020', '#5fb4ff'];

  D.TREINAVEIS = ['escolha', 'vf', 'varias'];

  function botaoOpcao(o, extra) {
    return el('button.opcao' + (extra || ''), { type: 'button' },
      o.e ? el('span.opcao-emoji', { 'aria-hidden': 'true' }, o.e) : null,
      el('span.opcao-texto', o.t));
  }

  D.enunciado = function (d) {
    if (d.tipo === 'vf') return 'Verdadeiro ou falso? ' + d.afirmacao;
    return d.pergunta;
  };
  D.textoParaFala = function (d) {
    var t = D.enunciado(d);
    if (d.tipo === 'escolha' || d.tipo === 'varias') t += '. ' + d.opcoes.map(function (o) { return o.t; }).join('. ');
    return t;
  };
  // tamanho do texto para o detector de pressa
  D.tamanhoLeitura = function (d) {
    var t = D.enunciado(d);
    if (d.opcoes) t += d.opcoes.map(function (o) { return o.t; }).join(' ');
    if (d.instrucao) t += ' ' + d.instrucao;
    return t.length;
  };

  /* ---------- tipos ---------- */
  var TIPOS = {};

  // escolha única (também serve para "completar a frase")
  TIPOS.escolha = function (d, opts) {
    var ordem = opts.ordem || U.embaralhar(d.opcoes.map(function (_, i) { return i; }));
    var sel = opts.valorInicial != null ? opts.valorInicial : null;
    var bloqueadas = {};
    var lista = el('div.opcoes' + (d.opcoes.length === 2 ? '.opcoes-duas' : ''));
    var botoes = {};
    ordem.forEach(function (i) {
      var b = botaoOpcao(d.opcoes[i]);
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
  };

  TIPOS.vf = function (d, opts) {
    var d2 = { opcoes: [{ e: '👍', t: 'Verdadeiro' }, { e: '👎', t: 'Falso' }], certa: d.certo ? 0 : 1 };
    var c = TIPOS.escolha(d2, Object.assign({}, opts, { ordem: [0, 1] }));
    c.el.classList.add('opcoes-vf');
    return c;
  };

  TIPOS.varias = function (d, opts) {
    var ordem = opts.ordem || U.embaralhar(d.opcoes.map(function (_, i) { return i; }));
    var sel = {};
    (opts.valorInicial || []).forEach(function (i) { sel[i] = true; });
    var bloq = {};
    var lista = el('div.opcoes.opcoes-varias');
    var botoes = {};
    ordem.forEach(function (i) {
      var b = botaoOpcao(d.opcoes[i], '.opcao-marcar');
      b.addEventListener('click', function () {
        if (bloq[i] || ctrl.travado) return;
        sel[i] = !sel[i]; Reino.Som.tocar(sel[i] ? 'selecionar' : 'toque'); pintar(); opts.onMudar();
      });
      botoes[i] = b; lista.appendChild(b);
    });
    function pintar() { Object.keys(botoes).forEach(function (k) { botoes[k].setAttribute('aria-pressed', String(!!sel[k])); }); }
    pintar();
    function valor() { return Object.keys(sel).filter(function (k) { return sel[k]; }).map(Number).sort(function (a, b) { return a - b; }); }
    var ctrl = {
      el: lista, ordem: ordem, valor: valor,
      pronto: function () { return valor().length > 0; },
      conferir: function () {
        // livre: questão pessoal, qualquer escolha vale
        if (d.livre) return { ok: valor().length > 0, erradas: [], faltam: 0 };
        var certos = d.opcoes.map(function (o, i) { return o.ok ? i : -1; }).filter(function (i) { return i >= 0; });
        var v = valor();
        var erradas = v.filter(function (i) { return !d.opcoes[i].ok; });
        var faltam = certos.filter(function (i) { return !sel[i]; }).length;
        return { ok: erradas.length === 0 && faltam === 0, erradas: erradas, faltam: faltam };
      },
      marcarErro: function (res) {
        (res.erradas || []).forEach(function (i) { sel[i] = false; bloq[i] = true; botoes[i].classList.add('errada'); botoes[i].disabled = true; });
        pintar();
      },
      marcarCerto: function () { d.opcoes.forEach(function (o, i) { if (d.livre ? sel[i] : o.ok) botoes[i].classList.add('certa'); }); },
      revelar: function () {
        if (d.livre) { ctrl.marcarCerto(); return; }
        d.opcoes.forEach(function (o, i) {
          if (o.ok) botoes[i].classList.add('certa');
          else if (sel[i]) botoes[i].classList.add('errada');
        });
      },
    };
    return ctrl;
  };

  TIPOS.ligar = function (d, opts) {
    var n = d.pares.length;
    // d.direita: ordem fixa da coluna da direita (como na folha da prova)
    var direita = d.direita ? d.direita.slice() : U.embaralhar(d.pares.map(function (_, i) { return i; }));
    var liga = opts.valorInicial ? U.copia(opts.valorInicial) : {}; // esquerda -> direita
    var escolhida = null;
    var wrap = el('div.ligar');
    var colE = el('div.ligar-col'), colD = el('div.ligar-col');
    var bE = [], bD = {};
    d.pares.forEach(function (p, i) {
      // p[0].img: desenho de js/icones.js no lugar do texto (o nome não aparece, senão entrega a resposta).
      // Qualquer chave de ICONES serve (ex.: 'doc:rg', 'acao:escovar', 'sentimento:bored'): os desenhos
      // novos são registrados em js/icones.js (window.ICONES['acao:escovar'] = ...), e PA.iconeDesenho os acha.
      // desenho ainda não feito: mostra ❓ em vez de quebrar a questão
      var desenhoImg = p[0].img && PA.iconeDesenho(p[0].img);
      var conteudo = p[0].img
        ? el('span.ligar-img', desenhoImg ? PA.paraDOM(desenhoImg, PA.escalaNitida(desenhoImg.width > 16 ? 96 : 64, desenhoImg.width)) : '❓')
        : [p[0].e ? el('span.opcao-emoji', p[0].e) : null, el('span', p[0].t)];
      var b = el('button.ligar-item.ligar-esq' + (p[0].img ? '.com-img' : ''), { type: 'button', 'aria-label': p[0].img ? U.semEn(p[0].alt) : null }, el('span.ligar-marca'), conteudo);
      b.addEventListener('click', function () {
        if (ctrl.travado) return;
        // tocar num item da esquerda sempre o escolhe (e desfaz o par antigo dele)
        if (liga[i] !== undefined) { delete liga[i]; }
        escolhida = i;
        Reino.Som.tocar('selecionar'); pintar(); opts.onMudar();
      });
      bE.push(b); colE.appendChild(b);
    });
    direita.forEach(function (j) {
      var p = d.pares[j];
      var b = el('button.ligar-item.ligar-dir', { type: 'button' }, el('span.ligar-marca'), el('span', p[1].t));
      b.addEventListener('click', function () {
        if (ctrl.travado) return;
        var dono = Object.keys(liga).find(function (k) { return liga[k] === j; });
        if (escolhida === null) {
          if (dono !== undefined) { delete liga[dono]; Reino.Som.tocar('toque'); pintar(); opts.onMudar(); }
          else { avisar(); }
          return;
        }
        if (dono !== undefined) delete liga[dono];
        liga[escolhida] = j;
        // próxima da esquerda ainda sem par
        var prox = null;
        for (var k = 0; k < n; k++) if (liga[k] === undefined) { prox = k; break; }
        escolhida = prox;
        Reino.Som.tocar('selecionar'); pintar(); opts.onMudar();
      });
      bD[j] = b; colD.appendChild(b);
    });
    var dica = el('p.dica-toque', 'Toque em um item da esquerda e depois no par dele na direita.');
    function avisar() { dica.classList.remove('pisca'); void dica.offsetWidth; dica.classList.add('pisca'); }
    wrap.appendChild(dica);
    wrap.appendChild(el('div.ligar-colunas', colE, colD));
    function pintar() {
      bE.forEach(function (b, i) {
        var cor = CORES_LIGAR[i % CORES_LIGAR.length];
        var ligado = liga[i] !== undefined;
        b.classList.toggle('escolhida', escolhida === i);
        b.classList.toggle('ligado', ligado);
        b.style.setProperty('--cor-par', ligado || escolhida === i ? cor : 'transparent');
        b.querySelector('.ligar-marca').textContent = ligado || escolhida === i ? String(i + 1) : '';
      });
      Object.keys(bD).forEach(function (j) {
        var dono = Object.keys(liga).find(function (k) { return liga[k] === +j; });
        var b = bD[j];
        b.classList.toggle('ligado', dono !== undefined);
        b.style.setProperty('--cor-par', dono !== undefined ? CORES_LIGAR[dono % CORES_LIGAR.length] : 'transparent');
        b.querySelector('.ligar-marca').textContent = dono !== undefined ? String(+dono + 1) : '';
      });
    }
    for (var k0 = 0; k0 < n; k0++) if (liga[k0] === undefined) { escolhida = k0; break; }
    pintar();
    var ctrl = {
      el: wrap, ordem: direita,
      valor: function () { return U.copia(liga); },
      pronto: function () { return Object.keys(liga).length === n; },
      conferir: function () {
        var erradas = Object.keys(liga).filter(function (k) { return liga[k] !== +k; }).map(Number);
        return { ok: erradas.length === 0 && Object.keys(liga).length === n, erradas: erradas };
      },
      marcarErro: function (res) {
        (res.erradas || []).forEach(function (k) {
          bD[liga[k]].classList.add('treme'); bE[k].classList.add('treme');
          setTimeout(function () { bD[liga[k]] && bD[liga[k]].classList.remove('treme'); bE[k].classList.remove('treme'); }, 600);
        });
        setTimeout(function () {
          (res.erradas || []).forEach(function (k) { delete liga[k]; });
          escolhida = (res.erradas || [])[0] != null ? res.erradas[0] : null;
          pintar(); opts.onMudar();
        }, 450);
      },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  };

  // ordenar e montar frase: tocar para colocar na sequência
  function sequencia(d, opts, estilo) {
    var itens = d.itens || d.blocos;
    var n = itens.length;
    var seq = opts.valorInicial ? opts.valorInicial.slice() : [];
    // opts.monte: mesma ordem embaralhada ao voltar numa questão da prova
    var monte = opts.monte ? opts.monte.slice() : U.embaralhar(itens.map(function (_, i) { return i; }));
    while (!opts.monte && n > 2 && monte.every(function (v, i) { return v === i; })) monte = U.embaralhar(monte);
    var wrap = el('div.sequencia.seq-' + estilo);
    var alvo = el(estilo === 'frase' ? 'div.seq-alvo.frase-linha' : 'ol.seq-alvo');
    var pool = el('div.seq-monte');
    function pintar() {
      alvo.innerHTML = '';
      pool.innerHTML = '';
      seq.forEach(function (i, pos) {
        var b = el('button.seq-item.no-alvo', { type: 'button' },
          estilo === 'frase' ? null : el('span.seq-num', String(pos + 1)), el('span', itens[i]));
        b.addEventListener('click', function () {
          if (ctrl.travado) return;
          seq.splice(pos, 1); Reino.Som.tocar('toque'); pintar(); opts.onMudar();
        });
        alvo.appendChild(estilo === 'frase' ? b : el('li', b));
      });
      for (var k = seq.length; k < n && estilo !== 'frase'; k++) alvo.appendChild(el('li.seq-vaga', el('span.seq-num', String(k + 1)), el('span', '...')));
      if (estilo === 'frase' && !seq.length) alvo.appendChild(el('span.frase-vazia', 'Toque nos blocos abaixo para montar a frase'));
      monte.filter(function (i) { return seq.indexOf(i) < 0; }).forEach(function (i) {
        var b = el('button.seq-item', { type: 'button' }, itens[i]);
        b.addEventListener('click', function () {
          if (ctrl.travado) return;
          seq.push(i); Reino.Som.tocar('selecionar'); pintar(); opts.onMudar();
        });
        pool.appendChild(b);
      });
    }
    if (estilo === 'frase') {
      wrap.appendChild(alvo);
      // com instrucao (linha logo abaixo da pergunta), a dica de toque não se repete
      if (!d.instrucao) wrap.appendChild(el('p.dica-toque', 'Toque num bloco para colocar. Toque de novo para tirar.'));
      wrap.appendChild(pool);
    } else {
      // no ordenar, as opções ficam em cima para caberem na tela do celular
      if (!d.instrucao) wrap.appendChild(el('p.dica-toque', 'Toque nas etapas na ordem certa. Errou? Toque no item da lista para tirar.'));
      wrap.appendChild(pool);
      wrap.appendChild(alvo);
    }
    pintar();
    var ctrl = {
      el: wrap, ordem: monte,
      valor: function () { return seq.slice(); },
      pronto: function () { return seq.length === n; },
      conferir: function () {
        var prim = -1;
        for (var i = 0; i < n; i++) if (seq[i] !== i) { prim = i; break; }
        return { ok: prim < 0, primeiroErrado: prim };
      },
      marcarErro: function (res) {
        wrap.classList.add('treme');
        setTimeout(function () {
          wrap.classList.remove('treme');
          seq = seq.slice(0, Math.max(0, res.primeiroErrado));
          pintar(); opts.onMudar();
        }, 500);
      },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  }
  TIPOS.ordenar = function (d, opts) { return sequencia(d, opts, 'ordem'); };
  TIPOS.frase = function (d, opts) { return sequencia(d, opts, 'frase'); };

  TIPOS.separar = function (d, opts) {
    var grupo = {}; // item -> 0/1
    var escolhido = null;
    var ordem = U.embaralhar(d.itens.map(function (_, i) { return i; }));
    var wrap = el('div.separar');
    var pool = el('div.separar-monte');
    var baus = d.grupos.map(function (g, gi) {
      var caixa = el('div.bau-itens');
      var b = el('button.bau', { type: 'button' },
        el('span.bau-titulo', el('span.bau-emoji', g.e), el('b', g.t)),
        el('span.bau-dica', g.dica),
        caixa);
      b.addEventListener('click', function (ev) {
        if (ctrl.travado) return;
        if (ev.target.closest('.sep-item')) return;
        if (escolhido === null) { avisar(); return; }
        grupo[escolhido] = gi;
        var prox = ordem.find(function (i) { return grupo[i] === undefined; });
        escolhido = prox === undefined ? null : prox;
        Reino.Som.tocar('selecionar'); pintar(); opts.onMudar();
      });
      return { el: b, caixa: caixa };
    });
    var dica = el('p.dica-toque', 'Toque em um item e depois no baú certo.');
    function avisar() { dica.classList.remove('pisca'); void dica.offsetWidth; dica.classList.add('pisca'); }
    function pintar() {
      pool.innerHTML = '';
      baus.forEach(function (b) { b.caixa.innerHTML = ''; });
      ordem.forEach(function (i) {
        var it = d.itens[i];
        var b = el('button.sep-item', { type: 'button' }, el('span.opcao-emoji', it.e), el('span', it.t));
        if (escolhido === i) b.classList.add('escolhido');
        b.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (ctrl.travado) return;
          // tocar num item sempre o escolhe; se estava num baú, ele volta para o monte
          if (grupo[i] !== undefined) delete grupo[i];
          escolhido = i;
          Reino.Som.tocar('toque'); pintar(); opts.onMudar();
        });
        if (grupo[i] === undefined) pool.appendChild(b); else baus[grupo[i]].caixa.appendChild(b);
      });
      if (!pool.children.length) pool.appendChild(el('span.frase-vazia', 'Tudo separado! Agora é só conferir.'));
      wrap.classList.toggle('com-escolha', escolhido !== null);
    }
    wrap.appendChild(dica);
    wrap.appendChild(pool);
    wrap.appendChild(el('div.baus', baus.map(function (b) { return b.el; })));
    escolhido = ordem[0];
    pintar();
    var ctrl = {
      el: wrap,
      valor: function () { return U.copia(grupo); },
      pronto: function () { return Object.keys(grupo).length === d.itens.length; },
      conferir: function () {
        var erradas = Object.keys(grupo).map(Number).filter(function (i) { return grupo[i] !== d.itens[i].g; });
        return { ok: erradas.length === 0, erradas: erradas };
      },
      marcarErro: function (res) {
        wrap.classList.add('treme');
        setTimeout(function () {
          wrap.classList.remove('treme');
          (res.erradas || []).forEach(function (i) { delete grupo[i]; });
          escolhido = (res.erradas || [])[0] != null ? res.erradas[0] : null;
          pintar(); opts.onMudar();
        }, 500);
      },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  };

  // rótulos dos botões do vfLista: d.rotulos (ex.: ['T', 'F'], ['√', 'X']); sem rotulos, V/F
  var NOME_ROTULO = { T: 'True', '√': 'Certo', X: 'Errado' };
  function rotulosVF(d) { return d.rotulos || ['V', 'F']; }
  function nomeRotulo(d, v) {
    var r = rotulosVF(d)[v];
    if (!d.rotulos) return v ? 'Falso' : 'Verdadeiro';
    if (r === 'F') return rotulosVF(d)[0] === 'T' ? 'False' : 'Falso';
    return NOME_ROTULO[r] || r;
  }

  // várias afirmações, cada uma com ( V ) e ( F ) — valor: [0 = V, 1 = F, null]
  TIPOS.vfLista = function (d, opts) {
    var marcas = opts.valorInicial ? opts.valorInicial.slice() : d.itens.map(function () { return null; });
    var lista = el('div.vf-lista');
    var linhas = d.itens.map(function (it, i) {
      var rot = rotulosVF(d);
      var bV = el('button.vf-botao', { type: 'button', 'aria-label': nomeRotulo(d, 0) }, el('span.vf-rotulo', rot[0]));
      var bF = el('button.vf-botao', { type: 'button', 'aria-label': nomeRotulo(d, 1) }, el('span.vf-rotulo', rot[1]));
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
      pronto: function () { return marcas.every(function (m) { return m !== null; }); },
      conferir: function () {
        var erradas = marcas.map(function (m, i) { return m === certo(i) ? -1 : i; }).filter(function (i) { return i >= 0; });
        return { ok: erradas.length === 0, erradas: erradas };
      },
      marcarErro: function (res) {
        (res.erradas || []).forEach(function (i) { marcas[i] = null; linhas[i].linha.classList.add('treme'); setTimeout(function () { linhas[i].linha.classList.remove('treme'); }, 600); });
        pintar(); opts.onMudar();
      },
      marcarCerto: function () { lista.classList.add('tudo-certo'); },
    };
    return ctrl;
  };

  // completar: a palavra j vale na frase f? (a certa ou uma das aceitas)
  function completarAceita(f, j) { return j === f.certa || (f.aceitas || []).indexOf(j) >= 0; }
  // figura de js/icones.js (32×32) para uma frase do completar; desenho que falta: ❓
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

  /* ---------- copiar: escolher a escrita certa entre duas e copiar com peças de letras ----------
     { tipo: 'copiar', pergunta, itens: [{ letra: 'a', opcoes: ['PASEIO', 'PASSEIO'], certa: 1 }, …] }
     valor: [{ escolha: índice da escrita marcada ou null, letras: [índices das peças, na ordem da resposta] }]
     peças de um item: D.pecasCopiar(item), as letras das duas escritas sem repetir as comuns além do necessário
     (PASEIO + PASSEIO = P A S E I O S); a ordem na tela é embaralhada (opts.monte[i] na prova, para ficar igual ao voltar). */
  function letrasDe(t) { return Array.from(String(t).replace(/\s+/g, '')); }
  D.pecasCopiar = function (it) {
    var pecas = [], tem = {};
    it.opcoes.forEach(function (o) {
      var aqui = {};
      letrasDe(o).forEach(function (ch) {
        aqui[ch] = (aqui[ch] || 0) + 1;
        if (aqui[ch] > (tem[ch] || 0)) { pecas.push(ch); tem[ch] = aqui[ch]; }
      });
    });
    return pecas;
  };
  // ordem embaralhada das peças (nunca soletrando uma das escritas logo de cara)
  D.ordemPecasCopiar = function (it) {
    var pecas = D.pecasCopiar(it);
    var idx = pecas.map(function (_, i) { return i; });
    var palavras = it.opcoes.map(function (o) { return letrasDe(o).join(''); });
    function entrega(m) { var s = m.map(function (i) { return pecas[i]; }).join(''); return palavras.some(function (p) { return s.indexOf(p) === 0; }); }
    var m = U.embaralhar(idx), tentativas = 0;
    while (pecas.length > 2 && entrega(m) && tentativas++ < 20) m = U.embaralhar(idx);
    return m;
  };
  function copiaCerta(it, v) {
    if (!v || !v.letras) return false;
    var pecas = D.pecasCopiar(it);
    return v.letras.map(function (i) { return pecas[i]; }).join('') === letrasDe(it.opcoes[it.certa]).join('');
  }
  function textoCopia(it, v) { var pecas = D.pecasCopiar(it); return ((v && v.letras) || []).map(function (i) { return pecas[i]; }).join(''); }

  TIPOS.copiar = function (d, opts) {
    var valores = d.itens.map(function (it, i) {
      var v = opts.valorInicial && opts.valorInicial[i];
      return { escolha: v && v.escolha != null ? v.escolha : null, letras: v && v.letras ? v.letras.slice() : [] };
    });
    var monte = opts.monte && opts.monte.length === d.itens.length ? opts.monte : d.itens.map(function (it) { return D.ordemPecasCopiar(it); });
    var wrap = el('div.copiar');
    // com instrucao (linha logo abaixo da pergunta), a dica de toque não se repete
    if (!d.instrucao) wrap.appendChild(el('p.dica-toque', 'Marque a escrita certa e monte a palavra com as letras. Para tirar uma letra, toque nela.'));
    var itens = d.itens.map(function (it, i) {
      var pecas = D.pecasCopiar(it);
      var botoesOpc = it.opcoes.map(function (o, j) {
        var b = el('button.copiar-opcao', { type: 'button' }, el('span.copiar-marca', { 'aria-hidden': 'true' }), el('span.copiar-palavra', o));
        b.addEventListener('click', function () {
          if (ctrl.travado) return;
          var v = valores[i];
          v.escolha = v.escolha === j ? null : j;
          // trocou para uma escrita mais curta: as letras que sobram voltam para o monte
          if (v.escolha !== null) v.letras = v.letras.slice(0, letrasDe(it.opcoes[v.escolha]).length);
          Reino.Som.tocar(v.escolha === null ? 'toque' : 'selecionar'); pintar(i); opts.onMudar();
        });
        return b;
      });
      var linha = el('div.copiar-linha');
      var botoesPeca = {};
      var pool = el('div.copiar-pecas', monte[i].map(function (k) {
        var b = el('button.copiar-peca', { type: 'button' }, pecas[k]);
        b.addEventListener('click', function () {
          if (ctrl.travado) return;
          var v = valores[i];
          if (v.letras.indexOf(k) >= 0) return;
          var max = v.escolha !== null ? letrasDe(it.opcoes[v.escolha]).length : pecas.length;
          if (v.letras.length >= max) { avisar(linha); return; }
          v.letras.push(k);
          Reino.Som.tocar('selecionar'); pintar(i); opts.onMudar();
          // teclado: o foco segue para a próxima peça livre
          if (document.activeElement === b || document.activeElement === document.body) focarPeca(i, monte[i].indexOf(k));
        });
        botoesPeca[k] = b;
        return b;
      }));
      var caixa = el('div.copiar-item',
        el('div.copiar-escolha', it.letra ? el('b.copiar-letra', it.letra + ')') : null, botoesOpc),
        el('div.copiar-resposta', el('span.copiar-rotulo', 'Resposta:'), linha),
        pool);
      wrap.appendChild(caixa);
      return { caixa: caixa, botoesOpc: botoesOpc, linha: linha, botoesPeca: botoesPeca, pecas: pecas };
    });
    function avisar(no) { no.classList.remove('pisca'); void no.offsetWidth; no.classList.add('pisca'); }
    function focarPeca(i, desde) {
      var ordem = monte[i], n = ordem.length;
      for (var s = 1; s <= n; s++) {
        var b = itens[i].botoesPeca[ordem[(desde + s) % n]];
        if (!b.disabled) { b.focus({ preventScroll: true }); return; }
      }
      var ultima = itens[i].linha.lastElementChild;
      if (ultima && ultima.tagName === 'BUTTON') ultima.focus({ preventScroll: true });
    }
    function pintar(i) {
      var it = d.itens[i], v = valores[i], x = itens[i];
      x.botoesOpc.forEach(function (b, j) {
        b.setAttribute('aria-pressed', String(v.escolha === j));
        U.preencher(b.querySelector('.copiar-marca'), v.escolha === j ? 'X' : '');
      });
      x.linha.innerHTML = '';
      v.letras.forEach(function (k, pos) {
        var b = el('button.copiar-peca.colocada', { type: 'button', 'aria-label': 'Tirar a letra ' + x.pecas[k] }, x.pecas[k]);
        b.addEventListener('click', function () {
          if (ctrl.travado) return;
          v.letras.splice(pos, 1);
          Reino.Som.tocar('toque'); pintar(i); opts.onMudar();
          var bs = x.linha.querySelectorAll('button');
          if (bs.length) bs[Math.min(pos, bs.length - 1)].focus({ preventScroll: true });
          else x.botoesPeca[k].focus({ preventScroll: true });
        });
        x.linha.appendChild(b);
      });
      // vagas: quantas letras faltam para a escrita marcada
      var total = v.escolha !== null ? letrasDe(it.opcoes[v.escolha]).length : 0;
      for (var s = v.letras.length; s < total; s++) x.linha.appendChild(el('span.copiar-vaga', { 'aria-hidden': 'true' }));
      if (!v.letras.length && v.escolha === null) x.linha.appendChild(el('span.copiar-vazia', 'Marque a escrita certa e toque nas letras'));
      Object.keys(x.botoesPeca).forEach(function (k) {
        var usada = v.letras.indexOf(+k) >= 0;
        x.botoesPeca[k].disabled = usada;
        x.botoesPeca[k].classList.toggle('usada', usada);
      });
      x.caixa.classList.toggle('pronto', itemPronto(i));
    }
    function itemPronto(i) {
      var v = valores[i];
      return v.escolha !== null && v.letras.length === letrasDe(d.itens[i].opcoes[v.escolha]).length;
    }
    d.itens.forEach(function (_, i) { pintar(i); });
    var ctrl = {
      el: wrap, monte: monte,
      valor: function () { return valores.map(function (v) { return { escolha: v.escolha, letras: v.letras.slice() }; }); },
      pronto: function () { return d.itens.every(function (_, i) { return itemPronto(i); }); },
      conferir: function () {
        var erradas = d.itens.map(function (it, i) {
          return valores[i].escolha === it.certa && copiaCerta(it, valores[i]) ? -1 : i;
        }).filter(function (i) { return i >= 0; });
        return { ok: erradas.length === 0, erradas: erradas };
      },
      // desfaz só a parte errada de cada item (a escolha e/ou a cópia)
      marcarErro: function (res) {
        (res.erradas || []).forEach(function (i) {
          var it = d.itens[i], v = valores[i];
          if (v.escolha !== it.certa) v.escolha = null;
          if (!copiaCerta(it, v)) v.letras = [];
          itens[i].caixa.classList.add('treme');
          setTimeout(function () { itens[i].caixa.classList.remove('treme'); }, 600);
          pintar(i);
        });
        opts.onMudar();
      },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  };

  TIPOS.memoria = function (d, opts) {
    var cartas = [];
    d.pares.forEach(function (p, i) { cartas.push({ par: i, face: p[0], emoji: true }); cartas.push({ par: i, face: p[1] }); });
    cartas = U.embaralhar(cartas);
    var abertas = [], achados = {}, travar = false, completo = false;
    var grade = el('div.memoria');
    var botoes = cartas.map(function (c, idx) {
      var b = el('button.carta-mem', { type: 'button', 'aria-label': 'Carta virada' },
        el('span.mem-verso', '🦄'), el('span.mem-face' + (c.emoji ? '.mem-emoji' : ''), c.face));
      b.addEventListener('click', function () {
        if (travar || achados[c.par] || abertas.indexOf(idx) >= 0) return;
        abertas.push(idx); b.classList.add('virada'); b.setAttribute('aria-label', U.semEn(c.face));
        Reino.Som.tocar('toque');
        if (abertas.length === 2) {
          var a = cartas[abertas[0]], z = cartas[abertas[1]];
          if (a.par === z.par) {
            achados[a.par] = true;
            abertas.forEach(function (i) { botoes[i].classList.add('achada'); });
            abertas = [];
            Reino.Som.tocar('estrela');
            if (Object.keys(achados).length === d.pares.length) { completo = true; opts.onMudar(); if (opts.onCompleto) setTimeout(opts.onCompleto, 500); }
          } else {
            travar = true;
            setTimeout(function () {
              abertas.forEach(function (i) { botoes[i].classList.remove('virada'); botoes[i].setAttribute('aria-label', 'Carta virada'); });
              abertas = []; travar = false;
            }, 950);
          }
        }
      });
      grade.appendChild(b);
      return b;
    });
    return {
      el: grade, semConferir: true,
      valor: function () { return completo; },
      pronto: function () { return completo; },
      conferir: function () { return { ok: completo }; },
      marcarErro: function () {},
      marcarCerto: function () {},
    };
  };

  /* ---------- desenho: prancheta de pixel art ----------
     { tipo: 'desenho', pergunta, requisitos: ['linhas', 'formas', 'cores'] }
     valor: { px: 'string de 24x24 dígitos (0 = vazio, 1-8 = cor)', usou: { linhas, formas, cores: [índices] } }
     Vale 1 só quando todos os requisitos foram cumpridos. */
  var GRADE = 24;
  var CORES_DESENHO = [
    ['#3a2446', 'Preto'], ['#ff4d6d', 'Vermelho'], ['#ffa133', 'Laranja'], ['#ffd93d', 'Amarelo'],
    ['#4cc26b', 'Verde'], ['#4d8dff', 'Azul'], ['#9b5cff', 'Roxo'], ['#ff8fc8', 'Rosa'],
  ];
  var NOME_REQUISITO = { linhas: 'linhas', formas: 'formas', cores: 'cores' };

  function requisitoOk(r, usou) {
    usou = usou || {};
    if (r === 'linhas') return !!usou.linhas;
    if (r === 'formas') return !!usou.formas;
    if (r === 'cores') return (usou.cores || []).length >= 2;
    return false;
  }
  D.desenhoFaltam = function (d, valor) {
    return (d.requisitos || []).filter(function (r) { return !requisitoOk(r, valor && valor.usou); }).map(function (r) { return NOME_REQUISITO[r] || r; });
  };
  D.desenhoCumpriu = function (d, valor) { return !!(valor && valor.px) && D.desenhoFaltam(d, valor).length === 0; };

  // riscos na grade (todos devolvem uma lista de [x, y])
  function riscoLinha(x0, y0, x1, y1) {
    var pts = [], dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
    for (;;) {
      pts.push([x0, y0]);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return pts;
  }
  // caixa quadrada a partir do arraste (um toque só faz uma forma de tamanho médio)
  function caixa(x0, y0, x1, y1) {
    var lado = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    if (lado < 2) { lado = 6; x0 -= 3; y0 -= 3; x1 = x0 + 1; y1 = y0 + 1; }
    var sx = x1 < x0 ? -1 : 1, sy = y1 < y0 ? -1 : 1;
    var xa = x0, xb = x0 + sx * lado, ya = y0, yb = y0 + sy * lado;
    return { x: Math.min(xa, xb), y: Math.min(ya, yb), l: lado };
  }
  function riscoForma(forma, x0, y0, x1, y1) {
    var c = caixa(x0, y0, x1, y1), x = c.x, y = c.y, l = c.l, pts = [];
    function seg(a, b, cc, dd) { pts = pts.concat(riscoLinha(a, b, cc, dd)); }
    if (forma === 'quadrado') { seg(x, y, x + l, y); seg(x + l, y, x + l, y + l); seg(x + l, y + l, x, y + l); seg(x, y + l, x, y); }
    else if (forma === 'triangulo') { var m = x + Math.round(l / 2); seg(x, y + l, x + l, y + l); seg(x + l, y + l, m, y); seg(m, y, x, y + l); }
    else {
      var r = l / 2, cx = x + r, cy = y + r, ant = null, passos = Math.max(16, Math.round(l * 4));
      for (var i = 0; i <= passos; i++) {
        var a = (i / passos) * Math.PI * 2;
        var p = [Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r)];
        if (ant) seg(ant[0], ant[1], p[0], p[1]);
        ant = p;
      }
    }
    return pts;
  }

  // desenha a grade num canvas (tam = pixels por quadradinho)
  function pintarGrade(canvas, px, tam, comLinhas) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < GRADE * GRADE; i++) {
      var c = +px[i];
      if (!c) continue;
      ctx.fillStyle = CORES_DESENHO[c - 1][0];
      ctx.fillRect((i % GRADE) * tam, Math.floor(i / GRADE) * tam, tam, tam);
    }
    if (comLinhas) {
      ctx.fillStyle = 'rgba(58, 36, 70, 0.08)';
      for (var k = 1; k < GRADE; k++) { ctx.fillRect(k * tam, 0, 1, canvas.height); ctx.fillRect(0, k * tam, canvas.width, 1); }
    }
  }

  // miniatura do desenho salvo (para a correção)
  D.miniaturaDesenho = function (valor, tam) {
    if (!valor || !valor.px) return null;
    tam = tam || 4;
    var c = document.createElement('canvas');
    c.width = c.height = GRADE * tam;
    c.className = 'pixel desenho-mini';
    pintarGrade(c, valor.px, tam, false);
    return c;
  };

  // ícone pequeno de forma (desenhado com o mesmo risco da prancheta)
  function iconeForma(forma) {
    var c = document.createElement('canvas'), n = 12;
    c.width = c.height = n;
    c.className = 'pixel desenho-icone-forma';
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#3a2446';
    riscoForma(forma, 1, 1, 10, 10).forEach(function (p) { if (p[0] >= 0 && p[0] < n && p[1] >= 0 && p[1] < n) ctx.fillRect(p[0], p[1], 1, 1); });
    return c;
  }

  TIPOS.desenho = function (d, opts) {
    var ini = opts.valorInicial || {};
    var px = (ini.px && ini.px.length === GRADE * GRADE ? ini.px : new Array(GRADE * GRADE + 1).join('0')).split('');
    var usou = { linhas: !!(ini.usou && ini.usou.linhas), formas: !!(ini.usou && ini.usou.formas), cores: ((ini.usou && ini.usou.cores) || []).slice() };
    var ferramenta = 'lapis', cor = 1;
    var TAM = 12;
    var canvas = el('canvas.desenho-tela', { width: GRADE * TAM, height: GRADE * TAM, 'aria-label': 'Prancheta de desenho' });
    var wrap = el('div.desenho');

    var FERRAMENTAS = [
      ['lapis', 'Lápis', '✏'], ['linha', 'Linha', '📏'],
      ['circulo', 'Círculo', null], ['quadrado', 'Quadrado', null], ['triangulo', 'Triângulo', null],
      ['borracha', 'Borracha', '🧹'],
    ];
    var botoesFerr = {};
    var barraFerr = el('div.desenho-ferramentas', FERRAMENTAS.map(function (f) {
      var b = el('button.desenho-ferr', { type: 'button', 'aria-label': f[1], title: f[1] },
        f[2] ? f[2] : iconeForma(f[0]), el('small', f[1]));
      b.addEventListener('click', function () { if (ctrl.travado) return; ferramenta = f[0]; Reino.Som.tocar('toque'); pintarBotoes(); });
      botoesFerr[f[0]] = b;
      return b;
    }));
    var limpar = el('button.desenho-ferr.desenho-limpar', { type: 'button', 'aria-label': 'Limpar tudo', title: 'Limpar' }, '🗑', el('small', 'Limpar'));
    limpar.addEventListener('click', function () {
      if (ctrl.travado) return;
      Reino.UI.confirmar('Apagar o desenho inteiro e começar de novo?', 'Apagar', 'Não').then(function (sim) {
        if (!sim) return;
        px = new Array(GRADE * GRADE + 1).join('0').split('');
        usou = { linhas: false, formas: false, cores: [] };
        redesenhar(); pintarRequisitos(); opts.onMudar();
      });
    });
    barraFerr.appendChild(limpar);

    var botoesCor = [];
    var paleta = el('div.desenho-paleta', CORES_DESENHO.map(function (c, i) {
      var b = el('button.desenho-cor', { type: 'button', 'aria-label': c[1], title: c[1], style: { background: c[0] } });
      b.addEventListener('click', function () {
        if (ctrl.travado) return;
        cor = i + 1;
        if (ferramenta === 'borracha') ferramenta = 'lapis';
        Reino.Som.tocar('selecionar'); pintarBotoes();
      });
      botoesCor.push(b);
      return b;
    }));

    var reqs = (d.requisitos || []).map(function (r) {
      var li = el('li.desenho-req', el('span.req-marca'), el('span', NOME_REQUISITO[r] || r));
      return { r: r, li: li };
    });
    var listaReq = el('ul.desenho-requisitos', reqs.map(function (q) { return q.li; }));

    function pintarBotoes() {
      Object.keys(botoesFerr).forEach(function (k) { botoesFerr[k].setAttribute('aria-pressed', String(k === ferramenta)); });
      botoesCor.forEach(function (b, i) { b.setAttribute('aria-pressed', String(ferramenta !== 'borracha' && cor === i + 1)); });
    }
    function pintarRequisitos() {
      reqs.forEach(function (q) {
        var ok = requisitoOk(q.r, usou);
        q.li.classList.toggle('feito', ok);
        U.preencher(q.li.firstChild, ok ? '✓' : '');
      });
    }
    function redesenhar(extra, corExtra) {
      pintarGrade(canvas, px, TAM, true);
      if (!extra) return;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = corExtra ? CORES_DESENHO[corExtra - 1][0] : '#ffffff';
      extra.forEach(function (p) { ctx.fillRect(p[0] * TAM, p[1] * TAM, TAM, TAM); });
    }
    function aplicar(pts, valor) {
      var mudou = false;
      pts.forEach(function (p) {
        if (p[0] < 0 || p[1] < 0 || p[0] >= GRADE || p[1] >= GRADE) return;
        var i = p[1] * GRADE + p[0];
        if (px[i] !== String(valor)) { px[i] = String(valor); mudou = true; }
      });
      if (mudou && valor && usou.cores.indexOf(valor) < 0) usou.cores.push(valor);
      return mudou;
    }
    function dentro(pts) { return pts.filter(function (p) { return p[0] >= 0 && p[1] >= 0 && p[0] < GRADE && p[1] < GRADE; }); }
    function borrachaEm(x, y) { return [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]]; }

    // toque/arraste (mouse, dedo ou caneta)
    var arraste = null;
    function celula(ev) {
      var r = canvas.getBoundingClientRect();
      return [U.clamp(Math.floor((ev.clientX - r.left) / r.width * GRADE), 0, GRADE - 1),
        U.clamp(Math.floor((ev.clientY - r.top) / r.height * GRADE), 0, GRADE - 1)];
    }
    canvas.addEventListener('pointerdown', function (ev) {
      if (ctrl.travado) return;
      ev.preventDefault();
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) {}
      var c = celula(ev);
      arraste = { id: ev.pointerId, x0: c[0], y0: c[1], x: c[0], y: c[1] };
      if (ferramenta === 'lapis') aplicar([c], cor);
      else if (ferramenta === 'borracha') aplicar(borrachaEm(c[0], c[1]), 0);
      mover();
    });
    canvas.addEventListener('pointermove', function (ev) {
      if (!arraste || ev.pointerId !== arraste.id) return;
      ev.preventDefault();
      var c = celula(ev);
      if (c[0] === arraste.x && c[1] === arraste.y) return;
      if (ferramenta === 'lapis') aplicar(riscoLinha(arraste.x, arraste.y, c[0], c[1]), cor);
      else if (ferramenta === 'borracha') riscoLinha(arraste.x, arraste.y, c[0], c[1]).forEach(function (p) { aplicar(borrachaEm(p[0], p[1]), 0); });
      arraste.x = c[0]; arraste.y = c[1];
      mover();
    });
    function previa() {
      if (ferramenta === 'linha') return riscoLinha(arraste.x0, arraste.y0, arraste.x, arraste.y);
      if (ferramenta === 'circulo' || ferramenta === 'quadrado' || ferramenta === 'triangulo') return riscoForma(ferramenta, arraste.x0, arraste.y0, arraste.x, arraste.y);
      return null;
    }
    function mover() { var p = previa(); redesenhar(p ? dentro(p) : null, cor); }
    function soltar(ev) {
      if (!arraste || ev.pointerId !== arraste.id) return;
      var p = previa();
      if (p) {
        var mudou = aplicar(p, cor);
        if (ferramenta === 'linha' && (arraste.x !== arraste.x0 || arraste.y !== arraste.y0)) usou.linhas = true;
        else if (ferramenta !== 'linha' && mudou) usou.formas = true;
      }
      arraste = null;
      Reino.Som.tocar('toque');
      redesenhar(); pintarRequisitos(); opts.onMudar();
    }
    canvas.addEventListener('pointerup', soltar);
    canvas.addEventListener('pointercancel', soltar);
    // no celular, o dedo na prancheta não rola a página
    canvas.addEventListener('touchmove', function (ev) { ev.preventDefault(); }, { passive: false });

    wrap.appendChild(el('p.dica-toque', 'Escolha uma ferramenta e uma cor, depois desenhe com o dedo. Linha e formas: arraste de um ponto a outro.'));
    wrap.appendChild(barraFerr);
    wrap.appendChild(paleta);
    wrap.appendChild(el('div.desenho-moldura', canvas));
    if (reqs.length) wrap.appendChild(el('div.desenho-lista', el('b', 'Use no desenho:'), listaReq));
    pintarBotoes(); pintarRequisitos(); redesenhar();

    function temAlgo() { return px.some(function (v) { return v !== '0'; }); }
    function valor() { return temAlgo() ? { px: px.join(''), usou: U.copia(usou) } : null; }
    var ctrl = {
      el: wrap,
      valor: valor,
      pronto: temAlgo,
      conferir: function () { var v = valor(); return { ok: D.desenhoCumpriu(d, v), faltam: D.desenhoFaltam(d, v) }; },
      marcarErro: function () {
        reqs.forEach(function (q) {
          if (requisitoOk(q.r, usou)) return;
          q.li.classList.add('treme');
          setTimeout(function () { q.li.classList.remove('treme'); }, 600);
        });
      },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  };

  /* texto de apoio (d.apoio, em qualquer desafio ou questão), acima do enunciado:
     { titulo, partes: [{ titulo, lista: [...] } ou { titulo, texto }] }
     tela larga (≥ 1000 px): ao lado da pergunta, sempre aberto. Celular e tablet em pé: caixa recolhível,
     aberta na primeira questão que traz o texto e fechada nas seguintes (fechado = true); o 🔊 fica sempre à vista. */
  D.caixaApoio = function (apoio, fechado) {
    var corpoApoio = el('div.apoio-corpo',
      apoio.titulo ? el('h3.apoio-titulo', apoio.titulo) : null,
      (apoio.partes || []).map(function (p) {
        return el('div.apoio-parte',
          p.titulo ? el('p.apoio-parte-titulo', p.titulo) : null,
          p.lista ? el('ul.apoio-lista', p.lista.map(function (t) { return el('li', t); })) : null,
          p.texto ? el('p.apoio-texto', p.texto) : null);
      }));
    var abrir = el('button.apoio-abrir', { type: 'button' });
    var topo = el('div.apoio-topo', el('p.apoio-rotulo', '📖 Texto de apoio'), abrir);
    var caixa = el('section.apoio', { 'aria-label': 'Texto de apoio' }, topo, corpoApoio);
    function pintar() {
      caixa.classList.toggle('apoio-fechado', fechado);
      abrir.setAttribute('aria-expanded', String(!fechado));
      U.preencher(abrir, fechado ? '📖 Ver o texto de apoio' : '📖 Esconder');
    }
    abrir.addEventListener('click', function () { fechado = !fechado; Reino.Som.tocar('toque'); pintar(); caber(); });
    pintar();
    // tablet em pé: se o que fica escondido na rolagem é pouco (< 80 px) ou cabe no espaço livre da tela,
    // a caixa mostra o texto inteiro, sem rolagem dentro dela (no celular e na tela larga, nada muda)
    var TABLET_EM_PE = '(min-width: 640px) and (max-width: 999.98px)';
    function caber() {
      caixa.classList.remove('apoio-inteiro');
      if (fechado || !caixa.isConnected || !window.matchMedia(TABLET_EM_PE).matches) return;
      var falta = corpoApoio.scrollHeight - corpoApoio.clientHeight;
      if (falta <= 0) return;
      var tela = caixa.closest('.missao-corpo');
      var livre = tela ? tela.clientHeight - tela.scrollHeight : 0;
      if (falta < 80 || falta <= livre) caixa.classList.add('apoio-inteiro');
    }
    var montada = false;
    function aoMudar() {
      if (montada && !caixa.isConnected) { window.removeEventListener('resize', aoMudar); return; }
      caber();
    }
    (function esperar(n) {
      // a caixa entra na tela logo depois de criada: mede quando já está lá (e de novo com as fontes prontas)
      if (caixa.isConnected) {
        montada = true; caber();
        window.addEventListener('resize', aoMudar);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(aoMudar);
      } else if (n < 60) requestAnimationFrame(function () { esperar(n + 1); });
    })(0);
    if (Reino.Som.temVoz()) {
      // no topo da caixa, à vista mesmo com o texto fechado
      var ouvir = el('button.btn-ouvir.btn-ouvir-apoio', { type: 'button', 'aria-label': 'Ouvir o texto de apoio' }, '🔊', el('span.apoio-ouvir-rotulo', ' Ouvir o texto'));
      ouvir.addEventListener('click', function () { Reino.Som.falar(Reino.Falas.segmentosApoio(apoio), { voz: 'narradora' }); });
      topo.appendChild(ouvir);
    }
    return caixa;
  };

  D.render = function (d, opts) {
    opts = Object.assign({ onMudar: function () {} }, opts || {});
    var fabrica = TIPOS[d.tipo] || TIPOS.escolha;
    var ctrl = fabrica(d, opts);
    var card = el('div.desafio.desafio-' + d.tipo + (d.estilo ? '.estilo-' + d.estilo : '') + (d.apoio ? '.com-apoio' : ''));
    if (d.apoio) card.appendChild(D.caixaApoio(d.apoio, !!opts.apoioFechado));
    var enun = el('div.enunciado');
    if (d.tipo === 'vf') {
      enun.appendChild(el('p.pergunta', 'Verdadeiro ou falso?'));
      enun.appendChild(el('blockquote.afirmacao', d.afirmacao));
    } else {
      enun.appendChild(el('p.pergunta', d.pergunta));
    }
    // instrucao (opcional): o jeito de responder no jogo, numa linha própria logo abaixo da pergunta
    if (d.instrucao) enun.appendChild(el('p.instrucao', el('span.instrucao-icone', { 'aria-hidden': 'true' }, '👉'), el('span', d.instrucao)));
    var ouvir = el('button.btn-ouvir', { type: 'button', 'aria-label': 'Ouvir a pergunta' }, '🔊 Ouvir');
    ouvir.addEventListener('click', function () { Reino.Som.falar(Reino.Falas.segmentosDesafio(d, ctrl.ordem), { voz: 'narradora' }); });
    if (Reino.Som.temVoz()) enun.appendChild(ouvir);
    card.appendChild(enun);
    card.appendChild(ctrl.el);
    ctrl.card = card;
    return ctrl;
  };

  // quanto a resposta vale, de 0 a 1 (cada parte da questão vale um pedaço, como na correção da escola)
  D.pontuar = function (d, valor) {
    if (valor == null) return 0;
    function fracao(certas, total) { return total ? certas / total : 0; }
    if (d.tipo === 'vf') return valor === (d.certo ? 0 : 1) ? 1 : 0;
    if (d.tipo === 'escolha') return valor === d.certa ? 1 : 0;
    if (d.tipo === 'varias' && d.livre) return (valor || []).length ? 1 : 0;
    if (d.tipo === 'completar' && d.livre) return valor.every(function (v) { return v != null; }) ? 1 : 0;
    if (d.tipo === 'desenho') return D.desenhoCumpriu(d, valor) ? 1 : 0;
    if (d.tipo === 'varias') {
      var marcadas = valor || [];
      return fracao(d.opcoes.filter(function (o, i) { return !!o.ok === (marcadas.indexOf(i) >= 0); }).length, d.opcoes.length);
    }
    if (d.tipo === 'ligar') return fracao(d.pares.filter(function (_, i) { return valor[i] === i; }).length, d.pares.length);
    if (d.tipo === 'vfLista') return fracao(d.itens.filter(function (it, i) { return valor[i] === (it.v ? 0 : 1); }).length, d.itens.length);
    if (d.tipo === 'completar') return fracao(d.frases.filter(function (f, i) { return valor[i] != null && completarAceita(f, valor[i]); }).length, d.frases.length);
    // copiar: 2 partes por item (marcou a escrita certa; a cópia forma a escrita certa)
    if (d.tipo === 'copiar') return fracao(d.itens.reduce(function (t, it, i) { var v = valor[i] || {}; return t + (v.escolha === it.certa ? 1 : 0) + (copiaCerta(it, v) ? 1 : 0); }, 0), d.itens.length * 2);
    if (d.tipo === 'separar') return fracao(d.itens.filter(function (it, i) { return valor[i] === it.g; }).length, d.itens.length);
    if (d.tipo === 'ordenar' || d.tipo === 'frase') {
      var itens = d.itens || d.blocos;
      var aceitas = [itens.map(function (_, i) { return i; })].concat(d.aceitas || []);
      return aceitas.some(function (a) { return JSON.stringify(a) === JSON.stringify(valor); }) ? 1 : 0;
    }
    return 0;
  };
  D.conferirValor = function (d, valor) { return D.pontuar(d, valor) === 1; };

  function textoFrase(d, seq) { return seq.map(function (i) { return (d.itens || d.blocos)[i]; }).join(' '); }
  // palavra j numa frase do completar (colado: a palavra inteira, como XÍCARA; sem escolha: a lacuna)
  function palavraCompletar(d, f, j) {
    if (d.colado) return f.antes + (j != null ? d.palavras[j] : '_') + f.depois;
    return j != null ? d.palavras[j] : '______';
  }
  function textoEsquerda(p, i) { return p[0].t || ((i + 1) + 'º ' + p[0].alt); }
  D.TEXTO_PESSOAL = 'Resposta pessoal: vale o que for verdade para você.';
  // linha da correção: "✓ Certo: ..." (ou o aviso de resposta pessoal)
  D.linhaCerta = function (d) { return d.livre ? D.TEXTO_PESSOAL : '✓ Certo: ' + D.respostaCertaTexto(d); };
  D.respostaCertaTexto = function (d) {
    if (d.livre) return D.TEXTO_PESSOAL;
    if (d.tipo === 'desenho') return 'Um desenho usando ' + d.requisitos.join(', ') + '.';
    if (d.tipo === 'vf') return d.certo ? 'Verdadeiro' : 'Falso';
    if (d.tipo === 'escolha') return d.opcoes[d.certa].t;
    if (d.tipo === 'varias') return d.opcoes.filter(function (o) { return o.ok; }).map(function (o) { return o.t; }).join(', ');
    if (d.tipo === 'ligar') return d.pares.map(function (p, i) { return textoEsquerda(p, i) + ' → ' + p[1].t; }).join(' • ');
    if (d.tipo === 'vfLista') return d.itens.map(function (it) { return '(' + rotulosVF(d)[it.v ? 0 : 1] + ') ' + it.t; }).join(' • ');
    if (d.tipo === 'completar') return d.frases.map(function (f) {
      var outras = (f.aceitas || []).map(function (j) { return palavraCompletar(d, f, j); });
      return (f.letra ? f.letra + ') ' : '') + palavraCompletar(d, f, f.certa) + (outras.length ? ' (ou ' + outras.join(' ou ') + ')' : '');
    }).join(' • ');
    if (d.tipo === 'copiar') return d.itens.map(function (it) { return (it.letra ? it.letra + ') ' : '') + it.opcoes[it.certa]; }).join(' • ');
    if (d.tipo === 'ordenar' || d.tipo === 'frase') return textoFrase(d, (d.itens || d.blocos).map(function (_, i) { return i; }));
    return '';
  };
  D.respostaTexto = function (d, valor) {
    if (valor == null || (Array.isArray(valor) && !valor.length)) return '(sem resposta)';
    if (d.tipo === 'vf') return valor === 0 ? 'Verdadeiro' : 'Falso';
    if (d.tipo === 'escolha') return d.opcoes[valor].t;
    if (d.tipo === 'varias') return valor.map(function (i) { return d.opcoes[i].t; }).join(', ');
    if (d.tipo === 'ligar') return d.pares.map(function (p, i) { return textoEsquerda(p, i) + ' → ' + (valor[i] != null ? d.pares[valor[i]][1].t : '?'); }).join(' • ');
    if (d.tipo === 'vfLista') return d.itens.map(function (it, i) { return '(' + (valor[i] === 0 || valor[i] === 1 ? rotulosVF(d)[valor[i]] : ' ') + ') ' + it.t; }).join(' • ');
    if (d.tipo === 'desenho') return D.desenhoCumpriu(d, valor) ? 'Desenho com tudo o que foi pedido.' : 'Desenho sem ' + D.desenhoFaltam(d, valor).join(', ') + '.';
    if (d.tipo === 'completar') return d.frases.map(function (f, i) { return (f.letra ? f.letra + ') ' : '') + palavraCompletar(d, f, valor[i]); }).join(' • ');
    if (d.tipo === 'copiar') return d.itens.map(function (it, i) {
      var v = valor[i] || {}, copia = textoCopia(it, v);
      return (it.letra ? it.letra + ') ' : '') + (v.escolha != null ? 'marcou ' + it.opcoes[v.escolha] : 'não marcou') + ', escreveu ' + (copia || '(nada)');
    }).join(' • ');
    if (d.tipo === 'ordenar' || d.tipo === 'frase') return textoFrase(d, valor);
    return '';
  };

  // sorteia os desafios da missão: variedade de tipos e o jogo da memória no fim
  D.sortear = function (sala, quantos) {
    var especiais = ['ligar', 'ordenar', 'separar', 'frase', 'memoria', 'desenho'];
    var porTipo = {};
    sala.desafios.forEach(function (d) { if (especiais.indexOf(d.tipo) >= 0) (porTipo[d.tipo] = porTipo[d.tipo] || []).push(d); });
    var tiposEsp = U.embaralhar(Object.keys(porTipo));
    // a sala 5 sempre tem pelo menos um "separar nos baús"
    if (porTipo.separar) tiposEsp = ['separar'].concat(tiposEsp.filter(function (t) { return t !== 'separar'; }));
    var escolhidos = tiposEsp.slice(0, 2).map(function (t) { return U.sortear(porTipo[t]); });
    var simples = U.embaralhar(sala.desafios.filter(function (d) { return especiais.indexOf(d.tipo) < 0; }));
    var lista = escolhidos.concat(simples.slice(0, Math.max(0, quantos - escolhidos.length)));
    lista = U.embaralhar(lista);
    // começa com uma pergunta simples e deixa a memória para o fim
    lista.sort(function (a, b) { return (a.tipo === 'memoria') - (b.tipo === 'memoria'); });
    var iSimples = lista.findIndex(function (d) { return especiais.indexOf(d.tipo) < 0; });
    if (iSimples > 0) { var s = lista.splice(iSimples, 1)[0]; lista.unshift(s); }
    return lista.slice(0, quantos);
  };

  Reino.Desafios = D;

  /* ================= MISSÃO ================= */
  var M = {};

  M.iniciar = function (materia, sala, aoTerminar) {
    var tela = Reino.UI.abrirTela('missao');
    var lista = D.sortear(sala, Reino.config.desafiosPorSala);
    var idx = 0, acertosPrimeira = 0, pressas = 0, ultimaPressa = -10;
    var errouAtual = false, avisouPressa = false, inicioDesafio = 0, ctrl = null;

    var sair = el('button.btn-icone.btn-sair', { type: 'button', 'aria-label': 'Sair da sala' }, '✕');
    var pontos = el('div.missao-pontos', { 'aria-hidden': 'true' });
    var titulo = el('div.missao-titulo', el('span', sala.emoji + ' ' + sala.nome));
    var corpo = el('div.missao-corpo');
    var btnConferir = el('button.btn-grande.btn-conferir', { type: 'button', disabled: true }, 'Conferir ✓');
    var rodape = el('footer.missao-rodape', el('span.sem-relogio', '⏳ Sem relógio. O tempo é todo seu!'), btnConferir);
    var retorno = el('div.missao-retorno', { hidden: true });

    tela.appendChild(el('header.missao-topo', sair, titulo, pontos));
    tela.appendChild(corpo);
    tela.appendChild(rodape);
    tela.appendChild(retorno);
    document.body.classList.add('em-missao');

    sair.addEventListener('click', function () {
      Reino.UI.confirmar('Quer sair da sala agora? Você pode voltar e fazer de novo depois.', 'Sair', 'Continuar aqui').then(function (sim) {
        if (!sim) return;
        fechar();
        if (aoTerminar) aoTerminar(null);
      });
    });

    function fechar() {
      Reino.Som.calar();
      Reino.Claude.limpar();
      document.body.classList.remove('em-missao');
      Reino.UI.fecharTela(tela);
    }

    function pintarPontos() {
      pontos.innerHTML = '';
      lista.forEach(function (_, i) {
        pontos.appendChild(el('span.ponto' + (i < idx ? '.feito' : '') + (i === idx ? '.atual' : '')));
      });
      pontos.setAttribute('aria-label', 'Desafio ' + (idx + 1) + ' de ' + lista.length);
    }

    function intro() {
      rodape.hidden = true;
      corpo.innerHTML = '';
      var claudeMini = PA.paraDOM(PA.claude(0), 4, 'claude-intro');
      var comecar = el('button.btn-grande.btn-principal', { type: 'button' }, 'Começar 🦄');
      var livro = el('button.btn-grande.btn-secundario', { type: 'button' }, '📖 Ler o resumo antes');
      corpo.appendChild(el('div.intro-sala',
        el('div.intro-emoji', sala.emoji),
        el('h2.titulo-pixel', sala.nome),
        el('p.intro-paginas', 'Apostila: ' + sala.paginas),
        el('div.intro-claude', claudeMini, el('p', sala.intro)),
        el('ul.intro-regras',
          el('li', '⏳ Aqui não tem relógio. Pode ir devagar!'),
          el('li', '👀 Leia cada pergunta com calma e depois toque em "Conferir".'),
          el('li', '⭐ Acertou de primeira? Ganha estrela!')),
        el('div.intro-botoes', comecar, livro)));
      comecar.addEventListener('click', function () { Reino.Som.tocar('porta'); mostrarDesafio(); });
      livro.addEventListener('click', function () { Reino.UI.abrirLivro(materia, sala.desafios[0].livro); });
      Reino.Voz.carregarSala(materia, sala).then(function () { Reino.Som.falar([sala.nome, sala.intro], { voz: 'claude' }); });
    }

    function mostrarDesafio() {
      rodape.hidden = false;
      Reino.Som.calar();
      Reino.Claude.limpar();
      pintarPontos();
      errouAtual = false; avisouPressa = false;
      var d = lista[idx];
      corpo.innerHTML = '';
      ctrl = D.render(d, {
        modo: 'missao',
        onMudar: function () { btnConferir.disabled = !ctrl.pronto(); },
        onCompleto: function () { conferir(true); },
      });
      corpo.appendChild(el('div.desafio-num', 'Desafio ' + (idx + 1) + ' de ' + lista.length));
      corpo.appendChild(ctrl.card);
      btnConferir.disabled = true;
      btnConferir.hidden = !!ctrl.semConferir;
      corpo.scrollTop = 0;
      inicioDesafio = Date.now();
    }

    function tempoMinimo(d) {
      return U.clamp(1500 + D.tamanhoLeitura(d) * 32, 2500, 8000);
    }

    function conferir(automatico) {
      var d = lista[idx];
      if (!ctrl || !ctrl.pronto()) return;
      // detector gentil de pressa (só para perguntas de escolher)
      var ehSimples = D.TREINAVEIS.indexOf(d.tipo) >= 0;
      if (!automatico && ehSimples && !errouAtual && !avisouPressa && Date.now() - inicioDesafio < tempoMinimo(d) && idx - ultimaPressa >= 3) {
        avisouPressa = true; ultimaPressa = idx; pressas++;
        Reino.Som.tocar('toque');
        Reino.Claude.falar(Reino.Claude.frase('pressa'), { tipo: 'pressa', agora: true });
        return;
      }
      Reino.Claude.limpar();
      var res = ctrl.conferir();
      if (res.ok) {
        ctrl.travado = true;
        ctrl.marcarCerto();
        var dePrimeira = !errouAtual;
        if (dePrimeira) acertosPrimeira++;
        var cresceu = Reino.Progresso.xpMontaria(dePrimeira ? 5 : 2);
        Reino.Progresso.salvar();
        Reino.Som.tocar('acerto');
        if (dePrimeira) setTimeout(function () { Reino.Som.tocar('estrela'); }, 350);
        mostrarRetorno(true, d, dePrimeira, cresceu);
      } else {
        errouAtual = true;
        Reino.Som.tocar('erro');
        ctrl.marcarErro(res);
        mostrarRetorno(false, d, false, null, res);
      }
    }
    btnConferir.addEventListener('click', function () { conferir(false); });

    function mostrarRetorno(ok, d, dePrimeira, cresceu, res) {
      retorno.innerHTML = '';
      retorno.className = 'missao-retorno ' + (ok ? 'retorno-certo' : 'retorno-quase');
      var fala = ok ? Reino.Claude.frase(dePrimeira ? 'acerto' : 'acertoDepois') : Reino.Claude.frase('erro');
      var extra = null;
      if (!ok && d.tipo === 'varias' && res && res.faltam > 0 && (!res.erradas || !res.erradas.length)) extra = el('p.retorno-extra', 'Dica: ainda falta marcar ' + (res.faltam === 1 ? '1 item' : res.faltam + ' itens') + '!');
      var cab = el('div.retorno-cabeca',
        PA.paraDOM(PA.claude(0), 3, 'claude-retorno'),
        el('div',
          el('h3', ok ? (dePrimeira ? '✨ Isso! +1 ⭐' : '✨ Isso!') : '💭 Quase!'),
          el('p.retorno-fala', fala)));
      retorno.appendChild(cab);
      if (extra) retorno.appendChild(extra);
      // acertou: reforça com a explicação; errou: só uma pista, sem entregar a resposta
      if (ok) retorno.appendChild(el('p.retorno-explica', el('b', '📌 Lembrete: '), d.explica));
      else retorno.appendChild(el('p.retorno-explica', el('b', '📌 Pista: '), pista(d)));
      if (cresceu) retorno.appendChild(el('p.retorno-cresceu', '🌟 ' + Reino.Progresso.nomeUni(cresceu.id) + ' cresceu! Agora é ' + Reino.Unicornios.ESTAGIOS[cresceu.estagio].nome + ' ' + Reino.Unicornios.ESTAGIOS[cresceu.estagio].emoji));
      var botoes = el('div.retorno-botoes');
      if (ok) {
        var cont = el('button.btn-grande.btn-principal', { type: 'button' }, idx + 1 < lista.length ? 'Continuar →' : 'Terminar a sala 🎉');
        cont.addEventListener('click', function () { Reino.Som.tocar('toque'); retorno.hidden = true; proximo(); });
        botoes.appendChild(cont);
      } else {
        var livro = el('button.btn-grande.btn-secundario', { type: 'button' }, '📖 Ver no livro');
        livro.addEventListener('click', function () { Reino.UI.abrirLivro(materia, d.livro); });
        var denovo = el('button.btn-grande.btn-principal', { type: 'button' }, 'Tentar de novo');
        denovo.addEventListener('click', function () {
          Reino.Som.tocar('toque'); retorno.hidden = true; Reino.Som.calar();
          btnConferir.disabled = !ctrl.pronto();
        });
        botoes.appendChild(livro); botoes.appendChild(denovo);
      }
      retorno.appendChild(botoes);
      retorno.hidden = false;
      btnConferir.disabled = true;
      Reino.Som.falar(ok ? [fala] : [fala, pista(d)], { voz: 'claude' });
      setTimeout(function () { var b = retorno.querySelector('.btn-principal'); if (b) b.focus(); }, 60);
    }

    // pista depois de um erro: primeira frase da explicação, sem a resposta pronta
    function pista(d) { return Reino.Falas.pista(d, materia); }

    function proximo() {
      idx++;
      if (idx < lista.length) { mostrarDesafio(); return; }
      terminar();
    }

    function terminar() {
      pintarPontos();
      rodape.hidden = true;
      var premios = Reino.Progresso.concluirSala(materia, sala, { acertosPrimeira: acertosPrimeira, total: lista.length, pressas: pressas });
      Reino.Som.tocar('fanfarra');
      corpo.innerHTML = '';
      var itens = el('ul.premios');
      itens.appendChild(el('li', el('span.premio-icone', '⭐'), el('span', 'Acertos de primeira: ', el('b', acertosPrimeira + ' de ' + lista.length))));
      if (premios.calma) itens.appendChild(el('li', el('span.premio-icone', '🌙'), el('span', el('b', 'Estrela da Calma!'), ' Você leu tudo com calma. +3 ⭐')));
      if (premios.primeiraVez) itens.appendChild(el('li.premio-dinheiro', el('span.premio-icone', '💰'), el('span', el('b', '+ ' + U.reais(premios.dinheiro)), ' no Baú do Tesouro!')));
      else itens.appendChild(el('li', el('span.premio-icone', '🔁'), el('span', 'Treino livre: os ' + U.reais(Reino.Progresso.valorSala(materia)) + ' desta sala já estão no baú.')));
      if (premios.ovos.length) itens.appendChild(el('li.premio-ovo', el('span.premio-icone', '🥚'), el('span', el('b', premios.ovos.length === 1 ? 'Você ganhou um ovo mágico!' : 'Você ganhou ' + premios.ovos.length + ' ovos mágicos!'))));
      if (premios.cresceu) itens.appendChild(el('li', el('span.premio-icone', '🌟'), el('span', Reino.Progresso.nomeUni(premios.cresceu.id) + ' cresceu!')));
      var raro = (materia.unicornios || []).find(function (u) { return u.raridade === 'raro' && u.sala === sala.id; });
      var faltamRaro = raro && !Reino.Progresso.temUni(raro.id) ? Reino.Progresso.faltamPersistencia({ raridade: 'raro', sala: sala.id }) : 0;
      var dicaRaro = faltamRaro ? el('p.dica-raro', '💙 Mais ' + (faltamRaro === 1 ? '1 vez' : faltamRaro + ' vezes') + ' nesta sala e o unicórnio raro nasce! Ou faça tudo certo de primeira e com calma.')
        : premios.porPersistencia ? el('p.dica-raro', '💙 O unicórnio raro nasceu pela sua persistência!') : null;
      var btn = el('button.btn-grande.btn-principal', { type: 'button' }, premios.ovos.length ? 'Chocar ' + (premios.ovos.length > 1 ? 'os ovos' : 'o ovo') + ' 🥚' : 'Voltar ' + (materia.lugar.artigo === 'a' ? 'à ' : 'ao ') + materia.lugar.nome);
      corpo.appendChild(el('div.fim-sala',
        el('div.fim-emoji', premios.materiaCompleta ? '🌈' : '🎉'),
        el('h2.titulo-pixel', premios.materiaCompleta ? 'Revisão de ' + materia.nome + ' completa!' : 'Sala concluída!'),
        premios.materiaCompleta ? el('p.fim-grande', 'Você completou TODAS as salas! ' + U.reais(Reino.config.valorPorMateria) + ' de ' + materia.nome + ' no baú! 🥳') : el('p', Reino.Claude.frase('fimSala')),
        itens, dicaRaro, btn));
      if (premios.primeiraVez) setTimeout(function () { Reino.Som.tocar('moeda'); }, 900);
      Reino.Som.falar([premios.materiaCompleta ? Reino.Falas.fixas.revisaoCompleta : Reino.Falas.fixas.salaConcluida, Reino.Falas.acertouDePrimeira(acertosPrimeira)], { voz: 'claude' });
      btn.addEventListener('click', function () {
        fechar();
        var depois = function () { if (aoTerminar) aoTerminar(premios); };
        if (premios.ovos.length) Reino.UI.chocarOvos(premios.ovos).then(depois);
        else depois();
      });
    }

    intro();
  };

  Reino.Missao = M;
})();
