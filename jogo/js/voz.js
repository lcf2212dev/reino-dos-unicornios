/* Vozes naturais: toca áudios gravados antes (ferramentas/gerar-vozes.py).
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

  // mesmas regras das ferramentas (ferramentas/listar-falas.js)
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

  V.registrar = function (nome, mapa) {
    Object.keys(mapa).forEach(function (k) { clips[k] = mapa[k]; });
    carregados[nome] = true;
  };

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
  window.addEventListener('online', function () { tentarDeNovo(true); });

  V.carregar = function (nome) {
    if (carregados[nome]) return Promise.resolve();
    if (pacotes[nome]) return pacotes[nome];
    pacotes[nome] = new Promise(function (resolver) {
      var s = document.createElement('script');
      // repetição: endereço novo, para não reaproveitar uma resposta ruim guardada
      s.src = 'js/voz/' + nome + '.js' + (falhas[nome] ? '?tentativa=' + Date.now() : '');
      s.async = true;
      s.onload = function () {
        if (carregados[nome]) {
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
  V.carregarSala = function (materia, sala) { return V.carregar(materia.id + '-' + sala.id); };
  V.carregarMateria = function (materia) {
    return V.carregarVarios(materia.salas.map(function (s) { return materia.id + '-' + s.id; }));
  };

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
    var seq = Promise.resolve();
    lista.forEach(function (seg, i) {
      seq = seq.then(function () {
        if (minha !== vez) return;
        var chave = V.chave(seg.voz, seg.texto);
        if (!clips[chave]) {
          V.faltando.push(seg.voz + ': ' + V.normalizar(seg.texto));
          if (window.console && console.debug) console.debug('[voz] sem áudio:', seg.voz, seg.texto);
          return;
        }
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
  V.tem = function (voz, texto) { return V.dividir(texto, voz).every(function (p) { return !!clips[V.chave(p.voz, p.texto)]; }); };

  Reino.Voz = V;
})();
