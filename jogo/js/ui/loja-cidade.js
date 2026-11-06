/* Telas das lojas da Cidade Nova (docs/contratos/cidade-nova.md): a pergunta de entrada
   (UI.perguntaLoja) e a loja com carrinho de VÁRIOS itens (UI.telaLojaCidade). A pergunta usa o
   mesmo card de desafio da prova (Reino.Desafios.render, modo 'prova'), só para liberar a
   entrada; não dá estrela, Aura nem mexe no save. A loja compra e vende em quantidade, com
   confirmação antes de gastar (UI.confirmar gasta: true) e a guarda de toque de ui.md §5.
   Estilos: css/ui-loja-cidade.css. */
(function () {
  var R = window.Reino, U = R.util, el = U.el, UI = R.UI, P = R.Progresso, D = R.Desafios;
  var EV = R.EVENTOS;

  function compacto() { return window.innerWidth <= 480 || window.innerHeight <= 500; }
  function iconeItem(item, px) {
    if (item.tipo === 'movel' && UI.capaCasa) return UI.capaCasa(item.objeto);
    var chave = item.icone || ('item:' + item.id);
    var cv = window.PA && PA.iconeDesenho ? PA.iconeDesenho(chave) : null;
    if (cv && PA.paraDOM) return PA.paraDOM(cv, PA.escalaNitida(px || 48, cv.width || 16), 'lc-icone-px');
    return el('span.lc-icone-emoji', '✨');
  }
  function atributos(d) {
    var b = d.bonus || {}, l = [];
    if (b.dano) l.push('Força +' + b.dano);
    if (b.defesa) l.push('Proteção +' + b.defesa);
    if (b.vida) l.push('Vida +' + b.vida);
    if (b.velocidade) l.push('Rapidez +' + Math.round(b.velocidade * 100) + '%');
    if (b.sorte) l.push('Sorte +' + Math.round(b.sorte * 100) + '%');
    return l.join(' • ');
  }
  function raridade(d) {
    var r = R.ItensCatalogo && R.ItensCatalogo.NOMES_RARIDADE;
    return (r && r[d.raridade]) || '';
  }

  /* ---------- a pergunta de entrada ---------- */
  /** a pergunta certa libera a loja; errada (ou fechar) não entra. @returns {Promise<boolean>} */
  UI.perguntaLoja = function (loja, q) {
    if (!q || !D) return Promise.resolve(true);
    return new Promise(function (resolver) {
      var resolvido = false, resultado = false, fase = 'pergunta', ctrl = null;
      function fechar(ok) {
        if (resolvido) return;
        resolvido = true; resultado = !!ok;
        if (pn && pn.tela) UI.fecharTela(pn.tela);
        resolver(resultado);
      }
      var pn = UI.painel('loja-pergunta', loja.emoji + ' ' + loja.nome, {
        curto: loja.emoji + ' Entrada', aoFechar: function () { fechar(false); },
      });
      pn.tela._lojaPergunta = q;
      var d = q.desafio;
      pn.conteudo.appendChild(el('p.lc-entrada', 'Para entrar, responda certinho!'));
      pn.conteudo.appendChild(el('p.lc-entrada-sub', 'Uma pergunta do 4º bimestre.'));
      // a página do livro da pergunta (o texto-base), como no Bosque
      try {
        var c = d.livro && (q.materia.livro || []).find(function (x) { return x.id === d.livro; });
        if (c && UI.desenharCarta) {
          var carta = el('div.livro-carta.lc-carta');
          UI.desenharCarta(carta, c, q.materia);
          pn.conteudo.appendChild(el('details.lc-contexto', el('summary', el('b', '📖 Leia antes')), carta));
        }
      } catch (e) { console.warn('loja: carta', e); }
      var area = el('div.lc-area');
      var retorno = el('div.lc-retorno', { hidden: true });
      var btn = el('button.btn-grande.btn-conferir.lc-conferir', { type: 'button', disabled: true }, 'Conferir ✓');
      pn.conteudo.appendChild(area); pn.conteudo.appendChild(retorno);
      pn.card.appendChild(el('footer.lc-botoes', btn));

      ctrl = D.render(d, { modo: 'prova', onMudar: function () { btn.disabled = fase !== 'pergunta' || !ctrl.pronto(); } });
      area.appendChild(ctrl.card);
      btn.disabled = !ctrl.pronto();

      function conferir() {
        if (fase !== 'pergunta' || !ctrl.pronto()) return;
        fase = 'resposta';
        ctrl.travado = true;
        var ok = false;
        try { ok = D.pontuar(d, ctrl.valor()) === 1; } catch (e) { ok = false; }
        resultado = ok;
        if (ok) {
          if (ctrl.marcarCerto) ctrl.marcarCerto();
          R.Som.tocar('acerto');
          retorno.className = 'lc-retorno lc-certo';
          retorno.appendChild(el('h3', '✨ Pode entrar!'));
        } else {
          if (ctrl.revelar) ctrl.revelar();
          R.Som.tocar('erro');
          retorno.className = 'lc-retorno lc-quase';
          retorno.appendChild(el('h3', '💭 Quase!'));
          retorno.appendChild(el('p.lc-certa', D.linhaCerta ? D.linhaCerta(d) : ''));
        }
        if (d.explica) retorno.appendChild(el('p.lc-explica', '📌 ' + d.explica));
        retorno.hidden = false;
        U.preencher(btn, ok ? 'Entrar na loja →' : 'Voltar');
        btn.disabled = false;
      }
      btn.addEventListener('click', function (e) {
        if (btn.disabled) return;
        R.Som.tocar('toque');
        if (fase === 'pergunta') return conferir();
        if (e.isTrusted && e.detail) UI.segurarToques();
        fechar(resultado);
      });
      pn.tela._aoEsc = function () { fechar(false); };
      R.Som.tocar('porta');
      setTimeout(function () { if (pn.tela.isConnected && UI.focarTroca) UI.focarTroca(ctrl.el, null, 0); }, 60);
    });
  };

  /* ---------- a loja ---------- */
  function textoCompra(loja, carrinho) {
    var linhas = carrinho.map(function (c) { return c.qtd + '× ' + c.item.nome; }).join('\n');
    return ['Comprar ' + (carrinho.length === 1 ? 'este item' : 'estes itens') + '?', el('br'), linhas, el('br'),
      'Total: ⭐ ' + R.LojaCidade.totalDe(loja.id, carrinho.map(function (c) { return { id: c.item.id, qtd: c.qtd }; }))].join(' ');
  }

  /** a tela da loja: abas Comprar/Vender, carrinho com quantidade e confirmação. @returns {Promise<void>} */
  UI.telaLojaCidade = function (lojaId) {
    var loja = R.LojaCidade.loja(lojaId);
    if (!loja) return Promise.resolve();
    return new Promise(function (resolver) {
      var fechado = false;
      function sair() { if (fechado) return; fechado = true; UI.fecharTela(pn.tela); resolver(); }
      var pn = UI.painel('loja-cidade', loja.emoji + ' ' + loja.nome, { curto: loja.emoji + ' Loja', aoFechar: sair });
      pn.tela._lojaCidade = lojaId;
      var aba = 'comprar';
      var carrinho = [];   // [{ item, qtd }]
      var venda = [];      // [{ g, qtd }]
      var ocupado = false;

      var topo = el('div.lc-topo');
      var abas = el('nav.lc-abas', { role: 'tablist', 'aria-label': 'Comprar ou vender' });
      var saldo = el('div.lc-saldo');
      var area = el('div.lc-corpo');
      topo.appendChild(saldo); topo.appendChild(abas);
      pn.conteudo.appendChild(topo);
      pn.conteudo.appendChild(el('p.lc-desc', loja.desc));
      pn.conteudo.appendChild(area);
      var pe = el('div.lc-pe');
      pn.card.appendChild(pe);

      function botoesAbas() {
        abas.innerHTML = '';
        [['comprar', 'Comprar'], ['vender', 'Vender']].forEach(function (a) {
          if (a[0] === 'vender' && loja.tipo !== 'equip') return;
          var b = el('button.lc-aba' + (aba === a[0] ? '.ativa' : ''), { type: 'button', role: 'tab', 'aria-selected': aba === a[0] ? 'true' : 'false' }, a[1]);
          b.addEventListener('click', function () { if (aba === a[0]) return; aba = a[0]; R.Som.tocar('selecionar'); pintar(); });
          abas.appendChild(b);
        });
      }

      function qtdNoCarrinho(id) { var c = carrinho.filter(function (x) { return x.item.id === id; })[0]; return c ? c.qtd : 0; }
      function qtdNaVenda(id) { var c = venda.filter(function (x) { return x.g.id === id; })[0]; return c ? c.qtd : 0; }

      function cardCompra(item) {
        var q = qtdNoCarrinho(item.id), cheio = q >= R.LojaCidade.maxPorItem();
        var b = el('button.lc-card' + (q ? '.no-carrinho' : ''), { type: 'button', 'data-id': item.id,
          'aria-label': item.nome + ', ' + item.preco + ' estrelas' + (q ? ', ' + q + ' no carrinho' : '') },
          el('span.lc-card-icone', iconeItem(item, 48)),
          el('b.lc-card-nome', item.nome),
          item.tipo === 'movel' ? el('span.lc-card-tipo', 'Decoração') : el('span.lc-card-raridade.rar-' + item.raridade, raridade(item)),
          item.tipo === 'movel' ? el('span.lc-card-atrib', 'Para a sua casa') : el('span.lc-card-atrib', atributos(item)),
          el('span.lc-card-preco', '⭐ ' + item.preco),
          q ? el('span.lc-card-qtd', '×' + q) : null);
        b.addEventListener('click', function () {
          if (ocupado || qtdNoCarrinho(item.id) >= R.LojaCidade.maxPorItem()) { R.Som.tocar('toque'); return; }
          var c = carrinho.filter(function (x) { return x.item.id === item.id; })[0];
          if (c) c.qtd++; else carrinho.push({ item: item, qtd: 1 });
          R.Som.tocar('selecionar'); pintarPe(); pintarCartao(item.id);
        });
        return b;
      }
      function cardVenda(g) {
        var q = qtdNaVenda(g.id), disp = g.qtd - q;
        var b = el('button.lc-card.lc-venda' + (q ? '.no-carrinho' : ''), { type: 'button', 'data-venda': g.id,
          'aria-label': g.def.nome + ', ' + disp + ' para vender, ' + R.LojaCidade.precoVenda(g.def) + ' estrelas cada' },
          el('span.lc-card-icone', iconeItem(g.def, 48)),
          el('b.lc-card-nome', g.def.nome),
          el('span.lc-card-raridade.rar-' + g.def.raridade, raridade(g.def)),
          el('span.lc-card-atrib', 'Na mochila/baú: ' + disp),
          el('span.lc-card-preco', '⭐ ' + R.LojaCidade.precoVenda(g.def) + ' cada'),
          q ? el('span.lc-card-qtd', '×' + q) : null);
        b.addEventListener('click', function () {
          if (ocupado || disp <= 0) { R.Som.tocar('toque'); return; }
          var c = venda.filter(function (x) { return x.g.id === g.id; })[0];
          if (c) c.qtd++; else venda.push({ g: g, qtd: 1 });
          R.Som.tocar('selecionar'); pintarPe(); pintarCartao(null, g.id);
        });
        return b;
      }

      function pintarCartao(id, vendaId) {
        // o repintar do carrinho não precisa refazer a grade inteira: atualiza só o cartão tocado
        var b = id ? area.querySelector('[data-id="' + id + '"]') : area.querySelector('[data-venda="' + vendaId + '"]');
        if (!b) return;
        if (id) {
          var q = qtdNoCarrinho(id), antigo = b.querySelector('.lc-card-qtd');
          if (antigo) antigo.remove();
          b.classList.toggle('no-carrinho', q > 0);
          if (q) b.appendChild(el('span.lc-card-qtd', '×' + q));
        } else {
          var g = venda.filter(function (x) { return x.g.id === vendaId; })[0], qv = g ? g.qtd : 0;
          var a = b.querySelector('.lc-card-qtd'); if (a) a.remove();
          b.classList.toggle('no-carrinho', qv > 0);
          if (qv) b.appendChild(el('span.lc-card-qtd', '×' + qv));
        }
      }

      function pintarPe() {
        pe.innerHTML = '';
        var lista = aba === 'comprar' ? carrinho : venda, total = 0;
        if (!lista.length) {
          pe.appendChild(el('p.lc-vazio', aba === 'comprar' ? 'Toque nos cartões para escolher o que comprar.' : 'Toque num item seu para vender.'));
          return;
        }
        var linhas = el('div.lc-linhas');
        lista.forEach(function (c) {
          var nome = aba === 'comprar' ? c.item.nome : c.g.def.nome;
          var unit = aba === 'comprar' ? c.item.preco : R.LojaCidade.precoVenda(c.g.def);
          total += unit * c.qtd;
          var menos = el('button.lc-menos', { type: 'button', 'aria-label': 'Tirar um ' + nome }, '-');
          menos.addEventListener('click', function () {
            if (ocupado) return;
            c.qtd--;
            if (c.qtd <= 0) { var i = lista.indexOf(c); if (i >= 0) lista.splice(i, 1); }
            R.Som.tocar('toque'); pintarPe(); pintar();
          });
          linhas.appendChild(el('div.lc-linha', el('span.lc-linha-nome', nome), el('span.lc-linha-qtd', '×' + c.qtd),
            el('span.lc-linha-unit', '⭐ ' + unit), el('span.lc-linha-sub', '⭐ ' + unit * c.qtd), menos));
        });
        pe.appendChild(el('div.lc-resumo', el('b', aba === 'comprar' ? 'Comprar' : 'Vender'), el('span.lc-total', '⭐ ' + total)));
        pe.appendChild(linhas);
        var pode = aba === 'comprar' ? total <= P.estrelas() && total > 0 : total > 0;
        var acao = el('button.btn-grande.btn-principal.lc-acao', { type: 'button', 'aria-disabled': pode ? null : 'true' },
          aba === 'comprar' ? 'Comprar ⭐ ' + total : 'Vender ⭐ ' + total);
        if (!pode) acao.classList.add('lc-sem');
        acao.addEventListener('click', function () {
          if (ocupado) return;
          if (aba === 'comprar' && total > P.estrelas()) {
            R.Som.tocar('toque');
            R.Claude.falar('Faltam ' + (total - P.estrelas()) + ' estrelas. Cada pergunta certa vale uma! ⭐', { tempo: 5000 });
            return;
          }
          if (aba === 'comprar') comprar(total);
          else vender(total);
        });
        pe.appendChild(acao);
        pe.appendChild(el('p.lc-nota', aba === 'comprar' ? '⭐ ' + P.estrelas() + ' estrelas' : 'Escolha quantos quiser de cada item.'));
      }

      function comprar(total) {
        ocupado = true;
        var itens = carrinho.map(function (c) { return { id: c.item.id, qtd: c.qtd }; });
        UI.confirmar('Comprar ' + carrinho.length + (carrinho.length === 1 ? ' item' : ' itens') + ' por ⭐ ' + total + '?', 'Sim, comprar! ✨', 'Agora não', true).then(function (sim) {
          if (!sim) { ocupado = false; return; }
          var r = R.LojaCidade.comprar(loja.id, itens);
          ocupado = false;
          if (!r.ok) {
            R.Som.tocar('toque');
            var falta = r.motivo === 'estrelas' ? 'Faltam ' + r.falta + ' estrelas.' : 'Não deu para comprar.';
            R.Claude.falar(falta, { tempo: 4500 });
            return;
          }
          R.Som.tocar('estrela');
          UI.festa(1, { som: false });
          if (UI.atualizarHUD) UI.atualizarHUD();
          var nota = loja.tipo === 'decor'
            ? (R.Casa && R.Casa.ganhou() ? '🎁 Já está no modo decorar da sua casa!' : '🎁 Fica guardado até você ganhar a sua casa.')
            : '🎒 Foi para a sua mochila (ou para o Baú, se ela estiver cheia).';
          carrinho = [];
          R.Claude.falar('Compra feita! ' + nota, { tempo: 5000 });
          pintar();
        });
      }

      function vender(total) {
        ocupado = true;
        var escolhidos = venda.map(function (c) { return { g: c.g, qtd: c.qtd }; });
        UI.confirmar('Vender ' + escolhidos.reduce(function (n, c) { return n + c.qtd; }, 0) + ' itens por ⭐ ' + total + '?', 'Sim, vender! ✨', 'Agora não', true).then(function (sim) {
          if (!sim) { ocupado = false; return; }
          var uids = [];
          escolhidos.forEach(function (c) { uids = uids.concat(c.g.uids.slice(0, c.qtd)); });
          var r = R.LojaCidade.vender(loja.id, uids);
          ocupado = false;
          if (!r.ok) { R.Som.tocar('erro'); R.Claude.falar('Não deu para vender esses itens.', { tempo: 4000 }); return; }
          R.Som.tocar('moeda');
          UI.festa(1, { som: false });
          if (UI.atualizarHUD) UI.atualizarHUD();
          venda = [];
          R.Claude.falar('Vendido! Você ganhou ' + r.total + (r.total === 1 ? ' estrela!' : ' estrelas!') + ' ⭐', { tempo: 4500 });
          pintar();
        });
      }

      function pintar() {
        botoesAbas();
        saldo.innerHTML = '';
        saldo.appendChild(el('b.lc-saldo-num', '⭐ ' + P.estrelas()));
        saldo.appendChild(el('span.lc-saldo-txt', P.estrelas() === 1 ? 'estrela' : 'estrelas'));
        area.innerHTML = '';
        if (aba === 'comprar') {
          var grade = el('div.lc-grade');
          R.LojaCidade.compra(loja.id).forEach(function (item) { grade.appendChild(cardCompra(item)); });
          area.appendChild(grade);
          if (loja.tipo === 'decor' && (!R.Casa || !R.Casa.ganhou())) area.appendChild(el('p.lc-aviso', 'Você ainda não tem a sua casa: o que comprar fica guardado e aparece quando ela chegar.'));
        } else {
          var itens = R.LojaCidade.vende(loja.id);
          if (!itens.length) area.appendChild(el('p.lc-vazio', 'Você não tem itens desta loja para vender.'));
          else {
            var g2 = el('div.lc-grade');
            itens.forEach(function (g) { g2.appendChild(cardVenda(g)); });
            area.appendChild(g2);
            area.appendChild(el('p.lc-aviso', 'Só aparecem os itens da mochila e do Baú de Guardados que esta loja compra.'));
          }
        }
        pintarPe();
      }

      R.Som.tocar('porta');
      pintar();
      setTimeout(function () { if (pn.tela.isConnected && UI.focarTroca) UI.focarTroca(abas.querySelector('button'), null, 0); }, 60);
    });
  };
})();
