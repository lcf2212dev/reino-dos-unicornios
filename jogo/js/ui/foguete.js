/* Painel do foguete (Reino.UI.telaFoguete), aberto pelo foguete do Hangar (ação `viagem`, sistemas/viagem.js):
   o tanque em gotinhas, os destinos (Reino.Viagem.planetas()) com "Decolar!" quando cheio, e o passaporte (um
   carimbo por planeta, selo com o planeta dentro; sem carimbo, o planeta em silhueta e "?"). O desenho dos planetas
   é o do Planetário (Reino.IconesPlanetas, arte/icones/planetas.js). Não cheio: o Claude diz quantas certas faltam.
   Destino com `depois` ainda sem aquele carimbo: cadeado; tocar nele faz o Claude dizer qual visitar antes.
   Contrato: docs/contratos/viagem.md §2. Estilos: css/ui-foguete.css. */
(function () {
  var U = Reino.util, el = U.el;
  var UI = Reino.UI;

  // o Claude nítido (escala inteira), como na pergunta surpresa
  function claude() {
    var PA = window.PA;
    try {
      var spr = PA.claude(0), src = spr.canvas || spr;
      return PA.paraDOM(spr, PA.escalaNitida(2 * src.width, src.width), 'foguete-claude');
    } catch (e) { return null; }
  }
  // o planeta (o mesmo desenho do Planetário, 16×16: arte/icones/planetas.js); sem ele, a bolinha na cor do planeta
  var IP = function () { return Reino.IconesPlanetas; };
  function bola(p, carimbado) {
    if (IP()) {
      try { var c = IP().iconeDOM(p, 'foguete-planeta'); c.setAttribute('aria-hidden', 'true'); return c; } catch (e) { if (window.console) console.error(e); }
    }
    var b = el('span.foguete-bola' + (carimbado ? '' : '.foguete-silhueta'), { 'aria-hidden': 'true' }, carimbado ? '' : '?');
    if (carimbado) b.style.background = p.cor || '#d8d8e8';
    return b;
  }
  // o carimbo do passaporte: selo de borda picotada com o planeta dentro (sem carimbo: o planeta em silhueta)
  function carimbo(p, ok) {
    if (IP()) {
      try { var c = IP().carimboDOM(p, ok, 'foguete-carimbo'); c.setAttribute('aria-hidden', 'true'); return c; } catch (e) { if (window.console) console.error(e); }
    }
    return bola(p, ok);
  }

  function telaFoguete() {
    var V = Reino.Viagem;
    if (!V || UI.temTela()) return;
    var t = V.tanque(), cheio = V.cheio(), carimbos = V.carimbos(), F = V.frases;
    var pn = UI.painel('foguete', '🚀 Foguete');
    pn.tela.setAttribute('aria-label', 'Foguete');

    // o tanque: uma gotinha por resposta certa
    var gotas = [];
    for (var i = 0; i < t.max; i++) gotas.push(el('span.foguete-gota' + (i < t.n ? '.cheia' : ''), { 'aria-hidden': 'true' }, '💧'));
    var tanque = el('section.foguete-tanque', { 'aria-label': 'Tanque: ' + t.n + ' de ' + t.max },
      el('h3.foguete-sub', 'Tanque ' + t.n + '/' + t.max),
      el('div.foguete-gotas', gotas));

    // o Claude: cheio, "escolha"; não cheio, quantas faltam e onde conseguir
    var fala = cheio ? F.cheio : F.faltam(t.max - t.n);
    var texto = el('div.foguete-balao', fala.map(function (x) { return el('p', x); }));
    var balao = el('div.foguete-cabeca', claude(), texto);
    function dizer(pags) {
      texto.textContent = '';
      pags.forEach(function (x) { texto.appendChild(el('p', x)); });
      Reino.Som.falar(pags, { voz: 'claude' });
    }

    // os destinos
    var destinos = el('section.foguete-destinos', el('h3.foguete-sub', 'Destinos'),
      el('ul', V.planetas().map(function (p) {
        var para = (p.artigo === 'em' ? '' : 'a ') + p.nome;
        if (!V.aberto(p.id)) {
          var antes = V.planeta(p.depois) || { nome: p.depois }, frase = F.antes(antes.nome, antes.artigo);
          var tranca = el('button.btn-grande.foguete-cadeado', { type: 'button' }, '🔒');
          tranca.setAttribute('aria-label', p.nome + ' trancado. ' + frase);
          tranca.addEventListener('click', function () { Reino.Som.tocar('toque'); dizer([frase]); });
          return el('li.foguete-destino.foguete-trancado', bola(p, true), el('b', p.nome), tranca);
        }
        var btn = el('button.btn-grande.btn-principal.foguete-decolar', { type: 'button', disabled: !cheio }, 'Decolar! 🚀');
        btn.setAttribute('aria-label', 'Decolar para ' + para);
        btn.addEventListener('click', function () {
          if (!V.cheio() || !V.aberto(p.id)) return;
          Reino.Som.tocar('toque'); Reino.Som.calar();
          UI.fecharTela(pn.tela);
          V.decolar(p.id);
        });
        return el('li.foguete-destino', bola(p, true), el('b', p.nome), btn);
      })));

    // o passaporte
    var passaporte = el('section.foguete-passaporte', el('h3.foguete-sub', '🛂 Passaporte'),
      el('ul', V.planetas().map(function (p) {
        var ok = !!carimbos[p.id];
        return el('li' + (ok ? '.carimbado' : ''), carimbo(p, ok), el('small', ok ? p.nome : '?'));
      })));
    // o álbum de ETs (ui/album-ets.js): fecha o painel e abre o álbum
    if (UI.telaAlbumETs) {
      var album = el('button.btn-grande.foguete-album', { type: 'button' }, '👽 Álbum de ETs');
      album.addEventListener('click', function () {
        Reino.Som.tocar('toque'); Reino.Som.calar();
        UI.fecharTela(pn.tela);
        UI.telaAlbumETs();
      });
      passaporte.appendChild(album);
    }

    pn.conteudo.classList.add('foguete-conteudo');
    [balao, tanque, destinos, passaporte].forEach(function (x) { pn.conteudo.appendChild(x); });
    Reino.Som.tocar('porta');
    Reino.Som.falar(fala, { voz: 'claude' });
    setTimeout(function () {
      var b = pn.tela.querySelector('.foguete-decolar:not([disabled])') || pn.card.querySelector('.btn-fechar');
      if (b && pn.tela.isConnected) b.focus({ preventScroll: true });
    }, 80);
    return pn;
  }

  UI.telaFoguete = telaFoguete;
})();
