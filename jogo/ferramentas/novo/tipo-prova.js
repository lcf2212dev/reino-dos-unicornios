// Tipo `prova` do `npm run novo`: prova da escola autocontida (docs/contratos/conteudo.md §5 item 4): questões com
// `(preencher)`, os 3 acessórios com desenho e ícone de marcador e, com --professora, Reino.registrarPersonagem.
const path = require('path');
const fs = require('fs');

const Vozes = require('./vozes');
const novo = () => require('./novo');   // na hora: novo.js também carrega este arquivo
const RARIDADES = [['lendario', 'lendário', '#ffd34d'], ['raro', 'raro', '#9fd8ff'], ['comum', 'comum', '#ff9cc6']];
const N_QUESTOES = 10;

// ícone 16×16 de marcador: um losango com contorno (desenhe o de verdade; `npm run ver -- --previa acessorios`)
function icone(cor) {
  const d = [];
  for (let y = 0; y < 16; y++) {
    let l = '';
    for (let x = 0; x < 16; x++) {
      const m = Math.abs(x - 7.5) + Math.abs(y - 7.5);
      l += m < 6 ? 'y' : m < 7 ? 'k' : '.';
    }
    d.push(l);
  }
  return `{ n: '(preencher) (RAR)', p: { k: '#3a2446', y: '${cor}' },\n        d: [\n${d.map((l) => `          '${l}',`).join('\n')}\n        ] }`;
}

// tudo o que a prova precisa da cópia: a matéria, o livro dela e os ids já usados (desafios e questões)
function dados(raiz, op, g) {
  const Jogo = require(path.join(raiz, 'jogo/ferramentas/jogo-no-node.js'));
  const ctx = Jogo.carregar(Jogo.contexto({ console, Math, Date }), Jogo.scripts());
  const R = ctx.Reino;
  const m = R.materias.find((x) => x.id === op.materia);
  const ids = new Set(R.materias.flatMap((x) => x.salas.flatMap((s) => s.desafios.map((d) => d.id)))
    .concat(R.provas.flatMap((p) => p.questoes.map((q) => q.id).concat(Object.values(p.acessorios || {}).map((a) => a.id)))));
  // voz da professora: um perfil que nenhuma outra professora (paraProva) nem ninguém da Escola usa
  const V = R.config.vozes, chave = Vozes.chave;
  const E = (R.NPCs && R.NPCs.ELENCO) || {};
  const usadas = new Set();
  Object.keys(E).filter((k) => E[k].paraProva).forEach((k) => { if (V[E[k].voz]) usadas.add(chave(V[E[k].voz])); });
  (R.interiores || []).filter((d) => d.lugar === 'escola').forEach((d) => (d.npcs || []).forEach((n) => { if (V[n.voz]) usadas.add(chave(V[n.voz])); }));
  return { R, m, ids, vozes: V, vozLivre: Vozes.escolher(V, usadas, g) };
}

