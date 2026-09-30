/* Abertura: a cena ilustrada e animada atrás da tela de início (também na espera "Abrindo o reino..." e
   nas boas-vindas). UI.abertura({ montaria, aparencia }) devolve { el, entrar, parar }:
   - el: o título "Reino dos Unicórnios" (letras que caem com um brilho passando) + o canvas da cena,
     preso na tela inteira por trás do resto;
   - entrar(): brilho e zoom no castelo; resolve quando acabar (sem animação, na hora);
   - parar(): cancela o requestAnimationFrame e solta os canvas (também sozinho quando a tela sai do DOM).
   Camadas paradas em abertura-desenho.js (uma vez por tamanho); aqui só o que mexe: estrelas, nuvens,
   arco-íris se desenhando, unicórnios voando com rastro, a Mariana trotando, vaga-lumes, estrela cadente.
   Sem animação (Ajustes, reduzir movimento do aparelho ou modo congelado dos testes): a mesma cena parada.
   Números: Reino.config.abertura (os que faltarem vêm de PADRAO). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desenho;
  var PADRAO = {
    tituloMs: 1600,     // entrada do título (a última letra termina de cair aqui)
    estrelas: 70,       // estrelas piscando no céu
    unicornios: 3,      // unicórnios voando
    arcoMs: 1800,       // arco-íris se desenhando
    entrarMs: 600,      // brilho e zoom no castelo depois do toque em "Entrar"
    pixelsAlvo: 70000,  // tamanho da cena em pixels lógicos (menos = pixel maior)
  };
  var POSE = 5.4;       // segundo da animação usado na cena parada (arco-íris pronto, unicórnios à vista)

  function config() { return Object.assign({}, PADRAO, (Reino.config && Reino.config.abertura) || {}); }
  function animacoesLigadas() {
    if (Reino.congelado) return false;
    var est = Reino.Progresso && Reino.Progresso.estado();
    return !(est && est.ajustes && est.ajustes.animacoes === false) && !U.reduzMovimentoSistema;
  }

  /* ---------- título: cada letra num span (cai e brilha em sequência, pelo CSS) ---------- */
  function titulo(cfg) {
    var h = el('h1.titulo-abertura', { 'aria-label': 'Reino dos Unicórnios' });
    var n = 0, total = 'ReinodosUnicórnios'.length;
    var passo = Math.max(20, Math.round((cfg.tituloMs - 600) / (total - 1)));
    ['Reino dos', 'Unicórnios'].forEach(function (txt, i) {
      var linha = el('span.titulo-linha.titulo-linha-' + (i + 1), { 'aria-hidden': 'true' });
      txt.split('').forEach(function (ch) {
        if (ch === ' ') { linha.appendChild(el('span.titulo-espaco')); return; }
        var s = el('span.titulo-letra', { 'data-l': ch }, ch);
        s.style.setProperty('--atraso', (n * passo) + 'ms');
        s.style.setProperty('--brilho', (cfg.tituloMs + n * 60) + 'ms');
        n++;
        linha.appendChild(s);
      });
      h.appendChild(linha);
    });
    return h;
  }

  /* ---------- a cena ---------- */
  // barra do app (theme-color, só no build da Vercel): noite na abertura e no login, grama quando o mapa abre
  // (main.js entrarNoReino; ui.md §10.8)
  function corDaBarra(nome) {
    var meta = document.querySelector('meta[name=theme-color]'), pal = Reino.config && Reino.config.paleta;
    if (meta && pal && pal[nome]) meta.setAttribute('content', pal[nome]);
  }

  function abertura(opcoes) {
    opcoes = opcoes || {};
    var cfg = config(), A = Reino._abertura;
    var anima = animacoesLigadas();
    var cv = el('canvas.abertura-cena', { 'aria-hidden': 'true' });
    var ctx = cv.getContext('2d');
    var flash = el('div.abertura-flash');
    var raiz = el('div.logo.abertura' + (anima ? '' : '.abertura-parada'), cv, el('div.abertura-veu'), flash, titulo(cfg));
    var m = null, cam = {}, estrelas = [], voadores = [], rastro = [], vagas = [];
    var raf = 0, inicio = 0, parado = false, jaNoDom = false, esperas = 0, mudouTamanho = true, timerTam = 0, timerVigia = 0;

    function soltarCamadas() { Object.keys(cam).forEach(function (k) { A.soltar(cam[k]); }); cam = {}; }

    function montar() {
      var vw = Math.max(1, window.innerWidth || 1), vh = Math.max(1, window.innerHeight || 1);
      var s = Math.max(1, Math.min(8, Math.round(Math.sqrt(vw * vh / cfg.pixelsAlvo))));
      var W = Math.ceil(vw / s), H = Math.ceil(vh / s);
      soltarCamadas();
      cv.width = W; cv.height = H;
      ctx.imageSmoothingEnabled = false;
      cv.style.width = (W * s) + 'px'; cv.style.height = (H * s) + 'px';
      m = A.medidas(W, H);
      cv.style.transformOrigin = ((m.cx / W) * 100).toFixed(1) + '% ' + (((m.castelo.y + 50) / H) * 100).toFixed(1) + '%';
      cam.ceu = A.ceu(m);
      cam.montanhas = A.montanhas(m);
      cam.chao = A.chao(m);
      cam.arco = A.arcoIris(m.arco);
      var larg = Math.max(W, 200) + 90;
      cam.nuvensLonge = A.nuvens(larg, Math.round(m.yH * 0.3), 5, 34, ['#e3a3c8', '#9b6fb8', '#6f4c98', 150], 5);
      cam.nuvensPerto = A.nuvens(larg, Math.round(m.yH * 0.34), 3, 58, ['#ffd0dc', '#d98fb7', '#9a5f9e', 235], 9);
      // estrelas: mais no alto, nunca perto do sol
      var r = D.rng(17);
      estrelas = [];
      for (var i = 0; i < cfg.estrelas; i++) {
        var y = Math.round(Math.pow(r(), 1.6) * m.yH * 0.58);
        estrelas.push({ x: Math.round(r() * W), y: y, fase: r() * 6.3, vel: 1.2 + r() * 2.4, grande: r() < 0.14, cor: r() < 0.7 ? '#ffffff' : r() < 0.5 ? '#fff3a0' : '#ffd0ec' });
      }
      // unicórnios voando (os de asa do deck); o 1º mais perto e maior
      var vistos = {}, todos = Reino.Unicornios.todos().filter(function (u) {
        var corpo = u.cores && u.cores.corpo;
        if (!(u.raridade === 'epico' || u.raridade === 'lendario') || vistos[corpo]) return false;
        return (vistos[corpo] = true);
      });
      // faixa de voo: entre o pé do título e o meio do castelo (nunca por cima das letras)
      var h1 = raiz.querySelector('.titulo-abertura');
      var topo = Math.round((h1 && h1.isConnected ? h1.getBoundingClientRect().bottom / s : m.yH * 0.25) + 4);
      var fundo = Math.max(topo + 26, m.castelo.y + 45), vao = fundo - topo;
      voadores = [];
      for (i = 0; i < cfg.unicornios && todos.length; i++) {
        var perto = i === 0 && vao >= 56 && Math.min(W, H) >= 150, alto = perto ? 48 : 24;
        var fr = perto ? 0.7 : ((i - 1) * 0.37 + 0.05) % 1;
        voadores.push({ def: todos[i % todos.length], esc: perto ? 2 : 1, dir: i % 2 ? -1 : 1,
          vel: (perto ? 26 : 13 + i * 3), yb: Math.round(topo + Math.max(0, vao - alto) * fr), fr: (0.2 + i * 0.37) % 1, acum: 0 });
      }
      rastro = [];
      for (i = 0; i < 140; i++) rastro.push({ vida: 0 });
      vagas = [];
      for (i = 0; i < 16; i++) vagas.push({ x: r() * W, fase: r() * 6.3, vel: 3 + r() * 5, desl: r() });
      mudouTamanho = false;
    }

    /* ----- o que mexe ----- */
    function desenharEstrelas(t) {
      for (var i = 0; i < estrelas.length; i++) {
        var e = estrelas[i], b = 0.55 + 0.45 * Math.sin(t * e.vel + e.fase);
        ctx.globalAlpha = 0.25 + 0.75 * b;
        ctx.fillStyle = e.cor;
        ctx.fillRect(e.x, e.y, 1, 1);
        if (e.grande && b > 0.7) {
          ctx.globalAlpha = (b - 0.7) / 0.3 * 0.8;
          ctx.fillRect(e.x - 1, e.y, 3, 1); ctx.fillRect(e.x, e.y - 1, 1, 3);
          if (b > 0.93) { ctx.fillRect(e.x - 2, e.y, 5, 1); ctx.fillRect(e.x, e.y - 2, 1, 5); }
        }
      }
      ctx.globalAlpha = 1;
    }
    function estrelaCadente(t) {
      var P = 7, n = Math.floor(t / P), k = (t - n * P) / 0.9;
      if (k > 1 || t < 2) return;
      var x0 = m.W * (0.55 + D.sorte(n, 1, 9) * 0.4), y0 = m.yH * (0.04 + D.sorte(n, 2, 9) * 0.14);
      var hx = x0 - k * m.W * 0.35, hy = y0 + k * m.W * 0.14;
      for (var j = 0; j < 14; j++) {
        ctx.globalAlpha = (1 - j / 14) * (1 - k * 0.6);
        ctx.fillStyle = j < 2 ? '#ffffff' : '#fff3a0';
        ctx.fillRect(Math.round(hx + j * 2.2), Math.round(hy - j * 0.9), 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    function faixa(c, y, vel, t) {
      var off = ((t * vel) % c.width + c.width) % c.width;
      ctx.drawImage(c, -Math.round(off), y);
      ctx.drawImage(c, c.width - Math.round(off), y);
    }
    // o arco-íris vai aparecendo da esquerda: recorte em degrau, linha a linha na grade do desenho (sem arco liso):
    // em cada linha acima do centro, fica só o que está antes do ângulo ang (de PI, à esquerda, até 2·PI, à direita)
    function recorteDoArco(a, ang) {
      var x0 = Math.round(a.x - a.r - 3), cy = Math.round(a.y), sen = Math.sin(ang), cos = Math.cos(ang);
      ctx.beginPath();
      for (var y = Math.round(a.y - a.r - 3); y < cy; y++) {
        var dy = y + 0.5 - a.y;
        var x1 = sen > -1e-6 ? a.x + a.r + 3 : a.x + dy * cos / sen;
        var w = Math.round(x1) - x0;
        if (w > 0) ctx.rect(x0, y, w, 1);
      }
    }
    function arco(t) {
      var a = m.arco, p = anima || t < POSE ? Math.min(1, Math.max(0, (t - 0.35) / (cfg.arcoMs / 1000))) : 1;
      if (p <= 0) return;
      p = 1 - Math.pow(1 - p, 2.2);
      if (p >= 1) { ctx.drawImage(cam.arco, a.x - a.r, a.y - a.r); return; }
      ctx.save();
      recorteDoArco(a, Math.PI * (1 + p)); ctx.clip();
      ctx.drawImage(cam.arco, a.x - a.r, a.y - a.r);
      ctx.restore();
      var ang = Math.PI * (1 + p), rr = a.r - a.faixa * 3;
      D.brilho(ctx, Math.round(a.x + Math.cos(ang) * rr), Math.round(a.y + Math.sin(ang) * rr), '#ffffff');
    }
    function mariana(t) {
      if (!opcoes.montaria || !opcoes.aparencia) return;
      var q = anima ? Math.floor(t * 8) % 3 : 0;
      var spr = PA.montada(opcoes.montaria, 3, q, opcoes.aparencia, {});
      var e = Math.min(m.W, m.H) >= 190 ? 2 : 1, w = spr.w * e, h = spr.h * e;
      var x = Math.round(m.W * (m.emPe ? 0.2 : 0.22) - w / 2), y = m.frente - h + (q === 1 ? -e : 0);
      ctx.fillStyle = 'rgba(30,40,40,0.35)';
      ctx.fillRect(x + Math.round(w * 0.2), m.frente - 1, Math.round(w * 0.6), 2);
      ctx.drawImage(spr.canvas, Math.max(1, x), y, w, h);
    }
    function soltarBrilho(x, y, dir, i) {
      for (var j = 0; j < rastro.length; j++) {
        var b = rastro[j];
        if (b.vida > 0) continue;
        b.x = x; b.y = y; b.vx = -dir * (3 + (j % 4)); b.vy = 4 + (j % 5); b.vida = b.max = 0.7 + (j % 7) * 0.08; b.cor = j % 6; b.i = i;
        return;
      }
    }
    var CORES_RASTRO = ['#ff9cc6', '#ffe066', '#9fdcff', '#b58cff', '#ffffff', '#6fdc8c'];
    function voar(t, dt) {
      for (var i = 0; i < voadores.length; i++) {
        var v = voadores[i], q = anima ? Math.floor(t * 7 + i) % 3 : 1;
        var spr = PA.unicornio(v.def, 3, q, { vista: 'lado' });
        var w = spr.w * v.esc, h = spr.h * v.esc, volta = m.W + w * 2 + 20;
        var pos = ((v.fr * volta + v.vel * (t - POSE)) % volta + volta) % volta - w - 10;
        var x = Math.round(v.dir > 0 ? pos : m.W - pos - w), y = Math.round(v.yb + Math.sin(t * 2.1 + i * 1.7) * 3 * v.esc);
        if (anima && dt > 0) {
          v.acum += dt * 28 * v.esc;
          while (v.acum >= 1) { v.acum -= 1; soltarBrilho(v.dir > 0 ? x + 2 : x + w - 2, y + h * 0.45 + (v.acum * 7 % 5), v.dir, i); }
        }
        if (v.dir < 0) { ctx.save(); ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(spr.canvas, 0, 0, w, h); ctx.restore(); }
        else ctx.drawImage(spr.canvas, x, y, w, h);
      }
    }
    function desenharRastro(dt) {
      for (var j = 0; j < rastro.length; j++) {
        var b = rastro[j];
        if (b.vida <= 0) continue;
        b.vida -= dt; b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.vida <= 0) continue;
        var k = b.vida / b.max, x = Math.round(b.x), y = Math.round(b.y);
        ctx.globalAlpha = Math.min(1, k * 1.4);
        ctx.fillStyle = CORES_RASTRO[b.cor];
        if (k > 0.75 && j % 3 === 0) { ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); }
        else ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    function vagaLumes(t) {
      var faixaY = m.H - m.yH;
      for (var i = 0; i < vagas.length; i++) {
        var g = vagas[i], sobe = ((t * g.vel / faixaY + g.desl) % 1);
        var x = Math.round(g.x + Math.sin(t * 1.3 + g.fase) * 4), y = Math.round(m.H - sobe * faixaY * 1.1);
        var b = 0.5 + 0.5 * Math.sin(t * 3 + g.fase);
        ctx.globalAlpha = b * (1 - sobe * 0.6);
        if (b > 0.85) D.brilho(ctx, x, y, '#fff3a0'); else ret1(x, y, i % 2 ? '#ffe066' : '#ffb3d9');
      }
      ctx.globalAlpha = 1;
    }
    function ret1(x, y, cor) { ctx.fillStyle = cor; ctx.fillRect(x, y, 1, 1); }

    function desenhar(t, dt) {
      if (mudouTamanho || !cam.ceu) montar();
      ctx.drawImage(cam.ceu, 0, 0);
      desenharEstrelas(t);
      if (anima) estrelaCadente(t);
      faixa(cam.nuvensLonge, Math.round(m.yH * 0.26), 2.5, t);
      arco(t);
      ctx.drawImage(cam.montanhas, 0, 0);
      faixa(cam.nuvensPerto, Math.round(m.yH * 0.02), 6, t);
      ctx.drawImage(cam.chao, 0, 0);
      mariana(t);
      voar(t, dt);
      desenharRastro(dt);
      vagaLumes(t);
    }

    /* ----- laço (só com animação) e parada ----- */
    var ultimo = 0;
    function quadro(agora) {
      raf = 0;
      if (parado) return;
      if (!cv.isConnected) {
        if (jaNoDom || ++esperas > 90) { parar(); return; }   // a tela fechou (ou nunca abriu)
      } else jaNoDom = true;
      if (!inicio) inicio = ultimo = agora;
      var dt = Math.min(0.05, (agora - ultimo) / 1000);
      ultimo = agora;
      if (cv.isConnected) desenhar((agora - inicio) / 1000, dt);
      raf = requestAnimationFrame(quadro);
    }
    function aoMudarTamanho() {
      if (parado) return;
      if (!cv.isConnected && jaNoDom) { parar(); return; }
      mudouTamanho = true;
      if (!anima) {   // parada: redesenha uma vez e solta as camadas
        clearTimeout(timerTam);
        timerTam = setTimeout(function () { if (!parado) { desenhar(POSE, 0); soltarCamadas(); } }, 120);
      }
    }
    function parar() {
      if (parado) return;
      parado = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(timerTam);
      clearTimeout(timerVigia);
      window.removeEventListener('resize', aoMudarTamanho);
      soltarCamadas();
      estrelas = voadores = rastro = vagas = [];
      A.soltar(cv);
    }
    function entrar() {
      return new Promise(function (resolver) {
        if (!anima || parado) { parar(); resolver(); return; }
        var tela = raiz.closest('.tela');
        if (tela) tela.classList.add('abertura-entrando');
        raiz.classList.add('entrando');
        setTimeout(function () { parar(); resolver(); }, cfg.entrarMs);
      });
    }

    // um relógio curto solta tudo quando a tela sai da página (também com o rAF pausado, aba escondida);
    // parada, sem laço: é ele que desenha quando a tela entra na página
    function vigiar() {
      timerVigia = 0;
      if (parado) return;
      if (cv.isConnected) {
        if (!jaNoDom) { jaNoDom = true; if (!anima) { mudouTamanho = true; desenhar(POSE, 0); soltarCamadas(); } }
      } else if (jaNoDom || ++esperas > 50) { parar(); return; }
      timerVigia = setTimeout(vigiar, jaNoDom ? 400 : 50);
    }
    corDaBarra('noite');
    window.addEventListener('resize', aoMudarTamanho);
    if (anima) {
      raiz.style.setProperty('--entrar-ms', cfg.entrarMs + 'ms');
      raf = requestAnimationFrame(quadro);
      vigiar();
    } else {
      desenhar(POSE, 0);   // já pronta antes de entrar na página; redesenha lá (faixa de voo medida pelo título)
      soltarCamadas();
      vigiar();
    }
    return { el: raiz, entrar: entrar, parar: parar };
  }

  Reino.UI.abertura = abertura;
  Reino.UI.corDaBarra = corDaBarra;
})();
