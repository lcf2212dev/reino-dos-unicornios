// Testes do save (js/progresso.js) e da fome e sede (js/cuidados.js), sem navegador.
// Uso: node ferramentas/testar-save.js   (sai com código 1 se algum teste falhar)
// Carrega config, unicórnios, matérias, progresso e cuidados num vm com um localStorage, um
// relógio, timers e um document de mentira. Saves 100% sintéticos (valores inventados).
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const raiz = path.join(__dirname, '..');

/* ---------- um jogo inteiro num vm, com relógio próprio ---------- */
function montar(opcoes = {}) {
  const relogio = { agora: 1760000000000 };
  const intervalos = [];
  const ouvintes = {};
  const guardado = {};
  class DataFalsa extends Date {
    constructor(...a) { super(...(a.length ? a : [relogio.agora])); }
    static now() { return relogio.agora; }
  }
  const documento = {
    hidden: false,
    addEventListener(ev, fn) { (ouvintes['doc:' + ev] = ouvintes['doc:' + ev] || []).push(fn); },
  };
  const ctx = {
    console, Math, JSON, Date: DataFalsa,
    setTimeout: () => 0, clearTimeout: () => {},
    setInterval: (fn, ms) => { intervalos.push({ fn, ms }); return intervalos.length; },
    clearInterval: () => {},
    document: documento,
    location: { protocol: 'file:', search: '' },
    localStorage: {
      getItem: (k) => (k in guardado ? guardado[k] : null),
      setItem: (k, v) => { guardado[k] = String(v); },
    },
    addEventListener(ev, fn) { (ouvintes['win:' + ev] = ouvintes['win:' + ev] || []).push(fn); },
    PA: { APARENCIA_PADRAO: { pele: '#f1c7a3', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ffd34d' } },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  const carregar = (rel) => vm.runInContext(fs.readFileSync(path.join(raiz, rel), 'utf8'), ctx, { filename: rel });
  const pasta = (rel) => fs.readdirSync(path.join(raiz, rel)).filter((f) => f.endsWith('.js')).sort().map((f) => rel + '/' + f);
  carregar('js/config.js');
  carregar('js/unicornios.js');
  pasta('js/materias').forEach(carregar);
  pasta('js/provas').forEach(carregar);
  carregar('js/progresso.js');
  carregar('js/cuidados.js');
  const R = ctx.Reino;
  if (opcoes.save) guardado[R.config.chaveSave] = JSON.stringify(opcoes.save);
  // o que o resto do jogo faria: Cena, Claude (balão) e contagem de gravações
  const cena = { estado: 'mapa' };
  const balao = { aberto: false, falas: [] };
  R.Cena = { estado: () => cena.estado };
  R.Claude = { aberto: () => balao.aberto, falar: (t, o) => { balao.falas.push({ t, o, em: relogio.agora }); return Promise.resolve(null); } };
  const salvarOriginal = R.Progresso.salvar;
  const contagem = { salvar: 0 };
  R.Progresso.salvar = function () { contagem.salvar++; return salvarOriginal.apply(this, arguments); };
  const eventos = [];
  R.util.on('cuidados', (d) => eventos.push(d));
  return {
    R, P: R.Progresso, C: R.Cuidados, ctx, relogio, cena, balao, contagem, eventos, documento, guardado,
    // o relógio anda ms em passos de 1 s, chamando o setInterval do jogo
    andar(ms, passo = 1000) {
      for (let t = 0; t < ms; t += passo) { relogio.agora += passo; intervalos.forEach((i) => i.fn()); }
    },
    tocar() { (ouvintes['win:pointerdown'] || []).forEach((fn) => fn({})); },
    ouvintes,
  };
}

/* ---------- saves sintéticos ---------- */
// formato de HOJE (sem cuidados, despensa nem ajustes.surpresa)
function saveAtual() {
  return {
    v: 1, geracao: 1, ciclo: 1, criado: 1750000000000, atualizado: 1750600000000, comecou: true,
    aparencia: { pele: '#d9a07a', cabelo: '#a0673a', roupa: '#9b7bff', laco: '#ffd34d' },
    corInicial: 'lilas',
    salas: { h1: { vezes: 1, melhor: 6, feita: 1750100000000, perfeita: true, calma: true }, h2: { vezes: 1, melhor: 4, feita: 1750200000000 } },
    treinos: { historia: { vezes: 1, melhor: 'prata' } },
    provas: { 'historia-3bim': { tentativas: 1, notas: [8.5], melhor: 8.5 } },
    unis: {
      inicial: { em: 1750000000000, xp: 95, chocado: true, nome: 'Teste Azul' },
      'h-cartinha': { em: 1750100000000, xp: 0, chocado: true },
      'h-postal': { em: 1750200000000, xp: 0, chocado: false },
    },
    montaria: 'inicial',
    estrelas: { ganhas: 37, gastas: 8 },
    loja: { flor: true },
    usando: { enfeites: ['flor'], capa: false, asasFada: false, estrelinhas: false },
    pago: { historia: 4 },
    ajustes: { som: true, musica: false, voz: true, animacoes: true, texto: 1, setas: false },
    ritualVisto: true,
  };
}
const copia = (o) => JSON.parse(JSON.stringify(o));
function semNovos(e) { e = copia(e); delete e.cuidados; delete e.despensa; if (e.ajustes) delete e.ajustes.surpresa; return e; }

/* ---------- os testes ---------- */
const testes = [];
function teste(nome, fn) { testes.push({ nome, fn }); }

teste('save no formato de hoje carrega com os mesmos valores e unicórnios satisfeitos', () => {
  const orig = saveAtual();
  const j = montar({ save: orig });
  const e = j.P.carregar();
  assert.deepStrictEqual(semNovos(e), orig, 'algum campo de hoje mudou ao carregar');
  assert.deepStrictEqual(copia(e.cuidados), {});
  assert.deepStrictEqual(copia(e.despensa), {});
  assert.strictEqual(e.ajustes.surpresa, true);
  assert.deepStrictEqual(copia(j.C.niveis('inicial')), { fome: 100, sede: 100 });
  assert.deepStrictEqual(copia(j.C.niveis('h-cartinha')), { fome: 100, sede: 100 });
  assert.strictEqual(j.C.fatorVelocidade(), 1);
  assert.strictEqual(j.C.iconeMontaria(), null);
  // dinheiro e estrelas iguais
  assert.strictEqual(j.P.estrelas(), 29);
});

teste('estadoNovo tem surpresa ligada; completar não liga a surpresa desligada', () => {
  const j = montar();
  const e = j.P.carregar();
  assert.strictEqual(e.ajustes.surpresa, true);
  assert.deepStrictEqual(copia(e.cuidados), {});
  const s = saveAtual(); s.ajustes.surpresa = false;
  const j2 = montar({ save: s });
  assert.strictEqual(j2.P.carregar().ajustes.surpresa, false);
});

teste('mescla: estado novo x antigo mais recente sem os campos preserva cuidados e despensa', () => {
  const j = montar();
  const novo = saveAtual();
  novo.atualizado = 1750500000000;
  novo.cuidados = { inicial: { fome: 20, sede: 10, em: 1750500000000 } };
  novo.despensa = { maca: { compradas: 3, usadas: 1 } };
  const antigo = saveAtual();
  antigo.atualizado = 1750900000000;   // aparelho com a versão antiga, gravou por último
  [[novo, antigo], [antigo, novo]].forEach(([a, b]) => {
    const r = j.P.mesclar(copia(a), copia(b));
    assert.deepStrictEqual(r.cuidados, novo.cuidados);
    assert.deepStrictEqual(r.despensa, novo.despensa);
    assert.strictEqual(r.atualizado, 1750900000000);
  });
});

teste('mescla: por unicórnio vale o `em` mais recente (empate: o lado mais recente)', () => {
  const j = montar();
  const a = saveAtual(); a.atualizado = 1750900000000;
  const b = saveAtual(); b.atualizado = 1750500000000;
  a.cuidados = { inicial: { fome: 80, sede: 80, em: 100 }, 'h-cartinha': { fome: 50, sede: 50, em: 500 }, soA: { fome: 1, sede: 1, em: 1 } };
  b.cuidados = { inicial: { fome: 30, sede: 90, em: 200 }, 'h-cartinha': { fome: 60, sede: 60, em: 500 }, soB: { fome: 2, sede: 2, em: 2 } };
  [[a, b], [b, a]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    assert.deepStrictEqual(r.cuidados.inicial, b.cuidados.inicial, 'em maior vence');
    assert.deepStrictEqual(r.cuidados['h-cartinha'], a.cuidados['h-cartinha'], 'empate: lado mais recente');
    assert.deepStrictEqual(r.cuidados.soA, a.cuidados.soA);
    assert.deepStrictEqual(r.cuidados.soB, b.cuidados.soB);
  });
});

teste('mescla: despensa pelo maior contador', () => {
  const j = montar();
  const a = saveAtual(); a.atualizado = 1750900000000;
  const b = saveAtual(); b.atualizado = 1750500000000;
  a.despensa = { maca: { compradas: 2, usadas: 2 }, bolo: { compradas: 1, usadas: 0 } };
  b.despensa = { maca: { compradas: 5, usadas: 1 }, feno: { compradas: 1, usadas: 0 } };
  [[a, b], [b, a]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    assert.deepStrictEqual(r.despensa, { maca: { compradas: 5, usadas: 2 }, bolo: { compradas: 1, usadas: 0 }, feno: { compradas: 1, usadas: 0 } });
  });
});

teste('mescla: geração maior vence inteira', () => {
  const j = montar();
  const velho = saveAtual(); velho.atualizado = 1750900000000;
  velho.cuidados = { inicial: { fome: 5, sede: 5, em: 9e12 } }; velho.despensa = { bolo: { compradas: 9, usadas: 0 } };
  const apagou = saveAtual(); apagou.geracao = 2; apagou.atualizado = 1750100000000; apagou.cuidados = {}; apagou.despensa = {};
  [[velho, apagou], [apagou, velho]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    assert.deepStrictEqual(r, apagou);
  });
});

