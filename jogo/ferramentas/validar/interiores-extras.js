// Conferências do validar-interiores que só avisam (⚠), à parte para o validador caber no tamanho:
//   chavesDoSprite: chave de sprite que o desenho não conhece (seria ignorada calada) ou valor fora da lista
//     (Reino.NPCs.OPCOES_SPRITE, js/personagens/npcs.js; tabela em docs/contratos/npcs-e-dialogo.md §5)
//   reservas: Reino.reservarPersonagem completo e preenchido por um registrarPersonagem (docs/contratos/plano-paralelo.md §2);
//     sem registro é erro, ou aviso com REINO_RESERVAS_ABERTAS=1 (só nas frentes; a integração roda sem)
//   altosCobrindo: móvel alto (topo > 8 px) com o tile de cima ocupado por outro móvel ou peça de parede
//     (o desenho passaria por cima do vizinho; TODO-VISUAL D2A-02); `junto: true` no objeto marca o par de propósito
//   emojiDoMenu: `menu.emoji` de Reino.registrarLugar sem desenho em window.ICONES (vira emoji borrado)
const COR = /^#[0-9a-fA-F]{6}$/;

function chavesDoSprite(Reino, sprite, onde) {
  const N = Reino.NPCs, OP = N && N.OPCOES_SPRITE;
  if (!OP || !sprite || typeof sprite !== 'object') return [];
  const avisos = [];
  Object.keys(sprite).forEach((k) => {
    const regra = OP[k], v = sprite[k];
    if (!regra) { avisos.push(`${onde}: chave de sprite "${k}" desconhecida (o desenho ignora; chaves: npcs-e-dialogo.md §5)`); return; }
    if (Array.isArray(regra)) { if (!regra.includes(v)) avisos.push(`${onde}: sprite.${k} = "${v}" não existe (${regra.join(', ')})`); }
    else if (regra === 'cor' && !COR.test(v)) avisos.push(`${onde}: sprite.${k} precisa ser uma cor '#rrggbb' (veio ${JSON.stringify(v)})`);
    else if (regra === 'sim' && typeof v !== 'boolean' && !COR.test(v)) avisos.push(`${onde}: sprite.${k} precisa ser true/false ou cor (veio ${JSON.stringify(v)})`);
  });
  return avisos;
}

function emojiDoMenu(ctx, lugar) {
  const e = lugar && lugar.menu && lugar.menu.emoji;
  if (!e || !ctx.ICONES) return [];
  const k = String(e).replace(/️/g, '');
  return ctx.ICONES[k] ? [] : [`lugar ${lugar.id}: o emoji do menu ${e} não tem desenho (Reino.registrarIcones na pasta do prédio; jogo/js/CLAUDE.md, Arte)`];
}

const GENEROS = ['f', 'm'], IDADES = ['crianca', 'jovem', 'adulto', 'idoso'];
function reservas(Reino, doSo, abertas = process.env.REINO_RESERVAS_ABERTAS === '1') {
  const erros = [], avisos = [];
  Object.keys(Reino.reservas || {}).forEach((id) => {
    const r = Reino.reservas[id], on = `reserva ${id}`;
    if (r.predio && !doSo(r.predio)) return;
    if (!r.nome) erros.push(`${on}: sem nome`);
    if (!GENEROS.includes(r.genero)) erros.push(`${on}: genero "${r.genero}" (${GENEROS.join(' ou ')})`);
    if (!IDADES.includes(r.idade)) erros.push(`${on}: idade "${r.idade}" (${IDADES.join(', ')})`);
    if (!r.perfil || !r.perfil.voz) erros.push(`${on}: sem perfil de voz (a voz é parte do contrato)`);
    if (!r.predio || !Number.isInteger(r.x) || !Number.isInteger(r.y)) erros.push(`${on}: a vaga precisa de predio, x e y (tile inteiro)`);
    if (!r.preenchida) (abertas ? avisos : erros).push(`${on}: ainda sem registrarPersonagem (${r.nome} aparece como vaga tracejada)` +
      (abertas ? '' : '; nas frentes, REINO_RESERVAS_ABERTAS=1 deixa isto como aviso'));
  });
  return { erros, avisos };
}

function altosCobrindo(I, d, g, onde, detalhes) {
  const dono = new Map(), avisos = [];
  const marca = (x, y, i) => { const k = x + ',' + y; if (!dono.has(k)) dono.set(k, []); dono.get(k).push(i); };
  (d.objetos || []).forEach((o, i) => {
    if (!I.OBJETOS[o.tipo]) return;
    const dm = I.dimensoes(o), parede = I.ehParede(o);
    if (!parede && I.solidoDe(o) === false && !dm.topo) return;   // tapete e afins (chatos): ficam por baixo
    for (let x = o.x; x < o.x + dm.w; x++) {
      for (let y = o.y; y < o.y + dm.h; y++) marca(x, y, i);
      if (parede) for (let y = o.y + dm.h; g.dentro(x, y) && g.parede[y][x]; y++) marca(x, y, i);   // desce até o fim da parede
    }
  });
  (d.objetos || []).forEach((o, i) => {
    if (!I.OBJETOS[o.tipo] || I.ehParede(o) || o.junto) return;   // junto: par de propósito (cadeira na frente do espelho)
    const dm = I.dimensoes(o), vistos = new Set();
    for (let k = 1; dm.topo > 16 * (k - 1) + 8; k++) {
      for (let x = o.x; x < o.x + dm.w; x++) (dono.get(x + ',' + (o.y - k)) || []).forEach((j) => {
        if (j === i || vistos.has(j)) return;
        vistos.add(j);
        const v = d.objetos[j];
        avisos.push(`${onde}: ${o.tipo} (${o.x},${o.y}) alto passa por cima de ${v.tipo} (${v.x},${v.y}): afaste um tile ou troque por objeto baixo`);
      });
    }
  });
  if (detalhes || !avisos.length) return avisos;
  return [`${onde}: ${avisos.length} móveis altos cobrindo o vizinho ou a parede (lista: --detalhes)`];
}

module.exports = { chavesDoSprite, emojiDoMenu, reservas, altosCobrindo };
