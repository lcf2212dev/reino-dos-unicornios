/* Progresso (parte 3 de 4): sincronização com o servidor de casa (/api/progresso) e com o claude.ai
   (capacidade db, doc progresso/mariana). Ver o cabeçalho de progresso.js.
   Outro jogador (save-e-mescla.md §12): /api/progresso/<login> e doc progresso/<login>, e SÓ num servidor que
   anuncia vários jogadores (header X-Reino-Jogadores: 1). O servidor antigo grava tudo na linha 'mariana':
   com ele, o save de quem não é a Mariana fica só no aparelho. */
(function () {
  var U = Reino.util, I = Reino._progresso, P = I.P, nuvem = I.nuvem;
  var EV = Reino.EVENTOS;
  var agora = I.agora, numeroOu = I.numeroOu, objeto = I.objeto, completar = I.completar, comCopia = I.comCopia, conteudo = I.conteudo;
  var trouxeAlgo = I.trouxeAlgo, gravarLocal = I.gravarLocal, vigiarSurpresa = I.vigiarSurpresa;

  /* ---------- sincronização com o claude.ai (capacidade db) ---------- */
  /* Vaivém com a versão ANTIGA (sem carimbos; docs/contratos/save-e-mescla.md §4.8). A antiga decide as escolhas e
     o pago pelo `atualizado` (com o relógio dela); esta, pelos carimbos. O doc que esta versão grava leva
     `versaoMescla` (o da antiga, não) e, se o estado daqui já foi decidido pela regra da antiga, `cedeu: true`:
     - doc limpo (`versaoMescla` sem `cedeu`): regra dos carimbos, e este aparelho fica limpo;
     - doc da antiga: este aparelho fica `cedeu` (o estado dela não segue os carimbos);
     - doc da antiga ou de quem cedeu, quando os carimbos mudam o resultado (a regra de antes daria outro): esta
       insiste UMA vez (`lutas` 1; 2 depois de ENVIAR a insistência, com `atualizado` acima do banco, para a antiga
       adotar); se o conflito voltar depois do envio, cede (`I.mesclarSemCarimbos`) e fica `cedeu`.
     Uma troca feita aqui (escolha ou "Já pago") zera `lutas` e `cedeu`. Com uma antiga aberta, cada aparelho novo
     insiste no máximo uma vez por troca e depois segue a regra dela (a de antes, que converge); sem antiga, o
     `cedeu` que o doc de antes da atualização deixou some no primeiro doc limpo, e a regra dos carimbos volta a valer.
     Conquistas não mudam com isso: só as escolhas e o pago. */
  var VERSAO_MESCLA = 2;
  /** @param {EstadoSave} remoto @param {any} dados o doc inteiro (`versaoMescla`, `cedeu`) */
  function juntarRemoto(remoto, dados) {
    var m = P.mesclar(I.estado, remoto), novo = !!dados && dados.versaoMescla >= VERSAO_MESCLA;
    if (novo && !dados.cedeu) { nuvem.cedeu = false; return m; }
    if (!novo) nuvem.cedeu = true;
    var velho = I.mesclarSemCarimbos(I.estado, remoto);
    if (conteudo(completar(U.copia(m))) === conteudo(completar(U.copia(velho)))) return m;
    if (nuvem.lutas >= 2) { nuvem.cedeu = true; return velho; }
    nuvem.lutas = 1;
    return m;
  }
  // `atualizado` do que volta ao banco: acima do que veio (relógio da antiga adiantado não faz ela ficar com o dela)
  /** @param {EstadoSave} remoto */
  function novoAtualizado(remoto) { return Math.max(agora(), numeroOu(remoto.atualizado, 0) + 1); }

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
    // sem nuvem (ou ela foi revogada no meio): quem esperava o envio (P.enviarAgora) não espera à toa
    if (!nuvem.ok || !nuvem.ref) { esperando.splice(0).forEach(function (f) { f(); }); return; }
    if (nuvem.gravando) { nuvem.pendente = true; return; }
    nuvem.gravando = true;
    var falhou = false;
    // sem campo `undefined` no doc (um banco pode recusar); a insistência contra a antiga conta depois de enviada
    var doc = { estado: U.copia(I.estado), atualizado: I.estado.atualizado, versaoMescla: VERSAO_MESCLA };
    if (nuvem.cedeu) doc.cedeu = true;
    if (nuvem.lutas === 1) nuvem.lutas = 2;
    comLimite(nuvem.ref.set(doc), limiteRede())
      .then(function () { nuvem.status = 'sincronizado'; U.emit(EV.NUVEM, nuvem.status); })
      .catch(function (e) {
        nuvem.status = 'erro'; U.emit(EV.NUVEM, nuvem.status);
        if (e && (e.code === 'revoked' || e.code === 'not_granted' || e.code === 'invalid_argument')) nuvem.ok = false;
        else falhou = true;
      })
      .then(function () {
        nuvem.gravando = false;
        // alguém espera o envio terminar (P.enviarAgora): o que ficou pendente sai já, sem os 1,8 s
        if (nuvem.pendente && esperando.length) { nuvem.pendente = false; enviarNuvem(); return; }
        if (nuvem.pendente) { nuvem.pendente = false; agendarNuvem(); }
        else if (falhou && nuvem.ok) { clearTimeout(nuvem.timer); nuvem.timer = setTimeout(enviarNuvem, novaTentativa()); }
        esperando.splice(0).forEach(function (f) { f(); });
      });
  }
  /* Envia já o estado de agora e cumpre quando o banco respondeu (ou deu erro): antes de recarregar a página
     (trocar de jogador), senão o envio atrasado de 1,8 s se perdia. Sem nuvem, cumpre na hora. */
  /** @type {Array<() => void>} */
  var esperando = [];
  P.enviarAgora = function () {
    if (!nuvem.ok || !nuvem.ref) return Promise.resolve();
    return new Promise(function (ok) {
      esperando.push(ok);
      clearTimeout(nuvem.timer);
      if (nuvem.gravando) nuvem.pendente = true; else enviarNuvem();
    });
  };
  /* no servidor de casa (servidor/servidor.js) o mesmo doc fica em /api/progresso;
     este adaptador imita o doc da capacidade db (get, set, onSnapshot) */
  // fetch que desiste (e cancela a conexão) depois do limite de rede
  function buscar(url, opcoes) {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var t = ctl ? setTimeout(function () { ctl.abort(); }, limiteRede()) : 0;
    return fetch(url, ctl ? Object.assign({ signal: ctl.signal }, opcoes) : opcoes)
      .then(function (r) { clearTimeout(t); return r; }, function (e) { clearTimeout(t); throw e; });
  }
  // endereço do doc do jogador no servidor de casa: a Mariana em api/progresso (igual ao de sempre), os outros em
  // api/progresso/<login> (nunca no da Mariana)
  function urlDoJogador() {
    if (I.jogador === 'mariana') return 'api/progresso';
    if (!/^[a-z0-9_-]{2,20}$/.test(I.jogador)) throw new Error('jogador inválido');
    return 'api/progresso/' + I.jogador;
  }
  /** @returns {DocProgresso} */
  function docDoServidor() {
    var url = urlDoJogador();
    function ler() {
      return buscar(url, { cache: 'no-store' }).then(function (r) {
        if (r.status === 404) return null;
        if (!r.ok) throw new Error('servidor ' + r.status);
        return r.json();
      });
    }
    function snap(d) { return { exists: !!d, data: function () { return d; }, metadata: { hasPendingWrites: false } }; }
    return {
      get: function () { return ler().then(snap); },
      set: function (d) {
        return buscar(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
          .then(function (r) { if (!r.ok) throw new Error('servidor ' + r.status); });
      },
      onSnapshot: function (ok, erro) {
        function conferir() { ler().then(function (d) { if (d) ok(snap(d)); }, erro); }
        setInterval(conferir, 20000);
        document.addEventListener('visibilitychange', function () { if (!document.hidden) conferir(); });
      },
    };
  }
  // sem resposta (rede fora) é falha, não "sem servidor": o jogo espera e oferece tentar de novo.
  // Outro jogador só sincroniza se o servidor sabe vários jogadores (X-Reino-Jogadores: 1); senão, só no aparelho
  function temServidor() {
    return fetch('api/progresso', { method: 'HEAD', cache: 'no-store' })
      .then(function (r) {
        var sim = r.headers.get('X-Reino') === '1';
        Reino.ambiente.marcarServidorCasa(sim);
        return sim && (I.jogador === 'mariana' || r.headers.get('X-Reino-Jogadores') === '1');
      });
  }
  /* A conta de quem não é a Mariana existe no banco com a mesma senha? (conta criada só no aparelho, quando o
     servidor ainda era o antigo, é criada agora). Senha diferente = é de outra pessoa com o mesmo login: este
     save fica só no aparelho (nunca junta o progresso de duas pessoas). */
  /** @param {any} db @returns {Promise<boolean>} */
  function conferirConta(db) {
    if (I.jogador === 'mariana') return Promise.resolve(true);
    var login = I.jogador, senha = I.senha || '';
    if (db.doc === docDoServidor) {
      var post = function (url) {
        return buscar(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: login, senha: senha }) });
      };
      return post('api/jogadores/entrar').then(function (r) {
        if (r.status === 200) return true;
        if (r.status === 403 || !senha) return false;
        if (r.status !== 404) throw new Error('servidor ' + r.status);
        return post('api/jogadores').then(function (c) { return c.status === 201; });
      });
    }
    var conta = db.doc('jogadores/' + login);
    return conta.get().then(function (s) {
      if (s.exists) { var d = s.data(); return !!d && d.senha === senha; }
      if (!senha) return false;
      return conta.set({ login: login, senha: senha, criado: agora() }).then(function () { return true; });
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
      // a Mariana segue direto, como sempre; outro jogador, só com a conta conferida (conferirConta)
      if (I.jogador !== 'mariana') return conferirConta(db).then(function (ok) { if (ok) return comBanco(db); });
      return comBanco(db);
    });
    /** @param {any} db */
    function comBanco(db) {
      var ref = db.doc('progresso/' + I.jogador);   // a Mariana: 'progresso/mariana', como sempre
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
          I.estado = completar(comCopia(emBranco ? U.copia(guardado) : juntarRemoto(guardado, snap.data())));
          P.conferirPersistencia();
          // este aparelho tinha algo que o banco não tem: carimbo novo, para os outros aparelhos
          // não ignorarem o envio abaixo como "já visto" (mesmo `atualizado`)
          if (trouxeAlgo(I.estado, guardado)) I.estado.atualizado = novoAtualizado(guardado);
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
          I.estado = completar(comCopia(juntarRemoto(remoto, s.data())));
          // a junção trouxe algo que o banco não tem: devolve ao banco com carimbo novo
          if (P.conferirPersistencia().length || trouxeAlgo(I.estado, remoto)) { I.estado.atualizado = novoAtualizado(remoto); agendarNuvem(); }
          gravarLocal();
          vigiarSurpresa();
          U.emit(EV.PROGRESSO, I.estado);
          U.emit(EV.PROGRESSO_REMOTO, I.estado);
        }, function () { nuvem.status = 'local'; U.emit(EV.NUVEM, nuvem.status); });
      });
    }
    return comLimite(pronto, 12000).catch(function (e) {
      if (minha === tentativa) tentativa++;
      throw e;
    });
  };
  P.statusNuvem = function () { return nuvem.ok ? nuvem.status : 'local'; };

  // para as outras partes
  I.agendarNuvem = agendarNuvem;
})();
