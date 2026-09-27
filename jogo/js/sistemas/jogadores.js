/* Jogadores (docs/contratos/save-e-mescla.md §12): quem está jogando, as contas (login e senha em texto, SEM
   segurança, como o Leandro pediu) e o perfil (nome e sexo) no save.
   - A Mariana é o jogador 'mariana': o save de sempre (chaveSave 'mariana-reino-v1', doc progresso/mariana, linha
     'mariana' do banco). Login reservado. A conta dela mora no banco como as outras (servidor de casa: linha
     'mariana' da tabela jogadores, semeada pelo servidor; claude.ai: doc jogadores/mariana, criado pelo jogo com
     `config.jogadores.senhaMariana` se faltar); sem banco, confere com `senhaMariana`. O aparelho que tem o save dela
     (ou a lembra) entra direto; os outros pedem a senha. "Sair" marca SAIU e o próximo carregamento pede login.
   - Outro jogador: 'reino-v1-<login>' no aparelho, progresso/<login> no claude.ai, /api/progresso/<login> no servidor
     de casa (só no servidor que anuncia vários jogadores: sistemas/progresso-nuvem.js).
   - Neste aparelho: 'reino-jogador-atual' (o login lembrado) e 'reino-jogadores' ({ login: { senha, criado } }, as
     contas lembradas; conta criada sem servidor mora só aqui). Contas no banco: /api/jogadores (servidor de casa) ou
     docs jogadores/<login> (claude.ai).
   - O jogador é escolhido ANTES do P.carregar (motor/main.js) e não muda com o jogo aberto: trocar grava e recarrega.
   A tela "Quem vai jogar?" fica em ui/jogadores.js.
   node: true: nada de DOM nem localStorage no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino;
  var MARIANA = 'mariana';
  var CHAVE_ATUAL = 'reino-jogador-atual';
  var CHAVE_CONTAS = 'reino-jogadores';
  var SAIU = ':saiu';   // em CHAVE_ATUAL depois de "Sair" (nunca é login: tem ':'); o próximo carregamento pede login
  function cfg() { return R.config.jogadores || { loginMin: 2, loginMax: 20, senhaMin: 3, senhaMax: 30 }; }
  function P() { return R.Progresso; }
  function objeto(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
  function agora() { return Date.now(); }

  /* ================= NO SAVE: perfil ================= */
  // perfil: { nome, sexo: 'menina' | 'menino', em } — vale o de `em` maior (definirPerfil carimba); Novo ciclo mantém.
  // Padrão: a Mariana é "Mariana", menina; outro jogador começa sem nome (perfil() mostra o login). em 0 = nunca definido.
  function perfilPadrao() { return { nome: P().jogador() === MARIANA ? 'Mariana' : '', sexo: 'menina', em: 0 }; }
  /** @param {any} v */
  function limparPerfil(v) {
    if (!objeto(v)) return undefined;
    var em = typeof v.em === 'number' && isFinite(v.em) && v.em >= 0 ? v.em : 0;
    return { nome: typeof v.nome === 'string' ? v.nome.trim().slice(0, 20) : '', sexo: v.sexo === 'menino' ? 'menino' : 'menina', em: em };
  }
  P().registrarCampo('perfil', {
    padrao: perfilPadrao,
    mesclar: function (x, y) { return R.util.copia(y.em > x.em ? y : x); },   // empate: a base (o lado mais recente)
    limpar: limparPerfil,
    novoCiclo: 'mantem',
    exemplos: [{ nome: 'Mariana', sexo: 'menina', em: 10 }, { nome: 'Mari', sexo: 'menina', em: 20 }],
  });

  /* ================= LOGIN ================= */
  // minúsculas, números, - e _ (o servidor de casa confere 2 a 20); nunca um nome de Object.prototype (vira chave)
  function valido(login) {
    var c = cfg(), min = Math.max(2, c.loginMin || 2), max = Math.min(20, c.loginMax || 20);
    return typeof login === 'string' && new RegExp('^[a-z0-9_-]{' + min + ',' + max + '}$').test(login) &&
      !(login in Object.prototype) && login !== 'prototype';
  }
  function senhaValida(s) { var c = cfg(); return typeof s === 'string' && s.length >= (c.senhaMin || 1) && s.length <= (c.senhaMax || 30); }

  /* ================= NESTE APARELHO ================= */
  function lerTexto(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  /** @returns {Object<string, { senha: string, criado: number }>} só contas com login válido */
  function contasLocais() {
    var r = {}, c = null;
    try { c = JSON.parse(lerTexto(CHAVE_CONTAS) || 'null'); } catch (e) { c = null; }
    if (objeto(c)) Object.keys(c).forEach(function (k) {
      if (valido(k) && k !== MARIANA && Object.prototype.hasOwnProperty.call(c, k) && objeto(c[k]) && typeof c[k].senha === 'string') r[k] = { senha: c[k].senha, criado: +c[k].criado || 0 };
    });
    return r;
  }
  function lembrar(login, senha) {
    try {
      if (login !== MARIANA) {
        var c = contasLocais();
        c[login] = { senha: senha, criado: (c[login] && c[login].criado) || agora() };
        localStorage.setItem(CHAVE_CONTAS, JSON.stringify(c));
      }
      localStorage.setItem(CHAVE_ATUAL, login);
    } catch (e) { /* sem armazenamento: vale só nesta carga */ }
  }

  /* ================= NO BANCO (servidor de casa ou claude.ai) ================= */
  function limite() { return R.config.limiteRedeMs || 15000; }
  /** @template T @param {Promise<T>} p @returns {Promise<T>} rejeita sem resposta no limite de rede */
  function comLimite(p) {
    return new Promise(function (ok, falha) {
      var t = setTimeout(function () { falha(new Error('sem resposta')); }, limite());
      p.then(function (v) { clearTimeout(t); ok(v); }, function (e) { clearTimeout(t); falha(e); });
    });
  }
  // onde ficam as contas: { tipo: 'servidor' } (só o servidor novo, com X-Reino-Jogadores), { tipo: 'db', db } ou null
  function fonte() {
    var amb = R.ambiente;
    if (amb.artifact()) return comLimite(window.claude.use('db')).then(function (db) { return db ? { tipo: 'db', db: db } : null; }, function () { return null; });
    if (amb.http() || /^https:$/.test(location.protocol)) {
      return comLimite(fetch('api/progresso', { method: 'HEAD', cache: 'no-store' })).then(function (r) {
        return r.headers.get('X-Reino') === '1' && r.headers.get('X-Reino-Jogadores') === '1' ? { tipo: 'servidor' } : null;
      }, function () { return null; });
    }
    return Promise.resolve(null);
  }
  function postar(url, corpo) {
    return comLimite(fetch(url, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) }));
  }
  function logins(lista) { return (Array.isArray(lista) ? lista : []).filter(function (l) { return valido(l); }); }

  /* ================= API ================= */
  var J = R.Jogadores = {};
  J.MARIANA = MARIANA;
  J.valido = valido;
  J.senhaValida = senhaValida;
  J.atual = function () { return P() && P().jogador ? P().jogador() : MARIANA; };
  J.ehMariana = function () { return J.atual() === MARIANA; };
  // nome para mostrar: o do perfil ou, sem nome, o login com a inicial maiúscula
  J.nomeDoLogin = function (login) { return login.charAt(0).toUpperCase() + login.slice(1); };
  J.perfil = function () {
    var e = P().estado(), p = limparPerfil(e && e.perfil) || perfilPadrao();
    return { nome: p.nome || J.nomeDoLogin(J.atual()), sexo: p.sexo };
  };
  J.definirPerfil = function (o) {
    var e = P().estado();
    if (!e) return;
    var antes = limparPerfil(e.perfil) || perfilPadrao();
    e.perfil = { nome: typeof o.nome === 'string' ? o.nome.trim().slice(0, 20) : antes.nome, sexo: o.sexo === 'menino' ? 'menino' : o.sexo === 'menina' ? 'menina' : antes.sexo,
      em: Math.max(agora(), antes.em + 1) };
    P().salvar();
    R.util.emit(R.EVENTOS.PERFIL, J.perfil());
  };

  /* Quem joga sem perguntar nada (null = mostrar "Quem vai jogar?"):
     modo congelado (testes) = a Mariana, sem ler nada; o login lembrado neste aparelho; aparelho com o save da
     Mariana e sem jogador lembrado = a Mariana; sem armazenamento = a Mariana (como sempre foi). Aparelho novo = null. */
  J.decidirSemTela = function () {
    if (R.congelado) return MARIANA;
    var lembrado;
    try { lembrado = localStorage.getItem(CHAVE_ATUAL); } catch (e) { return MARIANA; }
    if (lembrado === MARIANA) return MARIANA;
    // lembrado que este aparelho não conhece mais: pergunta (nunca cai no save da Mariana por engano)
    if (lembrado) return valido(lembrado) && contasLocais()[lembrado] ? lembrado : null;
    return lerTexto(R.config.chaveSave) ? MARIANA : null;
  };
  // escolhe o jogador deste carregamento (antes do P.carregar)
  J.usar = function (login) {
    var c = contasLocais()[login];
    P().usarJogador(login, login === MARIANA ? null : c ? c.senha : null);
  };
  // a Mariana é lembrada no aparelho que tem o save dela ou que a escolheu por último (só leitura)
  function marianaAqui() {
    try { var a = localStorage.getItem(CHAVE_ATUAL); return a === MARIANA || (a !== SAIU && !!lerTexto(R.config.chaveSave)); } catch (e) { return true; }
  }
  // senha da Mariana: sem `senhaMariana` no config ela entra direto, como antes
  function senhaMarianaCerta(senha) { var s = cfg().senhaMariana; return !s || senha === s; }
  J.lembrado = function (login) { return login === MARIANA ? marianaAqui() : !!contasLocais()[login]; };
  // os lembrados neste aparelho (a Mariana sempre, primeiro)
  J.listarLocais = function () { return [MARIANA].concat(Object.keys(contasLocais()).sort()); };
  // os lembrados mais os do banco (sem banco ou sem resposta: só os daqui)
  J.listar = function () {
    return fonte().then(function (f) {
      if (!f) return [];
      if (f.tipo === 'servidor') return comLimite(fetch('api/jogadores', { cache: 'no-store' })).then(function (r) { return r.ok ? r.json() : []; });
      return comLimite(f.db.collection('jogadores').get()).then(function (q) { return q.docs.map(function (d) { return d.id; }); });
    }).catch(function () { return []; }).then(function (remotos) {
      var todos = J.listarLocais();
      logins(remotos).sort().forEach(function (l) { if (todos.indexOf(l) < 0) todos.push(l); });
      return todos;
    });
  };

  /* Cria a conta: { ok: true } ou { erro: 'login' | 'existe' | 'senha' | 'rede' }. Com banco, a conta nasce lá
     (o login repetido é recusado por ele); sem banco, só neste aparelho. Criada, fica lembrada e é a atual. */
  J.criar = function (login, senha) {
    if (!valido(login)) return Promise.resolve({ erro: 'login' });
    if (login === MARIANA || contasLocais()[login]) return Promise.resolve({ erro: 'existe' });
    if (!senhaValida(senha)) return Promise.resolve({ erro: 'senha' });
    return fonte().then(function (f) {
      if (!f) return { ok: true };
      if (f.tipo === 'servidor') {
        return postar('api/jogadores', { login: login, senha: senha }).then(function (r) {
          return r.status === 201 ? { ok: true } : r.status === 409 ? { erro: 'existe' } : { erro: 'rede' };
        });
      }
      var doc = f.db.doc('jogadores/' + login);
      return comLimite(doc.get()).then(function (s) {
        if (s.exists) return { erro: 'existe' };
        return comLimite(doc.set({ login: login, senha: senha, criado: agora() })).then(function () { return { ok: true }; });
      });
    }).catch(function () { return { erro: 'rede' }; }).then(function (r) {
      if (r.ok) lembrar(login, senha);
      return r;
    });
  };

  /* Entra: { ok: true } ou { erro: 'senha' | 'naoExiste' | 'rede' }. Quem este aparelho lembra entra sem senha (senha
     undefined); a Mariana, fora do aparelho dela, confere com `senhaMariana`; os outros conferem no banco e, sem ele (ou
     conta só deste aparelho), aqui. */
  J.entrar = function (login, senha) {
    var local = contasLocais()[login];
    function aqui() { return !local ? { erro: 'naoExiste' } : local.senha === senha ? { ok: true } : { erro: 'senha' }; }
    var r;
    if (login === MARIANA) r = senha === undefined ? Promise.resolve(marianaAqui() ? { ok: true } : { erro: 'senha' }) : entrarMariana(senha);
    else if (local && senha === undefined) r = Promise.resolve({ ok: true });
    else if (!valido(login)) r = Promise.resolve({ erro: 'naoExiste' });
    else {
      r = fonte().then(function (f) {
        if (!f) return aqui();
        if (f.tipo === 'servidor') {
          return postar('api/jogadores/entrar', { login: login, senha: String(senha || '') }).then(function (x) {
            return x.status === 200 ? { ok: true } : x.status === 403 ? { erro: 'senha' } : x.status === 404 ? aqui() : { erro: 'rede' };
          });
        }
        return comLimite(f.db.doc('jogadores/' + login).get()).then(function (s) {
          if (!s.exists) return aqui();
          var d = s.data();
          return d && d.senha === senha ? { ok: true } : { erro: 'senha' };
        });
      }).catch(function () { return { erro: 'rede' }; });
    }
    return r.then(function (x) {
      if (x.ok) lembrar(login, login === MARIANA ? '' : senha === undefined ? local.senha : senha);
      return x;
    });
  };

  /* A senha da Mariana, conferida no banco: servidor de casa (/api/jogadores/entrar, a linha dela), claude.ai (doc
     jogadores/mariana; sem o doc, o jogo o cria com `senhaMariana`, nunca por cima de um que exista) ou, sem banco
     (arquivo, servidor antigo), `senhaMariana`. Nada disso toca no progresso dela. */
  function entrarMariana(senha) {
    var certo = { ok: true }, errado = { erro: 'senha' };
    return fonte().then(function (f) {
      if (!f) return senhaMarianaCerta(senha) ? certo : errado;
      if (f.tipo === 'servidor') {
        return postar('api/jogadores/entrar', { login: MARIANA, senha: String(senha) }).then(function (x) {
          return x.status === 200 ? certo : x.status === 403 ? errado : { erro: 'rede' };
        });
      }
      var doc = f.db.doc('jogadores/' + MARIANA);
      return comLimite(doc.get()).then(function (s) {
        if (s.exists) { var d = s.data(); return d && d.senha === senha ? certo : errado; }
        var padrao = cfg().senhaMariana;
        if (!padrao) return certo;
        return comLimite(doc.set({ login: MARIANA, senha: padrao, criado: agora() })).then(function () { return senha === padrao ? certo : errado; });
      });
    }).catch(function () { return { erro: 'rede' }; });
  }

  /* Troca de jogador com o jogo aberto: grava o de agora no aparelho, ENVIA já para o banco e espera a resposta
     (no máximo o limite de rede ou 5 s; o envio normal sai 1,8 s depois e o reload o perderia), lembra o novo e
     recarrega (o save é lido do zero). Cumpre com false se já é ele. */
  function guardarERecarregar(marca) {
    var e = P().estado();
    if (e && e.comecou) P().salvar(true);
    var espera = new Promise(function (ok) { setTimeout(ok, Math.min(limite(), 5000)); });
    return Promise.race([P().enviarAgora().catch(function () {}), espera]).then(function () {
      try { localStorage.setItem(CHAVE_ATUAL, marca); } catch (err) { /* sem armazenamento */ }
      location.reload();
      return true;
    });
  }
  J.trocarPara = function (login) {
    if (login === J.atual()) return Promise.resolve(false);
    return guardarERecarregar(login);
  };
  // "Sair": guarda, marca SAIU (o save fica onde está) e recarrega; o próximo carregamento mostra o login
  J.sair = function () { return guardarERecarregar(SAIU); };
})();
