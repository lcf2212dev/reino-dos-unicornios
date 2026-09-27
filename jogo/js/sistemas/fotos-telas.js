/* Fotos (parte 3 de 3): pode tirar?, tirar (flash e a prévia "Que foto linda!"), o álbum, a foto grande,
   salvar no aparelho (download) e o depurar dos testes. Nada roda no carregamento. Ver o cabeçalho de fotos.js. */
(function () {
  var Reino = window.Reino = window.Reino || {};
  var I = Reino._fotos, F = I.F;
  var FRASES = I.FRASES, cfg = I.cfg, U = I.U, falarVoz = I.falarVoz, som = I.som, semAnimacao = I.semAnimacao;
  var banco = I.banco, abrirBanco = I.abrirBanco, listar = I.listar, guardarNoBanco = I.guardarNoBanco, apagarDoBanco = I.apagarDoBanco;
  var lugarAgora = I.lugarAgora, nomeArquivo = I.nomeArquivo, capturar = I.capturar;
  var montarFoto = I.montarFoto, fontePronta = I.fontePronta, paraBlob = I.paraBlob, miniatura = I.miniatura;

  /* ---------- pode tirar? ---------- */
  var ocupado = false;   // tirando (entre o toque e a prévia): não tira outra por cima
  function jogoComecou() {
    var hud = document.getElementById('hud');
    return !!(hud && !hud.hidden && document.getElementById('reino'));
  }
  F.podeTirar = function () {
    try {
      if (ocupado || typeof document === 'undefined' || !Reino.Cena || !Reino.UI) return false;
      return jogoComecou() && ['mapa', 'interior'].indexOf(Reino.Cena.estado()) >= 0 && !Reino.UI.temTela();
    } catch (e) { return false; }
  };
  /* ---------- flash ----------
     Um clarão branco que some depressa. Com Animações desligado (ou "reduzir movimento"), só um
     esmaecer suave e fraquinho. É transição (não animação), para o body.sem-animacao não cortar. */
  function flash() {
    var d = document.createElement('div');
    d.className = 'fotos-flash' + (semAnimacao() ? ' suave' : '');
    d.setAttribute('aria-hidden', 'true');
    document.body.appendChild(d);
    void d.offsetWidth;
    d.classList.add('sumindo');
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 900);
  }

  /* ---------- salvar no aparelho (download) ---------- */
  function baixar(blob, nome) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = nome; a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 4000);
  }

  /* ---------- compartilhar (Web Share API com arquivo; livre, sem PIN) ----------
     Só onde o navegador compartilha arquivo (celular, tablet); nos outros o botão nem aparece e
     fica o "Salvar no aparelho". */
  function arquivoDe(f) {
    try { return new File([f.png], nomeArquivo(f), { type: 'image/png' }); } catch (e) { return null; }
  }
  // no artifact do claude.ai a plataforma recusa o share e bloqueia o download: lá só o menu da própria imagem
  var amb = Reino.ambiente;
  function podeCompartilhar(f) {
    var arq = amb.artifact() ? null : arquivoDe(f);
    return !!arq && amb.podeCompartilhar([arq]);
  }
  // 'ok' | 'cancelou' (AbortError: nada a dizer) | 'erro'; sem canShare aqui, nem chama
  function compartilhar(f) {
    var arq = arquivoDe(f);
    if (!arq || !podeCompartilhar(f)) return Promise.resolve('erro');
    var p;
    try { p = navigator.share({ files: [arq], title: 'Foto do Reino dos Unicórnios' }); } catch (e) { return Promise.resolve('erro'); }
    return Promise.resolve(p).then(function () { return 'ok'; }, function (e) {
      return e && e.name === 'AbortError' ? 'cancelou' : 'erro';
    });
  }

  // sem o Compartilhar: segurar a foto (toque) ou o botão direito (mouse) abre o menu do navegador
  function dica() {
    var toque = amb.toque();
    return U().el('p.fotos-legenda.fotos-dica', toque ? 'Segure a foto para compartilhar ou salvar.' : 'Clique com o botão direito na foto para salvar.');
  }

  function botao(rotulo, principal, classe) {
    return U().el('button.btn-grande' + (principal ? '.btn-principal' : '.btn-secundario') + (classe ? '.' + classe : ''), { type: 'button' }, rotulo);
  }

  var ultima = null;   // a última foto tirada nesta visita (para depurar)

  /* ---------- tirar ---------- */
  F.tirar = function () {
    if (!F.podeTirar()) return Promise.resolve(null);
    var cap = capturar();
    if (!cap) return Promise.resolve(null);
    ocupado = true;
    var lugar = lugarAgora(), quando = new Date();
    som('clique');
    flash();
    abrirBanco();
    var espera = new Promise(function (r) { setTimeout(r, semAnimacao() ? 120 : 260); });
    var foto = null;
    return fontePronta().then(function () {
      var f = montarFoto(cap, lugar, quando);
      return Promise.all([paraBlob(f.canvas), miniatura(f.canvas), espera]).then(function (r) {
        foto = { criada: quando.getTime(), lugar: f.lugar, data: f.data, arquivo: f.arquivo, w: f.w, h: f.h, png: r[0], mini: r[1] };
        ultima = { lugar: foto.lugar, data: foto.data, w: foto.w, h: foto.h };
        return abrirBanco();
      });
    }).then(function () {
      ocupado = false;
      if (!foto || !foto.png) return null;
      return previa(foto);
    }, function (e) {
      ocupado = false;
      if (window.console) console.error('Fotos: não deu para montar a foto', e);
      return null;
    });
  };

  // "Que foto linda!": Guardar no álbum (principal), Salvar no aparelho e Apagar
  function previa(foto) {
    var UI = Reino.UI, el = U().el;
    return new Promise(function (resolver) {
      var guardou = false, salvou = false, acabou = false;
      var url = URL.createObjectURL(foto.png);
      function fim() {
        if (acabou) return;
        acabou = true;
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        resolver(guardou || salvou ? { lugar: foto.lugar, data: foto.data, w: foto.w, h: foto.h, guardada: guardou, salva: salvou } : null);
      }
      var pn = UI.painel('fotos-previa', 'Que foto linda! 📸', { aoFechar: fim });
      var img = el('img.fotos-img', { src: url, alt: 'Foto: ' + foto.lugar + ', ' + foto.data, width: foto.w, height: foto.h, draggable: 'false' });
      var msg = el('p.fotos-msg', { role: 'status' });
      var guardar = botao('🖼 Guardar no álbum', true, 'fotos-guardar');
      var album = botao('🖼 Abrir o álbum', true, 'fotos-abrir-album');
      var salvar = botao('💾 Salvar no aparelho', false, 'fotos-salvar');
      var apagar = botao('🗑 Apagar', false, 'fotos-apagar');
      album.hidden = true;
      var corpo = el('div.fotos-previa-corpo', el('div.fotos-moldura-img', img), dica(), msg, el('div.intro-botoes.fotos-botoes', guardar, album, salvar, apagar));
      pn.conteudo.appendChild(corpo);
      function avisar(texto) { U().preencher(msg, texto); msg.hidden = !texto; corpo.classList.toggle('com-msg', !!texto); if (texto) falarVoz(texto); }
      function focarBotao(b) { if (UI.porTeclado && UI.porTeclado()) setTimeout(function () { try { b.focus({ preventScroll: true }); } catch (e) {} }, 30); }
      // estado do banco: sem álbum aqui, só salvar no aparelho; álbum lotado, avisa e oferece abrir
      function conferir() {
        var cheio = banco.estado === 'ok' && banco.quantidade >= cfg().maxAlbum;
        // sem álbum neste aparelho, o "Salvar no aparelho" vira o botão principal
        salvar.classList.toggle('btn-principal', banco.estado !== 'ok');
        salvar.classList.toggle('btn-secundario', banco.estado === 'ok');
        salvar.hidden = !amb.podeBaixar();
        if (banco.estado !== 'ok') { guardar.hidden = true; album.hidden = true; avisar(FRASES.semBanco); return; }
        guardar.hidden = cheio; album.hidden = !cheio;
        if (cheio) avisar(FRASES.cheio); else { msg.hidden = true; corpo.classList.remove('com-msg'); falarVoz(FRASES.previa); }
      }
      msg.hidden = true;
      conferir();
      guardar.addEventListener('click', function () {
        if (guardar.disabled) return;
        som('toque');
        guardar.disabled = true;
        guardarNoBanco(foto).then(function (r) {
          guardar.disabled = false;
          if (r === 'ok') {
            guardou = true;
            UI.fecharTela(pn.tela);
            fim();
            if (Reino.Claude && Reino.Claude.falar) Reino.Claude.falar(FRASES.guardada, { voz: 'claude', tempo: 4000 });
            return;
          }
          if (r === 'cheio') { conferir(); focarBotao(album); return; }
          banco.estado = 'erro';
          conferir(); focarBotao(salvar);
        });
      });
      album.addEventListener('click', function () {
        som('toque');
        // apagou alguma lá dentro? de volta aqui, o "Guardar no álbum" reaparece
        F.abrirAlbum().then(function () { if (!acabou) { conferir(); if (!guardar.hidden) focarBotao(guardar); } });
      });
      salvar.addEventListener('click', function () {
        som('toque');
        baixar(foto.png, nomeArquivo(foto));
        salvou = true;
        avisar(FRASES.salva);
      });
      apagar.addEventListener('click', function () {
        som('toque');
        Reino.Som && Reino.Som.calar && Reino.Som.calar();
        UI.fecharTela(pn.tela);
        fim();
      });
    });
  }

  /* ---------- álbum ---------- */
  // o álbum que ainda espera o banco abrir (sem painel, o UI.temTela() do botão não barra): o 2º toque
  // nessa hora (tablet lento, 1ª vez na sessão) recebe o mesmo, em vez de abrir outro por cima
  var albumAbrindo = null;
  F.abrirAlbum = function () {
    var UI = Reino.UI, el = U().el;
    if (!UI || typeof document === 'undefined') return Promise.resolve();
    if (albumAbrindo) return albumAbrindo;
    return (albumAbrindo = abrirBanco().then(function () {
      albumAbrindo = null;
      return new Promise(function (resolver) {
        var urls = [];
        function soltar() { urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = []; }
        var pn = UI.painel('fotos-album', 'Álbum de fotos 🖼', { aoFechar: function () { soltar(); resolver(); } });
        var falouVazio = false;
        function montar(focarIndice) {
          soltar();
          pn.conteudo.innerHTML = '';
          if (banco.estado !== 'ok') {
            pn.conteudo.appendChild(el('p.fotos-msg.fotos-aviso', FRASES.semBanco));
            pn.conteudo.appendChild(el('p.fotos-nota', 'As fotos podem ir para o aparelho pelo "Salvar no aparelho", logo depois de tirar. 💾'));
            falarVoz(FRASES.semBanco);
            return;
          }
          listar().then(function (lista) {
            if (!pn.tela.isConnected) return;
            var max = cfg().maxAlbum;
            pn.conteudo.appendChild(el('p.fotos-conta', lista.length + ' de ' + max + (max === 1 ? ' foto' : ' fotos')));
            if (!lista.length) {
              pn.conteudo.appendChild(el('p.fotos-msg', FRASES.vazio + ' 📸'));
              if (!falouVazio) { falouVazio = true; falarVoz(FRASES.vazio); }
              return;
            }
            if (lista.length >= max) pn.conteudo.appendChild(el('p.fotos-msg.fotos-aviso', FRASES.cheio));
            var grade = el('div.fotos-grade');
            var bts = lista.map(function (f, i) {
              var u = URL.createObjectURL(f.mini || f.png);
              urls.push(u);
              var b = el('button.fotos-mini', { type: 'button', 'aria-label': 'Ver a foto: ' + f.lugar + ', ' + f.data },
                el('img', { src: u, alt: '', draggable: 'false' }),
                el('span.fotos-mini-data', f.data));
              b.addEventListener('click', function () { som('toque'); verGrande(lista, i, function (apagou) { if (apagou) montar(i); }); });
              grade.appendChild(b);
              return b;
            });
            pn.conteudo.appendChild(grade);
            if (focarIndice != null && UI.porTeclado && UI.porTeclado()) {
              var alvo = bts[Math.min(focarIndice, bts.length - 1)];
              setTimeout(function () { UI.focarTeclado ? UI.focarTeclado(alvo) : alvo.focus(); }, 30);
            }
          }, function () {
            banco.estado = 'erro';
            montar();
          });
        }
        montar();
      });
    }));
  };

  // a foto grande, com ◀ ▶ (e as setas do teclado), Compartilhar (onde der), Salvar no aparelho e Apagar (com confirmação)
  function verGrande(lista, i, aoFechar) {
    var UI = Reino.UI, el = U().el;
    var apagou = false, url = null;
    var pn = UI.painel('fotos-ver', 'Foto do álbum 🖼', { aoFechar: function () { if (url) URL.revokeObjectURL(url); aoFechar(apagou); } });
    var img = el('img.fotos-img', { alt: '', draggable: 'false' });
    var legenda = el('p.fotos-legenda');
    var ant = el('button.btn-icone.fotos-nav', { type: 'button', 'aria-label': 'Foto anterior' }, '◀');
    var prox = el('button.btn-icone.fotos-nav', { type: 'button', 'aria-label': 'Próxima foto' }, '▶');
    var comp = botao('💌 Compartilhar', true, 'fotos-compartilhar');
    var salvar = botao('💾 Salvar no aparelho', true, 'fotos-salvar');
    var apagar = botao('🗑 Apagar', false, 'fotos-apagar');
    var msg = el('p.fotos-msg', { role: 'status', hidden: true });
    // com o Compartilhar, ele é o principal e o Salvar fica secundário
    comp.hidden = !podeCompartilhar(lista[i]);
    salvar.classList.toggle('btn-principal', comp.hidden);
    salvar.classList.toggle('btn-secundario', !comp.hidden);
    salvar.hidden = !amb.podeBaixar();
    pn.conteudo.appendChild(el('div.fotos-ver-corpo' + (comp.hidden ? '' : '.com-compartilhar'),
      el('div.fotos-ver-linha', ant, el('div.fotos-moldura-img', img), prox),
      legenda, comp.hidden ? dica() : null, msg, el('div.intro-botoes.fotos-botoes', comp, salvar, apagar)));
    function mostrar() {
      var f = lista[i];
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(f.png);
      img.src = url; img.alt = 'Foto: ' + f.lugar + ', ' + f.data;
      img.width = f.w; img.height = f.h;
      U().preencher(legenda, f.lugar + ' · ' + f.data);
      msg.hidden = true;
      var varias = lista.length > 1;
      ant.hidden = prox.hidden = !varias;
    }
    function andar(d) { i = (i + d + lista.length) % lista.length; mostrar(); }
    ant.addEventListener('click', function () { som('toque'); andar(-1); });
    prox.addEventListener('click', function () { som('toque'); andar(1); });
    // (com a confirmação aberta por cima, o foco está nela e as setas não chegam aqui)
    pn.tela.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' && lista.length > 1) { e.preventDefault(); andar(-1); }
      if (e.key === 'ArrowRight' && lista.length > 1) { e.preventDefault(); andar(1); }
    });
    function salvarAqui() {
      var f = lista[i];
      baixar(f.png, nomeArquivo(f));
      U().preencher(msg, FRASES.salva); msg.hidden = false;
      falarVoz(FRASES.salva);
    }
    salvar.addEventListener('click', function () { som('toque'); salvarAqui(); });
    // cancelou: nada; deu erro de verdade: salva no aparelho (a foto não se perde)
    comp.addEventListener('click', function () {
      if (comp.disabled) return;
      som('toque');
      comp.disabled = true;
      compartilhar(lista[i]).then(function (r) {
        comp.disabled = false;
        if (r === 'erro') salvarAqui();
      });
    });
    apagar.addEventListener('click', function () {
      som('toque');
      UI.escolher('Apagar esta foto do álbum? Ela não volta mais.', [
        { rotulo: 'Não, deixar', valor: false, seguro: true },
        { rotulo: '🗑 Sim, apagar', valor: true, principal: true },
      ], 'fotos-confirmar').then(function (sim) {
        if (!sim) return;
        apagarDoBanco(lista[i].id).then(function () {
          apagou = true;
          UI.fecharTela(pn.tela);
          if (url) { URL.revokeObjectURL(url); url = null; }
          aoFechar(true);
        }, function () {
          U().preencher(msg, 'Não deu para apagar agora. Tente de novo.'); msg.hidden = false;
        });
      });
    });
    mostrar();
  }

  /* ---------- testes (?debug=1 → __reino.fotos()) ---------- */
  F.depurar = function () {
    if (!banco.abrindo && typeof document !== 'undefined') abrirBanco();
    return {
      podeTirar: F.podeTirar(),
      banco: banco.estado || 'ok',   // abrindo ainda: 'ok' até dizer o contrário
      quantidade: banco.quantidade,
      ultima: ultima ? { lugar: ultima.lugar, data: ultima.data, w: ultima.w, h: ultima.h } : null,
    };
  };
})();