teste('mescla: as regras dos campos de hoje não mudam com os campos novos', () => {
  const j = montar();
  const a = saveAtual(); a.atualizado = 1750900000000;
  a.salas.h3 = { vezes: 1, melhor: 3, feita: 1750800000000 }; a.estrelas = { ganhas: 50, gastas: 20 }; a.loja.coroa = true;
  a.unis.inicial.xp = 120; a.provas['historia-3bim'] = { tentativas: 2, notas: [8.5, 10], melhor: 10, premio: 'raro', premioEm: 1750850000000 };
  const b = saveAtual(); b.atualizado = 1750500000000; b.pago.historia = 6; b.treinos.historia.melhor = 'ouro';
  const sem = j.P.mesclar(copia(a), copia(b));
  const a2 = copia(a), b2 = copia(b);
  a2.cuidados = { inicial: { fome: 10, sede: 10, em: 5 } }; b2.despensa = { maca: { compradas: 1, usadas: 0 } };
  const com = j.P.mesclar(a2, b2);
  assert.deepStrictEqual(copia(semNovos(com)), copia(sem));
  assert.strictEqual(sem.estrelas.ganhas, 50); assert.strictEqual(sem.pago.historia, 6); assert.strictEqual(sem.treinos.historia.melhor, 'ouro');
  assert.strictEqual(sem.loja.coroa, true); assert.strictEqual(sem.salas.h3.melhor, 3); assert.strictEqual(sem.provas['historia-3bim'].premio, 'raro');
  // dois saves de hoje: a mescla não inventa campos novos
  assert.strictEqual('cuidados' in sem, false); assert.strictEqual('despensa' in sem, false);
});

