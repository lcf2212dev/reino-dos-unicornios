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
  const gravacoes = {};   // setItem por chave
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
    setTimeout: opcoes.timersReais ? setTimeout : () => 0, clearTimeout: opcoes.timersReais ? clearTimeout : () => {},
    setInterval: (fn, ms) => { intervalos.push({ fn, ms }); return intervalos.length; },
    clearInterval: () => {},
    document: documento,
    location: { protocol: 'file:', search: '' },
    localStorage: opcoes.semArmazenamento ? {
      getItem: () => { throw new Error('bloqueado'); },
      setItem: () => { throw new Error('bloqueado'); },
    } : {
      getItem: (k) => (k in guardado ? guardado[k] : null),
      setItem: (k, v) => { gravacoes[k] = (gravacoes[k] || 0) + 1; guardado[k] = String(v); },
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
  if (opcoes.copia !== undefined) guardado[R.config.chaveSave + '-novidades'] = typeof opcoes.copia === 'string' ? opcoes.copia : JSON.stringify(opcoes.copia);
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
    R, P: R.Progresso, C: R.Cuidados, ctx, relogio, cena, balao, contagem, eventos, documento, guardado, gravacoes,
    chaveCopia: R.config.chaveSave + '-novidades',
    copiaGuardada() { return JSON.parse(guardado[R.config.chaveSave + '-novidades']); },
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
function semNovos(e) { e = copia(e); delete e.cuidados; delete e.despensa; if (e.ajustes) { delete e.ajustes.surpresa; delete e.ajustes.surpresaEm; } return e; }

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

/* ---------- cópia de segurança dos campos novos (chave '<chaveSave>-novidades') ---------- */
// o que a versão antiga faz: regrava o save principal com o estado dela, sem os campos novos
function abaAntigaGrava(j, e) { j.guardado[j.R.config.chaveSave] = JSON.stringify(semNovos(e)); }

teste('cópia: salvar grava a cópia uma vez por gravação, com geração, ciclo e os campos novos', () => {
  const s = saveAtual(); s.despensa = { maca: { compradas: 2, usadas: 0 } }; s.ajustes.surpresa = false;
  const j = montar({ save: s });
  j.P.carregar();
  j.P.salvar(true);
  j.P.salvar(true);
  assert.strictEqual(j.gravacoes[j.R.config.chaveSave], 2);
  assert.strictEqual(j.gravacoes[j.chaveCopia], 2, 'a cópia não pode ser gravada mais vezes que o save');
  const c = j.copiaGuardada();
  assert.strictEqual(c.geracao, 1); assert.strictEqual(c.ciclo, 1); assert.strictEqual(c.atualizado, j.P.estado().atualizado);
  assert.deepStrictEqual(c.despensa, s.despensa); assert.deepStrictEqual(c.cuidados, {}); assert.strictEqual(c.surpresa, false);
});

teste('cópia ausente: carrega igual a antes', () => {
  const orig = saveAtual();
  const j = montar({ save: orig });
  const e = j.P.carregar();
  assert.deepStrictEqual(semNovos(e), orig);
  assert.deepStrictEqual(copia(e.despensa), {}); assert.deepStrictEqual(copia(e.cuidados), {}); assert.strictEqual(e.ajustes.surpresa, true);
});

teste('cópia corrompida: ignorada sem erro e sem NaN', () => {
  ['{{{', '[]', '"texto"', 'null', '42',
    JSON.stringify({ geracao: 1, despensa: [1, 2], cuidados: 'x', surpresa: 'sim' }),
    JSON.stringify({ geracao: 1, despensa: { maca: { compradas: 'abc', usadas: 0 }, bolo: null, feno: [3] },
      cuidados: { inicial: { fome: 'muita', sede: 1, em: 5 }, x: 7 } }),
  ].forEach((bruto) => {
    const orig = saveAtual(); orig.despensa = { maca: { compradas: 1, usadas: 0 } };
    const j = montar({ save: orig, copia: bruto });
    const e = j.P.carregar();
    assert.deepStrictEqual(copia(e.despensa), orig.despensa, bruto);
    assert.deepStrictEqual(copia(e.cuidados), {}, bruto);
    assert.strictEqual(e.ajustes.surpresa, true, bruto);
    j.P.salvar(true);                       // e regrava a cópia boa por cima
    assert.deepStrictEqual(j.copiaGuardada().despensa, orig.despensa);
  });
});

teste('cópia de geração menor (antes de "Apagar tudo"): ignorada e regravada com o estado', () => {
  const s = saveAtual(); s.geracao = 2;
  const j = montar({ save: s, copia: { geracao: 1, ciclo: 1, despensa: { bolo: { compradas: 9, usadas: 0 } },
    cuidados: { inicial: { fome: 3, sede: 3, em: 9e12 } }, surpresa: false } });
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e.despensa), {}); assert.deepStrictEqual(copia(e.cuidados), {}); assert.strictEqual(e.ajustes.surpresa, true);
  j.P.salvar(true);
  const c = j.copiaGuardada();
  assert.strictEqual(c.geracao, 2); assert.deepStrictEqual(c.despensa, {}); assert.deepStrictEqual(c.cuidados, {});
});

teste('cópia com despensa maior: vale o maior contador, nunca diminui', () => {
  const s = saveAtual(); s.despensa = { maca: { compradas: 2, usadas: 2 }, bolo: { compradas: 4, usadas: 1 } };
  const j = montar({ save: s, copia: { geracao: 1, despensa: { maca: { compradas: 5, usadas: 1 }, feno: { compradas: 1, usadas: 0 }, bolo: { compradas: 1, usadas: 0 } } } });
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e.despensa), { maca: { compradas: 5, usadas: 2 }, bolo: { compradas: 4, usadas: 1 }, feno: { compradas: 1, usadas: 0 } });
});

teste('cópia com cuidados: vale o `em` mais recente (empate: o estado)', () => {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 80, sede: 80, em: 1000 }, 'h-cartinha': { fome: 50, sede: 50, em: 900 }, 'h-postal': { fome: 70, sede: 70, em: 500 } };
  const j = montar({ save: s, copia: { geracao: 1, cuidados: {
    inicial: { fome: 20, sede: 30, em: 2000 },     // mais recente: vence
    'h-cartinha': { fome: 10, sede: 10, em: 100 }, // mais antigo: não vence
    'h-postal': { fome: 1, sede: 1, em: 500 },     // empate: fica o do estado
    soCopia: { fome: 60, sede: 40, em: 50 },
  } } });
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e.cuidados), { inicial: { fome: 20, sede: 30, em: 2000 }, 'h-cartinha': s.cuidados['h-cartinha'], 'h-postal': s.cuidados['h-postal'], soCopia: { fome: 60, sede: 40, em: 50 } });
});

teste('cópia com surpresa: só vale quando o estado não tem o campo', () => {
  let j = montar({ save: saveAtual(), copia: { geracao: 1, surpresa: false } });
  assert.strictEqual(j.P.carregar().ajustes.surpresa, false, 'estado sem o campo: vale a cópia');
  const s = saveAtual(); s.ajustes.surpresa = true;
  j = montar({ save: s, copia: { geracao: 1, surpresa: false } });
  assert.strictEqual(j.P.carregar().ajustes.surpresa, true, 'estado com o campo: vale o estado');
});

teste('aba antiga no mesmo navegador grava por último: comida e cuidados voltam da cópia', () => {
  const j = montar({ save: saveAtual() });
  j.P.carregar();
  j.P.estado().despensa.maca = { compradas: 3, usadas: 1 };
  j.P.estado().cuidados.inicial = { fome: 40, sede: 60, em: j.relogio.agora };
  j.P.estado().ajustes.surpresa = false;
  j.P.gastarEstrelas(6); j.P.salvar(true);
  const gastas = j.P.estado().estrelas.gastas;
  abaAntigaGrava(j, j.P.estado());         // a aba velha regrava o save principal sem os campos novos
  const e = j.P.carregar();                 // tudo fechado; abre de novo com o código novo
  assert.deepStrictEqual(copia(e.despensa), { maca: { compradas: 3, usadas: 1 } });
  assert.deepStrictEqual(copia(e.cuidados.inicial), { fome: 40, sede: 60, em: j.relogio.agora });
  assert.strictEqual(e.ajustes.surpresa, false);
  assert.strictEqual(e.estrelas.gastas, gastas);
});