module.exports = {
  ajuda: 'prova <materia> <bimestre> [--nome "Revisão de Geografia"] [--professora <id> --nome-professora "Professora Rosa"] [--voz feminina|masculina]',
  cria: 'jogo/js/conteudo/provas/<materia>-<n>bim.js: Reino.registrarProva com 10 questões e os 3 acessórios inline (desenho e ícone de marcador); com --professora, Reino.registrarPersonagem',
  // id do tipo = <materia>-<n>bim (novo.js passa a matéria em op.materia e o bimestre em op.bimestre)
  conferir(id, op, ex, raiz) {
    if (!/^[1-9]$/.test(op.bimestre || '')) throw new Error('prova: bimestre de 1 a 9 (ex.: prova geografia 4)');
    // professora → voz feminina por padrão (o nome ou --voz decidem)
    op.generoVoz = Vozes.generoPedido(op, op.nomeProfessora || 'Professora', 'feminina');
    const d = op.dadosProva = dados(raiz, op, op.generoVoz.g);
    if (!d.m) throw new Error(`prova: a matéria "${op.materia}" não existe (${d.R.materias.map((x) => x.id).join(', ')})`);
    if (d.R.provas.some((p) => p.id === id) || fs.existsSync(path.join(raiz, `jogo/js/conteudo/provas/${id}.js`))) throw new Error(`prova: "${id}" já existe`);
    op.prefixoQ = [op.materia[0] + 'b' + op.bimestre, op.materia + '-b' + op.bimestre].find((p) => !d.ids.has(p + '-01'));
    RARIDADES.forEach(([r]) => { if (d.ids.has(`${id}-${r}`)) throw new Error(`prova: acessório ${id}-${r} já existe`); });
    if (op.professora) {
      if (!/^[a-z0-9-]+$/.test(op.professora)) throw new Error('prova: --professora <id> em [a-z0-9-]');
      if (!d.vozLivre) throw new Error('prova: nenhum perfil de voz livre em config.vozes para a professora');
      if ((d.R.NPCs && d.R.NPCs.ELENCO && d.R.NPCs.ELENCO[op.professora]) || d.R.personagens[op.professora] || d.vozes['npc-' + op.professora]) throw new Error(`prova: o personagem "${op.professora}" já existe`);
    }
  },
  arquivos(id, op) {
    const { m, vozes, vozLivre } = op.dadosProva, aspas = novo().aspas;
    const carta = (m.livro[0] || {}).id || '(preencher)';
    const q = Array.from({ length: N_QUESTOES }, (_, i) => {
      const n = String(i + 1).padStart(2, '0');
      return `    { id: '${op.prefixoQ}-${n}', tipo: 'escolha', livro: '${carta}',   // (troque pelo cartão do livro certo)
      pergunta: '(preencher) o enunciado ${i + 1}, EXATO como na folha',
      opcoes: [
        { t: '(preencher) alternativa 1' },
        { t: '(preencher) alternativa 2' },
        { t: '(preencher) alternativa 3' },
      ], certa: 0,
      explica: '(preencher) a explicação' },`;
    }).join('\n\n');
    const acess = RARIDADES.map(([r, rr, cor]) => `    ${r}: { id: '${id}-${r}', nome: '(preencher)',
      desenho: { linhas: ['.k.', 'kyk', '.k.'], paleta: { k: '#3a2446', y: '${cor}' }, ancora: 'cabeca', dx: -1, dy: -2 },
      icone: ${icone(cor).replace('RAR', rr)} },`).join('\n');
    let prof = '';
    if (op.professora) {
      const perfil = vozes[vozLivre];
      prof = `// a professora da prova (docs/contratos/npcs-e-dialogo.md §5): sprite básico e voz copiada de ${vozLivre}
// (um perfil que nenhuma outra professora nem ninguém da Escola usa)
Reino.registrarPersonagem({ id: '${op.professora}', nome: '${aspas(op.nomeProfessora || '(preencher)')}', paraProva: '${id}',
  sprite: { pele: '#f1c7a5', cabelo: '#5a3825', penteado: 'chanel', roupa: '#39a860', roupa2: '#6b4a9a', perna: 'saia' },
  perfil: { voz: '${perfil.voz}', velocidade: '${perfil.velocidade}', tom: '${perfil.tom}' } });
`;
    }
    const texto = `/* ${String(op.nome || 'Revisão bimestral de ' + m.nome).toUpperCase()} — ${op.bimestre}º bimestre (folha da escola).
   Esqueleto do \`npm run novo\`: os enunciados e as alternativas são os da folha, EXATOS e na mesma ordem; troque cada
   marcador de preencher (o validador recusa o marcador). Acessórios: lendário (acertou tudo na 1ª tentativa), raro (na 2ª),
   comum (depois), com desenho e ícone aqui mesmo (docs/contratos/conteudo.md §5). */
${prof}Reino.registrarProva({
  id: '${id}',
  materiaId: '${op.materia}',
  nome: '${aspas(op.nome || 'Revisão Bimestral de ' + m.nome)}',
  bimestre: '${op.bimestre}º bimestre',
  emoji: '${m.emoji}',
  acessorios: {
${acess}
  },
  questoes: [
${q}
  ],
});
`;
    return [[`jogo/js/conteudo/provas/${id}.js`, texto]];
  },
  manifesto(id, op, ex, raiz) {
    const M = require('./manifesto-editar');
    return { jss: [`js/conteudo/provas/${id}.js`], onde: { depoisDe: M.ultimoDoGrupo(raiz, 'provas'), grupo: 'provas' } };
  },
  checklist(id, op) {
    return [
      `ler a folha e passar cada questão com o texto EXATO para jogo/js/conteudo/provas/${id}.js (tipos em docs/contratos/conteudo.md)`,
      'o cartão do livro de cada questão (hoje todas apontam para o primeiro)',
      `nomes e desenhos dos 3 acessórios (desenho na montaria e ícone 16×16): npm run ver -- --previa acessorios:${id}-lendario`,
      ...(op.professora ? [`a professora ${op.professora}: sprite e voz próprios (hoje copiada de ${op.dadosProva.vozLivre})`, op.generoVoz.aviso] : []),
      'vozes: npm run vozes',
      'e2e: diferenças esperadas nos dados (provas, falas/vozes) e nas imagens da Escola',
    ];
  },
  validadores: ['node jogo/ferramentas/validar/validar-conteudo.js', 'node jogo/ferramentas/validar/validar-interiores.js', 'npm test', 'npm run e2e'],
  ver(id) { return `npm run ver -- --tela prova:${id} --nome ${id}`; },
};