teste('novo ciclo mantém cuidados e despensa; apagar tudo zera', () => {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 40, sede: 30, em: 1750500000000 } };
  s.despensa = { maca: { compradas: 3, usadas: 1 } };
  const j = montar({ save: s });
  j.P.carregar();
  j.P.novoCiclo();
  let e = j.P.estado();
  assert.strictEqual(e.ciclo, 2);
  assert.deepStrictEqual(copia(e.salas), {});
  assert.deepStrictEqual(copia(e.cuidados), s.cuidados);
  assert.deepStrictEqual(copia(e.despensa), s.despensa);
  j.P.apagarTudo();
  e = j.P.estado();
  assert.strictEqual(e.geracao, 2);
  assert.deepStrictEqual(copia(e.cuidados), {});
  assert.deepStrictEqual(copia(e.despensa), {});
  assert.strictEqual(e.ajustes.surpresa, true);
});

/* ---------- fome e sede ---------- */
function jogoCarregado(ajuste) {
  const s = saveAtual();
  if (ajuste) ajuste(s);
  const j = montar({ save: s });
  j.P.carregar();
  return j;
}

teste('nada gasta antes de iniciar; só a montaria gasta; ritmo de 120 e 60 minutos', () => {
  const j = jogoCarregado();
  j.andar(60 * 1000);
  assert.deepStrictEqual(copia(j.C.niveis()), { fome: 100, sede: 100 }, 'gastou antes do Entrar no Reino');
  j.C.iniciar();
  for (let m = 0; m < 30; m++) { j.tocar(); j.andar(60 * 1000); }   // 30 min tocando
  const n = j.C.niveis('inicial');
  assert.ok(Math.abs(n.fome - 75) < 0.2, 'fome ' + n.fome);
  assert.ok(Math.abs(n.sede - 50) < 0.2, 'sede ' + n.sede);
  assert.deepStrictEqual(copia(j.C.niveis('h-cartinha')), { fome: 100, sede: 100 }, 'unicórnio que não é a montaria gastou');
});

