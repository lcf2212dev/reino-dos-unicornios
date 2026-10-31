/* Casa do jogador (docs/contratos/casa.md §6–§8): o save, as regras dos kits e onde cada móvel pode ficar.
   Campos (save-e-mescla.md §11; todos mantêm no Novo ciclo e vão na cópia -novidades):
     casaBau   { em } quando abriu o baú da casa ({} antes); mescla = o menor `em`
     casaKits  { <materiaId>: { kit, em } }; carimbo (por matéria, o `em` maior)
     casaItens { <uid>: { andar, x, y, dir, em } | { guardado: true, em } }; carimbo. Guardar não apaga.
   Derivado (nunca no save): kits ganhos, livres e pendentes, e quais peças estão na casa. Peça de kit que ela não
   tem é ignorada; duas peças no mesmo lugar (dois aparelhos): a mais nova fica, a outra conta como guardada.
   Peça (uid) = '<kit>.<item>.<n>', n de 1 a qtd; móvel avulso (§12, sistemas/casa-moveis.js) = 'movel.<id>.<n>'.
   Abas do modo decorar = os cômodos (ids de config.casa.kits) com kit ou móvel avulso. A ação 'casaDecorar' é a da
   caixa de mudança.
   node: true: nada de DOM, canvas nem Progresso no carregamento (só o registrarCampo). */
