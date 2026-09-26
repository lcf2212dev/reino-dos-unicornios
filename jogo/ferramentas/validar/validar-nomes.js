// Nome repetido: dois personagens DIFERENTES com o mesmo nome visível (sem os títulos: Doutora, Seu, Dona…).
// Erro no mesmo prédio (mesmo `lugar`, todos os andares); aviso em prédios diferentes.
// O mesmo personagem (mesma voz; sem voz, o mesmo id) em dois lugares é legítimo.
// Uso: node jogo/ferramentas/validar/validar-nomes.js   (também em npm run validar, por validar-tudo.js)
const { nomeProprio } = require('../vozes/elenco-vozes');

/** @param {{nome:string, quem:string, predio:string}[]} lista  @returns {{erros:string[], avisos:string[]}} */
function conferirNomes(lista) {
  const erros = [], avisos = [], porNome = new Map();
  lista.forEach((p) => {
    const n = nomeProprio(p.nome);
    if (!n) return;
    if (!porNome.has(n)) porNome.set(n, []);
    porNome.get(n).push(p);
  });
  porNome.forEach((ps, n) => {
    const quem = new Map();
    ps.forEach((p) => { if (!quem.has(p.quem)) quem.set(p.quem, p); });
    if (quem.size < 2) return;
    const unicos = [...quem.values()];
    const predios = new Map();
    ps.forEach((p) => { if (!predios.has(p.predio)) predios.set(p.predio, new Set()); predios.get(p.predio).add(p.quem); });
    let noMesmo = false;
    predios.forEach((qs, pr) => {
      if (qs.size < 2) return;
      noMesmo = true;
      erros.push(`${pr}: ${[...qs].map((q) => quem.get(q).nome).join(' e ')} têm o mesmo nome ("${n}")`);
    });
    if (!noMesmo) avisos.push(`"${n}" em prédios diferentes: ${unicos.map((p) => `${p.nome} (${p.predio})`).join(', ')}`);
  });
  return { erros, avisos };
}

// os NPCs de todos os interiores: nome, identidade (voz ou id) e prédio (lugar do mapa)
function personagensDosPredios() {
  const Jogo = require('../jogo-no-node');
  const ctx = Jogo.contexto({ console, Math, Date, setTimeout, clearTimeout });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  const lista = [];
  ctx.Reino.interiores.forEach((d) => (d.npcs || []).forEach((n) => {
    if (n.nome) lista.push({ nome: n.nome, quem: n.voz || n.id, predio: d.lugar || d.id });
  }));
  return lista;
}

if (require.main === module) {
  const lista = personagensDosPredios();
  const { erros, avisos } = conferirNomes(lista);
  erros.forEach((e) => console.log('✘ ' + e));
  avisos.forEach((a) => console.log('⚠ ' + a));
  if (erros.length) { console.log(`✘ ${erros.length} nome(s) repetido(s) no mesmo prédio`); process.exit(1); }
  console.log(`✔ nomes: ${lista.length} personagens, sem nome repetido no mesmo prédio${avisos.length ? ` (${avisos.length} aviso(s))` : ''}`);
}

module.exports = { conferirNomes, personagensDosPredios };
