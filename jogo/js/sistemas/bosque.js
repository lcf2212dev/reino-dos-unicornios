/* Bosque dos Fantasmas e as outras arenas: as regras e o save (docs/contratos/bosque.md §4, §5; arenas.md). Reino.Bosque.
   O placar é um só para todas as arenas (o Bosque e os mapas novos, motor/interiores-arena.js).
   Campos (save-e-mescla.md §11; mantêm no Novo ciclo e vão na cópia -novidades):
     bosque { acertos, espada, vencidos, mortos, perguntasFeitas, migrado, abates?, xp?, tercos?, certas? };
       contadores (por chave, o maior). espada = 0 ou 1; vencidos = perguntas respondidas.
       LEGADO (só a versão antiga do jogo ainda soma): mortos = inimigos mortos (a mosca conta 2), perguntasFeitas =
       blocos de 10 consumidos, acertos = perguntas certas. A versão de hoje não mexe neles (a não ser a migração
       antiga, abaixo): assim um aparelho velho e um novo nunca contam a mesma coisa duas vezes.
       NOVOS (só esta versão soma; ausentes = 0, o save novo sai igual): abates = inimigos mortos desde o XP, xp = o XP
       ganho desde então, tercos = perguntas de terço consumidas, certas = perguntas certas.
       migrado = 1 depois da migração do save antigo por acertos (o piso é reaplicado nas leituras). Num save novo sem
       nível antigo, fica 1 na memória e vai para o arquivo na primeira gravação de verdade.
     bosquePontos { '<nível>': { h: 'forca'|'vida'|'velocidade', em } }; carimbo (por nível, o `em` maior). Um ponto
       por nível, do 2 em diante; a escolha é para sempre.
   Derivados (nunca no save; pedido do Leandro, 05/11: XP e a pergunta a cada terço do nível):
     XP total = xpLegado(mortos) + xp. xpLegado(m) = o XP do nível antigo (1 + floor(m / 30)) mais a mesma fração da
       barra: quem já jogava fica no mesmo nível, na mesma fração e com as mesmas perguntas pendentes (sem gravar nada).
     nível = o da curva config.fantasmas.xpNivel (o nível N pede base + passo × (N - 1)), até nivelMax;
     perguntas liberadas = 3 por nível passado + as marcas de 1/3 e 2/3 já passadas no nível; pendentes = liberadas −
       perguntasFeitas − tercos (as antigas seguem valendo: um bloco de 10 era um terço de nível);
     pontos = as escolhas válidas de nível <= o atual; pendentes = níveis 2..atual sem escolha; dano, vida máxima e
     fator de velocidade.
   Migração antiga (por acertos, idempotente): o nível de quem jogava antes dos mortos era 1 + floor(acertos /
   acertosPorNivel); ela vira mortos = (nível antigo - 1) * mortosPorNivel e perguntasFeitas, sem nada retroativo.
   Pergunta: sorteio uniforme entre TODAS as perguntas do bimestre em curso (sala feita ou não), sem fila.
   Prêmio de móvel (casa.md §12): o nível e a pergunta certa gravam um móvel surpresa em CasaMoveis.presente, com as
   chaves 'bosque:<nível>' e 'bosque:p<n>' (n = a pergunta consumida, contando as antigas); o móvel é gravado ANTES do
   baú abrir (fechar o jogo não perde nada). Falas do Claude: sistemas/bosque-falas.js (Reino.BosqueFalas).
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino, P = R.Progresso, I = R._progresso, U = R.util;
  var objeto = I.objeto, numeroOu = I.numeroOu;
  var HABILIDADES = ['forca', 'vida', 'velocidade'];
  function cfg() { return R.config.fantasmas; }
  function porBloco() { return cfg().perguntasPorBloco || 10; }
  function porNivel() { return cfg().mortosPorNivel || 30; }
  function porNivelPerguntas() { return cfg().perguntasPorNivel || 3; }
  // a arena de agora (interior registrado com Reino.registrarArena), ou null
  function arenaAtual() {
    var c = R.Cena && R.Cena.atual ? R.Cena.atual() : null;
    return R.Arenas && c && c.tipo === 'interior' ? R.Arenas.daCena(c) : null;
  }
  function cfgArena(id) { return R.Arenas ? R.Arenas.cfg(id || arenaAtual() || 'bosque') : cfg(); }

  /* ================= NO SAVE ================= */
  function padrao() { return { acertos: 0, espada: 0, vencidos: 0, mortos: 0, perguntasFeitas: 0, migrado: 0 }; }
  P.registrarCampo('bosque', {
    padrao: padrao,
    mesclar: 'contadores',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ acertos: 12, espada: 1, vencidos: 20, mortos: 60, perguntasFeitas: 6, migrado: 1, abates: 14, xp: 180, tercos: 2, certas: 1 },
      { acertos: 25, espada: 0, vencidos: 18, mortos: 30, perguntasFeitas: 3, migrado: 1, abates: 30, xp: 410, tercos: 4, certas: 3 }],
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
    if (!objeto(e.bosque)) e.bosque = padrao();
    e.bosque[k] = contador(k) + n;
    return true;
  }
  function emitir(carga) { if (U && U.emit && R.EVENTOS) U.emit(R.EVENTOS.BOSQUE, carga); }

  /* ================= MIGRAÇÃO DO SAVE ANTIGO ================= */
  // Idempotente e só para cima: o piso do nível antigo (por acertos) é reaplicado em toda leitura, porque a mescla
  // pode trazer acertos antigos com mortos novos; a conta nunca desce. O `migrado` é a marca da correção, mas NÃO é
  // porteira. O nível antigo vira mortos, e as perguntas do trecho legado viram perguntasFeitas (sem pergunta
  // retroativa). Roda no `iniciar` e nas leituras.
  function migrar() {
    var e = estado();
    if (!e) return false;
    if (!objeto(e.bosque)) e.bosque = padrao();
    var base = contador('mortos'), antigas = contador('perguntasFeitas');
    var nivelAntigo = 1 + Math.floor(contador('acertos') / (cfg().acertosPorNivel || 10));
    var legado = (nivelAntigo - 1) * porNivel();
    var mortos = Math.max(base, legado);
    // só o trecho legado consome perguntas; o que veio de mortos novos continua pendente
    var novasFeitas = legado > base ? Math.max(antigas, Math.floor(legado / porBloco())) : antigas;
    var mudou = mortos !== base || novasFeitas !== antigas;
    e.bosque.mortos = mortos;
    e.bosque.perguntasFeitas = novasFeitas;
    e.bosque.migrado = 1;
    // save novo (sem nível antigo): só marca na memória; a primeira gravação de verdade leva o migrado junto.
    // Evita uma gravação extra na abertura (que mexia no relógio dos cuidados e nas fotos do e2e).
    if (mudou) P.salvar();
    return mudou;
  }

  /* ================= XP E NÍVEL (puros: a curva de config.fantasmas.xpNivel) ================= */
  function curva() { return cfg().xpNivel || { base: 300, passo: 30 }; }
  /** XP para sair do nível n */
  function xpDoNivel(n) { var c = curva(); return c.base + c.passo * (n - 1); }
  /** XP total para chegar ao nível n */
  function xpAte(n) { var c = curva(), k = n - 1; return k * c.base + c.passo * k * (k - 1) / 2; }
  /** o nível de um XP total (a conta fechada da curva, conferida nas pontas), até nivelMax */
  function nivelDoXp(x) {
    var c = curva(), k;
    if (c.passo > 0) { var a = c.passo / 2, b = c.base - a; k = Math.floor((-b + Math.sqrt(b * b + 4 * a * x)) / (2 * a)); }
    else k = Math.floor(x / c.base);
    k = Math.max(0, k);
    while (k > 0 && xpAte(k + 1) > x) k--;
    while (xpAte(k + 2) <= x) k++;
    return Math.min(cfg().nivelMax, k + 1);
  }
  /** o XP de `m` inimigos mortos do placar antigo: o nível antigo (1 por 30) e a mesma fração da barra */
  function xpLegado(m) {
    var pn = porNivel(), L = Math.min(cfg().nivelMax, 1 + Math.floor(m / pn)), r = m - (L - 1) * pn;
    return xpAte(L) + Math.ceil(r * xpDoNivel(L) / pn);
  }
  // as marcas do nível: a k-ésima pergunta do nível vem em ceil(k * X / q) de XP dentro dele (k = q: o nível seguinte)
  function marca(k, X) { return Math.ceil(k * X / porNivelPerguntas()); }
  /** quantas perguntas o XP total já liberou: q por nível passado e as marcas já passadas no nível de agora */
  function tercosDe(x) {
    var L = nivelDoXp(x), X = xpDoNivel(L), r = x - xpAte(L), q = porNivelPerguntas(), t = (L - 1) * q;
    while (r >= X) { t += q; r -= X; }   // só no nível máximo: a barra segue dando perguntas
    for (var k = 1; k < q; k++) if (r >= marca(k, X)) t++;
    return t;
  }
  function xpTotal() { migrar(); return xpLegado(contador('mortos')) + contador('xp'); }
  function acertos() { migrar(); return contador('acertos') + contador('certas'); }
  /** o placar "Inimigos mortos": os do placar antigo e os de agora */
  function mortos() { migrar(); return contador('mortos') + contador('abates'); }
  function nivel() { return nivelDoXp(xpTotal()); }
  /** a barra do nível: n de `de` XP; no nível máximo, cheia */
  function xp() {
    var x = xpTotal(), L = nivelDoXp(x), de = xpDoNivel(L);
    if (L >= cfg().nivelMax) return { n: de, de: de, maximo: true };
    return { n: x - xpAte(L), de: de, maximo: false };
  }
  // perguntas já consumidas: os blocos antigos e os terços de agora (numeração contínua dos presentes 'bosque:p<n>')
  function feitas() { return contador('perguntasFeitas') + contador('tercos'); }
  /** quantas perguntas de terço estão esperando resposta (0 ou 1 no jogo normal) */
  function perguntasPendentes() { return Math.max(0, tercosDe(xpTotal()) - feitas()); }
  /** a próxima pergunta: n de `de` XP do terço de agora (pct = 0 a 99) e qual marca do nível ela é (1 a 3) */
  function proximaPergunta() {
    var x = xpTotal(), L = nivelDoXp(x), X = xpDoNivel(L), r = x - xpAte(L), q = porNivelPerguntas(), k = 0;
    while (r >= X) r -= X;
    while (k < q - 1 && r >= marca(k + 1, X)) k++;
    var de = marca(k + 1, X) - marca(k, X), n = r - marca(k, X);
    return { n: n, de: de, pct: Math.min(99, Math.floor(n * 100 / de)), marca: k + 1 };
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
  /** numa arena (o Bosque ou um mapa novo): o chip, a espada, a pergunta e o fator de velocidade valem */
  function naArena() { return !!arenaAtual(); }

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

  /* ================= PLACAR E PRÊMIOS ================= */
  function presenteDe(chave) {
    var CM = R.CasaMoveis;
    return CM && CM.presente ? CM.presente(chave) : null;
  }
  /** um inimigo morto do tipo, na arena (padrão: a de agora; sem arena, o Bosque): soma o placar (a mosca e o voador
      contam 2) e o XP do tipo, salva, avisa e, se subiu, já grava o móvel do nível */
  function abater(tipo, arena) {
    migrar();
    if (!estado()) return { mortos: 0, perguntas: 0, subiu: null, premioNivel: null, xp: 0 };
    var t = (cfgArena(arena).tipos || {})[tipo], n = t && t.mortos > 0 ? Math.floor(t.mortos) : 1;
    var ganho = t && t.xp > 0 ? Math.floor(t.xp) : n * 10, antes = nivel();
    somar('abates', n);
    somar('xp', ganho);
    var depois = nivel(), subiu = depois > antes ? depois : null, total = mortos();
    P.salvar();
    emitir({ tipo: 'abate', mortos: total, subiu: subiu, xp: ganho });
    var premioNivel = subiu ? presenteDe(chaveMovel(subiu)) : null;
    return { mortos: total, perguntas: perguntasPendentes(), subiu: subiu, premioNivel: premioNivel, xp: ganho };
  }

  /* ================= RESPOSTA ================= */
  /** pergunta certa: 1 estrela, Aura e um móvel surpresa se havia pergunta pendente (consome UMA); NÃO sobe nível */
  function acertou(materiaId) {
    migrar();
    var antes = nivel(), n = cfg().estrelasPorAcerto;
    var pendente = perguntasPendentes() > 0, feitasAntes = feitas();
    if (!somar('certas', 1)) return { estrelas: 0, nivel: antes, presente: null };
    somar('vencidos', 1);
    if (pendente) somar('tercos', 1);
    P.ganharEstrelas(n);
    if (R.Aura && R.Aura.contar) R.Aura.contar([true], materiaId);
    // o móvel entra no MESMO save da pergunta consumida: um crash entre os dois não perde o prêmio
    var presente = pendente ? presenteDe('bosque:p' + (feitasAntes + 1)) : null;
    P.salvar();
    var nivelAtual = nivel();
    emitir({ tipo: 'acerto', materia: materiaId, nivel: nivelAtual, presente: presente });
    return { estrelas: n, nivel: nivelAtual, presente: presente };
  }
  /** pergunta errada (ou fechada): nada se perde; consome a pergunta pendente, conta o vencido e a Aura */
  function errou(materiaId) {
    migrar();
    if (estado()) {
      if (perguntasPendentes() > 0) somar('tercos', 1);
      somar('vencidos', 1);
      P.salvar();
    }
    if (R.Aura && R.Aura.contar) R.Aura.contar([false], materiaId);
  }
  /** consome uma pergunta pendente sem prêmio (quando o bimestre não tem pergunta): true se consumiu */
  function consumirPergunta() {
    migrar();
    if (!estado() || perguntasPendentes() <= 0) return false;
    somar('tercos', 1);
    P.salvar();
    return true;
  }
  function chaveMovel(n) { return 'bosque:' + n; }

  R.Bosque = { acertos: acertos, mortos: mortos, nivel: nivel, xp: xp, xpTotal: xpTotal, temEspada: temEspada, ganharEspada: ganharEspada,
    pontos: pontos, pontosPendentes: pontosPendentes, porPonto: porPonto, dano: dano, vidaMax: vidaMax,
    fatorVelocidade: fatorVelocidade, noBosque: noBosque, naArena: naArena, arenaAtual: arenaAtual, pergunta: pergunta, perguntas: perguntas,
    acertou: acertou, errou: errou, consumirPergunta: consumirPergunta, perguntasPendentes: perguntasPendentes,
    proximaPergunta: proximaPergunta, abater: abater, chaveMovel: chaveMovel, HABILIDADES: HABILIDADES,
    // a curva (pura; testes e ferramentas)
    curva: { xpDoNivel: xpDoNivel, xpAte: xpAte, nivelDoXp: nivelDoXp, xpLegado: xpLegado, tercosDe: tercosDe } };

  // a velocidade dela: o fator só dentro de uma arena (Jogador não existe no Node)
  if (window.Jogador && window.Jogador.registrarFatorVelocidade) {
    window.Jogador.registrarFatorVelocidade(function () { return naArena() ? fatorVelocidade() : 1; });
  }

  R.registrarModulo({
    id: 'bosque',
    iniciar: migrar,
    depurar: function () {
      if (!estado()) return null;
      return { acertos: acertos(), mortos: mortos(), nivel: nivel(), xp: xp(), xpTotal: xpTotal(), espada: temEspada(), vencidos: contador('vencidos'),
        perguntasFeitas: feitas(), perguntasPendentes: perguntasPendentes(), proximaPergunta: proximaPergunta(), arena: arenaAtual(),
        migrado: contador('migrado'), pontos: pontos(), pendentes: pontosPendentes().length, dano: dano(), vidaMax: vidaMax(),
        fatorVelocidade: fatorVelocidade(), noBosque: noBosque(), naArena: naArena(), perguntas: perguntas().length };
    },
  });
})();
