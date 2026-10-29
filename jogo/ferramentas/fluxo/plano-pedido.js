// Rascunho de plano paralelo a partir de um pedido no modelo PEDIDO-DE-FEATURE.md (npm run plano -- rascunho …):
// nome (campo 1), tipos marcados [x] (campo 2) → tarefas do catálogo (plano-tipos.js), personagens da lista
// "Quem aparece:" (campo 8, uma pessoa por linha: "Dona Lulu, mulher, adulta" ou "- Dona Lulu (mulher, adulta)") e o
// "Pronto quando" (campo 13) na integração. O que o pedido não fecha (prédio, vaga x/y, arquivos) sai vazio e o
// `plano conferir` acusa com "preencha". Função pura: recebe o texto do pedido.

const semAcento = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slug = (s) => semAcento(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// o pedido de número `parte` num arquivo com vários ("# Pedido 1 de 3: …"); sem partes, o texto todo
function pedidoDaParte(texto, parte) {
  const partes = texto.split(/^#\s*Pedido\s+\d+\s+de\s+\d+.*$/m).slice(1);
  if (!partes.length) return texto;
  const n = parte ? Number(parte) : 1;
  if (!partes[n - 1]) throw new Error(`--parte ${parte}: o pedido tem ${partes.length} parte(s)`);
  return partes[n - 1];
}

// linhas do campo "# <n>. …" até o próximo campo (ou o separador ---)
function campo(texto, n) {
  const linhas = texto.split('\n');
  const i = linhas.findIndex((l) => new RegExp(`^#\\s*${n}\\.\\s`).test(l));
  if (i < 0) return [];
  const fim = linhas.findIndex((l, k) => k > i && (/^#\s*\d+\.\s/.test(l) || /^---\s*$/.test(l)));
  return linhas.slice(i + 1, fim < 0 ? undefined : fim);
}

const GENERO = { f: ['mulher', 'menina', 'moca', 'senhora', 'f', 'feminino'], m: ['homem', 'menino', 'rapaz', 'senhor', 'm', 'masculino'] };
const IDADE = {
  crianca: ['crianca', 'menina', 'menino'], jovem: ['jovem', 'moca', 'rapaz'],
  adulto: ['adulto', 'adulta'], idoso: ['idoso', 'idosa', 'vovo'],
};
// títulos que não são o primeiro nome (o id da Dona Lulu é <prefixo>-lulu)
const TITULOS = ['dona', 'seu', 'dom', 'tia', 'tio', 'vovo', 'senhor', 'senhora', 'professora', 'professor', 'doutor', 'doutora', 'dr', 'dra', 'sr', 'sra', 'princesa', 'principe', 'rei', 'rainha'];

// "Dona Lulu, mulher, adulta" | "- Dona Lulu (mulher, adulta)" | "Seu Zé, homem, 70 anos" → { nome, genero, idade }
function lerPessoa(linha) {
  const l = linha.replace(/^\s*[-*•]\s*/, '').trim();
  let nome = l, desc = '';
  const par = /^(.+?)\s*\((.+)\)\s*\.?$/.exec(l);
  if (par) { nome = par[1]; desc = par[2]; } else if (l.includes(',')) { const [a, ...b] = l.split(','); nome = a; desc = b.join(' '); }
  const palavras = semAcento(desc).split(/[^a-z0-9]+/).filter(Boolean);
  const achar = (tabela) => Object.keys(tabela).find((k) => palavras.some((w) => tabela[k].includes(w))) || null;
  let idade = achar(IDADE);
  const num = palavras.find((w) => /^\d+$/.test(w));
  if (!idade && num) { const n = Number(num); idade = n < 13 ? 'crianca' : n < 25 ? 'jovem' : n < 60 ? 'adulto' : 'idoso'; }
  // "a cabeleireira Dona Lulu" → "Dona Lulu" (o nome começa na primeira palavra com maiúscula)
  nome = nome.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  const m = /(^|\s)(\p{Lu}.*)$/u.exec(nome);
  const antes = m ? nome.slice(0, m.index) : '';
  const limpo = (m ? m[2] : nome).trim();
  return { nome: limpo, genero: achar(GENERO) || generoPelaPalavra(antes + ' ' + limpo), idade };
}

// sem sinal explícito: o gênero pela profissão ou título antes do nome ("a cabeleireira Dona Lulu" → f);
// artigos não contam; nomes próprios (com maiúscula que não sejam título) também não
const ARTIGOS = ['a', 'o', 'um', 'uma', 'as', 'os'];
const MASCULINOS = ['seu', 'dom', 'rei', 'principe', 'sr', 'dr'];
function generoPelaPalavra(texto) {
  const palavras = texto.split(/\s+/).filter(Boolean).filter((w) => !/^\p{Lu}/u.test(w) || TITULOS.includes(semAcento(w)))
    .map(semAcento).filter((w) => !ARTIGOS.includes(w));
  for (const w of palavras) {
    if (MASCULINOS.includes(w)) return 'm';
    if (/(eira|ora|a)$/.test(w)) return 'f';
    if (/(eiro|or|o)$/.test(w)) return 'm';
  }
  return null;
}

function primeiroNome(nome) {
  const partes = semAcento(nome).split(/[^a-z0-9]+/).filter(Boolean);
  return partes.find((p) => !TITULOS.includes(p)) || partes[0] || 'pessoa';
}

// "Quem aparece:" do campo 8: o resto da linha e as linhas seguintes, até o próximo item do campo
function pessoas(linhas8) {
  const i = linhas8.findIndex((l) => /^\s*Quem aparece\s*:/i.test(l));
  if (i < 0) return [];
  const lista = [linhas8[i].replace(/^\s*Quem aparece\s*:/i, '')];
  for (const l of linhas8.slice(i + 1)) {
    if (/^\s*(Jeito de falar|Textos|Voz nova)\s*:/i.test(l)) break;
    lista.push(l);
  }
  return lista.map((l) => l.trim()).filter((l) => l && !/^\(.*\)$/.test(l)).map(lerPessoa);
}

// linha marcada [x] do campo 2 → tipos do catálogo
function tiposDaLinha(l) {
  const s = semAcento(l);
  const t = [];
  if (/materia|salas/.test(s) || /prova/.test(s)) t.push('conteudo');
  if (/predio/.test(s)) t.push('cenario', 'fachada');
  if (/personagem/.test(s)) t.push('personagem');
  if (/mecanica|jeito novo|desafio|ajuste|correcao|outro/.test(s)) t.push('mecanica');
  if (/enfeite|comida|premio|loja/.test(s)) t.push('arte');
  if (/musica/.test(s)) t.push('musica');
  if (/ferramenta|teste|documenta/.test(s)) t.push('ferramenta');
  if (/fala/.test(s)) t.push('falas');
  return t;
}

function rascunho(texto, op = {}) {
  const ped = pedidoDaParte(texto, op.parte);
  const linha1 = campo(ped, 1).map((l) => l.trim()).find((l) => l && !/^\(/.test(l) && !/^Para quando/i.test(l));
  if (!linha1) throw new Error('o pedido não tem nome (campo "# 1. Nome")');
  const nome = slug(linha1);
  const prefixo = op.prefixo ? slug(op.prefixo) : nome;
  const tipos = new Set();
  campo(ped, 2).filter((l) => /^\s*\[x\]/i.test(l)).forEach((l) => tiposDaLinha(l).forEach((t) => tipos.add(t)));
  const gente = pessoas(campo(ped, 8));
  const personagens = gente.map((g) => ({
    id: `${prefixo}-${primeiroNome(g.nome)}`, nome: g.nome, genero: g.genero, idade: g.idade, predio: null, x: null, y: null,
  }));
  const pids = personagens.map((p) => p.id);
  const tarefas = [];
  const nova = (id, tipo, titulo, extra = {}) => {
    const t = { id, tipo, titulo, quem: 'worker-low', depende: ['contrato'], arquivos: [], worktree: `${nome}-${id}`, pronto: [], estimativa: 15, ...extra };
    tarefas.push(t);
    return t;
  };
  nova('contrato', 'contrato', 'Reservas, ids, telas e APIs que as frentes usam', { quem: 'orquestrador', depende: [], worktree: nome, personagens: pids, estimativa: 10 });
  if (tipos.has('fachada')) nova('fachada', 'fachada', 'O prédio de fora e o lugar no mapa');
  if (tipos.has('cenario')) nova('cenario', 'cenario', 'Layout do interior e objetos, com as vagas livres');
  if (tipos.has('conteudo')) nova('conteudo', 'conteudo', 'Salas, livro ou prova');
  if (tipos.has('mecanica')) nova('mecanica', 'mecanica', 'Sistema ou tela nova');
  if (tipos.has('arte')) nova('arte', 'arte', 'Ícones, enfeites ou comidas', { depende: [] });
  if (tipos.has('musica')) nova('musica', 'musica', 'Faixa nova', { depende: [] });
  if (tipos.has('ferramenta')) nova('ferramenta', 'ferramenta', 'Ferramentas, testes ou docs', { depende: [] });
  personagens.forEach((p) => {
    const n = primeiroNome(p.nome);
    nova(`npc-${n}`, 'npc', `Visual e ação de ${p.nome}`, { worktree: `${nome}-npc-${n}`, personagens: [p.id] });
  });
  const falas = [];
  if (pids.length) falas.push(nova('falas-npc', 'falas', 'Falas dos personagens', { worktree: nome, personagens: pids }));
  if (tipos.has('falas')) falas.push(nova('falas', 'falas', 'Falas novas ou mudadas', { worktree: nome }));
  if (falas.length) {
    nova('vozes', 'vozes', 'Perfis, amostras, gravação e conferência por transcrição',
      { quem: 'orquestrador', worktree: nome, personagens: pids, depende: ['contrato', ...falas.map((f) => f.id)], estimativa: 20 });
  }
  const pronto = campo(ped, 13).map((l) => l.replace(/^\s*-\s*\[[ x]\]\s*/i, '').trim()).filter(Boolean);
  nova('integracao', 'integracao', 'Juntar as frentes, vozes e e2e',
    { quem: 'orquestrador', worktree: nome, depende: tarefas.map((t) => t.id), pronto, estimativa: 30 });
  nova('entrega', 'entrega', 'Merge, push e a Vercel no ar', { quem: 'orquestrador', worktree: nome, depende: ['integracao'], estimativa: 10 });
  return { nome, pedido: op.pedido || null, personagens, tarefas };
}

module.exports = { rascunho, lerPessoa, primeiroNome, campo, pedidoDaParte };
