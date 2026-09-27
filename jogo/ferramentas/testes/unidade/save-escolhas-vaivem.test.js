// Testes de unidade: sem vaivém de envios entre aparelhos da versão nova (carimbos das escolhas e do pago) e da versão
// ANTIGA (main 1510c1c, sem carimbos: progresso*.js e cuidados.js tirados com git show), com relógios diferentes.
// Por quê: a antiga decide as escolhas pelo `atualizado` (relógio dela) e a nova pelos carimbos; com o relógio da antiga
// adiantado, as duas se desfaziam para sempre (docs/contratos/save-e-mescla.md §4.8). Converge, ninguém diverge e
// nenhuma conquista some; a escolha da versão nova pode perder enquanto uma antiga estiver aberta (limite aceito).
// E sem antiga nenhuma, com o banco ainda gravado por ela (logo depois da atualização), os novos não cedem entre si.
// Alvo: js/sistemas/progresso-nuvem.js e progresso-mescla.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/save-escolhas-vaivem.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Jogo, montar, saveAtual, copia, esperar } = require('./ajudantes/jogo-save');
const { PASTA_TESTES } = require('../guardas');

const ANTIGA = '1510c1c';
// o progresso antigo em quatro partes vira um progresso.js só (é o que montar({ antigo }) carrega)
function pastaAntiga() {
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const dir = fs.mkdtempSync(path.join(PASTA_TESTES, 'vaivem-antiga-'));
  const mostrar = (f) => execFileSync('git', ['show', ANTIGA + ':jogo/js/sistemas/' + f], { cwd: Jogo.raiz, encoding: 'utf8' });
  fs.writeFileSync(path.join(dir, 'progresso.js'), ['progresso.js', 'progresso-mescla.js', 'progresso-nuvem.js', 'progresso-regras.js'].map(mostrar).join('\n'));
  fs.writeFileSync(path.join(dir, 'cuidados.js'), mostrar('cuidados.js'));
  return dir;
}
const antigo = pastaAntiga();

// o doc de mentira guarda o último envio inteiro (como o servidor de casa) e conta os envios
function banco(inicial) {
  const b = { valor: copia(inicial), envios: 0 };
  b.ligar = (j) => {
    const d = { snap: null, timers: [] };
    j.ctx.setTimeout = (fn) => { d.timers.push(fn); return d.timers.length; };
    j.ctx.clearTimeout = () => {};
    j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
      get: () => Promise.resolve({ exists: true, data: () => copia(b.valor) }),
      set: (x) => { b.valor = copia(x); b.envios++; return Promise.resolve(); },
      onSnapshot: (fn) => { d.snap = fn; },
    }) }) };
    d.enviar = async () => { const ts = d.timers.splice(0); ts.forEach((f) => f()); await esperar(); await esperar(); };
    d.conferir = async () => { d.snap({ exists: true, metadata: { hasPendingWrites: false }, data: () => copia(b.valor) }); await esperar(); };
    return d;
  };
  return b;
}
async function ligarTodos(defs) {
  const base = saveAtual();
  const b = banco({ estado: base, atualizado: base.atualizado });
  const devs = [];
  for (const [novo, desvio] of defs) {
    const j = montar(novo ? { save: copia(base), agora: 1760000000000 + desvio } : { save: copia(base), antigo, agora: 1760000000000 + desvio });
    j.P.carregar();
    const d = b.ligar(j);
    await j.P.iniciarNuvem(); await esperar();
    devs.push({ j, d, novo });
  }
  for (const x of devs) await x.d.enviar();
  return { b, devs, andar: (ms) => devs.forEach((x) => { x.j.relogio.agora += ms; }) };
}
// todos conferem e devolvem, em voltas, até o banco parar; devolve quantas voltas levou (limite: 40)
async function estabilizar(b, devs, andar, ordem) {
  let voltas = 0, antes;
  do {
    antes = b.envios;
    for (const x of ordem ? ordem(devs) : devs) { andar(1000); await x.d.conferir(); await x.d.enviar(); }
    voltas++;
  } while ((b.envios !== antes || devs.some((x) => x.d.timers.length)) && voltas < 40);
  for (const x of devs) { andar(1000); await x.d.conferir(); }
  return voltas;
}

