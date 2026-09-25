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
// --materia <arquivo>: usa esse arquivo no lugar do js/materias/ de mesmo nome (ex.: a matéria montada à parte)
const iMateria = process.argv.indexOf('--materia');
const materiaFora = iMateria >= 0 ? path.resolve(process.argv[iMateria + 1]) : null;
fs.readdirSync(pastaMaterias).filter((f) => f.endsWith('.js')).forEach((f) => {
  if (materiaFora && path.basename(materiaFora) === f) return;
  vm.runInContext(fs.readFileSync(path.join(pastaMaterias, f), 'utf8'), ctx, { filename: f });
});
if (materiaFora) vm.runInContext(fs.readFileSync(materiaFora, 'utf8'), ctx, { filename: materiaFora });

const pastaProvas = path.join(raiz, 'js/provas');
fs.readdirSync(pastaProvas).filter((f) => f.endsWith('.js')).forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(pastaProvas, f), 'utf8'), ctx, { filename: f });
});

const Reino = ctx.Reino;
const erros = [];
const avisos = [];
const ids = new Set();
const TIPOS = ['escolha', 'vf', 'varias', 'ligar', 'ordenar', 'frase', 'separar', 'memoria', 'vfLista', 'completar', 'desenho', 'copiar'];
const REQUISITOS = ['linhas', 'formas', 'cores'];

function checar(cond, msg) { if (!cond) erros.push(msg); }
// Ligar no celular: as duas colunas lado a lado só cabem em 390 px se a palavra mais comprida da esquerda
// mais a da direita somarem até 24 letras (fonte pixel com 1em por letra; ver css/jogo.css, .ligar-item)
function maiorPalavra(t) { return Math.max(0, ...String(t || '').replace(/[«»]/g, '').split(/[\s\-]+/).map((w) => [...w.replace(/[^\p{L}\p{N}]/gu, '')].length)); }
function checarLigarLargura(d) {
  const esq = Math.max(0, ...d.pares.map((p) => (p[0].img ? 0 : maiorPalavra(p[0].t))));
  const dir = Math.max(0, ...d.pares.map((p) => maiorPalavra(p[1].t)));
  if (esq + dir > 24) avisos.push(`${d.id}: Ligar com palavras longas (${esq} + ${dir} letras > 24): no celular vai quebrar palavra ou vazar`);
}

// trechos em inglês: «...» balanceado e sem aninhar, em qualquer texto
function checarIngles(obj, onde) {
  if (typeof obj === 'string') {
    let aberto = false;
    for (const ch of obj) {
      if (ch === '«') { if (aberto) { erros.push(`${onde}: «» aninhado em "${obj}"`); return; } aberto = true; }
      else if (ch === '»') { if (!aberto) { erros.push(`${onde}: » sem « em "${obj}"`); return; } aberto = false; }
    }
    if (aberto) erros.push(`${onde}: « sem » em "${obj}"`);
    if (/«\s*»/.test(obj)) erros.push(`${onde}: «» vazio em "${obj}"`);
  } else if (Array.isArray(obj)) obj.forEach((v) => checarIngles(v, onde));
  else if (obj && typeof obj === 'object') Object.keys(obj).forEach((k) => checarIngles(obj[k], obj.id ? obj.id : onde));
}
// desenhos de js/icones.js (figuras do completar)
const icones = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(raiz, 'js/icones.js'), 'utf8'), icones);
const textoOk = (t) => typeof t === 'string' && t.trim().length > 0;

