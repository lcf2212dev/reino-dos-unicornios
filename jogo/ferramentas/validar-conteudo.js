// Confere o conteúdo das matérias antes de publicar.
// Uso: node ferramentas/validar-conteudo.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
const ctx = { window: {}, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(raiz, 'js/config.js'), 'utf8'), ctx);
const pastaMaterias = path.join(raiz, 'js/materias');
fs.readdirSync(pastaMaterias).filter((f) => f.endsWith('.js')).forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(pastaMaterias, f), 'utf8'), ctx, { filename: f });
});

const Reino = ctx.Reino;
const erros = [];
const avisos = [];
const ids = new Set();
const TIPOS = ['escolha', 'vf', 'varias', 'ligar', 'ordenar', 'frase', 'separar', 'memoria'];

function checar(cond, msg) { if (!cond) erros.push(msg); }

Reino.materias.forEach((m) => {
  const livro = new Set((m.livro || []).map((l) => l.id));
  checar(m.salas && m.salas.length > 0, `${m.id}: sem salas`);
  const valorSala = Reino.config.valorPorMateria / m.salas.length;
  const soma = Math.round(valorSala * m.salas.length * 100) / 100;
  checar(soma === Reino.config.valorPorMateria, `${m.id}: salas somam R$${soma}, esperado R$${Reino.config.valorPorMateria}`);
  if (Math.round(valorSala * 100) !== valorSala * 100) avisos.push(`${m.id}: valor por sala tem mais de 2 casas (${valorSala})`);

  m.salas.forEach((s) => {
    checar(s.desafios.length >= Reino.config.desafiosPorSala, `${s.id}: só ${s.desafios.length} desafios (mínimo ${Reino.config.desafiosPorSala})`);
    s.desafios.forEach((d) => {
      checar(!ids.has(d.id), `ID repetido: ${d.id}`);
      ids.add(d.id);
      checar(TIPOS.includes(d.tipo), `${d.id}: tipo desconhecido ${d.tipo}`);
      checar(typeof d.explica === 'string' && d.explica.length > 10, `${d.id}: sem explicação`);
      checar(livro.has(d.livro), `${d.id}: cartão do livro "${d.livro}" não existe`);
      if (d.tipo === 'escolha') {
        checar(Array.isArray(d.opcoes) && d.opcoes.length >= 2, `${d.id}: poucas opções`);
        checar(Number.isInteger(d.certa) && d.certa >= 0 && d.certa < d.opcoes.length, `${d.id}: índice certo inválido`);
        const textos = d.opcoes.map((o) => o.t);
        checar(new Set(textos).size === textos.length, `${d.id}: opções repetidas`);
      }
      if (d.tipo === 'vf') checar(typeof d.certo === 'boolean' && d.afirmacao, `${d.id}: V/F incompleto`);
      if (d.tipo === 'varias') {
        const ok = d.opcoes.filter((o) => o.ok).length;
        checar(ok >= 1, `${d.id}: nenhuma opção certa`);
        if (ok === d.opcoes.length) avisos.push(`${d.id}: todas as opções são certas`);
      }
      if (d.tipo === 'ligar') checar(d.pares.length >= 2 && d.pares.every((p) => p[0].t && p[1].t), `${d.id}: pares inválidos`);
      if (d.tipo === 'ordenar') checar(d.itens.length >= 3, `${d.id}: poucos itens para ordenar`);
      if (d.tipo === 'frase') checar(d.blocos.length >= 3, `${d.id}: poucos blocos`);
      if (d.tipo === 'separar') checar(d.itens.every((i) => i.g === 0 || i.g === 1) && d.grupos.length === 2, `${d.id}: separar inválido`);
      if (d.tipo === 'memoria') checar(d.pares.length >= 3, `${d.id}: memória com poucos pares`);
    });
    const unis = m.unicornios || [];
    checar(unis.filter((u) => u.raridade === 'comum' && u.sala === s.id).length === 1, `${s.id}: precisa de 1 unicórnio comum`);
    checar(unis.filter((u) => u.raridade === 'raro' && u.sala === s.id).length === 1, `${s.id}: precisa de 1 unicórnio raro`);
  });
  const unis = m.unicornios || [];
  checar(unis.filter((u) => u.raridade === 'lendario').length === 1, `${m.id}: precisa de exatamente 1 lendário`);
  checar(unis.some((u) => u.raridade === 'epico' && u.treino === 'ouro'), `${m.id}: falta épico do ouro`);
  checar(unis.some((u) => u.raridade === 'epico' && u.treino === 'perfeito'), `${m.id}: falta épico do treino perfeito`);
  unis.forEach((u) => {
    checar(!ids.has(u.id), `ID repetido: ${u.id}`);
    ids.add(u.id);
    checar(u.cores && u.cores.corpo && Array.isArray(u.cores.crina), `${u.id}: cores incompletas`);
    checar(u.frase, `${u.id}: sem frase`);
  });
  const treinaveis = m.salas.flatMap((s) => s.desafios).filter((d) => ['escolha', 'vf', 'varias'].includes(d.tipo)).length;
  checar(treinaveis >= Reino.config.perguntasTreino, `${m.id}: só ${treinaveis} perguntas para o treino`);
  console.log(`✔ ${m.nome}: ${m.salas.length} salas, ${m.salas.reduce((t, s) => t + s.desafios.length, 0)} desafios, ${treinaveis} para o treino, ${(m.livro || []).length} cartões no livro, ${unis.length} unicórnios, R$${valorSala.toFixed(2)} por sala`);
});

// emoji de matéria sem desenho em js/icones.js aparece como emoji reduzido (feio): desenhar antes de publicar
{
  const ic = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(raiz, 'js/icones.js'), 'utf8'), ic);
  const RE = /(\p{RI}\p{RI}|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*)/gu;
  const semDesenho = new Set();
  fs.readdirSync(pastaMaterias).filter((f) => f.endsWith('.js')).forEach((f) => {
    for (const m of fs.readFileSync(path.join(pastaMaterias, f), 'utf8').matchAll(RE)) {
      const k = m[0].replace(/\uFE0F/g, '');
      if (!ic.window.ICONES[k]) semDesenho.add(k);
    }
  });
  if (semDesenho.size) avisos.push(`emojis sem pixel art em js/icones.js: ${[...semDesenho].join(' ')}`);
}
avisos.forEach((a) => console.log('⚠ ' + a));
if (erros.length) {
  erros.forEach((e) => console.log('✘ ' + e));
  process.exit(1);
}
console.log('Tudo certo!');
