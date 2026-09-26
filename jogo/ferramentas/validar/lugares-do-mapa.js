// Os lugares do mapa lidos dos DADOS, sem DOM (para validar-interiores.js e os testes):
// Mapa.LUGARES_FIXOS e Mapa.CLAREIRAS (mundo/lugares.js, avaliado num vm com window.Mapa = {}),
// os registrados pelos prédios (Reino.lugaresRegistrados) e as matérias (lugar.rect ou uma clareira).
// Nenhuma lista escrita à mão: prédio novo que chama Reino.registrarLugar já aparece aqui.
// O terreno (rua, praça, lago, fonte, árvores) vem do próprio Mapa.criar (mundo/mapa.js), rodado num vm.
// Linha de comando: node jogo/ferramentas/validar/lugares-do-mapa.js --livres 5x4   (ou npm run ver -- --livres 5x4)
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../jogo-no-node');

// tamanho do mapa em tiles, do próprio mundo/mapa.js (var W = 36, H = 28)
function tamanho() {
  const t = fs.readFileSync(Jogo.arquivo('mundo/mapa'), 'utf8').match(/var W = (\d+), H = (\d+)/);
  if (!t) throw new Error('lugares-do-mapa: não achei "var W = .., H = .." em mundo/mapa.js');
  return { w: +t[1], h: +t[2] };
}
function mapaFixo() {
  const ctx = vm.createContext({ Mapa: {} });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(Jogo.arquivo('mundo/lugares'), 'utf8'), ctx, { filename: 'mundo/lugares.js' });
  return ctx.Mapa;
}
// todos os lugares como no Mapa.criar: { id, rect, caminho?, registrado? }
function todos(ctx) {
  const M = mapaFixo();
  const R = ctx.Reino;
  const fixos = M.LUGARES_FIXOS.map((f) => ({ id: f.id, rect: f.rect, caminho: f.caminho }));
  const regs = (R.lugaresRegistrados || []).map((f) => ({ id: f.id, rect: f.rect, caminho: f.caminho, registrado: true }));
  // matéria com lugar.dentro mora num prédio que já existe: fora do mapa e fora da vez das clareiras
  let k = 0;
  const mats = (R.materias || []).filter((m) => !(m.lugar && m.lugar.dentro))
    .map((m) => ({ id: 'materia:' + m.id, rect: (m.lugar && m.lugar.rect) || M.CLAREIRAS[k++ % M.CLAREIRAS.length] }));
  return fixos.concat(mats, regs);
}
// roda o Mapa.criar de verdade num vm (arte/desenho.js dá o rng; o resto do Reino não entra):
// { tipo, solido } do jogo. Sem lugares nem matérias, sobra só o terreno fixo (rua, praça, lago, fonte, Claude, borda).
// rect dentro do mapa? (um fora, como o marcador -1,-1 de um esqueleto, quebraria o Mapa.criar: fica de fora e o checar acusa)
function rectOk(r) {
  const { w, h } = tamanho();
  return !!r && r.x >= 0 && r.y >= 0 && r.w > 0 && r.h > 0 && r.x + r.w <= w && r.y + r.h <= h;
}
// os lugares com rect fora do mapa, que a grade ignora (para avisar)
function ignorados(ctx) {
  return (ctx.Reino.lugaresRegistrados || []).filter((l) => !rectOk(l.rect)).map((l) => l.id)
    .concat((ctx.Reino.materias || []).filter((m) => m.lugar && m.lugar.rect && !rectOk(m.lugar.rect)).map((m) => 'materia:' + m.id));
}
function grade(ctx, soTerreno) {
  const regs = (ctx.Reino.lugaresRegistrados || []).filter((l) => rectOk(l.rect));
  const g = vm.createContext({ Reino: { lugaresRegistrados: soTerreno ? [] : regs } });
  g.window = g;
  ['arte/desenho', 'mundo/mapa', 'mundo/lugares'].forEach((n) => vm.runInContext(fs.readFileSync(Jogo.arquivo(n), 'utf8'), g, { filename: n }));
  if (soTerreno) g.Mapa.LUGARES_FIXOS = [];
  g.Mapa.criar(soTerreno ? [] : (ctx.Reino.materias || []).filter((m) => !(m.lugar && m.lugar.rect) || rectOk(m.lugar.rect)));
  return { tipo: g.Mapa._interno.tipo, solido: g.Mapa._interno.solido, decor: g.Mapa._interno.decor };
}
// o que o terreno fixo tem no tile (rua, praça, água, sólido), ou null se é chão
function noTerreno(t, x, y) {
  const k = t.tipo[y][x];
  if (k === 'c') return 'rua';
  if (k === 'p') return 'praça';
  if (k === 'a') return 'água do lago';
  // sólido sem enfeite = fonte ou Claude; a borda é árvore. Árvore do sorteio não conta: o lugar a tira.
  const borda = x === 0 || y === 0 || x === t.tipo[0].length - 1 || y === t.tipo.length - 1;
  if (borda) return 'borda do mapa';
  if (t.solido[y][x] && !t.decor[y][x]) return 'fonte ou Claude';
  return null;
}
function ids(ctx) {
  const M = mapaFixo();
  return M.LUGARES_FIXOS.map((f) => f.id).concat((ctx.Reino.lugaresRegistrados || []).map((f) => f.id));
}
const cruza = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
// id repetido, registrado sem caminho, rect fora do mapa ou por cima de outro, caminho fora do mapa ou por dentro de um prédio
function checar(ctx) {
  const erros = [];
  const { w, h } = tamanho();
  const ls = todos(ctx);
  const terreno = grade(ctx, true);
  const vistos = new Set();
  ls.forEach((l, i) => {
    const onde = `lugar do mapa ${l.id}`;
    if (!l.id || vistos.has(l.id)) erros.push(`${onde}: id repetido ou vazio`);
    vistos.add(l.id);
    const r = l.rect;
    if (!r || !(r.x >= 0 && r.y >= 0 && r.w > 0 && r.h > 0 && r.x + r.w <= w && r.y + r.h <= h)) { erros.push(`${onde}: rect fora do mapa (${w}×${h})`); return; }
    if (l.registrado && !(Array.isArray(l.caminho) && l.caminho.length)) erros.push(`${onde}: lugar registrado sem caminho`);
    ls.slice(0, i).forEach((o) => { if (o.rect && cruza(r, o.rect)) erros.push(`${onde}: rect por cima de ${o.id}`); });
    const noRect = [];
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { const o = noTerreno(terreno, x, y); if (o) noRect.push(`${o} em ${x},${y}`); }
    if (noRect.length) erros.push(`${onde}: rect por cima de ${noRect.slice(0, 3).join(', ')}${noRect.length > 3 ? ` (+${noRect.length - 3})` : ''}`);
    (l.caminho || []).forEach(([x, y]) => {
      if (!(x >= 0 && y >= 0 && x < w && y < h)) { erros.push(`${onde}: caminho fora do mapa em ${x},${y}`); return; }
      const o = noTerreno(terreno, x, y);
      if (o && o !== 'rua' && o !== 'praça') erros.push(`${onde}: caminho passa por ${o} em ${x},${y}`);
      const em = ls.find((o) => o.rect && cruza({ x, y, w: 1, h: 1 }, o.rect));
      if (em) erros.push(`${onde}: caminho passa por dentro de ${em.id} em ${x},${y}`);
    });
  });
  // o que Reino.registrarLugar recusou (sem id ou sem caminho) nem entrou no mapa
  (ctx.Reino.lugaresRecusados || []).forEach((id) => erros.push(`lugar do mapa ${id}: Reino.registrarLugar recusou (sem id ou sem caminho)`));
  return erros;
}

