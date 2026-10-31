// npm run novo: gera prédio, matéria, sala, sistema, prova, personagem e desafio numa cópia do jogo e confere manifesto,
// index e validadores. Ids `zzteste…` (ninguém usaria): o teste não colide com o que já foi criado no jogo de verdade.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// os processos filhos (validadores, testes da cópia) rodam com as reservas FECHADAS, como na integração (fluxo/comum.js):
// numa frente, o npm test vem com REINO_RESERVAS_ABERTAS=1 e o teste da reserva sem registro esperaria erro
delete process.env.REINO_RESERVAS_ABERTAS;
const repo = path.join(__dirname, '../../../..');
// em os.tmpdir() (TMPDIR=/dev/shm/… quando o /tmp enche, jogo/ferramentas/CLAUDE.md)
const copia = path.join(require('os').tmpdir(), `reino-testes/novo-${process.pid}`);
const novo = path.join(repo, 'jogo/ferramentas/novo/novo.js');
const rodar = (arq, args = []) => spawnSync(process.execPath, [arq, ...args], { encoding: 'utf8' });
const naCopia = (rel, args) => rodar(path.join(copia, 'jogo', rel), args);
const erros = (r) => (r.stdout + r.stderr).split('\n').filter((l) => l.startsWith('✘'));

test.before(() => {
  fs.mkdirSync(copia, { recursive: true });
  fs.cpSync(path.join(repo, 'jogo'), path.join(copia, 'jogo'), { recursive: true, filter: (f) => !f.includes('/servidor/dados') && !f.includes('/ferramentas/gerado') && !f.includes('/js/voz/') });
  require('./ajudantes/terceiro-bimestre').copiarPara(path.join(copia, 'jogo'));
  fs.copyFileSync(path.join(repo, 'package.json'), path.join(copia, 'package.json'));
});

// área livre no mapa da cópia: a primeira que o próprio validador sugere (lugares-do-mapa.js livres: chão sem rua,
// água, prédio nem clareira, com caminho até a rua), então um prédio real novo nunca quebra este teste
function areaLivre() {
  semCache();
  const L = require(path.join(copia, 'jogo/ferramentas/validar/lugares-do-mapa.js'));
  const a = L.livres(L.reinoDosDados(), 4, 3)[0];
  assert.ok(a, 'nenhuma área livre de 4x3 no mapa');
  return { rect: [a.rect.x, a.rect.y, a.rect.w, a.rect.h].join(','), caminho: a.caminho.map((c) => c.join(',')).join(';') };
}

test('prédio com rect e caminho: index confere e o interior só pede o que falta preencher', () => {
  const a = areaLivre();
  const r = rodar(novo, ['predio', 'zztestepredio', '--nome', 'Prédio de Teste', '--rect', a.rect, '--caminho', a.caminho, '--emoji', '🌼', '--raiz', copia]);
  assert.strictEqual(r.status, 0, r.stderr);
  ['falas', 'objetos', 'zztestepredio', 'fora', 'lugar'].forEach((f) => assert.ok(fs.existsSync(path.join(copia, `jogo/js/interiores/zztestepredio/${f}.js`))));
  assert.strictEqual(naCopia('ferramentas/gerar-index.js', ['--conferir']).status, 0);
  const v = naCopia('ferramentas/validar/validar-interiores.js', ['--detalhes']);
  const e = erros(v);
  assert.ok(e.length > 0);
  assert.deepStrictEqual(e.filter((l) => !l.startsWith('✘ falta preencher: ')), [], v.stdout);
  assert.ok(v.stdout.includes('✔ zztestepredio'));
});

test('matéria: o validador de conteúdo acusa só os (preencher)', () => {
  // A cidade pode ocupar todas as clareiras; esta fixture de conteúdo usa um terreno livre explícito.
  const a = areaLivre();
  const r = rodar(novo, ['materia', 'zztestemat', '--nome', 'Matéria de Teste', '--emoji', '🌍', '--prefixo', 'zzt', '--rect', a.rect, '--raiz', copia]);
  assert.strictEqual(r.status, 0, r.stderr);
  const v = naCopia('ferramentas/validar/validar-conteudo.js');
  const e = erros(v);
  assert.ok(e.length > 0);
  assert.deepStrictEqual(e.filter((l) => !l.startsWith('✘ falta preencher: ')), [], v.stdout);
  assert.strictEqual(naCopia('ferramentas/gerar-index.js', ['--conferir']).status, 0);
});

