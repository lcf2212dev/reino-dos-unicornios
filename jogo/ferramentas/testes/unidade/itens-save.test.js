// Testes de unidade: o campo `itens` do save (js/sistemas/itens.js, Reino.Itens; docs/contratos/itens.md §6, §10 e
// save-e-mescla.md §11). Uma peça, uma chave (uid); lápide no gasto; mescla por uid (carimbo): dois aparelhos não
// duplicam nem somem nada; vestido em conflito e mochila acima de 20 resolvidos na leitura, sem gravar; id e `onde`
// desconhecidos guardados; save antigo sem gravar; cópia -novidades; Novo ciclo; e um aparelho da versão ANTIGA
// (progresso*.js e eventos.js do commit base 881557e0, tirados com git show, sem os scripts dos itens) que recebe e
// devolve o campo intacto. O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js);
// nada toca no save real. Rodar: node --test jogo/ferramentas/testes/unidade/itens-save.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Jogo, montar, saveHoje, copia, sincronizar } = require('./ajudantes/jogo-save');

const BASE = '881557e0f63346b6d6d254549519511c2b477710';   // o commit de antes dos itens
const DOS_ITENS = /(^|\/)itens(-|\/|$)|config-itens/;
const ANTIGOS = ['sistemas/progresso', 'sistemas/progresso-mescla', 'sistemas/progresso-nuvem', 'sistemas/progresso-regras',
  'sistemas/progresso-campos', 'nucleo/eventos'];

function pastaAntiga() {
  const dir = path.join(process.env.REINO_TESTES || '/tmp/reino-testes', 'itens-save', BASE.slice(0, 8));
  if (!ANTIGOS.every((n) => fs.existsSync(path.join(dir, n + '.js')))) {
    ANTIGOS.forEach((n) => {
      fs.mkdirSync(path.dirname(path.join(dir, n + '.js')), { recursive: true });
      fs.writeFileSync(path.join(dir, n + '.js'), execFileSync('git', ['show', BASE + ':jogo/js/' + n + '.js'], { cwd: Jogo.raiz }));
    });
  }
  return dir;
}

// o jogo inteiro; antigo: sem os scripts dos itens e com o progresso do commit base
function jogo(opcoes = {}) {
  const origS = Jogo.scripts, origC = Jogo.carregar;
  const dir = opcoes.versaoAntiga ? pastaAntiga() : null;
  Jogo.scripts = () => origS({}).filter((s) => !opcoes.versaoAntiga || !DOS_ITENS.test(Jogo.nome(s)));
  if (dir) {
    const trocar = {};
    ANTIGOS.forEach((n) => { trocar[n] = path.join(dir, n + '.js'); });
    Jogo.carregar = (ctx, lista, o = {}) => origC(ctx, lista, { ...o, trocar: { ...(o.trocar || {}), ...trocar } });
  }
  let j;
  try { j = montar(opcoes); } finally { Jogo.scripts = origS; Jogo.carregar = origC; }
  j.It = j.R.Itens;
  j.itensEv = [];
  j.R.util.on(j.R.EVENTOS.ITENS || 'itens', (c) => j.itensEv.push(c));
  return j;
}
const carregado = (opcoes = {}) => { const j = jogo(opcoes); j.P.carregar(); return j; };
const vivos = (j) => j.It.pecas().map((p) => p.uid).sort();
const onde = (j, uid) => { const p = j.It.pecas().find((x) => x.uid === uid); return p ? p.onde : null; };
const qtdMochila = (j) => j.It.mochila().reduce((n, s) => n + s.qtd, 0);
const qtdBau = (j) => j.It.bau().reduce((n, s) => n + s.qtd, 0);
const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);
const passa = (j, ms) => { j.relogio.agora += ms; };

