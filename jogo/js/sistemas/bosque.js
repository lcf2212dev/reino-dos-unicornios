/* Bosque dos Fantasmas: as regras e o save (docs/contratos/bosque.md §4, §5). Reino.Bosque.
   Campos (save-e-mescla.md §11; mantêm no Novo ciclo e vão na cópia -novidades):
     bosque { acertos, espada, vencidos }; contadores (por chave, o maior). espada = 0 ou 1; vencidos = perguntas
       respondidas (uma por fantasma vencido, certa ou não).
     bosquePontos { '<nível>': { h: 'forca'|'vida'|'velocidade', em } }; carimbo (por nível, o `em` maior). Um ponto
       por nível, do 2 em diante; a escolha é para sempre.
   Derivados (nunca no save): nível = min(nivelMax, 1 + floor(acertos / acertosPorNivel)); pontos = as escolhas
   válidas de nível <= o atual; pendentes = níveis 2..atual sem escolha; dano, vida máxima e fator de velocidade.
   Pergunta: sorteio uniforme entre TODAS as perguntas do bimestre em curso (sala feita ou não), sem fila.
   Móvel por nível: fonte 'bosque' do Reino.CasaMoveis, chaves 'bosque:<n>' dos níveis 2..atual ainda sem móvel
   (casa.md §12), só com móveis que ela ainda não tem: no máximo tantas chaves (as dos níveis mais baixos) quantos
   móveis lhe faltam, menos as salas pendentes; com todos, nenhum nível fica pendente.
   As falas do Claude no Bosque: sistemas/bosque-falas.js (Reino.BosqueFalas).
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino, P = R.Progresso, I = R._progresso, U = R.util;
  var objeto = I.objeto, numeroOu = I.numeroOu;
  var HABILIDADES = ['forca', 'vida', 'velocidade'];
  function cfg() { return R.config.fantasmas; }

  /* ================= NO SAVE ================= */
  P.registrarCampo('bosque', {
    padrao: function () { return { acertos: 0, espada: 0, vencidos: 0 }; },
    mesclar: 'contadores',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ acertos: 12, espada: 1, vencidos: 20 }, { acertos: 25, espada: 0, vencidos: 18 }],
  });
  P.registrarCampo('bosquePontos', {
    padrao: function () { return {}; },
    mesclar: 'carimbo',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ 2: { h: 'forca', em: 10 }, 3: { h: 'vida', em: 30 } }, { 2: { h: 'velocidade', em: 20 }, 4: { h: 'forca', em: 5 } }],
  });

  function estado() { try { return P.estado(); } catch (e) { return null; } }
  function campo() { var e = estado(); return e && objeto(e.bosque) ? e.bosque : {}; }
  function contador(k) { var v = campo()[k]; return typeof v === 'number' && v > 0 && isFinite(v) ? Math.floor(v) : 0; }
  // soma n ao contador (sem gravar); false sem save
  function somar(k, n) {
    var e = estado();
    if (!e) return false;
    if (!objeto(e.bosque)) e.bosque = { acertos: 0, espada: 0, vencidos: 0 };
    e.bosque[k] = contador(k) + n;
    return true;
  }
  function emitir(carga) { if (U && U.emit && R.EVENTOS) U.emit(R.EVENTOS.BOSQUE, carga); }

  /* ================= NÍVEL E XP ================= */
  function nivelDe(acertos) { return Math.min(cfg().nivelMax, 1 + Math.floor(acertos / cfg().acertosPorNivel)); }
  function acertos() { return contador('acertos'); }
  function nivel() { return nivelDe(acertos()); }
  /** a barra do nível: n de `de` acertos; no nível máximo, cheia */
  function xp() {
    var de = cfg().acertosPorNivel;
    if (nivel() >= cfg().nivelMax) return { n: de, de: de, maximo: true };
    return { n: acertos() % de, de: de, maximo: false };
  }
  function temEspada() { return contador('espada') > 0; }
  /** dá a espada; true só na 1ª vez */
  function ganharEspada() {
    if (temEspada() || !estado()) return false;
    somar('espada', 1);
    P.salvar();
    return true;
  }

  /* ================= PONTOS ================= */
  function escolhas() { var e = estado(); return e && objeto(e.bosquePontos) ? e.bosquePontos : {}; }
  // a habilidade gravada para o nível, se for válida (senão o nível continua pendente)
  function escolhaDe(n) {
    var c = escolhas(), r = Object.prototype.hasOwnProperty.call(c, String(n)) ? c[n] : null;
    return objeto(r) && HABILIDADES.indexOf(r.h) >= 0 ? r.h : null;
  }
  function pontos() {
    var r = { forca: 0, vida: 0, velocidade: 0 };
    for (var n = 2; n <= nivel(); n++) { var h = escolhaDe(n); if (h) r[h]++; }
    return r;
  }
  function pontosPendentes() {
    var l = [];
    for (var n = 2; n <= nivel(); n++) if (!escolhaDe(n)) l.push(n);
    return l;
  }
  /** põe o ponto do nível n; false se o nível não chegou, já tem escolha ou a habilidade não existe */
  function porPonto(n, h) {
    var e = estado();
    if (!e || HABILIDADES.indexOf(h) < 0 || n !== Math.floor(n) || n < 2 || n > nivel() || escolhaDe(n)) return false;
    if (!objeto(e.bosquePontos)) e.bosquePontos = {};
    var antigo = e.bosquePontos[n];
    // sempre maior que o carimbo anterior do nível (o relógio pode ter voltado)
    e.bosquePontos[n] = { h: h, em: Math.max(I.agora(), (objeto(antigo) ? numeroOu(antigo.em, 0) : 0) + 1) };
    P.salvar();
    emitir({ tipo: 'ponto', nivel: n, h: h });
    return true;
  }
  function jog() { return cfg().jogador; }
  function dano() { return jog().danoBase + pontos().forca * jog().danoPorPonto; }
  function vidaMax() { return jog().vidaBase + pontos().vida * jog().vidaPorPonto; }
  function fatorVelocidade() { return Math.min(jog().velocidadeMax, 1 + pontos().velocidade * jog().velocidadePorPonto); }
  function noBosque() {
    var c = R.Cena && R.Cena.atual ? R.Cena.atual() : null;
    return !!(c && c.tipo === 'interior' && c.id === 'bosque');
  }

  /* ================= PERGUNTA ================= */
  // todas as perguntas do bimestre em curso: matérias dele e não arquivadas, sala feita ou não, de todo tipo com
  // resposta conferível (menos config.fantasmas.perguntaForaTipos, a pergunta pessoal, `livre`, e o `escrever` sem `chaves`)
  function perguntas() {
    var fora = cfg().perguntaForaTipos, bim = R.Bimestres && R.Bimestres.atual, lista = [];
    (R.materias || []).forEach(function (m) {
      if (m.arquivada || bim === undefined || m.bimestre !== bim) return;
      (m.salas || []).forEach(function (s) {
        (s.desafios || []).forEach(function (d) {
          if (R.tiposDesafio[d.tipo] && fora.indexOf(d.tipo) < 0 && !d.livre && !(d.tipo === 'escrever' && !(d.chaves && d.chaves.length))) lista.push({ materia: m, sala: s, desafio: d });
        });
      });
    });
    return lista;
  }
  /** uma pergunta sorteada, cada uma com a mesma chance (sem fila nem evitar repetição); null sem nenhuma */
  function pergunta() {
    var l = perguntas();
    return l.length ? U.sortear(l, 'bosque:pergunta') : null;
  }

  /* ================= RESPOSTA ================= */
  /** pergunta certa: 1 acerto (XP), estrelas, Aura; subiu = o nível novo (ou null) */
  function acertou(materiaId) {
    var antes = nivel(), n = cfg().estrelasPorAcerto;
    if (!somar('acertos', 1)) return { estrelas: 0, nivel: antes, subiu: null };
    somar('vencidos', 1);
    P.ganharEstrelas(n);
    P.salvar();
    if (R.Aura && R.Aura.contar) R.Aura.contar([true], materiaId);
    var depois = nivel();
    emitir({ tipo: 'acerto', materia: materiaId, nivel: depois });
    return { estrelas: n, nivel: depois, subiu: depois > antes ? depois : null };
  }
  /** pergunta errada (ou fechada): nada se perde; conta o fantasma vencido e a Aura */
  function errou(materiaId) {
    if (somar('vencidos', 1)) P.salvar();
    if (R.Aura && R.Aura.contar) R.Aura.contar([false], materiaId);
  }
  function chaveMovel(n) { return 'bosque:' + n; }

  R.Bosque = { acertos: acertos, nivel: nivel, xp: xp, temEspada: temEspada, ganharEspada: ganharEspada,
    pontos: pontos, pontosPendentes: pontosPendentes, porPonto: porPonto, dano: dano, vidaMax: vidaMax,
    fatorVelocidade: fatorVelocidade, noBosque: noBosque, pergunta: pergunta, perguntas: perguntas,
    acertou: acertou, errou: errou, chaveMovel: chaveMovel, HABILIDADES: HABILIDADES };

  // a velocidade dela: o fator só dentro do Bosque (Jogador não existe no Node)
  if (window.Jogador && window.Jogador.registrarFatorVelocidade) {
    window.Jogador.registrarFatorVelocidade(function () { return noBosque() ? fatorVelocidade() : 1; });
  }
  // um móvel da casa por nível (do 2 ao atual), só entre os que ela ainda não tem (pedido do Leandro, 05/11): sem
  // repetido nem "Mais um!"; com todos já ganhos, nenhum nível fica pendente (fica sem móvel). A fila só tem o que
  // pode virar móvel novo: tantas chaves (dos níveis mais baixos) quantos móveis faltam, menos as salas pendentes
  // (a sala oferece os novos primeiro; se ela escolher um repetido lá, a chave do nível volta para a fila)
  function chavesMovel() {
    var CM = R.CasaMoveis, l = [];
    var faltam = (R.moveisCasa || []).filter(function (m) { return !CM.qtd(m.id); }).length - CM.salasPendentes().length;
    for (var n = 2; n <= nivel() && l.length < faltam; n++) if (!CM.escolhida(chaveMovel(n))) l.push(chaveMovel(n));
    return l;
  }
  if (R.CasaMoveis && R.CasaMoveis.registrarFonte) R.CasaMoveis.registrarFonte({
    id: 'bosque',
    soNovos: true,
    chaves: chavesMovel,
    titulo: function (chave) { return 'Presente do nível ' + String(chave).slice(7); },
  });

  R.registrarModulo({
    id: 'bosque',
    depurar: function () {
      if (!estado()) return null;
      return { acertos: acertos(), nivel: nivel(), xp: xp(), espada: temEspada(), vencidos: contador('vencidos'),
        pontos: pontos(), pendentes: pontosPendentes().length, dano: dano(), vidaMax: vidaMax(),
        fatorVelocidade: fatorVelocidade(), noBosque: noBosque(), perguntas: perguntas().length };
    },
  });
})();
