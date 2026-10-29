/* O Reino visto de cima: grade de tiles, lugares, caminhos (este arquivo) e o desenho em pixel art
   (mundo/mapa-desenho.js, mundo/lago.js, mundo/predios.js). Os lugares fixos são dados em
   mundo/lugares.js; os das matérias vêm de Reino.materias. Este é o primeiro arquivo de mundo/:
   cria window.Mapa e o Mapa._interno que as outras partes usam. */
(function () {
  var T = 16;               // tamanho do tile em pixels
  var W = 56, H = 42;       // tamanho do mapa em tiles (o traçado da cidade está em mundo/lugares.js)
  var Mapa = { T: T, W: W, H: H };
  // gerador pseudoaleatório com semente (o reino sai sempre igual): o de Reino.Desenho
  var rng = window.Reino.Desenho.rng;

  /* Estado e ajudantes compartilhados entre os arquivos de mundo/ (não é API do jogo).
     Mapa.criar troca as grades e a lista de lugares a cada chamada: leia sempre I.tipo etc. na hora
     de usar, nunca guarde a grade numa variável que dure mais que uma chamada. */
  var I = Mapa._interno = {
    tipo: [],               // letra do chão: 'g' grama, 'f' tapete de flores, 'c' rua, 'p' praça, 'a' água
    estilo: [],             // calçamento de cada tile de rua: 'pedra', 'ladrilho', 'terra' (Mapa.CIDADE.ruas)
    solido: [],             // true = não dá para andar
    tipoSorteio: [], decorSorteio: [],   // cópia do reino antes dos lugares novos: o sorteio das flores segue ela
    // enfeite do tile: 'arvore', 'flor', 'cristal', 'arbusto', 'cogumelo', 'pedra' (sorteados);
    // 'poste', 'banco', 'canteiro', 'cerca' (postos à mão: Mapa.CIDADE e a frente dos prédios);
    // 'frutifera', 'poco', 'correio', 'placa', 'pedrinhas' (Mapa.CIDADE.motivos)
    decor: [],
    objetos: [],            // peças grandes da praça (Mapa.CIDADE.objetos): fonte, coreto, canteiros
    lugares: [],            // os lugares desenhados no mapa (Mapa.lugares() junta os de dentro)
    lugaresDentro: [],      // matérias com lugar.dentro: só menu, sem desenho nem colisão
    estatico: null,         // canvas com tudo o que não se mexe (mundo/mapa-desenho.js)
    rng: rng,
    dentro: dentro,
    noRect: noRect,
  };

  function dentro(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
  function noRect(x, y, r) { return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h; }
  function porta(r) { return { x: r.x + Math.floor(r.w / 2), y: r.y + r.h - 1 }; }
  // peça da frente do prédio no tile fx: cerca dos dois lados do portão com o mesmo número de tiles; na largura par
  // sobra o tile da ponta esquerda, que vira um arbusto (sólido como a cerca: a pegada e o caminho não mudam; D2A-12)
  function pecaDaCerca(l, fx) { return l.rect.w % 2 === 0 && fx === l.rect.x ? 'arbusto' : 'cerca'; }

  // ids das matérias porCima que já estão no traçado de hoje: entram antes do sorteio dos enfeites, como os
  // lugares fixos. Matéria nova NÃO entra aqui: fica fora da cópia e não mexe nas flores do resto do reino.
  Mapa.LEGADO_SORTEIO = ['portugues', 'geografia', 'matematica'];

  Mapa.criar = function (materias) {
    var tipo = I.tipo = [], solido = I.solido = [], decor = I.decor = [], lugares = I.lugares = [], estilo = I.estilo = [];
    var reservado = [];
    for (var y = 0; y < H; y++) {
      tipo.push([]); solido.push([]); decor.push([]); reservado.push([]); estilo.push([]);
      for (var x = 0; x < W; x++) { tipo[y].push('g'); solido[y].push(false); decor[y].push(null); reservado[y].push(false); }
    }
    var CID = Mapa.CIDADE;
    I.objetos = CID.objetos;
    // lugares, na ordem de Mapa.lugares(); `novo` = entra depois da cópia do sorteio
    var fixo = function (f) { return Object.assign({ tipo: f.id, porta: porta(f.rect) }, f); };
    Mapa.LUGARES_FIXOS.forEach(function (f) { if (!f.caminho) lugares.push(fixo(f)); });
    // matéria com lugar.dentro mora num prédio que já existe: nada no mapa (entra no fim, em I.lugaresDentro)
    // e não conta na vez das clareiras, para as outras não mudarem de lugar
    // o telhado é a cor da matéria (docs/contratos/arte.md §22); parede e detalhe vêm do lugar
    function coresDe(m) { return Object.assign({}, m.lugar.cores, m.cor ? { telhado: m.cor } : {}); }
    var porCima = [], k = 0, deDentro = [];
    materias.forEach(function (m) {
      if (m.lugar.dentro) { deDentro.push(m); return; }
      var r = m.lugar.rect || Mapa.CLAREIRAS[k++ % Mapa.CLAREIRAS.length];
      var l = { id: 'materia:' + m.id, tipo: 'materia', materiaId: m.id, nome: m.lugar.nome,
        sprite: m.lugar.sprite || 'torre', cores: coresDe(m), rect: r, porta: porta(r), placa: m.lugar.placa,
        novidade: m.lugar.novidade };
      if (m.lugar.porCima) { l.novo = Mapa.LEGADO_SORTEIO.indexOf(m.id) < 0; porCima.push(l); } else lugares.push(l);
    });
    porCima.forEach(function (l) { lugares.push(l); });
    Mapa.LUGARES_FIXOS.forEach(function (f) { if (f.caminho) lugares.push(fixo(f)); });
    var hoje = lugares.filter(function (l) { return !l.novo; });

    function pintar(x, y, t) { if (dentro(x, y)) tipo[y][x] = t; }
    function pintarRect(r, t) { for (var yy = r.y; yy < r.y + r.h; yy++) for (var xx = r.x; xx < r.x + r.w; xx++) pintar(xx, yy, t); }
    CID.ruas.forEach(function (r) {
      pintarRect(r, 'c');
      for (var yy = r.y; yy < r.y + r.h; yy++) for (var xx = r.x; xx < r.x + r.w; xx++) if (dentro(xx, yy)) estilo[yy][xx] = r.estilo || 'pedra';
    });
    pintarRect(CID.praca, 'p');
    // lago: dá para nadar nele (a Mariana e a montaria), então a água não é sólida
    var L = CID.lago;
    for (var ly = 1; ly < H - 1; ly++) for (var lx = 1; lx < W - 1; lx++) {
      var dx = (lx + 0.5 - L.cx) / L.rx, dy = (ly + 0.5 - L.cy) / L.ry;
      if (dx * dx + dy * dy <= 1) tipo[ly][lx] = 'a';
    }
    // clareiras livres ganham um tapete de flores
    Mapa.CLAREIRAS.forEach(function (r) {
      var ocupada = lugares.some(function (l) { return l.rect.x === r.x && l.rect.y === r.y; });
      if (ocupada) return;
      for (var yy = r.y; yy < r.y + r.h; yy++) for (var xx = r.x; xx < r.x + r.w; xx++) {
        var ddx = (xx + 0.5 - (r.x + r.w / 2)) / (r.w / 2), ddy = (yy + 0.5 - (r.y + r.h / 2)) / (r.h / 2);
        if (ddx * ddx + ddy * ddy <= 1.05) tipo[yy][xx] = 'f';
      }
    });
    // terreno reservado: grama lisa, nada sorteado nele nem no caminho dele
    (Mapa.RESERVADOS || []).forEach(function (rs) {
      for (var yy = rs.rect.y; yy < rs.rect.y + rs.rect.h; yy++) for (var xx = rs.rect.x; xx < rs.rect.x + rs.rect.w; xx++) reservado[yy][xx] = true;
      rs.caminho.forEach(function (p) { reservado[p[1]][p[0]] = true; });
    });

    // o terreno do lugar (sólido, menos a porta) e a ligação da frente da porta até a rua
    function assentar(l) {
      var r = l.rect;
      for (var yy = r.y; yy < r.y + r.h; yy++) for (var xx = r.x; xx < r.x + r.w; xx++) {
        decor[yy][xx] = null;
        tipo[yy][xx] = 'g';
        solido[yy][xx] = !(xx === l.porta.x && yy === l.porta.y);
      }
      var cam = l.caminho || ligacao(l.porta);
      cam.forEach(function (p) {
        decor[p[1]][p[0]] = null; tipo[p[1]][p[0]] = 'c'; solido[p[1]][p[0]] = false;
        if (!estilo[p[1]][p[0]]) estilo[p[1]][p[0]] = 'ladrilho';
      });
    }
    // da frente da porta descendo reto até a primeira rua ou praça (no máximo 8 tiles)
    function ligacao(p) {
      var cam = [];
      for (var yy = p.y + 1; yy < H - 1 && cam.length < 8; yy++) {
        if (tipo[yy][p.x] === 'c' || tipo[yy][p.x] === 'p') return cam;
        cam.push([p.x, yy]);
      }
      return [];
    }
    hoje.forEach(assentar);
    // peças grandes da praça e o Claude: sólidos, sem enfeite (o validador os vê como terreno)
    CID.objetos.forEach(function (o) {
      for (var yy = o.y; yy < o.y + o.h; yy++) for (var xx = o.x; xx < o.x + o.w; xx++) solido[yy][xx] = true;
    });
    solido[Mapa.claudeTile.y][Mapa.claudeTile.x] = true;

    // enfeites postos à mão: só em tile de chão livre, fora de prédio e de terreno reservado
    function por(t, x, y) {
      if (!dentro(x, y) || solido[y][x] || reservado[y][x] || decor[y][x]) return;
      if (tipo[y][x] === 'c' || tipo[y][x] === 'a') return;
      if (lugares.some(function (l) { return noRect(x, y, l.rect); })) return;
      decor[y][x] = t; solido[y][x] = true;
    }
    CID.enfeites.forEach(function (e) { por(e[0], e[1], e[2]); });
    // cerquinha na frente de cada prédio de hoje (o castelo tem a alameda), com o portão na porta
    hoje.forEach(function (l) {
      if (l.tipo === 'castelo') return;
      var fy = l.rect.y + l.rect.h;
      for (var fx = l.rect.x; fx < l.rect.x + l.rect.w; fx++) if (fx !== l.porta.x) por(pecaDaCerca(l, fx), fx, fy);
    });

    // bordas de árvores, bosques e enfeites sorteados
    var r = rng(20260923);
    // enfeite posto à mão que sobe para o tile de cima (poste, banco, canteiro, cerca): nada sorteado atrás dele
    var ALTO = { poste: true, banco: true, canteiro: true, cerca: true };
    function livreParaEnfeite(x, y) {
      if (tipo[y][x] !== 'g' || solido[y][x] || decor[y][x] || reservado[y][x]) return false;
      if (y + 1 < H && ALTO[decor[y + 1][x]]) return false;
      for (var j = -1; j <= 1; j++) for (var i = -1; i <= 1; i++) {
        var nx = x + i, ny = y + j;
        if (!dentro(nx, ny)) continue;
        if (tipo[ny][nx] === 'c' || tipo[ny][nx] === 'p' || tipo[ny][nx] === 'f' || reservado[ny][nx]) return false;
        if (lugares.some(function (l) { return !l.novo && noRect(nx, ny, l.rect); })) return false;
      }
      return true;
    }
    function pertoDaAgua(x, y) {
      for (var j = -1; j <= 1; j++) for (var i = -1; i <= 1; i++) {
        var nx = x + i, ny = y + j;
        if (dentro(nx, ny) && tipo[ny][nx] === 'a') return true;
      }
      return false;
    }
    for (var by = 0; by < H; by++) for (var bx = 0; bx < W; bx++) {
      var borda = bx === 0 || by === 0 || bx === W - 1 || by === H - 1;
      if (borda) { decor[by][bx] = 'arvore'; solido[by][bx] = true; continue; }
      if (!livreParaEnfeite(bx, by)) {
        if (tipo[by][bx] === 'g' && !solido[by][bx] && !decor[by][bx] && !reservado[by][bx] && r() < 0.18) decor[by][bx] = 'flor';
        continue;
      }
      // bosque: as duas faixas junto da borda ficam cheias de árvores
      var bosque = bx <= 2 || by <= 2 || bx >= W - 3 || by >= H - 2;
      var v = r();
      if (bosque) {
        if (v < 0.62) { decor[by][bx] = 'arvore'; solido[by][bx] = true; }
        else if (v < 0.70) { decor[by][bx] = 'arbusto'; solido[by][bx] = true; }
        else if (v < 0.90) decor[by][bx] = 'flor';
        continue;
      }
      if (v < 0.07) { decor[by][bx] = 'arvore'; solido[by][bx] = true; }
      else if (v < 0.085) { decor[by][bx] = 'cristal'; solido[by][bx] = true; }
      else if (v < 0.11) { decor[by][bx] = 'arbusto'; solido[by][bx] = true; }
      else if (v < 0.125) { decor[by][bx] = 'pedra'; solido[by][bx] = true; }
      else if (v < 0.36) decor[by][bx] = 'flor';
      else if (v < 0.40 && !pertoDaAgua(bx, by)) decor[by][bx] = 'cogumelo';
    }
    // cópia do reino de hoje: o Mapa.prerender tira os sorteios das flores dela, para um lugar novo
    // não mudar as flores longe dele (contrato cena-e-motor.md §9)
    I.tipoSorteio = tipo.map(function (l) { return l.slice(); });
    I.decorSorteio = decor.map(function (l) { return l.slice(); });
    // motivos postos à mão nos campos vazios (Mapa.CIDADE.motivos): depois da cópia, para não mexer no sorteio das
    // árvores e flores do resto; só em chão livre (tiram a flor do tile). 'pedrinhas' é chão: dá para pisar
    (CID.motivos || []).forEach(function (e) {
      var mx = e[1], my = e[2];
      if (!dentro(mx, my) || solido[my][mx] || reservado[my][mx] || tipo[my][mx] !== 'g') return;
      if (lugares.some(function (l) { return noRect(mx, my, l.rect); })) return;
      decor[my][mx] = e[0]; solido[my][mx] = e[0] !== 'pedrinhas';
    });
    // lugares novos, por cima do reino já enfeitado (tiram só o enfeite do próprio terreno e do caminho):
    // matérias porCima de fora do legado e os registrados pelos prédios (Reino.registrarLugar), na ordem de registro
    lugares.forEach(function (l) { if (l.novo) assentar(l); });
    (Reino.lugaresRegistrados || []).forEach(function (f) {
      if (!f.caminho) return;
      var l = fixo(f);
      lugares.push(l);
      assentar(l);
      // no terreno reservado para ele (Mapa.RESERVADOS) ou pedida no registro (cerca: true), a mesma cerquinha dos
      // prédios de hoje, com o portão na porta (depois do sorteio: só mexe na fileira da frente dele)
      if (!l.cerca && !(Mapa.RESERVADOS || []).some(function (res) { return res.id === l.id; })) return;
      var fy = l.rect.y + l.rect.h;
      for (var fx = l.rect.x; fx < l.rect.x + l.rect.w; fx++) {
        if (fx === l.porta.x || !dentro(fx, fy) || tipo[fy][fx] !== 'g' || solido[fy][fx]) continue;
        decor[fy][fx] = pecaDaCerca(l, fx); solido[fy][fx] = true;
      }
    });
    lugares.forEach(function (l) { delete l.novo; });
    // matérias dentro de um prédio: só para o menu Lugares, com a porta (e a área) do anfitrião;
    // não desenham nem fazem colisão (ficam fora de I.lugares)
    I.lugaresDentro = [];
    deDentro.forEach(function (m) {
      var h = lugares.find(function (l) { return l.id === m.lugar.dentro; });
      if (!h) return;   // anfitrião inexistente: o validador acusa
      I.lugaresDentro.push({ id: 'materia:' + m.id, tipo: 'materia', materiaId: m.id, nome: m.lugar.nome,
        dentro: h.id, interior: m.lugar.interior, rect: h.rect, porta: h.porta,
        andar: m.lugar.andar, anfitriaoNome: h.nome, novidade: m.lugar.novidade });
    });
    I.estatico = null;
  };

  // todos os lugares (os do mapa e, no fim, as matérias de dentro de um prédio)
  Mapa.lugares = function () { return I.lugares.concat(I.lugaresDentro || []); };
  Mapa.lugar = function (id) { return Mapa.lugares().find(function (l) { return l.id === id; }); };
  Mapa.solido = function (x, y) { return !dentro(x, y) || I.solido[y][x]; };
  Mapa.lugarNoTile = function (x, y) { return I.lugares.find(function (l) { return noRect(x, y, l.rect); }); };
  Mapa.portaEm = function (x, y) { return I.lugares.find(function (l) { return l.porta.x === x && l.porta.y === y; }); };
  Mapa.largura = function () { return W * T; };
  Mapa.altura = function () { return H * T; };

  // menor caminho de tiles de a até b, em 8 direções (lista sem o tile inicial).
  // Na diagonal só passa se os dois vizinhos retos estiverem livres (não corta quina).
  var VIZINHOS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
  // Destino em terra: primeiro procura um caminho que não entra na água (o lago como sólido);
  // só se não houver nenhum (ex.: ela está no meio do lago) procura de novo nadando.
  // Destino na água (ou a volta a nado): cada passo que entra na água custa config.nado.custo vezes mais.
  Mapa.caminho = function (a, b) {
    if (!dentro(b.x, b.y)) return null;
    if (I.tipo[b.y][b.x] !== 'a') {
      var seco = buscar(a, b, true);
      if (seco) return seco;
    }
    return buscar(a, b, false);
  };
  function buscar(a, b, semAgua) {
    var tipo = I.tipo, solido = I.solido;
    var nado = (window.Reino && Reino.config && Reino.config.nado) || {};
    var custoAgua = nado.custo > 0 ? nado.custo : 3;
    var chave = function (x, y) { return y * W + x; };
    var custo = {}, veio = {}, fechado = {};
    var ini = chave(a.x, a.y), fim = chave(b.x, b.y);
    custo[ini] = 0; veio[ini] = -1;
    var abertos = [ini];
    while (abertos.length) {
      // o aberto de menor custo (o mapa é pequeno, uma busca simples basta)
      var mi = 0;
      for (var i = 1; i < abertos.length; i++) if (custo[abertos[i]] < custo[abertos[mi]]) mi = i;
      var k = abertos[mi];
      abertos[mi] = abertos[abertos.length - 1]; abertos.pop();
      if (fechado[k]) continue;
      fechado[k] = true;
      if (k === fim) break;
      var cx = k % W, cy = Math.floor(k / W);
      VIZINHOS.forEach(function (d) {
        var nx = cx + d[0], ny = cy + d[1];
        if (!dentro(nx, ny) || solido[ny][nx]) return;
        if (semAgua && tipo[ny][nx] === 'a') return;
        if (d[0] && d[1] && (solido[cy][nx] || solido[ny][cx])) return;
        // de terra para terra na diagonal, também não corta a quina da água (não molha o pé à toa)
        if (d[0] && d[1] && tipo[cy][cx] !== 'a' && tipo[ny][nx] !== 'a' && (tipo[cy][nx] === 'a' || tipo[ny][cx] === 'a')) return;
        var nk = chave(nx, ny), c = custo[k] + d[2] * (tipo[ny][nx] === 'a' ? custoAgua : 1);
        if (fechado[nk] || (nk in custo && custo[nk] <= c)) return;
        custo[nk] = c; veio[nk] = k;
        abertos.push(nk);
      });
    }
    if (!fechado[fim]) return null;
    var cam = [], k2 = fim;
    while (veio[k2] !== -1) { cam.unshift({ x: k2 % W, y: Math.floor(k2 / W) }); k2 = veio[k2]; }
    return cam;
  }

  // tile andável mais perto de (x, y)
  // tocou num tile de terra sólido (árvore, arbusto): prefere terra; água só se não houver terra perto
  Mapa.maisPerto = function (x, y, de) {
    var solido = I.solido;
    function procurar(aceitaAgua, raio) {
      var melhor = null, dist = 1e9, rMax = raio === undefined ? 3 : raio;
      for (var r = 0; r <= rMax; r++) for (var j = -r; j <= r; j++) for (var i = -r; i <= r; i++) {
        var nx = x + i, ny = y + j;
        if (!dentro(nx, ny) || solido[ny][nx]) continue;
        if (!aceitaAgua && Mapa.agua(nx, ny)) continue;
        var d = Math.abs(nx - de.x) + Math.abs(ny - de.y) + (Math.abs(i) + Math.abs(j)) * 3;
        if (d < dist) { dist = d; melhor = { x: nx, y: ny }; }
      }
      return melhor;
    }
    // tocou em terra (arbusto, casa): prefere um tile de terra, para ela não atravessar o lago nadando;
    // se ela já está nadando: terra encostada no que foi tocado, senão a água em volta (senão ela
    // nadaria de lado até a margem para chegar a uma árvore cercada de água)
    if (Mapa.agua(x, y)) return procurar(true);
    if (de && Mapa.agua(de.x, de.y)) return procurar(false, 1) || procurar(true);
    return procurar(false) || procurar(true);
  };

  window.Mapa = Mapa;
})();
