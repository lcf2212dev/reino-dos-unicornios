/* Bosque dos Fantasmas e as outras arenas: o combate (Reino.BosqueCombate, módulo 'bosque-combate'; docs/contratos/bosque.md
   §5 §7, arenas.md, itens.md §9). Vale em toda arena (Reino.registrarArena), com os números dela (Reino.Arenas.cfg); um
   estado por arena (S.estados[id]), o de agora em S.estado. Sem `atualizar` no laço: a simulação avança em
   camada.itensDesenho (dt do `t`, até 50 ms) e congela com a cena bloqueada (íris, diálogo, desmaio) ou tela aberta.
   Inimigos por zona (config.fantasmas: quantos, zonas, zonaSegura): flutuam, vagam, perseguem dentro da `visao`, presos
   pela `coleira`, nunca na zona segura; no modo congelado (e2e), parados no ninho. O passo é PURO (passo(estado, dt,
   jogador) só mexe no estado; eventos em estado.eventos, emitidos por fora): testável no Node; sorteios com Reino.Desenho.rng.
   Interno Reino._bosqueCombate (com bosque-desenho.js e bosque-alvo.js): { estado, estados: { arena: estado }, grades: {
   arena: grade }, arena (id de agora), naCena(), desenho: { itens(p, t, animar), sobre(p, t, animar) }, desmaio: { desde } |
   null, t (do quadro), vencidoEm: { id ou 'arena:id': Date.now() }, quadro(est, j) (ataque por alvo, depois do passo),
   olharX/olharY (o olhar do corpo deste quadro) }; partes: bosque-alvo, -desenho, -combate-monstros. node: true: nada de DOM, Progresso nem Cena ao carregar. */
