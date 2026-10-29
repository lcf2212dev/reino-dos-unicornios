// e2e --mudancas: só as imagens das partes do jogo que mudaram desde o merge-base com a main (com as mudanças sem
// commit, os arquivos novos e o caminho velho dos movidos). É a volta rápida durante o trabalho; o fecho continua
// sendo o e2e completo.
//   arquivosMudados(repo)        caminhos (relativos à raiz) mudados desde git merge-base HEAD main
//   idsDoJogo()                  o que cada pasta registra, com o jogo carregado no Node script a script:
//                                { harness, interiores: { pasta: [ids] }, fora: [pastas com fora.js],
//                                  materias: { pasta: [{ id, salas, lugar }] }, personagens: { chave: [ids] },
//                                  npcs: { interior: [ids] }, mencoes: { materia: [pastas de interior que citam o id] } }
//   escolher(arquivos, ids)      { modo: 'tudo' | 'cenas' | 'dados', regex, motivos: [texto] }
// Mapa (o que uma pasta mexe também fora dela entra junto):
//   interiores/<p>/** → interior, cômodos e NPCs de <p>; tela-<p>*; o mapa, se a pasta desenha a fachada (fora.js);
//     os prédios onde ficam os personagens registrados ali (ex.: os ETs do observatorio nos planetas); prédio de
//     planeta → também as telas da viagem (álbum de ETs, voo, foguete)
//   conteudo/materias/<m>/** → salas, treino, telas de matéria e livro de <m>, desafios; o prédio anfitrião
//     (lugar.interior) e os que citam o id da matéria (ex.: portugues.js gera as estações da portugues4); cômodos e
//     NPCs gerados por matéria (castelo: ala-<m>, cav-<m>); todas as telas e o mapa (unicórnios, lugares, baú, pais…)
//   conteudo/provas/** → provas, a tela da Escola e os prédios das professoras registradas ali
//   harness do e2e e o resto de jogo/ (css, motor, ui, nucleo, sistemas, arte, personagens, mundo, manifesto,
//     index, servidor…) → tudo; jogo/ferramentas/** e fora de jogo/ → nenhuma imagem (só dados e vozes).
//   Pasta que não dá para mapear (nenhum id achado) → tudo.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { arquivosHarness } = require('./e2e-disco');

