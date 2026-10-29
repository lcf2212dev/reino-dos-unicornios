/* Vozes naturais: toca áudios gravados antes (ferramentas/vozes/gerar-vozes.py).
   Cada fala é achada pelo texto que aparece na tela. Fala sem áudio fica em silêncio. */
(function () {
  var V = {};
  var clips = {};        // chave -> base64 do mp3
  // AudioBuffer já decodificado das falas ouvidas por último. O PCM pesa ~188 KB por segundo
  // de fala e fica fora do heap do JS: sem teto, uma sessão longa passava de 70 MB (e o iPad
  // derruba a aba). Guardamos até TETO_BUFFERS bytes; a fala usada há mais tempo sai primeiro
  // e, se voltar, é decodificada de novo do base64, que continua em `clips`.
  // Duas filas: as falas ouvidas uma vez só (curiosidades, perguntas) saem antes das que se
  // repetem (acertos, erros, avisos do Claude), que ficam com até TETO_REPETIDAS para elas.
  var buffers = { novas: new Map(), repetidas: new Map() }; // chave -> AudioBuffer (a mais recente no fim)
  var bytesBuffers = { novas: 0, repetidas: 0 };
  var decodificando = {};    // chave -> Promise (a mesma fala pedida duas vezes decodifica uma vez)
  var adiantadas = {};       // chave -> true: decodificada antes de tocar (próxima página)
  var TETO_BUFFERS = 24 * 1048576, TETO_REPETIDAS = 14 * 1048576;
  var pacotes = {};      // nome -> Promise do carregamento
  var carregados = {};
  var tocando = null, vez = 0;
  V.faltando = [];       // para os testes: falas pedidas que não têm áudio

  // mesmas regras das ferramentas (ferramentas/vozes/listar-falas.js)
  V.normalizar = function (t) {
    return String(t)
      .replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, '')
      .replace(/[«»]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // separa os trechos «em inglês» (voz 'ingles') do resto (voz padrão).
  // Usada ao falar E ao gravar (Falas.todas), então as chaves batem.
  // Pedaço vazio ou só com pontuação/emoji não vira fala.
  V.dividir = function (texto, vozPadrao) {
    var s = String(texto == null ? '' : texto), out = [];
    function add(t, voz) {
      t = t.replace(/[«»]/g, '').trim();
      if (/[\p{L}\p{N}]/u.test(V.normalizar(t))) out.push({ texto: t, voz: voz });
    }
    // a personagem pode ter a sua própria voz para o inglês (campo `ingles` do perfil)
    var perfil = (Reino.config && Reino.config.vozes && Reino.config.vozes[vozPadrao]) || {};
    var vozIngles = perfil.ingles || 'ingles';
    var re = /«([^«»]*)»/g, ultimo = 0, m;
    while ((m = re.exec(s))) {
      add(s.slice(ultimo, m.index), vozPadrao);
      add(m[1], vozIngles);
      ultimo = re.lastIndex;
    }
    add(s.slice(ultimo), vozPadrao);
    return out;
  };
  V.chave = function (voz, texto) {
    var s = voz + '|' + V.normalizar(texto);
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8) + s.length.toString(36);
  };

  /* Pacotes na memória: o base64 de cada pacote fica em `clips` até o pacote sair. Sem teto, visitar Química,
     Observatório e Português passava de 50 MB de texto. Guardamos até V.tetoPacotes letras; o pacote usado há mais
     tempo sai primeiro (com a tag dele) e, se uma fala dele voltar, é pedido de novo pela tag de script (vem do
     cache HTTP ou do service worker; funciona em file://). Nunca saem: o `geral`, o do prédio da cena atual
     (Reino.Cena) e o que acabou de chegar. No modo congelado (testes) nada sai: o avancar do e2e conta a
     tag pelo endereço, e a mesma tag pedida de novo pareceria pronta antes da hora. */
  V.tetoPacotes = 32 * 1048576;
  var tags = {};         // nome -> <script> do pacote carregado
  var chavesDe = {};     // nome -> chaves do pacote carregado
  var bytesDe = {};      // nome -> letras de base64 do pacote carregado
  var usoDe = {};        // nome -> quando foi usado por último (contador)
  var donos = {};        // chave -> quantos pacotes carregados a têm
  var pacoteDe = {};     // chave -> um pacote que a tem (todo pacote já visto e os <matéria>-extra), para pedir de novo
  var usos = 0, ultimoInterior = null, indiceExtra = false;
  var ESPERA_PACOTE = 4000;   // fala de pacote que saiu (ou ainda não veio): espera ele voltar até aqui (um prazo por fala)

  V.registrar = function (nome, mapa) {
    if (carregados[nome]) return;
    var ks = Object.keys(mapa), bytes = 0;
    ks.forEach(function (k) { clips[k] = mapa[k]; donos[k] = (donos[k] || 0) + 1; pacoteDe[k] = nome; bytes += mapa[k].length; });
    chavesDe[nome] = ks; bytesDe[nome] = bytes; usoDe[nome] = ++usos;
    carregados[nome] = true;
    aparar(nome);
  };

  function predioAtual() {
    var c = Reino.Cena && Reino.Cena.atual ? Reino.Cena.atual() : null;
    return c && c.def ? c.def.pacote : null;
  }
  function aparar(novo) {
    if (Reino.congelado) return;
    var total = 0;
    Object.keys(bytesDe).forEach(function (n) { total += bytesDe[n]; });
    while (total > V.tetoPacotes) {
      var velho = null;
      Object.keys(bytesDe).forEach(function (n) {
        if (n === 'geral' || n === novo || n === predioAtual()) return;
        if (velho === null || usoDe[n] < usoDe[velho]) velho = n;
      });
      if (velho === null) break;
      total -= bytesDe[velho];
      descarregar(velho);
    }
  }
  function descarregar(nome) {
    chavesDe[nome].forEach(function (k) { if (--donos[k] <= 0) { delete donos[k]; delete clips[k]; } });
    delete chavesDe[nome]; delete bytesDe[nome]; delete usoDe[nome]; delete carregados[nome]; delete pacotes[nome];
    var s = tags[nome];
    delete tags[nome];
    if (s && s.parentNode) s.parentNode.removeChild(s);
  }
  // a fala usada conta como uso dos pacotes carregados que a têm
  function usarPacotes(chave) {
    var nome = pacoteDe[chave];
    if (nome && carregados[nome]) usoDe[nome] = ++usos;
  }

  /* Pacote que tem uma fala sem áudio na memória: um que já veio e saiu, ou um <matéria>-extra que ainda não veio
     (guia, nomes e apresentações das salas, pistas, frases dos unicórnios: Falas.todas, uma vez só, na 1ª falta). */
  function montarIndice() {
    indiceExtra = true;
    try {
      Reino.Falas.todas().forEach(function (f) {
        if (!/-extra$/.test(f.pacote)) return;
        var k = V.chave(f.voz, f.texto);
        if (!pacoteDe[k]) pacoteDe[k] = f.pacote;
      });
    } catch (e) { if (window.console) console.warn('[voz] índice dos pacotes:', e); }
  }
  function buscar(chave) {
    if (!pacoteDe[chave] && !indiceExtra && Reino.Falas && Reino.Falas.todas) montarIndice();
    var nome = pacoteDe[chave];
    return nome && !carregados[nome] ? nome : null;
  }
  function temOuVem(chave) { return !!clips[chave] || !!buscar(chave); }

  // <matéria>-extra das matérias destes unicórnios (a frase de cada um está lá); sem ids, os que ela já tem
  function extrasDosUnicornios(ids) {
    var est = Reino.Progresso && Reino.Progresso.estado && Reino.Progresso.estado();
    var tem = {};
    (ids || Object.keys((est && est.unis) || {})).forEach(function (id) { tem[id] = true; });
    return (Reino.materias || []).filter(function (m) {
      return (m.unicornios || []).some(function (u) { return tem[u.id]; });
    }).map(function (m) { return m.id + '-extra'; });
  }
  // depois do mapa, ocioso (motor/main.js): o <matéria>-extra das matérias em uso, para a 1ª visita falar na hora
  V.adiantarExtras = function () {
    return V.carregarVarios((Reino.materias || []).filter(function (m) { return !m.arquivada; }).map(function (m) { return m.id + '-extra'; }));
  };
  // pedido de quem mostra unicórnios que falam (Estábulo, ovo chocando): traz os pacotes antes da fala
  V.carregarUnicornios = function (ids) { return V.carregarVarios(extrasDosUnicornios(ids)); };

  // o prédio de uma matéria (NPC ou objeto com acao.materia de matéria em uso): o <matéria>-extra vem logo depois
  // do pacote do prédio, para o guia e as salas falarem sem esperar; com baia de unicórnio, os das frases deles
  function extrasDoPredio(nome) {
    var ms = {};
    (Reino.interiores || []).forEach(function (def) {
      if (def.pacote !== nome) return;
      /** @param {any} o */
      function ver(o) {
        var m = o && o.acao && o.acao.materia, mat = m && Reino.materia ? Reino.materia(m) : null;
        if (mat && !mat.arquivada) ms[m + '-extra'] = true;
        if (o && o.acao && o.acao.tipo === 'unicornio') extrasDosUnicornios().forEach(function (p) { ms[p] = true; });
      }
      (def.npcs || []).forEach(ver);
      (def.objetos || []).forEach(ver);
    });
    return Object.keys(ms);
  }

  // Pacote que falha (Wi-Fi caiu no meio) não fica perdido: a tag sai, a promessa é esquecida
  // e ele é pedido de novo sozinho, com espera crescente (ESPERAS), e também na próxima fala
  // (no máximo a cada ESPERA_NA_FALA). A fala que já passou muda não toca atrasada.
  var falhas = {};           // nome -> { vezes, quando, relogio }
  var ESPERAS = [3000, 10000, 30000], ESPERA_NA_FALA = 5000;
  function falhou(nome, s) {
    if (s.parentNode) s.parentNode.removeChild(s);
    delete pacotes[nome];
    var f = falhas[nome] || (falhas[nome] = { vezes: 0, relogio: null });
    f.quando = Date.now();
    if (!f.relogio && f.vezes < ESPERAS.length) {
      f.relogio = setTimeout(function () { f.relogio = null; f.vezes++; V.carregar(nome); }, ESPERAS[f.vezes]);
    }
  }
  function tentarDeNovo(agora) {
    Object.keys(falhas).forEach(function (nome) {
      var f = falhas[nome];
      if (pacotes[nome] || (!agora && Date.now() - f.quando < ESPERA_NA_FALA)) return;
      clearTimeout(f.relogio); f.relogio = null;
      V.carregar(nome);
    });
  }
  // a rede voltou (o aparelho avisa): pede na hora os pacotes que falharam
  if (window.addEventListener) window.addEventListener('online', function () { tentarDeNovo(true); });

  V.carregar = function (nome) {
    if (/^interior-/.test(nome) && ultimoInterior !== nome) {
      ultimoInterior = nome;
      var extras = extrasDoPredio(nome);
      if (extras.length) { V.carregar(nome); V.carregarVarios(extras); }   // juntos, não em fila
    }
    if (carregados[nome]) { usoDe[nome] = ++usos; return Promise.resolve(); }
    if (pacotes[nome]) return pacotes[nome];
    pacotes[nome] = new Promise(function (resolver) {
      var s = document.createElement('script');
      // repetição: endereço novo, para não reaproveitar uma resposta ruim guardada
      s.src = 'js/voz/' + nome + '.js' + (falhas[nome] ? '?tentativa=' + Date.now() : '');
      s.async = true;
      s.onload = function () {
        if (carregados[nome]) {
          tags[nome] = s;
          if (falhas[nome]) { clearTimeout(falhas[nome].relogio); delete falhas[nome]; }
        } else falhou(nome, s);   // chegou pela metade: não registrou nada
        resolver();
      };
      s.onerror = function () { falhou(nome, s); resolver(); };
      document.head.appendChild(s);
    });
    return pacotes[nome];
  };
  V.carregarVarios = function (nomes) { return Promise.all(nomes.map(V.carregar)); };
  // a sala (o que quem chama espera) e, por trás, o <matéria>-extra (nome e apresentação da sala, pistas do livro),
  // que a fala espera sozinha quando precisa (V.falar)
  V.carregarSala = function (materia, sala) {
    var p = V.carregar(materia.id + '-' + sala.id);
    V.carregar(materia.id + '-extra');
    return p;
  };
  V.carregarMateria = function (materia) {
    var p = V.carregarVarios(materia.salas.map(function (s) { return materia.id + '-' + s.id; }));
    V.carregar(materia.id + '-extra');
    return p;
  };

  /** @returns {Partial<Ajustes>} */
  function ajustes() { return (Reino.Progresso && Reino.Progresso.estado() && Reino.Progresso.estado().ajustes) || {}; }

  function tamanho(buf) { return buf.length * buf.numberOfChannels * 4; }
  function por(fila, chave, buf) { buffers[fila].set(chave, buf); bytesBuffers[fila] += tamanho(buf); }
  function tirar(fila, chave) {
    var buf = buffers[fila].get(chave);
    buffers[fila].delete(chave); bytesBuffers[fila] -= tamanho(buf);
    return buf;
  }
  function maisVelha(fila) { return buffers[fila].keys().next().value; }
  function descartar(fila, chave) { tirar(fila, chave); delete adiantadas[chave]; }
  function guardar(chave, buf) {
    // as repetidas que passam do espaço delas voltam para a fila das novas
    while (bytesBuffers.repetidas > TETO_REPETIDAS && buffers.repetidas.size > 1) {
      var r = maisVelha('repetidas'); por('novas', r, tirar('repetidas', r));
    }
    por('novas', chave, buf);
    // descarta as usadas há mais tempo; a que acabou de chegar sempre fica
    while (bytesBuffers.novas + bytesBuffers.repetidas > TETO_BUFFERS) {
      var velha = maisVelha('novas');
      if (velha !== chave) descartar('novas', velha);
      else if (buffers.repetidas.size) descartar('repetidas', maisVelha('repetidas'));
      else break;
    }
  }
  // usada de novo: vai para o fim da fila das repetidas (é a última a ser descartada).
  // A decodificada antes da hora (próxima página) ainda não conta como repetida.
  function usar(chave) {
    var fila = buffers.repetidas.has(chave) ? 'repetidas' : buffers.novas.has(chave) ? 'novas' : null;
    if (!fila) return null;
    var buf = tirar(fila, chave);
    por(adiantadas[chave] ? fila : 'repetidas', chave, buf);
    delete adiantadas[chave];
    return buf;
  }

  function decodificar(ac, chave) {
    var pronto = usar(chave);
    if (pronto) return Promise.resolve(pronto);
    if (decodificando[chave]) return decodificando[chave];
    var b64 = clips[chave];
    if (!b64) return Promise.resolve(null);
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    decodificando[chave] = new Promise(function (ok) {
      function fim(buf) { delete decodificando[chave]; if (buf) guardar(chave, buf); else delete adiantadas[chave]; ok(buf); }
      try {
        ac.decodeAudioData(bytes.buffer, function (buf) { fim(buf || null); }, function () { fim(null); });
      } catch (e) { fim(null); }
    });
    return decodificando[chave];
  }

  // adianta a decodificação da próxima fala de uma sequência enquanto a atual toca
  function adiantar(ac, seg) {
    if (!seg) return;
    var chave = V.chave(seg.voz, seg.texto);
    if (!clips[chave] || buffers.novas.has(chave) || buffers.repetidas.has(chave) || decodificando[chave]) return;
    adiantadas[chave] = true;
    decodificar(ac, chave);
  }

  // para os testes: quanto áudio decodificado está guardado agora
  V.memoria = function () {
    return { falas: buffers.novas.size + buffers.repetidas.size, repetidas: buffers.repetidas.size,
      bytes: bytesBuffers.novas + bytesBuffers.repetidas };
  };

  // para os testes: os pacotes guardados agora e quantas letras de base64 eles somam
  V.memoriaPacotes = function () {
    var nomes = Object.keys(bytesDe).sort(), bytes = 0;
    nomes.forEach(function (n) { bytes += bytesDe[n]; });
    return { pacotes: nomes, bytes: bytes, falas: Object.keys(clips).length };
  };

  function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // segmentos: 'texto' | [ 'texto', {texto, voz}, ... ]; opcoes.voz: voz padrão
  V.falar = function (segmentos, opcoes) {
    opcoes = opcoes || {};
    V.calar();
    if (ajustes().voz === false) return Promise.resolve();
    tentarDeNovo();
    var lista = [];
    (Array.isArray(segmentos) ? segmentos : [segmentos]).filter(Boolean).forEach(function (s) {
      var voz = (typeof s === 'string' ? null : s.voz) || opcoes.voz || 'claude';
      lista = lista.concat(V.dividir(typeof s === 'string' ? s : s.texto, voz));
    });
    var ac = Reino.Som.contexto();
    if (!ac || !lista.length) return Promise.resolve();
    var minha = ++vez;
    // pede já os pacotes de todos os pedaços que faltam (cada um espera o seu só quando chega a vez)
    lista.forEach(function (seg) {
      var k = V.chave(seg.voz, seg.texto), falta = clips[k] ? null : buscar(k);
      if (falta) V.carregar(falta);
    });
    var seq = Promise.resolve(), prazo = null;   // um prazo só para os pacotes que esta fala espera
    lista.forEach(function (seg, i) {
      function tocar(chave) {
        if (!clips[chave]) {
          V.faltando.push(seg.voz + ': ' + V.normalizar(seg.texto));
          if (window.console && console.debug) console.debug('[voz] sem áudio:', seg.voz, seg.texto);
          return;
        }
        usarPacotes(chave);
        return decodificar(ac, chave).then(function (buf) {
          if (!buf || minha !== vez) return;
          return new Promise(function (fim) {
            var src = ac.createBufferSource();
            src.buffer = buf;
            src.connect(Reino.Som.saidaVoz());
            tocando = { src: src, fim: fim };
            Reino.Som.abaixarEfeitos(true);
            src.onended = function () { if (tocando && tocando.src === src) tocando = null; fim(); };
            src.start();
            adiantar(ac, lista[i + 1]);
          }).then(function () { if (i < lista.length - 1 && minha === vez) return esperar(250); });
        });
      }
      seq = seq.then(function () {
        if (minha !== vez) return;
        var chave = V.chave(seg.voz, seg.texto);
        // o pacote da fala saiu da memória (ou é um <matéria>-extra que ainda não veio): pede e espera um pouco
        var falta = clips[chave] ? null : buscar(chave);
        if (!falta) return tocar(chave);
        prazo = prazo || esperar(ESPERA_PACOTE);
        return Promise.race([V.carregar(falta), prazo]).then(function () { if (minha === vez) return tocar(chave); });
      });
    });
    return seq.then(function () { if (minha === vez) Reino.Som.abaixarEfeitos(false); });
  };

  V.calar = function () {
    vez++;
    if (tocando) {
      var t = tocando; tocando = null;
      try { t.src.onended = null; t.src.stop(); } catch (e) {}
      t.fim();
    }
    if (Reino.Som && Reino.Som.abaixarEfeitos) Reino.Som.abaixarEfeitos(false);
  };

  V.falando = function () { return !!tocando; };
  // tem o áudio na memória agora (o de um pacote que ainda vai ser pedido não conta: pode não chegar a tempo)
  V.tem = function (voz, texto) { return V.dividir(texto, voz).every(function (p) { return !!clips[V.chave(p.voz, p.texto)]; }); };

  /* Fala e diz se vale esperar por ela (UI.esperarFala trava os botões até o fim).
     → { espera: bool, fim: Promise }. espera = false (e fim já resolvida) quando nada vai soar:
     voz desligada, sem AudioContext ou com ele parado (autoplay bloqueado: `onended` nunca viria),
     nenhum pedaço gravado (ou o pacote ainda não chegou). Com espera, `fim` resolve no fim da fala,
     quando outra fala a corta, ou no teto (config.esperaFala: tempo estimado pelo tamanho do texto),
     para ela nunca ficar presa se o áudio travar. */
  V.falarEsperando = function (segmentos, opcoes) {
    var cfg = (Reino.config && Reino.config.esperaFala) || {};
    var lista = [];
    (Array.isArray(segmentos) ? segmentos : [segmentos]).filter(Boolean).forEach(function (s) {
      var voz = (typeof s === 'string' ? null : s.voz) || (opcoes && opcoes.voz) || 'claude';
      lista = lista.concat(V.dividir(typeof s === 'string' ? s : s.texto, voz));
    });
    var fala = V.falar(segmentos, opcoes);
    var ac = Reino.Som && Reino.Som.contexto ? Reino.Som.contexto() : null;
    var gravados = lista.filter(function (p) { return temOuVem(V.chave(p.voz, p.texto)); });
    if (ajustes().voz === false || !ac || ac.state !== 'running' || !gravados.length) {
      return { espera: false, fim: Promise.resolve() };
    }
    var letras = gravados.reduce(function (n, p) { return n + V.normalizar(p.texto).length; }, 0);
    var tetoMs = Math.min((cfg.maxS || 30) * 1000,
      Math.max((cfg.minS || 2) * 1000, letras * (cfg.msPorLetra || 75) * (cfg.folga || 1.6) + gravados.length * 250));
    var teto = new Promise(function (r) { setTimeout(r, tetoMs); });
    return { espera: true, fim: Promise.race([fala, teto]) };
  };

  Reino.Voz = V;
})();
