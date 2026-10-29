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
  // Pixel do mundo (arte.md §14.2): o canvas é em px de aparelho, cada peça tem 1 ou 2 px de arte do mundo
  // (passo = Reino._motor.escala px de aparelho) e a posição cai na grade desse passo; cores da paleta (arte.md §8)
  // reserva: as cores de confete do arte.md §8 (rosa, ouro, roxo, azul, laranja, folha), se o config não tiver a lista
  var CORES_CONFETE = ['#ff7eb6', '#ffd34d', '#7c5cff', '#5fb4ff', '#ff8a3d', '#9ccc4a'];
  function coresConfete() {
    var pal = Reino.config && Reino.config.paleta, cs = pal && Array.isArray(pal.confete) ? pal.confete : [];
    cs = cs.filter(function (c) { return typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c); });
    return cs.length ? cs : CORES_CONFETE;
  }
  // passo: px (do canvas) de 1 px de arte; k: px do canvas por px CSS (velocidade lateral e balanço)
  function criarConfete(quantos, w, h, sorte, passo, k) {
    sorte = sorte || Math.random; passo = passo || 1; k = k || 1;
    var cores = coresConfete(), ps = [];
    for (var i = 0; i < quantos; i++) {
      var s = passo * (sorte() < 0.34 ? 1 : 2), cedo = i % 6 === 0;
      ps.push({ x0: sorte() * w, y0: cedo ? sorte() * h * 0.3 : -s - sorte() * h * 0.7, vy: h / (1.3 + sorte() * 0.8),
        vx: (-40 + sorte() * 80) * k, a: 12 * k, s: s, c: cores[i % cores.length], r: sorte() * 6, x: 0, y: 0 });
    }
    return ps;
  }
  // põe cada peça no tempo t (s desde o começo); devolve { vivas (ainda acima da borda de baixo), visiveis }
  function moverConfete(ps, t, h) {
    var vivas = 0, visiveis = 0;
    ps.forEach(function (p) {
      p.y = p.y0 + p.vy * t;
      p.x = p.x0 + p.vx * t + Math.sin(t / 0.3 + p.r) * (p.a || 12);
      if (p.y < h) { vivas++; if (p.y > -p.s) visiveis++; }
    });
    return { vivas: vivas, visiveis: visiveis };
  }
  function animar() { return U.animar ? U.animar() : !!(est().ajustes.animacoes && !U.reduzMovimentoSistema); }
  UI.confete = function (quantos) {
    if (!animar()) return;
    var c = el('canvas.confete');
    document.body.appendChild(c);
    var V = Reino._motor || {}, dpr = V.dpr || Math.min(window.devicePixelRatio || 1, 3);
    var passo = Math.max(1, Math.round(V.escala || 2 * dpr));
    var w = c.width = Math.round(window.innerWidth * dpr), h = c.height = Math.round(window.innerHeight * dpr);
    c.style.width = window.innerWidth + 'px'; c.style.height = window.innerHeight + 'px';
    var ctx = c.getContext('2d');
    var ps = criarConfete(quantos || 90, w, h, null, passo, dpr);
    var t0 = null, t = 0;
    // a grade do mundo na tela anda com a câmera (motor/laco.js desliza o cenário em frações de pixel do jogo):
    // a fase é o mesmo deslocamento que o laço usa para desenhar o buffer, lido a cada quadro
    var fx = 0, fy = 0;
    function fase(c) { var cam = V.cam; if (!cam) return 0; var d = -Math.round((cam[c] - Math.floor(cam[c])) * passo); return ((d % passo) + passo) % passo; }
    function grade(v, f) { return Math.round((v - f) / passo) * passo + f; }
    (function passoDoQuadro(agora) {
      // o relógio anda pelo dt do quadro (no máximo 0,1 s: aba escondida não some com a chuva de uma vez)
      if (t0 !== null) t += Math.min(0.1, Math.max(0, (agora - t0) / 1000));
      t0 = agora;
      var n = moverConfete(ps, t, h);
      ctx.clearRect(0, 0, w, h);
      fx = fase('x'); fy = fase('y');
      ps.forEach(function (p) { if (p.y < h && p.y > -p.s) { ctx.fillStyle = p.c; ctx.fillRect(grade(p.x, fx), grade(p.y, fy), p.s, p.s); } });
      c.dataset.pecas = n.visiveis;
      if (n.vivas) requestAnimationFrame(passoDoQuadro); else c.remove();
    })(performance.now());
  };

  /* ---------- escala de festa (arte.md §16) ---------- */
  // nível: confete, classe do título, som (só sons que já existem; o 4 é a fanfarra com a estrela depois)
  var FESTA = {
    1: { confete: 0, som: null },
    2: { confete: 40, som: 'fanfarra' },
    3: { confete: 90, som: 'fanfarra' },
    4: { confete: 160, som: 'fanfarra', depois: 'estrela' },
  };
  // opcoes: titulo (ganha .titulo-festa-N, com ou sem animação), emoji (pulinho e brilhinhos, nível 2+),
  // item (brilho de 3 quadros, nível 1), som (false: quem chama já tocou), confete (número: troca o da tabela, ex. 0)
  UI.festa = function (nivel, opcoes) {
    var f = FESTA[nivel] || FESTA[1];
    opcoes = opcoes || {};
    if (opcoes.titulo) opcoes.titulo.classList.add('titulo-festa-' + nivel);
    if (opcoes.som !== false && f.som) {
      Reino.Som.tocar(f.som);
      if (f.depois) setTimeout(function () { Reino.Som.tocar(f.depois); }, 700);
    }
    if (!animar()) return f;
    if (opcoes.emoji && nivel >= 2) opcoes.emoji.classList.add('festa-pulo');
    if (opcoes.item) { opcoes.item.classList.remove('festa-brilho'); void opcoes.item.offsetWidth; opcoes.item.classList.add('festa-brilho'); }
    var n = typeof opcoes.confete === 'number' ? opcoes.confete : f.confete;
    if (n > 0) UI.confete(n);
    return f;
  };
  UI.festa.tabela = FESTA;

  /* ---------- a estrela ganha vai até o contador (D9-17) ---------- */
  // ⭐ de 16×16 pixels de arte (32 px CSS), desenhada em JS, em 8 degraus (posição em px pares) até o chip de estrelas do HUD (ou, com uma tela por
  // cima do HUD, até o placar da tela); o chip se repinta quando ela chega; sem animação não sai nada
  var PASSOS_ESTRELA = 8;   // 8 degraus em 2 × --lento (1,2 s): dá para ver a estrela ir
  function alvoEstrela(alvoTela) {
    var chip = U.$('#hud .chip-estrelas');
    if (chip) {
      var r = chip.getBoundingClientRect(), icone = chip.querySelector('canvas') || chip;
      var ri = icone.getBoundingClientRect(), topo = r.width && document.elementFromPoint(ri.left + ri.width / 2, ri.top + ri.height / 2);
      if (topo && chip.contains(topo)) return ri;
    }
    return alvoTela ? alvoTela.getBoundingClientRect() : null;
  }
  UI.estrelaVoa = function (de, alvoTela) {
    var a = de && de.getBoundingClientRect(), b = alvoEstrela(alvoTela);
    if (!animar() || !a || !b || !window.PA) return;
    var c = window.PA.iconeEmoji('⭐', 1);
    c.classList.add('estrela-voa');
    c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    var x0 = a.left + a.width / 2 - 16, y0 = a.top + a.height / 2 - 16, x1 = b.left + b.width / 2 - 16, y1 = b.top + b.height / 2 - 16;
    var ms = ((Reino.config.movimento && Reino.config.movimento.lento) || 600) * 2 / PASSOS_ESTRELA, k = 1;
    function por(i) {
      var t = i / PASSOS_ESTRELA;
      c.style.left = 2 * Math.round((x0 + (x1 - x0) * t) / 2) + 'px';
      c.style.top = 2 * Math.round((y0 + (y1 - y0) * t) / 2) + 'px';
    }
    por(1);   // o 1º degrau já na hora (a foto do ver pega a estrela no caminho)
    (function passo() {
      setTimeout(function () {
        if (++k > PASSOS_ESTRELA) { c.remove(); if (UI.atualizarHUD) UI.atualizarHUD(); return; }
        por(k); passo();
      }, ms);
    })();
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
    return PA.paraDOM(spr, escala || 4);   // escala par (arte.md §10.7: sprite das peças 4)
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