teste('sem toque por 5 minutos e aba escondida: não gasta', () => {
  const j = jogoCarregado();
  j.C.iniciar();
  j.andar(5 * 60 * 1000);                 // 5 min depois do Entrar (que conta como toque)
  const a = j.C.niveis().sede;
  assert.strictEqual(j.C.ativo(), false);
  j.andar(20 * 60 * 1000);
  assert.strictEqual(j.C.niveis().sede, a, 'gastou sem toque');
  j.tocar();
  assert.strictEqual(j.C.ativo(), true);
  j.documento.hidden = true;
  assert.strictEqual(j.C.ativo(), false);
  j.andar(60 * 1000);
  assert.strictEqual(j.C.niveis().sede, a, 'gastou com a aba escondida');
  j.documento.hidden = false;
  j.andar(60 * 1000);
  assert.ok(j.C.niveis().sede < a);
});

teste('passo limitado a 5 s (aba que volta do fundo não dá salto)', () => {
  const j = jogoCarregado();
  j.C.iniciar();
  j.relogio.agora += 60 * 60 * 1000;       // uma hora sem nenhum passo do relógio (aba no fundo)
  j.tocar();
  j.andar(1000);                           // o passo seguinte vale no máximo 5 s
  const esperado = 100 - 5000 / (60 * 60000) * 100;
  assert.ok(Math.abs(j.C.niveis().sede - esperado) < 0.01, 'sede ' + j.C.niveis().sede);
});

