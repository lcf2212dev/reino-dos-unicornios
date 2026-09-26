/* Lugares: abrir a tela de um lugar do mapa, o menu Lugares do Reino e os avisos de cada lugar. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = Reino.UI, R = Reino._ui;
  var painel = R.painel, focarMapa = R.focarMapa, hifenizar = R.hifenizar, iconePequeno = R.iconePequeno;
  var CUIDADO = R.CUIDADO, cuidadosProntos = R.cuidadosProntos, comBanho = R.comBanho, uniChocado = R.uniChocado;

  /* ---------- lugares ---------- */
  UI.abrirLugar = function (lugar) {
    Reino.Som.tocar('porta');
    if (lugar.tipo === 'materia') return UI.telaMateria(Reino.materia(lugar.materiaId));
    if (lugar.tipo === 'castelo') return UI.telaCastelo();
    if (lugar.tipo === 'escola') return Reino.Provas.telaEscola();
    if (lugar.tipo === 'estabulo') return UI.telaEstabulo();
    if (lugar.tipo === 'bau') return UI.telaBau();
    if (lugar.tipo === 'loja') return UI.telaLoja();
    if (lugar.tipo === 'petshop') return UI.telaPetShop();
    // 'observatorio': não tem tela própria, só o interior
  };

  /* ---------- lista rápida de lugares ---------- */
  // a linha da Pet Shop avisa quando a montaria está com fome, sede ou precisando de banho
  function infoPetShop() {
    var id = P.montaria();
    if (cuidadosProntos() && uniChocado(id)) {
      var b = Reino.Cuidados.baixo(id);
      if (b.fome && b.sede) return '🍎💧 Seu unicórnio está com fome e sede!';
      if (b.sede) return '💧 Seu unicórnio está com sede!';
      if (b.fome) return '🍎 Seu unicórnio está com fome!';
      if (b.banho) return '🛁 Seu unicórnio precisa de um banho!';
    }
    return comBanho() ? 'Comida, água e banho para o seu unicórnio' : 'Comida e água para o seu unicórnio';
  }
  // os avisos que as placas do mapa davam (as placas saíram do mapa): 0/5 ou Pronto nas matérias,
  // Ovo no Estábulo, Prova na Escola e Sede/Fome/Banho na Pet Shop (todos os baixos, sede primeiro)
  UI.avisosDoLugar = function (l) {
    var av = [];
    if (l.tipo === 'materia') {
      var m = Reino.materia(l.materiaId);
      var pronto = Reino.Cena && Reino.Cena.concluidos ? Reino.Cena.concluidos().indexOf(l.id) >= 0 : P.materiaCompleta(m);
      av.push({ texto: pronto ? 'Pronto' : P.salasFeitas(m) + '/' + m.salas.length, tipo: pronto ? 'pronto' : 'salas' });
    }
    if (l.tipo === 'estabulo' && P.ovosParaChocar().length) av.push({ texto: 'Ovo', icone: '🥚', tipo: 'ovo' });
    if (l.tipo === 'escola' && Reino.provas.some(function (pv) { return !P.regProva(pv).premio; })) av.push({ texto: 'Prova', tipo: 'prova' });
    if (l.tipo === 'petshop' && cuidadosProntos() && uniChocado(P.montaria())) {
      var b = {};
      try { b = Reino.Cuidados.baixo(P.montaria()) || {}; } catch (e) { b = {}; }
      ['sede', 'fome', 'banho'].forEach(function (c) { if (b[c]) av.push({ texto: CUIDADO[c].rotulo, icone: CUIDADO[c].icone, tipo: c }); });
    }
    return av;
  };
  function chipsAvisos(l) {
    var av = UI.avisosDoLugar(l);
    if (!av.length) return null;
    return el('span.lugar-avisos', av.map(function (a) {
      return el('span.lugar-aviso.aviso-' + a.tipo, a.icone ? iconePequeno(a.icone, 16) : null, el('span', a.texto));
    }));
  }
  UI.telaLugares = function () {
    var pn = painel('lugares', '📋 Lugares do Reino');
    var lista = el('div.lista-salas');
    // as matérias aparecem primeiro
    var ordenados = Mapa.lugares().slice().sort(function (a, b) { return (b.tipo === 'materia') - (a.tipo === 'materia'); });
    ordenados.forEach(function (l) {
      var info = '', emoji = '📍';
      if (l.tipo === 'materia') {
        var m = Reino.materia(l.materiaId);
        emoji = m.emoji;
        info = P.salasFeitas(m) + ' de ' + m.salas.length + ' salas • ' + U.reais(P.dinheiroMateria(m)) + ' de ' + U.reais(Reino.config.valorPorMateria);
      } else if (l.tipo === 'castelo') { emoji = '🥇'; info = 'Treino da Medalha de Ouro'; }
      else if (l.tipo === 'escola') { emoji = '🏫'; info = 'Provas bimestrais valendo acessório'; }
      else if (l.tipo === 'estabulo') { emoji = '🦄'; var o = P.ovosParaChocar().length; info = o ? '🥚 ' + o + ' para chocar!' : 'Seus unicórnios'; }
      else if (l.tipo === 'bau') { emoji = '💰'; info = U.reais(P.dinheiroTotal()) + ' guardados'; }
      else if (l.tipo === 'loja') { emoji = '🧚'; info = '⭐ ' + P.estrelas() + (P.estrelas() === 1 ? ' estrela' : ' estrelas') + ' para gastar'; }
      else if (l.tipo === 'petshop') { emoji = '🐾'; info = infoPetShop(); }
      else if (l.tipo === 'observatorio') { emoji = '🔭'; info = 'Curiosidades do espaço'; }
      var b = el('button.sala-card', { type: 'button' }, el('span.sala-emoji', emoji), el('span.sala-info', el('b', hifenizar(l.nome)), el('small', hifenizar(info)), chipsAvisos(l)), el('span.sala-ir', 'Ir →'));
      b.addEventListener('click', function (e) {
        UI.fecharTela(pn.tela);
        // o dedo que ainda bate no "Ir" cai no mapa e trocaria o destino: segura mais um pouco
        // (só perto desse toque; motor/entrada.js pergunta a UI.toqueSegurado)
        if (e.isTrusted && e.detail) UI.segurarToques(1500);
        focarMapa();   // ela vai andando sozinha: o foco não volta ao botão do menu (Espaço reabria Lugares)
        U.emit(EV.IR_PARA, l);
      });
      lista.appendChild(b);
    });
    pn.conteudo.appendChild(lista);
  };
})();
