/* Telas por cima do mapa: HUD, lugares, estábulo, baú, loja, ajustes, pais, ovos. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var UI = {};
  var pilha = [];

  function est() { return P.estado(); }
  function aparencia() { return est().aparencia; }

  /* ---------- telas e diálogos ---------- */
  UI.abrirTela = function (nome) {
    var t = el('section.tela.tela-' + nome, { role: 'dialog', 'aria-modal': 'true' });
    U.$('#telas').appendChild(t);
    pilha.push(t);
    document.body.classList.add('com-tela');
    U.emit('telas', pilha.length);
    return t;
  };
  UI.fecharTela = function (t) {
    t = t || pilha[pilha.length - 1];
    if (!t) return;
    var i = pilha.indexOf(t);
    if (i >= 0) pilha.splice(i, 1);
    if (t.parentNode) t.parentNode.removeChild(t);
    if (!pilha.length) document.body.classList.remove('com-tela');
    U.emit('telas', pilha.length);
    UI.atualizarHUD();
  };
  UI.fecharTodas = function () { while (pilha.length) UI.fecharTela(pilha[pilha.length - 1]); };
  UI.temTela = function () { return pilha.length > 0; };

  // tela com cartão central, título e botão de fechar
  function painel(nome, titulo, opcoes) {
    opcoes = opcoes || {};
    var t = UI.abrirTela(nome);
    var fechar = el('button.btn-icone.btn-fechar', { type: 'button', 'aria-label': 'Fechar' }, '✕');
    var conteudo = el('div.painel-conteudo');
    var card = el('div.painel',
      el('header.painel-topo', el('h2.titulo-pixel', titulo), opcoes.semFechar ? null : fechar),
      conteudo);
    t.appendChild(card);
    fechar.addEventListener('click', function () { Reino.Som.tocar('toque'); Reino.Som.calar(); UI.fecharTela(t); if (opcoes.aoFechar) opcoes.aoFechar(); });
    t.addEventListener('click', function (e) { if (e.target === t && !opcoes.semFechar) fechar.click(); });
    return { tela: t, conteudo: conteudo, card: card };
  }
  UI.painel = painel;

  UI.confirmar = function (msg, sim, nao) {
    return new Promise(function (resolver) {
      var t = UI.abrirTela('confirmar');
      var bSim = el('button.btn-grande.btn-principal', { type: 'button' }, sim || 'Sim');
      var bNao = el('button.btn-grande.btn-secundario', { type: 'button' }, nao || 'Não');
      t.appendChild(el('div.painel.painel-pequeno', el('p.confirmar-msg', msg), el('div.intro-botoes', bNao, bSim)));
      bSim.addEventListener('click', function () { UI.fecharTela(t); resolver(true); });
      bNao.addEventListener('click', function () { UI.fecharTela(t); resolver(false); });
      setTimeout(function () { bNao.focus(); }, 30);
    });
  };

  /* ---------- confete ---------- */
  UI.confete = function (quantos) {
    if (!est().ajustes.animacoes) return;
    var c = el('canvas.confete');
    document.body.appendChild(c);
    var w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    var ctx = c.getContext('2d');
    var cores = ['#ff7eb6', '#ffd34d', '#7c5cff', '#39c5bb', '#5fb4ff', '#ff9d2e'];
    var ps = [];
    for (var i = 0; i < (quantos || 90); i++) ps.push({ x: Math.random() * w, y: -20 - Math.random() * h * 0.5, vy: 2 + Math.random() * 3, vx: -1 + Math.random() * 2, s: 6 + Math.floor(Math.random() * 3) * 3, c: cores[i % cores.length], r: Math.random() * 6 });
    var t0 = performance.now();
    (function passo(t) {
      ctx.clearRect(0, 0, w, h);
      ps.forEach(function (p) { p.y += p.vy; p.x += p.vx + Math.sin((t / 300) + p.r); ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); });
      if (t - t0 < 2600) requestAnimationFrame(passo); else c.remove();
    })(t0);
  };

  /* ---------- sprites prontos para a interface ---------- */
  UI.spriteMontaria = function (id, escala, opcoes) {
    var d = P.defUni(id);
    var u = est().unis[id];
    var e = Reino.Unicornios.estagio(u ? u.xp : 0);
    opcoes = opcoes || {};
    var spr = PA.unicornio(d, e, 0, { enfeites: opcoes.semEnfeite ? [] : (id === P.montaria() ? est().usando.enfeites : []), asasFada: !opcoes.semEnfeite && id === P.montaria() && est().usando.asasFada });
    return PA.paraDOM(spr, escala || 3);
  };

  /* ---------- tela cheia (esconde a barra do claude.ai em volta do jogo) ---------- */
  var ICONE_ABRIR = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  var ICONE_FECHAR = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  UI.telaCheiaDisponivel = function () { return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled); };
  UI.emTelaCheia = function () { return !!(document.fullscreenElement || document.webkitFullscreenElement); };
  UI.telaCheia = function (ligar) {
    var d = document, raiz = d.documentElement, p = null;
    if (!UI.telaCheiaDisponivel()) return;
    if (ligar === undefined) ligar = !UI.emTelaCheia();
    try {
      if (ligar && !UI.emTelaCheia()) p = raiz.requestFullscreen ? raiz.requestFullscreen({ navigationUI: 'hide' }) : raiz.webkitRequestFullscreen();
      else if (!ligar && UI.emTelaCheia()) p = d.exitFullscreen ? d.exitFullscreen() : d.webkitExitFullscreen();
    } catch (e) { p = null; }
    if (p && p.catch) p.catch(function () {});
  };
  function pintarBotaoTela() {
    var b = U.$('.btn-tela-cheia');
    if (!b) return;
    var cheia = UI.emTelaCheia();
    b.textContent = '';
    b.appendChild(PA.iconeEmoji(cheia ? '↙' : '↗', 2));
    b.setAttribute('aria-label', cheia ? 'Sair da tela cheia' : 'Tela cheia');
    b.title = cheia ? 'Sair da tela cheia' : 'Tela cheia';
  }
  document.addEventListener('fullscreenchange', pintarBotaoTela);
  document.addEventListener('webkitfullscreenchange', pintarBotaoTela);

  /* ---------- HUD ---------- */
  UI.montarHUD = function () {
    var hud = U.$('#hud');
    hud.innerHTML = '';
    var dinheiro = el('button.chip.chip-dinheiro', { type: 'button', 'aria-label': 'Baú do Tesouro' });
    var estrelas = el('button.chip.chip-estrelas', { type: 'button', 'aria-label': 'Loja das Fadas' });
    var ovos = el('button.chip.chip-ovos', { type: 'button', hidden: true });
    var montaria = el('button.chip-montaria', { type: 'button', 'aria-label': 'Estábulo' });
    var telaCheia = el('button.btn-tela-cheia', { type: 'button', hidden: !UI.telaCheiaDisponivel() });
    telaCheia.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaCheia(); });
    hud.appendChild(el('div.hud-topo', el('div.hud-esq', dinheiro, estrelas, ovos), el('div.hud-dir', telaCheia, montaria)));
    function botaoDock(acao, icone, linhas, aria) {
      var rot = el('small.dock-rotulo');
      linhas.forEach(function (l, i) {
        if (i) rot.appendChild(el('br'));
        rot.appendChild(document.createTextNode(l));
      });
      return el('button.dock-btn', { type: 'button', 'data-acao': acao, 'aria-label': aria },
        PA.paraDOM(PA.iconeMenu(icone), PA.escalaNitida(36, 16), 'dock-icone'), rot);
    }
    var dock = el('nav.dock', { 'aria-label': 'Menu' },
      botaoDock('missoes', 'lugares', ['Lugares'], 'Lugares'),
      botaoDock('estabulo', 'estabulo', ['Estábulo'], 'Estábulo'),
      botaoDock('plano', 'plano', ['Plano', 'da Prova'], 'Plano da Prova'),
      botaoDock('ajustes', 'ajustes', ['Ajustes'], 'Ajustes'));
    hud.appendChild(dock);
    pintarBotaoTela();
    dinheiro.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaBau(); });
    estrelas.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaLoja(); });
    ovos.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.chocarOvos(P.ovosParaChocar()); });
    montaria.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaEstabulo(); });
    dock.addEventListener('click', function (e) {
      var b = e.target.closest('.dock-btn'); if (!b) return;
      Reino.Som.tocar('toque');
      var a = b.getAttribute('data-acao');
      if (a === 'missoes') UI.telaLugares();
      if (a === 'estabulo') UI.telaEstabulo();
      if (a === 'plano') UI.telaPlano();
      if (a === 'ajustes') UI.telaAjustes();
    });
    UI.atualizarHUD();
  };

  UI.atualizarHUD = function () {
    var hud = U.$('#hud');
    if (!hud || !hud.firstChild || !est()) return;
    U.$('.chip-dinheiro', hud).innerHTML = '';
    U.$('.chip-dinheiro', hud).appendChild(el('span', '💰 ' + U.reais(P.dinheiroTotal())));
    U.preencher(U.$('.chip-estrelas', hud), '⭐ ' + P.estrelas());
    var ovos = P.ovosParaChocar();
    var cOvos = U.$('.chip-ovos', hud);
    cOvos.hidden = !ovos.length;
    U.preencher(cOvos, '🥚 ' + ovos.length + (ovos.length === 1 ? ' ovo!' : ' ovos!'));
    var m = U.$('.chip-montaria', hud);
    m.innerHTML = '';
    var id = P.montaria(), u = est().unis[id];
    var pe = Reino.Unicornios.progressoEstagio(u ? u.xp : 0);
    m.appendChild(UI.spriteMontaria(id, 2));
    m.appendChild(el('span.montaria-info',
      el('b', P.nomeUni(id)),
      el('span.montaria-estagio', Reino.Unicornios.ESTAGIOS[pe.estagio].emoji + ' ' + Reino.Unicornios.ESTAGIOS[pe.estagio].nome),
      el('span.barrinha', el('span', { style: { width: Math.round(pe.pct * 100) + '%' } }))));
  };

  /* ---------- lugares ---------- */
  UI.abrirLugar = function (lugar) {
    Reino.Som.tocar('porta');
    if (lugar.tipo === 'materia') return UI.telaMateria(Reino.materia(lugar.materiaId));
    if (lugar.tipo === 'castelo') return UI.telaCastelo();
    if (lugar.tipo === 'escola') return Reino.Provas.telaEscola();
    if (lugar.tipo === 'estabulo') return UI.telaEstabulo();
    if (lugar.tipo === 'bau') return UI.telaBau();
    if (lugar.tipo === 'loja') return UI.telaLoja();
  };

  function barraDinheiro(materia) {
    var ganho = P.dinheiroMateria(materia), total = Reino.config.valorPorMateria;
    return el('div.barra-dinheiro',
      el('div.barra-dinheiro-trilho', el('span', { style: { width: Math.round(ganho / total * 100) + '%' } })),
      el('span.barra-dinheiro-texto', U.reais(ganho) + ' de ' + U.reais(total)));
  }

  UI.telaMateria = function (materia) {
    var pn = painel('lugar', materia.lugar.nome);
    var c = pn.conteudo;
    var feitas = P.salasFeitas(materia);
    c.appendChild(el('div.lugar-guia', PA.paraDOM(PA.claude(0), 3, 'claude-intro'),
      el('p', feitas === 0 ? materia.guia : (feitas === materia.salas.length ? 'Você completou todas as salas! Agora pode treinar no Castelo da Medalha ou jogar as salas de novo para ganhar os raros. 🌈' : 'Você já fez ' + feitas + ' de ' + materia.salas.length + ' salas. Vamos para a próxima?'))));
    c.appendChild(barraDinheiro(materia));
    var lista = el('div.lista-salas');
    materia.salas.forEach(function (s, i) {
      var reg = est().salas[s.id] || {};
      var raro = (materia.unicornios || []).find(function (u) { return u.raridade === 'raro' && u.sala === s.id; });
      var temRaro = raro && P.temUni(raro.id);
      var chips = el('span.sala-chips',
        reg.feita ? el('span.chip-mini.ok', '✓ Feita') : el('span.chip-mini.nova', 'Nova!'),
        el('span.chip-mini', '💰 ' + U.reais(P.valorSala(materia))),
        temRaro ? el('span.chip-mini.raro', '💙 Raro') : null,
        reg.calma ? el('span.chip-mini.calma', '🌙 Calma') : null);
      var b = el('button.sala-card' + (reg.feita ? '.feita' : ''), { type: 'button' },
        el('span.sala-emoji', s.emoji),
        el('span.sala-info', el('b', (i + 1) + '. ' + s.nome), el('small', 'Apostila: ' + s.paginas), chips),
        el('span.sala-ir', reg.feita ? 'Jogar de novo' : 'Entrar →'));
      b.addEventListener('click', function () {
        Reino.Som.tocar('porta');
        Reino.Missao.iniciar(materia, s, function (premios) {
          UI.fecharTela(pn.tela);
          UI.telaMateria(materia);
          if (premios) Reino.Claude.depoisDaMissao();
          U.emit('mapaMudou');
        });
      });
      lista.appendChild(b);
    });
    c.appendChild(lista);
    var livro = el('button.btn-grande.btn-secundario', { type: 'button' }, '📖 ' + nomeLivro(materia));
    livro.addEventListener('click', function () { UI.abrirLivro(materia); });
    c.appendChild(el('div.intro-botoes', livro));
  };

  /* ---------- livro de resumos ---------- */
  // cada matéria pode dar nome ao seu livro (nomeLivro); o padrão é o da História
  function nomeLivro(materia) { return materia.nomeLivro || 'Livro das Memórias'; }
  UI.nomeLivro = nomeLivro;

  UI.abrirLivro = function (materia, cartaoId) {
    Reino.Voz.carregar(materia.id + '-livro');
    var pn = painel('livro', '📖 ' + nomeLivro(materia));
    var cartas = materia.livro;
    var i = Math.max(0, cartas.findIndex(function (c) { return c.id === cartaoId; }));
    var area = el('div.livro-carta');
    var ant = el('button.btn-grande.btn-secundario', { type: 'button' }, '←');
    var prox = el('button.btn-grande.btn-secundario', { type: 'button' }, '→');
    var ouvir = el('button.btn-grande.btn-principal', { type: 'button' }, '🔊 Ouvir');
    var pag = el('span.livro-pag');
    function mostrar() {
      var c = cartas[i];
      area.innerHTML = '';
      area.appendChild(el('div.livro-emoji', c.e));
      area.appendChild(el('h3', c.titulo));
      area.appendChild(el('p', c.texto));
      pag.textContent = (i + 1) + ' de ' + cartas.length;
      ant.disabled = i === 0; prox.disabled = i === cartas.length - 1;
      Reino.Som.calar();
    }
    ant.addEventListener('click', function () { if (i > 0) { i--; Reino.Som.tocar('toque'); mostrar(); } });
    prox.addEventListener('click', function () { if (i < cartas.length - 1) { i++; Reino.Som.tocar('toque'); mostrar(); } });
    ouvir.addEventListener('click', function () { Reino.Voz.carregar(materia.id + '-livro').then(function () { Reino.Som.falar([cartas[i].titulo, cartas[i].texto], { voz: 'narradora' }); }); });
    pn.conteudo.appendChild(area);
    pn.conteudo.appendChild(el('div.livro-nav', ant, pag, prox));
    if (Reino.Som.temVoz()) pn.conteudo.appendChild(el('div.intro-botoes', ouvir));
    mostrar();
  };

  /* ---------- castelo (treino da medalha) ---------- */
  UI.cartaoPlano = function () {
    return el('ol.plano-prova',
      el('li', el('span', '🌬️'), 'Respiro 3 vezes.'),
      el('li', el('span', '👀'), 'Leio cada pergunta 2 vezes.'),
      el('li', el('span', '✏️'), 'Respondo com calma.'),
      el('li', el('span', '🔁'), 'Reviso tudo, do começo ao fim.'),
      el('li', el('span', '📝'), 'Só entrego depois de revisar.'));
  };

  UI.telaPlano = function () {
    var pn = painel('plano', '🥇 Meu Plano da Prova');
    pn.conteudo.appendChild(UI.cartaoPlano());
    pn.conteudo.appendChild(el('div.aviso-medalha',
      el('span.aviso-medalha-icone', '🥇'),
      el('p', 'A medalha de ouro da escola vale ', el('b', U.reais(Reino.config.medalhaEscolaValor)), '! Ela vem das respostas certas, não de terminar primeiro.')));
    pn.conteudo.appendChild(el('p.plano-frase', '"Terminar por último é coisa de campeã!" 🏆'));
    var ouvir = el('button.btn-grande.btn-principal', { type: 'button' }, '🔊 Ouvir o plano');
    ouvir.addEventListener('click', function () { Reino.Som.falar(Reino.Falas.fixas.plano, { voz: 'claude' }); });
    if (Reino.Som.temVoz()) pn.conteudo.appendChild(el('div.intro-botoes', ouvir));
  };

  UI.telaCastelo = function () {
    var pn = painel('lugar', 'Castelo da Medalha');
    var c = pn.conteudo;
    c.appendChild(el('div.lugar-guia', PA.paraDOM(PA.claude(0), 3, 'claude-intro'),
      el('p', 'Aqui é o treino para a prova de verdade: sem relógio, com revisão antes de entregar. Na escola, a medalha de ouro vale ' + U.reais(Reino.config.medalhaEscolaValor) + '! 🥇')));
    var lista = el('div.lista-salas');
    Reino.materias.forEach(function (m) {
      var completa = P.materiaCompleta(m);
      var t = est().treinos[m.id] || {};
      var faltam = m.salas.length - P.salasFeitas(m);
      var medalha = { ouro: '🥇', prata: '🥈', bronze: '🥉' }[t.melhor];
      var b = el('button.sala-card' + (completa ? '' : '.bloqueada'), { type: 'button' },
        el('span.sala-emoji', m.emoji),
        el('span.sala-info', el('b', 'Treino de ' + m.nome),
          el('small', completa ? '10 perguntas de todas as salas' : 'Abre quando você terminar as salas. Falta' + (faltam === 1 ? ' 1 sala' : 'm ' + faltam + ' salas') + '!'),
          el('span.sala-chips', medalha ? el('span.chip-mini.ok', medalha + ' Melhor medalha') : null, t.vezes ? el('span.chip-mini', t.vezes + (t.vezes === 1 ? ' treino' : ' treinos')) : null)),
        el('span.sala-ir', completa ? 'Treinar →' : '🔒'));
      b.addEventListener('click', function () {
        if (!completa) {
          Reino.Som.tocar('toque');
          Reino.Claude.falar(Reino.Falas.treinoBloqueado(m, faltam));
          return;
        }
        Reino.Som.tocar('porta');
        Reino.Prova.iniciar(m, function () { UI.fecharTela(pn.tela); UI.telaCastelo(); U.emit('mapaMudou'); });
      });
      lista.appendChild(b);
    });
    c.appendChild(lista);
    var plano = el('button.btn-grande.btn-secundario', { type: 'button' }, '📜 Ver o Plano da Prova');
    plano.addEventListener('click', UI.telaPlano);
    c.appendChild(el('div.intro-botoes', plano));
  };

  /* ---------- baú do tesouro ---------- */
  UI.telaBau = function () {
    var pn = painel('lugar', '💰 Baú do Tesouro');
    var c = pn.conteudo;
    c.appendChild(el('div.bau-total', el('span.bau-moeda', '🪙'), el('div', el('small', 'Você já ganhou'), el('b', U.reais(P.dinheiroTotal())))));
    Reino.materias.forEach(function (m) {
      c.appendChild(el('div.bau-materia', el('b', m.emoji + ' ' + m.nome), barraDinheiro(m),
        el('small', P.salasFeitas(m) + ' de ' + m.salas.length + ' salas feitas • cada sala vale ' + U.reais(P.valorSala(m)))));
    });
    c.appendChild(el('div.aviso-medalha',
      el('span.aviso-medalha-icone', '🥇'),
      el('p', 'E tem mais: a medalha de ouro da escola vale ', el('b', U.reais(Reino.config.medalhaEscolaValor)), '! Para ganhar, é só fazer a prova com calma e revisar tudo antes de entregar.')));
    c.appendChild(el('p.bau-nota', 'Novas matérias vão chegar ao Reino, e cada uma vale mais ' + U.reais(Reino.config.valorPorMateria) + '!'));
  };

  /* ---------- loja das fadas ---------- */
  var ITENS = [
    { id: 'flor', nome: 'Flor na orelha', preco: 8, slot: 'orelha', icone: '🌸' },
    { id: 'laco', nome: 'Laço de fita', preco: 12, slot: 'orelha', icone: '🎀' },
    { id: 'oculos', nome: 'Óculos de coração', preco: 15, slot: 'olho', icone: '💗' },
    { id: 'capa', nome: 'Capa mágica (para você)', preco: 20, slot: 'capa', icone: '🦸' },
    { id: 'coroa', nome: 'Coroa real', preco: 25, slot: 'cabeca', icone: '👑' },
    { id: 'estrelinhas', nome: 'Rastro de estrelinhas', preco: 30, slot: 'rastro', icone: '✨' },
    { id: 'asasFada', nome: 'Asinhas de fada', preco: 45, slot: 'asas', icone: '🧚' },
  ];
  UI.ITENS_LOJA = ITENS;   // a Loja das Fadas por dentro mostra estes mesmos enfeites
  // acessórios ganhos nas provas da Escola usam os mesmos encaixes dos enfeites da loja
  function acessorioComoItem(a) { return { id: a.id, nome: a.nome, slot: PA.ENFEITES_MONTARIA[a.id].ancora, raridade: a.raridade, premio: true }; }
  function itemPorId(id) {
    var it = ITENS.find(function (x) { return x.id === id; });
    if (it) return it;
    var a = Reino.Provas && Reino.Provas.acessorio(id);
    return a ? acessorioComoItem(a) : null;
  }
  function usando(item) {
    var u = est().usando;
    if (item.slot === 'capa') return u.capa;
    if (item.slot === 'rastro') return u.estrelinhas;
    if (item.slot === 'asas') return u.asasFada;
    return u.enfeites.indexOf(item.id) >= 0;
  }
  function alternar(item) {
    var u = est().usando;
    if (item.slot === 'capa') u.capa = !u.capa;
    else if (item.slot === 'rastro') u.estrelinhas = !u.estrelinhas;
    else if (item.slot === 'asas') u.asasFada = !u.asasFada;
    else {
      var ja = u.enfeites.indexOf(item.id) >= 0;
      u.enfeites = u.enfeites.filter(function (id) { var it = itemPorId(id); return it && it.slot !== item.slot; });
      if (!ja) u.enfeites.push(item.id);
    }
  }

  UI.alternarEnfeite = function (id) { alternar(itemPorId(id)); };
  UI.usandoEnfeite = function (id) { return usando(itemPorId(id)); };

  UI.telaLoja = function () {
    var pn = painel('lugar', '🧚 Loja das Fadas');
    var c = pn.conteudo;
    var saldo = el('div.saldo-estrelas');
    var vitrine = el('div.vitrine-previa');
    var grade = el('div.grade-loja');
    var gradePremios = el('div.grade-loja');
    function pintar() {
      U.preencher(saldo, '⭐ Você tem ' + P.estrelas() + ' estrelas');
      vitrine.innerHTML = '';
      var id = P.montaria(), u = est().unis[id];
      var e = Reino.Unicornios.estagio(u ? u.xp : 0);
      var montada = e >= 1;
      var spr = montada
        ? PA.montada(P.defUni(id), e, 0, aparencia(), { enfeites: est().usando.enfeites, capa: est().usando.capa, asasFada: est().usando.asasFada })
        : PA.unicornio(P.defUni(id), e, 0, { enfeites: est().usando.enfeites, asasFada: est().usando.asasFada });
      vitrine.appendChild(PA.paraDOM(spr, 5));
      grade.innerHTML = '';
      ITENS.forEach(function (item) {
        var tem = !!est().loja[item.id];
        var b = el('button.item-loja' + (tem ? '.comprado' : '') + (usando(item) ? '.usando' : ''), { type: 'button' },
          el('span.item-icone', item.icone), el('b', item.nome),
          el('span.item-preco', tem ? (usando(item) ? '✓ Usando' : 'Usar') : '⭐ ' + item.preco));
        b.addEventListener('click', function () {
          if (tem) { alternar(item); Reino.Som.tocar('selecionar'); P.salvar(); pintar(); U.emit('mapaMudou'); return; }
          if (P.estrelas() < item.preco) {
            Reino.Som.tocar('toque');
            Reino.Claude.falar('Faltam ' + (item.preco - P.estrelas()) + ' estrelas para ' + item.nome + '. Cada acerto de primeira vale uma estrela! ⭐', { fala: [Reino.Falas.fixas.lojaFaltam] });
            return;
          }
          UI.confirmar('Trocar ' + item.preco + ' estrelas por ' + item.nome + '?', 'Sim, quero! ✨', 'Agora não').then(function (sim) {
            if (!sim) return;
            P.gastarEstrelas(item.preco);
            est().loja[item.id] = true;
            alternar(item);
            if (!usando(item)) alternar(item);
            P.salvar();
            Reino.Som.tocar('estrela'); UI.confete(40);
            pintar(); U.emit('mapaMudou');
          });
        });
        grade.appendChild(b);
      });
      // prêmios da Escola do Reino: não se compram, se ganham acertando a prova
      gradePremios.innerHTML = '';
      Reino.Provas.acessorios().forEach(function (a) {
        var item = acessorioComoItem(a);
        var tem = !!est().loja[a.id];
        var rar = Reino.Unicornios.RARIDADES[a.raridade];
        var desenho = tem ? Reino.Provas.icone(a.id, 36) : PA.paraDOM(PA.silhueta(PA.iconeDesenho('acessorio:' + a.id)), PA.escalaNitida(36, 16), 'icone-acessorio');
        var b = el('button.item-loja.item-premio.rar-' + a.raridade + (tem ? '.comprado' : '.bloqueado') + (tem && usando(item) ? '.usando' : ''), { type: 'button' },
          el('span.item-icone', desenho), el('b', a.nome),
          el('span.item-preco', tem ? (usando(item) ? '✓ Usando' : 'Usar') : '🔒 ' + rar.emoji + ' ' + rar.nome));
        b.addEventListener('click', function () {
          if (tem) { alternar(item); Reino.Som.tocar('selecionar'); P.salvar(); pintar(); U.emit('mapaMudou'); return; }
          Reino.Som.tocar('toque');
          Reino.Claude.falar(Reino.Falas.provas.lojaPremio);
        });
        gradePremios.appendChild(b);
      });
    }
    c.appendChild(saldo);
    c.appendChild(vitrine);
    c.appendChild(grade);
    c.appendChild(el('h3.estabulo-grupo', '🏫 Prêmios da Escola do Reino'));
    c.appendChild(el('p.bau-nota', 'Estes não se compram: você ganha acertando TUDO nas provas da Escola. Na 1ª tentativa é lendário! 🌈'));
    c.appendChild(gradePremios);
    c.appendChild(el('p.bau-nota', 'As fadas trocam estrelas por enfeites. Você ganha estrelas acertando de primeira e com a Estrela da Calma. 🌙'));
    pintar();
  };

  /* ---------- estábulo / álbum ---------- */
  UI.telaEstabulo = function () {
    var pn = painel('estabulo', '🦄 Estábulo Mágico');
    var c = pn.conteudo;
    var ovos = P.ovosParaChocar();
    if (ovos.length) {
      var bOvo = el('button.btn-grande.btn-principal.btn-ovos', { type: 'button' }, '🥚 Chocar ' + (ovos.length === 1 ? '1 ovo' : ovos.length + ' ovos'));
      bOvo.addEventListener('click', function () { UI.fecharTela(pn.tela); UI.chocarOvos(ovos).then(UI.telaEstabulo); });
      c.appendChild(bOvo);
    }
    var todos = Reino.Unicornios.todos(est().corInicial);
    var ganhos = todos.filter(function (d) { return P.temUni(d.id); }).length;
    c.appendChild(el('p.estabulo-contagem', 'Sua coleção: ', el('b', ganhos + ' de ' + todos.length), ' unicórnios'));
    var grupos = [{ titulo: 'Primeiro amigo', lista: todos.filter(function (d) { return !d.materiaId; }) }];
    Reino.materias.forEach(function (m) { grupos.push({ titulo: m.emoji + ' ' + m.nome, lista: todos.filter(function (d) { return d.materiaId === m.id; }) }); });
    grupos.forEach(function (g) {
      c.appendChild(el('h3.estabulo-grupo', g.titulo));
      var grade = el('div.grade-unis');
      g.lista.forEach(function (d) { grade.appendChild(cartaUni(d, function () { UI.fecharTela(pn.tela); UI.telaEstabulo(); })); });
      c.appendChild(grade);
    });
  };

  function cartaUni(d, aoMudar) {
    var u = est().unis[d.id];
    var tem = u && u.chocado;
    var carta = el('button.carta-uni.rar-' + d.raridade + (tem ? '' : '.escondida') + (d.id === P.montaria() ? '.montado' : ''), { type: 'button' });
    var rar = Reino.Unicornios.RARIDADES[d.raridade];
    if (tem) {
      var pe = Reino.Unicornios.progressoEstagio(u.xp);
      carta.appendChild(UI.spriteMontaria(d.id, 3, { semEnfeite: true }));
      carta.appendChild(el('b.carta-nome', P.nomeUni(d.id)));
      carta.appendChild(el('span.carta-rar', rar.emoji + ' ' + rar.nome));
      carta.appendChild(el('span.carta-estagio', Reino.Unicornios.ESTAGIOS[pe.estagio].emoji + ' ' + Reino.Unicornios.ESTAGIOS[pe.estagio].nome));
      carta.appendChild(el('span.barrinha', el('span', { style: { width: Math.round(pe.pct * 100) + '%' } })));
      if (d.id === P.montaria()) carta.insertBefore(el('span.selo-montado', '🐴 Montaria'), carta.firstChild);
    } else if (u && !u.chocado) {
      carta.appendChild(PA.paraDOM(PA.ovo(d.raridade, 0), 4));
      carta.appendChild(el('b.carta-nome', 'Ovo ' + rar.nome));
      carta.appendChild(el('span.carta-rar', 'Toque para chocar!'));
    } else {
      carta.appendChild(PA.paraDOM(PA.silhueta(PA.unicornio(d, 3, 0)), 3, 'silhueta'));
      carta.appendChild(el('b.carta-nome', '???'));
      carta.appendChild(el('span.carta-rar', rar.emoji + ' ' + rar.nome));
    }
    carta.addEventListener('click', function () {
      Reino.Som.tocar('toque');
      if (u && !u.chocado) { UI.chocarOvos([d.id]).then(aoMudar); return; }
      detalheUni(d, aoMudar);
    });
    return carta;
  }

  function detalheUni(d, aoMudar) {
    var u = est().unis[d.id];
    var tem = u && u.chocado;
    var rar = Reino.Unicornios.RARIDADES[d.raridade];
    var pn = painel('detalhe', tem ? P.nomeUni(d.id) : 'Unicórnio misterioso');
    var c = pn.conteudo;
    if (!tem) {
      c.appendChild(el('div.detalhe-sprite', PA.paraDOM(PA.silhueta(PA.unicornio(d, 3, 0)), 7, 'silhueta')));
      c.appendChild(el('p.detalhe-rar.rar-' + d.raridade, rar.emoji + ' ' + rar.nome));
      c.appendChild(el('p.detalhe-como', '🔎 Como ganhar: ' + Reino.Unicornios.comoGanhar(d)));
      return;
    }
    var pe = Reino.Unicornios.progressoEstagio(u.xp);
    var E = Reino.Unicornios.ESTAGIOS;
    c.appendChild(el('div.detalhe-sprite.rar-' + d.raridade, UI.spriteMontaria(d.id, 7, { semEnfeite: true })));
    c.appendChild(el('p.detalhe-rar.rar-' + d.raridade, rar.emoji + ' ' + rar.nome));
    c.appendChild(el('p.detalhe-frase', '"' + d.frase + '"'));
    var trilha = el('ol.trilha-estagios');
    E.forEach(function (s, i) { trilha.appendChild(el('li' + (i <= pe.estagio ? '.alcancado' : ''), el('span', s.emoji), el('small', s.nome))); });
    c.appendChild(trilha);
    c.appendChild(el('p.detalhe-xp', pe.estagio >= E.length - 1 ? 'Já é adulto! 👑' : 'Faltam ' + pe.falta + ' pontinhos para virar ' + E[pe.estagio + 1].nome + '. Ele cresce quando é sua montaria e você acerta!'));
    if (pe.estagio === 0) c.appendChild(el('p.detalhe-dica', '🍼 Bebês ainda não aguentam carregar ninguém: eles andam do seu lado. Quando crescer, dá para montar!'));
    var botoes = el('div.intro-botoes');
    if (d.id !== P.montaria()) {
      var montar = el('button.btn-grande.btn-principal', { type: 'button' }, pe.estagio === 0 ? 'Passear junto 🐾' : 'Montar 🐴');
      montar.addEventListener('click', function () {
        est().montaria = d.id; P.salvar(); Reino.Som.tocar('selecionar');
        UI.fecharTela(pn.tela); if (aoMudar) aoMudar(); U.emit('mapaMudou');
        Reino.Claude.falar(P.nomeUni(d.id) + ': "' + d.frase + '"', { tempo: 5000, fala: [d.frase], voz: 'unicornio' });
      });
      botoes.appendChild(montar);
    }
    var renomear = el('button.btn-grande.btn-secundario', { type: 'button' }, '✏️ Mudar o nome');
    renomear.addEventListener('click', function () {
      UI.pedirNome('Qual vai ser o novo nome?', P.nomeUni(d.id)).then(function (nome) {
        if (!nome) return;
        u.nome = nome; P.salvar(); UI.fecharTela(pn.tela); detalheUni(d, aoMudar); U.emit('mapaMudou');
      });
    });
    botoes.appendChild(renomear);
    c.appendChild(botoes);
  }

  UI.pedirNome = function (pergunta, atual) {
    return new Promise(function (resolver) {
      var t = UI.abrirTela('confirmar');
      var input = el('input#campo-nome.campo-nome', { type: 'text', maxlength: 18, value: atual || '', autocomplete: 'off', 'aria-label': pergunta });
      var ok = el('button.btn-grande.btn-principal', { type: 'button' }, 'Pronto! ✨');
      var sug = el('div.sugestoes');
      ['Estrelinha', 'Purpurina', 'Algodão', 'Arco-Íris', 'Luna', 'Docinho', 'Brilho'].forEach(function (s) {
        var b = el('button.chip-mini.sugestao', { type: 'button' }, s);
        b.addEventListener('click', function () { input.value = s; Reino.Som.tocar('toque'); });
        sug.appendChild(b);
      });
      t.appendChild(el('div.painel.painel-pequeno', el('p.confirmar-msg', pergunta), input, sug, el('div.intro-botoes', ok)));
      function fim() { var v = input.value.trim(); UI.fecharTela(t); resolver(v ? v.slice(0, 18) : atual); }
      ok.addEventListener('click', fim);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') fim(); });
      setTimeout(function () { input.focus(); input.select(); }, 50);
    });
  };

  /* ---------- chocar ovos ---------- */
  UI.chocarOvos = function (ids) {
    ids = (ids || []).filter(function (id) { return est().unis[id] && !est().unis[id].chocado; });
    var seq = Promise.resolve();
    ids.forEach(function (id) { seq = seq.then(function () { return chocarUm(id); }); });
    return seq.then(function () { UI.atualizarHUD(); });
  };

  function chocarUm(id, opcoes) {
    opcoes = opcoes || {};
    return new Promise(function (resolver) {
      var d = P.defUni(id);
      var rar = Reino.Unicornios.RARIDADES[d.raridade];
      var t = UI.abrirTela('ovo');
      var toques = 0;
      var ovoBox = el('button.ovo-grande.rar-' + d.raridade, { type: 'button', 'aria-label': 'Toque no ovo' });
      function pintarOvo() { ovoBox.innerHTML = ''; ovoBox.appendChild(PA.paraDOM(PA.ovo(d.raridade, toques), 10)); }
      pintarOvo();
      var texto = el('p.ovo-texto', Reino.Falas.ovo(d.raridade));
      var card = el('div.painel.painel-ovo.rar-' + d.raridade, el('h2.titulo-pixel', rar.emoji + ' Ovo ' + rar.nome), ovoBox, texto);
      t.appendChild(card);
      Reino.Som.falar(texto.textContent, { voz: 'claude' });
      ovoBox.addEventListener('click', function () {
        if (toques >= 3) return;
        toques++;
        ovoBox.classList.remove('balanca'); void ovoBox.offsetWidth; ovoBox.classList.add('balanca');
        Reino.Som.tocar('rachar');
        pintarOvo();
        if (toques < 3) { texto.textContent = toques === 1 ? 'Está mexendo! Mais 2 toques!' : 'Quase! Mais 1 toque!'; return; }
        setTimeout(nasceu, 450);
      });
      function nasceu() {
        P.chocar(id); P.salvar();
        Reino.Som.tocar('chocar');
        UI.confete(d.raridade === 'lendario' ? 160 : 90);
        card.innerHTML = '';
        card.appendChild(el('h2.titulo-pixel', d.raridade === 'lendario' ? '🌈 UM LENDÁRIO! 🌈' : 'Nasceu!'));
        card.appendChild(el('div.detalhe-sprite.nascimento.rar-' + d.raridade, PA.paraDOM(PA.unicornio(d, 0, 0), 9)));
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
          montar.addEventListener('click', function () { est().montaria = id; P.salvar(); UI.fecharTela(t); U.emit('mapaMudou'); resolver(); });
          guardar.addEventListener('click', function () { UI.fecharTela(t); resolver(); });
          botoes.appendChild(guardar); botoes.appendChild(montar);
        }
        card.appendChild(botoes);
        Reino.Som.falar([d.raridade === 'lendario' ? Reino.Falas.fixas.lendario : Reino.Falas.fixas.nasceu, { texto: d.frase, voz: 'unicornio' }], { voz: 'claude' });
      }
    });
  }
  UI.chocarUm = chocarUm;

  /* ---------- lista rápida de lugares ---------- */
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
      else if (l.tipo === 'loja') { emoji = '🧚'; info = '⭐ ' + P.estrelas() + ' estrelas para gastar'; }
      var b = el('button.sala-card', { type: 'button' }, el('span.sala-emoji', emoji), el('span.sala-info', el('b', l.nome), el('small', info)), el('span.sala-ir', 'Ir →'));
      b.addEventListener('click', function () { UI.fecharTela(pn.tela); U.emit('irPara', l); });
      lista.appendChild(b);
    });
    pn.conteudo.appendChild(lista);
  };

  /* ---------- ajustes ---------- */
  UI.telaAjustes = function () {
    var pn = painel('ajustes', '⚙️ Ajustes');
    var a = est().ajustes;
    function interruptor(chave, rotulo, desc, depois) {
      var b = el('button.interruptor', { type: 'button', role: 'switch', 'aria-checked': String(!!a[chave]) }, el('span.interruptor-texto', el('b', rotulo), el('small', desc)), el('span.interruptor-bola'));
      b.addEventListener('click', function () {
        a[chave] = !a[chave]; b.setAttribute('aria-checked', String(!!a[chave])); P.salvar(); Reino.Som.tocar('toque'); if (depois) depois(a[chave]);
      });
      return b;
    }
    var c = pn.conteudo;
    c.appendChild(interruptor('som', '🔔 Sons', 'Sons de acerto, moedas e ovos.'));
    c.appendChild(interruptor('musica', '🎵 Musiquinha', 'Música bem baixinha enquanto joga.', function (v) { Reino.Som.musica(v); }));
    c.appendChild(interruptor('voz', '🗣️ Voz', 'Ler perguntas e falas em voz alta.'));
    c.appendChild(interruptor('animacoes', '✨ Animações', 'Confete, brilhos e água mexendo.', function () { U.emit('mapaMudou'); }));
    c.appendChild(interruptor('setas', '🕹️ Setas na tela', 'Botões de seta para andar pelo reino.', function () { U.emit('setas'); }));
    var tam = el('button.interruptor', { type: 'button', role: 'switch', 'aria-checked': String(a.texto > 1) }, el('span.interruptor-texto', el('b', '🔠 Letras grandes'), el('small', 'Deixa os textos maiores.')), el('span.interruptor-bola'));
    tam.addEventListener('click', function () { a.texto = a.texto > 1 ? 1 : 1.15; tam.setAttribute('aria-checked', String(a.texto > 1)); UI.aplicarAjustes(); P.salvar(); });
    c.appendChild(tam);
    var pers = el('button.btn-grande.btn-secundario', { type: 'button' }, '👧 Mudar minha personagem');
    pers.addEventListener('click', function () { UI.fecharTela(pn.tela); UI.telaAparencia().then(function () { U.emit('mapaMudou'); }); });
    var pais = el('button.btn-grande.btn-secundario', { type: 'button' }, '🔒 Área dos pais');
    pais.addEventListener('click', function () { UI.fecharTela(pn.tela); UI.telaPais(); });
    c.appendChild(el('div.intro-botoes.coluna', pers, pais));
  };

  UI.aplicarAjustes = function () {
    var a = est().ajustes;
    document.documentElement.style.setProperty('--escala-texto', String(a.texto || 1));
    document.body.classList.toggle('sem-animacao', !a.animacoes);
  };

  /* ---------- aparência ---------- */
  UI.telaAparencia = function (primeiraVez) {
    return new Promise(function (resolver) {
      var pn = painel('aparencia', primeiraVez ? 'Como você é?' : '👧 Minha personagem', { semFechar: !!primeiraVez, aoFechar: resolver });
      var ap = aparencia();
      var previa = el('div.previa-personagem');
      function pintar() { previa.innerHTML = ''; previa.appendChild(PA.paraDOM(PA.mariana(ap, false, 0), 8)); }
      var grupos = [['pele', 'Pele'], ['cabelo', 'Cabelo'], ['roupa', 'Roupa'], ['laco', 'Laço']];
      pn.conteudo.appendChild(previa);
      grupos.forEach(function (g) {
        var linha = el('div.linha-cores', el('span.rotulo-cor', g[1]));
        PA.OPCOES_APARENCIA[g[0]].forEach(function (cor) {
          var b = el('button.bolinha-cor', { type: 'button', 'aria-label': g[1] + ' ' + cor, 'aria-pressed': String(ap[g[0]] === cor), style: { background: cor } });
          b.addEventListener('click', function () {
            ap[g[0]] = cor; Reino.Som.tocar('selecionar'); pintar();
            U.$$('button', linha).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          });
          linha.appendChild(b);
        });
        pn.conteudo.appendChild(linha);
      });
      var ok = el('button.btn-grande.btn-principal', { type: 'button' }, 'Pronto! ✨');
      ok.addEventListener('click', function () { P.salvar(); UI.fecharTela(pn.tela); resolver(); });
      pn.conteudo.appendChild(el('div.intro-botoes', ok));
      pintar();
    });
  };

  /* ---------- área dos pais ---------- */
  UI.telaPais = function () {
    var pn = painel('pais', '🔒 Área dos pais');
    var c = pn.conteudo;
    var digitado = '';
    var visor = el('div.pin-visor', '• • • •');
    var teclado = el('div.pin-teclado');
    c.appendChild(el('p', 'Digite o PIN dos pais (definido em js/config.js).'));
    c.appendChild(visor);
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].forEach(function (k) {
      var b = el('button.pin-tecla', { type: 'button' }, k);
      b.addEventListener('click', function () {
        if (k === '⌫') digitado = digitado.slice(0, -1);
        else if (k === 'OK') { verificar(); return; }
        else if (digitado.length < 8) digitado += k;
        visor.textContent = digitado ? digitado.replace(/./g, '● ') : '• • • •';
      });
      teclado.appendChild(b);
    });
    c.appendChild(teclado);
    function verificar() {
      if (digitado === String(Reino.config.pinPais)) { c.innerHTML = ''; conteudoPais(c, pn); }
      else { visor.textContent = 'PIN errado'; digitado = ''; Reino.Som.tocar('erro'); }
    }
  };

  function conteudoPais(c, pn) {
    var total = 0, pagoTotal = 0;
    Reino.materias.forEach(function (m) {
      var ganho = P.dinheiroMateria(m), pago = P.pago(m.id);
      total += ganho; pagoTotal += pago;
      var campo = el('input.campo-pago#pago-' + m.id, { type: 'number', min: 0, step: 1, value: pago, 'aria-label': 'Valor já pago de ' + m.nome });
      var salvar = el('button.btn-pequeno', { type: 'button' }, 'Registrar pagamento');
      salvar.addEventListener('click', function () { P.registrarPagamento(m.id, parseFloat(campo.value) || 0); UI.fecharTela(pn.tela); UI.telaPais(); });
      var t = est().treinos[m.id] || {};
      c.appendChild(el('div.pais-materia',
        el('h3', m.emoji + ' ' + m.nome),
        el('p', 'Salas feitas: ', el('b', P.salasFeitas(m) + ' de ' + m.salas.length), ' • Ganhou: ', el('b', U.reais(ganho)), ' • Já pago: ', el('b', U.reais(pago)), ' • A pagar: ', el('b', U.reais(Math.max(0, ganho - pago)))),
        el('p', 'Treino da Medalha: ', el('b', t.melhor ? ({ ouro: '🥇 ouro', prata: '🥈 prata', bronze: '🥉 bronze' }[t.melhor]) : 'ainda não fez'), t.vezes ? ' (' + t.vezes + ' vezes)' : ''),
        Reino.provas.filter(function (pv) { return pv.materiaId === m.id; }).map(function (pv) {
          var r = P.regProva(pv);
          return el('p', pv.nome + ' (' + pv.bimestre + '): ',
            r.tentativas ? el('b', r.tentativas + (r.tentativas === 1 ? ' tentativa' : ' tentativas')) : el('b', 'ainda não fez'),
            r.tentativas ? ' • notas: ' + r.notas.map(Reino.Provas.formatarNota).join(' → ') : '',
            ' • prêmio: ', el('b', r.premio ? Reino.Unicornios.RARIDADES[r.premio].emoji + ' ' + pv.acessorios[r.premio].nome : 'ainda não ganhou'));
        }),
        el('div.pais-pagar', el('label', { for: 'pago-' + m.id }, 'Já pago (R$):'), campo, salvar)));
    });
    c.appendChild(el('div.bau-total', el('span.bau-moeda', '🪙'), el('div', el('small', 'Total ganho no jogo'), el('b', U.reais(total)), el('small', 'A pagar: ' + U.reais(Math.max(0, total - pagoTotal))))));
    var nuvem = P.statusNuvem();
    c.appendChild(el('p.pais-nota', nuvem === 'local'
      ? '💾 O progresso está salvo neste aparelho.'
      : '☁️ O progresso está sincronizado entre os aparelhos pelo claude.ai.'));
    c.appendChild(el('p.pais-nota', 'A medalha de ouro da escola (R$' + Reino.config.medalhaEscolaValor + ') é combinada fora do jogo. O jogo só lembra a Mariana de fazer a prova com calma.'));
    var ciclo = el('button.btn-grande.btn-secundario', { type: 'button' }, '🔄 Começar novo ciclo de provas');
    ciclo.addEventListener('click', function () {
      UI.confirmar('Zerar salas, treinos, dinheiro e pagamentos para um novo ciclo de provas? Os unicórnios, as estrelas e os enfeites continuam.', 'Sim, zerar', 'Cancelar').then(function (sim) {
        if (!sim) return; P.novoCiclo(); UI.fecharTela(pn.tela); UI.telaPais(); U.emit('mapaMudou');
      });
    });
    var apagar = el('button.btn-grande.btn-perigo', { type: 'button' }, '🗑️ Apagar tudo');
    apagar.addEventListener('click', function () {
      UI.confirmar('Apagar TODO o progresso, inclusive unicórnios e estrelas? Isso não dá para desfazer.', 'Apagar tudo', 'Cancelar').then(function (sim) {
        if (!sim) return;
        UI.confirmar('Tem certeza mesmo? A Mariana vai começar do zero.', 'Sim, apagar', 'Não').then(function (sim2) {
          if (!sim2) return; P.apagarTudo(); location.reload();
        });
      });
    });
    c.appendChild(el('div.intro-botoes.coluna', ciclo, apagar));
  }

  window.Reino.UI = UI;
})();
