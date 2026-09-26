/* Telas por cima do mapa: HUD, lugares, estábulo, baú, loja, ajustes, pais, ovos. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var UI = {};
  var pilha = [];

  function est() { return P.estado(); }

  /* Hifenização leve para a fonte pixel (larga): põe hífens invisíveis (\u00AD) entre as sílabas
     das palavras compridas, e o navegador só mostra o hífen se a palavra precisar quebrar
     ("Obser-vatório" numa coluna estreita). Regras do português: V-CV e VC-CV, sem separar
     lh/nh/ch/qu/gu nem consoante + l/r (br, pl, tr...). Palavras curtas ficam como estão. */
  var VOGAL = 'aeiouáéíóúâêôãõàü';
  function ehVogal(ch) { return VOGAL.indexOf(ch.toLowerCase()) >= 0; }
  function ehLetra(ch) { return /[a-zà-ÿ]/i.test(ch); }
  function hifenizarPalavra(w) {
    if (w.length < 9) return w;  // até 8 letras cabe inteira nas colunas do celular
    var cortes = [];
    for (var i = 1; i < w.length - 1; i++) {
      var a = w[i - 1], b = w[i], c = w[i + 1], d = w[i + 2];
      if (!ehLetra(b) || !ehLetra(c) || ehVogal(b) || !ehVogal(a)) continue;
      if (ehVogal(c)) cortes.push(i);                       // V-CV
      else if (d && ehVogal(d) && ehLetra(d)) {
        var par = (b + c).toLowerCase();
        var junto = /^(lh|nh|ch|qu|gu)$/.test(par) || (/[lr]/.test(c.toLowerCase()) && /[bcdfgkptv]/.test(b.toLowerCase()));
        cortes.push(junto ? i : i + 1);                      // VC-CV (ou V-CCV)
      } else if (d && /[lr]/i.test(d) && /[bcdfgkptv]/i.test(c) && w[i + 3] && ehVogal(w[i + 3])) cortes.push(i + 1); // VC-CCV (lem-bran)

    }
    // nada de sobrar uma letra só de um lado
    cortes = cortes.filter(function (k) { return k >= 2 && k <= w.length - 2; });
    for (var j = cortes.length - 1; j >= 0; j--) w = w.slice(0, cortes[j]) + '\u00AD' + w.slice(cortes[j]);
    return w;
  }
  function hifenizar(texto) { return String(texto).replace(/[a-zà-ÿ]+/gi, hifenizarPalavra); }
  function aparencia() { return est().aparencia; }

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
  // o toque em (x, y) está segurado agora? Também para o mapa (main.js, pointerdown do canvas):
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
  // com "reduzir movimento" só escurece de leve, jogo.css)
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
  var compraLivreEm = 0, pontoDaCompra = null, itemComprado = null;
  document.addEventListener('pointerdown', function (e) {
    var agora = performance.now();
    if (e.isTrusted && agora < compraLivreEm) compraLivreEm = agora + ARMAR_MS;   // cada toque recomeça a espera
  }, true);
  function logoDepoisDaCompra(e, itemId) {
    if (!(e && e.isTrusted && e.detail) || itemId !== itemComprado || performance.now() >= compraLivreEm) return false;
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
    U.emit('telas', pilha.length);
    // o foco entra na tela nova (as que já focam algo, em até 30 ms, ficam como estão): senão ele
    // ficava no botão do menu atrás dela, e cada Enter abria a mesma tela de novo por cima
    setTimeout(function () {
      if (t !== topo() || t.contains(document.activeElement)) return;
      var bal = document.getElementById('claude-balao');
      if (bal && bal.contains(document.activeElement)) return;
      // o foco vai para a própria tela (como um diálogo), e o Tab leva ao 1º botão. No 1º botão, um
      // Enter logo depois agia sozinho (tirava o enfeite, desligava o som, "Quer sair da prova?").
      // Aberta pelo teclado, a tela mostra a marca de foco (.foco-teclado, jogo.css)
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
    U.emit('telas', pilha.length);
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
          // movimento", o texto "Espera um pouquinho…"), jogo.css
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

  /* ---------- fome, sede e banho (barrinhas de Reino.Cuidados) ---------- */
  // Toda barrinha de fome/sede/banho leva data-uni e data-campo: um único ouvinte do evento 'cuidados'
  // repinta todas as que estão na página (HUD, Estábulo, Pet Shop) sem refazer nada em volta.
  var CUIDADO = {
    fome: { icone: '🍎', rotulo: 'Fome', baixo: 'Quer comer!' },
    sede: { icone: '💧', rotulo: 'Sede', baixo: 'Quer água!' },
    banho: { icone: '🛁', rotulo: 'Banho', baixo: 'Quer banho!' },
  };
  function cuidadosProntos() { return !!(Reino.Cuidados && Reino.Cuidados.niveis); }
  // o banho só aparece quando Reino.Cuidados já o conhece (niveis() com o campo)
  function comBanho() { try { return cuidadosProntos() && typeof Reino.Cuidados.niveis().banho === 'number'; } catch (e) { return false; } }
  function uniChocado(id) { var u = est().unis[id]; return !!(u && u.chocado); }
  // ícone pequeno e nítido (fora do texto: não cresce com a fonte). PA.iconeEmoji já arredonda
  // para a escala inteira mais próxima de `px` (PA.escalaNitida), então nunca sai borrado.
  function iconePequeno(emoji, px) { return PA.iconeEmoji(emoji, px / 18); }
  // tamanho do ícone das barras grandes: 24px no celular e 32px no tablet e no notebook
  function pxIconeGrande() { return window.innerWidth <= 480 ? 24 : 32; }

  // tamanho 'mini' (HUD e cartas: ícone + trilho fino) ou 'grande' (detalhe e Pet Shop: com rótulo)
  function barraCuidado(uniId, campo, tamanho) {
    var info = CUIDADO[campo];
    var cheio = el('span.cuid-cheio');
    var b = el('span.cuid-barra.cuid-' + campo + '.cuid-' + tamanho,
      { role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': '100', 'data-uni': uniId, 'data-campo': campo },
      // mini: 16px pedidos = 16px CSS nítidos em dpr 1, 2 e 3 (com 12 o iPhone ficava com 10,7px)
      tamanho === 'grande' ? el('span.cuid-rotulo', iconePequeno(info.icone, pxIconeGrande()), el('span', info.rotulo)) : iconePequeno(info.icone, 16),
      el('span.cuid-trilho', cheio),
      tamanho === 'grande' ? el('small.cuid-aviso') : null);
    pintarBarra(b);
    return b;
  }
  function barrasCuidado(uniId, tamanho) {
    return el('span.cuid-par.cuid-par-' + tamanho, barraCuidado(uniId, 'fome', tamanho), barraCuidado(uniId, 'sede', tamanho),
      comBanho() ? barraCuidado(uniId, 'banho', tamanho) : null);
  }
  function pintarBarra(b) {
    if (!cuidadosProntos()) return;
    var id = b.getAttribute('data-uni'), campo = b.getAttribute('data-campo');
    var nv = Reino.Cuidados.niveis(id)[campo];
    var v = Math.round(typeof nv === 'number' ? nv : 100);   // sem o campo = cheio
    var baixo = !!Reino.Cuidados.baixo(id)[campo];
    var cheio = b.querySelector('.cuid-cheio');
    if (cheio) cheio.style.width = v + '%';
    b.classList.toggle('baixo', baixo);
    b.setAttribute('aria-valuenow', String(v));
    b.setAttribute('aria-label', CUIDADO[campo].rotulo + ': ' + v + ' de 100' + (baixo ? ', ' + CUIDADO[campo].baixo.toLowerCase() : ''));
    var aviso = b.querySelector('.cuid-aviso');
    if (aviso) aviso.textContent = baixo ? CUIDADO[campo].baixo : '';
  }
  UI.pintarCuidados = function () { U.$$('.cuid-barra[data-uni]').forEach(pintarBarra); rotularMontaria(); };
  U.on('cuidados', function () { UI.pintarCuidados(); });
  // leitor de tela: o chip da montaria diz também a fome, a sede e o banho ("Estábulo — Nome, fome 40, sede 80, banho 60")
  function rotularMontaria() {
    var m = document.querySelector('#hud .chip-montaria');
    if (!m || !est()) return;
    var id = P.montaria(), txt = 'Estábulo — ' + P.nomeUni(id);
    if (cuidadosProntos() && uniChocado(id)) {
      var n = Reino.Cuidados.niveis(id);
      txt += ', fome ' + Math.round(n.fome) + ', sede ' + Math.round(n.sede) + (typeof n.banho === 'number' ? ', banho ' + Math.round(n.banho) : '');
    }
    m.setAttribute('aria-label', txt);
  }

  // retrato do unicórnio para o balão (quem fala é ele)
  function retratoUni(id) {
    try { var u = est().unis[id]; return PA.unicornio(P.defUni(id), Reino.Unicornios.estagio(u ? u.xp : 0), 0).canvas; } catch (e) { return null; }
  }
  // fala uma frase gravada dos cuidados, na voz de quem fala. O nome que ela deu ao unicórnio
  // só aparece no balão (quem.nome); a voz lê a frase gravada.
  function falarCuidado(chave, uniId) {
    var Cu = Reino.Cuidados, texto = Cu.frases[chave];
    if (!texto) return Promise.resolve(null);
    var voz = Cu.vozDaFrase(chave);
    // balão comum que fecha sozinho em 5 s
    var op = { voz: voz, agora: true, tempo: 5000 };
    if (voz === 'unicornio') op.quem = { nome: P.nomeUni(uniId), retrato: retratoUni(uniId), voz: voz };
    return balaoNaTela(texto, op);
  }
  // Balão dos cuidados com uma tela aberta: ele nunca cobre um botão dela. Enquanto está aberto,
  // body.recado-cuidado desce o balão para o pé da tela e encolhe as telas para acima dele
  // (--recado-altura, petshop.css; o painel rola se precisar). Uma tela nova por cima (a
  // confirmação de outra compra) fecha o balão. Os balões das outras telas não mudam.
  var recado = null;   // { texto, telas } do balão dos cuidados que está sobre as telas
  function soLetras(t) { return String(t).replace(/[^a-zà-ÿ0-9]/gi, '').slice(0, 24); }
  function balaoNaTela(texto, op) {
    var pr = Reino.Claude.falar(texto, op);
    if (!UI.temTela()) return pr;
    var meu = recado = { texto: texto, telas: pilha.length };
    var corpo = document.body;
    corpo.classList.add('recado-cuidado');
    var tentativas = 0;
    (function medir() {
      if (recado !== meu) return;
      var bal = document.querySelector('#claude-balao:not([hidden])');
      var tx = bal && bal.querySelector('.claude-texto');
      // com outro balão aberto, o nosso entra 180 ms depois (claude.js): espera ele aparecer
      if (!tx || soLetras(tx.textContent) !== soLetras(texto)) { if (++tentativas < 90) requestAnimationFrame(medir); return; }
      corpo.style.setProperty('--recado-altura', Math.ceil(bal.getBoundingClientRect().height) + 'px');
      requestAnimationFrame(function () { if (recado === meu) mostrarBotoes(); });
    })();
    // segurança: se o balão for descartado ainda na fila (Claude.limpar), a promessa não termina;
    // a tela volta ao tamanho de sempre depois do tempo do balão + 1,5 s
    var seguranca = setTimeout(function () { if (recado === meu) soltarRecado(); }, (op.tempo || 5000) + 1500);
    var focoAntes = document.activeElement;
    pr.then(function () {
      clearTimeout(seguranca);
      if (recado === meu) soltarRecado();
      // o balão sumiu sozinho com o foco nele (Tab preso inclui o balão): o foco volta para a tela
      var t = topo(), at = document.activeElement;
      if (t && (!at || at === document.body || (at.closest && at.closest('#claude-balao')))) {
        if (!(t.contains(focoAntes) && focar(focoAntes))) focar(focaveis(t)[0]);
      }
    });
    return pr;
  }
  // a tela encolheu: a fileira de botões (ou o que está com o foco) continua à vista, rolando só
  // o conteúdo do painel (sem scrollIntoView, que também rolaria a tela de fundo)
  function mostrarBotoes() {
    var t = topo(), pc = t && t.querySelector('.painel-conteudo');
    if (!pc) return;
    var fileiras = pc.querySelectorAll('.intro-botoes');
    var alvo = fileiras.length ? fileiras[fileiras.length - 1] : (pc.contains(document.activeElement) ? document.activeElement : null);
    if (!alvo) return;
    var r = alvo.getBoundingClientRect(), c = pc.getBoundingClientRect();
    if (r.bottom > c.bottom - 8) pc.scrollTop += Math.min(r.bottom - c.bottom + 12, r.top - c.top - 8);
  }
  function soltarRecado() {
    recado = null;
    document.body.classList.remove('recado-cuidado');
    document.body.style.removeProperty('--recado-altura');
  }
  // Um balão sem botões e não modal (a despedida da Dona Aveia, o "Faltam N estrelas"…) que já
  // estava aberto quando ela tocou ou apertou a tecla que abriu uma tela nova fecha: ficava por
  // cima da tela e o toque dela caía no "Ok!"
  var balaoNpcNoGesto = null, telasAntes = 0;
  function textoBalaoNpc() {
    var bal = document.querySelector('#claude-balao:not([hidden])');
    if (!bal || bal.classList.contains('com-botoes')) return null;
    if (Reino.Claude.dialogoAberto && Reino.Claude.dialogoAberto()) return null;
    return soLetras(bal.querySelector('.claude-texto').textContent);
  }
  ['pointerdown', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (e.isTrusted) balaoNpcNoGesto = textoBalaoNpc(); }, true);
  });
  U.on('telas', function (n) {
    var abriu = n > telasAntes; telasAntes = n;
    if (abriu && balaoNpcNoGesto && textoBalaoNpc() === balaoNpcNoGesto && !(recado && soLetras(recado.texto) === balaoNpcNoGesto)) {
      // limpar, não só fechar: a despedida da Dona Aveia na fila atrás do "Faltam…" entrava por cima da tela nova
      balaoNpcNoGesto = null; Reino.Claude.limpar();
    }
  });
  U.on('telas', function (n) {
    if (!recado) return;
    if (n > recado.telas) {                                           // tela nova por cima: o recado já passou
      var tx = document.querySelector('#claude-balao:not([hidden]) .claude-texto');
      var eraEle = tx && soLetras(tx.textContent) === soLetras(recado.texto);
      soltarRecado();
      if (eraEle) Reino.Claude.fechar();
    }
    else if (!n) soltarRecado();                                      // voltou ao mapa: balão comum
    else recado.telas = n;
  });
  // dá uma comida da despensa: nhac + o unicórnio agradece; barriga cheia: não gasta a comida
  function darComida(uniId, comidaId) {
    var r = Reino.Cuidados.alimentar(uniId, comidaId);
    if (r.ok) { Reino.Som.tocar('nhac'); falarCuidado('comeu', uniId); }
    else if (r.motivo === 'cheio') { Reino.Som.tocar('toque'); falarCuidado('cheio', uniId); }
    else if (r.motivo === 'sem-comida') { Reino.Som.tocar('toque'); falarCuidado('despensaVazia', uniId); }
    return r;
  }
  function comidaPorId(id) { return Reino.Cuidados.comidas().find(function (c) { return c.id === id; }) || null; }
  function textoEnche(c) { return c.enche ? 'Enche tudo!' : 'Enche +' + c.fome; }
  // nome da comida: palavra com hífen não quebra no hífen ("arco-" / "íris"); o resto hifeniza
  function nomeComida(nome) {
    return String(nome).split(/(\S+-\S+)/).map(function (p, i) { return i % 2 ? el('span.sem-quebra', p) : hifenizar(p); });
  }

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

  /* ---------- botão das fotos (Reino.Fotos, js/fotos.js) ---------- */
  // toque → tira a foto; toque longo (config.fotos.toqueLongoMs) → abre o álbum, sem tirar a foto.
  // Apagado (aria-disabled) quando Fotos.podeTirar() diz não: transição, tela aberta, balão, banho.
  function fotos() { var F = Reino.Fotos; return F && typeof F.tirar === 'function' ? F : null; }
  function podeFotografar() {
    var F = fotos();
    try { return !!(F && (typeof F.podeTirar !== 'function' || F.podeTirar())); } catch (e) { return false; }
  }
  function pintarBotaoFoto() {
    var b = U.$('#hud .btn-foto');
    if (!b) return;
    b.hidden = !fotos();
    var pode = podeFotografar();
    if (b.classList.contains('desligado') === !pode) return;
    b.classList.toggle('desligado', !pode);
    b.setAttribute('aria-disabled', String(!pode));
  }
  UI.pintarBotaoFoto = pintarBotaoFoto;
  ['cena', 'telas', 'ocupada', 'transicao'].forEach(function (ev) { U.on(ev, function () { pintarBotaoFoto(); }); });
  // balão de diálogo não tem evento: confere de vez em quando (só mexe no DOM quando muda)
  setInterval(pintarBotaoFoto, 500);
  function botaoFoto() {
    var b = el('button.btn-tela-cheia.btn-foto', { type: 'button', 'aria-label': 'Tirar foto', 'aria-disabled': 'false', title: 'Tirar foto (segure para ver o álbum)' });
    b.appendChild(PA.iconeEmoji('📷', 2));
    var timer = null, longoEm = -1e9;
    function soltar() { if (timer) { clearTimeout(timer); timer = null; } }
    b.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      soltar(); longoEm = -1e9;   // toque novo: o click dele vale
      var ms = (Reino.config.fotos && Reino.config.fotos.toqueLongoMs) || 600;
      timer = setTimeout(function () {
        timer = null;
        var F = fotos();
        if (!F || UI.temTela() || !podeFotografar() || typeof F.abrirAlbum !== 'function') return;
        longoEm = performance.now();   // o click que vem ao soltar o dedo não tira a foto
        // nem fecha o álbum que acabou de abrir embaixo do dedo (o dedo ainda está na tela)
        UI.segurarToques();
        Reino.Som.tocar('toque');
        F.abrirAlbum();
      }, ms);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { b.addEventListener(ev, soltar); });
    // Enter/Espaço no botão são dele: não chegam ao main.js (que agiria no que estiver perto dela)
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
    // toque longo no celular abriria o menu do navegador
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    b.addEventListener('click', function (e) {
      // (só o do dedo/mouse, logo depois: o álbum cobre o botão e às vezes esse click nem chega)
      if (e.detail && performance.now() - longoEm < 2000) { longoEm = -1e9; e.preventDefault(); return; }
      soltar();
      var F = fotos();
      pintarBotaoFoto();
      if (!F || !podeFotografar()) return;
      F.tirar();
    });
    return b;
  }

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
    // tela cheia e câmera juntos (no celular, um embaixo do outro, ao lado do chip da montaria)
    var foto = botaoFoto();
    hud.appendChild(el('div.hud-topo', el('div.hud-esq', dinheiro, estrelas, ovos), el('div.hud-dir', el('div.hud-botoes', telaCheia, foto), montaria)));
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
    // com uma tela aberta, o HUD fica atrás dela: um Enter num botão dele não empilha outra tela
    hud.addEventListener('click', function (e) { if (UI.temTela()) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    pintarBotaoTela();
    pintarBotaoFoto();
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
    rotularMontaria();
    // o ícone do estágio fica ao lado do nome do estágio e da barrinha de crescimento; assim
    // a linha da fome e da sede cabe embaixo sem o chip crescer
    var estg = Reino.Unicornios.ESTAGIOS[pe.estagio];
    var comCuidados = cuidadosProntos() && uniChocado(id);
    // com fome e sede, o celular arruma o chip em outra grade (petshop.css): nome em cima, na largura toda
    m.classList.toggle('com-cuidados', comCuidados);
    m.appendChild(el('span.montaria-info',
      el('b', P.nomeUni(id)),
      el('span.montaria-cresce',
        iconePequeno(estg.emoji, 22),
        el('span.montaria-cresce-col',
          el('span.montaria-estagio', estg.nome),
          el('span.barrinha', el('span', { style: { width: Math.round(pe.pct * 100) + '%' } })))),
      comCuidados ? barrasCuidado(id, 'mini') : null));
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
    if (lugar.tipo === 'petshop') return UI.telaPetShop();
    // 'observatorio': não tem tela própria, só o interior
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
      // .ir-embaixo: no celular o "Entrar →"/"Jogar de novo" desce para a linha de baixo (senão
      // espreme o nome da sala numa coluna de uma letra)
      var b = el('button.sala-card.ir-embaixo' + (reg.feita ? '.feita' : ''), { type: 'button' },
        el('span.sala-emoji', s.emoji),
        el('span.sala-info', el('b', hifenizar((i + 1) + '. ' + s.nome)), el('small', 'Apostila: ' + s.paginas), chips),
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
  // a lista é única e mora em js/loja-itens.js (Reino.LojaItens): enfeites à venda e prêmios da Escola
  var LI = Reino.LojaItens;
  var ITENS = LI.ENFEITES;
  UI.ITENS_LOJA = ITENS;   // apelido: a Loja das Fadas por dentro e quem mais precisar leem a mesma lista
  // acessórios das provas usam os mesmos encaixes dos enfeites da loja
  function acessorioComoItem(a) { return LI.item(a.id); }
  function itemPorId(id) { return LI.item(id); }
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
      // um enfeite por encaixe: tira o que estava no mesmo encaixe
      var ja = u.enfeites.indexOf(item.id) >= 0;
      u.enfeites = u.enfeites.filter(function (id) { var it = itemPorId(id); return it && it.slot !== item.slot; });
      if (!ja) u.enfeites.push(item.id);
    }
  }

  UI.alternarEnfeite = function (id) { var it = itemPorId(id); if (it) alternar(it); };
  UI.usandoEnfeite = function (id) { var it = itemPorId(id); return !!it && usando(it); };

  // ícone do item: desenho de js/icones.js pela chave ('enfeite:…', 'acessorio:…') ou o emoji (vira pixel sozinho)
  function iconeItem(item) {
    var chave = item.icone || '';
    if (chave.indexOf(':') > 0) {
      var d = PA.iconeDesenho(chave);
      if (d) return PA.paraDOM(d, PA.escalaNitida(36, 16), 'icone-acessorio');
    }
    return chave;
  }
  // comprar com estrelas (enfeite ou prêmio à venda): gasta, guarda, já veste e grava
  function comprar(item, depois) {
    if (P.estrelas() < item.preco) {
      Reino.Som.tocar('toque');
      var falta = item.preco - P.estrelas();
      // o número só aparece na tela; a voz fala a frase gravada (de enfeite ou de prêmio da Escola)
      Reino.Claude.falar((falta === 1 ? 'Falta 1 estrela' : 'Faltam ' + falta + ' estrelas') + ' para ' + item.nome + '. Cada acerto de primeira vale uma estrela! ⭐',
        { fala: [item.premio ? LI.FALAS.faltamPremio : Reino.Falas.fixas.lojaFaltam], tempo: 5000 });
      return;
    }
    UI.confirmar('Trocar ' + item.preco + ' estrelas por ' + item.nome + '?', 'Sim, quero! ✨', 'Agora não', true).then(function (sim) {
      if (!sim) return;
      itemComprado = item.id;   // o cartão dele ignora toques perto do "Sim" até 1,1 s sem toque
      if (!P.gastarEstrelas(item.preco)) return;   // (as estrelas não mudam enquanto ela confirma, mas por via das dúvidas)
      est().loja[item.id] = true;
      if (!usando(item)) alternar(item);
      P.salvar();
      Reino.Som.tocar('estrela'); UI.confete(40);
      depois(); U.emit('mapaMudou');
    });
  }
  var avisouPremios = false;   // a regra nova dos prêmios é falada uma vez por sessão

  UI.telaLoja = function () {
    var pn = painel('lugar', '🧚 Loja das Fadas');
    var c = pn.conteudo;
    var saldo = el('div.saldo-estrelas');
    var vitrine = el('div.vitrine-previa');
    var grade = el('div.grade-loja');
    var premiosBox = el('div');
    function pintar() {
      // o repintar troca os botões: o foco volta para o mesmo item (senão cai no body)
      var ativo = document.activeElement;
      var focoItem = ativo && pn.tela.contains(ativo) && ativo.getAttribute('data-item');
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
        var b = el('button.item-loja' + (tem ? '.comprado' : '') + (usando(item) ? '.usando' : ''),
          { type: 'button', 'data-item': item.id, 'aria-label': item.nome + ', ' + (tem ? (usando(item) ? 'usando' : 'comprado, tocar para usar') : item.preco + ' estrelas') },
          el('span.item-icone', iconeItem(item)), el('b', hifenizar(item.nome)),
          el('span.item-preco', tem ? (usando(item) ? '✓ Usando' : 'Usar') : '⭐ ' + item.preco));
        b.addEventListener('click', function (e) {
          if (logoDepoisDaCompra(e, item.id)) return;
          if (tem) { alternar(item); Reino.Som.tocar('selecionar'); P.salvar(); pintar(); U.emit('mapaMudou'); return; }
          comprar(item, pintar);
        });
        grade.appendChild(b);
      });
      // prêmios da Escola do Reino: ganha 1 acertando TUDO na prova; os outros 2 da mesma prova ficam à venda
      premiosBox.innerHTML = '';
      (Reino.provas || []).forEach(function (pv) {
        var reg = P.regProva(pv);
        var ganhou = reg.premio ? Reino.Unicornios.RARIDADES[reg.premio] : null;
        premiosBox.appendChild(el('p.bau-nota', el('b', pv.emoji + ' ' + pv.nome), ganhou
          ? ' • Você ganhou o prêmio ' + ganhou.emoji + ' ' + ganhou.nome.toLowerCase() + '! Os outros estão à venda.'
          : ' • Acerte TUDO na prova para ganhar um deles.'));
        var g = el('div.grade-loja');
        LI.premios().filter(function (p) { return p.provaId === pv.id; }).forEach(function (p) {
          var item = acessorioComoItem(p);
          var st = LI.estadoPremio(p, P);
          var tem = st === 'ganho' || st === 'comprado';
          var rar = Reino.Unicornios.RARIDADES[p.raridade];
          var desenho = st === 'bloqueado'
            ? PA.paraDOM(PA.silhueta(PA.iconeDesenho('acessorio:' + p.id)), PA.escalaNitida(36, 16), 'icone-acessorio')
            : Reino.Provas.icone(p.id, 36);
          var rotulo = st === 'ganho' ? el('span.chip-mini.ok', '🏫 Ganho na prova')
            : st === 'comprado' ? el('span.chip-mini', '⭐ Comprado')
            : el('span.chip-mini', rar.emoji + ' ' + rar.nome);
          var preco = tem ? (usando(item) ? '✓ Usando' : 'Usar') : st === 'aVenda' ? '⭐ ' + p.preco : '🔒 ' + rar.emoji + ' ' + rar.nome;
          var b = el('button.item-loja.item-premio.rar-' + p.raridade + '.premio-' + st + (tem ? '.comprado' : st === 'bloqueado' ? '.bloqueado' : '') + (tem && usando(item) ? '.usando' : ''),
            { type: 'button', 'data-item': p.id, 'data-estado': st,
              'aria-label': p.nome + ', ' + (st === 'bloqueado' ? 'bloqueado, ' + rar.nome.toLowerCase()
                : tem ? (usando(item) ? 'usando' : (st === 'ganho' ? 'ganho na prova' : 'comprado') + ', tocar para usar')
                : p.preco + ' estrelas, ' + rar.nome.toLowerCase()) },
            el('span.item-icone', desenho), el('b', hifenizar(p.nome)), st === 'bloqueado' ? null : rotulo, el('span.item-preco', preco));
          b.addEventListener('click', function (e) {
            if (logoDepoisDaCompra(e, item.id)) return;
            if (tem) { alternar(item); Reino.Som.tocar('selecionar'); P.salvar(); pintar(); U.emit('mapaMudou'); return; }
            if (st === 'aVenda') return comprar(item, pintar);
            Reino.Som.tocar('toque');
            Reino.Claude.falar(Reino.Falas.provas.lojaPremio);
          });
          g.appendChild(b);
        });
        premiosBox.appendChild(g);
      });
      if (focoItem) focar(pn.tela.querySelector('[data-item="' + focoItem + '"]'));
    }
    c.appendChild(saldo);
    c.appendChild(vitrine);
    c.appendChild(grade);
    c.appendChild(el('h3.estabulo-grupo', '🏫 Prêmios da Escola do Reino'));
    c.appendChild(el('p.bau-nota', 'Acerte TUDO numa prova e ganhe um prêmio; os outros se trocam por estrelas. 🌈'));
    c.appendChild(premiosBox);
    c.appendChild(el('p.bau-nota', 'As fadas trocam estrelas por enfeites. Você ganha estrelas acertando de primeira e com a Estrela da Calma. 🌙'));
    pintar();
    // primeira vez na sessão com prêmio à venda: o Claude conta a novidade
    var algumAVenda = LI.premios().some(function (p) { return LI.estadoPremio(p, P) === 'aVenda'; });
    if (algumAVenda && !avisouPremios) {
      avisouPremios = true;
      // fecha sozinho e fica no pé da tela, sem cobrir os cartões (como os balões dos cuidados)
      balaoNaTela(LI.FALAS.premiosAVenda, { tempo: 5000 });
    }
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
      // 🌱 antes do crescimento, como o 🍎 e o 💧 da fome e da sede (na tritanopia as cores se parecem)
      carta.appendChild(el('span.carta-cresce', iconePequeno('🌱', 16), el('span.barrinha', el('span', { style: { width: Math.round(pe.pct * 100) + '%' } }))));
      if (cuidadosProntos()) carta.appendChild(barrasCuidado(d.id, 'mini'));
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
    if (cuidadosProntos()) {
      c.appendChild(el('div.cuid-detalhe', barrasCuidado(d.id, 'grande')));
      // com sede, o Estábulo não tem o que dar: diz onde tem água
      if (Reino.Cuidados.baixo(d.id).sede) c.appendChild(el('p.bau-nota', '💧 Tem água fresquinha na Pet Shop, de graça!'));
      var comer = el('button.btn-grande.btn-secundario.btn-dar-comida', { type: 'button' }, '🥕 Dar comida');
      comer.addEventListener('click', function () { Reino.Som.tocar('toque'); escolherComida(d); });
      botoes.appendChild(comer);
    }
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

  // "Dar comida" no Estábulo: escolhe uma comida da despensa (só as que tem)
  function escolherComida(d) {
    var Cu = Reino.Cuidados;
    var pn = painel('comida', '🥕 Dar comida');
    var c = pn.conteudo;
    var lista = Cu.despensa();
    c.appendChild(el('div.petshop-uni',
      UI.spriteMontaria(d.id, 3, { semEnfeite: true }),
      el('div.petshop-uni-info', el('b', P.nomeUni(d.id)), barrasCuidado(d.id, 'grande'))));
    if (!lista.length) {
      c.appendChild(el('p.petshop-vazia', '🧺 A despensa está vazia.'));
      c.appendChild(el('p.bau-nota', 'A Dona Aveia vende comidinhas na Pet Shop, em frente ao Estábulo. Lá também tem água fresquinha e banho de espuma! 🐾'));
      var ir = el('button.btn-grande.btn-principal', { type: 'button' }, '🐾 Ir até a Pet Shop');
      ir.addEventListener('click', function () {
        var l = Mapa.lugares().find(function (x) { return x.tipo === 'petshop'; });
        Reino.Som.tocar('toque'); Reino.Claude.fechar(); UI.fecharTodas();
        focarMapa();   // ela vai andando até a Pet Shop: o foco fica no mapa, não no menu
        if (l) U.emit('irPara', l);
      });
      c.appendChild(el('div.intro-botoes', ir));
      // o aviso já está escrito na tela: só a voz (um balão por cima tapava o "Ir até a Pet Shop")
      Reino.Som.falar(Cu.frases.despensaVazia, { voz: Cu.vozDaFrase('despensaVazia') });
      setTimeout(function () { try { ir.focus({ preventScroll: true }); } catch (e) {} }, 30);
      return;
    }
    c.appendChild(el('p.saldo-estrelas', 'O que ' + P.nomeUni(d.id) + ' vai comer?'));
    var grade = el('div.grade-loja.grade-comidas');
    lista.forEach(function (x) {
      // o bolo ("Enche tudo!") ocupa a linha inteira no celular, como na Pet Shop: "arco-íris" cabe sem quebrar
      var b = el('button.item-loja.item-comida' + (x.comida.enche ? '.comida-larga' : ''), { type: 'button', 'data-comida': x.comida.id, 'aria-label': x.comida.nome + ', ' + textoEnche(x.comida).toLowerCase() + ', ' + x.quantidade + ' na despensa' },
        el('span.item-icone', x.comida.icone), el('b', nomeComida(x.comida.nome)),
        el('span.comida-enche', textoEnche(x.comida)),
        el('span.item-preco', '🧺 ×' + x.quantidade));
      b.addEventListener('click', function () {
        var r = darComida(d.id, x.comida.id);
        if (r.ok) UI.fecharTela(pn.tela);
      });
      grade.appendChild(b);
    });
    c.appendChild(grade);
    // o foco fica na própria tela (UI.abrirTela), e a 1ª comida só pelo Tab: Enter + Enter dava a
    // cenoura sem ela escolher
  }

  /* ---------- pet shop (tela da Dona Aveia) ---------- */
  // o que aconteceu na última visita à tela da Pet Shop: quem abriu a tela (a Dona Aveia) pode
  // escolher a despedida. { comprou, deu } são contagens; valem até a próxima visita
  UI.visitaPetShop = { comprou: 0, deu: 0 };
  UI.telaPetShop = function () {
    var Cu = Reino.Cuidados;
    var visita = UI.visitaPetShop = { comprou: 0, deu: 0 };
    var pn = painel('petshop', '🐾 Pet Shop');
    var c = pn.conteudo;
    var saldo = el('div.saldo-estrelas');
    var uniBox = el('div.petshop-uni');
    var grade = el('div.grade-loja.grade-comidas');
    var despensa = el('div.petshop-despensa');
    function pintar(focar) {
      // refazer a grade encolhe o painel por um instante: a rolagem volta para onde ela estava
      var rolagem = c.scrollTop;
      U.preencher(saldo, '⭐ Você tem ' + P.estrelas() + (P.estrelas() === 1 ? ' estrela' : ' estrelas'));
      var id = P.montaria();
      uniBox.innerHTML = '';
      uniBox.appendChild(UI.spriteMontaria(id, window.innerWidth <= 480 ? 3 : 4));
      uniBox.appendChild(el('div.petshop-uni-info', el('b', P.nomeUni(id)), uniChocado(id) ? barrasCuidado(id, 'grande') : null));
      grade.innerHTML = '';
      Cu.comidas().forEach(function (co) {
        var tem = Cu.quantidade(co.id);
        var b = el('button.item-loja.item-comida' + (P.estrelas() < co.preco ? '.falta' : ''),
          { type: 'button', 'data-comida': co.id, 'aria-label': co.nome + ', ' + textoEnche(co).toLowerCase() + ', ' + co.preco + (co.preco === 1 ? ' estrela' : ' estrelas') + (tem ? ', ' + tem + ' na despensa' : '') },
          el('span.item-icone', co.icone), el('b', nomeComida(co.nome)),
          el('span.comida-enche', textoEnche(co)),
          el('span.item-preco', '⭐ ' + co.preco),
          tem ? el('span.chip-mini.comida-tem', '🧺 ×' + tem) : null);
        b.addEventListener('click', function () { comprarComida(co); });
        grade.appendChild(b);
      });
      despensa.innerHTML = '';
      var lista = Cu.despensa();
      if (!lista.length) despensa.appendChild(el('p', '🧺 A despensa está vazia.'));
      else {
        despensa.appendChild(el('b', '🧺 Na despensa:'));
        lista.forEach(function (x) { despensa.appendChild(el('span.chip-mini', x.comida.icone + ' ×' + x.quantidade)); });
      }
      if (focar) { var f = grade.querySelector('[data-comida="' + focar + '"]'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }
      c.scrollTop = rolagem;
    }
    function faltamEstrelas(co, faltam) {
      Reino.Som.tocar('toque');
      // o número fica só na tela; o resto é a frase gravada, igual ao que a voz diz (como na Loja).
      // Ela diz o caminho para ganhar estrela (valUX): ela sem estrela e ele com fome
      balaoNaTela((faltam === 1 ? 'Falta 1 estrela! ' : 'Faltam ' + faltam + ' estrelas! ') + Cu.frases.faltamEstrelas,
        { fala: [Cu.frases.faltamEstrelas], agora: true, tempo: 5000 });
    }
    // nada é gasto sem ela confirmar (como na Loja): um diálogo só, com comprar e dar, comprar
    // e guardar, ou "Agora não" (o seguro, com o foco e no Esc)
    function comprarComida(co) {
      var id = P.montaria();
      // de barriga cheia ele não come: sem "dar agora", e ela fica sabendo antes de gastar
      var cheio = uniChocado(id) && Cu.niveis(id).fome >= 99.5;
      // tem dessa comida guardada e ele pode comer: a 1ª opção é dar uma da despensa, sem gastar
      var guardada = !cheio && uniChocado(id) ? Cu.quantidade(co.id) : 0;
      var podeComprar = P.estrelas() >= co.preco;
      if (!podeComprar && !guardada) { faltamEstrelas(co, co.preco - P.estrelas()); return; }
      var pergunta = 'Trocar ' + co.preco + (co.preco === 1 ? ' estrela' : ' estrelas') + ' por ' + co.nome + '?';
      var msg = guardada
        ? [co.nome + ': tem ' + guardada + ' na despensa! 🧺', podeComprar ? el('span.confirmar-nota', 'Ou trocar ' + co.preco + (co.preco === 1 ? ' estrela' : ' estrelas') + ' por mais uma.') : null]
        : cheio ? [pergunta, el('span.confirmar-nota', P.nomeUni(id) + ' está de barriga cheia. A comidinha fica guardada para depois! 💛')] : pergunta;
      // com comida guardada: "Dar uma", "Agora não" e "Comprar e guardar" (sem "Comprar e dar":
      // 4 botões não cabiam em tela pequena). "Dar uma" gasta comida guardada: nasce apagado e
      // longe do dedo, como os botões que gastam estrela
      var opcoes = guardada ? [
        { rotulo: 'Dar uma da despensa 🧺', valor: 'despensa', principal: true, gasta: true },
        { rotulo: 'Agora não', valor: null, seguro: true },
        podeComprar ? { rotulo: 'Comprar e guardar 🧺', valor: 'guardar', gasta: true } : null,
      ] : [
        cheio ? null : { rotulo: 'Comprar e dar agora ' + co.icone, valor: 'dar', principal: true, gasta: true },
        { rotulo: 'Comprar e guardar 🧺', valor: 'guardar', principal: cheio, gasta: true },
        { rotulo: 'Agora não', valor: null, seguro: true },
      ];
      UI.escolher(msg, opcoes.filter(Boolean), 'painel-compra').then(function (v) {
        if (!v) { pintar(co.id); return; }
        if (v === 'despensa') { var rd = darComida(id, co.id); if (rd.ok) visita.deu++; pintar(co.id); return; }
        var r = Cu.comprar(co.id);
        if (!r.ok) { if (r.motivo === 'estrelas') faltamEstrelas(co, r.faltam); else Reino.Som.tocar('toque'); pintar(co.id); return; }
        Reino.Som.tocar('estrela');
        visita.comprou++;
        if (v === 'dar') darComida(id, co.id);
        else falarCuidado('guardado', id);
        pintar(co.id);
      });
    }
    c.appendChild(saldo);
    c.appendChild(uniBox);
    c.appendChild(grade);
    c.appendChild(despensa);
    c.appendChild(el('p.bau-nota', '💧 A água é de graça: é só beber no bebedouro, no Cantinho da Água.'));
    pintar();
    var primeiro = grade.querySelector('button');
    setTimeout(function () { if (pn.tela.parentNode) try { primeiro.focus({ preventScroll: true }); } catch (e) {} }, 30);
  };

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
        // o ovo (com o foco) sumiu: pelo teclado, o foco vai para o botão principal, não para o body
        var principal = botoes.querySelector('.btn-principal');
        compactarNascimento(t, card, principal);
        if (UI.porTeclado()) UI.focarTeclado(principal, 600);
        Reino.Som.falar([d.raridade === 'lendario' ? Reino.Falas.fixas.lendario : Reino.Falas.fixas.nasceu, { texto: d.frase, voz: 'unicornio' }], { voz: 'claude' });
      }
    });
  }
  UI.chocarUm = chocarUm;
  /* O cartão de quem nasceu (o do lendário, no celular e no notebook) passava da altura da tela, e o
     texto ainda cresce um pouco quando a fonte termina de carregar. Quando não cabe, ele fica mais
     compacto, um passo de cada vez (espaços, depois o desenho, depois as letras), até o título e o
     botão principal aparecerem inteiros sem rolar: é a hora da comemoração, nada de rolar o título.
     Mede de novo quando a fonte carrega e quando o conteúdo muda de tamanho no primeiro instante.
     Se nem assim couber, por toque fica como está (título inteiro); pelo teclado, o botão com o
     foco aparece inteiro (mostrarFoco rola o cartão por dentro). */
  function compactarNascimento(t, card, botao) {
    var sprite = card.querySelector('.detalhe-sprite'), tela = sprite && sprite.querySelector('canvas');
    var dica = card.querySelector('.detalhe-dica'), nome = card.querySelector('.ovo-nome'), botoes = botao && botao.parentElement;
    function escala(k) { if (tela) { tela.style.width = (tela.width * k) + 'px'; tela.style.height = (tela.height * k) + 'px'; } }
    var passos = [
      function () { card.style.gap = '8px'; card.style.paddingTop = card.style.paddingBottom = '14px'; if (botoes) botoes.style.marginTop = '6px'; },
      function () { escala(7); if (sprite) sprite.style.minHeight = '0'; },
      function () { escala(5.5); if (nome) nome.style.fontSize = '1.3em'; if (dica) dica.style.fontSize = '0.82em'; },
      function () { escala(4.5); },
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
        // (só perto desse toque; main.js pergunta a UI.toqueSegurado)
        if (e.isTrusted && e.detail) UI.segurarToques(1500);
        focarMapa();   // ela vai andando sozinha: o foco não volta ao botão do menu (Espaço reabria Lugares)
        U.emit('irPara', l);
      });
      lista.appendChild(b);
    });
    pn.conteudo.appendChild(lista);
  };

  /* ---------- ajustes ---------- */
  UI.telaAjustes = function () {
    var pn = painel('ajustes', '⚙️ Ajustes');
    var a = est().ajustes;   // só para desenhar os interruptores ao abrir
    // cada toque lê e grava nos ajustes do estado de AGORA: com a tela aberta, o progresso pode ser
    // recarregado ou mesclado (a aba volta do fundo, outro aparelho) e o objeto de antes fica solto.
    // O valor novo é o contrário do que o interruptor mostra (o que ela viu é o que ela quis mudar)
    function atuais() { return est().ajustes; }
    function ligado(b) { return b.getAttribute('aria-checked') === 'true'; }
    // no 1º segundo depois de abrir, um toque (o dedo ainda batendo no menu) não muda nenhum
    // interruptor: ficava gravado ("Letras grandes" ligava sozinho no tablet)
    var abriuAjustes = performance.now();
    pn.tela.addEventListener('click', function (e) {
      var sw = e.target.closest && e.target.closest('.interruptor');
      if (!sw || !e.isTrusted || !e.detail || performance.now() - abriuAjustes >= 1000) return;
      e.preventDefault(); e.stopImmediatePropagation(); toqueIgnorado(sw);
    }, true);
    function interruptor(chave, rotulo, desc, depois) {
      var b = el('button.interruptor', { type: 'button', role: 'switch', 'aria-checked': String(!!a[chave]) }, el('span.interruptor-texto', el('b', rotulo), el('small', desc)), el('span.interruptor-bola'));
      b.addEventListener('click', function () {
        var v = !ligado(b), aj = atuais();
        aj[chave] = v; b.setAttribute('aria-checked', String(v)); P.salvar(); Reino.Som.tocar('toque'); if (depois) depois(v);
      });
      return b;
    }
    var c = pn.conteudo;
    c.appendChild(interruptor('som', '🔔 Sons', 'Sons de acerto, moedas e ovos.'));
    c.appendChild(interruptor('musica', '🎵 Musiquinha', 'Música bem baixinha enquanto joga.', function (v) { Reino.Som.musica(v); }));
    c.appendChild(interruptor('voz', '🗣️ Voz', 'Ler perguntas e falas em voz alta.'));
    c.appendChild(interruptor('animacoes', '✨ Animações', 'Confete, brilhos e água mexendo.', function () { U.emit('mapaMudou'); }));
    c.appendChild(interruptor('setas', '🕹️ Setas na tela', 'Botões de seta para andar pelo reino.', function () { U.emit('setas'); }));
    c.appendChild(interruptor('surpresa', '❓ Perguntas surpresa', 'De vez em quando, uma pergunta valendo ' + ((Reino.config.surpresa && Reino.config.surpresa.estrelas) || 2) + ' estrelas.'));
    var tam = el('button.interruptor', { type: 'button', role: 'switch', 'aria-checked': String(a.texto > 1) }, el('span.interruptor-texto', el('b', '🔠 Letras grandes'), el('small', 'Deixa os textos maiores.')), el('span.interruptor-bola'));
    tam.addEventListener('click', function () { var v = !ligado(tam); atuais().texto = v ? 1.15 : 1; tam.setAttribute('aria-checked', String(v)); UI.aplicarAjustes(); P.salvar(); });
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
  // pelo menu, sempre pede o PIN; `desbloqueada` só na reabertura logo depois de registrar um
  // pagamento ou começar um novo ciclo (o pai acabou de digitar o PIN nesta mesma tela).
  // `materiaId`: reabre mostrando o bloco da matéria que acabou de ser paga (e, pelo teclado, com o
  // foco no "Registrar pagamento" dela), para o pai não perder o lugar
  UI.telaPais = function () { abrirPais(false); };
  function abrirPais(desbloqueada, materiaId) {
    var pn = painel('pais', '🔒 Área dos pais');
    var c = pn.conteudo;
    if (desbloqueada) { conteudoPais(c, pn); if (materiaId) mostrarMateriaPaga(c, materiaId); return; }
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
  }
  // rola só o conteúdo do painel (nada de scrollIntoView) até o bloco da matéria ficar no alto
  function mostrarMateriaPaga(c, materiaId) {
    var campo = document.getElementById('pago-' + materiaId);
    var bloco = campo && campo.closest('.pais-materia');
    if (!bloco) return;
    var r = bloco.getBoundingClientRect(), cr = c.getBoundingClientRect();
    c.scrollTop += r.top - (cr.top + c.clientTop) - (parseFloat(getComputedStyle(c).paddingTop) || 0);   // a 1ª (História) fica no alto, como abriu
    if (UI.porTeclado()) UI.focarTeclado(bloco.querySelector('.pais-pagar button'));
  }

  function conteudoPais(c, pn) {
    var total = 0, pagoTotal = 0;
    Reino.materias.forEach(function (m) {
      var ganho = P.dinheiroMateria(m), pago = P.pago(m.id);
      total += ganho; pagoTotal += pago;
      var campo = el('input.campo-pago#pago-' + m.id, { type: 'number', min: 0, step: 1, value: pago, 'aria-label': 'Valor já pago de ' + m.nome });
      var salvar = el('button.btn-pequeno', { type: 'button' }, 'Registrar pagamento');
      salvar.addEventListener('click', function () { P.registrarPagamento(m.id, parseFloat(campo.value) || 0); UI.fecharTela(pn.tela); abrirPais(true, m.id); });
      var t = est().treinos[m.id] || {};
      c.appendChild(el('div.pais-materia',
        el('h3', m.emoji + ' ' + m.nome),
        el('p', 'Salas feitas: ', el('b', P.salasFeitas(m) + ' de ' + m.salas.length), ' • Ganhou: ', el('b', U.reais(ganho)), ' • Já pago: ', el('b', U.reais(pago)), ' • A pagar: ', el('b', U.reais(Math.max(0, ganho - pago)))),
        el('p', 'Treino da Medalha: ', el('b', t.melhor ? ({ ouro: '🥇 ouro', prata: '🥈 prata', bronze: '🥉 bronze' }[t.melhor]) : 'ainda não fez'), t.vezes ? ' (' + t.vezes + (t.vezes === 1 ? ' vez)' : ' vezes)') : ''),
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
        if (!sim) return; P.novoCiclo(); UI.fecharTela(pn.tela); abrirPais(true); U.emit('mapaMudou');
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
