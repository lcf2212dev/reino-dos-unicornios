/* Base das telas por cima do mapa (Reino.UI): guarda de toque fantasma, pilha de telas
   (abrirTela/fecharTela), foco pelo teclado, painel, escolher/confirmar e o teclado nas telas
   (Esc fecha, Tab fica preso na tela de cima). Cria Reino.UI (cada parte seguinte acrescenta
   as suas telas) e Reino._ui (fim do arquivo).
   As outras partes de js/ui/ carregam depois, nesta ordem (manifesto): pecas, cuidados, hud,
   materia, bau, loja, estabulo, petshop, ovos, lugares, ajustes, aparencia, pais. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = {};
  var pilha = [];

  function est() { return P.estado(); }

  /* ---------- toque fantasma ----------
     Um botão que some no 1º toque deixa o 2º toque (mesmo lugar, 0–300 ms depois) cair no que
     aparece embaixo: já comprou comida e trocou enfeite sem ela querer. Então, logo depois de
     abrir ou fechar uma tela por toque, os cliques de dedo/mouse PERTO desse toque (até 40 px)
     ficam ignorados por um instante; um toque noutro lugar vale na hora ("Vamos" → "Começar").
     Só os de verdade (isTrusted) e de ponteiro (detail > 0): Enter/Espaço no teclado geram
     clique com detail 0 e passam sempre; .click() de código também passa. O toque ignorado
     não fica mudo: o botão afunda de leve (toqueIgnorado, sem som). Toques que continuam no
     mesmo lugar (o dedo batendo no botão do menu) esticam a guarda, até 2 s depois da troca de
     tela: o 3º toque no dock não liga mais um interruptor dos Ajustes. */
  var SEGURAR_MS = 800, TOQUE_PERTO_PX = 40, GUARDA_MAX_MS = 2000;
  var toquesLivresEm = 0, ultimoToque = -1e9;
  var ultimoPonto = null;    // { x, y } do último pointerdown de verdade
  var pontoGuarda = null;    // o toque que abriu ou fechou a tela: a guarda vale só perto dele
  var guardaDesde = 0;
  UI.segurarToques = function (ms) {
    toquesLivresEm = Math.max(toquesLivresEm, performance.now() + (ms || SEGURAR_MS));
    pontoGuarda = ultimoPonto;
    guardaDesde = performance.now();
  };
  // o toque em (x, y) está segurado agora? Também para o mapa (motor/entrada.js, pointerdown do canvas):
  // o 2º toque no "Ir" do Lugares caía no mapa e trocava o destino da caminhada
  UI.toqueSegurado = function (x, y) {
    var agora = performance.now();
    if (agora >= toquesLivresEm || (pontoGuarda && !perto({ x: x, y: y }, pontoGuarda))) return false;
    toquesLivresEm = Math.max(toquesLivresEm, Math.min(agora + SEGURAR_MS, guardaDesde + GUARDA_MAX_MS));
    return true;
  };
  // só segura quando a tela mudou por causa de um toque (até 600 ms antes): a tela de início
  // que abre sozinha, ou uma tela aberta pelo teclado, não prendem o próximo toque
  function segurarSeFoiToque() { if (performance.now() - ultimoToque < 600) UI.segurarToques(); }
  ['pointerdown', 'pointerup'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (!e.isTrusted) return;
      ultimoToque = performance.now();
      if (ev === 'pointerdown') ultimoPonto = { x: e.clientX, y: e.clientY };
    }, true);
  });
  function perto(a, b) { return !!(a && b) && Math.abs(a.x - b.x) < TOQUE_PERTO_PX && Math.abs(a.y - b.y) < TOQUE_PERTO_PX; }
  // retorno calmo de um toque que não valeu: o botão afunda 2 px por um instante (sem som;
  // com "reduzir movimento" só escurece de leve, ui-base.css)
  function toqueIgnorado(alvo) {
    var b = alvo && alvo.closest ? alvo.closest('button, [role="button"]') : null;
    if (!b) return;
    b.classList.remove('toque-ignorado'); void b.offsetWidth; b.classList.add('toque-ignorado');
    clearTimeout(b._tiIgnorado);
    b._tiIgnorado = setTimeout(function () { b.classList.remove('toque-ignorado'); }, 220);
  }
  // a última coisa usada foi o teclado? (quem fecha uma tela decide para onde vai o foco)
  var ultimaTecla = -1e9;
  document.addEventListener('keydown', function (e) { if (e.isTrusted) ultimaTecla = performance.now(); }, true);
  // Enter/Espaço segurados (repetição automática) numa tela não acionam de novo o botão em foco
  // sem querer; num campo de texto (o nome do unicórnio) a tecla é do campo
  document.addEventListener('keydown', function (e) {
    if (!pilha.length || !e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return;
    if (campoDeTexto(document.activeElement)) return;
    e.preventDefault(); e.stopPropagation();
  }, true);
  document.addEventListener('click', function (e) {
    if (!e.isTrusted || !e.detail || !UI.toqueSegurado(e.clientX, e.clientY)) return;   // longe ou fora da guarda: vale
    e.preventDefault(); e.stopImmediatePropagation();
    toqueIgnorado(e.target);
  }, true);
  /* Botão de gastar embaixo do dedo: a confirmação da compra nasce em cima dos cartões, e quem
     continua tocando no mesmo lugar acertava "Comprar". Segurança pelo desenho (UI.escolher):
     se o toque que abriu o diálogo cai num botão que gasta, esse botão troca de lugar com o
     seguro ("Agora não"); quem continua tocando ali só acerta o "Agora não". Um toque de
     propósito no botão de gastar, noutro ponto, vale na hora. */
  // logo depois de uma compra, o toque seguinte no mesmo lugar cai no cartão que acabou de ser
  // comprado (e tirava o enfeite): esse cartão (só ele) ignora toques perto do da compra até
  // 1,1 s (ARMAR_MS, a mesma espera dos botões que gastam) sem nenhum toque na tela
  var compraLivreEm = 0, pontoDaCompra = null;
  var compra = { itemComprado: null };   // o item da última compra (loja.js grava)
  document.addEventListener('pointerdown', function (e) {
    var agora = performance.now();
    if (e.isTrusted && agora < compraLivreEm) compraLivreEm = agora + ARMAR_MS;   // cada toque recomeça a espera
  }, true);
  function logoDepoisDaCompra(e, itemId) {
    if (!(e && e.isTrusted && e.detail) || itemId !== compra.itemComprado || performance.now() >= compraLivreEm) return false;
    if (!perto({ x: e.clientX, y: e.clientY }, pontoDaCompra)) return false;
    toqueIgnorado(e.target);
    return true;
  }

  /* ---------- telas e diálogos ---------- */
  var FOCAVEIS = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function visivel(e) { return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length) && !e.closest('[hidden]'); }
  function focaveis(raiz) { return Array.prototype.filter.call(raiz.querySelectorAll(FOCAVEIS), visivel); }
  function focar(e) { if (e && e.isConnected) try { e.focus({ preventScroll: true }); return true; } catch (x) {} return false; }
  function topo() { return pilha[pilha.length - 1] || null; }
  // a última coisa usada foi o teclado (e não o dedo ou o mouse)?
  UI.porTeclado = function () { return ultimaTecla > ultimoToque; };
  // o elemento com foco inteiro à vista, com a marca de foco (outline de 4 px + 3 px): rola só as
  // caixas que rolam por dentro da tela de cima (.missao-corpo, .painel-conteudo, .apoio-corpo),
  // da mais de dentro para a de fora; nada de scrollIntoView, que rolaria também o que está atrás
  var FOLGA_FOCO = 12;
  function mostrarFoco(e) {
    var t = topo();
    if (!e || !e.isConnected || !t || !t.contains(e)) return;
    for (var c = e.parentElement; c && t.contains(c); c = c.parentElement) {
      if (c.scrollHeight <= c.clientHeight + 1) continue;
      var oy = getComputedStyle(c).overflowY;
      if (oy !== 'auto' && oy !== 'scroll') continue;
      var r = e.getBoundingClientRect(), cr = c.getBoundingClientRect();
      var cima = cr.top + c.clientTop + FOLGA_FOCO, baixo = cr.top + c.clientTop + c.clientHeight - FOLGA_FOCO;
      if (r.top < cima) c.scrollTop -= cima - r.top;
      else if (r.bottom > baixo) c.scrollTop += Math.min(r.bottom - baixo, r.top - cima);   // mais alto que a caixa: o começo dele à vista
    }
  }
  // foco pelo teclado: foca e mostra (quem chama só faz isso quando UI.porTeclado()).
  // calma (ms): numa troca de tela, o Enter/Espaço que chega logo depois no botão novo não vale
  // (ela ainda apertava o botão de antes, ou o ovo: não escolhe nada sem ver)
  UI.focarTeclado = function (e, calma) {
    if (!focar(e)) return false;
    mostrarFoco(e);
    if (calma) {
      var ate = performance.now() + calma;
      var segura = function (ev) {
        if (performance.now() >= ate) { e.removeEventListener('keydown', segura, true); e.removeEventListener('keyup', segura, true); return; }
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.stopPropagation(); }
      };
      e.addEventListener('keydown', segura, true);
      e.addEventListener('keyup', segura, true);
    }
    return true;
  };
  // já está inteiro à vista, sem rolar nada?
  function aVista(e) {
    var t = topo(), r = e.getBoundingClientRect();
    if (!r.width && !r.height) return false;
    for (var c = e.parentElement; c && t && t.contains(c); c = c.parentElement) {
      if (c.scrollHeight <= c.clientHeight + 1) continue;
      var cr = c.getBoundingClientRect();
      if (r.top < cr.top + c.clientTop || r.bottom > cr.top + c.clientTop + c.clientHeight) return false;
    }
    return r.top >= 0 && r.bottom <= window.innerHeight;
  }
  /* A tela trocou por dentro (questão nova, fim da sala, resultado) e o foco ia para o body: pelo
     teclado, ele vai para `alvo` (um botão, ou o 1º controle de `alvo` se for uma caixa) quando
     ele já aparece sem rolar; senão para o título (tabindex -1: o Tab segue dali para baixo), para
     o começo da tela não sumir. Pelo toque, nada muda. */
  UI.focarTroca = function (alvo, titulo, calma) {
    if (!UI.porTeclado() || !alvo) return false;
    if (alvo.tagName !== 'BUTTON') alvo = focaveis(alvo)[0];
    if (alvo && aVista(alvo)) return UI.focarTeclado(alvo, calma);
    if (titulo) { titulo.setAttribute('tabindex', '-1'); return focar(titulo); }
    return alvo ? UI.focarTeclado(alvo, calma) : false;
  };

  UI.abrirTela = function (nome) {
    var t = el('section.tela.tela-' + nome, { role: 'dialog', 'aria-modal': 'true' });
    // quem estava com o foco (o botão tocado): volta para ele quando esta tela fechar
    t._focoAntes = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
    U.$('#telas').appendChild(t);
    pilha.push(t);
    document.body.classList.add('com-tela');
    segurarSeFoiToque();
    U.emit(EV.TELAS, pilha.length);
    // o foco entra na tela nova (as que já focam algo, em até 30 ms, ficam como estão): senão ele
    // ficava no botão do menu atrás dela, e cada Enter abria a mesma tela de novo por cima
    setTimeout(function () {
      if (t !== topo() || t.contains(document.activeElement)) return;
      var bal = document.getElementById('claude-balao');
      if (bal && bal.contains(document.activeElement)) return;
      // o foco vai para a própria tela (como um diálogo), e o Tab leva ao 1º botão. No 1º botão, um
      // Enter logo depois agia sozinho (tirava o enfeite, desligava o som, "Quer sair da prova?").
      // Aberta pelo teclado, a tela mostra a marca de foco (.foco-teclado, ui-telas.css)
      t.classList.toggle('foco-teclado', ultimaTecla > ultimoToque);
      t.setAttribute('tabindex', '-1'); focar(t);
    }, 60);
    return t;
  };
  UI.fecharTela = function (t) {
    t = t || pilha[pilha.length - 1];
    if (!t) return;
    var eraTopo = t === topo();
    var i = pilha.indexOf(t);
    if (i >= 0) pilha.splice(i, 1);
    var tinhaFoco = t.contains(document.activeElement);
    if (t.parentNode) t.parentNode.removeChild(t);
    if (!pilha.length) document.body.classList.remove('com-tela');
    segurarSeFoiToque();
    U.emit(EV.TELAS, pilha.length);
    UI.atualizarHUD();
    // o foco não cai no body: volta para o botão que abriu esta tela ou para o 1º da tela de baixo.
    // Fechada com toque ou mouse, de volta ao mapa, o foco não volta para o botão do HUD: senão o
    // Espaço/Enter de andar e falar reabria a tela que ela acabou de fechar.
    var baixo = topo();
    if (eraTopo && !baixo && ultimoToque > ultimaTecla) {
      var at = document.activeElement;
      if (at && at.blur && at.closest && at.closest('#hud')) at.blur();
    } else if (eraTopo && (tinhaFoco || document.activeElement === document.body || !document.activeElement)) {
      if (!(t._focoAntes && (!baixo || baixo.contains(t._focoAntes)) && focar(t._focoAntes))) {
        if (baixo) focar(focaveis(baixo)[0]);
        else focarMapa();   // quem abriu (o balão da Dona Aveia, o telescópio) já sumiu
      }
    }
  };
  // sem tela nenhuma e sem botão para voltar: o foco vai para o mapa, não para o body
  function focarMapa() {
    var cv = document.getElementById('reino');
    if (!cv) return;
    if (!cv.hasAttribute('tabindex')) cv.setAttribute('tabindex', '-1');
    focar(cv);
  }
  UI.fecharTodas = function () { while (pilha.length) UI.fecharTela(pilha[pilha.length - 1]); };
  UI.temTela = function () { return pilha.length > 0; };

  // tela com cartão central, título e botão de fechar
  var nPainel = 0;
  function painel(nome, titulo, opcoes) {
    opcoes = opcoes || {};
    var t = UI.abrirTela(nome);
    var idTitulo = 'painel-titulo-' + (++nPainel);
    t.setAttribute('aria-labelledby', idTitulo);
    var fechar = el('button.btn-icone.btn-fechar', { type: 'button', 'aria-label': 'Fechar' }, '✕');
    var conteudo = el('div.painel-conteudo');
    var card = el('div.painel',
      el('header.painel-topo', el('h2.titulo-pixel', { id: idTitulo }, titulo), opcoes.semFechar ? null : fechar),
      conteudo);
    t.appendChild(card);
    fechar.addEventListener('click', function () { Reino.Som.tocar('toque'); Reino.Som.calar(); UI.fecharTela(t); if (opcoes.aoFechar) opcoes.aoFechar(); });
    t.addEventListener('click', function (e) { if (e.target === t && !opcoes.semFechar) fechar.click(); });
    if (!opcoes.semFechar) t._aoEsc = function () { fechar.click(); };   // Esc = ✕
    return { tela: t, conteudo: conteudo, card: card };
  }
  UI.painel = painel;

  // diálogo com vários botões: `botoes` = [{ rotulo, valor, principal, seguro, gasta }]. O seguro (ou o
  // 1º, se nenhum for marcado) recebe o foco e é o que o Esc escolhe. Resolve com o `valor` tocado.
  // `classe` (opcional) vai no painel. `gasta`: o botão gasta estrela e nunca nasce embaixo do
  // dedo que abriu o diálogo (afastarDoDedo).
  var ARMAR_MS = 1100;
  UI.escolher = function (msg, botoes, classe) {
    return new Promise(function (resolver) {
      var t = UI.abrirTela('confirmar');
      var idMsg = 'confirmar-msg-' + (++nPainel);
      t.setAttribute('aria-labelledby', idMsg);
      var bs = botoes.map(function (b) {
        var bt = el('button.btn-grande' + (b.principal ? '.btn-principal' : '.btn-secundario'), { type: 'button' }, b.rotulo);
        if (b.gasta) {
          bt.classList.add('armando'); bt.setAttribute('aria-disabled', 'true');
          // o que está acontecendo, sem som: uma barrinha enche durante a espera (com "reduzir
          // movimento", o texto "Espera um pouquinho…"), ui-base.css
          bt.appendChild(el('span.armando-barra', { 'aria-hidden': 'true' }));
          bt.appendChild(el('span.armando-texto', { 'aria-hidden': 'true' }, 'Espera um pouquinho…'));
        }
        bt.addEventListener('click', function (e) {
          if (bt.classList.contains('armando') && e.detail) return;   // a trava é só do toque e do mouse: pelo teclado ela chega aqui com um Tab de propósito
          // reserva: se nem trocando de lugar nem movendo o diálogo deu para tirar o botão de baixo
          // do dedo, um toque perto dali (40 px) não gasta; o resto do botão vale
          if (b.gasta && dedoPreso && e.isTrusted && e.detail && perto({ x: e.clientX, y: e.clientY }, dedoPreso)) { toqueIgnorado(bt); return; }
          if (b.gasta) { compraLivreEm = performance.now() + ARMAR_MS; pontoDaCompra = e.detail ? { x: e.clientX, y: e.clientY } : null; }
          UI.fecharTela(t); resolver(b.valor);
        });
        return bt;
      });
      t.appendChild(el('div.painel.painel-pequeno' + (classe ? '.' + classe : ''), el('p.confirmar-msg', { id: idMsg }, msg), el('div.intro-botoes' + (bs.length > 2 ? '.coluna' : ''), bs)));
      var iSeguro = Math.max(0, botoes.findIndex(function (b) { return b.seguro; }));
      var dedoPreso = afastarDoDedo(bs, botoes, iSeguro);
      // os que gastam nascem inativos (meio apagados) e só acendem depois de 1,1 s sem nenhum
      // toque: quem vem passando o dedo pelos cartões (a cada 100–1000 ms) não compra. O
      // "Agora não" vale na hora
      var gastam = bs.filter(function (bt, j) { return botoes[j].gasta; });
      var armar = null;
      function acenderDepois() {
        clearTimeout(armar);
        // a barrinha recomeça junto com a espera
        gastam.forEach(function (bt) { var br = bt.querySelector('.armando-barra'); if (br) { br.style.animation = 'none'; void br.offsetWidth; br.style.animation = ''; } });
        armar = setTimeout(function () { gastam.forEach(function (bt) { bt.classList.remove('armando'); bt.removeAttribute('aria-disabled'); }); }, ARMAR_MS);
      }
      if (gastam.length) {
        acenderDepois();
        t.addEventListener('pointerdown', function (e) { if (e.isTrusted && gastam[0].classList.contains('armando')) acenderDepois(); }, true);
      }
      t._aoEsc = function () { bs[iSeguro].click(); };
      setTimeout(function () { focar(bs[iSeguro]); }, 30);
    });
  };
  // o toque que abriu o diálogo (até 600 ms antes) caiu num botão que gasta? Troca esse botão de
  // lugar com o seguro. Devolve o ponto se ainda sobrar um botão de gastar embaixo dele.
  function sobre(bt, p) { var r = bt.getBoundingClientRect(); return p.x > r.left - TOQUE_PERTO_PX && p.x < r.right + TOQUE_PERTO_PX && p.y > r.top - TOQUE_PERTO_PX && p.y < r.bottom + TOQUE_PERTO_PX; }
  function afastarDoDedo(bs, botoes, iSeguro) {
    var p = ultimoPonto;
    if (!p || performance.now() - ultimoToque > 600 || !botoes.some(function (b) { return b.gasta; })) return null;
    var seguro = bs[iSeguro];
    function coberto() { return bs.some(function (bt, j) { return botoes[j].gasta && sobre(bt, p); }); }
    for (var i = 0; i < bs.length; i++) {
      if (!botoes[i].gasta || !sobre(bs[i], p)) continue;
      // troca os dois de lugar no DOM (a ordem do Tab acompanha o que se vê)
      var marca = document.createComment('');
      bs[i].parentNode.replaceChild(marca, bs[i]);
      seguro.parentNode.replaceChild(bs[i], seguro);
      marca.parentNode.replaceChild(seguro, marca);
      break;
    }
    if (!coberto()) return null;
    // botões de alturas diferentes: o dedo ainda cai num que gasta. Move o diálogo até o centro
    // do "Agora não" ficar embaixo do dedo (sem sair da tela)
    var painelEl = seguro.closest('.painel');
    var r = seguro.getBoundingClientRect(), pr = painelEl.getBoundingClientRect();
    var dx = Math.max(-pr.left, Math.min(innerWidth - pr.right, p.x - (r.left + r.width / 2)));
    var dy = Math.max(-pr.top, Math.min(innerHeight - pr.bottom, p.y - (r.top + r.height / 2)));
    painelEl.style.transform = 'translate(' + Math.round(dx) + 'px, ' + Math.round(dy) + 'px)';
    return coberto() ? p : null;
  }
  UI.confirmar = function (msg, sim, nao, gasta) {
    return UI.escolher(msg, [{ rotulo: nao || 'Não', valor: false }, { rotulo: sim || 'Sim', valor: true, principal: true, gasta: !!gasta }]);
  };

  /* ---------- teclado nas telas ----------
     Esc fecha a tela de cima (✕ do painel, "não" do diálogo). Fica no window, depois dos
     ouvintes do document (a pergunta surpresa trata o próprio Esc e marca defaultPrevented).
     Tab/Shift+Tab ficam presos na tela de cima (e no balão do Claude, se estiver aberto: ele
     sempre tem botões, o 🔊 e o Ok ou as escolhas),
     senão o foco ia para o HUD atrás e um Enter abria outra tela por cima. */
  function campoDeTexto(e) { return !!(e && e.matches && e.matches('input:not([type=button]):not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable]')); }
  window.addEventListener('keydown', function (e) {
    var t = topo();
    if (!t || e.defaultPrevented || e.key !== 'Escape' || e.repeat) return;
    if (campoDeTexto(document.activeElement)) return;
    // balão do Claude por cima da tela: o 1º Esc fecha o balão; o seguinte, a tela
    if (Reino.Claude && Reino.Claude.aberto && Reino.Claude.aberto()) { e.preventDefault(); Reino.Claude.fechar(); return; }
    if (t._aoEsc) { e.preventDefault(); t._aoEsc(); }
  });
  document.addEventListener('keydown', function (e) {
    var t = topo();
    if (!t || e.key !== 'Tab') return;
    var lista = focaveis(t);
    var balao = document.querySelector('#claude-balao:not([hidden])');
    if (balao && balao.querySelector('.claude-acoes button')) lista = lista.concat(focaveis(balao));
    if (!lista.length) { e.preventDefault(); return; }
    var at = document.activeElement;
    var i = lista.indexOf(at);
    var prox = i < 0 ? (e.shiftKey ? lista.length - 1 : 0) : (i + (e.shiftKey ? -1 : 1) + lista.length) % lista.length;
    // o foco está num título (tabindex -1) dentro da tela: o Tab segue dali, não do começo
    if (i < 0 && at && at !== t && t.contains(at)) {
      var depois = lista.filter(function (x) { return at.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING; });
      var antes = lista.filter(function (x) { return at.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_PRECEDING; });
      if (!e.shiftKey && depois.length) prox = lista.indexOf(depois[0]);
      if (e.shiftKey && antes.length) prox = lista.indexOf(antes[antes.length - 1]);
    }
    e.preventDefault();
    focar(lista[prox]);
    mostrarFoco(lista[prox]);
  });

  window.Reino.UI = UI;
  /* Reino._ui: o que as partes de js/ui/ dividem entre si (interno, não é API do jogo).
     Esta parte cria; as seguintes acrescentam o que é delas (ver o fim de cada arquivo):
       base.js      est, pilha (a pilha de telas: o mesmo array, só push/splice), topo, focar,
                    focaveis, mostrarFoco, focarMapa, perto, toqueIgnorado, logoDepoisDaCompra,
                    compra ({ itemComprado }: loja.js grava, logoDepoisDaCompra lê), painel
       pecas.js     hifenizar, aparencia
       cuidados.js  CUIDADO, cuidadosProntos, comBanho, uniChocado, iconePequeno, barrasCuidado,
                    rotularMontaria, falarCuidado, balaoNaTela, darComida, textoEnche, nomeComida
       materia.js   barraDinheiro */
  Reino._ui = {
    est: est, pilha: pilha, topo: topo, focar: focar, focaveis: focaveis, mostrarFoco: mostrarFoco,
    focarMapa: focarMapa, perto: perto, toqueIgnorado: toqueIgnorado,
    logoDepoisDaCompra: logoDepoisDaCompra, compra: compra, painel: painel,
  };
})();
