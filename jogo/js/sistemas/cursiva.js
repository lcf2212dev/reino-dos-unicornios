/* Letra cursiva (docs/contratos/cursiva.md): monta o caminho de cada palavra a partir do desenho das letras
   (conteudo/cursiva-letras.js) e diz até onde o dedo já traçou, só no sentido certo. Reino.Cursiva:
     J                         altura (em x-altura) onde uma letra emenda na outra
     registrarLetras({ ch: { p: [[x, y], [x, y, 1] = bico], l?, alto?, saiAlto?, liga?, cx?, marcas? } })
     letra(ch) → def | null    letras() → [ch]
     faltam(texto) → [ch]      as letras do texto que não têm desenho (o teste e o validador olham)
     palavra(texto) → { texto, tracos: [traço], marcas: [marca], larg, topo, fundo }
     frase(texto) → { texto, palavras: [palavra com x0], larg, topo, fundo }
       traço = { x: [], y: [], s: [] (arco), n, comp, dx, dy (a direção em cada ponto), bicos: [arco de cada bico] }: a
       amostra do caminho, de PASSO em PASSO (x-altura = 1, y para cima, já inclinado); marca = { tipo: 'risco' | 'ponto', x: [], y: [] } (pingo, acento, corte do t, ponto final:
       aparecem sozinhos quando a palavra acaba)
     seguir(traço, k, x0, y0, x1, y1, op?) → k'   o dedo andou de (x0, y0) a (x1, y1): até onde a ponta k anda (só
                                         para a frente, só puxada pelo dedo e no sentido certo; regra no bloco abaixo)
     perto(traço, k, x, y, op?) → bool   o dedo encostou na ponta (op.pegar): é por aí que começa
     tocar(traço, k, x, y, op?) → dedo   arrastar(dedo, x, y) → dedo { k, pegou, contra, solto }: o dedo inteiro (a tela usa)
     op = { tol (TOL, config.cursiva.tolerancia), pegar (PEGAR, .pegar), contra (CONTRA, .contra) }, em x-altura
     registrarFrases([texto]) frases() → [texto]   o banco de frases (conteudo/cursiva-frases.js)
     sortearFrases(n?) → [texto]   n frases diferentes (padrão config.cursiva.frasesPorBola), sem repetir as da
                                   última vez enquanto der; chave 'cursiva:frases' no modo congelado
   Nada no save, nada de DOM (node: true). */
