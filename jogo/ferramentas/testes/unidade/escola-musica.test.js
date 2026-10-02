// Notas musicais: afinação, silêncio do ajuste e liberação dos nós ao sair da aula.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function som(somLigado = true) {
  const eventos = [], nos = [];
  const param = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {}, setTargetAtTime() {} });
  const ac = { currentTime: 10, destination: {},
    createOscillator() { const n = { frequency: {}, connect() {}, disconnect() { eventos.push('osc-desconectado'); }, start() {}, stop(t) { eventos.push(['stop', t]); } }; nos.push(n); return n; },
    createGain() { return { gain: param(), connect() {}, disconnect() { eventos.push('ganho-desconectado'); } }; },
  };
  const Reino = { Som: { contexto: () => ac }, Progresso: { estado: () => ({ ajustes: { som: somLigado } }) } };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../../../js/sistemas/som-escola.js'), 'utf8'), { Reino });
  return { S: Reino.Som, eventos, nos };
}
test('Escola de Música: Lá 4 é 440 Hz, Dó 5 fica uma oitava acima do Dó 4', () => {
  const { S, nos } = som();
  [69, 60, 72].forEach(n => S.notaMusical(n));
  assert.equal(nos[0].frequency.value, 440);
  assert.ok(Math.abs(nos[2].frequency.value / nos[1].frequency.value - 2) < 1e-12);
});
test('Escola de Música: ajuste Som desligado e notas inválidas não criam áudio', () => {
  const mudo = som(false), ligado = som();
  mudo.S.notaMusical(60)();
  [NaN, Infinity, undefined, -1, 200].forEach(n => ligado.S.notaMusical(n)());
  assert.equal(mudo.nos.length, 0);
  assert.equal(ligado.nos.length, 0);
});
test('Escola de Música: fechar interrompe uma única vez e desconecta os nós', () => {
  const { S, nos, eventos } = som();
  const parar = S.notaMusical(60, { duracao: 2 });
  parar(); parar();
  assert.equal(eventos.filter(e => Array.isArray(e)).length, 2, 'um stop natural e um de interrupção');
  nos[0].onended();
  assert.ok(eventos.includes('osc-desconectado'));
  assert.ok(eventos.includes('ganho-desconectado'));
});
