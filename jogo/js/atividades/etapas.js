/* Etapas da sala de livro (docs/contratos/quarto-bimestre.md §13.1): a sala longa vira uma trilha de etapas curtas.
   Reino.etapasDaSala(materia, sala) → null (sala sem `ordem: 'livro'`) ou [{ n, cartas: [id…], desafios: [d…] }, …].
   1. Desafios na ordem do arquivo; a etapa fecha ao chegar a config.etapaDesafiosMax pontos (escrever e desenho valem
      config.etapaPesoEscrever, o resto 1). Sobra de 1 desafio sem carta própria, no fim, junta-se à etapa anterior
      se a soma não passar de etapaDesafiosMax + 1 (senão fica sozinha). `sala.etapas: [n, …]` (à mão): quantos
      desafios em cada etapa.
   2. Cada carta de `sala.cartas` vai para a etapa do 1º desafio que a cita (`desafio.livro`); carta sem desafio vai com
      a carta seguinte (as últimas, com a última etapa); as cartas nunca voltam para antes da etapa da carta anterior.
   3. Leitura demais numa etapa (mais de config.etapaCartasMax cartas ou de config.etapaPalavrasMax palavras): só o
      MÍNIMO de cartas do começo sai para etapa(s) só de leitura antes dela (o menor número de etapas, as mais
      parelhas possível); uma carta grande sozinha pode. Saíram 2+ etapas de leitura seguidas: cada desafio da etapa
      vai junto da carta que cita (em ordem: nunca antes do desafio anterior; o último fica na etapa das cartas finais),
      e as etapas de leitura ganham perguntas no meio.
   Pura e determinística (só a sala, as cartas da matéria e o config). node: true: nada de DOM nem Progresso. */
