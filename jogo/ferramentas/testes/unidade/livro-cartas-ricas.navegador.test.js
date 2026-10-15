// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico): as cartas ricas do 4º
// bimestre e os dois livros da escola (docs/contratos/quarto-bimestre.md §4; js/ui/materia-livro.js e materia.js),
// com uma matéria sintética (livros, cartas com todos os blocos, salas de livro): cabeçalho "📗 Livro de
// Aprendizagem • p. 3", cada bloco, abas por toque e teclado, a ação de NPC com `livro`, a tela da matéria em grupos
// por capítulo e livro, o resumo da missão, a maiúscula acentuada no lugar (fala, verso e lista têm recuo negativo),
// a ilustração sempre em 2× ou mais (a larga rola de lado no próprio quadro), o título curto e a carta de ~110
// palavras rolando ~meia tela no celular, e nada vazando para o lado nos 3 tamanhos. As matérias antigas (fixture do
// 3º bimestre) continuam sem abas, sem cabeçalho e sem grupos.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/livro-cartas-ricas.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');
const Historico = require('./ajudantes/terceiro-bimestre');

const pasta = (n) => '/tmp/reino-testes/ver/teste-livro-cartas-ricas-' + n;
// matéria sintética: Livro de Aprendizagem (5 cartas, capítulos 10 e 11) e Livro de Atividades (2 cartas)
const MATERIA = `(function () {
  if (!Reino.ilustracao('teste4-cena')) Reino.registrarIlustracao('teste4-cena', { w: 40, h: 24, desenhar: function (ctx) {
    ctx.fillStyle = '#bfe9ff'; ctx.fillRect(0, 0, 40, 16); ctx.fillStyle = '#9ccc4a'; ctx.fillRect(0, 16, 40, 8);
    ctx.fillStyle = '#3a2446'; ctx.fillRect(23, 9, 10, 9); ctx.fillStyle = '#ff8a3d'; ctx.fillRect(24, 10, 8, 7);
  } });
  if (!Reino.ilustracao('teste4-larga')) Reino.registrarIlustracao('teste4-larga', { w: 200, h: 30, desenhar: function (ctx) {
    ctx.fillStyle = '#bfe9ff'; ctx.fillRect(0, 0, 200, 30); ctx.fillStyle = '#3a2446'; ctx.fillRect(10, 10, 180, 10);
  } });
  var gato = 'Era uma vez um velho moleiro que tinha três filhos. Quando ele morreu, deixou para o mais velho o moinho, para o do meio o burro e para o mais novo apenas um gato. O rapaz ficou muito triste e pensou que não teria como viver. Então o gato falou com ele, bem baixinho, e pediu um saco e um par de botas. O rapaz achou estranho, mas fez o que o gato pediu. Com as botas nos pés e o saco nas costas, o gato foi para o campo, caçou um coelho e levou o presente ao rei, dizendo que era do seu amo.';
  function carta(id, e, titulo, livro, pagina, capitulo, blocos) { return { id: id, e: e, titulo: titulo, livroOrigem: livro, pagina: pagina, capitulo: capitulo, blocos: blocos }; }
  var livro = [
    carta('teste4-a03', '🐱', 'O Gato de Botas – Parte 1 (1 de 2)', 'aprendizagem', 3, 10, [{ t: 'texto', texto: gato }]),
    carta('teste4-a04', '🐱', 'O Gato de Botas – Parte 2 (2 de 2)', 'aprendizagem', 4, 10, [
      { t: 'texto', texto: 'O rei ficou contente com o presente.' },
      { t: 'fala', quem: 'gato', texto: '— Meu amo, não se preocupe! Dê-me um saco e um par de botas.' },
      { t: 'fala', quem: 'rapaz', texto: '— É claro, meu gato!' },
      { t: 'ilustracao', id: 'teste4-cena', alt: 'O gato no campo.' },
      { t: 'ilustracao', id: 'teste4-larga', alt: 'Uma cena comprida.' },
      { t: 'fonte', texto: 'PERRAULT, Charles. O Gato de Botas. São Paulo: Editora de Teste, 2020.' }]),
    carta('teste4-a05', '🐟', 'Falta de sorte', 'aprendizagem', 5, 10, [
      { t: 'versos', versos: ['Pode ser um peixe', 'À noite nada no aquário', '', 'Pode ser um hamster', 'Que corre na rodinha', '', '', 'Pode ser um gato'] }]),
    carta('teste4-a06', '📝', 'Organizando o conhecimento', 'aprendizagem', 6, 10, [
      { t: 'quadro', titulo: 'ORGANIZANDO O CONHECIMENTO', texto: 'O conto tem começo, meio e fim.' },
      { t: 'lista', itens: [{ termo: 'Personagens', texto: 'são os seres que participam da história.' }, { texto: 'O tempo diz quando ela acontece.' }, { termo: 'Ótimo', texto: 'é muito bom.' }] },
      { t: 'figuras', itens: [{ img: '🐱', legenda: 'gato' }, { img: 'doc:rg', legenda: 'documento' }, { img: 'lp:sem-desenho', legenda: 'moinho' }] }]),
    carta('teste4-a07', '🔤', 'Masculino e feminino', 'aprendizagem', 7, 11, [
      { t: 'tabela', cab: ['Masculino', 'Feminino'], linhas: [['o alemão', 'a alemã'], ['o leão', 'a leoa']] },
      { t: 'tabela', cab: ['Palavra', 'Sílabas', 'Separação'], linhas: [['borboleta', '4', 'bor-bo-le-ta']] }]),
    carta('teste4-t02', '✏️', 'Conversa vai...', 'atividades', 2, 10, [
      { t: 'quadro', titulo: 'CONVERSA VAI...', itens: [{ texto: 'Você já leu um conto de fadas?' }] }]),
    carta('teste4-t03', '📒', 'Para ler', 'atividades', 3, 10, [{ t: 'texto', texto: 'Leia o texto com atenção.' }]),
  ];
  function sala(id, nome, emoji, livro, capitulo, paginas, cartas) {
    return { id: id, nome: nome, emoji: emoji, livroOrigem: livro, capitulo: capitulo, paginas: paginas, ordem: 'livro', cartas: cartas, intro: 'Vamos ler o livro!',
      desafios: [{ id: id + '-q1', tipo: 'escolha', livro: cartas[0], pergunta: 'Quem ganhou o gato?', opcoes: [{ t: 'O filho mais novo', ok: true }, { t: 'O rei' }], explica: 'O filho mais novo.' }] };
  }
  if (!Reino.materia('teste4')) Reino.materias.push({
    id: 'teste4', nome: 'Língua Portuguesa', nomeLivro: 'Livros de Língua Portuguesa', emoji: '✏️', cor: '#8e4fd6', bimestre: 4,
    livros: { aprendizagem: { nome: 'Livro de Aprendizagem', emoji: '📗' }, atividades: { nome: 'Livro de Atividades', emoji: '📒' } },
    lugar: { nome: 'Ala de Teste', artigo: 'a', dentro: 'museu' }, guia: 'Vamos ler os livros da escola!', unicornios: [], livro: livro,
    salas: [
      sala('teste4-10a1', 'O Gato de Botas', '🐱', 'aprendizagem', 10, 'pp. 3 a 6', ['teste4-a03', 'teste4-a04', 'teste4-a05', 'teste4-a06']),
      sala('teste4-10t1', 'Conversa sobre contos', '✏️', 'atividades', 10, 'pp. 2 e 3', ['teste4-t02', 'teste4-t03']),
      sala('teste4-11a1', 'Masculino e feminino', '🔤', 'aprendizagem', 11, 'p. 7', ['teste4-a07']),
    ] });
  return 'ok';
})()`;
// o que sai para o lado do conteúdo do painel (ou da tela de missão); a ilustração larga rola dentro do próprio quadro
const VAZA = `(function () {
  var cx = document.querySelector('#telas > .tela:last-child .painel-conteudo, #telas > .tela:last-child .missao-corpo'), r = [];
  var c = cx.getBoundingClientRect();
  cx.querySelectorAll('*').forEach(function (y) { var q = y.getBoundingClientRect(); if (!y.closest('.bloco-ilustracao > *') && q.width && (q.right > c.right + 1 || q.left < c.left - 1)) r.push((y.className || y.tagName) + ''); });
  if (document.documentElement.scrollWidth > innerWidth) r.push('página rola de lado');
  return r;
})()`;
// maiúsculas acentuadas desenhadas por cima (ui-desafios.css): o ::before e o ::after sem o recuo negativo do bloco
const ACENTOS = (sel) => `[...document.querySelectorAll(${JSON.stringify(sel + ' span.mai-acento')})].map(function (s) {
  return s.textContent + ' ' + getComputedStyle(s, '::before').textIndent + ' ' + getComputedStyle(s, '::after').textIndent; })`;
