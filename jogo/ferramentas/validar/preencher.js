// O marcador `(preencher)` que `npm run novo` põe no que só a pessoa sabe escrever (enunciados, falas, cartas do
// livro, unicórnios). Os validadores recusam qualquer texto com ele: placeholder nunca chega à Mariana.
const MARCADOR = '(preencher)';

// "falta preencher: <onde>" para cada texto com o marcador dentro de `valor` (objetos e listas, em profundidade).
// Funções sem argumentos com nome em `chamar` (ex.: menu.info) são chamadas e o texto delas também conta.
function faltas(valor, onde, chamar = []) {
  const achados = [];
  const vistos = new Set();
  (function andar(v, o, fundo) {
    if (typeof v === 'string') { if (v.includes(MARCADOR)) achados.push(`falta preencher: ${o}`); return; }
    if (!v || typeof v !== 'object' || fundo > 10 || vistos.has(v)) return;
    vistos.add(v);
    if (Array.isArray(v)) { v.forEach((x, i) => andar(x, `${o}[${i}]`, fundo + 1)); return; }
    Object.keys(v).forEach((k) => {
      let x = v[k];
      if (typeof x === 'function' && chamar.includes(k)) { try { x = x(); } catch (e) { return; } }
      andar(x, `${o}.${k}`, fundo + 1);
    });
  })(valor, onde, 0);
  return achados;
}

module.exports = { MARCADOR, faltas };
