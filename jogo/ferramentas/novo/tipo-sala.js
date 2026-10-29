// Tipo `sala` do `npm run novo`: sala nova numa matéria que existe.
// Matéria do 4º bimestre (`bimestre: 4`, docs/receitas/sala-4bim.md): sala de livro (`ordem: 'livro'`) no lugar
// certo do manifesto (a ordem dos livros), a carta no livro-<cap><l>.js e 1 comum + 1 raro no unicornios-<cap>.js.
// Matéria arquivada (3º bimestre): recusada (docs/contratos/bimestres.md). Matéria extra fora da temporada
// (docs/receitas/materia-nova.md): o formato de 12 desafios sorteados.
const fs = require('fs');
const path = require('path');
const novo = () => require('./novo');   // na hora: novo.js também carrega este arquivo
const RECEITA = 'docs/receitas/sala-4bim.md';

// ordem "natural" dos ids (lp9a1 < lp10a1 < lp10a2 < lp10t1): a mesma que os livros seguem nos nomes
const antes = (a, b) => a.localeCompare(b, 'en', { numeric: true }) < 0;
const js = (m, f) => `js/conteudo/materias/${m}/${f}.js`;
// letra do livro nos ids e arquivos (lp12a7, livro-12t.js): as duas chaves começam com "a", então é um mapa
const LIVRO_DA_LETRA = { a: 'aprendizagem', t: 'atividades' };
const LETRA_DO_LIVRO = { aprendizagem: 'a', atividades: 't' };

// capítulo e livro: --capitulo/--livro ou pelo id (<prefixo><cap><letra do livro><n>, ex.: lp12a7)
function capituloLivro(id, op, m) {
  const chaves = Object.keys(m.livros || {});
  const p = id.match(/(\d+)([at])\d+$/);
  const capitulo = op.capitulo !== undefined ? Number(op.capitulo) : p && Number(p[1]);
  const livro = op.livro || (p && LIVRO_DA_LETRA[p[2]]);
  if (!Number.isInteger(capitulo) || capitulo < 1) throw new Error(`sala: não sei o capítulo de ${id}; passe --capitulo N (ou um id como lp12a7)`);
  if (!chaves.includes(livro)) throw new Error(`sala: livro "${livro || ''}" desconhecido; passe --livro ${chaves.join('|')}`);
  return { capitulo, livro, letra: LETRA_DO_LIVRO[livro] || livro[0] };
}

// onde a sala entra: antes da 1ª sala que vem depois dela (capítulo, livro e id em ordem natural), ou --depois-de <sala>
function lugarDaSala(id, op, m, manifesto, c) {
  const tem = (s) => manifesto.includes(js(m.id, s));
  if (op.depoisDe) {
    if (!m.salas.includes(op.depoisDe) || !tem(op.depoisDe)) throw new Error(`sala --depois-de: "${op.depoisDe}" não é sala de ${m.id}`);
    return { depoisDe: js(m.id, op.depoisDe), grupo: 'materias' };
  }
  const ordemLivro = (l) => Object.keys(m.livros).indexOf(l);
  const depois = (s) => s.capitulo !== c.capitulo ? s.capitulo > c.capitulo
    : ordemLivro(s.livro) !== ordemLivro(c.livro) ? ordemLivro(s.livro) > ordemLivro(c.livro) : antes(id, s.id);
  const seguinte = (m.salasInfo.find((s) => depois(s) && tem(s.id)) || {}).id;
  if (seguinte) return { antesDe: js(m.id, seguinte), grupo: 'materias' };
  const ultima = m.salas.filter(tem).pop();
  if (!ultima) throw new Error(`sala: nenhuma sala de ${m.id} no manifesto; passe --depois-de <sala>`);
  return { depoisDe: js(m.id, ultima), grupo: 'materias' };
}
// prefixo dos ids de unicórnio das vizinhas (lp-letradinho → lp)
const prefixoUni = (m) => ((m.unis.find((u) => u.includes('-')) || 'x-').split('-')[0]);
// último arquivo do manifesto da matéria que começa com `prefixo` (livro-, unicornios-)
const ultimoCom = (manifesto, m, prefixo) => manifesto.filter((s) => s.startsWith(`js/conteudo/materias/${m}/${prefixo}`)).pop();