/* Áreas livres: tile de chão ('g') do mapa de verdade, não sólido (árvore, arbusto, cristal, prédio) e fora do rect de
   todo lugar e de toda clareira. É a mesma regra da prévia do mapa com ?grade=1 (ferramentas/previas/mapa.html). */
function livresGrade(ctx) {
  const { w, h } = tamanho();
  const g = grade(ctx);
  const rects = todos(ctx).map((l) => l.rect).concat(mapaFixo().CLAREIRAS).filter(Boolean);
  const livre = [];
  for (let y = 0; y < h; y++) {
    livre.push([]);
    for (let x = 0; x < w; x++) livre[y].push(g.tipo[y][x] === 'g' && !g.solido[y][x] && !rects.some((r) => cruza({ x, y, w: 1, h: 1 }, r)));
  }
  return { w, h, g, rects, livre };
}
// caminho da frente da porta até a rua (4 direções), por tiles que o caminho pode limpar: fora de rect, de água e do sólido
// fixo; árvore e flor no meio saem (o Mapa.criar tira o enfeite do caminho). Na ordem do contrato: da rua até a porta.
function caminhoAteRua(L, terreno, r) {
  const porta = { x: r.x + Math.floor(r.w / 2), y: r.y + r.h - 1 };
  const ini = [porta.x, porta.y + 1];
  const pode = (x, y) => x > 0 && y > 0 && x < L.w - 1 && y < L.h - 1 && !cruza({ x, y, w: 1, h: 1 }, r)
    && !L.rects.some((o) => cruza({ x, y, w: 1, h: 1 }, o)) && !noTerreno(terreno, x, y);
  if (!pode(...ini)) return null;
  const veio = new Map([[ini.join(), null]]);
  const fila = [ini];
  while (fila.length) {
    const [x, y] = fila.shift();
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = x + dx, ny = y + dy;
      if (L.g.tipo[ny] && (L.g.tipo[ny][nx] === 'c' || L.g.tipo[ny][nx] === 'p')) {
        const cam = [];
        for (let k = [x, y].join(); k; k = veio.get(k)) cam.push(k.split(',').map(Number));
        return cam;   // começa encostado na rua e termina na frente da porta
      }
      if (!veio.has(nx + ',' + ny) && pode(nx, ny)) { veio.set(nx + ',' + ny, [x, y].join()); fila.push([nx, ny]); }
    }
  }
  return null;
}
// rects livres de w×h, com o caminho sugerido, dos de caminho mais curto primeiro
function livres(ctx, w, h) {
  const L = livresGrade(ctx);
  const terreno = grade(ctx, true);
  const res = [];
  for (let y = 1; y + h < L.h; y++) for (let x = 1; x + w < L.w; x++) {
    let ok = true;
    for (let j = 0; j < h && ok; j++) for (let i = 0; i < w && ok; i++) ok = L.livre[y + j][x + i];
    if (!ok) continue;
    const rect = { x, y, w, h };
    const caminho = caminhoAteRua(L, terreno, rect);
    if (caminho) res.push({ rect, caminho });
  }
  return res.sort((a, b) => a.caminho.length - b.caminho.length || a.rect.y - b.rect.y || a.rect.x - b.rect.x);
}
// o Reino dos dados para a linha de comando: matérias + os lugar.js dos prédios (Reino.registrarLugar)
function reinoDosDados() {
  const ctx = Jogo.contexto({ console: { warn() {}, log() {} } });
  const lugaresJs = Jogo.manifesto.scripts.filter((s) => s.node && /^js\/interiores\/[^/]+\/lugar\.js$/.test(s.js)).map(Jogo.nome);
  return Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros'].concat(lugaresJs), grupos: ['materias'] }));
}
function imprimirLivres(tam) {
  const m = /^(\d+)x(\d+)$/.exec(tam || '');
  if (!m) throw new Error('--livres precisa de LARGURAxALTURA em tiles, ex.: --livres 5x4');
  const ctx = reinoDosDados();
  ignorados(ctx).forEach((id) => console.log(`⚠ ${id}: rect fora do mapa (ignorado aqui; o validar-interiores acusa)`));
  const lista = livres(ctx, +m[1], +m[2]);
  if (!lista.length) { console.log(`nenhum rect livre de ${tam} com caminho até a rua`); return; }
  console.log(`${lista.length} rect(s) livre(s) de ${tam} (chão sem rua, água, prédio, clareira nem sólido), caminho mais curto primeiro:`);
  lista.forEach((l) => console.log(`  rect: { x: ${l.rect.x}, y: ${l.rect.y}, w: ${l.rect.w}, h: ${l.rect.h} }, caminho: ${JSON.stringify(l.caminho)}`));
}

module.exports = { tamanho, todos, ids, checar, grade, rectOk, ignorados, livres, livresGrade, reinoDosDados, imprimirLivres };

if (require.main === module) {
  const i = process.argv.indexOf('--livres');
  if (i < 0) { console.log('Uso: node jogo/ferramentas/validar/lugares-do-mapa.js --livres 5x4'); process.exit(0); }
  try { imprimirLivres(process.argv[i + 1]); } catch (e) { console.error('✘ ' + e.message); process.exit(2); }
}
