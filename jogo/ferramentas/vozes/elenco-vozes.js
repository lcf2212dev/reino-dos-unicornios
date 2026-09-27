// Confere as vozes do ELENCO (personagens dos prédios) antes das amostras e da gravação.
// Uso (da raiz do repositório):
//   node jogo/ferramentas/vozes/elenco-vozes.js          checagens; sai com 1 se houver ERRO (avisos não reprovam)
//   node jogo/ferramentas/vozes/elenco-vozes.js --json   a lista dos personagens (para o amostras.py)
// Checagens (perfis de Reino.config.vozes, inclusive os `perfil` do Reino.registrarPersonagem):
//   ERRO  voz base do Claude com tom a até 15 Hz e velocidade a até 10 pontos: a criança confunde com o Claude
//   aviso dois personagens do mesmo pacote interior-* com a mesma voz base, tom a até 8 Hz e velocidade a até 8 pontos
//   aviso o mesmo nome visível (o nome próprio, sem "Doutora", "Seu"…) em dois personagens do mesmo pacote
//   aviso voz masculina para quem se apresenta no feminino ("eu sou a", Doutora, Professora…) ou o contrário
// Limiares: no edge-tts, menos de ~15 Hz e ~10% de diferença na MESMA voz soa como a mesma pessoa.
if (require.main === module) require('../ajuda').ajuda(__filename);
const path = require('path');

const LIMITE_CLAUDE = { tom: 15, velocidade: 10 };
const LIMITE_PREDIO = { tom: 8, velocidade: 8 };
const MASCULINAS = ['Antonio', 'Florian', 'William', 'Andrew', 'Brian', 'Remy', 'Giuseppe', 'Hyunsu', 'Duarte'];
const FEMININAS = ['Francisca', 'Thalita', 'Seraphina', 'Ava', 'Emma', 'Vivienne', 'Raquel'];
// títulos antes do nome; os ambíguos (Guarda, Detetive, Astronauta, Guia) dependem da fala
const TITULO_F = /^(doutora|professora|engenheira|jardineira|cavaleira|bi[oó]loga|exploradora|diretora|restauradora|dona|vov[oó]|tia|princesa|fada|capit[aã]|miss|chefa)$/i;
const TITULO_M = /^(doutor|professor|engenheiro|jardineiro|cavaleiro|bi[oó]logo|explorador|diretor|restaurador|seu|vov[oô]|tio|pr[ií]ncipe|carteiro|relojoeiro|palha[cç]o|sir|mister|mr)$/i;
const AMBIGUOS = /^(guarda|detetive|astronauta|guia|rob[oô]|chef|coach|teacher|doctor)$/i;
const titulo = (w) => TITULO_F.test(w) || TITULO_M.test(w) || AMBIGUOS.test(w);

const limpar = (t) => String(t || '').replace(/[«»]/g, '').trim();
const numero = (s) => parseFloat(String(s || '0').replace('%', '').replace('Hz', '')) || 0;
const vozBase = (v) => (v && v.voz) || '';
const generoDaVoz = (voz) => {
  const m = /-([A-Z][a-z]+?)(?:Multilingual)?Neural$/.exec(voz || '');
  if (!m) return null;
  return MASCULINAS.includes(m[1]) ? 'm' : FEMININAS.includes(m[1]) ? 'f' : null;
};
// nome próprio: tira os títulos da frente ("Relojoeiro Seu Ponteiro" → "Ponteiro")
function nomeProprio(nome) {
  const p = limpar(nome).split(/\s+/);
  while (p.length > 1 && titulo(p[0])) p.shift();
  return p.join(' ').toLowerCase();
}
// gênero da reserva (Reino.reservarPersonagem: é o contrato); sem reserva, pelo título e pelas falas ("eu sou a …");
// sinais em conflito = não decide
function generoDoPersonagem(pers) {
  if (pers.genero === 'f' || pers.genero === 'm') return pers.genero;
  const sinais = new Set();
  const t = limpar(pers.nome).split(/\s+/)[0] || '';
  if (TITULO_F.test(t)) sinais.add('f');
  if (TITULO_M.test(t)) sinais.add('m');
  (pers.falas || []).forEach((f) => {
    if (/\b(eu )?sou a\s/i.test(f) || /\bsou uma\s/i.test(f)) sinais.add('f');
    if (/\b(eu )?sou o\s/i.test(f) || /\bsou um\s/i.test(f)) sinais.add('m');
  });
  return sinais.size === 1 ? [...sinais][0] : null;
}
const perto = (a, b, lim) => vozBase(a) === vozBase(b) &&
  Math.abs(numero(a.tom) - numero(b.tom)) <= lim.tom && Math.abs(numero(a.velocidade) - numero(b.velocidade)) <= lim.velocidade;
