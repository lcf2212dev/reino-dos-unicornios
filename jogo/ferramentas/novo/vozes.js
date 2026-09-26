// Escolha de voz para personagem novo (novo personagem, novo prova --professora): um perfil de config.vozes que
// ninguém do grupo usa, do gênero pedido. O gênero vem do nome da voz do edge-tts (…FranciscaNeural, …AntonioNeural).
const FEMININAS = ['Francisca', 'Thalita', 'Vivienne', 'Ava', 'Emma', 'Seraphina', 'Sonia'];
const MASCULINAS = ['Antonio', 'Remy', 'Giuseppe', 'Andrew', 'Brian', 'William', 'Florian', 'Hyunsu'];
const GENEROS = ['feminina', 'masculina'];

const chave = (p) => [p.voz, p.velocidade, p.tom].join('|');
// 'pt-BR-FranciscaNeural' → 'Francisca'
function genero(perfil) {
  const n = (String(perfil && perfil.voz).split('-')[2] || '').replace(/(Multilingual)?Neural$/, '');
  return FEMININAS.includes(n) ? 'feminina' : MASCULINAS.includes(n) ? 'masculina' : null;
}
// gênero provável pelo começo do nome (só um padrão: o checklist avisa)
function generoDoNome(nome) {
  const p = String(nome || '').trim().split(/\s+/)[0].toLowerCase();
  if (['dona', 'professora', 'senhora', 'tia', 'vovó', 'rainha', 'princesa', 'fada', 'doutora', 'moça', 'menina'].includes(p)) return 'feminina';
  if (['seu', 'senhor', 'professor', 'tio', 'vovô', 'rei', 'príncipe', 'dom', 'doutor', 'moço', 'menino'].includes(p)) return 'masculina';
  return null;
}
/** V = config.vozes; usadas = Set de chave(perfil) que o grupo já usa; g = 'feminina' | 'masculina' | null.
    Devolve a chave de config.vozes (os npc-padrao primeiro, sem as vozes de inglês) ou undefined. */
function escolher(V, usadas, g) {
  const cands = Object.keys(V).filter((k) => k.startsWith('npc-') && !k.endsWith('-en') && V[k].voz)
    .sort((a, b) => b.startsWith('npc-padrao') - a.startsWith('npc-padrao'));
  return cands.find((k) => !usadas.has(chave(V[k])) && (!g || genero(V[k]) === g));
}
// --voz dada, ou pelo nome (com aviso), ou nenhuma preferência
function generoPedido(op, nome, padrao) {
  if (op.voz) {
    if (!GENEROS.includes(op.voz)) throw new Error(`--voz ${GENEROS.join('|')}`);
    return { g: op.voz, aviso: '' };
  }
  const g = generoDoNome(nome) || padrao || null;
  return { g, aviso: g ? `voz ${g} escolhida pelo nome "${nome}" (troque com --voz ${GENEROS.join('|')})` : `voz de qualquer gênero (o nome não diz; use --voz ${GENEROS.join('|')})` };
}

module.exports = { chave, genero, generoDoNome, escolher, generoPedido, GENEROS };
