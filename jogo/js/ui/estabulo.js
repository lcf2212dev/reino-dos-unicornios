/* Estábulo Mágico: coleção de unicórnios, cartas, detalhe (montar, renomear) e "Dar comida". */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = Reino.UI, R = Reino._ui;
  var est = R.est, painel = R.painel, focarMapa = R.focarMapa, iconePequeno = R.iconePequeno;
  var cuidadosProntos = R.cuidadosProntos, barrasCuidado = R.barrasCuidado, darComida = R.darComida;
  var textoEnche = R.textoEnche, nomeComida = R.nomeComida;

  /* ---------- estábulo / álbum ---------- */
  UI.telaEstabulo = function () {
    var pn = painel('estabulo', '🦄 Estábulo Mágico');
    var c = pn.conteudo;
    var ovos = P.ovosParaChocar();
    if (ovos.length) {
      var bOvo = el('button.btn-grande.btn-principal.btn-ovos', { type: 'button' }, '🥚 Chocar ' + (ovos.length === 1 ? '1 ovo' : ovos.length + ' ovos'));
      bOvo.addEventListener('click', function () { UI.fecharTela(pn.tela); UI.chocarOvos(ovos).then(UI.telaEstabulo); });
      c.appendChild(bOvo);
    }
    var todos = Reino.Unicornios.todos(est().corInicial);
    var ganhos = todos.filter(function (d) { return P.temUni(d.id); }).length;
    c.appendChild(el('p.estabulo-contagem', 'Sua coleção: ', el('b', ganhos + ' de ' + todos.length), ' unicórnios'));
    var grupos = [{ titulo: 'Primeiro amigo', emoji: '🦄', lista: todos.filter(function (d) { return !d.materiaId; }) }];
    Reino.materias.forEach(function (m) { grupos.push({ titulo: m.emoji + ' ' + m.nome, emoji: m.emoji, nome: m.nome, lista: todos.filter(function (d) { return d.materiaId === m.id; }) }); });
    // atalhos: um toque rola até a matéria (a barra fica presa no topo da lista)
    var atalhos = el('nav.estabulo-atalhos', { 'aria-label': 'Ir para a matéria' });
    c.appendChild(atalhos);
    grupos.forEach(function (g) {
      var h = el('h3.estabulo-grupo', g.titulo);
      var a = el('button.estabulo-atalho', { type: 'button', 'aria-label': g.nome || g.titulo }, iconePequeno(g.emoji, 32));
      a.addEventListener('click', function () { Reino.Som.tocar('toque'); h.scrollIntoView({ block: 'start' }); });
      atalhos.appendChild(a);
      c.appendChild(h);
      var grade = el('div.grade-unis');
      g.lista.forEach(function (d) { grade.appendChild(cartaUni(d, function () { UI.fecharTela(pn.tela); UI.telaEstabulo(); })); });
      c.appendChild(grade);
    });
  };

  function cartaUni(d, aoMudar) {
    var u = est().unis[d.id];
    var tem = u && u.chocado;
    var carta = el('button.carta-uni.rar-' + d.raridade + (tem ? '' : '.escondida') + (d.id === P.montaria() ? '.montado' : ''), { type: 'button' });
    var rar = Reino.Unicornios.RARIDADES[d.raridade];
    if (tem) {
      var pe = Reino.Unicornios.progressoEstagio(u.xp);
      // a montaria aparece com os enfeites em uso, como no cartão do HUD (os outros não usam nada)
      carta.appendChild(UI.spriteMontaria(d.id, 4));
      carta.appendChild(el('b.carta-nome', P.nomeUni(d.id)));
      carta.appendChild(el('span.carta-rar', rar.emoji + ' ' + rar.nome));
      carta.appendChild(el('span.carta-estagio', Reino.Unicornios.ESTAGIOS[pe.estagio].emoji + ' ' + Reino.Unicornios.ESTAGIOS[pe.estagio].nome));
      // 🌱 antes do crescimento, como o 🍎 e o 💧 da fome e da sede (na tritanopia as cores se parecem)
      carta.appendChild(el('span.carta-cresce', iconePequeno('🌱', 16), el('span.barrinha', el('span', { style: { width: Math.round(pe.pct * 100) + '%' } }))));
      if (cuidadosProntos()) carta.appendChild(barrasCuidado(d.id, 'mini'));
      if (d.id === P.montaria()) carta.insertBefore(el('span.selo-montado', '🐎 Montaria'), carta.firstChild);
    } else if (u && !u.chocado) {
      carta.appendChild(PA.paraDOM(PA.ovo(d.raridade, 0), 4));
      carta.appendChild(el('b.carta-nome', 'Ovo ' + rar.nome));
      carta.appendChild(el('span.carta-rar', 'Toque para chocar!'));
    } else {
      carta.appendChild(PA.paraDOM(PA.silhueta(PA.unicornio(d, 3, 0)), 4, 'silhueta'));
      carta.appendChild(el('b.carta-nome', '???'));
      carta.appendChild(el('span.carta-rar', rar.emoji + ' ' + rar.nome));
    }
    carta.addEventListener('click', function () {
      Reino.Som.tocar('toque');
      if (u && !u.chocado) { UI.chocarOvos([d.id]).then(aoMudar); return; }
      detalheUni(d, aoMudar);
    });
    return carta;
  }

  function detalheUni(d, aoMudar) {
    var u = est().unis[d.id];
    var tem = u && u.chocado;
    var rar = Reino.Unicornios.RARIDADES[d.raridade];
    var pn = painel('detalhe', tem ? P.nomeUni(d.id) : 'Unicórnio misterioso');
    var c = pn.conteudo;
    if (!tem) {
      c.appendChild(el('div.detalhe-sprite', PA.paraDOM(PA.silhueta(PA.unicornio(d, 3, 0)), 8, 'silhueta')));
      c.appendChild(el('p.detalhe-rar.rar-' + d.raridade, rar.emoji + ' ' + rar.nome));
      c.appendChild(el('p.detalhe-como', '🔎 Como ganhar: ' + Reino.Unicornios.comoGanhar(d)));
      return;
    }
    var pe = Reino.Unicornios.progressoEstagio(u.xp);
    var E = Reino.Unicornios.ESTAGIOS;
    c.appendChild(el('div.detalhe-sprite.rar-' + d.raridade, UI.spriteMontaria(d.id, 8)));
    c.appendChild(el('p.detalhe-rar.rar-' + d.raridade, rar.emoji + ' ' + rar.nome));
    c.appendChild(el('p.detalhe-frase', '"' + d.frase + '"'));
    var trilha = el('ol.trilha-estagios');
    E.forEach(function (s, i) { trilha.appendChild(el('li' + (i <= pe.estagio ? '.alcancado' : ''), el('span', s.emoji), el('small', s.nome))); });
    c.appendChild(trilha);
    c.appendChild(el('p.detalhe-xp', pe.estagio >= E.length - 1 ? 'Já é adulto! 👑' : 'Faltam ' + pe.falta + ' pontinhos para virar ' + E[pe.estagio + 1].nome + '. Ele cresce quando é sua montaria e você acerta!'));
    if (pe.estagio === 0) c.appendChild(el('p.detalhe-dica', '🍼 Bebês ainda não aguentam carregar ninguém: eles andam do seu lado. Quando crescer, dá para montar!'));
    var botoes = el('div.intro-botoes');
    if (cuidadosProntos()) {
      c.appendChild(el('div.cuid-detalhe', barrasCuidado(d.id, 'grande')));
      // com sede, o Estábulo não tem o que dar: diz onde tem água
      if (Reino.Cuidados.baixo(d.id).sede) c.appendChild(el('p.bau-nota', '💧 Tem água fresquinha na Pet Shop, de graça!'));
      var comer = el('button.btn-grande.btn-secundario.btn-dar-comida', { type: 'button' }, '🥕 Dar comida');
      comer.addEventListener('click', function () { Reino.Som.tocar('toque'); escolherComida(d); });
      botoes.appendChild(comer);
    }
    if (d.id !== P.montaria()) {
      var montar = el('button.btn-grande.btn-principal', { type: 'button' }, pe.estagio === 0 ? 'Passear junto 🐾' : 'Montar 🐎');
      montar.addEventListener('click', function () {
        est().montaria = d.id; P.salvar(); Reino.Som.tocar('selecionar');
        UI.fecharTela(pn.tela); if (aoMudar) aoMudar(); U.emit(EV.MAPA_MUDOU);
        Reino.Claude.falar(P.nomeUni(d.id) + ': "' + d.frase + '"', { tempo: 5000, fala: [d.frase], voz: 'unicornio' });
      });
      botoes.appendChild(montar);
    }
    var renomear = el('button.btn-grande.btn-secundario', { type: 'button' }, '✏️ Mudar o nome');
    renomear.addEventListener('click', function () {
      UI.pedirNome('Qual vai ser o novo nome?', P.nomeUni(d.id)).then(function (nome) {
        if (!nome) return;
        // lido na hora: uma mescla com a caixa aberta troca o objeto do estado (save-e-mescla.md §8.2)
        est().unis[d.id].nome = nome; P.salvar(); UI.fecharTela(pn.tela); detalheUni(d, aoMudar); U.emit(EV.MAPA_MUDOU);
      });
    });
    botoes.appendChild(renomear);
    c.appendChild(botoes);
  }

  // "Dar comida" no Estábulo: escolhe uma comida da despensa (só as que tem)
  function escolherComida(d) {
    var Cu = Reino.Cuidados;
    var pn = painel('comida', '🥕 Dar comida');
    var c = pn.conteudo;
    var lista = Cu.despensa();
    c.appendChild(el('div.petshop-uni',
      UI.spriteMontaria(d.id, 4, { semEnfeite: true }),
      el('div.petshop-uni-info', el('b', P.nomeUni(d.id)), barrasCuidado(d.id, 'grande'))));
    if (!lista.length) {
      c.appendChild(el('p.petshop-vazia', '🧺 A despensa está vazia.'));
      c.appendChild(el('p.bau-nota', 'A Dona Aveia vende comidinhas na Pet Shop, em frente ao Estábulo. Lá também tem água fresquinha e banho de espuma! 🐾'));
      var ir = el('button.btn-grande.btn-principal', { type: 'button' }, '🐾 Ir até a Pet Shop');
      ir.addEventListener('click', function () {
        var l = Mapa.lugares().find(function (x) { return x.tipo === 'petshop'; });
        Reino.Som.tocar('toque'); Reino.Claude.fechar(); UI.fecharTodas();
        focarMapa();   // ela vai andando até a Pet Shop: o foco fica no mapa, não no menu
        if (l) U.emit(EV.IR_PARA, l);
      });
      c.appendChild(el('div.intro-botoes', ir));
      // o aviso já está escrito na tela: só a voz (um balão por cima tapava o "Ir até a Pet Shop")
      Reino.Som.falar(Cu.frases.despensaVazia, { voz: Cu.vozDaFrase('despensaVazia') });
      setTimeout(function () { try { ir.focus({ preventScroll: true }); } catch (e) {} }, 30);
      return;
    }
    c.appendChild(el('p.saldo-estrelas', 'O que ' + P.nomeUni(d.id) + ' vai comer?'));
    var grade = el('div.grade-loja.grade-comidas');
    lista.forEach(function (x) {
      // o bolo ("Enche tudo!") ocupa a linha inteira no celular, como na Pet Shop: "arco-íris" cabe sem quebrar
      var b = el('button.item-loja.item-comida' + (x.comida.enche ? '.comida-larga' : ''), { type: 'button', 'data-comida': x.comida.id, 'aria-label': x.comida.nome + ', ' + textoEnche(x.comida).toLowerCase() + ', ' + x.quantidade + ' na despensa' },
        el('span.item-icone', x.comida.icone), el('b', nomeComida(x.comida.nome)),
        el('span.comida-enche', textoEnche(x.comida)),
        el('span.item-preco', '🧺 ×' + x.quantidade));
      b.addEventListener('click', function () {
        var r = darComida(d.id, x.comida.id);
        if (r.ok) UI.fecharTela(pn.tela);
      });
      grade.appendChild(b);
    });
    c.appendChild(grade);
    // o foco fica na própria tela (UI.abrirTela), e a 1ª comida só pelo Tab: Enter + Enter dava a
    // cenoura sem ela escolher
  }
})();
