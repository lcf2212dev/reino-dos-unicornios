// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, congelado), nos 3 tamanhos:
// 1. a prancheta de desenho só pelo teclado (desafios/desenho.js) numa missão de sala de livro sintética: ferramentas e
//    cores pelo Tab, cursor só com o foco do teclado (o toque não mostra nada), setas andam, Enter pinta, linha e
//    quadrado com Enter no começo e no fim (o começo só com os cantos), Esc desiste do começo sem fechar a tela; os
//    requisitos contam igual e o Conferir acerta (depois dele, sem cursor nem dica). A dica do teclado tem o espaço
//    guardado: a prancheta não pula e o toque logo depois do teclado pinta onde tocou; com o foco do teclado, a dica,
//    a prancheta e o "Use no desenho" (fora do celular) ficam à vista, acima do rodapé;
// 2. as figuras de uma carta rica (ui/materia-livro.js): ícones 16×16 e 32×32 no mesmo quadro de 64 px, escala par.
// Fotos em /tmp/reino-testes/ver/desenho-teclado-<tamanho>/.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/desenho-teclado.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const path = require('path');
const { abrirCenario } = require('./ajudantes/terceiro-bimestre');
const { PASTA_TESTES } = require('../guardas');

const pasta = (t) => path.join(PASTA_TESTES, 'ver', 'desenho-teclado-' + t);
const MATERIA = { id: 'teste4', nome: 'Teste', emoji: '✏️', cor: '#8e4fd6', livro: [], unicornios: [], lugar: { nome: 'Ala de Teste', artigo: 'a' }, salas: [] };
const DESENHO = { id: 'teste4-d1', tipo: 'desenho', pergunta: 'Desenhe uma casa com linhas, formas e cores.', livro: 'x', explica: 'Que desenho lindo!',
  requisitos: ['linhas', 'formas', 'cores'] };
const SALA = { id: 'teste4-1', nome: 'Teste', emoji: '✏️', paginas: 'p. 1', intro: 'Teste.', ordem: 'livro', desafios: [DESENHO] };
// carta rica com figuras de 16×16 (doc:rg, 🐱) e de 32×32 (palavra:*) na mesma fileira
const LIVRO = `(function () {
  if (Reino.materia('teste4f')) return;
  Reino.materias.push({ id: 'teste4f', nome: 'Língua Portuguesa', emoji: '✏️', cor: '#8e4fd6', bimestre: 4,
    livros: { aprendizagem: { nome: 'Livro de Aprendizagem', emoji: '📗' } }, lugar: { nome: 'Ala de Teste', artigo: 'a', dentro: 'museu' },
    unicornios: [], salas: [], livro: [{ id: 'teste4f-a01', e: '🐶', titulo: 'Palavras com CH, LH e NH', livroOrigem: 'aprendizagem', pagina: 1, capitulo: 10,
      blocos: [{ t: 'texto', texto: 'Veja as figuras.' }, { t: 'figuras', itens: [{ img: '🐱', legenda: 'gato' }, { img: 'palavra:cachorro', legenda: 'cachorro' },
        { img: 'doc:rg', legenda: 'documento' }, { img: 'palavra:olho', legenda: 'olho' }, { img: 'palavra:coelho', legenda: 'coelho' }] }] }] });
})()`;

// o canvas tem 12 px por quadradinho: a cor (r,g,b) no meio de (x, y) e na borda de fora dele (o anel do cursor)
const cor = (x, y) => `(function (c) { var d = c.getContext('2d').getImageData(${x}, ${y}, 1, 1).data; return [d[0], d[1], d[2]].join(','); })(document.querySelector('.desenho-tela'))`;
const PRETO = '58,36,70', AZUL = '77,141,255', BRANCO = '255,255,255';

