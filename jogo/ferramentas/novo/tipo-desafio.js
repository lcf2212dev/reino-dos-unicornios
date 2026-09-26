// Tipo `desafio` do `npm run novo`: um tipo de desafio novo (Reino.registrarTipoDesafio, docs/contratos/conteudo.md
// §3.7) em jogo/js/atividades/desafios/<tipo>.js, com os ganchos mais usados e o teste de unidade dele.
const fs = require('fs');
const path = require('path');
const Manifesto = require('./manifesto-editar');

const novo = () => require('./novo');   // na hora: novo.js também carrega este arquivo

module.exports = {
  ajuda: 'desafio <tipo> [--treinavel] [--especial]   (tipo em camelCase, ex.: contaArmada)',
  cria: 'jogo/js/atividades/desafios/<tipo>.js (registrarTipoDesafio: montar, pontuar, textos, falas, validar) e unidade/desafio-<tipo>.test.js',
  // o nome do tipo é camelCase (como vfLista), não [a-z0-9-]
  idOk: /^[a-z][a-zA-Z0-9]*$/,
  conferir(id, op, ex, raiz) {
    if (fs.existsSync(path.join(raiz, `jogo/js/atividades/desafios/${id}.js`))) throw new Error(`desafio: já existe jogo/js/atividades/desafios/${id}.js`);
    const Jogo = require(path.join(raiz, 'jogo/ferramentas/jogo-no-node.js'));
    const R = Jogo.carregar(Jogo.contexto({ console, Math, Date, JSON }), Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos', 'sistemas/falas'], grupos: ['atividades'] })).Reino;
    if (R.tiposDesafio[id]) throw new Error(`desafio: o tipo "${id}" já existe`);
  },
  arquivos(id, op) {
    const flags = (op.treinavel ? '\n    treinavel: true,   // entra no treino do Castelo' : '') + (op.especial ? '\n    especial: true,    // no sorteio da missão: até 2 tipos especiais por missão' : '');
    const { modelo } = novo();
    return [[`jogo/js/atividades/desafios/${id}.js`, modelo('desafio.js.modelo', { tipo: id, flags })],
      [`jogo/ferramentas/testes/unidade/desafio-${id}.test.js`, modelo('desafio.test.js.modelo', { tipo: id })]];
  },
  manifesto(id, op, ex, raiz) {
    return { jss: [`js/atividades/desafios/${id}.js`], onde: { depoisDe: Manifesto.ultimoDoGrupo(raiz, 'atividades', (s) => s.js.startsWith('js/atividades/desafios/')), grupo: 'atividades' } };
  },
  checklist(id, op) {
    return [
      `formato: o cabeçalho de jogo/js/atividades/desafios/${id}.js (troque os (preencher))`,
      'tela: o montar (hoje botões como o escolha); estilo, se precisar, em jogo/css/ui-desafios.css (sem arquivo CSS novo)',
      'pontuação (pontuar, 0 a 1) e os textos da correção (textoCerto, textoResposta)',
      'falas: o que a voz lê depois da pergunta (falas); vozes: npm run vozes',
      `validador: o validar confere os campos do formato; testes em unidade/desafio-${id}.test.js`,
      `usar numa sala: { id: 'h1-99', tipo: '${id}', livro: '<carta>', pergunta: '…', opcoes: [{ t: '…' }, { t: '…' }], certa: 0, explica: '…' }`,
      'ver: npm run ver -- --tela sala:<id da sala> --nome ' + id,
      'e2e: nenhuma diferença até alguma sala usar o tipo',
    ];
  },
  validadores: ['node jogo/ferramentas/validar/validar-conteudo.js', 'npm run unidade', 'npm run tipos', 'npm test', 'npm run e2e'],
  ver() { return 'npm run ver -- --tela sala:<id da sala que usa o tipo>'; },
};
