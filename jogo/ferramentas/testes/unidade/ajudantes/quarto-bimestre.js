// Ajudante dos testes de aceite do 4º bimestre (não é teste: não termina em .test.js). Responde as questões da Língua
// Portuguesa NA TELA da missão aberta num cenário (cenario.js), sempre no MESMO controle, montado em branco como ela vê:
// a resposta certa (exemplos.certa) e uma errada de verdade, a que a tela produziria (outro índice, par trocado, ordem
// trocada, palavra errada, marca errada, grupo trocado, texto sem as palavras pedidas, V/F invertido, desenho sem o
// pedido); o caminho até ela sai do que o controle tem agora. Modos: 'dom' (clique no elemento, rápido), 'toque' (toque
// de verdade; clique do mouse no notebook) e 'teclado' (Tab até o controle e Enter; digitação pelo teclado).
// Usado por testes/unidade/quarto-bimestre-*.navegador.test.js.
const assert = require('assert');

const DESAFIO = '.tela-missao .missao-corpo .desafio';
const RETORNO = '.tela-missao .missao-retorno';

/* ---------- na página ---------- */
// anota o desafio da vez da missão e o controle dele (nada muda no jogo) e os erros com o id do desafio
function preparar() {
  if (window.__q) return;
  var D = Reino.Desafios, render = D.render, q = window.__q = { atual: null, erros: [], avisosResize: 0, render: render };
  // "ResizeObserver loop completed…" é aviso do navegador (o observador mudou o tamanho no mesmo quadro), não erro do
  // jogo: não chega ao console nem à criança; só se conta
  window.addEventListener('error', function (e) {
    if (/ResizeObserver loop/.test(e.message)) { q.avisosResize++; return; }
    q.erros.push((q.atual ? q.atual.d.id + ': ' : '') + e.message);
  });
  D.render = function (d, opts) {
    var c = render.call(D, d, opts);
    if (opts && opts.modo === 'missao') q.atual = { d: d, ctrl: c };
    return c;
  };
}
// a certa e uma errada que a tela produziria; `livre` = questão pessoal (qualquer resposta vale: não há erro)
function respostas(id) {
  var D = Reino.Desafios, d = window.__q.atual.d;
  if (d.id !== id) return { fora: d.id };
  var certa = Reino.tiposDesafio[d.tipo].exemplos.certa(d);
  // escrever com maiúsculas: o exemplo não põe a maiúscula no começo da frase
  if (d.tipo === 'escrever' && d.maiusculas) certa = certa.replace(/(^|[.!?…]\s*)(\p{Ll})/gu, function (m, a, b) { return a + b.toUpperCase(); });
  var c = JSON.parse(JSON.stringify(certa)), e = null, livre = !!d.livre;
  var errou = function (v) { return D.pontuar(d, v) < 1; };
  if (d.tipo === 'escolha') e = (c + 1) % d.opcoes.length;
  else if (d.tipo === 'vf') e = 1 - c;
  else if (d.tipo === 'varias') {
    var fora = d.opcoes.map(function (o, i) { return o.ok ? -1 : i; }).filter(function (i) { return i >= 0; });
    e = fora.length ? c.concat(fora[0]).sort(function (a, b) { return a - b; }) : c.slice(1);
  } else if (d.tipo === 'vfLista') { e = c.slice(); e[0] = 1 - e[0]; }
  else if (d.tipo === 'completar' || d.tipo === 'separar') {
    for (var k = 1; k < (d.palavras || d.grupos).length && !e; k++) { var t = c.slice(); t[0] = (t[0] + k) % (d.palavras || d.grupos).length; if (errou(t)) e = t; }
  } else if (d.tipo === 'ligar') { e = Object.assign({}, c); e[0] = c[1]; e[1] = c[0]; }
  else if (d.tipo === 'ordenar' || d.tipo === 'frase') { e = c.slice(); e[0] = c[1]; e[1] = c[0]; if (!errou(e)) e = c.slice().reverse(); }
  else if (d.tipo === 'digitar') { e = c.slice(); e[0] = c[0] === 'bola' ? 'casa' : 'bola'; }
  else if (d.tipo === 'tabela') {
    e = JSON.parse(JSON.stringify(c));
    var p = null;
    e.forEach(function (l, i) { l.forEach(function (v, j) { if (!p && v !== null) p = [i, j]; }); });
    var v0 = e[p[0]][p[1]];
    e[p[0]][p[1]] = typeof v0 === 'string' ? 'bola' : d.banco.findIndex(function (b) { return b !== d.banco[v0]; });
  } else if (d.tipo === 'marcar') {
    var n = q0(d).el.querySelectorAll('.marcar-token').length;
    for (var i = 0; i < n && !e; i++) if (c[i] === undefined) { var m = Object.assign({}, c); m[i] = 0; if (errou(m)) e = m; }
    if (!e) { e = Object.assign({}, c); delete e[Object.keys(e)[0]]; }
  } else if (d.tipo === 'escrever') {
    e = ['era uma vez um sapo', 'Oi', 'oi.', 'Era uma vez um sapo. Ele pulou no lago azul.'].find(errou) || null;
    livre = !e;
  } else if (d.tipo === 'desenho') { c = 'desenho-certo'; e = 'desenho-errado'; }
  function q0(x) { return window.__q.render.call(D, x, { onMudar: function () {} }); }
  if (livre) e = null;
  var ok = d.tipo === 'desenho' || D.pontuar(d, certa) === 1;
  return { id: d.id, tipo: d.tipo, d: d, certa: c, errada: e, livre: livre, certaOk: ok, erradaOk: e === null || d.tipo === 'desenho' || errou(e),
    ordem: window.__q.atual.ctrl.ordem || null, tempo: Math.min(8000, Math.max(2500, 1500 + D.tamanhoLeitura(d) * 32)) };
}

