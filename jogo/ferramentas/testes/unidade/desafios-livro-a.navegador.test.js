// Tipos de desafio do livro do 4º bimestre, parte 1, na tela de verdade (missão de uma sala de livro sintética, celular):
// marcar pelo teclado (tabindex itinerante, setas, Enter) e pelo toque com a marca errada parada; digitar com a dica do
// acento e a fileira de acentos que acompanha a caixa com foco (só pelo teclado); escrever com a dica do que falta, o
// texto guardado a cada Conferir e de volta ao abrir de novo (na prova, não); o desenho com `guardar`. Nada vaza de lado.
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/desafios-livro-a.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('./ajudantes/terceiro-bimestre');
const { PASTA_TESTES } = require('../guardas');

const MATERIA = { id: 'teste4', nome: 'Teste', emoji: '✏️', cor: '#8e4fd6', livro: [], unicornios: [], lugar: { nome: 'Ala de Teste', artigo: 'a' }, salas: [] };
const MARCAR = { id: 'teste4-m1', tipo: 'marcar', pergunta: 'Pinte os pontos finais e os personagens.', livro: 'x', explica: 'Ponto final fecha a frase.',
  texto: 'Era uma vez um {gato|1} esperto{.|0}', marca: 'pintar', cores: [{ nome: 'Ponto-final', cor: '#4d8dff' }, { nome: 'Personagem', cor: '#ff7eb6' }] };
const DIGITAR = { id: 'teste4-g1', tipo: 'digitar', pergunta: 'Escreva o nome.', livro: 'x', explica: 'Água.',
  frases: [{ antes: 'A', depois: 'é gelada.', certas: ['água'] }, { antes: 'O', depois: 'mia.', certas: ['gato'] }] };
const ESCREVER = { id: 'teste4-e1', tipo: 'escrever', pergunta: 'Escreva duas frases sobre o gato.', livro: 'x', explica: 'Frases.',
  minFrases: 2, chaves: [['gato', 'gata']], modelo: 'O gato dorme. Ele sonha.' };
const DESENHO = { id: 'teste4-d1', tipo: 'desenho', pergunta: 'Desenhe.', livro: 'x', explica: 'x', requisitos: ['cores'], guardar: true };
const sala = (ds) => ({ id: 'teste4-1', nome: 'Teste', emoji: '✏️', paginas: 'p. 1', intro: 'Teste.', ordem: 'livro', desafios: ds });

