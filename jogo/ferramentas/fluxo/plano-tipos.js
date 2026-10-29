// Catálogo dos tipos de tarefa do plano paralelo (docs/contratos/plano-paralelo.md §4), usado por plano.js.
// Cada tipo: o que é, a conferência que o subagent conferente roda (placeholders <p> = prédio, <id> = personagens,
// <tarefa> = id da tarefa, <worktree> = pasta da frente, <testes> = filtro dos testes listados em `arquivos`), se pode dividir worktree (§6.7: só os que não abrem
// navegador), o que o worker lê (por seção: `arquivo §n`; nunca o arquivo inteiro sem precisar) e, quando há,
// o comando do gerador e o arquivo-modelo a copiar (o plano pode trocar: campos gerador, modelo, ler, testes).
const TIPOS = {
  contrato: {
    descricao: 'reservas, ids, telas e APIs que outras frentes usam (orquestrador)',
    conferencia: ['npm run validar', 'npm run vozes-elenco (limpo, gênero de cada reserva certo)', 'ids únicos no jogo (npm run validar acusa repetido)'],
    dividir: true,
    ler: ['docs/contratos/plano-paralelo.md §2-§3', 'docs/contratos/npcs-e-dialogo.md §5'],
    gerador: 'npm run novo -- reserva <id> --predio <p> --nome "…" --genero f|m --idade … --x X --y Y',
  },
  cenario: {
    descricao: 'layout do interior e objetos, com as vagas livres',
    conferencia: ['REINO_RESERVAS_ABERTAS=1 node jogo/ferramentas/validar/validar-interiores.js --so <p>', 'npm run ver -- --ir <p> (celular, tablet e notebook)',
      'vagas das reservas livres e alcançáveis; nenhuma janela vazia na parede'],
    dividir: false,
    ler: ['docs/contratos/interiores.md §3, §5, §7 e §8', 'docs/receitas/predio-novo.md', 'docs/contratos/arte.md'],
    gerador: 'npm run novo -- predio <p> --nome "…" (prédio novo)',
    e2e: 'só as cenas do interior <p>',
  },
  fachada: {
    descricao: 'o prédio de fora e o lugar no mapa',
    conferencia: ['npm run ver -- --previa mapa', 'npm run ver do mapa em frente à porta de <p> (celular, tablet e notebook)'],
    dividir: false,
    ler: ['docs/contratos/cena-e-motor.md §9', 'docs/contratos/interiores.md §8', 'docs/contratos/arte.md'],
    e2e: 'só as cenas do mapa perto de <p>',
  },
  npc: {
    descricao: 'sprite e ação de personagens reservados',
    conferencia: ['npm run ver -- --ir <p> --nome <id> (celular, tablet e notebook)', 'conversa com <id> abre a ação certa',
      'REINO_RESERVAS_ABERTAS=1 npm run validar'],
    dividir: false,
    ler: ['docs/contratos/npcs-e-dialogo.md §2 e §6', 'docs/contratos/plano-paralelo.md §2', 'docs/contratos/arte.md'],
    gerador: 'npm run novo -- personagem <id> --predio <p> (preenche só o visual da reserva)',
    e2e: 'só as cenas do interior <p>',
  },
  falas: {
    descricao: 'texto das falas (NPCs, objetos, extras)',
    conferencia: ['lições de voz: até 30 letras por página, frases de 3+ palavras', 'node jogo/ferramentas/vozes/listar-falas.js --mostrar (as falas novas de <id>)',
      'português correto, com acentos, carinhoso'],
    dividir: true,
    ler: ['docs/contratos/npcs-e-dialogo.md §10', 'docs/contratos/som-musica-e-voz.md §5'],
    e2e: 'nenhuma (só texto; a voz vem na tarefa de vozes)',
  },
  vozes: {
    descricao: 'perfis, amostras, gravação e conferência por transcrição (orquestrador)',
    conferencia: ['npm run vozes-elenco', 'transcrição sem ✘ (skill validar-vozes)', '__reino.faltando vazio'],
    dividir: false,
    ler: ['docs/contratos/som-musica-e-voz.md §4 e §7', 'skills gravar-vozes e validar-vozes'],
  },
  mecanica: {
    descricao: 'sistema ou tela nova (código)',
    conferencia: ['npm run unidade -- --so <testes>', 'npm run ver -- --tela … (celular, tablet e notebook)', 'teclado: Tab, Enter e Esc'],
    dividir: false,
    ler: ['docs/ARQUITETURA.md §5.1', 'docs/contratos/ui.md §2-§5 (se tem tela)', 'docs/contratos/arte.md (se desenha)'],
    gerador: 'npm run novo -- sistema <id> (ou desafio <id>, arquivo <caminho>)',
  },
  conteudo: {
    descricao: 'salas, livro, prova',
    conferencia: ['npm run validar', 'node jogo/ferramentas/validar/cobertura-4bim.js <p> (matéria do 4º bimestre)', 'npm run ver -- --tela sala:<id> ou prova:<id>'],
    dividir: false,
    ler: ['docs/receitas/sala-4bim.md', 'docs/contratos/quarto-bimestre.md §3, §4, §6 e §12', 'docs/contratos/conteudo.md §3'],
    gerador: 'npm run novo -- sala <materia> <idSala> (ou prova <materia> <bimestre>)',
    modelo: 'jogo/js/conteudo/materias/portugues4/lp12a6.js',
  },
  arte: {
    descricao: 'ícones, enfeites, comidas',
    conferencia: ['npm run ver -- --previa …', 'todo emoji novo na tela tem ícone pixel art'],
    dividir: false,
    ler: ['docs/contratos/arte.md', 'docs/receitas/ (enfeite, comida)'],
    gerador: 'npm run novo -- arquivo interiores/<p>/icones.js',
  },
  musica: {
    descricao: 'faixa nova',
    conferencia: ['node jogo/ferramentas/testes/testar-musicas.js'],
    dividir: false,
    ler: ['docs/contratos/som-musica-e-voz.md §3', 'docs/receitas/musica-nova.md'],
  },
  ferramenta: {
    descricao: 'ferramentas, testes e docs (nada muda no jogo)',
    conferencia: ['npm run unidade -- --so <testes>', '--ajuda de cada comando novo ou mudado (o cabeçalho de uso diz a opção nova)',
      'npm test', 'npm run e2e idêntico (o jogo não muda)'],
    dividir: true,
    ler: ['jogo/ferramentas/CLAUDE.md', 'o contrato do assunto, só a seção que muda'],
    e2e: 'idêntico (o jogo não muda)',
  },
  integracao: {
    descricao: 'juntar as frentes, vozes, e2e (orquestrador)',
    conferencia: ['skill validar-tudo inteira (npm test e npm run e2e)', 'cada diferença do e2e explicada pela feature'],
    dividir: false,
    ler: ['skill entregar'],
  },
  entrega: {
    descricao: 'merge, push e a Vercel no ar (orquestrador)',
    conferencia: ['skill entregar (merge e push)', 'npm run vercel -- --conferir (se falhar: npm run vercel)'],
    dividir: false,
    ler: ['skill entregar'],
  },
};

// tipos que usam personagem (§6.3)
const USAM_PERSONAGEM = ['npc', 'falas', 'vozes', 'cenario'];
// arquivos disputados (§6.1): só em tarefa do orquestrador
const DISPUTADOS = [/(^|\/)package\.json$/, /(^|\/)CLAUDE\.md$/, /(^|\/)manifesto\.js$/, /(^|\/)index\.html$/, /(^|\/)COMO-USAR\.md$/,
  /(^|\/)docs\/ARQUITETURA\.md$/, /(^|\/)tipos[^/]*\.(d\.ts|json)$/, /(^|\/)\.gitignore$/, /(^|\/)base-referencia\.txt$/];

// troca os placeholders de um texto
function preencher(texto, v) {
  return texto.replace(/<p>/g, v.p || '<p>').replace(/<id>/g, v.id || '<id>').replace(/<tarefa>/g, v.tarefa || '<tarefa>')
    .replace(/<worktree>/g, v.worktree || '<worktree>')
    .replace(/<testes>/g, v.testes || '<testes>');
}

module.exports = { TIPOS, USAM_PERSONAGEM, DISPUTADOS, preencher };
