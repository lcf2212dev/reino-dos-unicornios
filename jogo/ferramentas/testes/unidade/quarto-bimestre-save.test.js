// Aceite do 4º bimestre (Língua Portuguesa), parte 5: o save de ANTES desta obra (sem `producoes`, com o progresso do
// 3º bimestre: salas, treinos, provas, unicórnios, dinheiro, acessórios da loja, pago, cuidados e despensa; montado
// com saves.js + saves-compor.js) carrega sem perder nem mudar nada, campo a campo, e sem gravar no carregamento; as
// matérias arquivadas continuam arquivadas (em espera) e o dinheiro delas continua no baú; `producoes` só aparece com
// conteúdo depois de usar; a mescla (P.mesclar) de um save antigo com um novo com `producoes`, nos dois sentidos, não
// perde nada de nenhum lado (salas, unicórnios, loja, provas, pago, treinos, despensa, cuidados, ajustes e produções).
// E a sala de Língua Portuguesa conta como uma sala do 3º bimestre (P.concluirSala).
// O jogo inteiro (os `node: true` do manifesto) num vm com localStorage e relógio de mentira (ajudantes/jogo-save.js);
// saves 100% sintéticos; nada toca no save real nem na rede.
// Rodar (da raiz): npm run unidade -- --so quarto-bimestre-save
const { test } = require('node:test');
const assert = require('assert');
const vm = require('vm');
const { Jogo, montar, copia } = require('./ajudantes/jogo-save');
const { gerarSaves } = require('../saves');
const { comporSave } = require('../saves-compor');

const AGORA = 1790000000000 + 3600000;   // uma hora depois dos carimbos dos saves sintéticos
// o jogo inteiro no vm (como save-campos.test.js): os campos registrados (producoes, visitados) entram junto
function jogo(save) {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ agora: AGORA }); } finally { Jogo.scripts = orig; }
  if (save) j.guardado[j.chave] = JSON.stringify(save);
  return j;
}
// o save de antes: o "completo" dos saves sintéticos com todas as salas das matérias do 3º bimestre feitas
// (cada uma 1 vez: nenhum unicórnio de persistência a dar no carregamento) e nenhuma sala do 4º
function saveAntigo() {
  const j = jogo();
  const bases = vm.runInContext(`(${gerarSaves.toString()})()`, j.ctx);
  const R = j.R, salas = {};
  R.materias.forEach((m) => { salas[m.id] = m.salas.map((s) => s.id); });
  const arquivadas = R.materias.filter((m) => m.arquivada).map((m) => m.id);
  const save = comporSave(bases, { save: 'completo', materiasCompletas: arquivadas,
    mudar: { treinos: { historia: { melhor: 'ouro', ouro: 1790000000000 - 6 * 3600000, vezes: 1 } } } }, { salas });
  return { save: JSON.parse(JSON.stringify(save)), arquivadas };
}

test('save antigo: carrega igual, campo a campo, sem gravar; arquivadas em espera; dinheiro do 3º bimestre no baú', () => {
  const { save, arquivadas } = saveAntigo();
  assert.ok(arquivadas.length >= 5, 'as matérias do 3º bimestre arquivadas: ' + arquivadas);
  assert.ok(!('producoes' in save) && !('visitados' in save), 'o save de antes não tem os campos novos');
  assert.ok(Object.keys(save.salas).length >= 25 && Object.keys(save.salas).every((id) => !/^lp/.test(id)), 'salas só do 3º bimestre');
  assert.ok(Object.keys(save.loja).length && Object.keys(save.provas).length && Object.keys(save.unis).length > 5 && save.pago.historia, 'progresso de verdade no save');
  const texto = JSON.stringify(save);
  const j = jogo(save);
  const e = copia(j.P.carregar());   // copia: objetos do vm têm outro protótipo
  // nada se perde nem muda: cada campo que existia volta igual
  Object.keys(save).forEach((k) => assert.deepStrictEqual(e[k], save[k], `campo "${k}" mudou ao carregar`));
  assert.strictEqual(j.guardado[j.chave], texto, 'carregar não grava nada no aparelho');
  // os campos novos existem só na memória, vazios
  assert.deepStrictEqual(e.producoes, {});
  // as matérias do 3º bimestre continuam arquivadas (em espera), com o dinheiro todo no baú; a nova não
  const R = j.R;
  arquivadas.forEach((id) => {
    assert.strictEqual(R.materia(id).arquivada, true, id);
    assert.strictEqual(R.Bimestres.emEspera(id), true, id + ' em espera');
    assert.strictEqual(R.Bimestres.acaoEmEspera({ tipo: 'sala', materia: id, sala: R.materia(id).salas[0].id }), true);
    assert.strictEqual(j.P.materiaCompleta(R.materia(id)), true, id + ' completa');
  });
  Object.keys(save.provas).forEach((id) => assert.strictEqual(R.Bimestres.acaoEmEspera({ tipo: 'prova', prova: id }), true, 'prova ' + id + ' em espera'));
  assert.strictEqual(R.Bimestres.emEspera('portugues4'), false);
  assert.strictEqual(R.materia('portugues4').arquivada, undefined);
  assert.strictEqual(j.P.dinheiroTotal(), arquivadas.length * R.config.valorPorMateria, 'o dinheiro das matérias do 3º bimestre');
  assert.strictEqual(j.P.dinheiroMateria(R.materia('portugues4')), 0);
});

