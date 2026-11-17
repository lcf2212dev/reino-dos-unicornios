// Testes de unidade: Letra cursiva (docs/contratos/cursiva.md). O caminho de cada palavra (Reino.Cursiva.palavra/frase)
// e o dedo que só pinta no sentido certo (avancar, seguir, perto): seguir o caminho todo chega ao fim; começar para
// baixo no "a" (o certo é subir), girar o "o" para o lado errado, andar para trás ou pular para longe não pinta nada.
// O banco de frases: toda letra tem desenho e o sorteio não repete as frases da última vez. Sem DOM nem save.
// Rodar: node --test jogo/ferramentas/testes/unidade/cursiva.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/config-cursiva', 'nucleo/util', 'sistemas/cursiva', 'conteudo/cursiva-letras', 'conteudo/cursiva-frases'] }));
  return ctx.Reino;
}
const R = carregar(), C = R.Cursiva;
// segue o caminho de verdade, ponto a ponto (de 3 em 3 amostras, como um dedo que anda)
function tracarTudo(tr, de = 0) {
  let k = de, x = tr.x[de], y = tr.y[de];
  for (let j = de + 3; j < tr.n + 3; j += 3) {
    const i = Math.min(j, tr.n - 1);
    k = C.seguir(tr, k, x, y, tr.x[i], tr.y[i]);
    x = tr.x[i]; y = tr.y[i];
  }
  return k;
}
// o índice do 1º ponto a `ds` de arco do começo
const em = (tr, ds) => tr.s.findIndex((s) => s >= ds);

test('cursiva: todas as letras e as frases do banco têm desenho; cada palavra vira traços longos', () => {
  assert.ok(C.frases().length >= 20, 'pelo menos 20 frases no banco');
  'abcdefghijklmnopqrstuvwxyzACELMNOU'.split('').forEach((ch) => assert.ok(C.letra(ch), 'falta a letra ' + ch));
  C.frases().forEach((f) => {
    assert.deepStrictEqual(Array.from(C.faltam(f)), [], f);
    assert.ok(/^[ACELMNOU]/.test(f), 'a frase começa por maiúscula com desenho: ' + f);
    const fr = C.frase(f);
    assert.ok(fr.palavras.length >= 2, f);
    fr.palavras.forEach((p) => {
      assert.ok(p.tracos.length >= 1, p.texto);
      p.tracos.forEach((t) => assert.ok(t.n > 10 && t.comp > 0.5, p.texto));
      assert.ok(p.larg > 0.5 && p.topo >= 1 && p.fundo <= 0, p.texto);
    });
  });
  assert.deepStrictEqual(Array.from(C.faltam('ok #')), ['#']);
});

test('cursiva: seguir o caminho todo chega ao fim, em toda letra e em toda palavra do banco', () => {
  C.letras().forEach((ch) => {
    C.palavra(ch).tracos.forEach((t) => assert.strictEqual(tracarTudo(t), t.n - 1, 'letra ' + ch));
  });
  C.frases().forEach((f) => C.frase(f).palavras.forEach((p) => p.tracos.forEach((t) => assert.strictEqual(tracarTudo(t), t.n - 1, p.texto))));
});

// a mão de verdade: toca e arrasta pelo dedo inteiro (Cursiva.tocar/arrastar, o mesmo da tela); devolve a ponta final
function mao(tr, k, pontos, o) {
  const d = C.tocar(tr, k, pontos[0][0], pontos[0][1], o);
  pontos.slice(1).forEach(([x, y]) => C.arrastar(d, x, y));
  return d;
}
const inc = R.config.cursiva.inclinacao;
const deitar = ([x, y]) => [x + y * inc, y];   // de em pé para a letra deitada (como o motor faz)
// uma volta no sentido do relógio (ângulo diminuindo, y para cima) em volta de (cx, cy), começando no ângulo a0
function voltaHoraria(cx, cy, rx, ry, a0, voltas) {
  const pts = [];
  for (let i = 0; i <= 72 * voltas; i++) { const a = a0 - (i / 72) * 2 * Math.PI; pts.push(deitar([cx + rx * Math.cos(a), cy + ry * Math.sin(a)])); }
  return pts;
}
// a do config (tablet, notebook) e a mais folgada que a tela usa (letra pequena no celular: config.cursiva.toleranciaMax)
const TOLS = [undefined, { tol: R.config.cursiva.toleranciaMax, pegar: 0.6 }];

