/* Laboratório de Química: a tabela periódica do Cantinho dos Átomos (Reino.UI.telaQuimicaTabela), parte 1 de 2.
   Contrato: docs/contratos/quimica.md §2. Um painel com duas abas: "Tabela" (o mapa das casas pintadas pela família,
   a legenda e os cartões dos elementos; tocar num cartão abre a ficha no mesmo painel, com ◀ ▶ para o vizinho) e
   "Lições" (quimica-tabela-2.js). Tudo o que se ouve é da Doutora Proveta (Reino.Quimica.VOZ). Sem animação: quadro parado.
   Cria o interno Reino._quimicaTabela (só as duas partes deste arquivo usam):
     el, Q (Reino.Quimica, posto ao abrir a tela), hifenizar, falar(paginas), paginas(x), canvasNitido(wArte, hArte, k), ret, rodapeBotao(rotulo, aria, classe)
   e a parte 2 acrescenta mostrarLicoes(v) e abrirLicao(v, id). A "vista" v (uma por tela aberta) guarda o painel
   (pn), trocar(nos, rodape, setas), aba(nome) e o que está aceso. */
(function () {
  var R = window.Reino, U = R.util, el = U.el, D = R.Desenho, UI = R.UI;
  var Q = null;   // Reino.Quimica (sistemas/, carrega depois de ui/): lido ao abrir a tela
  var K = D.K, ret = D.ret;
  var PAPEL = (R.config.paleta && R.config.paleta.papel) || '#fff8ee';
  var T = R._quimicaTabela = { el: el, Q: null, ret: ret };

  // a casa do mapa: 8 px de arte (7 de cor e 1 de contorno, dividido com a vizinha); vão antes dos lantanídeos
  var P = 8, VAO = 4, MARGEM = 2, COLUNAS = 18;
  var W_MAPA = MARGEM * 2 + COLUNAS * P + 1, H_MAPA = MARGEM * 2 + 9 * P + VAO + 1;

  function hifenizar(s) { return R._ui.hifenizar(s); }   // ui/pecas.js (ui.md §10.17)
  T.hifenizar = hifenizar;
  function paginas(x) { return !x ? [] : Array.isArray(x) ? x.slice() : [x]; }
  T.paginas = paginas;
  function falar(ps) { ps = paginas(ps); if (ps.length) R.Som.falar(ps, { voz: Q.VOZ }); }
  T.falar = falar;

  /* Canvas nítido: desenha em px de arte, cada um vira k px CSS (k × dpr px de aparelho, inteiro). */
  function canvasNitido(wArte, hArte, k) {
    var dpr = Math.max(1, Math.round(window.devicePixelRatio || 1)), cv = el('canvas.qt-canvas');
    cv.width = wArte * k * dpr; cv.height = hArte * k * dpr;
    cv.style.width = wArte * k + 'px'; cv.style.height = hArte * k + 'px';
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
    return { cv: cv, ctx: ctx, px: k * dpr, dpr: dpr };
  }
  T.canvasNitido = canvasNitido;

  /* ---------- famílias e cores ---------- */
  function familia(id) { var f = Q.familias()[id]; return f || { nome: 'Outros', cor: D.C.pedra }; }
  function claro(cor) { var c = D.hexRgb(cor); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255 > 0.5; }
  // o cartão: faixa na cor da família e fundo clarinho dela (o texto --tinta fica legível em qualquer cor)
  function pintar(no, cor) {
    no.style.setProperty('--qt-cor', cor);
    no.style.setProperty('--qt-fundo', D.misturar(cor, PAPEL, 0.72));
    return no;
  }
  // o elemento do prêmio da trilha perfeita ainda não ganho: "?" no lugar do nome e do símbolo (quarto-bimestre.md §14.3)
  function fechado(z) { return !!Q.elementoGanho && !!Q.elemento(z) && !Q.elementoGanho(z); }
  T.fechado = fechado;
  function amostra(cor) { return el('span.qt-cor', { 'aria-hidden': 'true', style: { background: cor } }); }

  /* Nome no cartão: até 8 letras inteiro (numa linha só); de 9 ou mais, das sílabas do hifenizar fica só o corte
     mais perto do meio ("Hidro-gênio"), para as duas linhas saírem parelhas (ui.md §10.17.2) */
  function nomeCartao(nome) {
    var partes = hifenizar(nome).split('\u00ad');
    if (partes.length < 3) return partes.join('\u00ad');
    var meio = nome.length / 2, soma = 0, melhor = 1, dist = Infinity;
    for (var i = 1; i < partes.length; i++) {
      soma += partes[i - 1].length;
      if (Math.abs(soma - meio) < dist) { dist = Math.abs(soma - meio); melhor = i; }
    }
    return partes.slice(0, melhor).join('') + '\u00ad' + partes.slice(melhor).join('');
  }

  /* ---------- o mapa das casas ---------- */
  function posCasa(c) {
    if (!(c.coluna >= 1 && c.coluna <= COLUNAS)) return null;
    var y = c.linha >= 1 && c.linha <= 7 ? (c.linha - 1) * P : c.linha === 9 || c.linha === 10 ? 7 * P + VAO + (c.linha - 9) * P : -1;
    return y < 0 ? null : { x: MARGEM + (c.coluna - 1) * P, y: MARGEM + y };
  }
  function casa(ctx, x, y, cor) {
    ret(ctx, x, y, P + 1, P + 1, K);
    ret(ctx, x + 1, y + 1, P - 1, P - 1, cor);
    ret(ctx, x + 1, y + 1, P - 1, 1, D.clarear(cor, 0.45));   // luz de cima e da esquerda (ui.md §10.13.1)
    ret(ctx, x + 1, y + 2, 1, P - 2, D.clarear(cor, 0.25));
  }
  // k: px CSS por px de arte. Com k ≥ 4 cada casa leva o símbolo (texto do canvas em múltiplo de 8 px, ui.md §10.9.5)
  function desenharMapa(k, aceso) {
    var c = canvasNitido(W_MAPA, H_MAPA, k), ctx = c.ctx, n = 0, luz = null, letras = [];
    Q.tabela().forEach(function (x) {
      var p = posCasa(x);
      if (!p) return;
      var cor = familia(x.familia).cor;
      casa(ctx, p.x, p.y, cor);
      n++;
      letras.push({ p: p, s: fechado(x.z) ? '?' : x.simbolo, cor: cor });
      if (x.z === aceso) luz = { p: p, cor: cor };
    });
    if (luz) {   // a casa do cartão escolhido acesa: anel de ouro por fora do contorno e a cor mais clara
      ret(ctx, luz.p.x - 2, luz.p.y - 2, P + 5, P + 5, K);
      ret(ctx, luz.p.x - 1, luz.p.y - 1, P + 3, P + 3, D.C.ouro);
      casa(ctx, luz.p.x, luz.p.y, D.clarear(luz.cor, 0.55));
    }
    if (k >= 4) {
      var f = 8 * Math.max(1, Math.round(12 * c.dpr / 8));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.textRendering = 'optimizeSpeed';
      ctx.font = f + 'px "Press Start 2P"'; ctx.textBaseline = 'top';
      letras.forEach(function (l) {
        var w = ctx.measureText(l.s).width, meio = (l.p.x + 1 + (P - 1) / 2) * c.px;
        ctx.fillStyle = claro(l.cor) ? K : PAPEL;
        ctx.fillText(l.s, Math.round(meio - w / 2), Math.round((l.p.y + 1) * c.px + ((P - 1) * c.px - f) / 2));
      });
    }
    c.cv.setAttribute('data-casas', String(n));
    if (luz) c.cv.setAttribute('data-aceso', String(aceso));
    c.cv.setAttribute('aria-hidden', 'true');
    return c.cv;
  }
  T.desenharMapa = desenharMapa;
  // o elemento da casa sob o toque (x, y do cliente), ou 0
  function zNoMapa(cv, ex, ey) {
    var r = cv.getBoundingClientRect(), ax = (ex - r.left) / r.width * W_MAPA, ay = (ey - r.top) / r.height * H_MAPA;
    var achou = Q.tabela().filter(function (x) { var p = posCasa(x); return p && ax >= p.x && ax < p.x + P + 1 && ay >= p.y && ay < p.y + P + 1; })[0];
    return achou ? achou.z : 0;
  }
  function legenda() {
    var fs = Q.familias();
    return el('ul.qt-legenda', Object.keys(fs).map(function (id) {
      return el('li', amostra(fs[id].cor), el('span', hifenizar(fs[id].nome)));
    }));
  }

  /* ---------- aba Tabela: mapa, legenda e cartões ---------- */
  function mostrarTabela(v, focarZ) {
    var caixa = el('div.qt-mapa-caixa');
    var grade = el('div.qt-grade', Q.elementos().map(function (e) {
      var f = fechado(e.z);
      var b = pintar(el('button.qt-cartao' + (f ? '.qt-fechado' : ''), { type: 'button', 'data-z': String(e.z),
        'aria-label': f ? 'Elemento ' + e.z + ', segredo da trilha perfeita' : null },
        el('span.qt-num', String(e.z)), el('span.qt-simb', f ? '?' : e.simbolo), el('span.qt-nome', f ? '?' : nomeCartao(e.nome))), familia(e.familia).cor);
      if (e.z === v.aceso) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () { R.Som.tocar('toque'); v.rolagem = v.pn.conteudo.scrollTop; abrirCartao(v, e.z); });
      // pelo teclado, a casa do cartão com foco acende no mapa
      b.addEventListener('focus', function () { if (UI.porTeclado()) acender(e.z); });
      return b;
    }));
    v.trocar([el('p.qt-dica', 'Cada cor é uma família. Toque num cartão para conhecer o elemento.'), caixa,
      el('h3.qt-sub', 'Os elementos'), grade], null);
    // a escala do mapa pela largura que sobra: 2 no celular, 4 no tablet, 5 no notebook (ao lado, a legenda)
    var k = Math.max(1, Math.min(5, Math.floor(caixa.clientWidth / W_MAPA)));
    var mapa = null;
    function acender(z) {
      var novo = desenharMapa(k, z);
      novo.classList.add('qt-mapa');
      novo.addEventListener('click', function (ev) {
        var zz = zNoMapa(novo, ev.clientX, ev.clientY);
        if (zz && Q.elemento(zz)) { R.Som.tocar('toque'); v.rolagem = v.pn.conteudo.scrollTop; abrirCartao(v, zz); }
      });
      if (mapa) mapa.replaceWith(novo); else caixa.appendChild(novo);
      mapa = novo;
    }
    acender(v.aceso);
    caixa.appendChild(legenda());
    var alvo = focarZ && grade.querySelector('[data-z="' + focarZ + '"]');
    if (alvo) {
      if (v.rolagem != null) v.pn.conteudo.scrollTop = v.rolagem;
      UI.focarTroca(alvo, null, 400);
    }
  }

  /* ---------- a ficha do elemento (no mesmo painel) ---------- */
  // notebook (tela baixa e larga): a ficha em duas colunas, com o mapinha maior ao lado (css/ui-quimica-tabela.css)
  function telaBaixaLarga() { return window.matchMedia('(min-width: 1000px) and (max-height: 820px)').matches; }
  function abrirCartao(v, z) {
    var lista = Q.elementos(), i = -1;
    lista.forEach(function (e, k) { if (e.z === z) i = k; });
    if (i < 0) return;
    var e = lista[i], fam = familia(e.familia), f = fechado(e.z);
    v.aceso = e.z;
    var titulo = el('h3.qt-ficha-nome', f ? 'Segredo' : e.nome);
    var ficha = f ? el('article.qt-ficha.qt-fechado',
      el('div.qt-ficha-topo',
        pintar(el('div.qt-grande', el('span.qt-num', String(e.z)), el('span.qt-grande-simb', '?')), fam.cor),
        el('div.qt-ficha-info', titulo, el('p', 'Número atômico: ', el('b', String(e.z))))),
      el('section.qt-bloco', el('h4', '🔒 Elemento secreto'),
        el('p', hifenizar('Ganhe numa trilha perfeita de Língua Portuguesa.')),
        el('p', 'Sala: ', el('b', nomeDaSala(e.trilha)))),
      el('div.qt-ficha-mapa', el('p.qt-dica', 'A casa dele na tabela:'), desenharMapa(telaBaixaLarga() ? 3 : 2, e.z)))
      : el('article.qt-ficha',
      el('div.qt-ficha-topo',
        pintar(el('div.qt-grande', el('span.qt-num', String(e.z)), el('span.qt-grande-simb', e.simbolo)), fam.cor),
        el('div.qt-ficha-info', titulo,
          el('p', 'Número atômico: ', el('b', String(e.z))),
          el('p.qt-ficha-fam', amostra(fam.cor), el('span', hifenizar(fam.nome))))),
      el('section.qt-bloco', el('h4', 'Onde a gente encontra'), el('p', hifenizar(e.onde || ''))),
      el('section.qt-bloco', el('h4', 'Curiosidade'), paginas(e.curiosidade).map(function (p) { return el('p', hifenizar(p)); })),
      el('div.qt-ficha-mapa', el('p.qt-dica', 'A casa dele na tabela:'), desenharMapa(telaBaixaLarga() ? 3 : 2, e.z)));
    var voltar = rodapeBotao('← Voltar', null, 'btn-secundario');
    var ant = rodapeBotao('◀', 'Elemento anterior', 'btn-secundario.so-seta');
    var prox = rodapeBotao('▶', 'Próximo elemento', 'btn-principal.so-seta');
    function ir(d) { R.Som.tocar('toque'); abrirCartao(v, lista[(i + d + lista.length) % lista.length].z); }
    voltar.addEventListener('click', function () { R.Som.tocar('toque'); R.Som.calar(); mostrarTabela(v, e.z); });
    ant.addEventListener('click', function () { ir(-1); });
    prox.addEventListener('click', function () { ir(1); });
    var foco = document.activeElement, eraSeta = foco && foco.classList && foco.classList.contains('so-seta');
    v.trocar([ficha], [voltar, ant, prox], { ant: ant, prox: prox });
    // pelo teclado: na seta de novo (Enter segue andando), ou no "Voltar"
    UI.focarTroca(eraSeta && foco.getAttribute('aria-label') === 'Elemento anterior' ? ant : eraSeta ? prox : voltar, titulo, 400);
    falar(f ? Q.frase('trilha.elemento') : [e.onde].concat(paginas(e.curiosidade)));
  }
  // o nome da sala de Língua Portuguesa que dá o prêmio (Reino.premioTrilha)
  function nomeDaSala(id) {
    var pt = R.premioTrilha && R.premioTrilha(id), m = pt && R.materia && R.materia(pt.materia);
    var s = m && m.salas.find(function (x) { return x.id === id; });
    return s ? s.nome : String(id || '');
  }
  T.nomeDaSala = nomeDaSala;

  function rodapeBotao(rotulo, aria, classe) {
    return el('button.btn-grande.' + (classe || 'btn-secundario'), { type: 'button', 'aria-label': aria || null }, rotulo);
  }
  T.rodapeBotao = rodapeBotao;

  /* ---------- a tela ---------- */
  // op: { z?: número do cartão aberto, aba?: 'tabela' | 'licoes', licao?: id da lição aberta } (quimica.md §2)
  UI.telaQuimicaTabela = function (op) {
    op = op || {};
    Q = T.Q = R.Quimica;
    var pn = UI.painel('quimica-tabela', '⚛ Cantinho dos Átomos', { curto: '⚛ Átomos' });
    var v = { pn: pn, aceso: 0, rolagem: null, setas: null, rodape: null };
    var abas = {};
    function aba(nome, rotulo) {
      var b = el('button.qt-aba', { type: 'button', role: 'tab', 'data-aba': nome }, rotulo);
      b.addEventListener('click', function () { R.Som.tocar('toque'); R.Som.calar(); v.aba(nome); });
      b.addEventListener('keydown', function (ev) {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
        ev.preventDefault(); ev.stopPropagation();
        var outra = nome === 'tabela' ? 'licoes' : 'tabela';
        v.aba(outra); abas[outra].focus();
      });
      return (abas[nome] = b);
    }
    pn.card.insertBefore(el('div.qt-abas', { role: 'tablist' }, aba('tabela', 'Tabela'), aba('licoes', 'Lições')), pn.conteudo);
    v.aba = function (nome) {
      Object.keys(abas).forEach(function (k) { abas[k].setAttribute('aria-selected', String(k === nome)); });
      v.rolagem = null;
      if (nome === 'licoes') T.mostrarLicoes(v); else mostrarTabela(v);
    };
    // troca o que está no painel: nos (o conteúdo), rodape (botões do rodapé de ação, ou null) e setas (◀ ▶ do teclado)
    v.trocar = function (nos, rodape, setas) {
      pn.conteudo.textContent = '';
      nos.forEach(function (n) { if (n) pn.conteudo.appendChild(n); });
      pn.conteudo.scrollTop = 0;
      if (v.rodape) v.rodape.remove();
      v.rodape = rodape ? el('footer.rodape-acao.qt-rodape', rodape) : null;
      if (v.rodape) pn.card.appendChild(v.rodape);
      v.setas = setas || null;
    };
    // ← → na ficha e na lição (fora das abas e dos campos): anterior e próximo
    pn.tela.addEventListener('keydown', function (ev) {
      if (!v.setas || ev.defaultPrevented || ev.repeat || (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight')) return;
      ev.preventDefault();
      (ev.key === 'ArrowLeft' ? v.setas.ant : v.setas.prox).click();
    });
    if (op.licao && Q.licao(op.licao)) { v.aba('licoes'); T.abrirLicao(v, op.licao); return pn; }
    v.aba(op.aba === 'licoes' ? 'licoes' : 'tabela');
    if (op.z && Q.elemento(op.z)) abrirCartao(v, op.z);
    else falar(Q.frase('tabela.oi'));
    return pn;
  };
})();
