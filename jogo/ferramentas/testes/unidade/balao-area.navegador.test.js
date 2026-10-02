// Balão do Claude e a área útil (D10-B03, D5-01, D5-02, D5-10, D5-11): --balao-altura no :root (0 fechado), o balão
// no pé com uma tela aberta, as páginas do celular (≤ 4 linhas, "Continuar →", a fila da festa do ovo intacta).
// Servidor e banco de TESTE novos por cenário (cenario.js); saves 100% sintéticos.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const ALTURA = "parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--balao-altura')) || 0";
const LINHAS = "(function(){var t=document.querySelector('.claude-texto');return Math.round(t.getBoundingClientRect().height/parseFloat(getComputedStyle(t).lineHeight));})()";
const CONTINUAR = "(function(){var b=[...document.querySelectorAll('.claude-acoes button')].find(function(x){return /Continuar/.test(x.textContent)});if(b)b.click();return !!b;})()";

test('--balao-altura acompanha o balão sem menu inferior', async () => {
  const c = await abrirCenario({ tamanho: 'celular' });
  try {
    assert.strictEqual(await c.js(ALTURA), 0);
    await c.js("void Reino.Claude.falar('Oi! Que bom te ver!')");
    await c.avancar(300);
    const alt = await c.js(ALTURA);
    const topo = await c.js("innerHeight - Math.min(document.querySelector('#claude-balao').getBoundingClientRect().top, document.querySelector('.claude-nome').getBoundingClientRect().top)");
    assert.ok(Math.abs(alt - topo) <= 1, `--balao-altura ${alt} x ${topo}`);
    assert.ok(await c.js("(function(){var a=document.querySelector('#claude-balao').getBoundingClientRect();return a.bottom+4<=innerHeight;})()"), 'o balão ultrapassa o pé da tela');
    assert.strictEqual(await c.js("document.querySelector('.claude-nome').getBoundingClientRect().height <= 26"), true, 'o nome quebrou de linha');
    await c.js('Reino.Claude.fechar()');
    await c.avancar(100);
    assert.strictEqual(await c.js(ALTURA), 0, 'fechado, a altura volta a 0');
  } finally { await c.fechar(); }
});

test('fala longa do Claude no celular: páginas de até 4 linhas, a voz uma vez só', async () => {
  const c = await abrirCenario({ tamanho: 'celular' });
  try {
    await c.js("window.__falas=0; var f=Reino.Som.falar; Reino.Som.falar=function(){window.__falas++; return f.apply(this, arguments);}");
    await c.js("window.__fim=null; Reino.Claude.falar('Antes de começar a prova, respira fundo três vezes. O cérebro fica tranquilo e lembra melhor.').then(function(v){window.__fim=v||'fechou';}); 0");
    await c.avancar(300);
    let paginas = 1;
    assert.ok((await c.js(LINHAS)) <= 4);
    while (await c.js(CONTINUAR)) { await c.avancar(200); paginas++; assert.ok((await c.js(LINHAS)) <= 4, `página ${paginas} com mais de 4 linhas`); }
    assert.ok(paginas >= 2, 'a fala longa não paginou');
    assert.strictEqual(await c.js('Reino.Claude.aberto()'), true, 'o "Continuar →" fechou o balão');
    assert.strictEqual(await c.js('window.__fim'), null);
    assert.strictEqual(await c.js('window.__falas'), 1, 'a voz tocou mais de uma vez');
    await c.js("document.querySelector('.btn-ok-claude').click()");
    await c.avancar(300);
    assert.strictEqual(await c.js('window.__fim'), 'ok');
  } finally { await c.fechar(); }
});

test('com uma tela aberta o balão vai para o pé e a tela encolhe', async () => {
  const c = await abrirCenario({ tamanho: 'notebook' });
  try {
    await c.js("Reino.UI.abrirTela('prova'); 0");
    await c.avancar(300);
    await c.js("void Reino.Claude.falar('Opa, foi rapidinho! Que tal ler a pergunta de novo, com calma?', {tipo:'pressa'})");
    await c.avancar(300);
    assert.strictEqual(await c.js("document.body.classList.contains('balao-no-pe')"), true);
    const r = await c.js("(function(){var t=[...document.querySelectorAll('#telas .tela')].pop(),s=getComputedStyle(t);return {pad:parseFloat(s.paddingBottom),alt:" + ALTURA + "};})()");
    assert.ok(r.pad >= r.alt, `a tela não encolheu (${r.pad} < ${r.alt})`);
    await c.js('Reino.Claude.fechar()');
    await c.avancar(100);
    assert.strictEqual(await c.js("document.body.classList.contains('balao-no-pe')"), false);
  } finally { await c.fechar(); }
});

