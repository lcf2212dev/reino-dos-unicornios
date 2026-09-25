// Monta js/materias/portugues.js a partir dos rascunhos das salas (rascunho/portugues-p1.js … p5.js)
// e da base (rascunho/portugues-base.js: livro e unicórnios). O texto de cada parte entra do jeito
// que foi escrito (mesmo estilo de historia.js), sem reformatar.
// Uso (dentro de jogo/):
//   node ferramentas/montar-portugues.js                     → js/materias/portugues.js (todas as partes)
//   node ferramentas/montar-portugues.js --parcial --saida /tmp/x/portugues.js
//        (parte que falta vira um marcador provisório, para testar uma sala sozinha)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
const pastaRascunho = path.join(raiz, '..', 'rascunho');
const args = process.argv.slice(2);
const parcial = args.includes('--parcial');
const iSaida = args.indexOf('--saida');
const saida = iSaida >= 0 ? path.resolve(args[iSaida + 1]) : path.join(raiz, 'js/materias/portugues.js');

const SALAS = [
  { id: 'p1', nome: 'Receita de Quê?', emoji: '🍓', paginas: 'pp. 30 a 36 e 51 a 54' },
  { id: 'p2', nome: 'O H Silencioso', emoji: '🌿', paginas: 'pp. 37 a 41 e 54' },
  { id: 'p3', nome: 'CH, LH, NH e o X', emoji: '🐣', paginas: 'pp. 42 a 50, 55 e 56' },
  { id: 'p4', nome: 'Expedição Antártida', emoji: '🧊', paginas: 'pp. 57 a 68' },
  { id: 'p5', nome: 'L, R e RR', emoji: '🎠', paginas: 'pp. 69 a 80' },
];
const CARTAS = ['receita', 'partes-receita', 'passo-a-passo', 'letra-h', 'digrafos', 'x-ou-ch', 'sons-do-x',
  'relato', 'tempo-no-relato', 'som-de-s', 'ponta-iceberg', 'silabas', 'l-r-final', 'r-rr'];

// o texto do objeto que vem depois de "Reino.RASCUNHO_PORTUGUES.<chave> =" até o ";" final
function trecho(arquivo, chave) {
  const texto = fs.readFileSync(arquivo, 'utf8');
  const marca = 'Reino.RASCUNHO_PORTUGUES.' + chave + ' =';
  const i = texto.indexOf(marca);
  if (i < 0) throw new Error(`${arquivo}: não achei "${marca}"`);
  let resto = texto.slice(i + marca.length);
  const prox = resto.indexOf('\nReino.RASCUNHO_PORTUGUES.');   // a base tem duas partes no mesmo arquivo
  if (prox >= 0) resto = resto.slice(0, prox);
  const corpo = resto.replace(/^[ \t]*\r?\n/, '').replace(/;\s*$/, '');
  // confere que é um objeto JS válido
  const ctx = { Reino: {} };
  vm.createContext(ctx);
  vm.runInContext('Reino.x = (' + corpo + ');', ctx, { filename: arquivo });
  return corpo.replace(/\s+$/, '');
}

