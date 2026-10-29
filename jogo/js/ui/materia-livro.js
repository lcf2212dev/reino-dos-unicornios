/* Livro da matéria (parte de js/ui/materia.js, que vem antes): o desenho e a fala de uma carta (a antiga, só texto,
   em blocos curtos; a rica do 4º bimestre, com versos, listas, quadros, tabelas, figuras, ilustrações e o cabeçalho
   "📗 Livro de Aprendizagem • p. 5") e o livro pela estante (marcas, ← n de N →; com os dois livros da escola, uma aba
   para cada). Registra UI.desenharCarta, UI.falaCarta, UI.blocosCarta, UI.termoCarta e UI.abrirLivro.
   Ilustração: sempre em escala inteira e par, ≥ 2; no celular, arte de até 152 px de largura cabe sem rolar (a mais
   larga sai em 2× e rola de lado dentro do próprio quadro; ajustarIlustracao).
   Usa de Reino._ui o livroEscolar (materia.js). Contrato: docs/contratos/quarto-bimestre.md §4. */
(function () {
  var U = Reino.util, el = U.el;
  var UI = Reino.UI, R = Reino._ui;
  var painel = R.painel;
  // terminação com hífen ("-inho", "→ -zinha"): fica num span que não quebra, o hífen não sobra no fim da linha
  function hifenizar(t) {
    var partes = String(t).split(/((?:^|(?<=[\s(→–—]))-\p{L}+)/u);
    if (partes.length === 1) return R.hifenizar(t);
    return partes.filter(Boolean).map(function (p) { return /^-\p{L}/u.test(p) ? el('span.sem-quebra', p) : R.hifenizar(p); });
  }
  // ilustração da carta: até 360 px CSS de altura (e 40 % da tela) e até 6 px CSS por pixel da arte
  var ILUSTRACAO = { alturaMax: 360, fracaoTela: 0.4, escalaMax: 6 };

  // o texto vira blocos de até 3 frases (só na tela: a fala continua sendo c.texto inteiro)
  var FRASE = /[.!?…]["”»)]?\s+(?=["“«(]?[A-ZÁÉÍÓÚÂÊÔÃÕÀÇ0-9])/g;
  function blocosCarta(texto) {
    var frases = [], ini = 0, m, alvo = texto.replace(/«[^«»]*?([.!?…]?»)/g, function (m, fim) { return '«' + m.slice(1, -fim.length).replace(/./g, 'X') + fim; });
    FRASE.lastIndex = 0; // só corta fora do «inglês» (ou logo depois dele)
    while ((m = FRASE.exec(alvo))) { frases.push(texto.slice(ini, m.index + m[0].length).trim()); ini = m.index + m[0].length; }
    frases.push(texto.slice(ini));
    var n = Math.ceil(frases.length / 3), tam = Math.ceil(frases.length / n), out = [];
    for (var j = 0; j < frases.length; j += tam) out.push(frases.slice(j, j + tam).join(' '));
    return out;
  }
  // termo destacado: c.destaque ou a palavra mais longa do título que aparece no texto
  var PALAVRA = '[A-Za-zÀ-ÿ]';
  // trecho «inglês» vira '#' (mesmo tamanho): o destaque nunca corta o span.en
  function semIngles(t) { return t.replace(/«[^«»]*»/g, function (m) { return m.replace(/./g, '#'); }); }
  function termoCarta(c) {
    var cands = c.destaque ? [c.destaque] : c.titulo.split(/[^A-Za-zÀ-ÿ]+/)
      .filter(function (w) { return w.length >= 4; }).sort(function (a, b) { return b.length - a.length; });
    for (var k = 0; k < cands.length; k++) {
      var m = new RegExp('(^|[^A-Za-zÀ-ÿ])(' + cands[k] + PALAVRA + '{0,2})(?![A-Za-zÀ-ÿ])', 'i').exec(semIngles(c.texto));
      if (m) return m[2];
    }
    return null;
  }
  UI.blocosCarta = blocosCarta; UI.termoCarta = termoCarta;

  /* ---------- cartas ricas: os blocos do livro da escola (quarto-bimestre.md §4) ---------- */
  // item de lista ou de quadro: o termo em destaque pela cor (a fonte não tem negrito) e o texto
  function itemLista(i) { return el('li' + ((!i.termo && /^\s*([a-z]\)|\d+[.)]|[■•])\s/.test(i.texto)) || /^\s*(\d+[.)]?|[a-z]\))\s*$/.test(i.termo || '') ? '.sem-marca' : ''), i.termo ? [el('b.lista-termo', hifenizar(i.termo)), ' '] : null, hifenizar(i.texto)); }
  // figura: desenho de window.ICONES ('lp:moinho' ou emoji) num quadro de 64 px, na maior escala par que cabe nele
  // (arte.md §10.7): 16×16 em 4× e 32×32 em 2×, todas do mesmo tamanho na fileira; sem desenho, o emoji ou ❓
  var FIGURA = 64;
  function iconeFigura(img) {
    var d = PA.iconeDesenho(String(img).replace(/\uFE0F/g, ''));
    var c = d ? PA.paraDOM(d, 2, 'icone-px') : PA.iconeEmoji(/^[a-z0-9-]+:/i.test(img) ? '❓' : img, 2);
    var e = Math.floor(FIGURA / Math.max(c.width, c.height));
    e = Math.max(2, e - e % 2);
    c.style.width = (c.width * e) + 'px';
    c.style.height = (c.height * e) + 'px';
    return c;
  }
  // ilustração: escala inteira e par, nunca menos de 2 (1 px de arte = 2 px CSS, arte.md §10.1 e §10.7): a maior
  // que cabe na largura e na altura máxima, até escalaMax. Arte mais larga que a metade da largura útil sai em 2× e
  // rola de lado dentro do próprio quadro (.bloco-ilustracao; a página nunca). Largura útil da carta no celular
  // (390 px): 306 px no livro e 334 no resumo da sala, então arte de até 152 px de largura cabe sem rolar.
  function ajustarIlustracao(caixa, cv, src) {
    var ro = null;
    function medir() {
      if (!caixa.isConnected) { if (ro) ro.disconnect(); return; }
      var alt = Math.min(ILUSTRACAO.alturaMax, window.innerHeight * ILUSTRACAO.fracaoTela);
      var e = Math.min(Math.floor(caixa.clientWidth / src.width), Math.floor(alt / src.height), ILUSTRACAO.escalaMax);
      e = Math.max(2, e - e % 2);
      cv.style.width = src.width * e + 'px'; cv.style.height = src.height * e + 'px';
    }
    if (window.ResizeObserver) { ro = new ResizeObserver(medir); ro.observe(caixa); }
    setTimeout(medir, 0);   // a 1ª medida assim que a carta entra na tela (também no jogo congelado, sem quadros)
  }
  var BLOCOS = {
    texto: function (b) { return el('p.bloco-texto', hifenizar(b.texto)); },
    // travessão de diálogo em destaque; quem fala fica só no dado (as questões do livro perguntam quem disse)
    fala: function (b) {
      return el('p.bloco-fala', { 'data-quem': b.quem || null }, el('span.fala-travessao', '—'), ' ', hifenizar(b.texto.replace(/^\s*[—–-]\s*/, '')));
    },
    // '' separa as estrofes; cada verso numa linha (o que não cabe continua recuado)
    versos: function (b) {
      var estrofes = [[]];
      b.versos.forEach(function (v) {
        var atual = estrofes[estrofes.length - 1];
        if (v.trim()) atual.push(v); else if (atual.length) estrofes.push([]);
      });
      return el('div.bloco-versos', estrofes.filter(function (e) { return e.length; }).map(function (e) {
        return el('p.estrofe', e.map(function (v) { return el('span.verso', hifenizar(v)); }));
      }));
    },
    lista: function (b) { return el('ul.bloco-lista', b.itens.map(itemLista)); },
    // quadro do livro ("CONVERSA VAI...", "ORGANIZANDO O CONHECIMENTO"): borda e título numa faixa
    quadro: function (b) {
      return el('section.bloco-quadro', b.titulo ? el('h4.quadro-titulo', b.titulo) : null,   // título: quebra só entre palavras
        b.texto ? el('p.bloco-texto', hifenizar(b.texto)) : null,
        b.itens && b.itens.length ? el('ul.bloco-lista', b.itens.map(itemLista)) : null);
    },
    // de 3 colunas em diante, no celular cada linha vira uma caixinha "Cabeçalho: valor" (data-cab, no CSS)
    tabela: function (b) {
      var cab = b.cab || [], larga = (b.linhas[0] || []).length >= 3;
      return el('table.bloco-tabela' + (larga ? '.tabela-larga' : ''),
        cab.length ? el('thead', el('tr', cab.map(function (t) { return el('th', { scope: 'col' }, hifenizar(t)); }))) : null,
        el('tbody', b.linhas.map(function (l) {
          return el('tr', l.map(function (t, k) { return el('td', { 'data-cab': cab[k] || null }, hifenizar(t)); }));
        })));
    },
    figuras: function (b) {
      return el('div.bloco-figuras', b.itens.map(function (f) {
        return el('figure.bloco-figura', iconeFigura(f.img), f.legenda ? el('figcaption', hifenizar(f.legenda)) : null);
      }));
    },
    ilustracao: function (b) {
      var src = Reino.canvasIlustracao(b.id), caixa = el('div.bloco-ilustracao', { role: 'img', 'aria-label': b.alt || null });
      if (!src) return caixa;
      var cv = PA.paraDOM(src, 2, 'ilustracao-px');
      caixa.appendChild(cv);
      ajustarIlustracao(caixa, cv, src);
      return caixa;
    },
    fonte: function (b) { return el('p.bloco-fonte', hifenizar(b.texto)); },
  };
  // "📗 Livro de Aprendizagem • p. 5": o livro da escola e a página impressa (a matéria pelo livro, se não vier)
  function cabecalhoCarta(c, materia) {
    var m = materia || Reino.materias.find(function (x) { return (x.livro || []).indexOf(c) >= 0; });
    var L = R.livroEscolar(m, c.livroOrigem), pag = typeof c.pagina === 'number';
    if (!L && !pag) return null;
    return el('div.carta-livro', L ? L.emoji : null, el('span.carta-livro-texto', L ? L.nome + ' ' : null,
      pag ? el('span.carta-livro-pag', (L ? '• ' : '') + (c.pagina === 0 ? 'página sem número' : 'p.\u00a0' + c.pagina)) : null));
  }

  // desenho de uma carta (o livro pela estante e o resumo antes das questões da sala); materia: opcional (o cabeçalho)
  UI.desenharCarta = function (area, c, materia) {
    area.innerHTML = '';
    var rica = !!(c.blocos || c.livroOrigem || typeof c.pagina === 'number');
    area.classList.toggle('carta-rica', rica);
    if (rica) {   // a rica: o cabeçalho do livro e o ícone na linha do título (cabe mais texto sem rolar)
      var cab = cabecalhoCarta(c, materia);
      if (cab) area.appendChild(cab);
      // o travessão do título ("O Gato de Botas – Parte 1") fica colado à palavra de antes
      area.appendChild(el('h3', el('span.carta-titulo-emoji', c.e), R.hifenizar(c.titulo).replace(/ ([–—]) /g, '\u00a0$1 ')));
    } else {
      area.appendChild(el('div.livro-emoji', c.e));
      area.appendChild(el('h3', c.titulo));
    }
    // figuras: fileira de ícones das coisas que a carta lista (D7-16); só desenho, a fala não muda
    if (c.figuras && c.figuras.length) {
      area.appendChild(el.apply(null, ['div.livro-figuras'].concat(c.figuras.map(function (f) { return el('span.livro-figura', f); }))));
    }
    if (c.blocos) {
      c.blocos.forEach(function (b) { if (BLOCOS[b.t]) area.appendChild(BLOCOS[b.t](b)); });
      return;
    }
    var termo = termoCarta(c);
    blocosCarta(c.texto).forEach(function (b) {
      var i = termo ? semIngles(b).indexOf(termo) : -1;
      if (i < 0) { area.appendChild(el('p', b)); return; }
      area.appendChild(el('p', b.slice(0, i), el('span.destaque', termo), b.slice(i + termo.length)));
      termo = null; // só a primeira vez
    });
  };
  UI.falaCarta = function (c) { return Reino.Falas.segmentosCarta(c); };

  /* ---------- o livro pela estante ---------- */
  // matéria com `livros` (os da escola): os livros que têm cartas, na ordem de `livros`; [] sem `livros`
  function livrosComCartas(materia) {
    return Object.keys(materia.livros || {}).map(function (k) { return R.livroEscolar(materia, k); })
      .filter(function (L) { return materia.livro.some(function (c) { return c.livroOrigem === L.chave; }); });
  }
  // livroOrigem: em qual livro abrir (ação de NPC ou objeto); a carta pedida (cartaoId) manda mais: abre no livro dela
  UI.abrirLivro = function (materia, cartaoId, livroOrigem) {
    if (Reino.Bimestres.emEspera(materia)) return Reino.Bimestres.painel(materia.nome, { materia: materia });
    // com os livros da escola o nome é comprido ("Livros de Língua Portuguesa"): no celular, o curto (arte.md §21.1)
    var titulo = '📖 ' + UI.nomeLivro(materia), curto = materia.livros && titulo !== '📖 Meus Livros' ? '📖 Meus Livros' : null;
    var pn = painel('livro', titulo, { materia: materia, curto: curto });
    // livro ainda sem cartas: o aviso, sem quebrar
    if (!(materia.livro || []).length) { pn.conteudo.appendChild(el('p.aviso', 'Este livro ainda não tem páginas.')); return; }
    var livros = livrosComCartas(materia);
    var pedida = materia.livro.find(function (c) { return c.id === cartaoId; });
    var atual = livros.length ? (livros.find(function (L) { return L.chave === (pedida ? pedida.livroOrigem : livroOrigem); }) || livros[0]).chave : null;
    var onde = {};   // carta aberta em cada livro (trocar de aba e voltar não perde o lugar)
    var cartas = atual ? materia.livro.filter(function (c) { return c.livroOrigem === atual; }) : materia.livro;
    var i = Math.max(0, cartas.indexOf(pedida));
    var area = el('div.livro-carta');
    var ant = el('button.btn-grande.btn-secundario', { type: 'button', 'aria-label': 'Carta anterior' }, '←');
    var prox = el('button.btn-grande.btn-secundario', { type: 'button', 'aria-label': 'Próxima carta' }, '→');
    var ouvir = el('button.btn-grande.btn-principal.so-seta', { type: 'button', 'aria-label': 'Ouvir' }, '🔊', el('span.rotulo-longo', ' Ouvir'));
    var pag = el('span.livro-pag');
    // índice (D7-12): uma fileira rolável com o ícone de cada carta (as do livro escolhido); 1 toque leva a ela
    var nav = el('nav.livro-indice', { 'aria-label': 'Cartas do livro' }), marcas = [];
    function montarIndice() {
      marcas = cartas.map(function (c, k) {
        var m = el('button.livro-marca', { type: 'button', 'aria-label': 'Carta ' + (k + 1) + ': ' + c.titulo + (typeof c.pagina === 'number' ? (c.pagina === 0 ? ', página sem número' : ', página ' + c.pagina) : '') }, c.e);
        m.addEventListener('click', function () { if (k !== i) { i = k; Reino.Som.tocar('toque'); mostrar(); } });
        return m;
      });
      nav.textContent = '';
      marcas.forEach(function (m) { nav.appendChild(m); });
    }
    function mostrar() {
      var c = cartas[i];
      onde[atual] = i;
      UI.desenharCarta(area, c, materia);
      marcas.forEach(function (m, k) { m.classList.toggle('atual', k === i); if (k === i) m.setAttribute('aria-current', 'true'); else m.removeAttribute('aria-current'); });
      var mi = marcas[i], fila = mi.parentNode;   // a marca atual à vista na fileira, sem animação
      if (fila && (mi.offsetLeft < fila.scrollLeft || mi.offsetLeft + mi.offsetWidth > fila.scrollLeft + fila.clientWidth)) fila.scrollLeft = mi.offsetLeft - 8;
      pag.textContent = (i + 1) + ' de ' + cartas.length;
      // livro de 100 cartas ou mais: no celular a contagem desce um degrau para caber entre as setas (ui-livro-blocos.css)
      pag.classList.toggle('livro-pag-longa', cartas.length >= 100);
      ant.disabled = i === 0; prox.disabled = i === cartas.length - 1;
      pn.conteudo.scrollTop = 0; // carta nova abre do topo
      Reino.Voz.carregar(Reino.Falas.pacoteCarta(materia, c));   // o pacote da carta (por capítulo nas de livro)
      Reino.Som.calar();
    }
    ant.addEventListener('click', function () { if (i > 0) { i--; Reino.Som.tocar('toque'); mostrar(); } });
    prox.addEventListener('click', function () { if (i < cartas.length - 1) { i++; Reino.Som.tocar('toque'); mostrar(); } });
    ouvir.addEventListener('click', function () { Reino.Voz.carregar(Reino.Falas.pacoteCarta(materia, cartas[i])).then(function () { Reino.Som.falar(UI.falaCarta(cartas[i]), { voz: 'narradora' }); }); });
    // os dois livros da escola: uma aba para cada ("📗 Aprendizagem", "📒 Atividades"); ← → passam de uma à outra
    if (livros.length > 1) {
      var abas = livros.map(function (L, k) {
        var b = el('button.livro-aba', { type: 'button', role: 'tab', 'aria-label': L.nome, 'data-livro': L.chave }, L.emoji, el('span.livro-aba-nome', ' ' + L.curto));
        b.addEventListener('click', function () { if (L.chave !== atual) { Reino.Som.tocar('toque'); trocarLivro(L.chave); } });
        b.addEventListener('keydown', function (ev) {
          if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
          ev.preventDefault(); ev.stopPropagation();
          var outra = abas[(k + (ev.key === 'ArrowRight' ? 1 : abas.length - 1)) % abas.length];
          outra.click(); outra.focus();
        });
        return b;
      });
      var trocarLivro = function (chave) {
        atual = chave;
        cartas = materia.livro.filter(function (c) { return c.livroOrigem === chave; });
        i = onde[chave] || 0;
        marcarAbas();
        montarIndice();
        mostrar();
      };
      var marcarAbas = function () {
        abas.forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-livro') === atual)); });
      };
      marcarAbas();
      pn.card.insertBefore(el('div.livro-abas', { role: 'tablist', 'aria-label': 'Livros' }, abas), pn.conteudo);
    }
    montarIndice();
    pn.card.insertBefore(nav, pn.conteudo);
    pn.conteudo.appendChild(area);
    // ← n de N → e o 🔊 Ouvir no rodapé de ação do painel, fora da carta que rola: sempre no mesmo lugar (arte.md §20)
    pn.card.appendChild(el('footer.rodape-acao.livro-rodape', el('div.livro-nav', ant, pag, prox),
      Reino.Som.temVoz() ? el('div.intro-botoes', ouvir) : null));
    mostrar();
  };
})();
