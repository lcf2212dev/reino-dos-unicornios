// Conferências do validar-interiores que só avisam (⚠), à parte para o validador caber no tamanho:
//   chavesDoSprite: chave de sprite que o desenho não conhece (seria ignorada calada) ou valor fora da lista
//     (Reino.NPCs.OPCOES_SPRITE, js/personagens/npcs.js; tabela em docs/contratos/npcs-e-dialogo.md §5)
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
  return ctx.ICONES[k] ? [] : [`lugar ${lugar.id}: o emoji do menu ${e} não tem desenho (Reino.registrarIcones na pasta do prédio; docs/contratos/README.md §2 item 5)`];
}

module.exports = { chavesDoSprite, emojiDoMenu };
