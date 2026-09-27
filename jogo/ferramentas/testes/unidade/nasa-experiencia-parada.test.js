// Observatório, 2º andar (NASA): com as Animações desligadas a experiência fica parada ("sem elas, fica
// parado", nasa-experiencias.js). Mas o toque deixava a experiência "ativa" para sempre (o início só é marcado
// num quadro com t ≠ 0): quando a criança ligava as Animações depois e voltava ao andar, o foguete decolava sozinho.
// E o contrário: com as Animações ligadas, o motor também desenha com t = 0 (o retrato do balão, a máscara de
// toque); esses quadros não podem cancelar a experiência que está rodando.
const test = require('node:test');
const assert = require('node:assert');
const { montar, ctxAnotador } = require('./ajudantes/predios');

// o jogo num vm, com as Animações (ajustes.animacoes) ligadas ou não, e o foguete da NASA
function preparar(animacoes) {
  const { R } = montar();
  R.Claude = { falar: () => Promise.resolve('tchau') };   // o balão: ela lê e diz tchau
  const ajustes = { animacoes };
  R.Progresso = Object.assign(R.Progresso || {}, { estado: () => ({ ajustes }) });
  const lib = R.Interiores.OBJETOS['nasa-foguete'];
  const o = R.Interiores.def('observatorio-2').objetos.find((x) => x.tipo === 'nasa-foguete');
  const quadro = (t) => { const c = ctxAnotador(); lib.anim(c, o.x * 16, o.y * 16, t, o); return JSON.stringify(c.rets); };
  const tocar = () => R.NPCs.executar({ tipo: 'nasa-experiencia', exp: 'foguete' }, { interior: R.Interiores.def('observatorio-2'), objeto: o });
  return { ajustes, quadro, tocar };
}

test('NASA: tocar no foguete sem Animações não deixa a decolagem guardada para depois', async () => {
  const { ajustes, quadro, tocar } = preparar(false);
  const parado = quadro(5000);            // ninguém tocou: foguete na plataforma
  // Animações desligadas: o motor chama anim com t = 0 em todo quadro (motor/interiores-cena.js)
  await tocar();
  for (let i = 0; i < 30; i++) quadro(0);
  assert.strictEqual(quadro(0), parado, 'sem animação o foguete fica parado');
  // muito depois ela liga as Animações (Ajustes) e volta: quadros com o t do relógio
  ajustes.animacoes = true;
  quadro(900000);
  assert.strictEqual(quadro(901000), parado, 'o foguete decolou sozinho, sem ninguém tocar');
});

test('NASA: com Animações, um quadro com t = 0 (retrato do balão) não cancela a decolagem em andamento', async () => {
  const { quadro, tocar } = preparar(true);
  const parado = quadro(5000);
  await tocar();
  quadro(10000);                          // 1º quadro depois do toque: marca o início
  quadro(0);                              // o retrato do balão / a máscara de toque
  assert.notStrictEqual(quadro(11000), parado, 'o foguete continua decolando');
});
