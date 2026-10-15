// Lista tudo o que o jogo fala e prepara o texto para as vozes naturais.
// Uso (da raiz do repositório):
//   node jogo/ferramentas/vozes/listar-falas.js            gera jogo/ferramentas/gerado/falas.json e mostra o resumo
//   node jogo/ferramentas/vozes/listar-falas.js --mostrar  também cada fala cujo texto a voz lê diferente (→)
//   node jogo/ferramentas/vozes/listar-falas.js --ajuda    só esta ajuda (não grava nada)
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const Jogo = require('../jogo-no-node');

// todos os scripts `node: true` do manifesto; os prédios em ordem alfabética (padrao.js por último):
// essa ordem define a ordem do falas.json
const ctx = Jogo.contexto({ console, Math, Date });
Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
const Reino = ctx.Reino;
// vozes inglesas: 'ingles' e todo perfil usado como `ingles` de outro perfil
const VOZES_INGLESAS = new Set(['ingles']);
Object.values(Reino.config.vozes).forEach((v) => { if (v && v.ingles) VOZES_INGLESAS.add(v.ingles); });

/* ---------- preparação do texto para a voz ---------- */
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const ESTADOS = { AM: 'Amazonas', RJ: 'Rio de Janeiro', MS: 'Mato Grosso do Sul', RS: 'Rio Grande do Sul', ES: 'Espírito Santo', TO: 'Tocantins', SP: 'São Paulo', PA: 'Pará', MG: 'Minas Gerais', BA: 'Bahia', PE: 'Pernambuco', CE: 'Ceará', MA: 'Maranhão', GO: 'Goiás', PR: 'Paraná', SC: 'Santa Catarina' };

// Português: letras sozinhas ("usando X ou CH", "a letra H") são lidas pelo nome, como a professora fala.
// Só nas falas dos pacotes de Português (as gravações das outras matérias não mudam).
const NOME_LETRA = { CH: 'cê agá', LH: 'éle agá', NH: 'ene agá', SS: 'dois ésses', RR: 'dois érres',
  H: 'agá', X: 'xis', S: 'ésse', Z: 'zê', R: 'érre', L: 'éle', U: 'u' };
// palavras com hífen que não são sílabas separadas (compostas e pronomes: "lave-os", "bem-vinda")
const COMPOSTAS = /^(pega-pega|bem-vind[oa]s?|caça-palavras|arco-íris|guarda-chuva|beija-flor|batata-doce|bem-me-quer|mal-me-quer|dois-pontos|pontos?-finai?[ls]|vitória-régia)$/i;
const FEM_SEM_A = /^(vez|colher|flor|mulher|luz|noite|tarde|parte|sílaba|árvore|nuvem|viagem)$/i;
const MASC_EM_A = /^(dia|mapa|planeta|problema|sofá|clima|tema|cometa)$/i;
const PRONUNCIA = { kiwis: 'kiuís', kiwi: 'kiuí' };
// nomes próprios que a voz lia mal em qualquer pacote (não só no de Português), conferido por transcrição:
// Lavoisier saía "Lá vozia" (2º andar da química)
const PRONUNCIA_NOMES = { lavoisier: 'Lavoaziê' };
const RE_NOMES = new RegExp('(^|[^\\p{L}])(' + Object.keys(PRONUNCIA_NOMES).join('|') + ')(?=$|[^\\p{L}])', 'giu');
const PRONOME = /-(se|os|as|o|a|lo|la|los|las|me|te|lhe|lhes|nos)$/i;
function nomesDasLetras(t) {
  // "R$ 4,00" é dinheiro, não a letra
  t = t.replace(/(^|[^\p{L}])(CH|LH|NH|SS|RR|H|X|S|Z|R|L|U)(?=$|[^\p{L}$])/gu, (_, a, l) => a + NOME_LETRA[l]);
  // "1 laranja" era lido "um laranja": antes de palavra terminada em A/Ã (feminina), o 1 vira "uma"
  t = t.replace(/(^|[^\p{L}\d])1 (?=(\p{L}+))/gu, (m, a, pal) => ((/[aã]$/i.test(pal) && !MASC_EM_A.test(pal)) || FEM_SEM_A.test(pal) ? a + 'uma ' : m));
  // sílabas separadas ("al-gu-ma"): uma pausa em cada hífen, senão a voz lê a palavra inteira
  // pronome só com um hífen e verbo de 4+ letras antes ("lave-os"); "par-te", "bo-la" são sílabas
  const pronome = (w) => { const p = w.split('-'); return p.length === 2 && p[0].length >= 4 && PRONOME.test(w); };
  t = t.replace(/\p{L}+(?:-\p{L}+)+/gu, (w) => (COMPOSTAS.test(w) || pronome(w) ? w : w.split('-').join('… ')));
  // palavras que a voz pronunciava mal (conferido por transcrição): só o texto falado muda
  return t.replace(/(^|[^\p{L}])(kiwis|kiwi)(?=$|[^\p{L}])/giu, (_, a, w) => a + PRONUNCIA[w.toLowerCase()]);
}

