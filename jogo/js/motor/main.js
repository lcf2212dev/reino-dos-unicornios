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

  /* A abertura vem ANTES do login (e do P.carregar): o visual é o de quem jogou por último neste aparelho, só lido
     do save dele (Jogadores.visualGuardado); sem save, o padrão. A música (ajuste do save) liga depois de carregar. */
  V.telaInicio = telaInicio;   // para os testes (debug.js: __reino.telaInicio)
  function telaInicio() {
    return new Promise(function (resolver) {
      var t = UI.abrirTela('inicio');
      var ultimo = Reino.Jogadores.ultimo(), vis = (ultimo && Reino.Jogadores.visualGuardado(ultimo)) || {};
      var ap = Object.assign({}, PA.APARENCIA_PADRAO, vis.aparencia || {});
      // festa da medalha de ouro (ui/abertura-medalha.js): só se a última jogadora é a Mariana (ou ninguém) e até a data
      var medalha = UI.festaMedalha.ativa(ultimo);
      var cena = UI.abertura({ montaria: Reino.Unicornios.def('inicial', vis.corInicial || 'rosa'), aparencia: ap, medalha: medalha });
      var ir = el('button.btn-grande.btn-principal.btn-comecar.btn-pulsar', { type: 'button' }, 'Entrar no Reino ✨');
      // (sem "Trocar jogador" aqui: o login vem logo depois do toque)
      var botoes = el('div.inicio-botoes', ir);
      t.appendChild(el('div.inicio', cena.el, el('div.inicio-baixo', botoes,
        el('p.inicio-sub.inicio-materias',
          el('span.inicio-materias-longa', '4º bimestre · Língua Portuguesa chegou!'),
          el('span.inicio-materias-curta', 'Língua Portuguesa chegou!')))));   // curta: celular em pé
      var foi = false;
      ir.addEventListener('click', function () {
        if (foi) return;
        foi = true;
        Reino.Som.ativar(); Reino.Som.tocar(medalha ? 'fanfarra' : 'porta');
        if (medalha) UI.festaMedalha.entrou();   // o Claude dá parabéns ao chegar no mapa (se quem entrar for ela)
        UI.telaCheia(true);
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
        el('div.intro-claude.intro-claude-grande', PA.paraDOM(PA.claude(0), 6, 'claude-intro'),
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
        var b = el('button.carta-uni.rar-comum', { type: 'button' }, PA.paraDOM(PA.unicornio(d, 3, 0), 4), el('b.carta-nome', c.nome));
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
        el('li', el('span.regra-icone', '📚'), el('span', el('b', '4º bimestre: '), 'em breve teremos novos conteúdos das seis matérias da escola.')),
        el('li', el('span.regra-icone', '🏰'), el('span', el('b', 'Explore: '), 'toque no chão para andar ou use as setas. Caminhe até os prédios para escolher seu próximo passeio.')),
        el('li', el('span.regra-icone', '🦄'), el('span', el('b', 'Cuide: '), 'visite seus unicórnios, dê comida e água e escolha seus enfeites favoritos.')),
        el('li', el('span.regra-icone', '⭐'), el('span', el('b', 'Descubra: '), 'o Laboratório de Química, a Feira de Ciências e a Escola de Música continuam esperando por você.')),
        el('li.regra-destaque', el('span.regra-icone', '💛'), el('span', el('b', 'Suas conquistas continuam aqui. '), 'Seus unicórnios, estrelas e prêmios estão guardados com carinho.'))));
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
    UI.corDaBarra('grama');   // a última tela de entrada fechou: o mapa à vista (ui.md §10.8)
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
    }
    // o baú de presentes (ui/bau-presente.js; resolve na hora sem presente) vem antes das boas-vindas, para o balão
    // não cobrir o baú; o parabéns da medalha de ouro (ui/abertura-medalha.js) vem por último
    var abrirBau = !novo && !Reino.congelado && Reino.UI.abrirPresentesPendentes;
    var bau = abrirBau ? Reino.UI.abrirPresentesPendentes() : Promise.resolve();
    var oiFim = null;   // o balão das boas-vindas fechou (adiantarVozes espera)
    function boasVindas() {
      if (novo || Reino.congelado) return;   // modo determinístico dos testes (js/nucleo/congelar.js): sem boas-vindas
      var ovos = P.ovosParaChocar().length;
      var oi = Reino.Claude.frase('boasVindas');
      oiFim = Reino.Claude.falar(oi + (ovos ? ' E você tem ' + (ovos === 1 ? 'um ovo' : ovos + ' ovos') + ' para chocar! 🥚' : ''), { fala: [oi, ovos ? Reino.Falas.fixas.ovosParaChocar : null] });
    }
    // pergunta surpresa (módulo): o relógio só começa depois do tutorial da primeira vez
    ctxModulo.tutorial = tutorial;
    Reino.modulos.forEach(function (m) { if (m.depoisDasBoasVindas) m.depoisDasBoasVindas(ctxModulo); });
    bau.catch(function (e) { console.warn('presentes:', e); })
      .then(boasVindas)
      .then(function () { UI.festaMedalha.parabens(); })
      .catch(function (e) { console.warn('presentes/parabéns:', e); })   // ela já está no mapa: só não festeja
      .then(function () { adiantarVozes(oiFim); });
  }
  // com o baú e o balão das boas-vindas fechados (ou 3 s), o geral em mãos e o jogo ocioso: o <matéria>-extra das
  // matérias em uso (sistemas/voz.js), para a 1ª visita ao prédio falar na hora. No modo congelado não (os testes
  // pedem cada pacote quando a cena precisa)
  function adiantarVozes(oiFim) {
    if (Reino.congelado) return;
    Promise.race([Promise.resolve(oiFim).catch(function () {}), new Promise(function (r) { setTimeout(r, 3000); })]).then(function () {
      return Reino.Voz.carregar('geral');
    }).then(function () {
      if (window.requestIdleCallback) window.requestIdleCallback(function () { Reino.Voz.adiantarExtras(); }, { timeout: 2000 });
      else setTimeout(function () { Reino.Voz.adiantarExtras(); }, 1500);
    });
  }

  /* o jogo só começa com o progresso guardado em mãos (o banco da Vercel ou o claude.ai): sem ele, um aparelho novo
     abriria a primeira vez e trocaria as escolhas dela. Sem rede, quem já tem o save no aparelho joga com ele. */
  var ESPERA_PASSO_MS = 600;   // uma estrelinha a mais na espera (--lento, ui.md §10.15: volta inteira em 1,8 s)
  V.esperarProgresso = esperarProgresso;   // para ver a espera nas fotos (npm run ver -- --vivo --js …)
  // doLogin: o painel de login segue aberto enquanto isso (telaQuemVaiJogar, aoEntrar): a 1ª tentativa não abre a
  // abertura por cima; só uma falha mostra o aviso com "Tentar de novo"
  function esperarProgresso(doLogin) {
    return new Promise(function (resolver) {
      var t = null, msg = null, botao = null, timer = 0;
      function aviso(novo) {
        if (typeof novo === 'string') novo = el('p.inicio-sub', novo);
        clearInterval(timer); timer = 0;
        msg.parentNode.replaceChild(novo, msg);
        msg = novo;
      }
      /* "Abrindo o reino" + três estrelinhas que acendem uma a uma (troca de quadro a cada ESPERA_PASSO_MS, em
         degraus); com Animações desligadas (ou reduzir movimento, ou os testes congelados) as três ficam acesas, paradas */
      function abrindo() {
        var estrelas = [0, 1, 2].map(function () { return el('span.inicio-estrela', '⭐'); });
        // as estrelas numa linha só, embaixo do texto (no celular não cabem ao lado sem quebrar)
        var fila = el('span.inicio-espera', { 'aria-hidden': 'true' }, estrelas[0], estrelas[1], estrelas[2]);
        fila.style.display = 'block'; fila.style.whiteSpace = 'nowrap';
        var p = el('p.inicio-sub.inicio-abrindo', 'Abrindo o reino', fila);
        var anima = !Reino.congelado && !U.reduzMovimentoSistema && !document.body.classList.contains('sem-animacao');
        if (anima) {
          var passo = 0;
          var mostrarPasso = function () {
            estrelas.forEach(function (e, i) { e.style.visibility = i <= passo ? '' : 'hidden'; });
            passo = (passo + 1) % estrelas.length;
          };
          mostrarPasso();
          p._timer = setInterval(function () {
            if (!p.isConnected) { clearInterval(p._timer); return; }
            mostrarPasso();
          }, ESPERA_PASSO_MS);
        }
        return p;
      }
      function mostrar() {
        if (t) return;
        t = UI.abrirTela('inicio');
        msg = abrindo();
        timer = msg._timer || 0;
        botao = el('button.btn-grande.btn-principal.btn-comecar', { type: 'button' }, 'Tentar de novo 🔄');
        botao.hidden = true;
        botao.addEventListener('click', tentar);
        t.appendChild(el('div.inicio', logo(), msg, botao));
      }
      function tentar() {
        if (t) { aviso(abrindo()); timer = msg._timer || 0; botao.hidden = true; }
        var espera = doLogin && !t ? 0 : setTimeout(mostrar, 400);   // resposta rápida: nem aparece
        P.iniciarNuvem().then(function () {
          clearTimeout(espera);
          clearInterval(timer);
          if (t) UI.fecharTela(t);
          resolver();
        }, function () {
          clearTimeout(espera);
          // sem rede, mas o save deste jogador já está no aparelho: joga com ele e sincroniza quando a rede voltar
          if (P.podeJogarSemNuvem()) {
            clearInterval(timer);
            if (t) UI.fecharTela(t);
            P.reconectarNuvem();
            resolver();
            return;
          }
          mostrar();
          aviso(navigator.onLine === false ? 'Sem internet. Na primeira vez neste aparelho, o reino precisa da internet.'
            : 'O reino não abriu agora. Chame o papai e tente de novo.');
          botao.hidden = false;
          botao.focus();
        });
      }
      tentar();
    });
  }

  /* ---------- início ---------- */
  /* Abertura → toque em "Entrar no Reino" → login com senha (ui/jogadores.js; o login de quem jogou por último vem
     preenchido) → só então o save DESSE jogador é escolhido e lido (P.usarJogador antes do P.carregar) → jogo.
     Nada do save é lido para jogar nem gravado antes da senha certa. Modo congelado dos testes: a Mariana direto. */
  function iniciar() {
    var login = Reino.Jogadores.decidirSemTela();
    // (fora do congelado, só o "Trocar jogador" que acabou de conferir a senha: a música espera o 1º toque)
    if (login) { Reino.Jogadores.usar(login); comecar(false, !Reino.congelado).then(abrirReino); return; }
    // o save é buscado com o login ainda aberto (aoEntrar): dele direto para o mapa, sem voltar à abertura
    telaInicio()
      .then(function () {
        return UI.telaQuemVaiJogar({ ultimo: Reino.Jogadores.ultimo(), aoEntrar: function (l) { Reino.Jogadores.usar(l); return comecar(true); } });
      })
      .then(abrirReino);
  }
  function abrirReino() {
    var novo = !est().comecou;
    if (novo) Reino.Voz.carregar(Reino.materias[0].id + '-extra');   // o tutorial do mapa (entrarNoReino)
    (novo ? primeiraVez() : Promise.resolve()).then(function () { entrarNoReino(novo); });
  }
  // abriu: veio da abertura e do login (o toque já liberou o som); musicaNoToque: sem toque nesta página ainda, a música
  // liga no 1º. Cumpre quando o save está em mãos (esperarProgresso).
  function comecar(abriu, musicaNoToque) {
    P.carregar();
    if (abriu && est().ajustes.musica) Reino.Som.musica(true);
    if (musicaNoToque) {
      var primeiro = function () {
        ['pointerdown', 'keydown'].forEach(function (ev) { window.removeEventListener(ev, primeiro, true); });
        Reino.Som.ativar();
        if (est().ajustes.musica) Reino.Som.musica(true);
      };
      ['pointerdown', 'keydown'].forEach(function (ev) { window.addEventListener(ev, primeiro, true); });
    }
    UI.aplicarAjustes();
    Mapa.criar(Reino.materias);
    Mapa.prerender();
    if (!est().comecou) J.posicionar(Mapa.inicio.x, Mapa.inicio.y);
    V.canvas = U.$('#reino');
    V.ctx = V.canvas.getContext('2d');
    V.buffer = document.createElement('canvas'); V.buffer.width = 10; V.buffer.height = 10;
    V.bctx = V.buffer.getContext('2d', { alpha: false });   // opaco: cada quadro pinta o fundo inteiro antes
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

    // vozes gravadas: só as frases do Claude (as boas-vindas tocam logo no mapa). O <matéria>-extra vem com a sala, o
    // treino ou o prédio da matéria, ou quando uma fala dele é pedida (sistemas/voz.js); as salas, quando abrem
    Reino.Voz.carregar('geral');

    return esperarProgresso(abriu);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();