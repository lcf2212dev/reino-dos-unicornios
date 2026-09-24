/* Vozes naturais: toca áudios gravados antes (ferramentas/gerar-vozes.py).
   Cada fala é achada pelo texto que aparece na tela. Fala sem áudio fica em silêncio. */
(function () {
  var V = {};
  var clips = {};        // chave -> base64 do mp3
  var buffers = {};      // chave -> AudioBuffer já decodificado
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

  V.carregar = function (nome) {
    if (carregados[nome]) return Promise.resolve();
    if (pacotes[nome]) return pacotes[nome];
    pacotes[nome] = new Promise(function (resolver) {
      var s = document.createElement('script');
      s.src = 'js/voz/' + nome + '.js';
      s.async = true;
      s.onload = function () { resolver(); };
      s.onerror = function () { resolver(); };
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

  function decodificar(ac, chave) {
    if (buffers[chave]) return Promise.resolve(buffers[chave]);
    var b64 = clips[chave];
    if (!b64) return Promise.resolve(null);
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Promise(function (ok) {
      try {
        ac.decodeAudioData(bytes.buffer, function (buf) { buffers[chave] = buf; ok(buf); }, function () { ok(null); });
      } catch (e) { ok(null); }
    });
  }

  function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // segmentos: 'texto' | [ 'texto', {texto, voz}, ... ]; opcoes.voz: voz padrão
  V.falar = function (segmentos, opcoes) {
    opcoes = opcoes || {};
    V.calar();
    if (ajustes().voz === false) return Promise.resolve();
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