/* ---------- ações na tela ---------- */
async function focarPorTab(c, loc) {
  const h = await loc.elementHandle();
  for (let i = 0; i < 160; i++) {
    if (await h.evaluate((e) => e === document.activeElement)) return;
    await c.page.keyboard.press('Tab');
  }
  assert.fail('o Tab não chegou em ' + await h.evaluate((e) => e.className + ' "' + e.textContent.trim().slice(0, 40) + '"'));
}
// tocar num controle: clique no elemento ('dom'), toque/clique de verdade ('toque') ou Tab + Enter ('teclado')
async function acionar(c, loc, modo) {
  if (modo === 'dom') await loc.evaluate((e) => e.click());
  else if (modo === 'teclado') { await focarPorTab(c, loc); await c.page.keyboard.press('Enter'); }
  else if (c.tamanho === 'notebook') await loc.click();
  else await loc.tap();
  await c.avancar(modo === 'dom' ? 20 : 120);
}
async function escrever(c, loc, texto, modo) {
  if (modo === 'teclado') {
    await focarPorTab(c, loc);
    await c.page.keyboard.press('Control+A');
    await c.page.keyboard.press('Backspace');
    await c.page.keyboard.type(texto);
  } else await loc.fill(texto);
  await c.avancar(40);
}
// índice do elemento (entre os do seletor) cujo texto (sem hífen suave nem as aspas « » do inglês, que a tela não mostra) é `texto`
const indiceTexto = (c, sel, texto, ultimo) => c.page.evaluate(([s, t, u]) => {
  const limpo = (x) => x.replace(/[\u00ad«»]/g, '').replace(/\s+/g, ' ').trim();
  const l = Array.from(document.querySelectorAll(s)).map((b) => limpo((u ? b.lastChild : b).textContent));
  return l.indexOf(limpo(t));
}, [sel, texto, !!ultimo]);
// marcar pelo teclado: o token com Tab fica um só (tabindex itinerante); Home e setas até o índice
async function tocarToken(c, cd, i, modo) {
  if (modo !== 'teclado') return acionar(c, cd.locator('.marcar-token').nth(i), modo);
  await focarPorTab(c, cd.locator('.marcar-token[tabindex="0"]'));
  await c.page.keyboard.press('Home');
  for (let k = 0; k < i; k++) await c.page.keyboard.press('ArrowRight');
  await c.page.keyboard.press('Enter');
  await c.avancar(60);
}