test('livro A: marcar, digitar, escrever e desenho com guardar, por toque e por teclado, no celular', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'livro-a-')) });
  const p = c.page;
  const tecla = async (k, vezes = 1) => { for (let i = 0; i < vezes; i++) await p.keyboard.press(k); await c.avancar(150); };
  const foco = () => c.js('document.activeElement && document.activeElement.className');
  async function tabAte(sel) {
    for (let i = 0; i < 30 && !(await c.js(`document.activeElement.matches(${JSON.stringify(sel)})`)); i++) { await p.keyboard.press('Tab'); await c.avancar(40); }
    assert.ok(await c.js(`document.activeElement.matches(${JSON.stringify(sel)})`), 'Tab não chegou em ' + sel + ' (foco: ' + await foco() + ')');
  }
  const retorno = () => c.js(`(function (r) { return r.hidden ? '' : r.textContent; })(document.querySelector('.missao-retorno'))`);
  const conferir = async () => { await p.locator('.btn-conferir').click(); await c.avancar(2500); return retorno(); };
  const seguir = async () => { await p.locator('.missao-retorno .btn-principal').click(); await c.avancar(2500); };
  const vaza = () => c.js('(function (m) { return document.documentElement.scrollWidth > innerWidth || m.scrollWidth > m.clientWidth; })(document.querySelector(".missao-corpo"))');
  const abrir = async (ds) => {
    await c.js(`Reino.UI.fecharTodas(); document.body.classList.remove('em-missao'); void Reino.Missao.iniciar(${JSON.stringify(MATERIA)}, ${JSON.stringify(sala(ds))})`);
    await c.avancar(2000); await p.locator('.intro-botoes .btn-principal').click(); await c.avancar(2500);
  };
  try {
    await abrir([MARCAR, DIGITAR, ESCREVER]);
    // marcar: um toque errado ("vez") fica marcado e sai depois do "Tentar de novo"
    await p.locator('.marcar-token').nth(2).click(); await c.avancar(200);
    assert.match(await conferir(), /Quase/);
    assert.strictEqual(await c.js(`document.querySelectorAll('.marcar-token.item-erro').length`), 1, 'a marca errada fica parada');
    await seguir(); await c.avancar(1200);
    assert.strictEqual(await c.js(`document.querySelectorAll('.marcar-token[aria-pressed="true"]').length`), 0, 'a marca errada saiu');
    // teclado: Personagem → gato; Ponto-final → "."; só um token na ordem do Tab
    await tabAte('.marcar-cor'); await tecla('Tab'); await tecla('Enter');
    await tecla('Tab');
    assert.match(await foco(), /marcar-token/);
    assert.strictEqual(await c.js(`document.querySelectorAll('.marcar-token[tabindex="0"]').length`), 1, 'tabindex itinerante');
    await tecla('Home'); await tecla('ArrowRight', 4); await tecla('Enter');
    await p.keyboard.down('Shift'); await tecla('Tab', 2); await p.keyboard.up('Shift'); await tecla(' ');
    await tecla('Tab', 2); await tecla('End'); await tecla('Enter');
    assert.strictEqual(await c.js(`JSON.stringify(Array.from(document.querySelectorAll('.marcar-token')).map(function (t) { return t.getAttribute('aria-pressed'); }))`),
      JSON.stringify(['false', 'false', 'false', 'false', 'true', 'false', 'true']));
    await tabAte('.btn-conferir'); await tecla('Enter'); await c.avancar(2500);
    assert.match(await retorno(), /Isso/);
    assert.strictEqual(await vaza(), false, 'marcar vaza de lado');
    await seguir();
    // digitar: sem acento → dica; só pelo teclado, o Tab da 1ª caixa vai aos acentos dela e o á cai nela
    await tabAte('.digitar .campo-texto'); await p.keyboard.type('agua'); await tecla('Enter'); await p.keyboard.type('gato');
    assert.match(await conferir(), /confira os acentos/);
    await seguir(); await c.avancar(1200);
    const caixa = (i) => `document.querySelectorAll('.digitar .campo-texto')[${i}]`;
    const fileiraDepoisDa = (i) => c.js(`document.querySelector('.digitar .acentos').previousElementSibling === document.querySelectorAll('.digitar-item')[${i}]`);
    await tabAte('.digitar-item:first-child .campo-texto');
    assert.strictEqual(await fileiraDepoisDa(0), true, 'a fileira fica depois da caixa com foco');
    await p.keyboard.press('End'); for (let k = 0; k < 4; k++) await p.keyboard.press('Backspace');
    await tecla('Tab');
    assert.match(await foco(), /acento/, 'o Tab da 1ª caixa vai direto aos acentos');
    await tecla('Tab'); await tecla('Enter');
    await p.keyboard.down('Shift'); await tecla('Tab', 2); await p.keyboard.up('Shift');
    await p.keyboard.press('End'); await p.keyboard.type('gua'); await c.avancar(100);
    assert.strictEqual(await c.js(`${caixa(0)}.value`), 'água');
    await tecla('Tab', 13);
    assert.strictEqual(await c.js(`document.activeElement === ${caixa(1)}`), true, 'depois dos acentos, a 2ª caixa');
    assert.strictEqual(await fileiraDepoisDa(1), true, 'a fileira acompanha a 2ª caixa');
    assert.match(await conferir(), /Isso/);
    await seguir();
    // escrever: a dica diz o que falta; o certo mostra o modelo e guarda
    await tabAte('.escrever .campo-texto'); await p.keyboard.type('O gato dorme.');
    assert.match(await conferir(), /Escreva pelo menos 2 frases\./);
    assert.strictEqual(await c.js(`Reino.Producoes.ler('teste4-e1').texto`), 'O gato dorme.', 'o Conferir errado também guarda');
    await seguir(); await c.avancar(1200);
    await p.locator('.escrever .campo-texto').click(); await p.keyboard.press('End'); await p.keyboard.type(' Ele sonha.');
    assert.match(await conferir(), /Isso/);
    assert.match(await c.js(`document.querySelector('.escrever-modelo').textContent`), /Uma resposta possível:O gato dorme\. Ele sonha\./);
    assert.strictEqual(await c.js(`Reino.Producoes.ler('teste4-e1').texto`), 'O gato dorme. Ele sonha.');
    assert.strictEqual(await vaza(), false, 'escrever vaza de lado');
    // de novo: a escrita guardada volta, com o Conferir ligado; na prova começa vazia
    await abrir([ESCREVER]);
    assert.strictEqual(await c.js(`document.querySelector('.escrever .campo-texto').value`), 'O gato dorme. Ele sonha.');
    assert.strictEqual(await c.js(`document.querySelector('.btn-conferir').disabled`), false);
    assert.strictEqual(await c.js(`Reino.Desafios.render(${JSON.stringify(ESCREVER)}, { modo: 'prova' }).valor()`), '');
    // desenho com guardar: o certo guarda e volta (na prova, não)
    const px = '1'.repeat(10) + '6'.repeat(10) + '0'.repeat(556);
    assert.strictEqual(await c.js(`(function () { var ctrl = Reino.Desafios.render(${JSON.stringify(DESENHO)}, { valorInicial: { px: '${px}', usou: { linhas: false, formas: false, cores: [1, 6] } } });
      return ctrl.conferir().ok; })()`), true);
    assert.strictEqual(await c.js(`Reino.Producoes.ler('teste4-d1').px`), px);
    assert.strictEqual(await c.js(`(function () { var v = Reino.Desafios.render(${JSON.stringify(DESENHO)}, {}).valor(); return v && v.px; })()`), px);
    assert.strictEqual(await c.js(`Reino.Desafios.render(${JSON.stringify(DESENHO)}, { modo: 'prova' }).valor()`), null);
    assert.strictEqual(await c.js(`Reino.Desafios.render(${JSON.stringify(Object.assign({}, DESENHO, { guardar: undefined }))}, {}).valor()`), null, 'sem guardar, nada volta');
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});
