/* Abertura com a novidade em destaque (pedido do Leandro, 31/10/2026: "a nova atualização precisa ser o destaque
   principal"). Para todos os jogadores, até Reino.config.novidadeInicio.ate: a faixa de cima ("Nova atualização!") e,
   embaixo do título, a casinha pulando em degraus com o texto grande e a linha pequena. Enquanto vale, fica no lugar
   do bloco da medalha de ouro (js/ui/abertura-medalha.js); o confete e o parabéns do Claude no mapa continuam. Publica:
   - UI.novidadeInicio.ativa(hoje?) → bool: a tela de início (motor/main.js) mostra a novidade;
   - UI.novidadeInicio.primeiraVez() → bool: este aparelho ainda não viu a novidade (o botão vira "Atualizar");
   - UI.novidadeInicio.atualizar(tela) → Promise: a atualização de mentira por cima da tela de início (barra que enche
     em blocos, passos com graça, "Pronto!"), e grava que o aparelho viu. A marca fica no localStorage
     'reino-novidade-vista' (do aparelho, não do save: a tela de início vem antes do login); modo congelado: na hora.
   - Reino._abertura.novidade (interno da abertura, js/ui/abertura.js): faixa() e bloco().
   A casinha é a do baú da casa (UI.casinhaDOM, js/ui/bau-casa.js), lida na hora em que a tela abre. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;

  function cfg() { return (Reino.config && Reino.config.novidadeInicio) || null; }
  // hoje: 'AAAA-MM-DD' (padrão: o relógio)
  function ativa(hoje) {
    var c = cfg();
    if (!c || !c.texto) return false;
    return !c.ate || (hoje || UI.festaMedalha.hoje()) <= c.ate;
  }

  function bloco() {
    var c = cfg(), textos = el('div.novidade-textos', el('p.novidade-texto', c.texto));
    if (c.detalhe) textos.appendChild(el('p.novidade-detalhe', c.detalhe));
    var raiz = el('div.novidade-bloco');
    if (c.tema) raiz.classList.add('novidade-tema-' + c.tema);
    if (c.desenho && PA.iconeEmoji) {   // o desenho da novidade (ex.: o fantasminha 👻), flutuando em degraus
      var d = PA.iconeEmoji(c.desenho, 4); d.classList.add('novidade-desenho');
      raiz.appendChild(el('div.novidade-flutua', { 'aria-hidden': 'true' }, d));
    } else if (UI.casinhaDOM) raiz.appendChild(el('div.novidade-pula', { 'aria-hidden': 'true' }, UI.casinhaDOM(4, 'novidade-casinha')));
    raiz.appendChild(textos);
    return raiz;
  }

  /* ---------- a atualização de mentira (pedido do Leandro, 31/10/2026: "fake updating") ---------- */
  var CHAVE = 'reino-novidade-vista';
  // os passos da barra: os da novidade (config.novidadeInicio.passos, o último é o "Pronto!") ou estes
  var PASSOS_PADRAO = ['Abrindo o mapa do Reino…', 'Plantando as árvores do bosque…', 'Chamando os fantasmas…', 'Acendendo as lanternas…', 'Pronto!'];
  var BLOCOS = 12;

  function primeiraVez() {
    var c = cfg();
    if (!c || !c.id || !ativa()) return false;
    try { return localStorage.getItem(CHAVE) !== c.id; } catch (e) { return false; }
  }
  function marcarVista() {
    var c = cfg();
    try { if (c && c.id) localStorage.setItem(CHAVE, c.id); } catch (e) { /* sem storage: mostra de novo, sem perder nada */ }
  }

  function atualizar(tela) {
    var c = cfg() || {};
    return new Promise(function (resolver) {
      if (Reino.congelado) { marcarVista(); resolver(); return; }
      var total = U.animar() ? (c.atualizarMs || 3600) : (c.atualizarParadoMs || 1500);
      var PASSOS = Array.isArray(c.passos) && c.passos.length > 1 ? c.passos : PASSOS_PADRAO;
      var blocos = [];
      var barra = el('div.atualizando-barra', { 'aria-hidden': 'true' });
      for (var i = 0; i < BLOCOS; i++) { var b = el('span.atualizando-bloco'); blocos.push(b); barra.appendChild(b); }
      var passo = el('p.atualizando-passo', { 'aria-live': 'polite' }, PASSOS[0]);
      var pct = el('p.atualizando-pct', '0%');
      var caixa = el('div.atualizando-caixa', { role: 'status' },
        el('p.atualizando-titulo', 'Atualizando'), barra, pct, passo);
      var veu = el('div.atualizando-veu', caixa);
      (tela || document.body).appendChild(veu);
      var t0 = Date.now(), ultimoPasso = 0;
      // erro no meio não deixa ninguém preso no véu: termina e segue para o jogo
      function tique() {
        try { passoDaBarra(); } catch (e) { if (veu.parentNode) veu.parentNode.removeChild(veu); marcarVista(); resolver(); }
      }
      function passoDaBarra() {
        var f = Math.min(1, (Date.now() - t0) / total);
        // enche em blocos inteiros, com uma "travadinha" no meio, como atualização de verdade
        var g = f < 0.5 ? f * 1.3 : f < 0.62 ? 0.65 : 0.65 + (f - 0.62) / 0.38 * 0.35;
        var cheio = Math.min(BLOCOS, Math.floor(g * BLOCOS + 0.0001));
        blocos.forEach(function (b, k) { b.classList.toggle('cheio', k < cheio); });
        pct.textContent = Math.round(cheio / BLOCOS * 100) + '%';
        var p = Math.min(PASSOS.length - 2, Math.floor(f * (PASSOS.length - 1)));
        if (f >= 1) p = PASSOS.length - 1;
        if (p !== ultimoPasso) { ultimoPasso = p; passo.textContent = PASSOS[p]; }
        if (f < 1) { setTimeout(tique, 100); return; }
        caixa.classList.add('pronto');
        marcarVista();
        setTimeout(function () { if (veu.parentNode) veu.parentNode.removeChild(veu); resolver(); }, 600);
      }
      tique();
    });
  }

  Reino._abertura.novidade = { faixa: function () { return cfg().faixa || 'Nova atualização!'; }, bloco: bloco };
  UI.novidadeInicio = { ativa: ativa, primeiraVez: primeiraVez, atualizar: atualizar };
})();
