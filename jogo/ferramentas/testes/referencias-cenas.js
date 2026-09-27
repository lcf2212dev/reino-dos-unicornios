// Referências — as cenas fotografadas (imagens/<tamanho>/*.png): mapa, interiores, cômodos, NPCs,
// telas, salas, treinos, provas e um desafio de cada tipo. Cada função recebe a página já no mapa.
const { avancar, foto, limpar, clicarBotao, sairComConfirmar } = require('./referencias-pagina');

/* ---------- cenas ---------- */
async function cenasMapaEInteriores(page, pasta) {
  await foto(page, pasta, 'mapa');
  const defs = await page.evaluate(() => Reino.interiores.map((d) => ({ id: d.id, comodos: (d.comodos || []).map((c) => ({ id: c.id, rect: c.rect })) })));
  for (const d of defs) {
    await page.evaluate((id) => { Reino.Cena.irPara(id); }, d.id);
    await avancar(page, 2500);
    await foto(page, pasta, `interior-${d.id}`);
    for (const c of d.comodos) {
      await page.evaluate(([id, c]) => {
        var cena = Reino.Cena.atual();
        var x = c.rect.x + Math.floor(c.rect.w / 2), y = c.rect.y + Math.floor(c.rect.h / 2);
        var p = cena.solido(x, y) ? cena.maisPerto(x, y, Jogador.tile()) : { x: x, y: y };
        if (p) { Jogador.posicionar(p.x, p.y); Jogador.virar(0, 1); }
      }, [d.id, c]);
      await foto(page, pasta, `comodo-${d.id}-${c.id}`);
    }
    const npcs = await page.evaluate(() => (Reino.Cena.atual().npcs ? Reino.Cena.atual().npcs() : []).map((n) => n.id));
    for (const npcId of npcs) {
      await page.evaluate(([id, npcId]) => {
        var cena = Reino.Cena.atual(), def = Reino.Interiores.def(id);
        var npc = cena.npcs().find((n) => n.id === npcId);
        Jogador.posicionar(npc.x, Math.min(npc.y + 1, cena.altura() / 16 - 1));
        Reino.NPCs.interagir(npc, { interior: def, cena: cena });
      }, [d.id, npcId]);
      await avancar(page, 1200);
      await foto(page, pasta, `npc-${d.id}-${npcId}`);
      await limpar(page);
    }
  }
  await page.evaluate(() => { Reino.Cena.sair(); });
  await avancar(page, 2500);
}

const TELAS = [
  ['loja', 'Reino.UI.telaLoja()'], ['estabulo', 'Reino.UI.telaEstabulo()'], ['bau', 'Reino.UI.telaBau()'],
  ['ajustes', 'Reino.UI.telaAjustes()'], ['pais', 'Reino.UI.telaPais()'], ['lugares', 'Reino.UI.telaLugares()'],
  ['petshop', 'Reino.UI.telaPetShop()'], ['album', 'Reino.Fotos && Reino.Fotos.abrirAlbum()'],
  ['castelo', 'Reino.UI.telaCastelo()'], ['plano', 'Reino.UI.telaPlano()'], ['aparencia', 'Reino.UI.telaAparencia(false)'],
  ['escola', 'Reino.Provas.telaEscola()'],
  // viagem de foguete (docs/contratos/viagem.md): o painel e o voo na contagem (a base antiga não tem: guarda)
  ['foguete', 'Reino.UI.telaFoguete && Reino.UI.telaFoguete()'],
  ['voo', "Reino.Voo && Reino.Voo.iniciar({ planeta: Reino.Viagem.planeta('lua') })"],
];
async function cenasTelas(page, pasta) {
  for (const [nome, js] of TELAS) {
    await page.evaluate((js) => { (0, eval)(js); }, js);
    await foto(page, pasta, `tela-${nome}`);
    if (nome === 'pais') {
      // PIN dos pais (de config.js) tocado no teclado da tela
      await page.evaluate(() => {
        var teclas = [...document.querySelectorAll('.pin-tecla')];
        String(Reino.config.pinPais).split('').concat(['OK']).forEach((k) => teclas.find((b) => b.textContent === k).click());
      });
      await foto(page, pasta, 'tela-pais-aberta');
    }
    await limpar(page);
  }
  const materias = await page.evaluate(() => Reino.materias.map((m) => m.id));
  for (const id of materias) {
    await page.evaluate((id) => Reino.UI.telaMateria(Reino.materia(id)), id);
    await foto(page, pasta, `tela-materia-${id}`);
    await limpar(page);
    await page.evaluate((id) => Reino.UI.abrirLivro(Reino.materia(id)), id);
    await foto(page, pasta, `tela-livro-${id}`);
    await limpar(page);
  }
}

