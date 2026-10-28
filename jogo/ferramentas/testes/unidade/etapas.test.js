// Testes de unidade: a divisão da sala de livro em etapas (js/atividades/etapas.js, Reino.etapasDaSala;
// docs/contratos/quarto-bimestre.md §13.1). Nas salas de verdade: cada carta e cada desafio uma vez, na ordem, dentro
// dos limites, determinística. Em salas de mentira: cada regra (pontos, sobra, carta sem desafio, leitura demais,
// `sala.etapas` à mão). Só lê o conteúdo num vm; nada de save.
// Rodar (da raiz): npm run unidade -- --so etapas
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

function carregar() {
  const ctx = Jogo.contexto({ console });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos'], grupos: ['atividades', 'materias'] }));
  return ctx.Reino;
}
const R = carregar();
const cfg = R.config;
const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);
const salasLivro = () => R.materias.flatMap((m) => m.salas.filter((s) => s.ordem === 'livro').map((s) => ({ m, s })));
const carta = (m, id) => m.livro.find((c) => c.id === id);
// resumo: [cartas, ids dos desafios] por etapa
const resumo = (et) => et.map((e) => [e.cartas, e.desafios.map((d) => d.id)]);

/* ---------- matéria de mentira ---------- */
function palavras(n) { return Array.from({ length: n }, (_, i) => 'p' + i).join(' '); }
function materia(cartas) { return { id: 'mx', livro: cartas.map(([id, n]) => ({ id, blocos: [{ t: 'texto', texto: palavras(n) }] })) }; }
function d(id, livro, tipo) { return { id, tipo: tipo || 'escolha', livro }; }

test('sala sem ordem livro: null; toda sala de livro tem etapas', () => {
  assert.strictEqual(R.etapasDaSala({ livro: [] }, { id: 'x', desafios: [d('a')] }), null);
  assert.ok(salasLivro().length >= 25, 'as salas de Língua Portuguesa');
  salasLivro().forEach(({ m, s }) => assert.ok(R.etapasDaSala(m, s).length >= 1, s.id));
});

test('salas de verdade: cada carta e cada desafio em exatamente uma etapa, na ordem; n = índice', () => {
  salasLivro().forEach(({ m, s }) => {
    const et = R.etapasDaSala(m, s);
    igual(et.flatMap((e) => e.cartas), s.cartas || [], s.id + ': cartas');
    igual(et.flatMap((e) => e.desafios.map((x) => x.id)), s.desafios.map((x) => x.id), s.id + ': desafios');
    et.forEach((e, i) => assert.strictEqual(e.n, i, s.id));
    et.forEach((e, i) => assert.ok(e.cartas.length + e.desafios.length > 0, `${s.id} etapa ${i}: vazia`));
    // os desafios são os mesmos objetos da sala (a missão usa direto)
    et.forEach((e) => e.desafios.forEach((x) => assert.ok(s.desafios.includes(x))));
  });
});

test('salas de verdade: leitura e pontos (até o máximo + 1) dentro dos limites; nenhuma etapa só de 1 desafio leve sem carta', () => {
  salasLivro().forEach(({ m, s }) => {
    R.etapasDaSala(m, s).forEach((e, i) => {
      const pal = e.cartas.reduce((t, id) => t + R.etapasDaSala.palavrasCarta(carta(m, id)), 0);
      if (e.cartas.length > 1) assert.ok(e.cartas.length <= cfg.etapaCartasMax && pal <= cfg.etapaPalavrasMax, `${s.id} etapa ${i}: ${e.cartas.length} cartas, ${pal} palavras`);
      // pontos: fecha ao chegar ao máximo; a sobra só se junta se a soma não passar do máximo + 1
      const pts = e.desafios.reduce((t, x) => t + R.etapasDaSala.peso(x), 0);
      assert.ok(pts <= cfg.etapaDesafiosMax + 1, `${s.id} etapa ${i}: ${pts} pontos`);
      // sozinho sem carta, só a sobra pesada (escrever, desenho), que juntada passaria do máximo + 1
      if (s.desafios.length > 1 && e.desafios.length === 1 && !e.cartas.length) assert.ok(R.etapasDaSala.peso(e.desafios[0]) >= 2, `${s.id} etapa ${i}: 1 desafio leve sem carta`);
    });
  });
});

test('determinística e pura: a mesma divisão de novo, e a sala não muda', () => {
  salasLivro().forEach(({ m, s }) => {
    const antes = JSON.stringify(s);
    assert.strictEqual(JSON.stringify(R.etapasDaSala(m, s)), JSON.stringify(R.etapasDaSala(m, s)), s.id);
    assert.strictEqual(JSON.stringify(s), antes, s.id + ': a sala mudou');
  });
});