const git = (repo, ...a) => execFileSync('git', ['-C', repo, '-c', 'core.quotePath=false', ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

function arquivosMudados(repo, ramo = 'main') {
  const mb = git(repo, 'merge-base', 'HEAD', ramo).trim();
  const linhas = (t) => t.split('\n').map((l) => l.trim()).filter(Boolean);
  return [...new Set(linhas(git(repo, 'diff', '--name-only', '--no-renames', mb)).concat(linhas(git(repo, 'ls-files', '--others', '--exclude-standard'))))].sort();
}

function idsDoJogo() {
  const Jogo = require('../jogo-no-node');
  const mudo = { log() {}, warn() {}, error() {}, info() {} };
  const ctx = Jogo.contexto({ console: mudo, Math, Date });
  const r = { harness: arquivosHarness((f) => fs.readFileSync(path.join(__dirname, f))), interiores: {}, fora: [], materias: {}, personagens: {}, npcs: {}, mencoes: {} };
  const ids = (k) => new Set(((ctx.Reino || {})[k] || []).map((d) => d.id));
  const pers = () => new Set(Object.keys((ctx.Reino || {}).personagens || {}));
  const junta = (o, k, l) => { (o[k] = o[k] || []).push(...l); };
  for (const s of Jogo.ordemDosPredios(Jogo.scripts())) {
    const ai = ids('interiores'), am = ids('materias'), ap = pers();
    Jogo.carregar(ctx, [s]);
    const p = s.js.split('/');
    const chave = p[1] === 'interiores' && p.length > 3 ? `interiores/${p[2]}`
      : p[1] === 'conteudo' && p[2] === 'materias' && p.length > 4 ? `materias/${p[3]}` : p[1] === 'conteudo' && p[2] === 'provas' ? 'provas' : null;
    if (!chave) continue;
    junta(r.personagens, chave, [...pers()].filter((x) => !ap.has(x)));
    if (p[1] === 'interiores') junta(r.interiores, p[2], [...ids('interiores')].filter((x) => !ai.has(x)));
    if (p[2] === 'materias') {
      junta(r.materias, p[3], ctx.Reino.materias.filter((m) => !am.has(m.id))
        .map((m) => ({ id: m.id, salas: (m.salas || []).map((x) => x.id), lugar: (m.lugar && m.lugar.interior) || null })));
    }
  }
  (ctx.Reino.interiores || []).forEach((d) => { r.npcs[d.id] = (Array.isArray(d.npcs) ? d.npcs : []).map((n) => n.id); });
  // pasta sem registro próprio (ex.: matematica, montada pelo padrao.js): os ids com o nome dela
  const todos = [...ids('interiores')], raizInt = path.join(Jogo.raiz, 'js', 'interiores');
  const pastas = fs.readdirSync(raizInt, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  const textos = {};
  pastas.forEach((p) => {
    if (!(r.interiores[p] || []).length) r.interiores[p] = todos.filter((id) => id === p || id.endsWith('-' + p));
    if (fs.existsSync(path.join(raizInt, p, 'fora.js'))) r.fora.push(p);
    textos[p] = fs.readdirSync(path.join(raizInt, p)).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(raizInt, p, f), 'utf8')).join('\n');
  });
  ctx.Reino.materias.forEach((m) => { r.mencoes[m.id] = pastas.filter((p) => new RegExp(`['"]${esc(m.id)}['"]`).test(textos[p])); });
  return r;
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ou = (l) => { l = [...new Set(l)]; return l.length === 1 ? esc(l[0]) : `(?:${l.map(esc).join('|')})`; };

function escolher(arquivos, ids) {
  const partes = new Set(), motivos = [];
  let tudo = false, dados = false;
  const vistos = new Set();
  const uma = (chave, fn) => { if (!vistos.has(chave)) { vistos.add(chave); fn(); } };
  const pastaDe = (id) => Object.keys(ids.interiores).find((p) => ids.interiores[p].includes(id));
  // cenas de uma lista de interiores (prédio de planeta: também as telas da viagem)
  const predios = (l) => {
    if (!l.length) return;
    partes.add(`(?:interior|comodo|npc)-${ou(l)}(?:-|$)`);
    if (l.some((id) => /^planeta-/.test(id))) partes.add('tela-(?:album-ets|voo|foguete)$');
  };
  // prédios onde ficam os personagens registrados numa pasta
  const anfitrioes = (chave) => {
    const ps = new Set((ids.personagens || {})[chave] || []);
    return Object.keys(ids.npcs || {}).filter((i) => ids.npcs[i].some((n) => ps.has(n)));
  };
  for (const f of arquivos) {
    const p = f.split('/');
    if (p[0] !== 'jogo') { dados = true; uma('fora', () => motivos.push('fora de jogo/: nenhuma imagem')); continue; }
    if (p[1] === 'ferramentas') {
      if (p[2] === 'testes' && p.length === 4 && (ids.harness || []).includes(p[3])) { tudo = true; uma(f, () => motivos.push(`${f}: harness do e2e → tudo`)); }
      else { dados = true; uma('ferramentas', () => motivos.push('jogo/ferramentas/: nenhuma imagem')); }
      continue;
    }
    if (p[1] === 'js' && p[2] === 'interiores' && p.length > 4) {
      const lista = (ids.interiores[p[3]] || []);
      if (!lista.length) { tudo = true; uma(f, () => motivos.push(`${f}: pasta sem interior conhecido → tudo`)); continue; }
      const outros = anfitrioes(`interiores/${p[3]}`).filter((i) => !lista.includes(i));
      predios(lista.concat(outros));
      partes.add(`tela-${ou([p[3]].concat(lista))}(?:-|$)`);
      const fora = (ids.fora || []).includes(p[3]);
      if (fora) partes.add('mapa(?:-inicio|-avancado)?$');
      uma('i:' + p[3], () => motivos.push(`jogo/js/interiores/${p[3]}/ → interior, cômodos, NPCs e telas de ${lista.join(', ')}` +
        (outros.length ? `; personagens dela em ${outros.join(', ')}` : '') + (fora ? '; o mapa (fora.js: a fachada)' : '')));
      continue;
    }
    if (p[1] === 'js' && p[2] === 'conteudo' && p[3] === 'materias' && p.length > 5) {
      const ms = (ids.materias[p[4]] || []);
      if (!ms.length) { tudo = true; uma(f, () => motivos.push(`${f}: pasta sem matéria conhecida → tudo`)); continue; }
      const salas = [].concat(...ms.map((m) => m.salas)), mids = ms.map((m) => m.id);
      if (salas.length) partes.add(`sala-${ou(salas)}-(?:intro|resumo|desafio1)$`);
      partes.add(`(?:treino|tela-materia|tela-livro)-${ou(mids)}$`);
      partes.add('desafio-');
      // prédio anfitrião, os que citam o id, os personagens da pasta; cômodos/NPCs gerados por matéria (castelo)
      const pastas = new Set([].concat(...ms.map((m) => (ids.mencoes[m.id] || []).concat(m.lugar ? [pastaDe(m.lugar)] : []))).filter(Boolean));
      const anf = [...new Set([].concat(...[...pastas].map((x) => ids.interiores[x] || [])).concat(anfitrioes(`materias/${p[4]}`)))];
      predios(anf);
      partes.add(`(?:comodo|npc)-.*-${ou(mids)}$`);
      partes.add('tela-'); partes.add('mapa(?:-inicio|-avancado)?$');
      uma('m:' + p[4], () => motivos.push(`jogo/js/conteudo/materias/${p[4]}/ → salas, treino, telas de matéria e livro de ${mids.join(', ')}, ` +
        `desafios${anf.length ? `, os prédios ${anf.join(', ')}` : ''}, cômodos/NPCs gerados por matéria, todas as telas e o mapa`));
      continue;
    }
    if (p[1] === 'js' && p[2] === 'conteudo' && p[3] === 'provas') {
      partes.add('prova-'); partes.add('tela-escola$');
      const anf = anfitrioes('provas');
      predios(anf);
      uma('provas', () => motivos.push(`jogo/js/conteudo/provas/ → provas, a tela da Escola${anf.length ? ` e os prédios ${anf.join(', ')}` : ''}`));
      continue;
    }
    tudo = true; uma(f, () => motivos.push(`${f} → tudo`));
  }
  if (tudo) return { modo: 'tudo', regex: null, motivos };
  if (partes.size) return { modo: 'cenas', regex: new RegExp(`^(?:${[...partes].join('|')})`), motivos };
  if (!dados) motivos.push('nada mudou no jogo desde a main: nenhuma imagem');
  return { modo: 'dados', regex: null, motivos };
}

module.exports = { arquivosMudados, idsDoJogo, escolher };
