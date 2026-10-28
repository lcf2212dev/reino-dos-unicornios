// Etapas das salas de livro (docs/contratos/quarto-bimestre.md §13.1): confere, para toda sala `ordem: 'livro'`, as
// garantias de Reino.etapasDaSala: toda carta e todo desafio em exatamente uma etapa, desafios e cartas na ordem,
// nenhuma etapa vazia, leitura dentro do limite (carta grande sozinha pode), pontos até etapaDesafiosMax + 1, nenhuma
// etapa só de 1 desafio leve sem carta (salvo a sala de 1 desafio), `sala.etapas` à mão somando os desafios, e a divisão igual quando calculada de novo.
// Uso: node jogo/ferramentas/validar/etapas-4bim.js [--tabela]
//   --tabela: a divisão de cada sala (cartas, desafios, pontos e palavras por etapa)
if (require.main === module) require('../ajuda').ajuda(__filename);
const Jogo = require('../jogo-no-node');

function conferirSala(R, m, s) {
  const erros = [], cfg = R.config;
  const etapas = R.etapasDaSala(m, s);
  const nome = `${m.id}/${s.id}`;
  if (!Array.isArray(etapas) || !etapas.length) return { erros: [`${nome}: sem etapas`], etapas: [] };
  if (JSON.stringify(R.etapasDaSala(m, s)) !== JSON.stringify(etapas)) erros.push(`${nome}: a divisão muda quando calculada de novo`);
  const ids = (s.cartas || []).filter((id, i, l) => l.indexOf(id) === i);
  const cartas = etapas.flatMap((e) => e.cartas), desafios = etapas.flatMap((e) => e.desafios.map((d) => d.id));
  if (JSON.stringify(cartas) !== JSON.stringify(ids)) erros.push(`${nome}: cartas fora da ordem, repetidas ou faltando (${cartas.join(' ')})`);
  if (JSON.stringify(desafios) !== JSON.stringify(s.desafios.map((d) => d.id))) erros.push(`${nome}: desafios fora da ordem, repetidos ou faltando`);
  const carta = (id) => (m.livro || []).find((c) => c.id === id);
  etapas.forEach((e, i) => {
    const onde = `${nome} etapa ${i + 1}`;
    if (e.n !== i) erros.push(`${onde}: n = ${e.n}`);
    if (!e.cartas.length && !e.desafios.length) erros.push(`${onde}: vazia`);
    const pal = e.cartas.reduce((t, id) => t + R.etapasDaSala.palavrasCarta(carta(id)), 0);
    if (e.cartas.length > 1 && (e.cartas.length > cfg.etapaCartasMax || pal > cfg.etapaPalavrasMax)) erros.push(`${onde}: leitura demais (${e.cartas.length} cartas, ${pal} palavras)`);
    // a sobra de 1 desafio de peso 2 (escrever, desenho) pode ficar sozinha: junta, passaria do máximo + 1
    if (e.desafios.length === 1 && !e.cartas.length && s.desafios.length > 1 && !Array.isArray(s.etapas) && R.etapasDaSala.peso(e.desafios[0]) < 2) erros.push(`${onde}: só 1 desafio leve, sem carta`);
    const pts = e.desafios.reduce((t, d) => t + R.etapasDaSala.peso(d), 0);
    if (!Array.isArray(s.etapas) && pts > cfg.etapaDesafiosMax + 1) erros.push(`${onde}: ${pts} pontos (máximo ${cfg.etapaDesafiosMax + 1})`);
  });
  if (Array.isArray(s.etapas) && s.etapas.reduce((a, b) => a + b, 0) !== s.desafios.length) erros.push(`${nome}: sala.etapas soma ${s.etapas.reduce((a, b) => a + b, 0)}, a sala tem ${s.desafios.length} desafios`);
  return { erros, etapas };
}

function descrever(R, m, e) {
  const carta = (id) => (m.livro || []).find((c) => c.id === id);
  const pal = e.cartas.reduce((t, id) => t + R.etapasDaSala.palavrasCarta(carta(id)), 0);
  const pts = e.desafios.reduce((t, d) => t + R.etapasDaSala.peso(d), 0);
  return `${e.cartas.length}c/${pal}p ${e.desafios.length}d/${pts}pt`;
}

if (require.main === module) {
  const tabela = process.argv.includes('--tabela');
  const ctx = Jogo.contexto({ console });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos'], grupos: ['atividades', 'materias'] }));
  const R = ctx.Reino;
  let falhas = 0, salas = 0, total = 0;
  R.materias.forEach((m) => {
    const livro = m.salas.filter((s) => s.ordem === 'livro');
    if (!livro.length) return;
    if (tabela) console.log(`\n### ${m.nome}\n| Sala | Cartas | Desafios | Etapas | Divisão (cartas/palavras desafios/pontos) |\n|---|---|---|---|---|`);
    livro.forEach((s) => {
      const r = conferirSala(R, m, s);
      r.erros.forEach((e) => console.log('✘ ' + e));
      falhas += r.erros.length; salas++; total += r.etapas.length;
      if (tabela) console.log(`| ${s.id} | ${(s.cartas || []).length} | ${s.desafios.length} | ${r.etapas.length} | ${r.etapas.map((e) => descrever(R, m, e)).join(' · ')} |`);
    });
  });
  if (tabela) console.log('');
  if (!falhas) console.log(`✔ ${salas} salas de livro em ${total} etapas, todas dentro das garantias`);
  process.exit(falhas ? 1 : 0);
}

module.exports = { conferirSala };