test('id repetido ou inválido falha; --seco não escreve', () => {
  assert.notStrictEqual(rodar(novo, ['predio', 'zztestepredio', '--nome', 'X', '--raiz', copia]).status, 0);
  assert.notStrictEqual(rodar(novo, ['materia', 'historia', '--nome', 'X', '--emoji', '⭐', '--raiz', copia]).status, 0);
  assert.notStrictEqual(rodar(novo, ['sala', 'zztestemat', 'zzt1', '--raiz', copia]).status, 0);
  assert.notStrictEqual(rodar(novo, ['predio', 'Pão', '--nome', 'X', '--raiz', copia]).status, 0);
  const antes = fs.readFileSync(path.join(copia, 'jogo/js/manifesto.js'), 'utf8');
  assert.strictEqual(rodar(novo, ['sala', 'zztestemat', 'zzt6', '--seco', '--raiz', copia]).status, 0);
  assert.strictEqual(fs.readFileSync(path.join(copia, 'jogo/js/manifesto.js'), 'utf8'), antes);
  assert.ok(!fs.existsSync(path.join(copia, 'jogo/js/conteudo/materias/zztestemat/zzt6.js')));
});

test('sistema com campo e camada: index confere, só os (preencher) acusados, teste dele e o contrato do save passam', () => {
  const r = rodar(novo, ['sistema', 'zztestejardim', '--nome', 'Jardim', '--campo', 'zztesteJardim', '--estrategia', 'carimbo', '--camada', '--desenho', '--raiz', copia]);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(naCopia('ferramentas/gerar-index.js', ['--conferir']).status, 0);
  const v = naCopia('ferramentas/validar/validar-conteudo.js');
  assert.deepStrictEqual(erros(v).filter((l) => !l.startsWith('✘ falta preencher: ')), [], v.stdout + v.stderr);
  assert.ok(erros(v).some((l) => l.includes('falas do módulo zztestejardim')));
  const t = (arq) => spawnSync(process.execPath, ['--test', path.join(copia, 'jogo/ferramentas/testes/unidade', arq)], { encoding: 'utf8' });
  const tj = t('zztestejardim.test.js');
  assert.strictEqual(tj.status, 0, tj.stdout);
  // o contrato do save roda para todo campo registrado: o campo entra sem ninguém listar
  const sc = t('save-campos.test.js');
  assert.strictEqual(sc.status, 0, sc.stdout);
  semCache();
  const Jogo = require(path.join(copia, 'jogo/ferramentas/jogo-no-node.js'));
  const ctx = Jogo.carregar(Jogo.contexto({ console, Math, Date }), Jogo.scripts());
  assert.ok(ctx.Reino.Progresso.camposRegistrados().includes('zztesteJardim'));
  assert.notStrictEqual(rodar(novo, ['sistema', 'zztestejardim', '--raiz', copia]).status, 0);
  assert.notStrictEqual(rodar(novo, ['sistema', 'zztesteflor', '--campo', 'zztesteJardim', '--estrategia', 'maior', '--raiz', copia]).status, 0);
});

// o jogo inteiro da cópia no vm (todos os `node: true`), para conferir elenco e vozes
// (o cache do require guardaria o manifesto de antes: limpa o que é da cópia)
function semCache() { Object.keys(require.cache).filter((k) => k.startsWith(copia)).forEach((k) => delete require.cache[k]); }
function reinoDaCopia() {
  semCache();
  const Jogo = require(path.join(copia, 'jogo/ferramentas/jogo-no-node.js'));
  return Jogo.carregar(Jogo.contexto({ console, Math, Date }), Jogo.ordemDosPredios(Jogo.scripts())).Reino;
}

