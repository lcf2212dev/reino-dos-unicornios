// Plano paralelo de um pedido de feature (npm run plano -- <comando> …; contrato: docs/contratos/plano-paralelo.md):
// Uso: node jogo/ferramentas/fluxo/plano.js <comando> <plano.json> [opções]
//   conferir <plano>                 regras de divisão (§6): um ✘ por problema e código 1; ✔ e resumo se ok
//   ondas <plano> [--mermaid]        tarefas por onda, caminho crítico (estimativa, padrão 15 min), soma sequencial
//                                    x paralela; --mermaid imprime o grafo (graph LR, um subgraph por onda)
//   proximas <plano>                 o que lançar agora, o que retomar, conferências pendentes e se já pode integrar
//   marcar <plano> <tarefa> <estado> pendente | lancada | feita | aprovada | reprovada (feita pede o conferente
//                                    NA HORA; aprovada lista as liberadas; reprovada volta para a mesma frente)
//   briefing <plano> <tarefa>        briefing curto do worker (formato da skill orquestrar-frentes)
//   conferente <plano> <tarefa>      briefing do subagent conferente (só lê e roda comandos)
//   reservas <plano>                 um `npm run novo -- reserva …` por personagem (onda 0, do orquestrador)
//   rascunho <pedido.md> [--saida <arq>] [--prefixo <p>] [--parte <n>]   plano-rascunho a partir do pedido
// Opções: --estado <pasta>  onde ficam os estados (padrão REINO_PLANOS ou /tmp/reino-testes/planos/; só em /tmp ou
//         /dev/shm). O estado é <pasta>/<nome>.estado.json, fora do repositório.
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const T = require('./plano-tipos');
const B = require('./plano-briefing');
const { PASTA_TESTES } = require('../testes/guardas');

const ESTADOS = ['pendente', 'lancada', 'feita', 'aprovada', 'reprovada'];
const GENEROS = ['f', 'm'];
const IDADES = ['crianca', 'jovem', 'adulto', 'idoso'];
const CAMPOS = ['id', 'nome', 'genero', 'idade', 'predio', 'x', 'y'];
const MINUTOS = 15;

function carregar(arq) {
  let p;
  try { p = JSON.parse(fs.readFileSync(arq, 'utf8')); } catch (e) { throw new Error(`${arq}: não consegui ler o plano (${e.message})`); }
  p.personagens = p.personagens || [];
  p.tarefas = p.tarefas || [];
  return p;
}