(function () {
  var R = window.Reino;

  /* ---------- palavras de uma carta ---------- */
  function palavrasDe(t) { return typeof t === 'string' ? (t.match(/[0-9A-Za-zÀ-ÿ]+/g) || []).length : 0; }
  // o que se lê: texto, versos, itens (termo, texto, legenda), quadro, fala e tabela; título, fonte e ilustração não
  function textosBloco(b) {
    var t = [b.texto, b.titulo && b.t === 'quadro' ? b.titulo : null];
    (b.versos || []).forEach(function (v) { t.push(v); });
    (b.itens || []).forEach(function (i) { if (typeof i === 'string') t.push(i); else if (i) t.push(i.termo, i.texto, i.legenda); });
    if (b.t === 'tabela') (b.cab || []).concat.apply(b.cab || [], b.linhas || []).forEach(function (c) { t.push(c); });
    if (b.t === 'fala') t.push(b.quem);
    return t;
  }
  /** Palavras de leitura de uma carta (todos os blocos; carta antiga: o `texto`). @param {any} c @returns {number} */
  function palavrasCarta(c) {
    if (!c) return 0;
    if (!Array.isArray(c.blocos)) return palavrasDe(c.texto);
    return c.blocos.reduce(function (s, b) {
      if (!b || b.t === 'fonte' || b.t === 'ilustracao') return s;
      return s + textosBloco(b).reduce(function (x, t) { return x + palavrasDe(t); }, 0);
    }, 0);
  }

  function pesoDesafio(d) { return d.tipo === 'escrever' || d.tipo === 'desenho' ? R.config.etapaPesoEscrever : 1; }

  // 1: os desafios em grupos (índices), pelos pontos ou pela lista à mão
  function gruposDesafios(sala) {
    var ds = sala.desafios || [], grupos = [], atual = [], pts = 0, max = R.config.etapaDesafiosMax;
    if (Array.isArray(sala.etapas) && sala.etapas.length) {
      var i = 0;
      sala.etapas.forEach(function (n) { var g = []; for (var k = 0; k < n && i < ds.length; k++) g.push(i++); if (g.length) grupos.push(g); });
      if (i < ds.length) grupos.push(ds.slice(i).map(function (_, k) { return i + k; }));   // conta à mão curta: o resto no fim
      return grupos;
    }
    ds.forEach(function (d, i) {
      atual.push(i); pts += pesoDesafio(d);
      if (pts >= max) { grupos.push(atual); atual = []; pts = 0; }
    });
    if (atual.length) grupos.push(atual);
    return grupos;
  }

  // 2: a etapa de cada carta (índice do grupo), na ordem de sala.cartas
  function etapaDasCartas(sala, ids, grupoDe) {
    var ds = sala.desafios || [], ultima = Math.max(0, grupoDe[ds.length - 1] || 0);
    var casa = ids.map(function (id) {
      for (var i = 0; i < ds.length; i++) if (ds[i].livro === id) return grupoDe[i];
      return null;
    });
    // sem desafio: a da carta seguinte (as últimas, a última etapa)
    for (var k = casa.length - 1; k >= 0; k--) if (casa[k] === null) casa[k] = k + 1 < casa.length ? casa[k + 1] : ultima;
    // nunca antes da carta anterior
    for (var j = 1; j < casa.length; j++) casa[j] = Math.max(casa[j], casa[j - 1]);
    return casa;
  }

  function cabe(pal, ini, fim) {
    var n = fim - ini, p = 0;
    for (var i = ini; i < fim; i++) p += pal[i];
    return n <= 1 || (n <= R.config.etapaCartasMax && p <= R.config.etapaPalavrasMax);
  }
  // as cartas [0, fim) no menor número de grupos que cabem, o mais parelhos possível (a maior leitura, a menor)
  function partirLeitura(pal, fim) {
    var melhor = [];   // melhor[i] = { n, pior, cortes } para as cartas [0, i)
    melhor[0] = { n: 0, pior: 0, cortes: [] };
    for (var i = 1; i <= fim; i++) {
      for (var a = 0; a < i; a++) {
        if (!melhor[a] || !cabe(pal, a, i)) continue;
        var p = 0; for (var k = a; k < i; k++) p += pal[k];
        var c = { n: melhor[a].n + 1, pior: Math.max(melhor[a].pior, p), cortes: melhor[a].cortes.concat([[a, i]]) };
        var m = melhor[i];
        if (!m || c.n < m.n || (c.n === m.n && c.pior < m.pior)) melhor[i] = c;
      }
    }
    return melhor[fim].cortes;
  }

  // em que trecho de cartas fica cada desafio da etapa: todos no último (o de sempre), ou, com 2+ trechos só de
  // leitura antes dele, junto da carta que cita; sem carta do trecho, com o anterior; nunca antes do anterior
  function espalhar(desafios, cartas, trechos) {
    var ult = trechos.length - 1;
    if (ult < 2) return desafios.map(function () { return ult; });
    var trechoDe = function (id) {
      var k = cartas.indexOf(id);
      for (var t = 0; k >= 0 && t < trechos.length; t++) if (k >= trechos[t][0] && k < trechos[t][1]) return t;
      return -1;
    };
    var lugar = [], antes = 0;
    desafios.forEach(function (d, j) {
      var t = trechoDe(d.livro);
      antes = j === desafios.length - 1 ? ult : Math.max(antes, t);
      lugar.push(antes);
    });
    return lugar;
  }

  /** @param {Materia} materia @param {Sala} sala @returns {{ n: number, cartas: string[], desafios: Desafio[] }[] | null} */
  R.etapasDaSala = function (materia, sala) {
    if (!sala || sala.ordem !== 'livro') return null;
    var ds = sala.desafios || [], livro = (materia && materia.livro) || [];
    var carta = function (id) { return livro.find(function (c) { return c.id === id; }); };
    var ids = (sala.cartas || []).filter(function (id, i, l) { return l.indexOf(id) === i; });
    var grupos = gruposDesafios(sala);
    if (!grupos.length) grupos = [[]];
    var grupoDe = [];
    grupos.forEach(function (g, gi) { g.forEach(function (i) { grupoDe[i] = gi; }); });
    var casa = etapaDasCartas(sala, ids, grupoDe);
    // sobra de 1 desafio sem carta própria no fim: junta-se à etapa anterior (só na divisão automática)
    var ult = grupos.length - 1;
    var pontos = function (g) { return g.reduce(function (t, i) { return t + pesoDesafio(ds[i]); }, 0); };
    if (!(Array.isArray(sala.etapas) && sala.etapas.length) && ult > 0 && grupos[ult].length === 1 && casa.indexOf(ult) < 0 &&
        pontos(grupos[ult - 1]) + pontos(grupos[ult]) <= R.config.etapaDesafiosMax + 1) {
      grupos[ult - 1] = grupos[ult - 1].concat(grupos.pop());
      grupoDe[ds.length - 1] = ult - 1;
    }
    var etapas = [];
    grupos.forEach(function (g, gi) {
      var minhas = ids.filter(function (_, k) { return casa[k] === gi; });
      var pal = minhas.map(function (id) { return palavrasCarta(carta(id)); });
      // 3: o mínimo de cartas do começo sai para leitura antes (o que sobra cabe junto dos desafios)
      var tira = 0;
      while (!cabe(pal, tira, pal.length)) tira++;
      var trechos = (tira ? partirLeitura(pal, tira) : []).concat([[tira, minhas.length]]);
      var lugar = espalhar(g.map(function (i) { return ds[i]; }), minhas, trechos);
      trechos.forEach(function (c, k) {
        etapas.push({ cartas: minhas.slice(c[0], c[1]), desafios: g.filter(function (_, j) { return lugar[j] === k; }).map(function (i) { return ds[i]; }) });
      });
    });
    etapas.forEach(function (e, n) { e.n = n; });
    return etapas.map(function (e) { return { n: e.n, cartas: e.cartas, desafios: e.desafios }; });
  };
  R.etapasDaSala.palavrasCarta = palavrasCarta;
  R.etapasDaSala.peso = pesoDesafio;
})();
