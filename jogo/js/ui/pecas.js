/* Peças comuns das telas (Reino.UI): hifenização para a fonte pixel, confete, sprite da
   montaria e o diálogo de pedir nome. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var UI = Reino.UI, R = Reino._ui;
  var est = R.est;

  /* Hifenização leve para a fonte pixel (larga): põe hífens invisíveis (\u00AD) entre as sílabas
     das palavras compridas, e o navegador só mostra o hífen se a palavra precisar quebrar
     ("Obser-vatório" numa coluna estreita). Regras do português: V-CV e VC-CV, sem separar
     lh/nh/ch/qu/gu nem consoante + l/r (br, pl, tr...). Palavras curtas ficam como estão. */
  var VOGAL = 'aeiouáéíóúâêôãõàü';
  function ehVogal(ch) { return VOGAL.indexOf(ch.toLowerCase()) >= 0; }
  function ehLetra(ch) { return /[a-zà-ÿ]/i.test(ch); }
  function hifenizarPalavra(w) {
    if (w.length < 9) return w;  // até 8 letras cabe inteira nas colunas do celular
    var cortes = [];
    for (var i = 1; i < w.length - 1; i++) {
      var a = w[i - 1], b = w[i], c = w[i + 1], d = w[i + 2];
      if (!ehLetra(b) || !ehLetra(c) || ehVogal(b) || !ehVogal(a)) continue;
      if (ehVogal(c)) cortes.push(i);                       // V-CV
      else if (d && ehVogal(d) && ehLetra(d)) {
        var par = (b + c).toLowerCase();
        var junto = /^(lh|nh|ch|qu|gu)$/.test(par) || (/[lr]/.test(c.toLowerCase()) && /[bcdfgkptv]/.test(b.toLowerCase()));
        cortes.push(junto ? i : i + 1);                      // VC-CV (ou V-CCV)
      } else if (d && /[lr]/i.test(d) && /[bcdfgkptv]/i.test(c) && w[i + 3] && ehVogal(w[i + 3])) cortes.push(i + 1); // VC-CCV (lem-bran)

    }
    // nada de sobrar uma letra só de um lado
    cortes = cortes.filter(function (k) { return k >= 2 && k <= w.length - 2; });
    for (var j = cortes.length - 1; j >= 0; j--) w = w.slice(0, cortes[j]) + '\u00AD' + w.slice(cortes[j]);
    return w;
  }
  function hifenizar(texto) { return String(texto).replace(/[a-zà-ÿ]+/gi, hifenizarPalavra); }
  function aparencia() { return est().aparencia; }

  /* ---------- confete ---------- */
  UI.confete = function (quantos) {
    if (!est().ajustes.animacoes) return;
    var c = el('canvas.confete');
    document.body.appendChild(c);
    var w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    var ctx = c.getContext('2d');
    var cores = ['#ff7eb6', '#ffd34d', '#7c5cff', '#39c5bb', '#5fb4ff', '#ff9d2e'];
    var ps = [];
    for (var i = 0; i < (quantos || 90); i++) ps.push({ x: Math.random() * w, y: -20 - Math.random() * h * 0.5, vy: 2 + Math.random() * 3, vx: -1 + Math.random() * 2, s: 6 + Math.floor(Math.random() * 3) * 3, c: cores[i % cores.length], r: Math.random() * 6 });
    var t0 = performance.now();
    (function passo(t) {
      ctx.clearRect(0, 0, w, h);
      ps.forEach(function (p) { p.y += p.vy; p.x += p.vx + Math.sin((t / 300) + p.r); ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); });
      if (t - t0 < 2600) requestAnimationFrame(passo); else c.remove();
    })(t0);
  };

  /* ---------- sprites prontos para a interface ---------- */
  UI.spriteMontaria = function (id, escala, opcoes) {
    var d = P.defUni(id);
    var u = est().unis[id];
    var e = Reino.Unicornios.estagio(u ? u.xp : 0);
    opcoes = opcoes || {};
    var spr = PA.unicornio(d, e, 0, { enfeites: opcoes.semEnfeite ? [] : (id === P.montaria() ? est().usando.enfeites : []), asasFada: !opcoes.semEnfeite && id === P.montaria() && est().usando.asasFada });
    return PA.paraDOM(spr, escala || 3);
  };

  UI.pedirNome = function (pergunta, atual) {
    return new Promise(function (resolver) {
      var t = UI.abrirTela('confirmar');
      var input = el('input#campo-nome.campo-nome', { type: 'text', maxlength: 18, value: atual || '', autocomplete: 'off', 'aria-label': pergunta });
      var ok = el('button.btn-grande.btn-principal', { type: 'button' }, 'Pronto! ✨');
      var sug = el('div.sugestoes');
      ['Estrelinha', 'Purpurina', 'Algodão', 'Arco-Íris', 'Luna', 'Docinho', 'Brilho'].forEach(function (s) {
        var b = el('button.chip-mini.sugestao', { type: 'button' }, s);
        b.addEventListener('click', function () { input.value = s; Reino.Som.tocar('toque'); });
        sug.appendChild(b);
      });
      t.appendChild(el('div.painel.painel-pequeno', el('p.confirmar-msg', pergunta), input, sug, el('div.intro-botoes', ok)));
      function fim() { var v = input.value.trim(); UI.fecharTela(t); resolver(v ? v.slice(0, 18) : atual); }
      ok.addEventListener('click', fim);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') fim(); });
      setTimeout(function () { input.focus(); input.select(); }, 50);
    });
  };

  R.hifenizar = hifenizar;
  R.aparencia = aparencia;
})();