/* ---------- desenho: pontos e traços na prancheta 24×24 ---------- */
const cursores = {};   // cursor do teclado de cada desafio (começa no meio da grade)
async function desenhar(c, cd, id, tracos, modo) {
  const tela = cd.locator('.desenho-tela');
  for (const t of tracos) {
    if (t.cor !== undefined) await acionar(c, cd.locator('.desenho-cor').nth(t.cor), modo);
    if (t.ferr) await acionar(c, cd.locator(`.desenho-ferr[aria-label="${t.ferr}"]`), modo);
    const pts = t.de ? [t.de, t.ate] : [t.ponto];
    if (modo === 'teclado') {
      await focarPorTab(c, tela);
      const cur = cursores[id] || (cursores[id] = [12, 12]);
      for (const p of pts) {
        for (; cur[0] !== p[0]; cur[0] += Math.sign(p[0] - cur[0])) await c.page.keyboard.press(p[0] > cur[0] ? 'ArrowRight' : 'ArrowLeft');
        for (; cur[1] !== p[1]; cur[1] += Math.sign(p[1] - cur[1])) await c.page.keyboard.press(p[1] > cur[1] ? 'ArrowDown' : 'ArrowUp');
        await c.page.keyboard.press('Enter');
      }
    } else if (modo === 'dom') {
      await tela.evaluate((cv, ps) => {
        const r = cv.getBoundingClientRect();
        const ev = (tipo, p) => cv.dispatchEvent(new PointerEvent(tipo, { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'mouse', button: 0, buttons: 1,
          clientX: r.left + (p[0] + 0.5) * r.width / 24, clientY: r.top + (p[1] + 0.5) * r.height / 24 }));
        ev('pointerdown', ps[0]); ev('pointermove', ps[ps.length - 1]); ev('pointerup', ps[ps.length - 1]);
      }, pts);
    } else {
      await tela.scrollIntoViewIfNeeded();   // tocar a cor e a ferramenta rola a questão
      const b = await tela.boundingBox(), xy = (p) => [b.x + (p[0] + 0.5) * b.width / 24, b.y + (p[1] + 0.5) * b.height / 24];
      if (pts.length === 1) {
        const [x, y] = xy(pts[0]);
        if (c.tamanho === 'notebook') await c.page.mouse.click(x, y); else await c.page.touchscreen.tap(x, y);
      } else await c.arrastar([...xy(pts[0]), ...xy(pts[1]), 160].join(','));
    }
    await c.avancar(60);
  }
}
const DESENHO_CERTO = [{ cor: 1, ferr: 'Lápis', ponto: [5, 5] }, { cor: 2, ponto: [8, 5] }, { ferr: 'Linha', de: [3, 9], ate: [10, 9] },
  { ferr: 'Quadrado', de: [13, 13], ate: [19, 19] }];
const DESENHO_ERRADO = [{ cor: 0, ferr: 'Lápis', ponto: [3, 3] }];

