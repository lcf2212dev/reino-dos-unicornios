/* Vila Arco-Íris: a tela de uma loja, comprar e vender vários de uma vez (docs/contratos/vila.md §4).
   UI.telaVilaLoja(lojaId) → Promise (resolve ao fechar). As regras e o save são do Reino.VilaLojas (sistemas/vila-lojas.js).
   Topo: o saldo de estrelas e as abas Comprar/Vender (a Casa Bonita só vende: sem abas). Corpo: a grade de cartões
   (ícone da peça ou a capa do enfeite, nome, raridade, atributos e preço); tocar põe um no carrinho. Carrinho ao lado
   (embaixo, no celular), com − e + por item (até config.vila.maxPorItem; na venda, até as que ela tem, com "Vender
   todas"). Rodapé: o total e o botão "Comprar (N ⭐)"/"Vender (+N ⭐)", que pergunta antes (UI.confirmar com gasta);
   sem saldo, "Faltam N estrelas!" e o botão apagado. Depois: som, brilho leve, HUD e a lista de novo.
   Nas lojas de peças, no alto da aba Comprar, a faixa "Peças épicas" (ui/vila-conquistas.js, Reino._vilaEpicas): as
   peças que só se conquistam escrevendo em letra cursiva (docs/contratos/cursiva.md §6).
   Só texto na tela (nenhuma voz nova). Estilos: css/ui-vila.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;
  var NOMES = { dano: 'Força', defesa: 'Proteção', vida: 'Vida', velocidade: 'Rapidez', sorte: 'Sorte' };

  function V() { return Reino.VilaLojas; }
  function P() { return Reino.Progresso; }
  function max() { return Reino.config.vila.maxPorItem || 10; }
  function estrelas(n) { return n + (n === 1 ? ' estrela' : ' estrelas'); }
  function icone(chave, px) {
    var c = PA.iconeEmoji(chave, 2), lado = c.width * PA.escalaNitida(px || 32, c.width);
    c.classList.add('pixel');
    c.style.width = lado + 'px';
    c.style.height = (c.height * lado / c.width) + 'px';
    c.setAttribute('aria-hidden', 'true');
    return c;
  }
  function atributos(def) {
    var b = (def && def.bonus) || {};
    return Object.keys(NOMES).filter(function (k) { return b[k]; }).map(function (k) {
      var pct = k === 'velocidade' || k === 'sorte';
      return NOMES[k] + ' +' + (pct ? Math.round(b[k] * 100) + '%' : b[k]);
    });
  }
  function rar(def) { return def && def.raridade ? '.rar-' + def.raridade : '.rar-comum'; }
  function nomeRaridade(def) {
    var C = Reino.ItensCatalogo;
    return def && def.raridade && C && C.NOMES_RARIDADE ? C.NOMES_RARIDADE[def.raridade] : '';
  }
  // o desenho de uma oferta: o ícone da peça ou a capa do enfeite (menor no carrinho)
  function desenho(loja, def, px) {
    if (loja === 'casa') {
      var capa = UI.capaCasa ? UI.capaCasa(def.objeto) : el('span');
      capa.classList.add('vila-capa');
      if (px) capa.style.width = px + 'px';
      if (px) capa.style.height = 'auto';
      return capa;
    }
    return icone(def.icone || 'item:' + def.id, px || 32);
  }

  // a tela aberta ({ tela, repintar }) e a trava enquanto a compra grava (cada Itens.ganhar avisa ITENS)
  var aberta = null, gravando = false;
  U.on(Reino.EVENTOS.ITENS, function () { if (aberta && aberta.tela.isConnected) aberta.repintar(); });
  // a tela saiu da pilha sem o ✕ (UI.fecharTodas, troca de cena): a promessa resolve do mesmo jeito
  U.on(Reino.EVENTOS.TELAS, function () { if (aberta && Reino._ui.pilha.indexOf(aberta.tela) < 0) aberta.fim(); });

  UI.telaVilaLoja = function (lojaId) {
    var Vl = V(), L = Vl && Vl.loja(lojaId);
    if (!L) return Promise.resolve();
    return new Promise(function (resolver) {
      var J = window.Jogador;
      if (J && J.parar) J.parar();
      var soCompra = lojaId === 'casa';
      var aba = 'comprar', carrinho = { comprar: {}, vender: {} }, ordem = { comprar: [], vender: [] }, ocupado = false;
      var pn = UI.painel('vila-loja', L.nome, { icone: L.icone, aoFechar: function () { fim(); } });
      pn.tela.classList.add('tela-vila-loja-' + lojaId);
      var acabou = false;
      function fim() { if (acabou) return; acabou = true; if (aberta && aberta.tela === pn.tela) aberta = null; resolver(); }

      var saldo = el('p.vila-saldo', { 'aria-live': 'polite' });
      var abas = {}, barra = null;
      if (!soCompra) {
        barra = el('div.vila-abas', { role: 'tablist', 'aria-label': 'Comprar ou vender' }, ['comprar', 'vender'].map(function (k) {
          var b = el('button.vila-aba', { type: 'button', role: 'tab', 'data-aba': k, 'data-foco': 'aba:' + k }, k === 'comprar' ? '🛒 Comprar' : '🪙 Vender');
          b.addEventListener('click', function () {
            if (aba === k) return;
            Reino.Som.tocar('selecionar');
            aba = k; recado('');
            repintar();
          });
          return (abas[k] = b);
        }));
      }
      var grade = el('div.vila-grade');
      var lista = el('div.vila-carrinho-lista');
      var carrinhoEl = el('aside.vila-carrinho', el('h3.vila-carrinho-titulo', '🛒 Carrinho'), lista);
      var total = el('p.vila-total', { 'aria-live': 'polite' });
      var aviso = el('p.vila-aviso', { hidden: true });
      var msg = el('p.vila-recado', { 'aria-live': 'polite', hidden: true });
      var botao = el('button.btn-grande.vila-botao-total', { type: 'button', 'data-foco': 'total' });
      pn.conteudo.appendChild(el('div.vila-topo', saldo, barra));
      pn.conteudo.appendChild(msg);
      // as peças épicas da letra cursiva (só nas lojas que têm): fora do carrinho, com a tela de escrever delas
      var epicas = Reino._vilaEpicas ? Reino._vilaEpicas.faixa(lojaId, { tela: pn.tela, recado: recado }) : null;
      if (epicas) pn.conteudo.appendChild(epicas.el);
      pn.conteudo.appendChild(el('div.vila-corpo', grade, carrinhoEl));
      pn.card.appendChild(el('footer.vila-rodape', el('div.vila-rodape-texto', total, aviso), botao));
      botao.addEventListener('click', fechar);

      function recado(t) { U.preencher(msg, t); msg.hidden = !t; }

      /* ---------- o que está na tela ---------- */
      // ofertas da aba: compra = aVenda (id, def, preco); venda = os grupos que ela tem (id, def, uids, preco)
      function ofertas() { return aba === 'comprar' ? Vl.aVenda(lojaId) : Vl.compraveis(lojaId); }
      function porId() { var r = {}; ofertas().forEach(function (o) { r[o.id] = o; }); return r; }
      function limite(o) { return aba === 'comprar' ? max() : o.uids.length; }
      // o carrinho da aba, só com o que ainda vale (a venda some se a peça saiu da mochila/baú)
      function itens() {
        var ofs = porId(), c = carrinho[aba];
        ordem[aba] = ordem[aba].filter(function (id) {
          var o = ofs[id];
          if (!o || !c[id]) { delete c[id]; return false; }
          c[id] = Math.min(c[id], limite(o));
          return true;
        });
        return ordem[aba].map(function (id) { return { o: ofs[id], qtd: c[id] }; });
      }
      function soma(l) { return l.reduce(function (s, x) { return s + x.o.preco * x.qtd; }, 0); }
      function por(id, d) {
        var o = porId()[id];
        if (!o) return;
        var c = carrinho[aba], n = (c[id] || 0) + d;
        if (n > limite(o)) { Reino.Som.tocar('toque'); return; }
        if (n <= 0) { delete c[id]; ordem[aba] = ordem[aba].filter(function (x) { return x !== id; }); }
        else { if (!c[id]) ordem[aba].push(id); c[id] = n; }
        Reino.Som.tocar(d > 0 ? 'selecionar' : 'toque');
        recado('');
        repintar();
      }
      function todas(id) {
        var o = porId()[id];
        if (!o) return;
        if (!carrinho[aba][id]) ordem[aba].push(id);
        carrinho[aba][id] = limite(o);
        Reino.Som.tocar('selecionar');
        repintar();
      }

      function cartao(o) {
        var d = o.def, noCarrinho = carrinho[aba][o.id] || 0, venda = aba === 'vender';
        var linhas = lojaId === 'casa'
          ? [Reino.Casa && Reino.Casa.nomeComodo ? Reino.Casa.nomeComodo(d.comodo) : '']
          : atributos(d);
        var preco = venda ? '+' + o.preco + ' ⭐' : '⭐ ' + o.preco;
        var rotulo = d.nome + ', ' + (venda ? 'a loja paga ' : 'custa ') + estrelas(o.preco);
        var b = el('button.vila-cartao' + (lojaId === 'casa' ? '' : rar(d)) + (noCarrinho ? '.no-carrinho' : ''),
          { type: 'button', 'data-id': o.id, 'data-foco': 'cartao:' + o.id, 'aria-label': rotulo, title: d.nome },
          el('span.vila-cartao-desenho', desenho(lojaId, d)),
          el('b.vila-cartao-nome', U.colado(d.nome)),
          lojaId === 'casa' ? null : el('span.vila-cartao-rar', nomeRaridade(d)),
          el('span.vila-cartao-atrib', linhas.filter(Boolean).map(function (t) { return el('span', t); })),
          venda ? el('span.vila-cartao-tem', 'Você tem ' + o.uids.length) : null,
          el('span.vila-cartao-preco', preco),
          noCarrinho ? el('span.vila-cartao-qtd', { 'aria-hidden': 'true' }, String(noCarrinho)) : null);
        b.addEventListener('click', function () { por(o.id, 1); });
        return b;
      }
      function linha(x) {
        var o = x.o, venda = aba === 'vender';
        var menos = el('button.btn-icone.vila-menos', { type: 'button', 'aria-label': 'Um a menos', 'data-foco': 'menos:' + o.id }, '-');
        var mais = el('button.btn-icone.vila-mais', { type: 'button', 'aria-label': 'Um a mais', 'data-foco': 'mais:' + o.id, disabled: x.qtd >= limite(o) }, '+');
        menos.addEventListener('click', function () { por(o.id, -1); });
        mais.addEventListener('click', function () { por(o.id, 1); });
        var tudo = venda && o.uids.length > 1 && x.qtd < o.uids.length
          ? el('button.btn-secundario.vila-todas', { type: 'button', 'data-foco': 'todas:' + o.id }, 'Vender todas') : null;
        if (tudo) tudo.addEventListener('click', function () { todas(o.id); });
        return el('div.vila-linha', { 'data-id': o.id },
          el('span.vila-linha-desenho', desenho(lojaId, o.def, 24)),
          el('span.vila-linha-nome', U.colado(o.def.nome)),
          el('span.vila-linha-qtd', menos, el('b', String(x.qtd)), mais),
          el('span.vila-linha-preco', (venda ? '+' : '') + o.preco * x.qtd + ' ⭐'),
          tudo);
      }

      function repintar() {
        var foco = document.activeElement && pn.tela.contains(document.activeElement) ? document.activeElement.getAttribute('data-foco') : null;
        var n = P().estrelas();
        U.preencher(saldo, '⭐ Você tem ' + estrelas(n));
        Object.keys(abas).forEach(function (k) { abas[k].setAttribute('aria-selected', k === aba ? 'true' : 'false'); });
        var ofs = ofertas(), l = itens(), t = soma(l), venda = aba === 'vender';
        if (epicas) { epicas.el.hidden = venda; epicas.repintar(); }
        grade.textContent = '';
        if (!ofs.length) grade.appendChild(el('p.vila-vazio', venda ? 'Você não tem nada que esta loja compra.' : 'Nada à venda por enquanto.'));
        ofs.forEach(function (o) { grade.appendChild(cartao(o)); });
        lista.textContent = '';
        if (!l.length) lista.appendChild(el('p.vila-carrinho-vazio', venda ? 'Toque numa peça para vender.' : 'Toque no que você quer.'));
        l.forEach(function (x) { lista.appendChild(linha(x)); });
        carrinhoEl.classList.toggle('vazio', !l.length);
        var qtd = l.reduce(function (s, x) { return s + x.qtd; }, 0);
        U.preencher(total, qtd ? (qtd === 1 ? '1 item' : qtd + ' itens') + ' · ' + (venda ? '+' : '') + t + ' ⭐' : 'Carrinho vazio');
        var falta = venda ? 0 : t - n;
        U.preencher(aviso, falta > 0 ? 'Faltam ' + estrelas(falta) + '!' : '');
        aviso.hidden = !(falta > 0);
        U.preencher(botao, venda ? 'Vender (+' + t + ' ⭐)' : 'Comprar (' + t + ' ⭐)');
        botao.disabled = !qtd || falta > 0 || ocupado;
        botao.classList.toggle('btn-secundario', !!botao.disabled);
        if (foco) {
          var alvo = pn.tela.querySelector('[data-foco="' + foco + '"]');
          if (!alvo || alvo.disabled) alvo = /^(menos|mais|todas):/.test(foco) ? lista.querySelector('button:not([disabled])') || botao : null;
          if (alvo && !alvo.disabled) alvo.focus(); else if (foco.indexOf('cartao:') === 0) { var c0 = grade.querySelector('button'); if (c0) c0.focus(); }
        }
      }

      /* ---------- comprar / vender ---------- */
      function fechar() {
        var l = itens(), t = soma(l), venda = aba === 'vender';
        if (!l.length || ocupado) return;
        var qtd = l.reduce(function (s, x) { return s + x.qtd; }, 0);
        if (!venda && t > P().estrelas()) { Reino.Som.tocar('toque'); repintar(); return; }
        Reino.Som.tocar('toque');
        var oque = qtd === 1 ? U.colado(l[0].o.def.nome) : qtd + (lojaId === 'casa' ? ' enfeites' : ' peças');
        var pergunta = venda ? 'Vender ' + oque + ' por ' + estrelas(t) + '?' : 'Comprar ' + oque + ' por ' + estrelas(t) + '?';
        ocupado = true;
        UI.confirmar(pergunta, venda ? 'Sim, vender! 🪙' : 'Sim, quero! ✨', 'Agora não', true).then(function (sim) {
          ocupado = false;
          if (!sim || !pn.tela.isConnected) { repintar(); return; }
          gravando = true;
          var r;
          try {
            r = venda
            ? Vl.vender(lojaId, [].concat.apply([], l.map(function (x) { return x.o.uids.slice(0, x.qtd); })))
            : Vl.comprar(lojaId, l.map(function (x) { return { id: x.o.id, qtd: x.qtd }; }));
          } finally { gravando = false; }
          if (!r.ok) {
            Reino.Som.tocar('erro');
            recado(r.motivo === 'saldo' ? 'Faltam ' + estrelas(r.falta) + '!' : 'Ops! Algo mudou. Confira o carrinho.');
            repintar();
            return;
          }
          carrinho[aba] = {}; ordem[aba] = [];
          Reino.Som.tocar('estrela');
          var bau = !venda && r.ganhos && r.ganhos.some(function (g) { return g.onde === 'bau'; });
          recado(venda ? 'Vendido! +' + r.total + ' ⭐'
            : lojaId === 'casa' ? 'Comprado! ✨ Já está guardado para a sua casa.'
            : bau ? 'Comprado! ✨ A mochila encheu: o resto foi para o baú.' : 'Comprado! ✨ Está na sua mochila.');
          if (UI.atualizarHUD) UI.atualizarHUD();
          repintar();
          // compra: nível 1, sem confete, o brilho de 3 quadros no saldo (arte.md §16)
          UI.festa(1, { som: false, item: saldo });
          if (UI.porTeclado && UI.porTeclado()) { var c0 = grade.querySelector('button') || (abas.comprar || botao); c0.focus(); }
        });
      }

      // a mochila ou o baú mudaram por fora (outra aba, nuvem): a tela se refaz (um ouvinte só, lá embaixo)
      aberta = { tela: pn.tela, fim: fim, repintar: function () { if (!gravando) repintar(); } };

      Reino.Som.tocar('porta');
      repintar();
      setTimeout(function () {
        if (!pn.tela.isConnected || !UI.porTeclado || !UI.porTeclado()) return;
        var c0 = grade.querySelector('button') || abas.comprar;
        if (c0) c0.focus();
      }, 60);
    });
  };
})();
