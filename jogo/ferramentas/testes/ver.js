// `npm run ver`: abre o jogo numa cena (servidor de TESTE novo, save SINTÉTICO) e fotografa nos tamanhos pedidos.
// Saída em /tmp/reino-testes/ver/ (ou $REINO_TESTES/ver/)<nome ou data>/: <tamanho>.png (e -recorte/-xN), erros.txt, estado.json, console.txt.
// Sai com código ≠ 0 se houve erro de console/página. Exemplos: node jogo/ferramentas/testes/ver.js --ajuda
const fs = require('fs');
const path = require('path');
const { abrirCenario, tratarFoto, PASTA_VER } = require('./cenario');
const { abrir, lancar, TAMANHOS } = require('./navegador');

const AJUDA = `Uso: node jogo/ferramentas/testes/ver.js [opções]   (npm run ver -- [opções])
  --save completo|avancado|ovos|inicio|<arquivo .js/.json sintético>   (padrão: completo)
  --mudar '<json>'          mescla profunda no save        --estrelas 500     saldo de estrelas
  --cuidados fome=10,sede=5,banho=30 (na montaria)         --materias historia,ingles (todas as salas feitas)
  --ajustes '<json>'        ex.: '{"som":true}'
  --ir <lugar>              mapa | petshop | museu | materia:historia | escola …
  --tela <nome>             loja | estabulo | bau | ajustes | pais | lugares | petshop | album | castelo | plano
                            | aparencia | escola | foguete | voo | album-ets | materia:<id> | livro:<id> | sala:<id> | prova:<id> | treino:<id>
                            | desafio:<id do desafio> (ex.: desafio:h1-03: esse desafio, sem o sorteio da sala)
                            | foto (a prévia da foto) | album:<n> (tira n fotos e abre a n-ésima grande)
                            | prova:<id>:<n> (a questão n, como as imagens prova-<id>-qNN do e2e)
  --js '<código>'           roda na página (repetível, na ordem); o valor devolvido e o console.log dele
                            saem no fim da saída (o console todo da página fica em console.txt)
  --passos 'tocar:<seletor ou texto>;esperar:<ms>;tecla:<k>;js:<código>'
            ;arrastar:x1,y1,x2,y2[,ms][,toque|mouse][,preso]   gesto de verdade (padrão: toque no celular/tablet,
                                                 mouse no notebook; preso = não solta, a foto sai com o thumbstick)
            ;segurar:<seletor|x,y>,ms                  dedo (ou mouse) parado ms milissegundos
            ;perguntas                                 na sala (--tela sala:<id>): toca "Começar" e passa o resumo
                                                 do livro até a 1ª pergunta (ver "Cuidados" abaixo)
  ordem: --ir (espera a cena trocar e a transição acabar), --tela, cada --js, --passos, foto
  --tamanhos celular,tablet,notebook   (padrão: os 3, em paralelo)
  --vivo                    jogo vivo (sem congelar; animações ligadas; entra direto no mapa, sem a senha)
  --nome <n>                pasta de saída (padrão: data e hora)
  --raiz <pasta jogo>       outra cópia do jogo (padrão: a desta worktree)
  --recorte x,y,w,h         em px CSS       --ampliar 4   (vizinho mais próximo)
  --previa interiores:petshop | acessorios:<id> | icones | sprites | mapa | direcoes   (abre por file://;
                            o mapa sai com a grade: números de coluna/linha, rect de cada lugar e áreas livres,
                            e as fachadas de js/interiores/<p>/fora.js; interiores:padrao-<matéria> = prédio padrão;
                            em interiores:<id> o --recorte conta do canto do desenho do interior, 48 px por tile)
  --livres 5x4              lista os rects livres de 5×4 tiles no mapa, com o caminho sugerido até a rua
                            (sem navegador; o mesmo que node jogo/ferramentas/validar/lugares-do-mapa.js --livres 5x4)
Exemplos:
  npm run ver -- --tamanhos celular
  npm run ver -- --ir petshop --nome petshop
  npm run ver -- --estrelas 500 --tela loja --tamanhos celular
  npm run ver -- --tela desafio:h1-03 --tamanhos celular
  npm run ver -- --tela sala:h1 --passos 'perguntas'      (a 1ª pergunta, passando a intro e o resumo)
  npm run ver -- --tamanhos celular --passos 'arrastar:100,600,160,600,500,preso'   (o thumbstick e a Mariana andando)
  npm run ver -- --tela album:2 --tamanhos celular      npm run ver -- --tela prova:historia-3bim:2
  npm run ver -- --cuidados fome=5,sede=5 --js 'Reino.UI.telaPetShop()'
  npm run ver -- --previa interiores:petshop --recorte 0,0,200,150 --ampliar 4
  npm run ver -- --tamanhos celular --js 'console.log(Mapa.lugares().length)' --js 'Reino.materias.length'
  npm run ver -- --vivo --tamanhos celular --ajustes '{"animacoes":true}'
Cuidados:
  1) --js depois de --ir: o --ir só acaba com a cena já trocada, então o --js vê o prédio:
       npm run ver -- --ir petshop --js '__reino.cena()'            (→ petshop)
     Para rodar algo DURANTE a entrada, não use --ir: entre pelo --js e siga nos --passos (a foto espera 600 ms):
       npm run ver -- --js 'void __reino.entrar("petshop")' --passos 'js:console.log(__reino.estado())'   (→ transicao)
  2) --tela sala:<id> numa matéria com livro: "Começar" abre o RESUMO (as cartas), não a 1ª pergunta; tocar só a
     intro fotografa o resumo. Para chegar à pergunta, use o passo pronto 'perguntas':
       npm run ver -- --tela sala:h1 --passos 'perguntas'                      (1ª pergunta da sala)
       npm run ver -- --tela sala:h1 --passos 'tocar:.intro-sala .btn-principal;esperar:600'   (a 1ª carta do resumo)`;

