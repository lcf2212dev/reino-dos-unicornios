/* Figuras nas questões do 4º bimestre (docs/contratos/quarto-bimestre.md §12): o desenho de window.ICONES (que falta:
   ❓, sem quebrar), os versos e as figuras do texto de apoio (apoio.partes[].versos / .figuras, desenhados por
   D.caixaApoio) e a figura do desafio (d.figura: { img, legenda? } ou { ilustracao, alt }, abaixo do enunciado, por
   D.render). Não é tipo de desafio: só helpers em Reino._desafios e Reino.Desafios (carregado depois de desafios.js).
     _d.figuraIcone(img, px) → canvas (escala par perto de px) ou '❓'
     _d.estrofes(versos) → [[verso, …], …] ('' separa estrofes)      _d.versosApoio(versos) / _d.figurasLista(lista, classe)
     D.figuraDesafio(figura) → elemento                                 D.conferirFiguras(d, v) / _d.conferirDesenho(img, onde, v) */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;

  // a chave exata ou sem o seletor invisível (U+FE0F: '☀️' acha '☀'), como o validar e o PA.iconeEmoji
  _d.figuraIcone = function (img, px) {
    var desenho = PA.iconeDesenho(img) || PA.iconeDesenho(String(img).replace(/\uFE0F/g, ''));
    return desenho ? PA.paraDOM(desenho, PA.escalaNitida(px || 64, desenho.width)) : '❓';
  };
  _d.estrofes = function (versos) {
    var g = [[]];
    versos.forEach(function (v) { if (v) g[g.length - 1].push(v); else if (g[g.length - 1].length) g.push([]); });
    return g.filter(function (e) { return e.length; });
  };
  // poema do apoio: uma estrofe por parágrafo, um verso por linha
  _d.versosApoio = function (versos) {
    return el('div.apoio-versos', _d.estrofes(versos).map(function (e) {
      return el('p.apoio-estrofe', e.map(function (v) { return el('span.apoio-verso', v); }));
    }));
  };
  // fileira de figuras de 64 px, cada uma com a legenda embaixo
  _d.figurasLista = function (lista, classe) {
    return el('div.' + classe, lista.map(function (f) {
      return el('figure.figura-item',
        el('span.figura-img', { role: 'img', 'aria-label': f.legenda ? U.semEn(f.legenda) : null }, _d.figuraIcone(f.img, 64)),
        f.legenda ? el('figcaption', f.legenda) : null);
    }));
  };

  // ilustração: a maior escala par que cabe na largura da caixa e em 40% da altura da tela, nunca menos de 2 (1 px de
  // arte = 2 px CSS, arte.md §10.1 e §10.7). A que nem em 2× cabe rola por dentro do próprio quadro, como nas cartas
  // do livro: de lado, se for mais larga que a caixa; para baixo, se for mais alta que ROLAR (a fração da tela, nunca
  // menos de alturaMin). A página nunca rola de lado e o enunciado e as opções continuam à mão.
  var ROLAR = { alturaMin: 320, fracaoTela: 0.5 };
  function alturaQuadro() { return Math.max(ROLAR.alturaMin, Math.round(window.innerHeight * ROLAR.fracaoTela)) + 'px'; }
  function ilustracao(f) {
    var c = Reino.canvasIlustracao && Reino.canvasIlustracao(f.ilustracao);
    var area = el('span.desafio-ilustracao', { role: 'img', 'aria-label': f.alt ? U.semEn(f.alt) : null }, c ? null : '❓');
    if (!c) return area;
    function escala(largura) {
      var k = Math.min(Math.floor(largura / c.width), Math.floor(Math.max(160, window.innerHeight * 0.4) / c.height));
      return Math.max(2, k - k % 2);
    }
    var tela = PA.paraDOM(c, escala(Math.min(window.innerWidth - 64, 640)), 'desafio-ilustracao-tela');
    area.appendChild(tela);
    area.style.maxHeight = alturaQuadro();
    function caber() {
      if (!area.isConnected || !area.clientWidth) return;
      var k = escala(area.clientWidth);
      tela.style.width = c.width * k + 'px';
      tela.style.height = c.height * k + 'px';
      area.style.maxHeight = alturaQuadro();
      // quadro que rola ganha moldura: dá para ver que a figura continua lá dentro
      var rola = c.width * k > area.clientWidth || c.height * k > area.clientHeight;
      area.classList.toggle('desafio-ilustracao-rola', rola);
      // o quadro que rola também se alcança pelo teclado (setas rolam a figura)
      if (rola) area.setAttribute('tabindex', '0'); else area.removeAttribute('tabindex');
    }
    if (window.ResizeObserver) new ResizeObserver(caber).observe(area);
    return area;
  }
  D.figuraDesafio = function (f) {
    if (!f.ilustracao) return _d.figurasLista([f], 'desafio-figura');
    return el('div.desafio-figura', el('figure.figura-item', ilustracao(f), f.legenda ? el('figcaption', f.legenda) : null));
  };

  /* Conferência (sem DOM, no Node). Desenho que falta: aviso na sala (aparece ❓), erro na prova.
     D.conferirFiguras: as figuras comuns a todo desafio (d.figura e apoio.partes[].figuras), para o validar-conteudo
     (checarNovos) chamar com v.ilustracao = Reino.ilustracao do jogo inteiro: ilustração que não existe é erro. */
  _d.conferirDesenho = function (img, onde, v) {
    if (!v.textoOk(img)) { v.checar(false, onde + ': figura sem img'); return; }
    if (v.icones[img] || v.icones[String(img).replace(/\uFE0F/g, '')]) return;
    if (v.naProva) v.checar(false, onde + ': falta o desenho "' + img + '" em ICONES');
    else v.avisar(onde + ': falta o desenho "' + img + '" em ICONES (aparece ❓)');
  };
  D.conferirFiguras = function (d, v) {
    var f = d.figura;
    if (f !== undefined && !(f && typeof f === 'object')) v.checar(false, d.id + ': figura precisa de img ou ilustracao');
    else if (f && f.ilustracao !== undefined) {
      v.checar(v.textoOk(f.ilustracao) && v.textoOk(f.alt) && f.img === undefined, d.id + ': figura com ilustracao precisa de alt (e sem img)');
      if (v.ilustracao && v.textoOk(f.ilustracao)) v.checar(!!v.ilustracao(f.ilustracao), d.id + ': ilustração "' + f.ilustracao + '" não registrada (Reino.registrarIlustracao)');
    } else if (f) _d.conferirDesenho(f.img, d.id + ': figura', v);
    if (f && f.legenda !== undefined) v.checar(v.textoOk(f.legenda), d.id + ': legenda da figura vazia');
    ((d.apoio && d.apoio.partes) || []).forEach(function (p, i) {
      (Array.isArray(p.figuras) ? p.figuras : []).forEach(function (fig, j) {
        if (fig) _d.conferirDesenho(fig.img, d.id + ': apoio, parte ' + (i + 1) + ', figura ' + (j + 1), v);
      });
    });
  };
})();