// campos novos: livre (varias/completar), rotulos (vfLista), desenho, apoio, instrucao, copiar, colado/img/aceitas (completar)
// naProva: figura que falta é erro (nas salas, só aviso: o jogo mostra ❓)
function checarNovos(d, naProva) {
  if (d.apoio !== undefined) {
    const a = d.apoio;
    checar(a && textoOk(a.titulo), `${d.id}: apoio sem título`);
    checar(a && Array.isArray(a.partes) && a.partes.length > 0, `${d.id}: apoio sem partes`);
    ((a && a.partes) || []).forEach((p, i) => {
      const lista = Array.isArray(p.lista) && p.lista.length > 0 && p.lista.every(textoOk);
      checar(p && (lista || textoOk(p.texto)) && (p.lista === undefined || lista) && (p.texto === undefined || textoOk(p.texto)) && (p.titulo === undefined || textoOk(p.titulo)),
        `${d.id}: parte ${i + 1} do apoio precisa de lista (textos) ou texto`);
    });
  }
  if (d.instrucao !== undefined) checar(textoOk(d.instrucao), `${d.id}: "instrucao" precisa ser um texto não vazio`);
  if (d.colado !== undefined) checar(d.colado === true && d.tipo === 'completar', `${d.id}: "colado" só vale true num completar`);
  if (d.tipo === 'completar' && Array.isArray(d.frases) && Array.isArray(d.palavras)) {
    d.frases.forEach((f, i) => {
      const onde = `${d.id}: frase ${f.letra || i + 1}`;
      if (f.aceitas !== undefined) checar(!d.livre && Array.isArray(f.aceitas) && f.aceitas.length > 0 && f.aceitas.every((j) => Number.isInteger(j) && j >= 0 && j < d.palavras.length && j !== f.certa) && new Set(f.aceitas).size === f.aceitas.length, `${onde}: aceitas deve ter índices de palavras válidos, sem repetir e sem a certa`);
      if (f.img !== undefined) {
        checar(textoOk(f.img) && textoOk(f.alt), `${onde}: figura precisa de img e alt`);
        if (textoOk(f.img) && !icones.window.ICONES[f.img]) {
          if (naProva) erros.push(`${onde}: falta o desenho "${f.img}" em js/icones.js`);
          else avisos.push(`${onde}: falta o desenho "${f.img}" em js/icones.js (aparece ❓)`);
        }
      }
    });
  }
  if (d.tipo === 'copiar') {
    checar(textoOk(d.pergunta), `${d.id}: copiar sem pergunta`);
    checar(Array.isArray(d.itens) && d.itens.length > 0 && d.itens.every((it) => Array.isArray(it.opcoes) && it.opcoes.length >= 2 && it.opcoes.every(textoOk)
      && new Set(it.opcoes).size === it.opcoes.length && Number.isInteger(it.certa) && it.certa >= 0 && it.certa < it.opcoes.length), `${d.id}: itens do copiar inválidos (2+ escritas diferentes e a certa)`);
  }
  if (d.livre !== undefined) checar(d.livre === true && ['varias', 'completar'].includes(d.tipo), `${d.id}: "livre" só vale true em varias/completar`);
  if (d.rotulos !== undefined) checar(d.tipo === 'vfLista' && Array.isArray(d.rotulos) && d.rotulos.length === 2 && d.rotulos.every((r) => typeof r === 'string' && r), `${d.id}: rotulos deve ser ['T', 'F'] (2 textos) num vfLista`);
  if (d.tipo === 'desenho') {
    checar(d.pergunta, `${d.id}: desenho sem pergunta`);
    checar(Array.isArray(d.requisitos) && d.requisitos.length > 0 && d.requisitos.every((r) => REQUISITOS.includes(r)), `${d.id}: requisitos do desenho devem ser de ${REQUISITOS.join('/')}`);
  }
}

Reino.materias.forEach((m) => {
  checarIngles(m, m.id);
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
      checarNovos(d, false);
      if (d.tipo === 'escolha') {
        checar(Array.isArray(d.opcoes) && d.opcoes.length >= 2, `${d.id}: poucas opções`);
        checar(Number.isInteger(d.certa) && d.certa >= 0 && d.certa < d.opcoes.length, `${d.id}: índice certo inválido`);
        const textos = d.opcoes.map((o) => o.t);
        checar(new Set(textos).size === textos.length, `${d.id}: opções repetidas`);
      }
      if (d.tipo === 'vf') checar(typeof d.certo === 'boolean' && d.afirmacao, `${d.id}: V/F incompleto`);
      if (d.tipo === 'varias' && !d.livre) {
        const ok = d.opcoes.filter((o) => o.ok).length;
        checar(ok >= 1, `${d.id}: nenhuma opção certa`);
        if (ok === d.opcoes.length) avisos.push(`${d.id}: todas as opções são certas`);
      }
      if (d.tipo === 'ligar') checarLigarLargura(d);
      if (d.tipo === 'ligar') checar(d.pares.length >= 2 && d.pares.every((p) => (p[0].t || (p[0].img && p[0].alt)) && p[1].t), `${d.id}: pares inválidos`);
      if (d.tipo === 'completar') checar(d.frases.every((f) => (d.livre || (Number.isInteger(f.certa) && f.certa < d.palavras.length)) && typeof f.antes === 'string' && typeof f.depois === 'string'), `${d.id}: frases inválidas`);
      if (d.tipo === 'vfLista') checar(d.itens.length >= 2 && d.itens.every((i) => i.t && typeof i.v === 'boolean'), `${d.id}: V/F inválido`);
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
  const treinaveis = m.salas.flatMap((s) => s.desafios).filter((d) => ['escolha', 'vf', 'varias'].includes(d.tipo) && !d.livre).length;
  checar(treinaveis >= Reino.config.perguntasTreino, `${m.id}: só ${treinaveis} perguntas para o treino`);
  console.log(`✔ ${m.nome}: ${m.salas.length} salas, ${m.salas.reduce((t, s) => t + s.desafios.length, 0)} desafios, ${treinaveis} para o treino, ${(m.livro || []).length} cartões no livro, ${unis.length} unicórnios, R$${valorSala.toFixed(2)} por sala`);
});