/* ---------- levar o controle da vez até uma resposta, pelos toques ---------- */
const daVez = (c) => c.page.evaluate(() => { const a = window.__q.atual; return { id: a.d.id, valor: a.ctrl.valor(), pronto: a.ctrl.pronto() }; });
// raiz: o seletor do cartão do desafio (padrão: o da missão; a varredura passa o do painel da pergunta sozinha)
async function levarA(c, r, alvo, modo, raiz = DESAFIO) {
  const { d } = r, cd = c.page.locator(raiz), v = (await daVez(c)).valor;
  switch (d.tipo) {
    case 'escolha': case 'vf': if (v !== alvo) await acionar(c, cd.locator('.opcoes > button').nth(r.ordem.indexOf(alvo)), modo); break;
    case 'varias':
      for (let i = 0; i < d.opcoes.length; i++) if (v.includes(i) !== alvo.includes(i)) await acionar(c, cd.locator('.opcoes > button').nth(r.ordem.indexOf(i)), modo);
      break;
    case 'vfLista': for (let i = 0; i < alvo.length; i++) if (v[i] !== alvo[i]) await acionar(c, cd.locator('.vf-linha').nth(i).locator('.vf-botao').nth(alvo[i]), modo); break;
    case 'completar': for (let i = 0; i < alvo.length; i++) if (v[i] !== alvo[i]) await acionar(c, cd.locator('.frase-completar').nth(i).locator('.chip-palavra').nth(alvo[i]), modo); break;
    case 'ligar':
      for (const i of Object.keys(alvo).map(Number)) {
        if (v[i] === alvo[i]) continue;
        await acionar(c, cd.locator('.ligar-esq').nth(i), modo);
        await acionar(c, cd.locator('.ligar-dir').nth(await indiceTexto(c, `${raiz} .ligar-dir`, d.pares[alvo[i]][1].t, true)), modo);
      }
      break;
    case 'ordenar': case 'frase': {
      let k = 0;
      while (k < v.length && v[k] === alvo[k]) k++;
      for (let n = v.length; n > k; n--) await acionar(c, cd.locator('.seq-alvo .seq-item').nth(n - 1), modo);
      for (let m = k; m < alvo.length; m++) {
        const i = await indiceTexto(c, `${raiz} .seq-monte button`, (d.itens || d.blocos)[alvo[m]]);
        assert.ok(i >= 0, `${d.id}: o bloco "${(d.itens || d.blocos)[alvo[m]]}" não está no monte`);
        await acionar(c, cd.locator('.seq-monte button').nth(i), modo);
      }
      break;
    }
    case 'digitar': for (let i = 0; i < alvo.length; i++) if (v[i] !== alvo[i]) await escrever(c, cd.locator('.digitar .campo-texto').nth(i), alvo[i], modo); break;
    case 'escrever': if (v !== alvo) await escrever(c, cd.locator('.escrever .campo-texto'), alvo, modo); break;
    case 'tabela':
      for (let i = 0; i < d.linhas.length; i++) for (let j = 0; j < d.linhas[i].length; j++) {
        if (alvo[i][j] === null || v[i][j] === alvo[i][j]) continue;
        const td = cd.locator('table.tabela-quadro tbody tr:not(.tabela-acentos)').nth(i).locator('td').nth(j);
        if (typeof alvo[i][j] === 'string') { await escrever(c, td.locator('.campo-texto'), alvo[i][j], modo); continue; }
        if ((await td.locator('.tabela-lacuna').getAttribute('aria-pressed')) !== 'true') await acionar(c, td.locator('.tabela-lacuna'), modo);
        await acionar(c, cd.locator('.tabela-banco .chip-palavra').nth(alvo[i][j]), modo);
      }
      break;
    case 'separar':
      for (let i = 0; i < d.itens.length; i++) {
        if (v[i] === alvo[i]) continue;
        await acionar(c, cd.locator('.sep-item').nth(await indiceTexto(c, `${raiz} .sep-item`, d.itens[i].t, true)), modo);
        // no título do baú: no meio dele estão as palavras já guardadas, e tocar numa a tira de lá (separar.js)
        const bau = cd.locator('.bau').nth(alvo[i]);
        await acionar(c, modo === 'toque' ? bau.locator('.bau-titulo') : bau, modo);
      }
      break;
    case 'marcar': {
      const tem = v || {}, idx = [...new Set(Object.keys(tem).concat(Object.keys(alvo)))].map(Number).sort((a, b) => a - b);
      for (const i of idx) {
        if (tem[i] === alvo[i]) continue;
        const cat = alvo[i] !== undefined ? alvo[i] : tem[i];
        if (d.cores && (await cd.locator('.marcar-cor').nth(cat).getAttribute('aria-pressed')) !== 'true') await acionar(c, cd.locator('.marcar-cor').nth(cat), modo);
        await tocarToken(c, cd, i, modo);
      }
      break;
    }
    case 'desenho': await desenhar(c, cd, d.id, alvo === 'desenho-certo' ? DESENHO_CERTO : DESENHO_ERRADO, modo); break;
    default: assert.fail(`${d.id}: tipo ${d.tipo} sem caminho pela tela neste ajudante`);
  }
  await c.avancar(60);
}