teste('doc/servidor sem os campos e save local sem os campos: a cópia devolve e o doc é regravado com eles', async () => {
  const j = montar({ save: saveAtual() });
  j.P.carregar();
  j.P.estado().despensa.bolo = { compradas: 2, usadas: 0 };
  j.P.estado().cuidados.inicial = { fome: 30, sede: 30, em: j.relogio.agora };
  j.P.salvar(true);
  const antigo = semNovos(j.P.estado()); antigo.atualizado = j.relogio.agora + 5000; antigo.estrelas.ganhas += 1;
  abaAntigaGrava(j, antigo);
  const gravados = [];
  let ouvir = null;
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: true, data: () => ({ estado: copia(antigo), atualizado: antigo.atualizado }) }),
    set: (d) => { gravados.push(copia(d)); return Promise.resolve(); },
    onSnapshot: (fn) => { ouvir = fn; },
  }) }) };
  j.P.carregar();
  await j.P.iniciarNuvem();
  let e = j.P.estado();
  assert.deepStrictEqual(copia(e.despensa), { bolo: { compradas: 2, usadas: 0 } });
  assert.strictEqual(e.cuidados.inicial.fome, 30);
  assert.strictEqual(e.estrelas.ganhas, antigo.estrelas.ganhas);
  assert.ok(gravados.length && gravados[gravados.length - 1].estado.despensa.bolo.compradas === 2, 'o doc volta a ter a despensa');
  // chega pelo onSnapshot outro estado antigo, mais recente, sem os campos, e o save local de novo sem eles
  const antigo2 = copia(antigo); antigo2.atualizado += 5000;
  abaAntigaGrava(j, antigo2);
  j.P.estado().despensa = undefined;        // pior caso: nem a memória tem mais
  ouvir({ exists: true, data: () => ({ estado: copia(antigo2) }), metadata: { hasPendingWrites: false } });
  e = j.P.estado();
  assert.deepStrictEqual(copia(e.despensa), { bolo: { compradas: 2, usadas: 0 } });
  assert.strictEqual(e.cuidados.inicial.fome, 30);
});

teste('"Novo ciclo" mantém e "Apagar tudo" não ressuscita despensa nem cuidados pela cópia', () => {
  const s = saveAtual();
  s.despensa = { maca: { compradas: 3, usadas: 1 } }; s.cuidados = { inicial: { fome: 40, sede: 30, em: 1750500000000 } };
  const j = montar({ save: s });
  j.P.carregar(); j.P.salvar(true);
  j.P.novoCiclo();
  assert.deepStrictEqual(copia(j.P.carregar().despensa), s.despensa);
  assert.strictEqual(j.copiaGuardada().ciclo, 2);
  j.P.apagarTudo();
  assert.deepStrictEqual(j.copiaGuardada().despensa, {}); assert.strictEqual(j.copiaGuardada().geracao, 2);
  let e = j.P.carregar();
  assert.deepStrictEqual(copia(e.despensa), {}); assert.deepStrictEqual(copia(e.cuidados), {});
  // aba antiga apaga tudo (geração 2, sem os campos) com a cópia ainda da geração 1
  const j2 = montar({ save: Object.assign(semNovos(saveAtual()), { geracao: 2, salas: {} }), copia: { geracao: 1, despensa: s.despensa, cuidados: s.cuidados } });
  e = j2.P.carregar();
  assert.deepStrictEqual(copia(e.despensa), {}); assert.deepStrictEqual(copia(e.cuidados), {});
  // e a mescla com um doc da geração 2 também não traz a cópia velha de volta
  const r = j2.P.mesclar(copia(e), Object.assign(semNovos(saveAtual()), { geracao: 2, atualizado: 9e12 }));
  assert.strictEqual(r.despensa && Object.keys(r.despensa).length || 0, 0);
});

teste('localStorage bloqueado: carrega, salva e mescla sem erro', () => {
  const j = montar({ semArmazenamento: true });
  const e = j.P.carregar();
  assert.strictEqual(e.geracao, 1); assert.strictEqual(e.ajustes.surpresa, true);
  e.despensa.maca = { compradas: 1, usadas: 0 };
  j.P.salvar(true);
  assert.deepStrictEqual(copia(j.P.estado().despensa), { maca: { compradas: 1, usadas: 0 } });
});

/* ---------- carimbo da surpresa (ajustes.surpresaEm) ---------- */
teste('surpresa: trocar e salvar carimba; carregar, salvar sem trocar, estadoNovo e apagar tudo não carimbam', () => {
  const j = montar({ save: saveAtual() });
  let e = j.P.carregar();
  assert.strictEqual(e.ajustes.surpresaEm, undefined, 'carregar não carimba');
  j.P.salvar(true);
  assert.strictEqual(j.P.estado().ajustes.surpresaEm, undefined, 'salvar sem trocar não carimba');
  j.relogio.agora += 1000;
  j.P.estado().ajustes.surpresa = false; j.P.salvar(true);          // o que o interruptor de ui.js faz
  assert.strictEqual(j.P.estado().ajustes.surpresaEm, j.relogio.agora);
  assert.strictEqual(j.copiaGuardada().surpresaEm, j.relogio.agora, 'a cópia leva o carimbo');
  const em = j.relogio.agora;
  j.relogio.agora += 1000; j.P.salvar(true);
  assert.strictEqual(j.P.estado().ajustes.surpresaEm, em, 'salvar de novo sem trocar mantém o carimbo');
  j.relogio.agora += 1000; j.P.estado().ajustes.surpresa = true; j.P.salvar(true);
  assert.strictEqual(j.P.estado().ajustes.surpresaEm, j.relogio.agora, 'religar também carimba');
  j.P.apagarTudo();
  assert.strictEqual(j.P.estado().ajustes.surpresaEm, undefined, 'apagar tudo não carimba');
  assert.strictEqual(montar().P.carregar().ajustes.surpresaEm, undefined, 'estadoNovo sem carimbo');
});

teste('surpresa: na mescla vale o carimbo maior, qualquer que seja o lado mais recente; sem carimbo, a regra de antes', () => {
  const j = montar();
  const a = saveAtual(); a.atualizado = 1750900000000; a.ajustes.surpresa = true;
  const b = saveAtual(); b.atualizado = 1750500000000; b.ajustes.surpresa = false; b.ajustes.surpresaEm = 1750400000000;
  [[a, b], [b, a]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    assert.strictEqual(r.ajustes.surpresa, false); assert.strictEqual(r.ajustes.surpresaEm, 1750400000000);
  });
  const a2 = copia(a); a2.ajustes.surpresaEm = 1750450000000;   // religou depois
  [[a2, b], [b, a2]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    assert.strictEqual(r.ajustes.surpresa, true); assert.strictEqual(r.ajustes.surpresaEm, 1750450000000);
  });
  const a3 = copia(a); delete a3.ajustes.surpresaEm; const b3 = copia(b); delete b3.ajustes.surpresaEm;
  assert.strictEqual(j.P.mesclar(copia(a3), copia(b3)).ajustes.surpresa, true, 'sem carimbo: lado mais recente');
  const a4 = semNovos(a);
  assert.strictEqual(j.P.mesclar(copia(a4), copia(b3)).ajustes.surpresa, false, 'sem carimbo e o mais recente sem o campo: vale o outro');
  assert.strictEqual(j.P.mesclar(copia(a4), copia(b)).ajustes.surpresaEm, 1750400000000);
});

teste('surpresa: três aparelhos (desliga no 1, o antigo grava sem o campo, um 3º novo abre) ficam desligados', () => {
  // aparelho 1 (novo): ela desliga
  const um = montar({ save: saveAtual() });
  um.P.carregar(); um.relogio.agora += 1000;
  um.P.estado().ajustes.surpresa = false; um.P.salvar(true);
  let banco = copia(um.P.estado());
  // aparelho antigo: grava por último sem o campo (nem o carimbo)
  const antigo = semNovos(banco); antigo.atualizado = banco.atualizado + 60000; antigo.estrelas.ganhas += 2;
  banco = antigo;
  // aparelho 3 (novo), surpresa ligada por padrão, abre e sincroniza
  const tres = montar({ save: saveAtual() });
  const e3 = tres.P.carregar();
  assert.strictEqual(e3.ajustes.surpresa, true);
  banco = copia(tres.P.mesclar(copia(e3), copia(banco)));
  assert.strictEqual(banco.ajustes.surpresa, true, 'aqui o 3º religa (ninguém tem carimbo no banco)');
  // o aparelho 1 sincroniza: o carimbo dele vence, e o banco e o 3º voltam a desligado
  banco = copia(um.P.mesclar(copia(um.P.estado()), copia(banco)));
  assert.strictEqual(banco.ajustes.surpresa, false); assert.ok(banco.ajustes.surpresaEm > 0);
  assert.strictEqual(tres.P.mesclar(copia(e3), copia(banco)).ajustes.surpresa, false);
  assert.strictEqual(banco.estrelas.ganhas, antigo.estrelas.ganhas);
  // e o aparelho 1 sozinho, mesmo com o banco religado pelo 3º, fica desligado ao reabrir (a cópia tem o carimbo)
  um.guardado[um.R.config.chaveSave] = JSON.stringify(Object.assign(semNovos(antigo), { ajustes: Object.assign({}, antigo.ajustes, { surpresa: true }) }));
  assert.strictEqual(um.P.carregar().ajustes.surpresa, false);
});