teste('abaixo de 25 anda a 70%; comer e beber voltam a 1 na hora; estrelas certas; água de graça', () => {
  const j = jogoCarregado((s) => { s.estrelas = { ganhas: 100, gastas: 0 }; });
  j.C.avancar(46 * 60 * 1000);             // sede 23,3 e fome 61,7
  assert.strictEqual(j.C.fatorVelocidade(), 0.7);
  assert.strictEqual(j.C.iconeMontaria(), '💧');
  const antes = j.P.estrelas();
  const b = j.C.beber('inicial');
  assert.strictEqual(b.ok, true);
  assert.strictEqual(j.C.niveis().sede, 100);
  assert.strictEqual(j.P.estrelas(), antes, 'beber gastou estrelas');
  assert.strictEqual(j.C.fatorVelocidade(), 1);
  assert.strictEqual(j.C.beber('inicial').motivo, 'cheio');
  j.C.avancar(60 * 60 * 1000);             // fome 11,7 e sede 0
  assert.strictEqual(j.C.iconeMontaria(), '💧', 'sede tem prioridade no ícone');
  j.C.beber();
  assert.strictEqual(j.C.iconeMontaria(), '🍎');
  assert.strictEqual(j.C.fatorVelocidade(), 0.7);
  assert.strictEqual(j.C.alimentar('inicial', 'maca').motivo, 'sem-comida');
  const precos = {};
  j.R.config.comidas.forEach((c) => { precos[c.id] = c.preco; });
  ['cenoura', 'maca', 'feno', 'biscoito', 'bolo'].forEach((id) => {
    const e0 = j.P.estrelas();
    assert.strictEqual(j.C.comprar(id).ok, true);
    assert.strictEqual(e0 - j.P.estrelas(), precos[id], 'preço de ' + id);
  });
  assert.deepStrictEqual(copia(j.C.despensa().map((d) => d.comida.id)), ['cenoura', 'maca', 'feno', 'biscoito', 'bolo']);
  const f0 = j.C.niveis().fome;
  const r = j.C.alimentar('inicial', 'cenoura');
  assert.strictEqual(r.ok, true);
  assert.ok(Math.abs(r.depois - (f0 + 20)) < 1e-9 && r.antes === f0);
  assert.strictEqual(j.C.fatorVelocidade(), 1, 'comeu e continuou lento');
  assert.strictEqual(j.C.quantidade('cenoura'), 0);
  assert.strictEqual(j.C.alimentar('inicial', 'bolo').depois, 100, 'bolo enche');
  assert.strictEqual(j.C.alimentar('inicial', 'maca').motivo, 'cheio');
  assert.strictEqual(j.C.quantidade('maca'), 1, 'cheio não gasta a comida');
  // faltando estrelas
  j.P.estado().estrelas = { ganhas: 10, gastas: 7 };
  assert.deepStrictEqual(copia(j.C.comprar('bolo')), { ok: false, motivo: 'estrelas', faltam: 5 });
  assert.strictEqual(j.P.estrelas(), 3);
  // unicórnio ainda no ovo
  assert.strictEqual(j.C.alimentar('h-postal', 'maca').motivo, 'sem-uni');
  assert.strictEqual(j.C.beber('h-postal').motivo, 'sem-uni');
  assert.strictEqual(j.C.beber('nao-existe').motivo, 'sem-uni');
});

teste('gravação espaçada: nunca a cada passo; cruzar o 25 grava na hora', () => {
  const j = jogoCarregado();
  j.C.iniciar();
  const s0 = j.contagem.salvar;
  for (let m = 0; m < 40; m++) { j.tocar(); j.andar(60 * 1000); }   // 40 min = 2400 passos
  const gravacoes = j.contagem.salvar - s0;
  assert.ok(gravacoes <= 42 && gravacoes >= 30, 'gravações em 40 min: ' + gravacoes);
  // cruzar o 25 da sede (45 min): grava no mesmo passo
  let salvouNoCruzamento = false;
  for (let s = 0; s < 6 * 60; s++) {
    if (s % 60 === 0) j.tocar();
    const antes = j.contagem.salvar, eraBaixo = j.C.baixo().sede;
    j.andar(1000);
    if (!eraBaixo && j.C.baixo().sede) salvouNoCruzamento = j.contagem.salvar > antes;
  }
  assert.ok(salvouNoCruzamento, 'não gravou ao cruzar o 25');
  // o que foi gravado no aparelho já tem a sede baixa
  const gravado = JSON.parse(j.guardado[j.R.config.chaveSave]);
  assert.ok(gravado.cuidados.inicial.sede < 25);
  // evento a cada ponto inteiro (não a cada passo)
  assert.ok(j.eventos.length > 50 && j.eventos.length < 120, 'eventos: ' + j.eventos.length);
});

