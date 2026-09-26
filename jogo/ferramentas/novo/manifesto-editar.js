// Põe linhas no jogo/js/manifesto.js no ponto certo, mexendo só no texto (comentários e formato ficam iguais),
// e refaz o index.html com o gerar-index da mesma cópia. Usado por novo.js.
//   const M = require('./manifesto-editar');
//   const r = M.inserir(raiz, ['js/interiores/x/falas.js'], { antesDe: 'js/interiores/padrao.js', grupo: 'interiores' });
//   M.gravar(raiz, r.texto); M.gerarIndex(raiz);
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const arquivo = (raiz) => path.join(raiz, 'jogo/js/manifesto.js');
const linhaDe = (js, grupo, node = true) => `{ js: '${js}', grupo: '${grupo}'${node ? ', node: true' : ''} },`;

// a lista de scripts do texto (sem require: o cache do Node guardaria a versão antiga)
function scripts(texto) {
  const ctx = { module: { exports: {} } };
  vm.runInNewContext(texto, ctx, { filename: 'manifesto.js' });
  return ctx.module.exports.scripts;
}

// índice da linha (no texto quebrado em linhas) do script `js`
function achar(linhas, js) {
  const i = linhas.findIndex((l) => l.includes(`js: '${js}'`));
  if (i < 0) throw new Error(`manifesto: não achei a linha de ${js}`);
  return i;
}

/** onde: { antesDe: js } (antes dele e dos comentários colados em cima) ou { depoisDe: js }.
    Devolve { texto, postas: [linhas novas] }; não grava. `texto`: o manifesto já editado (várias inserções). */
function inserir(raiz, jss, onde, texto = fs.readFileSync(arquivo(raiz), 'utf8')) {
  const lista = scripts(texto);
  jss.forEach((js) => { if (lista.some((s) => s.js === js)) throw new Error(`manifesto: ${js} já está lá`); });
  const linhas = texto.split('\n');
  let i;
  if (onde.antesDe) {
    i = achar(linhas, onde.antesDe);
    while (i > 0 && /^\s*\/\//.test(linhas[i - 1])) i--;   // o comentário explica a linha de baixo: fica com ela
  } else i = achar(linhas, onde.depoisDe) + 1;
  const recuo = linhas[achar(linhas, onde.antesDe || onde.depoisDe)].match(/^\s*/)[0];
  const postas = jss.map((js) => linhaDe(js, onde.grupo, onde.node !== false));
  linhas.splice(i, 0, ...postas.map((l) => recuo + l));
  const novo = linhas.join('\n');
  // confere: o texto novo ainda carrega e tem os scripts na ordem pedida
  const depois = scripts(novo).map((s) => s.js);
  const pos = jss.map((js) => depois.indexOf(js));
  if (pos.some((p, k) => p < 0 || (k && p !== pos[k - 1] + 1))) throw new Error('manifesto: inserção saiu fora de ordem');
  return { texto: novo, postas };
}

// último script de um grupo (ex.: a última matéria) e o livro.js de uma matéria
function ultimoDoGrupo(raiz, grupo, filtro = () => true) {
  const l = scripts(fs.readFileSync(arquivo(raiz), 'utf8')).filter((s) => s.grupo === grupo && filtro(s));
  if (!l.length) throw new Error(`manifesto: grupo ${grupo} vazio`);
  return l[l.length - 1].js;
}

function gravar(raiz, texto) { fs.writeFileSync(arquivo(raiz), texto); }

// refaz o index.html (npm run index) com o gerador da própria cópia
function gerarIndex(raiz) {
  const r = spawnSync(process.execPath, [path.join(raiz, 'jogo/ferramentas/gerar-index.js')], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error('gerar-index falhou:\n' + r.stdout + r.stderr);
  return r.stdout.trim();
}

module.exports = { arquivo, linhaDe, scripts, inserir, ultimoDoGrupo, gravar, gerarIndex };
