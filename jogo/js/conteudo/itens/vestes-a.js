/* Roupas de aventura, parte A: os moldes da CABEÇA (5 capacetes e 5 chapéus; docs/contratos/itens.md §3 e §8).
   Só dados: quem desenha é arte/itens-vestir.js (PA._interno.aplicarVestes), por cima da cabeça dela (11 colunas,
   linhas 0–6; y < 0 = acima da cabeça, até 4). Cada vista: { linhas, x, y }; '.' deixa o que está embaixo, '_' apaga.
   Sem 'costas': o de frente espelhado; sem as diagonais: o de lado. esconde: letras dela que somem (o laço, B).
   Letras minúsculas da paleta do molde (a parte troca pelas suas). A parte B (armaduras, botas, espadas e
   escudos) mora em vestes-b.js. */
(function () {
  var R = window.Reino;
  var V = R.VESTES = R.VESTES || {};

  /* ---------- CAPACETES ---------- */
  // panela de cabeça para baixo: as duas alças dos lados e a borda virada
  V['capacete-panela'] = {
    paleta: { a: '#c3cddd', b: '#8e9ab4', c: '#f4f8ff', d: '#5b6478' },
    esconde: ['B'],
    vistas: {
      frente: { y: -2, linhas: [
        '...aaaaa...',
        '..caaaaab..',
        'dcaaaaaaabd',
        '.caaaaaaab.',
        'bbbbbbbbbbb'] },
      lado: { y: -2, linhas: [
        '...aaaaa...',
        '..caaaaab..',
        '.caaddaaab.',
        '.caaaaaaab.',
        'bbbbbbbbbbb'] },
    },
  };
  // elmo prateado com pluma cor-de-rosa, faixa dourada e protetores do rosto
  V['capacete-cavaleira'] = {
    paleta: { a: '#dfe6f2', b: '#8e9ab4', c: '#ffffff', d: '#ffd34d', e: '#ff7eb6', f: '#ffc2dc' },
    esconde: ['B'],
    vistas: {
      frente: { y: -3, linhas: [
        '....fee....',
        '....aea....',
        '..caaaaab..',
        '.caaaaaaab.',
        '.aaaaaaaab.',
        '.ddddddddd.',
        '.a.......b.',
        '.a.......b.'] },
      lado: { y: -3, linhas: [
        '..ffe......',
        '...eaa.....',
        '..caaaaab..',
        '.caaaaaaab.',
        '.aaaaaaaab.',
        '.ddddddddd.',
        '..ab.......',
        '..ab.......'] },
    },
  };
  // elmo de gelo com pelinho branco e orelhinhas de urso polar
  V['capacete-polar'] = {
    paleta: { a: '#bfe3ff', b: '#7fb3e6', c: '#ffffff', d: '#ffb3d1', e: '#dbe8f5' },
    esconde: ['B'],
    vistas: {
      frente: { y: -3, linhas: [
        '.cc.....cc.',
        '.cdcaaacdc.',
        '..aaaaaab..',
        '.aaaaaaaab.',
        '.aaaaaaaab.',
        'ceccececcec',
        '.c.......c.',
        '.e.......e.'] },
      lado: { y: -3, linhas: [
        '..cc.cc....',
        '..cdccdc...',
        '..aaaaaab..',
        '.aaaaaaaab.',
        '.aaaaaaaab.',
        'ceccececcec',
        '..cc.......',
        '..ee.......'] },
    },
  };
  // elmo de cristal lilás com três pontas brilhantes e uma pedra rosa
  V['capacete-cristal'] = {
    paleta: { a: '#d7c2ff', b: '#a07de6', c: '#ffffff', d: '#ff9ed2', e: '#7c5cff' },
    esconde: ['B'],
    vistas: {
      frente: { y: -3, linhas: [
        '.....c.....',
        '..c.cab.c..',
        '..abaaabab.',
        '.caaaaaaab.',
        '.aaaaaaaab.',
        '.eeeedeeee.',
        '.b.......b.'] },
      lado: { y: -3, linhas: [
        '....c......',
        '.c.cab.c...',
        '.abaaabab..',
        '.caaaaaaab.',
        '.aaaaaaaab.',
        '.eeeeeeeed.',
        '..bb.......'] },
    },
  };
  // elmo do dragão: vermelho, chifres dourados e uma pedra verde
  V['capacete-dragao'] = {
    paleta: { a: '#e0503f', b: '#9c2b33', c: '#ff8a6a', d: '#ffd34d', e: '#fff4cc', f: '#6fdc8c' },
    esconde: ['B'],
    vistas: {
      frente: { y: -3, linhas: [
        'e.........e',
        'dd.aaaaa.dd',
        '.dcaaaaaad.',
        '.caaaaaaab.',
        '.aaaafaaab.',
        '.bbbbbbbbb.',
        '.b.......b.'] },
      lado: { y: -3, linhas: [
        'e..........',
        'dd.aaaa....',
        '.dcaaaaab..',
        '.caaaaaaab.',
        '.aaaaaafab.',
        '.bbbbbbbbb.',
        '..bb.......'] },
    },
  };

  /* ---------- CHAPÉUS ---------- */
  // chapéu cor-de-rosa com uma flor grande do lado do laço (que fica escondido embaixo dela)
  V['chapeu-flor'] = {
    paleta: { a: '#ff9ec7', b: '#e0659b', c: '#ffd1e6', d: '#ffffff', e: '#ffd34d', f: '#9ccc4a' },
    esconde: ['B'],
    vistas: {
      frente: { y: -2, linhas: [
        '..d.aaaa...',
        '.dedaaaaa..',
        '.fdaaaaaab.',
        '.bbbbbbbbb.',
        'aaaaaaaaaaa'] },
      lado: { y: -2, linhas: [
        '..d.aaaa...',
        '.dedaaaaab.',
        '.fdaaaaaab.',
        '.bbbbbbbbb.',
        'aaaaaaaaaaa'] },
    },
  };
  // chapéu pontudo de bruxinha, roxo, com a ponta caída e uma estrela dourada
  V['chapeu-bruxinha'] = {
    paleta: { a: '#9b5cff', b: '#6a3ad0', c: '#c9a6ff', d: '#ffd34d' },
    esconde: ['B'],
    vistas: {
      frente: { y: -4, linhas: [
        '.......aa..',
        '......aa...',
        '.....caa...',
        '....caaab..',
        '...caadab..',
        '..bbbbbbbb.',
        'aaaaaaaaaab'] },
      lado: { y: -4, linhas: [
        '..aa.......',
        '...aa......',
        '...caa.....',
        '...caaab...',
        '..caadabb..',
        '.bbbbbbbbb.',
        'aaaaaaaaaab'] },
    },
  };
  // gorro de tricô azul com listra rosa e pompom branco
  V['chapeu-gorro'] = {
    paleta: { a: '#5fb4ff', b: '#3a86d6', c: '#ffffff', d: '#ff7eb6', e: '#e3eefa' },
    esconde: ['B'],
    vistas: {
      frente: { y: -3, linhas: [
        '....ccc....',
        '...aceaa...',
        '..aaaaaab..',
        '.ddddddddd.',
        '.aaaaaaaab.',
        '.cececececc'] },
      lado: { y: -3, linhas: [
        '..ccc......',
        '..ceaaa....',
        '..aaaaaab..',
        '.ddddddddd.',
        '.aaaaaaaab.',
        '.cececececc'] },
    },
  };
  // chapéu de palha de aba larga, com fita vermelha
  V['chapeu-palha'] = {
    paleta: { a: '#f2d27a', b: '#c9a04a', c: '#fff1b8', d: '#ff5c6a', e: '#e0b45a' },
    esconde: ['B'],
    vistas: {
      frente: { y: -2, linhas: [
        '...caaaa...',
        '..caaaaab..',
        '.caaaaaaab.',
        '.ddddddddd.',
        'caeaeaeaeab'] },
      lado: { y: -2, linhas: [
        '...caaaa...',
        '..caaaaab..',
        '.caaaaaaab.',
        '.ddddddddd.',
        'caeaeaeaeab'] },
    },
  };
  // coroinha dourada com pedras rosa e azul (o laço continua aparecendo)
  V['chapeu-coroa'] = {
    paleta: { a: '#ffd34d', b: '#e0a020', c: '#fff4cc', d: '#ff4f9a', e: '#5fb4ff' },
    vistas: {
      frente: { y: -3, linhas: [
        '..c..c..c..',
        '..ca.a.ab..',
        '..aadaeaa..',
        '..bbbbbbb..'] },
      lado: { y: -3, linhas: [
        '...c..c....',
        '...ca.ab...',
        '...adaea...',
        '...bbbbb...'] },
    },
  };
})();
