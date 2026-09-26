// Compõe saves SINTÉTICOS para cenários: base nomeada de gerarSaves (saves.js) + atalhos + `mudar`.
// Nunca o save real da Mariana: as bases são inventadas e o arquivo aceito aqui também tem de ser sintético.
// Uso (Node): const { comporSave } = require('./saves-compor');
//   comporSave(bases, { save: 'completo', estrelas: 500, cuidados: { fome: 10 }, materiasCompletas: ['historia'],
//                       ajustes: { som: true }, mudar: { ritualVisto: false } }, dadosDoJogo)
// `bases` = o retorno de gerarSaves() (roda na página); `dadosDoJogo` = { salas: { historia: ['h1', …] } }.
const fs = require('fs');
const path = require('path');

const ehObjeto = (v) => v && typeof v === 'object' && !Array.isArray(v);
// mescla profunda: objetos se juntam, o resto (listas, números, null) substitui
function mesclar(alvo, extra) {
  Object.keys(extra || {}).forEach((k) => {
    if (ehObjeto(extra[k]) && ehObjeto(alvo[k])) mesclar(alvo[k], extra[k]);
    else alvo[k] = JSON.parse(JSON.stringify(extra[k]));
  });
  return alvo;
}

// save de arquivo (.json ou .js que exporta o objeto); caminho relativo à pasta atual
function lerArquivo(arq) {
  const p = path.resolve(arq);
  if (/servidor[\\/]dados/.test(p)) throw new Error('save de jogo/servidor/dados/ é o progresso real: recusado');
  if (p.endsWith('.json')) return JSON.parse(fs.readFileSync(p, 'utf8'));
  delete require.cache[p];
  return require(p);
}

function comporSave(bases, op = {}, dados = {}) {
  const nome = op.save || 'completo';
  let save;
  if (ehObjeto(nome)) save = JSON.parse(JSON.stringify(nome));
  else if (/\.(js|json)$/.test(nome)) save = JSON.parse(JSON.stringify(lerArquivo(nome)));
  else if (bases[nome]) save = JSON.parse(JSON.stringify(bases[nome]));
  else throw new Error(`save "${nome}" não existe (use ${Object.keys(bases).join(', ')} ou um arquivo .js/.json)`);

  // estrelas: n = saldo de n (ganhas n + gastas, para o saldo bater)
  if (op.estrelas !== undefined) save.estrelas = { ganhas: Number(op.estrelas) + ((save.estrelas || {}).gastas || 0), gastas: (save.estrelas || {}).gastas || 0 };
  if (op.cuidados) {
    const m = save.montaria || 'inicial';
    save.cuidados = save.cuidados || {};
    save.cuidados[m] = Object.assign({ fome: 100, sede: 100, banho: 100, em: 1790000000000 - 1000 }, save.cuidados[m], op.cuidados);
  }
  (op.materiasCompletas || []).forEach((id) => {
    const salas = (dados.salas || {})[id];
    if (!salas) throw new Error(`matéria "${id}" não existe`);
    salas.forEach((s, n) => { save.salas[s] = { feita: 1790000000000 - (n + 1) * 3600000, melhor: 5, perfeita: true, calma: false, vezes: 1 }; });
  });
  if (op.ajustes) save.ajustes = Object.assign({}, save.ajustes, op.ajustes);
  if (op.mudar) mesclar(save, op.mudar);
  return save;
}

module.exports = { comporSave, mesclar };
