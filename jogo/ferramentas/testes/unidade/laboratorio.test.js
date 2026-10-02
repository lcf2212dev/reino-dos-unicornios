/* Interações do laboratório com DOM sintético: nenhum save, banco ou navegador real. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function montar() {
  class Elemento {
    constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.dataset = {}; this.eventos = {}; this.className = ''; this.textContent = ''; this.classList = { add: (...nomes) => { this.className += ' ' + nomes.join(' '); } }; }
    appendChild(e) { this.children.push(e); e.parentNode = this; return e; }
    append(...es) { es.forEach(e => this.appendChild(e)); }
    replaceChildren(...es) { this.children = []; this.append(...es); }
    setAttribute(k, v) { this.attrs[k] = v; }
    addEventListener(k, f) { this.eventos[k] = f; }
    getContext() { return { fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, fill() {} }; }
    querySelector(q) { return todos(this).find(e => e.dataset.peca === (q.match(/"(.*?)"/) || [])[1]); }
  }
  let painel, fechadas = 0, falas = [];
  const R = { util: { embaralhar: a => a.slice() }, Som: { falar: a => falas.push(a), calar() {} }, UI: {
    painel() { painel = { tela: new Elemento('section'), conteudo: new Elemento('div'), card: new Elemento('div') }; return painel; },
    fecharTela() { fechadas++; }, focarTroca() {}
  } };
  const ctx = vm.createContext({ window: { Reino: R }, document: { createElement: t => new Elemento(t) } });
  ['conteudo/laboratorio/atividades', 'ui/laboratorio', 'ui/laboratorio-cenas', 'ui/laboratorio-jogos'].forEach(n => vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../../../js/' + n + '.js'), 'utf8'), ctx));
  return { R, get painel() { return painel; }, get fechadas() { return fechadas; }, falas,
    botao(texto) { const b = todos(painel.conteudo).find(e => e.tag === 'button' && e.textContent === texto); assert.ok(b, texto); return b; },
    texto() { return todos(painel.conteudo).map(e => e.textContent).join(' '); }
  };
}
function todos(e) { return [e, ...e.children.flatMap(todos)]; }
test('catálogo oferece seis experiências e três jogos sem economia', () => {
  const j = montar(); assert.equal(j.R.LABORATORIO.experiencias.length, 6); assert.equal(j.R.LABORATORIO.jogos.length, 3);
  j.R.UI.telaLaboratorio(); assert.equal(todos(j.painel.conteudo).filter(e => e.tag === 'canvas').length, 6);
  j.botao('Mini-jogos').onclick(); assert.equal(todos(j.painel.conteudo).filter(e => e.tag === 'canvas').length, 3);
});
test('circuito exige dois fios e permite abrir o caminho novamente', () => {
  const j = montar(); j.R.UI.telaLaboratorioExperiencia('circuito'); j.botao('Ligar fio esquerdo').onclick(); assert.match(j.texto(), /caminho está aberto/);
  j.botao('Ligar fio direito').onclick(); assert.match(j.texto(), /lâmpada acendeu/);
  j.botao('Soltar fio esquerdo').onclick(); assert.match(j.texto(), /caminho está aberto/);
});
test('misturas exigem material e ação de mexer, distinguem dissolução de camada', () => {
  const j = montar(); j.R.UI.telaLaboratorioExperiencia('mistura'); j.botao('Mexer com a colher').onclick(); assert.match(j.texto(), /Escolha um material primeiro/);
  j.botao('Açúcar').onclick(); j.botao('Mexer com a colher').onclick(); assert.match(j.texto(), /continua na mistura/);
  j.botao('Óleo').onclick(); j.botao('Mexer com a colher').onclick(); assert.match(j.texto(), /camada por cima/);
});
test('germinação compara pote úmido e seco e limita avanço de dias', () => {
  const j = montar(); j.R.UI.telaLaboratorioExperiencia('broto'); for (let i = 0; i < 9; i++) j.botao('Passar um dia').onclick();
  assert.match(j.texto(), /Dia 5/); assert.match(j.texto(), /pote seco/);
});
test('memória só completa com os três pares e permite observar uma tentativa', () => {
  const j = montar(); j.R.UI.telaLaboratorioJogo('memoria'); j.botao('Carta 1').onclick(); j.botao('Carta 3').onclick();
  assert.match(j.texto(), /pares diferentes/); j.botao('Virar estas cartas').onclick();
  for (let n = 1; n <= 6; n++) j.botao('Carta ' + n).onclick(); assert.match(j.texto(), /Todos os pares encontrados/);
});
test('ciclo aceita desfazer e só completa na ordem causal correta', () => {
  const j = montar(); j.R.UI.telaLaboratorioJogo('ciclo'); const pecas = j.R.LABORATORIO.ciclo;
  [2, 0, 3, 1].forEach(i => j.botao(pecas[i]).onclick()); j.botao('Testar a viagem').onclick(); assert.match(j.texto(), /Vamos investigar/);
  for (let i = 0; i < 4; i++) j.botao('Desfazer a última').onclick(); pecas.forEach(p => j.botao(p).onclick());
  j.botao('Testar a viagem').onclick(); assert.match(j.texto(), /viagem está completa/);
});
test('abelha contorna pedras, visita todas as flores e só termina de volta à colmeia', () => {
  const j = montar(); j.R.UI.telaLaboratorioJogo('polen');
  const mover = (s, n = 1) => { for (let i = 0; i < n; i++) j.botao(s).onclick(); };
  mover('←'); assert.match(j.texto(), /pedra ou a cerca/);
  mover('↑'); mover('→'); mover('→'); mover('↑'); mover('↑'); assert.match(j.texto(), /pedra ou a cerca/);
  mover('↓'); mover('↓'); mover('→', 2); mover('↑', 3); mover('↑'); mover('←', 2);
  assert.match(j.texto(), /3 de 3/); assert.doesNotMatch(j.texto(), /Viagem completa!/);
  mover('←', 2); mover('↓', 4); assert.match(j.texto(), /Viagem completa!/);
});
test('navegação substitui o painel e id desconhecido não abre outra tela', () => {
  const j = montar(); j.R.UI.telaLaboratorioExperiencia('ima'); j.botao('Outras descobertas').onclick(); assert.equal(j.fechadas, 1);
  const p = j.painel; j.R.UI.telaLaboratorioExperiencia('inexistente'); assert.equal(j.painel, p);
});
