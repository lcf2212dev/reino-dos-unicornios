/* Itens dela: Mochila (20 espaços), Baú de Guardados (sem limite) e o que está vestido (docs/contratos/itens.md §6, §7,
   §10, §11): Reino.Itens. Os itens caem dos inimigos (sistemas/itens-drop.js); o catálogo é conteudo/itens/catalogo.js.
   Campo (save-e-mescla.md §11; mantém no Novo ciclo e vai na cópia -novidades):
     itens { <uid>: { id, onde: 'mochila' | 'bau' | 'vestido' | 'fora', em } }; carimbo (por uid, o `em` maior).
   Uma peça, uma chave: cada item ganho nasce com um uid novo e nunca muda de chave; mexer só troca o `onde`, com
   em = max(agora, em + 1). Gasto e jogado fora = lápide ('fora'): a chave nunca se apaga (senão a mescla traria o
   item de volta). Assim a mescla de dois aparelhos não duplica nem some nada.
   Derivado na leitura (nunca gravado no carregamento): dois vestidos no mesmo slot (mescla) = vale o de (em, uid)
   maior, os outros contam como mochila; mochila acima da capacidade = o excesso aparece no baú; id ou `onde`
   desconhecidos (de uma versão nova) ficam guardados sem efeito (não aparecem, não ocupam espaço).
   Toda função que muda grava (P.salvar) e emite EVENTOS.ITENS. node: true: nada de DOM no carregamento. */