function conferirLivro(id, op, m, raiz) {
  const Man = require('./manifesto-editar');
  const manifesto = Man.scripts(fs.readFileSync(Man.arquivo(raiz), 'utf8')).map((s) => s.js);
  const c = capituloLivro(id, op, m);
  const pasta = path.join(raiz, 'jogo/js/conteudo/materias', m.id);
  const livroArq = `livro-${c.capitulo}${c.letra}`, uniArq = `unicornios-${c.capitulo}`;
  const carta = `${id}-c1`;
  if (m.livro.includes(carta)) throw new Error(`sala: a carta ${carta} já existe`);
  op.livro4 = Object.assign(c, { pasta, livroArq, uniArq, carta, livroNome: m.livros[c.livro].nome,
    onde: lugarDaSala(id, op, m, manifesto, c), pre: prefixoUni(m),
    livroNovo: !fs.existsSync(path.join(pasta, livroArq + '.js')), uniNovo: !fs.existsSync(path.join(pasta, uniArq + '.js')),
    ultLivro: ultimoCom(manifesto, m.id, 'livro-'), ultUni: ultimoCom(manifesto, m.id, 'unicornios-') });
  if ((op.livro4.livroNovo && !op.livro4.ultLivro) || (op.livro4.uniNovo && !op.livro4.ultUni))
    throw new Error(`sala: ${m.id} não segue o formato livro-<cap>.js / unicornios-<cap>.js (${RECEITA})`);
}

function arquivosLivro(id, op) {
  const L = op.livro4, m = op.materia, rel = (f) => `jogo/${js(m, f)}`;
  const ORI = L.livro === 'atividades' ? 'ATI' : 'APR';
  const sala = novo().modelo('sala-livro.js.modelo', { sala: id, materia: m, livro: L.livro, livroNome: L.livroNome, capitulo: L.capitulo, carta: L.carta, ORI });
  const carta = (r) => `${r}{ id: '${L.carta}', e: '(preencher)', titulo: '(preencher)', livroOrigem: '${L.livro}', pagina: 0, capitulo: ${L.capitulo},   // id: o da página (lp-a81)\n` +
    `${r}  blocos: [{ t: 'texto', texto: '(preencher) o texto da página, palavra por palavra' }] },\n`;
  const uni = (r, cores) => `  { id: '${L.pre}-(preencher)-${r}', nome: '(preencher)', raridade: '${r}', sala: '${id}',\n    cores: ${cores},\n    frase: '(preencher)' },\n`;
  const unis = uni('comum', "{ corpo: '#f3ecff', crina: ['#8e4fd6', '#5fb4ff', '#ffd34d'], chifre: '#ffe680' }") +
    uni('raro', "{ corpo: '#fff8ee', crina: ['#3a2446', '#ff9cc6', '#ffd34d'], chifre: '#ffffff' }");
  const cab = (o) => `/* ${o} (docs/contratos/quarto-bimestre.md; esqueleto do \`npm run novo\`). */\n`;
  return [[rel(id), sala],
    [rel(L.livroArq), L.livroNovo ? cab(`Cartas do ${L.livroNome}, capítulo ${L.capitulo}, na ordem das páginas §4`) +
      `Reino.registrarCartas('${m}', [\n${carta('  ')}]);\n` : { inserirNoFim: carta('    ') }],
    [rel(L.uniArq), L.uniNovo ? cab(`Unicórnios das salas do capítulo ${L.capitulo} (1 comum e 1 raro por sala)`) +
      `Reino.registrarUnicornios('${m}', [\n${unis}]);\n` : { inserirNoFim: unis }]];
}

