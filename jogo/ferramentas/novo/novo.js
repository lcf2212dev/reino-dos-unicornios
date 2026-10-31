// `npm run novo -- <tipo> <id> [opções]`: cria o esqueleto de um prédio, matéria ou sala com tudo no lugar
// (arquivos dos modelos em novo/modelos/, linhas no manifesto na ordem certa, index.html refeito) e diz o que falta.
// O que só a pessoa sabe escrever sai com o marcador `(preencher)`, que os validadores recusam.
// Uso: node jogo/ferramentas/novo/novo.js --ajuda | --lista
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const Manifesto = require('./manifesto-editar');

const MODELOS = path.join(__dirname, 'modelos');
const EMOJIS = 'emojis: os que já têm desenho em npm run ver -- --previa icones; emoji novo: Reino.registrarIcones na pasta da feature (jogo/js/CLAUDE.md, Arte)';
const UNI_NPC = 'unicórnios: o nome de cada um não pode repetir nome de NPC (o validar-interiores acusa)';
const ID_OK = /^[a-z0-9-]+$/;
const SEM_RECT = { rect: '{ x: -1, y: -1, w: 4, h: 3 }', comentario: '   // marcador de preencher; o validador recusa. Área livre: --rect x,y,w,h' };

/* ================= AJUDANTES ================= */
function modelo(nome, marcas) {
  return fs.readFileSync(path.join(MODELOS, nome), 'utf8').replace(/\{\{(\w+)\}\}/g, (m, k) => {
    if (!(k in marcas)) throw new Error(`modelo ${nome}: marcador {{${k}}} sem valor`);
    return String(marcas[k]);
  });
}
// data de hoje 'AAAA-MM-DD' (hora local): a `novidade` do lugar novo (selo "✨ Novo!", contrato conteudo.md)
function hoje() { const d = new Date(); return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, '0')).join('-'); }
const aspas = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
function numeros(s, n, nome) {
  const v = String(s).split(',').map((x) => Number(x.trim()));
  if (v.length !== n || v.some((x) => !Number.isInteger(x) || x < 0)) throw new Error(`${nome}: espere ${n} inteiros ≥ 0 separados por vírgula ("${s}")`);
  return v;
}
function rectTexto(op) {
  if (!op.rect) return SEM_RECT;
  const [x, y, w, h] = numeros(op.rect, 4, '--rect');
  return { rect: `{ x: ${x}, y: ${y}, w: ${w}, h: ${h} }`, comentario: '', w, h };
}
function caminhoTexto(op) {
  if (!op.caminho) return { texto: '[]', comentario: '   // marcador de preencher: sem caminho o lugar é recusado. --caminho "x,y;x,y;…"' };
  const pares = String(op.caminho).split(';').filter((p) => p.trim()).map((p) => numeros(p, 2, '--caminho'));
  return { texto: '[' + pares.map(([x, y]) => `[${x}, ${y}]`).join(', ') + ']', comentario: '' };
}

