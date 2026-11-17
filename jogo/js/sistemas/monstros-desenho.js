/* Treinadores de Monstros, parte de desenho (de sistemas/monstros.js, interno Reino._monstros; monstros.md): os monstros
   equipados andando em fila atrás dela no caminho dela (o rastro do ET, Reino._etCompanheiro: o 1º a `distancia`, cada
   outro `entreMonstros` px atrás do de antes, e o ET, se ela levou um, no fim da fila),
   com o desenho do inimigo (Monstros.sprite: o da arena ou o da matéria; o passo, o piscar, a sombra, flutuando), virado
   para onde anda; o pulo no inimigo quando ajuda (S.ataques) e a MonsterBall voando, caindo, balançando, com as estrelinhas
   do "Pegou!" ou o puf do "Escapou!" (a Super, dourada e roxa, com faíscas douradas em volta). Também o tiro dos outros
   bichinhos na luta (monstros-pets.js, S.tiros): a estrelinha de arco-íris do unicórnio e o raio verde do ET voando
   até o inimigo, e o brilho no acerto (sem Animações, só o brilho). Sobre ele, sempre, um coraçãozinho rosa (é amigo, não inimigo: na arena ele tem
   o mesmo desenho dos inimigos; a coroa do tipo difícil fica, vem do molde). Sem Animações: parado, sem pulo (só a estrelinha no inimigo) e a bola parada no alvo.
   Roda as partes de regra a cada quadro (S.quadroBola, S.quadroAjuda). Sprites feitos uma vez; nada criado por quadro
   além dos itens de desenho (o espelho é cacheado por canvas). */