test('cursiva: seguir com o dedo tremendo um pouco também chega ao fim', () => {
  let semente = 7;
  const acaso = () => { semente = (semente * 16807) % 2147483647; return semente / 2147483647 - 0.5; };
  C.frases().slice(0, 10).forEach((f) => C.frase(f).palavras.forEach((p) => p.tracos.forEach((t) => {
    const pts = [];
    for (let j = 0; j < t.n + 2; j += 2) { const q = Math.min(j, t.n - 1); pts.push([t.x[q] + acaso() * 0.12, t.y[q] + acaso() * 0.12]); }
    pts.push([t.x[t.n - 1], t.y[t.n - 1]]);
    const k = mao(t, 0, pts).k;
    assert.ok(t.s[k] >= t.comp - 0.2, p.texto + ' (a tela dá o traço por pronto a 0,2 do fim)');
  })));
});

test('cursiva: o "a" começa subindo; para baixo ou reto pela linha, nada pinta e a setinha fica vermelha', () => {
  TOLS.forEach((o) => {
    const t = C.palavra('a').tracos[0];
    assert.ok(t.y[em(t, 0.3)] > t.y[0] + 0.15, 'o desenho do "a" começa subindo');
    assert.ok(C.perto(t, 0, t.x[0], t.y[0], o), 'na bolinha verde começa');
    const baixo = mao(t, 0, Array.from({ length: 11 }, (_, i) => [t.x[0], t.y[0] - i * 0.08]), o);
    assert.strictEqual(baixo.k, 0, 'para baixo: bloqueado');
    assert.strictEqual(baixo.contra, true, 'para baixo: a setinha fica vermelha');
    assert.ok(t.s[mao(t, 0, Array.from({ length: 11 }, (_, i) => [t.x[0] + i * 0.08, t.y[0]]), o).k] < 0.12, 'reto pela linha: quase nada');
    const j = em(t, 0.4);
    assert.ok(mao(t, 0, Array.from({ length: j + 1 }, (_, i) => [t.x[i], t.y[i]]), o).k >= j - 2, 'subindo pelo caminho: pinta');
  });
});

test('cursiva: a bolinha de a, o, d, g, q gira para a esquerda; voltas para a direita não pintam a bolinha', () => {
  TOLS.forEach((o) => ['a', 'o', 'd', 'g', 'q'].forEach((ch) => {
    const t = C.palavra(ch).tracos[0];
    // o bico lá em cima, onde a subida acaba e a bolinha começa
    let bico = 0;
    for (let j = 1; t.s[j] < 1.4; j++) if (t.y[j] > t.y[bico]) bico = j;
    const naBola = (k) => t.s[k] - t.s[bico];
    // 1) da bolinha verde, três voltas para a direita em volta da bola
    const d1 = mao(t, 0, [[t.x[0], t.y[0]]].concat(voltaHoraria(0.4, 0.5, 0.36, 0.5, Math.PI * 1.2, 3)), o);
    assert.ok(naBola(d1.k) < 0.25, `${ch}: voltas para a direita desde o começo pintaram ${naBola(d1.k).toFixed(2)} da bola`);
    // 2) do bico (a subida já feita), três voltas para a direita
    const pts = [[t.x[bico], t.y[bico]]].concat(voltaHoraria(0.4, 0.5, 0.36, 0.5, Math.atan2(t.y[bico] - 0.5, t.x[bico] - 0.4 - 0.5 * inc), 3));
    const d2 = mao(t, bico, pts, o);
    assert.ok(naBola(d2.k) < 0.25, `${ch}: voltas para a direita do bico pintaram ${naBola(d2.k).toFixed(2)} da bola`);
    // 3) para a esquerda, pelo caminho: pinta
    assert.ok(mao(t, bico, Array.from({ length: 12 }, (_, i) => [t.x[bico + i], t.y[bico + i]]), o).k > bico + 6, `${ch}: para a esquerda pinta`);
  }));
});

test('cursiva: rabiscar por cima da palavra (sobe e desce andando para a direita) não escreve a palavra', () => {
  TOLS.forEach((o) => ['bola', 'meu', 'unicórnio', 'amo', 'uva', 'gato'].forEach((w) => {
    const t = C.palavra(w).tracos[0], larg = Math.max(...t.x);
    let k = 0;
    // 5 rabiscos seguidos, cada um começando de novo na bolinha (a criança insiste), em ritmos diferentes
    [0.35, 0.5, 0.7, 0.9, 1.2].forEach((passo) => {
      const pts = [[t.x[k], t.y[k]]];
      for (let x = t.x[k]; x <= larg + 0.5; x += 0.04) pts.push([x, 0.8 + 1.3 * Math.sin((x - t.x[k]) / passo * Math.PI)]);
      k = mao(t, k, pts, o).k;
    });
    assert.ok(t.s[k] / t.comp < 0.35, `${w}: rabiscos pintaram ${(100 * t.s[k] / t.comp).toFixed(0)}% da palavra`);
  }));
});

