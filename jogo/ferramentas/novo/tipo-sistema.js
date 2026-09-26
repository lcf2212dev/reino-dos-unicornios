// Tipo `sistema` do `npm run novo`: mecânica nova registrada como módulo (Reino.registrarModulo), com campo no
// save opcional (Reino.Progresso.registrarCampo), camada de desenho e parte de desenho sem node: true.
// Contratos: docs/contratos/cena-e-motor.md §14 e save-e-mescla.md §11. Mesmo formato dos tipos de novo.js.
const fs = require('fs');
const path = require('path');
const Manifesto = require('./manifesto-editar');

const ESTRATEGIAS = { contadores: '{}', carimbo: '{}', uniao: '[]', maior: '0' };
const novo = () => require('./novo');   // na hora: novo.js também carrega este arquivo
const camel = (id) => id.replace(/-([a-z0-9])/g, (m, c) => c.toUpperCase());
const Maiusc = (id) => { const c = camel(id); return c[0].toUpperCase() + c.slice(1); };

// o que já existe na cópia: arquivos e módulos/campos registrados (pelo texto dos sistemas)
function registrados(raiz, re) {
  const pasta = path.join(raiz, 'jogo/js/sistemas');
  const achados = new Set();
  fs.readdirSync(pasta).filter((f) => f.endsWith('.js')).forEach((f) => {
    for (const m of fs.readFileSync(path.join(pasta, f), 'utf8').matchAll(re)) achados.add(m[1]);
  });
  return achados;
}

function marcas(id, op) {
  const c = op.campo;
  const campo = !c ? '' : `
  /* ================= NO SAVE ================= */
  // o campo \`${c}\` (docs/contratos/save-e-mescla.md §11): padrão, limpeza, mescla, Novo ciclo e cópia saem daqui.
  // No carregamento (antes do P.carregar); os testes de contrato (save-campos.test.js) o pegam sozinhos.
  R.Progresso.registrarCampo('${c}', {
    padrao: function () { return ${ESTRATEGIAS[op.estrategia]}; },
    mesclar: '${op.estrategia}',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
  });
  function ${c}() { try { return R.Progresso.estado().${c}; } catch (e) { return null; } }
`;
  const camada = !op.camada ? '' : `
    // desenho por cima do mapa/interior (js/motor/laco.js): ativo() barato; itens ordenados por y com a Mariana
    camada: {
      ativo: function () { return false; },
      itensDesenho: function () { return []; },
    },`;
  return { id, nome: novo().aspas(op.nome || id), nomeJs: camel(id), Nome: Maiusc(id), campo, camada,
    depurarCampo: c ? `, ${c}: ${c}()` : '' };
}

module.exports = {
  ajuda: 'sistema <id> [--nome "Jardim"] [--campo <nomeCampo> --estrategia contadores|carimbo|uniao|maior] [--camada] [--desenho]',
  cria: 'jogo/js/sistemas/<id>.js (Reino.registrarModulo; com --campo, Reino.Progresso.registrarCampo), <id>-desenho.js com --desenho e o teste unidade/<id>.test.js',
  conferir(id, op, ex, raiz) {
    if (fs.existsSync(path.join(raiz, `jogo/js/sistemas/${id}.js`))) throw new Error(`sistema: já existe jogo/js/sistemas/${id}.js`);
    if (registrados(raiz, /registrarModulo\(\{\s*id:\s*'([^']+)'/g).has(id)) throw new Error(`sistema: já existe um módulo "${id}"`);
    if (op.campo) {
      if (!/^[a-z][a-zA-Z0-9]*$/.test(op.campo)) throw new Error('sistema: --campo em camelCase (ex.: jardim, floresColhidas)');
      if (!ESTRATEGIAS[op.estrategia]) throw new Error(`sistema: --estrategia ${Object.keys(ESTRATEGIAS).join('|')} (docs/contratos/save-e-mescla.md §11)`);
      if (registrados(raiz, /registrarCampo\('([^']+)'/g).has(op.campo)) throw new Error(`sistema: o campo "${op.campo}" já está registrado`);
    } else if (op.estrategia) throw new Error('sistema: --estrategia só com --campo');
  },
  arquivos(id, op) {
    const m = marcas(id, op), { modelo } = novo();
    return [[`jogo/js/sistemas/${id}.js`, modelo('sistema.js.modelo', m)]]
      .concat(op.desenho ? [[`jogo/js/sistemas/${id}-desenho.js`, modelo('sistema-desenho.js.modelo', m)]] : [])
      .concat([[`jogo/ferramentas/testes/unidade/${id}.test.js`, modelo('sistema.test.js.modelo', m)]]);
  },
  // node: true depois do último sistema node (Progresso, Falas e registrarModulo já existem; a ordem dos módulos e
  // do falas.json não muda para os de hoje); o -desenho depois do último sistema sem node (perto do banho-desenho.js)
  manifesto(id, op, ex, raiz) {
    const l = [{ jss: [`js/sistemas/${id}.js`], onde: { depoisDe: Manifesto.ultimoDoGrupo(raiz, 'sistemas', (s) => s.node), grupo: 'sistemas' } }];
    if (op.desenho) l.push({ jss: [`js/sistemas/${id}-desenho.js`], onde: { depoisDe: Manifesto.ultimoDoGrupo(raiz, 'sistemas', (s) => !s.node), grupo: 'sistemas', node: false } });
    return l;
  },
  checklist(id, op) {
    return [
      `regras do sistema em jogo/js/sistemas/${id}.js (e testes delas em unidade/${id}.test.js)`,
      `falas: troque cada (preencher) em FALAS e grave: npm run vozes`,
      `depurar(): o estado que os testes e o __reino.modulo('${id}') devem mostrar`,
      ...(op.campo ? [`campo ${op.campo} no save (${op.estrategia}): confira padrão e novoCiclo; save-campos.test.js já o testa`] : []),
      ...(op.camada ? ['camada: ativo() e itensDesenho() de verdade (hoje não desenha nada)'] : []),
      ...(op.desenho ? [`desenhos em jogo/js/sistemas/${id}-desenho.js`] : []),
      'contrato do sistema em docs/contratos/ se ele for grande (e a linha na tabela do CLAUDE.md da raiz)',
      op.camada || op.desenho ? 'e2e: diferença só nas imagens onde o desenho aparece (e nas falas/vozes)'
        : 'e2e: nenhuma diferença nas imagens (só falas/vozes, quando as falas entrarem)',
    ];
  },
  validadores: ['node jogo/ferramentas/validar/validar-conteudo.js', 'npm run unidade', 'npm run tipos', 'npm test', 'npm run e2e'],
  ver(id) { return `npm run ver -- --js "console.log(JSON.stringify(__reino.modulo('${id}')))" --tamanhos celular --nome ${id}`; },
};