test('itens: campo registrado (carimbo, mantém no Novo ciclo, na cópia); save antigo = vazio e nada gravado ao carregar', () => {
  const j = carregado({ save: saveHoje() });
  const def = j.R._progresso.campos.itens;
  assert.ok(def, 'campo itens não registrado');
  assert.strictEqual(def.mesclar, 'carimbo');
  assert.strictEqual(def.novoCiclo, 'mantem');
  assert.strictEqual(def.copiaSeguranca, true);
  igual(j.P.estado().itens, {});
  igual(j.It.mochila(), []);
  igual(j.It.vestes(), { espada: null, escudo: null, cabeca: null, armadura: null, calca: null, botas: null });
  assert.strictEqual(j.It.temMochila(), false);
  // ao carregar, o aparelho novo grava exatamente o que o antigo gravaria (nada a mais, nada escrito na leitura)
  const a = jogo({ save: saveHoje() }), v = jogo({ save: saveHoje(), versaoAntiga: true });
  a.P.carregar(); v.P.carregar();
  igual(a.gravacoes, v.gravacoes, 'o carregamento gravou algo que a versão antiga não grava');
  assert.strictEqual(a.guardado[a.chave], v.guardado[v.chave], 'o save no aparelho mudou ao carregar');
  assert.strictEqual(a.contagem.salvar, 0);
});

test('itens: ganhar vai à mochila, empilha consumível até 10, mochila cheia vai ao baú; uid no formato', () => {
  const j = carregado({ save: saveHoje() });
  const g = j.It.ganhar('espada-gelo', { arena: 'gelo', x: 10, y: 20 });
  assert.match(g.uid, /^[0-9a-z]+-[0-9a-z]{4}$/);
  assert.strictEqual(g.onde, 'mochila');
  const ev = j.itensEv.pop();
  igual(ev, { tipo: 'ganhou', uid: g.uid, id: 'espada-gelo', onde: 'mochila', arena: 'gelo', x: 10, y: 20 });
  assert.strictEqual(j.lido().itens[g.uid].onde, 'mochila', 'não gravou na hora');
  for (let i = 0; i < 12; i++) j.It.ganhar('pocao-pequena');
  igual(j.It.mochila().map((s) => s.id + ':' + s.qtd), ['espada-gelo:1', 'pocao-pequena:10', 'pocao-pequena:2']);
  for (let i = 0; i < 17; i++) assert.strictEqual(j.It.ganhar('botas-galocha').onde, 'mochila');
  igual(j.It.espacos(), { usados: 20, total: 20 });
  assert.strictEqual(j.It.cabe('pocao-pequena'), true, 'a pilha de 2 ainda tem espaço');
  assert.strictEqual(j.It.cabe('espada-sol'), false);
  assert.strictEqual(j.It.ganhar('espada-sol').onde, 'bau');
  assert.strictEqual(j.It.ganhar('pocao-pequena').onde, 'mochila');
  assert.strictEqual(j.It.ganhar('id-que-nao-existe'), null);
  igual(j.It.bau().map((s) => s.id + ':' + s.qtd), ['espada-sol:1']);
  assert.strictEqual(j.It.temMochila(), true);
});

test('itens: vestir, tirar, guardar, retirar, jogar fora (lápide); bônus e vestes memorizados', () => {
  const j = carregado({ save: saveHoje() });
  const h1 = j.It.ganhar('capacete-panela').uid, h2 = j.It.ganhar('chapeu-flor').uid, b = j.It.ganhar('botas-vento').uid;
  passa(j, 10);
  assert.ok(j.It.vestir(h1));
  assert.ok(j.It.vestir(b));
  const v1 = j.It.vestes();
  assert.strictEqual(j.It.vestes(), v1, 'vestes() não é memorizado');
  igual(j.It.bonus(), { dano: 0, defesa: 1, vida: 0, velocidade: 0.1, sorte: 0 });
  assert.ok(j.It.vestir(h2), 'chapéu e capacete dividem o slot cabeca');
  assert.strictEqual(onde(j, h1), 'mochila');
  assert.strictEqual(j.It.vestes().cabeca, 'chapeu-flor');
  assert.notStrictEqual(j.It.vestes(), v1);
  assert.strictEqual(j.It.vestir(h2), false, 'já vestido: só da mochila');
  igual(j.It.tirar('cabeca'), { ok: true, onde: 'mochila' });
  igual(j.It.tirar('cabeca'), { ok: false, onde: null });
  assert.ok(j.It.guardar(h1));
  assert.strictEqual(onde(j, h1), 'bau');
  assert.strictEqual(j.It.vestir(h1), false, 'do baú não se veste');
  assert.ok(j.It.retirar(h1));
  const em = j.P.estado().itens[h2].em;
  assert.ok(j.It.jogarFora(h2));
  assert.strictEqual(j.P.estado().itens[h2].onde, 'fora', 'jogar fora não deixou a lápide');
  assert.ok(j.P.estado().itens[h2].em > em, 'o carimbo não cresceu');
  assert.ok(!vivos(j).includes(h2));
  // tirar com a mochila cheia: vai ao baú
  for (let i = 0; i < 19; i++) j.It.ganhar('espada-madeira');
  igual(j.It.espacos(), { usados: 20, total: 20 });
  igual(j.It.tirar('botas'), { ok: true, onde: 'bau' });
  assert.strictEqual(j.It.retirar(b), false, 'não cabe');
  const motivos = j.itensEv.filter((e) => e.tipo === 'mudou').map((e) => e.motivo);
  igual([...new Set(motivos)].sort(), ['jogar', 'mover', 'tirar', 'vestir']);
});

