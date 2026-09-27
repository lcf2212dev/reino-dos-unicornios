// Catálogo dos tipos de tarefa do plano paralelo (docs/contratos/plano-paralelo.md §4), usado por plano.js.
// Cada tipo: o que é, a conferência que o subagent conferente roda (placeholders <p> = prédio, <id> = personagens,
// <tarefa> = id da tarefa, <worktree> = pasta da frente, <testes> = filtro dos testes listados em `arquivos`), se pode dividir worktree (§6.7: só os que não abrem
// navegador) e o que o worker pode ler.
const TIPOS = {
  contrato: {
    descricao: 'reservas, ids, telas e APIs que outras frentes usam (orquestrador)',
    conferencia: ['npm run validar', 'npm run vozes-elenco (limpo, gênero de cada reserva certo)', 'ids únicos no jogo (npm run validar acusa repetido)'],
    dividir: true,
    ler: ['docs/contratos/plano-paralelo.md', 'docs/contratos/npcs-e-dialogo.md'],
  },
  cenario: {
    descricao: 'layout do interior e objetos, com as vagas livres',
    conferencia: ['REINO_RESERVAS_ABERTAS=1 node jogo/ferramentas/validar/validar-interiores.js --so <p>', 'npm run ver -- --ir <p> (celular, tablet e notebook)',
      'vagas das reservas livres e alcançáveis; nenhuma janela vazia na parede'],
    dividir: false,
    ler: ['docs/contratos/interiores.md', 'docs/receitas/ (receita do prédio)'],
    e2e: 'só as cenas do interior <p>',
  },
  fachada: {
    descricao: 'o prédio de fora e o lugar no mapa',
    conferencia: ['npm run ver -- --previa mapa', 'npm run ver do mapa em frente à porta de <p> (celular, tablet e notebook)'],
    dividir: false,
    ler: ['docs/contratos/cena-e-motor.md', 'docs/contratos/interiores.md'],
    e2e: 'só as cenas do mapa perto de <p>',
  },
  npc: {
    descricao: 'sprite e ação de personagens reservados',
    conferencia: ['npm run ver -- --ir <p> --nome <id> (celular, tablet e notebook)', 'conversa com <id> abre a ação certa',
      'REINO_RESERVAS_ABERTAS=1 npm run validar'],
    dividir: false,
    ler: ['docs/contratos/npcs-e-dialogo.md', 'docs/contratos/plano-paralelo.md §2'],
    e2e: 'só as cenas do interior <p>',
  },
  falas: {
    descricao: 'texto das falas (NPCs, objetos, extras)',
    conferencia: ['lições de voz: até 30 letras por página, frases de 3+ palavras', 'node jogo/ferramentas/vozes/listar-falas.js --mostrar (as falas novas de <id>)',
      'português correto, com acentos, carinhoso'],
    dividir: true,
    ler: ['docs/contratos/npcs-e-dialogo.md', 'docs/contratos/som-musica-e-voz.md'],
    e2e: 'nenhuma (só texto; a voz vem na tarefa de vozes)',
  },
  vozes: {
    descricao: 'perfis, amostras, gravação e conferência por transcrição (orquestrador)',
    conferencia: ['npm run vozes-elenco', 'transcrição sem ✘ (skill validar-vozes)', '__reino.faltando vazio'],
    dividir: false,
    ler: ['docs/contratos/som-musica-e-voz.md', 'skills gravar-vozes e validar-vozes'],
  },
  mecanica: {
    descricao: 'sistema ou tela nova (código)',
    conferencia: ['npm run unidade -- --so <testes>', 'npm run ver -- --tela … (celular, tablet e notebook)', 'teclado: Tab, Enter e Esc'],
    dividir: false,
    ler: ['docs/ARQUITETURA.md', 'docs/contratos/ui.md'],
  },
  conteudo: {
    descricao: 'salas, livro, prova',
    conferencia: ['npm run validar', 'npm run ver -- --tela sala:<id> ou prova:<id>'],
    dividir: false,
    ler: ['docs/contratos/conteudo.md'],
  },
  arte: {
    descricao: 'ícones, enfeites, comidas',
    conferencia: ['npm run ver -- --previa …', 'todo emoji novo na tela tem ícone pixel art'],
    dividir: false,
    ler: ['docs/receitas/ (enfeite, comida)'],
  },
  musica: {
    descricao: 'faixa nova',
    conferencia: ['node jogo/ferramentas/testes/testar-musicas.js'],
    dividir: false,
    ler: ['docs/contratos/som-musica-e-voz.md'],
  },
  integracao: {
    descricao: 'juntar as frentes, vozes, e2e (orquestrador)',
    conferencia: ['skill validar-tudo inteira (npm test e npm run e2e)', 'cada diferença do e2e explicada pela feature'],
    dividir: false,
    ler: ['skill entregar'],
  },
  entrega: {
    descricao: 'merge, push, artifact (orquestrador)',
    conferencia: ['skill entregar (merge, push e artifact)'],
    dividir: false,
    ler: ['skill entregar', 'skill publicar-artifact'],
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
