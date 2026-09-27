/* Início do jogo: carrega o progresso, liga o canvas, a Cena e os controles, e as telas de entrada
   (início, boas-vindas, cor do primeiro unicórnio, regras, esperar o progresso).
   A câmera e o pintor ficam em motor/camera.js, o quadro e o laço em motor/laco.js, os controles
   em motor/entrada.js (todos compartilham Reino._motor). O que é de cada cena (placas dos
   cômodos, Claude, portas, NPCs) fica em cena.js e nos interiores. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso, UI = Reino.UI, J = Jogador, T = Mapa.T, Cena = Reino.Cena;
  var EV = Reino.EVENTOS;
  var V = Reino._motor, est = V.est, pintor = V.pintor;

  /* ---------- telas de entrada ---------- */
  // a abertura (js/ui/abertura.js): cena animada na tela inteira + o título "Reino dos Unicórnios"
  function logo() {
    return UI.abertura({ montaria: Reino.Unicornios.def('inicial', est().corInicial), aparencia: est().aparencia }).el;
  }

  function telaInicio() {
    return new Promise(function (resolver) {
      var t = UI.abrirTela('inicio');
      var cena = UI.abertura({ montaria: Reino.Unicornios.def('inicial', est().corInicial), aparencia: est().aparencia });
      var ir = el('button.btn-grande.btn-principal.btn-comecar.btn-pulsar', { type: 'button' }, 'Entrar no Reino ✨');
      var botoes = el('div.inicio-botoes', ir);
      var nomes = Reino.materias.map(function (m) { return m.nome; });
      // contrato com a tela de jogadores: o botão só aparece quando ela existe
      if (typeof UI.trocarJogador === 'function') {
        var trocar = el('button.btn-pequeno.btn-trocar-jogador', { type: 'button' }, 'Trocar jogador');
        trocar.addEventListener('click', function () { UI.trocarJogador(); });
        botoes.appendChild(trocar);
      }
      t.appendChild(el('div.inicio', cena.el, el('div.inicio-baixo', botoes,
        el('p.inicio-sub.inicio-materias', 'Revisão de ' + nomes.slice(0, -1).join(', ') + (nomes.length > 1 ? ' e ' : '') + nomes[nomes.length - 1]))));
      var foi = false;
      ir.addEventListener('click', function () {
        if (foi) return;
        foi = true;
        Reino.Som.ativar(); Reino.Som.tocar('porta');
        UI.telaCheia(true);
        if (est().ajustes.musica) Reino.Som.musica(true);
        cena.entrar().then(function () { UI.fecharTela(t); resolver(); });   // brilho e zoom no castelo
      });
      setTimeout(function () { ir.focus(); }, 50);
    });
  }

  function telaBemVinda() {
    return new Promise(function (resolver) {
      var t = UI.abrirTela('inicio');
      var ir = el('button.btn-grande.btn-principal.btn-comecar', { type: 'button' }, 'Vamos lá! ✨');
      t.appendChild(el('div.inicio', logo(),
        el('div.intro-claude.intro-claude-grande', PA.paraDOM(PA.claude(0), 5, 'claude-intro'),
          el('p', 'Oi, ' + Reino.Jogadores.perfil().nome + '! Eu sou o Claude! Vou ser o seu guia neste reino mágico cheio de unicórnios. Aqui a gente revisa a matéria da escola brincando!')),
        ir));
      ir.addEventListener('click', function () {
        Reino.Som.ativar(); Reino.Som.tocar('porta');
        UI.telaCheia(true);
        UI.fecharTela(t); resolver();
      });
    });
  }

  function escolherCor() {
    return new Promise(function (resolver) {
      var pn = UI.painel('cores', 'Escolha seu primeiro unicórnio', { semFechar: true });
      pn.conteudo.appendChild(el('p', 'Qual cor você quer? Ele vai nascer de um ovo mágico! 🥚'));
      var grade = el('div.grade-unis');
      Object.keys(Reino.Unicornios.CORES_INICIAIS).forEach(function (k) {
        var c = Reino.Unicornios.CORES_INICIAIS[k];
        var d = { id: 'prev-' + k, raridade: 'comum', cores: { corpo: c.corpo, crina: c.crina, chifre: c.chifre } };
        var b = el('button.carta-uni.rar-comum', { type: 'button' }, PA.paraDOM(PA.unicornio(d, 3, 0), 3), el('b.carta-nome', c.nome));
        b.addEventListener('click', function () { Reino.Som.tocar('selecionar'); UI.fecharTela(pn.tela); resolver(k); });
        grade.appendChild(b);
      });
      pn.conteudo.appendChild(grade);
    });
  }

  function telaRegras() {
    return new Promise(function (resolver) {
      var pn = UI.painel('regras', 'Como funciona o Reino', { semFechar: true });
      var ir = el('button.btn-grande.btn-principal', { type: 'button' }, 'Entrar no Reino 🦄');
      pn.conteudo.appendChild(el('ul.regras',
        el('li', el('span.regra-icone', '🏛️'), el('span', el('b', 'Missões: '), 'cada matéria tem um lugar no reino, com 5 salas: ' + Reino.materias.map(function (m) { return m.lugar.nome + ' (' + m.nome + ')'; }).join(', ').replace(/, ([^,]*)$/, ' e $1') + '.')),
        el('li', el('span.regra-icone', '💰'), el('span', el('b', 'Dinheiro: '), 'cada sala vale ' + U.reais(P.valorSala(Reino.materias[0])) + '. A revisão inteira de uma matéria vale ' + U.reais(Reino.config.valorPorMateria) + '!')),
        el('li', el('span.regra-icone', '🦄'), el('span', el('b', 'Unicórnios: '), 'ganhe ovos de unicórnio comum, raro, épico e lendário. Eles nascem bebês e crescem quando você acerta!')),
        el('li', el('span.regra-icone', '⏳'), el('span', el('b', 'Sem relógio: '), 'aqui ninguém tem pressa. Leia com calma e toque em "Conferir".')),
        el('li.regra-destaque', el('span.regra-icone', '🥇'), el('span', el('b', 'A medalha de ouro da escola vale ' + U.reais(Reino.config.medalhaEscolaValor) + '! '), 'Ela vem de acertar com calma e revisar a prova, não de terminar primeiro.'))));
      pn.conteudo.appendChild(el('div.intro-botoes', ir));
      ir.addEventListener('click', function () { Reino.Som.tocar('porta'); UI.fecharTela(pn.tela); resolver(); });
    });
  }

  function primeiraVez() {
    return telaBemVinda()
      .then(function () { return UI.telaAparencia(true); })
      .then(escolherCor)
      .then(function (cor) {
        est().corInicial = cor;
        P.ganharUni('inicial');
        est().montaria = 'inicial';
        P.salvar(true);
        return UI.chocarUm('inicial', { primeiro: true });
      })
      .then(function () {
        est().comecou = true;
        P.salvar();
        return telaRegras();
      });
  }

  function entrarNoReino(novo) {
    V.jogoAtivo = true;
    U.$('#hud').hidden = false;
    UI.montarHUD();
    V.montarControle();
    J.posicionar(Mapa.inicio.x, Mapa.inicio.y);
    V.desenhar(performance.now());
    // fome e sede da montaria (módulo cuidados) só contam daqui em diante (jogo aberto e ela jogando)
    // módulos (js/nucleo/modulos.js): iniciar antes das boas-vindas, depoisDasBoasVindas depois
    var ctxModulo = { novo: !!novo, tutorial: null };
    Reino.modulos.forEach(function (m) { if (m.iniciar) m.iniciar(ctxModulo); });
    var tutorial = null;
    if (novo) {
      tutorial = Reino.Claude.falar(Reino.Falas.tutorialMapa(Reino.materias[0]))
        .then(function () { return Reino.Claude.falar(Reino.Claude.frase('dica')); });
    } else if (!Reino.congelado) {   // modo determinístico dos testes (js/nucleo/congelar.js): sem boas-vindas
      var ovos = P.ovosParaChocar().length;
      var oi = Reino.Claude.frase('boasVindas');
      Reino.Claude.falar(oi + (ovos ? ' E você tem ' + (ovos === 1 ? 'um ovo' : ovos + ' ovos') + ' para chocar! 🥚' : ''), { fala: [oi, ovos ? Reino.Falas.fixas.ovosParaChocar : null] });
    }
    // pergunta surpresa (módulo): o relógio só começa depois do tutorial da primeira vez
    ctxModulo.tutorial = tutorial;
    Reino.modulos.forEach(function (m) { if (m.depoisDasBoasVindas) m.depoisDasBoasVindas(ctxModulo); });
  }

  /* o jogo só começa com o progresso guardado em mãos (servidor de casa ou claude.ai):
     sem ele, um aparelho novo abriria a primeira vez e trocaria as escolhas dela */
  function esperarProgresso() {
    return new Promise(function (resolver) {
      var t = null, msg = null, botao = null;
      function aviso(texto) {
        var novo = el('p.inicio-sub', texto);
        msg.parentNode.replaceChild(novo, msg);
        msg = novo;
      }
      function mostrar() {
        if (t) return;
        t = UI.abrirTela('inicio');
        msg = el('p.inicio-sub', 'Abrindo o reino...');
        botao = el('button.btn-grande.btn-principal.btn-comecar', { type: 'button' }, 'Tentar de novo 🔄');
        botao.hidden = true;
        botao.addEventListener('click', tentar);
        t.appendChild(el('div.inicio', logo(), msg, botao));
      }
      function tentar() {
        if (t) { aviso('Abrindo o reino...'); botao.hidden = true; }
        var espera = setTimeout(mostrar, 400);   // resposta rápida: nem aparece
        P.iniciarNuvem().then(function () {
          clearTimeout(espera);
          if (t) UI.fecharTela(t);
          resolver();
        }, function () {
          clearTimeout(espera);
          mostrar();
          aviso('O reino não abriu agora. Chame o papai e tente de novo.');
          botao.hidden = false;
          botao.focus();
        });
      }
      tentar();
    });
  }

  /* ---------- início ---------- */
  /* Quem joga vem antes de tudo (sistemas/jogadores.js): o save lido é o dele. Aparelho da Mariana (e o modo
     congelado dos testes) segue direto, sem tela; aparelho novo pergunta "Quem vai jogar?" (ui/jogadores.js). */
  function iniciar() {
    var login = Reino.Jogadores.decidirSemTela();
    if (login) { Reino.Jogadores.usar(login); comecar(); return; }
    UI.telaQuemVaiJogar().then(function (l) { Reino.Jogadores.usar(l); comecar(); });
  }
  function comecar() {
    P.carregar();
    UI.aplicarAjustes();
    Mapa.criar(Reino.materias);
    Mapa.prerender();
    if (!est().comecou) J.posicionar(Mapa.inicio.x, Mapa.inicio.y);
    V.canvas = U.$('#reino');
    V.ctx = V.canvas.getContext('2d');
    V.buffer = PA.novoCanvas(10, 10);
    V.bctx = V.buffer.getContext('2d');
    Cena.ligar({ pintor: pintor, soltarTeclas: function () { V.teclas = {}; }, desenhar: function () { V.desenhar(performance.now()); } });
    V.redimensionar();
    if (document.fonts && document.fonts.load) {
      document.fonts.load('16px "Press Start 2P"').then(function () { V.desenhar(performance.now()); });
    }
    window.addEventListener('resize', V.redimensionar);
    V.ligarControles();
    requestAnimationFrame(V.laco);

    U.on(EV.PROGRESSO, function () { UI.atualizarHUD(); });
    U.on(EV.PROGRESSO_REMOTO, function () { UI.aplicarAjustes(); if (V.jogoAtivo) UI.atualizarHUD(); });
    U.on(EV.MAPA_MUDOU, function () { UI.atualizarHUD(); V.desenhar(performance.now()); });

    // vozes gravadas: frases do Claude e de cada matéria (as salas carregam quando abrem)
    Reino.Voz.carregarVarios(['geral'].concat(Reino.materias.map(function (m) { return m.id + '-extra'; })));

    esperarProgresso().then(function () {
      var novo = !est().comecou;
      (novo ? primeiraVez() : Reino.congelado ? Promise.resolve() : telaInicio()).then(function () { entrarNoReino(novo); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();