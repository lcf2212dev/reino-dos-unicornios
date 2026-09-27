// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico): a criação de personagem
// (UI.telaAparencia). Menino troca para curto + camiseta sem laço e voltar a Menina devolve a aparência exata;
// pelo teclado (Tab até Menino, Enter); o Pronto grava a aparência e passa nome e sexo ao perfil
// (Reino.Jogadores de mentira); a prévia para de girar ao fechar. Zero erro de console.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/criar-personagem.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const ap = () => 'JSON.parse(JSON.stringify(Reino.Progresso.estado().aparencia))';

test('criar personagem: menina/menino, teclado, nome e sexo no perfil, aparência gravada', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-criar' });
  try {
    const antes = await c.js(ap());
    await c.js(`window.__perfis = []; Reino.Jogadores = { perfil: function () { return { nome: 'Mariana', sexo: 'menina' }; },
      definirPerfil: function (p) { window.__perfis.push(p); } }`);
    await c.js('void Reino.UI.telaAparencia(false)');
    await c.avancar(600);
    assert.strictEqual(await c.js("document.querySelector('.criar-nome').value"), 'Mariana');
    // menino pelo teclado
    for (let i = 0; i < 20; i++) {
      await c.tecla('Tab');
      if (await c.js("document.activeElement && /Menino/.test(document.activeElement.textContent)")) break;
    }
    assert.ok(await c.js("/Menino/.test(document.activeElement.textContent)"), 'Tab chega no Menino');
    await c.tecla('Enter');
    const menino = await c.js(ap());
    assert.strictEqual(menino.corte, 'curto'); assert.strictEqual(menino.modelo, 'camiseta'); assert.strictEqual(menino.semLaco, true);
    assert.strictEqual(await c.js("document.querySelector('.criar-opcao').textContent"), 'Curtinho', 'os de menino primeiro');
    // de volta a menina: a aparência de antes, sem campo a mais
    await c.tocar('Menina');
    assert.deepStrictEqual(await c.js(ap()), antes, 'menina de volta igual');
    // menino de novo, nome novo, Pronto
    await c.tocar('Menino');
    await c.tocar('Topete');
    await c.js(`(function (i) { i.value = 'Pedro Henrique Silva'; i.dispatchEvent(new Event('input')); })(document.querySelector('.criar-nome'))`);
    await c.tocar('Pronto!');
    assert.strictEqual(await c.js('Reino.UI.temTela()'), false);
    assert.deepStrictEqual(await c.js('window.__perfis'), [{ nome: 'Pedro Henriq', sexo: 'menino' }], 'nome até 12 letras e sexo no perfil');
    const gravado = await c.js('JSON.parse(localStorage.getItem(Reino.config.chaveSave)).aparencia');
    assert.strictEqual(gravado.corte, 'topete'); assert.strictEqual(gravado.modelo, 'camiseta'); assert.strictEqual(gravado.pele, antes.pele);
    assert.deepStrictEqual(c.erros, [], 'sem erro de console');
  } finally { await c.fechar(); }
});
