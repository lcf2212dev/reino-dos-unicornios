/* Casa do jogador: os móveis funcionam (Reino.CasaUsos; docs/contratos/casa.md §13). A tabela (o uso de cada
   objeto) está em casa-usos-tabela.js; a animação e as poses (I.animar, I.itens, I.sobre, I.quemDesenha) em
   casa-usos-animar.js e casa-usos-poses-*.js. Estado ligado/aberto só em memória, por uid da peça: nada vai para o
   save (guardar a peça esquece). Comer, beber e o banho usam os campos de cuidados que já existem (Reino.Cuidados).
   Fluxo do usar(obj, ctx):
     alternar/abrir  liga ou desliga (refaz o andar) + som
     efeito          liga por config.casa.usos.efeitoMs e desliga sozinho, com som ou melodia (toque com ele ligado: nada)
     comer/beber     comida (comerEmCasa) ou água (beber) para a montaria + som + frase; sem unicórnio chocado: só o som
     sentar, deitar, banho, chuveiro, cozinhar: "Quem vai?" (def.quem 'ambos' e há unicórnio chocado; 'uni' = só ele)
                     → I.st + I.animar(st) (sem I.animar, no Node: o efeito na hora) → o efeito do fim.
                     banho do unicórnio = Reino.Banho.iniciar (banho de espuma, com as falas dele)
   I = Reino._casaUsos: st = { uso, quem: 'ela'|'uni', obj: { tipo, uid, x, y, w, h, dir }, uniId, montado, curta, dur,
   inicio: 0, comecou: false, fim: false, pulou: false }; esta parte cria e limpa o st, a animação preenche o resto.
   node: true: nada de DOM, Progresso nem Cena no carregamento. */