teste('surpresa na cópia: carimbo mais novo que o do estado vence; mais velho não', () => {
  const s = saveAtual(); s.ajustes.surpresa = true; s.ajustes.surpresaEm = 5000;
  let j = montar({ save: s, copia: { geracao: 1, surpresa: false, surpresaEm: 6000 } });
  let e = j.P.carregar();
  assert.strictEqual(e.ajustes.surpresa, false); assert.strictEqual(e.ajustes.surpresaEm, 6000);
  j = montar({ save: s, copia: { geracao: 1, surpresa: false, surpresaEm: 4000 } });
  e = j.P.carregar();
  assert.strictEqual(e.ajustes.surpresa, true); assert.strictEqual(e.ajustes.surpresaEm, 5000);
  const s2 = saveAtual(); s2.ajustes.surpresa = true;           // estado sem carimbo (padrão), cópia com carimbo
  j = montar({ save: s2, copia: { geracao: 1, surpresa: false, surpresaEm: 10 } });
  assert.strictEqual(j.P.carregar().ajustes.surpresa, false);
  j = montar({ save: s2, copia: { geracao: 1, surpresa: false, surpresaEm: 'ontem' } });   // carimbo estragado = sem carimbo
  assert.strictEqual(j.P.carregar().ajustes.surpresa, true);
});

/* ---------- revisão de segurança: saves hostis ou estragados ---------- */
// o Object.prototype e o Object de DENTRO do vm e os de fora (o JSON do vm é o daqui, então U.copia cria objetos deste lado)
function prototipoLimpo(j) {
  const dentro = vm.runInContext('[({}).compradas, ({}).usadas, ({}).fome, ({}).em, ({}).polluted, Object.compradas, Object.prototype.compradas]', j.ctx);
  const fora = [({}).compradas, ({}).usadas, ({}).fome, ({}).em, ({}).polluted, Object.compradas, Object.prototype.compradas];
  return dentro.concat(fora).every((v) => v === undefined);
}
const hostil = (json) => JSON.parse(json);   // JSON.parse cria "__proto__" como chave própria, como chega do servidor

teste('mescla hostil (__proto__, constructor, prototype) não suja o Object.prototype e não perde o outro lado', () => {
  const j = montar();
  const local = saveAtual(); local.atualizado = 1750900000000;
  local.despensa = { maca: { compradas: 2, usadas: 1 } };
  local.cuidados = { inicial: { fome: 50, sede: 50, em: 100 } };
  const remoto = saveAtual(); remoto.atualizado = 1750500000000;
  remoto.despensa = hostil('{"__proto__":{"compradas":7,"usadas":1,"polluted":1},"constructor":{"compradas":2,"usadas":0},"prototype":{"compradas":3,"usadas":0},"bolo":{"compradas":1,"usadas":0}}');
  remoto.cuidados = hostil('{"__proto__":{"fome":1,"sede":1,"em":9999999999999},"constructor":{"fome":1,"sede":1,"em":5},"h-postal":{"fome":30,"sede":40,"em":7}}');
  const txt = (o) => hostil(JSON.stringify(o));   // JSON.stringify mantém "__proto__" como chave própria
  [[local, remoto], [remoto, local]].forEach(([a, b]) => {
    const r = j.P.mesclar(txt(a), txt(b));
    assert.ok(prototipoLimpo(j), 'Object.prototype sujo');
    ['bolo', 'maca'].forEach((k) => assert.ok(Object.prototype.hasOwnProperty.call(r.despensa, k), k));
    ['h-postal', 'inicial'].forEach((k) => assert.ok(Object.prototype.hasOwnProperty.call(r.cuidados, k), 'o unicórnio que só está de um lado continua: ' + k));
    assert.deepStrictEqual(r.despensa.maca, { compradas: 2, usadas: 1 });
  });
  // o save hostil como lado mais recente (copiado inteiro pela mescla) também não suja
  j.P.mesclar(txt(local), Object.assign(txt(remoto), { atualizado: 1760000000000 }));
  assert.ok(prototipoLimpo(j));
});

teste('save hostil pelo doc e pela cópia: carregar e sincronizar deixam o protótipo limpo', async () => {
  const s = saveAtual(); s.atualizado = 1750500000000;
  const j = montar({ save: s, copia: '{"geracao":1,"despensa":{"__proto__":{"compradas":7,"usadas":0}},"cuidados":{"constructor":{"fome":1,"sede":1,"em":5}}}' });
  j.P.carregar();
  assert.ok(prototipoLimpo(j));
  const doc = Object.assign(saveAtual(), { atualizado: 1760000000000 });
  const bruto = JSON.stringify(doc).replace(/}$/, ',"despensa":{"__proto__":{"compradas":7,"usadas":0,"polluted":1},"maca":{"compradas":1,"usadas":0}},"cuidados":{"__proto__":{"fome":1,"sede":1,"em":9e15}}}');
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: true, data: () => ({ estado: JSON.parse(bruto) }) }),
    set: () => Promise.resolve(), onSnapshot: () => {},
  }) }) };
  await j.P.iniciarNuvem();
  assert.ok(prototipoLimpo(j));
  assert.deepStrictEqual(copia(j.P.estado().despensa), { maca: { compradas: 1, usadas: 0 } });
  assert.deepStrictEqual(copia(j.P.estado().cuidados), {});
});

teste('completar normaliza cuidados e despensa; comprar cobra e entrega certo', () => {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 'abc', sede: -50, em: 'x' }, 'h-cartinha': { fome: 1e308, sede: null, em: -1 }, 'h-postal': 'lixo', ok: { fome: 42.5, sede: 99, em: 1750000000000 } };
  s.despensa = { maca: { compradas: '5', usadas: 0 }, feno: { compradas: 0, usadas: 9 }, bolo: { compradas: -3, usadas: 'x' }, biscoito: { compradas: 2.7, usadas: 1 }, cenoura: 7 };
  const j = montar({ save: s });
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e.cuidados), {
    inicial: { fome: 100, sede: 0, em: 0 }, 'h-cartinha': { fome: 100, sede: 100, em: 0 }, ok: { fome: 42.5, sede: 99, em: 1750000000000 },
  });
  assert.deepStrictEqual(copia(e.despensa), {
    maca: { compradas: 5, usadas: 0 }, feno: { compradas: 0, usadas: 0 }, bolo: { compradas: 0, usadas: 0 }, biscoito: { compradas: 2, usadas: 1 },
  });
  const e0 = j.P.estrelas();
  assert.ok(j.C.comprar('maca').ok);
  assert.strictEqual(j.P.estado().despensa.maca.compradas, 6, 'texto "5" + 1 = 6, não "51"');
  assert.ok(j.C.comprar('feno').ok);
  assert.strictEqual(j.C.quantidade('feno'), 1, 'usadas > compradas não come a compra');
  assert.strictEqual(j.P.estrelas(), e0 - 3 - 4);
  j.C.iniciar(); j.tocar(); j.andar(3000);
  assert.ok(j.P.estado().cuidados.inicial.fome < 100, 'o relógio da fome anda sem erro');
});

teste('cuidados e despensa que não são objetos viram {}; comprar, dar, beber e o relógio sem erro', () => {
  ['texto', 5, null, [1, 2], true].forEach((ruim) => {
    const s = saveAtual(); s.cuidados = ruim; s.despensa = ruim;
    const j = montar({ save: s });
    const e = j.P.carregar();
    assert.deepStrictEqual(copia(e.cuidados), {}); assert.deepStrictEqual(copia(e.despensa), {});
    const e0 = j.P.estrelas();
    assert.ok(j.C.comprar('maca').ok);
    assert.strictEqual(j.C.quantidade('maca'), 1); assert.strictEqual(j.P.estrelas(), e0 - 3);
    j.C.beber('inicial'); j.C.alimentar('inicial', 'maca');
    j.C.iniciar(); j.tocar(); j.andar(3000);
  });
});

teste('estrelas estragadas contam como 0: o saldo nunca é NaN e nada sai de graça', () => {
  [{ ganhas: 'abc', gastas: 0 }, { ganhas: null, gastas: null }, { ganhas: {}, gastas: 3 }].forEach((est) => {
    const s = saveAtual(); s.estrelas = est;
    const j = montar({ save: s });
    j.P.carregar();
    assert.strictEqual(j.P.estrelas(), 0);
    assert.strictEqual(j.C.comprar('maca').ok, false);
    assert.strictEqual(j.C.quantidade('maca'), 0);
  });
  const s = saveAtual(); s.estrelas = { ganhas: 10, gastas: 'x' };
  const j = montar({ save: s }); j.P.carregar();
  assert.strictEqual(j.P.estrelas(), 10);
  assert.ok(j.C.comprar('maca').ok);
  assert.strictEqual(j.P.estado().estrelas.gastas, 3); assert.strictEqual(j.P.estrelas(), 7);
});

