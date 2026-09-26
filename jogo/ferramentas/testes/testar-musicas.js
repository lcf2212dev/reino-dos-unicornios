#!/usr/bin/env node
/* Confere as músicas por ambiente (js/sistemas/musicas.js) só pelos DADOS, carregando config.js + musicas.js num vm.
   Uso: node ferramentas/testes/testar-musicas.js      (sai com código 1 se alguma regra falhar)

   Regras de cada faixa:
   - toca pelo menos 20 s antes de repetir (duracao ≥ 20) e o loop tem notas até perto do fim;
   - tem pelo menos 2 seções diferentes na ordem (conteúdo diferente, não só o nome);
   - cada compasso da melodia soma as batidas do compasso, e melodia/acordes têm o mesmo número de compassos;
   - nenhum trecho de menos de 20 s se repete em seguida: para todo t e todo X (de 1 compasso até < 20 s,
     de batida em batida, olhando o loop como um círculo), as notas de [t, t+X) não podem ser iguais às de
     [t+X, t+2X). Confere com todas as partes juntas e também só com a melodia (a frase não pode ser curta
     e repetida). O volume não conta (volume diferente não faz a frase ser outra);
   - nenhum motivo curto da melodia (1 batida até menos de 1 compasso) se repete 4 vezes seguidas;
   - tempos comparados em tiques inteiros da grade de batidas (48 por batida), nunca em ms arredondados;
   - o loop não é periódico com período < 20 s (caso particular do item acima, conferido à parte);
   - as notas são válidas (tempo dentro do loop, duração > 0, frequência audível, parte e volume válidos);
   - o fim emenda no começo: a última nota da melodia termina até o fim do loop (nada fica cortado no meio
     de uma frase) e o loop começa com notas no tempo 0;
   - os ambientes do contrato têm faixa. */
const path = require('path');
const Jogo = require('../jogo-no-node');

const ctx = Jogo.contexto({ console, Math, Object, Array, JSON, String, Number, Error, parseFloat, setTimeout, clearTimeout });
// MUSICAS_ARQ=<caminho> confere outro arquivo de músicas (teste do próprio conferidor; relativo a jogo/)
const trocar = process.env.MUSICAS_ARQ ? { 'sistemas/musicas': path.resolve(Jogo.raiz, process.env.MUSICAS_ARQ) } : {};
Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'sistemas/musicas'] }), { trocar });
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

// Tudo em TIQUES inteiros da grade (TPB por batida), nunca em ms: com 104 bpm a batida não dá um número
// inteiro de ms, e comparar tempos arredondados em ms deixava as chaves 1 ms desalinhadas (nada batia).
const TPB = 48;                               // tiques por batida (cobre semicolcheia, tercina e o 0,03 da batida)
const tiquesDe = (bpm) => (x) => Math.round(x * bpm / 60 * TPB);
const chave = (e, tk) => [e.parte, e.onda || '', e.freq.toFixed(2), tk(e.dur)].join('|');

// eventos por tique (vetor do tamanho do loop, com a lista de chaves de quem começa ali)
function porTique(ev, durT, tk, soMelodia) {
  const v = new Array(durT).fill(null);
  for (const e of ev) {
    if (soMelodia && e.parte !== 'melodia') continue;
    const k = ((tk(e.t) % durT) + durT) % durT;
    (v[k] = v[k] || []).push(chave(e, tk));
  }
  return v;
}
// eventos que começam em [a, a+X) no loop circular, com o tempo relativo ao começo da janela
function janela(v, a, X) {
  const n = v.length, r = [];
  for (let k = 0; k < X; k++) {
    const lista = v[(((a + k) % n) + n) % n];
    if (lista) for (const c of lista) r.push(k + ':' + c);
  }
  return r.sort().join('\n');
}
// menor X (em tiques, de batida em batida, de xMin até < 20 s) em que algum trecho [a, a+X) se repete
// `copias` vezes seguidas (a em cada batida, loop circular)
function conferirRepeticao(v, batT, xMin, xMax, copias) {
  const n = v.length;
  for (let X = xMin; X < xMax; X += batT) {
    for (let a = 0; a < n; a += batT) {
      const j1 = janela(v, a, X);
      if (!j1) continue;                     // janela sem nota nenhuma não é "frase"
      let c = 1;
      while (c < copias && janela(v, a + c * X, X) === j1) c++;
      if (c >= copias) return { a, X };
    }
  }
  return null;
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

  const tk = tiquesDe(fx.bpm), durT = tk(dur), batT = TPB, compT = TPB * (fx.compasso || 4);
  const xMax = tk(MIN_S - 1e-6) + 1;         // X < 20 s
  const seg = (T) => (T / TPB * 60 / fx.bpm).toFixed(2);
  if (Math.abs(durT - dur * fx.bpm / 60 * TPB) > 0.01) falha(`${id}: o loop não fecha na grade de batidas`);
  const vTodos = porTique(ev, durT, tk, false), vMel = porTique(ev, durT, tk, true);

  // período curto (o loop inteiro igual a ele mesmo deslocado de X < 20 s)
  for (let X = batT; X < xMax; X += batT) {
    const igual = vTodos.every((l, i) => {
      const o = vTodos[(i + X) % durT];
      return (!l && !o) || (l && o && l.slice().sort().join() === o.slice().sort().join());
    });
    if (igual) { falha(`${id}: o loop se repete a cada ${seg(X)} s`); break; }
  }

  // trechos repetidos em seguida: de 1 compasso até < 20 s, 2 cópias coladas (todas as partes e só a melodia)
  const r1 = conferirRepeticao(vTodos, batT, compT, xMax, 2);
  if (r1) falha(`${id}: trecho de ${seg(r1.X)} s repetido em seguida a partir de ${seg(r1.a)} s (todas as partes)`);
  const r2 = conferirRepeticao(vMel, batT, compT, xMax, 2);
  if (r2) falha(`${id}: frase de ${seg(r2.X)} s da melodia repetida em seguida a partir de ${seg(r2.a)} s`);
  // motivo curto da melodia (1 batida até menos de 1 compasso) repetido 4 vezes seguidas
  const r3 = conferirRepeticao(vMel, batT, batT, compT, 4);
  if (r3) falha(`${id}: motivo de ${seg(r3.X)} s da melodia repetido 4 vezes a partir de ${seg(r3.a)} s`);

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
