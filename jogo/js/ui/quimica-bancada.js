/* Laboratório de Química, a bancada, parte 3 de 3: a tela Reino.UI.telaQuimicaBancada(op) (docs/contratos/quimica.md §2).
   Prateleira com os 12 tubos (tocar, Enter/Espaço ou arrastar até o béquer despeja), o palco (Reino._quimicaPalco,
   quimica-palco.js e quimica-palco-2.js), o rodapé (Esvaziar, 📒 Caderno, Misturar!), o cartão do resultado e as
   falas da Doutora Proveta (Reino.Quimica.VOZ). A receita é gravada no Misturar!, antes da animação (§7). */
(function () {
  var R = window.Reino, U = R.util, el = U.el, UI = R.UI;
  var P = R._quimicaPalco, Q;   // Q = Reino.Quimica (sistemas/, carrega depois da ui/): lido na hora de abrir
  var jaDisseOi = false;   // a Doutora diz oi na 1ª vez que a bancada abre na sessão
  var ALTURA_FALA = 130;   // px embaixo do palco 4× (a caixa da fala, os vãos e o respiro do painel)

  function frase(nome) { return Q.frase('bancada.' + nome); }
  function maxTubos() { return (R.config.quimica && R.config.quimica.maxTubos) || 3; }
  function comSeguranca(p) { return p.concat(Q.frase('comum.seguranca')); }
  function iconeGrande(emoji) {
    var d = window.PA && PA.iconeDesenho && PA.iconeDesenho(emoji);
    return d ? PA.paraDOM(d, PA.escalaNitida(64, 16), 'bancada-emoji') : el('span.bancada-emoji', emoji);
  }

  /** A bancada de misturas. @param {{ tubos?: string[] }} [op] tubos já no béquer (para teste) */
  UI.telaQuimicaBancada = function (op) {
    op = op || {};
    Q = R.Quimica;
    var pn = UI.painel('quimica-bancada', '🧪 Bancada de Misturas', { curto: 'Bancada', aoFechar: fechou });
    var tela = pn.tela, reagindo = false, resultado = null, fantasma = null, falaAtual = [];

    /* ---------- palco, fala e prateleira ---------- */
    var cv = el('canvas.bancada-cena', { width: P.W, height: P.H, 'aria-hidden': 'true' });
    var palcoBox = el('div.bancada-palco', cv);
    var mistura = el('p.bancada-mistura');
    var fala = el('p.bancada-fala');
    var prateleira = el('div.bancada-prateleira', { role: 'group', 'aria-label': 'Tubos de ensaio' });
    var cartao = el('section.bancada-resultado', { hidden: true, tabindex: '-1' });
    var raiz = el('div.bancada',
      el('div.bancada-esq', palcoBox, el('div.bancada-info', mistura, fala)),
      el('div.bancada-dir', prateleira, cartao));
    pn.conteudo.appendChild(raiz);
    var palco = P.criar(cv, function () { return tela.isConnected && !tela.classList.contains('saindo'); });

    var esvaziar = el('button.btn-grande.btn-secundario.bancada-esvaziar', { type: 'button', 'aria-label': 'Esvaziar' },
      '🧹', el('span.rotulo-longo', ' Esvaziar'));
    var caderno = el('button.btn-grande.btn-secundario.bancada-caderno', { type: 'button', 'aria-label': 'Caderno' },
      '📒', el('span.rotulo-longo', ' Caderno'));
    var btnMisturar = el('button.btn-grande.btn-principal.bancada-misturar', { type: 'button' }, 'Misturar!', el('span.rotulo-longo', ' ✨'));
    pn.card.appendChild(el('footer.rodape-acao.bancada-rodape', esvaziar, caderno, btnMisturar));

    function dizer(paginas, texto) {
      falaAtual = paginas.slice();
      U.preencher(fala, texto !== undefined ? texto : paginas.join(' '));
      if (!paginas.length) return;
      try { R.Som.calar(); R.Som.falar(paginas.slice(), { voz: Q.VOZ }); } catch (e) { /* sem voz */ }
    }
    function atualizar() {
      var tubos = palco.g.tubos;
      U.preencher(mistura, tubos.length ? tubos.map(function (id) { return (Q.ingrediente(id) || {}).nome || id; }).join(' + ')
        : 'O béquer está vazio.');
      mistura.classList.toggle('vazio', !tubos.length);
      // com o cartão aberto, o principal é o "Outra mistura": o Misturar! se apaga
      btnMisturar.setAttribute('aria-disabled', String(!tubos.length || reagindo || !!resultado));
      esvaziar.setAttribute('aria-disabled', String(!tubos.length || reagindo));
      caderno.setAttribute('aria-disabled', String(!UI.telaQuimicaCaderno));
      U.$$('.bancada-tubo', prateleira).forEach(function (b) {
        var n = tubos.filter(function (id) { return id === b.dataset.tubo; }).length;
        b.classList.toggle('no-bequer', n > 0);
      });
      prateleira.hidden = !!resultado;
      raiz.classList.toggle('com-resultado', !!resultado);
      cartao.hidden = !resultado;
    }

    /* ---------- despejar ---------- */
    function despejar(id) {
      if (reagindo || resultado) return;
      var ing = Q.ingrediente(id);
      if (!ing) return;
      if (palco.g.tubos.length >= maxTubos()) { R.Som.tocar('toque'); dizer(frase('cheio')); return; }
      palco.despejar(id);
      R.Som.tocar(ing.tipo === 'po' ? 'sacudida' : 'gotas');
      dizer([ing.fala]);   // a fala já diz o nome do tubo
      atualizar();
    }
    function sobreOPalco(x, y) {
      var r = palcoBox.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }
    // arrastar o tubo até o béquer (o extra; tocar já despeja): o tubo segue o dedo em degraus de 2 px
    function ligarArrasto(b, ing) {
      var ini = null, arrastou = false;
      b.addEventListener('pointerdown', function (e) {
        if ((e.button && e.button > 0) || reagindo || resultado) return;
        if (UI.toqueSegurado && UI.toqueSegurado(e.clientX, e.clientY)) return;
        ini = { x: e.clientX, y: e.clientY, id: e.pointerId }; arrastou = false;
      });
      b.addEventListener('pointermove', function (e) {
        if (!ini || e.pointerId !== ini.id) return;
        if (!fantasma) {
          if (Math.abs(e.clientX - ini.x) + Math.abs(e.clientY - ini.y) < 12) return;
          try { b.setPointerCapture(e.pointerId); } catch (x) { /* sem captura */ }
          var c = el('canvas.bancada-fantasma', { 'aria-hidden': 'true' });
          P.tuboDePe(c, ing, 24);
          fantasma = c; document.body.appendChild(c); arrastou = true;
        }
        fantasma.style.transform = 'translate(' + (Math.round((e.clientX - 24) / 2) * 2) + 'px,' + (Math.round((e.clientY - 52) / 2) * 2) + 'px)';
        palcoBox.classList.toggle('alvo', sobreOPalco(e.clientX, e.clientY));
      });
      function soltar(e, vale) {
        if (!ini || e.pointerId !== ini.id) return;
        ini = null;
        if (!fantasma) return;
        tirarFantasma();
        if (vale && sobreOPalco(e.clientX, e.clientY)) despejar(ing.id);
      }
      b.addEventListener('pointerup', function (e) { soltar(e, true); });
      b.addEventListener('pointercancel', function (e) { soltar(e, false); });
      b.addEventListener('click', function (e) {
        if (arrastou) { arrastou = false; e.preventDefault(); return; }   // o clique que vem depois de soltar
        despejar(ing.id);
      });
    }
    function tirarFantasma() {
      if (fantasma && fantasma.parentNode) fantasma.parentNode.removeChild(fantasma);
      fantasma = null; palcoBox.classList.remove('alvo');
    }
    Q.ingredientes().forEach(function (ing) {
      var mini = el('canvas.bancada-tubo-desenho', { 'aria-hidden': 'true' });
      P.tuboDePe(mini, ing);
      var b = el('button.bancada-tubo', { type: 'button', 'data-tubo': ing.id, 'aria-label': ing.nome },
        mini, el('span.bancada-tubo-nome', R._ui.hifenizar(ing.nome)));
      ligarArrasto(b, ing);
      prateleira.appendChild(b);
    });

    /* ---------- misturar e o resultado ---------- */
    function misturar() {
      if (reagindo) return;
      if (resultado) { R.Som.tocar('toque'); return; }   // apagado: o cartão pede "Outra mistura"
      if (!palco.g.tubos.length) { R.Som.tocar('toque'); dizer(frase('vazio')); return; }
      var r = Q.misturar(palco.g.tubos);
      // a receita vai para o caderno AGORA, antes da animação (fechar no meio não perde a descoberta)
      var d = r.receita ? Q.descobrir('receitas', r.receita.id) : null;
      reagindo = true; resultado = null;
      try { R.Som.calar(); } catch (e) { /* sem voz */ }
      U.preencher(fala, '');
      atualizar();
      palco.reagir(r, function () { reagindo = false; mostrar(r, d); });
    }
    function mostrar(r, d) {
      resultado = r;
      cartao.innerHTML = '';
      var rec = r.receita, emoji, titulo, textos = [], paginas, chip = null;
      if (rec) {
        emoji = iconeGrande(rec.emoji);
        titulo = el('h3.bancada-titulo', rec.nome);
        var exp = [].concat(rec.explica || []);
        // a explicação recolhida no celular: o cartão cabe sem rolar (a Doutora fala tudo de qualquer jeito)
        var porque = el('details.bancada-porque', el('summary', el('b', 'Por que acontece?')), el('p.bancada-explica', exp.join(' ')));
        if (!window.matchMedia || !matchMedia('(max-width: 480px)').matches) porque.open = true;
        textos.push(el('p.bancada-acontece', rec.acontece), porque, el('p.bancada-seguranca', Q.frase('comum.seguranca').join(' ')));
        paginas = comSeguranca([rec.acontece].concat(exp));
        if (d && d.nova) {
          chip = el('p.chip-mini.bancada-estrelas', 'Receita nova! ⭐ +' + d.estrelas);
          paginas = paginas.concat(frase('novaReceita'), d.completo ? frase('completo') : []);
        } else {
          chip = el('p.chip-mini.bancada-conhecida', '📒 Já está no caderno');
          paginas = paginas.concat(frase('repetida'));
        }
      } else {
        emoji = iconeGrande(r.tipo === 'nada' ? '🥄' : '👀');
        titulo = el('h3.bancada-titulo', r.tipo === 'nada' ? 'Hmm…' : 'Quase!');
        paginas = r.tipo === 'falta' ? frase('quaseFalta').concat(Q.noCaderno(r.quase.id) ? frase('quaseCaderno') : [r.quase.dica])
          : r.tipo === 'sobra' ? frase('quaseSobra') : frase('nada');
        // o título já diz "Quase!": o texto não repete
        textos.push(el('p.bancada-acontece', paginas.join(' ').replace(/^Quase!\s*/, '')));
      }
      var ouvir = el('button.btn-grande.btn-secundario.bancada-ouvir', { type: 'button', 'aria-label': 'Ouvir de novo' }, '🔊', el('span.rotulo-longo', ' Ouvir'));
      var outra = el('button.btn-grande.btn-principal.bancada-outra', { type: 'button' }, 'Outra mistura 🧪');
      ouvir.addEventListener('click', function () { dizer(falaAtual, ''); });
      outra.addEventListener('click', function () { limpar(true); });
      cartao.appendChild(el('div.bancada-cabeca', emoji, titulo));
      if (chip) cartao.appendChild(chip);
      textos.forEach(function (t) { cartao.appendChild(t); });
      cartao.appendChild(el('div.bancada-botoes', ouvir, outra));
      atualizar();
      dizer(paginas, '');   // o texto já está no cartão
      if (rec && d && d.nova) UI.festa(d.completo ? 3 : 2, { emoji: emoji });
      else if (rec) { R.Som.tocar('selecionar'); UI.festa(1, { item: cartao }); }
      UI.focarTroca(outra, titulo);
    }
    function limpar(focarTubo) {
      if (reagindo) return;
      var tinha = palco.g.tubos.length || resultado;
      resultado = null;
      palco.esvaziar();
      R.Som.tocar(tinha ? 'splash' : 'toque');
      U.preencher(fala, '');
      atualizar();
      if (focarTubo) UI.focarTroca(prateleira, null);
    }
    btnMisturar.addEventListener('click', misturar);
    esvaziar.addEventListener('click', function () { if (esvaziar.getAttribute('aria-disabled') === 'true') { R.Som.tocar('toque'); return; } limpar(false); });
    caderno.addEventListener('click', function () {
      if (!UI.telaQuimicaCaderno) { R.Som.tocar('toque'); return; }
      var rec = resultado && resultado.receita, opc = rec && Q.noCaderno(rec.id) ? { receita: rec.id } : undefined;
      R.Som.tocar('toque');
      UI.fecharTela(tela); fechou();
      UI.telaQuimicaCaderno(opc);
    });
    function fechou() { palco.parar(); tirarFantasma(); window.removeEventListener('resize', escala); if (vigia) vigia.disconnect(); }

    // ampliação inteira e par do palco (2 ou 4 px CSS por pixel de arte), pela largura da coluna e pela altura que
    // sobra de verdade para o conteúdo do painel (a tela menos o balão do Claude, o cabeçalho e o rodapé)
    function escala() {
      if (!tela.isConnected) return;
      // em 2 colunas (notebook) a da esquerda mede o próprio palco: conta a largura toda menos a prateleira (≥ 440 px)
      var caixa = palcoBox.parentNode.parentNode, duas = getComputedStyle(caixa).display === 'grid';
      var ct = getComputedStyle(tela), moldura = pn.card.offsetHeight - pn.conteudo.clientHeight;
      var alt = tela.clientHeight - parseFloat(ct.paddingTop) - parseFloat(ct.paddingBottom) - moldura;
      // 4×: o palco e, embaixo dele, a fala da Doutora (ALTURA_FALA) cabem sem rolar
      var larg = duas ? caixa.clientWidth - 460 : caixa.clientWidth, k = larg >= P.W * 4 + 8 && alt >= P.H * 4 + ALTURA_FALA ? 4 : 2;
      if (cv.style.width !== P.W * k + 'px') { cv.style.width = P.W * k + 'px'; cv.style.height = P.H * k + 'px'; }
    }
    // a tela muda de tamanho sem 'resize' quando o balão do Claude abre ou fecha (padding de --balao-altura)
    var vigia = window.ResizeObserver ? new ResizeObserver(escala) : null;
    if (vigia) vigia.observe(tela);
    window.addEventListener('resize', escala);
    escala();

    (op.tubos || []).slice(0, maxTubos()).forEach(function (id) { if (Q.ingrediente(id)) palco.g.tubos.push(id); });
    palco.desenhar();
    atualizar();
    if (!jaDisseOi) { jaDisseOi = true; dizer(frase('oi')); }
    else U.preencher(fala, frase('oi').slice(1).join(' '));
    return pn;
  };
})();
