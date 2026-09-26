// Testes de referência da refatoração: captura o comportamento do jogo e compara duas capturas.
// Tudo roda no servidor de TESTE (porta livre, banco em /tmp) e no modo determinístico
// (?debug=1&congelar=1, js/congelar.js). Saves sintéticos (ferramentas/testes/saves.js).
//
// Uso:
//   node ferramentas/testes/referencias.js capturar <saida> [--raiz <pasta jogo>] [--so dados,imagens,desempenho,vozes] [--tamanhos celular,tablet]
//   node ferramentas/testes/referencias.js comparar <referencia> <nova> [--desempenho]
// Saída: <saida>/dados/*.json, <saida>/imagens/<tamanho>/*.png, <saida>/desempenho.json, <saida>/vozes.json
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { iniciar } = require('./servidor-teste');
const { abrir, lancar, TAMANHOS } = require('./navegador');
const { gerarSaves } = require('./saves');

/* ---------- JSON estável: chaves em ordem e funções marcadas ---------- */
function estavel(v, vistos = new Set()) {
  if (typeof v === 'function') return 'ƒ';
  if (v === undefined) return null;
  if (!v || typeof v !== 'object') return v;
  if (vistos.has(v)) return '↺';
  vistos.add(v);
  let r;
  if (Array.isArray(v)) r = v.map((x) => estavel(x, vistos));
  else { r = {}; Object.keys(v).sort().forEach((k) => { if (v[k] !== undefined) r[k] = estavel(v[k], vistos); }); }
  vistos.delete(v);
  return r;
}
const gravarJson = (arq, v) => { fs.mkdirSync(path.dirname(arq), { recursive: true }); fs.writeFileSync(arq, JSON.stringify(estavel(v), null, 1) + '\n'); };

/* ---------- página no modo determinístico ---------- */
const avancar = (page, ms) => page.evaluate((m) => window.__congelar.avancar(m), ms);
// cada aba tem o SEU servidor de teste com banco novo: a sincronização de uma aba não vaza para outra
async function abrirJogo(browser, raiz, tamanho, save) {
  const servidor = await iniciar({ raiz });
  const { context, page } = await abrir({ browser, url: servidor.url, tamanho, save, query: '?debug=1&congelar=1' });
  context.on('close', () => servidor.parar());
  await page.waitForFunction(() => window.__congelar && window.__reino, null, { timeout: 30000 });
  // o progresso vem do servidor de teste (rede de verdade): anda o relógio até entrar no mapa
  for (let i = 0; i < 400; i++) {
    const pronto = await page.evaluate(() => {
      var hud = document.querySelector('#hud');
      return window.__reino.estado() === 'mapa' && hud && !hud.hidden;
    });
    if (pronto) break;
    await avancar(page, 50);
    await page.waitForTimeout(15);
  }
  await avancar(page, 1000);
  return { context, page };
}
async function foto(page, pasta, nome) {
  await avancar(page, 600);
  await page.evaluate(() => window.__congelar.respirar(8));
  fs.mkdirSync(pasta, { recursive: true });
  // 1ª captura só para cancelar as animações de CSS; a camada é refeita e a 2ª sai estável
  await page.screenshot({ animations: 'disabled', caret: 'hide' });
  await page.waitForTimeout(60);
  await page.screenshot({ path: path.join(pasta, nome + '.png'), animations: 'disabled', caret: 'hide' });
}
// fecha telas, balões e missões abertas (como os botões de fechar fariam)
async function limpar(page) {
  await page.evaluate(() => {
    try { Reino.Claude.limpar(); } catch (e) { /* sem balão */ }
    Reino.UI.fecharTodas();
    document.body.classList.remove('em-missao');
  });
  await avancar(page, 400);
  await page.evaluate(() => { Reino.UI.fecharTodas(); document.body.classList.remove('em-missao'); });
  await avancar(page, 200);
}

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