const porId = (plano) => new Map(plano.tarefas.map((t) => [t.id, t]));
const limpo = (a) => String(a).replace(/^\.\//, '');

// todas as tarefas de que `id` depende, direta ou indiretamente (tolera ciclo e dependência inexistente)
function ancestrais(plano, id, mapa = porId(plano)) {
  const vistos = new Set();
  const pilha = [...((mapa.get(id) || {}).depende || [])];
  while (pilha.length) {
    const d = pilha.pop();
    if (vistos.has(d) || !mapa.has(d)) continue;
    vistos.add(d);
    pilha.push(...(mapa.get(d).depende || []));
  }
  return vistos;
}

// contratos que reservam o personagem: citam o id em `personagens` ou são donos do reservas.js do prédio dele
function contratosDe(plano, pers) {
  return plano.tarefas.filter((t) => t.tipo === 'contrato' && ((t.personagens || []).includes(pers.id) ||
    (pers.predio && (t.arquivos || []).some((a) => limpo(a).endsWith(`/${pers.predio}/reservas.js`)))));
}

// ciclo nas dependências: a lista do ciclo (a → b → a) ou null
function acharCiclo(plano) {
  const mapa = porId(plano), cor = new Map(), pilha = [];
  const visitar = (id) => {
    cor.set(id, 1); pilha.push(id);
    for (const d of (mapa.get(id).depende || []).filter((x) => mapa.has(x))) {
      if (cor.get(d) === 1) return pilha.slice(pilha.indexOf(d)).concat(d);
      if (!cor.get(d)) { const c = visitar(d); if (c) return c; }
    }
    cor.set(id, 2); pilha.pop();
    return null;
  };
  for (const t of plano.tarefas) if (!cor.get(t.id)) { const c = visitar(t.id); if (c) return c; }
  return null;
}

// regras do §6 (e a forma do arquivo): lista de problemas, vazia se ok
function conferir(plano) {
  const erros = [], mapa = porId(plano);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(plano.nome || '')) erros.push('preencha "nome" (minúsculas e hífen)');
  // forma das tarefas
  const ids = new Set();
  for (const t of plano.tarefas) {
    const q = `tarefa ${t.id || '(sem id)'}`;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(t.id || '')) erros.push(`${q}: id inválido (minúsculas e hífen)`);
    if (ids.has(t.id)) erros.push(`${q}: id repetido`);
    ids.add(t.id);
    if (!T.TIPOS[t.tipo]) erros.push(`${q}: tipo desconhecido "${t.tipo}" (${Object.keys(T.TIPOS).join(', ')})`);
    if (!t.quem) erros.push(`${q}: preencha "quem" (worker-low, orquestrador ou o agente)`);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(t.worktree || '')) erros.push(`${q}: preencha "worktree" (o <tema> de reino-<tema>)`);
    if (!Array.isArray(t.depende || [])) erros.push(`${q}: "depende" tem de ser uma lista`);
    if (!['integracao', 'entrega'].includes(t.tipo) && !(t.arquivos || []).length) erros.push(`${q}: preencha "arquivos" (posse exclusiva de cada frente)`);
    // como fazer (opcionais, vão no briefing): ler por seção, gerador, arquivo-modelo, testes focados
    if (t.ler !== undefined && !(Array.isArray(t.ler) && t.ler.every((x) => typeof x === 'string'))) erros.push(`${q}: "ler" tem de ser uma lista de textos ("docs/ARQUITETURA.md §5.1")`);
    for (const c of ['gerador', 'modelo']) if (t[c] !== undefined && typeof t[c] !== 'string') erros.push(`${q}: "${c}" tem de ser um texto`);
    if (t.testes !== undefined && ![].concat(t.testes).every((x) => typeof x === 'string')) erros.push(`${q}: "testes" tem de ser um comando ou uma lista de comandos`);
  }
  // personagens (§6.4)
  const pids = new Set();
  for (const p of plano.personagens) {
    const q = `personagem ${p.id || p.nome || '(sem id)'}`;
    for (const c of CAMPOS) if (p[c] == null || p[c] === '') erros.push(`${q}: preencha "${c}"`);
    if (p.genero != null && !GENEROS.includes(p.genero)) erros.push(`${q}: genero "${p.genero}" inválido (f ou m)`);
    if (p.idade != null && !IDADES.includes(p.idade)) erros.push(`${q}: idade "${p.idade}" inválida (${IDADES.join(', ')})`);
    for (const c of ['x', 'y']) if (p[c] != null && !Number.isInteger(p[c])) erros.push(`${q}: ${c} tem de ser um número inteiro (tile)`);
    if (p.id && pids.has(p.id)) erros.push(`${q}: id repetido`);
    if (p.id) pids.add(p.id);
    const npcs = plano.tarefas.filter((t) => t.tipo === 'npc' && (t.personagens || []).includes(p.id));
    if (!npcs.length) erros.push(`${q}: não aparece em nenhuma tarefa npc`);
    if (npcs.length > 1) erros.push(`${q}: aparece em mais de uma tarefa npc (${npcs.map((t) => t.id).join(', ')})`);
  }
  // §6.1: um dono por arquivo; pasta cobre o que tem dentro; disputados só do orquestrador
  const donos = [];
  for (const t of plano.tarefas) for (const a of (t.arquivos || []).map(limpo)) {
    if (t.quem !== 'orquestrador' && T.DISPUTADOS.some((r) => r.test(a))) {
      erros.push(`arquivo disputado ${a} na tarefa ${t.id} (${t.quem}): só em tarefa do orquestrador; o worker cita a linha no retorno`);
    }
    for (const o of donos) {
      if (o.t === t.id) continue;
      if (o.a === a) erros.push(`arquivo ${a} tem dois donos: ${o.t} e ${t.id}`);
      else if (o.a.endsWith('/') && a.startsWith(o.a)) erros.push(`pasta ${o.a} (de ${o.t}) cobre ${a} (de ${t.id})`);
      else if (a.endsWith('/') && o.a.startsWith(a)) erros.push(`pasta ${a} (de ${t.id}) cobre ${o.a} (de ${o.t})`);
    }
    donos.push({ t: t.id, a });
  }
  // "depende" fora de lista: o grafo não dá para percorrer; os erros de forma saem primeiro
  if (plano.tarefas.some((t) => !Array.isArray(t.depende || []))) return erros;
  // §6.2: dependências existem e não fecham ciclo
  for (const t of plano.tarefas) for (const d of t.depende || []) {
    if (d === t.id) erros.push(`tarefa ${t.id} depende dela mesma`);
    else if (!mapa.has(d)) erros.push(`tarefa ${t.id} depende de "${d}", que não existe`);
  }
  const ciclo = acharCiclo(plano);
  if (ciclo) erros.push(`ciclo nas dependências: ${ciclo.join(' → ')}`);
  const anc = new Map(plano.tarefas.map((t) => [t.id, ancestrais(plano, t.id, mapa)]));
  const chega = (a, b) => (anc.get(a) || new Set()).has(b);
  // §6.3: quem usa um personagem depende do contrato que o reserva
  const semContrato = new Set();
  for (const t of plano.tarefas.filter((x) => T.USAM_PERSONAGEM.includes(x.tipo))) {
    for (const pid of B.personagensDa(plano, t)) {
      const p = plano.personagens.find((x) => x.id === pid);
      if (!p) { erros.push(`tarefa ${t.id} cita o personagem "${pid}", que não está em "personagens"`); continue; }
      const cs = contratosDe(plano, p);
      if (!cs.length) { if (!semContrato.has(pid)) erros.push(`personagem ${pid}: nenhuma tarefa contrato o reserva`); semContrato.add(pid); continue; }
      if (!cs.some((c) => chega(t.id, c.id))) erros.push(`tarefa ${t.id} (${t.tipo}) usa ${pid} mas não depende (nem indiretamente) do contrato ${cs.map((c) => c.id).join(' ou ')}`);
    }
    if (t.tipo === 'npc' && !(t.personagens || []).length) erros.push(`tarefa ${t.id} (npc): preencha "personagens"`);
  }
  // §6.5: vozes dependem das falas dos mesmos personagens, nunca do visual
  for (const v of plano.tarefas.filter((x) => x.tipo === 'vozes')) {
    plano.tarefas.filter((x) => x.tipo === 'npc' && chega(v.id, x.id))
      .forEach((n) => erros.push(`vozes ${v.id} depende do visual (npc ${n.id}): a voz depende só do texto das falas`));
    for (const pid of v.personagens || []) {
      const fs_ = plano.tarefas.filter((x) => x.tipo === 'falas' && (x.personagens || []).includes(pid));
      if (!fs_.length) erros.push(`vozes ${v.id}: nenhuma tarefa falas cobre ${pid} (a voz é achada pelo texto exato)`);
      fs_.filter((f) => !chega(v.id, f.id)).forEach((f) => erros.push(`vozes ${v.id} não depende das falas ${f.id} (${pid})`));
    }
  }
  // §6.6: integracao depende de todas; entrega depende da integracao
  const integ = plano.tarefas.filter((x) => x.tipo === 'integracao');
  if (!integ.length) erros.push('o plano não tem tarefa integracao');
  if (!plano.tarefas.some((x) => x.tipo === 'entrega')) erros.push('o plano não tem tarefa entrega');
  for (const i of integ) {
    plano.tarefas.filter((x) => x.id !== i.id && x.tipo !== 'entrega' && !chega(i.id, x.id))
      .forEach((x) => erros.push(`integracao ${i.id} não depende de ${x.id}`));
  }
  for (const e of plano.tarefas.filter((x) => x.tipo === 'entrega')) {
    if (integ.length && !integ.some((i) => chega(e.id, i.id))) erros.push(`entrega ${e.id} não depende da integracao`);
  }
  // §6.7: worktree dividida só entre tipos sem navegador (falas, contrato), ou entre tarefas em sequência
  const tarefas = plano.tarefas;
  for (let i = 0; i < tarefas.length; i++) for (let j = i + 1; j < tarefas.length; j++) {
    const a = tarefas[i], b = tarefas[j];
    if (!a.worktree || a.worktree !== b.worktree) continue;
    const dividem = (T.TIPOS[a.tipo] || {}).dividir && (T.TIPOS[b.tipo] || {}).dividir;
    if (!dividem && !chega(a.id, b.id) && !chega(b.id, a.id)) {
      erros.push(`worktree reino-${a.worktree} dividida por ${a.id} (${a.tipo}) e ${b.id} (${b.tipo}), que podem rodar juntas: só falas e contrato dividem worktree`);
    }
  }
  return erros;
}