test('save antigo: producoes só aparece com conteúdo depois de usar, e nada mais muda no save', () => {
  const { save } = saveAntigo();
  const j = jogo(save);
  j.P.carregar();
  // um salvar qualquer (sem usar) não traz produção nenhuma
  j.P.salvar();
  const gravado = j.lido();
  assert.ok(!gravado.producoes || Object.keys(gravado.producoes).length === 0, 'producoes com conteúdo sem uso: ' + JSON.stringify(gravado.producoes));
  // usou: o texto e o desenho entram, o resto do save fica igual
  const desafios = {};
  j.R.materia('portugues4').salas.forEach((s) => s.desafios.forEach((d) => { desafios[d.tipo] = desafios[d.tipo] || d.id; }));
  const px = '3'.repeat(30) + '5'.repeat(30) + '0'.repeat(516);
  j.R.Producoes.guardar(desafios.escrever, { texto: 'Era uma vez um gato esperto.' });
  j.relogio.agora += 1000;
  j.R.Producoes.guardar(desafios.desenho, { px });
  const depois = j.lido();
  assert.deepStrictEqual(Object.keys(depois.producoes).sort(), [desafios.desenho, desafios.escrever].sort());
  assert.strictEqual(depois.producoes[desafios.escrever].texto, 'Era uma vez um gato esperto.');
  assert.strictEqual(depois.producoes[desafios.desenho].px, px);
  Object.keys(save).filter((k) => k !== 'atualizado').forEach((k) => assert.deepStrictEqual(depois[k], save[k], `campo "${k}" mudou ao guardar a produção`));
  // e volta igual num aparelho que carrega esse save (ida e volta pelo localStorage)
  const k = jogo(depois);
  assert.deepStrictEqual(copia(k.P.carregar().producoes), depois.producoes);
});

test('mescla: save antigo (sem producoes) com um novo (com producoes e sala do 4º bimestre), nos dois sentidos', () => {
  const { save: antigo } = saveAntigo();
  const j = jogo(copia(antigo));
  j.P.carregar();
  const lp = j.R.materia('portugues4'), sala = lp.salas[0];
  j.relogio.agora += 60000;
  const premios = j.P.concluirSala(lp, sala, { acertosPrimeira: sala.desafios.length, total: sala.desafios.length, pressas: 0 });
  const escrever = sala.desafios.find((d) => d.tipo === 'escrever') || lp.salas.flatMap((s) => s.desafios).find((d) => d.tipo === 'escrever');
  j.R.Producoes.guardar(escrever.id, { texto: 'O gato de botas era esperto.' });
  const novo = j.lido();
  assert.ok(novo.producoes[escrever.id] && novo.salas[sala.id].feita && premios.ovos.length === 2);
  // o antigo ganhou outra coisa num aparelho velho (um enfeite e um ajuste): nada de nenhum lado some
  // o aparelho velho treinou mais (ingles: prata, 2 vezes) e comprou comida; o novo deu comida ao unicórnio
  const velho = copia(antigo), comida = Object.keys(antigo.despensa)[0], uni = Object.keys(antigo.cuidados)[0];
  velho.loja['enfeite-sintetico-velho'] = true;
  velho.treinos.ingles = { melhor: 'prata', vezes: 2 };
  velho.despensa[comida] = { compradas: antigo.despensa[comida].compradas + 2, usadas: antigo.despensa[comida].usadas };
  velho.atualizado = novo.atualizado + 5000;
  const deu = novo.cuidados[uni].acao + 60000;
  Object.assign(novo.cuidados[uni], { fome: 100, em: deu, acao: deu, acaoFome: deu });
  for (const [a, b, nome] of [[velho, novo, 'antigo + novo'], [novo, velho, 'novo + antigo']]) {
    const r = copia(j.P.mesclar(copia(a), copia(b)));
    assert.deepStrictEqual(r.producoes, novo.producoes, nome + ': producoes');
    Object.keys(antigo.salas).concat(sala.id).forEach((id) => assert.ok(r.salas[id] && r.salas[id].feita, `${nome}: sala ${id}`));
    Object.keys(novo.unis).forEach((id) => assert.ok(r.unis[id], `${nome}: unicórnio ${id}`));
    Object.keys(velho.loja).concat(Object.keys(novo.loja)).forEach((id) => assert.ok(r.loja[id], `${nome}: loja ${id}`));
    Object.keys(antigo.provas).forEach((id) => assert.deepStrictEqual(r.provas[id], antigo.provas[id], `${nome}: prova ${id}`));
    assert.deepStrictEqual(r.pago, antigo.pago, nome + ': pago');
    // treinos: a melhor medalha e as vezes de cada um; despensa: os contadores maiores; cuidados: o comer mais novo
    assert.deepStrictEqual(r.treinos.historia, antigo.treinos.historia, nome + ': treino de historia');
    assert.strictEqual(r.treinos.ingles.melhor, 'prata', nome + ': treino de ingles (melhor)');
    assert.strictEqual(r.treinos.ingles.vezes, 2, nome + ': treino de ingles (vezes)');
    Object.keys(antigo.despensa).forEach((k) => assert.deepStrictEqual(r.despensa[k], (k === comida ? velho : antigo).despensa[k], `${nome}: despensa ${k}`));
    assert.strictEqual(r.cuidados[uni].fome, 100, nome + ': a comida dada no aparelho novo');
    assert.strictEqual(r.cuidados[uni].acaoFome, deu, nome + ': o carimbo do comer');
    assert.strictEqual(r.cuidados[uni].sede, antigo.cuidados[uni].sede, nome + ': a sede');
    assert.strictEqual(r.cuidados[uni].banho, antigo.cuidados[uni].banho, nome + ': o banho');
    // ajustes: os dois lados iguais aos do save antigo; nada some
    Object.keys(antigo.ajustes).forEach((k) => assert.deepStrictEqual(r.ajustes[k], antigo.ajustes[k], `${nome}: ajuste ${k}`));
    assert.ok(r.estrelas.ganhas >= novo.estrelas.ganhas, nome + ': estrelas');
    // e o resultado carrega e grava sem perder as produções
    const k = jogo(r);
    assert.deepStrictEqual(copia(k.P.carregar().producoes), novo.producoes, nome + ': producoes depois de carregar');
  }
  // a mesma questão escrita nos dois aparelhos: fica a gravação mais nova (carimbo), nos dois sentidos
  const outro = copia(novo);
  outro.producoes[escrever.id] = { texto: 'Texto mais novo.', em: novo.producoes[escrever.id].em + 10 };
  assert.strictEqual(j.P.mesclar(copia(novo), copia(outro)).producoes[escrever.id].texto, 'Texto mais novo.');
  assert.strictEqual(j.P.mesclar(copia(outro), copia(novo)).producoes[escrever.id].texto, 'Texto mais novo.');
});

