// Testes de unidade: pontuação dos desafios (D.pontuar e D.conferirValor, js/atividades/desafios.js e
// js/atividades/desafios/<tipo>.js) com respostas sintéticas, tipo por tipo, e em todos os desafios de
// todas as salas e provas (a resposta certa vale 1; nenhuma resposta estranha quebra ou sai de 0..1).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/desafios-pontuacao.test.js   (tudo: npm test, na raiz)
// Os arquivos dos desafios não são `node: true` no manifesto (o render usa DOM), mas no carregamento e na
// pontuação não tocam em document: entram aqui pelo manifesto (grupo atividades), sem lista copiada.
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('./ajudantes/terceiro-bimestre');

function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date, JSON });
  const base = Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos'], grupos: ['materias', 'provas'] });
  const desafios = Jogo.manifesto.scripts.filter((s) => s.grupo === 'atividades' && /^js\/atividades\/desafios(\.js|\/)/.test(s.js));
  assert.ok(desafios.length >= 11, 'desafios.js e os tipos não estão no manifesto');
  Jogo.carregar(ctx, base.concat(desafios));
  return ctx.Reino;
}
const R = carregar();
const D = R.Desafios;
// as matérias ativas do 4º bimestre (a fixture histórica carrega só as do 3º): mesmas conferências
const Ativo = require('../../jogo-no-node');
function carregarQuarto() {
  const ctx = Ativo.contexto({ console, Math, Date, JSON });
  Ativo.carregar(ctx, Ativo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos'], grupos: ['atividades', 'materias'] }));
  return ctx.Reino.materias.filter((m) => m.bimestre === 4);
}
const QUARTO = carregarQuarto();
const pontos = (d, valores) => valores.map((v) => D.pontuar(d, v));

/* ---------- cada tipo, com um desafio sintético ---------- */
test('escolha e vf: só a opção certa vale 1', () => {
  const e = { id: 'x', tipo: 'escolha', opcoes: ['a', 'b', 'c'], certa: 2 };
  assert.deepStrictEqual(pontos(e, [2, 1, 0, -1, '2', null, undefined]), [1, 0, 0, 0, 0, 0, 0]);
  const v = { id: 'y', tipo: 'vf', certo: true };
  assert.deepStrictEqual(pontos(v, [0, 1, 2]), [1, 0, 0]);
  const f = { id: 'z', tipo: 'vf', certo: false };
  assert.deepStrictEqual(pontos(f, [0, 1]), [0, 1]);
});

test('varias: fração das opções marcadas certo (marcar e deixar de marcar); livre vale com qualquer marca', () => {
  const d = { id: 'x', tipo: 'varias', opcoes: [{ t: 'a', ok: true }, { t: 'b' }, { t: 'c', ok: true }, { t: 'd' }] };
  assert.deepStrictEqual(pontos(d, [[0, 2], [2, 0], [0], [], [0, 1, 2, 3], [1, 3]]), [1, 1, 0.75, 0.5, 0.5, 0]);
  const livre = Object.assign({}, d, { livre: true });
  assert.deepStrictEqual(pontos(livre, [[], [1], [0, 3]]), [0, 1, 1]);
});

test('ligar e separar: fração dos pares/itens no lugar certo', () => {
  const l = { id: 'x', tipo: 'ligar', pares: [[{ t: 'a' }, { t: '1' }], [{ t: 'b' }, { t: '2' }], [{ t: 'c' }, { t: '3' }]] };
  assert.deepStrictEqual(pontos(l, [{ 0: 0, 1: 1, 2: 2 }, { 0: 0 }, { 0: 1, 1: 0, 2: 2 }, {}]), [1, 1 / 3, 1 / 3, 0]);
  const s = { id: 'y', tipo: 'separar', grupos: ['G1', 'G2'], itens: [{ t: 'a', g: 0 }, { t: 'b', g: 1 }, { t: 'c', g: 0 }] };
  assert.deepStrictEqual(pontos(s, [{ 0: 0, 1: 1, 2: 0 }, [0, 1, 0], { 0: 0 }, { 0: 1, 1: 0, 2: 1 }]), [1, 1, 1 / 3, 0]);
});

test('ordenar e frase: tudo ou nada, na ordem certa ou numa das aceitas', () => {
  const o = { id: 'x', tipo: 'ordenar', itens: ['a', 'b', 'c'], aceitas: [[1, 0, 2]] };
  assert.deepStrictEqual(pontos(o, [[0, 1, 2], [1, 0, 2], [2, 1, 0], [0, 1], []]), [1, 1, 0, 0, 0]);
  const f = { id: 'y', tipo: 'frase', blocos: ['Eu', 'gosto', 'de', 'ler'] };
  assert.deepStrictEqual(pontos(f, [[0, 1, 2, 3], [3, 2, 1, 0], [1, 0, 2, 3]]), [1, 0, 0]);
});

test('vfLista e completar: fração dos itens certos; completar aceita as alternativas e o livre só pede tudo preenchido', () => {
  const v = { id: 'x', tipo: 'vfLista', itens: [{ t: 'a', v: true }, { t: 'b', v: false }] };
  assert.deepStrictEqual(pontos(v, [[0, 1], [0, 0], [1, 0], [null, 1]]), [1, 0.5, 0, 0.5]);
  const c = { id: 'y', tipo: 'completar', opcoes: ['x', 'y', 'z'], frases: [{ t: 'a', certa: 1 }, { t: 'b', certa: 0, aceitas: [2] }] };
  assert.deepStrictEqual(pontos(c, [[1, 0], [1, 2], [1, null], [0, 1], []]), [1, 1, 0.5, 0, 0]);
  const livre = Object.assign({}, c, { livre: true });
  assert.deepStrictEqual(pontos(livre, [[0, 0], [0, null], []]), [1, 0, 1]);
});

test('copiar: metade pela escolha da escrita certa, metade pelas letras montadas', () => {
  const d = { id: 'x', tipo: 'copiar', itens: [{ opcoes: ['CASA', 'KAZA'], certa: 0 }] };
  assert.deepStrictEqual(Array.from(D.pecasCopiar(d.itens[0])), ['C', 'A', 'S', 'A', 'K', 'Z']);
  const certo = { escolha: 0, letras: [0, 1, 2, 3] };
  assert.deepStrictEqual(pontos(d, [[certo], [{ escolha: 1, letras: [0, 1, 2, 3] }], [{ escolha: 0, letras: [] }], [{ escolha: 0, letras: [0, 3, 2, 1] }], [], [null]]),
    [1, 0.5, 0.5, 1, 0, 0]);   // [0, 3, 2, 1] também soletra C-A-S-A (as duas peças A são iguais)
});

test('desenho: vale 1 com desenho e todos os requisitos; memoria não tem regra de pontuar (0)', () => {
  const d = { id: 'x', tipo: 'desenho', requisitos: ['linhas', 'formas', 'cores'] };
  const tudo = { linhas: true, formas: true, cores: [1, 2] };
  assert.deepStrictEqual(pontos(d, [{ px: '1', usou: tudo }, { px: '', usou: tudo }, { px: '1', usou: { linhas: true, formas: true, cores: [1] } }, { px: '1' }]), [1, 0, 0, 0]);
  assert.deepStrictEqual(Array.from(D.desenhoFaltam(d, { usou: { linhas: true } })), ['formas', 'cores']);
  // o jogo da memória termina sozinho (ctrl.conferir da missão), não passa por D.pontuar
  assert.deepStrictEqual(pontos({ id: 'm', tipo: 'memoria', pares: [] }, [true, false]), [0, 0]);
});

test('resposta vazia e tipo desconhecido valem 0; conferirValor é "pontuar deu 1"', () => {
  const e = { id: 'x', tipo: 'escolha', opcoes: ['a', 'b'], certa: 0 };
  assert.strictEqual(D.pontuar(e, null), 0);
  assert.strictEqual(D.pontuar(e, undefined), 0);
  assert.strictEqual(D.pontuar({ id: 'y', tipo: 'toString' }, 1), 0);   // nome de Object.prototype não vira tipo
  assert.strictEqual(D.pontuar({ id: 'z', tipo: 'inexistente' }, 1), 0);
  assert.strictEqual(D.conferirValor(e, 0), true);
  assert.strictEqual(D.conferirValor(e, 1), false);
  const v = { id: 'w', tipo: 'varias', opcoes: [{ ok: true }, {}] };
  assert.strictEqual(D.pontuar(v, [0, 1]), 0.5);
  assert.strictEqual(D.conferirValor(v, [0, 1]), false);   // meio certo não é certo
});

/* ---------- todo tipo registrado: os exemplos da def (def.exemplos, conteudo.md §3.7) ---------- */
// exemplos = { desafio, certa(d) (a resposta certa de QUALQUER desafio do tipo; sem pontuar, não tem), estranhos }
const TIPOS = Object.keys(R.tiposDesafio);
const exemplosDe = (tipo) => {
  const ex = R.tiposDesafio[tipo] && R.tiposDesafio[tipo].exemplos;
  assert.ok(ex && ex.desafio && Array.isArray(ex.estranhos), `falta exemplos em ${tipo} (def.exemplos = { desafio, certa, estranhos })`);
  assert.ok(typeof ex.certa === 'function' || !R.tiposDesafio[tipo].pontuar, `falta exemplos.certa em ${tipo} (tem pontuar)`);
  return ex;
};
test('todo tipo registrado tem exemplos, e a resposta certa do exemplo vale 1', () => {
  assert.ok(TIPOS.length >= 12, 'poucos tipos registrados: ' + TIPOS.length);
  TIPOS.forEach((tipo) => {
    const ex = exemplosDe(tipo);
    assert.strictEqual(ex.desafio.tipo, tipo, `exemplos.desafio de ${tipo} com outro tipo`);
    if (ex.certa) assert.strictEqual(D.pontuar(ex.desafio, ex.certa(ex.desafio)), 1, `${tipo}: a certa do exemplo não vale 1`);
  });
});

/* ---------- todo o conteúdo: salas e provas ---------- */
function todosOsDesafios() {
  const lista = [];
  R.materias.forEach((m) => m.salas.forEach((s) => s.desafios.forEach((d) => lista.push({ onde: m.id + '/' + s.id, d }))));
  R.provas.forEach((p) => p.questoes.forEach((d) => lista.push({ onde: p.id, d })));
  QUARTO.forEach((m) => m.salas.forEach((s) => s.desafios.forEach((d) => lista.push({ onde: m.id + '/' + s.id, d }))));
  // os exemplos entram também (um tipo novo é conferido antes de ter sala)
  TIPOS.forEach((tipo) => lista.push({ onde: 'exemplo', d: exemplosDe(tipo).desafio }));
  return lista;
}

test('todas as salas e provas: a resposta certa (exemplos.certa) vale 1 e confere; tipo sem pontuar fica de fora', () => {
  const lista = todosOsDesafios();
  assert.ok(lista.length > 200, 'poucos desafios carregados: ' + lista.length);
  const erros = [];
  lista.forEach(({ onde, d }) => {
    const ex = exemplosDe(d.tipo);
    if (!ex.certa) return;
    const v = ex.certa(d);
    if (D.pontuar(d, v) !== 1 || D.conferirValor(d, v) !== true) erros.push(`${onde}/${d.id} (${d.tipo}): pontuar = ${D.pontuar(d, v)}`);
  });
  assert.deepStrictEqual(erros, []);
});

// respostas erradas ou incompletas no FORMATO de cada tipo (exemplos.estranhos; a tela sempre entrega esse
// formato; um formato trocado, como {} num varias, lança erro hoje)
test('todas as salas e provas: respostas erradas ou vazias não quebram e a nota fica entre 0 e 1', () => {
  const erros = [];
  todosOsDesafios().forEach(({ onde, d }) => {
    [null, undefined].concat(exemplosDe(d.tipo).estranhos).forEach((v) => {
      let p;
      try { p = D.pontuar(d, v); } catch (e) { erros.push(`${onde}/${d.id} (${d.tipo}) com ${JSON.stringify(v)}: ${e.message}`); return; }
      if (!(p >= 0 && p <= 1)) erros.push(`${onde}/${d.id} (${d.tipo}) com ${JSON.stringify(v)}: nota ${p}`);
      if (D.conferirValor(d, v) !== (p === 1)) erros.push(`${onde}/${d.id}: conferirValor diferente de pontuar === 1`);
    });
    if (onde === 'exemplo') return;
    // texto do "✓ Certo: ..." (separar e memoria não têm: a própria tela mostra os grupos e os pares)
    const t = D.respostaCertaTexto(d);
    if (!['memoria', 'separar'].includes(d.tipo) && !(typeof t === 'string' && t.length)) erros.push(`${onde}/${d.id}: sem texto da resposta certa`);
  });
  assert.deepStrictEqual(erros, []);
});