test('Letras grandes no celular: páginas por linhas reais, sem pedaço solto', async () => {
  const c = await abrirCenario({ tamanho: 'celular', ajustes: { texto: 1.15 } });
  try {
    await c.js("void Reino.Claude.falar('Muito bem! Agora você não esquece mais essa!')");
    await c.avancar(300);
    assert.strictEqual(await c.js(CONTINUAR), false, 'a fala curta paginou');
    await c.js('Reino.Claude.fechar()');
    await c.avancar(100);
    await c.js("void Reino.Claude.falar(" + JSON.stringify("Chegou a parte mais importante: REVISAR! É aqui que as campeãs encontram os errinhos. Toque em cada questão com calma.") + ")");
    await c.avancar(300);
    const tam = [await c.js("document.querySelector('.claude-texto').textContent.length")];
    while (await c.js(CONTINUAR)) { await c.avancar(200); assert.ok((await c.js(LINHAS)) <= 4); tam.push(await c.js("document.querySelector('.claude-texto').textContent.length")); }
    assert.ok(tam.length >= 2 && Math.min(...tam) >= 0.4 * Math.max(...tam), 'pedaço solto: ' + tam.join('/'));
  } finally { await c.fechar(); }
});

// D5-05: conversa com NPC num interior, página por página: a Mariana e o NPC inteiros fora do balão e da aba do nome
const CONVERSAS = [['museu', 'memoria'], ['escola', 'helena'], ['petshop', null], ['estabulo', null]];
const SOBRA = "(function(){var V=Reino._motor,J=Jogador,c=Reino.Cena.atual(),k=V.escala/V.dpr,n=window.__npc;"
  + "var m=J.montado&&J.montado(),w=m?28:16,h=m?34:24;function cx(x,y){return{x:(x-V.cam.x)*k,y:(y-V.cam.y)*k};}"
  + "var cx1=[cx(J.x-w/2,J.y-h),cx(J.x+w/2,J.y)],cx2=[cx(n.x*16,n.y*16-12),cx(n.x*16+16,n.y*16+16)];"
  + "var b=document.querySelector('#claude-balao').getBoundingClientRect(),a=document.querySelector('.claude-nome').getBoundingClientRect();"
  + "function fora(s,r){return s[1].y<=r.top||s[0].y>=r.bottom||s[1].x<=r.left||s[0].x>=r.right;}"
  + "return {ok:fora(cx1,b)&&fora(cx1,a)&&fora(cx2,b)&&fora(cx2,a),mari:Math.round(cx1[1].y),npc:Math.round(cx2[1].y),topo:Math.round(Math.min(b.top,a.top))};})()";
for (const tamanho of ['celular', 'tablet', 'notebook']) {
  test('D5-05 no ' + tamanho + ': a Mariana e o NPC ficam acima do balão da conversa', async () => {
    const c = await abrirCenario({ tamanho });
    try {
      for (const [lugar, id] of CONVERSAS) {
        await c.ir(lugar);
        await c.js("(function(id){var cena=Reino.Cena.atual(),l=cena.npcs(),n=id?l.find(function(x){return x.id===id;}):l[0];window.__npc=n;"
          + "var alvo=cena.alvoEm(n.x*16+8,n.y*16+4);if(alvo&&alvo.tipo==='npc'&&alvo.npc===n){Jogador.posicionar(alvo.tile.x,alvo.tile.y);Jogador.virar(alvo.olhar.x,alvo.olhar.y);}"
          + "void Reino.NPCs.interagir(n,{interior:Reino.Interiores.def(cena.id||" + JSON.stringify(lugar) + "),cena:cena});})(" + JSON.stringify(id) + ")");
        await c.avancar(800);
        let pg = 1;
        for (;;) {
          const s = await c.js(SOBRA);
          console.log('D5-05', tamanho, lugar, 'página', pg, JSON.stringify(s));
          assert.ok(s.ok, `${lugar} página ${pg} no ${tamanho}: sprite embaixo do balão ${JSON.stringify(s)}`);
          if (!(await c.js(CONTINUAR))) break;
          await c.avancar(400); pg++;
        }
        if (process.env.REINO_FOTOS_D5) await c.foto(`d5-05-${tamanho}-${lugar}`);
        await c.js('Reino.Claude.fechar()'); await c.avancar(200);
        await c.ir('mapa');
      }
    } finally { await c.fechar(); }
  });
}