(function () {
  var R = window.Reino, U = R.util, P = R.Progresso, I = R._progresso, EV = R.EVENTOS;
  var objeto = I.objeto, numeroOu = I.numeroOu;
  var SLOTS = ['espada', 'escudo', 'cabeca', 'armadura', 'botas'];
  var VIVOS = { mochila: 1, bau: 1, vestido: 1 };
  var UID = /^[0-9a-z]{1,12}-[0-9a-z]{4}$/;
  // ordem de tela: espadas, escudos, cabeça, armaduras, botas, poções, comidinhas; dentro, raridade maior primeiro
  var ORDEM = { espada: 0, escudo: 1, cabeca: 2, armadura: 3, botas: 4, pocao: 5, comida: 6 };
  var RARIDADE = { lendario: 0, epico: 1, raro: 2, comum: 3 };

  P.registrarCampo('itens', {
    padrao: function () { return {}; },
    mesclar: 'carimbo',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    // depois da limpeza do carimbo: só chaves no formato do uid, com `id` e `onde` em texto (o resto fica como veio)
    limpar: function (v) {
      var r = {};
      Object.keys(v).forEach(function (k) {
        var x = v[k];
        if (UID.test(k) && typeof x.id === 'string' && typeof x.onde === 'string') r[k] = x;
      });
      return r;
    },
    exemplos: [
      { 'mhn3k2a1-x7q2': { id: 'espada-gelo', onde: 'vestido', em: 30 }, 'mhn3k2b4-a1b2': { id: 'pocao-pequena', onde: 'mochila', em: 10 } },
      { 'mhn3k2a1-x7q2': { id: 'espada-gelo', onde: 'bau', em: 40 }, 'mhn3k2b4-a1b2': { id: 'pocao-pequena', onde: 'fora', em: 20 },
        'mhn3k9zz-q0w9': { id: 'comida-maca', onde: 'mochila', em: 25 } },
    ],
  });

  function cfg() { return R.config.itens; }
  function CAPACIDADE() { return cfg().mochila || 20; }
  function pilha() { return Math.max(1, cfg().pilha || 1); }
  function def(id) { return R.ItensCatalogo ? R.ItensCatalogo.def(id) : null; }
  var VAZIO = {};   // campo ausente (antes do carregar): sempre o mesmo objeto, para a memória da leitura valer
  function campo() { var e = P.estado(); return e && objeto(e.itens) ? e.itens : VAZIO; }
  function equip(d) { return !!(d && d.slot); }
  /** um número de 0 a 1: no modo congelado, pela chave (estável, não gasta o Math.random); senão Math.random */
  function rolar(chave) { return R.congelado && R.sorteioDaChave ? R.sorteioDaChave(chave)() : Math.random(); }

  /* ---------- leitura derivada (memorizada: muda só quando o estado, o campo ou uma gravação mudam) ---------- */
  var versao = 0, memo = null;
  function maior(a, b) { return a.em !== b.em ? a.em > b.em : a.uid > b.uid; }
  function resolver() {
    var e = P.estado(), c = campo();
    if (memo && memo.e === e && memo.c === c && memo.v === versao) return memo.r;
    var pecas = [];
    Object.keys(c).forEach(function (uid) {
      var x = c[uid], d = objeto(x) ? def(x.id) : null;
      if (d && VIVOS[x.onde] === 1) pecas.push({ uid: uid, id: x.id, def: d, onde: x.onde, em: numeroOu(x.em, 0) });
    });
    pecas.sort(function (a, b) { return maior(a, b) ? 1 : -1; });   // (em, uid) crescente
    // vestido: um por slot, o de (em, uid) maior; os outros (mescla) contam como mochila
    var vest = {};
    pecas.forEach(function (p) {
      if (p.onde !== 'vestido') return;
      if (!equip(p.def)) { p.onde = 'mochila'; return; }
      if (vest[p.def.slot]) vest[p.def.slot].onde = 'mochila';
      vest[p.def.slot] = p;
    });
    // mochila: uma a uma, em (em, uid); consumível entra numa pilha com espaço ou abre espaço; sem espaço, vai ao baú
    var espacos = [], cap = CAPACIDADE(), max = pilha();
    pecas.forEach(function (p) {
      if (p.onde !== 'mochila') return;
      var esp = equip(p.def) ? null : espacos.find(function (s) { return s.id === p.id && s.uids.length < max; });
      if (!esp && espacos.length < cap) { esp = { id: p.id, def: p.def, uids: [] }; espacos.push(esp); }
      if (esp) esp.uids.push(p.uid); else p.onde = 'bau';
    });
    var r = { pecas: pecas, vest: vest, espacos: espacos, vestes: null, bonus: null };
    memo = { e: e, c: c, v: versao, r: r };
    return r;
  }
  function chaveTela(d) {
    var ordem = ORDEM[d.slot || d.tipo], i = R.ItensCatalogo.todos().indexOf(d);
    return [ordem === undefined ? 9 : ordem, RARIDADE[d.raridade] === undefined ? 4 : RARIDADE[d.raridade], i];
  }
  function porTela(a, b) {
    var x = chaveTela(a.def), y = chaveTela(b.def);
    for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i];
    return 0;   // mesmo item: a ordem de entrada (sort estável)
  }
  function espaco(s) { return { id: s.id, def: s.def, uids: s.uids.slice(), qtd: s.uids.length }; }

  /** as peças vivas e conhecidas, com o `onde` já resolvido (§6, §10.4) */
  function pecas() { return resolver().pecas.map(function (p) { return { uid: p.uid, id: p.id, def: p.def, onde: p.onde }; }); }
  function peca(uid) { return resolver().pecas.find(function (p) { return p.uid === uid; }) || null; }
  /** os espaços da mochila, em ordem de tela: [{ id, def, uids, qtd }] */
  function mochila() { return resolver().espacos.slice().sort(porTela).map(espaco); }
  function espacos() { return { usados: resolver().espacos.length, total: CAPACIDADE() }; }
  /** o item cabe na mochila agora? (consumível: numa pilha com espaço ou num espaço livre) */
  function cabe(id) {
    var d = def(id), r = resolver();
    if (!d) return false;
    if (!equip(d) && r.espacos.some(function (s) { return s.id === id && s.uids.length < pilha(); })) return true;
    return r.espacos.length < CAPACIDADE();
  }
  /** o baú, empilhado por id sem limite, em ordem de tela */
  function bau() {
    var grupos = [], por = {};
    resolver().pecas.forEach(function (p) {
      if (p.onde !== 'bau') return;
      if (!por[p.id]) { por[p.id] = { id: p.id, def: p.def, uids: [] }; grupos.push(por[p.id]); }
      por[p.id].uids.push(p.uid);
    });
    return grupos.sort(porTela).map(espaco);
  }
  function vestido() {
    var v = resolver().vest, r = {};
    SLOTS.forEach(function (s) { r[s] = v[s] ? { uid: v[s].uid, id: v[s].id, def: v[s].def } : null; });
    return r;
  }
  /** os ids vestidos, por slot (o mesmo objeto enquanto nada muda: pode ser chamado a cada quadro) */
  function vestes() {
    var r = resolver();
    if (!r.vestes) {
      r.vestes = {};
      SLOTS.forEach(function (s) { r.vestes[s] = r.vest[s] ? r.vest[s].id : null; });
    }
    return r.vestes;
  }
  /** a soma dos atributos do que está vestido */
  function bonus() {
    var r = resolver();
    if (!r.bonus) {
      var b = { dano: 0, defesa: 0, vida: 0, velocidade: 0, sorte: 0 };
      SLOTS.forEach(function (s) {
        var x = r.vest[s] && r.vest[s].def.bonus;
        if (x) Object.keys(b).forEach(function (k) { if (typeof x[k] === 'number') b[k] += x[k]; });
      });
      b.velocidade = Math.round(b.velocidade * 1000) / 1000; b.sorte = Math.round(b.sorte * 1000) / 1000;
      r.bonus = b;
    }
    return r.bonus;
  }
  /** o botão da Mochila aparece: já tem a espada do Bosque ou algum item */
  function temMochila() { return !!(R.Bosque && R.Bosque.temEspada && R.Bosque.temEspada()) || resolver().pecas.length > 0; }

  /* ---------- gravação ---------- */
  var ultimo = null;   // o campo como esta aba o viu por último (para o 'remoto')
  function texto() { return JSON.stringify(campo()); }
  // troca o `onde` da peça (a chave fica; o `em` sempre cresce)
  function mover(uid, onde) {
    var e = P.estado();
    if (!objeto(e.itens)) e.itens = {};
    var r = objeto(e.itens[uid]) ? U.copia(e.itens[uid]) : {};
    r.onde = onde;
    r.em = Math.max(I.agora(), numeroOu(r.em, 0) + 1);
    e.itens[uid] = r;
    versao++;
  }
  // os outros gravados como vestidos no slot (mescla em conflito) passam a mochila de verdade: tirar ou trocar a peça
  // de cima não faz outra aparecer na cabeça dela
  function soltarSlot(slot, menos) {
    var c = campo();
    Object.keys(c).forEach(function (uid) {
      var x = c[uid], d = objeto(x) ? def(x.id) : null;
      if (uid !== menos && x && x.onde === 'vestido' && d && d.slot === slot) mover(uid, 'mochila');
    });
  }
  function fechar(motivo) {
    versao++;
    P.salvar();
    ultimo = texto();
    U.emit(EV.ITENS, { tipo: 'mudou', motivo: motivo });
  }
  function lista(x) { return Array.isArray(x) ? x : [x]; }

  function novoUid() {
    var c = campo(), uid;
    do {
      var s = '';
      for (var i = 0; i < 4; i++) s += Math.min(35, Math.floor(rolar('itens:uid') * 36)).toString(36);
      uid = Date.now().toString(36) + '-' + s;
    } while (Object.prototype.hasOwnProperty.call(c, uid));
    return uid;
  }
  /** ganha um item (vai à mochila; sem espaço, ao baú). Grava na hora e emite 'ganhou'. info: { arena, x, y } */
  function ganhar(id, info) {
    var e = P.estado(), d = def(id);
    if (!e || !d) return null;
    info = info || {};
    var onde = cabe(id) ? 'mochila' : 'bau', uid = novoUid();
    if (!objeto(e.itens)) e.itens = {};
    e.itens[uid] = { id: id, onde: onde, em: I.agora() };
    versao++;
    P.salvar();
    ultimo = texto();
    U.emit(EV.ITENS, { tipo: 'ganhou', uid: uid, id: id, onde: onde, arena: info.arena || null,
      x: typeof info.x === 'number' ? info.x : null, y: typeof info.y === 'number' ? info.y : null });
    return { uid: uid, onde: onde };
  }
  /** veste um equipamento da mochila; o que estava no slot volta para a mochila (sempre cabe: troca de lugar) */
  function vestir(uid) {
    var p = peca(uid);
    if (!p || p.onde !== 'mochila' || !equip(p.def)) return false;
    soltarSlot(p.def.slot, uid);
    mover(uid, 'vestido');
    fechar('vestir');
    return true;
  }
  /** tira o do slot: vai para a mochila; cheia, para o baú */
  function tirar(slot) {
    var w = resolver().vest[slot];
    if (!w) return { ok: false, onde: null };
    var onde = resolver().espacos.length < CAPACIDADE() ? 'mochila' : 'bau';
    soltarSlot(slot, w.uid);
    mover(w.uid, onde);
    fechar('tirar');
    return { ok: true, onde: onde };
  }
  /** leva para o baú (da mochila, ou o vestido); aceita uma lista (a pilha inteira). true se mudou alguma */
  function guardar(uids) {
    var n = 0;
    lista(uids).forEach(function (uid) {
      var p = peca(uid);
      if (!p || (p.onde !== 'mochila' && p.onde !== 'vestido')) return;
      if (p.onde === 'vestido') soltarSlot(p.def.slot, uid);
      mover(uid, 'bau'); n++;
    });
    if (n) fechar('mover');
    return n > 0;
  }
  /** traz do baú para a mochila, se couber. Um uid → bool (false: não cabe); uma lista → quantas vieram */
  function retirar(uids) {
    var n = 0;
    lista(uids).forEach(function (uid) {
      var p = peca(uid);
      if (p && p.onde === 'bau' && cabe(p.id)) { mover(uid, 'mochila'); n++; }
    });
    if (n) fechar('mover');
    return Array.isArray(uids) ? n : n > 0;
  }
  /** usa uma poção (numa arena) ou dá uma comidinha ao unicórnio; só gasta se fez efeito */
  function usar(uid) {
    var p = peca(uid), nao = function (m) { return { ok: false, motivo: m }; };
    if (!p || p.onde !== 'mochila') return nao('nao-usa');
    var efeito;
    if (p.def.tipo === 'pocao') {
      var BC = R.BosqueCombate, v = BC && BC.curar && BC.ativo && BC.ativo() ? BC.vida() : null;
      if (!v) return nao('fora-arena');
      if (v.n >= v.max) return nao('vida-cheia');
      var c = cfg().pocao, n = p.def.cura === 'grande' ? Math.ceil(v.max * c.grande) : Math.max(c.pequenaMin, Math.round(v.max * c.pequena));
      var cur = BC.curar(n);
      if (!cur) return nao('fora-arena');
      efeito = { tipo: 'cura', antes: cur.antes, depois: cur.depois };
    } else if (p.def.tipo === 'comida') {
      if (!R.Cuidados) return nao('sem-uni');
      var r = R.Cuidados.comerEmCasa(P.montaria(), p.def.fome);
      if (!r.ok) return nao(r.motivo === 'cheio' || r.motivo === 'sem-uni' ? r.motivo : 'nao-usa');
      efeito = { tipo: 'comida', antes: r.antes, depois: r.depois };
    } else return nao('nao-usa');
    mover(uid, 'fora');
    fechar('usar');
    return { ok: true, efeito: efeito };
  }
  /** joga fora (lápide: a chave fica); aceita uma lista. true se jogou alguma */
  function jogarFora(uids) {
    var n = 0;
    lista(uids).forEach(function (uid) {
      var p = peca(uid);
      if (!p) return;
      if (p.onde === 'vestido') soltarSlot(p.def.slot, uid);
      mover(uid, 'fora'); n++;
    });
    if (n) fechar('jogar');
    return n > 0;
  }

  // gravou ou trocou o estado (mescla, outra aba, nuvem): a leitura derivada se refaz
  U.on(EV.PROGRESSO, function () { versao++; });
  // veio de fora: avisa quem mostra os itens, só se o campo mudou
  U.on(EV.PROGRESSO_REMOTO, function () {
    versao++;
    var t = texto();
    if (t === ultimo) return;
    ultimo = t;
    U.emit(EV.ITENS, { tipo: 'mudou', motivo: 'remoto' });
  });

  R.Itens = { SLOTS: SLOTS, CAPACIDADE: CAPACIDADE, def: def, rolar: rolar, pecas: pecas, mochila: mochila, espacos: espacos,
    cabe: cabe, temMochila: temMochila, bau: bau, vestido: vestido, vestes: vestes, bonus: bonus, ganhar: ganhar,
    vestir: vestir, tirar: tirar, guardar: guardar, retirar: retirar, usar: usar, jogarFora: jogarFora };

  R.registrarModulo({
    id: 'itens',
    iniciar: function () { ultimo = texto(); },
    depurar: function () {
      if (!P.estado()) return null;
      var r = resolver();
      return { pecas: r.pecas.length, mochila: espacos(), bau: r.pecas.filter(function (p) { return p.onde === 'bau'; }).length,
        vestes: vestes(), bonus: bonus() };
    },
  });
})();
