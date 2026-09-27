// Textos do plano paralelo (plano.js): o briefing curto do worker (formato da skill orquestrar-frentes, "Briefing"),
// o do subagent conferente ("Quando cada agente volta" + a conferência do tipo, de plano-tipos.js) e os comandos
// `npm run novo -- reserva …` de cada personagem. Funções puras: recebem o plano já carregado.
const T = require('./plano-tipos');

const REGRA_RESERVA = 'a reserva não muda; registrarPersonagem só com id, sprite (e acao se a reserva não tiver)';

function tarefa(plano, id) {
  const t = plano.tarefas.find((x) => x.id === id);
  if (!t) throw new Error(`tarefa desconhecida: ${id} (${plano.tarefas.map((x) => x.id).join(', ')})`);
  return t;
}

// prédio de uma tarefa: campo `predio`, a pasta do interior/matéria nos arquivos ou o dos personagens dela
function predioDa(plano, t) {
  if (t.predio) return t.predio;
  for (const a of t.arquivos || []) {
    const m = /interiores\/([^/]+)\//.exec(a) || /materias\/([^/]+)\//.exec(a);
    if (m) return m[1];
  }
  const p = plano.personagens.find((x) => (t.personagens || []).includes(x.id));
  return p ? p.predio : null;
}
// ids dos personagens que a tarefa usa: os dela (npc, falas, vozes) e, no cenário, os do prédio dele
function personagensDa(plano, t) {
  const p = predioDa(plano, t);
  return t.tipo === 'cenario' ? plano.personagens.filter((x) => x.predio && x.predio === p).map((x) => x.id) : (t.personagens || []);
}
const pessoasDa = (plano, t) => personagensDa(plano, t).map((id) => plano.personagens.find((x) => x.id === id)).filter(Boolean);

const vaga = (p) => `${p.id}: ${p.nome}, ${p.genero}, ${p.idade}, vaga ${p.predio} (${p.x},${p.y})` + (p.acao ? `, acao ${JSON.stringify(p.acao)}` : '');
const pastaWt = (mae, t) => `${mae}/reino-${t.worktree}`;

function arquivoDeFalas(plano, t) {
  if (t.falas) return t.falas;
  if (['falas', 'cenario'].includes(t.tipo)) {
    const a = (t.arquivos || []).find((x) => /falas/.test(x));
    if (a) return a;
  }
  if (t.tipo === 'npc') {
    const f = plano.tarefas.filter((x) => x.tipo === 'falas' && (x.personagens || []).some((p) => (t.personagens || []).includes(p)));
    if (f.length) return `nenhum: as falas são da tarefa ${f.map((x) => x.id).join(', ')} (não escreva falas)`;
  }
  return 'nenhum (esta frente não escreve falas)';
}

function briefing(plano, id, op = {}) {
  const t = tarefa(plano, id), tipo = T.TIPOS[t.tipo] || {}, mae = op.mae || '/home/leandro';
  const p = predioDa(plano, t);
  const deps = (t.depende || []).length ? ` Parte do que já está aprovado em: ${t.depende.join(', ')}.` : '';
  const L = [
    `Tarefa: ${t.titulo || t.id} (tipo ${t.tipo}: ${tipo.descricao || '?'}).${deps}`,
    `Worktree: ${pastaWt(mae, t)} (branch feat/${t.worktree})`,
    `Arquivos seus: ${(t.arquivos || []).join(', ') || '(preencha no plano)'}`,
    `Prefixo de id: ${t.prefixo || (p ? p + '-' : plano.nome + '-')}`,
    `Arquivo de falas: ${arquivoDeFalas(plano, t)}`,
    `Pode ler: ${(t.ler || (tipo.ler || []).concat(plano.pedido ? [plano.pedido] : [])).join(', ')}`,
    `Pronto quando: ${(t.pronto || []).join('; ') || '(preencha no plano)'}`,
    `Diferença esperada no e2e: ${T.preencher(t.e2e || tipo.e2e || 'idêntico', { p })}`,
  ];
  const pessoas = pessoasDa(plano, t);
  if (['npc', 'falas', 'cenario'].includes(t.tipo) && pessoas.length) {
    L.push(`Reservas que valem (${REGRA_RESERVA}):`);
    pessoas.forEach((x) => L.push(`  - ${vaga(x)}`));
    if (t.tipo === 'cenario') L.push('  deixe cada vaga livre e alcançável (chão, sem objeto em cima)');
    L.push('  Enquanto as frentes trabalham: REINO_RESERVAS_ABERTAS=1 npm run validar (reserva sem registro vira aviso).');
  }
  L.push('Regras fixas: .claude/agents/worker-low.md (sem commit; só os seus arquivos; linhas de arquivos do orquestrador vão no retorno).');
  return L.join('\n');
}

