/* Botões das fotos no HUD (Reino.Fotos, js/sistemas/fotos.js): 📷 e o álbum, por UI.registrarBotaoHud.
   Repintados nos eventos de cena/telas/ocupada/transição e de 500 em 500 ms (ui/hud.js). */
(function () {
  var U = Reino.util, el = U.el;
  var UI = Reino.UI;

  /* ---------- botão das fotos (Reino.Fotos, js/sistemas/fotos.js) ---------- */
  // toque → tira a foto; toque longo (config.fotos.toqueLongoMs) → abre o álbum, sem tirar a foto.
  // Apagado (aria-disabled) quando Fotos.podeTirar() diz não: transição, tela aberta, balão, banho.
  function fotos() { var F = Reino.Fotos; return F && typeof F.tirar === 'function' ? F : null; }
  function podeFotografar() {
    var F = fotos();
    try { return !!(F && (typeof F.podeTirar !== 'function' || F.podeTirar())); } catch (e) { return false; }
  }
  function pintarBotaoFoto() {
    var pode = podeFotografar();
    ['#hud .btn-foto', '#hud .btn-album'].forEach(function (sel) {
      var b = U.$(sel);
      if (!b) return;
      b.hidden = !fotos();
      if (b.classList.contains('desligado') === !pode) return;
      b.classList.toggle('desligado', !pode);
      b.setAttribute('aria-disabled', String(!pode));
    });
  }
  UI.pintarBotaoFoto = pintarBotaoFoto;
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
    // Enter/Espaço no botão são dele: não chegam ao motor/entrada.js (que agiria no que estiver perto dela)
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
  // o álbum à vista (um toque): o mesmo apagado do 📷; segurar o 📷 continua abrindo também
  function botaoAlbum() {
    var b = el('button.btn-tela-cheia.btn-album', { type: 'button', 'aria-label': 'Álbum de fotos', 'aria-disabled': 'false', title: 'Álbum de fotos' });
    b.appendChild(PA.paraDOM(PA.iconeMenu('album'), 2, 'hud-icone'));
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
    b.addEventListener('click', function () {
      var F = fotos();
      pintarBotaoFoto();
      if (!F || UI.temTela() || !podeFotografar() || typeof F.abrirAlbum !== 'function') return;
      Reino.Som.tocar('toque');
      F.abrirAlbum();
    });
    return b;
  }

  UI.registrarBotaoHud({ id: 'foto', ordem: 10, criar: botaoFoto, pintar: pintarBotaoFoto });
  UI.registrarBotaoHud({ id: 'album', ordem: 20, criar: botaoAlbum });
})();