test('itens: dois aparelhos (drop nos dois, gastar num e mover no outro, lápide): nada duplica nem some', () => {
  const banco = { valor: null };
  const loja1 = {}, loja2 = {};
  const A = carregado({ save: saveHoje(), loja: loja1 });
  const p = A.It.ganhar('comida-maca').uid, e1 = A.It.ganhar('escudo-madeira').uid, lixo = A.It.ganhar('botas-galocha').uid;
  sincronizar(A, banco);
  const B = carregado({ save: copia(banco.valor), loja: loja2, agora: A.relogio.agora + 5 });
  igual(vivos(B), vivos(A));
  // ao mesmo tempo: os dois ganham um item; A dá a maçã ao unicórnio, B guarda a maçã no baú DEPOIS
  passa(A, 100); passa(B, 100);
  const xa = A.It.ganhar('espada-madeira').uid, xb = B.It.ganhar('espada-bambu').uid;
  A.P.estado().cuidados.inicial.fome = 10;
  assert.ok(A.It.usar(p).ok);
  passa(B, 1000);
  assert.ok(B.It.guardar(p));
  // A joga fora as botas; B continua com a cópia velha delas
  assert.ok(A.It.jogarFora(lixo));
  sincronizar(A, banco); sincronizar(B, banco); sincronizar(A, banco);
  [A, B].forEach((j) => {
    const e = j.P.estado().itens;
    assert.strictEqual(Object.keys(e).length, 5, 'chaves somaram ou sumiram');
    igual(vivos(j), [p, e1, xa, xb].sort());
    assert.strictEqual(onde(j, p), 'bau', 'vale a mexida mais nova (guardou depois de comer)');
    assert.strictEqual(e[lixo].onde, 'fora', 'a lápide não valeu: o item voltou');
  });
  // o contrário: comer depois de guardar some como comida
  passa(A, 5000);
  A.P.estado().cuidados.inicial.fome = 10;
  assert.ok(A.It.retirar(p));
  assert.ok(A.It.usar(p).ok);
  sincronizar(A, banco); sincronizar(B, banco);
  assert.strictEqual(onde(B, p), null);
  // comutativa e idempotente
  const a = copia(A.P.estado().itens), b = copia(B.P.estado().itens);
  const J = A.R._progresso, def = J.campos.itens;
  igual(J.juntarCampo(def, a, b), J.juntarCampo(def, b, a));
  igual(J.juntarCampo(def, a, a), a);
});

