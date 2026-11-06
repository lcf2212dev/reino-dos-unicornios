/* Vila Arco-Íris, a vila por fora (docs/contratos/vila.md §2): id 'vila', 40 × 32 tiles, um cômodo
   { x: 1, y: 1, w: 38, h: 30 } (chão nas fileiras 3 a 30), céu aberto (fundo 'vila', fundo.js), spawn (20, 28), parte do
   Bosque (lugar 'bosque', entrada: false, pacote 'interior-bosque'). Sem saída: entra e sai pelo portal (20, 29).
   No alto, as 4 fachadas das lojas (a porta é a escada `portal` na fileira 8: x = 6, 15, 24, 33); a rua das lojas
   (fileiras 8–9), a avenida do portal até ela (x 19–21) e a travessa da praça (fileira 19) são `corredores`. No meio,
   a praça com a fonte e uma Teleportadora (o objeto 'vila-teleportadora' é de vila/teleportadora.js); embaixo, a
   entrada com o portal de volta e a outra Teleportadora; dos lados, os 3 terrenos livres cercados, com placa.
   Ordem: fixos → árvores das bordas e moitas de baixo → flores onde ainda sobra janela 3×3 vazia (a regra do "rico"),
   pela mesma semente (Reino.Desenho.rng): o layout sai sempre igual. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, V = R._predios.vila;
  var F = ((R.FALAS_INTERIORES || {}).vila || {}).objetos || {};
  var W = 40, H = 32, X0 = 1, X1 = 38, Y0 = 3, Y1 = 30, SPAWN = { x: 20, y: 28 }, PORTAL = { x: 20, y: 29 };
  var LOJAS = [['casa', 6], ['armas', 15], ['cabecas', 24], ['armaduras', 33]];   // [loja, x da porta]
  var rnd = R.Desenho.rng(20261106);
  var objetos = [], occ = [], x, y;
  for (y = 0; y < H; y++) { occ.push([]); for (x = 0; x < W; x++) occ[y].push(false); }
  function dim(tipo, ex) { var l = I.OBJETOS[tipo] || {}; return { w: (ex && ex.w) || l.w || 1, h: (ex && ex.h) || l.h || 1 }; }
  function poe(tipo, x, y, ex) {
    var d = dim(tipo, ex), o = { tipo: tipo, x: x, y: y };
    Object.keys(ex || {}).forEach(function (k) { o[k] = ex[k]; });
    objetos.push(o);
    for (var j = 0; j < d.h; j++) for (var i = 0; i < d.w; i++) if (occ[y + j] && x + i < W) occ[y + j][x + i] = true;
    return o;
  }
  function fala(chave, nome) { return { nome: nome, fala: F[chave] || [] }; }
  var ESCADAS = [];
  function escada(e) { ESCADAS.push(e); occ[e.y][e.x] = true; }

  // 1. as lojas: fachada 7 × 5 (porta no meio) e a escada `portal` logo abaixo da porta
  LOJAS.forEach(function (l) {
    poe('vila-fachada-' + l[0], l[1] - 3, 3);
    escada({ x: l[1], y: 8, para: 'vila-' + l[0], sentido: 'portal', chegar: { x: 0, y: 1 } });
  });
  // entre as fachadas: árvore floridas atrás e poste na beira da rua
  [1, 10, 19, 28, 37].forEach(function (gx, i) {
    poe('vila-arvore', gx, 4, { var: { n: i } });
    poe(i % 2 ? 'vila-poste' : 'vila-arvore', gx + 1, i % 2 ? 7 : 6, i % 2 ? null : { var: { n: i + 3 } });
  });
  // beira de baixo da rua: postes e canteiros
  [[3, 10], [11, 10], [27, 10], [35, 10]].forEach(function (c) { poe('vila-poste', c[0], c[1]); });
  [[6, 10], [14, 10], [23, 10], [31, 10]].forEach(function (c) { poe('vila-canteiro', c[0], c[1]); });

  // 2. a praça: fonte, bancos, canteiros, postes com bandeirolas e a Teleportadora
  poe('vila-fonte', 19, 16, fala('fonte', 'Fonte arco-íris'));
  poe('banco', 15, 17, { var: { cor: '#ff9ed2' } }); poe('banco', 24, 17, { var: { cor: '#9ed2ff' } });
  poe('vila-canteiro', 15, 15); poe('vila-canteiro', 24, 15);
  poe('vila-canteiro', 15, 21); poe('vila-canteiro', 24, 21);
  [[17, 13], [23, 13], [17, 23], [23, 23]].forEach(function (c) { poe('vila-poste', c[0], c[1]); });
  poe('vila-bandeirolas', 18, 13); poe('vila-bandeirolas', 18, 23);
  poe('vila-teleportadora', 22, 20, { w: 2, h: 1, solido: true, nome: 'Teleportadora', acao: { tipo: 'teleportadora', para: 'cidade' } });

  // 3. os terrenos livres (cercados) com a placa na frente
  [[3, 12, 6, 5, 9, 16], [31, 12, 6, 5, 30, 16], [3, 22, 6, 5, 9, 26]].forEach(function (t) {
    poe('vila-terreno', t[0], t[1], { w: t[2], h: t[3] });
    poe('vila-placa-terreno', t[4], t[5], fala('terreno', 'Terreno livre'));
  });

  // 4. a entrada: o portal de volta, a placa de boas-vindas, a Teleportadora, o poço e o carrinho de flores
  poe('vila-portal', PORTAL.x, PORTAL.y);
  escada({ x: PORTAL.x, y: PORTAL.y, para: 'bosque', sentido: 'portal', seta: false, chegar: { x: 0, y: -1 } });
  poe('vila-placa', 17, 27, fala('placa', 'Placa'));
  poe('vila-teleportadora', 23, 27, { w: 2, h: 1, solido: true, nome: 'Teleportadora', acao: { tipo: 'teleportadora', para: 'cidade' } });
  poe('vila-poco', 33, 24, fala('poco', 'Poço dos desejos'));
  poe('vila-carrinho', 27, 25);
  poe('vila-canteiro', 13, 25); poe('vila-canteiro', 26, 29);
  poe('vila-poste', 18, 29); poe('vila-poste', 22, 29);

  // 5. árvores nas bordas e moitas na fileira de baixo (o portal fica aberto)
  for (y = 12; y <= 28; y += 3) { poe('vila-arvore', 1, y, { var: { n: y } }); poe('vila-arvore', 38, y, { var: { n: y + 2 } }); }
  for (x = 1; x <= 38; x++) if (Math.abs(x - PORTAL.x) > 2 && !occ[30][x]) poe(x % 4 ? 'bosque-arbusto' : 'vila-arvore', x, 30, x % 4 ? null : { var: { n: x } });

  // 6. flores e mato (não sólidos) em toda janela 3×3 de chão que ainda estiver vazia (fora das ruas, se der)
  var MIUDOS = ['bosque-flores', 'bosque-margaridas', 'bosque-trevo', 'bosque-flores', 'bosque-mato'];
  function sorteio(n) { return Math.floor(rnd() * n); }
  var CORREDORES = [{ x: 1, y: 8, w: 38, h: 2 }, { x: 19, y: 10, w: 3, h: 21 }, { x: 9, y: 19, w: 23, h: 1 }];
  function noCorredor(tx, ty) { return CORREDORES.some(function (r) { return tx >= r.x && ty >= r.y && tx < r.x + r.w && ty < r.y + r.h; }); }
  for (y = Y0; y + 2 <= Y1; y++) for (x = X0; x + 2 <= X1; x++) {
    var vazia = true, corr = false, j, i;
    for (j = 0; j < 3; j++) for (i = 0; i < 3; i++) { if (occ[y + j][x + i]) vazia = false; if (noCorredor(x + i, y + j)) corr = true; }
    if (!vazia || corr) continue;
    var c = null;
    for (var k = 0; k < 12 && !c; k++) {
      var t = { x: x + sorteio(3), y: y + sorteio(3) };
      if (!V.rua(t.x, t.y) && !V.praca(t.x, t.y) && !(t.x === SPAWN.x && t.y === SPAWN.y)) c = t;
    }
    if (!c) c = { x: x + 1, y: y + 1 };
    var tipo = MIUDOS[sorteio(MIUDOS.length)];
    poe(tipo, c.x, c.y, tipo === 'bosque-flores' ? { var: { n: sorteio(5) } } : null);
  }

  R.registrarInterior({
    id: 'vila',
    lugar: 'bosque',
    nome: 'Vila Arco-Íris',
    entrada: false,
    pacote: 'interior-bosque',
    fundo: 'vila',
    tamanho: { w: W, h: H },
    spawn: SPAWN,
    comodos: [{ id: 'vila', nome: 'Vila Arco-Íris', rect: { x: 1, y: 1, w: 38, h: 30 }, piso: 'vila-grama', parede: 'vila-colinas' }],
    corredores: CORREDORES,
    escadas: ESCADAS,
    objetos: objetos,
  });
})();
