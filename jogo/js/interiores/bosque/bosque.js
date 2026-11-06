/* Bosque dos Fantasmas: o interior de céu aberto (lugar 'bosque'; docs/contratos/bosque.md).
   Fixos (contrato): id 'bosque', 56 × 44 tiles, cômodo { x: 1, y: 1, w: 54, h: 40 } (chão nas fileiras 3 a 40), saída
   (28, 40) (o portal de volta, desenhado pelo fundo), spawn (28, 39), fundo 'bosque' (fundo.js), pacote 'interior-bosque'.
   O layout sai de uma semente (Reino.Desenho.rng): sempre igual. Zonas pelas fileiras (config.fantasmas.zonas):
   fáceis 27-38 (a mais aberta), médias 15-26, difíceis 3-14; a zona segura de 4 tiles em volta do spawn não tem sólido.
   Ordem: fixos com fala → enfeites das clareiras → mata em volta e bosquezinhos → fecha bolsões que ela não alcança →
   mato e flores onde ainda sobra janela 3×3 vazia (a regra do "rico", sem `corredores`). Objetos em objetos*.js. */
(function () {
  var R = window.Reino, I = R.Interiores, B = (R._predios = R._predios || {}).bosque = R._predios.bosque || {};
  var F = ((R.FALAS_INTERIORES || {}).bosque || {}).objetos || {};
  var W = 56, H = 44, X0 = 1, X1 = 54, Y0 = 3, Y1 = 40, SPAWN = { x: 28, y: 39 }, SAIDA = { x: 28, y: 40 };
  var rnd = R.Desenho.rng(20261105);
  function sorteio(n) { return Math.floor(rnd() * n); }
  function escolha(lista) { return lista[sorteio(lista.length)]; }

  var objetos = [], occ = [], sol = [], reservado = [], semAlto = [], x, y;
  for (y = 0; y < H; y++) {
    occ.push([]); sol.push([]); reservado.push([]); semAlto.push([]);
    for (x = 0; x < W; x++) { occ[y].push(false); sol[y].push(false); reservado[y].push(false); semAlto[y].push(false); }
  }
  function chao(x, y) { return x >= X0 && x <= X1 && y >= Y0 && y <= Y1; }
  var CF = R.config.fantasmas, SEG = CF.zonaSegura + 1;   // sólido fica 1 tile além da zona segura dos fantasmas
  function seguro(x, y, m) { return Math.abs(x - SPAWN.x) <= m && Math.abs(y - SPAWN.y) <= m; }
  // clareiras: [cx, cy, raio] sem árvore (as mágicas ganham um anel de fadas no meio)
  var CLAREIRAS = [[28, 37, 5.5], [13, 32, 4], [45, 31, 4], [38, 36, 3], [13, 22, 4.5], [44, 20, 4.5], [28, 23, 3.5], [14, 9, 4], [42, 9, 4], [28, 6, 3.5]];
  function emClareira(x, y) { return CLAREIRAS.some(function (c) { return (x - c[0]) * (x - c[0]) + (y - c[1]) * (y - c[1]) <= c[2] * c[2]; }); }
  function zona(y) { return y >= CF.zonas.facil[0] ? 'facil' : y >= CF.zonas.medio[0] ? 'medio' : 'dificil'; }

  function dimensoes(tipo) { var l = I.OBJETOS[tipo] || {}; return { w: l.w || 1, h: l.h || 1, s: l.solido === undefined ? 'base' : l.solido }; }
  // o que a copa cobre: só árvore pode ficar sob outra árvore (mata); lanterna, cogumelo, tronco e pedra ficam à vista.
  // quem[y][x]: 1 = árvore, 2 = outro objeto que conta para a validação; cobre[y][x]: 1 = copa de árvore, 2 = de outro alto
  var ARVORES = { 'bosque-arvore': 1, 'bosque-arvore-p': 1, 'bosque-pinheiro': 1, 'bosque-arvore-velha': 1 }, quem = [], cobre = [];
  for (y = 0; y < H; y++) { quem.push([]); cobre.push([]); for (x = 0; x < W; x++) { quem[y].push(0); cobre[y].push(0); } }
  function conta(tipo) { var l = I.OBJETOS[tipo] || {}; return l.solido !== false || !!l.topo; }
  function linhasAcima(tipo) { var t = (I.OBJETOS[tipo] || {}).topo || 0, n = 0; while (t > 16 * n + 8) n++; return n; }
  function livre(tipo, x, y) {
    var d = dimensoes(tipo), alto = (I.OBJETOS[tipo] || {}).alto, arv = ARVORES[tipo], n = linhasAcima(tipo), cnt = conta(tipo);
    for (var j = 0; j < d.h; j++) for (var i = 0; i < d.w; i++) {
      if (!chao(x + i, y + j) || occ[y + j][x + i] || reservado[y + j][x + i]) return false;
      if (alto && semAlto[y + j][x + i]) return false;
      if (d.s !== false && (seguro(x + i, y + j, SEG) || B.trilha(x + i, y + j) || emClareira(x + i, y + j))) return false;
      if (cnt && (cobre[y + j][x + i] === 2 || (cobre[y + j][x + i] === 1 && !arv))) return false;
    }
    for (i = 0; i < d.w; i++) for (var k = 1; k <= n && y - k >= 0; k++) {
      var q = quem[y - k][x + i];
      if (q && !(arv && q === 1)) return false;
    }
    return true;
  }
  // põe um objeto (`ex`: nome, fala, var…); marca o que ele ocupa e o que é sólido
  function poe(tipo, x, y, ex) {
    var d = dimensoes(tipo), o = { tipo: tipo, x: x, y: y };
    Object.keys(ex || {}).forEach(function (k) { o[k] = ex[k]; });
    objetos.push(o);
    for (var j = 0; j < d.h; j++) for (var i = 0; i < d.w; i++) {
      if (!chao(x + i, y + j)) continue;
      occ[y + j][x + i] = true;
      if (conta(tipo)) quem[y + j][x + i] = ARVORES[tipo] ? 1 : 2;
      if (d.s === true || (d.s === 'base' && j === d.h - 1)) sol[y + j][x + i] = true;
    }
    for (i = 0; i < d.w; i++) for (var k = 1; k <= linhasAcima(tipo) && y - k >= 0; k++) cobre[y - k][x + i] = ARVORES[tipo] && cobre[y - k][x + i] !== 2 ? 1 : 2;
    return o;
  }
  function tenta(tipo, x, y, ex) { if (!livre(tipo, x, y)) return false; poe(tipo, x, y, ex); return true; }
  function copa() { var c = corDaCopa(); return c ? { var: c } : null; }
  function corDaCopa() { var r = rnd(); return r < 0.08 ? { cor: 'rosa' } : r < 0.14 ? { cor: 'lilas' } : null; }
  function arvore(tipo, x, y) { return tenta(tipo, x, y, copa()); }

  // 1. os fixos com fala (a halo de 1 tile em volta fica sem sólido, para ela chegar perto; objeto alto não nasce
  //    nos 3 tiles ao sul nem em volta, para a copa não cobrir o que se toca)
  function fixo(tipo, x, y, nome, chave) {
    var d = dimensoes(tipo);
    for (var q = -2; q <= d.h + 3; q++) for (var p = -2; p <= d.w + 1; p++) if (chao(x + p, y + q)) semAlto[y + q][x + p] = true;
    for (var j = -1; j <= d.h; j++) for (var i = -1; i <= d.w; i++) if (chao(x + i, y + j)) reservado[y + j][x + i] = true;
    poe('bosque-' + tipo, x, y, { nome: nome, fala: F[chave] || [] });
  }
  [['placa', 34, 36, 'Placa', 'placa'], ['lanterna', 23, 36, 'Lanterna', 'lanterna'],
    ['cogumelo', 42, 29, 'Cogumelo', 'cogumelo'], ['arvore-velha', 11, 25, 'Árvore velha', 'arvore-velha'],
    // portal da Cidade Nova, no centro-direita (docs/contratos/cidade-nova.md)
    ['portal-cidade', 43, 21, 'Portal da Cidade Nova', 'portal-cidade']].forEach(function (f) { fixo(f[0], f[1], f[2], f[3], f[4]); });
  // a ação mora no objeto DA CENA (o `fixo` só copia nome e fala): sem ela o portal não abre a Cidade Nova
  objetos.forEach(function (o) { if (o.tipo === 'bosque-portal-cidade') o.acao = { tipo: 'portalCidade', para: 'cidade' }; });
  poe('bosque-cogumelo', 43, 29, { var: { n: 2 } });   // o cogumelo falante tem um vizinho azul

  // 2. as clareiras: anel de fadas no meio das mágicas, cogumelos na borda das outras, poças e lanternas na trilha
  [[13, 22], [44, 20], [14, 9], [42, 9], [28, 6]].forEach(function (c, i) { poe('bosque-anel-fadas', c[0] - 1, c[1] - 1, null); if (i > 1) poe('bosque-cogumelos', c[0] - 3, c[1] + 2, { var: { n: i } }); });
  poe('bosque-poca', 11, 33); poe('bosque-poca', 27, 22);
  // cogumelos que brilham na borda das clareiras (logo fora do raio, onde o sólido pode ficar)
  [[18, 32], [8, 31], [40, 31], [49, 33], [41, 38], [35, 34], [20, 28], [36, 26], [9, 24], [18, 22], [49, 22], [39, 10], [17, 12], [11, 6], [33, 5]].forEach(function (c, i) { tenta('bosque-cogumelo', c[0], c[1], { var: { n: i } }); });
  // lanternas ao lado da trilha principal, da saída ao fundo do bosque
  [[22, 33], [34, 33], [32, 28], [24, 27], [33, 23], [26, 19], [33, 18], [24, 15], [30, 9], [33, 5]].forEach(function (c) { tenta('bosque-lanterna', c[0], c[1]); });

  // 3. a mata: duas fileiras de árvores nas bordas e o fundo (embaixo, com a saída aberta) …
  for (y = Y0; y <= Y1; y++) { arvore('bosque-arvore', 1, y); arvore('bosque-arvore', 53, y); }
  for (x = 3; x <= 52; x++) if (!seguro(x, 40, SEG)) tenta(x % 3 ? 'bosque-arbusto' : 'bosque-arvore-p', x, 40, x % 3 ? null : copa());
  // … e os bosquezinhos: probabilidade = base da zona + o quanto está perto do miolo de um bosquezinho [cx, cy, raio]
  var BASE = { facil: 0.025, medio: 0.07, dificil: 0.11 };
  var BOSQUES = [[8, 36, 4], [48, 37, 4], [20, 29, 3], [38, 28, 3], [8, 18, 5], [22, 19, 4], [37, 24, 4], [49, 15, 5], [34, 16, 3],
    [8, 6, 5], [21, 4, 4], [36, 4, 4], [49, 6, 5], [21, 11, 4], [36, 12, 4], [7, 12, 3], [49, 11, 3]];
  function bonus(x, y) { var m = 0; BOSQUES.forEach(function (b) { m = Math.max(m, 1 - Math.sqrt((x - b[0]) * (x - b[0]) + (y - b[1]) * (y - b[1])) / b[2]); }); return Math.max(0, m); }
  for (y = Y0; y < Y1; y++) for (x = 3; x <= 52; x++) {
    var b = bonus(x, y);
    if (occ[y][x] || rnd() > BASE[zona(y)] + b * 0.55) continue;
    var r = rnd();
    if (r < 0.28) arvore('bosque-arvore', x, y) || arvore('bosque-arvore-p', x, y);
    else if (r < 0.5) arvore('bosque-arvore-p', x, y);
    else if (r < 0.68) tenta('bosque-pinheiro', x, y);
    else if (r < 0.86) tenta('bosque-arbusto', x, y, copa());
    else tenta(escolha(['bosque-pedra', 'bosque-toco', 'bosque-tronco']), x, y);
  }

  // 4. bolsões: chão livre que ela não alcança (cercado de árvores) vira arbusto, pedra ou toco (sob uma copa, só arbusto)
  var alc = [];
  for (y = 0; y < H; y++) { alc.push([]); for (x = 0; x < W; x++) alc[y].push(false); }
  var fila = [[SPAWN.x, SPAWN.y]]; alc[SPAWN.y][SPAWN.x] = true;
  while (fila.length) {
    var p = fila.pop();
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
      var nx = p[0] + d[0], ny = p[1] + d[1];
      if (chao(nx, ny) && !sol[ny][nx] && !alc[ny][nx]) { alc[ny][nx] = true; fila.push([nx, ny]); }
    });
  }
  for (y = Y0; y <= Y1; y++) for (x = X0; x <= X1; x++) if (!sol[y][x] && !alc[y][x]) {
    if (occ[y][x]) { sol[y][x] = true; continue; }   // sob a copa de uma árvore: o tile de trás já é só enfeite
    if (cobre[y][x]) { poe('bosque-arbusto', x, y, copa()); quem[y][x] = 3; continue; }
    var v = sorteio(6);   // bolsão à vista: arbusto, pedra ou toco, para não virar uma grade de arbustos iguais
    poe(v < 3 ? 'bosque-arbusto' : v < 5 ? 'bosque-pedra' : 'bosque-toco', x, y, v < 3 ? copa() : null);   // arbusto de bolsão sob a copa: faz parte da mata
  }

  // 5. mato e flores (não sólidos) em toda janela 3×3 que ainda estiver vazia; no fundo do bosque, mais luz mágica
  var COMUM = ['bosque-mato', 'bosque-mato', 'bosque-mato', 'bosque-flores', 'bosque-flores', 'bosque-margaridas', 'bosque-trevo', 'bosque-samambaia'];
  var MAGICO = ['bosque-cogumelos', 'bosque-flor-brilho', 'bosque-vagalumes', 'bosque-flores', 'bosque-mato', 'bosque-samambaia'];
  for (y = Y0; y + 3 <= Y1 + 1; y++) for (x = X0; x + 3 <= X1 + 1; x++) {
    var vazia = true, j, i;
    for (j = 0; j < 3; j++) for (i = 0; i < 3; i++) if (occ[y + j][x + i] || (x + i === SAIDA.x && y + j === SAIDA.y)) vazia = false;
    if (!vazia) continue;
    var c = null;
    for (var k = 0; k < 9 && !c; k++) { var t = { x: x + sorteio(3), y: y + sorteio(3) }; if (!B.trilha(t.x, t.y) && !seguro(t.x, t.y, 0)) c = t; }
    if (!c) c = { x: x + 1, y: y + 1 };
    var tipo = B.trilha(c.x, c.y) ? 'bosque-pedrinhas' : escolha(c.y < 20 || rnd() < 0.15 ? MAGICO : COMUM);
    poe(tipo, c.x, c.y, tipo === 'bosque-flores' || tipo === 'bosque-cogumelos' ? { var: { n: sorteio(5) } } : null);
  }

  // árvore sobre árvore (ou sobre o arbusto que tampa um bolsão) é mata: só essas levam `junto` (o aviso de "alto cobrindo" não vale para elas)
  objetos.forEach(function (o) {
    if (!ARVORES[o.tipo]) return;
    var d = dimensoes(o.tipo), n = linhasAcima(o.tipo);
    for (var i = 0; i < d.w; i++) for (var k = 1; k <= n && o.y - k >= 0; k++) if (quem[o.y - k][o.x + i] === 1 || quem[o.y - k][o.x + i] === 3) o.junto = true;
  });

  var COMODO = { id: 'bosque', nome: 'Bosque dos Fantasmas', rect: { x: 1, y: 1, w: 54, h: 40 }, piso: 'bosque-grama', parede: 'bosque-copas' };
  // a primeira arena (motor/interiores-arena.js; docs/contratos/arenas.md): os números são os de config.fantasmas
  R.registrarArena({ id: 'bosque', nome: 'Bosque dos Fantasmas', curto: 'Bosque', emoji: '👻' });
  R.registrarInterior({
    id: 'bosque',
    lugar: 'bosque',
    nome: 'Bosque dos Fantasmas',
    entrada: true,
    pacote: 'interior-bosque',
    fundo: 'bosque',
    tamanho: { w: W, h: H },
    saida: SAIDA,
    spawn: SPAWN,
    comodos: [COMODO],
    objetos: objetos,
  });
})();