(function () {
  var R = window.Reino;
  var S = R._monstros, M = R.Monstros, E = R._etCompanheiro;
  var D = R.Desenho, K = D.K, C = D.C;
  var ALTURA = 6, BALANCO = 1.5, PULO_MS = 260, SALTO_BOLA = 14;
  var espelhos = new WeakMap();
  function espelho(c) {
    var e = espelhos.get(c);
    if (!e) { e = window.PA.espelhado(c); espelhos.set(c, e); }
    return e;
  }
  function cfg() { return R.config.monstros; }
  function matriz(linhas, paleta) {
    var c = PA.novoCanvas(linhas[0].length, linhas.length);
    D.matriz(c.getContext('2d'), 0, 0, linhas, paleta);
    return c;
  }
  var SPR = {};
  // a MonsterBall pequena (7 × 7): metade de cima rosa, de baixo branca, a faixa e o botão
  function bola() {
    return SPR.bola || (SPR.bola = matriz(['.KKKKK.', 'KrrrrrK', 'KrlrrrK', 'KKKwKKK', 'KwwwwgK', 'KwwwwgK', '.KKKKK.'],
      { K: K, r: '#ff5c9a', l: '#ffb3d0', w: '#ffffff', g: '#d8d0e8' }));
  }
  // a Super: dourada em cima, roxa embaixo
  function bolaSuper() {
    return SPR.bolaSuper || (SPR.bolaSuper = matriz(['.KKKKK.', 'KoooooK', 'KoloooK', 'KKKwKKK', 'KppppqK', 'KppppqK', '.KKKKK.'],
      { K: K, o: '#ffd34d', l: '#fff2a8', w: '#ffffff', p: '#9a6bff', q: '#6a3fc8' }));
  }
  // a Mini: menor, verde em cima
  function bolaMini() {
    return SPR.bolaMini || (SPR.bolaMini = matriz(['.KKK.', 'KvvvK', 'KKwKK', 'KwwgK', '.KKK.'],
      { K: K, v: '#5fd48a', w: '#ffffff', g: '#d8d0e8' }));
  }
  function brilho() {
    return SPR.brilho || (SPR.brilho = matriz(['.y.', 'yoy', '.y.'], { y: C.ouro3, o: '#ffffff' }));
  }
  // o brilho dourado da Super: quatro faíscas em volta (girando com Animações; paradas sem)
  function brilhar(p, x, y, t, animar) {
    for (var n = 0; n < 4; n++) {
      var a = n * 1.5708 + (animar ? t / 160 : 0.785);
      p.sprite(brilho(), Math.round(x + Math.cos(a) * 7), Math.round(y - 3 + Math.sin(a) * 6));
    }
  }
  function estrela() {
    return SPR.estrela || (SPR.estrela = matriz(['..K..', '.KoK.', 'KoyoK', '.KoK.', '..K..'], { K: K, o: C.ouro, y: C.ouro3 }));
  }
  // o coraçãozinho de amigo (7 × 6), acima da cabeça dele
  function coracao() {
    return SPR.coracao || (SPR.coracao = matriz(['.KK.KK.', 'KrlKrrK', 'KrrrrrK', '.KrrrK.', '..KrK..', '...K...'],
      { K: K, r: '#ff6fa8', l: '#ffd1e3' }));
  }
  // a estrelinha de arco-íris do chifre do unicórnio (5 × 5) e o raio do ET (4 × 4), com o brilho verde do acerto
  function estrelaArco() {
    return SPR.arco || (SPR.arco = matriz(['..K..', '.KpK.', 'KyWbK', '.KgK.', '..K..'],
      { K: K, p: '#ff7ac0', y: '#ffd34d', W: '#ffffff', b: '#7ad0ff', g: '#7be07b' }));
  }
  function raio() {
    return SPR.raio || (SPR.raio = matriz(['.KK.', 'KlgK', 'KggK', '.KK.'], { K: K, l: '#efffc4', g: '#8dff5a' }));
  }
  function faiscaEt() {
    return SPR.faiscaEt || (SPR.faiscaEt = matriz(['..l..', '.lgl.', 'lgWgl', '.lgl.', '..l..'], { l: '#c9ff9e', g: '#8dff5a', W: '#ffffff' }));
  }
  function puf() {
    return SPR.puf || (SPR.puf = matriz(['.KKK.', 'KwwwK', 'KwwsK', 'KwssK', '.KKK.'], { K: K, w: C.creme, s: '#e3d4ff' }));
  }

  // as linhas vazias no alto do desenho (o coração fica logo acima da primeira com desenho): o molde da arena, ou o
  // fantasma do Bosque (3 linhas da coroinha, vazias fora do difícil; a mosca começa no alto)
  function topoDe(m, e) {
    if (!m) return e.tipo === 'facil' || e.tipo === 'medio' ? 3 : 0;
    if (m._topoAmigo === undefined) { var i = 0; while (i < m.linhas.length - 1 && !/[^.]/.test(m.linhas[i])) i++; m._topoAmigo = i; }
    return m._topoAmigo;
  }
  var distancia = S.distancia;   // o n-ésimo da fila (sistemas/monstros.js)
  var lado = {};   // por espécie: { ultX, espelhar } (para onde cada um olha)

  S.itensDesenho = function (p, t, animar) {
    var J = window.Jogador, cena = R.Cena && R.Cena.atual(), itens = [];
    S.t = t;
    S.quadroBola();
    if (S.quadroPets) S.quadroPets(t);   // o unicórnio e o ET também atacam (monstros-pets.js)
    var ids = M.equipados();
    if (!ids.length || !E) return itens;
    E.atualizar(J.x, J.y, cena && cena.id, J.olharX, J.olharY);
    S.quadroAjuda(t);
    ids.forEach(function (id, n) {
      var e = M.especie(id), q = e && E.pontoAtras(distancia(n));
      if (q) itens.push(item(p, t, animar, e, q, n));
    });
    return itens;
  };
  // um monstro da fila, no ponto q do rastro
  function item(p, t, animar, e, q, n) {
    var J = window.Jogador, l = lado[e.id] || (lado[e.id] = { ultX: null, espelhar: false });
    if (l.ultX !== null && Math.abs(q.x - l.ultX) > 0.05) l.espelhar = q.x < l.ultX;
    l.ultX = q.x;
    var m = M.molde(e.id);
    var topo = topoDe(m, e);
    var alto = m && m.flutua !== undefined ? m.flutua : ALTURA, bal = m && m.balanco !== undefined ? m.balanco : BALANCO;
    return { y: q.y, desenhar: function () {
      var x = q.x, y = q.y, a = S.ataques && S.ataques[e.id], quadro = 0, sobe = alto, espelhar = l.espelhar;
      // o pulo no inimigo: vai e volta (sem Animações, fica no lugar)
      if (a && t - a.em < PULO_MS && animar) {
        var k = Math.sin(Math.PI * (t - a.em) / PULO_MS), dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy) || 1;
        var ir = Math.min(cfg().ajuda.pulo, d) * k;
        x += dx / d * ir; y += dy / d * ir; sobe += 4 * k;
        if (Math.abs(dx) > 0.5) espelhar = l.espelhar = dx < 0;
      }
      if (animar) {
        var fase = n * 977;   // cada um pisca e balança no seu tempo (pelo lugar na fila)
        if (m && m.passo && Math.floor(t / 220) % 2) quadro = 3;
        if ((t + fase) % 3700 < 140) quadro = 1;
        if (bal) sobe += Math.sin((t + fase) / 420) * bal;
      }
      if (J.sombra) J.sombra(p, Math.round(x), Math.round(y), 4);
      var spr = M.sprite(e.id, quadro);
      if (!spr) return;
      var pe = Math.round(y + 1 - sobe);
      p.sprite(espelhar ? espelho(spr) : spr, Math.round(x), pe);
      // o coração de amigo, logo acima do desenho (sobe e desce devagar com Animações; parado sem)
      p.sprite(coracao(), Math.round(x), pe - spr.height + topo - 2 + (animar ? Math.round(Math.sin(t / 300)) : 0));
    } };
  }

  // por cima de tudo: a estrelinha de cada ataque, o tiro dos outros bichinhos e a MonsterBall
  S.sobre = function (p, t, animar) {
    Object.keys(S.ataques || {}).forEach(function (id) {
      var a = S.ataques[id];
      if (a && t - a.em < PULO_MS) p.sprite(estrela(), Math.round(a.x), Math.round(a.y - 8));
    });
    var voo = animar ? cfg().ajuda.pets.vooMs : 0;
    Object.keys(S.tiros || {}).forEach(function (quem) {
      var a = S.tiros[quem], dt = a ? t - a.em : Infinity, et = quem === 'et';
      if (dt < 0 || dt >= voo + PULO_MS) return;
      if (dt < voo) {   // voando do pet até o inimigo
        var k = dt / voo;
        p.sprite(et ? raio() : estrelaArco(), Math.round(a.x0 + (a.x - a.x0) * k), Math.round(a.y0 + (a.y - 8 - a.y0) * k));
      } else p.sprite(et ? faiscaEt() : estrela(), Math.round(a.x), Math.round(a.y - 8));   // o acerto
    });
    var b = S.bola;
    if (!b) return;
    var c = cfg(), dt = Date.now() - b.em, img = b.super ? bolaSuper() : b.mini ? bolaMini() : bola();
    if (!b.chegou) {
      var k = animar ? Math.min(1, dt / c.bolaVooMs) : 1;
      var x = b.x0 + (b.x - b.x0) * k, y = b.y0 + (b.y - 4 - b.y0) * k - Math.sin(Math.PI * k) * SALTO_BOLA;
      p.sprite(img, Math.round(x), Math.round(y));
      if (b.super) brilhar(p, x, y, t, animar);
      return;
    }
    var resto = dt - c.bolaVooMs, fase = resto / c.bolaBalancoMs;
    var mexe = animar && fase < 0.75 ? Math.round(Math.sin(resto / 70) * 1.5) : 0;
    if (b.pegou || fase < 0.75) p.sprite(img, Math.round(b.x + mexe), Math.round(b.y + 1));
    if (b.super && fase < 0.6) brilhar(p, b.x, b.y + 1, t, animar);
    if (b.pegou && fase >= 0.6) {   // pegou: as estrelinhas em volta da bola
      for (var n = 0; n < 3; n++) {
        var ang = n * 2.0944 + (animar ? resto / 200 : 0);
        p.sprite(estrela(), Math.round(b.x + Math.cos(ang) * 9), Math.round(b.y - 6 + Math.sin(ang) * 4));
      }
    } else if (!b.pegou && fase >= 0.75) p.sprite(puf(), Math.round(b.x), Math.round(b.y));   // escapou: a bola abre num puf
  };
})();
