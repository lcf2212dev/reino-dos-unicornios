/* Onde o jogo está rodando, num lugar só: Reino.ambiente. Tudo é função avaliada na hora
   (o window.claude do artifact pode chegar depois do carregamento). Sem DOM no carregamento: roda no Node.
   - artifact(): dentro do artifact do claude.ai (bloqueia Web Share e download iniciado pela página).
   - arquivoLocal(): aberto direto do arquivo (file:). http() / https(): protocolo; https() = contexto seguro.
   - servidorCasa(): null (não conferido), true/false; quem preenche é sistemas/progresso-nuvem.js.
   - toque(): tela de toque (pointer: coarse). podeCompartilhar(files) / podeBaixar(): botões das fotos. */
window.Reino = window.Reino || {};

(function () {
  var casa = null;
  function claude() { return typeof window !== 'undefined' ? window.claude : undefined; }
  function protocolo() { try { return location.protocol; } catch (e) { return ''; } }
  var A = {
    artifact: function () { var c = claude(); return !!(c && typeof c.use === 'function'); },
    arquivoLocal: function () { return protocolo() === 'file:'; },
    http: function () { return protocolo() === 'http:'; },
    https: function () { return protocolo() === 'https:' && !!(typeof window !== 'undefined' && window.isSecureContext); },
    servidorCasa: function () { return casa; },
    marcarServidorCasa: function (sim) { casa = !!sim; },
    toque: function () {
      try { return window.matchMedia('(pointer: coarse)').matches; } catch (e) { return false; }
    },
    // compartilhar arquivo: fora do artifact, contexto seguro, share e canShare({files})
    podeCompartilhar: function (files) {
      if (A.artifact()) return false;
      try {
        var n = navigator;
        return !!(window.isSecureContext && files && files.length && n.share && n.canShare && n.canShare({ files: files }));
      } catch (e) { return false; }
    },
    // baixar pelo <a download>: fora do artifact e onde o navegador sabe o atributo
    podeBaixar: function () {
      if (A.artifact()) return false;
      try { return 'download' in HTMLAnchorElement.prototype; } catch (e) { return false; }
    },
  };
  Reino.ambiente = A;
})();
