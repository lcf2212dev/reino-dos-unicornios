// Lista tudo o que o jogo fala e prepara o texto para as vozes naturais.
// Uso: node ferramentas/listar-falas.js   (gera ferramentas/falas.json)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
const ctx = { console, Math, Date };
ctx.window = ctx;
vm.createContext(ctx);
function carregar(arq) { vm.runInContext(fs.readFileSync(path.join(raiz, arq), 'utf8'), ctx, { filename: arq }); }
carregar('js/config.js');
fs.readdirSync(path.join(raiz, 'js/materias')).filter((f) => f.endsWith('.js')).sort().forEach((f) => carregar('js/materias/' + f));
fs.readdirSync(path.join(raiz, 'js/provas')).filter((f) => f.endsWith('.js')).sort().forEach((f) => carregar('js/provas/' + f));
['js/unicornios.js', 'js/voz.js', 'js/claude.js', 'js/falas.js'].forEach(carregar);
// novidades: fome e sede e a pergunta surpresa (falas() no pacote geral)
['js/loja-itens.js', 'js/cuidados.js', 'js/surpresa.js'].forEach((f) => { if (fs.existsSync(path.join(raiz, f))) carregar(f); });
// construções por dentro: interiores, personagens e cada prédio (se existirem);
// padrao.js vem por último: ele monta o interior das matérias que não têm um próprio
function padraoPorUltimo(a, b) { return (a === 'padrao.js') - (b === 'padrao.js') || (a < b ? -1 : a > b ? 1 : 0); }
['js/interiores.js', 'js/npcs.js'].forEach((f) => { if (fs.existsSync(path.join(raiz, f))) carregar(f); });
if (fs.existsSync(path.join(raiz, 'js/interiores'))) {
  fs.readdirSync(path.join(raiz, 'js/interiores')).filter((f) => f.endsWith('.js')).sort(padraoPorUltimo).forEach((f) => carregar('js/interiores/' + f));
}
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
const COMPOSTAS = /^(pega-pega|bem-vind[oa]s?|caça-palavras|arco-íris|guarda-chuva|beija-flor)$/i;
const FEM_SEM_A = /^(vez|colher|flor|mulher|luz|noite|tarde|parte|sílaba|árvore|nuvem|viagem)$/i;
const MASC_EM_A = /^(dia|mapa|planeta|problema|sofá|clima|tema|cometa)$/i;
const PRONOME = /-(se|os|as|o|a|lo|la|los|las|me|te|lhe|lhes|nos)$/i;
function nomesDasLetras(t) {
  // "R$ 4,00" é dinheiro, não a letra
  t = t.replace(/(^|[^\p{L}])(CH|LH|NH|SS|RR|H|X|S|Z|R|L|U)(?=$|[^\p{L}$])/gu, (_, a, l) => a + NOME_LETRA[l]);
  // "1 laranja" era lido "um laranja": antes de palavra terminada em A/Ã (feminina), o 1 vira "uma"
  t = t.replace(/(^|[^\p{L}\d])1 (?=(\p{L}+))/gu, (m, a, pal) => ((/[aã]$/i.test(pal) && !MASC_EM_A.test(pal)) || FEM_SEM_A.test(pal) ? a + 'uma ' : m));
  // sílabas separadas ("al-gu-ma"): uma pausa em cada hífen, senão a voz lê a palavra inteira
  return t.replace(/\p{L}+(?:-\p{L}+)+/gu, (w) => (COMPOSTAS.test(w) || PRONOME.test(w) ? w : w.split('-').join('… ')));
}

function prepararFala(texto, voz, pacotes) {
  let t = Reino.Voz.normalizar(texto);
  if ((pacotes || []).some((p) => /portugues/.test(p)) && !VOZES_INGLESAS.has(voz)) t = nomesDasLetras(t);
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
  t = t.replace(/\bCPF\b/g, 'cê pê éfe').replace(/\bRG\b/g, 'erre gê');
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
fs.writeFileSync(path.join(__dirname, 'falas.json'), JSON.stringify({ vozes: Reino.config.vozes, falas }, null, 1));

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