// provas bimestrais (Escola do Reino)
const pixelart = fs.readFileSync(path.join(raiz, 'js/pixelart.js'), 'utf8');
Reino.provas.forEach((pv) => {
  const m = Reino.materia(pv.materiaId);
  checar(m, `${pv.id}: matéria ${pv.materiaId} não existe`);
  const livro = new Set(((m && m.livro) || []).map((l) => l.id));
  ['lendario', 'raro', 'comum'].forEach((r) => {
    const a = pv.acessorios && pv.acessorios[r];
    checar(a && a.id && a.nome, `${pv.id}: falta acessório ${r}`);
    if (!a) return;
    checar(!ids.has(a.id), `ID repetido: ${a.id}`);
    ids.add(a.id);
    checar(icones.window.ICONES['acessorio:' + a.id], `${a.id}: falta o ícone "acessorio:${a.id}" em js/icones.js`);
    checar(pixelart.includes(`'${a.id}':`), `${a.id}: falta o desenho no unicórnio (ENFEITES em js/pixelart.js)`);
  });
  checarIngles(pv, pv.id);
  pv.questoes.forEach((d) => {
    checarNovos(d, true);
    checar(!ids.has(d.id), `ID repetido: ${d.id}`);
    ids.add(d.id);
    checar(TIPOS.includes(d.tipo), `${d.id}: tipo desconhecido ${d.tipo}`);
    checar(typeof d.explica === 'string' && d.explica.length > 10, `${d.id}: sem explicação`);
    checar(livro.has(d.livro), `${d.id}: cartão do livro "${d.livro}" não existe`);
    if (d.tipo === 'escolha') checar(Number.isInteger(d.certa) && d.certa >= 0 && d.certa < d.opcoes.length, `${d.id}: índice certo inválido`);
    if (d.tipo === 'varias' && !d.livre) checar(d.opcoes.some((o) => o.ok), `${d.id}: nenhuma opção certa`);
    if (d.tipo === 'ligar') {
      checarLigarLargura(d);
      checar(d.pares.every((p) => (p[0].t || (p[0].img && p[0].alt)) && p[1].t), `${d.id}: pares inválidos`);
      d.pares.forEach((p) => { if (p[0].img) checar(icones.window.ICONES[p[0].img], `${d.id}: falta o desenho "${p[0].img}" em js/icones.js`); });
      if (d.direita) checar([...d.direita].sort().join() === d.pares.map((_, i) => i).join(), `${d.id}: ordem da direita inválida`);
    }
    if (d.tipo === 'vfLista') checar(d.itens.length >= 2 && d.itens.every((i) => i.t && typeof i.v === 'boolean'), `${d.id}: V/F inválido`);
    if (d.tipo === 'completar') checar(d.frases.every((f) => (d.livre || (Number.isInteger(f.certa) && f.certa < d.palavras.length)) && typeof f.antes === 'string' && typeof f.depois === 'string'), `${d.id}: frases inválidas`);
    if (d.tipo === 'ordenar') checar(d.itens.length >= 3, `${d.id}: poucos itens para ordenar`);
    if (d.tipo === 'frase') checar(d.blocos.length >= 3, `${d.id}: poucos blocos`);
  });
  console.log(`✔ ${pv.nome} (${pv.bimestre}): ${pv.questoes.length} questões, acessórios ${pv.acessorios.lendario.nome} / ${pv.acessorios.raro.nome} / ${pv.acessorios.comum.nome}`);
});

// emoji de matéria sem desenho em js/icones.js aparece como emoji reduzido (feio): desenhar antes de publicar
{
  const ic = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(raiz, 'js/icones.js'), 'utf8'), ic);
  const RE = /(\p{RI}\p{RI}|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*)/gu;
  const semDesenho = new Set();
  const arquivos = fs.readdirSync(pastaMaterias).filter((f) => f.endsWith('.js') && !(materiaFora && path.basename(materiaFora) === f)).map((f) => path.join(pastaMaterias, f))
    .concat(materiaFora ? [materiaFora] : [])
    .concat(fs.readdirSync(pastaProvas).filter((f) => f.endsWith('.js')).map((f) => path.join(pastaProvas, f)))
    .concat(['js/provas.js', 'js/falas.js', 'js/ui.js'].map((f) => path.join(raiz, f)));
  arquivos.forEach((f) => {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(RE)) {
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
