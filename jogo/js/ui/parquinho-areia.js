/* Parquinho: a caixa de areia de perto, Reino.UI.telaParquinhoAreia() (docs/contratos/parquinho.md). Abre no fim da
   pose 'areia' (interiores/parquinho/poses-areia.js). O palco é um canvas de Reino.ParquinhoAreia.W × H px de arte em
   ampliação inteira e par (2 a 8 px CSS por pixel, o maior que cabe), desenhado por A.desenhar
   (interiores/parquinho/areia-desenho.js) com as regras de areia-caixa.js. Ferramentas: Cavar (pazinha), Castelo
   (balde), Amontoar (mão) e Alisar (rastelo); enfeites: concha, estrela-do-mar, bandeirinha e florzinha.
   Tocar ou arrastar no palco usa a ferramenta. Pelo teclado: o palco entra no Tab, as setas movem o cursor e
   Enter/Espaço usam (segurar e mover arrasta). ✕, tocar fora e Esc fecham (UI.painel).
   Desenha na hora de cada mudança; rAF só enquanto um efeito anda (grãos, risadinha). Nada vai para o save. */
(function () {
  var R = window.Reino, U = R.util, el = U.el, UI = R.UI;
  var FERRAMENTAS = [
    { id: 'cavar', rotulo: 'Cavar', icone: 'parquinho:pazinha' },
    { id: 'castelo', rotulo: 'Castelo', icone: 'parquinho:balde' },
    { id: 'amontoar', rotulo: 'Amontoar', icone: '✋' },
    { id: 'alisar', rotulo: 'Alisar', icone: 'parquinho:rastelo' },
  ];
  var ENFEITES = [
    { tipo: 'concha', rotulo: 'Concha', nome: 'Conchinha', icone: '🐚' },
    { tipo: 'estrela', rotulo: 'Estrela', nome: 'Estrela-do-mar', icone: 'parquinho:estrela-do-mar' },
    { tipo: 'bandeira', rotulo: 'Bandeira', nome: 'Bandeirinha', icone: 'parquinho:bandeirinha' },
    { tipo: 'flor', rotulo: 'Flor', nome: 'Florzinha', icone: '🌼' },
  ];
  var SETAS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  var CONTINUAS = { cavar: 1, amontoar: 1, alisar: 1 };
  var GRAOS = { cavar: 1, amontoar: 1 };
  var escolha = { ferr: 'castelo', tipo: null };   // a ferramenta da última vez (até fechar o jogo)

  function agora() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function icone(chave) {
    var c = PA.iconeEmoji(chave, 2);
    c.classList.add('areia-icone'); c.setAttribute('aria-hidden', 'true');
    return c;
  }

  UI.telaParquinhoAreia = function () {
    var A = R.ParquinhoAreia, AR = A.AREIA;
    var pn = UI.painel('parquinho-areia', 'Caixa de areia', { icone: 'parquinho:balde', curto: 'Areia', aoFechar: fechou });
    var tela = pn.tela;
    var cv = el('canvas.areia-palco', { width: A.W, height: A.H, tabindex: '0',
      'aria-label': 'A areia. Use as setas para andar e o Enter para usar a ferramenta.' });
    var caixa = el('div.areia-caixa', cv);
    var grupoFerr = el('div.areia-ferramentas', { role: 'group', 'aria-label': 'Ferramentas' });
    var grupoEnf = el('div.areia-enfeites', { role: 'group', 'aria-label': 'Enfeites' });
    var lado = el('div.areia-lado', grupoFerr, grupoEnf);
    var raiz = el('div.areia', caixa, lado);
    pn.conteudo.appendChild(raiz);
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    /* ---------- as ferramentas ---------- */
    var botoes = [];
    function botao(grupo, rotulo, nome, ic, ferr, tipo) {
      var b = el('button.areia-btn', { type: 'button', 'aria-label': nome, 'aria-pressed': 'false', 'data-ferr': ferr, 'data-tipo': tipo || '' },
        icone(ic), el('span.areia-rotulo', { 'aria-hidden': 'true' }, rotulo));
      b.addEventListener('click', function () {
        escolha = { ferr: ferr, tipo: tipo || null };
        R.Som.tocar('toque');
        marcar();
      });
      grupo.appendChild(b); botoes.push(b);
    }
    FERRAMENTAS.forEach(function (f) { botao(grupoFerr, f.rotulo, f.rotulo, f.icone, f.id); });
    ENFEITES.forEach(function (e) { botao(grupoEnf, e.rotulo, e.nome, e.icone, 'enfeite', e.tipo); });
    function marcar() {
      botoes.forEach(function (b) {
        var sim = b.dataset.ferr === escolha.ferr && (b.dataset.tipo || null) === (escolha.tipo || null);
        b.setAttribute('aria-pressed', String(sim));
      });
      raiz.dataset.ferramenta = escolha.ferr + (escolha.tipo ? ':' + escolha.tipo : '');
    }

    /* ---------- desenhar ---------- */
    var sprites = {}, risadas = {}, efeitos = [], raf = 0, cursor = { x: AR.x + AR.w / 2, y: AR.y + AR.h / 2 - 8 }, comCursor = false;
    try { sprites = { ela: R._predios.parquinho.H.ela(true, 'frente'), uni: R._predios.parquinho.H.uni('frente') }; } catch (e) { console.error(e); }
    function vivo() { return tela.isConnected && !tela.classList.contains('saindo'); }
    function desenhar() {
      raf = 0;
      if (!vivo()) { soltarTudo(); return; }
      var t = agora(), anima = U.animar();
      efeitos = efeitos.filter(function (f) { return t - f.t0 < 350; });
      A.desenhar(ctx, { t: t, animar: anima, sprites: sprites, risadas: risadas, efeitos: anima ? efeitos : [], cursor: comCursor ? cursor : null });
      var segue = anima && (efeitos.length || Object.keys(risadas).some(function (q) { return t - risadas[q] < 1200; }));
      if (segue) raf = requestAnimationFrame(desenhar);
      cv.dataset.quadro = String(A.estado().versao);
    }
    function pedir() { if (raf) { cancelAnimationFrame(raf); raf = 0; } desenhar(); }

    /* ---------- usar a ferramenta ---------- */
    var ultimoSom = 0;
    function resultado(r, p, continua) {
      var t = agora();
      if (r.som && (!continua || r.risada || t - ultimoSom > 220)) { R.Som.tocar(r.som); ultimoSom = t; }
      if (r.risada) risadas[r.risada] = t;
      if (r.mudou && GRAOS[escolha.ferr] && U.animar()) { efeitos.push({ x: p.x, y: p.y, t0: t }); if (efeitos.length > 8) efeitos.shift(); }
      pedir();
    }
    function comecar(p) { resultado(A.comecar(escolha.ferr, p.x, p.y, escolha.tipo), p, false); }
    function mover(p) { if (CONTINUAS[escolha.ferr]) resultado(A.mover(p.x, p.y), p, true); }

    // toque e mouse: o ponto em px de arte (o canvas está ampliado pelo CSS)
    var toque = null;
    function ponto(e) {
      var r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * A.W, y: (e.clientY - r.top) / r.height * A.H };
    }
    cv.addEventListener('pointerdown', function (e) {
      if ((e.button && e.button > 0) || toque) return;
      toque = e.pointerId;
      try { cv.setPointerCapture(e.pointerId); } catch (x) { /* sem captura */ }
      comCursor = false;
      comecar(ponto(e));
    });
    cv.addEventListener('pointermove', function (e) { if (toque === e.pointerId) mover(ponto(e)); });
    function soltar(e) { if (toque !== e.pointerId) return; toque = null; A.soltar(); }
    cv.addEventListener('pointerup', soltar);
    cv.addEventListener('pointercancel', soltar);

    // teclado: setas movem o cursor (2 px de arte); Enter/Espaço usam; segurando, as setas arrastam
    var segurando = false;
    cv.addEventListener('focus', function () { if (UI.porTeclado()) { comCursor = true; pedir(); } });
    cv.addEventListener('blur', function () { comCursor = false; if (segurando) { segurando = false; A.soltar(); } pedir(); });
    cv.addEventListener('keydown', function (e) {
      var d = SETAS[e.key];
      if (d) {
        e.preventDefault();
        comCursor = true;
        cursor.x = Math.max(AR.x, Math.min(AR.x + AR.w - 1, cursor.x + d[0] * 2));
        cursor.y = Math.max(AR.y, Math.min(AR.y + AR.h - 1, cursor.y + d[1] * 2));
        if (segurando) mover(cursor); else pedir();
        return;
      }
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (e.repeat || segurando) return;
      comCursor = true; segurando = true;
      comecar(cursor);
    });
    cv.addEventListener('keyup', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && segurando) { segurando = false; A.soltar(); }
    });

    /* ---------- tamanho: ampliação inteira e par, a maior que cabe ---------- */
    function escala() {
      if (!vivo()) { soltarTudo(); return; }
      var duas = getComputedStyle(raiz).display === 'grid';
      var ct = getComputedStyle(tela), moldura = pn.card.offsetHeight - pn.conteudo.clientHeight;
      var cc = getComputedStyle(pn.conteudo), folga = parseFloat(cc.paddingTop) + parseFloat(cc.paddingBottom) + 8;
      var alt = tela.clientHeight - parseFloat(ct.paddingTop) - parseFloat(ct.paddingBottom) - moldura - folga - (duas ? 0 : lado.offsetHeight + 12);
      var larg = (duas ? raiz.clientWidth - lado.offsetWidth - 20 : raiz.clientWidth) - 8;   // 8: a borda grossa da caixa
      var k = 8;
      while (k > 2 && (A.W * k > larg || A.H * k > alt)) k -= 2;
      if (cv.style.width !== A.W * k + 'px') { cv.style.width = A.W * k + 'px'; cv.style.height = A.H * k + 'px'; }
      raiz.dataset.escala = String(k);
    }
    var vigia = window.ResizeObserver ? new ResizeObserver(escala) : null;
    if (vigia) vigia.observe(tela);
    window.addEventListener('resize', escala);

    var solto = false;
    function soltarTudo() {
      if (solto) return;
      solto = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0; A.soltar();
      window.removeEventListener('resize', escala);
      if (vigia) vigia.disconnect();
      A.fechou();   // e a caixa do parque passa a mostrar o que ela fez
    }
    function fechou() { soltarTudo(); }

    marcar();
    escala();
    desenhar();
    return pn;
  };
})();
