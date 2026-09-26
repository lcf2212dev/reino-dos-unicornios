// Telas do cenário que pedem mais que uma chamada (cenario.js / npm run ver -- --tela ...):
//   foto            tira uma foto e para na prévia (.tela-fotos-previa)
//   album:<n>       tira e guarda n fotos, abre o álbum e toca a n-ésima miniatura (.tela-fotos-ver)
//   prova:<id>:<n>  a questão n da prova, a mesma tela das imagens prova-<id>-qNN do e2e
const { mostrarDesafio } = require('./referencias-cenas');

// relógio congelado: anda aos poucos até a condição valer (o IndexedDB responde fora do relógio)
async function espera(c, js) {
  for (let i = 0; i < 100; i++) {
    if (await c.js(js)) return;
    await c.avancar(100);
    await c.page.waitForTimeout(20);
  }
  throw new Error('não aconteceu: ' + js);
}

async function tirarFoto(c) {
  await c.js('void Reino.Fotos.tirar()');   // (sem esperar: a promessa só acaba quando a prévia fecha)
  await espera(c, "!!document.querySelector('.tela-fotos-previa .fotos-guardar')");
}

async function album(c, n) {
  const antes = await c.js('Reino.Fotos.depurar().quantidade');
  for (let i = 1; i <= n; i++) {
    await tirarFoto(c);
    await c.tocar('.fotos-guardar');
    await espera(c, `!document.querySelector(".tela-fotos-previa") && Reino.Fotos.depurar().quantidade === ${antes + i}`);
    await c.avancar(400);
  }
  await c.js('void Reino.Fotos.abrirAlbum()');
  await espera(c, `document.querySelectorAll('.fotos-mini').length >= ${n}`);
  await c.js(`document.querySelectorAll('.fotos-mini')[${n - 1}].click()`);
  await espera(c, "!!document.querySelector('.tela-fotos-ver')");
  await c.avancar(400);
}

async function questaoDaProva(c, id, n) {
  const total = await c.js(`(function () { var p = Reino.prova(${JSON.stringify(id)}); return p ? p.questoes.length : -1; })()`);
  if (total < 0) throw new Error(`prova "${id}" não existe`);
  if (!(n >= 1 && n <= total)) throw new Error(`a prova "${id}" tem questões de 1 a ${total} (veio ${n})`);
  await mostrarDesafio(c.page, 'prova', { prova: id, i: n - 1 });
  await c.avancar(600);
}

// devolve true se a tela é uma destas (senão o cenário segue com as telas simples)
async function telaEspecial(c, nome) {
  const p = nome.split(':');
  if (nome === 'foto') { await tirarFoto(c); await c.avancar(400); return true; }
  if (p[0] === 'album' && p.length === 2) {
    const n = Number(p[1]);
    if (!(n >= 1)) throw new Error(`album:<n> com n ≥ 1 (veio "${p[1]}")`);
    await album(c, n);
    return true;
  }
  if (p[0] === 'prova' && p.length === 3) { await questaoDaProva(c, p[1], Number(p[2])); return true; }
  return false;
}

module.exports = { telaEspecial, espera };
