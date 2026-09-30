/* Loja das Fadas: enfeites à venda (Reino.LojaItens), prêmios da Escola e usar/tirar enfeite. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = Reino.UI, R = Reino._ui;
  var est = R.est, painel = R.painel, focar = R.focar, hifenizar = R.hifenizar, aparencia = R.aparencia;
  var logoDepoisDaCompra = R.logoDepoisDaCompra, compra = R.compra, balaoNaTela = R.balaoNaTela;

  /* ---------- loja das fadas ---------- */
  // a lista é única e mora em js/conteudo/loja-itens.js (Reino.LojaItens): enfeites à venda e prêmios da Escola
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
      // um enfeite por encaixe: tira o que estava no mesmo encaixe; id desconhecido (de uma versão nova) fica guardado
      var ja = u.enfeites.indexOf(item.id) >= 0;
      u.enfeites = u.enfeites.filter(function (id) { var it = itemPorId(id); return !it || it.slot !== item.slot; });
      if (!ja) u.enfeites.push(item.id);
    }
  }

  UI.alternarEnfeite = function (id) { var it = itemPorId(id); if (it) alternar(it); };
  UI.usandoEnfeite = function (id) { var it = itemPorId(id); return !!it && usando(it); };

  // ícone do item: desenho de js/arte/icones/ pela chave ('enfeite:…', 'acessorio:…') ou o emoji (vira pixel sozinho)
  function iconeItem(item, px) {
    var chave = item.icone || '';
    var d = chave.indexOf(':') > 0 || px ? PA.iconeDesenho(chave) : null;
    if (d) return PA.paraDOM(d, PA.escalaNitida(px || 36, 16), 'icone-acessorio');
    return chave;
  }
  // a pergunta da compra: o desenho do item (48 px, destaque), a pergunta e o preço numa linha só dele,
  // com a ⭐ em pixel (no meio da frase, a ⭐ ficava numa linha e o número na outra)
  function perguntaDaCompra(item) {
    return [iconeItem(item, 48), el('br'), 'Trocar por ' + item.nome + '?', el('br'), '⭐\u00a0' + item.preco + '\u00a0estrelas'];
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
    UI.confirmar(perguntaDaCompra(item), 'Sim, quero! ✨', 'Agora não', true).then(function (sim) {
      if (!sim) return;
      compra.itemComprado = item.id;   // o cartão dele ignora toques perto do "Sim" até 1,1 s sem toque
      if (!P.gastarEstrelas(item.preco)) return;   // (as estrelas não mudam enquanto ela confirma, mas por via das dúvidas)
      est().loja[item.id] = true;
      if (!usando(item)) alternar(item);
      P.salvar();
      Reino.Som.tocar('estrela'); UI.confete(40);
      depois(); U.emit(EV.MAPA_MUDOU);
    });
  }
  // caro: ainda não comprado e com preço acima do saldo. A carta fica no estado indisponível (.indisponivel,
  // ui.md §10.19.1, com aria-disabled e o motivo no aria-label) e 🔒 no preço antes do toque; segue focável e
  // tocar continua dizendo quantas estrelas faltam
  function caro(item, tem) { return !tem && P.estrelas() < item.preco; }
  function faltam(item) { var f = item.preco - P.estrelas(); return f > 0 ? (f === 1 ? ', falta 1 estrela' : ', faltam ' + f + ' estrelas') : ''; }
  var avisouPremios = false;   // a regra nova dos prêmios é falada uma vez por sessão
  // a vitrine da tela, por encaixe (com 68 enfeites, uma grade só ficava comprida demais); em cada grupo,
  // do mais barato ao mais caro (empate: a ordem da lista). Capa, rastro e asas vão juntos no fim
  var GRUPOS = ['orelha', 'olho', 'cabeca', 'chifre', 'pescoco', 'cauda'].map(function (s) {
    return { id: s, titulo: LI.SLOTS[s].nome, slots: [s] };
  }).concat([{ id: 'especiais', titulo: 'Capa, rastro e asas', slots: ['capa', 'rastro', 'asas'] }]);
  function itensDoGrupo(g) {
    return ITENS.filter(function (it) { return g.slots.indexOf(it.slot) >= 0; })
      .sort(function (a, b) { return a.preco - b.preco || ITENS.indexOf(a) - ITENS.indexOf(b); });
  }

  UI.telaLoja = function () {
    var pn = painel('lugar', '🧚 Loja das Fadas');
    var c = pn.conteudo;
    var saldo = el('div.saldo-estrelas');
    var vitrine = el('div.vitrine-previa');
    // um título e uma grade por encaixe; os atalhos de cima rolam até o grupo
    var grupos = GRUPOS.map(function (g) {
      return { g: g, titulo: el('h3.estabulo-grupo.loja-grupo', { id: 'loja-grupo-' + g.id, tabindex: '-1' }, g.titulo), grade: el('div.grade-loja') };
    });
    var atalhos = el('nav.loja-atalhos', { 'aria-label': 'Ir para o encaixe' }, grupos.map(function (x) {
      return el('button.btn-pequeno', { type: 'button', on: { click: function () {
        // o foco vai para o título do grupo: o Tab seguinte entra nos cartões dele (e a tela não volta ao topo)
        x.titulo.scrollIntoView({ block: 'start' }); x.titulo.focus({ preventScroll: true });
      } } }, x.g.titulo);
    }));
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
      grupos.forEach(function (x) {
        x.grade.innerHTML = '';
        itensDoGrupo(x.g).forEach(function (item) { x.grade.appendChild(cartao(item)); });
      });
      function cartao(item) {
        var tem = !!est().loja[item.id], cr = caro(item, tem);
        var b = el('button.item-loja' + (tem ? '.comprado' : '') + (usando(item) ? '.usando' : '') + (cr ? '.indisponivel' : ''),
          { type: 'button', 'data-item': item.id, 'aria-disabled': cr ? 'true' : null, 'aria-label': item.nome + ', ' + (tem ? (usando(item) ? 'usando' : 'comprado, tocar para usar') : item.preco + ' estrelas' + faltam(item)) },
          el('span.item-icone', iconeItem(item)), el('b', hifenizar(item.nome)),
          el('span.item-preco', tem ? (usando(item) ? '✓ Usando' : 'Usar') : (cr ? '🔒 ' : '') + '⭐ ' + item.preco));
        b.addEventListener('click', function (e) {
          if (logoDepoisDaCompra(e, item.id)) return;
          if (tem) { alternar(item); Reino.Som.tocar('selecionar'); P.salvar(); pintar(); U.emit(EV.MAPA_MUDOU); return; }
          comprar(item, pintar);
        });
        return b;
      }
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
          var cr = st === 'aVenda' && caro(p, tem);
          var preco = tem ? (usando(item) ? '✓ Usando' : 'Usar') : st === 'aVenda' ? (cr ? '🔒 ' : '') + '⭐ ' + p.preco : '🔒 ' + rar.emoji + ' ' + rar.nome;
          var b = el('button.item-loja.item-premio.rar-' + p.raridade + '.premio-' + st + (tem ? '.comprado' : st === 'bloqueado' ? '.bloqueado' : '') + (tem && usando(item) ? '.usando' : '') + (cr ? '.indisponivel' : ''),
            { type: 'button', 'data-item': p.id, 'data-estado': st, 'aria-disabled': cr ? 'true' : null,
              'aria-label': p.nome + ', ' + (st === 'bloqueado' ? 'bloqueado, ' + rar.nome.toLowerCase()
                : tem ? (usando(item) ? 'usando' : (st === 'ganho' ? 'ganho na prova' : 'comprado') + ', tocar para usar')
                : p.preco + ' estrelas, ' + rar.nome.toLowerCase() + (st === 'aVenda' ? faltam(p) : '')) },
            el('span.item-icone', desenho), el('b', hifenizar(p.nome)), st === 'bloqueado' ? null : rotulo, el('span.item-preco', preco));
          b.addEventListener('click', function (e) {
            if (logoDepoisDaCompra(e, item.id)) return;
            if (tem) { alternar(item); Reino.Som.tocar('selecionar'); P.salvar(); pintar(); U.emit(EV.MAPA_MUDOU); return; }
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
    c.appendChild(atalhos);
    grupos.forEach(function (x) { c.appendChild(x.titulo); c.appendChild(x.grade); });
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
})();
