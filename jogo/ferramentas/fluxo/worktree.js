// Worktree nova para uma frente, pronta para trabalhar (npm run worktree -- <tema> …):
//   node jogo/ferramentas/fluxo/worktree.js <tema> [--material <Pasta>]… [--base <ref>] [--ci]
// 1. git worktree add <ao lado da árvore principal>/reino-<tema> -b feat/<tema> <base = main>
//    (recusa se a pasta ou a branch já existem)
// 2. node_modules = link para um já instalado (o da árvore principal, senão o de outra worktree registrada);
//    com --ci, `npm ci` na pasta nova
// 3. --material <Pasta>: copia da árvore principal os arquivos NÃO rastreados de <Pasta>/ (os prints de uma
//    matéria ou prova nova), com a data original; pasta já rastreada vem pela própria branch
// Só LÊ a árvore principal. Imprime o caminho e os próximos comandos.
const fs = require('fs');
const path = require('path');
const C = require('./comum');

const AJUDA = `Uso: node jogo/ferramentas/fluxo/worktree.js <tema> [--material <Pasta>]… [--base <ref>] [--ci]
  <tema>      letras minúsculas, números e hífen (vira reino-<tema> e feat/<tema>)
  --material  pasta de material na raiz da árvore principal (repita para mais de uma)
  --base      de onde a branch nasce (padrão: main)
  --ci        npm ci na worktree nova em vez do link para um node_modules já instalado`;

function criarWorktree(argv, cwd = process.cwd()) {
  const op = C.lerArgs(argv, { booleanas: ['ci', 'ajuda'], repetidas: ['material'] });
  if (op.ajuda || !op._.length) return { ajuda: AJUDA };
  const tema = op._[0];
  if (op._.length > 1) throw new Error(`argumento a mais: ${op._.slice(1).join(' ')}`);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(tema)) throw new Error(`tema inválido: "${tema}" (minúsculas, números e hífen)`);
  const r = C.raizes(cwd);
  const pasta = path.join(r.mae, `reino-${tema}`);
  const branch = `feat/${tema}`;
  const base = op.base || 'main';

  // tudo conferido ANTES de criar qualquer coisa
  if (fs.existsSync(pasta)) throw new Error(`a pasta ${pasta} já existe (escolha outro tema)`);
  if (C.gitOk(r.repo, 'show-ref', '--verify', '--quiet', `refs/heads/${branch}`)) throw new Error(`a branch ${branch} já existe (escolha outro tema)`);
  if (!C.gitOk(r.repo, 'rev-parse', '--verify', '--quiet', `${base}^{commit}`)) throw new Error(`base desconhecida: ${base}`);
  const materiais = op.material.map((m) => planoMaterial(r.principal, m));

  C.git(r.repo, 'worktree', 'add', pasta, '-b', branch, base);
  const linhas = [`✔ worktree ${pasta} (branch ${branch}, de ${base} ${C.git(pasta, 'rev-parse', '--short', 'HEAD')})`];
  linhas.push('• ' + C.prepararNodeModules(r, pasta, op.ci));
  materiais.forEach((m) => {
    if (!m.lista.length) { linhas.push(`• material ${m.pasta}/: ${m.motivo}`); return; }
    const c = C.copiarArquivos(r.principal, pasta, m.lista);
    linhas.push(`• material ${m.pasta}/: ${c.copiados.length} arquivo(s) copiado(s) da árvore principal` +
      (c.iguais.length ? `, ${c.iguais.length} já iguais` : '') + (c.diferentes.length ? `, ⚠ ${c.diferentes.length} diferentes deixados como estavam: ${c.diferentes.join(', ')}` : ''));
  });
  linhas.push('', 'Próximos comandos:', `  cd ${JSON.stringify(pasta)}`);
  materiais.filter((m) => m.lista.length).forEach((m) => linhas.push(`  node jogo/ferramentas/fluxo/material.js ${JSON.stringify(m.pasta)}   # cópias reduzidas para ler`));
  linhas.push('  npm run ver -- --ajuda', '  npm test', '  npm run e2e');
  return { pasta, branch, texto: linhas.join('\n') };
}

// quais arquivos de <Pasta> copiar: só os não rastreados (a pasta tem de existir na árvore principal)
function planoMaterial(principal, nome) {
  const rel = nome.replace(/\/+$/, '');
  if (!rel || path.isAbsolute(rel) || rel.split('/').includes('..')) throw new Error(`--material: use o nome da pasta na raiz da árvore principal (recebido: "${nome}")`);
  const abs = path.join(principal, rel);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) throw new Error(`--material: a pasta ${abs} não existe`);
  const lista = C.naoRastreados(principal, rel);
  const motivo = C.rastreados(principal, rel).length ? 'já rastreada no git (vem pela branch), nada a copiar' : 'vazia, nada a copiar';
  return { pasta: rel, lista, motivo };
}

if (require.main === module) {
  try {
    const r = criarWorktree(process.argv.slice(2));
    console.log(r.ajuda || r.texto);
  } catch (e) {
    console.error('✘ ' + e.message);
    process.exit(1);
  }
}

module.exports = { criarWorktree, planoMaterial };