function provisorioSala(s) {
  const d = [];
  for (let k = 1; k <= 6; k++) {
    d.push(`        { id: '${s.id}-0${k}', tipo: 'escolha', livro: 'receita',
          pergunta: '(provisório) Pergunta ${k} da sala ${s.id}?',
          opcoes: [{ t: 'Certa' }, { t: 'Errada' }], certa: 0,
          explica: 'Desafio provisório: a sala de verdade entra na montagem final.' },`);
  }
  return `    {
      id: '${s.id}', nome: '${s.nome}', emoji: '${s.emoji}', paginas: '${s.paginas}',
      intro: 'Sala provisória da ${s.nome}.',
      desafios: [
${d.join('\n')}
      ],
    }`;
}
function provisorioBase() {
  const livro = CARTAS.map((id) => `    { id: '${id}', e: '📝', titulo: 'Carta ${id}', texto: 'Carta provisória.' },`).join('\n');
  const u = [];
  SALAS.forEach((s, i) => {
    u.push(`    { id: 'p-comum-${i + 1}', nome: 'Comum ${i + 1}', raridade: 'comum', sala: '${s.id}', cores: { corpo: '#ffffff', crina: ['#ff7eb6', '#7c5cff'], chifre: '#ffd34d' }, frase: 'Frase provisória.' },`);
    u.push(`    { id: 'p-raro-${i + 1}', nome: 'Raro ${i + 1}', raridade: 'raro', sala: '${s.id}', cores: { corpo: '#ffffff', crina: ['#39c5bb', '#ffd34d'], chifre: '#ff7eb6' }, frase: 'Frase provisória.' },`);
  });
  u.push(`    { id: 'p-epico-ouro', nome: 'Épico Ouro', raridade: 'epico', treino: 'ouro', cores: { corpo: '#fff1a8', crina: ['#e09f3e'], chifre: '#ffffff', asa: '#fffbe0' }, frase: 'Frase provisória.' },`);
  u.push(`    { id: 'p-epico-perfeito', nome: 'Épico Perfeito', raridade: 'epico', treino: 'perfeito', cores: { corpo: '#e0fbfc', crina: ['#3d5a80'], chifre: '#ffd166', asa: '#f0fcff' }, frase: 'Frase provisória.' },`);
  u.push(`    { id: 'p-lendario', nome: 'Lendário', raridade: 'lendario', materiaCompleta: true, cores: { corpo: '#f5f3ff', crina: ['#e0433f'], chifre: '#ffd60a', asa: '#e8e6ff' }, frase: 'Frase provisória.' },`);
  return { livro: `  livro: [\n${livro}\n  ],`, unicornios: `  unicornios: [\n${u.join('\n')}\n  ],` };
}

const partes = [];
const faltando = [];
SALAS.forEach((s, i) => {
  const arq = path.join(pastaRascunho, `portugues-${s.id}.js`);
  if (fs.existsSync(arq)) {
    partes.push(`    /* ------------------------------------------------------------ SALA ${i + 1} */\n` + trecho(arq, s.id).replace(/^\s*\/\*[-\s]*SALA \d+\s*\*\/\s*\n/, '') + ',');
  } else {
    faltando.push(`rascunho/portugues-${s.id}.js`);
    partes.push(`    /* ------------------------------------------------------------ SALA ${i + 1} (PROVISÓRIA) */\n` + provisorioSala(s) + ',');
  }
});
let livro, unicornios;
const arqBase = path.join(pastaRascunho, 'portugues-base.js');
if (fs.existsSync(arqBase)) {
  livro = '  livro: ' + trecho(arqBase, 'livro') + ',';
  unicornios = '  unicornios: ' + trecho(arqBase, 'unicornios') + ',';
} else {
  faltando.push('rascunho/portugues-base.js');
  ({ livro, unicornios } = provisorioBase());
}
if (faltando.length && !parcial) {
  console.error('✘ Faltam partes (use --parcial para montar com marcadores provisórios):\n  ' + faltando.join('\n  '));
  process.exit(1);
}

const arquivo = `/* PORTUGUÊS — 2º ano, Volume 3, Língua Portuguesa, Capítulos 8 e 9 (pp. 30 a 80 da apostila).
   Capítulo 8, "Receita de quê?" (pp. 30 a 56); Capítulo 9, "Vi, fiz e relatei!" (pp. 57 a 80).
   Lugar no reino: Casa das Palavras. 5 salas que dividem os R$20, na ordem do livro.
   Montado por ferramentas/montar-portugues.js a partir de rascunho/ (não edite só aqui). */
Reino.registrarMateria({
  id: 'portugues',
  nome: 'Português',
  emoji: '📝',
  nomeLivro: 'Livro das Letras',
  lugar: {
    nome: 'Casa das Palavras',
    artigo: 'a',   // "até a Casa das Palavras", "as salas da Casa das Palavras" (js/falas.js)
    sprite: 'palavras',
    rect: { x: 23, y: 4, w: 5, h: 5 },
    placa: 'acima',
    cores: { parede: '#fff4ec', telhado: '#e0433f', detalhe: '#39a860' },
  },
  guia: 'Eu sou o guia da Casa das Palavras! Aqui tem receita, letras, uma viagem gelada e um carrossel.',

  salas: [
${partes.join('\n\n')}
  ],

  /* Livro das Letras: resumos curtos para ler antes ou quando errar. */
${livro}

  /* Unicórnios de Português: 1 comum e 1 raro por sala, 2 épicos e o lendário. */
${unicornios}
});
`;
fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.writeFileSync(saida, arquivo);
console.log(`✔ ${path.relative(process.cwd(), saida)} montado${faltando.length ? ' (provisório: ' + faltando.join(', ') + ')' : ''}`);
