// Carrega arquivos do jogo num vm do Node, pela lista e pela ordem de js/manifesto.js.
// Usado por vozes/listar-falas.js, validar/*.js e testes/testar-*.js (nenhuma ferramenta
// guarda lista própria de scripts). Só entram arquivos marcados `node: true` no manifesto.
//
//   const Jogo = require('../jogo-no-node');
//   const ctx = Jogo.contexto({ console, Math, Date });           // window = o próprio contexto
//   Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config'], grupos: ['materias'] }));
//
// Nome de um script = caminho sob js/ sem .js (ex.: 'sistemas/progresso'). Filtro de scripts():
//   grupos  grupos do manifesto que entram inteiros (ex.: 'materias', 'provas', 'interiores')
//   nomes   scripts avulsos por nome
//   (sem grupos nem nomes: todos os `node: true`)
// A ordem é sempre a do manifesto (a do navegador), exceto com ordemDosPredios() (ver abaixo).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
const manifesto = require(path.join(raiz, 'js/manifesto.js'));

function nome(s) { return s.js.replace(/^js\//, '').replace(/\.js$/, ''); }
function caminho(rel) { return path.join(raiz, rel); }

function scripts(filtro = {}) {
  const nomes = filtro.nomes || [];
  const grupos = filtro.grupos || [];
  const todos = !nomes.length && !grupos.length;
  const lista = manifesto.scripts.filter((s) => s.node && (todos || grupos.includes(s.grupo) || nomes.includes(nome(s))));
  // nome errado (arquivo que mudou de lugar) falha alto, em vez de carregar menos arquivos
  nomes.forEach((n) => { if (!lista.some((s) => nome(s) === n)) throw new Error('jogo-no-node: "' + n + '" não está no manifesto com node: true'); });
  grupos.forEach((g) => { if (!lista.some((s) => s.grupo === g)) throw new Error('jogo-no-node: grupo "' + g + '" vazio no manifesto'); });
  return lista;
}

// caminho absoluto de um script do manifesto pelo nome (para ferramentas que leem o texto)
function arquivo(n) {
  const s = manifesto.scripts.find((x) => nome(x) === n);
  if (!s) throw new Error('jogo-no-node: "' + n + '" não está no manifesto');
  return caminho(s.js);
}

// ordem histórica das ferramentas de voz e do validador de interiores: os prédios em ordem
// alfabética da pasta (padrao.js por último) e, dentro de cada prédio, a ordem do manifesto.
// Define a ordem de Reino.interiores e, com ela, a do ferramentas/gerado/falas.json.
// Os outros scripts ficam na ordem do manifesto, antes dos prédios.
function ordemDosPredios(lista) {
  const predio = (s) => (s.grupo === 'interiores' ? (s.js.split('/')[2].replace(/\.js$/, '') === 'padrao' ? '￿' : s.js.split('/')[2]) : '');
  return lista.map((s, i) => ({ s, i })).sort((a, b) => {
    const pa = predio(a.s), pb = predio(b.s);
    return pa < pb ? -1 : pa > pb ? 1 : a.i - b.i;
  }).map((x) => x.s);
}

function contexto(extras = {}) {
  const ctx = Object.assign({}, extras);
  ctx.window = ctx;
  vm.createContext(ctx);
  return ctx;
}

// opcoes.trocar: { nome: caminho } carrega outro arquivo no lugar daquele script (ex.: uma
// versão antiga tirada com git show, ou uma matéria montada à parte), na mesma posição
function carregar(ctx, lista, opcoes = {}) {
  const trocar = opcoes.trocar || {};
  lista.forEach((s) => {
    const outro = trocar[nome(s)];
    const arq = outro || caminho(s.js);
    vm.runInContext(fs.readFileSync(arq, 'utf8'), ctx, { filename: outro || s.js });
  });
  return ctx;
}

module.exports = { raiz, manifesto, nome, caminho, arquivo, scripts, ordemDosPredios, contexto, carregar };
