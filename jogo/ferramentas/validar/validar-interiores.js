// Confere os interiores (construções por dentro) antes de publicar.
// Uso: node ferramentas/validar/validar-interiores.js [--so <id>] [--detalhes]
//   --so <id>    só aquele prédio: o id de um interior ou do lugar (todos os andares dele)
//   --detalhes   também a lista "✔ <interior> …" por cômodo (sem ele: só erros, avisos e a linha de resumo)
// Carrega todos os scripts `node: true` do manifesto num vm SEM DOM (ferramentas/jogo-no-node.js): núcleo,
// ícones, sistemas (as `acoes` dos módulos), motor dos interiores, NPCs e os prédios (js/interiores/), estes em
// ordem alfabética (padrao.js por último), como a lista de vozes. Sai com código 1 se houver erro.
const Jogo = require('../jogo-no-node');
const LugaresDoMapa = require('./lugares-do-mapa');
const Preencher = require('./preencher');
const Extras = require('./interiores-extras');
const Escadas = require('./validar-escadas');

const iSo = process.argv.indexOf('--so');
const SO = iSo >= 0 ? process.argv[iSo + 1] : null;
const DETALHES = process.argv.includes('--detalhes');
const ctx = Jogo.contexto({ console, setTimeout, clearTimeout, Math, Date });
Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
const temNpcs = Boolean(ctx.Reino.NPCs);

const Reino = ctx.Reino;
const I = Reino.Interiores;
const erros = [];
const avisos = [];
const listas = [];
function checar(cond, msg) { if (!cond) erros.push(msg); return !!cond; }

// lugares do mapa, dos dados: Mapa.LUGARES_FIXOS (mundo/lugares.js, avaliado sem DOM) + os registrados pelos
// prédios (Reino.registrarLugar) + as matérias
const LUGARES = new Set(LugaresDoMapa.ids(ctx).concat(Reino.materias.map((m) => 'materia:' + m.id)));
if (!SO) LugaresDoMapa.checar(ctx).forEach((e) => erros.push(e));
// matéria dentro de um prédio que já existe (lugar.dentro + lugar.interior): o anfitrião é um lugar do mapa
// e o interior existe com lugar 'materia:<id>'. predio(l) = o prédio do mapa onde o lugar l fica.
const ANFITRIAO = {};
Reino.materias.filter((m) => m.lugar && m.lugar.dentro).forEach((m) => {
  const id = 'materia:' + m.id, l = m.lugar, di = Reino.interiores.find((d) => d.id === l.interior);
  ANFITRIAO[id] = l.dentro;
  checar(LUGARES.has(l.dentro) && !/^materia:/.test(l.dentro), `${id}: lugar.dentro "${l.dentro}" não é um prédio do mapa`);
  if (checar(di, `${id}: lugar.interior "${l.interior}" não existe`)) checar(di.lugar === id, `${id}: o interior "${l.interior}" tem lugar "${di.lugar}" (precisa ser "${id}")`);
});
const predio = (l) => ANFITRIAO[l] || l;
// telas e ações registradas pelos prédios novos (Reino.NPCs.registrarTela / registrarAcao)
const TELAS = ['livro', 'plano', 'estabulo', 'loja', 'bau', 'ovos'].concat(temNpcs && Reino.NPCs.telas ? Reino.NPCs.telas() : []);
const ACOES_EXTRAS = temNpcs && Reino.NPCs.acoes ? Reino.NPCs.acoes() : [];
// --so: só os interiores daquele prédio, todos os andares (e os andares de matéria `dentro` dele); as conferências
// entre prédios ficam só entre eles, mas escadas e lugares enxergam todos os interiores (porId, porLugar)
const PREDIOS_SO = new Set(Reino.interiores.filter((d) => d.id === SO || d.lugar === SO).map((d) => predio(d.lugar)));
const defs = SO ? Reino.interiores.filter((d) => PREDIOS_SO.has(predio(d.lugar))) : Reino.interiores;
const doSo = (id) => !SO || defs.some((d) => d.id === id || d.lugar === id);
if (SO && !defs.length) erros.push(`--so ${SO}: nenhum interior nem lugar com esse id (${[...new Set(Reino.interiores.map((d) => d.lugar))].join(', ')})`);
const porId = new Map();