// onda de cada tarefa (§5.1): lista de listas de tarefas; lança se houver ciclo
function ondas(plano) {
  const ciclo = acharCiclo(plano);
  if (ciclo) throw new Error(`ciclo nas dependências: ${ciclo.join(' → ')}`);
  const mapa = porId(plano), onda = new Map();
  const de = (id) => {
    if (!onda.has(id)) onda.set(id, Math.max(-1, ...(mapa.get(id).depende || []).filter((d) => mapa.has(d)).map(de)) + 1);
    return onda.get(id);
  };
  const lista = [];
  plano.tarefas.forEach((t) => { const n = de(t.id); (lista[n] = lista[n] || []).push(t); });
  return lista;
}

// caminho mais longo em minutos: { caminho: [ids], minutos, sequencial }
function caminhoCritico(plano) {
  ondas(plano); // confere o ciclo
  const mapa = porId(plano), memo = new Map();
  const min = (t) => (Number.isFinite(t.estimativa) ? t.estimativa : MINUTOS);
  const longo = (id) => {
    if (memo.has(id)) return memo.get(id);
    let melhor = { minutos: 0, caminho: [] };
    for (const d of (mapa.get(id).depende || []).filter((x) => mapa.has(x))) { const r = longo(d); if (r.minutos > melhor.minutos) melhor = r; }
    const r = { minutos: melhor.minutos + min(mapa.get(id)), caminho: melhor.caminho.concat(id) };
    memo.set(id, r);
    return r;
  };
  let fim = { minutos: 0, caminho: [] };
  plano.tarefas.forEach((t) => { const r = longo(t.id); if (r.minutos > fim.minutos) fim = r; });
  return { ...fim, sequencial: plano.tarefas.reduce((s, t) => s + min(t), 0) };
}

