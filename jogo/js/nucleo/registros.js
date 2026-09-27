/* Registro das matérias (js/conteudo/materias/) e das provas bimestrais (js/conteudo/provas/):
   cada arquivo de conteúdo chama Reino.registrarMateria / Reino.registrarProva ao carregar.
   Formas (Materia, Prova): jogo/ferramentas/testes/tipos-jogo.d.ts. */
window.Reino = window.Reino || {};

Reino.materias = [];
/** @param {Materia} m */
Reino.registrarMateria = function (m) { Reino.materias.push(m); };
/** @param {string} id @returns {Materia | undefined} */
Reino.materia = function (id) { return Reino.materias.find(function (m) { return m.id === id; }); };
// provas bimestrais: cada uma em js/conteudo/provas/<id>.js
Reino.provas = [];
/** @param {Prova} p */
Reino.registrarProva = function (p) {
  Reino.provas.push(p);
  // acessórios autocontidos: ícone e desenho da montaria no próprio arquivo da prova
  ['lendario', 'raro', 'comum'].forEach(function (r) {
    var a = p.acessorios && p.acessorios[r];
    if (!a) return;
    if (a.icone && window.ICONES) window.ICONES['acessorio:' + a.id] = a.icone;
    if (a.desenho) {
      Reino.desenhosAcessorios[a.id] = a.desenho;
      // o pixelart (só no navegador) carrega antes das provas: o desenho entra direto na montaria
      if (window.PA && window.PA.ENFEITES_MONTARIA) window.PA.ENFEITES_MONTARIA[a.id] = a.desenho;
    }
  });
};
// desenhos inline dos acessórios de prova (id → formato de PA.ENFEITES_MONTARIA)
/** @type {{ [id: string]: DesenhoEnfeite }} */
Reino.desenhosAcessorios = {};
/** @param {string} id @returns {Prova | undefined} */
Reino.prova = function (id) { return Reino.provas.find(function (p) { return p.id === id; }); };
// lugares novos no mapa: cada prédio em js/interiores/<p>/ chama Reino.registrarLugar ao carregar
// (mundo/mapa.js os põe depois dos fixos com caminho; ui/lugares.js usa o `menu`). Contrato: docs/contratos/interiores.md.
Reino.lugaresRegistrados = [];
Reino.lugaresRecusados = [];   // ids recusados, para o validador acusar
/** @param {LugarRegistrado} def @returns {boolean} false quando recusado */
Reino.registrarLugar = function (def) {
  // sem caminho ele entraria antes do sorteio dos enfeites e mudaria as árvores do reino todo
  if (!def || !def.id || !Array.isArray(def.caminho) || !def.caminho.length) {
    Reino.lugaresRecusados.push(String(def && def.id));
    console.warn('Reino.registrarLugar: lugar "' + (def && def.id) + '" recusado (precisa de id e caminho)');
    return false;
  }
  Reino.lugaresRegistrados.push(def);
  return true;
};

// personagens declarados fora do elenco.js (pasta do prédio ou arquivo da prova), com a voz junto.
// O perfil entra na hora em Reino.config.vozes['npc-<id>']; o elenco.js soma todos ao N.ELENCO
// (quem registra depois do elenco entra direto). Id repetido é erro.
/** @type {{ [id: string]: PersonagemElenco }} */
Reino.personagens = {};
/** @param {PersonagemRegistrado} def */
Reino.registrarPersonagem = function (def) {
  var N = Reino.NPCs, r = Reino.reservas[def.id];
  if (r && !r.preenchida) return preencherReserva(r, def);
  if (Reino.personagens[def.id] || (N && N.ELENCO && N.ELENCO[def.id])) throw new Error('registrarPersonagem: id repetido "' + def.id + '"');
  var voz = 'npc-' + def.id;
  if (def.perfil) Reino.config.vozes[voz] = def.perfil;
  /** @type {PersonagemElenco} */
  var p = { nome: def.nome, voz: voz, sprite: def.sprite };
  if (def.paraMateria) p.paraMateria = def.paraMateria;
  if (def.paraProva) p.paraProva = def.paraProva;
  Reino.personagens[def.id] = p;
  if (N && N.ELENCO) N.ELENCO[def.id] = p;
  // com `predio` (e/ou `lugares`): o <p>.js põe a pessoa no interior (Reino.personagensDoPredio), sem editar o layout
  if (def.predio) Reino.personagemTambemEm(def.id, { predio: def.predio, x: def.x, y: def.y, acao: def.acao });
  (def.lugares || []).forEach(function (l) { Reino.personagemTambemEm(def.id, l); });
};