/* ---------- Conferir, "Tentar de novo" e "Continuar" ---------- */
const retorno = (c) => c.js(`(function (r) { return r.hidden ? null : r.classList.contains('retorno-certo') ? 'certo' : 'quase'; })(document.querySelector('${RETORNO}'))`);
async function conferir(c, modo) {
  const btn = c.page.locator('.tela-missao .btn-conferir');
  if (!(await btn.isEnabled())) return 'desligado';
  await acionar(c, btn, modo);
  if (!(await retorno(c)) && await btn.isEnabled()) await acionar(c, btn, modo);   // o 1º, rápido demais, é o aviso de pressa
  return retorno(c);
}
async function botaoDoRetorno(c, re, modo) {
  const i = await c.page.evaluate(([s, r]) => Array.from(document.querySelectorAll(s + ' button')).findIndex((b) => new RegExp(r).test(b.textContent)), [RETORNO, re]);
  if (i < 0) return false;
  await acionar(c, c.page.locator(`${RETORNO} button`).nth(i), modo);
  return true;
}

// a questão da vez: montada em branco; a errada e o "Quase!"; "Tentar de novo"; a certa NO MESMO controle e "Isso!";
// "Continuar" (ou "Terminar a sala"). op: { errar, calma (espera o tempo de leitura antes do Conferir) }
async function responderDaVez(c, esperado, modo, op = {}) {
  const errar = op.errar !== false, rel = { id: esperado, problemas: [] };
  // pelo teclado, o Enter logo depois da troca de questão não vale (UI.focarTeclado, calma de 400 ms)
  if (modo === 'teclado') await c.avancar(500);
  const r = await c.page.evaluate(respostas, esperado);
  if (r.fora) { rel.problemas.push(`na tela: ${r.fora} (fora da ordem do livro)`); return rel; }
  Object.assign(rel, { tipo: r.tipo, livre: r.livre });
  if (!r.certaOk) rel.problemas.push('a certa do exemplo não vale certo');
  if (!r.erradaOk) rel.problemas.push('a errada gerada vale certo');
  const branco = await c.js("(function (a, b) { return { pronto: a.ctrl.pronto(), ligado: !b.disabled, nota: a.ctrl.valor() == null ? 0 : Reino.Desafios.pontuar(a.d, a.ctrl.valor()) }; })(window.__q.atual, document.querySelector('.tela-missao .btn-conferir'))");
  if (branco.pronto || branco.ligado || branco.nota >= 1) rel.problemas.push('não começa em branco: ' + JSON.stringify(branco));
  await c.js('window.__q.atual.ctrl.__marca = 1');   // o mesmo controle do começo ao fim
  if (errar && r.errada !== null) {
    await levarA(c, r, r.errada, modo);
    const ve = await daVez(c);
    if (!ve.pronto) rel.problemas.push('a errada não ligou o Conferir');
    rel.errado = await conferir(c, modo);
    if (rel.errado !== 'quase') rel.problemas.push('a errada deu: ' + rel.errado);
    if (!(await botaoDoRetorno(c, 'Tentar de novo', modo))) rel.problemas.push('sem o "Tentar de novo"');
    await c.avancar(1100);   // a marca do erro sai e o que estava errado se apaga (arte.md §19.2)
  }
  await levarA(c, r, r.certa, modo);
  const vc = await c.js('(function (a) { return { nota: Reino.Desafios.pontuar(a.d, a.ctrl.valor()), mesmo: a.ctrl.__marca === 1, pronto: a.ctrl.pronto() }; })(window.__q.atual)');
  if (vc.nota !== 1) rel.problemas.push('a resposta dada na tela não é a certa (' + vc.nota + ')');
  if (!vc.mesmo) rel.problemas.push('o controle foi montado de novo');
  if (op.calma) await c.avancar(r.tempo);
  rel.certo = await conferir(c, modo);
  if (rel.certo !== 'certo') {
    rel.problemas.push('a certa deu: ' + rel.certo + ' ' + JSON.stringify(await c.js(`(function (r, a) { return { retorno: r.textContent.replace(/\\s+/g, ' ').slice(0, 120), valor: a.ctrl.valor() }; })(document.querySelector('${RETORNO}'), window.__q.atual)`)));
    return rel;
  }
  rel.primeira = await c.js(`/\\+1/.test(document.querySelector('${RETORNO} h3').textContent)`);
  rel.ultimo = await c.js(`/Terminar/.test(document.querySelector('${RETORNO}').textContent)`);
  if (!(await botaoDoRetorno(c, 'Continuar|Terminar', modo))) rel.problemas.push('sem o "Continuar"');
  return rel;
}

