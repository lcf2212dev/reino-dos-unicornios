/* Escola de Música: registro tardio das telas e sessão descartável (áudio/timers), sem salvar progresso. */
(function () {
  var R = window.Reino, M = R.EscolaMusica;
  M.el = function (tag, classe, texto) {
    var e = document.createElement(tag); e.className = classe || '';
    if (texto !== undefined) e.textContent = texto;
    return e;
  };
  M.botao = function (texto, acao, classe) {
    var b = M.el('button', classe || 'btn-pequeno musica-botao', texto); b.type = 'button';
    b.addEventListener('click', acao); return b;
  };
  M.sessao = function (id, titulo) {
    var timers = [], sons = [], encerrada = false, observador;
    function parar() {
      timers.forEach(clearTimeout); timers = [];
      sons.forEach(function (fn) { if (typeof fn === 'function') fn(); }); sons = [];
      if (R.Som && R.Som.calar) R.Som.calar();
    }
    function limpar() { if (encerrada) return; encerrada = true; parar(); if (observador) observador.disconnect(); }
    var p = R.UI.painel(id, titulo, { aoFechar: limpar });
    p.card.classList.add('musica-painel');
    var raiz = p.tela.parentNode;
    function ativa() { return !encerrada && p.tela.isConnected && p.tela.parentNode === raiz; }
    observador = new MutationObserver(function () { if (!ativa()) limpar(); });
    observador.observe(raiz, { childList: true });
    var s = { painel: p, corpo: p.conteudo, parar: parar, limpar: limpar,
      depois: function (fn, ms) {
        var t = setTimeout(function () {
          var i = timers.indexOf(t); if (i >= 0) timers.splice(i, 1);
          if (ativa()) fn(); else limpar();
        }, ms); timers.push(t);
      },
      nota: function (midi, op) {
        if (!ativa()) { limpar(); return; }
        if (!R.Som.notaMusical) return;
        var fim = R.Som.notaMusical(midi, op); sons.push(fim);
        s.depois(function () { var i = sons.indexOf(fim); if (i >= 0) sons.splice(i, 1); }, ((op && op.duracao) || 0.5) * 1000 + 100);
      },
      falar: function (paginas) { if (!ativa()) { limpar(); return; } parar(); R.Som.falar(paginas.slice(), { voz: 'claude' }); },
      ir: function (fn) { limpar(); R.UI.fecharTela(p.tela); fn(); }
    };
    s.exemplo = function (notas, aoTocar, aoFim) {
      parar();
      notas.forEach(function (n) { s.depois(function () {
        s.nota(n[0], { duracao: n[2] || 0.5, volume: n[3] === undefined ? 0.18 : n[3], timbre: n[4] || 'triangle' });
        if (aoTocar) aoTocar(n[0]);
      }, n[1] * 1000); });
      var fim = Math.max.apply(null, notas.map(function (n) { return n[1] + (n[2] || 0.5); }));
      if (aoFim) s.depois(aoFim, fim * 1000 + 100);
    };
    return s;
  };
  M.menu = function () {
    var s = M.sessao('musica-aulas', 'Escola de Música');
    s.corpo.appendChild(M.el('p', 'musica-intro', 'Um lugar para descobrir sons e criar melodias. Escolha sua aula!'));
    var grade = M.el('div', 'musica-escolhas');
    [ ['Aula de teclado', 'Toque as teclas e aprenda uma pequena melodia.', M.teclado],
      ['Fundamentos musicais', 'Explore os sons com exemplos e brincadeiras.', M.fundamentos] ].forEach(function (a) {
      var b = M.botao('', function () { s.ir(a[2]); }, 'musica-cartao');
      b.appendChild(M.el('strong', '', a[0])); b.appendChild(M.el('span', '', a[1])); grade.appendChild(b);
    });
    s.corpo.appendChild(grade);
    s.corpo.appendChild(M.botao('Ouvir o convite', function () { s.falar(M.falas.convite); }));
  };
  if (R.NPCs && R.NPCs.registrarTela) {
    R.NPCs.registrarTela('musica-aulas', function () { M.menu(); });
    R.NPCs.registrarTela('musica-teclado', function () { M.teclado(); });
    R.NPCs.registrarTela('musica-fundamentos', function () { M.fundamentos(); });
  }
})();