const desc = (v) => `${vozBase(v)} ${v.velocidade || '+0%'} ${v.tom || '+0Hz'}`;

/** @param {{id:string,nome:string,voz:string,pacotes:string[],falas?:string[]}[]} personagens
    @param {{[perfil:string]: any}} vozes  @returns {{erros:string[], avisos:string[]}} */
function checarElenco(personagens, vozes) {
  const erros = [], avisos = [];
  const claude = vozes.claude;
  personagens.forEach((p) => {
    const v = vozes[p.voz];
    if (!v) return;
    if (claude && p.voz !== 'claude' && perto(v, claude, LIMITE_CLAUDE))
      erros.push(`${limpar(p.nome)} (${p.voz}: ${desc(v)}) soa como o Claude (${desc(claude)})`);
    const gv = generoDaVoz(vozBase(v)), gp = generoDoPersonagem(p);
    if (gv && gp && gv !== gp)
      avisos.push(`${limpar(p.nome)} (${p.voz}) se apresenta no ${gp === 'f' ? 'feminino' : 'masculino'} e a voz ${vozBase(v)} é ${gv === 'f' ? 'feminina' : 'masculina'}`);
  });
  for (let i = 0; i < personagens.length; i++) {
    for (let j = i + 1; j < personagens.length; j++) {
      const a = personagens[i], b = personagens[j];
      if (a.voz === b.voz) continue;   // a mesma pessoa em dois lugares
      const juntos = a.pacotes.filter((x) => b.pacotes.includes(x));
      if (!juntos.length) continue;
      const va = vozes[a.voz], vb = vozes[b.voz];
      if (va && vb && perto(va, vb, LIMITE_PREDIO))
        avisos.push(`${juntos.join(', ')}: ${limpar(a.nome)} (${desc(va)}) e ${limpar(b.nome)} (${desc(vb)}) soam iguais`);
      if (nomeProprio(a.nome) === nomeProprio(b.nome))
        avisos.push(`${juntos.join(', ')}: ${limpar(a.nome)} e ${limpar(b.nome)} têm o mesmo nome`);
    }
  }
  return { erros, avisos };
}

// os personagens do jogo: um por perfil de voz, com os pacotes interior-* e os lugares onde aparece
function personagensDoJogo() {
  const Jogo = require('../jogo-no-node');
  const ctx = Jogo.contexto({ console, Math, Date, setTimeout, clearTimeout });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  const R = ctx.Reino, porVoz = new Map();
  const achar = (voz, nome) => {
    if (!porVoz.has(voz)) porVoz.set(voz, { id: voz.replace(/^npc-/, ''), nome, voz, pacotes: [], lugares: [], falas: [] });
    return porVoz.get(voz);
  };
  R.interiores.forEach((d) => (d.npcs || []).forEach((n) => {
    if (!n.voz) return;
    const p = achar(n.voz, n.nome);
    if (d.pacote && !p.pacotes.includes(d.pacote)) p.pacotes.push(d.pacote);
    if (!p.lugares.includes(limpar(d.nome))) p.lugares.push(limpar(d.nome));
    Object.values(n.falas || {}).forEach((l) => [].concat(l).forEach((f) => typeof f === 'string' && p.falas.push(f)));
  }));
  Object.values((R.NPCs && R.NPCs.ELENCO) || {}).forEach((e) => { if (e.voz) achar(e.voz, e.nome); });
  Object.values(R.reservas || {}).forEach((r) => { achar('npc-' + r.id, r.nome).genero = r.genero; });
  return { personagens: [...porVoz.values()], vozes: R.config.vozes };
}

if (require.main === module) {
  const { personagens, vozes } = personagensDoJogo();
  if (process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify(personagens.map((p) => Object.assign({}, p, { perfil: vozes[p.voz] })), null, 1));
    process.exit(0);
  }
  const { erros, avisos } = checarElenco(personagens, vozes);
  console.log(`Elenco: ${personagens.length} personagens com voz (${path.relative(process.cwd(), __filename)})`);
  erros.forEach((e) => console.log('  ✘ ' + e));
  avisos.forEach((a) => console.log('  ! ' + a));
  console.log(erros.length ? `✘ ${erros.length} erro(s), ${avisos.length} aviso(s)` : `✔ sem erros (${avisos.length} aviso(s))`);
  process.exit(erros.length ? 1 : 0);
}

module.exports = { checarElenco, personagensDoJogo, generoDaVoz, generoDoPersonagem, nomeProprio, LIMITE_CLAUDE, LIMITE_PREDIO };
