/* Catálogo dos itens que os inimigos das arenas deixam cair (docs/contratos/itens.md §3, §4): Reino.ItensCatalogo.
   31 equipamentos (6 espadas, 5 escudos, 5 capacetes, 5 chapéus, 5 armaduras, 5 botas), 2 poções de vida e uma
   comidinha por comida de config.comidas (gerada daqui: comida nova na config ganha item com o peso padrão).
   NÃO troque o `id` de um item: o save guarda as peças por ele (um id que some vira peça guardada sem efeito).
   Atributos (`bonus`): dano = Força, defesa = Proteção, vida = Vida, velocidade = Rapidez e sorte = Sorte (as duas
   últimas em fração: 0.05 = 5%). `arenas`: os ids de Reino.Arenas onde o item cai.
   Os desenhos ficam com as roupas (conteudo/itens/vestes-*.js) e os ícones (`item:<id>`, conteudo/itens/icones-*.js).
   Só dados (node: true): nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var ARENAS = ['bosque', 'pantano', 'gelo', 'dunas', 'cristal', 'vulcao'];   // as 6 arenas, na ordem do caminho
  var TIPOS = ['espada', 'escudo', 'capacete', 'chapeu', 'armadura', 'botas', 'pocao', 'comida', 'bola'];
  var SLOT = { espada: 'espada', escudo: 'escudo', capacete: 'cabeca', chapeu: 'cabeca', armadura: 'armadura', botas: 'botas' };
  var RARIDADES = ['comum', 'raro', 'epico', 'lendario'];
  var BONUS = ['dano', 'defesa', 'vida', 'velocidade', 'sorte'];
  var lista = [], porId = {};

  function erro(def, m) { throw new Error('ItensCatalogo.registrar(' + (def && def.id) + '): ' + m); }
  /** registra um item; erro claro se o id repete ou a definição não fecha (formato: itens.md §3) */
  function registrar(def) {
    if (!def || typeof def.id !== 'string' || !/^[a-z]+-[a-z0-9-]+$/.test(def.id)) erro(def, 'id precisa ser "<tipo>-<nome>"');
    if (Object.prototype.hasOwnProperty.call(porId, def.id)) erro(def, 'id repetido');
    if (TIPOS.indexOf(def.tipo) < 0) erro(def, 'tipo desconhecido');
    if (typeof def.nome !== 'string' || !def.nome) erro(def, 'falta o nome');
    // item de loja (a Vila Arco-Íris: `loja` = id da loja, `preco` em estrelas) pode não cair em arena nenhuma
    if (!Array.isArray(def.arenas) || (!def.arenas.length && !def.loja)) erro(def, 'falta arenas');
    if (def.loja && !(typeof def.preco === 'number' && def.preco > 0)) erro(def, 'item de loja precisa de preco');
    var equip = !!SLOT[def.tipo];
    if (equip && def.slot !== SLOT[def.tipo]) erro(def, 'slot precisa ser "' + SLOT[def.tipo] + '"');
    if (equip && RARIDADES.indexOf(def.raridade) < 0) erro(def, 'raridade desconhecida');
    if (equip) Object.keys(def.bonus || {}).forEach(function (k) {
      if (BONUS.indexOf(k) < 0 || typeof def.bonus[k] !== 'number' || !isFinite(def.bonus[k])) erro(def, 'bônus estranho: ' + k);
    });
    if (!equip && !(typeof def.peso === 'number' && def.peso >= 0)) erro(def, 'consumível precisa de peso');
    lista.push(def); porId[def.id] = def;
    return def;
  }
  function def(id) { return typeof id === 'string' && Object.prototype.hasOwnProperty.call(porId, id) ? porId[id] : null; }
  function todos() { return lista.slice(); }
  function equipamento(d) { return !!SLOT[d.tipo]; }
  /** os itens que caem na arena (tipo: só os dessa família; 'equip' = todos os equipamentos) */
  function daArena(arena, tipo) {
    return lista.filter(function (d) {
      if (d.arenas.indexOf(arena) < 0) return false;
      return !tipo || d.tipo === tipo || (tipo === 'equip' && equipamento(d));
    });
  }

  // equipamento: id, nome, raridade, bônus e arenas (o tipo e o slot saem do id)
  function equip(id, nome, raridade, bonus, arenas) {
    var tipo = id.split('-')[0];
    registrar({ id: id, nome: nome, tipo: tipo, slot: SLOT[tipo], raridade: raridade, bonus: bonus, arenas: arenas, icone: 'item:' + id });
  }
  equip('espada-madeira', 'Espada de Madeira', 'comum', { dano: 1 }, ['bosque']);
  equip('espada-bambu', 'Espada de Bambu', 'comum', { dano: 2 }, ['pantano']);
  equip('espada-gelo', 'Espada de Gelo', 'raro', { dano: 4 }, ['gelo']);
  equip('espada-sol', 'Espada do Sol', 'raro', { dano: 6 }, ['dunas']);
  equip('espada-cristal', 'Espada de Cristal', 'epico', { dano: 8 }, ['cristal']);
  equip('espada-dragao', 'Espada do Dragão', 'lendario', { dano: 11 }, ['vulcao']);
  equip('escudo-madeira', 'Escudo de Madeira', 'comum', { defesa: 1 }, ['bosque', 'pantano']);
  equip('escudo-concha', 'Escudo de Concha', 'raro', { defesa: 2 }, ['pantano', 'gelo']);
  equip('escudo-neve', 'Escudo Floco de Neve', 'raro', { defesa: 2, vida: 2 }, ['gelo', 'dunas']);
  equip('escudo-cristal', 'Escudo de Cristal', 'epico', { defesa: 3 }, ['dunas', 'cristal']);
  equip('escudo-dragao', 'Escudo do Dragão', 'lendario', { defesa: 4 }, ['vulcao']);
  equip('capacete-panela', 'Capacete de Panelinha', 'comum', { defesa: 1 }, ['bosque', 'pantano']);
  equip('capacete-cavaleira', 'Elmo de Cavaleira', 'raro', { defesa: 1, vida: 2 }, ['pantano', 'gelo']);
  equip('capacete-polar', 'Elmo Polar', 'raro', { defesa: 2 }, ['gelo', 'dunas']);
  equip('capacete-cristal', 'Elmo de Cristal', 'epico', { defesa: 2, vida: 4 }, ['cristal']);
  equip('capacete-dragao', 'Elmo do Dragão', 'lendario', { defesa: 3, vida: 4 }, ['vulcao']);
  equip('chapeu-flor', 'Chapéu de Flor', 'comum', { sorte: 0.10 }, ['bosque', 'pantano']);
  equip('chapeu-bruxinha', 'Chapéu de Bruxinha', 'raro', { sorte: 0.15, vida: 2 }, ['bosque', 'cristal']);
  equip('chapeu-gorro', 'Gorro de Pompom', 'comum', { sorte: 0.10, vida: 2 }, ['gelo']);
  equip('chapeu-palha', 'Chapéu de Palha', 'comum', { sorte: 0.10, velocidade: 0.03 }, ['dunas']);
  equip('chapeu-coroa', 'Coroinha Brilhante', 'lendario', { sorte: 0.25, vida: 4 }, ['cristal', 'vulcao']);
  equip('armadura-colete', 'Colete Acolchoado', 'comum', { vida: 2 }, ['bosque', 'pantano']);
  equip('armadura-folhas', 'Armadura de Folhas', 'comum', { vida: 4 }, ['pantano', 'gelo']);
  equip('armadura-polar', 'Casaco Polar', 'raro', { vida: 6, defesa: 1 }, ['gelo', 'dunas']);
  equip('armadura-cristal', 'Armadura de Cristal', 'epico', { vida: 8, defesa: 1 }, ['dunas', 'cristal']);
  equip('armadura-dragao', 'Armadura do Dragão', 'lendario', { vida: 12, defesa: 2 }, ['vulcao']);
  equip('botas-galocha', 'Galochas', 'comum', { velocidade: 0.05 }, ['bosque', 'pantano']);
  equip('botas-neve', 'Botas de Neve', 'raro', { velocidade: 0.08 }, ['gelo']);
  equip('botas-vento', 'Sandálias do Vento', 'raro', { velocidade: 0.10 }, ['dunas']);
  equip('botas-cristal', 'Botas de Cristal', 'epico', { velocidade: 0.12 }, ['cristal']);
  equip('botas-dragao', 'Botas do Dragão', 'lendario', { velocidade: 0.15 }, ['vulcao']);

  // poções de vida: a pequena cai em todas as arenas; a grande, do gelo em diante
  var cfg = (R.config && R.config.itens) || {}, pesoPocao = cfg.pesoPocao || {};
  registrar({ id: 'pocao-pequena', nome: 'Poção de Vida', tipo: 'pocao', cura: 'pequena', arenas: ARENAS.slice(),
    peso: pesoPocao.pequena === undefined ? 85 : pesoPocao.pequena, icone: 'item:pocao-pequena' });
  registrar({ id: 'pocao-grande', nome: 'Poção de Vida Grande', tipo: 'pocao', cura: 'grande', arenas: ARENAS.slice(2),
    peso: pesoPocao.grande === undefined ? 15 : pesoPocao.grande, icone: 'item:pocao-grande' });

  // a MonsterBall e a Super (monstros.md): só se compram nos Treinadores de Monstros da Vila, não caem de monstro nenhum
  registrar({ id: 'bola-monster', nome: 'MonsterBall', tipo: 'bola', arenas: [], loja: 'treinadores', peso: 0,
    preco: ((R.config && R.config.monstros) || {}).precoBola || 50, icone: 'item:bola-monster' });
  // a Super MonsterBall: pega sempre (config.monstros.chanceSuper), também só nos Treinadores
  registrar({ id: 'bola-super', nome: 'Super MonsterBall', tipo: 'bola', arenas: [], loja: 'treinadores', peso: 0,
    preco: ((R.config && R.config.monstros) || {}).precoSuper || 125, icone: 'item:bola-super' });
  // a Mini MonsterBall: a mais barata, a primeira que abre (config.monstros.chanceMini), também só nos Treinadores
  registrar({ id: 'bola-mini', nome: 'Mini MonsterBall', tipo: 'bola', arenas: [], loja: 'treinadores', peso: 0,
    preco: ((R.config && R.config.monstros) || {}).precoMini || 25, icone: 'item:bola-mini' });

  // comidinhas do unicórnio: uma por comida da Pet Shop, com o nome, o ícone e o `fome` de lá (enche = 100)
  var pesoComida = cfg.pesoComida || {}, padrao = cfg.pesoComidaPadrao === undefined ? 15 : cfg.pesoComidaPadrao;
  ((R.config && R.config.comidas) || []).forEach(function (c) {
    registrar({ id: 'comida-' + c.id, nome: c.nome, tipo: 'comida', comida: c.id, fome: c.enche ? 100 : c.fome,
      arenas: ARENAS.slice(), peso: Object.prototype.hasOwnProperty.call(pesoComida, c.id) ? pesoComida[c.id] : padrao, icone: c.icone });
  });

  R.ItensCatalogo = {
    registrar: registrar, def: def, todos: todos, daArena: daArena,
    equipamentos: function () { return lista.filter(equipamento); },
    consumiveis: function () { return lista.filter(function (d) { return !equipamento(d); }); },
    equipamento: function (id) { var d = def(id); return !!d && equipamento(d); },
    ARENAS: ARENAS, TIPOS: TIPOS, RARIDADES: RARIDADES,
    NOMES_RARIDADE: { comum: 'Comum', raro: 'Raro', epico: 'Épico', lendario: 'Lendário' },
  };
})();
