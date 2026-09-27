// fluxo/plano.js (npm run plano): o exemplo do Salão de Beleza passa; cada regra do §6 de
// docs/contratos/plano-paralelo.md violada é acusada; ondas; estados numa pasta temporária em /tmp/reino-testes/
// (nunca o estado de um plano de verdade); rascunho a partir de um pedido no modelo.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const P = require('../../fluxo/plano');
const { rascunho } = require('../../fluxo/plano-pedido');
const C = require('../../fluxo/comum');

const EXEMPLO = path.join(__dirname, '../../fluxo/exemplos/salao-beleza.plano.json');
const copia = () => P.carregar(EXEMPLO);
const tarefa = (p, id) => p.tarefas.find((t) => t.id === id);
// confere que alguma mensagem casa com cada regex
function acusa(plano, ...regs) {
  const erros = P.conferir(plano);
  for (const r of regs) assert.ok(erros.some((e) => r.test(e)), `esperava ${r} em:\n${erros.join('\n') || '(nenhum erro)'}`);
}

test('exemplo do Salão de Beleza passa no conferir', () => {
  assert.deepStrictEqual(P.conferir(copia()), []);
});

test('ondas e caminho crítico do exemplo', () => {
  const o = P.ondas(copia()).map((l) => l.map((t) => t.id).sort());
  assert.deepStrictEqual(o, [
    ['contrato', 'icones'], ['cenario', 'fachada', 'falas-lulu', 'npc-lulu', 'telas'], ['vozes'], ['integracao'], ['entrega'],
  ]);
  const c = P.caminhoCritico(copia());
  assert.deepStrictEqual(c.caminho, ['contrato', 'telas', 'integracao', 'entrega']);
  assert.strictEqual(c.minutos, 95);
  assert.ok(c.sequencial > c.minutos);
  const m = P.mermaid(copia());
  assert.match(m, /^graph LR/);
  assert.match(m, /subgraph onda4\["Onda 4"\]/);
  assert.match(m, /falas_lulu --> vozes/);
});

test('§6.1: arquivo com dois donos, pasta cobrindo arquivo de outra, disputado em worker', () => {
  let p = copia();
  tarefa(p, 'icones').arquivos.push('jogo/js/interiores/salao/fora.js');
  acusa(p, /arquivo jogo\/js\/interiores\/salao\/fora\.js tem dois donos/);
  p = copia();
  tarefa(p, 'icones').arquivos = ['jogo/js/interiores/salao/'];
  acusa(p, /pasta jogo\/js\/interiores\/salao\/ \(de icones\) cobre/);
  p = copia();
  tarefa(p, 'telas').arquivos.push('jogo/js/manifesto.js');
  acusa(p, /arquivo disputado jogo\/js\/manifesto\.js na tarefa telas/, /tem dois donos/);
  p = copia();
  tarefa(p, 'telas').arquivos.push('package.json');
  acusa(p, /arquivo disputado package\.json na tarefa telas \(worker-low\)/);
});

test('§6.2: dependência inexistente e ciclo', () => {
  let p = copia();
  tarefa(p, 'telas').depende.push('nao-existe');
  acusa(p, /telas depende de "nao-existe", que não existe/);
  p = copia();
  tarefa(p, 'contrato').depende.push('telas');
  acusa(p, /ciclo nas dependências: .*contrato.*telas|ciclo nas dependências: .*telas.*contrato/);
  assert.throws(() => P.ondas(p), /ciclo/);
});

test('§6.3: npc, falas, vozes e cenário sem caminho até o contrato do personagem', () => {
  for (const id of ['npc-lulu', 'falas-lulu', 'vozes', 'cenario']) {
    const p = copia();
    tarefa(p, id).depende = [];
    acusa(p, new RegExp(`tarefa ${id} \\(\\w+\\) usa salao-lulu mas não depende`));
  }
  const p = copia();
  tarefa(p, 'vozes').depende = ['falas-lulu'];
  assert.deepStrictEqual(P.conferir(p), [], 'indireto (vozes → falas → contrato) vale');
  const q = copia();
  tarefa(q, 'contrato').personagens = [];
  tarefa(q, 'contrato').arquivos = tarefa(q, 'contrato').arquivos.filter((a) => !a.endsWith('reservas.js'));
  acusa(q, /personagem salao-lulu: nenhuma tarefa contrato o reserva/);
});