async function clicarBotao(page, seletor, texto) {
  await page.evaluate(([s, t]) => {
    var b = [...document.querySelectorAll(s)].filter((x) => !t || x.textContent.indexOf(t) >= 0).pop();
    if (b) b.click();
  }, [seletor, texto || '']);
}
async function sairComConfirmar(page) {
  await clicarBotao(page, '.btn-sair');
  await avancar(page, 400);
  await clicarBotao(page, 'button', 'Sair');
  await avancar(page, 600);
  await limpar(page);
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

/* ---------- dados ---------- */
async function capturarDados(browser, raiz, pasta) {
  const servidor = await iniciar({ raiz }), url = servidor.url;
  // 1) jogo novo, sem save: estadoNovo() completado, antes de qualquer toque
  let { context, page } = await abrir({ browser, url, tamanho: 'notebook', query: '?debug=1&congelar=1' });
  await page.waitForFunction(() => window.__congelar && window.Reino && Reino.Progresso && Reino.Progresso.estado(), null, { timeout: 30000 });
  const novo = await page.evaluate(() => Reino.util.copia(Reino.Progresso.estado()));
  gravarJson(path.join(pasta, 'save-estado-novo.json'), novo);
  const saves = await page.evaluate(`(${gerarSaves.toString()})()`);
  await context.close();

  // 2) com o save completo: conteúdo, mapa, interiores, elenco, loja, mescla
  ({ context, page } = await abrirJogo(browser, raiz, 'notebook', saves.completo));
  const d = await page.evaluate(() => {
    var R = Reino;
    var falas = R.Falas.todas().map((f) => ({ texto: f.texto, voz: f.voz, pacote: f.pacote }));
    var W = Mapa.largura() / 16, H = Mapa.altura() / 16, tiles = [];
    for (var y = 0; y < H; y++) { var linha = ''; for (var x = 0; x < W; x++) linha += Mapa.agua(x, y) ? 'a' : Mapa.solido(x, y) ? '#' : '.'; tiles.push(linha); }
    var interiores = R.interiores.map((def) => ({ def: def, grade: R.Interiores.grade(def) }));
    return {
      falas: falas,
      materias: R.materias, provas: R.provas,
      mapa: { W: W, H: H, tiles: tiles, lugares: Mapa.lugares(), clareiras: Mapa.CLAREIRAS, predios: Object.keys(Mapa.PREDIOS || {}), claude: typeof Mapa.claudeTile === 'function' ? Mapa.claudeTile() : Mapa.claudeTile },
      interiores: interiores,
      elenco: R.NPCs.ELENCO,
      loja: { itens: R.UI.ITENS_LOJA, lojaItens: R.LojaItens, comidas: R.config.comidas, config: R.config, unicornios: R.Unicornios.todos('lilas'), acessorios: R.Provas.acessorios() },
    };
  });
  // grade pode ter Uint8Array/objetos grandes: JSON puro já basta para comparar
  for (const [k, v] of Object.entries(d)) gravarJson(path.join(pasta, k + '.json'), JSON.parse(JSON.stringify(v)));

  // mescla: todos os pares do corpus (saves sintéticos + variações de borda), nos dois sentidos
  const mescla = await page.evaluate((saves) => {
    var P = Reino.Progresso, c = Reino.util.copia, T = 1790000000000;
    var corpus = Object.assign({}, saves);
    corpus.geracao2 = Object.assign(c(saves.inicio), { geracao: 2, atualizado: T - 99 * 3600000 });
    corpus.maisNovoVazio = Object.assign(c(saves.inicio), { atualizado: T + 3600000 });
    corpus.surpresaCarimbo = c(saves.completo); corpus.surpresaCarimbo.ajustes.surpresa = true; corpus.surpresaCarimbo.ajustes.surpresaEm = T - 1000;
    corpus.semCampos = { v: 1, geracao: 1, atualizado: T - 2 * 3600000, unis: { inicial: { em: T - 1, xp: 3, chocado: true } }, salas: { h1: { feita: T - 5, melhor: 2, vezes: 1 } } };
    corpus.lixo = { v: 1, geracao: 1, atualizado: T, estrelas: { ganhas: '7', gastas: null }, despensa: { cenoura: { compradas: -2, usadas: 'x' } }, cuidados: { inicial: { fome: 250, sede: -3, banho: 'a' } }, ajustes: { surpresa: 'false' } };
    corpus.cicloNovo = Object.assign(c(saves.avancado), { ciclo: 2, salas: {}, atualizado: T + 5 });
    var nomes = Object.keys(corpus), pares = {};
    nomes.forEach((a) => nomes.forEach((b) => {
      try { pares[a + '+' + b] = c(P.mesclar(c(corpus[a]), c(corpus[b]))); } catch (e) { pares[a + '+' + b] = 'ERRO: ' + e.message; }
    }));
    pares['null+completo'] = c(P.mesclar(null, c(corpus.completo)));
    pares['completo+null'] = c(P.mesclar(c(corpus.completo), null));
    // carregar(): completar() e normalizarNovos() sobre cada save do corpus (só na aba de teste)
    var carregados = {};
    nomes.forEach((n) => {
      localStorage.setItem(Reino.config.chaveSave, JSON.stringify(corpus[n]));
      try { carregados[n] = c(P.carregar()); } catch (e) { carregados[n] = 'ERRO: ' + e.message; }
    });
    return { corpus: corpus, pares: pares, carregados: carregados };
  }, saves);
  gravarJson(path.join(pasta, 'save-mescla.json'), mescla);
  await context.close();

  // 3) status de cada NPC de cada interior com cada save sintético
  const status = {};
  for (const [nome, save] of Object.entries(saves)) {
    ({ context, page } = await abrirJogo(browser, raiz, 'notebook', save));
    status[nome] = await page.evaluate(() => {
      var r = {};
      Reino.interiores.forEach((def) => {
        var cena = Reino.Interiores.cena(def.id);
        r[def.id] = (cena && cena.npcs ? cena.npcs() : []).map((n) => {
          var s = Reino.NPCs.status(n);
          return { id: n.id, x: n.x, y: n.y, status: s, falas: Reino.NPCs.falasPossiveis ? Reino.NPCs.falasPossiveis(n, def) : null };
        });
      });
      return JSON.parse(JSON.stringify(r));
    });
    await context.close();
  }
  gravarJson(path.join(pasta, 'npcs-status.json'), status);
  servidor.parar();
  return saves;
}

/* ---------- desempenho: tempo médio de quadro com a CPU 4× mais lenta ---------- */
async function capturarDesempenho(browser, raiz, saves, arq) {
  const servidor = await iniciar({ raiz }), url = servidor.url;
  const save = JSON.parse(JSON.stringify(saves.completo));
  save.ajustes.animacoes = true;   // o jogo de verdade, com animações
  const { context, page } = await abrir({ browser, url, tamanho: 'notebook', save, query: '?debug=1', reducedMotion: 'no-preference' });
  await page.waitForFunction(() => window.__reino && document.querySelector('.btn-comecar'), null, { timeout: 30000 });
  await page.click('.btn-comecar');
  await page.waitForFunction(() => window.__reino.estado() === 'mapa', null, { timeout: 30000 });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const medir = async () => {
    await page.waitForTimeout(1500);
    const v = [];
    for (let i = 0; i < 5; i++) { await page.waitForTimeout(700); v.push(await page.evaluate(() => window.__reino.tempoQuadro())); }
    v.sort((a, b) => a - b);
    return v[2];
  };
  const r = { mapa: await medir() };
  const ids = await page.evaluate(() => Reino.interiores.map((d) => d.id));
  for (const id of ids) {
    await page.evaluate((id) => { Reino.Cena.irPara(id); }, id);
    await page.waitForFunction(() => window.__reino.estado() === 'interior', null, { timeout: 20000 });
    r[id] = await medir();
  }
  await context.close();
  servidor.parar();
  gravarJson(arq, r);
}

/* ---------- vozes: hash de cada pacote ---------- */
function capturarVozes(raiz, arq) {
  const pasta = path.join(raiz, 'js', 'voz');
  const r = {};
  fs.readdirSync(pasta).filter((f) => f.endsWith('.js')).sort().forEach((f) => {
    r[f] = crypto.createHash('sha256').update(fs.readFileSync(path.join(pasta, f))).digest('hex');
  });
  gravarJson(arq, r);
}

async function capturar(saida, op) {
  const so = new Set((op.so || 'dados,imagens,vozes').split(','));
  const tamanhos = (op.tamanhos || Object.keys(TAMANHOS).join(',')).split(',');
  const raiz = path.resolve(op.raiz || path.join(__dirname, '..', '..'));
  const servidor = await iniciar({ raiz });
  const browser = await lancar();
  const erros = [];
  try {
    if (so.has('vozes')) capturarVozes(raiz, path.join(saida, 'vozes.json'));
    let saves = null;
    if (so.has('dados')) saves = await capturarDados(browser, raiz, path.join(saida, 'dados'));
    if (!saves) {
      const { context, page } = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
      await page.waitForFunction(() => window.Reino && Reino.Progresso && Reino.Progresso.estado(), null, { timeout: 30000 });
      saves = await page.evaluate(`(${gerarSaves.toString()})()`);
      await context.close();
    }
    if (so.has('imagens')) {
      await Promise.all(tamanhos.map(async (tamanho) => {
        const pasta = path.join(saida, 'imagens', tamanho);
        const grupos = [
          ['inicio', async (page) => foto(page, pasta, 'mapa-inicio')],
          ['avancado', async (page) => foto(page, pasta, 'mapa-avancado')],
          ['completo', (page) => cenasMapaEInteriores(page, pasta)],
          ['completo', (page) => cenasTelas(page, pasta)],
          ['completo', (page) => cenasSalas(page, pasta)],
          ['completo', (page) => cenasProvasEDesafios(page, pasta)],
        ];
        for (const [save, fn] of grupos) {
          const { context, page } = await abrirJogo(browser, raiz, tamanho, saves[save]);
          await fn(page);
          if (page.__erros.length) erros.push(`${tamanho}/${save}: ${page.__erros.join(' | ')}`);
          await context.close();
        }
      }));
    }
    if (so.has('desempenho')) await capturarDesempenho(browser, raiz, saves, path.join(saida, 'desempenho.json'));
  } finally {
    await browser.close();
    servidor.parar();
  }
  fs.writeFileSync(path.join(saida, 'erros.txt'), erros.join('\n') + (erros.length ? '\n' : ''));
  console.log(`✔ referências em ${saida}` + (erros.length ? ` (${erros.length} grupos com erro no console: veja erros.txt)` : ''));
}

/* ---------- comparação ---------- */
function listar(p) {
  if (!fs.existsSync(p)) return [];
  const r = [];
  (function andar(d, rel) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      if (e.isDirectory()) andar(path.join(d, e.name), path.join(rel, e.name));
      else r.push(path.join(rel, e.name));
    });
  })(p, '');
  return r.sort();
}
// Diferença de pixels. `ruido`: pixels que mudam no máximo RUIDO_CANAL em cada canal. O Chromium
// rasteriza elementos com transform: scale estático com ±1–3 de diferença entre execuções no
// celular (densidade 3), mesmo no modo determinístico (docs/decisoes/referencias-ruido.md).
// Até RUIDO_MAX pixels assim por imagem contam como ruído; qualquer outro pixel diferente reprova.
const RUIDO_CANAL = 4, RUIDO_MAX = 64;
function pixelsDiferentes(a, b) {
  const { PNG } = require('pngjs');
  const x = PNG.sync.read(a), y = PNG.sync.read(b);
  if (x.width !== y.width || x.height !== y.height) return { erro: `tamanho ${x.width}×${x.height} ≠ ${y.width}×${y.height}` };
  let forte = 0, ruido = 0;
  for (let i = 0; i < x.data.length; i += 4) {
    const m = Math.max(Math.abs(x.data[i] - y.data[i]), Math.abs(x.data[i + 1] - y.data[i + 1]), Math.abs(x.data[i + 2] - y.data[i + 2]), Math.abs(x.data[i + 3] - y.data[i + 3]));
    if (m > RUIDO_CANAL) forte++; else if (m > 0) ruido++;
  }
  return { forte, ruido };
}
function comparar(ref, nova, op) {
  const falhas = [], ruidos = [];
  const a = listar(ref).filter((f) => f !== 'desempenho.json' && f !== 'erros.txt');
  const b = new Set(listar(nova));
  a.forEach((f) => {
    if (!b.has(f)) return falhas.push(`falta ${f}`);
    const x = fs.readFileSync(path.join(ref, f)), y = fs.readFileSync(path.join(nova, f));
    if (x.equals(y)) return;
    if (f.endsWith('.png')) {
      const d = pixelsDiferentes(x, y);
      if (d.erro) falhas.push(`${f}: ${d.erro}`);
      else if (d.forte || d.ruido > RUIDO_MAX) falhas.push(`${f}: ${d.forte + d.ruido} pixels diferentes (${d.forte} fora do ruído)`);
      else ruidos.push(`${f}: ${d.ruido} pixels de ruído de antialiasing`);
    } else falhas.push(`${f}: conteúdo diferente (diff -u ${path.join(ref, f)} ${path.join(nova, f)})`);
  });
  listar(nova).forEach((f) => { if (!a.includes(f) && f !== 'desempenho.json' && f !== 'erros.txt') falhas.push(`novo (não existe na referência): ${f}`); });
  const errosNova = fs.existsSync(path.join(nova, 'erros.txt')) ? fs.readFileSync(path.join(nova, 'erros.txt'), 'utf8').trim() : '';
  const errosRef = fs.existsSync(path.join(ref, 'erros.txt')) ? fs.readFileSync(path.join(ref, 'erros.txt'), 'utf8').trim() : '';
  if (errosNova !== errosRef) falhas.push('erros de console diferentes da referência (erros.txt)');
  if (op.desempenho) {
    const x = JSON.parse(fs.readFileSync(path.join(ref, 'desempenho.json'), 'utf8'));
    const y = JSON.parse(fs.readFileSync(path.join(nova, 'desempenho.json'), 'utf8'));
    Object.keys(x).forEach((k) => {
      const lim = x[k] * 1.05;
      const ok = y[k] <= lim;
      console.log(`  ${ok ? '✔' : '✘'} ${k}: ${x[k].toFixed(3)} → ${y[k].toFixed(3)} ms`);
      if (!ok) falhas.push(`desempenho ${k}: ${y[k].toFixed(3)} ms > ${lim.toFixed(3)} ms (referência + 5%)`);
    });
  }
  const total = a.length;
  if (!total) falhas.push(`referência vazia: ${ref}`);
  if (falhas.length) {
    console.log(`✘ ${falhas.length} diferença(s) em ${total} arquivos:`);
    falhas.slice(0, 200).forEach((f) => console.log('  ' + f));
    return false;
  }
  console.log(`✔ idêntico à referência (${total} arquivos)` + (ruidos.length ? `; ${ruidos.length} imagens só com ruído de antialiasing (≤${RUIDO_CANAL} por canal)` : ''));
  return true;
}

module.exports = { capturar, comparar, estavel };

if (require.main === module) {
  const [cmd, a, b] = process.argv.slice(2);
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  if (cmd === 'capturar' && a) {
    capturar(path.resolve(a), { raiz: arg('--raiz'), so: arg('--so'), tamanhos: arg('--tamanhos') }).catch((e) => { console.error(e); process.exit(1); });
  } else if (cmd === 'comparar' && a && b) {
    process.exit(comparar(path.resolve(a), path.resolve(b), { desempenho: process.argv.includes('--desempenho') }) ? 0 : 1);
  } else {
    console.log('Uso: referencias.js capturar <saida> [--raiz <jogo>] [--so dados,imagens,vozes,desempenho] [--tamanhos celular,tablet,notebook]\n     referencias.js comparar <referencia> <nova> [--desempenho]');
    process.exit(2);
  }
}
