/* Escolha do kit de móveis da casa (docs/contratos/casa.md §9.2). Uma grade de cartões dos kits livres
   (Reino.Casa.kitsLivres(), na ordem de config.casa.kits), cada um com a capa desenhada pelo `desenhar` do objeto
   `kit.capa` da biblioteca (direção baixo, canvas pequeno, escala inteira) e o nome (Casa.nomeKit).
   UI.escolherKitCasa() → Promise(bool): o toque dá o kit (Casa.escolherKit), festa e fala do Claude → true;
   "Depois" (ou Esc) → false, o kit fica pendente (a caixa de mudança reabre a escolha).
   UI.casaKitsPendentes() → Promise: abre a escolha uma vez por kit pendente; sem nenhum, resolve na hora.
   Estilos: css/ui-casa-kits.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;
  var FALAS = Reino.CasaFalas;   // ui/casa-falas.js
  var T = 16;   // a capa cabe num quadrado de 96 px (80 no celular), em escala inteira

  // a capa: o objeto da biblioteca desenhado de frente, com a folga do sprite da cena (2 px dos lados, topo acima).
  // Também a dos móveis avulsos (ui/casa-moveis.js: UI.capaCasa)
  function capa(tipo) {
    var I = Reino.Interiores, lib = tipo && I && I.OBJETOS && I.OBJETOS[tipo];
    if (!lib || !lib.desenhar) return el('span.ckit-capa-vazia', { 'aria-hidden': 'true' });
    var w = (lib.w || 1) * T + 4, topo = lib.topo || 0, h = topo + (lib.h || 1) * T + 2;
    var k = Math.max(1, Math.floor((window.innerWidth < 480 ? 80 : 96) / Math.max(w, h)));
    var cv = PA.novoCanvas(w * k, h * k), ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.scale(k, k); ctx.translate(2, topo);
    try {
      lib.desenhar(ctx, 0, 0, { tipo: tipo, x: 0, y: 0, w: lib.w || 1, h: lib.h || 1, dir: 'baixo' }, Reino.Progresso);
    } catch (e) { console.warn('capa:', tipo, e); }
    cv.className = 'ckit-capa';
    cv.setAttribute('aria-hidden', 'true');
    return cv;
  }

  UI.capaCasa = capa;

  /** A grade dos kits livres. @returns {Promise<boolean>} true se escolheu um kit */
  UI.escolherKitCasa = function () {
    var C = Reino.Casa, livres = C ? C.kitsLivres() : [];
    if (!livres.length || !window.PA) return Promise.resolve(false);
    return new Promise(function (resolver) {
      var pn = UI.painel('kit-casa', 'Escolha um kit de móveis', { semFechar: true });
      var feito = false;
      pn.conteudo.appendChild(el('p.ckit-dica', U.colado('Toque no kit que você quer para a sua casa.')));
      var grade = el('div.ckit-grade');
      var ordem = (Reino.config.casa && Reino.config.casa.kits) || livres;
      ordem.filter(function (id) { return livres.indexOf(id) >= 0; }).forEach(function (id) {
        var kit = Reino.kitCasa(id);
        var b = el('button.ckit-cartao', { type: 'button', 'data-kit': id }, el('span.ckit-moldura', capa(kit && kit.capa)), el('b.ckit-nome', U.colado(C.nomeKit(id))));
        b.addEventListener('click', function () { escolher(id, b); });
        grade.appendChild(b);
      });
      var depois = el('button.btn-grande.btn-secundario.ckit-depois', { type: 'button' }, 'Depois');
      depois.addEventListener('click', function () { if (!feito) sair(false); });
      pn.conteudo.appendChild(grade);
      pn.conteudo.appendChild(el('div.ckit-botoes', depois));
      pn.tela._aoEsc = function () { if (!feito) sair(false); };
      Reino.Som.falar([FALAS.escolha], { voz: 'claude' });

      function escolher(id, b) {
        if (feito) return;
        if (!C.escolherKit(id)) { Reino.Som.tocar('erro'); return; }
        feito = true;
        b.classList.add('escolhido');
        UI.festa(2, { item: b });
        Reino.Som.calar();
        Reino.Som.falar([FALAS.ganhou], { voz: 'claude' });
        if (U.animar()) setTimeout(function () { sair(true); }, Reino.config.movimento.lento * 2);
        else sair(true);
      }
      function sair(ok) {
        feito = true;
        if (!ok) Reino.Som.tocar('toque');
        UI.fecharTela(pn.tela);
        resolver(ok);
      }
    });
  };

  /** Abre a escolha uma vez por kit pendente; "Depois" para a fila. @returns {Promise<void>} */
  UI.casaKitsPendentes = function () {
    var C = Reino.Casa;
    if (!C || C.kitsPendentes() <= 0) return Promise.resolve();
    return UI.escolherKitCasa().then(function (ok) { return ok ? UI.casaKitsPendentes() : undefined; });
  };

})();
