/* Progresso (parte 5): campo NOVO no save declarado uma vez só, com Reino.Progresso.registrarCampo(nome, def).
   Os campos de hoje (salas, cuidados, despensa…) continuam com o código deles; isto é só para os próximos.
   Quem registra ganha: o padrão em estadoNovo()/completar(), a limpeza em normalizarNovos(), a regra de
   mescla em P.mesclar() (base = o lado mais recente, como a despensa), o "Novo ciclo" e, se pedir, a cópia
   -novidades. Os testes de contrato (ferramentas/testes/unidade/save-campos.test.js) valem para todo campo.
   Registre no carregamento do script (antes do P.carregar). Contrato: docs/contratos/save-e-mescla.md §11. */
(function () {
  var U = Reino.util, I = Reino._progresso, P = I.P;
  var objeto = I.objeto, numeroOu = I.numeroOu, chaveSegura = I.chaveSegura, proprio = I.proprio;

  // chaves seguras de um objeto que veio de fora, com o valor passado por `f` (undefined = fica de fora)
  /** @param {any} o @param {(v: any) => any} f @returns {Object<string, any>} */
  function porChave(o, f) {
    var r = {};
    if (objeto(o)) Object.keys(o).forEach(function (k) { if (chaveSegura(o, k)) { var v = f(o[k]); if (v !== undefined) r[k] = v; } });
    return r;
  }
  function contador(x) { var n = numeroOu(x, NaN); return isFinite(n) ? Math.max(0, n) : undefined; }
  function primitivo(x) { return typeof x === 'string' || typeof x === 'boolean' || (typeof x === 'number' && isFinite(x)); }

  /* O catálogo. Cada estratégia: `limpar` (entrada hostil vira o formato certo; undefined = campo inválido,
     volta ao padrão), `juntar(base, outro)` com os dois lados já limpos (não muda nenhum; `base` ganha o empate)
     e `exemplos(padrao)`: dois valores de exemplo para os testes de contrato, no formato do padrão. */
  /** @type {Object<string, EstrategiaMescla>} */
  var ESTRATEGIAS = {
    /* contadores que só crescem: { id: n } ou { id: { a: n, b: n } }; por chave (e subchave) o maior.
       Garantia: nada some, comutativa, idempotente. Ex.: a despensa ({ maca: { compradas, usadas } }). */
    contadores: {
      limpar: function (v) {
        if (!objeto(v)) return undefined;
        return porChave(v, function (y) { return objeto(y) ? porChave(y, contador) : contador(y); });
      },
      juntar: function (a, b) {
        var r = U.copia(a);
        Object.keys(b).forEach(function (k) {
          var x = proprio(r, k), y = b[k];
          if (x === undefined) { r[k] = U.copia(y); return; }
          if (typeof x === 'number' && typeof y === 'number') { r[k] = Math.max(x, y); return; }
          if (objeto(x) && objeto(y)) Object.keys(y).forEach(function (c) { x[c] = Math.max(numeroOu(proprio(x, c), 0), y[c]); });
          // tipos diferentes (um lado estragado): fica o da base
        });
        return r;
      },
      exemplos: function () { return [{ ex1: 3, ex2: { a: 2, b: 1 } }, { ex1: 5, ex2: { a: 1, b: 4 }, ex3: 1 }]; },
    },
    /* registros com carimbo: { id: { ..., em } }; por chave vence o `em` maior, empate = a base.
       Garantia: nenhuma chave some; comutativa quando os carimbos diferem; idempotente. */
    carimbo: {
      limpar: function (v) {
        if (!objeto(v)) return undefined;
        return porChave(v, function (y) {
          if (!objeto(y)) return undefined;
          var r = porChave(y, function (z) { return z; });
          r.em = Math.max(0, numeroOu(y.em, 0));
          return r;
        });
      },
      juntar: function (a, b) {
        var r = U.copia(a);
        Object.keys(b).forEach(function (k) {
          var x = proprio(r, k);
          if (x === undefined || b[k].em > x.em) r[k] = U.copia(b[k]);
        });
        return r;
      },
      exemplos: function () { return [{ ex1: { v: 'a', em: 10 }, ex2: { v: 'b', em: 30 } }, { ex1: { v: 'c', em: 20 }, ex3: { v: 'd', em: 5 } }]; },
    },
    /* conjunto: lista de valores simples ou { id: true }; união (a ordem da base, depois os novos do outro).
       Garantia: nada some; comutativa como conjunto; idempotente. */
    uniao: {
      limpar: function (v) {
        if (Array.isArray(v)) return v.filter(function (x, i) { return primitivo(x) && v.indexOf(x) === i; });
        if (!objeto(v)) return undefined;
        return porChave(v, function (y) { return y ? true : undefined; });
      },
      juntar: function (a, b) {
        if (Array.isArray(a) !== Array.isArray(b)) return U.copia(a);
        if (Array.isArray(a)) return a.concat(b.filter(function (x) { return a.indexOf(x) < 0; }));
        var r = U.copia(a);
        Object.keys(b).forEach(function (k) { r[k] = true; });
        return r;
      },
      exemplos: function (padrao) {
        return Array.isArray(padrao) ? [['ex1', 'ex2'], ['ex2', 'ex3']] : [{ ex1: true, ex2: true }, { ex3: true }];
      },
    },
    /* número que só cresce: o maior. Garantia: nunca desce, comutativa, idempotente. */
    maior: {
      limpar: function (v) { var n = numeroOu(v, NaN); return isFinite(n) ? n : undefined; },
      juntar: function (a, b) { return Math.max(a, b); },
      exemplos: function () { return [7, 12]; },
    },
  };

  // o valor limpo de um campo registrado (undefined = ausente ou inválido)
  /** @param {CampoSave} def @param {any} v */
  function limparCampo(def, v) {
    if (v === undefined) return undefined;
    var est = typeof def.mesclar === 'string' ? ESTRATEGIAS[def.mesclar] : null;
    // lista onde o padrão é objeto (ou o contrário) é valor estragado: volta ao padrão
    if (est && Array.isArray(v) !== Array.isArray(def.padrao())) return undefined;
    if (est) v = est.limpar(v);
    if (v !== undefined && def.limpar) v = def.limpar(v);
    return v;
  }
  // junta dois valores do campo; um lado sem o campo (ou estragado) não apaga o outro. `base` ganha o empate
  /** @param {CampoSave} def @param {any} base @param {any} outro */
  function juntarCampo(def, base, outro) {
    var x = limparCampo(def, base), y = limparCampo(def, outro);
    if (x === undefined) return y === undefined ? def.padrao() : y;
    if (y === undefined) return x;
    return typeof def.mesclar === 'function' ? def.mesclar(x, y) : ESTRATEGIAS[def.mesclar].juntar(x, y);
  }

  // os dois valores de exemplo do campo (os do def, ou os da estratégia), já limpos
  /** @param {CampoSave} def @returns {any[]} */
  function exemplosCampo(def) {
    var ex = def.exemplos || ESTRATEGIAS[/** @type {string} */ (def.mesclar)].exemplos(def.padrao());
    return ex.map(function (v) { return limparCampo(def, U.copia(v)); });
  }

  var NOME = /^[a-z][A-Za-z0-9]*$/;
  // as chaves de topo de estadoNovo() (progresso.js). Lista fixa, e não estadoNovo(): ele lê PA.APARENCIA_PADRAO,
  // que não existe no Node, e registrar um campo tem de funcionar ao carregar nas ferramentas. Um teste confere a lista.
  P.NOMES_DO_SAVE = ['v', 'geracao', 'ciclo', 'criado', 'atualizado', 'comecou', 'aparencia', 'corInicial', 'salas', 'treinos',
    'provas', 'unis', 'montaria', 'estrelas', 'loja', 'usando', 'pago', 'ajustes', 'ritualVisto', 'cuidados', 'despensa'];
  /** Declara um campo novo do save. Erro claro se o nome já existe ou a definição não fecha.
      @param {string} nome @param {CampoSave} def */
  P.registrarCampo = function (nome, def) {
    var erro = function (m) { throw new Error('registrarCampo("' + nome + '"): ' + m); };
    if (typeof nome !== 'string' || !NOME.test(nome)) erro('nome precisa ser uma palavra em camelCase (ex.: "jardim")');
    if (nome in Object.prototype) erro('nome proibido');
    if (Object.prototype.hasOwnProperty.call(I.campos, nome)) erro('campo já registrado');
    if (P.NOMES_DO_SAVE.indexOf(nome) >= 0) erro('o save de hoje já usa esse nome');
    if (!def || typeof def.padrao !== 'function') erro('falta padrao: () => valor');
    if (typeof def.mesclar !== 'function' && !Object.prototype.hasOwnProperty.call(ESTRATEGIAS, def.mesclar)) erro('mesclar precisa ser ' + Object.keys(ESTRATEGIAS).join(', ') + ' ou uma função');
    if (def.limpar !== undefined && typeof def.limpar !== 'function') erro('limpar precisa ser uma função');
    if (def.novoCiclo !== 'mantem' && def.novoCiclo !== 'zera') erro("novoCiclo precisa ser 'mantem' ou 'zera'");
    if (limparCampo(def, def.padrao()) === undefined) erro('o padrão não passa pela própria limpeza');
    // exemplos: dois valores realistas para os testes de contrato; obrigatórios com mesclar próprio
    if (def.exemplos === undefined && typeof def.mesclar === 'function') erro('mesclar próprio precisa de exemplos: [a, b]');
    if (def.exemplos !== undefined && (!Array.isArray(def.exemplos) || def.exemplos.length !== 2)) erro('exemplos precisa ser [a, b]');
    if (def.exemplos && def.exemplos.some(function (v) { return limparCampo(def, U.copia(v)) === undefined; })) erro('um dos exemplos não passa pela limpeza');
    I.campos[nome] = { padrao: def.padrao, mesclar: def.mesclar, limpar: def.limpar, novoCiclo: def.novoCiclo, copiaSeguranca: !!def.copiaSeguranca, exemplos: def.exemplos };
  };
  P.camposRegistrados = function () { return Object.keys(I.campos); };

  // para as outras partes (e os testes de contrato)
  I.ESTRATEGIAS = ESTRATEGIAS; I.limparCampo = limparCampo; I.juntarCampo = juntarCampo; I.exemplosCampo = exemplosCampo;
})();
