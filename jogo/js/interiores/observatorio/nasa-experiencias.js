/* Observatório, 2º andar (NASA), parte 2 de 3: as experiências (foguete que decola, pena e martelo na
   câmara sem ar, fases da Lua com a lâmpada, horta espacial) e as ações `nasa-experiencia` e
   `nasa-curiosidade`. Tocar → a animação no próprio objeto (só com Animações; sem elas, fica parado) e a
   explicação curta no balão. Só diversão: nada de pergunta, estrela, dinheiro ou save. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K;
  var S = R._predios.observatorio;
  var v = S.v, tempo = S.tempo, N = S.NASA, escrever = S.escreverNasa;

  /* ================= estado das experiências (só na memória da sessão) ================= */
  var DURACAO = { foguete: 6000, pena: 2600, fases: 8000, horta: 5000 };
  var ativas = {};   // exp → { inicio } (o início é o t do primeiro quadro depois do toque)
  // o mesmo critério do motor para passar t (motor/laco.js): sem Animações o toque não fica guardado para depois
  function animacoesLigadas() {
    try {
      var e = R.Progresso && R.Progresso.estado && R.Progresso.estado();
      return !!(e && e.ajustes && e.ajustes.animacoes) && !(R.util && R.util.reduzMovimentoSistema);
    } catch (err) { return false; }
  }
  function ativar(exp) { if (animacoesLigadas()) ativas[exp] = { inicio: null }; }
  // progresso de 0 a 1 enquanto roda; null parada (ou sem animação)
  function progresso(exp, t) {
    var e = ativas[exp];
    if (!e || !t) return null;
    if (e.inicio === null) e.inicio = t;
    var f = (t - e.inicio) / DURACAO[exp];
    if (f >= 1 || f < 0) { delete ativas[exp]; return null; }
    return f;
  }

  /* ================= FOGUETE NA PLATAFORMA ================= */
  function corpoFoguete(ctx, cx, base) {
    // aletas
    ret(ctx, cx - 14, base - 22, 7, 20, K); ret(ctx, cx - 13, base - 20, 5, 17, N.vermelho);
    ret(ctx, cx + 8, base - 22, 7, 20, K); ret(ctx, cx + 9, base - 20, 5, 17, N.vermelho);
    // corpo branco
    ret(ctx, cx - 9, base - 78, 19, 76, K); ret(ctx, cx - 8, base - 77, 17, 74, N.branco);
    ret(ctx, cx + 4, base - 77, 5, 74, N.cinza); ret(ctx, cx - 8, base - 77, 2, 74, '#ffffff');
    ret(ctx, cx - 8, base - 12, 17, 3, N.vermelho); ret(ctx, cx - 8, base - 60, 17, 2, N.cinza2);
    // NASA escrito de cima para baixo
    escrever(ctx, cx - 3, base - 55, 'NASA', 1, N.azul2, null, true);
    // bico
    triangulo(ctx, cx - 10, base - 100, 21, 23, K); triangulo(ctx, cx - 8, base - 97, 17, 19, N.vermelho);
    ret(ctx, cx - 3, base - 90, 1, 8, '#ff8a94');
    // janelinha
    circulo(ctx, cx, base - 68, 4, K); circulo(ctx, cx, base - 68, 3, N.ciano); ret(ctx, cx - 1, base - 70, 1, 1, '#ffffff');
    // bocal
    ret(ctx, cx - 5, base - 3, 11, 4, K); ret(ctx, cx - 4, base - 2, 9, 2, N.cinza3);
  }
  function fogo(ctx, cx, y, t) {
    var tremor = Math.floor(t / 60) % 2;
    triangulo(ctx, cx - 6, y, 13, 16 + tremor * 4, '#ff8a3d');
    ret(ctx, cx - 6, y, 13, 3, '#ff8a3d');
    triangulo(ctx, cx - 3, y, 7, 10 + tremor * 3, N.amarelo);
    ret(ctx, cx - 1, y, 3, 5, '#ffffff');
  }
  function fumaca(ctx, cx, y, f) {
    var r = 3 + Math.round(f * 8);
    for (var i = 0; i < 4; i++) {
      var dx = (i - 1.5) * (6 + f * 10);
      circulo(ctx, Math.round(cx + dx), y - (i % 2) * 2, r, i % 2 ? '#e8ecf5' : N.cinza);
    }
  }
  I.objeto('nasa-foguete', { w: 3, h: 2, topo: 72, solido: true,
    desenhar: function (ctx, px, py) {
      // plataforma com as faixas amarelas e pretas
      ret(ctx, px + 1, py + 18, 46, 13, K); ret(ctx, px + 2, py + 19, 44, 11, N.cinza2); ret(ctx, px + 2, py + 19, 44, 2, N.cinza);
      for (var i = 0; i < 11; i++) ret(ctx, px + 3 + i * 4, py + 26, 2, 3, i % 2 ? K : N.amarelo);
      ret(ctx, px + 16, py + 16, 16, 4, K); ret(ctx, px + 17, py + 17, 14, 2, N.cinza3);
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var cx = px + 24, base = py + 18, f = progresso('foguete', t);
      if (f === null) { corpoFoguete(ctx, cx, base); return; }
      // 0–0,3: acende e treme; 0,3–0,75: sobe; depois volta de mansinho para a plataforma
      if (f < 0.3) {
        fumaca(ctx, cx, base + 6, f / 0.3);
        corpoFoguete(ctx, cx + (Math.floor(t / 50) % 2), base);
        fogo(ctx, cx, base + 1, t);
      } else if (f < 0.75) {
        var g = (f - 0.3) / 0.45, dy = Math.round(g * g * 170);
        fumaca(ctx, cx, base + 6, 1 - g * 0.5);
        corpoFoguete(ctx, cx, base - dy);
        fogo(ctx, cx, base + 1 - dy, t);
      } else {
        var h = (f - 0.75) / 0.25, desce = Math.round((1 - h) * 30);
        if (h > 0.4) corpoFoguete(ctx, cx, base - desce);
        // brilhinhos no céu onde ele sumiu
        ret(ctx, cx - 10, py - 100, 1, 3, N.amarelo); ret(ctx, cx - 11, py - 99, 3, 1, N.amarelo);
        ret(ctx, cx + 9, py - 90, 1, 3, '#ffffff'); ret(ctx, cx + 8, py - 89, 3, 1, '#ffffff');
      }
    } });

  /* ================= PENA E MARTELO (câmara sem ar) ================= */
  function pena(ctx, x, y) { ret(ctx, x, y, 1, 7, N.cinza3); ret(ctx, x - 2, y + 1, 2, 4, '#ffffff'); ret(ctx, x + 1, y, 2, 5, '#ffe8f4'); }
  function martelo(ctx, x, y) { ret(ctx, x + 1, y + 2, 1, 6, '#a86b4a'); ret(ctx, x - 1, y, 5, 3, K); ret(ctx, x, y + 1, 3, 1, N.cinza2); }
  I.objeto('nasa-camara', { w: 1, h: 1, topo: 26, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 8, 14, 6, K); ret(ctx, px + 2, py + 9, 12, 4, N.cinza2);
      ret(ctx, px + 1, py - 26, 14, 5, K); ret(ctx, px + 2, py - 25, 12, 3, N.cinza2);
      // vidro
      ret(ctx, px + 2, py - 21, 12, 29, K); ret(ctx, px + 3, py - 21, 10, 29, '#d8f0ff');
      ret(ctx, px + 4, py - 20, 1, 26, '#ffffff');
      // bombinha de tirar o ar
      ret(ctx, px + 12, py + 10, 3, 2, N.azul);
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var f = progresso('pena', t);
      // duas quedas seguidas; os dois sempre na mesma altura
      var y = f === null ? py + 1 : py - 19 + Math.round(Math.min(1, (f * 2) % 1 * 1.25) * 20);
      pena(ctx, px + 6, y); martelo(ctx, px + 10, y);
    } });

  /* ================= FASES DA LUA (lâmpada = Sol, bola = Lua) ================= */
  // a Lua vista da Terra: ang 0 = nova, 0,5 = cheia
  function luaFase(ctx, cx, cy, r, ang) {
    circulo(ctx, cx, cy, r + 1, K); circulo(ctx, cx, cy, r, '#3a3f6a');
    var ilum = Math.cos(ang * Math.PI * 2);   // 1 nova → -1 cheia
    for (var y = -r; y <= r; y++) {
      var meia = Math.floor(Math.sqrt(r * r - y * y));
      if (meia <= 0) continue;
      var borda = Math.round(meia * ilum);
      // crescente: lado direito aceso; minguante: esquerdo
      if (ang < 0.5) ret(ctx, cx + borda, cy + y, meia - borda + 1, 1, '#f4f0d8');
      else ret(ctx, cx - meia, cy + y, meia - borda + 1, 1, '#f4f0d8');
    }
  }
  I.objeto('nasa-fases', { w: 2, h: 1, topo: 12, solido: true,
    desenhar: function (ctx, px, py) {
      // mesinha
      ret(ctx, px + 1, py + 4, 30, 4, K); ret(ctx, px + 2, py + 5, 28, 2, N.branco);
      ret(ctx, px + 3, py + 8, 2, 6, K); ret(ctx, px + 27, py + 8, 2, 6, K);
      // lâmpada (o Sol)
      ret(ctx, px + 5, py - 2, 2, 7, K);
      circulo(ctx, px + 6, py - 5, 4, K); circulo(ctx, px + 6, py - 5, 3, N.amarelo); ret(ctx, px + 5, py - 7, 1, 1, '#ffffff');
      // telinha da fase
      ret(ctx, px + 18, py - 12, 13, 13, K); ret(ctx, px + 19, py - 11, 11, 11, N.tela);
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var f = progresso('fases', t), ang = f === null ? 0.25 : f;
      // a bolinha andando em volta da Terrinha
      var ex = px + 14, ey = py - 1;
      circulo(ctx, ex, ey, 2, N.azul);
      var a = ang * Math.PI * 2;
      var bx = Math.round(ex - Math.cos(a) * 5), by = Math.round(ey - Math.sin(a) * 3);
      circulo(ctx, bx, by, 2, '#e6e6f0');
      if (f !== null) { ret(ctx, px + 9, py - 5, 1, 1, '#fff3a0'); ret(ctx, px + 2, py - 5, 1, 1, '#fff3a0'); }
      luaFase(ctx, px + 24, py - 6, 4, ang);
    } });

  /* ================= HORTA ESPACIAL (luz rosa e alface) ================= */
  function alface(ctx, x, y, tam) {
    if (tam < 1) { ret(ctx, x, y - 2, 1, 2, '#3a9a4a'); return; }
    var r = Math.min(4, tam);
    elipse(ctx, x, y - r, r + 1, r, '#2f7a3a'); elipse(ctx, x, y - r, r, r - 1, N.verde);
    ret(ctx, x, y - r * 2 + 1, 1, r, '#b8f0c0');
  }
  I.objeto('nasa-horta', { w: 2, h: 1, topo: 18, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 18, 30, 32, K); ret(ctx, px + 2, py - 17, 28, 30, N.cinza);
      ret(ctx, px + 3, py - 14, 26, 20, '#3a1f4a');
      // luzes de LED rosa e azul no teto
      for (var i = 0; i < 6; i++) ret(ctx, px + 4 + i * 4, py - 16, 3, 2, i % 2 ? '#ff6ba8' : '#5fb4ff');
      ret(ctx, px + 3, py + 3, 26, 3, '#8a5a3a');
      ret(ctx, px + 3, py + 8, 26, 4, N.branco); ret(ctx, px + 12, py + 9, 8, 2, N.verde);
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var f = progresso('horta', t), tam = f === null ? 3 : Math.floor(f * 5);
      // o brilho rosa sobre as plantas
      ret(ctx, px + 4, py - 12, 24, 1, 'rgba(255,107,168,0.35)');
      for (var i = 0; i < 3; i++) alface(ctx, px + 9 + i * 7, py + 3, tam);
    } });

  /* ================= AÇÕES ================= */
  var CONTINUAR = { texto: 'Continuar →', valor: 'mais', principal: true };
  var FIM_EXP = [{ texto: 'De novo! ✨', valor: 'outra', principal: true }, { texto: 'Tchau! 💛', valor: 'tchau' }];
  var FIM_CUR = [{ texto: 'Outra curiosidade! ✨', valor: 'outra', principal: true }, { texto: 'Tchau! 💛', valor: 'tchau' }];
  function falas() { return (S.falas().nasa) || { curiosidades: [], experiencias: {}, nomes: {}, TEMA_VOZ: {} }; }
  function falarPaginas(pags, quem, voz, botoesFim) {
    var Cl = R.Claude, i = 0;
    if (!Cl || !Cl.falar) return Promise.resolve(null);
    function prox(val) {
      if (val === null || val === undefined || val === 'tchau') return val === undefined ? null : val;
      var pg = pags[i], ultima = i >= pags.length - 1;
      i++;
      var r = Cl.falar(pg, { quem: quem, modal: true, voz: voz, fala: [pg], botoes: ultima ? botoesFim : [CONTINUAR] });
      return ultima ? r : r.then(prox);
    }
    return prox('ok');
  }
  // quem fala: o objeto tocado (retrato e nome dele) ou o NPC
  function quem(ctx, voz, npcId) {
    var o = ctx && ctx.objeto, OI = R.ObservatorioInterior, retrato = null;
    if (o) {
      try { retrato = OI && OI.retratoDe ? OI.retratoDe(o) : null; } catch (e) { retrato = null; }
      return { nome: o.nome || 'NASA', retrato: retrato, voz: voz };
    }
    var n = ((ctx && ctx.interior && ctx.interior.npcs) || []).find(function (x) { return x.id === npcId; });
    try { if (n && R.NPCs && R.NPCs.retrato) retrato = [R.NPCs.retrato(n, 0), R.NPCs.retrato(n, 1)]; } catch (e) { retrato = null; }
    return { nome: (n && n.nome) || 'NASA', retrato: retrato, voz: voz };
  }
  function som() { if (R.Som && R.Som.tocar) { try { R.Som.tocar('selecionar'); } catch (e) {} } }

  function experiencia(acao, ctx) {
    var exp = (acao && acao.exp) || 'foguete', pags = falas().experiencias[exp] || ['Que experiência legal!'];
    var q = quem(ctx, 'npc-nasa-bia');
    function uma() {
      ativar(exp); som();
      return falarPaginas(pags, q, 'npc-nasa-bia', FIM_EXP).then(function (r) { return r === 'outra' ? uma() : r; });
    }
    return uma();
  }

  // curiosidades sorteadas sem repetir na sessão (a memória fica só aqui)
  var vistas = {}, ultima = null;
  function sortearCuriosidade(temas) {
    var lista = falas().curiosidades.filter(function (c) { return !temas || temas.indexOf(c.tema) >= 0; });
    if (!lista.length) return null;
    var livres = lista.filter(function (c) { return !vistas[c.id]; });
    if (!livres.length) {
      lista.forEach(function (c) { delete vistas[c.id]; });
      livres = lista.length > 1 ? lista.filter(function (c) { return c.id !== ultima; }) : lista;
    }
    var e = R.util.sortear(livres);
    vistas[e.id] = true; ultima = e.id;
    return e;
  }
  function curiosidade(acao, ctx) {
    var temas = acao && acao.temas;
    function uma() {
      var c = sortearCuriosidade(temas);
      if (!c) return Promise.resolve(null);
      var voz = falas().TEMA_VOZ[c.tema] || 'npc-nasa-lia';   // a voz gravada é a do tema
      som();
      return falarPaginas(c.paginas, quem(ctx, voz, acao && acao.quem), voz, FIM_CUR).then(function (r) { return r === 'outra' ? uma() : r; });
    }
    return uma();
  }

  if (R.NPCs && R.NPCs.registrarAcao) {
    R.NPCs.registrarAcao('nasa-experiencia', experiencia);
    R.NPCs.registrarAcao('nasa-curiosidade', curiosidade);
  }
})();