// filtro do `npm run unidade -- --so` a partir dos testes em `arquivos` ('salao.navegador|salao-visual', com aspas para o shell); '' sem teste
function filtroTestes(t) {
  const f = (t.arquivos || []).map((a) => /testes\/unidade\/([^/]+)\.test\.js$/.exec(a)).filter(Boolean).map((m) => m[1]).join('|');
  return f.includes('|') ? `'${f}'` : f;
}

function conferente(plano, id, op = {}) {
  const t = tarefa(plano, id), tipo = T.TIPOS[t.tipo] || {}, mae = op.mae || '/home/leandro';
  const wt = pastaWt(mae, t), p = predioDa(plano, t), pessoas = pessoasDa(plano, t);
  const arqPlano = op.arqPlano || '<plano>';
  const itens = [];
  for (const c of tipo.conferencia || []) {
    const v = { p: p || '<p>', tarefa: t.id, worktree: wt, testes: filtroTestes(t) };
    if (c.includes('<testes>') && !v.testes) { itens.push('testes de unidade: liste os testes da tarefa em arquivos (jogo/ferramentas/testes/unidade/*.test.js)'); continue; }
    if (c.includes('<id>') && pessoas.length) pessoas.forEach((x) => itens.push(T.preencher(c, { ...v, id: x.id })));
    else itens.push(T.preencher(c, v));
  }
  const L = [
    `Você é o subagent CONFERENTE da tarefa ${t.id} (${t.tipo}) do plano ${plano.nome}. Você não fez o trabalho: não edita`,
    'arquivo nem faz commit; só lê e roda comandos (regras fixas: .claude/agents/worker-low.md).',
    `Worktree: ${wt} (branch feat/${t.worktree})`,
    `Pedido: ${plano.pedido || '(sem pedido no plano)'}`,
    `Arquivos da frente: ${(t.arquivos || []).join(', ') || '(nenhum)'}`,
    'Retorno do worker (as afirmações a conferir): <cole aqui>',
    'Confira:',
    '1. Afirmações: reabra o arquivo ou rode o comando de cada uma (npm test e npm run e2e uma vez, se o retorno citar).',
    '2. Fotos e jogo: o "Pronto quando", item a item, com npm run ver nos 3 tamanhos (celular, tablet, notebook); teclado.',
    ...(t.pronto || []).map((x) => `   - ${x}`),
    `3. Diferenças no e2e: cada uma explicada pela feature (esperado: ${T.preencher(t.e2e || tipo.e2e || 'idêntico', { p })}); o resto é defeito.`,
    `4. Arquivos fora da propriedade: git -C ${wt} status --short (só os arquivos da frente).`,
    `5. Processos presos: ps -eo pid,args | grep reino-${t.worktree}; derrube só os seus, pelo PID (nunca pkill/killall).`,
    `6. Conferência do tipo ${t.tipo}:`,
    ...itens.map((x) => `   - ${x}`),
  ];
  if (['npc', 'falas', 'cenario'].includes(t.tipo) && pessoas.length) {
    L.push(`7. Reservas (${REGRA_RESERVA}):`);
    pessoas.forEach((x) => L.push(`   - ${vaga(x)}`));
  }
  L.push('Retorno: veredito (aprovado / com ressalvas / reprovado) e defeitos com arquivo:linha e foto.',
    `Quem orquestra marca depois: npm run plano -- marcar ${arqPlano} ${t.id} aprovada (ou reprovada)`);
  return L.join('\n');
}

// um comando do gerador por personagem; o perfil de voz vai como comentário (o gerador não o recebe)
function reservas(plano) {
  const q = (s) => JSON.stringify(String(s));
  const L = [];
  for (const p of plano.personagens) {
    const falta = ['id', 'nome', 'genero', 'idade', 'predio', 'x', 'y'].filter((c) => p[c] == null || p[c] === '');
    if (falta.length) { L.push(`# ${p.id || p.nome}: preencha ${falta.join(', ')} no plano antes de reservar`); continue; }
    let c = `npm run novo -- reserva ${p.id} --predio ${p.predio} --nome ${q(p.nome)} --genero ${p.genero} --idade ${p.idade} --x ${p.x} --y ${p.y}`;
    if (p.acao) c += ` --acao '${JSON.stringify(p.acao)}'`;
    L.push(c);
    if (p.perfil) L.push(`#   perfil de ${p.id}: ${JSON.stringify(p.perfil)}`);
  }
  return L;
}

module.exports = { briefing, conferente, reservas, predioDa, personagensDa, REGRA_RESERVA };
