// Tipo `arquivo` do `npm run novo`: um .js a mais numa feature (ex.: interiores/sorveteria/icones.js), com cabeçalho
// mínimo no estilo do projeto e a linha no manifesto junto dos irmãos da pasta (grupo e node: true como eles).
// Posição: --antes-de / --depois-de <arquivo> (nome na mesma pasta ou caminho sob jogo/js); sem elas, em
// interiores/<p>/ antes do <p>.js (dados e registros, que o layout lê) e nas outras pastas depois do último irmão.
const fs = require('fs');
const path = require('path');
const Manifesto = require('./manifesto-editar');

const semJs = (c) => String(c || '').replace(/^(jogo\/)?(js\/)?/, '');

// onde entra: { onde: { antesDe | depoisDe, grupo, node }, ref }
function posicao(raiz, js, op) {
  const lista = Manifesto.scripts(fs.readFileSync(Manifesto.arquivo(raiz), 'utf8'));
  const pasta = path.posix.dirname(js);
  const irmaos = lista.filter((s) => path.posix.dirname(s.js) === pasta);
  const resolver = (x) => {
    const alvo = x.includes('/') ? 'js/' + semJs(x) : `${pasta}/${x}`;
    const s = lista.find((l) => l.js === alvo || l.js === alvo + '.js');
    if (!s) throw new Error(`arquivo: ${x} não está no manifesto (${alvo})`);
    return s;
  };
  let ref, antes;
  if (op.antesDe) { ref = resolver(op.antesDe); antes = true; }
  else if (op.depoisDe) { ref = resolver(op.depoisDe); antes = false; }
  else if (!irmaos.length) throw new Error(`arquivo: ${pasta}/ ainda não tem nada no manifesto; diga onde com --depois-de <caminho sob jogo/js>`);
  else {
    const p = /^js\/interiores\/([^/]+)$/.exec(pasta);
    const layout = p && irmaos.find((s) => s.js === `${pasta}/${p[1]}.js`);
    // pasta mista (ex.: sistemas/): node: true, depois do último irmão node (as ferramentas do Node o veem)
    const comNode = irmaos.filter((s) => s.node);
    if (layout) { ref = layout; antes = true; } else { ref = (comNode.length ? comNode : irmaos).slice(-1)[0]; antes = false; }
  }
  // com --antes-de/--depois-de vale o node do vizinho; sem elas, node se algum irmão usa
  const node = op.antesDe || op.depoisDe ? !!ref.node : irmaos.some((s) => s.node);
  return { onde: Object.assign(antes ? { antesDe: ref.js } : { depoisDe: ref.js }, { grupo: ref.grupo, node }), node };
}

module.exports = {
  ajuda: 'arquivo <caminho sob jogo/js> [--antes-de <arquivo> | --depois-de <arquivo>]   (ex.: interiores/sorveteria/icones.js)',
  cria: 'um .js a mais numa pasta do jogo com cabeçalho mínimo e a linha no manifesto junto dos irmãos (grupo e node: true como eles)',
  idOk: /^[a-z0-9][a-zA-Z0-9/_-]*\.js$/,
  idDe(resto) { return semJs(resto[0]); },
  conferir(id, op, ex, raiz) {
    if (id.split('/').some((p) => p === '..' || !p)) throw new Error('arquivo: caminho inválido');
    if (/^voz\//.test(id)) throw new Error('arquivo: js/voz/ é gerado (npm run vozes)');
    if (fs.existsSync(path.join(raiz, 'jogo/js', id))) throw new Error(`arquivo: já existe jogo/js/${id}`);
    if (op.antesDe && op.depoisDe) throw new Error('arquivo: --antes-de OU --depois-de');
    op.posArquivo = posicao(raiz, 'js/' + id, op);
  },
  arquivos(id, op) {
    const { onde, node } = op.posArquivo;
    const pasta = path.posix.dirname(id), nome = path.posix.basename(id, '.js');
    const quando = onde.antesDe ? `antes de ${onde.antesDe}` : `depois de ${onde.depoisDe}`;
    const regra = node ? 'node: true: só dados, funções e registros; nada de DOM, canvas nem PA no carregamento (só dentro das funções).'
      : 'Sem node: true: roda só no navegador (pode usar DOM e PA).';
    return [[`jogo/js/${id}`, `/* ${pasta}/${nome}: (preencher: o que este arquivo guarda e quem o usa).
   Carrega ${quando} (jogo/js/manifesto.js). ${regra} */
(function () {
  var R = window.Reino;
})();
`]];
  },
  manifesto(id, op) { return { jss: ['js/' + id], onde: op.posArquivo.onde }; },
  checklist(id, op) {
    return [
      `o conteúdo de jogo/js/${id} e o comentário do cabeçalho (hoje com (preencher))`,
      `a posição no manifesto (${op.posArquivo.onde.antesDe ? 'antes de ' + op.posArquivo.onde.antesDe : 'depois de ' + op.posArquivo.onde.depoisDe}): quem usa o que ele registra tem que vir depois`,
      ...(op.posArquivo.node ? ['node: true: se ele precisar de DOM ou PA no carregamento, ponha-o perto de um irmão sem node (--depois-de)'] : []),
      ...(/^interiores\//.test(id) ? ['o que as partes do prédio dividem: Reino._predios.<p>'] : []),
    ];
  },
  validadores: ['node jogo/ferramentas/gerar-index.js --conferir', 'npm run tamanho', 'npm test'],
  ver() { return 'npm run ver -- --nome arquivo-novo'; },
};