test('§6.4: personagem sem campo, sem tarefa npc ou em duas', () => {
  let p = copia();
  p.personagens[0].x = null;
  delete p.personagens[0].genero;
  p.personagens[0].idade = 'bebe';
  acusa(p, /salao-lulu: preencha "x"/, /salao-lulu: preencha "genero"/, /idade "bebe" inválida/);
  p = copia();
  tarefa(p, 'npc-lulu').personagens = [];
  acusa(p, /salao-lulu: não aparece em nenhuma tarefa npc/);
  p = copia();
  p.tarefas.push({ ...tarefa(p, 'npc-lulu'), id: 'npc-lulu-2', arquivos: ['jogo/js/interiores/salao/outro.js'], worktree: 'salao-npcs-2' });
  tarefa(p, 'integracao').depende.push('npc-lulu-2');
  acusa(p, /mais de uma tarefa npc \(npc-lulu, npc-lulu-2\)/);
});

test('§6.5: vozes dependendo do npc ou sem depender das falas', () => {
  let p = copia();
  tarefa(p, 'vozes').depende.push('npc-lulu');
  acusa(p, /vozes vozes depende do visual \(npc npc-lulu\)/);
  p = copia();
  tarefa(p, 'vozes').depende = ['contrato'];
  acusa(p, /vozes vozes não depende das falas falas-lulu/);
  p = copia();
  tarefa(p, 'falas-lulu').personagens = [];
  acusa(p, /nenhuma tarefa falas cobre salao-lulu/);
});

test('§6.6: integracao sem depender de todas; entrega sem integracao', () => {
  let p = copia();
  tarefa(p, 'integracao').depende = tarefa(p, 'integracao').depende.filter((d) => d !== 'icones');
  acusa(p, /integracao integracao não depende de icones/);
  p = copia();
  tarefa(p, 'entrega').depende = ['contrato'];
  acusa(p, /entrega entrega não depende da integracao/);
});

test('§6.7: worktree dividida por tipo que roda navegador', () => {
  const p = copia();
  tarefa(p, 'npc-lulu').worktree = 'salao-cenario';
  acusa(p, /worktree reino-salao-cenario dividida por cenario \(cenario\) e npc-lulu \(npc\)/);
  // em sequência (uma depende da outra) pode dividir
  const q = copia();
  tarefa(q, 'integracao').worktree = 'salao-telas';
  assert.deepStrictEqual(P.conferir(q), []);
});

