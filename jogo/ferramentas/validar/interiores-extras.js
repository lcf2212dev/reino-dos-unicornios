// Conferências do validar-interiores que só avisam (⚠), à parte para o validador caber no tamanho:
//   chavesDoSprite: chave de sprite que o desenho não conhece (seria ignorada calada) ou valor fora da lista
//     (Reino.NPCs.OPCOES_SPRITE, js/personagens/npcs.js; tabela em docs/contratos/npcs-e-dialogo.md §5)
//   reservas: Reino.reservarPersonagem completo e preenchido por um registrarPersonagem (docs/contratos/plano-paralelo.md §2);
//     sem registro é erro, ou aviso com REINO_RESERVAS_ABERTAS=1 (só nas frentes; a integração roda sem)
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

module.exports = { chavesDoSprite, emojiDoMenu, reservas };