function lerArgs(argv) {
  const a = { js: [], tamanhos: Object.keys(TAMANHOS) };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = () => { const x = argv[++i]; if (x === undefined) throw new Error(`${k} precisa de um valor`); return x; };
    switch (k) {
      case '--ajuda': case '-h': case '--help': a.ajuda = true; break;
      case '--save': a.save = v(); break;
      case '--mudar': a.mudar = JSON.parse(v()); break;
      case '--ajustes': a.ajustes = JSON.parse(v()); break;
      case '--estrelas': a.estrelas = Number(v()); break;
      case '--cuidados': a.cuidados = Object.fromEntries(v().split(',').map((p) => { const [c, n] = p.split('='); return [c.trim(), Number(n)]; })); break;
      case '--materias': a.materiasCompletas = v().split(','); break;
      case '--ir': a.ir = v(); break;
      case '--tela': a.tela = v(); break;
      case '--js': a.js.push(v()); break;
      case '--passos': a.passos = v(); break;
      case '--tamanhos': a.tamanhos = v().split(','); break;
      case '--vivo': a.vivo = true; break;
      case '--nome': a.nome = v(); break;
      case '--raiz': a.raiz = v(); break;
      case '--recorte': a.recorte = v().split(',').map(Number); break;
      case '--ampliar': a.ampliar = Number(v()); break;
      case '--previa': a.previa = v(); break;
      case '--livres': a.livres = v(); break;
      default: throw new Error(`opção desconhecida: ${k} (veja --ajuda)`);
    }
  }
  a.tamanhos.forEach((t) => { if (!TAMANHOS[t]) throw new Error(`tamanho "${t}" não existe`); });
  if (a.recorte && (a.recorte.length !== 4 || a.recorte.some(isNaN))) throw new Error('--recorte é x,y,w,h');
  return a;
}

