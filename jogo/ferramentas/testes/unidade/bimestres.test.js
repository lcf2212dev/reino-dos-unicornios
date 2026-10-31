// Somente VM e saves sintéticos. Nenhum acesso a navegador, rede ou progresso real.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { montar, Jogo } = require('./ajudantes/jogo-save');
function jogo() {
  const j = montar();
  vm.runInContext(fs.readFileSync(path.join(Jogo.raiz, 'js/sistemas/bimestres.js'), 'utf8'), j.ctx);
  j.P.carregar();
  return j;
}

test('seis matérias e provas arquivadas não trazem perguntas ou livros ativos', () => {
  const { R } = jogo();
  // as do 3º bimestre (catálogo arquivado); as do 4º bimestre (bimestre: 4, quarto-bimestre.md) ficam ativas à parte
  const arquivadas = R.materias.filter((m) => m.bimestre !== 4);
  assert.equal(arquivadas.length, 6);
  assert.ok(R.materias.filter((m) => m.bimestre === 4).every((m) => !m.arquivada && !R.Bimestres.emEspera(m.id)));
  assert.equal(R.provas.length, 6);
  for (const m of arquivadas) {
    assert.equal(m.arquivada, true);
    assert.equal(R.Bimestres.emEspera(m.id), true);
    assert.equal(m.livro.length, 0);
    assert.ok(m.salas.length > 0, 'metadados sustentam dinheiro e interiores');
    assert.ok(m.unicornios.length > 0);
    for (const s of m.salas) assert.equal(s.desafios.length, 0);
  }
  for (const p of R.provas) {
    assert.equal(p.arquivada, true);
    assert.equal(p.questoes.length, 0);
    assert.equal(Object.keys(p.acessorios).length, 3);
  }
});

test('arquivo original preserva desafios, livros e questões fora do jogo publicado', () => {
  const raiz = path.resolve(Jogo.raiz, '..');
  const lista = require('../../../../arquivo/terceiro-bimestre/manifesto-conteudo.json');
  const historico = Jogo.contexto({ console });
  Jogo.carregar(historico, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros'] }));
  for (const s of lista) {
    const arq = path.join(raiz, 'arquivo/terceiro-bimestre/jogo', s.js);
    // O registro compartilhado não é conteúdo de um bimestre.
    const fonte = fs.existsSync(arq) ? arq : path.join(Jogo.raiz, s.js);
    vm.runInContext(fs.readFileSync(fonte, 'utf8'), historico);
  }
  for (const m of historico.Reino.materias) {
    assert.ok(m.livro.length);
    for (const s of m.salas) assert.ok(s.desafios.length >= 12);
  }
  for (const p of historico.Reino.provas) assert.ok(p.questoes.length);
});

test('guardas cobrem guias, salas, treino, provas e livros sem bloquear serviços', () => {
  const { R } = jogo();
  const B = R.Bimestres;
  for (const m of R.materias.filter((x) => x.arquivada)) {
    for (const tipo of ['sala', 'treino']) assert.equal(B.acaoEmEspera({ tipo, materia: m.id }), true);
    assert.equal(B.acaoEmEspera({ tipo: 'guia', lugar: 'materia:' + m.id }), true);
    assert.equal(B.acaoEmEspera({ tipo: 'tela', tela: 'livro', materia: m.id }), true);
  }
  for (const p of R.provas) assert.equal(B.acaoEmEspera({ tipo: 'prova', prova: p.id }), true);
  // a Escola espera a Revisão do bimestre (prova ativa); o Castelo abre com a matéria ativa do 4º bimestre
  assert.equal(B.acaoEmEspera({ tipo: 'guia', lugar: 'escola' }), !R.provas.some((p) => !p.arquivada));
  assert.equal(B.acaoEmEspera({ tipo: 'guia', lugar: 'castelo' }), !R.materias.some((m) => !m.arquivada));
  for (const tela of ['loja', 'estabulo', 'petshop']) assert.equal(B.acaoEmEspera({ tipo: 'tela', tela }), false);
});

test('espera conserva dinheiro derivado, recompensas e save; surpresa fica vazia', () => {
  const { R, P, ctx } = jogo();
  const m = R.materias.find((x) => x.arquivada), e = P.estado();
  m.salas.forEach(s => { e.salas[s.id] = { feita: 123, vezes: 1, melhor: 5 }; });
  e.unis[m.unicornios[0].id] = { em: 123, xp: 50, chocado: true };
  e.loja[R.provas[0].acessorios.lendario.id] = true;
  e.pago[m.id] = 7;
  const antes = JSON.stringify(e);
  assert.equal(P.dinheiroMateria(m), R.config.valorPorMateria);
  assert.equal(P.pago(m.id), Math.round(7 * 2.5), 'o save guarda reais; P.pago fala em moedas');
  assert.ok(P.defUni(m.unicornios[0].id));
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['sistemas/surpresa'] }));
  assert.equal(R.Surpresa.proximaPergunta(), null);
  assert.equal(JSON.stringify(P.estado()), antes);
});

test('entradas diretas não iniciam atividade nem concedem recompensas', async () => {
  const { R, P, ctx } = jogo();
  for (const nome of ['missao', 'treino', 'provas']) {
    vm.runInContext(fs.readFileSync(path.join(Jogo.raiz, 'js/atividades/' + nome + '.js'), 'utf8'), ctx);
  }
  const antes = JSON.stringify(P.estado());
  let fins = 0;
  const fim = premio => { assert.equal(premio, null); fins++; };
  for (const m of R.materias.filter((x) => x.arquivada)) {
    await R.Missao.iniciar(m, m.salas[0], fim);
    await R.Prova.iniciar(m, fim);
  }
  for (const p of R.provas) await R.Provas.iniciar(p, fim);
  assert.equal(fins, 18);
  assert.equal(JSON.stringify(P.estado()), antes);
  assert.equal(R.Provas.acessorios().length, 18, 'acessórios históricos continuam utilizáveis');
});

test('objetos adicionados depois das falas-base também aguardam o quarto bimestre', () => {
  const ctx = Jogo.contexto({ console });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  const R = ctx.Reino;
  for (const m of R.materias.filter((x) => x.arquivada)) {
    assert.deepEqual(Array.from(R.FALAS_INTERIORES.escola.objetos['lousa-' + m.id]), [R.Bimestres.aviso]);
  }
  assert.deepEqual(Array.from(R.FALAS_INTERIORES.castelo.objetos['ciencias-microscopio']), [R.Bimestres.aviso]);
});
