/* Laboratório de Química: as misturas, o caderno de receitas, as descobertas no save e as estrelas.
   Contrato: docs/contratos/quimica.md. Dados (textos e listas): js/conteudo/quimica/*.js em Reino.QUIMICA.
   Telas (js/ui/quimica-*.js) só chamam esta API; tudo o que elas falam sai daqui (falas()), no pacote do prédio:
   no térreo, na voz da Doutora Proveta; no 2º andar, na do Professor Carbono ou da Dona Caramela (Q.vozDe).
   O que é só do 2º andar (curiosidades, estados, separar, livros) está em sistemas/quimica-andar2.js.
   node: true: nada de DOM, Progresso nem Cena no carregamento. */
(function () {
  var R = window.Reino;
  var Q = R.Quimica = R.Quimica || {};
  var VOZ = Q.VOZ = 'npc-quimica-proveta';
  var PACOTE = Q.PACOTE = 'interior-quimica';
  // os grupos de descoberta no save: a lista de dados de onde vêm os ids e as estrelas da 1ª vez (config.quimica)
  var GRUPOS = {
    receitas: { lista: 'receitas', estrelas: 'estrelasReceitaNova' },
    laminas: { lista: 'laminas', estrelas: 'estrelasLaminaNova' },
    licoes: { lista: 'licoes', estrelas: 'estrelasLicaoNova' },
    estados: { lista: 'mudancas', estrelas: 'estrelasEstadoNovo' },     // 2º andar: Fogão dos Estados
    separar: { lista: 'misturas', estrelas: 'estrelasMisturaNova' },    // 2º andar: Mesa de Separar Misturas
    livros: { lista: 'livros', estrelas: 'estrelasLivroNovo' },         // 2º andar: Biblioteca
  };
  Q.GRUPOS = Object.keys(GRUPOS);
  // quem fala cada tela: o prefixo da chave da frase ('estados.oi' → estados); o que não está aqui é da Doutora Proveta
  var VOZ_CARBONO = Q.VOZ_CARBONO = 'npc-quimica-carbono';
  var VOZ_CARAMELA = Q.VOZ_CARAMELA = 'npc-quimica-caramela';
  var VOZ_DA_TELA = { estados: VOZ_CARAMELA, separar: VOZ_CARAMELA, livros: VOZ_CARBONO, curiosidade: VOZ_CARBONO };
  /** A voz de uma tela ('estados') ou de uma chave de frase ('estados.oi'). @param {string} chave @returns {string} */
  Q.vozDe = function (chave) { return VOZ_DA_TELA[String(chave || '').split('.')[0]] || VOZ; };
  function cfg() { return R.config.quimica; }
  function dados() { return R.QUIMICA || {}; }
  function lista(nome) { return (dados()[nome] || []).slice(); }

  /* ================= NO SAVE ================= */
  // quimica: { receitas: { <id>: 1 }, laminas: …, licoes: …, estados: …, separar: …, livros: … }; só cresce (maior
  // por chave). Grupo novo não pede nada no save antigo: o que falta é {} (nada descoberto)
  R.Progresso.registrarCampo('quimica', {
    padrao: function () { return {}; },
    mesclar: 'contadores',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ receitas: { pof: 1 }, licoes: { atomos: 1 } },
      { receitas: { pof: 1, 'pocao-rosa': 1 }, laminas: { cebola: 1 }, estados: { 'agua-derreter': 1 }, separar: { cafe: 1 }, livros: { fogo: 1 } }],
  });
  function estado() { try { return R.Progresso.estado(); } catch (e) { return null; } }

  /** Já descobriu (está no save)? @param {string} grupo um de Q.GRUPOS @param {string} id */
  Q.descoberto = function (grupo, id) {
    var est = estado(), g = est && est.quimica && est.quimica[grupo];
    return !!(g && g[id]);
  };
  /** Os ids descobertos de um grupo que ainda existem nos dados (id de outra versão fica no save, mas não conta). */
  Q.descobertas = function (grupo) {
    var fonte = GRUPOS[grupo] ? lista(GRUPOS[grupo].lista) : [];
    return fonte.filter(function (x) { return Q.descoberto(grupo, x.id); }).map(function (x) { return x.id; });
  };
  Q.cadernoCompleto = function () { var t = Q.receitas().length; return t > 0 && Q.descobertas('receitas').length === t; };
  /** O caderno mostra a receita aberta: descoberta ou `inicial` (a 1ª já vem escrita). */
  Q.noCaderno = function (id) { var r = Q.receita(id); return !!r && (!!r.inicial || Q.descoberto('receitas', id)); };
  Q.contagem = function () {
    var c = {};
    Q.GRUPOS.forEach(function (g) { c[g] = { feitas: Q.descobertas(g).length, total: lista(GRUPOS[g].lista).length }; });
    return c;
  };

  /** Grava a descoberta (na hora em que ela age) e dá as estrelas da 1ª vez.
      @returns {{ nova: boolean, estrelas: number, completo: boolean }} completo: esta receita fechou o caderno */
  Q.descobrir = function (grupo, id) {
    var nada = { nova: false, estrelas: 0, completo: false };
    var est = estado();
    if (!est || !GRUPOS[grupo] || !id || Q.descoberto(grupo, id)) return nada;
    if (!achar(dados()[GRUPOS[grupo].lista] || [], id)) return nada;
    var q = est.quimica = est.quimica || {};
    (q[grupo] = q[grupo] || {})[id] = 1;
    var c = cfg(), n = c[GRUPOS[grupo].estrelas] || 0;
    var completo = grupo === 'receitas' && Q.cadernoCompleto();
    if (completo) n += c.estrelasCadernoCompleto;
    try {
      if (n > 0) R.Progresso.ganharEstrelas(n);
      R.Progresso.salvar();
    } catch (e) { /* sem save (teste) */ }
    if (R.UI && R.UI.atualizarHUD) R.UI.atualizarHUD();
    return { nova: true, estrelas: n, completo: completo };
  };

  /* ================= OS DADOS ================= */
  function porOrdem(a, b) { return (a.ordem || 0) - (b.ordem || 0); }
  function achar(l, id) { for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  Q.ingredientes = function () { return lista('ingredientes'); };
  Q.ingrediente = function (id) { return achar(dados().ingredientes || [], id); };
  Q.receitas = function () { return lista('receitas').sort(porOrdem); };
  Q.receita = function (id) { return achar(dados().receitas || [], id); };
  Q.laminas = function () { return lista('laminas'); };
  Q.lamina = function (id) { return achar(dados().laminas || [], id); };
  Q.licoes = function () { return lista('licoes'); };
  Q.licao = function (id) { return achar(dados().licoes || [], id); };
  Q.elementos = function () { return lista('elementos').sort(function (a, b) { return a.z - b.z; }); };
  Q.elemento = function (z) { var l = dados().elementos || []; for (var i = 0; i < l.length; i++) if (l[i].z === z) return l[i]; return null; };
  Q.tabela = function () { return lista('tabela'); };
  Q.familias = function () { return dados().familias || {}; };
  /** Páginas de uma frase fixa das telas (Reino.QUIMICA.frases[chave]); chave desconhecida = []. */
  Q.frase = function (chave) { var f = (dados().frases || {})[chave]; return f ? f.slice() : []; };

  /* ================= A MISTURA (pura) ================= */
  function conjunto(ids) {
    var vistos = {}, r = [];
    (ids || []).forEach(function (id) { if (id && !vistos[id] && Q.ingrediente(id)) { vistos[id] = true; r.push(id); } });
    return r.sort();
  }
  function mesmo(a, b) { return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
  function contem(grande, peq) { return peq.every(function (x) { return grande.indexOf(x) >= 0; }); }
  /** O que acontece com estes tubos (ordem e repetição não importam).
      @param {string[]} ids
      @returns {{ receita: object|null, quase: object|null, tipo: 'receita'|'falta'|'sobra'|'nada'|'vazio' }}
      falta: os tubos são uma receita menos 1 ingrediente; sobra: uma receita mais 1 (a que ela ainda não descobriu
      primeiro). Não grava nada: quem grava é Q.descobrir. */
  Q.misturar = function (ids) {
    var s = conjunto(ids);
    if (!s.length) return { receita: null, quase: null, tipo: 'vazio' };
    var rs = Q.receitas();
    for (var i = 0; i < rs.length; i++) if (mesmo(conjunto(rs[i].ingredientes), s)) return { receita: rs[i], quase: null, tipo: 'receita' };
    function melhor(teste) {
      var l = rs.filter(teste);
      return l.filter(function (r) { return !Q.descoberto('receitas', r.id); })[0] || l[0] || null;
    }
    var falta = melhor(function (r) { var c = conjunto(r.ingredientes); return c.length === s.length + 1 && contem(c, s); });
    if (falta) return { receita: null, quase: falta, tipo: 'falta' };
    var sobra = melhor(function (r) { var c = conjunto(r.ingredientes); return c.length + 1 === s.length && contem(s, c); });
    if (sobra) return { receita: null, quase: sobra, tipo: 'sobra' };
    return { receita: null, quase: null, tipo: 'nada' };
  };

  /* ================= FALAS ================= */
  // tudo o que as telas do laboratório falam, com o texto exato e a voz (npm run vozes grava pelo texto)
  function paginas(x) { return !x ? [] : Array.isArray(x) ? x : [x]; }
  function falas() {
    var t = [];
    function pus(x, voz) { paginas(x).forEach(function (p) { if (p) t.push({ texto: p, voz: voz || VOZ, pacote: PACOTE }); }); }
    var fr = dados().frases || {};
    Object.keys(fr).forEach(function (k) { pus(fr[k], Q.vozDe(k)); });
    Q.ingredientes().forEach(function (g) { pus(g.fala); });
    Q.receitas().forEach(function (r) { pus(r.acontece); pus(r.explica); pus(r.dica); });
    Q.laminas().forEach(function (l) { pus(l.explica); Object.keys(l.aumentos || {}).forEach(function (a) { pus(l.aumentos[a]); }); });
    Q.licoes().forEach(function (l) { pus(l.paginas); });
    Q.elementos().forEach(function (e) { pus(e.onde); pus(e.curiosidade); });
    if (Q.falasAndar2) Q.falasAndar2(pus);   // sistemas/quimica-andar2.js: curiosidades, estados, separar, livros
    return t;
  }
  Q.falas = falas;

  R.registrarModulo({
    id: 'quimica',
    falas: falas,
    depurar: function () { return { contagem: Q.contagem(), completo: Q.cadernoCompleto() }; },
  });
})();