for (const tamanho of ['celular', 'tablet', 'notebook']) {
  test(`${tamanho}: desenho só pelo teclado e figuras de 16 e 32 px no mesmo quadro`, async () => {
    const c = await abrirCenario({ tamanho, save: 'completo', pasta: pasta(tamanho) });
    const p = c.page;
    const tecla = async (k, vezes = 1) => { for (let i = 0; i < vezes; i++) await p.keyboard.press(k); await c.avancar(150); };
    const foco = () => c.js('document.activeElement && document.activeElement.className');
    async function tabAte(sel) {
      for (let i = 0; i < 40 && !(await c.js(`document.activeElement.matches(${JSON.stringify(sel)})`)); i++) { await p.keyboard.press('Tab'); await c.avancar(40); }
      assert.ok(await c.js(`document.activeElement.matches(${JSON.stringify(sel)})`), 'Tab não chegou em ' + sel + ' (foco: ' + await foco() + ')');
    }
    const feitos = () => c.js(`Array.from(document.querySelectorAll('.desenho-req.feito')).map(function (l) { return l.textContent.replace('✓', '').trim(); }).join(',')`);
    const dica = () => c.js(`(function (d) { return d ? d.textContent : ''; })(document.querySelector('.desenho-dica-tecla > .dica-atual'))`);
    // posição da prancheta dentro do desafio (muda se algo em cima dela aparecer ou sumir)
    const lugarTela = () => c.js(`document.querySelector('.desenho-tela').getBoundingClientRect().top - document.querySelector('.desenho').getBoundingClientRect().top`);
    const vista = () => c.js(`(function () { var r = function (s) { return document.querySelector(s).getBoundingClientRect(); }, corpo = r('.missao-corpo');
      return { dica: r('.desenho-dica-tecla').top >= corpo.top, tela: r('.desenho-tela').bottom <= corpo.bottom, lista: r('.desenho-lista').bottom <= corpo.bottom && r('.desenho-lista').top >= corpo.top }; })()`);
    try {
      // ---------- 1. desenho ----------
      await c.js(`Reino.UI.fecharTodas(); document.body.classList.remove('em-missao'); void Reino.Missao.iniciar(${JSON.stringify(MATERIA)}, ${JSON.stringify(SALA)})`);
      await c.avancar(2000);
      await tabAte('.intro-botoes .btn-principal'); await tecla('Enter'); await c.avancar(2500);
      assert.strictEqual(await c.js(`!!document.querySelector('.desenho-tela')`), true, 'a prancheta na tela');
      // o toque não mostra cursor nem dica (e pinta como sempre)
      const tela = p.locator('.desenho-tela');
      const lado = (await tela.boundingBox()).width / 24;
      await tela.click({ position: { x: lado * 2.5, y: lado * 2.5 } }); await c.avancar(200);
      assert.strictEqual(await c.js(cor(2 * 12 + 6, 2 * 12 + 6)), PRETO, 'o lápis do toque pinta');
      assert.strictEqual(await dica(), '', 'sem dica do teclado no toque');
      assert.ok((await c.js(`document.querySelector('.desenho-dica-tecla').offsetHeight`)) > 0, 'o espaço da dica fica guardado');
      assert.strictEqual(await c.js(cor(12 * 12 - 1, 12 * 12 + 6)), BRANCO, 'sem cursor no toque');
      const antes = await lugarTela();
      // pelo teclado o cursor aparece no meio, a prancheta não sai do lugar; o toque logo depois pinta onde tocou
      await tabAte('.desenho-tela');
      assert.match(await dica(), /^Setas andam, Enter pinta\.$/);
      assert.strictEqual(await lugarTela(), antes, 'a prancheta não pulou com a dica');
      assert.deepStrictEqual(await vista(), { dica: true, tela: true, lista: tamanho !== 'celular' }, 'dica, prancheta e lista à vista');
      await c.foto('0-foco-teclado');
      await tela.click({ position: { x: lado * 20.5, y: lado * 4.5 } }); await c.avancar(200);
      assert.strictEqual(await c.js(cor(20 * 12 + 6, 4 * 12 + 6)), PRETO, 'o toque depois do teclado pinta onde tocou');
      assert.strictEqual(await c.js(cor(20 * 12 + 6, 6 * 12 + 6)), BRANCO, 'e não 2 linhas abaixo');
      assert.strictEqual(await dica(), '', 'o toque esconde a dica');
      assert.strictEqual(await lugarTela(), antes, 'nem a prancheta');
      // Linha pelo Tab
      await tabAte('.desenho-ferr[aria-label="Linha"]'); await tecla('Enter');
      assert.strictEqual(await c.js(`document.querySelector('.desenho-ferr[aria-label="Linha"]').getAttribute('aria-pressed')`), 'true');
      await tabAte('.desenho-tela');
      assert.match(await dica(), /^Setas andam\. Enter marca o começo\.$/);
      assert.strictEqual(await c.js(cor(12 * 12 - 1, 12 * 12 + 6)), PRETO, 'anel escuro do cursor por fora');
      assert.strictEqual(await c.js(cor(12 * 12, 12 * 12 + 6)), BRANCO, 'branco por dentro');
      // Enter no começo, setas, Enter no fim: a linha
      await tecla('Enter');
      assert.match(await dica(), /^Vá até o fim e aperte Enter\. Esc desiste\.$/);
      assert.strictEqual(await lugarTela(), antes, 'a dica trocou sem a prancheta pular');
      await tecla('ArrowRight', 6); await tecla('ArrowDown', 2);
      await c.foto('1-linha-marcada');
      assert.strictEqual(await c.js(cor(12 * 12 - 1, 12 * 12 - 1)), PRETO, 'o começo marcado: canto escuro');
      assert.strictEqual(await c.js(cor(12 * 12 - 1, 12 * 12 + 6)), BRANCO, 'e aberto no meio do lado (não é o cursor nem uma cor da paleta)');
      await tecla('Enter');
      assert.strictEqual(await feitos(), 'linhas', 'a linha conta');
      assert.strictEqual(await c.js(cor(15 * 12 + 6, 13 * 12 + 6)), PRETO, 'a linha na grade');
      // Esc com o começo marcado desiste dele e a tela continua aberta
      await tabAte('.desenho-ferr[aria-label="Quadrado"]'); await tecla('Enter');
      await tabAte('.desenho-cor[aria-label="Azul"]'); await tecla(' ');
      await tabAte('.desenho-tela');
      await tecla('ArrowLeft', 15); await tecla('ArrowUp', 11);
      await tecla('Enter'); await tecla('Escape');
      assert.strictEqual(await c.js(`!!document.querySelector('.desenho-tela')`), true, 'o Esc não fechou a missão');
      assert.match(await dica(), /^Setas andam\. Enter marca/, 'o começo saiu');
      await tecla('ArrowRight', 6);
      assert.strictEqual(await feitos(), 'linhas', 'o Esc não desenhou nada');
      // quadrado azul de (3, 3) a (9, 9)
      await tecla('ArrowLeft', 6); await tecla('Enter'); await tecla('ArrowRight', 6); await tecla('ArrowDown', 6); await tecla('Enter');
      assert.strictEqual(await feitos(), 'linhas,formas,cores', 'formas e cores contam pelo teclado');
      assert.strictEqual(await c.js(cor(3 * 12 + 6, 6 * 12 + 6)), AZUL, 'o lado do quadrado');
      // lápis e borracha pelo Enter
      await tabAte('.desenho-ferr[aria-label="Lápis"]'); await tecla('Enter');
      await tabAte('.desenho-tela'); await tecla('ArrowRight', 3); await tecla('ArrowUp', 2); await tecla('Enter');
      assert.strictEqual(await c.js(cor(12 * 12 + 6, 7 * 12 + 6)), AZUL, 'o lápis do teclado pinta');
      await c.foto('2-desenho-teclado');
      await tabAte('.desenho-ferr[aria-label="Borracha"]'); await tecla('Enter');
      await tabAte('.desenho-tela');
      assert.match(await dica(), /^Setas andam, Enter apaga\.$/);
      await tecla('Enter');
      assert.strictEqual(await c.js(cor(12 * 12 + 6, 7 * 12 + 6)), BRANCO, 'a borracha do teclado apaga');
      // Conferir pelo teclado
      await tabAte('.btn-conferir'); await tecla('Enter'); await c.avancar(2500);
      assert.match(await c.js(`document.querySelector('.missao-retorno').textContent`), /Isso/, 'acertou');
      // conferido: a prancheta com o foco não mostra cursor nem dica
      await c.js(`document.querySelector('.desenho-tela').focus()`); await c.avancar(200);
      assert.strictEqual(await dica(), '', 'sem dica depois de conferido');
      assert.strictEqual(await c.js(cor(12 * 12 - 1, 12 * 12 + 6)), BRANCO, 'sem cursor depois de conferido');
      await c.foto('3-conferido');

      // ---------- 2. figuras da carta rica ----------
      await c.js(`Reino.UI.fecharTodas(); document.body.classList.remove('em-missao'); ${LIVRO}; void Reino.UI.abrirLivro(Reino.materia('teste4f'), 'teste4f-a01')`);
      await c.avancar(800);
      await c.foto('4-figuras');
      const figs = await c.js(`Array.from(document.querySelectorAll('.bloco-figura canvas')).map(function (x) { var r = x.getBoundingClientRect(); return [x.width, r.width, r.height]; })`);
      assert.strictEqual(figs.length, 5);
      assert.deepStrictEqual(figs.map((f) => f[0]), [16, 32, 16, 32, 32], 'desenhos de 16 e de 32');
      figs.forEach((f) => {
        assert.strictEqual(f[1], 64, 'todas no quadro de 64 px');
        assert.strictEqual(f[2], 64, 'quadradas');
        assert.strictEqual((f[1] / f[0]) % 2, 0, 'escala par');
      });
      assert.deepStrictEqual(c.erros || [], []);
    } finally { await c.fechar(); }
  });
}
