/* Álbum de ETs (Reino.UI.telaAlbumETs), aberto pelo botão do painel do foguete (ui/foguete.js): um cartão por ET
   (Reino.Viagem.ets()) com o sprite nítido, nome e planeta; amigo em cores, ainda não = silhueta com "?".
   No cartão de um amigo: "Levar comigo" / "Deixar em casa" (Reino.Viagem.escolherCompanheiro, §6.3; sem ela, sem
   botão). Contrato: docs/contratos/viagem.md §6.2. Estilos: css/ui-album-ets.css. */
(function () {
  var U = Reino.util, el = U.el;
  var UI = Reino.UI;

  Reino.registrarIcones({
    '👽': { n: 'et', p: { k: '#2a3a2a', g: '#8fe07a', G: '#4fa84a', e: '#1a1a2a', w: '#ffffff' }, d: [
      '................',
      '.....kkkkkk.....',
      '...kkggggggkk...',
      '..kggggggggggk..',
      '.kggggggggggggk.',
      '.kgggggggggggGk.',
      'kgeeeggggggeeegk',
      'kgeweeggggeweegk',
      'kgeeeeggggeeeegk',
      '.kgeeeggggeeegk.',
      '.kGgggggggggGGk.',
      '..kGggggggggGk..',
      '...kGggkkggGk...',
      '....kGggggGk....',
      '.....kkGGkk.....',
      '.......kk.......',
    ] },
  });

  function compacto() { return window.innerWidth <= 480 || window.innerHeight <= 500; }
  // o ET de corpo inteiro, nítido (escala inteira); ainda não amigo = silhueta escura
  function figura(e) {
    var PA = window.PA, N = Reino.NPCs, pe = Reino.personagens[e.id];
    try {
      var c = N.sprite({ id: e.id, sprite: pe.sprite }, 0);
      var alvo = compacto() ? 64 : 88;
      var cv = PA.paraDOM(c, PA.escalaNitida(alvo, c.width), 'album-sprite');
      return cv;
    } catch (err) { return null; }
  }

  function telaAlbumETs() {
    var V = Reino.Viagem;
    if (!V || !V.ets || UI.temTela()) return;
    var pn = UI.painel('album-ets', '👽 Álbum de ETs');
    pn.tela.setAttribute('aria-label', 'Álbum de ETs');
    pn.conteudo.classList.add('album-conteudo');
    var contador = el('p.album-contador', { 'aria-live': 'polite' });
    var grade = el('ul.album-grade');
    pn.conteudo.appendChild(contador);
    pn.conteudo.appendChild(grade);

    function nomePlaneta(id) { var p = V.planeta(id); return p ? p.nome : id; }
    function podeLevar() { return typeof V.escolherCompanheiro === 'function'; }
    function atual() { try { return typeof V.companheiro === 'function' ? V.companheiro() : null; } catch (e) { return null; } }

    function montar(foco) {
      var ets = V.ets(), n = ets.filter(function (e) { return e.amigo; }).length, junto = atual();
      contador.textContent = n + ' de ' + ets.length + ' amigos';
      grade.textContent = '';
      ets.forEach(function (e) {
        var planeta = nomePlaneta(e.planeta), nome = U.semEn ? U.semEn(e.nome) : e.nome;
        var fig = el('div.album-figura', figura(e), e.amigo ? '' : el('span.album-interroga', { 'aria-hidden': 'true' }, '?'));
        var li = el('li.album-cartao' + (e.amigo ? '.amigo' : '.silhueta') + (junto === e.id ? '.junto' : ''), fig);
        // o cartão recebe foco (Tab) e rola para a vista
        li.tabIndex = 0;
        li.setAttribute('aria-label', e.amigo ? nome + ', ' + planeta + ', amigo' : 'ET de ' + planeta + ', ainda não é amigo. Visite ' + planeta);
        li.addEventListener('focus', function () { try { li.scrollIntoView({ block: 'nearest' }); } catch (err) { /* navegador antigo */ } });
        if (!e.amigo) {
          li.appendChild(el('b', '?'));
          li.appendChild(el('small', 'Visite ' + planeta));
          grade.appendChild(li);
          return;
        }
        li.appendChild(el('b', e.nome));
        li.appendChild(el('small', planeta));
        if (junto === e.id) li.appendChild(el('span.album-selo', 'Está com você'));
        if (podeLevar()) {
          var leva = junto !== e.id;
          var b = el('button.btn-grande' + (leva ? '.btn-principal' : '') + '.album-levar', { type: 'button', 'data-et': e.id },
            leva ? 'Levar comigo' : 'Deixar em casa');
          b.setAttribute('aria-label', (leva ? 'Levar ' : 'Deixar em casa ') + nome + (leva ? ' comigo' : ''));
          b.addEventListener('click', function () {
            Reino.Som.tocar('toque');
            try { V.escolherCompanheiro(leva ? e.id : null); } catch (err) { /* sem save (teste) */ }
            montar(e.id);
          });
          li.appendChild(b);
        }
        grade.appendChild(li);
      });
      if (foco) {
        var bf = grade.querySelector('.album-levar[data-et="' + foco + '"]');
        if (bf) { bf.focus({ preventScroll: true }); bf.scrollIntoView({ block: 'nearest' }); }
      }
    }
    montar(null);
    Reino.Som.tocar('porta');
    setTimeout(function () {
      var b = grade.querySelector('.album-levar') || pn.card.querySelector('.btn-fechar');
      if (b && pn.tela.isConnected) b.focus({ preventScroll: true });
    }, 80);
    return pn;
  }

  UI.telaAlbumETs = telaAlbumETs;
})();
