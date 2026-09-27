// Referências — base comum: JSON estável e a página do jogo no modo determinístico (?debug=1&congelar=1).
// Usado por referencias-cenas.js, referencias-dados.js e referencias.js (a CLI fica em referencias.js).
const fs = require('fs');
const path = require('path');
const { iniciar } = require('./servidor-teste');
const { abrir } = require('./navegador');

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
// Pintar cada passo de 16 ms é quase todo o custo (avancar(2500) num interior: 2,5 s pintando, 7 ms sem).
// Cada quadro repinta tudo (motor/laco.js), então os passos antes do último andam com os métodos de pintura
// da tela e do buffer (Reino._motor.ctx/bctx) trocados por nada; o último passo pinta normal. Os passos são
// os mesmos do avancar(ms) de uma vez: (n-1) de 16 ms e o resto. Sem a pintura, o relógio virtual passaria
// na frente da rede de verdade: a íris espera o pacote de voz (js/voz/*.js) até 4 s VIRTUAIS e desistiria
// antes de ele chegar; por isso cada passo sem pintura espera, em tempo real, os pacotes pedidos chegarem.
const PINTURA = ['fillRect', 'strokeRect', 'clearRect', 'drawImage', 'fillText', 'strokeText', 'fill', 'stroke', 'putImageData'];
const avancar = (page, ms) => page.evaluate(async ([m, metodos]) => {
  var C = window.__congelar, V = window.Reino && Reino._motor;
  var antes = Math.max(0, Math.ceil(m / 16) - 1) * 16;
  if (!V || !V.ctx || !V.bctx || !antes) return C.avancar(m);
  var chegaram = () => {
    var feitos = new Set(performance.getEntriesByType('resource').map((e) => e.name));
    return [...document.querySelectorAll('script[src*="js/voz/"]')].every((s) => feitos.has(s.src));
  };
  var tick = () => new Promise((r) => { var c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); });
  var ctxs = [V.ctx, V.bctx];
  ctxs.forEach((c) => metodos.forEach((k) => { c[k] = function () {}; }));
  try {
    for (var feito = 0; feito < antes; feito += 16) {
      for (var i = 0; !chegaram() && i < 20000; i++) await tick();
      await C.avancar(16);
    }
  } finally { ctxs.forEach((c) => metodos.forEach((k) => { delete c[k]; })); }
  return C.avancar(m - antes);
}, [ms, PINTURA]);
// cada aba tem o SEU servidor de teste com banco novo: a sincronização de uma aba não vaza para outra
async function abrirJogo(browser, raiz, tamanho, save) {
  const servidor = await iniciar({ raiz });
  const { context, page } = await abrir({ browser, url: servidor.url, tamanho, save, query: '?debug=1&congelar=1' });
  context.on('close', () => servidor.parar());
  await page.waitForFunction(() => window.__congelar && window.__reino, null, { timeout: 30000 });
  // o buffer padrão do Resource Timing (250) enche com os scripts + pacotes de voz e o `chegaram` do avancar
  // nunca mais vê um pacote novo: aumenta antes das cenas
  await page.evaluate(() => performance.setResourceTimingBufferSize(5000));
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
// page.__filtro (RegExp, --cenas do e2e): nome que não casa anda o relógio igual, mas não é fotografado.
// page.__faltam (Set dos nomes pedidos neste tamanho): vazio, a aba para (erro .chega) — já saiu tudo
async function foto(page, pasta, nome) {
  if (page.__faltam && !page.__faltam.size) throw Object.assign(new Error('chega'), { chega: true });
  await avancar(page, 600);
  await page.evaluate(() => window.__congelar.respirar(8));
  if (page.__filtro && !page.__filtro.test(nome)) return;
  if (page.__faltam) page.__faltam.delete(nome);
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

module.exports = { estavel, gravarJson, avancar, abrirJogo, foto, limpar, clicarBotao, sairComConfirmar };