// «» balanceado, sem aninhar
function checarIngles(s, onde) {
  if (typeof s !== 'string') return;
  let aberto = false;
  for (const ch of s) {
    if (ch === '«') { if (aberto) { erros.push(`${onde}: «» aninhado em "${s}"`); return; } aberto = true; }
    else if (ch === '»') { if (!aberto) { erros.push(`${onde}: » sem « em "${s}"`); return; } aberto = false; }
  }
  if (aberto) erros.push(`${onde}: « sem » em "${s}"`);
}
// no celular cabem ~17 letras por linha: uma fala (ou página) de até ~44 letras fica em 2-3 linhas
function longa(s, onde) {
  if (typeof s !== 'string') return;
  const n = s.replace(/[«»]/g, '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').trim().length;
  if (n > 44) avisos.push(`${onde}: fala com ${n} letras (máx. ~44 para caber no balão do celular): "${s}"`);
}
function normal(s) {
  return String(s).replace(/[«»]/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .split(/[^a-z0-9]+/).filter(Boolean);
}
const NOMES_UNI = new Set(['Estrelinha', 'Purpurina', 'Algodão', 'Arco-Íris', 'Luna', 'Docinho', 'Brilho']);
// (o marcador `(preencher)` de um esqueleto não é nome: quem acusa é o Preencher, lá embaixo)
Reino.materias.forEach((m) => (m.unicornios || []).forEach((u) => { if (!String(u.nome).includes(Preencher.MARCADOR)) NOMES_UNI.add(u.nome); }));
function nomeDeUnicornio(nome) {
  const pal = normal(nome);
  for (const u of NOMES_UNI) {
    const up = normal(u);
    for (let i = 0; i + up.length <= pal.length; i++) {
      if (up.every((p, k) => pal[i + k] === p)) return u;
    }
  }
  return null;
}

// texto com `(preencher)` (esqueleto do `npm run novo`): nos interiores, nas falas dos prédios e nos lugares
defs.forEach((d) => Preencher.faltas(d, d.id).forEach((e) => erros.push(e)));
Object.keys(Reino.FALAS_INTERIORES || {}).filter(doSo).forEach((p) => Preencher.faltas(Reino.FALAS_INTERIORES[p], `falas de ${p}`).forEach((e) => erros.push(e)));
(Reino.lugaresRegistrados || []).filter((l) => doSo(l.id)).forEach((l) => Preencher.faltas(l, `lugar ${l.id}`, ['info']).forEach((e) => erros.push(e)));

// ids únicos
Reino.interiores.forEach((d) => {
  if (defs.includes(d)) checar(d.id && !porId.has(d.id), `interior com id repetido ou vazio: ${d.id}`);
  porId.set(d.id, d);
});

// um interior de entrada por lugar
const porLugar = {};
Reino.interiores.forEach((d) => {
  if (defs.includes(d)) checar(LUGARES.has(d.lugar), `${d.id}: lugar "${d.lugar}" não existe (${[...LUGARES].join(', ')})`);
  (porLugar[d.lugar] = porLugar[d.lugar] || []).push(d);
});
Object.keys(porLugar).filter(doSo).forEach((l) => {
  const n = porLugar[l].filter((d) => d.entrada).length;
  checar(n === 1, `lugar ${l}: precisa de exatamente 1 interior com entrada: true (tem ${n})`);
  const pacotes = new Set(porLugar[l].map((d) => d.pacote));
  if (pacotes.size > 1) avisos.push(`lugar ${l}: andares com pacotes de voz diferentes (${[...pacotes].join(', ')})`);
});

// grades
const grades = new Map();
defs.forEach((d) => {
  try { grades.set(d.id, I.grade(d)); } catch (e) { erros.push(`${d.id}: grade falhou: ${e.message}`); }
});
function andavel(g, p) { return p && g.dentro(p.x, p.y) && !g.solido[p.y][p.x]; }
function ehEscada(d, p) { return (d.escadas || []).some((e) => e.x === p.x && e.y === p.y); }

// hitbox dos pés da Mariana (jogador.js): x±4, y-4..y-1, com y = tile*16+12
function pesLivres(g, x, y) {
  return [[x - 4, y - 4], [x + 4, y - 4], [x - 4, y - 1], [x + 4, y - 1]].every(([a, b]) => {
    const tx = Math.floor(a / 16), ty = Math.floor(b / 16);
    return g.dentro(tx, ty) && !g.solido[ty][tx];
  });
}
function passoLivre(g, a, b) {
  const ax = a.x * 16 + 8, ay = a.y * 16 + 12, bx = b.x * 16 + 8, by = b.y * 16 + 12;
  for (let i = 0; i <= 8; i++) { const t = i / 8; if (!pesLivres(g, ax + (bx - ax) * t, ay + (by - ay) * t)) return false; }
  return true;
}

defs.forEach((d) => {
  const g = grades.get(d.id);
  if (!g) return;
  const onde = d.id;
  checar(d.tamanho && d.tamanho.w > 0 && d.tamanho.h > 0, `${onde}: tamanho inválido`);
  checar(Array.isArray(d.comodos) && d.comodos.length, `${onde}: sem cômodos`);
  checar(d.pacote, `${onde}: sem pacote de voz`);
  const idsC = new Set();
  (d.comodos || []).forEach((c) => {
    checar(c.id && !idsC.has(c.id), `${onde}: cômodo com id repetido ou vazio: ${c.id}`); idsC.add(c.id);
    const r = c.rect;
    checar(r && r.x >= 0 && r.y >= 0 && r.x + r.w <= g.w && r.y + r.h <= g.h, `${onde}/${c.id}: rect fora do tamanho`);
    checar(r && r.h >= 3, `${onde}/${c.id}: rect precisa de pelo menos 3 fileiras (2 de parede + chão)`);
    checar(I.PISOS[c.piso], `${onde}/${c.id}: piso "${c.piso}" não existe`);
    checar(I.PAREDES[c.parede], `${onde}/${c.id}: parede "${c.parede}" não existe`);
    checarIngles(c.placa, `${onde}/${c.id}`);
  });
  // saída e spawn
  if (d.entrada) {
    // andar de uma matéria dentro de um prédio: pode não ter porta para o mapa, mas aí tem escada
    if (ANFITRIAO[d.lugar] && !d.saida) checar((d.escadas || []).length, `${onde}: sem saida nem escada (matéria dentro de "${ANFITRIAO[d.lugar]}")`);
    else if (checar(d.saida, `${onde}: interior de entrada sem saida`)) {
      checar(andavel(g, d.saida), `${onde}: saída (${d.saida.x},${d.saida.y}) não é andável`);
      const c = (d.comodos || []).find((c) => d.saida.x >= c.rect.x && d.saida.x < c.rect.x + c.rect.w && d.saida.y === c.rect.y + c.rect.h - 1);
      checar(c, `${onde}: a saída precisa ficar na última fileira de um cômodo`);
      if (!g.dentro(d.saida.x, d.saida.y + 1) || g.comodo[d.saida.y + 1][d.saida.x]) avisos.push(`${onde}: sem vão escuro abaixo da saída (a porta de fora não aparece)`);
    }
    if (checar(d.spawn, `${onde}: interior de entrada sem spawn`)) {
      checar(andavel(g, d.spawn), `${onde}: spawn (${d.spawn.x},${d.spawn.y}) não é andável`);
      if (d.saida) checar(d.spawn.x === d.saida.x && d.spawn.y === d.saida.y - 1, `${onde}: spawn precisa ficar 1 tile acima da saída`);
      checar(!ehEscada(d, d.spawn), `${onde}: spawn em cima de escada`);
    }
  } else if (d.saida) avisos.push(`${onde}: saida num interior que não é de entrada (ignorada pelo mapa)`);
  // escadas
  (d.escadas || []).forEach((e, i) => {
    const o = `${onde}: escada ${i} (${e.x},${e.y})`;
    checar(andavel(g, e), `${o} não é andável`);
    checar(g.dentro(e.x, e.y) && g.chao[e.y][e.x], `${o} fora do chão`);
    const dest = porId.get(e.para);
    if (!checar(dest, `${o}: destino "${e.para}" não existe`)) return;
    checar(predio(dest.lugar) === predio(d.lugar), `${o}: destino "${e.para}" é de outro prédio`);
    if (e.olhar) checar(Math.abs(e.olhar.x) + Math.abs(e.olhar.y) > 0, `${o}: olhar vazio`);
    if (e.sentido) checar(['sobe', 'desce'].includes(e.sentido), `${o}: sentido deve ser 'sobe' ou 'desce'`);
  });
  // objetos
  let interativos = 0;
  (d.objetos || []).forEach((o, i) => {
    const on = `${onde}: objeto ${i} (${o.tipo} em ${o.x},${o.y})`;
    if (!checar(I.OBJETOS[o.tipo], `${on}: tipo não existe`)) return;
    const dm = I.dimensoes(o);
    checar(o.x >= 0 && o.y >= 0 && o.x + dm.w <= g.w && o.y + dm.h <= g.h, `${on}: fora do tamanho`);
    if (I.ehParede(o)) {
      let naParede = true;
      for (let y = o.y; y < o.y + dm.h; y++) for (let x = o.x; x < o.x + dm.w; x++) if (!g.dentro(x, y) || !g.parede[y][x]) naParede = false;
      if (!naParede) avisos.push(`${on}: enfeite de parede fora das 2 fileiras da parede`);
    } else {
      let noChao = true;
      for (let y = o.y; y < o.y + dm.h; y++) for (let x = o.x; x < o.x + dm.w; x++) if (!g.dentro(x, y) || !g.chao[y][x]) noChao = false;
      checar(noChao, `${on}: móvel fora do chão`);
      const pisa = (p) => p && p.x >= o.x && p.x < o.x + dm.w && p.y >= o.y && p.y < o.y + dm.h;
      checar(!pisa(d.saida) && !pisa(d.spawn) && !(d.escadas || []).some(pisa), `${on}: em cima da saída, do spawn ou de escada`);
    }
    if (I.interativo(o)) {
      interativos++;
      checar(o.nome, `${on}: interativo sem nome`);
      [].concat(o.fala || []).forEach((f) => { checarIngles(f, on); longa(f, on); });
      checarIngles(o.nome, on);
      if (o.acao) checarAcao(o.acao, on, false);
    }
  });
  checar(interativos >= 3, `${onde}: só ${interativos} objetos interativos (mínimo 3)`);
  // NPCs sem sobrepor
  (d.npcs || []).forEach((n) => {
    const s = I.grade(Object.assign({}, d, { npcs: [] }));
    checar(s.dentro(n.x, n.y) && s.chao[n.y][n.x] && !s.solido[n.y][n.x], `${onde}: NPC ${n.id} em (${n.x},${n.y}) fora do chão livre`);
    // a grade torna saída, spawn e escadas andáveis depois dos NPCs: ali o NPC não fica sólido
    const pisa = (p) => p && p.x === n.x && p.y === n.y;
    checar(!pisa(d.saida) && !pisa(d.spawn) && !(d.escadas || []).some(pisa), `${onde}: NPC ${n.id} em (${n.x},${n.y}): em cima da saída, do spawn ou de escada`);
  });
});

// ações de NPC/objeto
function checarAcao(a, onde, deNpc) {
  if (!checar(a && a.tipo, `${onde}: ação sem tipo`)) return;
  if (a.tipo === 'sala') {
    const m = Reino.materia(a.materia);
    if (checar(m, `${onde}: matéria "${a.materia}" não existe`)) checar(m.salas.some((s) => s.id === a.sala), `${onde}: sala "${a.sala}" não existe em ${a.materia}`);
  } else if (a.tipo === 'treino') checar(Reino.materia(a.materia), `${onde}: matéria "${a.materia}" não existe`);
  else if (a.tipo === 'prova') checar(Reino.prova(a.prova), `${onde}: prova "${a.prova}" não existe`);
  else if (a.tipo === 'tela') {
    checar(TELAS.includes(a.tela), `${onde}: tela "${a.tela}" não existe (${TELAS.join(', ')})`);
    if (a.materia) checar(Reino.materia(a.materia), `${onde}: matéria "${a.materia}" não existe`);
  } else if (a.tipo === 'guia') {
    checar(LUGARES.has(a.lugar), `${onde}: lugar do guia "${a.lugar}" não existe`);
    if (a.livro) checar(Reino.materia(a.livro), `${onde}: livro "${a.livro}" não existe`);
  } else if (a.tipo === 'unicornio') checar(Number.isInteger(a.indice), `${onde}: ação unicornio sem indice`);
  else if (ACOES_EXTRAS.includes(a.tipo)) {
    // ação registrada por um prédio (ex.: beber, curiosidade); o tema da curiosidade tem que existir
    if (a.tipo === 'curiosidade' && Reino.Observatorio) {
      const temas = Reino.Observatorio.temas().concat(['todas', 'telescopio']);
      checar(temas.includes(a.tema), `${onde}: tema de curiosidade "${a.tema}" não existe (${temas.join(', ')})`);
    }
  }
  else erros.push(`${onde}: tipo de ação "${a.tipo}" desconhecido`);
  if (deNpc && a.tipo === 'unicornio') erros.push(`${onde}: ação unicornio é só para objetos`);
}

// NPCs
const idsNpc = new Map();
const atividades = new Map();   // 'sala:h1' → [{interior, comodo, npc}]
defs.forEach((d) => {
  const g = grades.get(d.id);
  (d.npcs || []).forEach((n) => {
    const on = `${d.id}: NPC ${n.id}`;
    checar(n.id && !idsNpc.has(n.id), `${on}: id repetido ou vazio`); idsNpc.set(n.id, d.id);
    checar(n.nome, `${on}: sem nome`);
    const uni = n.nome && nomeDeUnicornio(n.nome);
    checar(!uni, `${on}: o nome "${n.nome}" usa o nome de unicórnio "${uni}"`);
    checarIngles(n.nome, on);
    if (checar(n.voz, `${on}: sem voz`)) {
      if (!Reino.config.vozes[n.voz]) avisos.push(`${on}: perfil de voz "${n.voz}" ainda não existe em Reino.config.vozes`);
    }
    checar(n.sprite && n.sprite.base, `${on}: sem sprite.base`);
    Extras.chavesDoSprite(Reino, n.sprite, on).forEach((a) => avisos.push(a));
    checarAcao(n.acao, on, true);
    const f = n.falas || {};
    ['oi', 'nova', 'feita', 'bloqueada', 'depois'].forEach((k) => {
      if (f[k] !== undefined) checar(Array.isArray(f[k]), `${on}: falas.${k} deve ser lista`);
      (f[k] || []).forEach((s) => { checar(typeof s === 'string' && s.trim(), `${on}: fala vazia em ${k}`); checarIngles(s, on); longa(s, on); });
    });
    if (n.acao && ['sala', 'treino', 'prova'].includes(n.acao.tipo)) {
      const k = n.acao.tipo + ':' + (n.acao.tipo === 'prova' ? n.acao.prova : n.acao.tipo === 'sala' ? n.acao.sala : n.acao.materia);
      const comodo = g && g.dentro(n.x, n.y) ? g.comodo[n.y][n.x] : null;
      if (!atividades.has(k)) atividades.set(k, []);
      atividades.get(k).push({ interior: d.id, lugar: d.lugar, comodo, npc: n.id });
    }
  });
});
// cada sala/treino/prova: exatamente um NPC, em cômodos distintos dentro do prédio
atividades.forEach((lista, k) => checar(lista.length === 1, `${k}: ${lista.length} NPCs (${lista.map((x) => x.npc).join(', ')}); precisa de exatamente 1`));
const porComodo = new Map();
atividades.forEach((lista, k) => lista.forEach((x) => {
  const ck = x.interior + '/' + x.comodo;
  if (!porComodo.has(ck)) porComodo.set(ck, []);
  porComodo.get(ck).push(k);
}));
porComodo.forEach((ks, ck) => checar(ks.length === 1, `${ck}: ${ks.join(', ')} no mesmo cômodo (cada atividade no seu cômodo)`));
// prédios que já têm interior precisam de todas as suas atividades lá dentro
const esperadas = {};
Reino.materias.forEach((m) => {
  esperadas['materia:' + m.id] = m.salas.map((s) => 'sala:' + s.id);
  (esperadas.castelo = esperadas.castelo || []).push('treino:' + m.id);
});
esperadas.escola = Reino.provas.map((p) => 'prova:' + p.id);
Object.keys(esperadas).filter(doSo).forEach((l) => {
  if (porLugar[l]) {
    esperadas[l].forEach((k) => {
      const onde = atividades.get(k) || [];
      checar(onde.some((x) => x.lugar === l), `${l}: a atividade ${k} precisa de um NPC dentro do prédio`);
    });
  } else {
    const soltas = esperadas[l].filter((k) => !atividades.has(k));
    listas.push(`sem interior ainda: ${l} (${esperadas[l].length} atividades${soltas.length ? ', sem NPC: ' + soltas.join(' ') : ''})`);
  }
});

// escadas pareadas: par no destino e lado de chegada (validar-escadas.js)
Escadas.checar({ Reino, defs, grades, erros, avisos });

// alcançabilidade a partir do spawn da entrada, atravessando escadas
const chave = (id, x, y) => id + ':' + x + ',' + y;
Object.keys(porLugar).filter(doSo).forEach((l) => {
  const ent = porLugar[l].find((d) => d.entrada);
  if (!ent || !ent.spawn || !grades.get(ent.id)) return;
  const visto = new Set();
  const fila = [[ent.id, ent.spawn.x, ent.spawn.y]];
  visto.add(chave(ent.id, ent.spawn.x, ent.spawn.y));
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  while (fila.length) {
    const [id, x, y] = fila.shift();
    const d = porId.get(id), g = grades.get(id);
    const ie = (d.escadas || []).findIndex((e) => e.x === x && e.y === y), e = d.escadas && d.escadas[ie];
    const c = e && Escadas.chegada(Reino, d, ie);
    if (c && grades.get(e.para)) {
      const k = chave(e.para, c.x, c.y);
      if (!visto.has(k)) { visto.add(k); fila.push([e.para, c.x, c.y]); }
    }
    DIRS.forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      if (!g.dentro(nx, ny) || g.solido[ny][nx]) return;
      if (dx && dy && (g.solido[y][nx] || g.solido[ny][x])) return;
      if (!passoLivre(g, { x, y }, { x: nx, y: ny })) return;
      const k = chave(id, nx, ny);
      if (!visto.has(k)) { visto.add(k); fila.push([id, nx, ny]); }
    });
  }
  porLugar[l].forEach((d) => {
    const g = grades.get(d.id);
    if (!g) return;
    const alc = (x, y) => visto.has(chave(d.id, x, y));
    const vizAlc = (tiles) => tiles.some((t) => [[0, 1], [0, -1], [1, 0], [-1, 0], [0, 0]].some(([dx, dy]) => alc(t.x + dx, t.y + dy)));
    if (d.saida) checar(alc(d.saida.x, d.saida.y), `${d.id}: a saída não é alcançável a partir do spawn`);
    (d.escadas || []).forEach((e, i) => checar(alc(e.x, e.y), `${d.id}: escada ${i} não é alcançável a partir do spawn`));
    (d.npcs || []).forEach((n) => checar(vizAlc([{ x: n.x, y: n.y }]), `${d.id}: NPC ${n.id} sem vizinho livre alcançável`));
    (d.objetos || []).forEach((o, i) => {
      if (!I.interativo(o)) return;
      const dm = I.dimensoes(o), ts = [];
      for (let y = o.y; y < o.y + dm.h; y++) for (let x = o.x; x < o.x + dm.w; x++) ts.push({ x, y });
      checar(vizAlc(ts), `${d.id}: objeto interativo ${i} (${o.tipo}) sem vizinho livre alcançável`);
    });
    // chão livre que não se alcança (aviso: pode ser só enfeite)
    const presos = [];
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (g.chao[y][x] && !g.solido[y][x] && !alc(x, y)) presos.push(`(${x},${y})`);
    if (presos.length) avisos.push(`${d.id}: ${presos.length} tiles de chão livre que ela não alcança: ${presos.slice(0, 10).join(' ')}`);
  });
});

