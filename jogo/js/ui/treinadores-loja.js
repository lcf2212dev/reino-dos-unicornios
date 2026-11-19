/* Treinadores de Monstros: a loja das MonsterBalls da Treinadora Kiara (docs/contratos/monstros.md).
   UI.telaTreinadores() → Promise (resolve ao fechar). As regras são do Reino.Treinadores (sistemas/treinadores.js).
   Topo: o saldo de estrelas. No meio, um cartão por bola de Reino.Treinadores.ofertas() (Mini: "Chance de pegar: 20%";
   MonsterBall: "Chance de pegar: 40%"; Super MonsterBall: "Pega sempre: 100%"), com o ícone, o preço, quantas ela já tem e − e + (de 0 até
   config.monstros.maxCarrinho; começa em 1 a MonsterBall). Com desconto (salas de Matemática feitas,
   Treinadores.desconto), o cartão mostra o preço cheio riscado ao lado; embaixo, o desconto de agora e o próximo. Rodapé: o total somado e "Comprar (N ⭐)", que pergunta
   antes (UI.confirmar com gasta) e compra tudo ou nada; sem saldo, "Faltam N estrelas!" e o botão apagado. Com a tela
   dos monstros (UI.telaMonstros, da outra frente), o botão "Meus monstros" abre por cima. Só texto na tela (sem voz
   nova). Estilos: os da loja da Vila (css/ui-vila.css) mais css/ui-treinadores.css.
   Em cada cartão, "ou" e "Escrever N frases" (Treinadores.frases: Mini 1, MonsterBall 2, Super 3;
   docs/contratos/cursiva.md §5): sorteia as frases (Cursiva.sortearFrases), abre UI.telaCursiva e, com todas prontas,
   dá 1 bola daquele cartão (Treinadores.ganharEscrevendo), sem estrela. Fechou no meio: as mesmas frases e o ponto
   onde parou ficam guardados, por bola (até recarregar o jogo), e o botão dela vira "Continuar a escrever". O botão
   de escrever não se desliga com a tela de escrever aberta (quem impede abrir duas é `ocupado`): o Esc devolve o
   foco do teclado a ele. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;

  function T() { return Reino.Treinadores; }
  function P() { return Reino.Progresso; }
  function estrelas(n) { return n + (n === 1 ? ' estrela' : ' estrelas'); }
  function icone(chave, px) {
    var c = PA.iconeEmoji(chave, 2), lado = c.width * PA.escalaNitida(px, c.width);
    c.classList.add('pixel');
    c.style.width = lado + 'px';
    c.style.height = (c.height * lado / c.width) + 'px';
    c.setAttribute('aria-hidden', 'true');
    return c;
  }
  function textoChance(c) { return c >= 1 ? 'Pega sempre: 100%' : 'Chance de pegar: ' + Math.round(c * 100) + '%'; }
  function textoFrases(n) { return n === 1 ? '1 frase' : n + ' frases'; }

  var aberta = null;
  var escritas = {};    // { <id da bola>: { frases, estado } } das frases começadas e não terminadas (só na memória)
  // a tela saiu da pilha sem o ✕ (UI.fecharTodas, troca de cena): a promessa resolve do mesmo jeito
  U.on(Reino.EVENTOS.TELAS, function () { if (aberta && Reino._ui.pilha.indexOf(aberta.tela) < 0) aberta.fim(); });
  // a mochila mudou por fora (outra aba, nuvem, uma bola jogada): o "Você tem" se refaz
  U.on(Reino.EVENTOS.ITENS, function () { if (aberta && aberta.tela.isConnected && !aberta.gravando()) aberta.repintar(); });

  UI.telaTreinadores = function () {
    var Tr = T();
    if (!Tr || !Tr.ofertas().length) return Promise.resolve();
    return new Promise(function (resolver) {
      var J = window.Jogador;
      if (J && J.parar) J.parar();
      var ofs = Tr.ofertas(), qtd = {}, ocupado = false, gravando = false, acabou = false, cartoes = {};
      function zerar() { ofs.forEach(function (o) { qtd[o.id] = o.id === Tr.ID ? 1 : 0; }); }
      zerar();
      var pn = UI.painel('treinadores', 'Treinadores de Monstros', { icone: 'item:bola-monster', aoFechar: function () { fim(); } });
      pn.tela.classList.add('tela-vila-loja-treinadores');
      function fim() { if (acabou) return; acabou = true; if (aberta && aberta.tela === pn.tela) aberta = null; resolver(); }

      var saldo = el('p.vila-saldo', { 'aria-live': 'polite' });
      var msg = el('p.vila-recado', { 'aria-live': 'polite', hidden: true });
      var total = el('p.vila-total', { 'aria-live': 'polite' });
      var aviso = el('p.vila-aviso', { hidden: true });
      var botao = el('button.btn-grande.vila-botao-total', { type: 'button', 'data-foco': 'total' });
      var meus = null;
      if (UI.telaMonstros) {
        meus = el('button.btn-secundario.treinadores-meus', { type: 'button', 'data-foco': 'meus' }, 'Meus monstros');
        meus.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaMonstros(); });
      }
      var corpo = el('div.treinadores-corpo'), C = Reino.Cursiva;
      var daParaEscrever = !!(UI.telaCursiva && C && C.frases().length && Tr.ganharEscrevendo);
      ofs.forEach(function (o) {
        var menos = el('button.btn-icone.vila-menos', { type: 'button', 'aria-label': 'Uma a menos', 'data-foco': 'menos:' + o.id }, '-');
        var mais = el('button.btn-icone.vila-mais', { type: 'button', 'aria-label': 'Uma a mais', 'data-foco': 'mais:' + o.id }, '+');
        var n = el('b.treinadores-qtd', { 'aria-live': 'polite' }), temEl = el('span.treinadores-tem');
        menos.addEventListener('click', function () { por(o.id, -1); });
        mais.addEventListener('click', function () { por(o.id, 1); });
        var cartao = el('div.vila-cartao.treinadores-cartao' + (o.chance >= 1 ? '.treinadores-super' : o.id === Tr.ID_MINI ? '.treinadores-mini' : ''),
          { 'data-id': o.id },
          el('span.vila-cartao-desenho', icone(o.def.icone || 'item:' + o.id, 48)),
          el('b.vila-cartao-nome', U.colado(o.def.nome)),
          el('span.vila-cartao-atrib', el('span', textoChance(o.chance)), el('span', 'Jogue no monstro na luta!')),
          temEl,
          el('span.vila-cartao-preco', '⭐ ' + o.preco, o.preco < o.cheio ? el('s.treinadores-cheio', String(o.cheio)) : null),
          el('div.treinadores-escolha', menos, n, mais));
        // "ou" e o botão de escrever desta bola (só a que tem frases: Treinadores.frases)
        var escrever = daParaEscrever && o.frases
          ? el('button.btn-secundario.treinadores-escrever', { type: 'button', 'data-foco': 'escrever:' + o.id }) : null;
        if (escrever) {
          escrever.addEventListener('click', function () { escreverFrases(o); });
          cartao.appendChild(el('div.treinadores-ou', el('span.treinadores-ou-txt', 'ou'), escrever));
        }
        cartoes[o.id] = { menos: menos, mais: mais, n: n, tem: temEl, escrever: escrever };
        corpo.appendChild(cartao);
      });
      pn.conteudo.appendChild(el('div.vila-topo', saldo, meus));
      pn.conteudo.appendChild(msg);
      var dsc = Tr.desconto(), pct = function (d) { return Math.round(d * 100) + '%'; };
      var txt = (dsc.desconto ? 'Desconto de ' + pct(dsc.desconto) + ': você fez ' + dsc.feitas + ' salas de Matemática!' : '')
        + (dsc.proxima ? (dsc.desconto ? ' ' : '') + 'Com ' + dsc.proxima.salas + ' salas, ' + pct(dsc.proxima.desconto) + ' de desconto.' : '');
      if (txt) pn.conteudo.appendChild(el('p.treinadores-desconto', txt));
      pn.conteudo.appendChild(corpo);
      pn.card.appendChild(el('footer.vila-rodape', el('div.vila-rodape-texto', total, aviso), botao));
      botao.addEventListener('click', comprar);

      function recado(t) { U.preencher(msg, t); msg.hidden = !t; }
      function itens() { return ofs.filter(function (o) { return qtd[o.id] > 0; }).map(function (o) { return { id: o.id, qtd: qtd[o.id] }; }); }
      function quantas() { return ofs.reduce(function (s, o) { return s + qtd[o.id]; }, 0); }
      function por(id, d) {
        var n = qtd[id] + d;
        if (n < 0 || n > Tr.max()) { Reino.Som.tocar('toque'); return; }
        qtd[id] = n;
        Reino.Som.tocar(d > 0 ? 'selecionar' : 'toque');
        recado('');
        repintar();
      }
      function escreverFrases(o) {
        if (ocupado || gravando) return;
        Reino.Som.tocar('toque');
        if (!escritas[o.id]) escritas[o.id] = { frases: C.sortearFrases(o.frases), estado: {} };
        var esta = escritas[o.id], nome = o.def.nome;
        ocupado = true;
        repintar();
        UI.telaCursiva({ frases: esta.frases, estado: esta.estado, titulo: 'Letra cursiva', premio: 'Pegar a ' + nome }).then(function (ok) {
          ocupado = false;
          if (!ok) { repintar(); return; }
          gravando = true;
          var r;
          try { r = Tr.ganharEscrevendo(o.id); } finally { gravando = false; }
          if (r.ok && escritas[o.id] === esta) delete escritas[o.id];   // deu errado: as frases prontas continuam guardadas
          if (!pn.tela.isConnected) return;
          if (!r.ok) { Reino.Som.tocar('erro'); recado('Ops! Algo mudou. Tente de novo.'); repintar(); return; }
          Reino.Som.tocar('estrela');
          recado('Você ganhou 1 ' + nome + '! ✨ ' + (r.onde === 'bau' ? 'A mochila encheu: ela foi para o baú.' : 'Está na sua mochila.'));
          // o recado mora no alto do conteúdo: com a tela rolada (o cartão da Super, no celular), ele entra na tela
          if (msg.scrollIntoView) msg.scrollIntoView({ block: 'nearest' });
          repintar();
          UI.festa(1, { som: false, item: cartoes[o.id].tem });
        });
      }
      function repintar() {
        var foco = document.activeElement && pn.tela.contains(document.activeElement) ? document.activeElement.getAttribute('data-foco') : null;
        var tem = P().estrelas(), q = quantas(), t = q ? Tr.total(itens()) : 0, falta = t - tem;
        U.preencher(saldo, '⭐ Você tem ' + estrelas(tem));
        ofs.forEach(function (o) {
          var c = cartoes[o.id];
          U.preencher(c.tem, 'Você tem ' + Tr.tem(o.id));
          U.preencher(c.n, String(qtd[o.id]));
          c.menos.disabled = qtd[o.id] <= 0;
          c.mais.disabled = qtd[o.id] >= Tr.max();
          if (c.escrever) U.preencher(c.escrever, escritas[o.id] ? '✏ Continuar a escrever' : '✏ Escrever ' + textoFrases(o.frases));
        });
        U.preencher(total, q ? (q === 1 ? '1 bola' : q + ' bolas') + ' · ' + t + ' ⭐' : 'Escolha as bolas');
        U.preencher(aviso, falta > 0 ? 'Faltam ' + estrelas(falta) + '!' : '');
        aviso.hidden = !(falta > 0);
        U.preencher(botao, 'Comprar (' + t + ' ⭐)');
        botao.disabled = !q || falta > 0 || ocupado;
        botao.classList.toggle('btn-secundario', !!botao.disabled);
        if (foco) {
          var alvo = pn.tela.querySelector('[data-foco="' + foco + '"]');
          if (!alvo || alvo.disabled) alvo = pn.tela.querySelector('.treinadores-escolha button:not([disabled])');
          if (alvo && !alvo.disabled) alvo.focus();
        }
      }
      function comprar() {
        var l = itens(), t = Tr.total(l), q = quantas();
        if (ocupado || !q) return;
        if (t > P().estrelas()) { Reino.Som.tocar('toque'); repintar(); return; }
        Reino.Som.tocar('toque');
        var uma = l.length === 1 && l[0].qtd === 1 && ofs.filter(function (o) { return o.id === l[0].id; })[0];
        var oque = uma ? '1 ' + uma.def.nome : q + ' bolas';
        ocupado = true;
        UI.confirmar('Comprar ' + oque + ' por ' + estrelas(t) + '?', 'Sim, quero! ✨', 'Agora não', true).then(function (sim) {
          ocupado = false;
          if (!sim || !pn.tela.isConnected) { repintar(); return; }
          gravando = true;
          var r;
          try { r = Tr.comprar(l); } finally { gravando = false; }
          if (!r.ok) {
            Reino.Som.tocar('erro');
            recado(r.motivo === 'saldo' ? 'Faltam ' + estrelas(r.falta) + '!' : 'Ops! Algo mudou. Tente de novo.');
            repintar();
            return;
          }
          Reino.Som.tocar('estrela');
          var bau = r.ganhos.some(function (g) { return g.onde === 'bau'; });
          recado(bau ? 'Comprado! ✨ A mochila encheu: o resto foi para o baú.' : 'Comprado! ✨ Está na sua mochila.');
          zerar();
          if (UI.atualizarHUD) UI.atualizarHUD();
          repintar();
          // compra: nível 1, sem confete, o brilho de 3 quadros no saldo (arte.md §16)
          UI.festa(1, { som: false, item: saldo });
          if (UI.porTeclado && UI.porTeclado()) (function () { var b = pn.tela.querySelector('.treinadores-escolha button:not([disabled])'); if (b) b.focus(); })();
        });
      }

      aberta = { tela: pn.tela, fim: fim, repintar: repintar, gravando: function () { return gravando; } };
      Reino.Som.tocar('porta');
      repintar();
      setTimeout(function () {
        if (!pn.tela.isConnected || !UI.porTeclado || !UI.porTeclado()) return;
        (function () { var b = pn.tela.querySelector('.treinadores-escolha button:not([disabled])'); if (b) b.focus(); })();
      }, 60);
    });
  };
})();