(function () {
  var R = window.Reino, P = R.Progresso, I = R._progresso;
  var objeto = I.objeto, numeroOu = I.numeroOu;
  var ANDARES = ['casa', 'casa-2'], MOVEL = 'movel';

  /* ---------- os 3 campos do save ---------- */
  P.registrarCampo('casaBau', {
    padrao: function () { return {}; },
    // a primeira vez que abriu (o menor `em`); um lado sem `em` não apaga o outro
    mesclar: function (a, b) {
      if (!a.em) return b.em ? { em: b.em } : {};
      return { em: b.em ? Math.min(a.em, b.em) : a.em };
    },
    limpar: function (v) {
      if (!objeto(v)) return undefined;
      var n = numeroOu(v.em, NaN);
      return isFinite(n) && n > 0 ? { em: n } : {};
    },
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ em: 1790000000000 }, { em: 1789000000000 }],
  });
  P.registrarCampo('casaKits', {
    padrao: function () { return {}; },
    mesclar: 'carimbo',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ portugues: { kit: 'estar', em: 10 }, ciencias: { kit: 'jantar', em: 30 } },
      { portugues: { kit: 'cozinha', em: 20 }, matematica: { kit: 'quarto-uni', em: 5 } }],
  });
  P.registrarCampo('casaItens', {
    padrao: function () { return {}; },
    mesclar: 'carimbo',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ 'estar.sofa.1': { andar: 'casa', x: 3, y: 5, dir: 'baixo', em: 10 }, 'estar.tapete.1': { andar: 'casa', x: 4, y: 6, dir: 'esq', em: 30 } },
      { 'estar.sofa.1': { guardado: true, em: 20 }, 'jantar.cadeira.2': { andar: 'casa', x: 9, y: 7, dir: 'dir', em: 5 } }],
  });

  /* ---------- leitura (sempre de P.estado(): a mescla troca o objeto) ---------- */
  function campo(nome) { var e = P.estado(); return e && objeto(e[nome]) ? e[nome] : {}; }
  function paraGravar(nome) { var e = P.estado(); if (!objeto(e[nome])) e[nome] = {}; return e[nome]; }
  function cfg() { return R.config.casa; }
  function kitDef(id) { return R.kitCasa ? R.kitCasa(id) : undefined; }
  // tile: número inteiro >= 0 (texto não vale)
  function inteiroOk(n) { return typeof n === 'number' && n >= 0 && n % 1 === 0; }
  function tem(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  // sempre maior que o carimbo anterior da peça (o relógio pode ter voltado)
  function carimbo(antigo) { return Math.max(I.agora(), (objeto(antigo) ? numeroOu(antigo.em, 0) : 0) + 1); }

  /* ---------- kits ---------- */
  // matérias que dão kit: do bimestre desdeBimestre em diante, com todas as salas feitas (não olha `arquivada`)
  function materiasQueContam() {
    return (R.materias || []).filter(function (m) { return (m.bimestre || 0) >= cfg().desdeBimestre && P.materiaCompleta(m); });
  }
  function kitsGanhos() {
    var k = campo('casaKits'), dados = Object.keys(k).map(function (m) { return objeto(k[m]) ? k[m].kit : null; });
    return cfg().kits.filter(function (id) { return dados.indexOf(id) >= 0; });
  }
  function kitsLivres() {
    var ganhos = kitsGanhos();
    return cfg().kits.filter(function (id) { return ganhos.indexOf(id) < 0 && !!kitDef(id); });
  }
  // cada matéria completa vale um kit; a que repete o kit de outra (dois aparelhos) ou tem kit desconhecido não gasta
  function kitsPendentes() { return Math.min(Math.max(0, materiasQueContam().length - kitsGanhos().length), kitsLivres().length); }
  // onde gravar o próximo kit: a 1ª matéria sem kit; senão, a 1ª cuja entrada repete um kit ou tem kit desconhecido
  function materiaParaKit() {
    var k = campo('casaKits'), contam = materiasQueContam(), ids = contam.map(function (m) { return m.id; }), vistos = [];
    var semKit = contam.filter(function (m) { return !tem(k, m.id); })[0];
    if (semKit) return semKit;
    // os kits das entradas de fora da lista contam como já vistos
    Object.keys(k).forEach(function (id) { if (ids.indexOf(id) < 0 && objeto(k[id])) vistos.push(k[id].kit); });
    return contam.filter(function (m) {
      var kit = objeto(k[m.id]) ? k[m.id].kit : null;
      if (typeof kit !== 'string' || cfg().kits.indexOf(kit) < 0 || vistos.indexOf(kit) >= 0) return true;
      vistos.push(kit);
      return false;
    })[0] || null;
  }
  function escolherKit(kit) {
    var m = kitsPendentes() > 0 && materiaParaKit();
    if (kitsLivres().indexOf(kit) < 0 || !m) return false;
    var kits = paraGravar('casaKits');
    kits[m.id] = { kit: kit, em: carimbo(kits[m.id]) };
    P.salvar();
    return true;
  }
  // nome com {nome}/{a|b} (Reino.Genero) e {uni} (o nome da montaria)
  function nomeKit(id) {
    var d = kitDef(id);
    if (!d) return '';
    var t = R.Genero ? R.Genero.texto(d.nome) : d.nome;
    if (t.indexOf('{uni}') < 0) return t;
    var uni = 'Unicórnio';
    try { if (P.estado()) uni = P.nomeUni(P.montaria()); } catch (e) {}
    return t.replace(/\{uni\}/g, uni);
  }

  /* ---------- peças ---------- */
  function direcoesDe(item) {
    if (item.parede || item.direcoes === 1) return ['baixo'];
    if (item.direcoes === 2) return ['baixo', 'esq'];
    return cfg().passoGirar.slice();
  }
  // a peça do uid, só de kit que ela tem e de item que existe (senão null: órfã)
  function peca(uid) {
    var p = typeof uid === 'string' ? uid.split('.') : [], item, max, n = Number(p[2]);
    if (p.length !== 3) return null;
    if (p[0] === MOVEL) {   // móvel avulso: tantas peças quantas salas o escolheram
      item = R.movelCasa && R.movelCasa(p[1]);
      max = item && R.CasaMoveis ? R.CasaMoveis.qtd(item.id) : 0;
    } else {
      if (kitsGanhos().indexOf(p[0]) < 0) return null;
      var d = kitDef(p[0]);
      item = d && d.itens.find(function (i) { return i.id === p[1]; });
      max = item ? item.qtd || 1 : 0;
    }
    if (!item || !(n >= 1 && n <= max && n % 1 === 0) || String(n) !== p[2]) return null;
    var lib = libDe(item.objeto);
    return { uid: uid, kit: p[0], item: item.id, objeto: item.objeto, nome: item.nome, direcoes: item.parede ? 1 : (item.direcoes || 1),
      parede: !!(item.parede || lib.parede), plano: !!lib.plano, dirs: direcoesDe(item) };
  }
  function libDe(tipo) { var II = R.Interiores; return (II && II.OBJETOS && II.OBJETOS[tipo]) || {}; }
  // a pegada na direção: w/h da biblioteca são os de 'baixo'; de lado, trocados
  function pegada(p, dir) {
    var lib = libDe(p.objeto), w = lib.w || 1, h = lib.h || 1;
    return dir === 'esq' || dir === 'dir' ? { w: h, h: w } : { w: w, h: h };
  }
  function comoObjeto(p, l) { var pg = pegada(p, l.dir); return { tipo: p.objeto, x: l.x, y: l.y, w: pg.w, h: pg.h, dir: l.dir }; }
  // o lugar gravado de uma peça, se for um lugar possível (senão null: conta como guardada)
  function lugarGravado(p, r) {
    if (!p || !objeto(r) || r.guardado || ANDARES.indexOf(r.andar) < 0) return null;
    var x = r.x, y = r.y;
    if (!inteiroOk(x) || !inteiroOk(y) || p.dirs.indexOf(r.dir) < 0) return null;
    return { andar: r.andar, x: x, y: y, dir: r.dir };
  }

  /* ---------- onde pode ficar (casa.md §8) ---------- */
  function tiles(o) {
    var d = R.Interiores.dimensoes(o), l = [];
    for (var y = o.y; y < o.y + d.h; y++) for (var x = o.x; x < o.x + d.w; x++) l.push({ x: x, y: y });
    return l;
  }
  function ehPlano(o) { return !!(o.plano || libDe(o.tipo).plano); }
  function chegadas(def) {
    var II = R.Interiores;
    return (def.escadas || []).map(function (e) { return II.chegadaVindoDe && II.chegadaVindoDe(def.id, e.para); }).filter(Boolean);
  }
  // de onde ela parte: o spawn na entrada; em cima, a chegada da escada
  function origem(def) { return (!def.entrada && chegadas(def)[0]) || (def.escadas && !def.entrada && def.escadas[0]) || def.spawn || null; }
  // os tiles alcançáveis (as regras do caminhoNaGrade: 8 direções sem cortar quina)
  function alcance(g, o) {
    var visto = {}, fila = [o], sol = function (x, y) { return !g.dentro(x, y) || g.solido[y][x]; };
    if (!o) return visto;
    visto[o.x + ',' + o.y] = true;
    while (fila.length) {
      var a = fila.shift();
      for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
        var nx = a.x + dx, ny = a.y + dy, k = nx + ',' + ny;
        if ((!dx && !dy) || visto[k] || sol(nx, ny) || (dx && dy && (sol(nx, a.y) || sol(a.x, ny)))) continue;
        visto[k] = true; fila.push({ x: nx, y: ny });
      }
    }
    return visto;
  }
  // os grupos de tiles que precisam continuar alcançáveis (basta um tile de cada grupo)
  function alvos(def, g) {
    var l = [];
    (def.portas || []).forEach(function (p) { tiles({ tipo: '', x: p.x, y: p.y, w: p.w || 1, h: p.h || 1 }).forEach(function (t) { l.push([t]); }); });
    (def.escadas || []).concat(def.saida ? [def.saida] : [], chegadas(def)).forEach(function (t) { l.push([t]); });
    var viz = function (ts) {
      var r = [];
      ts.forEach(function (t) { [[0, 1], [0, -1], [1, 0], [-1, 0], [0, 0]].forEach(function (d) { r.push({ x: t.x + d[0], y: t.y + d[1] }); }); });
      return r;
    };
    (def.objetos || []).forEach(function (o) { if (R.Interiores.interativo(o)) l.push(viz(tiles(o))); });
    (def.npcs || []).forEach(function (n) { l.push(viz([n])); });
    return l.map(function (grupo) { return grupo.filter(function (t) { return g.dentro(t.x, t.y); }); });
  }
  function algumNo(vis, grupo) { return grupo.some(function (t) { return vis[t.x + ',' + t.y]; }); }

  // o motivo de não caber (ou null). `outras` = ObjetoInterior das outras peças do andar. comJogador: confere o tile dela
  function motivo(def, outras, p, x, y, dir, comJogador) {
    if (p.dirs.indexOf(dir) < 0 || !inteiroOk(x) || !inteiroOk(y)) return 'fora';
    // a grade sempre com a lista dada: sem ela, o grade chamaria objetosExtras → resolver → motivo (laço sem fim)
    var II = R.Interiores, g = II.grade(def, def.objetos || []), cand = comoObjeto(p, { x: x, y: y, dir: dir }), ts = tiles(cand), com = null;
    for (var i = 0; i < ts.length; i++) {
      var t = ts[i];
      if (!g.dentro(t.x, t.y) || !g.comodo[t.y][t.x] || (com !== null && g.comodo[t.y][t.x] !== com)) return 'fora';
      com = g.comodo[t.y][t.x];
    }
    if (ts.some(function (t) { return !!g.parede[t.y][t.x] !== p.parede; })) return 'parede';
    // porta, escada, saída, NPC, spawn e onde ela chega pela escada; e outro objeto da mesma camada (tapete x móvel)
    var livres = [def.spawn].concat(chegadas(def)).filter(Boolean);
    var ruim = function (t) { return g.porta[t.y][t.x] || (g.ocupado[t.y][t.x] && g.ocupado[t.y][t.x] !== 'objeto') || livres.some(function (l) { return l.x === t.x && l.y === t.y; }); };
    var objs = (def.objetos || []).concat(outras);
    var choca = objs.some(function (o) {
      if (ehPlano(o) !== p.plano) return false;
      var b = tiles(o);
      return ts.some(function (t) { return b.some(function (u) { return u.x === t.x && u.y === t.y; }); });
    });
    if (choca || ts.some(ruim)) return 'ocupado';
    if (comJogador && !p.parede) {
      var J = window.Jogador, c = R.Cena && R.Cena.atual && R.Cena.atual();
      var jt = c && c.id === def.id && J && J.tile ? J.tile() : null;
      if (jt) {
        if (ts.some(function (t) { return t.x === jt.x && t.y === jt.y; })) return 'jogador';
      }
    }
    // o caminho: nada que se alcançava antes deixa de se alcançar
    if (!p.parede && !p.plano) {
      var antes = II.grade(def, objs), depois = II.grade(def, objs.concat([cand]));
      var o = origem(def), va = alcance(antes, o), vd = alcance(depois, o);
      if (alvos(def, antes).some(function (gr) { return algumNo(va, gr) && !algumNo(vd, gr); })) return 'bloqueia';
    }
    return null;
  }

  // as peças que ficam no andar: da mais nova para a mais velha, a que não cabe sobre as aceitas conta como guardada
  var memo = {};
  function resolver(andar) {
    var def = R.Interiores && R.Interiores.def(andar);
    if (!def) return [];
    var itens = campo('casaItens'), chave = JSON.stringify(itens) + '|' + JSON.stringify(campo('casaKits')) + '|' + JSON.stringify(campo('casaMoveis')) + '|' + (R.kitsCasa || []).length;
    var m = memo[andar];
    if (m && m.chave === chave && m.def === def) return m.lista;
    var cands = [];
    Object.keys(itens).forEach(function (uid) {
      var p = peca(uid), l = lugarGravado(p, itens[uid]);
      if (l && l.andar === andar) cands.push({ p: p, l: l, em: numeroOu(itens[uid].em, 0) });
    });
    cands.sort(function (a, b) { return b.em - a.em || (a.p.uid < b.p.uid ? -1 : 1); });
    var aceitas = [];
    cands.forEach(function (c) {
      var outras = aceitas.map(function (a) { return comoObjeto(a.p, a.l); });
      if (!motivo(def, outras, c.p, c.l.x, c.l.y, c.l.dir, false)) aceitas.push(c);
    });
    aceitas.sort(function (a, b) { return a.p.uid < b.p.uid ? -1 : 1; });
    memo[andar] = { chave: chave, def: def, lista: aceitas };
    return aceitas;
  }
  function lugarAtual(uid) {
    for (var i = 0; i < ANDARES.length; i++) {
      var c = resolver(ANDARES[i]).find(function (a) { return a.p.uid === uid; });
      if (c) return c.l;
    }
    return null;
  }

  // abas do modo decorar: os cômodos (na ordem de config.casa.kits) com o kit ganho ou algum móvel avulso
  function moveisDe(comodo) {
    var CM = R.CasaMoveis;
    return (R.moveisCasa || []).filter(function (m) { return (!comodo || m.comodo === comodo) && CM && CM.qtd(m.id) > 0; });
  }
  function abas() {
    var ganhos = kitsGanhos();
    return cfg().kits.filter(function (k) { return ganhos.indexOf(k) >= 0 || moveisDe(k).length > 0; });
  }
  // as peças de uma aba (sem aba: todas): as do kit, depois os móveis avulsos daquele cômodo
  function pecas(aba) {
    var kits = !aba ? kitsGanhos() : kitsGanhos().filter(function (k) { return k === aba; }), l = [];
    var junta = function (uid) {
      var p = peca(uid);
      if (p) l.push({ uid: p.uid, kit: p.kit, item: p.item, objeto: p.objeto, nome: p.nome, direcoes: p.direcoes, parede: p.parede, lugar: lugarAtual(p.uid) });
    };
    kits.forEach(function (k) {
      (kitDef(k) || { itens: [] }).itens.forEach(function (item) { for (var n = 1; n <= (item.qtd || 1); n++) junta(k + '.' + item.id + '.' + n); });
    });
    (aba ? moveisDe(aba) : cfg().kits.reduce(function (t, k) { return t.concat(moveisDe(k)); }, [])).forEach(function (m) {
      for (var n = 1; n <= R.CasaMoveis.qtd(m.id); n++) junta(MOVEL + '.' + m.id + '.' + n);
    });
    return l;
  }
  function podeColocar(uid, andar, x, y, dir) {
    var p = peca(uid), def = p && ANDARES.indexOf(andar) >= 0 && R.Interiores && R.Interiores.def(andar);
    if (!def) return { ok: false, motivo: 'fora' };
    var outras = resolver(andar).filter(function (a) { return a.p.uid !== uid; }).map(function (a) { return comoObjeto(a.p, a.l); });
    var m = motivo(def, outras, p, x, y, dir, true);
    return { ok: !m, motivo: m };
  }
  function refazer(andar) { var II = R.Interiores; if (andar && II && II.refazer) II.refazer(andar); }
  function colocar(uid, andar, x, y, dir) {
    if (!podeColocar(uid, andar, x, y, dir).ok) return false;
    var antes = lugarAtual(uid), itens = paraGravar('casaItens');
    itens[uid] = { andar: andar, x: x, y: y, dir: dir, em: carimbo(itens[uid]) };
    P.salvar();
    if (antes && antes.andar !== andar) refazer(antes.andar);
    refazer(andar);
    return true;
  }
  function guardar(uid) {
    if (!peca(uid)) return false;
    var r = campo('casaItens')[uid], antes = lugarAtual(uid);
    if (!objeto(r) || r.guardado) return true;
    var itens = paraGravar('casaItens');
    itens[uid] = { guardado: true, em: carimbo(itens[uid]) };
    P.salvar();
    if (antes) refazer(antes.andar);
    return true;
  }
  // a próxima direção do botão Girar que a peça aceita
  function proximaDirecao(uid, dir) {
    var p = peca(uid), passo = cfg().passoGirar;
    if (!p) return 'baixo';
    for (var i = 1; i <= passo.length; i++) {
      var d = passo[(passo.indexOf(dir) + i) % passo.length];
      if (p.dirs.indexOf(d) >= 0) return d;
    }
    return 'baixo';
  }
  function objetosDoAndar(andar) { return resolver(andar).map(function (a) { return comoObjeto(a.p, a.l); }); }
  function comodoEm(andar, x, y) {
    var def = R.Interiores && R.Interiores.def(andar), g = def && R.Interiores.grade(def, def.objetos || []);
    return g && g.dentro(x, y) ? g.comodo[y][x] : null;
  }

  /* ---------- a caixa de mudança (ação 'casaDecorar') ---------- */
  // o Claude, sem kit (até 30 letras por frase; nada de nome: casa.md §10)
  var FALAS = { semKit: ['Complete uma matéria!', 'Assim você ganha móveis.'] };
  function falar(pags) {
    if (!R.Claude || !R.Claude.falar) return Promise.resolve(null);
    return R.Claude.falar(pags.join(' '), { fala: pags, voz: 'claude' });
  }
  function casaDecorar(acao) {
    var UI = R.UI || {}, kit = acao && acao.kit;
    var decorar = function () { return abas().length && UI.decorarCasa ? UI.decorarCasa({ kit: kit }) : null; };
    var moveis = R.CasaMoveis && R.CasaMoveis.pendentes().length > 0 && UI.casaMoveisPendentes;
    var kits = kitsPendentes() > 0 && UI.casaKitsPendentes;
    if (moveis || kits) {
      return Promise.resolve(moveis ? UI.casaMoveisPendentes() : null)
        .then(function () { return kits ? UI.casaKitsPendentes() : null; }).then(decorar);
    }
    if (abas().length) return Promise.resolve(decorar());
    return falar(FALAS.semKit);
  }

  R.Casa = {
    FALAS: FALAS,
    ganhou: function () { return !!campo('casaBau').em; },
    abrirBau: function () {
      if (R.Casa.ganhou()) return false;
      P.estado().casaBau = { em: I.agora() };
      P.salvar();
      return true;
    },
    kitsGanhos: kitsGanhos, kitsLivres: kitsLivres, kitsPendentes: kitsPendentes, escolherKit: escolherKit, nomeKit: nomeKit,
    pecas: pecas, abas: abas, podeColocar: podeColocar, colocar: colocar, guardar: guardar, proximaDirecao: proximaDirecao,
    objetosDoAndar: objetosDoAndar, comodoEm: comodoEm,
  };

  R.registrarModulo({
    id: 'casa',
    acoes: { casaDecorar: casaDecorar },
    falas: function () { return FALAS.semKit.map(function (t) { return { texto: t }; }); },
    depurar: function () {
      if (!P.estado()) return null;
      return { ganhou: R.Casa.ganhou(), kits: kitsGanhos(), livres: kitsLivres(), pendentes: kitsPendentes(),
        casa: objetosDoAndar('casa').length, casa2: objetosDoAndar('casa-2').length };
    },
  });
})();