// marca o console do que roda (para mostrar no fim só o que veio dos --js/--passos) e guarda o valor devolvido
async function marcado(page, marca, fazer, valores) {
  page.__marca = marca;
  try {
    const v = await fazer();
    if (v !== undefined) valores.push(`${marca} → ${typeof v === 'string' ? v : JSON.stringify(v)}`);
  } finally { page.__marca = null; }
}
function textoConsole(page) { return page.__console.map((m) => `[${m.tipo}]${m.marca ? ` (${m.marca})` : ''} ${m.texto}`); }

// passo 'perguntas': na sala aberta (--tela sala:<id>), toca "Começar" e passa as cartas do resumo (sala com livro)
// até a 1ª pergunta; tocar só a intro para no resumo quando a matéria tem livro
async function passarIntro(c) {
  if (await c.js("!!document.querySelector('.intro-sala .btn-principal')")) await c.tocar('.intro-sala .btn-principal');
  for (let i = 0; i < 40 && await c.js("!!document.querySelector('.resumo-sala .btn-principal')"); i++) await c.tocar('.resumo-sala .btn-principal');
  if (await c.js("!!document.querySelector('.intro-sala, .resumo-sala')")) throw new Error('perguntas: a intro ou o resumo não passou');
  await c.avancar(600);
}

async function rodarPassos(c, texto) {
  for (const p of texto.split(';').map((s) => s.trim()).filter(Boolean)) {
    const [tipo, resto] = p.split(/:(.*)/s);
    if (tipo === 'tocar') await c.tocar(resto);
    else if (tipo === 'esperar') await c.avancar(Number(resto));
    else if (tipo === 'tecla') await c.tecla(resto);
    else if (tipo === 'js') await c.js(resto);
    else if (tipo === 'arrastar') await c.arrastar(resto);
    else if (tipo === 'segurar') await c.segurar(resto);
    else if (tipo === 'perguntas') await passarIntro(c);
    else throw new Error(`passo desconhecido: ${p}`);
  }
}

async function umTamanho(a, browser, tamanho, pasta) {
  const c = await abrirCenario({
    browser, tamanho, pasta, raiz: a.raiz, congelar: !a.vivo, entrarDireto: a.vivo, save: a.save, mudar: a.mudar,
    estrelas: a.estrelas, cuidados: a.cuidados, materiasCompletas: a.materiasCompletas, ajustes: a.ajustes,
  });
  const falhas = [], valores = [];
  try {
    if (a.ir) await c.ir(a.ir);
    if (a.tela) await c.tela(a.tela);
    for (let i = 0; i < a.js.length; i++) await marcado(c.page, `--js ${i + 1}`, () => c.js(a.js[i]), valores);
    if (a.passos) await marcado(c.page, '--passos', () => rodarPassos(c, a.passos), valores);
  } catch (e) { falhas.push('ver: ' + e.message); }
  const fotos = await c.foto(tamanho, { recorte: a.recorte, ampliar: a.ampliar });
  const estado = await c.estado();
  const erros = falhas.concat(c.erros);
  const consoleTxt = textoConsole(c.page);
  const saidaJs = c.page.__console.filter((m) => m.marca).map((m) => `[${m.tipo}] (${m.marca}) ${m.texto}`).concat(valores);
  await c.fechar();
  return { tamanho, fotos, estado, erros, console: consoleTxt, saidaJs };
}

