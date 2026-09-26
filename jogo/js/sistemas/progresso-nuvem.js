/* Progresso (parte 3 de 4): sincronização com o servidor de casa (/api/progresso) e com o claude.ai
   (capacidade db, doc progresso/mariana). Ver o cabeçalho de progresso.js. */
(function () {
  var U = Reino.util, I = Reino._progresso, P = I.P, nuvem = I.nuvem;
  var EV = Reino.EVENTOS;
  var agora = I.agora, objeto = I.objeto, completar = I.completar, comCopia = I.comCopia, conteudo = I.conteudo;
  var trouxeAlgo = I.trouxeAlgo, gravarLocal = I.gravarLocal, vigiarSurpresa = I.vigiarSurpresa;

  /* ---------- sincronização com o claude.ai (capacidade db) ---------- */
  function agendarNuvem() {
    if (!nuvem.ok) return;
    clearTimeout(nuvem.timer);
    nuvem.timer = setTimeout(enviarNuvem, 1800);
  }
  /* Rede lenta: uma gravação sem resposta em LIMITE_REDE_MS vira erro (senão `gravando` ficava preso e
     nenhuma outra saía, com o indicador em "sincronizado"). No servidor de casa o fetch é cancelado
     (AbortController); no claude.ai o set do doc não tem como cancelar, e o limite só libera a fila.
     Depois de um erro, tenta de novo sozinha em 15 s (a próxima gravação leva o estado inteiro). */
  function limiteRede() { return Reino.config.limiteRedeMs || 15000; }            // (os testes encurtam os dois)
  function novaTentativa() { return Reino.config.novaTentativaMs || 15000; }
  function enviarNuvem() {
    if (!nuvem.ok || !nuvem.ref) return;
    if (nuvem.gravando) { nuvem.pendente = true; return; }
    nuvem.gravando = true;
    var falhou = false;
    comLimite(nuvem.ref.set({ estado: U.copia(I.estado), atualizado: I.estado.atualizado }), limiteRede())
      .then(function () { nuvem.status = 'sincronizado'; U.emit(EV.NUVEM, nuvem.status); })
      .catch(function (e) {
        nuvem.status = 'erro'; U.emit(EV.NUVEM, nuvem.status);
        if (e && (e.code === 'revoked' || e.code === 'not_granted' || e.code === 'invalid_argument')) nuvem.ok = false;
        else falhou = true;
      })
      .then(function () {
        nuvem.gravando = false;
        if (nuvem.pendente) { nuvem.pendente = false; agendarNuvem(); }
        else if (falhou && nuvem.ok) { clearTimeout(nuvem.timer); nuvem.timer = setTimeout(enviarNuvem, novaTentativa()); }
      });
  }
  /* no servidor de casa (servidor/servidor.js) o mesmo doc fica em /api/progresso;
     este adaptador imita o doc da capacidade db (get, set, onSnapshot) */
  // fetch que desiste (e cancela a conexão) depois do limite de rede
  function buscar(url, opcoes) {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var t = ctl ? setTimeout(function () { ctl.abort(); }, limiteRede()) : 0;
    return fetch(url, ctl ? Object.assign({ signal: ctl.signal }, opcoes) : opcoes)
      .then(function (r) { clearTimeout(t); return r; }, function (e) { clearTimeout(t); throw e; });
  }
  /** @returns {DocProgresso} */
  function docDoServidor() {
    function ler() {
      return buscar('api/progresso', { cache: 'no-store' }).then(function (r) {
        if (r.status === 404) return null;
        if (!r.ok) throw new Error('servidor ' + r.status);
        return r.json();
      });
    }
    function snap(d) { return { exists: !!d, data: function () { return d; }, metadata: { hasPendingWrites: false } }; }
    return {
      get: function () { return ler().then(snap); },
      set: function (d) {
        return buscar('api/progresso', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
          .then(function (r) { if (!r.ok) throw new Error('servidor ' + r.status); });
      },
      onSnapshot: function (ok, erro) {
        function conferir() { ler().then(function (d) { if (d) ok(snap(d)); }, erro); }
        setInterval(conferir, 20000);
        document.addEventListener('visibilitychange', function () { if (!document.hidden) conferir(); });
      },
    };
  }
  // sem resposta (rede fora) é falha, não "sem servidor": o jogo espera e oferece tentar de novo
  function temServidor() {
    return fetch('api/progresso', { method: 'HEAD', cache: 'no-store' })
      .then(function (r) {
        var sim = r.headers.get('X-Reino') === '1';
        Reino.ambiente.marcarServidorCasa(sim);
        return sim;
      });
  }
  /** @template T @param {Promise<T>} promessa @param {number} ms @returns {Promise<T>} rejeita sem resposta em `ms` */
  function comLimite(promessa, ms) {
    return new Promise(function (ok, falha) {
      var t = setTimeout(function () { falha(new Error('sem resposta')); }, ms);
      promessa.then(function (v) { clearTimeout(t); ok(v); }, function (e) { clearTimeout(t); falha(e); });
    });
  }

  /* Busca o progresso guardado (servidor de casa ou claude.ai) e junta com o do aparelho.
     A promessa só se cumpre com a resposta, e o jogo só começa depois dela: senão um aparelho
     novo abriria como jogo novo. Falha (ou demora demais) = rejeita, e o jogo pode tentar de novo.
     Aberto direto do arquivo, sem servidor nenhum, segue só no aparelho. */
  var tentativa = 0;
  P.iniciarNuvem = function () {
    var minha = ++tentativa;
    var amb = Reino.ambiente;
    var pedirDb = amb.artifact() ? window.claude.use('db')
      : amb.http() || /^https:$/.test(location.protocol) ? temServidor().then(function (s) { return s ? { doc: docDoServidor } : null; })
      : Promise.resolve(null);
    var pronto = pedirDb.then(function (db) {
      if (!db) return;
      var ref = db.doc('progresso/mariana');
      return ref.get().then(function (snap) {
        if (minha !== tentativa) return;   // resposta atrasada de uma tentativa que já desistiu
        nuvem.ref = ref;
        nuvem.ok = true;
        nuvem.status = 'sincronizado';
        if (snap.exists && snap.data() && snap.data().estado) {
          var guardado = snap.data().estado;
          // aparelho que nunca começou não tem nada a somar: fica com o guardado inteiro
          // (senão a aparência e as escolhas em branco dele, mais recentes, venceriam)
          var emBranco = !I.estado.comecou && (I.estado.geracao || 1) <= (guardado.geracao || 1);
          I.estado = completar(comCopia(emBranco ? U.copia(guardado) : P.mesclar(I.estado, guardado)));
          P.conferirPersistencia();
          // este aparelho tinha algo que o banco não tem: carimbo novo, para os outros aparelhos
          // não ignorarem o envio abaixo como "já visto" (mesmo `atualizado`)
          if (trouxeAlgo(I.estado, guardado)) I.estado.atualizado = agora();
          gravarLocal();
          vigiarSurpresa();
          U.emit(EV.PROGRESSO, I.estado);
          U.emit(EV.PROGRESSO_REMOTO, I.estado);
        }
        if (I.estado.comecou) enviarNuvem();
        U.emit(EV.NUVEM, nuvem.status);
        nuvem.ref.onSnapshot(function (s) {
          if (!s.exists || s.metadata.hasPendingWrites) return;
          var remoto = s.data() && s.data().estado;
          // nada de novo no banco (pelo conteúdo, não pelo `atualizado`: dois aparelhos podem mandar
          // estados diferentes com o mesmo carimbo)
          if (!objeto(remoto) || conteudo(completar(U.copia(remoto))) === conteudo(I.estado)) return;
          I.estado = completar(comCopia(P.mesclar(I.estado, remoto)));
          // a junção trouxe algo que o banco não tem: devolve ao banco com carimbo novo
          if (P.conferirPersistencia().length || trouxeAlgo(I.estado, remoto)) { I.estado.atualizado = agora(); agendarNuvem(); }
          gravarLocal();
          vigiarSurpresa();
          U.emit(EV.PROGRESSO, I.estado);
          U.emit(EV.PROGRESSO_REMOTO, I.estado);
        }, function () { nuvem.status = 'local'; U.emit(EV.NUVEM, nuvem.status); });
      });
    });
    return comLimite(pronto, 12000).catch(function (e) {
      if (minha === tentativa) tentativa++;
      throw e;
    });
  };
  P.statusNuvem = function () { return nuvem.ok ? nuvem.status : 'local'; };

  // para as outras partes
  I.agendarNuvem = agendarNuvem;
})();
