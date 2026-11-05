/* Bosque dos Fantasmas: as regras e o save (docs/contratos/bosque.md §4, §5). Reino.Bosque.
   Campos (save-e-mescla.md §11; mantêm no Novo ciclo e vão na cópia -novidades):
     bosque { acertos, espada, vencidos, mortos, perguntasFeitas, migrado }; contadores (por chave, o maior).
       espada = 0 ou 1; acertos = perguntas certas (legado, não é mais XP); vencidos = perguntas respondidas;
       mortos = inimigos mortos no placar (a mosca conta 2); perguntasFeitas = blocos de 10 já consumidos;
       migrado = 1 depois da migração do save antigo (marca a correção; o piso é reaplicado nas leituras, porque
       a mescla pode trazer acertos antigos com mortos novos). Num save novo sem nível antigo, fica 1 na memória e
       vai para o arquivo na primeira gravação de verdade (sem gravação extra na abertura).
     bosquePontos { '<nível>': { h: 'forca'|'vida'|'velocidade', em } }; carimbo (por nível, o `em` maior). Um ponto
       por nível, do 2 em diante; a escolha é para sempre.
   Derivados (nunca no save): nível = min(nivelMax, 1 + floor(mortos / mortosPorNivel)); xp = mortos até o próximo
   nível (de mortosPorNivel); perguntasPendentes = blocos de perguntasPorBloco já atingidos menos perguntasFeitas;
   próxima pergunta = mortos % perguntasPorBloco; pontos = as escolhas válidas de nível <= o atual; pendentes =
   níveis 2..atual sem escolha; dano, vida máxima e fator de velocidade.
   Migração do save antigo (idempotente): o nível de quem já jogava era 1 + floor(acertos / acertosPorNivel); ela
   vira mortos = (nível antigo - 1) * mortosPorNivel, e as perguntas já vencidas viram perguntasFeitas, para não
   abrir pergunta nem baú retroativo. Roda no `iniciar` e, por segurança, nas leituras (os testes chamam sem boot).
   Pergunta: sorteio uniforme entre TODAS as perguntas do bimestre em curso (sala feita ou não), sem fila.
   Prêmio de móvel (casa.md §12): o nível e a pergunta certa gravam um móvel surpresa em CasaMoveis.presente, com as
   chaves 'bosque:<nível>' e 'bosque:p<bloco>'; o móvel é gravado ANTES do baú abrir (fechar o jogo não perde nada).
   As falas do Claude no Bosque: sistemas/bosque-falas.js (Reino.BosqueFalas).
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino, P = R.Progresso, I = R._progresso, U = R.util;
  var objeto = I.objeto, numeroOu = I.numeroOu;
  var HABILIDADES = ['forca', 'vida', 'velocidade'];
  function cfg() { return R.config.fantasmas; }
  function porBloco() { return cfg().perguntasPorBloco || 10; }
  function porNivel() { return cfg().mortosPorNivel || 30; }

  /* ================= NO SAVE ================= */
  function padrao() { return { acertos: 0, espada: 0, vencidos: 0, mortos: 0, perguntasFeitas: 0, migrado: 0 }; }
  P.registrarCampo('bosque', {
    padrao: padrao,
    mesclar: 'contadores',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ acertos: 12, espada: 1, vencidos: 20, mortos: 60, perguntasFeitas: 6, migrado: 1 },
      { acertos: 25, espada: 0, vencidos: 18, mortos: 30, perguntasFeitas: 3, migrado: 1 }],
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
    var base = contador('mortos'), feitas = contador('perguntasFeitas');
    var nivelAntigo = 1 + Math.floor(contador('acertos') / (cfg().acertosPorNivel || 10));
    var legado = (nivelAntigo - 1) * porNivel();
    var mortos = Math.max(base, legado);
    // só o trecho legado consome perguntas; o que veio de mortos novos continua pendente
    var novasFeitas = legado > base ? Math.max(feitas, Math.floor(legado / porBloco())) : feitas;
    var mudou = mortos !== base || novasFeitas !== feitas;
    e.bosque.mortos = mortos;
    e.bosque.perguntasFeitas = novasFeitas;
    e.bosque.migrado = 1;
    // save novo (sem nível antigo): só marca na memória; a primeira gravação de verdade leva o migrado junto.
    // Evita uma gravação extra na abertura (que mexia no relógio dos cuidados e nas fotos do e2e).
    if (mudou) P.salvar();
    return mudou;
  }

  /* ================= NÍVEL E XP ================= */
  function nivelDe(mortos) { return Math.min(cfg().nivelMax, 1 + Math.floor(mortos / porNivel())); }
  function acertos() { migrar(); return contador('acertos'); }
  function mortos() { migrar(); return contador('mortos'); }
  function nivel() { return nivelDe(mortos()); }
  /** a barra do nível: n de `de` inimigos mortos; no nível máximo, cheia */
  function xp() {
    var de = porNivel();
    if (nivel() >= cfg().nivelMax) return { n: de, de: de, maximo: true };
    return { n: mortos() % de, de: de, maximo: false };
  }
  /** quantas perguntas de bloco estão esperando resposta (0 ou 1 no jogo normal) */
  function perguntasPendentes() {
    migrar();
    return Math.max(0, Math.floor(contador('mortos') / porBloco()) - contador('perguntasFeitas'));
  }
  /** o placar da próxima pergunta: n de `de` inimigos mortos */
  function proximaPergunta() { migrar(); return { n: contador('mortos') % porBloco(), de: porBloco() }; }
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

  /* ================= PLACAR E PRÊMIOS ================= */
  function presenteDe(chave) {
    var CM = R.CasaMoveis;
    return CM && CM.presente ? CM.presente(chave) : null;
  }
  /** um inimigo morto (a mosca conta 2): soma o placar, salva, avisa e, se subiu, já grava o móvel do nível */
  function abater(tipo) {
    migrar();
    if (!estado()) return { mortos: 0, perguntas: 0, subiu: null, premioNivel: null };
    var antes = nivel(), t = cfg().tipos[tipo], n = t && t.mortos > 0 ? Math.floor(t.mortos) : 1;
    somar('mortos', n);
    var total = contador('mortos'), depois = nivelDe(total), subiu = depois > antes ? depois : null;
    P.salvar();
    emitir({ tipo: 'abate', mortos: total, subiu: subiu });
    var premioNivel = subiu ? presenteDe(chaveMovel(subiu)) : null;
    return { mortos: total, perguntas: perguntasPendentes(), subiu: subiu, premioNivel: premioNivel };
  }

  /* ================= RESPOSTA ================= */
  /** pergunta certa: 1 estrela, Aura e um móvel surpresa se havia pergunta pendente (consome UMA); NÃO sobe nível */
  function acertou(materiaId) {
    migrar();
    var antes = nivel(), n = cfg().estrelasPorAcerto;
    var pendente = perguntasPendentes() > 0, feitasAntes = contador('perguntasFeitas');
    if (!somar('acertos', 1)) return { estrelas: 0, nivel: antes, presente: null };
    somar('vencidos', 1);
    if (pendente) somar('perguntasFeitas', 1);
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
      if (perguntasPendentes() > 0) somar('perguntasFeitas', 1);
      somar('vencidos', 1);
      P.salvar();
    }
    if (R.Aura && R.Aura.contar) R.Aura.contar([false], materiaId);
  }
  /** consome uma pergunta pendente sem prêmio (quando o bimestre não tem pergunta): true se consumiu */
  function consumirPergunta() {
    migrar();
    if (!estado() || perguntasPendentes() <= 0) return false;
    somar('perguntasFeitas', 1);
    P.salvar();
    return true;
  }
  function chaveMovel(n) { return 'bosque:' + n; }

  R.Bosque = { acertos: acertos, mortos: mortos, nivel: nivel, xp: xp, temEspada: temEspada, ganharEspada: ganharEspada,
    pontos: pontos, pontosPendentes: pontosPendentes, porPonto: porPonto, dano: dano, vidaMax: vidaMax,
    fatorVelocidade: fatorVelocidade, noBosque: noBosque, pergunta: pergunta, perguntas: perguntas,
    acertou: acertou, errou: errou, consumirPergunta: consumirPergunta, perguntasPendentes: perguntasPendentes,
    proximaPergunta: proximaPergunta, abater: abater, chaveMovel: chaveMovel, HABILIDADES: HABILIDADES };

  // a velocidade dela: o fator só dentro do Bosque (Jogador não existe no Node)
  if (window.Jogador && window.Jogador.registrarFatorVelocidade) {
    window.Jogador.registrarFatorVelocidade(function () { return noBosque() ? fatorVelocidade() : 1; });
  }

  R.registrarModulo({
    id: 'bosque',
    iniciar: migrar,
    depurar: function () {
      if (!estado()) return null;
      return { acertos: acertos(), mortos: mortos(), nivel: nivel(), xp: xp(), espada: temEspada(), vencidos: contador('vencidos'),
        perguntasFeitas: contador('perguntasFeitas'), perguntasPendentes: perguntasPendentes(), proximaPergunta: proximaPergunta(),
        migrado: contador('migrado'), pontos: pontos(), pendentes: pontosPendentes().length, dano: dano(), vidaMax: vidaMax(),
        fatorVelocidade: fatorVelocidade(), noBosque: noBosque(), perguntas: perguntas().length };
    },
  });
})();