// liga os pontos de 0,03 em 0,03 (um dedo que anda), na letra deitada
function denso(pts, passo = 0.03) {
  const r = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / passo));
    for (let j = 1; j <= n; j++) r.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n]);
  }
  return r;
}
const pronto = (t, k) => t.s[k] >= t.comp - 0.2;   // como a tela (ui/cursiva.js): os últimos 0,2 são a saidinha reta

test('cursiva: o e e as laçadas altas (l, h) ao contrário não ficam prontos, em qualquer passo do dedo', () => {
  const J = C.J;
  // em pé; o deitar inclina como o motor
  const ERRADO = {
    e: [[0, J], [0.1, 0.45], [0.2, 0.85], [0.4, 0.98], [0.55, 0.8], [0.45, 0.45], [0.3, 0.3], [0.28, 0.1], [0.5, 0.0], [0.72, J]],
    l: [[0, J], [0.2, 0.6], [0.27, 1.2], [0.32, 1.82], [0.46, 2.0], [0.58, 1.74], [0.52, 1.25], [0.36, 0.5], [0.4, 0.1], [0.52, 0.0], [0.72, J]],
    h: [[0, J], [0.2, 0.6], [0.27, 1.2], [0.32, 1.82], [0.46, 2.0], [0.58, 1.74], [0.52, 1.25], [0.3, 0.3], [0.27, 0.0], [0.38, 0.65], [0.58, 0.96], [0.75, 0.8], [0.77, 0.3], [0.86, 0.02], [1.05, J]],
  };
  TOLS.forEach((o) => Object.keys(ERRADO).forEach((ch) => [0.03, 0.06, 0.1, 0.15].forEach((passo) => {
    const t = C.palavra(ch).tracos[0];
    let k = 0;
    for (let vez = 0; vez < 3; vez++) k = mao(t, k, denso([[t.x[k], t.y[k]]].concat(ERRADO[ch].map(deitar)), passo), o).k;
    assert.ok(!pronto(t, k), `${ch} ao contrário ficou pronto (passo ${passo})`);
  })));
});

// o tamanho da letra da tela no celular (390 px de largura: o papel tem ~175 px de arte; 2 px de tela cada)
function pxNoCelular(w) {
  const larg = C.palavra(w).larg, E = Math.max(10, Math.floor(Math.min((175 - 12) / (larg + 0.6), (177 - 8) / 3.7, R.config.cursiva.xAlturaMax)));
  return 2 * E;
}
// o toque de verdade: 120 eventos/s a `vel` x-alturas/s, cada um com tremor gaussiano de `ruidoPx` px de tela
function toque(pts, vel, ruidoPx, px, rnd) {
  const passo = vel / 120, r = [];
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() || 1e-9)) * Math.cos(2 * Math.PI * rnd());
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / passo));
    for (let j = 0; j < n; j++) r.push([a[0] + (b[0] - a[0]) * j / n + gauss() * ruidoPx / px, a[1] + (b[1] - a[1]) * j / n + gauss() * ruidoPx / px]);
  }
  return r;
}
// as laçadas do e de uma palavra (o caminho volta a passar perto de si e fecha área, dentro de um e; a subida do a, que
// a bolinha cobre de volta, é igual ao contrário e não conta): [{ a, b }] com o laço de a até b
function lacadasDoE(w) {
  const ps = C.palavra(w), t = ps.tracos[ps.tracos.length - 1], letras = w.normalize('NFD').replace(/[\u0300-\u036f.]/g, '');
  const fimDe = (pre) => { const p = C.palavra(pre), u = p.tracos[p.tracos.length - 1]; return pre ? u.x[u.n - 1] - u.y[u.n - 1] * inc : 0; };
  const faixas = [];
  for (let i = 0; i < letras.length; i++) if (letras[i] === 'e') faixas.push([fimDe(letras.slice(0, i)), fimDe(letras.slice(0, i + 1))]);
  return { t, lacos: lacadas(t).filter(({ a }) => faixas.some(([x0, x1]) => t.x[a] - t.y[a] * inc >= x0 - 0.05 && t.x[a] - t.y[a] * inc <= x1)) };
}
function lacadas(t) {
  const r = [];
  for (let a = 0; a < t.n; a++) {
    for (let b = a + 15; b < t.n && t.s[b] - t.s[a] < 2.4; b++) {
      if (Math.hypot(t.x[a] - t.x[b], t.y[a] - t.y[b]) > 0.03) continue;
      let area = 0;
      for (let j = a; j < b; j++) area += t.x[j] * t.y[j + 1] - t.x[j + 1] * t.y[j];
      if (Math.abs(area / 2) > 0.04 && !r.some((l) => Math.abs(l.a - a) < 10)) r.push({ a, b });
      break;
    }
  }
  return r;
}