/* ---------- andar e tocar no mundo ---------- */
async function esperar(c, cond, msMax = 15000, passo = 200) {
  for (let t = 0; t <= msMax; t += passo) { if (await c.js(cond)) return true; await c.avancar(passo); }
  return false;
}
async function tocarTile(c, x, y) {
  const p = await c.js(`(function (p) { var el = p && document.elementFromPoint(p.x, p.y); return p && { x: p.x, y: p.y, canvas: !!el && el.tagName === 'CANVAS' }; })(__reino.paraTela(${x * 16 + 8}, ${y * 16 + 8}))`);
  assert.ok(p && p.canvas, `tile (${x}, ${y}) fora da tela ou coberto no ${c.tamanho}: ${JSON.stringify(p)}`);
  if (c.tamanho === 'notebook') await c.page.mouse.click(p.x, p.y); else await c.page.touchscreen.tap(p.x, p.y);
  await c.avancar(100);
}
async function andarAte(c, x, y) {
  assert.ok(await c.js(`Jogador.irPara(${x}, ${y})`), `sem caminho até (${x}, ${y}) em ${await c.js('__reino.cena()')}`);
  assert.ok(await esperar(c, `(function (t) { return t.x === ${x} && t.y === ${y} && !Jogador.caminho.length; })(Jogador.tile())`, 30000, 300),
    `não chegou a (${x}, ${y}): está em ${JSON.stringify(await c.js('Jogador.tile()'))}`);
}
// a estação da sala na Casa das Palavras aberta (térreo `portugues` ou 1º andar `portugues-1`): o objeto e o tile onde
// ela para para usá-la (o mesmo cálculo do toque)
const CASA = ['portugues', 'portugues-1'];
const achaEstacao = (c, salaId) => c.js(`(function (it) { if (!it) return null; var a = Reino.Cena.atual().alvoEm(it.o.x * 16 + 8, it.o.y * 16 + 8);
    return { x: it.o.x, y: it.o.y, tile: a && a.tile, olhar: a && a.olhar, chave: a && a.objeto && a.objeto.chave }; })(
    ${JSON.stringify(CASA)}.indexOf(__reino.cena()) >= 0 ? Reino.Cena.atual()._objetos.find(function (it) { return it.o.chave === 'lp-sala-${salaId}'; }) : null)`);
