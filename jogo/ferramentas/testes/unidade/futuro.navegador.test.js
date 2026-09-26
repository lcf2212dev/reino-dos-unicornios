// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico): uma aba desta versão recebe
// um save com ids "do futuro" (montaria, ovo, sala, prova, treino, pago, comida, item da loja e enfeite em uso que
// ela não conhece). Nada pode quebrar: mapa, HUD, Loja, Estábulo, Lugares, Baú, Escola, Pet Shop, Pais,
// Castelo, Plano e trocar um enfeite
// conhecido, com zero erro de console; e o 'enfeite-futuro' continua em usando.enfeites (§6 de save-e-mescla.md).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/futuro.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const FUTURO = {
  unis: {
    'uni-futuro': { em: 1789000000000, xp: 120, chocado: true, nome: 'Do Futuro' },
    'ovo-futuro': { em: 1789000100000, xp: 0, chocado: false },
  },
  montaria: 'uni-futuro',
  salas: { 'sala-futuro': { vezes: 1, melhor: 5, feita: 1789000200000, perfeita: true, calma: true } },
  provas: { 'prova-futuro': { tentativas: 1, notas: [10], melhor: 10, premio: 'lendario', premioEm: 1789000300000 } },
  treinos: { 'materia-futuro': { melhor: 8, ouro: true, perfeito: true, vezes: 2 } },
  pago: { 'materia-futuro': 7 },
  despensa: { 'comida-futuro': { compradas: 3, usadas: 1 } },
  loja: { 'enfeite-futuro': true, 'acessorio-futuro': true, flor: true },
  usando: { enfeites: ['enfeite-futuro', 'flor'] },
  cuidados: { 'uni-futuro': { fome: 30, sede: 30, banho: 30, em: 1789999999000, acao: 0, acaoFome: 0, acaoSede: 0, acaoBanho: 0 } },
};

test('futuro: save com ids que esta versão não conhece não quebra nada e os ids ficam guardados', async () => {
  const c = await abrirCenario({ save: 'completo', mudar: FUTURO, tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-futuro' });
  try {
    const leitura = () => c.js('({ m: Reino.Progresso.montaria(), bruto: Reino.Progresso.estado().montaria, usando: Reino.Progresso.estado().usando.enfeites.slice(), ovos: Reino.Progresso.ovosParaChocar(), unis: Object.keys(Reino.Progresso.estado().unis) })');
    let r = await leitura();
    assert.strictEqual(r.m, 'inicial', 'montaria desconhecida cai na reserva');
    assert.strictEqual(r.bruto, 'uni-futuro', 'o save guarda a montaria desconhecida');
    assert.ok(r.ovos.indexOf('ovo-futuro') < 0, 'ovo desconhecido não aparece para chocar');

    // o mapa desenha a Mariana montada a cada quadro; o HUD mostra a montaria
    await c.avancar(3000);
    await c.js('Reino.UI.atualizarHUD()');
    await c.avancar(300);
    for (const t of ['loja', 'estabulo', 'lugares', 'bau', 'escola', 'petshop', 'pais', 'castelo', 'plano']) {
      await c.tela(t);
      await c.js('Reino.UI.fecharTodas()');
      await c.avancar(300);
    }
    // 2ª defesa: pedir para chocar o ovo desconhecido não abre tela nenhuma
    await c.js("Reino.UI.chocarOvos(['ovo-futuro'])");
    await c.avancar(300);
    assert.deepStrictEqual((await c.estado()).telas, [], 'nenhuma tela de ovo');
    // trocar um enfeite conhecido (mesmo encaixe da flor) e voltar: o desconhecido fica
    await c.js("Reino.UI.alternarEnfeite('laco')");
    r = await leitura();
    assert.ok(r.usando.indexOf('laco') >= 0 && r.usando.indexOf('flor') < 0, 'laço entrou no lugar da flor: ' + r.usando);
    assert.ok(r.usando.indexOf('enfeite-futuro') >= 0, 'enfeite-futuro continua em uso: ' + r.usando);
    await c.js("Reino.UI.alternarEnfeite('laco')");
    await c.tela('loja');
    await c.js('Reino.UI.fecharTodas()');
    // entrar num prédio e voltar (o interior desenha a montaria também)
    await c.ir('petshop');
    await c.ir('mapa');
    await c.avancar(1000);
    await c.js('Reino.Progresso.salvar()');
    r = await leitura();
    assert.ok(r.usando.indexOf('enfeite-futuro') >= 0, 'enfeite-futuro continua depois de salvar: ' + r.usando);
    assert.strictEqual(r.bruto, 'uni-futuro');
    assert.ok(r.unis.indexOf('uni-futuro') >= 0 && r.unis.indexOf('ovo-futuro') >= 0, 'unicórnios futuros guardados');
    const e = await c.js('JSON.parse(JSON.stringify(Reino.Progresso.estado()))');
    assert.ok(e.salas['sala-futuro'] && e.provas['prova-futuro'] && e.treinos['materia-futuro'], 'sala, prova e treino futuros');
    assert.strictEqual(e.pago['materia-futuro'], 7);
    assert.ok(e.despensa['comida-futuro'] && e.loja['enfeite-futuro'] && e.loja['acessorio-futuro'], 'despensa e loja futuras');
    assert.deepStrictEqual(c.erros, [], 'nenhum erro de console');
  } finally {
    await c.fechar();
  }
});