test('o cenário do vaivém: aparelho novo troca a montaria, o antigo (relógio 5 s adiantado) grava sozinho: poucos envios e os dois iguais', async () => {
  const { b, devs: [N, V], andar } = await ligarTodos([[true, 0], [false, 5000]]);
  andar(1000); V.j.P.salvar(); await V.d.enviar(); await N.d.conferir(); await N.d.enviar();   // gravação sozinha da antiga
  andar(1000); N.j.P.estado().montaria = 'h-cartinha'; N.j.P.salvar(); await N.d.enviar();     // a Mariana troca na nova
  const inicio = b.envios;
  for (let i = 0; i < 20; i++) { andar(2000); await V.d.conferir(); await V.d.enviar(); andar(2000); await N.d.conferir(); await N.d.enviar(); }
  assert.ok(b.envios - inicio <= 4, 'vaivém: ' + (b.envios - inicio) + ' envios em 20 voltas');
  assert.strictEqual(N.j.P.estado().montaria, V.j.P.estado().montaria, 'os dois aparelhos iguais');
  assert.strictEqual(N.j.P.estado().montaria, 'h-cartinha', 'a nova insiste uma vez e a antiga adota');
});

/* ---------- muitas rodadas: misturas de aparelhos, relógios de -60 s a +60 s ---------- */
function sorteador(semente) {
  let x = semente;
  return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
}
const ESC = [
  [(e) => e.montaria, (e, v) => { e.montaria = v; }, ['inicial', 'h-cartinha']],
  [(e) => e.usando.capa, (e, v) => { e.usando.capa = v; }, [true, false]],
  [(e) => e.aparencia.cabelo, (e, v) => { e.aparencia.cabelo = v; }, ['#111111', '#222222']],
  [(e) => e.ajustes.texto, (e, v) => { e.ajustes.texto = v; }, [1, 2, 3]],
  [(e) => e.unis.inicial.nome, (e, v) => { e.unis.inicial.nome = v; }, ['Pipoca', 'Nuvem']],
];
async function rodada(sorte, novos, antigos, desvioMax, emOrdem) {
  const defs = [];
  for (let i = 0; i < novos + antigos; i++) defs.push([i < novos, i ? Math.round((sorte() * 2 - 1) * desvioMax) : 0]);
  const { b, devs, andar } = await ligarTodos(defs);
  const pega = (a) => a[Math.floor(sorte() * a.length)];
  const salas = [];
  let ganhas = 37;
  for (let p = 0; p < 30; p++) {
    andar(500 + Math.floor(sorte() * 3000));
    const x = pega(devs), e = x.j.P.estado(), acao = pega(['escolha', 'escolha', 'cuidados', 'conquista', 'pagar', 'enviar', 'enviar', 'conferir', 'conferir']);
    if (acao === 'escolha') { const [ler, mudar, vals] = pega(ESC); mudar(e, pega(vals.filter((v) => v !== ler(e)))); x.j.P.salvar(); }
    else if (acao === 'cuidados') x.j.P.salvar();
    else if (acao === 'conquista') {
      const s = 's' + p; e.salas[s] = { vezes: 1, melhor: 5, feita: x.j.relogio.agora }; salas.push(s);
      x.j.P.ganharEstrelas(1); ganhas = Math.max(ganhas, x.j.P.estado().estrelas.ganhas); x.j.P.salvar();
    } else if (acao === 'pagar') x.j.P.registrarPagamento('historia', pega([1, 4, 40]));
    else if (acao === 'enviar') await x.d.enviar();
    else await x.d.conferir();
  }
  const voltas = await estabilizar(b, devs, andar, emOrdem ? null : (l) => [...l].sort(() => sorte() - 0.5));
  const I = devs[0].j.R._progresso;
  const conteudo = (e) => { const c = JSON.parse(I.conteudo(I.completar(copia(e)))); delete c.cuidados; return JSON.stringify(c); };
  const erros = [];
  if (voltas >= 40) erros.push('vaivém');
  const c0 = conteudo(devs[0].j.P.estado());
  devs.forEach((x, i) => {
    const e = x.j.P.estado();
    if (conteudo(e) !== c0) erros.push('aparelho ' + i + ' divergiu');
    salas.forEach((s) => { if (!e.salas[s]) erros.push('sala ' + s + ' perdida no aparelho ' + i); });
    if (e.estrelas.ganhas < ganhas) erros.push('estrelas perdidas no aparelho ' + i);
  });
  return erros;
}

