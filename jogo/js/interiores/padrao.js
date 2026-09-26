/* Interior padrão: toda matéria sem interior próprio ganha um prédio gerado dos dados.
   Hall (guia + Livro da matéria) embaixo no meio e um cômodo por sala, em fileiras de 3.
   Carrega por último (depois de todos os prédios). Só dados e funções: nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, contornoRet = D.contornoRet;
  var K = R.Desenho.K;

  /* ================= FALAS PADRÃO (cada uma ≤30 letras, 3+ palavras) ================= */
  var FALAS = {
    guia: {
      oi: ['Oi! Eu sou a guia daqui. 🌟', 'Cada sala tem um ajudante.'],
    },
    // sala: a 1ª página do `oi` é "Oi! Eu cuido da Sala N."
    sala: {
      oi: ['Vamos aprender com calma? ✨'],
      nova: ['Vamos fazer esta sala? ✨', 'Quer começar agora comigo?'],
      feita: ['Quer brincar de novo aqui?', 'Vamos repetir com calma? 🌷'],
      depois: ['Você foi muito bem! 🎉', 'Que orgulho de você! 💖'],
    },
    objetos: {
      livro: ['Aqui mora o livro da matéria! 📖', 'Vamos ler juntas com calma?'],
      bebedouro: ['Um golinho de água fresca! 💧', 'Beber água faz muito bem.'],
      bancada: ['Olha que desenho bonito! 🎨', 'Ele fala desta sala aqui.'],
      hall: ['Olha que desenho bonito! 🎨', 'Ele fala desta matéria.'],
    },
  };
  function salaOi(n) { return ['Oi! Eu cuido da Sala ' + n + '.'].concat(FALAS.sala.oi); }

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  // cores: mistura dois hex (t = 0 → a, 1 → b). Própria, não a Reino.Desenho.misturar: cor vazia vira
  // '#999999', não limita a 0–255 e escura mistura com o preto (não com o contorno)
  function hex(c) { c = String(c || '#999999').replace('#', ''); if (c.length === 3) c = c.replace(/./g, '$&$&'); return [0, 2, 4].map(function (i) { return parseInt(c.substr(i, 2), 16) || 0; }); }
  function mistura(a, b, t) {
    var x = hex(a), y = hex(b);
    return '#' + x.map(function (n, i) { var m = Math.round(n + (y[i] - n) * t); return (m < 16 ? '0' : '') + m.toString(16); }).join('');
  }
  function clara(c, t) { return mistura(c, '#ffffff', t); }
  function escura(c, t) { return mistura(c, '#000000', t); }
  function semFE0F(s) { return String(s || '').replace(/️/g, ''); }
  // ícone do emoji em pixel (desenho de js/arte/icones/ ou o emoji reduzido a pixels)
  function iconeEmoji(e) {
    if (!e || !window.PA || !PA.iconeEmoji || typeof document === 'undefined') return null;
    try { return PA.iconeDesenho(semFE0F(e)) || PA.iconeEmoji(e, 1); } catch (x) { return null; }
  }
  function pintarIcone(ctx, e, cx, cy, max) {
    var ic = iconeEmoji(e);
    if (!ic) { circulo(ctx, cx, cy, 3, K); circulo(ctx, cx, cy, 2, C.ouro); return; }
    var src = ic.canvas || ic, w = src.width, h = src.height, k = Math.min(1, max / Math.max(w, h));
    var dw = Math.round(w * k), dh = Math.round(h * k);
    ctx.drawImage(src, Math.round(cx - dw / 2), Math.round(cy - dh / 2), dw, dh);
  }

  /* ================= OBJETOS PADRÃO ================= */
  // cartaz com o emoji da sala desenhado em pixel
  I.objeto('padrao-cartaz', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var cor = v(o, 'cor', '#7c5cff');
      contornoRet(ctx, px + 1, py + 5, 14, 17, cor);
      ret(ctx, px + 2, py + 6, 12, 1, clara(cor, 0.4));
      ret(ctx, px + 2, py + 7, 12, 13, C.creme);
      pintarIcone(ctx, v(o, 'emoji', '⭐'), px + 8, py + 13, 11);
      ret(ctx, px + 7, py + 3, 2, 3, K); ret(ctx, px + 7, py + 4, 2, 1, C.ouro);
    } });
  // bancada com o emoji num porta-retrato (interativa)
  I.objeto('padrao-bancada', { w: 2, h: 1, topo: 12, solido: true,
    desenhar: function (ctx, px, py, o) {
      var cor = v(o, 'cor', '#7c5cff'), W = (o.w || 2) * 16;
      ret(ctx, px + 2, py + 8, 3, 8, K); ret(ctx, px + W - 5, py + 8, 3, 8, K);
      ret(ctx, px + 3, py + 8, 1, 7, C.madeira); ret(ctx, px + W - 4, py + 8, 1, 7, C.madeira);
      ret(ctx, px + 1, py + 2, W - 2, 7, K); ret(ctx, px + 2, py + 3, W - 4, 5, cor);
      ret(ctx, px + 2, py + 3, W - 4, 1, clara(cor, 0.45)); ret(ctx, px + 2, py + 7, W - 4, 1, escura(cor, 0.2));
      // porta-retrato em pé
      var cx = px + W / 2;
      contornoRet(ctx, cx - 8, py - 12, 16, 15, C.ouro);
      ret(ctx, cx - 7, py - 11, 14, 13, C.creme);
      pintarIcone(ctx, v(o, 'emoji', '⭐'), cx, py - 5, 11);
      ret(ctx, px + 4, py + 1, 3, 2, K); ret(ctx, px + 5, py + 1, 1, 1, C.branco);
    } });
  // púlpito com o livro aberto da matéria
  I.objeto('padrao-pulpito', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py, o) {
      var cor = v(o, 'cor', '#7c5cff');
      ret(ctx, px + 5, py + 4, 6, 11, K); ret(ctx, px + 6, py + 4, 4, 10, C.madeira);
      ret(ctx, px + 3, py + 13, 10, 3, K); ret(ctx, px + 4, py + 13, 8, 2, C.madeira2 || C.madeira);
      ret(ctx, px + 1, py - 6, 14, 10, K); ret(ctx, px + 2, py - 5, 12, 8, cor);
      ret(ctx, px + 3, py - 5, 5, 7, C.creme); ret(ctx, px + 8, py - 5, 5, 7, C.branco);
      for (var i = 0; i < 3; i++) { ret(ctx, px + 4, py - 3 + i * 2, 3, 1, '#b8a8c8'); ret(ctx, px + 9, py - 3 + i * 2, 3, 1, '#b8a8c8'); }
      ret(ctx, px + 7, py - 5, 1, 8, K);
    } });

  /* ================= NPCs PADRÃO ================= */
  var PELES = ['#ffe0c7', '#d9a07a', '#a86b4a', '#f1c7a5', '#7a4a32', '#e0ac86'];
  var CABELOS = ['#2b1b17', '#c2532b', '#5a3825', '#e8c16a', '#1f1414', '#a0673a', '#6b5a66'];
  var PENTE_ELA = ['rabo', 'chanel', 'trancas', 'longo', 'black', 'coque', 'rabos'];
  var PENTE_ELE = ['curto', 'cacheado', 'espetado', 'careca'];
  var ACESSORIOS = [
    { oculos: true }, { chapeu: 'boina' }, { cachecol: true }, { cracha: true }, { chapeu: 'bone' },
    { avental: true }, { colar: true }, { flor: true }, { oculos: true, livro: '#5fb4ff' },
  ];
  var MASCULINO = { 1: true, 4: true };   // vozes 'npc-padrao-1' e '-4' são masculinas
  function sprite(m, i, ele) {
    var cores = (m.lugar && m.lugar.cores) || {};
    var roupa = i % 2 ? (cores.telhado || '#7c5cff') : (cores.detalhe || '#ff8ac4');
    var s = { base: 'pessoa', pele: PELES[i % PELES.length], cabelo: CABELOS[(i * 3 + 1) % CABELOS.length],
      penteado: ele ? PENTE_ELE[i % PENTE_ELE.length] : PENTE_ELA[i % PENTE_ELA.length],
      roupa: roupa, roupa2: escura(cores.telhado || '#5a4a8a', 0.35), cor2: cores.detalhe || '#ffd34d' };
    if (!ele) s.perna = ['saia', 'vestido', 'saia'][i % 3];
    return Object.assign(s, ACESSORIOS[(i * 5 + 2) % ACESSORIOS.length]);
  }

  /* ================= GERADOR ================= */
  var PISOS = ['taco', 'mosaico', 'pedra', 'tabuas', 'azulejo', 'carpete', 'palha'];
  var PAREDES = ['papel', 'madeira', 'azulejo', 'tijolo', 'pedra'];
  var ITENS = ['globo', 'estrela', 'concha', 'gema', 'coroa', 'ursinho', 'medalha', 'pergaminho'];
  function placa(n, nome) {
    nome = String(nome || '').replace(/[«»]/g, '').trim();
    if (nome.length > 20) nome = nome.slice(0, 19).replace(/\s+\S*$/, '') + '…';
    return 'Sala ' + n + ' • ' + nome;
  }
  function pos(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }

  /** @param {Materia} m @returns {InteriorDef} */
  function gerar(m) {
    var salas = m.salas || [], N = salas.length;
    /** @type {Partial<LugarMateria['cores']>} */
    var cores = (m.lugar && m.lugar.cores) || {};
    var cP = cores.parede || '#fff6e4', cT = cores.telhado || '#9b6bd6', cD = cores.detalhe || '#ff8ac4';
    var nomeLugar = (m.lugar && m.lugar.nome) || m.nome;
    // posições: fileira de baixo = [sala 1, hall, sala 2]; acima, fileiras de até 3 (o meio sempre ocupado)
    var U = Math.ceil(Math.max(0, N - 2) / 3), H = 12 * (U + 1) + 1, yBase = 1 + 12 * U;
    var vagas = [];   // {col, fil} por sala (fil 0 = embaixo)
    if (N >= 1) vagas.push({ col: 0, fil: 0 });
    if (N >= 2) vagas.push({ col: 2, fil: 0 });
    for (var f = 1, resto = N - 2; resto > 0; f++, resto -= 3) {
      var k = Math.min(3, resto);
      (k === 1 ? [1] : k === 2 ? [0, 1] : [0, 1, 2]).forEach(function (c) { vagas.push({ col: c, fil: f }); });
    }
    function xy(col, fil) { return { x: 1 + 12 * col, y: yBase - 12 * fil }; }
    var ocupada = {};
    vagas.forEach(function (p) { ocupada[p.col + ':' + p.fil] = true; });
    ocupada['1:0'] = true;

    function paleta(i) {
      var a = i % 2 ? cT : cD, b = i % 2 ? cD : cT;
      return { piso: clara(a, 0.72), piso2: clara(a, 0.5), parede: clara(cP, 0.35), parede2: clara(b, 0.6),
        rodape: escura(cT, 0.35), detalhe: cD };
    }

    var comodos = [], objetos = [], npcs = [], portas = [], corredores = [];
    // cruz livre em todo cômodo: faixa das fileiras 6-7 e colunas 4-6
    function cruz(o) {
      corredores.push({ x: o.x, y: o.y + 6, w: 11, h: 2 }, { x: o.x + 4, y: o.y + 2, w: 3, h: 9 });
    }

    /* ---------- HALL ---------- */
    var h = xy(1, 0), temCima = !!ocupada['1:1'];
    comodos.push({ id: 'hall', nome: 'Hall', placa: 'Hall • ' + nomeLugar, rect: { x: h.x, y: h.y, w: 11, h: 11 },
      piso: 'mosaico', parede: 'papel', paleta: paleta(0) });
    cruz(h);
    objetos = objetos.concat(pos(h.x, h.y, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'vitral', x: 1, y: 0 },
      { tipo: 'estandarte', x: 2, y: 0, var: { cor: cD, emblema: 'estrela' } },
      { tipo: 'padrao-cartaz', x: 3, y: 0, var: { emoji: semFE0F(m.emoji), cor: cT } }, { tipo: 'arandela', x: 4, y: 0 },
      { tipo: 'arandela', x: 6, y: 0 }, { tipo: 'relogio-parede', x: 7, y: 0 },
      { tipo: 'estandarte', x: 8, y: 0, var: { cor: cT, emblema: 'coracao' } }, { tipo: 'vitral', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      // canto de cima à esquerda: o Livro
      { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 1, y: 2 }, { tipo: 'estante', x: 2, y: 2 },
      { tipo: 'padrao-pulpito', x: 1, y: 4, nome: m.nomeLivro || 'Livro da matéria', fala: FALAS.objetos.livro,
        acao: { tipo: 'tela', tela: 'livro', materia: m.id }, var: { cor: cT } },
      { tipo: 'tapete', x: 0, y: 3, w: 1, h: 3, var: { cor: clara(cD, 0.4), borda: cT } }, { tipo: 'papeis', x: 3, y: 4 },
      // canto de cima à direita
      { tipo: 'flores', x: 7, y: 2 }, { tipo: 'globo', x: 8, y: 2 }, { tipo: 'armario', x: 9, y: 2 },
      { tipo: 'padrao-bancada', x: 8, y: 4, nome: 'Desenho da matéria', fala: FALAS.objetos.hall, var: { emoji: semFE0F(m.emoji), cor: cD } },
      { tipo: 'planta-alta', x: 10, y: 5 }, { tipo: 'almofada', x: 7, y: 4, var: { cor: clara(cT, 0.3) } },
      // embaixo à esquerda
      { tipo: 'bebedouro', x: 0, y: 8, nome: 'Bebedouro', fala: FALAS.objetos.bebedouro },
      { tipo: 'tapete-listrado', x: 1, y: 8, w: 3, h: 1, var: { cores: [cD, '#fff8ee', cT, '#fff8ee'] } },
      { tipo: 'banco', x: 0, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 10 }, { tipo: 'cesto', x: 2, y: 10 },
      { tipo: 'vaso-grande', x: 2, y: 9 },
      // embaixo à direita (o guia fica em 7,8)
      { tipo: 'sofa', x: 8, y: 10 }, { tipo: 'cabideiro', x: 10, y: 8 },
      { tipo: 'vaso-planta', x: 10, y: 9 }, { tipo: 'relogio-pe', x: 10, y: 10 }, { tipo: 'tapete-redondo', x: 8, y: 8, w: 2, h: 1 },
    ]));
    npcs.push({ id: 'guia-' + m.id, nome: 'Guia de ' + m.nome, voz: 'npc-padrao-guia',
      sprite: sprite(m, 7, false), x: h.x + 7, y: h.y + 8, acao: { tipo: 'guia', lugar: 'materia:' + m.id, livro: m.id },
      falas: { oi: FALAS.guia.oi.slice() } });

    /* ---------- SALAS ---------- */
    salas.forEach(function (s, i) {
      var p = vagas[i], o = xy(p.col, p.fil), n = i + 1, pal = paleta(i + 1);
      var raro = (m.unicornios || []).find(function (u) { return u.sala === s.id && u.raridade === 'raro'; });
      var emo = semFE0F(s.emoji || m.emoji), item = ITENS[i % ITENS.length], vozN = (i % 5) + 1, ele = !!MASCULINO[vozN];
      comodos.push({ id: 'sala' + n, nome: String(s.nome || '').replace(/[«»]/g, ''), placa: placa(n, s.nome),
        rect: { x: o.x, y: o.y, w: 11, h: 11 }, piso: PISOS[(i + 1) % PISOS.length], parede: PAREDES[i % PAREDES.length], paleta: pal });
      cruz(o);
      /** @type {ObjetoInterior[]} */
      var parede = [
        { tipo: 'janela', x: 0, y: 0 },
        raro ? { tipo: 'quadro-unicornio', x: 1, y: 0, var: { uni: raro.id } } : { tipo: 'mapa-parede', x: 1, y: 0 },
        { tipo: 'padrao-cartaz', x: 3, y: 0, var: { emoji: emo, cor: pal.detalhe } },
        { tipo: i % 2 ? 'relogio-parede' : 'arandela', x: 4, y: 0 },
        { tipo: 'arandela', x: 6, y: 0 },
        { tipo: 'estandarte', x: 7, y: 0, var: { cor: i % 2 ? cD : cT, emblema: i % 2 ? 'coracao' : 'estrela' } },
        { tipo: i % 3 === 2 ? 'lousa' : 'prateleira-parede', x: 8, y: 0 },
        { tipo: 'padrao-cartaz', x: 10, y: 0, var: { emoji: emo, cor: pal.rodape } },
      ];
      var chao = [
        // em cima à esquerda
        { tipo: 'estante', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 2, y: 2 }, { tipo: 'planta-alta', x: 3, y: 2 },
        { tipo: 'padrao-bancada', x: 1, y: 4, nome: 'Desenho da Sala ' + n, fala: FALAS.objetos.bancada, var: { emoji: emo, cor: pal.detalhe } },
        { tipo: 'papeis', x: 0, y: 3 }, { tipo: 'cadeira', x: 3, y: 4, var: { almofada: cD } },
        // em cima à direita (o NPC fica em 7,5)
        { tipo: 'cesto', x: 7, y: 2 }, { tipo: 'flores', x: 8, y: 2, var: { vaso: cT } }, { tipo: 'armario', x: 9, y: 2 },
        { tipo: 'tapete-redondo', x: 8, y: 4, w: 2, h: 2 }, { tipo: 'globo', x: 10, y: 4 }, { tipo: 'vaso-grande', x: 10, y: 5 },
        // embaixo à esquerda
        { tipo: 'tapete-listrado', x: 0, y: 8, w: 3, h: 1, var: { cores: [cT, '#fff8ee', cD, '#fff8ee'] } },
        { tipo: 'mesa', x: 0, y: 9, var: { toalha: clara(cD, 0.55), itens: ['xicara', 'ursinho'] } },
        { tipo: 'cadeira', x: 2, y: 9, var: { almofada: cT } }, { tipo: 'luminaria-pe', x: 3, y: 8 },
        { tipo: 'bau', x: 3, y: 9 }, { tipo: 'almofada', x: 0, y: 10, var: { cor: clara(cT, 0.3) } },
        // embaixo à direita
        { tipo: 'cavalete', x: 7, y: 8 }, { tipo: 'caixote', x: 10, y: 8, var: { item: 'estrela' } },
        { tipo: 'tapete', x: 8, y: 8, w: 2, h: 1, var: { cor: clara(cT, 0.45), borda: cD } },
        { tipo: 'vitrine', x: 7, y: 10, var: { itens: [item, ITENS[(i + 3) % ITENS.length], item] } },
        { tipo: 'pedestal', x: 9, y: 10, var: { item: ITENS[(i + 5) % ITENS.length] } }, { tipo: 'vaso-planta', x: 10, y: 10 },
      ];
      objetos = objetos.concat(pos(o.x, o.y, parede.concat(chao)));
      npcs.push({ id: 'sala-' + m.id + '-' + s.id, nome: (ele ? 'Monitor' : 'Monitora') + ' da Sala ' + n,
        voz: 'npc-padrao-' + vozN, sprite: sprite(m, i, ele), x: o.x + 7, y: o.y + 5,
        acao: { tipo: 'sala', materia: m.id, sala: s.id },
        falas: { oi: salaOi(n), nova: FALAS.sala.nova.slice(), feita: FALAS.sala.feita.slice(), depois: FALAS.sala.depois.slice() } });
    });

    /* ---------- PORTAS ---------- */
    for (var fil = 0; fil <= U; fil++) {
      [0, 1].forEach(function (c) {
        if (ocupada[c + ':' + fil] && ocupada[(c + 1) + ':' + fil]) { var a = xy(c, fil); portas.push({ x: a.x + 11, y: a.y + 6, w: 1, h: 2 }); }
      });
      if (ocupada['1:' + fil] && ocupada['1:' + (fil + 1)]) { var b = xy(1, fil); portas.push({ x: b.x + 5, y: b.y - 1, w: 1, h: 3 }); }
    }
    // os vãos entre cômodos também ficam livres
    portas.forEach(function (p) { corredores.push({ x: p.x, y: p.y, w: p.w, h: p.h }); });

    return {
      id: 'padrao-' + m.id,
      lugar: 'materia:' + m.id,
      nome: nomeLugar,
      entrada: true,
      pacote: 'interior-padrao-' + m.id,
      tamanho: { w: 37, h: H },
      saida: { x: h.x + 5, y: h.y + 10 },
      spawn: { x: h.x + 5, y: h.y + 9 },
      comodos: comodos, portas: portas, corredores: corredores, objetos: objetos, npcs: npcs,
    };
  }

  Reino.InteriorPadrao = { gerar: gerar, FALAS: FALAS };
  (R.materias || []).forEach(function (m) {
    if (R.interiores.some(function (d) { return d.lugar === 'materia:' + m.id; })) return;
    R.registrarInterior(gerar(m));
  });
})();
