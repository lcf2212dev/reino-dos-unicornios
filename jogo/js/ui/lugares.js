/* Lugares: abrir a tela de um lugar do mapa, o menu Lugares do Reino e os avisos de cada lugar. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = Reino.UI, R = Reino._ui;
  var painel = R.painel, focarMapa = R.focarMapa, hifenizar = R.hifenizar, iconePequeno = R.iconePequeno;
  var CUIDADO = R.CUIDADO, cuidadosProntos = R.cuidadosProntos, comBanho = R.comBanho, uniChocado = R.uniChocado;

  /* ---------- tabela por tipo de lugar ---------- */
  // cada tipo diz o emoji e a informação do menu Lugares, os avisos (chips) e a tela própria.
  // Tipo sem entrada: 📍, sem informação, sem avisos e sem tela (só o interior).
  // Prédio novo registra o seu pelo `menu` de Reino.registrarLugar (nucleo/registros.js).
  var MENU = {};
  /** @param {string} tipo @param {MenuLugar} def */
  UI.registrarLugarMenu = function (tipo, def) { MENU[tipo] = def; };
  function menuDe(l) { return MENU[l.tipo] || l.menu || null; }

  UI.abrirLugar = function (lugar) {
    Reino.Som.tocar('porta');
    if (Reino.Novidades && lugar) Reino.Novidades.marcar(lugar.id);   // lugar sem interior: a tela própria conta como visita
    var d = menuDe(lugar);
    if (d && d.abrir) return d.abrir(lugar);
  };
  // os avisos que as placas do mapa davam (as placas saíram do mapa): 0/5 ou Pronto nas matérias,
  // Ovo no Estábulo, Prova na Escola e Sede/Fome/Banho na Pet Shop (todos os baixos, sede primeiro)
  UI.avisosDoLugar = function (l) {
    var d = menuDe(l);
    var av = d && d.avisos ? d.avisos(l) : [];
    // novidade declarada (lugar.novidade) que ela ainda não visitou: o selo vem primeiro
    if (Reino.Novidades && Reino.Novidades.ehNovo(novidadeDe(l))) av = [{ texto: 'Novo!', icone: '✨', tipo: 'novo' }].concat(av);
    return av;
  };

  // matéria ativa no interior de entrada do próprio anfitrião (Língua Portuguesa no térreo da Casa das Palavras):
  // é a casa toda, então o menu tem uma linha só, a dela (sem "Dentro da…"), e o prédio arquivado sai do menu
  function naCasaDoAnfitriao(l) {
    var d = l.dentro && l.interior && Reino.Interiores && Reino.Interiores.def(l.interior);
    return !!(d && d.lugar === l.dentro);
  }
  // a casa e o interior ela já visitou antes da matéria chegar: a visita que tira o "Novo!" é a do id da matéria,
  // marcada quando ela entra no interior dela
  function novidadeDe(l) {
    if (!naCasaDoAnfitriao(l) || typeof l.novidade !== 'string') return l;
    return Object.assign({}, l, { novidade: { desde: l.novidade, interior: l.id } });
  }
  U.on(EV.CENA, function () {
    var c = Reino.Cena && Reino.Cena.atual();
    if (!c || c.tipo !== 'interior' || !Reino.Novidades || !window.Mapa || !Mapa.lugares) return;
    Mapa.lugares().forEach(function (l) { if (l.interior === c.id && naCasaDoAnfitriao(l)) Reino.Novidades.marcar(l.id); });
  });
  // matéria dentro de um prédio: onde ela fica ("No 3º andar do Observatório"), com o emoji do anfitrião
  function ondeFica(l) {
    if (!l.dentro || naCasaDoAnfitriao(l)) return null;
    var h = Mapa.lugar(l.dentro), dh = (h && menuDe(h)) || {};
    var emoji = typeof dh.emoji === 'function' ? dh.emoji(h) : (dh.emoji || '📍');
    var nome = l.anfitriaoNome || (h && h.nome) || '';
    var de = (h && h.artigo === 'a' ? 'da ' : 'do ') + nome;
    var texto = l.andar ? 'No ' + l.andar + ' ' + de : 'Dentro ' + de;
    return el('small.lugar-onde', iconePequeno(emoji, 16), el('span', hifenizar(texto)));
  }
  UI.ondeFica = ondeFica;

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

  UI.registrarLugarMenu('materia', {
    emoji: function (l) { return Reino.materia(l.materiaId).emoji; },
    info: function (l) {
      var m = Reino.materia(l.materiaId);
      return P.salasFeitas(m) + ' de ' + m.salas.length + ' salas • ' + U.reais(P.dinheiroMateria(m)).replace(' ', '\u00a0');   // "R$ 12,00" não quebra
    },
    avisos: function (l) {
      var m = Reino.materia(l.materiaId);
      if (m.arquivada) return [];
      var pronto = Reino.Cena && Reino.Cena.concluidos ? Reino.Cena.concluidos().indexOf(l.id) >= 0 : P.materiaCompleta(m);
      // "3 de 5 salas" já está na info: só o "Pronto" vira aviso
      return pronto ? [{ texto: 'Pronto', tipo: 'pronto' }] : [];
    },
    abrir: function (l) { return UI.telaMateria(Reino.materia(l.materiaId)); },
  });
  UI.registrarLugarMenu('castelo', { emoji: '🥇', info: function () { return Reino.materias.every(function (m) { return m.arquivada; }) ? 'Novos conteúdos em breve' : 'Treino da Medalha de Ouro'; }, abrir: function () { return UI.telaCastelo(); } });
  UI.registrarLugarMenu('escola', {
    emoji: '🏫', info: function () { return Reino.provas.every(function (p) { return p.arquivada; }) ? 'Novos conteúdos em breve' : 'Provas bimestrais valendo acessório'; },
    avisos: function () { return Reino.provas.some(function (pv) { return !pv.arquivada && !P.regProva(pv).premio; }) ? [{ texto: 'Prova', tipo: 'prova' }] : []; },
    abrir: function () { return Reino.Provas.telaEscola(); },
  });
  UI.registrarLugarMenu('estabulo', {
    emoji: '🦄', info: function () { var o = P.ovosParaChocar().length; return o ? '🥚 ' + o + ' para chocar!' : 'Seus unicórnios'; },
    avisos: function () { return P.ovosParaChocar().length ? [{ texto: 'Ovo', icone: '🥚', tipo: 'ovo' }] : []; },
    abrir: function () { return UI.telaEstabulo(); },
  });
  UI.registrarLugarMenu('bau', { emoji: '💰', info: function () { return U.reais(P.dinheiroTotal()) + ' guardados'; }, abrir: function () { return UI.telaBau(); } });
  UI.registrarLugarMenu('loja', {
    emoji: '🧚', info: function () { return '⭐ ' + P.estrelas() + (P.estrelas() === 1 ? ' estrela' : ' estrelas') + ' para gastar'; },
    abrir: function () { return UI.telaLoja(); },
  });
  UI.registrarLugarMenu('petshop', {
    emoji: '🐾', info: infoPetShop,
    avisos: function () {
      var av = [];
      if (!(cuidadosProntos() && uniChocado(P.montaria()))) return av;
      var b = {};
      try { b = Reino.Cuidados.baixo(P.montaria()) || {}; } catch (e) { b = {}; }
      ['sede', 'fome', 'banho'].forEach(function (c) { if (b[c]) av.push({ texto: CUIDADO[c].rotulo, icone: CUIDADO[c].icone, tipo: c }); });
      return av;
    },
    abrir: function () { return UI.telaPetShop(); },
  });
  // não tem tela própria, só o interior
  UI.registrarLugarMenu('observatorio', { emoji: '🔭', info: function () { return 'Curiosidades do espaço'; } });

  // matéria que espera o material novo (3º bimestre arquivado)
  function emEspera(l) {
    var m = l.tipo === 'materia' ? Reino.materia(l.materiaId) : null;
    return !!m && !!(Reino.Bimestres ? Reino.Bimestres.emEspera(m) : m.arquivada);
  }
  function chipsAvisos(l) {
    var av = UI.avisosDoLugar(l);
    if (!av.length) return null;
    return el('span.lugar-avisos', av.map(function (a) {
      return el('span.lugar-aviso.aviso-' + a.tipo, a.icone ? iconePequeno(a.icone, 16) : null, el('span', a.texto));
    }));
  }
  UI.telaLugares = function () {
    var pn = painel('lugares', '📋 Lugares do Reino');
    var lista = el('div.lista-salas.lugares-atlas');
    pn.conteudo.appendChild(el('div.lugares-capa', iconePequeno('🦄', 48), el('div',
      el('p.lugares-capitulo', '4º bimestre'), el('b', 'Seu reino de aventuras'),
      el('p', 'Escolha um lugar. Vamos até lá!'))));
    // as matérias ativas primeiro, depois as que esperam o material novo e os outros lugares; o prédio arquivado
    // cuja casa toda é de uma matéria ativa sai (a linha é a dela)
    var todos = Mapa.lugares();
    var ocupados = todos.filter(naCasaDoAnfitriao).map(function (l) { return l.dentro; });
    var vez = function (l) { return l.tipo !== 'materia' ? 2 : emEspera(l) ? 1 : 0; };
    var ordenados = todos.filter(function (l) { return !(ocupados.indexOf(l.id) >= 0 && emEspera(l)); })
      .map(function (l, i) { return { l: l, i: i }; })
      .sort(function (a, b) { return vez(a.l) - vez(b.l) || a.i - b.i; })
      .map(function (x) { return x.l; });
    // subtítulo a cada troca de grupo: as matérias de agora, as que esperam e os outros lugares
    var GRUPOS = [['Hora de estudar', 'Vamos aprender!'], ['Novos aprendizados', 'Em breve'], ['Explore o reino', 'Vamos passear!']];
    var grupo = null;
    ordenados.forEach(function (l) {
      var g = GRUPOS[vez(l)];
      if (g !== grupo) { grupo = g; lista.appendChild(el('h3.lugares-grupo', el('span', g[0]), el('small', g[1]))); }
      var d = menuDe(l) || {};
      var emoji = typeof d.emoji === 'function' ? d.emoji(l) : (d.emoji || '📍');
      var espera = emEspera(l);
      var info = espera ? 'Novos conteúdos em breve' : (d.info ? d.info(l) : 'Venha conhecer!');
      var b = el('button.sala-card', { type: 'button' }, el('span.sala-emoji', emoji), el('span.sala-info', el('b', { title: l.nome }, hifenizar(l.nome)), el('small', hifenizar(info)), ondeFica(l), espera ? null : chipsAvisos(l)), el('span.sala-ir', { 'aria-label': 'Ir' }, '→'));
      if (l.tipo === 'materia') {
        b.classList.add('lugar-materia');
        var materia = Reino.materia(l.materiaId);
        if (materia && materia.cor) b.style.setProperty('--cor-materia', materia.cor);
      }
      b.addEventListener('click', function (e) {
        UI.fecharTela(pn.tela);
        // o dedo que ainda bate no "Ir" cai no mapa e trocaria o destino: segura mais um pouco
        // (só perto desse toque; motor/entrada.js pergunta a UI.toqueSegurado)
        if (e.isTrusted && e.detail) UI.segurarToques(1500);
        focarMapa();   // ela vai andando sozinha: o foco não volta ao botão do menu (Espaço reabria Lugares)
        // a matéria que ocupa a casa toda vai pela porta do anfitrião, direto no interior de entrada dele
        U.emit(EV.IR_PARA, (naCasaDoAnfitriao(l) && Mapa.lugar(l.dentro)) || l);
      });
      lista.appendChild(b);
    });
    pn.conteudo.appendChild(lista);
  };
})();
