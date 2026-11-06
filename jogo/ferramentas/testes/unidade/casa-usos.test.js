// Testes de unidade: os móveis da casa funcionam (js/sistemas/casa-usos.js e casa-usos-tabela.js; docs/contratos/casa.md §13).
// O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js); nada toca no save real.
// No Node não há animação (I.animar é de casa-usos-animar.js, só no navegador): o efeito vem na hora, como o contrato manda.
// Rodar: node --test jogo/ferramentas/testes/unidade/casa-usos.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje, copia } = require('./ajudantes/jogo-save');

const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);

// térreo 12×8 com um cômodo só; spawn (6,6), saída (6,7)
const CASA = {
  id: 'casa', lugar: 'casa', entrada: true, tamanho: { w: 12, h: 8 },
  comodos: [{ id: 'estar', rect: { x: 1, y: 1, w: 10, h: 6 } }],
  portas: [], objetos: [], npcs: [], spawn: { x: 6, y: 6 }, saida: { x: 6, y: 7 }, escadas: [],
};
const LIB = { 't-sofa': { w: 2, h: 1, solido: 'base' }, 't-tapete': { w: 2, h: 2, solido: false, plano: true } };
const KITS = [{ id: 'estar', nome: 'Sala de Estar', capa: 't-sofa', comodo: 'estar', itens: [
  { id: 'sofa', nome: 'Sofá', objeto: 't-sofa', direcoes: 4 },
  { id: 'tapete', nome: 'Tapete', objeto: 't-tapete', direcoes: 2 },
] }];

function todos(opcoes = {}) {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  try { return montar(opcoes); } finally { Jogo.scripts = orig; }
}
// o jogo com a casa sintética (save: saveHoje, com a montaria 'inicial' chocada; ajuste muda o save antes)
function jogo(ajuste) {
  const s = saveHoje();
  if (ajuste) ajuste(s);
  const j = todos({ save: s }), R = j.R;
  R.interiores.splice(0, R.interiores.length, ...R.interiores.filter((d) => d.id !== 'casa' && d.id !== 'casa-2'), copia(CASA));
  Object.keys(LIB).forEach((k) => { R.Interiores.OBJETOS[k] = LIB[k]; });
  R.kitsCasa.length = 0;
  KITS.forEach((k) => R.registrarKitCasa(copia(k)));
  R.materias.splice(0, R.materias.length, { id: 't-m4', bimestre: 4, salas: [{ id: 't-s1' }] });
  j.refeitos = [];
  R.Interiores.refazer = (id) => j.refeitos.push(id);
  j.sons = [];
  R.Som = { tocar: (n) => j.sons.push(n) };
  j.P.carregar();
  j.U = R.CasaUsos;
  j.acao = R.modulo('casa-usos').acoes.casaUsar;
  return j;
}
// uma peça de verdade (o tipo da tabela real) no térreo
const peca = (tipo, uid) => ({ tipo, uid, x: 3, y: 4, w: 1, h: 1, dir: 'baixo' });
const CTX = { interior: { id: 'casa' } };
const textos = (j) => j.balao.falas.map((f) => f.t);