async function cenasSalas(page, pasta) {
  const salas = await page.evaluate(() => {
    var l = [];
    Reino.materias.forEach((m) => m.salas.forEach((s) => l.push([m.id, s.id])));
    return l;
  });
  for (const [m, s] of salas) {
    await page.evaluate(([m, s]) => { var mt = Reino.materia(m); Reino.Missao.iniciar(mt, mt.salas.find((x) => x.id === s)); }, [m, s]);
    await foto(page, pasta, `sala-${s}-intro`);
    await clicarBotao(page, '.intro-botoes .btn-principal');
    // o resumo (cartas do livro da sala) vem antes das questões: fotografa a 1ª carta e passa por todas
    if (await page.evaluate(() => !!document.querySelector('.resumo-sala'))) await foto(page, pasta, `sala-${s}-resumo`);
    for (let k = 0; k < 40 && await page.evaluate(() => !!document.querySelector('.resumo-sala')); k++) {
      await clicarBotao(page, '.resumo-botoes .btn-principal');
    }
    await foto(page, pasta, `sala-${s}-desafio1`);
    await sairComConfirmar(page);
  }
  const materias = await page.evaluate(() => Reino.materias.map((m) => m.id));
  for (const m of materias) {
    await page.evaluate((m) => { Reino.Prova.iniciar(Reino.materia(m)); }, m);
    await avancar(page, 3000);
    await foto(page, pasta, `treino-${m}`);
    await sairComConfirmar(page);
  }
}

// uma questão numa tela igual à da prova/missão (mesma estrutura e classes), sem responder as anteriores
async function mostrarDesafio(page, modo, ref) {
  await page.evaluate(([modo, ref]) => {
    var U = Reino.util, el = U.el, D = Reino.Desafios;
    var d = ref.prova ? Reino.prova(ref.prova).questoes[ref.i] : Reino.materia(ref.m).salas.find((s) => s.id === ref.s).desafios[ref.i];
    var tela = Reino.UI.abrirTela(modo === 'prova' ? 'prova' : 'missao');
    var corpo = el('div.missao-corpo');
    var rodape = el('footer.missao-rodape' + (modo === 'prova' ? '.prova-rodape' : ''));
    tela.appendChild(el('header.missao-topo', el('button.btn-icone.btn-sair', { type: 'button' }, '✕'), el('div.missao-titulo', el('span', 'Referência'))));
    tela.appendChild(corpo); tela.appendChild(rodape);
    document.body.classList.add('em-missao');
    var ordem = d.opcoes ? d.opcoes.map((_, i) => i) : null;
    var monte = ordem;
    if (d.tipo === 'ordenar' || d.tipo === 'frase') monte = (d.blocos || d.itens).map((_, i) => i).reverse();
    if (d.tipo === 'copiar') monte = d.itens.map((it) => D.ordemPecasCopiar(it));
    var ctrl = D.render(d, { modo: modo, ordem: modo === 'prova' ? monte : ordem, monte: monte, onMudar: function () {}, onCompleto: function () {} });
    corpo.appendChild(el('div.desafio-num', 'Questão ' + (ref.i + 1)));
    corpo.appendChild(ctrl.card);
    rodape.appendChild(el('span.sem-relogio', '⏳ Sem relógio'));
    rodape.appendChild(el('button.btn-grande.btn-principal', { type: 'button' }, 'Próxima →'));
  }, [modo, ref]);
}

async function cenasProvasEDesafios(page, pasta) {
  const provas = await page.evaluate(() => Reino.provas.map((p) => ({ id: p.id, n: p.questoes.length })));
  for (const p of provas) {
    await page.evaluate((id) => { Reino.Provas.iniciar(Reino.prova(id)); }, p.id);
    await foto(page, pasta, `prova-${p.id}-capa`);
    await clicarBotao(page, '.btn-principal', 'Começar');
    await avancar(page, 3000);
    await foto(page, pasta, `prova-${p.id}-inicio`);
    await sairComConfirmar(page);
    for (let i = 0; i < p.n; i++) {
      await mostrarDesafio(page, 'prova', { prova: p.id, i });
      await foto(page, pasta, `prova-${p.id}-q${String(i + 1).padStart(2, '0')}`);
      await limpar(page);
    }
  }
  // um desafio de cada tipo das salas
  const tipos = await page.evaluate(() => {
    var vistos = {};
    Reino.materias.forEach((m) => m.salas.forEach((s) => s.desafios.forEach((d, i) => { if (!vistos[d.tipo]) vistos[d.tipo] = { m: m.id, s: s.id, i: i }; })));
    return vistos;
  });
  for (const [tipo, ref] of Object.entries(tipos)) {
    await mostrarDesafio(page, 'missao', ref);
    await foto(page, pasta, `desafio-${tipo}`);
    await limpar(page);
  }
}

module.exports = { cenasMapaEInteriores, cenasTelas, cenasSalas, cenasProvasEDesafios, mostrarDesafio };
