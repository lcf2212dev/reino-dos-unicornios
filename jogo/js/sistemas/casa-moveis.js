/* Casa do jogador, os móveis avulsos (docs/contratos/casa.md §12): um à escolha por sala feita.
   Campo (save-e-mescla.md §11; mantém no Novo ciclo e vai na cópia -novidades):
     casaMoveis { <chave>: { movel, em } }; carimbo (por chave, o `em` maior). Escolha é para sempre.
   Chave = id da sala, ou a de uma fonte registrada (registrarFonte; ex.: 'bosque:<nível>', do Bosque dos Fantasmas).
   Contam as salas feitas das matérias que dão kit (bimestre >= config.casa.desdeBimestre), só com a casa ganha.
   Derivado (nunca no save): quantos de cada móvel ela tem (as salas que o escolheram), as salas pendentes e os
   móveis sorteados de cada sala. Peça de um móvel (uid) = 'movel.<id>.<n>', n de 1 ao tanto que ela tem; as regras
   de peça, lugar e modo decorar são as de sistemas/casa.js.
   Sorteio: fixo por sala (semente = sala + o `em` do baú da casa), os que ela ainda não tem primeiro; faltando
   novos, completa com repetidos (ganha mais um igual). node: true: nada de DOM no carregamento. */
(function () {
  var R = window.Reino, P = R.Progresso, I = R._progresso;
  var objeto = I.objeto, numeroOu = I.numeroOu;

  P.registrarCampo('casaMoveis', {
    padrao: function () { return {}; },
    mesclar: 'carimbo',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ lp10a1: { movel: 'piano', em: 10 }, en11e1: { movel: 'lareira', em: 30 } },
      { lp10a1: { movel: 'aquario', em: 20 }, lp10a2: { movel: 'piano', em: 5 } }],
  });

  function cfg() { return R.config.casa; }
  function campo() { var e = P.estado(); return e && objeto(e.casaMoveis) ? e.casaMoveis : {}; }
  function def(id) { return R.movelCasa ? R.movelCasa(id) : undefined; }
  // a escolha gravada de uma sala, se for de um móvel que existe (senão a sala continua pendente)
  function escolhido(r) { return objeto(r) && typeof r.movel === 'string' && def(r.movel) ? r.movel : null; }
  function tem(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  /** quantas peças do móvel ela tem: as salas que o escolheram */
  function qtd(id) {
    var c = campo(), n = 0;
    Object.keys(c).forEach(function (s) { if (escolhido(c[s]) === id) n++; });
    return n;
  }
  // salas que contam: feitas, das matérias que dão kit, na ordem das matérias e das salas
  function salasQueContam() {
    var e = P.estado(), salas = (e && e.salas) || {}, l = [];
    (R.materias || []).forEach(function (m) {
      if ((m.bimestre || 0) < cfg().desdeBimestre) return;
      (m.salas || []).forEach(function (s) { if (salas[s.id] && salas[s.id].feita) l.push({ sala: s, materia: m }); });
    });
    return l;
  }
  // outras fontes de móvel além das salas: { id, chaves() → [chave], titulo(chave) → texto, soNovos? }, na ordem do
  // registro. soNovos: as opções da chave são só os móveis que ela ainda não tem (sem "Mais um!" nem repetidos)
  var fontes = [];
  /** registra uma fonte de móveis (chaves próprias, que não colidem com ids de sala; ex.: 'bosque:3') */
  function registrarFonte(def) {
    if (!def || typeof def.id !== 'string' || typeof def.chaves !== 'function' || typeof def.titulo !== 'function') return false;
    if (fontes.some(function (f) { return f.id === def.id; })) return false;
    fontes.push({ id: def.id, chaves: def.chaves, titulo: def.titulo, soNovos: !!def.soNovos });
    return true;
  }
  // as chaves de todas as fontes, com a fonte de cada uma (fonte com defeito não trava a lista)
  function chavesDasFontes() {
    var l = [];
    fontes.forEach(function (f) {
      var ks = [];
      try { ks = f.chaves() || []; } catch (e) { ks = []; }
      ks.forEach(function (k) { if (typeof k === 'string' && k) l.push({ chave: k, fonte: f }); });
    });
    return l;
  }
  function vale() { return !!(R.Casa && R.Casa.ganhou() && (R.moveisCasa || []).length); }
  /** a chave (sala ou de fonte) já tem o móvel escolhido? */
  function escolhida(chave) { var c = campo(); return tem(c, chave) && !!escolhido(c[chave]); }
  function livre(k) { return !escolhida(k); }
  /** só as salas que ainda dão um móvel (sem as fontes: uma fonte pode contar com elas sem dar volta) */
  function salasPendentes() {
    return vale() ? salasQueContam().map(function (x) { return x.sala.id; }).filter(livre) : [];
  }
  /** as chaves (ids das salas, depois as das fontes) que ainda dão um móvel, na ordem; nada antes de ganhar a casa */
  function pendentes() {
    if (!vale()) return [];
    var salas = salasQueContam().map(function (x) { return x.sala.id; });
    var outras = chavesDasFontes().map(function (x) { return x.chave; })
      .filter(function (k, i, l) { return salas.indexOf(k) < 0 && l.indexOf(k) === i; });
    return salas.concat(outras).filter(livre);
  }
  function salaInfo(salaId) { return salasQueContam().find(function (x) { return x.sala.id === salaId; }) || null; }
  /** o texto do presente na tela de escolha: o da sala, ou o da fonte da chave; '' se a chave não é de ninguém */
  function titulo(chave) {
    var info = salaInfo(chave);
    if (info) return 'Presente da sala “' + info.sala.nome + '”';
    var x = chavesDasFontes().find(function (y) { return y.chave === chave; });
    if (!x) return '';
    try { return String(x.fonte.titulo(chave) || ''); } catch (e) { return ''; }
  }

  // sorteio fixo: um número da semente (FNV-1a) e o embaralhar de Fisher-Yates com mulberry32
  function semente(t) {
    var h = 2166136261;
    for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function sorteador(s) {
    return function () {
      s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /** os móveis sorteados para a sala (ou chave de fonte; ids): os que ela não tem primeiro, até config.casa.moveisOpcoes */
  function opcoes(salaId) {
    var bau = (P.estado() && objeto(P.estado().casaBau) && numeroOu(P.estado().casaBau.em, 0)) || 0;
    var rnd = sorteador(semente(String(salaId) + '|' + bau)), ids = (R.moveisCasa || []).map(function (m) { return m.id; });
    for (var i = ids.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = ids[i]; ids[i] = ids[j]; ids[j] = t; }
    var novos = ids.filter(function (id) { return !qtd(id); }), repetidos = ids.filter(function (id) { return qtd(id) > 0; });
    if (!salaInfo(salaId) && chavesDasFontes().some(function (x) { return x.chave === salaId && x.fonte.soNovos; })) repetidos = [];
    return novos.concat(repetidos).slice(0, Math.max(1, cfg().moveisOpcoes || 5));
  }
  /** grava o móvel da sala; false se a sala não está pendente ou o móvel não foi sorteado para ela */
  function escolher(salaId, movelId) {
    if (pendentes().indexOf(salaId) < 0 || opcoes(salaId).indexOf(movelId) < 0) return false;
    var e = P.estado();
    if (!objeto(e.casaMoveis)) e.casaMoveis = {};
    var antigo = e.casaMoveis[salaId];
    // sempre maior que o carimbo anterior da sala (o relógio pode ter voltado)
    e.casaMoveis[salaId] = { movel: movelId, em: Math.max(I.agora(), (objeto(antigo) ? numeroOu(antigo.em, 0) : 0) + 1) };
    P.salvar();
    return true;
  }
  /** os ids dos móveis que ela tem (ao menos uma peça), na ordem do registro */
  function ganhos() { return (R.moveisCasa || []).filter(function (m) { return qtd(m.id) > 0; }).map(function (m) { return m.id; }); }

  R.CasaMoveis = { qtd: qtd, pendentes: pendentes, salasPendentes: salasPendentes, escolhida: escolhida, salaInfo: salaInfo,
    titulo: titulo, opcoes: opcoes, escolher: escolher, ganhos: ganhos, registrarFonte: registrarFonte };

  R.registrarModulo({
    id: 'casa-moveis',
    depurar: function () {
      if (!P.estado()) return null;
      return { pendentes: pendentes().length, ganhos: ganhos().length };
    },
  });
})();
