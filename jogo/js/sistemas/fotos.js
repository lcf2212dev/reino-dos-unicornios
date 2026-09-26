/* Fotos do jogo (📷): a cena do canvas #reino (sem o HUD, que é DOM), com moldura em pixel e um
   carimbo com o lugar e a data, na fonte pixel. Nunca é a câmera do aparelho (nada de getUserMedia).
   As fotos ficam só neste aparelho, num IndexedDB próprio (config.fotos.banco), até config.fotos.maxAlbum;
   NUNCA no save nem no servidor. Sem IndexedDB (ou com erro), ainda dá para salvar no aparelho.
   Nada aqui toca em DOM, canvas, PA, Progresso ou Cena no carregamento: as ferramentas em Node
   (listar-falas.js) carregam este arquivo num vm só para ler falas().
   Em três arquivos, nesta ordem (Reino.Fotos é um só):
     fotos.js          frases, banco (IndexedDB), lugar e data, captura do canvas
     fotos-moldura.js  a moldura em pixel e o carimbo (monta a foto num canvas novo)
     fotos-telas.js    tirar (flash, prévia), álbum, foto grande, salvar no aparelho, depurar
   O que as partes dividem mora em Reino._fotos (interno): F e as funções que cada parte publica no fim. */
(function () {
  var Reino = window.Reino = window.Reino || {};
  var F = {};
  var I = Reino._fotos = { F: F };   // o que as partes das fotos dividem (ver o cabeçalho)
  var K = Reino.Desenho.K;
  var FONTE_PIXEL = '"Press Start 2P", "Trebuchet MS", sans-serif';

  // falas novas (pacote geral): o que aparece escrito na própria tela também é falado (só a voz)
  var FRASES = {
    previa: 'Que foto linda! Vamos guardar?',
    guardada: 'Foto guardada no álbum! 📸',
    cheio: 'O álbum está cheio. Apague uma foto para guardar outra.',
    semBanco: 'Neste aparelho só dá para salvar a foto.',
    salva: 'Pronto! A foto foi salva no aparelho.',
    vazio: 'O álbum ainda está vazio. Vamos tirar uma foto?',
  };
  F.frases = FRASES;
  F.falas = function () {
    return Object.keys(FRASES).map(function (k) { return { texto: FRASES[k], voz: 'claude' }; });
  };

  function cfg() {
    var c = (Reino.config && Reino.config.fotos) || {};
    return { maxLado: c.maxLado || 1600, maxAlbum: c.maxAlbum || 40, banco: c.banco || 'reino-fotos', toqueLongoMs: c.toqueLongoMs || 600 };
  }
  function U() { return Reino.util; }
  function falarVoz(texto) { try { if (Reino.Som && Reino.Som.falar) Reino.Som.falar(texto, { voz: 'claude' }); } catch (e) {} }
  function som(nome) { try { if (Reino.Som && Reino.Som.tocar) Reino.Som.tocar(nome); } catch (e) {} }
  function semAnimacao() {
    return !!((document.body && document.body.classList.contains('sem-animacao')) || (U() && U().reduzMovimentoSistema));
  }

  /* ---------- banco (IndexedDB próprio, só deste aparelho) ----------
     Loja 'fotos' (id automático): { id, criada, lugar, data, arquivo, w, h, png: Blob, mini: Blob } */
  var LOJA = 'fotos';
  var banco = { estado: null, db: null, abrindo: null, quantidade: 0 };
  function abrirBanco() {
    if (banco.abrindo) return banco.abrindo;
    banco.abrindo = new Promise(function (resolver) {
      var feito = false;
      function fim(estado, db) {
        if (feito) return;
        feito = true;
        banco.estado = estado; banco.db = db || null;
        if (!db) { resolver(null); return; }
        // outra aba quer mudar a versão do banco: fecha esta conexão (não trava a outra)
        db.onversionchange = function () { try { db.close(); } catch (e) {} banco.db = null; banco.estado = 'erro'; };
        contar().then(function () { resolver(db); }, function () { resolver(db); });
      }
      var idb = null;
      try { idb = window.indexedDB; } catch (e) { idb = null; }
      if (!idb || typeof idb.open !== 'function') { fim('sem-indexeddb'); return; }
      var pedido;
      try { pedido = idb.open(cfg().banco, 1); } catch (e) { fim('erro'); return; }
      pedido.onupgradeneeded = function () {
        var db = pedido.result;
        if (!db.objectStoreNames.contains(LOJA)) db.createObjectStore(LOJA, { keyPath: 'id', autoIncrement: true });
      };
      pedido.onsuccess = function () { fim('ok', pedido.result); };
      pedido.onerror = function () { fim('erro'); };
      // aba antiga segurando o banco, ou navegador que nunca responde: segue sem álbum
      setTimeout(function () { fim('erro'); }, 5000);
    });
    return banco.abrindo;
  }
  // uma operação numa transação; resolve com o resultado do pedido (ou rejeita)
  function operar(modo, fn) {
    return abrirBanco().then(function (db) {
      if (!db) throw new Error('sem banco');
      return new Promise(function (resolver, rejeitar) {
        var tx, pedido;
        try { tx = db.transaction(LOJA, modo); pedido = fn(tx.objectStore(LOJA)); } catch (e) { rejeitar(e); return; }
        tx.oncomplete = function () { resolver(pedido ? pedido.result : undefined); };
        tx.onerror = tx.onabort = function () { rejeitar(tx.error || new Error('transação')); };
      });
    });
  }
  function contar() {
    if (!banco.db) return Promise.resolve(0);
    return new Promise(function (resolver) {
      try {
        var p = banco.db.transaction(LOJA, 'readonly').objectStore(LOJA).count();
        p.onsuccess = function () { banco.quantidade = p.result; resolver(p.result); };
        p.onerror = function () { resolver(banco.quantidade); };
      } catch (e) { resolver(banco.quantidade); }
    });
  }
  // todas, da mais nova para a mais antiga
  function listar() {
    return operar('readonly', function (loja) { return loja.getAll(); }).then(function (l) {
      l = l || [];
      banco.quantidade = l.length;
      return l.sort(function (a, b) { return b.criada - a.criada || b.id - a.id; });
    });
  }
  // guarda se couber: 'ok' | 'cheio' | 'erro' (a conta e a gravação na mesma transação)
  function guardarNoBanco(foto) {
    var max = cfg().maxAlbum, resultado = 'erro';
    return operar('readwrite', function (loja) {
      var c = loja.count();
      c.onsuccess = function () {
        if (c.result >= max) { resultado = 'cheio'; return; }
        loja.add({ criada: foto.criada, lugar: foto.lugar, data: foto.data, arquivo: foto.arquivo, w: foto.w, h: foto.h, png: foto.png, mini: foto.mini });
        resultado = 'ok';
      };
      return null;
    }).then(function () { return contar().then(function () { return resultado; }); }, function () { return 'erro'; });
  }
  function apagarDoBanco(id) {
    return operar('readwrite', function (loja) { return loja.delete(id); }).then(contar);
  }

  /* ---------- lugar e data ---------- */
  function doisDigitos(n) { return (n < 10 ? '0' : '') + n; }
  function datas(d) {
    return {
      data: doisDigitos(d.getDate()) + '/' + doisDigitos(d.getMonth() + 1) + '/' + d.getFullYear(),
      arquivo: d.getFullYear() + '-' + doisDigitos(d.getMonth() + 1) + '-' + doisDigitos(d.getDate()),
    };
  }
  // { predio, comodo }: no mapa, o Reino (ou o Lago, nadando); num interior, o prédio e o cômodo onde ela está
  function lugarAgora() {
    var cena = Reino.Cena && Reino.Cena.atual ? Reino.Cena.atual() : null;
    var J = window.Jogador;
    if (!cena || cena.tipo !== 'interior') {
      return { predio: J && J.nadando && J.nadando() ? 'Lago do Reino' : 'Reino dos Unicórnios', comodo: null };
    }
    var predio = cena.nome || 'Reino dos Unicórnios', comodo = null;
    var t = J && J.tile ? J.tile() : null;
    ((cena.def && cena.def.comodos) || []).forEach(function (c) {
      var r = c.rect;
      if (t && r && t.x >= r.x && t.x < r.x + r.w && t.y >= r.y && t.y < r.y + r.h) comodo = c.nome || c.placa || null;
    });
    if (comodo && comodo.toLowerCase() === predio.toLowerCase()) comodo = null;
    return { predio: predio, comodo: comodo };
  }
  function nomeLugar(l) { return l.comodo ? l.predio + ' · ' + l.comodo : l.predio; }
  // "Pet Shop · Cantinho da Água" → "pet-shop-cantinho-da-agua"
  function semAcento(s) { return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function lugarArquivo(lugar) {
    return semAcento(lugar).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'reino';
  }
  // o lugar que já começa com "reino" ("Reino dos Unicórnios") não repete o prefixo
  function nomeArquivo(foto) {
    var l = lugarArquivo(foto.lugar);
    return (/^reino(-|$)/.test(l) ? l : 'reino-' + l) + '-' + foto.arquivo + '.png';
  }


  /* ---------- captura ----------
     O canvas guarda o último quadro inteiro desenhado (o laço desenha tudo dentro de um
     requestAnimationFrame; aqui, fora dele, nunca se vê um quadro pela metade). Como podeTirar()
     exclui a transição, não há íris. Copia na hora do toque, antes do flash (que é DOM). */
  function capturar() {
    var cv = document.getElementById('reino');
    if (!cv || !cv.width || !cv.height) return null;
    var c = document.createElement('canvas');
    c.width = cv.width; c.height = cv.height;
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(cv, 0, 0);
    // a mesma escala do jogo (motor/camera.js, redimensionar): px da tela por pixel do jogo
    var T = (window.Mapa && window.Mapa.T) || 16;
    var escala = Math.max(2, Math.round(Math.min(cv.width, cv.height) / (T * 12.5)));
    return { canvas: c, escala: escala };
  }

  // para as outras partes
  I.K = K; I.FONTE_PIXEL = FONTE_PIXEL; I.FRASES = FRASES; I.cfg = cfg; I.U = U; I.falarVoz = falarVoz; I.som = som;
  I.semAnimacao = semAnimacao; I.banco = banco; I.abrirBanco = abrirBanco; I.listar = listar;
  I.guardarNoBanco = guardarNoBanco; I.apagarDoBanco = apagarDoBanco; I.datas = datas; I.lugarAgora = lugarAgora;
  I.nomeLugar = nomeLugar; I.nomeArquivo = nomeArquivo; I.capturar = capturar;

  Reino.Fotos = F;
})();
