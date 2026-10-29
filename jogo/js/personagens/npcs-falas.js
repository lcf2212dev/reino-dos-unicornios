/* NPCs: falas padrão, números por extenso, frases e páginas do balão, o convite conforme o
   progresso, tudo o que o NPC pode dizer (para gravar as vozes) e os chips da sala.
   API: N.extenso, N.frases, N.paginar, N.falasPossiveis, N.chips. Ver npcs.js. */
(function () {
  var Reino = window.Reino;
  var N = Reino.NPCs, _n = Reino._npcs;
  var P = _n.P, materiaDe = _n.materiaDe, salaDe = _n.salaDe, raroDaSala = _n.raroDaSala, materiaDoLugar = _n.materiaDoLugar;


  /* ================= FALAS ================= */
  function U() { return Reino.util; }
  // {nome} e o gênero ({campeã|campeão}) de quem joga: Reino.Genero (sistemas/genero.js)
  function nomeJogadora(t) { return Reino.Genero.texto(t); }
  function robux(v) { return U().robux(v); }

  // falas padrão (curtas: até ~30 letras por balão, que no celular dá 2 linhas)
  var PADRAO = {
    sala: {
      nova: ['Sala novinha! Leia com calma. 📖'],
      feita: ['Quer jogar esta sala de novo? 🔁'],
      depois: ['Que orgulho de você! ✨', 'Leu com calma até o fim! 💛'],
    },
    treino: {
      oi: ['Oi! Eu cuido do treino. 🥇'],
      nova: ['Vamos treinar, sem pressa? 🥇'],
      feita: ['Quer treinar de novo? 🥇'],
      bloqueada: ['Primeiro, termine as salas. 🔒'],
      depois: ['Revisou tudo? Coisa de {campeã|campeão}! 🏆'],
    },
    prova: {
      oi: ['Oi! Eu cuido desta prova. 📝'],
      nova: ['Vamos fazer a prova com calma? 📝'],
      feita: ['Prêmio ganho! Vamos treinar? ✏️'],
      depois: ['Muito bem! Tudo com calma! 💛'],
    },
    guia: {
      oi: ['Oi! Que bom te ver por aqui! 😄'],
      nova: ['Quer ver a lista? 📋'],
    },
    tela: {
      oi: ['Oi! Que bom te ver por aqui! 😄'],
      depois: ['Até logo! Volte sempre! 💛'],
      nova: {
        estabulo: 'Quer ver seus unicórnios? 🦄', loja: 'Quer ver os enfeites da loja? ⭐', bau: 'Quer ver os seus Robux? 💰',
        plano: 'Quer ler o Plano da Prova? 📜', ovos: 'Vamos chocar os ovinhos? 🥚', livro: 'Quer ler o livro? 📖',
      },
    },
  };
  var SAIU = 'Tudo bem, volte quando quiser! 💛';
  var OVOS = 'Tem ovinho para chocar! 🥚';
  // raro da sala: tudo certo de primeira E com calma, OU jogar a sala 3 vezes
  var CALMA = 'Ou de primeira, com calma! 🌙';
  var RARO_JA = 'O raro desta sala já nasceu! 💙';
  var VALE = {
    lendario: 'Agora vale um prêmio lendário! 🌈',
    raro: 'Agora vale um prêmio raro! 💙',
    comum: 'Agora vale um prêmio comum! 🤍',
  };
  // épicos do treino: ouro (ou 3 treinos) e nota dez (ou 5 treinos)
  var OU_EPICO = { ouro: 'Ou tire ouro, com calma! 🥇', perfeito: 'Ou acerte as dez, com calma!' };
  // números por extenso (a voz lê "2 salas" como "dois salas"); acima de 20, algarismos
  var EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze',
    'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte'];
  function extenso(n, fem) {
    if (n < 0 || n > 20 || n !== Math.floor(n)) return String(n);
    if (fem && n === 1) return 'uma';
    if (fem && n === 2) return 'duas';
    return EXTENSO[n];
  }
  N.extenso = extenso;
  function faltamSalas(n) { return n === 1 ? 'Falta só uma sala! 💪' : 'Faltam ' + extenso(n, true) + ' salas! 💪'; }
  function dicaRaro(n) { return n === 1 ? 'Mais uma vez e o raro nasce! 💙' : 'Faltam ' + extenso(n, true) + ' vezes pro raro! 💙'; }
  function dicaEpico(n) { return n === 1 ? 'Falta um treino para o épico!' : 'Mais ' + extenso(n) + ' treinos pro épico!'; }
  function resumoFeitas(n, total) {
    return n === total ? 'Você fez as ' + extenso(total, true) + ' salas! 🎉' : 'Já fez ' + extenso(n, true) + ' de ' + extenso(total, true) + ' salas.';
  }
  function resumoDinheiro(v) { return 'Já ganhou ' + robux(v) + '! 💰'; }
  function resumoProxima(m, s, primeira) {
    // sala de livro (4º bimestre): as estações não têm número, a fala diz o nome da sala
    if (s.ordem === 'livro') return (primeira ? 'A primeira é ' : 'Agora vamos para ') + '"' + s.nome + '"! ' + (s.emoji || '');
    return (primeira ? 'A primeira é a Sala ' : 'Agora vamos para a Sala ') + (m.salas.indexOf(s) + 1) + '! ' + (s.emoji || '');
  }
  var RESUMO_ZERO = 'Você ainda não fez salas.';
  var RESUMO_FIM = 'O treino do Castelo já abriu! 🥇';

  // lista de falas do NPC para um momento (as dele, ou as padrão), prontas para a tela
  function falas(npc, tipo) { return falasCruas(npc, tipo).map(nomeJogadora); }
  // as mesmas, ainda com {nome} e os marcadores de gênero (a gravação leva as duas versões)
  function falasCruas(npc, tipo) {
    var l = (npc.falas && npc.falas[tipo]) || [];
    if (l.length) return l.slice();
    var a = npc.acao || {};
    if (tipo === 'oi' && a.tipo === 'sala') { var s = salaDe(a); return s ? [s.intro] : []; }
    var pad = PADRAO[a.tipo] || PADRAO.guia;
    if (tipo === 'nova' && a.tipo === 'tela') return [pad.nova[a.tela] || PADRAO.tela.nova.estabulo];
    if (tipo === 'saiu') return [SAIU];
    return (pad[tipo] || (tipo === 'oi' ? PADRAO.guia.oi : [])).slice();
  }
  function uma(npc, tipo) { var l = falas(npc, tipo); return l.length ? U().sortear(l) : ''; }

  function nomeLivro(m) { return (Reino.UI && Reino.UI.nomeLivro) ? Reino.UI.nomeLivro(m) : (m.nomeLivro || 'Livro das Memórias'); }

  // dois limites (arte.md §17.5). LIMITE: o da frase (frases(), e o corte de frase longa só na tela em
  // npcs-conversa.js); é o que define o texto falado e as vozes gravadas: não mude. LIMITE_PAGINA: o paginar junta
  // frases numa página até aqui, o que cabe em 2 linhas do celular (letra de 16 px, retrato de 4 px: 16 letras por
  // linha; medido com todas as falas dos NPCs, 24 junta sem passar de 2 linhas). A última página leva os botões
  var LIMITE = 30, LIMITE_PAGINA = 24;
  // divide um texto em frases (o emoji fica com a frase dele); frase longa demais
  // ainda é cortada nos dois-pontos / ponto e vírgula. Cada frase é um segmento gravado.
  // O fim do texto também fecha frase (senão o emoji final virava um pedaço sozinho e sumia).
  var RE_FRASE = /([.!?…]+[»"”)]*(?:\s*[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]+)*)(?:\s+|$)/gu;
  function frases(t) {
    t = String(t || '').trim();
    var out = [], ult = 0, m;
    RE_FRASE.lastIndex = 0;
    while ((m = RE_FRASE.exec(t))) { out.push(t.slice(ult, m.index + m[1].length).trim()); ult = RE_FRASE.lastIndex; }
    if (t.slice(ult).trim()) out.push(t.slice(ult).trim());
    var res = [];
    out.forEach(function (f) {
      if (tamanho(f) <= LIMITE || !/[:;]\s/.test(f)) { res.push(f); return; }
      f.replace(/([:;])\s+/g, '$1\n').split('\n').forEach(function (p) { if (p.trim()) res.push(p.trim()); });
    });
    return res.filter(function (f) { return /[\p{L}\p{N}]/u.test(f); });
  }
  N.frases = frases;
  // lista de textos → páginas (cada texto vira frases; frases curtas juntam até LIMITE_PAGINA; a frase sozinha maior
  // fica inteira na página dela: partir mudaria a voz)
  function paginas(textos) { return paginar([].concat.apply([], (textos || []).map(frases))); }
  function tamanho(t) { return String(t).replace(/[«»]/g, '').replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').trim().length; }
  function paginar(segs) {
    var pags = [], atual = [], n = 0;
    segs.filter(Boolean).forEach(function (sg) {
      var t = tamanho(sg);
      if (atual.length && n + 1 + t > LIMITE_PAGINA) { pags.push(atual); atual = []; n = 0; }
      atual.push(sg); n += (n ? 1 : 0) + t;
    });
    if (atual.length) pags.push(atual);
    return pags;
  }
  N.paginar = paginar;

  var VAMOS = [{ texto: 'Vamos! ✨', valor: 'vamos', principal: true }, { texto: 'Agora não', valor: 'nao' }];

  // o convite conforme o estado atual → { segs, botoes, extra }
  function convite(npc) {
    var a = npc.acao || {}, p = P(), est = p.estado(), pers = Reino.config.persistencia;
    if (a.tipo === 'sala') {
      var m = materiaDe(a), s = salaDe(a);
      if (!s) return { segs: [uma(npc, 'nova')], botoes: [{ texto: 'Ok', valor: 'ok', principal: true }] };
      var reg = est.salas[s.id] || {};
      if (!reg.feita) return { segs: [uma(npc, 'nova')], botoes: VAMOS, extra: N.chips(npc) };
      // a dica do caminho da persistência vem antes; a pergunta fica junto dos botões
      var segs = [], raro = raroDaSala(m, s);
      if (raro && p.temUni(raro.id)) segs.push(RARO_JA);
      else if (raro) {
        var f = p.faltamPersistencia({ raridade: 'raro', sala: s.id });
        if (f > 0) { segs.push(dicaRaro(f)); segs.push(CALMA); }
      }
      segs.push(uma(npc, 'feita'));
      return { segs: segs, botoes: VAMOS, extra: N.chips(npc) };
    }
    if (a.tipo === 'treino') {
      var mt = materiaDe(a);
      if (!mt) return { segs: [uma(npc, 'nova')], botoes: [{ texto: 'Ok', valor: 'ok', principal: true }] };
      if (!p.materiaCompleta(mt)) {
        return { segs: [uma(npc, 'bloqueada'), faltamSalas(mt.salas.length - p.salasFeitas(mt))], botoes: [{ texto: 'Ok', valor: 'ok', principal: true }] };
      }
      var t = est.treinos[mt.id] || {};
      if (!t.melhor) return { segs: [uma(npc, 'nova')], botoes: VAMOS };
      var sg = [];
      var dica = null;
      ['ouro', 'perfeito'].forEach(function (tipo) {
        if (dica) return;
        var ep = (mt.unicornios || []).find(function (u) { return u.raridade === 'epico' && u.treino === tipo; });
        if (!ep || p.temUni(ep.id)) return;
        var n = p.faltamPersistencia({ raridade: 'epico', treino: tipo, materiaId: mt.id });
        if (n > 0) dica = [dicaEpico(n), OU_EPICO[tipo]];
      });
      if (dica) sg = sg.concat(dica);
      sg.push(uma(npc, 'feita'));
      return { segs: sg, botoes: VAMOS };
    }
    if (a.tipo === 'prova') {
      if (!Reino.prova(a.prova)) return { segs: [uma(npc, 'nova')], botoes: [{ texto: 'Ok', valor: 'ok', principal: true }] };
      var v = p.valendoProva(Reino.prova(a.prova));
      if (v) return { segs: [VALE[v], uma(npc, 'nova')], botoes: VAMOS };
      return { segs: [uma(npc, 'feita')], botoes: VAMOS };
    }
    if (a.tipo === 'guia') {
      var mg = materiaDoLugar(a.lugar), bts = [{ texto: 'Ver a lista 📋', valor: 'lista', principal: true }];
      var livro = a.livro ? Reino.materia(a.livro) : mg;
      if (livro && livro.livro) bts.push({ texto: '📖 ' + nomeLivro(livro), valor: 'livro' });
      bts.push({ texto: 'Agora não', valor: 'nao' });
      if (!mg) return { segs: [uma(npc, 'nova')], botoes: bts };
      var feitas = p.salasFeitas(mg), total = mg.salas.length;
      if (!total) return { segs: [uma(npc, 'nova')], botoes: bts };
      var prox = mg.salas.find(function (s2) { return !(est.salas[s2.id] && est.salas[s2.id].feita); });
      var r;
      if (feitas === 0) r = [RESUMO_ZERO, resumoProxima(mg, prox, true)];
      else if (feitas === total) r = [resumoFeitas(total, total), resumoDinheiro(p.dinheiroMateria(mg)), RESUMO_FIM];
      else r = [resumoFeitas(feitas, total), resumoDinheiro(p.dinheiroMateria(mg)), resumoProxima(mg, prox, false)];
      return { segs: r, botoes: bts };
    }
    // tela
    var sgt = [uma(npc, 'nova')];
    if ((a.tela === 'estabulo') && p.ovosParaChocar().length) sgt.unshift(OVOS);
    return { segs: sgt, botoes: VAMOS };
  }

  // tudo o que o NPC pode dizer (para gravar as vozes), com os números enumerados
  N.falasPossiveis = function (npc, def) {
    if (Reino.Bimestres.acaoEmEspera(npc.acao)) return [{ texto: Reino.Bimestres.aviso, voz: npc.voz || 'narradora' }];
    var out = [], a = npc.acao || {}, voz = npc.voz || 'narradora', pers = Reino.config.persistencia;
    // mesmos segmentos que o balão fala: cada texto dividido em frases
    function add(t) { frases(t).forEach(function (f) { if (!out.some(function (o) { return o.texto === f; })) out.push({ texto: f, voz: voz }); }); }
    ['oi', 'nova', 'feita', 'bloqueada', 'depois'].forEach(function (tipo) {
      falasCruas(npc, tipo).forEach(function (t) { Reino.Genero.versoes(t).forEach(add); });
    });
    if (a.tipo === 'sala' || a.tipo === 'treino' || a.tipo === 'prova') add(SAIU);
    if (a.tipo === 'sala') {
      var m = materiaDe(a), s = salaDe(a);
      if (m && s && raroDaSala(m, s)) {
        for (var n = 1; n <= pers.sala; n++) add(dicaRaro(n));
        add(CALMA); add(RARO_JA);
      }
    }
    if (a.tipo === 'treino') {
      var mt = materiaDe(a);
      if (mt) {
        for (var f = 1; f <= mt.salas.length; f++) add(faltamSalas(f));
        (mt.unicornios || []).forEach(function (u) {
          if (u.raridade !== 'epico' || !u.treino) return;
          var max = u.treino === 'ouro' ? pers.treinoOuro : pers.treinoPerfeito;
          for (var k = 1; k <= max; k++) add(dicaEpico(k));
          add(OU_EPICO[u.treino]);
        });
      }
    }
    if (a.tipo === 'prova') Object.keys(VALE).forEach(function (k) { add(VALE[k]); });
    if (a.tipo === 'guia') {
      var mg = materiaDoLugar(a.lugar);
      if (mg) {
        // os Robux do balão (P.dinheiroMateria) com i salas feitas: a sala redonda e, na última, o bônus
        var total = mg.salas.length, vSala = P().valorSala(mg), vBonus = P().bonusMateria(mg);
        add(RESUMO_ZERO); add(RESUMO_FIM);
        for (var i = 1; i <= total; i++) { add(resumoFeitas(i, total)); add(resumoDinheiro(vSala * i + (i === total ? vBonus : 0))); }
        mg.salas.forEach(function (s2, j) { if (j === 0) add(resumoProxima(mg, s2, true)); add(resumoProxima(mg, s2, false)); });
      }
    }
    if (a.tipo === 'tela' && a.tela === 'estabulo') add(OVOS);
    return out;
  };

  /* ---------- chips da sala (iguais aos da tela da matéria) ---------- */
  N.chips = function (npc) {
    if (Reino.Bimestres.acaoEmEspera(npc.acao)) return null;
    var a = npc.acao || {};
    if (a.tipo !== 'sala') return null;
    var m = materiaDe(a), s = salaDe(a);
    if (!s) return null;
    var el = U().el, p = P(), reg = p.estado().salas[s.id] || {}, raro = raroDaSala(m, s);
    return el('span.sala-chips',
      el('span.chip-mini', '💰 ' + U().robuxNumero(p.valorSala(m))),   // o 💰 é o símbolo do Robux
      reg.feita ? el('span.chip-mini.ok', '✓ Feita') : el('span.chip-mini.nova', 'Nova!'),
      raro && p.temUni(raro.id) ? el('span.chip-mini.raro', '💙 Raro') : null,
      reg.calma ? el('span.chip-mini.calma', '🌙 Calma') : null);
  };

  _n.U = U; _n.PADRAO = PADRAO; _n.LIMITE = LIMITE; _n.LIMITE_PAGINA = LIMITE_PAGINA; _n.tamanho = tamanho; _n.frases = frases;
  _n.paginas = paginas; _n.falas = falas; _n.uma = uma; _n.convite = convite;
})();