(function () {
  var R = window.Reino;
  var TABELA = {}, ESTADO = {}, TIMERS = {}, ANDARES = ['casa', 'casa-2'];
  var USOS = ['alternar', 'abrir', 'efeito', 'sentar', 'deitar', 'banho', 'chuveiro', 'cozinhar', 'comer', 'beber', 'enfeite'];
  var DURACAO = { sentar: 'sentarMs', deitar: 'deitarMs', banho: 'banhoMs', chuveiro: 'chuveiroMs', cozinhar: 'cozinharMs' };
  var I = R._casaUsos = { st: null };
  var ultimo = null;   // o resultado do último uso (para os testes)
  var dono = null;     // de quem é o ESTADO: jogador + geração do save (trocar de jogador ou "Apagar tudo" zera)

  function cfg() { return R.config.casa.usos; }
  function tocar(som) { try { if (som && R.Som && R.Som.tocar) R.Som.tocar(som); } catch (e) {} }
  function tocarMelodia(m) {
    var S = R.Som;
    if (!m || !S || !S.notaMusical) return;
    m.forEach(function (n) { setTimeout(function () { try { S.notaMusical(n[0], { duracao: n[2] }); } catch (e) {} }, n[1] * 1000); });
  }

  /* ---------- tabela e estado ---------- */
  function registrar(tipo, def) { TABELA[tipo] = def; }
  function de(tipo) { var d = TABELA[tipo]; return d && d.uso !== 'enfeite' ? d : null; }
  function uso(tipo) { return TABELA[tipo] ? TABELA[tipo].uso : null; }
  function tipos() { return Object.keys(TABELA); }
  function ligado(obj) { return !!(obj && obj.uid && ESTADO[obj.uid]); }
  function donoAgora() {
    var P = R.Progresso, e = P && P.estado && P.estado();
    return e ? (P.jogador ? P.jogador() : '') + '|' + (e.geracao || 1) : null;
  }
  // o save mudou de dono (outro jogador, Apagar tudo): tudo desligado, sem temporizador pendente
  function conferirDono() {
    var d = donoAgora();
    if (d === dono) return;
    dono = d;
    Object.keys(TIMERS).forEach(function (uid) { clearTimeout(TIMERS[uid]); });
    TIMERS = {}; ESTADO = {};
  }
  function ligar(uid, valor, andar) {
    if (!uid) return;
    conferirDono();
    if (valor) ESTADO[uid] = true; else delete ESTADO[uid];
    if (andar && R.Interiores && R.Interiores.refazer) R.Interiores.refazer(andar);
  }
  function esquecer(uid) { clearTimeout(TIMERS[uid]); delete TIMERS[uid]; delete ESTADO[uid]; }

  /* ---------- quem, onde ---------- */
  // a montaria, se for um unicórnio chocado (senão null: só ela usa)
  function uniChocado() {
    var P = R.Progresso, e = P && P.estado && P.estado(), id = e && P.montaria ? P.montaria() : null;
    return id && e.unis && e.unis[id] && e.unis[id].chocado ? id : null;
  }
  function nomeUni(id) { try { return R.Progresso.nomeUni(id) || 'Unicórnio'; } catch (e) { return 'Unicórnio'; } }
  function animacoesLigadas() {
    var e = R.Progresso && R.Progresso.estado && R.Progresso.estado();
    return !!(e && e.ajustes && e.ajustes.animacoes !== false) && !(R.util && R.util.reduzMovimentoSistema);
  }
  // a peça (com uid) nos andares da casa e o andar dela
  function acharPeca(uid) {
    for (var i = 0; uid && R.Casa && i < ANDARES.length; i++) {
      var o = R.Casa.objetosDoAndar(ANDARES[i]).find(function (x) { return x.uid === uid; });
      if (o) return { o: o, andar: ANDARES[i] };
    }
    return null;
  }
  function andarDe(ctx, uid) {
    if (ctx && ctx.interior && ctx.interior.id) return ctx.interior.id;
    var a = acharPeca(uid);
    if (a) return a.andar;
    var c = R.Cena && R.Cena.atual && R.Cena.atual();
    return c ? c.id : null;
  }

  /* ---------- falas (só as frases já gravadas de Reino.Cuidados, como a Pet Shop) ---------- */
  function retratoUni(id) {
    try {
      var P = R.Progresso, d = P.defUni(id), u = P.estado().unis[id];
      var s = window.PA && PA.unicornio ? PA.unicornio(d, R.Unicornios.estagio(u ? u.xp : 0), 0) : null;
      return s ? (s.canvas || s) : null;
    } catch (e) { return null; }
  }
  function falarFrase(chave, id) {
    var Cu = R.Cuidados, Cl = R.Claude, texto = Cu && Cu.frases && Cu.frases[chave];
    if (!texto || !Cl || !Cl.falar) return Promise.resolve(null);
    var voz = Cu.vozDaFrase ? Cu.vozDaFrase(chave) : 'claude';
    var op = { modal: true, voz: voz, botoes: [{ texto: 'Ok! 👍', valor: 'ok', principal: true }] };
    if (voz === 'unicornio') op.quem = { nome: nomeUni(id), retrato: retratoUni(id), voz: voz };
    return Cl.falar(texto, op);
  }
  function fim(res) { ultimo = res; return res; }

  /* ---------- usos de toque (sem animação da personagem) ---------- */
  function efeito(def, obj, andar) {
    var uid = obj.uid;
    if (ligado(obj)) return fim({ uso: 'efeito', ligado: true, repetido: true });
    ligar(uid, true, andar);
    tocar(def.som);
    tocarMelodia(def.melodia);
    // desliga sozinho e refaz o andar onde a peça está agora (pode ter mudado de andar no modo decorar)
    if (uid) TIMERS[uid] = setTimeout(function () {
      delete TIMERS[uid];
      var a = acharPeca(uid);
      ligar(uid, false, a ? a.andar : null);
      if (!a && R.Interiores && R.Interiores.refazer) ANDARES.forEach(function (n) { R.Interiores.refazer(n); });
    }, cfg().efeitoMs);
    return fim({ uso: 'efeito', ligado: true });
  }
  // comida (def.fome = a chave de config.casa.usos) ou água para a montaria; sem unicórnio chocado: só o som
  function cuidar(def, u) {
    var Cu = R.Cuidados, comer = def.uso === 'comer';
    if (!u || !Cu) { tocar(def.som); return Promise.resolve(fim({ uso: def.uso, resultado: { ok: false, motivo: 'sem-uni' } })); }
    var r = comer ? Cu.comerEmCasa(u, cfg()[def.fome]) : Cu.beber(u);
    if (r.ok) tocar(def.som);
    var chave = comer ? (r.ok ? 'comeu' : 'cheio') : (r.ok ? 'bebeu' : 'semSede');
    return falarFrase(chave, u).then(function () { return fim({ uso: def.uso, resultado: r }); });
  }

  /* ---------- usos com animação ---------- */
  // "Quem vai?" → 'ela' | 'uni' | null (Agora não)
  function quemVai(def, u) {
    if (def.quem === 'uni') return Promise.resolve(u ? 'uni' : null);
    var UI = R.UI;
    if (def.quem !== 'ambos' || !u || !UI || !UI.escolher) return Promise.resolve('ela');
    return UI.escolher('Quem vai?', [
      { rotulo: '🙋 Eu', valor: 'ela', principal: true },
      { rotulo: '🦄 ' + nomeUni(u), valor: 'uni' },
      { rotulo: 'Agora não', valor: null, seguro: true },
    ]);
  }
  function novoSt(def, obj, quem, u) {
    var J = window.Jogador, curta = !animacoesLigadas();
    return { uso: def.uso, quem: quem, obj: { tipo: obj.tipo, uid: obj.uid, x: obj.x, y: obj.y, w: obj.w, h: obj.h, dir: obj.dir },
      uniId: u, montado: !!(J && J.montado && J.montado()), curta: curta, dur: curta ? cfg().curtaMs : cfg()[DURACAO[def.uso]],
      inicio: 0, comecou: false, fim: false, pulou: false };
  }
  // a animação (frente das poses); sem ela, termina na hora. Rede de segurança (dur + 5 s): marca st.fim e st.pulou
  // e encerra. A animação deve respeitar st.fim (parar de desenhar, não aplicar mais nada) e liberar só a própria
  // ocupação da cena (Cena.liberar do que ela ocupou); quem limpa I.st é esta parte
  function animar(st) {
    I.st = st;
    var p = Promise.resolve({ pulou: false });
    if (typeof I.animar === 'function') {
      var seguro = new Promise(function (ok) { setTimeout(function () { st.fim = true; st.pulou = true; ok({ pulou: true }); }, st.dur + 5000); });
      p = Promise.race([Promise.resolve().then(function () { return I.animar(st); }), seguro]);
    }
    return p.catch(function (e) { console.error(e); return { pulou: false }; })
      .then(function (r) { if (I.st === st) I.st = null; st.fim = true; return r || { pulou: false }; });
  }
  function posto() { var J = window.Jogador; return J && J.tile ? J.tile() : null; }
  function comAnimacao(def, obj, quem, u, andar) {
    var Cu = R.Cuidados, res = { uso: def.uso, quem: quem };
    if (!quem && def.quem === 'uni') {   // cama só do unicórnio, sem unicórnio chocado: só o som
      tocar(def.som);
      return Promise.resolve(fim({ uso: def.uso, resultado: { ok: false, motivo: 'sem-uni' } }));
    }
    if (!quem) return Promise.resolve(fim(null));   // Agora não
    if (def.uso === 'banho' && quem === 'uni') {
      var banheira = { x: obj.x, y: obj.y, w: obj.w, h: obj.h, tipo: obj.tipo, dir: obj.dir };
      if (R.Banho && R.Banho.iniciar) {
        return R.Banho.iniciar(u, { banheira: banheira, posto: posto() }).then(function (r) { res.resultado = r; return fim(res); });
      }
      var rb = Cu.banhar(u);
      return falarFrase(rb.ok ? 'banhou' : 'jaLimpinho', u).then(function () { res.resultado = rb; return fim(res); });
    }
    // o unicórnio já limpinho não entra no chuveiro (como na banheira da Pet Shop)
    if (def.uso === 'chuveiro' && quem === 'uni' && Cu.niveis(u).banho >= 99.5) {
      return falarFrase('jaLimpinho', u).then(function () { res.resultado = { ok: false, motivo: 'cheio' }; return fim(res); });
    }
    var st = novoSt(def, obj, quem, u), fogao = def.uso === 'cozinhar', aceso = fogao || def.uso === 'chuveiro';   // o fogão aceso e o chuveiro aberto durante o uso
    tocar(def.som);
    if (aceso) ligar(obj.uid, true, andar);
    return animar(st).then(function (r) {
      res.pulou = !!r.pulou;
      if (aceso) ligar(obj.uid, false, andar);
      var fala = null;
      if (def.uso === 'chuveiro' && quem === 'uni') { res.resultado = Cu.banhar(u); fala = res.resultado.ok ? 'banhou' : 'jaLimpinho'; }
      if (fogao && u) {
        res.resultado = Cu.comerEmCasa(u, cfg().fomeFogao);
        if (res.resultado.ok) tocar('nhac');
        fala = res.resultado.ok ? 'comeu' : 'cheio';
      }
      return (fala ? falarFrase(fala, u) : Promise.resolve(null)).then(function () { return fim(res); });
    });
  }

  /* ---------- usar ---------- */
  function usar(obj, ctx) {
    var def = obj && de(obj.tipo);
    if (!def || I.st || (R.Banho && R.Banho.ativo && R.Banho.ativo())) return Promise.resolve(null);
    var andar = andarDe(ctx, obj.uid), u = uniChocado();
    if (def.uso === 'alternar' || def.uso === 'abrir') {
      ligar(obj.uid, !ligado(obj), andar);
      tocar(def.som);
      return Promise.resolve(fim({ uso: def.uso, ligado: ligado(obj) }));
    }
    if (def.uso === 'efeito') return Promise.resolve(efeito(def, obj, andar));
    if (def.uso === 'comer' || def.uso === 'beber') return cuidar(def, u);
    return quemVai(def, u).then(function (quem) { return comAnimacao(def, obj, quem, u, andar); });
  }
  // a ação { tipo: 'casaUsar', uid } da peça (Casa.objetosDoAndar): ctx.objeto é a peça tocada
  function casaUsar(acao, ctx) {
    var o = ctx && ctx.objeto, uid = acao && acao.uid;
    if (!o || (uid && o.uid !== uid)) { var a = acharPeca(uid); o = a && a.o; }
    return usar(o, ctx);
  }
  function quemDesenha() {
    try { return (I.st && typeof I.quemDesenha === 'function' && I.quemDesenha(I.st)) || {}; } catch (e) { return {}; }
  }

  R.CasaUsos = {
    USOS: USOS,
    registrar: registrar, de: de, uso: uso, tipos: tipos, ligado: ligado, ligar: ligar, esquecer: esquecer, usar: usar,
    animando: function () { return !!I.st; },
    desenhandoEla: function () { return !!quemDesenha().ela; },
    desenhandoUni: function () { return !!quemDesenha().uni; },
    depurar: function () {
      var s = I.st;
      return { ligados: Object.keys(ESTADO), st: s ? { uso: s.uso, quem: s.quem, uid: s.obj.uid, curta: s.curta, pulou: s.pulou } : null, ultimo: ultimo };
    },
  };

  // todo save gravado ou trocado (carregar, mescla, Apagar tudo) confere o dono; só guarda o ouvinte (nada roda agora)
  if (R.util && R.util.on && R.EVENTOS) R.util.on(R.EVENTOS.PROGRESSO, conferirDono);

  // módulo: a ação das peças e a camada das poses (o desenho é da animação: I.itens, I.sobre)
  R.registrarModulo({
    id: 'casa-usos',
    acoes: { casaUsar: casaUsar },
    depurar: function () { return R.CasaUsos.depurar(); },
    camada: {
      ativo: function () { return !!(I.st && typeof I.itens === 'function'); },
      itensDesenho: function (p, t, animar) { return I.itens(p, t, animar); },
      sobre: function (c, p, t, animar) { if (typeof I.sobre === 'function') I.sobre(c, p, t, animar); },
    },
  });
})();