teste('lembrete: só com ela livre e no máximo 1 a cada 10 minutos', () => {
  const j = jogoCarregado((s) => { s.cuidados = { inicial: { fome: 80, sede: 20, em: 1 } }; });
  j.cena.estado = 'atividade';
  j.C.iniciar();
  j.andar(3000);
  assert.strictEqual(j.balao.falas.length, 0, 'lembrou com tela aberta');
  j.cena.estado = 'interior'; j.balao.aberto = true;
  j.andar(3000);
  assert.strictEqual(j.balao.falas.length, 0, 'lembrou com o balão aberto');
  j.balao.aberto = false;
  j.andar(1000);
  assert.strictEqual(j.balao.falas.length, 1);
  assert.strictEqual(j.balao.falas[0].t, j.C.frases.lembreteSede);
  assert.strictEqual(j.balao.falas[0].o.tempo, 6000);
  for (let m = 0; m < 9; m++) { j.tocar(); j.andar(60 * 1000); }
  assert.strictEqual(j.balao.falas.length, 1, 'lembrou antes de 10 min');
  j.tocar(); j.andar(61 * 1000);
  assert.strictEqual(j.balao.falas.length, 2);
  const intervalo = j.balao.falas[1].em - j.balao.falas[0].em;
  assert.ok(intervalo >= 10 * 60 * 1000, 'intervalo ' + intervalo);
});

teste('avancar gasta mesmo parada; depurar e falas no formato do contrato', () => {
  const j = jogoCarregado();
  const d = j.C.avancar(12 * 60 * 1000);   // sem iniciar, sem toque
  assert.ok(Math.abs(d.fome - 90) < 0.01 && Math.abs(d.sede - 80) < 0.01);
  assert.deepStrictEqual(Object.keys(d).sort(), ['ativo', 'despensa', 'fator', 'fome', 'icone', 'montaria', 'sede', 'todos']);
  assert.deepStrictEqual(Object.keys(d.todos).sort(), ['h-cartinha', 'inicial']);
  const chaves = ['lembreteFome', 'lembreteSede', 'lembreteAmbos', 'faltamEstrelas', 'guardado', 'comeu', 'cheio', 'bebeu', 'semSede', 'despensaVazia'];
  assert.deepStrictEqual(Object.keys(j.C.frases).sort(), chaves.slice().sort());
  assert.strictEqual(j.C.vozDaFrase('comeu'), 'unicornio');
  assert.strictEqual(j.C.vozDaFrase('bebeu'), 'unicornio');
  assert.strictEqual(j.C.vozDaFrase('lembreteFome'), 'claude');
  const f = j.C.falas();
  assert.strictEqual(f.length, chaves.length);
  f.forEach((x) => {
    assert.ok(x.texto && (x.voz === 'claude' || x.voz === 'unicornio'));
    // frases de 3 ou mais palavras
    x.texto.split(/(?<=[.!?])\s+/).filter((fr) => /\p{L}/u.test(fr)).forEach((fr) => {
      const palavras = fr.replace(/[^\p{L}\s-]/gu, ' ').trim().split(/\s+/).filter(Boolean);
      assert.ok(palavras.length >= 3, 'frase curta: ' + fr);
    });
  });
});

teste('a mescla troca o objeto: os cuidados leem o estado novo', () => {
  const j = jogoCarregado();
  j.C.iniciar();
  j.C.avancar(10 * 60 * 1000);
  const remoto = copia(j.P.estado());
  remoto.cuidados.inicial = { fome: 12, sede: 99, em: j.relogio.agora + 1 };
  remoto.atualizado = j.relogio.agora + 1;
  const e = j.P.mesclar(j.P.estado(), remoto);
  j.ctx.localStorage.setItem(j.R.config.chaveSave, JSON.stringify(e));
  j.P.carregar();                          // troca o objeto, como a mescla faz
  assert.strictEqual(j.C.niveis().fome, 12);
  j.tocar(); j.andar(1000);
  assert.ok(j.P.estado().cuidados.inicial.fome < 12);
});

let falhas = 0;
testes.forEach((t) => {
  try { t.fn(); console.log('ok   ' + t.nome); }
  catch (e) { falhas++; console.log('FALHOU ' + t.nome + '\n       ' + (e && e.message)); }
});
console.log(`\n${testes.length - falhas}/${testes.length} testes passaram`);
process.exit(falhas ? 1 : 0);
