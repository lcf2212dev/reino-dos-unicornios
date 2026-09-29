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
    // onde ela chegou: cada conversa sai daqui, com o tile que o toque no NPC escolheria (cena.alvoEm)
    const chegada = await page.evaluate(() => Jogador.tile());
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
      await page.evaluate(([id, npcId, chegada]) => {
        var cena = Reino.Cena.atual(), def = Reino.Interiores.def(id);
        var npc = cena.npcs().find((n) => n.id === npcId);
        Jogador.posicionar(chegada.x, chegada.y);
        // toque no meio do corpo do NPC (px do jogo); se o toque não fosse dele, fica logo abaixo
        var alvo = cena.alvoEm(npc.x * 16 + 8, npc.y * 16 + 4);
        if (alvo && alvo.tipo === 'npc' && alvo.npc === npc) { Jogador.posicionar(alvo.tile.x, alvo.tile.y); Jogador.virar(alvo.olhar.x, alvo.olhar.y); }
        else Jogador.posicionar(npc.x, Math.min(npc.y + 1, cena.altura() / 16 - 1));
        Reino.NPCs.interagir(npc, { interior: def, cena: cena });
      }, [d.id, npcId, chegada]);
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
  ['album-ets', 'Reino.UI.telaAlbumETs && Reino.UI.telaAlbumETs()'],
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

// uma questão na tela de verdade (Reino.Provas / Reino.Missao: título, faixa "Valendo", pontos, "← Anterior"),
// sem responder as anteriores. Prova: começa (ritual pulado) e anda até a questão i com as anteriores dadas por
// prontas (o render delas é embrulhado só aqui); a pressa do "Próxima" pede um 2º toque, como no jogo.
// Missão: o sorteio da sala põe o desafio pedido em 1º; passa pela introdução e pelo resumo.
async function mostrarDesafio(page, modo, ref) {
  await page.evaluate(async ([modo, ref]) => {
    var D = Reino.Desafios, P = Reino.Progresso;
    if (modo === 'prova') {
      var prova = Reino.prova(ref.prova), render = D.render, ritual = Reino.Prova.ritual, visto = P.estado().ritualVisto, feitos = 0;
      D.render = function (d, o) {
        var c = render.call(D, d, o);
        if (feitos++ < ref.i) c.pronto = function () { return true; };
        return c;
      };
      Reino.Prova.ritual = function () { return Promise.resolve(); };
      try {
        Reino.Provas.iniciar(prova);
        [...document.querySelectorAll('.tela-prova .btn-principal')].pop().click();
        await Promise.resolve(); await Promise.resolve();
        var num = () => (document.querySelector('.tela-prova .desafio-num') || {}).textContent || '';
        for (var k = 0; k < ref.i; k++) {
          var antes = num();
          for (var t = 0; t < 3 && num() === antes; t++) {
            var prox = document.querySelector('.tela-prova .prova-rodape .btn-principal');
            prox.disabled = false; prox.click();
          }
          if (num() === antes) throw new Error('prova ' + ref.prova + ': não passou da questão ' + (k + 1));
        }
      } finally {
        D.render = render; Reino.Prova.ritual = ritual;
        // o "ritual visto" que a prova marcou volta ao que era (as fotos seguintes são as de antes)
        if (P.estado().ritualVisto !== visto) { P.estado().ritualVisto = visto; P.salvar(); }
      }
      return;
    }
    var mt = Reino.materia(ref.m), sala = mt.salas.find((x) => x.id === ref.s), alvo = sala.desafios[ref.i], sortear = D.sortear;
    D.sortear = function (s, n) {
      var l = sortear.call(D, s, n);
      return [alvo].concat(l.filter((d) => d !== alvo)).slice(0, Math.max(1, l.length));
    };
    try { Reino.Missao.iniciar(mt, sala); } finally { D.sortear = sortear; }
    document.querySelector('.tela-missao .intro-botoes .btn-principal').click();
    for (var j = 0; j < 40 && document.querySelector('.resumo-sala'); j++) document.querySelector('.resumo-botoes .btn-principal').click();
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
