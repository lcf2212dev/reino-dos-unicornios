// Cenário: abre o jogo num servidor de TESTE novo (banco novo), com save SINTÉTICO composto, e deixa
// um agente ir a um lugar, abrir uma tela, tocar, rodar código e fotografar com poucas linhas.
//   const { abrirCenario } = require('./cenario');
//   const c = await abrirCenario({ save: 'completo', estrelas: 500, tamanho: 'celular' });
//   await c.ir('petshop'); await c.tela('loja'); await c.foto('loja', { recorte: [0, 0, 200, 100], ampliar: 4 });
//   console.log(await c.estado(), c.erros); await c.fechar();
// Congelado por padrão (?debug=1&congelar=1: relógio só anda com c.avancar); `congelar: false` = jogo vivo.
// Um servidor e um banco por cenário: o servidor mescla ajustes entre abas e daria falhas falsas.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const { iniciar } = require('./servidor-teste');
const { abrir, lancar, TAMANHOS } = require('./navegador');
const { gerarSaves } = require('./saves');
const { comporSave } = require('./saves-compor');
const { PASTA_TESTES } = require('./guardas');
// o avancar do e2e: congelado, pula a pintura dos passos intermediários (e espera os pacotes de voz)
const { avancar: avancarSemPintura } = require('./referencias-pagina');
const { mostrarDesafio } = require('./referencias-cenas');
const { telaEspecial } = require('./cenario-telas');
const { arrastar, segurar } = require('./cenario-ponteiro');

const PASTA_VER = path.join(PASTA_TESTES, 'ver');

// telas por cima do mapa (as mesmas do e2e, referencias-cenas.js)
const TELAS = {
  loja: 'Reino.UI.telaLoja()', estabulo: 'Reino.UI.telaEstabulo()', bau: 'Reino.UI.telaBau()',
  ajustes: 'Reino.UI.telaAjustes()', pais: 'Reino.UI.telaPais()', lugares: 'Reino.UI.telaLugares()',
  petshop: 'Reino.UI.telaPetShop()', album: 'Reino.Fotos && Reino.Fotos.abrirAlbum()',
  castelo: 'Reino.UI.telaCastelo()', plano: 'Reino.UI.telaPlano()', aparencia: 'Reino.UI.telaAparencia(false)',
  escola: 'Reino.Provas.telaEscola()',
};
// telas com argumento: 'materia:historia', 'livro:historia', 'sala:h1', 'prova:historia-3bim', 'treino:historia'
// (e 'desafio:h1-03', tratado em tela(): um desafio certo, sem sorteio)
const TELAS_COM_ID = {
  materia: (id) => `Reino.UI.telaMateria(Reino.materia(${JSON.stringify(id)}))`,
  livro: (id) => `Reino.UI.abrirLivro(Reino.materia(${JSON.stringify(id)}))`,
  sala: (id) => `(function (s) { var m = Reino.materias.find(function (m) { return m.salas.some(function (x) { return x.id === s; }); });
    if (!m) throw new Error('sala ' + s + ' não existe'); Reino.Missao.iniciar(m, m.salas.find(function (x) { return x.id === s; })); })(${JSON.stringify(id)})`,
  prova: (id) => `Reino.Provas.iniciar(Reino.prova(${JSON.stringify(id)}))`,
  treino: (id) => `Reino.Prova.iniciar(Reino.materia(${JSON.stringify(id)}))`,
};

/* ---------- PNG: recorte e ampliação (vizinho mais próximo) ---------- */
function recortarPng(arq, [x, y, w, h], saida) {
  const img = PNG.sync.read(fs.readFileSync(arq));
  x = Math.max(0, x); y = Math.max(0, y); w = Math.min(w, img.width - x); h = Math.min(h, img.height - y);
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(img, out, x, y, w, h, 0, 0);
  fs.writeFileSync(saida, PNG.sync.write(out));
  return saida;
}
function ampliarPng(arq, n, saida) {
  const img = PNG.sync.read(fs.readFileSync(arq));
  const out = new PNG({ width: img.width * n, height: img.height * n });
  for (let y = 0; y < out.height; y++) {
    for (let x = 0; x < out.width; x++) {
      const de = ((Math.floor(y / n) * img.width) + Math.floor(x / n)) * 4, para = (y * out.width + x) * 4;
      img.data.copy(out.data, para, de, de + 4);
    }
  }
  fs.writeFileSync(saida, PNG.sync.write(out));
  return saida;
}
// recorte em px CSS (multiplica pela densidade da tela); devolve os arquivos gerados
function tratarFoto(arq, op, escala) {
  const feitos = [arq];
  let atual = arq;
  if (op.recorte) {
    const r = op.recorte.map((v) => Math.round(v * (escala || 1)));
    atual = recortarPng(atual, r, arq.replace(/\.png$/, '-recorte.png'));
    feitos.push(atual);
  }
  if (op.ampliar && op.ampliar > 1) feitos.push(ampliarPng(atual, op.ampliar, atual.replace(/\.png$/, `-x${op.ampliar}.png`)));
  return feitos;
}