test('tabela: todo item de kit e todo móvel avulso tem uso válido, mais o chuveiro novo; nada sobra', () => {
  const { R } = todos();
  const U = R.CasaUsos, usos = U.USOS, cfg = R.config.casa.usos;
  const objetos = [];
  R.kitsCasa.forEach((k) => k.itens.forEach((i) => objetos.push(i.objeto)));
  R.moveisCasa.forEach((m) => objetos.push(m.objeto));
  assert.ok(R.kitsCasa.length >= 6 && R.moveisCasa.length >= 41, 'kits e móveis de verdade');
  objetos.forEach((t) => assert.ok(usos.indexOf(U.uso(t)) >= 0, 'sem uso: ' + t));
  assert.strictEqual(U.uso('casa-movel-chuveiro'), 'chuveiro');
  const esperados = objetos.concat(['casa-movel-chuveiro']);
  U.tipos().forEach((t) => assert.ok(esperados.indexOf(t) >= 0, 'uso de objeto que não existe: ' + t));
  U.tipos().forEach((t) => {
    const d = U.de(t);
    if (!d) return assert.strictEqual(U.uso(t), 'enfeite');
    if (d.som !== undefined) assert.strictEqual(typeof d.som, 'string', t);
    if (d.quem !== undefined) assert.ok(['ambos', 'uni'].indexOf(d.quem) >= 0, t);
    if (d.uso === 'comer') assert.ok(typeof cfg[d.fome] === 'number' && cfg[d.fome] > 0, 'fome sem número: ' + t);
    (d.melodia || []).forEach((n) => assert.ok(n.length === 3 && n[0] >= 21 && n[0] <= 108 && n[1] + n[2] <= cfg.efeitoMs / 1000, 'nota fora: ' + t));
  });
  // o que o pedido pede (texto do Leandro)
  const de = (t) => U.uso('casa-' + t);
  igual(['estar-luminaria', 'estar-estante-tv', 'movel-lareira', 'cozinha-geladeira', 'cozinha-fogao', 'quarto-jogador-cama',
    'movel-cama-dossel', 'movel-beliche', 'quarto-uni-almofadao', 'movel-caminha-nuvem', 'banheiro-banheira', 'movel-cesto-macas',
    'cozinha-fruteira', 'quarto-uni-comedouro', 'movel-fontinha', 'quarto-uni-bebedouro', 'movel-filtro', 'estar-sofa', 'movel-vitrola',
    'movel-piano', 'movel-relogio-cuco', 'movel-aquario', 'cozinha-pia', 'banheiro-vaso', 'quarto-jogador-guarda-roupa', 'estar-tapete'].map(de),
  ['alternar', 'alternar', 'alternar', 'abrir', 'cozinhar', 'deitar', 'deitar', 'deitar', 'deitar', 'deitar', 'banho', 'comer',
    'comer', 'comer', 'beber', 'beber', 'beber', 'sentar', 'efeito', 'efeito', 'efeito', 'alternar', 'efeito', 'efeito', 'abrir', 'enfeite']);
  assert.strictEqual(U.de('casa-quarto-uni-almofadao').quem, 'uni');
  ['quarto-jogador-cama', 'banheiro-banheira', 'movel-chuveiro'].forEach((t) => assert.strictEqual(U.de('casa-' + t).quem, 'ambos', t));
});

test('objetosDoAndar: só a peça com uso ganha uid, nome e a ação casaUsar', () => {
  const j = jogo();
  j.P.estado().salas['t-s1'] = { vezes: 1, melhor: 6, feita: j.relogio.agora };
  assert.ok(j.R.Casa.escolherKit('estar'));
  assert.ok(j.R.Casa.colocar('estar.sofa.1', 'casa', 2, 4, 'baixo'));
  assert.ok(j.R.Casa.colocar('estar.tapete.1', 'casa', 6, 3, 'baixo'));
  const sem = [{ tipo: 't-sofa', x: 2, y: 4, w: 2, h: 1, dir: 'baixo' }, { tipo: 't-tapete', x: 6, y: 3, w: 2, h: 2, dir: 'baixo' }];
  igual(j.R.Casa.objetosDoAndar('casa'), sem, 'sem uso na tabela: igual a antes');
  j.U.registrar('t-sofa', { uso: 'sentar' });
  j.U.registrar('t-tapete', { uso: 'enfeite' });
  igual(j.R.Casa.objetosDoAndar('casa'), [Object.assign({}, sem[0], { uid: 'estar.sofa.1', nome: 'Sofá', acao: { tipo: 'casaUsar', uid: 'estar.sofa.1' } }), sem[1]]);
  assert.ok(j.R.Interiores.interativo(j.R.Casa.objetosDoAndar('casa')[0]));
  // a ação acha a peça pelo uid quando o ctx não traz o objeto
  j.U.registrar('t-sofa', { uso: 'alternar' });
  return j.acao({ tipo: 'casaUsar', uid: 'estar.sofa.1' }, {}).then((r) => {
    igual(r, { uso: 'alternar', ligado: true });
    igual(j.refeitos.slice(-1), ['casa'], 'o andar achado pelo uid');
    // guardar esquece: volta desligada
    assert.ok(j.R.Casa.guardar('estar.sofa.1'));
    assert.strictEqual(j.U.ligado({ uid: 'estar.sofa.1' }), false);
  });
});

