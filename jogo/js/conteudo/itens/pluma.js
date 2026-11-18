/* O Conjunto da Pluma: as 6 peças épicas que se conquistam escrevendo em letra cursiva nas lojas de peças da Vila
   Arco-Íris (docs/contratos/cursiva.md §6; pedido: pedidos/2026-11-18-pecas-epicas-cursiva.md). `cursiva: true`: não
   têm preço, não caem de monstro (arenas vazias) e não se vendem; `loja` é a loja onde cada uma se conquista
   (Reino.VilaLojas.conquistas) e `artigo`, o artigo do nome nas frases da tela ("Pegar a Espada da Pluma").
   A pluma é a pena de escrever: lilás épico, branco e dourado. Para cada peça: o catálogo, o molde de vestir
   (Reino.VESTES; a calça é a única do tipo `calca`: { calca: { perna, sombra } }, arte/itens-vestir.js) e o ícone
   16×16 (só o preenchimento; o contorno entra sozinho, pelo contornar de loja-moldes.js).
   NÃO troque o `id` de uma peça: o save guarda as peças por ele. Só dados (node: true). */
(function () {
  var R = window.Reino, V = R.VESTES = R.VESTES || {};
  var LILAS = '#a98bf0', ROXO = '#6f4fd0', CLARO = '#e3d6ff', OURO = '#ffd34d', BRANCO = '#ffffff', ANIL = '#5b55c9';

  function peca(def, molde, icone) {
    R.ItensCatalogo.registrar({ id: def.id, nome: def.nome, artigo: def.artigo, tipo: def.id.split('-')[0], slot: def.slot,
      raridade: 'epico', bonus: def.bonus, arenas: [], loja: def.loja, cursiva: true, icone: 'item:' + def.id });
    V[def.id] = molde;
    var ic = {};
    ic['item:' + def.id] = { n: def.nome.toLowerCase(), p: Object.assign({ k: '#3a2446' }, icone.p), d: R._lojaMoldes.contornar(icone.d) };
    R.registrarIcones(ic);
  }

  /* ---------- Forja Brilhante: a espada e o escudo ---------- */
  // a lâmina é uma pluma branca de barbas lilás; guarda dourada e uma pedra roxa
  peca({ id: 'espada-pluma', nome: 'Espada da Pluma', artigo: 'a', slot: 'espada', loja: 'armas', bonus: { dano: 9 } },
    { paleta: { w: BRANCO, l: '#c9b0ff', o: OURO, g: '#7c5cff', p: ROXO }, linhas: [
      '..k..', '.kwk.', 'kwwlk', 'kwlwk', 'kwwlk', 'kkkkk', 'kogok', 'kkpkk', '.kpk.', '.kok.', '..k..'] },
    { p: { w: BRANCO, l: '#c9b0ff', g: OURO, p: ROXO, o: '#e0a020' }, d: [
      '................',
      '.............ww.',
      '............wwl.',
      '...........wwl..',
      '..........wlw...',
      '.........wwl....',
      '........wlw.....',
      '..g....wwl......',
      '..gg..wlw.......',
      '...ggwwl........',
      '....ggl.........',
      '....pgggg.......',
      '...pp...g.......',
      '..pp............',
      '.oo.............',
      '................'] });
  // escudo lilás de borda dourada, com a pluma branca atravessada
  peca({ id: 'escudo-pluma', nome: 'Escudo da Pluma', artigo: 'o', slot: 'escudo', loja: 'armas', bonus: { defesa: 3, vida: 2 } },
    { paleta: { a: LILAS, b: ROXO, w: BRANCO, g: OURO }, linhas: [
      'kkkkkkkk', 'kggggggk', 'kaaaawak', 'kaaawwak', 'kaawwabk', '.kwwabk.', '..kabk..', '...kk...'] },
    { p: { a: LILAS, b: ROXO, w: BRANCO, l: '#c9b0ff', g: OURO }, d: [
      '................',
      '..gggggggggggg..',
      '..gaaaaaaaaaag..',
      '..gaaaaaaawwag..',
      '..gaaaaaawwlag..',
      '..gaaaaawwlaag..',
      '..gaaaawwlaaag..',
      '..gaaawwlaaabg..',
      '..gaaawlaaabbg..',
      '...gawaaaabbg...',
      '...gaaaaabbbg...',
      '....gaaabbbg....',
      '.....gaabbg.....',
      '......gggg......',
      '................',
      '................'] });

  /* ---------- Elmos e Chapéus: o elmo ---------- */
  // elmo lilás de faixa dourada, com uma pluma branca grande no alto (de lado, a pluma cai para trás)
  peca({ id: 'capacete-pluma', nome: 'Elmo da Pluma', artigo: 'o', slot: 'cabeca', loja: 'cabecas', bonus: { defesa: 2, vida: 4 } },
    { paleta: { a: LILAS, b: ROXO, c: CLARO, d: OURO, w: BRANCO, e: '#c9b0ff' }, esconde: ['B'], vistas: {
      frente: { y: -4, linhas: [
        '......wwe..',
        '.....wwwe..',
        '.....dwe...',
        '..caaaaab..',
        '.caaaaaaab.',
        '.aaaaaaaab.',
        '.ddddddddd.',
        '.a.......b.',
        '.a.......b.'] },
      lado: { y: -4, linhas: [
        '..ew.......',
        '.ewww......',
        '..ewwd.....',
        '..caaaaab..',
        '.caaaaaaab.',
        '.aaaaaaaab.',
        '.ddddddddd.',
        '..ab.......',
        '..ab.......'] } } },
    { p: { a: LILAS, b: ROXO, c: CLARO, d: OURO, w: BRANCO, l: '#c9b0ff' }, d: [
      '................',
      '..........ww....',
      '.........wwl....',
      '........wwl.....',
      '........wl......',
      '......caaab.....',
      '....ccaaaaabb...',
      '...caaaaaaaaab..',
      '...caaaaaaaaab..',
      '...caaaaaaaaab..',
      '...ddddddddddd..',
      '...ca.......ab..',
      '...ca.......ab..',
      '...ca.......ab..',
      '................',
      '................'] });

  /* ---------- Armaduras e Botas: a armadura, a calça e as botas ---------- */
  // peitoral lilás com ombreiras e cinto dourados e a pluma branca no peito
  peca({ id: 'armadura-pluma', nome: 'Armadura da Pluma', artigo: 'a', slot: 'armadura', loja: 'armaduras', bonus: { vida: 9, defesa: 1 } },
    { paleta: { a: LILAS, b: ROXO, c: CLARO, d: OURO, e: BRANCO },
      troca: { C: 'a', D: 'b', A: 'c' }, ombro: 'd', cinto: 'd', fivela: 'e', peito: 'e' },
    { p: { a: LILAS, b: ROXO, c: CLARO, d: OURO, e: BRANCO, w: BRANCO, l: '#c9b0ff' }, d: [
      '................',
      '................',
      '..ddd......ddd..',
      '.ddddccccccdddd.',
      '.ddddcaaaabdddd.',
      '...dcaaaaaabd...',
      '....caaaaaab....',
      '....caawwaab....',
      '....cawwlaab....',
      '....cawlaaab....',
      '....dddeeddd....',
      '....caaaaaab....',
      '....bbbbbbbb....',
      '................',
      '................',
      '................'] });
  // calça anil (mais escura que a armadura, para as duas se separarem no desenho), barra branca de pluma no ícone
  peca({ id: 'calca-pluma', nome: 'Calça da Pluma', artigo: 'a', slot: 'calca', loja: 'armaduras', bonus: { vida: 3, defesa: 1 } },
    { paleta: { a: ANIL, b: '#3f3a99' }, calca: { perna: 'a', sombra: 'b' } },
    { p: { a: ANIL, b: '#3f3a99', c: '#8f8af0', d: OURO, e: BRANCO, w: BRANCO }, d: [
      '................',
      '................',
      '....dddeeddd....',
      '....caaaaaab....',
      '....caaaaaab....',
      '....caakkaab....',
      '....cab..cab....',
      '....cab..cab....',
      '....dab..dab....',
      '....cab..cab....',
      '....cab..cab....',
      '....cab..cab....',
      '....www..www....',
      '................',
      '................',
      '................'] });
  // botas brancas de pluma, com o pé dourado
  peca({ id: 'botas-pluma', nome: 'Botas da Pluma', artigo: 'as', slot: 'botas', loja: 'armaduras', bonus: { velocidade: 0.13 } },
    { paleta: { a: BRANCO, b: '#e0a020' }, troca: { S: 'b', K: 'a' } },
    { p: { a: '#f4f0ff', b: '#e0a020', c: BRANCO, d: LILAS, w: BRANCO, e: '#c9b0ff' }, d: [
      '................',
      '.wwwww..........',
      '.wewew.wwwww....',
      '.caaad.wewew....',
      '.caaad.caaad....',
      '.caaad.caaad....',
      '.caaad.caaad....',
      '.caaad.caaad....',
      '.caaaad.caaad...',
      '.caaaaad.caaad..',
      '.bbbbbbb.caaaad.',
      '.........bbbbbb.',
      '................',
      '................',
      '................',
      '................'] });
})();
