/* Produções da criança nas questões abertas do 4º bimestre: escrita livre e desenho, guardados para ela ver de novo.
   O save ganha `producoes: { <idDesafio>: { texto?, px?, em } }` (P.registrarCampo; mescla = carimbo, por questão
   vence a gravação mais nova; o Novo ciclo mantém). Aditivo: save sem o campo carrega igual.
   Contrato: docs/contratos/quarto-bimestre.md §8. */
(function () {
  var P = Reino.Progresso, I = Reino._progresso;
  var MAX_TEXTO = 600, PX = /^[0-8]{576}$/;   // desenho: a grade 24×24 do tipo `desenho`

  P.registrarCampo('producoes', {
    padrao: function () { return {}; },
    mesclar: 'carimbo',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    // só texto (até MAX_TEXTO letras) e desenho válido; registro sem nenhum dos dois sai
    limpar: function (v) {
      var out = {};
      Object.keys(v).forEach(function (k) {
        var r = v[k];
        if (!r || typeof r !== 'object' || typeof r.em !== 'number') return;
        var n = { em: r.em };
        if (typeof r.texto === 'string') n.texto = r.texto.slice(0, MAX_TEXTO);
        if (typeof r.px === 'string' && PX.test(r.px)) n.px = r.px;
        if (n.texto !== undefined || n.px !== undefined) out[k] = n;
      });
      return out;
    },
    exemplos: [
      { 'lp10a1-09': { texto: 'Era uma vez um gato.', em: 1000 } },
      { 'lp10a1-09': { texto: 'Era uma vez uma sereia.', em: 1500 }, 'lp12a1-04': { px: new Array(577).join('0'), em: 2000 } },
    ],
  });

  Reino.Producoes = {
    MAX_TEXTO: MAX_TEXTO,
    /** a produção guardada da questão (cópia) ou null @param {string} id */
    ler: function (id) {
      var t = I.estado && I.estado.producoes;
      return t && Object.prototype.hasOwnProperty.call(t, id) ? Object.assign({}, t[id]) : null;
    },
    /** guarda (substitui) e grava: { texto } ou { px } @param {string} id @param {{ texto?: string, px?: string }} dados */
    guardar: function (id, dados) {
      if (!I.estado || typeof id !== 'string' || !id) return;
      var t = I.estado.producoes = I.estado.producoes || {};
      var antes = Object.prototype.hasOwnProperty.call(t, id) ? t[id] : null;
      var n = { em: Math.max(Date.now(), ((antes && antes.em) || 0) + 1) };
      if (typeof dados.texto === 'string') n.texto = dados.texto.slice(0, MAX_TEXTO);
      if (typeof dados.px === 'string' && PX.test(dados.px)) n.px = dados.px;
      if (n.texto === undefined && n.px === undefined) return;
      t[id] = n;
      P.salvar();
    },
  };
})();