test('cursiva: girar o e ao contrário devagar, com o tremor do toque do celular, não pinta o e (palavras compridas)', () => {
  let semente = 11;
  const rnd = () => { semente = (semente * 16807) % 2147483647; return semente / 2147483647; };
  ['aprendo.', 'boneca.', 'Mamãe', 'escola.', 'escreve', 'bem'].forEach((w) => {
    const px = pxNoCelular(w), o = C.opTela(px), { t, lacos } = lacadasDoE(w);
    assert.ok(lacos.length >= 1, w + ': tem o laço do e');
    lacos.forEach(({ a, b }) => [0.5, 1].forEach((vel) => [0.75, 1, 1.25].forEach((ruido) => {
      const volta = [];
      for (let j = b; j >= a; j -= 2) volta.push([t.x[j], t.y[j]]);
      let g = [[t.x[a], t.y[a]]];
      for (let v = 0; v < 4; v++) g = g.concat(volta);
      const d = mao(t, a, toque(g, vel, ruido, px, rnd), o);
      assert.ok(t.s[d.k] < t.s[b] - 0.05, `${w} (${px} px): a laçada em ${t.s[a].toFixed(1)} ao contrário pintou (vel ${vel}, ruído ${ruido} px)`);
    })));
  });
});

test('cursiva: no celular, seguir o caminho certo com o tremor do toque chega ao fim', () => {
  let semente = 5;
  const rnd = () => { semente = (semente * 16807) % 2147483647; return semente / 2147483647; };
  ['aprendo.', 'Mariana', 'unicórnio', 'escreve', 'tinta', 'bem'].forEach((w) => {
    const px = pxNoCelular(w), o = C.opTela(px);
    C.palavra(w).tracos.forEach((t) => [0.5, 2].forEach((vel) => {
      const pts = [];
      for (let j = 0; j < t.n; j += 3) pts.push([t.x[j], t.y[j]]);
      pts.push([t.x[t.n - 1], t.y[t.n - 1]]);
      assert.ok(pronto(t, mao(t, 0, toque(pts, vel, 1, px, rnd).concat([pts[pts.length - 1]]), o).k), `${w} (${px} px, vel ${vel})`);
    }));
  });
});

test('cursiva: zigue-zague baixinho (entre a linha de base e a do meio) não escreve me, um, meu, é, eu', () => {
  TOLS.forEach((o) => ['me', 'um', 'meu', 'é', 'eu', 'leite.'].forEach((w) => [0.06, 0.1].forEach((px) => {
    const t = C.palavra(w).tracos[0];
    let k = 0;
    for (let vez = 0; vez < 3; vez++) {
      const pts = [[t.x[k], t.y[k]]];
      for (let i = 0, x = t.x[k]; i < 60; i++) { x += px; pts.push([x, i % 2 ? 1.0 : 0.0]); }
      k = mao(t, k, denso(pts), o).k;
    }
    assert.ok(!pronto(t, k), `${w}: o zigue-zague (passo ${px}) escreveu a palavra`);
  })));
});

test('cursiva: virar um pouco antes da ponta de um bico (o alto do i e do t, o fundo do m e do n) ainda passa', () => {
  TOLS.forEach((o) => ['mini', 'tinta', 'nem', 'pipoca', 'Mamãe'].forEach((w) => {
    const t = C.palavra(w).tracos[0], bicos = [];
    // cada bico aparece em umas 4 amostras seguidas: vale a do meio
    let grupo = [];
    for (let j = 3; j < t.n - 3; j++) {
      if (t.dx[j - 3] * t.dx[j + 1] + t.dy[j - 3] * t.dy[j + 1] < -0.3) { grupo.push(t.s[j]); continue; }
      if (grupo.length) { bicos.push(grupo[Math.floor(grupo.length / 2)]); grupo = []; }
    }
    // o dedo pula 0,1 de arco antes e depois de cada bico (vira antes de chegar na ponta)
    const pts = [];
    for (let j = 0; j < t.n; j += 2) if (!bicos.some((b) => Math.abs(t.s[j] - b) < 0.1)) pts.push([t.x[j], t.y[j]]);
    pts.push([t.x[t.n - 1], t.y[t.n - 1]]);
    assert.ok(bicos.length >= 2, w + ': tem bicos');
    assert.ok(pronto(t, mao(t, 0, denso(pts), o).k), w + ': virando 0,1 antes dos bicos, chega ao fim');
  }));
});