teste('surpresa em texto vira booleano; outro valor volta ao padrão; o carimbo não muda', () => {
  [['false', false], ['true', true], ['x', true], [0, true], [null, true], [false, false]].forEach(([v, esperado]) => {
    const s = saveAtual(); s.ajustes.surpresa = v; s.ajustes.surpresaEm = 1234;
    const e = montar({ save: s }).P.carregar();
    assert.strictEqual(e.ajustes.surpresa, esperado, JSON.stringify(v));
    assert.strictEqual(e.ajustes.surpresaEm, 1234);
  });
});

teste('normalização não muda nada de um save bom (antigo nem novo)', () => {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 12.25, sede: 100, em: 1750500000000 }, 'h-postal': { fome: 0, sede: 55, em: 1 } };
  s.despensa = { maca: { compradas: 3, usadas: 1 }, bolo: { compradas: 1, usadas: 1 } };
  s.ajustes.surpresa = false; s.ajustes.surpresaEm = 99;
  const e = montar({ save: s }).P.carregar();
  assert.deepStrictEqual(copia(e), s);
});

/* ---------- D1: dois aparelhos, o carimbo `acao` (comer/beber) e o gasto do relógio ---------- */
// Casos para entrar em ferramentas/testar-save.js, antes do bloco final `(async () => { ... })()`.
// Usam montar(), saveAtual(), semNovos(), copia() e teste() de lá. Saves 100% sintéticos.

// um "banco" em memória e a sincronização como o jogo faz: GET, mescla no aparelho, PUT do resultado
function sincronizar(j, banco) {
  const remoto = banco.valor;
  if (remoto) {
    j.guardado[j.R.config.chaveSave] = JSON.stringify(j.P.mesclar(j.P.estado(), copia(remoto)));
    j.P.carregar();                        // troca o objeto (e passa pela cópia), como a mescla real
  }
  banco.valor = copia(j.P.estado());
}
// dois aparelhos com o mesmo save, relógios juntos, os dois iniciados (jogo aberto e tocado)
function doisAparelhos(ajuste) {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 20, sede: 90, em: 1750500000000, acao: 1750400000000 } };
  s.despensa = { maca: { compradas: 1, usadas: 0 } };
  if (ajuste) ajuste(s);
  const A = montar({ save: s }), B = montar({ save: s });
  B.relogio.agora = A.relogio.agora;
  A.P.carregar(); B.P.carregar();
  A.C.iniciar(); B.C.iniciar();
  return { A, B, banco: { valor: null } };
}
// os dois relógios andam juntos, de 1 em 1 s; `ativos` diz quem está jogando (tocado)
function andarJuntos(A, B, ms, ativos) {
  for (let t = 0; t < ms; t += 1000) {
    ativos.forEach((j) => j.tocar());
    A.andar(1000); B.andar(1000);
  }
}
const fomeDe = (e, id = 'inicial') => e.cuidados[id].fome;

teste('D1: com os dois aparelhos ativos, a maçã dada num deles vale nos dois e no banco', () => {
  const { A, B, banco } = doisAparelhos();
  sincronizar(A, banco); sincronizar(B, banco);
  andarJuntos(A, B, 60 * 1000, [A, B]);
  const r = A.C.alimentar('inicial', 'maca');
  assert.strictEqual(r.ok, true);
  const depois = r.depois;                 // ~49,5
  sincronizar(A, banco);
  // de 25 em 25 s por 100 s, cada um sincroniza na sua vez (o validador viu B ficar em ~19)
  for (let i = 0; i < 4; i++) {
    andarJuntos(A, B, 25 * 1000, [A, B]);
    sincronizar(i % 2 ? A : B, banco);
    sincronizar(i % 2 ? B : A, banco);
  }
  const gasto100s = 100 / (120 * 60) * 100;   // ~1,39 ponto de fome
  [A.P.estado(), B.P.estado(), banco.valor].forEach((e, n) => {
    assert.ok(Math.abs(fomeDe(e) - (depois - gasto100s)) < 0.05, ['A', 'B', 'banco'][n] + ': fome ' + fomeDe(e));
    assert.strictEqual(e.despensa.maca.usadas, 1, 'a maçã conta uma vez só');
  });
});

teste('D1: dois aparelhos comendo em horários diferentes: vale a ação mais recente, nas duas ordens', () => {
  const { A, B } = doisAparelhos((s) => { s.despensa = { maca: { compradas: 2, usadas: 0 }, bolo: { compradas: 1, usadas: 0 } }; });
  andarJuntos(A, B, 30 * 1000, [A, B]);
  A.C.alimentar('inicial', 'maca');        // A come primeiro (~49,7)
  andarJuntos(A, B, 30 * 1000, [A, B]);
  B.C.alimentar('inicial', 'bolo');        // B come depois, sem ter visto a maçã: enche
  andarJuntos(A, B, 30 * 1000, [A, B]);    // A continua gastando, com `em` mais novo que a ação do B
  const b = B.P.estado(), a = A.P.estado();
  assert.ok(a.cuidados.inicial.em >= b.cuidados.inicial.acao);
  [A.P.mesclar(a, b), A.P.mesclar(b, a)].forEach((r) => {
    assert.strictEqual(r.cuidados.inicial.acao, b.cuidados.inicial.acao, 'ação do B é a mais recente');
    assert.strictEqual(r.cuidados.inicial.fome, b.cuidados.inicial.fome);
  });
  // agora A come de novo: a ação dele passa a ser a mais recente
  A.C.alimentar('inicial', 'maca');
  const a2 = A.P.estado();
  [A.P.mesclar(a2, b), A.P.mesclar(b, a2)].forEach((r) => assert.strictEqual(r.cuidados.inicial.fome, a2.cuidados.inicial.fome));
});

teste('D1: um aparelho parado e outro gastando: vale o que gastou, mesmo se o parado gravou por último', () => {
  const { A, B } = doisAparelhos();
  A.documento.hidden = true;               // A aberto com a aba no fundo: não gasta
  andarJuntos(A, B, 10 * 60 * 1000, [B]);  // só B joga 10 min
  const b = copia(B.P.estado());
  A.relogio.agora += 1000;
  A.P.estado().ajustes.som = false; A.P.salvar();   // A grava depois (atualizado maior) sem ter gastado
  const a = copia(A.P.estado());
  assert.ok(a.atualizado > b.atualizado);
  assert.strictEqual(a.cuidados.inicial.fome, 20);
  [A.P.mesclar(a, b), A.P.mesclar(b, a)].forEach((r) => {
    assert.ok(Math.abs(r.cuidados.inicial.fome - (20 - 10 / 120 * 100)) < 1e-6, 'fome ' + r.cuidados.inicial.fome);
    assert.ok(Math.abs(r.cuidados.inicial.sede - (90 - 10 / 60 * 100)) < 1e-6);
    assert.strictEqual(r.ajustes.som, false);
  });
});

teste('D1: mesma ação dos dois lados: menor fome e menor sede, de cada campo, nas duas ordens', () => {
  const P = montar().P;
  const a = saveAtual(), b = saveAtual();
  a.atualizado = 2000; b.atualizado = 1000;
  a.cuidados = { inicial: { fome: 40, sede: 10, em: 900, acao: 500 } };
  b.cuidados = { inicial: { fome: 30, sede: 20, em: 800, acao: 500 } };
  [P.mesclar(a, b), P.mesclar(b, a)].forEach((r) => assert.deepStrictEqual(copia(r.cuidados.inicial), { fome: 30, sede: 10, em: 900, acao: 500 }));
  // os originais não mudam
  assert.strictEqual(a.cuidados.inicial.fome, 40); assert.strictEqual(b.cuidados.inicial.sede, 20);
});

teste('D1: um lado sem `acao` (versão anterior desta branch): vale a regra de antes, o `em` maior', () => {
  const P = montar().P;
  const a = saveAtual(), b = saveAtual();
  a.atualizado = 2000; b.atualizado = 1000;
  a.cuidados = { inicial: { fome: 90, sede: 90, em: 500, acao: 400 }, 'h-cartinha': { fome: 50, sede: 50, em: 700 } };
  b.cuidados = { inicial: { fome: 10, sede: 10, em: 600 }, 'h-cartinha': { fome: 60, sede: 60, em: 700, acao: 1 } };
  [P.mesclar(a, b), P.mesclar(b, a)].forEach((r) => {
    assert.deepStrictEqual(copia(r.cuidados.inicial), b.cuidados.inicial, 'em maior vence');
  });
  // empate de `em` sem `acao` num dos lados: o lado mais recente (como antes)
  assert.deepStrictEqual(copia(P.mesclar(a, b).cuidados['h-cartinha']), a.cuidados['h-cartinha']);
  // `acao` estragada conta como ausente
  b.cuidados.inicial = { fome: 10, sede: 10, em: 600, acao: 'ontem' };
  assert.strictEqual(P.mesclar(a, b).cuidados.inicial.fome, 10);
});