test('proximas/marcar: só libera com dependências aprovadas; feita pede o conferente; reprovada volta', () => {
  fs.mkdirSync(C.PASTA_TESTES, { recursive: true });
  const pasta = fs.mkdtempSync(path.join(C.PASTA_TESTES, 'planos-'));
  const p = copia();
  let est = P.lerEstado(p, pasta);
  assert.deepStrictEqual(P.proximas(p, est).lancar, ['contrato', 'icones']);
  assert.throws(() => P.marcar(p, est, 'telas', 'lancada'), /ainda não pode ser lançada: contrato está pendente/);
  assert.throws(() => P.marcar(p, est, 'contrato', 'feita'), /marque lancada antes/);
  assert.throws(() => P.marcar(p, est, 'contrato', 'aprovada'), /só a tarefa feita/);
  assert.throws(() => P.marcar(p, est, 'contrato', 'pronta'), /estado inválido/);
  P.marcar(p, est, 'contrato', 'lancada');
  assert.match(P.marcar(p, est, 'contrato', 'feita', 'x.json'), /lance AGORA o conferente: npm run plano -- conferente x\.json contrato/);
  assert.deepStrictEqual(P.proximas(p, est).conferir, ['contrato']);
  assert.match(P.marcar(p, est, 'contrato', 'reprovada'), /retome a MESMA frente/);
  assert.deepStrictEqual(P.proximas(p, est).retomar, ['contrato']);
  assert.ok(!P.proximas(p, est).lancar.includes('telas'), 'reprovada não libera ninguém');
  P.marcar(p, est, 'contrato', 'lancada');
  P.marcar(p, est, 'contrato', 'feita');
  assert.match(P.marcar(p, est, 'contrato', 'aprovada'), /liberadas: fachada, cenario, npc-lulu, falas-lulu, telas/);
  const arq = P.gravarEstado(p, est, pasta);
  assert.strictEqual(arq, path.join(pasta, 'salao-beleza.estado.json'));
  est = P.lerEstado(p, pasta);
  assert.strictEqual(est.tarefas.contrato.estado, 'aprovada');
  assert.strictEqual(est.tarefas.contrato.reprovacoes, 1);
  const r = P.proximas(p, est);
  assert.deepStrictEqual(r.lancar, ['icones', 'fachada', 'cenario', 'npc-lulu', 'falas-lulu', 'telas']);
  assert.strictEqual(r.integrar, false);
  // vozes só depois das falas aprovadas (não espera o npc)
  ['lancada', 'feita', 'aprovada'].forEach((e) => P.marcar(p, est, 'falas-lulu', e));
  assert.ok(P.proximas(p, est).lancar.includes('vozes'));
  // o resto, onda a onda: aí já pode integrar
  P.ondas(p).flat().filter((t) => !['integracao', 'entrega'].includes(t.tipo) && P.proximas(p, est).aprovadas.indexOf(t.id) < 0)
    .forEach((t) => ['lancada', 'feita', 'aprovada'].forEach((e) => P.marcar(p, est, t.id, e)));
  assert.strictEqual(P.proximas(p, est).integrar, true);
  assert.throws(() => P.pastaEstado('/home/leandro/planos'), /proibido/);
});

test('briefing, conferente e reservas do exemplo', () => {
  const p = copia();
  const b = P.briefing(p, 'npc-lulu', { mae: '/home/x' });
  for (const r of [/^Tarefa: /m, /^Worktree: \/home\/x\/reino-salao-npcs \(branch feat\/salao-npcs\)/m, /^Arquivos seus: jogo\/js\/interiores\/salao\/personagens\.js/m,
    /^Prefixo de id: salao-/m, /^Arquivo de falas: nenhum: as falas são da tarefa falas-lulu/m, /^Pode ler: /m, /^Pronto quando: /m,
    /^Diferença esperada no e2e: /m, /salao-lulu: Dona Lulu, f, adulto, vaga salao \(3,5\)/, /a reserva não muda; registrarPersonagem só com id, sprite/]) assert.match(b, r);
  assert.match(P.briefing(p, 'falas-lulu'), /^Arquivo de falas: jogo\/js\/interiores\/salao\/personagens-falas\.js/m);
  const c = P.conferente(p, 'npc-lulu', { mae: '/home/x', arqPlano: 'plano.json' });
  assert.match(c, /não edita/);
  assert.match(c, /npm run ver -- --ir salao --nome salao-lulu/);
  assert.match(c, /git -C \/home\/x\/reino-salao-npcs status --short/);
  assert.match(c, /marcar plano\.json npc-lulu aprovada/);
  assert.throws(() => P.briefing(p, 'nada'), /tarefa desconhecida/);
  // mecânica: o filtro do --so vem dos testes listados em arquivos
  assert.match(P.conferente(p, 'telas'), /npm run unidade -- --so 'salao\.navegador\|salao-visual'/);
  tarefa(p, 'telas').arquivos = tarefa(p, 'telas').arquivos.filter((x) => !x.endsWith('.test.js'));
  assert.match(P.conferente(p, 'telas'), /liste os testes da tarefa em arquivos/);
  assert.deepStrictEqual(P.reservas(p)[0], `npm run novo -- reserva salao-lulu --predio salao --nome "Dona Lulu" --genero f --idade adulto --x 3 --y 5 --acao '{"tipo":"tela","tela":"salao-cabelo"}'`);
});