const texto = (sel) => `(document.querySelector(${JSON.stringify(sel)}) || {}).textContent`;
const tem = (sel) => `!!document.querySelector(${JSON.stringify(sel)})`;
const quantos = (sel) => `document.querySelectorAll(${JSON.stringify(sel)}).length`;
const fonte = (sel) => `getComputedStyle(document.querySelector(${JSON.stringify(sel)})).fontSize`;
// passa por todas as cartas do livro aberto, conferindo que nada vaza; devolve quantas
async function folhear(c, nome) {
  const n = await c.js(quantos('.livro-marca'));
  for (let i = 0; i < n; i++) {
    assert.deepStrictEqual(await c.js(VAZA), [], `${nome}: carta ${i + 1} sem vazar`);
    if (i < n - 1) await c.tocar('[aria-label="Próxima carta"]');
  }
  return n;
}

test('celular: os dois livros, os blocos da carta rica, abas por toque e teclado, ação de NPC e tela da matéria', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: pasta('celular') });
  try {
    assert.strictEqual(await c.js(MATERIA), 'ok');
    await c.js("void Reino.UI.abrirLivro(Reino.materia('teste4'))");
    await c.avancar(600);
    // abas: Aprendizagem escolhida; o índice e o "n de N" são do livro escolhido
    assert.strictEqual(await c.js(quantos('.livro-aba')), 2);
    assert.strictEqual(await c.js("document.querySelector('.livro-aba[aria-selected=true]').dataset.livro"), 'aprendizagem');
    assert.strictEqual(await c.js(quantos('.livro-marca')), 5);
    assert.strictEqual(await c.js(texto('.livro-pag')), '1 de 5');
    // cabeçalho: emoji do livro (ícone) + nome + página
    assert.ok(await c.js(tem('.livro-carta.carta-rica > .carta-livro > canvas')), 'ícone do livro no cabeçalho');
    assert.strictEqual(await c.js(texto('.carta-livro')), 'Livro de Aprendizagem • p.\u00a03');
    assert.ok(await c.js(tem('.livro-carta h3 .carta-titulo-emoji canvas')), 'ícone da carta na linha do título');
    assert.strictEqual(await c.js(quantos('.livro-carta > .livro-emoji')), 0);
    // título comprido do livro: no celular o curto, numa linha; o nome inteiro no aria-label
    assert.strictEqual(await c.js("document.querySelector('.painel-topo h2').getAttribute('aria-label')"), 'Livros de Língua Portuguesa');
    assert.strictEqual(await c.js("getComputedStyle(document.querySelector('.painel-topo .titulo-curto')).display === 'none' ? 'inteiro' : document.querySelector('.painel-topo .titulo-curto').textContent"), 'Meus Livros');
    // a carta de ~110 palavras rola no máximo cerca de meia tela
    const rola = await c.js("(function () { var p = document.querySelector('.tela-livro .painel-conteudo'); return (p.scrollHeight - p.clientHeight) / innerHeight; })()");
    assert.ok(rola <= 0.52, 'a carta longa rola ' + Math.round(rola * 100) + ' % da tela');
    assert.deepStrictEqual(await c.js("[Reino._ui.livroEscolar({ livros: { x: { nome: 'Livro de X', emoji: '📗', curto: 'XX' } } }, 'x').curto, Reino._ui.livroEscolar({ livros: { x: { nome: 'Livro de X', emoji: '📗' } } }, 'x').curto]"), ['XX', 'X']);
    // carta 2: texto, fala (travessão em destaque, uma vez só), ilustração em escala inteira e par, fonte em 12 px
    await c.tocar('[aria-label="Próxima carta"]');
    assert.strictEqual(await c.js(texto('.bloco-fala .fala-travessao')), '—');
    assert.ok(!(await c.js("document.querySelector('.bloco-fala').textContent.slice(1)")).includes('—'), 'o travessão do texto não repete');
    assert.strictEqual(await c.js("document.querySelector('.bloco-fala').dataset.quem"), 'gato');
    assert.deepStrictEqual(await c.js(ACENTOS('.bloco-fala')), ['É 0px 0px'], 'o "É" da fala no lugar');
    const ilu = await c.js(`[...document.querySelectorAll('.bloco-ilustracao')].map(function (cx) { var cv = cx.querySelector('canvas');
      return { w: parseFloat(cv.style.width), h: parseFloat(cv.style.height), caixa: cx.clientWidth, rola: cx.scrollWidth > cx.clientWidth, alt: cx.getAttribute('aria-label') }; })`);
    assert.deepStrictEqual(ilu[0], { w: 240, h: 144, caixa: ilu[0].caixa, rola: false, alt: 'O gato no campo.' }, 'cena pequena em 6×');
    assert.deepStrictEqual(ilu[1], { w: 400, h: 60, caixa: ilu[1].caixa, rola: true, alt: 'Uma cena comprida.' }, 'a larga em 2×, rolando de lado no quadro');
    assert.deepStrictEqual(await c.js(VAZA), [], 'a página não rola de lado');
    assert.strictEqual(await c.js(fonte('.bloco-fonte')), '12px');
    // carta 3: versos em 3 estrofes ('' separa; dois seguidos não abrem estrofe vazia)
    await c.tocar('[aria-label="Próxima carta"]');
    assert.strictEqual(await c.js(quantos('.bloco-versos .estrofe')), 3);
    assert.strictEqual(await c.js(quantos('.bloco-versos .verso')), 5);
    assert.deepStrictEqual(await c.js(ACENTOS('.verso')), ['À 0px 0px'], 'o "À" do verso no lugar');
    // carta 4: quadro com título, lista com o termo em destaque, figuras num quadro de 64 px, escala par (16×16 em 4×), com legenda (sem desenho: ❓)
    await c.tocar('[aria-label="Próxima carta"]');
    assert.strictEqual(await c.js(texto('.bloco-quadro .quadro-titulo')), 'ORGANIZANDO O CONHECIMENTO');
    assert.strictEqual(await c.js(quantos('.bloco-lista .lista-termo')), 2);
    assert.deepStrictEqual(await c.js(ACENTOS('.bloco-lista li')), ['Ó 0px 0px'], 'o "Ó" da lista no lugar');
    assert.strictEqual(await c.js(quantos('.bloco-figura canvas')), 3);
    assert.deepStrictEqual(await c.js("[...document.querySelectorAll('.bloco-figura canvas')].map(function (x) { return x.style.width; })"), ['64px', '64px', '64px']);
    assert.strictEqual(await c.js(fonte('.bloco-figura figcaption')), '12px');
    // carta 5: tabela de 2 colunas em grade; a de 3 colunas vira caixinhas com o cabeçalho em cada valor
    await c.tocar('[aria-label="Próxima carta"]');
    assert.strictEqual(await c.js(quantos('.bloco-tabela')), 2);
    assert.strictEqual(await c.js("getComputedStyle(document.querySelector('.bloco-tabela:not(.tabela-larga)')).display"), 'table');
    assert.strictEqual(await c.js("getComputedStyle(document.querySelector('.tabela-larga')).display"), 'block');
    assert.strictEqual(await c.js("getComputedStyle(document.querySelector('.tabela-larga td'), '::before').content"), '"Palavra: "');
    assert.strictEqual(await c.js(texto('.livro-pag')), '5 de 5');
    // toque na aba: o outro livro, do começo, com o seu índice
    await c.tocar('.livro-aba[data-livro="atividades"]');
    assert.strictEqual(await c.js(quantos('.livro-marca')), 2);
    assert.strictEqual(await c.js(texto('.livro-pag')), '1 de 2');
    assert.strictEqual(await c.js(texto('.carta-livro')), 'Livro de Atividades • p.\u00a02');
    assert.deepStrictEqual(await c.js(VAZA), [], 'livro de atividades sem vazar');
    // teclado: Tab chega às abas, Enter troca de livro (volta à carta em que estava), → e ← passam de uma à outra
    for (let i = 0; i < 6 && !(await c.js("document.activeElement.classList.contains('livro-aba')")); i++) await c.tecla('Tab');
    assert.strictEqual(await c.js('document.activeElement.dataset.livro'), 'aprendizagem', 'Tab chega nas abas');
    await c.tecla('Enter');
    assert.strictEqual(await c.js("document.activeElement.dataset.livro + ' ' + document.activeElement.getAttribute('aria-selected')"), 'aprendizagem true');
    assert.strictEqual(await c.js(texto('.livro-pag')), '5 de 5', 'voltou à carta em que estava');
    await c.tecla('ArrowRight');
    assert.strictEqual(await c.js("document.activeElement.dataset.livro + ' ' + document.activeElement.getAttribute('aria-selected')"), 'atividades true');
    await c.tecla('ArrowLeft');
    assert.strictEqual(await c.js("document.activeElement.dataset.livro + ' ' + document.activeElement.getAttribute('aria-selected')"), 'aprendizagem true');
    await c.tecla('ArrowRight');
    await c.tecla('Tab');   // da aba Atividades para a 1ª marca
    assert.ok(await c.js("document.activeElement.classList.contains('livro-marca')"), 'Tab chega nas marcas');
    await c.tecla('Tab');   // a 2ª marca
    await c.tecla('Enter');
    assert.strictEqual(await c.js(texto('.livro-pag')), '2 de 2', 'Enter na marca abre a carta');
    await c.tecla('Escape');
    assert.strictEqual(await c.js('Reino.UI.temTela()'), false, 'Esc fecha');

    // abrir por uma carta abre no livro dela; o livro pedido (ação de NPC ou objeto) abre nele
    await c.js("void Reino.UI.abrirLivro(Reino.materia('teste4'), 'teste4-t03')");
    await c.avancar(400);
    assert.strictEqual(await c.js("document.querySelector('.livro-aba[aria-selected=true]').dataset.livro + ' ' + document.querySelector('.livro-pag').textContent"), 'atividades 2 de 2');
    await c.js('Reino.UI.fecharTodas()');
    await c.js("void Reino.NPCs.executar({ tipo: 'tela', tela: 'livro', materia: 'teste4', livro: 'atividades' }, {})");
    await c.avancar(600);
    assert.strictEqual(await c.js("document.querySelector('.livro-aba[aria-selected=true]').dataset.livro"), 'atividades', 'ação de NPC abre no livro pedido');
    await c.js('Reino.UI.fecharTodas()');

    // tela da matéria: um título por capítulo e livro, o livro de cada sala no cartão
    await c.js("void Reino.UI.telaMateria(Reino.materia('teste4'))");
    await c.avancar(600);
    assert.deepStrictEqual(await c.js("[...document.querySelectorAll('.materia-grupo')].map(function (g) { return g.textContent; })"),
      ['Capítulo 10 •  Aprendizagem', 'Capítulo 10 •  Atividades', 'Capítulo 11 •  Aprendizagem']);
    assert.strictEqual(await c.js(quantos('.materia-grupo canvas')), 3, 'ícone do livro em cada grupo');
    assert.strictEqual(await c.js("getComputedStyle(document.querySelector('.materia-grupo .grupo-sep')).display"), 'none', 'no celular sem o "•"');
    assert.match(await c.js("document.querySelectorAll('.lista-materia .sala-card')[1].getAttribute('aria-label')"), /^2\. Conversa sobre contos, nova, .*, Livro de Atividades pp\. 2 e 3, entrar$/);
    assert.ok(await c.js("!!document.querySelector('.lista-materia .sala-card small canvas')"), 'ícone do livro nas páginas');
    assert.deepStrictEqual(await c.js(VAZA), [], 'tela da matéria sem vazar');
    // com a 1ª sala feita, o "✨ Próxima!" vai para a 2ª
    await c.js("Reino.UI.fecharTodas(); Reino.Progresso.estado().salas['teste4-10a1'] = { feita: true }; void Reino.UI.telaMateria(Reino.materia('teste4'))");
    await c.avancar(600);
    assert.strictEqual(await c.js("[...document.querySelectorAll('.lista-materia .sala-card')].findIndex(function (b) { return b.classList.contains('proxima'); })"), 1);
    await c.js('Reino.UI.fecharTodas()');

    // resumo da missão: as cartas da sala com o cabeçalho do livro
    await c.js("void Reino.Missao.iniciar(Reino.materia('teste4'), Reino.materia('teste4').salas[0])");
    await c.avancar(1500);
    await c.tocar('.btn-principal');
    assert.strictEqual(await c.js(texto('.resumo-sala .carta-livro')), 'Livro de Aprendizagem • p.\u00a03');
    assert.deepStrictEqual(await c.js(VAZA), [], 'resumo sem vazar');
    assert.deepStrictEqual(c.erros, [], 'sem erro de console');
  } finally { await c.fechar(); }
});