test('itens: vestido em conflito e mochila acima de 20 depois da mescla: resolvidos na leitura, sem gravar', () => {
  const banco = { valor: null };
  const A = carregado({ save: saveHoje() });
  sincronizar(A, banco);
  const B = carregado({ save: copia(banco.valor), agora: A.relogio.agora });
  const ha = A.It.ganhar('capacete-panela').uid, hb = B.It.ganhar('chapeu-flor').uid;
  passa(A, 10); passa(B, 20);
  A.It.vestir(ha); B.It.vestir(hb);
  for (let i = 0; i < 12; i++) { passa(A, 1); passa(B, 1); A.It.ganhar('espada-madeira'); B.It.ganhar('escudo-madeira'); }
  sincronizar(A, banco); sincronizar(B, banco);
  const salvos = B.contagem.salvar, texto = B.guardado[B.chave];
  // a leitura não grava
  assert.strictEqual(B.It.vestes().cabeca, 'chapeu-flor', 'vale o de em maior');
  assert.strictEqual(onde(B, ha), 'mochila');
  assert.strictEqual(B.P.estado().itens[ha].onde, 'vestido', 'a leitura gravou o derivado');
  assert.strictEqual(B.It.espacos().usados, 20);
  assert.strictEqual(qtdMochila(B), 20);
  assert.strictEqual(qtdBau(B), 5, 'o excesso aparece no baú');
  assert.strictEqual(vivos(B).length, 26);
  assert.strictEqual(B.contagem.salvar, salvos);
  assert.strictEqual(B.guardado[B.chave], texto);
  // carregar de novo também não grava
  const C = jogo({ loja: B.guardado, agora: B.relogio.agora });
  const g = C.gravacoes[C.chave] || 0;
  C.P.carregar();
  assert.strictEqual(C.gravacoes[C.chave] || 0, g);
  assert.strictEqual(C.It.vestes().cabeca, 'chapeu-flor');
  // tirar o de cima não faz o outro aparecer na cabeça
  passa(C, 100);
  assert.ok(C.It.tirar('cabeca').ok);
  assert.strictEqual(C.It.vestes().cabeca, null);
  assert.strictEqual(vivos(C).length, 26);
});

test('itens: id e onde desconhecidos ficam guardados sem efeito; limpeza de entrada hostil', () => {
  const s = saveHoje();
  s.itens = {
    'mhn3k2a1-x7q2': { id: 'varinha-futuro', onde: 'vestido', em: 50, brilho: 3 },
    'mhn3k2a2-x7q2': { id: 'espada-gelo', onde: 'emprestado', em: 40 },
    'mhn3k2a3-x7q2': { id: 'pocao-pequena', onde: 'mochila', em: 'nada' },
    'chave ruim': { id: 'espada-gelo', onde: 'mochila', em: 1 },
    'mhn3k2a4-x7q2': { onde: 'mochila', em: 1 },
    'mhn3k2a5-x7q2': 'texto',
  };
  const j = carregado({ save: s });
  const e = j.P.estado().itens;
  igual(Object.keys(e).sort(), ['mhn3k2a1-x7q2', 'mhn3k2a2-x7q2', 'mhn3k2a3-x7q2']);
  assert.strictEqual(e['mhn3k2a3-x7q2'].em, 0, 'em estragado vira 0');
  igual(vivos(j), ['mhn3k2a3-x7q2']);
  igual(j.It.vestes().espada, null);
  j.It.ganhar('espada-sol');
  const gravado = j.lido().itens;
  igual(gravado['mhn3k2a1-x7q2'], { id: 'varinha-futuro', onde: 'vestido', em: 50, brilho: 3 }, 'a gravação não conservou');
  assert.strictEqual(gravado['mhn3k2a2-x7q2'].onde, 'emprestado');
});

test('itens: cópia -novidades guarda e devolve; Novo ciclo mantém', () => {
  const A = carregado({ save: saveHoje() });
  const u = A.It.ganhar('armadura-dragao').uid;
  A.It.vestir(u);
  const cp = A.copiaGuardada();
  assert.ok(cp.campos && cp.campos.itens && cp.campos.itens[u], 'a cópia não levou os itens');
  // o save perdeu o campo (aparelho antigo gravou sem ele? não pode, mas a cópia devolve mesmo assim)
  const semItens = copia(A.P.estado()); delete semItens.itens;
  const B = carregado({ save: semItens, copia: cp, agora: A.relogio.agora + 10 });
  assert.strictEqual(B.It.vestes().armadura, 'armadura-dragao', 'a cópia não devolveu');
  B.P.novoCiclo();
  assert.strictEqual(B.It.vestes().armadura, 'armadura-dragao', 'o Novo ciclo apagou os itens');
});