teste('D1: save antigo sem cuidados: nada some; o primeiro gasto cria o registro com acao 0', () => {
  const antigo = semNovos(saveAtual()); antigo.atualizado = 1750900000000;
  const novo = saveAtual();
  novo.cuidados = { inicial: { fome: 20, sede: 30, em: 1750500000000, acao: 1750400000000 } };
  const P = montar().P;
  [P.mesclar(novo, antigo), P.mesclar(antigo, novo)].forEach((r) => assert.deepStrictEqual(copia(r.cuidados), novo.cuidados));
  const j = montar({ save: antigo });
  j.P.carregar();
  j.C.avancar(60 * 1000);
  const reg = j.P.estado().cuidados.inicial;
  assert.strictEqual(reg.acao, 0);
  assert.ok(reg.fome < 100 && reg.sede < 100);
});

teste('D1: registro da versão anterior ganha acao 0 no gasto, e uma comida do outro aparelho vence', () => {
  const { A, B } = doisAparelhos((s) => { s.cuidados = { inicial: { fome: 20, sede: 90, em: 1750500000000 } }; });
  andarJuntos(A, B, 5 * 1000, [A, B]);
  assert.strictEqual(B.P.estado().cuidados.inicial.acao, 0);
  A.C.alimentar('inicial', 'maca');
  andarJuntos(A, B, 20 * 1000, [A, B]);    // B gasta depois da maçã (em mais novo que a ação do A)
  const a = A.P.estado(), b = B.P.estado();
  assert.ok(b.cuidados.inicial.em > a.cuidados.inicial.acao);
  [A.P.mesclar(a, b), A.P.mesclar(b, a)].forEach((r) => assert.ok(r.cuidados.inicial.fome > 45, 'fome ' + r.cuidados.inicial.fome));
});

teste('D1: duas ações no mesmo milissegundo não empatam (acao sempre cresce)', () => {
  const j = jogoCarregado((s) => { s.despensa = { maca: { compradas: 1, usadas: 0 } }; });
  j.C.avancar(50 * 60 * 1000);
  j.C.beber('inicial');
  const a1 = j.P.estado().cuidados.inicial.acao;
  j.C.alimentar('inicial', 'maca');        // mesmo relógio
  const r = j.P.estado().cuidados.inicial;
  assert.ok(r.acao > a1);
  assert.strictEqual(r.sede, 100);
});

teste('D1: a cópia de segurança segue a mesma regra (ação mais nova vence; empate, o menor)', () => {
  const s = saveAtual();
  s.cuidados = { inicial: { fome: 70, sede: 70, em: 1000, acao: 900 } };
  // cópia com `em` mais novo, mas ação mais velha: não desfaz a comida do estado
  let j = montar({ save: s, copia: { geracao: 1, cuidados: { inicial: { fome: 10, sede: 10, em: 5000, acao: 100 } } } });
  assert.strictEqual(j.P.carregar().cuidados.inicial.fome, 70);
  // mesma ação: vale o menor de cada
  j = montar({ save: s, copia: { geracao: 1, cuidados: { inicial: { fome: 60, sede: 80, em: 950, acao: 900 } } } });
  const e = j.P.carregar().cuidados.inicial;
  assert.strictEqual(e.fome, 60); assert.strictEqual(e.sede, 70);
  // ação mais nova na cópia: vence
  j = montar({ save: s, copia: { geracao: 1, cuidados: { inicial: { fome: 99, sede: 99, em: 950, acao: 950 } } } });
  assert.strictEqual(j.P.carregar().cuidados.inicial.fome, 99);
});

/* ---------- revalidação de segurança: a mescla com um lado estragado ---------- */
teste('mescla: estrelas estragadas de um lado não apagam as boas do outro; números bons dão o mesmo de antes', () => {
  const j = montar();
  const bom = saveAtual(); bom.atualizado = 1750500000000; bom.estrelas = { ganhas: 40, gastas: 12 };
  [{ ganhas: 'abc', gastas: 'abc' }, { ganhas: null, gastas: null }, { ganhas: {}, gastas: [] }, null, 'x'].forEach((ruim) => {
    const mau = saveAtual(); mau.atualizado = 1750900000000; mau.estrelas = ruim;   // o estragado é o mais recente
    [[bom, mau], [mau, bom]].forEach(([a, b]) => {
      const r = j.P.mesclar(copia(a), copia(b));
      assert.deepStrictEqual(copia(r.estrelas), { ganhas: 40, gastas: 12 }, JSON.stringify(ruim));
    });
  });
  const neg = saveAtual(); neg.estrelas = { ganhas: 5, gastas: -30 };
  const zero = saveAtual(); zero.estrelas = { ganhas: 1, gastas: -2 };
  assert.deepStrictEqual(copia(j.P.mesclar(copia(neg), copia(zero)).estrelas), { ganhas: 5, gastas: 0 }, 'gastas negativo vira 0');
  const x = saveAtual(); x.estrelas = { ganhas: 7, gastas: 3 };
  const y = saveAtual(); y.atualizado += 1; y.estrelas = { ganhas: 9, gastas: 1 };
  assert.deepStrictEqual(copia(j.P.mesclar(copia(x), copia(y)).estrelas), { ganhas: 9, gastas: 3 });
  const z = saveAtual(); z.estrelas = { ganhas: '12', gastas: 2 };   // texto com número: como Math.max já fazia
  assert.deepStrictEqual(copia(j.P.mesclar(copia(z), copia(x)).estrelas), { ganhas: 12, gastas: 3 });
});

teste('mescla: despensa ou cuidados que não são objeto no lado mais recente não apagam os do outro lado', () => {
  const j = montar();
  const bom = saveAtual(); bom.atualizado = 1750500000000;
  bom.despensa = { maca: { compradas: 3, usadas: 1 } }; bom.cuidados = { inicial: { fome: 20, sede: 30, em: 1750500000000 } };
  ['texto', 5, true, [1, 2], null].forEach((ruim) => {
    const mau = saveAtual(); mau.atualizado = 1750900000000; mau.despensa = ruim; mau.cuidados = ruim;
    [[bom, mau], [mau, bom]].forEach(([a, b]) => {
      const r = j.P.mesclar(copia(a), copia(b));
      assert.deepStrictEqual(copia(r.despensa), bom.despensa, JSON.stringify(ruim));
      assert.deepStrictEqual(copia(r.cuidados), bom.cuidados, JSON.stringify(ruim));
    });
  });
});

teste('outro navegador (sem cópia) com doc estragado e mais recente: comida, cuidados e estrelas continuam', async () => {
  const s = saveAtual(); s.atualizado = 1750500000000; s.estrelas = { ganhas: 40, gastas: 12 };
  s.despensa = { bolo: { compradas: 2, usadas: 0 } }; s.cuidados = { inicial: { fome: 20, sede: 30, em: 1750500000000 } };
  const j = montar({ save: s });
  j.P.carregar();
  const doc = saveAtual(); doc.atualizado = 1760000000000; doc.despensa = 'lixo'; doc.cuidados = 7; doc.estrelas = { ganhas: 'abc', gastas: 'abc' };
  const gravados = [];
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: true, data: () => ({ estado: copia(doc) }) }),
    set: (d) => { gravados.push(copia(d)); return Promise.resolve(); }, onSnapshot: () => {},
  }) }) };
  await j.P.iniciarNuvem();
  const e = j.P.estado();
  assert.deepStrictEqual(copia(e.despensa), s.despensa);
  assert.strictEqual(e.cuidados.inicial.fome, 20);
  assert.deepStrictEqual(copia(e.estrelas), { ganhas: 40, gastas: 12 });
  assert.strictEqual(j.P.estrelas(), 28);
  const ult = gravados[gravados.length - 1].estado;
  assert.deepStrictEqual(ult.estrelas, { ganhas: 40, gastas: 12 }, 'o doc volta a ter números');
  assert.deepStrictEqual(ult.despensa, s.despensa);
});

