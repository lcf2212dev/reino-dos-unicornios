// Fixture histórica explícita: exercita o motor pedagógico com o conteúdo preservado do 3º bimestre.
// Nunca é carregada pelo jogo publicado nem altera jogo-no-node para os demais testes.
const fs = require('fs');
const path = require('path');
const Jogo = require('../../../jogo-no-node');
const raiz = path.resolve(Jogo.raiz, '../arquivo/terceiro-bimestre/jogo');
const historico = (s) => ['materias', 'provas'].includes(s.grupo) && !s.js.endsWith('/registro.js');
// o que o 3º bimestre tinha (manifesto de conteúdo do arquivo): matéria ou prova de bimestre seguinte fica de fora
const DO_TERCEIRO = new Set(JSON.parse(fs.readFileSync(path.resolve(raiz, '../manifesto-conteudo.json'), 'utf8')).map((s) => s.js));
const deOutroBimestre = (s) => historico(s) && !DO_TERCEIRO.has(s.js);
function carregar(ctx, lista, opcoes = {}) {
  const trocar = Object.assign({}, opcoes.trocar);
  lista = lista.filter((s) => !deOutroBimestre(s));
  lista.filter((s) => historico(s) || fs.existsSync(path.join(raiz, s.js))).forEach((s) => {
    const arq = path.join(raiz, s.js);
    if (!fs.existsSync(arq)) throw new Error('Fixture do terceiro bimestre ausente: ' + arq);
    if (!trocar[Jogo.nome(s)]) trocar[Jogo.nome(s)] = arq;
  });
  Jogo.carregar(ctx, lista, Object.assign({}, opcoes, { trocar }));
  if (ctx.Reino && ctx.Reino.Bimestres) ctx.Reino.Bimestres.emEspera = () => false;
  return ctx;
}
function arquivo(nome) {
  const s = Jogo.manifesto.scripts.find((s) => Jogo.nome(s) === nome);
  return s && historico(s) ? path.join(raiz, s.js) : Jogo.arquivo(nome);
}
// Após abrir um cenário isolado, repõe somente os dados históricos e libera o motor naquele contexto.
async function noNavegador(page) {
  // Pacotes aposentados são servidos apenas nesta página isolada; produção continua sem eles.
  await page.route('**/js/voz/*.js', async (route) => {
    const nome = path.basename(new URL(route.request().url()).pathname);
    const arq = path.join(raiz, 'js/voz', nome);
    if (fs.existsSync(arq)) await route.fulfill({ path: arq, contentType: 'application/javascript' });
    else await route.continue();
  });
  const ctx = Jogo.contexto({ console });
  carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros'], grupos: ['materias', 'provas'] }));
  const dados = JSON.parse(JSON.stringify({ materias: ctx.Reino.materias, provas: ctx.Reino.provas }));
  await page.evaluate(({ materias, provas }) => {
    // as do 3º bimestre voltam com o conteúdo; as de bimestre seguinte (ex.: portugues4) ficam como estão
    const historicas = new Set(materias.map((m) => m.id)), provasHist = new Set(provas.map((p) => p.id));
    Reino.materias.splice(0, Reino.materias.length, ...materias, ...Reino.materias.filter((m) => !historicas.has(m.id)));
    Reino.provas.splice(0, Reino.provas.length, ...provas, ...Reino.provas.filter((p) => !provasHist.has(p.id)));
    Reino.Bimestres.emEspera = () => false;
  }, dados);
}
async function abrirCenario(opcoes) {
  const c = await require('../../cenario').abrirCenario(opcoes);
  try { await noNavegador(c.page); return c; }
  catch (erro) { await c.fechar(); throw erro; }
}
// Cópias temporárias de testes do gerador recebem dados históricos para criar novas questões.
function copiarPara(destino) {
  if (!path.resolve(destino).startsWith('/tmp/') && !path.resolve(destino).startsWith('/dev/shm/')) throw new Error('Fixture só em cópia temporária');
  fs.cpSync(path.join(raiz, 'js/conteudo'), path.join(destino, 'js/conteudo'), { recursive: true });
  fs.cpSync(path.join(raiz, 'js/voz'), path.join(destino, 'js/voz'), { recursive: true });
}
module.exports = Object.assign({}, Jogo, { carregar, arquivo, noNavegador, copiarPara, abrirCenario });
