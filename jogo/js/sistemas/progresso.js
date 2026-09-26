/* Progresso da Mariana: salvo no aparelho (localStorage) e, quando o jogo roda
   publicado no claude.ai, sincronizado entre aparelhos pela capacidade `db`.
   Dinheiro e prêmios são DERIVADOS das conquistas, nunca guardados soltos.
   Em quatro arquivos, carregados nesta ordem (Reino.Progresso é um só):
     progresso.js         estado, estadoNovo, completar, normalizarNovos, carregar/salvar, cópia -novidades, abas
     progresso-mescla.js  P.mesclar e as regras de junção (cuidados, despensa, surpresa)
     progresso-nuvem.js   sincronização com o servidor de casa e com o claude.ai
     progresso-regras.js  dinheiro, estrelas, unicórnios, salas, treinos, provas, pagamentos
   O que as partes dividem mora em Reino._progresso (interno, não é API): `estado` (o objeto do save;
   carregar, mesclar e "Apagar tudo" TROCAM o objeto: sempre ler I.estado, nunca guardar numa variável),
   `nuvem`, `P` e as funções auxiliares que cada parte publica no fim dela.
   Tipos (EstadoSave, ProgressoApi, ProgressoInterno): jogo/ferramentas/testes/tipos-jogo.d.ts. */
