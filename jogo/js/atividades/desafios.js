/* Desafios: núcleo. Helpers comuns (maiúsculas acentuadas, título que encolhe, botão de opção,
   clique pelo teclado), textos do desafio (enunciado, fala, correção), caixa do texto de apoio,
   D.render, D.pontuar, D.conferirValor e D.sortear. Cada tipo de desafio mora em
   js/atividades/desafios/<tipo>.js e se registra com Reino.registrarTipoDesafio (carregado depois deste):
   o núcleo, a prova, as falas e o validador só chamam os ganchos do tipo (docs/contratos/conteudo.md,
   "Tipo de desafio novo"). Este arquivo e os tipos são `node: true`: no carregamento não tocam em document.
   A tela de uma sala (Reino.Missao) fica em js/atividades/missao.js. */
(function () {
  var U = Reino.util, el = U.el;
  var D = {};

  /* Objeto interno das partes dos desafios (não é API do jogo; só estes arquivos usam):
     TIPOS      fábricas de cada tipo: TIPOS.<tipo>(d, opts) devolve o controle { el, valor, pronto, conferir, ... }
     PONTUAR    pontuação de cada tipo: PONTUAR.<tipo>(d, valor) de 0 a 1 (tipo sem entrada vale 0)
     fracao, botaoOpcao, doTeclado: helpers comuns (neste arquivo) */
  var _d = Reino._desafios = { TIPOS: {}, PONTUAR: {} };
  var tem = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };

  // tipos que valem para o treino (e contam no mínimo do treino do validador): os de def.treinavel
  D.TREINAVEIS = [];

  /* Registro dos tipos: Reino.registrarTipoDesafio(tipo, def), def = { montar, pontuar, ... } (TipoDesafioDef em
     ferramentas/testes/tipos-jogo.d.ts). Reino.tiposDesafio[tipo] é a def; D.tipoDe(d) a def do desafio (ou null). */
  var DEFS = Reino.tiposDesafio = {};
  Reino.registrarTipoDesafio = function (tipo, def) {
    if (tem(DEFS, tipo)) throw new Error('tipo de desafio repetido: ' + tipo);
    if (!def || typeof def.montar !== 'function') throw new Error('tipo de desafio sem montar: ' + tipo);
    DEFS[tipo] = def;
    _d.TIPOS[tipo] = def.montar;
    // sem pontuar (memória): vale 0
    if (def.pontuar) _d.PONTUAR[tipo] = def.pontuar;
    if (def.treinavel) D.TREINAVEIS.push(tipo);
    return def;
  };
  D.tipoDe = function (d) { return d && tem(DEFS, d.tipo) ? DEFS[d.tipo] : null; };

  /* Maiúsculas acentuadas na fonte pixel: a Press Start 2P desenha Á, Ó, Ã… com o desenho da minúscula
     (HISTÓRIA saía HISTóRIA). Cada uma vira <span class="mai-acento" data-b="O" data-a="´">Ó</span>:
     a letra de verdade fica no texto (textContent, cópia) mas invisível, e o css desenha por cima
     a maiúscula sem acento e o acento da própria fonte, logo acima dela. O pedaço de texto trocado fica num
     <span class="mai-acento-texto"> (sem estilo próprio). Vale para o jogo todo. */
  var MAI_ACENTO = { 'Á': 'A´', 'À': 'A`', 'Â': 'A^', 'Ã': 'A˜', 'É': 'E´', 'È': 'E`', 'Ê': 'E^', 'Í': 'I´',
    'Ó': 'O´', 'Ò': 'O`', 'Ô': 'O^', 'Õ': 'O˜', 'Ú': 'U´', 'Ù': 'U`', 'Ü': 'U¨' };
  var RE_MAI_ACENTO = /[ÁÀÂÃÉÈÊÍÓÒÔÕÚÙÜ]/g;
  var SEM_ACENTO_DENTRO = /^(SCRIPT|STYLE|TITLE|OPTION|TEXTAREA|NOSCRIPT)$/;
  function acentuarTexto(t) {
    var pai = t.parentNode, s = t.nodeValue;
    if (!pai || pai.nodeType !== 1 || !s) return;
    RE_MAI_ACENTO.lastIndex = 0;
    if (!RE_MAI_ACENTO.test(s)) return;
    if (pai.classList.contains('mai-acento') || SEM_ACENTO_DENTRO.test(pai.nodeName) || pai.namespaceURI !== 'http://www.w3.org/1999/xhtml') return;
    // tudo num span só: dentro de flex/grid o texto continua um item só (a letra não vira uma coluna à parte)
    var caixa = document.createElement('span'), ultimo = 0, m;
    caixa.className = 'mai-acento-texto';
    RE_MAI_ACENTO.lastIndex = 0;
    while ((m = RE_MAI_ACENTO.exec(s))) {
      if (m.index > ultimo) caixa.appendChild(document.createTextNode(s.slice(ultimo, m.index)));
      var sp = document.createElement('span');
      sp.className = 'mai-acento';
      sp.setAttribute('data-b', MAI_ACENTO[m[0]].charAt(0));
      sp.setAttribute('data-a', MAI_ACENTO[m[0]].charAt(1));
      sp.textContent = m[0];
      caixa.appendChild(sp);
      ultimo = m.index + 1;
    }
    if (ultimo < s.length) caixa.appendChild(document.createTextNode(s.slice(ultimo)));
    pai.replaceChild(caixa, t);
  }
  function acentuarDentro(no) {
    if (no.nodeType === 3) { acentuarTexto(no); return; }
    if (no.nodeType !== 1 && no.nodeType !== 11) return;
    var textos = [], w = document.createTreeWalker(no, NodeFilter.SHOW_TEXT), t;
    while ((t = w.nextNode())) { RE_MAI_ACENTO.lastIndex = 0; if (RE_MAI_ACENTO.test(t.nodeValue)) textos.push(t); }
    textos.forEach(acentuarTexto);
  }
  D.acentuarMaiusculas = acentuarDentro;

  /* Título do topo da sala/prova que não cabe: no celular, com as bolinhas ao lado, "Revisão Bimestral de
     Português" ia a 4 linhas e o ícone de "Expedição Antártida" ficava sozinho em cima do nome. Se o título
     passa de 2 linhas, a fonte desce aos poucos (até 70%) e fica o tamanho com menos linhas.
     Só nas matérias desta lista: História e Inglês têm o mesmo aperto, mas as telas delas ficam como estão. */
  D.MATERIAS_TITULO_AJUSTAVEL = ['portugues'];
  D.ajustarTitulo = function (titulo, materiaId) {
    if (D.MATERIAS_TITULO_AJUSTAVEL.indexOf(materiaId) < 0) return;
    // palavra curtinha no fim não desce sozinha: "L, R e RR" ia com o "RR" sozinho embaixo; agora "e RR" vai junto
    var fim = (titulo.firstElementChild || titulo).lastChild;
    if (fim && fim.nodeType === 3) fim.nodeValue = fim.nodeValue.replace(/ (\S{1,3})$/, '\u00a0$1');
    if (!window.ResizeObserver) return;
    var largura = -1, pedido = 0;
    function linhas() {
      var alvo = titulo.firstElementChild || titulo, topos = [];
      Array.prototype.forEach.call(alvo.getClientRects(), function (r) {
        if (r.width > 0 && !topos.some(function (y) { return Math.abs(y - r.top) < 2; })) topos.push(r.top);
      });
      return topos.length;
    }
    function medir() {
      pedido = 0;
      if (!titulo.isConnected) return;
      titulo.style.fontSize = '';
      var n = linhas();
      if (n <= 2) return;
      var base = parseFloat(getComputedStyle(titulo).fontSize), melhor = { k: 1, n: n };
      [0.9, 0.8, 0.7].some(function (k) {
        titulo.style.fontSize = (base * k) + 'px';
        var nk = linhas();
        if (nk < melhor.n) melhor = { k: k, n: nk };
        return nk <= 2;
      });
      titulo.style.fontSize = melhor.k === 1 ? '' : (base * melhor.k) + 'px';
    }
    function pedir() { if (!pedido) pedido = requestAnimationFrame(medir); }
    new ResizeObserver(function () {
      // só a largura importa (a altura muda com a própria fonte)
      if (titulo.clientWidth === largura) return;
      largura = titulo.clientWidth;
      pedir();
    }).observe(titulo);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(pedir);
  };
  if (window.MutationObserver && document.body) {
    acentuarDentro(document.body);
    new MutationObserver(function (mudancas) {
      mudancas.forEach(function (m) {
        if (m.type === 'characterData') acentuarTexto(m.target);
        else Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.isConnected) acentuarDentro(n); });
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function botaoOpcao(o, extra) {
    return el('button.opcao' + (extra || ''), { type: 'button' },
      o.e ? el('span.opcao-emoji', { 'aria-hidden': 'true' }, o.e) : null,
      el('span.opcao-texto', o.t));
  }
  _d.botaoOpcao = botaoOpcao;

  D.enunciado = function (d) {
    var def = D.tipoDe(d);
    return def && def.enunciado ? def.enunciado(d) : d.pergunta;
  };
  D.textoParaFala = function (d) {
    var def = D.tipoDe(d);
    return D.enunciado(d) + (def && def.textoFala ? def.textoFala(d) : '');
  };
  // tamanho do texto para o detector de pressa
  D.tamanhoLeitura = function (d) {
    var t = D.enunciado(d);
    if (d.opcoes) t += d.opcoes.map(function (o) { return o.t; }).join(' ');
    if (d.instrucao) t += ' ' + d.instrucao;
    return t.length;
  };

  // o clique veio do Enter/Espaço (detail 0 e a última coisa usada foi o teclado)? Toque e mouse não mudam o foco
  function doTeclado(ev) { return !!ev && ev.isTrusted && !ev.detail && Reino.UI.porTeclado(); }
  _d.doTeclado = doTeclado;

  /* texto de apoio (d.apoio, em qualquer desafio ou questão), acima do enunciado:
     { titulo, partes: [{ titulo, lista: [...] } ou { titulo, texto }] }
     tela larga (≥ 1000 px): ao lado da pergunta, sempre aberto. Celular e tablet em pé: caixa recolhível,
     aberta na primeira questão que traz o texto e fechada nas seguintes (fechado = true); o 🔊 fica sempre à vista. */
  /* um só escutador de resize para todas as caixas de apoio: guarda só as caixas ainda na tela (WeakRef, quando há),
     e descarta as que saíram a cada caixa nova e a cada resize, sem segurar questões e provas antigas na memória */
  var apoiosVivos = [];
  var ouvindoApoios = false;
  function apoioDaRef(r) { return r && typeof r.deref === 'function' ? r.deref() : r; }
  function aoRedimensionarApoios() {
    apoiosVivos = apoiosVivos.filter(function (r) {
      var c = apoioDaRef(r);
      if (!c || !c.isConnected) return false;
      c._caber();
      return true;
    });
    if (!apoiosVivos.length && ouvindoApoios) { window.removeEventListener('resize', aoRedimensionarApoios); ouvindoApoios = false; }
  }
  function apoioVivo(caixa) {
    apoiosVivos = apoiosVivos.filter(function (r) { var c = apoioDaRef(r); return c && c.isConnected; });
    apoiosVivos.push(typeof WeakRef === 'function' ? new WeakRef(caixa) : caixa);
    if (!ouvindoApoios) { window.addEventListener('resize', aoRedimensionarApoios); ouvindoApoios = true; }
  }

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
    caixa._caber = caber;
    (function esperar(n) {
      // a caixa entra na tela logo depois de criada: mede quando já está lá (e de novo com as fontes prontas)
      if (caixa.isConnected) {
        caber();
        apoioVivo(caixa);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (caixa.isConnected) caber(); });
      } else if (n < 60) requestAnimationFrame(function () { esperar(n + 1); });
    })(0);
    if (Reino.Som.temVoz()) {
      // no topo da caixa, à vista mesmo com o texto fechado
      var ouvir = el('button.btn-ouvir.btn-ouvir-apoio.livre-na-fala', { type: 'button', 'aria-label': 'Ouvir o texto de apoio' }, '🔊', el('span.apoio-ouvir-rotulo', ' Ouvir o texto'));
      ouvir.addEventListener('click', function () { Reino.UI.ouvirDeNovo(Reino.Falas.segmentosApoio(apoio), { voz: 'narradora' }); });
      topo.appendChild(ouvir);
    }
    return caixa;
  };

  D.render = function (d, opts) {
    opts = Object.assign({ onMudar: function () {} }, opts || {});
    var fabrica = _d.TIPOS[d.tipo] || _d.TIPOS.escolha;
    var ctrl = fabrica(d, opts);
    var card = el('div.desafio.desafio-' + d.tipo + (d.estilo ? '.estilo-' + d.estilo : '') + (d.apoio ? '.com-apoio' : ''));
    if (d.apoio) card.appendChild(D.caixaApoio(d.apoio, !!opts.apoioFechado));
    var enun = el('div.enunciado'), def = D.tipoDe(d);
    // enunciadoTela: o tipo desenha o próprio enunciado (vf: a pergunta fixa e a afirmação)
    (def && def.enunciadoTela ? def.enunciadoTela(d) : [el('p.pergunta', d.pergunta)]).forEach(function (n) { enun.appendChild(n); });
    // instrucao (opcional): o jeito de responder no jogo, numa linha própria logo abaixo da pergunta
    if (d.instrucao) enun.appendChild(el('p.instrucao', el('span.instrucao-icone', { 'aria-hidden': 'true' }, '👉'), el('span', d.instrucao)));
    var ouvir = el('button.btn-ouvir.livre-na-fala', { type: 'button', 'aria-label': 'Ouvir a pergunta' }, '🔊 Ouvir');
    ouvir.addEventListener('click', function () { Reino.UI.ouvirDeNovo(Reino.Falas.segmentosDesafio(d, ctrl.ordem), { voz: 'narradora' }); });
    if (Reino.Som.temVoz()) enun.appendChild(ouvir);
    card.appendChild(enun);
    card.appendChild(ctrl.el);
    ctrl.card = card;
    // opts.lerSozinho (true ou lista de alvos a mais, ex.: ✕ e "Conferir"): lê a questão ao aparecer (UI.lerQuestao:
    // só trava as respostas e os alvos se config.esperaFala.travarQuestoes); ctrl.leitura é a Promise do fim.
    if (opts.lerSozinho) {
      var extras = Array.isArray(opts.lerSozinho) ? opts.lerSozinho : [];
      ctrl.leitura = Reino.UI.lerQuestao([card].concat(extras), Reino.Falas.segmentosDesafio(d, ctrl.ordem), { voz: 'narradora' }).then(function () {
        // o foco estava no 🔊 ou em lugar nenhum: vai para a 1ª resposta
        var a = document.activeElement;
        if (card.isConnected && (!a || a === document.body || a === ouvir)) Reino.UI.focarTroca(ctrl.el, null, 0);
      });
    }
    return ctrl;
  };

  // quanto a resposta vale, de 0 a 1 (cada parte da questão vale um pedaço, como na correção da escola);
  // a conta de cada tipo fica no arquivo dele (_d.PONTUAR)
  _d.fracao = function (certas, total) { return total ? certas / total : 0; };
  D.pontuar = function (d, valor) {
    if (valor == null) return 0;
    var pontuar = Object.prototype.hasOwnProperty.call(_d.PONTUAR, d.tipo) ? _d.PONTUAR[d.tipo] : null;
    return pontuar ? pontuar(d, valor) : 0;
  };
  D.conferirValor = function (d, valor) { return D.pontuar(d, valor) === 1; };

  D.TEXTO_PESSOAL = 'Resposta pessoal: vale o que for verdade para você.';
  // linha da correção: "✓ Certo: ..." (ou o aviso de resposta pessoal)
  D.linhaCerta = function (d) { return d.livre ? D.TEXTO_PESSOAL : '✓ Certo: ' + D.respostaCertaTexto(d); };
  // textos da correção: cada tipo diz a resposta certa (def.textoCerto) e a dada (def.textoResposta)
  D.respostaCertaTexto = function (d) {
    if (d.livre) return D.TEXTO_PESSOAL;
    var def = D.tipoDe(d);
    return def && def.textoCerto ? def.textoCerto(d) : '';
  };
  D.respostaTexto = function (d, valor) {
    if (valor == null || (Array.isArray(valor) && !valor.length)) return '(sem resposta)';
    var def = D.tipoDe(d);
    return def && def.textoResposta ? def.textoResposta(d, valor) : '';
  };

  // sorteia os desafios da missão: variedade de tipos e o jogo da memória no fim
  // (def.especial: no máximo 2 tipos especiais por missão; def.semprePrimeiro: entra sempre que a sala tem;
  // def.noFim: vai para o fim da missão)
  function prop(d, k) { var def = D.tipoDe(d); return !!(def && def[k]); }
  D.sortear = function (sala, quantos) {
    function especial(d) { return prop(d, 'especial'); }
    var porTipo = {};
    sala.desafios.forEach(function (d) { if (especial(d)) (porTipo[d.tipo] = porTipo[d.tipo] || []).push(d); });
    var tiposEsp = U.embaralhar(Object.keys(porTipo), 'sortear:' + sala.id + ':esp');
    // a sala 5 sempre tem pelo menos um "separar nos baús"
    var primeiros = tiposEsp.filter(function (t) { return DEFS[t].semprePrimeiro; });
    tiposEsp = primeiros.concat(tiposEsp.filter(function (t) { return !DEFS[t].semprePrimeiro; }));
    var escolhidos = tiposEsp.slice(0, 2).map(function (t) { return U.sortear(porTipo[t], 'esp:' + t); });
    var simples = U.embaralhar(sala.desafios.filter(function (d) { return !especial(d); }), 'sortear:' + sala.id + ':simples');
    var lista = escolhidos.concat(simples.slice(0, Math.max(0, quantos - escolhidos.length)));
    lista = U.embaralhar(lista, 'sortear:' + sala.id + ':lista');
    // começa com uma pergunta simples e deixa a memória para o fim
    lista.sort(function (a, b) { return prop(a, 'noFim') - prop(b, 'noFim'); });
    var iSimples = lista.findIndex(function (d) { return !especial(d); });
    if (iSimples > 0) { var s = lista.splice(iSimples, 1)[0]; lista.unshift(s); }
    return lista.slice(0, quantos);
  };

  Reino.Desafios = D;
})();
