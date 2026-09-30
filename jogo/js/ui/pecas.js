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
  // Tudo pelo tempo (s), não pelo quadro: a mesma chuva em 60 ou 120 Hz. Uma peça em 6 já nasce na tela
  // (confete desde o 1º quadro); as outras vêm de até 70 % da altura acima e atravessam a tela em 1,3 a 2,1 s.
  // O canvas só sai quando a última peça passa da borda de baixo.
  var CORES_CONFETE = ['#ff7eb6', '#ffd34d', '#7c5cff', '#39c5bb', '#5fb4ff', '#ff9d2e'];
  function criarConfete(quantos, w, h, sorte) {
    sorte = sorte || Math.random;
    var ps = [];
    for (var i = 0; i < quantos; i++) {
      var s = 6 + Math.floor(sorte() * 3) * 3, cedo = i % 6 === 0;
      ps.push({ x0: sorte() * w, y0: cedo ? sorte() * h * 0.3 : -s - sorte() * h * 0.7, vy: h / (1.3 + sorte() * 0.8),
        vx: -40 + sorte() * 80, s: s, c: CORES_CONFETE[i % CORES_CONFETE.length], r: sorte() * 6, x: 0, y: 0 });
    }
    return ps;
  }
  // põe cada peça no tempo t (s desde o começo); devolve { vivas (ainda acima da borda de baixo), visiveis }
  function moverConfete(ps, t, h) {
    var vivas = 0, visiveis = 0;
    ps.forEach(function (p) {
      p.y = p.y0 + p.vy * t;
      p.x = p.x0 + p.vx * t + Math.sin(t / 0.3 + p.r) * 12;
      if (p.y < h) { vivas++; if (p.y > -p.s) visiveis++; }
    });
    return { vivas: vivas, visiveis: visiveis };
  }
  function animar() { return U.animar ? U.animar() : !!(est().ajustes.animacoes && !U.reduzMovimentoSistema); }
  UI.confete = function (quantos) {
    if (!animar()) return;
    var c = el('canvas.confete');
    document.body.appendChild(c);
    var w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    var ctx = c.getContext('2d');
    var ps = criarConfete(quantos || 90, w, h);
    var t0 = null, t = 0;
    (function passo(agora) {
      // o relógio anda pelo dt do quadro (no máximo 0,1 s: aba escondida não some com a chuva de uma vez)
      if (t0 !== null) t += Math.min(0.1, Math.max(0, (agora - t0) / 1000));
      t0 = agora;
      var n = moverConfete(ps, t, h);
      ctx.clearRect(0, 0, w, h);
      ps.forEach(function (p) { if (p.y < h && p.y > -p.s) { ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); } });
      c.dataset.pecas = n.visiveis;
      if (n.vivas) requestAnimationFrame(passo); else c.remove();
    })(performance.now());
  };
  UI.confete.criar = criarConfete;
  UI.confete.mover = moverConfete;

  /* ---------- sprites prontos para a interface ---------- */
  UI.spriteMontaria = function (id, escala, opcoes) {
    var d = P.defUni(id);
    if (!d) { id = 'inicial'; d = P.defUni(id); }   // id desconhecido (versão nova): desenha a reserva
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