test('rascunho a partir de um pedido: nome, tipos, personagens, gêneros e idades', () => {
  const pedido = `/nova-feature

# 1. Nome
Padaria da Vila
Para quando: sexta

# 2. Tipo (marque um ou mais)
[x] Prédio novo, ou um prédio por dentro
[x] Personagem novo
[ ] Música
[x] Enfeite, comida ou prêmio da Loja

# 3. O que eu quero
Uma padaria.

# 8. Personagens e falas
Quem aparece:
Dona Lulu, mulher, adulta
- Seu Zé (homem, 70 anos)
Pedrinho, menino
- Ana Júlia (moça)
Jeito de falar: alegre
Textos:     [x] escreva você

# 13. Pronto quando
- [ ] a padaria abre
`;
  const r = rascunho(pedido, { pedido: 'pedidos/x.md' });
  assert.strictEqual(r.nome, 'padaria-da-vila');
  assert.deepStrictEqual(r.personagens.map((p) => [p.id, p.nome, p.genero, p.idade]), [
    ['padaria-da-vila-lulu', 'Dona Lulu', 'f', 'adulto'],
    ['padaria-da-vila-ze', 'Seu Zé', 'm', 'idoso'],
    ['padaria-da-vila-pedrinho', 'Pedrinho', 'm', 'crianca'],
    ['padaria-da-vila-ana', 'Ana Júlia', 'f', 'jovem'],
  ]);
  const tipos = r.tarefas.map((t) => t.tipo);
  for (const t of ['contrato', 'cenario', 'fachada', 'arte', 'npc', 'falas', 'vozes', 'integracao', 'entrega']) assert.ok(tipos.includes(t), t);
  assert.ok(!tipos.includes('musica'), 'música não marcada');
  assert.strictEqual(tipos.filter((t) => t === 'npc').length, 4);
  assert.deepStrictEqual(tarefa(r, 'integracao').pronto, ['a padaria abre']);
  // gênero pela profissão ou título, sem artigo; idade não dita fica null
  const { lerPessoa } = require('../../fluxo/plano-pedido');
  assert.deepStrictEqual(lerPessoa('a cabeleireira Dona Lulu (decidido pelo Claude), voz nova'), { nome: 'Dona Lulu', genero: 'f', idade: null });
  assert.deepStrictEqual(lerPessoa('o padeiro Zé'), { nome: 'Zé', genero: 'm', idade: null });
  assert.deepStrictEqual(lerPessoa('Bia'), { nome: 'Bia', genero: null, idade: null });
  const p2 = rascunho(pedido, { prefixo: 'padaria' });
  assert.strictEqual(p2.personagens[0].id, 'padaria-lulu');
  // o que o pedido não fecha sai vazio e o conferir pede para preencher (e só isso)
  const erros = P.conferir(r);
  assert.ok(erros.length && erros.every((e) => /preencha/.test(e)), erros.join('\n'));
  assert.ok(erros.some((e) => /padaria-da-vila-lulu: preencha "predio"/.test(e)));
});

// auditoria de bugs: "depende" em texto fazia a conferir lançar (…filter is not a function) em vez de listar o erro
test('plano conferir: "depende" em texto vira problema listado, não exceção', () => {
  const plano = { nome: 'x', personagens: [], tarefas: [
    { id: 'contrato', tipo: 'contrato', quem: 'orquestrador', worktree: 'x', arquivos: ['jogo/js/a.js'], depende: [] },
    { id: 'mec', tipo: 'mecanica', quem: 'worker-low', worktree: 'mec', arquivos: ['jogo/js/b.js'], depende: 'contrato' },
    { id: 'integracao', tipo: 'integracao', quem: 'orquestrador', worktree: 'x', depende: ['contrato', 'mec'] },
    { id: 'entrega', tipo: 'entrega', quem: 'orquestrador', worktree: 'x', depende: ['integracao'] },
  ] };
  let erros;
  assert.doesNotThrow(() => { erros = P.conferir(plano); });
  assert.ok(erros.some((e) => /"depende" tem de ser uma lista/.test(e)), JSON.stringify(erros));
});