// Reserva: o contrato de um NPC (quem é, voz e vaga no interior), escrito antes das frentes que o constroem em
// paralelo. Até o registro, ele aparece como vaga tracejada (base de sprite 'reserva') com o nome e as falas reais.
// registrarPersonagem({ id, sprite, … }) preenche; campo repetido tem de ser igual. Contrato: docs/contratos/plano-paralelo.md §2.
/** @type {{ [id: string]: ReservaPersonagem }} */
Reino.reservas = {};
/** @param {ReservaPersonagem} def */
Reino.reservarPersonagem = function (def) {
  var N = Reino.NPCs;
  if (Reino.reservas[def.id] || Reino.personagens[def.id] || (N && N.ELENCO && N.ELENCO[def.id])) throw new Error('reservarPersonagem: id repetido "' + def.id + '"');
  var voz = 'npc-' + def.id;
  if (def.perfil) Reino.config.vozes[voz] = def.perfil;
  Reino.reservas[def.id] = Object.assign({}, def, { preenchida: false });
  /** @type {PersonagemElenco} */
  // a vaga tracejada; 'jovem' desenha como adulto (as idades do sprite: npcs.js, OPCOES_SPRITE)
  var p = { nome: def.nome, voz: voz, sprite: { base: 'reserva', genero: def.genero, idade: def.idade === 'jovem' ? 'adulto' : def.idade } };
  Reino.personagens[def.id] = p;
  if (N && N.ELENCO) N.ELENCO[def.id] = p;
  if (def.predio) Reino.personagemTambemEm(def.id, { predio: def.predio, x: def.x, y: def.y, acao: def.acao });
};
// o registro que preenche a reserva: mesmo lugar no ELENCO e no interior, como se não houvesse reserva
/** @param {ReservaPersonagem} r @param {PersonagemRegistrado} def */
function preencherReserva(r, def) {
  ['nome', 'perfil', 'predio', 'x', 'y', 'acao'].forEach(function (k) {
    if (def[k] !== undefined && r[k] !== undefined && JSON.stringify(def[k]) !== JSON.stringify(r[k])) {
      throw new Error('registrarPersonagem: "' + def.id + '".' + k + ' difere da reserva (a reserva é o contrato: mude-a no reservas.js)');
    }
  });
  // o que é contrato vem só da reserva: campo que ela não tem não entra pelo registro (a ação é a exceção, abaixo)
  ['nome', 'perfil', 'predio', 'x', 'y'].forEach(function (k) {
    if (def[k] !== undefined && r[k] === undefined) throw new Error('registrarPersonagem: "' + def.id + '".' + k + ' falta na reserva (ponha-o no reservas.js)');
  });
  /** @type {PersonagemElenco} */
  var p = { nome: r.nome, voz: 'npc-' + def.id, sprite: def.sprite };
  if (def.paraMateria) p.paraMateria = def.paraMateria;
  if (def.paraProva) p.paraProva = def.paraProva;
  Reino.personagens[def.id] = p;
  var N = Reino.NPCs;
  if (N && N.ELENCO && N.ELENCO[def.id]) N.ELENCO[def.id] = p;
  // sem ação na reserva: a do registro vale no lugar reservado
  if (def.acao && !r.acao) Reino._personagensPredio.forEach(function (l) { if (l.id === def.id && l.predio === r.predio) l.acao = def.acao; });
  (def.lugares || []).forEach(function (l) { Reino.personagemTambemEm(def.id, l); });
  r.preenchida = true;
}
Reino._personagensPredio = [];
/** a mesma pessoa (mesma voz e sprite) em mais um interior; as falas de lá em FALAS_INTERIORES.<p>.npcs.<id>
    @param {string} id @param {LugarPersonagem} l */
Reino.personagemTambemEm = function (id, l) {
  Reino._personagensPredio.push({ id: id, predio: l.predio, x: l.x, y: l.y, acao: l.acao });
};
/** os registrados com `predio: p`, na ordem de registro: [{ id, x, y, acao }]
    @param {string} p @returns {{ id: string, x?: number, y?: number, acao?: AcaoNpc }[]} */
Reino.personagensDoPredio = function (p) {
  return Reino._personagensPredio.filter(function (r) { return r.predio === p; })
    .map(function (r) { return { id: r.id, x: r.x, y: r.y, acao: r.acao }; });
};

// falas de um prédio em várias partes (falas.js, nasa-falas.js...), em qualquer ordem de carga.
// Sem parte: cria ou devolve Reino.FALAS_INTERIORES[id]. Com parte: junta — listas (extras...) concatenadas na ordem de carga,
// npcs e objetos por id, as outras chaves inteiras; a mesma chave (ou NPC/objeto) em duas partes é erro.
// Contrato: docs/contratos/npcs-e-dialogo.md.
/** @param {string} id @param {{ [chave: string]: any }} [parte] @returns {{ [chave: string]: any }} */
Reino.falasDoPredio = function (id, parte) {
  var F = Reino.FALAS_INTERIORES = Reino.FALAS_INTERIORES || {};
  var base = F[id] = F[id] || {};
  Object.keys(parte || {}).forEach(function (k) {
    var v = parte[k];
    if (Array.isArray(v)) { base[k] = (base[k] || []).concat(v); return; }
    if (k === 'npcs' || k === 'objetos') {
      var dest = base[k] = base[k] || {};
      Object.keys(v).forEach(function (n) {
        if (n in dest) throw new Error('falasDoPredio: "' + id + '".' + k + '["' + n + '"] veio de duas partes');
        dest[n] = v[n];
      });
      return;
    }
    if (k in base) throw new Error('falasDoPredio: a chave "' + k + '" de "' + id + '" veio de duas partes');
    base[k] = v;
  });
  return base;
};
