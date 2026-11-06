/* Parquinho (pedido pedidos/2026-11-05-parquinho.md; docs/contratos/parquinho.md): as regras e o módulo 'parquinho'.
   Fase calculada na hora a partir das salas feitas (nada novo no save):
     0 = fechado; 1 = config.parquinho.fase1 matérias completas, uma delas de config.parquinho.chave (Matemática ou
     Língua Portuguesa); 2 = todas completas. "Matéria completa" é a mesma da casa (sistemas/casa.js, os kits):
     bimestre >= config.casa.desdeBimestre e P.materiaCompleta (todas as salas feitas), arquivada ou não.
   Reino.Parquinho = { fase(), completas(), contam(), ehChave(m), falta(), liberado() }.
   O módulo traz a ação 'parquinhoBrincar' (o toque num brinquedo), a camada que desenha a brincadeira e o
   `desenhaEla` (o desenho normal dela e do unicórnio some enquanto o brinquedo os desenha); quem faz tudo isso é
   Reino.ParquinhoBrincar (interiores/parquinho/brincar.js), lido na hora.
   node: true: nada de DOM, canvas nem Progresso no carregamento. */
(function () {
  var R = window.Reino;
  function cfg() { return R.config.parquinho; }
  function progresso() {
    var P = R.Progresso;
    try { return P && P.estado && P.estado() ? P : null; } catch (e) { return null; }
  }
  // as matérias que contam (com sala), na ordem de Reino.materias
  function contam() {
    var desde = (R.config.casa && R.config.casa.desdeBimestre) || 0;
    return (R.materias || []).filter(function (m) { return (m.bimestre || 0) >= desde && m.salas && m.salas.length > 0; });
  }
  function completas() {
    var P = progresso();
    return P ? contam().filter(function (m) { return P.materiaCompleta(m); }) : [];
  }
  function ehChave(m) { return !!m && cfg().chave.some(function (c) { return String(m.id).indexOf(c) === 0; }); }
  function fase() {
    var todas = contam(), feitas = completas();
    if (todas.length && feitas.length === todas.length) return 2;
    return feitas.length >= cfg().fase1 && feitas.some(ehChave) ? 1 : 0;
  }
  // o que falta para a próxima fase (a tela do portal dormindo e do presente)
  function falta() {
    var feitas = completas();
    return { fase: fase(), completas: feitas.length, precisa: cfg().fase1, chave: feitas.some(ehChave), total: contam().length };
  }

  R.Parquinho = {
    fase: fase, completas: completas, contam: contam, ehChave: ehChave, falta: falta,
    liberado: function () { return fase() >= 1; },
  };

  function B() { return R.ParquinhoBrincar; }
  function ativo() { var b = B(); return !!(b && b.ativo()); }
  R.registrarModulo({
    id: 'parquinho',
    acoes: {
      parquinhoBrincar: function (acao, ctx) { var b = B(); return b ? b.brincar(acao, ctx) : Promise.resolve(); },
    },
    camada: {
      ativo: ativo,
      itensDesenho: function (p, t, animar) { return B().itens(p, t, animar); },
      sobre: function (ctx, p, t, animar) { if (B().sobre) B().sobre(p, t, animar); },
    },
    desenhaEla: ativo,
    depurar: function () { var b = B(); return { fase: fase(), completas: completas().map(function (m) { return m.id; }), brincando: b ? b.depurar() : null }; },
  });
})();