// o que já existe na cópia do jogo em `raiz`: lugares, matérias e salas (pelos dados, com o jogo-no-node dela)
function existentes(raiz) {
  const js = path.join(raiz, 'jogo/js');
  const ctxMapa = { Mapa: {} }; ctxMapa.window = ctxMapa;
  vm.runInNewContext(fs.readFileSync(path.join(js, 'mundo/lugares.js'), 'utf8'), ctxMapa);
  const lugares = new Set(ctxMapa.Mapa.LUGARES_FIXOS.map((l) => l.id));
  const pastas = new Set(fs.readdirSync(path.join(js, 'interiores'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name));
  pastas.forEach((p) => fs.readdirSync(path.join(js, 'interiores', p)).filter((f) => f.endsWith('.js')).forEach((f) => {
    for (const m of fs.readFileSync(path.join(js, 'interiores', p, f), 'utf8').matchAll(/registrarLugar\(\{\s*id:\s*'([^']+)'/g)) lugares.add(m[1]);
  }));
  const Jogo = require(path.join(raiz, 'jogo/ferramentas/jogo-no-node.js'));
  const ctx = Jogo.carregar(Jogo.contexto({ console }), Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros'], grupos: ['materias'] }));
  const materias = ctx.Reino.materias.map((m) => ({ id: m.id, nome: m.nome, salas: m.salas.map((s) => s.id),
    arquivada: !!m.arquivada, bimestre: m.bimestre, livros: m.livros, livro: (m.livro || []).map((c) => c.id),
    salasInfo: m.salas.map((s) => ({ id: s.id, capitulo: s.capitulo, livro: s.livroOrigem })), unis: (m.unicornios || []).map((u) => u.id) }));
  const pastasMat = fs.readdirSync(path.join(js, 'conteudo/materias'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  return { clareiras: ctxMapa.Mapa.CLAREIRAS, lugares, pastas, materias, pastasMat, salas: new Set(materias.flatMap((m) => m.salas)), valorPorMateria: ctx.Reino.config.valorPorMateria };
}

/* ================= TIPOS ================= */
// cada tipo: { ajuda, cria, conferir(id, op, ex), arquivos(id, op, ex), manifesto(id, op, ex), checklist(id, op), ver(id, op) }
// Tipo grande mora em arquivo próprio (tipo-<t>.js).
const TIPOS = {
  sistema: require('./tipo-sistema'),
  prova: require('./tipo-prova'),
  personagem: require('./tipo-personagem'),
  reserva: require('./tipo-reserva'),
  desafio: require('./tipo-desafio'),
  arquivo: require('./tipo-arquivo'),
  predio: {
    ajuda: 'predio <id> --nome "Padaria" [--rect x,y,w,h --caminho "x,y;x,y;…"] [--emoji 🥐]   (sem --rect: a 1ª área livre)',
    cria: 'jogo/js/interiores/<id>/{falas, objetos, <id>, fora, lugar}.js: interior de 1 cômodo que já passa no validador, desenho de fora e Reino.registrarLugar',
    conferir(id, op, ex, raiz) {
      if (!op.nome) throw new Error('predio: falta --nome "Nome do prédio"');
      if (ex.pastas.has(id)) throw new Error(`predio: já existe a pasta jogo/js/interiores/${id}/`);
      if (ex.lugares.has(id)) throw new Error(`predio: já existe um lugar "${id}" no mapa`);
      // sem --rect nem --caminho: a primeira área livre que o validador sugere (5x4; senão 4x3), com o caminho até a rua
      if (!op.rect && !op.caminho) {
        const L = require(path.join(raiz, 'jogo/ferramentas/validar/lugares-do-mapa.js'));
        const reino = L.reinoDosDados();
        const a = L.livres(reino, 5, 4)[0] || L.livres(reino, 4, 3)[0];
        if (a) {
          op.rect = [a.rect.x, a.rect.y, a.rect.w, a.rect.h].join(',');
          op.caminho = a.caminho.map((c) => c.join(',')).join(';');
          op.areaAutomatica = true;
        }
      }
    },
    arquivos(id, op) {
      const r = rectTexto(op), c = caminhoTexto(op);
      const m = { id, nome: aspas(op.nome), emoji: op.emoji || '📍', rect: r.rect, comentarioRect: r.comentario, caminho: c.texto, hoje: hoje(),
        largura: r.w ? r.w * 16 : 'w', altura: r.h ? r.h * 16 : 'h' };
      // o comentário do caminho vai depois da vírgula da linha
      const lugar = modelo('predio-lugar.js.modelo', m).replace(`caminho: ${c.texto},`, `caminho: ${c.texto},${c.comentario}`);
      const pasta = `jogo/js/interiores/${id}`;
      return [
        [`${pasta}/falas.js`, modelo('predio-falas.js.modelo', m)],
        [`${pasta}/objetos.js`, modelo('predio-objetos.js.modelo', m)],
        [`${pasta}/${id}.js`, modelo('predio-interior.js.modelo', m)],
        [`${pasta}/fora.js`, modelo('predio-fora.js.modelo', m)],
        [`${pasta}/lugar.js`, lugar],
      ];
    },
    // partes na ordem falas → objetos → <p> → (acoes) → fora → lugar, antes do padrao.js
    manifesto(id) {
      return { jss: ['falas', 'objetos', id, 'fora', 'lugar'].map((f) => `js/interiores/${id}/${f}.js`), onde: { antesDe: 'js/interiores/padrao.js', grupo: 'interiores' } };
    },
    checklist(id, op) {
      return [
        `falas dos objetos: troque cada (preencher) em jogo/js/interiores/${id}/falas.js (até 30 letras por página)`,
        `nomes dos objetos que se tocam: (preencher) em ${id}/${id}.js`,
        `a pessoa de dentro: npm run novo -- personagem <id> --predio ${id} --nome "…" (o 1º toma o lugar do guia de marcador, sem editar ${id}.js)`,
        `menu Lugares: a informação em ${id}/lugar.js (menu.info)`,
        ...(op.areaAutomatica ? [`lugar no mapa: escolhi a área livre ${op.rect} (caminho ${op.caminho}); outra: npm run ver -- --livres 5x4 e --rect/--caminho`] : []),
        ...(op.rect && op.caminho ? [] : [`lugar no mapa: rect e caminho em ${id}/lugar.js (--rect/--caminho; área livre na prévia jogo/ferramentas/previas/mapa.html)`]),
        `desenho de fora: ${id}/fora.js (hoje uma casinha simples) e objetos próprios em ${id}/objetos.js`,
        EMOJIS + (op.emoji && op.emoji !== '📍' ? ` (o do menu: ${op.emoji})` : ''),
        `vozes do pacote interior-${id}: npm run vozes`,
      ];
    },
    validadores: ['node jogo/ferramentas/validar/validar-interiores.js', 'node jogo/ferramentas/gerar-index.js --conferir', 'npm test'],
    ver(id) { return `npm run ver -- --ir ${id} --nome ${id}`; },
  },

  materia: {
    ajuda: 'materia <id> --nome "Geografia" --emoji 🌍 [--salas 5] [--prefixo g] [--rect x,y,w,h | --dentro <lugar> --interior <id>]',
    cria: 'jogo/js/conteudo/materias/<id>/{<prefixo>1..N, livro, <id>}.js no formato de historia/ (lugar.porCima: true); o prédio vem do interiores/padrao.js',
    conferir(id, op, ex, raiz) {
      if (!op.nome) throw new Error('materia: falta --nome "Nome da matéria"');
      if (!op.emoji) throw new Error('materia: falta --emoji (ex.: --emoji 🌍)');
      if (ex.materias.some((m) => m.id === id) || ex.pastasMat.includes(id)) throw new Error(`materia: "${id}" já existe`);
      const n = salasDe(op);
      op.valorPorMateria = ex.valorPorMateria;
      if (!/^[a-z0-9]+$/.test(prefixo(id, op))) throw new Error('materia: --prefixo só com [a-z0-9]');
      // dentro de um prédio que já existe: sem área no mapa; o andar (--interior) é feito à parte
      if (op.dentro && !ex.lugares.has(op.dentro)) throw new Error(`materia: --dentro "${op.dentro}" não é um lugar do mapa (${[...ex.lugares].join(', ')})`);
      if (op.dentro && !op.interior) throw new Error('materia: --dentro pede --interior <id do andar>');
      if (!op.rect && !op.dentro) { op.areaAuto = areaDaMateria(raiz, ex); op.rect = op.areaAuto.rect; }
      const repetidas = nomesSalas(id, op, n).filter((s) => ex.salas.has(s));
      if (repetidas.length) throw new Error(`materia: sala já existe em outra matéria: ${repetidas.join(', ')} (use --prefixo)`);
    },
    arquivos(id, op) {
      const n = salasDe(op), salas = nomesSalas(id, op, n), r = rectTexto(op);
      const pasta = `jogo/js/conteudo/materias/${id}`;
      const NOME = String(op.nome).toUpperCase();
      const cartas = salas.map((s) => `    { id: '${s}', e: '(preencher)', titulo: '(preencher)',\n      texto: '(preencher)' },`).join('\n');
      const CORES = [['#fffaf0', "'#6fa8ff', '#ff6b8a', '#ffffff'", '#ffcf5c'], ['#ffe4ef', "'#ffb3c9', '#a9e4ff', '#fff4d6'", '#fff0f5'],
        ['#e6f4ff', "'#e0433f', '#ffffff', '#2f6fd6'", '#ffd34d'], ['#f1e8ff', "'#8a5cff', '#ffcf5c', '#ff7eb6'", '#8ee3c8']];
      const uni = (sufixo, extra, i, asa) => {
        const c = CORES[i % CORES.length];
        return `    { id: '${id}-${sufixo}', nome: '(preencher)', ${extra},\n      cores: { corpo: '${c[0]}', crina: [${c[1]}], chifre: '${c[2]}'${asa ? ", asa: '#fff6d6'" : ''} },\n      frase: '(preencher)' },`;
      };
      const unis = salas.flatMap((s, i) => [uni(`${s}-comum`, `raridade: 'comum', sala: '${s}'`, 2 * i), uni(`${s}-raro`, `raridade: 'raro', sala: '${s}'`, 2 * i + 1)])
        .concat([uni('ouro', "raridade: 'epico', treino: 'ouro'", 0, true), uni('perfeito', "raridade: 'epico', treino: 'perfeito'", 1, true),
          uni('lendario', "raridade: 'lendario', materiaCompleta: true", 2, true)]).join('\n');
      const lista = salas.map((s) => s + '.js').join(', ');
      return salas.map((s, i) => [`${pasta}/${s}.js`, modelo('materia-sala.js.modelo', { NOME, n: i + 1, sala: s, materia: id })])
        .concat([[`${pasta}/livro.js`, modelo('materia-livro.js.modelo', { nome: aspas(op.nome), id, cartas })],
          [`${pasta}/${id}.js`, lugarDentro(modelo('materia.js.modelo', { NOME, id, nome: aspas(op.nome), emoji: op.emoji, rect: r.rect, comentarioRect: r.comentario, hoje: hoje(), arquivosSalas: lista, unicornios: unis }), op)]]);
    },
    // salas → livro.js → <m>.js, no grupo 'materias', depois das outras matérias
    manifesto(id, op, ex, raiz) {
      const jss = nomesSalas(id, op, salasDe(op)).concat(['livro', id]).map((f) => `js/conteudo/materias/${id}/${f}.js`);
      return { jss, onde: { depoisDe: Manifesto.ultimoDoGrupo(raiz, 'materias'), grupo: 'materias' } };
    },
    checklist(id, op) {
      return [
        `conteúdo: troque cada (preencher) nas salas, em livro.js e em ${id}.js (jogo/js/conteudo/materias/${id}/)`,
        valorSala(op.valorPorMateria, salasDe(op)),
        `unicórnios: nome, frase e cores de cada um em ${id}.js (1 comum e 1 raro por sala, 2 épicos, 1 lendário)`,
        ...(op.dentro ? [`lugar: dentro de ${op.dentro}; o andar ${op.interior} (lugar: 'materia:${id}', entrada: true) é um prédio por dentro à parte (receita novo-predio)`] : []),
        ...(op.areaAuto ? [`lugar no mapa: escolhi ${op.areaAuto.de} (rect ${op.rect}, porCima: true); troque com --rect ou em ${id}.js (npm run ver -- --livres 5x5)`] : []),
        EMOJIS + ` (o da matéria: ${op.emoji}, e os dos desafios)`,
        UNI_NPC,
        `prédio próprio (opcional; sem ele vale o interiores/padrao.js): npm run novo -- predio …`,
        'vozes das salas e do prédio: npm run vozes',
      ];
    },
    validadores: ['node jogo/ferramentas/validar/validar-conteudo.js', 'node jogo/ferramentas/validar/validar-interiores.js', 'npm test'],
    ver(id) { return `npm run ver -- --ir materia:${id} --nome ${id}`; },
  },

  sala: require('./tipo-sala'),
};
// aviso do valor por sala, que muda quando a matéria ganha sala: a mesma regra de progresso-regras.js
// (em moedas: cada sala um número inteiro, arredondado para baixo; a sobra é bônus ao completar a matéria)
function valorSala(total, n, antes) {
  const conta = (k) => { const sala = Math.floor(total / k); return { sala, bonus: total - sala * k }; };
  const agora = conta(n), velho = antes ? conta(antes) : null;
  const texto = (c) => c.sala + ' moedas por sala' + (c.bonus ? ' + ' + c.bonus + ' de bônus ao completar' : '');
  return `valor: ${texto(agora)} (${total} moedas em ${n} salas${velho ? `; antes, com ${antes}, ${texto(velho)}` : ''})`;
}
// --dentro: o `lugar` da matéria vira { nome, artigo, dentro, interior } (sem rect nem desenho no mapa)
function lugarDentro(txt, op) {
  if (!op.dentro) return txt;
  return txt.replace(/  lugar: \{[\s\S]*?\n  \},\n/, `  lugar: {
    nome: '(preencher) nome do lugar',
    artigo: 'o',
    dentro: '${op.dentro}',       // o prédio do mapa onde ela fica (nada novo no mapa; contrato conteudo.md)
    interior: '${op.interior}',   // o andar onde ela chega pelo menu Lugares (Reino.registrarInterior com lugar: 'materia:<id>')
    andar: '(preencher) 3º andar',   // o menu Lugares mostra "No 3º andar do <prédio>"; sem andar: "Dentro do <prédio>"
    novidade: '${hoje()}',   // selo "✨ Novo!" no menu Lugares até ela entrar (ou config.novidadeDias dias)
  },\n`);
}
// área de uma matéria nova sem --rect: a 1ª clareira que ninguém usa; senão o 1º rect livre de 5×5 do mapa
function areaDaMateria(raiz, ex) {
  const L = require(path.join(raiz, 'jogo/ferramentas/validar/lugares-do-mapa.js'));
  const ctx = L.reinoDosDados();
  const ocupados = L.todos(ctx).map((l) => l.rect).filter(Boolean);
  const cruza = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const txt = (c) => `${c.x},${c.y},${c.w},${c.h}`;
  const cl = ex.clareiras.find((c) => !ocupados.some((o) => cruza(o, c)));
  if (cl) return { rect: txt(cl), de: `a clareira livre ${txt(cl)}` };
  // o mapa encheu (Matemática já mora num 4×5): 5×5, senão 5×4, 4×5 ou 4×4
  const tam = [[5, 5], [5, 4], [4, 5], [4, 4]].find(([w, h]) => L.livres(ctx, w, h).length);
  if (!tam) throw new Error('materia: nenhuma clareira nem área 4×4 livre no mapa; passe --rect x,y,w,h ou --dentro');
  const l = L.livres(ctx, tam[0], tam[1])[0];
  return { rect: txt(l.rect), de: `a área livre ${txt(l.rect)} (npm run ver -- --livres ${tam[0]}x${tam[1]})` };
}
// põe `bloco` na linha antes do último "]);" do arquivo (o fim da lista de Reino.registrarLivro)
function inserirNoFim(txt, bloco, rel) {
  const i = txt.lastIndexOf(']);');
  if (i < 0) throw new Error(`${rel}: não achei o "]);" do fim da lista`);
  const ini = txt.lastIndexOf('\n', i) + 1;
  return txt.slice(0, ini) + bloco + txt.slice(ini);
}
function salasDe(op) {
  const n = op.salas === undefined ? 5 : Number(op.salas);
  if (!Number.isInteger(n) || n < 1 || n > 9) throw new Error('--salas: de 1 a 9');
  return n;
}
const prefixo = (id, op) => op.prefixo || id[0];
const nomesSalas = (id, op, n) => Array.from({ length: n }, (_, i) => prefixo(id, op) + (i + 1));

/* ================= LINHA DE COMANDO ================= */
function lerArgs(argv) {
  const op = { pos: [] };
  const valor = { '--voz': 'voz', '--antes-de': 'antesDe', '--depois-de': 'depoisDe', '--x': 'x', '--y': 'y', '--acao': 'acao', '--predio': 'predio', '--professora': 'professora', '--nome-professora': 'nomeProfessora', '--campo': 'campo', '--estrategia': 'estrategia', '--nome': 'nome', '--rect': 'rect', '--caminho': 'caminho', '--emoji': 'emoji', '--salas': 'salas', '--prefixo': 'prefixo', '--raiz': 'raiz', '--dentro': 'dentro', '--interior': 'interior', '--genero': 'genero', '--idade': 'idade', '--capitulo': 'capitulo', '--livro': 'livro' };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (valor[k]) { if (argv[i + 1] === undefined) throw new Error(`${k} precisa de um valor`); op[valor[k]] = argv[++i]; }
    else if (k === '--seco') op.seco = true;
    else if (k === '--camada') op.camada = true;
    else if (k === '--treinavel') op.treinavel = true;
    else if (k === '--tambem') op.tambem = true;
    else if (k === '--especial') op.especial = true;
    else if (k === '--desenho') op.desenho = true;
    else if (k === '--lista') op.lista = true;
    else if (k === '--ajuda' || k === '-h' || k === '--help') op.ajuda = true;
    else if (k.startsWith('--')) throw new Error(`opção desconhecida: ${k} (veja --ajuda)`);
    else op.pos.push(k);
  }
  return op;
}
function ajuda() {
  return ['Uso: npm run novo -- <tipo> <id> [opções]   (node jogo/ferramentas/novo/novo.js)',
    ...Object.values(TIPOS).map((t) => '  ' + t.ajuda),
    'Opções gerais:',
    '  --seco            mostra o que faria, sem escrever nada',
    '  --raiz <pasta>    outra cópia do repositório (padrão: esta)',
    '  --lista           os tipos e o que cada um cria',
    'Exemplos:',
    '  npm run novo -- predio padaria --nome "Padaria" --rect 10,10,5,4 --caminho "14,14;13,14;12,14" --emoji 🥐',
    '  npm run novo -- materia geografia --nome "Geografia" --emoji 🌍 --salas 5 --prefixo g',
    '  npm run novo -- sala portugues4 lp12a7          # 4º bimestre: docs/receitas/sala-4bim.md',
    '  npm run novo -- prova historia 4 --professora rosa --nome-professora "Professora Rosa"',
    '  npm run novo -- personagem trigo --predio petshop --nome "Seu Trigo"',
    '  npm run novo -- reserva salao-lulu --predio salao --nome "Dona Lulu" --genero f --idade adulto --x 3 --y 5',
    '  npm run novo -- desafio contaArmada --treinavel',
    '  npm run novo -- arquivo interiores/petshop/icones.js'].join('\n');
}

function executar(argv, escrever = console.log) {
  const op = lerArgs(argv);
  if (op.ajuda || (!op.lista && !op.pos.length)) { escrever(ajuda()); return null; }
  if (op.lista) { Object.entries(TIPOS).forEach(([k, t]) => escrever(`${k}: ${t.cria}\n  ${t.ajuda}`)); return null; }
  const [tipo, ...resto] = op.pos;
  const T = TIPOS[tipo];
  if (!T) throw new Error(`tipo desconhecido: ${tipo} (tipos: ${Object.keys(TIPOS).join(', ')})`);
  let id = resto[0];
  if (tipo === 'prova') { op.materia = resto[0]; op.bimestre = resto[1]; if (!ID_OK.test(op.materia || '')) throw new Error('prova: use prova <materia> <bimestre>'); id = `${op.materia}-${op.bimestre}bim`; }
  if (tipo === 'sala') { op.materia = resto[0]; id = resto[1]; if (!ID_OK.test(op.materia || '')) throw new Error('sala: use sala <materia> <idSala>'); }
  if (T.idDe) id = T.idDe(resto, op);
  if (!id || !(T.idOk || ID_OK).test(id)) throw new Error(`id "${id || ''}" inválido (${T.idOk ? T.idOk : "só letras minúsculas sem acento, números e hífen: [a-z0-9-]"})`);
  const raiz = path.resolve(op.raiz || path.join(__dirname, '../../..'));
  if (!fs.existsSync(Manifesto.arquivo(raiz))) throw new Error(`--raiz: não achei jogo/js/manifesto.js em ${raiz}`);
  const ex = existentes(raiz);
  T.conferir(id, op, ex, raiz);
  const arquivos = T.arquivos(id, op, ex);
  // texto = arquivo novo; { acrescentar } = bloco no fim de um arquivo que já existe (ex.: personagens.js)
  // { inserirNoFim } = bloco antes do último "]);" (ex.: carta nova no livro.js, sem reescrever as outras)
  arquivos.forEach(([rel, t]) => { if (typeof t === 'string' && fs.existsSync(path.join(raiz, rel))) throw new Error(`já existe: ${rel}`); });
  // uma ou várias inserções (ex.: sistema node: true e a parte de desenho), aplicadas em sequência no texto
  const mans = [].concat(T.manifesto(id, op, ex, raiz));
  const ins = { texto: undefined, postas: [] };
  mans.forEach((m) => { const r = Manifesto.inserir(raiz, m.jss, m.onde, ins.texto); ins.texto = r.texto; m.postas = r.postas; });
  if (!op.seco) {
    arquivos.forEach(([rel, texto]) => { fs.mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true }); if (typeof texto === 'string') fs.writeFileSync(path.join(raiz, rel), texto);
      else if (texto.inserirNoFim) fs.writeFileSync(path.join(raiz, rel), inserirNoFim(fs.readFileSync(path.join(raiz, rel), 'utf8'), texto.inserirNoFim, rel));
      else fs.appendFileSync(path.join(raiz, rel), texto.acrescentar); });
    if (mans.length) { Manifesto.gravar(raiz, ins.texto); Manifesto.gerarIndex(raiz); }
  }
  const s = [];
  s.push(op.seco ? `--seco: nada foi escrito. Criaria (${tipo} ${id}):` : `✔ ${tipo} ${id} criado em ${raiz}`);
  s.push('Arquivos:', ...arquivos.map(([rel, t]) => '  ' + rel + (typeof t === 'string' ? '' : t.inserirNoFim ? ' (entrada nova no fim da lista)' : ' (acrescentado no fim)')));
  mans.forEach((m) => s.push(`Manifesto (jogo/js/manifesto.js, ${m.onde.antesDe ? 'antes de ' + m.onde.antesDe : 'depois de ' + m.onde.depoisDe}):`, ...m.postas.map((l) => '  ' + l)));
  if (!mans.length) s.push('Manifesto: nada muda (o arquivo já está lá)');
  else s.push(op.seco ? 'index.html: seria refeito (npm run index)' : 'index.html: refeito (npm run index)');
  s.push('Falta (o validador recusa todo "(preencher)"):', ...T.checklist(id, op).filter(Boolean).map((c) => '  [ ] ' + c));
  s.push('Rode:', ...T.validadores.map((v) => '  ' + v));
  s.push('Veja:', '  ' + T.ver(id, op) + (op.raiz ? ` --raiz ${path.join(raiz, 'jogo')}` : ''));
  escrever(s.join('\n'));
  return { arquivos: arquivos.map(([rel]) => rel), manifesto: mans.flatMap((m) => m.postas) };
}

module.exports = { TIPOS, executar, lerArgs };
// (os tipos em arquivo próprio, como tipo-sistema.js, usam estes ajudantes)
// valor em JS no estilo do projeto: { tipo: 'sorvete', n: 2 } (chave sem aspas, texto com aspas simples)
function literal(v) {
  if (Array.isArray(v)) return '[' + v.map(literal).join(', ') + ']';
  if (v && typeof v === 'object') return '{ ' + Object.keys(v).map((k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${aspas(k)}'`) + ': ' + literal(v[k])).join(', ') + ' }';
  return typeof v === 'string' ? `'${aspas(v)}'` : String(v);
}
Object.assign(module.exports, { modelo, aspas, literal, valorSala, EMOJIS, UNI_NPC });

if (require.main === module) {
  try { executar(process.argv.slice(2)); } catch (e) { console.error('✘ ' + e.message); process.exit(1); }
}
