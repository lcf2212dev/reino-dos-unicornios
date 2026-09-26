#!/usr/bin/env node
/* Confere as músicas por ambiente (js/musicas.js) só pelos DADOS, carregando config.js + musicas.js num vm.
   Uso: node ferramentas/testar-musicas.js      (sai com código 1 se alguma regra falhar)

   Regras de cada faixa:
   - toca pelo menos 20 s antes de repetir (duracao ≥ 20) e o loop tem notas até perto do fim;
   - tem pelo menos 2 seções diferentes na ordem (conteúdo diferente, não só o nome);
   - cada compasso da melodia soma as batidas do compasso, e melodia/acordes têm o mesmo número de compassos;
   - nenhum trecho de menos de 20 s se repete em seguida: para todo t e todo X (de 1 compasso até < 20 s,
     de batida em batida, olhando o loop como um círculo), as notas de [t, t+X) não podem ser iguais às de
     [t+X, t+2X). Confere com todas as partes juntas e também só com a melodia (a frase não pode ser curta
     e repetida). O volume não conta (volume diferente não faz a frase ser outra);
   - o loop não é periódico com período < 20 s (caso particular do item acima, conferido à parte);
   - as notas são válidas (tempo dentro do loop, duração > 0, frequência audível, parte e volume válidos);
   - o fim emenda no começo: a última nota da melodia termina até o fim do loop (nada fica cortado no meio
     de uma frase) e o loop começa com notas no tempo 0;
   - os ambientes do contrato têm faixa. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
const ctx = { console, Math, Object, Array, JSON, String, Number, Error, parseFloat, setTimeout, clearTimeout };
ctx.window = ctx;
vm.createContext(ctx);
// MUSICAS_ARQ=<caminho> confere outro arquivo de músicas (teste do próprio conferidor)
for (const f of ['js/config.js', process.env.MUSICAS_ARQ || 'js/musicas.js']) vm.runInContext(fs.readFileSync(path.resolve(raiz, f), 'utf8'), ctx, { filename: f });
const R = ctx.Reino;
const M = R.Musicas;

let falhas = 0;
function falha(msg) { falhas++; console.log('  ✗ ' + msg); }

const AMBIENTES = ['mapa', 'lago', 'museu', 'torre', 'portugues', 'portugues-gelo', 'castelo', 'escola', 'estabulo',
  'loja', 'bau', 'petshop', 'observatorio', 'sala'];
const PARTES = ['melodia', 'harmonia', 'baixo', 'percussao'];
const MIN_S = 20;

if (!M || typeof M.expandir !== 'function' || typeof M.duracao !== 'function' || !M.faixas) {
  console.log('✗ Reino.Musicas sem faixas/expandir/duracao');
  process.exit(1);
}
for (const a of AMBIENTES) if (!M.faixas[a]) falha('ambiente sem faixa: ' + a);

const chave = (e) => [e.parte, e.onda || '', e.freq.toFixed(2), e.dur.toFixed(3)].join('|');
const ms = (x) => Math.round(x * 1000);

// eventos que começam em [a, a+X) no loop circular, com o tempo relativo ao começo da janela
function janela(porMs, dur, a, X) {
  const r = [];
  for (let k = 0; k < X; k++) {
    const lista = porMs.get(((a + k) % dur + dur) % dur);
    if (lista) for (const c of lista) r.push(k + ':' + c);
  }
  return r.sort().join('\n');
}

function conferirRepeticao(id, ev, durS, batidaS, compassoS, soMelodia) {
  const dur = ms(durS);
  const porMs = new Map();
  for (const e of ev) {
    if (soMelodia && e.parte !== 'melodia') continue;
    const k = ms(e.t) % dur;
    if (!porMs.has(k)) porMs.set(k, []);
    porMs.get(k).push(chave(e));
  }
  const passo = batidaS;
  const nPassos = Math.round(durS / passo);
  const achados = [];
  for (let X = compassoS; X < MIN_S - 1e-6; X += passo) {
    const Xms = ms(X);
    for (let i = 0; i < nPassos; i++) {
      const a = ms(i * passo);
      const j1 = janela(porMs, dur, a, Xms);
      if (!j1) continue;                     // janela sem nota nenhuma não é "frase"
      const j2 = janela(porMs, dur, a + Xms, Xms);
      if (j1 === j2) { achados.push({ t: i * passo, X }); break; }
    }
    if (achados.length) break;
  }
  return achados;
}

let resumo = [];
for (const id of Object.keys(M.faixas)) {
  const fx = M.faixas[id];
  console.log(`• ${id} (${fx.nome})`);
  let ev, dur;
  try { ev = M.expandir(id); dur = M.duracao(id); } catch (e) { falha(`${id}: erro ao expandir: ${e.message}`); continue; }
  const batidaS = 60 / fx.bpm;
  const compassoS = batidaS * (fx.compasso || 4);

  // duração
  if (!(dur >= MIN_S)) falha(`${id}: loop de ${dur.toFixed(1)} s (< ${MIN_S} s)`);

  // notas válidas
  for (const e of ev) {
    if (!(e.t >= 0 && e.t < dur)) { falha(`${id}: nota fora do loop t=${e.t}`); break; }
    if (!(e.dur > 0)) { falha(`${id}: nota sem duração t=${e.t}`); break; }
    if (!(e.freq >= 30 && e.freq <= 12000)) { falha(`${id}: frequência estranha ${e.freq} t=${e.t}`); break; }
    if (!PARTES.includes(e.parte)) { falha(`${id}: parte inválida ${e.parte}`); break; }
    if (!(e.vol > 0 && e.vol <= 1)) { falha(`${id}: volume inválido ${e.vol} t=${e.t}`); break; }
  }
  for (const p of ['melodia', 'harmonia', 'baixo']) if (!ev.some((e) => e.parte === p)) falha(`${id}: sem ${p}`);
  if (!ev.some((e) => e.t === 0)) falha(`${id}: o loop não começa com nota no tempo 0`);

  // compassos
  const comp = M.compassos(id);
  for (const c of comp) {
    if (c.linhasMel !== c.linhasAc) { falha(`${id}/${c.secao}: melodia com ${c.linhasMel} compassos e acordes com ${c.linhasAc}`); break; }
    if (c.linhasMel2 !== null && c.linhasMel2 !== c.linhasAc) { falha(`${id}/${c.secao}: melodia2 com ${c.linhasMel2} compassos`); break; }
    if (Math.abs(c.melodia - c.batidas) > 1e-6) { falha(`${id}/${c.secao} (t=${c.t}s): compasso da melodia soma ${c.melodia} batidas (esperado ${c.batidas})`); }
    if (c.melodia2 !== null && Math.abs(c.melodia2 - c.batidas) > 1e-6) falha(`${id}/${c.secao} (t=${c.t}s): compasso da melodia2 soma ${c.melodia2}`);
  }

  // seções diferentes (conteúdo)
  const conteudos = new Set(fx.ordem.map((n) => JSON.stringify(M.secao(id, n))));
  if (conteudos.size < 2) falha(`${id}: menos de 2 seções diferentes`);
  // seção igual colada nela mesma (inclusive a emenda do fim com o começo)
  for (let i = 0; i < fx.ordem.length; i++) {
    const a = JSON.stringify(M.secao(id, fx.ordem[i])), b = JSON.stringify(M.secao(id, fx.ordem[(i + 1) % fx.ordem.length]));
    if (a === b) falha(`${id}: seção ${fx.ordem[i]} repetida em seguida`);
  }

  // período curto (o loop inteiro igual a ele mesmo deslocado de X < 20 s)
  const todos = new Map();
  for (const e of ev) { const k = ms(e.t); todos.set(k, (todos.get(k) || []).concat(chave(e))); }
  const dms = ms(dur);
  for (let X = batidaS; X < MIN_S; X += batidaS) {
    const Xms = ms(X);
    let igual = true;
    for (const [k, l] of todos) {
      const o = todos.get((k + Xms) % dms);
      if (!o || o.slice().sort().join() !== l.slice().sort().join()) { igual = false; break; }
    }
    if (igual) { falha(`${id}: o loop se repete a cada ${X.toFixed(2)} s`); break; }
  }

  // trechos curtos repetidos em seguida
  const r1 = conferirRepeticao(id, ev, dur, batidaS, compassoS, false);
  if (r1.length) falha(`${id}: trecho de ${r1[0].X.toFixed(2)} s repetido em seguida a partir de ${r1[0].t.toFixed(2)} s (todas as partes)`);
  const r2 = conferirRepeticao(id, ev, dur, batidaS, compassoS, true);
  if (r2.length) falha(`${id}: frase de ${r2[0].X.toFixed(2)} s da melodia repetida em seguida a partir de ${r2[0].t.toFixed(2)} s`);

  // emenda: a melodia não fica cortada no fim do loop
  const mel = ev.filter((e) => e.parte === 'melodia');
  const fimMel = Math.max(...mel.map((e) => e.t + e.dur));
  if (fimMel > dur + 1e-6) falha(`${id}: a melodia passa do fim do loop (${fimMel.toFixed(2)} > ${dur.toFixed(2)})`);
  const ultima = Math.max(...ev.map((e) => e.t));
  if (dur - ultima > compassoS + 1e-6) falha(`${id}: silêncio de ${(dur - ultima).toFixed(2)} s no fim do loop`);

  const secoes = [...new Set(fx.ordem)];
  resumo.push(`${id}: ${dur.toFixed(1)} s, ${fx.bpm} bpm, ${fx.ordem.length} seções (${secoes.join(' ')}), ${ev.length} notas`);
}

console.log('\nResumo:');
resumo.forEach((l) => console.log('  ' + l));
if (falhas) { console.log(`\n✗ ${falhas} problema(s) nas músicas`); process.exit(1); }
console.log('\n✓ músicas ok (todas ≥ 20 s, com seções diferentes e sem trecho curto repetido)');