// prévias por file:// (sem servidor): interiores:<id> vira interiores.html?i=<id>&e=3
async function umaPrevia(a, browser, tamanho, pasta) {
  const [nome, id] = a.previa.split(':');
  const raiz = path.resolve(a.raiz || path.join(__dirname, '..', '..'));
  const arq = path.join(raiz, 'ferramentas', 'previas', nome + '.html');
  if (!fs.existsSync(arq)) throw new Error(`prévia "${nome}" não existe em ${path.dirname(arq)}`);
  // o id vai no parâmetro que cada prévia lê (interiores: ?i=<id>&e=3; acessorios: ?id=<id>); o resto da prévia fica como ela abre
  const QUERY = { interiores: (x) => `?i=${x}&e=3`, acessorios: (x) => `?id=${x}` };
  // o mapa sai sempre com a grade (coordenadas, rects dos lugares, áreas livres)
  const url = 'file://' + arq + (id ? (QUERY[nome] || QUERY.interiores)(encodeURIComponent(id)) : (nome === 'mapa' ? '?grade=1' : ''));
  const { context, page } = await abrir({ browser, url, tamanho });
  await page.waitForLoadState('load');
  // as prévias que desenham depois de carregar (interiores: fontes e preparar()) avisam com window.__pronto
  await page.waitForFunction(() => window.__pronto !== false, null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);
  fs.mkdirSync(pasta, { recursive: true });
  const png = path.join(pasta, tamanho + '.png');
  await page.screenshot({ path: png, fullPage: true, animations: 'disabled' });
  // interiores:<id>: o --recorte conta a partir do canto do desenho do interior (não do título da página)
  const canto = nome === 'interiores' && id ? await page.evaluate(() => {
    const cv = document.querySelector('canvas[id^="interior-"]'), r = cv && cv.getBoundingClientRect();
    return r ? [r.left + scrollX, r.top + scrollY] : null;
  }) : null;
  const op = a.recorte && canto ? { ...a, recorte: [a.recorte[0] + canto[0], a.recorte[1] + canto[1], a.recorte[2], a.recorte[3]] } : a;
  const erros = page.__erros.slice();
  const consoleTxt = textoConsole(page);
  await context.close();
  return { tamanho, fotos: tratarFoto(png, op, TAMANHOS[tamanho].deviceScaleFactor), estado: { previa: a.previa }, erros, console: consoleTxt, saidaJs: [] };
}

async function main() {
  const a = lerArgs(process.argv.slice(2));
  if (a.ajuda) { console.log(AJUDA); return 0; }
  if (a.livres) { require('../validar/lugares-do-mapa').imprimirLivres(a.livres); return 0; }
  const nome = a.nome || new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const pasta = path.join(PASTA_VER, nome);
  fs.mkdirSync(pasta, { recursive: true });
  const t0 = Date.now();
  const browser = await lancar();
  let res;
  try {
    const fazer = a.previa ? umaPrevia : umTamanho;
    res = await Promise.all(a.tamanhos.map((t) => fazer(a, browser, t, pasta).catch((e) => ({ tamanho: t, fotos: [], estado: {}, erros: ['ver: ' + e.message], console: [] }))));
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(pasta, 'erros.txt'), res.map((r) => `## ${r.tamanho}\n${r.erros.join('\n') || '(nenhum)'}\n`).join('\n'));
  fs.writeFileSync(path.join(pasta, 'estado.json'), JSON.stringify(Object.fromEntries(res.map((r) => [r.tamanho, r.estado])), null, 1) + '\n');
  fs.writeFileSync(path.join(pasta, 'console.txt'), res.map((r) => `## ${r.tamanho}\n${(r.console || []).join('\n') || '(nada)'}\n`).join('\n'));
  res.forEach((r) => r.fotos.forEach((f) => console.log(f)));
  res.forEach((r) => console.log(`${r.erros.length ? '✘' : '✔'} ${r.tamanho}: cena ${r.estado.cena || r.estado.previa || '?'}, estado ${r.estado.estado || '-'}, ${r.erros.length} erro(s)`));
  const nErros = res.reduce((n, r) => n + r.erros.length, 0);
  res.filter((r) => r.saidaJs && r.saidaJs.length).forEach((r) => { console.log(`saída dos --js/--passos (${r.tamanho}):`); r.saidaJs.forEach((l) => console.log('  ' + l)); });
  console.log(`${pasta} (erros.txt, estado.json, console.txt) em ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (nErros) res.forEach((r) => r.erros.forEach((e) => console.error(`  ${r.tamanho}: ${e}`)));
  return nErros ? 1 : 0;
}

if (require.main === module) {
  main().then((c) => process.exit(c), (e) => { console.error('✘ ' + e.message); process.exit(2); });
}

module.exports = { lerArgs };