function mermaid(plano) {
  const no = (id) => id.replace(/[^a-zA-Z0-9]/g, '_');
  const linhas = ['graph LR'];
  ondas(plano).forEach((lista, n) => {
    linhas.push(`  subgraph onda${n}["Onda ${n}"]`);
    lista.forEach((t) => linhas.push(`    ${no(t.id)}["${t.id}<br/>${t.tipo} · ${t.quem}"]`));
    linhas.push('  end');
  });
  plano.tarefas.forEach((t) => (t.depende || []).forEach((d) => linhas.push(`  ${no(d)} --> ${no(t.id)}`)));
  return linhas.join('\n');
}

function textoOndas(plano) {
  const L = [];
  ondas(plano).forEach((lista, n) => {
    L.push(`Onda ${n}:`);
    lista.forEach((t) => L.push(`  ${t.id.padEnd(16)} ${t.tipo.padEnd(10)} ${String(t.quem).padEnd(13)} reino-${t.worktree}`));
  });
  const c = caminhoCritico(plano);
  L.push('', `Caminho crítico: ${c.caminho.join(' → ')} (${c.minutos} min)`,
    `Tempo: ${c.sequencial} min em sequência x ${c.minutos} min em paralelo (estimativa; padrão ${MINUTOS} min por tarefa)`);
  return L.join('\n');
}