test('ligar, abrir e efeito: só em memória (nenhum P.salvar, estado igual), refazem o andar e tocam o som', async () => {
  const j = jogo(), salvar = j.contagem.salvar, antes = JSON.stringify(j.P.estado());
  const luz = peca('casa-estar-luminaria', 'estar.luminaria.1'), gel = peca('casa-cozinha-geladeira', 'cozinha.geladeira.1');
  igual(await j.acao({ tipo: 'casaUsar', uid: luz.uid }, Object.assign({ objeto: luz }, CTX)), { uso: 'alternar', ligado: true });
  assert.strictEqual(j.U.ligado(luz), true);
  assert.strictEqual(j.U.ligado({ tipo: luz.tipo }), false, 'sem uid (capa, fantasma): desligado');
  igual(await j.U.usar(gel, CTX), { uso: 'abrir', ligado: true });
  igual(await j.U.usar(luz, CTX), { uso: 'alternar', ligado: false });
  const pia = peca('casa-cozinha-pia', 'cozinha.pia.1');
  igual(await j.U.usar(pia, CTX), { uso: 'efeito', ligado: true });
  igual(await j.U.usar(pia, CTX), { uso: 'efeito', ligado: true, repetido: true }, 'toque com ele ligado: nada');
  igual(j.sons, ['clique', 'porta', 'clique', 'gotas']);
  igual(j.refeitos, ['casa', 'casa', 'casa', 'casa']);
  igual(j.U.depurar().ligados.sort(), ['cozinha.geladeira.1', 'cozinha.pia.1']);
  assert.strictEqual(j.contagem.salvar, salvar, 'ligar gravou o save');
  assert.strictEqual(JSON.stringify(j.P.estado()), antes, 'ligar mexeu no estado');
  j.U.esquecer('cozinha.pia.1');
  assert.strictEqual(j.U.ligado(pia), false);
  assert.strictEqual(await j.U.usar(peca('casa-estar-tapete', 'estar.tapete.1'), CTX), null, 'enfeite não faz nada');
});

test('efeito desliga sozinho depois de efeitoMs; melodia pelas notas', async () => {
  const j = jogo();
  const timers = [];
  j.ctx.setTimeout = (fn, ms) => { timers.push({ fn, ms }); return timers.length; };
  const notas = [];
  j.R.Som.notaMusical = (midi) => notas.push(midi);
  const vit = peca('casa-movel-vitrola', 'movel.vitrola.1');
  await j.U.usar(vit, CTX);
  assert.strictEqual(j.U.ligado(vit), true);
  const desligar = timers.find((t) => t.ms === j.R.config.casa.usos.efeitoMs);
  assert.ok(desligar, 'sem temporizador de efeitoMs');
  timers.filter((t) => t !== desligar).forEach((t) => t.fn());
  assert.strictEqual(notas.length, j.U.de(vit.tipo).melodia.length);
  desligar.fn();
  assert.strictEqual(j.U.ligado(vit), false);
});

test('comer e beber: enchem a fome e a sede pelos campos de sempre, gravam e falam as frases já gravadas', async () => {
  const j = jogo(), C = j.R.Cuidados, F = C.frases, u = j.R.config.casa.usos;
  const fr = peca('casa-cozinha-fruteira', 'cozinha.fruteira.1'), agua = peca('casa-movel-fontinha', 'movel.fontinha.1');
  const salvar = j.contagem.salvar;
  const r = await j.U.usar(fr, CTX);
  igual(r, { uso: 'comer', resultado: { ok: true, antes: 64.5, depois: 64.5 + u.fomeFruta } });
  assert.strictEqual(j.P.estado().cuidados.inicial.fome, 64.5 + u.fomeFruta);
  assert.ok(j.contagem.salvar > salvar, 'comer não gravou');
  await j.U.usar(peca('casa-quarto-uni-comedouro', 'quarto-uni.comedouro.1'), CTX);
  assert.strictEqual(C.niveis('inicial').fome, 100);
  assert.strictEqual((await j.U.usar(fr, CTX)).resultado.motivo, 'cheio');
  assert.strictEqual((await j.U.usar(agua, CTX)).resultado.depois, 100);
  assert.strictEqual((await j.U.usar(agua, CTX)).resultado.motivo, 'cheio');
  igual(textos(j), [F.comeu, F.comeu, F.cheio, F.bebeu, F.semSede]);
  assert.strictEqual(j.balao.falas[0].o.voz, 'unicornio');
  assert.strictEqual(j.balao.falas[2].o.voz, 'claude');
  igual(j.sons, ['nhac', 'nhac', 'gole'], 'cheio: sem som de comer');
  assert.strictEqual(j.P.estado().despensa.maca.usadas, 1, 'comida de casa mexeu na despensa');
});

