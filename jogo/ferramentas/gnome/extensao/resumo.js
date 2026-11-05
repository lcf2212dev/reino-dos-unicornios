// Resumo dia a dia do save (só leitura): eventos com carimbo do próprio save + diferenças de contadores entre
// dias (o diário local guarda só os NÚMEROS derivados, nunca o save). Sem GJS: os testes importam este arquivo no Node.

const DIA = 86400000;

export function chaveDia(ms) {
  const d = new Date(ms);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function num(v) { if (typeof v === 'string') v = Number(v); return typeof v === 'number' && isFinite(v) && v > 0 ? v : 0; }
function cada(o, f) { if (o && typeof o === 'object') for (const k of Object.keys(o)) if (o[k] && typeof o[k] === 'object') f(k, o[k]); }

function nomeSala(nomes, id) {
  const s = nomes.salas && nomes.salas[id];
  if (!s) return id;
  const m = nomes.materias && nomes.materias[s.materia];
  return s.nome + (m ? ' (' + m + ')' : '');
}
function nome(nomes, tipo, id) { return (nomes[tipo] && nomes[tipo][id]) || id; }

/** Contadores de hoje (só números), para comparar com o dia anterior no diário local. */
export function contagens(estado) {
  estado = estado && typeof estado === 'object' ? estado : {};
  const c = { estrelas: num(estado.estrelas && estado.estrelas.ganhas), salas: {}, treinos: {}, provas: {}, comidas: 0 };
  cada(estado.salas, (id, s) => { c.salas[id] = num(s.vezes); });
  cada(estado.treinos, (id, t) => { c.treinos[id] = num(t.vezes); });
  cada(estado.provas, (id, p) => { c.provas[id] = num(p.tentativas); });
  cada(estado.despensa, (id, d) => { c.comidas += num(d.usadas); });
  return c;
}

/** Atualiza o diário ({ <dia>: contagens da última busca do dia; o que ela fez depois cai no próximo dia com busca }) com as contagens de agora. Devolve um novo objeto. */
export function atualizarDiario(diario, estado, agora) {
  const d = Object.assign({}, diario || {});
  d[chaveDia(agora)] = contagens(estado);
  const dias = Object.keys(d).sort();
  while (dias.length > 120) delete d[dias.shift()];
  return d;
}

function somaDiff(a, b) {
  let t = 0; const ids = [];
  for (const k of Object.keys(b || {})) { const antes = num(a && a[k]), x = num(b[k]) < antes ? num(b[k]) : num(b[k]) - antes; if (x > 0) { t += x; ids.push([k, x]); } }
  return { t, ids };
}

/** Dias (do mais novo ao mais velho, até `quantos`) com a lista de linhas de texto de cada um. */
export function resumir(estado, diario, nomes, agora, quantos = 14) {
  nomes = nomes || {};
  estado = estado && typeof estado === 'object' ? estado : {};
  const dias = {};
  function add(ms, texto) { if (!num(ms)) return; const k = chaveDia(ms); (dias[k] = dias[k] || []).push({ ms, texto }); }

  cada(estado.salas, (id, s) => {
    add(s.feita, '📚 Terminou a sala ' + nomeSala(nomes, id) + (s.perfeita ? ' (perfeita ✨)' : ''));
  });
  cada(estado.provas, (id, p) => {
    add(p.premioEm, '📝 ' + nome(nomes, 'provas', id) + ': nota ' + (p.melhor != null ? p.melhor : '?') + ', ganhou o prêmio');
  });
  cada(estado.unis, (id, u) => {
    if (id !== 'inicial') add(u.em, (u.chocado ? '🦄 Ganhou o unicórnio ' : '🥚 Ganhou o ovo de ') + (u.nome || nome(nomes, 'unis', id)));
  });
  cada(estado.cuidados, (id, c) => {
    const n = (estado.unis && estado.unis[id] && estado.unis[id].nome) || nome(nomes, 'unis', id);
    add(c.acaoFome, '🥕 Deu comida para ' + n + ' (a última do dia)');
    add(c.acaoSede, '💧 Deu água para ' + n + ' (a última do dia)');
    add(c.acaoBanho, '🛁 Deu banho em ' + n + ' (o último do dia)');
  });
  if (estado.tempoUsos && typeof estado.tempoUsos === 'object') {
    const porDia = {};
    for (const k of Object.keys(estado.tempoUsos)) {
      const ms = parseInt(k, 10), min = num(estado.tempoUsos[k]);
      if (num(ms) && min) { const d = chaveDia(ms); porDia[d] = porDia[d] || { ms, min: 0 }; porDia[d].min += min; }
    }
    for (const d of Object.keys(porDia)) add(porDia[d].ms, '📱 Usou ' + porDia[d].min + ' min de tempo de celular');
  }
  if (estado.pagoEm && typeof estado.pagoEm === 'object') {
    for (const id of Object.keys(estado.pagoEm)) add(estado.pagoEm[id], '💰 Pagamento registrado: ' + nome(nomes, 'materias', id));
  }
  const casa = {};
  cada(estado.casaItens, (_id, it) => { if (num(it.em)) { const d = chaveDia(it.em); casa[d] = casa[d] || { ms: it.em, n: 0 }; casa[d].n++; } });
  for (const d of Object.keys(casa)) add(casa[d].ms, '🏠 Arrumou a casa (' + casa[d].n + (casa[d].n > 1 ? ' móveis)' : ' móvel)'));

  // diferenças de contadores entre dias seguidos do diário (quanto ela repetiu, treinou, ganhou)
  const ds = Object.keys(diario || {}).filter((k) => diario[k] && typeof diario[k] === 'object').sort();
  for (let i = 1; i < ds.length; i++) {
    const a = diario[ds[i - 1]], b = diario[ds[i]];
    const ms = new Date(ds[i] + 'T12:00:00').getTime();
    const linhas = [];
    const est = num(b.estrelas) - num(a.estrelas);
    if (est > 0) linhas.push('⭐ Ganhou ' + est + ' estrela' + (est > 1 ? 's' : ''));
    const sal = somaDiff(a.salas, b.salas);
    if (sal.t) linhas.push('🔁 Jogou salas ' + sal.t + 'x: ' + sal.ids.map(([k, x]) => nomeSala(nomes, k) + (x > 1 ? ' ×' + x : '')).join(', '));
    const tr = somaDiff(a.treinos, b.treinos);
    if (tr.t) linhas.push('🏋️ Treinou ' + tr.t + 'x: ' + tr.ids.map(([k]) => nome(nomes, 'materias', k)).join(', '));
    const pr = somaDiff(a.provas, b.provas);
    if (pr.t) linhas.push('✏️ Tentou provas ' + pr.t + 'x: ' + pr.ids.map(([k]) => nome(nomes, 'provas', k)).join(', '));
    const com = num(b.comidas) - num(a.comidas);
    if (com > 0) linhas.push('🍽️ Deu ' + com + ' comida' + (com > 1 ? 's' : '') + ' aos unicórnios');
    linhas.forEach((t) => add(ms, t));
  }

  const hoje = chaveDia(agora);
  return Object.keys(dias).filter((k) => k <= hoje).sort().reverse().slice(0, quantos)
    .map((k) => ({ dia: k, linhas: dias[k].sort((x, y) => x.ms - y.ms).map((l) => l.texto) }));
}

export { DIA };
