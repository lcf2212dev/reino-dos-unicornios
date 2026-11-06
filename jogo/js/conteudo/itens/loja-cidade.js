/* Itens das três lojas de equipamento da Cidade Nova (docs/contratos/cidade-nova.md).
   20 armas, 20 elmos, 20 chapéus, 20 armaduras e 20 botas NOVOS, só de loja: não caem de inimigo
   (`loja: 'armas' | 'cabecas' | 'armaduras'`, `arenas` vazio) e custam estrelas. Cada item tem
   molde de vestir (Reino.VESTES) e ícone `item:<id>` (clonados dos moldes/ícones que já existem,
   com a paleta do material) e os números em `preco`/`bonus`.
   Ids e nomes são fixos: o save guarda a peça pelo id. Nada de DOM no carregamento (node: true). */
(function () {
  var R = window.Reino, C = R.ItensCatalogo;
  if (!C || !R.VESTES) return;

  // 20 materiais/temas, na ordem em que entram nos 5 moldes de cada família (4 itens por molde)
  var MATERIAIS = [
    ['cobre', 'Cobre', '#c97a4a'], ['prata', 'Prata', '#c9d4e0'], ['ouro', 'Ouro', '#ffd34d'],
    ['rubi', 'Rubi', '#e0435a'], ['safira', 'Safira', '#3f7fe0'], ['esmeralda', 'Esmeralda', '#3fc98a'],
    ['ametista', 'Ametista', '#9b5cff'], ['topazio', 'Topázio', '#ff9d2e'], ['perola', 'Pérola', '#f4f0ff'],
    ['onix', 'Ônix', '#5a4a6a'], ['fogo', 'Fogo', '#ff5c3a'], ['gelo-eterno', 'Gelo Eterno', '#8fd8ff'],
    ['brisa', 'Brisa', '#a8f0e0'], ['trovao', 'Trovão', '#ffe066'], ['luz', 'Luz', '#fff4cc'],
    ['lua', 'Lua', '#c9b8ff'], ['estrelas', 'Estrelas', '#ffe9a8'], ['arco-iris', 'Arco-Íris', '#ff9cc6'],
    ['coracao', 'Coração', '#ff6b8a'], ['aurora', 'Aurora', '#7cffc4'],
  ];

  var CHAPEUX = [
    ['nuvem', 'Nuvem', '#d8e8ff'], ['sol', 'Sol', '#ffd34d'], ['estrela', 'Estrela', '#ffe066'],
    ['lua', 'Lua', '#c9b8ff'], ['coracao', 'Coração', '#ff6b8a'], ['arco-iris', 'Arco-Íris', '#ff9cc6'],
    ['morango', 'Morango', '#ff4f6a'], ['mel', 'Mel', '#ffb020'], ['ceu', 'Céu', '#8fd8ff'],
    ['jardim', 'Jardim', '#7cc15a'], ['festa', 'Festa', '#ff8ac4'], ['sonho', 'Sonho', '#b58cff'],
    ['chuva', 'Chuva', '#8fb8e8'], ['neve', 'Neve', '#e8f4ff'], ['brisa', 'Brisa', '#a8f0e0'],
    ['fogo', 'Fogo', '#ff7a3d'], ['folha', 'Folha', '#6fdc8c'], ['perola', 'Pérola', '#f4f0ff'],
    ['ametista', 'Ametista', '#9b5cff'], ['fada', 'Fada', '#ff9ec7'],
  ];

  // moldes (5 por família) e ícones de base: clones recoloridos, nunca desenhos novos
  var MOLDES = {
    espada: ['espada-madeira', 'espada-bambu', 'espada-gelo', 'espada-sol', 'espada-cristal'],
    capacete: ['capacete-panela', 'capacete-cavaleira', 'capacete-polar', 'capacete-cristal', 'capacete-dragao'],
    chapeu: ['chapeu-flor', 'chapeu-bruxinha', 'chapeu-gorro', 'chapeu-palha', 'chapeu-coroa'],
    armadura: ['armadura-colete', 'armadura-folhas', 'armadura-polar', 'armadura-cristal', 'armadura-dragao'],
    botas: ['botas-galocha', 'botas-neve', 'botas-vento', 'botas-cristal', 'botas-dragao'],
  };
  var LOJA = { espada: 'armas', capacete: 'cabecas', chapeu: 'cabecas', armadura: 'armaduras', botas: 'armaduras' };
  var SLOT = { espada: 'espada', capacete: 'cabeca', chapeu: 'cabeca', armadura: 'armadura', botas: 'botas' };
  var PRECO = { comum: 18, raro: 32, epico: 52, lendario: 80 };

  function hex(c) { return [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16); }); }
  function rgb(a) { return '#' + a.map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
  function misturar(a, b, t) { var x = hex(a), y = hex(b); return rgb(x.map(function (v, i) { return v + (y[i] - v) * t; })); }
  function claro(c, t) { return misturar(c, '#ffffff', t); }
  function escuro(c, t) { return misturar(c, '#3a2446', t); }

  // cores na ordem das letras da paleta do molde: a base, a sombra, a luz, o dourado e os brilhos
  function cores(familia, cor) {
    if (familia === 'espada') return [claro(cor, 0.45), cor, '#ffd34d', '#ffffff', escuro(cor, 0.3), escuro(cor, 0.15)];
    if (familia === 'botas') return [cor, escuro(cor, 0.3), claro(cor, 0.4)];
    return [cor, escuro(cor, 0.25), claro(cor, 0.35), '#ffd34d', claro(cor, 0.55), escuro(cor, 0.45)];
  }
  function molde(base, familia, cor) {
    var m = R.VESTES[base], cs = cores(familia, cor), pal = {};
    if (!m) return null;
    Object.keys(m.paleta).forEach(function (k, i) { pal[k] = cs[i % cs.length]; });
    return Object.assign({}, m, { paleta: pal });
  }
  function icone(base, nome, familia, cor) {
    var b = window.ICONES && window.ICONES['item:' + base], cs = cores(familia, cor), p = {};
    if (!b) return null;
    Object.keys(b.p).forEach(function (k, i) { p[k] = k === 'k' ? (b.p.k || '#3a2446') : cs[i % cs.length]; });
    return { n: nome, p: p, d: b.d };
  }

  // atributos por faixa de raridade (5 comuns, 5 raros, 5 épicos, 5 lendários)
  function bonusDe(familia, i) {
    var faixa = Math.floor(i / 5);
    if (familia === 'espada') return { dano: [1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 7, 7, 8, 8, 9, 10, 10, 11, 12, 13][i] };
    if (familia === 'capacete') {
      var def = [1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4][i];
      var vida = [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 7, 8, 8][i];
      return vida ? { defesa: def, vida: vida } : { defesa: def };
    }
    if (familia === 'chapeu') {
      var sorte = [0.05, 0.06, 0.06, 0.07, 0.08, 0.10, 0.11, 0.12, 0.12, 0.14, 0.16, 0.17, 0.18, 0.19, 0.20, 0.22, 0.23, 0.23, 0.24, 0.25][i];
      var h = { sorte: sorte };
      if (faixa >= 1) h.vida = [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 6][i];
      if (faixa >= 3) h.velocidade = 0.02;
      return h;
    }
    if (familia === 'armadura') {
      var v = [2, 3, 4, 4, 5, 6, 6, 7, 7, 8, 9, 10, 10, 11, 12, 13, 14, 15, 16, 18][i];
      var d = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3][i];
      return d ? { vida: v, defesa: d } : { vida: v };
    }
    var vel = [0.04, 0.05, 0.05, 0.06, 0.06, 0.08, 0.08, 0.09, 0.09, 0.10, 0.11, 0.12, 0.12, 0.13, 0.13, 0.15, 0.15, 0.16, 0.17, 0.18][i];
    return { velocidade: vel };
  }

  function registrar(id, nome, familia, i, cor) {
    var raridade = ['comum', 'raro', 'epico', 'lendario'][Math.floor(i / 5)];
    var base = MOLDES[familia][i % 5];
    C.registrar({ id: id, nome: nome, tipo: familia, slot: SLOT[familia], raridade: raridade,
      bonus: bonusDe(familia, i), arenas: [], loja: LOJA[familia], preco: PRECO[raridade], venda: Math.floor(PRECO[raridade] / 2),
      icone: 'item:' + id });
    var m = molde(base, familia, cor);
    if (m) R.VESTES[id] = m;
    var ic = icone(base, nome, familia, cor);
    if (ic) { var o = {}; o['item:' + id] = ic; R.registrarIcones(o); }
  }

  // nomes com artigo certo (de/da/do) para os 20 materiais
  var NOMES = {
    espada: ['Espada de Cobre', 'Espada de Prata', 'Espada de Ouro', 'Espada de Rubi', 'Espada de Safira', 'Espada de Esmeralda',
      'Espada de Ametista', 'Espada de Topázio', 'Espada de Pérola', 'Espada de Ônix', 'Espada de Fogo', 'Espada de Gelo Eterno',
      'Espada de Brisa', 'Espada de Trovão', 'Espada de Luz', 'Espada da Lua', 'Espada das Estrelas', 'Espada do Arco-Íris',
      'Espada do Coração', 'Espada da Aurora'],
    capacete: ['Elmo de Cobre', 'Elmo de Prata', 'Elmo de Ouro', 'Elmo de Rubi', 'Elmo de Safira', 'Elmo de Esmeralda',
      'Elmo de Ametista', 'Elmo de Topázio', 'Elmo de Pérola', 'Elmo de Ônix', 'Elmo de Fogo', 'Elmo de Gelo Eterno',
      'Elmo de Brisa', 'Elmo de Trovão', 'Elmo de Luz', 'Elmo da Lua', 'Elmo das Estrelas', 'Elmo do Arco-Íris',
      'Elmo do Coração', 'Elmo da Aurora'],
    chapeu: CHAPEUX.map(function (m) { return 'Chapéu de ' + m[1]; }),
    armadura: ['Armadura de Cobre', 'Armadura de Prata', 'Armadura de Ouro', 'Armadura de Rubi', 'Armadura de Safira',
      'Armadura de Esmeralda', 'Armadura de Ametista', 'Armadura de Topázio', 'Armadura de Pérola', 'Armadura de Ônix',
      'Armadura de Fogo', 'Armadura de Gelo Eterno', 'Armadura de Brisa', 'Armadura de Trovão', 'Armadura de Luz',
      'Armadura da Lua', 'Armadura das Estrelas', 'Armadura do Arco-Íris', 'Armadura do Coração', 'Armadura da Aurora'],
    botas: ['Botas de Cobre', 'Botas de Prata', 'Botas de Ouro', 'Botas de Rubi', 'Botas de Safira', 'Botas de Esmeralda',
      'Botas de Ametista', 'Botas de Topázio', 'Botas de Pérola', 'Botas de Ônix', 'Botas de Fogo', 'Botas de Gelo Eterno',
      'Botas de Brisa', 'Botas de Trovão', 'Botas de Luz', 'Botas da Lua', 'Botas das Estrelas', 'Botas do Arco-Íris',
      'Botas do Coração', 'Botas da Aurora'],
  };
  ['espada', 'capacete', 'armadura', 'botas'].forEach(function (familia) {
    MATERIAIS.forEach(function (m, i) {
      registrar(familia + '-' + m[0], NOMES[familia][i], familia, i, m[2]);
    });
  });
  CHAPEUX.forEach(function (m, i) {
    registrar('chapeu-' + m[0], NOMES.chapeu[i], 'chapeu', i, m[2]);
  });
})();