test('regra 1: fecha ao chegar aos pontos; escrever vale mais; sobra de 1 desafio sem carta junta-se à anterior', () => {
  assert.strictEqual(cfg.etapaDesafiosMax, 4); assert.strictEqual(cfg.etapaPesoEscrever, 2);
  const m = materia([['c1', 10]]);
  // 9 desafios de 1 ponto: 4 + 4 + sobra de 1 (sem carta) → 4 + 5
  const ds = Array.from({ length: 9 }, (_, i) => d('d' + i, i === 0 ? 'c1' : undefined));
  igual(resumo(R.etapasDaSala(m, { id: 's', ordem: 'livro', cartas: ['c1'], desafios: ds })),
    [[['c1'], ['d0', 'd1', 'd2', 'd3']], [[], ['d4', 'd5', 'd6', 'd7', 'd8']]]);
  // escrever (2) + escolha + escolha = 4 → fecha; escrever + escrever = 4 → fecha
  const ds2 = [d('a', 'c1', 'escrever'), d('b'), d('c'), d('e', null, 'escrever'), d('f', null, 'desenho')];
  igual(resumo(R.etapasDaSala(m, { id: 's', ordem: 'livro', cartas: ['c1'], desafios: ds2 })),
    [[['c1'], ['a', 'b', 'c']], [[], ['e', 'f']]]);
  // sobra pesada (escrever, 2): juntar daria 6 pontos (> máximo + 1): fica sozinha
  const ds4 = [d('a', 'c1'), d('b'), d('c'), d('e'), d('f', null, 'escrever')];
  igual(resumo(R.etapasDaSala(m, { id: 's', ordem: 'livro', cartas: ['c1'], desafios: ds4 })),
    [[['c1'], ['a', 'b', 'c', 'e']], [[], ['f']]]);
  // a sobra com carta própria fica sozinha
  const m2 = materia([['c1', 10], ['c2', 10]]);
  const ds3 = Array.from({ length: 5 }, (_, i) => d('d' + i, i === 0 ? 'c1' : i === 4 ? 'c2' : undefined));
  igual(resumo(R.etapasDaSala(m2, { id: 's', ordem: 'livro', cartas: ['c1', 'c2'], desafios: ds3 })),
    [[['c1'], ['d0', 'd1', 'd2', 'd3']], [['c2'], ['d4']]]);
  // sala de 1 desafio só: uma etapa
  igual(resumo(R.etapasDaSala(m, { id: 's', ordem: 'livro', desafios: [d('x')] })), [[[], ['x']]]);
});

test('regra 2: carta no 1º desafio que a cita; sem desafio vai com a seguinte (as últimas, com a última); nunca volta', () => {
  const m = materia([['a', 10], ['b', 10], ['c', 10], ['e', 10], ['f', 10]]);
  const ds = [d('1', 'b'), d('2', 'b'), d('3'), d('4', 'a'), d('5', 'c'), d('6', 'c'), d('7'), d('8', 'b')];
  // a (sem desafio antes de b… mas citada em 4, na etapa 0) e b (etapa 0); c na etapa 1; e, f sem desafio: a última
  igual(resumo(R.etapasDaSala(m, { id: 's', ordem: 'livro', cartas: ['a', 'b', 'c', 'e', 'f'], desafios: ds })),
    [[['a', 'b'], ['1', '2', '3', '4']], [['c', 'e', 'f'], ['5', '6', '7', '8']]]);
  // carta citada só numa etapa anterior à da carta de antes: vai junto com a de antes
  const ds2 = [d('1', 'b'), d('2'), d('3'), d('4'), d('5', 'a')];
  igual(resumo(R.etapasDaSala(m, { id: 's', ordem: 'livro', cartas: ['a', 'b'], desafios: ds2 })),
    [[[], ['1', '2', '3', '4']], [['a', 'b'], ['5']]]);
  // carta sem desafio antes de uma carta citada: vai com ela
  const ds3 = [d('1'), d('2'), d('3'), d('4'), d('5', 'b'), d('6')];
  igual(resumo(R.etapasDaSala(m, { id: 's', ordem: 'livro', cartas: ['a', 'b'], desafios: ds3 })),
    [[[], ['1', '2', '3', '4']], [['a', 'b'], ['5', '6']]]);
});