test('prova com professora: index confere, o validador acusa só os (preencher) e a professora entra no elenco', () => {
  const r = rodar(novo, ['prova', 'zztestemat', '9', '--professora', 'zztesterosa', '--nome-professora', 'Professora Teste', '--raiz', copia]);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(naCopia('ferramentas/gerar-index.js', ['--conferir']).status, 0);
  const v = naCopia('ferramentas/validar/validar-conteudo.js');
  assert.ok(erros(v).some((l) => l.includes('zztestemat-9bim')));
  assert.deepStrictEqual(erros(v).filter((l) => !l.startsWith('✘ falta preencher: ')), [], v.stdout + v.stderr);
  const R = reinoDaCopia();
  assert.strictEqual(R.NPCs.ELENCO.zztesterosa.paraProva, 'zztestemat-9bim');
  assert.strictEqual(R.NPCs.ELENCO.zztesterosa.voz, 'npc-zztesterosa');
  assert.ok(R.config.vozes['npc-zztesterosa'].voz);
  assert.strictEqual(require(path.join(repo, 'jogo/ferramentas/novo/vozes.js')).genero(R.config.vozes['npc-zztesterosa']), 'feminina');
  // voz que nenhuma outra professora usa
  const ch = (p) => [p.voz, p.velocidade, p.tom].join('|'), E = R.NPCs.ELENCO;
  Object.keys(E).filter((k) => E[k].paraProva && k !== 'zztesterosa')
    .forEach((k) => assert.notStrictEqual(ch(R.config.vozes[E[k].voz]), ch(R.config.vozes['npc-zztesterosa']), k));
  assert.notStrictEqual(rodar(novo, ['prova', 'zztestemat', '9', '--raiz', copia]).status, 0);
});

