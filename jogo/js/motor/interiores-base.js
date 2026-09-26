/* Interiores: as construções por dentro (cômodos andáveis, móveis, personagens e placas).
   Cada interior é DADOS (Reino.registrarInterior, ver js/interiores/*.js). O motor (antes um
   arquivo só, motor/interiores.js) fica dividido em motor/interiores-*.js, nesta ordem:
     base (registro e o objeto interno), pisos (pisos e paredes), objetos-parede, objetos-moveis,
     objetos-enfeites (biblioteca de objetos), grade (grade de tiles e caminho), estatico (desenho
     pré-renderizado), placas (placas dos cômodos e HUD), toque (quem recebe o toque, falas e ações),
     cena (a cena do interior, NPC genérico e a API Reino.Interiores; interface da seção 2 de
     docs/contratos/interiores.md). Os helpers de desenho e a paleta ficam em js/arte/desenho.js.
   Reino._interiores (INTERNO, só destes arquivos): T, K, FUNDO, LIVROS, OBJETOS, objeto, larg, cor,
     progresso e o que cada parte registra (PISOS, PAREDES, grade, caminhoNa, desenharEstatico...).
   No carregamento NADA de DOM, canvas, PA ou Progresso: as ferramentas em Node carregam
   estes arquivos num vm. Tudo o que desenha só roda dentro de funções chamadas depois. */
(function () {
  var R = window.Reino = window.Reino || {};
  var T = 16;
  var K = R.Desenho.K;          // contorno
  var FUNDO = R.Desenho.FUNDO;  // vão entre os cômodos

  R.interiores = R.interiores || [];
  R.registrarInterior = function (def) { R.interiores.push(def); };

  var LIVROS = ['#ff7eb6', '#5fb4ff', '#ffd34d', '#6fdc8c', '#b58cff', '#ff8a3d', '#7ed9c8', '#fff8ee', '#ff5c6a'];

  var OBJETOS = {};
  function objeto(tipo, d) { OBJETOS[tipo] = d; return d; }

  function larg(o) { return (o.w || 1) * T; }
  function cor(o, nome, padrao) { return (o.var && o.var[nome]) || padrao; }

  function progresso() {
    var P = R.Progresso;
    try { return P && P.estado && P.estado() ? P : null; } catch (e) { return null; }
  }

  R._interiores = {
    T: T, K: K, FUNDO: FUNDO, LIVROS: LIVROS,
    OBJETOS: OBJETOS, objeto: objeto, larg: larg, cor: cor,
    progresso: progresso,
  };
})();
