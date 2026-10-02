// Testes de unidade: um tipo de desafio de mentira (Reino.registrarTipoDesafio, js/atividades/desafios.js) vale
// no jogo todo só com o registro: pontuação (D.pontuar), textos da correção, falas (segmentosDesafio e pista),
// sorteio/treino e o validador (aceito com os campos do tipo, recusado sem). Nada no núcleo sabe do tipo.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/desafio-tipo.test.js   (tudo: npm test, na raiz)
// O validador roda numa sala copiada para /tmp/reino-testes/<worktree>/ (o jogo de verdade não muda).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const Jogo = require('./ajudantes/terceiro-bimestre');

// o tipo de mentira: "conta" (a resposta é o número certo); registrado igual a um desafios/<tipo>.js
const REGISTRO = `Reino.registrarTipoDesafio('contaTeste', {
  montar: function () { return { el: null }; },
  pontuar: function (d, valor) { return valor === d.resultado ? 1 : 0; },
  treinavel: true, pista: 'pistaEspecial', campos: ['livre'],
  falas: function (d, todos, segs) { return segs.concat(['Quanto é ' + d.conta + '?']); },
  textoCerto: function (d) { return String(d.resultado); },
  textoResposta: function (d, valor) { return 'respondeu ' + valor; },
  validar: function (d, v) { v.checar(typeof d.conta === 'string' && Number.isInteger(d.resultado), d.id + ': conta sem conta ou resultado'); },
});
`;

function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date, JSON });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos', 'sistemas/falas'], grupos: ['atividades'] }));
  require('vm').runInContext(REGISTRO, ctx);
  return ctx.Reino;
}
const R = carregar();
const D = R.Desafios;
const d = { id: 'c1', tipo: 'contaTeste', livro: 'x', pergunta: 'Faça a conta.', instrucao: 'Toque no número.', conta: '2 + 3', resultado: 5 };

test('registro: o tipo entra em Reino.tiposDesafio, no treino e recusa nome repetido', () => {
  assert.ok(R.tiposDesafio.contaTeste);
  assert.ok(D.TREINAVEIS.includes('contaTeste'));
  assert.throws(() => R.registrarTipoDesafio('contaTeste', { montar() {} }), /repetido/);
  assert.throws(() => R.registrarTipoDesafio('semMontar', {}), /montar/);
});

test('pontuação e textos da correção vêm do tipo', () => {
  assert.deepStrictEqual([5, 4, null].map((v) => D.pontuar(d, v)), [1, 0, 0]);
  assert.strictEqual(D.conferirValor(d, 5), true);
  assert.strictEqual(D.respostaCertaTexto(d), '5');
  assert.strictEqual(D.linhaCerta(d), '✓ Certo: 5');
  assert.strictEqual(D.respostaTexto(d, 4), 'respondeu 4');
  assert.strictEqual(D.respostaTexto(d, null), '(sem resposta)');
  assert.strictEqual(D.enunciado(d), 'Faça a conta.');
});

test('falas: o 🔊 lê só a pergunta; tipo sem pergunta fornece seu enunciado', () => {
  assert.deepStrictEqual([...R.Falas.segmentosDesafio(d)], ['Faça a conta.']);
  assert.deepStrictEqual([...R.Falas.segmentosDesafio({ ...d, pergunta: undefined })], ['Quanto é 2 + 3?']);
  assert.strictEqual(R.Falas.pista(d, { livro: [] }), R.Falas.fixas.pistaEspecial);
  // tipo sem ganchos de fala: só a pergunta
  assert.deepStrictEqual([...R.Falas.segmentosDesafio({ id: 'z', tipo: 'naoExiste', pergunta: 'Oi?' })], ['Oi?']);
});

test('voz: questões reais de salas e provas não narram respostas, mesmo com ordem embaralhada', () => {
  const ctx = Jogo.contexto({ console });
  const reino = Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts())).Reino;
  const questoes = reino.materias.flatMap((m) => m.salas.flatMap((s) => s.desafios))
    .concat(reino.provas.flatMap((p) => p.questoes));
  const tipos = new Set();
  for (const q of questoes) {
    tipos.add(q.tipo);
    const esperado = q.tipo === 'vf' ? [reino.Falas.fixas.verdadeiroOuFalso, q.afirmacao] : [q.pergunta];
    assert.ok(esperado.every((s) => typeof s === 'string' && s.length), q.id);
    const ordem = q.opcoes ? q.opcoes.map((_, i) => i).reverse() : undefined;
    assert.deepStrictEqual([...reino.Falas.segmentosDesafio(q, ordem)], esperado, q.id);
  }
  for (const tipo of ['escolha', 'varias', 'vf', 'vfLista', 'ligar', 'completar', 'ordenar']) {
    assert.ok(tipos.has(tipo), 'cobertura: ' + tipo);
  }
});

// validador: sala 1 de História copiada, com o registro no topo e o 1º desafio trocado pelo tipo de mentira
const jogo = Jogo.raiz;
const tmp = path.join('/tmp/reino-testes', path.basename(path.dirname(jogo)) + '-' + crypto.createHash('md5').update(jogo).digest('hex').slice(0, 8), 'desafio-tipo', 'historia');
function validarCom(campos) {
  fs.mkdirSync(tmp, { recursive: true });
  const sala = path.join(tmp, 'h1.js');
  const t = fs.readFileSync(Jogo.arquivo('conteudo/materias/historia/h1'), 'utf8');
  assert.ok(t.includes("tipo: 'varias'"), 'âncora sumiu de h1.js (atualize o teste)');
  fs.writeFileSync(sala, REGISTRO + t.replace("tipo: 'varias'", "tipo: 'contaTeste'" + campos));
  const r = spawnSync(process.execPath, ['ferramentas/validar/validar-conteudo.js', '--terceiro-bimestre', '--materia', sala], { cwd: jogo, encoding: 'utf8' });
  return { status: r.status, saida: (r.stdout || '') + (r.stderr || '') };
}

test('validador: aceita o tipo novo com os campos dele e recusa sem', () => {
  const ok = validarCom(", conta: '2 + 3', resultado: 5");
  assert.strictEqual(ok.status, 0, ok.saida);
  const sem = validarCom('');
  assert.strictEqual(sem.status, 1, sem.saida);
  assert.match(sem.saida, /h1-01: conta sem conta ou resultado/);
  assert.doesNotMatch(sem.saida, /tipo desconhecido/);
  // campo de outro tipo (rotulos é do vfLista) é recusado
  const outro = validarCom(", conta: '2 + 3', resultado: 5, rotulos: ['T', 'F']");
  assert.match(outro.saida, /h1-01: "rotulos" só vale em vfLista/);
});