test('personagem: personagens.js depois do falas.js, voz que o prédio não usa, acrescenta sem quebrar', () => {
  // a Pet Shop é prédio antigo (sem vagas): sem --x/--y o validar-interiores acusa
  assert.strictEqual(rodar(novo, ['personagem', 'zztestetrigo', '--predio', 'petshop', '--nome', 'Seu Trigo', '--x', '11', '--y', '7', '--raiz', copia]).status, 0);
  assert.strictEqual(rodar(novo, ['personagem', 'zztestejoana', '--predio', 'petshop', '--x', '4', '--y', '9', '--raiz', copia]).status, 0);
  assert.notStrictEqual(rodar(novo, ['personagem', 'aveia', '--predio', 'petshop', '--raiz', copia]).status, 0);
  assert.strictEqual(naCopia('ferramentas/gerar-index.js', ['--conferir']).status, 0);
  semCache();
  const man = require(path.join(copia, 'jogo/js/manifesto.js')).scripts.map((s) => s.js);
  const i = man.indexOf('js/interiores/petshop/personagens.js');
  assert.strictEqual(man[i - 1], 'js/interiores/petshop/falas.js');
  const R = reinoDaCopia();
  const V = R.config.vozes, chave = (p) => [p.voz, p.velocidade, p.tom].join('|');
  assert.strictEqual(R.NPCs.ELENCO.zztestetrigo.nome, 'Seu Trigo');
  assert.notStrictEqual(chave(V['npc-zztestetrigo']), chave(V['npc-zztestejoana']));
  assert.ok(R.FALAS_INTERIORES.petshop.npcs.zztestetrigo && R.FALAS_INTERIORES.petshop.npcs.aveia);
  // falas pela junção do prédio (jogo/js/interiores/CLAUDE.md), nunca atribuídas direto
  const pers = fs.readFileSync(path.join(copia, 'jogo/js/interiores/petshop/personagens.js'), 'utf8');
  assert.match(pers, /Reino\.falasDoPredio\('petshop', \{ npcs: \{ 'zztestejoana'/);
  assert.doesNotMatch(pers, /FALAS_INTERIORES\[/);
  const v = naCopia('ferramentas/validar/validar-interiores.js');
  assert.ok(erros(v).some((l) => l.includes('npcs.zztestetrigo')));
  // (a matéria dos testes de cima ainda tem o rect marcador: aqui só conta o que é da Pet Shop)
  assert.deepStrictEqual(erros(v).filter((l) => /petshop|zztestetrigo|zztestejoana/.test(l) && !l.startsWith('✘ falta preencher: ')), [], v.stdout);
});

test('desafio: tipo novo no manifesto, o teste gerado passa e uma sala de mentira com ele passa no validador', () => {
  const r = rodar(novo, ['desafio', 'zztesteConta', '--treinavel', '--raiz', copia]);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(naCopia('ferramentas/gerar-index.js', ['--conferir']).status, 0);
  const t = spawnSync(process.execPath, ['--test', path.join(copia, 'jogo/ferramentas/testes/unidade/desafio-zztesteConta.test.js')], { encoding: 'utf8' });
  assert.strictEqual(t.status, 0, t.stdout);
  // o teste que percorre TODOS os tipos (e reprova tipo sem exemplos) passa com o tipo novo
  const tp = spawnSync(process.execPath, ['--test', path.join(copia, 'jogo/ferramentas/testes/unidade/desafios-pontuacao.test.js')], { encoding: 'utf8' });
  assert.strictEqual(tp.status, 0, tp.stdout);
  // sala de mentira: h1 de História com o 1º desafio trocado pelo tipo novo (validar-conteudo --materia)
  const h1 = fs.readFileSync(path.join(copia, 'jogo/js/conteudo/materias/historia/h1.js'), 'utf8');
  const i = h1.indexOf("{ id: 'h1-01'"), f = h1.indexOf("{ id: 'h1-02'");
  assert.ok(i > 0 && f > i, 'âncoras sumiram de h1.js');
  const novoD = "{ id: 'h1-01', tipo: 'zztesteConta', livro: 'vestigios', pergunta: 'Quanto é 2 + 3?',\n          opcoes: [{ t: '5' }, { t: '6' }], certa: 0, explica: 'Dois mais três dá cinco.' },\n        ";
  const sala = path.join(copia, 'mentira/historia/h1.js');
  fs.mkdirSync(path.dirname(sala), { recursive: true });
  fs.writeFileSync(sala, h1.slice(0, i) + novoD + h1.slice(f));
  const v = naCopia('ferramentas/validar/validar-conteudo.js', ['--materia', sala]);
  assert.deepStrictEqual(erros(v).filter((l) => l.includes('h1-01')), [], v.stdout);
  assert.ok(!v.stdout.includes('tipo desconhecido'), v.stdout);
  assert.notStrictEqual(rodar(novo, ['desafio', 'zztesteConta', '--raiz', copia]).status, 0);
  assert.notStrictEqual(rodar(novo, ['desafio', 'Conta', '--raiz', copia]).status, 0);
});

test('personagem no prédio do esqueleto: entra no interior sem editar o layout (vaga livre ou x/y dados)', () => {
  const antes = reinoDaCopia().interiores.find((x) => x.id === 'zztestepredio');
  assert.ok(antes.npcs.some((n) => n.id === 'zztestepredio-guia'), 'sem personagem: o guia de marcador');
  assert.strictEqual(rodar(novo, ['personagem', 'zztesteana', '--predio', 'zztestepredio', '--nome', 'Dona Ana', '--raiz', copia]).status, 0);
  const rb = rodar(novo, ['personagem', 'zztestebia', '--predio', 'zztestepredio', '--x', '10', '--y', '8', '--voz', 'masculina', '--acao', 'beber', '--raiz', copia]);
  assert.strictEqual(rb.status, 0, rb.stderr);
  // o acao no estilo do projeto, sem aspas duplas (beber: ação registrada pela Pet Shop)
  assert.ok(fs.readFileSync(path.join(copia, 'jogo/js/interiores/zztestepredio/personagens.js'), 'utf8').includes("acao: { tipo: 'beber' }"));
  assert.notStrictEqual(rodar(novo, ['personagem', 'zztestecid', '--predio', 'zztestepredio', '--x', '3', '--raiz', copia]).status, 0);
  const R = reinoDaCopia();
  const d = R.interiores.find((x) => x.id === 'zztestepredio');
  const ana = d.npcs.find((n) => n.id === 'zztesteana'), bia = d.npcs.find((n) => n.id === 'zztestebia');
  assert.ok(ana && bia);
  assert.strictEqual(ana.voz, 'npc-zztesteana');
  // o 1º toma o lugar e a ação do guia de marcador, que some
  assert.ok(!d.npcs.some((n) => n.id === 'zztestepredio-guia'));
  assert.strictEqual(`${ana.x},${ana.y}`, '8,9');
  // voz pelo gênero: "Dona" → feminina; --voz masculina
  const Vz = require(path.join(repo, 'jogo/ferramentas/novo/vozes.js'));
  assert.strictEqual(Vz.genero(R.config.vozes['npc-zztesteana']), 'feminina');
  assert.strictEqual(Vz.genero(R.config.vozes['npc-zztestebia']), 'masculina');
  assert.strictEqual(ana.nome, 'Dona Ana');
  assert.strictEqual(`${bia.x},${bia.y}`, '10,8');
  assert.strictEqual(JSON.stringify(ana.acao), JSON.stringify({ tipo: 'guia', lugar: 'zztestepredio' }));
  const v = naCopia('ferramentas/validar/validar-interiores.js');
  assert.deepStrictEqual(erros(v).filter((l) => /zztestepredio|zztesteana|zztestebia/.test(l) && !l.startsWith('✘ falta preencher: ')), [], v.stdout);
});

test('arquivo: um .js a mais na pasta do prédio, antes do <p>.js, com node como os irmãos', () => {
  const r = rodar(novo, ['arquivo', 'interiores/zztestepredio/icones.js', '--raiz', copia]);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(fs.existsSync(path.join(copia, 'jogo/js/interiores/zztestepredio/icones.js')));
  assert.strictEqual(naCopia('ferramentas/gerar-index.js', ['--conferir']).status, 0);
  semCache();
  const man = require(path.join(copia, 'jogo/js/manifesto.js')).scripts;
  const i = man.findIndex((x) => x.js === 'js/interiores/zztestepredio/icones.js');
  assert.strictEqual(man[i + 1].js, 'js/interiores/zztestepredio/zztestepredio.js');
  assert.ok(man[i].node && man[i].grupo === 'interiores');
  const d = rodar(novo, ['arquivo', 'interiores/zztestepredio/extra.js', '--depois-de', 'fora.js', '--raiz', copia]);
  assert.strictEqual(d.status, 0, d.stderr);
  semCache();
  const man2 = require(path.join(copia, 'jogo/js/manifesto.js')).scripts.map((x) => x.js);
  assert.strictEqual(man2[man2.indexOf('js/interiores/zztestepredio/fora.js') + 1], 'js/interiores/zztestepredio/extra.js');
  assert.notStrictEqual(rodar(novo, ['arquivo', 'zzpastanova/x.js', '--raiz', copia]).status, 0);
  assert.notStrictEqual(rodar(novo, ['arquivo', 'interiores/zztestepredio/icones.js', '--raiz', copia]).status, 0);
});

test('sala: 12 desafios dos 3 tipos básicos e o aviso do valor por sala', () => {
  const r = rodar(novo, ['sala', 'zztestemat', 'zzt6', '--raiz', copia]);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /valor: 8 moedas por sala \+ 2 de bônus ao completar \(50 moedas em 6 salas; antes, com 5, 10 moedas por sala\)/);
  const R = reinoDaCopia();
  const sala = R.materias.find((m) => m.id === 'zztestemat').salas.find((x) => x.id === 'zzt6');
  assert.strictEqual(sala.desafios.length, 12);
  assert.deepStrictEqual([...new Set(sala.desafios.map((x) => x.tipo))].sort(), ['escolha', 'varias', 'vf']);
  const v = naCopia('ferramentas/validar/validar-conteudo.js');
  // só "falta preencher", e a carta 'zzt6' do livro que a sala nova pede (o checklist manda criar)
  assert.deepStrictEqual(erros(v).filter((l) => !l.startsWith('✘ falta preencher: ') && !/cartão do livro "zzt6"|zzt6: precisa de 1 unicórnio/.test(l)), [], v.stdout);
});

test('personagem em prédio antigo sem x/y: o gerador escolhe um chão livre alcançável (museu, andar da Torre, padrão)', () => {
  const casos = [['zztestelu', 'museu'], ['zztestetom', 'torre-1'], ['zztestepa', 'padrao-zztestemat']];
  casos.forEach(([id, int]) => {
    const r = rodar(novo, ['personagem', id, '--predio', int, '--raiz', copia]);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /escolhi o chão livre/);
  });
  assert.notStrictEqual(rodar(novo, ['personagem', 'zztestenao', '--predio', 'naoexiste', '--raiz', copia]).status, 0);
  assert.strictEqual(naCopia('ferramentas/gerar-index.js', ['--conferir']).status, 0);
  const R = reinoDaCopia();
  casos.forEach(([id, int]) => assert.ok(R.interiores.find((d) => d.id === int).npcs.some((n) => n.id === id), `${id} em ${int}`));
  const v = naCopia('ferramentas/validar/validar-interiores.js');
  assert.deepStrictEqual(erros(v).filter((l) => /zztestelu|zztestetom|zztestepa|museu|torre/.test(l) && !l.startsWith('✘ falta preencher: ')), [], v.stdout);
});

test('personagem --tambem: a mesma pessoa em mais um interior, sem voz nova; recusa quando carregaria depois', () => {
  // zztestelu nasceu no Museu (teste de cima); o prédio de teste carrega depois dele
  const r = rodar(novo, ['personagem', 'zztestelu', '--predio', 'zztestepredio', '--tambem', '--raiz', copia]);
  assert.strictEqual(r.status, 0, r.stderr);
  // zztesteana nasceu no prédio de teste, que carrega depois do Museu: recusa com a explicação
  const ruim = rodar(novo, ['personagem', 'zztesteana', '--predio', 'museu', '--tambem', '--raiz', copia]);
  assert.notStrictEqual(ruim.status, 0);
  assert.match(ruim.stderr, /carrega depois/);
  assert.notStrictEqual(rodar(novo, ['personagem', 'zztestenovo', '--predio', 'museu', '--tambem', '--raiz', copia]).status, 0);
  const R = reinoDaCopia();
  const vozes = Object.keys(R.config.vozes).filter((k) => k.startsWith('npc-zztestelu'));
  assert.deepStrictEqual(vozes, ['npc-zztestelu']);
  const lu = R.interiores.find((d) => d.id === 'zztestepredio').npcs.find((n) => n.id === 'zztestelu');
  assert.ok(lu && lu.voz === 'npc-zztestelu');
  assert.ok(R.FALAS_INTERIORES.zztestepredio.npcs.zztestelu);
  assert.ok(R.interiores.find((d) => d.id === 'museu').npcs.some((n) => n.id === 'zztestelu'));
});

test('sala: a carta do livro entra no fim do livro.js da matéria; livres ignora rect fora do mapa', () => {
  const livro = path.join(copia, 'jogo/js/conteudo/materias/zztestemat/livro.js');
  const antes = fs.readFileSync(livro, 'utf8');
  assert.strictEqual(rodar(novo, ['sala', 'zztestemat', 'zzt7', '--raiz', copia]).status, 0);
  const depois = fs.readFileSync(livro, 'utf8');
  assert.ok(depois.startsWith(antes.slice(0, antes.lastIndexOf(']);') - 3)));
  const R = reinoDaCopia();
  assert.ok(R.materias.find((m) => m.id === 'zztestemat').livro.some((c) => c.id === 'zzt7'));
  const L = require(path.join(repo, 'jogo/ferramentas/validar/lugares-do-mapa.js'));
  const ctx = { Reino: { materias: [{ id: 'zzfora', lugar: { rect: { x: -1, y: -1, w: 4, h: 3 } } }], lugaresRegistrados: [] } };
  assert.deepStrictEqual(L.ignorados(ctx), ['materia:zzfora']);
  assert.ok(Array.isArray(L.livres(ctx, 5, 5)));
});

test('reserva: contrato primeiro (vaga tracejada + falas à parte), o personagem preenche só o visual', () => {
  const r = rodar(novo, ['reserva', 'zztestenina', '--predio', 'loja', '--nome', 'Dona Nina', '--genero', 'f', '--idade', 'idoso', '--raiz', copia]);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(naCopia('ferramentas/gerar-index.js', ['--conferir']).status, 0);
  semCache();
  const man = require(path.join(copia, 'jogo/js/manifesto.js')).scripts.map((s) => s.js);
  const daLoja = man.filter((s) => s.startsWith('js/interiores/loja/'));
  assert.strictEqual(daLoja[0], 'js/interiores/loja/reservas.js', 'a reserva é a primeira do prédio');
  assert.strictEqual(man[man.indexOf('js/interiores/loja/personagens-falas.js') - 1], 'js/interiores/loja/falas.js');
  let R = reinoDaCopia();
  const vaga = R.interiores.find((d) => d.id === 'loja').npcs.find((n) => n.id === 'zztestenina');
  assert.ok(vaga, 'a vaga não apareceu na loja');
  assert.deepStrictEqual([vaga.nome, vaga.sprite.base, vaga.sprite.genero], ['Dona Nina', 'reserva', 'f']);
  assert.strictEqual(require(path.join(repo, 'jogo/ferramentas/novo/vozes.js')).genero(R.config.vozes['npc-zztestenina']), 'feminina');
  assert.ok(R.FALAS_INTERIORES.loja.npcs.zztestenina, 'as falas da reserva não chegaram ao prédio');
  const semReg = (v) => erros(v).filter((l) => /zztestenina: ainda sem registrarPersonagem/.test(l));
  assert.strictEqual(semReg(naCopia('ferramentas/validar/validar-interiores.js')).length, 1, 'reserva sem registro é erro');
  const aberta = spawnSync(process.execPath, [path.join(copia, 'jogo/ferramentas/validar/validar-interiores.js')], { encoding: 'utf8', env: { ...process.env, REINO_RESERVAS_ABERTAS: '1' } });
  assert.strictEqual(semReg(aberta).length, 0, 'nas frentes, só aviso');
  // o visual: nome, voz e lugar vêm da reserva
  assert.notStrictEqual(rodar(novo, ['personagem', 'zztestenina', '--predio', 'loja', '--nome', 'Outra', '--raiz', copia]).status, 0);
  assert.notStrictEqual(rodar(novo, ['personagem', 'zztestenina', '--predio', 'museu', '--raiz', copia]).status, 0);
  const p = rodar(novo, ['personagem', 'zztestenina', '--predio', 'loja', '--raiz', copia]);
  assert.strictEqual(p.status, 0, p.stderr);
  R = reinoDaCopia();
  const n = R.interiores.find((d) => d.id === 'loja').npcs.find((x) => x.id === 'zztestenina');
  assert.deepStrictEqual([n.nome, n.sprite.base, n.x, n.y], ['Dona Nina', 'pessoa', vaga.x, vaga.y]);
  assert.strictEqual(R.reservas.zztestenina.preenchida, true);
  const v = naCopia('ferramentas/validar/validar-interiores.js');
  assert.deepStrictEqual(erros(v).filter((l) => /zztestenina|loja/.test(l) && !l.startsWith('✘ falta preencher: ')), [], v.stdout);
});

test('sala no 4º bimestre: sala de livro na ordem do livro, carta e unicórnios do capítulo; matéria arquivada recusada', () => {
  // a fixture da cópia é o 3º bimestre inteiro (sem o arquivada: true do jogo): marca a História como no jogo
  const hist = path.join(copia, 'jogo/js/conteudo/materias/historia/historia.js'), histTxt = fs.readFileSync(hist, 'utf8');
  fs.writeFileSync(hist, histTxt.replace('Reino.registrarMateria({', 'Reino.registrarMateria({ arquivada: true,'));
  const arq = rodar(novo, ['sala', 'historia', 'h6', '--raiz', copia]);
  fs.writeFileSync(hist, histTxt);
  assert.notStrictEqual(arq.status, 0);
  assert.match(arq.stderr, /arquivada.*docs\/receitas\/sala-4bim\.md/);
  // a Casa das Palavras não tem pedestal sobrando: escreve, confere e devolve a cópia como estava
  const pasta = path.join(copia, 'jogo/js/conteudo/materias/portugues4');
  const guardar = ['js/manifesto.js', 'index.html', 'js/conteudo/materias/portugues4/livro-12a.js', 'js/conteudo/materias/portugues4/unicornios-12.js']
    .map((rel) => [path.join(copia, 'jogo', rel), fs.readFileSync(path.join(copia, 'jogo', rel), 'utf8')]);
  try {
    const r = rodar(novo, ['sala', 'portugues4', 'lp12a7', '--raiz', copia]);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /antes de js\/conteudo\/materias\/portugues4\/lp12t1\.js/);
    semCache();
    const Jogo = require(path.join(copia, 'jogo/ferramentas/jogo-no-node.js'));
    const R = Jogo.carregar(Jogo.contexto({ console }), Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros'], grupos: ['materias'] })).Reino;
    const m = R.materias.find((x) => x.id === 'portugues4');
    const ids = m.salas.map((x) => x.id);
    assert.strictEqual(ids[ids.indexOf('lp12a7') - 1], 'lp12a6');
    const sala = m.salas.find((x) => x.id === 'lp12a7');
    assert.strictEqual(JSON.stringify([sala.ordem, sala.livroOrigem, sala.capitulo, sala.cartas]), JSON.stringify(['livro', 'aprendizagem', 12, ['lp12a7-c1']]));
    assert.ok(sala.desafios.every((d) => d.livro === 'lp12a7-c1' && /preencher/.test(d.origem)));
    assert.ok(m.livro.some((c) => c.id === 'lp12a7-c1' && c.capitulo === 12));
    assert.strictEqual(m.unicornios.filter((u) => u.sala === 'lp12a7').map((u) => u.raridade + ' ' + u.id).join(), 'comum lp-(preencher)-comum,raro lp-(preencher)-raro');
    assert.strictEqual(naCopia('ferramentas/gerar-index.js', ['--conferir']).status, 0);
    // capítulo novo: livro-13a.js e unicornios-13.js novos, depois dos do capítulo 12 (só --seco)
    const s = rodar(novo, ['sala', 'portugues4', 'lp13a1', '--seco', '--raiz', copia]);
    assert.strictEqual(s.status, 0, s.stderr);
    assert.match(s.stdout, /depois de js\/conteudo\/materias\/portugues4\/livro-12t\.js[\s\S]*livro-13a\.js/);
    assert.notStrictEqual(rodar(novo, ['sala', 'portugues4', 'zz1', '--seco', '--raiz', copia]).status, 0, 'sem capítulo no id nem --capitulo');
    // livro de Atividades: letra t (as duas chaves começam com "a"), inclusive em capítulo novo
    const t3 = rodar(novo, ['sala', 'portugues4', 'lp12t3', '--seco', '--raiz', copia]);
    assert.strictEqual(t3.status, 0, t3.stderr);
    assert.match(t3.stdout, /livro-12t\.js \(entrada nova/);
    assert.match(t3.stdout, /depois de js\/conteudo\/materias\/portugues4\/lp12t2\.js/);
    const t13 = rodar(novo, ['sala', 'portugues4', 'lp13t1', '--seco', '--raiz', copia]);
    assert.match(t13.stdout, /portugues4\/livro-13t\.js\n/);
    const atv = rodar(novo, ['sala', 'portugues4', 'parodia2', '--capitulo', '11', '--livro', 'atividades', '--seco', '--raiz', copia]);
    assert.strictEqual(atv.status, 0, atv.stderr);
    assert.match(atv.stdout, /livro-11t\.js \(entrada nova/);
    // id fora do padrão: o lugar segue o capítulo pedido (depois das salas de Atividades do 11, antes do 12)
    assert.match(atv.stdout, /antes de js\/conteudo\/materias\/portugues4\/lp12a1\.js/);
    assert.match(atv.stdout, /premios-trilha-11\.js/);
  } finally {
    guardar.forEach(([f, t]) => fs.writeFileSync(f, t));
    fs.rmSync(path.join(pasta, 'lp12a7.js'), { force: true });
  }
});