/* ---------- o cenário ---------- */
async function abrirCenario(op = {}) {
  const congelar = op.congelar !== false;
  const tamanho = op.tamanho || 'notebook';
  if (!TAMANHOS[tamanho]) throw new Error(`tamanho "${tamanho}" não existe (${Object.keys(TAMANHOS).join(', ')})`);
  const pasta = op.pasta || path.join(PASTA_VER, 'cenario-' + Date.now());
  const servidor = await iniciar({ raiz: op.raiz });
  const browser = op.browser || await lancar();
  const query = congelar ? '?debug=1&congelar=1' : '?debug=1';
  try {
    // 1ª aba sem save: gera as bases sintéticas com os ids do jogo carregado. Servidor e banco à parte: o estado
    // em branco que essa aba grava não pode chegar ao banco do cenário (a mescla trocaria ajustes do save)
    const gerador = await iniciar({ raiz: op.raiz });
    let bases, dados;
    try {
      const a = await abrir({ browser, url: gerador.url, tamanho, query: '?debug=1&congelar=1' });
      await a.page.waitForFunction(() => window.Reino && Reino.materias && Reino.Unicornios, null, { timeout: 30000 });
      bases = await a.page.evaluate(`(${gerarSaves.toString()})()`);
      dados = await a.page.evaluate(() => {
        var salas = {};
        Reino.materias.forEach(function (m) { salas[m.id] = m.salas.map(function (s) { return s.id; }); });
        return { salas: salas };
      });
      await a.context.close();
    } finally { gerador.parar(); }
    const save = comporSave(bases, op, dados);

    const { context, page } = await abrir({ browser, url: servidor.url, tamanho, save, query, reducedMotion: congelar ? 'reduce' : 'no-preference' });
    await page.waitForFunction(() => window.__reino && window.Reino && Reino.UI, null, { timeout: 30000 });
    const avancar = async (ms) => {
      if (congelar) await avancarSemPintura(page, ms);
      else await page.waitForTimeout(ms);
    };
    // o progresso vem do servidor de teste: anda o relógio até o mapa aparecer
    for (let i = 0; i < 400; i++) {
      const pronto = await page.evaluate(() => { var h = document.querySelector('#hud'); return window.__reino.estado() === 'mapa' && h && !h.hidden; });
      if (pronto) break;
      await avancar(50);
      if (congelar) await page.waitForTimeout(15);
    }
    await avancar(1000);

    const c = {
      page, context, browser, servidor, pasta, tamanho, congelar,
      get erros() { return page.__erros; },
      avancar,
      js: (codigo) => page.evaluate((js) => (0, eval)(js), codigo),
      // lugar: 'mapa', id de interior ('petshop'), 'materia:<id>' (o prédio da matéria) ou id de lugar do mapa
      async ir(lugar) {
        const r = await page.evaluate((l) => {
          if (l === 'mapa') { Reino.UI.fecharTodas(); if (Reino.Cena.atual()) Reino.Cena.sair(); return 'ok'; }
          if (Reino.interiores.some(function (d) { return d.id === l; })) { Reino.Cena.irPara(l); return 'ok'; }
          var lugar = Mapa.lugares().find(function (x) { return x.id === l; });
          if (!lugar) return 'lugar "' + l + '" não existe; interiores: ' + Reino.interiores.map(function (d) { return d.id; }).join(', ') +
            '; lugares: ' + Mapa.lugares().map(function (x) { return x.id; }).join(', ');
          window.__reino.entrar(lugar.id);
          return 'ok';
        }, lugar);
        if (r !== 'ok') throw new Error(r);
        await avancar(2500);
      },
      // tela por cima do mapa: 'loja', 'sala:h1', 'prova:historia-3bim', 'treino:historia', 'materia:historia', 'livro:…'
      async tela(nome) {
        // foto, album:<n>, prova:<id>:<n> (cenario-telas.js)
        if (await telaEspecial(c, nome)) return;
        const [tipo, id] = nome.split(/:(.+)/);
        // um desafio certo de uma sala (a missão sorteia 6 de 12): a mesma tela das fotos do e2e
        if (tipo === 'desafio' && id) {
          const ref = await page.evaluate((did) => {
            for (var m of Reino.materias) for (var s of m.salas) {
              var i = s.desafios.findIndex(function (d) { return d.id === did; });
              if (i >= 0) return { m: m.id, s: s.id, i: i };
            }
            return null;
          }, id);
          if (!ref) throw new Error(`desafio "${id}" não existe (ids como h1-01: veja js/conteudo/materias/<matéria>/<sala>.js)`);
          await mostrarDesafio(page, 'missao', ref);
          await avancar(600);
          return;
        }
        const js = id ? TELAS_COM_ID[tipo] && TELAS_COM_ID[tipo](id) : TELAS[nome];
        if (!js) throw new Error(`tela "${nome}" não existe (${Object.keys(TELAS).join(', ')}, ${Object.keys(TELAS_COM_ID).concat('desafio').map((k) => k + ':<id>').join(', ')})`);
        await page.evaluate((j) => { (0, eval)(j); }, js);
        await avancar(tipo === 'treino' || tipo === 'prova' ? 3000 : 600);
      },
      // seletor CSS, ou texto visível (o último botão/elemento clicável com esse texto)
      async tocar(alvo) {
        const ok = await page.evaluate((a) => {
          var el = null;
          try { el = document.querySelector(a); } catch (e) { /* não é seletor */ }
          if (!el) el = [...document.querySelectorAll('button, a, [role=button], .clicavel')].filter(function (x) { return x.textContent.indexOf(a) >= 0; }).pop();
          if (!el) return false;
          el.click();
          return true;
        }, alvo);
        if (!ok) throw new Error(`nada para tocar: "${alvo}"`);
        await avancar(400);
      },
      // gestos de verdade (cenario-ponteiro.js): 'x1,y1,x2,y2[,ms][,toque|mouse]' e '<seletor|x,y>,ms'
      arrastar: (texto) => arrastar(c, texto),
      segurar: (texto) => segurar(c, texto),
      async tecla(k) { await page.keyboard.press(k); await avancar(200); },
      // foto em <pasta>/<nome>.png; recorte [x,y,w,h] em px CSS; ampliar n (vizinho mais próximo)
      async foto(nome, fop = {}) {
        if (congelar) { await avancar(600); await page.evaluate(() => window.__congelar.respirar(8)); }
        fs.mkdirSync(pasta, { recursive: true });
        const arq = path.join(pasta, nome + '.png');
        // 1ª captura só cancela as animações de CSS; a 2ª sai estável
        if (congelar) { await page.screenshot({ animations: 'disabled', caret: 'hide' }); await page.waitForTimeout(60); }
        await page.screenshot({ path: arq, animations: congelar ? 'disabled' : 'allow', caret: 'hide' });
        return tratarFoto(arq, fop, TAMANHOS[tamanho].deviceScaleFactor);
      },
      estado: () => page.evaluate(() => {
        var r = window.__reino, p = r.progresso() || {}, e = p.estrelas || {};
        return {
          cena: r.cena(), estado: r.estado(), pos: r.pos(),
          telas: [...document.querySelectorAll('.tela:not([hidden])')].map(function (t) { return t.className; }),
          progresso: {
            estrelas: (e.ganhas || 0) - (e.gastas || 0), montaria: p.montaria,
            salas: Object.keys(p.salas || {}).length, unicornios: Object.keys(p.unis || {}).length,
            provas: Object.keys(p.provas || {}), cuidados: r.cuidados(),
          },
        };
      }),
      async fechar() {
        try { await context.close(); } catch (e) { /* já fechado */ }
        if (!op.browser) try { await browser.close(); } catch (e) { /* já fechado */ }
        servidor.parar();
      },
    };
    return c;
  } catch (e) {
    if (!op.browser) await browser.close().catch(() => {});
    servidor.parar();
    throw e;
  }
}

module.exports = { abrirCenario, tratarFoto, recortarPng, ampliarPng, TELAS, TELAS_COM_ID, PASTA_VER };