test('itens: aparelho da versão antiga (sem o campo) recebe e devolve os itens intactos', () => {
  const loja = {};
  const N = carregado({ save: saveHoje(), loja });
  const us = ['espada-gelo', 'pocao-pequena', 'chapeu-coroa'].map((id) => N.It.ganhar(id).uid);
  N.It.vestir(us[2]);
  N.It.jogarFora(us[1]);
  const antes = copia(N.P.estado().itens);
  // 1. a versão antiga no mesmo aparelho: carrega, ganha estrelas, grava
  const V = jogo({ loja, versaoAntiga: true, agora: N.relogio.agora + 1000 });
  assert.strictEqual(V.R.Itens, undefined, 'o aparelho antigo carregou os itens');
  V.P.carregar();
  V.P.ganharEstrelas(3); V.P.salvar();
  igual(JSON.parse(loja[V.chave]).itens, antes, 'a versão antiga mexeu no campo ao gravar');
  // 2. enquanto isso, a nova ganha mais um item (no aparelho dela, ainda sem ver a antiga)
  N.relogio.agora = V.relogio.agora + 500;
  const extra = N.It.ganhar('botas-dragao').uid;
  const remoto = copia(N.P.estado());
  // a antiga junta o remoto da nova: mais novo, ela leva o campo inteiro; mais velho, fica com o dela (a regra de antes,
  // para todo campo que ela não conhece: save-e-mescla.md §4.4)
  const maisNovo = copia(remoto); maisNovo.atualizado = V.P.estado().atualizado + 10;
  igual(V.P.mesclar(copia(V.P.estado()), maisNovo).itens, remoto.itens);
  const maisVelho = copia(remoto); maisVelho.atualizado = V.P.estado().atualizado - 10;
  const m1 = V.P.mesclar(copia(V.P.estado()), maisVelho);
  igual(m1.itens, antes);
  const m2 = m1;
  // na nova, um lado sem o campo (mais novo) não apaga
  const semCampo = copia(m1); delete semCampo.itens; semCampo.atualizado += 99;
  igual(N.P.mesclar(copia(m1), semCampo).itens, antes, 'o lado sem o campo apagou os itens');
  // 3. a nova junta o que a antiga deixou (o pior caso, sem o item extra), nas duas ordens: nada some nem duplica
  [[N.P.estado(), m2], [m2, N.P.estado()]].forEach(([a, b]) => {
    const m = N.P.mesclar(copia(a), copia(b));
    igual(Object.keys(m.itens).sort(), us.concat(extra).sort());
    assert.strictEqual(m.itens[us[1]].onde, 'fora');
    assert.strictEqual(m.itens[us[2]].onde, 'vestido');
    assert.strictEqual(m.estrelas.ganhas, saveHoje().estrelas.ganhas + 3, 'as estrelas da antiga sumiram');
  });
  // 4. no mesmo aparelho: a antiga gravou m2 por cima; a nova carrega (o campo da antiga, e a cópia -novidades
  //    devolve o item extra que a nova tinha gravado) e sincroniza
  loja[V.chave] = JSON.stringify(m2);
  const N2 = carregado({ loja, agora: N.relogio.agora + 1000 });
  assert.strictEqual(N2.It.vestes().cabeca, 'chapeu-coroa');
  igual(vivos(N2), [us[0], us[2], extra].sort(), 'a cópia -novidades não devolveu o item');
  const banco = { valor: copia(N.P.estado()) };
  sincronizar(N2, banco);
  igual(vivos(N2), [us[0], us[2], extra].sort(), 'o item ganho na nova sumiu');
});

test('itens: PROGRESSO_REMOTO avisa "remoto" só quando o campo mudou', () => {
  const j = carregado({ save: saveHoje() });
  j.R.modulo('itens').iniciar();
  const EV = j.R.EVENTOS;
  j.R.util.emit(EV.PROGRESSO_REMOTO, j.P.estado());
  assert.ok(!j.itensEv.some((e) => e.motivo === 'remoto'));
  j.P.estado().itens['mhn3k2a1-x7q2'] = { id: 'espada-gelo', onde: 'mochila', em: 5 };
  j.R.util.emit(EV.PROGRESSO, j.P.estado());
  j.R.util.emit(EV.PROGRESSO_REMOTO, j.P.estado());
  igual(j.itensEv.pop(), { tipo: 'mudou', motivo: 'remoto' });
  assert.strictEqual(j.It.mochila().length, 1, 'a leitura não se refez depois do remoto');
});
