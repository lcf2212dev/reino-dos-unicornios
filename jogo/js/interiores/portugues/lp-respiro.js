/* Ação lp-respiro (Vovó Serena, Cantinho do Respiro do 1º andar): a respiração guiada numa tela calma por cima.
   Um círculo cresce (inspira, 4 s) e diminui (expira, 4 s), 3 vezes, com a narração na voz da Vovó Serena
   (textos em personagens-falas.js, chave `respiro`). Sem Animações ou com "reduzir movimento": o círculo fica
   parado e o texto conta 1, 2, 3. Só calma: nada de pergunta, estrela, moedas ou save. Esc, ✕ e "Pronto" fecham. */
(function () {
  var R = window.Reino;
  var FASE_MS = 4000, VEZES = 3;

  function textos() {
    var F = R.FALAS_INTERIORES && R.FALAS_INTERIORES.portugues;
    return (F && F.respiro) || { voz: 'npc-lp-serena', comeco: '', inspira: '', expira: '', fim: [] };
  }

  function respirar() {
    return new Promise(function (resolver) {
      var U = R.util, el = U.el, T = textos();
      var p = R.UI.painel('respiro', '🌿 Cantinho do Respiro', { estreito: true, aoFechar: fim });
      var animar = U.animar();
      var circulo = el('div.respiro-circulo' + (animar ? '' : '.parado'), { 'aria-hidden': 'true' });
      var texto = el('p.respiro-texto', { 'aria-live': 'polite' }, T.comeco);
      var conta = el('p.respiro-conta', '');
      var pronto = el('button.btn-grande.btn-principal', { type: 'button' }, 'Pronto 🌿');
      p.conteudo.appendChild(el('div.respiro', el('div.respiro-palco', circulo), texto, conta, el('div.intro-botoes', pronto)));
      var timers = [], acabou = false;
      function depois(ms, fn) { timers.push(setTimeout(function () { if (!acabou) fn(); }, ms)); }
      function falar(t) { if (t) R.Som.falar(t, { voz: T.voz }); }
      function fim() {
        if (acabou) return;
        acabou = true;
        timers.forEach(clearTimeout);
        R.Som.calar();
        resolver();
      }
      pronto.addEventListener('click', function () { R.Som.tocar('toque'); R.UI.fecharTela(p.tela); fim(); });
      setTimeout(function () { if (!acabou) pronto.focus(); }, 20);   // foco no botão: Enter fecha

      // sem animação: o texto conta 1, 2, 3 durante a fase
      function contar(rotulo) {
        if (animar) return;
        [0, 1, 2].forEach(function (i) {
          depois(i * (FASE_MS / 3), function () { conta.textContent = rotulo + ' 1' + (i > 0 ? ', 2' : '') + (i > 1 ? ', 3' : ''); });
        });
      }
      function fase(n, inspira) {
        texto.textContent = inspira ? 'Inspira…' : 'Expira…';
        conta.textContent = animar ? 'Respiração ' + n + ' de ' + VEZES : '';
        contar('Respiração ' + n + ' de ' + VEZES + ':');
        if (animar) circulo.classList.toggle('cheio', inspira);
        falar(inspira ? T.inspira : T.expira);
      }
      function ciclo(n) {
        if (n > VEZES) {
          circulo.classList.remove('cheio');
          texto.textContent = T.fim.join(' ');
          conta.textContent = '';
          R.Som.falar(T.fim.map(function (t) { return { texto: t, voz: T.voz }; }), { voz: T.voz });
          return;
        }
        fase(n, true);
        depois(FASE_MS, function () { fase(n, false); depois(FASE_MS, function () { ciclo(n + 1); }); });
      }
      falar(T.comeco);
      depois(2500, function () { ciclo(1); });
    });
  }

  if (R.NPCs && R.NPCs.registrarAcao) R.NPCs.registrarAcao('lp-respiro', function () { return respirar(); });
})();