// ---------- estados (§5.3) ----------
function pastaEstado(pedida) {
  const p = path.resolve(pedida || process.env.REINO_PLANOS || path.join(PASTA_TESTES, 'planos'));
  if (!/^\/(tmp|dev\/shm)\/[^/]/.test(p)) throw new Error(`proibido: estado fora de /tmp e /dev/shm (recebido: ${p})`);
  return p;
}
const arquivoEstado = (plano, pasta) => path.join(pastaEstado(pasta), `${plano.nome}.estado.json`);
function lerEstado(plano, pasta) {
  const arq = arquivoEstado(plano, pasta);
  return fs.existsSync(arq) ? JSON.parse(fs.readFileSync(arq, 'utf8')) : { plano: plano.nome, tarefas: {} };
}
function gravarEstado(plano, est, pasta) {
  const arq = arquivoEstado(plano, pasta);
  fs.mkdirSync(path.dirname(arq), { recursive: true });
  fs.writeFileSync(arq, JSON.stringify(est, null, 2) + '\n');
  return arq;
}
const estadoDe = (est, id) => ((est.tarefas || {})[id] || {}).estado || 'pendente';
const depsAprovadas = (est, t) => (t.depende || []).every((d) => estadoDe(est, d) === 'aprovada');

function proximas(plano, est) {
  const r = { lancar: [], retomar: [], conferir: [], rodando: [], aprovadas: [] };
  for (const t of plano.tarefas) {
    const e = estadoDe(est, t.id);
    if (e === 'pendente' && depsAprovadas(est, t)) r.lancar.push(t.id);
    else if (e === 'reprovada') r.retomar.push(t.id);
    else if (e === 'feita') r.conferir.push(t.id);
    else if (e === 'lancada') r.rodando.push(t.id);
    else if (e === 'aprovada') r.aprovadas.push(t.id);
  }
  r.integrar = plano.tarefas.filter((t) => !['integracao', 'entrega'].includes(t.tipo)).every((t) => estadoDe(est, t.id) === 'aprovada');
  return r;
}

// muda o estado (e lança se a mudança não vale); devolve o texto do que fazer agora
function marcar(plano, est, id, novo, arqPlano = '<plano>') {
  const t = porId(plano).get(id);
  if (!t) throw new Error(`tarefa desconhecida: ${id} (${plano.tarefas.map((x) => x.id).join(', ')})`);
  if (!ESTADOS.includes(novo)) throw new Error(`estado inválido: ${novo} (${ESTADOS.join(', ')})`);
  const atual = estadoDe(est, id);
  if (novo === 'lancada' && !depsAprovadas(est, t)) {
    throw new Error(`${id} ainda não pode ser lançada: ${(t.depende || []).filter((d) => estadoDe(est, d) !== 'aprovada').map((d) => `${d} está ${estadoDe(est, d)}`).join(', ')}`);
  }
  if (novo === 'feita' && atual !== 'lancada') throw new Error(`${id} está ${atual}: marque lancada antes de feita`);
  if (['aprovada', 'reprovada'].includes(novo) && atual !== 'feita') throw new Error(`${id} está ${atual}: só a tarefa feita recebe veredito do conferente`);
  est.tarefas = est.tarefas || {};
  const reg = est.tarefas[id] || { reprovacoes: 0 };
  if (novo === 'reprovada') reg.reprovacoes = (reg.reprovacoes || 0) + 1;
  est.tarefas[id] = { ...reg, estado: novo, quando: new Date().toISOString() };
  const L = [`✔ ${id}: ${atual} → ${novo}`];
  if (novo === 'feita') L.push(`lance AGORA o conferente: npm run plano -- conferente ${arqPlano} ${id}`);
  if (novo === 'reprovada') L.push(`retome a MESMA frente (${t.worktree}) com os defeitos e marque de novo: npm run plano -- marcar ${arqPlano} ${id} lancada`);
  if (novo === 'aprovada') {
    const lib = plano.tarefas.filter((x) => (x.depende || []).includes(id) && estadoDe(est, x.id) === 'pendente' && depsAprovadas(est, x));
    L.push(lib.length ? `liberadas: ${lib.map((x) => x.id).join(', ')}` : 'nenhuma tarefa nova liberada');
  }
  return L.join('\n');
}

function textoProximas(plano, est, arqPlano) {
  const r = proximas(plano, est), L = [];
  L.push(r.lancar.length ? `Lançar agora: ${r.lancar.join(', ')}` : 'Lançar agora: nada');
  r.lancar.forEach((id) => L.push(`  npm run plano -- briefing ${arqPlano} ${id}`));
  if (r.retomar.length) L.push(`Retomar (reprovadas): ${r.retomar.join(', ')}`);
  if (r.conferir.length) L.push(`Conferências pendentes: ${r.conferir.join(', ')}`);
  r.conferir.forEach((id) => L.push(`  npm run plano -- conferente ${arqPlano} ${id}`));
  if (r.rodando.length) L.push(`Rodando: ${r.rodando.join(', ')}`);
  L.push(`Aprovadas: ${r.aprovadas.length} de ${plano.tarefas.length}`);
  L.push(r.integrar ? '✔ já pode integrar (todas as frentes aprovadas)' : 'integração: ainda não (falta aprovar frentes)');
  return L.join('\n');
}

