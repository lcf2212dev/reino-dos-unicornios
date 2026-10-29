// Conferências das salas de livro e das cartas ricas do 4º bimestre (docs/contratos/quarto-bimestre.md §3–§6),
// chamadas pelo validar-conteudo.js (que fica abaixo do limite de tamanho com elas aqui).
const BLOCOS = {
  texto: (b) => txt(b.texto),
  fala: (b) => txt(b.texto) && (b.quem === undefined || txt(b.quem)),
  versos: (b) => Array.isArray(b.versos) && b.versos.some(txt) && b.versos.every((v) => typeof v === 'string'),
  lista: (b) => Array.isArray(b.itens) && b.itens.length > 0 && b.itens.every((i) => i && txt(i.texto) && (i.termo === undefined || txt(i.termo))),
  quadro: (b) => (b.titulo === undefined || txt(b.titulo)) && (txt(b.texto) || (Array.isArray(b.itens) && b.itens.every((i) => i && txt(i.texto)))),
  tabela: (b) => Array.isArray(b.linhas) && b.linhas.length > 0 && b.linhas.every((l) => Array.isArray(l) && l.every((c) => typeof c === 'string')) &&
    (b.cab === undefined || (Array.isArray(b.cab) && b.cab.length === b.linhas[0].length)),
  figuras: (b) => Array.isArray(b.itens) && b.itens.length > 0 && b.itens.every((f) => f && txt(f.img)),
  ilustracao: (b) => txt(b.id) && txt(b.alt),
  fonte: (b) => txt(b.texto),
};
const MAX_PALAVRAS = 110, MAX_VERSOS = 16;
const ORIGEM = /^[A-Z]{3}-\d{2,3}-q[0-9A-Z]+[a-z]?$/;   // APR-12-q3, ATI-05-q2b, ENG-125-q2 (sigla do livro em materia.livros)
function txt(t) { return typeof t === 'string' && t.trim().length > 0; }
function palavras(t) { return String(t || '').split(/\s+/).filter(Boolean).length; }

// carta rica (com blocos); `m` com `bimestre: 4` exige livroOrigem, pagina e capitulo
function checarCarta(m, c, checar, avisar, icones) {
  if (!c.blocos) return;
  const onde = `${m.id}/${c.id}`;
  checar(txt(c.titulo) && txt(c.e), `${onde}: carta sem título ou emoji`);
  if (!checarRet(checar, Array.isArray(c.blocos) && c.blocos.length > 0, `${onde}: blocos vazios`)) return;
  let total = 0, versos = 0;
  c.blocos.forEach((b, i) => {
    const ok = b && Object.prototype.hasOwnProperty.call(BLOCOS, b.t);
    if (!checarRet(checar, ok, `${onde}: bloco ${i} de tipo desconhecido "${b && b.t}" (${Object.keys(BLOCOS).join(', ')})`)) return;
    checar(BLOCOS[b.t](b), `${onde}: bloco ${i} (${b.t}) incompleto`);
    if (b.t === 'texto' || b.t === 'fala' || b.t === 'quadro') total += palavras(b.texto);
    if (b.t === 'lista' || (b.t === 'quadro' && b.itens)) (b.itens || []).forEach((it) => { total += palavras(it.texto); });
    if (b.t === 'versos') { versos += b.versos.filter(txt).length; total += b.versos.reduce((n, v) => n + palavras(v), 0); }
    if (b.t === 'figuras' && icones) b.itens.forEach((f) => checar(icones.window.ICONES[f.img] || icones.window.ICONES[String(f.img).replace(/️/g, '')], `${onde}: figura "${f.img}" sem desenho em ICONES`));
    if (b.t === 'ilustracao' && icones && icones.Reino.ilustracao) checar(icones.Reino.ilustracao(b.id), `${onde}: ilustração "${b.id}" não registrada (Reino.registrarIlustracao)`);
  });
  if (total > MAX_PALAVRAS || versos > MAX_VERSOS) avisar(`${onde}: carta longa (${total} palavras, ${versos} versos): divida em cartas que caibam no celular (até ${MAX_PALAVRAS} palavras ou ${MAX_VERSOS} versos)`);
  if (m.bimestre === 4) {
    checar(m.livros && Object.prototype.hasOwnProperty.call(m.livros, c.livroOrigem), `${onde}: livroOrigem "${c.livroOrigem}" não está em ${m.id}.livros`);
    checar(Number.isInteger(c.pagina) && c.pagina >= 0, `${onde}: sem página impressa (pagina)`);
    checar(Number.isInteger(c.capitulo), `${onde}: sem capitulo`);
  }
}

// sala de livro (ordem: 'livro'): limites, livro de origem, capítulo, cartas e origem de cada desafio
function checarSala(m, s, checar, config) {
  if (s.ordem === undefined) return;
  const onde = `${m.id}/${s.id}`;
  if (!checarRet(checar, s.ordem === 'livro', `${onde}: ordem "${s.ordem}" desconhecida (só 'livro')`)) return;
  checar(s.desafios.length >= 1 && s.desafios.length <= config.desafiosSalaLivro, `${onde}: sala de livro com ${s.desafios.length} desafios (de 1 a ${config.desafiosSalaLivro})`);
  checar(m.livros && Object.prototype.hasOwnProperty.call(m.livros, s.livroOrigem), `${onde}: livroOrigem "${s.livroOrigem}" não está em ${m.id}.livros`);
  checar(Number.isInteger(s.capitulo), `${onde}: sala de livro sem capitulo`);
  const livro = new Set((m.livro || []).map((c) => c.id));
  if (s.cartas !== undefined) {
    checar(Array.isArray(s.cartas) && s.cartas.length > 0 && new Set(s.cartas).size === s.cartas.length, `${onde}: cartas vazias ou repetidas`);
    (s.cartas || []).forEach((id) => checar(livro.has(id), `${onde}: carta "${id}" não existe no livro`));
  }
  s.desafios.forEach((d) => checar(typeof d.origem === 'string' && ORIGEM.test(d.origem), `${d.id}: sem origem do inventário (ex.: APR-12-q3, ATI-05-q2b)`));
}
function checarRet(checar, cond, msg) { checar(cond, msg); return cond; }

module.exports = { checarCarta, checarSala, BLOCOS, ORIGEM };
