/* NPCs: baias dos unicórnios, telas e ações de outros módulos (N.registrarTela, N.registrarAcao),
   N.executar (sala, treino, prova, telas, ações, unicórnio, guia) e a conversa no balão (N.interagir).
   Ver npcs.js. */
(function () {
  var Reino = window.Reino;
  var N = Reino.NPCs, _n = Reino._npcs;
  var P = _n.P, materiaDe = _n.materiaDe, salaDe = _n.salaDe, materiaDoLugar = _n.materiaDoLugar;
  var U = _n.U, PADRAO = _n.PADRAO, LIMITE = _n.LIMITE, tamanho = _n.tamanho, paginas = _n.paginas,
    falas = _n.falas, uma = _n.uma, convite = _n.convite;


  /* ================= AÇÕES ================= */
  function contarTelas() { return document.querySelectorAll('#telas > .tela').length; }
  // abre uma tela e resolve quando ela (e o que abriu por cima) fechar
  function esperarTela(abrir) {
    var antes = contarTelas();
    try { abrir(); } catch (e) { console.error(e); return Promise.resolve(null); }
    var aberta = contarTelas();
    if (aberta <= antes) return Promise.resolve(null);
    return new Promise(function (resolver) {
      var fechada = 0;
      var timer = setInterval(function () {
        // duas conferências seguidas: telas que fecham e reabrem na hora não contam
        fechada = contarTelas() < aberta ? fechada + 1 : 0;
        if (fechada >= 2) { clearInterval(timer); resolver(null); }
      }, 150);
    });
  }
  function fimDaAtividade(resolver) {
    return function (premios) { U().emit(Reino.EVENTOS.MAPA_MUDOU); resolver(premios || null); };
  }

  // texto já gravado inteiro (frase do unicórnio): as páginas aparecem na tela uma de cada vez,
  // mas a voz fala o texto INTEIRO na 1ª página (é o que está gravado); as outras ficam em silêncio.
  var OK = [{ texto: 'Ok! 👍', valor: 'ok', principal: true }];
  // só para a TELA: frase longa sem ponto quebra nas vírgulas ou entre palavras (a voz não muda)
  function quebrarNaTela(t) {
    if (tamanho(t) <= LIMITE) return [t];
    var partes = t.split(/(,\s+)/).reduce(function (acc, p, i) { if (i % 2) acc[acc.length - 1] += p.trim(); else acc.push(p); return acc; }, []);
    if (partes.length === 1) {
      // sem vírgula: corta entre palavras perto do meio (as duas metades ficam parecidas)
      var pal = t.split(/\s+/), melhor = 1, pior = Infinity;
      // uma "palavra" só, maior que a página: corta em pedaços do tamanho da página (senão recursa sem fim)
      if (pal.length === 1) {
        var letras = Array.from(t), ped = [];
        for (var c = 0; c < letras.length; c += LIMITE) ped.push(letras.slice(c, c + LIMITE).join(''));
        return ped;
      }
      for (var k = 1; k < pal.length; k++) {
        var m = Math.max(tamanho(pal.slice(0, k).join(' ')), tamanho(pal.slice(k).join(' ')));
        if (m < pior) { pior = m; melhor = k; }
      }
      return [].concat(quebrarNaTela(pal.slice(0, melhor).join(' ')), quebrarNaTela(pal.slice(melhor).join(' ')));
    }
    var out = [], atual = '';
    partes.forEach(function (p) {
      var junto = atual ? atual + ' ' + p : p;
      if (atual && tamanho(junto) > LIMITE) { out.push(atual); atual = p; } else atual = junto;
    });
    if (atual) out.push(atual);
    // se ainda sobrou pedaço longo (vírgulas), quebra esse entre palavras
    return [].concat.apply([], out.map(function (o) { return tamanho(o) > LIMITE && /,/.test(t) && o !== t ? quebrarNaTela(o.replace(/,\s*$/, ',')) : [o]; }));
  }
  function falarPaginado(texto, quem) {
    var pags = [].concat.apply([], paginas([texto]).map(function (pg) { return quebrarNaTela(pg.join(' ')).map(function (x) { return [x]; }); })), i = 0;
    if (!pags.length) pags = [[texto]];
    function prox(v) {
      if (v === null || v === undefined) return null;
      var pg = pags[i], ultima = i === pags.length - 1, op = { quem: quem, modal: true, voz: quem.voz,
        botoes: ultima ? OK : [{ texto: 'Continuar →', valor: 'ok', principal: true }] };
      if (i === 0) op.fala = [texto]; else op.falar = false;
      i++;
      var r = Reino.Claude.falar(pg.join(' '), op);
      return ultima ? r : r.then(prox);
    }
    return prox('ok');
  }

  N.BAIA_VAZIA = 'Aqui vai morar um amigo novo! 🦄';
  // baia fixa: a baia n é sempre do n-ésimo unicórnio do álbum; vazia (null) até ele nascer
  N.unicornioDaBaia = function (n) {
    var est = P().estado(), d = Reino.Unicornios.todos(est.corInicial)[n];
    return d && est.unis[d.id] && est.unis[d.id].chocado ? d : null;
  };
  // unicórnios já chocados, na ordem do álbum do Estábulo
  N.unicorniosChocados = function () {
    var est = P().estado();
    return Reino.Unicornios.todos(est.corInicial).filter(function (d) { return est.unis[d.id] && est.unis[d.id].chocado; });
  };

  /* telas e ações de outros módulos (Pet Shop, Observatório):
     registrarTela('petshop', abrir(acao, ctx), 'Quer ver as comidinhas? 🥕') — abre uma tela do DOM;
       o NPC espera ela fechar e se despede; o texto é o convite padrão de NPC com essa tela.
     registrarAcao('beber', fn(acao, ctx) → Promise) — ação de objeto ou NPC ({ tipo: 'beber' }).
     Um sistema (carrega antes dos NPCs) declara as suas no def do módulo: acoes: { tipo: fn } (nucleo/modulos.js). */
  var TELAS = {}, ACOES = {};
  N.registrarTela = function (nome, abrir, convite) { TELAS[nome] = abrir; if (convite) PADRAO.tela.nova[nome] = convite; };
  N.registrarAcao = function (tipo, fn) { ACOES[tipo] = fn; };
  N.telas = function () { return Object.keys(TELAS); };
  // as de registrarAcao e depois as dos módulos (a de registrarAcao ganha, se o tipo repetir)
  function acaoDeModulo(tipo) {
    var m = (Reino.modulos || []).find(function (d) { return d.acoes && Object.prototype.hasOwnProperty.call(d.acoes, tipo); });
    return m ? m.acoes[tipo] : null;
  }
  N.acoes = function () {
    var l = Object.keys(ACOES);
    (Reino.modulos || []).forEach(function (m) { Object.keys(m.acoes || {}).forEach(function (k) { if (l.indexOf(k) < 0) l.push(k); }); });
    return l;
  };

  N.executar = function (acao, ctx) {
    acao = acao || {};
    var UI = Reino.UI, p = P();
    if (acao.tipo === 'sala') {
      var m = materiaDe(acao), s = salaDe(acao);
      if (!s) return Promise.resolve(null);
      Reino.Som.tocar('porta');
      return new Promise(function (res) { Reino.Missao.iniciar(m, s, fimDaAtividade(res)); });
    }
    if (acao.tipo === 'treino') {
      var mt = materiaDe(acao);
      if (!mt) return Promise.resolve(null);
      if (!p.materiaCompleta(mt)) {
        Reino.Claude.falar(Reino.Falas.treinoBloqueado(mt, mt.salas.length - p.salasFeitas(mt)));
        return Promise.resolve(null);
      }
      Reino.Som.tocar('porta');
      return new Promise(function (res) { Reino.Prova.iniciar(mt, fimDaAtividade(res)); });
    }
    if (acao.tipo === 'prova') {
      var pv = Reino.prova(acao.prova);
      if (!pv) return Promise.resolve(null);
      Reino.Som.tocar('porta');
      return new Promise(function (res) { Reino.Provas.iniciar(pv, fimDaAtividade(res)); });
    }
    if (acao.tipo === 'tela') {
      var fim = function (r) { U().emit(Reino.EVENTOS.MAPA_MUDOU); return r || null; };
      switch (acao.tela) {
        case 'ovos': return UI.chocarOvos(p.ovosParaChocar()).then(fim);
        case 'livro': var ml = Reino.materia(acao.materia); return ml ? esperarTela(function () { UI.abrirLivro(ml); }).then(fim) : Promise.resolve(null);
        case 'plano': return esperarTela(UI.telaPlano).then(fim);
        case 'loja': return esperarTela(UI.telaLoja).then(fim);
        case 'estabulo': return esperarTela(UI.telaEstabulo).then(fim);
        case 'bau': return esperarTela(UI.telaBau).then(fim);
      }
      if (TELAS[acao.tela]) return esperarTela(function () { TELAS[acao.tela](acao, ctx); }).then(fim);
      return Promise.resolve(null);
    }
    var fnAcao = ACOES[acao.tipo] || acaoDeModulo(acao.tipo);
    if (fnAcao) {
      try { return Promise.resolve(fnAcao(acao, ctx || {})).catch(function (e) { console.error(e); return null; }); }
      catch (e) { console.error(e); return Promise.resolve(null); }
    }
    if (acao.tipo === 'unicornio') {
      // o unicórnio da baia diz a frase que já está gravada (o nome que ela deu só aparece na tela)
      var du = N.unicornioDaBaia(acao.indice || 0);
      if (!du) return falarPaginado(N.BAIA_VAZIA, { nome: 'Baia', voz: 'narradora' });
      var uu = p.estado().unis[du.id];
      var spr = PA.unicornio(du, Reino.Unicornios.estagio(uu ? uu.xp : 0), 0).canvas;
      Reino.Som.tocar('selecionar');
      return falarPaginado(du.frase, { nome: p.nomeUni(du.id), retrato: spr, voz: 'unicornio' });
    }
    if (acao.tipo === 'guia') {
      var mg = materiaDoLugar(acao.lugar);
      if (mg) return esperarTela(function () { UI.telaMateria(mg); });
      if (acao.lugar === 'castelo') return esperarTela(UI.telaCastelo);
      if (acao.lugar === 'escola') return esperarTela(Reino.Provas.telaEscola);
    }
    return Promise.resolve(null);
  };

  /* ================= CONVERSA ================= */
  var conversou = {};     // quem já se apresentou nesta sessão (só na memória, nada no save)
  var semVoz = {};        // quantas vezes a apresentação saiu sem voz (pacote ainda vindo)
  var MAX_SEM_VOZ = 3;    // depois disso não insiste mais (pacote que não vem nunca)
  var emConversa = null;

  function apresentacaoComVoz(npc, pags) {
    var V = Reino.Voz, est = Reino.Progresso && Reino.Progresso.estado();
    semVoz[npc.id] = semVoz[npc.id] || 0;
    if (!V || !V.tem || (est && est.ajustes && est.ajustes.voz === false)) return true;   // voz desligada: nada a esperar
    return pags.every(function (segs) {
      return segs.filter(Boolean).every(function (t) { return V.tem(npc.voz || 'claude', t); });
    });
  }

  N.interagir = function (npc, ctx) {
    if (emConversa) return emConversa;
    var a = npc.acao || {};
    var quem = { nome: npc.nome, retrato: [N.retrato(npc, 0), N.retrato(npc, 1)], voz: npc.voz };
    function balao(segs, op) {
      segs = segs.filter(Boolean);
      return Reino.Claude.falar(segs.join(' '), Object.assign({ quem: quem, fala: segs, modal: true, voz: npc.voz }, op || {}));
    }
    var CONTINUAR = { botoes: [{ texto: 'Continuar →', valor: 'ok', principal: true }] };
    // mostra as páginas em sequência com "Continuar →"; para se o balão for limpo
    function emSequencia(pags) {
      var i = 0;
      function prox(v) {
        if (v === null || v === undefined || i >= pags.length) return v;
        return balao(pags[i++], CONTINUAR).then(prox);
      }
      return prox('ok');
    }
    var seq = Promise.resolve('ok');
    if (!conversou[npc.id]) {
      // a apresentação inteira (todas as falas de `oi`, na ordem), cada uma em sua(s) página(s)
      var pagsOi = [].concat.apply([], falas(npc, 'oi').map(function (t) { return paginas([t]); }));
      // só conta como apresentada se ela ouviu tudo com voz; se o pacote de voz ainda está
      // chegando (Wi-Fi fraco), na próxima conversa a apresentação volta, já com voz
      if (apresentacaoComVoz(npc, pagsOi) || ++semVoz[npc.id] >= MAX_SEM_VOZ) conversou[npc.id] = true;
      seq = emSequencia(pagsOi);
    }
    emConversa = seq.then(function (v) {
      if (v === null || v === undefined) return null;     // balão limpo no meio: não segue
      var c = convite(npc), pags = paginas(c.segs), i = 0;
      // páginas do meio com "Continuar →"; a última com os botões e os chips
      function proxima(v2) {
        if (v2 === null || v2 === undefined) return null;
        var ultima = i === pags.length - 1, pg = pags[i++];
        if (ultima) return balao(pg, { botoes: c.botoes, extra: c.extra || null });
        return balao(pg, { botoes: [{ texto: 'Continuar →', valor: 'ok', principal: true }] }).then(proxima);
      }
      return proxima('ok');
    }).then(function (v) {
      if (v === 'livro') {
        var ml = a.livro ? Reino.materia(a.livro) : materiaDoLugar(a.lugar);
        return N.executar({ tipo: 'tela', tela: 'livro', materia: ml && ml.id });
      }
      // a ação sabe quem a chamou (ex.: a curiosidade contada com o retrato e a voz da Doutora Vega)
      ctx = Object.assign({ npc: npc, quem: quem }, ctx || {});
      if (v === 'lista') return N.executar(a, ctx);
      if (v !== 'vamos') return null;
      var atividade = a.tipo === 'sala' || a.tipo === 'treino' || a.tipo === 'prova';
      return N.executar(a, ctx).then(function (premios) {
        if (a.tipo === 'tela') {
          // na Pet Shop, sem ter comprado nem dado nada, a Dona Aveia não se despede ("Bom apetite!" sem comida)
          var visita = a.tela === 'petshop' && Reino.UI && Reino.UI.visitaPetShop;
          if (visita && !visita.comprou && !visita.deu) return premios;
          // a tela aberta pelo NPC fechou: ele se despede (balão simples, fecha sozinho)
          paginas([uma(npc, 'depois')]).forEach(function (pg) { Reino.Claude.falar(pg.join(' '), { quem: quem, fala: pg, voz: npc.voz, tempo: 5000 }); });
          return premios;
        }
        // ação que termina no "Tchau! 💛" (curiosidade da Vega, piada do Cosmo): ele se despede
        if (premios === 'tchau') {
          paginas([uma(npc, 'depois')]).forEach(function (pg) { Reino.Claude.falar(pg.join(' '), { quem: quem, fala: pg, voz: npc.voz, tempo: 5000 }); });
          return premios;
        }
        if (!atividade) return premios;
        if (premios) {
          paginas([uma(npc, 'depois')]).forEach(function (pg) { Reino.Claude.falar(pg.join(' '), { quem: quem, fala: pg, voz: npc.voz }); });
          if (a.tipo === 'sala') Reino.Claude.depoisDaMissao();
        } else {
          paginas([uma(npc, 'saiu')]).forEach(function (pg) { Reino.Claude.falar(pg.join(' '), { quem: quem, fala: pg, voz: npc.voz, tempo: 5000 }); });
        }
        return premios;
      });
    }).catch(function (e) { console.error(e); return null; }).then(function (r) { emConversa = null; return r; });
    return emConversa;
  };
})();