test('cursiva: o n escrito como u (a curva embaixo em vez do montinho em cima) não fica pronto (letra grande)', () => {
  // com a tolerância do config (tablet, notebook); no celular, com a letra pequena, a diferença cabe no dedo
  const n = C.palavra('n').tracos[0], u = C.palavra('u').tracos[0];
  const pts = Array.from({ length: Math.ceil(u.n / 2) }, (_, i) => [u.x[2 * i], u.y[2 * i]]);
  assert.ok(n.s[mao(n, 0, pts).k] < n.comp * 0.7, 'n como u');
});

test('cursiva: para trás, pulos e tocar longe não pintam; longe demais solta a ponta', () => {
  const ti = C.palavra('ti').tracos[0], topo = ti.y.indexOf(Math.max(...ti.y));
  const desce = topo + 20;
  assert.strictEqual(C.seguir(ti, desce, ti.x[desce], ti.y[desce], ti.x[desce - 15], ti.y[desce - 15]), desce, 'voltar pelo caminho não pinta');
  assert.ok(C.seguir(ti, desce, ti.x[desce], ti.y[desce], ti.x[desce + 15], ti.y[desce + 15]) > desce, 'descendo, pinta');
  const t = C.palavra('bola').tracos[0], meio = em(t, 2), longe = em(t, 2.6);
  assert.strictEqual(C.perto(t, meio, t.x[longe], t.y[longe]), false, 'tocar longe da ponta não começa');
  assert.strictEqual(C.perto(t, meio, t.x[meio] + 0.1, t.y[meio]), true, 'tocar na ponta começa');
  const d = C.tocar(t, meio, t.x[meio], t.y[meio]);
  C.arrastar(d, t.x[meio] + 0.5, t.y[meio] + 0.5);
  C.arrastar(d, t.x[meio] + 1, t.y[meio] + 1);
  assert.strictEqual(d.pegou, false, 'longe demais: soltou');
  C.arrastar(d, t.x[meio], t.y[meio]);
  C.arrastar(d, t.x[meio + 10], t.y[meio + 10]);
  assert.strictEqual(d.k, meio, 'solto, voltar arrastando por cima da bolinha não pega de novo');
  const d2 = C.tocar(t, meio, t.x[meio], t.y[meio]);
  assert.strictEqual(d2.pegou, true, 'levantou e tocou de novo na bolinha: pegou');
  C.arrastar(d2, t.x[meio + 6], t.y[meio + 6]);
  assert.ok(d2.k > meio, 'e segue pintando');
});

test('cursiva: pingo, acento, cedilha, corte do t e ponto final aparecem como marcas; a maiúscula O levanta a caneta', () => {
  const tipos = (p) => p.marcas.map((m) => m.tipo).join(',');
  assert.strictEqual(tipos(C.palavra('i')), 'ponto');
  assert.strictEqual(tipos(C.palavra('í')), 'risco', 'o i com acento perde o pingo');
  assert.strictEqual(tipos(C.palavra('t')), 'risco');
  assert.strictEqual(tipos(C.palavra('é')), 'risco');
  assert.strictEqual(tipos(C.palavra('ç')), 'risco');
  assert.strictEqual(tipos(C.palavra('mamãe.')), 'risco,ponto', 'o til e o ponto final');
  assert.strictEqual(C.palavra('Olá').tracos.length, 2, 'O + lá');
  assert.strictEqual(C.palavra('Mamãe').tracos.length, 1, 'o M emenda no a');
});

test('cursiva: o sorteio dá frases diferentes e evita as da última vez', () => {
  const a = Array.from(C.sortearFrases(2)), b = Array.from(C.sortearFrases(2));
  assert.strictEqual(a.length, 2);
  assert.notStrictEqual(a[0], a[1]);
  assert.ok(!b.some((f) => a.includes(f)), 'não repete as da última vez');
  assert.strictEqual(C.sortearFrases().length, R.config.cursiva.frasesPorBola, 'padrão: config.cursiva.frasesPorBola');
  assert.throws(() => C.registrarFrases(['Xis #']), /sem desenho/);
});