(function () {
  var R = window.Reino;
  var J = 0.15, PASSO = 0.03, TOL = 0.3, PEGAR = 0.5, CONE = 0.5, CONTRA = 0.35;
  var LETRAS = {}, FRASES = [], ultimas = [];
  var MARCAS = { '́': 'agudo', '̀': 'grave', '̂': 'circunflexo', '̃': 'til', '̧': 'cedilha' };
  var PONTUACAO = { '.': 1, ',': 1, '!': 1, '?': 1 };

  function cfg() { return (R.config && R.config.cursiva) || {}; }
  function num(v, padrao) { return typeof v === 'number' && isFinite(v) ? v : padrao; }
  function inclinacao() { return num(cfg().inclinacao, 0.15); }

  function registrarLetras(mapa) {
    Object.keys(mapa).forEach(function (ch) {
      var d = mapa[ch];
      if (!d || !Array.isArray(d.p) || d.p.length < 2) throw new Error('Cursiva: a letra "' + ch + '" precisa de p com 2 pontos ou mais');
      LETRAS[ch] = d;
    });
  }
  function letra(ch) { return LETRAS[ch] || null; }
  function letras() { return Object.keys(LETRAS); }

  // 'é' → { base: 'e', marcas: ['agudo'] }; pontuação → { pont: '.' }
  function partes(texto) {
    var r = [];
    String(texto).normalize('NFD').split('').forEach(function (c) {
      if (MARCAS[c] && r.length && r[r.length - 1].base) r[r.length - 1].marcas.push(MARCAS[c]);
      else if (PONTUACAO[c]) r.push({ pont: c });
      else if (c !== ' ') r.push({ base: c, marcas: [] });
    });
    return r;
  }
  function faltam(texto) {
    var f = [];
    partes(texto).forEach(function (q) { if (q.base && !LETRAS[q.base] && f.indexOf(q.base) < 0) f.push(q.base); });
    return f;
  }

  /* ---------- curvas: Catmull-Rom centrípeta entre bicos, amostrada em PASSO de arco ---------- */
  function catmull(p0, p1, p2, p3, n, saida) {
    function t(a, b, ti) { var dx = b[0] - a[0], dy = b[1] - a[1]; return ti + Math.max(1e-4, Math.pow(dx * dx + dy * dy, 0.25)); }
    var t0 = 0, t1 = t(p0, p1, t0), t2 = t(p1, p2, t1), t3 = t(p2, p3, t2);
    for (var i = 1; i <= n; i++) {
      var tt = t1 + (t2 - t1) * i / n, q = [];
      for (var e = 0; e < 2; e++) {
        var a1 = (t1 - tt) / (t1 - t0) * p0[e] + (tt - t0) / (t1 - t0) * p1[e];
        var a2 = (t2 - tt) / (t2 - t1) * p1[e] + (tt - t1) / (t2 - t1) * p2[e];
        var a3 = (t3 - tt) / (t3 - t2) * p2[e] + (tt - t2) / (t3 - t2) * p3[e];
        var b1 = (t2 - tt) / (t2 - t0) * a1 + (tt - t0) / (t2 - t0) * a2;
        var b2 = (t3 - tt) / (t3 - t1) * a2 + (tt - t1) / (t3 - t1) * a3;
        q.push((t2 - tt) / (t2 - t1) * b1 + (tt - t1) / (t2 - t1) * b2);
      }
      saida.push(q);
    }
  }
  // [[x, y, bico?]] → pontos densos; cada trecho entre bicos é uma curva lisa
  function curva(pts) {
    var saida = [[pts[0][0], pts[0][1]]], ini = 0;
    saida.bicos = [];
    for (var i = 1; i < pts.length; i++) {
      if (!(pts[i][2] || i === pts.length - 1)) continue;
      if (ini > 0) saida.bicos.push(saida.length - 1);
      var tr = pts.slice(ini, i + 1);
      for (var j = 0; j < tr.length - 1; j++) {
        var a = tr[j], b = tr[j + 1];
        var p0 = j > 0 ? tr[j - 1] : [2 * a[0] - b[0], 2 * a[1] - b[1]];
        var p3 = j + 2 < tr.length ? tr[j + 2] : [2 * b[0] - a[0], 2 * b[1] - a[1]];
        var n = Math.max(4, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (PASSO / 3)));
        catmull(p0, a, b, p3, n, saida);
      }
      ini = i;
    }
    return saida;
  }
  // pontos densos → amostra de PASSO em PASSO de arco (o que o dedo segue)
  function amostrar(densos) {
    var x = [densos[0][0]], y = [densos[0][1]], s = [0], acc = 0, prox = PASSO, bicos = [], marcas = {};
    (densos.bicos || []).forEach(function (i) { marcas[i] = 1; });
    for (var i = 1; i < densos.length; i++) {
      var a = densos[i - 1], b = densos[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (marcas[i - 1]) bicos.push(acc);
      while (d > 0 && acc + d >= prox) {
        var f = (prox - acc) / d;
        x.push(a[0] + (b[0] - a[0]) * f); y.push(a[1] + (b[1] - a[1]) * f); s.push(prox);
        prox += PASSO;
      }
      acc += d;
    }
    var ul = densos[densos.length - 1];
    if (acc - s[s.length - 1] > PASSO / 4) { x.push(ul[0]); y.push(ul[1]); s.push(acc); }
    return { x: x, y: y, s: s, n: x.length, comp: acc, bicos: bicos };
  }

  // a direção em que o caminho anda em cada ponto (para a frente, 2 amostras): dx, dy unitários
  function direcoes(a) {
    a.dx = []; a.dy = [];
    for (var j = 0; j < a.n; j++) {
      var i0 = Math.min(j, a.n - 3), i1 = Math.min(a.n - 1, i0 + 2);
      if (i0 < 0) i0 = 0;
      var vx = a.x[i1] - a.x[i0], vy = a.y[i1] - a.y[i0], v = Math.hypot(vx, vy) || 1;
      a.dx.push(vx / v); a.dy.push(vy / v);
    }
    return a;
  }

  /* ---------- marcas (pingo, acentos, cedilha, corte do t, pontuação) ---------- */
  function risco(pts, liso) { var d = liso ? curva(pts) : pts; return { tipo: 'risco', x: d.map(function (p) { return p[0]; }), y: d.map(function (p) { return p[1]; }) }; }
  function ponto(x, y) { return { tipo: 'ponto', x: [x], y: [y] }; }
  function acento(tipo, cx, h) {
    if (tipo === 'agudo') return risco([[cx - 0.08, h], [cx + 0.14, h + 0.3]]);
    if (tipo === 'grave') return risco([[cx - 0.14, h + 0.3], [cx + 0.08, h]]);
    if (tipo === 'circunflexo') return risco([[cx - 0.16, h], [cx, h + 0.26], [cx + 0.16, h]]);
    if (tipo === 'til') return risco([[cx - 0.2, h + 0.04], [cx - 0.08, h + 0.2], [cx + 0.07, h + 0.08], [cx + 0.2, h + 0.24]], true);
    return null;
  }
  function marcasDaLetra(d, q, ox) {
    var r = [], cx = ox + (typeof d.cx === 'number' ? d.cx : ultimo(d)[0] / 2), alta = !!d.maiuscula;
    (d.marcas || []).forEach(function (m) {
      if (m.ponto) r.push(ponto(ox + m.ponto[0], m.ponto[1]));
      else if (m.risco) r.push(risco(m.risco.map(function (p) { return [ox + p[0], p[1]]; }), m.liso));
    });
    q.marcas.forEach(function (tipo) {
      if (tipo === 'cedilha') { r.push(risco([[cx + 0.02, -0.02], [cx + 0.1, -0.16], [cx - 0.02, -0.3], [cx - 0.14, -0.26]], true)); return; }
      var tem = (d.marcas || []).some(function (m) { return m.ponto; });   // o i com acento perde o pingo
      if (tem) r = r.filter(function (m) { return m.tipo !== 'ponto'; });
      var a = acento(tipo, cx, alta ? 2.25 : 1.25);
      if (a) r.push(a);
    });
    return r;
  }
  function pontuacao(c, x) {
    if (c === '.') return [ponto(x + 0.3, 0.05)];
    if (c === ',') return [risco([[x + 0.3, 0.06], [x + 0.22, -0.22]])];
    if (c === '!') return [risco([[x + 0.18, 1.9], [x + 0.13, 0.45]]), ponto(x + 0.11, 0.05)];
    if (c === '?') return [risco([[x + 0.02, 1.5], [x + 0.2, 1.85], [x + 0.46, 1.75], [x + 0.42, 1.25], [x + 0.2, 0.95], [x + 0.18, 0.5]], true), ponto(x + 0.18, 0.05)];
    return [];
  }
  function ultimo(d) { return d.p[d.p.length - 1]; }

  /* ---------- palavra e frase ---------- */
  function palavra(texto) {
    var qs = partes(texto), tracos = [], marcas = [], atual = null, ox = 0, alto = false, fim = 0;
    qs.forEach(function (q) {
      if (q.pont) { marcas = marcas.concat(pontuacao(q.pont, fim)); fim += 0.5; return; }
      var d = LETRAS[q.base];
      if (!d) return;
      var de = 0;
      if (atual) {
        if (atual.liga) de = alto ? (typeof d.alto === 'number' ? d.alto : 1) : 1;
        else { ox = fim + 0.18; atual = null; }
      }
      if (!atual) { atual = { pts: [], liga: true }; tracos.push(atual); }
      for (var i = de; i < d.p.length; i++) {
        var p = d.p[i];
        atual.pts.push([ox + p[0], p[1], i === de && de > 0 ? 0 : p[2]]);
      }
      marcas = marcas.concat(marcasDaLetra(d, q, ox));
      var u = ultimo(d);
      fim = ox + (typeof d.l === 'number' ? d.l : u[0]);
      atual.liga = d.liga !== false;
      alto = !!d.saiAlto;
      ox = ox + u[0];
    });
    var inc = inclinacao(), topo = 1, fundo = 0, larg = 0;
    function inclinar(xs, ys) {
      for (var i = 0; i < xs.length; i++) {
        xs[i] += ys[i] * inc;
        larg = Math.max(larg, xs[i]); topo = Math.max(topo, ys[i]); fundo = Math.min(fundo, ys[i]);
      }
    }
    var prontos = tracos.map(function (t) {
      var a = amostrar(curva(t.pts));
      inclinar(a.x, a.y);
      return direcoes(a);
    });
    marcas.forEach(function (m) { inclinar(m.x, m.y); });
    return { texto: texto, tracos: prontos, marcas: marcas, larg: Math.max(larg, fim), topo: topo, fundo: fundo };
  }
  function frase(texto) {
    var x = 0, topo = 1, fundo = 0, espaco = typeof cfg().espaco === 'number' ? cfg().espaco : 0.9;
    var ps = String(texto).split(/\s+/).filter(Boolean).map(function (t) {
      var p = palavra(t);
      p.x0 = x;
      x += p.larg + espaco;
      topo = Math.max(topo, p.topo); fundo = Math.min(fundo, p.fundo);
      return p;
    });
    return { texto: texto, palavras: ps, larg: Math.max(0, x - espaco), topo: topo, fundo: fundo };
  }

  /* ---------- o banco de frases ---------- */
  function registrarFrases(lista) {
    lista.forEach(function (f) {
      var falta = faltam(f);
      if (falta.length) throw new Error('Cursiva: a frase "' + f + '" tem letra sem desenho: ' + falta.join(' '));
      if (FRASES.indexOf(f) < 0) FRASES.push(f);
    });
  }
  function sortearFrases(n) {
    n = Math.max(1, Math.min(FRASES.length, n || num(cfg().frasesPorBola, 2)));
    var novas = FRASES.filter(function (f) { return ultimas.indexOf(f) < 0; });
    var lista = (novas.length >= n ? novas : FRASES).slice();
    var r = R.util && R.util.embaralhar ? R.util.embaralhar(lista, 'cursiva:frases') : lista;
    ultimas = r.slice(0, n);
    return ultimas.slice();
  }

  /* ---------- seguir o dedo ----------
     A ponta (k) é uma conta num fio: só anda para a frente e só quando o dedo a puxa. Em cada passinho do dedo
     (direção m), a ponta vai para o ponto j logo à frente (até ALCANCE de arco; com um bico a até ALCANCE à frente,
     até ALCANCE depois do bico: dá para virar um pouco antes da ponta dele, mas não cortar o alto de uma laçada) que:
       - fica a menos de `tol` do dedo e mais perto dele que a ponta;
       - é, com folga de FOLGA, o pedaço do caminho mais perto do dedo na vizinhança (VIZINHO para trás e para a
         frente): o dedo do lado errado de uma laçada fina (e, l, b, h, f) está mais perto do outro lado dela;
       - tem o caminho andando para onde o dedo anda (até 60° da direção do caminho EM j).
     Girar ao contrário, voltar, andar de lado, rabiscar ou cortar caminho por dentro de uma laçada: nada pinta.
     Os bicos são os [x, y, 1] do desenho das letras (o alto do i e do t, o fundo do m, a haste do a). */
  var ALCANCE = 0.3, FOLGA = 0.08, VIZINHO = 1.4;
  // o dedo só conta depois de andar PASSADA desde o último ponto que contou: a direção é a desse pedaço, não a de cada
  // evento (o toque do celular treme menos de 1 px, e um passo de 1 px pode apontar para qualquer lado)
  var PASSADA = 0.06;
  function op(o) {
    o = o || {};
    return { tol: o.tol || num(cfg().tolerancia, TOL), pegar: o.pegar || num(cfg().pegar, PEGAR),
      cone: num(o.cone, CONE), contra: o.contra || num(cfg().contra, CONTRA), alcance: o.alcance || ALCANCE, passada: o.passada || PASSADA };
  }
  function indiceEm(t, s, de) { var j = de; while (j < t.n - 1 && t.s[j + 1] <= s) j++; while (j > 0 && t.s[j] > s) j--; return j; }
  function seguir(t, k, x0, y0, x1, y1, o) {
    o = op(o);
    var d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / Math.min(0.05, o.tol / 3)));
    if (d < 1e-6) return k;
    var ux = (x1 - x0) / d, uy = (y1 - y0) / d;
    for (var i = 1; i <= n; i++) {
      var fx = x0 + (x1 - x0) * i / n, fy = y0 + (y1 - y0) * i / n;
      var lo = indiceEm(t, t.s[k] - VIZINHO, k), hi = indiceEm(t, t.s[k] + VIZINHO, k), perto = Infinity, j;
      for (j = lo; j <= hi; j++) perto = Math.min(perto, Math.hypot(t.x[j] - fx, t.y[j] - fy));
      var melhor = k, md = Math.hypot(t.x[k] - fx, t.y[k] - fy), lim = t.s[k] + o.alcance;
      (t.bicos || []).forEach(function (b) { if (b > t.s[k] && b <= t.s[k] + o.alcance) lim = Math.max(lim, b + o.alcance); });
      for (j = k + 1; j < t.n && t.s[j] <= lim; j++) {
        var dd = Math.hypot(t.x[j] - fx, t.y[j] - fy);
        if (dd > o.tol || dd >= md || dd > perto + FOLGA) continue;
        if (ux * t.dx[j] + uy * t.dy[j] < o.cone) continue;
        md = dd; melhor = j;
      }
      k = melhor;
    }
    return k;
  }
  // o dedo encostou na ponta: é só ali que começa (ou recomeça depois de levantar ou se perder)
  function perto(t, k, x, y, o) {
    o = op(o);
    for (var j = Math.max(0, k - 3); j <= Math.min(t.n - 1, k + 3); j++) if (Math.hypot(t.x[j] - x, t.y[j] - y) <= o.pegar) return true;
    return false;
  }
  // o dedo inteiro: tocar(traço, k, x, y) → dedo; arrastar(dedo, x, y) → dedo, com dedo.k (a ponta), dedo.pegou (está
  // puxando a ponta), dedo.contra (andou op.contra sem pintar, ou se afastou da ponta: a setinha fica vermelha) e
  // dedo.solto (se afastou demais).
  // Só pega a ponta tocando nela; afastou mais de 2,2 × tol: soltou, e só pinta de novo levantando o dedo e tocando
  // na bolinha (passar por cima dela arrastando não pega: rabiscar não escreve)
  function tocar(t, k, x, y, o) {
    o = op(o);
    var pegou = perto(t, k, x, y, o);
    return { t: t, k: k, x: x, y: y, rx: x, ry: y, ax: x, ay: y, o: o, pegou: pegou, contra: !pegou, solto: false };
  }
  function arrastar(dd, x, y) {
    var t = dd.t, o = dd.o;
    dd.x = x; dd.y = y;
    if (!dd.pegou) return dd;
    if (Math.hypot(x - t.x[dd.k], y - t.y[dd.k]) > o.tol * 2.2) { dd.pegou = false; dd.solto = true; dd.contra = true; return dd; }
    if (Math.hypot(x - dd.rx, y - dd.ry) < o.passada) return dd;
    var k0 = dd.k;
    dd.k = seguir(t, dd.k, dd.rx, dd.ry, x, y, o);
    dd.rx = x; dd.ry = y;
    if (dd.k > k0) { dd.contra = false; dd.ax = x; dd.ay = y; return dd; }
    if (Math.hypot(x - dd.ax, y - dd.ay) > o.contra) dd.contra = true;
    return dd;
  }

  R.Cursiva = { J: J, PASSO: PASSO, TOL: TOL, PEGAR: PEGAR, registrarLetras: registrarLetras, letra: letra, letras: letras,
    faltam: faltam, palavra: palavra, frase: frase, seguir: seguir, perto: perto, tocar: tocar, arrastar: arrastar,
    registrarFrases: registrarFrases, frases: function () { return FRASES.slice(); }, sortearFrases: sortearFrases };
})();