(function () {
  var U = Reino.util;
  var EV = Reino.EVENTOS;
  /** @type {ProgressoApi} */
  var P = {};
  /** @type {EstadoNuvem} */
  var nuvem = { ref: null, ok: false, gravando: false, pendente: false, timer: null, status: 'local' };
  // o que as partes do progresso dividem (ver o cabeçalho)
  /** @type {ProgressoInterno} */
  var I = Reino._progresso = { estado: null, nuvem: nuvem, P: P };

  function agora() { return Date.now(); }

  /** @returns {EstadoSave} */
  function estadoNovo() {
    return {
      v: 1, geracao: 1, ciclo: 1, criado: agora(), atualizado: agora(),
      comecou: false,
      aparencia: Object.assign({}, PA.APARENCIA_PADRAO),
      corInicial: 'rosa',
      salas: {},        // salaId -> {feita, melhor, perfeita, calma, vezes}
      treinos: {},      // materiaId -> {melhor, ouro, perfeito, vezes}
      provas: {},       // provaId -> {tentativas, notas, melhor, premio, premioEm} (não zera no novo ciclo)
      unis: {},         // uniId -> {em, nome, xp, chocado}
      montaria: 'inicial',
      estrelas: { ganhas: 0, gastas: 0 },
      loja: {},         // itemId -> true
      usando: { enfeites: [], capa: false, asasFada: false, estrelinhas: false },
      pago: {},         // materiaId -> valor já pago pelos pais
      ajustes: { som: true, musica: false, voz: true, animacoes: !U.reduzMovimentoSistema, texto: 1, setas: false, surpresa: true },
      ritualVisto: false,
      cuidados: {},     // uniId -> {fome, sede, banho, em, acao, acaoFome, acaoSede, acaoBanho} (0–100, 100 = satisfeito/limpinho; sem registro ou sem banho = 100; acaoFome/acaoSede = carimbo do último comer/beber, acao = o maior dos dois (o banho não mexe nele), acaoBanho = do último banho, 0 = nenhum) — js/sistemas/cuidados.js
      despensa: {},     // comidaId -> {compradas, usadas} (contadores que só crescem; quantidade = compradas − usadas)
    };
  }

  /* ---------- carregar / salvar ---------- */
  /* Duas abas no mesmo aparelho dividem o mesmo save. `vistoLocal` é o texto do save que ESTA aba
     leu ou gravou por último: se o que está no aparelho for diferente, outra aba gravou no meio, e
     antes de gravar por cima esta aba junta o que ela fez (P.mesclar, as mesmas regras de sempre).
     O evento `storage` (abaixo) faz a mesma junção assim que a outra aba grava. */
  var vistoLocal = null;
  function lerBruto() {
    try { return localStorage.getItem(Reino.config.chaveSave); } catch (e) { return null; }
  }
  function lerLocal() {
    var bruto = lerBruto();
    vistoLocal = bruto;
    if (!bruto) return null;
    try { return JSON.parse(bruto); } catch (e) { return null; }
  }
  // o save que outra aba gravou e esta ainda não juntou (null = nenhum)
  function gravadoPorOutra() {
    var bruto = lerBruto();
    if (!bruto || bruto === vistoLocal) return null;
    try { var outro = JSON.parse(bruto); return objeto(outro) ? outro : null; } catch (e) { return null; }
  }
  function gravarLocal() {
    var outro = I.estado && gravadoPorOutra();
    if (outro) { I.estado = completar(comCopia(P.mesclar(I.estado, outro))); P.conferirPersistencia(); }
    // a cópia entra antes da normalização (como em carregar e na mescla, onde o completar() vem depois)
    I.estado = normalizarNovos(comCopia(I.estado));
    var texto = JSON.stringify(I.estado);
    try { localStorage.setItem(Reino.config.chaveSave, texto); vistoLocal = texto; } catch (e) {}
    gravarCopia();
  }
  /* Conteúdo que importa para saber se uma mescla trouxe algo novo: tudo menos `atualizado` e a
     fome, a sede, o banho e o `em` dos cuidados (que o relógio muda a cada segundo e o cuidados.js grava sozinho;
     os carimbos de comer, beber e do banho contam: comida dada num aparelho tem que chegar aos outros), com as chaves
     em ordem e sem os valores vazios (a mescla escreve `perfeita: false` onde o save não tinha o
     campo, e o jogo lê os dois do mesmo jeito). Sem isso, duas abas (ou dois aparelhos) ficariam
     regravando uma para a outra. */
  /** @param {EstadoSave} e @returns {string} */
  function conteudo(e) {
    function ordenar(x) {
      if (Array.isArray(x)) return x.map(ordenar);
      if (!x || typeof x !== 'object') return x;
      var r = {};
      Object.keys(x).sort().forEach(function (k) { if (x[k]) r[k] = ordenar(x[k]); });
      return r;
    }
    var c = ordenar(e), acoes = {};
    delete c.atualizado;
    if (objeto(c.cuidados)) Object.keys(c.cuidados).forEach(function (k) {
      var r = c.cuidados[k];
      if (objeto(r) && (r.acao || r.acaoFome || r.acaoSede || r.acaoBanho)) acoes[k] = [r.acao || 0, r.acaoFome || 0, r.acaoSede || 0, r.acaoBanho || 0];
    });
    c.cuidados = acoes;
    return JSON.stringify(c);
  }
  // `mesclado` tem algo que `recebido` não tem? (o `recebido` passa pela mesma arrumação do carregar)
  /** @param {EstadoSave} mesclado @param {EstadoSave} recebido */
  function trouxeAlgo(mesclado, recebido) {
    return conteudo(mesclado) !== conteudo(completar(U.copia(recebido)));
  }

  /* Cópia de segurança dos campos novos (cuidados, despensa, ajustes.surpresa e surpresaEm) numa chave que a
     versão antiga do jogo não conhece e por isso nunca apaga. Uma aba antiga aberta no mesmo
     navegador regrava o save principal (e o servidor) sem esses campos; ao carregar e ao mesclar,
     o que faltar volta daqui, com as mesmas regras da mescla. Só vale na MESMA geração: depois de
     "Apagar tudo" a cópia fica velha e é ignorada (e regravada na próxima gravação).
     O ciclo vai junto só como informação: "Novo ciclo" mantém cuidados e despensa. */
  var CHAVE_NOVIDADES = Reino.config.chaveSave + '-novidades';
  function objeto(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
  // ids que vêm de fora (servidor, doc, cópia) viram chaves de objeto: só as próprias e nunca as que
  // mexem no protótipo (`{"__proto__": …}` de um save estragado não pode sujar Object.prototype)
  // nem nomes de Object.prototype (hasOwnProperty, toString…)
  var CHAVES_PROIBIDAS = ['__proto__', 'constructor', 'prototype'];
  function chaveSegura(o, k) { return Object.prototype.hasOwnProperty.call(o, k) && CHAVES_PROIBIDAS.indexOf(k) < 0 && !(k in Object.prototype); }
  function proprio(o, k) { return Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined; }
  // número finito (texto com número também vale); senão, o padrão
  function numeroOu(x, padrao) {
    var n = typeof x === 'number' ? x : typeof x === 'string' && x.trim() !== '' ? Number(x) : NaN;
    return isFinite(n) ? n : padrao;
  }
  function lerCopia() {
    try {
      var bruto = localStorage.getItem(CHAVE_NOVIDADES);
      if (!bruto) return null;
      var c = JSON.parse(bruto);
      return objeto(c) ? c : null;
    } catch (e) { return null; }
  }
  function gravarCopia() {
    if (!I.estado) return;
    try {
      localStorage.setItem(CHAVE_NOVIDADES, JSON.stringify({
        geracao: I.estado.geracao || 1, ciclo: I.estado.ciclo || 1, atualizado: I.estado.atualizado,
        cuidados: I.estado.cuidados || {}, despensa: I.estado.despensa || {},
        surpresa: I.estado.ajustes ? I.estado.ajustes.surpresa : undefined,
        surpresaEm: I.estado.ajustes ? I.estado.ajustes.surpresaEm : undefined,
      }));
    } catch (e) {}
  }
  // da cópia só entram registros com números de verdade (cópia estragada não vira NaN no jogo)
  function numero(x) { return typeof x === 'number' && isFinite(x) && x >= 0; }
  function filtrar(o, campos) {
    var r = {};
    if (objeto(o)) Object.keys(o).forEach(function (k) {
      if (chaveSegura(o, k) && objeto(o[k]) && campos.every(function (c) { return numero(o[k][c]); })) r[k] = o[k];
    });
    return r;
  }
  // junta a cópia ao estado `e` (antes do completar(), para a surpresa que falta vir da cópia)
  /** @param {any} e estado cru (do aparelho, do servidor, da mescla) @returns {EstadoSave} */
  function comCopia(e) {
    var c = lerCopia();
    if (!objeto(e) || !c || (c.geracao || 1) !== (e.geracao || 1)) return e;
    e.cuidados = I.juntarCuidados(objeto(e.cuidados) ? e.cuidados : {}, filtrar(c.cuidados, ['fome', 'sede', 'em']));
    e.despensa = I.juntarDespensa(objeto(e.despensa) ? e.despensa : {}, filtrar(c.despensa, ['compradas', 'usadas']));
    e.ajustes = I.juntarSurpresa(objeto(e.ajustes) ? e.ajustes : {}, { surpresa: c.surpresa, surpresaEm: c.surpresaEm });
    return e;
  }
  /** @param {any} e estado cru @returns {EstadoSave} com todos os campos de estadoNovo() */
  function completar(e) {
    var base = estadoNovo();
    Object.keys(base).forEach(function (k) { if (e[k] === undefined) e[k] = base[k]; });
    e.ajustes = Object.assign({}, base.ajustes, e.ajustes || {});
    e.usando = Object.assign({}, base.usando, e.usando || {});
    e.estrelas = Object.assign({}, base.estrelas, e.estrelas || {});
    normalizarNovos(e);
    return e;
  }
  /* Os campos novos sempre no formato certo, venha o estado de onde vier (aparelho, servidor, doc, cópia):
     objetos; fome, sede e banho de 0 a 100 (valor estragado = 100, como unicórnio sem registro; banho ausente fica ausente); `em` ≥ 0;
     compradas e usadas inteiros ≥ 0 e usadas ≤ compradas; surpresa booleana ("true"/"false" em texto
     viram booleano, outro valor volta ao padrão). O carimbo `surpresaEm` não muda. */
  /** @param {any} e estado cru (já com `ajustes`) @returns {EstadoSave} */
  function normalizarNovos(e) {
    var cuidados = {}, despensa = {};
    /** @returns {any} registro com as mesmas chaves seguras (os campos são conferidos logo abaixo) */
    function limpo(y) { var r = {}; Object.keys(y).forEach(function (c) { if (chaveSegura(y, c)) r[c] = y[c]; }); return r; }
    if (objeto(e.cuidados)) Object.keys(e.cuidados).forEach(function (k) {
      var y = e.cuidados[k];
      if (!chaveSegura(e.cuidados, k) || !objeto(y)) return;
      var r = limpo(y);
      r.fome = Math.min(100, Math.max(0, numeroOu(y.fome, 100)));
      r.sede = Math.min(100, Math.max(0, numeroOu(y.sede, 100)));
      r.em = Math.max(0, numeroOu(y.em, 0));
      ['acaoFome', 'acaoSede', 'acaoBanho'].forEach(function (c) { if (c in r && !numero(r[c])) delete r[c]; });
      // banho: ausente continua ausente (vale 100 na leitura); presente e estragado vira 100; entre 0 e 100
      if (r.banho === undefined) delete r.banho;
      else r.banho = Math.min(100, Math.max(0, numeroOu(y.banho, 100)));
      // `acao` mais novo que os carimbos de campo (aba da versão anterior comeu ou bebeu): os campos sobem até ele
      // (os dois calculados antes de mudar: subir um primeiro esconderia o `acao` do outro)
      var efetivos = I.CAMPOS_CUIDADO.map(function (c) { return I.carimbo(r, c[1]); });
      I.CAMPOS_CUIDADO.forEach(function (c, i) { if (numero(r[c[1]]) && numero(r.acao)) r[c[1]] = efetivos[i]; });
      cuidados[k] = r;
    });
    if (objeto(e.despensa)) Object.keys(e.despensa).forEach(function (k) {
      var y = e.despensa[k];
      if (!chaveSegura(e.despensa, k) || !objeto(y)) return;
      var r = limpo(y);
      r.compradas = Math.max(0, Math.floor(numeroOu(y.compradas, 0)));
      r.usadas = Math.min(r.compradas, Math.max(0, Math.floor(numeroOu(y.usadas, 0))));
      despensa[k] = r;
    });
    e.cuidados = cuidados;
    e.despensa = despensa;
    var s = e.ajustes.surpresa;
    if (typeof s !== 'boolean') e.ajustes.surpresa = s === 'false' ? false : s === 'true' ? true : estadoNovo().ajustes.surpresa;
    return e;
  }

  P.carregar = function () {
    I.estado = completar(comCopia(lerLocal() || estadoNovo()));
    if (P.conferirPersistencia().length) gravarLocal();
    vigiarSurpresa();
    return I.estado;
  };
  P.estado = function () { return I.estado; };

  /* Outra aba deste aparelho gravou: junta na hora com o que esta aba tem na memória. Se esta aba
     tinha algo a mais (por exemplo, a outra é de uma versão antiga e gravou sem mesclar), grava de
     volta, com carimbo novo, para o aparelho e para o servidor. Duas abas novas não ficam num
     vaivém: a segunda junção já não traz nada novo. Vale no evento `storage` e também quando a aba
     volta a aparecer (aba que ficou congelada no fundo pode não ter recebido o evento). */
  function juntarDoAparelho(bruto) {
    if (!I.estado || !bruto || bruto === vistoLocal) return;
    var outro;
    try { outro = JSON.parse(bruto); } catch (e) { return; }
    if (!objeto(outro)) return;
    vistoLocal = bruto;
    I.estado = completar(comCopia(P.mesclar(I.estado, U.copia(outro))));
    var novos = P.conferirPersistencia();
    vigiarSurpresa();
    if (novos.length || trouxeAlgo(I.estado, outro)) P.salvar();
    else U.emit(EV.PROGRESSO, I.estado);
    U.emit(EV.PROGRESSO_REMOTO, I.estado);
  }
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('storage', function (ev) {
    if (ev.key === Reino.config.chaveSave) juntarDoAparelho(ev.newValue);
  });
  if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('visibilitychange', function () {
    if (!document.hidden) juntarDoAparelho(lerBruto());
  });

  /* O interruptor da surpresa muda nos dois sentidos: quando ela o troca (ui/ajustes.js só muda o valor e
     chama P.salvar), ganha o carimbo `ajustes.surpresaEm`, e na mescla vale o carimbo maior.
     Só conta a troca no MESMO objeto de estado: carregar, mesclar e "Apagar tudo" trocam o objeto e
     não carimbam (o padrão de estadoNovo() nunca tem carimbo, senão um aparelho novo venceria). */
  var vigiaSurpresa = { estado: null, valor: undefined };
  function marcarSurpresa() {
    var a = I.estado && I.estado.ajustes;
    if (!a) return;
    if (vigiaSurpresa.estado === I.estado && vigiaSurpresa.valor !== undefined && a.surpresa !== vigiaSurpresa.valor) a.surpresaEm = agora();
  }
  function vigiarSurpresa() { vigiaSurpresa = { estado: I.estado, valor: I.estado && I.estado.ajustes ? I.estado.ajustes.surpresa : undefined }; }

  P.salvar = function (semNuvem) {
    I.estado.atualizado = agora();
    marcarSurpresa();
    gravarLocal();
    vigiarSurpresa();
    U.emit(EV.PROGRESSO, I.estado);
    if (!semNuvem) I.agendarNuvem();
  };

  // para as outras partes
  I.agora = agora; I.estadoNovo = estadoNovo; I.objeto = objeto; I.numero = numero; I.numeroOu = numeroOu;
  I.chaveSegura = chaveSegura; I.proprio = proprio; I.completar = completar; I.comCopia = comCopia;
  I.conteudo = conteudo; I.trouxeAlgo = trouxeAlgo; I.gravarLocal = gravarLocal; I.vigiarSurpresa = vigiarSurpresa;

  Reino.Progresso = P;
})();