test('muitas rodadas (2N, 3N, 1N1V, 2N1V, 1N2V, 2N2V; relógios de -60 s a +60 s): converge, sem vaivém, nenhuma conquista some', async () => {
  const sorte = sorteador(20260927);
  const falhas = [];
  for (const [novos, antigos] of [[2, 0], [3, 0], [1, 1], [2, 1], [1, 2], [2, 2]]) {
    for (const desvio of [0, 3000, 10000, 60000]) {
      // voltas sempre na mesma ordem (o vaivém de 1N2V aparecia assim) e em ordem sorteada
      for (let r = 0; r < 10; r++) {
        const erros = await rodada(sorte, novos, antigos, desvio, r % 2 === 0);
        if (erros.length) falhas.push(novos + 'N' + antigos + 'V ±' + desvio / 1000 + ' s (rodada ' + r + '): ' + erros.join(', '));
      }
    }
  }
  assert.deepStrictEqual(falhas, []);
});

/* ---------- só aparelhos novos, logo depois da atualização (banco gravado pela versão antiga, sem marca) ---------- */
// defeito visto: todo aparelho novo que juntava esse banco ficava "cedeu" e mandava o doc sem marca; os outros cediam
// também, e a regra de antes (pelo `atualizado`) seguia valendo entre aparelhos só novos
test('só novos, banco inicial sem marca: a montaria trocada no tablet vale nos três e o banco termina marcado', async () => {
  const { b, devs, andar } = await ligarTodos([[true, 0], [true, 0], [true, 0]]);
  const [T, N, C] = devs;
  andar(1000); T.j.P.estado().montaria = 'h-cartinha'; T.j.P.salvar();   // tablet: "Montar" (envio agendado, 1,8 s)
  andar(300); N.j.P.salvar(); await N.d.enviar();                         // notebook: cuidados sozinho
  andar(300); await T.d.conferir();                                       // o tablet recebe o do notebook
  andar(300); C.j.P.salvar(); await C.d.enviar();                         // celular: cuidados sozinho
  andar(300); await T.d.conferir();                                       // e o do celular, antes de enviar o dele
  andar(1000); await T.d.enviar();
  await estabilizar(b, devs, andar);
  assert.deepStrictEqual(devs.map((x) => x.j.P.estado().montaria), ['h-cartinha', 'h-cartinha', 'h-cartinha']);
  assert.strictEqual(b.valor.versaoMescla, 2, 'banco marcado');
  assert.ok(!b.valor.cedeu, 'e limpo (regra dos carimbos)');
});

test('só novos, relógios iguais, envio logo depois de juntar: nenhuma escolha nem pago volta atrás; banco marcado', async () => {
  const sorte = sorteador(7);
  const pega = (a) => a[Math.floor(sorte() * a.length)];
  const falhas = [];
  for (let r = 0; r < 30; r++) {
    const { b, devs, andar } = await ligarTodos(pega([[[true, 0], [true, 0]], [[true, 0], [true, 0], [true, 0]]]));
    const ultima = {};
    let pago = null;
    for (let p = 0; p < 40; p++) {
      andar(500 + Math.floor(sorte() * 3000));
      const x = pega(devs), e = x.j.P.estado(), acao = pega(['escolha', 'escolha', 'cuidados', 'pagar', 'enviar', 'enviar', 'conferir', 'conferir']);
      if (acao === 'escolha') { const n = Math.floor(sorte() * ESC.length), [ler, mudar, vals] = ESC[n], v = pega(vals.filter((w) => w !== ler(e))); mudar(e, v); x.j.P.salvar(); ultima[n] = v; }
      else if (acao === 'cuidados') x.j.P.salvar();
      else if (acao === 'pagar') { pago = pega([1, 4, 40, 7]); x.j.P.registrarPagamento('historia', pago); }
      else if (acao === 'enviar') await x.d.enviar();
      else { await x.d.conferir(); if (x.d.timers.length) await x.d.enviar(); }   // o envio sai logo depois da junção
    }
    await estabilizar(b, devs, andar);
    devs.forEach((x, i) => {
      const e = x.j.P.estado();
      Object.keys(ultima).forEach((n) => { if (ESC[n][0](e) !== ultima[n]) falhas.push('rodada ' + r + ': escolha ' + n + ' voltou atrás no aparelho ' + i); });
      if (pago !== null && e.pago.historia !== pago) falhas.push('rodada ' + r + ': pago ' + e.pago.historia + ' em vez de ' + pago + ' no aparelho ' + i);
    });
    if (b.valor.versaoMescla !== 2 || b.valor.cedeu) falhas.push('rodada ' + r + ': banco sem marca limpa no fim');
  }
  assert.deepStrictEqual(falhas, []);
});
