/* Chocar ovos: os 3 toques no ovo, o nascimento e o cartão que encolhe para caber. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = Reino.UI, R = Reino._ui;
  var est = R.est, topo = R.topo, mostrarFoco = R.mostrarFoco;

  /* ---------- chocar ovos ---------- */
  UI.chocarOvos = function (ids) {
    // só ovo que esta versão conhece (sem def não há como desenhar nem chocar)
    ids = (ids || []).filter(function (id) { return est().unis[id] && !est().unis[id].chocado && !!P.defUni(id); });
    var seq = Promise.resolve();
    ids.forEach(function (id) { seq = seq.then(function () { return chocarUm(id); }); });
    return seq.then(function () { UI.atualizarHUD(); });
  };

  function chocarUm(id, opcoes) {
    opcoes = opcoes || {};
    Reino.Voz.carregarUnicornios([id]);   // a frase dele (pacote <matéria>-extra) chega durante a animação
    return new Promise(function (resolver) {
      var d = P.defUni(id);
      var rar = Reino.Unicornios.RARIDADES[d.raridade];
      var t = UI.abrirTela('ovo');
      var toques = 0;
      var ovoBox = el('button.ovo-grande.rar-' + d.raridade, { type: 'button', 'aria-label': 'Toque no ovo' });
      function pintarOvo() { ovoBox.innerHTML = ''; ovoBox.appendChild(PA.paraDOM(PA.ovo(d.raridade, toques), 8)); }
      pintarOvo();
      var texto = el('p.ovo-texto', Reino.Falas.ovo(d.raridade));
      // 3 bolinhas embaixo do ovo: acendem a cada toque
      var marcas = el('div.ovo-marcas', { 'aria-hidden': 'true' });
      function pintarMarcas() { marcas.innerHTML = ''; for (var i = 0; i < 3; i++) marcas.appendChild(PA.paraDOM(marcaToque(i < toques), 2, 'ovo-marca' + (i < toques ? ' acesa' : ''))); }
      pintarMarcas();
      var card = el('div.painel.painel-ovo.rar-' + d.raridade, el('h2.titulo-pixel', rar.emoji + ' Ovo ' + rar.nome), ovoBox, marcas, texto);
      t.appendChild(card);
      Reino.Som.falar(texto.textContent, { voz: 'claude' });
      ovoBox.addEventListener('click', function () {
        if (toques >= 3) return;
        toques++;
        ovoBox.classList.remove('balanca'); void ovoBox.offsetWidth; ovoBox.classList.add('balanca');
        Reino.Som.tocar('rachar');
        pintarOvo(); pintarMarcas();
        if (toques < 3) { texto.textContent = toques === 1 ? 'Está mexendo! Mais 2 toques!' : 'Quase! Mais 1 toque!'; return; }
        setTimeout(nasceu, 450);
      });
      function nasceu() {
        P.chocar(id); P.salvar();
        Reino.Som.tocar('chocar');
        card.innerHTML = '';
        // lendário: um 🌈 só, colado à 1ª palavra (arte.md §21.1); no celular quebra em 2 linhas
        var titulo = d.raridade === 'lendario' ? el('h2.titulo-pixel', el('span.titulo-colado', '🌈UM'), ' LENDÁRIO!') : el('h2.titulo-pixel', 'Nasceu!');
        card.appendChild(titulo);
        UI.festa(3, { titulo: titulo, som: false });   // ovo que nasce: nível 3 em toda raridade (arte.md §16)
        // o lendário ganha o brilho arco-íris, não mais confete (arte.md §16)
        var sprite = el('div.detalhe-sprite.nascimento.rar-' + d.raridade, PA.paraDOM(PA.unicornio(d, 0, 0), 8));
        card.appendChild(d.raridade === 'lendario' ? el('div.brilho-arco', sprite) : sprite);
        card.appendChild(el('p.detalhe-rar.rar-' + d.raridade, rar.emoji + ' ' + rar.nome));
        card.appendChild(el('p.ovo-nome', opcoes.primeiro ? 'Seu primeiro unicórnio!' : P.nomeUni(id)));
        card.appendChild(el('p.detalhe-frase', '"' + d.frase + '"'));
        card.appendChild(el('p.detalhe-dica', '🍼 Ele nasceu bebê! Quanto mais você acerta com ele de montaria, mais ele cresce.'));
        var botoes = el('div.intro-botoes');
        if (opcoes.primeiro) {
          var ok = el('button.btn-grande.btn-principal', { type: 'button' }, 'Dar um nome ✏️');
          ok.addEventListener('click', function () {
            UI.pedirNome('Qual vai ser o nome do seu unicórnio?', 'Estrelinha').then(function (nome) {
              est().unis[id].nome = nome || 'Estrelinha'; P.salvar();
              UI.fecharTela(t); resolver();
            });
          });
          botoes.appendChild(ok);
        } else {
          var montar = el('button.btn-grande.btn-principal', { type: 'button' }, 'Passear com ele 🐾');
          var guardar = el('button.btn-grande.btn-secundario', { type: 'button' }, 'Guardar no estábulo');
          montar.addEventListener('click', function () { est().montaria = id; P.salvar(); UI.fecharTela(t); U.emit(EV.MAPA_MUDOU); resolver(); });
          guardar.addEventListener('click', function () { UI.fecharTela(t); resolver(); });
          botoes.appendChild(guardar); botoes.appendChild(montar);
        }
        card.appendChild(botoes);
        // o ovo (com o foco) sumiu: pelo teclado, o foco vai para o botão principal, não para o body
        var principal = botoes.querySelector('.btn-principal');
        compactarNascimento(t, card, principal);
        if (UI.porTeclado()) UI.focarTeclado(principal, 600);
        Reino.Som.falar([d.raridade === 'lendario' ? Reino.Falas.fixas.lendario : Reino.Falas.fixas.nasceu, { texto: d.frase, voz: 'unicornio' }], { voz: 'claude' });
      }
    });
  }
  UI.chocarUm = chocarUm;
  // marcador 8×8 (16 px na tela): bolinha com contorno; acesa é dourada com brilho
  function marcaToque(acesa) {
    var c = PA.novoCanvas(8, 8), x = c.getContext('2d');
    x.fillStyle = '#3a2446'; x.fillRect(2, 0, 4, 8); x.fillRect(0, 2, 8, 4); x.fillRect(1, 1, 6, 6);
    x.fillStyle = acesa ? '#ffc93c' : '#efe4ff'; x.fillRect(2, 1, 4, 6); x.fillRect(1, 2, 6, 4);
    if (acesa) { x.fillStyle = '#ffffff'; x.fillRect(2, 2, 2, 1); x.fillRect(2, 3, 1, 1); }
    return c;
  }
  /* O cartão de quem nasceu (o do lendário, no celular e no notebook) passava da altura da tela, e o
     texto ainda cresce um pouco quando a fonte termina de carregar. Quando não cabe, ele fica mais
     compacto, um passo de cada vez (espaços, depois o desenho, depois as letras), até o título e o
     botão principal aparecerem inteiros sem rolar: é a hora da comemoração, nada de rolar o título.
     Mede de novo quando a fonte carrega e quando o conteúdo muda de tamanho no primeiro instante.
     Se nem assim couber, por toque fica como está (título inteiro); pelo teclado, o botão com o
     foco aparece inteiro (mostrarFoco rola o cartão por dentro). */
  function compactarNascimento(t, card, botao) {
    var sprite = card.querySelector('.detalhe-sprite'), tela = sprite && sprite.querySelector('canvas');
    var botoes = botao && botao.parentElement;
    function escala(k) { if (tela) { tela.style.width = (tela.width * k) + 'px'; tela.style.height = (tela.height * k) + 'px'; } }
    var passos = [
      function () { card.style.gap = '8px'; card.style.paddingTop = card.style.paddingBottom = '14px'; if (botoes) botoes.style.marginTop = '6px'; },
      function () { escala(6); if (sprite) sprite.style.minHeight = '0'; },
      function () { escala(4); card.classList.add('nascimento-compacto'); },   // letras um degrau abaixo (css)
    ];
    var feito = 0;
    function cabe() { return card.scrollHeight <= card.clientHeight + 1; }
    function ajustar() {
      if (!card.isConnected) return;
      while (!cabe() && feito < passos.length) passos[feito++]();
      if (feito && UI.porTeclado() && document.activeElement === botao && t === topo()) mostrarFoco(botao);
    }
    ajustar();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustar);
    if (!window.ResizeObserver) { setTimeout(ajustar, 300); return; }
    var obs = new ResizeObserver(ajustar);
    Array.prototype.forEach.call(card.children, function (filho) { obs.observe(filho); });
    setTimeout(function () { obs.disconnect(); ajustar(); }, 1500);
  }
})();