test('sem unicórnio chocado: comer/beber só tocam o som, "Quem vai?" não aparece (vai ela), cama dele só o som', async () => {
  const j = jogo((s) => { s.unis.inicial.chocado = false; });
  const escolhas = [];
  j.R.UI = { escolher: (m, b) => { escolhas.push(m); return Promise.resolve(b[0].valor); } };
  const antes = JSON.stringify(j.P.estado()), salvar = j.contagem.salvar;
  igual(await j.U.usar(peca('casa-cozinha-fruteira', 'cozinha.fruteira.1'), CTX), { uso: 'comer', resultado: { ok: false, motivo: 'sem-uni' } });
  igual(await j.U.usar(peca('casa-movel-filtro', 'movel.filtro.1'), CTX), { uso: 'beber', resultado: { ok: false, motivo: 'sem-uni' } });
  igual(await j.U.usar(peca('casa-quarto-jogador-cama', 'quarto-jogador.cama.1'), CTX), { uso: 'deitar', quem: 'ela', pulou: false });
  igual(await j.U.usar(peca('casa-movel-caminha-nuvem', 'movel.caminha-nuvem.1'), CTX), { uso: 'deitar', resultado: { ok: false, motivo: 'sem-uni' } });
  igual(await j.U.usar(peca('casa-cozinha-fogao', 'cozinha.fogao.1'), CTX), { uso: 'cozinhar', quem: 'ela', pulou: false });
  igual(escolhas, []);
  igual(textos(j), []);
  igual(j.sons, ['nhac', 'gole', 'respira', 'respira', 'clique']);
  assert.strictEqual(j.contagem.salvar, salvar);
  assert.strictEqual(JSON.stringify(j.P.estado()), antes);
});

test('"Quem vai?": Eu, o unicórnio (pelo nome) ou Agora não; chuveiro e banheira dão banho nele', async () => {
  const j = jogo((s) => { s.cuidados.inicial.banho = 20; });
  let resposta = 'ela';
  const vistas = [];
  j.R.UI = { escolher: (m, b) => { vistas.push({ m, b }); return Promise.resolve(resposta); } };
  const ch = peca('casa-movel-chuveiro', 'movel.chuveiro.1'), ba = peca('casa-banheiro-banheira', 'banheiro.banheira.1');
  igual(await j.U.usar(ch, CTX), { uso: 'chuveiro', quem: 'ela', pulou: false });
  assert.strictEqual(j.R.Cuidados.niveis('inicial').banho, 20, 'banho dela mexeu no dele');
  igual(vistas[0].m, 'Quem vai?');
  igual(vistas[0].b.map((x) => [x.rotulo, x.valor, !!x.principal, !!x.seguro]),
    [['🙋 Eu', 'ela', true, false], ['🦄 Teste Azul', 'uni', false, false], ['Agora não', null, false, true]]);
  resposta = null;
  assert.strictEqual(await j.U.usar(ch, CTX), null, 'Agora não');
  resposta = 'uni';
  const r = await j.U.usar(ch, CTX);
  igual(r, { uso: 'chuveiro', quem: 'uni', pulou: false, resultado: { ok: true, antes: 20, depois: 100 } });
  igual((await j.U.usar(ch, CTX)).resultado, { ok: false, motivo: 'cheio' });
  igual(textos(j), [j.R.Cuidados.frases.banhou, j.R.Cuidados.frases.jaLimpinho]);
  // a banheira da casa: o banho de espuma do Reino.Banho, com as medidas dela
  const chamadas = [];
  j.R.Banho = { ativo: () => false, iniciar: (id, op) => { chamadas.push({ id, op }); return Promise.resolve({ ok: true, pulou: false }); } };
  igual(await j.U.usar(ba, CTX), { uso: 'banho', quem: 'uni', resultado: { ok: true, pulou: false } });
  igual(chamadas.map((c) => [c.id, c.op.banheira]), [['inicial', { x: 3, y: 4, w: 1, h: 1, tipo: ba.tipo, dir: 'baixo' }]]);
  j.R.Banho.ativo = () => true;
  assert.strictEqual(await j.U.usar(ba, CTX), null, 'banho em curso: nada');
});

test('fogão: acende durante e apaga no fim; a comida enche a fome do unicórnio', async () => {
  const j = jogo();
  const fogao = peca('casa-cozinha-fogao', 'cozinha.fogao.1');
  let aceso = null, st = null;
  j.R._casaUsos.animar = (s) => { st = copia(s); aceso = j.U.ligado(fogao); assert.ok(j.U.animando()); return Promise.resolve({ pulou: true }); };
  j.R._casaUsos.quemDesenha = () => ({ ela: true, uni: false });
  const r = await j.U.usar(fogao, CTX);
  assert.strictEqual(aceso, true, 'fogão apagado durante');
  assert.strictEqual(j.U.ligado(fogao), false, 'fogão aceso no fim');
  igual(r, { uso: 'cozinhar', quem: 'ela', pulou: true, resultado: { ok: true, antes: 64.5, depois: Math.min(100, 64.5 + j.R.config.casa.usos.fomeFogao) } });
  igual(st, { uso: 'cozinhar', quem: 'ela', obj: fogao, uniId: 'inicial', montado: false, curta: false,
    dur: j.R.config.casa.usos.cozinharMs, inicio: 0, comecou: false, fim: false, pulou: false });
  assert.strictEqual(j.U.animando(), false);
  assert.strictEqual(j.U.desenhandoEla(), false, 'sem uso em curso ninguém desenha');
  igual(textos(j), [j.R.Cuidados.frases.comeu]);
});

