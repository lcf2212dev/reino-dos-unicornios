// Confere os interiores (construções por dentro) antes de publicar.
// Uso: node ferramentas/validar-interiores.js
// Carrega config, unicórnios, matérias, provas, interiores.js, npcs.js (se existir) e
// interiores/*.js num vm SEM DOM (como listar-falas.js). Sai com código 1 se houver erro.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
const ctx = { console, setTimeout, clearTimeout };
ctx.window = ctx;
vm.createContext(ctx);
function carregar(rel, opcional) {
  const f = path.join(raiz, rel);
  if (!fs.existsSync(f)) { if (opcional) return false; throw new Error('faltando: ' + rel); }
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: rel });
  return true;
}
function pasta(rel) {
  const p = path.join(raiz, rel);
  // padrao.js vem por último: ele monta o interior das matérias que não têm um próprio
  const ordem = (a, b) => (a === 'padrao.js') - (b === 'padrao.js') || (a < b ? -1 : a > b ? 1 : 0);
  return fs.existsSync(p) ? fs.readdirSync(p).filter((f) => f.endsWith('.js')).sort(ordem).map((f) => rel + '/' + f) : [];
}
carregar('js/config.js');
carregar('js/unicornios.js');
pasta('js/materias').forEach((f) => carregar(f));
pasta('js/provas').forEach((f) => carregar(f));
carregar('js/interiores.js');
const temNpcs = carregar('js/npcs.js', true);
pasta('js/interiores').forEach((f) => carregar(f));

const Reino = ctx.Reino;
const I = Reino.Interiores;
const erros = [];
const avisos = [];
const listas = [];
function checar(cond, msg) { if (!cond) erros.push(msg); return !!cond; }

const LUGARES = new Set(['castelo', 'bau', 'estabulo', 'loja', 'escola'].concat(Reino.materias.map((m) => 'materia:' + m.id)));
const TELAS = ['livro', 'plano', 'estabulo', 'loja', 'bau', 'ovos'];
const defs = Reino.interiores;
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
Reino.materias.forEach((m) => (m.unicornios || []).forEach((u) => NOMES_UNI.add(u.nome)));
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

// ids únicos
defs.forEach((d) => {
  checar(d.id && !porId.has(d.id), `interior com id repetido ou vazio: ${d.id}`);
  porId.set(d.id, d);
});

// um interior de entrada por lugar
const porLugar = {};
defs.forEach((d) => {
  checar(LUGARES.has(d.lugar), `${d.id}: lugar "${d.lugar}" não existe (${[...LUGARES].join(', ')})`);
  (porLugar[d.lugar] = porLugar[d.lugar] || []).push(d);
});
Object.keys(porLugar).forEach((l) => {
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
    if (checar(d.saida, `${onde}: interior de entrada sem saida`)) {
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
    checar(dest.lugar === d.lugar, `${o}: destino "${e.para}" é de outro prédio`);
    const gd = grades.get(e.para);
    if (checar(e.chegada, `${o}: sem chegada`) && gd) {
      checar(andavel(gd, e.chegada), `${o}: chegada (${e.chegada.x},${e.chegada.y}) em "${e.para}" não é andável`);
      checar(!ehEscada(dest, e.chegada), `${o}: chegada em cima de escada em "${e.para}"`);
      checar(!(dest.saida && dest.saida.x === e.chegada.x && dest.saida.y === e.chegada.y), `${o}: chegada em cima do tapete de saída`);
    }
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
Object.keys(esperadas).forEach((l) => {
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

// alcançabilidade a partir do spawn da entrada, atravessando escadas
const chave = (id, x, y) => id + ':' + x + ',' + y;
Object.keys(porLugar).forEach((l) => {
  const ent = porLugar[l].find((d) => d.entrada);
  if (!ent || !ent.spawn || !grades.get(ent.id)) return;
  const visto = new Set();
  const fila = [[ent.id, ent.spawn.x, ent.spawn.y]];
  visto.add(chave(ent.id, ent.spawn.x, ent.spawn.y));
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  while (fila.length) {
    const [id, x, y] = fila.shift();
    const d = porId.get(id), g = grades.get(id);
    const e = (d.escadas || []).find((e) => e.x === x && e.y === y);
    if (e && e.chegada && grades.get(e.para)) {
      const k = chave(e.para, e.chegada.x, e.chegada.y);
      if (!visto.has(k)) { visto.add(k); fila.push([e.para, e.chegada.x, e.chegada.y]); }
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

console.log(`Biblioteca: ${Object.keys(I.OBJETOS).length} tipos de objeto, ${Object.keys(I.PISOS).length} pisos, ${Object.keys(I.PAREDES).length} paredes${temNpcs ? '' : ' (js/npcs.js ainda não existe)'}`);
resumo.forEach((l) => console.log(l));
listas.forEach((l) => console.log('• ' + l));
avisos.forEach((a) => console.log('⚠ ' + a));
if (erros.length) {
  erros.forEach((e) => console.log('✘ ' + e));
  process.exit(1);
}
console.log('Tudo certo!');
