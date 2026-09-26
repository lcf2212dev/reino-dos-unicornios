// Escadas pareadas (chamado por validar-interiores.js; docs/contratos/interiores.md §3).
// Toda escada tem par no destino: exatamente uma escada de lá com `para` = este andar. Ela chega ao lado do
// par (`chegar` do par, padrão (0, 1)): esse tile tem de ser andável, fora de escada e do tapete de saída.
// `chegada` explícita (jeito antigo) ainda vale, mas se a escada também tem par vira aviso (o par basta).
const PADRAO = { x: 0, y: 1 };

// onde ela chega pela escada i do interior d: a função do jogo (Reino.Interiores.chegadaDaEscada)
function chegada(Reino, d, i) {
  const I = Reino.Interiores;
  if (I && typeof I.chegadaDaEscada === 'function') return I.chegadaDaEscada(d.id, i);
  const e = (d.escadas || [])[i];
  return e ? e.chegada || null : null;
}

// ctx: { Reino, defs, grades, erros, avisos }
function checar({ Reino, defs, grades, erros, avisos }) {
  const def = (id) => Reino.interiores.find((d) => d.id === id);
  const andavel = (g, p) => p && g.dentro(p.x, p.y) && !g.solido[p.y][p.x];
  const ehEscada = (d, p) => (d.escadas || []).some((e) => e.x === p.x && e.y === p.y);
  defs.forEach((d) => (d.escadas || []).forEach((e, i) => {
    const o = `${d.id}: escada ${i} (${e.x},${e.y})`;
    const dest = def(e.para);
    if (!dest) return;   // destino que não existe: validar-interiores já acusa
    const pares = (dest.escadas || []).filter((v) => v.para === d.id);
    if (pares.length !== 1) erros.push(`${o}: precisa de exatamente 1 escada de volta em "${e.para}" (para: '${d.id}'), tem ${pares.length}`);
    if (e.chegar) {
      const ok = Number.isInteger(e.chegar.x) && Number.isInteger(e.chegar.y) && Math.abs(e.chegar.x) + Math.abs(e.chegar.y) === 1;
      if (!ok) erros.push(`${o}: chegar {x,y} precisa ser um passo ao lado ({x:±1,y:0} ou {x:0,y:±1})`);
    }
    if (e.chegada && pares.length) avisos.push(`${o}: tem chegada fixa e também par em "${e.para}" (tire a chegada: o \`chegar\` do par decide)`);
    const c = chegada(Reino, d, i), gd = grades.get(e.para);
    if (!c) { erros.push(`${o}: sem lugar de chegada em "${e.para}" (sem par e sem spawn)`); return; }
    if (!gd) return;
    const lado = e.chegada ? 'chegada' : `chegada (lado \`chegar\` ${JSON.stringify(pares[0] ? pares[0].chegar || PADRAO : PADRAO)} da escada de volta)`;
    if (!andavel(gd, c)) erros.push(`${o}: ${lado} (${c.x},${c.y}) em "${e.para}" não é andável`);
    if (ehEscada(dest, c)) erros.push(`${o}: ${lado} em cima de escada em "${e.para}"`);
    if (dest.saida && dest.saida.x === c.x && dest.saida.y === c.y) erros.push(`${o}: ${lado} em cima do tapete de saída de "${e.para}"`);
  }));
}

module.exports = { checar, chegada };