module.exports = {
  ajuda: 'sala <materia> <idSala> [--capitulo N --livro aprendizagem|atividades] [--depois-de <sala>]   (4º bimestre: ' + RECEITA + ')',
  cria: 'matéria do 4º bimestre: sala de livro <idSala>.js no lugar certo do manifesto, a carta no livro-<cap><l>.js e 2 unicórnios no unicornios-<cap>.js; outra: <idSala>.js com 12 desafios e a carta no livro.js',
  conferir(id, op, ex, raiz) {
    const m = ex.materias.find((x) => x.id === op.materia);
    if (!m) throw new Error(`sala: a matéria "${op.materia}" não existe (${ex.materias.map((x) => x.id).join(', ')})`);
    if (m.arquivada) throw new Error(`sala: ${m.id} é do 3º bimestre (arquivada: true) e não ganha sala nova (docs/contratos/bimestres.md); conteúdo novo vai numa matéria do 4º bimestre: ${RECEITA}`);
    if (ex.salas.has(id)) throw new Error(`sala: "${id}" já existe`);
    op.nMateria = m; op.nSala = m.salas.length + 1; op.valorPorMateria = ex.valorPorMateria;
    if (m.bimestre === 4) return conferirLivro(id, op, m, raiz);
    const livro = path.join(raiz, `jogo/js/conteudo/materias/${op.materia}/livro.js`);
    if (!fs.existsSync(livro)) throw new Error(`sala: a matéria ${op.materia} não tem livro.js`);
    if (new RegExp(`id:\\s*'${id}'`).test(fs.readFileSync(livro, 'utf8'))) throw new Error(`sala: já há uma carta '${id}' no livro de ${op.materia}`);
  },
  arquivos(id, op) {
    if (op.livro4) return arquivosLivro(id, op);
    return [[`jogo/js/conteudo/materias/${op.materia}/${id}.js`, novo().modelo('materia-sala.js.modelo',
      { NOME: String(op.nMateria.nome).toUpperCase(), n: op.nSala, sala: id, materia: op.materia })],
      // a carta que os desafios da sala apontam (livro: '<id>'), no fim do livro da matéria
      [`jogo/js/conteudo/materias/${op.materia}/livro.js`, { inserirNoFim: `    { id: '${id}', e: '(preencher)', titulo: '(preencher)',\n      texto: '(preencher)' },\n` }]];
  },
  manifesto(id, op) {
    const m = op.materia, L = op.livro4;
    if (!L) return { jss: [js(m, id)], onde: { antesDe: js(m, 'livro'), grupo: 'materias' } };
    return [{ jss: [js(m, id)], onde: L.onde }]
      .concat(L.livroNovo ? [{ jss: [js(m, L.livroArq)], onde: { depoisDe: L.ultLivro, grupo: 'materias' } }] : [])
      .concat(L.uniNovo ? [{ jss: [js(m, L.uniArq)], onde: { depoisDe: L.ultUni, grupo: 'materias' } }] : []);
  },
  checklist(id, op) {
    const N = novo(), m = op.materia, L = op.livro4;
    if (!L) return [
      `conteúdo: troque cada (preencher) em jogo/js/conteudo/materias/${m}/${id}.js`,
      `livro: a carta '${id}' entrou no fim de ${m}/livro.js: título e texto (troque o livro dos desafios se for outra carta)`,
      N.valorSala(op.valorPorMateria, op.nSala, op.nSala - 1),
      `unicórnios: 1 comum e 1 raro com sala: '${id}' em ${m}/${m}.js`,
      N.UNI_NPC, N.EMOJIS + ' (os dos desafios da sala)',
      'o prédio da matéria: se for próprio (não o padrao.js), um NPC com a ação { tipo: \'sala\' } num cômodo novo',
      'vozes: npm run vozes',
    ];
    return [
      `lugar: ${L.onde.antesDe ? 'antes de ' + L.onde.antesDe : 'depois de ' + L.onde.depoisDe} (a ordem do livro; outra: --depois-de <sala>)`,
      `sala: troque cada (preencher) em ${m}/${id}.js: páginas, cada questão na ordem do livro com a origem do INVENTARIO.md (${RECEITA})`,
      `cartas: '${L.carta}' em ${m}/${L.livroArq}.js: troque o id pelo da página (em cartas e no livro dos desafios), uma carta por página, o texto do livro palavra por palavra`,
      `unicórnios: 1 comum e 1 raro com sala: '${id}' em ${m}/${L.uniArq}.js (id ${L.pre}-<nome>, nome, frase e cores)`,
      `prêmio da trilha perfeita: Reino.registrarPremioTrilha da sala em ${m}/premios-trilha-${L.capitulo}.js (acessório, elemento e experiência da tabela de quarto-bimestre.md §14.4; capítulo novo: arquivo novo no manifesto)`,
      N.valorSala(op.valorPorMateria, op.nSala, op.nSala - 1),
      N.UNI_NPC, N.EMOJIS + ' (os da sala e das cartas)',
      'prédio: a estação e o pedestal da sala aparecem sozinhos no capítulo (quarto-bimestre.md §7); se o capítulo não couber, o validar-interiores diz que arquivo do prédio cresce (receita novo-predio)',
      'vozes: npm run vozes',
    ];
  },
  validadores: ['node jogo/ferramentas/validar/validar-conteudo.js', 'node jogo/ferramentas/validar/cobertura-4bim.js <materia> (4º bimestre)', 'node jogo/ferramentas/validar/etapas-4bim.js', 'node jogo/ferramentas/validar/validar-interiores.js', 'npm test'],
  ver(id) { return `npm run ver -- --tela sala:${id} --nome ${id}`; },
};