teste('mescla: um registro estragado da despensa num lado não apaga o registro bom do outro', () => {
  const j = montar();
  const bom = saveAtual(); bom.atualizado = 1750500000000;
  bom.despensa = { cenoura: { compradas: 3, usadas: 1 }, maca: { compradas: 2, usadas: 0 }, bolo: { compradas: 4, usadas: 2 } };
  const mau = saveAtual(); mau.atualizado = 1750900000000;   // o estragado é o mais recente
  mau.despensa = { cenoura: 'lixo', maca: [1], bolo: { compradas: 'abc', usadas: null }, feno: { compradas: 1, usadas: 0 } };
  [[bom, mau], [mau, bom]].forEach(([a, b]) => {
    const r = j.P.mesclar(copia(a), copia(b));
    assert.deepStrictEqual(copia(r.despensa), {
      cenoura: { compradas: 3, usadas: 1 }, maca: { compradas: 2, usadas: 0 }, bolo: { compradas: 4, usadas: 2 }, feno: { compradas: 1, usadas: 0 },
    });
  });
  // registro estragado dos dois lados: nada de NaN
  const m2 = saveAtual(); m2.despensa = { bolo: { compradas: 'x', usadas: 'y' } };
  const r2 = j.P.mesclar(copia(mau), copia(m2));
  assert.deepStrictEqual(copia(r2.despensa.bolo), { compradas: 0, usadas: 0 });
});

teste('mescla: cuidados com registro ou carimbo estragado num lado não apagam o registro bom do outro', () => {
  const j = montar();
  const bom = saveAtual(); bom.atualizado = 1750500000000;
  bom.cuidados = { inicial: { fome: 20, sede: 30, em: 1000, acao: 900 }, 'h-cartinha': { fome: 40, sede: 40, em: 800 }, 'h-postal': { fome: 50, sede: 50, em: 700, acao: 600 } };
  const mau = saveAtual(); mau.atualizado = 1750900000000;
  mau.cuidados = { inicial: 'lixo', 'h-cartinha': { fome: 99, sede: 99, em: 'abc' }, 'h-postal': { fome: 99, sede: 99, em: 'abc', acao: 600 } };
  [[bom, mau], [mau, bom]].forEach(([a, b]) => {
    const r = j.P.mesclar(copia(a), copia(b));
    assert.deepStrictEqual(copia(r.cuidados.inicial), bom.cuidados.inicial);
    assert.deepStrictEqual(copia(r.cuidados['h-cartinha']), bom.cuidados['h-cartinha'], 'em estragado conta como 0');
    const p = r.cuidados['h-postal'];   // mesma ação: menor fome e sede, em sem NaN
    assert.strictEqual(p.fome, 50); assert.strictEqual(p.sede, 50); assert.strictEqual(p.acao, 600);
    assert.strictEqual(p.em, 700, 'em estragado conta como 0, sem NaN');
  });
});

teste('outro navegador (sem cópia) com um registro da despensa estragado no doc mais recente: a comida continua', async () => {
  const s = saveAtual(); s.atualizado = 1750500000000;
  s.despensa = { cenoura: { compradas: 3, usadas: 1 }, maca: { compradas: 1, usadas: 0 } };
  const j = montar({ save: s });
  j.P.carregar();
  const doc = saveAtual(); doc.atualizado = 1760000000000; doc.despensa = { cenoura: 'lixo', maca: { compradas: 'abc', usadas: 0 } };
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: true, data: () => ({ estado: copia(doc) }) }),
    set: () => Promise.resolve(), onSnapshot: () => {},
  }) }) };
  await j.P.iniciarNuvem();
  assert.deepStrictEqual(copia(j.P.estado().despensa), s.despensa);
  assert.strictEqual(j.C.quantidade('cenoura'), 2);
});

teste('cópia hostil que aparece depois de carregar: o que se grava sai normalizado (usadas ≤ compradas, fome ≤ 100)', () => {
  const s = saveAtual(); s.despensa = { maca: { compradas: 3, usadas: 0 } }; s.cuidados = { inicial: { fome: 50, sede: 50, em: 10 } };
  const j = montar({ save: s });
  j.P.carregar();
  j.guardado[j.chaveCopia] = JSON.stringify({ geracao: 1, despensa: { maca: { compradas: 3, usadas: 7 }, bolo: { compradas: 1.5, usadas: 4 } },
    cuidados: { inicial: { fome: 500, sede: 900, em: 20 } } });
  j.P.salvar(true);
  const principal = JSON.parse(j.guardado[j.R.config.chaveSave]), c = j.copiaGuardada();
  [principal.despensa, c.despensa, copia(j.P.estado().despensa)].forEach((d) => {
    assert.deepStrictEqual(d, { maca: { compradas: 3, usadas: 3 }, bolo: { compradas: 1, usadas: 1 } });
  });
  [principal.cuidados.inicial, c.cuidados.inicial].forEach((r) => { assert.strictEqual(r.fome, 100); assert.strictEqual(r.sede, 100); });
  assert.strictEqual(j.C.quantidade('maca'), 0);
  // e ao carregar com a mesma cópia hostil
  const j2 = montar({ save: s, copia: { geracao: 1, despensa: { maca: { compradas: 3, usadas: 7 } } } });
  assert.deepStrictEqual(copia(j2.P.carregar().despensa.maca), { compradas: 3, usadas: 3 });
});

teste('nomes de Object.prototype (hasOwnProperty, toString…) nunca viram comida nem unicórnio; id desconhecido fica', async () => {
  const nomes = ['hasOwnProperty', 'toString', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', '__defineGetter__', '__lookupSetter__'];
  const lixoD = {}, lixoC = {};
  nomes.forEach((k) => { lixoD[k] = { compradas: 5, usadas: 0 }; lixoC[k] = { fome: 1, sede: 1, em: 9e12 }; });
  const s = saveAtual();
  s.despensa = Object.assign({ maca: { compradas: 2, usadas: 0 }, 'comida-nova': { compradas: 1, usadas: 0 } }, lixoD);
  s.cuidados = Object.assign({ inicial: { fome: 40, sede: 40, em: 5 }, 'uni-novo': { fome: 70, sede: 70, em: 5 } }, lixoC);
  const esperadoD = { maca: { compradas: 2, usadas: 0 }, 'comida-nova': { compradas: 1, usadas: 0 } };
  const esperadoC = { inicial: { fome: 40, sede: 40, em: 5 }, 'uni-novo': { fome: 70, sede: 70, em: 5 } };
  // carregar
  const j = montar({ save: s, copia: { geracao: 1, despensa: lixoD, cuidados: lixoC } });
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e.despensa), esperadoD); assert.deepStrictEqual(copia(e.cuidados), esperadoC);
  // sincronizar com um doc que traz esses nomes, mais recente e mais antigo (a mescla + completar do jogo)
  for (const atualizado of [1760000000000, 1700000000000]) {
    const doc = Object.assign(copia(s), { atualizado });
    const jj = montar({ save: Object.assign(saveAtual(), { despensa: { maca: { compradas: 2, usadas: 0 } } }) });
    jj.P.carregar();
    jj.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
      get: () => Promise.resolve({ exists: true, data: () => ({ estado: copia(doc) }) }), set: () => Promise.resolve(), onSnapshot: () => {},
    }) }) };
    await jj.P.iniciarNuvem();
    const r = jj.P.estado();
    nomes.forEach((k) => {
      assert.ok(!Object.prototype.hasOwnProperty.call(r.despensa, k), 'despensa: ' + k);
      assert.ok(!Object.prototype.hasOwnProperty.call(r.cuidados, k), 'cuidados: ' + k);
    });
    assert.deepStrictEqual(copia(r.despensa), esperadoD);
    assert.ok(r.cuidados['uni-novo'] && r.cuidados.inicial);
  }
  j.P.salvar(true);
  const principal = JSON.parse(j.guardado[j.R.config.chaveSave]);
  assert.deepStrictEqual(principal.despensa, esperadoD); assert.deepStrictEqual(j.copiaGuardada().despensa, esperadoD);
  assert.strictEqual(typeof j.P.estado().despensa.hasOwnProperty, 'function', 'hasOwnProperty continua o de Object.prototype');
});

teste('rede lenta: gravação pendurada vira erro no limite, a próxima sai sozinha e leva tudo', async () => {
  const j = montar({ save: saveAtual(), timersReais: true });
  j.R.config.limiteRedeMs = 60; j.R.config.novaTentativaMs = 80;
  j.P.carregar();
  const sets = [], status = [];
  j.R.util.on('nuvem', (st) => status.push(st));
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: false, data: () => undefined }),
    // a 1ª gravação nunca responde (conexão pendurada); as outras respondem
    set: (d) => { sets.push(copia(d)); return sets.length === 1 ? new Promise(() => {}) : Promise.resolve(); },
    onSnapshot: () => {},
  }) }) };
  await j.P.iniciarNuvem();
  assert.strictEqual(sets.length, 1);
  j.P.gastarEstrelas(3); j.P.estado().despensa.maca = { compradas: 1, usadas: 0 };   // compra durante a trava
  j.P.salvar(true);
  await new Promise((ok) => setTimeout(ok, 100));
  assert.strictEqual(j.P.statusNuvem(), 'erro', 'passou do limite: erro');
  await new Promise((ok) => setTimeout(ok, 150));
  assert.ok(sets.length >= 2, 'a próxima gravação saiu');
  assert.strictEqual(j.P.statusNuvem(), 'sincronizado', 'e o indicador voltou');
  const ult = sets[sets.length - 1].estado;
  assert.deepStrictEqual(ult.despensa.maca, { compradas: 1, usadas: 0 });
  assert.strictEqual(ult.estrelas.gastas, j.P.estado().estrelas.gastas);
  assert.deepStrictEqual(status.slice(-2), ['erro', 'sincronizado']);
  await new Promise((ok) => setTimeout(ok, 200));
  assert.strictEqual(sets.length, 2, 'sem erro, não fica regravando');
});