test('animação: curta sem Animações; desenhandoEla/Uni vêm do quemDesenha; um uso por vez', async () => {
  const j = jogo((s) => { s.ajustes.animacoes = false; });
  let soltar, visto = null;
  j.R._casaUsos.animar = (s) => new Promise((ok) => { visto = s; soltar = ok; });
  j.R._casaUsos.quemDesenha = (s) => ({ ela: s.quem === 'ela', uni: s.quem === 'uni' });
  const sofa = peca('casa-estar-sofa', 'estar.sofa.1');
  const p = j.U.usar(sofa, CTX);
  await new Promise((ok) => setImmediate(ok));
  assert.strictEqual(visto.curta, true);
  assert.strictEqual(visto.dur, j.R.config.casa.usos.curtaMs);
  assert.strictEqual(j.U.desenhandoEla(), true);
  assert.strictEqual(j.U.desenhandoUni(), false);
  assert.strictEqual(await j.U.usar(peca('casa-estar-luminaria', 'estar.luminaria.1'), CTX), null, 'outro uso durante a animação');
  soltar({ pulou: false });
  igual(await p, { uso: 'sentar', quem: 'ela', pulou: false });
  assert.strictEqual(j.U.animando(), false);
});

test('efeito: o desligar refaz o andar onde a peça está agora (ou os dois, se não achar)', async () => {
  const j = jogo();
  const timers = [];
  j.ctx.setTimeout = (fn, ms) => { timers.push({ fn, ms }); return timers.length; };
  const pia = peca('casa-cozinha-pia', 'cozinha.pia.1');
  await j.U.usar(pia, CTX);
  const casa = j.R.Casa, orig = casa.objetosDoAndar;
  casa.objetosDoAndar = (a) => (a === 'casa-2' ? [Object.assign({}, pia, { x: 1 })] : []);   // ela levou a pia para cima
  j.refeitos.length = 0;
  timers[timers.length - 1].fn();
  igual(j.refeitos, ['casa-2']);
  assert.strictEqual(j.U.ligado(pia), false);
  casa.objetosDoAndar = () => [];
  await j.U.usar(pia, CTX);
  j.refeitos.length = 0;
  timers[timers.length - 1].fn();
  igual(j.refeitos, ['casa', 'casa-2'], 'peça não achada: refaz os dois andares');
  casa.objetosDoAndar = orig;
});

test('trocar de dono do save (Apagar tudo, outro jogador) desliga tudo e cancela os temporizadores', async () => {
  const j = jogo();
  const cancelados = [];
  j.ctx.setTimeout = () => 77;
  j.ctx.clearTimeout = (id) => cancelados.push(id);
  const luz = peca('casa-estar-luminaria', 'estar.luminaria.1'), pia = peca('casa-cozinha-pia', 'cozinha.pia.1');
  await j.U.usar(luz, CTX);
  await j.U.usar(pia, CTX);
  j.P.salvar();
  assert.strictEqual(j.U.ligado(luz), true, 'gravar o mesmo save desligou');
  j.P.apagarTudo();
  assert.strictEqual(j.U.ligado(luz), false);
  assert.strictEqual(j.U.ligado(pia), false);
  igual(cancelados, [77]);
  igual(j.U.depurar().ligados, []);
});

test('rede de segurança: animação que não termina é encerrada com st.fim e st.pulou', async () => {
  const j = jogo();
  const timers = [];
  j.ctx.setTimeout = (fn, ms) => { timers.push({ fn, ms }); return timers.length; };
  let visto = null;
  j.R._casaUsos.animar = (s) => { visto = s; return new Promise(() => {}); };
  const p = j.U.usar(peca('casa-estar-sofa', 'estar.sofa.1'), CTX);
  await new Promise((ok) => setImmediate(ok));
  assert.ok(j.U.animando());
  const seg = timers.find((t) => t.ms === j.R.config.casa.usos.sentarMs + 5000);
  assert.ok(seg, 'sem rede de segurança');
  seg.fn();
  igual(await p, { uso: 'sentar', quem: 'ela', pulou: true });
  assert.strictEqual(visto.fim, true);
  assert.strictEqual(visto.pulou, true);
  assert.strictEqual(j.U.animando(), false);
});