(function () {
  var R = window.Reino;
  var S = R._bosqueCombate = { estado: null, estados: {}, grades: {}, arena: null, desenho: null, desmaio: null, t: 0,
    vencidoEm: {}, olharX: 0, olharY: 1 };
  var CENA = 'bosque', OCUPACAO = 'bosque-desmaio', T = 16;
  var SEMENTE = 20261105;
  var ATIVOS = { vagando: 1, perseguindo: 1, voltando: 1, recuando: 1 };   // os que andam, tocam e levam golpe
  var VOAM = { mosca: 1, voador: 1 };   // passam por cima da água (os do chão contornam: arenas.md §4)
  var CONTROLES = 'button, a[href], [role="button"], input, select, textarea, [contenteditable="true"]';
  var VAZIO = [];
  function cfg() { return R.config.fantasmas; }
  // os números da arena (o Bosque: config.fantasmas)
  function cfgDe(id) { return R.Arenas ? R.Arenas.cfg(id) : cfg(); }

  /* ================= PURO (sem Cena, sem DOM) ================= */
  function evento(est, carga) { est.eventos.push(carga); }
  function dist(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
  function dentro(r, x, y) { return x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1; }
  function embaralhar(lista, rng) {
    for (var i = lista.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = lista[i]; lista[i] = lista[j]; lista[j] = x; }
  }
  // espalha os ninhos: primeiro longe dos outros (6 tiles), depois mais perto, até ter quantos
  function escolher(lista, quantos, casas) {
    var feitos = [], minimos = [6, 4, 2, 0];
    for (var m = 0; m < minimos.length && feitos.length < quantos; m++) {
      for (var i = 0; i < lista.length && feitos.length < quantos; i++) {
        var tl = lista[i], ok = feitos.indexOf(tl) < 0;
        for (var k = 0; ok && k < casas.length; k++) ok = Math.max(Math.abs(casas[k][0] - tl[0]), Math.abs(casas[k][1] - tl[1])) >= minimos[m];
        if (ok) { feitos.push(tl); casas.push(tl); }
      }
    }
    return feitos;
  }

  /* mapa = { comodo: { x, y, w, h } (tiles), spawn: { x, y }, solido(tx, ty), agua?(tx, ty) }; c = os números da arena
     (os tipos de c.tipos, na ordem). Nascem em tile livre da zona do tipo, fora da zona segura e (os do chão) da água,
     sempre nos mesmos lugares (semente). */
  function novoEstado(mapa, c, semente) {
    c = c || cfg();
    semente = semente === undefined ? SEMENTE : semente;
    var rng = R.Desenho.rng(semente), cm = mapa.comodo, sp = mapa.spawn, zs = c.zonaSegura, cj = c.jogador;
    var est = { cfg: c, t: 0, vida: cj.vidaBase, max: cj.vidaBase, maxPontos: cj.vidaBase, invencivelAte: 0, regenEm: 0, curaDe: 0, curaSobra: 0, recargaAte: 0,
      golpe: null, desmaiado: false, parados: false, eventos: [], fantasmas: [],
      limites: { x0: cm.x * T + 4, y0: cm.y * T + 12, x1: (cm.x + cm.w) * T - 4, y1: (cm.y + cm.h) * T },
      segura: { x0: (sp.x - zs) * T, y0: (sp.y - zs) * T, x1: (sp.x + zs + 1) * T, y1: (sp.y + zs + 1) * T },
      agua: typeof mapa.agua === 'function' ? mapa.agua : null };
    var b = c.raioToque + 1, Z = est.segura;
    est.barreira = { x0: Z.x0 - b, y0: Z.y0 - b, x1: Z.x1 + b, y1: Z.y1 + b };
    var casas = [], n = 0;
    Object.keys(c.tipos).forEach(function (tipo) {
      var quantos = (c.quantos && c.quantos[tipo]) || 0, z = c.zonas[tipo], lista = [], x, y;
      if (!quantos || !z) return;
      for (y = Math.max(z[0], cm.y); y <= Math.min(z[1], cm.y + cm.h - 1); y++) {
        for (x = cm.x; x < cm.x + cm.w; x++) {
          if (mapa.solido(x, y) || dentro(est.barreira, x * T + T / 2, y * T + 12) || (est.agua && !VOAM[tipo] && est.agua(x, y))) continue;
          lista.push([x, y]);
        }
      }
      embaralhar(lista, rng);
      escolher(lista, quantos, casas).forEach(function (tl) {
        n++;
        var tp = c.tipos[tipo], cx = tl[0] * T + T / 2, cy = tl[1] * T + 12;
        est.fantasmas.push({ id: 'f' + n, tipo: tipo, casaX: cx, casaY: cy, x: cx, y: cy, vida: tp.vida, max: tp.vida,
          estado: 'vagando', ate: 0, pausa: false, alvoX: cx, alvoY: cy, dx: 0, dy: 1, olhar: 1, feridoAte: 0,
          fase: Math.floor(rng() * 4000), rng: R.Desenho.rng(semente + n * 7919) });
      });
    });
    return est;
  }

  // anda até (x, y) com v px/s; devolve se chegou
  function ir(f, x, y, v, s) {
    var dx = x - f.x, dy = y - f.y, d = Math.sqrt(dx * dx + dy * dy), p = v * s;
    if (Math.abs(dx) > 0.2) f.olhar = dx < 0 ? -1 : 1;
    if (d <= p || d < 0.01) { f.x = x; f.y = y; return true; }
    f.x += dx / d * p; f.y += dy / d * p;
    return false;
  }
  function recuar(est, f, j) {
    var dx = f.x - j.x, dy = f.y - j.y, d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.5) { dx = 0; dy = -1; d = 1; }
    f.dx = dx / d; f.dy = dy / d;
    f.estado = 'recuando'; f.ate = est.t + est.cfg.recuoMs;
  }
  // fora do cômodo não sai; na zona segura não entra: fica a mais de raioToque da borda dela (a barreira), para o
  // toque nunca chegar a quem está lá dentro (empurrado pela borda mais perto)
  function prender(est, f) {
    var L = est.limites, Z = est.barreira;
    f.x = Math.max(L.x0, Math.min(L.x1, f.x)); f.y = Math.max(L.y0, Math.min(L.y1, f.y));
    if (!dentro(Z, f.x, f.y)) return;
    var e = f.x - Z.x0, d = Z.x1 - f.x, c = f.y - Z.y0, b = Z.y1 - f.y, m = Math.min(e, d, c, b);
    if (m === e) f.x = Z.x0 - 0.01; else if (m === d) f.x = Z.x1; else if (m === c) f.y = Z.y0 - 0.01; else f.y = Z.y1;
  }
  // inimigo do chão não entra na água: desliza pela margem (um eixo de cada vez) e, vagando, desiste do alvo
  function naAgua(est, x, y) { return est.agua(Math.floor(x / T), Math.floor(y / T)); }
  function secar(est, f, x0, y0) {
    if (!est.agua || VOAM[f.tipo] || !naAgua(est, f.x, f.y)) return;
    if (!naAgua(est, f.x, y0)) f.y = y0;
    else if (!naAgua(est, x0, f.y)) f.x = x0;
    else { f.x = x0; f.y = y0; }
    if (f.estado === 'vagando' && !f.pausa) { f.pausa = true; f.ate = est.t + 300; }
    // voltando para casa e a lagoa no meio: desiste e vagueia (senão trava ou escorrega sem fim na margem)
    else if (f.estado === 'voltando') { f.estado = 'vagando'; f.pausa = true; f.ate = est.t + 300; }
  }
  function vagar(est, f, v, s) {
    var t = est.t;
    if (!f.pausa) { if (ir(f, f.alvoX, f.alvoY, v * 0.5, s)) { f.pausa = true; f.ate = t + 500 + f.rng() * 1500; } return; }
    if (t < f.ate) return;
    var raio = Math.min(est.cfg.coleira * 0.5, 48), a = f.rng() * 6.2832, r = raio * (0.3 + 0.7 * f.rng());
    f.alvoX = f.casaX + Math.cos(a) * r; f.alvoY = f.casaY + Math.sin(a) * r;
    f.pausa = false;
  }
  // o que o toque tira: a Proteção vestida corta defesaPorPonto por ponto, até defesaMax, e nunca menos de 1 (itens.md §9)
  function toque(forca, defesa) {
    var ci = R.config.itens, corte = defesa > 0 && ci ? Math.min(ci.defesaMax, defesa * ci.defesaPorPonto) : 0;
    return Math.max(1, Math.round(forca * (1 - corte))); }
  function levarToque(est, f, j) {
    var c = est.cfg, t = est.t;
    est.vida = Math.max(0, est.vida - toque(c.tipos[f.tipo].forca, j.defesa));
    est.invencivelAte = t + c.jogador.invencivelMs;
    est.regenEm = est.curaDe = t + c.jogador.regenSemDanoMs; est.curaSobra = 0;
    evento(est, { tipo: 'vida', n: est.vida, max: est.max });
    if (est.vida <= 0) { est.desmaiado = true; evento(est, { tipo: 'desmaio' }); }
    recuar(est, f, j);
  }
  function moverFantasma(est, f, s, j) {
    var c = est.cfg, t = est.t, v = c.tipos[f.tipo].velocidade, F = f.estado;
    if (F === 'vencido' || F === 'preso') return;   // preso: a MonsterBall voando até ele (bosque-combate-monstros.js)
    if (F === 'sumindo') {
      if (t >= f.ate) { f.estado = 'vencido'; evento(est, est.arena ? { tipo: 'vencido', id: f.id, fantasma: f.tipo, arena: est.arena } : { tipo: 'vencido', id: f.id, fantasma: f.tipo }); }
      return;
    }
    if (F === 'esperando') {
      // volta depois de voltaMs, mas não em cima dela (espera ela se afastar do ninho)
      if (t >= f.ate && dist(j.x, j.y, f.casaX, f.casaY) > c.visao) {
        f.x = f.casaX; f.y = f.casaY; f.vida = f.max; f.estado = 'surgindo'; f.ate = t + c.vencidoMs; f.pausa = false;
        f.alvoX = f.casaX; f.alvoY = f.casaY;
      }
      return;
    }
    if (F === 'surgindo') { if (t >= f.ate) f.estado = 'vagando'; return; }
    var x0 = f.x, y0 = f.y;
    if (F === 'recuando') {
      // empurrão que perde força até o fim do recuo
      var forca = Math.max(v * 1.5, 30) * s * Math.max(0, f.ate - t) / c.recuoMs;
      if (!est.parados) { f.x += f.dx * forca; f.y += f.dy * forca; }
      if (t >= f.ate) { f.estado = 'vagando'; f.pausa = true; f.ate = t + 400; }
      prender(est, f); secar(est, f, x0, y0);
      return;
    }
    var dCasa = dist(f.x, f.y, f.casaX, f.casaY), dJog = dist(f.x, f.y, j.x, j.y), naSegura = dentro(est.segura, j.x, j.y);
    if (!est.parados) {
      if (F === 'voltando') { if (ir(f, f.casaX, f.casaY, v, s) || dCasa < c.coleira / 2) { f.estado = 'vagando'; f.pausa = true; f.ate = t + 300; } }
      else if (dCasa >= c.coleira) f.estado = 'voltando';
      else if (dJog <= c.visao && !naSegura) { f.estado = 'perseguindo'; ir(f, j.x, j.y, v, s); }
      else {
        if (F === 'perseguindo') { f.estado = 'vagando'; f.pausa = true; f.ate = t + 600; }
        vagar(est, f, v, s);
      }
      prender(est, f); secar(est, f, x0, y0);
      dJog = dist(f.x, f.y, j.x, j.y);
    }
    // encostou nela: tira vida (fora do tempo invencível) e recua; invencível, só recua (não fica em cima dela)
    if (dJog <= c.raioToque && f.estado !== 'voltando') {
      if (t >= est.invencivelAte) levarToque(est, f, j); else recuar(est, f, j);
    }
  }
  // j.vidaMax = pontos + itens (j.vidaItens). Ponto em Vida já vem cheio; roupa não cura (itens.md §9): só o teto muda
  function ajustarMax(est, j) {
    var m = j.vidaMax || est.cfg.jogador.vidaBase, mp = m - (j.vidaItens || 0);
    if (m === est.max && mp === est.maxPontos) return;
    if (mp > est.maxPontos) est.vida += mp - est.maxPontos;
    est.maxPontos = mp; est.max = m; est.vida = Math.min(est.vida, m);
    evento(est, { tipo: 'vida', n: est.vida, max: est.max });
  }

  /* jogador = { x, y (pés, px do jogo), olharX, olharY, vidaMax?, vidaItens?, defesa?, dano?, recargaMs?, regen? }; dt em
     ms (no máximo 50). regen = fração da vida máxima curada por segundo (os pontos em Vida), depois de regenSemDanoMs
     sem toque, somada ao 1 a cada regenACadaMs; recargaMs = a espera entre golpes (os pontos em Velocidade) */
  function passo(est, dt, j) {
    dt = Math.max(0, Math.min(50, dt || 0));
    est.t += dt;
    ajustarMax(est, j);
    if (est.desmaiado) return est;
    var cj = est.cfg.jogador, s = dt / 1000;
    if (est.golpe && est.t - est.golpe.em >= cj.golpeMs) est.golpe = null;
    var curou = false;
    if (est.vida < est.max && est.t >= est.regenEm) { est.vida++; est.regenEm = est.t + cj.regenACadaMs; curou = true; }
    if (est.vida < est.max && j.regen > 0 && est.t >= est.curaDe) {
      est.curaSobra += est.max * j.regen * s;
      var n = Math.floor(est.curaSobra);
      if (n > 0) { est.curaSobra -= n; est.vida = Math.min(est.max, est.vida + n); curou = true; }
    }
    if (est.vida >= est.max) est.curaSobra = 0;
    if (curou) evento(est, { tipo: 'vida', n: est.vida, max: est.max });
    for (var i = 0; i < est.fantasmas.length && !est.desmaiado; i++) moverFantasma(est, est.fantasmas[i], s, j);
    return est;
  }

  /* golpe da espada: acerta quem está no alcance, na frente dela (ou encostado, de qualquer lado). → bool (golpeou) */
  function golpear(est, j) {
    var c = est.cfg, cj = c.jogador, t = est.t;
    if (est.desmaiado || t < est.recargaAte) return false;
    var ox = j.olharX || 0, oy = j.olharY || 0, n = Math.sqrt(ox * ox + oy * oy);
    if (n < 0.01) { ox = 0; oy = 1; } else { ox /= n; oy /= n; }
    est.recargaAte = t + (j.recargaMs || cj.recargaMs);
    est.golpe = { em: t, dx: ox, dy: oy };
    var dano = j.dano || cj.danoBase, acertou = 0;
    for (var i = 0; i < est.fantasmas.length; i++) {
      var f = est.fantasmas[i];
      if (!ATIVOS[f.estado]) continue;
      var vx = f.x - j.x, vy = f.y - j.y, d = Math.sqrt(vx * vx + vy * vy);
      if (d > cj.alcance || (d > c.raioToque && vx * ox + vy * oy < 0)) continue;
      f.vida = Math.max(0, f.vida - dano); f.feridoAte = t + 160; acertou++;
      if (f.vida <= 0) { f.estado = 'sumindo'; f.ate = t + c.vencidoMs; } else recuar(est, f, j);
    }
    evento(est, { tipo: 'golpe', acertou: acertou });
    return true;
  }

  /* vida cheia, um tempinho invencível e os fantasmas soltos de volta ao ninho (os vencidos seguem esperando) */
  function reiniciarEstado(est) {
    est.vida = est.max; est.desmaiado = false; est.golpe = null; est.recargaAte = 0;
    est.invencivelAte = est.t + est.cfg.jogador.invencivelMs; est.regenEm = est.curaDe = est.t; est.curaSobra = 0;
    est.fantasmas.forEach(function (f) {
      if (!ATIVOS[f.estado] && f.estado !== 'surgindo' && f.estado !== 'preso') return;   // preso: a MonsterBall (monstros.md)
      f.x = f.alvoX = f.casaX; f.y = f.alvoY = f.casaY; f.vida = f.max; f.estado = 'vagando'; f.pausa = true; f.ate = est.t + 600;
    });
    evento(est, { tipo: 'vida', n: est.vida, max: est.max });
  }
  // poção: soma n à vida, até a máxima (null desmaiada)
  function curarNo(est, n) {
    var antes = est.vida;
    if (est.desmaiado) return null;
    est.vida = Math.min(est.max, est.vida + Math.max(0, Math.round(n) || 0));
    evento(est, { tipo: 'vida', n: est.vida, max: est.max });
    return { antes: antes, depois: est.vida };
  }
  function devolverNo(est, id) {
    var f = est.fantasmas.filter(function (x) { return x.id === id; })[0];
    if (!f || (f.estado !== 'vencido' && f.estado !== 'sumindo')) return false;
    f.estado = 'esperando'; f.ate = est.t + est.cfg.voltaMs;
    return true;
  }

  /* ================= NO JOGO ================= */
  // a cena de agora, se for uma arena (sem o registro de arenas, só o Bosque)
  function naCena() {
    var c = R.Cena && R.Cena.atual && R.Cena.atual();
    if (!c) return null;
    return (R.Arenas ? R.Arenas.daCena(c) : c.id === CENA ? CENA : null) ? c : null;
  }
  S.naCena = naCena;
  function temTela() { return !!(R.UI && R.UI.temTela && R.UI.temTela()); }
  function bloqueado() { return !!(R.Cena && R.Cena.bloqueado && R.Cena.bloqueado()) || temTela(); }
  function vidaMax() { var B = R.Bosque; return B && B.vidaMax ? B.vidaMax() : cfg().jogador.vidaBase; }
  function dano() { var B = R.Bosque; return B && B.dano ? B.dano() : cfg().jogador.danoBase; }
  function temEspada() { var B = R.Bosque; return B && B.temEspada ? !!B.temEspada() : true; }
  function bonus() { var B = R.Bosque; return B && B.bonus ? B.bonus() : { vida: 0, defesa: 0 }; }
  function recargaMs() { var B = R.Bosque; return B && B.recargaMs ? B.recargaMs() : cfg().jogador.recargaMs; }
  function regen() { var B = R.Bosque; return B && B.regenPorSegundo ? B.regenPorSegundo() : 0; }
  // o jogador do passo (um só, reaproveitado); vida, dano, Proteção, recarga e cura relidos nos eventos BOSQUE e ITENS e ao entrar
  var JOG = { x: 0, y: 0, olharX: 0, olharY: 1, vidaMax: 0, vidaItens: 0, defesa: 0, dano: 0, recargaMs: 0, regen: 0 }, lidos = false;
  function lerValores() {
    var b = bonus(); JOG.vidaMax = vidaMax(); JOG.vidaItens = b.vida; JOG.defesa = b.defesa; JOG.dano = dano();
    JOG.recargaMs = recargaMs(); JOG.regen = regen(); lidos = true;
  }
  function jogador() {
    var J = window.Jogador;
    if (!lidos) lerValores();
    JOG.x = J.x; JOG.y = J.y; JOG.olharX = J.olharX; JOG.olharY = J.olharY;
    return JOG;
  }
  // a caixa de todos os cômodos do interior (em tiles)
  function caixa(def) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    (def.comodos || []).forEach(function (c) {
      var r = c.rect; x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h);
    });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  // o estado da arena da cena (um por arena, refeito quando a grade da cena muda)
  function garantir(cena) {
    var id = cena.id, est = S.estados[id];
    S.arena = id;
    if (est && S.grades[id] === cena.grade) return (S.estado = est);
    S.grades[id] = cena.grade;
    var def = cena.def || R.Interiores.def(id);
    est = S.estados[id] = S.estado = novoEstado({ comodo: caixa(def), spawn: def.spawn, solido: cena.solido, agua: cena.agua }, cfgDe(id));
    est.arena = id;
    est.parados = !!R.congelado;
    lerValores();
    est.vida = est.max = JOG.vidaMax; est.maxPontos = JOG.vidaMax - JOG.vidaItens;
    return est;
  }
  // a chave do vencido em S.vencidoEm: o id no Bosque; '<arena>:<id>' nas outras (os ids f<n> se repetem entre arenas)
  function chaveVencido(arena, id) { return !arena || arena === CENA ? id : arena + ':' + id; }
  function emitir(est) {
    if (!est.eventos.length) return;
    var lista = est.eventos.splice(0, est.eventos.length);
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].tipo === 'desmaio') desmaiar();
      if (lista[i].tipo === 'vencido') S.vencidoEm[chaveVencido(est.arena, lista[i].id)] = Date.now();
      if (R.util && R.util.emit) R.util.emit(R.EVENTOS.BOSQUE, lista[i]);
    }
  }

  /* desmaio: cena ocupada com estrelinhas, o Claude fala, volta ao começo da arena e a vida enche (nada se perde) */
  function desmaiar() {
    if (S.desmaio) return;
    S.desmaio = { desde: S.t };
    var C = R.Cena, F = R.BosqueFalas, arena = S.arena || CENA, fala = F && F.de ? F.de('desmaio', arena) : F && F.desmaio;
    if (C && C.ocupar) C.ocupar(OCUPACAO);
    if (fala && R.Claude && R.Claude.falar) R.Claude.falar(fala.join(' '), { fala: fala.slice(), voz: 'claude' });
    setTimeout(function () {
      var def = R.Interiores && R.Interiores.def(arena), sp = def && def.spawn;
      var pr = C && C.irPara ? C.irPara(arena, sp ? { x: sp.x, y: sp.y } : null, { x: 0, y: -1 }) : null;
      Promise.resolve(pr).catch(function (e) { console.error(e); }).then(function () {
        API.reiniciar();
        S.desmaio = null;
        if (C && C.liberar) C.liberar(OCUPACAO);
      });
    }, cfg().desmaioMs);
  }

  /* proteção: vencido há mais de vencidoPresoMs sem devolver (a pergunta não abriu) volta a esperar a hora de voltar */
  function soltarPresos(est) {
    var agora = Date.now(), limite = est.cfg.vencidoPresoMs;
    est.fantasmas.forEach(function (f) {
      var em = S.vencidoEm[chaveVencido(est.arena, f.id)];
      if (f.estado === 'vencido' && (em === undefined || agora - em > limite)) devolverNo(est, f.id);
    });
  }

  var ultimoT = null;
  var camada = {
    ativo: function () { return !!window.Jogador && !!naCena(); },
    itensDesenho: function (p, t, animar) {
      var cena = naCena();
      if (!cena) return VAZIO;
      var est = garantir(cena), dt = ultimoT === null ? 0 : t - ultimoT;
      ultimoT = t; S.t = t;
      // o olhar com que o corpo dela foi escolhido neste quadro (o S.quadro pode virá-la depois): a espada usa este
      S.olharX = window.Jogador.olharX; S.olharY = window.Jogador.olharY;
      if (!bloqueado()) { passo(est, dt, jogador()); if (S.quadro) S.quadro(est, JOG); emitir(est); }
      return S.desenho ? S.desenho.itens(p, t, animar) : VAZIO;
    },
    sobre: function (ctx, p, t, animar) { if (S.desenho) S.desenho.sobre(p, t, animar); },
  };

  // Espaço/Enter atacam só numa arena, sem bloqueio nem tela, com o foco fora de controle e sem alvo perto (entrada.js)
  var ligado = false;
  function ligar() {
    if (ligado) return;
    ligado = true;
    if (typeof document !== 'undefined') document.addEventListener('keydown', function (e) {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      if (!naCena() || bloqueado()) return;
      var foco = document.activeElement;
      if (e.target && e.target.closest && e.target.closest(CONTROLES)) return;
      if (foco && foco !== document.body && foco.closest && foco.closest(CONTROLES)) return;
      var J = window.Jogador, cena = R.Cena.atual();
      if (cena.alvoPerto && cena.alvoPerto(J.tile(), { x: J.olharX, y: J.olharY })) return;
      e.preventDefault();
      API.atacar();
    });
    // entrou numa arena vindo de fora: valores relidos, vida cheia, inimigos no ninho e os vencidos presos soltos
    R.util.on(R.EVENTOS.CENA, function (m) {
      ultimoT = null;
      var ehArena = m && (R.Arenas ? !!R.Arenas.def(m.para) : m.para === CENA);
      if (!ehArena || m.de === m.para) return;
      lidos = false;
      var est = S.estados[m.para];
      if (!est) return;
      S.estado = est; S.arena = m.para;
      lerValores(); est.max = JOG.vidaMax; est.maxPontos = JOG.vidaMax - JOG.vidaItens;   // entra com a vida cheia
      soltarPresos(est);
      reiniciarEstado(est);
      emitir(est);
    });
    R.util.on(R.EVENTOS.BOSQUE, function (e) { if (e && (e.tipo === 'ponto' || e.tipo === 'acerto')) lidos = false; });
    if (R.EVENTOS.ITENS) R.util.on(R.EVENTOS.ITENS, function () { lidos = false; });
  }

  var API = R.BosqueCombate = {
    ativo: function () { return camada.ativo(); },
    vida: function () { var e = S.estado; if (!e) { var m = vidaMax(); return { n: m, max: m }; } return { n: e.vida, max: e.max }; },
    atacar: function () {
      var cena = naCena();
      if (!cena || !window.Jogador || bloqueado() || !temEspada()) return false;
      var est = garantir(cena), ok = golpear(est, jogador());
      emitir(est);
      return ok;
    },
    fantasmas: function () {
      return S.estado ? S.estado.fantasmas.map(function (f) {
        return { id: f.id, tipo: f.tipo, x: Math.round(f.x), y: Math.round(f.y), vida: f.vida, max: f.max, estado: f.estado };
      }) : [];
    },
    // a UI chama depois da pergunta do inimigo vencido: ele volta ao ninho depois de voltaMs (arena: a dele; padrão a de agora)
    devolver: function (id, arena) { var e = arena ? S.estados[arena] : S.estado; return !!e && devolverNo(e, id); },
    arena: function () { return naCena() ? S.arena : null; },
    reiniciar: function () { if (S.estado) { reiniciarEstado(S.estado); emitir(S.estado); } },
    // poção (itens.md §9): na arena de agora, até a máxima; null fora dela ou desmaiada
    curar: function (n) { var e = naCena() && !S.desmaio ? S.estado : null, r = e && curarNo(e, n); if (r) emitir(e); return r || null; },
    // puros (testes no Node e ferramentas)
    novoEstado: novoEstado, passo: passo, golpear: golpear, reiniciarEstado: reiniciarEstado, devolverNo: devolverNo,
    curarNo: curarNo, toque: toque, temEspada: temEspada,
  };

  R.registrarModulo({
    id: 'bosque-combate',
    iniciar: ligar,
    depurar: function () {
      var e = S.estado;
      return { ativo: camada.ativo(), arena: API.arena(), vida: API.vida(), t: e ? Math.round(e.t) : 0, parados: !!(e && e.parados),
        desmaio: !!S.desmaio, golpe: !!(e && e.golpe), fantasmas: API.fantasmas() };
    },
    camada: camada,
  });
})();
