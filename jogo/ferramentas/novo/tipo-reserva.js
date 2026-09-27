// Tipo `reserva` do `npm run novo`: o contrato de um NPC antes das frentes que o constroem em paralelo
// (docs/contratos/plano-paralelo.md §2). Escreve no prédio:
//   reservas.js           Reino.reservarPersonagem({ id, nome, genero, idade, perfil, predio, x, y, acao? }), o PRIMEIRO
//                         do prédio no manifesto (é do orquestrador; a vaga tracejada aparece no interior na hora)
//   personagens-falas.js  as falas (preencher) do NPC numa parte própria (Reino.falasDoPredio), depois do falas.js:
//                         é da frente das falas, e as vozes podem ser gravadas sem esperar o visual
// O visual vem depois, de outra frente: `npm run novo -- personagem <id> --predio <p>` só com o sprite.
// --predio é o id do INTERIOR, como no tipo personagem. Sem --x/--y: um chão livre alcançável perto da entrada.
const fs = require('fs');
const path = require('path');
const Vozes = require('./vozes');
const P = require('./tipo-personagem');

const novo = () => require('./novo');
const GENEROS = { f: 'feminina', m: 'masculina' };
const IDADES = ['crianca', 'jovem', 'adulto', 'idoso'];

// o 1º script da pasta do prédio (ou da matéria) no manifesto: a reserva carrega antes de tudo dele
function primeiroDaPasta(scripts, arq) {
  const pasta = path.dirname(arq.replace(/^jogo\//, '')) + '/';
  const s = scripts.find((x) => x.js.startsWith(pasta));
  if (!s) throw new Error(`reserva: nada de ${pasta} no manifesto`);
  return s.js;
}

module.exports = {
  ajuda: 'reserva <id> --predio <interior> --nome "Dona Lulu" --genero f|m --idade crianca|jovem|adulto|idoso [--x 3 --y 5] [--acao guia|\'{"tipo":"tela","tela":"x"}\']',
  cria: 'reservas.js do prédio (contrato do NPC: nome, gênero, idade, voz, vaga) e as falas (preencher) em personagens-falas.js',
  conferir(id, op, ex, raiz) {
    const p = op.predio;
    if (!p || !/^[a-z0-9-]+$/.test(p)) throw new Error('reserva: falta --predio <id do interior> (ex.: salao, torre-1, padrao-geografia)');
    if (!op.nome) throw new Error('reserva: falta --nome (o nome é parte do contrato)');
    if (!GENEROS[op.genero]) throw new Error('reserva: --genero f ou m');
    if (!IDADES.includes(op.idade)) throw new Error(`reserva: --idade ${IDADES.join('|')}`);
    if ((op.x === undefined) !== (op.y === undefined)) throw new Error('reserva: --x e --y juntos');
    ['x', 'y'].forEach((k) => { if (op[k] !== undefined && !/^\d+$/.test(op[k])) throw new Error(`reserva: --${k} é um tile (inteiro ≥ 0)`); });
    const d = op.dadosReserva = P.dados(raiz, p, GENEROS[op.genero]);
    if ((d.R.NPCs && d.R.NPCs.ELENCO && d.R.NPCs.ELENCO[id]) || d.R.personagens[id] || d.V['npc-' + id]) throw new Error(`reserva: "${id}" já existe`);
    // vozes das outras reservas do mesmo prédio contam como usadas
    const usadas = new Set();
    Object.values(d.R.reservas || {}).filter((r) => r.predio === p && r.perfil).forEach((r) => usadas.add(Vozes.chave(r.perfil)));
    (d.L.def.npcs || []).forEach((n) => { if (d.V[n.voz]) usadas.add(Vozes.chave(d.V[n.voz])); });
    d.voz = Vozes.escolher(d.V, usadas, GENEROS[op.genero]);
    if (!d.voz) throw new Error(`reserva: nenhuma voz ${GENEROS[op.genero]} de config.vozes livre em ${p}; escreva o perfil à mão`);
    op.acaoObj = op.acao ? (op.acao === 'guia' ? { tipo: 'guia', lugar: d.L.def.lugar || p } : JSON.parse(op.acao)) : null;
    op.xyEscolhido = null;
    if (op.x === undefined) {
      const t = P.chaoLivre(d.R, d.L.def);
      if (!t) throw new Error(`reserva: não achei chão livre em ${p}; diga --x/--y`);
      op.x = String(t.x + d.desloc); op.y = String(t.y + d.desloc); op.xyEscolhido = t;
    }
    d.arqReservas = d.L.arq.replace(/personagens\.js$/, 'reservas.js');
    d.arqFalas = d.L.arq.replace(/personagens\.js$/, 'personagens-falas.js');
    d.temReservas = fs.existsSync(path.join(raiz, d.arqReservas));
    d.temFalas = fs.existsSync(path.join(raiz, d.arqFalas));
  },
  arquivos(id, op) {
    const d = op.dadosReserva, pf = d.V[d.voz], L = d.L;
    const perfil = { voz: pf.voz, velocidade: pf.velocidade, tom: pf.tom };
    const reserva = `// ${id}: ${op.nome} (voz ${GENEROS[op.genero]} copiada de ${d.voz}, que ${op.predio} ainda não usa)
Reino.reservarPersonagem({ id: '${id}', nome: '${novo().aspas(op.nome)}', genero: '${op.genero}', idade: '${op.idade}',
  perfil: ${novo().literal(perfil)},
  predio: '${op.predio}', x: ${op.x}, y: ${op.y}${op.acaoObj ? `, acao: ${novo().literal(op.acaoObj)}` : ''},
});
`;
    const cabR = `/* Reservas de personagem ${L.pasta ? 'do prédio ' + L.pasta : 'do interior ' + op.predio}: o contrato de cada NPC (quem é, voz e vaga),
   escrito antes das frentes que o constroem em paralelo (docs/contratos/plano-paralelo.md §2). É do orquestrador:
   as frentes só leem. O visual vem de Reino.registrarPersonagem({ id, sprite }) no personagens.js. */
`;
    const falas = `  '${id}': {
    oi: ['(preencher) quem é você?', '(preencher) o que faz aqui?'],
    depois: ['(preencher) uma fala curtinha.'],
  },
`;
    const cabF = `/* Falas dos personagens reservados ${L.pasta ? 'do prédio ' + L.pasta : 'do interior ' + op.predio} (reservas.js), numa parte própria de
   Reino.falasDoPredio: a frente das falas escreve aqui e as vozes são gravadas sem esperar o visual.
   Cada página com até 30 letras (sem contar «» e emoji) e frases de 3+ palavras. */
Reino.falasDoPredio('${L.falas}', { npcs: {
${falas}} });
`;
    return [
      [d.arqReservas, d.temReservas ? { acrescentar: '\n' + reserva } : cabR + reserva],
      [d.arqFalas, d.temFalas ? { acrescentar: `Reino.falasDoPredio('${L.falas}', { npcs: {\n${falas}} });\n` } : cabF],
    ];
  },
  manifesto(id, op) {
    const d = op.dadosReserva, m = [];
    if (!d.temReservas) m.push({ jss: [d.arqReservas.replace(/^jogo\//, '')], onde: { antesDe: primeiroDaPasta(d.Jogo.manifesto.scripts, d.arqReservas), grupo: d.L.onde.grupo } });
    if (!d.temFalas) m.push({ jss: [d.arqFalas.replace(/^jogo\//, '')], onde: d.L.onde });
    return m;
  },
  checklist(id, op) {
    const d = op.dadosReserva;
    return [
      `falas (frente das falas): troque cada (preencher) em ${d.arqFalas}`,
      `visual (frente do NPC): npm run novo -- personagem ${id} --predio ${op.predio} (só o sprite${op.acaoObj ? '' : ' e a ação'})`,
      `voz: npm run vozes-elenco (a reserva é ${GENEROS[op.genero]}; troque o perfil no ${d.arqReservas} se acusar)`,
      op.xyEscolhido ? `vaga: escolhi o chão livre (${op.x}, ${op.y}); o cenário deixa esse tile livre` : `vaga: (${op.x}, ${op.y}); o cenário deixa esse tile livre`,
      'até o registro, a vaga tracejada aparece no interior e o validador acusa (nas frentes: REINO_RESERVAS_ABERTAS=1)',
    ];
  },
  validadores: ['node jogo/ferramentas/validar/validar-interiores.js', 'npm run vozes-elenco'],
  ver(id, op) { return `npm run ver -- --ir ${op.dadosReserva.L.def.lugar || op.predio} --nome ${id}`; },
};