test('regra 3: leitura demais sai antes, só o mínimo de cartas, no menor número de etapas parelhas; carta grande sozinha pode', () => {
  // 4 cartas curtas (passa do máximo de cartas): só a 1ª sai
  const m = materia([['a', 20], ['b', 20], ['c', 20], ['e', 20]]);
  const ds = [d('1', 'a'), d('2', 'b'), d('3', 'c'), d('4', 'e')];
  igual(resumo(R.etapasDaSala(m, { id: 's', ordem: 'livro', cartas: ['a', 'b', 'c', 'e'], desafios: ds })),
    [[['a'], []], [['b', 'c', 'e'], ['1', '2', '3', '4']]]);
  // palavras demais: 200 + 100 + 100 + 100 → o mínimo é tirar 2 (sobram 200 junto dos desafios), uma etapa cada;
  // duas de leitura seguidas: os desafios 1 e 2 vão junto das cartas que citam
  const m2 = materia([['a', 200], ['b', 100], ['c', 100], ['e', 100]]);
  igual(resumo(R.etapasDaSala(m2, { id: 's', ordem: 'livro', cartas: ['a', 'b', 'c', 'e'], desafios: ds })),
    [[['a'], ['1']], [['b'], ['2']], [['c', 'e'], ['3', '4']]]);
  // carta grande sozinha (300 palavras) pode, junto dos desafios
  const m3 = materia([['a', 300]]);
  igual(resumo(R.etapasDaSala(m3, { id: 's', ordem: 'livro', cartas: ['a'], desafios: [d('1', 'a')] })), [[['a'], ['1']]]);
  // 100, 100, 100, 100, 100, 10 → tirar 3 (sobra 100 + 100 + 10 = 210) em 2 etapas (a maior, 200)
  const m4 = materia([['a', 100], ['b', 100], ['c', 100], ['e', 100], ['f', 100], ['g', 10]]);
  const et = R.etapasDaSala(m4, { id: 's', ordem: 'livro', cartas: ['a', 'b', 'c', 'e', 'f', 'g'], desafios: [d('1', 'a')] });
  igual(resumo(et), [[['a'], []], [['b', 'c'], []], [['e', 'f', 'g'], ['1']]]);
  // parelhas: 10, 240, 240 de leitura a tirar → [10, 240] não cabe (250 cabe!): [10, 240] e [240]
  const m5 = materia([['a', 10], ['b', 240], ['c', 240], ['e', 30]]);
  igual(resumo(R.etapasDaSala(m5, { id: 's', ordem: 'livro', cartas: ['a', 'b', 'c', 'e'], desafios: [d('1', 'a')] })),
    [[['a', 'b'], []], [['c'], []], [['e'], ['1']]]);
});

test('regra 3, leitura em 2+ etapas seguidas: cada desafio vai junto da carta que cita, em ordem; o último fica no fim', () => {
  const m = materia([['a', 200], ['b', 200], ['c', 200], ['e', 100]]);
  const ds = [d('1', 'a'), d('2'), d('3', 'c'), d('4', 'a')];
  // sem espalhar seria [a] [b] [c] (só leitura) e [e] com os 4: agora 1 e 2 vão com a, 3 com c; 4 (cita a) fica no fim
  igual(resumo(R.etapasDaSala(m, { id: 's', ordem: 'livro', cartas: ['a', 'b', 'c', 'e'], desafios: ds })),
    [[['a'], ['1', '2']], [['b'], []], [['c'], ['3']], [['e'], ['4']]]);
  // um só trecho de leitura antes: tudo como antes (leitura, depois as perguntas)
  const m2 = materia([['a', 200], ['b', 200]]);
  igual(resumo(R.etapasDaSala(m2, { id: 's', ordem: 'livro', cartas: ['a', 'b'], desafios: [d('1', 'a'), d('2', 'b')] })),
    [[['a'], []], [['b'], ['1', '2']]]);
});

test('palavras de uma carta: todos os blocos de leitura (texto, versos, itens, quadro, fala, tabela); fonte e ilustração não', () => {
  const p = R.etapasDaSala.palavrasCarta;
  assert.strictEqual(p({ texto: 'um dois três' }), 3);
  assert.strictEqual(p({ blocos: [
    { t: 'texto', texto: 'Era uma vez' },
    { t: 'versos', versos: ['Pode ser um peixe', '', 'Que nunca'] },
    { t: 'lista', itens: [{ termo: 'Personagens', texto: 'são os seres.' }] },
    { t: 'quadro', titulo: 'ORGANIZANDO', itens: [{ texto: 'duas palavras' }] },
    { t: 'figuras', itens: [{ img: 'lp:moinho', legenda: 'moinho' }] },
    { t: 'fala', quem: 'Gato', texto: '— Bom dia!' },
    { t: 'tabela', cab: ['Masculino', 'Feminino'], linhas: [['o alemão', 'a alemã']] },
    { t: 'fonte', texto: 'BRASIL. Ministério da Educação' },
    { t: 'ilustracao', id: 'x', alt: 'um desenho bonito' },
  ] }), 3 + 6 + 4 + 3 + 1 + 3 + 6);
  assert.strictEqual(p(undefined), 0);
});

test('sala.etapas à mão: quantos desafios em cada etapa; as cartas seguem a regra 2', () => {
  const m = materia([['a', 10], ['b', 10]]);
  const ds = [d('1', 'a'), d('2'), d('3', 'b'), d('4'), d('5')];
  igual(resumo(R.etapasDaSala(m, { id: 's', ordem: 'livro', cartas: ['a', 'b'], etapas: [2, 2, 1], desafios: ds })),
    [[['a'], ['1', '2']], [['b'], ['3', '4']], [[], ['5']]]);
});
