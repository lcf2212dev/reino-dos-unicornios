// Cobertura dos livros do 4º bimestre: cruza o inventário (matérias/4 Bimestre/<matéria>/INVENTARIO.md) com o jogo
// (docs/contratos/quarto-bimestre.md §6). Cada página impressa tem de estar numa carta ou num desafio, cada questão
// do inventário num desafio (origem igual, ou com letra de item: APR-12-q3b) ou no `soLeitura` de uma carta, e
// nenhum desafio aponta para questão que o inventário não tem.
// Uso: node jogo/ferramentas/validar/cobertura-4bim.js [<matéria>…] [--tabela] [--detalhes]
//   sem matéria: todas as que têm `inventario`;  --tabela: página → sala, cartas e desafios (Markdown)
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const Jogo = require('../jogo-no-node');

// sigla de cada livro nas páginas e questões: `sigla` em materia.livros; sem ela, a do Português
const SIGLA = { aprendizagem: 'APR', atividades: 'ATI' };
const siglaDo = (m, l) => (m.livros && m.livros[l] && m.livros[l].sigla) || SIGLA[l];
const RE_PAGINA = /^## ([A-Z]{3}) p\. (\d+|sem número)\b/;
const RE_QUESTAO = /^- \*\*(([A-Z]{3})-(\d{2,3})-q[0-9A-Z]+[a-z]?)\*\*/;   // item com letra (APR-10-q3a) também
// a página de uma origem ('ENG-125-q2b' → 'ENG-125')
const paginaDaOrigem = (o) => o.replace(/-q[0-9A-Z]+[a-z]?$/, '');

// inventário: páginas ('APR-05') e questões ('APR-05-q1'), na ordem do arquivo
function lerInventario(arq) {
  const paginas = [], questoes = [];
  fs.readFileSync(arq, 'utf8').split('\n').forEach((l) => {
    const p = RE_PAGINA.exec(l);
    if (p) paginas.push(p[1] + '-' + (p[2] === 'sem número' ? '00' : p[2].padStart(2, '0')));
    const q = RE_QUESTAO.exec(l);
    if (q && !questoes.includes(q[1])) questoes.push(q[1]);
  });
  return { paginas, questoes };
}
function paginaDe(sigla, n) { return sigla + '-' + String(n).padStart(2, '0'); }

function cobertura(m, raizRepo) {
  const erros = [], avisos = [];
  const arq = path.join(raizRepo, m.inventario);
  if (!fs.existsSync(arq)) return { erros: [`${m.id}: inventário não existe (${m.inventario})`], avisos, linhas: [] };
  const inv = lerInventario(arq);
  const porPagina = {};   // 'APR-05' → { salas: Set, cartas: [], desafios: [] }
  const reg = (pg) => (porPagina[pg] = porPagina[pg] || { salas: new Set(), cartas: [], desafios: [] });
  const cartaSala = {};
  m.salas.forEach((s) => (s.cartas || []).forEach((id) => { (cartaSala[id] = cartaSala[id] || []).push(s.id); }));
  const coberta = new Set();
  (m.livro || []).forEach((c) => {
    if (!c.livroOrigem || !Number.isInteger(c.pagina)) return;
    const pg = paginaDe(siglaDo(m, c.livroOrigem), c.pagina);
    const r = reg(pg);
    r.cartas.push(c.id);
    (cartaSala[c.id] || []).forEach((s) => r.salas.add(s));
    if (!cartaSala[c.id]) avisos.push(`${m.id}/${c.id}: carta fora de toda sala (só no livro)`);
    (c.soLeitura || []).forEach((q) => coberta.add(q));
  });
  const origens = new Set(), adaptacoes = [];
  m.salas.forEach((s) => s.desafios.forEach((d) => {
    if (d.adaptacao) adaptacoes.push({ origem: d.origem, desafio: d.id, tipo: d.tipo, adaptacao: d.adaptacao });
    if (!d.origem) return;
    const base = d.origem.replace(/[a-z]$/, '');
    origens.add(base); origens.add(d.origem);
    if (!inv.questoes.includes(base) && !inv.questoes.includes(d.origem)) erros.push(`${d.id}: origem ${d.origem} não está no inventário`);
    const pg = paginaDaOrigem(base);
    const r = reg(pg);
    r.salas.add(s.id);
    r.desafios.push(d.id);
  }));
  inv.paginas.forEach((pg) => { if (!porPagina[pg]) erros.push(`${m.id}: página ${pg} do inventário sem carta nem desafio no jogo`); });
  Object.keys(porPagina).forEach((pg) => { if (!inv.paginas.includes(pg)) erros.push(`${m.id}: página ${pg} no jogo, mas não no inventário`); });
  inv.questoes.forEach((q) => { if (!origens.has(q) && !coberta.has(q)) erros.push(`${m.id}: questão ${q} do inventário sem desafio no jogo`); });
  const linhas = inv.paginas.map((pg) => {
    const r = porPagina[pg] || { salas: new Set(), cartas: [], desafios: [] };
    return { pagina: pg, salas: [...r.salas], cartas: r.cartas, desafios: r.desafios };
  });
  return { erros, avisos, linhas, adaptacoes, paginas: inv.paginas.length, questoes: inv.questoes.length };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const ids = args.filter((a) => !a.startsWith('--'));
  const ctx = Jogo.contexto({ console });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos'], grupos: ['atividades', 'materias'] }));
  const raizRepo = path.join(Jogo.raiz, '..');
  const ms = ctx.Reino.materias.filter((m) => m.inventario && (!ids.length || ids.includes(m.id)));
  ids.forEach((id) => { if (!ms.some((m) => m.id === id)) { console.log(`✘ ${id}: matéria sem inventário (campo inventario) ou inexistente`); process.exit(1); } });
  let falhas = 0;
  ms.forEach((m) => {
    const r = cobertura(m, raizRepo);
    r.erros.forEach((e) => console.log('✘ ' + e));
    if (args.includes('--detalhes')) r.avisos.forEach((a) => console.log('⚠ ' + a));
    falhas += r.erros.length;
    if (args.includes('--tabela')) {
      console.log(`\n### ${m.nome}\n| Página | Sala | Cartas | Desafios |\n|---|---|---|---|`);
      r.linhas.forEach((l) => console.log(`| ${l.pagina} | ${l.salas.join(', ') || '—'} | ${l.cartas.join(', ') || '—'} | ${l.desafios.join(', ') || '—'} |`));
      console.log(`\n#### Adaptações (${r.adaptacoes.length})\n| Questão | Desafio | Tipo | Adaptação |\n|---|---|---|---|`);
      r.adaptacoes.forEach((a) => console.log(`| ${a.origem} | ${a.desafio} | ${a.tipo} | ${a.adaptacao.replace(/\|/g, '/')} |`));
    }
    if (!r.erros.length) console.log(`✔ ${m.nome}: ${r.paginas} páginas e ${r.questoes} questões do inventário no jogo`);
  });
  if (!ms.length) console.log('✔ nenhuma matéria com inventário');
  process.exit(falhas ? 1 : 0);
}

module.exports = { lerInventario, cobertura };