for (const tamanho of ['tablet', 'notebook']) {
  test(`${tamanho}: as cartas ricas e as abas sem vazar, a ilustração em escala inteira`, async () => {
    const c = await abrirCenario({ save: 'completo', tamanho, pasta: pasta(tamanho) });
    try {
      await c.js(MATERIA);
      await c.js("void Reino.UI.abrirLivro(Reino.materia('teste4'))");
      await c.avancar(600);
      assert.notStrictEqual(await c.js("getComputedStyle(document.querySelector('.livro-aba:not([aria-selected=true]) .livro-aba-nome')).display"), 'none', 'as duas abas com o nome');
      assert.strictEqual(await folhear(c, 'aprendizagem'), 5);
      await c.tocar('.livro-aba[data-livro="atividades"]');
      assert.strictEqual(await folhear(c, 'atividades'), 2);
      await c.js("Reino.UI.fecharTodas(); void Reino.UI.abrirLivro(Reino.materia('teste4'), 'teste4-a04')");
      await c.avancar(600);
      assert.deepStrictEqual(await c.js("[...document.querySelectorAll('.bloco-ilustracao canvas')].map(function (x) { return x.style.width; })"), ['240px', '400px'], 'escala par, até 6×');
      assert.deepStrictEqual(await c.js(VAZA), [], 'ilustrações sem vazar');
      assert.strictEqual(await c.js(quantos('.tabela-larga')), 0, 'a tabela só vira caixinhas no celular');
      await c.js("Reino.UI.fecharTodas(); void Reino.UI.telaMateria(Reino.materia('teste4'))");
      await c.avancar(600);
      assert.notStrictEqual(await c.js("getComputedStyle(document.querySelector('.materia-grupo .grupo-sep')).display"), 'none');
      assert.deepStrictEqual(await c.js(VAZA), [], 'tela da matéria sem vazar');
      assert.deepStrictEqual(c.erros, [], 'sem erro de console');
    } finally { await c.fechar(); }
  });
}

