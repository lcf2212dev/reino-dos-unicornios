/* Laboratório de Química: as misturas, o caderno de receitas, as descobertas no save e as estrelas.
   Contrato: docs/contratos/quimica.md. Dados (textos e listas): js/conteudo/quimica/*.js em Reino.QUIMICA.
   Telas (js/ui/quimica-*.js) só chamam esta API; tudo o que elas falam sai daqui (falas()), na voz da
   Doutora Proveta, no pacote do prédio. node: true: nada de DOM, Progresso nem Cena no carregamento. */
(function () {
  var R = window.Reino;
  var Q = R.Quimica = R.Quimica || {};
  var VOZ = Q.VOZ = 'npc-quimica-proveta';
  var PACOTE = Q.PACOTE = 'interior-quimica';
  var GRUPOS = ['receitas', 'laminas', 'licoes'];
  function cfg() { return R.config.quimica; }
  function dados() { return R.QUIMICA || {}; }
  function lista(nome) { return (dados()[nome] || []).slice(); }

  /* ================= NO SAVE ================= */
  // quimica: { receitas: { <id>: 1 }, laminas: { <id>: 1 }, licoes: { <id>: 1 } }; só cresce (maior por chave)
  R.Progresso.registrarCampo('quimica', {
    padrao: function () { return {}; },
    mesclar: 'contadores',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ receitas: { pof: 1 }, licoes: { atomos: 1 } },
      { receitas: { pof: 1, 'pocao-rosa': 1 }, laminas: { cebola: 1 } }],
  });
  function estado() { try { return R.Progresso.estado(); } catch (e) { return null; } }

  /** Já descobriu (está no save)? @param {string} grupo 'receitas' | 'laminas' | 'licoes' @param {string} id */
  Q.descoberto = function (grupo, id) {
    var est = estado(), g = est && est.quimica && est.quimica[grupo];
    return !!(g && g[id]);
  };
  /** Os ids descobertos de um grupo que ainda existem nos dados (id de outra versão fica no save, mas não conta). */
  Q.descobertas = function (grupo) {
    var fonte = grupo === 'receitas' ? Q.receitas() : grupo === 'laminas' ? Q.laminas() : Q.licoes();
    return fonte.filter(function (x) { return Q.descoberto(grupo, x.id); }).map(function (x) { return x.id; });
  };
  Q.cadernoCompleto = function () { var t = Q.receitas().length; return t > 0 && Q.descobertas('receitas').length === t; };
  /** O caderno mostra a receita aberta: descoberta ou `inicial` (a 1ª já vem escrita). */
  Q.noCaderno = function (id) { var r = Q.receita(id); return !!r && (!!r.inicial || Q.descoberto('receitas', id)); };
  Q.contagem = function () {
    var c = {};
    GRUPOS.forEach(function (g) {
      var total = g === 'receitas' ? Q.receitas().length : g === 'laminas' ? Q.laminas().length : Q.licoes().length;
      c[g] = { feitas: Q.descobertas(g).length, total: total };
    });
    return c;
  };

  /** Grava a descoberta (na hora em que ela age) e dá as estrelas da 1ª vez.
      @returns {{ nova: boolean, estrelas: number, completo: boolean }} completo: esta receita fechou o caderno */
  Q.descobrir = function (grupo, id) {
    var nada = { nova: false, estrelas: 0, completo: false };
    var est = estado();
    if (!est || GRUPOS.indexOf(grupo) < 0 || !id || Q.descoberto(grupo, id)) return nada;
    var existe = grupo === 'receitas' ? Q.receita(id) : grupo === 'laminas' ? Q.lamina(id) : Q.licao(id);
    if (!existe) return nada;
    var q = est.quimica = est.quimica || {};
    (q[grupo] = q[grupo] || {})[id] = 1;
    var c = cfg(), n = grupo === 'receitas' ? c.estrelasReceitaNova : grupo === 'laminas' ? c.estrelasLaminaNova : c.estrelasLicaoNova;
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
  // tudo o que as telas do laboratório falam, com o texto exato (npm run vozes grava pelo texto)
  function paginas(x) { return !x ? [] : Array.isArray(x) ? x : [x]; }
  function falas() {
    var t = [];
    function pus(x) { paginas(x).forEach(function (p) { if (p) t.push({ texto: p, voz: VOZ, pacote: PACOTE }); }); }
    var fr = dados().frases || {};
    Object.keys(fr).forEach(function (k) { pus(fr[k]); });
    Q.ingredientes().forEach(function (g) { pus(g.fala); });
    Q.receitas().forEach(function (r) { pus(r.acontece); pus(r.explica); pus(r.dica); });
    Q.laminas().forEach(function (l) { pus(l.explica); Object.keys(l.aumentos || {}).forEach(function (a) { pus(l.aumentos[a]); }); });
    Q.licoes().forEach(function (l) { pus(l.paginas); });
    Q.elementos().forEach(function (e) { pus(e.onde); pus(e.curiosidade); });
    return t;
  }
  Q.falas = falas;

  R.registrarModulo({
    id: 'quimica',
    falas: falas,
    depurar: function () { return { contagem: Q.contagem(), completo: Q.cadernoCompleto() }; },
  });
})();
