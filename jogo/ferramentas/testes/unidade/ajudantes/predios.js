// Ajudante dos testes dos prédios (não é teste: não termina em .test.js): o jogo inteiro (scripts node: true, na
// ordem das ferramentas, com ferramentas/jogo-no-node.js) num vm, com um Mapa de mentira (para os desenhos de fora)
// e um contexto 2D que só anota. Usado por testes/unidade/escola-*, loja-*, porta-* e nasa-*.test.js.
const Jogo = require('../../../jogo-no-node');

// contexto 2D que anota cada fillRect com a cor e cada drawImage
function ctxAnotador() {
  const c = {
    fillStyle: '#000', globalAlpha: 1, imageSmoothingEnabled: false, rets: [], imagens: [],
    fillRect(x, y, w, h) { c.rets.push({ x, y, w, h, cor: c.fillStyle }); },
    drawImage(img, ...a) { c.imagens.push(a); },
    save() {}, restore() {}, beginPath() {}, ellipse() {}, clip() {}, translate() {}, clearRect() {},
  };
  return c;
}

// mapa: põe um Mapa de mentira cuja fachada (porta, degrau, tijolos…) só anota as chamadas
// pa:   um PA de mentira (ícones), para desenhar vitrines sem canvas
function montar({ mapa = false, pa = null } = {}) {
  const chamadas = [];
  const fachada = new Proxy({}, { get: (_, f) => (f === 'chamadas' ? chamadas : (...a) => { chamadas.push({ f, a }); }) });
  const extras = { console, setTimeout, clearTimeout, Math, Date };
  if (mapa) extras.Mapa = { PREDIOS: {}, PREDIOS_ANIM: {}, fachada };
  if (pa) extras.PA = pa;
  const ctx = Jogo.contexto(extras);
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return { R: ctx.Reino, janela: ctx, fachada };
}

module.exports = { montar, ctxAnotador };
