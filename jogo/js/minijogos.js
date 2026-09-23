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
      marcarCerto: function () { d.opcoes.forEach(function (o, i) { if (o.ok) botoes[i].classList.add('certa'); }); },
      revelar: function () {
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
    var direita = U.embaralhar(d.pares.map(function (_, i) { return i; }));
    var liga = {}; // esquerda -> direita
    var escolhida = null;
    var wrap = el('div.ligar');
    var colE = el('div.ligar-col'), colD = el('div.ligar-col');
    var bE = [], bD = {};
    d.pares.forEach(function (p, i) {
      var b = el('button.ligar-item.ligar-esq', { type: 'button' }, el('span.ligar-marca'), p[0].e ? el('span.opcao-emoji', p[0].e) : null, el('span', p[0].t));
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
    escolhida = 0; pintar();
    var ctrl = {
      el: wrap,
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
    var seq = [];
    var monte = U.embaralhar(itens.map(function (_, i) { return i; }));
    while (n > 2 && monte.every(function (v, i) { return v === i; })) monte = U.embaralhar(monte);
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
      wrap.appendChild(el('p.dica-toque', 'Toque num bloco para colocar. Toque de novo para tirar.'));
      wrap.appendChild(pool);
    } else {
      // no ordenar, as opções ficam em cima para caberem na tela do celular
      wrap.appendChild(el('p.dica-toque', 'Toque nas etapas na ordem certa. Errou? Toque no item da lista para tirar.'));
      wrap.appendChild(pool);
      wrap.appendChild(alvo);
    }
    pintar();
    var ctrl = {
      el: wrap,
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
        abertas.push(idx); b.classList.add('virada'); b.setAttribute('aria-label', c.face);
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

  D.render = function (d, opts) {
    opts = Object.assign({ onMudar: function () {} }, opts || {});
    var fabrica = TIPOS[d.tipo] || TIPOS.escolha;
    var ctrl = fabrica(d, opts);
    var card = el('div.desafio.desafio-' + d.tipo);
    var enun = el('div.enunciado');
    if (d.tipo === 'vf') {
      enun.appendChild(el('p.pergunta', 'Verdadeiro ou falso?'));
      enun.appendChild(el('blockquote.afirmacao', d.afirmacao));
    } else {
      enun.appendChild(el('p.pergunta', d.pergunta));
    }
    var ouvir = el('button.btn-ouvir', { type: 'button', 'aria-label': 'Ouvir a pergunta' }, '🔊 Ouvir');
    ouvir.addEventListener('click', function () { Reino.Som.falar(Reino.Falas.segmentosDesafio(d, ctrl.ordem), { voz: 'narradora' }); });
    if (Reino.Som.temVoz()) enun.appendChild(ouvir);
    card.appendChild(enun);
    card.appendChild(ctrl.el);
    ctrl.card = card;
    return ctrl;
  };

  D.conferirValor = function (d, valor) {
    if (d.tipo === 'vf') return valor === (d.certo ? 0 : 1);
    if (d.tipo === 'escolha') return valor === d.certa;
    if (d.tipo === 'varias') {
      var certos = d.opcoes.map(function (o, i) { return o.ok ? i : -1; }).filter(function (i) { return i >= 0; });
      return JSON.stringify(certos) === JSON.stringify((valor || []).slice().sort(function (a, b) { return a - b; }));
    }
    return false;
  };
  D.respostaCertaTexto = function (d) {
    if (d.tipo === 'vf') return d.certo ? 'Verdadeiro' : 'Falso';
    if (d.tipo === 'escolha') return d.opcoes[d.certa].t;
    if (d.tipo === 'varias') return d.opcoes.filter(function (o) { return o.ok; }).map(function (o) { return o.t; }).join(', ');
    return '';
  };
  D.respostaTexto = function (d, valor) {
    if (valor == null || (Array.isArray(valor) && !valor.length)) return '(sem resposta)';
    if (d.tipo === 'vf') return valor === 0 ? 'Verdadeiro' : 'Falso';
    if (d.tipo === 'escolha') return d.opcoes[valor].t;
    if (d.tipo === 'varias') return valor.map(function (i) { return d.opcoes[i].t; }).join(', ');
    return '';
  };

  // sorteia os desafios da missão: variedade de tipos e o jogo da memória no fim
  D.sortear = function (sala, quantos) {
    var especiais = ['ligar', 'ordenar', 'separar', 'frase', 'memoria'];
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
      var dicaRaro = raro && !Reino.Progresso.temUni(raro.id) ? el('p.dica-raro', '💙 Dica: faça esta sala com tudo certo de primeira e sem pressa para ganhar um unicórnio RARO!') : null;
      var btn = el('button.btn-grande.btn-principal', { type: 'button' }, premios.ovos.length ? 'Chocar ' + (premios.ovos.length > 1 ? 'os ovos' : 'o ovo') + ' 🥚' : 'Voltar ao ' + materia.lugar.nome);
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
