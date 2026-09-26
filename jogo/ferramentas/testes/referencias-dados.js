// Referências — dados (dados/*.json: conteúdo, mapa, interiores, elenco, loja, save e mescla, status
// dos NPCs), desempenho (desempenho.json) e vozes (vozes.json: hash de cada pacote js/voz/*.js).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { iniciar } = require('./servidor-teste');
const { abrir } = require('./navegador');
const { gerarSaves } = require('./saves');
const { gravarJson, abrirJogo } = require('./referencias-pagina');

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
// Tempo real (fora do modo determinístico): serve de registro, mas é ruidoso (A/A de até 17%).
// Para decidir se ficou mais lento, use desempenho.js (A/B intercalado, ruído A/A ≤ 1,6%) ou e2e.js --desempenho.
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

module.exports = { capturarDados, capturarDesempenho, capturarVozes };
