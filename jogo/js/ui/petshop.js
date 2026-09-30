/* Pet Shop (tela da Dona Aveia): comprar comida, dar da despensa e UI.visitaPetShop. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var UI = Reino.UI, R = Reino._ui;
  var painel = R.painel, uniChocado = R.uniChocado, barrasCuidado = R.barrasCuidado, balaoNaTela = R.balaoNaTela;
  var falarCuidado = R.falarCuidado, darComida = R.darComida, textoEnche = R.textoEnche, nomeComida = R.nomeComida;

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
      // o desenho da comida (48 px) em cima e o preço com a ⭐ em pixel, numa linha só dele (como na Loja)
      var d = PA.iconeDesenho(co.icone);
      var desenho = [d ? PA.paraDOM(d, PA.escalaNitida(48, 16), 'icone-acessorio') : co.icone, el('br')];
      var preco = '⭐\u00a0' + co.preco + (co.preco === 1 ? '\u00a0estrela' : '\u00a0estrelas');
      var pergunta = [desenho, 'Trocar por ' + co.nome + '?', el('br'), preco];
      var msg = guardada
        ? [desenho, co.nome + ': tem ' + guardada + '\u00a0na despensa!', podeComprar ? el('span.confirmar-nota', 'Ou trocar ' + co.preco + (co.preco === 1 ? ' estrela' : ' estrelas') + ' por mais uma.') : null]
        : cheio ? [pergunta, el('span.confirmar-nota', P.nomeUni(id) + ' está de barriga cheia. A comidinha fica guardada para depois! 💛')] : pergunta;
      // o que gasta estrela mostra o preço embaixo, em pixel
      function comPreco(rotulo) { return [rotulo, el('br'), '⭐\u00a0' + co.preco]; }
      // com comida guardada: "Dar uma", "Agora não" e "Comprar e guardar" (sem "Comprar e dar":
      // 4 botões não cabiam em tela pequena). "Dar uma" gasta comida guardada: nasce apagado e
      // longe do dedo, como os botões que gastam estrela
      var opcoes = guardada ? [
        { rotulo: 'Dar uma da despensa 🧺', valor: 'despensa', principal: true, gasta: true },
        { rotulo: 'Agora não', valor: null, seguro: true },
        podeComprar ? { rotulo: comPreco('Comprar e guardar 🧺'), valor: 'guardar', gasta: true } : null,
      ] : [
        cheio ? null : { rotulo: comPreco('Comprar e dar agora ' + co.icone), valor: 'dar', principal: true, gasta: true },
        { rotulo: comPreco('Comprar e guardar 🧺'), valor: 'guardar', principal: cheio, gasta: true },
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
})();
