/* Progresso (parte 2 de 4): P.mesclar, a junção de dois estados (aparelhos, abas, servidor), e as regras
   dos campos novos (cuidados, despensa, surpresa) que a cópia -novidades também usa.
   Não lê nem troca o estado: só junta os dois que recebe. Ver o cabeçalho de progresso.js. */
(function () {
  var U = Reino.util, I = Reino._progresso, P = I.P;
  var objeto = I.objeto, numero = I.numero, numeroOu = I.numeroOu, chaveSegura = I.chaveSegura, proprio = I.proprio;

  /* ---------- mesclar dois estados (aparelhos diferentes) ---------- */
  function max(a, b) { return Math.max(a || 0, b || 0); }
  function minPos(a, b) { if (!a) return b; if (!b) return a; return Math.min(a, b); }
  var ORDEM_MEDALHA = { bronze: 1, prata: 2, ouro: 3 };
  var ORDEM_PREMIO = { comum: 1, raro: 2, lendario: 3 };

  // as regras dos campos novos, usadas pela mescla e pela cópia de segurança: `base` ganha no empate
  /* cuidados: um carimbo por campo, `acaoFome` (hora do último comer) e `acaoSede` (do último beber); o gasto
     do relógio não mexe neles (0 = nenhum ainda). `acao` = o maior dos dois (registro da versão anterior só
     tem ele, e aí ele vale para os dois campos). Com carimbo dos dois lados, CADA campo vem do lado com o seu
     carimbo maior (água dada num aparelho não apaga a comida dada no outro); empate = a mesma ação vista pelos
     dois e, como o gasto só desce, vale o menor valor. Um lado sem carimbo nenhum: o registro do `em` maior. */
  var CAMPOS_CUIDADO = [['fome', 'acaoFome'], ['sede', 'acaoSede']];
  // carimbo efetivo de um campo: o do campo; mas um `acao` mais novo que os dois carimbos de campo (ação feita
  // numa aba da versão anterior desta branch, que só conhece o `acao`) vale para os dois campos
  /** @param {Partial<RegCuidado>} r @param {string} chave 'acaoFome' | 'acaoSede' @returns {number | null} */
  function carimbo(r, chave) {
    var campos = CAMPOS_CUIDADO.map(function (c) { return r[c[1]]; }).filter(numero);
    if (numero(r.acao) && (!numero(r[chave]) || r.acao > Math.max.apply(null, campos))) return r.acao;
    return numero(r[chave]) ? r[chave] : null;
  }
  /* banho: carimbo próprio (`acaoBanho`, 0 = nunca) e fora do `acao`, para um aparelho da versão de hoje (que
     trata um `acao` novo como comer e beber) nunca ver um banho como comida. Roda depois da regra da fome e da
     sede, com os valores ORIGINAIS dos dois lados: só um lado tem `banho` numérico = vale esse lado (mesmo
     que a regra do `em` tenha escolhido o registro inteiro do outro: aparelho de hoje nunca faz o banho
     sumir); os dois = o carimbo maior, empate = o menor banho (o gasto só desce); nenhum = continua ausente. */
  function temBanho(r) { return typeof r.banho === 'number' && isFinite(r.banho); }
  function juntarBanho(fica, x, y) {
    var bx = temBanho(x), by = temBanho(y);
    if (!bx && !by) return;
    var cx = numero(x.acaoBanho) ? x.acaoBanho : 0, cy = numero(y.acaoBanho) ? y.acaoBanho : 0;
    var lado = !by ? x : !bx ? y : cy > cx ? y : cx > cy ? x : y.banho < x.banho ? y : x;
    fica.banho = lado.banho;
    if (bx && by) { if (numero(x.acaoBanho) || numero(y.acaoBanho)) fica.acaoBanho = Math.max(cx, cy); }
    else if (numero(lado.acaoBanho)) fica.acaoBanho = lado.acaoBanho;
    else delete fica.acaoBanho;
  }
  /** @param {Object<string, RegCuidado>} base o lado que fica (é mudado e devolvido) @param {any} outro
      @returns {Object<string, RegCuidado>} */
  function juntarCuidados(base, outro) {
    if (!objeto(outro)) return base;
    Object.keys(outro).forEach(function (k) {
      if (!chaveSegura(outro, k)) return;
      var x = proprio(base, k), y = outro[k];
      if (!objeto(y)) return;
      if (!objeto(x)) { base[k] = U.copia(y); return; }
      // os campos do banho como chegaram (a regra da fome e da sede não mexe neles, mas pode trocar o registro)
      var bx = { banho: x.banho, acaoBanho: x.acaoBanho }, by = { banho: y.banho, acaoBanho: y.acaoBanho };
      // carimbo estragado conta como ausente (regra do `em`); `em` estragado conta como 0
      var comCarimbo = CAMPOS_CUIDADO.every(function (c) { return carimbo(x, c[1]) !== null && carimbo(y, c[1]) !== null; });
      if (!comCarimbo) {
        if (numeroOu(y.em, 0) > numeroOu(x.em, 0)) base[k] = U.copia(y);
        juntarBanho(base[k], bx, by);
        return;
      }
      // os carimbos efetivos dos dois campos, calculados antes de mudar qualquer um
      var cxs = CAMPOS_CUIDADO.map(function (c) { return carimbo(x, c[1]); }), cys = CAMPOS_CUIDADO.map(function (c) { return carimbo(y, c[1]); });
      CAMPOS_CUIDADO.forEach(function (c, i) {
        var campo = c[0], chave = c[1], cx = cxs[i], cy = cys[i];
        if (cy > cx && numero(y[campo])) x[campo] = y[campo];
        else if (cy === cx && numero(y[campo]) && !(y[campo] >= x[campo])) x[campo] = y[campo];
        if (numero(x[chave]) || numero(y[chave])) x[chave] = Math.max(cx, cy);
      });
      if (numero(x.acao) || numero(y.acao)) x.acao = max(numeroOu(x.acao, 0), numeroOu(y.acao, 0));
      x.em = max(numeroOu(x.em, 0), numeroOu(y.em, 0));
      juntarBanho(x, bx, by);
    });
    return base;
  }
  /** @param {Object<string, RegDespensa>} base o lado que fica (é mudado e devolvido) @param {any} outro
      @returns {Object<string, RegDespensa>} */
  function juntarDespensa(base, outro) {
    if (!objeto(outro)) return base;
    Object.keys(outro).forEach(function (k) {
      if (!chaveSegura(outro, k)) return;
      var x = proprio(base, k), y = outro[k];
      if (!objeto(y)) return;
      // registro deste lado estragado (não é objeto) conta como ausente; contador estragado conta como 0
      if (!objeto(x)) { base[k] = U.copia(y); return; }
      x.compradas = max(numeroOu(x.compradas, 0), numeroOu(y.compradas, 0)); x.usadas = max(numeroOu(x.usadas, 0), numeroOu(y.usadas, 0));
    });
    return base;
  }

  // `base` (o lado que fica) recebe a surpresa de `outro` se o carimbo de `outro` for maior, ou, sem carimbo
  // nenhum, se `base` não tem o campo; `base` ganha no empate
  function juntarSurpresa(base, outro) {
    if (!objeto(outro) || typeof outro.surpresa !== 'boolean') return base;
    var cb = typeof base.surpresa === 'boolean' && numero(base.surpresaEm) ? base.surpresaEm : 0, co = numero(outro.surpresaEm) ? outro.surpresaEm : 0;
    if (co > cb) { base.surpresa = outro.surpresa; base.surpresaEm = co; }
    else if (!cb && !co && base.surpresa === undefined) base.surpresa = outro.surpresa;
    return base;
  }

  /* escolhas (montaria, usando, aparência, cada ajuste fora a surpresa, o nome de cada unicórnio): carimbo por
     escolha em `escolhasEm` (P.salvar marca a troca). Vale o valor do lado com o carimbo MAIOR daquela escolha;
     sem carimbo conta 0; empate (inclusive sem carimbo nos dois) = o lado que fica (o mais recente, a regra de
     antes). Um aparelho da versão antiga não carimba: a troca dele só vale onde ninguém carimbou aquela escolha.
     `r` é a cópia do lado mais recente (é mudado); `antigo` não muda. */
  /** @param {EstadoSave} r @param {EstadoSave} recente @param {EstadoSave} antigo */
  function juntarEscolhas(r, recente, antigo) {
    var cr = I.soCarimbos(recente.escolhasEm), ca = I.soCarimbos(antigo.escolhasEm);
    function doAntigo(ch) { return (ca[ch] || 0) > (cr[ch] || 0); }
    ['montaria', 'usando', 'aparencia'].forEach(function (ch) {
      if (doAntigo(ch) && antigo[ch] !== undefined) r[ch] = U.copia(antigo[ch]);
    });
    if (objeto(r.ajustes) && objeto(antigo.ajustes)) Object.keys(antigo.ajustes).forEach(function (k) {
      if (k !== 'surpresa' && k !== 'surpresaEm' && chaveSegura(antigo.ajustes, k) && doAntigo('ajuste:' + k)) r.ajustes[k] = U.copia(antigo.ajustes[k]);
    });
    // nome: o unicórnio já está nos dois lados (só de um lado, ele veio inteiro com o nome)
    if (objeto(r.unis) && objeto(antigo.unis)) Object.keys(antigo.unis).forEach(function (k) {
      var x = proprio(r.unis, k), y = antigo.unis[k];
      if (!chaveSegura(antigo.unis, k) || !objeto(x) || !objeto(y) || !doAntigo('nome:' + k)) return;
      if (y.nome === undefined) delete x.nome; else x.nome = y.nome;
    });
  }
  // carimbos dos dois lados, por chave o maior
  function juntarCarimbos(a, b) {
    var r = I.soCarimbos(a), o = I.soCarimbos(b);
    Object.keys(o).forEach(function (k) { r[k] = Math.max(r[k] || 0, o[k]); });
    return r;
  }

  /** Junta dois estados da mesma Mariana (regras em docs/contratos/save-e-mescla.md §4). Não muda `a` nem `b`,
      exceto quando devolve um deles inteiro (lado vazio ou geração diferente).
      @param {EstadoSave} a @param {EstadoSave} b @returns {EstadoSave} */
  P.mesclar = function (a, b) { return mesclar(a, b, false); };
  /* `semCarimbos`: as escolhas e o pago pela regra de antes (lado mais recente; pago, o maior), como a versão
     antiga decide; os carimbos continuam juntos pelo maior. Só para o aparelho novo ceder a um banco que a versão
     antiga gravou (progresso-nuvem.js, contra o vaivém). */
  /** @param {EstadoSave} a @param {EstadoSave} b @param {boolean} semCarimbos @returns {EstadoSave} */
  function mesclar(a, b, semCarimbos) {
    if (!a) return b; if (!b) return a;
    // quem "apagou tudo" por último vence inteiro
    if ((a.geracao || 1) !== (b.geracao || 1)) return (a.geracao || 1) > (b.geracao || 1) ? a : b;
    var recente = (a.atualizado || 0) >= (b.atualizado || 0) ? a : b;
    var antigo = recente === a ? b : a;
    var r = U.copia(recente);

    // novo ciclo de provas: salas, treinos e pagamentos vêm do ciclo mais novo
    var mesmoCiclo = (a.ciclo || 1) === (b.ciclo || 1);
    if (mesmoCiclo) {
      Object.keys(antigo.salas || {}).forEach(function (k) {
        var x = r.salas[k], y = antigo.salas[k];
        if (!x) { r.salas[k] = U.copia(y); return; }
        x.feita = minPos(x.feita, y.feita); x.melhor = max(x.melhor, y.melhor);
        x.perfeita = !!(x.perfeita || y.perfeita); x.calma = !!(x.calma || y.calma); x.vezes = max(x.vezes, y.vezes);
      });
      Object.keys(antigo.treinos || {}).forEach(function (k) {
        var x = r.treinos[k], y = antigo.treinos[k];
        if (!x) { r.treinos[k] = U.copia(y); return; }
        if ((ORDEM_MEDALHA[y.melhor] || 0) > (ORDEM_MEDALHA[x.melhor] || 0)) x.melhor = y.melhor;
        x.ouro = minPos(x.ouro, y.ouro); x.perfeito = minPos(x.perfeito, y.perfeito); x.vezes = max(x.vezes, y.vezes);
      });
      // pago: vale o lado com o carimbo `pagoEm` maior (a correção dos pais, também para menos); sem carimbo
      // nos dois (ou empate), o maior, como antes
      var pr = I.soCarimbos(!semCarimbos && recente.pagoEm), pa = I.soCarimbos(!semCarimbos && antigo.pagoEm);
      Object.keys(antigo.pago || {}).forEach(function (k) {
        var tr = pr[k] || 0, ta = pa[k] || 0;
        r.pago[k] = ta > tr ? antigo.pago[k] : tr > ta && r.pago[k] !== undefined ? r.pago[k] : max(r.pago[k], antigo.pago[k]);
      });
      if (recente.pagoEm || antigo.pagoEm) r.pagoEm = juntarCarimbos(recente.pagoEm, antigo.pagoEm);
    } else if ((antigo.ciclo || 1) > (recente.ciclo || 1)) {
      r.ciclo = antigo.ciclo; r.salas = U.copia(antigo.salas || {}); r.treinos = U.copia(antigo.treinos || {}); r.pago = U.copia(antigo.pago || {});
      if (antigo.pagoEm) r.pagoEm = U.copia(antigo.pagoEm); else delete r.pagoEm;
    }
    // provas bimestrais: vale o aparelho com mais tentativas e o melhor prêmio
    r.provas = r.provas || {};
    Object.keys(antigo.provas || {}).forEach(function (k) {
      var x = r.provas[k], y = antigo.provas[k];
      if (!x) { r.provas[k] = U.copia(y); return; }
      if ((y.tentativas || 0) > (x.tentativas || 0)) { x.tentativas = y.tentativas; x.notas = U.copia(y.notas || []); }
      x.melhor = Math.max(x.melhor || 0, y.melhor || 0);
      if ((ORDEM_PREMIO[y.premio] || 0) > (ORDEM_PREMIO[x.premio] || 0)) { x.premio = y.premio; x.premioEm = y.premioEm; }
    });
    // unicórnios: união, maior XP
    Object.keys(antigo.unis || {}).forEach(function (k) {
      var x = r.unis[k], y = antigo.unis[k];
      if (!x) { r.unis[k] = U.copia(y); return; }
      x.xp = max(x.xp, y.xp); x.em = minPos(x.em, y.em); x.chocado = !!(x.chocado || y.chocado);
    });
    // estrelas: maior de cada lado; valor estragado (texto, null) conta como 0 e não apaga o número bom do outro lado
    var er = objeto(r.estrelas) ? r.estrelas : {}, ea = objeto(antigo.estrelas) ? antigo.estrelas : {};
    r.estrelas = { ganhas: max(numeroOu(er.ganhas, 0), numeroOu(ea.ganhas, 0)), gastas: Math.max(0, max(numeroOu(er.gastas, 0), numeroOu(ea.gastas, 0))) };
    Object.keys(antigo.loja || {}).forEach(function (k) { if (antigo.loja[k]) r.loja[k] = true; });
    // fome, sede e banho: por unicórnio, a regra de juntarCuidados (carimbo dos dois lados, 0 inclusive: cada campo vem
    // do lado com o seu carimbo maior, `acaoFome`/`acaoSede`, ou `acao` para os dois; empate: o menor valor e o
    // maior `em`; um lado sem carimbo: o `em` maior, empate = o lado mais recente).
    // Um lado sem o campo (aparelho com a versão antiga) não apaga nada: vale o outro lado.
    // (cuidados ou despensa estragados no lado mais recente não apagam os do outro lado)
    if (a.cuidados || b.cuidados) r.cuidados = juntarCuidados(U.copia(objeto(recente.cuidados) ? recente.cuidados : {}), antigo.cuidados);
    // despensa: contadores que só crescem, pelo maior (nunca some comida comprada)
    if (a.despensa || b.despensa) r.despensa = juntarDespensa(U.copia(objeto(recente.despensa) ? recente.despensa : {}), antigo.despensa);
    // interruptor novo das perguntas surpresa: vale o lado com o carimbo `surpresaEm` maior (troca feita por
    // último); sem carimbo dos dois lados, se o lado mais recente não conhece (versão antiga), vale o do outro
    if (r.ajustes) juntarSurpresa(r.ajustes, antigo.ajustes);
    // escolhas: por escolha, o carimbo maior em `escolhasEm` (juntarEscolhas); os carimbos, por chave o maior
    if (!semCarimbos) juntarEscolhas(r, recente, antigo);
    if (a.escolhasEm || b.escolhasEm) r.escolhasEm = juntarCarimbos(recente.escolhasEm, antigo.escolhasEm);
    // campos de P.registrarCampo: a estratégia de cada um (base = o lado mais recente, como a despensa);
    // o que zera no Novo ciclo vem inteiro do ciclo mais novo (como as salas)
    I.cadaCampo(function (n, def) {
      if (a[n] === undefined && b[n] === undefined) return;
      if (def.novoCiclo === 'zera' && !mesmoCiclo) {
        var novo = (antigo.ciclo || 1) > (recente.ciclo || 1) ? antigo : recente, v = I.limparCampo(def, novo[n]);
        r[n] = v === undefined ? def.padrao() : U.copia(v);
      } else r[n] = I.juntarCampo(def, recente[n], antigo[n]);
    });
    r.comecou = !!(a.comecou || b.comecou);
    r.ritualVisto = !!(a.ritualVisto || b.ritualVisto);
    return r;
  }

  // para as outras partes
  I.CAMPOS_CUIDADO = CAMPOS_CUIDADO; I.carimbo = carimbo; I.ORDEM_MEDALHA = ORDEM_MEDALHA;
  I.juntarCuidados = juntarCuidados; I.juntarDespensa = juntarDespensa; I.juntarSurpresa = juntarSurpresa;
  I.mesclarSemCarimbos = function (a, b) { return mesclar(a, b, true); };
})();