module.exports = {
  carregar, conferir, ondas, caminhoCritico, mermaid, textoOndas, proximas, marcar, textoProximas,
  lerEstado, gravarEstado, pastaEstado, arquivoEstado, ancestrais,
  briefing: B.briefing, conferente: B.conferente, reservas: B.reservas, REGRA_RESERVA: B.REGRA_RESERVA, ESTADOS, predioDa: B.predioDa,
};

// ---------- linha de comando ----------
function principal(argv) {
  const { conferirOpcoes } = require('../ajuda');
  const [cmd, ...resto] = argv;
  const posicionais = { conferir: 1, ondas: 1, proximas: 1, marcar: 3, briefing: 2, conferente: 2, reservas: 1, rascunho: 1 };
  if (!(cmd in posicionais)) { console.error(`✘ comando desconhecido: ${cmd || '(nenhum)'} (veja --ajuda)`); return 2; }
  conferirOpcoes(resto, { valores: ['--estado', '--saida', '--prefixo', '--parte'], booleanas: ['--mermaid'], posicionais: posicionais[cmd] });
  const C = require('./comum');
  const op = C.lerArgs(resto, { booleanas: ['mermaid'] });
  if (op._.length < posicionais[cmd]) { console.error(`✘ ${cmd} precisa de ${posicionais[cmd]} argumento(s) (veja --ajuda)`); return 2; }
  if (cmd === 'rascunho') {
    const r = require('./plano-pedido').rascunho(fs.readFileSync(op._[0], 'utf8'), { prefixo: op.prefixo, parte: op.parte, pedido: op._[0] });
    const txt = JSON.stringify(r, null, 2) + '\n';
    if (op.saida) { fs.mkdirSync(path.dirname(path.resolve(op.saida)), { recursive: true }); fs.writeFileSync(op.saida, txt); console.log(`✔ rascunho em ${op.saida}\n  confira: npm run plano -- conferir ${op.saida}`); } else process.stdout.write(txt);
    return 0;
  }
  const arq = op._[0], plano = carregar(arq);
  if (cmd === 'conferir') {
    const erros = conferir(plano);
    if (erros.length) { erros.forEach((e) => console.log('✘ ' + e)); console.log(`\n${erros.length} problema(s) em ${arq}`); return 1; }
    const n = ondas(plano).length;
    console.log(`✔ ${arq}: ${plano.tarefas.length} tarefas, ${plano.personagens.length} personagem(ns), ${n} ondas, ${new Set(plano.tarefas.map((t) => t.worktree)).size} worktrees`);
    return 0;
  }
  if (cmd === 'ondas') { console.log(op.mermaid ? mermaid(plano) + '\n\n' + textoOndas(plano) : textoOndas(plano)); return 0; }
  if (cmd === 'reservas') { B.reservas(plano).forEach((l) => console.log(l)); return 0; }
  let mae = '/home/leandro';
  try { mae = C.raizes(process.cwd()).mae; } catch (e) { /* fora de um repositório: o padrão */ }
  if (cmd === 'briefing') { console.log(B.briefing(plano, op._[1], { mae })); return 0; }
  if (cmd === 'conferente') { console.log(B.conferente(plano, op._[1], { mae, arqPlano: arq })); return 0; }
  const est = lerEstado(plano, op.estado);
  if (cmd === 'proximas') { console.log(textoProximas(plano, est, arq)); return 0; }
  const texto = marcar(plano, est, op._[1], op._[2], arq);
  const onde = gravarEstado(plano, est, op.estado);
  console.log(`${texto}\n(estado em ${onde})`);
  return 0;
}

if (require.main === module) {
  try { process.exitCode = principal(process.argv.slice(2)); } catch (e) { console.error('✘ ' + e.message); process.exitCode = 1; }
}