async function estacao(c, salaId) {
  const e = await achaEstacao(c, salaId);
  assert.ok(e, `a estação da sala ${salaId} não está neste andar da Casa das Palavras (cena: ${await c.js('__reino.cena()')})`);
  assert.strictEqual(e.chave, 'lp-sala-' + salaId, `o toque na estação de ${salaId} acha outra coisa`);
  return e;
}
// vai ao andar da Casa das Palavras onde está a estação da sala (as salas do Livro de Atividades ficam no 1º andar)
async function irAEstacao(c, salaId) {
  if (CASA.indexOf(await c.js('__reino.cena()')) >= 0 && await achaEstacao(c, salaId)) return estacao(c, salaId);
  for (const andar of CASA) {
    await c.ir(andar);
    if (await achaEstacao(c, salaId)) return estacao(c, salaId);
  }
  return estacao(c, salaId);
}

/* ---------- a trilha das etapas (sala de livro, quarto-bimestre.md §13.3) ---------- */
// o que a missão mostra agora: trilha, carta, desafio, fimEtapa, festa (trilha perfeita), fimSala ou fechada
const telaDaMissao = (c) => c.js(`(function (t) { if (!t) return 'fechada';
  if (t.querySelector('.festa-trilha')) return 'festa'; if (t.querySelector('.fim-etapa')) return 'fimEtapa'; if (t.querySelector('.fim-sala')) return 'fimSala';
  if (t.querySelector('.resumo-sala')) return 'carta'; if (t.querySelector('.missao-corpo .desafio')) return 'desafio'; if (t.querySelector('.intro-sala')) return 'trilha';
  return '?'; })(document.querySelector('#telas > .tela-missao'))`);
const PRINCIPAL = '.tela-missao footer.rodape-acao:not([hidden]) .btn-principal';
// da tela aberta até o fim da sala (ou até `op.ate`: 'fimEtapa', 'festa'; ou o desafio `op.antesDe`, sem responder):
// "Começar" na trilha, "Continuar" nas cartas,
// aoDesafio(id) em cada desafio (responde e continua), "Próxima etapa" no fim de etapa e o botão da festa da trilha.
// Devolve { fim, etapas (fins de etapa vistos), festa, cartas: ["Carta 1 de 2"…], desafios: ["Desafio 1 de 4"…] }
async function seguirSala(c, aoDesafio, op = {}) {
  const modo = op.modo || 'dom', r = { etapas: 0, festa: false, cartas: [], desafios: [] };
  let ultimo = null;
  for (let k = 0; k < 400; k++) {
    const q = await telaDaMissao(c);
    if (q === op.ate || q === 'fimSala' || q === 'fechada') return Object.assign(r, { fim: q });
    if (q === 'trilha' || q === 'carta') {
      if (q === 'carta') r.cartas.push(await c.js("document.querySelector('.tela-missao .resumo-pag').textContent"));
      await acionar(c, c.page.locator(PRINCIPAL), modo);
    } else if (q === 'desafio') {
      const id = await c.js('window.__q.atual.d.id');
      if (id === op.antesDe) return Object.assign(r, { fim: 'desafio' });
      if (id === ultimo) return Object.assign(r, { fim: 'parou em ' + id });
      ultimo = id;
      r.desafios.push(await c.js("document.querySelector('.tela-missao .desafio-num').textContent"));
      await aoDesafio(id);
    } else if (q === 'fimEtapa') {
      r.etapas++;
      ultimo = null;
      await acionar(c, c.page.locator(PRINCIPAL), modo);   // "Próxima etapa ▶"
    } else if (q === 'festa') {
      r.festa = true;
      await acionar(c, c.page.locator('.tela-missao .festa-trilha > .btn-principal'), modo);
    } else return Object.assign(r, { fim: q });
    await c.avancar(100);
  }
  return Object.assign(r, { fim: 'sem fim' });
}

module.exports = { DESAFIO, RETORNO, preparar, respostas, acionar, levarA, conferir, botaoDoRetorno, responderDaVez, esperar, tocarTile, andarAte,
  estacao, irAEstacao, telaDaMissao, seguirSala, PRINCIPAL };