test('matérias antigas: livro sem abas nem cabeçalho, tela da matéria sem grupos', async () => {
  const c = await Historico.abrirCenario({ save: 'completo', tamanho: 'celular', pasta: pasta('antigas') });
  try {
    const r = await c.js(`(function () {
      var out = [];
      // só as do 3º bimestre (a fixture mantém as do 4º, que têm os livros da escola)
      Reino.materias.filter(function (m) { return !m.livros; }).forEach(function (m) {
        Reino.UI.fecharTodas(); Reino.UI.abrirLivro(m);
        out.push(m.id + ' livro ' + [document.querySelectorAll('.livro-aba').length, document.querySelectorAll('.carta-rica, .carta-livro').length, document.querySelectorAll('.livro-carta > .livro-emoji').length].join(','));
        Reino.UI.fecharTodas(); Reino.UI.telaMateria(m);
        var b = document.querySelector('.lista-materia .sala-card');
        out.push(m.id + ' matéria ' + document.querySelectorAll('.materia-grupo').length + ' ' + /, apostila /.test(b.getAttribute('aria-label')));
      });
      Reino.UI.fecharTodas();
      return out;
    })()`);
    assert.ok(r.length >= 12, 'as matérias do 3º bimestre');
    r.forEach((linha) => assert.match(linha, / (livro 0,0,1|matéria 0 true)$/, linha));
    assert.deepStrictEqual(c.erros, [], 'sem erro de console');
  } finally { await c.fechar(); }
});
