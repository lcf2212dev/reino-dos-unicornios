/* Parquinho, parte 4: o interior de céu aberto (lugar 'parquinho'; docs/contratos/parquinho.md).
   Fixos: id 'parquinho', 28 × 20 tiles, um cômodo { x: 1, y: 1, w: 26, h: 17 } (chão nas fileiras 3 a 17), saída
   (14, 17) (o portal de volta, desenhado pelo fundo), spawn (14, 16), fundo 'parquinho' (fundo.js), sem falas próprias
   (pacote 'geral': nada novo para gravar). A trilha de areia (P.trilha) sobe do portal e cruza o parque na fileira 7–8.
   À esquerda, os brinquedos da fase 1 (balanço, escorregador, caixa de areia, gangorra); à direita, os da fase 2
   (carrossel, pula-pula, tanque de bolinhas), presentes embrulhados até ela completar todas as matérias.
   Ordem: brinquedos e enfeites fixos → árvores e moitas da borda → mato e flores onde ainda sobra janela 3×3 vazia
   (a regra do "rico"), sempre pela mesma semente (Reino.Desenho.rng): o layout sai igual. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, P = R._predios.parquinho;
  var W = 28, H = 20, X0 = 1, X1 = 26, Y0 = 3, Y1 = 17, SPAWN = { x: 14, y: 16 }, SAIDA = { x: 14, y: 17 };
  var rnd = R.Desenho.rng(20261105 + 7);
  var objetos = [], occ = [], x, y;
  for (y = 0; y < H; y++) { occ.push([]); for (x = 0; x < W; x++) occ[y].push(false); }
  function dim(tipo) { var l = I.OBJETOS[tipo] || {}; return { w: l.w || 1, h: l.h || 1 }; }
  function chao(x, y) { return x >= X0 && x <= X1 && y >= Y0 && y <= Y1; }
  function poe(tipo, x, y, ex) {
    var d = dim(tipo), o = { tipo: tipo, x: x, y: y };
    Object.keys(ex || {}).forEach(function (k) { o[k] = ex[k]; });
    objetos.push(o);
    for (var j = 0; j < d.h; j++) for (var i = 0; i < d.w; i++) if (occ[y + j] && x + i < W) occ[y + j][x + i] = true;
    return o;
  }
  function brincar(id, surpresa) { var a = { tipo: 'parquinhoBrincar', brinquedo: id }; if (surpresa) a.surpresa = true; return a; }

  // 1. os brinquedos (a ação abre a brincadeira; os da fase 2 mostram a surpresa até ela completar tudo)
  poe('parquinho-balanco', 3, 4, { nome: 'Balanço', acao: brincar('balanco') });
  poe('parquinho-escorregador', 8, 4, { nome: 'Escorregador', acao: brincar('escorregador') });
  poe('parquinho-areia', 3, 10, { nome: 'Caixa de areia', acao: brincar('areia') });
  poe('parquinho-gangorra', 7, 11, { nome: 'Gangorra', acao: brincar('gangorra') });
  poe('parquinho-carrossel', 17, 3, { nome: 'Carrossel', acao: brincar('carrossel', true) });
  poe('parquinho-pulapula', 22, 4, { nome: 'Pula-pula', acao: brincar('pulapula', true) });
  poe('parquinho-bolinhas', 19, 10, { nome: 'Tanque de bolinhas', acao: brincar('bolinhas', true) });

  // 2. enfeites fixos: placa na entrada, postes, bancos, lixeiras, canteiros, bola, amarelinha, bebedouro e bandeirinhas
  poe('parquinho-placa', 12, 15);
  [[11, 10], [17, 13], [2, 9], [25, 9]].forEach(function (c) { poe('parquinho-poste', c[0], c[1]); });
  poe('banco', 3, 14, { var: { cor: '#e0a868' } }); poe('banco', 22, 14, { var: { cor: '#e0a868' } });
  poe('parquinho-lixeira', 5, 14); poe('parquinho-lixeira', 21, 14);
  poe('parquinho-canteiro', 8, 15); poe('parquinho-canteiro', 18, 15);
  poe('parquinho-bola', 7, 9); poe('parquinho-bola', 23, 12);
  poe('parquinho-amarelinha', 16, 10);
  poe('bebedouro', 25, 11);
  [2, 7, 11, 23].forEach(function (bx) { poe('bandeirinhas', bx, 1, { parede: true }); });

  // 3. árvores nos cantos e moitas na fileira de baixo (com o portal de volta aberto)
  poe('bosque-arvore', 25, 3); poe('bosque-arvore-p', 1, 3); poe('bosque-arvore-p', 1, 12);
  poe('bosque-arvore-p', 26, 15); poe('bosque-arvore-p', 1, 17);
  for (x = 2; x <= 26; x++) if (Math.abs(x - SAIDA.x) > 2 && !occ[17][x]) poe([3, 6, 21, 24].indexOf(x) < 0 ? 'bosque-arbusto' : 'bosque-arvore-p', x, 17);

  // 4. mato e flores (não sólidos) em toda janela 3×3 de chão que ainda estiver vazia
  var MIUDOS = ['bosque-flores', 'bosque-margaridas', 'bosque-mato', 'bosque-trevo', 'bosque-flores', 'bosque-mato'];
  function sorteio(n) { return Math.floor(rnd() * n); }
  for (y = Y0; y + 2 <= Y1; y++) for (x = X0; x + 2 <= X1; x++) {
    var vazia = true, j, i;
    for (j = 0; j < 3; j++) for (i = 0; i < 3; i++) if (occ[y + j][x + i] || (x + i === SAIDA.x && y + j === SAIDA.y)) vazia = false;
    if (!vazia) continue;
    var c = null;
    for (var k = 0; k < 9 && !c; k++) {
      var t = { x: x + sorteio(3), y: y + sorteio(3) };
      if (chao(t.x, t.y) && !P.trilha(t.x, t.y) && !(t.x === SPAWN.x && t.y === SPAWN.y)) c = t;
    }
    if (!c) c = { x: x + 1, y: y + 1 };
    var tipo = MIUDOS[sorteio(MIUDOS.length)];
    poe(tipo, c.x, c.y, tipo === 'bosque-flores' ? { var: { n: sorteio(5) } } : null);
  }

  R.registrarInterior({
    id: 'parquinho',
    lugar: 'parquinho',
    nome: 'Parquinho',
    entrada: true,
    pacote: 'geral',
    fundo: 'parquinho',
    tamanho: { w: W, h: H },
    saida: SAIDA,
    spawn: SPAWN,
    comodos: [{ id: 'parquinho', nome: 'Parquinho', rect: { x: 1, y: 1, w: 26, h: 17 }, piso: 'parquinho-grama', parede: 'parquinho-cerca' }],
    objetos: objetos,
  });
})();
