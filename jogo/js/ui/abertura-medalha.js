/* Abertura em festa: a medalha de ouro da prova real do 3º bimestre (pedido do Leandro, 28/10/2026).
   Só para a Mariana (a última jogadora do aparelho é ela, ou ninguém) e até Reino.config.festaMedalha.ate; para os
   outros jogadores e depois da data, a entrada de sempre. Publica:
   - UI.festaMedalha.ativa(login?, hoje?) → bool: a tela de início (motor/main.js) entra no modo medalha;
   - UI.festaMedalha.entrou(): o toque em "Entrar" na tela em festa (o Claude dá parabéns ao chegar no mapa);
   - Reino._abertura.festa (interno da abertura): o bloco da medalha (canvas pixel art + "3º bimestre" e
     "Parabéns, Mariana!"), o quadro da medalha (brilho que passa e brilhinhos em volta), o confete e as
     estrelinhas douradas caindo na cena e as cores douradas do rastro dos unicórnios (js/ui/abertura.js).
   Sem animação: a medalha e o confete ficam parados no lugar (sem o brilho passando).
   - UI.festaMedalha.parabens(): o Claude dá parabéns (falas em F.fixas), uma vez por sessão, só depois da tela em
     festa e com a Mariana jogando; motor/main.js chama ao entrar no reino, depois do baú de presentes. */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desenho, UI = Reino.UI;
  var CHAVE_SESSAO = 'reino-festa-medalha';   // sessionStorage: o parabéns já foi nesta aba (não é save)
  var entrouNaFesta = false;

  function hojeTexto(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  // login: quem jogou por último (null = ninguém lembrado: o aparelho dela); hoje: 'AAAA-MM-DD' (padrão: o relógio)
  function ativa(login, hoje) {
    var cfg = Reino.config && Reino.config.festaMedalha;
    if (!cfg || !cfg.ate) return false;
    if (login !== null && login !== undefined && login !== 'mariana') return false;
    return (hoje || hojeTexto()) <= cfg.ate;
  }

  /* ---------- a medalha (pixel art, 1 px lógico = 1 px do canvas; o CSS amplia sem borrar) ---------- */
  var MW = 44, MH = 48, CX = 22, CY = 32, RAIO = 12;
  var COR = { y: '#ffd34d', o: '#f0a04a', O: '#b8651a', l: '#fff4cc', w: '#ffffff', r: '#ff7eb6', R: '#c9365a', b: '#5fb4ff', B: '#2e7fd6' };
  var UM = ['.OOl.', 'OOOl.', '.OOl.', '.OOl.', '.OOl.', '.OOl.', '.OOl.', 'OOOOl'];   // o "1" no meio do disco
  var BRILHOS = [[5, 14], [38, 10], [4, 40], [39, 38]];   // brilhinhos em volta (x, y)

  function fita(ctx, x0, dir, claro, escuro) {
    // tira de 7 px que desce na diagonal até o fecho, contorno de 1 px
    for (var y = 0; y < 16; y++) {
      var x = Math.round(x0 + dir * y * 0.5);
      D.ret(ctx, x - 1, y, 9, 1, D.K);
      if (y === 0) continue;
      D.ret(ctx, x, y, 7, 1, claro);
      D.ret(ctx, dir > 0 ? x + 5 : x, y, 2, 1, escuro);
    }
  }
  function brilhinho(ctx, x, y, tam) {
    D.ret(ctx, x, y, 1, 1, COR.w);
    if (tam > 0) { D.ret(ctx, x - 1, y, 3, 1, COR.l); D.ret(ctx, x, y - 1, 1, 3, COR.l); D.ret(ctx, x, y, 1, 1, COR.w); }
    if (tam > 1) { D.ret(ctx, x - 2, y, 1, 1, COR.y); D.ret(ctx, x + 2, y, 1, 1, COR.y); D.ret(ctx, x, y - 2, 1, 1, COR.y); D.ret(ctx, x, y + 2, 1, 1, COR.y); }
  }
  // q: quadro (10 por segundo); parada: q = -1 (sem o brilho passando, brilhinhos médios)
  function desenharMedalha(cv, q) {
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, MW, MH);
    fita(ctx, 26, -1, COR.b, COR.B);   // a azul, atrás
    fita(ctx, 11, 1, COR.r, COR.R);    // a rosa, na frente
    D.ret(ctx, CX - 5, 15, 11, 5, D.K); D.ret(ctx, CX - 4, 16, 9, 3, COR.o); D.ret(ctx, CX - 4, 16, 9, 1, COR.l);   // fecho
    D.circulo(ctx, CX, CY, RAIO, D.K);
    D.circulo(ctx, CX, CY, RAIO - 1, COR.O);
    D.circulo(ctx, CX, CY, RAIO - 2, COR.o);
    D.circulo(ctx, CX, CY, RAIO - 3, COR.y);
    D.circulo(ctx, CX, CY, RAIO - 5, COR.o);
    D.circulo(ctx, CX, CY, RAIO - 6, COR.y);
    // luz de cima e da esquerda (ui.md §10.13.1): arco claro no quarto de cima à esquerda
    for (var a = 0; a < 12; a++) {
      var ang = Math.PI * (1.05 + a * 0.035);
      D.ret(ctx, Math.round(CX + Math.cos(ang) * (RAIO - 3)), Math.round(CY + Math.sin(ang) * (RAIO - 3)), 1, 1, COR.l);
    }
    D.matriz(ctx, CX - 2, CY - 4, UM, { O: COR.O, l: COR.l });
    // o brilho que passa: faixa diagonal de 3 px pelo disco, 1 px por quadro, e uma pausa
    if (q >= 0) {
      var b = (q % 50) - 18;
      for (var dy = -(RAIO - 2); dy <= RAIO - 2; dy++) for (var dx = -(RAIO - 2); dx <= RAIO - 2; dx++) {
        var s = dx + dy - b;
        if (s < -1 || s > 1 || dx * dx + dy * dy > (RAIO - 2.5) * (RAIO - 2.5)) continue;
        D.ret(ctx, CX + dx, CY + dy, 1, 1, s === 0 ? COR.w : COR.l);
      }
    }
    // brilhinhos em volta: crescem e encolhem em degraus (sem piscar forte: o ponto do meio fica sempre aceso)
    BRILHOS.forEach(function (p, i) {
      var f = q < 0 ? 1 : Math.floor(q / 4 + i * 2) % 6;
      brilhinho(ctx, p[0], p[1], f < 3 ? f : 5 - f);
    });
  }

  function bloco() {
    var cv = el('canvas.medalha-festa', { 'aria-hidden': 'true', width: MW, height: MH });
    cv.getContext('2d').imageSmoothingEnabled = false;
    desenharMedalha(cv, -1);
    var raiz = el('div.medalha-bloco', el('div.medalha-pendurada', cv),
      el('div.medalha-textos', el('p.medalha-bimestre', '3º bimestre'), el('p.medalha-parabens', 'Parabéns, Mariana!')));
    return { el: raiz, canvas: cv, q: -2 };
  }
  // chamado a cada quadro da cena (só com animação): redesenha quando o quadro (10 por segundo) muda
  function quadro(b, t) {
    var q = Math.floor(t * 10);
    if (q === b.q) return;
    b.q = q;
    desenharMedalha(b.canvas, q);
  }

  /* ---------- confete e estrelinhas douradas caindo na cena (pixel do mundo, ui.md §10.14.2) ---------- */
  var DOURADO = ['#ffd34d', '#fff4cc', '#f0a04a', '#ffb020', '#ff8a3d'];   // --ouro --ouro-claro --ambar, lendário, --laranja
  var RASTRO = ['#ffd34d', '#fff4cc', '#f0a04a', '#ffb020', '#ffffff', '#ffe066'];
  var PECAS = 72;
  function confete(ctx, m, t) {
    for (var i = 0; i < PECAS; i++) {
      var vel = 8 + D.sorte(i, 3, 21) * 10, fase = D.sorte(i, 5, 21), volta = m.H + 12;
      var y = Math.round(((fase * volta + t * vel) % volta) - 6);
      var x = Math.round(D.sorte(i, 7, 21) * m.W + Math.sin(t * 1.1 + i) * 3);
      var cor = DOURADO[i % DOURADO.length];
      if (i % 7 === 0) { D.brilho(ctx, x, y, COR.l); continue; }   // estrelinha
      var deitado = Math.floor(t * 3 + i) % 2 === 0;               // gira em dois quadros: 2x1 e 1x2
      D.ret(ctx, x, y, deitado ? 2 : 1, deitado ? 1 : 2, cor);
    }
  }

  Reino._abertura.festa = { bloco: bloco, quadro: quadro, confete: confete, RASTRO: RASTRO };

  /* ---------- parabéns do Claude: uma vez por sessão, ao chegar no mapa depois da tela em festa (null = não fala) ---------- */
  function parabensJaFoi() { try { return sessionStorage.getItem(CHAVE_SESSAO) === '1'; } catch (e) { return false; } }
  function falarParabens() {
    if (!entrouNaFesta || Reino.congelado || parabensJaFoi() || Reino.Jogadores.atual() !== 'mariana' || !ativa('mariana')) return null;
    try { sessionStorage.setItem(CHAVE_SESSAO, '1'); } catch (e) { /* sem sessionStorage: fala esta vez */ }
    var F = Reino.Falas.fixas, segs = [F.parabensMedalha, F.parabensCalma, F.parabensOrgulho];
    return Reino.Claude.falar(segs.join(' ') + ' 🥇', { fala: segs });
  }

  UI.festaMedalha = { ativa: ativa, hoje: hojeTexto, entrou: function () { entrouNaFesta = true; }, parabens: falarParabens };
})();