// critério de "rico": ≥15 tipos por cômodo; nenhuma janela 3×3 de chão vazia fora dos corredores
const resumo = [];
defs.forEach((d) => {
  const g = grades.get(d.id);
  if (!g) return;
  const corredor = (x, y) => (d.corredores || []).some((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
  const linhasC = [];
  (d.comodos || []).forEach((c) => {
    const r = c.rect;
    const tipos = new Set();
    let inter = 0;
    (d.objetos || []).forEach((o) => {
      if (!I.OBJETOS[o.tipo]) return;
      const dm = I.dimensoes(o);
      const toca = o.x < r.x + r.w && o.x + dm.w > r.x && o.y < r.y + r.h && o.y + dm.h > r.y;
      if (toca) { tipos.add(o.tipo); if (I.interativo(o)) inter++; }
    });
    checar(tipos.size >= 15, `${d.id}/${c.id}: só ${tipos.size} tipos de objeto (mínimo 15)`);
    const vazias = [];
    for (let y = r.y + 2; y + 3 <= r.y + r.h; y++) for (let x = r.x; x + 3 <= r.x + r.w; x++) {
      let chaoTodo = true, ocupada = false, noCorredor = false;
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
        const tx = x + i, ty = y + j;
        if (!g.chao[ty][tx] || g.porta[ty][tx]) chaoTodo = false;
        if (g.ocupado[ty][tx]) ocupada = true;
        if (corredor(tx, ty)) noCorredor = true;
      }
      if (chaoTodo && !ocupada && !noCorredor) vazias.push(`(${x},${y})`);
    }
    checar(!vazias.length, `${d.id}/${c.id}: janelas 3×3 de chão vazias em ${vazias.slice(0, 8).join(' ')}${vazias.length > 8 ? '…' : ''}`);
    const npcs = (d.npcs || []).filter((n) => n.x >= r.x && n.x < r.x + r.w && n.y >= r.y && n.y < r.y + r.h).length;
    linhasC.push(`    ${c.id} (${c.nome || ''}): ${tipos.size} tipos, ${inter} interativos, ${npcs} NPCs`);
  });
  const totInter = (d.objetos || []).filter((o) => I.interativo(o)).length;
  resumo.push(`✔ ${d.id} — ${d.nome} [${d.lugar}${d.entrada ? ', entrada' : ''}]: ${d.tamanho.w}×${d.tamanho.h}, ${(d.comodos || []).length} cômodo(s), ${(d.objetos || []).length} objetos, ${totInter} interativos, ${(d.npcs || []).length} NPCs, ${(d.escadas || []).length} escada(s)`);
  resumo.push(...linhasC);
});

// personagens registrados com predio (Reino.personagensDoPredio): o id é o do interior (andar da torre: o do
// andar; interior padrão: 'padrao-<matéria>'); prédio antigo não tem vagas, então sem x/y ele não aparece
(Reino._personagensPredio || []).filter((r) => doSo(r.predio)).forEach((r) => {
  const d = Reino.interiores.find((i) => i.id === r.predio);
  if (!checar(d, `personagem ${r.id}: predio '${r.predio}' não é id de interior (${Reino.interiores.map((i) => i.id).join(', ')})`)) return;
  checar((d.npcs || []).some((n) => n.id === r.id), `personagem ${r.id}: registrado em '${r.predio}' sem x/y, e esse prédio não tem vagas (prédio antigo): dê x e y (tile de chão livre do interior)`);
});

// reservas de personagem (plano paralelo): completas e preenchidas
{ const r = Extras.reservas(Reino, doSo); erros.push(...r.erros); avisos.push(...r.avisos); }

// sprites do elenco e de registrarPersonagem; emoji do menu sem desenho (Reino.registrarLugar)
if (!SO && temNpcs) Object.keys(Reino.NPCs.ELENCO).forEach((id) => Extras.chavesDoSprite(Reino, Reino.NPCs.ELENCO[id].sprite, `elenco ${id}`).forEach((a) => avisos.push(a)));
(Reino.lugaresRegistrados || []).filter((l) => doSo(l.id)).forEach((l) => Extras.emojiDoMenu(ctx, l).forEach((a) => avisos.push(a)));

if (DETALHES) {
  console.log(`Biblioteca: ${Object.keys(I.OBJETOS).length} tipos de objeto, ${Object.keys(I.PISOS).length} pisos, ${Object.keys(I.PAREDES).length} paredes${temNpcs ? '' : ' (js/personagens/npcs.js ainda não existe)'}`);
  resumo.forEach((l) => console.log(l));
  listas.forEach((l) => console.log('• ' + l));
}
avisos.forEach((a) => console.log('⚠ ' + a));
// a última linha é o resumo (o validar-tudo mostra a última)
const conta = `${defs.length} interiores${SO ? ` de ${SO}` : ''}, ${defs.reduce((t, d) => t + (d.npcs || []).length, 0)} NPCs, ${avisos.length} aviso(s)`;
if (erros.length) {
  erros.forEach((e) => console.log('✘ ' + e));
  console.log(`Resumo: ${erros.length} erro(s) — ${conta}`);
  // exitCode, não exit(): com a saída num pipe, exit() cortaria a lista (o esqueleto do npm run novo tem centenas)
  process.exitCode = 1;
} else console.log(`Tudo certo! ${conta}${DETALHES ? '' : ' (lista por cômodo: --detalhes)'}`);