/* ---------- duas abas no mesmo aparelho (S3-4) e reenvio da mescla (S3-1) ----------
   Casos do projetista (pesqAbas). Saves 100% sintéticos. */

// n abas com UM localStorage só. Gravar numa aba põe na fila o evento `storage` das outras (como o
// navegador, que entrega depois); entregar() despacha a fila até esvaziar (ou desiste: vaivém).
function abas(n, save) {
  const loja = {}, fila = [], gravacoes = [];
  const lista = [];
  for (let i = 0; i < n; i++) {
    const j = montar();
    const eu = i;
    j.ctx.localStorage = {
      getItem: (k) => (k in loja ? loja[k] : null),
      setItem: (k, v) => {
        const antes = k in loja ? loja[k] : null;
        loja[k] = String(v);
        if (k === j.R.config.chaveSave) gravacoes[eu] = (gravacoes[eu] || 0) + 1;
        lista.forEach((o, x) => { if (x !== eu) fila.push({ para: x, ev: { key: k, newValue: String(v), oldValue: antes } }); });
      },
    };
    lista.push(j);
  }
  if (save) loja[lista[0].R.config.chaveSave] = JSON.stringify(save);
  return {
    abas: lista, loja, fila, gravacoes,
    chave: lista[0].R.config.chaveSave,
    entregar(max = 50) {
      let rodadas = 0;
      while (fila.length) {
        if (++rodadas > max) throw new Error('vaivém: a fila de eventos não esvazia');
        const { para, ev } = fila.shift();
        (lista[para].ouvintes['win:storage'] || []).forEach((fn) => fn(ev));
      }
      return rodadas;
    },
    andar(ms) { lista.forEach((j) => { j.relogio.agora += ms; }); },
    guardado() { return JSON.parse(loja[lista[0].R.config.chaveSave]); },
    // uma aba da versão de hoje (sem a correção): grava o que tem, sem olhar o que está lá
    gravarSemMesclar(e) {
      const k = lista[0].R.config.chaveSave, v = JSON.stringify(e), antes = loja[k] || null;
      loja[k] = v;
      lista.forEach((o, x) => fila.push({ para: x, ev: { key: k, newValue: v, oldValue: antes } }));
    },
  };
}
const esperar = () => new Promise((r) => setImmediate(r));
function sala(j, id) { return j.R.materias.map((m) => m.salas.find((s) => s.id === id)).find(Boolean); }
function fazerSala(j, id, acertos = 5) {
  const m = j.R.materias.find((mm) => mm.salas.some((s) => s.id === id));
  return j.P.concluirSala(m, sala(j, id), { acertosPrimeira: acertos, total: 10, pressas: 1 });
}

teste('duas abas: salas e estrelas feitas alternadamente não se perdem (com o evento storage)', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  t.andar(1000); fazerSala(A, 'h3', 5); t.entregar();          // +5 estrelas, ovo h-pincelada
  t.andar(1000); fazerSala(B, 'i1', 4); t.entregar();          // +4, ovo i-amiguinho
  t.andar(1000); fazerSala(A, 'h4', 6); t.entregar();          // +6, ovo h-ciranda
  t.andar(1000); fazerSala(B, 'i2', 3); t.entregar();          // +3, ovo i-sunny
  const g = t.guardado();
  ['h1', 'h2', 'h3', 'h4', 'i1', 'i2'].forEach((s) => assert.ok(g.salas[s] && g.salas[s].feita, 'sala ' + s));
  ['h-pincelada', 'i-amiguinho', 'h-ciranda', 'i-sunny'].forEach((u) => assert.ok(g.unis[u], 'unicórnio ' + u));
  assert.strictEqual(g.estrelas.ganhas, 37 + 5 + 4 + 6 + 3);
  // as duas abas veem o mesmo
  assert.strictEqual(A.P.estado().estrelas.ganhas, 55); assert.strictEqual(B.P.estado().estrelas.ganhas, 55);
  // A fecha e reabre: nada se perdeu
  const R = montar({ save: g });
  const e = R.P.carregar();
  assert.strictEqual(Object.keys(e.salas).filter((s) => e.salas[s].feita).length, 6);
  assert.strictEqual(R.P.dinheiroTotal(), A.P.dinheiroTotal());
});

teste('duas abas: a que grava sem ter recebido o evento junta antes (salas e unicórnios ficam)', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  t.andar(1000); fazerSala(A, 'h3', 5);
  t.andar(1000); fazerSala(B, 'i1', 4);       // B ainda não recebeu o evento da A
  const g = t.guardado();
  assert.ok(g.salas.h3 && g.salas.h3.feita, 'a sala da A ficou');
  assert.ok(g.salas.i1 && g.salas.i1.feita, 'a sala da B ficou');
  assert.ok(g.unis['h-pincelada'] && g.unis['i-amiguinho']);
  // estrelas: regra da mescla (maior valor) — no atropelo, vale o maior dos dois lados
  assert.strictEqual(g.estrelas.ganhas, 42);
  t.entregar();
  assert.deepStrictEqual(Object.keys(A.P.estado().salas).sort(), Object.keys(B.P.estado().salas).sort());
});

teste('duas abas: uma aba sem a correção grava por cima e a aba nova devolve o que faltava', () => {
  const t = abas(1, saveAtual());
  const [A] = t.abas;
  A.P.carregar();
  t.entregar();
  t.andar(1000); fazerSala(A, 'h2', 5);  // h2 já feita: só estrelas
  t.andar(1000); fazerSala(A, 'h3', 6);
  // a aba antiga (que não viu nada) grava o save velho, com som desligado
  t.andar(1000);
  const velho = saveAtual(); velho.ajustes.som = false; velho.atualizado = A.relogio.agora;
  t.gravarSemMesclar(velho);
  t.andar(1000);
  const antes = t.gravacoes[0];
  t.entregar();
  assert.strictEqual(t.gravacoes[0], antes + 1, 'a aba nova regrava uma vez');
  const g = t.guardado();
  assert.ok(g.salas.h3 && g.salas.h3.feita);
  assert.ok(g.unis['h-pincelada']);
  assert.strictEqual(g.estrelas.ganhas, 37 + 5 + 6);
  assert.strictEqual(g.ajustes.som, false, 'o que a aba antiga mudou por último vale (regra de sempre)');
  assert.ok(g.atualizado > velho.atualizado, 'carimbo novo, para o servidor não ignorar');
});

teste('duas abas: sem vaivém de gravações entre elas', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  A.C.iniciar(); B.C.iniciar(); A.tocar(); B.tocar();
  for (let i = 0; i < 5; i++) {
    t.andar(1000); fazerSala(i % 2 ? B : A, ['h3', 'i1', 'h4', 'i2', 'h5'][i], 5);
    A.andar(30000); B.andar(30000);          // a fome gasta nas duas (cuidados.js grava sozinho)
    t.entregar(20);
  }
  // cada sala = 1 gravação de quem fez; cuidados gravam a cada 60 s; nenhuma gravação por eco
  const total = (t.gravacoes[0] || 0) + (t.gravacoes[1] || 0);
  assert.ok(total <= 5 + 2 * 3 + 2, 'gravações demais: ' + total);
  assert.strictEqual(t.fila.length, 0);
});

teste('duas abas: quem recebe o evento só junta, não regrava (sem eco)', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  ['h3', 'h4', 'h5'].forEach((s) => { t.andar(1000); fazerSala(A, s, 5); t.entregar(); });
  A.P.registrarPagamento('historia', 8); t.entregar();
  A.P.novoCiclo(); t.entregar();
  assert.strictEqual(t.gravacoes[0], 5); assert.strictEqual(t.gravacoes[1] || 0, 0, 'a B regravou por eco');
  assert.strictEqual(B.P.estado().ciclo, 2);
});

