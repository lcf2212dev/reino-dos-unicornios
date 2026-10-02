/* Laboratório: painel e experiências. _laboratorio compartilha apenas helpers de UI com cenas/jogos. */
(function () {
  var R = window.Reino, UI = R.UI;
  var L = R._laboratorio = {};
  L.el = function (tag, classe, texto) { var e = document.createElement(tag); e.className = classe || ''; if (texto) e.textContent = R._ui && R._ui.hifenizar ? R._ui.hifenizar(texto) : texto; return e; };
  L.botao = function (pai, texto, fn) { var b = L.el('button', 'btn-pequeno laboratorio-botao', texto); b.type = 'button'; b.onclick = fn; pai.appendChild(b); return b; };
  L.falar = function (paginas) { R.Som.falar(paginas, { voz: 'narradora' }); };
  L.base = function (titulo, guia, fala) {
    var p = UI.painel('laboratorio', titulo, { curto: titulo, aoFechar: function () { R.Som.calar(); } });
    p.card.classList.add('laboratorio');
    p.conteudo.appendChild(L.el('p', 'laboratorio-guia', guia));
    L.botao(p.conteudo, 'Ouvir a explicação', function () { L.falar(fala); });
    return p;
  };
  L.ir = function (p, fn) { R.Som.calar(); UI.fecharTela(p.tela); fn(); };
  L.voltar = function (p, secao) { L.botao(p.conteudo, 'Outras descobertas', function () { L.ir(p, function () { UI.telaLaboratorio(secao); }); }); };
  UI.telaLaboratorio = function (secaoAtual) {
    secaoAtual = secaoAtual === 'jogos' ? 'jogos' : 'experiencias';
    var p = L.base('Vamos descobrir!', 'Escolha uma experiência ou um jogo. Explore no seu tempo!', ['Vamos fazer descobertas.', 'Escolha uma experiência.']);
    var abas = L.el('div', 'laboratorio-controles'); p.conteudo.appendChild(abas);
    [['experiencias', 'Experiências'], ['jogos', 'Mini-jogos']].forEach(function (aba) {
      var b = L.botao(abas, aba[1], function () { if (secaoAtual !== aba[0]) L.ir(p, function () { UI.telaLaboratorio(aba[0]); }); });
      b.setAttribute('aria-pressed', String(secaoAtual === aba[0]));
    });
    [['Experiências', R.LABORATORIO.experiencias, UI.telaLaboratorioExperiencia], ['Mini-jogos', R.LABORATORIO.jogos, UI.telaLaboratorioJogo]].forEach(function (secao) {
      if ((secao[0] === 'Mini-jogos') !== (secaoAtual === 'jogos')) return;
      p.conteudo.appendChild(L.el('h3', '', secao[0]));
      var grade = L.el('div', 'laboratorio-grade'); p.conteudo.appendChild(grade);
      secao[1].forEach(function (a, i) {
        var b = L.botao(grade, '', function () { L.ir(p, function () { secao[2](a.id); }); });
        b.appendChild(L.cena(a.id, -1)); b.appendChild(L.el('strong', '', a.nome));
        b.appendChild(L.el('span', 'laboratorio-legenda', secao[0] === 'Experiências' ? 'Experiência ' + (i + 1) : 'Jogar e descobrir'));
      });
    });
  };
  UI.telaLaboratorioExperiencia = function (id) {
    var a = R.LABORATORIO.experiencias.find(function (x) { return x.id === id; }); if (!a) return;
    var p = L.base(a.nome, a.guia, a.fala), estado = { escolha: -1, etapa: 0, fios: [false, false] };
    var palco = L.el('div', 'laboratorio-palco'), controles = L.el('div', 'laboratorio-controles');
    var relato = L.el('p', 'laboratorio-relato', 'O laboratório está pronto. Vamos começar?'); relato.setAttribute('aria-live', 'polite');
    p.conteudo.append(palco, controles, relato);
    if (id === 'broto') p.conteudo.appendChild(L.el('p', 'laboratorio-legenda', 'À esquerda: algodão úmido. À direita: algodão seco. A semente fica em contato com o ar. Depois de brotar, a plantinha precisa de luz para continuar crescendo.'));
    function desenhar() { palco.replaceChildren(L.cena(id, estado.escolha, estado)); }
    function escolher(i) {
      if (id === 'broto') {
        estado.etapa = Math.min(5, estado.etapa + 1);
        relato.textContent = 'Dia ' + estado.etapa + ': ' + (estado.etapa < 2 ? 'a semente começa a absorver água.' : 'no pote com água, a raiz e o broto crescem. No pote seco, a semente ainda não germinou.') + ' Os dois potes têm ar e estão em temperatura adequada.';
      } else if (id === 'circuito') {
        estado.fios[i] = !estado.fios[i];
        controles.children[i].textContent = (estado.fios[i] ? 'Soltar' : 'Ligar') + ' fio ' + (i ? 'direito' : 'esquerdo');
        controles.children[i].setAttribute('aria-pressed', String(estado.fios[i]));
        relato.textContent = estado.fios.every(Boolean) ? 'O caminho está fechado: a lâmpada acendeu!' : 'O caminho está aberto. Ligue os dois fios para a energia passar.';
      } else {
        estado.escolha = i; estado.etapa = 0;
        relato.textContent = id === 'mistura' ? a.opcoes[i] + ' na água. Agora use a colher para misturar.' : a.resultados[i];
        Array.prototype.forEach.call(controles.children, function (b, n) { if (n < a.opcoes.length) b.setAttribute('aria-pressed', String(n === i)); });
      }
      desenhar();
    }
    a.opcoes.forEach(function (o, i) { L.botao(controles, o, function () { escolher(i); }); });
    if (id === 'mistura') L.botao(controles, 'Mexer com a colher', function () { if (estado.escolha < 0) { relato.textContent = 'Escolha um material primeiro.'; return; } estado.etapa = 1; relato.textContent = a.resultados[estado.escolha]; desenhar(); });
    L.botao(p.conteudo, 'Ouvir a descoberta', function () { L.falar(a.conclusao); });
    L.botao(p.conteudo, 'Recomeçar', function () { L.ir(p, function () { UI.telaLaboratorioExperiencia(id); }); });
    L.voltar(p); desenhar();
  };
})();
