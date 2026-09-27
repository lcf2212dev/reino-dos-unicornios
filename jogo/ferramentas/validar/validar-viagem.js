// Viagem de foguete (chamado por validar-interiores.js; docs/contratos/viagem.md). Um objeto ou NPC com
// `acao.tipo === 'viagem'` que ela alcança leva ao destino, como uma escada: com `acao.para`, a esse interior
// (em `acao.chegada`, senão no spawn dele); sem `para` (o foguete do Hangar), a cada planeta de
// Reino.Viagem.planetas() (`interior` e `chegada`). Também confere o `fundo` (céu aberto) e o destino.

// tiles de um objeto (pegada) ou de um NPC (1×1)
function tiles(I, o) {
  const dm = I.dimensoes ? I.dimensoes(o) : { w: o.w || 1, h: o.h || 1 }, ts = [];
  for (let y = o.y; y < o.y + dm.h; y++) for (let x = o.x; x < o.x + dm.w; x++) ts.push({ x, y });
  return ts;
}

// os destinos de uma ação de viagem: [{ id, x, y }] (x/y do destino; sem chegada, o spawn do interior)
function destinosDaAcao(Reino, acao) {
  const def = (id) => Reino.interiores.find((d) => d.id === id);
  const alvos = acao.para ? [{ interior: acao.para, chegada: acao.chegada }]
    : (Reino.Viagem && Reino.Viagem.planetas ? Reino.Viagem.planetas() : []);
  return alvos.map((a) => {
    const d = def(a.interior), c = a.chegada || (d && d.spawn);
    return { id: a.interior, x: c ? c.x : -1, y: c ? c.y : -1, existe: Boolean(d) };
  });
}

// erros de formato: fundo registrado, destino existente e andável
function checar({ Reino, defs, grades, erros }) {
  const I = Reino.Interiores;
  defs.forEach((d) => {
    if (d.fundo && !(I.FUNDOS && I.FUNDOS[d.fundo])) erros.push(`${d.id}: fundo "${d.fundo}" não existe (I.FUNDOS)`);
    (d.objetos || []).concat(d.npcs || []).forEach((o) => {
      if (!o.acao || o.acao.tipo !== 'viagem') return;
      destinosDaAcao(Reino, o.acao).forEach((t) => {
        if (!t.existe) { erros.push(`${d.id}: viagem para "${t.id}", que não existe`); return; }
        const g = grades.get(t.id);
        if (g && !(g.dentro(t.x, t.y) && !g.solido[t.y][t.x])) erros.push(`${d.id}: viagem chega em ${t.id} (${t.x},${t.y}), que não é andável`);
      });
    });
  });
}

// para a alcançabilidade: [[id, x, y]] dos destinos das viagens que ela já alcança (vizAlc(d, tiles))
function destinos(Reino, defs, vizAlc) {
  const I = Reino.Interiores, saida = [];
  defs.forEach((d) => (d.objetos || []).concat(d.npcs || []).forEach((o) => {
    if (!o.acao || o.acao.tipo !== 'viagem' || !vizAlc(d, tiles(I, o))) return;
    destinosDaAcao(Reino, o.acao).forEach((t) => { if (t.existe) saida.push([t.id, t.x, t.y]); });
  }));
  return saida;
}

module.exports = { checar, destinos, destinosDaAcao };