teste('duas abas: a aba que volta do fundo sem ter recebido o evento junta antes de ganhar estrelas', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  t.andar(1000); fazerSala(A, 'h3', 5);
  t.fila.length = 0;                                          // B estava congelada: o evento se perdeu
  (B.ouvintes['doc:visibilitychange'] || []).forEach((fn) => fn());   // B volta a aparecer
  assert.ok(B.P.estado().salas.h3, 'B já tem a sala da A');
  t.andar(1000); fazerSala(B, 'i1', 4);
  assert.strictEqual(t.guardado().estrelas.ganhas, 37 + 5 + 4, 'nenhuma estrela perdida');
});

teste('uma aba sozinha: uma gravação por salvar e nada a mais', () => {
  const t = abas(1, saveAtual());
  const [A] = t.abas;
  A.P.carregar();
  const g0 = t.gravacoes[0] || 0;
  fazerSala(A, 'h3', 5); A.P.salvar(); A.P.salvar();
  assert.strictEqual((t.gravacoes[0] || 0) - g0, 3);
  // o próprio texto de volta (outra aba não mudou nada) não faz nada
  const ev = { key: t.chave, newValue: t.loja[t.chave] };
  (A.ouvintes['win:storage'] || []).forEach((fn) => fn(ev));
  assert.strictEqual((t.gravacoes[0] || 0) - g0, 3);
});

teste('duas abas: "Apagar tudo" numa vale na outra, e a outra não ressuscita o velho', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  t.andar(1000); A.P.apagarTudo(); t.entregar();
  assert.strictEqual(B.P.estado().geracao, 2);
  assert.deepStrictEqual(copia(B.P.estado().salas), {});
  t.andar(1000); B.P.salvar(); t.entregar();
  assert.strictEqual(t.guardado().geracao, 2);
  assert.deepStrictEqual(t.guardado().salas, {});
});

teste('duas abas: "Novo ciclo" numa vale na outra', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  t.andar(1000); A.P.novoCiclo(); t.entregar();
  assert.strictEqual(B.P.estado().ciclo, 2);
  t.andar(1000); fazerSala(B, 'h1', 5); t.entregar();
  const g = t.guardado();
  assert.strictEqual(g.ciclo, 2);
  assert.deepStrictEqual(Object.keys(g.salas), ['h1']);
  assert.deepStrictEqual(Object.keys(A.P.estado().salas), ['h1']);
});

// doc falso da capacidade db: guarda o que foi enviado e deixa chamar o onSnapshot à mão
function docFalso(j, guardado) {
  const d = { enviados: [], snap: null, timers: [] };
  j.ctx.setTimeout = (fn) => { d.timers.push(fn); return d.timers.length; };
  j.ctx.clearTimeout = () => {};
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: !!guardado, data: () => (guardado ? { estado: copia(guardado), atualizado: guardado.atualizado } : null) }),
    set: (x) => { d.enviados.push(copia(x)); return Promise.resolve(); },
    onSnapshot: (fn) => { d.snap = fn; },
  }) }) };
  d.rodarTimers = () => { const ts = d.timers.splice(0); ts.forEach((f) => f()); };
  d.chegou = (e) => d.snap({ exists: true, metadata: { hasPendingWrites: false }, data: () => ({ estado: copia(e), atualizado: e.atualizado }) });
  return d;
}

teste('nuvem: o que a mescla trouxe volta ao banco com carimbo novo; sem novidade, não reenvia', async () => {
  const base = saveAtual();
  const local = saveAtual(); local.salas.h3 = { vezes: 1, melhor: 5, feita: 1750300000000 }; local.atualizado = 1750500000000; // mais velho que o banco
  const j = montar({ save: local });
  j.P.carregar();
  const d = docFalso(j, base);
  await j.P.iniciarNuvem();
  await esperar();
  const primeiro = d.enviados[0];
  assert.ok(primeiro.estado.salas.h3, 'a sala h3 foi para o banco');
  assert.ok(primeiro.atualizado > base.atualizado, 'com carimbo novo (os outros aparelhos não ignoram)');
  // o banco devolve o mesmo que recebeu: não reenvia
  d.timers.length = 0;
  j.relogio.agora += 20000;
  d.chegou(primeiro.estado);
  d.rodarTimers(); await esperar();
  assert.strictEqual(d.enviados.length, 1, 'sem reenvio quando nada mudou');
  // outro aparelho manda uma versão sem a h3 e com a i1: a junção vai ao banco com as duas
  const outro = saveAtual(); outro.salas.i1 = { vezes: 1, melhor: 4, feita: 1750700000000 }; outro.atualizado = j.relogio.agora - 1000;
  d.chegou(outro);
  d.rodarTimers(); await esperar();
  assert.strictEqual(d.enviados.length, 2);
  const ult = d.enviados[1];
  assert.ok(ult.estado.salas.h3 && ult.estado.salas.i1);
  assert.ok(ult.atualizado > outro.atualizado);
  // e quando a fome muda só pelo relógio, não conta como novidade
  const soFome = copia(ult.estado); soFome.cuidados = { inicial: { fome: 40, sede: 40, em: j.relogio.agora, acao: 0 } }; soFome.atualizado = ult.atualizado + 1;
  d.chegou(soFome);
  d.rodarTimers(); await esperar();
  assert.strictEqual(d.enviados.length, 2, 'fome e sede sozinhas não fazem reenvio');
});

teste('nuvem: aparelho igual ao banco não muda o carimbo ao abrir', async () => {
  const base = saveAtual();
  const j = montar({ save: base });
  j.P.carregar();
  const d = docFalso(j, base);
  await j.P.iniciarNuvem();
  assert.strictEqual(j.P.estado().atualizado, base.atualizado);
  assert.strictEqual(d.enviados[0].atualizado, base.atualizado);
});

// (A2) o onSnapshot compara o conteúdo, não o `atualizado`; a `acao` dos cuidados conta; o relógio da fome não
teste('nuvem: doc diferente com o MESMO `atualizado` é juntado (surpresa desligada em outro aparelho não se perde)', async () => {
  const base = saveAtual(); base.ajustes.surpresa = true;
  const j = montar({ save: copia(base) });
  j.P.carregar();
  const d = docFalso(j, copia(base));
  await j.P.iniciarNuvem(); await esperar();
  const mesmo = j.P.estado().atualizado;
  const outro = copia(j.P.estado()); outro.ajustes.surpresa = false; outro.ajustes.surpresaEm = 1760000000000; outro.atualizado = mesmo;
  d.chegou(outro);
  assert.strictEqual(j.P.estado().ajustes.surpresa, false, 'mesmo carimbo, conteúdo diferente: junta');
  const n = d.enviados.length;
  d.chegou(copia(j.P.estado()));   // o banco devolve o que já temos: nada muda, nada sai
  d.rodarTimers(); await esperar();
  assert.strictEqual(d.enviados.length, n);
});

teste('nuvem: comida dada neste aparelho (acao) que o banco não tem volta ao banco; só a fome mudada, não', async () => {
  const base = saveAtual(); base.cuidados = { inicial: { fome: 50, sede: 50, em: 1750000000000, acao: 1750000000000 } };
  const j = montar({ save: copia(base) });
  j.P.carregar();
  const d = docFalso(j, copia(base));
  await j.P.iniciarNuvem(); await esperar();
  d.rodarTimers(); await esperar();
  const n0 = d.enviados.length;
  // o banco chega com a fome diferente (o relógio de outro aparelho) e nada mais: não reenvia
  const soFome = copia(j.P.estado()); soFome.cuidados.inicial.fome = 12; soFome.cuidados.inicial.em += 5; soFome.atualizado += 5;
  d.chegou(soFome); d.rodarTimers(); await esperar();
  assert.strictEqual(d.enviados.length, n0, 'fome/sede/em não fazem reenvio');
  // este aparelho deu comida (acao nova) e o banco chega sem ela: devolve
  j.P.estado().cuidados.inicial = { fome: 100, sede: 50, em: 1760000000000, acao: 1760000000000 };
  const semComida = copia(base); semComida.atualizado = j.P.estado().atualizado + 10; semComida.estrelas.ganhas += 1;
  d.chegou(semComida); d.rodarTimers(); await esperar();
  assert.ok(d.enviados.length > n0, 'reenviou');
  const ult = d.enviados[d.enviados.length - 1].estado;
  assert.strictEqual(ult.cuidados.inicial.acao, 1760000000000);
  assert.strictEqual(ult.estrelas.ganhas, base.estrelas.ganhas + 1);
});

(async () => {
  let falhas = 0;
  for (const t of testes) {
    try { await t.fn(); console.log('ok   ' + t.nome); }
    catch (e) { falhas++; console.log('FALHOU ' + t.nome + '\n       ' + (e && e.message)); }
  }
  console.log(`\n${testes.length - falhas}/${testes.length} testes passaram`);
  process.exit(falhas ? 1 : 0);
})();