test('a sala de Língua Portuguesa conta como uma do 3º bimestre: dinheiro, estrelas, ovos e treino livre', () => {
  const j = jogo();
  j.P.carregar();
  const R = j.R, lp = R.materia('portugues4'), antiga = R.materias.find((m) => m.arquivada && (m.unicornios || []).some((u) => u.sala === m.salas[0].id));
  assert.ok(antiga, 'uma matéria do 3º bimestre com unicórnio de sala');
  for (const m of [antiga, lp]) {
    const s = m.salas[0], n = 6;
    const dinheiro = j.P.dinheiroTotal(), ganhas = j.P.estado().estrelas.ganhas;
    const p1 = j.P.concluirSala(m, s, { acertosPrimeira: n, total: n, pressas: 0 });
    const ovos = copia((m.unicornios || []).filter((u) => u.sala === s.id).map((u) => u.raridade + ':' + u.id).sort());
    assert.deepStrictEqual(ovos.map((x) => x.split(':')[0]), ['comum', 'raro'], m.id + ': 1 comum e 1 raro por sala');
    assert.strictEqual(p1.primeiraVez, true, m.id);
    assert.strictEqual(p1.dinheiro, j.P.valorSala(m), m.id + ': o valor da sala');
    assert.ok(p1.dinheiro > 0 && Math.round(p1.dinheiro * 100) % 50 === 0, m.id + ': valor redondo (de 50 em 50 centavos)');
    assert.strictEqual(Math.round((j.P.dinheiroTotal() - dinheiro) * 100), Math.round(p1.dinheiro * 100), m.id + ': o baú');
    assert.strictEqual(j.P.estado().estrelas.ganhas - ganhas, n + 3, m.id + ': acertos de primeira + 3 da calma');
    assert.deepStrictEqual(copia(p1.ovos).sort(), ovos.map((x) => x.split(':')[1]).sort(), m.id + ': ovo comum e raro (perfeita e com calma)');
    // de novo: treino livre, sem dinheiro nem ovo
    const p2 = j.P.concluirSala(m, s, { acertosPrimeira: 2, total: n, pressas: 1 });
    assert.strictEqual(p2.primeiraVez, false);
    assert.strictEqual(p2.dinheiro, 0);
    assert.deepStrictEqual(copia(p2.ovos), []);
    assert.strictEqual(j.P.estado().salas[s.id].vezes, 2);
  }
  // o valor da matéria inteira é o mesmo das do 3º bimestre (salas + bônus = config.valorPorMateria)
  assert.strictEqual(Math.round((j.P.valorSala(lp) * lp.salas.length + j.P.bonusMateria(lp)) * 100), Math.round(R.config.valorPorMateria * 100));
});
