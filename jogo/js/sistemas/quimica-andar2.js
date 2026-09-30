/* Laboratório de Química, 2º andar: a API do que é só do andar, somada a Reino.Quimica (sistemas/quimica.js, que
   carrega antes e guarda o save, as estrelas e as vozes). Contrato: docs/contratos/quimica.md §9.
   - curiosidades: sorteio sem repetir na sessão (memória, nada no save), por tema;
   - Fogão dos Estados: materiais, mudanças de estado e em que estado um material está a tantos graus;
   - Mesa de Separar: ferramentas, misturas e se uma ferramenta separa uma mistura;
   - livros da Biblioteca.
   Descobertas: Reino.Quimica.descobrir('estados' | 'separar' | 'livros', id). node: true: nada de DOM no carregamento. */
(function () {
  var R = window.Reino, U = R.util;
  var Q = R.Quimica;
  function dados() { return R.QUIMICA || {}; }
  function lista(nome) { return (dados()[nome] || []).slice(); }
  function porOrdem(a, b) { return (a.ordem || 0) - (b.ordem || 0); }
  function achar(nome, id) { var l = dados()[nome] || []; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

  /* ================= CURIOSIDADES ================= */
  // ids já contados nesta sessão (a memória some ao recarregar; nada vai para o save)
  var contadas = {};
  Q.TEMAS_CURIOSIDADE = ['cozinha', 'corpo', 'agua', 'ar-fogo', 'metais', 'cores', 'elementos', 'cientistas', 'cristais', 'brasil'];
  Q.curiosidades = function () { return lista('curiosidades'); };
  /** Os temas que têm pelo menos uma curiosidade. @returns {string[]} */
  Q.temasCuriosidade = function () {
    var t = [];
    Q.curiosidades().forEach(function (c) { if (t.indexOf(c.tema) < 0) t.push(c.tema); });
    return t;
  };
  /** Sorteia uma curiosidade do tema sem repetir na sessão ('todas' ou vazio = qualquer uma; tema sem nenhuma cai em
      'todas'). Quando todas do tema já foram contadas, o tema recomeça. No modo congelado, o sorteio é pela chave.
      @param {string} [tema] @returns {{ id: string, tema: string, paginas: string[] } | null} */
  Q.curiosidade = function (tema) {
    var todas = Q.curiosidades();
    var doTema = (!tema || tema === 'todas') ? todas : todas.filter(function (c) { return c.tema === tema; });
    if (!doTema.length) doTema = todas;
    if (!doTema.length) return null;
    var novas = doTema.filter(function (c) { return !contadas[c.id]; });
    if (!novas.length) { doTema.forEach(function (c) { delete contadas[c.id]; }); novas = doTema; }
    var c = U && U.sortear ? U.sortear(novas, 'quimica-curiosidade:' + (tema || 'todas')) : novas[0];
    contadas[c.id] = true;
    return { id: c.id, tema: c.tema, paginas: (c.paginas || []).slice() };
  };
  /** Só testes: esquece o que já foi contado. */
  Q.reiniciarCuriosidades = function () { contadas = {}; };

  /* ================= FOGÃO DOS ESTADOS ================= */
  Q.materiais = function () { return lista('materiais').sort(porOrdem); };
  Q.material = function (id) { return achar('materiais', id); };
  Q.mudancas = function () { return lista('mudancas'); };
  Q.mudanca = function (id) { return achar('mudancas', id); };
  /** Em que estado o material fica a tantos graus: abaixo da fusão, sólido; da ebulição para cima, gás.
      @param {string} id @param {number} graus @returns {'solido'|'liquido'|'gas'|null} */
  Q.estadoEm = function (id, graus) {
    var m = Q.material(id);
    if (!m) return null;
    if (graus < m.fusao) return 'solido';
    if (typeof m.ebulicao === 'number' && graus >= m.ebulicao) return 'gas';
    return 'liquido';
  };
  /** A mudança (descoberta) de um material entre dois estados, ou null (ex.: o chocolate endurecendo não é uma).
      @param {string} material @param {string} de @param {string} para */
  Q.mudancaEntre = function (material, de, para) {
    return Q.mudancas().filter(function (x) { return x.material === material && x.de === de && x.para === para; })[0] || null;
  };

  /* ================= MESA DE SEPARAR ================= */
  Q.ferramentas = function () { return lista('ferramentas').sort(porOrdem); };
  Q.ferramenta = function (id) { return achar('ferramentas', id); };
  Q.misturas = function () { return lista('misturas').sort(porOrdem); };
  Q.mistura = function (id) { return achar('misturas', id); };
  /** A ferramenta separa a mistura? (pura; quem grava é Q.descobrir('separar', id)) */
  Q.separa = function (mistura, ferramenta) {
    var m = Q.mistura(mistura);
    return !!(m && Q.ferramenta(ferramenta) && (m.certas || []).indexOf(ferramenta) >= 0);
  };

  /* ================= LIVROS ================= */
  Q.livros = function () { return lista('livros').sort(porOrdem); };
  Q.livro = function (id) { return achar('livros', id); };

  /* ================= FALAS DO ANDAR (somadas ao Q.falas()) ================= */
  // pus(paginas, voz): curiosidades e livros na voz do Professor Carbono; Fogão e Mesa na da Dona Caramela
  Q.falasAndar2 = function (pus) {
    Q.curiosidades().forEach(function (c) { pus(c.paginas, Q.VOZ_CARBONO); });
    Q.livros().forEach(function (l) { pus(l.paginas, Q.VOZ_CARBONO); });
    Q.materiais().forEach(function (m) { pus(m.fala, Q.VOZ_CARAMELA); });
    Q.mudancas().forEach(function (m) { pus(m.explica, Q.VOZ_CARAMELA); });
    Q.ferramentas().forEach(function (f) { pus(f.fala, Q.VOZ_CARAMELA); });
    Q.misturas().forEach(function (m) { pus(m.fala, Q.VOZ_CARAMELA); pus(m.explica, Q.VOZ_CARAMELA); });
  };
})();
