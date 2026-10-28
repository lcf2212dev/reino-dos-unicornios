/* Missão por etapas (docs/contratos/quarto-bimestre.md §13.3 e §14): a parte da missão (missao.js) que é só da sala
   de livro. Registra no objeto interno Reino._missao (criado por missao.js), cada função com a `api` da missão aberta:
     trilha(api)                   a intro da sala: uma bolinha por etapa (✓ feita, ⭐ sem erro, ▶ a próxima), "Etapa N
                                   de M", "⭐ X de M" e quanto falta para o prêmio lendário; "Começar ▶" abre a escolhida
     fimEtapa(api, r)              etapa guardada (não a última): "Próxima etapa ▶" e "Descansar 🌿"
     festaTrilha(api, premio, dep) a festa da trilha perfeita (3 cartões); dep: o fim da sala que vem depois
     fechaASala(api)  soma(sala)   a etapa aberta fecha a rodada? / acertos { a, t } da rodada que fechou
   E o prêmio retroativo: ouve EVENTOS.TRILHA_PERFEITA e mostra a mesma festa quando ela está na Casa das Palavras,
   uma vez por sala na sessão (o evento só sai uma vez por sala: na próxima sessão não volta). */
(function () {
  var U = Reino.util, el = U.el, EV = Reino.EVENTOS;
  var ME = Reino._missao;
  // o que a missão fala aqui (o mesmo texto em Reino.Falas.fixas grava a voz: a voz acha pelo texto)
  var FALAS = {
    guardada: 'Sua etapa ficou guardada!', semErro: 'Tudo certo de primeira!', depois: 'Depois você tenta sem errar!',
    seguir: 'Vamos seguir ou descansar?',
    descansar: ['Tudo ficou guardado.', 'Vá ao Cantinho do Respiro.', 'Ele fica no primeiro andar.'],
    festa: ['Você fez a trilha sem errar!', 'Você ganhou três prêmios!'],
  };
  var CASA = ['portugues', 'portugues-1'];   // as cenas da Casa das Palavras (térreo e 1º andar)

  function tem(l, n) { return l.indexOf(n) >= 0; }
  // a etapa que o "Começar" abre: a 1ª sem ✓ e sem ⭐; depois a 1ª sem ✓ (proxima); rodada toda feita (fechada sem
  // contar, de dois aparelhos): a 1ª sem ⭐, ou a 1ª
  function alvoDe(est) {
    var n;
    for (n = 0; n < est.total; n++) if (!tem(est.feitas, n) && !tem(est.perfeitas, n)) return n;
    if (est.proxima !== null) return est.proxima;
    for (n = 0; n < est.total; n++) if (!tem(est.perfeitas, n)) return n;
    return 0;
  }
  // ✓ = feita nesta rodada, ou a sala já feita (jogar de novo é por etapas)
  function feita(est, n) { return tem(est.feitas, n) || est.salaFeita; }
  function icone(premio, px) {
    var d = premio && window.PA && PA.iconeDesenho ? PA.iconeDesenho('acessorio:' + premio.acessorio.id) : null;
    return d ? PA.paraDOM(d, PA.escalaNitida(px, 16), 'icone-acessorio') : null;
  }

  ME.fechaASala = function (api) {
    var est = Reino.Etapas.estado(api.materia, api.sala), n = api.etapa();
    return !!est && est.feitas.filter(function (k) { return k !== n; }).length === est.total - 1;
  };
  ME.soma = function (sala) {
    var reg = (Reino.Progresso.estado().etapas || {})[sala.id], s = { a: 0, t: 0 };
    Object.keys((reg && reg.feitas) || {}).forEach(function (k) { s.a += reg.feitas[k].a; s.t += reg.feitas[k].t; });
    return s;
  };

  /* ---------- a trilha (as bolinhas) ---------- */
  // aoEscolher(n): bolinhas tocáveis (a feita, a ⭐ e a próxima; numa sala já feita, todas); sem ele, só o desenho
  function bolinhas(est, alvo, aoEscolher) {
    var lista = el('ol.etapas-trilha', { 'aria-label': 'Etapas da sala' });
    for (var n = 0; n < est.total; n++) {
      var p = tem(est.perfeitas, n), f = feita(est, n), prox = n === alvo, pode = !!aoEscolher && (f || p || prox);
      var cls = (p ? '.perfeita' : f ? '.feita' : prox ? '.proxima' : '.apagada') + (prox ? '.escolhida' : '');
      var rot = 'Etapa ' + (n + 1) + (p ? ', sem erro' : f ? ', feita' : prox ? ', a próxima' : '');
      var marca = p ? '⭐' : f ? '✓' : prox ? '▶' : String(n + 1);
      var b = aoEscolher ? el('button.etapa-bolinha' + cls, { type: 'button', 'aria-label': rot, 'aria-pressed': prox ? 'true' : 'false',
        'aria-disabled': pode ? null : 'true', 'data-etapa': n }, marca) : el('span.etapa-bolinha' + cls, marca);
      if (aoEscolher) b.addEventListener('click', escolher.bind(null, b, n, pode, aoEscolher));
      lista.appendChild(el('li', aoEscolher ? null : { 'aria-label': rot }, b));
    }
    return lista;
  }
  function escolher(b, n, pode, aoEscolher) {
    if (!pode) { Reino.Som.tocar('toque'); if (Reino._ui && Reino._ui.toqueIgnorado) Reino._ui.toqueIgnorado(b); return; }
    Reino.Som.tocar('toque');
    Array.prototype.forEach.call(b.closest('.etapas-trilha').querySelectorAll('.etapa-bolinha'), function (x) {
      x.classList.toggle('escolhida', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
    });
    aoEscolher(n);
  }
  // "⭐ X de M" e o prêmio: quanto falta (com o ícone do acessório da sala), ou já ganho
  function linhaEstrelas(est, premio) {
    var x = est.perfeitas.length, falta = est.total - x;
    var txt = est.trilhaPerfeita ? 'Prêmio lendário ganho!' : (falta === 1 ? 'Falta 1 etapa' : 'Faltam ' + falta + ' etapas') + ' para o prêmio lendário!';
    return el('div.etapas-estrelas', el('p.etapas-x', U.colado('⭐ ' + x + ' de ' + est.total + ' sem erro')),
      premio ? el('p.etapas-premio', U.colado(txt), icone(premio, 32)) : null);
  }

  ME.trilha = function (api) {
    var m = api.materia, s = api.sala, est = Reino.Etapas.estado(m, s), alvo = alvoDe(est), premio = Reino.premioTrilha && Reino.premioTrilha(s.id);
    var comecar = el('button.btn-grande.btn-principal', { type: 'button' }, 'Começar ▶');
    var conta = el('p.etapas-conta');
    function rotulo(n) {
      alvo = n;
      U.preencher(conta, 'Etapa ' + (n + 1) + ' de ' + est.total);
      // refazer sem ⭐: "Tentar sem errar ⭐" (no celular, "Sem errar ⭐": o .rotulo-longo some, ui.md §10.20)
      var refazer = feita(est, n) && !tem(est.perfeitas, n);
      comecar.textContent = '';
      comecar.setAttribute('aria-label', refazer ? 'Tentar sem errar' : 'Começar');
      (refazer ? [el('span.rotulo-longo', 'Tentar sem errar'), el('span.rotulo-curto', 'Sem errar'), el('span', ' ⭐')] : [el('span', 'Começar ▶')])
        .forEach(function (x) { comecar.appendChild(x); });
    }
    var trilha = bolinhas(est, alvo, rotulo);
    api.corpo.innerHTML = '';
    api.corpo.appendChild(el('div.intro-sala.intro-etapas',
      el('div.intro-emoji', s.emoji),
      el('h2.titulo-pixel', U.colado(s.nome)),
      el('p.intro-paginas', U.colado(api.livroDaSala() + ': ' + s.paginas)),
      el('div.intro-claude', PA.paraDOM(PA.claude(0), 4, 'claude-intro'), el('p', U.colado(s.intro))),
      el('div.etapas-caixa', conta, trilha, linhaEstrelas(est, premio))));
    rotulo(alvo);
    var falaIntro = [s.nome, s.intro];
    var ouvir = api.botaoOuvir(function () { Reino.UI.ouvirDeNovo(falaIntro, { voz: 'claude' }); });
    api.mostrarAcao('intro-botoes', ouvir ? [ouvir, comecar] : [comecar]);
    api.pintarTrilha('intro');
    comecar.addEventListener('click', function () { api.comecar(alvo); });
    var c0 = api.etapas[alvo].cartas[0], carta0 = c0 && m.livro && m.livro.find(function (c) { return c.id === c0; });
    if (carta0) Reino.Voz.carregar(api.pacoteCarta(carta0));
    // o pacote de voz pode chegar tarde (rede lenta): só fala se a trilha ainda está na tela
    Reino.Voz.carregarSala(m, s).then(function () {
      if (comecar.isConnected) Reino.UI.esperarFala([trilha, comecar, api.sair], falaIntro, { voz: 'claude' });
    });
  };

  /* ---------- fim de uma etapa (não a última) ---------- */
  ME.fimEtapa = function (api, r) {
    var est = Reino.Etapas.estado(api.materia, api.sala), alvo = alvoDe(est);
    var emoji = el('div.fim-emoji', { 'aria-hidden': 'true' }, PA.iconeEmoji(r.perfeita ? '⭐' : '📖', 2));
    var titulo = el('h2.titulo-pixel', 'Etapa guardada! ✨');
    var linha = r.perfeita ? FALAS.semErro : FALAS.depois;
    // no celular (rodapé de ação, ui.md §10.20): "Próxima ▶" e "Descansar" (o .rotulo-longo some)
    var proxima = el('button.btn-grande.btn-principal', { type: 'button', 'aria-label': 'Próxima etapa' }, 'Próxima', el('span.rotulo-longo', ' etapa'), ' ▶');
    var descansar = el('button.btn-grande.btn-secundario', { type: 'button', 'aria-label': 'Descansar' }, 'Descansar', el('span.rotulo-longo', ' 🌿'));
    api.corpo.innerHTML = '';
    api.corpo.appendChild(el('div.fim-sala.fim-etapa', emoji, titulo,
      el('p.etapa-resultado' + (r.perfeita ? '.sem-erro' : ''), U.colado((r.perfeita ? '⭐ ' : '') + linha)),
      el('div.etapas-caixa', el('p.etapas-conta', 'Etapa ' + (api.etapa() + 1) + ' de ' + est.total + ' guardada'), bolinhas(est, alvo, null)),
      el('div.intro-claude', PA.paraDOM(PA.claude(0), 4, 'claude-intro'), el('p', FALAS.seguir))));
    api.mostrarAcao('intro-botoes fim-etapa-botoes', [descansar, proxima]);
    // festa leve (ui.md §10.16, nível 1): o brilho no ícone; a ⭐ ganha toca a estrela
    Reino.UI.festa(1, { item: emoji, som: false });
    Reino.Som.tocar(r.perfeita ? 'estrela' : 'acerto');
    proxima.addEventListener('click', function () { api.comecar(alvo); });
    descansar.addEventListener('click', function () {
      Reino.Som.tocar('toque');
      api.fechar(null);
      Reino.Claude.falar(FALAS.descansar.join(' ') + ' 🌿', { fala: FALAS.descansar });
    });
    api.botaoFim(descansar);   // ✕ = descansar: tudo já está guardado
    Reino.UI.focarTroca(proxima, titulo, api.CALMA);
    Reino.UI.esperarFala([proxima.parentNode, api.sair], [FALAS.guardada, linha, FALAS.seguir], { voz: 'claude' });
  };

  /* ---------- prêmio da trilha perfeita: os 3 cartões ---------- */
  function usando(id) { return Reino.Progresso.estado().usando.enfeites.indexOf(id) >= 0; }
  // veste o acessório como a Loja (um enfeite por encaixe); sem o item na Loja, pela âncora do desenho
  function usar(id) {
    var UI = Reino.UI, LI = Reino.LojaItens;
    if (UI.alternarEnfeite && LI && LI.item(id)) { if (!usando(id)) UI.alternarEnfeite(id); }
    else if (!usando(id)) {
      var u = Reino.Progresso.estado().usando, anc = function (x) { var d = PA.ENFEITES_MONTARIA && PA.ENFEITES_MONTARIA[x]; return d && d.ancora; };
      var a = anc(id);
      u.enfeites = u.enfeites.filter(function (x) { return !a || anc(x) !== a; }).concat([id]);
    }
    Reino.Progresso.salvar();
    U.emit(EV.MAPA_MUDOU);
  }
  function cartoes(premio) {
    var Q = Reino.QUIMICA || {}, a = premio.acessorio;
    var elem = (Q.elementos || []).find(function (e) { return e.z === premio.elemento; });
    var exp = (Q.experiencias || []).find(function (x) { return x.id === premio.experiencia; });
    var lista = el('ul.cartoes-trilha');
    var vestido = el('span.chip-mini.ok', 'Usando ✓');
    var botaoUsar = el('button.btn-grande.btn-secundario.btn-usar', { type: 'button' }, 'Usar agora');
    botaoUsar.addEventListener('click', function () {
      usar(a.id); Reino.Som.tocar('estrela');
      botaoUsar.replaceWith(vestido);
      Reino.UI.festa(1, { som: false, item: vestido });
    });
    lista.appendChild(el('li.cartao-trilha.rar-lendario', el('div.cartao-trilha-desenho', icone(premio, 64)),
      el('b', U.colado(a.nome)), el('small', 'Acessório lendário'), usando(a.id) ? vestido : botaoUsar));
    if (elem) lista.appendChild(el('li.cartao-trilha.rar-lendario', el('div.cartao-trilha-desenho', el('span.elemento-simbolo', el('small', String(elem.z)), elem.simbolo)),
      el('b', U.colado(elem.nome)), el('small', 'Elemento químico')));
    if (exp) {
      var ver = Reino.UI.abrirExperiencias ? el('button.btn-grande.btn-secundario.btn-ver-carta', { type: 'button' }, 'Ver carta') : null;
      if (ver) ver.addEventListener('click', function () { Reino.Som.tocar('toque'); Reino.UI.abrirExperiencias(exp.id); });
      lista.appendChild(el('li.cartao-trilha.rar-lendario', el('div.cartao-trilha-desenho', el('span.cartao-trilha-emoji', exp.emoji)),
        el('b', U.colado(exp.nome)), el('small', 'Carta de experiência'), ver));
    }
    return lista;
  }
  function nomeSala(id) {
    var pr = Reino.premioTrilha(id), m = pr && Reino.materia(pr.materia), s = m && m.salas.find(function (x) { return x.id === id; });
    return s ? s.nome : id;
  }

  // na missão: no lugar da tela de fim da etapa (ou antes da de sala concluída, `depois`)
  ME.festaTrilha = function (api, premio, depois) {
    mostradas[premio.sala] = true;
    pendentes = pendentes.filter(function (x) { return x !== premio.sala; });
    var m = api.materia;
    var emoji = el('div.fim-emoji', { 'aria-hidden': 'true' }, PA.iconeEmoji('🏆', 3));
    var titulo = el('h2.titulo-pixel', 'Trilha perfeita!');
    var btn = el('button.btn-grande.btn-principal', { type: 'button' }, depois ? 'Continuar →' : 'Voltar ' + (m.lugar.artigo === 'a' ? 'à ' : 'ao ') + m.lugar.nome);
    var lista = cartoes(premio);
    api.corpo.innerHTML = '';
    api.corpo.appendChild(el('div.fim-sala.festa-trilha', emoji, titulo, el('p', U.colado('Você fez ' + api.sala.nome + ' sem errar nada!')), lista, btn));
    // escala de festa (ui.md §10.16): maior que a da sala (nível 3)
    Reino.UI.festa(3, { titulo: titulo, emoji: emoji });
    btn.addEventListener('click', function () { Reino.Som.tocar('toque'); if (depois) depois(); else api.fechar(null); });
    api.botaoFim(btn);
    Reino.UI.focarTroca(btn, titulo, api.CALMA);
    Reino.UI.esperarFala([lista, btn, api.sair], FALAS.festa, { voz: 'claude' });
  };

  /* ---------- prêmio retroativo: a festa ao entrar na Casa das Palavras ---------- */
  var pendentes = [], mostradas = {};
  function naCasa() {
    var C = Reino.Cena, c = C && C.atual();
    return !!c && tem(CASA, c.id) && (!C.estado || C.estado() === 'interior');
  }
  function tentar() {
    if (!pendentes.length || !Reino.UI || Reino.UI.temTela() || !naCasa()) return;
    if (Reino.Claude && Reino.Claude.dialogoAberto && Reino.Claude.dialogoAberto()) return;
    var id = pendentes.shift(), premio = Reino.premioTrilha(id);
    mostradas[id] = true;
    if (premio) festaSolta(premio);
  }
  function festaSolta(premio) {
    var UI = Reino.UI, pn = UI.painel('festa-trilha', '🏆 Trilha perfeita!', { estreito: true });
    var lista = cartoes(premio), ok = el('button.btn-grande.btn-principal', { type: 'button' }, 'Que legal! ✨');
    pn.conteudo.appendChild(el('div.festa-trilha.festa-solta', el('p', U.colado('Você fez ' + nomeSala(premio.sala) + ' sem errar nada!')), lista, el('div.intro-botoes', ok)));
    ok.addEventListener('click', function () { Reino.Som.tocar('toque'); Reino.Som.calar(); UI.fecharTela(pn.tela); });
    UI.festa(3, { titulo: pn.card.querySelector('.titulo-pixel') });
    UI.esperarFala([lista, ok], FALAS.festa, { voz: 'claude' });
  }
  U.on(EV.TRILHA_PERFEITA, function (c) {
    if (!c || mostradas[c.sala] || tem(pendentes, c.sala)) return;
    pendentes.push(c.sala);
    setTimeout(tentar, 0);   // dentro da missão, a festa dela tira a sala daqui (ME.festaTrilha)
  });
  // ao entrar na Casa (depois da transição) e quando as telas fecham
  U.on(EV.CENA, function () { setTimeout(tentar, 900); });
  U.on(EV.TRANSICAO, function (indo) { if (!indo) setTimeout(tentar, 300); });
  U.on(EV.TELAS, function (n) { if (!n) setTimeout(tentar, 300); });

  ME.FALAS = FALAS;
})();
