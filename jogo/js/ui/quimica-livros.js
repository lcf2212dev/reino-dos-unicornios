/* Laboratório de Química, 2º andar: a Estante dos livros (Biblioteca da Química) (Reino.UI.telaQuimicaLivros), parte 1 de 2.
   Contrato: docs/contratos/quimica.md §2 e §9. Painel DOM (UI.painel), aberto na hora, com Esc/✕.
   A estante (os 8 livros, com ✔ nos lidos e "Lidos: n de 8") e o livro aberto, página por página (◀ ▶, ← →), com o
   desenho pixel art do campo `desenho` (parte 2) e a voz do Professor Carbono (Reino.Quimica.vozDe('livros')).
   Chegar à última página grava a descoberta (Reino.Quimica.descobrir('livros', id)) e dá a estrela da 1ª vez.
   Sem animação: cada página desenha o quadro final. Cria o interno Reino._quimicaLivros:
     el, ret, canvasNitido(wArte, hArte, k); a parte 2 acrescenta desenhos (chave → função) e desenho(chave, pagina). */
(function () {
  var R = window.Reino, U = R.util, el = U.el, D = R.Desenho, UI = R.UI;
  var Q = null;   // Reino.Quimica (sistemas/, carrega depois de ui/): lido ao abrir a tela
  var T = R._quimicaLivros = { el: el, ret: D.ret };
  var PAPEL = (R.config.paleta && R.config.paleta.papel) || '#fff8ee';
  // a cor da lombada de cada livro (a capa usa um tom clarinho dela)
  var CAPA = { cozinha: D.C.laranja, ar: D.C.azul, fogo: D.C.vermelho, ferrugem: D.C.terracota, agua: D.C.agua3,
    planta: D.C.folha, corpo: D.C.rosa, cientistas: D.C.roxo };

  function hifenizar(s) { return R._ui.hifenizar(s); }   // ui/pecas.js (arte.md §17)
  function paginas(x) { return !x ? [] : Array.isArray(x) ? x.slice() : [x]; }
  function falar(ps) { ps = paginas(ps); if (ps.length) R.Som.falar(ps, { voz: Q.vozDe('livros') }); }

  /* Canvas nítido: desenha em px de arte, cada um vira k px CSS (k × dpr px de aparelho, inteiro). */
  T.canvasNitido = function (wArte, hArte, k) {
    var dpr = Math.max(1, Math.round(window.devicePixelRatio || 1)), cv = el('canvas.ql-canvas');
    cv.width = wArte * k * dpr; cv.height = hArte * k * dpr;
    cv.style.width = wArte * k + 'px'; cv.style.height = hArte * k + 'px';
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
    return { cv: cv, ctx: ctx };
  };

  function botao(rotulo, aria, classe) {
    return el('button.btn-grande.' + (classe || 'btn-secundario'), { type: 'button', 'aria-label': aria || null }, rotulo);
  }

  /* ---------- a estante ---------- */
  function mostrarEstante(v, focarId) {
    var ls = Q.livros(), n = R.config.quimica.estrelasLivroNovo;
    var grade = el('div.ql-estante', ls.map(function (l) {
      var lido = Q.descoberto('livros', l.id);
      var b = el('button.ql-livro' + (lido ? '.lido' : ''), { type: 'button', 'data-livro': l.id },
        el('span.ql-livro-emoji', l.emoji || '📖'), el('span.ql-livro-nome', hifenizar(l.titulo)),
        el('span.chip-mini.ql-livro-estado', lido ? '✔ Lido' : '+' + n + ' ⭐'));
      var cor = CAPA[l.id] || D.C.lilas;
      b.style.setProperty('--ql-cor', cor);
      b.style.setProperty('--ql-fundo', D.misturar(cor, PAPEL, 0.8));
      b.addEventListener('click', function () { R.Som.tocar('toque'); abrirLivro(v, l.id); });
      return b;
    }));
    var c = Q.contagem().livros;
    v.trocar([el('p.ql-contagem', 'Lidos: ', el('b', c.feitas + ' de ' + c.total)), grade], null);
    var alvo = focarId && grade.querySelector('[data-livro="' + focarId + '"]');
    if (alvo) UI.focarTroca(alvo, null, 400);
  }

  /* ---------- o livro, página por página ---------- */
  function abrirLivro(v, id, pagina) {
    var l = Q.livro(id);
    if (!l) return;
    var pags = paginas(l.paginas), n = pags.length || 1, ganhou = false;
    var i = Math.max(0, Math.min(n - 1, (pagina | 0) - 1));
    var titulo = el('h3.ql-titulo', (l.emoji ? l.emoji + ' ' : '') + l.titulo);
    var texto = el('p.ql-texto'), selo = el('p.ql-selo', { hidden: true });
    var quadro = el('div.ql-quadro');
    var voltar = botao(['←', el('span.rotulo-longo', ' Estante')], 'Voltar para a estante', 'btn-secundario.ql-voltar');
    var ant = botao('◀', 'Página anterior', 'btn-secundario.so-seta');
    var prox = botao('▶', 'Próxima página', 'btn-principal.so-seta');
    var pag = el('span.ql-pag');
    voltar.addEventListener('click', function () { R.Som.tocar('toque'); R.Som.calar(); mostrarEstante(v, l.id); });
    ant.addEventListener('click', function () { if (i > 0) { i--; R.Som.tocar('toque'); mostrar(); } });
    prox.addEventListener('click', function () { if (i < n - 1) { i++; R.Som.tocar('toque'); mostrar(); } });
    function mostrar() {
      quadro.textContent = '';
      var d = T.desenho && T.desenho(l.desenho, i);
      if (d) quadro.appendChild(d);
      U.preencher(texto, hifenizar(pags[i] || ''));
      pag.textContent = '';
      pag.appendChild(el('span.rotulo-longo', 'Página '));
      pag.appendChild(document.createTextNode((i + 1) + ' de ' + n));
      ant.setAttribute('aria-disabled', String(i === 0));
      prox.setAttribute('aria-disabled', String(i === n - 1));
      var fala = [pags[i]];
      selo.hidden = !(ganhou && i === n - 1);   // o selo só na última página
      if (i === n - 1 && !ganhou) {   // chegou ao fim: a descoberta (e a estrela da 1ª vez)
        var r = Q.descobrir('livros', l.id);
        if (r.nova) {
          ganhou = true;
          U.preencher(selo, 'Livro lido! +' + r.estrelas + ' ⭐');
          selo.hidden = false;
          R.Som.tocar('estrela');
          UI.festa(1, { item: selo });
          if (UI.estrelaVoa) UI.estrelaVoa(selo);
          fala = fala.concat(Q.frase('livros.lido'));
          var ct = Q.contagem().livros;
          if (ct.feitas === ct.total) fala = fala.concat(Q.frase('livros.todos'));
        }
      }
      falar(fala);
    }
    v.trocar([el('article.ql-pagina', titulo, quadro, texto, selo)],
      [voltar, el('div.ql-nav', ant, pag, prox)], { ant: ant, prox: prox });
    v.livro = l;
    mostrar();
    UI.focarTroca(prox, titulo, 400);
  }

  /* ---------- a tela ---------- */
  // op: { livro?: id do livro aberto, pagina?: n (1 = a primeira) } (quimica.md §2)
  UI.telaQuimicaLivros = function (op) {
    op = op || {};
    Q = R.Quimica;
    var pn = UI.painel('quimica-livros', '📚 Biblioteca da Química', { curto: '📚 Livros' });
    var v = { pn: pn, setas: null, rodape: null };
    // troca o que está no painel: nos (o conteúdo), rodape (botões do rodapé de ação, ou null) e setas (◀ ▶ do teclado)
    v.trocar = function (nos, rodape, setas) {
      pn.conteudo.textContent = '';
      nos.forEach(function (x) { if (x) pn.conteudo.appendChild(x); });
      pn.conteudo.scrollTop = 0;
      if (v.rodape) v.rodape.remove();
      v.rodape = rodape ? el('footer.rodape-acao.ql-rodape', rodape) : null;
      if (v.rodape) pn.card.appendChild(v.rodape);
      v.setas = setas || null;
    };
    // ← → no livro aberto: página anterior e próxima
    pn.tela.addEventListener('keydown', function (ev) {
      if (!v.setas || ev.defaultPrevented || ev.repeat || (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight')) return;
      ev.preventDefault();
      (ev.key === 'ArrowLeft' ? v.setas.ant : v.setas.prox).click();
    });
    if (op.livro && Q.livro(op.livro)) { abrirLivro(v, op.livro, op.pagina); return pn; }
    mostrarEstante(v);
    falar(Q.frase('livros.oi'));
    return pn;
  };
})();