function prepararFala(texto, voz, pacotes) {
  let t = Reino.Voz.normalizar(texto);
  // terminações soltas ("-ã, -ão, -ães", "Ã – ão – ães"): a voz lia "an an ans"; fala cada uma com um exemplo
  t = t.replace(/(^|[\s(–—"“,])-?(ães|ão|ã)(?=$|[\s,.;:)!?–—"”])/giu, (_, a, w) => a + ({ 'ã': 'ã, de irmã', 'ão': 'ão, de pão', 'ães': 'ães, de pães' })[w.toLowerCase()]);
  // número de quadrinho/lacuna dos diálogos do livro ("[4]Oba[5] Com certeza"): só na tela; a voz faz uma pausa
  t = t.replace(/\s*\[\d+\]\s*/g, '… ').replace(/^(…\s*)+|(\s*…)+\s*$/g, '').replace(/(…\s*)+([.!?:,;])/g, '$2').trim();
  if ((pacotes || []).some((p) => /portugues/.test(p)) && !VOZES_INGLESAS.has(voz)) t = nomesDasLetras(t);
  if (!VOZES_INGLESAS.has(voz)) t = t.replace(RE_NOMES, (_, a, w) => a + PRONUNCIA_NOMES[w.toLowerCase()]);
  // voz inglesa: só lacunas e MAIÚSCULAS (sem as regras do português)
  if (VOZES_INGLESAS.has(voz)) {
    t = t.replace(/_{2,}/g, '…').replace(/…\./g, '…');
    // "a tick (√) ... a cross (X)": os sinais só aparecem na tela ("√" seria lido como raiz quadrada)
    t = t.replace(/\s*\((?:√|X)\)/g, '');
    t = t.replace(/(^|[^\p{L}])(\p{Lu}{2,})(?=$|[^\p{L}])/gu, (_, a, p) => a + p.toLowerCase());
    return t.replace(/\s+/g, ' ').trim();
  }
  t = t.replace(/R\$\s?(\d+)(?:,(\d{2}))?/g, (_, r, c) => r + (r === '1' ? ' real' : ' reais') + (c && c !== '00' ? ' e ' + Number(c) + ' centavos' : ''));
  t = t.replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g, (_, d, m, a) => Number(d) + ' de ' + MESES[Number(m) - 1] + ' de ' + (a.length === 2 ? '19' + a : a));
  // "Manaus (AM)" -> "Manaus, Amazonas"; "Rio de Janeiro (RJ)" -> "Rio de Janeiro"
  t = t.replace(/\s*\(([A-Z]{2})\)/g, (s, uf, pos, todo) => {
    if (!ESTADOS[uf]) return s;
    return todo.slice(0, pos).endsWith(ESTADOS[uf]) ? '' : ', ' + ESTADOS[uf] + ',';
  });
  // siglas de documentos: soletradas do jeito que a gente fala
  // "3 × 5": a voz lia "multiplicação"; na apostila se lê "vezes"
  t = t.replace(/\s*×\s*/g, ' vezes ');
  t = t.replace(/\bCPF\b/g, 'cê pê éfe').replace(/\bRG\b/g, 'erre gê');
  // "ET" (extraterrestre) era lido "Ida": do jeito que a gente fala
  t = t.replace(/\bETs\b/g, 'etês').replace(/\bET\b/g, 'etê');
  t = t.replace(/\bpp\.\s*/g, 'páginas ').replace(/\bcaps\.\s*/g, 'capítulos ');
  t = t.replace(/_{2,}/g, '…').replace(/…\./g, '…').replace(/,,/g, ',');
  // palavras em MAIÚSCULAS seriam soletradas: vira minúscula
  t = t.replace(/(^|[^\p{L}])(\p{Lu}{2,})(?=$|[^\p{L}])/gu, (_, a, p) => a + p.toLowerCase());
  return t.replace(/\s+/g, ' ').trim();
}

/* ---------- lista ---------- */
const porChave = new Map();
Reino.Falas.todas().forEach((f) => {
  const chave = Reino.Voz.chave(f.voz, f.texto);
  let item = porChave.get(chave);
  if (!item) {
    item = { chave, voz: f.voz, texto: Reino.Voz.normalizar(f.texto), original: f.texto, pacotes: [] };
    porChave.set(chave, item);
  }
  if (!item.pacotes.includes(f.pacote)) item.pacotes.push(f.pacote);
});
// o texto falado depende dos pacotes (nomes das letras só em Português): calculado depois de juntar todos
porChave.forEach((item) => {
  item.fala = prepararFala(item.original, item.voz, item.pacotes);
  delete item.original;
});
const falas = [...porChave.values()].filter((f) => f.fala.length > 0);
fs.writeFileSync(path.join(__dirname, '..', 'gerado', 'falas.json'), JSON.stringify({ vozes: Reino.config.vozes, falas }, null, 1));

const resumo = {};
falas.forEach((f) => f.pacotes.forEach((p) => {
  resumo[p] = resumo[p] || { falas: 0, letras: 0 };
  resumo[p].falas++; resumo[p].letras += f.fala.length;
}));
const porVoz = {};
falas.forEach((f) => { porVoz[f.voz] = (porVoz[f.voz] || 0) + 1; });
console.log(`${falas.length} falas diferentes (${falas.reduce((t, f) => t + f.fala.length, 0)} letras)`);
console.log('por voz:', JSON.stringify(porVoz));
Object.keys(resumo).sort().forEach((p) => console.log(`  ${p}: ${resumo[p].falas} falas, ${resumo[p].letras} letras`));
if (process.argv.includes('--mostrar')) falas.forEach((f) => { if (f.fala !== f.texto) console.log('  ~ ' + f.texto + '\n    → ' + f.fala); });
